import { Layers, Zap, Wand2, Palette, Monitor, MousePointer2 } from 'lucide-react';
import { FeatureCard } from '@/components/ui/FeatureCard';

export function Features() {
  return (
    <section id="features" className="py-32 px-6 relative z-10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      
      <div className="container mx-auto max-w-7xl">
          <div className="mb-20 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Sinfonia Visual</h2>
              <p className="text-xl text-white/50 max-w-2xl">Onde engenharia de precisão encontra a intuição artística.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
            {/* Bento Idea: Large item spanning 2 columns */}
            <FeatureCard 
              className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-white/[0.03] to-white/[0.01]"
              icon={<Layers className="w-8 h-8 text-indigo-400" />}
              title="Workflow Nodal Infinito"
              description="Uma tela em branco para sua criatividade. Conecte nós de processamento, crie ramificações complexas e visualize o fluxo dos seus dados em tempo real. Sem limites de camadas, sem limites de imaginação."
              delay={0}
            />
            
            <FeatureCard 
              className="md:col-span-1 md:row-span-1"
              icon={<Zap className="w-6 h-6 text-yellow-400" />}
              title="GPU Nativa"
              description="Aceleração de hardware total. Reprodução fluida de 8K EXR."
              delay={0.1}
            />

             <FeatureCard 
              className="md:col-span-1 md:row-span-1"
              icon={<Wand2 className="w-6 h-6 text-purple-400" />}
              title="Máscaras Neurais"
              description="IA que entende profundidade e isola objetos instantaneamente."
              delay={0.2}
            />

            {/* Wide item */}
            <FeatureCard 
              className="md:col-span-3 bg-gradient-to-r from-white/[0.02] to-purple-900/[0.05]"
              icon={<Palette className="w-6 h-6 text-pink-400" />}
              title="Color Science ACEScct"
              description="Integridade de cor do início ao fim. Trabalhe no espaço de cor padrão da indústria cinematográfica, garantindo que suas cores sejam traduzidas perfeitamente para qualquer tela, do cinema ao smartphone."
              delay={0.3}
            />

            <FeatureCard 
              icon={<Monitor className="w-6 h-6 text-cyan-400" />}
              title="UI Distraction-Free"
              description="Painéis retráteis que deixam sua imagem brilhar."
              delay={0.4}
            />
            
            <FeatureCard 
              className="md:col-span-2"
              icon={<MousePointer2 className="w-6 h-6 text-green-400" />}
              title="Controle Cirúrgico"
              description="Curvas de 128 pontos e vetorescópio de alta precisão para ajustes que transformam a narrativa."
              delay={0.5}
            />
          </div>
      </div>
    </section>
  );
}
