# 📚 Base de Conhecimento - JuniBox

## 📋 Visão Geral

A pasta `config/knowledge/` contém arquivos de texto que servem como base de conhecimento adicional para o agente JuniBox. Esses arquivos são automaticamente carregados e incluídos no prompt do sistema antes de cada conversa.

## 🎯 Como Funciona

1. **Carregamento Automático**: Quando o servidor inicia, todos os arquivos `.txt` e `.md` da pasta `knowledge/` são lidos
2. **Inclusão no Prompt**: O conteúdo é adicionado ao prompt do sistema como contexto adicional
3. **Uso pela IA**: O JuniBox usa essas informações para avaliar ideias e responder perguntas

## 📁 Estrutura

```
config/
└── knowledge/
    ├── README.md                    # Documentação
    ├── regras_caixa.txt            # Regras e diretrizes da CAIXA
    ├── criterios_avaliacao.txt     # Critérios de avaliação
    └── [seus_arquivos].txt          # Outros arquivos de conhecimento
```

## ✏️ Como Adicionar Conhecimento

### 1. Criar um Arquivo

Crie um arquivo `.txt` ou `.md` na pasta `config/knowledge/`:

```bash
# Exemplo
config/knowledge/exemplos_ideias.txt
```

### 2. Adicionar Conteúdo

Escreva o conteúdo relevante:

```
EXEMPLOS DE BOAS IDEIAS PARA A CAIXA

1. Soluções de inclusão financeira
2. Aplicativos de educação financeira
3. Ferramentas de sustentabilidade
...
```

### 3. Reiniciar o Servidor

Para aplicar as mudanças:

```bash
uvicorn main:app --reload
```

## 📝 Formato Recomendado

### Arquivos de Texto Simples (`.txt`)

```
TÍTULO DO CONTEÚDO

1. Primeiro ponto importante
2. Segundo ponto importante
3. Terceiro ponto importante

Detalhes adicionais...
```

### Arquivos Markdown (`.md`)

```markdown
# Título Principal

## Subtítulo

- Item 1
- Item 2
- Item 3

**Destaque** para informações importantes.
```

## 🎨 Exemplos de Conteúdo

### Regras e Diretrizes

```
REGRAS DA CAIXA

1. Missão: Promover cidadania
2. Valores: Ética, transparência
3. Foco: Inclusão financeira
```

### Critérios de Avaliação

```
CRITÉRIOS DE AVALIAÇÃO

- Viabilidade técnica
- Impacto no negócio
- Alinhamento estratégico
```

### Exemplos de Boas Práticas

```
EXEMPLOS DE IDEIAS BEM-SUCEDIDAS

1. App de educação financeira
2. Sistema de microcrédito
3. Plataforma de reciclagem
```

## ⚙️ Configuração Técnica

### Carregamento

O conhecimento é carregado pela função `load_knowledge_base()` em `config/knowledge_loader.py`:

```python
from config.knowledge_loader import load_knowledge_base

knowledge = load_knowledge_base()
```

### Inclusão no Prompt

O conhecimento é automaticamente incluído no prompt do sistema através de `get_system_prompt()` em `config/prompts.py`.

## 📊 Verificar Conhecimento Carregado

Para ver quais arquivos estão sendo carregados:

```python
from config.knowledge_loader import get_knowledge_base_summary

summary = get_knowledge_base_summary()
print(summary)
```

Retorna:
```json
{
  "files_count": 2,
  "total_size_kb": 1.5,
  "files": [
    {"name": "criterios_avaliacao.txt", "size": 800, "size_kb": 0.78},
    {"name": "regras_caixa.txt", "size": 750, "size_kb": 0.73}
  ]
}
```

## 💡 Dicas

1. **Mantenha Focado**: Arquivos muito grandes aumentam o custo de tokens
2. **Organize por Tema**: Um arquivo por tema facilita manutenção
3. **Use Markdown**: Melhor formatação e legibilidade
4. **Atualize Regularmente**: Mantenha o conhecimento atualizado
5. **Teste Após Mudanças**: Reinicie o servidor e teste as respostas

## 🔄 Fluxo de Atualização

```
1. Editar arquivo em config/knowledge/
   ↓
2. Reiniciar servidor
   ↓
3. Conhecimento carregado automaticamente
   ↓
4. Incluído no prompt do sistema
   ↓
5. JuniBox usa nas respostas
```

## 📌 Notas Importantes

- ⚠️ Arquivos muito grandes podem aumentar significativamente o custo de tokens
- ✅ Mantenha arquivos focados e objetivos
- ✅ Use nomes descritivos para os arquivos
- ✅ O README.md é ignorado automaticamente
- ✅ Arquivos são carregados em ordem alfabética

## 🐛 Troubleshooting

### Conhecimento não está sendo usado

1. Verifique se os arquivos estão em `config/knowledge/`
2. Confirme que são arquivos `.txt` ou `.md`
3. Reinicie o servidor após adicionar arquivos
4. Verifique os logs para erros de leitura

### Arquivo muito grande

- Divida em múltiplos arquivos menores
- Remova informações redundantes
- Foque apenas no essencial

