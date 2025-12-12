import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  Zap,
  Award,
  Rocket
} from 'lucide-react';

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px -100px 0px" });

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
    <section ref={ref} className="section-padding bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-caixa-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-caixa-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-caixa-green/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container-max relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-caixa-blue to-caixa-blue-700 rounded-full mb-8"
          >
            <TrendingUp className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-responsive-4xl font-bold gradient-text mb-6">
            A Revolução da Inovação em Números
          </h2>
          <p className="text-responsive-lg text-gray-600 max-w-3xl mx-auto">
            Veja como 4.000 empregados revolucionaram uma empresa centenária.
          </p>
        </motion.div>

        {/* Hero Stat - Main Impact */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-r from-caixa-blue to-caixa-blue-light rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-8"
              >
                <Users className="w-12 h-12 text-white" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                <div className="text-6xl md:text-7xl font-bold mb-4">
                  <AnimatedCounter value={4000} suffix="+" isInView={isInView} />
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">Empregados Revolucionários</h3>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                  De 12+ vice-presidências, transformando ideias em experimentos estruturados
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Three Column Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Experimentos */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative group h-full"
          >
            <div className="card p-8 text-center bg-white border-2 border-transparent group-hover:border-caixa-blue/20 transition-all duration-300 hover:shadow-2xl h-full flex flex-col justify-between min-h-[280px]">
              <div className="flex flex-col items-center">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-caixa-blue to-caixa-blue-700 rounded-xl mb-6 shadow-lg"
                >
                  <Rocket className="w-8 h-8 text-white" />
                </motion.div>
                
                <div className="text-4xl font-bold text-caixa-blue mb-3">
                  <AnimatedCounter value={73} suffix="+" isInView={isInView} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Experimentos Cadastrados</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mt-auto">
                Projetos inovadores que passaram pelo primeiro edital do Sandbox
              </p>
            </div>
          </motion.div>

          {/* Tempo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="relative group h-full"
          >
            <div className="card p-8 text-center bg-white border-2 border-transparent group-hover:border-caixa-orange/20 transition-all duration-300 hover:shadow-2xl h-full flex flex-col justify-between min-h-[280px]">
              <div className="flex flex-col items-center">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-caixa-orange to-caixa-orange-dark rounded-xl mb-6 shadow-lg"
                >
                  <Clock className="w-8 h-8 text-white" />
                </motion.div>
                
                <div className="text-4xl font-bold text-caixa-orange mb-3">
                  <AnimatedCounter value={48} suffix="h" isInView={isInView} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Aprovação Rápida</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mt-auto">
                Tempo médio de aprovação com IA otimizada
              </p>
            </div>
          </motion.div>

          {/* Satisfação */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="relative group h-full"
          >
            <div className="card p-8 text-center bg-white border-2 border-transparent group-hover:border-caixa-green/20 transition-all duration-300 hover:shadow-2xl h-full flex flex-col justify-between min-h-[280px] md:col-span-2 lg:col-span-1">
              <div className="flex flex-col items-center">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-caixa-green to-caixa-green-dark rounded-xl mb-6 shadow-lg"
                >
                  <Target className="w-8 h-8 text-white" />
                </motion.div>
                
                <div className="text-4xl font-bold text-caixa-green mb-3">
                  <AnimatedCounter value={92} suffix="%" isInView={isInView} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Taxa de Satisfação</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mt-auto">
                Aprovação dos usuários da plataforma
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Impact Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Eficiência */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  <AnimatedCounter value={85} suffix="%" isInView={isInView} />
                </div>
                <div className="text-lg font-semibold text-gray-900">Eficiência de Implementação</div>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Projetos que chegaram à fase Scale e foram integrados ao portfólio CAIXA
            </p>
          </div>

          {/* Soluções */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">
                  <AnimatedCounter value={25} suffix="+" isInView={isInView} />
                </div>
                <div className="text-lg font-semibold text-gray-900">Soluções Escaladas</div>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Inovações integradas ao portfólio institucional da CAIXA
            </p>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-caixa-blue/10 to-caixa-blue-light/10 rounded-3xl p-12 border-2 border-caixa-blue/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Faça Parte da Revolução da Inovação
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Junte-se aos 4.000 empregados que já estão transformando a Caixa Econômica Federal 
                através do intraempreendedorismo e experimentação estruturada.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary text-lg px-8 py-4"
              >
                Começar Agora
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
