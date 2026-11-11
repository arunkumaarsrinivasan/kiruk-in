/**
 * What is on the tube. Two screens share one head and one status line:
 *
 *   the board    every project as a cell, a dossier for the one pointed at,
 *                the work log and a filter by kind
 *   a project    its identity, and its story in tabs; where a project belongs
 *                to a full case, the case's numbers and versions are tabs too
 *
 * Each screen is laid out in cells from the room it is given, so the same
 * drawing serves a wide desk tube and a phone held upright.
 */

import type { WorkCaseDigest } from "../types";
import { CLS_LABEL, type Board, type Cls, type Tint, type Unit } from "./model";
import { WORK_SHOW } from "@/data/work-show";
import { GLYPHS, iconRows } from "./pixel-icons";
import { drawScene } from "./scenes";
import { CH, CW, fit, shade, wrap, type Surface } from "./surface";

export type TabId = "about" | "brief" | "built" | "impact" | "stack" | "pictures" | "case" | "versions";

const TAB_LABEL: Record<TabId, string> = {
  about: "ABOUT",
  brief: "BRIEF",
  built: "WHAT I BUILT",
  impact: "IMPACT",
  stack: "STACK",
  case: "NUMBERS",
  versions: "VERSIONS",
  pictures: "PICTURES",
};

const STATUS: Record<string, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  planned: "Planned",
};

const LINK_LABEL: Record<string, string> = {
  live: "LIVE SITE",
  demo: "DEMO",
  figma: "FIGMA",
  behance: "BEHANCE",
  github: "SOURCE",
};

const GREEN = "#46ff7e";
const ORANGE = "#ff8a2a";

/** The colour each kind of project burns in. */
export const TINT: Record<Tint, string> = {
  amber: "#ffb02e",
  cream: "#f3ead0",
  green: "#a8d618",
  red: "#ff6a3d",
};

export interface Pal {
  phos: string;
  dim: string;
  faint: string;
  ghost: string;
  plasma: string;
  plasmaDim: string;
  ink: string;
}

const BLUE = "#7fc4ff";

/** The phosphor the picture is drawn in. */
export type TubeColor = "crt" | "plasma" | "ice";

const TUBE_COLOR_NAME: Record<TubeColor, string> = { crt: "GREEN", plasma: "PLASMA", ice: "BLUE" };

/** What the visitor can set about the display. */
export interface TubeConfig {
  /** Brightness of the beam, 1 as built. */
  gain: number;
  /** How far the middle of the glass swells. */
  curve: number;
  /** How much every lit thing blooms, 1 as built. */
  glow: number;
  scan: boolean;
  /** Mains hum, flicker and grain. */
  hum: boolean;
  color: TubeColor;
}

export const TUBE_DEFAULTS: TubeConfig = { gain: 1, curve: 0.11, glow: 1, scan: true, hum: true, color: "crt" };

/** The ends of each slider. */
export const TUBE_RANGE = { gain: [0.6, 1.6], curve: [0, 0.2], glow: [0, 2] } as const;

/** The tube's two lights. On a plasma panel they trade places. */
export function palette(tube: TubeColor): Pal {
  const phos = phosphorHex(tube);
  const plasma = plasmaHex(tube);
  return {
    phos,
    dim: shade(phos, 0.58),
    faint: shade(phos, 0.32),
    ghost: shade(phos, 0.16),
    plasma,
    plasmaDim: shade(plasma, 0.5),
    ink: "#020603",
  };
}

export function phosphorHex(tube: TubeColor): string {
  return tube === "crt" ? GREEN : tube === "plasma" ? ORANGE : BLUE;
}
export function plasmaHex(tube: TubeColor): string {
  return tube === "plasma" ? GREEN : ORANGE;
}

/** A block of cells. */
export interface Area {
  c: number;
  r: number;
  w: number;
  h: number;
}

export interface ViewState {
  board: Board;
  /** The full case each project belongs to, by project id. */
  cases: ReadonlyMap<string, WorkCaseDigest>;
  open: Unit | null;
  tab: TabId;
  scroll: number;
  /** The project the dossier shows. */
  peek: Unit | null;
  /** The project the pointer or the keys are on right now. */
  onId: string | null;
  shownCls: Cls | null;
  filter: Cls | null;
  tube: TubeColor;
  /** The display settings, and whether their panel is open. */
  config: TubeConfig;
  configOpen: boolean;
  /** The pointer in surface pixels, for the scenes that answer it. */
  pointer: { x: number; y: number } | null;
  /** The open work's pictures, dithered for the tube; null while one loads. */
  pics: (HTMLCanvasElement | null)[];
  pic: number;
  /** The zone under the pointer. */
  hover: string | null;
  /** How far each cell is from the pointer, 0 near … 3 far; null lets a wave cross them. */
  levels: number[] | null;
  time: number;
  clock: string;
  status: string;
  /** The cells the lids and the corners leave in view. */
  safe: Area;
}

export interface Drawn {
  maxScroll: number;
  /** Columns of text in the open tab, so pictures can be made to fit. */
  textCols: number;
  /** Columns of cells on the board, for the arrow keys. */
  cols: number;
  tabs: TabId[];
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const even = (v: number) => Math.round(v / 2) * 2;
const blink = (time: number, rate = 1.6) => (time * rate) % 1 < 0.5;

/* ── small parts ── */

export function lamp(s: Surface, c: number, r: number, color: string, time: number) {
  if (blink(time)) s.px(c * CW + 2, r * CH + 6, 6, 8, color);
  s.text(c + 1, r, "LIVE", color);
}

/** label ........ value */
export function fact(s: Surface, P: Pal, c: number, r: number, w: number, label: string, value: string, color = P.phos) {
  const v = fit(value.toUpperCase(), Math.max(4, w - label.length - 3));
  const vx = c + w - v.length;
  s.text(c, r, label, P.dim);
  s.text(vx, r, v, color);
  s.dots(c + label.length + 1, r, vx - c - label.length - 2, P.faint);
}

/** A three-cell key holding one glyph. */
export function glyphKey(s: Surface, id: string, c: number, r: number, glyph: readonly string[], color: string, ink: string, lit: boolean) {
  const x = c * CW;
  const y = r * CH + 2;
  if (lit) s.px(x, y, 3 * CW, CH - 4, color);
  else s.outline(x, y, 3 * CW, CH - 4, color);
  s.bitmap(x + 8, y + 1, glyph, 2, lit ? ink : color);
  s.zone(id, c, r, 3, 1);
  return c + 3;
}

/** A key that leaves the tube: its label and an arrow out. */
export function linkKey(s: Surface, id: string, c: number, r: number, label: string, color: string, ink: string, lit: boolean) {
  const end = s.key(id, c, r, `${label}  `, color, ink, lit);
  s.bitmap((end - 3) * CW + 4, r * CH + 3, GLYPHS.out, 2, lit ? ink : color);
  return end;
}

/** Rows of text and pictures that can be longer than their pane and scroll in it. */
export class Flow {
  private readonly ops: { h: number; draw: (s: Surface, c: number, r: number) => void }[] = [];
  height = 0;

  constructor(readonly w: number) {}

  add(h: number, draw: (s: Surface, c: number, r: number) => void) {
    this.ops.push({ h, draw });
    this.height += h;
  }

  gap(n = 1) {
    this.add(n, () => {});
  }

  p(text: string, color: string) {
    for (const line of wrap(text, this.w)) this.add(1, (s, c, r) => void s.text(c, r, line, color));
  }

  head(text: string, color: string, rule: string) {
    this.add(1, (s, c, r) => {
      const end = s.text(c, r, text.toUpperCase(), color);
      s.rule(end + 1, r, this.w - (end - c) - 1, rule);
    });
  }

  li(text: string, color: string, bullet: string) {
    wrap(text, this.w - 3).forEach((line, i) =>
      this.add(1, (s, c, r) => {
        if (i === 0) s.px(c * CW + 2, r * CH + 6, 6, 8, bullet);
        s.text(c + 3, r, line, color);
      }),
    );
  }

  /** A number at double size with what it counts beside it. */
  big(value: string, label: string, color: string, text: string) {
    const lines = wrap(label, Math.max(8, this.w - value.length * 2 - 2)).slice(0, 2);
    this.add(2, (s, c, r) => {
      const end = s.text(c, r, value, color, 2);
      lines.forEach((line, i) => s.text(end + 2, r + i, line, text));
    });
  }

  stat(value: string, label: string, color: string, text: string) {
    const lines = wrap(label, Math.max(8, this.w - 10));
    lines.forEach((line, i) =>
      this.add(1, (s, c, r) => {
        if (i === 0) s.text(c + Math.max(0, 8 - value.length), r, value, color);
        s.text(c + 10, r, line, text);
      }),
    );
  }

  draw(s: Surface, c: number, r0: number, top: number, bottom: number) {
    let r = r0;
    for (const op of this.ops) {
      if (r + op.h > top && r < bottom) op.draw(s, c, r);
      r += op.h;
    }
  }
}

/** The stage a work's moving picture plays on. */
function stage(s: Surface, v: ViewState, P: Pal, u: Unit, x: number, y: number, w: number, h: number) {
  const tint = TINT[u.tint];
  s.px(x, y, w, h, "#000");
  s.outline(x, y, w, h, shade(tint, 0.45));
  const show = WORK_SHOW[u.id];
  if (!show) {
    s.bitmap(x + 12, y + even((h - 72) / 2), iconRows(u.id), 6, tint);
    return;
  }
  drawScene(show.scene, {
    s,
    x: x + 4,
    y: y + 4,
    w: w - 8,
    h: h - 8,
    t: v.time,
    pointer: v.pointer,
    ink: tint,
    soft: shade(tint, 0.6),
    faint: shade(tint, 0.3),
    hot: P.plasma,
  });
}

/** What the pointer does to a work's scene: the second half of its `plays` line. */
function pointerHint(u: Unit): string {
  const plays = WORK_SHOW[u.id]?.plays ?? "";
  const cut = plays.indexOf(";");
  const hint = cut < 0 ? "" : plays.slice(cut + 1).trim();
  return (hint.endsWith(".") ? hint.slice(0, -1) : hint).toUpperCase();
}

/* ── the head and the status line ── */

function head(s: Surface, v: ViewState, P: Pal, a: Area) {
  const { c, r, w } = a;
  const narrow = w < 56;
  let x = s.plate(c, r, narrow ? "KIRUK" : "KIRUK STATION", P.ink, P.phos);
  if (!narrow) x = s.text(x + 1, r, "WORK", P.phos);

  let right = c + w - v.clock.length;
  s.text(right, r, v.clock, P.plasma);
  if (w >= 92) {
    const count = `${v.board.units.length} PROJECTS · ${v.board.liveCount} LIVE`;
    right -= count.length + 2;
    s.text(right, r, count, P.phos);
  }
  const label = "DISPLAY";
  right -= label.length + 4;
  s.key("tube", right, r, label, P.phos, P.ink, v.hover === "tube");
  // the way out of the tube: the same work as plain pages in this era
  const read = narrow ? "READ" : "READ AS PAGES";
  right -= read.length + 3;
  s.key("read", right, r, read, P.plasma, P.ink, v.hover === "read");

  const x0 = (x + 1) * CW;
  const x1 = (right - 1) * CW;
  if (x1 - x0 > 30) {
    s.px(x0, r * CH + 2, x1 - x0, 2, P.faint);
    s.hatch(x0, r * CH + 6, x1 - x0, 8, P.dim);
    s.px(x0, r * CH + 16, x1 - x0, 2, P.faint);
  }
}

export function statusLine(s: Surface, v: Pick<ViewState, "hover" | "status"> & { open: unknown }, P: Pal, a: Area) {
  const { c, r, w } = a;
  s.px(c * CW, r * CH - 8, w * CW, 2, P.plasmaDim);
  let right = c + w;
  const open = !!v.open;
  if (w >= 84) {
    right -= 8;
    s.key("key:b", right, r, "B BACK", open ? P.plasma : P.ghost, P.ink, open && v.hover === "key:b");
    right -= 9;
    s.key("key:a", right, r, "A OPEN", open ? P.ghost : P.phos, P.ink, !open && v.hover === "key:a");
    right -= 1;
    for (const [id, glyph] of [
      ["key:right", GLYPHS.right],
      ["key:down", GLYPHS.down],
      ["key:up", GLYPHS.up],
      ["key:left", GLYPHS.left],
    ] as const) {
      right -= 4;
      glyphKey(s, id, right, r, glyph, P.phos, P.ink, v.hover === id);
    }
  } else if (open) {
    right -= 8;
    s.key("key:b", right, r, "B BACK", P.plasma, P.ink, v.hover === "key:b");
  }
  s.text(c, r, fit(`> ${v.status.toUpperCase()}`, right - c - 2), P.plasma);
}

/* ── the board ── */

/** How bright a cell burns: 0 full … 3 low, 4 switched off by the filter. */
const BURN = [1, 0.86, 0.66, 0.5, 0.2];

function levelOf(v: ViewState, i: number): number {
  if (v.levels) return v.levels[i] ?? 2;
  // at rest a wave of light crosses the cells
  const t = (((v.time * 1.15 - i * 0.34) % 8.4) + 8.4) % 8.4;
  return t < 0.3 ? 1 : t < 0.7 ? 0 : t < 1.1 ? 1 : 2;
}

function cell(s: Surface, v: ViewState, P: Pal, u: Unit, i: number, c: number, r: number, tw: number, th: number) {
  const tint = TINT[u.tint];
  const off = v.shownCls !== null && u.cls !== v.shownCls;
  const lit = v.onId === u.id;
  const level = off ? 4 : lit ? 0 : levelOf(v, i);
  const x = c * CW + 3;
  const y = r * CH + 4;
  const w = tw * CW - 6;
  const h = th * CH - 8;
  const ink = lit ? P.ink : shade(tint, BURN[level]);
  const soft = lit ? shade(tint, 0.34) : shade(tint, BURN[level] * 0.62);

  if (lit) {
    s.px(x, y, w, h, tint);
    // stepped corners, so a lit cell reads as a handheld's screen
    for (const [cx, cy] of [
      [x, y],
      [x + w - 4, y],
      [x, y + h - 4],
      [x + w - 4, y + h - 4],
    ]) {
      s.px(cx, cy, 4, 4, "#000");
    }
  } else {
    s.outline(x, y, w, h, shade(tint, BURN[level] * 0.55));
    for (const [cx, cy] of [
      [x, y],
      [x + w - 8, y],
      [x, y + h - 2],
      [x + w - 8, y + h - 2],
    ]) {
      s.px(cx, cy, 8, 2, ink);
    }
  }

  const stacked = th >= 7;
  // a tall cell stacks picture over name; a short one sets a smaller picture beside it
  const p = stacked ? (th >= 11 && tw >= 24 ? 6 : 4) : tw >= 24 ? 4 : 2;
  const iconRowsTall = Math.ceil((12 * p + 2) / CH);
  const name = u.label.toUpperCase();
  const full = `${u.year} · ${CLS_LABEL[u.cls].toUpperCase()}`;
  // the year and the kind, or only the year where the cell is too narrow for both
  const metaFor = (room: number) => (full.length <= room ? full : u.year);
  s.bitmap(x + 9, (r + 1) * CH + 2, iconRows(u.id), p, ink);

  if (stacked) {
    s.text(c + tw - 4, r + 1, u.no, soft);
    if (u.live && tw >= 18) lamp(s, c + tw - 7, r + 2, ink, v.time);
    const room = tw - 3;
    const free = th - 3 - iconRowsTall;
    const lines = wrap(name, room).slice(0, Math.max(1, Math.min(2, free - 1)));
    lines.forEach((line, j) => s.text(c + 2, r + th - 2 - lines.length + j, fit(line, room), ink));
    s.text(c + 2, r + th - 2, metaFor(room), soft);
  } else {
    // a short cell lays the picture beside the name
    const tc = c + 2 + Math.ceil((16 * p) / CW) + 1;
    const room = c + tw - 2 - tc;
    const lines = wrap(name, room).slice(0, 2);
    lines.forEach((line, j) => s.text(tc, r + 1 + j, fit(line, room), ink));
    if (lines.length < 2 || th >= 6) s.text(tc, r + 1 + lines.length, metaFor(room), soft);
    if (u.live && th >= 6 && lines.length < 2) lamp(s, tc, r + th - 2, ink, v.time);
  }
  s.zone(`tile:${u.id}`, c, r, tw, th);
}

interface Plan {
  cols: number;
  tw: number;
  th: number;
}

/** The columns of cells that sit best in a block: each near the shape of a small screen. */
function planCells(n: number, w: number, h: number): Plan | null {
  let best: (Plan & { score: number }) | null = null;
  for (const cols of [6, 4, 3, 2]) {
    const rows = Math.ceil(Math.max(1, n) / cols);
    const tw = Math.min(40, Math.floor(w / cols));
    const th = Math.min(13, Math.floor(h / rows));
    if (tw < 14 || th < 5) continue;
    const score = -Math.abs(Math.log((tw * CW) / (th * CH) / 1.55));
    if (!best || score > best.score) best = { cols, tw, th, score };
  }
  return best;
}

function cells(s: Surface, v: ViewState, P: Pal, a: Area, plan: Plan) {
  const units = v.board.units;
  const rows = Math.ceil(Math.max(1, units.length) / plan.cols);
  const ox = a.c + Math.floor((a.w - plan.cols * plan.tw) / 2);
  const oy = a.r + Math.floor((a.h - rows * plan.th) / 2);
  units.forEach((u, i) => {
    cell(s, v, P, u, i, ox + (i % plan.cols) * plan.tw, oy + Math.floor(i / plan.cols) * plan.th, plan.tw, plan.th);
  });
}

/** On a narrow tube the projects are a list, two rows each. */
function list(s: Surface, v: ViewState, P: Pal, a: Area) {
  const units = v.board.units;
  const per = a.h >= units.length * 2 ? 2 : 1;
  units.forEach((u, i) => {
    const r = a.r + i * per;
    if (r + per > a.r + a.h) return;
    const tint = TINT[u.tint];
    const off = v.shownCls !== null && u.cls !== v.shownCls;
    const lit = v.onId === u.id;
    const ink = lit ? P.ink : shade(tint, off ? 0.22 : 1);
    const soft = lit ? shade(tint, 0.34) : shade(tint, off ? 0.16 : 0.58);
    if (lit) s.px(a.c * CW, r * CH + 2, a.w * CW, per * CH - 4, tint);
    if (per === 2) s.bitmap(a.c * CW + 4, r * CH + 8, iconRows(u.id), 2, ink);
    const tc = a.c + (per === 2 ? 5 : 0);
    s.text(tc, r, u.no, soft);
    s.text(tc + 3, r, fit(u.label.toUpperCase(), a.w - (tc - a.c) - 3 - 5), ink);
    s.text(a.c + a.w - 4, r, u.year, soft);
    if (per === 2) {
      s.text(tc + 3, r + 1, CLS_LABEL[u.cls].toUpperCase(), soft);
      if (u.live) lamp(s, a.c + a.w - 5, r + 1, ink, v.time);
    }
    s.zone(`tile:${u.id}`, a.c, r, a.w, per);
  });
}

function filterRow(s: Surface, v: ViewState, P: Pal, c: number, r: number, w: number) {
  const short = w < 44;
  let x = s.key("kind:all", c, r, "ALL", P.phos, P.ink, v.filter === null || v.hover === "kind:all") + 1;
  for (const k of v.board.classes) {
    const label = short ? CLS_LABEL[k.cls].toUpperCase().slice(0, 3) : `${CLS_LABEL[k.cls].toUpperCase()} ${k.count}`;
    const id = `kind:${k.cls}`;
    x = s.key(id, x, r, label, TINT[k.tint], P.ink, v.filter === k.cls || v.hover === id) + 1;
  }
}

/** The work as a scope: one turn of the dial is the years on the log, each project a blip at its start. */
function scope(s: Surface, v: ViewState, P: Pal, cx: number, cy: number, radius: number) {
  const ctx = s.ctx;
  const b = v.board;
  const turn = Math.PI * 2;
  const sweep = (Math.floor(((v.time * 0.85) % turn) / (turn / 96)) * turn) / 96 - Math.PI / 2;

  ctx.lineWidth = 2;
  ctx.strokeStyle = P.faint;
  for (const k of [0.25, 0.5, 0.75, 1]) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius * k, 0, turn);
    ctx.stroke();
  }
  s.px(cx - radius, cy - 1, radius * 2, 2, P.ghost);
  s.px(cx - 1, cy - radius, 2, radius * 2, P.ghost);

  // the trail behind the sweep, in three steps
  for (const [back, color] of [
    [0.75, P.ghost],
    [0.4, shade(P.phos, 0.24)],
    [0.16, P.faint],
  ] as const) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, sweep - back, sweep);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = P.phos;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + radius * Math.cos(sweep), cy + radius * Math.sin(sweep));
  ctx.stroke();

  for (const y of b.years) {
    const a = y.x * turn - Math.PI / 2;
    ctx.strokeStyle = P.dim;
    ctx.beginPath();
    ctx.moveTo(cx + radius * 0.93 * Math.cos(a), cy + radius * 0.93 * Math.sin(a));
    ctx.lineTo(cx + radius * 1.06 * Math.cos(a), cy + radius * 1.06 * Math.sin(a));
    ctx.stroke();
  }

  for (const u of b.units) {
    const a = u.x * turn - Math.PI / 2;
    const rr = radius * (0.24 + (0.7 * u.lane) / Math.max(1, b.lanes - 1));
    // a blip is brightest just after the sweep has passed it
    const age = ((((sweep - a) % turn) + turn) % turn) / turn;
    s.px(even(cx + rr * Math.cos(a)) - 4, even(cy + rr * Math.sin(a)) - 4, 8, 8, shade(TINT[u.tint], 1 - 0.72 * age));
  }
}

/** The side pane: a scope at rest, a dossier when something is pointed at. */
function side(s: Surface, v: ViewState, P: Pal, a: Area) {
  const u = v.peek;
  s.box(a.c, a.r, a.w, a.h, P.dim, P.phos, u ? "DOSSIER" : "SCOPE", P.ink);
  const c = a.c + 2;
  const w = a.w - 4;
  const bottom = a.r + a.h - 2;
  let r = a.r + 1;

  if (!u) {
    const textRows = 4;
    const radius = even(Math.min((w * CW) / 2 - 12, ((bottom - r + 1 - textRows) * CH) / 2 - 8));
    if (radius >= 28) {
      scope(s, v, P, even((a.c + a.w / 2) * CW), r * CH + 8 + radius, radius);
      r += Math.ceil((radius * 2 + 16) / CH);
    }
    const centre = (text: string) => a.c + Math.floor((a.w - text.length) / 2);
    const years = `${v.board.firstYear}–${v.board.lastYear} · ONE TURN OF THE DIAL`;
    if (years.length <= w) s.text(centre(years), r, years, P.dim);
    const count = `${v.board.units.length} PROJECTS`;
    s.text(a.c + Math.floor((a.w - count.length * 2) / 2), r + 1, count, P.phos, 2);
    const hint = "POINT AT A SCREEN";
    s.text(centre(hint), r + 3, hint, P.phos);
    if (blink(v.time, 1)) s.px((centre(hint) + hint.length + 1) * CW, (r + 3) * CH + 4, 6, 12, P.phos);
    return;
  }

  const tint = TINT[u.tint];
  const kase = v.cases.get(u.id);
  const total = String(v.board.units.length).padStart(2, "0");
  const tall = a.h >= 22;
  const bannerRows = tall ? 8 : 5;

  stage(s, v, P, u, c * CW, r * CH + 2, w * CW, bannerRows * CH - 4);
  r += bannerRows + (tall ? 1 : 0);

  // its number and lamp sit beside the name, where they glow instead of drowning in the lit field
  const no = `${u.no} / ${total}`;
  s.text(c + w - no.length, r, no, P.dim);
  if (u.live) lamp(s, c + w - 5, r + 1, tint, v.time);
  const nameW = Math.floor((w - no.length - 1) / 2);
  for (const line of wrap(u.label.toUpperCase(), nameW).slice(0, tall ? 2 : 1)) {
    s.text(c, r, fit(line, nameW), tint, 2);
    r += 2;
  }
  for (const line of wrap(u.project.description, w).slice(0, tall ? 3 : 2)) {
    if (r > bottom - 5) break;
    s.text(c, r, line, P.phos);
    r += 1;
  }
  if (tall) r += 1;

  const rows: [string, string][] = [
    ["ROLE", u.project.role],
    ["WHEN", `${u.period} · ${u.project.timeline.duration}`],
    ["KIND", CLS_LABEL[u.cls]],
    ["STATE", `${STATUS[u.project.status] ?? u.project.status}${u.nda ? " · NDA" : ""}`],
  ];
  for (const [k, val] of rows) {
    if (r > bottom - 1) break;
    fact(s, P, c, r, w, k, val);
    r += 1;
  }
  if (kase && r + 3 <= bottom - 1) {
    r += 1;
    const end = s.text(c, r, kase.headline.value, P.plasma, 2);
    wrap(kase.headline.label.toUpperCase(), c + w - end - 2)
      .slice(0, 2)
      .forEach((line, i) => s.text(end + 2, r + i, line, P.plasma));
  }
  s.text(c, bottom, "CLICK TO OPEN", P.plasma);
  if (blink(v.time, 1)) s.px((c + 14) * CW, bottom * CH + 4, 6, 12, P.plasma);
}

/** The work log: every project as a bar on the years. */
function log(s: Surface, v: ViewState, P: Pal, a: Area) {
  const b = v.board;
  s.box(a.c, a.r, a.w, a.h, P.dim, P.phos, `WORK LOG ${b.firstYear}–${b.lastYear}`, P.ink);
  const c = a.c + 2;
  const w = a.w - 4;
  const x0 = c * CW;
  const pw = w * CW;
  const laneTop = a.r + 2;
  const bottomY = (a.r + a.h - 1) * CH + 2;

  for (const y of b.years) {
    const x = even(x0 + y.x * pw);
    s.text(Math.round(x / CW) + 1, a.r + 1, String(y.year), P.dim);
    for (let yy = (a.r + 1) * CH + 4; yy < bottomY; yy += 6) s.px(x, yy, 2, 2, P.faint);
  }

  for (const u of b.units) {
    const row = laneTop + u.lane;
    if (row > a.r + a.h - 2) continue;
    const off = v.shownCls !== null && u.cls !== v.shownCls;
    const on = v.peek?.id === u.id || v.hover === `bar:${u.id}`;
    const bx = even(x0 + u.x * pw);
    const bw = Math.max(26, even(u.w * pw) - 4);
    const by = row * CH + 2;
    const color = off ? P.ghost : on ? P.phos : P.dim;
    if (on) s.px(bx, by, bw, 16, P.phos);
    else {
      s.px(bx, by, bw, 16, shade(P.phos, off ? 0.04 : 0.1));
      s.outline(bx, by, bw, 16, color);
    }
    s.text(Math.ceil((bx + 2) / CW), row, u.no, on ? P.ink : color);
    s.zone(`bar:${u.id}`, Math.floor(bx / CW), row, Math.ceil(bw / CW), 1);
  }

  const nx = even(x0 + b.nowX * pw);
  s.px(nx, (a.r + 1) * CH + 4, 2, bottomY - (a.r + 1) * CH - 4, P.plasma);
  // name the line only where the last year's label leaves room for it
  const lastYear = b.years[b.years.length - 1];
  const nowCol = Math.round(nx / CW) - 4;
  if (!lastYear || nowCol >= Math.round((x0 + lastYear.x * pw) / CW) + 6) s.text(nowCol, a.r + 1, "NOW", P.plasma);
}

/** The kinds of work, as a bar each. Pointing at one lights its cells; pressing it holds them. */
function kinds(s: Surface, v: ViewState, P: Pal, a: Area) {
  s.box(a.c, a.r, a.w, a.h, P.dim, P.phos, "FILTER BY KIND", P.ink);
  const c = a.c + 2;
  const w = a.w - 4;
  const rows = v.board.classes;
  const step = a.h - 2 >= rows.length * 2 ? 2 : 1;
  const most = Math.max(1, ...rows.map((k) => k.count));
  const barCols = w - 12;
  const unit = Math.max(2, Math.floor(barCols / most));
  rows.forEach((k, i) => {
    const r = a.r + 1 + i * step + (step === 2 ? Math.floor((a.h - 2 - rows.length * 2) / 2) : 0);
    if (r > a.r + a.h - 2) return;
    const id = `kind:${k.cls}`;
    const tint = TINT[k.tint];
    const held = v.filter === k.cls;
    const hot = held || v.hover === id || v.peek?.cls === k.cls;
    const label = CLS_LABEL[k.cls].toUpperCase();
    if (held) s.plate(c - 1, r, label, P.ink, tint);
    else s.text(c, r, label, hot ? tint : shade(tint, 0.62));
    for (let j = 0; j < k.count; j += 1) {
      s.px((c + 8 + j * unit) * CW, r * CH + 4, unit * CW - 4, 12, hot ? tint : shade(tint, 0.42));
    }
    s.text(c + w - 2, r, String(k.count).padStart(2, " "), hot ? tint : shade(tint, 0.62));
    s.zone(id, a.c + 1, r, a.w - 2, 1);
  });
}

function board(s: Surface, v: ViewState, P: Pal, a: Area): Drawn {
  if (a.w < 56) {
    filterRow(s, v, P, a.c, a.r, a.w);
    list(s, v, P, { c: a.c, r: a.r + 2, w: a.w, h: a.h - 2 });
    return { maxScroll: 0, textCols: 0, cols: 1, tabs: [] };
  }

  // Try the fullest layout first, and drop panes until the cells have room.
  const wantSide = a.w >= 88 ? clamp(Math.round(a.w * 0.27), 30, 48) : 0;
  const wantDeck = v.board.lanes + 3;
  const n = v.board.units.length;
  for (const [sideW, deckH] of [
    [wantSide, wantDeck],
    [wantSide, 0],
    [0, wantDeck],
    [0, 0],
  ]) {
    const kindsW = deckH ? sideW || (a.w >= 80 ? 34 : 0) : 0;
    const filterRows = kindsW ? 0 : 2;
    const top = a.r + filterRows;
    const gridH = a.h - filterRows - deckH;
    const gridW = a.w - (sideW ? sideW + 1 : 0);
    const plan = planCells(n, gridW, gridH);
    if (!plan && (sideW || deckH)) continue;

    if (filterRows) filterRow(s, v, P, a.c, a.r, a.w);
    if (plan) cells(s, v, P, { c: a.c, r: top, w: gridW, h: gridH }, plan);
    else list(s, v, P, { c: a.c, r: top, w: gridW, h: gridH });
    if (sideW) side(s, v, P, { c: a.c + gridW + 1, r: top, w: sideW, h: gridH });
    if (deckH) {
      log(s, v, P, { c: a.c, r: top + gridH, w: a.w - (kindsW ? kindsW + 1 : 0), h: deckH });
      if (kindsW) kinds(s, v, P, { c: a.c + a.w - kindsW, r: top + gridH, w: kindsW, h: deckH });
    }
    return { maxScroll: 0, textCols: 0, cols: plan?.cols ?? 1, tabs: [] };
  }
  return { maxScroll: 0, textCols: 0, cols: 1, tabs: [] };
}

/* ── a project ── */

function months(iso: string): number {
  const [y, m] = iso.split("-").map(Number);
  return y * 12 + ((m || 1) - 1);
}

function strip(s: Surface, v: ViewState, P: Pal, a: Area, u: Unit) {
  const units = v.board.units;
  if (a.w >= units.length * 5 + 20) {
    let x = a.c;
    for (const m of units) {
      const id = `mini:${m.id}`;
      x = s.key(id, x, a.r, m.no, TINT[m.tint], P.ink, m.id === u.id || v.hover === id) + 1;
    }
    const hov = v.hover?.startsWith("mini:") ? units.find((m) => `mini:${m.id}` === v.hover) : null;
    if (hov && hov.id !== u.id) s.text(x + 1, a.r, fit(`> ${hov.label.toUpperCase()}`, a.c + a.w - x - 1), TINT[hov.tint]);
    return;
  }
  let x = glyphKey(s, "key:left", a.c, a.r, GLYPHS.left, P.phos, P.ink, v.hover === "key:left") + 1;
  x = s.text(x, a.r, `${u.no} / ${String(units.length).padStart(2, "0")}`, TINT[u.tint]) + 1;
  glyphKey(s, "key:right", x, a.r, GLYPHS.right, P.phos, P.ink, v.hover === "key:right");
}

/** Who the project is: its picture, name, pitch, facts and the keys that leave the tube. */
function identity(s: Surface, v: ViewState, P: Pal, u: Unit, a: Area) {
  const tint = TINT[u.tint];
  const total = String(v.board.units.length).padStart(2, "0");
  s.box(a.c, a.r, a.w, a.h, shade(tint, 0.55), tint, `PROJECT ${u.no} / ${total}`, P.ink);
  const c = a.c + 2;
  const w = a.w - 4;
  const bottom = a.r + a.h - 2;
  let r = a.r + 1;
  const tall = a.h >= 24;
  const bannerRows = tall ? 9 : 6;

  stage(s, v, P, u, c * CW, r * CH + 2, w * CW, bannerRows * CH - 4);
  r += bannerRows;
  const hint = pointerHint(u);
  if (hint) s.text(c, r, fit(hint, w), P.dim);
  r += 1;

  if (u.live) lamp(s, c + w - 5, r, tint, v.time);
  const nameW = Math.floor((w - (u.live ? 6 : 0)) / 2);
  for (const line of wrap(u.label.toUpperCase(), nameW).slice(0, 2)) {
    s.text(c, r, fit(line, nameW), tint, 2);
    r += 2;
  }
  const links = Object.entries(u.project.links ?? {}).filter(([, href]) => typeof href === "string" && href) as [string, string][];
  const linkRows = links.length ? 2 : 1;
  for (const line of wrap(u.project.description, w).slice(0, tall ? 5 : 3)) {
    if (r > bottom - 5 - linkRows) break;
    s.text(c, r, line, P.phos);
    r += 1;
  }
  r += 1;
  const rows: [string, string][] = [
    ["ROLE", u.project.role],
    ["WHEN", `${u.period} · ${u.project.timeline.duration}`],
    ["KIND", CLS_LABEL[u.cls]],
    ["STATE", `${STATUS[u.project.status] ?? u.project.status}${u.nda ? " · NDA" : ""}`],
  ];
  for (const [k, val] of rows) {
    if (r > bottom - linkRows) break;
    fact(s, P, c, r, w, k, val);
    r += 1;
  }

  if (links.length) {
    let x = c;
    for (const [kind2] of links) {
      const label = LINK_LABEL[kind2] ?? kind2.toUpperCase();
      if (x + label.length + 4 > c + w) break;
      x = linkKey(s, `link:${kind2}`, x, bottom, label, P.phos, P.ink, v.hover === `link:${kind2}`) + 1;
    }
    if (x + 17 <= c + w) linkKey(s, "text", x, bottom, "READ AS PAGE", P.plasma, P.ink, v.hover === "text");
  } else {
    const end = linkKey(s, "text", c, bottom, "READ AS PAGE", P.plasma, P.ink, v.hover === "text");
    s.text(end + 1, bottom, fit(u.nda ? "VISUALS UNDER NDA" : "LINKS ON REQUEST", c + w - end - 1), P.dim);
  }
}

function fillTab(flow: Flow, tab: TabId, v: ViewState, P: Pal, u: Unit, kase: WorkCaseDigest | undefined) {
  const p = u.project;
  const tint = TINT[u.tint];
  const w = flow.w;

  if (tab === "about") {
    flow.add(7, (s, c, r) => stage(s, v, P, u, c * CW, r * CH + 2, w * CW, 7 * CH - 4));
    const hint = pointerHint(u);
    if (hint) flow.p(hint, P.dim);
    if (u.live) flow.add(1, (s, c, r) => lamp(s, c, r, tint, v.time));
    for (const line of wrap(u.label.toUpperCase(), Math.floor(w / 2)).slice(0, 2)) {
      flow.add(2, (s, c, r) => void s.text(c, r, line, tint, 2));
    }
    flow.p(p.description, P.phos);
    flow.gap();
    const rows: [string, string][] = [
      ["ROLE", p.role],
      ["WHEN", `${u.period} · ${p.timeline.duration}`],
      ["KIND", CLS_LABEL[u.cls]],
      ["STATE", `${STATUS[p.status] ?? p.status}${u.nda ? " · NDA" : ""}`],
    ];
    for (const [k, val] of rows) flow.add(1, (s, c, r) => fact(s, P, c, r, w, k, val));
    flow.gap();
    const links = Object.entries(p.links ?? {}).filter(([, href]) => typeof href === "string" && href) as [string, string][];
    for (const [kind] of links) {
      flow.add(1, (s, c, r) => {
        linkKey(s, `link:${kind}`, c, r, LINK_LABEL[kind] ?? kind.toUpperCase(), P.phos, P.ink, v.hover === `link:${kind}`);
      });
      flow.gap();
    }
    if (!links.length) flow.p(u.nda ? "Visuals withheld under NDA." : "Private build. Links on request.", P.dim);
    flow.add(1, (s, c, r) => void linkKey(s, "text", c, r, "READ AS PAGE", P.plasma, P.ink, v.hover === "text"));
    return;
  }

  if (tab === "brief") {
    flow.p(p.longDescription || p.description, P.phos);
    if (kase) {
      flow.gap();
      flow.head("Part of a full case", P.plasma, P.plasmaDim);
      flow.p(`${kase.title}. ${kase.pitch}`, P.phos);
      flow.p("Its numbers and versions are in the next tabs.", P.dim);
    }
    return;
  }

  if (tab === "built") {
    for (const f of p.features) {
      flow.li(f, P.phos, tint);
      flow.gap();
    }
    return;
  }

  if (tab === "impact") {
    if (p.metrics?.impact) {
      const lines = wrap(p.metrics.impact, w - 2);
      flow.add(lines.length, (s, c, r) => {
        s.px(c * CW, r * CH + 2, w * CW, lines.length * CH - 4, tint);
        lines.forEach((line, i) => s.text(c + 1, r + i, line, P.ink));
      });
      flow.gap();
    }
    if (p.challenges.length) {
      flow.head("Hard parts", P.dim, P.ghost);
      for (const c of p.challenges) flow.li(c, P.phos, tint);
      flow.gap();
    }
    if (p.learnings.length) {
      flow.head("What it taught", P.dim, P.ghost);
      for (const l of p.learnings) flow.li(l, P.phos, tint);
    }
    return;
  }

  if (tab === "stack") {
    // chips, flowed into rows
    let row: string[] = [];
    let used = 0;
    const rows: string[][] = [];
    for (const t of p.technologies) {
      const need = t.length + 3;
      if (used + need > w && row.length) {
        rows.push(row);
        row = [];
        used = 0;
      }
      row.push(t.toUpperCase());
      used += need;
    }
    if (row.length) rows.push(row);
    for (const chips of rows) {
      flow.add(1, (s, c, r) => {
        let x = c;
        for (const chip of chips) {
          s.outline(x * CW, r * CH + 2, (chip.length + 2) * CW, CH - 4, shade(tint, 0.7));
          s.text(x + 1, r, chip, tint);
          x += chip.length + 3;
        }
      });
      flow.gap();
    }
    return;
  }

  if (tab === "pictures") {
    const media = WORK_SHOW[u.id]?.media ?? [];
    const i = clamp(v.pic, 0, media.length - 1);
    const m = media[i];
    if (!m) return;
    const img = v.pics[i];
    flow.add(img ? Math.ceil(img.height / CH) + 1 : 5, (s, c, r) => {
      if (img) s.ctx.drawImage(img, c * CW, r * CH + 2);
      else s.text(c, r + 2, "DRAWING THE PICTURE", P.dim);
    });
    flow.p(m.caption, P.phos);
    flow.p(m.alt, P.dim);
    if (media.length > 1) {
      flow.gap();
      flow.add(1, (s, c, r) => {
        let x = s.key("pic:prev", c, r, "PREVIOUS", P.phos, P.ink, v.hover === "pic:prev") + 1;
        x = s.key("pic:next", x, r, "NEXT", P.phos, P.ink, v.hover === "pic:next") + 1;
        s.text(x + 1, r, `${i + 1} / ${media.length}`, P.dim);
      });
    }
    return;
  }

  if (!kase) return;

  if (tab === "case") {
    flow.head(`${kase.title} · ${kase.when}`, tint, shade(tint, 0.4));
    flow.p(kase.pitch, P.phos);
    flow.gap();
    const lead = kase.lead ?? kase.headline;
    flow.big(lead.value, lead.label, P.plasma, P.phos);
    flow.gap();
    for (const st of kase.stats) flow.stat(st.value, st.delta ? `${st.label} (${st.delta})` : st.label, tint, P.phos);
    for (const m of kase.meters) {
      const seg = Math.min(30, w - 12);
      flow.add(1, (s, c, r) => {
        s.text(c + Math.max(0, 8 - String(m.value).length - 1), r, `${m.value}%`, tint);
        const litN = Math.round((m.value / m.max) * seg);
        for (let i = 0; i < seg; i += 1) s.px((c + 10 + i) * CW, r * CH + 4, CW - 2, 12, i < litN ? tint : shade(tint, 0.22));
      });
      flow.stat("", m.label, tint, P.phos);
    }

    const trend = kase.trend;
    if (trend?.values.length) {
      flow.gap();
      flow.head(trend.label, P.dim, P.ghost);
      const n = trend.values.length;
      const colW = clamp(Math.floor(w / n), 4, 9);
      const top = Math.max(1, ...trend.values);
      const tall = 7;
      flow.add(tall + 2, (s, c, r) => {
        const base = (r + tall) * CH;
        s.px(c * CW, base, n * colW * CW, 2, P.dim);
        trend.values.forEach((val, i) => {
          const peak = trend.ticks[i] === trend.peak;
          const bh = Math.max(2, even((val / top) * ((tall - 1) * CH - 4)));
          const x = (c + i * colW) * CW;
          s.px(x + 2, base - bh, colW * CW - 6, bh, peak ? P.plasma : tint);
          const text = String(val);
          // the count sits on the row above its bar, clear of it
          const row = Math.max(r, Math.floor((base - bh) / CH) - 1);
          s.text(c + i * colW + Math.max(0, Math.floor((colW - 1 - text.length) / 2)), row, text, peak ? P.plasma : P.phos);
          s.text(c + i * colW, r + tall + 1, fit((trend.ticks[i] ?? "").toUpperCase(), colW - 1), peak ? P.plasma : P.dim);
        });
      });
      if (trend.note) flow.p(trend.note, P.dim);
    }

    const spans = kase.spans;
    if (spans?.rows.length) {
      flow.gap();
      flow.head(spans.label, P.dim, P.ghost);
      const from = months(spans.from);
      const range = Math.max(1, months(spans.to) - from);
      const nameW = Math.min(20, Math.floor(w * 0.4));
      for (const row of spans.rows) {
        flow.add(1, (s, c, r) => {
          s.text(c, r, fit(row.name.toUpperCase(), nameW - 1), P.phos);
          const x0 = (c + nameW) * CW;
          const pw = (w - nameW) * CW;
          s.px(x0, r * CH + 9, pw, 2, P.ghost);
          const a0 = even(x0 + ((months(row.from) - from) / range) * pw);
          const a1 = even(x0 + ((months(row.to) - from) / range) * pw);
          s.px(a0, r * CH + 4, Math.max(6, a1 - a0), 12, tint);
        });
      }
    }

    if (kase.shots.length) {
      flow.gap();
      flow.head("In this case", P.dim, P.ghost);
      for (const shot of kase.shots) flow.li(shot.note ? `${shot.title}. ${shot.note}` : shot.title, P.phos, tint);
    }

    if (kase.facts) {
      flow.gap();
      flow.head("Facts", P.dim, P.ghost);
      const rows: [string, string | undefined][] = [
        ["ROLE", kase.facts.role],
        ["TEAM", kase.facts.team],
        ["WHERE", kase.facts.platform],
        ["STACK", kase.facts.stack],
        ["WHEN", kase.facts.when],
      ];
      for (const [k, val] of rows) {
        if (!val) continue;
        wrap(val, w - 8).forEach((line, i) =>
          flow.add(1, (s, c, r) => {
            if (i === 0) s.text(c, r, k, P.dim);
            s.text(c + 8, r, line, P.phos);
          }),
        );
      }
    }
    if (kase.nda) {
      flow.gap();
      flow.p("Internal screens are under HP's NDA, so nothing here is a capture.", P.dim);
    }
    flow.gap();
    kase.links.forEach((link, i) => {
      flow.add(1, (s, c, r) => {
        linkKey(s, `case:${i}`, c, r, fit(link.label.toUpperCase(), w - 6), P.phos, P.ink, v.hover === `case:${i}`);
      });
      flow.gap();
    });
    return;
  }

  // versions
  for (const it of kase.iterations) {
    flow.add(1, (s, c, r) => {
      let x = s.plate(c, r, it.tag.toUpperCase(), P.ink, it.best ? P.plasma : tint) + 1;
      x = s.text(x, r, it.when.toUpperCase(), P.dim) + 1;
      s.text(x, r, fit(it.title.toUpperCase(), w - (x - c) - (it.best ? 6 : 0)), it.best ? P.plasma : tint);
      if (it.best) s.text(c + w - 4, r, "BEST", P.plasma);
    });
    flow.p(it.note, P.phos);
    flow.gap();
  }
}

function project(s: Surface, v: ViewState, P: Pal, a: Area): Drawn {
  const u = v.open as Unit;
  const tint = TINT[u.tint];
  const kase = v.cases.get(u.id);
  strip(s, v, P, { c: a.c, r: a.r, w: a.w, h: 1 }, u);

  const body: Area = { c: a.c, r: a.r + 2, w: a.w, h: a.h - 2 };
  const wide = body.w >= 84;
  const tabs: TabId[] = [
    ...(wide ? [] : (["about"] as TabId[])),
    "brief",
    "built",
    "impact",
    "stack",
    ...(WORK_SHOW[u.id]?.media.length ? (["pictures"] as TabId[]) : []),
    ...(kase ? (["case"] as TabId[]) : []),
    ...(kase?.iterations.length ? (["versions"] as TabId[]) : []),
  ];
  const tab = tabs.includes(v.tab) ? v.tab : tabs[0];

  let right = body;
  if (wide) {
    const lw = clamp(Math.round(body.w * 0.33), 36, 52);
    identity(s, v, P, u, { c: body.c, r: body.r, w: lw, h: body.h });
    right = { c: body.c + lw + 1, r: body.r, w: body.w - lw - 1, h: body.h };
  }

  // the tabs, wrapped onto as many rows as they need
  let x = right.c + 1;
  let row = right.r;
  for (const t of tabs) {
    const label = TAB_LABEL[t];
    if (x + label.length + 2 > right.c + right.w && x > right.c + 1) {
      x = right.c + 1;
      row += 1;
    }
    const id = `tab:${t}`;
    const on = t === tab;
    x = s.key(id, x, row, label, on ? tint : P.phos, P.ink, on || v.hover === id) + 1;
  }
  const tabRows = row - right.r + 1;

  const box: Area = { c: right.c, r: right.r + tabRows, w: right.w, h: right.h - tabRows };
  s.box(box.c, box.r, box.w, box.h, shade(tint, 0.55), tint);
  const flow = new Flow(box.w - 7);
  fillTab(flow, tab, v, P, u, kase);
  const visible = box.h - 2;
  const maxScroll = Math.max(0, flow.height - visible);
  const scroll = clamp(v.scroll, 0, maxScroll);

  const ctx = s.ctx;
  ctx.save();
  ctx.beginPath();
  ctx.rect((box.c + 1) * CW, (box.r + 1) * CH, (box.w - 2) * CW, visible * CH);
  ctx.clip();
  flow.draw(s, box.c + 3, box.r + 1 - scroll, box.r + 1, box.r + 1 + visible);
  ctx.restore();

  if (maxScroll > 0) {
    // a rail on the right: where the page is, and two halves to press
    const tx = (box.c + box.w - 3) * CW + 4;
    const ty = (box.r + 1) * CH + 2;
    const th = visible * CH - 4;
    s.px(tx, ty, 2, th, P.faint);
    const knob = Math.max(16, even((visible / flow.height) * th));
    s.px(tx - 2, ty + even((scroll / maxScroll) * (th - knob)), 6, knob, tint);
    const half = Math.floor(visible / 2);
    s.zone("scroll:up", box.c + box.w - 4, box.r + 1, 3, half);
    s.zone("scroll:down", box.c + box.w - 4, box.r + 1 + half, 3, visible - half);
  }
  return { maxScroll, textCols: flow.w, cols: 0, tabs };
}

/* ── the whole picture ── */

/* ── the display configuration ── */

const pct = (value: number, [lo, hi]: readonly [number, number]) => clamp((value - lo) / (hi - lo), 0, 1);

/** The panel that sets the display, drawn over a dimmed picture. `back` names what it returns to. */
export function configPanel(s: Surface, v: Pick<ViewState, "config" | "hover" | "safe">, P: Pal, back = "RETURN TO THE WORK") {
  const ctx = s.ctx;
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(0, 0, s.canvas.width, s.canvas.height);
  // nothing behind the panel can be pressed; pressing outside it closes it
  s.zones = [];
  s.zone("cfg:close", 0, 0, s.cols, s.rows);

  const cfg = v.config;
  const w = Math.min(62, v.safe.w - 2);
  const h = Math.min(23, v.safe.h);
  const c = v.safe.c + Math.floor((v.safe.w - w) / 2);
  const r = v.safe.r + Math.floor((v.safe.h - h) / 2);
  s.fill(c, r, w, h, "#000");
  s.box(c, r, w, h, P.dim, P.phos, "DISPLAY CONFIGURATION", P.ink);
  s.zone("cfg:panel", c, r, w, h);
  const x = c + 3;
  const inner = w - 6;

  const line = (id: string, row: number, text: string, color = P.phos) => {
    if (v.hover === id) s.plate(x - 1, row, text, P.ink, color);
    else s.text(x, row, text, color);
    s.zone(id, x - 1, row, inner + 2, 1);
  };
  const slider = (id: string, row: number, label: string, value: string, at: number, filled: boolean) => {
    s.text(x, row, label, P.phos);
    s.text(x + inner - value.length, row, value, P.phos);
    s.dots(x + label.length + 1, row, inner - label.length - value.length - 2, P.faint);
    const tx = x * CW;
    const ty = (row + 1) * CH;
    const tw = inner * CW;
    s.px(tx, ty + 4, 2, 12, P.dim);
    s.px(tx + tw - 2, ty + 4, 2, 12, P.dim);
    if (filled) {
      s.px(tx + 4, ty + 6, tw - 8, 8, P.ghost);
      s.px(tx + 4, ty + 6, even((tw - 8) * at), 8, P.phos);
    } else {
      s.px(tx + 4, ty + 9, tw - 8, 2, P.dim);
      s.px(tx + 4 + even((tw - 20) * at), ty + 4, 12, 12, v.hover === id ? P.plasma : P.phos);
    }
    s.zone(id, x, row, inner, 2);
  };

  s.key("cfg:close", c + w - 6, r + 1, "X", P.phos, P.ink, v.hover === "cfg:close");
  line("cfg:replay", r + 2, "REPLAY THE WARM-UP");
  slider("cfg:gain", r + 4, "PHOSPHOR GAIN", `${Math.round(cfg.gain * 100)}%`, pct(cfg.gain, TUBE_RANGE.gain), true);
  slider("cfg:curve", r + 7, "LENS CURVATURE", String(Math.round(cfg.curve * 1000)), pct(cfg.curve, TUBE_RANGE.curve), false);
  line("cfg:color", r + 10, `PHOSPHOR COLOUR: ${TUBE_COLOR_NAME[cfg.color]}`);
  slider("cfg:glow", r + 12, "GLYPH GLOW", `${Math.round(cfg.glow * 100)}%`, pct(cfg.glow, TUBE_RANGE.glow), false);
  line("cfg:scan", r + 15, `SCAN LINES: ${cfg.scan ? "ON" : "OFF"}`);
  line("cfg:hum", r + 16, `HUM AND FLICKER: ${cfg.hum ? "ON" : "OFF"}`);
  if (h >= 22) {
    line("cfg:reset", r + 18, "RESTORE DISPLAY DEFAULTS", P.plasma);
    line("cfg:done", r + 19, back);
  } else {
    line("cfg:reset", r + h - 3, "RESTORE DISPLAY DEFAULTS", P.plasma);
  }
}

export function drawScreen(s: Surface, v: ViewState): Drawn {
  s.clear();
  const P = palette(v.tube);
  const { c, r, w, h } = v.safe;
  head(s, v, P, { c, r, w, h: 1 });
  const body: Area = { c, r: r + 2, w, h: h - 4 };
  const drawn = v.open ? project(s, v, P, body) : board(s, v, P, body);
  statusLine(s, v, P, { c, r: r + h - 1, w, h: 1 });
  if (v.configOpen) configPanel(s, v, P);
  return drawn;
}
