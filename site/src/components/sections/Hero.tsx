import { motion } from 'framer-motion';
import { Download, ChevronRight } from 'lucide-react';
import { SecurityDisclaimer } from '../ui/SecurityDisclaimer';

export function Hero() {

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <header className="relative pt-40 pb-32 px-6 container mx-auto text-center z-10 perspective-[2000px]">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="max-w-5xl mx-auto space-y-10"
      >
        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-200/80 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
          <span className="flex h-2 w-2 rounded-full bg-green-500 box-shadow-green" />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Novo: </span> v2.6.1 Disponível Agora
        </motion.div>

        <motion.h1 
          variants={fadeInUp}
          className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.1] bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent drop-shadow-2xl"
        >
          A Arte do <br />
          <span className="relative inline-block text-white">
              Color Grading
              <motion.div 
                  className="absolute -inset-1 bg-purple-500/20 blur-xl -z-10 rounded-full"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity }}
              />
          </span>
        </motion.h1>

        <motion.p 
          variants={fadeInUp}
          className="text-xl md:text-2xl text-blue-100/60 max-w-2xl mx-auto leading-relaxed font-light"
        >
          Eleve suas produções com uma pipeline de processamento baseada em nós.
          <span className="text-white/90 font-normal"> Potência de cinema em tempo real.</span>
        </motion.p>

        <motion.div 
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-10"
        >
          <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
              <a 
                href="https://drive.google.com/uc?export=download&id=1rf0dXQayRfE8Jh5z2-J6x2xMA954Ip0h"
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center gap-3 bg-white text-black px-10 py-5 rounded-full text-lg font-bold hover:scale-105 active:scale-95 transition-transform shadow-2xl"
              >
                <Download className="w-5 h-5" />
                Baixar para Windows
              </a>
          </div>
          
          <a href="#features" className="group text-white/60 hover:text-white transition-colors flex items-center gap-2 px-6 py-4 font-medium">
            Explorar Recursos <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
        <SecurityDisclaimer />
      </motion.div>

      {/* Hero Image Showcase */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-28 relative max-w-7xl mx-auto group"
      >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-purple-500/10 blur-[100px] rounded-full transform scale-75 group-hover:scale-100 transition-transform duration-1000 opacity-50" />

            <div className="relative rounded-xl bg-[#0A0A0A] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/5 transition-transform duration-500 group-hover:ring-purple-500/30">
              {/* Window Controls */}
              <div className="h-10 bg-[#111] border-b border-white/5 flex items-center px-4 justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-sm" />
                  </div>
                  <div className="text-xs text-white/20 font-mono tracking-widest uppercase">Iris Pro v2.6.1</div>
                  <div className="w-14" />
              </div>
              
              {/* Main Screenshot */}
              <div className="relative bg-black aspect-[16/9] overflow-hidden group-hover:shadow-[0_0_100px_rgba(147,51,234,0.15)] transition-shadow duration-500">
                  <img 
                    src="/app-screenshot.png" 
                    alt="Interface do Aplicativo Iris" 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Interactive Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1.5s] ease-in-out pointer-events-none" />
              </div>
            </div>
      </motion.div>
    </header>
  );
}
