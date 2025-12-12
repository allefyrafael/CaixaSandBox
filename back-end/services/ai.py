"""
Serviço de IA (Groq + Llama 3)
Integração com o modelo de linguagem para o JuniBox
"""
from groq import Groq
from app_config import GROQ_API_KEY, MODEL_NAME, TEMPERATURE
from config.prompts import get_system_prompt
from typing import List, Dict, Any
from schemas import Message

# Inicializa o cliente Groq
client = None
if GROQ_API_KEY:
    try:
        client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        print(f"⚠️  Erro ao inicializar Groq: {e}")

# ============================================
# FUNÇÃO SIMPLIFICADA PARA CHAT BÁSICO
# ============================================

def get_junibox_response(user_message: str, history: List[Message]) -> str:
    """
    Função simplificada que monta o contexto e chama a Groq.
    Versão básica que não precisa de Firebase - ideal para testes rápidos.
    
    Args:
        user_message: Mensagem atual do usuário
        history: Lista de mensagens anteriores (Pydantic Message objects)
        
    Returns:
        Resposta gerada pelo JuniBox
    """
    if not client:
        return "⚠️ Serviço de IA não está configurado. Verifique a GROQ_API_KEY."
    
    if not user_message or not user_message.strip():
        return "Por favor, envie uma mensagem válida."
    
    # 1. Começa com o System Prompt (A personalidade do JuniBox)
    system_prompt = get_system_prompt()
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

# ============================================
# FUNÇÕES AVANÇADAS (COM FIREBASE)
# ============================================

def generate_junibox_response(
    message: str, 
    history: List[Dict[str, str]], 
    idea_context: Dict[str, Any]
) -> str:
    """
    Gera uma resposta do JuniBox baseada no contexto da ideia e histórico
    
    Args:
        message: Mensagem atual do usuário
        history: Histórico de mensagens anteriores [{"role": "user/assistant", "content": "..."}]
        idea_context: Dados atuais da ideia (título, descrição, etc)
        
    Returns:
        Resposta gerada pela IA
    """
    if not client:
        return "⚠️ Serviço de IA não está configurado. Verifique a GROQ_API_KEY."
    
    # Injeta o contexto da ideia no prompt do sistema
    context_str = _build_context_string(idea_context)
    
    # Monta a lista de mensagens para a API
    system_prompt = get_system_prompt()
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

def _build_context_string(idea_context: Dict[str, Any]) -> str:
    """
    Constrói uma string formatada com o contexto da ideia
    para injetar no prompt do sistema
    
    Args:
        idea_context: Dicionário com os dados da ideia
        
    Returns:
        String formatada com o contexto
    """
    if not idea_context:
        return "DADOS ATUAIS DA IDEIA: Ainda não há informações sobre a ideia."
    
    context_parts = ["DADOS ATUAIS DA IDEIA DO USUÁRIO:"]
    
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
            context_parts.append("\n🔧 Campos Adicionais:")
            for key, value in dynamic.items():
                context_parts.append(f"  • {key}: {value}")
    
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
        system_prompt = get_system_prompt()
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

def validate_idea_completeness(idea_context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analisa se a ideia está completa e pronta para submissão
    
    Args:
        idea_context: Dados da ideia
        
    Returns:
        Dicionário com score de completude e campos faltantes
    """
    required_fields = ['title', 'description', 'target_audience']
    missing_fields = []
    filled_fields = 0
    
    for field in required_fields:
        value = idea_context.get(field, "")
        if value and len(str(value).strip()) > 0:
            filled_fields += 1
        else:
            missing_fields.append(field)
    
    completeness_score = (filled_fields / len(required_fields)) * 100
    
    return {
        "score": completeness_score,
        "is_complete": completeness_score == 100,
        "missing_fields": missing_fields,
        "filled_fields": filled_fields,
        "total_fields": len(required_fields)
    }

