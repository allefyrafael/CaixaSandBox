"""
Rotas do Agente Filtrador
Endpoints para moderação de conteúdo
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any
from .agent import analyze_content

router = APIRouter(prefix="/filtrador", tags=["Agente Filtrador"])

class ContentAnalysisRequest(BaseModel):
    """Request para análise de conteúdo"""
    content: str
    field_name: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ContentAnalysisResponse(BaseModel):
    """Response da análise de conteúdo"""
    is_inappropriate: bool
    category: Optional[str] = None
    reason: str
    offensive_text: Optional[str] = None

@router.post("/analyze", response_model=ContentAnalysisResponse)
def analyze_content_endpoint(request: ContentAnalysisRequest):
    """
    Analisa conteúdo usando o Agente Filtrador
    
    Detecta:
    - Conteúdo inapropriado (xingamentos, palavrões, trocadilhos maliciosos)
    - Críticas destrutivas sem proposta construtiva
    - Conteúdo fora de contexto
    
    **Uso:** Chamar ANTES de salvar no banco de dados
    """
    try:
        result = analyze_content(
            request.content,
            request.field_name,
            request.context
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao analisar conteúdo: {str(e)}"
        )

@router.post("/check", response_model=ContentAnalysisResponse)
def check_content_endpoint(request: ContentAnalysisRequest):
    """
    Verifica se conteúdo é apropriado (endpoint simplificado)
    
    Retorna apenas se é inapropriado ou não
    """
    return analyze_content_endpoint(request)

