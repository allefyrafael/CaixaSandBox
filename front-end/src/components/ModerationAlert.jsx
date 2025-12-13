import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ModerationAlert = ({ isOpen, onClose, fieldName, offensiveText }) => {
  if (!isOpen) return null;

  const getFieldDisplayName = (field) => {
    const fieldMap = {
      'ideaTitle': 'Título da Ideia',
      'ideaDescription': 'Descrição da Ideia',
      'publicoAlvo': 'Público-Alvo',
      'problema': 'Problema',
      'objetivos': 'Objetivos',
      'metricas': 'Métricas',
      'resultadosEsperados': 'Resultados Esperados',
      'cronograma': 'Cronograma',
      'recursos': 'Recursos',
      'desafios': 'Desafios'
    };
    return fieldMap[field] || field;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4"
          >
            {/* Alert Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-red-100 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Conteúdo Inapropriado Detectado
              </h3>

              {/* Message */}
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-3">
                  O campo <strong className="text-gray-900">{getFieldDisplayName(fieldName)}</strong> contém conteúdo que não é permitido em nosso ambiente profissional.
                </p>
                
                {offensiveText && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                    <p className="text-xs text-gray-500 mb-1">Texto detectado:</p>
                    <p className="text-sm font-mono text-red-700 break-words">
                      "{offensiveText}"
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-4">
                  Por favor, mantenha a linguagem profissional e respeitosa.
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Entendi
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ModerationAlert;

