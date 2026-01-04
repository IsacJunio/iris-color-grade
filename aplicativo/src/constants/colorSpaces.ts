/**
 * Constantes de espaços de cores e conversões
 */

export const COLOR_WEIGHTS = {
  LUMINANCE_R: 0.299,
  LUMINANCE_G: 0.587,
  LUMINANCE_B: 0.114,
} as const;

export const HUE_WEIGHTS = {
  HUE: 50,
  SATURATION: 30,
  LUMINANCE: 20,
} as const;

export const COLOR_BALANCE_STRENGTH = 0.5;

export const MAX_PREVIEW_WIDTH = 1280;
export const MAX_PREVIEW_HEIGHT = 1280;

export const CANVAS_OPTIONS = {
  WILL_READ_FREQUENTLY: true,
} as const;
