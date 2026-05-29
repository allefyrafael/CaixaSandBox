import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LogOut,
  Users,
  Lightbulb,
  BarChart3,
  Settings,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Building,
  Mail,
  Phone,
  Calendar,
  MapPin,
  UserCheck,
  Clock,
  TrendingUp,
  Tag,
  Menu,
  X,
  Bell,
  Filter as FilterIcon,
  Star,
  FileText,
  Shield,
  Save,
  ChevronRight
} from 'lucide-react';

// Componente Switch reutilizável com melhor visibilidade
const ToggleSwitch = ({ enabled, onChange }) => {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 shadow-md ${
        enabled 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
          : 'bg-gray-300 border-2 border-gray-400'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg ${
          enabled 
            ? 'translate-x-5' 
            : 'translate-x-0.5'
        }`}
      />
    </button>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Estados para Configurações
  const [settings, setSettings] = useState(() => {
    // Carregar configurações salvas do localStorage
    const savedSettings = localStorage.getItem('dashboardSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    // Configurações padrão
    return {
      // Notificações
      emailNotifications: true,
      newIdeaNotification: true,
      weeklyReport: false,
      urgentAlerts: true,
      
      // Filtros e Priorização
      autoFilterByDepartment: false,
      priorityCategories: ['IA', 'Automatização', 'Inovação'],
      minViabilityScore: 60,
      
      // Preferências de Análise
      showAIInsights: true,
      autoClassification: false,
      requireComments: true,
      
      // Exibição
      itemsPerPage: 10,
      compactView: false,
      darkMode: false
    };
  });

  // Salvamento automático das configurações
  useEffect(() => {
    // Ignora o salvamento na primeira renderização (carregamento inicial)
    const isInitialMount = !localStorage.getItem('dashboardSettings');
    
    const timeoutId = setTimeout(() => {
      localStorage.setItem('dashboardSettings', JSON.stringify(settings));
      
      // Só mostra toast se não for o primeiro carregamento
      if (!isInitialMount) {
        toast.success('Salvo automaticamente', {
          icon: '💾',
          duration: 1500,
          position: 'bottom-right'
        });
      }
      console.log('Settings auto-saved:', settings);
    }, 1500); // Salva 1.5 segundos após a última alteração

    return () => clearTimeout(timeoutId);
  }, [settings]);

  // Mock data for submitted ideas
  const [submittedIdeas] = useState([
    {
      id: 1,
      title: 'Assistente Virtual IA',
      author: 'Maria Santos',
      email: 'maria.santos@caixa.gov.br',
      department: 'GICLI',
      submittedAt: '2024-01-15',
      status: 'pending',
      category: 'IA',
      description: 'Chatbot inteligente para atendimento ao cliente...',
      phase: null
    },
    {
      id: 2,
      title: 'Blockchain para Transferências',
      author: 'João Silva',
      email: 'joao.silva@caixa.gov.br',
      department: 'GIGID',
      submittedAt: '2024-01-14',
      status: 'pending',
      category: 'Blockchain',
      description: 'Sistema de transferências usando tecnologia blockchain...',
      phase: null
    },
    {
      id: 3,
      title: 'App Mobile Renovado',
      author: 'Ana Costa',
      email: 'ana.costa@caixa.gov.br',
      department: 'GECAD',
      submittedAt: '2024-01-13',
      status: 'classified',
      category: 'Mobile',
      description: 'Redesign completo do aplicativo mobile...',
      phase: 'discovery'
    }
  ]);

  // Mock data for users
  const [users] = useState([
    {
      id: 1,
      name: 'Maria Santos',
      email: 'maria.santos@caixa.gov.br',
      position: 'Analista Sênior',
      department: 'GICLI - Gerência de Experiência do Cliente',
      phone: '(11) 99999-1111',
      location: 'São Paulo, SP',
      joinDate: '2020-03-15',
      ideasSubmitted: 3,
      lastLogin: '2024-01-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'João Silva',
      email: 'joao.silva@caixa.gov.br',
      position: 'Especialista',
      department: 'GIGID - Gerência de Soluções Digitais',
      phone: '(11) 99999-2222',
      location: 'Brasília, DF',
      joinDate: '2019-08-20',
      ideasSubmitted: 5,
      lastLogin: '2024-01-14',
      status: 'active'
    },
    {
      id: 3,
      name: 'Ana Costa',
      email: 'ana.costa@caixa.gov.br',
      position: 'Coordenadora',
      department: 'GECAD - Gerência de Canais Digitais',
      phone: '(11) 99999-3333',
      location: 'Rio de Janeiro, RJ',
      joinDate: '2021-01-10',
      ideasSubmitted: 2,
      lastLogin: '2024-01-13',
      status: 'active'
    }
  ]);

  useEffect(() => {
    // Verificar se usuário está logado
    const userData = localStorage.getItem('dashboardUser');
    if (!userData) {
      navigate('/dashboard/login');
      return;
    }
    setCurrentUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('dashboardUser');
    toast.success('Logout realizado com sucesso!');
    navigate('/dashboard/login');
  };

  const handleViewIdea = (ideaId) => {
    navigate(`/dashboard/ideas/${ideaId}`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || 
                             user.department.includes(selectedDepartment);
    return matchesSearch && matchesDepartment;
  });

  const pendingIdeas = submittedIdeas.filter(idea => idea.status === 'pending');
  const classifiedIdeas = submittedIdeas.filter(idea => idea.status === 'classified');

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-caixa-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header with Navigation */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 sm:space-x-3"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-caixa-blue via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Building className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Dashboard Sandbox
                </h1>
                <p className="text-xs text-blue-600 font-medium hidden sm:block">Gestão de Inovação</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {[
                { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                { id: 'ideas', label: 'Ideias', icon: Lightbulb },
                { id: 'users', label: 'Usuários', icon: Users },
                { id: 'settings', label: 'Configurações', icon: Settings }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative group flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'text-caixa-blue bg-blue-50' 
                        : 'text-gray-600 hover:text-caixa-blue hover:bg-blue-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.label}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-caixa-blue rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* User Info & Logout */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center space-x-3"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-blue-600">{currentUser.role}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-gray-200 hover:border-red-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Mobile menu button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-caixa-blue hover:bg-gray-100 transition-colors"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden pb-4 overflow-hidden"
              >
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 space-y-2">
                  {[
                    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                    { id: 'ideas', label: 'Ideias Submetidas', icon: Lightbulb },
                    { id: 'users', label: 'Controle de Usuários', icon: Users },
                    { id: 'settings', label: 'Configurações', icon: Settings }
                  ].map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
              return (
                <motion.button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsSidebarOpen(false);
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                            ? 'text-caixa-blue bg-blue-50 border-l-4 border-caixa-blue' 
                            : 'text-gray-600 hover:text-caixa-blue hover:bg-gray-50'
                  }`}
                >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}

                  {/* Mobile User Info & Logout */}
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between px-4 py-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                        <p className="text-xs text-blue-600">{currentUser.role}</p>
        </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Logout"
                      >
                        <LogOut className="w-5 h-5" />
                      </motion.button>
      </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-white to-blue-50/50 rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-5 md:p-6 hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-blue-600 mb-1">Ideias Pendentes</p>
                      <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        {pendingIdeas.length}
                      </p>
                    </div>
                    <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-white to-green-50/50 rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-5 md:p-6 hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-green-600 mb-1">Ideias Classificadas</p>
                      <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                        {classifiedIdeas.length}
                      </p>
                    </div>
                    <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-white to-purple-50/50 rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-5 md:p-6 hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-purple-600 mb-1">Usuários Ativos</p>
                      <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        {users.length}
                      </p>
                    </div>
                    <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-white to-orange-50/50 rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-5 md:p-6 hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-orange-600 mb-1">Total de Ideias</p>
                      <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                        {submittedIdeas.length}
                      </p>
                    </div>
                    <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
                </motion.div>
              </div>

              {/* Recent Ideas */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-xl border border-white/20 overflow-hidden"
              >
                <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Ideias Recentes
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {submittedIdeas.slice(0, 3).map((idea, index) => (
                      <motion.div 
                        key={idea.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="group relative overflow-hidden bg-gradient-to-r from-white to-gray-50/50 p-5 rounded-xl border border-gray-200/50 hover:border-blue-300/50 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                              {idea.title}
                            </h4>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4 text-blue-500" />
                                <span>{idea.author}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Building className="w-4 h-4 text-purple-500" />
                                <span>{idea.department}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              idea.status === 'pending' 
                                ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border border-orange-200'
                                : 'bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}>
                              {idea.status === 'pending' ? 'Pendente' : 'Classificada'}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleViewIdea(idea.id)}
                              className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'ideas' && (
            <motion.div
              key="ideas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl md:rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-white/20">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg sm:rounded-xl">
                      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Ideias Submetidas
                    </h3>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    {submittedIdeas.map((idea, index) => (
                      <motion.div 
                        key={idea.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-gradient-to-r from-white to-gray-50/50 border border-gray-200/50 rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 hover:border-blue-300/50 hover:shadow-xl transition-all duration-300"
                      >
                        {/* Título */}
                        <div className="mb-3">
                          <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                              {idea.title}
                            </h4>
                                </div>

                        {/* Descrição */}
                        <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed line-clamp-2">
                          {idea.description}
                        </p>

                        {/* Informações em Grid Responsivo */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className="p-1 bg-blue-100 rounded-lg flex-shrink-0">
                              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                              </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500">Autor</p>
                              <p className="text-xs sm:text-sm text-gray-700 font-medium truncate">{idea.author}</p>
                                </div>
                              </div>
                          
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className="p-1 bg-purple-100 rounded-lg flex-shrink-0">
                              <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                                </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500">Departamento</p>
                              <p className="text-xs sm:text-sm text-gray-700 truncate">{idea.department}</p>
                              </div>
                                </div>
                          
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className="p-1 bg-green-100 rounded-lg flex-shrink-0">
                              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                              </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500">Data</p>
                              <p className="text-xs sm:text-sm text-gray-700">{idea.submittedAt}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className="p-1 bg-orange-100 rounded-lg flex-shrink-0">
                              <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500">Categoria</p>
                              <p className="text-xs sm:text-sm text-gray-700 truncate">{idea.category}</p>
                            </div>
                          </div>
                        </div>

                        {/* Status e Ação */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
                          <span className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap ${
                              idea.status === 'pending' 
                                ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border border-orange-200'
                                : 'bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}>
                              {idea.status === 'pending' ? 'Pendente' : `${idea.phase?.toUpperCase()}`}
                            </span>
                          
                            <motion.button
                            whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewIdea(idea.id)}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg sm:rounded-xl hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-sm"
                            >
                              <Eye className="w-4 h-4" />
                            <span>Analisar Ideia</span>
                            </motion.button>
                          </div>

                        {/* Hover Effect Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl md:rounded-b-2xl"></div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Search and Filter */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        type="text"
                        placeholder="Buscar usuários..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="sm:w-48">
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent"
                    >
                      <option value="all">Todos os Departamentos</option>
                      <option value="GICLI">GICLI</option>
                      <option value="GIGID">GIGID</option>
                      <option value="GECAD">GECAD</option>
                      <option value="GESTI">GESTI</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Usuários ({filteredUsers.length})
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    {filteredUsers.map((user) => (
                      <motion.div 
                        key={user.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-xl p-4 sm:p-5 md:p-6 hover:border-caixa-blue hover:shadow-lg transition-all duration-300"
                      >
                        {/* Header: Avatar, Nome e Status */}
                        <div className="flex items-start gap-3 sm:gap-4 mb-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-caixa-blue to-caixa-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm sm:text-base">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                                  {user.name}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-600">{user.position}</p>
                                </div>
                              
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full whitespace-nowrap">
                                  {user.status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                                <p className="text-xs text-gray-600 whitespace-nowrap">
                                  {user.ideasSubmitted} ideias
                                </p>
                                </div>
                                </div>
                                </div>
                                </div>

                        {/* Informações em Grid Responsivo */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {/* Email */}
                          <div className="flex items-center gap-2 min-w-0 bg-blue-50/50 p-3 rounded-lg">
                            <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
                              <Mail className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 mb-0.5">Email</p>
                              <p className="text-xs sm:text-sm text-gray-700 truncate">
                                {user.email}
                              </p>
                              </div>
                            </div>

                          {/* Telefone */}
                          <div className="flex items-center gap-2 min-w-0 bg-purple-50/50 p-3 rounded-lg">
                            <div className="p-1.5 bg-purple-100 rounded-lg flex-shrink-0">
                              <Phone className="w-3.5 h-3.5 text-purple-600" />
                          </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 mb-0.5">Telefone</p>
                              <p className="text-xs sm:text-sm text-gray-700 truncate">
                                {user.phone}
                              </p>
                            </div>
                          </div>

                          {/* Departamento */}
                          <div className="flex items-center gap-2 min-w-0 bg-green-50/50 p-3 rounded-lg">
                            <div className="p-1.5 bg-green-100 rounded-lg flex-shrink-0">
                              <Building className="w-3.5 h-3.5 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 mb-0.5">Departamento</p>
                              <p className="text-xs sm:text-sm text-gray-700 truncate">
                                {user.department}
                            </p>
                          </div>
                        </div>

                          {/* Localização */}
                          <div className="flex items-center gap-2 min-w-0 bg-orange-50/50 p-3 rounded-lg">
                            <div className="p-1.5 bg-orange-100 rounded-lg flex-shrink-0">
                              <MapPin className="w-3.5 h-3.5 text-orange-600" />
                      </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 mb-0.5">Localização</p>
                              <p className="text-xs sm:text-sm text-gray-700 truncate">
                                {user.location}
                              </p>
                            </div>
                          </div>

                          {/* Data de Entrada */}
                          <div className="flex items-center gap-2 min-w-0 bg-indigo-50/50 p-3 rounded-lg">
                            <div className="p-1.5 bg-indigo-100 rounded-lg flex-shrink-0">
                              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 mb-0.5">Entrada</p>
                              <p className="text-xs sm:text-sm text-gray-700 truncate">
                                {user.joinDate}
                              </p>
                            </div>
                          </div>

                          {/* Último Login */}
                          <div className="flex items-center gap-2 min-w-0 bg-pink-50/50 p-3 rounded-lg">
                            <div className="p-1.5 bg-pink-100 rounded-lg flex-shrink-0">
                              <Clock className="w-3.5 h-3.5 text-pink-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 mb-0.5">Último Login</p>
                              <p className="text-xs sm:text-sm text-gray-700 truncate">
                                {user.lastLogin}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Configurações do Gestor</h2>
                    <p className="text-blue-100">Personalize sua experiência de análise de ideias</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Notificações */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Bell className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Notificações por Email</p>
                        <p className="text-xs text-gray-500">Receber resumos por email</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.emailNotifications}
                        onChange={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Novas Ideias</p>
                        <p className="text-xs text-gray-500">Alertas de ideias recém-submetidas</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.newIdeaNotification}
                        onChange={() => setSettings({...settings, newIdeaNotification: !settings.newIdeaNotification})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Relatório Semanal</p>
                        <p className="text-xs text-gray-500">Resumo semanal de atividades</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.weeklyReport}
                        onChange={() => setSettings({...settings, weeklyReport: !settings.weeklyReport})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Alertas Urgentes</p>
                        <p className="text-xs text-gray-500">Ideias que precisam de atenção</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.urgentAlerts}
                        onChange={() => setSettings({...settings, urgentAlerts: !settings.urgentAlerts})}
                      />
                    </div>
              </div>
                </motion.div>

                {/* Filtros e Priorização */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FilterIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Filtros e Priorização</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Filtro Automático por Depto</p>
                        <p className="text-xs text-gray-500">Filtrar pelo seu departamento</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.autoFilterByDepartment}
                        onChange={() => setSettings({...settings, autoFilterByDepartment: !settings.autoFilterByDepartment})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Score Mínimo de Viabilidade
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={settings.minViabilityScore}
                          onChange={(e) => setSettings({...settings, minViabilityScore: parseInt(e.target.value)})}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-sm font-semibold text-blue-600 min-w-[45px]">
                          {settings.minViabilityScore}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Ideias abaixo deste score serão destacadas</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Categorias Prioritárias
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['IA', 'Automatização', 'Inovação', 'UX', 'Blockchain', 'Cloud'].map((category) => (
                          <button
                            key={category}
                            onClick={() => {
                              const isPriority = settings.priorityCategories.includes(category);
                              setSettings({
                                ...settings,
                                priorityCategories: isPriority
                                  ? settings.priorityCategories.filter(c => c !== category)
                                  : [...settings.priorityCategories, category]
                              });
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              settings.priorityCategories.includes(category)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Preferências de Análise */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Star className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Análise de Ideias</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Insights de IA</p>
                        <p className="text-xs text-gray-500">Exibir análises automáticas</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.showAIInsights}
                        onChange={() => setSettings({...settings, showAIInsights: !settings.showAIInsights})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Classificação Automática</p>
                        <p className="text-xs text-gray-500">IA sugere fase automaticamente</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.autoClassification}
                        onChange={() => setSettings({...settings, autoClassification: !settings.autoClassification})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Comentários Obrigatórios</p>
                        <p className="text-xs text-gray-500">Exigir feedback ao classificar</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.requireComments}
                        onChange={() => setSettings({...settings, requireComments: !settings.requireComments})}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Preferências de Exibição */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Eye className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Preferências de Exibição</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Itens por Página
                      </label>
                      <select
                        value={settings.itemsPerPage}
                        onChange={(e) => setSettings({...settings, itemsPerPage: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value={5}>5 itens</option>
                        <option value={10}>10 itens</option>
                        <option value={20}>20 itens</option>
                        <option value={50}>50 itens</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Visualização Compacta</p>
                        <p className="text-xs text-gray-500">Mostrar mais itens na tela</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.compactView}
                        onChange={() => setSettings({...settings, compactView: !settings.compactView})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Modo Escuro</p>
                        <p className="text-xs text-gray-500">Interface com tema escuro</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.darkMode}
                        onChange={() => setSettings({...settings, darkMode: !settings.darkMode})}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Indicador de Salvamento Automático */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center"
              >
                <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                  <Save className="w-4 h-4 text-green-600" />
                  <span>Suas alterações são salvas automaticamente</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardPage;
