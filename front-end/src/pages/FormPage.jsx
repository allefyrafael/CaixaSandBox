import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FileText,
  Lightbulb,
  Target,
  Clock,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import ChatBot from '../components/ChatBot';

const FormPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const formMethods = useForm();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = formMethods;

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

  const watchedValues = watch();

  // Handle form field updates from chatbot
  const handleFormFieldUpdate = (field, value) => {
    setValue(field, value);
    toast.success(`Campo "${field}" atualizado pelo assistente!`, {
      icon: '🤖'
    });
  };

  // Handle chatbot toggle
  const handleToggleChat = () => {
    setIsChatMinimized(!isChatMinimized);
  };

  // Calculate form completion percentage based on current step fields
  const calculateProgress = () => {
    const stepFields = {
      0: ['ideaTitle', 'ideaDescription', 'problema', 'publicoAlvo'],
      1: ['objetivos', 'metricas', 'resultadosEsperados'],
      2: ['faseDesejada', 'cronograma', 'recursos', 'desafios']
    };
    
    const currentFields = stepFields[currentStep] || [];
    const totalFields = currentFields.length;
    const completedFields = currentFields.filter(field => {
      const value = watchedValues[field];
      return value && value !== '' && value !== undefined;
    }).length;
    
    // Progress within current step (0-100%)
    const stepProgress = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
    
    // Overall progress (step progress + completed steps)
    const overallProgress = (currentStep / steps.length) * 100 + (stepProgress / steps.length);
    
    return Math.min(overallProgress, 100);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store form data for classification
      localStorage.setItem('sandboxFormData', JSON.stringify(data));
      
      toast.success('Formulário enviado com sucesso!');
      navigate('/classificacao');
    } catch (error) {
      toast.error('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
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
    switch (currentStep) {
      case 0:
        return <IdeaStep register={register} errors={errors} />;
      case 1:
        return <ObjectivesStep register={register} errors={errors} />;
      case 2:
        return <TimelineStep register={register} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content - 2 Columns Layout */}
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - ChatBot */}
            {!isChatMinimized && (
              <motion.div 
                className="lg:col-span-1"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="sticky" style={{ top: '6rem', bottom: 0 }}>
                  <div style={{ height: 'calc(100vh - 6rem)' }}>
                    <ChatBot
                      onFormFieldUpdate={handleFormFieldUpdate}
                      formData={watchedValues}
                      isMinimized={isChatMinimized}
                      onToggleMinimize={handleToggleChat}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Right Column - Form */}
            <motion.div 
              className={isChatMinimized ? "lg:col-span-3 lg:pl-20" : "lg:col-span-2"}
              initial={false}
              animate={{
                paddingLeft: isChatMinimized ? '5rem' : '0'
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
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
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
const IdeaStep = ({ register, errors }) => (
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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Público-Alvo
      </label>
      <input
        {...register('publicoAlvo')}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Ex: Clientes da CAIXA, empregados internos, parceiros..."
      />
    </div>
  </div>
);

const ObjectivesStep = ({ register, errors }) => (
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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Métricas de Sucesso
      </label>
      <textarea
        {...register('metricas')}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
        placeholder="Como você medirá o sucesso? Ex: redução de 30% no tempo de atendimento..."
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Resultados Esperados
      </label>
      <textarea
        {...register('resultadosEsperados')}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
        placeholder="Que resultados você espera obter ao final do experimento?"
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
        Fase Desejada *
      </label>
      <select
        {...register('faseDesejada', { required: 'Fase é obrigatória' })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Selecione a fase</option>
        <option value="discovery">Discovery (até 90 dias)</option>
        <option value="delivery">Delivery (até 180 dias)</option>
        <option value="aceleracao">Aceleração (até 360 dias)</option>
      </select>
      {errors.faseDesejada && (
        <p className="mt-1 text-sm text-red-600">{errors.faseDesejada.message}</p>
      )}
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
