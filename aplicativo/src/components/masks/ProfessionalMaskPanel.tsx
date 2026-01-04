/**
 * ProfessionalMaskPanel - Painel de Máscaras Profissional
 *
 * Interface completa para criação e edição de máscaras,
 * inspirada no DaVinci Resolve.
 */

import React, { useState, useCallback, useMemo } from "react";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  ChevronDown,
  ChevronUp,
  Droplet,
  Circle,
  Square,
  Minus,
  Paintbrush,
  RotateCcw,
  Settings,
  Sliders,
  Edit3,
  Check,
  X,
} from "lucide-react";
import {
  Mask,
  MaskLayer,
  MaskType,
  createColorRangeMask,
  createCircularMask,
  createEllipticalMask,
  createRectangularMask,
  createLinearMask,
  createBrushMask,
  createMaskLayer,
  createDefaultLocalAdjustments,
  LocalAdjustments,
  MASK_PREVIEW_COLORS,
} from "../../types/Mask";

// ============================================
// TIPOS E INTERFACES
// ============================================

interface ProfessionalMaskPanelProps {
  maskLayers: MaskLayer[];
  selectedLayerId: string | null;
  onLayersChange: (layers: MaskLayer[]) => void;
  onSelectLayer: (id: string | null) => void;
  showMaskOverlay: boolean;
  onToggleMaskOverlay: () => void;
}

// ============================================
// SUB-COMPONENTES
// ============================================

/**
 * Slider customizado estilo DaVinci
 */
const MaskSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  accentColor?: string;
}> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  accentColor = "#f97316",
}) => {
  // Estado local para garantir UI 60fps instantânea sem esperar o processamento da imagem
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  // Sincronizar quando o valor externo mudar (ex: undo/redo), mas não durante drag
  React.useEffect(() => {
    if (!isDragging) {
      setLocalValue(value);
    }
  }, [value, isDragging]);

  const handleChange = (newValue: number) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const percentage = Math.max(
    0,
    Math.min(100, ((localValue - min) / (max - min)) * 100)
  );

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs text-gray-500 font-mono tabular-nums">
          {localValue > 0 && max > 0 && min < 0 ? "+" : ""}
          {Math.round(localValue * 100) / 100}
          {unit}
        </span>
      </div>
      <div className="relative h-5">
        {/* Barra de fundo */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-neutral-800 rounded-full overflow-hidden pointer-events-none">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${percentage}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>
        {/* Input range real (invisível mas clicável) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onPointerDown={() => setIsDragging(true)}
          onChange={(e) => handleChange(Number(e.target.value))}
          onPointerUp={() => setIsDragging(false)}
          onBlur={() => setIsDragging(false)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          style={{ touchAction: "none" }}
        />
      </div>
    </div>
  );
};

/**
 * Grupo de controles recolhível
 */
const ControlGroup: React.FC<{
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-neutral-900 hover:bg-neutral-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
            {title}
          </span>
        </div>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {isOpen && (
        <div className="p-3 space-y-3 bg-neutral-900/50">{children}</div>
      )}
    </div>
  );
};

/**
 * Item de máscara na lista
 */
const MaskLayerItem: React.FC<{
  layer: MaskLayer;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRename: (name: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}> = ({
  layer,
  isSelected,
  onSelect,
  onToggleVisibility,
  onDelete,
  onDuplicate,
  onRename,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);

  const getMaskIcon = (type: MaskType) => {
    switch (type) {
      case "color-range":
        return <Droplet size={14} />;
      case "circular":
        return <Circle size={14} />;
      case "elliptical":
        return <Circle size={14} className="scale-x-150" />;
      case "rectangular":
        return <Square size={14} />;
      case "linear":
        return <Minus size={14} className="rotate-45" />;
      case "brush":
        return <Paintbrush size={14} />;
    }
  };

  const handleSubmitRename = () => {
    onRename(editName);
    setIsEditing(false);
  };

  return (
    <div
      className={`
        group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all
        ${
          isSelected
            ? "bg-orange-500/20 border border-orange-500/50"
            : "bg-neutral-800/50 border border-transparent hover:bg-neutral-800"
        }
      `}
      onClick={onSelect}
    >
      {/* Cor de preview */}
      <div
        className="w-1 h-8 rounded-full"
        style={{ backgroundColor: layer.mask.previewColor }}
      />

      {/* Ícone do tipo */}
      <div className="text-gray-400">{getMaskIcon(layer.mask.type)}</div>

      {/* Nome */}
      {isEditing ? (
        <div
          className="flex-1 flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmitRename()}
            className="flex-1 bg-neutral-700 px-2 py-0.5 rounded text-xs text-white"
            autoFocus
          />
          <button
            onClick={handleSubmitRename}
            className="text-green-400 hover:text-green-300"
          >
            <Check size={12} />
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="text-red-400 hover:text-red-300"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <span
          className="flex-1 text-xs text-gray-300 truncate"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          {layer.name}
        </span>
      )}

      {/* Controles */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {canMoveUp && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            className="p-1 hover:bg-neutral-700 rounded"
            title="Mover para cima"
          >
            <ChevronUp size={12} />
          </button>
        )}
        {canMoveDown && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            className="p-1 hover:bg-neutral-700 rounded"
            title="Mover para baixo"
          >
            <ChevronDown size={12} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="p-1 hover:bg-neutral-700 rounded"
          title="Renomear"
        >
          <Edit3 size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 hover:bg-neutral-700 rounded"
          title="Duplicar"
        >
          <Copy size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className="p-1 hover:bg-neutral-700 rounded"
          title={layer.visible ? "Ocultar" : "Mostrar"}
        >
          {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-red-500/20 rounded text-red-400"
          title="Excluir"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const ProfessionalMaskPanel: React.FC<ProfessionalMaskPanelProps> = ({
  maskLayers,
  selectedLayerId,
  onLayersChange,
  onSelectLayer,
  showMaskOverlay,
  onToggleMaskOverlay,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const selectedLayer = useMemo(
    () => maskLayers.find((l) => l.id === selectedLayerId),
    [maskLayers, selectedLayerId]
  );

  // Handlers de criação de máscaras
  const createMask = useCallback(
    (type: MaskType) => {
      let mask: Mask;
      const colorIndex = maskLayers.length % MASK_PREVIEW_COLORS.length;

      switch (type) {
        case "color-range":
          mask = createColorRangeMask();
          break;
        case "circular":
          mask = createCircularMask();
          break;
        case "elliptical":
          mask = createEllipticalMask();
          break;
        case "rectangular":
          mask = createRectangularMask();
          break;
        case "linear":
          mask = createLinearMask();
          break;
        case "brush":
          mask = createBrushMask();
          break;
      }

      mask.previewColor = MASK_PREVIEW_COLORS[colorIndex];
      mask.order = maskLayers.length;

      const newLayer = createMaskLayer(mask);
      onLayersChange([...maskLayers, newLayer]);
      onSelectLayer(newLayer.id);
      setShowAddMenu(false);
    },
    [maskLayers, onLayersChange, onSelectLayer]
  );

  // Handlers de manipulação de camadas
  const updateLayer = useCallback(
    (id: string, updates: Partial<MaskLayer>) => {
      onLayersChange(
        maskLayers.map((l) => (l.id === id ? { ...l, ...updates } : l))
      );
    },
    [maskLayers, onLayersChange]
  );

  const updateMask = useCallback(
    (updates: Partial<Mask>) => {
      if (!selectedLayer) return;
      updateLayer(selectedLayer.id, {
        mask: { ...selectedLayer.mask, ...updates },
      });
    },
    [selectedLayer, updateLayer]
  );

  const updateAdjustments = useCallback(
    (updates: Partial<LocalAdjustments>) => {
      if (!selectedLayer) return;
      updateLayer(selectedLayer.id, {
        adjustments: { ...selectedLayer.adjustments, ...updates },
      });
    },
    [selectedLayer, updateLayer]
  );

  const deleteLayer = useCallback(
    (id: string) => {
      onLayersChange(maskLayers.filter((l) => l.id !== id));
      if (selectedLayerId === id) {
        onSelectLayer(null);
      }
    },
    [maskLayers, selectedLayerId, onLayersChange, onSelectLayer]
  );

  const duplicateLayer = useCallback(
    (layer: MaskLayer) => {
      const newMask = { ...layer.mask, id: `mask-${Date.now()}` };
      const newLayer = {
        ...layer,
        id: `layer-${Date.now()}`,
        name: `${layer.name} (cópia)`,
        mask: newMask,
      };
      onLayersChange([...maskLayers, newLayer]);
    },
    [maskLayers, onLayersChange]
  );

  const moveLayer = useCallback(
    (id: string, direction: "up" | "down") => {
      const index = maskLayers.findIndex((l) => l.id === id);
      if (index === -1) return;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= maskLayers.length) return;

      const newLayers = [...maskLayers];
      [newLayers[index], newLayers[newIndex]] = [
        newLayers[newIndex],
        newLayers[index],
      ];

      // Atualizar ordem
      newLayers.forEach((l, i) => {
        l.mask.order = i;
      });

      onLayersChange(newLayers);
    },
    [maskLayers, onLayersChange]
  );

  const resetAdjustments = useCallback(() => {
    if (!selectedLayer) return;
    updateLayer(selectedLayer.id, {
      adjustments: createDefaultLocalAdjustments(),
    });
  }, [selectedLayer, updateLayer]);

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800">
        <h2 className="text-sm font-semibold text-gray-200">Máscaras</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleMaskOverlay}
            className={`p-1.5 rounded transition-colors ${
              showMaskOverlay
                ? "bg-orange-500/20 text-orange-400"
                : "hover:bg-neutral-800 text-gray-400"
            }`}
            title="Visualizar Máscara"
          >
            <Eye size={14} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="p-1.5 rounded bg-orange-500 hover:bg-orange-600 text-white transition-colors"
              title="Adicionar Máscara"
            >
              <Plus size={14} />
            </button>

            {/* Menu de adição */}
            {showAddMenu && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="py-1">
                  <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wider">
                    Máscaras Primárias
                  </div>
                  <button
                    onClick={() => createMask("color-range")}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-800 transition-colors"
                  >
                    <Droplet size={14} className="text-orange-400" />
                    <span className="text-xs text-gray-300">
                      Máscara por Cor
                    </span>
                  </button>

                  <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wider border-t border-neutral-800 mt-1">
                    Máscaras Geométricas
                  </div>
                  <button
                    onClick={() => createMask("circular")}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-800 transition-colors"
                  >
                    <Circle size={14} className="text-cyan-400" />
                    <span className="text-xs text-gray-300">Circular</span>
                  </button>
                  <button
                    onClick={() => createMask("elliptical")}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-800 transition-colors"
                  >
                    <Circle size={14} className="text-blue-400 scale-x-150" />
                    <span className="text-xs text-gray-300">Elíptica</span>
                  </button>
                  <button
                    onClick={() => createMask("rectangular")}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-800 transition-colors"
                  >
                    <Square size={14} className="text-green-400" />
                    <span className="text-xs text-gray-300">Retangular</span>
                  </button>
                  <button
                    onClick={() => createMask("linear")}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-800 transition-colors"
                  >
                    <Minus size={14} className="text-purple-400 rotate-45" />
                    <span className="text-xs text-gray-300">
                      Linear (Graduada)
                    </span>
                  </button>

                  <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wider border-t border-neutral-800 mt-1">
                    Máscara Manual
                  </div>
                  <button
                    onClick={() => createMask("brush")}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-800 transition-colors"
                  >
                    <Paintbrush size={14} className="text-yellow-400" />
                    <span className="text-xs text-gray-300">Pincel Livre</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista de máscaras */}
      <div className="flex-shrink-0 max-h-40 overflow-y-auto border-b border-neutral-800">
        {maskLayers.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-xs">
            <Sliders size={24} className="mx-auto mb-2 opacity-50" />
            <p>Nenhuma máscara criada</p>
            <p className="text-[10px] mt-1">Clique em + para adicionar</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {maskLayers.map((layer, index) => (
              <MaskLayerItem
                key={layer.id}
                layer={layer}
                isSelected={selectedLayerId === layer.id}
                onSelect={() => onSelectLayer(layer.id)}
                onToggleVisibility={() =>
                  updateLayer(layer.id, { visible: !layer.visible })
                }
                onDelete={() => deleteLayer(layer.id)}
                onDuplicate={() => duplicateLayer(layer)}
                onRename={(name) => updateLayer(layer.id, { name })}
                onMoveUp={() => moveLayer(layer.id, "up")}
                onMoveDown={() => moveLayer(layer.id, "down")}
                canMoveUp={index > 0}
                canMoveDown={index < maskLayers.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Controles da máscara selecionada */}
      {selectedLayer && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {/* Controles Globais */}
          <ControlGroup title="Controles Globais" icon={<Settings size={12} />}>
            <MaskSlider
              label="Opacidade"
              value={Math.round(selectedLayer.mask.global.opacity * 100)}
              min={0}
              max={100}
              unit="%"
              onChange={(v) =>
                updateMask({
                  global: { ...selectedLayer.mask.global, opacity: v / 100 },
                })
              }
            />
            <MaskSlider
              label="Densidade"
              value={selectedLayer.mask.global.density}
              min={0}
              max={100}
              unit="%"
              onChange={(v) =>
                updateMask({
                  global: { ...selectedLayer.mask.global, density: v },
                })
              }
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-400">Inverter</span>
              <button
                onClick={() =>
                  updateMask({
                    global: {
                      ...selectedLayer.mask.global,
                      inverted: !selectedLayer.mask.global.inverted,
                    },
                  })
                }
                className={`w-10 h-5 rounded-full transition ${
                  selectedLayer.mask.global.inverted
                    ? "bg-orange-500"
                    : "bg-neutral-700"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    selectedLayer.mask.global.inverted
                      ? "translate-x-5"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Ativar</span>
              <button
                onClick={() =>
                  updateMask({
                    global: {
                      ...selectedLayer.mask.global,
                      enabled: !selectedLayer.mask.global.enabled,
                    },
                  })
                }
                className={`w-10 h-5 rounded-full transition ${
                  selectedLayer.mask.global.enabled
                    ? "bg-green-500"
                    : "bg-neutral-700"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    selectedLayer.mask.global.enabled
                      ? "translate-x-5"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </ControlGroup>

          {/* Controles de Refinamento */}
          <ControlGroup title="Refinamento" icon={<Sliders size={12} />}>
            <MaskSlider
              label="Feather (Suavização)"
              value={selectedLayer.mask.refinement.feather}
              min={0}
              max={100}
              onChange={(v) =>
                updateMask({
                  refinement: { ...selectedLayer.mask.refinement, feather: v },
                })
              }
              accentColor="#22c55e"
            />
            <MaskSlider
              label="Softness"
              value={selectedLayer.mask.refinement.softness}
              min={0}
              max={100}
              onChange={(v) =>
                updateMask({
                  refinement: { ...selectedLayer.mask.refinement, softness: v },
                })
              }
              accentColor="#22c55e"
            />
            <MaskSlider
              label="Falloff"
              value={selectedLayer.mask.refinement.falloff}
              min={0}
              max={100}
              onChange={(v) =>
                updateMask({
                  refinement: { ...selectedLayer.mask.refinement, falloff: v },
                })
              }
              accentColor="#8b5cf6"
            />
            <MaskSlider
              label="Blur de Borda"
              value={selectedLayer.mask.refinement.edgeBlur}
              min={0}
              max={50}
              unit="px"
              onChange={(v) =>
                updateMask({
                  refinement: { ...selectedLayer.mask.refinement, edgeBlur: v },
                })
              }
              accentColor="#3b82f6"
            />
            <MaskSlider
              label="Expansão"
              value={selectedLayer.mask.refinement.expansion}
              min={-50}
              max={50}
              unit="px"
              onChange={(v) =>
                updateMask({
                  refinement: {
                    ...selectedLayer.mask.refinement,
                    expansion: v,
                  },
                })
              }
              accentColor="#ec4899"
            />
          </ControlGroup>

          {/* Ajustes Locais - Aplicados através da máscara */}
          <ControlGroup
            title="Ajustes Locais"
            icon={<Sliders size={12} />}
            defaultOpen={true}
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={resetAdjustments}
                className="flex items-center gap-1 px-2 py-1 text-[10px] text-gray-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
              >
                <RotateCcw size={10} />
                Resetar
              </button>
            </div>

            <MaskSlider
              label="Exposição"
              value={selectedLayer.adjustments.exposure}
              min={-100}
              max={100}
              onChange={(v) => updateAdjustments({ exposure: v })}
              accentColor="#fbbf24"
            />
            <MaskSlider
              label="Contraste"
              value={selectedLayer.adjustments.contrast}
              min={-100}
              max={100}
              onChange={(v) => updateAdjustments({ contrast: v })}
            />
            <MaskSlider
              label="Saturação"
              value={selectedLayer.adjustments.saturation}
              min={-100}
              max={100}
              onChange={(v) => updateAdjustments({ saturation: v })}
              accentColor="#f97316"
            />
            <MaskSlider
              label="Temperatura"
              value={selectedLayer.adjustments.temperature}
              min={-100}
              max={100}
              onChange={(v) => updateAdjustments({ temperature: v })}
              accentColor="#f59e0b"
            />
            <MaskSlider
              label="Matiz (Hue)"
              value={selectedLayer.adjustments.hue}
              min={-180}
              max={180}
              unit="°"
              onChange={(v) => updateAdjustments({ hue: v })}
              accentColor="#10b981"
            />
            <MaskSlider
              label="Sombras"
              value={selectedLayer.adjustments.shadows}
              min={-100}
              max={100}
              onChange={(v) => updateAdjustments({ shadows: v })}
              accentColor="#6366f1"
            />
            <MaskSlider
              label="Realces"
              value={selectedLayer.adjustments.highlights}
              min={-100}
              max={100}
              onChange={(v) => updateAdjustments({ highlights: v })}
              accentColor="#f472b6"
            />
          </ControlGroup>

          {/* Controles específicos do tipo de máscara */}
          {selectedLayer.mask.type === "color-range" &&
            selectedLayer.mask.colorRange && (
              <ControlGroup
                title="Seleção por Cor (HSV)"
                icon={<Droplet size={12} />}
              >
                <div className="text-[10px] text-gray-500 mb-2">
                  Clique na imagem para selecionar uma cor
                </div>
                {selectedLayer.mask.colorRange.sampledColors.length === 0 && (
                   <div className="mb-3 px-2 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-200 flex items-center gap-2">
                      <Droplet size={12} className="text-blue-400" />
                      <span>Selecione uma cor na imagem para começar</span>
                   </div>
                )}

                {selectedLayer.mask.colorRange.sampledColors.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {selectedLayer.mask.colorRange.sampledColors.map((c, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded border border-neutral-600"
                        style={{
                          backgroundColor: `hsl(${c.h}, ${c.s}%, ${c.l}%)`,
                        }}
                        title={`H: ${Math.round(c.h)}° S: ${Math.round(
                          c.s
                        )}% L: ${Math.round(c.l)}%`}
                      />
                    ))}
                  </div>
                )}

                <MaskSlider
                  label="Hue Range"
                  value={selectedLayer.mask.colorRange.hueRange}
                  min={0}
                  max={180}
                  unit="°"
                  onChange={(v) =>
                    updateMask({
                      colorRange: {
                        ...selectedLayer.mask.colorRange!,
                        hueRange: v,
                      },
                    })
                  }
                  accentColor="#ef4444"
                />
                <MaskSlider
                  label="Hue Softness"
                  value={selectedLayer.mask.colorRange.hueSoftness}
                  min={0}
                  max={100}
                  onChange={(v) =>
                    updateMask({
                      colorRange: {
                        ...selectedLayer.mask.colorRange!,
                        hueSoftness: v,
                      },
                    })
                  }
                />
                <MaskSlider
                  label="Saturation Range"
                  value={selectedLayer.mask.colorRange.saturationRange}
                  min={0}
                  max={100}
                  onChange={(v) =>
                    updateMask({
                      colorRange: {
                        ...selectedLayer.mask.colorRange!,
                        saturationRange: v,
                      },
                    })
                  }
                  accentColor="#22c55e"
                />
                <MaskSlider
                  label="Saturation Softness"
                  value={selectedLayer.mask.colorRange.saturationSoftness}
                  min={0}
                  max={100}
                  onChange={(v) =>
                    updateMask({
                      colorRange: {
                        ...selectedLayer.mask.colorRange!,
                        saturationSoftness: v,
                      },
                    })
                  }
                />
                <MaskSlider
                  label="Luminance Range"
                  value={selectedLayer.mask.colorRange.luminanceRange}
                  min={0}
                  max={100}
                  onChange={(v) =>
                    updateMask({
                      colorRange: {
                        ...selectedLayer.mask.colorRange!,
                        luminanceRange: v,
                      },
                    })
                  }
                  accentColor="#3b82f6"
                />
                <MaskSlider
                  label="Luminance Softness"
                  value={selectedLayer.mask.colorRange.luminanceSoftness}
                  min={0}
                  max={100}
                  onChange={(v) =>
                    updateMask({
                      colorRange: {
                        ...selectedLayer.mask.colorRange!,
                        luminanceSoftness: v,
                      },
                    })
                  }
                />

                <button
                  onClick={() =>
                    updateMask({
                      colorRange: {
                        ...selectedLayer.mask.colorRange!,
                        sampledColors: [],
                      },
                    })
                  }
                  className="w-full mt-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors"
                >
                  Limpar Seleção de Cor
                </button>
              </ControlGroup>
            )}

          {/* Controles de máscara circular */}
          {selectedLayer.mask.type === "circular" &&
            selectedLayer.mask.circular && (
              <ControlGroup title="Forma Circular" icon={<Circle size={12} />}>
                <MaskSlider
                  label="Raio"
                  value={Math.round(selectedLayer.mask.circular.radius * 100)}
                  min={5}
                  max={100}
                  unit="%"
                  onChange={(v) =>
                    updateMask({
                      circular: {
                        ...selectedLayer.mask.circular!,
                        radius: v / 100,
                      },
                    })
                  }
                />
                <MaskSlider
                  label="Feather Interno"
                  value={selectedLayer.mask.circular.innerFeather}
                  min={0}
                  max={100}
                  onChange={(v) =>
                    updateMask({
                      circular: {
                        ...selectedLayer.mask.circular!,
                        innerFeather: v,
                      },
                    })
                  }
                />
                <MaskSlider
                  label="Feather Externo"
                  value={selectedLayer.mask.circular.outerFeather}
                  min={0}
                  max={100}
                  onChange={(v) =>
                    updateMask({
                      circular: {
                        ...selectedLayer.mask.circular!,
                        outerFeather: v,
                      },
                    })
                  }
                />
                <div className="text-[10px] text-gray-500 mt-2">
                  Arraste na imagem para posicionar
                </div>
              </ControlGroup>
            )}

          {/* Controles de máscara elíptica */}
          {selectedLayer.mask.type === "elliptical" &&
            selectedLayer.mask.elliptical && (
              <ControlGroup title="Forma Elíptica" icon={<Circle size={12} />}>
                <MaskSlider
                  label="Raio Horizontal"
                  value={Math.round(
                    selectedLayer.mask.elliptical.radiusX * 100
                  )}
                  min={5}
                  max={100}
                  unit="%"
                  onChange={(v) =>
                    updateMask({
                      elliptical: {
                        ...selectedLayer.mask.elliptical!,
                        radiusX: v / 100,
                      },
                    })
                  }
                />
                <MaskSlider
                  label="Raio Vertical"
                  value={Math.round(
                    selectedLayer.mask.elliptical.radiusY * 100
                  )}
                  min={5}
                  max={100}
                  unit="%"
                  onChange={(v) =>
                    updateMask({
                      elliptical: {
                        ...selectedLayer.mask.elliptical!,
                        radiusY: v / 100,
                      },
                    })
                  }
                />
                <MaskSlider
                  label="Rotação"
                  value={selectedLayer.mask.elliptical.rotation}
                  min={-180}
                  max={180}
                  unit="°"
                  onChange={(v) =>
                    updateMask({
                      elliptical: {
                        ...selectedLayer.mask.elliptical!,
                        rotation: v,
                      },
                    })
                  }
                />
                <MaskSlider
                  label="Feather Interno"
                  value={selectedLayer.mask.elliptical.innerFeather}
                  min={0}
                  max={100}
                  onChange={(v) =>
                    updateMask({
                      elliptical: {
                        ...selectedLayer.mask.elliptical!,
                        innerFeather: v,
                      },
                    })
                  }
                />
                <MaskSlider
                  label="Feather Externo"
                  value={selectedLayer.mask.elliptical.outerFeather}
                  min={0}
                  max={100}
                  onChange={(v) =>
                    updateMask({
                      elliptical: {
                        ...selectedLayer.mask.elliptical!,
                        outerFeather: v,
                      },
                    })
                  }
                />
              </ControlGroup>
            )}

          {/* Controles de máscara retangular */}
          {selectedLayer.mask.type === "rectangular" &&
            selectedLayer.mask.rectangular && (
              <ControlGroup
                title="Forma Retangular"
                icon={<Square size={12} />}
              >
                <MaskSlider
                  label="Largura"
                  value={Math.round(
                    selectedLayer.mask.rectangular.size.width * 100
                  )}
                  min={5}
                  max={100}
                  unit="%"
                  onChange={(v) =>
                    updateMask({
                      rectangular: {
                        ...selectedLayer.mask.rectangular!,
                        size: {
                          ...selectedLayer.mask.rectangular!.size,
                          width: v / 100,
                        },
                      },
                    })
                  }
                />
                <MaskSlider
                  label="Altura"
                  value={Math.round(
                    selectedLayer.mask.rectangular.size.height * 100
                  )}
                  min={5}
                  max={100}
                  unit="%"
                  onChange={(v) =>
                    updateMask({
                      rectangular: {
                        ...selectedLayer.mask.rectangular!,
                        size: {
                          ...selectedLayer.mask.rectangular!.size,
                          height: v / 100,
                        },
                      },
                    })
                  }
                />
                <MaskSlider
                  label="Rotação"
                  value={selectedLayer.mask.rectangular.rotation}
                  min={-180}
                  max={180}
                  unit="°"
                  onChange={(v) =>
                    updateMask({
                      rectangular: {
                        ...selectedLayer.mask.rectangular!,
                        rotation: v,
                      },
                    })
                  }
                />
                <MaskSlider
                  label="Cantos Arredondados"
                  value={selectedLayer.mask.rectangular.cornerRadius}
                  min={0}
                  max={100}
                  onChange={(v) =>
                    updateMask({
                      rectangular: {
                        ...selectedLayer.mask.rectangular!,
                        cornerRadius: v,
                      },
                    })
                  }
                />
                <MaskSlider
                  label="Feather"
                  value={selectedLayer.mask.rectangular.feather}
                  min={0}
                  max={100}
                  onChange={(v) =>
                    updateMask({
                      rectangular: {
                        ...selectedLayer.mask.rectangular!,
                        feather: v,
                      },
                    })
                  }
                />
              </ControlGroup>
            )}

          {/* Controles de máscara linear */}
          {selectedLayer.mask.type === "linear" &&
            selectedLayer.mask.linear && (
              <ControlGroup
                title="Gradiente Linear"
                icon={<Minus size={12} className="rotate-45" />}
              >
                <MaskSlider
                  label="Ponto Médio"
                  value={Math.round(selectedLayer.mask.linear.midpoint * 100)}
                  min={0}
                  max={100}
                  unit="%"
                  onChange={(v) =>
                    updateMask({
                      linear: {
                        ...selectedLayer.mask.linear!,
                        midpoint: v / 100,
                      },
                    })
                  }
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-400">Espelhado</span>
                  <button
                    onClick={() =>
                      updateMask({
                        linear: {
                          ...selectedLayer.mask.linear!,
                          gradientType:
                            selectedLayer.mask.linear!.gradientType === "linear"
                              ? "reflected"
                              : "linear",
                        },
                      })
                    }
                    className={`w-10 h-5 rounded-full transition ${
                      selectedLayer.mask.linear.gradientType === "reflected"
                        ? "bg-orange-500"
                        : "bg-neutral-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        selectedLayer.mask.linear.gradientType === "reflected"
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="text-[10px] text-gray-500 mt-2">
                  Arraste na imagem para definir direção
                </div>
              </ControlGroup>
            )}

          {/* Controles de pincel */}
          {selectedLayer.mask.type === "brush" && selectedLayer.mask.brush && (
            <ControlGroup title="Pincel" icon={<Paintbrush size={12} />}>
              <MaskSlider
                label="Tamanho"
                value={selectedLayer.mask.brush.brushSize}
                min={5}
                max={200}
                unit="px"
                onChange={(v) =>
                  updateMask({
                    brush: { ...selectedLayer.mask.brush!, brushSize: v },
                  })
                }
              />
              <MaskSlider
                label="Suavidade"
                value={selectedLayer.mask.brush.brushSoftness}
                min={0}
                max={100}
                onChange={(v) =>
                  updateMask({
                    brush: { ...selectedLayer.mask.brush!, brushSoftness: v },
                  })
                }
              />
              <MaskSlider
                label="Fluxo"
                value={selectedLayer.mask.brush.brushFlow}
                min={1}
                max={100}
                unit="%"
                onChange={(v) =>
                  updateMask({
                    brush: { ...selectedLayer.mask.brush!, brushFlow: v },
                  })
                }
              />
              <div className="text-[10px] text-gray-500 mt-2">
                Pinte na imagem • Shift para linha reta • Alt para apagar
              </div>
              <button
                onClick={() =>
                  updateMask({
                    brush: {
                      ...selectedLayer.mask.brush!,
                      strokes: [],
                      maskImageData: null,
                    },
                  })
                }
                className="w-full mt-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 size={12} />
                Limpar Máscara
              </button>
            </ControlGroup>
          )}
        </div>
      )}

      {/* Fechar menu quando clicar fora */}
      {showAddMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAddMenu(false)}
        />
      )}
    </div>
  );
};

export default ProfessionalMaskPanel;
