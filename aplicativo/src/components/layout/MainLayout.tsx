import React, { useState, useCallback } from "react";
import { useImage } from "../../contexts/ImageContext";
import { useLayer } from "../../contexts/LayerContext";
import { useMask } from "../../contexts/MaskContext";
import { useImageProcessing } from "../../hooks/useImageProcessing";
// import { LayerPanel } from "../panels/LayerPanel"; 
import { CustomPresetsPanel } from "../panels/CustomPresetsPanel";
import { ProfessionalMaskPanel } from "../masks/ProfessionalMaskPanel";
import { NodeGraph } from "../workflow/NodeGraph";
import { SettingsModal, defaultShortcuts, Shortcuts, ShortcutAction } from "../panels/SettingsModal";
import { 
  Upload, Settings, Workflow, Layers, Wand2, PanelBottomClose, PanelBottomOpen,
  Droplet, Activity, Sparkles, ScanLine, MousePointer2, Download, SplitSquareHorizontal
} from "lucide-react";
import ImageCompareSlider from "../ui/ImageCompareSlider";
import { ColorWheel } from "../color-tools/ColorWheel";
import { RGBCurves } from "../color-tools/RGBCurves";
import { Histogram } from "../color-tools/Histogram";
import { MaskCanvasOverlay } from "../canvas/MaskCanvasOverlay";
import { Layer } from "../../types/Layer";
import { MaskLayer } from "../../types/Mask";

export function MainLayout() {
  const { 
    imageSrc, 
    loadImage, 
    canvasRef,
    hiddenCanvasRef,
    zoom, 
    processedImageData,
    originalImageData
  } = useImage();
  
  const { 
    layers, 
    selectedLayerId, 
    selectLayer, 
    addLayer,
    removeLayer,
    updateLayer,
    setLayers, 
    getSelectedLayer 
  } = useLayer();

  const {
    maskLayers,
    setMaskLayers,
    updateMaskLayer, 
    selectMaskLayer,
    selectedMaskLayerId,
    showMaskOverlay,
    setShowMaskOverlay
  } = useMask();
  
  // Hook que ativa o processamento automático
  useImageProcessing();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState<Shortcuts>(defaultShortcuts);
  const [activeColorTab, setActiveColorTab] = useState<"lift" | "gamma" | "gain">("lift");
  const [compareMode, setCompareMode] = useState(false);

  const handleExport = useCallback(() => {
    if (!canvasRef.current) return;
    try {
        const link = document.createElement('a');
        link.download = `iris-export-${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL('image/png', 1.0);
        link.click();
    } catch (err) {
        console.error("Erro ao exportar:", err);
    }
  }, [canvasRef]);
  
  // Layout States
  const [activeRightTab, setActiveRightTab] = useState<"masks" | "presets">("masks");
  const [showNodeGraph, setShowNodeGraph] = useState(true);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadImage(file);
    }
  };

  const activeLayer = getSelectedLayer();

  // Update layer helper
  const updateSelectedLayer = useCallback((updates: Partial<Layer>) => {
    if (!selectedLayerId) return;
    const updatedLayers = layers.map((l) => {
      if (l.id !== selectedLayerId) return l;
      
      // Deep merge para objetos aninhados
      const merged = { ...l };
      
      if (updates.color && l.color) {
        merged.color = { ...l.color, ...updates.color };
      } else if (updates.color) {
        merged.color = updates.color;
      }
      
      if (updates.colorBalance && l.colorBalance) {
        merged.colorBalance = { ...l.colorBalance, ...updates.colorBalance };
      } else if (updates.colorBalance) {
        merged.colorBalance = updates.colorBalance;
      }
      
      if (updates.effects && l.effects) {
        merged.effects = { ...l.effects, ...updates.effects };
      } else if (updates.effects) {
        merged.effects = updates.effects;
      }
      
      if (updates.curves && l.curves) {
        merged.curves = { ...l.curves, ...updates.curves };
      } else if (updates.curves) {
        merged.curves = updates.curves;
      }
      
      // Propriedades simples
      Object.keys(updates).forEach(key => {
        if (key !== 'color' && key !== 'colorBalance' && key !== 'effects' && key !== 'curves') {
          (merged as any)[key] = (updates as any)[key];
        }
      });
      
      return merged;
    });
    setLayers(updatedLayers);
  }, [selectedLayerId, layers, setLayers]);

  // Handlers para Presets
  const handleApplyPreset = (newLayers: Layer[], newMaskLayers?: MaskLayer[]) => {
    setLayers(newLayers);
    if (newMaskLayers) {
      setMaskLayers(newMaskLayers);
    }
    // Selecionar primeira camada útil
    if (newLayers.length > 0) {
      selectLayer(newLayers[0].id);
    }
  };

  // Handler para Reorder no NodeGraph
  const handleNodeGraphReorder = (reorderedLayers: Layer[]) => {
    setLayers(reorderedLayers);
  };

  const handleRenameLayer = (id: string, newName: string) => {
    updateLayer(id, { name: newName });
  };

  const handleUpdateShortcut = (action: ShortcutAction, newKey: string) => {
    setShortcuts(prev => ({
      ...prev,
      [action]: { ...prev[action], key: newKey }
    }));
  };

  const handleResetShortcuts = () => {
    setShortcuts(defaultShortcuts);
  };

  // Mask Panel Handlers
  const handleLayersChange = (newMaskLayers: MaskLayer[]) => {
    setMaskLayers(newMaskLayers);
  };

  const handleColorSampled = (layerId: string, hsl: { h: number; s: number; l: number }) => {
    console.log("Color sampled:", layerId, hsl);
    
    const maskLayer = maskLayers.find(l => l.id === layerId);
    if (!maskLayer || maskLayer.mask.type !== 'color-range' || !maskLayer.mask.colorRange) return;

    const currentColors = maskLayer.mask.colorRange.sampledColors || [];
    
    // Evitar duplicatas exatas se possível ou limitar
    updateMaskLayer(layerId, {
        mask: {
            ...maskLayer.mask,
            colorRange: {
                ...maskLayer.mask.colorRange,
                sampledColors: [...currentColors, hsl]
            }
        }
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden font-sans">
      
      {/* --- TOP AREA (Left + Center + Right) --- */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* --- LEFT PANEL (Tools) --- */}
        <div className="w-80 flex-shrink-0 border-r border-neutral-800 bg-neutral-900/50 flex flex-col">
          <div className="p-4 border-b border-neutral-800">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-1">
              Color Grade Pro
            </h1>
            <p className="text-xs text-neutral-500">Professional Grading Suite</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {!imageSrc ? (
               <div className="text-center mt-10 text-neutral-600 text-sm">
                  Abra uma imagem para começar
               </div>
            ) : (
                <>
                  {/* COLOR TOOLS */}
                  {activeLayer?.type === "cor" && activeLayer.color && activeLayer.colorBalance && (
                     <div className="space-y-6 animate-fadeIn">
                       <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                             <Droplet size={14} />
                             Correção de Cor
                          </h3>
                       </div>

                       {/* Tabs for Lift/Gamma/Gain */}
                       <div className="flex bg-neutral-800 p-1 rounded-lg relative isolate">
                         {(["lift", "gamma", "gain"] as const).map((tab) => (
                           <button
                             key={tab}
                             onClick={() => setActiveColorTab(tab)}
                             className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all duration-300 ease-out relative z-10 ${
                               activeColorTab === tab
                                 ? "bg-neutral-600 text-white shadow-md scale-105"
                                 : "text-gray-500 hover:text-gray-300 hover:bg-neutral-700/50"
                             }`}
                           >
                             {tab}
                           </button>
                         ))}
                       </div>
        
                       {/* Main Wheel Area */}
                       <div className="flex flex-col items-center bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-inner relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                         
                         <ColorWheel
                           label={
                             activeColorTab === "lift" ? "Sombras" :
                             activeColorTab === "gamma" ? "Médios" : "Luzes"
                           }
                           color={
                             activeColorTab === "lift" ? activeLayer.colorBalance.shadows :
                             activeColorTab === "gamma" ? activeLayer.colorBalance.midtones :
                             activeLayer.colorBalance.highlights
                           }
                           onChange={(c) => {
                             if (!activeLayer.colorBalance) return;
                             const key = activeColorTab === "lift" ? "shadows" : activeColorTab === "gamma" ? "midtones" : "highlights";
                             updateSelectedLayer({ colorBalance: { ...activeLayer.colorBalance, [key]: c } });
                           }}
                           onReset={() => {
                             if (!activeLayer.colorBalance) return;
                             const key = activeColorTab === "lift" ? "shadows" : activeColorTab === "gamma" ? "midtones" : "highlights";
                             updateSelectedLayer({ colorBalance: { ...activeLayer.colorBalance, [key]: { r: 0, g: 0, b: 0 } } });
                           }}
                         />
                       </div>

                       {/* RGB Sliders for current tab */}
                       <div className="space-y-2 bg-neutral-800/30 p-3 rounded-lg border border-neutral-700">
                         <div className="text-xs font-medium text-gray-400 mb-2">Ajuste Fino RGB</div>
                         {(() => {
                           const currentKey = activeColorTab === "lift" ? "shadows" : activeColorTab === "gamma" ? "midtones" : "highlights";
                           const currentVal = activeLayer.colorBalance[currentKey];
                           
                           return (
                             <div className="space-y-2">
                               <div className="flex items-center gap-2">
                                 <span className="text-xs text-red-400 font-bold w-4">R</span>
                                 <input
                                   type="range"
                                   min="-100"
                                   max="100"
                                   value={currentVal.r}
                                   onChange={(e) => {
                                     if (!activeLayer.colorBalance) return;
                                     const newVal = Number(e.target.value);
                                     updateSelectedLayer({
                                       colorBalance: {
                                         ...activeLayer.colorBalance,
                                         [currentKey]: { ...currentVal, r: newVal }
                                       }
                                     });
                                   }}
                                   className="flex-1 h-1.5 rounded appearance-none cursor-pointer bg-neutral-700"
                                   style={{ accentColor: '#ef4444' }}
                                 />
                                 <span className="text-xs text-gray-500 w-10 text-right font-mono">{Math.round(currentVal.r)}</span>
                               </div>
                               
                               <div className="flex items-center gap-2">
                                 <span className="text-xs text-green-400 font-bold w-4">G</span>
                                 <input
                                   type="range"
                                   min="-100"
                                   max="100"
                                   value={currentVal.g}
                                   onChange={(e) => {
                                     if (!activeLayer.colorBalance) return;
                                     const newVal = Number(e.target.value);
                                     updateSelectedLayer({
                                       colorBalance: {
                                         ...activeLayer.colorBalance,
                                         [currentKey]: { ...currentVal, g: newVal }
                                       }
                                     });
                                   }}
                                   className="flex-1 h-1.5 rounded appearance-none cursor-pointer bg-neutral-700"
                                   style={{ accentColor: '#22c55e' }}
                                 />
                                 <span className="text-xs text-gray-500 w-10 text-right font-mono">{Math.round(currentVal.g)}</span>
                               </div>
                               
                               <div className="flex items-center gap-2">
                                 <span className="text-xs text-blue-400 font-bold w-4">B</span>
                                 <input
                                   type="range"
                                   min="-100"
                                   max="100"
                                   value={currentVal.b}
                                   onChange={(e) => {
                                     if (!activeLayer.colorBalance) return;
                                     const newVal = Number(e.target.value);
                                     updateSelectedLayer({
                                       colorBalance: {
                                         ...activeLayer.colorBalance,
                                         [currentKey]: { ...currentVal, b: newVal }
                                       }
                                     });
                                   }}
                                   className="flex-1 h-1.5 rounded appearance-none cursor-pointer bg-neutral-700"
                                   style={{ accentColor: '#3b82f6' }}
                                 />
                                 <span className="text-xs text-gray-500 w-10 text-right font-mono">{Math.round(currentVal.b)}</span>
                               </div>
                             </div>
                           );
                         })()}
                       </div>

                       {/* Primary Color Controls */}
                       <div className="border-t border-neutral-800 pt-4 space-y-4">
                         <div className="flex items-center gap-2">
                           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Primários</h3>
                         </div>
                         
                         <div className="space-y-3">
                           {/* Exposição */}
                           <div className="space-y-1">
                             <div className="flex justify-between items-center">
                               <span className="text-xs text-gray-400">Exposição</span>
                               <span className="text-xs text-orange-400 font-mono font-bold">{Math.round(activeLayer.color.exposure)}</span>
                             </div>
                             <input
                               type="range"
                               min="50"
                               max="150"
                               value={activeLayer.color.exposure}
                               onChange={(e) => updateSelectedLayer({ color: { ...activeLayer.color!, exposure: Number(e.target.value) } })}
                               className="w-full h-1.5 rounded appearance-none cursor-pointer bg-neutral-700"
                               style={{ accentColor: '#f97316' }}
                             />
                           </div>

                           {/* Contraste */}
                           <div className="space-y-1">
                             <div className="flex justify-between items-center">
                               <span className="text-xs text-gray-400">Contraste</span>
                               <span className="text-xs text-orange-400 font-mono font-bold">{Math.round(activeLayer.color.contrast)}</span>
                             </div>
                             <input
                               type="range"
                               min="0"
                               max="200"
                               value={activeLayer.color.contrast}
                               onChange={(e) => updateSelectedLayer({ color: { ...activeLayer.color!, contrast: Number(e.target.value) } })}
                               className="w-full h-1.5 rounded appearance-none cursor-pointer bg-neutral-700"
                               style={{ accentColor: '#f97316' }}
                             />
                           </div>

                           {/* Saturação */}
                           <div className="space-y-1">
                             <div className="flex justify-between items-center">
                               <span className="text-xs text-gray-400">Saturação</span>
                               <span className="text-xs text-orange-400 font-mono font-bold">{Math.round(activeLayer.color.saturation)}</span>
                             </div>
                             <input
                               type="range"
                               min="0"
                               max="200"
                               value={activeLayer.color.saturation}
                               onChange={(e) => updateSelectedLayer({ color: { ...activeLayer.color!, saturation: Number(e.target.value) } })}
                               className="w-full h-1.5 rounded appearance-none cursor-pointer bg-neutral-700"
                               style={{ accentColor: '#f97316' }}
                             />
                           </div>

                           {/* Temperatura */}
                           <div className="space-y-1">
                             <div className="flex justify-between items-center">
                               <span className="text-xs text-gray-400">Temperatura</span>
                               <span className="text-xs text-blue-400 font-mono font-bold">{activeLayer.color.temperature > 0 ? '+' : ''}{Math.round(activeLayer.color.temperature)}</span>
                             </div>
                             <input
                               type="range"
                               min="-100"
                               max="100"
                               value={activeLayer.color.temperature}
                               onChange={(e) => updateSelectedLayer({ color: { ...activeLayer.color!, temperature: Number(e.target.value) } })}
                               className="w-full h-1.5 rounded appearance-none cursor-pointer bg-neutral-700"
                               style={{ accentColor: '#38bdf8' }}
                             />
                           </div>
                         </div>
                       </div>
                     </div>
                  )}
        
                  {/* CURVES TOOLS */}
                  {activeLayer?.type === "curvas" && activeLayer.curves && (
                     <div className="space-y-4 animate-fadeIn">
                       <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                          <Activity size={14} />
                          Curvas RGB
                       </h3>
                       <div className="h-64 bg-neutral-900 rounded-lg p-2 border border-neutral-800">
                         <RGBCurves 
                            rgbPoints={activeLayer.curves.rgb}
                            rPoints={activeLayer.curves.r}
                            gPoints={activeLayer.curves.g}
                            bPoints={activeLayer.curves.b}
                            onRgbChange={(pts) => updateSelectedLayer({ curves: { ...activeLayer.curves!, rgb: pts } })} 
                            onRChange={(pts) => updateSelectedLayer({ curves: { ...activeLayer.curves!, r: pts } })}
                            onGChange={(pts) => updateSelectedLayer({ curves: { ...activeLayer.curves!, g: pts } })}
                            onBChange={(pts) => updateSelectedLayer({ curves: { ...activeLayer.curves!, b: pts } })}
                         />
                       </div>
                     </div>
                  )}

                  {/* EFFECTS TOOLS */}
                  {activeLayer?.type === "efeitos" && activeLayer.effects && (
                     <div className="space-y-6 animate-fadeIn">
                       <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                          <Sparkles size={14} />
                          Efeitos de Pós
                       </h3>
                       
                       <div className="space-y-4 bg-neutral-900/50 p-4 rounded-lg border border-neutral-800">
                          <div className="space-y-2">
                             <div className="flex justify-between text-xs text-gray-400">
                                <span>Granulação (Grain)</span>
                                <span>{(activeLayer.effects.grain * 100).toFixed(0)}%</span>
                             </div>
                             <input 
                               type="range" min="0" max="100" 
                               value={activeLayer.effects.grain * 100}
                               onChange={(e) => updateSelectedLayer({ effects: { ...activeLayer.effects!, grain: Number(e.target.value) / 100 } })}
                               className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                             />
                          </div>

                          <div className="space-y-2">
                             <div className="flex justify-between text-xs text-gray-400">
                                <span>Vinheta (Vignette)</span>
                                <span>{(activeLayer.effects.vignette * 100).toFixed(0)}%</span>
                             </div>
                             <input 
                               type="range" min="0" max="100" 
                               value={activeLayer.effects.vignette * 100}
                               onChange={(e) => updateSelectedLayer({ effects: { ...activeLayer.effects!, vignette: Number(e.target.value) / 100 } })}
                               className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                             />
                          </div>
                          
                          <div className="space-y-2">
                             <div className="flex justify-between text-xs text-gray-400">
                                <span>Desfoque (Blur)</span>
                                <span>{(activeLayer.effects.blur * 10).toFixed(1)}px</span>
                             </div>
                             <input 
                               type="range" min="0" max="50" step="1"
                               value={activeLayer.effects.blur * 10}
                               onChange={(e) => updateSelectedLayer({ effects: { ...activeLayer.effects!, blur: Number(e.target.value) / 10 } })}
                               className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                             />
                          </div>
                       </div>
                     </div>
                  )}
                  
                  {/* SELECTION MESSAGE */}
                  {activeLayer?.type === "selecao" && (
                      <div className="flex flex-col items-center justify-center p-6 text-center text-neutral-500 animate-fadeIn">
                          <ScanLine size={32} className="mb-2 opacity-50 text-green-400" />
                          <p className="text-sm">Configuração de Máscara</p>
                          <p className="text-xs mt-1">Utilize o painel à direita <br/>para ajustar as máscaras.</p>
                      </div>
                  )}
                  
                  {/* Fallback msg if no tools available for layer */}
                  {!activeLayer && imageSrc && (
                      <div className="flex flex-col items-center justify-center h-40 text-neutral-600 text-sm italic">
                          <MousePointer2 size={24} className="mb-2 opacity-40" />
                          Selecione um nó no fluxo<br/>para ver suas propriedades
                      </div>
                  )}
                </>
            )}
          </div>
        </div>

        {/* --- CENTER PANEL (Viewport) --- */}
        <div className="flex-1 flex flex-col relative bg-[#0a0a0a]">
          
          {/* Toolbar */}
          <div className="h-12 flex-shrink-0 border-b border-neutral-800 flex items-center px-4 justify-between bg-neutral-900/30">
             <div className="flex items-center gap-2">
               {!imageSrc && (
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium cursor-pointer transition-colors">
                    <Upload size={14} />
                    <span>Open Image</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
               )}
               {imageSrc && (
                 <label className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-xs font-medium cursor-pointer transition-colors">
                   <Upload size={14} />
                   <span>Change</span>
                   <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                 </label>
               )}
             </div>
             
             <div className="flex items-center gap-3">
               {imageSrc && (
                 <>
                    <button
                       onClick={() => setCompareMode(!compareMode)}
                       className={`p-2 rounded transition-colors ${compareMode ? 'bg-orange-500 text-white' : 'hover:bg-neutral-800 text-neutral-400'}`}
                       title="Comparar Antes/Depois"
                    >
                       <SplitSquareHorizontal size={18} />
                    </button>

                    <button
                       onClick={handleExport}
                       className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md text-xs font-bold uppercase tracking-wide transition-colors shadow-lg hover:shadow-green-500/20"
                       title="Exportar Imagem"
                    >
                       <Download size={14} />
                       Exportar
                    </button>
                    
                    <div className="w-px h-6 bg-neutral-800" />
                 </>
               )}
                <span className="text-xs text-neutral-500">{(zoom * 100).toFixed(0)}%</span>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400"
                >
                  <Settings size={16} />
                </button>
             </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-hidden flex items-center justify-center relative p-8">
             {!imageSrc ? (
               <div className="text-center text-neutral-500">
                  <div className="mb-4 flex justify-center opacity-20">
                    <Upload size={48} />
                  </div>
                  <p>Drag and drop or open an image to start</p>
               </div>
             ) : (
               <div className="relative shadow-2xl shadow-black/50" style={{ transform: `scale(${zoom})`, transition: 'transform 0.1s ease-out' }}>
                  <canvas 
                    ref={canvasRef}
                    className="block max-w-full max-h-full object-contain bg-neutral-800 transition-all"
                  />

                  {/* Comparação Slider */}
                  {compareMode && (
                    <div className="absolute inset-0 z-20">
                        <ImageCompareSlider 
                            originalImage={originalImageData} 
                            processedImage={processedImageData}
                            showSlider={true}
                        />
                    </div>
                  )}
                  
                  {/* Overlay Canvas for React-based Overlays (Masks Handles) */}
                  <div className={`absolute inset-0 pointer-events-none ${compareMode ? 'opacity-0' : 'opacity-100'}`}>
                     {processedImageData && imageSrc && (
                       <MaskCanvasOverlay
                          imageWidth={processedImageData.width}
                          imageHeight={processedImageData.height}
                          imageData={processedImageData}
                          maskLayers={maskLayers}
                          selectedLayerId={selectedMaskLayerId}
                          showMaskOverlay={showMaskOverlay}
                          onMaskUpdate={(layerId, updates) => updateMaskLayer(layerId, { mask: { ...maskLayers.find(m => m.id === layerId)?.mask, ...updates } as any })}
                          onColorSampled={handleColorSampled}
                       />
                     )}
                  </div>
               </div>
             )}
          </div>
        </div>

        {/* --- RIGHT PANEL (Unified: Masks & Presets) --- */}
        <div className="w-80 flex-shrink-0 border-l border-neutral-800 bg-neutral-900/50 flex flex-col">
          <div className="p-2 border-b border-neutral-800">
             {/* Histogram */}
             <div className="h-32 bg-neutral-950 rounded border border-neutral-800 mb-2 relative overflow-hidden flex items-center justify-center">
                {processedImageData || originalImageData ? (
                    <Histogram imageData={processedImageData || originalImageData} />
                ) : (
                    // Placeholder silencioso quando não há dados, para não poluir visualmente
                    <div className="flex items-center justify-center opacity-10">
                        <Activity size={24} />
                    </div>
                )}
             </div>
             
             {/* Tabs Header */}
             <div className="flex items-center gap-1 mt-2 bg-neutral-950/50 p-1 rounded-lg">
                <button
                   onClick={() => setActiveRightTab('masks')}
                   className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                      activeRightTab === 'masks' 
                       ? 'bg-neutral-800 text-white shadow-sm' 
                       : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
                   }`}
                >
                   <Layers size={14} />
                   <span>Máscaras</span>
                </button>
                <button
                   onClick={() => setActiveRightTab('presets')}
                   className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                      activeRightTab === 'presets' 
                       ? 'bg-neutral-800 text-white shadow-sm' 
                       : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
                   }`}
                >
                   <Wand2 size={14} />
                   <span>Presets</span>
                </button>
             </div>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col relative w-full h-full">
             {/* Tab Content */}
             {activeRightTab === 'masks' && (
                 <div className="absolute inset-0 overflow-y-auto">
                    <ProfessionalMaskPanel 
                      maskLayers={maskLayers}
                      selectedLayerId={selectedMaskLayerId}
                      onLayersChange={handleLayersChange}
                      onSelectLayer={selectMaskLayer}
                      showMaskOverlay={showMaskOverlay}
                      onToggleMaskOverlay={() => setShowMaskOverlay(!showMaskOverlay)}
                    />
                 </div>
             )}
             
             {activeRightTab === 'presets' && (
                 <div className="absolute inset-0 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-neutral-800">
                    <CustomPresetsPanel 
                      layers={layers}
                      maskLayers={maskLayers} 
                      onApplyPreset={handleApplyPreset}
                      canvasRef={canvasRef}
                      fullWidth={true}
                    />
                 </div>
             )}
          </div>
        </div>
      </div>
      
      {/* --- BOTTOM AREA (Node Graph Flow) --- */}
      {showNodeGraph && (
         <div className="h-72 flex-shrink-0 border-t border-neutral-800 bg-neutral-950 relative flex flex-col transition-all duration-300 ease-in-out">
            <div className="h-8 flex items-center justify-between px-3 bg-neutral-900 border-b border-neutral-800">
               <div className="flex items-center gap-4">
                 <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
                    <Workflow size={12} />
                    Fluxo
                 </span>
                 
                 {/* Quick Add Buttons */}
                 <div className="flex items-center gap-1 border-l border-neutral-700 pl-3">
                    <button onClick={() => addLayer('cor')} className="flex items-center gap-1.5 px-2 py-1 hover:bg-neutral-800 rounded text-xs text-neutral-400 hover:text-orange-400 transition-colors" title="Adicionar Correção de Cor">
                       <Droplet size={12} />
                       <span>Cor</span>
                    </button>
                    <button onClick={() => addLayer('curvas')} className="flex items-center gap-1.5 px-2 py-1 hover:bg-neutral-800 rounded text-xs text-neutral-400 hover:text-blue-400 transition-colors" title="Adicionar Curvas">
                       <Activity size={12} />
                       <span>Curvas</span>
                    </button>
                    <button onClick={() => addLayer('efeitos')} className="flex items-center gap-1.5 px-2 py-1 hover:bg-neutral-800 rounded text-xs text-neutral-400 hover:text-purple-400 transition-colors" title="Adicionar Efeitos">
                       <Sparkles size={12} />
                       <span>Efeitos</span>
                    </button>
                 </div>
               </div>
               
               <button 
                 onClick={() => setShowNodeGraph(false)}
                 className="p-1 hover:bg-neutral-800 rounded text-neutral-500 hover:text-white"
                 title="Ocultar Fluxo"
               >
                 <PanelBottomClose size={14} />
               </button>
            </div>
            
            <div className="flex-1 relative overflow-hidden bg-[url('https://res.cloudinary.com/di2623eet/image/upload/v1711206584/grid_pattern.png')] bg-repeat opacity-90">
               <NodeGraph 
                 layers={layers}
                 selectedLayerId={selectedLayerId}
                 onSelectLayer={selectLayer}
                 onReorderLayers={handleNodeGraphReorder}
                 onRemoveLayer={removeLayer}
                 onRenameLayer={handleRenameLayer}
               />
            </div>
         </div>
      )}

      {/* --- STATUS BAR (Toggle Flow) --- */}
      <div className={`h-6 border-t border-neutral-800 bg-neutral-900 flex items-center justify-between px-3 text-[10px] text-neutral-500 select-none ${!showNodeGraph ? 'flex' : 'hidden'}`}>
         <div className="flex items-center gap-4">
            <span>Ready</span>
            <span>{processedImageData ? `${processedImageData.width}x${processedImageData.height}` : ''}</span>
         </div>
         <button 
           onClick={() => setShowNodeGraph(true)}
           className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
         >
           <PanelBottomOpen size={12} />
           <span>Mostrar Fluxo</span>
         </button>
      </div>

      {/* Modals */}
      {isSettingsOpen && (
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          shortcuts={shortcuts}
          onUpdateShortcut={handleUpdateShortcut}
          onResetShortcuts={handleResetShortcuts}
        />
      )}
      
      {/* Hidden canvas for image processing (required by ImageContext.loadImage) */}
      <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />
      
    </div>
  );
}
``