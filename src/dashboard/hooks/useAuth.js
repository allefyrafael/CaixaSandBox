import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
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

  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Simular autenticação (substituir por API real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (credentials.email && credentials.password) {
        const userData = {
          id: 1,
          name: credentials.email.split('@')[0].replace('.', ' '),
          email: credentials.email,
          role: 'Gestor de Inovação',
          department: 'GEINA - Gerência Nacional de Inovação',
          permissions: ['view_ideas', 'classify_ideas', 'manage_users'],
          loginTime: new Date().toISOString()
        };

        localStorage.setItem('dashboardUser', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: 'Credenciais inválidas' };
      }
    } catch (error) {
      return { success: false, error: 'Erro ao realizar login' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('dashboardUser');
    setUser(null);
    navigate('/dashboard/login');
  };

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  return {
    user,
    loading,
    login,
    logout,
    hasPermission,
    isAuthenticated,
    checkAuthStatus
  };
};

export default useAuth;
