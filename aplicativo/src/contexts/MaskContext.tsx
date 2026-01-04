import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { MaskLayer } from "../types/Mask";

/**
 * Interface para o contexto de máscaras profissionais
 */
export interface MaskContextValue {
  // State
  maskLayers: MaskLayer[];
  selectedMaskLayerId: string | null;
  showMaskOverlay: boolean;
  showMaskPanel: boolean;
  
  // Actions
  addMaskLayer: (maskLayer: MaskLayer) => void;
  removeMaskLayer: (id: string) => void;
  updateMaskLayer: (id: string, updates: Partial<MaskLayer>) => void;
  selectMaskLayer: (id: string | null) => void;
  setShowMaskOverlay: (show: boolean) => void;
  setShowMaskPanel: (show: boolean) => void;
  toggleMaskVisibility: (id: string) => void;
  clearMasks: () => void;
  setMaskLayers: (layers: MaskLayer[]) => void;
  
  // Helpers
  getMaskLayer: (id: string) => MaskLayer | undefined;
  getSelectedMaskLayer: () => MaskLayer | undefined;
}

const MaskContext = createContext<MaskContextValue | undefined>(undefined);

/**
 * Provider para o contexto de máscaras
 */
export function MaskProvider({ children }: { children: ReactNode }) {
  const [maskLayers, setMaskLayers] = useState<MaskLayer[]>([]);
  const [selectedMaskLayerId, setSelectedMaskLayerId] = useState<string | null>(null);
  const [showMaskOverlay, setShowMaskOverlay] = useState(false);
  const [showMaskPanel, setShowMaskPanel] = useState(false);

  const addMaskLayer = useCallback((maskLayer: MaskLayer) => {
    setMaskLayers((prev) => [...prev, maskLayer]);
  }, []);

  const removeMaskLayer = useCallback((id: string) => {
    setMaskLayers((prev) => prev.filter((m) => m.id !== id));
    
    // Se a camada removida estava selecionada, selecionar a primeira
    setSelectedMaskLayerId((prevId) => {
      if (prevId === id) {
        const remaining = maskLayers.filter((m) => m.id !== id);
        return remaining[0]?.id || null;
      }
      return prevId;
    });
  }, [maskLayers]);

  const updateMaskLayer = useCallback((id: string, updates: Partial<MaskLayer>) => {
    setMaskLayers((prev) =>
      prev.map((mask) => (mask.id === id ? { ...mask, ...updates } : mask))
    );
  }, []);

  const selectMaskLayer = useCallback((id: string | null) => {
    setSelectedMaskLayerId(id);
  }, []);

  const toggleMaskVisibility = useCallback((id: string) => {
    setMaskLayers((prev) =>
      prev.map((mask) =>
        mask.id === id ? { ...mask, visible: !mask.visible } : mask
      )
    );
  }, []);

  const clearMasks = useCallback(() => {
    setMaskLayers([]);
    setSelectedMaskLayerId(null);
  }, []);

  const getMaskLayer = useCallback(
    (id: string) => {
      return maskLayers.find((m) => m.id === id);
    },
    [maskLayers]
  );

  const getSelectedMaskLayer = useCallback(() => {
    if (!selectedMaskLayerId) return undefined;
    return maskLayers.find((m) => m.id === selectedMaskLayerId);
  }, [maskLayers, selectedMaskLayerId]);

  const value: MaskContextValue = {
    maskLayers,
    selectedMaskLayerId,
    showMaskOverlay,
    showMaskPanel,
    addMaskLayer,
    removeMaskLayer,
    updateMaskLayer,
    selectMaskLayer,
    setShowMaskOverlay,
    setShowMaskPanel,
    toggleMaskVisibility,
    clearMasks,
    setMaskLayers,
    getMaskLayer,
    getSelectedMaskLayer,
  };

  return <MaskContext.Provider value={value}>{children}</MaskContext.Provider>;
}

/**
 * Hook para usar o contexto de máscaras
 */
export function useMask(): MaskContextValue {
  const context = useContext(MaskContext);
  if (!context) {
    throw new Error("useMask must be used within MaskProvider");
  }
  return context;
}
