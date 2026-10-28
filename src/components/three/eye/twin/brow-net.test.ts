// The brow's move-net never breaks the skin, whatever the face feels.
// Run: npm run test:eye.
import assert from "node:assert/strict";
import { test } from "node:test";
import { BROW_EMOTIONS, BrowRig, type BrowEmotion, type BrowInput } from "../rig/brow";
import { browMoveAt, marginGuard } from "./brow-net";
import { lidState, marginCurves } from "./margins";

const IRIS = { x: 700, y: 450, r: 250 };
const base: BrowInput = {
  dt: 1 / 60,
  now: 0,
  reduce: false,
  calm: false,
  interactive: false,
  present: false,
  mouse: true,
  moveAt: -1e3,
  out: false,
  px: 0,
  py: 0,
  iris: IRIS,
  down: false,
  onIris: false,
  dragged: false,
  travel: null,
  cut: false,
  era: 1970,
  exiting: false,
  gaze: { x: 0, y: 0 },
  saccading: false,
  glare: 0,
  squint: 0,
  blink: 0,
};

/** The chain with these feelings held for 1.5 s (at `k`), and the gaze and squint given (the face at its fullest). */
function chainFor(feel: BrowEmotion[], o: Partial<BrowInput> = {}, k = 1) {
  const rig = new BrowRig();
  for (const e of feel) rig.hold(e, k);
  let out: ArrayLike<number> = rig.out;
  for (let t = 0; t < 1.5; t += 1 / 60) out = rig.update({ ...base, ...o, now: t });
  return Float32Array.from(out);
}

/** The upper margin's height at x (mm), from the twin at rest; far above the corners, the guard is off. */
const upperMargin = (() => {
  const pts = marginCurves(lidState({ tiltDeg: 2 }), 0, 129).upper;
  return (x: number) => {
    if (x <= pts[0][0] || x >= pts[pts.length - 1][0]) return -1e3;
    let i = 1;
    while (pts[i][0] < x) i++;
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  };
})();

/** Where skin at (x, y) is drawn: the move-net, held back near the lid margin as lid-mesh.ts does. */
function moved(x: number, y: number, chain: Float32Array): [number, number] {
  const m = browMoveAt(x, y, chain);
  const g = marginGuard(y - upperMargin(x));
  return [x + m[0] * g, y + m[1] * g];
}

/** The smallest and largest area change of the skin over the brow's region (Jacobian determinant). */
function areaRange(chain: Float32Array) {
  const e = 0.05;
  let lo = Infinity;
  let hi = -Infinity;
  let at = [0, 0];
  for (let x = -24; x <= 22; x += 0.5)
    for (let y = 0; y <= 26; y += 0.5) {
      const [ax, ay] = moved(x + e, y, chain);
      const [bx, by] = moved(x - e, y, chain);
      const [cx, cy] = moved(x, y + e, chain);
      const [dx, dy] = moved(x, y - e, chain);
      const det = (((ax - bx) / (2 * e)) * ((cy - dy) / (2 * e)) - ((ay - by) / (2 * e)) * ((cx - dx) / (2 * e)));
      if (det < lo) {
        lo = det;
        at = [x, y];
      }
      hi = Math.max(hi, det);
    }
  return { lo, hi, at };
}

const CASES: { name: string; feel: BrowEmotion[]; o?: Partial<BrowInput>; k?: number }[] = [
  ...BROW_EMOTIONS.map((e) => ({ name: e, feel: [e] })),
  { name: "annoyed + flinch", feel: ["annoyed", "flinch"] },
  { name: "wary + surprise", feel: ["wary", "surprise"] },
  { name: "delight + confused", feel: ["delight", "confused"] },
  { name: "flinch, looking down to the nose, squinting", feel: ["flinch"], o: { gaze: { x: -1, y: -1 }, squint: 1 } },
  { name: "surprise, looking up to the temple", feel: ["surprise"], o: { gaze: { x: 1, y: 1 } } },
  // the sideways looks (stronger since 2026-10-28)
  { name: "annoyed + flinch, looking to the nose, squinting", feel: ["annoyed", "flinch"], o: { gaze: { x: -1, y: 0 }, squint: 1 } },
  { name: "surprise, looking to the temple", feel: ["surprise"], o: { gaze: { x: 1, y: 0 } } },
  // 2026 mirrors the visitor: what they bring comes 1.2 × as strong (look.ts ERA_BROW)
  { name: "2026's mirror: annoyed + flinch × 1.2, looking down to the nose, squinting", feel: ["annoyed", "flinch"], o: { gaze: { x: -1, y: -1 }, squint: 1 }, k: 1.2 },
  { name: "2026's mirror: wary + surprise × 1.2, looking up to the temple", feel: ["wary", "surprise"], o: { gaze: { x: 1, y: 1 } }, k: 1.2 },
  { name: "2026's mirror: delight × 1.2, looking up to the nose", feel: ["delight"], o: { gaze: { x: -1, y: 1 } }, k: 1.2 },
];

for (const c of CASES) {
  test(`the skin never folds or tears: ${c.name}`, () => {
    const r = areaRange(chainFor(c.feel, c.o, c.k));
    // (a fold is a determinant at or below 0; 0.35 is skin squeezed to a third, still a smooth surface)
    assert.ok(r.lo > 0.35, `squeezed to ${r.lo.toFixed(2)} at (${r.at[0]}, ${r.at[1]}) mm`);
    assert.ok(r.hi < 2.5, `stretched to ${r.hi.toFixed(2)}`);
  });
}

test("the twin agrees with the rig: at a node, the move is that node's own", () => {
  const chain = chainFor(["annoyed"]);
  // the arch node, on the brow's midline (u 0.42)
  const x = -13.6 + 31.4 * 0.42;
  const m = browMoveAt(x, 8.2 + 1.1 * Math.sin((Math.PI / 2) * (0.42 / 0.66)) + 1.4, chain);
  assert.ok(Math.abs(m[1] - chain[2 * 4 + 1]) < 0.05, `twin ${m[1].toFixed(3)} vs node ${chain[9].toFixed(3)}`);
});
