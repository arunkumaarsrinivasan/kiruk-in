---
name: eye-iris-pupil
description: "Build or change the loader eye's iris and pupil: the polar iris bake (fibres over depth, collarette, crypts, furrows, ruff, limbal ring), analytic refraction through the cornea into the iris cone, dilation that bunches fibres instead of scaling, seam-free mips, the post-saccadic wobble, the pupil's shape and interior, Purkinje images and red reflex, and the pupil rig's reflexes (light, near, interest, hippus, flash, enter). Triggers on: iris, pupil, collarette, crypts, fibres, stroma, limbus, dilation, constrict, pupil reflex, hippus, Purkinje, red eye, red reflex, iris bake, refraction, wobble."
---

# Iris and pupil

## Rules
1. **The iris is relief, not a texture.** Wavy fibres sit over dark depth: most of the stroma is the dark between threads ("threads over depth, not a carpet").
   - **Its colour comes from its layers** (R3): a thin border layer dense with melanin over the paler stroma and its blood, over the black epithelium, by Kubelka–Munk in the bake. The two zones (split by the zigzag collarette at ~34 % from the pupil) only tint it. *Why:* painted zones × a fibre lift made pale threads; in a dark iris the fibres are no paler than the layer between them, a crypt's walls are warmer and its floor dark.
   - **The limbus is a ramp,** never a ring darker than the iris: the cornea fades out over its outer 7 %, and the white continues from the iris's own dark through a cool grey. *Why:* a dark ring plus a cut edge read as a drawn outline (the user's eye: a soft ramp over ~0.2 R).
2. **Never paint the era into the iris.** The iris stays dark brown in every era; light and media do the rest. *Why:* a green 1970 iris read as green fur.
3. **Dilation is muscle, not scale.** When the pupil opens, fibres bunch toward the root and furrows deepen; crypts squash. R2 maps every pupil into one bake, after Pamplona 2009: the pupillary zone keeps its area (the collarette follows the pupil), the ciliary zone stretches linearly to the root and thickens as it is squeezed (∝ area^−½). *Why:* the bake is laid out once, so an era change never re-bakes. (The radius bend it replaced, `tRest = tNow^γ`, needed a bake per era's resting pupil: ~70 ms of GPU in every cut.)
4. **The iris is ray-traced, not a mesh.** The view ray refracts at the cornea (R1: twice), hits the iris cone (0.4 mm proud at the pupil, two iterations), converts to polar UV, and is followed down through R2's two layers (stroma floor, fibre shell; T1 takes one parallax step), then shades. *Why:* cheaper than screen-space transmission, and identical on WebGL2.
5. **Bake it, don't compute it.** Two polar maps (angle × radius) per person, `relief` and `colour`, baked once at the person's resting pupil; sets A/B only crossfade a new person in (debounced 120 ms). An era change never bakes. The angle enters the noise as a point on a circle (no seam). Mips come from Tarini's trick: the smaller derivative of `u` and `fract(u)`, taken before any branch.
6. **The caustic crescent sits on the side away from the light**, and a limbal shadow on the near side.
7. **The pupil is never a perfect circle:** `1 + 0.024 sin2θ + 0.015 sin3θ + 0.008 sin5θ`. It is never pure black either: a hole with depth, a faint red fundus, an inner wall on the side the ray heads to.
8. **Purkinje images are traced, never placed** (R4). P3 and P4 follow the view ray past the pupil off Navarro's lens surfaces and out through the cornea to the era's screen, as P1 does (`twin/purkinje.ts` holds the path: P3 upright ×2, 10.8 mm deep, soft; P4 inverted ×0.77, 4.3 mm deep). Brightness is Fresnel's: each is 3.7 % of P1. Never centre them on the pupil or size them by it: a real image's size is fixed by the optics, the pupil only cuts it. *Why:* placed at ~3× their light they read as a second page; a legible page inside a pupil reads as a bug.
9. **The wobble** after a saccade is a spring at 9 Hz, ζ 0.32, ±0.25 mm, strongest mid-iris. *Why:* slower than life, or a 60 Hz frame cannot show it.

## The pupil rig (rig/pupil.ts): every change has a cause
| Cause | Response |
|---|---|
| Screen luminance (era change) | Moon–Spencer `D = 4.9 − 3·tanh(0.4·(logL + 1))`, `logL = −1.6 + 3.2·lum` (≈7.5 mm dark, 2.4 mm white page); 0.23 s latency; constrict fast (5.5/s, capped at 4.2 mm/s), re-dilate slow (1.1/s, capped at 1.1 mm/s); an escape transient |
| Pointer approaching the iris | the near reflex: constricts on the *approach*, not the distance |
| Hovering the iris > 0.45 s | interest: dilates slowly (+0.9 mm at full arousal) |
| Always | hippus: five slow sines summing to ±0.4 mm |
| A flash (2003) | +3.2 logL for 0.06 s, a red reflex that fades in 50 ms |
| Enter | opens toward 98% of the iris ("takes the whole iris") |
| Reduced motion | snaps to target |

- The person's resting pupil scales the whole rig (`rest / 0.34`).
- The medium reads `pupilR` and `pupilMm` only **after** the rig updates each frame.

## Realism pass (R1 limbus, R2–R4): tuning the iris for one era
Phase specs and the per-era table: `references/realism-iris.md`. Shared cards: `../eye-loader-system/references/era-realism.md`.

```
Asked to make the iris more real for one era?
├── B&W era (1970, 1981, 1991, 2026)? → only luminance structure counts:
│     relief contrast, collarette, crypt depth. Don't tune hue.
├── 2013? → the dial's sliders read the fibres' tone: raise radial fibre-against-depth
│     contrast in R2. Never draw on the dial to fake it.
├── Large pupil there (1970, 1995)? → the iris is a narrow ring:
│     the dilation (rest space) and the pupil's interior carry it
└── Colour era → hue under its grade: 1995 lands on ≥ 2 web-safe browns;
      2003 never turns rust at ×1.3; 1997's chroma bleed is the era, not a bug
```

1. **One dark brown iris in every era.** Per-era differences come only from the pupil (the light), the light itself, and the medium.
2. **Signs and fits use the apparent pupil and the elliptic limbus (C4).** Re-shoot every sign after R1 or R4.
3. **No pale fibres on a dark iris.** Structure is relief and a soft sheen. *Why:* white strands read as drawn, which is today's raw look.

## Iris numbers
Layer equations, colours, mask channels and shading constants are in `references/iris-numbers.md`.
