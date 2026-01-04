import { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/sections/Hero';
import { Features } from '@/components/sections/Features';
import { WorkflowShowcase } from '@/components/sections/WorkflowShowcase';
import { DownloadTier } from '@/components/sections/DownloadTier';
import { Requirements } from '@/components/sections/Requirements';
import { FAQ } from '@/components/sections/FAQ';
import { Footer } from '@/components/layout/Footer';

function App() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  // FIX: Redirect if user somehow lands on the download path (Vite SPA fallback)
  useEffect(() => {
    if (window.location.pathname.includes('/downloads/')) {
      window.location.href = '/';
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#030305] text-white font-sans selection:bg-purple-500/30 selection:text-purple-100 overflow-x-hidden relative">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#030305] to-[#030305]" />
        <motion.div style={{ y: y1, opacity: 0.4 }} className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-600/10 rounded-full blur-[150px] mix-blend-screen animate-pulse-slow" />
        <motion.div style={{ y: y2, opacity: 0.3 }} className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <Navbar />
      
      <main>
        <Hero />
        <Features />
        <WorkflowShowcase />
        <DownloadTier />
        <Requirements />
        <FAQ />
      </main>

      <Footer />
    </div>
  )
}

export default App
