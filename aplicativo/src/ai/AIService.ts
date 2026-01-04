export interface AIPreset {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  vignette: number;
  explanation: string;
}

export class AIService {
  
  // Analyze prompt and return color grading settings
  static async analyzePrompt(prompt: string): Promise<AIPreset> {
    const lowerPrompt = prompt.toLowerCase();
    
    // Wait a bit to simulate processing
    await new Promise(r => setTimeout(r, 500));
    
    // Cinematic / Film Look
    if (lowerPrompt.includes('cinem') || lowerPrompt.includes('film') || lowerPrompt.includes('movie')) {
      return {
        brightness: 95,
        contrast: 120,
        saturation: 85,
        temperature: 10,
        tint: -5,
        vignette: 30,
        explanation: '🎬 Cinematic look: Crushed blacks, reduced saturation, warm tones with vignette.'
      };
    }
    
    // Warm / Sunset / Golden
    if (lowerPrompt.includes('warm') || lowerPrompt.includes('sunset') || lowerPrompt.includes('golden') || lowerPrompt.includes('quente')) {
      return {
        brightness: 105,
        contrast: 110,
        saturation: 120,
        temperature: 50,
        tint: 10,
        vignette: 15,
        explanation: '☀️ Warm look: Orange/yellow tones, boosted saturation for golden hour feel.'
      };
    }
    
    // Cool / Cold / Blue
    if (lowerPrompt.includes('cool') || lowerPrompt.includes('cold') || lowerPrompt.includes('blue') || lowerPrompt.includes('frio')) {
      return {
        brightness: 100,
        contrast: 115,
        saturation: 90,
        temperature: -40,
        tint: -10,
        vignette: 10,
        explanation: '❄️ Cool look: Blue tones, slightly desaturated for cold atmosphere.'
      };
    }
    
    // Vibrant / Vivid / Pop
    if (lowerPrompt.includes('vibrant') || lowerPrompt.includes('vivid') || lowerPrompt.includes('pop') || lowerPrompt.includes('vibrante')) {
      return {
        brightness: 105,
        contrast: 125,
        saturation: 150,
        temperature: 0,
        tint: 0,
        vignette: 0,
        explanation: '🌈 Vibrant look: High saturation and contrast for punchy colors.'
      };
    }
    
    // Black and White / Monochrome
    if (lowerPrompt.includes('b&w') || lowerPrompt.includes('black') || lowerPrompt.includes('white') || lowerPrompt.includes('mono') || lowerPrompt.includes('preto')) {
      return {
        brightness: 100,
        contrast: 140,
        saturation: 0,
        temperature: 0,
        tint: 0,
        vignette: 20,
        explanation: '⬛ B&W look: High contrast monochrome with dramatic vignette.'
      };
    }
    
    // Vintage / Retro / Old
    if (lowerPrompt.includes('vintage') || lowerPrompt.includes('retro') || lowerPrompt.includes('old') || lowerPrompt.includes('antigo')) {
      return {
        brightness: 100,
        contrast: 90,
        saturation: 80,
        temperature: 20,
        tint: 5,
        vignette: 25,
        explanation: '📷 Vintage look: Faded colors, warm tint, soft contrast.'
      };
    }
    
    // Dramatic / Moody / Dark
    if (lowerPrompt.includes('dramatic') || lowerPrompt.includes('moody') || lowerPrompt.includes('dark') || lowerPrompt.includes('escuro')) {
      return {
        brightness: 85,
        contrast: 135,
        saturation: 90,
        temperature: -10,
        tint: 0,
        vignette: 40,
        explanation: '🌑 Dramatic look: Dark, high contrast, strong vignette.'
      };
    }
    
    // Natural / Clean / Normal
    if (lowerPrompt.includes('natural') || lowerPrompt.includes('clean') || lowerPrompt.includes('normal')) {
      return {
        brightness: 100,
        contrast: 105,
        saturation: 105,
        temperature: 0,
        tint: 0,
        vignette: 0,
        explanation: '🌿 Natural look: Subtle enhancement, balanced colors.'
      };
    }
    
    // Default: slight enhancement
    return {
      brightness: 102,
      contrast: 108,
      saturation: 110,
      temperature: 5,
      tint: 0,
      vignette: 10,
      explanation: '✨ Auto-enhanced: Slight boost to contrast, saturation, and warmth.'
    };
  }

  // Legacy method for backwards compatibility
  static async analyzeImage(_imageBase64: string): Promise<AIPreset> {
    return this.analyzePrompt('natural');
  }
}
