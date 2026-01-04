import React, { useState, useEffect, useRef } from "react";
import { MoveHorizontal } from "lucide-react";

interface ImageCompareSliderProps {
  originalImage: ImageData | null;
  processedImage: ImageData | null;
  className?: string;
  showSlider?: boolean; // Para ativar/desativar a comparação
}

const ImageCompareSlider: React.FC<ImageCompareSliderProps> = ({
  originalImage,
  processedImage,
  className = "",
  showSlider = false,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // 0 a 100%
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasOriginalRef = useRef<HTMLCanvasElement>(null);
  const canvasProcessedRef = useRef<HTMLCanvasElement>(null);

  // Desenhar imagens nos canvas quando disponíveis
  useEffect(() => {
    if (originalImage && canvasOriginalRef.current) {
      const cvs = canvasOriginalRef.current;
      cvs.width = originalImage.width;
      cvs.height = originalImage.height;
      const ctx = cvs.getContext("2d");
      if (ctx) ctx.putImageData(originalImage, 0, 0);
    }
  }, [originalImage]);

  useEffect(() => {
    if (processedImage && canvasProcessedRef.current) {
      const cvs = canvasProcessedRef.current;
      cvs.width = processedImage.width;
      cvs.height = processedImage.height;
      const ctx = cvs.getContext("2d");
      if (ctx) ctx.putImageData(processedImage, 0, 0);
    }
  }, [processedImage]);

  // Handlers de arrasto
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!showSlider) return;
    setIsDragging(true);
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    containerRef.current?.releasePointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  if (!originalImage || !processedImage) return null;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full select-none overflow-hidden group ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "none" }} // Evita scroll em touch devices
    >
      {/* Imagem de Fundo (PROCESSADA - Aparece onde o clip não cobre) */}
      <canvas
        ref={canvasProcessedRef}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />

      {/* Imagem de Cima (ORIGINAL - Recortada pelo Slider) */}
      {showSlider && (
        <div 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
            }}
        >
            <canvas
                ref={canvasOriginalRef}
                className="absolute inset-0 w-full h-full object-contain"
            />
            
            {/* Etiquetas Opcionais */}
            <div className="absolute top-4 left-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm border border-white/10 uppercase tracking-wider font-bold">
                Original
            </div>
        </div>
      )}
      
      {/* Etiqueta Processada (Só aparece quando não está no modo slider ou no lado direito) */}
      {showSlider && (
        <div className="absolute top-4 right-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm border border-white/10 uppercase tracking-wider font-bold pointer-events-none">
            Processada
        </div>
      )}

      {/* Linha do Slider */}
      {showSlider && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 flex items-center justify-center hover:bg-orange-400 transition-colors"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Handle (Botão central) */}
          <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-neutral-900 border-2 border-neutral-200">
            <MoveHorizontal size={16} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCompareSlider;
