# The Loader Eye: realism pass (R0–R15)

Status (2026-10-28): R0, R1 and R2 signed off, the page in the cornea picked per era, the motion calmed. Batch A against the user's own eye (R6 inner corner and lower rim, R5 the white, R3 iris colour and limbus) built; its round 2 (the inner corner's root fix, the skin's sparkle) signed off, posters and shut stills recaptured. Batch B (R9 lashes, R8 skin at Monk 8, R7 the lower lid's form) signed off, posters and shut stills recaptured.
Revision 2 (same day): checked against the era design (`ERA_POV_PLAN.md`, the media, cut, interaction and opening skills, `look.ts`). §8 holds the alignment: an audit, the contract every phase obeys, per-era realism cards, and which media each phase must re-check. R0, R1, R11, R14 and R15 changed with it, and §7 gained three decisions. Each phase's owning skill now carries a "Realism pass" section (§9).

Source studied: [rock-biter/procedural-eye](https://github.com/rock-biter/procedural-eye) ("Random-eyes", Gianluca Lomarco, [thread](https://x.com/__rockbiter/status/2114728296034226583)): 161 commits, about 25 k lines, 4,455 of them GLSL, about 400 parameters, three.js WebGL. Cloned and read in full: `AGENTS.md`, `docs/ARCHITECTURE.md`, `RENDERING.md`, `IRIS.md`, `OPTICS.md`, `ADNEXA.md`, `ANIMATION.md`, `QUALITY.md`, `ROADMAP.md`.

Phases here are named **R** so they don't collide with the P0–P12 of `docs/EYE_TSL_PLAN.md`.

---

## 0. Summary

**What the reference gets right.** Its structure, more than any one effect:
- **One source of truth for shape.** One fissure (two margin curves between the canthi) and one eye profile (sclera sphere, conic cornea, iris shell). The lid mesh, lash roots, tear meniscus, fissure map, lid reflections and shadows are all built on them. That is why its parts line up.
- **CPU twins.** Every analytic curve exists twice, in JS and in GLSL, and unit tests hold the JS side to published measurements (corneoscleral sag within 0.1 mm, entrance pupil 3.05 mm ×1.13, Fresnel 2.08 %).
- **Every range from a paper.** Defaults are measurements, not taste.
- **Each part has its own debug view** (iris clay, normals, AO, march steps, refraction checker), so a part can be judged alone.

**What doesn't fit us.** It is a macro-photography toy for one eye at a time. It runs at a 30 fps budget: about 33 ms a frame on an Apple M1 at 3440×1440, 47 ms zoomed in. It gets there with:
- a raymarched SDF iris;
- shadow maps and soft coverages;
- accumulation for the photo.

Our loader has to stay near 12 ms on the Radeon 610M, carry ten era media on top, and run on phones and WebGL2.

**The plan.**
1. Take its anatomy and its discipline.
2. Re-derive the expensive parts as bakes plus analytic shading. We already do this, and we do it cheaper.
3. Beat it on the gaps it lists itself (§3).
4. Make it *our person's* eye (South Indian, Monk 8 since batch B, dark brown iris), which it never models.
5. Leave out what a loader doesn't need.

Sixteen vertical phases, one component each. You sign off each phase before the next starts. Every phase has a perf gate, and a last phase consolidates performance.

---

## 1. Rules that don't change

From `eye-loader-system` and its skills. Every phase obeys them.

- One person in every era: Monk 8 skin `#604134` with a golden undertone (Monk 9 `#3a312a` until batch B, the user's call from their photos), dark brown iris, black lashes and brow, warm white `#e4dccb`. Eras change light, lens, medium and gaze, never the person.
- The whole face stays visible at rest in every era. Era colour arrives as light or as the medium, never as pigment.
- Calm motion: long fixations, rare microsaccades, nothing that scales the frame.
- Graphs never change at runtime: uniforms and textures only. Debug views are compile-time defines in the lab.
- Never let a shadow go black. Prefer small imperfections to clean curves.
- Phones and WebGL2 are first class. No permission prompts.
- Proof, not claims: renders for every change. No commits unless asked.

---

## 2. The reference, part by part

*Take*: adopt the idea, reimplemented from its sources. *Improve*: same goal, our cheaper or better way. *Keep ours*: we're already ahead. *Skip*: not for a loader.

| Part | Reference | Ours today | Verdict |
|---|---|---|---|
| **Source of truth** | One fissure + one eye profile; JS↔GLSL twins; Node unit tests | One margin model (`margins.ts`) in TSL only; no CPU twin, no tests | **Take.** TS twins of margins, cornea profile and iris rest space, with tests (R0) |
| **Globe, cornea** | Conic anterior cornea (R, Q) joined to a 12 mm sclera sphere by a C2 blend (the sulcus); posterior sphere; Newton steps refine the raster point onto the exact surface; analytic normals | Sphere cap r 7.8, limbus 5.9, one refraction (1/1.336) into an iris cone | **Take** (all analytic, cheap) — R1 |
| **Limbus** | Opacity band; vertical overlap, so the visible iris is wider than tall; limbal ring | Limbal ring in the bake; limb shadow | **Take** the overlap. **Improve:** pigmented palisades of Vogt and limbal pigment (its own future work) — R1 |
| **Iris structure** | SDF in the chamber, over-relaxed sphere tracing: crypts as Voronoi cells with undercut walls, three fibre families bridging the crypts, ruff, micro striations; marched AO and soft shadow | 2D polar bake (albedo + height), 1–4 parallax steps, a relief term | **Improve:** a two-layer baked relief (fibre shell over stroma floor) gives bridging and depth at a fraction of the cost — R2 |
| **Iris colour** | Kubelka–Munk spectral model (ABL, stroma, epithelium; melanin and haemoglobin absorption) as a 3D lookup over melanin, eumelanin share and stroma thickness | Two zone colours, painted | **Take,** offline: one person, so bake the spectral result into the albedo; thickness darkens crypt floors physically — R3 |
| **Dilation** | Rest space: the pupillary zone keeps its area, the ciliary zone stretches linearly, thickness ∝ area^−k | `tRest = tNow^γ` remap | **Take** the area-preserving rest space — R2 |
| **Pupil** | Purkinje III over a near-black fundus; entrance pupil checked against Gullstrand | Irregular outline, fundus, red reflex, P3/P4, flash | **Keep ours**; derive P3/P4 from the real surfaces — R4 |
| **Sclera** | Grown vessel network (episcleral straight and wide, conjunctival tortuous and fine, limbal loops) on a 2048×512 polar map; redder near the lids; micro-relief breaks the wet reflection | Noise-built vessels and mottle, redness | **Take** the grown network. **Improve:** conjunctival melanosis and tone for our person — R5 |
| **Lid shape** | Hermite margins solved for MRD1/MRD2; a curvature-adaptive ring mesh (~9.6 k vertices, chords within 5 µm); intermarginal strip, quarter-round anterior edge, crease fold, lower-lid wedge, lateral overlap | Ring mesh built in the vertex stage on the margin curves (blinks with no re-upload); crease, hood | **Keep ours** (cheaper, blinks for free). **Take** the profile anatomy and curvature-aware row spacing. **Beat** its hood gap — R6, R7 |
| **Canthi** | Conjunctiva with fornix, lacus lacrimalis, a 2.3×3.4 mm caruncle mound, plica crescent, and a palpebral curtain that closes the pockets | Caruncle as a separate sphere mesh, pocket shading | **Take** the lacus, plica and closed pockets. **Improve:** caruncle hairs and sebaceous dots (its own future work) — R6 |
| **Margin detail** | Marx's line, meibomian orifices (34 upper, 24 lower), grey line, keratinised edge, wet glints | Grey line (upper), waterline, meibomian openings as noise (×140, −35 %) | **Take:** placed orifices, Marx's line — R6 |
| **Skin relief** | Star furrows from follicles on a jittered 0.6 mm grid, follicle pits, pore dimples, secondary cushions, crepe wrinkles, crow's feet, tension lines; baked to 4096² (gradient, albedo, occlusion) | Bake: pores, lid lines, crease wobble; crow's feet and mottle per pixel | **Take** (bake). **Improve:** scale-correct subsurface blur (its gap) — R8 |
| **Skin shading** | Per-channel diffuse normal (0.2/0.5/0.8 of the slopes), wrap diffuse, GGX at representative points, wet mirror only near the margin, emitter irradiance per vertex | Wrap with red bleed, sheen, the screen thrown on the skin | **Take** per-vertex irradiance and per-channel normals — R8 |
| **Lashes** | 3 upper and 2 lower rows, curl, clumps of 2–5, 14-segment tapered tubes, Kajiya–Kay with two shifted lobes; no minimum width (aliases) | Rows and clumps, 0.6 px minimum width, spring lag | **Keep ours.** **Take** the two-lobe hair shading — R9 |
| **Brow** | None | Baked hairs, five-node muscle move-net (in progress) | **Ours ahead** — R10 refines strands |
| **Tears** | Meniscus as a concave fillet mesh with exact normals | Live film with thinning and break-up, meniscus thread, reflex tears | **Ours ahead.** **Take** the exact-normal fillet — R12 |
| **Shadows** | Key-light shadow map (2048²/1024²) of lighter lid and lash proxies, PCSS on skin, soft coverages | Analytic lid shadow measured from the margin curves; first-order lash density | **Keep analytic** (cheaper, always aligned). **Improve:** penumbra from the screen's size, lash streaks, skin horizon shadows — R11 |
| **Near reflections** | Lids and lashes inside every mirror ray of cornea and sclera (a lid sphere, the fissure map, a lash comb) | None | **Take.** Big realism for almost nothing — R11 |
| **Light** | Analytic emitters with exact shapes; Lambert polygon irradiance | The era's screen traced as a rectangle with its real page; fill lights | **Keep ours.** **Take** polygon irradiance for the screen on the skin — R11 |
| **Motion** | Watson–Yellott steady pupil, Pamplona dynamics, OU drift, log-normal blinks, 15 % partial blinks, late opening creep | Moon–Spencer pupil, era gaze scripts, Bell's phenomenon, wobble, lash lag, calm mode | **Keep ours.** **Take** partial blinks, opening creep, OU drift, pupil latency and speed caps — R13 |
| **Camera, post** | Thin lens; accumulation; gather DOF with tile early-outs and full-res near blur; FXAA after the tonemap; effects and grain merged in one pass | Half-res 9-tap DOF, bloom on emissive, era lens, era medium | **Take** tile early-outs, near blur, the merged final pass. Accumulation only as an idle refine — R14 |
| **Perf infra** | Compile overlapped with the first rebuild; adaptive DPR over 0.5 s windows dropping the slowest fifth; front-to-back draw order so the depth test skips the optics under the lids; a coarse eyeball mesh against quad overshading | Async staged warm-up, tiers, watchdog, idle frame skipping | **Take** draw order, windowing, the mesh check — R15 |
| **Skip** | Dust, haze, light shafts, floor shadow, photo mode, sound, HUD, the random eye and population priors, the Sharingan, the back shell | — | Not for a loader. Our framing never shows the patch's edge |

---

## 3. How we beat it

1. **Same anatomy, cheaper physics.** Bake what doesn't move. One fixed person means far more can be baked than the reference can (it re-bakes for every random eye).
2. **Analytic shadows and reflections from the shared margins.** Our lid shadow can never drift off its lid, and costs no shadow pass.
3. **A two-layer iris** instead of an SDF march: bridging fibres and real depth at a fraction of the cost.
4. **Close the gaps the reference lists in its own `ROADMAP.md`:**
   - the upper lid's fold cannot overhang its crease (R7);
   - fibres are opaque, with no light through thin bridges (R2);
   - subsurface blur is a share per channel, not by scale (R8);
   - the baked AO doesn't follow the gaze (R11; ours is analytic);
   - the cornea doesn't push the closing lid out (R7);
   - no palisades of Vogt (R1), no caruncle hairs (R6), no vellus hair (ours has it);
   - lashes alias with no minimum width (ours has 0.6 px);
   - the eye doesn't turn during a blink (ours has Bell's).
5. **Our person, not a generic eye.** Features of a dark brown, South Indian eye that it never models, each to be checked against references in its phase:
   - a velvety, dense anterior border layer, where structure shows as sheen and warm relief rather than pale fibres;
   - limbal and conjunctival pigment;
   - periorbital pigment (capped, never black);
   - scleral tone;
   - dense black lashes and brow.
6. **Readable through all ten media.** Detail is judged clean *and* through every era: dither, components, halftone, measured.

---

## 4. The phase recipe (every R phase)

1. **Research card.** The part's anatomy numbers with sources, plus 3–6 reference photos, your own eye first. Ask you for references before any visual round. Numbers marked † below are the reference's defaults; the card verifies them against a source before use.
2. **Solo view.** The part alone in the lab (`/lab/eye`), with debug views as compile-time defines: clay, normals, AO, relief steps, masks.
3. **Options, only where the choice is real.** Two or three, each with an estimated cost. You pick.
4. **Build behind a uniform gate,** so old and new can be toggled in one page.
5. **Measure** on the 610M, A/B in one page (separate runs drift ±25 %): pass ms, largest WGSL in KB, slowest pipeline. Stay inside the budget in §6.
6. **Verify:**
   - clean renders at six poses (front, left, right, up, down, half blink);
   - all ten eras on one contact sheet, each judged in its own terms (§8.2 C7) against its card (§8.6);
   - the media the phase must re-check (§8.7), and the shut eye mid-cut (C8);
   - T1/WebGL2, phone 390×844, reduced motion;
   - 2× crops before and after;
   - no SYNC pipeline in the trace.
7. **Sign-off, then housekeeping:**
   - update the matching `eye-*` skill and its numbers reference;
   - write this doc's drift log;
   - re-capture posters only once the look is signed off;
   - no commit unless you ask.

---

## 5. Phases

### Stage A · Groundwork

#### R0 · Baseline, harness, decisions
- **Baseline:**
  - per-pass GPU ms, WGSL sizes and pipeline ms on the 610M (T3, T2, T1);
  - clean renders at the six poses × ten eras.

  These are the "before" for every later phase.
- **Lab:**
  - a solo view per part, and the debug-view defines above;
  - **solo × era:** any solo view seen through any era's light, lens and medium, so a part is judged where it will live (§8);
  - a margin-curve overlay drawn over the render, to check alignment (lash roots, meniscus, shadow edge, lid edge, the media's `almond()` and 1991's underline all on one curve).
- **Era data recorded per era:** the rig's real pupil mm at rest, the gaze rest, and the share of the iris the page covers. These are the numbers the §8 cards are checked against.
- **What the media read** (the contract, §8.2 C4):
  - the apparent (refracted) iris and pupil: today `M.irisR` is the geometric 6 mm iris;
  - the margins as a sampled curve from the twin: today `almond()` is a guessed `(1 − x²)^0.75`;
  - the real crease and brow points for 2026's landmarks: today they are fixed offsets in R.
- **Twins:** pure-TS twins of `marginsAt`/`fissureAngles`, the cornea profile and the iris rest space, with unit tests against published values. This is the reference's real secret, and why its parts line up.
- **Reference board:**
  - your eye at the six poses, under one screen light;
  - macro photos of a dark brown iris and of South Indian periocular skin;
  - matched to our camera.
- **Decisions** (§7).
- *Done when:* the baseline table is in this doc, and you've approved the budgets and the decisions.

#### R0 status (2026-10-28): built, baseline taken; waiting on your sign-off

**What was built.** No change to how the eye looks.
- **CPU twins** in `src/components/three/eye/twin/`:
  - `margins.ts` mirrors `nodes/margins.ts` line for line, and now owns `FISSURE_MM`, `LID_THICKNESS` and `fissureAngles` (the shader re-exports them);
  - `optics.ts` holds today's cornea and the paraxial entrance pupil;
  - `iris-space.ts` holds today's remap and R2's area-preserving rest space.

  `npm run test:eye` (`node:test` + `tsx`): **13 pass, 4 todo**. Each `todo` is a known gap tagged with its phase:
  - R6: the medial corner lands at 12.9 mm, not 14, because `asin` clamps at 0.99 and 14 > `MARGIN_RADIUS` 13.1;
  - R1: the entrance pupil sits 2.44 mm deep at ×1.105, where Gullstrand gives 3.04 at ×1.13. The pupil plane is 0.65 mm shallow;
  - R1: the visible limbus is an 11.8 mm circle, not ~11.7 × 10.6;
  - R2: today's remap doesn't keep the pupillary zone's area.
- **Lab** (`/lab/eye`):
  - a URL setup read before the first compile: `?tier=1|2|3&gl=1&see=1&reduce=1`, with a new stage `tier` prop;
  - solo buttons per layer (solo × era = solo, then Ways of seeing, then an era);
  - **Alignment (R0)**: the margin overlay. Green is the twin's margins, projected through the stage camera (new `project`, `lidUniforms` and `mediumGeometry` on the stage control); magenta is the media's `almond()` and iris. `window.__eyeAlign()` gives the gaps.
  - The green line hugs the rendered lids in every era and pose, so the twin matches the shader.
- **Baseline:** `scripts/eye-realism-baseline.mjs`. Outputs are in `docs/era-pov/r0-baseline/` (gitignored):
  - `baseline.json`;
  - `sheet-poses.png` (6 poses × 10 eras, clean);
  - `sheet-media.png` (each medium at rest and half shut);
  - `sheet-align.png` (the overlay per era);
  - the raw shots.

**Baseline.** Measured on the Radeon 610M, headless Chrome, 1440×900 at DPR 1. The lab renders every frame with timers on. Medians of 8 half-second readings.
- "+medium" = with medium − clean; the two runs were separate, so allow ±25 %.
- Page share is from the reduced-motion `share` session; it includes limbal and scleral glints. The `live` session's page share is wrong for dim pages: ignore it.
- Gaps are mm between the real margin and the media's almond.

| Era | Clean T3 ms | + medium T3 | Medium alone ≈ | T2 + medium | WebGL2 (T1) + medium | Pupil mm | Page share of iris | Almond gap upper / lower | Gaze, blink every |
|---|---|---|---|---|---|---|---|---|---|
| 1970 | 24.0 | 26.6 | 2.6 | 26.6 | 15.0 | 4.55 | 0.43 | 2.1 / 1.4 | read, 5.5 s |
| 1981 | 25.8 | 30.9 | 5.1 | 28.7 | 13.5 | 3.42 | 0.64 | 2.2 / 1.3 | scatter, 3.6 s |
| 1991 | 22.1 | 26.9 | 4.8 | 26.6 | 15.1 | 2.96 | 0.57 | 2.3 / 1.3 | read, 6 s |
| 1995 | 23.7 | 28.0 | 4.3 | 27.7 | 15.4 | 4.28 | 0.47 | 2.7 / 1.3 | scatter, 3 s |
| 1997 | 22.4 | 27.0 | 4.7 | 26.7 | 15.0 | 4.48 | 0.59 | 2.6 / 1.3 | two-target, 3.6 s |
| 2000 | 23.3 | 24.4 | 1.1 | 26.1 | 17.6 | 3.01 | 0.58 | 2.4 / 1.3 | lock, 6.5 s |
| 2003 | 21.4 | 24.4 | 2.9 | 24.3 | 14.1 | 2.70 | 0.59 | 1.9 / 1.3 | idle, 3.6 s |
| 2009 | 23.2 | 26.1 | 2.9 | 26.2 | 16.4 | 2.69 | 0.51 | 0.8 / 1.4 | scroll, 4.5 s |
| 2013 | 24.0 | 33.0 | 9.0 | 31.4 | 21.7 | 2.74 | 0.74 | 0.9 / 1.1 | two-target, 4 s |
| 2026 | 22.0 | **57.4** | **35.4** | **55.2** | **37.2** | 3.13 | 0.68 | 2.4 / 1.3 | contact, 4.2 s |

The corners are the same in every era: the media's almond ends **2.0 mm** beyond the real inner corner and 0.5 mm beyond the outer one.

**Layer costs** (1970, clean, each layer switched off and on three times in one page):
- lids, skin and brow **5.2 ms**;
- eyeball 0.7 and cornea 0.8 (both inside the noise);
- lashes, tears, socket and room: within ±2 ms of zero (noise).

About 15 ms of the clean frame sits in passes the layer switches don't reach: the post chain, the screen pass, the tear simulation, the MRT targets.

**Shaders and start-up** (T3):
- clean: 51 shader modules, 627 KB of WGSL, the largest the lids' vertex stage (128 KB); 29 pipelines;
- with media: 160 modules, 1.4 MB, the largest one fragment of 273 KB (over the ~150 KB per-medium budget); 93 pipelines;
- the only synchronous pipeline is three's own `mipmap-rgba8unorm-2d-array` (0 ms): harmless;
- the slowest async build takes ~4.8 s;
- pipelines settle about 10.6 s after load (WebGPU), 15.9 s on WebGL2.

**What this changes in the plan:**
1. **The frame is ~22–24 ms clean, not ~15.** The 12 ms T3 target needs nearly half the frame back. §6 now carries measured numbers.
2. **2026's medium costs ~35 ms:** 57 ms a frame, 15 fps on the weak GPU, worse than any other era by 4×. It is the worst era and sets the budget. **Recommendation: move it to the front of R15, before R1**, since it hurts the live loader today.
3. **T2 buys almost nothing over T3** (within 1–2 ms). Lids and skin, the fixed passes and the media dominate; the tier knobs (iris bake, lash counts, parallax) don't. R15 rethinks what a tier changes.
4. **Per-pass GPU timing is R15's first task.** Toggling layers can't see the ~15 ms of fixed passes.
5. **The page covers more than ~60 % of the iris** in 2013 (0.74), 2026 (0.68) and 1981 (0.64). R1 brings these back to ~0.6, unless you'd rather relax the rule.
6. **The pupil doesn't rank as §8.4 expected.**
   - 1991 isn't the smallest (2.96 mm): 2003, 2009 and 2013 are, at ~2.7.
   - 1997 is large (4.48) because it still uses the fallback light.
   - §8.4 now shows the measured values; batch 2 will move 1997, 2000, 2003 and 2009.
7. **The media's almond is up to 2.7 mm off the real upper lid, and 2 mm past the inner corner** (`sheet-align.png`). That confirms finding #6 (§8.1); R6 replaces the almond with margin samples.

#### R15a · 2026's cost, pulled forward (2026-10-28, done)
You signed off R0 and asked for this before batch 2 and R1.

**Finding the cost:**
- The stage's profile mode now times every render pass: `stats.passes`, GPU ms per pass named "material → target", a mean over the frames since the last reading. It uses three's per-render-context timestamps and a hook on the renderer's inspector.
- The scene pass was ~16–18 ms in every era. 2026's final pass (the medium) was **31.6 ms**, against 1970's 3.7.
- Each of 2026's layers is now a uniform `If`, so the lab can read each layer's price. The breakdown: landmarks 18 ms, geometry 4.4, "you" 3.4, registration 2.8, sign 0.7. The cause was every pixel evaluating all twelve landmarks, the gimbal's three ellipses (each with an `atan`), the dial numerals and the corner readouts.

**The fixes** (no change to the image):
- **Landmarks:** what depends on no pixel (position, ring radius, bracket size, leader, label origin, fades) is worked out once a frame on the CPU (`post/measured-marks.ts` → `medium.marks`, 48 vec4s). Each point draws only on its ring band or near it, and inside its callout's box.
- **Gimbal ellipses:** each draws only within its stroke band of the distance estimate, before the `atan`.
- **Dial numerals:** only in their radial band.
- **Corner readouts:** only in their corners.
- **"You":** skipped without a visitor's pointer; the fixations' attention only within 3σ.

**Result:** 2026's final pass **31.6 → 9.6 ms** idle, 11.2 with a pointer. The frame is 57 → ~26 ms, against 1970's ~21. 2026 now costs about what 2013 does; 2013 is the heaviest era again.

**Proof:** reduced-motion shots before and after, diffed:
- noise floor between two shots of the same build: mean 1.41, ~300 px over 24 levels;
- after vs before: mean 0.04–1.41, the only pixels over 24 levels in the ticking clock and pupil-trace readouts.

One slip, caught by the diff: a gimbal value shared by two culls wasn't pinned, and a ring vanished. It is now in eye-tsl-craft.

**Not done:** the gimbal's per-pixel trig (its ring normals depend on no pixel) could move to the CPU too, for another ~1–2 ms.

#### Batch 2 lights (2026-10-28, done)
- **Own devices** for 1997, 2000, 2003 and 2009, as `ERA_POV_PLAN.md` specified: Trinitron up-left with an office bar; TN from below; LCD at eye level with window daylight; phone from below with a lamp. Their gaze rests and follows are the spec's (2009 at −0.7: −1.5 hid the iris).
- **2003's lens** loses its flash.
- **A fill's `catchlight` is now a strength** (0..1, default 1, so no other era changes):
  - 1997's office bar is 0 (decision 6);
  - 2003's window is 0.35: at full strength it outshone the blue page in the cornea.
- The pupils didn't move: the rig follows each page's brightness, not the light's geometry. Media and signs for these eras are unchanged.
- Before/after: `docs/era-pov/batch2/batch2-lights.png`.
- **Left for R11:** decision 6 for 1981's tube bar, 2013's tabletop and 2026's window fill, which still reflect at full strength.

### Stage B · The globe

#### R1 · Globe, cornea, limbus
- **Take:**
  - a conic anterior cornea (R ≈ 7.8 mm, Q ≈ −0.25†) meeting the 12 mm sclera sphere at the limbus through a C2 blend that dips slightly into both (the sulcus);
  - a posterior sphere (≈ 6.5 mm†, 0.55 mm thick†);
  - Newton refinement onto the exact surface;
  - analytic normals, so catchlights stay smooth at any scale;
  - two-surface refraction (cornea 1.376, aqueous 1.336);
  - a test that the entrance pupil sits ~3.04 mm deep at ×1.13.
- **Limbus:**
  - vertical overlap, so the visible iris is ~11.7 × 10.6 mm†;
  - an opacity band and the limbal ring;
  - **new:** palisades of Vogt (radial ridges, pigmented and visible in dark eyes, strongest above and below) and a limbal pigment band.
- **The page in the cornea:** the conic changes only how the page bends and blurs toward the rim. Its size stays tuned by each era's stylised screen size (`ERA_LIGHT.size` ×0.62), so it keeps covering ~60 % of the iris, and 1981's medium still caps it at ×0.68 paper. *Why:* the size is an art-direction rule ("a whole-iris reflection read as a lens"), not optics.
- **The visible limbus becomes an ellipse** (~11.7 × 10.6 mm). Every medium that draws at the iris radius must read it as one; the kit gains `F.Rx`, `F.Ry` and a `limbus(F, p)` distance. Those media:
  - 1995's link ring;
  - 2013's limbus segments and dial clip;
  - 2026's limbus fit (an ellipse fit is the real eye-tracking notation);
  - 1981's XOR disc and 1991's iris invert.
- **The media's iris is the apparent one:** `M.irisR`, `M.pupil` and `pupilR` come from the refracted image (×~1.13 at the pupil). Otherwise the 1970 cursor, 2000 caret, 2013 keyboard and 2026 pupil fit drift off the pupil you see.
- *Budget:* +0.3 ms at most on the eyeball cap.
- *Done when:*
  - a side pose shows the corneal bulge and the sulcus;
  - the iris shifts behind the cornea as the eye turns, as in your reference;
  - a refraction-checker view proves the optics.

#### R1 status (2026-10-28): built, waiting on your sign-off
**What changed:**
- **Cornea** (`nodes/cornea.ts`, `anatomy.ts`):
  - a conic dome (R 7.8 at the apex, Q −0.25), the ball's cap laid onto it in the vertex stage, with an analytic normal;
  - the apex is 12.99 mm out, and the conic meets the globe at the same limbus;
  - the view refracts twice, into the cornea and out of a 6.5 mm back sphere 0.55 mm behind the apex, with one refraction where the back surface is missed;
  - the pupil's plane is now 3.6 mm behind the apex (it was 2.95), so the pupil appears **3.04 mm deep at ×1.131** (Gullstrand: 3.047 at ×1.133).
- **Limbus:**
  - the clear dome and the globe's ring and halos are an ellipse, 11.7 × 10.6 mm;
  - a faint warm limbal band;
  - pigmented palisades of Vogt above and below.
- **Media:**
  - they read the visible limbus (`F.Rx`, `F.Ry`, `limbus()`, `limbusR()`, foreshortened with the gaze);
  - the pupil is read as the cornea shows it (×1.13, turning about the entrance pupil at ~9.95 mm instead of 10.4);
  - `cornea()`, 1981's selection, 1991's iris, 1995's link ring, 2013's dial clip and hover glow, and 2026's limbus fit (now an ellipse fit) all moved onto it.
- **Twins:** the optics twin is the R1 eye. `npm run test:eye` gives **14 pass, 2 todo** (R2, R6); both R1 gaps are closed.

**What you'll see** (`docs/era-pov/r1/r0-vs-r1-crops.png`, `sheet-poses.png`, `sheet-media.png`, `signs-hover.png`, `limbus-zoom.png`):
- **The page in the cornea is a little larger** (the flatter rim mirrors more of it): page share up 0.02–0.03 in every era, 0.45 (1970) to 0.76 (2013).
- **The iris sits deeper:** a darker band at the angle just inside the limbus, and more parallax as the eye turns.
- **The iris is a little less tall.**
- **The palisades sit mostly under the upper lid** at this framing; they show at the lower limbus and in up-gaze.
- **1970 changed too** (the benchmark). The opening's shut stills and the posters are re-captured only after you sign R1 off.

**Cost** (`docs/era-pov/r1/baseline.json`; 610M, 1440×900):
- This round, `stats.gpuMs` became the mean per frame over each half second. Before, it was three's reading of the last frame alone. **R0's frame numbers and these are not comparable.** Use these as the new baseline.
- Clean: 16.6–19.8 ms.
- With media: 17.9–23.5 ms. 2013 is 23.5; 2026 is 27.8, now ~8 ms over 1970's 19.4 (it was ~31 ms over).
- Layers, switched in one page: lids 1.5, cornea with the iris it draws 2.9, eyeball 1.7, lashes, tears and room under 0.4 each.
- Shaders: 1.4 MB with media; the largest fragment is 266 KB. The only synchronous build is three's mipmap pipeline. No WGSL errors.
- R1's own marginal cost wasn't A/B'd in one page (the old path is gone). By instruction count it is well under its 0.3 ms budget: one extra refraction, a sphere hit and an ellipse per cornea pixel.

**Not verified:**
- Hover and press states: the headless pointer didn't register hover this run.
- Phone sizes.
- R1's marginal cost in one page (above).

| What | Spec | Built | Why |
|---|---|---|---|
| Sulcus blend | a C2 blend dipping into both surfaces at the limbus | none; the conic meets the globe with a kink, as the sphere did | invisible from the front framing; the rim and limbal shade cover it |
| Page share | back to ~0.6 where above | unchanged; it rose 0.02–0.03 with the conic | resizing pages changes four signed-off eras. Decision for you: shrink 2013 (0.76), 2026 (0.71), 2003 (0.68, window included) and 1981 (0.67), or relax the rule |
| Palisades | visible at the limbus | under the upper lid most of the time | the lids cover the iris's top 1.6 mm by design |

#### Reflection per era (2026-10-28, done: your picks applied)
You signed off R1 and asked to fine-tune the page in the cornea per era, rather than hold every era to 60 %.

**The rule, rewritten.** 60 % was a design rule, never a realism one: a real cornea reflects a 14" screen at 55 cm as ~2 × 1.5 mm, about 3 % of the iris. An era's reflection now passes two checks:
1. **The era's key interface reads** through its own medium, on desktop and phone.
2. **It still reads as an eye:** a dark ring of iris shows all round the page, the pupil shows through, and the page never fills the iris edge to edge.

Within those, each era chooses its size and its framing (`ERA_LIGHT[era].reflect`, look.ts `EraReflect`).

**Found on the way.** Each captured page is drawn into the 16:9 screen texture and then stretched onto the device's own rectangle:
- CRT pages are squeezed ~25 % sideways;
- 2009's portrait phone squeezes its page to about a third of its width (the tall "MAPA" in R1's crops).

The framed variant cuts its region at the device's own aspect, which fixes this.

**Built for the comparison:**
- the screen pass can hold one page region still instead of scrolling (`pageFramed`, `pageFrameA`/`B`, `screen-pages.ts` `framePage`);
- the reflection's size scales per era;
- each era's key interface is proposed in look.ts `ERA_REFLECT_KEY`;
- lab "Reflection" section; `holdReflection()`;
- `scripts/eye-realism-baseline.mjs` session `reflect`.

**The three variants per era**, through its medium (reduced motion), desktop 1440×900 and phone 390×844:

| Variant | What it is |
|---|---|
| as built | the whole page scrolling, at today's size |
| ~60 % | the same page scaled so it covers ~60 % of the iris (scale √(0.6 / R1's share): 1970 ×1.16, 1981 ×0.95, 1991 ×1.0, 1995 ×1.11, 1997 ×0.98, 2000 ×1.02, 2003 ×0.94, 2009 ×1.01, 2013 ×0.89, 2026 ×0.92) |
| key interface | today's size, the page's key region held still at the device's aspect |

The key regions:
- 1970: KIRUK banner and prompts;
- 1981: icons and window;
- 1991: title and links;
- 1995: WELCOME banner and counter;
- 1997: nav and content frames;
- 2000: the search box;
- 2003: the profile card;
- 2009: the iPhone itself;
- 2013: header and cards;
- 2026: the halftone pupil and composer.

**Sheets:** `docs/era-pov/reflection/sheet-reflect-1.png` (1970, 1981, 1991), `-2` (1995, 1997, 2000), `-3` (2003, 2009, 2013), `-4` (2026).

**Your picks** (now `ERA_LIGHT[era].reflect` in look.ts; all ten shown in `docs/era-pov/reflection/chosen.png`):

| Era | Pick | Why |
|---|---|---|
| 1970 | ~60 % (×1.155) | the terminal lines and the KIRUK banner read larger beside the cursor; the key frame put the banner under the cursor block |
| 1981 | as built | in 1-bit the whole page keeps the Star's bars and window lines; zoomed in, it dithered to texture |
| 1991 | key interface | the title and the first links, a little larger, at the CRT's own aspect |
| 1995 | ~60 % (×1.107) | WELCOME TO KIRUK and the counter larger; it had the smallest page (0.49) |
| 1997 | key interface | the heading a little larger. **Still a bright blob**: the page's brightness, not its size (open) |
| 2000 | key interface | the Kiruk logo and search box become legible |
| 2003 | key interface | the profile card under the glossy header |
| 2009 | key interface | the iPhone upright at its real proportions; "4:14 AM" reads (as built squeezed it to a third of its width) |
| 2013 | as built | its medium draws the iris as a dial, so nothing shows at rest |
| 2026 | key interface | the home's halftone pupil lands in the eye's own pupil |

**After the picks:**
- The 20 posters are re-captured (`public/eye/posters`).
- The opening's shut-1970 stills show the lids closed, so neither R1 nor the reflection reaches them; they stay.

**Still open:**
- **Phones:** in every variant the page is too small on a phone to read. Size alone in this range doesn't fix it; a phone needs its own answer (a larger page on phones only, or the key region larger still). Not decided.
- **1997:** the reflected page blows out to a cream blob; it needs its brightness or contrast tuned in the cornea, not its size.
- **The lab keeps its "Reflection" controls** (size, whole page or key interface) for tuning any era later.

#### R2 · Iris relief
- **Two baked layers** in rest space (polar, θ × ρ):
  - a **stroma floor**: thickness profile, collarette zig-zag ridge, crypts as stretched Voronoi cells with their wall darkening, contraction furrows, ruff;
  - a **fibre shell** above it: radial vessels, waving, and collagen arcs, with coverage, so fibres bridge over crypts.

  Plus baked AO and a horizon map for self-shadow.
- **Marching:** relief mapping with a binary refine per layer, at the ray's footprint mip:
  - T3: 12 + 4 steps;
  - T2: 6 + 3;
  - T1: today's single parallax step.
- **Dilation:** area-preserving rest space (pupillary zone keeps its area, ciliary zone linear, thickness ∝ area^−k), so the pupil never needs a re-bake.
- **Beat the reference:** light through thin bridging fibres (a transmission term from coverage × thickness).
- **Dark-iris realism:** crypts shallow and low-contrast; structure read by relief and a soft sheen, never by white fibres (today's look).
- *Budget:* iris ≤ 1.2 ms at T3 with the iris filling the frame.
- *Done when:*
  - the clay view shows fibres bridging crypts and depth shifting with the view;
  - nothing shimmers at rest.

#### R2 status (2026-10-28): signed off
You signed it off on the defaults:
- T3's march is kept: ~+1.6 ms a frame at iris-fill, over the 1.2 ms budget.
- The bake stays at runtime, once per person, not offline KTX2.

**At sign-off:**
- the single parallax step, its albedo and masks bake and the `U.iris.r2` gate are gone (the cornea's fragment shrank 121 → 84 KB);
- the iris bakes only for a new person, so era changes bake nothing (checked: no bake pass in three cuts; it was ~70 ms of GPU in every cut);
- the 20 posters are re-captured (`docs/era-pov/r2/posters-check.png`).

**What changed** (lab "Iris relief": the views iris, clay, occlusion, steps, layers; `?box=iris` fills the frame with the iris):
- **Bake** (`bake/iris.ts`): two more targets per set.
  - `relief`: the stroma floor, the fibre shell, the shell's cover, the floor's tone.
  - `colour`: the surface colour and the floor's AO (16 taps, in mm).
  - Laid out once, at the person's own resting pupil. Today's albedo and masks stay beside them for the A/B.
- **The iris as tissue:**
  - the anterior border layer covers the stroma everywhere but the crypts, where only the trabeculae bridge and the floor shows;
  - crypts are Voronoi cells, radially stretched, in clusters by the collarette and near the root;
  - furrows are broad folds;
  - collagen arcs are faint;
  - no grey scatter in a dark iris.
- **Shader** (`nodes/iris.ts`):
  - **Rest space:** the area-preserving map (the collarette follows the pupil), held short of the root past ~0.9 open. The ciliary zone thickens as it is squeezed.
  - **March:** the ray is followed down through both layers, linear in the map's Jacobian at the hit. The shell comes first with a secant refine. The floor is marched only where the border layer opens, with 2–3 steps toward the key, where crypt walls block the light and bridges pass some through.
  - **Tiers:** T3 10 + 2 + 3, T2 6 + 1 + 2; T1 one parallax step on the two layers.
- **Twin:** `twin/iris-space.ts shaderRestRho`. The R2 todo is now two passing tests; `npm run test:eye`: 65 of 66 pass; the one left is R6's todo.

**What you'll see** (`docs/era-pov/r2/`):
- `sheet-iris-crops.png` and `loader-framing-2x.png` (today left, R2 right): a dark brown iris read as tissue. Fibres are a shade warmer and lighter than the layer between them, never grey. The collarette is a raised band, crypts are dark dips beside it, and the furrows are soft.
  - At the loader's framing the fibres read as well as today's white strands in 1970, 2003, 2009 and 2026.
- `sheet-iris-views.png`:
  - clay: fibres, crypt pits, furrows;
  - occlusion: red where the key is blocked;
  - steps: green only in the crypts;
  - layers;
  - a pupil sweep (0.2–0.85: the pupillary band narrows as the collarette follows the pupil);
  - side views;
  - T2, and T1 on WebGL2.
- `sheet-iris-media-1..4.png`: every era through its medium, desktop and phone.
  - 1970 keeps its crypts and collarette and loses the white streaks; its card puts fibres below its floor.
  - 2013's dial and 1981's ink are unchanged.
- **Shimmer at rest:** 0 (both paths, two shots 1.6 s apart, lens off).

**Cost** (610M, A/B in one page, `docs/era-pov/r2/baseline.json`; other sessions shared the GPU, so the readings are noisy):
- **Iris filling the frame, T3 (~1.3 M iris pixels):**
  - the whole frame is 23.0–23.4 → 24.7–24.8 ms, **+1.4 to +1.8**;
  - the scene pass is +1.9 to +4.2.
  - Over the 1.2 ms budget.
  - The first build was +9.4 ms: an `atan` and two square roots per step, and the floor marched everywhere.
- **T2 at iris-fill:** +3.5 to +4.0 this run; the run before read within noise. Not settled.
- **The loader's framing, 1991 through its medium:** +0.6 to +4.9 ms. Too noisy to read.
- **An era change's bake today:**
  - every cut re-bakes the iris: today's two passes plus R2's two, ~120–190 ms of GPU at T3 (2048 × 512) in one frame;
  - after sign-off, R2 alone stays and bakes once, so cuts stop baking.
- **Shaders:** 730 KB in all. No WGSL errors on T3, T2, T1/WebGL2 or the phone. The only synchronous build is three's mipmap pipeline.

**Not verified:**
- the phone shot of 2009 with R2 (the stage was remounting when it was taken; every other era is shot);
- hover and press;
- the cost on a quiet GPU.

**Decisions for you:**
1. **Budget:** ~+1.6 ms a frame at iris-fill against 1.2. Keep T3's march, or give T3 T2's (6 + 1 + 2)?
2. **Decision 1, offline KTX2 for the iris:** with R2 baked once, the runtime bake is ~60–95 ms once, behind the poster. Two RGBA8 targets at 2048 × 512 are 8 MB raw, an estimated 4–6 MB with zstd (not measured), against the plan's 0.5–1.5 MB for all bakes. Keep the runtime bake for the iris, or ship it at 1024 × 256?

| What | Spec | Built | Why |
|---|---|---|---|
| Self-shadow | baked horizon map | 2–3 steps toward the key from the floor, only where it shows | one light: a 4-direction map doubles the targets for what three samples do |
| March | T3 12 + 4, T2 6 + 3, binary refine | T3 10 + 2 + 3, T2 6 + 1 + 2, secant refine, linear map, floor only in openings | +9.4 → ~+1.6 ms a frame at iris-fill |
| Fibre cover | fibres with coverage bridging crypts | the border layer covers 0.92 everywhere but crypts; fibres bridge only there | fibres over open floor everywhere read as hair on black |
| Collagen arcs | both ways | at 0.22 of the vessels | at full weight, a lattice |
| Furrows | contraction furrows | broad, faded in and out round the iris | narrow hard-ended rings read as scratches |
| Fibre tone | relief and sheen, no white fibres | surface 0.6–1.5 × its zone across a fibre, relief ×4.5, sheen 0.1 | at half that, the loader's framing lost the detail |
| Layout | rest space so the pupil never re-bakes | laid out once at the person's resting pupil; only a new person bakes | era changes no longer bake (they did, ~70 ms of GPU per cut) |
| Offline bake (decision 1) | build-time KTX2 | runtime, once per person | your call at sign-off: ~60–95 ms once behind the poster against an estimated 4–6 MB download |

#### Motion calm fix (2026-10-28, from your review of R2)
You found the eye "going to and fro, too much, shaking". Measured per era at the loader's framing, media on, no pointer (8 s each, the weak GPU at 13–42 fps):

| | Before | After |
|---|---|---|
| Iris wobble | at its ±0.25 mm clamp 87–100 % of frames, flipping sign 13–30×/s (every frame) | ≤ 0.034 mm peak, never at the clamp |
| Microsaccades | 0.4–1.74/s | 0.25–0.62/s |
| Saccades | 2.1–2.25/s in 1970, 1991, 1995 | 1.2–1.6/s |

- **The shake was a bug:** the 9 Hz wobble spring was stepped once a frame, and is unstable under ~35 fps. It is now kicked by each frame's change in turning speed and stepped at 240 Hz (ζ 0.32 → 0.45, clamp 0.25 → 0.15 mm).
- **Microsaccades:** every landing, microsaccades included, reset the timer to 0.3–0.8 s; now only a real saccade pushes it back.
- **Fixations:** 1970 and 1991 420/400 → 750 ms; 1995 450 → 800; 1997 650 → 900; 2003 700 → 1100; 2009 700 → 950. Microsaccade rate 0.6 → 0.45 (2000 0.7 → 0.5). Each era keeps its script; it just moves less often.

#### Your eye as the benchmark (2026-10-28)
You shared a macro of your own eye (`docs/era-pov/ref/user-eye.webp`) and asked to upgrade each component to it. Start with the iris and the left side (the inner corner and the nasal white). Keep our own concept:
- each era's screen in the cornea, at the size picked per era;
- the eras' light, lens and media;
- the one person.

The photo is graded (cool, sharpened), so it sets **structure and relationships**, not absolute hue. Compared at the same aspect, clean (no medium, no era lens): `docs/era-pov/ref/yours-vs-ours.png`.

| Component | Your eye (measured) | Ours today | Phase |
|---|---|---|---|
| Iris body | near-black, L\* ≈ 16 from 0.15 to 0.9 R; fibres faint (L\* rms 3.7); the pupil barely separates | as dark where the page doesn't cover it (L\* 6–14); fibres 3.0–3.4 | R3: colour from layers, light through the cornea |
| Limbus | a soft ramp, L\* 18 → 34 → 56 → 73 over 0.9–1.1 R; no ring darker than the iris | a ring darker than the iris (L\* 6–9 at 0.85–0.9 R), then a sharp step: a drawn outline | R3 (limbal band; R1's ring and halos) |
| White | bright (L\* 78), wet, vessels nasally, a shadow under the upper lid | L\* 49–66, beige, flat, no vessels, a grey band below the iris | R5 (+ R11's lid shadow) |
| Inner corner | flat, wet, pink-orange tissue blending into the plica and lower rim; wet glints; vessels run into it | a saturated pink bead (a\* 19) with an outline | R6 |
| Lower rim | a wide wet tan rim, a bright meniscus line (L\* 72), glints | a red line plus a blue line | R6 + R12 |
| Lashes | clumped, curved, varied, with highlights | an even comb of straight lines | R9 |
| Skin | pores, oily glints, folds; L\* 34 under the eye in that light | smooth, L\* 14–16 under the screen light | R8 (and a skin-tone check under matched light) |
| Gradients | continuous | bands in the white and the corner with the era lens off (8-bit, no dither) | R14 |

**Batches:**
- **A (the components you named):** R3 iris and limbus, R6 inner corner and lower wet rim, R5 the white and its vessels.
- **B:** lashes (R9), skin (R8), lid form (R7).

The cornea's page stays the era's interface (your reflection picks); only how real the eye around it is changes.

#### Batch A built (2026-10-28): waiting on your review
Order as you asked: the left side first (R6), then the white (R5), then the iris and limbus (R3). Each part next to your photo: `docs/era-pov/r6/r6-vs-your-eye.png`, `docs/era-pov/r5/r5-vs-your-eye.png`, `docs/era-pov/r3/r3-vs-your-eye.png`; all three in 2026 and 1991, before and after: `docs/era-pov/r3/batch-a-2026-1991-before-after.png`. Clean renders (no medium, lens off) at your photo's aspect; each era's medium: `docs/era-pov/batch-a/`.

| Part | Your eye | Before | Now |
|---|---|---|---|
| Inner corner | flat, wet salmon tissue running into the rim; a darker plica fold, a pink blush, vessels | a pink bead (a separate egg mesh) with an outline | one field over the white and the socket (`nodes/canthus.ts`), no mesh: a flat lobed caruncle (L* 37, a* 17, b* 22 in 2003's light; yours 53/20/20, graded), the plica's crescent and valley, a blush on the white, a few droplets |
| Lower rim | a wide wet tan strip (67–77 L*), a pale junction, a bright meniscus (91), droplets on the roots | a red line and a blue line | the strip at its true projection (~0.44 mm under the iris), tan (L* 36, hue 58°; yours 64°), a pale pink-beige junction, the meniscus +20 L*, a tear-film sheen, droplets in clumps on the lash line, the punctum 6.3 mm out; its back edge rests on the cornea |
| The white | bright, wet, one thick tortuous vessel, a faint crack-like net, brown pigment by the limbus | flat, no vessels (noise vessels blurred away at ~14 texels/mm) | grown vessels (`bake/vessel-net.ts`, ~54 px/mm): tortuous trunks from the corners, densest nasally, one big squiggle, deep soft ones, a capillary net, limbal loops; patchy limbal melanosis (`sclera.pigment`) |
| Iris | near-black velvet, faint texture (rms 5.2) | pale radial threads (fibres 2.5× the gaps), rms 8.4–9.0 | Kubelka–Munk from the layers (border layer, stroma with blood, black epithelium): dark brown, fibres no paler than the gaps, warmer crypt walls; sheen 0.035; rms 6.2–6.3 |
| Limbus | a soft ramp over ~0.2 R | a ring darker than the iris, a cut edge, a dark blue-grey halo | a ramp: the cornea fades over its outer 7 %, the white comes up from the iris's dark through a cool grey |

- **Kept:** the era's page in the cornea at your picked sizes; every era's light, lens and medium; the one person (tissue colours are the person's tone mixed toward flesh, so they stay pigmented).
- **Not done in this batch:** the white's wet micro-relief; light through the cornea (R3's second half: refracted key, lid shadow at entry, a derived caustic); Marx's line and placed meibomian orifices (sub-pixel at this framing); caruncle hairs; the media's margin samples (C4); the medial corner at 14 mm (the twin's todo, unchanged).
- **Twins:** `npm run test:eye` 92 pass, 0 fail, 1 todo (R6's medial corner, as before).
- **Cost (T3, 610M, A/B in one page with a temporary gate over everything batch A adds per pixel):** the scene pass +0.15–0.85 ms at the loader framing (median ~0.4, 4 interleaved pairs); with the iris filling the frame the pairs scattered 0.1–4 ms under another session's GPU load, so that one is not pinned. The colour (K–M) is in the bake: 0 at runtime. The vessel map's 4× anisotropic filtering cost ~2 ms by itself and is off (no visible loss). No WGSL errors on T3, T2, T1/WebGL2, desktop or phone; every era through its medium: `docs/era-pov/batch-a/media-desktop-sheet.png`, `media-phone-sheet.png`.

#### Batch A, round 2 (2026-10-28): the inner corner's root fix, the skin's sparkle (signed off)
Your review: the inner corner was too big, and the rim's sparkle read as a reflection laid on, not skin. Three more photos of your eye: `docs/era-pov/ref/user-eye-2.webp` (oblique), `-3` (the first, uncropped), `-4` (ungraded).
- **Root cause, measured on a mm grid (photo 4):** both your canthi sit under the iris's centre, the inner one ~3–3.4 mm (your first photo: 2.9), the outer ~1.9. Your upper lid's arc is tall, your lower lid shallow and nearly level nasally, and the inner corner is a low, tight angle. Ours put the inner canthus 0.9 mm low with both lids bowing evenly away from it, and closed the corner in a 2 mm round lake. The opening 1, 2 and 4 mm from the canthus was 1.66, 3.2 and 5.6 mm, a tall blunt window, and the caruncle filled it.
- **The fix, in the lids:** each lid comes down to its canthus as its bow runs out (`FISSURE_MM.canthus` 3, `canthusL` 1.9); the nasal bows fitted to your eye (rms 0.26 mm), the outer lower lid shallower (exponent 1.6); a ~0.9 mm lake. Now 0.9, 1.7 and 4.2 mm open at 1, 2 and 4 mm. The apexes, height, gaze coupling and blink are unchanged (the twin's tests hold; a new one pins the corner).
- **The tissue, scaled into it:** a smaller caruncle (half-width 1.3, centre ~1 mm out), rose-red as in your ungraded photo (hue 37°, not orange), its top in the upper lid's shadow; the plica pale and short (its horns run under the lids; the long pink horn had drawn an outline).
- **The media meet the lids:** `almond()` now ends at the real canthi (`apC`, the twin's `canthi()`), at their real reach.
- **Checked:** `npm run test:eye` 93 pass, 0 fail, 1 todo (the medial corner's length, as before); every era through its medium on desktop and phone, T1 on WebGL2: no shader errors, no blank frames (`docs/era-pov/r6b/round2-media-*.png`). **Cost** (T3, 610M, A/B in one page with a temporary gate over the sparkle, 12 interleaved pairs at the loader framing): the scene pass +0.2–0.7 ms (medians of two runs; pairs −0.4..+1.7 ms under another session's GPU load). The lid shape itself is a few extra ALU per margin evaluation, not measurable. **Recaptured on sign-off:** all 20 posters (lab capture, each era through its screen), and the opening's shut-1970 stills (wide 3.1 KB, tall 2.2 KB: the skin's texture costs a little). Hand-off proof (the still placed by `posterPlacement`, edge maps at the still's resolution): wide at 1440×900 ×1.00, (0, 0) px, correlation 0.90 (the old still 0.75); tall at 390×844 ×1.00, (0, 0), 0.86 (old 0.74). Sheets: `docs/era-pov/r6b/posters-round2.png`, `shut-stills-new.png`.
- **The sparkle is the skin's own:** the skin's tile now carries a micro-relief (fine crossing furrows ~0.22 mm apart, pores); its micro-normals break the screen's light into small highlights on the plateaus, densest on the oily lower lid, sharpest along the wet lash roots. The round droplets are gone.

#### Batch B (2026-10-28): lashes, skin, lid form (signed off)
Research card: `docs/BATCH_B_LASHES_SKIN_LIDS_CARD.md` (sources, numbers, gaps). Each part next to your photos: `docs/era-pov/batch-b/r9-lashes.png`, `r8-skin.png`, `r7-lid-form.png`; the gaps before: `gaps.png`; every era through its medium: `docs/era-pov/batch-b/run/`.
- **R9 lashes:** no two alike (lengths ±30 %, a few short new ones, curls vary, a slow wander, crossings); roots bunch into clumps with gaps and spikes; finer (upper 0.07–0.095 mm); every lower lash curls, finer, brown at the tips; a root bulb and a fine tip; a white wet R lobe and a warm TRT one.
- **R8 skin:** the person is now Monk 8 with a golden undertone (your call: your skin's albedo measures ~L* 35; skin/white 0.04 → 0.11, yours 0.13; hue 50°, yours 55°); less pink and red bleed on the lids; the micro-relief's furrows show in the colour; fine hairs from just under the lashes.
- **R7 lid form:** under the eye, the order your photos show (light roll 0–2.5 mm, darker band 3–6.5, the cheek from ~7) instead of a dark groove and a pale bag; a shallow tear trough toward the nose.
- **Not done:** the upper hood's texture and overhang, the tarsal plate over the corneal bulge, follicle stars, scale-correct subsurface, lash shadows (R11).
- **Cost** (T3, 610M, 2003 at the loader framing, reduced motion): the lids A/B'd against round 2's lid file in alternating pages, scene pass −0.1 and −0.6 ms in the two calm pairs (one pair drifted 6 ms both ways): not measurable. The lashes' layer off/on in one page: within noise (≤ 0.3 ms either way); their changes are vertex work.
- **Recaptured on sign-off:** all 20 posters (`docs/era-pov/batch-b/posters-batch-b.png`; 1970 and 1981 tall re-shot after a blank first frame), and the shut-1970 stills (wide 3.4 KB, tall 2.4 KB). Hand-off proof (still placed by `posterPlacement`, edge maps at the still's resolution): 1440×900 ×1.00 (0, 0), correlation 0.90 (old still 0.75); 390×844 ×1.00 (0, 0), 0.89 (old 0.81). Sheet: `shut-stills-old-new.png`.
- **Twins:** 93 pass, 0 fail, 1 todo (the medial corner's length, as before).

#### R3 · Iris colour and light
**Status (2026-10-28, batch A):** colour from the layers and the soft limbus built (see "Batch A built"); light through the cornea still to do. Research card (`docs/R3_IRIS_COLOUR_CARD.md`): sources for melanin's spectrum (λ^−3.48), eumelanin share (~14.8 : 1 in dark brown), the layers, iris thickness (~0.37 mm), measured brown-iris CIELAB, and the caustic. Waiting on your reference photos before the visual round.
- **Kubelka–Munk**, evaluated offline for our one iris: high ABL melanin, mostly eumelanin. Baked straight into the albedo as a function of local stroma thickness, so crypt floors and furrows darken physically. No runtime 3D LUT is needed.
- **Light through the cornea:** refracted key direction (keratometric 1.3375), Fresnel transmission, the lid shadow taken where the light enters the cornea, the caustic crescent on the far side.
  - **Your call (2026-10-28), signed off the same day: not fitted to the photos.** Each era's interface is the light: its page's brightness and colour, and what is on it, decide how the eye is lit. Built: the iris and the white take the page's blurred picture as their key's tint (as the skin already did), and the crescent is the page focused through the cornea, upside down. The physical refraction model above is not built. Sheets: `docs/era-pov/r3-light/`. Posters recaptured on sign-off (the shut stills show no iris, unchanged).
- **Era check:** the iris reads dark brown with visible structure under every era's light. The era colours it only as light.
- *Budget:* ±0 (colour is baked).

#### R4 · Pupil
**Status (2026-10-28): signed off;** posters recaptured (`docs/era-pov/r4/posters-r4.png`; the shut stills show no pupil, unchanged). P3 and P4 are traced off Navarro's lens (front 10.2 mm on the pupil's plane, back −6.0, 4 mm thick, n 1.42) to the era's screen, as P1 is: the view ray goes on past the pupil, is mirrored by the lens's front (P3) or, inside it, its back (P4), and leaves through the cornea's two surfaces. CPU twin `twin/purkinje.ts` (4 tests): P1 3.75 mm deep, f 3.9; **P3 upright ×1.98, 10.8 mm deep** (soft: mip 5.5); **P4 inverted ×0.77, 4.3 mm deep** (near the pupil's plane: mip 3.5); each 3.7 % of P1 (Fresnel 0.00093 vs 0.025). Before, both were drawn centred on the pupil, sized by it, at ~3× and ~2× that. They carry the era's page (the page is the light), and stay under P1's page where it covers the pupil: +7–21 levels at most (`docs/era-pov/r4/pupil-before-after.png`). Cost: not measurable (alternating pages, scene pass 14.8 → 15.0 / 14.8 ms in the calm pages; the rest drifted 3–10 ms). WebGL2 (T1) compiles it clean. The ruff's crenations were already in R2's bake; the entrance pupil is R1's (twin/optics.test.ts).
- Keep the irregular outline, fundus, flash and red reflex.
- Add:
  - P3/P4 positions and sizes from the actual lens surfaces (Navarro) instead of constants;
  - the ruff's crenations from R2;
  - an entrance pupil consistent with R1.
- Small: may pair with R3 if you agree.

#### R5 · Sclera and conjunctiva
**Status (2026-10-28, batch A):** the grown network and limbal melanosis built; the micro-relief on the white still to do.
- **Grown vessel network**, seeded, on the CPU (or offline):
  - episcleral vessels 0.06–0.12 mm†, fairly straight toward the limbus;
  - conjunctival vessels 0.02–0.05 mm†, tortuous and branching;
  - loops at the limbus;
  - rasterised into a polar map, deep vessels blurred.
- **Layers:** thin wet conjunctiva over Tenon's over sclera. Deep vessels violet-red and soft, superficial ones bright red and sharp. A micro-relief breaks the screen's reflection on the white.
- **Our person** (verify against references first):
  - a warmer scleral tone;
  - patchy conjunctival melanosis near the limbus;
  - a faint nasal pinguecula as an age option, off by default.
- *Budget:* ≤ 0.6 ms for the sclera.

### Stage C · The frame

#### R6 · Margins and canthi
**Status (2026-10-28, batch A):** the inner corner as one field and the lower margin built (see "Batch A built"); the rest of the margin anatomy, the outer corner and the media's margin samples still to do.
- **Margin anatomy**, across the ring's inner rows:
  - posterior margin on the globe;
  - intermarginal strip;
  - Marx's line;
  - meibomian orifices (~30 upper, ~22 lower†, a few capped);
  - grey line;
  - lash line on a quarter-round anterior edge;
  - lacrimal punctum on a small papilla.
- **Inner corner:**
  - lacus lacrimalis floor;
  - caruncle as part of the conjunctiva surface, not a separate sphere (alignment), with fine hairs and sebaceous dots;
  - plica semilunaris crescent;
  - pockets closed, so no line of sight reaches the room.
- **Outer corner:** acute, with a slight overlap.
- *Done when:*
  - 2× crops of both corners match your reference;
  - no seams;
  - nothing runs out of a corner at the gaze extremes.

#### R7 · Lid and periocular form
- **Upper lid:**
  - the tarsal plate rides over the corneal bulge as the eye turns (the reference can't);
  - crease and fold;
  - **a hood that truly overhangs its crease** (rows turn back over themselves), the reference's main shape gap.
- **Lower lid:**
  - a wedge filled by orbicularis, not a groove;
  - pretarsal roll;
  - lid–cheek junction ~6.5 mm† below the margin;
  - tear trough.
- **Form around:** brow ridge, orbital rim, nasal sidewall, temple, for the framing box.
- **Layout:** row spacing by curvature (a sagitta tolerance) in the vertex stage: more rows where the skin bends, fewer where it's flat.
- *Budget:* with R8, the lids stay ≤ 4 ms (vertex + fragment).

#### R8 · Skin surface
- **One baked relief** (4096² lid area, 2048² far):
  - star furrows from follicles on a jittered 0.6 mm† grid;
  - follicle pits 60–100 µm†;
  - pore dimples;
  - 0.08 mm† secondary cushions;
  - crepe along the margin;
  - crow's feet;
  - tension lines.

  Channels: gradient xy, albedo term, cavity. Read at the footprint's mip, so nothing flickers.
- **Monk 8 pigment (Monk 9 until batch B):**
  - melanin mottling at ~6 and ~1.3 mm†;
  - periorbital pigment in the upper sulcus and under the eye (capped);
  - pinker thin skin toward the margin;
  - few visible veins on dark skin.
- **Shading:**
  - **scale-correct subsurface**: read the relief gradient a mip higher for red, one for green, none for blue, so pores blur in red more than furrows do (the reference's gap);
  - per-vertex screen irradiance;
  - form-following oily GGX on the lid (never clustered: that read as a rash);
  - wet mirror only near the margin.
- **Vellus hair:** tune density and length so it catches the screen's rim light.
- *Budget:* skin from ~6 ms toward ≤ 3.5 ms (bake reads replace per-pixel noise).

#### R9 · Lashes
- Keep rows, clumps, the minimum width and the spring lag.
- Add:
  - curl solved from lift and curl;
  - root bulbs in the margin;
  - taper to fine tips;
  - Kajiya–Kay plus two shifted lobes (white cuticle R, warm TRT);
  - lighter tips.
- Shadows and reflections come in R11.
- *Budget:* ≤ 0.8 ms.

#### R10 · Brow
**Status (2026-10-28): built, waiting on your review.** Measured on your photo 4 (iris = 11.7 mm): your brow's dense band starts ~6 mm over the iris and is ≥ 7 mm deep (the brow sits nearer the lens, so a little less in life), long hairs lying almost flat, layered, a sheen along them, a few strays down over the brow bone. Ours was ~3 mm of short steep strokes, a solid band, a block of uprights at the head. Research: a man's brow ~5.5 cm × up to 1.5 cm, ~200 single hairs at 30–35/cm², exiting almost flat; the head points up for 5–7 mm, the herringbone starts over the iris's edge, the tail runs out (Gupta et al. 2017, J Cutan Aesthet Surg); brow hair grows ~0.15 mm/day for 1–2 months, so 5–9 mm. Built: depth 4.8 → 4.3 mm (your call, ~4.5), hairs 2.6 → 6.2 → 4.8 mm, flatter, curving with the flow, skin between, 5 % strays, tips browning, a gentle two-lobe sheen (R white, TRT warm) lit by the era's page; ×1.5 hairs for the bigger area. First pass washed out at the loader's framing (finer, sparser hairs and a stronger sheen averaged to a grey-blue haze in 1995, 2000, 2009, 2013); fixed by count, width, tips browning only at the end, sheen 0.018 / 0.006. At 1440×900 the brow band now averages as dark as before or darker in every era; its core is 4–9 levels lighter (10th percentile), skin showing between hairs (`docs/era-pov/r10/brows-desktop-b.png`). Cost: the bake runs once at load (1080 hairs at T3); the shader adds a few ALU, no taps. Sheets: `docs/era-pov/r10/brow-a.png`, `brow-b.png`, every era `docs/era-pov/r10/run/`.
Starts after the in-progress brow move-net lands.
- Strand realism: density from head to tail, upright hairs at the head, herringbone body, sparse tail, skin between the hairs.
- Sheen along the hair (never per-hair glints).
- Muscles unchanged.

### Stage D · Light and life

#### R11 · Shadows, occlusion, near reflections
**Status (2026-10-28): all six parts built, not rendered or timed (your call: build the phases, you review live).** Order: (1) lid shadows follow each era's screen, (2) near reflections, (3) lash shadows, (4) contact occlusion with gaze and blink, (5) skin self-shadow, (6) the screen as an area light.
- **Part 1, built:** `ERA_LIGHT.real` (the device's real size and distance, §8.4: 1970 244×183 mm at 600, … 2009 49×74 at 320, 2013 50×89 at 500, 2026 a window 900×1200 at 1500) sets `light.penumbra` (height / distance). `socketShade3d` no longer lays a fixed −66 % band under the upper lid: each lid's edge (upper ~2.4 mm proud with hood and lash roots, lower ~1.6 with its lashes) casts along the key's slope, soft by penumbra × gap. A screen above shades the white under the upper lid (1981, 1991, 2013); a screen below lights the white up to it and casts the lower lid's shadow upward instead (1970, 2000, 2009). Contact occlusion stays whatever the light (−36 % over 4.5 mm under the upper lid, −30 % within 0.8 mm; at −26 % the white lit from below read as a sticker). Sheets: `docs/era-pov/r11/lid-shadow-wide.png` (clean), `eras-desktop.png` (every era through its medium). Tests 98 pass; WebGL2 clean. Closes conflicts #1 and #2.
- **Part 2, near reflections (cornea):** a mirror ray that misses the page is traced to a shell 0.4 mm off the margin's sphere; past the upper or lower margin it shows the lid's skin (lit by the same screen, ×0.55) with the lash line as a darker comb (~4.5 strands/mm, 0–2.5 mm out). It replaces only the dark room round the page, never the page (the page in the cornea is the era's concept). Not yet on the white's mirror.
- **Part 3, lash shadows:** `lashShade` already projected the fringe along the key; now its softness is the device's (spread = h × (0.3·penumbra + 0.04) + 0.25 mm) and the strands stand out as streaks in crisp light (phones) and merge into a haze in soft (the window).
- **Part 4, contact occlusion:** the margins already follow gaze and blink; the contact shade under the upper lid now deepens as the lids close (blink, squint: −36 % → −54 %).
- **Part 5, skin self-shadow:** the skin tile's micro-normal (the sparkle's) shades the furrows facing away from the screen (× 0.78–1.12, firmer under small devices), so the fine texture turns with each era's light.
- **Part 6, area light:** the skin's and the white's wrap grows with the device's size (× 0.8 for a phone → × 1.3 for a window), a softer terminator under a big light.
- **Prerequisite:** batch 2's lights for 1997, 2000, 2003 and 2009 (specified in `ERA_POV_PLAN.md`, not yet in `look.ts`; those four fall back to a generic LCD). Their realism can't be right without their own device.
- **`ERA_LIGHT` gains physical fields.** A real size and distance in mm (for penumbra, irradiance and skin specular) separate from the stylised `size` (for the page in the cornea). Plus a `catchlight` flag per fill (§7 decision 6).
- **Lid shadow driven by the era's light.** Today `socketShade3d` darkens a fixed band under the upper lid (−66 % within 5.6 mm) whatever the light. Instead, project the margins along the key direction: light from below (1970, 2000, 2009) puts the shadow above the lower lid and lights the upper lid's underside; light from above (1981, 2013) shades the top of the iris. Keep the caps (never black).
- **Penumbra** = gap × the device's real angular height, in mm per mm of lid-to-surface gap: 2013 ≈ 0.18 (crisp), 1970 ≈ 0.30, 2003 ≈ 0.53, 2026 ≥ 0.8 (soft). Per era in §8.4.
- **Lash shadow:** per-lash streaks at T3, density at T2/T1.
- **Skin self-shadow:** a horizon map from the R8 relief plus the R7 crease (bent normals).
- **Contact occlusion** (globe in socket, corners, under the crease) that follows gaze and blink.
- **Near reflections:** the lids' skin and a lash comb inside every mirror ray of cornea and sclera, as the reference does. Large realism for almost no cost.
- **The screen as an area light** (polygon irradiance or LTC) for skin and sclera diffuse.
- *Budget:* ≤ 0.6 ms in all.

#### R12 · Tears and meniscus
**Status (2026-10-28): built, not rendered or timed.** The bead (`nodes/meniscus.ts`) was already a concave quadratic strip on the lid mesh's columns, with a lake at the inner corner and the screen mirrored in it. Added: widths from the stage's 0.3 mm at rest, × 1.2 lower (~0.36) and × 0.65 upper (~0.2); a taper to nothing where the margin leaves the globe at the outer corner (s 0.78 → 1); the normal across from the quadratic's own derivative instead of a finite difference; the line brighter when the screen faces into the bead (lower × up to 1.8 with the screen below, upper × up to 1.6 with it above); still glints along the bead (a hash per ~0.06 of the margin, × 0.85–2.25, fixed in place). The live film, break-up and reflex tears are unchanged.
- Keep the live film, break-up and reflex tears.
- Take:
  - a concave meniscus fillet with exact normals (~0.36 mm† lower, thinner upper), tapering where the margin leaves the globe, wider at the lake;
  - the screen's thin bright line in it;
  - wet glints along the margin.

#### R13 · Motion and life
**Status (2026-10-28): built, not rendered or timed.** Added in `rig/motion.ts`: 15 % of natural blinks stop at 0.5–0.9 (a double's second and every stage-asked blink stay whole); every opening ends in a creep, the last tenth over 0.4 s (`blinkCurve(t, depth)`, joined without a step). In `rig/pupil.ts`: latency 0.23 s (was 0.22); speed caps 4.2 mm/s constricting and 1.1 mm/s dilating on top of the rates; a fifth hippus sine (0.04 mm at 0.53 Hz). Already in place: fixation drift as a mean-reverting random walk with √dt noise and a pull to the point (`rig/gaze.ts`); skin texture read at each point's rest position, so a blink stretches the skin without the texture sliding.
- Keep the era gaze scripts, Bell's, the wobble and the calm caps.
- Take:
  - 15 % partial blinks stopping at 0.5–0.9†;
  - the late opening creep (the last tenth over to 0.5 s†);
  - OU fixation drift inside the calm caps;
  - pupil latency 0.23 s† and speed caps (4.2 mm/s constrict, 1.1 dilate†);
  - hippus over five slow sines.
- The skin stretches over the globe in a blink without its texture sliding.

### Stage E · Ship

#### R14 · Lens, antialiasing, post
**Status (2026-10-28): built, then softened back.** The user saw the eye go blurry: FXAA is off on every tier (the code path stays, `tier.fxaa`), and the fine near blur is removed. As first built: FXAA (three's `FXAANode`) on the tonemapped frame, before the display stage's grain, so grain and the media's dither stay fixed (tier `fxaa`: T2 and T3; T1 off). The depth of field gained a fine full-res near blur: a 4-tap cross under ~2.5 px for things a little in front of the focal plane (lashes, margins), where the half-res gather would turn edges blocky. Already so: the DOF is half-res and 9-tap separable (no tile pass needed at that cost); the lens's display stage and grain run in one pass. Left out: the optional idle refine (it risks the image visibly sharpening at rest, against the calm rule).
- **DOF:** tile max-CoC early-outs, and a full-res near blur for lashes and margins.
- **Antialiasing:**
  - FXAA in linear light after the tonemap, for lash and iris speckle;
  - an optional **idle refine**: at rest only, jittered temporal accumulation over the eye, reset on any motion. Conditions:
    - it runs before the lens and the medium, so the grain and dither stay fixed;
    - it resets on any blink, saccade, cut or era change;
    - it converges within 4 frames, so it never reads as the image sharpening at rest (the calm rule);
    - kept only if a 1:1 diff at rest shows nothing but edge antialiasing.
- **Final pass:** the lens display stage and grain merged into one pass.
- *Budget:* post ≤ 2.5 ms.

#### R15 · Performance and device matrix
- **Front-to-back draw:** lashes, lids, eyeball, room. The depth test then skips the cornea and iris optics under the lids.
- **Eyeball mesh:** check its tessellation against 2×2 quad overshading.
- **Watchdog:** 0.5 s windows that drop the slowest fifth; four slow windows step down; try up with backoff.
- **Experiment:** half-res far skin, where DOF blurs it anyway. Kept only if the wet glints survive.
- **Medium-aware detail floor** (§8.3): each era's medium declares the smallest feature it can show (`ERA_MEDIUM.floorPx`).
  - The scene folds it into the micro-detail footprint, so pores and fine vessels fade before they can speckle 1981's ink or alias 1970's rows.
  - It skips their evaluation with a uniform `If` where they've faded to nothing.
  - One graph; the floor is data.
- **The budget is set by the worst era** (full detail plus the heaviest medium, likely 2013 or 2026), measured per era.
- **Shader budgets:** keep the WGSL size budgets and the staged async warm-up; offline bakes (if chosen) remove the redo-after-warm-up class of bugs.
- **Device matrix:** 610M, RTX 5070, a real phone over remote debugging, WebGL2.
- *Done when:*
  - T3 ≤ 12 ms on the 610M at 1.47 MP (from ~15);
  - T2 ≤ 8 ms on a phone;
  - T1 ≤ 11 ms;
  - first eye frame no later than today;
  - no SYNC pipeline.

---

## 6. Budgets

GPU ms on the Radeon 610M. R0 replaces the "today" column with measured values.

Measured in R0 (2026-10-28, 1440×900 at DPR 1, headless, every frame drawn). "Today" uses the layer switches where they resolve the cost; the rest comes from the per-era runs.

| Part | Today | Target T3 | Target T2 |
|---|---|---|---|
| Lids, skin, brow | 5.2 | 3.5 | 2.5 |
| Eyeball (sclera, cornea, iris) | ~1.5 (inside the noise) | 2.5 | 1.5 |
| Lashes | < 1 (noise) | 0.8 | 0.5 |
| Tears, meniscus | < 1 (noise) | 0.3 | 0.2 |
| Shadows, AO, near reflections | analytic, in the lids and eyeball | 0.6 | 0.3 |
| Fixed passes (post, screen, tear simulation, targets) | ~15, unresolved; R15 times each pass | 2.5 | 1.5 |
| Era medium | 1–5; 2013 ≈ 9; **2026 ≈ 35** | ≤ 1.5 | ≤ 1 |
| **Frame** | **R0: 22–24 clean; 24–33 with media; 2026 = 57 (single-frame readings). After R15a and R1: 16.6–19.8 clean; 17.9–23.5 with media; 2026 = 27.8 (mean-per-frame readings)** | **≤ 12** | **≤ 8** |

---

## 7. Decisions (settled 2026-10-28)

You took the recommended answer on every one:
1. Bakes are offline: build-time KTX2 for iris, skin and vessels; the tear simulation and the screen stay runtime.
2. The test runner is `node:test` with `tsx`.
3. The order is as listed.
4. References: your eye at six poses, plus macros (still to be supplied).
5. The spectral key is tried on 1995 and 2000 first; 1970 only by A/B.
6. Fill catchlights only for 2003's window, 2009's lamp and 1991's lamp (≤ 35 %).
7. Batch 2's lights and gaze rests land before R11.

The options as they were put:

1. **Bakes: offline assets or runtime GPU?**
   - *Recommended:* offline (build-time) for the parts that never change with one fixed person: iris layers and colour, skin relief, vessels. Shipped as KTX2 with mips, loaded behind the poster, roughly 0.5–1.5 MB.
   - The tear simulation and the screen stay runtime.
   - *Why:* richer generation (true AO, spectral colour) at zero runtime cost, and no "bake skipped during warm-up" bugs. *Against:* download weight, and a build step to keep in sync.
2. **A test runner for the TS twins:** `node:test` with `tsx` as a dev dependency.
3. **Order:** as listed (geometry first), or iris first, since it's the most visible.
4. **References:**
   - your eye at the six poses under one screen;
   - a macro of a dark brown iris;
   - South Indian periocular skin at macro.
5. **The spectral key.** Today the key carries only 30 % of the screen's hue (`mix(1, hue, 0.3)` in `nodes/light.ts`). Under a real green phosphor or a navy page, red tissue (caruncle, margin, vessels) goes dark, which is a strong realism cue in 1970 and 1995.
   - *Recommended:* raise it per era as data (`ERA_LIGHT.spectral`, 0.3 → up to 0.8), tried first on 1995 and 2000;
   - 1970 only by A/B, since it's the signed-off benchmark ("refine, don't redesign").
6. **Fill lights in the cornea.** Physically, every bright fill would reflect.
   - *Recommended:* only the ones the POV cards name: 2003's window and 2009's lamp, plus 1991's lamp as a small disc;
   - each at ≤ 35 % of the page's reflected luminance, so the screen stays the brightest thing (light-optics rule 1);
   - 1981's tube bar and 2013's tabletop stay out (they would sit under the lids anyway).
7. **Batch 2 first.** Land the specified lights and gaze rests for 1997, 2000, 2003 and 2009 before R11:
   - 2000's rest is (0, −0.4) in the spec, (0, 0.05) in code;
   - 2009's is −0.7 in the spec and −1.5 in code (−1.5 hid the iris);
   - 2003's lens still has the `flash` artefact the spec removed.

---

## 8. Era alignment

### 8.1 Audit: does the realism pass fit the deck?

**Yes, at the level of intent.** The deck is one realistic person seen through ten machines; the media repaint *that* eye, so a more real eye improves every era by default. Rules already obeyed:
- one person;
- colour as light, never pigment;
- the whole face at rest;
- calm;
- no words;
- graphs never change;
- shadows never black.

**Where revision 1 conflicted or under-specified**, now fixed in the phases:

| # | Problem | Where | Fix |
|---|---|---|---|
| 1 | The lid shadow on the white is a fixed band under the upper lid, whatever the light. Light from below (1970, 2000, 2009) still shades the top | `socketShade3d` in `nodes/margins.ts` | R11: the shadow is projected along the era's key, with a penumbra from the device's real size |
| 2 | One `ERA_LIGHT.size` does two jobs: the stylised page in the cornea (larger than life, ×0.62) and the light's real size. Used for penumbra, it would make every shadow vaguely soft | `look.ts` | R11: physical size and distance in their own fields |
| 3 | Four eras (1997, 2000, 2003, 2009) have no light of their own yet. 2000's and 2009's gaze rests and 2003's flash differ from their spec | `look.ts` vs `ERA_POV_PLAN.md` | §7 decision 7: batch 2 lands before R11 |
| 4 | The media draw at the geometric iris (`M.irisR` from the 6 mm radius). Refraction (R1) magnifies the visible pupil ~×1.13, so signs would drift off it | `EyeStage.tsx` → `M.irisR`, `M.pupil`, `pupilR` | R1: the media read the apparent iris |
| 5 | A realistic limbus is an ellipse (the sclera overlaps top and bottom). 1995's ring, 2013's segments, 2026's limbus fit, 1981's and 1991's iris regions are circles | `post/era-medium.ts`, `system.ts`, `measured.ts` | R1: `F.Rx/F.Ry`, `limbus()` in the kit |
| 6 | `almond()` is a guessed curve, not the real margins. R6/R7 would widen the gap between where signs clip and where the lids are | `post/medium-kit.ts` | R0/R6/R7: margins sampled from the twin into a uniform array |
| 7 | 2026's crease, brow and under-eye landmarks are fixed offsets in R. They wouldn't follow the real crease (R7) or the brow's muscles (R10) | `post/measured.ts` | R7/R10: feed the real points |
| 8 | Revision 1's conic cornea would have shrunk the page, breaking the "~60 % of the iris" rule and 1981's cap | R1 | R1: optics bend the page; data sizes it |
| 9 | Micro-detail (pores, fine vessels) below a medium's cell turns into noise: speckle in 1981's ink rule, crawl in 1970's rows | all quantising media | R8/R15: the medium-aware detail floor |
| 10 | Revision 1's "idle refine" could read as the image sharpening at rest, which breaks the calm rule | R14 | R14: converge in ≤ 4 frames, pre-medium, reset on any motion |
| 11 | Revision 1 didn't name that the shut eye is on screen in every cut (≈100–250 ms each). Closed-lid realism is seen more than any one era | eye-era-cut | C8 below, R7 and R9 |
| 12 | Periorbital pigment (R8) could read as a mask in 1-bit and 4-grey eras | 1981, 1991 | R8: capped, verified in both |

**Status (2026-10-28):**
- **Closed:** #3 (batch 2's lights), #4 and #5 (R1: the apparent pupil, the elliptic limbus).
- **Changed form:** #8 (the conic grew the page a little; see R1's drift log).
- **Closed by R11 part 1 (2026-10-28):** #1 and #2.
- **Still open with their phases:** #6 (R6), #7 (R7/R10), #9 (R8/R15), #10 (R14), #11 (R7), #12 (R8).

### 8.2 The alignment contract (every phase, every era)

- **C1 · What may differ per era.** Only the era's light (direction, real size, spectrum, fills), the physiology that light and task cause (pupil, squint, blink rate and tear state, gaze posture, the near reflex), the lens and the medium. Anatomy, pigment and identity never differ.
  *Why:* "one person in every era"; realism per era means the same person under that era's conditions.
- **C2 · Two sizes for a screen.** The stylised `size` places the page in the cornea; the physical size and distance light the face (penumbra, irradiance, skin specular).
- **C3 · Shadows follow the key.** Lid, lash and crease shadows are projected along the era's key with its penumbra. Every cap stays (corner pockets ≤ ×0.72, crease ≤ 0.4, socket ≥ 0.5).
- **C4 · The media read the eye you see.** The media's uniforms come from the same sources the scene draws with:
  - apparent iris and pupil;
  - elliptic limbus;
  - margins sampled from the twin;
  - the real crease and brow nodes.

  *Why:* signs, fits and underlines drifting off their features read as a sticker.
- **C5 · Detail floor.** Each medium declares the smallest feature it can show. Scene micro-detail fades to it and skips its cost when faded (uniform `If`).
- **C6 · Depth contract unchanged.** Alpha = depth, 0.5 at focus, ±20 mm. Any change to the cornea (R1) or lid form (R7) is re-checked in 2013's elevation and 2026's gimbal.
- **C7 · Judge in the era's terms.**
  - B&W eras (1970, 1981, 1991, 2026) are judged on luminance structure alone.
  - Colour eras (1995, 1997, 2000, 2003, 2009) are judged on hue too.
  - 2013 is judged on how tone lands on its ramp and its dial.
- **C8 · The shut eye is a scene.** Every cut shows closed lids in both eras' media. The closed lid's realism (skin over the corneal bulge, the lash lines meeting) is a first-class target.
- **C9 · No new motion at rest.** Realism adds only physiology the calm rules already allow. Every micro term is footprint-filtered, so nothing shimmers.
- **C10 · The cornea's brightness order.** The page is brightest. Fills reflect only per §7 decision 6, at ≤ 35 %. The lids and lashes reflect dark.
- **C11 · Era realism is data.** New per-era values extend `ERA_LIGHT`, `ERA_LENS`, `ERA_GAZE` and `ERA_MEDIUM`. Nothing branches on the era except the existing uniform switch.
- **C12 · Re-capture after sign-off.** A phase that changes 1970 re-captures the opening's shut stills. Any phase re-captures the posters. The tube's wiring is aligned in mm to the eye, so it is re-checked after R1, R7 and R10.

### 8.3 What each medium can show (detail floor)

At 1440×900, 1 mm ≈ 41 px (`kc` 1). On a 390×844 phone, ≈ 18 px (`kc` ≈ 0.45).

Feature sizes in px (desktop / phone):
- pore 2–4 / 1–2;
- conjunctival vessel 1–2 / < 1;
- episcleral vessel 2.5–5 / 1–2;
- iris fibre spacing ~5 / ~2;
- crypt 12–40 / 5–18;
- lash 2.7–5 / 1.2–2.3;
- meibomian orifice 2–4 / 1–2;
- brow hair 2.5–4 / 1–1.7.

| Era | Medium cell | Floor (≈ 2 cells) | Survives at rest (desktop) | Lost |
|---|---|---|---|---|
| 1970 | rows 3.46 px | 7 px vertical | crypts, collarette, lash clumps, lid folds, brow groups, the page | pores, fine vessels, fibres, orifices |
| 1981 | 3.4 px, 1-bit + ink rule | 7 px; edges as 1-cell strokes | lash line, crease, limbus, brow hairs, pupil, crypt edges as ink | pores (must not speckle), vessels, fibres |
| 1991 | 2 px, 4 greys | 4 px | fibres, episcleral vessels, lashes, brow hairs; orifices at the edge | pores, fine vessels |
| 1995 | 3 px, 216 colours | 6 px | crypts, lashes, the wet white's reflection under the shadow mask | fibres, pores, fine vessels |
| 1997 | luma 2 / chroma 4 px; JPEG 16 px in darks | 4 px luma, 8 px colour | fibres in the lit iris, vessels; smooth form bands into contours | the dark iris, lash line and brow go blocky by design |
| 2000 | 3 px LCD, 6-bit | 6 px | crypts, lashes, form | pores, fibres |
| 2003 | none (grade) | ~1–2 px | everything: the colour showcase | — |
| 2009 | none, softened, noise in darks | ~2–3 px | everything, soft | the finest lines in the darks |
| 2013 | parts (atom ≈ 12×6 px), relit per pixel | parts; detail as relight | pores, hairs and folds as each part's shading; fibre tone sets the dial's sliders | literal texture (it's components) |
| 2026 | full-res plate, unsharp | 1 px | everything, as luminance | colour |

### 8.4 Each era's light, physically

Real sizes come from the POV plan's devices. "Penumbra" is mm of soft edge per mm of gap between the occluder (lid, lash, crease) and the surface it shades.

| Era | Device, distance, place | Real size (w×h) | Penumbra | Spectrum | Fill | Pupil (expected → R0 measured, mm) | Gaze rest, lid posture |
|---|---|---|---|---|---|---|---|
| 1970 | 12" mono CRT, 60 cm, slightly below | 23°×17° | 0.30 | narrow green phosphor | none (dark room) | large → 4.55 | reading, slightly down |
| 1981 | 17" white bitmap, 55 cm, up-left | 35°×27° | 0.46 | cool white | overhead tube bar | small–medium → 3.42 | short scatter hops |
| 1991 | 17" grey CRT, 60 cm, slightly up-left | 32°×24° | 0.43 | neutral white | warm lamp, low left, ≈17° | small (~2.4 mm) → 2.96 | reading, slightly up |
| 1995 | 14" CRT, 55 cm, centred, low | 28°×22° | 0.38 | navy and neon (blue-heavy, dim) | none (night) | large → 4.28 | wide scatter, frequent saccades |
| 1997 | 17" Trinitron, 60 cm, up-left | 32°×24° | 0.43 | warm (cream, burgundy, gold) | office bar above | medium → 4.48 | two targets, lateral |
| 2000 | 14" TN, 50 cm, below | 31°×24° | 0.42 | cold CCFL | none (night) | medium–small → 3.01 | locked, looking down (spec) |
| 2003 | 17" LCD, 50 cm, eye level | 38°×30° | 0.53 | blue page + daylight | window, right | small–medium → 2.70 | idle, slightly down |
| 2009 | 3.5" phone, 32 cm, low | 9°×13° | 0.23 | cool white | warm lamp, up-left | small (near reflex) → 2.69 | looking down, lids lowered |
| 2013 | 4" phone, 50 cm, held high | 6°×10° | 0.18 | cool white | white tabletop below | small → 2.74 | looking up into the lens |
| 2026 | a window | ≥ 45° | ≥ 0.8 | daylight | warm white, left | small → 3.13 | eye contact |

### 8.5 Which phases matter in which era

● defining, ◐ visible, ○ mostly lost to the medium (still built: the poster, the cut and the next era show it).

| Phase | 1970 | 1981 | 1991 | 1995 | 1997 | 2000 | 2003 | 2009 | 2013 | 2026 |
|---|---|---|---|---|---|---|---|---|---|---|
| R1 cornea, limbus | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| R2 iris relief | ◐ | ◐ | ● | ◐ | ◐ | ◐ | ● | ◐ | ● | ● |
| R3 iris colour (luminance structure is ● everywhere) | ○ | ○ | ○ | ◐ | ● | ◐ | ● | ● | ○ | ○ |
| R4 pupil | ● | ◐ | ○ | ● | ◐ | ◐ | ◐ | ◐ | ◐ | ● |
| R5 sclera | ◐ | ◐ | ◐ | ● | ◐ | ◐ | ● | ● | ◐ | ● |
| R6 margins, canthi | ◐ | ◐ | ● | ◐ | ◐ | ◐ | ● | ● | ◐ | ● |
| R7 lid form | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| R8 skin micro (macro pigment is ● everywhere) | ○ | ○ | ○ | ○ | ◐ | ○ | ● | ◐ | ● | ● |
| R9 lashes | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| R10 brow | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| R11 shadows, reflections | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| R12 tears | ● | ◐ | ● | ◐ | ◐ | ● | ● | ● | ◐ | ● |
| R13 motion | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| R14 lens, AA | ○ | ○ | ○ | ○ | ○ | ◐ | ● | ● | ◐ | ● |

### 8.6 The most realistic version of each era (cards)

Each card is the brief for that era in every phase: what the device does to this one person, what the medium keeps, what to get right first, and what can go wrong.

#### 1970 · green phosphor terminal, night (the benchmark: refine, never redesign)
- **Light:**
  - from below, a narrow green band, no fill, a dark room;
  - the upper lid casts little on the white;
  - the lower lid's margin shades a thin band above itself;
  - the hood's underside and the under-brow catch light;
  - the lashes throw their shadows up onto the lid.
- **Spectrum:** under green, haemoglobin red (caruncle, margin, vessels) reads darker than under white (§7 decision 5, by A/B only).
- **Body:**
  - a large pupil, so the iris is a narrower ring with its fibres bunched (R2's dilation shows most here);
  - reading gaze slightly down;
  - a blink every ~5.5 s, so the tear film sometimes breaks up and dims the page.
- **Cornea:** the green page alone, with the lash comb and the lid edge silhouetted dark against it. This is the deck's strongest near-reflection cue (R11).
- **The medium keeps:** crypts, the collarette, lash clumps, lid folds, brow groups, the page. Rows lose the rest.
- **First:** R7 (the shut lids carry the raster collapse), R2 macro relief, R9 silhouettes, R11, R4 pupil depth.
- **Risk:** any change at rest must pixel-diff against the signed-off look with the cursor masked. The opening's shut stills are re-captured after it.

#### 1981 · Xerox Star, paper-white bitmap, office tubes
- **Light:**
  - from above-left, cool white, large and soft (0.46);
  - a tube bar overhead;
  - shadows fall downward: under the brow, the crease, the upper lid's and lashes' shadows across the top of the iris.
- **Body:** a small–medium pupil; short scatter hops (~3.5°) with 900 ms fixations; blinks every ~3.6 s.
- **Cornea:** the page, capped at ×0.68 paper by the medium.
- **The medium keeps:** what the ink rule turns into strokes (lash line, crease, limbus, brow hairs, pupil, crypt edges).
- **First:**
  - R7's crease as a dark line with a lit edge, exactly the ink-and-paper pair;
  - R9's lash rhythm;
  - R10's hairs;
  - R1's limbus ring.
- **Risk:** pores and micro-relief must fade to the floor before the ink rule sees them (speckle). Periorbital pigment must not ink into a mask.

#### 1991 · NeXT, the first web page, office and a desk lamp
- **Light:**
  - a neutral grey CRT slightly up-left;
  - a warm lamp low on the left (≈17°), so the face is split-lit;
  - the crease and brow ridge throw shadows sideways; one cheek lit, one dark.
- **Body:**
  - a white page, so the smallest pupil and the most iris (fibres survive the 2 px cells);
  - reading slightly up;
  - a blink every ~6 s, so the film breaks up.
- **Cornea:** the page, plus the lamp as a small warm disc near the limbus on the lamp's side (≤ 35 %, decision 6).
- **The medium keeps:** fibres, episcleral vessels, lash strands, brow hairs.
- **First:** R2, R7's orbital form under side light, R11's two lights, R6's lower wet rim, R9.
- **Kit:** the link underline sits on the lower rim from the real lid angles, so R6 and R7 feed it through the margin twin.

#### 1995 · GeoCities, a home CRT at night
- **Light:** centred and low, dim, blue-heavy navy and neon, no fill.
- **Spectrum:** melanin and blood absorb blue, so the skin goes very dark and the white bluish. `develop()` lifts it.
- **Body:** a large pupil; wide scatter (~7°), so saccades and gaze-evoked blinks are frequent (one every ~3 s).
- **Cornea:** the page alone.
- **The medium keeps:** crypts, lashes, the wet white under the shadow mask.
- **First:**
  - R5's wet sclera (the mask lives on it);
  - R11's page on the white;
  - R2's macro relief, so the dark iris dithers between at least two web-safe browns rather than one flat brown;
  - R4's large pupil;
  - R6's caruncle.
- **Risk:** saturation ×1.35 turns the caruncle and vessels neon. Keep them rose-brown and violet-red at the source.

#### 1997 · corporate web, an office Trinitron (its light lands in batch 2)
- **Light:** up-left, warm page (cream, burgundy, gold), an office bar above.
- **Body:** a medium pupil; two targets (nav ↔ content), lateral saccades.
- **The medium keeps:** luma at 2 px, colour at 4 px. 16 px JPEG blocks eat the darks (the iris, lash line and brow) by design. Smooth skin gradients band into contours.
- **First:** R7 and R8's large, smooth form, which makes convincing banding; R3's iris hue (4:2:0 bleeds it a pixel onto the white); R5.

#### 2000 · the search box, a TN laptop at night (its light lands in batch 2)
- **Light:**
  - from below, stronger than 1970, a cold CCFL warming on arrival;
  - the hood's underside and the waterline catch light;
  - the lashes shade the lid above them;
  - the lower lid shades the white above it.
- **Body:**
  - a white page in a dark room, so a medium–small pupil;
  - locked on the box, looking down (spec rest (0, −0.4));
  - the longest stares (~6.5 s), so the tear film's break-up dims the page here more than anywhere: R12's showcase.
- **The medium keeps:** crypts, lashes, form, at 3 px cells with subpixel stripes. The viewing angle inverts the darks at extremes.
- **First:** R11 under-light, R12, R7 down-gaze posture, R4.

#### 2003 · Web 2.0, an iSight on an LCD, daylight (its light lands in batch 2)
- **Light:** eye level, the softest screen (0.53), a blue Aqua page, window daylight from the right.
- **Body:** a small–medium pupil; idle, slightly down (looking at the video just below the lens).
- **Cornea:** the page, plus the window's rectangle on the right, dimmer than the page (the deck's first window catchlight).
- **The medium keeps everything:** pores, fine vessels, orifices, fibres, lash sheen. This is the full-colour realism showcase.
- **First:** every phase, especially:
  - R3 (saturation ×1.3 must not turn the brown iris rust);
  - R5 (vessels, not neon);
  - R8 (Monk 8 pigment);
  - R6;
  - R9's two-lobe sheen.
- **Decide:** the built lens still has `flash`. The red reflex (R4) belongs to a flash era; the spec removed it (decision 7).

#### 2009 · an iPhone 3GS held low, a lamp-lit room (its light lands in batch 2)
- **Light:** a small, close phone from below (0.23, crisp), cool white; a warm lamp disc up-left.
- **Body:**
  - near work at 32 cm, so the near reflex (pupil constricts) and a slight inward turn;
  - looking down, lids lowered (spec rest −0.7; −1.5 hid the iris);
  - scrolling gaze.
- **The lids and the lashes:**
  - crisp lash shadows thrown up onto the lid;
  - a bright lower meniscus line lit from below (R12);
  - the upper lid draped over the cornea's bulge, which slides under it as the eye moves (R7).
- **Cornea:** a small upright phone and a round lamp catchlight.
- **The medium keeps:** everything, softened (sharpen −0.35, aperture 1.2), with sensor noise in the darks.
- **First:** R7, R11, R12, R13's near reflex, R4.

#### 2013 · iOS 7, a selfie, bright and diffuse
- **Light:** the smallest source in the deck, held high (0.18, crispest shadows), cool white; a white tabletop bouncing from below.
- **Body:**
  - a small pupil (a bigger dial);
  - looking up into the lens, then the screen;
  - the upper lid lifts, the hood stretches, the brow rises (0.6 × gaze up).
- **The medium:** components.
  - The dial's sliders take the fibres' tone, so R2's radial fibre-against-depth contrast becomes the dial's structure.
  - The keyboard is sized by the pupil.
  - Every part is relit by the pixel's relief, so pores, hairs and folds carry through.
- **First:** R2's radial contrast, R8 at pixel level, R7 and R10 up-gaze posture, R11's crisp top shadows.
- **Risk:** R1 and R7 change depth, so re-check 2013's elevation. Keep the dial's 50 % ink mix so the page doesn't wash it.

#### 2026 · the pupil looks back, window daylight
- **Light:** a window, the largest source (≥ 0.8, soft open shadows); warm white from the left.
- **Body:**
  - a small pupil;
  - eye contact, following the visitor;
  - when it looks straight at you, the reflex sits slightly nasal of the pupil's centre (angle κ): the Hirschberg cue.
- **The medium:** a full-res B&W plate under instruments that measure this eye.
  - The limbus fit becomes an ellipse (R1).
  - The crease, brow and under-eye landmarks come from the real crease (R7) and the brow's nodes (R10).
  - Partial blinks (R13) are real tracker dropouts, which is meaningful.
- **First:** R1, R2, R8, R6, R5 (as luminance), R13, R14's aperture 0.8.
- **Risk:** pigment patches near the limbus (R5) flip the instruments' ink from white to dark. Check the limbus ticks.

### 8.7 Per phase: the eras it moves and the media it must re-check

| Phase | Changes most | Re-check in the media | New per-era data |
|---|---|---|---|
| R0 | — | all ten (baseline) | pupil mm, gaze rest, page share per era |
| R1 | all | 1981 page cap and XOR disc; 1991 iris invert; 1995 link ring; 2013 limbus segments and dial clip; 2026 limbus and pupil fits; 1970 cursor and 2000 caret on the pupil | kit `F.Rx`, `F.Ry`, `limbus()`; apparent `pc`, `R`, `pupilR` |
| R2 | 1991, 2003, 2013, 2026 | 2013 dial; 1997 JPEG darks; 1981 ink rule | — |
| R3 | 1995, 1997, 2003, 2009 | 1995 palette; 1997 chroma; 2003 saturation; 2009 fade | `spectral` (decision 5) |
| R4 | 1970, 1995, 2026 | 1970 cursor, 2000 caret, 2013 keyboard, 2026 pupil fit; 2003 flash | — |
| R5 | 1995, 2003, 2009, 2026 | 1995 shadow mask; 2026 ink flip near the limbus | — |
| R6 | 1991, 2003, 2009, 2026 | 1991 underline; 2026 canthi; `almond()` | margin samples |
| R7 | all, and every cut | `almond()`; 2013 elevation; 1997 banding; 2026 crease landmark; the tube's lid wiring | margin samples, crease point |
| R8 | 2003, 2013, 2026 | 1981 speckle; 1981/1991 pigment mask; 2013 relight | `ERA_MEDIUM.floorPx` |
| R9 | all | 1970 rows; 1981 strokes | — |
| R10 | all | 2026 brow landmarks; framing box; the tube's brow wiring | brow node points |
| R11 | all (needs batch 2) | every era's light | `ERA_LIGHT` real size and distance, `spectral`, fill `catchlight` |
| R12 | 1970, 1991, 2000, 2009 | 2026 plate | — |
| R13 | all | 2026 tracker dropouts | — |
| R14 | 2003, 2009, 2026 | grain and medium order | `ERA_LENS.aperture` |
| R15 | all | every era's cost | `floorPx` used for LOD |

---

## 9. Skills: where each phase's knowledge lives

Each owning skill has a **Realism pass** section with its phases, a decision procedure for tuning that part for one era, and a reference file of per-era values. The hub holds the shared contract and cards.

| Phase | Owning skill | Reference added |
|---|---|---|
| shared (contract, floors, light table, cards) | `eye-loader-system` | `references/era-realism.md` |
| R0, every phase's proof | `eye-verification` | (section) |
| R1 cornea, R11, R12, R14 | `eye-light-optics` | `references/realism-light.md` |
| R1 limbus, R2, R3, R4 | `eye-iris-pupil` | `references/realism-iris.md` |
| R5–R10 | `eye-anatomy` | `references/realism-anatomy.md` |
| R13 | `eye-motion` | (section) |
| how every phase reads through the ten media | `eye-era-media` | `references/realism-through-media.md` |
| the shut eye in cuts (C8) | `eye-era-cut` | (section) |
| signs on the apparent pupil (C4) | `eye-interaction` | (section) |
| shut stills and wiring (C12) | `eye-opening` | (section) |
| R15, detail floor, budgets | `eye-tsl-craft` | (section) |
| realism is not a new concept | `eye-ideation` | (section) |

---

## 10. Licence and sources

The reference repository has no licence file (GitHub reports none), so its code is all rights reserved. **Learn its techniques; don't copy its code, shaders or reference images.** Reimplement from the published sources it builds on:
- Pamplona et al. 2009 (pupil and iris deformation);
- Watson & Yellott 2012 (pupil size);
- Donner & Jensen 2006 (melanin absorption);
- Prahl (haemoglobin);
- Edwards et al. 2016 and Larsson (iris features);
- Quigley 2009 (iris volume);
- Keinert et al. 2014 (sphere tracing);
- Bavoil 2008 (horizon-based AO);
- Kajiya & Kay 1989, Marschner et al. 2003 (hair);
- Heitz et al. 2016 (LTC area lights);
- Navarro 1985 (schematic eye);
- Kwon 2013, Argilés 2015, Borges 2010, Evinger 1994, Collewijn 1985 (blinks).

---

## 11. Drift log

| What | Spec | Built | Why |
|---|---|---|---|
| R6 caruncle | part of the conjunctiva surface, with fine hairs and sebaceous dots | a field (`canthus.ts`) drawn over the white and the socket through one plane; sebaceous dots; no hairs; the caruncle mesh is gone | the mesh's see-through edge drew the outline; hairs would be sub-pixel at the loader's framing |
| R6 margin anatomy | Marx's line, ~22 placed meibomian orifices, grey line, punctum | junction, strip, punctum; no Marx's line or orifices | the strip is ~0.44 mm deep across the image: a 0.08 mm orifice is sub-pixel and would shimmer |
| R6 lower face | `rimShow` 0.5 (the anatomy skill: thin rim) | 1.0 mid-lid → 0.55 at the corners | the user's photo shows a wide wet tan rim; at 0.5 it read as a red line |
| R6 lid on the cornea | (not in the plan; R7's tarsal plate rides the bulge) | the inner face's back edge and the meniscus rest on the cornea (`corneaLift`) | on the globe's sphere the cornea hid the face's last strip: a dark line under the meniscus |
| R5 network | grown on the CPU, rasterised into the polar globe map | grown on the CPU, drawn with Canvas 2D into its own azimuthal map of the front hemisphere (2048², T1 1024²) | the equirectangular map wastes most texels on the back of the globe; Canvas 2D gives widths and tapers for free |
| R5 white's light | (unchanged) | the cornea's relief on the white −34 % → −16 %; the lower lid's shadow on it −26/−30 % → −14/−12 % | a grey band under the iris and a dark line over the rim, neither in the user's photo |
| R3 colour | K–M evaluated offline into a LUT of thickness → colour | K–M evaluated in the bake's colour pass, per texel, from the layers it already has | same result, no LUT; the bake runs once per person |
| R3 hue | melanin only (λ^−3.48) | plus the stroma's blood (oxy-Hb) | melanin alone gives hue ~70° (olive); measured brown irides are 45–55°; with blood ~62° |
| R3 sheen | (R2: 0.1) | 0.035, crests only | pale radial lines through the page's reflection; the user's iris shows none |
| R5 filtering | (not specified) | the vessel map trilinear, no anisotropy | 4× anisotropic cost ~2 ms a frame on the 610M; no visible loss at the loader's framing |
| R6 canthi | the eye-anatomy rule: inner corner rounded (lake ~2 mm), "a little lower" (0.075 rad) | both canthi under the globe's centre (3 and 1.9 mm), nasal lids fitted to the user's eye, lake ~0.9 mm | the user's photos: a low, tight inner corner; the blunt one read as "too big" |
| R6 media margins | `almond()` from sampled margin curves (C4) | `almond()` keeps its curve but meets the real canthi (`apC`) at their real reach | the corners were 2–3 mm off after the canthi moved; full sampling stays with R6/R7 |
| R6 sparkle | (R8: a baked relief, follicles and star furrows) | a first micro-relief in the skin's tile (crossing furrows, pores) driving the sparkle | the user asked for a real skin feel on the lower lid now; R8 deepens the relief |
| R11 lid shadow | project the margin curves along the key | a 1-D cast below/above each margin by the key's slope × the lid's height (upper 2.4 mm, lower 1.6), soft by penumbra × gap, plus contact occlusion | the margins' angles already give the distance under each lid; a full projection waits for the hood's overhang geometry (R7) |
| R10 brow depth | strand realism only | depth 3.2/2.7 → 4.8/4.3 → 4.4/3.9 mm; no strays | the user chose ~4.5 mm after their photo measured ≥ 7, then asked for it very slightly narrower and the extra hair gone |
| R11 near reflections | lids and a lash comb in every mirror ray of cornea and white | cornea only, and only where the ray misses the page | the page in the cornea is each era's concept; the white's mirror is a later step |
| R11 horizon map | a horizon map from the relief plus bent normals | the micro-normal's turn against the macro one, ×0.78–1.12 | one more read of a tile the sparkle already reads; no new bake |
| R11 area light | polygon irradiance or LTC | the wrap term scaled by the device's real size | cheap, and reads the same way at the loader's framing |
| Eye contact and visible shade (the user, 2026-10-29: "I'm not seeing any difference") | era gaze scripts at rest (1970 reading put the pupil 61 % down the screen); the last shade pass too weak to read | every era rests in eye contact, centred (pupil 50.7 % / 49.7 % down, measured in the loader); under-brow −38 % (+0.3 with the screen above), the roll +12 %, brow ridge 3.8 mm, under-eye −42 % over 3–11 mm, lower-lid lines ×2.2 and crêpe −16 % | verified with screenshots, a signed change map and a before/after close-up |
| Shade and lines round the eye (the user, 2026-10-29, with their photo) | lower-lid lines −22 %; under-brow shade 0.1 (+0.35 with the screen above); skin wrap ×0.8–1.3; under-eye −20 %; the lids' contact shade on the eye −36 % / −30 % above, −10 % / −12 % below | lower-lid lines ×1.4 plus a finer crêpe (0.34 mm, −10 %); under-brow 0.22 (+0.3), wider, and the brow's roll lit along its top (+6 %); wrap ×0.62–1.05; under-eye −30 % over 3–7.5 mm and the groove below; contact −46 % (5 mm) / −40 % (1.1 mm) above, −15 % / −15 % below | mild wrinkles under the eye; the brow applied over a flat face with no shade under it; no shade under the eye; no lid shade on the eye |
| Oil and the inner corner (the user, 2026-10-29) | skin sheen only near the eye; at the inner corner the lids' shading split along the bisector, the lower roll ran into the corner, pocket −22 % | screen-time oil on the face's high points (brow ridge, nose side, cheek top), relief-broken, in the page's light; the lids' shading blended toward each corner, the roll fades before the inner corner, pocket −10 % | the face lacked the greasy sheen of hours at a screen; the corner's joint read as broken |
| Bone round the eye (the user, 2026-10-29) | brow ridge 1.6 mm, broad; cheek 1.2; brow 1450 hairs at × 0.97 over the skin; lashes 8 / 5.6 | brow ridge 3 mm, firmer (σ 2.7) + 0.8 over the forehead; a cheekbone rim 1.4 mm below-outside; brow 1240 hairs at × 0.9; lashes 6.9 / 4.8 | the brow read as stuck on, the face flat with only the eye's bulge for depth; the lashes read too tall |
| Pending list (the user, 2026-10-29) | — | lashes 8 / 5.6 mm with visible tips and anomalies (crossers, kinks, long ones, a droop); lash shadow ×1.3 / cap 0.8; brow hair shadow 0.4 mm off the skin, brow-ridge shadow by the key, the orbit's nasal hollow; hood fuller (×1.05), crease shade ≤ 0.45; the lids and lash comb in the white's mirror (R11 part 2 completed) | the user listed lash shadow, lid shape, brow shadow, skin depth, and lashes that all looked alike |
| The upper lid's ceiling (the user, 2026-10-29, the third ask) | the upper lid rides up with the eye (0.88), the lower 0.22: the opening grew ~12 % (twin) to ~25 % (live, with the squint easing) looking up | the upward ride saturates at 0.07 rad (~0.9 mm, `upperRide`), the lower lid rises 0.3: opening 10.65 mm at rest, 10.91 full up, 8.38 full down (twin) | a real lid stops at the end of the levator's pull and the iris slides under it |
| Gaze range and the lower lid (the user, 2026-10-28) | pitch ±10° straight from the cursor; the lower margin's face shown whole (1.1 mm), lit flat; a faint lower lash line (0.5) | up a soft stop at ~8.5°, down to 16° (`gazePitchUnits`), the upper lid following so the eye half closes; the lower face ~half shown (foreshortened), rounded in shade; a defined lash line (0.78) and its shadow below | looking up went too far, down not far enough and the lids stayed open; the lower lid read as concrete |
| Lash and brow density (the user, 2026-10-28, with two photos) | T3 lashes 180/100 at 0.07–0.095 / 0.05–0.07 mm, lower tips ×2.6; brow 1080 hairs at 0.06–0.09 | T3 250/150 at 0.09–0.12 / 0.065–0.085, lower tips ×1.6; brow 1450 at 0.07–0.105 (all tiers up in proportion) | their photos show a thick, dense, dark fringe above, many dark curly lashes below, and a thick dark brow |
| Skin micro-relief (the user, 2026-10-28: "change this texture to real skin") | two families of crossing furrows ~0.22 mm apart | a soft tiling cellular net: plateaus ~0.15 mm (0.35 at first read as crocodile scales), a finer net within, shallow furrows, pores at junctions; barely in colour (−1–2.5 %), gentle in the sparkle and self-shadow | crossing line families read as woven cloth on the lower lid; big plates as a crocodile's |
| Skin texture (the user, 2026-10-28: "camouflage", "printed") | mottle ±10 %, R8 cavities −16 %, R11 self-shadow 0.78–1.12 | mottle ±4 %; the 6 mm tile read twice (turned, scaled) and averaged; cavities −5 → −2 %; self-shadow 0.93–1.05 near the eye only | the repeating tile and broad patches read as a printed pattern |
| Up-look ballooning, centring (the user, 2026-10-28) | upper lid 1:1 up, a feeling's raise on top; box −8.5..13 | upper 0.88 up, the raise × (1 − 0.7·up) while looking up; box −11..11.5, the almond centred | hovering over the top opened the eye past any real eye's opening; the eye sat ~60 % down the screen |
| Lids on up-gaze (the user, 2026-10-28) | the upper lid follows pitch at 0.85 (0.7 down), the lower at 0.35; all lid skin rides with the margin; the crease flattens looking up; the margin lifted by the cornea's full bulge | upper 1 / 0.92, lower 0.22 / 0.3 (Leite et al., IOVS); skin past the crease anchored; the crease deepens looking up; the corneal lift capped at 0.55 mm | looking up the lid lagged the iris and covered it, the skin under the brow slid with it, and the margin peaked over the cornea: it read as the lid coming down |
| Framing and fissure (the user, 2026-10-28) | box −10..15, fissure upper 4.4 / lower 5.5 | box −8.5..13 (the eye ~16 % larger on wide screens), fissure 4.8 / 5.8, corners unchanged | the eye looked small with too much skin, against the old full-frame eye; the brow's top now meets the frame |
| R14 FXAA and near blur | FXAA after the tonemap; a fine near blur | both off | the user saw the eye go blurry |
| R14 DOF early-outs | tile max-CoC early-outs | none | the gather is already half-res and 9 taps; a tile pass would cost about what it saves |
| R14 idle refine | optional | not built | the calm rule: an image sharpening at rest reads as motion |
| R4 Purkinje | P3/P4 from Navarro's lens surfaces | traced in 3D off those surfaces to the screen rectangle; the cornea's front as a sphere on the way out | a sphere differs from the conic by hundredths of a mm this near the axis |
| R3 light | refracted key, Fresnel, entry lid shadow, caustic fitted to references | the page's own picture tints the iris and white keys; the crescent carries the page, inverted | the user: the interface lights the eye, the reference photos don't set it |
| The person's tone | Monk 9 (`#3a312a`) | Monk 8 (`#604134`), undertone 0.15 with a new golden end | measured against the white in the user's photos (albedo ~L* 35); the user chose Monk 8 |
| R7 lower lid | a wedge filled by orbicularis; lid–cheek junction ~6.5 mm | the folds and the periorbital darkening re-placed to the photos' bands (roll 0–2.5, dark 3–6.5, cheek from 7); no geometry wedge | the light-only view showed the band was colour, not shape; the wedge stays for a later round |
| R9 width | Asian lashes thicker (Na 2006) | upper 0.07–0.095 mm (was 0.09–0.125) | the thicker roots read as tufts at the loader's framing |
