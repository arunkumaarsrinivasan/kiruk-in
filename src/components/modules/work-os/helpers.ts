import { getProjectCoverLabel } from "@/data/project-media";
import type { Project } from "./types";

export function label(p: Project): string {
  return getProjectCoverLabel(p.id, p.title);
}

export function fileName(p: Project): string {
  return `${p.id}.md`;
}

export function monogram(p: Project): string {
  return label(p).slice(0, 1).toUpperCase();
}

const CATEGORY_GLYPH: Record<string, string> = {
  ai: "✦",
  web: "❖",
  mobile: "▢",
  design: "✎",
};

export function categoryGlyph(category: string): string {
  return CATEGORY_GLYPH[category] ?? "▦";
}

/**
 * Keep a window inside its stage on narrow screens: width never exceeds the
 * stage, and the cascade offset `x` slides left until the right edge fits.
 */
export function fitWindow(x: number, width: number | string): { left: string; width: string } {
  const w = typeof width === "number" ? `${width}px` : width;
  const fitted = `min(${w}, calc(100% - 8px))`;
  return { left: `max(4px, min(${x}px, calc(100% - ${fitted} - 4px)))`, width: fitted };
}
