/**
 * IBM Watson Client
 * Cliente para integração com o agente do IBM Watson
 */

import IBMConfig, { validateConfig, getFullUrl, debugLog, getAuthHeaders, handleApiError } from '../config/ibmConfig';

class IBMWatsonClient {
  constructor() {
    // Valida configuração na inicialização
    const configValidation = validateConfig();
    if (!configValidation.isValid) {
      console.warn('IBM Watson Client - Configuração incompleta:', configValidation.errors);
    }
    
    this.config = IBMConfig;
    this.accessToken = null;
    this.tokenExpiration = 0;
    this.threadId = null;
    
    debugLog('IBM Watson Client inicializado', {
      baseUrl: this.config.baseUrl,
      agentId: this.config.agentId,
      hasApiKey: !!this.config.apiKey
    });
  }

  /**
   * Obtém token de acesso do IBM Cloud IAM
   */
  async getAccessToken() {
    const now = Date.now() / 1000;
    
    // Verifica se o token ainda é válido (com margem de 30 segundos)
    if (this.accessToken && now < this.tokenExpiration - 30) {
      debugLog('Usando token em cache');
      return this.accessToken;
    }

    try {
      debugLog('Solicitando novo token IAM');
      
      const response = await fetch(this.config.iamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'grant_type': 'urn:ibm:params:oauth:grant-type:apikey',
          'apikey': this.config.apiKey,
        }),
        signal: AbortSignal.timeout(this.config.timeout.token)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`IAM token request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      
      // Define expiração com margem de segurança
      if (data.expiration) {
        this.tokenExpiration = data.expiration;
      } else {
        this.tokenExpiration = now + (data.expires_in || 3600);
      }

      debugLog('Token obtido com sucesso', {
        expiresIn: data.expires_in,
        expiration: this.tokenExpiration
      });

      return this.accessToken;
    } catch (error) {
      const handledError = handleApiError(error, 'getAccessToken');
      console.error('Erro ao obter token do IBM Cloud:', handledError);
      throw handledError;
    }
  }

  /**
   * Cria um run no IBM Watson
   */
  async createRun(message, threadId = null) {
    try {
      // Valida entrada
      if (!message || typeof message !== 'string') {
        throw new Error('Mensagem inválida para criação de run');
      }

      if (message.length > this.config.validation.maxMessageLength) {
        throw new Error(`Mensagem muito longa (máximo: ${this.config.validation.maxMessageLength} caracteres)`);
      }

      const token = await this.getAccessToken();
      
      const payload = {
        agent_id: this.config.agentId,
        message: {
          role: 'user',
          content: message
        }
      };

      if (threadId) {
        payload.thread_id = threadId;
      }

      debugLog('Criando run', { 
        agentId: this.config.agentId, 
        threadId, 
        messageLength: message.length 
      });

      const url = getFullUrl(this.config.endpoints.runs);
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout.run)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Create run failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      debugLog('Run criado com sucesso', { runId: data.run_id });
      
      return data.run_id;
    } catch (error) {
      const handledError = handleApiError(error, 'createRun');
      console.error('Erro ao criar run:', handledError);
      throw handledError;
    }
  }

  /**
   * Obtém informações de um run
   */
  async getRun(runId) {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/orchestrate/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Get run failed: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter run:', error);
      throw new Error('Falha ao obter resposta do agente');
    }
  }

  /**
   * Aguarda a conclusão de um run
   */
  async waitForCompletion(runId, timeoutMs = 90000, pollIntervalMs = 1000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        const runData = await this.getRun(runId);
        const status = runData.status;
        
        if (status === 'completed') {
          // Atualiza thread_id se disponível
          if (runData.thread_id) {
            this.threadId = runData.thread_id;
          }
          return runData;
        }
        
        if (status === 'failed' || status === 'cancelled') {
          throw new Error(`Run ${runId} finalizou com status: ${status}`);
        }
        
        // Aguarda antes da próxima verificação
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      } catch (error) {
        console.error('Erro ao verificar status do run:', error);
        throw error;
      }
    }
    
    throw new Error(`Timeout: Run ${runId} não concluiu em ${timeoutMs}ms`);
  }

  /**
   * Envia mensagem e aguarda resposta completa
   */
  async sendMessage(message, useExistingThread = true) {
    try {
      const threadToUse = useExistingThread ? this.threadId : null;
      const runId = await this.createRun(message, threadToUse);
      const result = await this.waitForCompletion(runId);
      
      return this.extractResponse(result);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Extrai a resposta do agente do resultado do run
   */
  extractResponse(runResult) {
    try {
      // Procura por mensagens do assistente na resposta
      const messages = runResult.messages || [];
      const assistantMessages = messages.filter(msg => msg.role === 'assistant');
      
      if (assistantMessages.length === 0) {
        return {
          success: false,
          message: 'Nenhuma resposta do assistente encontrada',
          rawData: runResult
        };
      }

      // Pega a última mensagem do assistente
      const lastMessage = assistantMessages[assistantMessages.length - 1];
      const content = lastMessage.content;

      return {
        success: true,
        message: content,
        threadId: runResult.thread_id,
        runId: runResult.run_id,
        status: runResult.status,
        rawData: runResult
      };
    } catch (error) {
      console.error('Erro ao extrair resposta:', error);
      return {
        success: false,
        message: 'Erro ao processar resposta do agente',
        error: error.message,
        rawData: runResult
      };
    }
  }

  /**
   * Processa formulário completo com o agente
   */
  async processFormData(formData) {
    try {
      // Monta a mensagem estruturada com os dados do formulário
      const formMessage = this.buildFormMessage(formData);
      
      // Envia para o agente
      const response = await this.sendMessage(formMessage, false); // Novo thread para formulário completo
      
      if (!response.success) {
        throw new Error(response.message);
      }

      // Tenta parsear a resposta como JSON estruturado
      return this.parseAgentResponse(response.message, formData);
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      throw error;
    }
  }

  /**
   * Constrói mensagem estruturada do formulário
   */
  buildFormMessage(formData) {
    const sections = [
      '=== ANÁLISE DE FORMULÁRIO DO SANDBOX CAIXA ===',
      '',
      `TÍTULO: ${formData.ideaTitle || 'Não informado'}`,
      '',
      `DESCRIÇÃO: ${formData.ideaDescription || 'Não informado'}`,
      '',
      `PROBLEMA: ${formData.problema || 'Não informado'}`,
      '',
      `PÚBLICO-ALVO: ${formData.publicoAlvo || 'Não informado'}`,
      '',
      `OBJETIVOS: ${formData.objetivos || 'Não informado'}`,
      '',
      `MÉTRICAS: ${formData.metricas || 'Não informado'}`,
      '',
      `CRONOGRAMA: ${formData.cronograma || 'Não informado'}`,
      '',
      `RECURSOS: ${formData.recursos || 'Não informado'}`,
      '',
      `DESAFIOS: ${formData.desafios || 'Não informado'}`,
      '',
      `FASE DESEJADA: ${formData.faseDesejada || 'Não informado'}`,
      '',
      '=== SOLICITAÇÃO ===',
      'Analise este formulário e forneça:',
      '1. Sugestões de melhorias para cada campo',
      '2. Pontos fortes identificados',
      '3. Lacunas que precisam ser preenchidas',
      '4. Recomendações estratégicas',
      '5. Score geral de viabilidade (0-100)',
      '',
      'Responda em formato estruturado para facilitar o processamento.'
    ];

    return sections.join('\n');
  }

  /**
   * Processa resposta do agente para extrair insights estruturados
   */
  parseAgentResponse(responseText, originalFormData) {
    try {
      // Tenta identificar diferentes seções na resposta
      const response = {
        suggestions: this.extractSuggestions(responseText, originalFormData),
        strengths: this.extractStrengths(responseText),
        gaps: this.extractGaps(responseText),
        recommendations: this.extractRecommendations(responseText),
        viabilityScore: this.extractViabilityScore(responseText),
        fullResponse: responseText,
        analysis: {
          sentiment: this.analyzeSentiment(responseText),
          confidence: this.calculateConfidence(responseText),
          categories: this.extractCategories(responseText)
        }
      };

      return response;
    } catch (error) {
      console.error('Erro ao parsear resposta do agente:', error);
      return {
        suggestions: [],
        strengths: [],
        gaps: [],
        recommendations: [],
        viabilityScore: 50,
        fullResponse: responseText,
        error: error.message
      };
    }
  }

  /**
   * Extrai sugestões da resposta do agente
   */
  extractSuggestions(text, formData) {
    const suggestions = [];
    
    // Padrões para identificar sugestões
    const suggestionPatterns = [
      /sugestão|sugerir|recomendo|melhorar|otimizar/gi,
      /poderia|deveria|seria interessante/gi
    ];

    // Analisa cada campo do formulário
    Object.keys(formData).forEach(field => {
      const fieldValue = formData[field] || '';
      
      // Se o campo está vazio ou muito curto, sugere preenchimento
      if (!fieldValue || fieldValue.length < 20) {
        suggestions.push({
          field: field,
          currentValue: fieldValue,
          suggestedValue: this.generateFieldSuggestion(field, formData),
          reason: 'Campo precisa ser mais detalhado para melhor análise',
          confidence: 75,
          source: 'watson_agent'
        });
      }
    });

    return suggestions;
  }

  /**
   * Gera sugestões baseadas no campo e contexto
   */
  generateFieldSuggestion(field, formData) {
    const suggestions = {
      ideaTitle: `${formData.ideaTitle || 'Nova Solução'} - Otimizada com IA`,
      ideaDescription: 'Descrição detalhada que explica o valor da solução, tecnologias utilizadas e benefícios esperados.',
      problema: 'Problema específico identificado na operação da CAIXA que impacta clientes ou processos internos.',
      publicoAlvo: 'Clientes da CAIXA, empregados ou parceiros que serão beneficiados pela solução.',
      objetivos: 'Objetivos SMART: específicos, mensuráveis, atingíveis, relevantes e temporais.',
      metricas: 'KPIs quantificáveis para medir o sucesso da implementação.',
      cronograma: 'Cronograma detalhado seguindo as fases do Sandbox: Discovery, Delivery e Scale.',
      recursos: 'Recursos humanos, tecnológicos e financeiros necessários para execução.',
      desafios: 'Principais riscos identificados e estratégias de mitigação.'
    };

    return suggestions[field] || 'Campo requer mais informações detalhadas.';
  }

  /**
   * Extrai pontos fortes da análise
   */
  extractStrengths(text) {
    const strengths = [];
    
    // Procura por palavras positivas na resposta
    const positiveWords = ['forte', 'bom', 'excelente', 'bem estruturado', 'claro', 'viável'];
    
    positiveWords.forEach(word => {
      if (text.toLowerCase().includes(word)) {
        strengths.push(`Ponto forte identificado relacionado a: ${word}`);
      }
    });

    return strengths;
  }

  /**
   * Extrai lacunas identificadas
   */
  extractGaps(text) {
    const gaps = [];
    
    // Procura por indicadores de lacunas
    const gapIndicators = ['falta', 'ausência', 'não informado', 'incompleto', 'vago'];
    
    gapIndicators.forEach(indicator => {
      if (text.toLowerCase().includes(indicator)) {
        gaps.push(`Lacuna identificada: ${indicator}`);
      }
    });

    return gaps;
  }

  /**
   * Extrai recomendações estratégicas
   */
  extractRecommendations(text) {
    const recommendations = [];
    
    // Procura por padrões de recomendação
    const lines = text.split('\n');
    lines.forEach(line => {
      if (line.includes('recomendo') || line.includes('sugiro') || line.includes('deveria')) {
        recommendations.push(line.trim());
      }
    });

    return recommendations;
  }

  /**
   * Extrai score de viabilidade
   */
  extractViabilityScore(text) {
    // Procura por números seguidos de % ou /100
    const scorePattern = /(\d+)(?:%|\/100)/g;
    const matches = text.match(scorePattern);
    
    if (matches && matches.length > 0) {
      const score = parseInt(matches[0].replace(/[^\d]/g, ''));
      return Math.min(Math.max(score, 0), 100);
    }
    
    // Score padrão baseado na análise de texto
    return 70;
  }

  /**
   * Analisa sentimento da resposta
   */
  analyzeSentiment(text) {
    const positiveWords = ['excelente', 'bom', 'forte', 'viável', 'promissor'];
    const negativeWords = ['fraco', 'problemático', 'inviável', 'insuficiente'];
    
    let score = 0;
    positiveWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 1;
    });
    negativeWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score -= 1;
    });
    
    if (score > 0) return { label: 'Positivo', score: 0.8 };
    if (score < 0) return { label: 'Negativo', score: 0.3 };
    return { label: 'Neutro', score: 0.6 };
  }

  /**
   * Calcula confiança na análise
   */
  calculateConfidence(text) {
    // Confiança baseada no tamanho e estrutura da resposta
    const wordCount = text.split(' ').length;
    if (wordCount > 100) return 90;
    if (wordCount > 50) return 75;
    return 60;
  }

  /**
   * Extrai categorias/tags da resposta
   */
  extractCategories(text) {
    const categories = [];
    const categoryKeywords = {
      'tecnologia': ['IA', 'digital', 'sistema', 'plataforma'],
      'atendimento': ['cliente', 'atendimento', 'suporte'],
      'processos': ['processo', 'operação', 'eficiência'],
      'inovação': ['inovação', 'novo', 'revolucionário']
    };

    Object.keys(categoryKeywords).forEach(category => {
      const keywords = categoryKeywords[category];
      if (keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))) {
        categories.push(category);
      }
    });

    return categories;
  }

  /**
   * Inicializa novo thread (útil para conversas independentes)
   */
  startNewThread() {
    this.threadId = null;
  }

  /**
   * Obtém ID do thread atual
   */
  getCurrentThreadId() {
    return this.threadId;
  }
}

const ibmWatsonClientInstance = new IBMWatsonClient();
export default ibmWatsonClientInstance;
