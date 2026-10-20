/**
 * Ten ways of seeing (docs/LOADER_WORDS_PLAN.md): the finished frame shown
 * through each era's own screen and image technology, so the era is told by
 * the picture itself and no words are needed.
 *
 *   1970 a green phosphor CRT: one colour, scanlines, glow, curved glass; the
 *        prompt's block cursor waits in the pupil
 *   1981 a 1-bit bitmap, dithered, black on the screen's white; the arrow pointer
 *   1991 a grey GIF on a white page, linked (a blue border), still loading
 *   1995 the 216-colour web palette, ordered dither, big pixels
 *   1997 16-bit colour bands, JPEG blocks, a gold bevel
 *   2000 a white page and one box, the eye seen through it, a caret in it
 *   2003 candy colour and the glossy wet band
 *   2009 Retina: every detail sharp, behind glass
 *   2013 flat: six flat tones
 *   2026 the pupil's own look: a halftone, black lids on a white page
 *
 * It runs after everything else, on the graded frame rendered to a texture
 * (the loader always builds the pipeline with it; the lab can leave it out).
 * At rest only the era on screen shows. To travel, the next era sweeps in
 * from its side (a later one from the right) behind a front drawn the way
 * that era drew things (a scanline comb, a dither, interlaced rows, big
 * pixels, JPEG blocks, halftone dots) with a rim in its colour; its slice of
 * the eye slides home as it comes, so each crossing looks like its era. Which medium a pixel
 * gets depends on where it is, so every texture read inside a branch names
 * its level.
 */

import { T, type N } from "../nodes/tsl";
import type { EyeUniforms } from "../uniforms";

const { Fn, If, abs, clamp, dot, exp, float, floor, fract, length, max, min, mix, pow, screenSize, screenUV, select, sin, smoothstep, sqrt, step, vec2, vec3, vec4 } = T;

/** Era ids in order; a medium's number is its index + 1 (0 is none). */
export const ERA_MEDIA = ["1970", "1981", "1991", "1995", "1997", "2000", "2003", "2009", "2013", "2026"] as const;
export const mediumOf = (eraId: string) => ERA_MEDIA.indexOf(eraId as (typeof ERA_MEDIA)[number]) + 1;

const LUMA = vec3(0.2126, 0.7152, 0.0722);
const disp = (c: N) => pow(max(c, 0), vec3(1 / 2.2));
const lin = (d: N) => pow(max(d, 0), vec3(2.2));
/** The frame's luminance, display-referred, stretched off the dark room. */
const tone = (d: N, gamma: number) => pow(clamp(dot(d, LUMA).sub(0.02).div(0.78), 0, 1), float(gamma));

/** Ordered dither thresholds in 0..1 (the recursive Bayer matrix). */
const bayer2 = (a: N) => {
  const f = floor(a);
  return fract(dot(f, vec2(0.5, f.y.mul(0.75))));
};
const bayer4 = (a: N) => bayer2(a.mul(0.5)).mul(0.25).add(bayer2(a));
const bayer8 = (a: N) => bayer4(a.mul(0.5)).mul(0.25).add(bayer2(a));

/** A hash in 0..1 with no sin() in it (Hoskins' hash12), steady at pixel coordinates in the thousands. */
function hash(q: N): N {
  const p3 = fract(vec3(q.x, q.y, q.x).mul(0.1031)).toVar();
  p3.addAssign(dot(p3, vec3(p3.y, p3.z, p3.x).add(33.33)));
  return fract(p3.x.add(p3.y).mul(p3.z));
}

/**
 * How an era draws an edge, 0..1 per pixel: a glimpse's front is pushed in or
 * out by this, so the edge is that era's own texture. `id` is a uniform, so
 * every pattern is cheap arithmetic and none of them samples anything.
 */
function edgeOf(id: N, sp: N, s: N): N {
  const scan = fract(sp.y.div(s.mul(3.4)));
  const dither = bayer8(floor(sp.div(s.mul(3))));
  const rows = fract(floor(sp.y.div(s.mul(6))).mul(0.6180339));
  const pixels = bayer4(floor(sp.div(s.mul(5))));
  const blocks = hash(floor(sp.div(s.mul(16))));
  const dots = clamp(length(fract(sp.div(s.mul(9))).sub(0.5)).mul(1.41), 0, 1);
  return select(
    id.equal(1),
    scan,
    select(id.equal(2), dither, select(id.equal(3), rows, select(id.equal(4), pixels, select(id.equal(5), blocks, select(id.equal(10), dots, float(0.5)))))),
  );
}

/** Each era's colour for a glimpse's rim (linear). */
function rimOf(id: N): N {
  const C = [
    [0.15, 1, 0.06], [1, 1, 1], [0.08, 0.15, 1], [1, 0.05, 1], [1, 0.72, 0.2],
    [0.6, 0.6, 0.6], [1, 0.38, 0.02], [0.85, 0.9, 1], [0.02, 0.4, 1], [1, 1, 1],
  ].map(([r, g, b]) => vec3(r, g, b));
  let c: N = C[0];
  C.forEach((v, i) => {
    if (i > 0) c = select(id.equal(i + 1), v, c);
  });
  return c;
}

/** 1 inside a rectangle with rounded corners (all in pixels), anti-aliased. */
function rounded(p: N, size: N, inset: N, r: N): N {
  const q = max(abs(p.sub(size.mul(0.5))).sub(size.mul(0.5).sub(inset).sub(r)), 0);
  return float(1).sub(smoothstep(r.sub(1.5), r.add(1.5), length(q)));
}

/** The 1981 arrow pointer, in bitmap cells from its tip: 1 inside. */
function arrowAt(q: N): N {
  const head = step(0, q.y).mul(step(q.y, 10)).mul(step(0, q.x)).mul(step(q.x, q.y.mul(0.6)));
  const s = q.y.sub(8).mul(0.45);
  const tail = step(8, q.y).mul(step(q.y, 15)).mul(step(s.add(1.5), q.x)).mul(step(q.x, s.add(3.5)));
  return max(head, tail);
}

/**
 * @param tex the finished frame (linear), as a texture
 * @returns the frame in each pixel's medium, linear
 */
export function eraMedium(Ux: EyeUniforms, tex: N): N {
  const U: N = Ux;
  const M = U.medium;
  return Fn(() => {
    const scr = screenUV;
    const size = screenSize;
    const H = size.y;
    // shared by several branches, so each is computed once out here (a value
    // first built inside one branch is left unset in the others)
    const s = H.div(900).toVar();
    const at = (q: N) => tex.sample(q).level(0).rgb;
    const blink = step(0.5, fract(U.time.mul(1.05))).toVar();
    const pupil = M.pupil.mul(size).toVar();
    const pupilR = M.pupilR.mul(H).toVar();

    // ---- the glimpses at the edges -----------------------------------------
    const sp = scr.mul(size);
    // a crescent: widest on the eye's line, nearly nothing at the top and
    // bottom; it breathes at rest and straightens as it takes over the frame
    const dy = scr.y.sub(M.pupil.y).div(0.3);
    const bell = exp(dy.mul(dy).negate());
    const glimpse = (reach: N, phase: number) => {
      const grow = smoothstep(0.1, 0.6, reach);
      const breath = sin(U.time.mul(1.3).add(phase)).mul(0.14).mul(float(1).sub(grow)).add(1);
      return reach.mul(size.x).mul(mix(bell.mul(0.82).add(0.18), float(1), grow)).mul(breath);
    };
    const jag = s.mul(26);
    const frontL = glimpse(M.reachL, 0).add(edgeOf(M.prev, sp, s).sub(0.5).mul(jag)).toVar();
    const frontR = glimpse(M.reachR, 2.1).add(edgeOf(M.next, sp, s).sub(0.5).mul(jag)).toVar();
    const inL = sp.x.lessThan(frontL).and(M.prev.greaterThan(0.5)).and(M.reachL.greaterThan(0.001));
    const inR = size.x.sub(sp.x).lessThan(frontR).and(M.next.greaterThan(0.5)).and(M.reachR.greaterThan(0.001));
    const id = select(inL, M.prev, select(inR, M.next, M.cur)).toVar();
    // a glimpse looks through the pupil (its left half from the left, its right
    // half from the right), drifting a little against the pointer; as it takes
    // over, its slice slides home
    const kL = float(1).sub(smoothstep(0.05, 0.55, M.reachL));
    const kR = float(1).sub(smoothstep(0.05, 0.55, M.reachR));
    const drift = U.screen.cursorPos.x.sub(0.5).mul(-0.03);
    const uv = select(
      inL,
      vec2(scr.x.add(M.pupil.x.sub(M.reachL).add(drift).mul(kL)), scr.y),
      select(inR, vec2(scr.x.sub(float(1).sub(M.pupil.x).sub(M.reachR).sub(drift).mul(kR)), scr.y), scr),
    ).toVar();
    const p = uv.mul(size).toVar();
    const out = at(uv).toVar();

    // ---- 1970: a green phosphor CRT ----------------------------------------
    If(id.equal(1), () => {
      const u = uv.sub(0.5).mul(2);
      const su = u.mul(dot(u, u).mul(0.07).add(1)).mul(0.5).add(0.5);
      const l = tone(disp(at(su)), 0.85);
      // the phosphor's bloom: a ring of eight taps round the beam
      const r = vec2(H.mul(0.006)).div(size);
      let g: N = float(0);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]]) {
        g = g.add(tone(disp(at(su.add(r.mul(vec2(dx, dy))))), 0.85));
      }
      g = g.mul(1 / 8);
      const row = abs(fract(su.y.mul(260)).sub(0.5)).mul(2);
      const lv = l.mul(float(1).sub(row.mul(row).mul(0.62)));
      const c = vec3(pow(lv, 2.4).mul(0.55), lv.mul(1.05), pow(lv, 2.4).mul(0.32)).add(vec3(0.08, 0.5, 0.1).mul(g).mul(0.35)).toVar();
      // the prompt waits in the pupil
      const cur = step(abs(p.x.sub(pupil.x)), pupilR.mul(0.2)).mul(step(abs(p.y.sub(pupil.y)), pupilR.mul(0.36))).mul(blink);
      c.assign(mix(c, vec3(0.5, 1, 0.42), cur));
      const vig = float(1).sub(pow(dot(u, u).mul(0.5), 1.3).mul(0.55));
      const inside = step(0, su.x).mul(step(su.x, 1)).mul(step(0, su.y)).mul(step(su.y, 1));
      out.assign(lin(c.mul(vig).mul(inside).mul(rounded(p, size, H.mul(0.028), H.mul(0.075)))));
    })
      // ---- 1981: a 1-bit bitmap ---------------------------------------------
      .ElseIf(id.equal(2), () => {
        const cells = vec2(size.x.div(size.y).mul(260), 260);
        const cell = floor(uv.mul(cells));
        const l = smoothstep(0.07, 0.8, dot(disp(at(cell.add(0.5).div(cells))), LUMA));
        const paper = step(bayer8(cell), l).toVar();
        // the arrow pointer, resting on the pupil
        const q = cell.sub(floor(M.pupil.mul(cells)).add(vec2(5, 3)));
        const inA = arrowAt(q);
        const ring = max(max(arrowAt(q.add(vec2(1, 0))), arrowAt(q.sub(vec2(1, 0)))), max(arrowAt(q.add(vec2(0, 1))), arrowAt(q.sub(vec2(0, 1)))));
        paper.assign(mix(mix(paper, float(0), ring), float(1), inA));
        out.assign(lin(mix(vec3(0.06, 0.06, 0.07), vec3(0.95, 0.94, 0.91), paper)));
      })
      // ---- 1991: a grey GIF on a white page, linked, still loading -------------
      .ElseIf(id.equal(3), () => {
        const m = vec2(H.mul(0.06)).div(size);
        const iu = uv.sub(m).div(float(1).sub(m.mul(2)));
        const loaded = clamp(M.age.div(2.4), 0, 1);
        // the interlaced GIF's first pass: rows doubled into bands until they arrive
        const iy = select(iu.y.lessThan(loaded), iu.y, floor(iu.y.mul(56)).add(0.5).div(56));
        const l = floor(tone(disp(at(vec2(iu.x, iy).mul(float(1).sub(m.mul(2))).add(m))), 0.8).mul(15).add(0.5)).div(15);
        const inImg = step(0, iu.x).mul(step(iu.x, 1)).mul(step(0, iu.y)).mul(step(iu.y, 1));
        // the link's blue border, four pixels round the image
        const d = max(max(m.x.mul(size.x).sub(p.x), p.x.sub(size.x.sub(m.x.mul(size.x)))), max(m.y.mul(H).sub(p.y), p.y.sub(H.sub(m.y.mul(H)))));
        const border = step(0, d).mul(step(d, s.mul(4)));
        const page = mix(vec3(1), vec3(0, 0, 0.93), border);
        out.assign(lin(mix(page, vec3(l), inImg)));
      })
      // ---- 1995: 216 web-safe colours ------------------------------------------
      .ElseIf(id.equal(4), () => {
        const pix = s.mul(4);
        const cell = floor(p.div(pix));
        const d0 = disp(at(cell.add(0.5).mul(pix).div(size)));
        const d = mix(vec3(dot(d0, LUMA)), d0, 1.9).sub(0.5).mul(1.3).add(0.56);
        const t = bayer4(cell).sub(0.5).div(2.6);
        out.assign(lin(floor(clamp(d.add(t), 0, 1).mul(5).add(0.5)).div(5)));
      })
      // ---- 1997: 16-bit colour on a 56k line, a gold bevel ---------------------
      .ElseIf(id.equal(5), () => {
        const pix = s.mul(2);
        const fine = disp(at(floor(p.div(pix)).add(0.5).mul(pix).div(size)));
        const block = disp(at(floor(p.div(pix.mul(8))).add(0.5).mul(pix.mul(8)).div(size)));
        const d = mix(fine, block, 0.4);
        const c = vec3(floor(d.x.mul(31)).div(31), floor(d.y.mul(63)).div(63), floor(d.z.mul(31)).div(31)).toVar();
        const e = min(min(p.x, p.y), min(size.x.sub(p.x), H.sub(p.y)));
        const lit = step(min(p.x, p.y), min(size.x.sub(p.x), H.sub(p.y)));
        c.assign(mix(c, mix(vec3(0.55, 0.38, 0.04), vec3(1, 0.87, 0.47), lit), step(e, s.mul(10))));
        out.assign(lin(c));
      })
      // ---- 2000: one box on a white page ---------------------------------------
      .ElseIf(id.equal(6), () => {
        const x0 = size.x.mul(0.14), x1 = size.x.mul(0.86);
        const y0 = pupil.y.sub(H.mul(0.228)), y1 = pupil.y.add(H.mul(0.198));
        const inBox = step(x0, p.x).mul(step(p.x, x1)).mul(step(y0, p.y)).mul(step(p.y, y1));
        const d = max(max(x0.sub(p.x), p.x.sub(x1)), max(y0.sub(p.y), p.y.sub(y1)));
        const frame = step(0, d).mul(step(d, s.mul(2.5)));
        const shade = select(p.x.lessThan(x0).or(p.y.lessThan(y0)), vec3(0.46), vec3(0.83));
        const page = mix(vec3(1), shade, frame);
        const caret = step(x0.add(s.mul(24)), p.x).mul(step(p.x, x0.add(s.mul(27)))).mul(step(y0.add(s.mul(40)), p.y)).mul(step(p.y, y1.sub(s.mul(40)))).mul(blink);
        out.assign(mix(lin(page), mix(at(uv), vec3(0), caret), inBox));
      })
      // ---- 2003: a glossy candy photo on a white page, on a wet floor ---------
      .ElseIf(id.equal(7), () => {
        const m = s.mul(46);
        const refl = H.mul(0.16);
        // the photo's rectangle, px; the frame shifts down so the eye stays in its middle
        const y1 = H.sub(m).sub(refl);
        const shift = vec2(0, refl.mul(0.5).div(H));
        const candy = (q: N) => {
          const d0 = disp(at(q));
          return mix(vec3(dot(d0, LUMA)), d0, 1.6).mul(1.14).sub(0.5).mul(1.15).add(0.5);
        };
        const inPhoto = step(m, p.x).mul(step(p.x, size.x.sub(m))).mul(step(m, p.y)).mul(step(p.y, y1));
        const photoSize = vec2(size.x.sub(m.mul(2)), y1.sub(m));
        const corner = rounded(p.sub(vec2(m, m)), photoSize, float(0), s.mul(26));
        const iu = p.sub(vec2(m, m)).div(photoSize);
        const u = iu.x.sub(0.5).div(0.62);
        const edge = float(0.47).sub(float(1).sub(u.mul(u)).mul(0.13));
        const gloss = select(iu.y.lessThan(edge), pow(float(1).sub(iu.y.div(edge)), 1.5).mul(0.42).add(0.08), float(0));
        const photo = candy(uv.add(shift)).toVar();
        photo.assign(photo.add(float(1).sub(photo).mul(gloss)));
        // the page, and the photo's reflection on it, fading down from its foot
        const page = mix(vec3(0.99, 0.99, 1), vec3(0.88, 0.9, 0.93), uv.y);
        const k = p.y.sub(y1);
        const inFloor = step(0, k).mul(step(k, refl)).mul(step(m, p.x)).mul(step(p.x, size.x.sub(m)));
        const mirror = candy(vec2(uv.x, y1.sub(k).div(H)).add(shift));
        const floorA = pow(float(1).sub(k.div(refl)), 2).mul(0.32).mul(inFloor);
        const c = mix(mix(page, mirror, floorA), photo, inPhoto.mul(corner));
        out.assign(lin(c));
      })
      // ---- 2009: a phone photo of its time: a warm faded filter, a white border
      .ElseIf(id.equal(8), () => {
        const d0 = disp(at(uv));
        const l = dot(d0, LUMA);
        // faded blacks, warm highlights, teal shadows
        const d = mix(d0, vec3(l), 0.18)
          .mul(0.82)
          .add(vec3(0.1, 0.075, 0.04))
          .add(vec3(0.07, 0.035, -0.06).mul(smoothstep(0.35, 0.95, l)))
          .add(vec3(-0.03, 0.025, 0.05).mul(smoothstep(0.45, 0.02, l)))
          .toVar();
        const u = uv.sub(0.5).mul(vec2(size.x.div(H), 1));
        d.mulAssign(float(1).sub(dot(u, u).mul(0.62)));
        const photo = rounded(p, size, s.mul(26), s.mul(8));
        out.assign(lin(mix(vec3(0.96, 0.95, 0.92), d, photo)));
      })
      // ---- 2013: flat --------------------------------------------------------
      .ElseIf(id.equal(9), () => {
        const o = vec2(s.mul(3)).div(size);
        let sum: N = vec3(0);
        for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) sum = sum.add(at(uv.add(o.mul(vec2(i, j)))));
        const l = tone(disp(sum.mul(1 / 9)), 0.75);
        const P = [[24, 20, 19], [52, 40, 36], [86, 66, 56], [128, 100, 84], [196, 186, 178], [243, 241, 237]].map(([r, g, b]) => vec3(r / 255, g / 255, b / 255));
        const cut = [0.16, 0.3, 0.44, 0.6, 0.8];
        let c: N = P[0];
        cut.forEach((k, i) => {
          c = select(l.greaterThan(k), P[i + 1], c);
        });
        out.assign(lin(c));
      })
      // ---- 2026: the pupil's halftone --------------------------------------------
      .ElseIf(id.equal(10), () => {
        const cell = H.div(110);
        const cp = floor(p.div(cell)).add(0.5).mul(cell);
        const l = tone(disp(at(cp.div(size))), 0.8);
        // the whole tonal range in dots, so the face reads, not only the white of the eye
        const dark = float(1).sub(smoothstep(0.02, 0.78, l));
        const r = sqrt(dark).mul(cell).mul(0.7);
        const ink = float(1).sub(smoothstep(r.sub(s.mul(0.7)), r.add(s.mul(0.7)), length(p.sub(cp))));
        out.assign(lin(vec3(mix(float(0.98), float(0.043), ink))));
      });

    // a glimpse sits a little back until it takes over; its rim glows in its era's colour
    out.mulAssign(select(inL, mix(float(1), float(0.78), kL), select(inR, mix(float(1), float(0.78), kR), float(1))));
    const rimL = float(1).sub(smoothstep(0, s.mul(2.2), abs(sp.x.sub(frontL)))).mul(step(0.5, M.prev)).mul(step(0.001, M.reachL));
    const rimR = float(1).sub(smoothstep(0, s.mul(2.2), abs(size.x.sub(sp.x).sub(frontR)))).mul(step(0.5, M.next)).mul(step(0.001, M.reachR));
    const fadeL = float(1).sub(smoothstep(0.7, 1.05, M.reachL));
    const fadeR = float(1).sub(smoothstep(0.7, 1.05, M.reachR));
    out.addAssign(rimOf(M.prev).mul(rimL.mul(fadeL).mul(0.55)));
    out.addAssign(rimOf(M.next).mul(rimR.mul(fadeR).mul(0.55)));
    return vec4(out, 1);
  })();
}
