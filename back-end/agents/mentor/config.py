"""
Configurações do Agente Mentor
"""

# Configurações de temperatura
TEMPERATURE_SUGESTAO = 0.7  # Temperatura média para sugestões criativas
TEMPERATURE_CHAT = 0.7      # Temperatura média para conversas naturais

# Configurações de tokens
MAX_TOKENS_SUGESTAO = 500
MAX_TOKENS_CHAT = 400

# Histórico de chat
MAX_HISTORICO_MENSAGENS = 5  # Últimas N mensagens para contexto

# Campos do formulário
CAMPOS_FORMULARIO = [
    "title", "ideaTitle",
    "description", "ideaDescription",
    "problema", "objetivos", "metricas",
    "recursos", "cronograma"
]

