
import { Layer } from '../../types/Layer';

interface Preset {
  id: string;
  name: string;
  thumbnailColor: string; // CSS gradient or color
  apply: () => Partial<Layer>;
}

const presets: Preset[] = [
  {
    id: 'cinematic-teal-orange',
    name: 'Teal & Orange',
    thumbnailColor: 'linear-gradient(135deg, #008080 0%, #ff7f50 100%)',
    apply: () => ({
      colorBalance: {
        shadows: { r: -20, g: -10, b: 20 }, // Cool shadows (Teal)
        midtones: { r: 0, g: 0, b: 0 },
        highlights: { r: 20, g: 10, b: -10 }, // Warm highlights (Orange)
      },
      color: {
         contrast: 120,
         saturation: 110,
         brightness: 100,
         exposure: 100,
         temperature: 0,
         tint: 0,
         hue: 0
      }
    })
  },
  {
    id: 'bw-dramatic',
    name: 'P&B Dramático',
    thumbnailColor: 'linear-gradient(135deg, #000 0%, #fff 100%)',
    apply: () => ({
      color: {
        saturation: 0,
        contrast: 140,
        brightness: 90,
        exposure: 105,
        temperature: 0,
        tint: 0,
        hue: 0
      },
      colorBalance: {
         shadows: { r: 0, g: 0, b: 0 },
         midtones: { r: 0, g: 0, b: 0 },
         highlights: { r: 0, g: 0, b: 0 }
      }
    })
  },
  {
    id: 'warm-vintage',
    name: 'Vintage Quente',
    thumbnailColor: 'linear-gradient(135deg, #fcd34d 0%, #78350f 100%)',
    apply: () => ({
      color: {
        temperature: 20,
        tint: 5,
        saturation: 85,
        contrast: 90,
        brightness: 105,
        exposure: 100,
        hue: 0
      },
      colorBalance: {
         shadows: { r: 10, g: 0, b: -10 }, // Warm shadows
         midtones: { r: 5, g: 5, b: 0 },
         highlights: { r: 5, g: 0, b: 10 } // Magenta tint
      }
    })
  },
  {
    id: 'cool-matrix',
    name: 'Matrix Verde',
    thumbnailColor: 'linear-gradient(135deg, #14532d 0%, #4ade80 100%)',
    apply: () => ({
        color: {
            temperature: -10,
            tint: -30,
            saturation: 90,
            contrast: 110,
            brightness: 95,
            exposure: 100,
            hue: 0
        },
        colorBalance: {
            shadows: { r: -20, g: 10, b: -20 },
            midtones: { r: -10, g: 20, b: -10 },
            highlights: { r: -5, g: 15, b: -5 }
        }
    })
  },
    {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    thumbnailColor: 'linear-gradient(135deg, #ec4899 0%, #3b82f6 100%)',
    apply: () => ({
        color: {
            saturation: 130,
            contrast: 125,
            brightness: 100,
            exposure: 100,
            temperature: 0,
            tint: 0,
            hue: 0
        },
        colorBalance: {
            shadows: { r: 20, g: -10, b: 30 }, // Purple shadows
            midtones: { r: -10, g: 0, b: 10 },
            highlights: { r: -30, g: 10, b: 40 } // Blue/Cyan highlights
        }
    })
  }
];

interface PresetGalleryProps {
  onApplyPreset: (updates: Partial<Layer>) => void;
}

export function PresetGallery({ onApplyPreset }: PresetGalleryProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pre-Estilos (LUTs)</h3>
      <div className="grid grid-cols-2 gap-2">
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => onApplyPreset(preset.apply())}
            className="group relative flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-all border border-transparent hover:border-neutral-600"
          >
            <div 
                className="w-full h-12 rounded mb-2 shadow-inner"
                style={{ background: preset.thumbnailColor }}
            />
            <span className="text-[10px] text-gray-300 font-medium group-hover:text-white">{preset.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
