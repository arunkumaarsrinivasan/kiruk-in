import { execFileSync } from "node:child_process";

/**
 * Ink pipeline helpers — vectorize config + SVG theme-pass + tool probe.
 */

/** @neplex/vectorizer binary-mode config, tuned for pen line art. */
export function vectorConfig(v) {
  return {
    colorMode: v.ColorMode.Binary,
    hierarchical: v.Hierarchical.Stacked,
    mode: v.PathSimplifyMode.Spline,
    filterSpeckle: 4,
    colorPrecision: 6,
    layerDifference: 16,
    cornerThreshold: 60,
    lengthThreshold: 4,
    maxIterations: 10,
    spliceThreshold: 45,
    pathPrecision: 8,
  };
}

function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * Make a vectorized SVG theme-native:
 *  - drop the XML prolog + generator comment
 *  - strip `width`/`height` off <svg>, add a `viewBox` so it scales fluidly
 *  - recolor ink fills to `currentColor`; drop near-white (paper) fills
 * The result inherits the era's `--text-main`/`--accent-color` via `color`.
 */
export function themePassSvg(svg) {
  let s = svg.replace(/<\?xml[^>]*\?>\s*/g, "").replace(/<!--[\s\S]*?-->\s*/g, "");

  const w = s.match(/<svg\b[^>]*\bwidth="(\d+(?:\.\d+)?)"/)?.[1];
  const h = s.match(/<svg\b[^>]*\bheight="(\d+(?:\.\d+)?)"/)?.[1];

  s = s
    .replace(/(<svg\b[^>]*?)\s+width="[^"]*"/, "$1")
    .replace(/(<svg\b[^>]*?)\s+height="[^"]*"/, "$1");

  if (!/viewBox=/.test(s) && w && h) {
    s = s.replace(/<svg\b/, `<svg viewBox="0 0 ${w} ${h}"`);
  }

  // Kept in sync with src/lib/ink/theme-pass.ts (that TS copy can't be imported
  // here — this file is .mjs, outside src).
  const recolor = (hex) => (luminance(hex) > 0.9 ? "none" : "currentColor");
  for (const attr of ["fill", "stroke"]) {
    s = s.replace(new RegExp(`${attr}="(#[0-9a-fA-F]{6})"`, "g"), (_m, hex) => `${attr}="${recolor(hex)}"`);
    s = s.replace(new RegExp(`${attr}:\\s*(#[0-9a-fA-F]{6})`, "g"), (_m, hex) => `${attr}:${recolor(hex)}`);
  }

  return `${s.trim()}\n`;
}

/** True if a CLI tool is callable on PATH. */
export function hasTool(cmd) {
  try {
    execFileSync(cmd, ["--help"], { stdio: "ignore", timeout: 8000 });
    return true;
  } catch {
    return false;
  }
}
