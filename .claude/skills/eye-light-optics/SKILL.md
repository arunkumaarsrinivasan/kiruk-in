---
name: eye-light-optics
description: "How light reaches and leaves the loader eye: the era's screen as the key light and the only bright thing in the cornea (its real home page mirrored by ray tracing), fill lights, the screen's picture thrown on the skin, tear film and meniscus, reflex tears, the per-era lens (grain, tone, white balance, artefacts), depth of field, bloom and the post chain order, and the posters. Use when changing reflections, lighting, an era's lens or grade, tears, DOF, bloom, the post pipeline, or the poster stills. Triggers on: reflection, cornea, catchlight, screen light, fill light, eye:screens, real page, tear film, meniscus, reflex tears, lens, grain, white balance, vignette, flare, halation, depth of field, DOF, bokeh, bloom, post chain, filmic, posters, AVIF."
---

# Light and optics

## Rules
1. **The era's screen is the key light, and the brightest thing in the cornea.** Its colour reaches the eye only as light: reflection, spill on the skin, catchlight, sheen.
2. **The reflection is the era's real home page**, captured from the codebase (`npm run eye:screens` writes `public/eye/screens/<era>.webp`), never synthetic content when a real page exists. Re-run it whenever a home page changes, then recapture the posters.
3. **Mirror by ray tracing.** The reflected ray from the 7.8 mm cornea cap is traced to the screen's actual rectangle (centre, normal, right, up, size), weighted by Fresnel (f0 0.035). No fake geometry, no environment map.
4. **The page covers about 60% of the iris** (screens drawn at ×0.62 of their life size). *Why:* a whole-iris reflection read as a lens, not an eye.
5. **A white page is compressed, not stopped down twice.** Reinhard and contrast keep its layout: "what survives a highlight is contrast, not light". The reflection is sharp at the dome's centre and softer toward the limbus (mip bias grows with distance, tear slope, dryness).
6. **Mip bias follows the shot's scale:** `U.mip = max(0, log2(span/1.09))·1.15`. *Why:* a dithered terminal otherwise turns into a snowstorm of specks on a phone.
7. **Screens are larger than life and placed where that era's device sat** (CRT centred and low at night, phone above at arm's length, a window for 2026). Fill lights are physical: overhead fluorescents (1981), a desk lamp disc (1991), a tabletop bounce (2013).
8. **The tear film lives.** A blink lays it fresh; it creeps up for ~1 s; it thins (~2%/s, ~10%/s over weak spots) and breaks up after about 8 s of staring; dry spots blur and dim the reflection. It never wobbles like water.
9. **The meniscus is a thread,** brighter on the lower lid (0.9) than the upper (0.5), wider at the tear lake.
10. **Reflex tears:** 4+ era requests inside 1 s add tearing (+0.25, decaying 0.15/s), counted on the request, not the cut. *Why:* rate-limited cuts never reach four.

## The era lens: one recording style per era
- **Each era gets one cue at most**, with a kill switch (`lens.on`). Every lens number damps at rate 3; an artefact fades out before the next switches in.
- **Grain** steps at 12 Hz (never faster than 18), never per frame ("a 60 Hz shimmer tires the eye"). It's ×0.45 on phones, and 0 for eras whose medium quantises (the dither is the grain).
- **Hashes** are Hoskins hash12, never sin-based. *Why:* sin hashes show stripes at pixel coordinates in the thousands.
- **Artefacts that failed at full frame:** CCD smear ghosts (2000, removed) and flare rings on the brow (2009, kept at 0.45). Test every artefact at full frame, not cropped.
- **Vignette:** only the excess over 0.3 counts, and an era whose medium is full-bleed colour sets it to 0 when it reads as a frame (2013).

## Post chain order (post/pipeline.ts)
1. Scene pass with MRT: output, emissive (8-bit), viewZ.
2. Macro depth of field: half-res, 9-tap separable gather. A tap counts only if its own blur reaches the pixel, so a soft face never smears over the sharp iris. Not on T1.
3. Bloom on emissive only (0.25 strength, quarter res). WebGPU only: three's MRT merge fails on WebGL2.
4. Era lens, linear stage (weave, webcam, interlace, lateral colour, unsharp, halation, comet, CCD, flare, white balance, split tone, saturation with `isolate`).
5. Exposure and the room's falloff (a dark room round the face).
6. Filmic ACES fit, the only tonemap (the canvas runs `flat`).
7. Era lens, display stage in γ2.2 (gain, lift, gamma, grain).
8. The era medium, reading the finished frame as an 8-bit display-encoded mipmapped texture with depth in alpha (eye-era-media).

## Focus
- Focus stays on the iris plane (11.6 mm). It racks slowly (rate 3) to lashes (15.5 mm) or skin under the pointer.
- **No focus breathing:** the frame never scales as focus racks. *Why:* it read as the face zooming.

## Posters
- 20 AVIF stills (`<era>-{wide,tall}.avif`: 1600×900, and 780×1688 for phones at 2×).
- Placed by the eye's own framing (`eyeShot`), not object-fit, so the crossfade to the live eye does not jump.
- Removed 650 ms after the live eye is up, so the crossfade never dips through the room.
- **Capture:** an offscreen stage at the exact CSS size, reduced motion, non-interactive, media on. Lab "Capture all eras", or `window.__eyeCapture(eras?, variants?)`. A dev-only route writes AVIF q52.
- **Recapture after** any change to an era's look, its medium or its screen capture, and only once the user has signed the look off.

All per-era light positions, lens values and optical constants are in `references/optics-numbers.md`.
