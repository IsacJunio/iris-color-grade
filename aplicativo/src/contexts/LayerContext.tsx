import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Layer, createDefaultLayer } from "../types/Layer";

/**
 * Interface para o contexto de camadas
 */
export interface LayerContextValue {
  // State
  layers: Layer[];
  selectedLayerId: string | null;
  
  // Actions
  addLayer: (type: Layer["type"]) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  selectLayer: (id: string | null) => void;
  toggleLayerVisibility: (id: string) => void;
  reorderLayers: (startIndex: number, endIndex: number) => void;
  duplicateLayer: (id: string) => void;
  clearLayers: () => void;
  setLayers: (layers: Layer[]) => void;
  
  // Helpers
  getLayer: (id: string) => Layer | undefined;
  getSelectedLayer: () => Layer | undefined;
}

const LayerContext = createContext<LayerContextValue | undefined>(undefined);

const INITIAL_LAYER_ID = "initial-color-layer";

/**
 * Provider para o contexto de camadas
 */
export function LayerProvider({ children }: { children: ReactNode }) {
  const [layers, setLayers] = useState<Layer[]>(() => {
    const initialLayer = createDefaultLayer("cor", 0);
    initialLayer.id = INITIAL_LAYER_ID;
    initialLayer.name = "Cor Principal";
    return [initialLayer];
  });

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(INITIAL_LAYER_ID);

  const addLayer = useCallback((type: Layer["type"]) => {
    const newLayer = createDefaultLayer(type, layers.length);
    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  }, [layers.length]);

  const removeLayer = useCallback((id: string) => {
    setLayers((prev) => {
      const filtered = prev.filter((l) => l.id !== id);
      // Não permitir remover todas as camadas
      return filtered.length > 0 ? filtered : prev;
    });
    
    // Se a camada removida estava selecionada, selecionar a primeira
    setSelectedLayerId((prevId) => {
      if (prevId === id) {
        const remaining = layers.filter((l) => l.id !== id);
        return remaining[0]?.id || null;
      }
      return prevId;
    });
  }, [layers]);

  const updateLayer = useCallback((id: string, updates: Partial<Layer>) => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer))
    );
  }, []);

  const selectLayer = useCallback((id: string | null) => {
    setSelectedLayerId(id);
  }, []);

  const toggleLayerVisibility = useCallback((id: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );
  }, []);

  const reorderLayers = useCallback((startIndex: number, endIndex: number) => {
    setLayers((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const duplicateLayer = useCallback((id: string) => {
    setLayers((prev) => {
      const layer = prev.find((l) => l.id === id);
      if (!layer) return prev;

      const duplicate = {
        ...layer,
        id: `layer-${Date.now()}`,
        name: `${layer.name} (Copy)`,
      };

      return [...prev, duplicate];
    });
  }, []);

  const clearLayers = useCallback(() => {
    const initialLayer = createDefaultLayer("cor", 0);
    initialLayer.id = INITIAL_LAYER_ID;
    initialLayer.name = "Cor Principal";
    setLayers([initialLayer]);
    setSelectedLayerId(INITIAL_LAYER_ID);
  }, []);

  const getLayer = useCallback(
    (id: string) => {
      return layers.find((l) => l.id === id);
    },
    [layers]
  );

  const getSelectedLayer = useCallback(() => {
    if (!selectedLayerId) return undefined;
    return layers.find((l) => l.id === selectedLayerId);
  }, [layers, selectedLayerId]);

  const value: LayerContextValue = {
    layers,
    selectedLayerId,
    addLayer,
    removeLayer,
    updateLayer,
    selectLayer,
    toggleLayerVisibility,
    reorderLayers,
    duplicateLayer,
    clearLayers,
    setLayers,
    getLayer,
    getSelectedLayer,
  };

  return <LayerContext.Provider value={value}>{children}</LayerContext.Provider>;
}

/**
 * Hook para usar o contexto de camadas
 */
export function useLayer(): LayerContextValue {
  const context = useContext(LayerContext);
  if (!context) {
    throw new Error("useLayer must be used within LayerProvider");
  }
  return context;
}
