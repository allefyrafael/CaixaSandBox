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
    let timeoutId;
    let isMounted = true;
    let authInitialized = false;

    // Timeout de segurança: se o Firebase não responder em 5 segundos, parar o loading
    timeoutId = setTimeout(() => {
      if (isMounted && !authInitialized) {
        console.warn('[useFirebaseAuth] Timeout: Firebase não respondeu em 5 segundos. Parando loading.');
        setLoading(false);
        setError(new Error('Timeout ao inicializar autenticação. Verifique sua conexão.'));
      }
    }, 5000);

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          if (isMounted) {
            authInitialized = true;
            clearTimeout(timeoutId);
            setUser(currentUser);
            setLoading(false);
            setError(null);
            console.log('[useFirebaseAuth] Estado de autenticação atualizado:', currentUser ? 'Autenticado' : 'Não autenticado');
          }
        },
        (err) => {
          if (isMounted) {
            authInitialized = true;
            clearTimeout(timeoutId);
            console.error('[useFirebaseAuth] Erro no estado de autenticação:', err);
            setError(err);
            setLoading(false);
            setUser(null);
          }
        }
      );

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
        unsubscribe();
      };
    } catch (err) {
      if (isMounted) {
        authInitialized = true;
        clearTimeout(timeoutId);
        console.error('[useFirebaseAuth] Erro ao configurar listener de autenticação:', err);
        setError(err);
        setLoading(false);
        setUser(null);
      }
    }
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

