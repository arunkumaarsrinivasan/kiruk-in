import type { CSSProperties } from 'react';
import type { ThemeConfig } from '@/data/portfolio-data';

export function hexToRgbaForDesigner(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length < 6) return `rgba(0,0,0,${alpha})`;
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Warm paper fill — solid, aligned with sketch-mode base (no ruled lines / margin stripe) */
export const designerPaperLayer: CSSProperties = {
  backgroundColor: '#f5f3ee',
};

/** Digital wing — flat surface (no grid hatch; matches calmer page chrome) */
export const designerDigitalLayer: CSSProperties = {
  backgroundColor: 'color-mix(in srgb, var(--bg-card) 78%, #050508)',
};

export const designerBridgeLayer: CSSProperties = {
  width: 11,
  flexShrink: 0,
  background: `linear-gradient(90deg,
    #f5f3ee 0%,
    color-mix(in srgb, var(--accent-color) 48%, transparent) 50%,
    color-mix(in srgb, var(--bg-card) 72%, #000012) 100%)`,
  boxShadow: 'inset 0 0 0 1px rgba(42, 40, 38, 0.18)',
};

/**
 * Bridge-mode home button — soft paper | digital split only (no grid or notebook lines).
 */
export function homeEyeBridgeButtonStyle(era: ThemeConfig, buttonSize: number): CSSProperties {
  const { accent, background } = era.colors;
  const digitalBase = `color-mix(in srgb, ${background} 86%, #050508)`;
  const mid = buttonSize / 2;
  const bridgeHalf = 5;

  return {
    border: `1px solid color-mix(in srgb, ${accent} 40%, #2a2826)`,
    backgroundColor: digitalBase,
    backgroundImage: `linear-gradient(90deg,
      #f5f3ee 0px,
      #f5f3ee ${mid - bridgeHalf}px,
      color-mix(in srgb, ${accent} 35%, #f0ebe3) ${mid}px,
      ${digitalBase} ${mid + bridgeHalf}px,
      ${digitalBase} 100%)`,
    boxShadow: `
      inset 0 1px 0 rgba(255, 255, 255, 0.18),
      0 0 16px -8px ${hexToRgbaForDesigner(accent, 0.28)}`,
  };
}
