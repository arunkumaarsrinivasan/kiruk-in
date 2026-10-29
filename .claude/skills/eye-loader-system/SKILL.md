---
name: eye-loader-system
description: "Hub for the realistic loader eye: a 3D human eye rendered in three.js TSL that is a site's front door, seen through each era's own screen technology, cut between eras by its own blink. Read first for any work on the eye, its eras, its interaction, its opening or its performance; it routes to the focused eye-* skills and holds the rules every one of them obeys. Triggers on: loader eye, eye loader, era eye, the eye, EyeStage, era-medium, ways of seeing, POV, blink cut, opening tube, kiruk loader, realistic eye, TSL eye, eye skill, realism pass, R0–R15, EYE_REALISM_PLAN, more realistic for an era, era realism, procedural-eye."
---

# The loader eye: the system

A site opens on one human eye, filling the frame, lit by a screen. The visitor stands where that screen stood and looks back at its one user. Ten eras (1970–2026) are ten screens. Each era repaints the same eye in its own picture technology, the eye blinks between eras, and tapping the iris falls through into that era's site. Nothing on the eye is a word.

It works because four things agree in every era, and every skill below exists to keep them agreeing:

1. **Its own device lights the face.** The screen is the key light, the only bright thing in the cornea, and its colour spills on the skin.
2. **A lens is tuned to that light.** Each era recorded faces its own way: grain, tone, white balance, artefact.
3. **Its own picture technology fills the whole frame.** Full bleed, no border, the medium paints every pixel.
4. **Its own sign in the pupil says "this opens".** It is the only thing that moves at rest.

## Which skill, for which job

```
What are you touching?
├── A new era, a redesign, "make it better / unique / wow" ........ eye-ideation (always first)
├── The person: lids, corners, lashes, brow, skin, framing ......... eye-anatomy
├── Iris, pupil, their reflexes ................................... eye-iris-pupil
├── Cornea reflection, the screen as light, tears, era lens, post ... eye-light-optics
├── Gaze, saccades, blinks, calm, reduced motion ................... eye-motion
├── An era's picture technology (the medium shader) ................ eye-era-media
├── Changing between eras (the blink cut, scrub, enter) ............ eye-era-cut
├── Hover / press / enter / touch / the sign / phones .............. eye-interaction
├── What plays before the eye opens ................................ eye-opening
├── TSL / WGSL / compile time / GPU cost / tiers ................... eye-tsl-craft
├── Proving any of it works, showing the user ...................... eye-verification
├── Link previews: the share card cut from the era posters ......... eye-share-card (end of every era change)
└── The realism pass (R0–R15), or "make era X more real" ........... references/era-realism.md first, then the phase's owner (below)
```

Load every skill whose branch you touch. A medium change touches eye-era-media, eye-tsl-craft and eye-verification at minimum.

## Rules every eye skill obeys

1. **One person, every era.** The same face, skin, iris colour, framing and anatomy in all ten eras. Eras differ only by screen, light, lens, medium, gaze and sign. *Why:* the deck reads as one person living through the history of the interface; a new face per era reads as a gallery of strangers.
2. **The whole face, always.** Brow hairs, pores, lid folds, lashes, iris fibres and the page in the cornea stay visible at rest in every era. Effects that hide the face (frost, blur, masks, fades to paper) appear only inside a cut. *Why:* the detail is the point; the era is a lens on it, never a replacement. Two designs were rejected for hiding it.
3. **Era colour enters as light or as the medium, never as pigment.** The iris is never recoloured to match an era. *Why:* a green iris for 1970 read as "green fur"; light on a real eye reads as a screen.
4. **No words on the eye or in the opening.** No labels, hints, arrows, edge bands, neighbouring-era previews or left/right markers at rest. Numerals are allowed only where the era's own concept is measurement (2026).
   - **The one exception (user's request, 2026-10-22):** one instruction line in each bottom corner (`LoaderHint`), shown only once the eye has opened. Glyph, verb, then what it does:
     - desktop: `(eye) Scroll · blink to the next era` (left), `Click the eye · enter 1991 (pupil)` (right);
     - phones: `(eye) Swipe · blink`, `Tap the eye · enter 1991 (pupil)`.

     The glyphs act out the concept: the eye glyph blinks (scaleY 1 → 0.06 → 1, 420 ms) on every era change, as the real eye does; the pupil glyph widens (r 1.9 → 3.6, spring) while the pointer is on the iris. The right line names the era a click would enter, so a scroll visibly changes something. Legibility comes from a feathered pool behind the words (radial dark 0.82 → transparent, 10 px backdrop blur, radial mask), never a box. Verb at white/95, action at white/70, separator at white/40, 11–12 px mono.
     *Why:* round 1 (white with a difference blend) vanished on 1991's dither and 2013's components. Round 2 (a key chip inside a frosted pill) read, but looked like a toggle; the eye is the only control. Keep both lines inside 375 px. An era's own bottom-corner marks sit above them: the stage writes `medium.foot` = 64 CSS px in device px, and 2026 lifts its bottom readouts by `max(30·kc, 4.5% H, foot − cm)`. Accessibility text (`aria-valuetext`) is required, and it is not visible. *Why the rule:* the user rejected every at-rest hint, and every opening with words, as noise; direction exists only inside a cut.
5. **Calm.** At rest these move, and nothing else:
   - the eye itself;
   - its one sign;
   - grain stepped at 12 Hz;
   - the era's own idle states, each local (never full-frame) and slow: a caret or cursor blink at 2 Hz or slower, a clock digit, a part demonstrating itself at most once per 30 s, and a full-frame sweep at least 6 s apart and only after 1.5 s of stillness.

   Nothing scales or breathes the frame. At most 2.5 large luminance cuts a second. *Why:* the loader is watched for seconds. Motion that darts or shimmers reads as an irritant, but an era with no idle life reads as a still.
6. **Each era is its own mechanism.** A *structural idea* is two things: the specific technique that draws the face (UI laid over an unchanged photo, a halftone screen, a grid of components, a measurement layer, a scanline raster) and the sign. Eras may share a family (several display physics, two camera grades), but never the same technique or the same sign. *Why:* "this feels the same as 2026" killed a 2013 design. See eye-ideation.
7. **Phones are first-class and nothing prompts.** Every sign is visible without hover. No permission dialog ever (no iOS motion prompt). *Why:* a dialog at the front door makes people leave.
8. **Graphs never change at runtime.** Eras swap uniforms and textures only. *Why:* a new node graph recompiles a pipeline and hitches the cut (eye-tsl-craft).

## The realism pass (R0–R15)

The eye is being made as real as it can be, one part per phase (`docs/EYE_REALISM_PLAN.md`). Before tuning any part for any era, read `references/era-realism.md`. It holds:
- the tuning procedure;
- the contract C1–C12;
- each medium's detail floor;
- each era's physical light;
- the ten era cards.

| Phase | Part | Owner |
|---|---|---|
| R0 | baseline, lab solo × era views, TS twins, decisions | eye-verification, eye-tsl-craft |
| R1 | cornea optics; limbus | eye-light-optics; eye-iris-pupil |
| R2–R4 | iris relief, iris colour, pupil | eye-iris-pupil |
| R5–R10 | sclera, margins and canthi, lid form, skin, lashes, brow | eye-anatomy |
| R11, R12, R14 | shadows and near reflections, tears, lens and AA | eye-light-optics |
| R13 | motion | eye-motion |
| R15 | performance, the medium's detail floor | eye-tsl-craft |

Every phase also loads eye-era-media (`references/realism-through-media.md` lists the branches it must re-check) and eye-verification.

Three rules decide most cases:
1. **"Most realistic in era X" means the same person under X's conditions:**
   - its light (direction, real size, spectrum, fills);
   - the physiology that light and task cause (pupil, posture, blink and tear state);
   - its lens and its medium.

   Never a per-era change to the person. *Why:* one person in every era (C1).
2. **A realism change is judged in all ten eras, each in its own terms,** and in the shut frame of a cut:
   - luminance for 1970, 1981, 1991 and 2026;
   - hue too for the colour eras.

   *Why:* the shut eye is on screen in every cut, and colour work is invisible in B&W eras.
3. **Per-era realism is data in `look.ts`,** never a new graph branch (C11).

## Adding or removing an era (checklist)
Every one of these is keyed per era. Miss one and that era silently falls back to a default.
1. The era's line in the machine-seeing sequence, and the concept the user chose (eye-ideation).
2. Its place in `ERA_MEDIA` and its branch number (eye-era-media). Its `ERA_MEDIUM` timings and flood colour (eye-era-cut).
3. `ERA_LIGHT`, `ERA_LENS` (grain 0 if it quantises), `ERA_GAZE`, `ERA_CURSOR` and `cssCursor` (eye-light-optics, eye-motion, eye-interaction).
4. Its sign in all five moments (eye-interaction).
5. Its home page captured for the cornea (`eye:screens`). With no page yet, the painted stand-in screen shows; say so, and capture the page once it exists.
6. Loader input that assumes a count: sweep positions, touch pitch, Home/End, the ghost finger's range.
7. Posters (wide and tall), the plan doc and the drift log (eye-verification).
8. The share card: `npm run og:card -- --check`, then bake (eye-share-card).

## Drift log format
One table per plan doc: `| What | Spec | Built | Why |`, one row per divergence, written in the same change as the code.

## How work is run with this user (kiruk-in; elsewhere replace these with your team's rules)

- **Ideas before code.** For any visual direction, present 3–4 genuinely different concepts with why each is right for the era, and let the user choose (eye-ideation). Ask for references before a visual round.
- **Batches of three eras**, each verified by the user before the next.
- **Proof, not claims.** Every change ships with real renders: before/after, rest/hover/press/enter, a slowed filmstrip of the cut, and a phone shot (eye-verification).
- **Change only what was asked.** "Fine-tune" never licenses a redesign. Keep each era's committed look unless the user names what to change.
- **No commits unless asked.** When asked, commit everything in one commit and leave review screenshots out of git.
- **Keep the spec honest.** Each era change updates its plan doc and a drift log (spec vs built vs why).

## Reference implementation (kiruk-in)

| Part | Where |
|---|---|
| Stage, frame loop, lab API | `src/components/three/eye/EyeStage.tsx`; the loader draws it from a worker: `EyeStageWorker.tsx`, `worker/` (docs/EYE_WORKER_PLAN.md; `?eyeWorker=0` for the page host) |
| Uniform registry | `src/components/three/eye/uniforms.ts` |
| Host adapter (page or worker) | `src/components/three/eye/env.ts`; the worker spike at `/lab/eye-worker` (`src/lab/eye-worker/`, docs/EYE_WORKER_PLAN.md) |
| Per-era data (light, lens, gaze, medium timings) | `src/components/three/eye/look.ts` |
| Anatomy, the person | `anatomy.ts`, `identity.ts`, `nodes/margins.ts`, `nodes/lid-mesh.ts`, `nodes/canthus.ts` (the inner corner), `nodes/lashes.ts`, `bake/*` (`bake/vessel-net.ts`: the white's grown vessels) |
| Post chain | `post/pipeline.ts` |
| Era media | `post/era-medium.ts`, `post/medium-kit.ts`, `post/system.ts` (2013), `post/measured.ts` (2026) |
| Blink cut | `post/medium-director.ts` |
| Loader page and opening | `src/components/ui/immersive-era-loading-page.tsx`, `src/components/ui/loader/` |
| Lab | `/lab/eye`, `src/lab/eye/EyeLab.tsx` (URL setup `?tier=&gl=1&see=1&reduce=1`; solo layers; the R0 margin overlay `AlignmentOverlay.tsx`); opening at `/lab/opening` |
| CPU twins and tests | `src/components/three/eye/twin/` (margins, optics, iris space); `npm run test:eye` |
| Realism baseline | `scripts/eye-realism-baseline.mjs` → `docs/era-pov/r0-baseline/` (gitignored) |
| Specs | `docs/EYE_REALISM_PLAN.md` (the realism pass), `docs/EYE_TSL_PLAN.md`, `docs/ERA_POV_PLAN.md`, `docs/ERA_2013_SYSTEM_PLAN.md`, `docs/ERA_2026_MEASURED_PLAN.md`, `docs/LOADER_OPENING_PLAN.md` |

In another project: keep the same separation (data tables, one uniform registry, a director, one medium module per era, a lab with a scripted control API) even if every value changes.
