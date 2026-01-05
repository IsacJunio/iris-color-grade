import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

export function CallToAction() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-purple-900/10 blur-[100px]" />
      <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ margin: "-100px" }}
              className="max-w-4xl mx-auto bg-gradient-to-b from-white/10 to-white/5 border border-white/10 p-12 rounded-3xl backdrop-blur-2xl"
          >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Pronto para transformar sua arte?</h2>
              <p className="text-xl text-white/60 mb-10">Baixe o Iris v2.7.0 agora e experimente o futuro do color grading com IA.</p>
              
              <a 
                href="https://drive.google.com/uc?export=download&id=19dkfR5hliN1lrkuGlfZKPTq7BPGk2njs" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white text-black px-12 py-5 rounded-full text-lg font-bold hover:bg-gray-100 transition-colors shadow-[0_0_50px_rgba(255,255,255,0.2)]"
              >
                <Download className="w-5 h-5" />
                Download Gratuito
              </a>
              <p className="mt-6 text-sm text-white/30">Compatível com Windows 10/11 (x64) • Requer GPU Dedicada</p>
          </motion.div>
      </div>
    </section>
  );
}
