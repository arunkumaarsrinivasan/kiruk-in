# Era realism: the shared contract and the ten cards

The realism pass (R0–R15, `docs/EYE_REALISM_PLAN.md`) makes one eye more real. The media repaint that eye, so every era gains from it. This file is what every eye skill reads before tuning a part for one era.

## Tuning any part for one era (walk this every time)

```
1. Read the era's card below: light, body, cornea, what the medium keeps, first, risk.
2. Does the change touch the person (shape, pigment, iris, lashes, skin)?
   ├── Yes → it changes all ten eras. Make it in identity/anatomy data; verify all ten (C1).
   └── No → continue
3. Which per-era table owns it? (C11: era realism is data, never a new branch)
   ├── light: direction, real size, spectrum, fills, catchlights → ERA_LIGHT
   ├── body: gaze rest, blink rate, follow → ERA_GAZE; pupil comes from the light via the rig
   ├── recording: grain, grade, aperture → ERA_LENS
   └── picture: cell, palette, floorPx → ERA_MEDIUM and the era's branch
4. Is the feature bigger than the medium's floor (table below)?
   ├── No → don't tune it for this era. Check that it fades instead of speckling (C5).
   └── Yes → tune it
5. Judge it in the era's own terms (C7), at rest AND in the shut frame mid-cut (C8).
```

## The contract

| # | Rule | Why |
|---|---|---|
| C1 | Per era, only light, the physiology that light and task cause (pupil, squint, blink and tear state, gaze posture, near reflex), the lens and the medium differ. Anatomy, pigment and identity never do. | One person in every era |
| C2 | A screen has two sizes: the stylised `size` (×0.62) places the page in the cornea; the physical size and distance light the face | Using the stylised size for penumbra blurs every shadow |
| C3 | Lid, lash and crease shadows are projected along the era's key, with its penumbra. Caps stay: corner pocket ≤ ×0.72, crease ≤ 0.4, socket ≥ 0.5 | A fixed band under the upper lid is wrong for light from below |
| C4 | The media read the eye you see: the apparent (refracted) iris and pupil, the elliptic limbus, margins sampled from the twin, the real crease and brow nodes | Signs and fits drifting off their features read as stickers |
| C5 | Each medium declares `floorPx`. Micro-detail fades to it and skips its cost when faded (a uniform `If`) | Sub-cell detail turns into speckle (1981 ink) or crawl (1970 rows) |
| C6 | Alpha is depth: 0.5 at focus, ±20 mm. Cornea or lid-form changes are re-checked in 2013's elevation and 2026's gimbal | The media build depth effects on it |
| C7 | 1970, 1981, 1991 and 2026 are judged on luminance; 1995, 1997, 2000, 2003 and 2009 on hue too; 2013 on how tone lands on its ramp and dial | Colour work is invisible in B&W eras; luminance structure is never invisible |
| C8 | The shut eye is shown in every cut, in both eras' media: the closed lid is a first-class target | It is on screen more than any single era |
| C9 | No new motion at rest beyond allowed physiology; every micro term footprint-filtered | Calm |
| C10 | In the cornea, the page is brightest. Named fills ≤ 35 %. Lids and lashes reflect dark. The page's size and framing are per era (`reflect`): the era's key interface must read, and a ring of iris must show round it | The screen is the key light, and the interface in the eye is the concept |
| C11 | Per-era realism extends `ERA_LIGHT`, `ERA_GAZE`, `ERA_LENS` and `ERA_MEDIUM`. Nothing branches on the era except the existing uniform switch | A new graph recompiles mid-cut |
| C12 | After sign-off: re-capture the opening's shut stills (if 1970 changed) and the posters. Re-align the tube's wiring after R1, R7 or R10 | Stale stills jump at the hand-off |

## Detail floor (1440×900: 1 mm ≈ 41 px; phone ≈ 18 px)

Feature px (desktop): pore 2–4, conjunctival vessel 1–2, episcleral 2.5–5, iris fibre spacing ~5, crypt 12–40, lash 2.7–5, meibomian orifice 2–4, brow hair 2.5–4.

| Era | Floor | Keeps | Loses |
|---|---|---|---|
| 1970 | 7 px vertical (rows) | crypts, collarette, lash clumps, folds, brow groups, page | pores, fine vessels, fibres, orifices |
| 1981 | 7 px; edges as 1-cell ink | lash line, crease, limbus, brow hairs, pupil, crypt edges | pores (must not speckle), vessels, fibres |
| 1991 | 4 px | fibres, episcleral vessels, lashes, brow hairs | pores, fine vessels |
| 1995 | 6 px | crypts, lashes, wet white | fibres, pores, fine vessels |
| 1997 | 4 px luma, 8 px colour, 16 px blocks in darks | lit fibres, vessels, banded form | dark iris, lash line, brow (blocky by design) |
| 2000 | 6 px | crypts, lashes, form | pores, fibres |
| 2003 | ~1–2 px | everything (colour showcase) | — |
| 2009 | ~2–3 px, soft | everything, softened | finest lines in darks |
| 2013 | parts + per-pixel relight | detail as part shading; fibre tone → dial | literal texture |
| 2026 | 1 px, B&W | everything as luminance | colour |

## Each era's light, physically

Penumbra = mm of soft edge per mm of occluder-to-surface gap (the device's real angular height in radians).

| Era | Device, distance, place | Real size | Penumbra | Spectrum | Fill (catchlight?) | Pupil (R0, mm) | Gaze, lids |
|---|---|---|---|---|---|---|---|
| 1970 | 12" mono CRT, 60 cm, below | 23°×17° | 0.30 | narrow green | none | large (4.55) | reading, slightly down |
| 1981 | 17" bitmap, 55 cm, up-left | 35°×27° | 0.46 | cool white | tube bar (no) | small–med (3.42) | scatter hops |
| 1991 | 17" grey CRT, 60 cm, up-left | 32°×24° | 0.43 | neutral | warm lamp low left (small disc) | small (2.96) | reading, slightly up |
| 1995 | 14" CRT, 55 cm, low | 28°×22° | 0.38 | navy, neon | none | large (4.28) | wide scatter |
| 1997 | 17" Trinitron, 60 cm, up-left | 32°×24° | 0.43 | warm | office bar (no) | medium (4.48) | two targets, lateral |
| 2000 | 14" TN, 50 cm, below | 31°×24° | 0.42 | cold CCFL | none | med–small (3.01) | locked, down |
| 2003 | 17" LCD, 50 cm, eye level | 38°×30° | 0.53 | blue + daylight | window right (yes) | small–med (2.70) | idle, slightly down |
| 2009 | 3.5" phone, 32 cm, low | 9°×13° | 0.23 | cool white | lamp up-left (yes) | small, near reflex (2.69) | down, lids lowered |
| 2013 | 4" phone, 50 cm, high | 6°×10° | 0.18 | cool white | tabletop (no) | small (2.74) | up into the lens |
| 2026 | window | ≥ 45° | ≥ 0.8 | daylight | warm white left | small (3.13) | eye contact |

Batch 2 built (2026-10-28): 1997, 2000, 2003 and 2009 have their own `ERA_LIGHT`, gaze rests and follows; 2003's lens has no flash.

## Where each phase matters

● defining, ◐ visible, ○ mostly lost (still built).

| Phase | 70 | 81 | 91 | 95 | 97 | 00 | 03 | 09 | 13 | 26 |
|---|---|---|---|---|---|---|---|---|---|---|
| R1 cornea, limbus | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| R2 iris relief | ◐ | ◐ | ● | ◐ | ◐ | ◐ | ● | ◐ | ● | ● |
| R3 iris colour | ○ | ○ | ○ | ◐ | ● | ◐ | ● | ● | ○ | ○ |
| R4 pupil | ● | ◐ | ○ | ● | ◐ | ◐ | ◐ | ◐ | ◐ | ● |
| R5 sclera | ◐ | ◐ | ◐ | ● | ◐ | ◐ | ● | ● | ◐ | ● |
| R6 margins | ◐ | ◐ | ● | ◐ | ◐ | ◐ | ● | ● | ◐ | ● |
| R7 lid form | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| R8 skin micro | ○ | ○ | ○ | ○ | ◐ | ○ | ● | ◐ | ● | ● |
| R9–R11, R13 | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| R12 tears | ● | ◐ | ● | ◐ | ◐ | ● | ● | ● | ◐ | ● |
| R14 lens, AA | ○ | ○ | ○ | ○ | ○ | ◐ | ● | ● | ◐ | ● |

## The cards (condensed; full text in docs/EYE_REALISM_PLAN.md §8.6)

**1970 · green terminal, night (benchmark: refine only).**
- Light: from below, green, no fill. The upper lid barely shades the white, and the lower lid shades a band above itself. The hood's underside and the under-brow are lit; the lashes shadow up onto the lid. Red tissue reads dark under green (spectral key by A/B only).
- Body: large pupil (bunched fibres); reading gaze; occasional tear break-up.
- Cornea: the page, with the lashes and lid edge silhouetted against it.
- First: R7, R2 macro, R9, R11, R4.
- Risk: pixel-diff against the signed-off look; re-capture the shut stills.

**1981 · Star bitmap, office.**
- Light: from above-left, soft (0.46). Shadows fall downward.
- Body: small–medium pupil; scatter hops.
- Cornea: the page, capped at ×0.68.
- First: the crease as dark line plus lit edge (the ink-and-paper pair), lash rhythm, brow hairs, limbus.
- Risk: pore speckle; a pigment mask.

**1991 · NeXT and a lamp.**
- Light: split, with a warm lamp low left. The crease and brow throw shadows sideways.
- Body: smallest pupil, so the most iris; fibres survive.
- Cornea: the page plus a small lamp disc.
- First: R2, orbital form, two lights, the lower wet rim (the underline sits on it, so feed it from the twin).

**1995 · home CRT at night.**
- Light: centred, low, blue-heavy and dim. Skin very dark, the white bluish.
- Body: large pupil; frequent saccades and blinks.
- First: the wet white (the shadow mask lives on it); iris relief so it dithers between two or more browns; the large pupil; the caruncle.
- Risk: neon caruncle and vessels at saturation ×1.35.

**1997 · office Trinitron (batch 2).**
- Light: warm page, up-left.
- The medium: 4:2:0 bleeds the iris onto the white; 16 px blocks in the darks; form bands into contours.
- First: smooth large form (it makes the banding), iris hue, sclera.

**2000 · TN at night (batch 2).**
- Light: strong from below.
- Body: locked, looking down; the longest stares, so tear break-up dims the page most here.
- First: under-light, tears, down-gaze lids, pupil.

**2003 · iSight daylight (batch 2).**
- Light: the softest screen, plus a window catchlight on the right.
- Everything survives: the colour showcase.
- Risk: saturation ×1.3 turning the brown iris rust and the vessels neon.
- Decide: the built `flash` artefact.

**2009 · phone held low (batch 2).**
- Light: small, close, from below, crisp. A lamp catchlight.
- Body: near reflex (small pupil, slight inward turn); looking down, so the upper lid drapes over the corneal bulge; a bright lower meniscus.
- First: R7, R11, R12, R13 near reflex.

**2013 · selfie.**
- Light: the crispest top light (0.18); a tabletop bounce below.
- Body: looking up, so the lid lifts, the hood stretches and the brow rises.
- The medium: the dial reads the fibres' tone; every part is relit per pixel.
- First: radial fibre/depth contrast, pixel relief, up-gaze lids and brow.
- Risk: depth changes alter elevation.

**2026 · window, measured.**
- Light: the softest (≥ 0.8).
- Body: eye contact; the Hirschberg reflex sits slightly nasal.
- The medium: a B&W plate. The limbus fit becomes an ellipse; the crease and brow landmarks come from real points; partial blinks are tracker dropouts.
- Risk: pigment near the limbus flips the instruments' ink.
