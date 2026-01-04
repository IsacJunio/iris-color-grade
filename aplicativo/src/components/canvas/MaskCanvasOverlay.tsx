/**
 * MaskCanvasOverlay - Overlay interativo para desenho e manipulação de máscaras
 * 
 * Este componente renderiza sobre a imagem e permite:
 * - Desenhar com pincel
 * - Selecionar cores com clique
 * - Manipular formas geométricas
 * - Visualizar preview da máscara
 */

import React, { useRef, useEffect, useCallback, useState, useMemo, memo } from 'react';
import {
  Mask,
  MaskLayer,
  Point2D
} from '../../types/Mask';
import {
  processMask,
  generateMaskOverlay
} from '../../utils/MaskProcessor';
import { rgbToHsl } from '../../utils/colorUtils';

// ============================================
// TIPOS
// ============================================

interface MaskCanvasOverlayProps {
  imageWidth: number;
  imageHeight: number;
  imageData: ImageData | null;
  maskLayers: MaskLayer[];
  selectedLayerId: string | null;
  showMaskOverlay: boolean;
  onMaskUpdate: (layerId: string, updates: Partial<Mask>) => void;
  onColorSampled: (layerId: string, hsl: { h: number; s: number; l: number }) => void;
}

interface DragState {
  type: 'move' | 'resize' | 'draw' | 'gradient' | null;
  startPoint: Point2D;
  currentPoint: Point2D;
  handle?: string;
}

// ============================================
// COMPONENTE PRINCIPAL (memoizado para performance)
// ============================================

const MaskCanvasOverlayComponent: React.FC<MaskCanvasOverlayProps> = ({
  imageWidth,
  imageHeight,
  imageData,
  maskLayers,
  selectedLayerId,
  showMaskOverlay,
  onMaskUpdate,
  onColorSampled
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const brushCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [dragState, setDragState] = useState<DragState>({ type: null, startPoint: { x: 0, y: 0 }, currentPoint: { x: 0, y: 0 } });
  const [cursorPos, setCursorPos] = useState<Point2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastBrushPos = useRef<Point2D | null>(null);
  
  // Refs para manter a posição original durante o drag (evita problemas de sincronização)
  const dragStartMaskPos = useRef<{ x: number; y: number } | null>(null);
  const dragStartMousePos = useRef<Point2D | null>(null);
  
  // Estado LOCAL para posição visual durante drag (não dispara reprocessamento)
  const [localDragOffset, setLocalDragOffset] = useState<{ x: number; y: number } | null>(null);
  
  // Refs para otimização de performance durante drag
  const isDraggingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const pendingUpdateRef = useRef<Partial<Mask> | null>(null);
  
  const selectedLayer = useMemo(
    () => maskLayers.find(l => l.id === selectedLayerId),
    [maskLayers, selectedLayerId]
  );
  
  // ============================================
  // INICIALIZAÇÃO DOS CANVAS
  // ============================================
  
  useEffect(() => {
    if (!canvasRef.current || !maskCanvasRef.current || !brushCanvasRef.current) return;
    if (imageWidth === 0 || imageHeight === 0) return;
    
    // Configurar dimensões
    [canvasRef.current, maskCanvasRef.current, brushCanvasRef.current].forEach(canvas => {
      canvas.width = imageWidth;
      canvas.height = imageHeight;
    });
  }, [imageWidth, imageHeight]);
  
  // ============================================
  // RENDERIZAÇÃO DA MÁSCARA OVERLAY
  // ============================================
  
  useEffect(() => {
    if (!canvasRef.current || !imageData) return;
    
    // OTIMIZAÇÃO: Não recalcular overlay durante drag ativo
    if (localDragOffset) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Limpar
    ctx.clearRect(0, 0, imageWidth, imageHeight);
    
    if (!showMaskOverlay || !selectedLayer?.mask.global.enabled) return;
    
    // Processar máscara
    const alpha = processMask(
      selectedLayer.mask,
      imageData,
      imageWidth,
      imageHeight
    );
    
    // Gerar overlay colorido
    const overlay = generateMaskOverlay(
      alpha,
      imageWidth,
      imageHeight,
      selectedLayer.mask.previewColor
    );
    
    ctx.putImageData(overlay, 0, 0);
  }, [
    imageData, 
    imageWidth, 
    imageHeight, 
    selectedLayer, 
    showMaskOverlay,
    localDragOffset // Adicionado para pular durante drag
  ]);
  
  // ============================================
  // RENDERIZAÇÃO DO CURSOR E HANDLES
  // ============================================
  
  useEffect(() => {
    if (!maskCanvasRef.current || !selectedLayer) return;
    
    const ctx = maskCanvasRef.current.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, imageWidth, imageHeight);
    
    // Desenhar handles de acordo com o tipo de máscara
    const mask = selectedLayer.mask;
    
    // Calcular offset visual durante drag (para feedback instantâneo)
    const offsetX = localDragOffset ? localDragOffset.x * imageWidth : 0;
    const offsetY = localDragOffset ? localDragOffset.y * imageHeight : 0;
    
    ctx.strokeStyle = mask.previewColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    switch (mask.type) {
      case 'circular':
        if (mask.circular) {
          // Aplicar offset visual durante drag
          const cx = mask.circular.center.x * imageWidth + offsetX;
          const cy = mask.circular.center.y * imageHeight + offsetY;
          const r = mask.circular.radius * Math.min(imageWidth, imageHeight);
          
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          
          // Handle central
          ctx.setLineDash([]);
          ctx.fillStyle = mask.previewColor;
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(cx, cy, 4, 0, Math.PI * 2);
          ctx.fill();
          
          // Handle de raio
          ctx.fillStyle = mask.previewColor;
          ctx.beginPath();
          ctx.arc(cx + r, cy, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(cx + r, cy, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'elliptical':
        if (mask.elliptical) {
          // Aplicar offset visual durante drag
          const cxE = mask.elliptical.center.x * imageWidth + offsetX;
          const cyE = mask.elliptical.center.y * imageHeight + offsetY;
          const rx = mask.elliptical.radiusX * imageWidth;
          const ry = mask.elliptical.radiusY * imageHeight;
          const rot = mask.elliptical.rotation * Math.PI / 180;
          
          ctx.save();
          ctx.translate(cxE, cyE);
          ctx.rotate(rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          
          // Handles
          ctx.setLineDash([]);
          
          // Centro
          ctx.fillStyle = mask.previewColor;
          ctx.beginPath();
          ctx.arc(cxE, cyE, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(cxE, cyE, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'rectangular':
        if (mask.rectangular) {
          // Aplicar offset visual durante drag
          const x = mask.rectangular.position.x * imageWidth + offsetX;
          const y = mask.rectangular.position.y * imageHeight + offsetY;
          const w = mask.rectangular.size.width * imageWidth;
          const h = mask.rectangular.size.height * imageHeight;
          const rotR = mask.rectangular.rotation * Math.PI / 180;
          
          ctx.save();
          ctx.translate(x + w/2, y + h/2);
          ctx.rotate(rotR);
          ctx.strokeRect(-w/2, -h/2, w, h);
          ctx.restore();
          
          // Handle central
          ctx.setLineDash([]);
          const cxRect = x + w/2;
          const cyRect = y + h/2;
          ctx.fillStyle = mask.previewColor;
          ctx.beginPath();
          ctx.arc(cxRect, cyRect, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(cxRect, cyRect, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'linear':
        if (mask.linear) {
          // Aplicar offset visual durante drag
          const sx = mask.linear.startPoint.x * imageWidth + offsetX;
          const sy = mask.linear.startPoint.y * imageHeight + offsetY;
          const ex = mask.linear.endPoint.x * imageWidth + offsetX;
          const ey = mask.linear.endPoint.y * imageHeight + offsetY;
          
          // Linha de gradiente
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
          
          // Handles
          ctx.setLineDash([]);
          
          // Start
          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.arc(sx, sy, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(sx, sy, 5, 0, Math.PI * 2);
          ctx.fill();
          
          // End
          ctx.fillStyle = '#f87171';
          ctx.beginPath();
          ctx.arc(ex, ey, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(ex, ey, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'brush':
        // Desenhar cursor do pincel
        if (cursorPos && mask.brush) {
          const size = mask.brush.brushSize;
          
          ctx.setLineDash([]);
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cursorPos.x, cursorPos.y, size / 2, 0, Math.PI * 2);
          ctx.stroke();
          
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cursorPos.x, cursorPos.y, size / 2 + 1, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
    }
  }, [selectedLayer, imageWidth, imageHeight, cursorPos, maskLayers, localDragOffset]);
  
  // ============================================
  // HANDLERS DE INTERAÇÃO
  // ============================================
  
  const getCanvasPos = useCallback((e: React.PointerEvent | React.MouseEvent): Point2D => {
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
  
  const handleMouseDown = useCallback((e: React.PointerEvent) => {
    if (!selectedLayer || !imageData) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    
    const pos = getCanvasPos(e);
    const mask = selectedLayer.mask;
    
    // Seleção de cor
    if (mask.type === 'color-range') {
      const x = Math.floor(pos.x);
      const y = Math.floor(pos.y);
      
      if (x >= 0 && x < imageWidth && y >= 0 && y < imageHeight) {
        const idx = (y * imageWidth + x) * 4;
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];
        
        const hsl = rgbToHsl(r, g, b);
        onColorSampled(selectedLayer.id, hsl);
      }
      return;
    }
    
    // Pincel
    if (mask.type === 'brush' && mask.brush) {
      setIsDrawing(true);
      lastBrushPos.current = pos;
      
      // Desenhar ponto inicial
      drawBrushStroke(pos, pos, mask.brush.brushSize, mask.brush.brushSoftness, e.altKey);
      return;
    }
    
    // Máscaras geométricas - iniciar drag
    // Salvar posição inicial do mouse e da máscara nos refs
    dragStartMousePos.current = pos;
    
    // Salvar posição original da máscara baseado no tipo
    switch (mask.type) {
      case 'circular':
        if (mask.circular) {
          dragStartMaskPos.current = { x: mask.circular.center.x, y: mask.circular.center.y };
        }
        break;
      case 'elliptical':
        if (mask.elliptical) {
          dragStartMaskPos.current = { x: mask.elliptical.center.x, y: mask.elliptical.center.y };
        }
        break;
      case 'rectangular':
        if (mask.rectangular) {
          dragStartMaskPos.current = { x: mask.rectangular.position.x, y: mask.rectangular.position.y };
        }
        break;
      case 'linear':
        if (mask.linear) {
          dragStartMaskPos.current = { x: mask.linear.startPoint.x, y: mask.linear.startPoint.y };
        }
        break;
    }
    
    setDragState({
      type: 'move',
      startPoint: pos,
      currentPoint: pos
    });
    
  }, [selectedLayer, imageData, imageWidth, imageHeight, getCanvasPos, onColorSampled]);
  
  const handleMouseMove = useCallback((e: React.PointerEvent) => {
    const pos = getCanvasPos(e);
    setCursorPos(pos);
    
    if (!selectedLayer) return;
    
    const mask = selectedLayer.mask;
    
    // Desenho com pincel
    if (isDrawing && mask.type === 'brush' && mask.brush && lastBrushPos.current) {
      drawBrushStroke(
        lastBrushPos.current, 
        pos, 
        mask.brush.brushSize, 
        mask.brush.brushSoftness,
        e.altKey
      );
      lastBrushPos.current = pos;
      return;
    }
    
    // Drag de máscara geométrica - APENAS atualiza visualização local (sem reprocessar imagem)
    if (dragState.type === 'move' && dragStartMousePos.current && dragStartMaskPos.current) {
      isDraggingRef.current = true;
      
      // Calcular deslocamento em pixels (para visualização imediata)
      const dx = (pos.x - dragStartMousePos.current.x) / imageWidth;
      const dy = (pos.y - dragStartMousePos.current.y) / imageHeight;
      
      // Atualizar APENAS o estado visual local (não dispara reprocessamento!)
      setLocalDragOffset({ x: dx, y: dy });
      
      // Preparar a atualização final para quando soltar o mouse
      const newX = dragStartMaskPos.current.x + dx;
      const newY = dragStartMaskPos.current.y + dy;
      
      switch (mask.type) {
        case 'circular':
          if (mask.circular) {
            pendingUpdateRef.current = {
              circular: {
                ...mask.circular,
                center: {
                  x: Math.max(0, Math.min(1, newX)),
                  y: Math.max(0, Math.min(1, newY))
                }
              }
            };
          }
          break;
          
        case 'elliptical':
          if (mask.elliptical) {
            pendingUpdateRef.current = {
              elliptical: {
                ...mask.elliptical,
                center: {
                  x: Math.max(0, Math.min(1, newX)),
                  y: Math.max(0, Math.min(1, newY))
                }
              }
            };
          }
          break;
          
        case 'rectangular':
          if (mask.rectangular) {
            pendingUpdateRef.current = {
              rectangular: {
                ...mask.rectangular,
                position: {
                  x: Math.max(0, Math.min(1 - mask.rectangular.size.width, newX)),
                  y: Math.max(0, Math.min(1 - mask.rectangular.size.height, newY))
                }
              }
            };
          }
          break;
          
        case 'linear':
          if (mask.linear) {
            const endDx = mask.linear.endPoint.x - mask.linear.startPoint.x;
            const endDy = mask.linear.endPoint.y - mask.linear.startPoint.y;
            
            pendingUpdateRef.current = {
              linear: {
                ...mask.linear,
                startPoint: { x: newX, y: newY },
                endPoint: { x: newX + endDx, y: newY + endDy }
              }
            };
          }
          break;
      }
    }
  }, [selectedLayer, dragState, isDrawing, imageWidth, imageHeight, getCanvasPos]);
  
  const handleMouseUp = useCallback(() => {
    if (isDrawing && selectedLayer?.mask.type === 'brush') {
      // Salvar dados do pincel
      saveBrushData();
    }
    
    // Aplicar a atualização final do drag (agora sim reprocessa a imagem)
    if (pendingUpdateRef.current && selectedLayer) {
      onMaskUpdate(selectedLayer.id, pendingUpdateRef.current);
      pendingUpdateRef.current = null;
    }
    
    // Limpar offset local (agora a posição real será usada)
    setLocalDragOffset(null);
    
    // Cancelar animation frame pendente
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    isDraggingRef.current = false;
    setIsDrawing(false);
    lastBrushPos.current = null;
    dragStartMousePos.current = null;
    dragStartMaskPos.current = null;
    setDragState({ type: null, startPoint: { x: 0, y: 0 }, currentPoint: { x: 0, y: 0 } });
  }, [isDrawing, selectedLayer, onMaskUpdate]);
  
  const handleMouseLeave = useCallback(() => {
    setCursorPos(null);
    if (isDrawing) {
      saveBrushData();
      setIsDrawing(false);
      lastBrushPos.current = null;
    }
    
    // Aplicar qualquer atualização pendente do drag
    if (pendingUpdateRef.current && selectedLayer) {
      onMaskUpdate(selectedLayer.id, pendingUpdateRef.current);
      pendingUpdateRef.current = null;
    }
    
    // Limpar offset local
    setLocalDragOffset(null);
    
    // Cancelar animation frame pendente
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    isDraggingRef.current = false;
    dragStartMousePos.current = null;
    dragStartMaskPos.current = null;
    setDragState({ type: null, startPoint: { x: 0, y: 0 }, currentPoint: { x: 0, y: 0 } });
  }, [isDrawing, selectedLayer, onMaskUpdate]);
  
  // ============================================
  // FUNÇÕES DE PINCEL
  // ============================================
  
  const drawBrushStroke = useCallback((
    from: Point2D, 
    to: Point2D, 
    size: number, 
    softness: number,
    erase: boolean
  ) => {
    const canvas = brushCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
    
    // Criar gradiente para pincel suave
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    const innerOpacity = 1;
    const outerOpacity = 1 - (softness / 100);
    
    gradient.addColorStop(0, `rgba(255, 255, 255, ${innerOpacity})`);
    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${(innerOpacity + outerOpacity) / 2})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, ${outerOpacity})`);
    
    // Interpolar pontos para linha suave
    const dist = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
    const spacing = Math.max(2, size * 0.1);
    const steps = Math.max(1, Math.ceil(dist / spacing));
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, []);
  
  const saveBrushData = useCallback(() => {
    const canvas = brushCanvasRef.current;
    if (!canvas || !selectedLayer) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Converter para base64
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const bytes = new Uint8Array(imageData.data.buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    
    onMaskUpdate(selectedLayer.id, {
      brush: {
        ...selectedLayer.mask.brush!,
        maskImageData: base64,
        maskDimensions: { width: canvas.width, height: canvas.height }
      }
    });
  }, [selectedLayer, onMaskUpdate]);
  
  // Carregar dados de pincel existentes
  useEffect(() => {
    if (!brushCanvasRef.current || !selectedLayer?.mask.brush?.maskImageData) return;
    
    const ctx = brushCanvasRef.current.getContext('2d');
    if (!ctx) return;
    
    try {
      const brush = selectedLayer.mask.brush;
      if (!brush.maskDimensions) return;
      
      const binary = atob(brush.maskImageData!);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      const imgData = new ImageData(
        new Uint8ClampedArray(bytes.buffer),
        brush.maskDimensions.width,
        brush.maskDimensions.height
      );
      
      ctx.putImageData(imgData, 0, 0);
    } catch {
      console.warn('Failed to load brush data');
    }
  }, [selectedLayer?.id]);
  
  // ============================================
  // DETERMINAR CURSOR
  // ============================================
  
  const getCursor = useMemo(() => {
    if (!selectedLayer) return 'default';
    
    switch (selectedLayer.mask.type) {
      case 'color-range':
        return 'crosshair';
      case 'brush':
        return 'none';
      case 'circular':
      case 'elliptical':
      case 'rectangular':
        return dragState.type ? 'grabbing' : 'grab';
      case 'linear':
        return 'crosshair';
      default:
        return 'default';
    }
  }, [selectedLayer, dragState]);
  
  // ============================================
  // RENDER
  // ============================================
  
  if (imageWidth === 0 || imageHeight === 0) return null;
  
  return (
    <div 
      className="absolute inset-0 pointer-events-auto"
      style={{ cursor: getCursor }}
    >
      {/* Canvas de overlay da máscara (visualização colorida) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'multiply', opacity: 0.6 }}
      />
      
      {/* Canvas de desenho de pincel (invisível, apenas dados) */}
      <canvas
        ref={brushCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-0"
      />
      
      {/* Canvas de handles e cursor */}
      <canvas
        ref={maskCanvasRef}
        className="absolute inset-0 w-full h-full"
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
        onPointerLeave={handleMouseLeave}
        onContextMenu={(e) => e.preventDefault()}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

// Memoizar componente para evitar re-renders desnecessários durante drag
export const MaskCanvasOverlay = memo(MaskCanvasOverlayComponent);

export default MaskCanvasOverlay;
