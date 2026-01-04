import React, { useCallback } from 'react';
import { Plus, Palette, TrendingUp, Sparkles, MousePointer2 } from 'lucide-react';
import { LayerType } from '../../types/Layer';
import { useLayer } from '../../contexts/LayerContext';
import { LayerItem } from './LayerItem';

const layerTypeConfig: Record<LayerType, { icon: React.ReactNode; color: string }> = {
  cor: { icon: <Palette size={14} />, color: '#f97316' },
  curvas: { icon: <TrendingUp size={14} />, color: '#22c55e' },
  efeitos: { icon: <Sparkles size={14} />, color: '#8b5cf6' },
  selecao: { icon: <MousePointer2 size={14} />, color: '#3b82f6' }
};

const layerTypeLabels: Record<LayerType, string> = {
  cor: 'Cor',
  curvas: 'Curvas',
  efeitos: 'Efeitos',
  selecao: 'Seleção'
};

export const LayerPanel: React.FC = () => {
  const { 
    layers, 
    selectedLayerId, 
    selectLayer, 
    toggleLayerVisibility, 
    removeLayer, 
    reorderLayers, 
    addLayer, 
    updateLayer 
  } = useLayer();

  const [showAddMenu, setShowAddMenu] = React.useState(false);

  const handleMoveLayer = useCallback((id: string, direction: 'up' | 'down') => {
    const idx = layers.findIndex(l => l.id === id);
    if (idx === -1) return;
    
    if (direction === 'up' && idx < layers.length - 1) {
      reorderLayers(idx, idx + 1);
    } else if (direction === 'down' && idx > 0) {
      reorderLayers(idx, idx - 1);
    }
  }, [layers, reorderLayers]);

  // Handlers memoizados para passar para os itens
  const handleOpacityChange = useCallback((id: string, opacity: number) => {
    updateLayer(id, { opacity });
  }, [updateLayer]);

  return (
    <div className="w-full h-full bg-neutral-900 flex flex-col">
      {/* Header */}
      <div className="p-2 border-b border-neutral-800 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Camadas</span>
        <div className="relative">
          <button 
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 transition"
          >
            <Plus size={14} />
          </button>
          {showAddMenu && (
            <div className="absolute right-0 top-8 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-10 py-1 min-w-[120px]">
              {(['cor', 'curvas', 'efeitos', 'selecao'] as LayerType[]).map(type => (
                <button
                  key={type}
                  onClick={() => { addLayer(type); setShowAddMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-neutral-700 flex items-center gap-2"
                  style={{ color: layerTypeConfig[type].color }}
                >
                  {layerTypeConfig[type].icon}
                  {layerTypeLabels[type]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {layers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-xs">
            <Plus size={24} className="mx-auto mb-2 opacity-50" />
            Clique + para adicionar camada
          </div>
        ) : (
          [...layers].reverse().map((layer, idx) => (
            <LayerItem
              key={layer.id}
              layer={layer}
              index={idx}
              totalLayers={layers.length}
              isSelected={layer.id === selectedLayerId}
              onSelect={selectLayer}
              onToggleVisibility={toggleLayerVisibility}
              onDelete={removeLayer}
              onMove={handleMoveLayer}
              onOpacityChange={handleOpacityChange}
            />
          ))
        )}
      </div>

      {/* Footer info */}
      <div className="p-2 border-t border-neutral-800 text-[10px] text-gray-500 text-center">
        {layers.length} camada{layers.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};
