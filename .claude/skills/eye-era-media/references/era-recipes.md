# Era recipes (kiruk-in, post/era-medium.ts)

The values here are the ones that survived user review; they are the defaults to start from.

## 1970: green phosphor terminal (the benchmark)
- Tone: `l = clamp((luma − 0.02)/0.78)`, gamma 2.2 → 0.85 as the tube warms.
- Curved glass: `u·(1 + 0.07|u|²)`. Bloom: 8 taps on a ring of 0.006H.
- Rows: `H / max(3.46·kc, 3.46)`; row profile `1 − 0.62·row²`.
- Colour `(lv^2.4·0.55, lv·1.05, lv^2.4·0.32)` plus green glow.
- Vignette `1 − (0.5|u|²)^1.3·0.55`. The tube's rounded glass edge (inset 0.028H, radius 0.075H) is the one allowed edge in the deck.
- Sign: a block cursor in the pupil (0.2 × 0.36 of the pupil radius). It blinks at 1.05 Hz, holds lit on hover, becomes a disc drawn by the beam on press.
- Departure: the raster squashes onto the eye's line, then a line, then a dot that fades. Arrival: warm-up.

## 1981: Xerox Star 1-bit, as an etching
- Cells `cellPx(3.4)`. Develop `E 1.7, Ec 0.45`. `lc` 0.8 → 1.8 over the cornea.
- Ink where `L2 − mean < −0.12` (strokes on edges: lashes, lid line, limbus, brow hairs). Tone `smoothstep(0.1, 0.86)`, so shadows fall to ink.
- The cornea's page is capped at ×0.68 paper, so it reads as a lit screen with the iris round it.
- Bayer8 + 1/128. Opening snapped to cells, no grey edge.
- Sign: the Star's arrow (solid ink with a paper halo) parked on the pupil while the visitor's pointer is away, appearing cell by cell. Doubled cells when kc < 0.7.
- Press: XOR-invert the iris (the Star inverted selections). Enter: the selection opens over everything.
- Arrival: two interlaced fields paint down onto ink with a checker write head. Departure: one field clears to ink.

## 1991: NeXT, four greys
- Cells `cellPx(2)`; below the arriving refresh sweep, `cellPx(8)`. Develop `1.7, 0.5`; `lc` 0.5 → 1.4.
- Exactly four greys with bayer4; the dark room stays black; two greys while leaving.
- Sign: the iris is the page's one link. Its underline is white, on the lower lid's wet rim (×0.84 of the real margin), and draws on once, left to right, at READY.
- Hover: the iris's blacks lift to 1/3 in a 50% dissolve. Press: invert. Enter: a white window draws down.

## 1995: GeoCities on a home CRT at night, 216 web-safe colours
- Cells `cellPx(3)`. Develop `1.5, 0.55`. Saturation ×1.35, contrast ×1.15, shadows to navy `#000033`.
- Bayer4 onto 00/33/66/99/CC/FF per channel; three levels while leaving.
- Shadow mask R|G|B stripes ≥ 1 device px, offset on alternate rows, only where bright.
- A few still stars far from the face (hash > 0.9967), never twinkling.
- Sign: the catchlight is an animated GIF (dot, plus, star, plus) at 2 fps in coarser cells, held on the star frame when still.
- The iris is a link: blue ring on hover, red pressed, visited purple `#663399` on enter.
- Arrival: interlaced GIF passes (stride 8, 4, 2, 1).

## 1997: corporate web on an office Trinitron, 16-bit
- 2-pixel cells; 8×8 JPEG blocks blended into the darks only (0.55). RGB 5-6-5 quantise. No bevel.

## 2000: through a TN laptop panel
- Black floor `#15171c` ("a TN panel's black is never black"). CCD smear removed (its ghosts showed full frame).
- Sign: the search box's caret in the pupil. It blinks for 5 s after anything happens, then holds; it XOR-inverts.

## 2003: Web 2.0 candy
- Saturation ×1.3, contrast ×1.12 about 0.45, warm lights, sky blue `#6c9bd2` in the shadows ×0.12.

## 2009: an iPhone 3GS photo of its time
- Faded blacks (×0.82 + warm offset), warm highlights, teal shadows, lens falloff ×0.38, walnut `#2b2118` in the shadows ×0.4. Lens flare 0.45 (higher made rings).

## 2013: the system
See `2013-system.md`.

## 2026: measured
See `2026-measured.md`.

## Timings (ERA_MEDIUM in look.ts)
| Era | departMs | arriveMs | enterMs | flood |
|---|---|---|---|---|
| 1970 | 200 | 420 | 400 | #000000 |
| 1981 | 130 | 300 | 300 | #F1EFE8 |
| 1991 | 120 | 440 | 360 | #FFFFFF |
| 1995 | 120 | 360 | 380 | #000033 |
| 1997 | 130 | 330 | 400 | #6E1F2F |
| 2000 | 100 | 600 | 300 | #FFFFFF |
| 2003 | 120 | 500 | 380 | #6A98CB |
| 2009 | 120 | 380 | 380 | #2B1D12 |
| 2013 | 130 | 420 | 420 | #EFEFF4 |
| 2026 | 130 | 640 | 400 | #FAFAFA |
