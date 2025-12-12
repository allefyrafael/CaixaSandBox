/**
 * Custom Hook para integração entre IA, Chat e Formulário
 * Gerencia todo o fluxo de comunicação e sincronização
 */

import { useState, useEffect, useCallback } from 'react';
import AIOrchestrator from '../services/aiOrchestrator';
import FormMockupService from '../services/formMockupService';
import IBMWatsonClient from '../services/ibmWatsonClient';
import toast from 'react-hot-toast';

export const useAIFormIntegration = (formMethods) => {
  const [mockup, setMockup] = useState(null);
  const [pendingSuggestions, setPendingSuggestions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [mockupStats, setMockupStats] = useState(null);

  const { watch, setValue, getValues } = formMethods;
  const watchedValues = watch();

  // Inicializa o mockup quando o componente monta
  useEffect(() => {
    const initializeMockup = () => {
      let currentMockup = FormMockupService.getCurrentMockup();
      
      if (!currentMockup) {
        currentMockup = FormMockupService.createMockup(watchedValues);
        toast.success('Mockup do formulário criado!', { icon: '🤖' });
      } else {
        // Sincroniza com dados atuais do formulário
        currentMockup = FormMockupService.syncWithForm(watchedValues);
      }

      setMockup(currentMockup);
      setPendingSuggestions(FormMockupService.getPendingSuggestions());
      setMockupStats(FormMockupService.getMockupStats());
    };

    initializeMockup();
  }, []);

  // Sincroniza mudanças do formulário com o mockup
  useEffect(() => {
    if (mockup) {
      const timeoutId = setTimeout(() => {
        const updatedMockup = FormMockupService.syncWithForm(watchedValues);
        setMockup(updatedMockup);
        setMockupStats(FormMockupService.getMockupStats());
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [watchedValues, mockup]);

  /**
   * Processa comando do chat
   */
  const processAICommand = useCallback(async (command) => {
    if (!command.trim()) {
      return {
        type: 'error',
        message: 'Por favor, digite um comando válido.'
      };
    }

    setIsProcessing(true);

    try {
      // Validação do conteúdo
      const validation = await AIOrchestrator.validateContent(command);
      
      if (!validation.isValid) {
        setIsProcessing(false);
        return {
          type: 'validation_error',
          message: validation.message,
          reason: validation.reason
        };
      }

      // Processa o comando com a IA
      const currentMockupData = mockup ? mockup.data : watchedValues;
      const aiResponse = await AIOrchestrator.processCommand(command, currentMockupData);

      // Adiciona mensagem da IA ao chat
      const aiMessage = {
        id: Date.now(),
        type: 'ai',
        content: aiResponse.message,
        timestamp: new Date(),
        response: aiResponse
      };

      setAiMessages(prev => [...prev, aiMessage]);

      // Se há sugestões, adiciona ao mockup
      if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
        const updatedMockup = FormMockupService.addAISuggestions(aiResponse.suggestions);
        setMockup(updatedMockup);
        setPendingSuggestions(FormMockupService.getPendingSuggestions());
        setMockupStats(FormMockupService.getMockupStats());
      }

      setIsProcessing(false);
      return aiResponse;

    } catch (error) {
      console.error('Erro no processamento da IA:', error);
      setIsProcessing(false);
      return {
        type: 'error',
        message: 'Erro interno na IA. Tente novamente em alguns instantes.'
      };
    }
  }, [mockup, watchedValues]);

  /**
   * Aprova uma sugestão da IA
   */
  const approveSuggestion = useCallback((suggestionId) => {
    try {
      const updatedMockup = FormMockupService.approveSuggestion(suggestionId);
      
      if (updatedMockup) {
        setMockup(updatedMockup);
        setPendingSuggestions(FormMockupService.getPendingSuggestions());
        setMockupStats(FormMockupService.getMockupStats());

        // Encontra a sugestão aprovada
        const approvedSuggestion = updatedMockup.aiSuggestions.find(s => s.id === suggestionId);
        
        if (approvedSuggestion) {
          // Atualiza o formulário real com a sugestão aprovada
          setValue(approvedSuggestion.field, approvedSuggestion.suggestedValue);
          
          toast.success(`Sugestão aplicada ao campo "${approvedSuggestion.field}"!`, {
            icon: '✅'
          });

          // Adiciona mensagem de confirmação ao chat
          const confirmationMessage = {
            id: Date.now(),
            type: 'ai',
            content: `✅ Perfeito! Apliquei a sugestão no campo "${approvedSuggestion.field}". A mudança já está visível no seu formulário.`,
            timestamp: new Date(),
            isConfirmation: true
          };

          setAiMessages(prev => [...prev, confirmationMessage]);
        }
      }
    } catch (error) {
      console.error('Erro ao aprovar sugestão:', error);
      toast.error('Erro ao aplicar sugestão. Tente novamente.');
    }
  }, [setValue]);

  /**
   * Rejeita uma sugestão da IA
   */
  const rejectSuggestion = useCallback((suggestionId, reason = '') => {
    try {
      const updatedMockup = FormMockupService.rejectSuggestion(suggestionId, reason);
      
      if (updatedMockup) {
        setMockup(updatedMockup);
        setPendingSuggestions(FormMockupService.getPendingSuggestions());
        setMockupStats(FormMockupService.getMockupStats());

        toast.success('Sugestão rejeitada.', { icon: '❌' });

        // Adiciona mensagem de feedback ao chat
        const feedbackMessage = {
          id: Date.now(),
          type: 'ai',
          content: `Entendi! Rejeitei a sugestão. ${reason ? `Motivo: ${reason}` : ''} Posso ajudar de outra forma?`,
          timestamp: new Date(),
          isConfirmation: true
        };

        setAiMessages(prev => [...prev, feedbackMessage]);
      }
    } catch (error) {
      console.error('Erro ao rejeitar sugestão:', error);
      toast.error('Erro ao rejeitar sugestão. Tente novamente.');
    }
  }, []);

  /**
   * Envia mockup para análise da IA (IBM Watson)
   */
  const sendMockupToAI = useCallback(async () => {
    if (!mockup) {
      toast.error('Nenhum mockup disponível para envio.');
      return;
    }

    setIsProcessing(true);

    try {
      // Exporta o mockup completo
      const exportedMockup = FormMockupService.exportMockup();
      
      toast.loading('Enviando para análise do IBM Watson...', { duration: 3000 });

      // Processa com IBM Watson
      const watsonAnalysis = await IBMWatsonClient.processFormData(exportedMockup.formData);

      // Converte sugestões do Watson para formato do sistema
      if (watsonAnalysis.suggestions && watsonAnalysis.suggestions.length > 0) {
        const updatedMockup = FormMockupService.addAISuggestions(watsonAnalysis.suggestions);
        setMockup(updatedMockup);
        setPendingSuggestions(FormMockupService.getPendingSuggestions());
        setMockupStats(FormMockupService.getMockupStats());
      }

      toast.success('Análise completa do IBM Watson!', {
        icon: '🤖',
        duration: 3000
      });

      // Adiciona mensagem de confirmação ao chat
      const confirmationMessage = {
        id: Date.now(),
        type: 'ai',
        content: `🤖 **Análise IBM Watson Completa!**\n\n**Score de Viabilidade:** ${watsonAnalysis.viabilityScore || 'N/A'}%\n\n**Pontos Fortes:** ${watsonAnalysis.strengths?.length || 0} identificados\n**Sugestões:** ${watsonAnalysis.suggestions?.length || 0} geradas\n**Lacunas:** ${watsonAnalysis.gaps?.length || 0} encontradas\n\n${watsonAnalysis.fullResponse ? watsonAnalysis.fullResponse.substring(0, 300) + '...' : ''}`,
        timestamp: new Date(),
        isConfirmation: true,
        watsonData: watsonAnalysis
      };

      setAiMessages(prev => [...prev, confirmationMessage]);
      setIsProcessing(false);

      return {
        ...exportedMockup,
        watsonAnalysis
      };

    } catch (error) {
      console.error('Erro ao processar com Watson:', error);
      
      // Fallback para processamento local
      toast.error('Watson indisponível. Usando análise local...', { duration: 2000 });
      
      try {
        // Processamento local como backup
        const localAnalysis = await AIOrchestrator.processCommand('validar formulário completo', mockup.data);
        
        if (localAnalysis.suggestions && localAnalysis.suggestions.length > 0) {
          const updatedMockup = FormMockupService.addAISuggestions(localAnalysis.suggestions);
          setMockup(updatedMockup);
          setPendingSuggestions(FormMockupService.getPendingSuggestions());
          setMockupStats(FormMockupService.getMockupStats());
        }

        const fallbackMessage = {
          id: Date.now(),
          type: 'ai',
          content: `⚡ Análise local concluída! Formulário analisado com ${localAnalysis.suggestions?.length || 0} sugestões geradas. Sistema funcionando em modo offline.`,
          timestamp: new Date(),
          isConfirmation: true
        };

        setAiMessages(prev => [...prev, fallbackMessage]);
        
        toast.success('Análise local concluída!', { icon: '⚡' });
        
      } catch (fallbackError) {
        console.error('Erro no fallback local:', fallbackError);
        toast.error('Erro na análise. Tente novamente.');
      }
      
      setIsProcessing(false);
      throw error;
    }
  }, [mockup]);

  /**
   * Obtém diferenças entre mockup e formulário
   */
  const getMockupDifferences = useCallback(() => {
    if (!mockup) return [];
    return FormMockupService.getMockupDifferences(watchedValues);
  }, [mockup, watchedValues]);

  /**
   * Limpa o mockup e reinicia
   */
  const resetMockup = useCallback(() => {
    FormMockupService.clearMockup();
    const newMockup = FormMockupService.createMockup(watchedValues);
    setMockup(newMockup);
    setPendingSuggestions([]);
    setMockupStats(FormMockupService.getMockupStats());
    setAiMessages([]);
    toast.success('Mockup reiniciado!', { icon: '🔄' });
  }, [watchedValues]);

  /**
   * Valida formulário via IA
   */
  const validateFormWithAI = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      const currentData = mockup ? mockup.data : watchedValues;
      const validation = await AIOrchestrator.processCommand('validar formulário completo', currentData);
      
      const validationMessage = {
        id: Date.now(),
        type: 'ai',
        content: validation.message,
        timestamp: new Date(),
        response: validation
      };

      setAiMessages(prev => [...prev, validationMessage]);
      setIsProcessing(false);
      
      return validation;
    } catch (error) {
      console.error('Erro na validação:', error);
      setIsProcessing(false);
      throw error;
    }
  }, [mockup, watchedValues]);

  /**
   * Aplica uma ação rápida
   */
  const executeQuickAction = useCallback(async (action) => {
    const actionCommands = {
      'Melhorar minha ideia': 'melhorar e aprimorar minha ideia',
      'Preencher campos vazios': 'preencher campos que estão vazios',
      'Validar formulário': 'validar meu formulário completo',
      'Sugerir objetivos': 'sugerir objetivos e métricas para minha ideia',
      'Criar cronograma': 'criar cronograma detalhado para meu projeto'
    };

    const command = actionCommands[action];
    if (command) {
      return await processAICommand(command);
    }
  }, [processAICommand]);

  return {
    // Estado
    mockup,
    pendingSuggestions,
    isProcessing,
    aiMessages,
    mockupStats,

    // Ações
    processAICommand,
    approveSuggestion,
    rejectSuggestion,
    sendMockupToAI,
    validateFormWithAI,
    executeQuickAction,
    resetMockup,

    // Utilitários
    getMockupDifferences,
    
    // Dados
    mockupData: mockup ? mockup.data : {},
    formCompletion: mockupStats ? mockupStats.completionScore : 0
  };
};
