# Realism pass: light and optics (R1 cornea, R11, R12, R14)

Spec: `docs/EYE_REALISM_PLAN.md`. Shared contract and era cards: `eye-loader-system/references/era-realism.md`. Values marked † are the reference repo's defaults; verify them against a source in the phase's research card before use.

## R1 · The cornea
- **Anterior surface:** a conic, R ≈ 7.8 mm, Q ≈ −0.25†. It meets the 12 mm sclera sphere at the limbus through a C2 blend that dips slightly into both (the sulcus).
- **Posterior surface:** a sphere ≈ 6.5 mm†, 0.55 mm behind the apex.
- **Surface point:** refine the raster point onto the exact surface by Newton steps along the view ray. Normals are analytic.
- **Refraction:** two surfaces, cornea 1.376 then aqueous 1.336.
- **Test (TS twin):** the entrance pupil sits ~3.04 mm deep at ×1.13.
- **The page in the cornea:**
  - The conic changes only how it bends and blurs toward the rim.
  - Its size stays `ERA_LIGHT.size` ×0.62 (~60 % of the iris).
  - 1981's medium cap (×0.68 paper) stays.
  - *Why:* the size is art direction ("a whole-iris reflection read as a lens").
- **The media's uniforms:** `M.irisR`, `M.pupil` and `pupilR` become the apparent (refracted) values. Otherwise the signs in the pupil drift.

## R11 · Shadows, occlusion, near reflections
**Part 1 built (2026-10-28):** `ERA_LIGHT.real` → `light.penumbra`; `socketShade3d` casts each lid along the key (upper edge 2.4 mm proud, lower 1.6), soft by penumbra × gap, × 0.55 / 0.4; contact occlusion −36 % over 4.5 mm and −30 % within 0.8 mm under the upper lid, whatever the light. **Parts 2–6 built (2026-10-28, not rendered):** near reflections in the cornea (lid skin and a lash comb, only off the page); lash shadow softness = h × (0.3·penumbra + 0.04) + 0.25, streaks in crisp light; contact shade × (0.36 + 0.18·closing); skin self-shadow from the tile's micro-normal (× 0.78–1.12); wrap × 0.8 (phone) → 1.3 (window). The lids in the white's mirror added 2026-10-29 (same shell and comb as the cornea's, off the page only).
- **Prerequisite:** batch 2's lights (1997, 2000, 2003, 2009).
- **`ERA_LIGHT` gains:**
  - `realMm: [w, h]` and `distMm` (the device as it was);
  - `spectral` (0.3 today; how much of the page's hue the key carries);
  - per fill, `catchlight: boolean`.
- **Lid shadow:** project the margin curves along the key direction onto the globe. Penumbra = gap × `realMm.h / distMm` (per-era values in the table below). Caps from eye-anatomy stay.
- **Lash shadow:** per-lash streaks at T3, density at T2/T1, projected along the key.
- **Skin self-shadow:** a horizon map from the baked relief, plus bent normals for the crease and hood.
- **Contact occlusion:** analytic from the margins, so it follows gaze and blink (the reference's baked AO doesn't).
- **Near reflections:** in every mirror ray of the cornea and the white:
  - the lids as skin radiance (a sphere just outside the globe, inside the fissure map);
  - a comb of lash strands at the margins (~4.5/mm†, reaching 0.7 of the upper lash length above and 0.55 below).

  They are dark, never brighter than the page.
- **The screen as an area light** (polygon irradiance or LTC) for the skin and sclera diffuse, using `realMm`.

## R12 · Tears and meniscus
- Keep the live film, break-up and reflex tears.
- **Meniscus:** a concave fillet with exact normals, radius ~0.36 mm† lower and thinner upper. It tapers where the margin leaves the globe and widens at the tear lake.
- **The page in the meniscus:** a thin bright line. Brightest when lit from below (2009, 2000, 1970).

## R14 · Lens, antialiasing, post
- **DOF:** tile max-CoC early-outs; a full-res near blur under 2–3 px (lashes, margins).
- **FXAA:** after the tonemap, in linear light; before the display stage's grain.
- **Idle refine (optional):**
  - pre-lens, pre-medium;
  - resets on any blink, saccade, cut or era change;
  - converges in ≤ 4 frames;
  - kept only if a 1:1 diff at rest shows edge AA alone.
- **Merge** the lens display stage and grain into one pass.

## Per era

Penumbra in mm per mm of gap. "Shadow falls" describes where the key puts the lid and lash shadows.

| Era | Key from | Penumbra | Spectral (today 0.3) | Shadow falls | In the cornea | Tears |
|---|---|---|---|---|---|---|
| 1970 | below, slightly right | 0.30 | A/B only (benchmark) | above the lower lid; lashes onto the upper lid; the hood's underside lit | page only; lash comb against it | break-up at ~5.5 s stares |
| 1981 | above-left | 0.46 | 0.3 | under the brow, across the top of the iris | page, capped ×0.68 | — |
| 1991 | slightly above; lamp low left | 0.43 / lamp 0.3 | 0.3 | down from the key; sideways from the lamp | page + small warm lamp disc | break-up at ~6 s |
| 1995 | below, centred | 0.38 | try 0.6–0.8 | above the lower lid | page only | — |
| 1997 | above-left (batch 2) | 0.43 | 0.3 | down | page | — |
| 2000 | well below (batch 2) | 0.42 | try 0.5 | up: lashes onto the lid, the lower lid onto the white | page only | most visible break-up (locked stare) |
| 2003 | front; window right (batch 2) | 0.53 | 0.3 | soft, slightly sideways | page + window rectangle | — |
| 2009 | below, close (batch 2) | 0.23 | 0.3 | crisp, upward | small phone + round lamp | bright lower meniscus line |
| 2013 | above | 0.18 | 0.3 | crisp, down across the top of the iris | small phone | — |
| 2026 | front window; fill left | ≥ 0.8 | 0.3 | soft, open | page + window | — |
