/**
 * The white of the eye, baked once per person: its mottling, and its vessels.
 *
 *  · The vessels (R5) are grown on the CPU and drawn into a map of the front
 *    hemisphere (vessel-net.ts): R episcleral (deep, soft), G conjunctival
 *    (surface, sharp). Re-grown when the person changes.
 *  · Pigment: patchy brown melanosis within ~4 mm of the limbus, most in the
 *    exposed horizontal meridians (the user's photo: a large patch on the
 *    temporal white, yellow-brown ones nasally).
 *  · A low, warm mottling keeps the white from reading as paint.
 *
 *    MaterialX noise is expensive and none of this moves, so it is rendered
 *    once into an equirectangular map of the globe (front of the eye at the
 *    centre) and the sclera samples it by direction:
 *
 *   R  pigment   G  unused   B  mottle   A  1
 */

import {
  CanvasTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  NodeMaterial,
  QuadMesh,
  RenderTarget,
  RepeatWrapping,
  Vector3,
  type WebGPURenderer,
} from "three/webgpu";
import { ANATOMY } from "../anatomy";
import { T, type N } from "../nodes/tsl";
import { NET_FOV, drawVesselNet } from "./vessel-net";

const { Fn, PI, TWO_PI, abs, acos, clamp, cos, float, mix, mx_fractal_noise_float, normalize, sin, smoothstep, uniform, uv, vec2, vec3, vec4 } = T;

/** Angle from the visual axis to the limbus on the globe. */
const LIMBUS = Math.asin(ANATOMY.irisRadius / ANATOMY.eyeballRadius);

export const VESSEL_W = 1024;
export const VESSEL_H = 512;

/** A small, stable offset into noise space from a person's seed. */
export function seedOffset(seed: number, out = new Vector3()): Vector3 {
  const r = (k: number) => {
    const x = Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453;
    return (x - Math.floor(x)) * 97;
  };
  return out.set(r(1), r(2), r(3));
}

/** Direction on the globe for a texel of the map (front of the eye at the centre). */
function texelDirection(u: N, vTop: N): N {
  const lon = u.sub(0.5).mul(TWO_PI);
  const lat = float(0.5).sub(vTop).mul(PI);
  return vec3(sin(lon).mul(cos(lat)), sin(lat), cos(lon).mul(cos(lat)));
}

/** Where a direction on the globe lives in the map (top-left UV). */
export function vesselUv(dir: N): N {
  const { asin, atan, vec2 } = T;
  return vec2(atan(dir.x, dir.z).div(TWO_PI).add(0.5), float(0.5).sub(asin(clamp(dir.y, -1, 1)).div(PI)));
}

/**
 * Where a direction in the eye's own frame (z its axis) lives in the vessel
 * net (vessel-net.ts): azimuthal equidistant, θ from the axis out from the
 * centre, canvas y down.
 */
export function vesselNetUv(dir: N): N {
  const r = acos(clamp(dir.z, -1, 1)).div(NET_FOV).mul(0.5);
  const d = normalize(vec2(dir.x, dir.y).add(vec2(1e-6, 0)));
  return vec2(d.x.mul(r).add(0.5), float(0.5).sub(d.y.mul(r)));
}

export interface VesselBake {
  target: RenderTarget;
  /** The grown vessels: R episcleral, G conjunctival (vessel-net.ts). */
  net: CanvasTexture;
  /** Re-bakes for this seed on the next `render`. */
  setSeed: (seed: number) => void;
  /** Renders if a bake is owed; returns whether it did. */
  render: (renderer: WebGPURenderer) => boolean;
  /**
   * Bakes again on the next `render`. On WebGPU the stage's first frames
   * build pipelines asynchronously and skip any draw not ready yet, which
   * includes a bake's one draw; the stage redoes every bake once it is warm.
   */
  redo: () => void;
  quad: QuadMesh;
  dispose: () => void;
}

/** `netSize`: the vessel net's side in px (2048 gives ~54 px per mm on the white; 1024 for T1). */
export function createVesselBake(netSize = 2048): VesselBake {
  const canvas: HTMLCanvasElement | OffscreenCanvas =
    typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(netSize, netSize) : Object.assign(document.createElement("canvas"), { width: netSize, height: netSize });
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  const net = new CanvasTexture(canvas as HTMLCanvasElement);
  net.flipY = false;
  net.generateMipmaps = true;
  net.minFilter = LinearMipmapLinearFilter;
  net.magFilter = LinearFilter;
  // (no anisotropic filtering: at 4× it cost ~2 ms a frame on the 610M, A/B in one page)
  net.anisotropy = 1;
  net.name = "ScleraVesselNet";

  const target = new RenderTarget(VESSEL_W, VESSEL_H, {
    generateMipmaps: true,
    minFilter: LinearMipmapLinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
  });
  target.texture.wrapS = RepeatWrapping;
  target.texture.name = "ScleraVessels";

  const seed: N = uniform(new Vector3());

  const material = new NodeMaterial();
  material.name = "ScleraVesselsBake";
  material.fragmentNode = Fn(() => {
    const d = texelDirection(uv().x, uv().y).toVar();
    const theta = acos(clamp(d.z, -1, 1));
    const near = smoothstep(LIMBUS + 0.015, LIMBUS + 0.07, theta).mul(float(1).sub(smoothstep(LIMBUS + 0.12, LIMBUS + 0.42, theta)));
    const patches = smoothstep(-0.05, 0.35, mx_fractal_noise_float(d.mul(7).add(seed.mul(1.3)), 3, 2, 0.5));
    const pigment = near.mul(patches).mul(mix(0.45, 1, smoothstep(0.2, 0.8, abs(d.x))));
    const mottle = mx_fractal_noise_float(d.mul(5.5).add(seed), 3, 2, 0.5).mul(0.5).add(0.5);
    return vec4(clamp(pigment, 0, 1), 0, clamp(mottle, 0, 1), 1);
  })();
  material.depthTest = false;
  material.depthWrite = false;
  const quad = new QuadMesh(material);

  let owed = true;
  let currentSeed = Number.NaN;

  return {
    target,
    net,
    quad,
    setSeed(next) {
      if (next === currentSeed) return;
      currentSeed = next;
      seedOffset(next, seed.value as Vector3);
      owed = true;
      drawVesselNet(ctx, netSize, next);
      net.needsUpdate = true;
    },
    redo() {
      owed = true;
    },
    render(renderer) {
      if (!owed) return false;
      owed = false;
      const prev = renderer.getRenderTarget();
      renderer.setRenderTarget(target);
      quad.render(renderer);
      renderer.setRenderTarget(prev);
      return true;
    },
    dispose() {
      target.dispose();
      net.dispose();
      material.dispose();
    },
  };
}
