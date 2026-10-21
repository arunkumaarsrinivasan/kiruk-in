# 2013, the system -- the loader eye drawn by every UI kit of the year

> Status (2026-10-21): v2 built (`post/system.ts`), awaiting the user's review. Not committed. The storyboard is `docs/era-pov/2013-system-storyboard.png`.
>
> History:
> - An iOS 7 front-camera concept was rejected: "feels like same as 2026".
> - v1 was one theme, monotone, flat. The user's feedback: "more components, more colour (2013 is when we started using colour), depth, liveliness, maybe an anomaly; show how UI, interaction and components evolved". On themes: "don't think about just one design: blend all the designs that started from that time".

## v4 (2026-10-21), after "the eyeball looks unfulfilled and separate; the detail from the other eras is missing"
- **The face's detail runs through every component:** each part is relit by the face under it. The light is the pixel's luminance against a neighbourhood of about 0.35R, to the power 0.85, darkening ×0.9 (×0.55 on the keys), and the lights lifted toward white. So the brow's hairs, the lashes, the lid's folds, the skin's texture, the page reflected in the cornea and the catchlight all show, as every other era keeps the whole face.
- **The eye sits in the face:** the dial is cut by the lids pixel by pixel (not cell by cell). It has 7 finer rings, its knobs are a lighter step of the fibre's own colour (not white), and the iris is held 50% darker. The cornea's reflection and the lashes lie over it.

## v3 (2026-10-21), after "the whole should be components; the middle eyeball looks creepy; not a single button for the pupil; the colour is too soft; components in different sizes (search bar, button, text field, forms); go further"

- **Nothing but components; no photograph.** The photo iris and the single pupil button are gone.
- **Layout by Atomic Design, sized by detail.** A quadtree of 2:1 cells, anchored on the globe's centre. A cell splits while the face's tone varies across its four quadrants, with thresholds 0.035 / 0.055 / 0.08. The eye's opening ×1.35 is always at least molecules.
  - **Templates** (16u × 8u, where she is smooth): a login form, a settings group (3 rows with switches), a search page.
  - **Organisms** (8u × 4u): a search bar with its button, a nav bar, a form row, an alert, a list cell.
  - **Molecules** (4u × 2u): an input group, a labelled switch, a segmented control, a checkbox with its label.
  - **Atoms** (2u × u, the finest): the 15 atom kinds by tone band.
  - The atom height is `u = max(R/40, 0.62% H)`. Each element of a group reads its own tone at its own centre.
- **The iris is a dial:** five rings of radial cells round the pupil. Switches sit at the collarette, sliders form the fibres (each knob where the fibre's tone puts it), and segments run round the limbus.
- **The pupil is iOS 7's keyboard,** many keys.
- **Colour:** one solid, vivid ramp (white, `#ffe45c`, `#ffb300`, `#ff7a1a`, `#ff375f`, `#e5157a`, `#b23bdb`, `#6b4cf0`, `#3d3fd6`, `#1b2266`, `#0a0b1a`), its luminance monotonic.
  - Every part is a tile in its tone's colour; a group's card is a step deeper, and the gutters are half its colour.
  - Details are white or ink, whichever reads.
  - Skin darkness (0.34–0.46) is stretched about its middle, plus local contrast ×2.2 against a coarse mean, so brow, crease, under-eye and cheek separate.
  - The pipeline's room vignette is undone in the tone read.
  - The iris is held 38% darker and the pupil 72%, so the reflected page doesn't wash the eye out.
- **Depth:** as v2 (alpha depth: elevation, shadows, parallax).
- **States:**
  - The arrival runs dial and keys, then atoms, molecules, organisms, templates, each landing glossy then flattening.
  - Idle demos.
  - The pointer lifts, focuses and switches parts on.
  - **Sign:** a focus runs round the limbus.
  - **Hover:** the limbus is focused and glows, the dial's sliders sweep like an activity indicator, and keys light up as if typed.
  - **Press:** the keyboard and limbus go active blue, and a wave of active parts runs out.
  - **Enter:** everything switches on, then the page.
- **Shader size:** the components and helpers are WGSL functions (`Fn().setLayout`), so each body is emitted once. Inlined, v3 made the fragment 683 KB and an 11 s compile; as functions it is 470 KB, of which 2013 is about 110 KB. The rest is shared by all eras (see the proposed per-era split).

## The idea (v2, kept for history)
2013 is the year interfaces became **systems of components** and colour came back: iOS 7, Bootstrap 3, Flat UI, Metro, Atomic Design, the UI kit. The design system sees her as it sees everything: as components, every kit of the year blended into one.

## Fifteen components, one per tone
The cell's tone, on a log scale of the frame, picks a band. Each band holds two components, chosen per block of 3 × 2 cells so they read as a kit's sections, not confetti.

| Band (light → dark) | Components | State that follows the tone |
|---|---|---|
| 0 | page dot | — |
| 1 | pagination (squares or dots) | the current one fills |
| 2 | radio pair / text input | the second radio fills / the caret moves along and blinks |
| 3 | checkbox pair / tag with × | ticked one, then both / tint |
| 4 | slider / striped progress bar | the knob moves / fills, stripes run |
| 5 | switch / stepper − + | the knob crosses to on / + pressed |
| 6 | segmented control / badge | segments selected / its red dot grows |
| 7 | button with chevron / Metro tile | pressed / — |
| 8 | solid tile | — |

## Colour
A palette ramp blended from the year's systems, light to dark, its luminance falling at every step so the face reads:

`#f9f9fb` → iOS 7 yellow `#ffcc00` → orange `#ff9500` → pink `#ff2d55` → Flat UI amethyst `#9b59b6` → iOS 7 purple `#5856d6` → wet asphalt `#34495e` → ink `#161a2e`

- Each fill mixes the cell's and the pixel's own tone, so the face's detail shows inside.
- The page under the components is tinted by her tone (38%), so from across the room she reads as a vivid gradient portrait.
- Accents: iOS 7 blue `#007aff` (the primary button, the focus ring), Bootstrap's focus glow `#66afe9`, iOS 7 red `#ff3b30` (badges).

## Depth
- The pipeline now writes the scene's depth into the medium texture's alpha: ±20 mm about the focal plane, with near = 1.
- **Elevation:** components stand at the face's real depth. The page shades where the face falls away, and the heavier components cast shadows that grow longer the higher they stand.
- **Parallax:** components shift against the pointer in proportion to their height.

## Life: everything that moves is a component changing state
- **Arrival (Atomic Design, and skeuomorphic to flat):**
  1. A page of dots (atoms).
  2. Her real iris.
  3. The components grow outward from it (molecules) and take their values (the page).
  4. Their skeuomorphic gloss flattens away as they land: iOS 6 to iOS 7.
- **Idle:**
  - each component demonstrates itself every ~30 s for half a second (a switch flips and back);
  - progress stripes run;
  - carets blink.
- **Pointer:** components near it lift, take the focus ring and switch on.
- **The sign: her pupil is a round primary button with a chevron.**
  - Hover: Bootstrap's focus glow.
  - Press: the active state (darker, smaller), and a wave of active components runs out from it.
  - Going in: the button is loading (a spinner), the wave switches everything on, then the page, then the Pinboard home.
- **Leaving:** values go and components shrink back to dots.
- **Reduced motion:** everything is already there, with no demos, stripes, caret blink or gloss.

## The anomaly
Her iris stays a photograph: the one thing the system could not make a component of. It is ringed in white.

## Lens
The 2013 lens vignette is 0; it read as a frame.

## Open
- The density of components against how clearly the face reads (`ch = max(R/28, 0.85% H)`).
- The enter into the Pinboard: could the components fly into its cards?
- More component types (date picker wheel, alert, toolbar, nav bar).
