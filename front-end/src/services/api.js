/**
 * Cliente HTTP para API do Backend
 * Centraliza todas as chamadas de API
 */
import { auth } from '../config/firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Obtém token de autenticação do Firebase
 */
async function getAuthToken() {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      return token;
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter token de autenticação:', error);
    return null;
  }
}

/**
 * Função auxiliar para fazer requisições
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // Obter token de autenticação
  const token = await getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
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
      
      // Tratamento especial para erro 401 (Unauthorized) - Token expirado ou inválido
      if (response.status === 401) {
        const authError = new Error('Sua sessão expirou. Por favor, faça login novamente.');
        authError.status = 401;
        authError.isAuthError = true;
        authError.originalMessage = errorMessage;
        // Tentar renovar token se possível
        try {
          const user = auth.currentUser;
          if (user) {
            await user.getIdToken(true); // Força renovação do token
          }
        } catch (refreshError) {
          console.error('Erro ao renovar token:', refreshError);
        }
        throw authError;
      }
      
      // Tratamento especial para erro 403 (Forbidden) - Sem permissão
      if (response.status === 403) {
        const forbiddenError = new Error('Você não tem permissão para acessar este recurso.');
        forbiddenError.status = 403;
        forbiddenError.isForbiddenError = true;
        forbiddenError.originalMessage = errorMessage;
        throw forbiddenError;
      }
      
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
      
      // Tratamento especial para erro 500 com índice faltante do Firestore
      if (response.status === 500 && (errorMessage.includes('index') || errorMessage.includes('índice') || errorMessage.includes('requires an index'))) {
        // Extrair link do índice se presente
        let indexLink = null;
        
        // Tentar diferentes padrões de extração
        const linkPatterns = [
          'Link:',
          'link:',
          'Acesse:',
          'acesse:',
          'https://console.firebase.google.com',
          'https://console.cloud.google.com'
        ];
        
        for (const pattern of linkPatterns) {
          if (errorMessage.includes(pattern)) {
            const parts = errorMessage.split(pattern);
            if (parts.length > 1) {
              // Pegar a parte após o padrão e extrair a URL
              const remaining = parts[1].trim();
              // Procurar por URL completa
              const urlMatch = remaining.match(/https?:\/\/[^\s\)]+/);
              if (urlMatch) {
                indexLink = urlMatch[0];
                break;
              }
              // Se não encontrar URL completa, pegar até o próximo espaço
              const firstPart = remaining.split(/\s/)[0];
              if (firstPart.startsWith('http')) {
                indexLink = firstPart;
                break;
              }
            }
          }
        }
        
        // Se ainda não encontrou, procurar diretamente por URLs no erro
        if (!indexLink) {
          const urlMatch = errorMessage.match(/https?:\/\/[^\s\)]+/);
          if (urlMatch) {
            indexLink = urlMatch[0];
          }
        }
        
        // Mensagem de erro amigável
        let errorText = 'O banco de dados precisa de um índice composto no Firestore.';
        if (indexLink) {
          errorText += ` Clique aqui para criar o índice: ${indexLink}`;
        } else {
          errorText += ' Por favor, acesse o console do Firebase para criar o índice necessário.';
        }
        
        const indexError = new Error(errorText);
        indexError.status = 500;
        indexError.isIndexError = true;
        indexError.originalMessage = errorMessage;
        indexError.indexLink = indexLink || `https://console.firebase.google.com/project/sandboxcaixa-84951/firestore/indexes`;
        throw indexError;
      }
      
      // Tratamento especial para erro 400 (Bad Request) - Moderação de conteúdo
      if (response.status === 400) {
        try {
          const errorData = await response.json();
          if (errorData.detail && typeof errorData.detail === 'object' && errorData.detail.error === 'moderation_failed') {
            const moderationError = new Error(errorData.detail.justificativa_geral || 'Conteúdo precisa ser revisado');
            moderationError.status = 400;
            moderationError.isModerationError = true;
            moderationError.detail = errorData.detail;
            throw moderationError;
          }
        } catch (e) {
          // Se não conseguir parsear JSON, usar mensagem original
          if (errorMessage.includes('inapropriado') || errorMessage.includes('moderation')) {
            const moderationError = new Error(errorMessage);
            moderationError.status = 400;
            moderationError.isModerationError = true;
            throw moderationError;
          }
        }
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
 * Valida campos antes de salvar (moderação)
 */
export const validateFields = async (userId, data) => {
  return fetchAPI(`/api/ideas/${userId}/validate`, {
    method: 'POST',
    body: data,
  });
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

/**
 * Submete uma ideia (com validação do Agente Guardião e análise do Agente Analista)
 */
export const submitIdea = async (userId, ideaId) => {
  return fetchAPI(`/api/ideas/${userId}/${ideaId}/submit`, {
    method: 'POST',
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

