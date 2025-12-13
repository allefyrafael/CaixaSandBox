/**
 * Cliente HTTP para API do Backend
 * Centraliza todas as chamadas de API
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      const errorMessage = errorData.detail || `Erro ${response.status}: ${response.statusText}`;
      
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
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro na API ${endpoint}:`, error);
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
  return fetchAPI(`/api/ideas/${userId}?limit=${limit}`);
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

