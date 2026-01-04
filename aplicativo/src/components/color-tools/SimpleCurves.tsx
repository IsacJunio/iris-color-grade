import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CurvePoint {
  x: number;
  y: number;
}

interface SimpleCurvesProps {
  points: CurvePoint[];
  onChange: (points: CurvePoint[]) => void;
  color?: string;
}

const defaultPoints: CurvePoint[] = [
  { x: 0, y: 0 },
  { x: 255, y: 255 }
];

export const SimpleCurves: React.FC<SimpleCurvesProps> = ({
  points,
  onChange,
  color = '#ffffff'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 180;
  const padding = 10;
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

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

    // Draw curve line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);
    if (sortedPoints.length > 0) {
      ctx.moveTo(toCanvas(sortedPoints[0].x), size - toCanvas(sortedPoints[0].y));
      for (let i = 1; i < sortedPoints.length; i++) {
        ctx.lineTo(toCanvas(sortedPoints[i].x), size - toCanvas(sortedPoints[i].y));
      }
    }
    ctx.stroke();

    // Draw control points - BIGGER for easy control
    sortedPoints.forEach((point, i) => {
      const x = toCanvas(point.x);
      const y = size - toCanvas(point.y);
      
      // Outer glow
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fillStyle = `${color}20`;
      ctx.fill();
      
      // Inner circle
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = selectedPoint === i ? '#fff' : color;
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

  }, [points, color, selectedPoint]);

  const getMousePos = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: fromCanvas(e.clientX - rect.left),
      y: fromCanvas(size - (e.clientY - rect.top))
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const pos = getMousePos(e);
    
    // Check if clicking near existing point (bigger hit area)
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);
    const clickedIndex = sortedPoints.findIndex(p => 
      Math.abs(p.x - pos.x) < 25 && Math.abs(p.y - pos.y) < 25
    );

    if (clickedIndex >= 0) {
      setSelectedPoint(clickedIndex);
    } else {
      // Add new point
      const newPoints = [...points, { x: pos.x, y: pos.y }].sort((a, b) => a.x - b.x);
      onChange(newPoints);
      setSelectedPoint(newPoints.findIndex(p => Math.abs(p.x - pos.x) < 5));
    }
    setIsDragging(true);
  }, [points, onChange, getMousePos]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || selectedPoint === null) return;
    
    const pos = getMousePos(e);
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);
    
    // Don't allow moving first or last point's X
    if (selectedPoint === 0) {
      sortedPoints[0] = { x: 0, y: Math.max(0, Math.min(255, pos.y)) };
    } else if (selectedPoint === sortedPoints.length - 1) {
      sortedPoints[sortedPoints.length - 1] = { x: 255, y: Math.max(0, Math.min(255, pos.y)) };
    } else {
      sortedPoints[selectedPoint] = { 
        x: Math.max(0, Math.min(255, pos.x)), 
        y: Math.max(0, Math.min(255, pos.y)) 
      };
    }
    
    onChange(sortedPoints);
  }, [isDragging, selectedPoint, points, onChange, getMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const pos = getMousePos(e);
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);
    
    // Check if double-clicking on a middle point to delete
    const clickedIndex = sortedPoints.findIndex(p => 
      Math.abs(p.x - pos.x) < 25 && Math.abs(p.y - pos.y) < 25
    );
    
    if (clickedIndex > 0 && clickedIndex < sortedPoints.length - 1) {
      // Delete the point
      sortedPoints.splice(clickedIndex, 1);
      onChange(sortedPoints);
    } else if (clickedIndex === -1) {
      // Reset curve
      onChange([...defaultPoints]);
    }
    setSelectedPoint(null);
  }, [points, onChange, getMousePos]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="cursor-crosshair rounded-lg border border-neutral-700 shadow-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      />
      <span className="text-[10px] text-gray-500">Click to add • Drag to adjust • Double-click to delete</span>
    </div>
  );
};

export { defaultPoints };
