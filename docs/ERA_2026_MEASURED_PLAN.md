# 2026, measured -- the loader eye as the interface that tracks

> Status (2026-10-21): planned and built in one pass from the user's four references. It replaces the 2026 halftone on the loader. The 2026 home (the inside) stays as it is for now; it will follow this concept later (phase F). Not committed.
> **Storyboard:** `docs/era-pov/2026-measured-storyboard.png` shows the layers rendered alone, the arrival, the reactions, press and enter, and the phone. A full-resolution frame is in `2026-measured-rest.png`.
> **Verified:** in the lab and the real loader at 1440×900, on a phone (390×844 @2×), with the WebGL2 backend forced, and with reduced motion. There are no console errors, and tsc and lint are clean.

## v2: craft and the wow (2026-10-21, user: "the unique and the style is missing, no wow factor, needs lots of detailing and crafted work")

v1 had every element at one weight, generic labels and no signature motion. v2 fixes this as follows. The code now lives in `post/measured.ts`, which `era-medium.ts` calls.

- **A drawing standard.**
  - Hairlines come in three weights: the limbus at 1.6×; the instruments; faint context.
  - A few bright **nodes** with a soft halo (ref 2): the pupil's centre, the protractor's zero, the gaze pole, your pointer and the pupil-trace head.
  - Front halves are solid and back halves dashed.
  - Your attention is drawn **dotted**, so it never reads as an instrument.
- **The gimbal (the signature).**
  - The globe (24 mm) is drawn as three great circles turning in 3D with the gaze: the equator the iris sits in, and two rings through the gaze axis, each tipped 28° toward us so they read as ellipses even at rest.
  - Arriving, they swing into place. Over the iris they turn about the gaze axis, scanning it (`medium.spin`).
  - The gaze axis runs from the globe's centre to its front pole, which is a node.
- **Type set like a chart (ref 1).**
  - A protractor at 1.45R has ticks every 5° and 15°, and its angles are set **along the arc** every 30°, read clockwise from twelve (`dialText`).
  - The axes are **millimetre rulers**: a tick per mm, longer every 5 mm, numbered every 5 mm.
  - The distance from her pupil to your pointer, in mm, is set **along the gaze line**, rotated to read left to right.
- **Callouts:** each landmark label sits on an elbow leader (45°, then flat, with the label riding the line). A callout that would leave the frame turns back in.
- **Arrival as acquisition.**
  - A scan ring runs out from the pupil. Each landmark is acquired as the ring reaches it: a square closes on it, then its leader draws, then its digits run (random at 24 Hz) and lock.
  - Under reduced motion, everything is simply there.
- **More interaction.**
  - Pointing at a feature **inspects** it: it is re-acquired, its circle tightens and its callout lights up, even a minor one.
  - Over the iris, the lock-on shows the pupil reading large at the bracket's corner.
  - In a blink the tracker loses the eye: its fits and readings drop out.
- **Your attention as a contour map:** the fixations sum into a field, drawn as dotted isolines every 0.22.
- **The frame's own readouts, in the corners under crop marks:**
  - time since the eye arrived (m:ss.t);
  - yaw, pitch and pupil mm, each with a drawn mark;
  - a 6 s pupil trace (`medium.pupilHist`, 32 samples) with a tick per second;
  - your fixations and her blinks, counted (`medium.fixTotal`, `medium.blinks`), with drawn pictograms.
- **Press is a capture:** the crop marks leave the corners and frame the eye opening, there is one soft flash, then the blocks appear.
- **Restraint:** the φ² and φ³ orbits and the arch are gone (the gimbal is the big geometry now), as are the eye readouts beside the limbus (they moved to the corner).

## The idea

In 2026 everything is tracked. The interface no longer sees a face. It sees a face mesh, a gaze vector, a pupil diameter, a dwell time.

So in 2026 the eye's point of view is the interface looking at its one user and **measuring** her, live, as a clean black-and-white plate under a layer of white instrument lines. It measures you back too: every move of your pointer is recorded on her face as a scanpath, numbered, timed and joined up. Nothing in the overlay moves for decoration. A line moves only because what it measures moved.

## What each reference gives

| Reference | What we take | What we leave |
|---|---|---|
| 1. Orbit diagram over a B&W face | Concentric construction rings centred on the pupil, at growing radii, crossing the face; thin white lines radiating through the eye | The words on the orbits (the loader has no words) |
| 2. Circles over a soft grey head | The plate: soft, grey, fine grain; huge thin circles; dashed axes across the whole frame; filled dots where the axes cross the rings; a column of dots down each margin | The corner texts |
| 3. Measured eye, numbered landmarks | Numbered landmarks with live coordinates (`n + x - y`); a faint circle round each point (we use it for the tracker's confidence); dashed crosshairs through the pupil; a dashed box round the eye opening | Colour (2026 stays black and white) |
| 4. The eye breaking into data blocks | The press and the way in: the eye extrudes into rows of blocks, with a fine spectral edge, the one moment of colour in 2026 | The rainbow light leaks and the dot screen |

## Rules

- **No halftone.** The plate is the whole face, clean and high-res, in black and white, with every detail (brow hairs, pores, lashes, the iris's fibres), as 1970 shows it.
- **Numerals only.** The loader has no words. Every readout is a number: coordinates, degrees, millimetres, seconds, counts.
- **Lines adapt to the plate.** Hairlines are white over the face and turn near-black where they cross the white of the eye or the reflected page, so they read everywhere without boxes or shadows.
- **Calm.** Readouts change only when what they measure changes. Nothing spins or blinks for its own sake. Hairlines are 1 CSS px and labels are small and quiet.
- **Phones are first-class.** Every size follows the iris, but no label falls below about 10 CSS px. The finger is the pointer.
- **Reduced motion:** every instrument is drawn at once, with no sweeps and no extrusion. The capture is a still cut to blocks.

## The layers, back to front

```
 L0  PLATE          the face, B&W, crisp, soft grey, fine grain
 L1  REGISTRATION   dashed axes through the pupil, edge to edge; the opening's dashed box; margin dots
 L2  GEOMETRY       pupil fit, limbus fit with degree ticks, orbits at R·φ, R·φ², R·φ³; dots where the axes cross them
 L3  LANDMARKS      12 numbered points on canthi, lids, crease, brow, under-eye: dot, confidence circle, n + x - y
 L4  YOU            the reticle on your pointer (x - y), the gaze line from her pupil to it (°), your scanpath
 L5  SIGN / STATES  the lock-on brackets round the iris; the re-measure sweep; the capture; the way in
```

### L0, the plate
- Luma of the finished frame (the 2026 lens is already sat 0, sharpen 0.4), then an unsharp mask a pixel out, so the image is crisp.
- The darks are lifted (γ 0.72) so the dark skin keeps every pore. Over the cornea, the bright reflected page is held in the middle greys (`develop`), as every other era does it.
- Mapped from `#151515` to `#ecebe8`, neutral.
- Fine monochrome grain, ±3.5%, one device pixel, stepping at the film rate (frozen under reduced motion). There is a soft vignette.

### L1, registration (refs 2, 3)
- Two dashed axes through the pupil's centre span the whole frame. Dash 6, gap 6 (reference px). They follow the pupil, as a tracker's crosshair would.
- A dashed box round the eye opening: canthus to canthus, upper apex to lower apex. It breathes with the lids.
- A column of small dots down each margin, one every 1.1R, aligned to the horizontal axis (ref 2).

### L2, geometry (refs 1, 2)
- **Pupil fit:** a solid ring on the pupil's edge. Its radius is the live pupil.
- **Limbus fit:** a solid ring at R, with a tick every 10° and a longer tick every 90°. One brighter tick marks the gaze's direction.
- **Orbits:** R·1.618 (dashed), R·2.618 (solid, faint), R·4.236 (faint, mostly beyond the frame), and a half-arc at R·1.618 over the top (ref 2's arch).
- **Nodes:** a filled dot wherever the vertical axis crosses an orbit (ref 2).
- **Readouts on the limbus's right:** gaze yaw and pitch in degrees (`12.4°`), and pupil diameter in mm (`3.4`).

### L3, landmarks (ref 3)
Twelve points, each built from the lid opening as the lids stand this frame, so they ride every blink and saccade:

| n | Where |
|---|---|
| 1, 2 | the medial and lateral canthus |
| 3, 4, 5 | the upper margin at −50%, the apex, and +50% |
| 6, 7 | the lower margin at −40% and +45% |
| 8 | the upper crease over the apex |
| 9, 10, 11 | the brow: medial, peak, lateral |
| 12 | under the eye (the lower lid's fold) |

Each point has:
- a dot 2.2 px across;
- a faint circle of **confidence**, sized per point and widening with movement (ref 3's circles). It tightens to a small ring when everything is still: the tracker is sure;
- a label `n + x - y`, in pixels of a 1080-high frame. It is zero-padded and set in Geist Mono (the 2026 home's label face) from a glyph atlas.

### L4, you
- **Reticle:** a thin ring with four gap ticks on your pointer or finger. It trails the real pointer slightly (the tracker's lag, from the damped `ptr`). Its readout is your `x - y`.
- **Gaze line:** dashed, from her pupil to your reticle, with its angle at the pupil end. She looks at you, measured.
- **Scanpath:** where you stop, the overlay makes a fixation (the pointer held within 0.035H for 120 ms). It is drawn as a numbered circle whose radius grows with dwell time, and consecutive fixations are joined by a hairline (a saccade). The last six are kept; each fades after 8–12 s. This is classic eye-tracking notation, turned on the visitor.

### L5, sign and states

| State | What happens |
|---|---|
| **Rest** (the sign) | Four corner brackets frame the iris at 1.35R and drift ±2% with a slow breath. Everything else holds still. |
| **Moving** | Readouts update; confidence circles widen with speed, so the measurements visibly get less certain; the scanpath grows. |
| **Still for 1.5 s** | A re-measure: one dashed horizontal line sweeps top to bottom over 1.6 s, then repeats every 6 s. Each landmark it passes flashes its circle; confidence circles shrink to tight. |
| **Blink** | Landmarks 3–7 ride the lids down and back, and the opening's box collapses and reopens. The tracker loses the eye: the pupil and limbus fits and the readouts drop out until the lids reopen. |
| **Hover over the iris** | Lock-on. The brackets snap in to 1.1R and turn solid; the reticle hands over to them; the pupil readout grows. |
| **Press** | Capture (ref 4). The eye extrudes into rows of glassy blocks, pushed out sideways from the iris's edge, and the iris itself turns to blocks. The rows vary in length, each block is lit on its top edge, and each edge carries a thin spectral fringe. About 5% of the blocks catch the light at 4 Hz; under reduced motion they hold still. Releasing retracts them. |
| **Enter** | The extrusion runs out past the frame, then the frame floods to the 2026 home's white (`#fafafa`). |
| **Arrival** (as the lids open; `since` from the swap) | The plate is there at once. Then the instruments construct themselves: the axes draw out from the pupil (0–0.45 s), the rings sweep round from 12 o'clock (0.15–0.9 s), the landmarks pop in in order (0.4–1.3 s), and the readouts arrive with their numbers. |
| **Departure** (130 ms, as the lids close) | Every ring shrinks into the pupil and the axes retract. |
| **Phone** | The same instruments, sized by the iris. Labels have a floor of 1.55% of the height. The minor landmarks (3, 5, 6, 7, 8, 9, 11) drop their labels when R < 7 label heights, so nothing collides. The reticle and scanpath come from the finger. |

## What is measured, and from where

| Readout | Source | Uniform |
|---|---|---|
| Pupil centre, iris radius | the globe's turn, the frame | `medium.pupil`, `medium.irisR` |
| Pupil diameter (mm) | the pupil rig × iris mm | `medium.pupilMm` (new) |
| Gaze yaw / pitch (°) | the eyeball's rotation | `medium.gazeDeg` (new) |
| Lid opening, apexes | the lid angles (`lidReach`) | `medium.apX`, `medium.apY` |
| Your pointer, presence | pointer or finger | `medium.ptr`, `medium.track` (new; counts touch) |
| How much is moving | the pointer's speed and the eye's | `medium.listen` |
| Your fixations | `post/attention.ts` (new): I-DT fixation finder, last 6 | `medium.fix[6]` (x, y, dwell, alpha), `medium.fixN[6]` |
| Time since arrival, idle | the director, the pointer | `medium.since`, `medium.idle` |

## Engineering

- **`post/readout.ts` (new):**
  - Hairline primitives in pixels: ring, segment, dash, disc, brackets.
  - A glyph atlas: a canvas drawn once with Geist Mono, holding `0–9 + - . °` and a blank, mipmapped. It is redrawn when the font arrives.
  - `readout()` draws a row of glyph codes into a box. It is gated by an `If` on its box, so a pixel outside every label pays nothing, and it samples the atlas at an explicit LOD.
- **`post/attention.ts` (new):** the fixation finder (pure TypeScript, testable).
- **`post/era-medium.ts`:** the 2026 branch is rewritten as L0–L5.
- **`uniforms.ts`:** adds `track`, `gazeDeg`, `pupilMm`, `fix`, `fixN`.
- **`EyeStage.tsx`:** writes them, in the media block.
- **Cost:** 5 taps for the plate, plus about 70 SDF terms and 22 gated labels. Extrusion runs only while `press` or `enter` > 0.

## Phases

| Phase | Content | Status |
|---|---|---|
| A | Plate, registration, geometry | built |
| B | Landmarks and readouts (glyph atlas) | built |
| C | You: reticle, gaze line, scanpath, confidence | built |
| D | Press capture, enter | built |
| E | Arrival and departure choreography, phone, reduced motion | built |
| F | **The inside:** the 2026 home redesigned on the same concept (instrument lines on white, the visitor's scanpath, readouts) instead of the halftone Pupil | later, on the user's go |

## Risks
- **Clutter.** Keep the labels small and quiet (70% alpha), the orbits faint, and at most 12 landmarks and 6 fixations.
- **Numbers flickering.** Labels show whole pixels of a 1080 frame and the eye's micro-saccades are slow, so they tick, not flicker.
- **Phone cost.** The labels are gated, the plate has 5 taps, and the extrusion runs only on press.

## Drift log (built vs. this plan)
| What | Plan | Built | Why |
|---|---|---|---|
| Press | the readouts freeze | they do not | freezing needs held copies of every value in JS; the blocks cover them anyway |
| Arrival | plate there at once | the exposure settles out of white as the lids open, and the instruments are gated to the opening (`smoothstep(0.3, 0.9, arr)`) | the axes drew over the shut lids |
| Blink | — | the fits and readouts drop out (`lock` from the opening's height) | a tracker cannot see a shut eye; the rings floated over the lid |
| Labels | 10 CSS px floor | `max(20·kc, 1.55% H)` cell height; minor labels need R ≥ 7 cells | at the 10 px floor, the phone's labels overlapped round the small eye |
| Landmark 8 (the crease) | major | minor | its label met the apex's when the eye looked up |
| v2 (see above) | — | gimbal, protractor dial, mm rulers, elbow callouts, scan acquisition, inspect, contours, corner HUD, capture framing | user: no wow, needs craft |
| Lab | — | `__eyeLab.current.mediumLayers(mask)`, the bits for plate, registration, geometry, landmarks, you and sign (63 for all) | for the exploded view |
