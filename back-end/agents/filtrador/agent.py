"""
Agente Filtrador
Sistema de moderação inteligente antes de salvar no banco
"""
import json
from groq import Groq
from app_config import GROQ_API_KEY, MODEL_NAME
from typing import Dict, Any, Tuple, Optional
from .prompts import get_filtrador_prompt

# Inicializa o cliente Groq
client = None
if GROQ_API_KEY:
    try:
        client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        print(f"⚠️  Erro ao inicializar Groq para Agente Filtrador: {e}")

def analyze_content(
    content: str,
    field_name: Optional[str] = None,
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Analisa conteúdo usando o Agente Filtrador
    
    Args:
        content: Conteúdo a ser analisado
        field_name: Nome do campo (opcional, para contexto)
        context: Contexto adicional (opcional)
        
    Returns:
        Dicionário com resultado da análise:
        {
            "is_inappropriate": bool,
            "category": str | None,
            "reason": str,
            "offensive_text": str | None
        }
    """
    if not content or not content.strip():
        return {
            "is_inappropriate": False,
            "category": None,
            "reason": "",
            "offensive_text": None
        }
    
    if not client:
        # Se não houver cliente, retorna apropriado (não bloqueia)
        return {
            "is_inappropriate": False,
            "category": None,
            "reason": "Agente Filtrador não configurado",
            "offensive_text": None
        }
    
    # Construir prompt com contexto
    context_str = ""
    if field_name:
        context_str += f"\nCampo sendo analisado: {field_name}"
    if context:
        context_str += f"\nContexto adicional: {json.dumps(context, ensure_ascii=False)}"
    
    moderation_prompt = f"""{get_filtrador_prompt()}

Conteúdo a analisar: "{content}"
{context_str}

Analise este conteúdo e determine se deve ser bloqueado antes de salvar no banco de dados."""

    try:
        # Chama a IA para análise
        completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "Você é o Agente Filtrador. Analise conteúdo e retorne APENAS JSON válido com is_inappropriate (boolean), category (string ou null), reason (string) e offensive_text (string ou null)."
                },
                {
                    "role": "user",
                    "content": moderation_prompt
                }
            ],
            model=MODEL_NAME,
            temperature=0.1,  # Muito baixa para ser rigoroso e consistente
            max_tokens=300,
            response_format={"type": "json_object"}  # Força resposta JSON
        )
        
        response_text = completion.choices[0].message.content.strip()
        
        # Parsear JSON
        try:
            result = json.loads(response_text)
            return {
                "is_inappropriate": bool(result.get("is_inappropriate", False)),
                "category": result.get("category"),
                "reason": result.get("reason", "conteúdo inapropriado detectado pelo Agente Filtrador"),
                "offensive_text": result.get("offensive_text")
            }
        except json.JSONDecodeError:
            # Se não conseguir parsear, tenta extrair do texto
            response_lower = response_text.lower()
            if "true" in response_lower or "inappropriate" in response_lower or "inapropriado" in response_lower:
                return {
                    "is_inappropriate": True,
                    "category": "conteudo_inapropriado",
                    "reason": "conteúdo inapropriado detectado pelo Agente Filtrador",
                    "offensive_text": content[:100]  # Primeiros 100 caracteres
                }
            return {
                "is_inappropriate": False,
                "category": None,
                "reason": "",
                "offensive_text": None
            }
            
    except Exception as e:
        print(f"[AVISO] Erro no Agente Filtrador: {e}")
        # Em caso de erro, retorna apropriado (não bloqueia) para não quebrar o fluxo
        return {
            "is_inappropriate": False,
            "category": None,
            "reason": f"Erro na análise: {str(e)}",
            "offensive_text": None
        }

def check_content_moderation(content: str, field_name: Optional[str] = None) -> Tuple[bool, str]:
    """
    Wrapper para compatibilidade com código existente
    
    Args:
        content: Conteúdo a ser verificado
        field_name: Nome do campo (opcional)
        
    Returns:
        Tupla (is_inappropriate, reason)
    """
    result = analyze_content(content, field_name)
    return result["is_inappropriate"], result["reason"]

