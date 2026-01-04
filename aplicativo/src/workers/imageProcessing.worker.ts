/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */
import { ImageProcessorService, ProcessingData } from "../services/image/imageProcessor.service";

declare const self: DedicatedWorkerGlobalScope;

// Worker para processamento de imagem em thread separada
self.onmessage = (e: MessageEvent<ProcessingData>) => {
  try {
    const result = ImageProcessorService.processImage(e.data);
    
    // Transferir buffer de volta para thread principal
    self.postMessage({
      imageData: result,
      success: true
    }, [result.data.buffer]);
    
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : "Unknown worker error"
    });
  }
};
