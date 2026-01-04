import { motion } from 'framer-motion';
import { Cpu, HardDrive, MonitorPlay, Zap } from 'lucide-react';

export function Requirements() {
  return (
    <section className="py-24 px-6 relative z-10 bg-[#0A0A0C]">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Sistema Ideal</h2>
        <p className="text-center text-white/50 mb-16 max-w-2xl mx-auto">
          Como o Iris utiliza processamento vetorial em CPU, o número de núcleos e a velocidade da memória são os fatores mais críticos para performance em 8K.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Minimum Specs */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col justify-between"
          >
            <div>
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span> Mínimo
                </h3>
                <ul className="space-y-6">
                    <SpecItem 
                        icon={<Cpu className="text-white/40" />} 
                        label="Processador (Crítico)" 
                        value="Intel i5 / Ryzen 5" 
                        sub="4 Núcleos ou mais"
                    />
                    <SpecItem 
                        icon={<Zap className="text-white/40" />} 
                        label="RAM" 
                        value="8 GB" 
                        sub="DDR4 Dual Channel"
                    />
                    <SpecItem 
                        icon={<MonitorPlay className="text-white/40" />} 
                        label="Placa de Vídeo" 
                        value="Integrada (Intel UHD/Vega)" 
                        sub="Suporte a OpenGL 3.0"
                    />
                </ul>
            </div>
          </motion.div>

          {/* Recommended Specs */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-gradient-to-br from-purple-900/10 to-blue-900/10 border border-purple-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4"><div className="text-xs font-bold bg-purple-500 text-white px-3 py-1 rounded-full shadow-lg">HIGH PERFORMANCE</div></div>
            
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span> Recomendado
            </h3>
            <ul className="space-y-6">
                <SpecItem 
                    icon={<Cpu className="text-purple-400" />} 
                    label="Processador" 
                    value="Intel i9 / Ryzen 9" 
                    sub="8+ Núcleos para Exportação Paralela"
                    highlight
                />
                <SpecItem 
                    icon={<Zap className="text-purple-400" />} 
                    label="RAM (Cache 8K)" 
                    value="32 GB+" 
                    sub="DDR5 High Speed"
                    highlight
                />
                <SpecItem 
                    icon={<HardDrive className="text-purple-400" />} 
                    label="Armazenamento" 
                    value="NVMe Gen 4 (SSD)" 
                    sub="Leitura > 3500 MB/s"
                />
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SpecItem({ icon, label, value, sub, highlight = false }: { icon: any, label: string, value: string, sub: string, highlight?: boolean }) {
    return (
        <li className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${highlight ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                {icon}
            </div>
            <div>
                <strong className={`block text-sm uppercase tracking-wider mb-1 ${highlight ? 'text-purple-300' : 'text-white/40'}`}>{label}</strong>
                <div className="text-lg font-bold text-white">{value}</div>
                <div className="text-sm text-white/40">{sub}</div>
            </div>
        </li>
    )
}
