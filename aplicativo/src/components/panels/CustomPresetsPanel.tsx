import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, Trash2, FolderOpen, Sparkles } from 'lucide-react';
import { Layer } from '../../types/Layer';
import { MaskLayer } from '../../types/Mask';

export interface CustomPreset {
  id: string;
  name: string;
  layers: Layer[];
  maskLayers?: MaskLayer[]; // Máscaras profissionais
  createdAt: number;
  thumbnail?: string; // Base64 mini thumbnail
}

interface CustomPresetsPanelProps {
  layers: Layer[];
  maskLayers?: MaskLayer[]; // Máscaras profissionais atuais
  onApplyPreset: (layers: Layer[], maskLayers?: MaskLayer[]) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isCollapsed?: boolean;
  fullWidth?: boolean; // Novo modo para integração em abas
}

const STORAGE_KEY = 'iris-custom-presets';

export function CustomPresetsPanel({ layers, maskLayers, onApplyPreset, canvasRef, fullWidth = false }: CustomPresetsPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [presets, setPresets] = useState<CustomPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [isNaming, setIsNaming] = useState(false);
  
  // Se fullWidth, sempre aberto
  const effectiveIsOpen = fullWidth ? true : isOpen;

  // Carregar presets do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPresets(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Erro ao carregar presets:', e);
    }
  }, []);

  // Salvar presets no localStorage
  const savePresetsToStorage = (updatedPresets: CustomPreset[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPresets));
      setPresets(updatedPresets);
    } catch (e) {
      console.error('Erro ao salvar presets:', e);
    }
  };

  // Gerar thumbnail do canvas atual
  const generateThumbnail = (): string | undefined => {
    if (!canvasRef.current) return undefined;
    
    try {
      const canvas = canvasRef.current;
      const tempCanvas = document.createElement('canvas');
      const size = 80;
      tempCanvas.width = size;
      tempCanvas.height = size;
      const ctx = tempCanvas.getContext('2d');
      
      if (ctx) {
        // Calcular crop quadrado centralizado
        const minDim = Math.min(canvas.width, canvas.height);
        const sx = (canvas.width - minDim) / 2;
        const sy = (canvas.height - minDim) / 2;
        
        ctx.drawImage(canvas, sx, sy, minDim, minDim, 0, 0, size, size);
        return tempCanvas.toDataURL('image/jpeg', 0.6);
      }
    } catch (e) {
      console.error('Erro ao gerar thumbnail:', e);
    }
    return undefined;
  };

  // Salvar preset atual
  const saveCurrentAsPreset = () => {
    if (layers.length === 0) {
      alert('Adicione pelo menos uma camada antes de salvar um preset.');
      return;
    }
    setIsNaming(true);
  };

  // Função auxiliar para converter Uint8ClampedArray para base64
  const uint8ArrayToBase64 = (array: Uint8ClampedArray): string => {
    let binary = '';
    const len = array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(array[i]);
    }
    return btoa(binary);
  };

  const confirmSavePreset = () => {
    const name = newPresetName.trim() || `Preset ${presets.length + 1}`;
    
    // Criar cópia profunda das camadas, convertendo maskData para base64
    const layersCopy = layers.map(layer => {
      const copy = { ...layer };
      if (copy.selection) {
        // Converter maskData para base64 se existir
        const maskData = copy.selection.maskData;
        copy.selection = { 
          ...copy.selection, 
          maskData: null,
          // Salvar como base64 em um campo separado para serialização
          maskDataBase64: maskData ? uint8ArrayToBase64(maskData) : null
        } as any;
      }
      // Gerar novo ID ao aplicar para evitar conflitos
      return { ...copy, id: `saved-${layer.id}` };
    });

    // Criar cópia profunda das máscaras profissionais
    const maskLayersCopy = maskLayers ? maskLayers.map(maskLayer => {
      const copy = JSON.parse(JSON.stringify(maskLayer));
      // Gerar novo ID para evitar conflitos
      copy.id = `saved-mask-${maskLayer.id}`;
      copy.mask.id = `saved-mask-${maskLayer.mask.id}`;
      return copy;
    }) : [];

    const newPreset: CustomPreset = {
      id: `preset-${Date.now()}`,
      name,
      layers: layersCopy,
      maskLayers: maskLayersCopy,
      createdAt: Date.now(),
      thumbnail: generateThumbnail()
    };

    savePresetsToStorage([...presets, newPreset]);
    setNewPresetName('');
    setIsNaming(false);
  };

  const cancelNaming = () => {
    setNewPresetName('');
    setIsNaming(false);
  };

  // Deletar preset
  const deletePreset = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este preset?')) {
      savePresetsToStorage(presets.filter(p => p.id !== id));
    }
  };

  // Função auxiliar para converter base64 para Uint8ClampedArray
  const base64ToUint8Array = (base64: string): Uint8ClampedArray => {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8ClampedArray(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

  // Aplicar preset
  const applyPreset = (preset: CustomPreset) => {
    // Gerar novos IDs para evitar conflitos e restaurar maskData
    const newLayers = preset.layers.map((layer, idx) => {
      const newLayer = {
        ...layer,
        id: `layer-${Date.now()}-${idx}`
      };
      
      // Restaurar maskData de base64 se existir
      if (newLayer.selection) {
        const selectionAny = newLayer.selection as any;
        if (selectionAny.maskDataBase64) {
          newLayer.selection = {
            ...newLayer.selection,
            maskData: base64ToUint8Array(selectionAny.maskDataBase64)
          };
          delete selectionAny.maskDataBase64;
        }
      }
      
      return newLayer;
    });

    // Restaurar máscaras profissionais com novos IDs
    const newMaskLayers = preset.maskLayers ? preset.maskLayers.map((maskLayer, idx) => {
      const newMaskLayer = JSON.parse(JSON.stringify(maskLayer));
      newMaskLayer.id = `mask-layer-${Date.now()}-${idx}`;
      newMaskLayer.mask.id = `mask-${Date.now()}-${idx}`;
      return newMaskLayer as MaskLayer;
    }) : undefined;

    onApplyPreset(newLayers, newMaskLayers);
  };

  return (
    <div 
      className={`h-full flex flex-row bg-neutral-900 ${fullWidth ? '' : 'border-l border-neutral-800'} transition-all duration-300 ease-in-out shrink-0 ${
        fullWidth ? 'w-full' : (isOpen ? 'w-64' : 'w-10')
      }`}
    >
      {/* Toggle Button */}
      {!fullWidth && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-full bg-neutral-900 border-r border-neutral-800 flex flex-col items-center justify-center gap-2 hover:bg-neutral-800 transition-colors shrink-0"
          title={isOpen ? 'Minimizar Presets' : 'Abrir Presets'}
        >
          {isOpen ? (
            <ChevronRight size={20} className="text-gray-400" />
          ) : (
            <ChevronLeft size={20} className="text-gray-400" />
          )}
          {!isOpen && (
            <div className="text-xs text-gray-500 font-medium tracking-wider" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              MEUS PRESETS
            </div>
          )}
        </button>
      )}

      {/* Panel Content */}
      {effectiveIsOpen && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Meus Presets</h2>
          </div>
          
          {/* Save Button / Naming Input */}
          {isNaming ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Nome do preset..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                autoFocus
                onKeyDown={(e) => {
                  e.stopPropagation(); // Impedir que atalhos globais capturem a digitação
                  if (e.key === 'Enter') confirmSavePreset();
                  if (e.key === 'Escape') cancelNaming();
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={confirmSavePreset}
                  className="flex-1 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded text-xs font-medium hover:opacity-90 transition"
                >
                  Salvar
                </button>
                <button
                  onClick={cancelNaming}
                  className="flex-1 py-1.5 bg-neutral-700 rounded text-xs font-medium hover:bg-neutral-600 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={saveCurrentAsPreset}
              disabled={layers.length === 0}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              Salvar Preset Atual
            </button>
          )}
        </div>

        {/* Presets List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {presets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen size={40} className="text-neutral-700 mb-3" />
              <p className="text-sm text-gray-500">Nenhum preset salvo</p>
              <p className="text-xs text-gray-600 mt-1">
                Ajuste sua imagem e salve para usar depois
              </p>
            </div>
          ) : (
            presets.map((preset) => (
              <div
                key={preset.id}
                className="group relative bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 hover:border-purple-500/50 transition-all cursor-pointer"
                onClick={() => applyPreset(preset)}
              >
                <div className="flex items-stretch">
                  {/* Thumbnail */}
                  {preset.thumbnail ? (
                    <div 
                      className="w-16 h-16 flex-shrink-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${preset.thumbnail})` }}
                    />
                  ) : (
                    <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center">
                      <Sparkles size={20} className="text-purple-400/50" />
                    </div>
                  )}
                  
                  {/* Info */}
                  <div className="flex-1 p-2 flex flex-col justify-center min-w-0">
                    <p className="text-sm font-medium text-white truncate">{preset.name}</p>
                    <p className="text-[10px] text-gray-500">
                      {preset.layers.length} camada{preset.layers.length !== 1 ? 's' : ''}
                      {preset.maskLayers && preset.maskLayers.length > 0 && (
                        <> • {preset.maskLayers.length} máscara{preset.maskLayers.length !== 1 ? 's' : ''}</>
                      )}
                    </p>
                  </div>
                </div>

                {/* Delete Button (appears on hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePreset(preset.id);
                  }}
                  className="absolute top-1 right-1 p-1.5 bg-red-900/80 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  title="Excluir preset"
                >
                  <Trash2 size={12} className="text-red-200" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {presets.length > 0 && (
          <div className="p-3 border-t border-neutral-800 text-center">
            <p className="text-[10px] text-gray-600">
              {presets.length} preset{presets.length !== 1 ? 's' : ''} salvo{presets.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
        </div>
      )}
    </div>
  );
}
