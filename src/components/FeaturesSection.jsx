import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Users, 
  Target, 
  Clock, 
  TrendingUp,
  ChevronRight,
  CheckCircle,
  Rocket
} from 'lucide-react';

const FeaturesSection = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Shield,
      title: 'Ambiente Seguro',
      subtitle: 'Experimente sem Riscos',
      description: 'Teste suas ideias em um ambiente controlado com limites de perda bem definidos e governança robusta.',
      benefits: [
        'Limites de perda por fase claramente definidos',
        'Governança estruturada e acompanhamento contínuo',
        'Flexibilização normativa com autorização',
        'Segurança jurídica e institucional'
      ],
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      image: '/api/placeholder/400/300'
    },
    {
      icon: Zap,
      title: 'Agilidade Extrema',
      subtitle: 'Resultados em Tempo Recorde',
      description: 'Ciclos rápidos de desenvolvimento com menos burocracia e processos otimizados para máxima eficiência.',
      benefits: [
        'Aprovação em até 48 horas',
        'Processos simplificados para MVPs',
        'Rotinas ágeis e flexíveis',
        'Feedback contínuo e iteração rápida'
      ],
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      image: '/api/placeholder/400/300'
    },
    {
      icon: Users,
      title: 'Colaboração Inteligente',
      subtitle: 'Conecte-se com Especialistas',
      description: 'Trabalhe com diferentes áreas e especialistas para potencializar sua ideia através da colaboração.',
      benefits: [
        'Rede de especialistas da CAIXA',
        'Colaboração entre diferentes unidades',
        'Compartilhamento de conhecimento',
        'Mentoria e suporte técnico'
      ],
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
      image: '/api/placeholder/400/300'
    },
    {
      icon: Target,
      title: 'Foco no Resultado',
      subtitle: 'Orientado por Dados',
      description: 'Toda experimentação é orientada por métricas claras e foco na geração de valor real para clientes.',
      benefits: [
        'KPIs claros e mensuráveis',
        'Validação com clientes reais',
        'Análise de impacto detalhada',
        'ROI transparente'
      ],
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      image: '/api/placeholder/400/300'
    }
  ];

  return (
    <section className="section-padding bg-gray-50 relative overflow-hidden">
      <div className="container-max">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-responsive-3xl font-bold gradient-text mb-4">
            Recursos Revolucionários
          </h2>
          <p className="text-responsive-lg text-gray-600 max-w-3xl mx-auto">
            Descubra as funcionalidades que fazem do Sandbox CAIXA a plataforma 
            mais avançada para experimentação e inovação.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Features List */}
          <div className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;
              
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => setActiveFeature(index)}
                  className={`cursor-pointer transition-all duration-300 ${
                    isActive ? 'scale-102' : 'hover:scale-101'
                  }`}
                >
                  <div className={`card p-6 relative overflow-hidden border-2 transition-all duration-300 ${
                    isActive 
                      ? `border-gray-300 ${feature.bgColor}` 
                      : 'border-transparent hover:border-gray-200'
                  }`}>
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 ${
                      isActive ? 'opacity-5' : 'group-hover:opacity-3'
                    } transition-opacity duration-300`}></div>
                    
                    <div className="relative z-10 flex items-start space-x-4">
                      {/* Icon */}
                      <motion.div
                        whileHover={{ rotate: 5 }}
                        className={`flex-shrink-0 w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {feature.title}
                          </h3>
                          <motion.div
                            animate={{ 
                              rotate: isActive ? 90 : 0,
                              scale: isActive ? 1.1 : 1
                            }}
                            className={`w-6 h-6 ${
                              isActive ? 'text-gray-700' : 'text-gray-400'
                            }`}
                          >
                            <ChevronRight className="w-full h-full" />
                          </motion.div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{feature.subtitle}</p>
                        <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color}`}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Feature Details */}
          <div className="lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Feature Image/Illustration */}
                <div className="relative">
                  <div className={`w-full h-64 bg-gradient-to-br ${features[activeFeature].color} rounded-2xl flex items-center justify-center overflow-hidden`}>
                    {/* Placeholder for feature illustration */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 1, -1, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center"
                    >
                      {React.createElement(features[activeFeature].icon, {
                        className: "w-16 h-16 text-white"
                      })}
                    </motion.div>
                    
                    {/* Floating Elements */}
                    <div className="absolute inset-0">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            y: [0, -10, 0],
                            opacity: [0.3, 1, 0.3],
                          }}
                          transition={{
                            duration: 3,
                            delay: i * 0.5,
                            repeat: Infinity,
                          }}
                          className="absolute w-2 h-2 bg-white rounded-full"
                          style={{
                            left: `${20 + i * 15}%`,
                            top: `${30 + (i % 2) * 40}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Rocket className="w-5 h-5 mr-2 text-caixa-blue" />
                    Principais Benefícios
                  </h4>
                  <div className="space-y-3">
                    {features[activeFeature].benefits.map((benefit, index) => (
                      <motion.div
                        key={benefit}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full btn bg-gradient-to-r ${features[activeFeature].color} text-white hover:shadow-lg`}
                >
                  Explorar {features[activeFeature].title}
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

