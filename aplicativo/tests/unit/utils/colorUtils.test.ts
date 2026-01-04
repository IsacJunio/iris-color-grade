import { describe, it, expect } from 'vitest';
import { rgbToHsl, hslToRgb, calculateColorDifference } from '../../../src/utils/colorUtils';

describe('colorUtils', () => {
  describe('rgbToHsl', () => {
    it('should convert pure red correctly', () => {
      const hsl = rgbToHsl(255, 0, 0);
      expect(hsl).toEqual({ h: 0, s: 100, l: 50 });
    });

    it('should convert pure green correctly', () => {
      const hsl = rgbToHsl(0, 255, 0);
      expect(hsl).toEqual({ h: 120, s: 100, l: 50 });
    });

    it('should convert pure blue correctly', () => {
      const hsl = rgbToHsl(0, 0, 255);
      expect(hsl).toEqual({ h: 240, s: 100, l: 50 });
    });

    it('should convert white correctly', () => {
      const hsl = rgbToHsl(255, 255, 255);
      expect(hsl).toEqual({ h: 0, s: 0, l: 100 });
    });

    it('should convert black correctly', () => {
      const hsl = rgbToHsl(0, 0, 0);
      expect(hsl).toEqual({ h: 0, s: 0, l: 0 });
    });
  });

  describe('hslToRgb', () => {
    it('should convert pure red correctly', () => {
      const rgb = hslToRgb(0, 100, 50);
      expect(rgb).toEqual([255, 0, 0]);
    });

    it('should convert pure green correctly', () => {
      const rgb = hslToRgb(120, 100, 50);
      expect(rgb).toEqual([0, 255, 0]);
    });

    it('should be reversible (approximately)', () => {
      const input = { r: 100, g: 150, b: 200 };
      const hsl = rgbToHsl(input.r, input.g, input.b);
      const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
      
      // Permitir pequena margem de erro por arredondamento
      expect(rgb[0]).toBeCloseTo(input.r, 0);
      expect(rgb[1]).toBeCloseTo(input.g, 0);
      expect(rgb[2]).toBeCloseTo(input.b, 0);
    });
  });

  describe('calculateColorDifference', () => {
    it('should return 0 for identical colors', () => {
      const color = { h: 100, s: 50, l: 50 };
      const diff = calculateColorDifference(color, color);
      expect(diff).toBe(0);
    });

    it('should detect hue difference correctly', () => {
      const c1 = { h: 0, s: 100, l: 50 };
      const c2 = { h: 180, s: 100, l: 50 }; // Oposto
      
      // Hue tem peso 50 na função default
      const diff = calculateColorDifference(c1, c2);
      expect(diff).toBe(50); 
    });
  });
});
