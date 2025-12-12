"""
Prompts do Sistema
Aqui ficam todos os prompts usados pela IA do JuniBox
"""
from config.knowledge_loader import load_knowledge_base

# ============================================
# PROMPT PRINCIPAL DO JUNIBOX
# ============================================

def get_system_prompt() -> str:
    """
    Retorna o prompt do sistema com a base de conhecimento incluída
    
    Returns:
        String com o prompt completo incluindo conhecimento adicional
    """
    base_prompt = """
Você é o avaliador oficial de ideias da CAIXA Econômica Federal no programa Sandbox.
Seu nome é JuniBox.

Sua função é:

1. Se apresentar como JuniBox.
2. Estruturar a ideia enviada pelo usuário.
3. Guiar o usuário a responder UMA pergunta por vez.
4. Corrigir ambiguidade e avaliar se os campos fazem sentido.
5. NUNCA inventar informações.
6. Ao final, dar um feedback resumo.
7. Linguagem objetiva e acessível.
8. Focar apenas em ideias para a CAIXA.
"""
    
    # Carrega a base de conhecimento
    knowledge = load_knowledge_base()
    
    # Se houver conhecimento adicional, adiciona ao prompt
    if knowledge:
        base_prompt += f"""

===========================================
BASE DE CONHECIMENTO ADICIONAL
===========================================
{knowledge}
===========================================

Use essas informações como referência ao avaliar ideias e responder perguntas.
"""
    
    return base_prompt.strip()

# Para compatibilidade com código existente - carrega na inicialização
SYSTEM_PROMPT = get_system_prompt()

# ============================================
# PROMPTS ADICIONAIS
# ============================================

PROMPT_VALIDATION = """
Analise a completude da ideia acima e identifique:
- Campos obrigatórios preenchidos
- Campos faltantes
- Qualidade das informações fornecidas
"""
