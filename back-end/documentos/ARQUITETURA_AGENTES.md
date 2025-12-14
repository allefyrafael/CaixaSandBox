# 🤖 Arquitetura de Agentes - Sandbox CAIXA

## 📋 Visão Geral

O sistema foi reestruturado para usar uma arquitetura modular com **dois agentes especializados**:

1. **🛡️ Agente Filtrador** - Moderação antes de salvar
2. **💡 Agente de Ideia (Sandbot)** - Assistência na ideação

## 🏗️ Estrutura de Pastas

```
back-end/
├── agents/                    # 🤖 Agentes de IA
│   ├── __init__.py
│   ├── README.md              # Documentação dos agentes
│   │
│   ├── filtrador/             # 🛡️ Agente Filtrador
│   │   ├── __init__.py
│   │   ├── agent.py           # Lógica do agente
│   │   ├── prompts.py         # Prompts de moderação
│   │   └── router.py          # Rotas: /api/agents/filtrador/*
│   │
│   └── ideia/                 # 💡 Agente de Ideia (Sandbot)
│       ├── __init__.py
│       ├── agent.py           # Lógica do agente
│       ├── prompts.py         # Prompts de ideação
│       └── router.py          # Rotas: /api/agents/ideia/*
│
├── routers/                   # Rotas legadas (compatibilidade)
│   ├── chat.py                # Usa Agente de Ideia
│   └── ideas.py               # Usa Agente Filtrador
│
└── services/                  # Serviços auxiliares
    ├── ai.py                  # Wrapper de compatibilidade
    └── db.py                  # Operações no Firestore
```

## 🛡️ Agente Filtrador

### Responsabilidade
Moderação de conteúdo **ANTES** de salvar no banco de dados.

### O que detecta:
1. **Conteúdo Inapropriado:**
   - Xingamentos e palavrões (ex: "arrombada", "caralho", "puta", "foda", "porra", "merda", "bosta", "cu", "buceta", "pau", "pica", "piroca", "rola", "viado", "veado", "bicha", etc.)
   - Trocadilhos maliciosos (ex: "Arthur Gay" como título)
   - Tentativas de evasão (ex: "p0rr4", "f0d4", "c4r4lh0")
   - Palavras escritas de forma diferente (ex: "pUtA", "cArAlHo")

2. **Críticas Destrutivas:**
   - Críticas à empresa sem proposta construtiva
   - Reclamações sem contexto de inovação
   - Ataques pessoais ou institucionais

3. **Fora de Contexto:**
   - Conteúdo que não tem relação com inovação
   - Spam ou conteúdo irrelevante
   - Tentativas de jailbreak

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/agents/filtrador/analyze` | Análise completa de conteúdo |
| POST | `/api/agents/filtrador/check` | Verificação simplificada |

### Exemplo de Uso

```python
from agents.filtrador.agent import analyze_content

# Analisar conteúdo
result = analyze_content("Arrombada", field_name="title")

if result["is_inappropriate"]:
    print(f"Bloqueado: {result['reason']}")
    print(f"Categoria: {result['category']}")
    print(f"Texto ofensivo: {result['offensive_text']}")
```

### Resposta

```json
{
    "is_inappropriate": true,
    "category": "conteudo_inapropriado",
    "reason": "Contém xingamento ou palavrão",
    "offensive_text": "Arrombada"
}
```

## 💡 Agente de Ideia (Sandbot)

### Responsabilidade
Assistência na ideação e estruturação de propostas de inovação.

### Funções:
- ✅ Guiar usuário no preenchimento do formulário
- ✅ Gerar sugestões para campos opcionais
- ✅ Validar completude da ideia
- ✅ Fornecer feedback e melhorias

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/agents/ideia/chat` | Chat simplificado (sem Firebase) |
| POST | `/api/agents/ideia/send` | Chat completo (com Firebase) |
| POST | `/api/agents/ideia/suggest-field` | Sugestão para campo específico |
| GET | `/api/agents/ideia/suggestions/{user_id}/{idea_id}` | Sugestões gerais |
| GET | `/api/agents/ideia/validate/{user_id}/{idea_id}` | Validação de completude |

### Exemplo de Uso

```python
from agents.ideia.agent import generate_response

response = generate_response(
    message="Minha ideia é criar um app de reciclagem",
    history=[],
    idea_context={"title": "App de Reciclagem"},
    form_context={"step_name": "Sua Ideia"}
)
```

## 🔄 Fluxo de Trabalho

```
┌─────────────────┐
│  Usuário digita │
│     conteúdo    │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Agente Filtrador    │
│  (Moderação)        │
└────────┬────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  ❌ Bloqueado  ✅ Aprovado
    │         │
    │         ▼
    │    ┌──────────────────┐
    │    │ Salva no banco   │
    │    └────────┬─────────┘
    │             │
    │             ▼
    │    ┌──────────────────┐
    │    │ Agente de Ideia  │
    │    │  (Sandbot)       │
    │    └──────────────────┘
    │
    └─── Retorna erro ao usuário
```

## 🚀 Vantagens

1. **Performance:** Filtrador bloqueia antes de salvar, economizando recursos do banco
2. **Separação de Responsabilidades:** Cada agente tem função específica
3. **Manutenibilidade:** Código organizado e fácil de entender
4. **Escalabilidade:** Fácil adicionar novos agentes
5. **Testabilidade:** Cada agente pode ser testado independentemente
6. **Inteligência:** IA detecta contexto, não apenas palavras isoladas

## 📝 Compatibilidade

O código antigo em `services/ai.py` foi mantido como **wrapper de compatibilidade**.
As rotas legadas (`/api/chat/*` e `/api/ideas/*`) continuam funcionando, mas agora usam os agentes internamente.

**Novos desenvolvimentos devem usar diretamente os agentes:**
- `agents.filtrador.agent` para moderação
- `agents.ideia.agent` para ideação

## 🔧 Configuração

Ambos os agentes usam:
- **Modelo:** Llama 3.3 70B (via Groq)
- **Temperatura Filtrador:** 0.1 (muito rigoroso)
- **Temperatura Ideia:** 0.2 (baixa criatividade, segue regras)

## 📚 Documentação Adicional

- `agents/README.md` - Documentação detalhada dos agentes
- `config/prompts.py` - Prompts base (legado, será migrado)
- `config/knowledge/` - Base de conhecimento compartilhada

