# 2013, the system: the face built from UI components (post/system.ts)

**Concept.** 2013 is when interfaces became systems of components and colour came back: iOS 7, Bootstrap 3, Flat UI, Metro, Atomic Design, UI kits. The design system sees her as it sees everything: as components, every kit of the year blended, and nothing else. No photograph remains.

It took four rounds, each one a correction:
- An iOS 7 camera UI over the photo was rejected as "the same as 2026".
- A single-theme mosaic was rejected as "monotone, no depth".
- A version with a photo iris and a pupil button was rejected as "creepy, a single button, soft colour".
- The face detail was missing and the eye looked "separate"; fixed in round four.

## Layout: an Atomic Design quadtree, detail decides size
- Atom height `u = max(floor(max(R/40, 0.62%·H) + 0.5), 5)`.
- Base cell 16u × 8u (2:1), anchored on the globe's centre.
- Split into four while the stretched tone's spread across the quadrants exceeds **0.035 / 0.055 / 0.08** (levels 3 → 2 → 1 → 0).
- The eye's opening ×1.35 is always split to at least molecules.

| Level | Size | Parts (chosen by a hash of the cell) |
|---|---|---|
| 3 templates | 16u×8u | login form (heading, two fields, remember-me check, sign-in button); settings group (3 rows, label + switch, separators); search page (search bar, two results with avatars) |
| 2 organisms | 8u×4u | search bar + button; nav bar (back chevron, title, action); form row (label over field); alert (title, message, two buttons); list cell (avatar, two lines, progress) |
| 1 molecules | 4u×2u | input group (field + button); labelled switch; segmented control; checkbox + label |
| 0 atoms | 2u×u | by tone band, light → dark: page dots, pagination, radio pair / text input with caret, checkbox pair / tag with ×, slider / striped progress, switch / stepper, segmented / badge with red dot, button with chevron / Metro tile, solid tile |

- Each element of a group reads **its own tone at its own centre**, so a form's fields shade with the face under them.
- Each atom's state follows its tone within its band: the slider knob moves, the switch crosses, segments fill.

## The eye
- **The iris is a dial:** 7 rings from `1.04·pupilR` to `0.985R`, cut into radial cells about twice as long as wide (count `max(floor(2π·r / max(ringW/2, 0.9u)), 12)`).
  - Switches sit at the collarette (ring 0), sliders form the fibres (rings 1–5, each knob where the fibre's tone puts it), and segments run round the limbus (ring 6).
  - Knobs are a lighter step of the fibre's own colour, never white. *Why:* white knobs read as a ring of dots, not an iris.
- **The pupil is iOS 7's keyboard:** keys of `max(0.36·r0, 1.1u)`. On hover the keys light up as if typed (7 Hz random); on press they are all held down blue.
- **The eye sits in the face.** The dial is clipped by `almond(p)` per pixel, never per cell. *Why:* cell-wise clipping left a stepped disc that read as pasted on.
- **Dark like a real eye:** the dial's darkness is mixed 50% toward ink, the keyboard 72%. *Why:* the reflected page washed the iris pink-white.

## Colour
- One solid ramp, luminance falling at every step: `#ffffff #ffe45c #ffb300 #ff7a1a #ff375f #e5157a #b23bdb #6b4cf0 #3d3fd6 #1b2266 #0a0b1a`.
- Accent iOS 7 blue `#007aff` (active, focus) and glow `#5ac8fa`; badges `#ff3b30`; switch-on `#4cd964`.
- Each part is a solid tile in its tone's colour. A group's card is ×0.8; gutters are half the part's colour. Details are white or ink by `luma > 0.62`.

## Tone
- **Undo the pipeline's room vignette** before reading tone: `lum / mix(0.38, 1, 1 − smoothstep(0.22, 0.8, |uv − 0.5|·(1.22, 1)))`. *Why:* otherwise the frame's edges read as a darker face.
- Stretch: `pow(clamp((log2(l) + 5.06) / 4.64), 1.05)`, a log scale from 0.03 to 0.75.
- **The skin spans little of that scale** (darkness 0.34–0.46). Stretch it:
  `face = clamp((dk − 0.38)·1.25 + 0.4 + (dk − mean@1.2R)·2.2, 0, 0.97)`.
  The second term is local contrast against a coarse mean, which separates brow, crease, under-eye and cheek.

## The face's detail through every part (round four)
Each part is relit by the face under it:
- `relief = clamp(((lumPix + 0.03) / (lumAt0.35R + 0.03))^0.85, 0.2, 2.6)`;
- darken by `min(relief, 1)` at ×0.9 (×0.55 on the keys);
- lift toward white by `smoothstep(1, 2.2, relief)·0.7`.

*Why:* every other era keeps brow hairs, lashes, lid folds, skin texture and the cornea's page. Without the relight, 2013 read as a different design from the rest of the deck.

## Depth and life
- Elevation from depth alpha `×1.4 − 0.2`, raised by the pointer (+0.6), the wave (+0.3) and enter (+0.5).
- Shadow offset `(0.6, 1)·(1 + 2.5·elev)`, blur `1 + 2·elev`.
- Parallax `(0.5 − ptr)·5px·elev`. Not on the dial and keys, which turn with the eye.
- **Arrival in Atomic Design order:** dial and keys first, then atoms, molecules, organisms, templates (`0.12 + 0.12·level` s) and out from the pupil (`0.05·dist/R`).
  - A dot (atom) grows into the part, then the part takes its value.
  - Skeuomorphic gloss flattens away as it lands: iOS 6 to 7.
- **Idle:** each part demonstrates itself every ~30 s for half a second; progress stripes run; carets blink.
- **Pointer:** parts within 2u–9u lift (×1.08), get the blue focus ring and switch on.
- **Sign at rest:** a blue focus runs slowly round the limbus segments (0.12 rev/s).
- **Hover:** the limbus is focused and glows; the dial's sliders sweep like an activity indicator; keys type.
- **Press:** the keyboard and limbus go active and a wave runs out (`R·3·press`).
- **Enter:** everything switches on outward, then the page `#fcfcfe`.
- **Reduced motion:** final state at once; no gloss, demos, stripes or blink.

## Cost
- Every component and helper is a WGSL function (`Fn().setLayout`): ramp, onColor, box SDF, segment SDF, tone read, and 10 element functions.
- Inlined, the fragment was 683 KB and compiled in 11 s; as functions it is 470 KB, with 2013 adding about 110 KB.
