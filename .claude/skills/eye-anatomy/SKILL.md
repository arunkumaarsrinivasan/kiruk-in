---
name: eye-anatomy
description: "Build or change the person behind the loader eye: the one identity (Monk 8 South Indian face, golden undertone, dark brown iris), the almond fissure and lid margins, the rounded tear-lake inner corner and caruncle, lid mesh, crease and hood, lashes, brow (and its muscles), skin, sclera and vessels, the socket and the framing box. Use for anything about the shape or surface of the eye and face, realism, 'robotic', 'too perfect', shape complaints, or porting the eye to another project. Triggers on: anatomy, eyelid, lid, fissure, almond, caruncle, tear lake, canthus, crease, hooded, lashes, brow, eyebrow, skin, pores, wrinkles, Monk, sclera, vessels, framing, FRAME_BOX, identity, realistic, robotic."
---

# Anatomy: one real person

Think as an ophthalmologist and an eye researcher, then as a designer. Check references before claiming realism; never guess. Use:
- standard ophthalmic anatomy for dimensions;
- Pamplona et al. 2009 for the pupil and iris deformation;
- Bérard et al. 2014 for eye capture;
- the Monk Skin Tone scale for skin;
- above all, the client's own reference photo (here, the user's own eye) as the benchmark.

## The person (this project's; elsewhere, choose one and then keep it fixed)
- **One person in every era:** a South Indian face, Monk Skin Tone 8 (`#604134`) with a golden undertone (0.15), a dark brown iris (inner `#5e3c22`, outer `#4a2e1a`), black lashes and brow, and a warm white (`#e4dccb`), never pure white. The lid type is hooded.
  - *Why Monk 8 (user, 2026-10-28, batch B):* measured against the white in their photos, their skin's albedo is ~L* 35, between Monk 8 and 7; at Monk 9 the face rendered near-black beside the white (skin/white 0.04 against their 0.13). Skin hue is golden, 55–65°: the undertone's golden end is (0.93, 1, 0.86).
- Everything that differs per person is data (`identity.ts`), never a constant in a shader.
- Eras change only the screen, light, lens, medium and gaze; `getEyeIdentity(era)` ignores the era.

## Decision rules for shape (from eleven rounds of review)

```
Is the opening an almond?
├── No (a slit, a boot, a round hole) → fix the margins first, nothing else matters
└── Yes
    ├── Corners: BOTH canthi under the globe's centre (inner ~3 mm, outer ~1.9 before the person's tilt),
    │     so the upper arc is tall and the lower shallow. The inner corner is a LOW, TIGHT angle: the
    │     nasal lower lid nearly level, the upper lid tapering into it, a small round tear lake (~0.9 mm).
    │     Why: with the inner canthus 0.9 mm low and a 2 mm lake, the corner was a tall blunt window and
    │     the caruncle filled it: "too big" (the user's photos, 2026-10-28). Measure a corner by the
    │     opening at 1, 2 and 4 mm from the canthus (~0.9, 1.7, 4.2 mm), never by eye.
    ├── Rim: no bezel. The lashes sit on the white; the lower margin is a thin wet rim, lashes from its front edge
    ├── Asymmetry: only a hint (strong asymmetry read as a boot at full frame)
    ├── Margins: bowed in projected x, never in azimuth (azimuth crowds into the corners → a boot end)
    └── Unevenness: ~0.2 mm of low-frequency wobble, different on each lid ("no lid is a drawn curve")
```

- **Fissure:** about 26 × 10.6 mm (medial 14, lateral 11.8, upper 4.8, lower 5.8 from the globe's centre, 4.4 / 5.5 until the user asked for the opening a little taller, same shape, 2026-10-28; the canthi 3 and 1.9 mm under it). The upper lid covers ~1.6 mm of the iris's top; the lower lid sits at its foot. Taken from the user's own eye photos (`docs/era-pov/ref/user-eye*.webp`); anatomical averages are 28–30 × 9–10. The medial corner still lands at ~12.6 mm, not 14 (the margins live on a 13.1 mm sphere: the twin's todo).
- **Looking up (cursor at the top), 2026-10-29:** soft stop ~7° (`gazePitchUnits` 0.7); a feeling's lid-raise is fully spent by half the up-range; the cornea's bump under the lid is a swell (0.38 mm, σ ~3.7) and the margin's corneal lift caps at 0.35 mm; the upper lashes turn only with the lid's own travel, never the extra pitch. *Why:* each stacked on the next, the lid peaked over the cornea, the fringe rolled back toward the brow and the eye read bulged.
- **Lid–gaze coupling:** the upper lid follows pitch at 0.85 looking up and 0.7 looking down; the lower at 0.35. *Why:* the down-gaze coupling at full strength made the phone eye look shut.
- **Squint** at rest is only from glare (a white page) and stays light. "Not to sleepiness."
- **Feelings move the lids too** (`rig/brow.ts`, plan §4.2, §6): AU5 lifts the upper margin up to 0.1 rad (0.17 over-acted, 2026-10-29); a raise or droop moves only the margin and tarsus: the skin past the crease stays (`feelU` in margins.ts, added to the skin's anchored ride in lidColumn, with `lids.upperRest`). *Why:* applied to the whole lid it slid the crease and hood up under the brow as a thick band, "over-exaggerated". AU5 lifts the upper margin (white over the iris in surprise, fear, the intense stare), AU43 lowers it up to 0.19 (sly, bored), AU7 and AU6 add to the squint (a wince, anger, focus). They move only `lids.upper` and `lids.squint`, so the margin maths, its twin and the media's masks follow unchanged. Bored stays gentle (~0.7 mm) and only comes after 30–40 s of nothing. *Why:* the user's reference sheet: half of every expression is the lids; a brow over still lids reads as a mask.
- **Skin folds only where it is squeezed** (the lid mesh's tension varying): the glabella's slanted vertical folds when the head draws in, the hood's roll and crease under a lowered brow, a lighter, smoother hood under a lift. Never painted on, never darker than ×0.72. The fold test (`twin/brow-net.test.ts`) keeps the skin's area change within 0.35–2.5 for every feeling and the extreme combinations: a fold is ≤ 0.
- **Lid types** may change the crease and hood above the eye. They never narrow the opening into a slit.
- **Every value here is a starting point**, measured against that benchmark photo. In another project, re-measure against your own reference and keep the rules.

## Surfaces: the rules that made it stop looking "robotic"

1. **Never let a shadow go black.** Cap every shadow: corner pockets ×0.72 at most, the crease shadow ≤ 0.4, the socket floored at 0.5. Mucosa under a lid is flesh, not eyeliner. *Why:* black elements were the strongest "CG" tell.
2. **Skin texture is never a pattern** (the user, 2026-10-28: "camouflage", "printed"): its microrelief is a fine, soft, shallow cellular net (~0.15 mm, about 6 px at the loader's framing) with pores at junctions: it must read as grain, never as visible cells (0.35 mm plates read as crocodile skin) nor as parallel or crossing lines (woven cloth); a repeating tile is read twice, turned and scaled, so no repeat lines up; every fine term stays a few percent and fades far from the eye.
3. **Prefer small imperfections over clean curves:** uneven margins and pupil, broken fine lines, pores, a slightly irregular brow.
4. **Pores and sheen are fine and faint on dark skin:** pores 15/mm at 8%, sheen form-following. *Why:* sheen in soft clusters and pores at 12% read as a rash.
   - **The skin's sparkle is its own micro-relief catching the light,** never specks laid over it: fine crossing furrows (~0.22 mm) and pores tip the normal, the screen's light breaks into small highlights on the plateaus, densest where the skin is oiliest, sharpest along the wet lower lash roots. *Why:* round droplets in a band read as glitter, "not a realistic skin feel" (user, 2026-10-28).
5. **A crease is a dark line with a lit edge**, never a stroke.
6. **Under the lower lid, three bands (R7, measured down from the margin in the user's photos):** a light pretarsal roll 0–2.5 mm (it catches the light), a gentle shade 2–8 mm (−20 % at most, feathered, no edge), the cheek light again from ~7. Never a dark groove right under the lashes with a pale bulge below it: that is a drawn eye-bag. The fine hairs start just under the lashes (starting at 4 mm they made a pale band of their own).
   - **The person is 25** (the user, 2026-10-29: "it looks aged… I'm 25, not 45"). The lower lid flows into the cheek: the lid–face blend widens to 4 mm from ~3 mm under the margin (`skinZ`), tear trough ≤ 0.12 mm, the cheek swell broad and low (no ledge). Lower-lid lines are faint at rest (×0.45) and deepen only with the squint; no crêpe (an older skin's). *Why:* at ×2.2 lines + crêpe + a −42 % band + a 2 mm lid–cheek fold, the face read ~20 years older. Age cues (crêpe, deep trough, lid–cheek groove, festoons) are identity: never add them for "realism".
7. **The lower lid is a wet tan rim at its true projection** (about half its 1.1 mm face shows from the eye's level: `lowerShow` 0.55 → 0.35 at the ends; shown whole it read as "concrete"), rounded (darker at the front edge, lighter and wet at the back), under a defined dark lash line (0.78) with the lashes' soft shadow 0.5–1.5 mm below; (~0.44 mm under the iris): a pale pink-beige junction on the globe, the keratinised strip lighter than the skin below it, the meniscus over it, droplets on the lash line. Wet, never a matte band. *Why:* the matte band read as cement; at half its projection it read as a red line; the user's photo shows a wide, wet, tan rim.
8. **Nothing runs out of a corner into the skin,** and the two lids' skin is one skin there: their shading meets half way toward each corner (`atCorner`), the lower roll fades before the inner corner, the corner pocket shades ≤ 10 % (2026-10-29: a hard line along the bisector and a roll running into the corner read as a broken joint); and the skin mesh never folds over itself. Check the normal view at the gaze extremes. Corner columns turn onto a fixed bisector.
   - **The lower strip ends where the lids meet** (2026-10-29, "broken" corner): its shown face narrows from s −0.6 (×0.4 by −0.85) and darkens 45 % into the upper lid's shade; no upper lashes medial of s −0.8. *Why:* narrowing only past −0.8 it ran on as a lit ledge beyond the upper lid's end.
   - **Every term keyed to upper/lower meets half way at the corners** (`upperW`/`lowerW`, `atCorner`): fine lines, hood tone, sparkle, vellus glint, peri-darkening. *Why (2026-10-29):* the lids' skin meets along a line out of each corner; any term that differed across it (some out to 12 mm) drew a lit, moulded shelf out of the inner corner in 1970's light from below. The upper lid's inner face lightens into the inner corner (dark 0.85 → 0.4): near black it read as a hole.
9. **The inner corner is one field, never a mesh** (`nodes/canthus.ts`): the caruncle (flat, salmon, pigmented on dark skin), the plica and a pink blush, drawn over the white and the socket where each view ray crosses one plane, lit by the field's own light. It moves a little with the eye. *Why:* a mesh with see-through edges drew an outline round a bead; fixed, it looked glued on.
   - Tissue colours are `mix(tone, FLESH[k], share)`: the person's tone toward flesh, so a darker person's margins and corner stay pigmented.
   - Its glints are droplets (points ~0.05 mm), never a highlight lobe on bumpy normals (that spread into blotches).
10. **The skin catches the era's light:** the screen's picture is thrown on the face as a smooth wash (mip 8, 22%) plus a sheen. Era colour arrives as light, never pigment.

## Lashes
- A soft dark mass with a few defined strands, never a picket fence (that read as a plastic doll), and **never an even comb** (R9, the user's photos): lengths spread ±30 % with a few short new ones, curls vary, strands wander and cross, roots bunch a quarter of the way into their clump so clumps open gaps and meet in spikes. *Why:* evenly spaced roots read as a comb whatever the tips did.
- Every lower lash curls (measured: all curly); they are finer than the upper ones (0.05–0.07 mm), lighter brown at the tips.
- **The lower row is short and gappy, never a hem** (2026-10-29): base 3.6 mm, lengths skewed short (0.4 + r²·1.05), lean ±0.35, clumps bunched 0.45 so bare lid shows between. *Why:* at 4.8 mm with an even spread it hung like a doll's curtain.
- The tear bead and the tan strip vary along the lid (pools, patches, pinker toward the corners, fading over the last quarter). *Why:* even end to end they drew the rim as an eyeliner outline.
- Upper lashes in 3 rows rooted at the margin; lower lashes in 2 rows from the front edge (rooted further back, they looked disconnected).
- Densest over the outer third, none by the punctum. Clumps of 3–6 upper and 2–3 lower, the front row longest.
- Lashes hang forward and down when shut. They lag the lid on a spring (7 Hz, ζ 0.35).
- Never thinner than 0.6 px; below that, coverage becomes transparency.

## Brow
- Fully in frame, about 5 mm over the lashes, with a hooded roll between.
- Hairs are baked flat on the skin, in a herringbone flow: long (to ~6 mm) and lying almost flat in the body, layered so skin shows between them, short at the head with only a few uprights, no strays, the edge hairs short and lying along it. *Why (R10, the user's brow):* short steep strokes read as pen hatching and a solid band; a block of uprights reads as a square head; strays read as extra hair (the user asked them gone).
- Depth ~4.1 mm (the user's call, 2026-10-28: ~4.5, then very slightly narrower; theirs measures ≥ 7). Changing it is an identity change: ask.
- **The brow sits on bone:** the supraorbital rim follows the brow's own arc (`browEdges`), its crest ~0.7 mm under the hairs' lower edge, ~2.1 mm proud over the arch, firm below (σ 2.1) and rounding over the forehead (σ 3.6), sinking into the glabella and turning back past the tail (`rimAlong`, 25 % at the ends) (lid-mesh.ts `faceShell`). The fat pad under it rides the same arc. The skin shows a little through the hairs. *Why (the user, 2026-10-29):* on a flat face the brow read as stuck on; then a straight 3.8 mm shelf across the whole frame read as "creepy from end to end" and aged. Never a horizontal shelf.
- **The shade under the brow is soft occlusion, not a band:** ≤ −20 % (−32 % with the screen above), squared so it feathers into the hood, the same in every era (1970's screen below still shows the socket). No lit stripe along the brow's lower edge. *Why:* a −38…68 % band with a lit stripe over it cut the brow off from the lid ("separated").
- Dark hair on dark skin shows by a soft sheen along the hair, never a grey cast or per-hair glints (glints made square blocks). The surface lobe is small and tight (0.007, exp 80), the warm lobe carries it. The skin between the hairs takes no shine: page mirror, oil and vellus all fade under `browCover` (hairs plus their blurred cover). *Why:* the page's white mirrored off the skin between the hairs greyed the brow.
- **A real brow's anatomy (2026-10-29):** the head nearly as dense as the body (×0.85), shorter (2.3 mm) upward hairs; at ×0.45 and 1.6 mm it read bare; the lower border the densest, defined line; the upper border feathering over its top third; the tail ending level with the head or a touch under (fall 1.5 mm; 2.6 drooped, an older brow); density ×0.86 of the tier ("too thick"). The bone: the superciliary arch swells under the brow's head (+0.9 mm at x −10.5) and the rim falls long into the hood (σ 3.2 below the crest) so the brow never reads detached. The warm sheen is a faint dark brown (orange read as dashes).
- The herringbone's two flows differ by ≤ ~0.4 rad and blend over most of the depth (v 0.2–0.85). *Why:* 0.6 rad apart across a narrow band, the halves caught the light apart: a parting, two strips.
- **It moves by its muscles on a bone chain, never by sliding or scaling** (`rig/brow.ts`, `nodes/brow-net.ts`, `docs/EYE_BROW_EMOTION_PLAN.md`):
  - five nodes (head, inner, arch, outer, tail) on the hair curve (`brow-shape.ts`), joined by four bones that keep their length;
  - four muscles each pull their own shape over the nodes: AU1 lifts the head and inner, AU2 the arch and outer, AU4 draws the head down **and toward the nose** (with a bulge toward the camera), AU6 drops the tail;
  - the GPU lays a Hermite curve through the nodes (values + tangents), so each node's shape reads. *Why:* one scalar through Gaussian weights moved all five as one arch, scaled, and read as the brow zooming;
  - each node takes its whole thickness with it; a bone's turn shears the hairs; the hairs are painted on the curve before the move, so they stay on the nodes.
- **Lashes never meet the brow** (2026-10-29, 1970 up-look: "mingling"): the upper fringe tips up at most ~2° (`travel` capped 0.035 rad) however far the lid lifts, upper lashes 6.4 mm, and the brow rises with an up-look (up pose arch 2.1 mm, up-temple and up-nose ×1.3). A band of hood skin always shows between the lash tips and the brow.
- **The eye leads it.** The brow's first job is to follow the eye's gaze: a shape for each direction (plan §2b). **Rest is zero** at the centre gaze; lifts come from where the eye looks and from feelings, and go away. Spontaneous expressions stay at ~15–30 % of a brow's range (max ~10 mm up, ~7 mm frown: Guihard 2022): greet ~1.5 mm, surprise ~2.3, delight ~2.4 at the arch.
- **Headroom:** gone by the user's choice (2026-10-28): the wide box's top is 11.5 mm, so the brow's upper part runs off the frame; the eye's size and centring come first (see Framing). The forehead is anchored at the hairline: it follows the brow fully at the brow, fading to 15 % over 22 mm, so a lift squeezes it evenly and it furrows (faint, ~8 mm apart from ~7 mm over the brow). The furrows show where the frame holds forehead (phones, narrow windows); at 1440×900 the first falls just above the frame.

## Framing
- Fit a box round the almond, whatever the window's shape: wide 30 × 21.3 mm (−8.3..13.5, 2026-10-29: brow top to lower-lash tips, the whole brow in frame; `BROW_SHAPE.lower0` 7.9: at 7.2 the brow touched the lid's hood); phone 31 wide, −15..12.8. Before: 32 × 22.5 (−11..11.5), the brow cropped, room at the sides and below. On a wide screen the box's height sets the zoom. *Why (user, 2026-10-28):* at −10..15 the eye was ~16 % smaller with too much skin round it; at −8.5..13 it sat ~60 % down the screen. The eye large and centred comes first: the brow's upper part runs off the top. History: top 12 → 15 → 13 → 11.5.
- The eye sits ~1 mm below the frame's middle. On phones show the whole almond, never a pushed-in iris crop.
- Camera: a 12° FOV macro, aimed at the box's middle, not the eye's.
- **No focus breathing:** the frame never scales. *Why:* it read as the brow zooming.

## Realism pass (R5–R10): tuning the face for one era
Phase specs and the per-era table: `references/realism-anatomy.md`. Shared contract and cards: `../eye-loader-system/references/era-realism.md`.

```
Asked to make a face part "more real" for one era?
├── Is it shape, pigment, skin, lashes or brow?
│     → It is the person: change it once, for all ten eras (C1), and verify all ten
├── Does it only look wrong under that era's light?
│     → It's light, not anatomy: fix the shadow projection or ERA_LIGHT (eye-light-optics, R11)
├── Does it only look wrong at that era's rest gaze (2009 down, 2013 up, 2000 locked down)?
│     → It's posture: fix the lid–gaze coupling for that gaze, then check every era at its own rest
└── Does it vanish or speckle in that era's medium?
      → Check the floor (era-realism.md). Below it, make it fade (floorPx); never enlarge it to survive
```

1. **Verify every anatomy phase at each era's rest gaze,** not only straight ahead. *Why:* a lid right at centre can bunch looking down (2009) or gape looking up (2013).
2. **The shut lid is a scene (C8).** Check a mid-cut frame for:
   - skin over the corneal bulge;
   - lash lines meeting;
   - no light arc where the lid stands off the cornea.
3. **Periorbital pigment caps at ×0.85** and is checked in 1981 and 1991. *Why:* in 1-bit and four greys it inks into a mask.
4. **Points the media read come from the code that draws them (C4):** margins, crease, caruncle, brow nodes. Move a feature, move its uniform.
   - The fissure's constants and margin math live in `twin/margins.ts` (CPU), mirrored by `nodes/margins.ts`. Change both, run `npm run test:eye`, and check the lab's margin overlay.
   - R0 measured the media's guessed almond against the real lids: up to ~2 mm off at the inner corner, and the medial corner lands at 12.9 mm, not `FISSURE_MM.medial` 14 (an asin clamp). R6 closes both.
5. **Keep red tissue muted at the source:** the caruncle rose-brown, vessels violet-red. *Why:* 1995 (×1.35) and 2003 (×1.3) saturate it into neon.

## Numbers
All measured values, colours, profiles and the pitfalls behind them are in `references/anatomy-numbers.md`. Start from them when porting; change one at a time and show before/after.
