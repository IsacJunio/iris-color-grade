export function Footer() {
  return (
    <footer className="py-12 border-t border-white/5 bg-[#010101] relative z-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-white/40">
          <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-linear-to-tr from-purple-500 to-blue-500 opacity-50" />
              <p>&copy; {new Date().getFullYear()} Iris Inc. Todos os direitos reservados.</p>
          </div>
          <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
      </div>
    </footer>
  );
}
