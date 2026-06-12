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
