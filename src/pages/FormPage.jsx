import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FileText,
  User,
  Building,
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
  Zap
} from 'lucide-react';

const FormPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  const steps = [
    {
      id: 'personal',
      title: 'Informações Pessoais',
      subtitle: 'Conte-nos quem você é',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'organization',
      title: 'Dados Organizacionais',
      subtitle: 'Sua posição na CAIXA',
      icon: Building,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
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

  // Calculate form completion percentage
  const calculateProgress = () => {
    const totalFields = Object.keys(register).length || 20; // Approximate total fields
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
        return (
          <PersonalInfoStep 
            register={register} 
            errors={errors} 
            setValue={setValue} 
            watch={watch} 
          />
        );
      case 1:
        return (
          <OrganizationStep 
            register={register} 
            errors={errors} 
            setValue={setValue} 
            watch={watch} 
          />
        );
      case 2:
        return (
          <IdeaStep 
            register={register} 
            errors={errors} 
            setValue={setValue} 
            watch={watch} 
          />
        );
      case 3:
        return (
          <ObjectivesStep 
            register={register} 
            errors={errors} 
            setValue={setValue} 
            watch={watch} 
          />
        );
      case 4:
        return (
          <TimelineStep 
            register={register} 
            errors={errors} 
            setValue={setValue} 
            watch={watch} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
      <div className="container-max section-padding">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
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
            Transforme sua ideia em realidade. Preencha o formulário abaixo para 
            iniciar seu experimento no Sandbox CAIXA.
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="max-w-4xl mx-auto">
            {/* Steps Indicator */}
            <div className="flex items-center justify-between mb-8">
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
                          className="h-full bg-caixa-blue"
                        />
                      </div>
                    )}
                    
                    {/* Step Circle */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-caixa-blue text-white' 
                          : isActive 
                            ? `bg-gradient-to-r ${step.color} text-white shadow-lg` 
                            : 'bg-white border-2 border-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </motion.div>
                    
                    {/* Step Label */}
                    <div className="mt-3 text-center">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 hidden sm:block">
                        {step.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-full p-1 shadow-sm">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progresso do Formulário</span>
                <span>{Math.round(calculateProgress())}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress()}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-caixa-blue to-caixa-blue-light h-2 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
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
              <ChevronLeft className="w-5 h-5" />
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
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    <span>Enviar Experimento</span>
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
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            )}
          </motion.div>
        </form>
      </div>
    </div>
  );
};

// Step Components
const PersonalInfoStep = ({ register, errors, setValue, watch }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="space-y-6"
  >
    <div className="flex items-center space-x-3 mb-8">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
        <User className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Informações Pessoais</h3>
        <p className="text-gray-600">Conte-nos um pouco sobre você</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="label">Nome Completo *</label>
        <input
          {...register('fullName', { required: 'Nome completo é obrigatório' })}
          className={`input ${errors.fullName ? 'border-red-500' : ''}`}
          placeholder="Seu nome completo"
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div>
        <label className="label">E-mail Corporativo *</label>
        <input
          {...register('email', { 
            required: 'E-mail é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'E-mail inválido'
            }
          })}
          type="email"
          className={`input ${errors.email ? 'border-red-500' : ''}`}
          placeholder="seu.email@caixa.gov.br"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="label">Telefone</label>
        <input
          {...register('phone')}
          className="input"
          placeholder="(11) 99999-9999"
        />
      </div>

      <div>
        <label className="label">Matrícula CAIXA *</label>
        <input
          {...register('employeeId', { required: 'Matrícula é obrigatória' })}
          className={`input ${errors.employeeId ? 'border-red-500' : ''}`}
          placeholder="Sua matrícula"
        />
        {errors.employeeId && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.employeeId.message}
          </p>
        )}
      </div>
    </div>
  </motion.div>
);

const OrganizationStep = ({ register, errors }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="space-y-6"
  >
    <div className="flex items-center space-x-3 mb-8">
      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
        <Building className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Dados Organizacionais</h3>
        <p className="text-gray-600">Sua posição e unidade na CAIXA</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="label">Cargo/Função *</label>
        <input
          {...register('position', { required: 'Cargo é obrigatório' })}
          className={`input ${errors.position ? 'border-red-500' : ''}`}
          placeholder="Ex: Analista Sênior"
        />
        {errors.position && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.position.message}
          </p>
        )}
      </div>

      <div>
        <label className="label">Unidade/Gerência *</label>
        <select
          {...register('unit', { required: 'Unidade é obrigatória' })}
          className={`input ${errors.unit ? 'border-red-500' : ''}`}
        >
          <option value="">Selecione sua unidade</option>
          <option value="GEINA">GEINA - Gerência Nacional de Inovação</option>
          <option value="GIGID">GIGID - Gerência de Soluções Digitais</option>
          <option value="GICLI">GICLI - Gerência de Experiência do Cliente</option>
          <option value="GITED">GITED - Gerência de Inteligência de Dados</option>
          <option value="GECAD">GECAD - Gerência de Canais Digitais</option>
          <option value="GESTI">GESTI - Gerência de Tecnologia da Informação</option>
          <option value="other">Outra</option>
        </select>
        {errors.unit && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.unit.message}
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="label">Experiência com Inovação</label>
        <select {...register('innovationExperience')} className="input">
          <option value="">Selecione seu nível de experiência</option>
          <option value="beginner">Iniciante - Primeira experiência</option>
          <option value="intermediate">Intermediário - Já participei de alguns projetos</option>
          <option value="advanced">Avançado - Tenho experiência significativa</option>
          <option value="expert">Expert - Sou especialista na área</option>
        </select>
      </div>
    </div>
  </motion.div>
);

const IdeaStep = ({ register, errors }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="space-y-6"
  >
    <div className="flex items-center space-x-3 mb-8">
      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
        <Lightbulb className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Sua Ideia Inovadora</h3>
        <p className="text-gray-600">Conte-nos sobre sua proposta de experimento</p>
      </div>
    </div>

    <div className="space-y-6">
      <div>
        <label className="label">Título do Experimento *</label>
        <input
          {...register('experimentTitle', { required: 'Título é obrigatório' })}
          className={`input ${errors.experimentTitle ? 'border-red-500' : ''}`}
          placeholder="Ex: Chatbot Inteligente para Atendimento"
        />
        {errors.experimentTitle && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.experimentTitle.message}
          </p>
        )}
      </div>

      <div>
        <label className="label">Descrição da Ideia *</label>
        <textarea
          {...register('ideaDescription', { required: 'Descrição é obrigatória' })}
          className={`input min-h-[120px] ${errors.ideaDescription ? 'border-red-500' : ''}`}
          placeholder="Descreva sua ideia detalhadamente. Qual problema ela resolve? Como funciona?"
        />
        {errors.ideaDescription && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.ideaDescription.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Categoria da Inovação *</label>
          <select
            {...register('innovationCategory', { required: 'Categoria é obrigatória' })}
            className={`input ${errors.innovationCategory ? 'border-red-500' : ''}`}
          >
            <option value="">Selecione a categoria</option>
            <option value="digital">Soluções Digitais</option>
            <option value="process">Melhoria de Processos</option>
            <option value="product">Novos Produtos/Serviços</option>
            <option value="experience">Experiência do Cliente</option>
            <option value="data">Analytics e BI</option>
            <option value="ai">Inteligência Artificial</option>
            <option value="security">Segurança</option>
            <option value="other">Outros</option>
          </select>
          {errors.innovationCategory && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.innovationCategory.message}
            </p>
          )}
        </div>

        <div>
          <label className="label">Horizonte de Inovação</label>
          <select {...register('innovationHorizon')} className="input">
            <option value="">Selecione o horizonte</option>
            <option value="h1">H1 - Incremental (melhorias graduais)</option>
            <option value="h2">H2 - Adjacente (novas capacidades)</option>
            <option value="h3">H3 - Disruptiva (transformacional)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Problema a ser Resolvido *</label>
        <textarea
          {...register('problemStatement', { required: 'Descrição do problema é obrigatória' })}
          className={`input min-h-[100px] ${errors.problemStatement ? 'border-red-500' : ''}`}
          placeholder="Qual problema específico sua ideia resolve? Qual a dor do cliente?"
        />
        {errors.problemStatement && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.problemStatement.message}
          </p>
        )}
      </div>
    </div>
  </motion.div>
);

const ObjectivesStep = ({ register, errors }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="space-y-6"
  >
    <div className="flex items-center space-x-3 mb-8">
      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
        <Target className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Objetivos e Metas</h3>
        <p className="text-gray-600">Defina o que você espera alcançar</p>
      </div>
    </div>

    <div className="space-y-6">
      <div>
        <label className="label">Objetivo Principal *</label>
        <textarea
          {...register('mainObjective', { required: 'Objetivo principal é obrigatório' })}
          className={`input min-h-[100px] ${errors.mainObjective ? 'border-red-500' : ''}`}
          placeholder="Qual é o principal objetivo do seu experimento?"
        />
        {errors.mainObjective && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.mainObjective.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Público-Alvo</label>
          <select {...register('targetAudience')} className="input">
            <option value="">Selecione o público-alvo</option>
            <option value="internal">Colaboradores Internos</option>
            <option value="pf">Clientes Pessoa Física</option>
            <option value="pj">Clientes Pessoa Jurídica</option>
            <option value="government">Setor Público</option>
            <option value="partners">Parceiros</option>
            <option value="all">Todos os Públicos</option>
          </select>
        </div>

        <div>
          <label className="label">Impacto Esperado</label>
          <select {...register('expectedImpact')} className="input">
            <option value="">Selecione o impacto</option>
            <option value="low">Baixo - Impacto localizado</option>
            <option value="medium">Médio - Impacto departamental</option>
            <option value="high">Alto - Impacto organizacional</option>
            <option value="transformational">Transformacional - Mudança sistêmica</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Métricas de Sucesso</label>
        <textarea
          {...register('successMetrics')}
          className="input min-h-[100px]"
          placeholder="Como você medirá o sucesso? Ex: NPS +10%, redução de 30% no tempo de atendimento, etc."
        />
      </div>

      <div>
        <label className="label">Benefícios Esperados</label>
        <textarea
          {...register('expectedBenefits')}
          className="input min-h-[100px]"
          placeholder="Quais benefícios você espera? Para clientes, para a CAIXA, para a sociedade?"
        />
      </div>
    </div>
  </motion.div>
);

const TimelineStep = ({ register, errors }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="space-y-6"
  >
    <div className="flex items-center space-x-3 mb-8">
      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
        <Clock className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Cronograma e Recursos</h3>
        <p className="text-gray-600">Planeje a execução do seu experimento</p>
      </div>
    </div>

    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Prazo Desejado *</label>
          <select
            {...register('desiredTimeline', { required: 'Prazo é obrigatório' })}
            className={`input ${errors.desiredTimeline ? 'border-red-500' : ''}`}
          >
            <option value="">Selecione o prazo</option>
            <option value="1-3months">1-3 meses</option>
            <option value="3-6months">3-6 meses</option>
            <option value="6-12months">6-12 meses</option>
            <option value="12+months">Mais de 12 meses</option>
          </select>
          {errors.desiredTimeline && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.desiredTimeline.message}
            </p>
          )}
        </div>

        <div>
          <label className="label">Fase Inicial Preferida</label>
          <select {...register('preferredPhase')} className="input">
            <option value="">Selecione a fase</option>
            <option value="discovery">Discovery - Validação inicial</option>
            <option value="delivery">Delivery - MVP pronto</option>
            <option value="scale">Scale - Solução validada</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Recursos Necessários</label>
        <textarea
          {...register('requiredResources')}
          className="input min-h-[100px]"
          placeholder="Quais recursos você precisará? Ex: equipe de desenvolvimento, infraestrutura, parcerias, orçamento..."
        />
      </div>

      <div>
        <label className="label">Principais Desafios Antecipados</label>
        <textarea
          {...register('anticipatedChallenges')}
          className="input min-h-[100px]"
          placeholder="Quais desafios você antecipa? Como planeja superá-los?"
        />
      </div>

      <div>
        <label className="label">Comentários Adicionais</label>
        <textarea
          {...register('additionalComments')}
          className="input min-h-[80px]"
          placeholder="Algo mais que gostaria de compartilhar sobre seu experimento?"
        />
      </div>
    </div>
  </motion.div>
);

export default FormPage;
