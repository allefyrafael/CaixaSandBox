# 📁 Estrutura do Projeto - Sandbot Backend

## 🗂️ Organização dos Arquivos

```
back-end/
│
├── 📄 main.py                    # 🚀 Entrada da aplicação (FastAPI)
├── 📄 config.py                  # ⚙️ Configurações principais
├── 📄 firebase_config.py         # 🔥 Inicialização do Firebase
├── 📄 schemas.py                 # 📋 Modelos de validação (Pydantic)
├── 📄 requirements.txt           # 📦 Dependências Python
├── 📄 setup.ps1                  # 🛠️ Script de setup automático
│
├── 📂 config/                    # ⚙️ Configurações organizadas
│   ├── __init__.py
│   └── prompts.py                # 💬 Prompts da IA (fácil de editar)
│
├── 📂 services/                  # 🧠 Lógica de negócio
│   ├── __init__.py
│   ├── ai.py                     # 🤖 Integração com Groq AI
│   └── db.py                     # 💾 Operações no Firestore
│
├── 📂 routers/                   # 🛣️ Endpoints da API
│   ├── __init__.py
│   ├── chat.py                   # 💬 Rotas de chat
│   └── ideas.py                  # 💡 Rotas de ideias
│
└── 📂 documentos/                # 📚 Documentação
    ├── README.md                 # 📖 Documentação principal
    ├── SECURITY.md               # 🔒 Guia de segurança
    └── ESTRUTURA.md             # 📁 Este arquivo
```

## 🎯 Onde Editar o Prompt

Para editar o prompt do Sandbot, abra:

**`config/prompts.py`**

Este arquivo contém todos os prompts usados pela IA, facilitando a edição sem mexer no código principal.

## 📝 Arquivos na Raiz

Apenas arquivos essenciais ficam na raiz:

- `main.py` - Entrada da aplicação
- `config.py` - Configurações principais
- `firebase_config.py` - Setup do Firebase
- `schemas.py` - Validação de dados
- `requirements.txt` - Dependências
- `setup.ps1` - Script de setup

## 📚 Documentação

Toda a documentação está na pasta `documentos/`:

- `README.md` - Guia completo
- `SECURITY.md` - Boas práticas de segurança
- `ESTRUTURA.md` - Este arquivo

