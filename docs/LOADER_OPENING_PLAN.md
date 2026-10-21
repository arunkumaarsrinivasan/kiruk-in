# Road map: the loader's opening, second design

> Turtle road map. Tier: boulder (signal: visible change is a flow, the first ten seconds of the site). Status: **round 8: performance; the tube opening is live in the loader (not committed)** (2026-10-21).
> Re-read the next unchecked step before each build step. Log every deviation in the drift log.

## Round 8 (current): performance
The user: "its getting laggy most of the time make the performance better".

**What was wrong** (traced by wrapping `GPUDevice.createRenderPipeline` / `createRenderPipelineAsync` in the lab):
- EyeStage's `compileAsync` built every pipeline for the wrong target: the QuadMesh vertexNode, and the scene pass's MRT and render targets differed. At the first real frame, every pipeline was built again, synchronously. A sync build compiles on the GPU process's main thread, so every frame on screen waits, the tube's worker included.
  - The post chain's fragment shader is ~430 KB of WGSL (the ten eras' medium). Its sync build froze the whole browser for **5.8 s**; the scene's batch froze it for another 4 s.
- The eye drew every frame invisibly under the opaque tube (opacity 0), sharing the iGPU with it.
- The resolution watchdog read the rested frame interval as slowness. With the pointer still, the stage draws one frame in three, so dt ≈ 50 ms, and the ratio stepped 1 → 0.85 → 0.72, with a resize stall at each step.
- The 12 s cap was hit in dev (the eye was ready at ~22 s), so the tube faded onto a still poster.

**Fixes:**
- **EyeStage warm-up (WebGPU):** the first frames build every pipeline with `createRenderPipelineAsync` (a wrapper on `backend.createRenderPipeline`). Three skips anything not ready (`Pipelines.isReady`).
  - The first frames are staged: the bakes and the era screen, then the post chain over an empty room, then the lids, then the tears and lashes, then the globe, socket and room. No one frame builds everything.
  - It fades in only when warm: all steps taken, no new pipeline for 0.3 s, and none pending.
  - `compileAsync` is kept for WebGL2 only.
- **`covered` prop:** the loader sets it until the tube lands. The eye draws a frame every 0.1 s (its clock carried), and new pipelines are still built async.
- **Watchdog:** reads the real rAF `delta`, not the rested dt; it is skipped while warming or covered.
- **Cap:** `EYE_WAIT_MS` 12 → 20 s. The formed tube ticks and answers; the poster is a still.
- **Lab:** `?covered=0` gives the old way. The worker's stats now carry `hitches` and `startedAt`, to line up with the page's clock.

**Measured** (same laptop, dev, 1440 × 900, machine ~50% busy with other apps):

| | before | after |
|---|---|---|
| Eye ready | 22 s | 10.9–13 s |
| Whole-screen freezes after the first 4 s | 1.6, 4.3, 5.0 s | none over 170 ms |
| Worst tube hitch overall | 5.0 s | 0.8–0.9 s (the post chain's build step) |
| Main-thread first-frame task | 0.87 s + async chunks | split: ~0.25 / 0.9 / 0.3 / 0.3 s |

**Open:**
- The remaining ~0.9 s step is the ten-era medium shader. Without it (`?media=0`) that step is ~0.25 s and the eye is ready ~2 s sooner. Splitting it per era belongs to the era session (told).
- The live eye costs ~21 ms of GPU per frame at full resolution here (eye lab: 42 fps); the watchdog settles at 0.72.
- Early hitches in the first second also coincide with WebGPU device start-up (`requestAdapter` ~600 ms). Pre-warming it in the boot script did not help (tried, not kept).

## Round 7: improved and put into the loader
The user picked every improvement offered: start at first paint, the CRT optics, chip → cursor, typing at the cursor, measure and trim, and integrate.

**Files.** The earlier attempts are deleted (ink, formation, infection and circuit scenes, `InkOpening`, `TextPreview`, `EraIntro`, `public/mock-intro/`). What is left:
- `components/ui/loader/TubeOpening.tsx`: the component; the worker, or the main-thread fallback.
- `loader/tube/tube-scene.ts`: the WebGL2 shader scene.
- `loader/tube/tube.worker.ts`: the worker, one scene only.
- `loader/tube/circuit-layout.ts`: the routed board.
- `loader/tube/eye-lines.ts`: the eye's traced lines in mm.
- `loader/tube/boot.ts`: the first-paint frame.
- `loader/open-eye.ts`: the waking lids.

**What changed in the scene.**
- **Chip → cursor.** The chip is drawn by the shader (outline and pins). Over the last 0.9 s of the formation it shrinks into 1970's block cursor and blinks. At the hand-off it settles onto the live eye's own cursor (era-medium draws it at 0.4 × 0.72 of the pupil's radius, on the pupil).
- **Typing.** Printable keys type at the cursor ("> …", right-aligned against it, a half-resolution bitmap). Backspace deletes. Enter or Escape skip to the formed eye, which then opens as soon as the eye is ready.
- **CRT optics.**
  - An afterglow behind each current pulse and behind the pointer (its last eight places).
  - Bloom from the still's blurred mip.
  - The wires' glow from the circuit texture's mip: one read, not eight.
  - A bright band rolling down the glass, and a sheen that shifts with the hand.
  - Twelve light levels per dot.
- **Formation.** Lights catch first and darks follow 0.35 s later, so the shape builds.
- **Alive while waiting.** A slow clock ring from the chip every 3.2 s.
- **Reduced motion.** The circuit is simply there (no growing, pulses, band, flicker or ring), the eye fades in, and the lids open at once.

**First paint.** An inline script in `app/layout.tsx` <head> runs on a first visit, outside /desk, /blogism and /studio, and only when the splash loader is enabled. It marks <html>, and one CSS rule paints the dark glass with a glow at the pupil (eyeShot's framing, repeated inline). It also hides the page's scrollbar, which a fixed overlay cannot cover. The tube clears the mark when it starts painting; a failsafe clears it at 9 s. Checked: the frame is there at 100 ms, before the app.

**In the loader** (`immersive-era-loading-page.tsx`):
- The tube replaces EraIntro and the old lids code. The eye is held shut when ready; its pupil is read 350 ms later for the cursor.
- The tube's `open` event opens the lids (`openLids`) and lets travel begin; `onGone` unmounts it. The 12 s cap fades the tube onto the poster.
- A wheel during the opening skips to the formed eye. The tube holds the keyboard until it has gone.
- Enter and Space wait 0.9 s after the eye opens, and 1.5 s after the last typed letter, so typing never goes straight in. A headless test caught exactly that: typing "hello arun" through the hand-off went into the site on the space.
- The open-eye poster (53 KB) is no longer fetched on the first frame, only when the eye is late or the tube has gone.

**Measured** (headless, this laptop's integrated Radeon 610M, dev build, 1440 × 900; ±25% run to run, and other sessions were loading the machine):

| | Tube alone | Tube + the eye compiling |
|---|---|---|
| Frame interval, mean | 13.5–17.1 ms | 22.5 ms (one run 50.8) |
| Frame interval, p95 | 16.9–26.5 ms | 17 ms (one run 422) |
| Worst gap | 130 ms (start) | 385 ms (one run 790) |
| GPU per frame | 2.7–3.0 ms | 3.3 ms |
| Long tasks from the page | 2 at start, ~110 ms, in dev | from the eye's build |

The tube's own frames are steady. The stalls come from the GPU process being busy with the eye's shader compile, which spreads to everything on screen; the fix is in EyeStage (split its compile across frames), which another session owns. GPU time was not measured on the RTX or on a phone.

**Weight.** The two stills are 2.1 KB and 1.5 KB. The tube's source is about 30 KB before minifying, and only the tube is in its worker.

## Round 6 (superseded): wired, then formed pixel by pixel on 1970's tube, then the eye opens
The user's verdict on round 5: "the complexity is still missing, and the smoothness … and the depth of the eye … the display formation of the eye … not linking well with the design of 1970 … formation of eye with each pixel getting formed … and the eye opens up … very high performance and very light weight … the interaction seamless."

**Built (lab only, `/lab/opening`, the default scene): `components/ui/loader/ink/crt-scene.ts`.** It is one WebGL2 fragment shader in the worker (OffscreenCanvas), with a main-thread fallback (lab `?main=1`).
1. The tube warms, and the first beam spot lights the chip at the pupil.
2. Current lays the same routed circuit as round 5 (`layoutCircuit`, now shared): the iris fan, the limbus, the lid and brow bundles, the board out to the edges.
3. From every wire the phosphor pixels catch (a cell grid of 4–8 CSS px). Each cell flashes as the signal reaches it and settles to its share of the picture. The picture is the real eye held shut: a still of the live 1970 eye (`public/eye/posters/1970-shut-{wide,tall}.webp`, 2.1 KB and 1.5 KB, grey, placed by `posterPlacement`), so the eye forms out of the circuit with its depth.
4. The wires recede once the pixels under them have formed (the eye's own wiring almost fully), so the formed eye reads clearly.
5. When the live eye is ready (held shut), the cells split finer and finer and the overlay thins until the live eye is all that is left. It is the same picture, so there is no jump. Then the lids open with the waking curve.
6. The 1970 look: P1 green, round phosphor dots with dark between, scanlines, bloom round the wires, a slight bulge and a vignette on the glass, a faint flicker.
7. Interaction: the hand brings the signal (pixels round the pointer catch now; the arrival texture is re-uploaded, 80 KB), cells flare under it, and a press sends a ring through the glass.

**Cost:** one full-screen pass with 11 texture taps, at most 1.5 device px per CSS px. Three textures: the 2 KB still, the circuit drawn once at CSS px with its laid times, and arrival times at cell resolution. The scene's code is about 22 KB of source. FPS has not been measured on the user's machine.

**Bugs found on the way:** a reversed `smoothstep` (undefined in GLSL; this GPU returned 0, so every dot was masked away), and `0 × exp(+large)` = NaN off the wires, which blacked out every pixel. Both are fixed; lab `?debug=1|2` shows the still, the arrival map and the pixel levels.

**Before shipping:** the worker imports every earlier scene (ink, formation, infection, circuit); cut it to the CRT scene and the shared layout. Delete `public/mock-intro/` and `TextPreview`.

## Round 5 (superseded): the eye is wired up, then the display turns on
The user rejected round 4, which formed the site's 1970 page. "1970 does not mean the actual 1970 content … the interface display like the CRT … show how the display is formed … an animation for the eye." They sent four references: a white PCB layout, green loop traces with ring pads, a face drawn in circuit traces, and an eye with a chip in its pupil. Their words: "the electric line to connection to formation of eye with the interface and show our 1970 eye after loading … it should not look lag or stuck."

**Built (lab only, `/lab/opening`, the default scene): `components/ui/loader/ink/circuit-scene.ts`, drawn in the worker.**
1. A chip sits at the pupil.
2. Traces grow out of its pins, routed as a board is (straight runs, 45° bends, ring pads at the ends): the iris fans out of the pins, a double limbus ring closes, bundles run along the upper and lower lids, a wider bundle arches as the brow, and lash traces end in pads. Every shape on the eye is in mm round the globe, traced off the live eye, so it lands on the real eye.
3. The board spreads from the eye to the screen's edges: walked buses with 45° turns, chips with pins, vias. The layout is the same every time (fixed seed).
4. Current never stops: pulses run along the traces while it waits, the hand draws more current near it, and a press sends a ring of current outward.
5. When the eye is ready: a surge, then the tube powers on. A bright line across the eye's middle opens top and bottom, and inside it is the real 1970 eye (held open, gaze centred). The eye's traces linger on it about 0.7 s, then fade; the chip is only an outline by then, so the pupil (and its own 1970 cursor) shows.

Evidence: growth sheet, the formed board (desktop and phone), and the power-on at 1/8 speed (the limbus ring sits on the real iris's edge, the chip on the pupil). tsc and lint are clean.

## Round 4 (superseded): the interface forms like an infection
The user rejected round 3 ("it does not feel like how I wanted"; it was "some SVG shown like a popup slide"). Their brief: "like an infection that starts from an atom and expands overall … formation of one interface and formation of multiple things … very interactive … this is like formation of interface".

**Built (lab only, `/lab/opening`, the default scene): `components/ui/loader/ink/infection-scene.ts`.**
- The screen is a grid of phosphor cells, the atoms an interface is made of.
- One atom (a nucleus with electrons) pulses where the pupil will be, then spreads cell to cell. The front is ragged, branches into fingers and runs white-hot; it covers the screen in about 3.5 s.
- Behind the front each cell becomes what it is in the site's real 1970 home (`public/eye/screens/1970.webp`, its first screenful at full width; each cell takes the brightest of its 3 × 3 samples). The KIRUK block logo, the research-file header and the records form out of the spreading tissue. The atom stays as the terminal's cursor.
- Interactive: the pointer spreads the infection where it goes, a press sends a new wave (and flares what has formed), and the formed cells flare under the hand.
- Hand-off: when the eye is ready, a second wave runs out from the pupil, the page dissolves cell by cell onto the eye, the lids open as it passes 9 mm, and the cursor hands over to the eye's own. The eye's cornea then reflects the same 1970 page.
- Cost: two tiny images (a pixel per cell) scaled up and masked to round dots; it runs in the worker.

Evidence: growth sheet, formed page, the reveal at 1/8 speed, and the pointer test (a press wave). tsc and lint are clean.

**Open:** pointer input reaches the worker through the main thread, so while the eye builds (stalls up to ~3.6 s in dev on the iGPU) the hand can lag; the growth itself never stalls. The production numbers are unmeasured.

## Round 3 (superseded): the invention of the interface, one dot to 1970
After seeing story A on the real eye, the user said the logo and the drawn eye were "meaningless", asked for text and strokes aligned with the real eye (three previews: `public/mock-intro/text-on-eye.jpg`), then redirected the whole opening: "redesign full to how an interface originated and how it came alive to 1970, like the invention of interface, as animation in mild". From the invention storyboard (`public/mock-intro/invention.jpg`) the answers were:
- **computers only** (from 1946);
- **no text**: "one atom to form into the interface";
- **a formation from a dot like an atom**, as animation;
- **always ending on 1970**, because the loader always starts there; the opening is the history before it.

It fits the Era POV plan (`docs/ERA_POV_PLAN.md`), where 1970 is "blind; it knows only keys" and its sign is a cursor waiting in the pupil.

**Built (lab only, `/lab/opening`):** `components/ui/loader/ink/formation-scene.ts`, drawn in the worker.
1. An atom: a nucleus with three electrons and faint orbits, where the pupil will be.
2. It divides into ENIAC's 12 × 6 panel of amber lamps (1946), which blink their sums.
3. The lamps fold into the round face of a tube, with one green dot (1951).
4. The dot draws a triangle, as a light pen did (Sketchpad, 1963).
5. It lets go and glides to the pupil, as a mouse pointer (1968).
6. The rim opens out to the glass's edges, and the dot becomes 1970's block cursor, blinking.
7. When the eye is ready, the beam scans the screen top to bottom and draws the shut eye in. The cursor settles onto the live pupil (the eye's own 1970 cursor sits there, `era-medium.ts`), the lids open, and the two cursors become one.

The canvas paints the room itself, so the beam can uncover the eye line by line. Timeline: idle at 5.0 s, scan 0.85 s, lids 1.3 s.

**Evidence:** formation sheet (desktop and phone), the scan and lids at 1/8 speed, and the cursor handover onto the eye's own cursor. tsc and lint are clean for these files.

**Still to verify before shipping:** the pre-1963 dates are cited from memory, not checked (ENIAC 1946, Whirlwind 1951). Sketchpad (January 1963, CHM) and the mouse (1964 prototype, 1968 demo, SRI) are checked. No years are shown on screen, so this only matters for the plan and any about-copy.

## Context
The first opening (`components/ui/loader/EraIntro.tsx`, 2026-10-21) was built straight from the ask: three generic lines over a dark room while the years rewind from 2026 to 1970 in era fonts, then the eye opens on 1970. The user's verdict:

> "It feels sloppy. I want to make it more personalised of my creativity … an intro and a thing that tells a story, and the interaction brings them to the world of Arun and KIRUK … set a benchmark to showcase me and the idea more clearly and curated. And the transition and the feel is still missing too."

Retro: TL-31 (built without previews, a third time) and TL-32 (generic copy; the person's own story and brand sources were never read).

## What the user already made (TL-32 guard)
| Material | Where | Label |
|---|---|---|
| "kiruk means scribble" | `docs/ABOUT_STORY.md:300` | verified |
| Tagline "Scribbles that turn into digital experiences" | `src/data/portfolio-data.ts` (`personal.tagline`) | verified |
| The Kiruk eye logo: "one identity across a multiverse of eras", one eye drawn in each era's medium (outer ring, iris ring, lid half-circle, pupil) | `src/components/brand/KirukLogo.tsx:3`, `brand/eyes/eye-core.tsx` | verified |
| "I wondered what my portfolio would look like if I'd made it in 1970, or 1995, or 2013. We are many things, so the site is too. You don't know best. You know one." | `docs/ABOUT_STORY.md` (Off hours) | verified |
| "People decide in the first ten seconds. Design those first." | `docs/ABOUT_STORY.md` (Lockdown games) | verified |
| Notebooks with more sketches than notes; a joint family that was "a studio with a kitchen attached" | `docs/ABOUT_STORY.md` | verified |
| The loader eye is one person's eye, benchmarked on the user's own eye photo | memory `eye-look-feedback` | inferred (memory) |
| The real era home pages, captured | `public/eye/screens/<era>.webp` (10 files, 10–126 KB) | verified |
| Real hand scribbles or handwriting | none in the repo: `public/blog/*/ink-01.svg` are empty or placeholders | verified |

## Questions & answers (decision-bearing rows)
| # | Lens | Question | Answer | Label |
|---|---|---|---|---|
| 1 | Why | What must a cold visitor take away? | Who Arun is (a design engineer who scribbles, then builds), what the site is (one portfolio made in ten eras of the interface), and that they are stepping into his world, the eye | user brief + About story |
| 2 | Who | Who sees it? | Every first visit, until an era is picked (`app-loader.tsx` `readLoaderMode`) | verified |
| 3 | How long | How long must it cover? | Dev build on this laptop (iGPU): the eye was ready at 6.8 s, 8.9 s and 17 s across runs. Production on the user's RTX: unknown | verified (dev runs) · unknown → step 0 |
| 4 | Constraint | Can the opening run JavaScript per frame while the eye builds? | No. The main thread blocks in long tasks up to 3.0 s and 3.6 s, and rAF gaps reach 0.8–1 s with no long task (the GPU process is busy) | verified (scratchpad `intro/longtask.mjs`) |
| 5 | Constraint | Do CSS opacity/transform animations stay smooth then? | They survive main-thread blocks. If the GPU process stalls, they may still hitch | inferred · unknown → step 0 |
| 6 | Transition | What makes the hand-off feel "native"? | A match cut: the opening's last frame lines up with the eye's first frame (the same lines, the same place), not a fade from a text card to the eye | hypothesis (to be judged on the prototype) |
| 7 | Interaction | Where can interaction live? | Only once the eye is ready (the main thread is free then). During the wait, input can only skip | inferred from row 4 |
| 8 | Scope | Do the eye, its framing, the era media and the ghost finger change? | No. The eye and the era media are another session's work; framing.ts and the ghost finger belong to the Mobile UX session | verified (peer messages 2026-10-21) |
| 9 | Taste | Which story? | **A: a scribble becomes the eye** | user-decision 2026-10-21 |
| 10 | Taste | How does the visitor go in? | **The eye opens by itself** (no input; any press skips ahead) | user-decision 2026-10-21 |
| 11 | Taste | Whose voice and type? Name? Tamil? | **No words**: only the name ("kiruk", signed) and the Kiruk mark | user-decision 2026-10-21 |
| 12 | Reference | Any reference intro, video or sketch? A scan of the user's handwriting or scribble? | **None: go from the boards**; the handwriting is an authored stroke, replaceable by a scan later | user-decision 2026-10-21 |

## Layer stack
| # | Layer | Known | Unknown | Depends on |
|---|---|---|---|---|
| 1 | Literal ask | quoted above | — | — |
| 2 | Outcome | a visitor meets Arun and KIRUK, understands the idea, and steps in | which story carries it | 9 |
| 3 | User & moment | cold, first visit, 3–17 s of wait | production wait | step 0 |
| 4 | Problem | v1 was generic, a card that fades into an eye, no story, no hand-off | — | — |
| 5 | Current state | `EraIntro.tsx` + the loader's hand-off: held-shut lids, holdBlink opening, 12 s cap, skip | — | — |
| 7 | Material | screens, logo geometry, About lines, posters | handwriting or scribble scan | 12 |
| 8 | Flow | story (passive, compositor-only) → eye ready → match cut → the visitor opens the eye → travel | the interaction verb | 10 |
| 12 | Edges | slow eye (12 s cap), no WebGL, reduced motion, phone shape, skip, reload | — | — |
| 13 | Constraints | no JS-driven motion during the wait; first paint fonts; phone memory (few full-screen layers) | GPU-process stalls | step 0 |
| 15 | **Core idea** | draft: *the opening tells, in Arun's own words and marks, that he made one portfolio in ten eras, then becomes the eye you step into: its last frame is the eye's first.* Finalised by the story pick | | |

## Seams
| Seam (A × B) | What crosses | Conflict? | Resolution | Owner |
|---|---|---|---|---|
| opening motion × eye build | main thread, GPU process | JS freezes up to 3.6 s; compositor may hitch | compositor-only motion, or a pre-rendered video (step 0 decides) | opening |
| opening's last frame × eye's first frame | geometry (lid lines, iris centre, reflection rect) | must line up per screen shape | read `eyeShot` (framing.ts) for the wide and tall shapes; the poster is the fallback | opening ↔ Mobile UX session |
| B's screen × cornea reflection | the 1970 page rect | the reflection's place and size on the eye | `EyeStageControl.irisAt()`; the reflection is already the real page | opening |
| 1970 colour × era media redesign | phosphor green, look | the other session may change 1970 | tell it; the opening follows the medium | era-media session |
| interaction × eye readiness | input | input before ready can't animate | interaction appears only once ready; skip any time | loader |
| opening × ghost finger | screen, timing | both on a phone | finger after `introGone` (done) | Mobile UX session |
| fonts × first frame | handwriting or display face | a swap flash on beat 1 | preload one face, or draw words as SVG paths | opening |

## Direction (draft, pending the pick)
Storyboards: `public/mock-intro/index.html` (http://localhost:3050/mock-intro/index.html), image `public/mock-intro/storyboard.jpg`. Throwaway: delete both before committing.

- **A. Kiruk: a scribble becomes the eye.** Ink writes "kiruk" in his hand, loops into the Kiruk eye mark, which grows to the eye's size. The ink lands on the real eye's lid lines; the lids open. Who he is; the tagline made literal. Needs a real handwriting or scribble scan to be his.
- **B. What if: one portfolio, made in ten eras.** "I'm Arun. I design interfaces." A screen shows his real 2026 home, then flicks back through all ten real homes to 1970 ("What would my portfolio look like if I'd made it in 1970? … So I made all ten."). Pull back: the 1970 page is the reflection in his eye; the lids open. The idea, shown with real work; the ending is native to the eye, which already reflects the real era pages.
- **C. One eye, ten eras: the Kiruk mark travels back.** The logo goes from 2026's dots to 1970's phosphor, growing, until its pupil opens into the real eye's pupil. The brand.
- **Recommended: B**, because it shows the idea and the real work at once, uses his own question from the About story, and its hand-off is true to the eye (the reflection is real), not decorative. A's ink could open B if the user wants his hand in it.
- **Rejected:** do nothing (the still poster: the user's original complaint) · v1 rewind of years in era fonts (generic, "sloppy") · a faster eye alone (worth doing as well, but no story) · an interactive scribble during the wait (the main thread freezes, row 4).
- **Non-goals:** changing the eye, its framing, the era media or the ghost finger; adding words on the eye after it opens.

## Done-criteria (draft)
- [x] The story pick, the interaction verb, the voice and the references are answered — check: rows 9–12 above.
- [ ] A motion prototype of the chosen story (real timing, real assets) is approved before integration — check: the user's sign-off on the mock page.
- [ ] Nothing holds still for more than 0.5 s before the eye opens, on the user's machine — check: a screen recording, or a Performance panel trace, on the production build.
- [ ] The last frame of the opening and the first frame of the eye line up within 4 px at 1440×900 and 390×844 — check: overlay of the two screenshots.
- [ ] It is skippable at any moment and ≤ 7 s on the user's machine — check: timing log.
- [ ] Reduced motion and no-WebGL paths work — check: emulated runs.

## Build order (sketch; detailed after the pick)
- [ ] 0. Spike: production build (`next build && next start` on a spare port); measure the wait and compositor smoothness during the eye's build; decide CSS vs pre-rendered video.
- [ ] 1. Material: lock the copy; get the handwriting or scribble scan if A; pick the type.
- [x] 2. A motion prototype of the chosen story, built on the real eye instead of the mock page: `/lab/opening` (dev only). Evidence: ink-only timeline sheet, the drawn shut eye over the real shut eye (`?peek=1`, desktop and phone), and the landing filmed at 1/8 speed (ink → phosphor → into the lashes → lids open). Files: `components/ui/loader/ink/ink-scene.ts` (the drawing), `ink/ink.worker.ts` (OffscreenCanvas worker, so the main thread's stalls don't stop the pen), `InkOpening.tsx`, `open-eye.ts` (lids), `lab/opening/OpeningLab.tsx`. **Awaiting the user's sign-off.**
- [ ] 3. Match-cut geometry from `eyeShot` (wide and tall).
- [ ] 4. Rebuild `EraIntro` and the hand-off; the interaction verb.
- [ ] 5. Checks: phone, reduced motion, slow eye, skip, no WebGL.

## Checkpoints
- Now: pick the story, the way in, the voice; share any references.
- After step 2: approve the motion prototype before it touches the loader.

## Watch list
- GPU-process stalls hitch even compositor animations — status: open (step 0).

## Drift log
| Date | What changed | Why | Approved by |
|---|---|---|---|
| 2026-10-21 | Step 0 (production build spike) deferred; step 2 built on the real eye in a lab route instead of the mock page | `next build` would overwrite the `.next` folder that two running dev servers use; the worker canvas answers the main-thread stall by design. The match cut could only be judged on the real eye | self (reversible; lab is dev-only) |
