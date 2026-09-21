# Your hand → KirukPrint / KirukScript

How to replace interim OFL faces with **your** scribble so readers see the real notebook hand — including “same letter never stamps twice” via baked `calt` alternates.

## Goal

| Face | Use | Feel |
| --- | --- | --- |
| **KirukPrint** | CAPS labels, short titles, checklists | Architectural print, uneven baseline |
| **KirukScript** | Body notes, flows, ideation | Connected ballpoint, tall ascenders |

The engine paints **one face per word run**. Dropping in your TTFs is a pool/CSS swap — no layout rewrite. Behavior (cold/fatigue/angle) stays.

## Capture pipeline (Calligraphr)

1. **Write templates** on paper (or tablet → high-contrast export)
   - Use [Calligraphr](https://www.calligraphr.com/) custom template: Latin lower + upper + digits + punctuation you actually use
   - Fill **2–3 alternates** per letter (especially `e`, `a`, `r`, `s`, `t`, `l`)
   - For script: draw letters so exit strokes can meet entry strokes (connected feel)
   - Optional: common ligatures (`th`, `ing`, double letters)

2. **Scan / photo** → Calligraphr import → clean cells (trim, threshold)

3. **Export**
   - Enable character randomization / alternates if available (Pro) — this bakes `calt`
   - Download `.ttf` / `.otf` → convert to `.woff2` (e.g. `woff2_compress` or fonttools)

4. **Optional bake** (more natural repeats)
   - [kako-jun/jitter](https://github.com/kako-jun/jitter) `bake` → N variants + `calt`
   - Or FontCreator / Glyphs: word-start / mid / end forms + rotate lookups

5. **Drop into the site**
   ```text
   public/fonts/KirukPrint.woff2
   public/fonts/KirukScript.woff2
   ```
   - `@font-face` already lives in [`src/app/globals.css`](../src/app/globals.css)
   - In [`src/lib/sketch-ink/config.ts`](../src/lib/sketch-ink/config.ts) set `KIRUK_HAND_READY = true`
     (or `NEXT_PUBLIC_USE_KIRUK_HAND=true`)
   - That flips `PRINT_HOME` / `SCRIPT_HOME` → KirukPrint / KirukScript and sets
     `data-kiruk-hand="true"` on blogism / blog / notes so CSS vars match runtime faces
   - OFL alternates are already gone — your `calt` owns letter chaos

6. **Calibrate** against a photo of your notebook page — update [`SKETCH_INK_STYLE.md`](./SKETCH_INK_STYLE.md) log

## What not to do

- Don’t go back to per-letter React font switching for “randomness” — bake it into the font
- Don’t use Fontself alone if you need strong `calt` (Calligraphr / Glyphs / FontCreator are stronger for handwriting)
- Don’t animate Tegaki strokes in the BLOGISM editor — optional reader flourish only

## Checklist when fonts land

- [ ] Copy `KirukPrint.woff2` + `KirukScript.woff2` into `public/fonts/`
- [ ] Set `KIRUK_HAND_READY = true` (or `NEXT_PUBLIC_USE_KIRUK_HAND=true`)
- [ ] Confirm `data-kiruk-hand="true"` on `/desk` + `/notebook` roots
- [ ] Print CAPS titles look like Hand A
- [ ] Body sentences connect within words
- [ ] Same letter twice in a word is not a stamp (alternates / calt)
- [ ] BLOGISM caret + selection still track ink
- [ ] SSR / hydrate match (seeded run wobble unchanged)
- [ ] Dev chip still shows print/script mix + mean skew
