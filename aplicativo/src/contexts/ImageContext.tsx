import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";

/**
 * Interface para o estado da imagem
 */
export interface ImageState {
  // Imagens
  imageSrc: string | null;
  originalImageData: ImageData | null;
  processedImageData: ImageData | null;
  fullResImageData: ImageData | null;
  
  // Canvas refs
  canvasRef: React.RefObject<HTMLCanvasElement>;
  hiddenCanvasRef: React.RefObject<HTMLCanvasElement>;
  overlayCanvasRef: React.RefObject<HTMLCanvasElement>;
  
  // UI State
  zoom: number;
  isSelectMode: boolean;
  showMask: boolean;
}

/**
 * Interface para as ações do contexto
 */
export interface ImageContextValue extends ImageState {
  // Actions
  setImageSrc: (src: string | null) => void;
  setOriginalImageData: (data: ImageData | null) => void;
  setProcessedImageData: (data: ImageData | null) => void;
  setFullResImageData: (data: ImageData | null) => void;
  setZoom: (zoom: number) => void;
  setIsSelectMode: (mode: boolean) => void;
  setShowMask: (show: boolean) => void;
  loadImage: (file: File) => Promise<void>;
  resetImage: () => void;
}

const ImageContext = createContext<ImageContextValue | undefined>(undefined);

/**
 * Provider para o contexto de imagem
 */
export function ImageProvider({ children }: { children: ReactNode }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [processedImageData, setProcessedImageData] = useState<ImageData | null>(null);
  const [fullResImageData, setFullResImageData] = useState<ImageData | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showMask, setShowMask] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const loadImage = useCallback(async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const imgSrc = event.target?.result as string;
        setImageSrc(imgSrc);

        const img = new Image();
        img.onload = () => {
          // Guardar resolução completa
          const fullResCanvas = document.createElement("canvas");
          fullResCanvas.width = img.width;
          fullResCanvas.height = img.height;
          const fullCtx = fullResCanvas.getContext("2d");
          
          if (fullCtx) {
            fullCtx.drawImage(img, 0, 0);
            setFullResImageData(fullCtx.getImageData(0, 0, img.width, img.height));
          }

          // Criar preview otimizado
          const MAX_PREVIEW_WIDTH = 1280;
          let previewW = img.width;
          let previewH = img.height;

          if (previewW > MAX_PREVIEW_WIDTH) {
            const ratio = MAX_PREVIEW_WIDTH / previewW;
            previewW = MAX_PREVIEW_WIDTH;
            previewH = Math.round(img.height * ratio);
          }

          const canvas = hiddenCanvasRef.current;
          if (canvas) {
            canvas.width = previewW;
            canvas.height = previewH;
            const ctx = canvas.getContext("2d");
            
            if (ctx) {
              ctx.drawImage(img, 0, 0, previewW, previewH);
              setOriginalImageData(ctx.getImageData(0, 0, previewW, previewH));
              setProcessedImageData(null);
            }
          }
          
          resolve();
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = imgSrc;
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }, []);

  const resetImage = useCallback(() => {
    setImageSrc(null);
    setOriginalImageData(null);
    setProcessedImageData(null);
    setFullResImageData(null);
    setZoom(1);
  }, []);

  const value: ImageContextValue = {
    // State
    imageSrc,
    originalImageData,
    processedImageData,
    fullResImageData,
    canvasRef,
    hiddenCanvasRef,
    overlayCanvasRef,
    zoom,
    isSelectMode,
    showMask,
    
    // Actions
    setImageSrc,
    setOriginalImageData,
    setProcessedImageData,
    setFullResImageData,
    setZoom,
    setIsSelectMode,
    setShowMask,
    loadImage,
    resetImage,
  };

  return <ImageContext.Provider value={value}>{children}</ImageContext.Provider>;
}

/**
 * Hook para usar o contexto de imagem
 */
export function useImage(): ImageContextValue {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImage must be used within ImageProvider");
  }
  return context;
}
