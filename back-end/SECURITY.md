# 🔒 Segurança - Credenciais e Configuração

## ⚠️ IMPORTANTE: Arquivos Sensíveis

Os seguintes arquivos contêm informações sensíveis e **NÃO devem ser commitados** no Git:

- `.env` - Variáveis de ambiente com chaves de API
- `*-firebase-adminsdk-*.json` - Credenciais do Firebase Admin SDK
- Qualquer arquivo com `credentials` no nome

## 📋 Checklist de Segurança

### ✅ Antes de fazer commit:

1. **Verifique o `.gitignore`**
   - Certifique-se de que arquivos sensíveis estão listados
   - Execute: `git status` para verificar o que será commitado

2. **Nunca commite:**
   - Arquivos `.env` com valores reais
   - Arquivos de credenciais do Firebase
   - Chaves de API ou tokens

3. **Use `.env.example` como template**
   - Mantenha valores de exemplo
   - Documente variáveis necessárias

## 🔧 Configuração Segura

### Opção 1: Arquivo de Credenciais (Desenvolvimento Local)

1. Baixe o arquivo de credenciais do Firebase Console
2. Coloque na pasta `back-end/`
3. Configure no `.env`:
   ```env
   FIREBASE_CREDENTIALS_PATH=sandboxcaixa-84951-firebase-adminsdk-fbsvc-b9035301e8.json
   ```

### Opção 2: Application Default Credentials (Produção)

Para produção, use ADC (Application Default Credentials):

```bash
gcloud auth application-default login
```

E deixe `FIREBASE_CREDENTIALS_PATH` vazio no `.env`.

## 🚨 Se você acidentalmente commitou credenciais:

1. **Remova do histórico do Git:**
   ```bash
   git rm --cached back-end/sandboxcaixa-*-firebase-adminsdk-*.json
   git rm --cached back-end/.env
   ```

2. **Revogue as credenciais comprometidas:**
   - Firebase Console → IAM & Admin → Service Accounts
   - Delete a service account ou gere novas chaves

3. **Force push (apenas se necessário e com cuidado):**
   ```bash
   git push --force
   ```

## 📝 Variáveis de Ambiente Necessárias

### Obrigatórias:
- `GROQ_API_KEY` - Chave da API Groq

### Opcionais:
- `FIREBASE_CREDENTIALS_PATH` - Caminho para arquivo de credenciais (se não usar ADC)
- `GROQ_MODEL` - Modelo a usar (padrão: llama-3.1-70b-versatile)
- `GROQ_TIMEOUT` - Timeout em segundos (padrão: 30)
- `HOST` - Host do servidor (padrão: 0.0.0.0)
- `PORT` - Porta do servidor (padrão: 8000)
- `DEBUG` - Modo debug (padrão: False)

## 🔐 Boas Práticas

1. **Nunca compartilhe credenciais por:**
   - Email não criptografado
   - Chat/Slack público
   - Repositórios públicos

2. **Use gerenciadores de segredos em produção:**
   - AWS Secrets Manager
   - Google Secret Manager
   - Azure Key Vault
   - Variáveis de ambiente do servidor

3. **Rotacione credenciais regularmente:**
   - A cada 90 dias ou após qualquer suspeita de comprometimento

4. **Monitore uso de credenciais:**
   - Configure alertas no Firebase Console
   - Revise logs de acesso regularmente

