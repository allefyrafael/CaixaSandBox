import React, { useState, useEffect } from 'react';
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
  Check,
  AlertCircle,
  Rocket,
  Sparkles,
  Brain,
  Users,
  Zap,
  Send,
  MessageCircle
} from 'lucide-react';
import ChatBot from '../components/ChatBot';

const FormPageNew = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-120px)]">
          
          {/* ChatBot Column */}
          <div className="lg:col-span-4 h-full">
            <ChatBot
              onFormFieldUpdate={handleFormFieldUpdate}
              formData={watchedValues}
              isMinimized={isChatMinimized}
              onToggleMinimize={handleToggleChat}
            />
          </div>

          {/* Form Column */}
          <div className="lg:col-span-8 h-full overflow-y-auto">
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-caixa-blue to-caixa-blue-700 rounded-full mb-6"
              >
                <FileText className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-responsive-3xl font-bold gradient-text mb-4">
                Formulário de Experimento
              </h1>
              <p className="text-responsive-lg text-gray-600 max-w-3xl mx-auto">
                Transforme sua ideia em realidade. Use o chat ao lado para obter ajuda ou preencha o formulário diretamente.
              </p>
              
              {/* Send to ChatBot Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendToChatBot}
                className="mt-4 btn bg-gradient-to-r from-caixa-blue to-caixa-blue-700 text-white flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Enviar para Assistente IA</span>
              </motion.button>
            </motion.div>

            {/* Progress Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Progresso do Formulário</span>
                <span className="text-sm font-medium text-caixa-blue">{Math.round(calculateProgress())}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress()}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-caixa-blue to-caixa-blue-700 h-2 rounded-full"
                />
              </div>
            </motion.div>

            {/* Steps Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center mb-8 space-x-4"
            >
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div key={step.id} className="flex flex-col items-center relative">
                    {/* Connection Line */}
                    {index < steps.length - 1 && (
                      <div className="absolute top-6 left-12 w-full h-0.5 bg-gray-200 z-0">
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
                      whileHover={{ scale: 1.1 }}
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-caixa-blue to-caixa-blue-700 border-caixa-blue text-white'
                          : isActive
                          ? 'bg-white border-caixa-blue text-caixa-blue shadow-lg'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </motion.div>
                    
                    {/* Step Info */}
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-caixa-blue' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">{step.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Form Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-xl p-8 mb-8"
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between"
              >
                <motion.button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  whileHover={{ scale: currentStep === 0 ? 1 : 1.02 }}
                  whileTap={{ scale: currentStep === 0 ? 1 : 0.98 }}
                  className={`btn flex items-center space-x-2 ${
                    currentStep === 0 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'btn-secondary'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </motion.button>

                {currentStep === steps.length - 1 ? (
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        <span>Finalizar Experimento</span>
                      </>
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <span>Próximo</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                )}
              </motion.div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components (simplified versions)
const IdeaStep = ({ register, errors }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full mb-4">
        <Lightbulb className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Sua Ideia</h2>
      <p className="text-gray-600">Descreva sua inovação para o Sandbox CAIXA</p>
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
    className="space-y-6"
  >
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mb-4">
        <Target className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Objetivos e Metas</h2>
      <p className="text-gray-600">O que você espera alcançar com seu experimento</p>
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
    className="space-y-6"
  >
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full mb-4">
        <Clock className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Cronograma</h2>
      <p className="text-gray-600">Planejamento temporal do seu experimento</p>
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

export default FormPageNew;
