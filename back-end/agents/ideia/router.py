"""
Rotas do Agente de Ideia (JuniBox)
Endpoints para assistência na ideação
"""
from fastapi import APIRouter, HTTPException, status
from schemas import (
    ChatRequest, 
    ChatRequestResponse, 
    ChatMessage, 
    ChatResponse, 
    FieldSuggestionRequest,
    FieldSuggestionResponse
)
from services.db import (
    save_chat_message,
    get_chat_history,
    get_idea_context,
    clear_chat_history
)
from .agent import (
    get_response,
    generate_response,
    generate_idea_suggestions,
    validate_idea_completeness,
    generate_field_suggestion
)
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

router = APIRouter(prefix="/ideia", tags=["Agente de Ideia"])

# ============================================
# ENDPOINT SIMPLIFICADO (SEM FIREBASE)
# ============================================

@router.post("/chat", response_model=ChatRequestResponse, summary="Chat simplificado com Agente de Ideia")
def chat_simple(request: ChatRequest):
    """
    **Endpoint Simplificado** - Chat básico sem necessidade de Firebase
    
    Recebe a mensagem do usuário e o histórico da conversa.
    Retorna a resposta do Agente de Ideia (JuniBox) processada na Groq.
    
    **Ideal para:**
    - Testes rápidos
    - Prototipagem
    - Quando não precisa persistir no banco
    """
    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="A mensagem não pode estar vazia."
        )
    
    response_text = get_response(request.message, request.history)
    
    return {"response": response_text}

# ============================================
# ENDPOINTS AVANÇADOS (COM FIREBASE)
# ============================================

@router.post("/send", response_model=ChatResponse)
def endpoint_chat(payload: ChatMessage):
    """
    Envia uma mensagem para o Agente de Ideia e recebe uma resposta
    
    **Fluxo:**
    1. Salva a mensagem do usuário no Firestore
    2. Busca o contexto da ideia e histórico de chat
    3. Gera resposta usando Groq AI (Llama 3) com contexto do formulário
    4. Salva a resposta da IA no Firestore
    5. Retorna a resposta para o frontend
    """
    try:
        # 1. Salva mensagem do usuário
        save_chat_message(payload.user_id, payload.idea_id, "user", payload.message)
        
        # 2. Busca contexto em paralelo (otimização)
        with ThreadPoolExecutor(max_workers=2) as executor:
            history_future = executor.submit(get_chat_history, payload.user_id, payload.idea_id)
            idea_future = executor.submit(get_idea_context, payload.user_id, payload.idea_id)
            history = history_future.result()
            idea_data = idea_future.result()
        
        # 3. Gera resposta da IA com contexto do formulário
        response = generate_response(
            payload.message, 
            history, 
            idea_data,
            form_context=payload.form_context
        )
        
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

@router.post("/suggest-field", response_model=FieldSuggestionResponse)
def suggest_field_endpoint(payload: FieldSuggestionRequest):
    """
    Gera sugestão para um campo específico do formulário
    
    O Agente de Ideia analisa o contexto do formulário e gera uma sugestão apropriada
    para campos opcionais (publicoAlvo, metricas, resultadosEsperados).
    """
    try:
        # Validar que o campo é opcional
        optional_fields = ["publicoAlvo", "metricas", "resultadosEsperados"]
        if payload.field_name not in optional_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Campo '{payload.field_name}' não é opcional. Apenas campos opcionais podem receber sugestões da IA."
            )
        
        # Buscar contexto da ideia
        idea_context = get_idea_context(payload.user_id, payload.idea_id)
        
        # Preparar contexto do formulário
        step_names = ["Sua Ideia", "Objetivos e Metas", "Cronograma"]
        step_name = step_names[payload.current_step] if 0 <= payload.current_step < len(step_names) else "Desconhecida"
        
        form_context = {
            "form_data": payload.form_data,
            "current_step": payload.current_step,
            "step_name": step_name
        }
        
        # Gerar sugestão
        suggestion = generate_field_suggestion(
            idea_context,
            form_context,
            payload.field_name
        )
        
        return suggestion
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar sugestão: {str(e)}"
        )

@router.get("/suggestions/{user_id}/{idea_id}")
def get_idea_suggestions_endpoint(user_id: str, idea_id: str):
    """
    Gera sugestões automáticas para melhorar a ideia
    """
    try:
        idea_context = get_idea_context(user_id, idea_id)
        suggestions = generate_idea_suggestions(idea_context)
        
        return {
            "idea_id": idea_id,
            "suggestions": suggestions
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar sugestões: {str(e)}"
        )

@router.get("/validate/{user_id}/{idea_id}")
def validate_idea_endpoint(user_id: str, idea_id: str):
    """
    Valida a completude da ideia
    """
    try:
        idea_context = get_idea_context(user_id, idea_id)
        validation = validate_idea_completeness(idea_context)
        
        return {
            "idea_id": idea_id,
            **validation
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao validar ideia: {str(e)}"
        )

