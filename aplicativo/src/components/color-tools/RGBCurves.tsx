import React, { useRef, useEffect, useState, useCallback } from 'react';

import { CurvePoint } from "../../types/Layer";

interface RGBCurvesProps {
  rgbPoints: CurvePoint[];
  rPoints: CurvePoint[];
  gPoints: CurvePoint[];
  bPoints: CurvePoint[];
  onRgbChange: (points: CurvePoint[]) => void;
  onRChange: (points: CurvePoint[]) => void;
  onGChange: (points: CurvePoint[]) => void;
  onBChange: (points: CurvePoint[]) => void;
}

const defaultPoints: CurvePoint[] = [
  { x: 0, y: 0 },
  { x: 255, y: 255 }
];

type Channel = 'rgb' | 'r' | 'g' | 'b';

const channelConfig: Record<Channel, { label: string; color: string }> = {
  rgb: { label: 'RGB', color: '#ffffff' },
  r: { label: 'Vermelho', color: '#ef4444' },
  g: { label: 'Verde', color: '#22c55e' },
  b: { label: 'Azul', color: '#3b82f6' }
};

export const RGBCurves: React.FC<RGBCurvesProps> = ({
  rgbPoints, rPoints, gPoints, bPoints,
  onRgbChange, onRChange, onGChange, onBChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 180;
  const padding = 10;
  const [activeChannel, setActiveChannel] = useState<Channel>('rgb');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  const getPoints = useCallback(() => {
    switch (activeChannel) {
      case 'r': return rPoints;
      case 'g': return gPoints;
      case 'b': return bPoints;
      default: return rgbPoints;
    }
  }, [activeChannel, rgbPoints, rPoints, gPoints, bPoints]);

  const setPoints = useCallback((newPoints: CurvePoint[]) => {
    switch (activeChannel) {
      case 'r': onRChange(newPoints); break;
      case 'g': onGChange(newPoints); break;
      case 'b': onBChange(newPoints); break;
      default: onRgbChange(newPoints); break;
    }
  }, [activeChannel, onRgbChange, onRChange, onGChange, onBChange]);

  const toCanvas = (val: number) => padding + (val / 255) * (size - 2 * padding);
  const fromCanvas = (pos: number) => Math.max(0, Math.min(255, ((pos - padding) / (size - 2 * padding)) * 255));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, size, size);

    // Grid
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const pos = padding + ((size - 2 * padding) / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pos, padding);
      ctx.lineTo(pos, size - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, pos);
      ctx.lineTo(size - padding, pos);
      ctx.stroke();
    }

    // Diagonal reference
    ctx.strokeStyle = '#333';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding, size - padding);
    ctx.lineTo(size - padding, padding);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw all curves (background)
    const drawCurve = (points: CurvePoint[], color: string, isActive: boolean) => {
      ctx.strokeStyle = isActive ? color : `${color}40`;
      ctx.lineWidth = isActive ? 2.5 : 1;
      ctx.beginPath();
      const sorted = [...points].sort((a, b) => a.x - b.x);
      if (sorted.length > 0) {
        ctx.moveTo(toCanvas(sorted[0].x), size - toCanvas(sorted[0].y));
        for (let i = 1; i < sorted.length; i++) {
          ctx.lineTo(toCanvas(sorted[i].x), size - toCanvas(sorted[i].y));
        }
      }
      ctx.stroke();
    };

    // Draw inactive curves first
    if (activeChannel !== 'r') drawCurve(rPoints, '#ef4444', false);
    if (activeChannel !== 'g') drawCurve(gPoints, '#22c55e', false);
    if (activeChannel !== 'b') drawCurve(bPoints, '#3b82f6', false);
    if (activeChannel !== 'rgb') drawCurve(rgbPoints, '#ffffff', false);

    // Draw active curve
    const activeColor = channelConfig[activeChannel].color;
    const points = getPoints();
    drawCurve(points, activeColor, true);

    // Draw control points
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);
    sortedPoints.forEach((point, i) => {
      const x = toCanvas(point.x);
      const y = size - toCanvas(point.y);
      
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = `${activeColor}30`;
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = selectedPoint === i ? '#fff' : activeColor;
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

  }, [rgbPoints, rPoints, gPoints, bPoints, activeChannel, selectedPoint, getPoints]);

  const getPointerPos = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: fromCanvas(e.clientX - rect.left),
      y: fromCanvas(size - (e.clientY - rect.top))
    };
  }, []);

  const handleMouseDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = getPointerPos(e);
    const points = getPoints();
    const sorted = [...points].sort((a, b) => a.x - b.x);
    
    const clickedIndex = sorted.findIndex(p => 
      Math.abs(p.x - pos.x) < 20 && Math.abs(p.y - pos.y) < 20
    );

    if (clickedIndex >= 0) {
      setSelectedPoint(clickedIndex);
    } else {
      const newPoints = [...points, { x: pos.x, y: pos.y }].sort((a, b) => a.x - b.x);
      setPoints(newPoints);
      setSelectedPoint(newPoints.findIndex(p => Math.abs(p.x - pos.x) < 5));
    }
    setIsDragging(true);
  }, [getPoints, setPoints, getPointerPos]);

  const handleMouseMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || selectedPoint === null) return;
    
    const pos = getPointerPos(e);
    const points = getPoints();
    const sorted = [...points].sort((a, b) => a.x - b.x);
    
    if (selectedPoint === 0) {
      sorted[0] = { x: 0, y: Math.max(0, Math.min(255, pos.y)) };
    } else if (selectedPoint === sorted.length - 1) {
      sorted[sorted.length - 1] = { x: 255, y: Math.max(0, Math.min(255, pos.y)) };
    } else {
      sorted[selectedPoint] = { 
        x: Math.max(0, Math.min(255, pos.x)), 
        y: Math.max(0, Math.min(255, pos.y)) 
      };
    }
    
    setPoints(sorted);
  }, [isDragging, selectedPoint, getPoints, setPoints, getPointerPos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const pos = getPointerPos(e);
    const points = getPoints();
    const sorted = [...points].sort((a, b) => a.x - b.x);
    
    const clickedIndex = sorted.findIndex(p => 
      Math.abs(p.x - pos.x) < 20 && Math.abs(p.y - pos.y) < 20
    );
    
    if (clickedIndex > 0 && clickedIndex < sorted.length - 1) {
      sorted.splice(clickedIndex, 1);
      setPoints(sorted);
    }
    setSelectedPoint(null);
  }, [getPoints, setPoints, getPointerPos]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getPointerPos(e);
    const points = getPoints();
    const sorted = [...points].sort((a, b) => a.x - b.x);
    
    const clickedIndex = sorted.findIndex(p => 
      Math.abs(p.x - pos.x) < 20 && Math.abs(p.y - pos.y) < 20
    );
    
    if (clickedIndex > 0 && clickedIndex < sorted.length - 1) {
      sorted.splice(clickedIndex, 1);
      setPoints(sorted);
      setSelectedPoint(null);
    }
  }, [getPoints, setPoints, getPointerPos]);

  return (
    <div className="flex flex-col gap-3">
      {/* Channel Selector */}
      <div className="flex gap-1">
        {(Object.keys(channelConfig) as Channel[]).map(ch => (
          <button
            key={ch}
            onClick={() => { setActiveChannel(ch); setSelectedPoint(null); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded transition ${
              activeChannel === ch 
                ? 'bg-neutral-700 shadow-md' 
                : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
            style={{ color: channelConfig[ch].color }}
          >
            {channelConfig[ch].label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="cursor-crosshair rounded-lg border border-neutral-700 shadow-lg self-center"
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
        onPointerLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        style={{ touchAction: 'none' }}
      />
      <span className="text-[10px] text-gray-500 text-center">
        Clique para adicionar • Botão direito para remover
      </span>
    </div>
  );
};

export { defaultPoints };
