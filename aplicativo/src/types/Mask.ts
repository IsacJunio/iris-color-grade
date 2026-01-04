/**
 * Sistema de Máscaras Profissional - Iris Color Grade
 * Inspirado no DaVinci Resolve
 * 
 * Este módulo define todos os tipos e interfaces para o sistema
 * de máscaras profissionais, incluindo máscaras por cor, geométricas
 * e por pincel, com controles avançados de suavização.
 */

// ============================================
// TIPOS BÁSICOS
// ============================================

export interface Point2D {
  x: number;
  y: number;
}

export interface Size2D {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================
// TIPOS DE MÁSCARA
// ============================================

export type MaskType = 
  | 'color-range'    // Máscara por cor (HSV)
  | 'circular'       // Máscara circular
  | 'elliptical'     // Máscara elíptica
  | 'rectangular'    // Máscara retangular
  | 'linear'         // Máscara graduada linear
  | 'brush';         // Máscara por pincel

export type MaskBlendMode = 
  | 'add'            // Adiciona à máscara
  | 'subtract'       // Subtrai da máscara
  | 'intersect';     // Intersecção

// ============================================
// CONTROLES GLOBAIS DE MÁSCARA
// ============================================

export interface MaskGlobalControls {
  /** Opacidade geral da máscara (0-1) */
  opacity: number;
  
  /** Se a máscara está invertida */
  inverted: boolean;
  
  /** Se a máscara está ativa/habilitada */
  enabled: boolean;
  
  /** Densidade da máscara - controla intensidade geral (0-100) */
  density: number;
}

// ============================================
// CONTROLES DE PRECISÃO/REFINAMENTO
// ============================================

export interface MaskRefinementControls {
  /** Suavização de borda natural - como feather no DaVinci (0-100) */
  feather: number;
  
  /** Suavidade geral da máscara (0-100) */
  softness: number;
  
  /** Queda de intensidade nas bordas - falloff curve (0-100) */
  falloff: number;
  
  /** Blur de borda em pixels (0-50) */
  edgeBlur: number;
  
  /** Refinamento de borda - remove artefatos (0-100) */
  edgeRefinement: number;
  
  /** Expansão/Contração da máscara em pixels (-50 a +50) */
  expansion: number;
}

// ============================================
// MÁSCARA POR COR (COLOR RANGE)
// ============================================

export interface ColorRangeSettings {
  /** Centro do hue selecionado (0-360) */
  hueCenter: number;
  
  /** Range de hue ao redor do centro (0-180) */
  hueRange: number;
  
  /** Suavidade da transição de hue (0-100) */
  hueSoftness: number;
  
  /** Centro de saturação (0-100) */
  saturationCenter: number;
  
  /** Range de saturação (0-100) */
  saturationRange: number;
  
  /** Suavidade da transição de saturação (0-100) */
  saturationSoftness: number;
  
  /** Centro de luminância (0-100) */
  luminanceCenter: number;
  
  /** Range de luminância (0-100) */
  luminanceRange: number;
  
  /** Suavidade da transição de luminância (0-100) */
  luminanceSoftness: number;
  
  /** Histórico de cores selecionadas (para seleção incremental) */
  sampledColors: Array<{ h: number; s: number; l: number }>;
}

// ============================================
// MÁSCARA CIRCULAR
// ============================================

export interface CircularMaskSettings {
  /** Centro da máscara (em proporção 0-1 da imagem) */
  center: Point2D;
  
  /** Raio do círculo (em proporção da menor dimensão) */
  radius: number;
  
  /** Feather interno (0-100) - suavização para dentro */
  innerFeather: number;
  
  /** Feather externo (0-100) - suavização para fora */
  outerFeather: number;
}

// ============================================
// MÁSCARA ELÍPTICA
// ============================================

export interface EllipticalMaskSettings {
  /** Centro da elipse (em proporção 0-1) */
  center: Point2D;
  
  /** Raio horizontal (em proporção da largura) */
  radiusX: number;
  
  /** Raio vertical (em proporção da altura) */
  radiusY: number;
  
  /** Rotação em graus (-180 a +180) */
  rotation: number;
  
  /** Feather interno */
  innerFeather: number;
  
  /** Feather externo */
  outerFeather: number;
}

// ============================================
// MÁSCARA RETANGULAR
// ============================================

export interface RectangularMaskSettings {
  /** Posição do canto superior esquerdo (em proporção 0-1) */
  position: Point2D;
  
  /** Tamanho (em proporção da imagem) */
  size: Size2D;
  
  /** Rotação em graus */
  rotation: number;
  
  /** Raio dos cantos arredondados (0-100) */
  cornerRadius: number;
  
  /** Feather das bordas (0-100) */
  feather: number;
}

// ============================================
// MÁSCARA LINEAR (GRADUADA)
// ============================================

export interface LinearMaskSettings {
  /** Ponto inicial da linha de gradiente (proporção 0-1) */
  startPoint: Point2D;
  
  /** Ponto final da linha de gradiente */
  endPoint: Point2D;
  
  /** Tipo de gradiente */
  gradientType: 'linear' | 'reflected';
  
  /** Posição da transição (0-1, onde 0.5 = metade) */
  midpoint: number;
}

// ============================================
// MÁSCARA POR PINCEL
// ============================================

export interface BrushStroke {
  /** Pontos do traço */
  points: Array<{
    x: number;
    y: number;
    pressure: number;  // 0-1, pressão simulada
  }>;
  
  /** Tamanho do pincel para este traço */
  size: number;
  
  /** Se é adição ou subtração */
  mode: 'add' | 'subtract';
  
  /** Suavidade do pincel (0-100) */
  softness: number;
}

export interface BrushMaskSettings {
  /** Tamanho atual do pincel em pixels */
  brushSize: number;
  
  /** Suavidade do pincel (0-100) */
  brushSoftness: number;
  
  /** Fluxo do pincel (0-100) - quanto aplica por passada */
  brushFlow: number;
  
  /** Espaçamento entre pontos (1-100, menor = mais suave) */
  brushSpacing: number;
  
  /** Histórico de traços para undo */
  strokes: BrushStroke[];
  
  /** Canvas de máscara serializado (base64) */
  maskImageData: string | null;
  
  /** Dimensões originais da máscara */
  maskDimensions: Size2D | null;
}

// ============================================
// INTERFACE PRINCIPAL DE MÁSCARA
// ============================================

export interface Mask {
  /** ID único da máscara */
  id: string;
  
  /** Nome editável da máscara */
  name: string;
  
  /** Tipo da máscara */
  type: MaskType;
  
  /** Controles globais */
  global: MaskGlobalControls;
  
  /** Controles de refinamento */
  refinement: MaskRefinementControls;
  
  /** Configurações específicas por tipo */
  colorRange?: ColorRangeSettings;
  circular?: CircularMaskSettings;
  elliptical?: EllipticalMaskSettings;
  rectangular?: RectangularMaskSettings;
  linear?: LinearMaskSettings;
  brush?: BrushMaskSettings;
  
  /** Ordem de renderização (menor = primeiro) */
  order: number;
  
  /** Cor de preview da máscara no overlay */
  previewColor: string;
}

// ============================================
// AJUSTES LOCAIS (aplicados onde a máscara atua)
// ============================================

export interface LocalAdjustments {
  /** Exposição local (-100 a +100) */
  exposure: number;
  
  /** Contraste local (-100 a +100) */
  contrast: number;
  
  /** Saturação local (-100 a +100) */
  saturation: number;
  
  /** Shift de temperatura (-100 a +100) */
  temperature: number;
  
  /** Shift de matiz (-180 a +180) */
  hue: number;
  
  /** Sombras (-100 a +100) */
  shadows: number;
  
  /** Realces (-100 a +100) */
  highlights: number;
  
  /** Nitidez local (0 a +100) */
  sharpness: number;
}

// ============================================
// LAYER DE MÁSCARA COMPLETA
// ============================================

export interface MaskLayer {
  /** ID da camada */
  id: string;
  
  /** Nome da camada */
  name: string;
  
  /** Se está visível */
  visible: boolean;
  
  /** Máscara associada */
  mask: Mask;
  
  /** Ajustes locais aplicados através desta máscara */
  adjustments: LocalAdjustments;
}

// ============================================
// FUNÇÕES FACTORY - Criar máscaras com defaults
// ============================================

export function createDefaultGlobalControls(): MaskGlobalControls {
  return {
    opacity: 1,
    inverted: false,
    enabled: true,
    density: 100
  };
}

export function createDefaultRefinementControls(): MaskRefinementControls {
  return {
    feather: 0,
    softness: 0,
    falloff: 50,
    edgeBlur: 0,
    edgeRefinement: 0,
    expansion: 0
  };
}

export function createDefaultLocalAdjustments(): LocalAdjustments {
  return {
    exposure: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    hue: 0,
    shadows: 0,
    highlights: 0,
    sharpness: 0
  };
}

export function createColorRangeMask(id?: string): Mask {
  return {
    id: id || `mask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Máscara de Cor',
    type: 'color-range',
    global: createDefaultGlobalControls(),
    refinement: createDefaultRefinementControls(),
    colorRange: {
      hueCenter: 0,
      hueRange: 30,
      hueSoftness: 10,
      saturationCenter: 50,
      saturationRange: 50,
      saturationSoftness: 10,
      luminanceCenter: 50,
      luminanceRange: 50,
      luminanceSoftness: 10,
      sampledColors: []
    },
    order: 0,
    previewColor: '#ff6b6b'
  };
}

export function createCircularMask(id?: string): Mask {
  return {
    id: id || `mask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Máscara Circular',
    type: 'circular',
    global: createDefaultGlobalControls(),
    refinement: createDefaultRefinementControls(),
    circular: {
      center: { x: 0.5, y: 0.5 },
      radius: 0.3,
      innerFeather: 0,
      outerFeather: 20
    },
    order: 0,
    previewColor: '#4ecdc4'
  };
}

export function createEllipticalMask(id?: string): Mask {
  return {
    id: id || `mask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Máscara Elíptica',
    type: 'elliptical',
    global: createDefaultGlobalControls(),
    refinement: createDefaultRefinementControls(),
    elliptical: {
      center: { x: 0.5, y: 0.5 },
      radiusX: 0.4,
      radiusY: 0.25,
      rotation: 0,
      innerFeather: 0,
      outerFeather: 20
    },
    order: 0,
    previewColor: '#45b7d1'
  };
}

export function createRectangularMask(id?: string): Mask {
  return {
    id: id || `mask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Máscara Retangular',
    type: 'rectangular',
    global: createDefaultGlobalControls(),
    refinement: createDefaultRefinementControls(),
    rectangular: {
      position: { x: 0.25, y: 0.25 },
      size: { width: 0.5, height: 0.5 },
      rotation: 0,
      cornerRadius: 0,
      feather: 20
    },
    order: 0,
    previewColor: '#96ceb4'
  };
}

export function createLinearMask(id?: string): Mask {
  return {
    id: id || `mask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Máscara Linear',
    type: 'linear',
    global: createDefaultGlobalControls(),
    refinement: createDefaultRefinementControls(),
    linear: {
      startPoint: { x: 0.5, y: 0 },
      endPoint: { x: 0.5, y: 1 },
      gradientType: 'linear',
      midpoint: 0.5
    },
    order: 0,
    previewColor: '#dda0dd'
  };
}

export function createBrushMask(id?: string): Mask {
  return {
    id: id || `mask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Máscara por Pincel',
    type: 'brush',
    global: createDefaultGlobalControls(),
    refinement: createDefaultRefinementControls(),
    brush: {
      brushSize: 50,
      brushSoftness: 30,
      brushFlow: 75,
      brushSpacing: 10,
      strokes: [],
      maskImageData: null,
      maskDimensions: null
    },
    order: 0,
    previewColor: '#ffb347'
  };
}

export function createMaskLayer(mask: Mask): MaskLayer {
  return {
    id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: mask.name,
    visible: true,
    mask,
    adjustments: createDefaultLocalAdjustments()
  };
}

// Cores de preview para máscaras (paleta harmoniosa)
export const MASK_PREVIEW_COLORS = [
  '#ff6b6b', // Vermelho coral
  '#4ecdc4', // Turquesa
  '#45b7d1', // Azul céu
  '#96ceb4', // Verde menta
  '#dda0dd', // Lilás
  '#ffb347', // Laranja
  '#98d8c8', // Verde água
  '#f7dc6f', // Amarelo suave
  '#bb8fce', // Roxo
  '#85c1e9'  // Azul claro
];
