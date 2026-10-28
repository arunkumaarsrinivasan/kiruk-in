// The lid margins' twin against the eye's own rules and the benchmark photo.
// Run: npm run test:eye. A `todo` is a known gap with the phase that closes it.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FISSURE_MM,
  LAKE_B,
  MARGIN_RADIUS,
  azimuthOf,
  lidState,
  marginPoint,
  marginsAt,
  projectedSide,
  sideOf,
} from "./margins";

const mm = (rad: number) => MARGIN_RADIUS * Math.sin(rad);
const span = (n: number) => Array.from({ length: n }, (_, i) => -1 + (2 * i) / (n - 1));
const rest = lidState({ tiltDeg: 2 });

/** The opening at rest: its apexes (mm above and below the globe's centre) and its corners' projected x. */
function opening(L = rest) {
  let up = -Infinity;
  let lo = Infinity;
  for (const s of span(401)) {
    const m = marginsAt(s, L);
    up = Math.max(up, mm(m.up));
    lo = Math.min(lo, mm(m.lo));
  }
  const corner = (s: number) => {
    const m = marginsAt(s, L);
    return marginPoint(azimuthOf(s, L), (m.up + m.lo) / 2)[0];
  };
  return { up, lo: -lo, height: up - lo, width: corner(1) - corner(-1), medialX: corner(-1), lateralX: corner(1) };
}

test("sideOf inverts azimuthOf", () => {
  for (const s of span(21)) assert.ok(Math.abs(sideOf(azimuthOf(s, rest), rest) - s) < 1e-12);
});

test("the margins never cross, whatever the gaze, squint, blink or fold", () => {
  for (const gx of [-1, -0.5, 0, 0.5, 1])
    for (const gy of [-1, -0.5, 0, 0.5, 1])
      for (const squint of [0, 0.6, 1])
        for (const epicanthus of [0, 0.6])
          for (const blink of [0, 0.5, 1]) {
            const L = lidState({ tiltDeg: 2, squint, epicanthus, gaze: { x: gx, y: gy } });
            for (const s of span(81)) {
              const m = marginsAt(s, L, blink);
              assert.ok(m.up >= m.lo + 0.004 - 1e-12, `crossed at s=${s} gaze=(${gx},${gy}) squint=${squint} blink=${blink}`);
            }
          }
});

test("a full blink closes the whole opening to a seam (under 0.2 mm)", () => {
  for (const s of span(81)) {
    const m = marginsAt(s, rest, 1);
    assert.ok((m.up - m.lo) * MARGIN_RADIUS < 0.2, `open ${((m.up - m.lo) * MARGIN_RADIUS).toFixed(3)} mm at s=${s}`);
  }
});

test("the apexes stand where the benchmark photo puts them (upper 4.4, lower 5.5 mm, ±0.35)", () => {
  const o = opening();
  assert.ok(Math.abs(o.up - FISSURE_MM.upper) < 0.35, `upper apex ${o.up.toFixed(2)} mm`);
  assert.ok(Math.abs(o.lo - FISSURE_MM.lower) < 0.35, `lower apex ${o.lo.toFixed(2)} mm`);
});

test("the opening is an almond about 9.9 mm tall (±0.6)", () => {
  const o = opening();
  assert.ok(Math.abs(o.height - 9.9) < 0.6, `height ${o.height.toFixed(2)} mm`);
  assert.ok(o.width / o.height > 2.2 && o.width / o.height < 2.9, `width/height ${(o.width / o.height).toFixed(2)}`);
});

test(
  "the opening is 26 mm wide, medial corner 14 mm from the globe's axis (benchmark photo)",
  { todo: "R6: FISSURE_MM.medial (14) exceeds MARGIN_RADIUS (13.1), so asin clamps at 0.99 and the corner lands ~13 mm out" },
  () => {
    const o = opening();
    assert.ok(Math.abs(-o.medialX - FISSURE_MM.medial) < 0.3, `medial corner at ${(-o.medialX).toFixed(2)} mm`);
    assert.ok(Math.abs(o.width - 26) < 0.5, `width ${o.width.toFixed(2)} mm`);
  },
);

test("the inner corner sits lower than the outer one (canthal tilt, the lake)", () => {
  const mid = (s: number) => {
    const m = marginsAt(s, rest);
    return (m.up + m.lo) / 2;
  };
  assert.ok(mid(-0.95) < mid(0.95));
});

test("the tear lake closes the inner corner round, under a millimetre and a half tall where it starts (R6)", () => {
  // the lake starts where the projected side passes −LAKE_B. (It was ~2 mm:
  // a tall blunt end; the user's inner corner is a tight angle.)
  let s = -1;
  for (const q of span(2001)) if (q < 0 && projectedSide(q, rest) <= -LAKE_B) s = q;
  const m = marginsAt(s, rest);
  const tall = (m.up - m.lo) * MARGIN_RADIUS;
  assert.ok(tall > 0.6 && tall < 1.4, `lake ${tall.toFixed(2)} mm tall at s=${s.toFixed(3)}`);
});

test("the inner corner is low and tight, as in the user's eye (R6: photo 4)", () => {
  const at = (s: number) => {
    const m = marginsAt(s, rest);
    const phi = azimuthOf(s, rest);
    return { x: marginPoint(phi, m.up)[0], up: mm(m.up), lo: mm(m.lo) };
  };
  const tip = at(-1);
  // the canthus ~3 mm under the globe's centre (photos: 2.9–3.4 under the iris's)
  assert.ok(Math.abs(tip.up + FISSURE_MM.canthus) < 0.15, `canthus at ${tip.up.toFixed(2)} mm`);
  // how far apart the lids are, d mm across the shot from the canthus
  const open = (d: number) => {
    let best = at(-1);
    for (const s of span(4001)) {
      if (s > 0) break;
      const p = at(s);
      if (p.x - tip.x <= d) best = p;
    }
    return best.up - best.lo;
  };
  for (const [d, lo, hi] of [
    [1, 0.5, 1.3],
    [2, 1.2, 2.3],
    [4, 3.2, 4.8],
  ] as const) {
    const o = open(d);
    assert.ok(o > lo && o < hi, `${o.toFixed(2)} mm open ${d} mm from the canthus`);
  }
  // nasally the lower lid stays near the canthus's height while the upper rises
  const p = at(-0.75);
  assert.ok(p.lo - tip.lo > -0.6, `lower lid ${(p.lo - tip.lo).toFixed(2)} mm under the canthus at s=−0.75`);
});

test("the upper lid follows the gaze (0.85 up, 0.7 down), the lower a little (0.35)", () => {
  const at = (gy: number) => marginsAt(0, lidState({ tiltDeg: 2, gaze: { x: 0, y: gy } }));
  const up = at(1);
  const mid = at(0);
  const down = at(-1);
  const pitch = lidState({ gaze: { x: 0, y: 1 } }).pitch;
  assert.ok(Math.abs(up.up - mid.up - 0.85 * pitch) < 1e-9);
  assert.ok(Math.abs(mid.up - down.up - 0.7 * pitch) < 1e-9);
  const bowL = (up.lo - mid.lo) / (0.35 * pitch);
  assert.ok(bowL > 0.95 && bowL <= 1, `lower lid follow ${bowL.toFixed(3)}`);
});
