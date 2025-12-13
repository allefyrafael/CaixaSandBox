import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Eye, User, LogOut, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useAutosave } from '../contexts/AutosaveContext';
import toast from 'react-hot-toast';

const CollaboratorNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useFirebaseAuth();
  const menuRef = useRef(null);
  
  // Obter estado de autosave (pode ser null se não estiver no provider)
  const autosaveState = useAutosave();
  const isFormPage = location.pathname === '/colaborador/formulario';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowLogoutMenu(false);
      }
    };

    if (showLogoutMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLogoutMenu]);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        toast.success('Logout realizado com sucesso!', {
          icon: '👋',
          duration: 3000
        });
        navigate('/colaborador/login');
      }
    } catch (error) {
      toast.error('Erro ao fazer logout. Tente novamente.', {
        icon: '❌',
        duration: 4000
      });
    }
  };

  const navigation = [
    { name: 'Minhas Ideias', href: '/colaborador/minhas-ideias', icon: Eye },
  ];
  
  // Componente do Indicador de Autosave
  const AutosaveIndicator = () => {
    if (!autosaveState) return null;
    
    const { saving, saveError, lastSaved, isDirty } = autosaveState;
    
    return (
      <motion.div
        key={`${saving}-${saveError}-${lastSaved ? lastSaved.getTime() : 'none'}-${isDirty}`}
        initial={{ opacity: 0, scale: 0.9, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`
          flex items-center space-x-3 px-4 py-2.5 rounded-xl shadow-md border-2 transition-all duration-300
          ${saving 
            ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 shadow-blue-200/50' 
            : saveError 
            ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-300 shadow-red-200/50'
            : lastSaved && !isDirty
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-green-200/50'
            : isDirty
            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-yellow-200/50'
            : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 shadow-gray-200/30'
          }
        `}
      >
        {/* Ícone Animado */}
        <div className="relative">
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          ) : saveError ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </motion.div>
          ) : lastSaved && !isDirty ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <Save className="w-3 h-3 text-white" />
              </div>
            </motion.div>
          ) : isDirty ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </motion.div>
          ) : (
            <div className="w-5 h-5 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          )}
        </div>

        {/* Texto e Status */}
        <div className="flex flex-col min-w-[120px]">
          {saving ? (
            <>
              <span className="text-sm font-semibold text-blue-700">Salvando...</span>
              <span className="text-xs text-blue-600">Aguarde um momento</span>
            </>
          ) : saveError ? (
            <>
              <span className="text-sm font-semibold text-red-700">Erro ao salvar</span>
              <span className="text-xs text-red-600">Tente novamente</span>
            </>
          ) : lastSaved && !isDirty ? (
            <>
              <span className="text-sm font-semibold text-green-700">Salvo no banco</span>
              <span className="text-xs text-green-600">
                {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </>
          ) : isDirty ? (
            <>
              <span className="text-sm font-semibold text-yellow-700">Alterações não salvas</span>
              <span className="text-xs text-yellow-600">Salvando em breve...</span>
            </>
          ) : (
            <>
              <span className="text-sm font-semibold text-gray-700">Pronto</span>
              <span className="text-xs text-gray-600">Tudo salvo</span>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  // Obter nome do usuário (displayName ou email)
  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'Usuário';
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-white/80 backdrop-blur-sm border-b border-gray-100'
      }`}
    >
      <div className="container-max section-padding py-4">
        <div className="flex justify-between items-center">
          {/* Logo ou Botão Voltar */}
          {isFormPage ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/colaborador/minhas-ideias')}
              className="flex items-center space-x-2 sm:space-x-3 text-gray-700 hover:text-caixa-blue transition-colors group"
            >
              <motion.div
                whileHover={{ x: -3 }}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-caixa-blue to-caixa-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold gradient-text">Voltar</h1>
                <p className="text-xs text-gray-500">Minhas Ideias</p>
              </div>
            </motion.button>
          ) : (
            <Link to="/colaborador/minhas-ideias" className="flex items-center space-x-2 sm:space-x-3">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-caixa-blue to-caixa-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-caixa-orange rounded-full animate-pulse"></div>
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold gradient-text">Colaborador</h1>
                <p className="text-xs text-gray-500">Sandbox CAIXA</p>
              </div>
            </Link>
          )}

          {/* Desktop Navigation - Central (Autosave ou Navigation) */}
          <div className="hidden md:flex items-center space-x-6 flex-1 justify-center px-4">
            {isFormPage && autosaveState ? (
              <AutosaveIndicator />
            ) : !isFormPage ? (
              navigation.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      className={`relative group flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'text-caixa-blue bg-caixa-blue-50' 
                          : 'text-gray-600 hover:text-caixa-blue hover:bg-caixa-blue-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.name}</span>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-caixa-blue rounded-full"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })
            ) : null}
          </div>

          {/* Logout Menu - Desktop */}
          <div className="hidden md:flex items-center">
            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all relative group"
                aria-label="Menu de logout"
              >
                <div className="relative">
                  {/* Ícone de porta saindo */}
                  <div className="relative">
                    <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    {/* Linha indicando saída */}
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showLogoutMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Conectado como</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {user?.email || ''}
                      </p>
                    </div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 flex items-center space-x-3 text-left hover:bg-red-50 text-red-600 transition-colors group"
                    >
                      <div className="relative">
                        <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <div className="flex-1">
                        <span className="font-medium block">Sair da conta</span>
                        <span className="text-xs text-red-500 opacity-75">Fazer logout</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-caixa-blue hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 overflow-hidden"
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 space-y-2">
                {isFormPage ? (
                  <>
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/colaborador/minhas-ideias');
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-600 hover:text-caixa-blue hover:bg-gray-50"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span className="font-medium">Voltar para Minhas Ideias</span>
                    </motion.button>
                    {autosaveState && (
                      <div className="pt-2 border-t border-gray-200">
                        <AutosaveIndicator />
                      </div>
                    )}
                  </>
                ) : (
                  navigation.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                            isActive 
                              ? 'text-caixa-blue bg-blue-50 border-l-4 border-caixa-blue' 
                              : 'text-gray-600 hover:text-caixa-blue hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      </motion.div>
                    );
                  })
                )}
                
                {/* Mobile User Info & Logout */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4 border-t border-gray-200 space-y-2"
                >
                  {/* User Info */}
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Conectado como</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || ''}
                    </p>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors group"
                  >
                    <div className="relative">
                      <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <span className="font-medium">Sair da conta</span>
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default CollaboratorNavbar;
