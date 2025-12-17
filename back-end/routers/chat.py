"""
Router de Chat
Endpoints para interação com o Agente Mentor
"""

from fastapi import APIRouter, HTTPException, Depends
from models.schemas import (
    ChatSendRequest, ChatSendResponse, ChatHistoryResponse,
    ChatMessage, FieldSuggestionRequest, FieldSuggestionResponse,
    ValidationResponse
)
from services.firebase_client import get_firebase_client
from agents.mentor import AgenteMentor
from middleware.auth import verify_user_id, get_current_user

router = APIRouter()

# ============================================
# DEPENDENCIES
# ============================================

def get_firebase():
    """Dependency para Firebase"""
    try:
        return get_firebase_client()
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Erro ao conectar com Firebase: {str(e)}"
        )

# ============================================
# ENDPOINTS
# ============================================

@router.post("/chat/send", response_model=ChatSendResponse)
async def send_chat_message(
    request: ChatSendRequest,
    current_user: dict = Depends(get_current_user),
    firebase = Depends(get_firebase)
):
    """
    Envia mensagem para o chat com contexto do formulário
    
    Fluxo:
    1. Valida autenticação
    2. Verifica se user_id corresponde ao usuário autenticado
    3. Busca ideia e histórico de chat
    4. Agente Mentor gera resposta
    5. Salva ambas as mensagens no Firebase
    6. Retorna resposta
    """
    # Validar user_id
    if request.user_id != current_user["uid"]:
        raise HTTPException(
            status_code=403,
            detail="user_id não corresponde ao usuário autenticado"
        )
    
    # Verificar se ideia existe
    idea = await firebase.get_idea(request.user_id, request.idea_id)
    if not idea:
        raise HTTPException(
            status_code=404,
            detail="Ideia não encontrada"
        )
    
    # Buscar histórico
    historico = await firebase.get_chat_history(
        request.user_id,
        request.idea_id,
        limit=20
    )
    
    # Preparar contexto do formulário
    contexto_formulario = {
        "title": idea.get("title"),
        "description": idea.get("description"),
        **idea.get("dynamic_content", {})
    }
    
    # Adicionar contexto adicional se fornecido
    if request.form_context:
        contexto_formulario.update(request.form_context)
    
    # Converter histórico para formato esperado
    historico_formatado = [
        {"role": msg.get("role"), "content": msg.get("content", "")}
        for msg in historico
    ]
    
    # Agente Mentor gera resposta
    mentor = AgenteMentor()
    resposta = await mentor.responder_chat(
        mensagem_usuario=request.message,
        contexto_formulario=contexto_formulario,
        historico=historico_formatado
    )
    
    # Salvar mensagens no Firebase
    await firebase.add_chat_message(
        request.user_id,
        request.idea_id,
        "user",
        request.message
    )
    
    await firebase.add_chat_message(
        request.user_id,
        request.idea_id,
        "assistant",
        resposta
    )
    
    # Retornar resposta
    return ChatSendResponse(
        idea_id=request.idea_id,
        message=ChatMessage(
            role="assistant",
            content=resposta
        )
    )

@router.get("/chat/history/{user_id}/{idea_id}", response_model=ChatHistoryResponse)
async def get_chat_history(
    user_id: str,
    idea_id: str,
    _: str = Depends(verify_user_id),
    firebase = Depends(get_firebase)
):
    """Busca histórico completo de chat"""
    # Verificar se ideia existe
    idea = await firebase.get_idea(user_id, idea_id)
    if not idea:
        raise HTTPException(
            status_code=404,
            detail="Ideia não encontrada"
        )
    
    messages = await firebase.get_chat_history(user_id, idea_id, limit=100)
    
    return ChatHistoryResponse(
        idea_id=idea_id,
        messages=[
            ChatMessage(
                id=msg.get("id"),
                role=msg.get("role"),
                content=msg.get("content", ""),
                timestamp=msg.get("timestamp")
            )
            for msg in messages
        ]
    )

@router.delete("/chat/history/{user_id}/{idea_id}")
async def clear_chat_history(
    user_id: str,
    idea_id: str,
    _: str = Depends(verify_user_id),
    firebase = Depends(get_firebase)
):
    """Limpa histórico de chat"""
    success = await firebase.clear_chat_history(user_id, idea_id)
    
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Ideia não encontrada"
        )
    
    return {"status": "cleared", "idea_id": idea_id}

@router.post("/chat/suggest-field", response_model=FieldSuggestionResponse)
async def suggest_field(
    request: FieldSuggestionRequest,
    current_user: dict = Depends(get_current_user),
    firebase = Depends(get_firebase)
):
    """
    Gera sugestão para um campo específico do formulário
    
    Fluxo:
    1. Valida autenticação
    2. Verifica se user_id corresponde ao usuário autenticado
    3. Busca ideia atual
    4. Agente Mentor gera sugestão focada no campo
    5. Retorna sugestão
    """
    # Validar user_id
    if request.user_id != current_user["uid"]:
        raise HTTPException(
            status_code=403,
            detail="user_id não corresponde ao usuário autenticado"
        )
    
    # Verificar se ideia existe
    idea = await firebase.get_idea(request.user_id, request.idea_id)
    if not idea:
        raise HTTPException(
            status_code=404,
            detail="Ideia não encontrada"
        )
    
    # Preparar contexto
    contexto = {
        "title": idea.get("title"),
        "description": idea.get("description"),
        **idea.get("dynamic_content", {}),
        **request.form_data
    }
    
    # Agente Mentor gera sugestão
    mentor = AgenteMentor()
    sugestao = await mentor.sugerir_melhoria(
        contexto_atual=contexto,
        campo_foco=request.field_name
    )
    
    return FieldSuggestionResponse(
        field_name=request.field_name,
        suggestion=sugestao
    )

@router.get("/chat/suggestions/{user_id}/{idea_id}")
async def get_idea_suggestions(
    user_id: str,
    idea_id: str,
    _: str = Depends(verify_user_id),
    firebase = Depends(get_firebase)
):
    """Gera sugestões gerais para a ideia"""
    idea = await firebase.get_idea(user_id, idea_id)
    if not idea:
        raise HTTPException(
            status_code=404,
            detail="Ideia não encontrada"
        )
    
    contexto = {
        "title": idea.get("title"),
        "description": idea.get("description"),
        **idea.get("dynamic_content", {})
    }
    
    mentor = AgenteMentor()
    sugestao = await mentor.sugerir_melhoria(contexto_atual=contexto)
    
    return {
        "idea_id": idea_id,
        "suggestions": sugestao
    }

@router.get("/chat/validate/{user_id}/{idea_id}", response_model=ValidationResponse)
async def validate_idea(
    user_id: str,
    idea_id: str,
    _: str = Depends(verify_user_id),
    firebase = Depends(get_firebase)
):
    """
    Valida completude da ideia
    
    Retorna campos faltantes e sugestões
    """
    idea = await firebase.get_idea(user_id, idea_id)
    if not idea:
        raise HTTPException(
            status_code=404,
            detail="Ideia não encontrada"
        )
    
    # Campos obrigatórios
    campos_obrigatorios = {
        "title": "Título",
        "description": "Descrição",
        "problema": "Problema",
        "objetivos": "Objetivos",
        "metricas": "Métricas"
    }
    
    missing_fields = []
    dynamic = idea.get("dynamic_content", {})
    
    if not idea.get("title"):
        missing_fields.append("Título")
    if not idea.get("description"):
        missing_fields.append("Descrição")
    if not dynamic.get("problema"):
        missing_fields.append("Problema")
    if not dynamic.get("objetivos"):
        missing_fields.append("Objetivos")
    if not dynamic.get("metricas"):
        missing_fields.append("Métricas")
    
    # Gerar sugestões se houver campos faltantes
    suggestions = []
    if missing_fields:
        mentor = AgenteMentor()
        contexto = {
            "title": idea.get("title"),
            "description": idea.get("description"),
            **dynamic
        }
        sugestao = await mentor.sugerir_melhoria(contexto_atual=contexto)
        suggestions.append(sugestao)
    
    return ValidationResponse(
        is_valid=len(missing_fields) == 0,
        missing_fields=missing_fields,
        suggestions=suggestions
    )

@router.post("/chat/")
async def chat_simple(
    message: str,
    history: list = []
):
    """
    Chat simplificado (sem Firebase)
    Para testes ou uso geral
    """
    mentor = AgenteMentor()
    resposta = await mentor.responder_chat(
        mensagem_usuario=message,
        contexto_formulario={},
        historico=history
    )
    
    return {
        "response": resposta
    }

