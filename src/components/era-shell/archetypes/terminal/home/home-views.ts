/**
 * What is on the home's tube. It is the same tube as the work (the screen is
 * drawn in cells, the tube shows it), and two screens share one head and one
 * status line, as they do there:
 *
 *   the board     who the subject is, the seven records of the research file
 *                 as cells, a dossier for the one pointed at, and the ways out
 *   a record      one record of the file as its own piece of 1970s interface
 *                 (home-scenes.ts), with the other records one press away
 *
 * Each screen is laid out in cells from the room it is given, so the same
 * drawing serves a wide desk tube and a phone held upright.
 */

import type { Depth } from "@/data/about-story";
import { WORK_SHOW } from "@/data/work-show";
import { CH, CW, fit, wrap, type Surface } from "@/components/modules/work-os/control-room/surface";
import {
  configPanel,
  fact,
  linkKey,
  palette,
  statusLine,
  type Area,
  type Pal,
  type TubeColor,
  type TubeConfig,
} from "@/components/modules/work-os/control-room/views";
import { CELLS, LINKS, RECORDS, SUBJECT, type HomeLink, type HomeRecord } from "./home-model";
import { FIGURE, playMini, playMoth, playScene, standFigure } from "./home-scenes";

export interface HomeState {
  open: HomeRecord | null;
  /** The cell the pointer or the keys are on: a record's id, or "work". */
  on: string | null;
  scroll: number;
  /** The open record's chosen item: a round, a moment, a ledge, a card. */
  pick: number;
  /** The About record: the track list, or how much of the liner notes. */
  depth: Depth;
  /** The Card sort record: the column the cards are sorted on. */
  tax: string;
  tube: TubeColor;
  config: TubeConfig;
  configOpen: boolean;
  /** The zone under the pointer, and the pointer itself in surface pixels. */
  hover: string | null;
  pointer: { x: number; y: number } | null;
  time: number;
  /** Seconds since the tube began to warm up: the board's cells come on one after another. */
  age: number;
  clock: string;
  /** When the file was opened, as the old header stamped it. */
  stamp: string;
  status: string;
  /** The cells the lids and the corners leave in view. */
  safe: Area;
}

export interface HomeDrawn {
  maxScroll: number;
  /** Columns of cells on the board, for the arrow keys. */
  cols: number;
  /** How many items the open record's scene has, for the step keys. */
  count: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const even = (v: number) => Math.round(v / 2) * 2;

/* ── small parts ── */

function head(s: Surface, v: HomeState, P: Pal, a: Area) {
  const { c, r, w } = a;
  const narrow = w < 56;
  let x = s.plate(c, r, narrow ? "KIRUK" : "KIRUK STATION", P.ink, P.phos);
  if (!narrow) x = s.text(x + 1, r, "HOME", P.phos);

  let right = c + w - v.clock.length;
  s.text(right, r, v.clock, P.plasma);
  if (w >= 92) {
    const count = `RESEARCH FILE · ${RECORDS.length} RECORDS`;
    right -= count.length + 2;
    s.text(right, r, count, P.phos);
  }
  const label = "DISPLAY";
  right -= label.length + 4;
  s.key("tube", right, r, label, P.phos, P.ink, v.hover === "tube");

  const x0 = (x + 1) * CW;
  const x1 = (right - 1) * CW;
  if (x1 - x0 > 30) {
    s.px(x0, r * CH + 2, x1 - x0, 2, P.faint);
    s.hatch(x0, r * CH + 6, x1 - x0, 8, P.dim);
    s.px(x0, r * CH + 16, x1 - x0, 2, P.faint);
  }
}

/* ── the board ── */

/** How the ways out break into rows of keys `w` cells wide. */
function linkRows(w: number): HomeLink[][] {
  const rows: HomeLink[][] = [[]];
  let used = 0;
  for (const l of LINKS) {
    const need = l.label.length + (l.href ? 4 : 2) + 1;
    if (used + need > w + 1 && rows[rows.length - 1].length) {
      rows.push([]);
      used = 0;
    }
    rows[rows.length - 1].push(l);
    used += need;
  }
  return rows;
}

function links(s: Surface, v: HomeState, P: Pal, c: number, r: number, w: number): number {
  const rows = linkRows(w);
  rows.forEach((row, i) => {
    let x = c;
    for (const l of row) {
      const id = `go:${l.id}`;
      const label = l.label.toUpperCase();
      x = (l.href ? linkKey(s, id, x, r + i, label, P.plasma, P.ink, v.hover === id) : s.key(id, x, r + i, label, P.phos, P.ink, v.hover === id)) + 1;
    }
  });
  return rows.length;
}

/** Who the file is about, and the ways out of it. */
function subject(s: Surface, v: HomeState, P: Pal, a: Area) {
  const { c, r, w, h } = a;
  s.box(c, r, w, h, P.faint, P.dim, "SUBJECT", P.ink);
  const x = c + 3;
  const iw = w - 6;
  let row = r + 2;

  s.plate(x - 1, row, fit(SUBJECT.preTitle, iw - 1), P.ink, P.plasma);
  row += 2;
  const nameW = Math.max(...SUBJECT.nameLines.map((l) => l.length)) * 2;
  const big = iw >= nameW;
  const nameRow = row;
  for (const line of SUBJECT.nameLines) {
    s.text(x, row, line.toUpperCase(), P.phos, big ? 2 : 1);
    row += big ? 2 : 1;
  }
  // the file's figure stands by the name and waves
  if (big && iw >= nameW + 8 && SUBJECT.nameLines.length > 1) {
    const p = 6;
    standFigure(s, (x + iw) * CW - p * FIGURE.w - 4, (nameRow + 4) * CH - p * FIGURE.h - 6, p, P, v.time, v.pointer);
  }
  row += 1;
  for (const line of wrap(SUBJECT.role.toUpperCase(), iw)) {
    s.text(x, row, line, P.phos);
    row += 1;
  }
  s.text(x, row, fit(SUBJECT.place.toUpperCase(), iw), P.dim);
  row += 1;

  // the ways out sit at the foot of the pane
  const keyRows = linkRows(iw).length;
  const keysTop = r + h - 1 - keyRows;
  s.text(x, keysTop - 1, "GO TO", P.dim);
  s.rule(x + 6, keysTop - 1, iw - 6, P.faint);
  links(s, v, P, x, keysTop, iw);

  // between: the framing, and the file's own header if there is room for it
  s.rule(x, row, iw, P.faint);
  row += 1;
  const room = keysTop - 2 - row;
  const framing = wrap(SUBJECT.framing, iw);
  const facts: [string, string][] = [
    ["SUBJECT", "ARUN-KS"],
    ["CLASSIFICATION", "PUBLIC"],
    ["SEQUENCE", `0001 / ${String(RECORDS.length).padStart(4, "0")}`],
    ["OPENED", v.stamp],
  ];
  const withFacts = room >= framing.length + 1 + facts.length;
  framing.slice(0, Math.max(0, withFacts ? framing.length : room)).forEach((line) => {
    s.text(x, row, line, P.dim);
    row += 1;
  });
  if (withFacts) {
    row += 1;
    for (const [label, value] of facts) {
      fact(s, P, x, row, iw, label, value);
      row += 1;
    }
  }
}

function cell(s: Surface, v: HomeState, P: Pal, id: string, c: number, r: number, tw: number, th: number) {
  const rec = RECORDS.find((x) => x.id === id);
  const zone = rec ? `rec:${id}` : "go:work";
  const lit = v.hover === zone || v.on === id;
  s.box(c, r, tw, th, lit ? P.phos : P.faint, lit ? P.plasma : P.dim);
  s.text(c + 2, r + 1, rec ? rec.no : "WORK", lit ? P.plasma : P.dim);
  const label = fit((rec ? rec.label : "All work").toUpperCase(), tw - 4);
  if (lit) s.plate(c + 1, r + th - 2, label, P.ink, P.phos);
  else s.text(c + 2, r + th - 2, label, P.phos);
  // the record's own scene, small, playing by itself
  const fh = (th - 4) * CH - 8;
  if (fh >= 24) playMini(id, { s, P, x: (c + 2) * CW, y: (r + 2) * CH + 4, w: (tw - 4) * CW, h: fh, t: v.time, lit });
  s.zone(zone, c, r, tw, th);
}

/** A few lines of whichever record is pointed at; at rest, the first one. */
function dossier(s: Surface, v: HomeState, P: Pal, a: Area) {
  const rec = v.on === "work" ? null : (RECORDS.find((x) => x.id === v.on) ?? RECORDS[0]);
  const title = rec ? `RECORD ${rec.no} · ${rec.label.toUpperCase()}` : "THE WORK STATION";
  s.box(a.c, a.r, a.w, a.h, P.faint, P.phos, fit(title, a.w - 6), P.ink);
  const x = a.c + 3;
  // its scene plays beside its words when there is room
  const mini = a.w >= 60 && a.h >= 7 ? 22 : 0;
  const iw = a.w - 6 - (mini ? mini + 2 : 0);
  const last = a.r + a.h - 2;
  let row = a.r + 2;
  if (mini) {
    playMini(rec ? rec.id : "work", { s, P, x: (a.c + a.w - 3 - mini) * CW, y: (a.r + 2) * CH, w: mini * CW, h: (a.h - 4) * CH, t: v.time, lit: true });
  }
  s.text(x, row, fit((rec ? rec.sub : `${Object.keys(WORK_SHOW).length} projects on one screen`).toUpperCase(), iw), P.plasma);
  row += 1;
  const lines = (rec ? rec.preview : ["Every project, each one opened where it stands."]).flatMap((p) => wrap(p, iw));
  for (const line of lines) {
    if (row >= last) break;
    s.text(x, row, line, P.phos);
    row += 1;
  }
  s.text(x, last, v.on ? "CLICK TO OPEN" : "POINT AT A RECORD", P.dim);
}

/** The records as cells with a dossier under them. Returns the number of columns. */
function records(s: Surface, v: HomeState, P: Pal, a: Area): number {
  const cols = a.w >= 64 ? 4 : a.w >= 46 ? 3 : 2;
  const n = Math.ceil(CELLS.length / cols);
  const tw = Math.floor(a.w / cols);
  const dossierH = clamp(a.h - n * 8, 7, 10);
  const th = clamp(Math.floor((a.h - dossierH) / n), 5, 9);
  CELLS.forEach((id, i) => {
    const cc = a.c + (i % cols) * tw;
    const cr = a.r + Math.floor(i / cols) * th;
    // on arrival the cells come on one after another; until its turn, a cell is only its ghost
    if (v.age < 0.9 + i * 0.13) s.box(cc, cr, tw, th, P.ghost, P.ghost);
    else cell(s, v, P, id, cc, cr, tw, th);
  });
  const top = a.r + n * th;
  dossier(s, v, P, { c: a.c, r: top, w: tw * cols, h: a.r + a.h - top });
  return cols;
}

/** A phone held upright: the subject, the records as a list, the ways out. */
function boardNarrow(s: Surface, v: HomeState, P: Pal, a: Area) {
  const { c, w } = a;
  let row = a.r;
  s.plate(c, row, fit(SUBJECT.preTitle, w - 2), P.ink, P.plasma);
  row += 2;
  const big = w >= Math.max(...SUBJECT.nameLines.map((l) => l.length)) * 2;
  for (const line of SUBJECT.nameLines) {
    s.text(c, row, line.toUpperCase(), P.phos, big ? 2 : 1);
    row += big ? 2 : 1;
  }
  for (const line of wrap(SUBJECT.role.toUpperCase(), w).slice(0, 2)) {
    s.text(c, row, line, P.dim);
    row += 1;
  }
  row += 1;

  const keyRows = linkRows(w).length;
  const keysTop = a.r + a.h - keyRows;
  const step = keysTop - 1 - row >= RECORDS.length * 2 ? 2 : 1;
  for (const rec of RECORDS) {
    const id = `rec:${rec.id}`;
    const lit = v.hover === id || v.on === rec.id;
    if (lit) s.px(c * CW, row * CH + 2, w * CW, CH - 4, P.phos);
    s.text(c + 1, row, rec.no, lit ? P.ink : P.dim);
    s.text(c + 5, row, fit(rec.label.toUpperCase(), w - 6), lit ? P.ink : P.phos);
    if (step === 2) s.text(c + 5, row + 1, fit(rec.sub, w - 6), P.dim);
    s.zone(id, c, row, w, step);
    row += step;
  }
  links(s, v, P, c, keysTop, w);
}

/* ── a record ── */

/** The other records, one press away. */
function recordList(s: Surface, v: HomeState, P: Pal, a: Area) {
  const step = a.h >= RECORDS.length * 2 + 2 ? 2 : 1;
  let row = a.r + 1;
  for (const rec of RECORDS) {
    const id = `mini:${rec.id}`;
    const here = v.open?.id === rec.id;
    const label = fit(`${rec.no} ${rec.label.toUpperCase()}`, a.w - 2);
    if (here) s.plate(a.c, row, label, P.ink, P.plasma);
    else if (v.hover === id) s.plate(a.c, row, label, P.ink, P.phos);
    else s.text(a.c + 1, row, label, P.dim);
    s.zone(id, a.c, row, a.w, 1);
    row += step;
  }
}

function page(s: Surface, v: HomeState, P: Pal, a: Area, rec: HomeRecord): { maxScroll: number; count: number } {
  let x = s.plate(a.c, a.r, `RECORD ${rec.no}`, P.ink, P.plasma);
  x = s.text(x + 1, a.r, rec.label.toUpperCase(), P.phos);
  const pos = `${RECORDS.indexOf(rec) + 1}/${RECORDS.length}`;
  s.text(a.c + a.w - pos.length, a.r, pos, P.dim);
  const room = a.c + a.w - pos.length - 2 - (x + 2);
  if (room > 12) s.text(x + 2, a.r, fit(rec.sub.toUpperCase(), room), P.dim);

  const wide = a.w >= 84;
  const listW = wide ? 24 : 0;
  if (wide) recordList(s, v, P, { c: a.c, r: a.r + 2, w: listW - 2, h: a.h - 2 });

  // the record has the whole pane: each one is its own interface, with its words inside it
  const stage: Area = { c: a.c + listW, r: a.r + 2, w: a.w - listW, h: a.h - 2 };
  const shown = playScene(rec.id, {
    s,
    P,
    x: stage.c * CW,
    y: stage.r * CH,
    w: stage.w * CW,
    h: stage.h * CH,
    a: stage,
    t: v.time,
    hover: v.hover,
    ptr: v.pointer,
    pick: v.pick,
    scroll: v.scroll,
    depth: v.depth,
    tax: v.tax,
  });
  return { maxScroll: shown.maxScroll ?? 0, count: shown.count };
}

export function drawHome(s: Surface, v: HomeState): HomeDrawn {
  s.clear();
  const P = palette(v.tube);
  const { c, r, w, h } = v.safe;
  head(s, v, P, { c, r, w, h: 1 });
  const body: Area = { c, r: r + 2, w, h: h - 4 };
  let maxScroll = 0;
  let cols = 1;
  let count = 1;
  if (v.open) {
    ({ maxScroll, count } = page(s, v, P, body, v.open));
  } else if (w >= 80) {
    const leftW = clamp(Math.round(w * 0.4), 34, 52);
    subject(s, v, P, { c, r: body.r, w: leftW, h: body.h });
    cols = records(s, v, P, { c: c + leftW + 2, r: body.r, w: w - leftW - 2, h: body.h });
  } else {
    boardNarrow(s, v, P, body);
  }
  statusLine(s, { open: v.open, hover: v.hover, status: v.status }, P, { c, r: r + h - 1, w, h: 1 });
  // the moth that lives on this tube: it goes after the pointer, and otherwise keeps by the clock
  if (!v.configOpen) playMoth(s, P, v.pointer, { x: (c + w - 14) * CW, y: (r + 2) * CH }, v.time);
  if (v.configOpen) configPanel(s, v, P, "RETURN TO THE FILE");
  return { maxScroll, cols, count };
}
