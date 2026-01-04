import { ShieldCheck, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function SecurityDisclaimer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 mx-auto text-xs md:text-sm text-white/40 hover:text-white/80 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5"
      >
        <ShieldCheck className="w-4 h-4" />
        <span>Aviso sobre o Windows SmartScreen</span>
        <Info className="w-3 h-3 ml-1" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="overflow-hidden"
          >
            <div className="mt-4 bg-[#0A0A0A]/90 border border-white/10 rounded-2xl p-6 text-left backdrop-blur-xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
              
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                Segurança e Independência
              </h4>
              
              <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
                <p>
                  O <strong className="text-white/90">Iris</strong> é desenvolvido de forma independente, focado na comunidade criativa, e não por uma grande corporação de tecnologia.
                </p>
                <p>
                  Por não utilizarmos certificados digitais industriais (que custam milhares de dólares), o Windows pode exibir uma tela azul de <span className="text-white/80">"Windows protegeu o computador"</span>.
                </p>
                <p className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="text-blue-200 block mb-1 text-xs uppercase tracking-wider font-bold">Como prosseguir:</span>
                  Isso é apenas o sistema dizendo que "ainda não nos conhece". O arquivo é verificado e seguro.
                  Para instalar, basta clicar em <strong className="text-white underline decoration-white/30 underline-offset-2">Mais informações</strong> e depois no botão <strong className="text-white underline decoration-white/30 underline-offset-2">Executar mesmo assim</strong>.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
