/**
 * The messages between the page and the worker that draws the eye
 * (docs/EYE_WORKER_PLAN.md, P3). Types only: the page side (EyeStageWorker)
 * imports this without loading three.
 */

import type { EyeStageInfo } from "../EyeStage";
import type { EyeInputEvent } from "../input";
import type { WorkerView } from "../env";
import type { FrameBox } from "../framing";
import type { EyeTier } from "../tiers";
import type { GpuCall } from "./gpu-trace";

/** EyeStage's props, as data: the era by id, no callbacks. */
export interface WorkerSceneProps {
  era: string;
  exiting: boolean;
  reduce: boolean;
  interactive: boolean;
  dprCap: number;
  media?: boolean;
  calm?: boolean;
  covered?: boolean;
  frameBox?: FrameBox;
  tier?: EyeTier;
}

type Spot = { x: number; y: number; r: number };

/** What the loader reads back (EyeLoaderControl's getters), as of the last frame. */
export interface EyeSnapshot {
  iris: Spot;
  centre: Spot;
  pupilMm: number;
}

/** The loader's commands, applied to the stage's control in the worker. */
export type EyeCommand =
  | { name: "holdBlink"; value: number | null }
  | { name: "holdGaze"; target: { x: number; y: number } | null }
  | { name: "travel"; pos: number | null };

/** Lab: what the worker's stage hears and shows (the P2 gate, and 2026's font). */
export interface EyeProbe {
  iris: Spot;
  yaw: number | null;
  emotions: Record<string, number>;
  clock: number;
  /** The worker's own fonts: family and load status. */
  fonts: string[];
}

export type ToEyeWorker =
  | { type: "init"; canvas: OffscreenCanvas; view: WorkerView; size: { width: number; height: number }; hidden: boolean; forceWebGL: boolean; trace: boolean; props: WorkerSceneProps }
  | { type: "props"; props: WorkerSceneProps }
  | { type: "resize"; view: { width: number; height: number; dpr: number }; size: { width: number; height: number } }
  | { type: "input"; event: EyeInputEvent }
  | { type: "command"; command: EyeCommand }
  | { type: "probe" }
  | { type: "gpulog" };

export type FromEyeWorker =
  /** The worker's code has loaded and runs. */
  | { type: "boot" }
  /** The renderer is up on this backend; the scene is building. */
  | { type: "renderer"; backend: EyeStageInfo["backend"] }
  | { type: "ready"; info: EyeStageInfo; snapshot: EyeSnapshot | null }
  | { type: "frame"; snapshot: EyeSnapshot }
  | { type: "fail"; message: string }
  | { type: "probe"; probe: EyeProbe | null }
  | { type: "gpulog"; calls: GpuCall[] };
