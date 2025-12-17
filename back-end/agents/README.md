# Agentes Cognitivos

Estrutura modular de agentes, cada um com sua própria pasta, configuração e conhecimento.

## 📁 Estrutura

```
agents/
├── guardiao/          # Agente Guardião - Filtro de Segurança
│   ├── __init__.py
│   ├── agent.py       # Lógica do agente
│   ├── config.py      # Configurações específicas
│   └── conhecimento.txt
│
├── mentor/            # Agente Mentor - Ideação e Refinamento
│   ├── __init__.py
│   ├── agent.py
│   ├── config.py
│   └── conhecimento.txt
│
└── analista/          # Agente Analista - Classificação e Insights
    ├── __init__.py
    ├── agent.py
    ├── config.py
    └── conhecimento.txt
```

## 🎯 Agente Guardião

**Função**: Filtro de segurança e contexto  
**Momento**: Antes de salvar no Firebase  
**Decisão**: APROVADO ou REPROVADO

### Configurações (`config.py`)
- `TEMPERATURE`: 0.2 (decisões determinísticas)
- `MAX_TOKENS`: 500
- `CONSERVATIVE_ON_ERROR`: True (bloquear em caso de erro)

### Conhecimento (`conhecimento.txt`)
- Código de conduta
- Regras de moderação
- Diferença entre crítica construtiva e ataque pessoal

## 🧠 Agente Mentor

**Função**: Ideação e refinamento  
**Gatilho**: Botão "Ajude-me a melhorar" ou Chat  
**Abordagem**: Perguntas socráticas

### Configurações (`config.py`)
- `TEMPERATURE_SUGESTAO`: 0.7
- `TEMPERATURE_CHAT`: 0.7
- `MAX_HISTORICO_MENSAGENS`: 5

### Conhecimento (`conhecimento.txt`)
- Objetivos estratégicos 2025
- Princípios do mentor
- Campos obrigatórios

## 📊 Agente Analista

**Função**: Classificação e insights  
**Momento**: Pós-aprovação do Guardião  
**Saída**: Metadados estruturados

### Configurações (`config.py`)
- `TEMPERATURE`: 0.3 (análises consistentes)
- `MAX_RESUMO_CARACTERES`: 140
- `MAX_TAGS`: 5

### Conhecimento (`conhecimento.txt`)
- Objetivos estratégicos 2025
- Taxonomia interna (departamentos, categorias)
- Níveis de complexidade

## 🔧 Como Usar

### Importar um agente

```python
from agents.guardiao import AgenteGuardiao
from agents.mentor import AgenteMentor
from agents.analista import AgenteAnalista
```

### Instanciar e usar

```python
# Agente Guardião
guardiao = AgenteGuardiao()
aprovado, justificativa = await guardiao.validar(titulo, descricao, problema)

# Agente Mentor
mentor = AgenteMentor()
sugestao = await mentor.sugerir_melhoria(contexto_atual, campo_foco="metricas")

# Agente Analista
analista = AgenteAnalista()
metadados = await analista.analisar(ideia_completa)
```

## 📝 Personalização

Para personalizar um agente:

1. **Configurações**: Edite `config.py` do agente
2. **Conhecimento**: Edite `conhecimento.txt` do agente
3. **Lógica**: Edite `agent.py` do agente

Cada agente carrega seu próprio conhecimento automaticamente na primeira execução (cache).

## 🚀 Vantagens da Estrutura Modular

- ✅ Isolamento: Cada agente é independente
- ✅ Manutenção: Fácil localizar e editar código
- ✅ Escalabilidade: Adicionar novos agentes é simples
- ✅ Testabilidade: Testar cada agente isoladamente
- ✅ Configuração: Ajustes específicos por agente
- ✅ Conhecimento: Base de conhecimento dedicada

