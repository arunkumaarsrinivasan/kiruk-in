---
name: eye-era-media
description: "Build or change an era's medium for the loader eye: the post shader that repaints the finished eye frame in that era's picture technology (phosphor, 1-bit, four greys, web-safe, 16-bit, TN panel, CCD, phone filter, a component system, a measured plate). Covers the shared medium kit, the order of operations, keeping the face's detail, quantisation without moiré, and the per-era recipes. Triggers on: era medium, medium shader, era-medium.ts, medium-kit, dither, halftone, quantise, posterize, scanlines, phosphor, web-safe, ways of seeing, era look, 1970, 1981, 1991, 1995, 1997, 2000, 2003, 2009, 2013, 2026."
---

# Era media: one frame, ten picture technologies

The scene renders one realistic eye. The medium is a final full-screen pass that reads that finished frame as a texture and repaints it. One era's branch runs per frame (`M.cur` is a uniform; the same for every pixel, so the branch is free).

## The input the medium gets

- The finished frame, **display-encoded (gamma 1/2.2), 8 bits a channel, mipmapped**, as a texture. *Why:* every medium works in display values (that is what screens quantised); 8 bits halves bandwidth against half-float and needs no decode per tap; the mips are a free blur for frost and for reading a cell's mean.
- Its **alpha is depth**: 0.5 at the focal plane, ±20 mm mapped to 0..1, near = 1. Use it for elevation, shadows and parallax.
- Every sample in a branch names its level: `tex.sample(uv).level(n)`. *Why:* implicit derivatives are undefined inside non-uniform branches.
- Output is linear: wrap the result in `lin()`.

## Order of operations inside a branch (always)

1. **Scale.** Everything is sized in reference pixels at 1440×900 and multiplied by `kc = irisPx / 245`. Grids use `cellPx(n)` (whole device pixels); strokes `px(n)` (≥ 2 px); hairlines `hair(n)` (≥ 1 px). Never size anything in raw device pixels. *Why:* the GPU watchdog changes the pixel ratio, and a fractional or device-px pitch beats into moiré.
2. **Anchor grids on the eye**, `floor((p − e) / cell)`, where `e` is the globe's resting centre. *Why:* a saccade never drags the grid; a screen-anchored grid crawls over the face.
3. **Develop the tone** before quantising: `develop(l, E, Ec, cornea)` pushes the dark face up by `E` and holds the page in the cornea in the middle greys (0.12..0.9). *Why:* a dark face on a dark ground dithers to nothing, and a bright reflected page blows out to a white disc.
4. **Restore local contrast** with `lc(L, mean, g)` against a few taps at ±2 cells, stronger over the cornea. *Why:* quantising flattens the lid line, lashes and limbus first.
5. **Quantise** in the era's palette, with an ordered dither fixed in screen space. Add `+1/128` (bayer8) or `+1/32` (bayer4) to the threshold. *Why:* a threshold of 0 leaves one lit cell in 64 in the blackest ink, a screen-door lattice.
6. **Draw the sign** (eye-interaction), clipped by `almond()` so the lids close over it, and faded in through the era's own dither (`dissolve`), never alpha. *Why:* a grey fade leaves a 1-bit or 4-grey palette.
7. **Departure / arrival / enter** (eye-era-cut) in the era's own physics.

## The kit (post/medium-kit.ts)

| Helper | What it gives |
|---|---|
| `F` (MediumFrame) | pixel `p`, `size`, `H`, `kc`, globe centre `e`, iris centre `pc`, iris radius `R`, `pupilR`, lid reach `apX` (medial, lateral) and `apY` (upper, lower; signed, from the real lid angles this frame) |
| `almond(F, p, k)` | 1 inside the lid opening (scaled by k), soft edge, **0 past the corners** (`× smoothstep(0, 0.04, sx)`; without it a full-width line appears at eye level), closes fully in a blink. Both margins come down to their canthus (`F.apC`, from the twin's `canthi()`: both corners sit under the globe's centre since R6), and `apX` is where the lids really meet, not FISSURE_MM |
| `cornea(F, p)` | the iris disc inside the opening |
| `develop`, `lc`, `luma`, `lin`, `disp`, `hex` | tone and colour |
| `bayer2/4/8`, `hash` (Hoskins, no sin), `dissolve` | dither, noise, dithered fades |
| `px`, `cellPx`, `hair` | sizes |
| ease functions | `easeOutCubic`, `easeInCubic`, `easeInQuad`, `easeInOutSine` |

Values used by more than one branch (`kc`, `e`, `pc`, `R`) are built once *before* the `If` chain and pinned with `.toVar()` (eye-tsl-craft).

## Quantisation decision tree

```
Is the era a 1-bit or few-level display?
├── Yes → cells of cellPx(3–4), develop, lc, ordered dither, ink edges as strokes (1981, 1991)
└── No
    ├── A fixed palette (web-safe, 16-bit)? → per-channel levels with bayer4 (1995) or bit depth (1997)
    ├── A panel or camera? → a grade: black floor, gamut, curves, falloff; no cells (2000, 2003, 2009)
    ├── A component system? → a quadtree of parts sized by detail (2013, references/2013-system.md)
    └── A measured plate? → B&W plate plus instruments (2026, references/2026-measured.md)
Does a pattern sit on skin mid-tones near 50%?
├── Yes → rotate it 45°, use round spots, a finer pitch, ink spread; never a square grid at full contrast
└── No → fine
```

## Quality gates (check every era, every change)

- **Detail:** at rest, brow hairs, lashes, lid fold and the page in the cornea are readable at 1:1.
- **No moiré** at DPR 1, 1.5, 2 and on a 390×844 phone. 1970's scanlines are never finer than 3.46 device px (phones aliased).
- **No black holes:** shadows never crush to pure black on dark skin; lift darks the way 1970's tone curve does.
- **Eye reads as an eye:** the iris stays darker than the skin round it; the reflected page never fills the iris.
- **The surround is the device's physics,** never a shape: no frame, ring, card, inset or vignette that reads as a border. (2013's lens vignette was set to 0 because it read as a frame.)
- **Compile cost:** a new branch adds less than ~150 KB of WGSL; components and helpers are `Fn().setLayout` functions (eye-tsl-craft).

## Realism pass: what the media read, and what to re-check
Reference: `references/realism-through-media.md` (per-phase re-check list, per-medium floor, kit changes).

1. **When a realism phase lands, re-check the branches that file lists for it,** at rest and mid-cut.
2. **The kit reads the eye you see:**
   - the apparent iris (`F.R`, `pupilR`);
   - the elliptic limbus (`F.Rx`, `F.Ry`, `limbus()`);
   - the twin's margin samples;
   - the real crease and brow points.

   Never re-derive a feature's position from a formula inside a medium. *Why:* the guessed `almond()` and 2026's fixed landmark offsets drift as the eye gets more real.
3. **Every era's medium declares `floorPx`** (about two cells). The scene fades micro-detail to it, so nothing speckles the ink or crawls in the rows.
4. **Never retune a medium to hide a realism regression.** Fix the eye, or log the conflict in the plan's drift log.

## Per-era recipes

See `references/era-recipes.md` for every era's medium, sign and cut in one table, and the two system-scale eras:
- `references/2013-system.md`: the face built from UI components.
- `references/2026-measured.md`: the plate under live instruments.
