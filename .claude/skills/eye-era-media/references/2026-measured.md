# 2026, measured: the plate under live instruments (post/measured.ts)

**Concept.** In 2026 everything is tracked. The interface no longer sees a face. It sees landmarks, a gaze vector, a pupil diameter and a dwell, and it measures the visitor back. The design is a clean black-and-white plate under a layer of instrument lines that move only because what they measure moved.

It replaced a halftone, which the user rejected twice:
- a square-grid halftone at full contrast was "irritating to the eye";
- then: "I don't need it like the halftone".

v1 of the instruments was "good but no wow". v2 added the signature and the drawing standard below.

## Drawing standard (what made it read as crafted)
- **Three line weights:** the limbus fit at 1.6×; instruments at 1×; context faint (0.16–0.32 alpha).
- **A few bright nodes** with a soft halo: the pupil centre, the protractor's zero, the gaze pole, your pointer, the pupil-trace head.
- **Front halves solid, back halves dashed** on 3D rings.
- **Numerals only**, in Geist Mono from a glyph atlas (`0–9 + − . ° :` and a blank). Labels are `max(20·kc, 1.55%·H)` tall at 0.85 alpha.
- **Ink that reads everywhere:** lines are white `#f4f4f2`, turning near-black `#141414` where the plate's luma passes 0.6–0.82 (the white of the eye, the reflected page).

## Layers, back to front
1. **Plate.**
   - Luma with an unsharp mask a pixel out and `lc` 0.75.
   - Gamma 0.74 plus a 30% S-curve; the cornea's page developed to 0.1–0.8.
   - Mapped `#0f0f0f` → `#eeede9`; grain ±3.25% at the film rate; vignette 0.18.
   - Arriving, the exposure settles out of white.
2. **Registration.**
   - Dashed axes through the pupil that are millimetre rulers: a tick per mm (R/6 px), longer every 5 mm, numbered every 5 mm.
   - The opening's dashed box, which folds flat in a blink.
   - Crop marks in the corners; margin dots on the axis's rows.
3. **Corner HUD.**
   - Top left: m:ss.t since arrival.
   - Top right: yaw, pitch and pupil mm, each with a drawn mark.
   - Bottom left: a 6 s pupil trace (32 samples), a tick a second.
   - Bottom right: fixation and blink counts with pictograms.
4. **Geometry.**
   - The pupil fit, and the limbus fit with ticks every 10° (longer every 90°) and a second faint ring.
   - A protractor at 1.45R: ticks every 5° and 15°, its angles set **along the arc** every 30° (`dialText`).
   - **The gimbal (the signature):** the 24 mm globe as three great circles turning in 3D with the gaze. They are the equator plus two rings through the gaze axis, each tipped 28° toward the camera so they read as ellipses at rest. They swing into place on arrival and spin about the gaze axis while hovered.
   - The gaze axis runs to a pole node.
5. **Landmarks.**
   - 12 points built from the live lid opening (canthi, upper margin ×3, lower ×2, crease, brow ×3, under-eye), so they ride every blink.
   - Each has a confidence circle that widens with movement (`1 + 1.6·listen`) and tightens when still, and an elbow callout `nn + xxxx − yyyy` (pixels of a 1080-high frame).
   - A callout that would leave the frame turns back in. Minor callouts drop when R < 7 label heights.
   - Pointing at a landmark inspects it: it is re-acquired and its callout brightens.
6. **You.**
   - A reticle on the pointer (it lags slightly, the tracker's lag), with the visitor's `x − y`.
   - A dashed gaze line from her pupil to it, with its length in mm set along the line.
   - Your **scanpath**: I-DT fixations (dispersion 0.035H, 120 ms minimum, the last 6, fading 8–12 s), numbered with their dwell, joined in order.
   - Your attention drawn as **dotted contours** (isolines every 0.22). Dotted so it never reads as an instrument.
7. **Sign.** Four corner brackets frame the iris at 1.2R, breathing ±2%. On hover they lock to 1.06R and the pupil's mm shows large at their corner. On press they close on the pupil.

## Motion
- **Arrival is acquisition:**
  - the axes draw out (0–0.45 s);
  - a scan ring runs from the pupil to 3.4R;
  - each landmark is acquired as the ring reaches it: a square closes on it, its leader draws, its digits scramble at 24 Hz and then lock;
  - rings sweep round from twelve o'clock.
- **Still 1.5 s:** a dashed line re-measures the frame top to bottom over 1.6 s, then every 6 s.
- **Blink:** the tracker loses the eye, so the fits and readings drop out until the opening is ≥ 1.1R tall.
- **Press, the capture (the one moment of colour):**
  - the crop marks leave the corners and frame the opening;
  - a soft flash;
  - the eye breaks into rows of glassy blocks pushed out from the iris's edge, lit on their tops, with a thin spectral fringe;
  - about 5% of the blocks catch the light at 4 Hz (frozen under reduced motion).
- **Enter:** the blocks run past the frame, then it floods `#fafafa`.

## Data (EyeStage → uniforms)
- `gazeDeg` from the eyeball's rotation; `pupilMm` from the pupil rig.
- `track` (the pointer present within 20 s, touch included) and `listen` (pointer and eye speed, eased up at λ 6 and down at λ 1.2).
- `fix[6]` / `fixN[6]` from `post/attention.ts`; `fixTotal`, `blinks`, `pupilHist[32]` and `spin`.
- `layers` is a lab bitmask for the exploded view. Each layer is a uniform `If`, so a layer switched off costs nothing (that is how its price is read).
- `marks[48]`: the twelve landmarks (position, ring, bracket, leader, label, fades), worked out once a frame on the CPU (`post/measured-marks.ts`, mirroring the shader's sums).
  - The brow's three (8, 9, 10) sit where the brow really is (C4): each is the brow's midline at its mark's x, moved by the frame's bone chain through `twin/brow-net.ts`, projected through the camera (`MarksInput.brow`). They rise in surprise and fall in a frown, readouts and all. The crease and under-eye marks are still fixed offsets.

## Cost (2026-10-28, Radeon 610M, 1440×900)
- The final pass costs 9.6 ms idle and 11.2 ms with a visitor's pointer. 1970's is 2.6 ms.
- It was 31.6 ms (57 ms a frame) when every pixel evaluated all twelve landmarks, the three gimbal ellipses with their `atan`, the dial numerals and the corner readouts.
- Now each is drawn only where it can land (ring bands, callout boxes, ellipse bands, corner boxes), and "you" is skipped without a visitor.
- Per layer: plate 2, registration 2, geometry 3.4, landmarks 2, you 0 to 1.6, sign 0.6.
- Next if needed: the gimbal's per-pixel trig (its ring normals depend on no pixel) can move to the CPU the same way.
