import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  Zap,
  Award
} from 'lucide-react';

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    {
      icon: TrendingUp,
      value: 150,
      suffix: '+',
      label: 'Experimentos Realizados',
      description: 'Projetos inovadores testados com sucesso',
      color: 'from-caixa-blue to-caixa-blue-700',
      bgColor: 'bg-caixa-blue-50',
      textColor: 'text-caixa-blue'
    },
    {
      icon: Users,
      value: 500,
      suffix: '+',
      label: 'Colaboradores Engajados',
      description: 'Profissionais ativos na plataforma',
      color: 'from-caixa-green to-caixa-green-dark',
      bgColor: 'bg-green-50',
      textColor: 'text-caixa-green'
    },
    {
      icon: Clock,
      value: 48,
      suffix: 'h',
      label: 'Tempo Médio de Aprovação',
      description: 'Agilidade no processo de validação',
      color: 'from-caixa-orange to-caixa-orange-dark',
      bgColor: 'bg-caixa-orange-50',
      textColor: 'text-caixa-orange'
    },
    {
      icon: Target,
      value: 92,
      suffix: '%',
      label: 'Taxa de Satisfação',
      description: 'Aprovação dos usuários da plataforma',
      color: 'from-caixa-blue-light to-caixa-blue',
      bgColor: 'bg-caixa-blue-100',
      textColor: 'text-caixa-blue-light'
    },
    {
      icon: Zap,
      value: 85,
      suffix: '%',
      label: 'Eficiência de Implementação',
      description: 'Projetos que chegaram à fase Scale',
      color: 'from-caixa-orange-light to-caixa-orange',
      bgColor: 'bg-caixa-orange-100',
      textColor: 'text-caixa-orange-light'
    },
    {
      icon: Award,
      value: 25,
      suffix: '+',
      label: 'Soluções Escaladas',
      description: 'Inovações integradas ao portfólio CAIXA',
      color: 'from-caixa-green-light to-caixa-green',
      bgColor: 'bg-green-100',
      textColor: 'text-caixa-green-light'
    }
  ];

  // Componente para contador animado
  const AnimatedCounter = ({ value, suffix, isInView }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      if (!isInView) return;
      
      let startTime;
      let animationFrame;
      
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / 2000, 1);
        
        setCount(Math.floor(progress * value));
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };
      
      animationFrame = requestAnimationFrame(animate);
      
      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, [value, isInView]);
    
    return <span>{count}{suffix}</span>;
  };

  return (
    <section ref={ref} className="section-padding bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-caixa-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-caixa-orange/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container-max relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-responsive-3xl font-bold gradient-text mb-4">
            Números que Inspiram
          </h2>
          <p className="text-responsive-lg text-gray-600 max-w-3xl mx-auto">
            Resultados concretos que demonstram o impacto transformador do Sandbox CAIXA 
            na cultura de inovação da organização.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  y: -5,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="group relative"
              >
                <div className={`card p-8 text-center relative overflow-hidden ${stat.bgColor} border-2 border-transparent group-hover:border-gray-200 transition-all duration-300`}>
                  {/* Background Gradient Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${stat.color} rounded-xl mb-6 shadow-lg relative z-10`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  {/* Animated Number */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    className="mb-4"
                  >
                    <div className={`text-4xl font-bold ${stat.textColor} mb-2`}>
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} isInView={isInView} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {stat.label}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {stat.description}
                    </p>
                  </motion.div>
                  
                  {/* Hover Line Effect */}
                  <motion.div
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.color}`}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Floating Particles */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          y: [0, -20, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.5,
                          repeat: Infinity,
                        }}
                        className={`absolute w-2 h-2 bg-gradient-to-r ${stat.color} rounded-full`}
                        style={{
                          left: `${20 + i * 30}%`,
                          top: '80%',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-caixa-blue/5 to-caixa-blue-light/5 rounded-2xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Faça Parte Dessa Transformação
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Junte-se aos profissionais que já estão revolucionando a CAIXA 
              através da inovação estruturada e colaborativa.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary"
            >
              Começar Agora
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
