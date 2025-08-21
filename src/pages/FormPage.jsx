import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FileText,
  Lightbulb,
  Target,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Rocket,
  Sparkles,
  Brain,
  Users,
  Zap,
  Send,
  MessageCircle,
  Eye
} from 'lucide-react';
import ChatBot from '../components/ChatBot';

const FormPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  const steps = [
    {
      id: 'idea',
      title: 'Sua Ideia',
      subtitle: 'Descreva sua inovação',
      icon: Lightbulb,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'objectives',
      title: 'Objetivos e Metas',
      subtitle: 'O que você espera alcançar',
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'timeline',
      title: 'Cronograma',
      subtitle: 'Planejamento temporal',
      icon: Clock,
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-50'
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

  // Send form data to chatbot
  const sendToChatBot = async () => {
    const currentFormData = watchedValues;
    
    // Simulate sending to IBM Watson
    toast.loading('Enviando dados para o assistente IA...', { duration: 2000 });
    
    setTimeout(() => {
      toast.success('Dados enviados com sucesso! O assistente analisará suas informações.', {
        icon: '🚀'
      });
    }, 2000);
  };

  // Calculate form completion percentage
  const calculateProgress = () => {
    const totalFields = 15; // Adjusted for removed sections
    const completedFields = Object.values(watchedValues).filter(value => 
      value && value !== '' && value !== undefined
    ).length;
    return Math.min((completedFields / totalFields) * 100, 100);
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
        return <IdeaStep register={register} errors={errors} setValue={setValue} watch={watch} />;
      case 1:
        return <ObjectivesStep register={register} errors={errors} setValue={setValue} watch={watch} />;
      case 2:
        return <TimelineStep register={register} errors={errors} setValue={setValue} watch={watch} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* ChatBot - Responsive positioning */}
      <div className={`
        fixed z-40 transition-all duration-300
        ${isChatMinimized 
          ? 'bottom-4 left-4 w-auto h-auto' 
          : 'bottom-0 left-0 right-0 h-[45vh] md:top-20 md:left-0 md:w-80 lg:w-96 md:h-[calc(100vh-80px)] md:bottom-auto md:right-auto'
        }
      `}>
        <ChatBot
          onFormFieldUpdate={handleFormFieldUpdate}
          formData={watchedValues}
          isMinimized={isChatMinimized}
          onToggleMinimize={handleToggleChat}
        />
      </div>

      {/* Main Content - Adjusted margin for chat */}
      <div className={`transition-all duration-300 pt-20 ${
        isChatMinimized 
          ? 'pb-4 md:ml-0' 
          : 'pb-[45vh] md:pb-4 md:ml-80 lg:ml-96'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
            className="text-center mb-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-caixa-blue to-caixa-blue-700 rounded-full mb-4"
          >
              <FileText className="w-6 h-6 text-white" />
          </motion.div>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text mb-2">
            Formulário de Experimento
          </h1>
            <p className="text-sm lg:text-base text-gray-600 max-w-2xl mx-auto">
              Transforme sua ideia em realidade. Use o chat {isChatMinimized ? 'minimizado' : 'ao lado'} para obter ajuda.
          </p>
        </motion.div>

          {/* Progress and Steps Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
            className="mb-6"
          >
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-600">Progresso</span>
              <span className="text-xs font-medium text-caixa-blue">{Math.round(calculateProgress())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calculateProgress()}%` }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-caixa-blue to-caixa-blue-700 h-1.5 rounded-full"
              />
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div key={step.id} className="flex flex-col items-center relative">
                    {/* Connection Line */}
                    {index < steps.length - 1 && (
                      <div className="absolute top-4 left-8 w-full h-0.5 bg-gray-200 z-0 hidden sm:block">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ 
                            width: index < currentStep ? '100%' : '0%' 
                          }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-caixa-blue to-caixa-blue-700"
                        />
                      </div>
                    )}
                    
                    {/* Step Circle */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-caixa-blue to-caixa-blue-700 border-caixa-blue text-white'
                          : isActive 
                          ? 'bg-white border-caixa-blue text-caixa-blue shadow-lg'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </motion.div>
                    
                    {/* Step Info */}
                    <div className="mt-1 text-center">
                      <p className={`text-xs sm:text-sm font-medium ${
                        isActive ? 'text-caixa-blue' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 hidden sm:block">{step.subtitle}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>

          {/* Form Content with Navigation */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

            {/* Navigation Buttons - Fixed at bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
              className="sticky bottom-4 bg-white rounded-xl shadow-lg p-4 flex items-center justify-between gap-4"
          >
              {/* Left side - Previous button */}
            <motion.button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              whileHover={{ scale: currentStep === 0 ? 1 : 1.02 }}
              whileTap={{ scale: currentStep === 0 ? 1 : 0.98 }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                currentStep === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Anterior</span>
              </motion.button>

              {/* Center - Action buttons */}
              <div className="flex items-center space-x-2">
                <Link
                  to="/colaborador/minhas-ideias"
                  className="flex items-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Minhas Ideias</span>
                </Link>
                
                <motion.button
                  type="button"
                  onClick={sendToChatBot}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-caixa-blue to-caixa-blue-700 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Enviar para IA</span>
                  <span className="sm:hidden">IA</span>
                </motion.button>
              </div>

              {/* Right side - Next/Submit button */}
            {currentStep === steps.length - 1 ? (
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all"
              >
                {isSubmitting ? (
                  <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="hidden sm:inline">Enviando...</span>
                      <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                      <Rocket className="w-4 h-4" />
                      <span className="hidden sm:inline">Finalizar</span>
                      <span className="sm:hidden">Ok</span>
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={nextStep}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-caixa-blue to-caixa-blue-700 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all"
              >
                  <span className="hidden sm:inline">Próximo</span>
                  <span className="sm:hidden">→</span>
                  <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>
        </form>
        </div>
      </div>
    </div>
  );
};

// Step Components (optimized for compactness)
const IdeaStep = ({ register, errors }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-4"
  >
    <div className="text-center mb-6">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full mb-3">
        <Lightbulb className="w-6 h-6 text-white" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Sua Ideia</h2>
      <p className="text-sm text-gray-600">Descreva sua inovação para o Sandbox CAIXA</p>
    </div>

      <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Título da Ideia *
      </label>
        <input
        {...register('ideaTitle', { required: 'Título é obrigatório' })}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent"
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
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent min-h-[120px]"
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
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent min-h-[100px]"
        placeholder="Que problema específico sua ideia resolve?"
      />
      </div>

      <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Público-Alvo
      </label>
      <input
        {...register('publicoAlvo')}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent"
        placeholder="Ex: Clientes da CAIXA, empregados internos, parceiros..."
      />
    </div>
  </motion.div>
);

const ObjectivesStep = ({ register, errors }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-4"
  >
    <div className="text-center mb-6">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mb-3">
        <Target className="w-6 h-6 text-white" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Objetivos e Metas</h2>
      <p className="text-sm text-gray-600">O que você espera alcançar com seu experimento</p>
    </div>

      <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Objetivos Principais *
      </label>
        <textarea
        {...register('objetivos', { required: 'Objetivos são obrigatórios' })}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent min-h-[120px]"
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
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent min-h-[100px]"
        placeholder="Como você medirá o sucesso? Ex: redução de 30% no tempo de atendimento..."
        />
      </div>

      <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Resultados Esperados
      </label>
        <textarea
        {...register('resultadosEsperados')}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent min-h-[100px]"
        placeholder="Que resultados você espera obter ao final do experimento?"
      />
    </div>
  </motion.div>
);

const TimelineStep = ({ register, errors }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-4"
  >
    <div className="text-center mb-6">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full mb-3">
        <Clock className="w-6 h-6 text-white" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Cronograma</h2>
      <p className="text-sm text-gray-600">Planejamento temporal do seu experimento</p>
    </div>

        <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Fase Desejada *
      </label>
          <select
        {...register('faseDesejada', { required: 'Fase é obrigatória' })}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent"
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
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent min-h-[120px]"
        placeholder="Descreva as principais etapas e prazos do seu experimento..."
        />
      </div>

      <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Recursos Necessários
      </label>
        <textarea
        {...register('recursos')}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent min-h-[100px]"
        placeholder="Que recursos você precisará? Ex: equipe, tecnologia, orçamento..."
        />
      </div>

      <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Principais Desafios
      </label>
        <textarea
        {...register('desafios')}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent min-h-[100px]"
        placeholder="Quais desafios você antecipa? Como planeja superá-los?"
      />
    </div>
  </motion.div>
);

export default FormPage;
