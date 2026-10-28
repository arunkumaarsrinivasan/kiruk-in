# Anatomy numbers (kiruk-in, src/components/three/eye/)

## Identity (identity.ts DEFAULT_IDENTITY)
- **Iris:** inner #5e3c22, outer #4a2e1a; melanin 0.85, scatter 0.08; collaretteR 0.34; crypts 0.4, furrows 0.5, fibreWave 0.5; freckles 0.1; limbal 0.8; arcus 0.3 (a blue-grey limbal haze).
- **Sclera:** tint #e4dccb, vessels 0.5, age 0.4.
- **Pupil:** rest 0.34 of the iris radius; decentre (−0.02, −0.01), toward the nose and low.
- **Lids:** hooded, tilt 2°, aperture 1.
- **Lashes:** curl 0.35, clump 0.45, mascara 0; root #0c0908, tip #16110d.
- **Skin:** Monk 8, undertone 0.15 (golden), translucency 0.45, pores 0.6, lines 0.4, freckles 0. (Monk 9 until batch B: the user's photos put their skin's albedo at L* ~35.)
- **Monk swatches 1–10:** #f6ede4 #f3e7db #f7ead0 #eadaba #d7bd96 #a07e56 #825c43 **#604134** #3a312a #292420.

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
- **Cornea (R1):** a conic, R 7.8 at the apex, Q −0.25 (steeper than the ball, so it bulges, flattening toward its edge); apex 12.99 in front of the globe's centre; back sphere 6.5, 0.55 thick; IOR 1.376 cornea, 1.336 aqueous. Pupil plane 3.6 behind the apex (entrance pupil 3.04 deep, ×1.13).
- **Iris:** radius 6, a cone: root z 8.99, pupil z 9.39 (0.4 mm proud). Visible limbus an ellipse, 5.9 × 5.35 half-axes (11.7 × 10.6 mm; the sclera overlaps above and below), with pigmented palisades of Vogt above and below and a faint warm limbal band.
- **Pupil:** 1.6–8.2 mm.
- **Gaze range:** yaw 24°, pitch 10°. Bell's phenomenon: 9° up under a blink. Gaze rotation order YXZ (Fick), so diagonals never twist.

## Sclera (nodes/sclera.ts, bake/vessels.ts)
- **Age** yellows the exposed corners toward (0.86, 0.8, 0.64) at age × 0.35. Mottle ×0.94–1.06.
- **Vessels (R5, bake/vessel-net.ts):** grown once per person on the CPU, drawn with Canvas 2D into an azimuthal-equidistant map of the front hemisphere (θ from the axis = distance from the centre, 90° at the edge), 2048² (~54 px/mm; T1 1024²), looked up by the ball's normal so they turn with the gaze. *Why:* noise ridges at 1024×512 (~14 texels/mm) blurred the 0.02–0.05 mm vessels away; the white read as paint.
  - 11 conjunctival trunks from θ 1.18–1.43 rad, densest nasally (pick weight 0.18 + 0.82·nasal³ + 0.5·temporal³), 0.045–0.09 mm, taper ×0.993 per 0.12 mm step, branch 1.8 %/step (child ×0.55);
  - one big squiggle on the upper nasal white (α π − 0.22, θ 1.0, 0.12 mm, taper ×0.997, branch 0.6 %);
  - tortuosity: the curvature is a mean-reverting random walk (kick 7–14, settle 5 per mm; the big one 30/14). *Why:* a sine meander read as a drawn zigzag;
  - 9 episcleral (R): straighter (kick 1.6), 0.1–0.16 mm, drawn as a wide faint halo under a core, stop 0.22 rad short of the limbus;
  - capillary net: a jittered 1.05 mm grid, edges wiggled and dropped (densest toward the corners), 0.014–0.024 mm at 0.35–0.6 alpha;
  - 70 limbal arcades just outside the limbus.
  - Filtering: trilinear, **no anisotropy** (4× cost ~2 ms a frame on the 610M, A/B in one page, with no visible gain).
- **Vessel colours:** deep (0.66, 0.4, 0.43) ≤ 0.5; fine (0.6, 0.13, 0.11) ≤ 0.85, × vessels × (0.6 + 0.8·toRim) × up to 1.3 nasally.
- **Pigment (R5):** patchy brown melanosis (0.5, 0.36, 0.24) × `sclera.pigment` (0.6) × 0.6, within ~0.2–5 mm of the limbus, most in the horizontal meridians (bake/vessels.ts R).
- **Limbus (R3):** a soft ramp, no halo: the stand-in iris (0.03..0.075 dark brown) fades into the white over radE 0.94–1.1, through a cool grey (0.24) over 0.96–1.06. The old dark halo at 1.01R read as an outline.
- **Light:** wrap red-furthest; key kept under 1 so lid shadows survive. Cornea relief on the white: −16 % away from the key (−34 % laid a grey band under the iris).
- **Socket falloff** floored at 0.5 (was 0.35: stark black).

## Fissure and margins (nodes/margins.ts)
- **Lid thickness** 1.1 mm (was 1.5: thick rims). Lid–gaze coupling (`LID_GAZE`): upper 0.88 up (1 at first: with a feeling's lid-raise on top the eye ballooned open) / 0.92 down; a feeling's lid-raise × (1 − 0.7·up) while looking up; lower 0.22 up / 0.3 down (was 0.85 / 0.7 and 0.35); the skin rides with it only to ~6.5 mm (upper) / 7 mm (lower), the crease fold × (1 + 1.5·pitch), the margin's corneal lift ≤ 0.55 mm. FISSURE_MM medial 14, lateral 11.8, upper 4.8, lower 5.8 (4.4 / 5.5 until 2026-10-28: the user asked the opening a little taller, same shape).
- **Canthi (R6, the user's photos):** both under the globe's centre, the medial 3 mm (`FISSURE_MM.canthus`), the lateral 1.9 (`canthusL`), then the person's tilt (2°) lifts the outer corner by `tilt·xs²`. Each lid blends to its canthus as its bow runs out: `up = U·bowU − drop·(1 − bowU)`, `lo = −L·bowL − drop·(1 − bowL)`, so the apexes stay put.
- **Bows** (fitted to photo 4, rms 0.26 mm as shares of the canthus-to-apex rise):
  - upper nasal `(1 − a^2.2)·(1 − 0.4·smoothstep(0.45, 1, a))`, temporal `1 − a^2.2`;
  - lower apex shifted −0.07, ×1.07/0.93; nasal `1 − smoothstep(0.15, 0.95, al)` (level by the corner), temporal `1 − al^1.6` (was 2/2.3).
- **Opening from the medial canthus:** 0.9 mm at 1 mm, 1.7 at 2, 4.2 at 4 (was 1.66, 3.2, 5.6: a tall blunt end).
- **Tear lake:** blends in over a 0.86–0.91, then closes as a circle (~0.9 mm tall; was ~2 mm). Epicanthus lets go at the corner.
- **The media's `almond()`** meets the lids at the canthi (`apC`, twin `canthi()`), its corners at their real reach (`apX`: ~12.6 / 11.7 mm, not FISSURE_MM).
- **Unevenness:** upper `sin(4.1x+0.6)·0.018 + sin(9.3x+2.2)·0.007` rad; lower 0.012/0.005.
- **Squint:** upper ×(1 − 0.25s), lower ×(1 − 0.2s). Glare `smoothstep(0.55, 0.95, lum)`, goal 0.6 × glare.
- **Margins never cross:** up ≥ lo + 0.004 rad.
- **Lid shadows on the globe:**
  - under the upper lid −66% within 5.6 mm, −50% within 0.8;
  - above the lower −14 % within 2.5 mm, −12 % within 0.6 (the white runs light down to the rim, as in the user's photo; −26/−30 drew a dark line there);
  - canthus pocket ×(1 − 0.28c²) (was 0.55);
  - lash fringe ≤ 0.75.

## Margin face (nodes/lid-mesh.ts)
- **Inner face shows** (`rimShow`, now in margins.ts): upper 0.14; lower 1.0 mid-lid (its true projection, ~0.44 mm under the iris), falling to 0.55 toward the corners. At 0.5 it was a red line; the old 0.9 ledge was matte and pink, which read as cement. The white's lower shadow is measured from the same back edge (`loF`).
- **The lower margin (R6), from the globe out:** the junction, t 0.68–0.95, pale pink-beige (`mix(FLESH.mucosa, (0.62, 0.46, 0.4), 0.45)`); the intermarginal strip, `FLESH.rim`, mottled ±8 % along its length; then the lash roots. Wet all across (mirror level 3.5, ×0.55), plus a broad tear-film sheen (N·H)^28 × 0.22. In the photo (graded): white 90, junction 85, strip 67–77, lash line 49 L*.
- **Its back edge rests on the cornea** where the cornea is under it (`corneaLift`, lid-mesh.ts): on the globe's sphere the cornea hid its last strip and the iris showed as a dark line under the meniscus. The meniscus's globe side follows.
- **Punctum:** 6.3 mm from the canthus (across the shot) on the lower margin, a papilla ×1.16 over 0.45 mm with a 0.3 mm shadowed opening (×0.4, never black); medial of it the margin is lacrimal, 40 % toward the mucosa.
- **No droplets.** The rim's sparkle is the skin's (§ Skin: micro-relief and the wet lash roots). Round specks in a band read as glitter (user, round 2).
- **Grey line:** upper only, 0.1–0.35 mm.
- **Lash line** (0.02, 0.016, 0.015): upper 0.88 over 0–0.95 mm (a dense dark band of roots); lower 0.5 over 0.16–0.72 mm, a shadow not a stroke.
- **Upper inner face** 85 % toward (0.06, 0.04, 0.035) from the mucosa: in shadow, never a rust line.
- **Meibomian orifices:** not drawn. At the loader's framing the strip is ~0.44 mm deep across the image, so a 0.08 mm orifice is sub-pixel and would shimmer.

## Inner corner (nodes/canthus.ts, R6)
- **One field, no mesh.** The caruncle, the plica and their blush are drawn over whatever lies behind the lids (the white, the socket past the globe's edge), looked up where each view ray crosses the plane z = 3 mm, and lit by the field's own light, so the two surfaces never show a seam. *Why:* the egg mesh's see-through edge banded into an outline, and it stood 1.5 mm proud as a bead.
- **Where:** u, v mm from the canthus (margins at s = −1: θ −0.075, x = sin(φM)·13.1·cos 0.075). Computed only for u −0.8..7.6, |v| < 4.6; everything fades by |v| 3.6–4.4.
- **Caruncle:** an ellipse, half-width 1.3 (it fills the lake to the canthus), half-height 2.5 (mostly under the lids), lobed by noise, centre 1.05 + 0.3·gaze.x mm out; a 0.28 mm mound; papillae (7.5/mm) tip the light's normal, not the tear film's. In the tight corner ~2–3 mm of it shows, rose-red, its top in the upper lid's shadow.
- **Plica:** a crescent, free edge at u = 2.5 + 0.22v², a 0.26 mm fold, pale (FLESH.plica); only a short crescent shows: its horns fade by v 1.1–1.9 up and −0.8..−1.4 down (they run under the lids; a long pink horn drew an outline round the white).
- **Blush:** the white's own albedo × up to (0.8, 0.58, 0.54) from the plica's edge to 1.3 mm out, faded with the horns.
- **Light:** wrap (0.5, 0.32, 0.26), red bleed, the lids' shadow (socketShade3d on the margins' sphere, ×0.9: dark red under the upper lid, as in the photo, L* 28 against 50), a pocket ×0.66 → 1 over u −0.4..1.6. The canthus it measures from is the margins' (`lids.drop`), not a constant.
- **Wet:** the screen mirrored at level 3.6 on the macro form (×0.22 → 0.26 on the caruncle); a few droplets, ~1 per mm², 0.044–0.084 mm across. *Why droplets:* a highlight lobe on the bumps spread into white blotches.
- **Tissue colours** (`FLESH`, linear, `mix(tone, flesh, share)` so a darker person stays pigmented): rim (0.56, 0.36, 0.18) 0.32; mucosa (0.7, 0.3, 0.24) 0.3; caruncle (0.75, 0.28, 0.22) 0.38 (rose-red: the ungraded photo 4 measures L* 50, a* 20, b* 15, hue 37°; the orange of round 1 read wrong); plica (0.7, 0.5, 0.46) 0.6.

## Lid mesh and face shell
- **Mesh:** 320 × 64 grid. α runs round the eye, q outward to 36 mm; the inner face is 14% of the rows.
- **Rows** are denser near the margin (pow 1.6). Skin is anchored far out, so a blink never drags the brow.
- **Corner fan:** from s 0.62 (inner) / 0.72 (outer) onto a fixed bisector. Following the margin made the skin fold over itself.
- **Face shell** height:
  - `11 − kx·x² − ky·y²` (falls fast to the temple, slowly to the nose);
  - brow ridge (2026-10-29, the bone the user found missing): 3 mm at y 10.8 (σ 2.7, x σ 17) plus 0.8 over the forehead (y 13.5, σ 5); was 1.6 at y 10.5 (σ 3.3); cheekbone rim 1.4 mm at (12, −14), on top of the cheek's 1.2;
  - trough under the lower lid; brow fat pad (no hollow under the brow); nose; cheek.
  - Lid and face are joined by a smooth max, k = 2 mm.
- **Folds:**
  - The upper crease hugs the margin near the nose and rises over the middle.
  - The fold overhang is `hood·0.9 + depth·0.6 + 0.3`, stretching looking up and bunching looking down (clamp 0.75–1.25).
  - Lower lid (R7): pretarsal roll at 1.5 mm (σ 1.5, 0.42), crease at 4.4–5.2 (σ 1.1, 0.3), lid–cheek junction 1.6 mm below it (0.1), the cheek rising 4 mm below it (0.22); tear trough 0.35 mm, y −11.5 (σ 2.2), toward the nose (x −6, σ 7). (A 0.9 mm trough across the lid and a 0.36 mm bag made an eye-bag.)
  - Both lids blend 50/50 at the corners, so the hood runs round the outer corner.
  - The crease shadow is ≤ 0.4.

## Lashes (nodes/lashes.ts)
- **Count:** T1 120/50, T2 190/110, T3 250/150 (upper/lower; was 80/24, 130/70, 180/100: the user's photos show a thick dense fringe above and many lashes below). Length 6.9 / 4.8 mm (7.2 / 5.2, then 8 / 5.6 on 2026-10-29, which with the visible tips read too tall; measured 7.3–7.5 / 5.0–5.6), × (0.62–1.22), 12 % short new ones (×0.35–0.6); 10 segments.
- **Shading:** Kajiya–Kay diffuse; R lobe (white, wet, shifted −0.08 toward the root, `^90`, 0.14, ×0.35 on the lower lashes so their tips stay brown); TRT lobe (warm, +0.12, `^28`, 0.08). Tips: the person's tip colour ×1.2 upper, ×1.6 lower (the lower lashes dark too; ×2.6 browned them).
- **Variety (R9):** curl jitter upper 0.55–1.45, lower 0.8–1.5; fan jitter upper ±0.21, lower ±0.45 rad; a sideways wander `sin(t·(0.8–2)·π + φ)·amp·len·0.06·t`, amp `rand²`; roots pulled 25 % toward their clump's middle; tips turned 95 % of the way to meet.
- **Rows:** upper 3 rows at d 0.05 + 0.1·row; lower 2 at 0.16 + 0.08·row.
- **Lean:** upper 0.15 ± 0.2 rad, lower 0.7 ± 0.225. Fan stays over the eye.
- **Curl:** upper 0.45 + 0.9c; lower 0.55 + c (every lower lash curls; at 0.75 + 1.3c they looked short).
- **Width:** 0.09–0.12 / 0.065–0.085 mm (batch B's 0.07–0.095 / 0.05–0.07 read thin against the user's dense dark lashes); taper to a visible tip: mix(0.2 upper / 0.14 lower, 1, (1 − t)^0.85) × a root bulb (+20 % over the first 0.14); at `(1 − t)^1.05` the tips fell under a pixel and the upper fringe looked cut off.
- **Anomalies (2026-10-29):** 5 % crossers (fan ± 0.8 rad), 5 % kinked (wander amplitude 1.2–2, 1.6–3 waves), 3 % long (× 1.3), 3 % of the upper drooping (lean + 0.45), on top of the 12 % short new ones.

## Brow (bake/brow.ts)
- **Bounds:** x −15.5, y 5.4, 38 × 12.5 mm (10.5 before R10's deeper brow).
- **Hairs:** 440 / 920 / 1240 (2026-10-29: at 1450 no skin showed and the brow read as a patch stuck on; hair over skin × 0.9, was 0.97); before that 520 / 1080 / 1450 at 1024 / 1536 / 2048 px (denser again, 2026-10-28: the user's brow is a thick dark mass; was 390 / 810 / 1080) (×1.5 with R10's deeper brow: at the old count the finer hairs averaged to a grey haze at the loader's framing).
- **Lower edge:** 8.2 at the head, 9.3 at the arch, 6.7 at the tail. History: 10.2 → 9.2 → 8.2; about 4–5 mm over the lashes.
- **Depth (R10, the user's call):** 4.4 at the head → 3.9 in the body (was 3.2 → 2.7, then 4.8 → 4.3; the user's brow measures ≥ 7 mm on photo 4; they chose ~4.5, then very slightly narrower). The lower edge stays; the brow grows up.
- **Flow:** the head stands up (1.35 → 0.95 rad), the body herringbones (lower 0.62 → 0.3, upper −0.02 → −0.32), the tail sweeps down.
- **Hair (R10):** length 2.6 mm at the head → 6.2 in the body → 4.8 in the tail, × 0.7–1.2 (brow hair grows ~0.15 mm/day for 1–2 months: 5–9 mm); width 0.07–0.105 mm, taper (1 − t)^0.9, alpha 0.75–1; flatter in the body (flow × 0.8); bend 0.18–0.48 rad along the flow, toward the ridge. No strays (the user: remove the extra hair); the edge hairs (v within 0.18 of an edge) are up to 35 % shorter and turn 35 % toward the brow's line, so none pokes out. Blue channel = root 0 → tip 1 (the shader browns only the tips: root→tip colour 0.05 + 0.5·along²; browning the whole length greyed the brow). Vellus: 900 fine hairs per 6 mm tile.
- **Shading:** skin under the brow −14%; cast shadow −32%, offset 0.4 mm toward the light (hairs stand off the skin; was 0.1); the brow ridge shades the hollow under it by up to −(0.1 + 0.35·the key's upward slope), lit when the screen is below; the orbit's nasal hollow −14 %; sheen (R10) two lobes like the lashes: R white, shifted −0.06, `^40` × 0.018; TRT warm (1, 0.72, 0.5), +0.12, `^20` × 0.006 (at 0.05 / 0.018 a grey-blue haze under bright pages); × (0.4 + 0.6 sin(π·along)) so it fades at root and tip. Lit by the era's page (key).
- **Move-net** (`nodes/brow-net.ts`): five nodes at u 0, 0.22, 0.42, 0.7, 1. The skin already rides with the lid, so the net only reshapes.
  - frontalis: the arch node (u 0.42) rises by `brow` mm; the head and the tail barely rise;
  - corrugator: the head node in by 1 mm, down by 0.9;
  - orbicularis: `(0.5·squint + 0.25·blink)·(0.4 + 0.6u)`, the tail most;
  - a node moves its whole thickness together, so the brow does not scale. The hairs are sampled on the curve before the move.

## Skin (bake/skin.ts, bake/skin-face.ts)
- **Mesh-space bake** (2048×256): pores, lid lines, crease wobble, crease breaks.
- **Face-space bake:** a 6 mm seamless tile (pores 15/mm, grain, sheen, micro-relief) plus a 64 × 48 mm map (mottle, freckles, crow's feet from the outer canthus, which now sits `dropL` under the equator). Baked because procedural skin was the dearest pass (14 of 25 ms).
- **Micro-relief (tile A):** furrows at (24, 14) and (−14, 24) cycles per tile (~0.22 mm apart, crossing near square), groove `smoothstep(0.8, 1, |sin|)`, wander ±0.35 cycles (more melted them into a marbled maze), each family present in patches; pores −0.3.
- **Sparkle (lid-mesh.ts):** micro-normal `N − (∂h/∂x, ∂h/∂y, 0)·6` (taps 0.02 mm apart); facets `(Nm·H)^32` plus a broad lobe `(N·H)^8·0.14`, × oiliness (0.1 far out → 0.7 by the eye, + the strip, + 1.6 on the lower lid within 0.1–1.4 mm) × (0.4 + 0.6·h), × 0.26 lower lid / 0.13 upper; the wet lash roots (d 0.08–0.75) add sharp glints `(Nm·H)^110 × 0.9`. Coloured by the screen's key light, as all its reflections are. Cost: +0.2–0.7 ms on the scene pass at the loader framing (T3, 610M, A/B in one page).
- **Micro-relief (bake/skin-face.ts tile A, rebuilt 2026-10-28):** a soft tiling cellular net, not crossing line families (woven cloth) nor big plates (crocodile at 0.35 mm, ~14 px): primary 40 cells per 6 mm tile (~0.15 mm, ~6 px at 41 px/mm), stretched ×1/0.82 along x (the tension lines round the eye), furrow width 0.16 cell, depth × (0.4–1.0), −0.32; a finer net (90 cells) −0.14 where a noise lets it; pores at some junctions, −0.28. Tile 1024 px. In colour only −1 to −2.5 %; sparkle micro-normal ×3; self-shadow 0.97–1.02.
- **Screen-time oil (2026-10-29):** a soft lobe `(N·H)^12 × 0.045` and a relief-broken one `(Nm·H)^48 × 0.085 × (0.6 + 0.8·tile.b)`, × the zone (0.3 everywhere, up to 0.95 on the brow ridge y 9–15, the nose side x < −11, the cheek top y −16..−8), × Fresnel (0.75 + 1.5F), in the page's key; brow hair ×0.15.
- **Albedo (2026-10-28, the user: the skin read as camouflage print):** mottle ±4 % (was ±10 %); the 6 mm tile read twice, the second turned ~37° at ×0.73 and averaged, so its repeat never lines up; furrow cavities −5 % by the eye → −2 % far out (was −16 %); pores −6 %, grain ±1.5 %; the skin self-shadow 0.93–1.05 by the eye, fading by 16 mm (was 0.78–1.12 everywhere).
  - undertone: `mix((0.93, 1, 0.86) golden, (1.06, 0.94, 0.92) pink, undertone)`;
  - thin lid skin warmer within 5 mm, ×(1.07, 0.93, 0.9) (×(1.12, 0.86, 0.86) turned Monk 8 mahogany, hue 43°);
  - the micro-relief's furrows as cavities, ×(0.84 → 1) by its height;
  - pores −8%;
  - periorbital: upper ×0.8 near the eye; lower ×0.58 over 3–11 mm (the roll under the lashes stays light), ×0.84 → 1 by 15 mm (2026-10-29, verified at the loader's distance: weaker didn't read);
  - lower-lid fine lines ×2.2 the upper's with a finer crêpe between (0.34 mm, −16 %); under the brow −38 % always, −68 % with the screen above; the brow's roll +12 % along its top; brow ridge 3.8 mm (σ 2.4);
  - vellus from 0.8–2 mm out, albedo lift 0.2, lower-lid sheen 0.035;
  - fine creases every 0.62 mm, −22% with a +7% lit edge;
  - crow's feet scale with squint.
- **Light:**
  - wrap (0.46, 0.34, 0.28) × 0.62 (phone) → 1.05 (window), so the bone round the eye reads (was ×0.8–1.3), with red bleed (0.2, 0.07, 0.035) at the terminator (less on Monk 8);
  - overhead room light for modelling;
  - the screen's picture thrown on the face at mip 8, 22%;
  - Fresnel 0.03, oilier near the eye; sheen broken by pores.

## Framing (framing.ts) and camera
- **Wide box:** halfW 16, top 12, bottom −10. Phone bottom −16. Blended over aspect 0.75–1.1.
- **Span** = `max(top − bottom, 2·halfW/aspect) / MM_PER_UNIT` (≈ 17.39 mm per unit).
- **Camera:** FOV 12°, distance ≈ 105 mm at 16:9, no rotation.
- **Focus:** iris 11.6 mm, lashes 15.5; bokeh 2.8 (was 6.5).
- **Room** #040507, with an out-of-focus monitor up-left.
