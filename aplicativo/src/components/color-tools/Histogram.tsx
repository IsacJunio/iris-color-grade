import React, { useRef, useEffect } from 'react';

interface HistogramProps {
  imageData: ImageData | null;
}

export const Histogram: React.FC<HistogramProps> = ({ imageData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = 256;
  const height = 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate histogram data
    const rHist = new Array(256).fill(0);
    const gHist = new Array(256).fill(0);
    const bHist = new Array(256).fill(0);

    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      rHist[data[i]]++;
      gHist[data[i + 1]]++;
      bHist[data[i + 2]]++;
    }

    // Find max value for normalization
    const maxVal = Math.max(...rHist, ...gHist, ...bHist);

    // Clear
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw histograms with blend mode
    ctx.globalCompositeOperation = 'lighter';

    const drawChannel = (hist: number[], color: string) => {
      ctx.fillStyle = color;
      for (let i = 0; i < 256; i++) {
        const h = (hist[i] / maxVal) * height;
        ctx.fillRect(i, height - h, 1, h);
      }
    };

    drawChannel(rHist, 'rgba(255, 0, 0, 0.5)');
    drawChannel(gHist, 'rgba(0, 255, 0, 0.5)');
    drawChannel(bHist, 'rgba(0, 0, 255, 0.5)');

    ctx.globalCompositeOperation = 'source-over';

  }, [imageData]);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-400">Histogram</span>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded border border-neutral-700"
      />
    </div>
  );
};
