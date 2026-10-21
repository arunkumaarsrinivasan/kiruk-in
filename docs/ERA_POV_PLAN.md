# Ten POVs -- the loader eye, era by era

> Status (2026-10-21): designed by a 9-agent workflow (research, three competing concepts, three judges, synthesis); all three judges independently chose the blink cut.
> **Built:** batch 0 (every era full bleed: the 1991 page and border, the 1997 bevel, the 2000 box, the 2003 inset and floor and the 2009 border are gone) and batch 1 (the director, the kit, the EyeStage hook, the 1970 refinements, 1981, 1991, 1995). Not committed.
> **Also built (2026-10-21, second pass):** 2013 and 2026 from batch 3.
> **2026, v2 of "measured" (same day):** added the gimbal, a protractor dial, mm rulers, elbow callouts, scan acquisition, feature inspect, attention contours, the corner HUD and capture framing (`post/measured.ts`).
> **2026, fourth pass (2026-10-21): "measured".** The halftone is replaced on the loader. The spec is `docs/ERA_2026_MEASURED_PLAN.md` and the storyboard is `docs/era-pov/2026-measured-storyboard.png`.
> **Next:** batch 2 (1997, 2000, 2003), then 2009. Then recapture the posters (lab "Capture all eras", or `window.__eyeCapture(undefined, ["wide","tall"])`).

## Drift log (built vs. this spec)
| What | Spec | Built | Why |
|---|---|---|---|
| 1981 tone | dither with a 1-in-8 paper speck in flat darks | shadows fall to ink (`smoothstep(0.1, 0.86)`), no speck floor | the whole frame is skin: the speck floor read as a screen-door dot lattice |
| 1981 desk | 50% checker while painting/clearing | 25% pattern | a black→50% grey jump flashed between eras |
| 1991 underline | `#000`, from a guessed almond curve | `#AAA`, on the lower margin as the lids really stand (lid angles from EyeStage) | black vanished on dark skin; the guessed curve floated below the rim |
| `develop()` cornea range | 0.15..0.75 | 0.12..0.9, normalised | the reflected page kept too little contrast to read |
| 2000 (batch 0) | CCD artefact 0.6 | artefact off; TN black floor; caret in the pupil (blinks 5 s, then holds) | the CCD smear's ghost copies and shadow blocks showed once the box stopped cropping them |
| Reduced motion | 240 ms crossfade from a held frame | a plain cut | the held-frame copy is not built yet |
| Scrubbing | `travel(pos)`: the hand works the lid | not yet: each era change is a step, coalesced | needs `immersive-era-loading-page.tsx` (another session's file) |
| CSS cursors per era, longer enter | in the loader | not yet | same |
| Review pass (66 agents: 5 reviewers, 61 findings, each checked by a skeptic; 45 held) | — | fixed: the loader's held lids could lose to the cut (eras swapped with the eye open) → the more shut lid wins; natural blinks run under a cut instead of replaying; reduced motion rate-limited (2.5 cuts/s) with hover/press still live; going in mid-cut finishes on the era asked for; re-cut departs from 0; signs ease and hold on while entering; press cancels on drag (touch waits 100 ms); 1981's arrow stays for touch; reflex tears counted per request; glance relative to the gaze; screen + page land whole behind shut lids, and the cut waits (≤150 ms) for the page; `almond()` uses signed margins (closes fully); whole-pixel dither cells; 1970 scanlines never finer than 3.46 px (phones aliased); signs clipped by the lids and dissolved through each era's dither; 1981 cut paints onto ink with a checker write head (no grey flash), cornea page capped at ~⅔ paper, solid ink arrow with paper halo; 1991 underline white, on the rim (×0.84), draws on at READY; 1995 sparkle in coarser cells, webcam artefact off, shadow mask ≥1 px stripes; the medium reads an 8-bit display-encoded frame (no decode per tap); 2009 flare at 0.45 | see `scratchpad` review in the session |
| 2013 (built 2026-10-21) | frost from a quarter-res Gaussian `soft` target; vibrancy mix 0.32; frost ≤75%; clear zone almond ×1.25; ring 35% / 70% near | frost from the medium texture's own mips (4 taps of level log2(10·kc); no extra pass); vibrancy mix 0.6; frost 82%; clear zone a soft almond ×1.05–1.38; ring 50% / 80% near; gaze rest and targets changed to the selfie's, `follow` left as it was (question 3) | the spec's 0.32 left the dark face a muddy grey under the glass; the wider clear zone showed a dark halo of lid skin; the 35% ring could not be seen |
| 2026 (built 2026-10-21) | attention = almond ×1.25 or r < 2.2R; ink = 1 − (0.06 + 0.88L); grids by distance from the eye | grids by distance on the eye's oval (x × 0.45); attention = the opening + a lid band (almond ×1.12 inside the corners) + an 18% trace within 2.4R; ink = smoothstep(0.1, 0.92, 1 − L); a dot of no size paints nothing; the faintest dots drop out; the sphere for going in has pitch H/34 | the dark face filled the attention disc with black dots and the eye was lost; the corners fell into the coarse grids (big blobs); every cell left a grey speck on the paper |
| 2013 and 2026, second pass (user: "show all the details like 1970, not removing all") | — | 2013: no frost at rest; the whole face crisp (unsharp mask), high key (γ 0.7) and neutral to cool, so it never reads as 2009's warm fade; the frost appears only in the cut (arriving: a frosted sheet lifts off the top, easeOutBack; leaving: it mists over). 2026: one fine grid (c0 = R/30, at least 3 px) over the whole face, no attention mask; the darks stretched by √L as 1970 stretches them, ink = smoothstep(0.03, 0.97, 1 − L) | the frost and the dissolve hid the face; the detail is the point |
| 2026, third pass (user: "keep 2026 as before but the dots are too irritating for the eye; we need a unique interaction for the age of AI") | dots on a square grid; ripple once on approach | the halftone kept over the whole face, made calm: a 45° screen (where the eye notices a pattern least, as print sets its black) of round Euclidean dots that grow into each other, a fine pitch (R/52, about 4.7 px at 900p), 30% ink spread softening the edges, soft black #1b1b1b on warm paper #efede8, the darks lifted by L^0.7; every pixel reads the face. **It listens:** while the pointer or finger moves, soft rings run out from the pupil through the dots (`U.medium.listen`, the pointer's speed eased up fast, down slowly), gone when it stops; one clearer ring when the pointer first comes near. **The Pupil:** the 2026 home's halftone sphere waits in the pupil and breathes slowly; on hover the iris resolves into a screen twice as fine; pressed, the sphere pulses (thinking); going in, it grows out over everything. Arrival: generated out of per-pixel noise, the centre first | the square grid at full contrast vibrated; the mid-tones near 50% made a checkerboard |
| 2026, fourth pass (user: "in 2026 we track everything and measure data… measure and react based on the movement; not like the halftone") | the halftone that listens | **2026, measured** (`docs/ERA_2026_MEASURED_PLAN.md`). A clean B&W plate (an unsharp mask, γ 0.72, grain ±3.5%) under white instrument lines that turn dark over white. The lines are: the axes, the opening's box and margin dots; the pupil and limbus fits with degree ticks; orbits at R·φ, R·φ², R·φ³; 12 numbered landmarks riding the lids, each with a confidence circle that widens with movement, and their `n + x - y` labels from a Geist Mono glyph atlas (`post/readout.ts`); the eye's yaw, pitch and pupil mm; the visitor's reticle, gaze line and scanpath (`post/attention.ts`, I-DT fixations); a re-measure sweep when still; lock-on brackets as the sign. Press captures the eye into glassy blocks (ref 4); enter runs them out and floods to #fafafa. The instruments construct themselves on arrival | the user's references (an orbit diagram, construction circles, a measured eye, a voxel eye) |
| Open from the review | — | the loader's black right gutter (`inset-x-0` vs `100vw`, in `immersive-era-loading-page.tsx`); per-era page ceiling for 1991; a shared tap radius with the loader | other session's file / later batch |


## The idea

You stand where each era's screen stood and look back at the one person using it. 1970 works because four things agree. The tube's glow is the only light on her face, the camera is tuned to that glow, the tube's picture fills the frame edge to edge, and a cursor waits in her pupil to say "type here". From now on every era gets all four: its own device lighting the face, a lens tuned to that light, its own picture technology filling the whole frame with no border, and its own sign in the pupil that says "this opens".

Read in order, the ten slides show a machine learning to see a person:
- 1970: blind; it knows only keys.
- 1981: one point, your hand.
- 1991: stills.
- 1995: grey video.
- 1997: your hover.
- 2000: your typed words.
- 2003: live colour.
- 2009: your finger.
- 2013: your body.
- 2026: it looks back at you.

Between slides the person blinks. The old screen switches off as the lids close and the new one switches on as they open, so every cut is the eye's own. Dragging works the eyelid by hand, and tapping the iris falls through it into that era. Nothing on the loader is a word, a border, or a hint of the era next door.

## Rules

1. **Full bleed.** The medium paints every pixel. Nothing goes around the eye: no inset, page, border, box, photo frame, wet floor, bevel or rounded card. The only edge in the whole deck is 1970's tube glass, because the glass is the medium.
2. **The surround is the device's own physics, never a shape.** Each era's world:
   - 1970: dark room and phosphor
   - 1981: ink and paper
   - 1991: NeXT black
   - 1995: navy night
   - 1997: CD-ROM brown
   - 2000: cold panel black
   - 2003: daylight
   - 2009: walnut
   - 2013: frost
   - 2026: paper

   Surround treatments are tonal, follow the image, and are never rectangles or rings.
3. **Light first.** Every era has an `ERA_LIGHT`, so its own screen lights the face and shows in the cornea. Its `ERA_LENS` is tuned to that light. Every era that quantises (1981, 1991, 1995, 1997, 2026) runs with lens grain 0, because the dither is the grain.
4. **The eye stays the hero.**
   - Every quantising era runs `develop()` first, so the reflected page in the cornea lands mid-tone instead of blowing out to a white blob.
   - Same person, same dark-brown iris (never recoloured), same framing in every era.
   - Direction of travel and the person's distance from the device are told by gaze, light, focus and the shape of the reflection, never by moving the camera.
5. **Five interaction moments, each in the era's own grammar.**
   - **Rest:** a sign that is visible without hover, so phones have it too.
   - **Hover:** desktop only.
   - **Press on the iris:** feedback the moment the pointer goes down.
   - **Release on the iris:** enter. Action happens on release.
   - **Release off the iris, or drag more than 6 px:** cancel.

   Signs live in or on the iris and pupil and never grow larger than the iris, except while pressing or entering. Each era's sign is its own; none repeats.
6. **Calm.**
   - At rest nothing moves except the era's one slow sign, the eye itself, and grain stepped at 12–18 fps.
   - Dither fields are fixed in screen space, and anything random is static or stepped at 18 fps or slower.
   - Nothing scales or breathes at rest, and only the enter moment zooms.
   - At most 2.5 large luminance cuts per second (WCAG 2.3.1).
   - Sign clocks keep running under reduced motion, where signs show steady instead of disappearing.
7. **No words, numbers, glyphs or ASCII. No sight of a neighbouring era at rest.** Direction exists only inside a cut, carried by the saccade.
8. **One era per frame.** `M.cur` is a uniform, so one shader branch runs. The only exception is the reduced-motion crossfade, which mixes in one held frame.
9. **Sizes are given in px at the 1440×900 reference.** In code they are scaled by the iris (`kc`), with a 2-device-px floor. No pattern is ever specified in device pixels: the watchdog changes the pixel ratio, which would make such patterns moiré.
10. **No permission prompts.** Tilt is used on Android only.

Deliberately not built (from the judges' kill lists):
- 1991: frozen stills, and a blue iris.
- 1997: bevel or emboss rings, the CD sheen, damper wires, the aperture grille.
- 2000: temporal FRC and the backlight-bleed band.
- 2009: a focus square held at rest, and the glint sweep.
- 1981: the outline rectangles, and a checker periphery.
- 1995: twinkling stars and colour-cycling sparkles.
- 2026: a fovea that follows the pointer.
- Transitions: seam wipes, a light-lead wash at the edge, hard cuts with open lids, extra mechanical shutters stacked on every cut.
- 1970: persistence trails, and the CRT power-off as the enter.

## Era cards

**The shared kit**, referenced by every card. It lives in `post/medium-kit.ts`, and each helper is called inside the era's branch, never hoisted above it.

**Scale and position**
- `kc = irisPx / 245`. This is 1.0 at 1440×900 and about 0.45 on a 390×844 phone at DPR 1.5.
- `px(n) = max(n·kc, 2)` device px, and `hair(n) = max(n·kc, 1)`.
- `R = M.irisR·H`, the iris radius.
- `pc = M.pupil·size`, the live iris centre.
- `e = M.eye·size`, the resting eye centre.
- `aw, ah = M.aperture·H`, the fissure's half-width and half-height, already including the blink.

**Masks**
- `almond(p, k)` is 1 inside the lid opening scaled by k. With `q = (p − e)/(k·aw, k·ah)`, `a = |q.y| − (1 − q.x²)^0.75`, and `almond = 1 − smoothstep(−0.04, 0.06, a)`.
- `cornea(p) = (1 − smoothstep(0.92R, 1.04R, |p − pc|)) · almond(p, 1)`.

**Tone**
- `develop(d, E, Ec)`: with `l = luma(d)` and `s(x) = x(1 + x/4)/(1 + x)`, `L = mix(s(E·l), 0.15 + 0.6·s(Ec·l), cornea(p))`. Colour eras then scale RGB by `L/max(l, 1e-3)`.
- `lc(L, m, g) = L + g·(L − m)`, where `m` is the developed luma of n taps at ±2 cells.

**Clocks and helpers**
- `sign`: the era's blink or pulse, computed from `M.clock`, times `M.signA` (the ready fade-in). When `M.steady` is 1, the sign holds its "on" value.
- `bayer2/4/8` and the Hoskins `hash` are reused from `era-medium.ts`.

---

### 1970: Terminal and phosphor (the benchmark: refine, don't redesign)

- **POV:** a DEC terminal about 60 cm away, a little below the eyes, in a dark room. The machine is blind: all it can do is light you.
- **Light:** `ERA_LIGHT`, `ERA_LENS` and `ERA_GAZE` are unchanged, and so is its gaze follow.
- **Medium (unchanged on desktop):** barrel 0.07, 8-tap bloom at 0.006H, scanlines, glass inset 0.028H, corner radius 0.075H. Two refinements:
  - **Row pitch** becomes `rows = H / max(3.46·kc, 2)` instead of a fixed 260. This is identical on every desktop and gives a phone iris about 55 rows per radius instead of 22.
  - **The cursor** reads `M.clock` instead of `U.time`, with the same 1.05 Hz phase and the same rectangle (half-width 0.2·pupilR, half-height 0.36·pupilR). Under reduced motion it shows steady instead of vanishing.
- **Surround:** kept: black glass falling to green-black, with tube corners and bloom.
- **Interaction:**
  - **Rest:** the block cursor blinks in the pupil.
  - **Hover over the iris:** the cursor stops blinking and holds lit (the line has focus).
  - **Press:** the block grows into the pupil disc in 90 ms (easeOutQuad) at `#9EFF85`, with the bloom ×1.3: the key is struck.
  - **Scrub:** `signA` goes to 0 and the cursor hides.
  - **Enter:** the cursor holds lit while the pupil dilates (the existing rig). The pupil's black becomes the terminal's black, so you land on the 1970 home's prompt. Flood `#000000`.
- **Arrival: warm-up, 420 ms.** The tone exponent eases from 2.2 to 0.85 (easeOutCubic) and the bloom radius from 1.6× to 1×. The scanline structure is lit from the first frame and the image rises into it. The frame's size never changes.
- **Departure: raster collapse, 200 ms, in step with the closing lids.**
  1. 0–110 ms: `y' = e.y + (y − e.y)/(1 − 0.97·easeInQuad(dep/0.55))`. Source rows that fall outside the frame are black.
  2. 110–160 ms: a 2 px line at 1.5× brightness on the eye's line shrinks horizontally to a dot at `pc.x`.
  3. 160–200 ms: the dot fades as `exp(−t/40 ms)`.
- **Phone:** the cursor is at least 6×11 CSS px.
- **Cost:** 9 taps, unchanged. The collapse and press are arithmetic.
- **Risk:** the collapse could read as "it switched off". That meaning is right for leaving an era, and entering keeps the cursor lit. Acceptance test: a pixel diff against `bf3cd45` at rest, with the cursor rectangle masked.

### 1981: Xerox Star 8010

- **POV:** the Star's 17" paper-white bitmap, 55 cm away, up and to the left, under overhead tubes. The machine sees one point, your hand.
- **Light:** `ERA_LIGHT` unchanged (CRT plus tube fill). `ERA_LENS`: grain 0.045 → **0**; comet and halation 0.22 kept. `ERA_GAZE`: `scatter`, `follow: 0.85`, `fixMs: 500`.
- **Medium (5 taps). The fix is an etching:**
  1. Cell `px(3.4)`, anchored to the screen origin; sample at the cell centre.
  2. `L = develop(E 1.6, Ec 0.45)`. The reflected Star page lands at 55–75% grey, so its windows survive as 1-bit.
  3. `m` = the developed luma at ±2 cells horizontally and vertically (4 taps). `L' = L + 0.8·(L − m)`.
  4. **Ink rule:** where `L' − m < −0.12` the cell is solid ink, so lashes, lid line, limbus and brow hairs are drawn strokes. Everywhere else, `paper = step(bayer8(cell), max(L', 0.125))`, so flat darks keep a 1-in-8 paper speck and read as a surface.
  5. Ink `#101012`, paper `#F1EFE8`.

  This keeps the dark ground and **is not high-key**. Monk-9 skin lands near 50% and dithers into the Star's own grey pattern, so nothing is painted over it.
- **Surround:** the face as a 1-bit etching. Lit skin is Star grey, shadows are ink with sparse paper specks.
- **Interaction:**
  - **Rest:** the 1-bit arrow parked on the pupil (`arrowAt`, offset (5, 3) cells), multiplied by `(1 − M.ptrOn)·signA`. It shows always on phones, and on desktop after 2.2 s idle, so there is never a second arrow beside the visitor's own.
  - **Pointer present:** the parked arrow fades out in 120 ms, and over the iris the CSS cursor becomes a 16×16 1-bit Star arrow PNG.
  - **Hover:** nothing; the Star had no hover.
  - **Press on the iris:** cells inside `|p − pc| < R` XOR-invert instantly, the Star's selection by inversion.
  - **Drag off:** un-invert.
  - **Release on the iris (enter):** the inverted disc grows from R to the frame's diagonal in 300 ms (easeInCubic), its edge stepped to the cells. This is the icon expanding into a window, without drawing a window. Flood `#F1EFE8`.
- **Arrival: two interlaced fields, 300 ms.** Even cell rows paint top to bottom over 0–150 ms, then odd rows over 150–300 ms. Rows not yet painted show a 1-cell 50% checker (the Star's grey desk), which is only ever visible in motion.
- **Departure, 130 ms:** under the closing lids, one field sweep clears the bitmap to the checker, top to bottom, over dep 0.4–1.
- **Phone:** cells floor at 2 device px. The arrow is drawn 1.5× its cell size when `kc < 0.7`, so it is at least 14 CSS px.
- **Cost:** 5 taps.
- **Risk:** the etching could still read as "too light". Show an A/B against today's 1981 in the lab, side by side.

### 1991: NeXT MegaPixel, the first web page

- **POV:** a NeXTstation's 17" display at 92 dpi, 60 cm away, in neutral office light with a warm desk lamp low on the left. The machine sees in stills: 128² grey frames.
- **Light:** `ERA_LIGHT` unchanged (CRT plus round lamp fill). `ERA_LENS`: grain 0.04 → **0**. `ERA_GAZE`: `read`, `follow: 0.35`.
- **Medium (3 taps). Delete the white page, the inset and the blue border:**
  1. Cell `px(2)`. `L = develop(E 1.35, Ec 0.5)`, then `lc(0.5)` from 2 taps at ±2 cells horizontally.
  2. Exactly four greys: `v = floor(L·3 + bayer4(cell)·0.98)/3`, which maps to `#000000 #555555 #AAAAAA #FFFFFF`.
  3. `L < 0.04` goes flat to `#000`, so the dark room has no dither noise.

  The lamp survives as a split-lit black-and-white portrait: one cheek in `#AAA`/`#FFF`, the other in `#555`/`#000`.
- **Surround:** NeXT black.
- **Interaction:**
  - **Rest: the iris is the page's one link.** A link underline lies on the lower lid's wet rim:
    - one NeXT pixel tall (`px(2)`), `#000`;
    - it follows the almond's lower curve, `y = e.y + ah·(1 − ((x − e.x)/aw)²)^0.75 + px(2)`;
    - it is limited to `|x − pc.x| < R`.

    It rides the lid through blinks.
  - **Hover:** the underline thickens to `px(4)`, and the iris's `#000` lifts to `#555` (NeXT's grey selection). The CSS cursor is the default arrow.
  - **Press:** the iris inverts within its four greys (`v → 1 − v`).
  - **Release (enter):** a new window draws down. Rows above `H·easeInOut(enter/0.36 s)` turn `#FFFFFF`. Flood `#FFFFFF`.

  1991 stays four greys: active red and visited purple belong to 1995.
- **Arrival: refresh sweep, 440 ms (easeInOutSine).** Rows above the sweep show the full picture. Rows below show the same frame at cell `px(8)`, a 128-line still being delivered. No line is drawn; the change of resolution shows the boundary.
- **Departure, 120 ms:** the four greys drop to two (`#000`/`#FFF`, threshold 0.5) once dep passes 0.3.
- **Phone:** the underline is at least 2 device px.
- **Cost:** 3 taps.
- **Risk:** the underline could read as a line marker. If so, the fallback is the hover and press states only, plus a NeXT arrow CSS cursor. Entry is a single tap, never a double-click.

### 1995: GeoCities on a home CRT, at night

- **POV:** a beige 14" CRT at home at night, 55 cm away, centred and slightly low. The page's navy and neon are the only light. The first consumer camera of the era saw your face in 16 greys.
- **Light:**
  - New `ERA_LIGHT["1995"] = { device: "crt", key: [0.05, -0.12, 0.99], pos: [0, -40, 300], normal: [0, 0, -1], size: [1480, 1110] }`, no fill.
  - `ERA_LENS`: grain **0**, chroma 0.35, sat 1, webcam artefact amount 0.7.
  - `ERA_GAZE`: `scatter`, `follow: 0.6`, `pursuitGain: 0.6`, `catchUp: 2.5`.
- **Medium (1 tap):**
  1. Cell `px(3)`, sampled at the centre. `L = develop(E 1.5, Ec 0.55)`, keeping hue.
  2. Saturation ×1.35 around luma (not today's 1.9 confetti), and contrast 1.15 about 0.5.
  3. Shadows go to navy: `d = mix(d, #000033, smoothstepDown(0.22, 0, L))`.
  4. Ordered dither: `t = (bayer4(cell) − 0.5)/5`. Each channel is quantised as `floor(clamp(d + t)·5 + 0.5)/5`, which gives the 216 web-safe colours (00/33/66/99/CC/FF). An all-zero result becomes `#000033`, so nothing is ever `#000000`.
  5. **Shadow mask:** each cell is split into three vertical R | G | B stripes, offset by half a cell on alternate rows. Each channel is multiplied by `(0.86 + 0.14·mask)·1.12`, only where `luma > 0.5` (the sclera and the reflection).
- **Surround:** navy night with neon spill. **Static stars** appear only where all of these hold:
  - the cell quantises to `#000033`;
  - `room(uv) < 0.6`;
  - `|p − e| > 1.6·aw`;
  - `hash(cell) > 0.9967`.

  Stars are `#FFFFFF`, or `#CCCCFF` by a second hash. They never twinkle.
- **Interaction:**
  - **Rest: the eye's own catchlight is an animated GIF** at `pc + (−0.40R, −0.42R)`, snapped to cells. It is white only, a 4-frame loop at 2 fps on `M.clock`: a 1-cell dot, a 3×3 plus, a four-point star 9 cells long, the plus again.
  - **Hover:** CSS `cursor: pointer` (the hand). Cells with `|r − R| < 1 cell` print link blue `#0000FF`.
  - **Press:** the ring turns active red `#FF0000`.
  - **Release (enter):** the ring turns visited `#663399`, then the pupil dilates. Flood `#000033`.
- **Arrival: interlaced GIF, 4 passes at 0/90/180/270 ms (360 ms).** For cell row r during pass k, sample row `r − (r mod s_k)` with `s = 8, 4, 2, 1`. This is Netscape's fill-down, and it is free.
- **Departure, 120 ms:** each channel drops to 3 levels (a 16-colour-like palette).
- **Phone:** the sparkle is frozen on the plus frame; stars thin to 1 in 500.
- **Cost:** 1 tap.
- **Risk:** kitsch. The sparkle stays white and small and the stars stay sparse and static. If a star lands on skin, tighten the mask.

### 1997: Corporate web, CD-ROM edition, on an office Trinitron

- **POV:** a 17" office CRT at 800×600 in 16-bit colour, 60 cm away, in a cubicle under tubes. The real 1997 home is cream, burgundy and gold on dark brown. The machine learns where you hover before you click.
- **Light:**
  - New `ERA_LIGHT["1997"] = { device: "crt", key: [-0.1, 0.2, 0.97], pos: [-30, 40, 300], normal: [0, 0, -1], size: [1600, 1200], fill: { dir: [0.1, 0.95, 0.3], color: "#e6efff", strength: 0.3, pos: [0, 600, 380], size: [1300, 60], round: 0.1 } }`.
  - `ERA_LENS`: grain **0**, wb −0.5 → **−0.12**, gain 1.15, gamma 0.92, sharpen 0.35, interlace amount 0.6. This fixes today's crush to near-black.
  - `ERA_GAZE`: `two-target`, `follow: 0.7`.
- **Medium (3 taps). Delete the gold bevel:**
  1. Luma comes from cell `px(2)`. Chroma comes from the 2×2 block `px(4)`: `rgb = chroma·(Lcell/luma(chroma))`. This is 4:2:0, so the brown iris bleeds a pixel onto the sclera.
  2. `develop(E 1.6)` on luma, keeping hue, so mid-skin sits near 0.32.
  3. Shadows go to `#2B211D` by `0.6·smoothstepDown(0.25, 0, L)`.
  4. **JPEG blocks in the darks only:** `B` = a point sample at the `px(16)` block centre, and `d = mix(d, B, 0.55·(1 − smoothstep(0.08, 0.3, L)))`. Blocks are static.
  5. **5-6-5, undithered:** `floor(r·31)/31, floor(g·63)/63, floor(b·31)/31`. Cheek, lid and brow band, with faint green/magenta steps.
- **Surround:** a warm dark-brown CD-ROM ground with banded skin.
- **Interaction:**
  - **Rest: the iris demonstrates its own rollover.** Every 7 s (on `M.clock`) it hard-swaps to its "over" state for 0.5 s. Under reduced motion the over state holds steady at half strength.
  - **Hover (`step(0.5, M.hover)`, an instant swap with no tween):** inside the iris and outside the pupil, luminance ×1.25 and a mix toward `#C9A227` at 25%, then 5-6-5 quantised.
  - **Press (the down state):** the iris samples from `p − (px(1.5), px(1.5))` and is multiplied by 0.85.
  - **Release (enter):** a PowerPoint-97 checkerboard dissolve to burgundy `#6E1F2F` in `px(16)` blocks. Even blocks go over 0–200 ms and odd blocks over 200–400 ms, each block's threshold jittered by `hash·0.3`. Flood `#6E1F2F`.
- **Arrival: progressive JPEG, 330 ms.** Point-sampled blocks of `px(16)` at 0–110 ms, `px(8)` at 110–220 ms, `px(4)` at 220–330 ms, then full detail.
- **Departure: degauss, 130 ms.**
  - A horizontal shear of `px(6)·sin(18y/H + 40t)·(1 − dep)²`.
  - R/B misconvergence of ±`px(3)·(1 − dep)`, which needs 2 extra taps during the departure only.
- **Phone:** there is no hover, so the 7 s attract swap is the rest sign and touch-down shows the down state.
- **Cost:** 3 taps (+2 during degauss).
- **Risk:** the attract swap could read as flicker. If so, drop it to +12% luminance. No bevel, sheen, wires or grille, ever.

### 2000: The search box, through a TN laptop panel

- **POV:** a 14" TN laptop at night, 50 cm away, below the eye line. The person looks down into a cold panel. This is the first interface that saw your intent, as words.
- **Light:**
  - New `ERA_LIGHT["2000"] = { device: "lcd", key: [0, -0.4, 0.92], pos: [0, -140, 285], normal: [0, 0, -1], size: [1600, 1180] }`, no fill.
  - `ERA_LENS`: grain 0.03, wb −0.3, CCD amount 0.6.
  - `ERA_GAZE`: `lock`, `rest: [0, -0.4]`, `follow: 0.25`.
- **Medium (1 tap). Delete the page and the box:**
  1. **Viewing angle:** `a = clamp(0.3·(uv.y − 0.5) + 0.8·M.angle, −1, 1)`. `M.angle` is `2·(ptr.y − 0.5)`, damped at λ 3, and it eases back to 0 at λ 2 once the pointer is idle.
     - `γ = 2^(0.45a)`, `lift = 0.10·max(−a, 0)`, `d = lift + (1 − lift)·d^γ` (display space).
     - Where `a > 0.6`, the darks partly invert: for `l < 0.33`, `l' = mix(l, 0.35 − 0.6l, 0.5·smoothstep(0.6, 1, a))`, tinted toward `#3A4A8A`.
  2. **TN black floor:** `d = #15171C + (1 − #15171C)·d`.
  3. **6-bit with static spatial FRC:** with LCD pixel `px(3)`, `d = floor(d·63 + bayer2(cell)·0.98)/63`.
  4. **Subpixels:** stripe `k = floor(3·fract(p.x/cellpx))`. Channel k ×1.0 and the other two ×0.82, then ×1.12. Off when the cell is under 3 device px.
- **Surround:** a cold, glowing panel black, with the face lit from below. The search box exists only in the real page reflected in the cornea.
- **Interaction:**
  - **Rest: an XOR I-beam caret in the pupil,** `px(2)` wide and `1.6·pupilR` tall, drawn as `c → 1 − c`, so it is white on the black pupil. It blinks 530 ms on / 530 ms off for 5 s after an arrival or any input, then holds steady.
  - **Hover:** CSS `cursor: text`, and the caret holds.
  - **Press:** the caret thickens to `px(3)`, and the iris (outside the caret) is selected in Windows 2000 highlight: `c = mix(c, #0A246A + 0.5c, 0.85)`.
  - **Release (enter):** the search fires. A white band opens from the caret line, `|y − pc.y| < (H/2 + R)·easeInCubic(enter/0.3 s)`, to `#FFFFFF`. Flood `#FFFFFF`.
- **Arrival: CCFL strike, 600 ms.** Brightness rises `mix(0.3, 1, 1 − e^(−5·arr))` while the tint warms from `#9DB8FF` to neutral.
- **Departure, 100 ms:** the backlight goes off. Brightness falls to 7% in 60 ms, and the unlit LCD keeps a faint ghost of the picture through the shut lids.
- **Phone:** subpixels off. The angle follows Android `deviceorientation` (no permission needed); otherwise it is fixed at 0.15. The caret is at least 2 device px.
- **Cost:** 1 tap.
- **Risk:** the quietest card. If it looks washed out, cap the rest-state `|a|` at 0.35. Never bring the box back.

### 2003: Web 2.0 candy, Aqua gel, seen by an iSight (the act break)

- **POV:** the iSight on top of a 17" LCD at eye level, 50 cm away, with window daylight from the right and the blue page in front. The person watches the face on screen just below the lens (the video-chat offset). The machine opens its own eye and sees you live, in colour.
- **Light:**
  - New `ERA_LIGHT["2003"] = { device: "lcd", key: [0, 0.04, 1], pos: [0, 10, 300], normal: [0, 0, -1], size: [1760, 1100], fill: { dir: [0.82, 0.22, 0.52], color: "#fff4e2", strength: 0.42, pos: [520, 120, 300], size: [420, 620], round: 0.08 } }`. This is the deck's first window catchlight.
  - `ERA_LENS`: artefact `flash` → **`none`**, sat 1.1, sharpen 0.2, grain 0.03, vignette 0.15.
  - `ERA_GAZE`: `idle`, `rest: [0, -0.28]`, `follow: 0.6`.
- **Medium (1 tap plus analytic shapes). Delete the photo inset, rounded corners, page and floor:**
  1. **Candy grade:** sat 1.3; contrast 1.12 about 0.45; highlights warmed by `+#0A0500·smoothstep(0.6, 1, l)`; shadows toward steel blue `#6C9BD2` at `0.12·smoothstepDown(0.35, 0, l)`.
  2. **Aqua gel on the cornea only** (everything multiplied by `cornea(p)`), in iris coordinates `q = (p − pc)/R`:
     - **Lip:** an ellipse centred (0, −0.5) with half-axes (0.74, 0.34). It is white, with alpha falling from 0.30 at its top to 0.04 at its bottom, and its edge is crisp (`px(1.5)` AA).
     - **Glow:** radial from (0, +0.72), falling off over 0.6R, `#3D8FE8`, additive by `g`.
  3. **Pulse:** `g = mix(0.12, 0.36, 0.5 − 0.5·cos(2π·clock/1.8))·signA`. Brightness only, never size.
- **Surround:** daylit warm skin, the window catchlight on the right, and blue page light on the far cheek.
- **Interaction:**
  - **Rest:** the default-button pulse.
  - **Hover:** CSS `pointer`, and the pulse holds at 0.36.
  - **Press:** Aqua changes colour rather than pressing in. The glow goes to `#1C5FB8` at 0.42 and the lip ×0.5.
  - **Release (enter): Genie into the pupil, 380 ms.** Rows collapse horizontally toward `pc.x`, bottom rows first, and the funnel draws up into the pupil. Uncovered area becomes flood `#6A98CB` (the 2003 home's steel blue).
- **Arrival: the iSight's three-blade iris opens in step with the lids** (swap+40 → swap+280 ms, easeOutCubic), so the two shutters read as one gesture.
  - Blades: `#2B2E33`, with a `hair(1)` specular edge in `#8A9099`, rotating 60° as the aperture grows past the frame's diagonal.
  - Saturation climbs from 0.4 to 1.3 over 500 ms.
  - The blades exist only during this arrival.
- **Departure, 120 ms:** saturation drains to 0.6.
- **Phone:** the pulse period is 2.6 s.
- **Cost:** 1 tap.
- **Risk:**
  - The blades could read as a portal; they last 280 ms or less and appear on arrival only.
  - The gel could read as a sticker; it is masked by cornea × almond and should be tuned against the real specular.

### 2009: iPhone 3GS, held low

- **POV:** a phone held low at 32 cm in a lamp-lit room, with the lids lowered. It has no front camera, so it sees only where your finger says.
- **Light:**
  - New `ERA_LIGHT["2009"] = { device: "phone", key: [0, -0.55, 0.84], pos: [0, -150, 250], normal: [0, 0, -1], size: [980, 1560], fill: { dir: [-0.25, 0.85, 0.46], color: "#ffd9a8", strength: 0.3, pos: [-220, 520, 300], size: [170, 170], round: 1 } }`. The cornea's reflection turns from a wide monitor into an upright phone, with a round lamp catchlight.
  - `ERA_LENS`: grain 0.05, wb 0.45, sharpen −0.35, flare amount 0.7, **aperture 1.2** (the brow slightly soft; never breathing).
  - `ERA_GAZE`: `scroll`, `rest: [0, -0.7]` (−1.5 hid the iris), `follow: 0.4`. On press the director aims the gaze at the touch point.
- **Medium (1 tap). Delete the white border:**
  1. Keep today's fade grade exactly, but rewrite the reversed `smoothstep(0.45, 0.02, l)` as `smoothstepDown`.
  2. **Lens falloff,** centred: `d ×= 1 − 0.38·smoothstep(0.25, 1, |u|²)`, with u aspect-corrected to −1..1.
  3. **Walnut in the shadows:** `mix(d, #2B2118, 0.4·smoothstepDown(0.25, 0, l))`.
  4. **Sensor noise:** where `l < 0.2`, ±3% per channel, in cells of `px(2)`, from `hash(cell + lens.seed)` (12 Hz).
- **Surround:** the warm walnut room of the 2009 home.
- **Interaction:**
  - **Rest: the phone wakes for you.** Every 9–12 s (jittered), `M.wake` rises over 250 ms, holds 1.6 s and falls over 700 ms. It does three things:
    - the lower face brightens: `c ×= 1 + 0.45·wake·smoothstep(e.y/H − 0.05, 1, uv.y)`;
    - the cornea brightens ×`(1 + 0.5·wake)`;
    - the director adds `0.25·wake` to the pupil rig's luminance input, so the pupil constricts on its own reflex.

    Under reduced motion the wake holds at 0.4.
  - **Hover:** CSS `pointer`.
  - **Press (touch-down on the iris): tap to focus.**
    - A square reticle, side 1.9R, centred on `pc`, line `px(1.5)` in `#FFFFFF` at 75%, with mid-edge ticks of `px(4)`.
    - It lands from 1.3× to 1.0× in 220 ms (easeOutBack), then gives two opacity pulses.
    - Exposure dips −0.15 stop and recovers over 250 ms.
    - It fades 300 ms after release or drag, and is never shown at rest.
  - **Release (enter):** the Camera app's six-blade shutter closes onto the pupil in 380 ms. Blades `#1A1A1A` with `hair(1)` highlights. Flood `#2B1D12`.
- **Arrival: wake and autofocus, 380 ms.**
  - The image fades up from black over 160 ms.
  - Focus hunts out, overshoots and lands at 0 / 240 / 380 ms. On T2/T3 the director drives a `U.cam.focus` offset of +2.5 → −0.8 → 0 mm, which the existing DOF pass renders for free. On T1 the medium mixes in the quarter-res `soft` copy on the same curve.
- **Departure, 120 ms:** sleep; the image fades to black.
- **Phone:** this is the phone's native era. The wake period is at least 10 s, and the reticle is at least 44 CSS px.
- **Cost:** 1 tap (+1 on T1 during arrival).
- **Risk:** the wake could read as flicker. It changes brightness only, at least 9 s apart, gently.

### 2013: iOS 7, a selfie through frosted glass

- **POV:** an iPhone 5s held a little high at arm's length (about 50 cm). The eye looks **up** into the front camera, the deck's first look up right after 2009 looked down. The light is bright and diffuse. The interface reads the body: touch, tilt, face.
- **Light:**
  - New `ERA_LIGHT["2013"] = { device: "phone", key: [0, 0.3, 0.95], pos: [0, 110, 290], normal: [0, 0, -1], size: [1000, 1640], fill: { dir: [0, -0.7, 0.7], color: "#ffffff", strength: 0.35, pos: [0, -500, 320], size: [1600, 500], round: 0.3 } }`.
  - `ERA_LENS`: lift 0.09 → 0.03, wb 0.1, sat 0.95, vignette 0.3, gain 1, grain 0.02.
  - `ERA_GAZE`: `two-target`, `a: [0, 0.45]` (the lens), `b: [0.04, 0.25]` (the screen), `rest: [0, 0.3]`, `dwellA: 1.2`, `dwellB: 4`, `follow: 0.45`.
- **Medium (3 taps plus the shared quarter-res `soft` copy). Delete the six-tone posterize:**
  1. `sharp = at(uv)`, with the flat grade.
  2. **Frost:** the mean of `soft` at `uv ± 1.5` quarter-res texels, offset by a parallax of `px(4)·(ptr − 0.5)·ptrOn` (which settles to 0 when idle). Then vibrancy: sat ×1.5, a mix toward `#F4F6FA` at 0.32, and 1.5% grain on `seed18`.
  3. **Clear zone:** `clear = max(almond(p, 1.25) feathered over 0.35R, a pointer disc of radius 0.09H feathered over 0.05H at the damped pointer)`. On phones the disc lingers 2 s after lift.
  4. `out = mix(sharp, frost, 0.75·(1 − clear))`. The face keeps its form under the glass.
- **Surround:** bright pastel frost, with colour bleeding in from the reflected cards. The eye is a sharp almond in it, and a blink closes the almond too.
- **Interaction:**
  - **Rest:** a hairline of light on the limbus, `|r − R| < hair(1)/2`, white at 35% (the Touch ID ring).
  - **Pointer within 2R:** the ring rises to 70%.
  - **Press:** the ring goes to 100% and the iris takes 35% frost white, the passcode key filling.
  - **Release (enter):** the launch zoom, ×1 → ×6 about the pupil over 360 ms (easeInCubic), into flood `#EFEFF4`. Under reduced motion it is a crossfade.
- **Arrival: the Notification Center sheet, 420 ms.** A frost edge springs down from the top (damping 0.85). Above the edge is frost (except the clear zone); below it is sharp.
- **Departure, 130 ms:** frost condenses over everything, the eye included.
- **Phone:** the clear disc follows the finger; parallax comes from Android tilt only.
- **Cost:** 3 taps, plus the shared `soft` copy (~0.15 ms, paid in every era).
- **Risk:** the frost hides skin detail. See question 4.

### 2026: The Pupil (the interface looks back)

- **POV, inverted:** there is no screen. The interface is the eye, and you are what it watches, in soft daylight.
- **Light:**
  - New `ERA_LIGHT["2026"] = { device: "window", key: [0, 0.1, 0.99], pos: [0, 40, 320], normal: [0, 0, -1], size: [2200, 1400], fill: { dir: [-0.7, 0.35, 0.6], color: "#f5f3ee", strength: 0.35, pos: [-600, 200, 300], size: [500, 700], round: 0.05 } }`. The 2026 page is still the reflection.
  - `ERA_LENS`: grain **0**, sat 0, sharpen 0.4, aperture 0.8.
  - `ERA_GAZE`: `contact`, `follow: 1`, `pursuitGain: 0.97`.
- **Medium (3 taps, 5 in blend bands). Fix today's negative:**
  1. **Three aligned square grids,** anchored at `M.eye` (the resting centre, so saccades never drag the grid):
     - `c0 = max(R/22, 2 device px)`: about 11 px on desktop, and the same dot count across the iris on phones;
     - `c1 = 2·c0`, `c2 = 4·c0`.
     - The zone is chosen by the distance r from `e`: below 1.8R uses c0, 1.8R–3.2R uses c1, beyond 3.2R uses c2.
     - Bands 0.6R wide blend coverage between the two grids (2 cell taps).
     - Square grids match the home pupil's straight grid.
  2. `L = develop(E 2.0, Ec 0.5)`, then `lc(0.6)` from 2 taps at ±2 cells.
  3. `ink = 1 − (0.06 + 0.88·L)`. Where ink ≥ 0.9, the whole cell fills, so the lash line and pupil fuse solid.
  4. **Attention:** `ink ×= A`, where A = 1 inside `almond(p, 1.25)` and within r < 2.2R, falling (smoothstep) to 0.1 at the corners. The face dissolves into paper.
  5. **Dots:** radius `sqrt(ink)·0.525·cell`, AA over 0.7 px. Ink `#0B0B0B` on paper `#FAFAFA`.
- **Surround:** white paper, the 2026 home itself. The deck ends in light.
- **Interaction:**
  - **Rest:** eye contact. The gaze follows the pointer or finger slowly, and the finest dots sit on the iris.
  - **Approach** (pointer comes within 2.5R; at most once per approach and once every 4 s): one ripple. Dots swell 15% in a ring that travels from the pupil out to 3R over 600 ms.
  - **Hover:** inside the iris the grid crossfades from c0 to c0/2 over 300 ms (2 taps while it fades). It resolves you.
  - **Press:** the iris dots swell 20% and fuse.
  - **Release (enter):** see question 1. Default: the pupil's dots re-grid to the home pupil's pitch and grow into its halftone sphere over 400 ms while the rest fades to paper. Fallback: pupil dilation, then flood `#FAFAFA`.
- **Arrival: centre-first denoise, 640 ms.**
  - Each dot starts at a static `hash(cell)` size.
  - Local progress is `clamp(arr·(1.6 − 0.6·r/rmax))`, quantised to 16 steps (40 ms each), so it reads as sampler steps with no shimmer.
- **Departure, 130 ms:** re-noise in 4 steps.
- **Phone:** c0 follows the iris.
- **Cost:** 3 taps (5 in blend bands).
- **Risk:** seams at the blend bands. Keep them at least 0.6R wide and check on a phone.

## The cut between eras

**The rule.** Every era change is the person's own blink.
- The closing lids carry the outgoing era's departure, in its medium.
- The cut happens while the lids are shut.
- The opening lids carry the incoming era's arrival, in its medium.

Each slide then builds in three beats: **world** (the arrival), then **light** (the pupil's reflex to the new screen), then **sign** (the era's "this opens"). Light, lens, the page in the cornea, the cursor shape, the gaze plan and `M.cur` all switch at the same shut moment, so the new device visibly switches on through the eyelid.

### One step (arrow key, one wheel notch, a click on the adjacent era)

Desktop times are below. On phones (`calm`) every duration is ×1.25.

| Beat | Time (ms) | Curve | What happens |
|---|---|---|---|
| LOOK | 0–70 | min-jerk | A saccade toward the travel side (forward = right): 0.3 gaze units (about 7°). |
| CLOSE | 50–140 | easeInQuad | Lids go from 0 to 1 (director override). `dep` runs 0→1 over the era's `departMs`, starting at 50. |
| SHUT | 140 → swap | — | `swap = max(140 + 40, 50 + departMs)`; for 1970 this is 250. **At swap:** `M.cur = B`, `arr = 0`, and `shown = B` (light, lens, page, cursor, gaze plan). The lens values jump instead of damping. |
| HOLD | swap → swap+40 | — | B's arrival begins on the shut lids. |
| OPEN | swap+40 → swap+280 | easeOutCubic | Lids open in B's medium. The gaze eases from the look-ahead to B's rest over 320 ms (smooth pursuit, no second saccade, so the wobble spring is never kicked). |
| BUILD | arr over `arriveMs` | per era | B's arrival plays out. The pupil reflex follows B's `screenLum` through `pupilRig`'s own latency. |
| READY | swap + max(arriveMs, 420) | 150 ms fade | `signA` goes 0→1: B's sign appears last. |

A typical step opens by about 460 ms and settles by about 800 ms. Forward and back are identical apart from the saccade's side.

### Per-era timings, read by the director from `ERA_MEDIUM` in `look.ts`

| Era | departMs | arriveMs | enterMs | flood |
|---|---|---|---|---|
| 1970 | 200 (collapse) | 420 (warm-up) | 400 | `#000000` |
| 1981 | 130 (field clear) | 300 (two fields) | 300 | `#F1EFE8` |
| 1991 | 120 (4→2 greys) | 440 (sweep) | 360 | `#FFFFFF` |
| 1995 | 120 (16 colours) | 360 (GIF passes) | 380 | `#000033` |
| 1997 | 130 (degauss) | 330 (progressive JPEG) | 400 | `#6E1F2F` |
| 2000 | 100 (backlight off) | 600 (CCFL) | 300 | `#FFFFFF` |
| 2003 | 120 (sat drain) | 280 blades / 500 sat | 380 | `#6A98CB` |
| 2009 | 120 (sleep) | 380 (wake + AF) | 380 | `#2B1D12` |
| 2013 | 130 (frost) | 420 (sheet) | 360 | `#EFEFF4` |
| 2026 | 130 (re-noise) | 640 (denoise) | 400 | `#FAFAFA` |

### A jump of several eras (a far click, Home/End, PageUp/PageDown, a burst of wheel or key presses)

- It is one blink.
- The saccade is 0.3 + 0.05 per extra era, capped at 0.5.
- The shut hold grows by 40 ms per skipped era, capped at +160 ms.
- The eras in between are never shown, and there is no hue drift over the lids.
- B's own arrival tells you where you landed.

### Retargeting and the rate limit

- A new request during LOOK, CLOSE or SHUT retargets B; the newest target wins.
- A request during OPEN or BUILD re-closes the lids from their current height, like a blink burst.
- Swaps are at least **400 ms apart** (at most 2.5 a second). A request inside that window holds the lids shut until the gap allows the swap.
- Natural blinks are suppressed while the director is busy and for 600 ms after.

### Scrubbing (press and drag past 6 px, a swipe, or the ghost finger)

This needs the loader to send a fractional position: `EyeStageControl.travel(pos | null)`, with `pos` in era-index space 0..9.

- **The hand works the lid.** Let `d = |pos − round(pos)|`, from 0 at an era's centre to 0.5 at a boundary.
  - The lid target is `smoothstep(0.22, 0.45, d)`.
  - The lid is rate-limited: it closes no faster than full travel in 70 ms and opens no faster than full travel in 150 ms.
  - So scrubbing slowly works the eyelid by hand, one blink per boundary.
- **The cut** happens on the first frame after `round(pos)` changes at which the filtered lid is at least 0.85 and the 400 ms gap allows it. Until both hold, the old era stays and the lid keeps closing. **The medium never changes with the lids open.**
- **Departure and arrival are positional and reversible:** `dep = smoothstep(0.2, 0.45, d)` on the outgoing side, and `arr = 1 − smoothstep(0.05, 0.45, d)` on the incoming side. Drag back and both un-play.
- **Gaze:** while dragging, the gaze follows the pointer with `follow` at least 0.6, so the eye looks where the hand carries the next era. That is the eyeline match, for free.
- **Speed:** `v` = |dpos/dt|, damped at λ 10. Above 3 eras a second the lid target becomes 1: the person shuts their eyes against the rush. Swaps coalesce at 2.5 a second or fewer, and the lids open when `v` drops below 2 or the hand releases.
- **Release:** the loader settles `pos` to the nearest era. The lids open over 240 ms (easeOutCubic) and the remaining arrival plays.
- **Ghost finger (phones):** it drives `travel()`. Two eras over 1.0 s means two lid dips with two cuts, then a 0.38 s pause, then back. The demo teaches "drag, blink, a new world" without words.
- **Before the loader sends `travel()`:** each era prop change is treated as a step, with the same coalescing.

### Enter (tap or click on the iris)

1. Pointer-down over the iris (`toIris < 1.05`) sets `press = 1` and the era shows its press feedback.
2. Moving more than 6 px turns it into a scrub, and `press` falls at λ 14.
3. Release on the iris: the loader exits (`exiting` becomes true). `M.enter` runs 0→1 over `enterMs`, on top of the existing pupil dilation, ending on the flood colour.

The loader currently starts its fade at 220 ms, so each enter's key frame is front-loaded to land by about 400 ms. Question 2 asks whether to give it more time.

### Reduced motion

- No saccade, no blink cut, no departure or arrival, no parallax, ripple, wake or attract swap.
- Every change is a **240 ms linear crossfade** from the held output frame, A, to the live frame, B. A is copied once at the start of the change, so this costs 1 tap.
- Scrubbing crosses each boundary with that crossfade, at 2.5 a second or fewer.
- Signs show steady (`M.steady = 1`):
  - 1970 cursor on; 2000 caret on;
  - 1981 arrow parked; 1991 underline drawn;
  - 1995 sparkle on its plus frame; 1997 over state at half strength;
  - 2003 glow at 0.24; 2009 wake held at 0.4;
  - 2013 ring at 35%; 2026 still.
- Enter is a 200 ms fade to the flood colour.

### The director: `post/medium-director.ts`

A plain TypeScript state machine with no three.js, shaped like `rig/*.ts`.

```
REST --want != cur--> STEP{LOOK, CLOSE, SHUT, OPEN, BUILD} --> REST
REST/STEP --travel != null--> SCRUB --travel == null--> STEP.OPEN (settle) --> REST
any --exiting--> ENTER (terminal)
reduce: REST --want != cur--> FADE(240 ms) --> REST
```

**Input each frame:**

```
{ want, travel, dt, reduce, calm, exiting,
  pointer: { u, v, fresh, down, dragging, overIris },
  frame: { irisPx, eye, aperture, H }, pageReady(id) }
```

Here `pageReady(id)` says whether an era's page is decoded. If B's page isn't ready, SHUT extends by up to 150 ms.

**Output:**

```
{ blink: number | null, gaze: { x, y } | null, shown: string,
  swap: boolean, busy: boolean, captureHeld: boolean,
  lumBoost: number, focusOffset: number }
```

`lumBoost` is 2009's wake; `focusOffset` is 2009's focus hunt.

**Uniforms (`U.medium`).** The director writes them unless noted; EyeStage supplies the inputs.

| Uniform | Range | Written by, and how |
|---|---|---|
| `cur` | 1..10 | director, at the swap only |
| `dep`, `arr` | 0..1 | director (timed or positional) |
| `dir` | −1, 0, 1 | director |
| `scrub` | 0/1 | director |
| `clock` | seconds | director; runs under reduced motion |
| `steady` | 0/1 | director (= reduce) |
| `signA` | 0..1 | director; 150 ms fade at READY, 0 during cuts and scrub |
| `hover` | 0..1 | director from `overIris && fresh`, λ 10 |
| `press` | 0..1 | director; instant on, λ 14 off |
| `enter` | 0..1 | director; `exitT / enterMs` |
| `ptr` | vec2, top-left UV | EyeStage: `((pointer.x+1)/2, (pointer.y+1)/2)`, damped λ 8 |
| `ptrOn` | 0..1 | EyeStage: `fresh`, λ 8 |
| `eye` | vec2 UV | EyeStage: `frame.cx/W`, `frame.cy/H` |
| `irisR` | share of H | EyeStage: `frame.irisPx/H` |
| `aperture` | vec2, share of H | EyeStage: fissure half-width and half-height from `fissureAngles` × `pxPerMm`, height × (1 − `U.blink`) |
| `pupil`, `pupilR` | as today | EyeStage; `pupilR` written **after** `pupilRig.update` |
| `angle` | −1..1 | director (2000), λ 3 and back to 0 at λ 2 |
| `wake` | 0..1 | director (2009) envelope |
| `seed18` | integer | director; steps at 18 fps, frozen under reduce |
| `heldMix` | 0..1 | director (reduced-motion fade) |
| `held` | texture | pipeline (FramebufferTexture) |

Removed: `prev`, `next`, `reachL`, `reachR`, `age`.

## Engineering plan

### Files

**Untouched by the other sessions; editable now:**

- `C:/Users/arunk/KIRUKULAM/kiruk-in/src/components/three/eye/post/era-medium.ts`. A rewrite:
  - delete the glimpse code (crescent, `edgeOf`, `rimOf`), the per-pixel `id` select, the unconditional base sample and `rounded()`;
  - one `If(M.cur.equal(n))` chain, with every texture read at `.level(0)`;
  - the held mix at the end, inside `If(M.heldMix.greaterThan(0))`.
- `C:/Users/arunk/KIRUKULAM/kiruk-in/src/components/three/eye/post/medium-kit.ts` (new): `kc`, `px`, `almond`, `cornea`, `develop`, `lc`, the Bayer and hash helpers, the sparkle, reticle and blade shapes.
- `C:/Users/arunk/KIRUKULAM/kiruk-in/src/components/three/eye/post/medium-director.ts` (new): the state machine. Unit-test it in node with a scripted input timeline: step, jump, scrub forward and back, rate limit, reduced motion.
- `C:/Users/arunk/KIRUKULAM/kiruk-in/src/components/three/eye/uniforms.ts`: the `medium` block in the table above.
- `C:/Users/arunk/KIRUKULAM/kiruk-in/src/components/three/eye/look.ts`:
  - `ERA_LIGHT` for 1995–2026;
  - the `ERA_LENS` edits listed in each card;
  - `ERA_GAZE` `follow` and rest values;
  - a new `ERA_MEDIUM` record per era: `{ departMs, arriveMs, enterMs, flood, cssCursor }`.
- `C:/Users/arunk/KIRUKULAM/kiruk-in/src/components/three/eye/post/pipeline.ts`:
  - pass a `soft` node into `eraMedium`: three's `GaussianBlurNode` on the `convertToTexture(finished)` texture at resolution scale 0.25, sigma about 3. Verify the API against the installed three version.
  - add a `FramebufferTexture` sized to the drawing buffer (re-created on resize). After `pipeline.render()`, when the director asks, call `renderer.copyFramebufferToTexture(held)`.

**After the other sessions commit:**

- `C:/Users/arunk/KIRUKULAM/kiruk-in/src/components/three/eye/EyeStage.tsx`: the hook below.
- `C:/Users/arunk/KIRUKULAM/kiruk-in/src/components/ui/immersive-era-loading-page.tsx` and `C:/Users/arunk/KIRUKULAM/kiruk-in/src/components/ui/ghost-finger.tsx`:
  - send `control.travel(pos)` with the unrounded `indexFromX` result and the swipe's `from + moved/ptPerYear`, and `null` on release;
  - make the ghost finger call `travel`;
  - set `style.cursor` over the iris from `ERA_MEDIUM.cssCursor`: a Star arrow PNG in 1981, `pointer` in 1995, 2003 and 2009, `text` in 2000, default elsewhere;
  - apply the enter timing, if question 2 says yes.
- `C:/Users/arunk/KIRUKULAM/kiruk-in/src/lab/eye/EyeLab.tsx`: a `__eyeMedium.freeze({ cur, phase, t, travel, hover, press, enter })` debug hook for deterministic captures.

### The EyeStage hook (minimal diff, about 45 lines)

1. `const director = useMemo(() => new MediumDirector(), [])`.
2. **Pointer listeners (:685–700):**
   - add `pointerup` and `pointercancel`;
   - record `down` and the start position on `pointerdown`, with a 6 px drag threshold;
   - register the listeners even under reduced motion, so hover and press still work, while the gaze ignores the pointer when `reduce` is set.
3. **Call `director.update(...)` near the top of `useFrame`,** before the gaze and blink lines, using last frame's `irisOnScreen` and `eyeOnScreen` (one frame of lag is invisible). Then:
   - gaze target = `hold.current.gaze ?? d.gaze ?? (fresh ? pointer × follow : null)`;
   - `U.blink.value = hold.current.blink ?? d.blink ?? blinkRig.update(dt, reduce, exiting || hold.current.stare || d.busy)`;
   - `if (d.busy) h0.moved = now`, so cuts never drop to the 20 fps idle throttle.
4. **Show the new era only at the swap.** Add `const [shownId, setShownId] = useState(era.id)`; on `d.swap`, call `setShownId(d.shown)`. Then key `look`, the palette, the pages, `screenLum` and the cursor kind on `shownId` instead of `era.id`, while `want = mediumOf(era.id)`. Prefetch the wanted era's page when `era.id` changes. On the swap frame, copy the lens targets directly instead of damping them at λ 3.
5. **Replace the media block (:1045–1095)** with the uniform writes: `eye`, `irisR`, `aperture`, `ptr`, `ptrOn`, `pupil`. Move the `M.pupilR` write to after `pupilRig.update`.
6. Add `lumBoost` to the pupil rig's `lum` input, and add `focusOffset` to `U.cam.focus`.
7. **Delete** the 60% arrival blink (:517) and the iris re-bake on era change. The identity is the same person in every era, so memoise it once.
8. After render: `if (d.captureHeld) renderer.copyFramebufferToTexture(held)`.

### GPU budget (medium pass at rest, 1440×900, one branch)

| Era | Taps | Extra arithmetic | Versus today |
|---|---|---|---|
| 1970 | 9 | none | same, minus the glimpse overhead |
| 1981 | 5 | develop, lc | +4 |
| 1991 | 3 | develop, lc | +2, and the page is gone |
| 1995 | 1 | develop, mask | same |
| 1997 | 3 | 5-6-5 | +1 |
| 2000 | 1 | angle curve | same |
| 2003 | 1 | gel shapes | −1 (no floor) |
| 2009 | 1 (+1 on T1 in arrival) | falloff | same |
| 2013 | 3 + shared `soft` | — | −6 |
| 2026 | 3 (5 in bands) | grid select | +2 |

- **Shared costs:** the `soft` blur, about 0.1–0.2 ms in every era; the held-frame copy, about 0.1 ms, only at the start of a reduced-motion change; departures and arrivals are arithmetic only (the degauss adds 2 taps for 130 ms).
- **Savings:** every pixel today pays the glimpse arithmetic, the `id` select and a base sample. Those go.
- **Target:** the medium pass costs no more than today +0.3 ms in every era, measured in one page.

### WebGL2

- No emissive target. 1970's `isolate` behaves as it does today, and every mask in this spec is analytic (iris disc × almond), so nothing depends on emissive.
- No DOF on T1: the 2009 arrival uses `soft`.
- `copyFramebufferToTexture` and `GaussianBlurNode` must be verified on the WebGL backend in batch 1. If the copy fails, reduced motion falls back to a hard cut, which involves no motion.
- Integer operations are avoided: the arrow, sparkle and reticle are built from `step` arithmetic.

### Verification

Run headless Chromium with WebGPU through the lab capture path that produced the `scratchpad/now` shots, plus `__eyeMedium.freeze`.

1. **Per era**, for the batch's eras plus 1970:
   - states: rest, hover, press, enter at 120 and 300 ms;
   - sizes: 1440×900 at DPR 1, and 390×844 at DPR 1.5;
   - backends: WebGPU, and WebGL2 forced.
2. **Transition filmstrips:**
   - a step 1970→1981 and its reverse, at t = 0, 50, 100, 140, 180, 230, 300, 400, 520, 700 and 900 ms;
   - a jump 1970→2026;
   - a scrub at pos = i + 0.1, 0.3, 0.45, 0.5, 0.55, 0.7, 0.9;
   - the reduced-motion fade at 0, 120 and 240 ms.
3. **Benchmark guard:** 1970 at rest on desktop, pixel-diffed against `bf3cd45` with the cursor rectangle masked and the clock phase matched. Maximum ΔE below 1.
4. **Cornea check (quantised eras):** in the iris crop, the reflected page's mean sits between 0.3 and 0.7, with under 5% of pixels clipped to white.
5. **Flash check:** mean luminance per frame across a 4-eras-a-second scrub capture. No more than 2.5 transitions a second with ΔL greater than 10% of the range.
6. **GPU:** the old and new medium paths toggled in one page, timed with timestamp queries over 300 frames per era. (The 610M drifts ±25% between runs, so never compare across runs.)
7. **Real devices:** a phone in `calm`, and the ghost-finger demo.
8. **Posters:** recapture all 20 after each batch, timed with the session that owns the posters.

## Batches

**Batch 0: today, about 40 minutes, `era-medium.ts` only.** Delete the 1991 page and border, the 1997 bevel, the 2000 box (with the caret moved into the pupil), the 2003 inset and floor, and the 2009 border. Lift the 1997 exposure. Every era is then full bleed with its current colour treatment. This answers the user's literal complaint while the real work lands. Recapture the posters.

**Batch 1: the cut, with 1970 as the reference, plus 1981, 1991 and 1995.**
- The work: the director, the uniforms, the kit, the EyeStage hook, the held frame, the 2.5-a-second limit, reduced motion, and the 1970 refinements (collapse, warm-up, hover and press, phone rows, the sign clock).
- **Why these three:**
  - They are the first slides any visitor meets after the benchmark. The opening lands on 1970, and the first arrow press and the ghost-finger demo walk 1970→1981→1991. So the cut is judged exactly where it is first seen.
  - They share the quantising kit (`develop`, `lc`, grain 0, `kc`), so the kit is proven once.
  - They include the two worst cornea failures (1981's white blob, and 1991's page and border).
- The loader's `travel()` and CSS cursors join here if the loader session has committed; otherwise steps only.

**Batch 2: 1997, 2000, 2003.** New lights and fills, the TN panel and its viewing angle, the 5-6-5 rollover, the Aqua gel, the iSight act break, and the Genie and checkerboard enters.

**Batch 3: 2009, 2013, 2026.**
- The `soft` target, portrait phone lights, the wake and the focus hunt.
- The frost and the selfie gaze.
- The foveated halftone and the 2026 hand-off (pending question 1).

After every batch the user verifies in the lab, the posters are recaptured, and nothing is committed unless the user asks.

## Open questions for the user

1. **2026 enter: hand off into the home's pupil?** The eye's halftone pupil would re-grid and grow into the 2026 home's halftone sphere in place, a match cut. This touches the Pupil decision. **Default: yes.** The fallback is dilation into paper white.
2. **Give the enter more time?** Today the loader starts fading at 220 ms, so every era's enter (the Star window opening, the Genie, the launch zoom, the shutter) has about 0.2 s at full strength. Moving the fade to 420 ms and `onComplete` from 760 to 950 ms lets each one read. This changes the loader file another session owns. **Default: yes, after their commit.**
3. **Per-era gaze follow as the point-of-view arc.**
   - 1981 tracks your mouse (0.85).
   - 1991 keeps reading (0.35).
   - 2000 watches its own caret (0.25).
   - 2009 looks where you press.
   - 2026 holds eye contact (1.0).
   - 1970 stays exactly as it is today.

   **Default: yes.** An eye that follows you less in the early eras is the point of the arc, but it does change how responsive those eras feel.
4. **How much may 2013's frost cover the face?** **Default: light.** Blur of 12 px or less at 900p, frost at most 75%, the clear zone 1.25× the lid opening, and the finger clears the glass. To be decided by an A/B in the lab against a clean, flat-graded 2013 with only the limbus ring.