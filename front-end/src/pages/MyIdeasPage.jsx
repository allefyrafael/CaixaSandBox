import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { listIdeas, createIdea, deleteIdea } from '../services/api';
import toast from 'react-hot-toast';
import {
  Lightbulb,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Calendar,
  Plus,
  Target,
  Star,
  TrendingUp,
  FileText,
  ChevronDown,
  Loader2,
  Edit,
  Trash2,
  X,
  AlertTriangle
} from 'lucide-react';

const MyIdeasPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useFirebaseAuth();
  const [myIdeas, setMyIdeas] = useState([]);
  const [expandedIdeas, setExpandedIdeas] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [creatingIdea, setCreatingIdea] = useState(false);
  const [deletingIdeaId, setDeletingIdeaId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { ideaId, ideaTitle }

  // Carregar ideias do backend
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      loadIdeas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.uid]);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      const ideas = await listIdeas(user.uid);
      
      // Se não houver ideias, apenas define array vazio (não é erro)
      if (!ideas || ideas.length === 0) {
        setMyIdeas([]);
        return;
      }
      
      // Transformar dados do backend para o formato esperado pela UI
      const formattedIdeas = ideas.map(idea => ({
        id: idea.id,
        title: idea.title || 'Sem título',
        description: idea.description || '',
        submittedAt: idea.created_at 
          ? (idea.created_at.seconds 
              ? new Date(idea.created_at.seconds * 1000).toISOString().split('T')[0]
              : new Date(idea.created_at).toISOString().split('T')[0])
          : new Date().toISOString().split('T')[0],
        status: idea.status || 'draft',
        phase: idea.dynamic_content?.phase || null,
        phaseDescription: idea.dynamic_content?.phaseDescription || null,
        managerFeedback: idea.dynamic_content?.managerFeedback || null,
        nextSteps: idea.dynamic_content?.nextSteps || null,
        estimatedTime: idea.dynamic_content?.estimatedTime || null,
        category: idea.dynamic_content?.category || 'Geral',
        priority: idea.dynamic_content?.priority || 'Média'
      }));
      
      setMyIdeas(formattedIdeas);
    } catch (error) {
      console.error('Erro ao carregar ideias:', error);
      // Só mostra erro se realmente houver um problema de conexão
      // Se for apenas "sem ideias", não mostra erro
      if (error.message && !error.message.includes('404') && !error.message.includes('não encontrada')) {
        toast.error('Erro ao carregar suas ideias. Verifique sua conexão e tente novamente.', {
          icon: '⚠️',
          duration: 5000
        });
      }
      setMyIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewIdea = async () => {
    if (!user?.uid) {
      toast.error('Você precisa estar autenticado para criar uma ideia', {
        icon: '🔒',
        duration: 4000
      });
      return;
    }

    try {
      setCreatingIdea(true);
      const newIdea = await createIdea(user.uid, 'Nova Ideia');
      toast.success('Ideia criada com sucesso! Redirecionando...', {
        icon: '✨',
        duration: 3000
      });
      navigate(`/colaborador/formulario?ideaId=${newIdea.id}`);
    } catch (error) {
      console.error('Erro ao criar ideia:', error);
      toast.error('Erro ao criar nova ideia. Verifique sua conexão e tente novamente.', {
        icon: '❌',
        duration: 5000
      });
    } finally {
      setCreatingIdea(false);
    }
  };

  const handleDeleteClick = (ideaId, ideaTitle) => {
    setDeleteConfirm({ ideaId, ideaTitle });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm || !user?.uid) {
      return;
    }

    const { ideaId } = deleteConfirm;

    try {
      setDeletingIdeaId(ideaId);
      setDeleteConfirm(null); // Fechar modal
      
      await deleteIdea(user.uid, ideaId);
      
      // Remover da lista local
      setMyIdeas(prev => prev.filter(idea => idea.id !== ideaId));
      
      // Remover do set de expandidos se estiver lá
      setExpandedIdeas(prev => {
        const newSet = new Set(prev);
        newSet.delete(ideaId);
        return newSet;
      });
      
      toast.success('Ideia excluída com sucesso!', {
        icon: '🗑️',
        duration: 3000
      });
    } catch (error) {
      console.error('Erro ao deletar ideia:', error);
      toast.error('Erro ao excluir ideia. Verifique sua conexão e tente novamente.', {
        icon: '❌',
        duration: 5000
      });
    } finally {
      setDeletingIdeaId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      case 'submitted':
      case 'classified':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'approved':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
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

  const toggleIdea = (ideaId) => {
    setExpandedIdeas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ideaId)) {
        newSet.delete(ideaId);
      } else {
        newSet.add(ideaId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 sm:pt-24">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                  Minhas Ideias
                </h1>
                <p className="text-sm sm:text-lg text-blue-600 font-medium truncate">Acompanhe o status das suas propostas</p>
              </div>
            </div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateNewIdea}
              disabled={creatingIdea || loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-caixa-blue to-indigo-600 text-white font-medium rounded-xl hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {creatingIdea ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span className="text-sm sm:text-base">Criando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Nova Ideia</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-white to-blue-50/50 rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-blue-600 mb-1 truncate">Total de Ideias</p>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {myIdeas.length}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shrink-0 ml-2">
                <Lightbulb className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-white to-yellow-50/50 rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-yellow-600 mb-1 truncate">Pendentes</p>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {myIdeas.filter(idea => idea.status === 'pending' || idea.status === 'draft').length}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl shrink-0 ml-2">
                <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-white to-green-50/50 rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-green-600 mb-1 truncate">Aprovadas</p>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {myIdeas.filter(idea => idea.status === 'classified' || idea.status === 'approved').length}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl shrink-0 ml-2">
                <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-white to-purple-50/50 rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-purple-600 mb-1 truncate">Em Desenvolvimento</p>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {myIdeas.filter(idea => idea.phase === 'Delivery' || idea.phase === 'Scale').length}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl sm:rounded-2xl shrink-0 ml-2">
                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

            {/* Ideas List */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-16">
                  <Loader2 className="w-12 h-12 text-caixa-blue animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Carregando suas ideias...</p>
                </div>
              ) : myIdeas.length === 0 ? (
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
                onClick={handleCreateNewIdea}
                disabled={creatingIdea}
                className="px-6 py-3 bg-gradient-to-r from-caixa-blue to-indigo-600 text-white font-medium rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
              >
                {creatingIdea ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Criando...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Submeter Primeira Ideia</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          ) : (
            myIdeas.map((idea, index) => {
              const PhaseIcon = getPhaseIcon(idea.phase);
              const isExpanded = expandedIdeas.has(idea.id);
              const isDraft = idea.status === 'draft';
              
              // Handler para navegação
              const handleNavigateToForm = (e) => {
                if (e) {
                  e.preventDefault();
                  e.stopPropagation();
                }
                
                console.log('[DEBUG] handleNavigateToForm chamado', { 
                  ideaId: idea.id, 
                  ideaStatus: idea.status,
                  isDraft,
                  idea 
                });
                
                if (!idea.id) {
                  console.error('[ERROR] ID da ideia não encontrado:', idea);
                  toast.error('Erro: ID da ideia não encontrado');
                  return;
                }
                
                const url = `/colaborador/formulario?ideaId=${idea.id}`;
                console.log('[DEBUG] Navegando para:', url);
                console.log('[DEBUG] URL completa esperada:', `http://localhost:3000/CaixaSandBox${url}`);
                console.log('[DEBUG] navigate function:', typeof navigate);
                
                // Usar window.location como fallback se navigate não funcionar
                try {
                  navigate(url, { replace: false });
                  console.log('[DEBUG] navigate() chamado com sucesso');
                } catch (error) {
                  console.error('[ERROR] Erro ao navegar com navigate():', error);
                  // Fallback: usar window.location
                  console.log('[DEBUG] Tentando fallback com window.location');
                  window.location.href = `/CaixaSandBox${url}`;
                }
              };
              
              return (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 ${
                    isDraft ? 'hover:shadow-xl hover:border-caixa-blue cursor-pointer' : 'hover:shadow-lg'
                  }`}
                  onClick={isDraft ? handleNavigateToForm : undefined}
                  role={isDraft ? 'button' : undefined}
                  tabIndex={isDraft ? 0 : undefined}
                  onKeyDown={isDraft ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleNavigateToForm(e);
                    }
                  } : undefined}
                >
                  {/* Header Card - Clicável para Expandir (ou navegar se for rascunho) */}
                  <button
                    type="button"
                    onClick={isDraft ? handleNavigateToForm : () => toggleIdea(idea.id)}
                    className={`w-full bg-white px-4 sm:px-6 py-3 sm:py-4 transition-colors ${
                      isDraft ? 'hover:bg-blue-50' : 'hover:bg-gray-50'
                    } cursor-pointer`}
                  >
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-caixa-blue to-indigo-600 rounded-lg flex items-center justify-center shrink-0 ${
                          isDraft ? 'ring-2 ring-blue-300' : ''
                        }`}>
                          {isDraft ? (
                            <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          ) : (
                            <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-left truncate">{idea.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                            <span className="text-xs sm:text-sm text-gray-500 flex items-center space-x-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{idea.submittedAt}</span>
                            </span>
                            <span className="text-xs sm:text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                              {idea.category}
                            </span>
                            {isDraft && (
                              <span className="text-xs sm:text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center space-x-1">
                                <Edit className="w-3 h-3" />
                                <span>Clique para continuar editando</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                        <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(idea.status)} whitespace-nowrap`}>
                          {idea.status === 'draft' ? 'Rascunho' : 
                           idea.status === 'pending' ? 'Aguardando Análise' : 
                           idea.status === 'submitted' ? 'Enviada' : 
                           idea.status === 'classified' || idea.status === 'approved' ? 'Aprovada' : 
                           idea.status === 'rejected' ? 'Rejeitada' : idea.status}
                        </span>
                        
                        {/* Botão de Deletar */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteClick(idea.id, idea.title);
                          }}
                          disabled={deletingIdeaId === idea.id}
                          className="p-1.5 sm:p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Excluir ideia: ${idea.title}`}
                          title="Excluir ideia"
                        >
                          {deletingIdeaId === idea.id ? (
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </motion.button>
                        
                        {!isDraft && (
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="shrink-0"
                          >
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Content Grid - Accordion (apenas para ideias não-rascunho) */}
                  <AnimatePresence>
                    {!isDraft && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6 border-t border-gray-100">
                          {/* Description */}
                          <div className="mb-4 sm:mb-6">
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{idea.description}</p>
                          </div>

                          {/* Current Phase */}
                          {idea.phase && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl p-4 sm:p-5 border border-blue-100">
                                <div className="flex items-start space-x-3 sm:space-x-4">
                                  <div className={`p-2 sm:p-3 bg-gradient-to-r ${getPhaseColor(idea.phase)} rounded-xl shadow-lg shrink-0`}>
                                    <PhaseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Fase: {idea.phase}</h4>
                                    <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">{idea.phaseDescription}</p>
                                    {idea.estimatedTime && (
                                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-blue-700 bg-blue-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg w-fit">
                                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="font-medium">Tempo estimado: {idea.estimatedTime}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Status or Waiting */}
                              {idea.status === 'pending' || idea.status === 'draft' ? (
                                <div className="bg-gradient-to-br from-yellow-50 to-orange-50/50 rounded-xl p-4 sm:p-5 border border-orange-100">
                                  <div className="flex items-start space-x-3 sm:space-x-4">
                                    <div className="p-2 sm:p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl shadow-lg shrink-0">
                                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-base sm:text-lg font-bold text-orange-900 mb-1">Em Análise</h4>
                                      <p className="text-sm sm:text-base text-orange-700">Sua ideia está sendo avaliada pelos nossos gestores.</p>
                                      <p className="text-xs sm:text-sm text-orange-600 mt-2">Em breve você receberá um feedback detalhado.</p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-xl p-4 sm:p-5 border border-green-100">
                                  <div className="flex items-start space-x-3 sm:space-x-4">
                                    <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg shrink-0">
                                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-base sm:text-lg font-bold text-green-900 mb-1">Aprovada</h4>
                                      <p className="text-sm sm:text-base text-green-700">Sua ideia foi aprovada e está em desenvolvimento!</p>
                                      <p className="text-xs sm:text-sm text-green-600 mt-2">Acompanhe o progresso e feedback abaixo.</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Manager Feedback */}
                          {idea.managerFeedback && (
                            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-4 sm:p-6 border border-slate-200">
                              <div className="flex items-start space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                                <div className="p-2 sm:p-3 bg-gradient-to-r from-slate-600 to-blue-600 rounded-xl shadow-lg shrink-0">
                                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Feedback do Gestor</h4>
                                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-sm">
                                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed italic">"{idea.managerFeedback}"</p>
                                  </div>
                                </div>
                              </div>
                              
                              {idea.nextSteps && (
                                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                  <h5 className="text-sm sm:text-base font-bold text-blue-900 mb-2 flex items-center space-x-2">
                                    <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>Próximos Passos</span>
                                  </h5>
                                  <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">{idea.nextSteps}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Botão de Editar */}
                          <div className="mt-6 sm:mt-8 flex justify-end">
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('[DEBUG] Botão Continuar Editando clicado', { ideaId: idea.id, idea });
                                
                                if (!idea.id) {
                                  console.error('[ERROR] ID da ideia não encontrado:', idea);
                                  toast.error('Erro: ID da ideia não encontrado');
                                  return;
                                }
                                
                                const url = `/colaborador/formulario?ideaId=${idea.id}`;
                                console.log('[DEBUG] Navegando para:', url);
                                console.log('[DEBUG] URL completa esperada:', `http://localhost:3000/CaixaSandBox${url}`);
                                
                                try {
                                  navigate(url, { replace: false });
                                  console.log('[DEBUG] navigate() chamado com sucesso');
                                } catch (error) {
                                  console.error('[ERROR] Erro ao navegar:', error);
                                  // Fallback
                                  window.location.href = `/CaixaSandBox${url}`;
                                }
                              }}
                              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-caixa-blue to-indigo-600 text-white font-medium rounded-xl hover:shadow-xl transition-all flex items-center justify-center space-x-2 group"
                            >
                              <Edit className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                              <span>Continuar Editando</span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </main>

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDeleteCancel}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              {/* Modal */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200"
              >
                {/* Header com gradiente */}
                <div className="bg-gradient-to-r from-red-500 via-red-600 to-orange-600 p-6 relative overflow-hidden">
                  {/* Decoração de fundo */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
                  </div>
                  
                  <div className="relative flex items-center space-x-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30"
                    >
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">Confirmar Exclusão</h3>
                      <p className="text-red-100 text-sm mt-1">Esta ação não pode ser desfeita</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleDeleteCancel}
                      className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-colors"
                      aria-label="Fechar"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-gray-700 text-base leading-relaxed mb-4">
                      Tem certeza que deseja excluir a ideia
                    </p>
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Lightbulb className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-lg break-words">
                            "{deleteConfirm.ideaTitle}"
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-4 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span>Esta ação é permanente e não pode ser revertida.</span>
                    </p>
                  </div>

                  {/* Botões */}
                  <div className="flex items-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDeleteCancel}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancelar</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDeleteConfirm}
                      disabled={deletingIdeaId === deleteConfirm.ideaId}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {deletingIdeaId === deleteConfirm.ideaId ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Excluindo...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>Excluir</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyIdeasPage;
