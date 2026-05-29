/**
 * Cliente HTTP para API do Backend
 * Centraliza todas as chamadas de API
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Função auxiliar para fazer requisições com timeout
 */
function fetchWithTimeout(url, options, timeout = 15000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: A requisição demorou muito para responder')), timeout)
    )
  ]);
}

/**
 * Função auxiliar para fazer requisições
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    console.log(`[API] Fazendo requisição para: ${url}`);
    const response = await fetchWithTimeout(url, config, 15000); // 15 segundos de timeout
    
    console.log(`[API] Resposta recebida: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      const errorMessage = errorData.detail || `Erro ${response.status}: ${response.statusText}`;
      
      console.error(`[API] Erro na resposta: ${errorMessage}`);
      
      // Tratamento especial para erro 503 (Service Unavailable) - Banco não criado
      if (response.status === 503 && errorMessage.includes('Firestore')) {
        const friendlyError = new Error(
          'Banco de dados não foi criado. Por favor, crie o banco de dados Firestore no console do Firebase.'
        );
        friendlyError.status = 503;
        friendlyError.originalMessage = errorMessage;
        friendlyError.firestoreLink = 'https://console.cloud.google.com/firestore/databases?project=sandboxcaixa-84951';
        throw friendlyError;
      }
      
      // Tratamento especial para erro 400 (Bad Request) - Moderação de conteúdo
      if (response.status === 400 && errorMessage.includes('inapropriado')) {
        const moderationError = new Error(errorMessage);
        moderationError.status = 400;
        moderationError.isModerationError = true;
        moderationError.originalMessage = errorMessage;
        throw moderationError;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`[API] Dados recebidos:`, data);
    return data;
  } catch (error) {
    console.error(`[API] Erro na requisição ${endpoint}:`, error);
    
    // Se for erro de timeout ou conexão, fornecer mensagem mais amigável
    if (error.message.includes('Timeout') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const networkError = new Error('Erro de conexão. Verifique se o servidor está rodando e tente novamente.');
      networkError.status = 0;
      networkError.isNetworkError = true;
      throw networkError;
    }
    
    throw error;
  }
}

// ============================================
// OPERAÇÕES COM IDEIAS
// ============================================

/**
 * Cria uma nova ideia
 */
export const createIdea = async (userId, title = 'Nova Ideia') => {
  return fetchAPI('/api/ideas/', {
    method: 'POST',
    body: { user_id: userId, title },
  });
};

/**
 * Busca uma ideia específica
 */
export const getIdea = async (userId, ideaId) => {
  return fetchAPI(`/api/ideas/${userId}/${ideaId}`);
};

/**
 * Lista todas as ideias de um usuário
 */
export const listIdeas = async (userId, limit = 50) => {
  if (!userId) {
    console.error('[API] listIdeas: userId não fornecido');
    throw new Error('ID do usuário não fornecido');
  }
  
  try {
    console.log('[API] listIdeas: Buscando ideias para usuário', userId);
    const response = await fetchAPI(`/api/ideas/${userId}?limit=${limit}`);
    console.log('[API] listIdeas: Resposta recebida', response);
    
    // Garantir que sempre retorna um array
    if (Array.isArray(response)) {
      return response;
    }
    
    // Se a resposta não for um array, retornar array vazio
    console.warn('[API] listIdeas: Resposta não é um array, retornando array vazio', response);
    return [];
  } catch (error) {
    console.error('[API] listIdeas: Erro ao buscar ideias', error);
    
    // Se for erro 503 (banco não criado), retornar array vazio ao invés de lançar erro
    if (error.status === 503) {
      console.warn('[API] listIdeas: Banco de dados não criado, retornando array vazio');
      return [];
    }
    
    // Para outros erros, lançar novamente
    throw error;
  }
};

/**
 * Autosave - Atualiza campos da ideia
 */
export const autosaveIdea = async (userId, ideaId, data) => {
  return fetchAPI(`/api/ideas/${userId}/${ideaId}`, {
    method: 'PATCH',
    body: data,
  });
};

/**
 * Deleta uma ideia
 */
export const deleteIdea = async (userId, ideaId) => {
  return fetchAPI(`/api/ideas/${userId}/${ideaId}`, {
    method: 'DELETE',
  });
};

/**
 * Atualiza status da ideia
 */
export const updateIdeaStatus = async (userId, ideaId, newStatus) => {
  return fetchAPI(`/api/ideas/${userId}/${ideaId}/status?new_status=${newStatus}`, {
    method: 'PUT',
  });
};

// ============================================
// OPERAÇÕES COM CHAT
// ============================================

/**
 * Envia mensagem para o chat com contexto do formulário
 */
export const sendChatMessage = async (userId, ideaId, message, formContext = null) => {
  return fetchAPI('/api/chat/send', {
    method: 'POST',
    body: {
      user_id: userId,
      idea_id: ideaId,
      message,
      form_context: formContext, // Contexto do formulário (seção atual, dados, etc)
    },
  });
};

/**
 * Busca histórico completo de chat
 * Retorna: { idea_id: string, messages: Array<{id, role, content, timestamp}> }
 */
export const getChatHistory = async (userId, ideaId) => {
  try {
    const response = await fetchAPI(`/api/chat/history/${userId}/${ideaId}`);
    console.log('[API] Histórico de chat recebido:', response);
    return response;
  } catch (error) {
    console.error('[API] Erro ao buscar histórico:', error);
    // Retornar estrutura vazia ao invés de lançar erro
    return {
      idea_id: ideaId,
      messages: []
    };
  }
};

/**
 * Limpa histórico de chat
 */
export const clearChatHistory = async (userId, ideaId) => {
  return fetchAPI(`/api/chat/history/${userId}/${ideaId}`, {
    method: 'DELETE',
  });
};

/**
 * Chat simplificado (sem Firebase)
 */
export const chatSimple = async (message, history = []) => {
  return fetchAPI('/api/chat/', {
    method: 'POST',
    body: {
      message,
      history,
    },
  });
};

/**
 * Gera sugestões para a ideia
 */
export const getIdeaSuggestions = async (userId, ideaId) => {
  return fetchAPI(`/api/chat/suggestions/${userId}/${ideaId}`);
};

/**
 * Valida completude da ideia
 */
export const validateIdea = async (userId, ideaId) => {
  return fetchAPI(`/api/chat/validate/${userId}/${ideaId}`);
};

/**
 * Gera sugestão para um campo específico
 */
export const getFieldSuggestion = async (userId, ideaId, fieldName, formData, currentStep) => {
  return fetchAPI('/api/chat/suggest-field', {
    method: 'POST',
    body: {
      user_id: userId,
      idea_id: ideaId,
      field_name: fieldName,
      form_data: formData,
      current_step: currentStep
    }
  });
};

