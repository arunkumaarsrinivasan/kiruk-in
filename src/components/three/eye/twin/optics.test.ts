// The cornea's twin against published optics. Run: npm run test:eye.
// A `todo` is a known gap with the phase that closes it.
import assert from "node:assert/strict";
import { test } from "node:test";
import { ANATOMY, CORNEA_APEX_Z, CORNEA_CENTER_Z, LIMBUS_RADIUS, LIMBUS_Z, corneaSag } from "../anatomy";
import { CURRENT_EYE, currentEntrancePupil, entrancePupil1, entrancePupil2, visibleLimbus } from "./optics";

test("the twin's optics reproduce Gullstrand's entrance pupil (3.047 mm deep, ×1.133)", () => {
  // Gullstrand's exact schematic eye: cornea 7.7 / 6.8 mm, 0.5 mm thick, pupil 3.6 mm behind the apex
  const g = entrancePupil2({ R1: 7.7, R2: 6.8, t: 0.5, nC: 1.376, nA: 1.336, depth: 3.6 });
  assert.ok(Math.abs(g.depth - 3.047) < 0.02, `depth ${g.depth.toFixed(3)}`);
  assert.ok(Math.abs(g.m - 1.133) < 0.005, `magnification ${g.m.toFixed(3)}`);
  // and the one-surface model the shader uses today agrees with it to a few hundredths
  const one = entrancePupil1({ R: 7.7, n: 1.336, depth: 3.6 });
  assert.ok(Math.abs(one.depth - g.depth) < 0.05 && Math.abs(one.m - g.m) < 0.01);
});

test("the cornea's mesh sphere and its conic both meet the globe at the limbus", () => {
  const capZ = CORNEA_CENTER_Z + Math.sqrt(ANATOMY.corneaRadius ** 2 - LIMBUS_RADIUS ** 2);
  assert.ok(Math.abs(Math.hypot(LIMBUS_RADIUS, capZ) - ANATOMY.eyeballRadius) < 1e-9);
  assert.ok(Math.abs(CORNEA_APEX_Z - corneaSag(LIMBUS_RADIUS) - LIMBUS_Z) < 1e-9);
  // the conic flattens toward its edge: it falls back less than the 7.8 mm sphere would
  const sphereSag = ANATOMY.corneaRadius - Math.sqrt(ANATOMY.corneaRadius ** 2 - LIMBUS_RADIUS ** 2);
  assert.ok(corneaSag(LIMBUS_RADIUS) < sphereSag && corneaSag(LIMBUS_RADIUS) > sphereSag - 0.3);
});

test("the eye's entrance pupil sits 3.04 ± 0.1 mm deep at ×1.13 ± 0.02 (Gullstrand)", () => {
  const e = currentEntrancePupil();
  assert.ok(Math.abs(CURRENT_EYE.pupilDepth - 3.6) < 1e-9, `pupil plane ${CURRENT_EYE.pupilDepth.toFixed(3)} mm`);
  assert.ok(Math.abs(e.depth - 3.04) < 0.1, `depth ${e.depth.toFixed(3)}`);
  assert.ok(Math.abs(e.m - 1.13) < 0.02, `magnification ${e.m.toFixed(3)}`);
});

test("the visible limbus is an ellipse, about 11.7 × 10.6 mm (HVID × VVID)", () => {
  const l = visibleLimbus();
  assert.ok(Math.abs(l.w - 11.7) < 0.3 && Math.abs(l.h - 10.6) < 0.3, `${l.w} × ${l.h}`);
});
