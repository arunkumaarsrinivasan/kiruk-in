/**
 * SketchInk configuration — the single tunable foundation.
 *
 * Every font, spacing, behavior, jitter, line, and ink-inline knob lives here.
 * Other modules (pools.ts, behavior.ts, jitter.ts, pretext.ts) read from this
 * instead of defining their own constants. Finetune the whole hand here.
 *
 * Sections:
 *   1. Hand fonts (OFL interim + Kiruk toggle)
 *   2. Optical scales per face
 *   3. Action presets (per-sketchnote-action behavior)
 *   4. Behavior state multipliers + modifiers
 *   5. Jitter caps (rotate / translateY / tracking)
 *   6. Line + alignment defaults
 *   7. Inline ink sizing
 *   8. Paper + ink material
 */

export type SketchHand = 'print' | 'script'
export type SketchMode = SketchHand | 'auto'

export type SketchAction =
  | 'type'
  | 'ideation'
  | 'flow'
  | 'diagram'
  | 'checklist'
  | 'title'
  | 'excerpt'

export type BehaviorState = 'cold' | 'settle' | 'fatigue' | 'rush'

export type LineAlign = 'left' | 'center' | 'right' | 'justify'

/* -------------------------------------------------------------------------- */
/* 1. Hand fonts                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Flip `KIRUK_HAND_READY` (or set NEXT_PUBLIC_USE_KIRUK_HAND=true) once
 * `public/fonts/KirukPrint.woff2` + `KirukScript.woff2` exist.
 * CSS surfaces read `data-kiruk-hand` so vars track this flag end-to-end.
 */
const KIRUK_HAND_READY = false
export const USE_KIRUK_HAND =
  process.env.NEXT_PUBLIC_USE_KIRUK_HAND === 'true' || KIRUK_HAND_READY

export const KIRUK_PRINT = 'KirukPrint'
export const KIRUK_SCRIPT = 'KirukScript'

/** Interim OFL homes — one print + one script until Kiruk ships. */
export const OFL_PRINT = 'Architects Daughter'
export const OFL_SCRIPT = 'Nothing You Could Do'

export const PRINT_HOME = USE_KIRUK_HAND ? KIRUK_PRINT : OFL_PRINT
/** Same as home — no second print face (Rock Salt removed; vibe + measure). */
export const PRINT_EMPHASIS = PRINT_HOME
/** Connected cursive body hand. */
export const SCRIPT_HOME = USE_KIRUK_HAND ? KIRUK_SCRIPT : OFL_SCRIPT

/** One face per hand — multi-face sprinkle broke measure≠paint + one-hand vibe. */
export const PRINT_FONTS: readonly string[] = [PRINT_HOME]
export const SCRIPT_FONTS: readonly string[] = [SCRIPT_HOME]

export const FALLBACK_FONT = OFL_SCRIPT

/** Measure/paint home for an action (print kit for title/checklist/diagram). */
export function measureFontForAction(action: SketchAction): string {
  return ACTION_PRESETS[action]?.preferPrint ? PRINT_HOME : SCRIPT_HOME
}

/* -------------------------------------------------------------------------- */
/* 2. Optical scales (per-face em multiplier)                                */
/* -------------------------------------------------------------------------- */

/** Keep near 1.0 so measure≈paint and dual-hand sizes match. */
export const FONT_OPTICAL_SCALE: Record<string, number> = {
  [OFL_PRINT]: 1.0,
  [OFL_SCRIPT]: 1.0,
  [KIRUK_PRINT]: 1.0,
  [KIRUK_SCRIPT]: 1.0,
}

/* -------------------------------------------------------------------------- */
/* 3. Action presets                                                          */
/* -------------------------------------------------------------------------- */

export interface ActionPreset {
  intensityMul: number
  /** Base skewX degrees (negative = right-leaning). */
  baseAngle: number
  angleJitter: number
  /** Chance to keep home face — locked at 1 (pools are length-1). */
  homeBias: number
  preferPrint: boolean
  scaleJitter: number
  opacityFloor: number
  trackingBias: number
  /** Default line alignment for this action. */
  align: LineAlign
}

/** Photo-matched presets — one-hand lean; Phase 6 raises visible uncertainty. */
export const ACTION_PRESETS: Record<SketchAction, ActionPreset> = {
  type: {
    intensityMul: 1.12,
    baseAngle: -2.9,
    angleJitter: 0.98,
    homeBias: 1,
    preferPrint: false,
    scaleJitter: 0.042,
    opacityFloor: 0.82,
    trackingBias: -0.014,
    align: 'left',
  },
  ideation: {
    intensityMul: 1.22,
    baseAngle: -3.6,
    angleJitter: 1.2,
    homeBias: 1,
    preferPrint: false,
    scaleJitter: 0.055,
    opacityFloor: 0.78,
    trackingBias: -0.018,
    align: 'left',
  },
  flow: {
    intensityMul: 1.06,
    baseAngle: -1.8,
    angleJitter: 0.7,
    homeBias: 1,
    preferPrint: false,
    scaleJitter: 0.038,
    opacityFloor: 0.84,
    trackingBias: -0.01,
    align: 'left',
  },
  diagram: {
    intensityMul: 0.82,
    baseAngle: -0.5,
    angleJitter: 0.42,
    homeBias: 1,
    preferPrint: true,
    scaleJitter: 0.028,
    opacityFloor: 0.9,
    trackingBias: 0.02,
    align: 'center',
  },
  checklist: {
    intensityMul: 0.68,
    baseAngle: -0.3,
    angleJitter: 0.32,
    homeBias: 1,
    preferPrint: true,
    scaleJitter: 0.022,
    opacityFloor: 0.92,
    trackingBias: 0.028,
    align: 'left',
  },
  title: {
    intensityMul: 0.95,
    baseAngle: -1.0,
    angleJitter: 0.55,
    homeBias: 1,
    /** Titles = Hand A print (matches .studio-title / h1 CSS). */
    preferPrint: true,
    scaleJitter: 0.032,
    opacityFloor: 0.88,
    trackingBias: 0.014,
    align: 'center',
  },
  excerpt: {
    intensityMul: 0.9,
    baseAngle: -2.2,
    angleJitter: 0.7,
    homeBias: 1,
    preferPrint: false,
    scaleJitter: 0.032,
    opacityFloor: 0.85,
    trackingBias: -0.01,
    align: 'left',
  },
}

/* -------------------------------------------------------------------------- */
/* 4. Behavior state multipliers + modifiers                                  */
/* -------------------------------------------------------------------------- */

export const BEHAVIOR = {
  /** Intensity multiplier per state — cold/rush express; settle still readable. */
  stateMul: {
    cold: 1.14,
    settle: 0.9,
    fatigue: 1.12,
    rush: 1.18,
  } as Record<BehaviorState, number>,
  /** Fatigue trigger thresholds — sentence length: short stays cold/settle, long leans. */
  fatigueChars: 90,
  fatigueWords: 22,
  /** Paragraph progress denominator (paraChars / this). */
  progressDenom: 180,
  progressMulFatigue: 0.18,
  progressMulOther: 0.07,
  /** Double-letter intensity boost — Phase 7 widens for “not stamped”. */
  doubleLetterBoost: 1.1,
  /** Intensity clamps. */
  intensityClamp: 1.32,
  intensityClampDouble: 1.42,
  /** Scale clamps — keep optical near 1 for measure=paint. */
  scaleMin: 0.94,
  scaleMax: 1.09,
  /** Opacity clamps. */
  opacityMin: 0.78,
  opacityMax: 1,
  /** Per-state scale offsets. */
  scaleOffset: {
    cold: 0.035,
    settle: 0.008,
    fatigue: -0.025,
    rush: 0.04,
  } as Record<BehaviorState, number>,
  /** Per-state angle offsets (added to preset base). */
  angleOffset: {
    cold: 0.35,
    settle: 0,
    fatigue: -0.95,
    rush: -0.55,
  } as Record<BehaviorState, number>,
  fatigueAngleProgressMul: 1.15,
  /** Print hand extra upright offset. */
  printAngleOffset: 0.7,
  /** Print CAPS extra scale. */
  printCapsScaleBoost: 0.03,
  /** Unused while PRINT_EMPHASIS === PRINT_HOME (Phase 4 one-hand). */
  printEmphasisProb: 0,
  /** State transition thresholds. */
  coldRushMinWords: 2,
  ideationRushWords: 4,
  ideationRushChance: 0.26,
  settleMaxWords: 5,
  /** Fatigue opacity penalty grows with progress. */
  fatigueOpacityBase: 0.045,
  fatigueOpacityProgressMul: 0.04,
  /**
   * Blend each word's lean toward the previous word (0 = independent noise,
   * 1 = locked). Real hands don't re-roll slant every word.
   */
  angleFollow: 0.68,
  /** Same idea for ink weight — stops per-word opacity strobing. */
  opacityFollow: 0.62,
  /** Ideation rush sticks for this many words (not a per-word coin flip). */
  ideationRushBurst: 3,
} as const

/* -------------------------------------------------------------------------- */
/* 5. Jitter caps — Phase 6: visible uncertainty, still coherent              */
/* -------------------------------------------------------------------------- */

export const JITTER = {
  /** Intensity amp clamp — settle sits lower; cold/rush still readable. */
  ampMin: 0.45,
  ampMax: 1.15,
  /** Per-hand rotate cap (degrees), scaled by amp * rotAmpMul. */
  rotCap: { print: 1.4, script: 2.2 } as Record<SketchHand, number>,
  /** Per-hand translateY cap (em) — under line collision but visible. */
  yCap: { print: 0.032, script: 0.048 } as Record<SketchHand, number>,
  translateYClamp: 0.052,
  /** Letter-spacing jitter amplitude (em) scaled by amp. */
  trackingJitter: { print: 0.022, script: 0.02 } as Record<SketchHand, number>,
  /** Default tracking bias fallbacks if preset omits one. */
  defaultTracking: { print: 0.02, script: -0.012 } as Record<SketchHand, number>,
  /** Rotate amplitude factor. */
  rotAmpMul: 0.5,
  /**
   * Share of micro-rotate / Y that follows the word lean sign
   * (correlated wobble = one hand, not slot-machine axes).
   */
  leanShare: 0.55,
  /**
   * Paint damp vs raw jitter. Soft = body (Phase 6 shows more hand);
   * ink = bands that touch doodles only.
   */
  dampSoft: { scale: 0.9, track: 0.92, y: 0.92, rot: 0.95 },
  dampInk: { scale: 0.45, track: 0.5, y: 0.45, rot: 0.55 },
  /**
   * Phase 7 — hand-pressure bleed (text-shadow) keyed by behavior state.
   * Higher = heavier ink feel without a second face.
   */
  pressureBleed: {
    cold: 1.15,
    settle: 1.0,
    fatigue: 1.35,
    rush: 1.2,
  } as Record<BehaviorState, number>,
} as const

/* -------------------------------------------------------------------------- */
/* 6. Line + alignment defaults                                               */
/* -------------------------------------------------------------------------- */

export const LINE = {
  /** Base line-height (em) for the sketch surface. */
  height: 1.95,
  /** Mirror field line-height (slightly tighter while editing). */
  fieldHeight: 1.95,
  /** Per-line wobble cap (degrees) scaled by line intensity. Soft — left margin stays readable. */
  lineWobbleCap: 0.7,
  /** Per-line baseline drift cap (em) scaled by fatigue. Applied via transform only. */
  baselineDriftCap: 0.09,
  /** Unused for layout advance (fixed LINE.height); kept for optical experiments. */
  heightWobbleCap: 0,
  /** Soft-path / off-ink band: fraction of perLineWobble applied (Phase 6). */
  softWobbleMul: 0.45,
  /** Greedy line-break extra slack (fraction of container width). */
  breakSlack: 0.02,
  /** Clamp content measure to this width (em) — default readable notebook column. */
  pageWidthEm: 36,
  /** Soft ceiling when Fit unlocks a near full-bleed sheet (measured width wins below this). */
  pageWidthMaxEm: 96,
  /**
   * Horizontal gap between words and sketch obstacle boxes (em).
   * Kept tiny so doodles hug text; vertical uses obstaclePadYEm.
   */
  obstaclePadEm: 0.05,
  /** Explicit Y pad (lighter than X — fewer line bands get punched). */
  obstaclePadYEm: 0.025,
  /**
   * Inset applied when carving free-segment holes so text sits closer to ink
   * than the raw AABB suggests.
   */
  obstacleHugEm: 0.06,
  /** Minimum punched hole width after hug (thin ink still displaces text). */
  minHoleEm: 0.4,
  /** Merge nearby stroke AABBs within this pixel gap (keep tight). */
  clusterGapPx: 3,
  /**
   * Refuse cluster merges whose union area exceeds sum(areas) * ratio
   * (stops hatched cubes from becoming one page-wide canyon).
   */
  maxClusterUnionRatio: 2.35,
  /**
   * Min free-slot width (em). Tuned so ~2 words can sit beside a doodle.
   */
  minStubEm: 1.55,
  /** Also require stubs to be at least this fraction of the page width. */
  minStubFrac: 0.042,
  /**
   * Soft floor: if no stub meets minStub, still pack the widest free slot
   * when it is at least this wide (one short word).
   */
  minStubFloorEm: 1.05,
  /**
   * Both stubs must be at least this wide (em) to enable dual-corridor wrap.
   * Narrower side → single widest only (no orphan 1-word stub).
   */
  minDualStubEm: 3.2,
  minDualStubFrac: 0.1,
  /**
   * Obstacle must cover at least this fraction of the line-band height
   * before it punches a hole (ignores grazing clips).
   */
  minBandOverlapFrac: 0.28,
  /** Ignore speck / stray stroke obstacles smaller than this area (em²). */
  minObstacleAreaEm2: 0.45,
  /**
   * Fraction of page width an obstacle must cover before an empty band
   * jumps past its bottom (else advance toward next useful band).
   */
  fullBlockCoverFrac: 0.78,
  /**
   * Max free corridors packed per line band. 2 = wrap both sides of one
   * mid-page sketch; 3+ scattered stubs still collapse to widest only.
   */
  maxWrapCorridors: 2,
  /**
   * Sticky corridor match tolerance (em). Prefer overlap, else nearest start
   * within this window (stops small AABB jitter from flipping the margin).
   */
  stickyMatchEm: 2.5,
  /**
   * Inflate measured word widths so absolute paint (optical scale + letter-spacing)
   * does not overrun the slots the packer reserved.
   */
  measurePad: 1,
  /** Cap justify stretch per space so short lines do not explode. */
  maxJustifyGapEm: 0.22,
  /** Default alignment when block has none and action has none. */
  defaultAlign: 'left' as LineAlign,
} as const

/* -------------------------------------------------------------------------- */
/* 7. Inline ink sizing                                                       */
/* -------------------------------------------------------------------------- */

export const INLINE_INK = {
  /** Default inline doodle height in em (sits on the baseline). */
  defaultSizeEm: 1.6,
  /** Min/max em height for inline doodles. */
  minSizeEm: 1.0,
  maxSizeEm: 3.0,
  /** Inline ink doc canvas size (doc units) for the mini editor. */
  editorDocWidth: 240,
  editorDocHeight: 120,
  /** Vertical-align for inline ink boxes. */
  verticalAlign: 'baseline' as const,
  /** Extra right padding (em) so ink doesn't kiss the next word. */
  rightPadEm: 0.12,
} as const

/* -------------------------------------------------------------------------- */
/* 8. Paper + ink material                                                    */
/* -------------------------------------------------------------------------- */

export const MATERIAL = {
  inkLine: '#0a0a0a',
  inkLineVar: 'var(--ink-line, #0a0a0a)',
  paperBg: '#ffffff',
  paperGrainOpacity: 0.045,
  /** Text-shadow bleed — Phase 7 pressure channel amplifies further. */
  bleedScriptFloor: 22,
  bleedScriptRange: 28,
  bleedPrint: 22,
} as const

/* -------------------------------------------------------------------------- */
/* Aggregate                                                                  */
/* -------------------------------------------------------------------------- */

export const SKETCH_CONFIG = {
  useKirukHand: USE_KIRUK_HAND,
  fonts: {
    printHome: PRINT_HOME,
    printEmphasis: PRINT_EMPHASIS,
    scriptHome: SCRIPT_HOME,
    print: PRINT_FONTS,
    script: SCRIPT_FONTS,
    fallback: FALLBACK_FONT,
    opticalScale: FONT_OPTICAL_SCALE,
  },
  actions: ACTION_PRESETS,
  behavior: BEHAVIOR,
  jitter: JITTER,
  line: LINE,
  inlineInk: INLINE_INK,
  material: MATERIAL,
} as const

export type SketchConfig = typeof SKETCH_CONFIG
