/**
 * The flat picture the tube shows: a character screen. Everything sits on a
 * grid of cells 10 × 20 pixels, the type is a terminal face whose dots are one
 * pixel wide and two tall, and every horizontal stroke is two pixels on an even
 * row, so each lands on one scan line of the tube. Colour is plain RGB; the
 * tube adds the glow.
 */

export const CW = 10;
export const CH = 20;

export interface Zone {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A hex colour, dimmed toward black. */
export function shade(hex: string, k: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.round(v * k);
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

/** A hex colour as 0–1 floats, for the tube's uniforms. */
export function rgb01(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Break text into lines of at most `width` characters, on spaces. */
export function wrap(text: string, width: number): string[] {
  const w = Math.max(4, width);
  const out: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      let rest = word;
      while (rest.length > w) {
        if (line) {
          out.push(line);
          line = "";
        }
        out.push(rest.slice(0, w));
        rest = rest.slice(w);
      }
      if (!line) line = rest;
      else if (line.length + 1 + rest.length <= w) line += ` ${rest}`;
      else {
        out.push(line);
        line = rest;
      }
    }
    out.push(line);
  }
  return out;
}

/** Cut a line to `width` characters, marking the cut. */
export function fit(text: string, width: number): string {
  return text.length <= width ? text : `${text.slice(0, Math.max(1, width - 2))}..`;
}

export class Surface {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  cols = 0;
  rows = 0;
  zones: Zone[] = [];
  private spacing: boolean;

  constructor(private readonly family: string) {
    this.canvas = document.createElement("canvas");
    const ctx = this.canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2d canvas unavailable");
    this.ctx = ctx;
    this.spacing = "letterSpacing" in ctx;
  }

  resize(cols: number, rows: number) {
    // setting a canvas's size reallocates it even when the size is the same
    if (cols === this.cols && rows === this.rows) return;
    this.cols = cols;
    this.rows = rows;
    this.canvas.width = cols * CW;
    this.canvas.height = rows * CH;
  }

  clear() {
    this.zones = [];
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** A rectangle in pixels. */
  px(x: number, y: number, w: number, h: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  /** A rectangle in cells. */
  fill(c: number, r: number, w: number, h: number, color: string) {
    this.px(c * CW, r * CH, w * CW, h * CH, color);
  }

  /** Text at a cell. `scale` 2 is double size and takes two rows. Returns the column after it. */
  text(c: number, r: number, str: string, color: string, scale: 1 | 2 = 1): number {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.font = `${20 * scale}px ${this.family}`;
    ctx.textBaseline = "alphabetic";
    const x = c * CW + 1.5 * scale;
    const y = r * CH + 15.5 * scale;
    if (this.spacing) {
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${2 * scale}px`;
      ctx.fillText(str, x, y);
    } else {
      for (let i = 0; i < str.length; i += 1) ctx.fillText(str[i], x + i * CW * scale, y);
    }
    return c + str.length * scale;
  }

  /** Text on a filled bar, one cell of margin each side: inverse video. Returns the column after it. */
  plate(c: number, r: number, str: string, ink: string, ground: string): number {
    this.px(c * CW, r * CH + 2, (str.length + 2) * CW, CH - 4, ground);
    this.text(c + 1, r, str, ink);
    return c + str.length + 2;
  }

  /** A key: an outline that fills when pointed at. Returns the column after it. */
  key(id: string, c: number, r: number, str: string, color: string, ink: string, lit: boolean): number {
    const w = str.length + 2;
    const x = c * CW;
    const y = r * CH + 2;
    if (lit) this.px(x, y, w * CW, CH - 4, color);
    else this.outline(x, y, w * CW, CH - 4, color);
    this.text(c + 1, r, str, lit ? ink : color);
    this.zone(id, c, r, w, 1);
    return c + w;
  }

  /** A two-pixel outline, in pixels. */
  outline(x: number, y: number, w: number, h: number, color: string) {
    this.px(x, y, w, 2, color);
    this.px(x, y + h - 2, w, 2, color);
    this.px(x, y, 2, h, color);
    this.px(x + w - 2, y, 2, h, color);
  }

  /**
   * A framed pane over a block of cells. The rule runs through the middle of
   * its first and last rows, so the rows between are free; a title sits on the
   * top rule.
   */
  box(c: number, r: number, w: number, h: number, color: string, bright: string, title?: string, ink = "#000") {
    const x = c * CW + 4;
    const y = r * CH + 8;
    const bw = w * CW - 8;
    const bh = h * CH - 16;
    this.outline(x, y, bw, bh, color);
    // bright corners
    const l = 10;
    for (const [cx, cy] of [
      [x, y],
      [x + bw - l, y],
      [x, y + bh - 2],
      [x + bw - l, y + bh - 2],
    ]) {
      this.px(cx, cy, l, 2, bright);
    }
    for (const [cx, cy] of [
      [x, y],
      [x + bw - 2, y],
      [x, y + bh - l],
      [x + bw - 2, y + bh - l],
    ]) {
      this.px(cx, cy, 2, l, bright);
    }
    if (title) this.plate(c + 2, r, title, ink, bright);
  }

  /** A horizontal rule through the middle of a row. */
  rule(c: number, r: number, w: number, color: string) {
    this.px(c * CW, r * CH + 8, w * CW, 2, color);
  }

  /** Dots along the foot of a row: the leader between a label and its value. */
  dots(c: number, r: number, w: number, color: string) {
    this.ctx.fillStyle = color;
    for (let x = c * CW + 2; x < (c + w) * CW - 2; x += 6) this.ctx.fillRect(x, r * CH + 14, 2, 2);
  }

  /** Diagonal hatching over a block of pixels. */
  hatch(x: number, y: number, w: number, h: number, color: string) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = color;
    for (let i = -h; i < w; i += 8) {
      for (let j = 0; j < h; j += 2) ctx.fillRect(x + i + (h - j), y + j, 3, 2);
    }
    ctx.restore();
  }

  /** A one-bit picture from rows of `#`, each dot `p` pixels square. */
  bitmap(x: number, y: number, rows: readonly string[], p: number, color: string) {
    this.ctx.fillStyle = color;
    rows.forEach((row, j) => {
      let i = 0;
      while (i < row.length) {
        if (row[i] !== "#") {
          i += 1;
          continue;
        }
        let run = 1;
        while (row[i + run] === "#") run += 1;
        this.ctx.fillRect(x + i * p, y + j * p, run * p, p);
        i += run;
      }
    });
  }

  /** Mark a block of cells as something the pointer can press. Later zones sit on top. */
  zone(id: string, c: number, r: number, w: number, h: number) {
    this.zones.push({ id, x: c * CW, y: r * CH, w: w * CW, h: h * CH });
  }

  hit(x: number, y: number): string | null {
    for (let i = this.zones.length - 1; i >= 0; i -= 1) {
      const z = this.zones[i];
      if (x >= z.x && y >= z.y && x < z.x + z.w && y < z.y + z.h) return z.id;
    }
    return null;
  }
}
