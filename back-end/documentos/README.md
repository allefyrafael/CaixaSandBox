# 🏗️ JuniBox Backend - FastAPI + Firebase + Groq AI

Backend do sistema JuniBox, focado em gestão de ideias com assistência de IA contextual.

## 📋 Características

- **Autosave Inteligente**: Sistema de salvamento automático otimizado (Lazy Save)
- **IA Contextual**: Assistente JuniBox powered by Groq (Llama 3.3)
- **Firebase Firestore**: Banco de dados NoSQL escalável (opcional)
- **API RESTful**: Endpoints bem documentados com FastAPI
- **Validação de Dados**: Schemas Pydantic para segurança
- **Chat Simplificado**: Funciona sem Firebase para testes rápidos

## 🏛️ Arquitetura

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
│   ├── prompts.py                # 💬 Prompt base da IA (editável)
│   ├── knowledge_loader.py        # 📚 Carregador de base de conhecimento
│   └── 📂 knowledge/              # 📖 Base de conhecimento adicional
│       ├── README.md              # 📋 Documentação da base de conhecimento
│       ├── regras_caixa.txt       # 📝 Regras e diretrizes
│       └── criterios_avaliacao.txt # 📝 Critérios de avaliação
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
    ├── README.md                 # 📖 Este arquivo
    ├── SECURITY.md               # 🔒 Guia de segurança
    ├── ESTRUTURA.md              # 📁 Visualização da arquitetura
    └── ORGANIZACAO.md            # 📋 Guia de organização
```

## 🗄️ Estrutura do Banco de Dados (Firestore)

```
users (Coleção)
 └── {user_id} (Documento)
      └── ideas (Sub-coleção)
           └── {idea_id} (Documento)
                ├── title: string
                ├── description: string
                ├── target_audience: string
                ├── status: "draft" | "submitted"
                ├── last_updated: timestamp
                │
                └── chat (Sub-coleção)
                     └── {msg_id} (Documento)
                          ├── role: "user" | "assistant"
                          ├── content: string
                          └── timestamp: timestamp
```

## 🚀 Como Rodar

### 1. Pré-requisitos

- **Python 3.9+** (recomendado: Python 3.11 ou 3.12)
- **Conta no [Groq Cloud](https://console.groq.com/)** (para IA)
- **Projeto no [Firebase](https://console.firebase.google.com/)** (opcional, apenas para endpoints completos)

### 2. Configuração do Firestore

Antes de usar os endpoints que requerem Firebase, você precisa criar o banco de dados Firestore:

1. **Acesse o Console do Firebase:**
   - Link direto: https://console.cloud.google.com/firestore/databases?project=sandboxcaixa-84951
   - Ou acesse: https://console.firebase.google.com/project/sandboxcaixa-84951/firestore

2. **Crie o banco de dados:**
   - Clique em "Criar banco de dados" ou "Create database"
   - Escolha o modo **Native** (recomendado para novos projetos)
   - Selecione a localização (ex: `us-central` ou `southamerica-east1` para Brasil)
   - Aguarde a criação (pode levar alguns minutos)

3. **Verifique a criação:**
   - Após criar, você verá a interface do Firestore
   - O banco estará pronto para uso

**Importante:** Sem criar o banco de dados, os endpoints que requerem Firebase retornarão erro 503 com mensagem clara indicando que o banco precisa ser criado.

### 3. Instalação Rápida

#### Opção A: Script Automático (Windows)

**Nota:** Certifique-se de ter criado o banco de dados Firestore antes de usar endpoints que requerem Firebase (veja seção anterior).

```powershell
cd back-end
.\setup.ps1
```

#### Opção B: Instalação Manual

```bash
# Navegue até a pasta do backend
cd back-end

# Crie um ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt
```

### 3. Configuração

#### a) Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Edite o arquivo `.env` e adicione suas credenciais:

```env
GROQ_API_KEY=gsk_sua_chave_aqui
FIREBASE_CREDENTIALS_PATH=firebase_credentials.json
```

#### b) Groq API Key (Obrigatório)

1. Acesse [Groq Console](https://console.groq.com/)
2. Crie uma conta (se ainda não tiver)
3. Vá em **API Keys**
4. Crie uma nova chave e copie para o `.env`

#### c) Firebase (Opcional - apenas para endpoints completos)

1. **Credenciais do Firebase:**
   - Acesse o [Console do Firebase](https://console.firebase.google.com/)
   - Crie um novo projeto (ou use um existente)
   - Vá em **Configurações do Projeto** > **Contas de Serviço**
   - Clique em **Gerar nova chave privada**
   - Salve o arquivo JSON como `sandboxcaixa-84951-firebase-adminsdk-fbsvc-b9035301e8.json` na pasta `back-end/`

2. **Criar Banco de Dados Firestore:**
   - **IMPORTANTE**: Após configurar as credenciais, você **deve criar o banco de dados Firestore**
   - Acesse: https://console.cloud.google.com/firestore/databases?project=sandboxcaixa-84951
   - Clique em **"Criar banco de dados"** ou **"Create database"**
   - Escolha o modo **Native** (recomendado para novos projetos)
   - Selecione a localização (ex: `us-central` ou `southamerica-east1` para Brasil)
   - Aguarde a criação (pode levar alguns minutos)
   - Após criar, o banco estará pronto para uso

> **Nota**: O chat simplificado (`POST /api/chat/`) funciona **sem Firebase**!  
> **Aviso**: Sem criar o banco de dados, endpoints que requerem Firebase retornarão erro 503 com mensagem clara.

### 4. Executar o Servidor

```bash
# Certifique-se de estar no ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Desenvolvimento (com reload automático)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Produção
uvicorn main:app --host 0.0.0.0 --port 8000
```

O servidor estará disponível em: **http://localhost:8000**

## 📚 Documentação da API

Após iniciar o servidor, acesse:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔌 Endpoints Principais

### Chat

| Método | Endpoint | Descrição | Firebase |
|--------|----------|-----------|----------|
| POST | `/api/chat/` | **Chat simplificado** (sem Firebase) | ❌ Não |
| POST | `/api/chat/send` | Enviar mensagem ao JuniBox | ✅ Sim |
| GET | `/api/chat/history/{user_id}/{idea_id}` | Buscar histórico | ✅ Sim |
| DELETE | `/api/chat/history/{user_id}/{idea_id}` | Limpar histórico | ✅ Sim |
| GET | `/api/chat/suggestions/{user_id}/{idea_id}` | Gerar sugestões de IA | ✅ Sim |
| GET | `/api/chat/validate/{user_id}/{idea_id}` | Validar completude da ideia | ✅ Sim |

### Ideias

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/ideas/` | Criar nova ideia |
| PATCH | `/api/ideas/{user_id}/{idea_id}` | **Autosave** - Atualizar campos |
| GET | `/api/ideas/{user_id}/{idea_id}` | Buscar ideia específica |
| GET | `/api/ideas/{user_id}` | Listar ideias do usuário |
| DELETE | `/api/ideas/{user_id}/{idea_id}` | Deletar ideia |
| PUT | `/api/ideas/{user_id}/{idea_id}/status` | Atualizar status |

## 💡 Exemplo de Uso

### Chat Simplificado (Sem Firebase)

```bash
curl -X POST "http://localhost:8000/api/chat/" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tenho uma ideia de app para a Caixa",
    "history": []
  }'
```

**Resposta:**
```json
{
  "response": "Olá! Sou o JuniBox, avaliador oficial de ideias da CAIXA. Como posso ajudar você a estruturar sua ideia?"
}
```

### Chat com Histórico

```bash
curl -X POST "http://localhost:8000/api/chat/" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "É um app de reciclagem",
    "history": [
      {
        "role": "user",
        "content": "Tenho uma ideia de app para a Caixa"
      },
      {
        "role": "assistant",
        "content": "Olá! Sou o JuniBox. Conte-me mais sobre sua ideia."
      }
    ]
  }'
```

## 🎨 Como Editar o Prompt do JuniBox

O sistema de prompts do JuniBox funciona em duas camadas:

### 1. Prompt Base (`config/prompts.py`)

**Este arquivo é necessário** e contém o prompt principal do sistema. Edite para alterar o comportamento fundamental da IA:

```python
def get_system_prompt() -> str:
    base_prompt = """
Você é o avaliador oficial de ideias da CAIXA Econômica Federal no programa Sandbox.
Seu nome é JuniBox.

Sua função é:
1. Se apresentar como JuniBox.
2. Estruturar a ideia enviada pelo usuário.
...
"""
    # O prompt base é combinado com a base de conhecimento
    knowledge = load_knowledge_base()
    # ...
```

### 2. Base de Conhecimento (`config/knowledge/`)

Arquivos `.txt` ou `.md` nesta pasta são carregados automaticamente e adicionados ao prompt como contexto adicional. Use para:

- Regras e diretrizes da CAIXA
- Critérios de avaliação
- Exemplos e boas práticas
- Informações sobre o programa Sandbox

**Exemplo**: Adicione `regras_caixa.txt` com regras específicas que serão incluídas automaticamente no prompt.

### Como Funciona

1. O `prompts.py` define o prompt base (personalidade e função do JuniBox)
2. Os arquivos em `knowledge/` são carregados e adicionados como contexto adicional
3. Ambos são combinados no `SYSTEM_PROMPT` final

### Aplicar Mudanças

Após editar qualquer arquivo:
- **Prompt base**: Reinicie o servidor (`uvicorn main:app --reload`)
- **Base de conhecimento**: Reinicie o servidor (arquivos são carregados na inicialização)

> 📖 Consulte `config/knowledge/README.md` para mais detalhes sobre a base de conhecimento.

## 💡 Estratégia de Autosave

O sistema implementa **Lazy Save** para otimizar performance:

### Frontend (Recomendado)

```javascript
// 1. Estado local + localStorage
const [ideaData, setIdeaData] = useState({});
const [isDirty, setIsDirty] = useState(false);

// 2. Ao digitar
const handleChange = (field, value) => {
  setIdeaData({...ideaData, [field]: value});
  setIsDirty(true);
  localStorage.setItem('idea_draft', JSON.stringify({...ideaData, [field]: value}));
};

// 3. Debounce (3 segundos)
useEffect(() => {
  if (!isDirty) return;
  
  const timer = setTimeout(async () => {
    await fetch(`/api/ideas/${userId}/${ideaId}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(ideaData)
    });
    setIsDirty(false);
  }, 3000);
  
  return () => clearTimeout(timer);
}, [ideaData, isDirty]);
```

### Backend

O endpoint `PATCH /api/ideas/{user_id}/{idea_id}`:
- Aceita campos parciais
- Usa `merge=True` no Firestore
- Adiciona timestamp automático
- Retorna confirmação de salvamento

## 🧠 Como Funciona o JuniBox (IA)

1. **Contexto da Ideia**: A IA recebe todos os dados atuais (título, descrição, público-alvo)
2. **Histórico de Chat**: Mantém contexto das últimas 10 mensagens
3. **Prompt Personalizado**: 
   - **Prompt Base**: Definido em `config/prompts.py` (personalidade e função do JuniBox)
   - **Base de Conhecimento**: Arquivos `.txt`/`.md` em `config/knowledge/` (regras, critérios, diretrizes)
   - Ambos são combinados automaticamente no `SYSTEM_PROMPT` final
4. **Modelo**: Llama 3.3 70B via Groq (rápido e eficiente)

## 🔒 Segurança

- ✅ CORS configurado (ajuste `allow_origins` em `main.py` para produção)
- ✅ Validação de dados com Pydantic
- ✅ Credenciais em variáveis de ambiente (`.env` no `.gitignore`)
- ✅ Arquivo `.env` protegido do Git
- ⚠️ **TODO**: Implementar autenticação de usuários
- ⚠️ **TODO**: Rate limiting para endpoints de IA

> 📖 Consulte `documentos/SECURITY.md` para mais detalhes sobre segurança.

## 🧪 Testes

```bash
# Instalar dependências de teste
pip install pytest httpx

# Rodar testes
pytest
```

## 📦 Deploy

### Railway / Render / Heroku

1. Configure as variáveis de ambiente na plataforma:
   - `GROQ_API_KEY`
   - `FIREBASE_CREDENTIALS_PATH` (se usar Firebase)
2. Adicione o `firebase_credentials.json` como secret (se usar Firebase)
3. Use o comando: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Docker (Opcional)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Integração com Frontend

O frontend deve estar configurado para:

1. **Autosave**: Debounce de 3 segundos antes de chamar `PATCH /api/ideas/...`
2. **Chat Simplificado**: Enviar mensagens para `POST /api/chat/` (sem Firebase)
3. **Chat Completo**: Enviar mensagens para `POST /api/chat/send` (com Firebase)
4. **Sugestões**: Buscar sugestões em `GET /api/chat/suggestions/...`

## 📝 Próximos Passos

- [ ] Implementar autenticação (JWT ou Firebase Auth)
- [ ] Adicionar rate limiting
- [ ] Implementar cache (Redis)
- [ ] Adicionar testes unitários
- [ ] Implementar webhooks para notificações
- [ ] Adicionar suporte a anexos/imagens

## 🐛 Troubleshooting

### Firebase não inicializa

- Verifique se o arquivo `firebase_credentials.json` está na pasta `back-end/`
- Confirme que o path no `.env` está correto
- **Nota**: Firebase é opcional! Use `/api/chat/` para chat sem Firebase

### Groq API retorna erro

- Verifique se a API key está correta no `.env`
- Confirme que tem créditos disponíveis na conta Groq
- Verifique rate limits da API

### CORS errors

- Ajuste `allow_origins` em `main.py` para incluir o domínio do frontend
- Em desenvolvimento, `["*"]` funciona, mas em produção especifique os domínios

### Erro ao importar módulos

- Certifique-se de estar no ambiente virtual: `venv\Scripts\activate`
- Reinstale as dependências: `pip install -r requirements.txt`

### Python 3.14 - Problemas de compatibilidade

- Use Python 3.11 ou 3.12 para melhor compatibilidade
- Se usar Python 3.14, pode haver problemas com `pydantic-core`

## 📚 Documentação Adicional

- **SECURITY.md** - Guia completo de segurança
- **ESTRUTURA.md** - Visualização detalhada da arquitetura
- **ORGANIZACAO.md** - Guia de organização do projeto

## 📄 Licença

Este projeto é parte do Sandbox CAIXA.

---

**Desenvolvido com ❤️ usando FastAPI, Firebase e Groq AI**
