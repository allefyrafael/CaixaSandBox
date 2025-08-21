import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Rocket, 
  ArrowRight, 
  Play, 
  Sparkles, 
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import ThreeModelViewer from './ThreeModelViewer';

const HeroSection = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getModelSize = () => {
    const isMobile = windowSize.width < 768;
    const isTablet = windowSize.width >= 768 && windowSize.width < 1024;
    
    if (isMobile) {
      return { width: Math.min(windowSize.width * 0.9, 400), height: 300 };
    } else if (isTablet) {
      return { width: Math.min(windowSize.width * 0.7, 600), height: 450 };
    } else {
      return { width: Math.min(windowSize.width * 0.5, 800), height: 600 };
    }
  };

  const floatingIcons = [
    { Icon: Sparkles, delay: 0, className: "top-20 left-10" },
    { Icon: TrendingUp, delay: 0.5, className: "top-32 right-20" },
    { Icon: Users, delay: 1, className: "bottom-40 left-20" },
    { Icon: Target, delay: 1.5, className: "bottom-32 right-10" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Animated Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-caixa-blue/20 to-caixa-blue-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-caixa-orange/20 to-caixa-green/20 rounded-full blur-3xl"
        />
        
        {/* Floating Icons */}
        {floatingIcons.map((item, index) => {
          const { Icon } = item;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 0.1, 
                scale: 1,
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                delay: item.delay,
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`absolute ${item.className} hidden lg:block`}
            >
              <Icon className="w-8 h-8 text-caixa-blue" />
            </motion.div>
          );
        })}
      </div>

      <div className="container-max section-padding relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-caixa-blue/10 border border-caixa-blue/20 rounded-full px-4 py-2"
            >
              <Sparkles className="w-4 h-4 text-caixa-blue" />
              <span className="text-caixa-blue font-medium">Revolucionando a Inovação</span>
            </motion.div>

            {/* Main Heading */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              >
                <span className="text-gray-900">Transforme</span>
                <br />
                <span className="gradient-text">Ideias em Valor</span>
              </motion.h1>
              
                          <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 mt-6 leading-relaxed"
            >
              O <strong>Sandbox CAIXA</strong> é um ambiente de experimentação interna da Caixa Econômica Federal 
              focado em intraempreendedorismo. Capturando ideias dos 87.000 empregados, 
              transforma-os em experimentos estruturados e promove mudança cultural para inovação ágil.
            </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/formulario"
                  className="btn btn-primary group text-lg px-8 py-4"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  <span>Iniciar Experimento</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/demo" 
                  className="btn btn-secondary group text-lg px-8 py-4"
                >
                  <Play className="w-5 h-5 mr-2" />
                  <span>Ver Demo</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200"
            >
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-caixa-blue">73</div>
                <div className="text-sm text-gray-600">Experimentos Cadastrados</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-caixa-green">4.000</div>
                <div className="text-sm text-gray-600">Empregados Envolvidos</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-caixa-orange">12+</div>
                <div className="text-sm text-gray-600">Vice-Presidências</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual - 3D Canvas */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-2xl h-[300px] md:h-[450px] lg:h-[600px]">
              <ThreeModelViewer
                modelUrl="/sandBOX.glb"
                width={getModelSize().width}
                height={getModelSize().height}
                cameraPosition={{ x: 15, y: 5, z: 15 }}
                modelPosition={{ x: 0, y: -1, z: 0 }}
                modelRotation={{ x: 0, y: 0, z: 0 }}
                modelScale={{ x: 1, y: 1, z: 1 }}
                enableControls={true}
                autoRotate={false}
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'transparent', 
                  border: 'none',
                  width: '100%',
                  height: '100%'
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center space-y-2 text-gray-400"
        >
          <span className="text-sm">Explore mais</span>
          <div className="w-0.5 h-8 bg-gray-300 rounded-full">
            <motion.div
              animate={{ height: ["0%", "100%", "0%"] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-full bg-caixa-blue rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
