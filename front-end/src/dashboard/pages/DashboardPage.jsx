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
  Tag
} from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-caixa-blue via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Dashboard Sandbox CAIXA
                </h1>
                <p className="text-sm text-blue-600 font-medium">Centro de Gestão de Inovação</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-blue-600">{currentUser.role}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-gray-200 hover:border-red-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2">
            {[
              { id: 'overview', label: 'Visão Geral', icon: BarChart3, color: 'from-blue-500 to-indigo-600' },
              { id: 'ideas', label: 'Ideias Submetidas', icon: Lightbulb, color: 'from-yellow-500 to-orange-600' },
              { id: 'users', label: 'Controle de Usuários', icon: Users, color: 'from-purple-500 to-pink-600' },
              { id: 'settings', label: 'Configurações', icon: Settings, color: 'from-green-500 to-teal-600' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`py-3 px-6 rounded-xl font-medium text-sm flex items-center space-x-2 transition-all m-2 ${
                    isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-blue-500/25`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-1">Ideias Pendentes</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        {pendingIdeas.length}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-white to-green-50/50 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-1">Ideias Classificadas</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                        {classifiedIdeas.length}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-white to-purple-50/50 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 mb-1">Usuários Ativos</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        {users.length}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-white to-orange-50/50 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 mb-1">Total de Ideias</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                        {submittedIdeas.length}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
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
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Ideias Submetidas
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {submittedIdeas.map((idea, index) => (
                      <motion.div 
                        key={idea.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-gradient-to-r from-white to-gray-50/50 border border-gray-200/50 rounded-2xl p-6 hover:border-blue-300/50 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-900 transition-colors">
                              {idea.title}
                            </h4>
                            <p className="text-gray-600 mb-4 leading-relaxed">{idea.description}</p>
                            <div className="flex items-center space-x-6 text-sm">
                              <div className="flex items-center space-x-2">
                                <div className="p-1 bg-blue-100 rounded-lg">
                                  <Users className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-gray-700 font-medium">{idea.author}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="p-1 bg-purple-100 rounded-lg">
                                  <Building className="w-4 h-4 text-purple-600" />
                                </div>
                                <span className="text-gray-700">{idea.department}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="p-1 bg-green-100 rounded-lg">
                                  <Calendar className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-gray-700">{idea.submittedAt}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="p-1 bg-orange-100 rounded-lg">
                                  <Tag className="w-4 h-4 text-orange-600" />
                                </div>
                                <span className="text-gray-700">{idea.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 ml-6">
                            <span className={`px-4 py-2 text-sm font-medium rounded-full ${
                              idea.status === 'pending' 
                                ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border border-orange-200'
                                : 'bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}>
                              {idea.status === 'pending' ? 'Pendente' : `${idea.phase?.toUpperCase()}`}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.05, rotate: 2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewIdea(idea.id)}
                              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:shadow-xl transition-all flex items-center space-x-2"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Analisar</span>
                            </motion.button>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl"></div>
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
              className="space-y-6"
            >
              {/* Search and Filter */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar usuários..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="sm:w-48">
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent"
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
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Usuários ({filteredUsers.length})
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid gap-6">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="border border-gray-200 rounded-lg p-6 hover:border-caixa-blue transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-caixa-blue to-caixa-blue-700 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{user.name}</h4>
                              <p className="text-sm text-gray-600 mb-2">{user.position}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4" />
                                  <span>{user.email}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{user.phone}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Building className="w-4 h-4" />
                                  <span>{user.department}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>{user.location}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>Desde {user.joinDate}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4" />
                                  <span>Último login: {user.lastLogin}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="mb-2">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                {user.status === 'active' ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {user.ideasSubmitted} ideias submetidas
                            </p>
                          </div>
                        </div>
                      </div>
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
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações do Sistema</h3>
                <p className="text-gray-600">Funcionalidades de configuração em desenvolvimento...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardPage;
