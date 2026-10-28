// The Purkinje twin against published optics. Run: npm run test:eye.
import assert from "node:assert/strict";
import { test } from "node:test";
import { ANATOMY, CORNEA_APEX_Z } from "../anatomy";
import { PURKINJE_VS_P1, purkinjeImage } from "./purkinje";

const depth = (z: number) => CORNEA_APEX_Z - z;

test("P1 is the cornea's convex mirror: ~3.9 mm deep, upright, f = R/2", () => {
  const i = purkinjeImage(1, 5)!;
  assert.ok(Math.abs(depth(i.z) - ANATOMY.corneaRadius / 2) < 0.25, `depth ${depth(i.z).toFixed(2)}`);
  const f = i.y / Math.tan((5 * Math.PI) / 180);
  assert.ok(Math.abs(f - ANATOMY.corneaRadius / 2) < 0.15, `f ${f.toFixed(2)}`);
});

test("P3 (lens front) is upright, about twice P1, ~10.6 mm deep: blurred behind the iris", () => {
  const p1 = purkinjeImage(1, 5)!, p3 = purkinjeImage(3, 5)!;
  const m = p3.y / p1.y;
  assert.ok(m > 1.7 && m < 2.2, `×${m.toFixed(2)}`);
  assert.ok(Math.abs(depth(p3.z) - 10.6) < 0.6, `depth ${depth(p3.z).toFixed(2)}`);
});

test("P4 (lens back) is inverted, ~3/4 of P1, ~4.3 mm deep: near the pupil's plane", () => {
  const p1 = purkinjeImage(1, 5)!, p4 = purkinjeImage(4, 5)!;
  const m = p4.y / p1.y;
  assert.ok(m < -0.65 && m > -0.85, `×${m.toFixed(2)}`);
  assert.ok(Math.abs(depth(p4.z) - 4.3) < 0.4, `depth ${depth(p4.z).toFixed(2)}`);
});

test("P3 and P4 each send back ~1/27 of what P1 does (Fresnel at the lens, n 1.336 → 1.42)", () => {
  assert.ok(Math.abs(PURKINJE_VS_P1 - 0.037) < 0.003, PURKINJE_VS_P1.toFixed(4));
});
