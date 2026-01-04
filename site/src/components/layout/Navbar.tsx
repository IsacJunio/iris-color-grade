import { Download } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030305]/70 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent">Iris</span>
          </div>
          
          <a href="/downloads/Iris-Setup.exe" download className="hidden md:flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full hover:bg-white/10">
              <Download className="w-4 h-4" /> Baixar v2.6.1
          </a>
      </div>
    </nav>
  );
}
