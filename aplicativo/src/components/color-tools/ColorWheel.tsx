import React, { useRef, useState, useEffect, useCallback } from 'react';

interface ColorWheelProps {
  label: string;
  color: { r: number, g: number, b: number };
  onChange: (color: { r: number, g: number, b: number }) => void;
  onReset: () => void;
}

export function ColorWheel({ label, color, onChange, onReset }: ColorWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const size = 180;
  const radius = size / 2;

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    // Desenhar disco de cores
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - radius;
        const dy = y - radius;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= radius) {
          const angle = Math.atan2(dy, dx);
          const hue = (angle + Math.PI) / (Math.PI * 2); // 0 a 1
          const sat = Math.min(1, dist / radius);
          
          // HSV to RGB
          const i = Math.floor(hue * 6);
          const f = hue * 6 - i;
          const p = 1 - sat;
          const q = 1 - f * sat;
          const t = 1 - (1 - f) * sat;
          
          let r = 0, g = 0, b = 0;
          switch (i % 6) {
            case 0: r = 1; g = t; b = p; break;
            case 1: r = q; g = 1; b = p; break;
            case 2: r = p; g = 1; b = t; break;
            case 3: r = p; g = q; b = 1; break;
            case 4: r = t; g = p; b = 1; break;
            case 5: r = 1; g = p; b = q; break;
            case 6: r = 1; g = p; b = q; break; // Edge case
          }
          
          // Efeito visual de gradiente suave
          const val = 1 - (dist / radius) * 0.2; // Leve escurecimento na borda
          
          const idx = (y * size + x) * 4;
          data[idx] = Math.round(r * val * 255);
          data[idx + 1] = Math.round(g * val * 255);
          data[idx + 2] = Math.round(b * val * 255);
          data[idx + 3] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(radius, 0); ctx.lineTo(radius, size);
    ctx.moveTo(0, radius); ctx.lineTo(size, radius);
    ctx.stroke();

    // Handle Position Logic
    let hx = radius;
    let hy = radius;

    // Se a cor externa mudar, calcular posição aproximada do handle
    if (color.r !== 0 || color.g !== 0 || color.b !== 0) {
        // Normalização aproximada para visualização
        const rW = color.r / 100;
        const gW = color.g / 100;
        const bW = color.b / 100;
        
        // Coordenadas baseadas nos ângulos RGB
        const xParams = rW * Math.cos(0) + gW * Math.cos(2.094) + bW * Math.cos(4.188);
        const yParams = rW * Math.sin(0) + gW * Math.sin(2.094) + bW * Math.sin(4.188);

        // Escalar e posicionar no centro
        hx = radius + xParams * radius * 0.8;
        hy = radius + yParams * radius * 0.8;
    }

    // Draw Handle
    ctx.beginPath();
    ctx.arc(hx, hy, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();

  }, [radius, size, color]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  const handleInteract = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const radius = size / 2;

    const dx = clientX - rect.left - radius;
    const dy = clientY - rect.top - radius;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), radius);
    const angle = Math.atan2(dy, dx);

    // Convert Polar to RGB Offsets
    const strength = (dist / radius) * 100; // Aumentei sensibilidade para range total

    const r = Math.cos(angle) * strength;
    const g = Math.cos(angle - 2.094) * strength;
    const b = Math.cos(angle - 4.188) * strength;

    onChange({ r, g, b });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    handleInteract(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      handleInteract(e.clientX, e.clientY);
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex justify-between w-full px-2 items-center">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">{label}</span>
        <button onClick={onReset} className="text-[10px] text-gray-500 hover:text-white px-1 py-0.5 rounded bg-neutral-800 transition-colors">
           Reset
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="cursor-crosshair rounded-full shadow-inner bg-neutral-900 border border-neutral-800"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
