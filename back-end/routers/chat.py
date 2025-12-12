"""
Rotas de Chat
Endpoints para conversação com o JuniBox
"""
from fastapi import APIRouter, HTTPException, status
from schemas import (
    ChatRequest, 
    ChatRequestResponse, 
    ChatMessage, 
    ChatResponse, 
    ChatHistoryResponse
)
from services.db import (
    save_chat_message,
    get_chat_history,
    get_full_chat_history,
    get_idea_context,
    clear_chat_history
)
from services.ai import (
    get_junibox_response,  # Função simplificada
    generate_junibox_response,  # Função com Firebase
    generate_idea_suggestions, 
    validate_idea_completeness
)
from datetime import datetime

router = APIRouter()

# ============================================
# ENDPOINT SIMPLIFICADO (SEM FIREBASE)
# ============================================

@router.post("/", response_model=ChatRequestResponse, summary="Chat simplificado com JuniBox")
def chat_simple(request: ChatRequest):
    """
    **Endpoint Simplificado** - Chat básico sem necessidade de Firebase
    
    Recebe a mensagem do usuário e o histórico da conversa.
    Retorna a resposta do agente JuniBox processada na Groq.
    
    **Ideal para:**
    - Testes rápidos
    - Prototipagem
    - Quando não precisa persistir no banco
    
    **Exemplo de uso:**
    ```json
    {
        "message": "Tenho uma ideia de app para a Caixa",
        "history": [
            {"role": "user", "content": "Olá"},
            {"role": "assistant", "content": "Olá! Sou o JuniBox."}
        ]
    }
    ```
    """
    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="A mensagem não pode estar vazia."
        )
    
    response_text = get_junibox_response(request.message, request.history)
    
    return {"response": response_text}

# ============================================
# ENDPOINTS AVANÇADOS (COM FIREBASE)
# ============================================

@router.post("/send", response_model=ChatResponse)
def endpoint_chat(payload: ChatMessage):
    """
    Envia uma mensagem para o JuniBox e recebe uma resposta
    
    **Fluxo:**
    1. Salva a mensagem do usuário no Firestore
    2. Busca o contexto da ideia e histórico de chat
    3. Gera resposta usando Groq AI (Llama 3)
    4. Salva a resposta da IA no Firestore
    5. Retorna a resposta para o frontend
    
    **Parâmetros:**
    - **user_id**: ID do usuário
    - **idea_id**: ID da ideia sendo discutida
    - **message**: Mensagem do usuário
    """
    try:
        # 1. Salva mensagem do usuário
        save_chat_message(payload.user_id, payload.idea_id, "user", payload.message)
        
        # 2. Busca contexto
        history = get_chat_history(payload.user_id, payload.idea_id)
        idea_data = get_idea_context(payload.user_id, payload.idea_id)
        
        # 3. Gera resposta da IA
        response = generate_junibox_response(payload.message, history, idea_data)
        
        # 4. Salva resposta da IA
        save_chat_message(payload.user_id, payload.idea_id, "assistant", response)
        
        # 5. Retorna resposta
        return {
            "response": response,
            "timestamp": datetime.now()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar mensagem: {str(e)}"
        )

@router.get("/history/{user_id}/{idea_id}", response_model=ChatHistoryResponse)
def get_chat_history_endpoint(user_id: str, idea_id: str):
    """
    Busca o histórico completo de chat de uma ideia
    
    - **user_id**: ID do usuário
    - **idea_id**: ID da ideia
    """
    try:
        messages = get_full_chat_history(user_id, idea_id)
        
        return {
            "idea_id": idea_id,
            "messages": messages
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar histórico: {str(e)}"
        )

@router.delete("/history/{user_id}/{idea_id}")
def clear_chat_history_endpoint(user_id: str, idea_id: str):
    """
    Limpa todo o histórico de chat de uma ideia
    
    - **user_id**: ID do usuário
    - **idea_id**: ID da ideia
    """
    try:
        clear_chat_history(user_id, idea_id)
        
        return {
            "status": "success",
            "message": "Histórico de chat limpo com sucesso"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao limpar histórico: {str(e)}"
        )

@router.get("/suggestions/{user_id}/{idea_id}")
def get_idea_suggestions_endpoint(user_id: str, idea_id: str):
    """
    Gera sugestões automáticas para melhorar a ideia
    
    Usa IA para analisar a ideia atual e sugerir melhorias
    
    - **user_id**: ID do usuário
    - **idea_id**: ID da ideia
    """
    try:
        idea_data = get_idea_context(user_id, idea_id)
        
        if not idea_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ideia não encontrada"
            )
        
        suggestions = generate_idea_suggestions(idea_data)
        
        return {
            "idea_id": idea_id,
            "suggestions": suggestions
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar sugestões: {str(e)}"
        )

@router.get("/validate/{user_id}/{idea_id}")
def validate_idea_endpoint(user_id: str, idea_id: str):
    """
    Valida se a ideia está completa e pronta para submissão
    
    Retorna um score de completude e lista de campos faltantes
    
    - **user_id**: ID do usuário
    - **idea_id**: ID da ideia
    """
    try:
        idea_data = get_idea_context(user_id, idea_id)
        
        if not idea_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ideia não encontrada"
            )
        
        validation = validate_idea_completeness(idea_data)
        
        return {
            "idea_id": idea_id,
            "validation": validation
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao validar ideia: {str(e)}"
        )

