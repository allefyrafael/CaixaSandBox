"""
Rotas de Ideias
Endpoints para CRUD e Autosave de ideias
"""
from fastapi import APIRouter, HTTPException, status
from schemas import IdeaCreate, IdeaUpdate, IdeaResponse, SuccessResponse
from services.db import (
    create_new_idea,
    autosave_idea,
    get_idea,
    list_user_ideas,
    delete_idea
)
from agents.filtrador.agent import analyze_content
from typing import List

router = APIRouter()

@router.post("/", response_model=IdeaResponse, status_code=status.HTTP_201_CREATED)
def create_idea(payload: IdeaCreate):
    """
    Cria uma nova ideia para o usuário
    
    - **user_id**: ID do usuário (obrigatório)
    - **title**: Título inicial da ideia (opcional, padrão: "Nova Ideia")
    """
    import time
    start_time = time.time()
    
    try:
        print(f"[API] POST /api/ideas/ - Criando ideia para usuário {payload.user_id}")
        
        # Validação de moderação no título usando Agente Filtrador (com timeout curto)
        # Se demorar muito, pula a validação para não bloquear a criação
        if payload.title:
            try:
                import concurrent.futures
                
                # Tenta validação com timeout de 3 segundos
                filter_start = time.time()
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(analyze_content, payload.title, "title")
                    try:
                        filter_result = future.result(timeout=3)  # Timeout de 3 segundos
                        filter_time = time.time() - filter_start
                        
                        if filter_time > 2:
                            print(f"[API] AVISO: Validação de moderação demorou {filter_time:.2f}s")
                        
                        if filter_result.get("is_inappropriate", False):
                            raise HTTPException(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"Por favor, mantenha a linguagem profissional e respeitosa. O título da ideia contém conteúdo inapropriado. {filter_result.get('reason', '')}"
                            )
                    except concurrent.futures.TimeoutError:
                        print(f"[API] AVISO: Timeout na validação de moderação (3s), continuando sem validação")
                        # Se der timeout, continua sem validação (não bloqueia criação)
            except HTTPException:
                raise
            except Exception as filter_error:
                print(f"[API] AVISO: Erro na validação de moderação: {filter_error}. Continuando sem validação.")
                # Se der erro, continua sem validação (não bloqueia criação)
        
        # Criar ideia
        create_start = time.time()
        idea_data = create_new_idea(payload.user_id, payload.title)
        create_time = time.time() - create_start
        
        elapsed_time = time.time() - start_time
        print(f"[API] POST /api/ideas/ - Ideia criada em {elapsed_time:.2f}s (criação: {create_time:.2f}s)")
        
        return idea_data
        
    except HTTPException:
        raise
    except Exception as e:
        elapsed_time = time.time() - start_time
        error_msg = str(e)
        error_type = type(e).__name__
        
        # Log detalhado do erro
        import traceback
        error_details = traceback.format_exc()
        print(f"[API] ERRO ao criar ideia (tempo: {elapsed_time:.2f}s): {error_msg}")
        print(f"[API] Tipo do erro: {error_type}")
        print(f"[API] Detalhes completos:\n{error_details}")
        
        # Detectar tipo de erro específico e fornecer mensagem amigável
        if "does not exist" in error_msg or "404" in error_msg or "Banco de dados Firestore não foi criado" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "error": "Banco de dados Firestore não foi criado",
                    "message": "Por favor, crie o banco de dados Firestore no console do Firebase",
                    "link": "https://console.cloud.google.com/firestore/databases?project=sandboxcaixa-84951",
                    "original_error": error_msg
                }
            )
        elif "Firebase não está configurado" in error_msg or "not configured" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "error": "Firebase não está configurado",
                    "message": "Configure o Firebase para usar este endpoint",
                    "original_error": error_msg
                }
            )
        elif "permission" in error_msg.lower() or "forbidden" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "Erro de permissão",
                    "message": "Você não tem permissão para realizar esta operação",
                    "original_error": error_msg
                }
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error": "Erro ao criar ideia",
                    "message": f"Ocorreu um erro inesperado: {error_msg}",
                    "original_error": error_msg,
                    "error_type": error_type
                }
            )

@router.patch("/{user_id}/{idea_id}", response_model=SuccessResponse)
def endpoint_autosave(user_id: str, idea_id: str, payload: IdeaUpdate):
    """
    **Autosave Endpoint** - Atualiza apenas os campos modificados
    
    Este endpoint implementa a estratégia de "Lazy Save":
    - Recebe apenas os campos que foram alterados
    - Usa merge=True no Firestore para update parcial
    - Otimizado para chamadas frequentes (debounce no frontend)
    
    **Parâmetros:**
    - **user_id**: ID do usuário
    - **idea_id**: ID da ideia
    - **payload**: Campos a atualizar (todos opcionais)
    
    **Exemplo de uso:**
    ```json
    {
        "title": "Novo título",
        "description": "Descrição atualizada"
    }
    ```
    """
    # Validação de moderação nos campos atualizados usando Agente Filtrador
    update_data = payload.dict(exclude_unset=True)
    
    # Verifica título se estiver sendo atualizado
    if "title" in update_data and update_data["title"]:
        filter_result = analyze_content(update_data["title"], field_name="title")
        if filter_result["is_inappropriate"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Por favor, mantenha a linguagem profissional e respeitosa. O título da ideia contém conteúdo inapropriado. {filter_result.get('reason', '')}"
            )
    
    # Verifica descrição se estiver sendo atualizada
    if "description" in update_data and update_data["description"]:
        filter_result = analyze_content(update_data["description"], field_name="description")
        if filter_result["is_inappropriate"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Por favor, mantenha a linguagem profissional e respeitosa. A descrição contém conteúdo inapropriado. {filter_result.get('reason', '')}"
            )
    
    # Verifica campos dinâmicos se estiverem sendo atualizados
    if "dynamic_content" in update_data and update_data["dynamic_content"]:
        for field_name, field_value in update_data["dynamic_content"].items():
            if field_value and isinstance(field_value, str) and field_value.strip():
                filter_result = analyze_content(field_value, field_name=field_name)
                if filter_result["is_inappropriate"]:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Por favor, mantenha a linguagem profissional e respeitosa. O campo '{field_name}' contém conteúdo inapropriado. {filter_result.get('reason', '')}"
                    )
    
    try:
        if not update_data:
            return {
                "status": "success",
                "message": "Nenhum campo para atualizar",
                "data": {}
            }
        
        saved_data = autosave_idea(user_id, idea_id, update_data)
        
        return {
            "status": "success",
            "message": "Ideia salva com sucesso",
            "data": saved_data
        }
    except Exception as e:
        error_msg = str(e)
        error_type = type(e).__name__
        
        # Log detalhado do erro
        import traceback
        error_details = traceback.format_exc()
        print(f"[API] ERRO ao salvar ideia (autosave): {error_msg}")
        print(f"[API] Tipo do erro: {error_type}")
        print(f"[API] Detalhes completos:\n{error_details}")
        
        if "does not exist" in error_msg or "404" in error_msg or "Banco de dados Firestore não foi criado" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "error": "Banco de dados Firestore não foi criado",
                    "message": "Por favor, crie o banco de dados Firestore no console do Firebase",
                    "link": "https://console.cloud.google.com/firestore/databases?project=sandboxcaixa-84951",
                    "original_error": error_msg
                }
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Erro ao salvar ideia",
                "message": f"Ocorreu um erro ao salvar: {error_msg}",
                "original_error": error_msg,
                "error_type": error_type
            }
        )

@router.get("/{user_id}/{idea_id}", response_model=IdeaResponse)
def get_idea_by_id(user_id: str, idea_id: str):
    """
    Busca uma ideia específica
    
    - **user_id**: ID do usuário
    - **idea_id**: ID da ideia
    """
    try:
        idea = get_idea(user_id, idea_id)
        
        if not idea:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ideia não encontrada"
            )
        
        return idea
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "does not exist" in error_msg or "404" in error_msg or "Banco de dados Firestore não foi criado" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    "Banco de dados Firestore não foi criado. "
                    "Por favor, crie o banco em: "
                    "https://console.cloud.google.com/firestore/databases?project=sandboxcaixa-84951"
                )
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar ideia: {error_msg}"
        )

@router.get("/{user_id}", response_model=List[IdeaResponse])
def list_ideas(user_id: str, limit: int = 50):
    """
    Lista todas as ideias de um usuário
    
    - **user_id**: ID do usuário
    - **limit**: Número máximo de ideias a retornar (padrão: 50)
    
    Retorna lista vazia se o usuário não tiver ideias ou se Firebase não estiver configurado.
    """
    import time
    import concurrent.futures
    start_time = time.time()
    
    try:
        print(f"[API] GET /api/ideas/{user_id} - Iniciando busca (limit: {limit})")
        
        # Usa ThreadPoolExecutor com timeout para não travar
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(list_user_ideas, user_id, limit)
            try:
                # Timeout de 10 segundos para a busca
                ideas = future.result(timeout=10)
                
                elapsed_time = time.time() - start_time
                print(f"[API] GET /api/ideas/{user_id} - Concluído em {elapsed_time:.2f}s - {len(ideas) if ideas else 0} ideias")
                
                # Sempre retorna uma lista, mesmo que vazia
                return ideas if ideas else []
            except concurrent.futures.TimeoutError:
                elapsed_time = time.time() - start_time
                print(f"[API] AVISO: Timeout ao buscar ideias para {user_id} (tempo: {elapsed_time:.2f}s)")
                # Retorna lista vazia em caso de timeout (não quebra o frontend)
                return []
        
    except Exception as e:
        elapsed_time = time.time() - start_time
        error_msg = str(e)
        error_type = type(e).__name__
        
        # Log detalhado do erro
        import traceback
        error_details = traceback.format_exc()
        print(f"[API] ERRO ao listar ideias para usuário {user_id} (tempo: {elapsed_time:.2f}s): {error_msg}")
        print(f"[API] Tipo do erro: {error_type}")
        print(f"[API] Detalhes completos:\n{error_details}")
        
        # Em caso de erro inesperado, retorna lista vazia ao invés de erro 500
        # Isso permite que o frontend continue funcionando mesmo com problemas no backend
        return []

@router.delete("/{user_id}/{idea_id}", response_model=SuccessResponse)
def delete_idea_by_id(user_id: str, idea_id: str):
    """
    Deleta uma ideia e todo seu histórico de chat
    
    - **user_id**: ID do usuário
    - **idea_id**: ID da ideia
    """
    try:
        # Verifica se a ideia existe
        idea = get_idea(user_id, idea_id)
        if not idea:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ideia não encontrada"
            )
        
        delete_idea(user_id, idea_id)
        
        return {
            "status": "success",
            "message": "Ideia deletada com sucesso",
            "data": {"idea_id": idea_id}
        }
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "does not exist" in error_msg or "404" in error_msg or "Banco de dados Firestore não foi criado" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    "Banco de dados Firestore não foi criado. "
                    "Por favor, crie o banco em: "
                    "https://console.cloud.google.com/firestore/databases?project=sandboxcaixa-84951"
                )
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar ideia: {error_msg}"
        )

@router.put("/{user_id}/{idea_id}/status")
def update_idea_status(user_id: str, idea_id: str, new_status: str):
    """
    Atualiza o status de uma ideia
    
    - **user_id**: ID do usuário
    - **idea_id**: ID da ideia
    - **new_status**: Novo status (draft, submitted, approved, rejected)
    """
    valid_statuses = ["draft", "submitted", "approved", "rejected"]
    
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status inválido. Use um dos seguintes: {', '.join(valid_statuses)}"
        )
    
    try:
        saved_data = autosave_idea(user_id, idea_id, {"status": new_status})
        
        return {
            "status": "success",
            "message": f"Status atualizado para '{new_status}'",
            "data": saved_data
        }
    except Exception as e:
        error_msg = str(e)
        if "does not exist" in error_msg or "404" in error_msg or "Banco de dados Firestore não foi criado" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    "Banco de dados Firestore não foi criado. "
                    "Por favor, crie o banco em: "
                    "https://console.cloud.google.com/firestore/databases?project=sandboxcaixa-84951"
                )
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar status: {error_msg}"
        )

