"""
Serviço de IA (Compatibilidade)
Mantém compatibilidade com código existente enquanto migra para arquitetura de agentes
"""
from agents.filtrador.agent import check_content_moderation, analyze_content
from agents.ideia.agent import (
    get_response as get_Sandbot_response,
    generate_response as generate_Sandbot_response,
    generate_idea_suggestions,
    validate_idea_completeness,
    generate_field_suggestion
)

# Exporta funções para compatibilidade
__all__ = [
    'check_content_moderation',
    'get_Sandbot_response',
    'generate_Sandbot_response',
    'generate_idea_suggestions',
    'validate_idea_completeness',
    'generate_field_suggestion'
]
