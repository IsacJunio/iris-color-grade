/**
 * Utilitários para operações de canvas
 */

/**
 * Cria um canvas offscreen para processamento
 */
export function createOffscreenCanvas(
  width: number,
  height: number
): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }
  // Fallback para navegadores sem suporte
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * Obtém contexto 2D de um canvas com opções otimizadas
 */
export function getOptimizedContext(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  options: CanvasRenderingContext2DSettings = {}
): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null {
  const defaultOptions: CanvasRenderingContext2DSettings = {
    willReadFrequently: true,
    ...options,
  };
  return canvas.getContext("2d", defaultOptions);
}

/**
 * Calcula posição do mouse/touch no canvas considerando escala
 */
export function getCanvasPosition(
  e: React.PointerEvent | React.MouseEvent,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

/**
 * Redimensiona imagem mantendo aspect ratio
 */
export function calculatePreviewDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = 1280,
  maxHeight: number = 1280
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  return { width, height };
}

/**
 * Desenha imagem em canvas com redimensionamento
 */
export function drawImageToCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  targetWidth?: number,
  targetHeight?: number
): ImageData | null {
  const ctx = getOptimizedContext(canvas);
  if (!ctx) return null;

  const width = targetWidth || image.width;
  const height = targetHeight || image.height;

  canvas.width = width;
  canvas.height = height;
  
  ctx.drawImage(image, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

/**
 * Limpa completamente um canvas
 */
export function clearCanvas(canvas: HTMLCanvasElement | OffscreenCanvas): void {
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
