/**
 * Hook de Autenticação Firebase
 * Gerencia estado de autenticação do usuário
 */
import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Observa mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
        setUser(null);
      }
    );

    return () => unsubscribe();
  }, []);

  // Login com email e senha
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (err) {
      setError(err);
      return { 
        success: false, 
        error: err.message || 'Erro ao fazer login' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Registro de novo usuário
  const signUp = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (err) {
      setError(err);
      return { 
        success: false, 
        error: err.message || 'Erro ao criar conta' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      return { success: true };
    } catch (err) {
      setError(err);
      return { 
        success: false, 
        error: err.message || 'Erro ao fazer logout' 
      };
    }
  };

  return {
    user,
    loading,
    error,
    login,
    signUp,
    logout,
    isAuthenticated: !!user
  };
};

export default useFirebaseAuth;

