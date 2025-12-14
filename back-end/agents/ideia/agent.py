"""
Agente de Ideia (Sandbot)
Sistema de assistência para ideação e estruturação de propostas
"""
import json
from groq import Groq
from app_config import GROQ_API_KEY, MODEL_NAME, TEMPERATURE
from .prompts import get_ideia_prompt
from typing import List, Dict, Any, Optional
from schemas import Message

# Inicializa o cliente Groq
client = None
if GROQ_API_KEY:
    try:
        client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        print(f"⚠️  Erro ao inicializar Groq para Agente de Ideia: {e}")

# ============================================
# FUNÇÕES DO AGENTE DE IDEIA
# ============================================

def get_response(user_message: str, history: List[Message]) -> str:
    """
    Função simplificada que monta o contexto e chama a Groq.
    Versão básica que não precisa de Firebase - ideal para testes rápidos.
    
    Args:
        user_message: Mensagem atual do usuário
        history: Lista de mensagens anteriores (Pydantic Message objects)
        
    Returns:
        Resposta gerada pelo Agente de Ideia
    """
    if not client:
        return "⚠️ Serviço de IA não está configurado. Verifique a GROQ_API_KEY."
    
    if not user_message or not user_message.strip():
        return "Por favor, envie uma mensagem válida."
    
    # 1. Começa com o System Prompt (A personalidade do Sandbot)
    system_prompt = get_ideia_prompt()
    messages_payload = [{"role": "system", "content": system_prompt}]
    
    # 2. Adiciona o histórico antigo (convertendo do Pydantic para dict)
    for msg in history:
        messages_payload.append({"role": msg.role, "content": msg.content})
    
    # 3. Adiciona a mensagem atual do usuário
    messages_payload.append({"role": "user", "content": user_message})
    
    # 4. Chama a API do Groq
    try:
        chat_completion = client.chat.completions.create(
            messages=messages_payload,
            model=MODEL_NAME,
            temperature=TEMPERATURE,  # Baixa criatividade para seguir regras
            max_tokens=1024
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"❌ Erro ao processar na Groq: {e}")
        return f"Erro ao processar na Groq: {str(e)}"

def generate_response(
    message: str, 
    history: List[Dict[str, str]], 
    idea_context: Dict[str, Any],
    form_context: Optional[Dict[str, Any]] = None
) -> str:
    """
    Gera uma resposta do Agente de Ideia baseada no contexto da ideia e histórico
    
    Args:
        message: Mensagem atual do usuário
        history: Histórico de mensagens anteriores [{"role": "user/assistant", "content": "..."}]
        idea_context: Dados atuais da ideia (título, descrição, etc)
        form_context: Contexto do formulário (seção atual, dados do formulário, etc)
        
    Returns:
        Resposta gerada pela IA
    """
    if not client:
        return "⚠️ Serviço de IA não está configurado. Verifique a GROQ_API_KEY."
    
    # Injeta o contexto da ideia no prompt do sistema
    context_str = _build_context_string(idea_context, form_context)
    
    # Monta a lista de mensagens para a API
    system_prompt = get_ideia_prompt()
    messages = [
        {"role": "system", "content": system_prompt + "\n\n" + context_str}
    ]
    
    # Adiciona histórico de conversas anteriores
    messages.extend(history)
    
    # Adiciona a mensagem atual do usuário
    messages.append({"role": "user", "content": message})
    
    try:
        # Chama a API do Groq
        completion = client.chat.completions.create(
            messages=messages,
            model=MODEL_NAME,
            temperature=TEMPERATURE,
            max_tokens=1024,
            top_p=1,
            stream=False
        )
        
        return completion.choices[0].message.content
        
    except Exception as e:
        print(f"❌ Erro ao gerar resposta da IA: {e}")
        return "Desculpe, tive um problema ao processar sua mensagem. Tente novamente em alguns instantes."

def _build_context_string(idea_context: Dict[str, Any], form_context: Optional[Dict[str, Any]] = None) -> str:
    """
    Constrói uma string formatada com o contexto da ideia e do formulário
    para injetar no prompt do sistema
    
    Args:
        idea_context: Dicionário com os dados da ideia
        form_context: Dicionário com os dados atuais do formulário
        
    Returns:
        String formatada com o contexto
    """
    context_parts = []
    
    if idea_context:
        context_parts.append("DADOS ATUAIS DA IDEIA DO USUÁRIO (salvos no banco):")
        
        # Campos principais
        if idea_context.get('title'):
            context_parts.append(f"📌 Título: {idea_context['title']}")
        
        if idea_context.get('description'):
            context_parts.append(f"📝 Descrição: {idea_context['description']}")
        
        if idea_context.get('target_audience'):
            context_parts.append(f"👥 Público-alvo: {idea_context['target_audience']}")
        
        if idea_context.get('status'):
            context_parts.append(f"📊 Status: {idea_context['status']}")
        
        # Campos dinâmicos adicionais
        if idea_context.get('dynamic_content'):
            dynamic = idea_context['dynamic_content']
            if dynamic:
                context_parts.append("\n🔧 Campos Adicionais (salvos):")
                for key, value in dynamic.items():
                    if value:  # Só mostrar campos preenchidos
                        context_parts.append(f"  • {key}: {value}")
    else:
        context_parts.append("DADOS ATUAIS DA IDEIA DO USUÁRIO (salvos no banco): Ainda não há informações salvas sobre a ideia.")

    # Adiciona contexto do formulário se disponível
    if form_context:
        context_parts.append(f"\nCONTEXTO ATUAL DO FORMULÁRIO (seção: {form_context.get('step_name', 'Desconhecida')}):")
        form_data = form_context.get('form_data', {})
        
        if form_data:
            context_parts.append("📝 Campos do Formulário (valores atuais, incluindo não salvos):")
            for key, value in form_data.items():
                if value:
                    context_parts.append(f"  • {key}: {value}")
        else:
            context_parts.append("📝 Nenhum dado preenchido no formulário ainda.")
        
        if form_context.get('required_fields_filled') is not None:
            context_parts.append(f"✅ Campos obrigatórios da seção atual preenchidos: {form_context['required_fields_filled']}")
        if form_context.get('optional_fields_available') is not None:
            context_parts.append(f"💡 Campos opcionais disponíveis para sugestão: {form_context['optional_fields_available']}")

    return "\n".join(context_parts)

def generate_idea_suggestions(idea_context: Dict[str, Any]) -> List[str]:
    """
    Gera sugestões automáticas para melhorar a ideia
    Pode ser usado para o painel de sugestões da UI
    
    Args:
        idea_context: Dados da ideia
        
    Returns:
        Lista de sugestões
    """
    if not client:
        return ["Configure a GROQ_API_KEY para receber sugestões."]
    
    context_str = _build_context_string(idea_context)
    
    prompt = f"""
{context_str}

Com base nos dados acima, gere 3 sugestões objetivas e acionáveis para melhorar esta ideia.
Cada sugestão deve ter no máximo 2 linhas.
Retorne apenas as sugestões, uma por linha, sem numeração.
"""
    
    try:
        system_prompt = get_ideia_prompt()
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            model=MODEL_NAME,
            temperature=0.5,
            max_tokens=300
        )
        
        response = completion.choices[0].message.content
        suggestions = [s.strip() for s in response.split('\n') if s.strip()]
        
        return suggestions[:3]  # Garante no máximo 3 sugestões
        
    except Exception as e:
        print(f"❌ Erro ao gerar sugestões: {e}")
        return ["Não foi possível gerar sugestões no momento."]

def generate_field_suggestion(
    idea_context: Dict[str, Any], 
    form_context: Dict[str, Any], 
    field_name: str
) -> Dict[str, Any]:
    """
    Gera uma sugestão de preenchimento para um campo específico do formulário.
    
    Args:
        idea_context: Dados da ideia (salvos no banco).
        form_context: Dados atuais do formulário (incluindo campos não salvos).
        field_name: O nome do campo para o qual a sugestão é solicitada.
        
    Returns:
        Um dicionário com a sugestão, raciocínio e confiança.
    """
    if not client:
        return {
            "suggestion": "Serviço de IA não configurado.",
            "reasoning": "GROQ_API_KEY ausente.",
            "confidence": 0
        }

    # Construir o prompt para a sugestão de campo
    context_str = _build_context_string(idea_context, form_context)
    
    prompt = f"""
{context_str}

O usuário está na seção '{form_context.get('step_name', 'desconhecida')}' e solicitou uma sugestão para o campo '{field_name}'.
    
Com base nas informações fornecidas sobre a ideia e o formulário, gere uma sugestão concisa e relevante para preencher o campo '{field_name}'.
Além da sugestão, forneça um breve raciocínio (1-2 frases) explicando por que essa sugestão é adequada.
    
Formato da resposta (JSON):
```json
{{
    "suggestion": "Sua sugestão aqui.",
    "reasoning": "O raciocínio para a sugestão.",
    "confidence": 0.85
}}
```
A confiança deve ser um valor entre 0.0 e 1.0.
"""
    
    try:
        system_prompt = get_ideia_prompt()
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            model=MODEL_NAME,
            temperature=0.7, # Um pouco mais criativo para sugestões
            max_tokens=500,
            response_format={"type": "json_object"} # Solicita JSON
        )
        
        response_content = completion.choices[0].message.content
        response_data = json.loads(response_content)
        
        return {
            "suggestion": response_data.get("suggestion", ""),
            "reasoning": response_data.get("reasoning", ""),
            "confidence": response_data.get("confidence", 0.0)
        }
        
    except json.JSONDecodeError as e:
        print(f"❌ Erro de decodificação JSON na sugestão de campo: {e}")
        print(f"Conteúdo recebido: {response_content}")
        return {
            "suggestion": "Não foi possível gerar uma sugestão válida (erro de formato).",
            "reasoning": "A IA não retornou um JSON válido.",
            "confidence": 0
        }
    except Exception as e:
        print(f"❌ Erro ao gerar sugestão de campo: {e}")
        return {
            "suggestion": "Não foi possível gerar sugestão no momento.",
            "reasoning": f"Erro interno: {str(e)}",
            "confidence": 0
        }

def validate_idea_completeness(idea_context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analisa se a ideia está completa e pronta para submissão
    
    Args:
        idea_context: Dados da ideia
        
    Returns:
        Dicionário com score de completude e lista de campos faltantes
    """
    required_fields = ['title', 'description', 'problema', 'objetivos']
    missing_fields = []
    filled_fields = 0
    
    # Verifica campos principais
    for field in ['title', 'description', 'target_audience']:
        value = idea_context.get(field, "")
        if value and len(str(value).strip()) > 0:
            filled_fields += 1
        elif field in required_fields:
            missing_fields.append(field)

    # Verifica campos dinâmicos
    dynamic_content = idea_context.get('dynamic_content', {})
    for field in ['problema', 'objetivos', 'metricas', 'resultadosEsperados', 'cronograma', 'recursos', 'desafios']:
        value = dynamic_content.get(field, "")
        if value and len(str(value).strip()) > 0:
            filled_fields += 1
        elif field in required_fields:
            missing_fields.append(field)
    
    total_possible_fields = len(required_fields) + len(['target_audience', 'metricas', 'resultadosEsperados', 'cronograma', 'recursos', 'desafios'])
    
    completeness_score = (filled_fields / total_possible_fields) * 100
    
    return {
        "score": completeness_score,
        "is_complete": completeness_score == 100,
        "missing_fields": missing_fields,
        "filled_fields": filled_fields,
        "total_fields": total_possible_fields
    }

