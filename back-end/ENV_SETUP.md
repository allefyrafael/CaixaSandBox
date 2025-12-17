# 🔧 Configuração de Variáveis de Ambiente

## 📝 Criar arquivo `.env`

Crie um arquivo `.env` na pasta `back-end/` com o seguinte conteúdo:

```env
# Configurações do Servidor
HOST=0.0.0.0
PORT=8000
DEBUG=False

# Groq API (OBRIGATÓRIO)
GROQ_API_KEY=sua_chave_groq_aqui
GROQ_MODEL=llama-3.1-70b-versatile
GROQ_TIMEOUT=30

# Firebase
FIREBASE_PROJECT_ID=sandboxcaixa-84951
FIREBASE_CREDENTIALS_PATH=sandboxcaixa-84951-firebase-adminsdk-fbsvc-b9035301e8.json
```

## 🔑 Como obter as credenciais

### Groq API Key

1. Acesse: https://console.groq.com
2. Crie uma conta ou faça login
3. Vá em "API Keys"
4. Crie uma nova chave
5. Copie e cole no `.env` como `GROQ_API_KEY`

### Firebase Credentials

O arquivo `sandboxcaixa-84951-firebase-adminsdk-fbsvc-b9035301e8.json` já está na pasta `back-end/`.

**IMPORTANTE**: Este arquivo está no `.gitignore` e não será commitado.

Se precisar baixar novamente:
1. Acesse: https://console.firebase.google.com
2. Selecione o projeto `sandboxcaixa-84951`
3. Vá em "Configurações do Projeto" → "Contas de Serviço"
4. Clique em "Gerar nova chave privada"
5. Salve o arquivo JSON na pasta `back-end/`

## ✅ Verificar configuração

Após criar o `.env`, execute:

```bash
python main.py
```

Você deve ver:
```
🚀 Iniciando Innovation Orchestrator...
🤖 Groq API: ✅ Configurado
🔥 Firebase: ✅ Configurado
```

## 🔒 Segurança

- **NUNCA** commite o arquivo `.env`
- **NUNCA** commite arquivos de credenciais do Firebase
- Use `.env.example` como template (sem valores reais)
- Em produção, use variáveis de ambiente do servidor ou gerenciadores de segredos

## 📚 Mais informações

Consulte `SECURITY.md` para boas práticas de segurança.

