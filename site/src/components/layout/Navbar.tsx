import { Download } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030305]/70 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent">Iris</span>
          </div>
          

      </div>
    </nav>
  );
}
