/**
 * Smoke test for sketchnote Pretext reflow.
 * Run: npx tsx scripts/smoke-pretext-reflow.ts
 */
import {
  freeSegments,
  packLinesWithObstacles,
  softBreakLongAtoms,
  atomize,
  layoutPretext,
  createMeasurementCache,
  stubMeasure,
} from '../src/lib/sketch-ink/pretext'
import {
  minUsefulStubEm,
  usefulFreeSegments,
  slotsForBand,
} from '../src/lib/sketch-ink/segments'
import { boundsToEm, obstaclesFromInkDoc, createInkDoc, makeDrawStroke } from '../src/lib/ink'
import { LINE, SCRIPT_HOME, PRINT_HOME, PRINT_EMPHASIS, PRINT_FONTS, SCRIPT_FONTS, FONT_OPTICAL_SCALE, USE_KIRUK_HAND, OFL_PRINT, OFL_SCRIPT, ACTION_PRESETS, BEHAVIOR, JITTER, measureFontForAction } from '../src/lib/sketch-ink/config'
import { layoutSketchInk } from '../src/lib/sketch-ink'

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

// 1. Uniform em mapping
{
  const box = { x: 160, y: 80, w: 100, h: 200 }
  const em = boundsToEm(box, 16, 0)
  assert(Math.abs(em.xEm - 10) < 0.01, `xEm expected 10 got ${em.xEm}`)
  console.log('ok: boundsToEm')
}

// 2. freeSegments
{
  const segs = freeSegments(36, 0, 2, [{ xEm: 10, yEm: 0, wEm: 6, hEm: 3 }])
  assert(segs.length === 2, `expected 2 segs got ${segs.length}`)
  console.log('ok: freeSegments')
}

// 3. slotsForBand: 2 stubs wrap both sides; 3+ stay single widest
{
  const two = [
    { start: 0, end: 12 },
    { start: 20, end: 36 },
  ]
  const both = slotsForBand(two)
  assert(both.length === 2 && both[0]!.start === 0 && both[1]!.start === 20, `dual wrap ${JSON.stringify(both)}`)

  const many = [
    { start: 0, end: 3 },
    { start: 8, end: 22 },
    { start: 28, end: 36 },
  ]
  const picked = slotsForBand(many)
  assert(picked.length === 1 && picked[0]!.start === 8, `widest among many ${JSON.stringify(picked)}`)
  console.log('ok: slotsForBand dual(2) / single(3+)')
}

// 4. Packer across many boxes: no word-hop gaps across the page
{
  const cache = createMeasurementCache(stubMeasure)
  const text =
    'Scribbling typically begins around age two and continues until roughly age four forming one of the earliest stages of both drawing and writing.'
  let atoms = atomize([{ kind: 'text', text }], cache, SCRIPT_HOME, 1)
  atoms = softBreakLongAtoms(atoms, 30, cache, SCRIPT_HOME, 1)

  // Several small boxes scattered � previously caused one-word-per-stub gaps
  const obstacles = [
    { xEm: 2, yEm: 0, wEm: 3, hEm: 2 },
    { xEm: 10, yEm: 0, wEm: 3, hEm: 2 },
    { xEm: 18, yEm: 0, wEm: 3, hEm: 2 },
    { xEm: 26, yEm: 0, wEm: 3, hEm: 2 },
  ]
  const packed = packLinesWithObstacles(atoms, 36, obstacles)
  assert(packed.length >= 2, `expected multi-line got ${packed.length}`)

  for (const pl of packed) {
    const words = pl.items.filter((it) => it.kind === 'word')
    for (let i = 1; i < words.length; i++) {
      const prev = words[i - 1]!
      const cur = words[i]!
      const gap = cur.xEm - (prev.xEm + prev.measured.widthEm)
      // Single-corridor packing: only a space-sized gap between words.
      assert(gap < 2.5, `same-line gap too large (${gap.toFixed(1)}em) between "${prev.text}" and "${cur.text}"`)
    }
    for (const it of words) {
      assert(it.xEm >= -0.01, `word left of page: ${it.text}`)
      assert(
        it.xEm + it.measured.widthEm <= 36.2,
        `word past page edge: ${it.text} @ ${it.xEm}+${it.measured.widthEm}`,
      )
    }
  }
  console.log(`ok: packer ${packed.length} lines, tight gaps, in-bounds`)
}

// 5. Soft-break URL
{
  const cache = createMeasurementCache(stubMeasure)
  const url = 'https://www.ukessays.com/essays/education/developmental-roots-of-writing.php'
  let atoms = atomize([{ kind: 'text', text: url }], cache, SCRIPT_HOME, 1)
  atoms = softBreakLongAtoms(atoms, 12, cache, SCRIPT_HOME, 1)
  assert(atoms.length > 1, `expected URL split, got ${atoms.length}`)
  console.log(`ok: soft-break URL`)
}

// 6. layoutPretext budget + page clamp
{
  const t0 = performance.now()
  const layout = layoutPretext(
    [
      {
        kind: 'text',
        text: 'The idea is that writing and drawing both grow from the same early marks without carelessly overlapping sketches. Scribbling begins early.',
      },
    ],
    {
      containerWidthEm: 50,
      font: SCRIPT_HOME,
      fontSizePx: 16,
      obstacles: [
        { xEm: -2, yEm: 0, wEm: 8, hEm: 4 }, // overhang left � must clamp
        { xEm: 30, yEm: 2, wEm: 20, hEm: 3 }, // overhang right
      ],
      seedKey: 'smoke',
    },
  )
  const ms = performance.now() - t0
  assert(layout.containerWidthEm === LINE.pageWidthEm, `width clamp ${layout.containerWidthEm}`)
  for (const line of layout.lines) {
    for (const it of line.items) {
      if (it.kind !== 'word') continue
      assert(it.xEm + it.measured.widthEm <= layout.containerWidthEm + 0.3, 'overflow past column')
    }
  }
  assert(ms < 50, `too slow ${ms.toFixed(1)}ms`)
  console.log(`ok: layoutPretext ${layout.lines.length} lines ${ms.toFixed(2)}ms, no overflow`)
}

// 7. obstaclesFromInkDoc � short mark stays one box
{
  const doc = createInkDoc({ width: 640, height: 400 })
  const stroke = makeDrawStroke('ink', [
    { x: 100, y: 50, p: 0.5 },
    { x: 180, y: 50, p: 0.5 },
    { x: 180, y: 70, p: 0.5 },
    { x: 100, y: 70, p: 0.5 },
  ])
  doc.strokes.push({ ...stroke, id: 's1' })
  const obs = obstaclesFromInkDoc(doc, 16, {
    gapPx: LINE.clusterGapPx,
    padXEm: LINE.obstaclePadEm,
    padYEm: LINE.obstaclePadYEm,
    bandHeightEm: LINE.height,
    maxUnionAreaRatio: LINE.maxClusterUnionRatio,
  })
  assert(obs.length === 1, `expected 1 short obstacle got ${obs.length}`)
  assert(obs[0]!.wEm < 8, `obstacle too wide ${obs[0]!.wEm}`)
  assert(obs[0]!.hEm < 3, `short obstacle too tall ${obs[0]!.hEm}`)
  console.log(`ok: obstacles padX=${LINE.obstaclePadEm} padY=${LINE.obstaclePadYEm} gap=${LINE.clusterGapPx}`)
}

// 8. usefulFreeSegments + grazing + dual gate
{
  const min = minUsefulStubEm(36)
  assert(min >= LINE.minStubEm, `min ${min}`)
  const u = usefulFreeSegments(36, 0, LINE.height, [{ xEm: 1, yEm: 0, wEm: 2, hEm: 2 }])
  assert(u.length >= 1, 'expected free space')

  // Grazing: obstacle barely clips band ? no hole ? full-width free.
  const grazed = freeSegments(36, 2, LINE.height, [
    { xEm: 10, yEm: 2 + LINE.height - 0.1, wEm: 8, hEm: 3 },
  ])
  assert(
    grazed.length === 1 && grazed[0]!.end - grazed[0]!.start > 30,
    `grazing should not punch hole ${JSON.stringify(grazed)}`,
  )

  // Centered mark with two wide stubs ? dual wrap.
  const beside = usefulFreeSegments(36, 0, LINE.height, [
    { xEm: 14, yEm: 0, wEm: 4, hEm: LINE.height },
  ])
  assert(beside.length === 2, `expected 2 stubs beside centered mark got ${beside.length}`)
  assert(slotsForBand(beside).length === 2, 'expected dual corridors')

  // Off-center mark leaves a skinny left stub ? collapse to widest only (no orphan word).
  const orphan = usefulFreeSegments(36, 0, LINE.height, [
    { xEm: 2.5, yEm: 0, wEm: 2, hEm: LINE.height },
  ])
  assert(orphan.length === 1, `expected single corridor for orphan stub got ${orphan.length}`)
  assert(orphan[0]!.start > 2, `should keep right corridor ${JSON.stringify(orphan)}`)
  console.log(`ok: minUsefulStubEm=${min.toFixed(2)} grazing+dual-gate`)
}

// 9. Diagonal slash � band-sliced, not one full-height canyon
{
  const doc = createInkDoc({ width: 640, height: 400 })
  const slash = makeDrawStroke('ink', [
    { x: 80, y: 20, p: 0.5 },
    { x: 200, y: 280, p: 0.5 },
  ])
  doc.strokes.push({ ...slash, id: 'slash' })
  const obs = obstaclesFromInkDoc(doc, 16, {
    gapPx: LINE.clusterGapPx,
    padXEm: LINE.obstaclePadEm,
    padYEm: LINE.obstaclePadYEm,
    bandHeightEm: LINE.height,
    maxUnionAreaRatio: LINE.maxClusterUnionRatio,
  })
  assert(obs.length >= 2, `expected band slices for tall slash got ${obs.length}`)
  // No single slice should span the full diagonal AABB width (~7.5em+).
  const maxW = Math.max(...obs.map((o) => o.wEm))
  assert(maxW < 6.5, `band slice too wide (canyon) ${maxW}`)

  // Mid band: hole should be local, leaving a wide free corridor.
  const midY = obs[Math.floor(obs.length / 2)]!.yEm
  const free = freeSegments(36, midY, LINE.height, obs)
  const widest = Math.max(...free.map((s) => s.end - s.start))
  assert(widest > 20, `expected wide free corridor beside slash got ${widest}`)
  console.log(`ok: diagonal band-slice n=${obs.length} maxW=${maxW.toFixed(2)}`)
}

// 10. Phase 2 � measure = paint
{
  const cache = createMeasurementCache(stubMeasure)
  const text = 'Hello CAPS world'
  const paintMetricsAt = (_itemIndex: number, _charStart: number, word: string) => {
    if (word === 'CAPS') {
      return { font: 'Architects Daughter', scale: 1.05, letterSpacing: 0.02 }
    }
    return { font: SCRIPT_HOME, scale: 1, letterSpacing: -0.01 }
  }
  const atoms = atomize([{ kind: 'text', text }], cache, SCRIPT_HOME, 1, paintMetricsAt)
  const words = atoms.filter((a) => a.kind === 'word')
  assert(words.length === 3, `expected 3 words got ${words.length}`)
  const caps = words.find((w) => w.text === 'CAPS')!
  // CAPS: glyph*scale + tracking*optical*scale*gaps
  const bareCaps = stubMeasure('CAPS', SCRIPT_HOME, 1).widthEm
  const expectedCaps = bareCaps * 1.05 + 0.02 * 1.0 * 1.05 * 3
  assert(
    Math.abs(caps.measured.widthEm - expectedCaps) < 0.02,
    `CAPS advance ${caps.measured.widthEm} expected�${expectedCaps}`,
  )

  const layout = layoutPretext([{ kind: 'text', text }], {
    containerWidthEm: 36,
    font: SCRIPT_HOME,
    paintMetricsAt,
    align: 'justify',
    seedKey: 'p2',
  })
  assert(layout.lines[0]?.align === 'left', `justify must pin left got ${layout.lines[0]?.align}`)
  for (const line of layout.lines) {
    const items = line.items.filter((it) => it.kind === 'word' || it.kind === 'space')
    for (let i = 1; i < items.length; i++) {
      const prev = items[i - 1]!
      const cur = items[i]!
      const expected = prev.xEm + prev.measured.widthEm + (prev.stretchEm ?? 0)
      assert(
        Math.abs(cur.xEm - expected) < 0.05,
        `advance gap: ${prev.text}?${cur.text} x=${cur.xEm} expected�${expected}`,
      )
    }
  }
  console.log('ok: phase2 measure=paint + justify pin + advance chain')
}

// 11. Phase 3 � fixed height step + sticky corridor + soft wobble only
{
  // Sticky (3+ stubs): keep prior unless another is clearly wider.
  const many = [
    { start: 0, end: 14 },
    { start: 16, end: 22 },
    { start: 24, end: 36 },
  ]
  const sticky = slotsForBand(many, 24)
  assert(sticky.length === 1 && sticky[0]!.start === 24, `sticky keep right ${JSON.stringify(sticky)}`)

  const yieldWide = slotsForBand(many, 16)
  assert(yieldWide.length === 1 && yieldWide[0]!.start === 0, `sticky yield to dominant ${JSON.stringify(yieldWide)}`)

  // Dual: sticky on left ? both; sticky on right ? alone (no left-margin thrash).
  const dualSegs = [
    { start: 0, end: 12 },
    { start: 20, end: 36 },
  ]
  const dualLeft = slotsForBand(dualSegs, 0)
  assert(dualLeft.length === 2, `dual when sticky is left got ${dualLeft.length}`)
  const dualRight = slotsForBand(dualSegs, 20)
  assert(
    dualRight.length === 1 && dualRight[0]!.start === 20,
    `sticky-right dual must not open left ${JSON.stringify(dualRight)}`,
  )

  const text =
    'Writing and drawing both grow from the same early marks. Scribbling begins early and keeps going for a while.'
  const withInk = layoutPretext([{ kind: 'text', text }], {
    containerWidthEm: 36,
    font: SCRIPT_HOME,
    obstacles: [
      { xEm: 14, yEm: LINE.height, wEm: 4, hEm: LINE.height },
    ],
    seedKey: 'p3-ink',
    fatigue: 1,
  })
  assert(withInk.lines.length >= 2, `expected multi-line beside ink got ${withInk.lines.length}`)
  for (let i = 0; i < withInk.lines.length; i++) {
    const line = withInk.lines[i]!
    assert(line.heightEm === LINE.height, `obstacle line height ${line.heightEm}`)
    const touches =
      line.topEm < LINE.height * 2 && line.topEm + LINE.height > LINE.height
    if (touches) {
      assert(line.rotateDeg === 0, `touching band rotate must be 0 got ${line.rotateDeg}`)
      assert(line.baselineShiftEm === 0, `touching band drift must be 0 got ${line.baselineShiftEm}`)
    }
    if (i > 0) {
      const prev = withInk.lines[i - 1]!
      const step = line.topEm - prev.topEm
      assert(
        Math.abs(step - LINE.height) < 0.01 || step >= LINE.height - 0.01,
        `line step cliff ${step} (prev top ${prev.topEm} ? ${line.topEm})`,
      )
    }
  }

  // Title action ? center (align not forced left).
  const titled = layoutPretext([{ kind: 'text', text: 'Hello title' }], {
    containerWidthEm: 36,
    font: SCRIPT_HOME,
    action: 'title',
    seedKey: 'p3-title',
  })
  assert(titled.lines[0]?.align === 'center', `title align center got ${titled.lines[0]?.align}`)
  assert((titled.lines[0]?.items[0]?.xEm ?? 0) > 1, `title should inset from left`)

  // Empty newline keeps a caret anchor.
  const blank = layoutPretext([{ kind: 'text', text: 'a\n\nb' }], {
    containerWidthEm: 36,
    font: SCRIPT_HOME,
    obstacles: [{ xEm: 20, yEm: 0, wEm: 4, hEm: LINE.height * 4 }],
    seedKey: 'p3-blank',
  })
  const emptyLine = blank.lines.find((l) => l.usedWidthEm === 0)
  assert(emptyLine != null && emptyLine.items.length > 0, 'empty line needs caret anchor')

  const soft = layoutPretext([{ kind: 'text', text }], {
    containerWidthEm: 36,
    font: SCRIPT_HOME,
    seedKey: 'p3-soft',
    fatigue: 1,
  })
  for (let i = 0; i < soft.lines.length; i++) {
    const line = soft.lines[i]!
    assert(line.heightEm === LINE.height, `soft height must be fixed got ${line.heightEm}`)
    assert(Math.abs(line.baselineShiftEm) <= LINE.baselineDriftCap * 0.3, `soft drift too hot ${line.baselineShiftEm}`)
    assert(Math.abs(line.rotateDeg) <= LINE.lineWobbleCap * 0.3, `soft rotate too hot ${line.rotateDeg}`)
    if (i > 0) {
      assert(
        Math.abs(line.topEm - soft.lines[i - 1]!.topEm - LINE.height) < 0.01,
        `soft tops must step by LINE.height`,
      )
    }
  }
  console.log(
    `ok: phase3 hone sticky+dual+center+caret ink=${withInk.lines.length} soft=${soft.lines.length}`,
  )
}

// 12. Phase 4 � one-hand kit (no multi-face sprinkle / optical ~1)
{
  assert(!USE_KIRUK_HAND, 'Kiruk flag should be off until woff2 lands')
  assert(PRINT_HOME === OFL_PRINT, `print home ${PRINT_HOME}`)
  assert(SCRIPT_HOME === OFL_SCRIPT, `script home ${SCRIPT_HOME}`)
  assert(PRINT_EMPHASIS === PRINT_HOME, 'no second print face')
  assert(PRINT_FONTS.length === 1 && PRINT_FONTS[0] === PRINT_HOME, 'print pool')
  assert(SCRIPT_FONTS.length === 1 && SCRIPT_FONTS[0] === SCRIPT_HOME, 'script pool')
  assert(FONT_OPTICAL_SCALE[PRINT_HOME] === 1, `print optical ${FONT_OPTICAL_SCALE[PRINT_HOME]}`)
  assert(FONT_OPTICAL_SCALE[SCRIPT_HOME] === 1, `script optical ${FONT_OPTICAL_SCALE[SCRIPT_HOME]}`)
  assert(ACTION_PRESETS.title.preferPrint === true, 'title must prefer print')
  assert(measureFontForAction('title') === PRINT_HOME, 'title measure font')
  assert(measureFontForAction('type') === SCRIPT_HOME, 'type measure font')
  console.log(`ok: phase4 one-hand ${PRINT_HOME} / ${SCRIPT_HOME}`)

}

// 13. Phase 5 � coherent lean (neighbor follow) + dial caps
{
  assert(BEHAVIOR.angleFollow >= 0.65 && BEHAVIOR.angleFollow <= 0.85, `angleFollow ${BEHAVIOR.angleFollow}`)
  assert(JITTER.leanShare >= 0.4 && JITTER.leanShare <= 0.7, `leanShare ${JITTER.leanShare}`)
  assert(JITTER.translateYClamp <= 0.04, `Y clamp too hot ${JITTER.translateYClamp}`)
  assert(ACTION_PRESETS.type.angleJitter <= 0.85, 'type angle jitter too hot')
  assert(ACTION_PRESETS.ideation.baseAngle < ACTION_PRESETS.type.baseAngle, 'ideation should lean more than type')
  assert(ACTION_PRESETS.checklist.angleJitter < ACTION_PRESETS.type.angleJitter, 'checklist calmer than type')

  const text =
    'Writing and drawing both grow from the same early marks without carelessly overlapping sketches.'
  const runs = layoutSketchInk(text, 'auto', 0.85, 'p5-cohere', 'type')
  const words = runs.filter((r) => r.kind === 'word')
  assert(words.length >= 8, `expected many words got ${words.length}`)
  let maxStep = 0
  for (let i = 1; i < words.length; i++) {
    const step = Math.abs(words[i]!.jitter.angle - words[i - 1]!.jitter.angle)
    if (step > maxStep) maxStep = step
  }
  // With angleFollow 0.72, adjacent words should not flip wildly.
  assert(maxStep < 2.2, `neighbor angle cliff ${maxStep.toFixed(2)}`)
  const meanAbs = words.reduce((a, w) => a + Math.abs(w.jitter.angle), 0) / words.length
  assert(meanAbs > 0.4 && meanAbs < 5, `mean lean out of band ${meanAbs}`)

  assert(BEHAVIOR.opacityFollow >= 0.55 && BEHAVIOR.opacityFollow <= 0.8, `opacityFollow ${BEHAVIOR.opacityFollow}`)
  assert(BEHAVIOR.ideationRushBurst >= 2, 'ideation rush should stick')
  assert(JITTER.dampSoft.scale > JITTER.dampInk.scale, 'soft damp weaker than ink')

  // Common short words must NOT all be rush (was isLabelWord =4).
  const prose = layoutSketchInk(
    'the and with for that this from have were been',
    'auto',
    0.85,
    'p5-rush',
    'type',
  )
  const proseWords = prose.filter((r) => r.kind === 'word')
  const rushCount = proseWords.filter((r) => r.state === 'rush').length
  assert(rushCount <= 2, `short prose rushed too often ${rushCount}/${proseWords.length}`)

  console.log(`ok: phase5 coherent lean maxStep=${maxStep.toFixed(2)} meanAbs=${meanAbs.toFixed(2)}`)
}


console.log('\nAll smoke checks passed.')
