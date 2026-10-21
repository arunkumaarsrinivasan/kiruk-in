---
name: eye-iris-pupil
description: "Build or change the loader eye's iris and pupil: the polar iris bake (fibres over depth, collarette, crypts, furrows, ruff, limbal ring), analytic refraction through the cornea into the iris cone, dilation that bunches fibres instead of scaling, seam-free mips, the post-saccadic wobble, the pupil's shape and interior, Purkinje images and red reflex, and the pupil rig's reflexes (light, near, interest, hippus, flash, enter). Triggers on: iris, pupil, collarette, crypts, fibres, stroma, limbus, dilation, constrict, pupil reflex, hippus, Purkinje, red eye, red reflex, iris bake, refraction, wobble."
---

# Iris and pupil

## Rules
1. **The iris is relief, not a texture.** Bright wavy fibres sit over dark depth: most of the stroma is the dark between threads ("threads over depth, not a carpet"). Colour lives in two zones split by a zigzag collarette at ~34% from the pupil, never in noise.
2. **Never paint the era into the iris.** The iris stays dark brown in every era; light and media do the rest. *Why:* a green 1970 iris read as green fur.
3. **Dilation is muscle, not scale.** When the pupil opens, fibres bunch toward the root and furrows deepen; crypts squash. Remap the radius (`tRest = tNow^γ`, γ = clamp((pupil − rest)·2.2 + 1, 0.6, 2.2)), following Pamplona 2009.
4. **The iris is ray-traced, not a mesh.** The view ray refracts at the cornea sphere (IOR 1/1.336), hits the iris cone (0.4 mm proud at the pupil, two iterations), converts to polar UV, takes one parallax step, then shades. *Why:* cheaper than screen-space transmission, and identical on WebGL2.
5. **Bake it, don't compute it.** A polar map (angle × radius) per person, two sets A/B to crossfade, rebaked off screen and debounced 120 ms so a sweep bakes only where it lands. The angle enters the noise as a point on a circle (no seam). Mips come from Tarini's trick: the smaller derivative of `u` and `fract(u)`, taken before any branch.
6. **The caustic crescent sits on the side away from the light**, and a limbal shadow on the near side.
7. **The pupil is never a perfect circle:** `1 + 0.024 sin2θ + 0.015 sin3θ + 0.008 sin5θ`. It is never pure black either: a hole with depth, a faint red fundus, an inner wall on the side the ray heads to.
8. **Purkinje images inside the pupil stay small and dim** (P4 inverted ×0.035, P3 ×0.02). *Why:* a legible page inside a pupil reads as a bug.
9. **The wobble** after a saccade is a spring at 9 Hz, ζ 0.32, ±0.25 mm, strongest mid-iris. *Why:* slower than life, or a 60 Hz frame cannot show it.

## The pupil rig (rig/pupil.ts): every change has a cause
| Cause | Response |
|---|---|
| Screen luminance (era change) | Moon–Spencer `D = 4.9 − 3·tanh(0.4·(logL + 1))`, `logL = −1.6 + 3.2·lum` (≈7.5 mm dark, 2.4 mm white page); 0.22 s latency; constrict fast (5.5/s), re-dilate slow (1.1/s); an escape transient |
| Pointer approaching the iris | the near reflex: constricts on the *approach*, not the distance |
| Hovering the iris > 0.45 s | interest: dilates slowly (+0.9 mm at full arousal) |
| Always | hippus: four slow sines summing to ±0.3 mm |
| A flash (2003) | +3.2 logL for 0.06 s, a red reflex that fades in 50 ms |
| Enter | opens toward 98% of the iris ("takes the whole iris") |
| Reduced motion | snaps to target |

- The person's resting pupil scales the whole rig (`rest / 0.34`).
- The medium reads `pupilR` and `pupilMm` only **after** the rig updates each frame.

## Iris numbers
Layer equations, colours, mask channels and shading constants are in `references/iris-numbers.md`.
