import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Rocket, 
  TrendingUp, 
  Clock, 
  Users, 
  Target,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const ProcessSection = () => {
  const phases = [
    {
      id: 'discovery',
      number: '01',
      title: 'Discovery',
      subtitle: 'Descoberta & Validação',
      description: 'Estruture e valide suas hipóteses iniciais com base em pesquisa, diagnóstico e prototipação.',
      duration: 'até 90 dias',
      icon: Search,
      color: 'from-caixa-blue to-caixa-blue-700',
      bgColor: 'bg-caixa-blue-50',
      activities: [
        'Pesquisa e diagnóstico do problema',
        'Ideação e benchmarking',
        'Estruturação do experimento',
        'Execução de protótipo ou POC',
        'Coleta de feedback inicial'
      ],
      deliverables: [
        'Formulário de Proposta (MO15185)',
        'Relatório de Evolução (MO15183)',
        'Análise de impactos e riscos',
        'Classificação do horizonte de inovação'
      ]
    },
    {
      id: 'delivery',
      number: '02',
      title: 'Delivery',
      subtitle: 'Construção & Teste',
      description: 'Construa e valide um MVP com clientes reais, ampliando a escala do experimento.',
      duration: 'até 180 dias',
      icon: Rocket,
      color: 'from-caixa-orange to-caixa-orange-dark',
      bgColor: 'bg-caixa-orange-50',
      activities: [
        'Especificação da solução',
        'Construção e lançamento do MVP',
        'Estabelecimento de parcerias',
        'Testes com clientes reais',
        'Coleta e análise de resultados'
      ],
      deliverables: [
        'MVP ou POC funcional',
        'Relatório de resultados',
        'Plano de continuidade',
        'Evidências de validação'
      ]
    },
    {
      id: 'scale',
      number: '03',
      title: 'Scale',
      subtitle: 'Escala & Integração',
      description: 'Escale a solução validada para o portfólio da CAIXA, com integração plena e sustentação.',
      duration: 'até 360 dias',
      icon: TrendingUp,
      color: 'from-caixa-green to-caixa-green-dark',
      bgColor: 'bg-green-50',
      activities: [
        'Encerramento formal do experimento',
        'Definição da estratégia Go-to-Market',
        'Integração aos sistemas CAIXA',
        'Planejamento de sustentação'
      ],
      deliverables: [
        'Estratégia de lançamento',
        'Plano de sustentação',
        'Informe ao Comitê',
        'Solução integrada'
      ]
    }
  ];

  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23667eea' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
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
            Fluxo de Experimentação
          </h2>
          <p className="text-responsive-lg text-gray-600 max-w-3xl mx-auto">
            Um processo estruturado em três fases que maximiza o aprendizado 
            e garante a melhor chance de sucesso para sua inovação.
          </p>
        </motion.div>

        {/* Process Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-caixa-blue-200 via-caixa-orange-200 to-caixa-green-light transform -translate-y-1/2 z-0"></div>
          
          {/* Connection Arrows */}
          <div className="hidden lg:block absolute top-1/2 left-1/3 transform -translate-y-1/2 z-10">
            <ArrowRight className="w-8 h-8 text-caixa-orange" />
          </div>
          <div className="hidden lg:block absolute top-1/2 left-2/3 transform -translate-y-1/2 z-10">
            <ArrowRight className="w-8 h-8 text-caixa-green" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-20">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              
              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative group"
                >
                  {/* Phase Card */}
                  <div className={`card p-8 relative overflow-hidden group-hover:shadow-2xl transition-all duration-500 ${phase.bgColor} border-2 border-transparent group-hover:border-gray-200`}>
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${phase.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                    
                    {/* Phase Number & Icon */}
                    <div className="relative z-10 text-center mb-6">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="relative inline-block"
                      >
                        <div className={`w-20 h-20 bg-gradient-to-br ${phase.color} rounded-full flex items-center justify-center shadow-lg mb-4 mx-auto relative z-10`}>
                          <span className="text-2xl font-bold text-white">{phase.number}</span>
                        </div>
                        <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="mb-4"
                      >
                        <Icon className="w-12 h-12 mx-auto text-gray-700" />
                      </motion.div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{phase.title}</h3>
                      <p className="text-lg text-gray-600 mb-4">{phase.subtitle}</p>
                      <p className="text-gray-700 leading-relaxed mb-6">{phase.description}</p>
                      
                      {/* Duration Badge */}
                      <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{phase.duration}</span>
                      </div>
                    </div>

                    {/* Activities Section */}
                    <div className="relative z-10 mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Principais Atividades
                      </h4>
                      <div className="space-y-2">
                        {phase.activities.map((activity, idx) => (
                          <motion.div
                            key={activity}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 + idx * 0.1 }}
                            className="flex items-start space-x-2"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600">{activity}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Deliverables Section */}
                    <div className="relative z-10">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Entregáveis
                      </h4>
                      <div className="space-y-2">
                        {phase.deliverables.map((deliverable, idx) => (
                          <motion.div
                            key={deliverable}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 + idx * 0.1 + 0.3 }}
                            className="flex items-start space-x-2"
                          >
                            <div className={`w-2 h-2 bg-gradient-to-r ${phase.color} rounded-full flex-shrink-0 mt-2`}></div>
                            <span className="text-sm text-gray-600">{deliverable}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Border Animation */}
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      transition={{ delay: index * 0.2 + 0.5, duration: 0.8 }}
                      className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${phase.color}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-gray-50 to-caixa-blue-50 rounded-2xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Pronto para Começar Sua Jornada?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Inicie seu experimento hoje e participe da transformação digital da CAIXA. 
              Nosso time está aqui para apoiar você em cada etapa do processo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
              >
                Iniciar Experimento
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-secondary"
              >
                Baixar Guia Completo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSection;
