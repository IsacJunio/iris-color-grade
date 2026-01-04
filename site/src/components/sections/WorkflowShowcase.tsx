import { motion } from 'framer-motion';
import { Network, GitGraph } from 'lucide-react';

export function WorkflowShowcase() {
  return (
    <section className="py-24 px-6 relative z-10 overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center gap-16">
          
          {/* Text Side */}
          <div className="flex-1 space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Controle Total do Fluxo
            </h2>
            <p className="text-xl text-white/50 leading-relaxed font-light">
              Nossa arquitetura baseada em nós permite que você visualize cada etapa do processamento. Crie ramificações, isole efeitos e tenha controle granular sobre a matemática das cores.
            </p>
            
            <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400"><Network /></div>
                    <div>
                        <h4 className="font-bold text-white">Pipeline Não-Destrutivo</h4>
                        <p className="text-sm text-white/40">Altere qualquer parâmetro, a qualquer momento.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><GitGraph /></div>
                    <div>
                        <h4 className="font-bold text-white">Versioneamento de Looks</h4>
                        <p className="text-sm text-white/40">Compare variantes do seu grading instantaneamente.</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Visual Side - Abstract Node Graph UI */}
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ margin: "-100px" }}
              className="relative bg-[#0F0F12] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden aspect-video"
            >
                {/* Node Graph Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                    <line x1="20%" y1="50%" x2="40%" y2="30%" stroke="#4f46e5" strokeWidth="2" />
                    <line x1="20%" y1="50%" x2="40%" y2="70%" stroke="#4f46e5" strokeWidth="2" />
                    <line x1="40%" y1="30%" x2="70%" y2="50%" stroke="#4f46e5" strokeWidth="2" />
                    <line x1="40%" y1="70%" x2="70%" y2="50%" stroke="#4f46e5" strokeWidth="2" />
                </svg>

                {/* Nodes */}
                <NodeElement x="10%" y="40%" label="Input Source" color="bg-gray-700" delay={0} />
                <NodeElement x="35%" y="20%" label="Color Balance" color="bg-indigo-600" delay={0.2} />
                <NodeElement x="35%" y="60%" label="Curves" color="bg-purple-600" delay={0.3} />
                <NodeElement x="65%" y="40%" label="Output Transform" color="bg-green-600" delay={0.5} />

                {/* Floating "Playhead" */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-mono text-white/30">PROCESSING</span>
                </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

function NodeElement({ x, y, label, color, delay }: { x: string, y: string, label: string, color: string, delay: number }) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay, type: "spring" }}
            className={`absolute px-4 py-2 rounded-lg border border-white/20 shadow-lg text-xs font-bold text-white flex items-center gap-2 ${color}`}
            style={{ left: x, top: y }}
        >
            <div className="w-2 h-2 rounded-full bg-white/50" />
            {label}
            <div className="w-2 h-2 rounded-full bg-white/50 ml-auto" />
        </motion.div>
    )
}
