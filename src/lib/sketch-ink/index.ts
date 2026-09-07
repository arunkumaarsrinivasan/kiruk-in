import type { SketchHand, SketchMode } from './config'
import { opticalScale, SCRIPT_HOME } from './pools'
import { jitterFromBehavior, type RunJitter } from './jitter'
import { createRng, hashSeed } from './seed'
import { tokenize } from './tokenize'
import {
  behaviorForWord,
  createBehaviorCursor,
  inferAction,
  stepBehaviorOnNewline,
  type SketchAction,
  type BehaviorState,
} from './behavior'

export interface SketchRun {
  text: string
  hand: SketchHand
  font: string
  jitter: RunJitter
  fontScale: number
  kind: 'word' | 'space' | 'newline'
  startOffset: number
  state?: BehaviorState
  key: string
}

const ZERO_JITTER: RunJitter = {
  pressure: 1,
  rotate: 0,
  translateY: 0,
  letterSpacing: 0,
  opacity: 1,
  scale: 1,
  angle: 0,
}

/**
 * Word-level shaped runs + Human Behavior Layer (v5).
 * Joins intact inside each word; angle/face/intensity change between words & actions.
 */
export function layoutSketchInk(
  text: string,
  mode: SketchMode = 'auto',
  intensity = 0.85,
  seedKey = '',
  action: SketchAction = 'type',
): SketchRun[] {
  const graphemes = tokenize(text)
  const runs: SketchRun[] = []
  let cursor = createBehaviorCursor()
  let i = 0
  let codeOffset = 0
  let blankPending = false
  let lineBuf = ''

  const modeHand: SketchHand | 'auto' = mode === 'auto' ? 'auto' : mode

  while (i < graphemes.length) {
    const g = graphemes[i] ?? ''

    if (g === '\n') {
      const nextIsNl = graphemes[i + 1] === '\n'
      cursor = stepBehaviorOnNewline(cursor, blankPending || nextIsNl)
      blankPending = true
      lineBuf = ''
      runs.push({
        text: '\n',
        hand: 'script',
        font: SCRIPT_HOME,
        jitter: ZERO_JITTER,
        fontScale: 1,
        kind: 'newline',
        startOffset: codeOffset,
        key: `nl-${codeOffset}`,
      })
      codeOffset += 1
      i++
      continue
    }

    blankPending = false

    if (/^\s$/.test(g)) {
      lineBuf += g
      runs.push({
        text: ' ',
        hand: 'script',
        font: SCRIPT_HOME,
        jitter: ZERO_JITTER,
        fontScale: 1,
        kind: 'space',
        startOffset: codeOffset,
        key: `sp-${codeOffset}`,
      })
      codeOffset += g.length
      i++
      continue
    }

    let word = ''
    const wordStart = codeOffset
    while (i < graphemes.length) {
      const c = graphemes[i] ?? ''
      if (c === '\n' || /^\s$/.test(c)) break
      word += c
      codeOffset += c.length
      i++
    }

    const resolvedAction = inferAction(word, lineBuf, action)
    lineBuf += word
    const rng = createRng(hashSeed(`v5:${mode}:${intensity.toFixed(2)}:${seedKey}:${resolvedAction}:@${wordStart}`))
    const { behavior, next } = behaviorForWord(word, cursor, rng, intensity, resolvedAction, modeHand)
    cursor = next

    runs.push({
      text: word,
      hand: behavior.hand,
      font: behavior.font,
      jitter: jitterFromBehavior(rng, behavior.hand, behavior),
      fontScale: opticalScale(behavior.font),
      kind: 'word',
      startOffset: wordStart,
      state: behavior.state,
      key: `w-${wordStart}`,
    })
  }

  return runs
}

export type { SketchMode, SketchHand, SketchAction, BehaviorState, LineAlign } from './config'
export { ACTION_PRESETS, inferAction, summarizeRuns } from './behavior'
export {
  PRINT_FONTS,
  SCRIPT_FONTS,
  PRINT_HOME,
  PRINT_EMPHASIS,
  SCRIPT_HOME,
  FALLBACK_FONT,
  USE_KIRUK_HAND,
  poolFor,
  opticalScale,
  homeFont,
  faceForRun,
  handFontFamily,
} from './pools'
export { SKETCH_CONFIG, INLINE_INK, LINE, MATERIAL, JITTER, BEHAVIOR, measureFontForAction } from './config'
export {
  layoutPretext,
  atomize,
  breakLines,
  createMeasurementCache,
  stubMeasure,
  measureAdvance,
  type PretextLayout,
  type LineBox,
  type LineItem,
  type MeasuredAtom,
  type MeasuredGlyph,
  type MeasurementCache,
  type MeasureFn,
  type LayoutPretextOptions,
  type PaintMetricsAt,
  type WordPaintMetrics,
  type FlowArrow,
  type PaintedFlowArrow,
  type ObstacleBox,
  freeSegments,
  packLinesWithObstacles,
  softBreakLongAtoms,
} from './pretext'
export {
  packTextAroundObstacles,
  canUseChenglouPretext,
  minUsefulStubEm,
  usefulFreeSegments,
  slotsForBand,
} from './pretextEngine'
export {
  SENTINEL,
  itemsToSentinelDraft,
  inksFromItems,
  sentinelDraftToItems,
  sentinelBases,
  insertInkAt,
  draftHasInk,
  type InkInlineItem,
} from './inlineSentinel'
export {
  tokenize,
  graphemeOffsets,
  handForWord,
  detectHand,
  codeUnitToGrapheme,
  graphemeToCodeUnit,
} from './tokenize'
