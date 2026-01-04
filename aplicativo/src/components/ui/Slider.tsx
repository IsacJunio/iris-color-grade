import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  color?: string;
  showValue?: boolean;
  suffix?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  color = 'orange',
  showValue = true,
  suffix = ''
}) => {
  const displayValue = value - (min + max) / 2; // Center at 0

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{label}</span>
        {showValue && (
          <span className="text-xs text-gray-500 font-mono w-12 text-right">
            {displayValue > 0 ? '+' : ''}{displayValue.toFixed(step < 1 ? 1 : 0)}{suffix}
          </span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-neutral-700 accent-${color}-500`}
        style={{ accentColor: color }}
      />
    </div>
  );
};

interface ColorSliderGroupProps {
  label: string;
  r: number;
  g: number;
  b: number;
  onRChange: (v: number) => void;
  onGChange: (v: number) => void;
  onBChange: (v: number) => void;
}

export const ColorSliderGroup: React.FC<ColorSliderGroupProps> = ({
  label,
  r, g, b,
  onRChange, onGChange, onBChange
}) => {
  return (
    <div className="space-y-2 bg-neutral-800/50 p-3 rounded-lg">
      <span className="text-xs font-medium text-gray-300">{label}</span>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-red-400 w-4">R</span>
          <input
            type="range"
            min={-100}
            max={100}
            value={r}
            onChange={(e) => onRChange(Number(e.target.value))}
            className="flex-1 h-1.5 rounded appearance-none cursor-pointer bg-neutral-700"
            style={{ accentColor: '#ef4444' }}
          />
          <span className="text-[10px] text-gray-500 w-8 text-right font-mono">{r}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-green-400 w-4">G</span>
          <input
            type="range"
            min={-100}
            max={100}
            value={g}
            onChange={(e) => onGChange(Number(e.target.value))}
            className="flex-1 h-1.5 rounded appearance-none cursor-pointer bg-neutral-700"
            style={{ accentColor: '#22c55e' }}
          />
          <span className="text-[10px] text-gray-500 w-8 text-right font-mono">{g}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-blue-400 w-4">B</span>
          <input
            type="range"
            min={-100}
            max={100}
            value={b}
            onChange={(e) => onBChange(Number(e.target.value))}
            className="flex-1 h-1.5 rounded appearance-none cursor-pointer bg-neutral-700"
            style={{ accentColor: '#3b82f6' }}
          />
          <span className="text-[10px] text-gray-500 w-8 text-right font-mono">{b}</span>
        </div>
      </div>
    </div>
  );
};
