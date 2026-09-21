# SketchInk style target (living)

Canonical taste for kiruk.in’s dual-hand notebook type.  
Agents: **read this before tuning**; **append the calibration log** after every style pass.

## North star (v5 — human behavior + actions)

Looks like **your** sketch notes — clumsy, uncertain, alive:

- Handwriting **changes** from start→end of a paragraph and after a new paragraph
- **Angle**, face, and intensity shift with sketchnote **action** (type / ideation / flow / diagram / checklist)
- Word-level OpenType runs (joins inside words); behavior between words
- Letter-level “never identical” → Kiruk fonts later ([SKETCH_INK_HAND.md](./SKETCH_INK_HAND.md))
- Full matrix: [SKETCH_INK_BEHAVIOR.md](./SKETCH_INK_BEHAVIOR.md)

## Current kit (interim OFL — Phase 4)

| Role | Face |
| --- | --- |
| Print home (titles, checklist, CAPS) | Architects Daughter |
| Script home (body, excerpt) | Nothing You Could Do |

One face per hand. Rock Salt / Reenie / Kristi removed from load + CSS + pools. Optical scale = 1.0. Letter chaos waits on Kiruk `calt` ([SKETCH_INK_HAND.md](./SKETCH_INK_HAND.md)).

Surfaces set `data-kiruk-hand` from `USE_KIRUK_HAND` so CSS vars flip with the TS flag.

Engine: `behavior.ts` + word runs · Field: ink caret + selection wash

## Prefer / avoid

**Prefer**

- Word-level angle + cold/settle/fatigue/rush (one face per hand)
- Coherent paragraph lean (neighbor follow) over per-word re-rolls
- Action presets when studio context is known
- Prefix-stable seeds; soft ink selection
- Text hugging ink (tight obstacle pad + useful stubs beside doodles)
- `calt` / `liga` on runs (ready for Kiruk)

**Avoid**

- Neat single-face flat pages
- Mid-glyph multi-font roulette / paint regressions
- Playpen flash while editing
- Justify stretch on sketch fields (explodes word gaps)
- Multi-face script/print sprinkle that fights one-hand vibe
- Uncorrelated rotate/Y/tracking that reads as glitch, not hand

## How to improve after each write session

1. Note what felt wrong in one sentence
2. Touch one axis (behavior / action preset / angle / Kiruk font)
3. Log it below with date
4. Re-check `/desk` title + excerpt + body together

## Calibration log

### 2026-09-15 — BLOGISM published page (sentence length)

- Problem: reader `/blog` still read as a stamped webfont; titles used default `type` action; long body did not tire until ~120 chars
- Fix:
  - Reader title/excerpt now use `action="title"` / `action="excerpt"` at intensities matching BLOGISM fields
  - `type` body: intensityMul 1.12, baseAngle −2.9, angleJitter 0.98, MDX `<p>` intensity 0.92
  - Fatigue earlier: 90 chars / 22 words; fatigue angle −0.95; `fatigueAngleProgressMul` 1.15 so long sentences lean more by the end
  - BLOGISM sheet column `max-w-3xl` to match `/blog/[slug]`
  - MDX `strong`/`em` no longer wrap SketchInk a second time; `sketchTextNodes` skips existing SketchInk (nested bold/em/blockquote printed `[object Object]`)
- Next: Kiruk `calt` drop-in still parked; if the page looks wild, cap `type.angleJitter` before raising intensity again

### 2026-07-21 — Phase 5 hone loop

- Problem: one doodle flattened whole-page hand; `the`/`and` rush thrash; opacity strobing; ideation coin-flip; debug chip wrong seed; flow SketchInk undamped vs Surface
- Fix:
  - Band-local ink damp (`paintDampForBand`) — soft damp elsewhere; measure always soft
  - Shared `dampRunJitter` for Surface + flow `SketchInk`
  - Rush only CAPS/digits; labels = short CAPS/digits (not common words)
  - `opacityFollow` 0.68; ideation sticky `rushLeft` burst; tiny double-letter boost
  - Debug chip uses focused block + matching `seedKey`
- Next: studio with mid-page doodle — body away from ink should still lean; checklist vs ideation contrast

### 2026-07-21 — Phase 5 deep (coherent hand / jitter dial)

- Problem: per-word independent angle/rotate/Y read as mid-page noise, not one hand; action presets still loud after Phase 4 face cleanup
- Fix (perception model):
  - `BEHAVIOR.angleFollow` 0.72 — blend lean toward previous word; reset only on blank line
  - `JITTER.leanShare` 0.55 — micro-rotate/Y share lean sign (correlated axes)
  - Retuned `ACTION_PRESETS` (tighter jitter, higher opacity floors, clearer action contrast)
  - Quieter settle / later fatigue; compressed amp + Y clamp (fewer collisions)
  - Surface paint damp 0.82/0.85 so body hand still reads; stronger damp beside ink
- Next: studio verify type vs ideation vs checklist; hone if still too neat or too wild

### 2026-07-21 — Phase 4 hone loop

- Problem: title painted script while CSS expected print; Playpen FOUT on caret/sheet/sketch-mode; inline fontFamily killed CSS hand stacks; measure ignored calt; MDX lists/titles off kit; Bridges third face in sketch-mode
- Fix:
  - `title.preferPrint: true` + force print hand for title/checklist; `measureFontForAction` on Field/Surface/Pretext
  - `handFontFamily` — named face + same-hand CSS var (no Playpen)
  - DOM meter with calt/liga for client measure (= paint features)
  - CSS fallbacks → `--font-script-a`; sheet inputs/caret off Playpen
  - sketch-mode vars + chrome use print/script kit; drop Bridges/Playpen overrides
  - MDX h3→title, li→checklist; Kiruk `@font-face` optional + calt on both
- Next: studio title print vs body script; then Phase 5 jitter dial

### 2026-07-21 — Phase 4 deep (one-hand kit, end-to-end)

- Problem: leftover Rock Salt/Reenie/Kristi in CSS + layout imports; optical 1.08 on script; CAPS→Rock Salt face flip; CSS vars ignored `USE_KIRUK_HAND`
- Fix:
  - `PRINT_EMPHASIS === PRINT_HOME`; pools/behavior home-only; `homeBias: 1`; `printEmphasisProb: 0`
  - Optical scale 1.0 for OFL + Kiruk homes
  - Drop `@fontsource` rock-salt / reenie / kristi from `layout.tsx` (+ uninstall)
  - CSS: one print + one script var; `data-kiruk-hand` on studio/blog/notes; caret uses `--font-script-a`
  - `.sketch-ink-print` / `.sketch-ink-script` stacks; `calt`/`liga` on runs + Kiruk `@font-face`
  - `KIRUK_HAND_READY` or `NEXT_PUBLIC_USE_KIRUK_HAND=true` when woff2 lands
- Next: drop Kiruk woff2 → flip flag; then Phase 5 jitter dial

### 2026-07-21 — Phase 3 hone loop

- Problem: left-margin thrash when dual stubs flicker; title center dead; placeholder CSS→Surface cliff; empty-line caret blind; soft↔ink wobble cliff; sticky keyed off glyph xEm; mirror line-height 1.75 vs Surface 1.95
- Fix:
  - Dual sticky: only open both corridors when sticky owns the left; else keep sticky alone
  - `findStickySegment` overlap + `stickyMatchEm` 2.5; persist `seg.start` across newlines
  - Action/preset align live (`title`→center); single-corridor center/right insets beside ink
  - Always mount Surface for empty placeholder (no flow remount)
  - Zero-width caret anchors for empty / trimmed leading offsets
  - Per-band wobble: soft×0.25 off-ink, rigid on intersecting bands
  - Mirror + caret-input `line-height: 1.95`
- Next: studio verify title center + Enter caret + draw-while-typing margin; then Phase 4 fonts

### 2026-07-21 — Phase 3 deep (alignment & flow)

- Problem: jagged left margin beside ink; line-height cliffs; `top`+`bottom` fighting baseline; title/excerpt CSS-flow vs body Surface; reflow snap on width measure
- Fix:
  - Sticky corridors (`slotsForBand(preferStartEm)`) — keep prior stub unless another is clearly wider
  - Fixed `LINE.height` step; obstacle path zero rotate/drift; soft path ×0.25 wobble via transform only
  - `runStyle({ absolute: true })` — `translateY` in transform, no `top` vs `bottom:0`
  - Title/excerpt `SketchInkField` → measured `SketchInkSurface` (same sheet model as body)
  - InlineField width via `useLayoutEffect` (no 36em→real snap)
  - Caps: `lineWobbleCap` 0.45, `baselineDriftCap` 0.05, `heightWobbleCap` 0
- Next: studio verify title+excerpt+body left edge; then Phase 3 hone or Phase 4 fonts

### 2026-07-21 — Phase 2 hone loop

- Problem: tracking unit mismatch (CSS em vs layout em) → ghosts past width-lock; Cheng Lou dual meter; Pretext CSS-flow remount; stub→canvas jump; inline-block flow gaps
- Fix:
  - `measureAdvance` tracking = `letterSpacing * optical * scale * gaps` (matches CSS)
  - Skip Cheng Lou when `paintMetricsAt` present (one packer / one meter)
  - Pretext seeds `pageWidthEm` + `useLayoutEffect` measure (no flow→absolute flash)
  - Client canvas measure on first paint; flow `runStyle({ flow: true })` uses `inline`
  - Soft-break resolves paint per slice offset; paint falls back to `runAtOffset`
- Next: studio verify gaps + reader Pretext; then Phase 3

### 2026-07-21 — Phase 2 deep (word packing)

- Problem: measure≠paint (SCRIPT_HOME slots vs per-word faces), measurePad air, justify gaps, ghost overlaps, Cheng Lou fit-scale not painted
- Fix:
  - `paintMetricsAt` + `measureAdvance` — pack each word with paint face/scale/tracking
  - `measurePad` → 1 when paint metrics present; Surface width-locks words
  - `paintScale` on LineItem so slot fit-scale shrinks glyphs too
  - Justify always pinned left (`pinAlign`); opticalMatch hack removed
- Next: studio verify body paragraph spacing; then Phase 3 alignment

### 2026-07-21 — Phase 1 hone loop

- Problem: still canyons on diagonals/tall marks; orphan 1-word left stubs; skip off grid; wrap thrash
- Fix:
  - Band-slice tall strokes (`strokeBandXExtent` / `bandSlicedStrokeBounds`) so each line only punches ink that crosses it
  - Dual-wrap gate (`minDualStubEm`) — skinny opposite stub collapses to widest corridor
  - Hug collapse → min hole; `bandSkipTopEm` snaps to line grid + jumps past blocked stacks
  - `obstaclesEqual` thrash guard; Cheng Lou slot px uses optical scale
- Next: studio verify slash + left doodle + centered wrap; then Phase 2

### 2026-07-21 — Phase 1 deep (obstacle wrap)

- Problem: first pass still felt like huge unrelated voids around ink
- Fix (geometry, not taste):
  - Dual corridor when exactly 2 useful stubs (wrap both sides of one sketch); 3+ still single widest
  - Asymmetric pad (`obstaclePadYEm` lighter) + `obstacleHugEm` hole inset
  - Cluster merge refuses balloon unions (`maxClusterUnionRatio`) so hatched doodles stay separate holes
  - Grazing band overlap ignored (`minBandOverlapFrac`); `bandSkipTopEm` seeks next useful band before jumping past AABB bottom
  - Tighter stroke brush pad + lower stub mins
- Next: verify in `/studio` mid-line mark + left doodle; then Phase 2 word packing

### 2026-07-21 — Flaw triage Phases 1–5

- Problem: huge voids around ink; blown word gaps; jagged alignment; random multi-face hand; wild jitter
- Fix:
  - P1: tighter `obstaclePadEm`/`clusterGapPx`/`strokeBounds` pad; lower stub mins + soft floor; `bandSkipTopEm` only jumps on full-width blockers
  - P2: `measurePad` 1.03; cap justify; force left on obstacles/justify; skip painting space ghosts; optical match paint→measure
  - P3: always `SketchInkSurface` in unified field (no CSS→absolute jump); zero line rotate on obstacle path; apply `baselineShiftEm`
  - P4: one script + one print face; optical scales ~1.08 (Kiruk still pending)
  - P5: dialed `ACTION_PRESETS` / `BEHAVIOR` / `JITTER` toward one intentional hand
- Next: drop Kiruk `.woff2` + `USE_KIRUK_HAND=true` when scans land

### 2026-07-19 — Human behavior + actions

- Problem: v4.1 too neat / “normal font”; no start≠end or action-linked hand
- Fix: `behavior.ts` + word runs; angle/skew; action presets; Phase A–B (title/excerpt/type); checklist/flow line heuristics
- Next: ideation toggle; diagram captions; checklist blocks; Kiruk scans

### 2026-07-19 — Paint bugfix (v4.1)

- Double paint / OS selection / collisions / missing spaces fixed

### 2026-07-19 — Foundation v4

- Shaped dual-hand runs; tokenize restored; Calligraphr path documented

### (next)

- _Add entries whenever the hand is tuned from screenshots or notebook photos._
