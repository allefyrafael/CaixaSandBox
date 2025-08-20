import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Rocket, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Users, 
  Shield, 
  Clock, 
  ArrowRight,
  Sparkles,
  Globe,
  Zap
} from 'lucide-react';
import HeroSection from '../components/HeroSection';
import StatsSection from '../components/StatsSection';
// import FeaturesSection from '../components/FeaturesSection';
// import ProcessSection from '../components/ProcessSection';
// import TestimonialsSection from '../components/TestimonialsSection';

const HomePage = () => {
  const benefits = [
    {
      icon: Lightbulb,
      title: 'Experimentação Segura',
      description: 'Teste suas ideias em um ambiente controlado, com limites de risco bem definidos.',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Clock,
      title: 'Agilidade',
      description: 'Ciclos rápidos de desenvolvimento com menos burocracia e mais resultados.',
      color: 'from-blue-400 to-purple-500'
    },
    {
      icon: Target,
      title: 'Foco no Cliente',
      description: 'Toda experimentação é orientada pela experiência do usuário e pela geração de valor.',
      color: 'from-green-400 to-teal-500'
    },
    {
      icon: TrendingUp,
      title: 'Escalabilidade',
      description: 'Soluções validadas podem ser integradas ao portfólio institucional da CAIXA.',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: Users,
      title: 'Colaboração',
      description: 'Trabalhe com diferentes áreas e especialistas para potencializar sua ideia.',
      color: 'from-indigo-400 to-blue-500'
    },
    {
      icon: Shield,
      title: 'Governança Robusta',
      description: 'Cada experimento tem responsáveis claros e acompanhamento estruturado.',
      color: 'from-red-400 to-pink-500'
    }
  ];

  const phases = [
    {
      number: '01',
      title: 'Discovery',
      subtitle: 'Descoberta',
      description: 'Estruturar e validar hipóteses iniciais com base em pesquisa, diagnóstico e prototipação.',
      duration: 'até 90 dias',
      icon: Lightbulb,
      color: 'bg-blue-500'
    },
    {
      number: '02',
      title: 'Delivery',
      subtitle: 'Entrega',
      description: 'Construir e validar MVP com clientes reais, com apoio da GEINA.',
      duration: 'até 180 dias',
      icon: Rocket,
      color: 'bg-purple-500'
    },
    {
      number: '03',
      title: 'Scale',
      subtitle: 'Escala',
      description: 'Escalar a solução, integrando-a ao portfólio da CAIXA com sustentação e governança.',
      duration: 'até 360 dias',
      icon: Globe,
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Features Overview */}
      <section className="section-padding bg-white relative">
        <div className="container-max">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-caixa-blue to-caixa-blue-700 rounded-full mb-6"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-responsive-3xl font-bold gradient-text mb-4">
              Por que escolher o Sandbox CAIXA?
            </h2>
            <p className="text-responsive-lg text-gray-600 max-w-3xl mx-auto">
              Uma plataforma revolucionária que oferece o ambiente perfeito para transformar 
              suas ideias em soluções reais e impactantes.
            </p>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group"
                >
                  <div className="card p-8 h-full relative overflow-hidden">
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                    
                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${benefit.color} rounded-xl mb-6 relative z-10`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                    
                    {/* Hover Effect */}
                    <motion.div
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                      className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${benefit.color} transition-all duration-300`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="container-max">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-responsive-3xl font-bold gradient-text mb-4">
              Como funciona o processo?
            </h2>
            <p className="text-responsive-lg text-gray-600 max-w-3xl mx-auto">
              Um fluxo estruturado em três fases que garante o máximo de aprendizado 
              e a melhor chance de sucesso para sua ideia.
            </p>
          </motion.div>

          {/* Process Steps */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 transform -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
              {phases.map((phase, index) => {
                const Icon = phase.icon;
                return (
                  <motion.div
                    key={phase.number}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className="relative"
                  >
                    <div className="card p-8 text-center relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className={`w-full h-full ${phase.color.replace('bg-', 'bg-gradient-to-br from-')} to-transparent`}></div>
                      </div>
                      
                      {/* Phase Number */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="relative mx-auto mb-6"
                      >
                        <div className={`w-20 h-20 ${phase.color} rounded-full flex items-center justify-center shadow-lg relative z-10`}>
                          <span className="text-2xl font-bold text-white">{phase.number}</span>
                        </div>
                        <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                      </motion.div>
                      
                      {/* Icon */}
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="mb-6"
                      >
                        <Icon className="w-12 h-12 mx-auto text-gray-700" />
                      </motion.div>
                      
                      {/* Content */}
                      <h3 className="text-2xl font-bold mb-2">{phase.title}</h3>
                      <p className="text-lg text-gray-600 mb-4">{phase.subtitle}</p>
                      <p className="text-gray-600 mb-6 leading-relaxed">{phase.description}</p>
                      
                      {/* Duration Badge */}
                      <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{phase.duration}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-caixa-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-caixa-orange/5 rounded-full blur-3xl"></div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-caixa-blue to-caixa-blue-light relative overflow-hidden">
        <div className="container-max text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-8"
            >
              <Zap className="w-10 h-10 text-white" />
            </motion.div>
            
            <h2 className="text-responsive-3xl font-bold text-white mb-6">
              Pronto para revolucionar?
            </h2>
            <p className="text-responsive-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Transforme sua ideia em realidade. Comece seu experimento no Sandbox CAIXA 
              e faça parte da revolução da inovação.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/formulario"
                  className="btn bg-white text-caixa-blue hover:bg-gray-100 group px-8 py-4"
                >
                  <span className="text-lg font-semibold">Iniciar Experimento</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-caixa-blue px-8 py-4">
                  <span className="text-lg font-semibold">Saiba Mais</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping opacity-60"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full animate-ping opacity-40" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-50" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
