import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useAutosave } from '../contexts/AutosaveContext';
import { getIdea, autosaveIdea, createIdea, submitIdea, validateFields } from '../services/api';
import toast from 'react-hot-toast';
import {
  FileText,
  Lightbulb,
  Target,
  Clock,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Brain,
  AlertTriangle,
  HelpCircle,
  CheckCircle,
  Circle,
  Ban
} from 'lucide-react';
import ChatBot from '../components/ChatBot';
import FieldSuggestion from '../components/FieldSuggestion';
import ModerationAlert from '../components/ModerationAlert';
import { getFieldSuggestion } from '../services/api';

// Componente helper para indicador de validação
// IMPORTANTE: Definir ANTES de FormPage para evitar problemas de hoisting
const ValidationIndicator = ({ fieldName, fieldValidationErrors, fieldValue, isValidated = false }) => {
  if (!fieldName) {
    return null;
  }
  
  // Determinar estado do campo
  let state = 'empty'; // empty, valid, offensive, outOfContext
  let error = null;
  
  // PRIORIDADE 1: Se há erro de validação, sempre mostrar
  if (fieldValidationErrors && fieldValidationErrors[fieldName]) {
    error = fieldValidationErrors[fieldName];
    state = error.tipo === 'ofensivo' ? 'offensive' : 'outOfContext';
    console.log(`[ValidationIndicator] ${fieldName} tem erro:`, error);
  } else if (fieldValue && fieldValue.trim() && isValidated) {
    // Campo tem valor e foi validado sem erros
    state = 'valid';
  } else if (!fieldValue || !fieldValue.trim()) {
    // Campo está vazio
    state = 'empty';
  }
  
  // SEMPRE mostrar se houver erro, mesmo se o campo estiver vazio
  // Não mostrar apenas se estiver vazio E não validado E não houver erro
  if (state === 'empty' && !isValidated && !error) {
    return null;
  }
  
  console.log(`[ValidationIndicator] Renderizando ${fieldName} com estado:`, state, { 
    fieldValue, 
    isValidated, 
    hasError: !!error,
    fieldValidationErrors: fieldValidationErrors?.[fieldName]
  });
  
  // Configurar ícone e cores baseado no estado
  let Icon, color, bgColor, borderColor, title;
  
  switch (state) {
    case 'valid':
      Icon = CheckCircle;
      color = 'text-green-600';
      bgColor = 'bg-green-100';
      borderColor = 'border-green-400';
      title = 'Campo válido';
      break;
    case 'offensive':
      Icon = Ban;
      color = 'text-red-600';
      bgColor = 'bg-red-100';
      borderColor = 'border-red-400';
      title = error?.justificativa || 'Conteúdo ofensivo detectado';
      break;
    case 'outOfContext':
      Icon = HelpCircle;
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-100';
      borderColor = 'border-yellow-400';
      title = error?.justificativa || 'Conteúdo fora de contexto';
      break;
    case 'empty':
    default:
      Icon = Circle;
      color = 'text-gray-400';
      bgColor = 'bg-gray-100';
      borderColor = 'border-gray-300';
      title = 'Campo vazio';
      break;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        duration: 0.3 
      }}
      className={`absolute top-0 right-0 mt-2 mr-2 ${bgColor} ${borderColor} border-2 rounded-full p-2 z-20 shadow-lg`}
      title={title}
      style={{ zIndex: 20 }}
    >
      <Icon className={`w-5 h-5 ${color}`} />
    </motion.div>
  );
};

const FormPage = () => {
  // LOG CRÍTICO: Confirmar que este arquivo está sendo carregado
  console.log('[FormPage] ========== ARQUIVO CORRETO CARREGADO ==========');
  console.log('[FormPage] Timestamp:', new Date().toISOString());
  console.log('[FormPage] ValidationIndicator definido:', typeof ValidationIndicator !== 'undefined');
  console.log('[FormPage] ModerationAlert importado:', typeof ModerationAlert !== 'undefined');
  
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
  const [fieldValidationErrors, setFieldValidationErrors] = useState({}); // { fieldName: { tipo: 'ofensivo' | 'fora_contexto', justificativa: '...' } }
  const [validatedFields, setValidatedFields] = useState({}); // { fieldName: true } - Campos que já foram validados
  
  // Debug: Log do estado de moderationAlert e fieldValidationErrors
  useEffect(() => {
    console.log('[FormPage] Estado atual de moderationAlert:', moderationAlert);
    console.log('[FormPage] Estado atual de fieldValidationErrors:', fieldValidationErrors);
  }, [moderationAlert, fieldValidationErrors]);
  
  // Disparar alerta automaticamente quando fieldValidationErrors mudar
  useEffect(() => {
    const errors = Object.keys(fieldValidationErrors);
    
    console.log('[FormPage] useEffect fieldValidationErrors executado:', {
      errorsCount: errors.length,
      errors,
      fieldValidationErrors,
      watchedValues
    });
    
    if (errors.length > 0) {
      console.log('[FormPage] Erros de validação detectados, disparando alerta:', fieldValidationErrors);
      
      // Pegar o primeiro campo com erro
      const firstErrorField = errors[0];
      const firstError = fieldValidationErrors[firstErrorField];
      
      // Capturar texto problemático - usar o texto do erro se disponível, senão usar watchedValues
      const problematicText = firstError.texto || watchedValues[firstErrorField] || '';
      
      console.log('[FormPage] Texto problemático capturado:', {
        field: firstErrorField,
        textoDoErro: firstError.texto,
        textoDoWatched: watchedValues[firstErrorField],
        textoFinal: problematicText
      });
      
      // Preparar lista de todos os campos com problema
      const todosCampos = errors.map(field => {
        const error = fieldValidationErrors[field];
        return {
          campo: field,
          texto: error.texto || watchedValues[field] || '', // Usar texto do erro se disponível
          tipo: error.tipo,
          justificativa: error.justificativa
        };
      });
      
      // Criar dados do alerta
      const alertData = {
        isOpen: true,
        fieldName: firstErrorField,
        offensiveText: problematicText,
        tipo: firstError.tipo,
        justificativa: firstError.justificativa || (firstError.tipo === 'ofensivo' ? 'Linguagem ofensiva detectada' : 'Conteúdo fora de contexto'),
        todosCampos: todosCampos
      };
      
      console.log('[FormPage] Disparando alerta automaticamente com dados:', alertData);
      
      // Usar setTimeout para garantir que o estado seja atualizado
      setTimeout(() => {
        setModerationAlert(alertData);
      }, 100);
    } else {
      // Se não há erros, fechar alerta se estiver aberto
      if (moderationAlert.isOpen) {
        console.log('[FormPage] Nenhum erro, fechando alerta');
        setModerationAlert({ isOpen: false, fieldName: null, offensiveText: null, tipo: null, justificativa: null, todosCampos: null });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldValidationErrors]);
  
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
  const validationTimerRef = useRef(null);
  const previousValuesRef = useRef({});
  const lastValidatedValuesRef = useRef({});
  const lastValidatedDataStrRef = useRef('');
  const saveAbortControllerRef = useRef(null);
  const isValidatingRef = useRef(false);
  const validationPendingRef = useRef(false);

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

  // Função de validação separada com debounce
  const performValidation = useCallback(async (updateData) => {
    if (!ideaId || !user?.uid || isValidatingRef.current) {
      console.log('[Validation] Pulando - já validando ou sem dados necessários');
      return;
    }
    
    // Verificar se os dados mudaram desde a última validação
    const currentDataStr = JSON.stringify(updateData);
    
    if (currentDataStr === lastValidatedDataStrRef.current) {
      console.log('[Validation] Dados não mudaram desde última validação, pulando...');
      return;
    }
    
    // Verificar se já há uma validação pendente ou em andamento
    if (validationPendingRef.current || isValidatingRef.current) {
      console.log('[Validation] Validação já em andamento ou pendente, aguardando...');
      return;
    }
    
    validationPendingRef.current = true;
    isValidatingRef.current = true;
    
    try {
      console.log('[Validation] Validando dados:', updateData);
      const validationResult = await validateFields(user.uid, updateData);
      console.log('[Validation] Resultado:', validationResult);
      
      // Atualizar última validação
      lastValidatedValuesRef.current = JSON.parse(JSON.stringify(updateData));
      lastValidatedDataStrRef.current = currentDataStr;
      
      if (!validationResult.aprovado) {
        // Campos com problema - atualizar estado de validação
        const newValidationErrors = {};
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
        
        console.log('[Validation] Campos com problema:', validationResult.campos_com_problema);
        console.log('[Validation] Tipo de campos_com_problema:', typeof validationResult.campos_com_problema);
        console.log('[Validation] É array?', Array.isArray(validationResult.campos_com_problema));
        
        if (validationResult.campos_com_problema) {
          const camposArray = Array.isArray(validationResult.campos_com_problema) 
            ? validationResult.campos_com_problema 
            : [validationResult.campos_com_problema];
          
          camposArray.forEach((campoProblema, index) => {
            console.log(`[Validation] Processando campo ${index}:`, campoProblema);
            const backendField = campoProblema.campo || campoProblema.field || campoProblema.nome;
            const frontendField = fieldMapping[backendField] || backendField;
            console.log(`[Validation] Mapeando ${backendField} -> ${frontendField}`);
            
            if (frontendField) {
              // Capturar o texto problemático - priorizar o texto do backend, senão usar watchedValues
              const problematicText = campoProblema.texto || watchedValues[frontendField] || '';
              
              newValidationErrors[frontendField] = {
                tipo: campoProblema.tipo || campoProblema.type || 'ofensivo',
                justificativa: campoProblema.justificativa || campoProblema.message || 'Conteúdo precisa ser revisado',
                texto: problematicText // Texto problemático do backend ou do campo atual
              };
            }
          });
        }
        
        console.log('[Validation] Erros mapeados:', newValidationErrors);
        console.log('[Validation] Quantidade de erros:', Object.keys(newValidationErrors).length);
        
        // Atualizar estado de erros de validação
        // O useEffect vai disparar o alerta automaticamente quando fieldValidationErrors mudar
        setFieldValidationErrors(prev => {
          console.log('[Validation] Estado anterior de fieldValidationErrors:', prev);
          console.log('[Validation] Novo estado de fieldValidationErrors:', newValidationErrors);
          return newValidationErrors;
        });
        
        return false; // Validação falhou
      } else {
        // Validação passou - limpar erros e marcar campos como validados
        console.log('[Validation] Validação aprovada, limpando erros');
        
        // Mapear campos do backend para frontend
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
        
        // Mapear campos validados do backend para frontend
        const newValidatedFields = { ...validatedFields };
        Object.keys(updateData).forEach(backendField => {
          const frontendField = fieldMapping[backendField] || backendField;
          newValidatedFields[frontendField] = true;
        });
        
        // Se houver dynamic_content, mapear também
        if (updateData.dynamic_content) {
          Object.keys(updateData.dynamic_content).forEach(dynamicField => {
            const frontendField = fieldMapping[dynamicField] || dynamicField;
            newValidatedFields[frontendField] = true;
          });
        }
        
        setValidatedFields(newValidatedFields);
        setFieldValidationErrors({});
        setModerationAlert({ isOpen: false, fieldName: null, offensiveText: null, tipo: null, justificativa: null, todosCampos: null });
        return true; // Validação passou
      }
    } catch (validationError) {
      console.error('[Validation] Erro na validação:', validationError);
      return true; // Em caso de erro, permitir salvar (fallback)
    } finally {
      isValidatingRef.current = false;
      validationPendingRef.current = false;
    }
  }, [ideaId, user?.uid, watchedValues]);

  // Validação com debounce separado (mais rápido que autosave)
  // Só validar quando campos relevantes mudarem
  useEffect(() => {
    if (!ideaId || !user?.uid || loadingIdea) return;

    // Limpar timer anterior
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
      validationTimerRef.current = null;
    }

    // Verificar se algum campo está bloqueado
    const hasBlockedField = Object.keys(watchedValues).some(field => 
      blockedFieldsRef.current.has(field) && watchedValues[field]?.trim()
    );
    
    if (hasBlockedField) {
      return;
    }

    // Preparar dados para validação (apenas campos preenchidos)
    const updateData = {};
    if (watchedValues.ideaTitle && watchedValues.ideaTitle.trim()) {
      updateData.title = watchedValues.ideaTitle.trim();
    }
    if (watchedValues.ideaDescription && watchedValues.ideaDescription.trim()) {
      updateData.description = watchedValues.ideaDescription.trim();
    }
    if (watchedValues.publicoAlvo && watchedValues.publicoAlvo.trim()) {
      updateData.target_audience = watchedValues.publicoAlvo.trim();
    }
    
    const dynamicContent = {};
    if (watchedValues.problema && watchedValues.problema.trim()) {
      dynamicContent.problema = watchedValues.problema.trim();
    }
    if (watchedValues.objetivos && watchedValues.objetivos.trim()) {
      dynamicContent.objetivos = watchedValues.objetivos.trim();
    }
    if (watchedValues.metricas && watchedValues.metricas.trim()) {
      dynamicContent.metricas = watchedValues.metricas.trim();
    }
    if (watchedValues.resultadosEsperados && watchedValues.resultadosEsperados.trim()) {
      dynamicContent.resultadosEsperados = watchedValues.resultadosEsperados.trim();
    }
    if (watchedValues.cronograma && watchedValues.cronograma.trim()) {
      dynamicContent.cronograma = watchedValues.cronograma.trim();
    }
    if (watchedValues.recursos && watchedValues.recursos.trim()) {
      dynamicContent.recursos = watchedValues.recursos.trim();
    }
    if (watchedValues.desafios && watchedValues.desafios.trim()) {
      dynamicContent.desafios = watchedValues.desafios.trim();
    }
    
    if (Object.keys(dynamicContent).length > 0) {
      updateData.dynamic_content = dynamicContent;
    }

    // Só validar se houver dados
    if (Object.keys(updateData).length === 0) {
      return;
    }

    // Verificar se os dados mudaram desde a última validação
    const currentDataStr = JSON.stringify(updateData);
    if (currentDataStr === lastValidatedDataStrRef.current) {
      // Dados não mudaram, não validar
      return;
    }

    // Verificar se já está validando ou se há validação pendente
    if (isValidatingRef.current || validationPendingRef.current) {
      return;
    }

    // Configurar timer de validação com debounce de 3 segundos (estilo Word/Google Docs)
    validationTimerRef.current = setTimeout(async () => {
      // Verificar novamente antes de validar (pode ter sido cancelado)
      const finalDataStr = JSON.stringify(updateData);
      if (finalDataStr !== lastValidatedDataStrRef.current && !isValidatingRef.current) {
        await performValidation(updateData);
      }
      validationTimerRef.current = null;
    }, 3000);

    return () => {
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
        validationTimerRef.current = null;
      }
    };
  }, [ideaId, user?.uid, loadingIdea, watchedValues.ideaTitle, watchedValues.ideaDescription, watchedValues.publicoAlvo, watchedValues.problema, watchedValues.objetivos, watchedValues.metricas, watchedValues.resultadosEsperados, watchedValues.cronograma, watchedValues.recursos, watchedValues.desafios, performValidation]);

  // Limpar erros de validação quando o campo é corrigido e validado novamente
  useEffect(() => {
    // Limpar erro de um campo específico se o valor mudou e não há mais erro na validação
    Object.keys(fieldValidationErrors).forEach(fieldName => {
      const currentValue = watchedValues[fieldName] || '';
      const previousValue = previousValuesRef.current[fieldName] || '';
      
      // Se o valor mudou, pode ter sido corrigido
      if (currentValue !== previousValue) {
        // Não limpar imediatamente - aguardar próxima validação
        // A validação vai limpar automaticamente se o campo estiver OK
      }
    });
  }, [watchedValues, fieldValidationErrors]);

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

    // Verificar se há erros de validação - não salvar se houver
    if (Object.keys(fieldValidationErrors).length > 0) {
      console.log('[Autosave] Campos com erro de validação, não salvando');
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

    // Verificar se há erros de validação - NÃO SALVAR se houver
    if (Object.keys(fieldValidationErrors).length > 0) {
      console.log('[Autosave] Validação falhou, não salvando:', fieldValidationErrors);
      setSaveError('Por favor, corrija os erros de validação antes de salvar.');
      return;
    }

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
      // Apenas incluir campos que têm valor (não enviar strings vazias)
      const updateData = {};
      
      // Campos principais - só incluir se tiverem valor
      if (watchedValues.ideaTitle && watchedValues.ideaTitle.trim()) {
        updateData.title = watchedValues.ideaTitle.trim();
      }
      if (watchedValues.ideaDescription && watchedValues.ideaDescription.trim()) {
        updateData.description = watchedValues.ideaDescription.trim();
      }
      if (watchedValues.publicoAlvo && watchedValues.publicoAlvo.trim()) {
        updateData.target_audience = watchedValues.publicoAlvo.trim();
      }
      
      // Dynamic content - só incluir se houver pelo menos um campo preenchido
      const dynamicContent = {};
      if (watchedValues.problema && watchedValues.problema.trim()) {
        dynamicContent.problema = watchedValues.problema.trim();
      }
      if (watchedValues.objetivos && watchedValues.objetivos.trim()) {
        dynamicContent.objetivos = watchedValues.objetivos.trim();
      }
      if (watchedValues.metricas && watchedValues.metricas.trim()) {
        dynamicContent.metricas = watchedValues.metricas.trim();
      }
      if (watchedValues.resultadosEsperados && watchedValues.resultadosEsperados.trim()) {
        dynamicContent.resultadosEsperados = watchedValues.resultadosEsperados.trim();
      }
      if (watchedValues.cronograma && watchedValues.cronograma.trim()) {
        dynamicContent.cronograma = watchedValues.cronograma.trim();
      }
      if (watchedValues.recursos && watchedValues.recursos.trim()) {
        dynamicContent.recursos = watchedValues.recursos.trim();
      }
      if (watchedValues.desafios && watchedValues.desafios.trim()) {
        dynamicContent.desafios = watchedValues.desafios.trim();
      }
      
      // Só incluir dynamic_content se houver pelo menos um campo
      if (Object.keys(dynamicContent).length > 0) {
        updateData.dynamic_content = dynamicContent;
      }
      
      // Só fazer autosave se houver algo para salvar
      if (Object.keys(updateData).length > 0) {
        // VALIDAÇÃO COM AGENTE GUARDIÃO ANTES DE SALVAR
        const validationPassed = await performValidation(updateData);
        
        if (!validationPassed) {
          // NÃO SALVAR - bloquear autosave
          console.log('[Autosave] Validação falhou, não salvando');
          setSaveError('Conteúdo precisa ser revisado antes de salvar');
          return;
        }
        
        // Se passou na validação, salvar
        console.log('[Autosave] Validação aprovada, salvando dados:', updateData);
        await autosaveIdea(user.uid, ideaId, updateData);
        console.log('[Autosave] Dados salvos com sucesso');
        
        // Limpar erros de validação após salvar com sucesso
        setFieldValidationErrors({});
      } else {
        console.log('[Autosave] Nenhum dado para salvar');
      }
      
      previousValuesRef.current = JSON.parse(JSON.stringify(watchedValues)); // Deep copy
      setLastSaved(new Date());
      setIsDirty(false);
      setSaveError(null);
    } catch (error) {
      if (error.name === 'AbortError') {
        // Requisição foi cancelada, ignorar
        return;
      }
      
      // Tratamento especial para erro de moderação do backend
      if (error.status === 400 && error.detail && typeof error.detail === 'object' && error.detail.error === 'moderation_failed') {
        const camposProblema = error.detail.campos_com_problema || [];
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
        
        // Atualizar estado de validação
        const newValidationErrors = {};
        camposProblema.forEach(campoProblema => {
          const frontendField = fieldMapping[campoProblema.campo] || campoProblema.campo;
          newValidationErrors[frontendField] = {
            tipo: campoProblema.tipo,
            justificativa: campoProblema.justificativa
          };
        });
        
        setFieldValidationErrors(newValidationErrors);
        
        // Mostrar alerta
        if (camposProblema.length > 0) {
          const primeiroCampo = camposProblema[0];
          const frontendField = fieldMapping[primeiroCampo.campo] || primeiroCampo.campo;
          setModerationAlert({
            isOpen: true,
            fieldName: frontendField,
            offensiveText: watchedValues[frontendField] || '',
            tipo: primeiroCampo.tipo,
            justificativa: error.detail.justificativa_geral || '',
            todosCampos: camposProblema.map(cp => ({
              campo: fieldMapping[cp.campo] || cp.campo,
              tipo: cp.tipo,
              justificativa: cp.justificativa
            }))
          });
        }
        
        setSaveError('Conteúdo precisa ser revisado antes de salvar');
        return;
      }
      
      // Tratamento de erro antigo (fallback)
      if (error.isModerationError || (error.status === 400 && error.message?.includes('inapropriado'))) {
        // Detectar qual campo contém conteúdo ofensivo
        let offensiveField = null;
        let offensiveText = '';
        
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
        
        const errorMsg = (error.message || '').toLowerCase();
        
        if (errorMsg.includes('título') || errorMsg.includes('title')) {
          offensiveField = 'ideaTitle';
          offensiveText = watchedValues.ideaTitle || '';
        } else if (errorMsg.includes('descrição') || errorMsg.includes('description') || errorMsg.includes('descricao')) {
          offensiveField = 'ideaDescription';
          offensiveText = watchedValues.ideaDescription || '';
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
        } else {
          // Se não conseguiu identificar o campo, limpar todos os campos que foram modificados recentemente
          // como medida de segurança
          const previous = previousValuesRef.current || {};
          for (const [fieldName, currentValue] of Object.entries(watchedValues)) {
            const previousValue = previous[fieldName] || '';
            if (currentValue && currentValue.trim() && currentValue !== previousValue) {
              // Limpar este campo como medida de segurança
              setValue(fieldName, '');
              blockedFieldsRef.current.add(fieldName);
              setTimeout(() => {
                blockedFieldsRef.current.delete(fieldName);
              }, 5000);
            }
          }
          
          // Mostrar alerta genérico
          setModerationAlert({
            isOpen: true,
            fieldName: null,
            offensiveText: error.message || 'Conteúdo inapropriado detectado'
          });
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
  }, [ideaId, user?.uid, saving, watchedValues, setValue, fieldValidationErrors, performValidation]);

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

    // Validar campos obrigatórios antes de submeter
    const camposObrigatorios = {
      'Título': data.ideaTitle,
      'Descrição': data.ideaDescription,
      'Problema': data.problema,
      'Objetivos': data.objetivos,
      'Métricas': data.metricas
    };

    const camposFaltantes = Object.entries(camposObrigatorios)
      .filter(([_, valor]) => !valor || valor.trim() === '')
      .map(([campo, _]) => campo);

    if (camposFaltantes.length > 0) {
      toast.error(`Por favor, preencha os campos obrigatórios: ${camposFaltantes.join(', ')}`, {
        icon: '⚠️',
        duration: 5000
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Primeiro, salvar dados finais (autosave)
      const finalData = {
        title: data.ideaTitle || '',
        description: data.ideaDescription || '',
        target_audience: data.publicoAlvo || '',
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
      
      // Depois, submeter com validação do Agente Guardião e análise do Agente Analista
      const submittedIdea = await submitIdea(user.uid, ideaId);
      
      // Mostrar metadados da IA se disponíveis
      if (submittedIdea.classificacao_ia) {
        const classificacao = submittedIdea.classificacao_ia;
        toast.success(
          `Ideia submetida com sucesso! Categoria: ${classificacao.categoria || 'Não definida'}`, 
          {
            icon: '✅',
            duration: 5000
          }
        );
      } else {
        toast.success('Formulário enviado com sucesso! Redirecionando...', {
          icon: '✅',
          duration: 3000
        });
      }
      
      navigate('/colaborador/minhas-ideias');
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      
      // Tratar erro do Agente Guardião (conteúdo inapropriado)
      if (error.isModerationError || (error.message && error.message.includes('inapropriado'))) {
        toast.error(error.message || 'Conteúdo inapropriado detectado. Por favor, revise sua ideia.', {
          icon: '🚫',
          duration: 8000
        });
        return;
      }
      
      // Tratar erro de autenticação
      if (error.isAuthError || error.status === 401) {
        toast.error('Sua sessão expirou. Por favor, faça login novamente.', {
          icon: '🔒',
          duration: 5000
        });
        return;
      }
      
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
        return <IdeaStep {...stepProps} fieldValidationErrors={fieldValidationErrors} />;
      case 1:
        return <ObjectivesStep {...stepProps} fieldValidationErrors={fieldValidationErrors} />;
      case 2:
        return <TimelineStep register={register} errors={errors} fieldValidationErrors={fieldValidationErrors} />;
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
      {moderationAlert.isOpen && (
        <ModerationAlert
          isOpen={moderationAlert.isOpen}
          onClose={() => {
            console.log('[ModerationAlert] Fechando alerta');
            setModerationAlert({ isOpen: false, fieldName: null, offensiveText: null, tipo: null, justificativa: null, todosCampos: null });
          }}
          fieldName={moderationAlert.fieldName}
          offensiveText={moderationAlert.offensiveText}
          tipo={moderationAlert.tipo}
          justificativa={moderationAlert.justificativa}
          todosCampos={moderationAlert.todosCampos}
        />
      )}
      
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
const IdeaStep = ({ register, errors, requestFieldSuggestion, loadingSuggestions, fieldSuggestions, handleAcceptSuggestion, handleRejectSuggestion, fieldValidationErrors = {}, watchedValues = {}, validatedFields = {} }) => {
  // Debug: verificar se fieldValidationErrors está sendo recebido
  React.useEffect(() => {
    if (Object.keys(fieldValidationErrors).length > 0) {
      console.log('[IdeaStep] fieldValidationErrors recebido:', fieldValidationErrors);
    }
  }, [fieldValidationErrors]);
  
  return (
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
      <div className="relative">
        <input
          {...register('ideaTitle', { required: 'Título é obrigatório' })}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            fieldValidationErrors.ideaTitle 
              ? fieldValidationErrors.ideaTitle.tipo === 'ofensivo'
                ? 'border-red-300 focus:ring-red-500'
                : 'border-yellow-300 focus:ring-yellow-500'
              : 'border-gray-300'
          }`}
          placeholder="Ex: Assistente Virtual para Atendimento ao Cliente"
        />
        <ValidationIndicator 
          fieldName="ideaTitle" 
          fieldValidationErrors={fieldValidationErrors} 
          fieldValue={watchedValues.ideaTitle}
          isValidated={!!validatedFields['ideaTitle']}
        />
      </div>
      {errors.ideaTitle && (
        <p className="mt-1 text-sm text-red-600">{errors.ideaTitle.message}</p>
      )}
      {fieldValidationErrors.ideaTitle && (
        <p className={`mt-1 text-sm ${
          fieldValidationErrors.ideaTitle.tipo === 'ofensivo' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {fieldValidationErrors.ideaTitle.justificativa}
        </p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Descrição da Ideia *
      </label>
      <div className="relative">
        <textarea
          {...register('ideaDescription', { required: 'Descrição é obrigatória' })}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] ${
            fieldValidationErrors.ideaDescription 
              ? fieldValidationErrors.ideaDescription.tipo === 'ofensivo'
                ? 'border-red-300 focus:ring-red-500'
                : 'border-yellow-300 focus:ring-yellow-500'
              : 'border-gray-300'
          }`}
          placeholder="Descreva sua ideia de forma clara e objetiva..."
        />
        <ValidationIndicator 
          fieldName="ideaDescription" 
          fieldValidationErrors={fieldValidationErrors} 
          fieldValue={watchedValues.ideaDescription}
          isValidated={!!validatedFields['ideaDescription']}
        />
      </div>
      {errors.ideaDescription && (
        <p className="mt-1 text-sm text-red-600">{errors.ideaDescription.message}</p>
      )}
      {fieldValidationErrors.ideaDescription && (
        <p className={`mt-1 text-sm ${
          fieldValidationErrors.ideaDescription.tipo === 'ofensivo' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {fieldValidationErrors.ideaDescription.justificativa}
        </p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Problema que Resolve
      </label>
      <div className="relative">
        <textarea
          {...register('problema')}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] ${
            fieldValidationErrors.problema 
              ? fieldValidationErrors.problema.tipo === 'ofensivo'
                ? 'border-red-300 focus:ring-red-500'
                : 'border-yellow-300 focus:ring-yellow-500'
              : 'border-gray-300'
          }`}
          placeholder="Que problema específico sua ideia resolve?"
        />
        <ValidationIndicator 
          fieldName="problema" 
          fieldValidationErrors={fieldValidationErrors} 
          fieldValue={watchedValues.problema}
          isValidated={!!validatedFields['problema']}
        />
      </div>
      {fieldValidationErrors.problema && (
        <p className={`mt-1 text-sm ${
          fieldValidationErrors.problema.tipo === 'ofensivo' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {fieldValidationErrors.problema.justificativa}
        </p>
      )}
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
      <div className="relative">
        <input
          {...register('publicoAlvo')}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            fieldValidationErrors.publicoAlvo 
              ? fieldValidationErrors.publicoAlvo.tipo === 'ofensivo'
                ? 'border-red-300 focus:ring-red-500'
                : 'border-yellow-300 focus:ring-yellow-500'
              : 'border-gray-300'
          }`}
          placeholder="Ex: Clientes da CAIXA, empregados internos, parceiros..."
        />
        <ValidationIndicator 
          fieldName="publicoAlvo" 
          fieldValidationErrors={fieldValidationErrors} 
          fieldValue={watchedValues.publicoAlvo}
          isValidated={!!validatedFields['publicoAlvo']}
        />
      </div>
      {fieldValidationErrors.publicoAlvo && (
        <p className={`mt-1 text-sm ${
          fieldValidationErrors.publicoAlvo.tipo === 'ofensivo' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {fieldValidationErrors.publicoAlvo.justificativa}
        </p>
      )}
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
};

const ObjectivesStep = ({ register, errors, requestFieldSuggestion, loadingSuggestions, fieldSuggestions, handleAcceptSuggestion, handleRejectSuggestion, fieldValidationErrors = {}, watchedValues = {}, validatedFields = {} }) => {
  // Debug: verificar se fieldValidationErrors está sendo recebido
  React.useEffect(() => {
    if (Object.keys(fieldValidationErrors).length > 0) {
      console.log('[ObjectivesStep] fieldValidationErrors recebido:', fieldValidationErrors);
    }
  }, [fieldValidationErrors]);
  
  return (
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
      <div className="relative">
        <textarea
          {...register('objetivos', { required: 'Objetivos são obrigatórios' })}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] ${
            fieldValidationErrors.objetivos 
              ? fieldValidationErrors.objetivos.tipo === 'ofensivo'
                ? 'border-red-300 focus:ring-red-500'
                : 'border-yellow-300 focus:ring-yellow-500'
              : 'border-gray-300'
          }`}
          placeholder="Descreva os principais objetivos do seu experimento..."
        />
        <ValidationIndicator 
          fieldName="objetivos" 
          fieldValidationErrors={fieldValidationErrors} 
          fieldValue={watchedValues.objetivos}
          isValidated={!!validatedFields['objetivos']}
        />
      </div>
      {errors.objetivos && (
        <p className="mt-1 text-sm text-red-600">{errors.objetivos.message}</p>
      )}
      {fieldValidationErrors.objetivos && (
        <p className={`mt-1 text-sm ${
          fieldValidationErrors.objetivos.tipo === 'ofensivo' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {fieldValidationErrors.objetivos.justificativa}
        </p>
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
      <div className="relative">
        <textarea
          {...register('metricas')}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] ${
            fieldValidationErrors.metricas 
              ? fieldValidationErrors.metricas.tipo === 'ofensivo'
                ? 'border-red-300 focus:ring-red-500'
                : 'border-yellow-300 focus:ring-yellow-500'
              : 'border-gray-300'
          }`}
          placeholder="Como você medirá o sucesso? Ex: redução de 30% no tempo de atendimento..."
        />
        <ValidationIndicator 
          fieldName="metricas" 
          fieldValidationErrors={fieldValidationErrors} 
          fieldValue={watchedValues.metricas}
          isValidated={!!validatedFields['metricas']}
        />
      </div>
      {fieldValidationErrors.metricas && (
        <p className={`mt-1 text-sm ${
          fieldValidationErrors.metricas.tipo === 'ofensivo' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {fieldValidationErrors.metricas.justificativa}
        </p>
      )}
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
      <div className="relative">
        <textarea
          {...register('resultadosEsperados')}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] ${
            fieldValidationErrors.resultadosEsperados 
              ? fieldValidationErrors.resultadosEsperados.tipo === 'ofensivo'
                ? 'border-red-300 focus:ring-red-500'
                : 'border-yellow-300 focus:ring-yellow-500'
              : 'border-gray-300'
          }`}
          placeholder="Que resultados você espera obter ao final do experimento?"
        />
        <ValidationIndicator 
          fieldName="resultadosEsperados" 
          fieldValidationErrors={fieldValidationErrors} 
          fieldValue={watchedValues.resultadosEsperados}
          isValidated={!!validatedFields['resultadosEsperados']}
        />
      </div>
      {fieldValidationErrors.resultadosEsperados && (
        <p className={`mt-1 text-sm ${
          fieldValidationErrors.resultadosEsperados.tipo === 'ofensivo' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {fieldValidationErrors.resultadosEsperados.justificativa}
        </p>
      )}
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
};

const TimelineStep = ({ register, errors, fieldValidationErrors = {}, watchedValues = {}, validatedFields = {} }) => {
  // Debug: verificar se fieldValidationErrors está sendo recebido
  React.useEffect(() => {
    if (Object.keys(fieldValidationErrors).length > 0) {
      console.log('[TimelineStep] fieldValidationErrors recebido:', fieldValidationErrors);
    }
  }, [fieldValidationErrors]);
  
  return (
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
      <div className="relative">
        <textarea
          {...register('cronograma')}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] ${
            fieldValidationErrors.cronograma 
              ? fieldValidationErrors.cronograma.tipo === 'ofensivo'
                ? 'border-red-300 focus:ring-red-500'
                : 'border-yellow-300 focus:ring-yellow-500'
              : 'border-gray-300'
          }`}
          placeholder="Descreva as principais etapas e prazos do seu experimento..."
        />
        <ValidationIndicator 
          fieldName="cronograma" 
          fieldValidationErrors={fieldValidationErrors} 
          fieldValue={watchedValues.cronograma}
          isValidated={!!validatedFields['cronograma']}
        />
      </div>
      {fieldValidationErrors.cronograma && (
        <p className={`mt-1 text-sm ${
          fieldValidationErrors.cronograma.tipo === 'ofensivo' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {fieldValidationErrors.cronograma.justificativa}
        </p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Recursos Necessários
      </label>
      <div className="relative">
        <textarea
          {...register('recursos')}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] ${
            fieldValidationErrors.recursos 
              ? fieldValidationErrors.recursos.tipo === 'ofensivo'
                ? 'border-red-300 focus:ring-red-500'
                : 'border-yellow-300 focus:ring-yellow-500'
              : 'border-gray-300'
          }`}
          placeholder="Que recursos você precisará? Ex: equipe, tecnologia, orçamento..."
        />
        <ValidationIndicator 
          fieldName="recursos" 
          fieldValidationErrors={fieldValidationErrors} 
          fieldValue={watchedValues.recursos}
          isValidated={!!validatedFields['recursos']}
        />
      </div>
      {fieldValidationErrors.recursos && (
        <p className={`mt-1 text-sm ${
          fieldValidationErrors.recursos.tipo === 'ofensivo' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {fieldValidationErrors.recursos.justificativa}
        </p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Principais Desafios
      </label>
      <div className="relative">
        <textarea
          {...register('desafios')}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] ${
            fieldValidationErrors.desafios 
              ? fieldValidationErrors.desafios.tipo === 'ofensivo'
                ? 'border-red-300 focus:ring-red-500'
                : 'border-yellow-300 focus:ring-yellow-500'
              : 'border-gray-300'
          }`}
          placeholder="Quais desafios você antecipa? Como planeja superá-los?"
        />
        <ValidationIndicator 
          fieldName="desafios" 
          fieldValidationErrors={fieldValidationErrors} 
          fieldValue={watchedValues.desafios}
          isValidated={!!validatedFields['desafios']}
        />
      </div>
      {fieldValidationErrors.desafios && (
        <p className={`mt-1 text-sm ${
          fieldValidationErrors.desafios.tipo === 'ofensivo' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {fieldValidationErrors.desafios.justificativa}
        </p>
      )}
    </div>
  </div>
  );
};

export default FormPage;
