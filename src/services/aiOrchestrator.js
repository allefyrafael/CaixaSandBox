/**
 * AI Orchestrator Service
 * Gerencia a comunicação entre chat, formulário e validações de IA
 */

import IBMWatsonClient from './ibmWatsonClient';

class AIOrchestrator {
  constructor() {
    this.apiEndpoint = process.env.REACT_APP_AI_API_URL || 'https://api.sandbox-caixa.com/ai';
    this.watsonClient = IBMWatsonClient;
    this.validationRules = {
      // Regras de validação para cada campo do formulário
      ideaTitle: {
        minLength: 10,
        maxLength: 100,
        prohibited: ['hack', 'illegal', 'fraude'],
        required: true
      },
      ideaDescription: {
        minLength: 50,
        maxLength: 1000,
        prohibited: ['hack', 'illegal', 'fraude', 'roubo'],
        required: true
      },
      problema: {
        minLength: 30,
        maxLength: 500,
        mustContain: ['problema', 'dificuldade', 'desafio', 'necessidade']
      },
      objetivos: {
        minLength: 40,
        maxLength: 800,
        mustContain: ['objetivo', 'meta', 'resultado', 'melhorar']
      }
    };
  }

  /**
   * Valida se o conteúdo está dentro das diretrizes
   */
  async validateContent(content, field = null) {
    try {
      // Validação básica de conteúdo proibido
      const prohibitedTerms = [
        'hack', 'illegal', 'fraude', 'roubo', 'corrupção',
        'golpe', 'esquema', 'lavagem', 'sonegação'
      ];

      const hasProhibitedContent = prohibitedTerms.some(term => 
        content.toLowerCase().includes(term.toLowerCase())
      );

      if (hasProhibitedContent) {
        return {
          isValid: false,
          reason: 'content_prohibited',
          message: 'O conteúdo contém termos não permitidos pelas diretrizes do Sandbox CAIXA.'
        };
      }

      // Validação de campo específico
      if (field && this.validationRules[field]) {
        const rule = this.validationRules[field];
        
        if (rule.minLength && content.length < rule.minLength) {
          return {
            isValid: false,
            reason: 'content_too_short',
            message: `O conteúdo deve ter pelo menos ${rule.minLength} caracteres.`
          };
        }

        if (rule.maxLength && content.length > rule.maxLength) {
          return {
            isValid: false,
            reason: 'content_too_long',
            message: `O conteúdo deve ter no máximo ${rule.maxLength} caracteres.`
          };
        }

        if (rule.mustContain) {
          const hasRequiredTerm = rule.mustContain.some(term =>
            content.toLowerCase().includes(term.toLowerCase())
          );
          
          if (!hasRequiredTerm) {
            return {
              isValid: false,
              reason: 'missing_required_context',
              message: `O conteúdo deve mencionar: ${rule.mustContain.join(', ')}.`
            };
          }
        }
      }

      return {
        isValid: true,
        message: 'Conteúdo aprovado pela IA.'
      };

    } catch (error) {
      console.error('Erro na validação de conteúdo:', error);
      return {
        isValid: false,
        reason: 'validation_error',
        message: 'Erro interno na validação. Tente novamente.'
      };
    }
  }

  /**
   * Processa comando do chat e gera sugestões
   */
  async processCommand(command, formMockup) {
    try {
      const commandType = this.detectCommandType(command);
      
      // Para comandos específicos, usa Watson + fallback local
      if (commandType === 'validate_form' || command.toLowerCase().includes('analisar formulário')) {
        return await this.processWithWatson(command, formMockup);
      }
      
      // Para outros comandos, usa processamento local otimizado
      switch (commandType) {
        case 'improve_idea':
          return await this.generateIdeaImprovements(command, formMockup);
        
        case 'fill_field':
          return await this.generateFieldSuggestions(command, formMockup);
        
        case 'validate_form':
          return await this.validateCompleteForm(formMockup);
        
        case 'suggest_objectives':
          return await this.generateObjectiveSuggestions(command, formMockup);
        
        case 'timeline_help':
          return await this.generateTimelineSuggestions(command, formMockup);
        
        default:
          return await this.generateGeneralSuggestions(command, formMockup);
      }

    } catch (error) {
      console.error('Erro no processamento do comando:', error);
      throw new Error('Erro no processamento da IA');
    }
  }

  /**
   * Processa comando usando IBM Watson
   */
  async processWithWatson(command, formMockup) {
    try {
      // Constrói contexto para o Watson
      const contextMessage = this.buildWatsonContext(command, formMockup);
      
      // Envia para Watson
      const response = await this.watsonClient.sendMessage(contextMessage);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      // Converte resposta do Watson para formato do sistema
      return this.convertWatsonResponse(response, formMockup);

    } catch (error) {
      console.error('Erro ao processar com Watson:', error);
      
      // Fallback para processamento local
      console.log('Fallback para processamento local...');
      return await this.generateGeneralSuggestions(command, formMockup);
    }
  }

  /**
   * Constrói contexto para envio ao Watson
   */
  buildWatsonContext(command, formMockup) {
    const sections = [
      '=== COMANDO DO USUÁRIO ===',
      command,
      '',
      '=== CONTEXTO DO FORMULÁRIO ===',
      `Título: ${formMockup.ideaTitle || 'Não informado'}`,
      `Descrição: ${formMockup.ideaDescription || 'Não informado'}`,
      `Problema: ${formMockup.problema || 'Não informado'}`,
      `Público-alvo: ${formMockup.publicoAlvo || 'Não informado'}`,
      `Objetivos: ${formMockup.objetivos || 'Não informado'}`,
      `Métricas: ${formMockup.metricas || 'Não informado'}`,
      '',
      '=== INSTRUÇÃO ===',
      'Com base no comando do usuário e no contexto do formulário, forneça sugestões específicas e acionáveis para melhorar a proposta do Sandbox CAIXA.',
      'Responda de forma estruturada e prática.'
    ];

    return sections.join('\n');
  }

  /**
   * Converte resposta do Watson para formato do sistema
   */
  convertWatsonResponse(watsonResponse, formMockup) {
    try {
      const suggestions = [];
      const responseText = watsonResponse.message || '';

      // Analisa a resposta e extrai sugestões
      const lines = responseText.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        // Procura por padrões de sugestão
        if (line.includes(':') && (line.includes('sugerir') || line.includes('melhorar') || line.includes('recomendar'))) {
          const [field, suggestion] = this.parseSuggestionLine(line, formMockup);
          if (field && suggestion) {
            suggestions.push({
              field: field,
              currentValue: formMockup[field] || '',
              suggestedValue: suggestion,
              reason: 'Sugestão do agente IBM Watson',
              confidence: 85,
              source: 'watson'
            });
          }
        }
      });

      // Se não encontrou sugestões estruturadas, cria uma sugestão geral
      if (suggestions.length === 0) {
        const mostEmptyField = this.findMostEmptyField(formMockup);
        if (mostEmptyField) {
          suggestions.push({
            field: mostEmptyField,
            currentValue: formMockup[mostEmptyField] || '',
            suggestedValue: this.generateContextualSuggestion(mostEmptyField, responseText, formMockup),
            reason: 'Baseado na análise do agente IBM Watson',
            confidence: 80,
            source: 'watson'
          });
        }
      }

      return {
        type: 'suggestions',
        message: `Análise do IBM Watson:\n\n${responseText}`,
        suggestions,
        requiresApproval: true,
        source: 'watson',
        threadId: watsonResponse.threadId
      };

    } catch (error) {
      console.error('Erro ao converter resposta do Watson:', error);
      return {
        type: 'error',
        message: 'Erro ao processar resposta do agente de IA',
        suggestions: []
      };
    }
  }

  /**
   * Analisa linha de sugestão da resposta
   */
  parseSuggestionLine(line, formMockup) {
    const fieldMappings = {
      'título': 'ideaTitle',
      'descrição': 'ideaDescription',
      'problema': 'problema',
      'público': 'publicoAlvo',
      'objetivos': 'objetivos',
      'métricas': 'metricas',
      'cronograma': 'cronograma',
      'recursos': 'recursos',
      'desafios': 'desafios'
    };

    // Procura por campo mencionado na linha
    const lowerLine = line.toLowerCase();
    for (const [keyword, field] of Object.entries(fieldMappings)) {
      if (lowerLine.includes(keyword)) {
        const suggestionPart = line.split(':')[1]?.trim();
        return [field, suggestionPart];
      }
    }

    return [null, null];
  }

  /**
   * Encontra o campo mais vazio para sugerir preenchimento
   */
  findMostEmptyField(formMockup) {
    const fields = ['ideaTitle', 'ideaDescription', 'problema', 'publicoAlvo', 'objetivos', 'metricas'];
    
    // Procura por campo completamente vazio
    for (const field of fields) {
      if (!formMockup[field] || formMockup[field].length === 0) {
        return field;
      }
    }

    // Procura por campo com pouco conteúdo
    for (const field of fields) {
      if (formMockup[field] && formMockup[field].length < 30) {
        return field;
      }
    }

    return null;
  }

  /**
   * Gera sugestão contextual baseada na resposta do Watson
   */
  generateContextualSuggestion(field, watsonResponse, formMockup) {
    const defaultSuggestions = {
      ideaTitle: 'Título aprimorado com foco em valor e impacto',
      ideaDescription: 'Descrição detalhada explicando a solução, benefícios e diferenciação',
      problema: 'Problema específico identificado com dados quantitativos',
      publicoAlvo: 'Segmento de clientes bem definido com características específicas',
      objetivos: 'Objetivos SMART com metas mensuráveis e prazos definidos',
      metricas: 'KPIs específicos para medir sucesso e ROI da solução'
    };

    // Tenta extrair sugestão contextual da resposta do Watson
    const lines = watsonResponse.split('\n');
    for (const line of lines) {
      if (line.length > 20 && line.length < 200) {
        return line.trim();
      }
    }

    return defaultSuggestions[field] || 'Campo necessita de mais informações detalhadas';
  }

  /**
   * Detecta o tipo de comando baseado no texto
   */
  detectCommandType(command) {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('melhor') || lowerCommand.includes('aprimorar')) {
      return 'improve_idea';
    }
    if (lowerCommand.includes('preencher') || lowerCommand.includes('completar')) {
      return 'fill_field';
    }
    if (lowerCommand.includes('validar') || lowerCommand.includes('revisar')) {
      return 'validate_form';
    }
    if (lowerCommand.includes('objetivo') || lowerCommand.includes('meta')) {
      return 'suggest_objectives';
    }
    if (lowerCommand.includes('cronograma') || lowerCommand.includes('prazo')) {
      return 'timeline_help';
    }
    
    return 'general';
  }

  /**
   * Gera melhorias para a ideia
   */
  async generateIdeaImprovements(command, formMockup) {
    const suggestions = [];

    if (formMockup.ideaTitle) {
      suggestions.push({
        field: 'ideaTitle',
        currentValue: formMockup.ideaTitle,
        suggestedValue: `${formMockup.ideaTitle} - Versão Otimizada com IA`,
        reason: 'Título mais descritivo e impactante',
        confidence: 85
      });
    }

    if (formMockup.ideaDescription) {
      suggestions.push({
        field: 'ideaDescription',
        currentValue: formMockup.ideaDescription,
        suggestedValue: formMockup.ideaDescription + '\n\nEsta solução utilizará tecnologias avançadas de IA e machine learning para garantir maior eficiência e precisão nos resultados.',
        reason: 'Adicionadas informações técnicas relevantes',
        confidence: 90
      });
    }

    return {
      type: 'suggestions',
      message: 'Analisei sua ideia e tenho algumas sugestões de melhorias:',
      suggestions,
      requiresApproval: true
    };
  }

  /**
   * Gera sugestões para campos específicos
   */
  async generateFieldSuggestions(command, formMockup) {
    const suggestions = [];

    // Detectar qual campo precisa ser preenchido
    if (!formMockup.problema || formMockup.problema.length < 30) {
      suggestions.push({
        field: 'problema',
        currentValue: formMockup.problema || '',
        suggestedValue: 'O problema identificado é a demora no atendimento ao cliente, que pode levar até 30 minutos em horários de pico, causando insatisfação e perda de clientes.',
        reason: 'Problema específico e mensurável',
        confidence: 88
      });
    }

    if (!formMockup.publicoAlvo || formMockup.publicoAlvo.length < 10) {
      suggestions.push({
        field: 'publicoAlvo',
        currentValue: formMockup.publicoAlvo || '',
        suggestedValue: 'Clientes pessoa física da CAIXA, com foco em aposentados e beneficiários do INSS',
        reason: 'Público-alvo bem definido e estratégico',
        confidence: 92
      });
    }

    return {
      type: 'suggestions',
      message: 'Identifiquei campos que podem ser melhorados. Quer que eu complete?',
      suggestions,
      requiresApproval: true
    };
  }

  /**
   * Valida formulário completo
   */
  async validateCompleteForm(formMockup) {
    const issues = [];
    const improvements = [];

    // Validar campos obrigatórios
    if (!formMockup.ideaTitle || formMockup.ideaTitle.length < 10) {
      issues.push({
        field: 'ideaTitle',
        severity: 'error',
        message: 'Título da ideia é obrigatório e deve ter pelo menos 10 caracteres'
      });
    }

    if (!formMockup.ideaDescription || formMockup.ideaDescription.length < 50) {
      issues.push({
        field: 'ideaDescription',
        severity: 'error',
        message: 'Descrição da ideia deve ter pelo menos 50 caracteres'
      });
    }

    // Sugerir melhorias
    if (formMockup.objetivos && formMockup.objetivos.length < 100) {
      improvements.push({
        field: 'objetivos',
        message: 'Objetivos podem ser mais detalhados para maior clareza'
      });
    }

    return {
      type: 'validation',
      message: issues.length > 0 ? 'Encontrei alguns problemas no formulário:' : 'Formulário está bem estruturado!',
      issues,
      improvements,
      overallScore: this.calculateFormScore(formMockup)
    };
  }

  /**
   * Gera sugestões de objetivos
   */
  async generateObjectiveSuggestions(command, formMockup) {
    const suggestions = [];

    if (formMockup.ideaTitle && formMockup.ideaDescription) {
      suggestions.push({
        field: 'objetivos',
        currentValue: formMockup.objetivos || '',
        suggestedValue: `Objetivo Principal: Reduzir em 50% o tempo médio de atendimento ao cliente através da implementação de IA conversacional.\n\nObjetivos Específicos:\n- Automatizar 80% das consultas mais frequentes\n- Melhorar a satisfação do cliente em 40%\n- Reduzir custos operacionais em 25%\n- Implementar solução em 180 dias`,
        reason: 'Objetivos SMART (específicos, mensuráveis, atingíveis)',
        confidence: 94
      });

      suggestions.push({
        field: 'metricas',
        currentValue: formMockup.metricas || '',
        suggestedValue: `Métricas de Sucesso:\n- Taxa de resolução automática: 80%\n- Tempo médio de resposta: <30 segundos\n- NPS (Net Promoter Score): +40 pontos\n- Redução de chamadas para atendentes: 60%\n- ROI esperado: 300% em 12 meses`,
        reason: 'Métricas quantificáveis e relevantes para o negócio',
        confidence: 91
      });
    }

    return {
      type: 'suggestions',
      message: 'Com base na sua ideia, sugiro os seguintes objetivos e métricas:',
      suggestions,
      requiresApproval: true
    };
  }

  /**
   * Gera sugestões de cronograma
   */
  async generateTimelineSuggestions(command, formMockup) {
    const suggestions = [];

    suggestions.push({
      field: 'cronograma',
      currentValue: formMockup.cronograma || '',
      suggestedValue: `Cronograma Detalhado:\n\nFase 1 - Discovery (Meses 1-3):\n- Pesquisa e análise de requisitos\n- Prototipagem inicial\n- Validação com usuários\n\nFase 2 - Delivery (Meses 4-6):\n- Desenvolvimento do MVP\n- Testes com 1% da base\n- Ajustes baseados no feedback\n\nFase 3 - Scale (Meses 7-12):\n- Implementação nacional\n- Treinamento das equipes\n- Monitoramento e otimização`,
      reason: 'Cronograma realista seguindo metodologia do Sandbox',
      confidence: 96
    });

    suggestions.push({
      field: 'recursos',
      currentValue: formMockup.recursos || '',
      suggestedValue: `Recursos Necessários:\n\nEquipe:\n- 1 Product Owner\n- 2 Desenvolvedores\n- 1 UX/UI Designer\n- 1 Especialista em IA\n\nTecnologia:\n- Plataforma IBM Watson\n- APIs da CAIXA\n- Infraestrutura cloud\n\nOrçamento estimado: R$ 500.000`,
      reason: 'Recursos dimensionados para o escopo do projeto',
      confidence: 89
    });

    return {
      type: 'suggestions',
      message: 'Preparei um cronograma e lista de recursos para sua ideia:',
      suggestions,
      requiresApproval: true
    };
  }

  /**
   * Gera sugestões gerais
   */
  async generateGeneralSuggestions(command, formMockup) {
    return {
      type: 'general_help',
      message: 'Estou aqui para ajudar! Posso:\n• Melhorar sua ideia\n• Preencher campos em branco\n• Validar o formulário\n• Sugerir objetivos\n• Criar cronograma\n\nO que você gostaria que eu fizesse?',
      quickActions: [
        'Melhorar minha ideia',
        'Preencher campos vazios',
        'Validar formulário',
        'Sugerir objetivos',
        'Criar cronograma'
      ]
    };
  }

  /**
   * Calcula score do formulário
   */
  calculateFormScore(formMockup) {
    let score = 0;
    let maxScore = 0;

    const fields = ['ideaTitle', 'ideaDescription', 'problema', 'publicoAlvo', 'objetivos', 'metricas', 'cronograma', 'recursos'];
    
    fields.forEach(field => {
      maxScore += 10;
      if (formMockup[field]) {
        if (formMockup[field].length > 20) score += 10;
        else if (formMockup[field].length > 10) score += 7;
        else if (formMockup[field].length > 0) score += 4;
      }
    });

    return Math.round((score / maxScore) * 100);
  }
}

const aiOrchestratorInstance = new AIOrchestrator();
export default aiOrchestratorInstance;
