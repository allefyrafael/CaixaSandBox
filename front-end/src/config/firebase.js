/**
 * Configuração do Firebase
 * Inicializa Firebase App e Auth
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Configuração do Firebase
// As credenciais podem ser sobrescritas por variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBKz-E7ZOeauEMeaAyeO61Aud8H9PvEruY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "sandboxcaixa-84951.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "sandboxcaixa-84951",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "sandboxcaixa-84951.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1067213686274",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1067213686274:web:95aba2fb4f46318b60c91b"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta Auth
export const auth = getAuth(app);
export default app;

