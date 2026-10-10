/**
 * Configuração pública do IBM Watson.
 * Credenciais IBM Cloud pertencem exclusivamente ao backend.
 */
const IBMConfig = {
  apiKey: null,
  baseUrl: process.env.REACT_APP_WXO_BASE_URL || 'https://us-south.ml.cloud.ibm.com/v1',
  iamUrl: 'https://iam.cloud.ibm.com/identity/token',
  agentId: process.env.REACT_APP_WXO_AGENT_ID || 'Agente Questionario',
  timeout: { token: 30000, run: 60000, poll: 90000, interval: 1000 },
  retry: { maxAttempts: 3, delay: 1000, backoff: 2 },
  headers: { 'Content-Type': 'application/json' },
  debug: process.env.NODE_ENV === 'development',
  endpoints: { token: '/identity/token', runs: '/orchestrate/runs', agents: '/orchestrate/agents' },
  validation: { minMessageLength: 1, maxMessageLength: 10000, requiredFields: ['ideaTitle', 'ideaDescription'] },
  statusMapping: { completed: 'sucesso', failed: 'falhou', cancelled: 'cancelado', queued: 'na_fila', in_progress: 'processando' },
  errorMessages: { auth_failed: 'Integração requer backend seguro', timeout: 'Tempo esgotado', network_error: 'Erro de rede', invalid_response: 'Resposta inválida', quota_exceeded: 'Cota excedida', service_unavailable: 'Serviço indisponível' }
};
export const validateConfig = () => ({ isValid: false, errors: ['Autenticação IBM Cloud direta no navegador desativada. Utilize um backend seguro.'] });
export const getFullUrl = endpoint => IBMConfig.baseUrl.replace(/\/+$/, '') + endpoint;
export const debugLog = message => { if (IBMConfig.debug) console.log('[IBM Watson]', message); };
export const getAuthHeaders = () => { throw new Error('Autenticação IBM Cloud é exclusiva do backend.'); };
export const handleApiError = error => error;
export default IBMConfig;
