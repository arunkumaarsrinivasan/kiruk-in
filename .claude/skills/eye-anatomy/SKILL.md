---
name: eye-anatomy
description: "Build or change the person behind the loader eye: the one identity (Monk 9 South Indian face, dark brown iris), the almond fissure and lid margins, the rounded tear-lake inner corner and caruncle, lid mesh, crease and hood, lashes, brow (and its muscles), skin, sclera and vessels, the socket and the framing box. Use for anything about the shape or surface of the eye and face, realism, 'robotic', 'too perfect', shape complaints, or porting the eye to another project. Triggers on: anatomy, eyelid, lid, fissure, almond, caruncle, tear lake, canthus, crease, hooded, lashes, brow, eyebrow, skin, pores, wrinkles, Monk, sclera, vessels, framing, FRAME_BOX, identity, realistic, robotic."
---

# Anatomy: one real person

Think as an ophthalmologist and an eye researcher, then as a designer. Check references before claiming realism; never guess. Use:
- standard ophthalmic anatomy for dimensions;
- Pamplona et al. 2009 for the pupil and iris deformation;
- Bérard et al. 2014 for eye capture;
- the Monk Skin Tone scale for skin;
- above all, the client's own reference photo (here, the user's own eye) as the benchmark.

## The person (this project's; elsewhere, choose one and then keep it fixed)
- **One person in every era:** a South Indian face, Monk Skin Tone 9 (`#3a312a`), a dark brown iris (inner `#5e3c22`, outer `#4a2e1a`), black lashes and brow, and a warm white (`#e4dccb`), never pure white. The lid type is hooded.
- Everything that differs per person is data (`identity.ts`), never a constant in a shader.
- Eras change only the screen, light, lens, medium and gaze; `getEyeIdentity(era)` ignores the era.

## Decision rules for shape (from eleven rounds of review)

```
Is the opening an almond?
├── No (a slit, a boot, a round hole) → fix the margins first, nothing else matters
└── Yes
    ├── Corners: outer acute and lifted 2–5°; inner ROUNDED (the tear lake, ~2 mm tall) and a little lower
    ├── Rim: no bezel. The lashes sit on the white; the lower margin is a thin wet rim, lashes from its front edge
    ├── Asymmetry: only a hint (strong asymmetry read as a boot at full frame)
    ├── Margins: bowed in projected x, never in azimuth (azimuth crowds into the corners → a boot end)
    └── Unevenness: ~0.2 mm of low-frequency wobble, different on each lid ("no lid is a drawn curve")
```

- **Fissure:** about 26 × 9.9 mm (medial 14, lateral 11.8, upper 4.4, lower 5.5 from the globe's centre). The upper lid covers ~1.6 mm of the iris's top; the lower lid sits at its foot. Taken from the user's own eye photo; anatomical averages are 28–30 × 9–10.
- **Lid–gaze coupling:** the upper lid follows pitch at 0.85 looking up and 0.7 looking down; the lower at 0.35. *Why:* the down-gaze coupling at full strength made the phone eye look shut.
- **Squint** is only from glare (a white page) and stays light. "Not to sleepiness."
- **Lid types** may change the crease and hood above the eye. They never narrow the opening into a slit.
- **Every value here is a starting point**, measured against that benchmark photo. In another project, re-measure against your own reference and keep the rules.

## Surfaces: the rules that made it stop looking "robotic"

1. **Never let a shadow go black.** Cap every shadow: corner pockets ×0.72 at most, the crease shadow ≤ 0.4, the socket floored at 0.5. Mucosa under a lid is flesh, not eyeliner. *Why:* black elements were the strongest "CG" tell.
2. **Prefer small imperfections over clean curves:** uneven margins and pupil, broken fine lines, pores, a slightly irregular brow.
3. **Pores and sheen are fine and faint on dark skin:** pores 15/mm at 8%, sheen form-following. *Why:* sheen in soft clusters and pores at 12% read as a rash.
4. **A crease is a dark line with a lit edge**, never a stroke.
5. **The lower lid is a thin wet rim**, never a wide matte band. *Why:* the band read as cement.
6. **Nothing runs out of a corner into the skin,** and the skin mesh never folds over itself. Check the normal view at the gaze extremes. Corner columns turn onto a fixed bisector.
7. **The caruncle blends** into the corner, is pigmented rose-brown on dark skin, and moves a little with the eye. *Why:* fixed, it looked glued on.
8. **The skin catches the era's light:** the screen's picture is thrown on the face as a smooth wash (mip 8, 22%) plus a sheen. Era colour arrives as light, never pigment.

## Lashes
- A soft dark mass with a few defined strands, never a picket fence (that read as a plastic doll).
- Upper lashes in 3 rows rooted at the margin; lower lashes in 2 rows from the front edge (rooted further back, they looked disconnected).
- Densest over the outer third, none by the punctum. Clumps of 3–6 upper and 2–3 lower, the front row longest.
- Lashes hang forward and down when shut. They lag the lid on a spring (7 Hz, ζ 0.35).
- Never thinner than 0.6 px; below that, coverage becomes transparency.

## Brow
- Fully in frame, about 5 mm over the lashes, with a hooded roll between.
- Hairs are baked flat on the skin, in a herringbone flow.
- Dark hair on dark skin shows by a soft sheen along the hair, never a grey cast or per-hair glints (glints made square blocks).
- **It moves by its muscles, never by sliding:** frontalis arches (the middle and inner brow lift most), the corrugator draws the head in and down, the orbicularis drops the tail. There's a greeting flash of 1.5 mm.
- Keep the lift small (0.6 × gaze up + 0.3 × interest). *Why:* a bigger lift opened a gap between brow and eye with the cursor centred.

## Framing
- Fit a box round the whole almond with the brow, whatever the window's shape: wide 32 × 22 mm (−10..12); phone −16..12 by width.
- The eye sits ~1 mm below the frame's middle. On phones show the whole almond, never a pushed-in iris crop.
- Camera: a 12° FOV macro, aimed at the box's middle, not the eye's.
- **No focus breathing:** the frame never scales. *Why:* it read as the brow zooming.

## Numbers
All measured values, colours, profiles and the pitfalls behind them are in `references/anatomy-numbers.md`. Start from them when porting; change one at a time and show before/after.
