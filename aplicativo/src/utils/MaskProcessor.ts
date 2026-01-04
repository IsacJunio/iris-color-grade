/**
 * MaskProcessor - Motor de Processamento de Máscaras Profissional
 * 
 * Este módulo contém toda a lógica de processamento de máscaras,
 * incluindo geração de alpha maps, suavização, refinamento e
 * aplicação de ajustes locais.
 * 
 * Inspirado no pipeline do DaVinci Resolve.
 */

import {
  Mask,
  MaskLayer,
  ColorRangeSettings,
  CircularMaskSettings,
  EllipticalMaskSettings,
  RectangularMaskSettings,
  LinearMaskSettings,
  BrushMaskSettings,
  LocalAdjustments
} from '../types/Mask';

// ============================================
// UTILIDADES DE COR
// ============================================

interface HSLColor {
  h: number;  // 0-360
  s: number;  // 0-100
  l: number;  // 0-100
}

/**
 * Converte RGB para HSL
 */
// Função interna, não exportada para evitar conflito com colorUtils
function rgbToHsl(r: number, g: number, b: number): HSLColor {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Converte HSL para RGB
 */
// Função interna
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// ============================================
// FUNÇÕES DE SUAVIZAÇÃO (FEATHER/BLUR)
// ============================================

/**
 * Aplica Gaussian Blur em um array de alpha (Float32Array)
 * Implementação otimizada com separable convolution
 */
export function applyGaussianBlur(
  alpha: Float32Array,
  width: number,
  height: number,
  radius: number
): Float32Array {
  if (radius <= 0) return alpha;
  
  // Sigma baseado no raio
  const sigma = radius / 2;
  const kernelSize = Math.ceil(radius * 2) | 1; // Ímpar
  const halfKernel = Math.floor(kernelSize / 2);
  
  // Criar kernel gaussiano
  const kernel = new Float32Array(kernelSize);
  let sum = 0;
  for (let i = 0; i < kernelSize; i++) {
    const x = i - halfKernel;
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    sum += kernel[i];
  }
  // Normalizar
  for (let i = 0; i < kernelSize; i++) {
    kernel[i] /= sum;
  }
  
  // Blur horizontal
  const temp = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let val = 0;
      for (let k = 0; k < kernelSize; k++) {
        const sx = Math.min(Math.max(x + k - halfKernel, 0), width - 1);
        val += alpha[y * width + sx] * kernel[k];
      }
      temp[y * width + x] = val;
    }
  }
  
  // Blur vertical
  const result = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let val = 0;
      for (let k = 0; k < kernelSize; k++) {
        const sy = Math.min(Math.max(y + k - halfKernel, 0), height - 1);
        val += temp[sy * width + x] * kernel[k];
      }
      result[y * width + x] = val;
    }
  }
  
  return result;
}

/**
 * Aplica expansão/contração morfológica à máscara
 */
export function applyExpansion(
  alpha: Float32Array,
  width: number,
  height: number,
  amount: number
): Float32Array {
  if (amount === 0) return alpha;
  
  const radius = Math.abs(amount);
  const result = new Float32Array(width * height);
  const dilate = amount > 0;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let extremeVal = dilate ? 0 : 1;
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          // Apenas pixels dentro do círculo de raio
          if (dx * dx + dy * dy > radius * radius) continue;
          
          const nx = Math.min(Math.max(x + dx, 0), width - 1);
          const ny = Math.min(Math.max(y + dy, 0), height - 1);
          const val = alpha[ny * width + nx];
          
          if (dilate) {
            extremeVal = Math.max(extremeVal, val);
          } else {
            extremeVal = Math.min(extremeVal, val);
          }
        }
      }
      
      result[y * width + x] = extremeVal;
    }
  }
  
  return result;
}

/**
 * Aplica falloff curve - suaviza a transição de bordas
 */
export function applyFalloff(
  alpha: Float32Array,
  falloff: number // 0-100
): Float32Array {
  if (falloff === 50) return alpha; // Linear, sem mudança
  
  const result = new Float32Array(alpha.length);
  // Converter falloff para expoente (0.5 = sqrt, 2 = quadrado)
  const gamma = falloff < 50 
    ? 1 + (50 - falloff) / 50 * 1.5  // Mais abrupto
    : 1 / (1 + (falloff - 50) / 50 * 1.5); // Mais suave
  
  for (let i = 0; i < alpha.length; i++) {
    result[i] = Math.pow(alpha[i], gamma);
  }
  
  return result;
}

/**
 * Aplica densidade - multiplica o alpha por um fator
 */
export function applyDensity(
  alpha: Float32Array,
  density: number // 0-100
): Float32Array {
  if (density === 100) return alpha;
  
  const factor = density / 100;
  const result = new Float32Array(alpha.length);
  
  for (let i = 0; i < alpha.length; i++) {
    result[i] = alpha[i] * factor;
  }
  
  return result;
}

// ============================================
// GERADORES DE MÁSCARA
// ============================================

/**
 * Gera máscara por cor (Color Range)
 */
export function generateColorRangeMask(
  imageData: ImageData,
  settings: ColorRangeSettings
): Float32Array {
  const { width, height, data } = imageData;
  const alpha = new Float32Array(width * height);
  
  // Se não há cores amostradas, retorna máscara vazia
  if (settings.sampledColors.length === 0) {
    return alpha;
  }
  
  // Calcular range efetivo baseado nas cores amostradas
  // (hueRange já contém a variação permitida ao redor do hueCenter)
  
  // Softness como fator de transição suave
  const hueSoft = settings.hueSoftness / 100 * settings.hueRange;
  const satSoft = settings.saturationSoftness / 100 * settings.saturationRange;
  const lumSoft = settings.luminanceSoftness / 100 * settings.luminanceRange;
  
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    
    const hsl = rgbToHsl(r, g, b);
    
    // Calcular match baseado na cor amostrada mais próxima
    let bestMatch = 0;

    for (const sample of settings.sampledColors) {
      // Diferença de Hue (considerando ciclo 360)
      let hueDiff = Math.abs(hsl.h - sample.h);
      if (hueDiff > 180) hueDiff = 360 - hueDiff;
      
      let hueMatch = 0;
      if (hueDiff <= settings.hueRange) {
        hueMatch = 1;
      } else if (hueDiff <= settings.hueRange + hueSoft && hueSoft > 0) {
        hueMatch = 1 - (hueDiff - settings.hueRange) / hueSoft;
      }

      // Diferença de Saturação
      const satDiff = Math.abs(hsl.s - sample.s);
      let satMatch = 0;
      if (satDiff <= settings.saturationRange) {
        satMatch = 1;
      } else if (satDiff <= settings.saturationRange + satSoft && satSoft > 0) {
        satMatch = 1 - (satDiff - settings.saturationRange) / satSoft;
      }

      // Diferença de Luminância
      const lumDiff = Math.abs(hsl.l - sample.l);
      let lumMatch = 0;
      if (lumDiff <= settings.luminanceRange) {
        lumMatch = 1;
      } else if (lumDiff <= settings.luminanceRange + lumSoft && lumSoft > 0) {
        lumMatch = 1 - (lumDiff - settings.luminanceRange) / lumSoft;
      }

      // Combinar matches (Interseção)
      const currentMatch = hueMatch * satMatch * lumMatch;
      
      // Manter o melhor match entre todas as amostras (União)
      if (currentMatch > bestMatch) {
        bestMatch = currentMatch;
      }
      
      if (bestMatch >= 1) break; // Otimização
    }

    alpha[i] = bestMatch;
  }
  
  return alpha;
}

/**
 * Gera máscara circular
 */
export function generateCircularMask(
  width: number,
  height: number,
  settings: CircularMaskSettings
): Float32Array {
  const alpha = new Float32Array(width * height);
  
  const centerX = settings.center.x * width;
  const centerY = settings.center.y * height;
  const minDim = Math.min(width, height);
  const innerRadius = settings.radius * minDim * (1 - settings.innerFeather / 100);
  const outerRadius = settings.radius * minDim * (1 + settings.outerFeather / 100);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      let val = 0;
      if (dist <= innerRadius) {
        val = 1;
      } else if (dist <= outerRadius) {
        // Transição suave entre inner e outer
        val = 1 - (dist - innerRadius) / (outerRadius - innerRadius);
      }
      
      alpha[y * width + x] = val;
    }
  }
  
  return alpha;
}

/**
 * Gera máscara elíptica
 */
export function generateEllipticalMask(
  width: number,
  height: number,
  settings: EllipticalMaskSettings
): Float32Array {
  const alpha = new Float32Array(width * height);
  
  const centerX = settings.center.x * width;
  const centerY = settings.center.y * height;
  const radiusX = settings.radiusX * width;
  const radiusY = settings.radiusY * height;
  const rotation = settings.rotation * Math.PI / 180;
  const cos = Math.cos(-rotation);
  const sin = Math.sin(-rotation);
  
  const innerScale = 1 - settings.innerFeather / 100;
  const outerScale = 1 + settings.outerFeather / 100;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Rotacionar ponto ao redor do centro
      let dx = x - centerX;
      let dy = y - centerY;
      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;
      
      // Distância normalizada na elipse
      const dist = Math.sqrt((rx * rx) / (radiusX * radiusX) + (ry * ry) / (radiusY * radiusY));
      
      let val = 0;
      if (dist <= innerScale) {
        val = 1;
      } else if (dist <= outerScale) {
        val = 1 - (dist - innerScale) / (outerScale - innerScale);
      }
      
      alpha[y * width + x] = val;
    }
  }
  
  return alpha;
}

/**
 * Gera máscara retangular
 */
export function generateRectangularMask(
  width: number,
  height: number,
  settings: RectangularMaskSettings
): Float32Array {
  const alpha = new Float32Array(width * height);
  
  const rectX = settings.position.x * width;
  const rectY = settings.position.y * height;
  const rectW = settings.size.width * width;
  const rectH = settings.size.height * height;
  const rotation = settings.rotation * Math.PI / 180;
  const cos = Math.cos(-rotation);
  const sin = Math.sin(-rotation);
  const centerX = rectX + rectW / 2;
  const centerY = rectY + rectH / 2;
  const cornerRadius = settings.cornerRadius / 100 * Math.min(rectW, rectH) / 2;
  const feather = settings.feather / 100 * Math.min(rectW, rectH) / 2;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Rotacionar ponto ao redor do centro do retângulo
      let dx = x - centerX;
      let dy = y - centerY;
      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;
      
      // Converter para coordenadas locais do retângulo (canto)
      const lx = rx + rectW / 2;
      const ly = ry + rectH / 2;
      
      // Calcular distância à borda mais próxima
      let dist = 0;
      
      // Signed distance to rounded rectangle
      const qx = Math.abs(lx - rectW / 2) - rectW / 2 + cornerRadius;
      const qy = Math.abs(ly - rectH / 2) - rectH / 2 + cornerRadius;
      
      if (qx > 0 && qy > 0) {
        dist = Math.sqrt(qx * qx + qy * qy) - cornerRadius;
      } else {
        dist = Math.max(qx, qy) - cornerRadius;
      }
      
      let val = 0;
      if (dist <= 0) {
        val = 1;
      } else if (dist <= feather && feather > 0) {
        val = 1 - dist / feather;
      }
      
      alpha[y * width + x] = val;
    }
  }
  
  return alpha;
}

/**
 * Gera máscara linear graduada
 */
export function generateLinearMask(
  width: number,
  height: number,
  settings: LinearMaskSettings
): Float32Array {
  const alpha = new Float32Array(width * height);
  
  const startX = settings.startPoint.x * width;
  const startY = settings.startPoint.y * height;
  const endX = settings.endPoint.x * width;
  const endY = settings.endPoint.y * height;
  
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length < 1) {
    // Pontos muito próximos, retorna máscara cheia
    alpha.fill(1);
    return alpha;
  }
  
  // Direção normalizada
  const nx = dx / length;
  const ny = dy / length;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Projetar ponto na linha
      const px = x - startX;
      const py = y - startY;
      const proj = px * nx + py * ny;
      
      // Normalizar para 0-1 ao longo da linha
      let t = proj / length;
      
      if (settings.gradientType === 'reflected') {
        // Espelhado: abs(t - midpoint) * 2
        t = 1 - Math.abs(t - settings.midpoint) * 2;
      } else {
        // Ajustar pelo midpoint
        if (t < settings.midpoint) {
          t = (t / settings.midpoint) * 0.5;
        } else {
          t = 0.5 + ((t - settings.midpoint) / (1 - settings.midpoint)) * 0.5;
        }
      }
      
      alpha[y * width + x] = Math.max(0, Math.min(1, t));
    }
  }
  
  return alpha;
}

/**
 * Converte dados de máscara de pincel (base64) para Float32Array
 */
export function decodeBrushMask(
  settings: BrushMaskSettings,
  targetWidth: number,
  targetHeight: number
): Float32Array {
  const alpha = new Float32Array(targetWidth * targetHeight);
  
  if (!settings.maskImageData || !settings.maskDimensions) {
    return alpha;
  }
  
  // Decodificar base64 para ImageData
  try {
    const binaryString = atob(settings.maskImageData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const srcWidth = settings.maskDimensions.width;
    const srcHeight = settings.maskDimensions.height;
    
    // Se as dimensões coincidem, copiar diretamente o canal alpha
    if (srcWidth === targetWidth && srcHeight === targetHeight) {
      for (let i = 0; i < bytes.length / 4; i++) {
        // Usar o canal vermelho ou alpha (o que tiver valor)
        alpha[i] = Math.max(bytes[i * 4], bytes[i * 4 + 3]) / 255;
      }
    } else {
      // Redimensionar usando bilinear
      const scaleX = srcWidth / targetWidth;
      const scaleY = srcHeight / targetHeight;
      
      for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
          const srcX = x * scaleX;
          const srcY = y * scaleY;
          const x0 = Math.floor(srcX);
          const y0 = Math.floor(srcY);
          const x1 = Math.min(x0 + 1, srcWidth - 1);
          const y1 = Math.min(y0 + 1, srcHeight - 1);
          const fx = srcX - x0;
          const fy = srcY - y0;
          
          const getVal = (sx: number, sy: number) => {
            const idx = (sy * srcWidth + sx) * 4;
            return Math.max(bytes[idx], bytes[idx + 3]) / 255;
          };
          
          const v00 = getVal(x0, y0);
          const v10 = getVal(x1, y0);
          const v01 = getVal(x0, y1);
          const v11 = getVal(x1, y1);
          
          alpha[y * targetWidth + x] = 
            v00 * (1 - fx) * (1 - fy) +
            v10 * fx * (1 - fy) +
            v01 * (1 - fx) * fy +
            v11 * fx * fy;
        }
      }
    }
  } catch {
    console.warn('Failed to decode brush mask data');
  }
  
  return alpha;
}

// ============================================
// PROCESSADOR PRINCIPAL
// ============================================

/**
 * Processa uma máscara completa, aplicando todos os refinamentos
 */
export function processMask(
  mask: Mask,
  imageData: ImageData | null,
  width: number,
  height: number
): Float32Array {
  let alpha: Float32Array;
  
  // 1. Gerar alpha base dependendo do tipo
  switch (mask.type) {
    case 'color-range':
      if (!imageData || !mask.colorRange) {
        alpha = new Float32Array(width * height);
      } else {
        alpha = generateColorRangeMask(imageData, mask.colorRange);
      }
      break;
      
    case 'circular':
      alpha = mask.circular 
        ? generateCircularMask(width, height, mask.circular)
        : new Float32Array(width * height);
      break;
      
    case 'elliptical':
      alpha = mask.elliptical
        ? generateEllipticalMask(width, height, mask.elliptical)
        : new Float32Array(width * height);
      break;
      
    case 'rectangular':
      alpha = mask.rectangular
        ? generateRectangularMask(width, height, mask.rectangular)
        : new Float32Array(width * height);
      break;
      
    case 'linear':
      alpha = mask.linear
        ? generateLinearMask(width, height, mask.linear)
        : new Float32Array(width * height);
      break;
      
    case 'brush':
      alpha = mask.brush
        ? decodeBrushMask(mask.brush, width, height)
        : new Float32Array(width * height);
      break;
      
    default:
      alpha = new Float32Array(width * height);
  }
  
  // 2. Aplicar refinamentos na ordem correta
  const ref = mask.refinement;
  
  // Expansão/Contração primeiro (antes de blur)
  if (ref.expansion !== 0) {
    alpha = applyExpansion(alpha, width, height, ref.expansion);
  }
  
  // Feather (blur principal)
  if (ref.feather > 0) {
    const featherRadius = ref.feather / 100 * Math.min(width, height) * 0.1;
    alpha = applyGaussianBlur(alpha, width, height, featherRadius);
  }
  
  // Softness (blur adicional leve)
  if (ref.softness > 0) {
    const softRadius = ref.softness / 100 * 10;
    alpha = applyGaussianBlur(alpha, width, height, softRadius);
  }
  
  // Edge blur
  if (ref.edgeBlur > 0) {
    alpha = applyGaussianBlur(alpha, width, height, ref.edgeBlur);
  }
  
  // Falloff curve
  if (ref.falloff !== 50) {
    alpha = applyFalloff(alpha, ref.falloff);
  }
  
  // 3. Aplicar controles globais
  const global = mask.global;
  
  // Densidade
  if (global.density !== 100) {
    alpha = applyDensity(alpha, global.density);
  }
  
  // Inversão
  if (global.inverted) {
    for (let i = 0; i < alpha.length; i++) {
      alpha[i] = 1 - alpha[i];
    }
  }
  
  // Opacidade geral
  if (global.opacity !== 1) {
    for (let i = 0; i < alpha.length; i++) {
      alpha[i] *= global.opacity;
    }
  }
  
  return alpha;
}

/**
 * Aplica ajustes locais usando a máscara como multiplicador
 */
export function applyLocalAdjustments(
  imageData: ImageData,
  alpha: Float32Array,
  adjustments: LocalAdjustments
): ImageData {
  const { width, height, data } = imageData;
  const result = new Uint8ClampedArray(data);
  
  // Verificar se há ajustes a aplicar
  const hasAdjustments = 
    adjustments.exposure !== 0 ||
    adjustments.contrast !== 0 ||
    adjustments.saturation !== 0 ||
    adjustments.temperature !== 0 ||
    adjustments.hue !== 0 ||
    adjustments.shadows !== 0 ||
    adjustments.highlights !== 0;
  
  if (!hasAdjustments) {
    return new ImageData(result, width, height);
  }
  
  for (let i = 0; i < width * height; i++) {
    const maskStrength = alpha[i];
    if (maskStrength < 0.001) continue; // Skip pixels não afetados
    
    const idx = i * 4;
    let r = data[idx];
    let g = data[idx + 1];
    let b = data[idx + 2];
    
    // Converter para HSL para alguns ajustes
    let hsl = rgbToHsl(r, g, b);
    
    // Exposure (multiplicativo)
    if (adjustments.exposure !== 0) {
      const expFactor = Math.pow(2, adjustments.exposure / 50);
      r = Math.min(255, r * expFactor);
      g = Math.min(255, g * expFactor);
      b = Math.min(255, b * expFactor);
    }
    
    // Contrast
    if (adjustments.contrast !== 0) {
      const factor = (100 + adjustments.contrast) / 100;
      r = 128 + (r - 128) * factor;
      g = 128 + (g - 128) * factor;
      b = 128 + (b - 128) * factor;
    }
    
    // Temperature (shift red/blue)
    if (adjustments.temperature !== 0) {
      const tempShift = adjustments.temperature * 0.5;
      r = Math.min(255, Math.max(0, r + tempShift));
      b = Math.min(255, Math.max(0, b - tempShift));
    }
    
    // Shadows/Highlights
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    if (adjustments.shadows !== 0) {
      const shadowWeight = Math.pow(1 - luminance, 2);
      const shadowShift = adjustments.shadows * shadowWeight * 0.5;
      r = Math.min(255, Math.max(0, r + shadowShift));
      g = Math.min(255, Math.max(0, g + shadowShift));
      b = Math.min(255, Math.max(0, b + shadowShift));
    }
    
    if (adjustments.highlights !== 0) {
      const highWeight = Math.pow(luminance, 2);
      const highShift = adjustments.highlights * highWeight * 0.5;
      r = Math.min(255, Math.max(0, r + highShift));
      g = Math.min(255, Math.max(0, g + highShift));
      b = Math.min(255, Math.max(0, b + highShift));
    }
    
    // HSL adjustments (hue, saturation)
    if (adjustments.hue !== 0 || adjustments.saturation !== 0) {
      hsl = rgbToHsl(r, g, b);
      
      let newH = hsl.h + adjustments.hue;
      if (newH < 0) newH += 360;
      if (newH >= 360) newH -= 360;
      
      let newS = hsl.s + adjustments.saturation;
      newS = Math.max(0, Math.min(100, newS));
      
      const [nr, ng, nb] = hslToRgb(newH, newS, hsl.l);
      r = nr;
      g = ng;
      b = nb;
    }
    
    // Blend com máscara
    result[idx] = Math.round(data[idx] + (r - data[idx]) * maskStrength);
    result[idx + 1] = Math.round(data[idx + 1] + (g - data[idx + 1]) * maskStrength);
    result[idx + 2] = Math.round(data[idx + 2] + (b - data[idx + 2]) * maskStrength);
  }
  
  return new ImageData(result, width, height);
}

/**
 * Processa todas as camadas de máscara
 */
export function processAllMaskLayers(
  imageData: ImageData,
  layers: MaskLayer[]
): ImageData {
  let currentData = imageData;
  
  // Ordenar por ordem
  const sortedLayers = [...layers]
    .filter(l => l.visible && l.mask.global.enabled)
    .sort((a, b) => a.mask.order - b.mask.order);
  
  for (const layer of sortedLayers) {
    const alpha = processMask(
      layer.mask,
      currentData,
      currentData.width,
      currentData.height
    );
    
    currentData = applyLocalAdjustments(currentData, alpha, layer.adjustments);
  }
  
  return currentData;
}

/**
 * Gera overlay de visualização da máscara
 */
export function generateMaskOverlay(
  alpha: Float32Array,
  width: number,
  height: number,
  color: string = '#ff6b6b'
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  
  // Parse color
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    const a = alpha[i];
    
    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    data[idx + 3] = Math.round(a * 150); // Semi-transparente
  }
  
  return new ImageData(data, width, height);
}
