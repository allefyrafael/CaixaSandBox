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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar ideia: {str(e)}"
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar ideia: {str(e)}"
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar ideia: {str(e)}"
        )

@router.get("/{user_id}", response_model=List[IdeaResponse])
def list_ideas(user_id: str, limit: int = 50):
    """
    Lista todas as ideias de um usuário
    
    - **user_id**: ID do usuário
    - **limit**: Número máximo de ideias a retornar (padrão: 50)
    """
    try:
        ideas = list_user_ideas(user_id, limit)
        return ideas
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar ideias: {str(e)}"
        )

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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar ideia: {str(e)}"
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar status: {str(e)}"
        )

