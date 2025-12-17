"""
Schemas Pydantic para validação de dados
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

# ============================================
# SCHEMAS DE IDEIA
# ============================================

class DynamicContent(BaseModel):
    """Conteúdo dinâmico do formulário"""
    problema: Optional[str] = None
    objetivos: Optional[str] = None
    metricas: Optional[str] = None
    resultadosEsperados: Optional[str] = None
    cronograma: Optional[str] = None
    recursos: Optional[str] = None
    desafios: Optional[str] = None

class ClassificacaoIA(BaseModel):
    """Metadados gerados pela IA"""
    resumo_executivo: str
    setor_responsavel: str
    nivel_complexidade: str  # Baixo, Médio, Alto
    alinhamento_estrategico: int  # 0-10
    categoria: str
    tags: List[str] = []

class IdeiaCreate(BaseModel):
    """Schema para criar nova ideia"""
    user_id: str
    title: Optional[str] = "Nova Ideia"

class IdeiaUpdate(BaseModel):
    """Schema para atualizar ideia"""
    title: Optional[str] = None
    description: Optional[str] = None
    target_audience: Optional[str] = None
    status: Optional[str] = None
    dynamic_content: Optional[DynamicContent] = None

class IdeiaResponse(BaseModel):
    """Schema de resposta de ideia"""
    id: str
    user_id: str
    title: Optional[str] = None
    description: Optional[str] = None
    target_audience: Optional[str] = None
    status: str
    dynamic_content: Optional[Dict[str, Any]] = None
    classificacao_ia: Optional[ClassificacaoIA] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# ============================================
# SCHEMAS DE CHAT
# ============================================

class ChatMessage(BaseModel):
    """Mensagem de chat"""
    role: str  # "user" ou "assistant"
    content: str
    timestamp: Optional[str] = None
    id: Optional[str] = None

class ChatSendRequest(BaseModel):
    """Request para enviar mensagem"""
    user_id: str
    idea_id: str
    message: str
    form_context: Optional[Dict[str, Any]] = None

class ChatSendResponse(BaseModel):
    """Response de envio de mensagem"""
    message: ChatMessage
    idea_id: str

class ChatHistoryResponse(BaseModel):
    """Response de histórico de chat"""
    idea_id: str
    messages: List[ChatMessage]

# ============================================
# SCHEMAS DE SUGESTÃO
# ============================================

class FieldSuggestionRequest(BaseModel):
    """Request para sugestão de campo"""
    user_id: str
    idea_id: str
    field_name: str
    form_data: Dict[str, Any]
    current_step: Optional[str] = None

class FieldSuggestionResponse(BaseModel):
    """Response de sugestão de campo"""
    field_name: str
    suggestion: str

class ValidationResponse(BaseModel):
    """Response de validação"""
    is_valid: bool
    missing_fields: List[str] = []
    suggestions: List[str] = []

# ============================================
# SCHEMAS DE MODERAÇÃO
# ============================================

class CampoProblema(BaseModel):
    """Schema para campo com problema de moderação"""
    campo: str = Field(..., description="Nome do campo com problema")
    tipo: str = Field(..., description="Tipo de problema: 'ofensivo' ou 'fora_contexto'")
    justificativa: str = Field(..., description="Explicação educativa do problema")
    texto: Optional[str] = Field(None, description="Texto problemático detectado")

class ValidacaoRequest(BaseModel):
    """Schema para request de validação de campos"""
    title: Optional[str] = None
    description: Optional[str] = None
    target_audience: Optional[str] = None
    dynamic_content: Optional[DynamicContent] = None

class ValidacaoResponse(BaseModel):
    """Schema para response de validação de moderação"""
    aprovado: bool = Field(..., description="Se todos os campos estão aprovados")
    campos_com_problema: List[CampoProblema] = Field(default_factory=list, description="Lista de campos com problemas")
    justificativa_geral: str = Field(default="", description="Mensagem geral sobre a validação")

