---
name: eye-opening
description: "What plays before the loader eye opens: the CRT tube opening (an OffscreenCanvas WebGL2 worker in which a chip at the pupil lays a circuit, phosphor pixels catch from the wires and form the real shut 1970 eye, the chip becomes the 1970 cursor, then the live eye's lids open), the first-paint boot, the hand-off to the live eye, typing and pointer play during it, and how it was arrived at. Use when changing the loader's first seconds, the intro, the hand-off, or the shut-eye stills. Triggers on: opening, intro, tube, TubeOpening, CRT, boot, first paint, circuit, chip, phosphor, shut eye, hand-off, openLids, lab/opening, before the eye opens."
---

# The opening: the invention of the interface, up to 1970

The live eye takes seconds to compile on a weak GPU. The opening fills that wait with meaning: a computer coming to life and forming the 1970 eye, pixel by pixel, then the real lids open on it. It always ends on 1970, because the loader always starts there.

## What it must be (rules from six rejected rounds)
1. **A running process, not keyframes.** It forms itself, like a simulation. *Why:* staged slides ("SVG like a popup slide") were rejected.
2. **Computers only, from one atom (a chip at the pupil), ending on the 1970 CRT.** "1970" means the CRT display physics, not the 1970 home page.
3. **No words, no logo, no drawn cartoon eye.** All of these were rejected as meaningless or sloppy. The eye it forms is the *real* shut 1970 eye, from a still of the live eye.
4. **Interactive from the first frame:** pixels catch near the pointer and flare; a press sends a ring; typing writes at the cursor; Enter/Escape skip.
5. **Light and fast:** it runs in a worker on an OffscreenCanvas with one WebGL2 shader, DPR ≤ 1.5, about 60 fps and ~3 ms GPU on a weak GPU. *Why:* the main thread stalls up to seconds while the eye builds; a worker doesn't.
6. **Seamless hand-off:** the chip becomes 1970's block cursor and settles onto the live eye's own cursor, the formed pixels sharpen into the live shut eye, then the real lids open.
7. **Ask for references before each visual round** of the opening.

## Sequence (tube-scene.ts)
| t (s) | What |
|---|---|
| 0 | The first paint is already dark (#040507) with a faint green glow at the pupil. An inline head script sets `data-tube-boot` before React, so there is no white flash and no hydration mismatch. Under it, the server-rendered site is painted (not hidden), so the page's first and largest contentful paints land here (~0.3 s), not at the corner hint after the eye opens (11–19 s). The tube's OffscreenCanvas never counts as a contentful paint. A returning visitor's content is held unpainted by `data-content-wait` until hydration applies their era (boot.ts, app-loader.tsx) |
| 0–0.6 | The tube warms; a beam spot at the pupil |
| 0.15–0.45 | The chip appears (2.5 mm, 5 pins) |
| 0.45–2.5 | Traces lay at 45° (900 px/s): iris fan, limbus rings, lid bundles, brow, lash pads, then a board of buses, chips and vias to the edges (fixed seed 1970), all aligned in mm to the real eye |
| → ~3.55 | Phosphor cells (4–8 px) catch from the wires at 300 px/s with uneven costs (two-pass chamfer). Lights catch before darks (+0.35 s), with a flash and settle, in 12 levels, forming the shut-eye still |
| formed − 0.9 → − 0.3 | Wires recede (to 0.12 on the eye's own wiring); the chip becomes the 1970 block cursor, blinking every 0.53 s |
| after 4.4 | A clock ring every 3.2 s, so it is alive, not stuck |
| eye ready | Resolve over 1 s: cells shrink to 1 px and fade; the cursor settles onto the live pupil (0.2 × 0.36 of the pupil radius); `open` at 0.85 s, `done` at 1.1 s |

## Hand-off (immersive-era-loading-page.tsx, open-eye.ts)
- At `eyeReady`, the live eye is held shut with gaze centred. The pupil is read after 350 ms.
- While the tube covers it, the stage is `covered`: it draws every 0.1 s and carries the clock, so pipelines finish without competing.
- `openLids`: a 1300 ms waking curve. The lids lift to 0.45 by 32%, catch to 0.42 until 44%, then ease fully open. Reduced motion opens at once.
- **Late path:** if the eye isn't ready by 20 s, the tube fades onto the poster. *Why:* a slow GPU's first visit builds shaders for ~10 s; 12 s was too short.
- **The late path must stay rare.** If a film shows the worker sending `leave` instead of `ready → landing → open`, the eye's first compile has grown: check that only the era on screen's medium is compiled (eye-tsl-craft).
- With per-era media on the weak GPU, the sequence runs `ready` ≈ 13 s, lids open ≈ 14 s, and nothing freezes afterwards. Before the split: give-up at 21.7 s, then a 5 s freeze.
- Enter/Space are guarded for 0.9 s after opening and 1.5 s after typing. *Why:* typing through the hand-off entered the site.
- On resize the tube rebuilds already formed ("no one wants to watch it twice").

## The shut-1970 stills
- `public/eye/posters/1970-shut-{wide,tall}.webp`, about 2 KB each, read as luma (`.r`, lifted ×3.2); mip 3 is the bloom.
- **Recapture whenever 1970's look or the framing changes:**
  1. Open `/lab/opening?shut=1&clean=1` at exactly the poster's CSS size: 1600×900 for wide, 780×1688 for tall.
  2. Wait ~7 s after `[data-ready]`: past the opening greeting, well before boredom.
  3. Run `window.__opening.capture()`.
  4. Resize to exactly 400×225 or 200×433 (`fit: fill`), greyscale, WebP quality 75 (~2.2 and ~1.4 KB).
  5. **Check the capture's aspect is the poster's before resizing.**
- **Traps (2026-10-28):**
  - The page keeps `scrollbar-gutter: stable`. The loader drops it, and so does the opening lab now. Without that the lab's canvas was ~10 px narrower than the tube's frame, and the stills sat off at hand-off.
  - A fresh browser gets the site's first-visit loader over every route, and the lab under it never mounts. Set `localStorage portfolio-theme-selected=true` and `sessionStorage kiruk-loading-seen=true` before the page loads.
  - **The first capture can be black** (the eye not yet drawn at that size: the tall one came back 228 bytes). Before capturing, poll `capture()` until the frame has light in it, measured on the brightest channel: 1970 is green phosphor, so the red channel reads 0 even when lit.
- **Proof of no jump:** draw the still where the tube draws it (`posterPlacement`), and fit it against the live shut eye's frame (best scale and shift on edge maps). Compare at the still's own resolution (the live frame downscaled and blurred a pixel); at full resolution the skin's texture dominates the edges and the search runs off to its bounds. After the 15 mm box (2026-10-28): wide and tall both fit as placed (×1.00, 0, 0 px). The old stills needed ×0.87 and 44 px. After R6 round 2 (the canthi moved, the skin's sparkle): again ×1.00, 0, 0 (wide 1440×900 correlation 0.90, tall 390×844 0.86; the previous stills scored 0.75 and 0.74 against the new eye). The stills are now ~3.1 and ~2.2 KB.

## Realism pass: keep the hand-off seamless (C12)
- **Re-capture the shut-1970 stills after sign-off** whenever a phase changes 1970 at rest (R2, R6, R7, R8, R9, R10, R11). A change to the lids' shape (the canthi, R6) always does.
- **The tube's wiring is laid in mm onto the real eye** (iris fan, limbus rings, lid bundles, brow, lash pads). After R1 (the elliptic limbus), R7 (lid form) or R10 (the brow), re-check it with `?grid=1` and the hand-off frames.
- **Compare the last tube frame with the first live shut frame.** They must not jump. *Why:* a mismatch reads as the eye being swapped at the moment it should come alive.

## Lab
- `/lab/opening` params: `?speed` time scale; `?eye=0` tube alone; `?main=1` main thread; `?reduce=1`; `?debug=1|2` arrival map / levels; `?shut=1`; `?grid=1` mm grid; `?media=0`; `?era=`; `?clean=1`.
- `window.__opening = { control, replay, skip, capture, stats }`. `stats` returns frames, avg, p95, gpuMs and hitches over 34 ms. Check p95 ≤ 17 ms.

## Traps
- GLSL `smoothstep` needs edge0 < edge1, and `exp()` must be guarded against overflow. Both blacked the screen.
- Plain main-thread JS does not stall the worker; GPU-process work (a sync pipeline build) does. See eye-tsl-craft.
