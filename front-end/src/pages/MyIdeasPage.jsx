import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Lightbulb,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Calendar,
  User,
  ArrowLeft,
  Plus,
  Eye,
  Target,
  Star,
  TrendingUp,
  FileText
} from 'lucide-react';

const MyIdeasPage = () => {
  const navigate = useNavigate();
  const [myIdeas, setMyIdeas] = useState([]);

  // Mock data - em produção viria do localStorage ou API
  useEffect(() => {
    const mockIdeas = [
      {
        id: 1,
        title: 'Assistente Virtual IA',
        description: 'Chatbot inteligente para atendimento ao cliente usando IA conversacional para reduzir tempo de espera.',
        submittedAt: '2024-01-15',
        status: 'classified',
        phase: 'Discovery',
        phaseDescription: 'Validação inicial e prototipagem',
        managerFeedback: 'Excelente proposta! A ideia tem grande potencial para melhorar a experiência do cliente. Recomendamos iniciar com um MVP focado nas 20 dúvidas mais frequentes.',
        nextSteps: 'Desenvolver protótipo inicial, mapear principais dúvidas dos clientes, definir arquitetura da IA.',
        estimatedTime: '90 dias',
        category: 'IA',
        priority: 'Alta'
      },
      {
        id: 2,
        title: 'Blockchain para Transferências',
        description: 'Sistema de transferências bancárias utilizando tecnologia blockchain para maior segurança e transparência.',
        submittedAt: '2024-01-10',
        status: 'pending',
        phase: null,
        phaseDescription: null,
        managerFeedback: null,
        nextSteps: null,
        estimatedTime: null,
        category: 'Blockchain',
        priority: 'Média'
      },
      {
        id: 3,
        title: 'App Mobile Renovado',
        description: 'Redesign completo do aplicativo mobile com foco na experiência do usuário e novas funcionalidades.',
        submittedAt: '2024-01-05',
        status: 'classified',
        phase: 'Delivery',
        phaseDescription: 'Desenvolvimento de MVP e testes',
        managerFeedback: 'Ideia alinhada com nossa estratégia digital. Projeto aprovado para desenvolvimento do MVP.',
        nextSteps: 'Iniciar desenvolvimento do MVP, realizar testes com usuários, implementar feedback.',
        estimatedTime: '180 dias',
        category: 'Mobile',
        priority: 'Alta'
      }
    ];
    setMyIdeas(mockIdeas);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'from-yellow-100 to-orange-100 text-orange-700 border-orange-200';
      case 'classified':
        return 'from-green-100 to-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'from-red-100 to-pink-100 text-red-700 border-red-200';
      default:
        return 'from-gray-100 to-gray-200 text-gray-700 border-gray-200';
    }
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'Discovery':
        return 'from-blue-500 to-indigo-600';
      case 'Delivery':
        return 'from-purple-500 to-pink-600';
      case 'Scale':
        return 'from-green-500 to-emerald-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPhaseIcon = (phase) => {
    switch (phase) {
      case 'Discovery':
        return Lightbulb;
      case 'Delivery':
        return Target;
      case 'Scale':
        return Star;
      default:
        return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-24">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/colaborador/formulario')}
                className="p-3 text-gray-600 hover:text-caixa-blue hover:bg-blue-50 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div className="w-12 h-12 bg-gradient-to-r from-caixa-blue via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Minhas Ideias
                </h1>
                <p className="text-lg text-blue-600 font-medium">Acompanhe o status das suas propostas</p>
              </div>
            </div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/colaborador/formulario')}
              className="px-6 py-3 bg-gradient-to-r from-caixa-blue to-indigo-600 text-white font-medium rounded-xl hover:shadow-xl transition-all flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Ideia</span>
            </motion.button>
          </motion.div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total de Ideias</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {myIdeas.length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-white to-yellow-50/50 rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1">Pendentes</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {myIdeas.filter(idea => idea.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-white to-green-50/50 rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Aprovadas</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {myIdeas.filter(idea => idea.status === 'classified').length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-white to-purple-50/50 rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Em Desenvolvimento</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {myIdeas.filter(idea => idea.phase === 'Delivery' || idea.phase === 'Scale').length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Ideas List */}
        <div className="space-y-6">
          {myIdeas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma ideia encontrada</h3>
              <p className="text-gray-600 mb-6">Você ainda não submeteu nenhuma ideia. Comece agora!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/colaborador/formulario')}
                className="px-6 py-3 bg-gradient-to-r from-caixa-blue to-indigo-600 text-white font-medium rounded-xl hover:shadow-xl transition-all"
              >
                Submeter Primeira Ideia
              </motion.button>
            </motion.div>
          ) : (
            myIdeas.map((idea, index) => {
              const PhaseIcon = getPhaseIcon(idea.phase);
              return (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  {/* Header Card */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-caixa-blue to-indigo-600 rounded-xl flex items-center justify-center">
                          <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{idea.title}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-500 flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{idea.submittedAt}</span>
                            </span>
                            <span className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded-lg flex items-center space-x-1">
                              <FileText className="w-4 h-4" />
                              <span>{idea.category}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r border ${getStatusColor(idea.status)}`}>
                          {idea.status === 'pending' ? 'Aguardando Análise' : 'Aprovada'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="p-6">
                    {/* Description */}
                    <div className="mb-6">
                      <p className="text-gray-700 leading-relaxed text-lg">{idea.description}</p>
                    </div>

                    {/* Current Phase */}
                    {idea.phase && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl p-5 border border-blue-100">
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 bg-gradient-to-r ${getPhaseColor(idea.phase)} rounded-xl shadow-lg`}>
                              <PhaseIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-900 mb-1">Fase: {idea.phase}</h4>
                              <p className="text-gray-600 mb-3">{idea.phaseDescription}</p>
                              {idea.estimatedTime && (
                                <div className="flex items-center space-x-2 text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded-lg w-fit">
                                  <Clock className="w-4 h-4" />
                                  <span className="font-medium">Tempo estimado: {idea.estimatedTime}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status or Waiting */}
                        {idea.status === 'pending' ? (
                          <div className="bg-gradient-to-br from-yellow-50 to-orange-50/50 rounded-xl p-5 border border-orange-100">
                            <div className="flex items-start space-x-4">
                              <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl shadow-lg">
                                <AlertCircle className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-orange-900 mb-1">Em Análise</h4>
                                <p className="text-orange-700">Sua ideia está sendo avaliada pelos nossos gestores.</p>
                                <p className="text-sm text-orange-600 mt-2">Em breve você receberá um feedback detalhado.</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-xl p-5 border border-green-100">
                            <div className="flex items-start space-x-4">
                              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                                <CheckCircle className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-green-900 mb-1">Aprovada</h4>
                                <p className="text-green-700">Sua ideia foi aprovada e está em desenvolvimento!</p>
                                <p className="text-sm text-green-600 mt-2">Acompanhe o progresso e feedback abaixo.</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Manager Feedback */}
                    {idea.managerFeedback && (
                      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-6 border border-slate-200">
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="p-3 bg-gradient-to-r from-slate-600 to-blue-600 rounded-xl shadow-lg">
                            <MessageSquare className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Feedback do Gestor</h4>
                            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                              <p className="text-gray-700 leading-relaxed italic">"{idea.managerFeedback}"</p>
                            </div>
                          </div>
                        </div>
                        
                        {idea.nextSteps && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                            <h5 className="font-bold text-blue-900 mb-2 flex items-center space-x-2">
                              <Target className="w-5 h-5" />
                              <span>Próximos Passos</span>
                            </h5>
                            <p className="text-blue-800 leading-relaxed">{idea.nextSteps}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default MyIdeasPage;
