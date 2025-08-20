import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Quote, 
  ChevronLeft, 
  ChevronRight, 
  Star,
  User,
  Building,
  ArrowRight
} from 'lucide-react';

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Maria Silva',
      role: 'Gerente de Produto Digital',
      department: 'GIGID - Gerência de Soluções Digitais',
      avatar: '/api/placeholder/80/80',
      rating: 5,
      quote: 'O Sandbox CAIXA revolucionou a forma como desenvolvemos soluções. Em apenas 3 meses, validamos nossa ideia de chatbot inteligente que hoje atende milhares de clientes diariamente.',
      project: 'Assistente Virtual Inteligente',
      phase: 'Scale',
      results: [
        '50% redução no tempo de atendimento',
        '95% satisfação dos usuários',
        '2M+ interações mensais'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      name: 'João Santos',
      role: 'Analista Sênior de Inovação',
      department: 'GEINA - Gerência Nacional de Inovação',
      avatar: '/api/placeholder/80/80',
      rating: 5,
      quote: 'A plataforma oferece o ambiente perfeito para testar hipóteses arriscadas sem comprometer a operação. Nosso projeto de blockchain para certificados digitais foi um sucesso total.',
      project: 'Certificação Digital Blockchain',
      phase: 'Delivery',
      results: [
        '100% segurança nas transações',
        '80% redução em fraudes',
        'Prêmio de Inovação 2024'
      ],
      color: 'from-green-500 to-green-600'
    },
    {
      id: 3,
      name: 'Ana Costa',
      role: 'Coordenadora de UX',
      department: 'GICLI - Gerência de Experiência do Cliente',
      avatar: '/api/placeholder/80/80',
      rating: 5,
      quote: 'O suporte da GEINA e a metodologia estruturada do Sandbox nos permitiram criar uma solução de onboarding digital que superou todas as expectativas dos nossos clientes.',
      project: 'Onboarding Digital Personalizado',
      phase: 'Scale',
      results: [
        '90% conclusão do processo',
        '60% redução no tempo',
        'NPS 85 (Excelente)'
      ],
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 4,
      name: 'Carlos Oliveira',
      role: 'Especialista em Data Science',
      department: 'GITED - Gerência de Inteligência de Dados',
      avatar: '/api/placeholder/80/80',
      rating: 5,
      quote: 'Conseguimos implementar algoritmos de ML para detecção de fraudes que antes pareciam impossíveis. O ambiente seguro do Sandbox foi fundamental para os testes.',
      project: 'IA Anti-fraude Avançada',
      phase: 'Delivery',
      results: [
        '99.8% precisão na detecção',
        'R$ 50M em perdas evitadas',
        '300% ROI em 6 meses'
      ],
      color: 'from-orange-500 to-orange-600'
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentData = testimonials[currentTestimonial];

  return (
    <section className="section-padding bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-caixa-blue rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-caixa-orange rounded-full blur-3xl"></div>
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
            Histórias de Sucesso
          </h2>
          <p className="text-responsive-lg text-gray-600 max-w-3xl mx-auto">
            Descubra como profissionais da CAIXA estão transformando ideias em 
            soluções reais que impactam milhões de clientes.
          </p>
        </motion.div>

        {/* Main Testimonial */}
        <div className="relative max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {/* Testimonial Content */}
              <div className="order-2 lg:order-1">
                <div className="bg-white rounded-2xl shadow-xl p-8 relative">
                  {/* Quote Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r ${currentData.color} rounded-full flex items-center justify-center shadow-lg`}
                  >
                    <Quote className="w-6 h-6 text-white" />
                  </motion.div>

                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(currentData.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                      >
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Quote Text */}
                  <motion.blockquote
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg text-gray-700 leading-relaxed mb-6 italic"
                  >
                    "{currentData.quote}"
                  </motion.blockquote>

                  {/* Author Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center space-x-4 mb-6"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{currentData.name}</h4>
                      <p className="text-sm text-gray-600">{currentData.role}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Building className="w-3 h-3 mr-1" />
                        {currentData.department}
                      </p>
                    </div>
                  </motion.div>

                  {/* Project Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="inline-flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full"
                  >
                    <div className={`w-2 h-2 bg-gradient-to-r ${currentData.color} rounded-full`}></div>
                    <span className="text-sm font-medium text-gray-700">{currentData.project}</span>
                    <span className={`text-xs px-2 py-1 bg-gradient-to-r ${currentData.color} text-white rounded-full`}>
                      {currentData.phase}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Results Panel */}
              <div className="order-1 lg:order-2">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`bg-gradient-to-br ${currentData.color} rounded-2xl p-8 text-white shadow-xl`}
                >
                  <h3 className="text-2xl font-bold mb-6">Resultados Alcançados</h3>
                  
                  <div className="space-y-4">
                    {currentData.results.map((result, index) => (
                      <motion.div
                        key={result}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                        <span className="text-white/90">{result}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full opacity-50"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 bg-white/10 rounded-full opacity-30"></div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center space-x-4 mt-12">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevTestimonial}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-caixa-blue transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            {/* Dots Indicator */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-caixa-blue w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextTestimonial}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-caixa-blue transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
        >
          {[
            { label: 'Projetos Concluídos', value: '150+', icon: '🚀' },
            { label: 'Taxa de Sucesso', value: '92%', icon: '⭐' },
            { label: 'Satisfação Média', value: '4.8/5', icon: '😊' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
