import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, X, Sparkles } from 'lucide-react';

const FieldSuggestion = ({ fieldName, suggestion, reasoning, onAccept, onReject, isVisible }) => {
  if (!isVisible || !suggestion) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-md overflow-hidden"
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start space-x-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-gray-900">Sugestão da IA</h4>
              </div>
              {reasoning && (
                <p className="text-xs text-gray-600 italic">{reasoning}</p>
              )}
            </div>
          </div>

          {/* Suggestion Content */}
          <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">{suggestion}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAccept}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Aceitar</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReject}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300 transition-all"
            >
              <X className="w-4 h-4" />
              <span>Rejeitar</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FieldSuggestion;

