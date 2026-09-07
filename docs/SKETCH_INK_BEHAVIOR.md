# SketchInk Human Behavior + Sketchnote Actions

Living model: every notebook **action** has a handwriting connection and a behavioral connection.

Calibrated against real sketchbook pages (IDEATION / team map / user-flow): CAPS = architectural print, body = fast slanted cursive, checklists upright, start≠end of a paragraph.

## Idea

Sketchnotes are not one font. They are a **person changing how they write** as they:

- start a page / paragraph
- dump ideation
- label a flow
- caption a diagram
- tick a checklist
- get tired at the end of a long block

Engine: word-level shaped runs + behavior state machine + action presets.  
Letter-level “never the same twice” lives in **Kiruk** fonts (`SKETCH_INK_HAND.md`).

## Photo-derived rules

| Sketchbook signal | Digital rule |
| --- | --- |
| ALL-CAPS labels (IDEATION, TEAM, MAIN INSIGHT) | Force **print** hand (Architects / KirukPrint) |
| Fast narrative / bullets | **script** home + higher slant (`type` / `ideation`) |
| Checklist / “things to change” | `checklist` — upright print, tight tracking |
| Flow steps / numbers / arrows | `flow` — print for digits/CAPS, script for descriptions |
| Bottom of a long paragraph | `fatigue` — more slant, lower opacity, smaller scale |
| New section / blank line | `cold` hand reset |

## Action matrix

| Action | Handwriting | Behavior | Angle | Face |
| --- | --- | --- | --- | --- |
| `type` | Connected script body | cold→settle→fatigue | ~−2.4° ±0.65, follow 0.72 | Script home |
| `ideation` | Loose / absurd (same face) | higher rush chance | ~−3.2° ±0.95 | Script home |
| `flow` | Print labels + script notes | short tokens rush | upright labels | Print for CAPS/steps |
| `diagram` | Careful captions | cold near ink | near upright | Print-biased |
| `checklist` | Tight architectural print | settle fast | almost upright | Print home |
| `title` | Print hand | colder open | mild | Print home |
| `excerpt` | Light script | lighter intensity | mild | Script home |

Studio: **Type** tool shows action chips (`type` / `ideation` / `flow` / `list` / `diagram`) so hierarchy is explicit, not only heuristic.

## Behavior states

| State | Trigger | Feel |
| --- | --- | --- |
| `cold` | Doc start, blank line, action switch | careful, slightly larger |
| `settle` | After a few words | calm home lean |
| `fatigue` | Long paragraph (~140+ chars) | more slant, lower opacity, smaller scale |
| `rush` | Short / CAPS / ideation | slant+scale up (same face) |

## Coherent lean (Phase 5)

Adjacent words blend skew toward the previous word (`BEHAVIOR.angleFollow`). Opacity follows too (`opacityFollow`). Micro-rotate / baseline share the lean sign (`JITTER.leanShare`). Ink damp is **band-local** — a doodle only calms the lines it touches, not the whole page.

## Dev chip

In development, `/studio` shows a bottom-right chip: `% print vs script`, mean skew, unique fonts — proves the engine is firing above perceptual threshold.

## Phases

| Phase | Status | Deliverable |
| --- | --- | --- |
| **A** | Done | Amplified `behavior.ts` / `jitter.ts` (visible ranges) |
| **B** | Done | Studio action switcher + `action` prop |
| **C** | Done | Rough chrome + diagram captions + checklist |
| **D** | Ready | KirukPrint / KirukScript drop-in (`USE_KIRUK_HAND`) |
| **E** | Done | Coherent lean + jitter dial (Phase 5) |

## Hard rules

- Never mid-word multi-font spans
- Prefix-stable seeds `@startOffset`
- No visible textarea glyphs / OS black selection
- MDX = plain UTF-8
- Chrome is sparse SVG, not per-character

## Code map

- `src/lib/sketch-ink/behavior.ts` — states + `ACTION_PRESETS` + `summarizeRuns`
- `src/lib/sketch-ink/jitter.ts` — perceptual rotate / top / skew
- `src/lib/sketch-ink/index.ts` — `layoutSketchInk(..., action)`
- `src/components/sketch-ink/SketchInk.tsx` — paint
- `src/components/sketch-ink/SketchInkField.tsx` — editor field
- `src/components/sketch-ink/SketchInkDebug.tsx` — dev chip
- `src/components/sketch-ink/SketchChrome.tsx` — Rough underline / box / divider / checklist
