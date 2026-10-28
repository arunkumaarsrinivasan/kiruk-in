---
name: eye-verification
description: "How to prove a loader-eye change works and show it to the user: headless Chrome over CDP driving the lab, state shots (rest, scanpath, still, hover, press, inspect), slowed filmstrips of cuts, WebGL2 and reduced-motion passes, phone shots, the real loader's enter, shader-size traces, exploded layer views, contact sheets and storyboards, posters to recapture. Use after any change to the eye, an era, a cut, the opening or the loader, and before reporting it done. Triggers on: verify, prove, screenshot, filmstrip, storyboard, contact sheet, headless, CDP, lab, before after, recapture posters, check phone, does it work."
---

# Verification: show it, don't claim it

The in-app browser pane often renders no frames when its window isn't in view. **Verify in headless Chrome over CDP** with the dev server running, and show the user real renders.

## The harness (copy it; it's small)
- Launch Chrome with `--headless=new --enable-unsafe-webgpu --enable-gpu --remote-debugging-port=N --user-data-dir=<temp>`. Poll `/json` up to ~40 s for the page target. *Why:* a 12 s poll failed on a busy machine.
- `Emulation.setDeviceMetricsOverride`: desktop 1440×900 at DPR 1; phone 390×844 at DPR 2 with `mobile: true` and touch emulation.
- Log `Runtime.exceptionThrown`, console errors and warnings, and `Log.entryAdded`. WGSL errors arrive as console warnings: **read them every run.**
- **Never write the lab's uniforms directly** (`__eyeLab.current.uniforms.x.value = …`). The lab re-applies its whole panel about once a second, and the write is gone before the shot: three identical "A/B" shots were the symptom. Click the panel's control instead, and give each control a label no other button shares (`iris·clay`, not `clay`).
- Drive the lab by clicking its buttons by text ("Ways of seeing", an era), keys (`h` hides the panel; ArrowRight/Left step eras) and `window.__eyeLab.current`:
  - `irisAt()` gives the iris position and radius in CSS px, to aim the pointer;
  - `mediumInfo()` gives `cur, dep, arr, blink, signA, busy, since, idle`;
  - `slowMedium(rate)` slows the cut for filmstrips; `mediumLayers(mask)` gives the exploded view (2026); `setMedium(id)` overrides the medium.
- **Wait for the warm-up.** After turning the medium on, the first frames are black while pipelines compile (≈8 s for a 470 KB fragment on the weak GPU). Check frame brightness before judging a black shot.

## The shot list (every era change)
1. **Rest**, after 3 s of the pointer parked in a corner.
2. **Moving:** five rests of different dwell round the face (scanpath, reactions).
3. **Still:** 1.5–3 s idle (re-measure sweeps, idle states).
4. **Hover** on the iris (0.35R, 0.2R from its centre).
5. **Press** at 180 ms and at 680 ms.
6. **Inspect:** the pointer at ~2R beside the iris (near-pointer reactions).
7. **Slowed cut:** `slowMedium(0.2–0.25)`, 12–16 frames every ~400 ms, from the previous era and into the next. Name the frames with `cur, blink, dep, arr`.
8. **Phone**, the same list at 390×844.
9. **WebGL2** (lab "Force WebGL2 backend") and **reduced motion** (lab "Reduced motion"): rest and press.
10. **The real loader:** load `/`, wait ~24 s for the opening, step eras with keys or `End`, then hover, press and release on the iris. Shoot the enter frames every 60 ms until the era's home appears.
11. **Shader size**, when the code grew (eye-tsl-craft): the largest fragment in KB, and the slowest pipeline in ms.
12. **The loader's timeline from first paint:**
    - wrap `Worker` to log the tube's events (`ready`, `landing`, `open`, `done`, or `leave` on the late path);
    - wrap `GPUDevice` to log pipeline builds (async or SYNC);
    - log rAF gaps over 120 ms.

    Expect `ready → landing → open` with no gap over ~1 s after the open.
13. **First open against a round trip:** use reduced motion. Shoot 1970 at its first open, step to 1981 and back, shoot again, and diff the eye region. The diff must be 0, or a bake was skipped.
14. **Jump to the farthest era right after the open** (End): the lids stay shut on the old era (never black) until the new medium is built.

Look at every frame before reporting. Zoom crops (2× at 1:1 detail) for brow hairs, lashes, the lid fold and the iris. Contact sheets downscale and add moiré that isn't there; say so when sending them.

## Realism pass: proof per phase
- **R0 baseline:** `node scripts/eye-realism-baseline.mjs <chrome> docs/era-pov/r0-baseline http://localhost:3031 [live,see,poses,seeposes,t2,gl]`.
  - It records per era and tier: GPU ms, pupil mm, gaze, the page's share of the iris, the margin-vs-almond gaps, each layer's cost (off/on in one page), and WGSL sizes and pipeline builds (SYNC flagged).
  - It also shoots six poses × ten eras clean, and each medium at rest and half shut, with contact sheets.
  - Re-run it at the end of every phase. The diff against the plan's §6 table is the phase's cost.
- **The lab's URL setup,** read before the stage first compiles:
  - `/lab/eye?tier=1|2|3&gl=1&see=1&reduce=1`;
  - `&box=iris` fills the frame with the iris (close-ups, and the iris's cost at its worst);
  - never switch tier or backend after load (it double-compiles).
- **Cost per pass:** `__eyeLab.current.stats.passes` (eye-tsl-craft). Re-time the passes a change touches, in one page, before and after.
- **The iris:** the `iris` session (`… <baseUrl> iris`, `IRIS_PARTS=looks,t2,t1,media` to run part of it). It shoots the iris and clay for all ten eras at `?box=iris`, the lab's iris views, a pupil sweep, side views, a shimmer diff at rest, the scene pass at iris-fill and at the loader's framing, any bake an era change sets off (there should be none), T2, T1 on WebGL2, and every era through its medium on desktop and phone. It saves after each part and waits out a remount (another session's hot reload drops the stage).
- **The margin overlay** (lab "Alignment (R0)"):
  - green = the CPU twin's margins, magenta = the media's `almond()` and iris;
  - `window.__eyeAlign()` gives the gaps in mm;
  - after any lid or media change, the green line must still hug the rendered lids.
- **Every phase:**
  - the solo view;
  - then solo × era for every era where the phase is ● or ◐ (the matrix in `eye-loader-system/references/era-realism.md`);
  - the media re-check list (`eye-era-media/references/realism-through-media.md`);
  - the shut mid-cut frame for two pairs of eras;
  - 2× crops at 1:1, before and after.
- **Judge in the era's terms (C7).** A colour change in a B&W era is not a regression; a luminance change is.
- **1970 at rest:** pixel-diff against the signed-off look with the cursor masked. Every difference must be intended.
- **A/B inside one page** with a uniform gate, never across runs (±25 % drift).
- **Storyboard rows:** the part alone; the part in its ● eras; the shut mid-cut frame; the phone.

## The user's eye as the benchmark (R3, R5, R6 onward)
`docs/era-pov/ref/user-eye.webp` (1276 × 1273, graded: compare structure and relations, never absolute hue).
- **Shoot ours at its aspect:** the lab at 1276 × 1273, DPR 2, `?tier=3&reduce=1`, click "Hold gaze" and "Era lens" (lens off), then each era (2003 for colour; 2026 and 1991 for luminance). Shoot 2003 after another era: right after a shader change its first frames are black while pipelines build (check the frame's mean before judging).
- **Crops in the 1276 frame (ours × 2 at DPR 2):**

  | Part | Photo | Ours |
  |---|---|---|
  | inner corner | 60,600 – 540,960 | 60,520 – 540,880 |
  | lower rim | 440,800 – 920,1000 | 420,760 – 900,960 |
  | nasal white | 250,640 – 580,880 | 150,560 – 460,820 |
  | iris and limbus | 400,440 – 980,960 | 350,420 – 930,940 |
- **Measure, don't eyeball:** mean L*a*b* of boxes; a vertical L* profile through the rim (white → junction → strip → lash line); the limbus sideways (nasal and temporal, ±12°) from 0.7 to 1.3 R (our iris at 1× is (638, 702), R 239); iris detail as L* rms above a 9 px mean. Our skin is much darker than the photo's, so match relations (rim over skin, rim against white), not values.
- **One sheet per part:** photo, ours before, ours now, the whole eye; sent as each part lands. Review images live in the gitignored `docs/era-pov/`.
- **Debug a look by switching terms off** in a throwaway build (restore the file after): the caruncle's blotches were its speck term, found in one render.
- **Judge shape on a mm grid, not by eye:** crop the photo and ours at one scale (the iris's 11.7 mm sets the photo's px/mm) with 1 mm lines from the canthus, and read the opening at 1, 2, 4, 6 mm; grid the whole eye round the iris's centre to read both margins every 2 mm. Then fit the twin (`twin/margins.ts`) against those numbers before touching the shader. The references: `user-eye.webp` (graded crop), `user-eye-3.webp` (the same, uncropped), `user-eye-4.webp` (ungraded: the colour target), `user-eye-2.webp` (oblique: skin texture, the corner's tear pool).

## Showing the user
- Send **one storyboard image** per change: a title and a one-paragraph concept, then rows with captions:
  - the layers or parts;
  - the arrival;
  - the reactions;
  - press and enter;
  - phone.
- Add a full-resolution frame, and a before/after when changing something existing.
- Write captions as what the viewer sees, not what the code does.
- Keep review images **out of git** (a gitignored `docs/era-pov/`).
- Report what was not verified, plainly, for example "the loader capture didn't reach the home this run".

## After the look is signed off
- Recapture the posters when an era's look changes: in the lab, "Capture all eras" / "Capture phone posters", or `window.__eyeCapture(eras?, ["wide","tall"])`.
- Recapture the opening's shut-1970 stills when 1970 or the framing changes (eye-opening has the exact steps and traps), then prove the hand-off: the still at its `posterPlacement` must fit the live shut eye as placed (×1.00, 0, 0 px).

## Harness traps (2026-10-28)
- **The lab re-applies its panel every 120 ms,** so `holdBlink`, `holdGaze` and `holdSquint` set from a script get cleared, and a shot catches a blink. Use the panel's own controls ("Hold lids" and its slider), or the brow's `browQuiet`, which the panel doesn't touch.
- **A fresh profile gets the first-visit loader on every route.** Set the two storage keys first (eye-opening) when shooting a lab route other than `/lab/eye`.
- **Posters capture in reduced motion at each era's rest gaze,** so against a live frame with the gaze held centred they fit in scale (×0.97–0.99), not in pose.
- **A screencast's frame clock is not the page's `Date.now()`,** so frames picked by a page-side trace land on the wrong label. Shoot at the moment instead: poll the rig (`browInfo()`, `gazeTrace()`) and take `Page.captureScreenshot` when the state is reached.
- **A screenshot (~0.4 s at 1440×900 on WebGPU) outlasts a brow flash,** so one shot per run of an event: to show the moment before and the flash itself, play the same event twice, past the impulse's cooldown, and take one shot from each.
- **The lab's quiet mode (`browQuiet`) is not the live face:** it forces "no saccade", "nobody there" and the rest. A brow that followed the gaze in every quiet-mode proof was frozen live, because pursuit was being read as a saccade. Prove any behaviour the visitor drives with quiet off and a real cursor (`brow-px.mjs`: nine cursor spots, the lids held open through the panel, the rig's lift beside each crop).
- **Another session's edits hot-reload the lab and rebuild the stage** (quiet off, moods on). Re-assert `browQuiet` and `browMoods` before every measurement, and check `browInfo().mood`.
- **A cursor still for 2.2 s is let go** (`POINTER_HOLD`) and the eye returns to its script. To keep the eye on a parked spot, keep the cursor moving a little.
- Re-run `npm run eye:screens` when an era's home page changes (the cornea reflects the real page).
- Update the era's plan doc and its drift log; run tsc and lint.
