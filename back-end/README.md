# Innovation Orchestrator - Backend

Sistema de Inovação Inteligente com Agentes Cognitivos baseado em FastAPI, Groq e Firebase.

## 🏗️ Arquitetura

### Componentes Principais

1. **FastAPI (O Maestro)**: Centraliza o tráfego e delega para os agentes
2. **Groq (O Cérebro Rápido)**: LPU para inferência quase instantânea
3. **Firebase (A Memória Viva)**: Armazena ideias, metadados e histórico de chat
4. **Base de Conhecimento**: Arquivos `.txt` que moldam o comportamento dos agentes

### Agentes Cognitivos

#### Agente 01: O Guardião
- **Função**: Filtro de segurança e contexto
- **Momento**: Antes de salvar no Firebase
- **Decisão**: APROVADO ou REPROVADO
- **Lógica**: Permite críticas sobre processos, bloqueia ataques pessoais

#### Agente 02: O Mentor
- **Função**: Ideação e refinamento
- **Gatilho**: Botão "Ajude-me a melhorar" ou Chat
- **Abordagem**: Perguntas socráticas, não respostas prontas
- **Contexto**: Lê formulário atual + objetivos estratégicos

#### Agente 03: O Analista
- **Função**: Classificação e insights
- **Momento**: Pós-aprovação do Guardião
- **Saída**: Metadados estruturados (resumo, setor, complexidade, alinhamento)

## 🚀 Instalação

### 1. Criar ambiente virtual

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Instalar dependências

```bash
pip install -r requirements.txt
```

### 3. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

**Windows:**
```powershell
Copy-Item .env.example .env
```

Edite `.env` com suas credenciais:
- `GROQ_API_KEY`: **OBRIGATÓRIO** - Obtenha em https://console.groq.com
- `FIREBASE_CREDENTIALS_PATH`: O arquivo de credenciais já está na pasta. Se não estiver, baixe do Firebase Console ou deixe vazio para usar ADC.

> 📝 **Nota**: O arquivo de credenciais do Firebase (`sandboxcaixa-84951-firebase-adminsdk-*.json`) já está na pasta e está protegido pelo `.gitignore`. Não será commitado.

### 4. Configurar Firebase

**Opção A: Application Default Credentials (Recomendado)**
```bash
gcloud auth application-default login
```

**Opção B: Arquivo de credenciais**
1. Baixe o arquivo JSON do Firebase Console
2. Defina `FIREBASE_CREDENTIALS_PATH` no `.env`

### 5. Executar servidor

```bash
python main.py
```

Ou com uvicorn diretamente:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

A API estará disponível em: `http://localhost:8000`

Documentação interativa: `http://localhost:8000/docs`

## 📁 Estrutura do Projeto

```
back-end/
├── main.py                 # Aplicação FastAPI principal
├── config/
│   ├── settings.py        # Configurações centralizadas
│   └── __init__.py
├── models/
│   ├── schemas.py         # Schemas Pydantic
│   └── __init__.py
├── routers/
│   ├── ideas.py           # Endpoints de ideias
│   ├── chat.py            # Endpoints de chat
│   └── __init__.py
├── agents/
│   ├── guardiao.py        # Agente Guardião
│   ├── mentor.py          # Agente Mentor
│   ├── analista.py        # Agente Analista
│   └── __init__.py
├── services/
│   ├── groq_client.py     # Cliente Groq
│   ├── firebase_client.py # Cliente Firebase
│   └── __init__.py
├── requirements.txt
├── .env.example
└── README.md
```

## 🔄 Fluxo de Valor

### 1. Preenchimento Assistido
- Usuário preenche formulário
- Pode solicitar ajuda do Agente Mentor
- Autosave periódico no Firebase

### 2. Submissão (Checkpoint)
- Usuário clica "Enviar"
- **Agente Guardião** valida conteúdo
- Se reprovado: retorna erro 400 com mensagem educativa
- Se aprovado: segue para próximo passo

### 3. Enriquecimento
- **Agente Analista** gera metadados
- Classificação, resumo, setor responsável, etc.
- Metadados anexados à ideia

### 4. Persistência
- Ideia completa salva no Firebase
- Status atualizado para "submitted"
- Retorna ID e mensagem de sucesso

## 📡 Endpoints Principais

### Ideias

- `POST /api/ideas/` - Criar nova ideia
- `GET /api/ideas/{user_id}/{idea_id}` - Buscar ideia
- `GET /api/ideas/{user_id}` - Listar ideias do usuário
- `PATCH /api/ideas/{user_id}/{idea_id}` - Atualizar ideia (autosave)
- `POST /api/ideas/{user_id}/{idea_id}/submit` - Submeter ideia (com validação)
- `PUT /api/ideas/{user_id}/{idea_id}/status` - Atualizar status
- `DELETE /api/ideas/{user_id}/{idea_id}` - Deletar ideia

### Chat

- `POST /api/chat/send` - Enviar mensagem
- `GET /api/chat/history/{user_id}/{idea_id}` - Histórico de chat
- `DELETE /api/chat/history/{user_id}/{idea_id}` - Limpar histórico
- `POST /api/chat/suggest-field` - Sugestão para campo específico
- `GET /api/chat/suggestions/{user_id}/{idea_id}` - Sugestões gerais
- `GET /api/chat/validate/{user_id}/{idea_id}` - Validar completude

## 🧠 Base de Conhecimento

Cada agente possui sua própria base de conhecimento na pasta `agents/{agente}/conhecimento.txt`:

- **Agente Guardião**: Código de conduta e regras de moderação
- **Agente Mentor**: Objetivos estratégicos e princípios de mentoria
- **Agente Analista**: Objetivos estratégicos e taxonomia interna

Para atualizar o comportamento de um agente, edite o arquivo `conhecimento.txt` correspondente. O sistema recarrega automaticamente na primeira execução (cache).

## 🔧 Configuração Avançada

### Modelos Groq Disponíveis

- `llama-3.1-70b-versatile` (padrão)
- `llama-3.1-8b-instant`
- `mixtral-8x7b-32768`

Altere `GROQ_MODEL` no `.env` para usar outro modelo.

### Timeouts

Ajuste `GROQ_TIMEOUT` no `.env` se necessário (padrão: 30 segundos).

## 🐛 Troubleshooting

### Erro: "GROQ_API_KEY não configurada"
- Verifique se `.env` existe e contém `GROQ_API_KEY`
- Certifique-se de que o arquivo está na raiz do projeto

### Erro: "Erro ao conectar com Firebase"
- Verifique se o Firestore está habilitado no projeto
- Confirme as credenciais do Firebase
- Teste com `gcloud auth application-default login`

### Erro: "Arquivo não encontrado na base de conhecimento"
- Verifique se o arquivo `conhecimento.txt` existe na pasta do agente
- Confirme que o arquivo está em `agents/{agente}/conhecimento.txt`

## 📝 Notas de Desenvolvimento

- Os agentes usam **RAG simplificado** via injeção de contexto
- Não há fine-tuning de modelos
- Todos os prompts seguem estrutura: **Persona + Contexto + Tarefa + Formato**
- O sistema é stateless (exceto Firebase)
- Agente Guardião tem temperatura baixa (0.2) para decisões determinísticas
- Agente Analista tem temperatura baixa (0.3) para análises consistentes
- Agente Mentor tem temperatura média (0.7) para respostas mais naturais

## 📄 Licença

Projeto desenvolvido para o Sandbox CAIXA.

