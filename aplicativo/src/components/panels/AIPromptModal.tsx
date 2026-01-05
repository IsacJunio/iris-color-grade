
import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export function AIPromptModal({ isOpen, onClose, onGenerate, isLoading }: AIPromptModalProps) {
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate(prompt);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-purple-500/30 w-full max-w-lg rounded-xl shadow-2xl flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none" />
        
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 relative z-10">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            <Sparkles size={20} className="text-purple-400" />
            AI Color Grading
          </h2>
          <button onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 relative z-10">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Descreva o estilo que você deseja:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Cinematic, dark mood, cyberpunk vibe, warm sunset..."
              className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white placeholder:text-neutral-600 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
             <button
                type="button" 
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
             >
                Cancelar
             </button>
             <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Gerar
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
