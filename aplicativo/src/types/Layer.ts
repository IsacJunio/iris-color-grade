export interface CurvePoint {
  x: number;
  y: number;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface ColorAdjustments {
  exposure: number;
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  hue: number;
}

export interface ColorBalance {
  shadows: { r: number; g: number; b: number };
  midtones: { r: number; g: number; b: number };
  highlights: { r: number; g: number; b: number };
}

export interface CurveAdjustments {
  rgb: CurvePoint[];
  r: CurvePoint[];
  g: CurvePoint[];
  b: CurvePoint[];
}

export interface EffectAdjustments {
  vignette: number;
  sepia: number;
  blur: number;
  grain: number;
  sharpness: number;
}

export interface SelectionAdjustments {
  selectedColor: HSLColor | null;
  tolerance: number;
  localHue: number;
  localSaturation: number;
  localBrightness: number;
  // Máscara manual
  maskMode: 'color' | 'brush';
  maskData: Uint8ClampedArray | null;
  brushSize: number;
  brushTool: 'brush' | 'eraser' | 'rectangle' | 'ellipse';
}

export type LayerType = 'cor' | 'curvas' | 'efeitos' | 'selecao';

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  opacity: number;
  // Ajustes por tipo
  color?: ColorAdjustments;
  colorBalance?: ColorBalance;
  curves?: CurveAdjustments;
  effects?: EffectAdjustments;
  selection?: SelectionAdjustments;
}

export const defaultCurvePoints: CurvePoint[] = [
  { x: 0, y: 0 },
  { x: 255, y: 255 }
];

export function createDefaultLayer(type: LayerType, index: number): Layer {
  const base: Layer = {
    id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `Camada ${index + 1}`,
    type,
    visible: true,
    opacity: 1
  };

  switch (type) {
    case 'cor':
      return {
        ...base,
        name: `Cor ${index + 1}`,
        color: {
          exposure: 100,
          brightness: 100,
          contrast: 100,
          saturation: 100,
          temperature: 0,
          tint: 0,
          hue: 0
        },
        colorBalance: {
          shadows: { r: 0, g: 0, b: 0 },
          midtones: { r: 0, g: 0, b: 0 },
          highlights: { r: 0, g: 0, b: 0 }
        }
      };
    case 'curvas':
      return {
        ...base,
        name: `Curvas ${index + 1}`,
        curves: {
          rgb: [...defaultCurvePoints],
          r: [...defaultCurvePoints],
          g: [...defaultCurvePoints],
          b: [...defaultCurvePoints]
        }
      };
    case 'efeitos':
      return {
        ...base,
        name: `Efeitos ${index + 1}`,
        effects: {
          vignette: 0,
          sepia: 0,
          blur: 0,
          grain: 0,
          sharpness: 0
        }
      };
    case 'selecao':
      return {
        ...base,
        name: `Seleção ${index + 1}`,
        selection: {
          selectedColor: null,
          tolerance: 30,
          localHue: 0,
          localSaturation: 0,
          localBrightness: 0,
          maskMode: 'color' as const,
          maskData: null,
          brushSize: 30,
          brushTool: 'brush' as const
        }
      };
  }
}
