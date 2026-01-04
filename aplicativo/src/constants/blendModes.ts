/**
 * Modos de blend disponíveis para camadas
 */

export type BlendMode = 
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "soft-light"
  | "hard-light"
  | "add"
  | "subtract";

export const BLEND_MODES: Record<BlendMode, string> = {
  normal: "Normal",
  multiply: "Multiply",
  screen: "Screen",
  overlay: "Overlay",
  "soft-light": "Soft Light",
  "hard-light": "Hard Light",
  add: "Add",
  subtract: "Subtract",
} as const;

export const DEFAULT_BLEND_MODE: BlendMode = "normal";
