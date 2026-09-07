import type { CSSProperties } from 'react'
import { JITTER, LINE, MATERIAL, type SketchHand } from './config'
import type { WordBehavior } from './behavior'
import type { ObstacleBox } from '@/lib/ink'

/**
 * Perceptual word wobble on top of coherent paragraph lean.
 *
 * Phase 5: micro-rotate / Y share the lean sign so axes feel like one hand,
 * not independent slot-machine noise. Caps live in `config.ts` (JITTER).
 */

export interface RunJitter {
  rotate: number
  translateY: number
  letterSpacing: number
  opacity: number
  scale: number
  angle: number
  /** Phase 7 — text-shadow bleed multiplier from behavior state. */
  pressure: number
}

export type PaintDamp = {
  scale: number
  track: number
  y: number
  rot: number
}

/** True when a line band intersects any obstacle AABB. */
export function bandTouchesObstacle(
  topEm: number,
  heightEm: number,
  obstacles: ObstacleBox[] | undefined | null,
): boolean {
  if (!obstacles?.length) return false
  const bot = topEm + heightEm
  return obstacles.some((o) => o.yEm < bot && o.yEm + o.hEm > topEm)
}

/** Soft body damp, or ink damp only on bands that touch doodles. */
export function paintDampForBand(
  topEm: number,
  obstacles: ObstacleBox[] | undefined | null,
): PaintDamp {
  return bandTouchesObstacle(topEm, LINE.height, obstacles) ? JITTER.dampInk : JITTER.dampSoft
}

/** Apply paint damp to a run jitter (shared by Surface + flow SketchInk). */
export function dampRunJitter(j: RunJitter, damp: PaintDamp, fitScale = 1): RunJitter {
  return {
    ...j,
    scale: (1 + (j.scale - 1) * damp.scale) * fitScale,
    letterSpacing: j.letterSpacing * damp.track,
    translateY: j.translateY * damp.y,
    rotate: j.rotate * damp.rot,
  }
}

export function jitterFromBehavior(
  rng: () => number,
  hand: SketchHand,
  b: WordBehavior,
): RunJitter {
  const J = JITTER
  const amp = Math.min(J.ampMax, Math.max(J.ampMin, b.intensity))
  const rotCap = J.rotCap[hand]
  const yCap = J.yCap[hand]
  const leanSign = b.angle === 0 ? (rng() > 0.5 ? 1 : -1) : Math.sign(b.angle)
  const share = J.leanShare

  const rotIndep = (rng() * 2 - 1) * rotCap * amp * J.rotAmpMul
  const rotLean = leanSign * Math.abs(rotIndep) * share
  const rotate = rotLean + rotIndep * (1 - share)

  const yIndep = (rng() * 2 - 1) * yCap * amp
  const yLean = leanSign * Math.abs(yIndep) * share * 0.65
  const translateY = Math.max(
    -J.translateYClamp,
    Math.min(J.translateYClamp, yLean + yIndep * (1 - share)),
  )

  return {
    rotate,
    translateY,
    letterSpacing:
      (b.trackingBias ?? J.defaultTracking[hand]) +
      (rng() * 2 - 1) * J.trackingJitter[hand] * amp,
    opacity: b.opacity,
    scale: b.scale,
    angle: b.angle,
    pressure: J.pressureBleed[b.state] ?? 1,
  }
}

export function runStyle(
  j: RunJitter,
  hand: SketchHand,
  fontScale: number,
  opts?: { flow?: boolean; absolute?: boolean },
): CSSProperties {
  const M = MATERIAL
  const pressure = j.pressure ?? 1
  const bleedPct =
    hand === 'script'
      ? Math.round(
          (M.bleedScriptFloor + (1 - j.opacity) * M.bleedScriptRange) * pressure,
        )
      : Math.round(M.bleedPrint * pressure)
  const bleed =
    hand === 'script'
      ? `0 0 0.4px color-mix(in srgb, currentColor ${bleedPct}%, transparent)`
      : `0 0 0.28px color-mix(in srgb, currentColor ${bleedPct}%, transparent)`

  const flow = opts?.flow === true
  const absolute = opts?.absolute === true

  const transform = absolute
    ? `translateY(${j.translateY}em) skewX(${j.angle}deg) rotate(${j.rotate}deg)`
    : `skewX(${j.angle}deg) rotate(${j.rotate}deg)`

  return {
    display: flow ? 'inline' : 'inline-block',
    verticalAlign: 'baseline',
    ...(absolute
      ? {}
      : {
          position: 'relative' as const,
          top: `${j.translateY}em`,
        }),
    fontSize: `${fontScale * j.scale}em`,
    letterSpacing: `${j.letterSpacing}em`,
    opacity: j.opacity,
    // dlig/rlig no-op on OFL faces; ready for Kiruk / richer OFL.
    fontFeatureSettings: '"calt" 1, "liga" 1, "kern" 1, "dlig" 1, "rlig" 1',
    fontVariantLigatures: 'common-ligatures contextual discretionary-ligatures',
    transform,
    transformOrigin: '50% 80%',
    textShadow: bleed,
    color: 'currentColor',
  }
}

export function stepLineFatigue(current: number): number {
  return current
}
