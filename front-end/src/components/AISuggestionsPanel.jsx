/**
 * Painel de Sugestões da IA
 * Interface para aprovar/rejeitar sugestões com diff visual
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Brain,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  MessageSquare
} from 'lucide-react';

const AISuggestionsPanel = ({
  suggestions = [],
  onApproveSuggestion,
  onRejectSuggestion,
  isVisible = true,
  mockupStats = null
}) => {
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const [rejectionReasons, setRejectionReasons] = useState({});

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  const handleApprove = (suggestionId) => {
    onApproveSuggestion(suggestionId);
    setExpandedSuggestion(null);
  };

  const handleReject = (suggestionId) => {
    const reason = rejectionReasons[suggestionId] || '';
    onRejectSuggestion(suggestionId, reason);
    setExpandedSuggestion(null);
    setRejectionReasons(prev => {
      const updated = { ...prev };
      delete updated[suggestionId];
      return updated;
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 80) return 'text-blue-600 bg-blue-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getFieldDisplayName = (fieldName) => {
    const fieldNames = {
      ideaTitle: 'Título da Ideia',
      ideaDescription: 'Descrição da Ideia',
      problema: 'Problema que Resolve',
      publicoAlvo: 'Público-Alvo',
      objetivos: 'Objetivos Principais',
      metricas: 'Métricas de Sucesso',
      cronograma: 'Cronograma',
      recursos: 'Recursos Necessários',
      desafios: 'Principais Desafios',
      faseDesejada: 'Fase Desejada'
    };
    return fieldNames[fieldName] || fieldName;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Sugestões da IA</h3>
              <p className="text-purple-100 text-sm">
                {suggestions.length} sugestão{suggestions.length !== 1 ? 'ões' : ''} pendente{suggestions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {mockupStats && (
            <div className="text-right">
              <div className="text-xs text-purple-100">Completude do Formulário</div>
              <div className="text-xl font-bold">{mockupStats.completionScore}%</div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions List */}
      <div className="max-h-96 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <SuggestionItem
            key={suggestion.id}
            suggestion={suggestion}
            index={index}
            isExpanded={expandedSuggestion === suggestion.id}
            onToggleExpand={() => setExpandedSuggestion(
              expandedSuggestion === suggestion.id ? null : suggestion.id
            )}
            onApprove={() => handleApprove(suggestion.id)}
            onReject={() => handleReject(suggestion.id)}
            rejectionReason={rejectionReasons[suggestion.id] || ''}
            onRejectionReasonChange={(reason) => 
              setRejectionReasons(prev => ({ ...prev, [suggestion.id]: reason }))
            }
            getFieldDisplayName={getFieldDisplayName}
            getConfidenceColor={getConfidenceColor}
          />
        ))}
      </div>
    </motion.div>
  );
};

const SuggestionItem = ({
  suggestion,
  index,
  isExpanded,
  onToggleExpand,
  onApprove,
  onReject,
  rejectionReason,
  onRejectionReasonChange,
  getFieldDisplayName,
  getConfidenceColor
}) => {
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border-b border-gray-200 last:border-b-0"
    >
      {/* Suggestion Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-purple-600">
                {getFieldDisplayName(suggestion.field)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                {suggestion.confidence}% confiança
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{suggestion.reason}</p>
            
            {/* Quick Preview */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <div className="text-xs text-gray-500 mb-1">Prévia da mudança:</div>
              <div className="text-sm text-gray-800 line-clamp-2">
                {suggestion.suggestedValue.substring(0, 150)}
                {suggestion.suggestedValue.length > 150 && '...'}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onApprove}
                className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Aprovar</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRejectionInput(!showRejectionInput)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <ThumbsDown className="w-4 h-4" />
                <span>Rejeitar</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onToggleExpand}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                <span>Ver detalhes</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Rejection Input */}
        <AnimatePresence>
          {showRejectionInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200"
            >
              <label className="block text-sm font-medium text-red-700 mb-2">
                Motivo da rejeição (opcional):
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => onRejectionReasonChange(e.target.value)}
                placeholder="Ex: Não se adequa ao nosso contexto..."
                className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={onReject}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                >
                  Confirmar Rejeição
                </button>
                <button
                  onClick={() => setShowRejectionInput(false)}
                  className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 bg-gray-50"
          >
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-purple-500" />
                Comparação Detalhada
              </h4>
              
              {/* Current Value */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 mb-1">VALOR ATUAL:</div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                    {suggestion.currentValue || '(vazio)'}
                  </pre>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <ArrowRight className="w-5 h-5" />
                  <span className="text-xs font-medium">SUGESTÃO DA IA</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              {/* Suggested Value */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 mb-1">VALOR SUGERIDO:</div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                    {suggestion.suggestedValue}
                  </pre>
                </div>
              </div>

              {/* Analysis */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Análise da IA:</span>
                </div>
                <p className="text-sm text-gray-600">{suggestion.reason}</p>
                
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-gray-500">
                      Confiança: {suggestion.confidence}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {new Date(suggestion.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AISuggestionsPanel;
