
import { useEffect, useState } from 'react';
import { X, Keyboard, RotateCcw, Brain, Check } from 'lucide-react';

export type ShortcutAction = 'undo' | 'redo' | 'brushSizeUp' | 'brushSizeDown' | 'toggleView' | 'deleteNode';

export type Shortcuts = Record<ShortcutAction, { label: string, key: string }>;

export const defaultShortcuts: Shortcuts = {
  undo: { label: 'Desfazer', key: 'Control+z' },
  redo: { label: 'Refazer', key: 'Control+y' },
  brushSizeUp: { label: 'Aumentar Pincel', key: ']' },
  brushSizeDown: { label: 'Diminuir Pincel', key: '[' },
  toggleView: { label: 'Ver Original (Hold)', key: '\\' },
  deleteNode: { label: 'Deletar Nó', key: 'Delete' },
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Shortcuts;
  onUpdateShortcut: (action: ShortcutAction, newKey: string) => void;
  onResetShortcuts: () => void;
}

export function SettingsModal({ isOpen, onClose, shortcuts, onUpdateShortcut, onResetShortcuts }: SettingsModalProps) {
  const [listeningFor, setListeningFor] = useState<ShortcutAction | null>(null);
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'ai'>('shortcuts');
  
  // AI Settings State
  const [aiProvider, setAiProvider] = useState<string>('gemini');
  const [aiToken, setAiToken] = useState<string>('');
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const storedProvider = localStorage.getItem('ai_provider');
    const storedToken = localStorage.getItem('ai_token');
    if (storedProvider) setAiProvider(storedProvider);
    if (storedToken) setAiToken(storedToken);
  }, []);

  const handleSaveAI = () => {
    localStorage.setItem('ai_provider', aiProvider);
    localStorage.setItem('ai_token', aiToken);
    
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  useEffect(() => {
    if (!listeningFor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      let key = e.key;
      if (key === 'Control') return;
      if (key === 'Shift') return;
      if (key === 'Alt') return;

      let prefix = '';
      if (e.ctrlKey) prefix += 'Control+';
      if (e.shiftKey) prefix += 'Shift+';
      if (e.altKey) prefix += 'Alt+';

      // Normaliza teclas
      if (key === ' ') key = 'Space';
      
      const fullKey = prefix + key;
      onUpdateShortcut(listeningFor, fullKey);
      setListeningFor(null);
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [listeningFor, onUpdateShortcut]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-md rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header with Tabs */}
        <div className="flex flex-col border-b border-neutral-800">
          <div className="flex items-center justify-between p-4 pb-2">
             <h2 className="text-lg font-bold text-white">Configurações</h2>
             <button onClick={onClose} className="text-gray-400 hover:text-white transition">
               <X size={20} />
             </button>
          </div>
          
          <div className="flex px-4 gap-4">
             <button 
                onClick={() => setActiveTab('shortcuts')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'shortcuts' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
             >
                <Keyboard size={16} />
                Atalhos
             </button>
             <button 
                onClick={() => setActiveTab('ai')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ai' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
             >
                <Brain size={16} />
                Inteligência Artificial
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          
          {/* SHORTCUTS TAB */}
          {activeTab === 'shortcuts' && (
             <div className="space-y-2 animate-fadeIn">
                {Object.entries(shortcuts).map(([action, { label, key }]) => (
                <div 
                  key={action} 
                  className={`flex items-center justify-between p-3 rounded border transition ${
                    listeningFor === action 
                      ? 'bg-blue-900/30 border-blue-500/50' 
                      : 'bg-neutral-800/50 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  <span className="text-sm text-gray-300 font-medium">{label}</span>
                  <button
                    onClick={() => setListeningFor(action as ShortcutAction)}
                    className={`text-xs px-3 py-1.5 rounded font-mono border min-w-[80px] text-center transition ${
                      listeningFor === action
                        ? 'bg-blue-600 text-white border-blue-500 animate-pulse'
                        : 'bg-neutral-950 text-gray-400 border-neutral-700 hover:border-gray-500'
                    }`}
                  >
                    {listeningFor === action ? 'Pressione...' : key}
                  </button>
                </div>
              ))}
              
              <div className="mt-4 flex justify-end">
                <button 
                    onClick={onResetShortcuts}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-white transition hover:bg-neutral-800 rounded"
                >
                    <RotateCcw size={12}/> Restaurar Padrões
                </button>
              </div>
             </div>
          )}

          {/* AI TAB */}
          {activeTab === 'ai' && (
             <div className="space-y-6 animate-fadeIn text-gray-300">
                <div className="bg-purple-900/20 border border-purple-500/30 p-3 rounded-lg text-xs leading-relaxed">
                   <p>Configure sua chave de API para habilitar a geração automática de color grading baseada em prompts de texto.</p>
                </div>

                <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-400">Provedor de IA</label>
                   <select 
                      value={aiProvider}
                      onChange={(e) => setAiProvider(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none"
                   >
                      <option value="gemini">Google Gemini (Gratuito/Pago)</option>
                      <option value="openai">OpenAI (Pago)</option>
                      <option value="huggingface">Hugging Face (Gratuito/Open Source)</option>
                   </select>
                </div>

                <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-400">Token de API</label>
                   <input
                      type="password"
                      placeholder={
                        aiProvider === 'gemini' ? "Cole seu token do Google Gemini..." : 
                        aiProvider === 'openai' ? "Cole seu token da OpenAI (sk-...)" :
                        "Cole seu Access Token do Hugging Face..."
                      }
                      value={aiToken}
                      onChange={(e) => setAiToken(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none placeholder:text-neutral-600"
                   />
                   <p className="text-[10px] text-gray-500">
                      {aiProvider === 'gemini' 
                         ? 'Obtenha em: aistudio.google.com'
                         : aiProvider === 'openai'
                         ? 'Obtenha em: platform.openai.com'
                         : 'Obtenha em: huggingface.co/settings/tokens (Crie um token do tipo "Write" ou "Read")'
                      }
                   </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-neutral-800">
                   {showSaved ? (
                      <span className="text-green-400 text-xs flex items-center gap-1">
                         <Check size={14}/> Salvo com sucesso!
                      </span>
                   ) : <span></span>}
                   
                   <button
                      onClick={handleSaveAI}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-lg shadow-purple-900/20"
                   >
                      Salvar Configurações
                   </button>
                </div>
             </div>
          )}

        </div>

        <div className="p-4 border-t border-neutral-800 flex justify-end bg-neutral-900/50 rounded-b-xl">
          <button 
            onClick={onClose}
            className="bg-white text-black px-4 py-1.5 rounded text-sm font-semibold hover:bg-gray-200 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
