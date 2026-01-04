import React, { memo } from 'react';
import { Eye, EyeOff, Trash2, ChevronUp, ChevronDown, Palette, TrendingUp, Sparkles, MousePointer2 } from 'lucide-react';
import { Layer, LayerType } from '../../types/Layer';

interface LayerItemProps {
  layer: Layer;
  index: number;
  totalLayers: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onOpacityChange: (id: string, opacity: number) => void;
}

const layerTypeConfig: Record<LayerType, { icon: React.ReactNode; color: string }> = {
  cor: { icon: <Palette size={14} />, color: '#f97316' },
  curvas: { icon: <TrendingUp size={14} />, color: '#22c55e' },
  efeitos: { icon: <Sparkles size={14} />, color: '#8b5cf6' },
  selecao: { icon: <MousePointer2 size={14} />, color: '#3b82f6' }
};

export const LayerItem = memo(({
  layer,
  index,
  totalLayers,
  isSelected,
  onSelect,
  onToggleVisibility,
  onDelete,
  onMove,
  onOpacityChange
}: LayerItemProps) => {
  const config = layerTypeConfig[layer.type];
  const realIdx = totalLayers - 1 - index;

  return (
    <div
      onClick={() => onSelect(layer.id)}
      className={`rounded-lg p-2 cursor-pointer transition ${
        isSelected 
          ? 'bg-neutral-700 ring-1 ring-orange-500' 
          : 'bg-neutral-800 hover:bg-neutral-750'
      } ${!layer.visible ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
          className="p-1 hover:bg-neutral-600 rounded"
          title={layer.visible ? "Ocultar" : "Mostrar"}
        >
          {layer.visible ? <Eye size={12} /> : <EyeOff size={12} className="text-gray-500" />}
        </button>
        
        <div style={{ color: config.color }}>
          {config.icon}
        </div>
        
        <span className="text-xs flex-1 truncate select-none">{layer.name}</span>
        
        <div className="flex gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); onMove(layer.id, 'up'); }}
            disabled={realIdx === totalLayers - 1}
            className="p-0.5 hover:bg-neutral-600 rounded disabled:opacity-30"
          >
            <ChevronUp size={10} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMove(layer.id, 'down'); }}
            disabled={realIdx === 0}
            className="p-0.5 hover:bg-neutral-600 rounded disabled:opacity-30"
          >
            <ChevronDown size={10} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(layer.id); }}
            className="p-0.5 hover:bg-red-600 rounded text-gray-400 hover:text-white"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>
      
      {isSelected && (
        <div className="mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-[10px] text-gray-500">Opacidade</span>
          <input
            type="range"
            min={0}
            max={100}
            value={layer.opacity}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onOpacityChange(layer.id, Number(e.target.value))}
            className="flex-1 h-1 cursor-pointer"
            style={{ accentColor: config.color }}
          />
          <span className="text-[10px] text-gray-500 w-6 text-right">{layer.opacity}%</span>
        </div>
      )}
    </div>
  );
});
