# Anatomy numbers (kiruk-in, src/components/three/eye/)

## Identity (identity.ts DEFAULT_IDENTITY)
- **Iris:** inner #5e3c22, outer #4a2e1a; melanin 0.85, scatter 0.08; collaretteR 0.34; crypts 0.4, furrows 0.5, fibreWave 0.5; freckles 0.1; limbal 0.8; arcus 0.3 (a blue-grey limbal haze).
- **Sclera:** tint #e4dccb, vessels 0.5, age 0.4.
- **Pupil:** rest 0.34 of the iris radius; decentre (−0.02, −0.01), toward the nose and low.
- **Lids:** hooded, tilt 2°, aperture 1.
- **Lashes:** curl 0.35, clump 0.45, mascara 0; root #0c0908, tip #16110d.
- **Skin:** Monk 9, undertone 0.45, translucency 0.45, pores 0.6, lines 0.4, freckles 0.
- **Monk swatches 1–10:** #f6ede4 #f3e7db #f7ead0 #eadaba #d7bd96 #a07e56 #825c43 #604134 **#3a312a** #292420.

**LID_SHAPES** (creaseD mm, creaseDepth mm, hood, epicanthus)

| Type | creaseD | creaseDepth | hood | epicanthus |
|---|---|---|---|---|
| double | 3.5 | 0.55 | 0 | 0 |
| mono | 2.6 | 0 | 0.2 | 0.1 |
| hooded | 2.5 | 0.4 | 0.65 | 0 |
| deepset | 4.8 | 0.9 | 0 | 0 |
| epicanthic | 2.9 | 0.25 | 0.25 | 0.6 |

creaseD is the fold as it shows over the lashes (2.5–5 mm), not the deeper anatomical crease.

## Globe (anatomy.ts, mm)
- **Globe:** radius 12 (axial ~24).
- **Cornea:** radius 7.8 (steeper, so it bulges), Ø 11.8, thickness 0.55; IOR 1.376 cornea, 1.336 aqueous; chamber 3.
- **Iris:** radius 6, a cone: root z 9.8, pupil z 10.2 (0.4 mm proud). Limbus radius 5.9.
- **Pupil:** 1.6–8.2 mm.
- **Gaze range:** yaw 24°, pitch 10°. Bell's phenomenon: 9° up under a blink. Gaze rotation order YXZ (Fick), so diagonals never twist.

## Sclera (nodes/sclera.ts, bake/vessels.ts)
- **Age** yellows the exposed corners toward (0.86, 0.8, 0.64) at age × 0.35. Mottle ×0.94–1.06.
- **Deep vessels:** (0.8, 0.46, 0.44), broad and soft, ≤ 0.6. **Fine vessels:** (0.6, 0.1, 0.09), sharp, ≤ 0.9.
- **Vessel amount** ramps toward the rims and the inner corner, up to ×1.3. At 1.8× they read as bloodshot loops.
- **Vessel bake:** 1024×512, looked up by the ball's normal, so it turns with the gaze. Tortuous warp, in patches; none over the cornea, few by the limbus, most toward the corners.
- **Limbus halo:** dark (0.13, 0.14, 0.18) at 1.01R, then a blue-grey (0.46, 0.49, 0.56) at 1.075R.
- **Light:** wrap red-furthest; key kept under 1 so lid shadows survive. Cornea relief on the white: −34% away from the key (without it the iris is a circle drawn on a ball).
- **Socket falloff** floored at 0.5 (was 0.35: stark black).

## Fissure and margins (nodes/margins.ts)
- **Lid thickness** 1.1 mm (was 1.5: thick rims). FISSURE_MM medial 14, lateral 11.8, upper 4.4, lower 5.5.
- **Bows:**
  - upper `1 − a^(2.6 nasal / 2.2 temporal)`;
  - lower apex shifted −0.07, ×1.07/0.93, exponents 2/2.3.
- **Tear lake:** blends in over a 0.87–0.92, then closes as a circle over 0.92–1 (~2 mm tall).
- **Inner corner lowered** 0.075 rad. Epicanthus lets go at the corner.
- **Unevenness:** upper `sin(4.1x+0.6)·0.018 + sin(9.3x+2.2)·0.007` rad; lower 0.012/0.005.
- **Squint:** upper ×(1 − 0.25s), lower ×(1 − 0.2s). Glare `smoothstep(0.55, 0.95, lum)`, goal 0.6 × glare.
- **Margins never cross:** up ≥ lo + 0.004 rad.
- **Lid shadows on the globe:**
  - under the upper lid −66% within 5.6 mm, −50% within 0.8;
  - above the lower −26% / −30%;
  - canthus pocket ×(1 − 0.28c²) (was 0.55);
  - lash fringe ≤ 0.75.

## Margin face (nodes/lid-mesh.ts)
- **Inner face shows:** upper 0.14; lower 0.5 mid-lid, falling to 0.2. The lower was 0.9: a cement ledge.
- **Grey line:** upper only, 0.1–0.35 mm. The lower lid's intermarginal strip keeps only its gloss.
- **Lash line** (0.02, 0.016, 0.015): upper 0.88 over 0–0.95 mm (a dense dark band of roots); lower 0.62, a shadow not a stroke.
- **Upper inner face** 65% toward (0.11, 0.055, 0.05): in shadow, not black.
- **Meibomian openings:** noise ×140, −35%.

## Caruncle (caruncleMaterial)
- 2 × 1 × 0.9 mm (was 1.7 × 1.05 × 1.1), tucked under both margins. Egg profile, fuller toward the white.
- **Moves with gaze:** x ×(1 + 0.12gx), y ×(1 − 0.06gx), z ×(1 − 0.3·blink).
- **Albedo** (0.3, 0.14, 0.13) → (0.62, 0.36, 0.34) by skin tone, rose-brown on dark skin. Takes 35% of the screen's hue. Granular, not glossy.
- **Opacity** fades at grazing angles and toward the lateral end, so it melts into the white.

## Lid mesh and face shell
- **Mesh:** 320 × 64 grid. α runs round the eye, q outward to 36 mm; the inner face is 14% of the rows.
- **Rows** are denser near the margin (pow 1.6). Skin is anchored far out, so a blink never drags the brow.
- **Corner fan:** from s 0.62 (inner) / 0.72 (outer) onto a fixed bisector. Following the margin made the skin fold over itself.
- **Face shell** height:
  - `11 − kx·x² − ky·y²` (falls fast to the temple, slowly to the nose);
  - brow ridge at y 10.5;
  - trough under the lower lid; brow fat pad (no hollow under the brow); nose; cheek.
  - Lid and face are joined by a smooth max, k = 2 mm.
- **Folds:**
  - The upper crease hugs the margin near the nose and rises over the middle.
  - The fold overhang is `hood·0.9 + depth·0.6 + 0.3`, stretching looking up and bunching looking down (clamp 0.75–1.25).
  - Lower lid: pretarsal roll at 2 mm, lid–cheek crease 4–5.4, bag, second fold.
  - Both lids blend 50/50 at the corners, so the hood runs round the outer corner.
  - The crease shadow is ≤ 0.4.

## Lashes (nodes/lashes.ts)
- **Count:** T1 80/24, T2 130/70, T3 180/100 (upper/lower). Length 7.2 / 4.6 mm, 10 segments, Kajiya–Kay sheen.
- **Rows:** upper 3 rows at d 0.05 + 0.1·row; lower 2 at 0.16 + 0.08·row.
- **Lean:** upper 0.15 ± 0.2 rad, lower 0.7 ± 0.225. Fan stays over the eye.
- **Curl:** upper 0.45 + 0.9c; lower 0.15 + 0.45c.
- **Width:** 0.09–0.125 / 0.065–0.09 mm; taper `(1 − t)^0.7`.

## Brow (bake/brow.ts)
- **Bounds:** x −15.5, y 5.4, 38 × 10.5 mm.
- **Hairs:** 260 / 540 / 720 at 1024 / 1536 / 2048 px.
- **Lower edge:** 8.2 at the head, 9.3 at the arch, 6.7 at the tail. History: 10.2 → 9.2 → 8.2; about 4–5 mm over the lashes.
- **Flow:** the head stands up (1.35 → 0.95 rad), the body herringbones (lower 0.62 → 0.3, upper −0.02 → −0.32), the tail sweeps down.
- **Hair:** length 2.4–4.6 mm, width 0.06–0.095; edges thinner and paler. Vellus: 900 fine hairs per 6 mm tile.
- **Shading:** skin under the brow −14%; cast shadow −32%; sheen exponent 80 ×0.012.
- **Muscles:**
  - frontalis lift `brow·(0.5 + 0.6·bump)`;
  - corrugator head in by 1 mm, down by 0.9;
  - orbicularis `(0.5·squint + 0.25·blink)·(0.4 + 0.6u)`.

## Skin (bake/skin.ts, bake/skin-face.ts)
- **Mesh-space bake** (2048×256): pores, lid lines, crease wobble, crease breaks.
- **Face-space bake:** a 6 mm seamless tile (pores 15/mm, grain, sheen, caruncle bumps) plus a 64 × 48 mm map (mottle, freckles, crow's feet). Baked because procedural skin was the dearest pass (14 of 25 ms).
- **Albedo:**
  - thin lid skin warmer and pinker within 5 mm;
  - pores −8%;
  - periorbital ×0.8;
  - fine creases every 0.62 mm, −22% with a +7% lit edge;
  - crow's feet scale with squint.
- **Light:**
  - wrap (0.55, 0.35, 0.28), with red bleed at the terminator;
  - overhead room light for modelling;
  - the screen's picture thrown on the face at mip 8, 22%;
  - Fresnel 0.03, oilier near the eye; sheen broken by pores.

## Framing (framing.ts) and camera
- **Wide box:** halfW 16, top 12, bottom −10. Phone bottom −16. Blended over aspect 0.75–1.1.
- **Span** = `max(top − bottom, 2·halfW/aspect) / MM_PER_UNIT` (≈ 17.39 mm per unit).
- **Camera:** FOV 12°, distance ≈ 105 mm at 16:9, no rotation.
- **Focus:** iris 11.6 mm, lashes 15.5; bokeh 2.8 (was 6.5).
- **Room** #040507, with an out-of-focus monitor up-left.
