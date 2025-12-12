/**
 * Painel de Debug do Watson
 * Mostra status da integração e permite testes (apenas em desenvolvimento)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Wifi,
  WifiOff,
  TestTube,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Loader,
  Eye,
  EyeOff
} from 'lucide-react';
import { validateConfig } from '../config/ibmConfig';
import IBMWatsonClient from '../services/ibmWatsonClient';

const WatsonDebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [configStatus, setConfigStatus] = useState(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [currentThreadId, setCurrentThreadId] = useState(null);

  // Só mostra em desenvolvimento
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Verifica configuração na inicialização
    const config = validateConfig();
    setConfigStatus(config);
    
    // Verifica se há thread ativo
    const threadId = IBMWatsonClient.getCurrentThreadId();
    setCurrentThreadId(threadId);
  }, []);

  const testConnection = async () => {
    setIsRunningTest(true);
    setConnectionStatus('testing');

    try {
      const token = await IBMWatsonClient.getAccessToken();
      if (token) {
        setConnectionStatus('connected');
        const response = await IBMWatsonClient.sendMessage('teste de conexão');
        setTestResults({
          success: true,
          message: 'Conexão com Watson estabelecida',
          response: response
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      setTestResults({
        success: false,
        message: error.message,
        error: error
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  const clearTests = () => {
    setTestResults(null);
    setConnectionStatus('unknown');
    IBMWatsonClient.startNewThread();
    setCurrentThreadId(null);
  };

  // Não renderiza em produção
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'error':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      case 'testing':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'error':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'testing':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg flex items-center space-x-2"
      >
        <Settings className="w-4 h-4" />
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </motion.button>

      {/* Debug Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-purple-600 text-white p-3">
              <div className="flex items-center space-x-2">
                <TestTube className="w-5 h-5" />
                <h3 className="font-semibold">Watson Debug Panel</h3>
              </div>
              <p className="text-purple-100 text-xs mt-1">Desenvolvimento • v1.0</p>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Connection Status */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Status da Conexão</span>
                  {getStatusIcon(connectionStatus)}
                </div>
                <div className={`px-3 py-2 rounded-lg border text-xs ${getStatusColor(connectionStatus)}`}>
                  {connectionStatus === 'connected' && 'Conectado ao IBM Watson'}
                  {connectionStatus === 'error' && 'Erro na conexão'}
                  {connectionStatus === 'testing' && 'Testando conexão...'}
                  {connectionStatus === 'unknown' && 'Status desconhecido'}
                </div>
              </div>

              {/* Configuration Status */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">Configuração</span>
                  {configStatus?.isValid ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                {configStatus && !configStatus.isValid && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    {configStatus.errors.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                )}
                {configStatus?.isValid && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    Configuração válida ✓
                  </div>
                )}
              </div>

              {/* Thread ID */}
              {currentThreadId && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Thread Ativo</span>
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1 font-mono">
                    {currentThreadId.substring(0, 20)}...
                  </div>
                </div>
              )}

              {/* Test Actions */}
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={testConnection}
                  disabled={isRunningTest}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded text-xs font-medium transition-colors"
                >
                  {isRunningTest ? (
                    <Loader className="w-3 h-3 animate-spin" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                  <span>Testar</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearTests}
                  className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
                >
                  Limpar
                </motion.button>
              </div>

              {/* Test Results */}
              {testResults && (
                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-700">Resultado do Teste</span>
                  <div className={`mt-2 p-3 rounded-lg text-xs ${
                    testResults.success 
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    <div className="font-medium mb-1">
                      {testResults.success ? '✅ Sucesso' : '❌ Falha'}
                    </div>
                    <div>{testResults.message}</div>
                    {testResults.response?.threadId && (
                      <div className="mt-1 font-mono text-xs opacity-75">
                        Thread: {testResults.response.threadId.substring(0, 15)}...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Commands */}
              <div className="pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Console Commands:</div>
                <div className="text-xs text-gray-700 font-mono space-y-1">
                  <div>window.testWatson.basic()</div>
                  <div>window.testWatson.form()</div>
                  <div>window.testWatson.all()</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WatsonDebugPanel;
