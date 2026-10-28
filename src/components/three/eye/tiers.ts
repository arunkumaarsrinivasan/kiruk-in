/**
 * Quality tiers for the TSL eye. The tier is chosen once, before anything
 * compiles, because a tier decides the shape of the node graphs. At runtime
 * the watchdog may only lower the pixel ratio and pass resolutions, never
 * rebuild a graph (a rebuild is a visible hitch in the middle of a sweep).
 *
 * T0 is the poster: no shader at all.
 */

import { eyeEnv } from "./env";

export type EyeTier = 0 | 1 | 2 | 3;

export interface TierSpec {
  label: string;
  irisBake: number;
  /**
   * The iris's relief march (bake/iris.ts IrisMarch): linear steps, a secant
   * refine of each layer's crossing, steps toward the light. T1 keeps a single parallax step.
   */
  irisMarch: { linear: number; refine: number; shadow: number };
  lashesUpper: number;
  lashesLower: number;
  /** Brow hairs drawn into the brow's map, and the map's width (bake/brow.ts). */
  browHairs: number;
  browRes: number;
  tearFilm: "static" | "sim128" | "sim256";
  dof: "off" | "half" | "full";
  bloomMips: number;
  purkinje: "off" | "p4" | "all";
  msaa: boolean;
  /** FXAA on the tonemapped frame, before the grain (R14). Off on every tier: it softened the
   * lashes and the iris's fibres, and the user saw the eye go blurry (2026-10-28). */
  fxaa: boolean;
  dprCap: number;
}

export const TIERS: Record<Exclude<EyeTier, 0>, TierSpec> = {
  1: {
    label: "T1 low",
    irisBake: 512,
    irisMarch: { linear: 0, refine: 0, shadow: 0 },
    lashesUpper: 120,
    lashesLower: 50,
    browHairs: 440,
    browRes: 1024,
    tearFilm: "static",
    dof: "off",
    bloomMips: 3,
    purkinje: "off",
    msaa: false,
    fxaa: false,
    dprCap: 1,
  },
  2: {
    label: "T2 standard",
    irisBake: 1024,
    irisMarch: { linear: 6, refine: 1, shadow: 2 },
    lashesUpper: 190,
    lashesLower: 110,
    browHairs: 920,
    browRes: 1536,
    tearFilm: "sim128",
    dof: "half",
    bloomMips: 5,
    purkinje: "p4",
    msaa: false,
    fxaa: false,
    dprCap: 1.5,
  },
  3: {
    label: "T3 high",
    irisBake: 2048,
    irisMarch: { linear: 10, refine: 2, shadow: 3 },
    lashesUpper: 250,
    lashesLower: 150,
    browHairs: 1240,
    browRes: 2048,
    tearFilm: "sim256",
    dof: "full",
    bloomMips: 5,
    purkinje: "all",
    msaa: true,
    fxaa: false,
    dprCap: 2,
  },
};

export interface TierSignals {
  /** The renderer came up on the WebGPU backend, not WebGL2. */
  webgpu: boolean;
  /** navigator.deviceMemory, in GB, where the browser reports it. */
  deviceMemory?: number;
  cores?: number;
  /** A finger, not a cursor: almost always a phone or tablet GPU. */
  coarse: boolean;
  saveData: boolean;
}

/**
 * A first guess from what the browser will say without asking. P0 measures
 * real frame costs on the device matrix and these thresholds move with them.
 */
export function pickTier(s: TierSignals): EyeTier {
  if (s.saveData) return 0;
  if (!s.webgpu) return 1;
  if (s.coarse || (s.deviceMemory ?? 8) <= 4) return 2;
  if ((s.cores ?? 4) >= 8 && (s.deviceMemory ?? 8) >= 8) return 3;
  return 2;
}

export function readTierSignals(webgpu: boolean): TierSignals {
  if (typeof navigator === "undefined") {
    return { webgpu, coarse: false, saveData: false };
  }
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return {
    webgpu,
    deviceMemory: nav.deviceMemory,
    cores: nav.hardwareConcurrency,
    coarse: eyeEnv().coarse(),
    saveData: nav.connection?.saveData === true,
  };
}

/** Fragments the eye may shade per frame before quality gives way. */
export const PIXEL_BUDGET = 2_000_000;
export const DPR_MIN = 0.7;

/** Device pixel ratio that keeps the stage inside its fragment budget. */
export function budgetDpr(cap: number): number {
  const view = eyeEnv().viewport();
  const css = Math.max(view.width * view.height, 1);
  const fit = Math.sqrt(PIXEL_BUDGET / css);
  const device = view.dpr;
  return Math.max(DPR_MIN, Math.min(cap, device, fit));
}
