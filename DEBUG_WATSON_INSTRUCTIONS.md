# 🔧 Debug Watson Connection - Instruções

## 🎯 **Problema Identificado**
O painel de debug mostra "Erro na conexão" - vamos diagnosticar a causa.

---

## 🧪 **Como Executar o Debug**

### **1. Acesse o Formulário**
- URL: `http://localhost:3000/colaborador/formulario` ou `http://localhost:3001/colaborador/formulario`

### **2. Abra o Console do Navegador**
- Pressione `F12` ou `Ctrl+Shift+I`
- Vá para a aba **Console**

### **3. Execute o Debug Detalhado**
```javascript
// Debug completo com teste de URLs alternativas
await window.debugWatsonConnection()
```

### **4. Observe a Saída**
O debug vai testar:
- ✅ **Token IAM**: Autenticação com IBM Cloud
- 🌐 **Conectividade Watson**: Teste da URL principal
- 🔄 **URLs Alternativas**: Se a principal falhar
- 📋 **Configuração**: Validação dos parâmetros

---

## 🔍 **Possíveis Causas e Soluções**

### **Causa 1: URL Incorreta**
```
❌ Erro: 404 Not Found
✅ Solução: O debug testará URLs alternativas automaticamente
```

### **Causa 2: Agent ID Incorreto**
```
❌ Erro: Agent not found
✅ Solução: Verificar se "Agente Questionario" está correto
```

### **Causa 3: API Key Inválida**
```
❌ Erro: 401 Unauthorized
✅ Solução: Confirmar API key do arquivo apikey.json
```

### **Causa 4: Região/Endpoint Incorreto**
```
❌ Erro: Connection refused
✅ Solução: Testar diferentes regiões (us-south, eu-de, etc.)
```

---

## 📊 **Exemplo de Saída Esperada**

### **✅ Sucesso:**
```
🔑 Token obtido com sucesso
📡 Watson response status: 200
✅ Watson respondeu com sucesso
```

### **❌ Falha com Diagnóstico:**
```
❌ Erro no Watson: Agent not found
🔄 Testando URLs alternativas...
✅ URL funcionando: https://us-south.ml.cloud.ibm.com/v1/orchestrate/runs
```

---

## 🛠️ **Configuração Atual**

```javascript
// src/config/ibmConfig.js
const IBMConfig = {
  apiKey: 'tEeUjgcAYsloUrXFOPTVv_6ObCt3TrtHS8Y_A4pTJl7b',
  baseUrl: 'https://us-south.ml.cloud.ibm.com/v1',
  agentId: 'Agente Questionario'
};
```

---

## 🎯 **Próximos Passos**

1. **Execute o debug**: `window.debugWatsonConnection()`
2. **Analise a saída**: Veja onde está falhando
3. **Aplique a correção**: Baseado no diagnóstico
4. **Teste novamente**: Recarregue a página e teste

---

## 📞 **Comandos de Teste Adicionais**

```javascript
// Teste simples de token
window.testWatson.basic()

// Teste completo de formulário
window.testWatson.form()

// Debug específico de conectividade
window.debugWatsonConnection()
```

---

**🔥 Execute o comando e compartilhe a saída para que eu possa identificar a correção exata necessária!**
