/**
 * The About record's backdrops: one small place for each track on the tape,
 * drawn behind the subject as he walks. Each is taken from its own track's
 * title, place and line, and nothing else; labels and things in them are the
 * things the track names (the house of thirty, tea and critiques, the uncle's
 * ERP and the biryani, the posters and the first pay, the college, the crew's
 * stage, the lockdown phone, the board, the HR game, Square Bridge, the HP
 * printer, the Spera desk, the mountains and the ukulele).
 *
 * Drawn in blocks of `p` pixels on a grid 64 blocks wide, standing on
 * `ground`, in the tube's four shades and its one warm light. They move only in
 * steps, and only in small ways: a window lights, steam rises, a bug crawls.
 * At `t` 0 (reduced motion) each holds still.
 */

import { iconRows } from "@/components/modules/work-os/control-room/pixel-icons";
import type { Surface } from "@/components/modules/work-os/control-room/surface";
import type { Pal } from "@/components/modules/work-os/control-room/views";

/** How many blocks wide and tall a backdrop is drawn on. */
export const BACKDROP = { w: 64, h: 36 };

const beat = (t: number, fps: number) => Math.floor(t * fps);
const rnd = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const tri = (v: number) => {
  const k = ((v % 2) + 2) % 2;
  return k < 1 ? k : 2 - k;
};

const HEART = [".#.#.", "#####", ".###.", "..#.."];
const STAR = ["..#..", "#####", ".###.", ".#.#."];
const NOTE = [".##", ".#.", ".#.", "##."];

/**
 * Draw track `id`'s place, centred in `w` from `x`, its foot on `ground`.
 * `p` is the size of one block, in surface pixels.
 */
export function backdrop(s: Surface, id: string, x: number, ground: number, w: number, p: number, P: Pal, t: number) {
  const ox = x + Math.round((w - BACKDROP.w * p) / 4) * 2;
  /** A block, `j` blocks up from the ground. */
  const b = (i: number, j: number, bw: number, bh: number, c: string) => s.px(ox + i * p, ground - (j + bh) * p, bw * p, bh * p, c);
  const o = (i: number, j: number, bw: number, bh: number, c: string) => {
    b(i, j, bw, 1, c);
    b(i, j + bh - 1, bw, 1, c);
    b(i, j, 1, bh, c);
    b(i + bw - 1, j, 1, bh, c);
  };
  /** A one-bit picture whose top row sits `top` blocks up. */
  const bm = (i: number, top: number, rows: readonly string[], c: string) =>
    rows.forEach((row, r) => {
      for (let k = 0; k < row.length; k += 1) if (row[k] === "#") b(i + k, top - r, 1, 1, c);
    });
  /** Steam or smoke: a few blocks rising from (i, j) and fading. */
  const steam = (i: number, j: number, seed: number, c: string) => {
    if (t === 0) return;
    for (let k = 0; k < 3; k += 1) {
      const ph = (beat(t, 4) + seed + k * 2) % 7;
      b(i + ((ph + k) % 2), j + ph, 1, 1, ph < 4 ? c : P.faint);
    }
  };
  const f = beat(t, 4);

  switch (id) {
    case "salem": {
      // a long house of two floors, a window for nearly everyone in it, and someone always at one
      b(4, 0, 50, 16, P.ghost);
      o(4, 0, 50, 16, P.faint);
      for (let k = 0; k < 5; k += 1) b(2 + k * 3, 16 + k * 2, 54 - k * 6, 2, k ? P.faint : P.dim);
      for (let r = 0; r < 2; r += 1) {
        for (let c = 0; c < 7; c += 1) {
          if (r === 0 && c === 3) continue;
          const n = r * 7 + c;
          const lit = (beat(t, 1.2) + Math.floor(rnd(n) * 11)) % 6 !== 0;
          b(7 + c * 7, 3 + r * 7, 4, 4, n === 9 ? P.plasma : lit ? P.dim : "#000");
          if (lit && (n + beat(t, 0.7)) % 5 === 0) b(8 + c * 7, 3 + r * 7, 2, 2, P.phos);
        }
      }
      b(27, 0, 4, 7, "#000");
      o(26, 0, 6, 8, P.dim);
      // a coconut palm beside it
      b(59, 0, 1, 20, P.faint);
      b(58, 20, 1, 2, P.faint);
      b(54, 22, 10, 1, P.dim);
      b(55, 23, 3, 1, P.dim);
      b(61, 23, 2, 1, P.dim);
      b(54 - (f % 2), 21, 2, 1, P.dim);
      break;
    }
    case "family-studio": {
      // an easel, its painting filling in a stroke at a time
      b(6, 0, 1, 18, P.faint);
      b(17, 0, 1, 18, P.faint);
      b(11, 0, 1, 12, P.faint);
      b(4, 10, 16, 13, P.ghost);
      o(4, 10, 16, 13, P.dim);
      const strokes = t === 0 ? 5 : beat(t, 1) % 7;
      if (strokes > 0) b(13, 17, 3, 3, P.plasma);
      if (strokes > 1) b(6, 12, 12, 2, P.faint);
      if (strokes > 2) b(7, 14, 5, 2, P.faint);
      if (strokes > 3) b(9, 16, 2, 3, P.dim);
      if (strokes > 4) b(6, 18, 3, 1, P.dim);
      // the table, two glasses of tea, and the critique going round
      b(24, 8, 22, 2, P.dim);
      b(26, 0, 1, 8, P.faint);
      b(43, 0, 1, 8, P.faint);
      b(28, 10, 3, 4, P.faint);
      b(28, 13, 3, 1, P.dim);
      b(38, 10, 3, 4, P.faint);
      b(38, 13, 3, 1, P.dim);
      steam(29, 15, 0, P.dim);
      steam(39, 15, 3, P.dim);
      o(31, 20, 9, 6, P.dim);
      b(32, 19, 2, 1, P.dim);
      const dots = t === 0 ? 3 : beat(t, 3) % 4;
      for (let m = 0; m < dots; m += 1) b(33 + m * 2, 22, 1, 2, P.phos);
      // the yarn, and the hook in it
      b(51, 0, 6, 1, P.faint);
      b(50, 1, 8, 5, P.faint);
      b(51, 6, 6, 1, P.faint);
      b(51, 2, 6, 1, P.dim);
      b(52, 4, 4, 1, P.dim);
      b(58, 3, 1, 8, P.dim);
      b(57, 10, 1, 1, P.dim);
      b(46, 0, 5, 1, P.ghost);
      break;
    }
    case "biryani-qa": {
      // the uncle's desk, the ERP on its screen, and the bug being found
      b(4, 10, 34, 2, P.dim);
      b(6, 0, 1, 10, P.faint);
      b(35, 0, 1, 10, P.faint);
      b(15, 12, 6, 1, P.faint);
      b(10, 13, 16, 12, P.faint);
      b(11, 14, 14, 10, "#000");
      for (let r = 0; r < 4; r += 1) b(12, 16 + r * 2, 10 - (r % 2) * 3, 1, P.dim);
      const crawl = t === 0 ? 4 : beat(t, 3);
      b(12 + (crawl % 11), 16 + (Math.floor(crawl / 11) % 4) * 2 + 1, 1, 1, P.plasma);
      // the notebook, more sketch than notes
      b(28, 12, 8, 1, P.faint);
      b(28, 13, 8, 4, P.ghost);
      b(29, 14, 3, 2, P.dim);
      b(33, 15, 2, 1, P.faint);
      // and the pay: a pot of biryani on its stool
      b(44, 0, 1, 8, P.faint);
      b(53, 0, 1, 8, P.faint);
      b(43, 8, 11, 1, P.dim);
      b(44, 9, 9, 6, P.faint);
      b(43, 15, 11, 1, P.dim);
      b(45, 16, 7, 1, P.dim);
      b(47, 17, 3, 1, P.dim);
      steam(46, 19, 0, P.plasma);
      steam(49, 19, 4, P.plasma);
      break;
    }
    case "first-paycheck": {
      // the posters, pinned up
      [
        [3, 10, 10, 14],
        [16, 13, 10, 12],
        [29, 9, 10, 15],
      ].forEach(([i, j, pw, ph], k) => {
        b(i, j, pw, ph, P.ghost);
        o(i, j, pw, ph, P.dim);
        b(i + 4, j + ph - 1, 2, 1, P.plasma);
        if (k === 0) {
          b(i + 2, j + 6, 6, 6, P.faint);
          b(i + 3, j + 2, 4, 1, P.dim);
        } else if (k === 1) {
          b(i + 3, j + 5, 4, 4, P.faint);
          b(i + 2, j + 2, 6, 1, P.dim);
          b(i + 2, j + 3, 3, 1, P.dim);
        } else {
          b(i + 2, j + 3, 6, 1, P.faint);
          b(i + 2, j + 5, 6, 1, P.faint);
          b(i + 2, j + 8, 3, 4, P.dim);
          b(i + 5, j + 10, 3, 2, P.faint);
        }
      });
      // the screen the clients were on, and the first pay coming out of it, turning
      b(44, 0, 16, 1, P.dim);
      b(46, 1, 12, 8, P.ghost);
      o(46, 1, 12, 8, P.faint);
      b(48, 5, 6, 1, P.faint);
      b(48, 3, 4, 1, P.faint);
      const spin = [8, 6, 2, 6][t === 0 ? 0 : beat(t, 4) % 4];
      const rise = t === 0 ? 4 : beat(t, 2) % 6;
      b(52 - spin / 2, 11 + rise, spin, 8, P.plasma);
      if (spin > 2) b(52 - 1, 13 + rise, 2, 4, "#000");
      break;
    }
    case "sona": {
      // the college: steps, columns, the pediment, a flag
      b(0, 0, 44, 1, P.dim);
      b(2, 1, 40, 1, P.dim);
      b(3, 2, 38, 16, P.ghost);
      for (let k = 0; k < 6; k += 1) b(5 + k * 7, 2, 2, 15, P.faint);
      b(20, 2, 4, 9, "#000");
      b(1, 18, 42, 2, P.faint);
      b(5, 20, 34, 2, P.faint);
      b(11, 22, 22, 2, P.faint);
      b(17, 24, 10, 1, P.dim);
      b(48, 0, 1, 30, P.dim);
      if (f % 2) {
        b(49, 26, 6, 3, P.plasma);
      } else {
        b(49, 27, 6, 2, P.plasma);
        b(52, 26, 3, 1, P.plasma);
      }
      // the code lab by day, the sketchbook by night
      b(52, 0, 11, 1, P.dim);
      b(53, 1, 9, 7, P.ghost);
      o(53, 1, 9, 7, P.faint);
      b(55, 5, 4, 1, P.dim);
      b(55, 3, 3, 1, P.dim);
      if (f % 2 === 0) b(59, 3, 1, 1, P.phos);
      b(53, 8, 9, 5, P.ghost);
      o(53, 8, 9, 5, P.faint);
      b(56, 10, 3, 1, P.dim);
      break;
    }
    case "campus-lead": {
      // the crew's stage, its curtains and two lights looking for them
      b(4, 0, 48, 4, P.faint);
      b(4, 4, 48, 1, P.dim);
      b(4, 5, 5, 25, P.ghost);
      b(47, 5, 5, 25, P.ghost);
      b(4, 29, 48, 3, P.faint);
      o(18, 21, 20, 5, P.dim);
      for (let k = 0; k < 6; k += 1) b(20 + k * 3, 23, 2, 1, P.faint);
      [10, 46].forEach((sx, k) => {
        const to = 14 + tri((t === 0 ? 0.5 : t * 0.35) + k * 0.8) * 28;
        for (let j = 5; j < 28; j += 2) b(Math.round(sx + ((to - sx) * (28 - j)) / 23), j, 2, 1, P.faint);
        b(sx - 1, 28, 3, 2, P.dim);
      });
      for (let k = 0; k < 3; k += 1) {
        const hop = t > 0 && (beat(t, 3) + k) % 4 === 0 ? 1 : 0;
        b(21 + k * 6, 5 + hop, 2, 4, P.dim);
        b(21 + k * 6, 9 + hop, 2, 2, P.phos);
      }
      // the site they redid, and the medical app, on a screen to one side
      b(56, 0, 1, 10, P.faint);
      b(54, 10, 9, 8, P.ghost);
      o(54, 10, 9, 8, P.faint);
      b(58, 12, 1, 4, P.plasma);
      b(57, 13, 3, 2, P.plasma);
      break;
    }
    case "playlab": {
      // the room in lockdown: a window onto the night
      b(6, 10, 16, 14, P.ghost);
      o(6, 10, 16, 14, P.dim);
      b(13, 10, 1, 14, P.dim);
      b(6, 16, 16, 1, P.dim);
      for (let k = 0; k < 4; k += 1) if (t === 0 || (beat(t, 2) + k) % 5) b(8 + k * 3 + (k % 2) * 6, 18 + (k % 3) * 2, 1, 1, P.faint);
      b(18, 20, 2, 2, P.plasma);
      // two of them on the floor, heads down over one game
      b(26, 0, 30, 3, P.faint);
      [33, 45].forEach((i, k) => {
        b(i, 3, 5, 5, P.ghost);
        b(i + 1, 8, 3, 3, P.dim);
        b(i + (k ? -1 : 5), 5, 1, 1, P.dim);
      });
      // the phone with the game on it, and the store it went to
      o(37, 13, 8, 12, P.dim);
      b(38, 14, 6, 10, "#000");
      b(40, 17, 1, 5, P.plasma);
      b(41, 18, 1, 3, P.plasma);
      b(42, 19, 1, 1, P.plasma);
      const ball = t === 0 ? 1 : beat(t, 5) % 8;
      b(39 + (ball < 4 ? ball : 8 - ball), 23 - (ball % 2), 1, 1, P.phos);
      b(52, 12, 8, 4, P.faint);
      b(51, 13, 10, 2, P.faint);
      b(53, 13, 1, 2, "#000");
      b(57, 14, 1, 1, P.plasma);
      break;
    }
    case "systems-teaching": {
      // the board, the system on it one part at a time, and the room
      b(6, 10, 44, 22, P.ghost);
      o(6, 10, 44, 22, P.faint);
      b(6, 9, 44, 1, P.dim);
      const parts = t === 0 ? 12 : beat(t, 2) % 15;
      for (let k = 0; k < 12; k += 1) {
        const col = k % 4;
        const row = Math.floor(k / 4);
        if (k < parts) o(9 + col * 10, 24 - row * 6, 8, 4, k === parts - 1 && t > 0 ? P.phos : P.dim);
      }
      for (let row = 0; row < 2; row += 1) {
        for (let c = 0; c < 12; c += 1) {
          const n = row * 12 + c;
          b(4 + c * 5 + row * 2, row * 4, 3, 3, row ? P.ghost : P.faint);
          if (t > 0 && (beat(t, 1) + n * 7) % 23 === 0) b(5 + c * 5 + row * 2, row * 4 + 3, 1, 3, P.dim);
        }
      }
      b(54, 12, 1, 1, P.phos);
      break;
    }
    case "peoplegamez": {
      // HR on a laptop, turned into a game: a form, and its experience bar filling
      b(4, 0, 26, 1, P.dim);
      b(6, 1, 22, 15, P.ghost);
      o(6, 1, 22, 15, P.dim);
      b(9, 12, 12, 1, P.faint);
      b(9, 9, 16, 1, P.faint);
      o(9, 4, 16, 3, P.faint);
      b(10, 5, t === 0 ? 9 : 1 + (beat(t, 3) % 14), 1, P.plasma);
      // and around it, the assets it was played with
      const bob = (k: number) => (t === 0 ? 0 : (beat(t, 2) + k) % 2);
      bm(34, 24 + bob(0), STAR, P.phos);
      bm(54, 26 + bob(1), HEART, P.plasma);
      b(46, 15 + bob(2), 4, 4, P.dim);
      b(47, 16 + bob(2), 2, 2, "#000");
      b(38, 6, 8, 4, P.dim);
      b(39, 4, 6, 2, P.dim);
      b(37, 8, 1, 2, P.dim);
      b(46, 8, 1, 2, P.dim);
      b(41, 2, 2, 2, P.faint);
      b(39, 0, 6, 2, P.faint);
      b(41, 7, 2, 2, P.plasma);
      break;
    }
    case "square-bridge": {
      // Square Bridge: a bridge of squares, and the three on it
      b(2, 12, 60, 2, P.dim);
      for (let k = 0; k <= 14; k += 1) {
        const i = 3 + Math.round(k * 4);
        const j = Math.round(Math.sin((Math.PI * k) / 14) * 9);
        b(i, j, 2, 2, P.faint);
        if (j + 2 < 12) b(i, j + 2, 1, 12 - j - 2, P.ghost);
      }
      for (let k = 0; k < 3; k += 1) {
        const step = t === 0 ? 0 : beat(t, 2) % 2;
        b(22 + k * 5, 14, 2, 3, P.dim);
        b(22 + k * 5, 17 + ((k + step) % 2), 2, 2, k === 0 ? P.plasma : P.phos);
      }
      // the screens they made, stacking up on the far bank
      const pile = t === 0 ? 5 : 2 + (beat(t, 1) % 5);
      for (let k = 0; k < pile; k += 1) o(48 + (k % 2), 14 + k * 3, 10, 3, k === pile - 1 ? P.phos : P.faint);
      break;
    }
    case "hp": {
      // the office tower in Bengaluru, its windows lit at all hours
      b(4, 0, 22, 34, P.ghost);
      o(4, 0, 22, 34, P.faint);
      for (let r = 0; r < 7; r += 1) {
        for (let c = 0; c < 4; c += 1) {
          const lit = (beat(t, 1) + Math.floor(rnd(r * 4 + c) * 9)) % 5 !== 0;
          b(7 + c * 5, 4 + r * 4, 3, 2, lit ? P.faint : "#000");
        }
      }
      b(13, 0, 4, 3, "#000");
      // the printer, the page coming out, and its spark
      b(32, 0, 1, 7, P.faint);
      b(58, 0, 1, 7, P.faint);
      b(30, 7, 30, 1, P.dim);
      const top = 20;
      s.bitmap(ox + 36 * p, ground - (top + 1) * p, iconRows("hp-print-ai"), p, P.dim);
      const out = t === 0 ? 3 : beat(t, 3) % 7;
      if (out) b(41, top + 1, 6, out, P.phos);
      if (t === 0 || f % 3) {
        b(51, top - 1, 1, 1, P.plasma);
        b(50, top - 2, 3, 1, P.plasma);
        b(51, top - 3, 1, 1, P.plasma);
      }
      break;
    }
    case "spera": {
      // the startup desk: one screen for the design, one for the frontend, a mug
      b(8, 12, 44, 2, P.dim);
      b(10, 0, 1, 12, P.faint);
      b(49, 0, 1, 12, P.faint);
      b(22, 14, 2, 2, P.faint);
      b(14, 16, 18, 12, P.ghost);
      o(14, 16, 18, 12, P.dim);
      b(16, 24, 3, 2, P.plasma);
      b(20, 24, 3, 2, P.faint);
      b(24, 24, 3, 2, P.dim);
      b(16, 21, 10, 1, P.faint);
      b(18, 19, 8, 1, P.faint);
      if (t === 0 || f % 2) b(27, 19, 1, 1, P.phos);
      b(35, 14, 13, 1, P.dim);
      b(36, 15, 11, 7, P.ghost);
      o(36, 15, 11, 7, P.faint);
      b(38, 19, 2, 1, P.dim);
      b(41, 19, 1, 1, P.dim);
      b(43, 19, 2, 1, P.dim);
      b(10, 14, 3, 3, P.faint);
      b(13, 15, 1, 1, P.faint);
      steam(11, 18, 2, P.dim);
      // the company's mark on the wall, and a plant that is still alive
      s.bitmap(ox + 50 * p, ground - 33 * p, iconRows("spera-platform"), p, P.faint);
      b(55, 0, 6, 4, P.faint);
      b(56, 4, 1, 4, P.dim);
      b(58, 4, 1, 6 + (t === 0 ? 0 : beat(t, 0.5) % 2), P.dim);
      b(60, 4, 1, 3, P.dim);
      break;
    }
    case "off-hours": {
      // the mountains, and the light over them
      for (let j = 0; j < 22; j += 1) {
        const half = 22 - j;
        b(26 - half, j, half * 2, 1, j > 16 ? P.dim : P.ghost);
      }
      for (let j = 0; j < 14; j += 1) {
        const half = 14 - j;
        b(46 - half, j, half * 2, 1, j > 10 ? P.dim : P.faint);
      }
      for (let k = 0; k < 3; k += 1) b(53 + k, 27 - k, 4 - k, 1, P.plasma);
      b(53, 28, 4, 1, P.plasma);
      b(54, 29, 2, 1, P.plasma);
      // two birds going over
      const fly = t === 0 ? 10 : beat(t, 3) % 64;
      [0, 6].forEach((d) => {
        const bx = (fly + d) % 64;
        const up = (beat(t, 6) + d) % 2;
        b(bx, 30 + up, 1, 1, P.faint);
        b(bx + 1, 29 + up, 1, 1, P.faint);
        b(bx + 2, 30 + up, 1, 1, P.faint);
      });
      // the ukulele, a note coming off it, and the weirdest thing on the menu
      b(4, 0, 6, 4, P.dim);
      b(5, 4, 4, 3, P.dim);
      b(6, 2, 2, 1, "#000");
      b(7, 7, 1, 9, P.faint);
      b(6, 16, 3, 2, P.dim);
      if (t > 0) {
        const n = beat(t, 3) % 8;
        bm(10 + Math.floor(n / 3), 12 + n, NOTE, n < 5 ? P.phos : P.faint);
      }
      b(52, 0, 10, 1, P.dim);
      b(54, 1, 6, 2, P.plasma);
      b(55 + (t === 0 ? 0 : beat(t, 5) % 2), 3, 1, 2, P.plasma);
      b(58, 3, 1, 1, P.plasma);
      break;
    }
    default:
      b(24, 0, 16, 16, P.ghost);
  }
}

/** The tracks that happen among buildings; the rest have hills behind them. */
const CITY = new Set(["systems-teaching", "peoplegamez", "square-bridge", "hp", "spera"]);
/** The tracks seen at night. */
const NIGHT = new Set(["playlab"]);

/**
 * What lies behind a track's place: its sky (clouds, or stars at night) and a
 * far line of hills or rooftops in checkerboard. Both move slower than the tape
 * as he walks (`pos`, in pixels of tape), so the window has depth: tape fast,
 * place still, far line slow, sky slower.
 */
export function distance(s: Surface, id: string, x: number, top: number, ground: number, w: number, p: number, P: Pal, t: number, pos: number) {
  const tall = ground - top;
  if (NIGHT.has(id)) {
    for (let i = 0; i < 18; i += 1) {
      if (t > 0 && (beat(t, 2) + Math.floor(rnd(i) * 7)) % 6 === 0) continue;
      const sx = x + ((((rnd(i * 3 + 1) * w - pos * 0.08) % w) + w) % w);
      s.px(Math.round(sx / 2) * 2, Math.round((top + 6 + rnd(i * 3 + 2) * tall * 0.55) / 2) * 2, 2, 2, i % 3 ? P.faint : P.dim);
    }
  } else {
    for (let k = 0; k < 3; k += 1) {
      const span = w + 16 * p;
      const cx = x - 8 * p + ((((k * span) / 3 + rnd(k) * 40 - pos * 0.12 - t * 3) % span) + span) % span;
      const cy = top + 8 + k * 5 * p + Math.round(rnd(k + 9) * 3) * p;
      const sx = Math.round(cx / 2) * 2;
      s.px(sx + p * 2, cy, p * 4, p, P.ghost);
      s.px(sx, cy + p, p * 8, p, P.ghost);
      if (k !== 1) s.px(sx + p * 5, cy - p, p * 2, p, P.ghost);
    }
  }
  const city = CITY.has(id);
  const run = pos * 0.3;
  const step = Math.floor(run / p);
  const frac = run - step * p;
  for (let col = -1; col * p < w + p; col += 1) {
    const wi = col + step;
    const px = x + col * p - Math.round(frac);
    let h: number;
    let lit = false;
    if (city) {
      const bi = Math.floor(wi / 7);
      h = rnd(bi * 3 + 1) > 0.8 ? 2 : 6 + Math.floor(rnd(bi) * 12);
      lit = h > 2 && (((wi % 7) + 7) % 7 === 2 || ((wi % 7) + 7) % 7 === 4);
    } else h = Math.round(6 + 3 * Math.sin(wi * 0.11) + 2 * Math.sin(wi * 0.37 + 1));
    for (let j = 0; j < h; j += 1) {
      const y = ground - (j + 1) * p;
      if (lit && j % 3 === 1 && j < h - 1 && rnd(wi * 13 + j) > 0.45) s.px(px, y, p, p, P.faint);
      else if ((wi + j) % 2 === 0) s.px(px, y, p, p, P.ghost);
    }
  }
}
