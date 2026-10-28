// The iris's rest space (R2): the area-preserving map, and the map as the shader runs it.
// Run: npm run test:eye. A `todo` is a known gap with the phase that closes it.
import assert from "node:assert/strict";
import { test } from "node:test";
import { areaPreservingRest, collaretteNow, shaderRestRho } from "./iris-space";

const REST = 0.34; // the person's resting pupil, a share of the iris radius (identity.ts)
const COLLARETTE = 0.34 + 0.34 * (1 - 0.34); // the collarette at rest, ~34 % of the way to the root

test("the rest space keeps the pupillary zone's area and holds the root", () => {
  for (const rp of [0.2, 0.34, 0.5, 0.7]) {
    const rc = collaretteNow(rp, REST, COLLARETTE);
    const now = rc * rc - rp * rp;
    const atRest = COLLARETTE * COLLARETTE - REST * REST;
    assert.ok(Math.abs(now - atRest) < 1e-12, `area at pupil ${rp}`);
    assert.ok(Math.abs(areaPreservingRest(rp, rp, REST, COLLARETTE, 1) - REST) < 1e-12);
    assert.ok(Math.abs(areaPreservingRest(rc, rp, REST, COLLARETTE, 1) - COLLARETTE) < 1e-12);
    assert.ok(Math.abs(areaPreservingRest(1, rp, REST, COLLARETTE, 1) - 1) < 1e-12);
    // monotonic: the tissue never folds over itself
    let last = -Infinity;
    for (let r = rp; r <= 1; r += 0.01) {
      const r0 = areaPreservingRest(r, rp, REST, COLLARETTE, 1);
      assert.ok(r0 >= last - 1e-12);
      last = r0;
    }
  }
});

test("the shader's rest space keeps the pupillary zone's area", () => {
  for (const rp of [0.2, 0.34, 0.5, 0.6, 0.7]) {
    const rc = collaretteNow(rp, REST, COLLARETTE);
    assert.ok(Math.abs(shaderRestRho(rc, rp, REST, COLLARETTE) - COLLARETTE) < 1e-9, `collarette at pupil ${rp}`);
    for (const r of [rp, (rp + rc) / 2, rc, (rc + 1) / 2, 1]) {
      assert.ok(Math.abs(shaderRestRho(r, rp, REST, COLLARETTE) - areaPreservingRest(r, rp, REST, COLLARETTE, 1)) < 1e-9, `r ${r} at pupil ${rp}`);
    }
  }
});

test("the shader's rest space holds the margin and the root, and never folds, up to the enter (0.98)", () => {
  for (const rp of [0.1, 0.34, 0.7, 0.85, 0.9, 0.95, 0.98]) {
    assert.ok(Math.abs(shaderRestRho(rp, rp, REST, COLLARETTE) - REST) < 1e-9, `margin at ${rp}`);
    assert.ok(Math.abs(shaderRestRho(1, rp, REST, COLLARETTE) - 1) < 1e-9, `root at ${rp}`);
    let last = -Infinity;
    for (let r = rp; r <= 1; r += 0.002) {
      const r0 = shaderRestRho(r, rp, REST, COLLARETTE);
      assert.ok(Number.isFinite(r0) && r0 >= last - 1e-9, `fold at r ${r.toFixed(3)}, pupil ${rp}`);
      last = r0;
    }
  }
});
