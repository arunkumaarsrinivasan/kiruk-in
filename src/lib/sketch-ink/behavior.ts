/**
 * SketchInk Human Behavior Layer (v5.1 — perceptual amp + sketchbook hierarchy)
 *
 * Presets + state modifiers live in `config.ts`. This module owns the
 * word-level state machine and the word→behavior mapping.
 *
 * Unit of variation = word (OpenType joins intact inside the word).
 */

import {
  ACTION_PRESETS,
  BEHAVIOR,
  type BehaviorState,
  type SketchAction,
  type SketchHand,
} from './config'
import { PRINT_HOME, SCRIPT_HOME } from './pools'

export type { SketchAction, BehaviorState, SketchHand, SketchMode, LineAlign } from './config'
export { ACTION_PRESETS } from './config'
export type { ActionPreset } from './config'

export interface WordBehavior {
  state: BehaviorState
  paragraphProgress: number
  intensity: number
  angle: number
  font: string
  hand: SketchHand
  scale: number
  opacity: number
  trackingBias: number
}

export interface BehaviorCursor {
  state: BehaviorState
  wordsInPara: number
  paraChars: number
  paraIndex: number
  /** Last word lean (deg) — coherent hand across the paragraph. */
  prevAngle: number | null
  /** Last opacity — stops ink-weight strobing. */
  prevOpacity: number | null
  /** Ideation rush burst remaining (sticky, not per-word coin flip). */
  rushLeft: number
}

export function createBehaviorCursor(): BehaviorCursor {
  return {
    state: 'cold',
    wordsInPara: 0,
    paraChars: 0,
    paraIndex: 0,
    prevAngle: null,
    prevOpacity: null,
    rushLeft: 0,
  }
}

function isCapsWord(word: string): boolean {
  const letters = word.replace(/[^a-zA-Z]/g, '')
  return letters.length >= 2 && letters === letters.toUpperCase()
}

function isLabelWord(word: string): boolean {
  const bare = word.replace(/[^a-zA-Z0-9]/g, '')
  if (!bare || bare.length > 4) return false
  // Short ALL-CAPS or digits only — never "the"/"and"/"with".
  return bare === bare.toUpperCase() || /^\d+$/.test(bare)
}

function isRushWord(word: string): boolean {
  if (isCapsWord(word)) return true
  const bare = word.replace(/[^a-zA-Z0-9.)]/g, '')
  return /^\d+[.)]?$/.test(bare)
}

function hasDoubleLetter(word: string): boolean {
  return /(.)\1/i.test(word.replace(/[^a-zA-Z]/g, ''))
}

export function inferAction(word: string, lineStart: string, explicit?: SketchAction): SketchAction {
  if (explicit) return explicit
  const line = lineStart.trimStart()
  if (/^[-*+]\s+\[[ xX]\]/.test(line) || /^\[[ xX]\]/.test(line)) return 'checklist'
  if (/^\d+[.)]\s/.test(line) || /→|->|⇒|↓/.test(word)) return 'flow'
  return 'type'
}

export function stepBehaviorOnNewline(
  cursor: BehaviorCursor,
  blankLine: boolean,
): BehaviorCursor {
  if (blankLine) {
    return {
      state: 'cold',
      wordsInPara: 0,
      paraChars: 0,
      paraIndex: cursor.paraIndex + 1,
      prevAngle: null,
      prevOpacity: null,
      rushLeft: 0,
    }
  }
  return {
    ...cursor,
    state: cursor.state === 'fatigue' ? 'settle' : cursor.state,
    // Soft break keeps the lean so the next line still feels like the same hand.
  }
}

export function behaviorForWord(
  word: string,
  cursor: BehaviorCursor,
  rng: () => number,
  baseIntensity: number,
  action: SketchAction,
  modeHand: SketchHand | 'auto',
): { behavior: WordBehavior; next: BehaviorCursor } {
  const preset = ACTION_PRESETS[action]
  const B = BEHAVIOR
  let state = cursor.state
  let wordsInPara = cursor.wordsInPara
  let paraChars = cursor.paraChars

  let rushLeft = cursor.rushLeft

  if (isRushWord(word) && action !== 'checklist') {
    state = wordsInPara < B.coldRushMinWords && state === 'cold' ? 'cold' : 'rush'
    rushLeft = 0
  } else if (action === 'ideation' && wordsInPara > 0) {
    if (wordsInPara < B.ideationRushWords) {
      state = 'cold'
      rushLeft = 0
    } else if (rushLeft > 0) {
      state = 'rush'
      rushLeft -= 1
    } else if (rng() < B.ideationRushChance) {
      state = 'rush'
      rushLeft = Math.max(0, B.ideationRushBurst - 1)
    } else {
      state = 'settle'
      rushLeft = 0
    }
  } else if (wordsInPara === 0) {
    state = 'cold'
    rushLeft = 0
  } else if (wordsInPara < B.settleMaxWords) {
    state = state === 'cold' ? 'settle' : state === 'rush' ? 'settle' : state
    rushLeft = 0
  } else if (paraChars > B.fatigueChars || wordsInPara > B.fatigueWords) {
    state = 'fatigue'
    rushLeft = 0
  } else if (state === 'rush') {
    state = 'settle'
    rushLeft = 0
  }

  const paraProgress = Math.min(1, paraChars / B.progressDenom)
  const stateMul = B.stateMul[state]
  const progressMul = 1 + paraProgress * (state === 'fatigue' ? B.progressMulFatigue : B.progressMulOther)
  let intensity = Math.min(B.intensityClamp, baseIntensity * preset.intensityMul * stateMul * progressMul)
  if (hasDoubleLetter(word)) intensity = Math.min(B.intensityClampDouble, intensity * B.doubleLetterBoost)

  // Hierarchy: CAPS / checklist / diagram labels → print (sketchbook rule)
  let hand: SketchHand =
    modeHand === 'auto'
      ? isCapsWord(word) || preset.preferPrint
        ? 'print'
        : 'script'
      : modeHand

  if (isCapsWord(word)) hand = 'print'
  if (action === 'title' || action === 'checklist') hand = 'print'
  if (action === 'diagram' && (isCapsWord(word) || isLabelWord(word))) hand = 'print'
  if (action === 'flow' && (/^\d+$/.test(word.replace(/[.)]/g, '')) || isCapsWord(word))) {
    hand = 'print'
  }
  if (action === 'ideation' && !isCapsWord(word)) hand = 'script'
  if (modeHand === 'print') hand = 'print'
  if (modeHand === 'script' && !isCapsWord(word) && action !== 'checklist' && action !== 'title') {
    hand = 'script'
  }

  const font = hand === 'print' ? PRINT_HOME : SCRIPT_HOME
  // Phase 4: home only. Letter chaos belongs in Kiruk `calt`.

  // Target lean from action + state, then blend toward previous word.
  const targetAngle =
    preset.baseAngle +
    (rng() * 2 - 1) * preset.angleJitter * Math.max(0.55, intensity) +
    B.angleOffset[state] +
    (state === 'fatigue' ? -paraProgress * B.fatigueAngleProgressMul : 0) +
    (hand === 'print' ? B.printAngleOffset : 0)

  const follow = B.angleFollow
  const angle =
    cursor.prevAngle == null
      ? targetAngle
      : cursor.prevAngle * follow + targetAngle * (1 - follow)

  const scale =
    1 +
    B.scaleOffset[state] +
    (rng() * 2 - 1) * preset.scaleJitter * intensity +
    (hand === 'print' && isCapsWord(word) ? B.printCapsScaleBoost : 0) +
    // Phase 7: double / long words get tiny optical micro-scale (same face).
    (hasDoubleLetter(word) ? (rng() * 2 - 1) * 0.022 : 0) +
    (word.length >= 9 ? (rng() * 2 - 1) * 0.014 : 0)

  const targetOpacity = Math.min(
    B.opacityMax,
    preset.opacityFloor +
      rng() * (B.opacityMax - preset.opacityFloor) * 0.35 +
      (state === 'settle' ? 0.04 : 0) -
      (state === 'fatigue' ? B.fatigueOpacityBase + paraProgress * B.fatigueOpacityProgressMul : 0),
  )
  const opacityFollow = B.opacityFollow
  const opacity =
    cursor.prevOpacity == null
      ? targetOpacity
      : cursor.prevOpacity * opacityFollow + targetOpacity * (1 - opacityFollow)

  wordsInPara += 1
  paraChars += word.length + 1

  const clampedOpacity = Math.max(B.opacityMin, Math.min(B.opacityMax, opacity))

  // Phase 7: word-start / end tracking bias within one face (no font roulette).
  let trackingBias = preset.trackingBias
  if (cursor.wordsInPara === 0) trackingBias += 0.012
  if (word.length >= 8) trackingBias += (rng() * 2 - 1) * 0.01
  if (hasDoubleLetter(word)) trackingBias += hand === 'script' ? -0.01 : 0.008

  return {
    behavior: {
      state,
      paragraphProgress: paraProgress,
      intensity,
      angle,
      font,
      hand,
      scale: Math.max(B.scaleMin, Math.min(B.scaleMax, scale)),
      opacity: clampedOpacity,
      trackingBias,
    },
    next: {
      state,
      wordsInPara,
      paraChars,
      paraIndex: cursor.paraIndex,
      prevAngle: angle,
      prevOpacity: clampedOpacity,
      rushLeft,
    },
  }
}

/** Dev stats for SketchInkDebug chip. */
export function summarizeRuns(
  runs: Array<{ hand: string; font: string; jitter: { angle: number } }>,
): { printPct: number; scriptPct: number; fonts: string[]; meanSkew: number; wordCount: number } {
  const words = runs.filter((r) => r.hand === 'print' || r.hand === 'script')
  const print = words.filter((r) => r.hand === 'print').length
  const script = words.filter((r) => r.hand === 'script').length
  const n = Math.max(1, words.length)
  const fonts = [...new Set(words.map((r) => r.font))]
  const meanSkew = words.reduce((a, r) => a + r.jitter.angle, 0) / n
  return {
    printPct: Math.round((print / n) * 100),
    scriptPct: Math.round((script / n) * 100),
    fonts,
    meanSkew: Math.round(meanSkew * 10) / 10,
    wordCount: words.length,
  }
}
