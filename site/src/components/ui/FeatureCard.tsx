import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  className?: string;
}

export function FeatureCard({ icon, title, description, delay = 0, className = "" }: FeatureCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay }}
      whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.03)" }}
      className={`p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 group ${className}`}
    >
      <div className="h-14 w-14 rounded-2xl bg-[#0F0F12] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">{title}</h3>
      <p className="text-white/50 leading-relaxed font-light">
        {description}
      </p>
    </motion.div>
  )
}
