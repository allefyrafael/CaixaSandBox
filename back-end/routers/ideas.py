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
from typing import List

router = APIRouter()

@router.post("/", response_model=IdeaResponse, status_code=status.HTTP_201_CREATED)
def create_idea(payload: IdeaCreate):
    """
    Cria uma nova ideia para o usuário
    
    - **user_id**: ID do usuário (obrigatório)
    - **title**: Título inicial da ideia (opcional, padrão: "Nova Ideia")
    """
    try:
        idea_data = create_new_idea(payload.user_id, payload.title)
        return idea_data
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
            detail=f"Erro ao criar ideia: {error_msg}"
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
    try:
        # exclude_unset=True garante que só enviamos o que foi digitado
        update_data = payload.dict(exclude_unset=True)
        
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
            detail=f"Erro ao salvar ideia: {error_msg}"
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
    try:
        ideas = list_user_ideas(user_id, limit)
        # Sempre retorna uma lista, mesmo que vazia
        return ideas if ideas else []
    except Exception as e:
        # Em caso de erro inesperado, retorna lista vazia ao invés de erro 500
        print(f"[ERRO] Erro ao listar ideias para usuário {user_id}: {e}")
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

