/**
 * 1970 · the call. Contact as one telephone call, drawn across the tube as a
 * scene, left to right along a wire:
 *
 *   YOU        a rotary phone. Dial who you are: the dial turns to the stop
 *              and runs back, as a dial does.
 *   EXCHANGE   the operator at her switchboard. She plugs the cord herself,
 *              into the best line for you; press another jack and she
 *              re-plugs. What the call is about sits on her ticket keys.
 *   ARUN       his desk: the phone that rings, his lamp, his window, his
 *              clock. Awake, he picks up. Asleep (it goes by Bengaluru's
 *              clock), he is asleep at the desk and the answering machine
 *              takes the call.
 *
 * Under the scene, a dialog box says who is speaking, types their line out,
 * and holds what the open line needs: a note to write, a slot to book, or a
 * profile to dial. A note sent goes along the wire as an envelope.
 *
 * Nothing here is dragged and nothing can be missed: every part is pressed.
 * This file only draws; the skin holds the state. Under reduced motion `time`
 * is 0 and nothing moves.
 */

import { CHANNELS, EMAIL, INTENTS, WHO, type Channel, type ChannelId, type ContactWhoId, type Intent, type IntentId } from "@/data/contact";
import { CH, CW, fit, wrap, type Surface } from "@/components/modules/work-os/control-room/surface";
import { linkKey, palette, type Area, type Pal } from "@/components/modules/work-os/control-room/views";
import type { Pt, TubeFrame } from "@/components/modules/work-os/control-room/use-tube";
import { playMoth } from "@/components/era-shell/archetypes/terminal/home/home-scenes";

export type Field = "name" | "from" | "subject" | "body";

export interface Board {
  who: ContactWhoId;
  /** The visitor has dialled who they are. */
  dialled: boolean;
  /** The hole last dialled, and when: the dial turns and runs back. */
  dialIdx: number;
  dialAt: number;
  intent: Intent;
  /** The line the operator has plugged, and when: it rings for a moment. */
  line: ChannelId | null;
  lineAt: number;
  /** When the visitor pressed send: the envelope sets off along the wire. */
  sentAt: number;
  focus: Field | null;
  name: string;
  from: string;
  subject: string;
  body: string;
  ready: boolean;
  sendState: "idle" | "sending" | "sent" | "error";
  sendError: string;
  copied: boolean;
  /** Arun's local time, and whether he is likely up. */
  clock: string;
  awake: boolean;
  /** A sentence about the time where he is, from the contact engine. */
  tz: string;
  status: string;
}

/** A short name for each purpose, for the operator's ticket keys. */
const TICKET: Record<IntentId, string> = { hire: "ROLE", build: "BUILD", "talk-design": "DESIGN", advice: "ADVICE", hello: "HI" };
/** A short name for each line, printed under its jack on the board. */
const JACK: Record<ChannelId, string> = { email: "MAIL", call: "CALL", linkedin: "LINKD", github: "GIT", studio: "IG", life: "VLOG", x: "X" };
/** How long the line rings before it is answered. */
export const RING = 1.4;
const DIAL_OUT = 0.35;
const DIAL_BACK = 0.55;
const WIRE_TIME = 1.8;

const even = (v: number) => Math.round(v / 2) * 2;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const beat = (t: number, fps: number) => Math.floor(t * fps);
const ease = (u: number) => 1 - (1 - u) ** 3;

/* ── little parts ── */

function disc(s: Surface, cx: number, cy: number, r: number, color: string) {
  for (let j = -r; j < r; j += 2) {
    const half = even(Math.sqrt(Math.max(0, r * r - (j + 1) ** 2)));
    if (half > 0) s.px(even(cx) - half, even(cy) + j, half * 2, 2, color);
  }
}

function ring(s: Surface, cx: number, cy: number, r: number, color: string, w = 2) {
  for (let a = 0; a < 64; a += 1) {
    const ang = (a / 64) * Math.PI * 2;
    s.px(even(cx + Math.cos(ang) * r) - w / 2, even(cy + Math.sin(ang) * r) - w / 2, w, w, color);
  }
}

/** A line of blocks from a to b. */
function line(s: Surface, a: Pt, b: Pt, color: string, w = 2, sag = 0) {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 3));
  for (let i = 0; i <= n; i += 1) {
    const u = i / n;
    s.px(even(a.x + (b.x - a.x) * u) - w / 2, even(a.y + (b.y - a.y) * u + Math.sin(u * Math.PI) * sag) - w / 2, w, w, color);
  }
}

/** Where along a sagging span a point at share `u` sits. */
const onSpan = (a: Pt, b: Pt, sag: number, u: number): Pt => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u + Math.sin(u * Math.PI) * sag });

function lamp(s: Surface, P: Pal, x: number, y: number, state: "off" | "dim" | "on" | "blink", t: number) {
  const on = state === "on" || (state === "blink" && (t === 0 || beat(t, 3) % 2 === 0));
  s.px(even(x), even(y), 8, 8, on ? P.plasma : state === "dim" ? P.dim : P.ghost);
  if (on) {
    s.px(even(x) - 2, even(y) + 2, 2, 4, P.plasmaDim);
    s.px(even(x) + 8, even(y) + 2, 2, 4, P.plasmaDim);
  }
}

function burst(s: Surface, x: number, y: number, age: number, c: string) {
  if (age < 0 || age > 0.35) return;
  const d = even(6 + age * 50);
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1.4]]) s.px(even(x + dx * d), even(y + dy * d), 4, 4, c);
}

/** The file's figure: a tube for a head with a cursor in it. */
function person(s: Surface, P: Pal, x: number, y: number, p: number, t: number, o: { look?: number; arm?: "down" | "up" | "phone"; headset?: boolean; asleep?: boolean }) {
  const f = beat(t, 5);
  const body = P.phos;
  const X = even(x);
  if (o.asleep) {
    // head down on the desk, arms folded, and the Zs rising
    s.px(X, y + p * 6, p * 7, p, body);
    s.px(X, y + p * 6, p, p * 4, body);
    s.px(X + p * 6, y + p * 6, p, p * 4, body);
    s.px(X, y + p * 9, p * 7, p, body);
    s.px(X + p * 7, y + p * 8, p * 3, p * 2, body);
    if (t > 0) {
      for (let i = 0; i < 3; i += 1) {
        const u = (t * 0.45 + i / 3) % 1;
        const zx = X + p * (2 + i * 2) + even(Math.sin(u * 6) * p);
        const zy = y + p * 5 - even(u * p * 9);
        const z = p + (i === 2 ? 2 : 0);
        s.px(zx, zy, z, 2, u < 0.8 ? P.dim : P.faint);
        s.px(zx + z - 2, zy + 2, 2, 2, u < 0.8 ? P.dim : P.faint);
        s.px(zx, zy + 4, z, 2, u < 0.8 ? P.dim : P.faint);
      }
    }
    return;
  }
  s.px(X + p, y, p * 6, p, body);
  s.px(X + p, y + p * 4, p * 6, p, body);
  s.px(X + p, y, p, p * 5, body);
  s.px(X + p * 6, y, p, p * 5, body);
  if (f % 6 !== 5) s.px(X + p * (3 + (o.look ?? 0)), y + p * 2, p * 2, p, P.plasma);
  if (o.headset) {
    s.px(X, y - p, p * 8, p, P.dim);
    s.px(X, y - p, p, p * 4, P.dim);
    s.px(X - p, y + p * 2, p, p * 3, P.dim);
    s.px(X - p, y + p * 4, p * 3, p, P.dim);
  }
  s.px(X + p * 3, y + p * 5, p * 2, p, body);
  s.px(X + p * 2, y + p * 6, p * 4, p * 3, body);
  s.px(X + p, y + p * 6, p, p * 2, body);
  if (o.arm === "up") s.px(X + p * 6, y + p * (f % 2 ? 4 : 3), p, p * 2, body);
  else if (o.arm === "phone") {
    // the handset held to the side of the head
    s.px(X + p * 6, y + p * 3, p, p * 3, body);
    s.px(X + p * 7, y + p, p, p * 4, P.plasma);
  } else s.px(X + p * 6, y + p * 6, p, p * 2, body);
}

/* ── YOU: the rotary phone ── */

/** Where hole i sits at rest, in radians, y down. The finger stop is at the lower right. */
const holeAngle = (i: number) => (-150 + i * 40) * (Math.PI / 180);
const STOP = (60 * Math.PI) / 180;

function dialTurn(b: Board, t: number): number {
  if (!b.dialled || t === 0) return 0;
  const age = t - b.dialAt;
  const travel = STOP - holeAngle(b.dialIdx) + 0.25;
  if (age < 0) return 0;
  if (age < DIAL_OUT) return ease(age / DIAL_OUT) * travel;
  if (age < DIAL_OUT + DIAL_BACK) return (1 - (age - DIAL_OUT) / DIAL_BACK) * travel;
  return 0;
}

function you(s: Surface, P: Pal, b: Board, f: TubeFrame, a: { x: number; y: number; w: number; h: number }, t: number, small: boolean) {
  const cx = even(a.x + a.w / 2);
  const R = even(Math.max(40, Math.min(a.w * 0.38, a.h * 0.36)));
  const cy = even(a.y + CH * 1.6 + R);
  const turn = dialTurn(b, t);

  // the body of the phone, and its handset in the cradle
  const bodyW = R * 2 + 28;
  s.px(cx - bodyW / 2, cy - R - 14, bodyW, 2, P.dim);
  s.px(cx - bodyW / 2, cy - R - 14, 2, R * 2 + 30, P.dim);
  s.px(cx + bodyW / 2 - 2, cy - R - 14, 2, R * 2 + 30, P.dim);
  s.px(cx - bodyW / 2, cy + R + 14, bodyW, 2, P.dim);
  const lifted = !!b.line;
  const hy = cy - R - 30 - (lifted ? 10 : 0);
  s.px(cx - R + 2, hy, R * 2 - 4, 8, lifted ? P.phos : P.dim);
  s.px(cx - R - 4, hy + 4, 12, 12, lifted ? P.phos : P.dim);
  s.px(cx + R - 8, hy + 4, 12, 12, lifted ? P.phos : P.dim);

  // the dial: a plate, ten-ish holes, the finger stop
  disc(s, cx, cy, R, P.ghost);
  ring(s, cx, cy, R, P.dim);
  const hr = even(Math.max(9, R * 0.17));
  WHO.forEach((wh, i) => {
    const ang = holeAngle(i) + turn;
    const hx = cx + Math.cos(ang) * (R - hr - 6);
    const hy2 = cy + Math.sin(ang) * (R - hr - 6);
    const id = `who:${wh.id}`;
    const on = b.dialled && b.who === wh.id;
    const lit = f.hover === id;
    disc(s, hx, hy2, hr, "#000");
    ring(s, hx, hy2, hr, on ? P.plasma : lit ? P.phos : P.dim, on || lit ? 4 : 2);
    // the number printed in the hole, as on the plate under a real dial
    const n = String(i + 1);
    s.text(Math.round((hx - 5) / CW), Math.round((hy2 - 10) / CH), n, on ? P.plasma : lit ? P.phos : P.dim);
    s.zones.push({ id, x: hx - hr - 4, y: hy2 - hr - 4, w: hr * 2 + 8, h: hr * 2 + 8 });
  });
  // the finger stop
  const sx = cx + Math.cos(STOP + 0.25) * (R + 2);
  const sy = cy + Math.sin(STOP + 0.25) * (R + 2);
  s.px(even(sx) - 4, even(sy) - 8, 8, 16, P.phos);
  // the card in the middle: who is calling
  const hoverWho = f.hover?.startsWith("who:") ? WHO.find((w) => `who:${w.id}` === f.hover) : null;
  const card = (hoverWho ?? (b.dialled ? WHO.find((w) => w.id === b.who) : null))?.label.toUpperCase() ?? "DIAL";
  const cardW = Math.min(card.length, Math.floor((R * 1.1) / CW));
  s.text(Math.round((cx - (cardW * CW) / 2) / CW), Math.round((cy - 10) / CH), fit(card, cardW), b.dialled || hoverWho ? P.plasma : P.dim);

  // the legend: what each hole means
  if (!small) {
    const lr = Math.round((cy + R + 22) / CH);
    const colW = Math.floor(a.w / CW / 2);
    WHO.forEach((wh, i) => {
      const c = Math.round(a.x / CW) + (i % 2) * colW;
      const r = lr + Math.floor(i / 2);
      const on = b.dialled && b.who === wh.id;
      s.text(c, r, fit(`${i + 1} ${wh.label.toUpperCase()}`, colW - 1), on ? P.plasma : P.dim);
      s.zone(`who:${wh.id}`, c, r, colW - 1, 1);
    });
  }
  return { phone: { x: cx, y: cy - R - 14 } };
}

/* ── EXCHANGE: the operator and her board ── */

function exchange(s: Surface, P: Pal, b: Board, f: TubeFrame, a: { x: number; y: number; w: number; h: number }, t: number) {
  // the ticket keys: what the call is about
  let kc = Math.round(a.x / CW) + 1;
  const kr = Math.round(a.y / CH);
  s.text(kc, kr, "RE", P.dim);
  kc += 3;
  for (const it of INTENTS) {
    const name = TICKET[it.id];
    const id = `intent:${it.id}`;
    if (b.intent.id === it.id) {
      s.zone(id, kc, kr, name.length + 2, 1);
      kc = s.plate(kc, kr, name, P.ink, P.plasma) + 1;
    } else kc = s.key(id, kc, kr, name, P.phos, P.ink, f.hover === id) + 1;
  }

  // the board: a jack for each line, a lamp over each, its name under
  const bx = even(a.x + 8);
  const bw = even(a.w - 16);
  const by = even(a.y + CH * 2);
  const bh = even(Math.min(a.h * 0.4, CH * 7));
  s.outline(bx, by, bw, bh, P.dim);
  s.outline(bx + 4, by + 4, bw - 8, bh - 8, P.faint);
  const n = CHANNELS.length;
  const pitch = (bw - 24) / n;
  const jackAt = new Map<ChannelId, Pt>();
  CHANNELS.forEach((ch, i) => {
    const jx = even(bx + 12 + pitch * (i + 0.5));
    const jy = even(by + bh * 0.55);
    const id = `chan:${ch.id}`;
    const rank = b.intent.channels.indexOf(ch.id);
    const plugged = b.line === ch.id;
    const lit = f.hover === id;
    const state = plugged ? (t - b.lineAt < RING ? "blink" : "on") : b.dialled && rank >= 0 ? "dim" : "off";
    lamp(s, P, jx - 4, by + 12, state, t);
    s.outline(jx - 8, jy - 8, 16, 16, plugged || lit ? P.phos : P.dim);
    s.px(jx - 4, jy - 4, 8, 8, plugged ? P.phos : "#000");
    const name = JACK[ch.id];
    const room = Math.max(3, Math.floor(pitch / CW));
    const nc = Math.round((jx - (Math.min(name.length, room) * CW) / 2) / CW);
    s.text(nc, Math.round((by + bh + 4) / CH), fit(name, room), plugged ? P.plasma : lit ? P.phos : rank === 0 && b.dialled ? P.phos : P.dim);
    // the best line wears a small mark until it is plugged
    if (b.dialled && rank === 0 && !plugged) s.px(jx - 2, by + 4, 4, 4, P.plasma);
    s.zones.push({ id, x: jx - pitch / 2, y: by, w: pitch, h: bh + CH * 1.4 });
    jackAt.set(ch.id, { x: jx, y: jy });
  });

  // the operator at the shelf, and the cord she plugs: short, taut, never loose
  const shelf = even(a.y + a.h - 6);
  s.px(a.x + 8, shelf, a.w - 16, 2, P.dim);
  const p = clamp(even(a.h / 20), 4, 8);
  const ox = even(a.x + a.w / 2 - p * 4);
  const oy = shelf - p * 11 - 2;
  const plugged = b.line ? jackAt.get(b.line) : null;
  const look = plugged ? (plugged.x < ox + p * 2 ? -1 : plugged.x > ox + p * 6 ? 1 : 0) : f.pointer ? (f.pointer.x < ox - 30 ? -1 : f.pointer.x > ox + p * 8 + 30 ? 1 : 0) : 0;
  const reaching = !!plugged && t > 0 && t - b.lineAt < 0.5;
  person(s, P, ox, oy, p, t, { look, arm: reaching ? "up" : "down", headset: true });
  const hand: Pt = { x: ox + p * 7, y: oy + p * 7 };
  // the cords at rest on the shelf
  for (let i = 0; i < 3; i += 1) s.px(ox - p * (4 + i * 3), shelf - 10, 6, 10, P.faint);
  if (plugged) {
    const u = t === 0 ? 1 : clamp((t - b.lineAt) / 0.35, 0, 1);
    const end = { x: hand.x + (plugged.x - hand.x) * ease(u), y: hand.y + (plugged.y - hand.y) * ease(u) };
    line(s, hand, end, P.plasma, 4, 6 * (1 - Math.abs(0.5 - u)));
    s.px(even(end.x) - 5, even(end.y) - 6, 10, 12, P.plasma);
    burst(s, plugged.x, plugged.y, t - b.lineAt - 0.35, P.phos);
  }
  return { top: { x: a.x + a.w / 2, y: by } };
}

/* ── ARUN: his desk ── */

function arun(s: Surface, P: Pal, b: Board, a: { x: number; y: number; w: number; h: number }, t: number) {
  const p = clamp(even(a.h / 20), 4, 8);
  const desk = even(a.y + a.h - 6);
  const asleep = !b.awake;
  const ringing = !!b.line && t > 0 && t - b.lineAt > 0.35 && t - b.lineAt < RING + 0.35;
  const answered = !!b.line && (t === 0 || t - b.lineAt >= RING + 0.35);

  // the window: the sky over Bengaluru, by his clock
  const wx = even(a.x + a.w - 92);
  const wy = even(a.y + CH * 1.4);
  s.outline(wx, wy, 72, 56, P.dim);
  s.px(wx + 35, wy, 2, 56, P.faint);
  s.px(wx, wy + 27, 72, 2, P.faint);
  if (asleep) {
    disc(s, wx + 52, wy + 16, 9, P.dim);
    disc(s, wx + 56, wy + 13, 8, "#000");
    for (let i = 0; i < 4; i += 1) if ((beat(t, 1.5) + i) % 3) s.px(wx + 8 + i * 15, wy + 6 + ((i * 7) % 18), 2, 2, P.dim);
  } else {
    disc(s, wx + 18, wy + 16, 8, P.dim);
    for (let i = 0; i < 4; i += 1) {
      const ang = (i / 4) * Math.PI * 2 + beat(t, 1) * 0.4;
      s.px(even(wx + 18 + Math.cos(ang) * 13), even(wy + 16 + Math.sin(ang) * 13), 2, 2, P.faint);
    }
    s.px(wx + 44 + (beat(t, 0.5) % 8) * 2, wy + 40, 16, 2, P.ghost);
    s.px(wx + 40 + (beat(t, 0.5) % 8) * 2, wy + 44, 22, 2, P.ghost);
  }
  // his clock, by the window
  s.text(Math.round((a.x + 6) / CW), Math.round(wy / CH), b.clock ? `ARUN · ${b.clock} IST` : "ARUN · IST", P.phos);
  s.text(Math.round((a.x + 6) / CW), Math.round(wy / CH) + 1, asleep ? "ASLEEP" : "AWAKE", asleep ? P.dim : P.plasma);

  // the desk, the lamp, the tea
  s.px(a.x + 8, desk, a.w - 16, 2, P.dim);
  const lx = even(a.x + a.w - 40);
  s.px(lx, desk - p * 9, 2, p * 9, P.dim);
  s.px(lx - 12, desk - p * 9, 18, 6, P.phos);
  if (!asleep) for (let i = 1; i < 4; i += 1) s.px(lx - 10 + i * 2, desk - p * 9 + 6 + i * 6, 14 - i * 4, 2, P.ghost);
  const tx = even(a.x + a.w - 70);
  s.px(tx, desk - 14, 14, 14, P.dim);
  s.px(tx + 14, desk - 10, 4, 6, P.dim);
  if (t > 0 && !asleep) for (let i = 0; i < 2; i += 1) s.px(tx + 4 + i * 4, desk - 20 - ((beat(t, 3) + i) % 3) * 4, 2, 4, P.faint);

  // him
  const fx = even(a.x + a.w * 0.42);
  const fy = desk - p * 11 - 2;
  person(s, P, fx, fy, p, t, { asleep, arm: answered && !asleep ? "phone" : b.sendState === "sent" && !asleep ? "up" : "down", look: -1 });

  // the phone: it rings, and in his hand it is answered
  const px0 = even(a.x + 16);
  const bounce = ringing && beat(t, 12) % 2 ? 4 : 0;
  s.px(px0, desk - 16 - bounce, 34, 16, P.dim);
  s.outline(px0 + 9, desk - 14 - bounce, 16, 12, P.faint);
  if (!(answered && !asleep)) {
    s.px(px0 - 2, desk - 24 - bounce * 2, 38, 6, ringing ? P.plasma : P.dim);
  }
  if (ringing && beat(t, 6) % 2 === 0) {
    s.text(Math.round((px0 - 4) / CW), Math.round((desk - 46) / CH), "RING", P.plasma);
  }

  // the answering machine: it takes the call at night, and keeps count
  const mx = px0 + 40;
  s.outline(mx, desk - 14, 26, 14, P.dim);
  const taking = !!b.line && asleep && answered;
  lamp(s, P, mx + 4, desk - 10, taking ? "blink" : b.sendState === "sent" && asleep ? "on" : "off", t);
  if (b.sendState === "sent") s.text(Math.round((mx + 14) / CW), Math.round((desk - 20) / CH), "1", P.plasma);

  // the in-tray, where a note lands
  const trayX = even(a.x + a.w * 0.42 - 34);
  s.px(trayX, desk - 6, 24, 2, P.faint);
  s.px(trayX, desk - 10, 2, 6, P.faint);
  s.px(trayX + 22, desk - 10, 2, 6, P.faint);
  return { phone: { x: px0 + 17, y: desk - 24 }, tray: { x: trayX + 12, y: desk - 8 } };
}

/* ── the wire, and what travels on it ── */

let dialogKey = "";
let dialogAt = 0;

function wire(s: Surface, P: Pal, b: Board, poles: Pt[], drops: { from: Pt; to: Pt }[], tray: Pt, t: number) {
  const sag = 10;
  for (let i = 0; i < poles.length - 1; i += 1) line(s, poles[i], poles[i + 1], P.dim, 2, sag);
  for (const p of poles) {
    s.px(even(p.x) - 1, even(p.y) - 6, 2, 10, P.faint);
    s.px(even(p.x) - 6, even(p.y) - 6, 12, 2, P.faint);
  }
  for (const d of drops) line(s, d.from, d.to, P.faint, 2);

  // the note: an envelope that goes along the wire to his desk
  const age = b.sentAt > 0 && t > 0 ? t - b.sentAt : b.sendState === "sent" ? 99 : -1;
  const spans = poles.length - 1;
  const travel = age >= 0 ? clamp(age / WIRE_TIME, 0, 1) : -1;
  let env: Pt | null = null;
  if (travel >= 0 && travel < 1) {
    const k = Math.min(spans - 1, Math.floor(travel * spans));
    env = onSpan(poles[k], poles[k + 1], sag, travel * spans - k);
  } else if (travel >= 1 && b.sendState !== "error") {
    // down from the last pole into the tray
    const drop = clamp((age - WIRE_TIME) / 0.4, 0, 1);
    const last = poles[poles.length - 1];
    env = { x: last.x + (tray.x - last.x) * drop, y: last.y + (tray.y - last.y) * drop };
  }
  // birds on the wire: they hop when the note goes by
  for (let i = 0; i < 4; i += 1) {
    const k = i % spans;
    const u = 0.3 + ((i * 0.37) % 0.4);
    const at = onSpan(poles[k], poles[k + 1], sag, u);
    const near = env && Math.abs(env.x - at.x) < 40 && env.y < at.y + 10;
    const hop = near ? 8 : beat(t, 0.7 + i * 0.13) % 7 === 0 && t > 0 ? 2 : 0;
    const y = even(at.y) - 6 - hop;
    s.px(even(at.x) - 4, y, 8, 4, P.dim);
    s.px(even(at.x) + (i % 2 ? -6 : 4), y - 2, 4, 4, P.dim);
  }
  if (env) {
    const x = even(env.x) - 8;
    const y = even(env.y) - 14;
    s.px(x, y, 16, 12, "#000");
    s.outline(x, y, 16, 12, P.plasma);
    s.px(x + 4, y + 4, 2, 2, P.plasma);
    s.px(x + 6, y + 6, 4, 2, P.plasma);
    s.px(x + 10, y + 4, 2, 2, P.plasma);
  }
}

/* ── the dialog box ── */

interface Speech {
  who: string;
  text: string;
}

function speech(b: Board, t: number): Speech {
  if (!b.dialled) return { who: "OPERATOR", text: "Number, please. Dial who you are." };
  const best = CHANNELS.find((c) => c.id === b.intent.channels[0])!;
  const ch = CHANNELS.find((c) => c.id === b.line);
  if (!ch) return { who: "OPERATOR", text: `The best line for you is ${best.label}. Press its jack.` };
  if (t > 0 && t - b.lineAt < RING + 0.35) return { who: "OPERATOR", text: `Putting you through on ${ch.label}…` };
  if (b.sendState === "sent") {
    return { who: b.awake ? "ARUN" : "ANSWERING MACHINE", text: `Thank you${b.name.trim() ? `, ${b.name.trim()}` : ""}. Your note is on my desk. ${b.tz}` };
  }
  if (b.sendState === "error") return { who: "OPERATOR", text: `The line dropped: ${b.sendError} Try again, or open it in your mail.` };
  if (!b.awake) return { who: "ANSWERING MACHINE", text: `${b.tz} ${ch.use}` };
  return { who: "ARUN", text: ch.id === b.intent.channels[0] ? b.intent.why : ch.use };
}

function field(s: Surface, P: Pal, b: Board, id: Field, c: number, r: number, w: number, label: string, value: string, t: number) {
  const on = b.focus === id;
  s.text(c, r, label, on ? P.plasma : P.dim);
  const x = c + label.length + 1;
  const room = c + w - x;
  const shown = value.length > room - 1 ? value.slice(value.length - room + 1) : value;
  s.text(x, r, shown, P.phos);
  s.px(x * CW, r * CH + 17, room * CW, 2, on ? P.plasma : P.faint);
  if (on && (t === 0 || beat(t, 2) % 2 === 0)) s.px((x + shown.length) * CW + 2, r * CH + 3, 8, 14, P.plasma);
  s.zone(`field:${id}`, c, r, w, 1);
}

function dialog(s: Surface, P: Pal, b: Board, f: TubeFrame, a: Area, t: number) {
  const X = a.c * CW;
  const Y = a.r * CH;
  s.px(X, Y, a.w * CW, a.h * CH, "#000");
  s.outline(X, Y + 2, a.w * CW, a.h * CH - 4, P.phos);
  s.outline(X + 4, Y + 6, a.w * CW - 8, a.h * CH - 12, P.faint);

  // who is speaking, and their line typed out
  const sp = speech(b, t);
  const key = `${sp.who}|${sp.text}`;
  if (key !== dialogKey) {
    dialogKey = key;
    dialogAt = t;
  }
  const c = a.c + 2;
  const w = a.w - 4;
  const end = s.plate(c - 1, a.r + 1, sp.who, P.ink, sp.who === "ARUN" ? P.plasma : P.phos);
  const shown = t === 0 ? sp.text.length : Math.floor((t - dialogAt) * 45);
  const textRows = 2;
  wrap(sp.text, w - 2)
    .slice(0, textRows)
    .reduce((left, lineText, i) => {
      s.text(c, a.r + 2 + i, lineText.slice(0, Math.max(0, left)), P.phos);
      return left - lineText.length - 1;
    }, shown);
  if (shown < sp.text.length && beat(t, 4) % 2 === 0) s.px((end + 1) * CW, (a.r + 1) * CH + 6, 6, 8, P.plasma);

  const body: Area = { c, r: a.r + 2 + textRows, w, h: a.h - 3 - textRows };
  const ch = CHANNELS.find((x) => x.id === b.line);
  const answered = !!ch && (t === 0 || t - b.lineAt >= RING + 0.35);
  if (!ch || !answered) {
    // before the call is through: the address, always one press away
    const r = body.r + body.h - 1;
    s.text(c, r, "OR WRITE TO", P.dim);
    s.text(c + 12, r, fit(EMAIL, w - 28), P.phos);
    s.key("key:copy", c + w - 14, r, b.copied ? "COPIED" : "COPY", P.phos, P.ink, b.copied);
    return;
  }
  if (ch.id === "email") letter(s, P, b, body, t, f);
  else dial(s, P, ch, body, f);
}

function letter(s: Surface, P: Pal, b: Board, a: Area, t: number, f: TubeFrame) {
  const { c, r, w, h } = a;
  if (b.sendState === "sent") {
    let x = c;
    x = s.key("key:new", x, r + h - 1, "NEW CALL", P.phos, P.ink, f.hover === "key:new") + 1;
    s.key("key:hang", x, r + h - 1, "HANG UP", P.phos, P.ink, f.hover === "key:hang");
    return;
  }
  const half = Math.floor((w - 2) / 2);
  field(s, P, b, "name", c, r, half, "NAME", b.name, t);
  field(s, P, b, "from", c + half + 2, r, w - half - 2, "EMAIL", b.from, t);
  const room = Math.max(1, h - 2);
  const lines = b.body.split("\n").flatMap((p) => wrap(p, w - 2));
  const shown = lines.slice(Math.max(0, lines.length - room));
  const on = b.focus === "body";
  shown.forEach((l, i) => s.text(c + 1, r + 1 + i, l, P.phos));
  if (on && (t === 0 || beat(t, 2) % 2 === 0)) s.px((c + 1 + (shown[shown.length - 1]?.length ?? 0)) * CW + 2, (r + Math.max(1, shown.length)) * CH + 3, 8, 14, P.plasma);
  s.px(c * CW, (r + 1) * CH, 2, room * CH, on ? P.plasma : P.faint);
  s.zone("field:body", c, r + 1, w, room);

  const kr = r + h - 1;
  let x = c;
  const sending = b.sendState === "sending";
  if (b.ready && !sending) x = s.key("key:send", x, kr, "SEND ALONG THE WIRE", P.plasma, P.ink, true) + 1;
  else x = s.key("key:send", x, kr, sending ? "ON ITS WAY" : "SEND", P.ghost, P.ink, false) + 1;
  x = linkKey(s, "key:mail", x, kr, "OPEN IN MAIL", P.phos, P.ink, f.hover === "key:mail") + 1;
  if (!b.ready && !sending) {
    const need: string[] = [];
    if (!b.name.trim()) need.push("NAME");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.from.trim())) need.push("EMAIL");
    if (b.body.trim().length <= 10 || b.body.trim() === b.intent.body.trim()) need.push("A LINE OF YOUR OWN");
    const hint = `NEEDS ${need.join(" · ")}`;
    if (x + hint.length + 1 < c + w - 10) s.text(x + 1, kr, hint, P.dim);
  }
  s.key("key:hang", c + w - 9, kr, "HANG UP", P.dim, P.ink, f.hover === "key:hang");
}

function dial(s: Surface, P: Pal, ch: Channel, a: Area, f: TubeFrame) {
  const { c, r, w, h } = a;
  s.text(c, r, fit(ch.handle, w), P.plasma);
  const x = linkKey(s, "key:dial", c, r + h - 1, ch.id === "call" ? "BOOK A SLOT" : `OPEN ${ch.label.toUpperCase()}`, P.plasma, P.ink, f.hover === "key:dial") + 1;
  if (x + 9 <= c + w) s.key("key:hang", c + w - 9, r + h - 1, "HANG UP", P.dim, P.ink, f.hover === "key:hang");
}

/* ── the whole screen ── */

export function drawCall(s: Surface, f: TubeFrame, b: Board) {
  const P = palette(f.config.color);
  const t = f.time;
  const { c, r, w, h } = f.safe;
  const narrow = w < 80;

  let x = s.plate(c, r, narrow ? "KIRUK" : "KIRUK STATION", P.ink, P.phos);
  x = s.text(x + 1, r, "CONTACT", P.phos);
  if (!narrow) s.text(c + w - 26, r, "ONE CALL, THREE STATIONS", P.dim);

  const dialogH = clamp(Math.round(h * 0.34), 8, 11);
  const sceneR = r + 2;
  const sceneH = h - 3 - dialogH - 1;
  const X = c * CW;
  const Y = sceneR * CH;
  const W = w * CW;
  const H = sceneH * CH;

  if (narrow) {
    // a phone held upright: the dial and the desk side by side, the board as a row of jacks
    const half = W / 2;
    you(s, P, b, f, { x: X, y: Y, w: half, h: H * 0.62 }, t, true);
    const desk = arun(s, P, b, { x: X + half, y: Y, w: half, h: H * 0.62 }, t);
    const ex = exchange(s, P, b, f, { x: X, y: Y + H * 0.62, w: W, h: H * 0.38 }, t);
    void ex;
    void desk;
  } else {
    const youW = W * 0.25;
    const exW = W * 0.44;
    const arW = W - youW - exW;
    const wireY = Y + CH * 0.6;
    const yourPhone = you(s, P, b, f, { x: X, y: Y + CH, w: youW, h: H - CH }, t, false).phone;
    const board = exchange(s, P, b, f, { x: X + youW, y: Y + CH, w: exW, h: H - CH }, t).top;
    const desk = arun(s, P, b, { x: X + youW + exW, y: Y + CH, w: arW, h: H - CH }, t);
    const poles: Pt[] = [
      { x: X + 18, y: wireY },
      { x: X + youW, y: wireY },
      { x: X + youW + exW, y: wireY },
      { x: X + W - 18, y: wireY },
    ];
    wire(
      s,
      P,
      b,
      poles,
      [
        { from: poles[0], to: { x: X + 18, y: yourPhone.y } },
        { from: { x: board.x, y: wireY + 10 }, to: board },
        { from: poles[3], to: { x: X + W - 18, y: desk.phone.y } },
      ],
      desk.tray,
      t,
    );
  }

  dialog(s, P, b, f, { c, r: sceneR + sceneH, w, h: dialogH }, t);
  s.px(c * CW, (r + h - 1) * CH - 8, w * CW, 2, P.plasmaDim);
  s.text(c, r + h - 1, fit(`> ${b.status.toUpperCase()}`, w), P.plasma);
  playMoth(s, P, f.pointer, { x: (c + w - 30) * CW, y: (sceneR + 2) * CH }, t);
}
