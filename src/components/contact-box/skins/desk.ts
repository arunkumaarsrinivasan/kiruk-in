/**
 * 1970 · the desk. Contact as Arun's desk while he is away from it, drawn on
 * the tube as things, not panes:
 *
 *   THE PAD     a "while you were out" message pad, the one big thing on the
 *               desk, in inverse video so it reads as paper. Who called, how
 *               to reply, what they came by for (tick boxes), and the message.
 *               A doodle beside the ticks changes with what is ticked, Arun's
 *               own line answers under them, and a pencil follows the writing.
 *               Tear the slip off and it flies onto the spike.
 *   THE WHEEL   a card wheel with one card for each way to reach him. Ticking
 *               a purpose turns it to the best card by itself.
 *   THE SHELF   his clock at Bengaluru's time, and his lamp: lit while he is
 *               awake, and its chain can be pulled.
 *   THE EDGE    his phone (lift it for the call card), his filter coffee (it
 *               can be sipped), a pencil, and the spike where notes wait.
 *
 * Nothing is dragged or aimed: every part is pressed. This file only draws;
 * the skin holds the state. Under reduced motion `time` is 0 and nothing moves.
 */

import { CHANNELS, INTENTS, WHO, type ChannelId, type ContactWhoId, type Intent, type IntentId } from "@/data/contact";
import { CH, CW, fit, wrap, type Surface } from "@/components/modules/work-os/control-room/surface";
import { linkKey, palette, type Area, type Pal } from "@/components/modules/work-os/control-room/views";
import type { Pt, TubeFrame } from "@/components/modules/work-os/control-room/use-tube";
import { playMoth } from "@/components/era-shell/archetypes/terminal/home/home-scenes";

export type Field = "name" | "from" | "subject" | "body";

export interface Desk {
  who: ContactWhoId;
  intent: Intent;
  /** When the purpose was last ticked: the cross is drawn in. */
  tickAt: number;
  /** The card the wheel shows, and when it turned to it. */
  card: ChannelId;
  cardAt: number;
  focus: Field | null;
  /** When a key was last typed: the pencil shakes. */
  typedAt: number;
  name: string;
  from: string;
  body: string;
  ready: boolean;
  sendState: "idle" | "sending" | "sent" | "error";
  sendError: string;
  /** When the note was delivered: the slip sets off for the spike. */
  sentAt: number;
  copied: boolean;
  /** Arun's local time and date, and whether he is likely up. */
  clock: string;
  date: string;
  awake: boolean;
  /** A sentence about the time where he is, from the contact engine. */
  tz: string;
  lamp: boolean;
  /** How much coffee is left, 0 to 3, and when it was last sipped. */
  sips: number;
  sipAt: number;
  status: string;
}

/** A short name for each card's tab. */
const TAB: Record<ChannelId, string> = { email: "MAIL", call: "CALL", linkedin: "LNKD", github: "GIT", studio: "IG", life: "VLOG", x: "X" };

/** The doodle beside the ticks: a case, a hammer, a pencil, a question, a wave. */
const DOODLE: Record<IntentId, readonly string[]> = {
  hire: ["....####....", "...#....#...", "############", "#..........#", "#..........#", "#####..#####", "#....##....#", "#..........#", "#..........#", "############"],
  build: ["..#######...", ".#########..", ".#########..", "..###.####..", "....##......", "....##......", "....##......", "....##......", "....##......", "....##......"],
  "talk-design": [".........##.", "........####", ".......####.", "......####..", ".....####...", "....####....", "...####.....", "..####......", ".###........", "##.........."],
  advice: ["...######...", "..##....##..", "..##....##..", "........##..", ".......##...", ".....###....", ".....##.....", "............", ".....##.....", ".....##....."],
  hello: ["....#.#.#...", "....#.#.#.#.", "....#.#.#.#.", "..#.#.#.#.#.", "..#.#######.", "..#########.", "..#########.", "...########.", "....######..", ".....####..."],
};

/** How long the slip takes to reach the spike. */
const FLY = 0.9;

const even = (v: number) => Math.round(v / 2) * 2;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const beat = (t: number, fps: number) => Math.floor(t * fps);
const ease = (u: number) => 1 - (1 - u) ** 3;

/** The four inks of paper: the sheet, what is printed on it, what is written on it, and the marker. */
interface Ink {
  paper: string;
  print: string;
  ink: string;
  hi: string;
}
const inks = (P: Pal): Ink => ({ paper: P.dim, print: P.ghost, ink: "#000", hi: P.phos });

/* ── little parts ── */

function disc(s: Surface, cx: number, cy: number, r: number, color: string) {
  for (let j = -r; j < r; j += 2) {
    const half = even(Math.sqrt(Math.max(0, r * r - (j + 1) ** 2)));
    if (half > 0) s.px(even(cx) - half, even(cy) + j, half * 2, 2, color);
  }
}

function ring(s: Surface, cx: number, cy: number, r: number, color: string, w = 2) {
  const n = Math.max(48, Math.round(r * 2.4));
  for (let a = 0; a < n; a += 1) {
    const ang = (a / n) * Math.PI * 2;
    s.px(even(cx + Math.cos(ang) * r) - w / 2, even(cy + Math.sin(ang) * r) - w / 2, w, w, color);
  }
}

function line(s: Surface, a: Pt, b: Pt, color: string, w = 2) {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 2));
  for (let i = 0; i <= n; i += 1) {
    const u = i / n;
    s.px(even(a.x + (b.x - a.x) * u) - w / 2, even(a.y + (b.y - a.y) * u) - w / 2, w, w, color);
  }
}

function burst(s: Surface, x: number, y: number, age: number, c: string) {
  if (age < 0 || age > 0.35) return;
  const d = even(6 + age * 50);
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1.4]]) s.px(even(x + dx * d), even(y + dy * d), 4, 4, c);
}

/** A torn slip: paper with two lines of writing. */
function slip(s: Surface, K: Ink, x: number, y: number, w: number, h: number) {
  s.px(even(x), even(y), w, h, K.paper);
  s.px(even(x) + 4, even(y) + 4, w - 12, 2, K.ink);
  if (h >= 12) s.px(even(x) + 4, even(y) + 8, w - 20, 2, K.ink);
}

/* ── THE PAD ── */

/** Where the writing stands, for the pencil. */
let caret: Pt | null = null;

function paperKey(s: Surface, K: Ink, f: TubeFrame, id: string, c: number, r: number, label: string, kind: "main" | "plain" | "off"): number {
  const w = label.length + 2;
  const x = c * CW;
  const y = r * CH + 2;
  const lit = f.hover === id;
  if (kind === "off") {
    s.outline(x, y, w * CW, CH - 4, K.print);
    s.text(c + 1, r, label, K.print);
  } else if (kind === "main" ? !lit : lit) {
    s.px(x, y, w * CW, CH - 4, K.ink);
    s.text(c + 1, r, label, K.paper);
  } else {
    if (kind === "main") s.px(x, y, w * CW, CH - 4, K.hi);
    s.outline(x, y, w * CW, CH - 4, K.ink);
    s.text(c + 1, r, label, K.ink);
  }
  if (kind !== "off") s.zone(id, c, r, w, 1);
  return c + w;
}

function paperField(s: Surface, K: Ink, b: Desk, f: TubeFrame, id: Field, c: number, r: number, w: number, label: string, value: string, t: number) {
  const on = b.focus === id;
  const x = c + label.length + 1;
  const room = c + w - x;
  if (on || f.hover === `field:${id}`) s.px(x * CW - 4, r * CH + 1, room * CW + 6, CH - 2, K.hi);
  s.text(c, r, label, K.print);
  const shown = value.length > room - 1 ? value.slice(value.length - room + 1) : value;
  s.text(x, r, shown, K.ink);
  s.px(x * CW - 2, r * CH + 17, room * CW + 2, 2, K.ink);
  if (on) {
    caret = { x: (x + shown.length) * CW + 2, y: r * CH + 16 };
    if (t === 0 || beat(t, 2) % 2 === 0) s.px(caret.x, r * CH + 3, 6, 13, K.ink);
  }
  s.zone(`field:${id}`, c, r, w, 1);
}

function message(s: Surface, K: Ink, b: Desk, f: TubeFrame, c: number, r: number, w: number, rows: number, t: number) {
  const on = b.focus === "body";
  if (on || f.hover === "field:body") s.px(c * CW - 8, r * CH + 2, 4, rows * CH - 4, K.ink);
  for (let i = 0; i < rows; i += 1) s.px(c * CW, (r + i + 1) * CH - 2, w * CW, 2, K.print);
  const lines = b.body.split("\n").flatMap((p) => wrap(p, w - 1));
  const start = on ? Math.max(0, lines.length - rows) : 0;
  const shown = lines.slice(start, start + rows);
  shown.forEach((l, i) => s.text(c, r + i, l, K.ink));
  if (on) {
    const last = Math.max(0, shown.length - 1);
    caret = { x: (c + (shown[last]?.length ?? 0)) * CW + 2, y: (r + last) * CH + 16 };
    if (t === 0 || beat(t, 2) % 2 === 0) s.px(caret.x, (r + last) * CH + 3, 6, 13, K.ink);
  }
  s.zone("field:body", c, r, w, rows);
}

/** The pencil, its point where the writing stands. */
function pencil(s: Surface, P: Pal, at: Pt, shake: boolean) {
  const x = even(at.x) + (shake ? 2 : 0);
  const y = even(at.y) - (shake ? 2 : 0);
  s.px(x, y - 2, 2, 2, "#000");
  for (let i = 0; i < 14; i += 1) {
    const bx = x + 2 + i * 4;
    const by = y - 8 - i * 4;
    if (i < 2) s.px(bx, by + 2, 4, 4, P.phos);
    else {
      s.px(bx - 1, by - 1, 8, 8, "#000");
      s.px(bx + 1, by + 1, 4, 4, i >= 12 ? P.plasma : i >= 10 ? P.faint : P.phos);
    }
  }
}

function sheet(s: Surface, P: Pal, K: Ink, a: Area) {
  const X = a.c * CW;
  const Y = a.r * CH;
  const W = a.w * CW;
  const H = a.h * CH;
  // the sheets under this one, then this one, its gum strip and its perforation
  s.px(X + 8, Y + 8, W, H, P.ghost);
  s.px(X + 4, Y + 4, W, H, P.faint);
  s.px(X, Y, W, H, K.paper);
  s.px(X, Y, W, 10, K.hi);
  for (let i = X + 6; i < X + W - 8; i += 10) s.px(i, Y + 13, 6, 2, K.ink);
}

function pad(s: Surface, P: Pal, b: Desk, f: TubeFrame, a: Area, t: number): Pt {
  const K = inks(P);
  sheet(s, P, K, a);
  const center = { x: (a.c + a.w / 2) * CW, y: (a.r + a.h / 2) * CH };
  const ic = a.c + 2;
  const iw = a.w - 4;
  const roomy = a.h >= 25;
  const wide = iw >= 40;
  let row = a.r + 1;

  if (b.sendState === "sent") {
    // the next sheet on the pad: a thank you
    row += 1;
    s.text(ic, row, "THANK YOU", K.ink, 2);
    row += 3;
    if (b.name.trim()) {
      s.text(ic, row, fit(`${b.name.trim().toUpperCase()},`, iw), K.ink);
      row += 2;
    }
    for (const l of wrap(`Your note is on the spike. ${b.tz}`, iw)) {
      s.text(ic, row, l, K.ink);
      row += 1;
    }
    const p = 8;
    const wave = t > 0 && beat(t, 3) % 2 ? 4 : 0;
    s.bitmap((ic + iw) * CW - 12 * p + wave, (a.r + a.h - 3) * CH - 10 * p - 8, DOODLE.hello, p, K.ink);
    paperKey(s, K, f, "key:new", ic, a.r + a.h - 3, "ANOTHER NOTE", "plain");
    return center;
  }

  // the head of the slip
  const title = "WHILE YOU WERE OUT";
  if (iw >= title.length * 2) {
    s.text(ic + Math.floor((iw - title.length * 2) / 2), row, title, K.ink, 2);
    row += 2;
  } else {
    s.text(ic, row, title, K.ink);
    row += 1;
  }
  const x = s.text(ic, row, "FOR", K.print);
  s.text(x + 1, row, "ARUN", K.ink);
  const stamp = `${b.date}  ${b.clock || "--:--"} IST`;
  s.text(ic + iw - stamp.length, row, stamp, K.ink);
  if (roomy) {
    s.px(ic * CW, (row + 1) * CH + 6, iw * CW, 2, K.ink);
    s.px(ic * CW, (row + 1) * CH + 10, iw * CW, 2, K.ink);
    row += 2;
  } else {
    s.px(ic * CW, (row + 1) * CH - 1, iw * CW, 2, K.ink);
    row += 1;
  }

  // who called, and how to reply
  const whoLabel = (WHO.find((w) => w.id === b.who)?.label ?? "").toUpperCase();
  const sw = whoLabel.length + 4;
  const whoStamp = (c: number, r: number) => {
    const lit = f.hover === "who:next";
    s.text(c, r, "WHO IS", K.print);
    s.px((c + 7) * CW, r * CH + 1, sw * CW, CH - 2, lit ? K.hi : K.ink);
    s.text(c + 8, r, whoLabel, lit ? K.ink : K.paper);
    s.text(c + 6 + sw, r, ">", lit ? K.ink : K.paper);
    s.zone("who:next", c, r, sw + 7, 1);
  };
  if (wide) {
    const sx = ic + iw - sw - 7;
    paperField(s, K, b, f, "name", ic, row, sx - 2 - ic, "FROM", b.name, t);
    whoStamp(sx, row);
    row += 1;
  } else {
    paperField(s, K, b, f, "name", ic, row, iw, "FROM", b.name, t);
    whoStamp(ic, row + 1);
    row += 2;
  }
  paperField(s, K, b, f, "from", ic, row, iw, "REPLY TO", b.from, t);
  row += 1;

  // what they came by for
  if (roomy) {
    s.text(ic, row, "CAME BY TO", K.print);
    row += 1;
  }
  const ticksTop = row;
  for (const it of INTENTS) {
    const id = `intent:${it.id}`;
    const on = b.intent.id === it.id;
    const lit = f.hover === id;
    const label = it.label.toUpperCase();
    if (lit) s.px(ic * CW - 4, row * CH + 1, (label.length + 4) * CW + 4, CH - 2, K.hi);
    const bx = ic * CW + 2;
    const by = row * CH + 3;
    s.outline(bx, by, 14, 14, K.ink);
    if (on) {
      const strokes = t === 0 ? 12 : clamp(Math.floor((t - b.tickAt) * 60), 0, 12);
      for (let i = 0; i < Math.min(6, strokes); i += 1) s.px(bx + 1 + i * 2, by + 1 + i * 2, 2, 2, K.ink);
      for (let i = 0; i < strokes - 6; i += 1) s.px(bx + 11 - i * 2, by + 1 + i * 2, 2, 2, K.ink);
    }
    s.text(ic + 3, row, label, on || lit ? K.ink : K.print);
    s.zone(id, ic, row, label.length + 4, 1);
    row += 1;
  }
  if (iw >= 40) {
    const p = 6;
    const fresh = t > 0 && t - b.tickAt < 0.4 && beat(t, 12) % 2 ? 2 : 0;
    s.bitmap((ic + iw) * CW - 12 * p - 6 + fresh, ticksTop * CH + 14 - fresh, DOODLE[b.intent.id], p, K.ink);
  }

  // Arun's own line for that purpose
  if (roomy) {
    const lines = wrap(b.intent.why, iw - 8).slice(0, 2);
    s.px(ic * CW - 6, row * CH + 2, iw * CW + 12, lines.length * CH, K.ink);
    s.plate(ic, row, "ARUN", "#000", P.plasma);
    lines.forEach((l, i) => s.text(ic + 7, row + i, l, P.phos));
    row += lines.length;
    s.text(ic, row, "MESSAGE", K.print);
    row += 1;
  }

  // the message, and the way out
  const keyRow = a.r + a.h - (roomy ? 3 : 2);
  message(s, K, b, f, ic, row, iw, Math.max(1, keyRow - row), t);
  const sending = b.sendState === "sending";
  let kx = paperKey(s, K, f, "key:send", ic, keyRow, sending ? "TEARING OFF.." : wide ? "TEAR OFF + SEND" : "SEND", b.ready && !sending ? "main" : "off") + 1;
  kx = linkKey(s, "key:mail", kx, keyRow, wide ? "OPEN IN MAIL" : "MAIL", K.ink, K.paper, f.hover === "key:mail") + 1;
  if (roomy) {
    let hint = "";
    if (b.sendState === "error") hint = `NOT SENT: ${b.sendError} TRY AGAIN, OR OPEN IT IN YOUR MAIL.`;
    else if (!b.ready && !sending) {
      const need: string[] = [];
      if (!b.name.trim()) need.push("YOUR NAME");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.from.trim())) need.push("AN EMAIL");
      if (b.body.trim().length <= 10 || b.body.trim() === b.intent.body.trim()) need.push("A LINE OF YOUR OWN");
      hint = `NEEDS ${need.join(" · ")}`;
    }
    if (hint) s.text(ic, keyRow + 1, fit(hint.toUpperCase(), iw), b.sendState === "error" ? K.ink : K.print);
  }
  return center;
}

/* ── THE WHEEL ── */

function wheel(s: Surface, P: Pal, b: Desk, f: TubeFrame, cc: number, tr: number, cw: number, t: number) {
  const K = inks(P);
  const X = cc * CW;
  const Y = (tr + 1) * CH;
  const W = cw * CW;
  const H = 8 * CH;
  const mid = (tr + 4) * CH + 10;

  // the axle, and a knob at each end
  s.px(X - 40, mid, W + 80, 2, P.faint);
  for (const [id, col, glyph] of [["card:prev", cc - 4, "<"], ["card:next", cc + cw + 3, ">"]] as const) {
    const kx = col * CW + 5;
    const lit = f.hover === id;
    disc(s, kx, mid, 16, lit ? P.phos : "#000");
    ring(s, kx, mid, 16, lit ? P.phos : P.dim);
    for (let i = 0; i < 6; i += 1) {
      const ang = (i / 6) * Math.PI * 2 + (lit && t > 0 ? beat(t, 10) * 0.26 : 0);
      s.px(even(kx + Math.cos(ang) * 22) - 2, even(mid + Math.sin(ang) * 22) - 2, 4, 4, lit ? P.phos : P.dim);
    }
    s.text(col, tr + 4, glyph, lit ? P.ink : P.phos);
    s.zones.push({ id, x: kx - 28, y: mid - 28, w: 56, h: 56 });
  }

  // the tabs: one for each card, the open one joined to its card
  const tw = Math.floor(cw / CHANNELS.length);
  CHANNELS.forEach((ch, i) => {
    const id = `chan:${ch.id}`;
    const on = b.card === ch.id;
    const lit = f.hover === id;
    const tc = cc + i * tw;
    const tx = tc * CW;
    const rank = b.intent.channels.indexOf(ch.id);
    const name = fit(TAB[ch.id], tw);
    const edge = lit ? P.phos : P.dim;
    if (on) s.px(tx, tr * CH + 2, tw * CW - 2, CH, K.paper);
    else {
      s.px(tx, tr * CH + 4, tw * CW - 2, 2, edge);
      s.px(tx, tr * CH + 4, 2, CH - 4, edge);
      s.px(tx + tw * CW - 4, tr * CH + 4, 2, CH - 4, edge);
    }
    s.text(tc + Math.max(0, Math.floor((tw - name.length) / 2)), tr, name, on ? K.ink : lit || rank >= 0 ? P.phos : P.dim);
    if (rank === 0 && !on) s.px(tx + even((tw * CW) / 2) - 4, tr * CH - 4, 6, 4, P.plasma);
    s.zone(id, tc, tr, tw, 1);
  });

  // the cards behind, and the stand
  s.px(X + 8, Y + H + 2, W - 16, 2, P.dim);
  s.px(X + 20, Y + H + 6, W - 40, 2, P.faint);
  s.px(even(X + W / 2) - 56, Y + H + 12, 112, 6, P.dim);

  // the card turning over
  const age = t - b.cardAt;
  if (t > 0 && age >= 0 && age < 0.18) {
    const k = age < 0.06 ? 0.2 : age < 0.12 ? 0.55 : 0.85;
    s.px(X, Y, W, even(H * k), K.paper);
    return;
  }
  s.px(X, Y, W, H, K.paper);

  const ch = CHANNELS.find((c) => c.id === b.card) ?? CHANNELS[0];
  const ic = cc + 1;
  const iw = cw - 2;
  const label = ch.label.toUpperCase();
  const rank = b.intent.channels.indexOf(ch.id);
  const big = label.length * 2 + 7 <= iw;
  s.text(ic, tr + 1, fit(label, iw), K.ink, big ? 2 : 1);
  if (rank >= 0) {
    const used = big ? label.length * 2 : label.length;
    const mark = rank > 0 ? `NO. ${rank + 1}` : iw - used >= 16 ? "BEST FOR THIS" : "BEST";
    if (iw - used >= mark.length + 3) s.plate(ic + iw - mark.length - 2, tr + 1, mark, rank === 0 ? "#000" : K.paper, rank === 0 ? P.plasma : K.ink);
  }
  s.text(ic, tr + 3, fit(ch.handle, iw), K.ink);
  s.px(ic * CW, (tr + 4) * CH, iw * CW, 2, K.print);
  wrap(ch.use, iw)
    .slice(0, 2)
    .forEach((l, i) => s.text(ic, tr + 4 + i, l, K.ink));

  let kx = ic;
  const kr = tr + 7;
  if (ch.id === "email") {
    kx = paperKey(s, K, f, "key:write", kx, kr, iw >= 28 ? "WRITE ON THE PAD" : "WRITE", "main") + 1;
    paperKey(s, K, f, "key:copy", kx, kr, b.copied ? "COPIED" : "COPY", "plain");
  } else {
    linkKey(s, "key:open", kx, kr, ch.id === "call" ? "BOOK A SLOT" : "OPEN", K.ink, K.paper, f.hover === "key:open");
  }
}

/* ── THE SHELF: his clock and his lamp ── */

function shelf(s: Surface, P: Pal, b: Desk, f: TubeFrame, RX: number, RY: number, RW: number, t: number): Pt | null {
  const y = RY + 140;
  s.px(RX, y, RW, 2, P.faint);

  // the clock, at his time
  const R = 56;
  const cx = RX + R + 6;
  const cy = y - R - 8;
  const lit = f.hover === "toy:clock";
  ring(s, cx, cy, R, lit ? P.phos : P.dim, 4);
  for (let i = 0; i < 12; i += 1) {
    const ang = (i / 12) * Math.PI * 2;
    const q = i % 3 === 0 ? 4 : 2;
    s.px(even(cx + Math.cos(ang) * (R - 10)) - q / 2, even(cy + Math.sin(ang) * (R - 10)) - q / 2, q, q, i % 3 === 0 ? P.phos : P.dim);
  }
  const [hh, mm] = b.clock ? b.clock.split(":").map(Number) : [10, 10];
  const ha = (((hh % 12) + mm / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  const ma = (mm / 60) * Math.PI * 2 - Math.PI / 2;
  line(s, { x: cx, y: cy }, { x: cx + Math.cos(ha) * R * 0.48, y: cy + Math.sin(ha) * R * 0.48 }, P.phos, 4);
  line(s, { x: cx, y: cy }, { x: cx + Math.cos(ma) * R * 0.74, y: cy + Math.sin(ma) * R * 0.74 }, P.phos, 2);
  if (t > 0) {
    const sa = (new Date().getSeconds() / 60) * Math.PI * 2 - Math.PI / 2;
    s.px(even(cx + Math.cos(sa) * (R - 18)) - 2, even(cy + Math.sin(sa) * (R - 18)) - 2, 4, 4, P.plasma);
  }
  s.px(cx - 3, cy - 3, 6, 6, P.plasma);
  s.px(cx - 34, y - 8, 10, 8, P.dim);
  s.px(cx + 24, y - 8, 10, 8, P.dim);
  s.zones.push({ id: "toy:clock", x: cx - R, y: cy - R, w: R * 2, h: R * 2 + 8 });

  // his time, in words
  const tc = Math.ceil((cx + R + 14) / CW);
  const tr = Math.floor(RY / CH);
  if (RW >= 300) {
    s.text(tc, tr, "BENGALURU", P.dim);
    const end = s.text(tc, tr + 1, b.clock || "--:--", P.phos, 2);
    s.text(end + 1, tr + 2, "IST", P.dim);
    const px0 = s.plate(tc, tr + 4, b.awake ? "AWAKE" : "ASLEEP", "#000", b.awake ? P.plasma : P.dim) * CW + 12;
    const py0 = (tr + 4) * CH + 10;
    if (b.awake) {
      disc(s, px0, py0, 6, P.phos);
      for (let i = 0; i < 8; i += 1) {
        const ang = (i / 8) * Math.PI * 2 + (t > 0 ? beat(t, 1) * 0.39 : 0);
        s.px(even(px0 + Math.cos(ang) * 11) - 1, even(py0 + Math.sin(ang) * 11) - 1, 2, 2, P.dim);
      }
    } else {
      disc(s, px0, py0, 7, P.dim);
      disc(s, px0 + 4, py0 - 2, 6, "#000");
    }
  }

  // his lamp: lit while he is up, and the chain can be pulled
  if (RW < 380) return null;
  const lx = RX + RW - 34;
  const hx = lx - 50;
  const hy = y - 114;
  const on = b.lamp;
  const hot = f.hover === "toy:lamp";
  const col = hot ? P.phos : P.dim;
  s.px(lx - 20, y - 6, 40, 6, col);
  line(s, { x: lx, y: y - 6 }, { x: lx + 12, y: y - 66 }, col, 4);
  line(s, { x: lx + 12, y: y - 66 }, { x: hx + 6, y: hy + 2 }, col, 4);
  s.px(lx + 8, y - 70, 8, 8, P.phos);
  for (let i = 0; i < 6; i += 1) s.px(hx - 8 - i * 4, hy + i * 4, 16 + i * 8, 4, on ? P.phos : col);
  s.px(hx - 4, hy + 24, 8, 6, on ? P.plasma : P.faint);
  if (on) {
    for (let j = 0; j < y - hy - 36; j += 4) {
      const half = 26 + j * 0.55;
      for (let x = hx - half + ((j / 4) % 2) * 4; x < hx + half; x += 8) s.px(even(x), hy + 32 + j, 2, 2, j < 24 ? P.dim : P.faint);
    }
  }
  for (let j = 0; j < 22; j += 6) s.px(hx + 30, hy + 26 + j, 2, 2, P.dim);
  s.px(hx + 28, hy + 50, 6, 6, hot ? P.plasma : P.phos);
  s.zones.push({ id: "toy:lamp", x: hx - 34, y: hy - 6, w: lx + 24 - (hx - 34), h: y - hy + 6 });
  return { x: hx, y: hy + 40 };
}

/* ── THE EDGE: phone, coffee, pencil, spike ── */

function edge(s: Surface, P: Pal, b: Desk, f: TubeFrame, RX: number, RW: number, by: number, t: number, landed: boolean): Pt {
  const K = inks(P);
  s.px(RX, by, RW, 2, P.faint);

  // the phone: lift it for the call card
  const x0 = RX + 6;
  const hotPhone = f.hover === "toy:phone";
  const pc = hotPhone ? P.phos : P.dim;
  const lifted = b.card === "call";
  s.px(x0, by - 30, 112, 30, P.ghost);
  s.outline(x0, by - 30, 112, 30, pc);
  s.px(x0 + 10, by - 40, 92, 10, P.ghost);
  s.px(x0 + 10, by - 40, 92, 2, pc);
  s.px(x0 + 10, by - 40, 2, 10, pc);
  s.px(x0 + 100, by - 40, 2, 10, pc);
  disc(s, x0 + 56, by - 18, 13, "#000");
  ring(s, x0 + 56, by - 18, 13, pc);
  for (let i = 0; i < 6; i += 1) {
    const ang = (i / 6) * Math.PI * 2 + (hotPhone && t > 0 ? beat(t, 8) * 0.35 : 0);
    s.px(even(x0 + 56 + Math.cos(ang) * 7) - 1, even(by - 18 + Math.sin(ang) * 7) - 1, 2, 2, P.phos);
  }
  s.px(x0 + 18, by - 50, 6, 10, pc);
  s.px(x0 + 88, by - 50, 6, 10, pc);
  const hy = by - 62 - (lifted ? 16 : 0) - (hotPhone && !lifted && t > 0 && beat(t, 10) % 2 ? 2 : 0);
  const hc = lifted || hotPhone ? P.phos : P.dim;
  s.px(x0 + 10, hy, 92, 8, hc);
  s.px(x0 + 2, hy + 2, 20, 14, hc);
  s.px(x0 + 90, hy + 2, 20, 14, hc);
  if (lifted) for (let i = 0; i < 4; i += 1) s.px(x0 + 4 + (i % 2) * 4, hy + 18 + i * 4, 2, 2, P.dim);
  s.zones.push({ id: "toy:phone", x: x0 - 4, y: by - 84, w: 122, h: 84 });

  // his filter coffee, in its tumbler and davara
  const x1 = even(RX + RW * 0.42);
  const hotCup = f.hover === "toy:cup";
  const cc = hotCup ? P.phos : P.dim;
  s.outline(x1, by - 16, 56, 16, cc);
  s.px(x1 - 4, by - 18, 64, 2, cc);
  s.px(x1 + 16, by - 54, 24, 40, "#000");
  s.outline(x1 + 16, by - 54, 24, 40, cc);
  s.px(x1 + 12, by - 56, 32, 2, cc);
  if (b.sips > 0) s.px(x1 + 20, by - 18 - b.sips * 10, 16, b.sips * 10, P.faint);
  if (b.sips > 0 && t > 0) for (let i = 0; i < 2; i += 1) s.px(x1 + 22 + i * 10, by - 66 - ((beat(t, 3) + i) % 3) * 4, 2, 6, P.faint);
  if (t > 0) burst(s, x1 + 28, by - 62, t - b.sipAt, P.phos);
  s.zones.push({ id: "toy:cup", x: x1 - 6, y: by - 72, w: 68, h: 72 });

  // the spike, and the notes on it
  const sx = RX + RW - 32;
  const hotSpike = f.hover === "toy:spike";
  const sc = hotSpike ? P.phos : P.dim;
  s.px(sx - 1, by - 88, 2, 80, P.phos);
  s.px(sx - 24, by - 6, 48, 6, sc);
  s.px(sx - 14, by - 10, 28, 4, sc);
  s.px(sx - 28, by - 22, 54, 10, P.ghost);
  s.outline(sx - 28, by - 22, 54, 10, sc);
  s.px(sx - 22, by - 34, 50, 10, P.ghost);
  s.outline(sx - 22, by - 34, 50, 10, sc);
  if (landed) slip(s, K, sx - 26, by - 50, 52, 14);
  s.zones.push({ id: "toy:spike", x: sx - 32, y: by - 92, w: 64, h: 92 });

  // the pencil, at rest while nothing is being written
  const x2 = x1 + 84;
  const len = sx - 44 - x2;
  if (len >= 60 && !b.focus) {
    const hotPen = f.hover === "toy:pencil";
    const y = by - 8 - (hotPen && t > 0 && beat(t, 8) % 2 ? 2 : 0);
    s.px(x2, y, 8, 6, P.plasma);
    s.px(x2 + 8, y, 4, 6, P.faint);
    s.px(x2 + 12, y, len - 26, 6, hotPen ? P.phos : P.dim);
    s.px(x2 + len - 14, y + 1, 6, 4, P.dim);
    s.px(x2 + len - 8, y + 2, 4, 2, P.phos);
    s.zones.push({ id: "toy:pencil", x: x2, y: y - 10, w: len, h: 24 });
  }
  return { x: sx, y: by - 44 };
}

/** Phones: the cards as one strip under the pad. */
function strip(s: Surface, P: Pal, b: Desk, f: TubeFrame, c: number, r: number, w: number) {
  const tw = Math.floor(w / CHANNELS.length);
  CHANNELS.forEach((ch, i) => {
    const id = `chan:${ch.id}`;
    const on = b.card === ch.id;
    const name = fit(TAB[ch.id], tw - 1);
    if (on) s.px((c + i * tw) * CW, r * CH + 2, tw * CW - 2, CH - 4, P.phos);
    s.text(c + i * tw + Math.max(0, Math.floor((tw - name.length) / 2)), r, name, on ? P.ink : b.intent.channels.includes(ch.id) ? P.phos : P.dim);
    s.zone(id, c + i * tw, r, tw, 1);
  });
  const ch = CHANNELS.find((x) => x.id === b.card) ?? CHANNELS[0];
  s.text(c, r + 1, fit(`${ch.label.toUpperCase()} · ${ch.handle}`, w), P.phos);
  s.text(c, r + 2, fit(ch.use, w), P.dim);
  if (ch.id === "email") {
    const x = s.key("key:write", c, r + 3, "WRITE", P.plasma, P.ink, true) + 1;
    s.key("key:copy", x, r + 3, b.copied ? "COPIED" : "COPY", P.phos, P.ink, f.hover === "key:copy");
  } else linkKey(s, "key:open", c, r + 3, ch.id === "call" ? "BOOK A SLOT" : "OPEN", P.plasma, P.ink, true);
}

/* ── the whole screen ── */

export function drawDesk(s: Surface, f: TubeFrame, b: Desk) {
  const P = palette(f.config.color);
  const K = inks(P);
  const t = f.time;
  const { c, r, w, h } = f.safe;
  const narrow = w < 80;
  caret = null;

  const x = s.plate(c, r, narrow ? "KIRUK" : "KIRUK STATION", P.ink, P.phos);
  s.text(x + 1, r, "CONTACT", P.phos);
  if (!narrow) {
    const tag = "ARUN'S DESK, WHILE HE IS OUT";
    s.text(c + w - tag.length, r, tag, P.dim);
  }
  s.px(c * CW, (r + h - 1) * CH - 8, w * CW, 2, P.plasmaDim);
  s.text(c, r + h - 1, fit(`> ${b.status.toUpperCase()}`, w), P.plasma);

  const top = r + 2;
  const rows = h - 4;
  const shake = t > 0 && t - b.typedAt < 0.25 && beat(t, 16) % 2 === 0;

  if (narrow) {
    pad(s, P, b, f, { c, r: top, w: w - 1, h: rows - 5 }, t);
    strip(s, P, b, f, c, top + rows - 4, w);
    if (caret) pencil(s, P, caret, shake);
    return;
  }

  const pw = clamp(Math.round(w * 0.5), 44, 58);
  const from = pad(s, P, b, f, { c: c + 1, r: top, w: pw, h: rows }, t);

  const rc = c + 1 + pw + 3;
  const RX = rc * CW;
  const RY = top * CH;
  const RW = (c + w - rc) * CW;
  const lampAt = shelf(s, P, b, f, RX, RY, RW, t);

  // a whole number of columns for each of the seven tabs
  const cw = Math.floor(clamp(c + w - rc - 12, 22, 36) / 7) * 7;
  const tr = top + 8;
  wheel(s, P, b, f, rc + Math.floor((c + w - rc - cw) / 2), tr, cw, t);

  // the slip leaves the pad for the spike
  const by = (top + rows) * CH - 6;
  const age = b.sendState === "sent" ? (t === 0 ? 9 : t - b.sentAt) : -1;
  if (by - ((tr + 9) * CH + 24) >= 92) {
    const spike = edge(s, P, b, f, RX, RW, by, t, age >= FLY);
    if (age >= 0 && age < FLY) {
      const u = ease(age / FLY);
      slip(s, K, from.x + (spike.x - 26 - from.x) * u, from.y + (spike.y - 6 - from.y) * u - Math.sin(u * Math.PI) * 140, 52, 14);
    }
    if (age >= FLY) burst(s, spike.x, spike.y, age - FLY, P.phos);
  }

  if (caret) pencil(s, P, caret, shake);
  // the moth keeps to the lamp while it is lit, and to the pointer when it is not
  const home = lampAt ?? { x: RX + RW - 60, y: RY + 60 };
  playMoth(s, P, lampAt && b.lamp ? null : f.pointer, home, t);
}
