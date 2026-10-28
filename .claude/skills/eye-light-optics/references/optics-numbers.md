# Optics numbers (kiruk-in)

## Lights (look.ts ERA_LIGHT; positions in mm, sizes before ×0.62)
| Era | Device | Key dir | Position | Size | Fill |
|---|---|---|---|---|---|
| 1970 | crt-mono | (0.04, −0.24, 0.97) | (−10, −70, 300) | 1520×1140 | — |
| 1981 | crt | (−0.4, 0.45, 0.8) | (−84, 99, 300) | 1700×1280 | #e9f1ff ×0.32, overhead bar 1100×70 |
| 1991 | crt | (−0.12, 0.28, 0.95) | (−20, 60, 300) | 1560×1170 | #ffc985 ×0.38, lamp disc 150 at (−430, 40, 250) |
| 1995 | crt | (0.05, −0.12, 0.99) | (0, −40, 300) | 1480×1110 | — |
| 1997 | crt | (−0.1, 0.2, 0.97) | (−30, 40, 300) | 1600×1200 | #e6efff ×0.3, office bar 1300×60 overhead, catchlight 0 |
| 2000 | lcd | (0, −0.4, 0.92) | (0, −140, 285) | 1600×1180 | — (from below, night) |
| 2003 | lcd | (0, 0.04, 1) | (0, 10, 300) | 1760×1100 | #fff4e2 ×0.42, window 420×620 right, catchlight 0.35 |
| 2009 | phone | (0, −0.55, 0.84) | (0, −150, 250) | 980×1560 | #ffd9a8 ×0.3, lamp disc 170 up-left |
| 2013 | phone | (0, 0.3, 0.95) | (0, 110, 290) | 1000×1640 | #ffffff ×0.35, tabletop 1600×500 below |
| 2026 | window | (0, 0.1, 0.99) | (0, 40, 320) | 2200×1400 | #f5f3ee ×0.35 from the left |

- Key on the eye = `mix(1, hue, 0.3)·(0.62 + 0.25·lum)`; ambient = `mix(1, hue, 0.5)·(0.07 + 0.1·lum)`.
- Screen luminance = `min(1, lum(bg)·0.7 + lum(panel)·0.2 + lum(accent)·0.2)`, damped at rate 3.

## The page in the cornea, per era (look.ts ERA_LIGHT `reflect`, chosen 2026-10-28)
| Era | Reflection | Detail |
|---|---|---|
| 1970 | whole page ×1.155 | ~60 % of the iris |
| 1981 | as built | the whole page keeps its bars through 1-bit |
| 1991 | key interface | title and first links: [290, 260, 560] |
| 1995 | whole page ×1.107 | ~60 % of the iris |
| 1997 | key interface | nav and content frames (still blows out bright: open) |
| 2000 | key interface | the search box |
| 2003 | key interface | the profile card |
| 2009 | key interface | the iPhone upright (fixes the 3× squeeze) |
| 2013 | as built | the dial hides it at rest |
| 2026 | key interface | the halftone pupil in the pupil |

- **Frames** are `ERA_REFLECT_KEY[era]` = (centre x, centre y, width) in px of the page at 768 wide. `screen-pages.ts` `framePage` cuts them at the device's own aspect (size[0] / size[1]) and holds them still (`pageFramed`, `pageFrameA` / `B`).
- **Phones:** no size in 0.9–1.16 makes the page legible. Still open.

## Screen pass (nodes/screen.ts)
- 768×432 at 24 fps, mipmapped. The 1×1 mip is the key light's colour, read with no readback.
- The real page scrolls at half pace in a triangle ping-pong. Dither runs at 40% on a real page (1-bit would checkerboard its greys).
- Panels: TFT backlight floor (0.042, 0.047, 0.06); IPS (0.014, 0.015, 0.019); OLED crushes below 0.055.
- Cursors at 1.7× life: 1970 block; 1981/1991/1997 arrow; 1995/2003 hand; 2000 caret; 2009/2013 thumb; 2026 none. Block and caret blink at 1.9 Hz.
- Page slots: two texture nodes with `.value` swapped (no recompile). Each slot needs its own placeholder texture, and every load bumps `version` or the swap is never seen.

## Cornea (nodes/cornea.ts)
- A conic dome (R 7.8 at the apex, Q −0.25), laid onto the 7.8 mm ball's cap in the vertex stage; analytic normal. Apex 12.99 mm in front of the globe's centre; limbus 5.9 (R1).
- Refracts twice: into the cornea (1/1.376) at the front, out at a 6.5 mm back sphere 0.55 mm behind the apex (1.376/1.336); one refraction stands in where the back surface is missed or reflects whole. Pupil plane 3.6 mm behind the apex: it appears 3.04 mm deep at ×1.13.
- The clear dome shows as an ellipse (`ce`, y ÷ 0.906): 11.7 × 10.6 mm. Mask, limbal shade and rim follow it; the optics (`cd`) stay round.
- Dispersion: R ×1.07 and B ×0.93 toward the rim.
- Roughness/mip = `(cd³·3.2 + 0.45 + r2²·0.8 + |tear|·1.1 + dry·2.4)·(1 − 0.5·blown) + U.mip`.
- `blown = smoothstep(0.3, 0.92, lum)`; Reinhard `x/(0.9x + 1)` at blown·0.8; contrast `(x − 0.5)·1.5 + 0.42` at blown·0.7.
- Reflection strength `k = reflect·(0.86 − 0.22·lum)·(3.6·fres + 0.7)·…·0.5`, with reflect 0.7. The reflection screens over the iris.
- P2 Purkinje ×0.05.
- Glass streak top-left: width 0.06, strength `0.09 + 0.13·lum`.
- Fills show in the cornea by `catchlight` (0..1, default 1): 1997's bar 0, 2003's window 0.35. The flash catchlight belongs to the `flash` lens artefact (none since batch 2). Thin film on T3 only.

## Tears (bake/tear.ts, nodes/meniscus.ts)
- Film: R thickness, G lipid, B weak spots. 128² at 30 Hz (T2), 256² at 60 Hz (T3), static (T1). Fragment ping-pong through a scratch target.
- Creep `0.6·exp(−sinceOpen/0.5)`. Thinning `smoothstep(0.5, 0.74, B)·0.085 + 0.018` per second. Fresh lay-down while the blink is > 0.85.
- Meniscus width `0.22·(1 + 1.2·tearing)·(1 + 0.25·fresh)`, ×2.6 at the lake. Strength `mix(0.5, 1.3, lower)` (R6: the lower bead is the brightest line on the user's eye, ~20 L* over the rim; 0.9 left it +8). Its globe side sits on the cornea where the cornea is under it (`corneaLift`).

## Lens (look.ts ERA_LENS); clean default: grain 0.04, size 1.4, vignette 0.3
| Era | Values |
|---|---|
| 1970 | grain 0.075 / 1.9, halation 0.65, vignette 0.5, sat 0.04, isolate, phosphor, film, bloom 1.4 |
| 1981 | grain 0, halation 0.22, sharpen −0.5, wb −0.1, comet, bloom 1.35 |
| 1991 | grain 0, split 0.6, sat 1.1, gamma 0.96, wb 0.08 |
| 1995 | grain 0, chroma 0.35 |
| 1997 | grain 0, wb −0.12, gain 1.15, gamma 0.92, sharpen 0.35, interlace 0.6 |
| 2000 | grain 0.03, chroma 0.35, wb −0.3 (CCD off) |
| 2003 | grain 0.04, vignette 0.15, lift 0.02, flash |
| 2009 | grain 0.07, wb 0.45, sharpen −0.35, flare 0.45 |
| 2013 | grain 0.02, lift 0.03, wb 0.1, sat 0.95, vignette 0 |
| 2026 | grain 0 (the medium adds its own), sharpen 0.4, sat 0, aperture 0.8 |

## DOF and bloom
- DOF: CoC `(focus − depth)/focal`, focal 9 mm; reach `bokeh·(H/720)·0.5`, bokeh 2.8·aperture.
- Bloom `(emissive, 0.25, 0.4, 0.42)` at 0.25 resolution, strength 0.25·lens.bloom.
- Room falloff `mix(0.38, 1, smoothstepDown(0.8, 0.22, vr))`, vr aspect-weighted ×1.22. White-page stop-down ×(1 − 0.34·blown).

## Screen captures (scripts/eye-screens.mjs)
- Headless Chrome at 1280×720. Seeds `portfolio-theme`, `portfolio-theme-selected` and `kiruk-loading-seen` so the page loads as a returning visitor.
- Waits 7 s, captures up to 3 viewports at scale 0.6, writes WebP at 768 px wide, q80.
