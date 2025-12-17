"""
Configurações do Agente Guardião
"""

# Configurações de temperatura para diferentes tipos de análise
TEMPERATURE = 0.2  # Baixa temperatura para decisões determinísticas

# Configurações de tokens
MAX_TOKENS = 500

# Configurações de comportamento
CONSERVATIVE_ON_ERROR = True  # Bloquear em caso de erro (mais seguro)

# Campos a validar
CAMPOS_VALIDACAO = ["titulo", "descricao", "problema"]

