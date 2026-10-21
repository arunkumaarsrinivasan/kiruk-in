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
| 0 | The first paint is already dark (#040507) with a faint green glow at the pupil. An inline head script sets `data-tube-boot` before React, so there is no white flash and no hydration mismatch |
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
- **Recapture whenever 1970's look changes:** `/lab/opening?shut=1&clean=1&ink=0`, then `window.__opening.capture()`, then downscale, greyscale and WebP by hand at poster sizes.

## Lab
- `/lab/opening` params: `?speed` time scale; `?eye=0` tube alone; `?main=1` main thread; `?reduce=1`; `?debug=1|2` arrival map / levels; `?shut=1`; `?grid=1` mm grid; `?media=0`; `?era=`; `?clean=1`.
- `window.__opening = { control, replay, skip, capture, stats }`. `stats` returns frames, avg, p95, gpuMs and hitches over 34 ms. Check p95 ≤ 17 ms.

## Traps
- GLSL `smoothstep` needs edge0 < edge1, and `exp()` must be guarded against overflow. Both blacked the screen.
- Plain main-thread JS does not stall the worker; GPU-process work (a sync pipeline build) does. See eye-tsl-craft.
