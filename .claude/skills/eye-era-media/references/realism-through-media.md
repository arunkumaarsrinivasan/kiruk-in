# Realism through the ten media

The realism pass (`docs/EYE_REALISM_PLAN.md`) changes the eye under every medium. This file says what each medium keeps, what it must read from the eye, and which branch to re-check when a phase lands. Shared contract: `eye-loader-system/references/era-realism.md`.

## What the kit must read (C4): changes the realism pass brings

| Before | After | Phase | Why |
|---|---|---|---|
| `pupilR` = geometric pupil | **built (R1):** the pupil as the cornea shows it, ×1.13 (`twin/optics.ts`); `pc` turns about the entrance pupil (~9.95 mm out), not 10.4 | R1 | refraction magnifies the pupil; signs drifted off it |
| a circle at R | **built (R1):** `F.Rx`, `F.Ry` (`medium.limbus`, foreshortened with the gaze), `limbus(F, p)` (1 on the visible limbus) and `limbusR(F, p)` (its radius toward p). `cornea()`, 1981's selection, 1991's iris, 1995's link ring, 2013's dial clip and hover glow, and 2026's limbus fit and ticks all use them. `F.R` stays the eye's scale (6 mm): `kc`, offsets, sizes | R1 | the sclera overlaps the iris top and bottom |
| `almond()` = `(1 − x²)^0.75` × real reach, meeting the real canthi (`apC`, R6 round 2) | margins sampled from the twin (a uniform array, e.g. 16 points per lid) | R6/R7 | the curve's shape between the corners still drifts from the real lids |
| 2026 crease, brow, under-eye = `e + R·(x, y)` | the real crease point and brow-net nodes as uniforms | R7/R10 | landmarks must sit on features |
| — | `ERA_MEDIUM.floorPx`: the smallest feature the medium shows | R8/R15 | the scene fades micro-detail to it |

## Re-check per phase

| Phase | Re-check these branches |
|---|---|
| R1 | 1981 page cap ×0.68 and XOR disc; 1991 invert region; 1995 link ring; 2013 limbus segments and dial clip; 2026 limbus and pupil fits; 1970 cursor and 2000 caret centring; `develop()`'s cornea mask |
| R2 | 2013 dial (the sliders read the fibres' tone); 1997 JPEG blocks in the darks; 1981 ink edges on crypts |
| R3 | 1995 web-safe landing (≥ 2 browns, not one); 1997 chroma bleed; 2003 saturation (no rust); 2009 fade |
| R4 | every sign in the pupil; 2003 flash reflex; 2026 pupil-mm readout |
| R5 | 1995 shadow mask on the white; 2026 instrument ink flipping over pigment near the limbus |
| R6 | 1991 underline on the lower wet rim; 2026 canthi landmarks; `almond()` |
| R7 | `almond()`; 2013 elevation (depth alpha); 1997 banding; 2026 crease landmark; the shut frame mid-cut in all ten |
| R8 | 1981 ink speckle; 1981 and 1991 periorbital mask; 2013 relight (`relief` ratio); 2026 plate |
| R9 | 1970 rows; 1981 strokes |
| R10 | 2026 brow landmarks; framing |
| R11 | all ten under their own light (1997, 2000, 2003 and 2009 need batch 2) |
| R12 | 2026 plate; 2009 lower meniscus line |
| R13 | 2026 tracker dropouts on partial blinks |
| R14 | the order: idle refine and FXAA before the lens grain and the medium |

## Per medium: what it keeps, and how realism should serve it

| Era | Floor | Keeps | Realism must give it |
|---|---|---|---|
| 1970 | 7 px vertical | crypts, collarette, clumps, folds, brow groups, page | strong macro form and silhouettes; lashes and lid edge dark against the page |
| 1981 | 7 px; edges as ink | edges: lash line, crease, limbus, hairs, pupil | clean local-contrast minima exactly on features; no micro speckle (floor) |
| 1991 | 4 px | fibres, vessels, lashes, hairs | iris fibres at ~5 px; a real lower rim for the underline |
| 1995 | 6 px | crypts, lashes, the wet white | iris relief spanning ≥ 2 web-safe steps; a believable wet white |
| 1997 | 4 px luma / 8 colour / 16 px blocks in darks | lit fibres, banded form | smooth large gradients (banding reads as era, not error) |
| 2000 | 6 px | crypts, lashes, form | under-light form; tear break-up on the page |
| 2003 | 1–2 px | everything | everything, hue-true under saturation ×1.3 |
| 2009 | 2–3 px, soft | everything, soft | down-gaze lids; the lower meniscus line |
| 2013 | parts + per-pixel relight | detail as part shading; fibres as the dial | radial fibre/depth contrast; pixel relief for the relight |
| 2026 | 1 px, B&W | everything as luminance | real geometry for the fits and landmarks; clean luminance structure |

## Rules
- **Never change a medium to hide a realism regression.** Fix the eye, or record the conflict in the plan's drift log. *Why:* the media were signed off one by one; a medium tuned around a bug breaks when the bug is fixed.
- **A realism phase never adds per-era branches** to the scene. Per-era differences are `look.ts` data (C11).
- **Check the shut frame mid-cut in both media** of every pair you film (C8).
