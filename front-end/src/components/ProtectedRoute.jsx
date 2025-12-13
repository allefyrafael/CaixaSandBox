/**
 * Componente de Rota Protegida para Colaboradores
 * Verifica se o usuário está autenticado via Firebase Auth
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const { user, loading, isAuthenticated } = useFirebaseAuth();
  const location = useLocation();

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

  if (!isAuthenticated || !user) {
    // Redireciona para login, salvando a rota atual para retornar depois
    return <Navigate to="/colaborador/login" state={{ from: location }} replace />;
  }

  // Se houver permissões requeridas, verificar (implementar depois se necessário)
  if (requiredPermissions.length > 0) {
    // Por enquanto, apenas verifica autenticação
    // Pode ser expandido para verificar permissões específicas
  }

  return children;
};

export default ProtectedRoute;

