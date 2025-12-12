import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Target,
  Users,
  Zap,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
  Lightbulb,
  Rocket,
  Globe,
  Layers
} from 'lucide-react';

const ClassificationPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [classificationResults, setClassificationResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const analysisSteps = [
    {
      title: 'Analisando Dados',
      description: 'Processando informações do formulário...',
      icon: Brain,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Categorizando Tema',
      description: 'Identificando área de inovação...',
      icon: Layers,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Avaliando Complexidade',
      description: 'Determinando nível de dificuldade...',
      icon: Target,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Classificando Impacto',
      description: 'Analisando potencial de transformação...',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Gerando Insights',
      description: 'Preparando recomendações...',
      icon: Sparkles,
      color: 'from-pink-500 to-pink-600'
    }
  ];

  useEffect(() => {
    // Simulate AI analysis process
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < analysisSteps.length - 1) {
          return prev + 1;
        } else {
          // Finish analysis and generate results
          setIsAnalyzing(false);
          generateClassificationResults();
          clearInterval(timer);
          return prev;
        }
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  const generateClassificationResults = () => {
    // Get form data from localStorage
    const formData = JSON.parse(localStorage.getItem('sandboxFormData') || '{}');
    
    // Simulate AI classification
    const results = {
      theme: {
        primary: 'Transformação Digital',
        secondary: 'Experiência do Cliente',
        tags: ['IA', 'Automação', 'UX', 'Dados']
      },
      complexity: {
        level: 'Alto',
        score: 8.5,
        factors: [
          'Integração com sistemas legados',
          'Múltiplas interfaces de usuário',
          'Processamento de dados em tempo real',
          'Conformidade regulatória'
        ]
      },
      impact: {
        level: 'Transformacional',
        score: 9.2,
        areas: [
          'Satisfação do Cliente (+25%)',
          'Eficiência Operacional (+40%)',
          'Redução de Custos (R$ 2M/ano)',
          'Inovação Tecnológica (Pioneiro)'
        ]
      },
      recommendedPath: {
        phase: 'Discovery',
        duration: '90 dias',
        team: 'Multidisciplinar (8-10 pessoas)',
        budget: 'R$ 250.000 - R$ 380.000'
      },
      similarProjects: [
        {
          name: 'Chatbot Inteligente CAIXA',
          success: 95,
          phase: 'Scale',
          impact: 'Alto'
        },
        {
          name: 'App de Investimentos Personalizados',
          success: 88,
          phase: 'Delivery',
          impact: 'Médio-Alto'
        },
        {
          name: 'Plataforma de Open Banking',
          success: 92,
          phase: 'Scale',
          impact: 'Transformacional'
        }
      ],
      risks: [
        {
          type: 'Técnico',
          level: 'Médio',
          description: 'Integração com APIs externas'
        },
        {
          type: 'Organizacional',
          level: 'Baixo',
          description: 'Mudança de processos internos'
        },
        {
          type: 'Regulatório',
          level: 'Alto',
          description: 'Conformidade com LGPD e BACEN'
        }
      ]
    };

    setClassificationResults(results);
  };

  const handleProceedToMetrics = () => {
    navigate('/metricas');
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="container-max section-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            {/* AI Analysis Header */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-8"
            >
              <Brain className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-responsive-3xl font-bold gradient-text mb-4">
              Análise por IA em Andamento
            </h1>
            <p className="text-responsive-lg text-gray-600 mb-12">
              Nossos agentes de inteligência artificial estão analisando seu experimento 
              para fornecer insights personalizados e recomendações precisas.
            </p>

            {/* Analysis Steps */}
            <div className="space-y-6">
              {analysisSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-500 ${
                      isActive 
                        ? 'bg-white shadow-lg border-2 border-blue-200' 
                        : isCompleted 
                          ? 'bg-green-50' 
                          : 'bg-gray-50'
                    }`}
                  >
                    <motion.div
                      animate={isActive ? { 
                        scale: [1, 1.1, 1], 
                        rotate: [0, 5, -5, 0] 
                      } : {}}
                      transition={{ 
                        duration: 2, 
                        repeat: isActive ? Infinity : 0 
                      }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-500 text-white'
                          : isActive 
                            ? `bg-gradient-to-r ${step.color} text-white shadow-lg`
                            : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </motion.div>
                    
                    <div className="flex-1 text-left">
                      <h3 className={`font-semibold ${
                        isActive ? 'text-gray-900' : isCompleted ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${
                        isActive ? 'text-gray-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                    
                    {isActive && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="mt-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progresso da Análise</span>
                <span>{Math.round(((currentStep + 1) / analysisSteps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / analysisSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6"
          >
            <CheckCircle className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-responsive-3xl font-bold gradient-text mb-4">
            Classificação Concluída
          </h1>
          <p className="text-responsive-lg text-gray-600 max-w-3xl mx-auto">
            Análise completa! Nossos agentes de IA processaram seu experimento e geraram 
            insights personalizados para maximizar suas chances de sucesso.
          </p>
        </motion.div>

        {classificationResults && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Theme Classification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Classificação Temática</h2>
                  <p className="text-gray-600">Categorização automática do seu experimento</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Temas Identificados</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Tema Principal</span>
                      <span className="text-blue-600 font-bold">{classificationResults.theme.primary}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">Tema Secundário</span>
                      <span className="text-purple-600 font-bold">{classificationResults.theme.secondary}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags Relacionadas</h3>
                  <div className="flex flex-wrap gap-2">
                    {classificationResults.theme.tags.map((tag, index) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Complexity & Impact Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Complexity */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Análise de Complexidade</h2>
                    <p className="text-gray-600">Nível: {classificationResults.complexity.level}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Score de Complexidade</span>
                    <span>{classificationResults.complexity.score}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${classificationResults.complexity.score * 10}%` }}
                      transition={{ delay: 0.6, duration: 1 }}
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Fatores de Complexidade</h3>
                  <div className="space-y-2">
                    {classificationResults.complexity.factors.map((factor, index) => (
                      <motion.div
                        key={factor}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-center space-x-2"
                      >
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="text-sm text-gray-700">{factor}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Impact */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Potencial de Impacto</h2>
                    <p className="text-gray-600">Nível: {classificationResults.impact.level}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Score de Impacto</span>
                    <span>{classificationResults.impact.score}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${classificationResults.impact.score * 10}%` }}
                      transition={{ delay: 0.6, duration: 1 }}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Áreas de Impacto</h3>
                  <div className="space-y-2">
                    {classificationResults.impact.areas.map((area, index) => (
                      <motion.div
                        key={area}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-center space-x-2"
                      >
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-700">{area}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recommended Path */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-caixa-blue to-caixa-blue-light rounded-2xl shadow-xl p-8 text-white"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Caminho Recomendado</h2>
                  <p className="text-white/80">Estratégia personalizada para seu experimento</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Fase Inicial</h3>
                  <p className="text-2xl font-bold">{classificationResults.recommendedPath.phase}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Duração</h3>
                  <p className="text-2xl font-bold">{classificationResults.recommendedPath.duration}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Equipe</h3>
                  <p className="text-lg font-bold">{classificationResults.recommendedPath.team}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Orçamento</h3>
                  <p className="text-lg font-bold">{classificationResults.recommendedPath.budget}</p>
                </div>
              </div>
            </motion.div>

            {/* Similar Projects & Risks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Similar Projects */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Projetos Similares</h2>
                    <p className="text-gray-600">Casos de sucesso relacionados</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {classificationResults.similarProjects.map((project, index) => (
                    <motion.div
                      key={project.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          project.phase === 'Scale' ? 'bg-green-100 text-green-600' :
                          project.phase === 'Delivery' ? 'bg-blue-100 text-blue-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {project.phase}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Taxa de Sucesso: {project.success}%</span>
                        <span className="text-sm font-medium text-gray-700">Impacto: {project.impact}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Risk Analysis */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Análise de Riscos</h2>
                    <p className="text-gray-600">Principais riscos identificados</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {classificationResults.risks.map((risk, index) => (
                    <motion.div
                      key={risk.type}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{risk.type}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          risk.level === 'Alto' ? 'bg-red-100 text-red-600' :
                          risk.level === 'Médio' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {risk.level}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{risk.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <motion.button
                onClick={handleProceedToMetrics}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary text-lg px-8 py-4 group"
              >
                <BarChart3 className="w-6 h-6 mr-2" />
                <span>Ver Dashboard de Métricas</span>
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassificationPage;
