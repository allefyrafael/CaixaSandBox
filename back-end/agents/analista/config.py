"""
Configurações do Agente Analista
"""

# Configurações de temperatura
TEMPERATURE = 0.3  # Baixa temperatura para análises consistentes

# Configurações de tokens
MAX_TOKENS = 2000

# Limites de saída
MAX_RESUMO_CARACTERES = 140
MAX_TAGS = 5

# Valores padrão em caso de erro
VALORES_PADRAO = {
    "resumo_executivo": "Análise não disponível",
    "setor_responsavel": "Não definido",
    "nivel_complexidade": "Médio",
    "alinhamento_estrategico": 5,
    "categoria": "Inovação",
    "tags": []
}

# Níveis de complexidade válidos
COMPLEXIDADE_VALIDA = ["Baixo", "Médio", "Alto"]

# Range de alinhamento estratégico
ALINHAMENTO_MIN = 0
ALINHAMENTO_MAX = 10

