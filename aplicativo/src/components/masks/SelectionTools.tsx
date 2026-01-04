import React from 'react';

interface SelectionToolsProps {
  selectedColor: { h: number; s: number; l: number } | null;
  tolerance: number;
  localHue: number;
  localSaturation: number;
  localBrightness: number;
  showMask: boolean;
  onToleranceChange: (v: number) => void;
  onLocalHueChange: (v: number) => void;
  onLocalSaturationChange: (v: number) => void;
  onLocalBrightnessChange: (v: number) => void;
  onShowMaskChange: (v: boolean) => void;
  onClearSelection: () => void;
}

export const SelectionTools: React.FC<SelectionToolsProps> = ({
  selectedColor,
  tolerance,
  localHue,
  localSaturation,
  localBrightness,
  showMask,
  onToleranceChange,
  onLocalHueChange,
  onLocalSaturationChange,
  onLocalBrightnessChange,
  onShowMaskChange,
  onClearSelection
}) => {
  return (
    <div className="space-y-4">
      {/* Cor Selecionada */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Cor Selecionada</h3>
        {selectedColor ? (
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg border-2 border-neutral-600 shadow-inner"
              style={{ backgroundColor: `hsl(${selectedColor.h}, ${selectedColor.s}%, ${selectedColor.l}%)` }}
            />
            <div className="text-xs text-gray-400 space-y-0.5">
              <div>H: {Math.round(selectedColor.h)}°</div>
              <div>S: {Math.round(selectedColor.s)}%</div>
              <div>L: {Math.round(selectedColor.l)}%</div>
            </div>
            <button 
              onClick={onClearSelection}
              className="ml-auto text-xs text-red-400 hover:text-red-300"
            >
              Limpar
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500 bg-neutral-800 p-3 rounded-lg text-center">
            👆 Clique na imagem para selecionar uma cor
          </p>
        )}
      </div>

      {selectedColor && (
        <>
          {/* Tolerância */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Tolerância</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Faixa de Cor</span>
                <span className="text-xs text-gray-500 font-mono">{tolerance}%</span>
              </div>
              <input 
                type="range" 
                min={5} 
                max={100} 
                value={tolerance}
                onChange={(e) => onToleranceChange(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: '#f97316' }}
              />
            </div>
          </div>

          {/* Mostrar Máscara */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Mostrar Máscara</span>
            <button
              onClick={() => onShowMaskChange(!showMask)}
              className={`w-10 h-5 rounded-full transition ${showMask ? 'bg-orange-500' : 'bg-neutral-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${showMask ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Ajustes Locais */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Ajustes Locais</h3>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Mudar Cor (Matiz)</span>
                <span className="text-xs text-gray-500 font-mono">{localHue > 0 ? '+' : ''}{localHue}°</span>
              </div>
              <input 
                type="range" 
                min={-180} 
                max={180} 
                value={localHue}
                onChange={(e) => onLocalHueChange(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: '#22c55e' }}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Saturação</span>
                <span className="text-xs text-gray-500 font-mono">{localSaturation > 0 ? '+' : ''}{localSaturation}</span>
              </div>
              <input 
                type="range" 
                min={-100} 
                max={100} 
                value={localSaturation}
                onChange={(e) => onLocalSaturationChange(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: '#f97316' }}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Luminosidade</span>
                <span className="text-xs text-gray-500 font-mono">{localBrightness > 0 ? '+' : ''}{localBrightness}</span>
              </div>
              <input 
                type="range" 
                min={-100} 
                max={100} 
                value={localBrightness}
                onChange={(e) => onLocalBrightnessChange(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: '#3b82f6' }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
