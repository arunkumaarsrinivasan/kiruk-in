/**
 * SVG theme-pass (server, shared by the studio export API).
 *
 * Makes a first-party SVG era-native: strip `width`/`height` (keep/inject a
 * `viewBox` so it scales fluidly), and recolor ink `fill`/`stroke` to
 * `currentColor` while dropping near-white (paper/background) fills. The
 * `InkSvg` wrapper then drives the color from the active era.
 *
 * NOTE: the `npm run ink` CLI carries an equivalent copy in
 * `scripts/_lib/ink.mjs` (that path is `.mjs`, outside `src`, so it can't
 * import this TS module). Keep the two in sync.
 */

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export function themePassSvg(svg: string): string {
  let s = svg.replace(/<\?xml[^>]*\?>\s*/g, "").replace(/<!--[\s\S]*?-->\s*/g, "");

  const w = s.match(/<svg\b[^>]*\bwidth="(\d+(?:\.\d+)?)"/)?.[1];
  const h = s.match(/<svg\b[^>]*\bheight="(\d+(?:\.\d+)?)"/)?.[1];

  s = s
    .replace(/(<svg\b[^>]*?)\s+width="[^"]*"/, "$1")
    .replace(/(<svg\b[^>]*?)\s+height="[^"]*"/, "$1");

  if (!/viewBox=/.test(s) && w && h) {
    s = s.replace(/<svg\b/, `<svg viewBox="0 0 ${w} ${h}"`);
  }

  const recolor = (hex: string) => (luminance(hex) > 0.9 ? "none" : "currentColor");
  for (const attr of ["fill", "stroke"] as const) {
    s = s.replace(new RegExp(`${attr}="(#[0-9a-fA-F]{6})"`, "g"), (_m, hex) => `${attr}="${recolor(hex)}"`);
    s = s.replace(new RegExp(`${attr}:\\s*(#[0-9a-fA-F]{6})`, "g"), (_m, hex) => `${attr}:${recolor(hex)}`);
  }

  return `${s.trim()}\n`;
}
