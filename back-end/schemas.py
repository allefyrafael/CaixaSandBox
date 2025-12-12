"""
Modelos de Validação (Pydantic)
Define a estrutura dos dados que a API aceita e retorna
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

# ============================================
# SCHEMAS DE IDEIAS
# ============================================

class IdeaCreate(BaseModel):
    """Schema para criar uma nova ideia"""
    user_id: str = Field(..., description="ID do usuário dono da ideia")
    title: str = Field(default="Nova Ideia", description="Título da ideia")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user123",
                "title": "Aplicativo de Reciclagem"
            }
        }

class IdeaUpdate(BaseModel):
    """
    Schema para atualização parcial (Autosave)
    Todos os campos são opcionais para permitir updates incrementais
    """
    title: Optional[str] = Field(None, description="Título da ideia")
    description: Optional[str] = Field(None, description="Descrição detalhada")
    target_audience: Optional[str] = Field(None, description="Público-alvo")
    dynamic_content: Optional[Dict[str, Any]] = Field(None, description="Campos dinâmicos adicionais")
    status: Optional[str] = Field(None, description="Status: draft, submitted, approved, rejected")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "App de Reciclagem Inteligente",
                "description": "Um aplicativo que usa IA para identificar materiais recicláveis",
                "target_audience": "Famílias urbanas conscientes"
            }
        }

class IdeaResponse(BaseModel):
    """Schema de resposta com dados completos da ideia"""
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    target_audience: Optional[str] = None
    status: str = "draft"
    dynamic_content: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    last_updated: Optional[datetime] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "idea123",
                "user_id": "user123",
                "title": "App de Reciclagem",
                "description": "Aplicativo mobile para...",
                "target_audience": "Famílias urbanas",
                "status": "draft",
                "created_at": "2025-01-01T10:00:00",
                "last_updated": "2025-01-01T10:30:00"
            }
        }

# ============================================
# SCHEMAS DE CHAT
# ============================================

# Schema simplificado para chat básico (sem Firebase)
class Message(BaseModel):
    """Mensagem individual do histórico"""
    role: str = Field(..., description="Quem enviou: 'user', 'assistant' ou 'system'")
    content: str = Field(..., description="O conteúdo do texto")
    
    class Config:
        json_schema_extra = {
            "example": {
                "role": "user",
                "content": "Tenho uma ideia de app para a Caixa"
            }
        }

class ChatRequest(BaseModel):
    """Schema simplificado para chat básico (sem Firebase)"""
    message: str = Field(..., example="Tenho uma ideia de app para a Caixa", description="A mensagem atual do usuário")
    history: List[Message] = Field(default=[], description="O histórico da conversa até agora para manter a memória")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Tenho uma ideia de app para a Caixa",
                "history": [
                    {"role": "user", "content": "Olá"},
                    {"role": "assistant", "content": "Olá! Sou o JuniBox, avaliador de ideias da CAIXA."}
                ]
            }
        }

class ChatRequestResponse(BaseModel):
    """Resposta do chat simplificado"""
    response: str = Field(..., description="A resposta gerada pelo JuniBox")
    
    class Config:
        json_schema_extra = {
            "example": {
                "response": "Olá! Sou o JuniBox, avaliador oficial de ideias da CAIXA. Como posso ajudar você a estruturar sua ideia?"
            }
        }

# Schema completo para chat com Firebase
class ChatMessage(BaseModel):
    """Schema para enviar mensagem ao JuniBox"""
    user_id: str = Field(..., description="ID do usuário")
    idea_id: str = Field(..., description="ID da ideia sendo discutida")
    message: str = Field(..., min_length=1, description="Mensagem do usuário")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user123",
                "idea_id": "idea123",
                "message": "Como posso melhorar minha ideia?"
            }
        }

class ChatResponse(BaseModel):
    """Schema de resposta do chat"""
    response: str = Field(..., description="Resposta do JuniBox")
    timestamp: Optional[datetime] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "response": "Ótima pergunta! Vamos começar pelo público-alvo...",
                "timestamp": "2025-01-01T10:00:00"
            }
        }

class ChatHistoryItem(BaseModel):
    """Item individual do histórico de chat"""
    role: str = Field(..., description="user ou assistant")
    content: str = Field(..., description="Conteúdo da mensagem")
    timestamp: datetime
    
class ChatHistoryResponse(BaseModel):
    """Histórico completo de uma conversa"""
    idea_id: str
    messages: List[ChatHistoryItem]
    
    class Config:
        json_schema_extra = {
            "example": {
                "idea_id": "idea123",
                "messages": [
                    {
                        "role": "user",
                        "content": "Como melhorar minha ideia?",
                        "timestamp": "2025-01-01T10:00:00"
                    },
                    {
                        "role": "assistant",
                        "content": "Vamos começar pelo público-alvo...",
                        "timestamp": "2025-01-01T10:00:05"
                    }
                ]
            }
        }

# ============================================
# SCHEMAS DE RESPOSTA GENÉRICOS
# ============================================

class SuccessResponse(BaseModel):
    """Resposta genérica de sucesso"""
    status: str = "success"
    message: str
    data: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    """Resposta genérica de erro"""
    status: str = "error"
    message: str
    detail: Optional[str] = None

