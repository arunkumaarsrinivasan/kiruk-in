/**
 * The skin's face-space detail, baked once, so the lid shader reads textures
 * instead of evaluating noise at every pixel (it was the frame's dearest pass).
 *
 *  · The tile: 6 mm square, repeating across the face, for what is fine and
 *    the same everywhere. Each noise's cells divide the tile exactly, so the
 *    tile repeats without a seam.
 *      R  pores        — a mask, about 15 cells per mm
 *      G  grain        — two fine noises, averaged
 *      B  sheen        — the oily sheen's pore-scale variation
 *      A  relief       — the skin's micro-relief (R6/R8): a fine, soft net
 *                        of shallow furrows (~0.15 mm plateaus, a finer one
 *                        within), with pores where furrows meet: at the
 *                        loader's ~41 px/mm it reads as grain, never as
 *                        plates; the height the lids' sparkle reads
 *  · The map: the face round the eye, for what is broad.
 *      R  mottle       — the skin's unevenness, three octaves
 *      G  freckles     — clustered specks (none, for the eye's person)
 *      B  crow's feet  — fanning from the outer corner (where the person's
 *                        lids put it: the fissure and their canthal tilt)
 *
 * Both are mipmapped, which also takes out the shimmer the procedural noise
 * had where its cells were smaller than a pixel.
 */

import {
  ClampToEdgeWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  NodeMaterial,
  QuadMesh,
  RenderTarget,
  RepeatWrapping,
  type WebGPURenderer,
} from "three/webgpu";
import { fbm, hash21, smoothstepDown, vnoise, type N } from "../nodes/common";
import { MARGIN_RADIUS, fissureAngles } from "../nodes/margins";
import { T } from "../nodes/tsl";

const { Fn, abs, atan, float, floor, fract, length, min, mix, mod, pow, select, smoothstep, uv, vec2, vec4 } = T;

/** The tile's side, mm. */
export const SKIN_TILE_MM = 6;
/** The map's extent on the face, mm (x lateral +, y up). */
export const SKIN_MAP = { x0: -32, y0: -24, w: 64, h: 48 } as const;

/**
 * The skin's furrow net: a tiling cellular (Worley) field over `n` × `n` cells
 * a tile, seeded by `seed`. Returns how deep a furrow is here (1 on a furrow's
 * floor, 0 on a plateau) and whether this is a junction, where several meet.
 * `p` is the tile's uv (0..1), stretched a little by `aniso` along the skin's
 * tension lines (x).
 */
function furrowNet(p: N, n: number, seed: number, width: number, aniso: number) {
  const g = vec2(p.x.mul(n), p.y.mul(n)).toVar();
  const i = floor(g).toVar();
  const f = fract(g).toVar();
  const d1 = float(9).toVar();
  const d2 = float(9).toVar();
  const d3 = float(9).toVar();
  for (let y = -1; y <= 1; y++)
    for (let x = -1; x <= 1; x++) {
      const c = vec2(x, y);
      const cell = mod(i.add(c), n);
      // (the jitter keeps a little of the grid's order away: real plateaus are
      // uneven, but never a random scatter of dots)
      const j = vec2(hash21(cell.add(seed)), hash21(cell.add(seed + 31.7))).mul(0.85).add(0.075);
      const r = c.add(j).sub(f);
      const dist = length(vec2(r.x.mul(aniso), r.y));
      // keep the three nearest
      d3.assign(select(dist.lessThan(d2), d2, select(dist.lessThan(d3), dist, d3)));
      d2.assign(select(dist.lessThan(d1), d1, select(dist.lessThan(d2), dist, d2)));
      d1.assign(min(d1, dist));
    }
  // the edge between the two nearest seeds is the furrow; where a third is as
  // near, furrows meet
  const edge = d2.sub(d1);
  const floor_ = float(1).sub(smoothstep(0, width, edge));
  const junction = float(1).sub(smoothstep(0, width * 2.2, d3.sub(d1)));
  return { floor: floor_, junction };
}

/** Value noise whose lattice repeats every `period` cells (common.ts vnoise, wrapped). */
function vnoiseTiled(p: N, period: number): N {
  const i = floor(p).toVar();
  const f = fract(p);
  const u = f.mul(f).mul(f.mul(-2).add(3)).toVar();
  const w = (c: N) => mod(c, period);
  const a = hash21(w(i));
  const b = hash21(w(i.add(vec2(1, 0))));
  const c = hash21(w(i.add(vec2(0, 1))));
  const d = hash21(w(i.add(vec2(1, 1))));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

export interface SkinFaceBake {
  tile: RenderTarget;
  map: RenderTarget;
  /** Renders once; later calls do nothing. */
  render: (renderer: WebGPURenderer) => boolean;
  /**
   * Bakes again on the next `render`. On WebGPU the stage's first frames
   * build pipelines asynchronously and skip any draw not ready yet, which
   * includes a bake's one draw; the stage redoes every bake once it is warm.
   */
  redo: () => void;
  dispose: () => void;
}

function target(w: number, h: number, repeat: boolean, name: string) {
  const t = new RenderTarget(w, h, {
    generateMipmaps: true,
    minFilter: LinearMipmapLinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
  });
  t.texture.wrapS = t.texture.wrapT = repeat ? RepeatWrapping : ClampToEdgeWrapping;
  t.texture.name = name;
  return t;
}

/** @param tiltDeg the person's canthal tilt (identity.ts), which places the outer corner */
// (the tile at 1024: its finer net is ~0.07 mm, 6 px at 512 and blurred by the mips)
export function createSkinFaceBake(tiltDeg: number, tileRes = 1024, mapRes = 512): SkinFaceBake {
  const tile = target(tileRes, tileRes, true, "SkinTile");
  const map = target(mapRes, Math.round((mapRes * SKIN_MAP.h) / SKIN_MAP.w), false, "SkinMap");
  const S = SKIN_TILE_MM;

  // (the same noises, frequencies and offsets the lid shader used, so the skin looks as it did)
  const tileMat = new NodeMaterial();
  tileMat.name = "SkinTileBake";
  tileMat.fragmentNode = Fn(() => {
    const P = uv().mul(S).toVar();
    const pore0 = smoothstep(0.62, 0.88, vnoiseTiled(P.mul(15).add(11.7), 15 * S));
    const grain = vnoiseTiled(P.mul(14).add(3.1), 14 * S)
      .add(vnoiseTiled(P.mul(23).add(8.4), 23 * S))
      .mul(0.5);
    const sheen = vnoiseTiled(P.mul(24).add(2.2), 24 * S);
    // The micro-relief: a soft net of shallow furrows round irregular
    // plateaus, stretched a little along the tension lines that ring the eye,
    // a finer net within, pores where furrows meet. Small: ~0.15 mm plateaus,
    // ~6 px at the loader's framing, so it reads as the skin's grain. (Crossing
    // line families read as woven cloth, "camouflage"; plateaus of 0.35 mm,
    // ~14 px, read as crocodile scales: the user, 2026-10-28.)
    const q = uv().toVar();
    const primary = furrowNet(q, 40, 3.7, 0.16, 0.82);
    const fine = furrowNet(q.add(vec2(0.37, 0.61)), 90, 9.1, 0.18, 0.9);
    const deep = vnoiseTiled(P.mul(1.3).add(2.9), 1.3 * S).mul(0.6).add(0.4);
    const finePresent = smoothstep(0.35, 0.7, vnoiseTiled(P.mul(2.2).add(6.1), 2.2 * S));
    // pores: only some junctions, and the old pore field's sparse cells
    const pore = primary.junction.mul(smoothstep(0.55, 0.8, vnoiseTiled(P.mul(9).add(4.4), 9 * S))).max(pore0.mul(0.5));
    // (shallow and soft: deep, sharp furrows are scales)
    const relief = float(1)
      .sub(primary.floor.mul(deep).mul(0.32))
      .sub(fine.floor.mul(finePresent).mul(0.14))
      .sub(pore.mul(0.28));
    return vec4(pore, grain, sheen, relief);
  })();
  tileMat.depthTest = false;
  tileMat.depthWrite = false;

  const mapMat = new NodeMaterial();
  mapMat.name = "SkinMapBake";
  mapMat.fragmentNode = Fn(() => {
    const P = vec2(uv().x.mul(SKIN_MAP.w).add(SKIN_MAP.x0), uv().y.mul(SKIN_MAP.h).add(SKIN_MAP.y0)).toVar();
    const mottle = fbm(P.mul(0.22).add(17.3));
    const speck = smoothstep(0.8, 0.88, vnoise(P.mul(4.2).add(7.1)));
    const cluster = smoothstep(0.45, 0.85, vnoise(P.mul(0.28).add(3.3)));
    // (the outer canthus: its drop under the equator, lifted by the person's tilt)
    const fa = fissureAngles();
    const th = (tiltDeg * Math.PI) / 180 - fa.dropL;
    const outer = vec2(Math.sin(fa.phiL) * Math.cos(th), Math.sin(th)).mul(MARGIN_RADIUS);
    const rel = P.sub(outer);
    const fromOuter = length(rel);
    const ang = atan(rel.y, rel.x);
    const crows = pow(float(1).sub(abs(vnoise(vec2(ang.mul(14), fromOuter.mul(0.15))).mul(2).sub(1))), 4)
      .mul(smoothstep(3, 6, fromOuter))
      .mul(smoothstepDown(17, 9, fromOuter))
      .mul(smoothstepDown(0.9, 0.4, abs(ang)));
    return vec4(mottle, speck.mul(cluster), crows, float(1));
  })();
  mapMat.depthTest = false;
  mapMat.depthWrite = false;

  const tileQuad = new QuadMesh(tileMat);
  const mapQuad = new QuadMesh(mapMat);
  let done = false;
  return {
    tile,
    map,
    redo() {
      done = false;
    },
    render(renderer) {
      if (done) return false;
      done = true;
      const prev = renderer.getRenderTarget();
      renderer.setRenderTarget(tile);
      tileQuad.render(renderer);
      renderer.setRenderTarget(map);
      mapQuad.render(renderer);
      renderer.setRenderTarget(prev);
      return true;
    },
    dispose() {
      tile.dispose();
      map.dispose();
      tileMat.dispose();
      mapMat.dispose();
    },
  };
}
