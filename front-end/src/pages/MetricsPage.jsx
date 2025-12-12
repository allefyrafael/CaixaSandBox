import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Clock, 
  Zap,
  Eye,
  Download,
  Filter,
  RefreshCw,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Award,
  Lightbulb,
  Rocket,
  Globe
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const MetricsPage = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('3m');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const timeRanges = [
    { value: '1m', label: '1 Mês' },
    { value: '3m', label: '3 Meses' },
    { value: '6m', label: '6 Meses' },
    { value: '1y', label: '1 Ano' }
  ];

  const kpiCards = [
    {
      title: 'Experimentos Cadastrados',
      value: '73',
      change: '+100%',
      trend: 'up',
      icon: Rocket,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Empregados Envolvidos',
      value: '4.000',
      change: '+12 VP',
      trend: 'up',
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Tempo de Aprovação',
      value: '48h',
      change: 'IA Otimizada',
      trend: 'up',
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Taxa de Satisfação',
      value: '92%',
      change: 'Alta Aceitação',
      trend: 'up',
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Eficiência Implementação',
      value: '85%',
      change: 'Fase Scale',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      title: 'Soluções Escaladas',
      value: '25+',
      change: 'Portfólio CAIXA',
      trend: 'up',
      icon: Award,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  const experimentsData = [
    { month: 'Ago', discovery: 25, delivery: 15, scale: 8 },
    { month: 'Set', discovery: 30, delivery: 20, scale: 12 },
    { month: 'Out', discovery: 35, delivery: 25, scale: 15 },
    { month: 'Nov', discovery: 40, delivery: 30, scale: 18 },
    { month: 'Dez', discovery: 45, delivery: 35, scale: 22 },
    { month: 'Jan', discovery: 50, delivery: 40, scale: 25 }
  ];

  const categoriesData = [
    { name: 'Atendimento ao Cliente', value: 30, color: '#3B82F6' },
    { name: 'Processos Internos', value: 25, color: '#10B981' },
    { name: 'Tecnologia & IA', value: 20, color: '#F59E0B' },
    { name: 'Produtos & Serviços', value: 15, color: '#8B5CF6' },
    { name: 'Sustentabilidade', value: 10, color: '#EF4444' }
  ];

  const performanceData = [
    { name: 'Jan', success: 82, satisfaction: 78, innovation: 85 },
    { name: 'Fev', success: 85, satisfaction: 82, innovation: 87 },
    { name: 'Mar', success: 88, satisfaction: 85, innovation: 90 },
    { name: 'Abr', success: 87, satisfaction: 88, innovation: 88 },
    { name: 'Mai', success: 90, satisfaction: 90, innovation: 92 },
    { name: 'Jun', success: 92, satisfaction: 93, innovation: 95 }
  ];

  const topProjects = [
    {
      name: 'Redução de Comprovantes',
      phase: 'Scale',
      progress: 95,
      impact: 'Alto',
      team: 'Operações',
      roi: 'R$ 3M/ano'
    },
    {
      name: 'IA Conversacional Transform It',
      phase: 'Delivery',
      progress: 85,
      impact: 'Médio-Alto',
      team: 'Tecnologia',
      roi: 'Eficiência +40%'
    },
    {
      name: 'Flexibilização de Normativos',
      phase: 'Discovery',
      progress: 70,
      impact: 'Alto',
      team: 'Compliance',
      roi: 'Agilidade +60%'
    },
    {
      name: 'Testes com 1% Base Clientes',
      phase: 'Scale',
      progress: 90,
      impact: 'Transformacional',
      team: 'Produtos',
      roi: 'Validação Rápida'
    },
    {
      name: 'Hub GovTech Brasília',
      phase: 'Delivery',
      progress: 75,
      impact: 'Médio',
      team: 'Inovação',
      roi: 'Parcerias Estratégicas'
    }
  ];

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
      <div className="container-max section-padding">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8"
        >
          <div>
            <h1 className="text-responsive-3xl font-bold gradient-text mb-2">
              Dashboard do Sandbox CAIXA
            </h1>
            <p className="text-responsive-lg text-gray-600">
              Acompanhe o desempenho e impacto dos experimentos do primeiro edital
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 lg:mt-0">
            {/* Time Range Selector */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setSelectedTimeRange(range.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedTimeRange === range.value
                      ? 'bg-caixa-blue text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={refreshData}
                disabled={isLoading}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            const trendIcon = kpi.trend === 'up' ? ArrowUp : kpi.trend === 'down' ? ArrowDown : Minus;
            const TrendIcon = trendIcon;
            
            return (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -2, scale: 1.02 }}
                className={`card p-6 ${kpi.bgColor} border-2 border-transparent hover:border-gray-200 relative overflow-hidden`}
              >
                {/* Background Icon */}
                <div className="absolute top-2 right-2 opacity-10">
                  <Icon className="w-12 h-12" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 bg-gradient-to-r ${kpi.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className={`flex items-center space-x-1 text-sm font-medium ${
                      kpi.trend === 'up' ? 'text-green-600' : 
                      kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      <TrendIcon className="w-3 h-3" />
                      <span>{kpi.change}</span>
                    </div>
                  </div>
                  
                  <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
                  <div className="text-sm text-gray-600">{kpi.title}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Experiments by Phase */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Experimentos por Fase</h3>
                <p className="text-gray-600">Distribuição mensal ao longo do pipeline</p>
              </div>
              <div className="flex space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Discovery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Scale</span>
                </div>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={experimentsData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="discovery" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivery" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="scale" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Categories Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">Distribuição por Categoria</h3>
              <p className="text-gray-600">Principais áreas de inovação</p>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoriesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Performance Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6 mb-8"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">Tendências de Performance</h3>
            <p className="text-gray-600">Métricas de sucesso, satisfação e inovação ao longo do tempo</p>
          </div>
          
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="success" 
                stackId="1" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
                name="Taxa de Sucesso (%)"
              />
              <Area 
                type="monotone" 
                dataKey="satisfaction" 
                stackId="2" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.6}
                name="Satisfação (%)"
              />
              <Area 
                type="monotone" 
                dataKey="innovation" 
                stackId="3" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.6}
                name="Índice de Inovação (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Top Projetos</h3>
              <p className="text-gray-600">Experimentos com melhor performance</p>
            </div>
            <button className="btn btn-secondary flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Ver Todos</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Projeto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Fase</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Progresso</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Impacto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Equipe</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">ROI</th>
                </tr>
              </thead>
              <tbody>
                {topProjects.map((project, index) => (
                  <motion.tr
                    key={project.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Lightbulb className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{project.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.phase === 'Scale' ? 'bg-green-100 text-green-600' :
                        project.phase === 'Delivery' ? 'bg-blue-100 text-blue-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {project.phase}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        project.impact === 'Transformacional' ? 'bg-purple-100 text-purple-600' :
                        project.impact === 'Alto' ? 'bg-red-100 text-red-600' :
                        project.impact === 'Médio-Alto' ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {project.impact}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{project.team}</td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-green-600">{project.roi}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MetricsPage;

