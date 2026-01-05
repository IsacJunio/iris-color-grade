export interface AIPreset {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  vignette: number;
  explanation: string;
}

export type AIProvider = 'openai' | 'gemini' | 'huggingface';

export class AIService {
  private static SYSTEM_PROMPT = `
    You are a professional colorist API. 
    Analyze the user request and return a JSON object with these exact keys and value ranges:
    - brightness: number (0 to 200, where 100 is neutral)
    - contrast: number (0 to 200, where 100 is neutral)
    - saturation: number (0 to 200, where 100 is neutral)
    - temperature: number (-100 to 100, where 0 is neutral, negative is cool, positive is warm)
    - tint: number (-100 to 100, where 0 is neutral, negative is green, positive is magenta)
    - vignette: number (0 to 1, where 0 is none, 1 is strong)
    - explanation: string (short description of the look)

    Return ONLY the raw JSON object, no markdown formatting.
  `;

  static async analyzePrompt(prompt: string, token: string, provider: AIProvider = 'gemini'): Promise<AIPreset> {
    if (!token) {
        throw new Error("Token de API não fornecido.");
    }

    if (provider === 'gemini') {
        return this.callGemini(prompt, token);
    } else if (provider === 'huggingface') {
        return this.callHuggingFace(prompt, token);
    } else {
        return this.callOpenAI(prompt, token);
    }
  }

  private static async callGemini(prompt: string, token: string): Promise<AIPreset> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${token}`;
    
    // Default fallback if parsing fails
    const fallback: AIPreset = { brightness: 100, contrast: 100, saturation: 100, temperature: 0, tint: 0, vignette: 0, explanation: "Falha ao gerar via AI - usando padrão." };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${this.SYSTEM_PROMPT}\n\nUser Request: "${prompt}"`
                    }]
                }]
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Gemini API Error: ${err}`);
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        return this.parseResponse(textResponse) || fallback;
    } catch (e) {
        console.error("Gemini call failed:", e);
        throw e;
    }
  }

  private static async callHuggingFace(prompt: string, token: string, retries = 3): Promise<AIPreset> {
      // Using Qwen2.5-7B-Instruct - highly capable and usually available on free tier
      // @ts-ignore
      const baseUrl = import.meta.env.DEV ? '/api/hf' : 'https://api-inference.huggingface.co';
      const modelId = "Qwen/Qwen2.5-7B-Instruct"; 
      const url = `${baseUrl}/models/${modelId}`;
      
      // Smart Fallback (Offline Mode)
      const keywordAnalysis = (p: string): AIPreset => {
          const lower = p.toLowerCase();
          let preset = { brightness: 100, contrast: 110, saturation: 110, temperature: 0, tint: 0, vignette: 0, explanation: "⚠️ Modo Offline: Ajuste Inteligente" };
          
          if (lower.includes("quente") || lower.includes("warm") || lower.includes("verão") || lower.includes("summer")) {
              preset.temperature = 30;
              preset.tint = 10;
              preset.explanation = "⚠️ Modo Offline: Look Quente/Solar";
          } else if (lower.includes("frio") || lower.includes("cold") || lower.includes("inverno") || lower.includes("winter") || lower.includes("azul")) {
              preset.temperature = -30;
              preset.contrast = 120;
              preset.explanation = "⚠️ Modo Offline: Look Frio/Inverno";
          } else if (lower.includes("cinematic") || lower.includes("cinema") || lower.includes("filme")) {
              preset.contrast = 130;
              preset.saturation = 90;
              preset.vignette = 0.4;
              preset.brightness = 90;
              preset.explanation = "⚠️ Modo Offline: Look Cinematic Dramático";
          } else if (lower.includes("preto e branco") || lower.includes("b&w") || lower.includes("monochrome") || lower.includes("noir")) {
              preset.saturation = 0;
              preset.contrast = 140;
              preset.explanation = "⚠️ Modo Offline: Preto e Branco";
          } else if (lower.includes("cyberpunk") || lower.includes("neon") || lower.includes("noite")) {
              preset.temperature = -10;
              preset.tint = 40;
              preset.contrast = 130;
              preset.explanation = "⚠️ Modo Offline: Estilo Cyberpunk";
          } else if (lower.includes("vintage") || lower.includes("antigo") || lower.includes("retro")) {
              preset.temperature = 20;
              preset.saturation = 80;
              preset.contrast = 90;
              preset.vignette = 0.3;
              preset.explanation = "⚠️ Modo Offline: Estilo Vintage";
          }

          return preset;
      };

      const fallback = keywordAnalysis(prompt);

      try {
          // Qwen/ChatML format
          const inputValues = `<|im_start|>system\n${this.SYSTEM_PROMPT}<|im_end|>\n<|im_start|>user\n${prompt}\nReturn strict JSON.<|im_end|>\n<|im_start|>assistant\n`;

          const response = await fetch(url, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                  inputs: inputValues,
                  parameters: {
                      max_new_tokens: 500,
                      return_full_text: false,
                      temperature: 0.7
                  }
              })
          });

          // Handle Model Loading (503)
          if (response.status === 503 && retries > 0) {
              const data = await response.json();
              const waitTime = data.estimated_time || 20;
              console.warn(`Model Qwen is loading. Waiting ${waitTime}s...`);
              await new Promise(resolve => setTimeout(resolve, Math.min(waitTime * 1000, 5000)));
              return this.callHuggingFace(prompt, token, retries - 1);
          }

          if (!response.ok) {
              console.warn(`Hugging Face API returned ${response.status}. Falling back to smart offline mode.`);
              return fallback;
          }

          const data = await response.json();
          let textResponse = '';
          if (Array.isArray(data) && data.length > 0) {
              textResponse = data[0].generated_text;
          } else if (typeof data === 'object' && data.generated_text) {
              textResponse = data.generated_text;
          }

          return this.parseResponse(textResponse) || fallback;
      } catch (e) {
          console.error("Hugging Face call failed completely:", e);
          return fallback;
      }
  }

  private static async callOpenAI(prompt: string, token: string): Promise<AIPreset> {
    const url = 'https://api.openai.com/v1/chat/completions';
    
     const fallback: AIPreset = { brightness: 100, contrast: 100, saturation: 100, temperature: 0, tint: 0, vignette: 0, explanation: "Falha ao gerar via AI - usando padrão." };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: this.SYSTEM_PROMPT },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`OpenAI API Error: ${err.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const textResponse = data.choices?.[0]?.message?.content;
        
        return this.parseResponse(textResponse) || fallback;

    } catch (e) {
        console.error("OpenAI call failed:", e);
        throw e;
    }
  }

  private static parseResponse(text: string | undefined): AIPreset | null {
      if (!text) return null;
      try {
          // Remove potential markdown code blocks
          // Also try to find the JSON object if there's extra text
          const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          
          // Regex to extract JSON object if surrounded by text
          const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
          const jsonString = jsonMatch ? jsonMatch[0] : cleanText;

          const json = JSON.parse(jsonString);
          
          return {
              brightness: Number(json.brightness) || 100,
              contrast: Number(json.contrast) || 100,
              saturation: Number(json.saturation) || 100,
              temperature: Number(json.temperature) || 0,
              tint: Number(json.tint) || 0,
              vignette: Number(json.vignette) || 0,
              explanation: json.explanation || "Ajuste automático via IA"
          };
      } catch (e) {
          console.error("Failed to parse AI response:", text);
          return null;
      }
  }
}

