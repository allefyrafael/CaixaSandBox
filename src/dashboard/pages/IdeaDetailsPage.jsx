import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  User,
  Building,
  Mail,
  Calendar,
  Lightbulb,
  Target,
  Clock,
  Save,
  Bot,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Zap,
  Brain,
  FileText,
  Tag,
  Sparkles,
  Shield,
  Globe,
  Layers,
  Award,
  Star,
  Heart,
  Rocket
} from 'lucide-react';

const IdeaDetailsPage = () => {
  const { ideaId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPhase, setSelectedPhase] = useState('');
  const [comments, setComments] = useState('');
  const [showClassificationModal, setShowClassificationModal] = useState(false);

  // Mock data da ideia (normalmente viria de uma API)
  const [ideaData] = useState({
    id: 1,
    title: 'Assistente Virtual IA',
    author: {
      name: 'Maria Santos',
      email: 'maria.santos@caixa.gov.br',
      position: 'Analista Sênior',
      department: 'GICLI - Gerência de Experiência do Cliente',
      phone: '(11) 99999-1111',
      location: 'São Paulo, SP',
      employeeId: 'C123456'
    },
    submittedAt: '2024-01-15',
    category: 'Inteligência Artificial',
    status: 'pending',
    formData: {
      // Dados da etapa "Sua Ideia"
      ideaTitle: 'Assistente Virtual IA',
      ideaDescription: 'Um chatbot inteligente alimentado por IA para melhorar o atendimento ao cliente da CAIXA. O sistema seria capaz de resolver 80% das dúvidas mais comuns automaticamente, reduzindo filas e melhorando a experiência do cliente.',
      problema: 'Longo tempo de espera no atendimento ao cliente, sobrecarga dos canais tradicionais e dificuldade em obter respostas rápidas para dúvidas simples.',
      publicoAlvo: 'Clientes da CAIXA (Pessoa Física e Jurídica)',
      
      // Dados da etapa "Objetivos e Metas"
      objetivos: 'Reduzir em 60% o tempo médio de atendimento, aumentar a satisfação do cliente em 40% e diminuir a sobrecarga dos atendentes humanos.',
      metricas: 'Taxa de resolução automática: 80%, Tempo médio de resposta: <30 segundos, NPS: +40 pontos, Redução de chamadas: 60%',
      resultadosEsperados: 'Melhoria significativa na experiência do cliente, otimização de recursos humanos e redução de custos operacionais.',
      
      // Dados da etapa "Cronograma"
      faseDesejada: 'discovery',
      cronograma: 'Fase 1 (30 dias): Pesquisa e prototipagem\nFase 2 (60 dias): Desenvolvimento MVP\nFase 3 (90 dias): Testes e ajustes\nFase 4 (120 dias): Deploy piloto',
      recursos: 'Equipe de 3 desenvolvedores, 1 especialista em IA, infraestrutura cloud, APIs de integração',
      desafios: 'Integração com sistemas legados, treinamento da IA com dados da CAIXA, garantia de segurança e privacidade'
    }
  });

  // Análise de IA mock
  const [aiAnalysis] = useState({
    sentiment: {
      score: 0.87,
      label: 'Muito Positivo',
      confidence: 0.92
    },
    complexity: {
      technical: 'Alta',
      business: 'Média',
      implementation: 'Média-Alta'
    },
    feasibility: {
      score: 0.78,
      factors: [
        { name: 'Viabilidade Técnica', score: 0.82 },
        { name: 'Recursos Necessários', score: 0.75 },
        { name: 'Alinhamento Estratégico', score: 0.85 },
        { name: 'Potencial de Impacto', score: 0.90 }
      ]
    },
    keywords: ['IA', 'Chatbot', 'Atendimento', 'Automatização', 'Experiência do Cliente'],
    estimatedImpact: {
      customerSatisfaction: '+40%',
      costReduction: '25%',
      efficiencyGain: '60%',
      implementationTime: '4-6 meses'
    },
    riskFactors: [
      { risk: 'Integração com sistemas legados', level: 'Médio' },
      { risk: 'Aceitação pelos usuários', level: 'Baixo' },
      { risk: 'Complexidade técnica', level: 'Alto' }
    ],
    recommendations: [
      'Iniciar com um MVP focado nas 20 dúvidas mais frequentes',
      'Realizar testes A/B com grupos pequenos de clientes',
      'Investir em treinamento da equipe para manutenção da IA'
    ]
  });

  const steps = [
    {
      id: 'idea',
      title: 'Sua Ideia',
      subtitle: 'Descreva sua inovação',
      icon: Lightbulb,
      fields: ['ideaTitle', 'ideaDescription', 'problema', 'publicoAlvo']
    },
    {
      id: 'objectives',
      title: 'Objetivos e Metas',
      subtitle: 'O que você espera alcançar',
      icon: Target,
      fields: ['objetivos', 'metricas', 'resultadosEsperados']
    },
    {
      id: 'timeline',
      title: 'Cronograma',
      subtitle: 'Planejamento temporal',
      icon: Clock,
      fields: ['faseDesejada', 'cronograma', 'recursos', 'desafios']
    }
  ];

  const phases = [
    {
      id: 'discovery',
      name: 'Discovery',
      description: 'Validação inicial e prototipagem (até 90 dias)',
      color: 'bg-blue-500',
      icon: Brain
    },
    {
      id: 'delivery',
      name: 'Delivery',
      description: 'Desenvolvimento de MVP e testes (até 180 dias)',
      color: 'bg-green-500',
      icon: Zap
    },
    {
      id: 'scale',
      name: 'Scale',
      description: 'Escalonamento e implementação nacional (até 360 dias)',
      color: 'bg-purple-500',
      icon: TrendingUp
    }
  ];

  const handleClassifyIdea = async () => {
    if (!selectedPhase) {
      toast.error('Selecione uma fase para classificar a ideia');
      return;
    }

    try {
      // Simular classificação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Ideia classificada na fase ${phases.find(p => p.id === selectedPhase)?.name}!`);
      
      // Aqui você salvaria no backend
      console.log('Classificação:', {
        ideaId,
        phase: selectedPhase,
        comments,
        classifiedBy: 'Gestor',
        classifiedAt: new Date().toISOString()
      });
      
    } catch (error) {
      toast.error('Erro ao classificar ideia');
    }
  };

  const renderFormContent = () => {
    const step = steps[currentStep];
    const data = ideaData.formData;

    return (
      <div className="space-y-6">
        {step.id === 'idea' && (
          <div className="space-y-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-400/20"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <span className="text-yellow-600 font-medium">Título da Ideia</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{data.ideaTitle}</h4>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-400/20"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-blue-600 font-medium">Descrição da Ideia</span>
              </div>
              <p className="text-gray-900 text-lg leading-relaxed">{data.ideaDescription}</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl p-6 border border-red-400/20"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-red-600 font-medium">Problema que Resolve</span>
              </div>
              <p className="text-gray-900 text-lg leading-relaxed">{data.problema}</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl p-6 border border-green-400/20"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="text-green-600 font-medium">Público-Alvo</span>
              </div>
              <p className="text-gray-900 text-lg leading-relaxed">{data.publicoAlvo}</p>
            </motion.div>
          </div>
        )}

        {step.id === 'objectives' && (
          <div className="space-y-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-2xl p-6 border border-purple-400/20"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <span className="text-purple-600 font-medium">Objetivos Principais</span>
              </div>
              <p className="text-gray-900 text-lg leading-relaxed">{data.objetivos}</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-400/20"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span className="text-blue-600 font-medium">Métricas de Sucesso</span>
              </div>
              <p className="text-gray-900 text-lg leading-relaxed">{data.metricas}</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl p-6 border border-emerald-400/20"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <span className="text-emerald-600 font-medium">Resultados Esperados</span>
              </div>
              <p className="text-gray-900 text-lg leading-relaxed">{data.resultadosEsperados}</p>
            </motion.div>
          </div>
        )}

        {step.id === 'timeline' && (
          <div className="space-y-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-orange-400/20"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-white" />
                </div>
                <span className="text-orange-600 font-medium">Fase Desejada</span>
              </div>
              <p className="text-gray-900 text-lg font-semibold capitalize">{data.faseDesejada}</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl p-6 border border-pink-400/20"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="text-pink-600 font-medium">Cronograma Detalhado</span>
              </div>
              <pre className="text-gray-900 text-lg leading-relaxed whitespace-pre-wrap">{data.cronograma}</pre>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-2xl p-6 border border-teal-400/20"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <span className="text-teal-600 font-medium">Recursos Necessários</span>
              </div>
              <p className="text-gray-900 text-lg leading-relaxed">{data.recursos}</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-400/20"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-yellow-600 font-medium">Principais Desafios</span>
              </div>
              <p className="text-gray-900 text-lg leading-relaxed">{data.desafios}</p>
            </motion.div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-caixa-blue hover:bg-blue-50 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{ideaData.title}</h1>
                <p className="text-sm text-gray-600">Análise detalhada da ideia</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                Pendente
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Side - Form Data */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Author Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Informações do Autor</h3>
                  <p className="text-sm text-gray-600">Dados do empregado responsável pela ideia</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-medium text-gray-900">{ideaData.author.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{ideaData.author.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Departamento</p>
                    <p className="font-medium text-gray-900">{ideaData.author.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Submetido em</p>
                    <p className="font-medium text-gray-900">{ideaData.submittedAt}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Form Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Informações de Ideação</h3>
                  <p className="text-sm text-gray-600">Explore os detalhes da proposta</p>
                </div>
              </div>
              
              {/* Steps Navigation */}
              <div className="flex space-x-2 mb-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === index;
                  return (
                    <motion.button
                      key={step.id}
                      onClick={() => setCurrentStep(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-1 p-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-caixa-blue text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{step.title}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Form Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderFormContent()}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Side - AI Analysis & Classification */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* AI Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Análise de IA</h3>
              </div>

              {/* Sentiment Analysis */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Análise de Sentimento</h4>
                <div className={`p-4 rounded-lg border-l-4 ${
                  aiAnalysis.sentiment.score > 0.7 ? 'bg-green-50 border-green-500' :
                  aiAnalysis.sentiment.score > 0.4 ? 'bg-yellow-50 border-yellow-500' : 'bg-red-50 border-red-500'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      aiAnalysis.sentiment.score > 0.7 ? 'bg-green-500' :
                      aiAnalysis.sentiment.score > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="font-bold text-gray-900 text-lg">{aiAnalysis.sentiment.label}</span>
                    <span className={`text-sm font-medium ${
                      aiAnalysis.sentiment.score > 0.7 ? 'text-green-700' :
                      aiAnalysis.sentiment.score > 0.4 ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      ({Math.round(aiAnalysis.sentiment.score * 100)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Feasibility Score */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Viabilidade</h4>
                <div className="space-y-2">
                  {aiAnalysis.feasibility.factors.map((factor, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-900">{factor.name}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-300 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-blue-600 to-blue-700 h-3 rounded-full shadow-sm" 
                              style={{ width: `${factor.score * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-900 min-w-[40px]">
                            {Math.round(factor.score * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact Estimation */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Impacto Estimado</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {aiAnalysis.estimatedImpact.customerSatisfaction}
                    </div>
                    <div className="text-xs text-gray-600">Satisfação</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {aiAnalysis.estimatedImpact.costReduction}
                    </div>
                    <div className="text-xs text-gray-600">Redução de Custos</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {aiAnalysis.estimatedImpact.efficiencyGain}
                    </div>
                    <div className="text-xs text-gray-600">Eficiência</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {aiAnalysis.estimatedImpact.implementationTime}
                    </div>
                    <div className="text-xs text-gray-600">Implementação</div>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Palavras-chave</h4>
                <div className="flex flex-wrap gap-2">
                  {aiAnalysis.keywords.map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recomendações</h4>
                <ul className="space-y-2">
                  {aiAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Classification Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 text-white"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Pronto para Classificar?</h3>
                <p className="text-emerald-100 mb-3 text-sm">
                  Analise os dados ao lado e classifique esta ideia na fase adequada do Sandbox
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowClassificationModal(true)}
                  className="w-full py-3 px-6 bg-white text-emerald-600 rounded-lg font-bold hover:bg-emerald-50 transition-all shadow-lg"
                >
                  <Sparkles className="w-5 h-5 inline mr-2" />
                  Classificar Ideia
                </motion.button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Classification Modal */}
      <AnimatePresence>
        {showClassificationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowClassificationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Classificar Ideia</h2>
                      <p className="text-gray-600">Defina a fase de desenvolvimento desta proposta</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowClassificationModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Left Side - Data Summary */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo da Ideia</h3>
                      
                      {/* Idea Title */}
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-blue-900 text-lg">{ideaData.formData.ideaTitle}</h4>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-green-600">
                            {aiAnalysis.sentiment.label}
                          </div>
                          <div className="text-xs text-green-700">Sentimento</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {Math.round(aiAnalysis.feasibility.factors.reduce((acc, f) => acc + f.score, 0) / aiAnalysis.feasibility.factors.length * 100)}%
                          </div>
                          <div className="text-xs text-purple-700">Viabilidade</div>
                        </div>
                      </div>

                      {/* Impact Preview */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">Impacto Estimado</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Satisfação: <span className="font-medium">{aiAnalysis.estimatedImpact.customerSatisfaction}</span></div>
                          <div>Eficiência: <span className="font-medium">{aiAnalysis.estimatedImpact.efficiencyGain}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Classification */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Classificação</h3>
                      
                      <div className="space-y-3 mb-6">
                        {phases.map((phase) => {
                          const Icon = phase.icon;
                          const isSelected = selectedPhase === phase.id;
                          return (
                            <motion.div
                              key={phase.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-caixa-blue bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedPhase(phase.id)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 ${phase.color} rounded-full flex items-center justify-center`}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{phase.name}</h4>
                                  <p className="text-sm text-gray-600">{phase.description}</p>
                                </div>
                                {isSelected && (
                                  <CheckCircle className="w-5 h-5 text-caixa-blue" />
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Comments */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comentários do Gestor
                        </label>
                        <textarea
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent"
                          rows="3"
                          placeholder="Adicione comentários sobre a classificação..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowClassificationModal(false)}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClassifyIdea}
                    disabled={!selectedPhase}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      selectedPhase
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Save className="w-5 h-5 inline mr-2" />
                    Classificar no Sandbox CAIXA
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IdeaDetailsPage;
