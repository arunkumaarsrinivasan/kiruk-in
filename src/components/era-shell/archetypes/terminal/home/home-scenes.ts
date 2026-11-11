/**
 * The research file as moving pictures. Each record is its own piece of 1970s
 * interface, with its own layout and its own way of being worked, and its
 * words sit inside it rather than in a box underneath:
 *
 *   Why Kiruk       an arcade court: Pong between DESIGN and CODE (Pong, 1972)
 *   About           a cassette: one track for each moment (Walkman, 1979),
 *                   and him walking on its tape through each one's place
 *   Empathy map     four panes wired to one figure (four-pane browser, 1977)
 *   Journey map     a climb, a ledge for each year, a signboard for the one chosen
 *   Impact          a high-score table (arcade, 1976–78)
 *   Card sort       a card sorter: every project a punched card, sorted on a
 *                   chosen column, read on a big card (batch cards, 1973)
 *   Usability test  a terminal form the visitor fills, and the observer's log
 *                   of them doing it (green-screen forms, 1971)
 *
 * All of it is drawn in blocks, in four shades of one phosphor, in steps.
 * Nothing here is new copy; labels name the parts of the interface.
 * Under reduced motion `t` is 0 and every scene holds still.
 */

import type { Depth } from "@/data/about-story";
import { GLYPHS, iconRows } from "@/components/modules/work-os/control-room/pixel-icons";
import { CH, CW, fit, wrap, type Surface } from "@/components/modules/work-os/control-room/surface";
import { fact, glyphKey, linkKey, type Area, type Pal } from "@/components/modules/work-os/control-room/views";
import { BACKDROP, backdrop, distance } from "./home-backdrops";
import { BEATS, CARDS, EMPATHY_MAP, IMPACT_METRICS, SORTS, SUBJECT, TIMELINE, USABILITY_TEST, WHY_KIRUK, type RecordId } from "./home-model";

type Point = { x: number; y: number };

export interface Stage {
  s: Surface;
  P: Pal;
  /** The stage, in surface pixels and in cells. */
  x: number;
  y: number;
  w: number;
  h: number;
  a: Area;
  /** Seconds; held at 0 for a still picture. */
  t: number;
  hover: string | null;
  /** The pointer on the glass, in surface pixels. */
  ptr: Point | null;
  /** The item chosen with the keys or a press. */
  pick: number;
  /** How far the record's longer text is scrolled, in rows. */
  scroll: number;
  depth: Depth;
  /** The column the card sorter sorts on. */
  tax: string;
}

export interface Shown {
  /** How many items the scene has, for the step keys. */
  count: number;
  /** The one in front: the one pointed at, else the one picked. */
  index: number;
  /** How far the scene's text can scroll, in rows. */
  maxScroll?: number;
}

const even = (v: number) => Math.round(v / 2) * 2;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
/** Time in steps: things move a frame at a time, as they did. */
const beat = (t: number, fps: number) => Math.floor(t * fps);
/** A fixed scatter: the same "random" number for the same seed, every draw. */
const rnd = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const tri = (v: number) => {
  const k = ((v % 2) + 2) % 2;
  return k < 1 ? k : 2 - k;
};

function shownOf(g: Stage, count: number): number {
  const hv = g.hover?.startsWith("pick:") ? Number(g.hover.slice(5)) : -1;
  return clamp(hv >= 0 ? hv : g.pick, 0, count - 1);
}

function hot(s: Surface, id: string, x: number, y: number, w: number, h: number) {
  s.zones.push({ id, x, y, w, h });
}

/** Text at a pixel, snapped to the cell it falls in. */
function label(s: Surface, x: number, y: number, text: string, color: string) {
  s.text(Math.round(x / CW), Math.round(y / CH), text, color);
}

/** Wrapped text in cells. Returns the rows it took. */
function para(s: Surface, c: number, r: number, w: number, text: string, color: string, max = 99): number {
  const lines = wrap(text, w).slice(0, max);
  lines.forEach((line, i) => s.text(c, r + i, line, color));
  return lines.length;
}

/** Outlined tags, wrapped in cells. Returns the rows they took. */
function tagRows(s: Surface, c: number, r: number, w: number, list: readonly string[], ink: string, edge: string, max = 99): number {
  let x = c;
  let row = 0;
  for (const tag of list) {
    if (x > c && x + tag.length + 2 > c + w) {
      x = c;
      row += 1;
    }
    if (row >= max) break;
    s.outline(x * CW, (r + row) * CH + 2, (tag.length + 2) * CW, CH - 4, edge);
    s.text(x + 1, r + row, tag, ink);
    x += tag.length + 3;
  }
  return row + 1;
}

/** A key that chooses: the chosen one is a filled plate. Returns the column after it. */
function choice(g: Stage, id: string, c: number, r: number, name: string, on: boolean): number {
  const { s, P } = g;
  if (on) {
    hot(s, id, c * CW, r * CH, (name.length + 2) * CW, CH);
    return s.plate(c, r, name, P.ink, P.plasma);
  }
  return s.key(id, c, r, name, P.phos, P.ink, g.hover === id);
}

/** A checkerboard of blocks: the handheld's way of making a fifth shade. */
function dither(s: Surface, x: number, y: number, w: number, h: number, p: number, color: string) {
  for (let j = 0; j * p < h; j += 1) {
    for (let i = j % 2; i * p < w; i += 2) s.px(x + i * p, y + j * p, p, p, color);
  }
}

function stars(s: Surface, P: Pal, x: number, y: number, w: number, h: number, t: number, n = 16) {
  for (let i = 0; i < n; i += 1) {
    const on = (beat(t, 2) + Math.floor(rnd(i) * 7)) % 6;
    if (on === 0) continue;
    s.px(even(x + rnd(i * 3 + 1) * w), even(y + rnd(i * 3 + 2) * h), 2, 2, on === 1 ? P.dim : P.faint);
  }
}

function cloud(s: Surface, P: Pal, x: number, y: number, p: number) {
  s.px(even(x) + p, y, p * 3, p, P.ghost);
  s.px(even(x), y + p, p * 6, p, P.ghost);
}

/** Four blocks thrown outward from a point: a hit, a landing. */
function burst(s: Surface, x: number, y: number, age: number, c: string) {
  if (age < 0 || age > 0.32) return;
  const d = even(4 + age * 46);
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) s.px(even(x) + dx * d, even(y) + dy * d, 2, 2, c);
}

/** A disc of blocks, row by row. */
function disc(s: Surface, cx: number, cy: number, r: number, p: number, color: string) {
  for (let j = -r; j < r; j += p) {
    const half = even(Math.sqrt(Math.max(0, r * r - (j + p / 2) ** 2)));
    if (half > 0) s.px(cx - half, cy + j, half * 2, p, color);
  }
}

/**
 * The file's one figure: a small body with a terminal for a head, and in the
 * head a cursor that turns toward whatever it is looking at.
 */
function figure(s: Surface, x: number, y: number, p: number, body: string, cursor: string, frame: number, pose: "stand" | "walk" | "hop" | "wave" = "stand", look = 0) {
  const lift = pose === "hop" && frame % 2 ? p * 2 : 0;
  const Y = y - lift;
  s.px(x + p, Y, p * 6, p, body);
  s.px(x + p, Y + p * 4, p * 6, p, body);
  s.px(x + p, Y, p, p * 5, body);
  s.px(x + p * 6, Y, p, p * 5, body);
  if (frame % 4 !== 3) s.px(x + p * (3 + look), Y + p * 2, p * 2, p, cursor);
  s.px(x + p * 3, Y + p * 5, p * 2, p, body);
  s.px(x + p * 2, Y + p * 6, p * 4, p * 3, body);
  const up = pose === "wave" && frame % 2 === 0;
  s.px(x + p, Y + p * 6, p, p * 2, body);
  if (up) s.px(x + p * 6, Y + p * 4, p, p * 2, body);
  else s.px(x + p * 6, Y + p * 6, p, p * 2, body);
  const stride = pose === "walk" && frame % 2 === 1;
  s.px(x + (stride ? p : p * 2), Y + p * 9, p, p * 2, body);
  s.px(x + (stride ? p * 6 : p * 5), Y + p * 9, p, p * 2, body);
}

const FIG_W = 8;
const FIG_H = 11;
const lookAt = (ptr: Point | null, x: number) => (ptr ? (ptr.x < x - 24 ? -1 : ptr.x > x + 24 ? 1 : 0) : 0);

/** Something from a year, drawn in blocks ten wide. */
function landmark(s: Surface, id: string, x: number, y: number, p: number, c: string, soft: string) {
  const b = (i: number, j: number, w = 1, h = 1, col = c) => s.px(x + i * p, y + j * p, w * p, h * p, col);
  switch (id) {
    case "first-paycheck": // a coin
      b(3, 1, 4);
      b(2, 2, 6, 6, soft);
      b(3, 8, 4);
      b(1, 3, 1, 4);
      b(8, 3, 1, 4);
      b(4, 3, 2, 4);
      break;
    case "sona": // a mortarboard
      b(4, 1, 2);
      b(2, 2, 6);
      b(0, 3, 10);
      b(2, 4, 6);
      b(3, 5, 4, 3, soft);
      b(9, 4, 1, 4);
      break;
    case "playlab": // a game pad
      b(1, 3, 8, 4, soft);
      b(0, 4, 10, 2);
      b(2, 4, 1, 2, "#000");
      b(1, 5, 3, 1, "#000");
      b(7, 4);
      b(6, 6, 1, 1, "#000");
      break;
    default: {
      const project = { hp: "hp-print-ai", spera: "spera-platform" }[id];
      if (project) s.bitmap(x - p * 3, y - p, iconRows(project), p, c);
      else b(2, 2, 6, 6, soft);
    }
  }
}

/** When the open record changed last, so a scene can start from its beginning. */
let sceneKey = "";
let sceneAt = 0;

/* ── Why Kiruk: an arcade court, and it can be played ── */

const pong = { round: -1, bx: 0.5, by: 0.5, vx: 1, vy: 0.6, ly: 0.5, ry: 0.5, left: 0, right: 0, rally: 0, last: 0, hitAt: -9, hitX: 0, hitY: 0, missAt: -9 };

function serve(dir: number) {
  pong.bx = 0.5;
  pong.by = 0.5;
  pong.vx = dir;
  pong.vy = (pong.left + pong.right) % 2 ? 0.55 : -0.55;
}

function why(g: Stage): Shown {
  const { s, P, x, y, w, t, a } = g;
  const rounds: [string, string][] = [
    ["HOOK", WHY_KIRUK.hook],
    ["PAIN", WHY_KIRUK.pain],
    ["BRIDGE", WHY_KIRUK.bridge],
    ["CLOSE", `"${WHY_KIRUK.tagline}"`],
  ];
  const shown = shownOf(g, rounds.length);
  let kx = a.c;
  rounds.forEach(([name], i) => {
    kx = choice(g, `pick:${i}`, kx, a.r, `${i + 1} ${name}`, i === shown) + 1;
  });

  // the court takes the stage; the round's line runs along its foot, as a game's message does
  const top = y + CH * 2;
  const H = even((a.h - 6) * CH);
  const cx = even(x + w / 2);
  const cy = even(top + H / 2);
  const padW = 8;
  const padH = even(H * 0.24);
  const lx = x + 36;
  const rx = x + w - 44;
  const span = rx - lx - padW - 8;
  const half = padH / 2 / (H - 20);

  if (shown !== pong.round) {
    pong.round = shown;
    pong.left = pong.right = pong.rally = 0;
    pong.ly = pong.ry = 0.5;
    serve(1);
    if (shown === 1) pong.vy = 0.22;
  }
  const dt = t === 0 ? 0 : clamp(t - pong.last, 0, 0.06);
  pong.last = t;
  const inCourt = g.ptr && g.ptr.x > x && g.ptr.x < x + w && g.ptr.y > top && g.ptr.y < top + H;
  const hand = inCourt && g.ptr ? clamp((g.ptr.y - top - 10) / (H - 20), 0, 1) : null;
  const follow = (cur: number, to: number, speed: number) => cur + clamp(to - cur, -speed * dt, speed * dt);

  if (shown === 0) {
    pong.ly = hand ?? follow(pong.ly, pong.by, 1.5);
    pong.ry = follow(pong.ry, pong.by, 1.3);
  } else if (shown === 1) {
    pong.ly = 0.14;
    pong.ry = 0.86;
  } else if (shown === 2) {
    pong.ly = pong.ry = hand ?? follow(pong.ly, pong.by, 2);
  }
  if (shown !== 3 && dt > 0) {
    pong.bx += pong.vx * 0.62 * dt;
    pong.by += pong.vy * dt;
    if (pong.by < 0.02) {
      pong.by = 0.02;
      pong.vy = Math.abs(pong.vy);
    } else if (pong.by > 0.98) {
      pong.by = 0.98;
      pong.vy = -Math.abs(pong.vy);
    }
    const meet = (side: -1 | 1, pad: number) => {
      const past = side < 0 ? pong.bx <= 0 : pong.bx >= 1;
      if (!past || Math.sign(pong.vx) !== side) return;
      if (Math.abs(pong.by - pad) < half + 0.05) {
        pong.bx = side < 0 ? 0 : 1;
        pong.vx = -side;
        pong.vy = clamp(pong.vy + (pong.by - pad) * 1.6, -0.9, 0.9);
        pong.rally += 1;
        pong.hitAt = t;
        pong.hitX = side < 0 ? lx + padW : rx;
        pong.hitY = top + 10 + pong.by * (H - 20);
      } else if (side < 0 ? pong.bx < -0.14 : pong.bx > 1.14) {
        if (side < 0) pong.right += 1;
        else pong.left += 1;
        pong.rally = 0;
        pong.missAt = t;
        serve(-side);
        if (shown === 1) pong.vy = pong.left % 2 ? 0.22 : -0.22;
      }
    };
    meet(-1, pong.ly);
    meet(1, pong.ry);
  }

  s.outline(x, top, w, H, P.faint);
  for (let yy = top + 8; yy < top + H - 8; yy += 16) s.px(cx - 1, yy, 2, 8, P.faint);
  let bx = lx + padW + pong.bx * span;
  let by = top + 10 + pong.by * (H - 20) - 4;
  let ly = top + 10 + pong.ly * (H - 20) - padH / 2;
  let ry = top + 10 + pong.ry * (H - 20) - padH / 2;
  if (shown === 2) for (let xx = lx + padW + 4; xx < rx - 4; xx += 12) s.px(xx, even(ly + padH / 2) - 1, 6, 2, P.faint);
  if (shown === 3) {
    ly = ry = cy - padH / 2;
    const ang = beat(t, 20) / 20;
    bx = cx - 4 + Math.cos(ang * 2.2) * span * 0.32;
    by = cy - 4 + Math.sin(ang * 2.2) * (H * 0.34);
    for (let k = 1; k < 5; k += 1) s.px(even(cx - 2 + Math.cos((ang - k * 0.09) * 2.2) * span * 0.32), even(cy - 2 + Math.sin((ang - k * 0.09) * 2.2) * (H * 0.34)), 4, 4, k < 3 ? P.faint : P.ghost);
  }
  ly = clamp(even(ly), top + 4, top + H - padH - 4);
  ry = clamp(even(ry), top + 4, top + H - padH - 4);
  const plx = shown === 3 ? cx - padW : lx;
  const prx = shown === 3 ? cx : rx;
  s.px(plx, top + 4, padW, H - 8, P.ghost);
  s.px(prx, top + 4, padW, H - 8, P.ghost);
  s.px(plx, ly, padW, padH, hand !== null && shown !== 1 ? P.plasma : P.phos);
  s.px(prx, ry, padW, padH, shown === 1 ? P.dim : P.phos);
  if (bx > x + 2 && bx < x + w - 10) s.px(even(bx), even(by), 8, 8, P.plasma);
  burst(s, pong.hitX, pong.hitY, t - pong.hitAt, P.phos);

  label(s, x + CW * 2, top + CH, "DESIGN", hand !== null ? P.plasma : P.dim);
  label(s, x + w - CW * 6, top + CH, "CODE", P.dim);
  const score = shown === 2 ? `RALLY ${pong.rally}` : shown === 3 ? "1 + 1" : `${pong.left} : ${pong.right}`;
  s.text(Math.round((cx - score.length * CW) / CW), Math.round((top + CH) / CH), score, P.phos, 2);
  if (shown < 3 && t - pong.missAt < 0.9 && beat(t, 6) % 2 === 0) label(s, cx - CW * 2, top + H - CH * 2, "MISS", P.plasma);

  const row = a.r + a.h - 3;
  const end = s.plate(a.c, row, rounds[shown][0], P.ink, P.phos);
  para(s, end + 2, row, a.c + a.w - end - 2, rounds[shown][1], shown === 3 ? P.plasma : P.phos, 3);
  return { count: rounds.length, index: shown };
}

/* ── About: a cassette, a track for each moment, and him walking on its tape ── */

let tapeIdx = -1;
let tapeAt = -9;
/** The track that was playing before this one: he walks out of it. */
let tapeFrom = -1;
/** How long changing tracks takes, in seconds: the reels wind, he walks on. */
const CHANGE = 1.6;
/** How far the tape has run under him, in pixels. */
const walk = { pos: 0, last: 0 };

/**
 * The phase he walks through: its place above the tape, him on it, and the tape
 * running under his feet. Between tracks the old place slides off, the new one
 * slides in, and the splice between them goes by under him with its year on a
 * post. Between changes he strolls, and now and then stops to look at you.
 */
function walkOn(g: Stage, x: number, top: number, w: number, ground: number, cur: number, fitW = w, fitH = ground - top) {
  const { s, P, t } = g;
  const age = t - tapeAt;
  const changing = t > 0 && age >= 0 && age < CHANGE;
  const u = changing ? Math.floor((age / CHANGE) * 16) / 16 : 1;
  const dir = tapeFrom >= 0 && cur < tapeFrom ? -1 : 1;
  const strolling = t > 0 && (changing || t % 9 < 7.2);
  const dt = t === 0 ? 0 : clamp(t - walk.last, 0, 0.06);
  walk.last = t;
  walk.pos += dir * (changing ? w / CHANGE : strolling ? 12 : 0) * dt;

  const tall = ground - top;
  // the place in blocks as big as fit in `fitW` × `fitH`; him a little bigger than its people, so he reads
  const p = Math.max(2, Math.floor(Math.min(fitW / BACKDROP.w, fitH / BACKDROP.h)));
  const q = Math.max(4, p + 2);
  const ctx = s.ctx;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, top, w, tall);
  ctx.clip();
  const slide = even(u * w);
  const sx = even(dir > 0 ? x + w - slide : x + slide);
  // far off: the sky and a line of hills or roofs, each place's own on its side of the splice
  const far = (id: string, from: number, to: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(from, top, to - from, tall);
    ctx.clip();
    distance(s, id, x, top, ground, w, p, P, t, walk.pos);
    ctx.restore();
  };
  if (changing && tapeFrom >= 0) {
    far(BEATS[tapeFrom].id, dir > 0 ? x : sx, dir > 0 ? sx : x + w);
    far(BEATS[cur].id, dir > 0 ? sx : x, dir > 0 ? x + w : sx);
  } else far(BEATS[cur].id, changing && dir > 0 ? sx : x, changing && dir < 0 ? sx : x + w);
  if (changing && tapeFrom >= 0) {
    ctx.translate(-dir * slide, 0);
    backdrop(s, BEATS[tapeFrom].id, x, ground, w, p, P, t);
    ctx.translate(dir * slide, 0);
  }
  const into = changing ? dir * (w - slide) : 0;
  ctx.translate(into, 0);
  backdrop(s, BEATS[cur].id, x, ground, w, p, P, t);
  ctx.translate(-into, 0);
  // the splice between the two places, and the year on its post
  if (changing) {
    for (let yy = top + 4; yy < ground - 2; yy += 8) s.px(sx - 1, yy, 2, 4, P.faint);
    const yr = String(BEATS[cur].year);
    const py = ground - CH * 2 - 8;
    s.px(sx - 1, py, 2, ground - py, P.dim);
    s.px(sx - (yr.length * CW) / 2 - 4, py, yr.length * CW + 8, CH, P.plasma);
    label(s, sx - (yr.length * CW) / 2, py, yr, P.ink);
  }
  ctx.restore();

  // the tape: a ribbon with its splice marks going by
  s.px(x, ground, w, 4, P.dim);
  const off = ((walk.pos % 24) + 24) % 24;
  for (let mx = x - off; mx < x + w; mx += 24) if (mx >= x && mx + 8 <= x + w) s.px(even(mx), ground + 1, 8, 2, P.ghost);
  if (changing && sx > x && sx < x + w - 6) s.px(sx - 3, ground, 6, 4, P.plasma);

  // him, on it
  const fx = even(x + w * 0.42 - (q * FIG_W) / 2);
  const fy = ground - q * FIG_H;
  const cx = fx + (q * FIG_W) / 2;
  const near = !strolling && g.ptr ? Math.hypot(g.ptr.x - cx, g.ptr.y - (fy + (q * FIG_H) / 2)) < 120 : false;
  const look = strolling ? dir : lookAt(g.ptr, cx);
  const frame = beat(t, changing ? 10 : strolling ? 4 : 6);
  const pose = strolling ? "walk" : near ? "wave" : "stand";
  // a black edge round him, so he stands clear of whatever he is passing
  for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2]]) figure(s, fx + dx, fy + dy, q, "#000", "#000", frame, pose, look);
  figure(s, fx, fy, q, P.phos, P.plasma, frame, pose, look);
  burst(s, cx, ground - 2, t - tapeAt - CHANGE, P.dim);
}

function about(g: Stage): Shown {
  const { s, P, t, a } = g;
  const n = BEATS.length;
  const shown = shownOf(g, n);
  const cur = clamp(g.pick, 0, n - 1);
  if (cur !== tapeIdx) {
    tapeFrom = tapeIdx;
    tapeIdx = cur;
    tapeAt = t;
  }
  const b = BEATS[shown];
  const wide = a.w >= 66;
  const tapeW = wide ? clamp(Math.round(a.w * 0.5), 36, 54) : a.w;
  // a wide stage gives the cassette more height, so its window has room for him and the place
  const tapeH = clamp(a.h - 5, 9, wide ? 22 : 15);

  // the deck under it: step keys, the year on the counter, how much to read
  const dr = a.r + tapeH + 1;
  let kx = a.c;
  kx = glyphKey(s, "step:prev", kx, dr, GLYPHS.left, P.phos, P.ink, g.hover === "step:prev") + 1;
  kx = glyphKey(s, "step:next", kx, dr, GLYPHS.right, P.phos, P.ink, g.hover === "step:next") + 2;
  String(b.year)
    .split("")
    .forEach((ch, i) => digit(s, kx * CW + i * 14, dr * CH - 2, 10, 20, ch, P.plasma, P.ghost));
  kx += 7;
  // the three reading keys stay under the cassette: a narrow one takes them on a second row
  let kr = dr;
  if (kx + 30 > a.c + tapeW) {
    kx = a.c;
    kr = dr + 1;
  }
  for (const d of ["skim", "read", "deep"] as const) {
    kx = choice(g, `depth:${d}`, kx, kr, d === "skim" ? "TRACKS" : d === "read" ? "NOTES" : "FULL NOTES", g.depth === d) + 1;
  }

  // the cassette
  const X = a.c * CW;
  const Y = a.r * CH;
  const W = tapeW * CW;
  const H = tapeH * CH;
  s.outline(X, Y, W, H, P.phos);
  s.outline(X + 6, Y + 6, W - 12, H - 12, P.faint);
  for (const [dx, dy] of [[12, 12], [W - 16, 12], [12, H - 16], [W - 16, H - 16]]) s.px(X + dx, Y + dy, 4, 4, P.dim);
  // its label: the side, the track, the moment's name, where and when
  const side = shown < Math.ceil(n / 2) ? "SIDE A" : "SIDE B";
  const lc = a.c + 3;
  const lw = tapeW - 6;
  s.outline(X + 20, Y + CH, W - 40, CH * 5, P.dim);
  s.plate(lc, a.r + 1, side, P.ink, P.phos);
  const track = `TRACK ${String(shown + 1).padStart(2, "0")} OF ${n}`;
  s.text(lc + lw - track.length, a.r + 1, track, P.dim);
  const title = b.title.toUpperCase();
  if (title.length * 2 <= lw - 2) s.text(lc + 1, a.r + 2, title, P.phos, 2);
  else para(s, lc + 1, a.r + 2, lw - 2, title, P.phos, 2);
  s.text(lc + 1, a.r + 4, fit(`${b.period} · ${b.place}`.toUpperCase(), lw - 2), P.plasma);

  // its window: the reels up in its corners, the tape down from each round a guide,
  // and between them, on the tape, him walking through the track's place
  const wy = Y + CH * 6 + 8;
  const wh = H - CH * 7 - 20;
  const wm = even(W * 0.06);
  const wx = X + wm;
  const ww = W - wm * 2;
  s.outline(wx, wy, ww, wh, P.dim);
  const rMax = even(clamp(wh / 2 - 14, 12, 34));
  const rMin = Math.max(8, even(rMax * 0.38));
  const done = cur / (n - 1);
  const winding = t > 0 && t - tapeAt < CHANGE;
  const turn = beat(t, winding ? 16 : 3);
  const ground = wy + wh - 12;
  const reels = [wx + rMax + 12, wx + ww - rMax - 12].map(even);
  const reelY = even(wy + rMax + 12);
  // the place may tuck under the reels' edges: they are drawn over it, ringed in black
  walkOn(g, wx + 8, wy + 4, ww - 16, ground, cur, ww - 2 * rMax - 24, ground - reelY);
  reels.forEach((cx, k) => {
    const pack = even(rMin + (rMax - rMin) * (k === 0 ? 1 - done : done));
    disc(s, cx, reelY, pack + 2, 2, "#000");
    disc(s, cx, reelY, pack, 2, P.faint);
    disc(s, cx, reelY, rMin, 2, "#000");
    s.outline(cx - 6, reelY - 6, 12, 12, P.phos);
    // the hub's teeth, turning
    for (let i = 0; i < 3; i += 1) {
      const ang = ((turn * (k === 0 ? -1 : 1) + i * 4) * Math.PI) / 6;
      s.px(even(cx + Math.cos(ang) * (rMin - 4)) - 1, even(reelY + Math.sin(ang) * (rMin - 4)) - 1, 4, 4, P.plasma);
    }
    const ex = k === 0 ? cx - pack : cx + pack - 2;
    s.px(ex, reelY, 2, ground - reelY, P.dim);
    s.outline(ex - 2, ground - 2, 6, 6, P.faint);
  });
  for (let i = 0; i < 5; i += 1) s.outline(X + even(W * (0.3 + i * 0.1)) - 4, Y + H - 20, 8, 8, P.faint);

  // beside it: the track list, or the chosen track's liner notes
  const pc = wide ? a.c + tapeW + 2 : a.c;
  const pr = wide ? a.r : kr + 2;
  const pw = wide ? a.w - tapeW - 2 : a.w;
  const ph = wide ? a.h : a.r + a.h - pr;
  let maxScroll = 0;
  if (g.depth === "skim") {
    const rows = Math.min(n, ph - 4);
    const from = clamp(shown - Math.floor(rows / 2), 0, n - rows);
    for (let i = 0; i < rows; i += 1) {
      const k = from + i;
      const bk = BEATS[k];
      const id = `pick:${k}`;
      const line = fit(`${String(k + 1).padStart(2, "0")} ${bk.year} ${bk.title.toUpperCase()}`, pw - 2);
      if (k === cur) s.plate(pc, pr + i, line, P.ink, P.plasma);
      else if (g.hover === id) s.plate(pc, pr + i, line, P.ink, P.phos);
      else s.text(pc + 1, pr + i, line, P.dim);
      s.zone(id, pc, pr + i, pw, 1);
    }
    // one line of the track that is playing
    s.rule(pc, pr + rows, pw, P.faint);
    para(s, pc + 1, pr + rows + 1, pw - 2, b.skim, P.phos, Math.max(1, ph - rows - 1));
  } else {
    const paras = g.depth === "read" ? [b.read] : [...b.deep, `What stuck: ${b.stuck}`];
    const lines = paras.flatMap((p, i) => [...(i ? [""] : []), ...wrap(p, pw - 5)]);
    maxScroll = Math.max(0, lines.length - ph);
    const at = Math.min(g.scroll, maxScroll);
    lines.slice(at, at + ph).forEach((line, i) => s.text(pc + 1, pr + i, line, P.phos));
    if (maxScroll > 0) {
      glyphKey(s, "scroll:up", pc + pw - 3, pr, GLYPHS.up, at > 0 ? P.phos : P.ghost, P.ink, g.hover === "scroll:up");
      glyphKey(s, "scroll:down", pc + pw - 3, pr + ph - 1, GLYPHS.down, at < maxScroll ? P.phos : P.ghost, P.ink, g.hover === "scroll:down");
    }
  }
  return { count: n, index: shown, maxScroll };
}

/* ── Empathy map: four panes wired to one figure ── */

function empathy(g: Stage): Shown {
  const { s, P, t, a } = g;
  const shown = shownOf(g, 4);
  const f = beat(t, 5);
  const pw = Math.floor((a.w - 1) / 2);
  const ph = Math.floor(a.h / 2);
  const panes: { name: string; c: number; r: number }[] = [
    { name: "SAYS · SKILLS I CLAIM", c: a.c, r: a.r },
    { name: "THINKS · PHILOSOPHY", c: a.c + pw + 1, r: a.r },
    { name: "DOES · STACK IN ROTATION", c: a.c, r: a.r + ph },
    { name: "FEELS · MOTIVATIONS", c: a.c + pw + 1, r: a.r + ph },
  ];
  const mid = { x: (a.c + pw) * CW + CW / 2, y: (a.r + ph) * CH };

  panes.forEach((pane, i) => {
    const lit = i === shown;
    const ink = lit ? P.phos : P.dim;
    s.box(pane.c, pane.r, pw, ph, lit ? P.phos : P.faint, lit ? P.plasma : P.dim);
    s.plate(pane.c + (i % 2 ? 8 : 2), pane.r, fit(pane.name, pw - 12), P.ink, lit ? P.plasma : P.dim);
    // the lower panes begin under the figure, the upper ones end above it
    const c = pane.c + 3;
    const w = pw - 6;
    let r = pane.r + (i < 2 ? 2 : 3);
    const room = ph - (i < 2 ? 5 : 4);
    if (i === 0) {
      r += para(s, c, r, w, `"${EMPATHY_MAP.says.quote}"`, ink, 3) + 1;
      tagRows(s, c, r, w, EMPATHY_MAP.says.skills, ink, lit ? P.dim : P.faint, Math.max(1, room - 4));
    } else if (i === 1 || i === 3) {
      const list = i === 1 ? EMPATHY_MAP.thinks : EMPATHY_MAP.feels;
      for (const item of list) {
        if (r >= pane.r + ph - 1) break;
        // a lamp for a thought, a heart for a feeling
        if (i === 1) s.px(c * CW + 2, r * CH + 6, 6, 8, lit && f % 2 ? P.plasma : ink);
        else {
          s.px(c * CW, r * CH + 6, 4, 4, lit ? P.plasma : ink);
          s.px(c * CW + 6, r * CH + 6, 4, 4, lit ? P.plasma : ink);
          s.px(c * CW + 2, r * CH + 10, 6, 4, lit ? P.plasma : ink);
        }
        r += para(s, c + 3, r, w - 3, item, ink, 2);
      }
    } else {
      tagRows(s, c, r, w, EMPATHY_MAP.does, ink, lit ? P.dim : P.faint, room);
    }
    s.zone(`pick:${i}`, pane.c, pane.r, pw, ph);
  });

  // the figure in the middle, on its own plate, wired to each pane
  const p = 6;
  const fw = p * FIG_W;
  const fh = p * FIG_H;
  const px = even(mid.x - fw / 2 - 16);
  const py = even(mid.y - fh / 2 - 8);
  s.px(px, py, fw + 32, fh + 16, "#000");
  s.outline(px, py, fw + 32, fh + 16, P.dim);
  const fx = even(mid.x - fw / 2);
  const fy = even(mid.y - fh / 2);
  const side = shown % 2 ? 1 : -1;
  figure(s, fx, fy, p, P.phos, P.plasma, f, shown === 2 ? "wave" : "stand", side);
  // each part of it answers for one pane: the mouth, the lamp, the hands, the heart
  const ends: [number, number][] = [
    [fx, fy + p * 3],
    [fx + fw, fy],
    [fx, fy + p * 7],
    [fx + fw, fy + p * 7],
  ];
  ends.forEach(([ex, ey], i) => {
    const lit = i === shown;
    const dir = i % 2 ? 1 : -1;
    const len = 22;
    s.px(dir < 0 ? ex - len : ex, ey, len, 2, lit ? P.plasma : P.faint);
    if (lit) s.px(even(ex + dir * (4 + ((f * 4) % (len - 6)))), ey - 2, 4, 6, P.phos);
  });
  if (shown === 0) for (let i = 0; i < 3; i += 1) s.px(fx - p * (2 + i), fy + p * 2 + ((f + i) % 2) * p, p - 2, p * (1 + ((f + i) % 2)), P.plasma);
  if (shown === 1) s.px(fx + p * 3, fy - p * 2, p * 2, p, f % 2 ? P.plasma : P.faint);
  if (shown === 3) s.px(fx + p * 3, fy + p * 7, p * 2, p, f % 2 ? P.plasma : "#000");
  return { count: 4, index: shown };
}

/* ── Journey map: a climb ── */

let climb = -1;
let landedAt = -9;
/** What stands on each ledge: something from that year. */
const PROPS = ["first-paycheck", "sona", "playlab", "hp", "spera"];

function journey(g: Stage): Shown {
  const { s, P, x, y, w, h, t, a } = g;
  const n = TIMELINE.length;
  const shown = shownOf(g, n);
  const target = clamp(g.pick, 0, n - 1);
  if (climb < 0 || t === 0) climb = target;
  const moving = Math.abs(target - climb) > 0.02;
  climb += clamp(target - climb, -0.25, 0.25);
  if (moving && Math.abs(target - climb) <= 0.02) landedAt = t;
  if (!moving) climb = target;

  const p = h >= 240 ? 6 : 4;
  const lw = even(Math.min((w - CW * 4) / n - 8, 190));
  const stepX = (w - CW * 4 - lw) / (n - 1);
  const base = y + h - CH * 2;
  const rise = (base - (y + CH * 3 + p * FIG_H)) / (n - 1);
  const at = (k: number): [number, number] => [even(x + CW * 2 + k * stepX), even(base - k * rise)];
  const f = beat(t, 6);

  // the day goes with the climb: a sun low on the right that rises as he does, a cloud, stars
  const sunX = even(x + w - p * 12);
  const sunY = even(base - p * 2 - (climb / (n - 1)) * p * 14);
  disc(s, sunX, sunY, p * 4, p, P.ghost);
  dither(s, sunX - p * 2, sunY - p * 2, p * 4, p * 4, p, P.faint);
  stars(s, P, x + w * 0.5, y, w * 0.3, CH * 2, t, 6);
  cloud(s, P, x + ((t * 7 + w * 0.5) % (w + 80)) - 60, y + CH * 8, p);

  TIMELINE.forEach((node, k) => {
    const [lx, ly] = at(k);
    const lit = k === shown;
    s.px(lx, ly, lw, p, lit ? P.phos : P.dim);
    dither(s, lx, ly + p, lw, p * 2, p, lit ? P.dim : P.faint);
    if (k < n - 1) {
      const [nx, ny] = at(k + 1);
      for (let i = 1; i < 5; i += 1) {
        const u = i / 5;
        s.px(even(lx + lw + (nx - lx - lw) * u), even(ly - (ly - ny) * u - Math.sin(u * Math.PI) * p * 3) - p, p, p, P.ghost);
      }
    }
    const bob = g.hover === `pick:${k}` && f % 2 ? 2 : 0;
    landmark(s, PROPS[k] ?? "", lx + lw - (node.live ? 78 : 44), ly - 22 - bob, 2, lit ? P.phos : P.dim, lit ? P.dim : P.faint);
    label(s, lx, ly + p * 3 + 6, node.year, node.live ? P.plasma : lit ? P.phos : P.dim);
    label(s, lx + CW * 5, ly + p * 3 + 6, fit(node.phase.toUpperCase(), Math.floor(lw / CW) - 5), lit ? P.phos : P.dim);
    if (node.live) {
      s.px(lx + lw - p * 2, ly - p * 9, p, p * 9, P.phos);
      s.px(lx + lw - p * 6, ly - p * (9 - (beat(t, 3) % 2)), p * 4, p * 3, P.plasma);
    }
    hot(s, `pick:${k}`, lx - 4, ly - p * (FIG_H + 2), lw + 8, p * (FIG_H + 2) + CH * 2);
  });

  const k0 = Math.floor(climb);
  const k1 = Math.min(n - 1, k0 + 1);
  const u = climb - k0;
  const [ax, ay] = at(k0);
  const [bx, by] = at(k1);
  const fx = ax + (bx - ax) * u + p * 3;
  const fy = ay + (by - ay) * u - (moving ? Math.sin(u * Math.PI) * p * 5 : 0);
  figure(s, even(fx), even(fy - p * FIG_H), p, P.phos, P.plasma, f, moving ? "hop" : target === n - 1 ? "wave" : "stand", moving ? 1 : lookAt(g.ptr, fx + p * 4));
  burst(s, fx + p * 4, fy - p, t - landedAt, P.dim);

  // a signboard in the open sky says what the chosen ledge was, and a dotted line ties them
  const node = TIMELINE[shown];
  const bw = clamp(Math.round(a.w * 0.5), 34, 50);
  const lines = wrap(node.detail, bw - 6).slice(0, 2);
  const bh = 5 + lines.length;
  s.fill(a.c, a.r, bw, bh, "#000");
  s.box(a.c, a.r, bw, bh, P.dim, P.phos, `${node.year} · ${node.phase.toUpperCase()}`, P.ink);
  s.text(a.c + 3, a.r + 2, fit(node.position.toUpperCase(), bw - 6), node.live ? P.plasma : P.phos);
  s.text(a.c + 3, a.r + 3, fit(`@ ${node.org}`, bw - 6), P.dim);
  lines.forEach((line, i) => s.text(a.c + 3, a.r + 4 + i, line, P.phos));
  const [sx, sy] = at(shown);
  const fromX = (a.c + 6) * CW;
  const fromY = (a.r + bh) * CH - 6;
  for (let i = 1; i < 9; i += 1) s.px(even(fromX + ((sx + 20 - fromX) * i) / 9), even(fromY + ((sy - p * 3 - fromY) * i) / 9), 2, 2, P.faint);
  return { count: n, index: shown };
}

/* ── Impact: the high-score table ── */

const SEGMENTS: Record<string, string> = { "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcdfg" };

/** One seven-segment digit; unlit segments stay as ghosts, as on a calculator. */
function digit(s: Surface, x: number, y: number, dw: number, dh: number, ch: string, on: string, ghost: string) {
  const k = dh >= 30 ? 4 : 2;
  const hh = even(dh / 2);
  const parts: Record<string, [number, number, number, number]> = {
    a: [x + k, y, dw - 2 * k, k],
    b: [x + dw - k, y + k, k, hh - k - 2],
    c: [x + dw - k, y + hh + 2, k, hh - k - 2],
    d: [x + k, y + dh - k, dw - 2 * k, k],
    e: [x, y + hh + 2, k, hh - k - 2],
    f: [x, y + k, k, hh - k - 2],
    g: [x + k, y + hh - k / 2, dw - 2 * k, k],
  };
  const lit = SEGMENTS[ch] ?? "";
  for (const [name, [px, py, pw, ph]] of Object.entries(parts)) s.px(px, py, pw, ph, lit.includes(name) ? on : ghost);
}

const RANKS = ["1ST", "2ND", "3RD", "4TH", "5TH", "6TH", "7TH", "8TH"];

function impact(g: Stage): Shown {
  const { s, P, t, a } = g;
  const metrics = IMPACT_METRICS.slice(0, 8);
  const n = metrics.length;
  const shown = shownOf(g, n);
  const f = beat(t, 4);

  // the title, as a cabinet shows it, with its stars
  const title = "HIGH SCORES";
  const tc = a.c + Math.floor((a.w - title.length * 2) / 2);
  s.text(tc, a.r, title, P.phos, 2);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i += 1) {
      const sx = (side < 0 ? tc - 4 - i * 3 : tc + title.length * 2 + 2 + i * 3) * CW;
      s.px(sx, a.r * CH + 14 + ((f + i) % 2) * 4, 6, 6, (f + i) % 3 === 0 ? P.plasma : P.dim);
    }
  }

  // one row for each number: its place, the number, what it counts, where it was earned
  const step = clamp(Math.floor((a.h - 5) / n), 1, 4);
  const two = step >= 2;
  const top = a.r + 4;
  const scoreC = a.c + 8;
  const forC = scoreC + (two ? 12 : 7);
  const onW = a.w >= 84 ? Math.min(34, Math.floor(a.w * 0.34)) : 0;
  const forW = a.w - (forC - a.c) - onW - 2;
  s.text(a.c + 1, top - 1, "RANK", P.dim);
  s.text(scoreC, top - 1, "SCORE", P.dim);
  s.text(forC, top - 1, "FOR", P.dim);
  if (onW) s.text(a.c + a.w - onW, top - 1, "ON", P.dim);

  metrics.forEach((m, i) => {
    const r = top + i * step;
    if (r + step > a.r + a.h) return;
    // on arrival the rows drop in from the top, one after another
    if (t > 0 && t - sceneAt < 0.25 + i * 0.09) return;
    const lit = i === shown;
    if (lit) {
      s.px(a.c * CW, r * CH + 2, a.w * CW, Math.min(step, 2) * CH - 4, P.ghost);
      s.outline(a.c * CW, r * CH + 2, a.w * CW, Math.min(step, 2) * CH - 4, P.plasma);
    }
    const rank = RANKS[i] ?? `${i + 1}TH`;
    if (!lit || f % 2 === 0) s.text(a.c + 1, r, rank, lit ? P.plasma : P.dim);
    s.text(scoreC, r, m.value, lit ? P.plasma : P.phos, two ? 2 : 1);
    s.text(forC, r, fit(m.label.toUpperCase(), forW), lit ? P.phos : P.dim);
    if (onW && m.context) s.text(a.c + a.w - onW, r, fit(m.context, onW - 1), lit ? P.phos : P.dim);
    if (two) s.text(forC, r + 1, fit(onW || !m.context ? m.category.toUpperCase() : m.context, forW), lit ? P.dim : P.faint);
    s.zone(`pick:${i}`, a.c, r, a.w, step);
  });
  return { count: n, index: shown };
}

/* ── Card sort: every project a punched card, sorted on a chosen column ── */

let sortKey = "";
let sortAt = 0;

/** A card's punches: its number, in holes. */
function punches(s: Surface, x: number, y: number, n: number, seed: number, ink: string) {
  for (let k = 0; k < n; k += 1) {
    if (((seed + 3) * 2654435761 + k * 40503) % 7 < 3) s.px(x + k * 8, y + ((k * 5 + seed * 3) % 3) * 6, 4, 4, ink);
  }
}

function sort(g: Stage): Shown {
  const { s, P, t, a } = g;
  const n = CARDS.length;
  const shown = shownOf(g, n);
  const by = SORTS.find((k) => k.id === g.tax) ?? SORTS[0];
  if (by.id !== sortKey) {
    sortKey = by.id;
    sortAt = t;
  }
  const since = t === 0 ? 99 : t - sortAt;

  // the sorter's one setting: the column it sorts on
  s.text(a.c, a.r, "SORT ON", P.dim);
  let kx = a.c + 8;
  for (const k of SORTS) kx = choice(g, `tax:${k.id}`, kx, a.r, k.label.toUpperCase(), k.id === by.id) + 1;

  const wide = a.w >= 64;
  const readW = wide ? clamp(Math.round(a.w * 0.38), 28, 40) : 0;
  const binsW = a.w - (readW ? readW + 2 : 0);
  const nameW = Math.min(12, Math.max(...by.groups.map((name) => name.length)) + 1);
  const rows = a.h - 2;
  const rowH = clamp(Math.floor(rows / by.groups.length), 2, 5);
  const tileW = clamp(Math.floor((binsW - nameW - 1) / Math.max(...by.groups.map((name) => CARDS.filter((c) => c[by.id] === name).length))), 5, 9);

  // a hopper for each value of the column, and the cards that fell into it
  by.groups.forEach((name, b) => {
    const r = a.r + 2 + b * rowH;
    if (r + rowH > a.r + a.h) return;
    const mine = CARDS.map((c, i) => ({ c, i })).filter(({ c }) => c[by.id] === name);
    const holdsShown = mine.some(({ i }) => i === shown);
    s.text(a.c, r, fit(name.toUpperCase(), nameW), holdsShown ? P.plasma : P.phos);
    if (rowH > 1) s.text(a.c, r + 1, String(mine.length).padStart(2, "0"), P.dim);
    s.px((a.c + nameW) * CW, (r + rowH) * CH - 4, (binsW - nameW) * CW, 2, P.faint);
    mine.forEach(({ c, i }, k) => {
      const lit = i === shown;
      // each card slides along its hopper to its place, one after another
      const u = clamp((since - (b * 0.12 + k * 0.1)) / 0.35, 0, 1);
      const restX = (a.c + nameW + 1 + k * tileW) * CW;
      const cx = even(restX + (1 - u * (2 - u)) * (binsW - nameW - k * tileW) * CW);
      const cy = r * CH + 2 - (lit ? 4 : 0);
      const cw = tileW * CW - 6;
      const ch = rowH * CH - 10;
      const ink = lit ? P.phos : P.dim;
      s.px(cx, cy, cw, ch, "#000");
      s.outline(cx, cy, cw, ch, lit ? P.plasma : P.faint);
      s.px(cx, cy, 8, 8, "#000");
      s.px(cx + 6, cy, 2, 8, lit ? P.plasma : P.faint);
      s.px(cx, cy + 6, 8, 2, lit ? P.plasma : P.faint);
      s.text(Math.round(cx / CW) + 1, r, c.no, ink);
      if (rowH >= 3 && tileW >= 7) s.bitmap(cx + cw - 36, cy + ch - 28, iconRows(c.id), 2, ink);
      else if (rowH >= 2) punches(s, cx + 6, cy + ch - 12, Math.floor((cw - 12) / 8), i, lit ? P.plasma : P.faint);
      if (u >= 1) hot(s, `pick:${i}`, cx, r * CH, tileW * CW, rowH * CH);
    });
  });

  // the reader: the chosen card, at full size, with what is printed on it
  const card = CARDS[shown];
  if (readW) {
    const rc = a.c + binsW + 2;
    const X = rc * CW;
    const Y = a.r * CH + 4;
    const W = readW * CW;
    const H = a.h * CH - 8;
    s.outline(X, Y, W, H, P.phos);
    s.px(X, Y, 18, 18, "#000");
    s.px(X + 16, Y, 2, 18, P.phos);
    s.px(X, Y + 16, 18, 2, P.phos);
    const c = rc + 3;
    const w = readW - 6;
    let r = a.r + 1;
    s.text(c, r, `CARD ${card.no} OF ${n}`, P.dim);
    r += 1;
    r += para(s, c, r, w, card.short.toUpperCase(), P.phos, 2);
    s.text(c, r, fit(card.role, w), P.plasma);
    r += 2;
    fact(s, P, c, r, w, "KIND", card.kind);
    fact(s, P, c, r + 1, w, "PLACE", card.place);
    fact(s, P, c, r + 2, w, "TIME", card.duration);
    r += 4;
    const foot = a.r + a.h - 4;
    r += para(s, c, r, w, card.description, P.phos, Math.max(1, foot - r - 1));
    if (r < foot) s.text(c, r, fit(card.technologies.join(" · "), w), P.dim);
    punches(s, X + 26, (foot + 1) * CH - 14, Math.floor((W - 52) / 8), shown, P.faint);
    linkKey(s, `proj:${card.id}`, c, a.r + a.h - 2, "OPEN IN WORK", P.plasma, P.ink, g.hover === `proj:${card.id}`);
  } else {
    // on a narrow tube the reader is one line, and its key
    const r = a.r + a.h - 2;
    s.text(a.c, r, fit(`${card.no} ${card.short.toUpperCase()} · ${card.kind} · ${card.place}`, a.w), P.phos);
    linkKey(s, `proj:${card.id}`, a.c, r + 1, "OPEN IN WORK", P.plasma, P.ink, g.hover === `proj:${card.id}`);
  }
  return { count: n, index: shown };
}

/* ── Usability test: a form the visitor fills, and the observer's log ── */

const session = { pick0: -1, choseAt: -1, sentAt: -1 };

/** The visitor pressed the form's send key: the observer notes it. */
export function noteSent() {
  session.sentAt = performance.now() / 1000;
}

function test(g: Stage): Shown {
  const { s, P, t, a } = g;
  const chans = USABILITY_TEST.channels;
  const n = chans.length;
  const shown = shownOf(g, n);
  if (session.pick0 < 0) session.pick0 = g.pick;
  if (session.choseAt < 0 && (g.pick !== session.pick0 || g.hover?.startsWith("pick:"))) session.choseAt = t;
  const f = beat(t, 4);
  const ch = chans[shown];
  const wide = a.w >= 64;
  const formW = wide ? Math.round(a.w * 0.6) : a.w;
  const formH = wide ? a.h : clamp(a.h - 8, 12, 17);

  // the form: the task, who it goes to, by which channel, and what to expect back
  s.box(a.c, a.r, formW, formH, P.dim, P.phos, fit(`TASK 01 · ${USABILITY_TEST.task.toUpperCase()}`, formW - 6), P.ink);
  const c = a.c + 3;
  const w = formW - 6;
  let r = a.r + 2;
  r += para(s, c, r, w, USABILITY_TEST.taskBody, P.dim, 2) + 1;
  fact(s, P, c, r, w, "TO", SUBJECT.name);
  r += 2;
  s.text(c, r, "VIA", P.dim);
  let kx = c + 5;
  chans.forEach((one, i) => {
    const name = one.label.toUpperCase();
    if (kx + name.length + 2 > c + w) {
      kx = c + 5;
      r += 1;
    }
    kx = choice(g, `pick:${i}`, kx, r, name, i === shown) + 1;
  });
  r += 2;
  fact(s, P, c, r, w, "ADDRESS", ch.value, P.plasma);
  r += 1;
  s.text(c, r, fit(ch.role, w), P.faint);
  r += 2;
  USABILITY_TEST.successMetrics.forEach((m) => {
    if (r >= a.r + formH - 3) return;
    s.px(c * CW + 2, r * CH + 6, 6, 8, P.plasma);
    s.text(c + 2, r, fit(m, w - 2), P.phos);
    r += 1;
  });
  // the one key that sends it; it waits, blinking, once a channel is chosen
  const sendR = a.r + formH - 2;
  const ready = session.choseAt >= 0 && f % 2 === 0;
  linkKey(s, `chan:${shown}`, c, sendR, "PF1 SEND", P.plasma, P.ink, g.hover === `chan:${shown}` || ready);

  // the observer's log: the visitor is the one being tested, and this is their session
  const lc = wide ? a.c + formW + 2 : a.c;
  const lr = wide ? a.r : a.r + formH + 1;
  const lw = wide ? a.w - formW - 2 : a.w;
  const lh = wide ? a.h : a.r + a.h - lr;
  if (lh >= 6) {
    s.box(lc, lr, lw, lh, P.faint, P.dim, "OBSERVER", P.ink);
    const x0 = (lc + 3) * CW;
    let rr = lr + 2;
    s.text(lc + 3, rr, "TIME ON TASK", P.dim);
    rr += 1;
    // a clock that has been running since the record was opened
    const secs = t === 0 ? 0 : Math.max(0, Math.floor((session.sentAt >= 0 ? session.sentAt : t) - sceneAt));
    const clock = `${String(Math.floor(secs / 60) % 100).padStart(2, "0")}${String(secs % 60).padStart(2, "0")}`;
    const dh = lh >= 12 ? 40 : 20;
    const dw = dh / 2;
    clock.split("").forEach((d, i) => digit(s, x0 + i * (dw + 6) + (i > 1 ? 10 : 0), rr * CH + 2, dw, dh, d, P.plasma, P.ghost));
    if (f % 2 === 0 || t === 0) {
      s.px(x0 + 2 * (dw + 6) + 1, rr * CH + 2 + dh * 0.3, 4, 4, P.plasma);
      s.px(x0 + 2 * (dw + 6) + 1, rr * CH + 2 + dh * 0.65, 4, 4, P.plasma);
    }
    rr += Math.ceil((dh + 8) / CH) + 1;
    const steps: [string, boolean][] = [
      ["FOUND THE TASK", true],
      ["CHOSE A CHANNEL", session.choseAt >= 0],
      ["PRESSED SEND", session.sentAt >= 0],
    ];
    steps.forEach(([name, done]) => {
      if (rr >= lr + lh - 2) return;
      s.outline((lc + 3) * CW, rr * CH + 4, 12, 12, done ? P.plasma : P.dim);
      if (done) s.px((lc + 3) * CW + 4, rr * CH + 8, 4, 4, P.plasma);
      s.text(lc + 5, rr, fit(name, lw - 8), done ? P.phos : P.dim);
      rr += 1;
    });
    const passed = session.sentAt >= 0;
    if (rr < lr + lh - 1 && (passed || f % 2 === 0)) s.text(lc + 3, rr + 1 < lr + lh - 1 ? rr + 1 : rr, passed ? "RESULT · PASS" : "RESULT · IN PROGRESS", passed ? P.plasma : P.dim);
    // the observer itself, in the corner, watching the pointer
    if (lh >= 14 && lw >= 22) figure(s, (lc + lw - 3) * CW - 4 * FIG_W, (lr + lh - 1) * CH - 4 * FIG_H - 2, 4, P.dim, P.plasma, beat(t, 3), "stand", lookAt(g.ptr, (lc + lw - 5) * CW));
  }
  return { count: n, index: shown };
}

/* ── the board: each record's scene, small ── */

export interface Mini {
  s: Surface;
  P: Pal;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Seconds; held at 0 for a still picture. */
  t: number;
  /** Pointed at: the scene plays at full pace and in the bright shades. */
  lit: boolean;
}

/**
 * A record's scene at the size of a board cell, playing by itself: slowly and
 * dimly at rest, at full pace when pointed at. `id` is a record, or "work".
 */
export function playMini(id: string, m: Mini) {
  const { s, P, lit } = m;
  const x = even(m.x);
  const y = even(m.y);
  const w = even(m.w);
  const h = even(m.h);
  const t = lit ? m.t : m.t * 0.4;
  const ink = lit ? P.phos : P.dim;
  const soft = lit ? P.dim : P.faint;
  const mark = lit ? P.plasma : P.dim;
  const f = beat(t, 6);

  if (id === "why") {
    // the court: the ball goes between the two, and each follows it
    const padH = even(h * 0.4);
    const run = beat(t, 16) / 16;
    const bx = x + 14 + tri(run * 0.7) * (w - 36);
    const by = y + tri(run * 0.5 + 0.2) * (h - 8);
    const py = clamp(even(by - padH / 2), y, y + h - padH);
    for (let yy = y + 2; yy < y + h - 4; yy += 12) s.px(x + even(w / 2) - 1, yy, 2, 6, P.faint);
    s.px(x + 4, y, 6, h, P.ghost);
    s.px(x + w - 10, y, 6, h, P.ghost);
    s.px(x + 4, py, 6, padH, ink);
    s.px(x + w - 10, py, 6, padH, ink);
    s.px(even(bx), even(by), 6, 6, mark);
  } else if (id === "about") {
    // the cassette: its label, and two reels turning
    s.outline(x + 4, y, w - 8, h, ink);
    s.px(x + 14, y + 6, w - 28, 8, soft);
    const r = even(Math.min(h * 0.22, w * 0.12));
    [0.3, 0.7].forEach((at, k) => {
      const cx = x + even(w * at);
      const cy = y + even(h * 0.62);
      disc(s, cx, cy, r + (k ? 2 : 6), 2, P.faint);
      disc(s, cx, cy, r - 2, 2, "#000");
      const ang = ((f * (k ? 1 : -1)) * Math.PI) / 4;
      s.px(even(cx + Math.cos(ang) * (r - 6)) - 1, even(cy + Math.sin(ang) * (r - 6)) - 1, 4, 4, mark);
      s.px(even(cx - Math.cos(ang) * (r - 6)) - 1, even(cy - Math.sin(ang) * (r - 6)) - 1, 4, 4, mark);
    });
  } else if (id === "empathy") {
    // four panes and the one in the middle; each pane lights in turn
    const on = beat(t, 1.2) % 4;
    const pw = even(w / 2) - 4;
    const ph = even(h / 2) - 4;
    for (let i = 0; i < 4; i += 1) {
      const px = x + (i % 2) * (pw + 8);
      const py = y + Math.floor(i / 2) * (ph + 8);
      s.outline(px, py, pw, ph, i === on ? ink : P.faint);
      s.px(px + 6, py + 6, even(pw * 0.6), 2, i === on ? mark : P.faint);
      s.px(px + 6, py + 12, even(pw * 0.4), 2, i === on ? soft : P.ghost);
    }
    s.px(x + even(w / 2) - 8, y + even(h / 2) - 8, 16, 16, "#000");
    s.outline(x + even(w / 2) - 8, y + even(h / 2) - 8, 16, 16, ink);
    if (f % 4 !== 3) s.px(x + even(w / 2) - 2 + (on % 2 ? 2 : -2), y + even(h / 2) - 2, 4, 2, mark);
  } else if (id === "journey") {
    // the climb: four ledges, and the figure hopping up them
    const n = 4;
    const lw = even((w - 8) / n) - 4;
    const q = 2;
    const k = beat(t, 1.6) % n;
    for (let i = 0; i < n; i += 1) {
      const lx = x + i * (lw + 4);
      const ly = y + h - 6 - even((i * (h - q * FIG_H - 10)) / (n - 1));
      s.px(lx, ly, lw, 4, i === k ? ink : soft);
      dither(s, lx, ly + 4, lw, 4, 2, P.faint);
      if (i === k) figure(s, lx + even((lw - q * FIG_W) / 2), ly - q * FIG_H, q, ink, mark, f, "hop", 1);
      if (i === n - 1) {
        s.px(lx + lw - 4, ly - 18, 2, 18, soft);
        s.px(lx + lw - 12, ly - 18 + (f % 2) * 2, 8, 6, mark);
      }
    }
  } else if (id === "impact") {
    // the score table: rows, and the one being read
    const rows = Math.max(3, Math.floor(h / 12));
    const on = beat(t, 1.5) % rows;
    for (let i = 0; i < rows; i += 1) {
      const ry = y + i * 12;
      const lit2 = i === on;
      s.px(x + 4, ry + 2, 10, 6, lit2 ? mark : P.faint);
      s.px(x + 22, ry + 2, 24 - (i % 3) * 4, 6, lit2 ? ink : soft);
      s.px(x + 56, ry + 4, even((w - 64) * (0.9 - (i % 4) * 0.15)), 2, lit2 ? ink : P.faint);
    }
  } else if (id === "sort") {
    // the sorter: hoppers as rows, and cards sliding into them
    const bins = 3;
    const bh = even(h / bins);
    const step = beat(t, 1.1);
    const u = (t * 1.1) % 1;
    for (let b = 0; b < bins; b += 1) {
      const by = y + b * bh;
      s.px(x, by + bh - 4, w, 2, P.faint);
      const held = 1 + ((step + b) % 3);
      for (let k = 0; k < held; k += 1) {
        const moving = b === step % bins && k === held - 1;
        const cx = x + 8 + k * 26 + (moving ? even((1 - u) * (w - 40 - k * 26)) : 0);
        s.outline(cx, by + 2, 20, bh - 10, moving ? ink : soft);
        if (moving) s.px(cx + 6, by + 8, 4, 4, mark);
      }
    }
  } else if (id === "test") {
    // the form and its clock
    s.outline(x, y, even(w * 0.56), h, soft);
    for (let i = 0; i < 3; i += 1) s.px(x + 8, y + 8 + i * 10, even(w * 0.4) - i * 12, 2, i === beat(t, 1) % 3 ? ink : P.faint);
    s.px(x + 8, y + h - 12, 28, 6, f % 2 ? mark : soft);
    const secs = Math.floor(t) % 60;
    const cx = x + even(w * 0.62);
    digit(s, cx, y + 4, 12, 24, String(Math.floor(secs / 10)), mark, P.ghost);
    digit(s, cx + 18, y + 4, 12, 24, String(secs % 10), mark, P.ghost);
    for (let i = 0; i < 3; i += 1) s.outline(cx + i * 14, y + h - 14, 10, 10, i <= beat(t, 0.8) % 4 - 1 ? ink : P.faint);
  } else {
    // the way out to the work: candles climbing, and the arrow
    const bars = [0.3, 0.5, 0.42, 0.7, 0.6, 0.9];
    const on = beat(t, 3) % (bars.length + 2);
    bars.forEach((k, i) => {
      const bh = even((h - 6) * k);
      s.px(x + 4 + i * 14, y + h - bh, 8, bh, i < on ? ink : P.ghost);
    });
    s.bitmap(x + w - 34, y, GLYPHS.out, 4, f % 4 === 3 ? soft : mark);
  }
}

/** The file's figure, for anywhere else it stands. It faces the pointer, and waves when the pointer is near. */
export function standFigure(s: Surface, x: number, y: number, p: number, P: Pal, t: number, ptr: Point | null) {
  const cx = x + (p * FIG_W) / 2;
  const cy = y + (p * FIG_H) / 2;
  const near = ptr ? Math.hypot(ptr.x - cx, ptr.y - cy) < 150 : false;
  figure(s, even(x), even(y), p, P.phos, P.plasma, beat(t, near ? 6 : 3), near ? "wave" : "stand", lookAt(ptr, cx));
}

/** How tall and wide the figure is, in its own blocks. */
export const FIGURE = { w: FIG_W, h: FIG_H };

/* ── the moth ── */

const moth = { x: -1, y: -1 };

/**
 * A moth lives on this tube. The pointer is the brightest thing on the glass,
 * so the moth goes after it; with no pointer it keeps to `home`.
 */
export function playMoth(s: Surface, P: Pal, ptr: Point | null, home: Point, t: number) {
  if (t === 0) return;
  const to = ptr ?? home;
  const tx = to.x + Math.sin(t * 5.1) * 14 + (ptr ? 22 : Math.cos(t * 0.9) * 36);
  const ty = to.y + Math.cos(t * 4.3) * 10 + (ptr ? -18 : Math.sin(t * 1.3) * 12);
  if (moth.x < 0) {
    moth.x = tx;
    moth.y = ty;
  }
  moth.x += clamp(tx - moth.x, -8, 8);
  moth.y += clamp(ty - moth.y, -6, 6);
  const x = even(moth.x);
  const y = even(moth.y);
  const flap = beat(t, 10) % 2 ? -2 : 2;
  s.px(x, y, 2, 4, P.phos);
  s.px(x - 4, y + flap, 4, 2, P.dim);
  s.px(x + 2, y + flap, 4, 2, P.dim);
}

const SCENES: Record<RecordId, (g: Stage) => Shown> = { why, about, empathy, journey, impact, sort, test };

/** Play a record's scene on its stage. */
export function playScene(id: RecordId, g: Stage): Shown {
  if (id !== sceneKey) {
    sceneKey = id;
    sceneAt = g.t;
    if (id === "test") {
      session.pick0 = -1;
      session.choseAt = -1;
      session.sentAt = -1;
    }
  }
  return SCENES[id](g);
}

/** Forget which record was open, so the next one plays from its start. */
export function restScenes() {
  sceneKey = "";
}
