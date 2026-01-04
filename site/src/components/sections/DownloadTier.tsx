import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export function DownloadTier() {
  return (
    <section className="py-24 px-6 relative z-10">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Power for Everyone</h2>
             <p className="text-white/50">Comece gratuitamente, sem limitações artificiais.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-end">
            
            {/* Free Tier */}
            <motion.div 
                whileHover={{ y: -5 }}
                className="bg-[#0F0F12] border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-50"><div className="text-xs font-bold border border-white/20 px-2 py-1 rounded text-white/50">OPEN BETA</div></div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Iris Personal</h3>
                <div className="text-4xl font-bold text-white mb-6">Grátis <span className="text-lg font-normal text-white/30">/ para sempre</span></div>
                
                <ul className="space-y-4 mb-8">
                    <FeatureItem text="Exportação 4K & 8K" included />
                    <FeatureItem text="Nós Ilimitados" included />
                    <FeatureItem text="Máscaras IA (GPU Local)" included />
                    <FeatureItem text="Suporte RAW (ARRI, RED)" included />
                    <FeatureItem text="Cloud Collaboration" included={false} />
                </ul>

                <a href="/downloads/Iris-Setup.exe" download className="block w-full text-center bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors">
                    Baixar v2.6.1
                </a>
            </motion.div>

            {/* Pro Tier (Teaser) */}
            <div className="bg-transparent border border-white/5 rounded-3xl p-8 opacity-60 hover:opacity-100 transition-opacity">
                 <h3 className="text-2xl font-bold text-white mb-2">Iris Studio</h3>
                 <div className="text-4xl font-bold text-white mb-6">Em Breve <span className="text-lg font-normal text-white/30">/ subscription</span></div>
                 
                 <ul className="space-y-4 mb-8">
                    <FeatureItem text="Tudo do Personal" included />
                    <FeatureItem text="Render Farm Network" included />
                    <FeatureItem text="Colaboração em Tempo Real" included />
                    <FeatureItem text="Cloud Storage (10TB)" included />
                    <FeatureItem text="Suporte Dedicado 24/7" included />
                </ul>

                <button disabled className="block w-full text-center bg-white/5 text-white/30 font-bold py-4 rounded-xl cursor-not-allowed border border-white/5">
                    Notifique-me
                </button>
            </div>

        </div>
      </div>
    </section>
  );
}

function FeatureItem({ text, included }: { text: string, included: boolean }) {
    return (
        <li className="flex items-center gap-3">
            {included ? (
                <div className="p-1 rounded-full bg-green-500/20 text-green-400"><Check className="w-3 h-3" /></div>
            ) : (
                <div className="p-1 rounded-full bg-white/5 text-white/20"><X className="w-3 h-3" /></div>
            )}
            <span className={`text-sm ${included ? 'text-white/80' : 'text-white/30'}`}>{text}</span>
        </li>
    )
}
