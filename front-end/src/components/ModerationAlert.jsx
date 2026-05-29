import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, HelpCircle } from 'lucide-react';

const ModerationAlert = ({ isOpen, onClose, fieldName, offensiveText, tipo, justificativa, todosCampos = [] }) => {
  // Debug: verificar se o componente está sendo renderizado
  React.useEffect(() => {
    if (isOpen) {
      console.log('[ModerationAlert] Componente renderizado com:', {
        isOpen,
        fieldName,
        tipo,
        justificativa,
        todosCampos: todosCampos?.length || 0
      });
    }
  }, [isOpen, fieldName, tipo, justificativa, todosCampos]);
  
  if (!isOpen) {
    console.log('[ModerationAlert] isOpen é false, não renderizando');
    return null;
  }
  
  const isOffensive = tipo === 'ofensivo';
  const bgColor = isOffensive ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200';
  const iconColor = isOffensive ? 'text-red-600' : 'text-yellow-600';
  const iconBg = isOffensive ? 'bg-red-100' : 'bg-yellow-100';
  const Icon = isOffensive ? AlertTriangle : HelpCircle;
  const title = isOffensive ? 'Conteúdo Inapropriado Detectado' : 'Conteúdo Fora de Contexto';
  const buttonColor = isOffensive 
    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
    : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800';

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
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
          >
            {/* Alert Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.3 
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative z-[10000]"
              style={{ zIndex: 10000 }}
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
                <div className={`p-4 ${iconBg} rounded-full`}>
                  <Icon className={`w-8 h-8 ${iconColor}`} />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                {title}
              </h3>

              {/* Message */}
              <div className="text-center mb-6">
                {justificativa ? (
                  <p className="text-gray-600 mb-4 text-base">
                    {justificativa}
                  </p>
                ) : (
                  <p className="text-gray-600 mb-4 text-base">
                    {isOffensive 
                      ? `O campo <strong className="text-gray-900">${getFieldDisplayName(fieldName)}</strong> contém conteúdo que não é permitido em nosso ambiente profissional.`
                      : `O campo <strong className="text-gray-900">${getFieldDisplayName(fieldName)}</strong> não está relacionado a ideias e inovação da Caixa Econômica Federal.`
                    }
                  </p>
                )}
                
                {/* Lista de todos os campos com problema - DESTACADO */}
                {todosCampos && todosCampos.length > 0 && (
                  <div className={`${bgColor} border-2 ${isOffensive ? 'border-red-300' : 'border-yellow-300'} rounded-xl p-4 mt-4 text-left shadow-md`}>
                    <p className={`text-sm font-bold ${isOffensive ? 'text-red-800' : 'text-yellow-800'} mb-3`}>
                      Campos que precisam ser revisados:
                    </p>
                    <div className="space-y-3">
                      {todosCampos.map((campo, index) => (
                        <div key={index} className={`bg-white rounded-lg p-3 border ${isOffensive ? 'border-red-200' : 'border-yellow-200'}`}>
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            {getFieldDisplayName(campo.campo)}
                          </p>
                          {/* Texto problemático destacado */}
                          {campo.texto && (
                            <div className={`mt-2 p-2 rounded ${isOffensive ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                              <p className="text-xs text-gray-600 mb-1">Texto detectado:</p>
                              <p className={`text-base font-semibold break-words ${isOffensive ? 'text-red-800' : 'text-yellow-800'}`}>
                                "{campo.texto}"
                              </p>
                            </div>
                          )}
                          <p className={`text-xs mt-2 ${isOffensive ? 'text-red-700' : 'text-yellow-700'}`}>
                            {campo.justificativa || (isOffensive ? 'Linguagem ofensiva detectada' : 'Conteúdo fora de contexto')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Fallback para quando não há todosCampos mas há offensiveText */}
                {offensiveText && (!todosCampos || todosCampos.length === 0) && (
                  <div className={`${bgColor} border-2 ${isOffensive ? 'border-red-300' : 'border-yellow-300'} rounded-xl p-4 mt-4 shadow-md`}>
                    <p className={`text-sm font-bold ${isOffensive ? 'text-red-800' : 'text-yellow-800'} mb-2`}>
                      Texto detectado:
                    </p>
                    <div className={`bg-white rounded-lg p-3 border ${isOffensive ? 'border-red-200' : 'border-yellow-200'}`}>
                      <p className={`text-lg font-bold break-words ${isOffensive ? 'text-red-800' : 'text-yellow-800'}`}>
                        "{offensiveText}"
                      </p>
                    </div>
                  </div>
                )}

                <p className={`text-sm font-medium mt-4 ${isOffensive ? 'text-red-700' : 'text-yellow-700'}`}>
                  {isOffensive 
                    ? 'Por favor, mantenha a linguagem profissional e respeitosa.'
                    : 'Por favor, mantenha o foco em ideias e inovação relacionadas à Caixa Econômica Federal.'
                  }
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={onClose}
                className={`w-full ${buttonColor} text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl`}
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

