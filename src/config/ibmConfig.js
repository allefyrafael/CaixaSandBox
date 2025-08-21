/**
 * Configuração do IBM Watson
 * Centraliza todas as configurações de integração
 */

const IBMConfig = {
  // API Key fornecida
  apiKey: 'tEeUjgcAYsloUrXFOPTVv_6ObCt3TrtHS8Y_A4pTJl7b',
  
  // URLs base - podem ser configuradas via environment  
  baseUrl: process.env.REACT_APP_WXO_BASE_URL || 'https://us-south.ml.cloud.ibm.com/v1',
  iamUrl: 'https://iam.cloud.ibm.com/identity/token',
  
  // Agent ID - nome do agente conforme criado no Watson
  agentId: process.env.REACT_APP_WXO_AGENT_ID || 'Agente Questionario',
  
  // Configurações de timeout e retry
  timeout: {
    token: 30000,      // 30 segundos para obter token
    run: 60000,        // 60 segundos para criar run
    poll: 90000,       // 90 segundos para aguardar conclusão
    interval: 1000     // 1 segundo entre polls
  },
  
  // Configurações de retry
  retry: {
    maxAttempts: 3,
    delay: 1000,
    backoff: 2
  },
  
  // Headers padrão
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Sandbox-CAIXA-Client/1.0'
  },
  
  // Configurações de debug
  debug: process.env.REACT_APP_DEBUG_MODE === 'true' || process.env.NODE_ENV === 'development',
  
  // Endpoints específicos
  endpoints: {
    token: '/identity/token',
    runs: '/orchestrate/runs',
    agents: '/orchestrate/agents'
  },
  
  // Configurações de validação
  validation: {
    minMessageLength: 1,
    maxMessageLength: 10000,
    requiredFields: ['ideaTitle', 'ideaDescription']
  },
  
  // Mapeamento de status
  statusMapping: {
    'completed': 'sucesso',
    'failed': 'falhou',
    'cancelled': 'cancelado',
    'queued': 'na_fila',
    'in_progress': 'processando'
  },
  
  // Mensagens de erro padrão
  errorMessages: {
    'auth_failed': 'Falha na autenticação com IBM Cloud',
    'timeout': 'Timeout na comunicação com IBM Watson',
    'network_error': 'Erro de rede na comunicação',
    'invalid_response': 'Resposta inválida do servidor',
    'quota_exceeded': 'Cota de uso excedida',
    'service_unavailable': 'Serviço temporariamente indisponível'
  }
};

// Função para validar configuração
export const validateConfig = () => {
  const errors = [];
  
  if (!IBMConfig.apiKey || IBMConfig.apiKey === 'your-api-key-here') {
    errors.push('IBM Cloud API Key não configurada');
  }
  
  if (!IBMConfig.baseUrl) {
    errors.push('Base URL não configurada');
  }
  
  if (!IBMConfig.agentId || IBMConfig.agentId === 'your-agent-id-here') {
    errors.push('Agent ID não configurado');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Função para obter URL completa
export const getFullUrl = (endpoint) => {
  const baseUrl = IBMConfig.baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
  
  // Adiciona /v1 se não estiver presente
  const versionedUrl = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;
  
  return `${versionedUrl}${endpoint}`;
};

// Função para logging condicional
export const debugLog = (message, data = null) => {
  if (IBMConfig.debug) {
    console.log(`[IBM Watson Debug] ${message}`, data || '');
  }
};

// Função para obter headers com auth
export const getAuthHeaders = (token) => ({
  ...IBMConfig.headers,
  'Authorization': `Bearer ${token}`
});

// Função para tratamento de erros
export const handleApiError = (error, context = '') => {
  debugLog(`Erro em ${context}:`, error);
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new Error(IBMConfig.errorMessages.network_error);
  }
  
  if (error.message.includes('timeout')) {
    return new Error(IBMConfig.errorMessages.timeout);
  }
  
  if (error.message.includes('401') || error.message.includes('403')) {
    return new Error(IBMConfig.errorMessages.auth_failed);
  }
  
  if (error.message.includes('429')) {
    return new Error(IBMConfig.errorMessages.quota_exceeded);
  }
  
  if (error.message.includes('503') || error.message.includes('502')) {
    return new Error(IBMConfig.errorMessages.service_unavailable);
  }
  
  return error;
};

export default IBMConfig;
