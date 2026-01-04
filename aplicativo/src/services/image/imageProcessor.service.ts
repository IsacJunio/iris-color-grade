import { Layer } from "../../types/Layer";
import { MaskLayer } from "../../types/Mask";
import { processMask, applyLocalAdjustments } from "../../utils/MaskProcessor";
import { rgbToHsl, hslToRgb } from "../../utils/colorUtils";

// Constantes de Luminância (Rec. 601)
const LUM_R = 0.299;
const LUM_G = 0.587;
const LUM_B = 0.114;

// Valores máximos e mínimos
const MIN_VAL = 0;
const MAX_VAL = 255;

/**
 * Interface para os dados de processamento
 */
export interface ProcessingData {
  originalData: Uint8ClampedArray;
  width: number;
  height: number;
  layers: Layer[];
  maskLayers?: MaskLayer[];  // Opcional para nao quebrar chamadas antigas imediatamente
  selectedLayerId: string | null;
  showMask: boolean;
  // TODO: Adicionar suporte a WebGL no futuro
}

/**
 * Service responsável pelo processamento de imagem (CPU-based).
 * Centraliza a lógica de aplicação de camadas seguindo o padrão Strategy implícito.
 */
export class ImageProcessorService {
  
  /**
   * Constrói LUT (Look Up Table) para curvas de forma otimizada
   */
  private static buildCurveLUT(points: { x: number; y: number }[]): Uint8Array {
    const lut = new Uint8Array(256);
    // Sort é mutável, então copiamos o array
    const sorted = [...points].sort((a, b) => a.x - b.x);

    for (let i = 0; i < 256; i++) {
      let p1 = sorted[0];
      let p2 = sorted[sorted.length - 1];

      // Encontrar segmento correspondente
      for (let j = 0; j < sorted.length - 1; j++) {
        if (sorted[j].x <= i && sorted[j + 1].x >= i) {
          p1 = sorted[j];
          p2 = sorted[j + 1];
          break;
        }
      }

      // Interpolação Linear
      if (p2.x === p1.x) {
        lut[i] = Math.round(p1.y);
      } else {
        const t = (i - p1.x) / (p2.x - p1.x);
        lut[i] = Math.round(p1.y + t * (p2.y - p1.y));
      }
      
      // Clamp
      lut[i] = Math.max(MIN_VAL, Math.min(MAX_VAL, lut[i]));
    }
    return lut;
  }

  /**
   * Entry point do processamento. Aplica todas as camadas sequencialmente.
   */
  public static processImage(data: ProcessingData): ImageData {
    const { originalData, width, height, layers, maskLayers, selectedLayerId, showMask } = data;
    
    // Clona os dados originais para evitar mutação indesejada da fonte
    const resultBuffer = new Uint8ClampedArray(originalData);
    
    // 1. Aplicar Camadas Globais (Cor, Curvas, Efeitos)
    for (const layer of layers) {
      if (!layer.visible || layer.opacity === 0) continue;
      
      this.applyLayerStrategy(resultBuffer, layer, width, height, selectedLayerId, showMask);
    }

    // 2. Aplicar Máscaras Profissionais (Ajustes Locais)
    if (maskLayers && maskLayers.length > 0) {
      // Converter buffer atual para ImageData temporário
      let currentImageData = new ImageData(resultBuffer, width, height);

      for (const maskLayer of maskLayers) {
        if (!maskLayer.visible) continue;

        // Gerar alpha map da máscara
        const alphaMap = processMask(maskLayer.mask, currentImageData, width, height);

        // Aplicar ajustes locais usando o alpha map
        currentImageData = applyLocalAdjustments(currentImageData, alphaMap, maskLayer.adjustments);
      }

      // Copiar de volta para o buffer (pois applyLocalAdjustments retorna um novo ImageData)
      resultBuffer.set(currentImageData.data);
    }

    return new ImageData(resultBuffer, width, height);
  }

  /**
   * Roteador de estratégias de camadas
   */
  private static applyLayerStrategy(
    data: Uint8ClampedArray, 
    layer: Layer,
    width: number,
    height: number, 
    selectedLayerId: string | null, 
    showMask: boolean
  ) {
    switch (layer.type) {
      case "cor":
        if (layer.color && layer.colorBalance) {
          this.applyColorLayer(data, layer, width, height);
        }
        break;
      case "curvas":
        if (layer.curves) {
          this.applyCurvesLayer(data, layer, width, height);
        }
        break;
      case "efeitos":
        if (layer.effects) {
          this.applyEffectsLayer(data, layer, width, height);
        }
        break;
      case "selecao":
        if (layer.selection) {
          this.applySelectionLayer(data, layer, selectedLayerId, showMask);
        }
        break;
    }
  }

  private static applyColorLayer(data: Uint8ClampedArray, layer: Layer, _width: number, _height: number) {
    if (!layer.color || !layer.colorBalance) return;
    
    const { shadows, midtones, highlights } = layer.colorBalance;
    const { exposure, contrast, saturation, temperature } = layer.color;
    const opacity = layer.opacity;

    // Normalizar valores primários
    const exposureFactor = exposure / 100; // 100 = neutro
    const contrastFactor = contrast / 100; // 100 = neutro
    const saturationFactor = saturation / 100; // 100 = neutro
    const tempShift = temperature; // -100 a +100

    // Cache local variables for loop performance
    const len = data.length;
    
    for (let i = 0; i < len; i += 4) {
      const origR = data[i];
      const origG = data[i + 1];
      const origB = data[i + 2];
      
      let r = origR;
      let g = origG;
      let b = origB;

      // 1. APLICAR EXPOSURE (multiplicativo)
      r *= exposureFactor;
      g *= exposureFactor;
      b *= exposureFactor;

      // 2. APLICAR CONTRAST (em torno de 128 - ponto médio)
      const contrastAdjust = contrastFactor;
      r = ((r - 128) * contrastAdjust) + 128;
      g = ((g - 128) * contrastAdjust) + 128;
      b = ((b - 128) * contrastAdjust) + 128;

      // 3. APLICAR SATURATION
      const gray = LUM_R * r + LUM_G * g + LUM_B * b;
      r = gray + (r - gray) * saturationFactor;
      g = gray + (g - gray) * saturationFactor;
      b = gray + (b - gray) * saturationFactor;

      // 4. APLICAR TEMPERATURE (shift R/B)
      if (tempShift !== 0) {
        const tempFactor = tempShift * 0.3; // Suavizar efeito
        r += tempFactor;
        b -= tempFactor;
      }

      // 5. APLICAR COLOR BALANCE (Shadows/Midtones/Highlights)
      // Luminance para pesos (recalcular após ajustes primários)
      const luminance = (LUM_R * r + LUM_G * g + LUM_B * b) / 255;

      // Aplicar pesos de balanço
      const shadowWeight = (1 - luminance) * (1 - luminance);
      const midWeight = 1 - Math.abs(luminance - 0.5) * 2;
      const highWeight = luminance * luminance;

      // Shadows
      r += shadows.r * shadowWeight * 0.5;
      g += shadows.g * shadowWeight * 0.5;
      b += shadows.b * shadowWeight * 0.5;

      // Midtones
      r += midtones.r * midWeight * 0.5;
      g += midtones.g * midWeight * 0.5;
      b += midtones.b * midWeight * 0.5;

      // Highlights
      r += highlights.r * highWeight * 0.5;
      g += highlights.g * highWeight * 0.5;
      b += highlights.b * highWeight * 0.5;

      // 6. BLEND com opacidade da camada
      data[i] = Math.max(MIN_VAL, Math.min(MAX_VAL, origR + (r - origR) * opacity));
      data[i + 1] = Math.max(MIN_VAL, Math.min(MAX_VAL, origG + (g - origG) * opacity));
      data[i + 2] = Math.max(MIN_VAL, Math.min(MAX_VAL, origB + (b - origB) * opacity));
    }
  }

  private static applyCurvesLayer(data: Uint8ClampedArray, layer: Layer, _width: number, _height: number) {
    if (!layer.curves) return;

    const rgbLUT = this.buildCurveLUT(layer.curves.rgb);
    const rLUT = this.buildCurveLUT(layer.curves.r);
    const gLUT = this.buildCurveLUT(layer.curves.g);
    const bLUT = this.buildCurveLUT(layer.curves.b);
    
    const opacity = layer.opacity;
    const len = data.length;

    for (let i = 0; i < len; i += 4) {
      const origR = data[i];
      const origG = data[i + 1];
      const origB = data[i + 2];
      
      const r = rLUT[rgbLUT[origR]];
      const g = gLUT[rgbLUT[origG]];
      const b = bLUT[rgbLUT[origB]];

      data[i] = Math.round(origR + (r - origR) * opacity);
      data[i + 1] = Math.round(origG + (g - origG) * opacity);
      data[i + 2] = Math.round(origB + (b - origB) * opacity);
    }
  }

  private static applyEffectsLayer(data: Uint8ClampedArray, layer: Layer, width: number, height: number) {
    if (!layer.effects) return;
    
    const opacity = layer.opacity;
    const len = data.length;

    // 1. GRAIN (Film Grain)
    if (layer.effects.grain > 0) {
      const grainAmount = layer.effects.grain * 255 * opacity; // 0-255 range
      
      for (let i = 0; i < len; i += 4) {
        const noise = (Math.random() - 0.5) * grainAmount;
        data[i] = Math.max(MIN_VAL, Math.min(MAX_VAL, data[i] + noise));
        data[i + 1] = Math.max(MIN_VAL, Math.min(MAX_VAL, data[i + 1] + noise));
        data[i + 2] = Math.max(MIN_VAL, Math.min(MAX_VAL, data[i + 2] + noise));
      }
    }

    // 2. VIGNETTE (Darkening edges)
    if (layer.effects.vignette > 0) {
      const vignetteStrength = layer.effects.vignette * opacity;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

      for (let i = 0; i < len; i += 4) {
        const pixelIndex = i / 4;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const vignetteFactor = 1 - (dist / maxDist) * vignetteStrength;
        
        data[i] = Math.max(MIN_VAL, Math.min(MAX_VAL, data[i] * vignetteFactor));
        data[i + 1] = Math.max(MIN_VAL, Math.min(MAX_VAL, data[i + 1] * vignetteFactor));
        data[i + 2] = Math.max(MIN_VAL, Math.min(MAX_VAL, data[i + 2] * vignetteFactor));
      }
    }

    // 3. BLUR (Box Blur simplificado)
    // Nota: Para blur de alta qualidade, seria melhor usar Canvas filter ou WebGL
    if (layer.effects.blur > 0) {
      const blurRadius = Math.floor(layer.effects.blur * 10 * opacity); // 0-10 pixels
      
      if (blurRadius > 0) {
        // Box blur horizontal + vertical (separável)
        const tempData = new Uint8ClampedArray(data);
        
        // Blur horizontal
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, count = 0;
            
            for (let bx = -blurRadius; bx <= blurRadius; bx++) {
              const nx = x + bx;
              if (nx >= 0 && nx < width) {
                const idx = (y * width + nx) * 4;
                r += tempData[idx];
                g += tempData[idx + 1];
                b += tempData[idx + 2];
                count++;
              }
            }
            
            const i = (y * width + x) * 4;
            data[i] = r / count;
            data[i + 1] = g / count;
            data[i + 2] = b / count;
          }
        }
        
        // Blur vertical
        tempData.set(data);
        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            let r = 0, g = 0, b = 0, count = 0;
            
            for (let by = -blurRadius; by <= blurRadius; by++) {
              const ny = y + by;
              if (ny >= 0 && ny < height) {
                const idx = (ny * width + x) * 4;
                r += tempData[idx];
                g += tempData[idx + 1];
                b += tempData[idx + 2];
                count++;
              }
            }
            
            const i = (y * width + x) * 4;
            data[i] = r / count;
            data[i + 1] = g / count;
            data[i + 2] = b / count;
          }
        }
      }
    }
  }

  private static applySelectionLayer(
    data: Uint8ClampedArray, 
    layer: Layer, 
    selectedLayerId: string | null, 
    showMask: boolean
  ) {
    if (!layer.selection) return;

    const sel = layer.selection;
    const { localHue, localSaturation, localBrightness } = sel;
    const isSelected = layer.id === selectedLayerId;
    const opacity = layer.opacity;
    
    // Modo Brush (Otimizado)
    if (sel.maskMode === "brush" && sel.maskData) {
      const maskData = sel.maskData;
      const hueShift = localHue;
      
      const hasAdjustments = localHue !== 0 || localSaturation !== 0 || localBrightness !== 0;
      const shouldShowMask = showMask && isSelected;

      // Se não tem nada visual pra fazer, pula o loop
      if (!hasAdjustments && !shouldShowMask) return;

      const len = data.length;

      for (let i = 0; i < len; i += 4) {
        // Red ou Alpha channel como mask source
        const maskR = maskData[i] || 0;
        const maskAlpha = maskData[i + 3] || 0;
        const maskStrength = Math.max(maskR, maskAlpha); // 0-255

        if (maskStrength > 0) {
          const strength = (maskStrength / 255) * opacity; // 0.0-1.0
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (shouldShowMask && !hasAdjustments) {
            // Overlay Vermelho (Mask View)
            data[i] = Math.min(MAX_VAL, r + 80 * strength);
            data[i + 1] = Math.round(g * (1 - strength * 0.2));
            data[i + 2] = Math.round(b * (1 - strength * 0.2));
          } 
          else if (hasAdjustments) {
            this.applyHSLAdjustment(data, i, r, g, b, strength, hueShift, localSaturation, localBrightness, shouldShowMask);
          }
        }
      }
    } 
  }

  /**
   * Helper para ajuste HSL pixel a pixel
   */
  private static applyHSLAdjustment(
    data: Uint8ClampedArray,
    idx: number,
    r: number, g: number, b: number,
    strength: number,
    hueShift: number,
    satShift: number,
    brightShift: number,
    shouldShowMask: boolean
  ) {
    // Conversão custosa - idealmente mover para WASM/WebGL
    const pixelHsl = rgbToHsl(r, g, b);
    
    let newH = pixelHsl.h + hueShift * strength;
    let newS = pixelHsl.s + satShift * strength;
    let newL = pixelHsl.l + brightShift * strength * 0.5;

    // Fast Clamp
    if (newH < 0) newH += 360; else if (newH >= 360) newH -= 360;
    newS = newS < 0 ? 0 : (newS > 100 ? 100 : newS);
    newL = newL < 0 ? 0 : (newL > 100 ? 100 : newL);

    const [newR, newG, newB] = hslToRgb(newH, newS, newL);

    if (shouldShowMask) {
      // Blend adjusted color with mask overlay
      data[idx] = Math.min(MAX_VAL, newR + 40 * strength);
      data[idx + 1] = newG;
      data[idx + 2] = newB;
    } else {
      data[idx] = newR;
      data[idx + 1] = newG;
      data[idx + 2] = newB;
    }
  }
}
