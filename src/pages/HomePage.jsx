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

const HomePage = () => {
  const benefits = [
    {
      icon: Lightbulb,
      title: 'Intraempreendedorismo',
      description: 'Captura ideias dos 87.000 empregados da CEF, transformando-as em experimentos estruturados.',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Clock,
      title: 'IA Conversacional',
      description: 'Plataforma Transform It com IA que guia empregados a estruturar ideias automaticamente.',
      color: 'from-blue-400 to-purple-500'
    },

    {
      icon: TrendingUp,
      title: 'Flexibilização Normativa',
      description: 'Tolerância ao erro inteligente com registro de aprendizados e proteção na carreira.',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Mudança Cultural',
      description: 'Promove inovação ágil em empresa centenária, evitando "cemitério de ideias".',
      color: 'from-red-400 to-pink-500'
    }
  ];

  const phases = [
    {
      number: '01',
      title: 'Discovery',
      subtitle: 'Descoberta',
      description: 'Ideia → benchmark/pesquisa → protótipo/prova de conceito com IA conversacional Transform It.',
      duration: 'até 90 dias',
      icon: Lightbulb,
      color: 'bg-blue-500'
    },
    {
      number: '02',
      title: 'Delivery',
      subtitle: 'Entrega',
      description: 'Protótipo → MVP → testes com 1% da base de clientes (segmentação por agência/região).',
      duration: 'até 180 dias',
      icon: Rocket,
      color: 'bg-purple-500'
    },
    {
      number: '03',
      title: 'Aceleração',
      subtitle: 'Escala',
      description: 'MVP validado → escala nacional → integração ao portfólio CAIXA com sustentação.',
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

      {/* Features Overview - Redesigned */}
      <section className="section-padding bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-caixa-blue/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-caixa-orange/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container-max relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-caixa-blue to-indigo-600 rounded-2xl mb-8 shadow-xl"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Por que o Sandbox CAIXA é <span className="bg-gradient-to-r from-caixa-blue to-indigo-600 bg-clip-text text-transparent">revolucionário</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Potencializado pela tecnologia <strong>IBM Watson</strong>, transformamos a cultura de inovação 
              da Caixa Econômica Federal, empoderando 87.000 empregados a serem intraempreendedores.
            </p>
          </motion.div>

          {/* IBM Partnership Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mb-16"
          >
            <div className="bg-gradient-to-r from-blue-600/5 to-indigo-600/5 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-blue-200/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                <div className="flex-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                    className="flex items-center space-x-4 mb-6"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-200">
                      <img 
                        src={`${process.env.PUBLIC_URL}/imagens/02_8-bar-reverse.svg`}
                        alt="IBM Logo" 
                        className="w-10 h-10"
                      />
                    </div>
                  </motion.div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Tecnologia IBM Watson</h3>
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    Nossa parceria estratégica com a <strong>IBM</strong> oferece IA conversacional de ponta através da 
                    plataforma <strong>Transform It</strong>, que guia colaboradores na estruturação automática de ideias.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 rounded-xl p-4 border border-blue-100">
                      <div className="text-2xl font-bold text-blue-600">87.000</div>
                      <div className="text-sm text-gray-600">Empregados Empoderados</div>
                    </div>
                    <div className="bg-white/60 rounded-xl p-4 border border-indigo-100">
                      <div className="text-2xl font-bold text-indigo-600">24/7</div>
                      <div className="text-sm text-gray-600">Assistente IA Disponível</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-blue-200/50 shadow-xl">
                    <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
                      <span>Resultados Comprovados</span>
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Redução no tempo de estruturação</span>
                        <span className="font-bold text-green-600">75%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Qualidade das propostas</span>
                        <span className="font-bold text-blue-600">+90%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Satisfação dos usuários</span>
                        <span className="font-bold text-purple-600">96%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features Grid - Redesigned */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {benefits.slice(1).map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="group"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 relative overflow-hidden h-full shadow-md hover:shadow-lg transition-all duration-300 hover:border-gray-300/60">
                    {/* Subtle Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color}/5 opacity-0 group-hover:opacity-100 transition-all duration-300`}></div>
                    
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-xl mb-4 relative z-10 shadow-md group-hover:shadow-lg transition-all duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-lg font-bold mb-3 text-gray-900 group-hover:text-gray-800 transition-colors duration-200">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm group-hover:text-gray-700 transition-colors duration-200">{benefit.description}</p>
                    
                    {/* Subtle Bottom Border */}
                    <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${benefit.color} opacity-0 group-hover:opacity-20 transition-all duration-300`}></div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-caixa-blue/10 to-indigo-600/10 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-blue-200/50">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Revolucione a Inovação na CAIXA
              </h3>
              <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
                Junte-se à transformação que está mudando o futuro da Caixa Econômica Federal com 
                tecnologia IBM Watson e metodologia ágil de experimentação
              </p>
              <Link
                to="/demo"
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-caixa-blue to-indigo-600 text-white text-lg font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:from-caixa-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
              >
                <span>Começar Agora</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
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
              Como funciona o processo do Sandbox?
            </h2>
            <p className="text-responsive-lg text-gray-600 max-w-3xl mx-auto">
              Um fluxo estruturado em três fases que transforma ideias em experimentos, 
              valida com clientes reais e escala para o portfólio nacional da CAIXA.
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
              Pronto para ser intraempreendedor?
            </h2>
            <p className="text-responsive-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Transforme sua ideia em experimento. Participe do Sandbox CAIXA 
              e ajude a revolucionar a inovação na Caixa Econômica Federal.
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
