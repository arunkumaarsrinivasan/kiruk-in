# Realism pass: iris and pupil (R1 limbus, R2, R3, R4)

Spec: `docs/EYE_REALISM_PLAN.md`. Shared contract and era cards: `eye-loader-system/references/era-realism.md`. † marks the reference repo's defaults; verify them in the research card.

## R1 · Limbus (built 2026-10-28)
Built:
- the ellipse (`ANATOMY.limbusAspect` 0.906) in the cornea's mask and the globe's ring and halos;
- a faint warm limbal band (0.22);
- palisades as radial pigmented ridges above and below (0.26, reaching to ~1.06–1.13 of the limbus);
- the media reading `limbus()` and `limbusR()`.

The spec as planned:
- **The visible iris is an ellipse,** ~11.7 × 10.6 mm†: the sclera overlaps it more at the top and bottom.
- **Opacity band and limbal ring:** keep today's halo values as the start.
- **Palisades of Vogt:** fine radial ridges at the limbus. Pigmented and visible in dark eyes, strongest above and below.
- **A limbal pigment band** for this person (Monk 8). Verify both against references first.
- **The media read the elliptic limbus:** the kit gains `F.Rx`, `F.Ry` and `limbus(F, p)`. Every branch that draws at R uses it:
  - 1995's ring;
  - 2013's segments and dial clip;
  - 2026's limbus fit;
  - 1981's XOR disc;
  - 1991's invert.

## R2 · Iris relief (two baked layers, rest space)
**Signed off 2026-10-28.** The single parallax step and its bake are gone. The lab's "Iris relief" section shows the iris, clay, occlusion, steps and layers; proof in `docs/era-pov/r2/`.
- **Laid out once,** at the person's own resting pupil. The shader's rest space reads it at any pupil, so an era never bakes (it used to: ~70 ms of GPU in every cut).
- **Kept at runtime, not KTX2** (your call at sign-off): baked once behind the poster, ~60–95 ms; KTX2 would have been an estimated 4–6 MB.
- **Cost:** ~+1.6 ms a frame at iris-fill on T3, accepted over the 1.2 ms budget.
- **A brown iris is mostly its border layer:** the shell covers ~0.92 everywhere but the crypts, where only the trabeculae bridge and the floor shows. *Why:* fibres over an open floor everywhere read as hair on black.
- **No grey in a dark iris:** scatter is scaled by (1 − melanin). *Why:* 0.08 of grey over a dark zone made every fibre read as grey hair (it is also today's pale-strand look).
- **The detail stays as luminance:** the surface runs 0.6 → 1.5 × its zone across a fibre, the relief tap is ×4.5, the sheen 0.1. *Why:* at half that contrast the iris was right at 2× but lost, at the loader's framing, the detail today's pale strands showed (fine-tune keeps the detail). Judge at the loader's framing, not only in close-up.
- **Collagen arcs at 0.22 of the vessels.** *Why:* at full weight they read as a lattice.
- **Furrows are broad folds** (half-width 0.4 of the ring spacing, faded in and out round the iris). *Why:* narrow hard-ended rings read as scratches.
- **Self-shadow is marched, not a horizon map:** 2–3 steps toward the key from the floor, only where the floor shows. The floor and the crypts' walls block the key; a bridge passes 1 − 0.8 × its cover. *Why:* one light, so a 4-direction horizon map would double the targets for what three samples do.

The spec as planned:
- **Stroma floor:**
  - thickness profile (margin → collarette ridge → root);
  - collarette zig-zag (~34 % from the pupil);
  - crypts as radially stretched Voronoi cells with darkened walls, in a band hugging the collarette's ciliary side plus a sparse peripheral band;
  - contraction furrows on the outer ciliary zone;
  - ruff.
- **Fibre shell:**
  - radial vessels that wave (1.5–5 waves across the width)†;
  - collagen arcs both ways;
  - coverage, so they bridge over the crypts.
- **Baked with them:** AO and a horizon map (self-shadow toward the key).
- **Marching:** relief mapping with a binary refine per layer, at the footprint mip:
  - T3: 12 + 4;
  - T2: 6 + 3;
  - T1: today's single parallax step.
- **Light through thin bridges:** a transmission term from coverage × thickness. The reference has none.
- **Rest space:**
  - pupillary zone keeps its area: `r_c = √(r_p² + r_c0² − r_p0²)`, `r0 = √(r² − r_p² + r_p0²)`;
  - ciliary zone linear;
  - thickness ∝ area^−k.

  The pupil never needs a re-bake.
- **Dark brown rules:**
  - crypts shallow and low-contrast;
  - structure read by relief and a soft sheen, never by pale fibres (today's white strands read as drawn);
  - Wölfflin nodules are a light-iris feature: leave them out.
- **Budget:** ≤ 1.2 ms at T3 with the iris filling the frame.

## R3 · Iris colour and light
**Built in part (2026-10-28, batch A), waiting on the user's review:** colour from the layers by Kubelka–Munk (bake/iris.ts), the limbus as a soft ramp (cornea, sclera), the fibre sheen toned to 0.035. Not yet: light entering through the cornea (refracted key, Fresnel transmission, lid shadow at entry, a derived caustic), and the per-era re-check (§6 of the card) through each medium. Numbers: `iris-numbers.md`.
Research card: `docs/R3_IRIS_COLOUR_CARD.md` (sources, numbers, what is still unverified, the photos asked for). Key numbers: melanin K ∝ λ^−3.48 (blue ×3.6, green ×1.79 against red); dark brown is ~14.8 : 1 eumelanin to pheomelanin and ABL-heavy; stroma ≈ 0.37 mm thick, so a crypt floor sits near the black epithelium; measured brown irides L* ≈ 22, hue 45–55°.
- **Kubelka–Munk, offline,** for the one person:
  - ABL melanin high, mostly eumelanin;
  - stroma melanin, blood, scattering;
  - a black epithelium.

  Bake colour as a function of the local stroma thickness straight into the albedo, so crypt floors and furrows darken physically. No runtime LUT.
- **Light enters through the cornea:**
  - keratometric 1.3375 for its direction, with Fresnel transmission;
  - the lid shadow taken where the light enters;
  - the caustic crescent on the side away from the light.
- **Never recoloured per era.** The era's light does it.

## R4 · Pupil
- Keep the outline, interior, fundus, flash and red reflex.
- P3/P4 are traced off the real lens surfaces (Navarro), built 2026-10-28: see SKILL rule 8 and `twin/purkinje.ts`.
- The ruff's crenations come from R2. The entrance pupil must match R1.

## Per era

| Era | Pupil | What of the iris survives | Coupled media | Judge on | Watch for |
|---|---|---|---|---|---|
| 1970 | large: fibres bunch | crypts, collarette (rows 3.46 px) | the cursor sits on the apparent pupil | luminance | a ring too thin to read: R2 macro contrast |
| 1981 | small–med | crypt edges as ink | XOR disc on the elliptic limbus | luminance | fibres speckling ink (floor) |
| 1991 | smallest | fibres (2 px cells) | invert region | luminance | — (best iris era in B&W) |
| 1995 | large | crypts, at 3 px web-safe | link ring on the limbus | hue + luminance | the iris landing on one flat web-safe brown: needs ≥ 2 steps |
| 1997 | medium | lit fibres; darks in 16 px blocks | 4:2:0 bleeds the iris a pixel onto the white | hue | — (blockiness is the era) |
| 2000 | med–small | crypts | the caret on the apparent pupil | hue | TN dark inversion at extremes |
| 2003 | small–med | everything | — | hue | saturation ×1.3 turning brown to rust |
| 2009 | small (near reflex) | everything, soft | — | hue | warm fade muddying it |
| 2013 | small | fibre tone → dial sliders (rings 1–5) | dial clip, keyboard sized by the pupil | ramp mapping | weak radial contrast = a flat dial |
| 2026 | small | everything (B&W) | pupil and limbus fits | luminance | the fit ring not matching the visible limbus |
