# 📚 Base de Conhecimento - JuniBox

Esta pasta contém arquivos de texto que serão usados como **contexto adicional** para o agente JuniBox.

## ⚠️ Importante

**O arquivo `config/prompts.py` ainda é necessário!**

- `prompts.py` contém o **prompt base** (personalidade e função do JuniBox)
- Os arquivos nesta pasta (`knowledge/`) são **conhecimento adicional** que complementa o prompt base
- Ambos são combinados automaticamente no `SYSTEM_PROMPT` final

## 📋 Como Funciona

Os arquivos nesta pasta são lidos automaticamente pelo `knowledge_loader.py` e incluídos no prompt do sistema antes de cada conversa, fornecendo contexto adicional sobre:

- Regras e diretrizes da CAIXA
- Critérios de avaliação de ideias
- Exemplos de boas práticas
- Informações sobre o programa Sandbox
- Qualquer outro contexto relevante

## 📝 Formato dos Arquivos

- **Formato**: Arquivos de texto simples (`.txt`) ou Markdown (`.md`)
- **Encoding**: UTF-8
- **Nome**: Use nomes descritivos, ex: `regras_caixa.txt`, `criterios_avaliacao.md`

## 🎯 Exemplos de Conteúdo

### `regras_caixa.txt`
```
Regras e diretrizes da CAIXA Econômica Federal para avaliação de ideias...
```

### `criterios_avaliacao.md`
```
# Critérios de Avaliação

1. Viabilidade técnica
2. Impacto no negócio
3. Alinhamento estratégico
...
```

## ⚙️ Como Adicionar Arquivos

1. Crie um arquivo `.txt` ou `.md` nesta pasta
2. Adicione o conteúdo relevante
3. O sistema carregará automaticamente na próxima inicialização

## 🔄 Atualização

Os arquivos são carregados quando o servidor inicia. Para aplicar mudanças:

1. Edite os arquivos nesta pasta
2. Reinicie o servidor: `uvicorn main:app --reload`

## 📌 Nota

- Arquivos muito grandes podem aumentar o custo de tokens da API
- Mantenha os arquivos focados e objetivos
- Use Markdown para melhor formatação

