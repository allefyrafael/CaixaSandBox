import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Shield,
  Building,
  LogIn,
  Sparkles
} from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular autenticação
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Validação simples (substituir por autenticação real)
      if (formData.email && formData.password) {
        // Simular dados do gestor logado
        const managerData = {
          id: 1,
          name: 'João Silva',
          email: formData.email,
          role: 'Gestor de Inovação',
          department: 'GEINA - Gerência Nacional de Inovação',
          permissions: ['view_ideas', 'classify_ideas', 'manage_users'],
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('dashboardUser', JSON.stringify(managerData));
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      } else {
        toast.error('Email e senha são obrigatórios');
      }
    } catch (error) {
      toast.error('Erro ao realizar login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_1px,_transparent_1px)] bg-[length:60px_60px]"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md"
      >
        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-caixa-blue to-caixa-blue-700 rounded-full mb-6"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              Dashboard Sandbox CAIXA
            </h1>
            <p className="text-blue-200 text-sm">
              Acesso restrito para gestores
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Email Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-xl bg-white/10 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent backdrop-blur-sm"
                  placeholder="seu.email@caixa.gov.br"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-white/20 rounded-xl bg-white/10 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent backdrop-blur-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-blue-300 hover:text-white transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-blue-300 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-gradient-to-r from-caixa-blue to-caixa-blue-700 text-white font-medium hover:from-caixa-blue-700 hover:to-caixa-blue-800 focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Autenticando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Acessar Dashboard
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center space-x-2 text-blue-300 text-xs">
              <Building className="w-4 h-4" />
              <span>Caixa Econômica Federal</span>
            </div>
            <p className="text-blue-400 text-xs mt-2">
              Sistema de gestão do Sandbox CAIXA
            </p>
          </motion.div>
        </div>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">Demo</span>
          </div>
          <p className="text-xs text-blue-200 mb-2">
            Para demonstração, use qualquer email e senha:
          </p>
          <div className="grid grid-cols-1 gap-1 text-xs text-blue-300">
            <div>📧 Email: gestor@caixa.gov.br</div>
            <div>🔑 Senha: demo123</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
