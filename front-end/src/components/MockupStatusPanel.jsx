/**
 * Painel de Status do Mockup
 * Mostra estatísticas e progresso do formulário com IA
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Brain,
  Zap,
  Target,
  BarChart3,
  Sparkles
} from 'lucide-react';

const MockupStatusPanel = ({ 
  mockupStats, 
  mockupData = {}, 
  isProcessing = false,
  className = '' 
}) => {
  if (!mockupStats) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-center h-32 text-gray-400">
          <div className="text-center">
            <Brain className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Inicializando IA...</p>
          </div>
        </div>
      </div>
    );
  }

  const completionPercentage = mockupStats.completionScore || 0;
  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-blue-600 bg-blue-100';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const stats = [
    {
      icon: FileText,
      label: 'Campos Preenchidos',
      value: mockupStats.fieldsCompleted || 0,
      total: 10,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: Brain,
      label: 'Interações com IA',
      value: mockupStats.aiInteractions || 0,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: CheckCircle,
      label: 'Sugestões Aprovadas',
      value: mockupStats.approvedSuggestions || 0,
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: Clock,
      label: 'Sugestões Pendentes',
      value: mockupStats.pendingSuggestions || 0,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Status do Mockup</h3>
              <p className="text-xs text-gray-500">
                Versão {mockupStats.version} • Atualizado {new Date(mockupStats.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          {isProcessing && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Processando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Completion Progress */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Completude do Formulário</span>
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getCompletionColor(completionPercentage)}`}>
            {completionPercentage}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-3 rounded-full bg-gradient-to-r ${
              completionPercentage >= 80 
                ? 'from-green-500 to-green-600' 
                : completionPercentage >= 60 
                ? 'from-blue-500 to-blue-600'
                : completionPercentage >= 40
                ? 'from-yellow-500 to-yellow-600'
                : 'from-red-500 to-red-600'
            }`}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>Início</span>
          <span>Completo</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-3"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{stat.label}</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {stat.value}
                  {stat.total && <span className="text-sm text-gray-500">/{stat.total}</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {mockupStats.totalChanges > 0 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Atividade Recente</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Total de mudanças</span>
              <span className="font-medium text-gray-900">{mockupStats.totalChanges}</span>
            </div>
            
            {mockupStats.approvedSuggestions > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Sugestões aprovadas</span>
                <span className="font-medium text-green-600">{mockupStats.approvedSuggestions}</span>
              </div>
            )}
            
            {mockupStats.rejectedSuggestions > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Sugestões rejeitadas</span>
                <span className="font-medium text-red-600">{mockupStats.rejectedSuggestions}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Sparkles className="w-3 h-3" />
          <span>
            {completionPercentage < 50 
              ? 'Continue preenchendo para mais sugestões da IA'
              : completionPercentage < 80
              ? 'Você está indo bem! A IA pode ajudar a melhorar'
              : 'Excelente! Seu formulário está quase completo'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default MockupStatusPanel;
