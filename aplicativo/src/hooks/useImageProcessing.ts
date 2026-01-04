import { useEffect, useRef, useCallback } from "react";
import { useImage } from "../contexts/ImageContext";
import { useLayer } from "../contexts/LayerContext";
import { useMask } from "../contexts/MaskContext";
import { ImageProcessorService } from "../services/image/imageProcessor.service";

export function useImageProcessing() {
  const { 
    originalImageData, 
    setProcessedImageData,
    showMask,
    canvasRef
  } = useImage();
  
  const { layers, selectedLayerId } = useLayer();
  const { maskLayers } = useMask();
  
  const processingRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const processLayers = useCallback(() => {
    if (!originalImageData || !canvasRef.current) {
      console.log('[useImageProcessing] Skipping - missing data:', {
        hasOriginalData: !!originalImageData,
        hasCanvas: !!canvasRef.current
      });
      return;
    }
    
    // Evitar processamento concorrente simples (debounce via RAF)
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      // Iniciar processamento
      processingRef.current = true;

      try {
        console.log('[useImageProcessing] Starting process:', {
          imageSize: `${originalImageData.width}x${originalImageData.height}`,
          layersCount: layers.length,
          selectedLayerId
        });

        const processedData = ImageProcessorService.processImage({
          originalData: originalImageData.data,
          width: originalImageData.width,
          height: originalImageData.height,
          layers,
          maskLayers,
          selectedLayerId,
          showMask
        });

        console.log('[useImageProcessing] Processed successfully:', {
          dataLength: processedData.data.length,
          size: `${processedData.width}x${processedData.height}`
        });

        // CRÍTICO: Garantir que canvas tem as dimensões corretas ANTES de desenhar
        const canvas = canvasRef.current;
        if (canvas) {
          // Redimensionar apenas se necessário para evitar flash
          if (canvas.width !== processedData.width || canvas.height !== processedData.height) {
            canvas.width = processedData.width;
            canvas.height = processedData.height;
            console.log('[useImageProcessing] Canvas resized to:', `${canvas.width}x${canvas.height}`);
          }

          // Desenhar no canvas principal diretamente para performance
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.putImageData(processedData, 0, 0);
            console.log('[useImageProcessing] Image drawn to canvas');
          }
        }

        // Atualizar estado React para Histograma e outros componentes
        // Removido throttle para garantir atualização imediata
        setProcessedImageData(processedData);
        
      } catch (error) {
        console.error("[useImageProcessing] Error processing image:", error);
        // Tentar desenhar imagem original como fallback
        const canvas = canvasRef.current;
        if (canvas && originalImageData) {
          try {
            if (canvas.width !== originalImageData.width || canvas.height !== originalImageData.height) {
              canvas.width = originalImageData.width;
              canvas.height = originalImageData.height;
            }
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.putImageData(originalImageData, 0, 0);
              console.log('[useImageProcessing] Fallback: drawn original image');
            }
          } catch (fallbackError) {
            console.error("[useImageProcessing] Fallback draw failed:", fallbackError);
          }
        }
      } finally {
        processingRef.current = false;
        rafRef.current = null;
      }
    });

  }, [originalImageData, layers, maskLayers, selectedLayerId, showMask, canvasRef, setProcessedImageData]);

  // Trigger processamento sempre que dependências mudarem
  useEffect(() => {
    console.log('[useImageProcessing] Dependencies changed, triggering process');
    processLayers();
  }, [processLayers]);

  return {
    processLayers
  };
}
