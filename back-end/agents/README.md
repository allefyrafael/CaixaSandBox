# 🤖 Arquitetura de Agentes

Sistema modular com dois agentes especializados para diferentes funções.

## 📁 Estrutura

```
agents/
├── filtrador/          # Agente Filtrador (Moderação)
│   ├── __init__.py
│   ├── agent.py        # Lógica do agente
│   ├── prompts.py      # Prompts de moderação
│   └── router.py       # Rotas do filtrador
│
└── ideia/              # Agente de Ideia (JuniBox)
    ├── __init__.py
    ├── agent.py        # Lógica do agente
    ├── prompts.py      # Prompts de ideação
    └── router.py       # Rotas do agente de ideia
```

## 🛡️ Agente Filtrador

**Responsabilidade:** Moderação de conteúdo ANTES de salvar no banco de dados.

**Detecta:**
- ✅ Conteúdo inapropriado (xingamentos, palavrões, trocadilhos maliciosos)
- ✅ Críticas destrutivas sem proposta construtiva
- ✅ Conteúdo fora de contexto
- ✅ Tentativas de evasão (p0rr4, f0d4, etc.)

**Endpoints:**
- `POST /api/agents/filtrador/analyze` - Análise completa de conteúdo
- `POST /api/agents/filtrador/check` - Verificação simplificada

**Uso:**
```python
from agents.filtrador.agent import analyze_content

result = analyze_content("Arrombada", field_name="title")
if result["is_inappropriate"]:
    print(f"Bloqueado: {result['reason']}")
```

## 💡 Agente de Ideia (JuniBox)

**Responsabilidade:** Assistência na ideação e estruturação de propostas.

**Funções:**
- ✅ Guiar usuário no preenchimento do formulário
- ✅ Gerar sugestões para campos opcionais
- ✅ Validar completude da ideia
- ✅ Fornecer feedback e melhorias

**Endpoints:**
- `POST /api/agents/ideia/chat` - Chat simplificado (sem Firebase)
- `POST /api/agents/ideia/send` - Chat completo (com Firebase)
- `POST /api/agents/ideia/suggest-field` - Sugestão para campo específico
- `GET /api/agents/ideia/suggestions/{user_id}/{idea_id}` - Sugestões gerais
- `GET /api/agents/ideia/validate/{user_id}/{idea_id}` - Validação de completude

**Uso:**
```python
from agents.ideia.agent import generate_response

response = generate_response(
    message="Minha ideia é...",
    history=[],
    idea_context={},
    form_context={}
)
```

## 🔄 Fluxo de Trabalho

```
Usuário digita conteúdo
    ↓
Agente Filtrador analisa
    ↓
Se apropriado → Salva no banco
    ↓
Agente de Ideia ajuda na estruturação
    ↓
Usuário completa formulário
```

## 🚀 Vantagens da Arquitetura

1. **Separação de Responsabilidades:** Cada agente tem uma função específica
2. **Performance:** Filtrador bloqueia antes de salvar, economizando recursos
3. **Manutenibilidade:** Código organizado e fácil de entender
4. **Escalabilidade:** Fácil adicionar novos agentes
5. **Testabilidade:** Cada agente pode ser testado independentemente

## 📝 Migração

O código antigo em `services/ai.py` foi mantido como wrapper de compatibilidade.
Novos desenvolvimentos devem usar diretamente os agentes.

