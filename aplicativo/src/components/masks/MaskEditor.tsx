import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Brush, Eraser, Square, Circle, Trash2 } from 'lucide-react';

export type MaskTool = 'brush' | 'eraser' | 'rectangle' | 'ellipse';

interface MaskEditorProps {
  width: number;
  height: number;
  maskData: Uint8ClampedArray | null;
  onMaskChange: (mask: Uint8ClampedArray) => void;
  isActive: boolean;
}

export const MaskEditor: React.FC<MaskEditorProps> = ({
  width,
  height,
  maskData,
  onMaskChange,
  isActive
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<MaskTool>('brush');
  const [brushSize, setBrushSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Inicializar máscara
  useEffect(() => {
    if (!canvasRef.current || width === 0 || height === 0) return;
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (maskData) {
      const clonedData = Uint8ClampedArray.from(maskData);
      const imgData = new ImageData(clonedData, width, height);
      ctx.putImageData(imgData, 0, 0);
    } else {
      ctx.clearRect(0, 0, width, height);
    }
  }, [width, height, maskData]);

  const getPos = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const drawBrush = useCallback((x: number, y: number, erase: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
    ctx.fillStyle = 'rgba(255, 100, 50, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }, [brushSize]);

  const drawLine = useCallback((x1: number, y1: number, x2: number, y2: number, erase: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
    ctx.strokeStyle = 'rgba(255, 100, 50, 0.5)';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }, [brushSize]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isActive) return;
    const pos = getPos(e);
    setIsDrawing(true);
    setStartPos(pos);
    lastPosRef.current = pos;

    if (tool === 'brush' || tool === 'eraser') {
      drawBrush(pos.x, pos.y, tool === 'eraser');
    }
  }, [isActive, tool, getPos, drawBrush]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !isActive) return;
    const pos = getPos(e);

    if ((tool === 'brush' || tool === 'eraser') && lastPosRef.current) {
      drawLine(lastPosRef.current.x, lastPosRef.current.y, pos.x, pos.y, tool === 'eraser');
      lastPosRef.current = pos;
    }
  }, [isDrawing, isActive, tool, getPos, drawLine]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);

    // Desenhar formas
    if ((tool === 'rectangle' || tool === 'ellipse') && startPos) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(255, 100, 50, 0.5)';
      
      const x = Math.min(startPos.x, pos.x);
      const y = Math.min(startPos.y, pos.y);
      const w = Math.abs(pos.x - startPos.x);
      const h = Math.abs(pos.y - startPos.y);

      if (tool === 'rectangle') {
        ctx.fillRect(x, y, w, h);
      } else {
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    setIsDrawing(false);
    setStartPos(null);
    lastPosRef.current = null;

    // Emitir máscara atualizada
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    onMaskChange(imgData.data);
  }, [isDrawing, isActive, tool, startPos, getPos, onMaskChange]);

  const clearMask = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onMaskChange(new Uint8ClampedArray(width * height * 4));
  }, [width, height, onMaskChange]);

  if (!isActive) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Máscara Manual</h3>
      
      {/* Ferramentas */}
      <div className="flex gap-1">
        <button
          onClick={() => setTool('brush')}
          className={`flex-1 py-2 rounded flex items-center justify-center gap-1 text-xs ${
            tool === 'brush' ? 'bg-orange-600' : 'bg-neutral-800 hover:bg-neutral-700'
          }`}
        >
          <Brush size={14} /> Pincel
        </button>
        <button
          onClick={() => setTool('eraser')}
          className={`flex-1 py-2 rounded flex items-center justify-center gap-1 text-xs ${
            tool === 'eraser' ? 'bg-orange-600' : 'bg-neutral-800 hover:bg-neutral-700'
          }`}
        >
          <Eraser size={14} /> Apagar
        </button>
      </div>
      
      <div className="flex gap-1">
        <button
          onClick={() => setTool('rectangle')}
          className={`flex-1 py-2 rounded flex items-center justify-center gap-1 text-xs ${
            tool === 'rectangle' ? 'bg-orange-600' : 'bg-neutral-800 hover:bg-neutral-700'
          }`}
        >
          <Square size={14} /> Retângulo
        </button>
        <button
          onClick={() => setTool('ellipse')}
          className={`flex-1 py-2 rounded flex items-center justify-center gap-1 text-xs ${
            tool === 'ellipse' ? 'bg-orange-600' : 'bg-neutral-800 hover:bg-neutral-700'
          }`}
        >
          <Circle size={14} /> Elipse
        </button>
      </div>

      {/* Tamanho do pincel */}
      {(tool === 'brush' || tool === 'eraser') && (
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Tamanho</span>
            <span className="text-xs text-gray-500">{brushSize}px</span>
          </div>
          <input
            type="range"
            min={5}
            max={100}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: '#f97316' }}
          />
        </div>
      )}

      {/* Limpar */}
      <button
        onClick={clearMask}
        className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 rounded flex items-center justify-center gap-1 text-xs text-red-400"
      >
        <Trash2 size={14} /> Limpar Máscara
      </button>

      {/* Preview Canvas (sobreposto na imagem principal) */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="absolute top-0 left-0 pointer-events-auto cursor-crosshair"
        style={{ 
          width: '100%', 
          height: '100%',
          mixBlendMode: 'multiply'
        }}
      />

      <p className="text-[10px] text-gray-500 text-center">
        Pinte a área que deseja editar
      </p>
    </div>
  );
};

// Componente wrapper para usar sobre a imagem
interface MaskOverlayProps {
  width: number;
  height: number;
  maskData: Uint8ClampedArray | null;
  onMaskChange: (mask: Uint8ClampedArray) => void;
  isActive: boolean;
  brushSize: number;
  tool: MaskTool;
}

export const MaskOverlay: React.FC<MaskOverlayProps> = ({
  width,
  height,
  maskData,
  onMaskChange,
  isActive,
  brushSize,
  tool
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!canvasRef.current || width === 0 || height === 0) return;
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (maskData && maskData.length === width * height * 4) {
      const imgData = new ImageData(new Uint8ClampedArray(maskData), width, height);
      ctx.putImageData(imgData, 0, 0);
    } else {
      ctx.clearRect(0, 0, width, height);
    }
  }, [width, height, maskData]);

  const getPos = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const emitMask = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    onMaskChange(imgData.data);
  }, [onMaskChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isActive) return;
    e.stopPropagation();
    const pos = getPos(e);
    setIsDrawing(true);
    setStartPos(pos);
    lastPosRef.current = pos;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'brush' || tool === 'eraser') {
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.fillStyle = 'rgba(255, 100, 50, 0.5)';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [isActive, tool, brushSize, getPos]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !isActive) return;
    e.stopPropagation();
    const pos = getPos(e);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if ((tool === 'brush' || tool === 'eraser') && lastPosRef.current) {
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = 'rgba(255, 100, 50, 0.5)';
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPosRef.current = pos;
    }
  }, [isDrawing, isActive, tool, brushSize, getPos]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !isActive) return;
    e.stopPropagation();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);

    if ((tool === 'rectangle' || tool === 'ellipse') && startPos) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(255, 100, 50, 0.5)';
      
      const x = Math.min(startPos.x, pos.x);
      const y = Math.min(startPos.y, pos.y);
      const w = Math.abs(pos.x - startPos.x);
      const h = Math.abs(pos.y - startPos.y);

      if (tool === 'rectangle') {
        ctx.fillRect(x, y, w, h);
      } else {
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    setIsDrawing(false);
    setStartPos(null);
    lastPosRef.current = null;
    emitMask();
  }, [isDrawing, isActive, tool, startPos, getPos, emitMask]);

  if (!isActive || width === 0 || height === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="absolute top-0 left-0 cursor-crosshair"
      style={{ 
        width: '100%', 
        height: '100%'
      }}
    />
  );
};
