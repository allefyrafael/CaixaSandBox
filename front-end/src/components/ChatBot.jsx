import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Lightbulb,
  Sparkles,
  Brain,
  Minimize2,
  Maximize2
} from 'lucide-react';

const ChatBot = ({ onFormFieldUpdate, formData, isMinimized, onToggleMinimize }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Olá! Sou o assistente do Sandbox CAIXA. Estou aqui para ajudar você a estruturar sua ideia inovadora. Como posso te ajudar hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateBotResponse = async (userMessage) => {
    setIsTyping(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    let botResponse = '';
    let fieldUpdate = null;
    
    // Simple keyword-based responses with form field suggestions
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('ideia') || lowerMessage.includes('inovação') || lowerMessage.includes('solução')) {
      botResponse = 'Ótimo! Me conte mais sobre sua ideia. Que problema específico ela resolve? Isso me ajudará a preencher automaticamente alguns campos do formulário para você.';
    } else if (lowerMessage.includes('problema') || lowerMessage.includes('dor') || lowerMessage.includes('necessidade')) {
      botResponse = 'Entendi o problema que você identificou. Vou sugerir uma descrição para o campo "Problema Identificado" no formulário. Você pode ajustar conforme necessário.';
      fieldUpdate = { field: 'problema', value: userMessage };
    } else if (lowerMessage.includes('cliente') || lowerMessage.includes('usuário') || lowerMessage.includes('beneficiado')) {
      botResponse = 'Perfeito! Identificar o público-alvo é fundamental. Vou preencher as informações sobre os clientes beneficiados no formulário.';
      fieldUpdate = { field: 'publicoAlvo', value: userMessage };
    } else if (lowerMessage.includes('tempo') || lowerMessage.includes('prazo') || lowerMessage.includes('cronograma')) {
      botResponse = 'Entendo sobre o cronograma. O Sandbox CAIXA tem fases bem definidas: Discovery (90 dias), Delivery (180 dias) e Aceleração (360 dias). Vou atualizar o cronograma no formulário.';
      fieldUpdate = { field: 'cronograma', value: userMessage };
    } else if (lowerMessage.includes('objetivo') || lowerMessage.includes('meta') || lowerMessage.includes('resultado')) {
      botResponse = 'Excelente! Objetivos claros são essenciais para o sucesso no Sandbox. Vou registrar seus objetivos no formulário para você.';
      fieldUpdate = { field: 'objetivos', value: userMessage };
    } else if (lowerMessage.includes('ajuda') || lowerMessage.includes('como') || lowerMessage.includes('começar')) {
      botResponse = 'Posso te ajudar de várias formas! Você pode me contar sobre sua ideia e eu preencherei automaticamente os campos do formulário, ou você pode preencher o formulário manualmente e eu darei sugestões em tempo real. Qual preferência?';
    } else {
      botResponse = 'Interessante! Baseado no que você disse, posso sugerir algumas melhorias para sua proposta no Sandbox CAIXA. Continue me contando mais detalhes e vou te ajudar a estruturar sua ideia nos campos corretos.';
    }

    const botMessage = {
      id: Date.now(),
      type: 'bot',
      content: botResponse,
      timestamp: new Date(),
      fieldUpdate
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);

    // Update form field if suggested
    if (fieldUpdate && onFormFieldUpdate) {
      onFormFieldUpdate(fieldUpdate.field, fieldUpdate.value);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now() - 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response
    await simulateBotResponse(inputValue);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickSuggestions = [
    'Como estruturar minha ideia?',
    'Qual o processo do Sandbox?',
    'Preciso de ajuda com objetivos',
    'Como definir cronograma?'
  ];

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="p-4 relative"
      >
        {/* Futuristic Gradient Arc */}
        <motion.div
          animate={{ 
            rotate: 360
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute inset-2 w-16 h-16 pointer-events-none"
        >
          <svg 
            width="64" 
            height="64" 
            viewBox="0 0 64 64" 
            className="absolute inset-0"
          >
            <defs>
              <linearGradient id="futuristicGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0B5CFF" stopOpacity="0" />
                <stop offset="20%" stopColor="#0B5CFF" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#FF6B35" stopOpacity="1" />
                <stop offset="80%" stopColor="#10B981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="url(#futuristicGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="64 159"
              filter="url(#glow)"
              style={{
                transformOrigin: '32px 32px'
              }}
            />
          </svg>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleMinimize}
          className="relative z-10 w-12 h-12 bg-gradient-to-r from-caixa-blue to-caixa-blue-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          {messages.length > 1 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-caixa-orange to-caixa-orange-dark rounded-full flex items-center justify-center border-2 border-white">
              <span className="text-white text-xs font-bold">{messages.length - 1}</span>
            </div>
          )}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="h-full bg-white border border-gray-200 flex flex-col overflow-hidden rounded-t-lg md:rounded-2xl shadow-xl md:shadow-2xl md:m-4"
    >
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-caixa-blue to-caixa-blue-700 p-3 md:p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white text-sm md:text-base truncate">Assistente Sandbox</h3>
            <p className="text-blue-100 text-xs md:text-sm truncate">Powered by IBM Watson</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleMinimize}
          className="p-1.5 md:p-2 hover:bg-white/20 rounded-lg transition-colors shrink-0"
        >
          <Minimize2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </motion.button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3 md:space-y-4 bg-gray-50">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-1.5 md:space-x-2 max-w-[85%] md:max-w-[80%] ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-caixa-blue text-white' 
                    : 'bg-caixa-orange text-white'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-3 h-3 md:w-4 md:h-4" />
                  ) : (
                    <Brain className="w-3 h-3 md:w-4 md:h-4" />
                  )}
                </div>
                <div className={`rounded-2xl p-2.5 md:p-3 ${
                  message.type === 'user'
                    ? 'bg-caixa-blue text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border'
                }`}>
                  <p className="text-xs md:text-sm leading-relaxed break-words">{message.content}</p>
                  {message.fieldUpdate && (
                    <div className="mt-2 p-2 bg-caixa-blue/10 rounded-lg">
                      <p className="text-xs text-caixa-blue font-medium">
                        ✨ Campo "{message.fieldUpdate.field}" atualizado no formulário
                      </p>
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-caixa-orange rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm p-3 shadow-sm border">
                <div className="flex space-x-1">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="p-2 md:p-4 bg-white border-t shrink-0">
        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-3">
          {quickSuggestions.map((suggestion, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInputValue(suggestion)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 md:px-3 py-1 rounded-full transition-colors whitespace-nowrap"
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-2 md:p-4 bg-white border-t shrink-0">
        <div className="flex items-end space-x-2">
          <div className="flex-1 min-w-0">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="w-full resize-none border border-gray-300 rounded-xl px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-caixa-blue focus:border-transparent text-sm"
              rows="2"
              disabled={isTyping}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="p-2.5 md:p-3 bg-gradient-to-r from-caixa-blue to-caixa-blue-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBot;
