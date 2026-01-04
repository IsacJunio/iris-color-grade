import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export function FAQ() {
  const faqs = [
    {
      q: "O software é gratuito?",
      a: "Sim, a versão atual (v2.6) é totalmente gratuita para uso pessoal e comercial."
    },
    {
      q: "Suporta arquivos RAW?",
      a: "O Iris processa nativamente a maioria dos formatos RAW de câmeras profissionais, incluindo ARRI e RED."
    },
    {
      q: "Posso exportar LUTs?",
      a: "Com certeza. Você pode criar grading complexos e exportar como .CUBE 33/65 points para usar em campo ou em outro NLE."
    }
  ];

  return (
    <section className="py-24 px-6 relative z-10">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold mb-12 text-center text-white/80">Perguntas Frequentes</h2>
        
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <Accordion key={i} question={item.q} answer={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Accordion({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      onClick={() => setIsOpen(!isOpen)}
      className="border border-white/5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer overflow-hidden"
    >
      <div className="p-6 flex justify-between items-center">
        <h3 className="font-medium text-white/90">{question}</h3>
        <Plus className={`w-5 h-5 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
      </div>
      <motion.div 
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="px-6 text-white/50 overflow-hidden"
      >
        <div className="pb-6 pt-0 leading-relaxed">
            {answer}
        </div>
      </motion.div>
    </div>
  );
}
