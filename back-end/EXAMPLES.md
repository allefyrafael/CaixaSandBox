# Exemplos de Uso da API

## Criar Nova Ideia

```bash
curl -X POST "http://localhost:8000/api/ideas/" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "title": "Assistente Virtual IA"
  }'
```

## Atualizar Ideia (Autosave)

```bash
curl -X PATCH "http://localhost:8000/api/ideas/user123/idea456" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Assistente Virtual IA para Atendimento",
    "description": "Um chatbot inteligente para melhorar o atendimento",
    "dynamic_content": {
      "problema": "Longo tempo de espera no atendimento",
      "objetivos": "Reduzir tempo de espera em 60%",
      "metricas": "Tempo médio de resposta < 30 segundos"
    }
  }'
```

## Submeter Ideia (com Validação)

```bash
curl -X POST "http://localhost:8000/api/ideas/user123/idea456/submit" \
  -H "Content-Type: application/json"
```

**Resposta de Sucesso:**
```json
{
  "id": "idea456",
  "user_id": "user123",
  "title": "Assistente Virtual IA",
  "status": "submitted",
  "classificacao_ia": {
    "resumo_executivo": "Chatbot IA para reduzir tempo de atendimento em 60%",
    "setor_responsavel": "GICLI - Gerência de Experiência do Cliente",
    "nivel_complexidade": "Médio",
    "alinhamento_estrategico": 8,
    "categoria": "Inteligência Artificial",
    "tags": ["IA", "Atendimento", "Automação"]
  }
}
```

**Resposta de Erro (Conteúdo Inapropriado):**
```json
{
  "detail": "Conteúdo inapropriado: A mensagem contém ataques pessoais. Por favor, reformule focando no processo ou sistema, não em pessoas específicas."
}
```

## Enviar Mensagem no Chat

```bash
curl -X POST "http://localhost:8000/api/chat/send" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "idea_id": "idea456",
    "message": "Como posso melhorar as métricas da minha ideia?",
    "form_context": {
      "current_step": "metricas",
      "ideaTitle": "Assistente Virtual IA"
    }
  }'
```

## Buscar Histórico de Chat

```bash
curl "http://localhost:8000/api/chat/history/user123/idea456"
```

## Solicitar Sugestão para Campo Específico

```bash
curl -X POST "http://localhost:8000/api/chat/suggest-field" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "idea_id": "idea456",
    "field_name": "metricas",
    "form_data": {
      "ideaTitle": "Assistente Virtual IA",
      "ideaDescription": "Chatbot para atendimento",
      "problema": "Tempo de espera alto"
    },
    "current_step": "metricas"
  }'
```

## Validar Completude da Ideia

```bash
curl "http://localhost:8000/api/chat/validate/user123/idea456"
```

**Resposta:**
```json
{
  "is_valid": false,
  "missing_fields": ["Métricas", "Objetivos"],
  "suggestions": [
    "Para completar sua ideia, considere adicionar métricas mensuráveis..."
  ]
}
```

## Listar Todas as Ideias do Usuário

```bash
curl "http://localhost:8000/api/ideas/user123?limit=50"
```

## Atualizar Status da Ideia

```bash
curl -X PUT "http://localhost:8000/api/ideas/user123/idea456/status?new_status=approved"
```

## Deletar Ideia

```bash
curl -X DELETE "http://localhost:8000/api/ideas/user123/idea456"
```

