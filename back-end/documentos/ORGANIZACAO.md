# 📋 Guia de Organização - JuniBox Backend

## ✅ Estrutura Organizada

O projeto foi reorganizado para facilitar manutenção e edição:

```
back-end/
│
├── 📄 Arquivos Principais (Raiz)
│   ├── main.py              # Entrada da aplicação
│   ├── config.py            # Configurações principais
│   ├── firebase_config.py   # Setup Firebase
│   ├── schemas.py           # Validação de dados
│   ├── requirements.txt     # Dependências
│   └── setup.ps1            # Script de setup
│
├── 📂 config/               # ⚙️ Configurações Organizadas
│   ├── __init__.py
│   └── prompts.py           # 💬 PROMPTS DA IA (Edite aqui!)
│
├── 📂 services/             # 🧠 Lógica de Negócio
│   ├── ai.py                # Integração Groq
│   └── db.py                # Operações Firestore
│
├── 📂 routers/              # 🛣️ Endpoints da API
│   ├── chat.py
│   └── ideas.py
│
└── 📂 documentos/           # 📚 Documentação
    ├── README.md
    ├── SECURITY.md
    ├── ESTRUTURA.md
    └── ORGANIZACAO.md       # Este arquivo
```

## 🎯 Como Editar o Prompt

### ✅ Método Correto

1. Abra o arquivo: **`config/prompts.py`**
2. Edite a variável `SYSTEM_PROMPT`
3. Salve o arquivo
4. Reinicie o servidor

### ❌ Não Faça

- ❌ Não edite o prompt diretamente no `config.py`
- ❌ Não edite o prompt no `services/ai.py`

## 📝 Exemplo de Edição

**Arquivo:** `config/prompts.py`

```python
SYSTEM_PROMPT = """
Você é o avaliador oficial de ideias da CAIXA Econômica Federal.
Seu nome é JuniBox.

[Edite aqui o prompt conforme necessário]
"""
```

## 🔄 Fluxo de Importação

```
config/prompts.py
    ↓
config.py (importa SYSTEM_PROMPT)
    ↓
services/ai.py (usa SYSTEM_PROMPT)
```

## 📚 Documentação

Toda documentação está em `documentos/`:

- **README.md** - Guia completo de instalação e uso
- **SECURITY.md** - Boas práticas de segurança
- **ESTRUTURA.md** - Visualização da arquitetura
- **ORGANIZACAO.md** - Este guia

## 🎨 Vantagens da Nova Estrutura

✅ **Organizado** - Arquivos agrupados por função  
✅ **Fácil de editar** - Prompts em arquivo separado  
✅ **Limpo** - Raiz sem muitos arquivos  
✅ **Documentado** - Tudo em `documentos/`  
✅ **Manutenível** - Fácil de encontrar coisas  

## 🚀 Próximos Passos

1. Para editar o prompt: `config/prompts.py`
2. Para ver documentação: `documentos/`
3. Para configurar: `config.py` e `.env`

