import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useAutosave } from '../contexts/AutosaveContext';
import { getIdea, autosaveIdea, createIdea } from '../services/api';
import toast from 'react-hot-toast';
import {
  FileText,
  Lightbulb,
  Target,
  Clock,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Brain
} from 'lucide-react';
import ChatBot from '../components/ChatBot';
import FieldSuggestion from '../components/FieldSuggestion';
import ModerationAlert from '../components/ModerationAlert';
import { getFieldSuggestion } from '../services/api';

const FormPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useFirebaseAuth();
  
  // Ler ideaId de múltiplas formas para garantir que funciona
  const ideaIdFromParams = searchParams.get('ideaId');
  const ideaIdFromUrl = new URLSearchParams(window.location.search).get('ideaId');
  const ideaId = ideaIdFromParams || ideaIdFromUrl;
  
  // Debug: logar quando o componente renderizar
  useEffect(() => {
    console.log('[FormPage DEBUG] Componente renderizado', {
      ideaIdFromParams,
      ideaIdFromUrl,
      ideaId,
      searchParamsString: searchParams.toString(),
      windowLocationSearch: window.location.search,
      windowLocationHref: window.location.href
    });
    
    // Scroll para o topo imediatamente quando o componente renderizar
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [ideaId, ideaIdFromParams, ideaIdFromUrl, searchParams]);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [loadingIdea, setLoadingIdea] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [fieldSuggestions, setFieldSuggestions] = useState({}); // { fieldName: { suggestion, reasoning, confidence } }
  const [loadingSuggestions, setLoadingSuggestions] = useState({}); // { fieldName: true/false }
  const [moderationAlert, setModerationAlert] = useState({ isOpen: false, fieldName: null, offensiveText: null });
  const blockedFieldsRef = useRef(new Set()); // Campos bloqueados para autosave
  
  // Usar contexto de autosave
  const { 
    saving, 
    setSaving, 
    lastSaved, 
    setLastSaved, 
    saveError, 
    setSaveError, 
    isDirty, 
    setIsDirty 
  } = useAutosave();
  
  const formMethods = useForm();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = formMethods;
  const watchedValues = watch();
  const autosaveTimerRef = useRef(null);
  const previousValuesRef = useRef({});
  const saveAbortControllerRef = useRef(null);

  const steps = [
    {
      id: 'idea',
      title: 'Sua Ideia',
      subtitle: 'Descreva sua inovação',
      icon: Lightbulb,
    },
    {
      id: 'objectives',
      title: 'Objetivos e Metas',
      subtitle: 'O que você espera alcançar',
      icon: Target,
    },
    {
      id: 'timeline',
      title: 'Cronograma',
      subtitle: 'Planejamento temporal',
      icon: Clock,
    }
  ];

  // Verificar se tem ideaId na URL
  useEffect(() => {
    console.log('[FormPage DEBUG] useEffect executado', {
      ideaId,
      ideaIdFromParams,
      ideaIdFromUrl,
      isAuthenticated,
      authLoading,
      userUid: user?.uid,
      searchParams: Object.fromEntries(searchParams.entries()),
      windowLocation: window.location.href,
      windowLocationSearch: window.location.search
    });

    // IMPORTANTE: Aguardar a autenticação terminar de carregar antes de verificar
    if (authLoading) {
      console.log('[FormPage DEBUG] ⏳ Aguardando autenticação carregar...');
      return;
    }

    // Se não estiver autenticado após o loading terminar, redirecionar para login
    if (!isAuthenticated || !user?.uid) {
      console.log('[FormPage DEBUG] ❌ Não autenticado após loading, redirecionando para login');
      navigate('/colaborador/login');
      return;
    }

    // Se não tiver ideaId, aguardar um pouco e verificar novamente (pode ser timing issue)
    if (!ideaId) {
      console.log('[FormPage DEBUG] ⚠️ ideaId não encontrado na primeira verificação');
      console.log('[FormPage DEBUG] searchParams:', Object.fromEntries(searchParams.entries()));
      console.log('[FormPage DEBUG] window.location.search:', window.location.search);
      console.log('[FormPage DEBUG] window.location.href:', window.location.href);
      
      // Aguardar um pouco e verificar novamente (pode ser timing issue do React Router)
      const timeoutId = setTimeout(() => {
        const retryIdeaId = searchParams.get('ideaId') || new URLSearchParams(window.location.search).get('ideaId');
        console.log('[FormPage DEBUG] Retry - ideaId após timeout:', retryIdeaId);
        
        if (!retryIdeaId) {
          console.log('[FormPage DEBUG] ⚠️ ideaId ainda não encontrado após timeout, redirecionando');
          navigate('/colaborador/minhas-ideias', { replace: true });
        } else {
          console.log('[FormPage DEBUG] ✅ ideaId encontrado no retry, carregando ideia');
          // Recarregar a página com o ideaId correto
          window.location.href = `/CaixaSandBox/colaborador/formulario?ideaId=${retryIdeaId}`;
        }
      }, 100); // Aguardar 100ms
      
      return () => clearTimeout(timeoutId);
    }

    console.log('[FormPage DEBUG] ✅ ideaId encontrado e autenticado, carregando ideia:', ideaId);
    loadIdea();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaId, ideaIdFromParams, ideaIdFromUrl, isAuthenticated, authLoading, user?.uid, searchParams]);

  // Carregar dados da ideia do backend
  const loadIdea = async () => {
    if (!ideaId || !user?.uid) return;

    try {
      setLoadingIdea(true);
      const idea = await getIdea(user.uid, ideaId);
      
      if (idea) {
        // Mapear campos do backend para o formulário
        const formData = {
          ideaTitle: idea.title || '',
          ideaDescription: idea.description || '',
          problema: idea.dynamic_content?.problema || '',
          publicoAlvo: idea.target_audience || idea.dynamic_content?.publicoAlvo || '',
          objetivos: idea.dynamic_content?.objetivos || '',
          metricas: idea.dynamic_content?.metricas || '',
          resultadosEsperados: idea.dynamic_content?.resultadosEsperados || '',
          cronograma: idea.dynamic_content?.cronograma || '',
          recursos: idea.dynamic_content?.recursos || '',
          desafios: idea.dynamic_content?.desafios || ''
        };
        
        reset(formData);
        previousValuesRef.current = formData;
        
        // Marcar como salvo quando carrega os dados (já estão no banco)
        setLastSaved(new Date());
        setIsDirty(false);
        
        // Scroll para o topo após carregar os dados
        // Usar setTimeout para garantir que o DOM foi atualizado
        setTimeout(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          // Também garantir que o scroll está no topo após renderização completa
          requestAnimationFrame(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          });
        }, 100);
      } else {
        // Se ideia não existe, criar nova
        toast.info('Ideia não encontrada. Criando nova...');
        const newIdea = await createIdea(user.uid, 'Nova Ideia');
        navigate(`/colaborador/formulario?ideaId=${newIdea.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Erro ao carregar ideia:', error);
      toast.error('Erro ao carregar ideia. Tente novamente.');
    } finally {
      setLoadingIdea(false);
    }
  };

  // Autosave otimizado com debounce inteligente
  useEffect(() => {
    if (!ideaId || !user?.uid || loadingIdea) return;

    // Limpar timer anterior
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    // Verificar se algum campo está bloqueado
    const hasBlockedField = Object.keys(watchedValues).some(field => 
      blockedFieldsRef.current.has(field) && watchedValues[field]?.trim()
    );
    
    if (hasBlockedField) {
      // Se houver campo bloqueado, não tentar autosave
      return;
    }

    // Comparação inteligente usando JSON.stringify para objetos aninhados
    const currentValuesStr = JSON.stringify(watchedValues);
    const previousValuesStr = JSON.stringify(previousValuesRef.current);

    // Verificar se realmente houve mudanças
    const hasChanges = currentValuesStr !== previousValuesStr;

    if (!hasChanges) {
      setIsDirty(false);
      return;
    }

    setIsDirty(true);
    setPendingSave(true);

    // Configurar novo timer com debounce de 3 segundos
    autosaveTimerRef.current = setTimeout(async () => {
      await performAutosave();
      setPendingSave(false);
    }, 3000);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValues, ideaId, user?.uid, loadingIdea]);

  // Salvar ao mudar de seção
  useEffect(() => {
    if (isDirty && !saving && ideaId && user?.uid) {
      // Salvar imediatamente ao mudar de seção
      performAutosave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Função de autosave otimizada
  const performAutosave = useCallback(async () => {
    if (!ideaId || !user?.uid || saving) return;

    // Cancelar requisição anterior se existir
    if (saveAbortControllerRef.current) {
      saveAbortControllerRef.current.abort();
    }

    // Criar novo AbortController para esta requisição
    saveAbortControllerRef.current = new AbortController();

    try {
      setSaving(true);
      setSaveError(null);
      
      // Mapear campos do formulário para o formato do backend
      const updateData = {
        title: watchedValues.ideaTitle || '',
        description: watchedValues.ideaDescription || '',
        target_audience: watchedValues.publicoAlvo || '',
        dynamic_content: {
          problema: watchedValues.problema || '',
          objetivos: watchedValues.objetivos || '',
          metricas: watchedValues.metricas || '',
          resultadosEsperados: watchedValues.resultadosEsperados || '',
          cronograma: watchedValues.cronograma || '',
          recursos: watchedValues.recursos || '',
          desafios: watchedValues.desafios || ''
        }
      };

      await autosaveIdea(user.uid, ideaId, updateData);
      
      previousValuesRef.current = JSON.parse(JSON.stringify(watchedValues)); // Deep copy
      setLastSaved(new Date());
      setIsDirty(false);
      setSaveError(null);
    } catch (error) {
      if (error.name === 'AbortError') {
        // Requisição foi cancelada, ignorar
        return;
      }
      
      // Tratamento especial para erro de moderação
      if (error.isModerationError || (error.status === 400 && error.message?.includes('inapropriado'))) {
        // Detectar qual campo contém conteúdo ofensivo
        let offensiveField = null;
        let offensiveText = '';
        
        // Mapeamento de campos backend -> frontend
        const fieldMapping = {
          'title': 'ideaTitle',
          'description': 'ideaDescription',
          'target_audience': 'publicoAlvo',
          'problema': 'problema',
          'objetivos': 'objetivos',
          'metricas': 'metricas',
          'resultadosEsperados': 'resultadosEsperados',
          'cronograma': 'cronograma',
          'recursos': 'recursos',
          'desafios': 'desafios'
        };
        
        // Tentar identificar o campo pelo erro
        const errorMsg = (error.message || '').toLowerCase();
        
        // Verificar mensagens específicas do backend
        if (errorMsg.includes('título') || errorMsg.includes('title')) {
          offensiveField = 'ideaTitle';
          offensiveText = watchedValues.ideaTitle || '';
        } else if (errorMsg.includes('descrição') || errorMsg.includes('description') || errorMsg.includes('descricao')) {
          offensiveField = 'ideaDescription';
          offensiveText = watchedValues.ideaDescription || '';
        } else {
          // Verificar todos os campos que foram enviados no updateData
          // O último campo modificado provavelmente é o ofensivo
          const updateData = {
            title: watchedValues.ideaTitle || '',
            description: watchedValues.ideaDescription || '',
            target_audience: watchedValues.publicoAlvo || '',
            dynamic_content: {
              problema: watchedValues.problema || '',
              objetivos: watchedValues.objetivos || '',
              metricas: watchedValues.metricas || '',
              resultadosEsperados: watchedValues.resultadosEsperados || '',
              cronograma: watchedValues.cronograma || '',
              recursos: watchedValues.recursos || '',
              desafios: watchedValues.desafios || ''
            }
          };
          
          // Verificar campos principais primeiro
          if (updateData.title && errorMsg.includes('título')) {
            offensiveField = 'ideaTitle';
            offensiveText = updateData.title;
          } else if (updateData.description && errorMsg.includes('descrição')) {
            offensiveField = 'ideaDescription';
            offensiveText = updateData.description;
          } else if (updateData.target_audience && errorMsg.includes('público')) {
            offensiveField = 'publicoAlvo';
            offensiveText = updateData.target_audience;
          } else {
            // Verificar campos dinâmicos
            for (const [backendField, frontendField] of Object.entries(fieldMapping)) {
              if (backendField === 'title' || backendField === 'description' || backendField === 'target_audience') {
                continue; // Já verificados
              }
              
              const fieldValue = watchedValues[frontendField] || '';
              if (fieldValue && fieldValue.trim()) {
                // Verificar se o erro menciona este campo
                const fieldNameLower = backendField.toLowerCase();
                if (errorMsg.includes(fieldNameLower) || errorMsg.includes(frontendField.toLowerCase())) {
                  offensiveField = frontendField;
                  offensiveText = fieldValue;
                  break;
                }
              }
            }
            
            // Se ainda não encontrou, verificar o último campo modificado comparando com previousValues
            if (!offensiveField) {
              const previous = previousValuesRef.current || {};
              for (const [frontendField, currentValue] of Object.entries(watchedValues)) {
                const previousValue = previous[frontendField] || '';
                if (currentValue && currentValue.trim() && currentValue !== previousValue) {
                  // Este campo foi modificado recentemente, pode ser o ofensivo
                  offensiveField = frontendField;
                  offensiveText = currentValue;
                  break;
                }
              }
            }
          }
        }
        
        // Se encontrou campo ofensivo, limpar e bloquear
        if (offensiveField) {
          // Limpar o campo ofensivo
          setValue(offensiveField, '');
          
          // Bloquear autosave para este campo temporariamente
          blockedFieldsRef.current.add(offensiveField);
          
          // Atualizar previousValues para não tentar salvar novamente
          const cleanedValues = { ...watchedValues };
          cleanedValues[offensiveField] = '';
          previousValuesRef.current = JSON.parse(JSON.stringify(cleanedValues));
          
          // Mostrar alerta
          setModerationAlert({
            isOpen: true,
            fieldName: offensiveField,
            offensiveText: offensiveText
          });
          
          // Remover bloqueio após 5 segundos (tempo para usuário ver o alerta)
          setTimeout(() => {
            blockedFieldsRef.current.delete(offensiveField);
          }, 5000);
          
          // Não mostrar toast adicional, o alerta já mostra
          return;
        }
      }
      
      console.error('Erro no autosave:', error);
      setSaveError(error.message || 'Erro ao salvar');
      toast.error('Erro ao salvar. Tente novamente.', {
        icon: '❌',
        duration: 3000
      });
    } finally {
      setSaving(false);
      saveAbortControllerRef.current = null;
    }
  }, [ideaId, user?.uid, saving, watchedValues, setValue]);

  // Handle form field updates from chatbot
  const handleFormFieldUpdate = (field, value) => {
    setValue(field, value);
    toast.success(`Campo atualizado pelo assistente!`, {
      icon: '🤖',
      duration: 3000
    });
  };

  // Solicitar sugestão da IA para um campo opcional
  const requestFieldSuggestion = async (fieldName) => {
    if (!ideaId || !user?.uid || loadingSuggestions[fieldName]) return;

    // Campos opcionais que podem receber sugestões
    const optionalFields = ['publicoAlvo', 'metricas', 'resultadosEsperados'];
    if (!optionalFields.includes(fieldName)) {
      toast.error('Este campo não pode receber sugestões da IA', {
        icon: '⚠️',
        duration: 3000
      });
      return;
    }

    try {
      setLoadingSuggestions(prev => ({ ...prev, [fieldName]: true }));
      
      const suggestion = await getFieldSuggestion(
        user.uid,
        ideaId,
        fieldName,
        watchedValues,
        currentStep
      );

      setFieldSuggestions(prev => ({
        ...prev,
        [fieldName]: {
          suggestion: suggestion.suggestion,
          reasoning: suggestion.reasoning,
          confidence: suggestion.confidence
        }
      }));
    } catch (error) {
      console.error('Erro ao buscar sugestão:', error);
      toast.error('Erro ao gerar sugestão. Tente novamente.', {
        icon: '❌',
        duration: 3000
      });
    } finally {
      setLoadingSuggestions(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  // Aceitar sugestão
  const handleAcceptSuggestion = (fieldName, value) => {
    // Simular digitação da IA
    const typingSpeed = 30; // ms por caractere
    let currentIndex = 0;
    const fullText = value;

    const typeInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setValue(fieldName, fullText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setFieldSuggestions(prev => {
          const newState = { ...prev };
          delete newState[fieldName];
          return newState;
        });
        toast.success('Sugestão aplicada!', {
          icon: '✅',
          duration: 2000
        });
      }
    }, typingSpeed);
  };

  // Rejeitar sugestão
  const handleRejectSuggestion = (fieldName) => {
    setFieldSuggestions(prev => {
      const newState = { ...prev };
      delete newState[fieldName];
      return newState;
    });
  };

  // Handle chatbot toggle
  const handleToggleChat = () => {
    setIsChatMinimized(!isChatMinimized);
  };


  const onSubmit = async (data) => {
    if (!ideaId || !user?.uid) {
      toast.error('Erro: ID da ideia ou usuário não encontrado');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Salvar dados finais
      const finalData = {
        title: data.ideaTitle || '',
        description: data.ideaDescription || '',
        target_audience: data.publicoAlvo || '',
        status: 'submitted', // Marcar como enviado
        dynamic_content: {
          problema: data.problema || '',
          objetivos: data.objetivos || '',
          metricas: data.metricas || '',
          resultadosEsperados: data.resultadosEsperados || '',
          cronograma: data.cronograma || '',
          recursos: data.recursos || '',
          desafios: data.desafios || ''
        }
      };

      await autosaveIdea(user.uid, ideaId, finalData);
      
      toast.success('Formulário enviado com sucesso! Redirecionando...', {
        icon: '✅',
        duration: 3000
      });
      navigate('/colaborador/minhas-ideias');
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      toast.error('Erro ao enviar formulário. Verifique sua conexão e tente novamente.', {
        icon: '❌',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    // Salvar antes de mudar de seção se houver mudanças
    if (isDirty && !saving && ideaId && user?.uid) {
      await performAutosave();
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    const stepProps = {
      register,
      errors,
      requestFieldSuggestion,
      loadingSuggestions,
      fieldSuggestions,
      handleAcceptSuggestion,
      handleRejectSuggestion
    };
    
    switch (currentStep) {
      case 0:
        return <IdeaStep {...stepProps} />;
      case 1:
        return <ObjectivesStep {...stepProps} />;
      case 2:
        return <TimelineStep register={register} errors={errors} />;
      default:
        return null;
    }
  };

  // Mostrar loading enquanto verifica autenticação ou carrega a ideia
  if (authLoading || loadingIdea) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-caixa-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            {authLoading ? 'Verificando autenticação...' : 'Carregando formulário...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Moderation Alert */}
      <ModerationAlert
        isOpen={moderationAlert.isOpen}
        onClose={() => setModerationAlert({ isOpen: false, fieldName: null, offensiveText: null })}
        fieldName={moderationAlert.fieldName}
        offensiveText={moderationAlert.offensiveText}
      />
      
      <div className="min-h-screen bg-gray-50 flex">
        {/* Main Content - Flexbox Layout */}
        <div className="flex-1 pt-20 flex transition-all duration-300 ease-in-out">
        {/* Left Column - ChatBot (Sempre renderizado) */}
        <aside className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${
          isChatMinimized ? 'w-0 overflow-hidden' : 'w-96'
        }`}>
          <div className={`sticky transition-all duration-300 ease-in-out ${
            isChatMinimized ? 'px-0' : 'px-6'
          }`} style={{ top: '6rem', bottom: 0 }}>
            <div style={{ height: 'calc(100vh - 6rem)' }}>
              <ChatBot
                onFormFieldUpdate={handleFormFieldUpdate}
                formData={watchedValues}
                isMinimized={isChatMinimized}
                onToggleMinimize={handleToggleChat}
                currentStep={currentStep}
                stepId={steps[currentStep]?.id}
                stepName={steps[currentStep]?.title}
              />
            </div>
          </div>
        </aside>

        {/* Right Column - Form */}
        <main 
          className={`flex-1 flex transition-all duration-300 ease-in-out px-4 sm:px-6 lg:px-8 ${
            isChatMinimized ? 'justify-center lg:pr-20' : 'justify-start lg:pl-4 lg:pr-8'
          }`}
        >
          <div 
            className={`w-full transition-all duration-300 ease-in-out ${
              isChatMinimized ? 'max-w-5xl' : 'max-w-5xl'
            }`}
          >
              {/* Progress Bar - Above Form (Not Fixed) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                {/* Form Header */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-blue-600">
                      Formulário de Experimento
                    </h1>
                        <p className="text-sm text-gray-600">
                          Transforme sua ideia em realidade. Use o chat ao lado para obter ajuda.
                        </p>
                      </div>
                    </div>

                {/* Steps Indicator */}
                <div className="flex items-center justify-center space-x-8">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    
                    return (
                      <div key={step.id} className="flex flex-col items-center relative">
                        {/* Connection Line */}
                        {index < steps.length - 1 && (
                          <div className="absolute top-4 left-full w-full h-0.5 bg-gray-200 z-0" style={{ width: 'calc(100% + 2rem)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ 
                                width: index < currentStep ? '100%' : '0%' 
                              }}
                              transition={{ duration: 0.5 }}
                              className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                            />
                          </div>
                        )}
                        
                        {/* Step Circle */}
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-500 text-white'
                            : isActive 
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-500 text-white shadow-lg'
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        {/* Step Info */}
                        <div className="mt-2 text-center">
                          <p className={`text-sm font-medium ${
                            isActive ? 'text-orange-600' : 'text-gray-600'
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-xs text-gray-500">{step.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      currentStep === 0 
                        ? 'bg-blue-700 text-blue-300 cursor-not-allowed' 
                        : 'bg-white hover:bg-blue-50 text-blue-600'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  {currentStep === steps.length - 1 ? (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-blue-50 text-blue-600 rounded-lg font-medium text-sm transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <span>Finalizar</span>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-blue-50 text-blue-600 rounded-lg font-medium text-sm transition-all"
                    >
                      <span>Próximo</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
          </div>
        </main>
      </div>
    </div>
    </>
  );
};

// Step Components
const IdeaStep = ({ register, errors, requestFieldSuggestion, loadingSuggestions, fieldSuggestions, handleAcceptSuggestion, handleRejectSuggestion }) => (
  <div className="space-y-6">
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
        <Lightbulb className="w-6 h-6 text-orange-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Sua Ideia</h2>
        <p className="text-sm text-gray-600">Descreva sua inovação para o Sandbox CAIXA</p>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Título da Ideia *
      </label>
      <input
        {...register('ideaTitle', { required: 'Título é obrigatório' })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Ex: Assistente Virtual para Atendimento ao Cliente"
      />
      {errors.ideaTitle && (
        <p className="mt-1 text-sm text-red-600">{errors.ideaTitle.message}</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Descrição da Ideia *
      </label>
      <textarea
        {...register('ideaDescription', { required: 'Descrição é obrigatória' })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
        placeholder="Descreva sua ideia de forma clara e objetiva..."
      />
      {errors.ideaDescription && (
        <p className="mt-1 text-sm text-red-600">{errors.ideaDescription.message}</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Problema que Resolve
      </label>
      <textarea
        {...register('problema')}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
        placeholder="Que problema específico sua ideia resolve?"
      />
    </div>

    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Público-Alvo
        </label>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => requestFieldSuggestion('publicoAlvo')}
          disabled={loadingSuggestions.publicoAlvo}
          className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingSuggestions.publicoAlvo ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Gerando...</span>
            </>
          ) : (
            <>
              <Brain className="w-3 h-3" />
              <span>Preencher com IA</span>
            </>
          )}
        </motion.button>
      </div>
      <input
        {...register('publicoAlvo')}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Ex: Clientes da CAIXA, empregados internos, parceiros..."
      />
      <FieldSuggestion
        fieldName="publicoAlvo"
        suggestion={fieldSuggestions.publicoAlvo?.suggestion}
        reasoning={fieldSuggestions.publicoAlvo?.reasoning}
        onAccept={() => handleAcceptSuggestion('publicoAlvo', fieldSuggestions.publicoAlvo?.suggestion)}
        onReject={() => handleRejectSuggestion('publicoAlvo')}
        isVisible={!!fieldSuggestions.publicoAlvo}
      />
    </div>
  </div>
);

const ObjectivesStep = ({ register, errors, requestFieldSuggestion, loadingSuggestions, fieldSuggestions, handleAcceptSuggestion, handleRejectSuggestion }) => (
  <div className="space-y-6">
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
        <Target className="w-6 h-6 text-white" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Objetivos e Metas</h2>
        <p className="text-sm text-gray-600">O que você espera alcançar com seu experimento</p>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Objetivos Principais *
      </label>
      <textarea
        {...register('objetivos', { required: 'Objetivos são obrigatórios' })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
        placeholder="Descreva os principais objetivos do seu experimento..."
      />
      {errors.objetivos && (
        <p className="mt-1 text-sm text-red-600">{errors.objetivos.message}</p>
      )}
    </div>

    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Métricas de Sucesso
        </label>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => requestFieldSuggestion('metricas')}
          disabled={loadingSuggestions.metricas}
          className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingSuggestions.metricas ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Gerando...</span>
            </>
          ) : (
            <>
              <Brain className="w-3 h-3" />
              <span>Preencher com IA</span>
            </>
          )}
        </motion.button>
      </div>
      <textarea
        {...register('metricas')}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
        placeholder="Como você medirá o sucesso? Ex: redução de 30% no tempo de atendimento..."
      />
      <FieldSuggestion
        fieldName="metricas"
        suggestion={fieldSuggestions.metricas?.suggestion}
        reasoning={fieldSuggestions.metricas?.reasoning}
        onAccept={() => handleAcceptSuggestion('metricas', fieldSuggestions.metricas?.suggestion)}
        onReject={() => handleRejectSuggestion('metricas')}
        isVisible={!!fieldSuggestions.metricas}
      />
    </div>

    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Resultados Esperados
        </label>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => requestFieldSuggestion('resultadosEsperados')}
          disabled={loadingSuggestions.resultadosEsperados}
          className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingSuggestions.resultadosEsperados ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Gerando...</span>
            </>
          ) : (
            <>
              <Brain className="w-3 h-3" />
              <span>Preencher com IA</span>
            </>
          )}
        </motion.button>
      </div>
      <textarea
        {...register('resultadosEsperados')}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
        placeholder="Que resultados você espera obter ao final do experimento?"
      />
      <FieldSuggestion
        fieldName="resultadosEsperados"
        suggestion={fieldSuggestions.resultadosEsperados?.suggestion}
        reasoning={fieldSuggestions.resultadosEsperados?.reasoning}
        onAccept={() => handleAcceptSuggestion('resultadosEsperados', fieldSuggestions.resultadosEsperados?.suggestion)}
        onReject={() => handleRejectSuggestion('resultadosEsperados')}
        isVisible={!!fieldSuggestions.resultadosEsperados}
      />
    </div>
  </div>
);

const TimelineStep = ({ register, errors }) => (
  <div className="space-y-6">
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
        <Clock className="w-6 h-6 text-white" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Cronograma</h2>
        <p className="text-sm text-gray-600">Planejamento temporal do seu experimento</p>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Cronograma Detalhado
      </label>
      <textarea
        {...register('cronograma')}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
        placeholder="Descreva as principais etapas e prazos do seu experimento..."
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Recursos Necessários
      </label>
      <textarea
        {...register('recursos')}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
        placeholder="Que recursos você precisará? Ex: equipe, tecnologia, orçamento..."
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Principais Desafios
      </label>
      <textarea
        {...register('desafios')}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
        placeholder="Quais desafios você antecipa? Como planeja superá-los?"
      />
    </div>
  </div>
);

export default FormPage;
