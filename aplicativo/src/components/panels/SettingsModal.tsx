
import { useEffect, useState } from 'react';
import { X, Keyboard, RotateCcw } from 'lucide-react';

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
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            <Keyboard size={20} className="text-blue-500"/>
            Atalhos de Teclado
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
        </div>

        <div className="p-4 border-t border-neutral-800 flex justify-between bg-neutral-900/50 rounded-b-xl">
          <button 
            onClick={onResetShortcuts}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-white transition hover:bg-neutral-800 rounded"
          >
            <RotateCcw size={12}/> Restaurar Padrões
          </button>
          <button 
            onClick={onClose}
            className="bg-white text-black px-4 py-1.5 rounded text-sm font-semibold hover:bg-gray-200 transition"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
}
