# Realism pass: anatomy (R5–R10)

Spec: `docs/EYE_REALISM_PLAN.md`. Shared contract and era cards: `eye-loader-system/references/era-realism.md`. † marks the reference repo's defaults; verify them in the research card. Anatomy is the person: every change here shows in all ten eras (C1).

## R5 · Sclera and conjunctiva
**Built (2026-10-28, batch A), waiting on the user's review:** the grown network (bake/vessel-net.ts), limbal melanosis (`sclera.pigment`). Not yet: the micro-relief on the white's reflection, a pinguecula. Numbers: `anatomy-numbers.md` § Sclera.
- **A grown vessel network,** seeded, on the CPU or offline, rasterised into the globe map:
  - episcleral vessels 0.06–0.12 mm†, fairly straight toward the limbus;
  - conjunctival vessels 0.02–0.05 mm†, tortuous and branching;
  - loops at the limbus;
  - deep vessels blurred.
- **Layers:** thin wet conjunctiva over Tenon's over sclera. Deep vessels violet-red and soft, superficial ones red and sharp. A micro-relief breaks the page's reflection on the white.
- **This person** (verify with references): a warmer white (`#e4dccb` stays); patchy conjunctival melanosis near the limbus; a pinguecula only as an off-by-default age option.

## R6 · Margins and canthi
**Built (2026-10-28, batch A), waiting on the user's review:** the inner corner as one field (nodes/canthus.ts, no caruncle mesh), the lower margin at its true projection (junction, strip, sheen, droplets, punctum), its back edge on the cornea. Not yet: Marx's line, placed meibomian orifices (sub-pixel at the loader's framing), caruncle hairs, the outer corner's overlap, the media's margin samples (C4), and the medial corner at 14 mm (the twin's todo). Numbers: `anatomy-numbers.md` § Margin face, § Inner corner.
- **Across the ring's inner rows:**
  - posterior margin on the globe;
  - intermarginal strip;
  - Marx's line;
  - meibomian orifices (~30 upper, ~22 lower†, a few capped), placed, not noise;
  - grey line;
  - lash line on a quarter-round anterior edge;
  - punctum on a papilla.
- **Inner corner:**
  - the lacus floor;
  - the caruncle as part of the conjunctiva surface, not a separate sphere, with fine hairs and sebaceous dots;
  - the plica crescent;
  - pockets closed (no line of sight to the room).
- **Outer corner:** acute, with a slight overlap.
- **The margins feed the media** (C4): sample the twin's margin curves into a uniform array the kit's `almond()` and 1991's underline read.

## R7 · Lid and periocular form
**Built in part (2026-10-28, batch B):** the lower lid's three bands (roll, crease band, cheek), a shallow medial tear trough, periorbital darkening moved below the roll. Not yet: the tarsal plate over the corneal bulge, the hood's own texture and overhang, rows by curvature, the form around (brow ridge, rim, temple). Numbers: `anatomy-numbers.md` § Lid mesh.
- **Upper lid:**
  - the tarsal plate rides over the corneal bulge as the eye turns;
  - the hood truly overhangs its crease (rows turn back);
  - the crease point feeds 2026's landmark.
- **Lower lid:**
  - a wedge filled by orbicularis (no groove);
  - pretarsal roll;
  - lid–cheek junction ~6.5 mm† below the margin;
  - tear trough.
- **Form around:** brow ridge, orbital rim, nasal sidewall, temple.
- **Rows by curvature** (a sagitta tolerance) in the vertex stage.
- **The shut lid (C8):** skin over the corneal bulge, the lash lines meeting, no light arc where the lid stands off the cornea. It is on screen in every cut.

## R8 · Skin surface
**Built in part (2026-10-28, batch B):** the person moved to Monk 8 with a golden undertone (the user's call, from their photos), less red bleed and pink, the micro-relief as cavities in the albedo, vellus from just under the lashes. Not yet: follicle stars, scale-correct subsurface, the medium floor for micro terms.
- **One baked relief:**
  - star furrows from follicles on a jittered ~0.6 mm† grid;
  - follicle pits 60–100 µm†;
  - pore dimples;
  - ~0.08 mm† secondary cushions;
  - crepe along the margin;
  - crow's feet;
  - tension lines.

  Channels: gradient, albedo, cavity. Read at the footprint mip.
- **Monk 8 pigment (Monk 9 until batch B):**
  - melanin mottling ~6 and ~1.3 mm†;
  - periorbital pigment in the upper sulcus and under the eye, capped at ×0.85 (it must not ink into a mask in 1981 or 1991);
  - pinker thin skin toward the margin;
  - few visible veins.
- **Scale-correct subsurface:** read the relief gradient one or two mips higher for red, one for green, none for blue.
- **Per-vertex screen irradiance;** form-following oily GGX (never clustered: a rash); a wet mirror only near the margin.
- **The medium floor (C5):** micro terms fold `ERA_MEDIUM.floorPx` into their footprint and are skipped when faded.

## R9 · Lashes
**Built (2026-10-28, batch B):** variety (length, curl, wander, crossing), clumps with gaps (roots bunch), all lower lashes curled and finer with brown tips, root bulb and fine tip, R and TRT lobes. Not yet: shadows and reflections (R11), the 1-bit and row media's clump rhythm check.
- Keep 3 upper and 2 lower rows, clumps, the 0.6 px minimum and the spring lag.
- Add: curl solved from lift and curl, root bulbs in the margin, a taper to fine tips, Kajiya–Kay plus two shifted lobes (white cuticle, warm TRT), lighter tips.
- In 1-bit and row media the clump rhythm and silhouette are what survive: tune those first.

## R10 · Brow
**Built (2026-10-28), waiting on the user's review:** depth ~4.5 mm (the user's call), long flat layered hairs with skin between, short head, strays, tips browning, a two-lobe sheen lit by the page. Sheets `docs/era-pov/r10/`. 2026's brow landmarks read `lower + depth/2` from the same curve, so they follow the deeper brow on their own.
- Strands: density from head to tail, upright hairs at the head, herringbone body, sparse tail, skin between hairs, sheen along the hair (never per-hair glints).
- Muscles unchanged.
- The brow-net's node points feed 2026's three brow landmarks (C4).

## Per era: what the light and posture do to the face

| Era | Key from | Posture | Lids and folds | Brow | First anatomy target |
|---|---|---|---|---|---|
| 1970 | below | reading, slightly down | the hood's underside and waterline lit; the crease shadow is faint (light from under it) | the under-brow lit | lid form, lash silhouettes |
| 1981 | above-left | scatter | the crease a dark line with a lit edge (ink + paper); lash shadow on the iris top | hairs as ink strokes | crease, lash rhythm, brow hairs |
| 1991 | above + lamp low left | reading, slightly up | side light rakes the lid and orbital rim; one side darker | arch shadow sideways | orbital form, lower wet rim (underline) |
| 1995 | below, dim blue | wide scatter | form only (3 px cells) | groups | caruncle stays rose-brown at saturation ×1.35 |
| 1997 | above-left (batch 2) | lateral two-target | smooth gradients band into contours | blocky in darks | smooth large form |
| 2000 | well below (batch 2) | locked, down | upper lid lower; the hood's underside lit; lashes shade the lid | lit from under | down-gaze lid, under-light |
| 2003 | front, window right (batch 2) | idle, slightly down | every fine detail visible | strands visible | margins, skin micro, pigment |
| 2009 | below, close (batch 2) | down, lids lowered | the upper lid drapes over the corneal bulge; crisp upward lash shadows | lit from under | tarsal ride over the cornea |
| 2013 | above, crisp | up into the lens | upper lid lifts, hood stretches, more white below the iris | lifts (0.6 × gaze up) | up-gaze hood, brow lift, pixel relief (relight) |
| 2026 | window, soft | eye contact | soft open shadows; every detail as luminance | landmarks on real nodes | crease and brow points feeding landmarks; skin micro |
