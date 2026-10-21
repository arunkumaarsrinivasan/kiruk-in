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
- Recapture the opening's shut-1970 stills when 1970 changes (`/lab/opening?shut=1&clean=1&ink=0`, then `window.__opening.capture()`).
- Re-run `npm run eye:screens` when an era's home page changes (the cornea reflects the real page).
- Update the era's plan doc and its drift log; run tsc and lint.
