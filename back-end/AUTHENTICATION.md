# 🔐 Autenticação Firebase - Documentação

## 📋 Visão Geral

O backend utiliza **Firebase Authentication** para validar todas as requisições. O front-end envia o token JWT do Firebase no header `Authorization`, e o backend valida esse token antes de processar qualquer requisição.

## 🔄 Fluxo de Autenticação

### 1. Front-end (Colaborador)

1. Usuário faz login com email/senha via Firebase Auth
2. Firebase retorna um token JWT (`user.getIdToken()`)
3. Front-end envia token no header: `Authorization: Bearer <token>`
4. Front-end também envia `user_id` (que é o `uid` do Firebase) no body/URL

### 2. Backend (Validação)

1. Middleware `verify_firebase_token` extrai token do header
2. Firebase Admin SDK valida o token
3. Middleware `verify_user_id` verifica se `user_id` corresponde ao `uid` do token
4. Se válido, processa a requisição
5. Se inválido, retorna erro 401 ou 403

## 🛡️ Middleware de Autenticação

### `verify_firebase_token`

Valida o token JWT do Firebase:

```python
from middleware.auth import verify_firebase_token

@router.get("/endpoint")
async def my_endpoint(
    current_user: dict = Depends(verify_firebase_token)
):
    # current_user contém:
    # {
    #     "uid": "user123",
    #     "email": "user@example.com",
    #     "email_verified": True,
    #     "name": "Nome do Usuário",
    #     "firebase_claims": {...}
    # }
    pass
```

### `verify_user_id`

Valida se o `user_id` da requisição corresponde ao usuário autenticado:

```python
from middleware.auth import verify_user_id

@router.get("/ideas/{user_id}")
async def get_ideas(
    user_id: str,
    _: str = Depends(verify_user_id)  # Valida user_id
):
    # Se user_id != current_user["uid"], retorna 403
    pass
```

### `get_current_user`

Obtém dados do usuário autenticado sem validar `user_id`:

```python
from middleware.auth import get_current_user

@router.post("/ideas/")
async def create_idea(
    idea_data: IdeiaCreate,
    current_user: dict = Depends(get_current_user)
):
    # Usa current_user["uid"] como user_id
    user_id = current_user["uid"]
    pass
```

## 📡 Endpoints Protegidos

Todos os endpoints de ideias e chat estão protegidos:

### Ideias
- ✅ `POST /api/ideas/` - Cria ideia (valida user_id no body)
- ✅ `GET /api/ideas/{user_id}` - Lista ideias (valida user_id na URL)
- ✅ `GET /api/ideas/{user_id}/{idea_id}` - Busca ideia (valida user_id)
- ✅ `PATCH /api/ideas/{user_id}/{idea_id}` - Atualiza ideia (valida user_id)
- ✅ `POST /api/ideas/{user_id}/{idea_id}/submit` - Submete ideia (valida user_id)
- ✅ `PUT /api/ideas/{user_id}/{idea_id}/status` - Atualiza status (valida user_id)
- ✅ `DELETE /api/ideas/{user_id}/{idea_id}` - Deleta ideia (valida user_id)

### Chat
- ✅ `POST /api/chat/send` - Envia mensagem (valida user_id no body)
- ✅ `GET /api/chat/history/{user_id}/{idea_id}` - Histórico (valida user_id)
- ✅ `DELETE /api/chat/history/{user_id}/{idea_id}` - Limpa histórico (valida user_id)
- ✅ `POST /api/chat/suggest-field` - Sugestão de campo (valida user_id no body)
- ✅ `GET /api/chat/suggestions/{user_id}/{idea_id}` - Sugestões gerais (valida user_id)
- ✅ `GET /api/chat/validate/{user_id}/{idea_id}` - Valida completude (valida user_id)

### Endpoints Públicos
- ⚠️ `POST /api/chat/` - Chat simplificado (sem autenticação, apenas para testes)

## 🔒 Segurança

### Validações Implementadas

1. **Token Obrigatório**: Todas as rotas protegidas exigem token válido
2. **Validação de User ID**: Verifica se `user_id` corresponde ao usuário autenticado
3. **Isolamento de Dados**: Usuários só acessam suas próprias ideias
4. **Token Expiração**: Firebase Admin SDK valida automaticamente expiração

### Códigos de Erro

- **401 Unauthorized**: Token ausente, inválido ou expirado
- **403 Forbidden**: `user_id` não corresponde ao usuário autenticado
- **404 Not Found**: Ideia não encontrada ou não pertence ao usuário

## 🧪 Testando Autenticação

### Com cURL

```bash
# 1. Obter token do Firebase (via front-end ou Firebase CLI)
TOKEN="seu_token_jwt_aqui"

# 2. Fazer requisição autenticada
curl -X GET "http://localhost:8000/api/ideas/user123" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Com Postman

1. Configure header: `Authorization: Bearer <token>`
2. Obtenha token do Firebase Console ou via front-end
3. Faça requisições normalmente

## 📝 Notas Importantes

1. **Token Expira**: Tokens do Firebase expiram após 1 hora. O front-end deve renovar automaticamente.

2. **User ID = UID**: O `user_id` usado nas requisições deve ser o `uid` do Firebase Authentication.

3. **Desenvolvimento**: Para desenvolvimento local, você pode temporariamente desabilitar autenticação comentando as dependencies, mas **NUNCA** faça isso em produção.

4. **Firebase Admin**: O backend usa Firebase Admin SDK, que tem permissões elevadas. Mantenha as credenciais seguras.

## 🚀 Próximos Passos

- [ ] Implementar refresh token automático no front-end
- [ ] Adicionar rate limiting por usuário
- [ ] Implementar logs de auditoria
- [ ] Adicionar suporte a roles/permissões (Gestor vs Colaborador)

