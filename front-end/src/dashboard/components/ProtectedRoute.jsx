import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';

const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const userData = localStorage.getItem('dashboardUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('dashboardUser');
    } finally {
      setLoading(false);
    }
  };

  const hasRequiredPermissions = () => {
    if (requiredPermissions.length === 0) return true;
    if (!user || !user.permissions) return false;
    
    return requiredPermissions.every(permission => 
      user.permissions.includes(permission)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-4"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-caixa-blue to-caixa-blue-700 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-caixa-blue"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/dashboard/login" state={{ from: location }} replace />;
  }

  if (!hasRequiredPermissions()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">
            Você não possui as permissões necessárias para acessar esta página.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-caixa-blue text-white rounded-lg hover:bg-caixa-blue-700 transition-colors"
          >
            Voltar
          </button>
        </motion.div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
