# The Loader Eye in TSL: research, art direction, build plan

Status: proposal, 2026-10-17. Nothing is built yet. Each phase is checked in the lab and signed off before the next one starts.

---

## 0. Summary

**Today.** [EraEyeCanvas.tsx](../src/components/three/EraEyeCanvas.tsx) drives one 850-line GLSL fragment shader ([era-eye-shader.ts](../src/components/three/era-eye-shader.ts)) over a full-screen quad. That shader fakes the whole eye in 2D: lids, lashes, sclera, iris, the cornea's reflection and the room. Post-processing is pmndrs `postprocessing` on three r177 with WebGLRenderer.

**Proposal.** Rebuild the eye as a small 3D scene with one mesh and one TSL module per anatomical layer. It runs on `WebGPURenderer`, which falls back to WebGL2 by itself, and does its post in a TSL `RenderPipeline`.

**Why rebuild now.** The 2D shader has hit its ceiling:
- Every new detail costs every pixel, because fbm runs over the full screen each frame.
- Lashes and lids have no depth, so they can't defocus or cast shadows.
- The iris can't parallax under the cornea when the eye turns.

With layers, a pixel pays only for the one or two layers it shows, each layer gets its own level of detail, and depth of field, shadows and parallax come from real geometry.

**What stays:**
- The idea: the era's screen lives in the cornea and is the only light.
- The framing in [era-eye-frame.ts](../src/lib/era-eye-frame.ts).
- The picker's input model: sweep to travel, tap the iris to enter.
- The era screen painter and the light reflex.
- Saccade and blink timing, the DPR budget, idle throttling and the hidden-tab stop.
- The rule that the loader never asks for a permission.

**How it stays safe.** The new eye is built in a dev lab (`/lab/eye`) behind a flag. The current eye stays live until the new one passes its gates. A poster image paints before any shader compiles, so the loader is never blank.

**Order:**
1. Foundation, then the light source.
2. One vertical phase per layer: eyeball, cornea, iris, pupil, lids and skin, lashes, tear film.
3. Motion, then camera and post.
4. Era passes in batches of three, then the swap.

---

## 1. Constraints

| Constraint | Source | What it means here |
|---|---|---|
| The loader must never paint blank | [PERF_IDENTITY.md](PERF_IDENTITY.md), wave 1 | Poster frame first. Compile behind it with `compileAsync`, then crossfade in |
| Pause work that's off screen, never the thing on screen | PERF_IDENTITY | Keep the hidden-tab stop and the idle throttle. Blinks and pupil life are never gated on "live" |
| No permission dialogs on the loader | memory: no-permission-prompts | Tilt only where it's free (Android). No camera, no mic |
| Ten eras: 1970, 1981, 1991, 1995, 1997, 2000, 2003, 2009, 2013, 2026 | [portfolio-data.ts](../src/data/portfolio-data.ts) | Ten era cards (§7) |
| The 2026 home is a halftone pupil on concentric rings, with no iris and no orange | memory: pupil-2026 | The loader's 2026 eye hands off into the halftone instead of carrying an iris onto the page |
| Reduced motion | existing `reduce` prop | Every interaction has a still variant |
| Eras go in batches of three, you verify, nothing is committed unless asked | memory: era-work-batches | Phase 11 runs in batches |

---

## 2. Platform (checked October 2026)

**Versions:**
- three is at **r186** (npm `0.186.1`); this repo is on r177. R3F is at 9.8.2, with v10 in alpha.
- **r181** deprecated `renderAsync` and `computeAsync` in favour of `render` and `compute`, and added the Inspector.
- **r182** renamed `colorBufferType` to `outputBufferType`.
- **r183** renamed `PostProcessing` to `RenderPipeline` (the old name still works but warns), deprecated `Clock` for `Timer`, and stopped `WebGLCubeRenderTarget` from working with WebGPURenderer.
- **r185** changed premultiplied alpha.
- **r186** removed `PCFSoftShadowMap` and the TSL export `viewportResolution` (use `screenSize`).

**What doesn't run on WebGPURenderer:** pmndrs `postprocessing`, `@react-three/postprocessing`, `ShaderMaterial`, `RawShaderMaterial` and `onBeforeCompile`. Everything in the new eye is therefore TSL, with post effects imported from `three/addons/tsl/display/*` (bloom, depth of field, LUT, GTAO, SMAA and others are already in `node_modules`).

**Browser support:**
- WebGPU ships in Chrome and Edge, Firefox on Windows, and Safari 26, including iOS 26.
- Older iOS and Firefox on Android get the WebGL2 backend automatically.
- Check `renderer.backend.isWebGPUBackend` after `init()`; `isWebGPURenderer` is true on both backends.
- `forceWebGL: true` tests the fallback on any machine.

**R3F 9.** The `gl` prop takes an async factory: `new WebGPURenderer(props)`, then `await renderer.init()`, then return it. Call `extend(THREE)` with `three/webgpu` so node materials work in JSX.

**Bundle.** `three/webgpu` is about 220 KB gzipped, from a third-party esbuild test on r186. Load it only through a dynamic import, after the poster has painted, and never ship both renderers to the same visitor.

**What the upgrade touches.** Besides the eye, `scribble-animation.tsx` and `era-screen-texture.ts` import three. Re-test both after the version bump.

**Recommendation.** Phase 0 bumps `three` and `@types/three` to r186 and keeps the current eye on WebGLRenderer (still exported from `three`), so the swap can happen gradually.

---

## 3. Research: the eye, part by part

Numbers are approximate adult values from standard ophthalmic references. They are starting points for tuning, not targets to hit to the decimal.

### 3.0 What the five references teach

| Ref | What it shows | The lesson |
|---|---|---|
| R1, grey iris macro | White wavy threads over dark holes, a dark crenellated rim at the pupil, a soft limbal ring, no reflection | The iris is relief: bright fibres sit on top of dark depth. The fibres wave; they are not straight spokes |
| R2, brown eye in a sunbeam | The iris glows on the side *away* from the light, lashes shadow the white, pores and fine hairs show in raking light, the lower margin is wet | The corneal caustic, lash shadows, and skin detail that only matters where light rakes across it |
| R3, hazel eye with a window | The window's reflection covers half the iris, the upper lid shades the ball, there's a meniscus line, the lashes are crisp with highlights | The reflection is the hero. The lid's contact shadow is what seats the ball in its socket |
| R4, green and amber central heterochromia | Amber inner zone, green outer zone, a zigzag collarette between them, crypts, a bright window at the edge | Colour lives in two zones split by the collarette, not in noise |
| R5, brown eye behind foreground lashes | Defocused lashes in front glow as streaks, a deep limbal ring, fibres under a glossy cornea | Shallow depth of field. Lashes catch light. The cornea is a separate glossy layer over the iris |

The white wavy "nerves" in R1 and R4 are stroma trabeculae, made of collagen and vessels. The red threads on the white of the eye are conjunctival vessels. Both are covered below.

The references are probably copyrighted. Keep them out of `public/` and out of git; the lab loads them by drag and drop (§8, P0).

### 3.1 Eyeball and sclera
- **Anatomy.** The ball is about 24 mm long along its axis. The sclera is opaque collagen. The conjunctiva over it carries the visible vessels: deeper episcleral vessels look blurry, the fine conjunctival ones look sharp. The white is faintly blue when young and thin, and yellows with age and UV. A pinguecula, a small yellow bump beside the limbus, is an age cue.
- **Look.** A lit, wet sphere. Light falls off toward the corners with a soft terminator, because subsurface scattering blurs it. There's a contact shadow under the upper lid. Vessels gather toward the corners and fade toward the limbus.
- **Don't.** A flat white disc with a vignette, which the current shader's own comments note "read as plastic".

### 3.2 Cornea
- **Anatomy.** About 11.5–12 mm across. Its front surface has a radius of about 7.8 mm, steeper than the ball's 12 mm, so it bulges. It is about 0.55 mm thick at the centre with an IOR of about 1.376. It sits about 3 mm in front of the iris, across the anterior chamber of aqueous humour (IOR about 1.336).
- **Look.** You only see it through what it does:
  1. As a mirror, it gives a sharp reflection of the bright things in front of it.
  2. As a lens, it magnifies the iris and bends it at grazing angles.
  3. As a bulge, it puts a step in the silhouette at the limbus when the eye turns, with a rim highlight along it.
- **Don't.** Lay a glass square over the shot, or keep the reflection equally sharp everywhere. It is sharp at the dome's centre and softer toward the limbus.

### 3.3 Limbus
- A 1–2 mm transition band. The dark limbal ring is thicker and darker in young eyes and fades with age. An older eye can show arcus, a grey-white ring.
- **Look.** A soft dark ring, then a blue-grey halo into the sclera. The current shader already gets this right; keep the numbers.

### 3.4 Iris
- **Anatomy.** About 12 mm across, in two zones split by the **collarette**. The collarette is a zigzag ring about a third of the way out from the pupil; inside it is the pupillary zone, outside it the ciliary zone.
  - The **stroma** is radial, wavy trabeculae.
  - **Crypts of Fuchs** are dark holes near the collarette.
  - **Contraction furrows** are concentric rings in the outer ciliary zone.
  - The **pupillary ruff** is a dark crenellated rim at the pupil's edge.
  - The iris is slightly conical, because the lens pushes it forward.
- **Colour:**
  - Brown comes from melanin in the front layer.
  - Blue and grey come from little melanin plus light scattering in the stroma.
  - Green and hazel come from moderate melanin plus scattering, often with an amber inner zone (central heterochromia, R4).
  - Freckles and nevi are small dark spots.
- **Behaviour.** When the pupil opens, the iris does not scale. Fibres fold and bunch toward the root, crypts squash, and furrows deepen ([Pamplona et al. 2009](https://www.npsg.uwaterloo.ca/misc/pupilreflexPub.php); [Bérard et al. 2014](https://la.disneyresearch.com/publication/high-quality-capture-of-eyes/) captured this deformation).
- **Look.** Relief, not a flat texture. The caustic crescent sits on the side away from the light. Because the iris sits under the cornea, it is magnified and moves less than the cornea's surface when the gaze turns.
- **Don't.** Paint the era's colour into the iris. The current shader learned that pure `#00ff41` fibres read as "green fur".

### 3.5 Pupil
- **Size.** 2–4 mm in bright light, 4–8 mm in the dark. It sits slightly toward the nose and slightly low.
- **Reflexes:**
  - The **light reflex** starts after a delay of about 0.2–0.25 s, constricts fast, and reopens slowly over seconds. Pamplona models it with a delay-differential equation.
  - The **near reflex** constricts the pupil when the eye focuses close.
  - **Arousal** and mental effort dilate it.
  - **Hippus** is a slow, irregular unrest.
- **Optics.** The pupil is not a black disc. It is dark with depth, and shows a red reflex when a light sits on the camera's axis (flash red-eye). It also shows **Purkinje images**:
  - P1, off the front of the cornea: bright and upright. This is the main reflection.
  - P2, off the back of the cornea: faint, almost on top of P1.
  - P3, off the front of the lens: larger, dim and upright, seen through the pupil.
  - P4, off the back of the lens: small and inverted, seen through the pupil.

  The current shader's "light inside the pupil, upside down" is P4. Keep it small and dim; the current code notes that a legible page inside the pupil reads as a bug.

### 3.6 Tear film and meniscus (the fluid)
- **Anatomy.** The film is about 3–10 µm thick, topped by a 0.05–0.1 µm lipid layer that gives faint thin-film interference colours in highlights.
  - A blink spreads the film.
  - It creeps upward for about a second after the blink, then thins.
  - After about 10 s without a blink it starts to break up (tear break-up time), and dry spots break up the reflection.
- The **meniscus** is a 0.2–0.3 mm bead of fluid along both lid margins, brighter on the lower lid.
- **Look.** The reflection is alive but never wobbles like water; these movements are microns. There's a bright line on the lower margin, and after a long stare the reflection turns patchy.

### 3.7 Lids, margins, corners
- **Fissure.** About 28–30 mm wide and 9–10 mm tall. The upper lid covers 1–2 mm of the top of the iris; the lower lid sits near the lower limbus.
- **Lid margin.** About 2 mm thick: a grey line, the lash line, the openings of the meibomian glands, and a wet waterline.
- **Inner corner.** The caruncle (pink, wet and bumpy) and the plica semilunaris.
- **Lid types:** double fold, single fold (monolid), hooded, deep-set, epicanthic fold.
- The upper lid follows vertical gaze (**lid–gaze coupling**).
- **Look.** The edge has thickness, the lower margin catches light, and the corners are dark pockets.

### 3.8 Lashes
- **Anatomy.** The upper lid has about 90–160 lashes in 2–3 rows, 8–12 mm long and curling upward. The lower lid has about 70–80, 6–8 mm long. Each is about 0.1 mm thick and tapers. They grow in clumps, densest at the outer third.
- **Look at macro.** A soft dark mass with a few defined strands. Strands that cross the light pick up a sheen. Lashes in front of the focal plane defocus into streaks (R5) and cast soft shadows onto the ball (R2).
- **Don't.** A picket fence of identical spikes all in focus. The current shader's comment says that "read as a plastic doll".

### 3.9 Skin
- **Anatomy.** Eyelid skin is the thinnest on the body, about 0.5 mm: pinker and translucent, with visible veins. Fine lines at the outer corner deepen when the eye squints. Pores are sparse on the lid and larger on the cheek.
- **Colour model.** Melanin sets the tone, haemoglobin sets the undertone, and translucency sets how much light bleeds through. Tone comes from the 10-step **Monk Skin Tone** scale, as data.
- **Look.** Subsurface glow at the edges, red at shadow boundaries. Microstructure only where light rakes across it.

### 3.10 Motion
- **Saccades.** Duration is about 2.2 ms per degree plus 21 ms (the "main sequence"), with peaks around 500°/s. Free viewing makes 3–4 per second. Fixations last about 200–300 ms; reading fixations are about 225 ms, with a return sweep at each line end.
- **Microsaccades.** About 1–2 per second, under 1°, with drift and tremor between them.
- **Smooth pursuit.** Up to about 30°/s; faster targets get catch-up saccades.
- **Post-saccadic wobble.** The lens and iris overshoot and settle over tens of milliseconds.
- **Blinks.** About 15–20 a minute, each 100–400 ms, closing faster than opening. They cluster with large gaze shifts.
- **Already in the code:** saccade hold-and-jump, tremor, a blink curve with doubles, and hippus.
- **Missing from the code:** main-sequence timing, the split between pursuit and saccades, post-saccadic wobble, lid coupling, gaze-evoked blinks and microsaccades.

### 3.11 Light and reflection
The monitor is the key light and the main reflection, and the room is dark. Light enters through the cornea and lands as a caustic on the far side of the iris. Because the light source is an area, the shadows from lids and lashes are soft. The screen's colour spills onto the skin and the white of the eye.

### 3.12 Camera
A 100 mm macro lens near 1:1 has a depth of field of a few millimetres: the iris plane is sharp, while the lashes and lid edges go soft. Focus breathing shows during a rack. A shallow depth of field is the strongest single cue that this is a photograph and not CG.

---

## 4. Architecture

```
camera: macro, aperture and focus are uniforms
│
├─ L7 Lashes ............ InstancedMesh ribbons, upper and lower
├─ L6 Lids and skin ..... procedural grid mesh, deformed in the TSL vertex stage
├─ L5 Occlusion shell ... transparent; multiplies AO and lid/lash shadow onto the ball
├─ L4 Tear meniscus ..... thin strip along both margins, additive
├─ L3 Cornea shell ...... specular only: the P1 reflection, rim, tear normal, thin film
├─ L2 Eye ............... sphere: sclera, plus iris and pupil via analytic refraction
├─ L1 Room backdrop ..... far quad: the era monitor out of focus, and the desk's reflection
└─ L0 Era screen ........ offscreen render target, 768×432 at 24 fps, mipmapped
                          (the source for light and reflection)

post: pass → MRT (output, emissive, viewZ) → dof → bloom (emissive) → era lens → tonemap
```

**Decisions:**
- **The iris is not a mesh.** The eye material ray-traces it: the view ray refracts at the cornea sphere, hits the iris cone, converts to polar UV, takes the dilation remap and a parallax step, then shades. This is cheaper and more correct than screen-space transmission (`viewportSharedTexture`), and it behaves the same on WebGL2.
- **The cornea shell is specular only** and adds over the eye. The iris and sclera blend at the limbus inside one material, so there are no transparency-sorting seams.
- **Shadows are faked** with the occlusion shell and a projected lash density. A lash is 0.1 mm wide, and a shadow map that resolves it would cost more than the whole eye. T3 can try a real shadow map later.
- **Units are millimetres**, with the eye at the origin. The camera is derived from `eyeFrame().span`, so the dial and the iris hit-test stay correct.
- **The fissure stretches to the viewport's width**, as it does today, by becoming a parameter of the lid mesh.

### Data model

All tuning lives in typed records and `anatomy.ts`, never in shader bodies. Shaders read uniforms, and the node graphs never change between eras, so sweeping never recompiles anything.

```ts
/** The person: anatomy that differs between eras. */
interface EyeIdentity {
  seed: number;
  iris: {
    inner: string; outer: string;          // sRGB hex (THREE.Color has no oklch()), the two colour zones
    melanin: number; scatter: number;      // pigment vs. stroma scattering
    collaretteR: number;                   // share of the radius from the pupil
    crypts: number; furrows: number; fibreWave: number;
    freckles: number; limbal: number; arcus: number;
  };
  sclera: { tint: string; vessels: number; age: number };
  pupil: { rest: number; reactivity: number; decentre: [number, number] };
  lids: { type: "double" | "mono" | "hooded" | "deepset" | "epicanthic"; tilt: number; aperture: number };
  lashes: { upper: number; lower: number; length: number; curl: number; clump: number; mascara: number };
  skin: { monk: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; undertone: number; translucency: number; pores: number; lines: number };
}

/** The era: how it lit that person and how it recorded them. Extends today's EraVisual. */
interface EraLook extends EraVisual {
  light: { tint: string; device: "crt" | "crt-mono" | "lcd" | "phone" | "window" | "none"; pos: [number, number, number]; size: [number, number] };
  restGaze: [number, number];
  gazePattern: "idle" | "read" | "scatter" | "two-target" | "lock" | "scroll" | "contact";
  lens: { grain: number; grainSize: number; halation: number; chroma: number; vignette: number;
          lift: number; gamma: number; gain: number; sat: number; artefact: string; aperture: number };
  cursor: "block" | "arrow" | "hand" | "caret" | "thumb" | "none";  // the visitor's pointer, in the cornea
  signature: string;  // the one behaviour only this era has
}
```

**Data-driven, optional.** The iris could be seeded from the site's own data: crypts from projects, furrow rings from years of practice, freckles from awards. It would be a fingerprint for the portfolio, stylized and never legible as a chart. Decide this in Phase 4.

---

## 5. Layer interaction map

There are no new controls. The inputs that already exist are:
- pointer position and hover over the iris;
- sweep velocity, wheel, keys and tap;
- tilt (Android only);
- idle time and era changes;
- the viewport.

Each layer answers them in its own way.

| Layer | Listens to | Response | Real basis |
|---|---|---|---|
| Era screen | era change, time | Layouts crossfade and content scrolls | Existing |
| Cornea (P1) | pointer position | The visitor's pointer appears in the reflection, drawn as that era's cursor | It reflects the screen you are using |
| Cornea | gaze turn | The reflection slides and stretches over the dome, and the bulge catches a rim highlight | A sphere on a sphere |
| Iris | pupil size | Fibres bunch, furrows deepen, crypts squash | Pamplona 2009 |
| Iris | end of a saccade | A short damped wobble | Post-saccadic oscillation |
| Pupil | era change (screen luminance) | Constricts fast, opens slowly | Light reflex |
| Pupil | hover over the iris | Dilates slowly, about +8% | Arousal and interest |
| Pupil | pointer nearing the iris centre | Constricts slightly while focus pulls to the iris | Near reflex |
| Pupil | tap (enter) | The dilation swallows the screen (existing) | n/a |
| Tear film | time since the last blink | The reflection turns patchy after about 8 s, then a blink clears it | Tear break-up time |
| Tear film | blink | The film spreads upward again and the meniscus brightens | Blink mechanics |
| Tear film | fast sweeps (4 or more eras a second) | More blinks and a wetter meniscus | Reflex tearing, stylized |
| Lids | vertical gaze | The upper lid follows | Lid–gaze coupling |
| Lids | screen luminance | Narrower on bright eras, wider on dark ones | Squint |
| Lids | a large gaze jump, or arriving at an era | A blink | Gaze-evoked blink |
| Lashes | blink velocity | They lag a frame behind the lid and settle | Inertia |
| Lashes | screen colour | Their sheen takes the screen's tint | Specular |
| Skin | screen luminance and colour | Colour spill, and squint folds at the outer corner on bright eras | Squint |
| Camera | what the pointer is over | Focus racks slowly to it, lashes or iris | A photographer's focus pull |
| Room | era change | The monitor body changes, CRT bezel or flat panel (existing) | Existing |

**Reduced motion.** Each of these becomes an instant state change or turns off: no rack focus, no wobble, no blinks (as today), and the grain freezes.

---

## 6. Common visual language

1. **One shot.** Macro, with the eye filling the screen in a dark room. The era's screen is the only key light and the brightest thing in the cornea.
2. **Era colour enters the eye only as light**: reflection, spill, catchlight, sheen. Never as pigment.
3. **One real eye.** Every year uses the same anatomical scale, the same physiology and the same camera rules.
4. **Four things vary per era, and only these:**
   - the person (`EyeIdentity`);
   - the light: what kind of device, its colour, where it sits, and so where the eye looks;
   - the lens: how that era recorded faces;
   - one signature behaviour.
5. **Focus stays on the iris plane**, and lashes and lid edges fall soft. The reflection is sharp at the dome's centre and softer toward the limbus.
6. **Restraint.** One effect carries each era, and everything else stays photographic. If an era needs two gimmicks, it has the wrong gimmick.
7. **Casting.** Across the ring, each Monk Skin Tone appears once. Iris colours span the real range, with brown the most common, as in life. Eye shapes vary. No era gets a stereotype: each pairing is chosen for how that skin and iris read under that era's light.

---

## 7. Era cards

The casting is a proposal. Change any of it.

### 1970 · Terminal & ASCII
- **Person.** MST 9, deep brown iris (its fibres show only where the phosphor reaches), hooded lid, straight dense lashes. Around 50: a faint arcus and a slightly yellowed white.
- **Light.** A P1 green-phosphor CRT, curved and 4:3, with nothing else lit. The pupil is wide in the dark.
- **Gaze.** Slightly down at the terminal, reading along the lines.
- **Lens.** 16 mm film: heavy grain, red halation around the brightest phosphor, a little gate weave.
- **Pointer in the cornea.** A blinking block cursor.
- **Signature.** The green rows of text are the only colour in the frame. The edge between iris and pupil nearly disappears, and the reflection carries the eye.

### 1981 · Xerox Star & Early GUI (the grey bevel desktop)
- **Person.** MST 2, grey iris (R1) with white trabeculae, double lid, freckles on the lid, fair lashes with darker tips.
- **Light.** A bright `#c0c0c0` desktop on a paper-white CRT, with office fluorescent light from above. The pupil is small.
- **Gaze.** Straight ahead, with short hops between icons.
- **Lens.** A broadcast tube camera: soft, with bright highlights smearing into a short comet tail when the eye moves.
- **Pointer.** A black arrow.
- **Signature.** The squint: the bright screen narrows the lids and creases the outer corner.

### 1991 · The First Web Page
- **Person.** MST 4, hazel iris (R3) that is amber-brown inside and green-grey outside, monolid.
- **Light.** A greyscale workstation display in a black bezel, one column of text, a warm desk lamp as fill.
- **Gaze.** Reading: fixations left to right, a return sweep at each line, the page scrolling in step.
- **Lens.** 35 mm slide film, editorial: clean, with a warm and cool split.
- **Pointer.** An arrow.
- **Signature.** You can watch the eye read the reflected page, line by line.

### 1995 · GeoCities Explosion
- **Person.** MST 7, amber iris, a teenager: blue-white sclera, a bold limbal ring, a large pupil, a round double lid.
- **Light.** Clashing tiles and animated GIFs on a 15-inch CRT, so the light flickers in colour.
- **Gaze.** Scattered: many short fixations, jumping between whatever blinks.
- **Lens.** An early colour webcam at 320×240: block noise, auto-exposure pumping, smeared colour.
- **Pointer.** A hand, over links.
- **Signature.** The reflection flickers on the GIFs' timing, and the pupil chases it with small hippus pulses in sync.

### 1997 · Corporate Web & Frames
- **Person.** MST 1, blue iris (scattering with almost no pigment, a dark limbal ring), deep-set eyes, light lashes.
- **Light.** A beige 17-inch CRT showing a frames layout, under office fluorescents with a slight green cast.
- **Gaze.** Two targets: alternating between the nav frame and the content frame.
- **Lens.** A CCD camcorder: interlace combing on fast moves, sharpening halos, a cool white balance.
- **Pointer.** An arrow, which turns into an hourglass while the dive-in loads.
- **Signature.** A tired office eye: the lids sit a little heavier and more vessels show in the white.

### 2000 · The Search Box
- **Person.** MST 5, green iris (the rare one), almond eye with an epicanthic fold, mascara.
- **Light.** A white page with one box, the brightest era of all. The pupil is at its smallest.
- **Gaze.** Locked on the box, with microsaccades only.
- **Lens.** An early consumer digital camera at 640×480: JPEG blocks in the shadows, purple fringing and a vertical CCD smear on the bright reflection.
- **Pointer.** A text caret blinking inside the reflected box.
- **Signature.** Stillness. This is the only era where the eye barely moves, while the caret blinks in the cornea.

### 2003 · Web 2.0 Candy
- **Person.** MST 3, central heterochromia (R4: amber inside, green outside, a zigzag collarette), double lid, glossy.
- **Light.** Glossy gel UI, a white page, saturated badges.
- **Gaze.** The default idle pattern.
- **Lens.** A compact camera with an on-camera flash: flat front light and a hard catchlight.
- **Pointer.** A hand.
- **Signature.** Tap the iris and the flash fires, giving one frame of red-eye in the pupil before the dive in.

### 2009 · iPhone & Touch Web
- **Person.** MST 10, near-black brown iris, hooded lid that drops further because the eye is looking down.
- **Light.** A small portrait phone screen held low, so the key light comes from below. A warm lamp across the room: scrolling at night.
- **Gaze.** About 15° down, with the lid following. A small bright rectangle sits low in the cornea.
- **Lens.** An early 3 MP phone camera: soft, warm, noisy shadows, lens flare.
- **Pointer.** No cursor. The thumb shows as a soft dark blob covering part of the reflected phone at the pointer's position.
- **Signature.** Thumb scrolling: sweep velocity scrolls the reflected phone, with rubber-band overscroll.

### 2013 · iOS 7 Flat Revolution
- **Person.** MST 6, honey-brown iris (R2), upturned almond eye.
- **Light.** A daylight window and a phone: the window is the big soft reflection, the phone the small one.
- **Gaze.** About 10° down at the phone, with glances up at the window.
- **Lens.** A phone camera in the filter era: lifted blacks, a warm fade, a vignette.
- **Pointer.** A thumb, as in 2009.
- **Signature.** iOS 7's parallax: the two reflections, window and phone, shift against each other with the pointer or tilt.

### 2026 · The Pupil
- **Person.** The visitor, not anyone in particular. MST 8, rendered almost monochrome.
- **Light.** No screen. The cornea holds only a soft window, because this eye is looking at you.
- **Gaze.** Eye contact: it rests straight into the camera and follows the pointer more faithfully than any other era.
- **Lens.** Computational: clean, a little too sharp, monochrome.
- **Pointer.** None; the pupil itself tracks you.
- **Signature, the hand-off.** On tap, the iris dissolves outward into concentric rings of halftone dots, the pupil grows into the 2026 home page's halftone pupil (same ring pitch), and the lids become the black navbar lids. **This needs your approval.** The 2026 rule is "no iris on the page", and this keeps the iris on the loader only.

---

## 8. Vertical phases

### P0 status (2026-10-17): built, waiting on your sign-off

**Platform**
- `three` and `@types/three` are on r186, `@react-three/fiber` on 9.8.2, and `postprocessing` is pinned at 6.39.5 (the 6.38 it had capped three below r182).
- The upgrade broke the live eye: R3F 9.8 copies `uniforms` props (§9, rule 18), so the eye never faded in. That is fixed, and the live eye's DPR watchdog works again.

**Stage**
- `src/components/three/eye/` holds `EyeStage`, plus anatomy, tiers, the uniform registry, the motion rigs, the identity and look types, and the room, placeholder-eyeball and pipeline nodes.
- The renderer is WebGPU with an automatic WebGL2 fallback. Everything compiles behind the poster with `compileAsync`.
- The placeholder ball is there to prove the stage: gaze, debug views and framing. It goes away in P2.

**Posters**
- 20 AVIFs in `public/eye/posters/` (wide and tall for each era, 424 KB total; the loader fetches one). The lab captured them from the live eye.
- The loader paints a poster on its first frame. The live eye compiles behind it and crossfades in on `onReady`, then the poster leaves.
- Poster edges are feathered. At aspect ratios between the two captures (about 0.6–1.2), soft dark bands show at the sides until the live eye lands.

**Lab, at `/lab/eye`** (dev only; it renders without the loader, navbar or cursor)
- Controls: switch between the TSL and GLSL stages, force the WebGL2 backend, cap DPR at 1×, reduced motion, an era switcher, layer toggles, debug views, gaze and pupil holds, and a blink button.
- A drag-and-drop reference overlay that stays local.
- A frame HUD showing backend, tier, fps, CPU and GPU ms, draw calls and memory.
- Poster capture, written through the dev-only `/api/lab/eye-poster`.
- `?eye=tsl` on the loader swaps in the TSL stage (dev only).

**Measured**
- In-app browser: the WebGPU T3 placeholder costs 0.3–0.5 ms CPU and 1.4–2.9 ms GPU at DPR 1–1.5. WebGL2 T1 costs 2.8 ms GPU.
- Headless Chrome on software GPU:

  | | Poster painted | Eye ready |
  |---|---|---|
  | GLSL live eye | 0.4 s | 8.3 s |
  | TSL placeholder | 0.4 s | 1.9 s |

- Real devices from the matrix are still to do.

**Not done yet**
- The device-matrix run.
- A production `next build`; it was skipped because it would have overwritten the running dev server's `.next`.
- The bundle delta.

### The loader's words: the eras' orbit (2026-10-20), from your thirteenth review

You turned down the eye study (readout corners, a leader from the cornea, a scale along the bottom): the type and the concept did not suit, the old dial's U showed the eras better, and the wide screen's left and right sides sat empty. You asked for a clearer focus and a more intuitive layout.

**The idea.** The eras orbit the eye. A U wraps its lower half, and its arms climb the empty sides of the screen to the eye's own height. 1970 sits beside the inner corner, 2026 beside the outer one, and the years between swing down under the eye. The eye stays the subject; the orbit is the track you sweep along.

**The layout** (`components/ui/loader/EraOrbit.tsx`):
- **The track.** The lower half of an ellipse centred on the eye. It is as wide as the sweep (the 8% dead zones are left at each side), and its floor sits 58 px above the bottom. It fades out as the arms rise toward the eye.
- **Each era sits where the sweep puts it.** Its x is the sweep's x for that era, so the lit node is under your pointer as you sweep. Its y is on the ellipse.
- **Every year between two eras is a faint bead.** 1970–1981 is a long run of beads and 1995–1997 is one: the U shows the web speeding up.
- **The era you are on** is a node in its colour with a halo, which springs along the U. Its year label grows and takes the era's accent type.
- **Each year label is a button.** Labels hang outward from the track along its normal and are clamped inside the screen.
- **Inside the U, under the eye:**
  - the movement, in the era's accent type;
  - the year, large, in its display type and colour, arriving the way that era's interfaces did (`ARRIVALS`);
  - the name, in the era's body type;
  - the instruction, which rewrites itself once you have travelled and brightens over the iris.
- **A pool of the room's dark** under the words, so they read over the cheek.
- **On a phone** (narrower than 720 px, or portrait), the U flattens into a shallow bow along the bottom with the title above it. Only the era and its neighbours are named, and labels hang below their nodes.
- **The era's colour has a legibility floor:** a near-black accent (2026's) is lifted toward white on the dark room.

**The stage:**
- `frameBox`: the loader passes 16.5 mm below the eye, so the title clears the lower lashes inside the U.
- `eyeCentre()`: where the eye sits at rest, CSS px. The orbit centres on it, and re-reads it four times a second, so a resize or a reframing follows.
- `irisAt()`: the tap target uses it, so "tap the eye" lands on the live eye's iris.
- Without the live eye (the GLSL fallback, or before the TSL eye is up), the shared framing gives the centre. The GLSL eye fills the screen, so there the title lies over its iris; that eye retires at the P12 swap.

**The phone's 1970 eye looked shut:** it rests reading a page below its eyeline, and the hooded lid followed the gaze down. Its rest gaze is now −0.12 (was −0.35), and the upper lid follows a downward look at 0.7 (0.85 upward).

### The inner corner and the seams (2026-10-20), from your eleventh review

You said the caruncle looked glued on: background showed round it at extreme gaze, and it did not move with the eye. You also said a line ran from the inner corner into the skin and deformed as the eye moved, like a moulded sculpture.
- **The line was the skin mesh folding over itself.** Each skin column runs out along the margin's own outward direction, mixed toward the corner's bisector. Near the inner corner the tear lake's rounding (over the last fifth of the margin, since the azimuth crowds there) swung that direction fast, so neighbouring columns crossed: a fold with flipped normals, running out of the corner and moving with the lids.
  - Now each corner's fan starts at a fixed point (s = 0.62 inside, 0.72 outside) and turns evenly from the outward direction there onto the bisector (`lidColumn`).
  - The normals are a central difference along the ring, so the mesh's first and last columns, which meet at the inner corner, agree.
  - A second line ran out of the outer corner: the upper lid's hood carried on past it while the lower lid's relief faded, so the skin stepped where the two met. Toward each corner both lids now take the same blend of the two folds (`lidFolds`), so the hood flows round the corner.
  - The fine creases fade into the corners.
- **The caruncle.**
  - A flatter teardrop (2 × 1 × 0.9 mm) that tapers into the corner (egg 0.55–1.1).
  - It moves with the eye: 0.4 mm and 12% wider as the eye looks away from the nose (the plica pulling), the reverse as it turns in, and 30% flatter in a blink.
  - The lids' inner faces fold away into the inner corner (×0.15 by the tip), so no dark rim of them surrounds it; what remains is lit as flesh (0.75, was 0.45).
- **The white:** its vessels toward the inner corner are 1.3× (were 1.8×, which read as bloodshot loops).

### GPU cost (2026-10-20): ~25 ms → ~15 ms

You asked for the cost to come down for real devices. All figures are headless WebGPU on this laptop, 2003, at 1600 × 920 and pixel ratio 1 (1.47 MP).

**Where it went.** Measured by switching layers off, and by drawing the lids flat:
- The skin pass (the lids) was ~13–14 ms of ~25. About 15 value noises per pixel (≈ 60 hashes) plus seven texture reads, over most of the screen.
- Eyeball, cornea, lashes and tears together were ~4–6 ms.
- Post (focus, bloom, lens) was ~3.4–3.6 ms with nothing drawn.

**What changed (the image is the same):**
- **Baked skin detail** (`bake/skin-face.ts`). A 6 mm tile, repeating, holds the pores, grain, sheen variation and caruncle bumps; each noise's cells divide the tile exactly, so it has no seam. A face map holds the mottle, freckles and crow's feet. Both are made once and mipmapped, which also removes the shimmer where noise cells were smaller than a pixel.
- **The mesh-space bake** (`bake/skin.ts`) carries the lid creases' wobble and breaks in its spare B and A channels.
- **The fold shading** is worked out per vertex and passed down, not recomputed per pixel.
- **Work only where it shows.**
  - The brow's three reads happen only inside the brow, with gradients taken first so its mips stay right.
  - Lash-root unevenness is computed only near the margin, gland openings only on the inner faces, fine creases only where they run.
  - The skin's blurry screen sheen uses the screen's average colour; only the wet margins look the panel up.
- **Vertex stage:** each lid vertex builds only its own surface (inner face or skin), not both.
- **Devices:**
  - The pixel budget is 2.0 MP (was 2.4).
  - The watchdog gives up pixels sooner: under 45 fps it drops to 0.85× (was under 34 fps, 0.78×) and checks again after 1.5 s (was 3 s).
  - The frame still rests when the eye is still and the pointer idle.

**After:**
- About 15 ms on WebGPU at T3 (54–60 fps).
- WebGL2 / T1 about 11 ms (60 fps).
- A phone-shaped 430 × 900 about 6 ms.

The skin pass is still the largest, at ~6 ms with its geometry. Next candidates, if real phones need them: fewer lid mesh rows on T2, and a half-resolution skin far from the eye, where depth of field blurs it anyway.

### The lower lid and the frame (2026-10-20), from your tenth review

You said the lower lid's curve looked like cement, its lashes didn't connect, the eye sat too low, and a centred cursor opened a gap between the brow and the eye.
- **The lower lid:**
  - The last pass's waterline was a uniform, pale, matte ledge about 1 mm wide, with the lashes starting below it. It is now a thin wet rim: the inner face shows 0.5 of its run (0.2 at the corners), skin-toned at its front edge and pink and wet toward the eye, dotted with the meibomian glands' openings.
  - The intermarginal strip keeps only its gloss (no paler albedo, 0.4 mm).
  - The lower lashes grow from the margin's front edge (d 0.16–0.35 mm) and turn down at once (lean 0.7). A fine dark root line runs under them, so they read as growing from the lid.
- **The frame:**
  - `FRAME_BOX` is now 10 mm below the eye to 12 mm above. The eye sits about 1 mm below the frame's middle (was 2.75).
  - The brow is lower (its lower edge 8.2–9.2 mm, about 4–5 mm over the lashes, as in your photo), with its ridge and the roll under it lowered to match.
- **The gap with a centred cursor:** a cursor in the middle of the screen sits above the eye, so the eye looks up and the brow lifted with it.
  - The lift is now 0.6 mm at full upward gaze (was 1.1) and 0.3 with interest (was 0.5).
  - The hooded fold's stretch and bunch with the gaze is gentler (0.75–1.25).
  - Glare squints at 60%, so a white page narrows the eye without making it look sleepy.

### Skin and the brow's muscles (2026-10-20), from your ninth review

You said a pattern on the skin looked like an allergy, and that the brow only "zoomed in and out" instead of moving like a brow.
- **The "rash"** was last pass's oily sheen in soft clusters, which read as pale blotches on dark skin. The sheen now follows the skin's form (half-vector, wettest on the lid margins), broken only by fine pore-scale variation. Pores are finer (15/mm) and fainter (8%).
- **The zoom** was focus breathing: the camera widened its view a little whenever focus racked (e.g. to the skin, as the pointer neared the brow), so the frame scaled. It is gone; the frame never scales.
- **The brow by its muscles** (`browDisplace`, used by the hairs, the brow ridge and the roll under it):
  - **Frontalis** (`lids.brow`, mm) lifts the middle and inner brow most and the tail least, so the arch steepens as it rises. Driven by upward gaze (1.1 mm), interest (0.5 mm, the pointer resting on the eye), and a greeting flash.
  - **The greeting flash** is a 1.5 mm lift over 0.14 s, held 0.22 s, falling over 0.45 s. It fires 1.2 s after the eye first opens, and when a pointer arrives after 2.5 s away (at most once every 4 s).
  - **Corrugator** (`lids.frown`, 0..1) draws the head down (0.9 mm) and toward the nose (1 mm). Driven by glare (0.55) and by reading a page (0.22).
  - **Orbicularis** (squint, blink) lowers the brow, the tail most.
  - Reduced motion holds the brow at rest.

### Benchmark plan (2026-10-20), from your own eye

You shared a close-up of your own eye as the reference. You asked for:
- the inner corner (tear duct) and the lower lid with its lashes to be clear;
- the skin's bulge between the brow and the eye;
- the brow closer to the eye;
- the eye back to its old size in the frame;
- the brow and the folds moving with the eye;
- motion fit for a benchmark loader.

The plan below is read from your photo, from the eye's anatomy and physiology, and from what a loader can afford.

**What the photo measures** (iris ≈ 11.8 mm ≈ 300 px, so ≈ 25 px/mm):
- Fissure about 26 × 8.7 mm (height/width 0.33). The upper lid covers the iris's top ~1.5 mm; the lower lid sits at its foot.
- The brow's lower edge is about 5 mm above the lash line. A hooded skin roll fills that gap: its fold edge sits 1–2 mm above the lashes and casts a shadow onto the lid. The brow runs off the top of the frame.
- The eye spans about 75% of the frame's width; the iris centre sits about 55% down.
- The lower lid shows a thick margin, about 1.5 mm: brown skin outside, a pink wet edge inside, a bright tear line against the eye. A dense fringe of lower lashes leaves its outer edge, heading down and toward the camera.
- The inner corner sits lower and is moist and pink, with red conjunctival vessels running toward it.
- The skin is oily and glossy, the sheen broken into pore-sized highlights, with mild wrinkles under the eye. Around the eye it is darker than the cheek (periorbital pigment). The iris is near-black brown with a blue-grey haze at the limbus.

**The work, one item at a time:**
1. **Framing and proportions.**
   - Fissure: upper 4.4 mm, lower 5.2 mm.
   - Brow's lower edge about 5 mm above the lashes.
   - FRAME_BOX: 7.5 mm below to 13 mm above, 32 mm across. On a 1.73:1 screen the eye fills about 70% of the width, as before the brow was added, and the brow sits along the top.
2. **The hooded roll.**
   - A convex roll of skin from the fold edge (about 1.5 mm above the lashes) up into the brow: the brow fat pad and the skin over the supratarsal crease.
   - It overhangs and shades the lid under it, takes a soft highlight on top, and replaces the hollow under the brow.
3. **The lower lid.**
   - The margin (intermarginal strip) shows as a band about 1.2–1.5 mm wide. It is skin-coloured outside, has a mucocutaneous line, and is pink and wet inside, with the tear meniscus as a bright thread.
   - Lower lashes: about 1.5× as many, longer (≈ 4.6 mm), darker, heading forward then down.
4. **The inner corner.**
   - Tear lake, caruncle and plica in deeper flesh tones.
   - The lower punctum's small rise on the margin.
   - The conjunctiva reddening and its vessels thickening toward the corner.
   - Wet glints on the caruncle and the tear lake.
5. **Skin.**
   - An oily sheen broken into pore-scale highlights.
   - Pores that read at this size.
   - Mild wrinkles under the eye and fanning from the outer corner.
   - Periorbital pigment (the skin darker round the eye than further out).
   - A blue-grey limbal haze on the near-black iris.
6. **Motion.**
   - **Brow** (frontalis, corrugator, orbicularis):
     - rises about 1 mm as the eye looks up;
     - lowers as it squints;
     - dips a little with each blink;
     - lifts with interest (the pointer resting on the eye).
   - **Hooded roll:** stretches as the lid opens (looking up) and bunches when looking down.
   - **Lids:** already follow the eye's pitch (lid saccades) and blink with big saccades; keep them.
   - **Pupil:** light reflex, near reflex, arousal and hippus stay.
7. **Verify** every era at the common screen shapes, then update the docs and memory.

**Done (2026-10-20).** What landed, by item:
1. **Framing and proportions.**
   - Fissure 4.4/5.5 mm: the upper lid over the iris's top, as in the photo.
   - `FRAME_BOX` 7.5 mm below to 13 mm above, 32 mm across. The eye fills about 60–70% of a 1.73:1 frame; the brow runs along the top edge, cropped as in the photo.
   - The brow's lower edge sits 9.2–10.3 mm above the eye's centre, about 5 mm over the lashes.
2. **The hooded roll.** The hollow under the brow became a fat pad (0.9 mm), and the brow ridge moved down to the brow. Hooded lids keep the fold edge about 2 mm over the lashes with its shadow on the lid.
3. **The lower lid.**
   - The waterline's inner face shows 0.9 of its run (was 0.28).
   - A 0.7 mm glossy, paler intermarginal strip sits outside it, with the lash roots at its outer edge.
   - Lower lashes: 100 at T3 (70 at T2, 24 at T1), 4.6 mm, thicker, rooted at d ≈ 0.6–0.8 mm, heading forward then down.
   - The tear meniscus is a thread (weaker, and running a shorter way up the inner face).
4. **The inner corner.**
   - The caruncle and the waterline are deep flesh on dark skin.
   - The white pinks toward the inner corner, and its vessels thicken there (×1.8).
   - The caruncle's sheen is wetter.
5. **Skin.**
   - Pores at 12%.
   - Periorbital pigment (×0.8 at the margin, easing out by 12 mm).
   - Under-eye wrinkles further down and deeper.
   - An oily sheen in soft clusters (not points).
   - A little more light on the skin (×1.18) so the lashes read.
   - The iris gets a blue-grey limbal haze (arcus 0.3).
6. **Motion.**
   - New `lids.brow` (mm): 1.1 × gaze up (to −0.6 down), −0.9 × squint, −0.35 × blink, +0.5 × interest (the pointer resting on the eye, eased). It is damped at 6/s, so the brow trails the eye; reduced motion holds it at rest.
   - The brow's hairs, its ridge and the roll ride with it; the roll flattens as the brow lifts.
   - The hooded fold stretches looking up and bunches looking down (× 1 − 3.5·pitch, 0.6–1.5).
   - The lids already follow the eye's pitch, and big saccades bring blinks.

**Cost:** about 27 ms of GPU at 1600 × 920 headless. P12's device matrix must bring the lid shader down (the brow, vellus, grain and sparkle reads), perhaps by moving the static skin detail into the skin bake.

### The brow in the frame (2026-10-20), from your seventh review

The brow still left the frame on your laptop (about 1.73:1). Its hairs reach 3–6 mm past their roots, up to about 19 mm above the eye, and the shot only held up to about 15.7 mm.
- **Framing by a box** (`FRAME_BOX`, `tslFrame`). A wide screen fits a box from 9 mm below the eye's centre to 18 mm above it, 40 mm across, whichever way the window needs, and centres on it.
  - On a 16:9 or 16:10 window the shot is 27 mm tall and 43–48 mm wide.
  - On an ultra-wide window it is wider still.
  - The brow, a little forehead, the lids and the lower lashes are always in.
  - Portrait screens keep the shared framing (eyeball crop, no brow). This replaces the fixed 42 mm width and drop.
- **The brow:**
  - A little lower (lower edge 10.2–11.5 mm) and more compact (2.8–3.5 mm deep).
  - Shorter hairs (head 2.6–4 mm, body up to 5.4); the head's stand a little less upright.
  - Denser: T3 720 hairs, T2 540.
  - Its colour is the lashes' black-brown, at 97% coverage.
  - Its sheen is faint (0.012) and even, so dark hair on dark skin no longer reads grey. A per-hair glint drawn from value noise showed as square blocks and is gone.
- **Skin:**
  - The page's sheen on the skin is softer (mip 6, 0.1 off the waterline).
  - The screen's picture on the face is a smooth wash (mip 8, 22%), so its layout no longer shows as patches.

### One person (2026-10-20), from your sixth review

You reviewed 1970 on a laptop. You said:
- the background moved too fast;
- the brow didn't show;
- the faces' tones varied: keep one dark, South Indian tone, as the old eye had;
- the layers looked creepy and surreal;
- the inner corner was a plain point, with none of the anomaly a real one has;
- the skin's bulges, texture and moulding were missing;
- the lashes needed a layer that frames the eye.

You asked for research into how a real eye works. What it says:
- The lateral canthus is acute. The medial canthus is rounded, set apart from the eye by the lacus lacrimalis, a small tear-filled triangular lake that holds the caruncle and the plica semilunaris.
- The caruncle is skin-like tissue with fine hairs and glands: granular and fleshy, not glossy.
- Lashes grow in 2–3 rows from the lid's front edge, ahead of the grey line. The upper ones are longer, more numerous and curve up.
- Character pipelines add an eye-occlusion layer (the lids' soft shadow all round the eyeball), or the white reads overexposed.
- A sclera is never pure white or perfectly smooth.

What changed:
- **One person in every era** (identity.ts):
  - Monk 9 skin, as the old eye's near-black skin in a dark room was.
  - A dark brown iris (#5e3c22 / #4a2e1a, melanin 0.85), light enough to show its fibres under the screen.
  - Black lashes and brow, no mascara.
  - A warm white (#e4dccb).
  - Hooded lids, tilt 2.
  - The per-era casting (irises, Monk tones, lid types, lashes) is gone. The eras differ by their screen, light, lens and gaze. The lab can still try other faces.
- **The screen at a size a cornea can hold.** The era screens are drawn at 0.62 of their size (`SCREEN_SCALE`), so the page covers about 60% of the iris instead of all of it. A whole-iris reflection read as a lens, not an eye.
- **The inner corner** (`marginsAt`): the last 8% of the medial half closes in a rounded end about 2 mm tall (the tear lake), each lid holding its height there and rounding off like a circle. The caruncle is smaller (1.7 × 1.05 × 1.1 mm), sits lower so both lids overlap it, and is fine-grained and matte, with a dull, broken sheen. On dark skin it and the waterline are a deep rose-brown, not a glowing pink. The plica moved beside it.
- **Form:**
  - The face shell has a hollow under the brow, the nose rising toward the inner side, and the cheek's swell.
  - An overhead room light (×0.84–1.12 by how far the skin faces up) lets bulges read: lit on top, shadowed under.
- **The lash line:** the upper lash line is a dense dark band of roots (0.88), slightly uneven along the lid, framing the eye. The lids' contact shadow now rings the lower margin too (0.3 within 0.9 mm).
- **A calmer background:**
  - Grain re-rolls at 12 fps (was 18); 1970's grain is 0.075 (was 0.11).
  - Real pages scroll at half the stand-in's pace.
  - The screen's picture on the skin is sampled at mip 7, colour without the page's shapes moving across the face.
- **Smaller fixes:** the skin grain is even, not streaked; the bake's lines are finer; the brow's sheen is gentler; the globe's key is a little lower, so the white is not a lamp.

### Realism revision (2026-10-18), from your fifth review

You said the eye was so perfect it read as robotic. You asked for:
- a brow;
- fuller lashes and lower lashes, rooted on the lid;
- bulges above and below;
- a caruncle that blends in, with era tones (greener for 1970);
- no stark black;
- a better pupil;
- the missing hair.

What changed:
- **Framing.**
  - A wide screen now frames 42 mm across (was 28.5), with the eye 3.6 mm below the middle. The brow sits along the top and the lower lid's bulge along the bottom. This walks back the first revision's "eye across the full width": the brow can't be in a 16:9 shot otherwise.
  - The framing sets the width itself (`tslFrame`) and blends to the shared framing on portrait screens, which still crop to the eyeball.
  - Depth of field is eased to match the smaller magnification (bokeh 6.5 → 2.8).
- **The brow** (`bake/brow.ts`):
  - About 560 tapered, bent hairs, drawn once by canvas 2D into a map laid on the skin in face space. It follows every fold and costs a texture read.
  - The flow is a real brow's: the head stands up, the body's lower and upper hairs meet in a herringbone, and the tail runs out and down. The edges are feathered.
  - Each hair is lit along its length (Kajiya–Kay), lays a thin shadow away from the screen, and darkens the skin a little. Its colour comes from the person's lashes.
  - A tile of faint vellus hair covers the rest of the face and catches the light at a glance.
- **Lashes:**
  - Shorter (upper 7.2 mm, lower 3.8), with lengths and angles varied so strands cross.
  - Clumps gather their tips to a point.
  - Kept over the eye: no fan past the corners.
  - Fuller (T3 180 upper, 64 lower).
  - Lower lashes lean down at once and grow from the margin's front edge, under a thinner, wet-pink waterline, with a fine dark line of roots. They no longer start below a pale band.
- **Skin:**
  - The upper lid swells over the crease for everyone.
  - The lower lid has a pretarsal roll, the lid–cheek crease, and a soft bag below it.
  - Fine broken lines follow the lid (a dark line with a lit edge). Pores and grain are laid across the face, so no skin reads as plastic.
  - The crease's shadow is capped (never a black stroke, which deep-set 1997 had), and the groove is shallower.
- **Imperfection:** each margin has a little unevenness (about 0.2 mm, different on the two lids), and the pupil's margin is uneven by a few percent. The hippus is a little stronger, with a slow fourth component.
- **No stark black:**
  - The canthus shading is halved (0.55 → 0.28), and so is the lid's corner pocket (0.45 → 0.22).
  - The globe's darkening toward its silhouette is floored at 0.5 (was 0.35).
  - The screen's picture on the skin is softer (mip 6.2) and can no longer cast near-black shapes on it.
  - The lab's shots drop Next's dev-tools badge.
- **The caruncle:**
  - It pales toward the white into a plica and thins away there (transparent at its lateral end and its turned-away edges, drawn before the cornea).
  - It takes the screen's hue, as wet flesh does.
- **Era tone:** the lens gains `phosphor`. 1970's monochrome now leans green, as the terminal's phosphor does.
- **Cost:** about 21 ms of GPU at 1600 × 1000 headless (the brow, vellus and grain reads are in the lid shader). This goes to P12's device matrix.

### Real pages on the screen (2026-10-18), from your fourth review

You said the screen in the reflection was a stand-in (painted text in a generic window) and asked for each era's real interface from the codebase.
- **Captures.**
  - `npm run eye:screens` (scripts/eye-screens.mjs) drives the dev server as a returning visitor. For each era it sets `portfolio-theme`, marks the loader seen, opens `/`, and captures the home page as it ships, navbar and era scrubber included.
  - Output: `public/eye/screens/<era>.webp`, 768 px wide (the 1280 × 720 viewport at 0.6, the screen pass's own width), up to three viewports tall. 10–125 KB each, about 600 KB for all ten.
  - Re-run it when a home page changes.
- **The screen pass** (`screen-pages.ts`, `nodes/screen.ts`):
  - It shows the era's page, scrolled through one viewport. It runs down to the foot and eases back up, rather than jumping. A page one viewport tall stands still.
  - The era's display (scanlines, pixel grid, dither, posterise, panel technology) and the visitor's cursor still apply. Dither is at 40% on a real page, because its greys would otherwise turn to checkerboard.
  - Until a page arrives, or if it fails, the painted stand-in shows.
  - Pages load per era, on demand. A change of era crossfades from the page that was up to the one that has arrived.
- **Everything that reads the screen now reads the real page:** the cornea's reflection, the sclera's and tear film's sheen, the picture thrown on the skin, and the key light's colour and level. So a dark page (2009's wood) lights the face less than a white one (2000's search page).
- **Lab:** "Real pages" (Camera & lens) toggles it, and `pagesInfo()` reports which era each slot holds. The parity gate turns it off, since the live GLSL eye has only the stand-in until P12's swap.
- **Rule 29 (swapping a texture inside a graph):**
  - Keep one texture node per slot and set its `.value`; `sample()` clones follow it.
  - Give each slot its own placeholder. Two nodes built on the same texture become one binding, and both slots read the first.
  - Give each swapped-in texture a version of its own. Bindings rebind only when the new texture's generation (taken from its version) differs, and every freshly loaded image is at version 1.

### Engraving revision (2026-10-18), from your third review

You showed an anatomical engraving of the eye. You said the shape still didn't match, and nor did the "bezel" round the opening.
- **No rim round the opening.**
  - The bezel was the margins' inner faces: laid out radially from the globe, they showed as a band about 0.6 mm wide all round the aperture, up to 1.2 mm at the corners.
  - They are now turned nearly along the view (`rimShow`): 14% of the upper face shows, so the lashes sit right on the white. Half of the lower face shows mid-lid, thinning to 16% at the corners: a thin pale wet edge.
  - The lid shadow on the white (`socketShade3d`) is measured from where the margin's front edge now falls.
- **Pointed corners.**
  - The margins were bowed in s, which runs evenly in azimuth and crowds into the corners as the globe turns away. The inner corner's last fifth of s spanned about 1 mm, so the opening ended in a blunt, rounded end: the boot.
  - The arcs are now bowed in the projected x (`marginsAt`), so both corners taper to points.
  - The inner corner sits 0.075 rad lower than the line between the corners, and the outer one lifts by the era's tilt.
- **A caruncle in the inner corner.**
  - A small mesh rides on the socket (`caruncleMaterial`): a lumpy, wet pink mound, tucked under both margins.
  - It reads as a teardrop: pointed where the lids meet, rounded against the white.
  - Its colour follows the skin's tone, as the waterline does, and it sits in the corner's shadow.
  - A faint pink plica tints the white beside it.
- **Folds.**
  - One function (`lidFolds`) gives both the relief and the shade.
  - Upper lid: the crease hugs the margin near the nose and rises over the middle, with the skin above rolling forward over it. Its visible height (`creaseD`) is now 2.5–5 mm over the lashes, so the pushed-in shot shows it.
  - Lower lid: a soft pretarsal swell, the lid–cheek crease, and a fainter second fold. These show most on tall screens.

### Almond revision (2026-10-18), from your second review

You said the eyeball's size was right, but the opening was too small and narrow for it, and the outline read as a boot rather than an eye. You want an almond.
- **An open almond.** The upper margin now sits just over the top of the iris (5.4 mm; it was 4.5, 1.5 mm into the iris) and the lower one at its foot (6.0 mm; was 5.6). The fissure is about 26 × 11.4 mm. This revises P2's anatomical "lids cutting the iris".
- **Near-symmetric arcs** that meet in pointed corners. Only a hint of asymmetry is left: the upper lid's peak a little toward the nose, the lower lid's lowest point a little toward the temple. The stronger asymmetry of the first revision was what read as a boot.
- **Every outer corner lifts 2–5°** (1970's was drooping at −1°).
- **Softer narrowing.** The hood and epicanthic fold are lighter (hood 0.65, fold reach 0.035 rad × 0.6 for epicanthic). 1981's squint floor dropped from 0.9 to 0.35: a hint, not a narrowed eye.
- **Thinner margins.** Lids are 1.1 mm thick (were 1.5), so the waterline and the upper inner face no longer read as thick rims when the eye fills the frame.
- **The inner corner is one caruncle.** A pink, bumpy mound shaded as one across both lids' inner faces, lit as facing out of the corner. Before, the upper face was dark and the lower red, with a hard seam between.
- **The screen's picture on the skin is softer** (mip 5.6, 45%), so its pixels don't compete with the eye's outline. The colour still comes through.

### Look revision after batch A (2026-10-18), from your review in the lab

You asked for:
- the eye across the full width, with less of the face;
- the interface's light and reflection on the skin;
- the eye's shape in the face, which was still pending;
- grain;
- less motion: it was irritating to watch.

**Framing.** On a wide screen the TSL eye is pushed in until the fissure spans the width (`FILL_WIDTH_MM` 28.5). This replaces P2's "about half the frame's width". Portrait screens already crop to the eyeball and are unchanged. The shared framing (dial, picker hit-tests, the live GLSL eye) is untouched; the TSL stage scales it in `tslFrame`, so the iris hit-test and the mip bias follow.

**Shape.**
- The almond is asymmetric now. The upper lid peaks a little toward the nose (the apex sits at φ −0.07), falls steeply into the inner corner and runs a long, gentle slope to the outer one.
- The lower lid's lowest point sits toward the temple: it rises early and almost straight into the inner corner, and turns up sharply into the outer one.
- The inner corner's pocket is the caruncle (pink, bumpy, lit), no longer a black wedge.
- The upper margin's inner face is shadowed mucosa, not near-black eyeliner.

**The interface on the skin.**
- The screen's picture is thrown softly across the face, as from a projector (blurred at mip 4.7, relative to its average, 60% on skin that faces the screen). The page's colours and layout fall on the skin: GeoCities' purples and greens, the Xerox desktop's greys.
- The skin's sheen is a sharper mirror of the interface (mip 4.8, was 8), broken up by the skin's pores and lines, and glossier on the lids.

**Grain.**
- Every era has at least 0.04 (2026: 0.025), so the dark room behind the face has grain too.
- Grain re-rolls at 18 fps instead of every frame: a 60 Hz shimmer tires the eye.
- 1970's gate weave is slower and smaller.

**Calmer motion.**
- Fixations about 2.5× longer: free viewing ~700 ms, reading ~400 ms (the reading script now takes the era's `fixMs`).
- Microsaccades smaller (0.1–0.6°) and rarer (0.6/s at rest); drift at half speed.
- The page in the reflection scrolls at half the era's rate.
- Measured over 7.5 s: free-viewing eras now make 1.1–1.5 saccades a second (were 3–4), reading 2.4 (was 4.1); median fixations 320–780 ms.

**Cost.**
- The pushed-in eye covers about four times the pixels it did, so the cornea and iris now cost ~3–5 ms. The whole frame runs ~14–17 ms headless at 1280 × 720 (it was ~10).
- The cornea's two per-pixel fbm ripples were replaced by the tear film's own lipid pattern, which is free.
- More may be needed at P12's device matrix: fewer parallax and dispersion samples on T2, or a lower cornea DPR.

### P11 batch A status (2026-10-18): 1970, 1981, 1991 built, waiting on your sign-off

**New for every era** (data for batch A now; the rest stay on the shared defaults until their batch):
- **Each era's screen as its own light** (`look.ts` `ERA_LIGHT`): device, key direction, the rectangle the cornea mirrors (still larger than life, so the page stays legible).
- **A second light** (`FillLight`): a direction and colour that light the skin, the white and the lashes. It shows in the cornea as its own small reflection, traced like the screen: a bar, or a disc when `round` is 1. The colour crossfades between eras.
- `squintRest` is a floor under the squint. `stepScroll` makes the page scroll only when the reading eye turns a page: the gaze rig counts page turns, and `ScreenDriver.kick` eases the page up by what was read.
- **Faces:** `skin.freckles` (small, clustered, across the face, thinning far out) and a per-era `sclera` override.
- **Lens:** `isolate` keeps colour only where the emissive target (the reflection) is. On WebGL2, which has no emissive target, an isolating era keeps all its colour instead.
- **TSL posters**, staged apart (`public/eye/posters/tsl/`) so the loader's poster still matches the live GLSL eye that fades in over it until P12.
  - The capture route takes `set: "tsl"`. The lab can render the TSL stage off-screen at each poster size (EyeStage gained a `capture` hook) and has a "TSL posters A/B/C/2026" button per batch.

**1970 · Terminal.**
- **Light:** a green-phosphor CRT a little below the eyes, nothing else lit.
- **Person:** around fifty, so the white is yellowed (`#e3dbc2`, age 0.75) and more vessels show, and the iris has an arcus (P4).
- **Lens:** 16 mm film: grain 0.11 at 1.9 px, red halation 0.65, gate weave, a vignette.
- **Signature:** black and white except the green rows in the cornea (sat 0.04, isolate 1).
- **Gaze:** reading the terminal, slightly down (P9).

**1981 · Xerox Star.**
- **Light:** a paper-white CRT up and to the left, office fluorescents overhead. The cool fill lights the face from above, and the tube shows as a bright arc along the top of the cornea, bent by the dome, partly under the lid.
- **Person:** freckles on the lids and cheek (0.65).
- **Lens:** broadcast tube: soft (sharpen −0.5), bloom ×1.35, a comet tail on moves, a touch cool.
- **Signature:** the squint never drops below 0.9. The lids sit narrowed and the outer corner creased.

**1991 · First web page.**
- **Light:** a greyscale workstation straight ahead, a warm desk lamp low to the left. The lamp warms that side of the face and sits as a small warm disc on the left of the cornea.
- **Lens:** 35 mm slide: fine grain, a warm/cool split (0.6), a touch of saturation and contrast.
- **Signature:** the eye reads the page line by line (P9's reading script). The page stays put while it reads down seven lines, then scrolls by what was read as the eye returns to the top. Measured: scroll 0 → 0.16 at the page turn, pitch +1.5° → −5.2° over the lines.

**Checked:**
- All three on WebGPU and WebGL2; 1970 keeps its green on WebGL2.
- TSL posters captured: wide and tall for all three, 29–96 KB each.
- No console errors; lint and tsc clean.
- GPU 10.8–12.5 ms (WebGPU, headless, DPR 1) and 5–6.4 ms on WebGL2/T1.

**Not done:**
- Batches B, C and 2026.
- The 1970 curved-CRT reflection is the generic tube treatment, not a real curvature.
- The posters aren't in the loader yet (P12).
- No real devices.

### P10 status (2026-10-18): signed off

**What's in** (`post/pipeline.ts`, `post/focus.ts`, `post/era-lens.ts`; numbers in `look.ts` `ERA_LENS`)
- **The chain:** pass with MRT (output plus an 8-bit emissive target) → depth of field → bloom on emissive only → era lens (linear) → exposure and the room's falloff → filmic → era lens (display) → sRGB.
- **Emissive.** The cornea writes its reflection (and a flash catchlight) through `mrtNode`, and the meniscus writes its bead. Lashes write zero, weighted by their coverage, so they hide the glow behind them. Everything else writes nothing, so the white of the eye never blooms.
- **Depth of field (`post/focus.ts`, custom).** three's `DepthOfFieldNode` (a 64-tap near/far gather) cost ~10 ms a frame here. This one costs ~1 ms:
  - colour plus a signed circle of confusion at half resolution;
  - a 9-tap gather across, then down, where a tap counts only if its own blur reaches the pixel. Soft lashes in front spill over the sharp iris (a near field); the sharp iris never smears into the soft face;
  - a full-res mix in the lens pass.
  Lashes now write depth (nothing draws after them), so they defocus where they stand.
- **Rack focus.** Focus follows what the pointer is over: the iris plane (11.6 mm from the globe's centre), the lash band (15.5 mm), or the face (a height-field guess), at ~0.35 s. A macro lens's breathing widens the view ~0.3% per mm of rack. Reduced motion keeps it on the iris.
- **Bloom:** three's `BloomNode` on the emissive target, at quarter resolution, threshold 0.42, strength 0.25 × the era's bloom.
- **The era lens.** Every number is a uniform, damped between eras. When the artefact changes, the old one fades out before the new one fades in. `lens.on` is the kill switch: off leaves a clean photograph (focus, bloom, the grade).
  - **Linear:** gate weave, webcam blocks (320 × 240), interlace combing (a field late on moves), lateral chroma, sharpen/soften (unsharp mask), halation (bloom tinted red), the tube's comet tail, CCD smear plus JPEG shadow blocks plus purple fringes, flare ghosts, auto-exposure pumping, white balance, split tone, saturation.
  - **Display** (on the encoded value, so a lift of 0.09 means 0.09 on screen): lift, gain, gamma, and grain from a sin-free hash (the sin hash striped).
  - Chroma, sharpen and halation are branches on uniforms, so eras that don't use them pay nothing.
- **Per-era first pass** (P11 tunes each):

  | Era | Lens |
  |---|---|
  | 1970 | 16 mm film |
  | 1981 | Broadcast tube, comet |
  | 1991 | Slide split |
  | 1995 | Webcam |
  | 1997 | Camcorder interlace and halos |
  | 2000 | Digicam CCD/JPEG |
  | 2003 | Compact with a flash catchlight |
  | 2009 | 3 MP phone, warm, soft, flare |
  | 2013 | Filter fade |
  | 2026 | Computational: sharp, monochrome |

- **Lab.**
  - A Camera & lens section: era lens on/off, focus auto/iris/lashes/skin, and a focus readout.
  - New debug views: `focus` (red in front of the focal plane, blue behind) and `emissive`.
  - Control hooks: `lensOn`, `holdFocus`, `focusZ`.

**The gate.**
- Lens off is a clean photograph, with the iris sharp and the lashes and face soft.
- Lens on gives each era one cue. The strongest: 1970 film, 1995 blocks, 1997 combing on a saccade, 2003 catchlight, 2026 monochrome. 1981's comet, 2000's smear and blocks, and 2009's flare show on motion or in the shadows.
- The rack focus reads in the focus map.

**Cost** (headless, real GPU, DPR 1, 1280 × 720). Median frame 10.1 ms with the whole chain, against ~7.9 ms with the post reduced to the grade alone, so the post costs ~2.2 ms. That is inside the 2.5 ms budget.

**Deviations from the plan:**
- **Depth of field.** It is the custom half-res gather above, not three's node (cost). Both T2 and T3 use it; T1 has none.
- **WebGL2 has no emissive target.** The cornea's emissive output only works through `outputNode` + `mrtNode`, and that path fails inside three on WebGL2: `addToStack` of undefined. A custom fragment skips three's MRT merge, and an `outputStruct` clashes with its MRT names (rule 27). So on WebGL2 (T1) nothing blooms and the lens's smears have nothing to smear. The lens's other cues still work.

**Not done:**
- Per-era tuning of strengths (P11). 2000, 2009 and 2013 are subtle at rest.
- Focus breathing is tiny by design, so it isn't visible in stills.
- Bokeh is round-ish, not shaped by an aperture.
- No real devices.

### P9 status (2026-10-18): signed off

**What's in** (`rig/gaze.ts`, a pure-TS state machine; per-era numbers in `look.ts` `ERA_GAZE`)
- **Three motions, never blended.**
  - **Fixation.** A slow drift (an Ornstein–Uhlenbeck walk at ~0.5°/s, leaning back to the point), with microsaccades that mostly pull it back. Microsaccades are 0.15–0.9°, ~1–2 per second in long fixations, and naturally rare in 225 ms reading fixations.
  - **Saccade.** Main-sequence duration (2.2 ms/° + 21 ms) on a minimum-jerk profile, so peak ≈ 1.875 × amplitude / duration. Big jumps (> 8°) land 4–10% short, and a corrective saccade follows 110–170 ms later.
  - **Pursuit.** The eye follows the pointer's low-passed velocity a beat late, capped at 30°/s and nudged onto it. When the pointer gets > 1.6° ahead, a catch-up saccade lands where the pointer will be, trusting only pursuit-like speeds (a jump's velocity spike doesn't throw the landing).
- **Fixation durations** come from a gamma distribution (long tail), not a uniform one.
- **Per-era patterns**, driven when no pointer is active:

  | Era | Pattern |
  |---|---|
  | 1970 | Reading, slightly down |
  | 1981 | Short hops among icons |
  | 1991 | Reading, with 12% regressions and return sweeps |
  | 1995 | Scatter: 170 ms fixations, big jumps |
  | 1997 | Two targets: nav frame ↔ content |
  | 2000 | Lock: drift and microsaccades only |
  | 2003 | Free viewing |
  | 2009 | Scroll: 15° down, riding the content up at ~2.8°/s, then jumping back down |
  | 2013 | Two targets: 10° down at the phone, glancing up at the window |
  | 2026 | Contact: microsaccades, and the most faithful pursuit |

  Gaze units now run past ±1 in pitch (down to −1.7), so the phone eras look 10–15° down and the lid follows.
- **Blinks.**
  - The mean interval is per era: reading and staring 5.5–6.5 s, scanning 2.6 s, otherwise ~3.6 s (15–20 a minute). Intervals are drawn exponentially around that mean, and 18% are doubles.
  - Gaze-evoked blinks scale with saccade size: probability 0 below 12°, rising to 70% at 35°.
- **The idle throttle, fixed.**
  - It used to skip 2 of 3 frames without carrying the skipped time, so the eye's clock ran at a third of real speed whenever the pointer was idle.
  - Skipped time is now carried. The throttle only rests while the eye has held still for 250 ms: never through a saccade, its wobble or a blink.
  - The hidden-tab stop is unchanged.
- **Wobble and lid coupling** (P4/P6) now run off real saccade profiles.
- **Lab.**
  - A Gaze section: yaw and pitch over 6 s plus the scanpath (like eye-tracker output), the pattern in force, the blink mean, and a pattern override.
  - Control hooks: `setGazePattern` (a no-op when unchanged, so the panel's re-applies don't restart the script), `gazeTrace`, `gazeLog` (the last 200 saccades), `gazeInfo`.

**The gate: traces look like eye-tracker data.**
- **Free-viewing eras,** measured over 7.5 s from the saccade log:
  - 3–5 saccades per second;
  - median fixations 160–250 ms (reading ~205–225);
  - peak velocities 270–590°/s;
  - the largest jumps 50–70 ms.
- **Lock and contact:** no saccades, 1.6 microsaccades per second.
- **Reading:** staircases with return sweeps (16°, 536°/s).
- **Pursuit test** (synthetic pointer):
  - At 10°/s the eye stays in pursuit throughout, lagging 0.58° on average (max 1.05°).
  - A 14° jump draws one catch-up saccade.
  - A 60°/s sweep draws a train of 2.5–4.3° catch-ups.
- CPU is 0.2–0.7 ms per frame for the whole stage.

**Not done:**
- No vergence: there is one eye.
- Blink and saccade timing are not yet tied to the era screen's content (where its GIFs blink, where its text actually is).
- The 1991 page doesn't scroll in step with the reading yet.
- The throttle's carried time is checked by reading the code. The lab never throttles, so it can't measure it.

### P8 status (2026-10-18): signed off

**What's in**
- **The tear film** (`bake/tear.ts`). A map of the cornea's disc (film coordinates: ±1 at the limbus, y up) that rides with the cornea: 256² at 60 Hz on T3, 128² at 30 Hz on T2, laid down once on T1. Channels: R thickness, G the lipid layer's pattern, B weak spots.
  - **Laid down fresh** while the lid is shut, with a new lipid pattern and new weak spots each blink.
  - **Creep.** For ~1 s after the lid opens, the film is dragged upward after it (0.6 film units/s, decaying over 0.5 s), carrying the lipid pattern up through the highlight.
  - **Thinning.** About 2%/s everywhere and up to 10%/s over weak spots, so spots break up after about 8 s without a blink. A little diffusion lets the film around a spot drain into it, so spots spread and nothing is sharp.
  - **Cost.** The noise behind spots and lipid is worked out only when the film is laid down (an `If` on a uniform), and carried after that. An ordinary step is five samples, plus a copy back so samplers always read one texture. Nothing steps under reduced motion, which keeps the film fresh, since no blink comes to clear it.
  - **One code path.** The plan said compute on WebGPU and a fragment ping-pong on WebGL2. At these sizes one fragment ping-pong serves both backends.
- **The cornea reads the film.**
  - Its slope tilts the mirror.
  - Dry spots roughen the surface (the existing ripple is up to 3.5× stronger there, and up to +2.4 mip of blur) and dim the reflection by up to 30%. After a stare the page's reflection breaks into patches.
  - On T3, the lipid layer tints the highlight with faint interference colours (16%, none where dry).
  - A new `tear` debug view: thickness in grey, broken-up spots in red, the lipid drift in blue.
- **The meniscus** (`nodes/meniscus.ts`). One strip along both margins, built in the vertex stage on the lid mesh's columns, so it rides blinks, gaze and squint.
  - Across it: from the globe, a bead's width into the aperture, through the corner where the lid touches the globe, up the margin's inner face. It is a quadratic with its control point in that corner, so the surface is concave.
  - Its normal sweeps from the globe's to the lid's, so the screen lands on it as a thin line wherever the geometry says. The lower bead faces up into the light and shines; the upper one faces down and stays faint.
  - It is additive, weighted like the cornea's mirror.
  - Its width is 0.22 mm, wider in the lacrimal lake at the inner corner, 25% fuller just after a blink, and up to 2.2× with reflex tears.
  - `lid-mesh.ts` now exports `innerAt` (the margin's inner face).
- **Reflex tears.** Four or more eras in one second adds tearing (+0.25 per change, up to 1). It fades over ~6 s and makes the bead wider and brighter. Measured: six eras in quick succession gave tearing 0.65.
- **Lab.**
  - A Tears section: Stare (no blinks), Blink now, Reflex tears, and a readout of seconds since the blink and tearing.
  - A `tears` layer toggle.
  - Control hooks: `stare`, `reflexTears`, `tearInfo`.

**The gate.**
- The reflection is alive but still.
- After a 12 s stare, dry spots appear and the page's reflection turns patchy; a blink lays the film down fresh and the reflection comes back whole.
- The lower margin carries a fine bright line, brighter with tears.
- WebGL2 (T1, static film) renders.

**Cost** (headless, real GPU, DPR 1, 1280 × 720). This session's timings were noisy: the whole frame ran ~7.7–10 ms with or without the meniscus. The film step is five samples on 65k texels; the meniscus is a thin strip.

**Not done:**
- The upper meniscus is mostly hidden behind the margin, as in life, but our upper inner face shows as a dark band, so the bead sits about 0.5 mm below the visible edge.
- The lower margin's waterline still has the lid shader's own wet sheen as well as the bead.
- The film doesn't cover the conjunctiva over the white.
- No real devices.

### P7 status (2026-10-18): signed off

**What's in** (`nodes/lashes.ts`, plus the lash shadow in `nodes/margins.ts`)
- **Strands.** One instanced draw of camera-facing ribbons (10 segments each), with counts per tier: 170/80 (T3), 120/40 (T2), 60/0 (T1).
  - The bake (`bakeLashes`) is seeded once per load. It places each strand along the margin by a stratified density: none by the punctum, densest over the outer third, thinning at the corner.
  - Each strand gets a row (0.06–0.4 mm from the margin's edge), a length (upper 10 mm, lower 5.2 mm, longest mid-lateral and in the front row), a lean, a fan toward its own end of the lid, and a clump (runs of 3–6 that share a lean and a fan).
  - Ranks are shuffled, so a person with fewer lashes loses them evenly.
- **Rooted on the moving skin.** Each strand's root is `skinAt` on the lid mesh's own column (now exported), so it rides blinks, gaze and squint.
  - The strand's frame is the view axis, square to the margin, and the skin's outward direction. It rotates with the margin's travel from its neutral line: shut, the upper lashes hang forward and down; looking down, they dip.
  - A strand is a circular arc: it starts near level, then curls outward by 0.45 + 0.9·curl rad (upper) or 0.15 + 0.45·curl rad (lower).
- **Lag.** A spring per row (7 Hz, ζ 0.35) pulls the extra curl toward the margin's apex speed × 0.03 s.
  - Measured on a blink: closing, the upper tips trail by up to 0.47 rad; when the lid lands they swing to −0.18; opening, they trail by −0.15; then they settle.
  - It is off under reduced motion.
- **Never under a pixel.** Ribbons are drawn at least 1.2 px wide (`pxMm` is fed from the camera). A truly thinner strand keeps its coverage as transparency, so it neither vanishes nor aliases into a picket fence.
- **Shading.** Kajiya–Kay: diffuse from how square the strand is to the screen's light, a narrow sheen in the screen's colour, and a broader one in the hair's own colour. Edges darken as on a round strand. Colour runs root → tip.
  - Mascara blackens the strands and thickens, lengthens, clumps and glosses them.
- **One pass.** The material is transparent and double-sided, and three draws such materials twice (back, then front). The ribbons already face the camera, so `forceSinglePass` (rule 25).
- **Lash shadow on the eye.** A projected density, folded into `socketShade3d`, so the sclera, the cornea and the iris all take it.
  - From the point, look toward the screen at three heights in front of the lid (25/45/65% of the length). Ask whether the curling fringe stands there: about k·h²/2 above the margin, softening with h.
  - Clumps come from value noise along the margin, and the fringe thins at the corners.
  - The margin there comes from the point's own margin, stepped along its slope. That is one lookup, not three; three cost ~1 ms.
- **Per era** (`ERA_FACE.lashes`): 1970 straight and dense, 1981 fair with darker tips, 1991 straight (monolid), 1997 light, 2000 mascara, 2003 and 2013 a touch of mascara, 2009 near-black, 2026 neutral grey. Lower rows are sparser than upper ones.
- **The root line.** The lid shader's placeholder lash band is now just the roots' dark mass: narrower, at the margin's front edge.
- **Lab.**
  - A Lashes section: upper, lower, length, curl, clump and mascara, each overriding the era's own.
  - A `lashes` layer toggle.
  - The header reads P7.

**The gate.**
- No picket fence: strands vary in row, length, fan and clump, and the lower row is finer and unruly.
- Lashes lag on blinks (trace above) and take the screen's sheen.
- Shut lashes hang down; gaze down dips them.
- The WebGL2 tier (T1, 60/0) renders.
- Defocusing the lashes in front of the iris waits for P10's depth of field.

**Cost** (headless, real GPU, DPR 1). This session's GPU timings were noisy, about 7.5–9.5 ms for the whole frame either way.
- Lashes on versus off: within the noise.
- The first, three-lookup lash shadow cost ~1–1.5 ms; the first-order one is in the noise.

**Not done:**
- Lashes are sharp until P10's depth of field.
- No lash shadow on the skin or the lower lid.
- Lower lashes don't shadow anything.
- The 2003 flash and other era signatures wait for P11.
- No real devices.

### P6 status (2026-10-18): signed off

**What's in**
- **The lid mesh** (`nodes/lid-mesh.ts`). It is one 320 × 64 ring shaped entirely in the vertex stage, so nothing is ever re-uploaded.
  - Across the mesh, α runs once round the eye. Down it, q runs from where the lid touches the globe, round the margin's 1.5 mm inner face, then out over the skin.
  - **Skin.** It is laid out in the image plane, outward from the margin's line. Near the corners that direction turns smoothly onto each corner's bisector, so the skin fans over many columns.
  - **Depth.** The skin stands at a smooth max (2 mm) of two surfaces: the lid's curve (the globe plus the lid's thickness, with the cornea's bump riding under it wherever the eye looks) and a face height field. The face falls away fast to the temple and slowly to the nose, with a brow above and a trough under the lower lid. The lid bulges where it's in front of the face and folds into brow and cheek by itself.
  - **Corners.** Toward the corners the face is in front of the globe, so the canthi sit forward. The margin's inner face stretches back to the globe as the pocket's wall.
- **The margins** (`nodes/margins.ts`) are curves θ(φ) in face space, shared by the mesh and by the shadow the lids lay on the white and the cornea (`socketShade3d`). The shadow can't drift off the lid that casts it. The sclera no longer evaluates lid curves twice: its cut-out is gone, because the mesh covers the globe.
  - **Blink.** The upper lid sweeps onto the lower, which rises a little. The skin stretches: near the margin it moves with the lid, and by 14 mm out it stays put. The upper lid closes a hair in front of the lower.
  - **Lid–gaze coupling.** The upper margin follows the eye's pitch closely (0.85) and the lower one a little (0.35). The apex drifts toward the cornea's yaw.
  - **Squint.** A bright screen narrows both lids (upper 25%, lower 20%) and deepens the crow's feet. It is off under reduced motion.
  - **Gaze-evoked blinks.** A fixation jump larger than 0.8 has a 55% chance of a blink.
  - **The person.** Aperture, canthal tilt, an epicanthic fold that lets go at the corner, and crease height, depth and hood per lid type (`LID_SHAPES`). The margins can never cross.
- **Skin shading.**
  - Colour: the Monk tone with its undertone, made warmer and pinker toward the thin lid skin.
  - Texture: mottle laid across the face. Pores and lid lines come from a one-time bake (`bake/skin.ts`) and stay near the eye, where the mesh doesn't fan out.
  - Crow's feet are drawn in face space from the outer corner.
  - The crease has its own shade.
  - Lighting: wrap lighting from the screen, with red bleeding through at the terminator.
  - A rough sheen of the screen that shows the form of the darkest tones.
  - Far out, the skin darkens into the room.
- **Margin and waterline.**
  - Upper margin: grey line, then a placeholder lash-line band (until P7). Its inner face looks down behind the lash roots and reads as a dark line.
  - Lower margin: the inner face is a wet waterline over conjunctiva. It is shaded deep toward the globe, darker on pigmented skin, and holds the screen's reflection.
- **Socket** (BackSide sphere, r 14): the pocket behind the corners, with a pink caruncle at the inner one.
- **Draw order, for cost.** The skin is opaque and drawn first, so the depth test skips the globe's and the cornea's shaders under it. The room moved from `scene.backgroundNode` to a far-plane quad drawn after everything opaque. Behind a full face it now costs almost nothing.
- **Lab.**
  - The Face section: Monk swatches 1–10, lid type, and "era's own".
  - The Drive section gains Hold lids (blink 0–1) and Hold squint.
  - Control hooks: `holdBlink`, `holdSquint`.
  - `eye-lab-shots.mjs` also clicks by `title`.

**The gate.** The lid edge reads as thickness, the corners as pockets, and every tone reads well under green (1970), white (1981) and warm (2013) light. Monk 1, 5 and 10 were checked under each.
- Blink closes fully at 1 with no gaps or z-fighting.
- Gaze up lifts the upper lid; gaze down drops it over the iris; a side gaze shifts the apex.
- A held squint narrows the aperture and shows the crow's feet.

**Cost** (headless, real GPU, DPR 1, 1280 × 720):
- The whole frame is **5.6–6.6 ms GPU**, down from P5's 7.2–8, now with a full face in it. Phone portrait (390 × 844) is 3.6 ms.
- The lid mesh alone is ~2.8–3.3 ms; its vertex stage was most of that. Building the margin frame once per column (twice per vertex) instead of six times took ~1 ms off.
- The cornea in the aperture is ~1.1 ms.
- The WebGL2 fallback renders the same scene.

**Found on the way** (see rules 23 and 24 below):
- A mesh that mixes a sphere-following path with a face path folds into sheared quads near the corners. One depth function over an image-plane layout doesn't.
- `.uniformFlow()` selects are not a fix for rule 17. They re-scope vars and broke the geometry.

**Not done:**
- Lashes; the lash line is a placeholder band until P7.
- The tear meniscus and wet highlights on the margin (P8).
- The plica isn't modelled; the caruncle mostly hides in the forward medial pocket.
- At full closure, each corner shows a small dark hook. Lashes should cover it.
- Monk tones are swatch colours with an undertone, not a melanin and haemoglobin model.
- Posters still show the old eye (P12).
- No real devices.

### P5 status (2026-10-17): signed off

**What's in** (`rig/pupil.ts`, a pure-TS rig; shading in `nodes/iris.ts`)

- **Light.** Steady size follows Moon & Spencer: D = 4.9 − 3·tanh(0.4·(log₁₀L + 1)) mm. The screen's luminance maps to L from 10^−1.6 mL (dark terminal) to 10^1.6 mL (white page). That gives ~4.8 mm for 1970's terminal and ~2.3 mm for a white page. The iris bake's resting pupil now comes from the same law, not from EraVisual.pupil, which the TSL eye no longer reads.
- **The reflex.**
  - The light reaches the muscle 0.22 s late.
  - Constriction is fast (rate 5.5/s); re-dilation is slow (1.1/s).
  - A step up overshoots and then escapes: a transient −1.1·tanh(0.8·Δ), where Δ is how far the light is ahead of a slow follower (0.6/s), so it fades over a second or two.
- **Near reflex.** Up to −0.9 mm. It answers the pointer's approach toward the iris, not its distance, so it fades once the pointer rests.
- **Arousal.** After 0.45 s resting on the iris, the pupil dilates by up to +0.9 mm, rising at 1.2/s. The iris position on screen tracks the gaze.
- **Hippus.** Three slow tones (0.31, 0.83 and 1.7 Hz), with a peak of ~0.23 mm.
- **Flash.** A light on the camera's axis gives a 50 ms red reflex, brighter through a wider pupil, then a reflex-latency later the pupil clamps down.
- **Shader.** The red reflex through the pupil; Purkinje P3 (upright, larger, deep), now alongside P4, both blurred and faint so nothing inside the pupil is legible; and the pupil margin's inner wall, a sliver on the far side when the eye is seen at an angle.
- **Lab.** A Pupil section with a live 6-second diameter trace, a light step (+2.4 log units) and a flash. Control hooks: `pupilMm`, `pupilTrace`, `lightStep`, `flash`, `holdRedReflex`, `stillPupil`.

**The gate.**
- The rig, simulated in Node:
  - onset 0.225 s after the step;
  - minimum at ~0.96 s;
  - escape to a steady 2.3 mm over ~3 s;
  - re-dilation over ~3 s when the light drops.
- Live in the lab (headless):

  | Event | Response |
  |---|---|
  | Light on | Starts 251 ms after the click (model plus 1–2 React frames), floor within ~1 s, steady 1.78 mm |
  | Light off | 2.5 mm at +1 s, 3.0 mm at +4 s |
  | Pointer approaching | Narrows to 2.48 mm |
  | Pointer resting on the iris | Opens to 3.64 mm by 4 s |

- The red reflex and P3/P4 render. Nothing inside the pupil is legible.

**Not done:**
- The flash isn't wired to 2003's tap yet; that's P11's signature.
- No real devices.

### P4 status (2026-10-17): signed off

**What's in**
- **The iris bake** (`bake/iris.ts`). A polar map per person: the angle around the pupil runs across, the distance out runs down, laid out at the resting pupil. Sizes come from the tier (T2 1024×256, T3 2048×512). Built from MaterialX noise:
  - wavy radial trabeculae, fine and coarse;
  - the zigzag collarette, which splits the inner and outer colour zones;
  - crypts of Fuchs gathered by the collarette;
  - broken contraction furrows;
  - the pupillary ruff, freckles, the limbal ring and arcus.

  Melanin buries the fibres; scatter turns them pale. The angle enters the noise as a point on a circle, so the map is seamless. There are two outputs (albedo + height; furrow, crypt and fibre masks) and two sets, A and B.
- **Casting** (`identity.ts` `ERA_IRIS`): §7's irises as data.
  - 1970 deep brown with arcus
  - 1981 grey (R1)
  - 1991 hazel
  - 1995 amber
  - 1997 blue
  - 2000 green
  - 2003 central heterochromia (R4)
  - 2009 near-black brown
  - 2013 honey (R2)
  - 2026 near-monochrome
- **Refraction** (`nodes/cornea.ts`, `nodes/iris.ts`). In the eye's own frame, the view ray refracts at the cornea (n 1.336) and hits a shallow iris cone (root 9.8 mm, pupil margin 10.2 mm, about 3 mm of anterior chamber). The iris turns with the gaze and magnifies under the dome.
- **Dilation as muscle.** Sampling bends each point's distance from the pupil margin back to where that tissue sits at the resting pupil (exponent 1 + 2.2·(p − p₀)). Opening the pupil bunches fibres toward the root; closing it stretches them. Furrows deepen as it opens.
- **Seamless mips.** Explicit gradients come from whichever of two angle measures has no seam under the pixel (Tarini). The map repeats around the pupil.
- **Relief and light.** One parallax step along the refracted ray, plus one height sample toward the light for relief shading. The caustic crescent sits on the far side of the iris from the screen, the limbus shades the near side, and the lids' socket shade carries onto the iris.
- **The pupil.** A hole with depth, a faint red fundus, and Purkinje P4 (a dim, inverted image of the screen).
- **Crossfade.** An era change bakes the new person into the back set (debounced 120 ms, so a sweep bakes only where it lands) and crossfades to it.
- **Wobble.** A 9 Hz spring (ζ 0.32) driven by the globe's angular acceleration, applied most in the middle of the iris. Measured on a full saccade: the membrane lags 0.17 mm, overshoots 0.09 mm and rings down in about 170 ms.
- **The mirror, rebalanced.** A white page reflected at a few percent is dimmer than the lit iris beneath it. The mirror gain went from 1.35 to 0.5, the emitter from 0.6 to 0.2 and the core glow was halved; the iris gets more light. The page stays readable by its contrast and is brightest over the pupil, as in life.
- **Lab:** a debug view `iris` (unlit albedo); `window.__eyeLab` for headless checks; and `eval` steps (promises awaited) in `scripts/eye-lab-shots.mjs`.

**The gate.**
- The grey 1981 iris holds up against R1 (white wavy threads over dark stroma, crypts), and 2003 against R4 (an amber zigzag zone inside green).
- Dilation from 0.16 to 0.62 of the iris radius reads as tissue bunching, not scaling.
- WebGPU and WebGL2 both run clean.

**Cost:** ~7.2–8 ms GPU (headless, DPR 1). The placeholder lids are still the biggest single item. The iris adds about 1 ms: 4 grad samples per set, and twice that during a crossfade.

**Not verified:** real devices, and the wobble by eye in motion (it was measured, not watched).

### P3 status (2026-10-17): signed off

**What's in**
- **The cornea** (`nodes/cornea.ts`): a cap of a 7.8 mm sphere, seated on the globe at the limbus (centre of curvature 5.35 mm forward, apex 13.15 mm). It is part of the gaze group, so its reflection slides and stretches as the eye turns.
  - Its shader draws nothing of its own. It reflects the view ray off the dome, rippled by a slow tear-film fbm, and traces it to the screen's rectangle.
  - Ported from the live eye: per-channel dispersion through the dome's curvature, roughness that grows toward the limbus, bright-page compression, the monitor body, Schlick Fresnel, the emitter and blown core, the limbus shade and rim, and the specular streak.
  - New: a faint Purkinje P2.
  - Output is premultiplied: the mirror screens over the iris beneath and the limbus shade multiplies.
- **The screen as a rectangle** (`look.ts` `ScreenLight`): a key direction for shading, plus a rectangle (centre, normal, size) for every mirror. It is deliberately huge and close: 1.9 × 1.2 m at 0.3 m, which are the live eye's SCREEN_C / SCREEN_H / SCREEN_D measured off its shader. A 7.8 mm convex mirror leaves a readable page only for a screen that fills most of the view. The sclera now traces to the same rectangle.
- **The bulge.** The cornea shades the white beside it on the side away from the screen and lends it a rim on the side toward it.
- **The visitor's pointer.** It is drawn on the era's screen, in that era's cursor (`ERA_CURSOR`): block 1970; arrow 1981, 1991 and 1997; hand 1995 and 2003; caret 2000; thumb pad 2009 and 2013; none 2026. It shows in the cornea mirrored and through the era's display tech, and fades out 2.2 s after the pointer stops.
- **Bright pages** needed less of the live eye's stop-down; its output was encoded twice and ran hot. The penalties are lighter and the emitter is stronger, so 2003, 2009 and 2013 carry a readable page.

**The gate**
- In headless Chrome the page reads in the cornea on desktop and at phone crop: "Digital Service Stack" and the title in 1991.
- 1970's phosphor rows and 1995's GeoCities colours read.
- The cursor shows (the 1995 hand).
- WebGPU and WebGL2 both run clean, with no console errors.

**Cost:** ~6.4–6.8 ms GPU per frame (headless, DPR 1). The placeholder lids are still the biggest item.

**For P4:** on bright eras the page now covers most of the iris. Physically the cornea reflects about 4% face-on, so the iris should show through the dark parts of the page. Balance the two once there is a real iris to show.

### P2 status (2026-10-17): signed off. Proportions decided: anatomical

**What's in**
- **The globe.** A 12 mm sphere inside a gaze group that turns yaw then pitch, so a diagonal look never twists the eye. On a blink the eye rolls up 9° (Bell's phenomenon). Its iris foreshortens into an ellipse as it turns.
- **The sclera** (`nodes/sclera.ts`):
  - It is lit by the era's screen: the key colour is the screen's 1×1 mip, and the light wraps past the terminator, red furthest.
  - It sinks into the socket toward its silhouette.
  - It mirrors the screen: the reflected ray is traced to the monitor's plane and sampled with a roughness bias, weighted by Fresnel. The patch shows on the white when the eye looks away; facing forward it falls on the iris, which is P3's job.
  - The upper lid and the lash line cast a contact shadow, the lower lid a lighter one. The corners are pockets, and the white reddens toward the margins.
- **Vessels** (`bake/vessels.ts`): MaterialX noise baked once per person (by era seed) into a 1024×512 equirect map. It holds episcleral vessels (deep, coarse), conjunctival ones (fine) and mottling; none sit over the cornea, and most gather toward the corners. Age yellows the exposed corners.
- **Placeholder lids** (`nodes/lid-shape.ts`, `nodes/lids.ts`): the live eye's lids, ported, as one premultiplied full-screen layer of skin, crease, lash mass and lit margins. The globe is cut to the aperture.
- **The corners.** Where the aperture runs past the globe, the room draws the conjunctival pocket, with the caruncle at the inner corner.
- **Lab additions:**
  - a Proportions toggle;
  - Sclera sliders for vessels and age, with an "Era's own" reset;
  - a lids layer;
  - debug views `spec` and `socket` (R = occlusion, G = toward-rim, B = aperture);
  - `scripts/eye-lab-shots.mjs`, which drives the lab headlessly from a JSON list of clicks, keys and slider values.

**Decision (2026-10-17): anatomical.** The stretched mode and its lab toggle were removed in P3. Before that, the two options were:
- **Anatomical (the default):** a 12 mm globe in a ~26 × 10 mm fissure. The upper lid covers the top of the iris and the lower lid meets its foot. On desktop the eye is about half the frame's width, with skin around it; on a phone it is a close crop of iris and lids.
- **Live eye:** today's stretched fissure, with the globe grown to 18 mm to fill it. This reads as the current eye, but it is anatomically wide-open.



**Cost** (headless, real GPU, DPR 1): the whole frame is ~5.5–6.8 ms GPU, up from ~2.5 ms. Most of the increase is the placeholder lids, which run fbm on every pixel of a full-screen layer. P6's lid mesh replaces them, and the sclera then stops evaluating the lid curves twice (colour and cut-out). This is over the T2 phone budget until then.

**Not done:**
- Lid–gaze coupling (P6).
- The cornea over the iris, and its reflection (P3).
- The real iris (P4).
- The real device matrix.

### P1 status (2026-10-17): signed off

**What was ported**
- **The screen pass.** `ERA_UI_FRAG` is now TSL in `nodes/screen.ts`. The twelve chrome layouts are a data table (`CHROME`), uploaded as uniform arrays, not an if-chain. The pass renders a 768×432 mipmapped target at 24 fps and every frame during a layout crossfade. Its 1×1 mip is the key light (`screenLight()`, no readback).
- **One clock for both screens.** `rig/screen.ts` (`ScreenDriver`) damps every screen parameter into one plain state object. The stage and the lab's GLSL reference both read that object.
- **The room.** "The room" section of `ERA_EYE_FRAG` is ported to the scene's background node (`nodes/room.ts`): the monitor out of focus through a barrel, bezel, desk reflection, motes and grain.
- **The grade.** The pipeline applies the live eye's grade: exposure for bright eras, the room falloff, and the ACES-fit filmic curve. The Canvas runs `flat`.

**Parity**
- The lab has a "Screen parity" control. It lays the live shader's pass over the TSL one, from the same state, either flipped or differenced.
- A headless Chrome sweep covered all ten eras with reduced motion on:

  | Backend | Mean difference | Pixels over 24/255 |
  |---|---|---|
  | WebGL2 | ≤ 0.39/255 (max 1/255) | 0% |
  | WebGPU | 0.03–0.31/255 | ≤ 0.34% |

- On WebGPU, the stray pixels are pixel-grid snapping and dither boundaries in the bitmap eras, plus glyph-edge filtering.

**Cost** (headless, real GPU): the whole frame with the screen pass at DPR 1 is about 2.5 ms GPU on WebGPU and 1.9–3.2 ms on WebGL2.

**Not done**
- The real device matrix.
- The P0 placeholder ball still stands in for the eye; P2 replaces it.

Every phase is built in `/lab/eye` behind layer toggles. A phase passes its gate with:
- a side-by-side against the references, at both desktop and phone framing;
- performance numbers from the device matrix;
- a reduced-motion check;
- your sign-off.

Sizes are S, M or L.

**Device matrix:**
- desktop with a discrete GPU (Chrome, WebGPU);
- integrated-GPU laptop (Edge, WebGPU);
- MacBook (Safari 26);
- iPhone on iOS 26 (WebGPU) and on iOS 18 (WebGL2);
- mid-range Android (Chrome, WebGPU);
- Firefox on Android (WebGL2).

| # | Phase | Build | Interaction delivered | Done when |
|---|---|---|---|---|
| P0 | Foundation (M) | Bump three and `@types/three` to r186, then re-test the old eye, `scribble-animation` and `era-screen-texture`. Add `EyeStage` (WebGPURenderer through R3F's async `gl`), backend detection and tier choice. Build the poster pipeline: the lab captures AVIFs per era and size, the loader shows a poster at once, then `compileAsync` and a crossfade. Build the lab: era switcher, layer solo and mute, debug views, sliders bound to `EyeIdentity` and `EraLook`, a drag-and-drop reference overlay, the Inspector perf HUD, a `forceWebGL` toggle. Add the uniform registry and the damping loop (port today's `useFrame`) | n/a | An empty stage crossfades from its poster on every device in the matrix, the current picker shows no regressions, and the bundle delta is measured |
| P1 | Era screen as light (S) | Port `ERA_UI_FRAG` to TSL (render target at 768×432, 24 fps, mipmaps). Its lowest mip is sampled directly as the key light's colour, with no readback | Era crossfade, scrolling content | All ten screens match today's |
| P2 | Eyeball, sclera, gaze rig (M) | A 12 mm sphere. Sclera with wrap diffuse and soft scatter, two depths of vessels (a baked mask), a corner tint, an age tint. A gaze rotation group. The occlusion shell with placeholder lids | Gaze turns the ball and moves its terminator | It reads as the wet sphere in R3, with a lid shadow |
| P3 | Cornea and reflection (M) | A bulging dome mesh as a specular-only shell. Analytic reflection into the screen plane (ported from today's math), Fresnel, roughness that grows with distance from the apex, dispersion at the rim, a rim highlight, a faint P2 | The pointer shows as the era's cursor, and the reflection slides with gaze | The reflection is legible across the dome on desktop and still readable at phone crop |
| P4 | Iris (L) | A bake pass in polar space with MaterialX noise: fibres, crypts, furrows, collarette, ruff, zones, freckles, limbal ring. It outputs albedo plus height and is double-buffered per era. At runtime: refraction, the cone hit, a radial dilation remap, parallax steps per tier, the caustic crescent, limbal shading, the wobble | The iris deforms with pupil size and wobbles after saccades | It holds up against R1 and R4 at a 1:1 crop, and dilation from 2 to 8 mm reads as muscle, not scaling |
| P5 | Pupil (M) | A light-reflex model with a delay and different rates for closing and opening, replacing today's pulse. Near reflex, arousal, hippus, inner depth, small dim P3 and P4, red reflex (for 2003). The exit dilation stays | Light, hover, near and tap responses | The response to a light step follows real timing, and nothing legible shows inside the pupil |
| P6 | Lids and skin (L) | A procedural lid mesh: margin curves that respond to blink, gaze coupling and squint, folds per lid type, thickness, grey line, waterline, caruncle and plica, and the width stretch to the viewport. Skin: Monk tone mapped to melanin and haemoglobin, wrap scatter, baked tiling pores and lines, squint folds | Lid–gaze coupling, squint, gaze-evoked blinks | The lid edge reads as thickness, the corners read as pockets, and every tone reads well under green, white and warm light |
| P7 | Lashes and shadows (M) | Instanced ribbons attached to the lid curve in the vertex stage: clumps, rows, curl, taper, lag. Kajiya-Kay highlights, hashed alpha, shadow projected onto the ball through the occlusion shell. Counts per tier | Lashes lag on blinks and take the screen's sheen | No picket fence. After P10, the lashes defocus in front of the iris |
| P8 | Tear film and meniscus (M) | On WebGPU, a compute height field on the cornea's UV (128² or 256²): it spreads after a blink, thins, and breaks up. On WebGL2, the same `Fn` as a ping-pong fragment pass. On T1, static noise. It outputs the cornea's normal, its roughness and a thin-film tint. A meniscus strip mesh | Patchiness after a long stare; a blink re-spreads the film | The reflection is alive but still; patches appear after a long stare and a blink clears them |
| P9 | Motion system (M) | Main-sequence saccades, pursuit against catch-up, microsaccades, post-saccadic wobble, lid coupling, gaze-evoked blinks, and the per-era gaze patterns: read, scatter, two-target, lock, scroll, contact | Every era's gaze pattern | Gaze traces recorded in the lab look like eye-tracker data |
| P10 | Camera and post (M) | `RenderPipeline` with `pass` and MRT. Depth of field with a focus uniform and rack focus. Bloom on emissive only. The era lens node: grain, halation, chroma, vignette, lift/gamma/gain, and the era's artefact (blocks, interlace, comet tail, CCD smear, flash). Tonemap | Rack focus to the pointer's target | With the lens off, it's a clean photograph. With it on, each era has one strong cue |
| P11 | Era passes | Batch A: 1970, 1981, 1991. Batch B: 1995, 1997, 2000. Batch C: 2003, 2009, 2013. Then 2026 and its hand-off. Each era gets its identity, look, lens, signature and posters | Each era's signature | You sign off each batch |
| P12 | Swap and ship (M) | Replace `EraEyeCanvas` in the loader. Delete the old shader, and pmndrs `postprocessing` if nothing else uses it. Run the device matrix, check INP and LCP, commit the posters | n/a | The new eye is the default and the old code is gone |

P2 to P8 each depend only on P0 and P1, plus the gaze rig from P2. In the lab they can be built in any order after P2. Doing P4 (iris) early de-risks the whole plan, because the iris is where a 3D rebuild must clearly beat the current shader.

---

## 9. TSL, curated

### Module layout
```
src/components/three/eye/
  anatomy.ts       mm constants: the one source of truth
  identity.ts      EyeIdentity per era
  look.ts          EraLook per era (extends era-visuals)
  tiers.ts         tier detection and per-tier constants
  uniforms.ts      the one uniform registry
  rig/             gaze.ts  blink.ts  pupil.ts (light reflex)  focus.ts
  nodes/           noise.ts  screen.ts  room.ts  sclera.ts  iris.ts  cornea.ts
                   tear.ts  lids.ts  lashes.ts  skin.ts  shadow.ts
  bake/            iris-bake.ts  skin-detail.ts
  post/            pipeline.ts  era-lens.ts
  EyeStage.tsx     R3F canvas, WebGPURenderer, poster crossfade
src/app/lab/eye/   the lab route (dev only); src/lab/eye/EyeLab.tsx is the workbench
```

### Rules
1. **Build graphs once.** Era changes and sweeps only write uniforms and swap baked textures. Assigning new nodes to a material at runtime recompiles its pipeline, which shows as a hitch mid-sweep.
2. **One uniform registry.** Each value is a single `uniform()` shared by every material that reads it, and damping happens in one JS loop, as it does today. Per-frame globals use `.setGroup(renderGroup)` so they upload once per frame, not once per object.
3. **Real functions for reused heavy code.** Wrap it in `Fn(...).setLayout({...})` so it compiles to a WGSL or GLSL function instead of being inlined at every call site. That gives a smaller shader and a faster compile.
4. **Bake what doesn't move.** The iris, the vessel masks, the skin pores and the lash strand data are generated once, per era or per load, and sampled after that. The GLSL version runs fbm on every pixel every frame, and that is the main cost to remove.
5. **MaterialX noise is for bakes.** `mx_noise_float`, `mx_fractal_noise_float` and `mx_worley_noise_float` belong in bake passes; per-frame shaders sample a tiling noise texture instead.
6. **Vertex before fragment.** Lid curves, lash bending and gaze-dependent terms are computed per vertex and passed with `varying()`.
7. **Analytic optics.** Refraction and reflection are ray–sphere and ray–plane maths inside the material, not `viewportSharedTexture` transmission. The result is the same on both backends, with no extra scene copy.
8. **Branch only on values that are the same for every pixel**, like the tier or the era's layout. Choices that vary per pixel use `select()` or `mix()`.
9. **Choose the tier before compiling.** The runtime watchdog may lower the DPR, lower pass resolution, or zero a cost through a uniform (aperture 0 turns depth of field off). It never changes a graph's shape.
10. **Use compute only where it pays.** The tear film runs on WebGPU with `instancedArray` and `.compute()`. On WebGL2, the same `Fn` runs as a ping-pong fragment pass.
11. **Colour.** Work in linear, with one tonemap at the end: either `renderer.toneMapping`, or the lens node with `outputColorTransform` off. Pick one. Canvas-painted textures are tagged `SRGBColorSpace`.
12. **MRT** separates emissive (the reflection and speculars) for bloom, and provides `viewZ` for depth of field.
13. **Compile behind the poster** with `await renderer.compileAsync(scene, camera)`, and warm the `RenderPipeline` by rendering one frame offscreen.
14. **Dispose** every render target, material and geometry on unmount, and watch `renderer.info.memory`.
15. **Debug views** go through one `debugView` uniform and `select()` (albedo, normal, masks, caustic, tear height), so switching views never recompiles.
16. **Don't use** in this canvas: `ShaderMaterial`, `onBeforeCompile`, pmndrs `postprocessing`, drei's `Environment` and `Text`, `WebGLCubeRenderTarget`, the deprecated `PostProcessing` name, `renderAsync`, `viewportResolution`.
17. **Pin shared values with `.toVar()`.** A node read by more than one branch of a `select()` or `If` must be pinned to a variable where it's defined. Otherwise TSL declares it inside whichever branch reaches it first, and the other branches read it unset. P0's placeholder lost all of its lighting in the "final" view this way, while the "lit" view looked fine.
18. **R3F 9.8 gotchas** (found in P0, and they affect the live eye too):
    - A `uniforms` prop on a JSX `<shaderMaterial>` is copied into fresh objects, so writes never reach the shader. Build the material in `useMemo` and pass it as `material={…}`.
    - The Canvas `dpr` prop is re-applied on every render of the Canvas, which undoes any `setDpr` made inside the scene. Keep the ratio in the Canvas owner's state and pass a setter down.
19. **No reversed `smoothstep` with constant edges.** GLSL accepts `smoothstep(0.8, 0.2, x)`. WGSL rejects `low >= high` at shader creation when both edges are constants. Use `smoothstepDown(from, to, x)` from `nodes/common.ts`: the same curve, written legally.
20. **Node modules build graph through the untyped `T` handle** (`nodes/tsl.ts`). The node generics in @types/three r186 narrow every result, so helpers can't be composed without a cast at each call. The shader compilers on both backends are the real type check, and the lab compiles every module when it loads.
21. **Coordinates start top-left in node land.** `QuadMesh` UVs, `screenUV`, `screenCoordinate` and render-target sampling all start top-left. Code ported from the GLSL, which measured from the bottom, flips once at the entry point (`vUv = (uv.x, 1 − uv.y)`) and samples the screen target through `sampleScreen()`, which takes y-up coordinates.
22. **The screen target holds display values.** The canvas page is sampled raw (no colour space) and mixed with linear uniform colours, exactly as the GLSL did. That's what P1 parity means. Layers that use the screen as *light* (P2 onward) should decide explicitly whether to decode it.
23. **Compute shared geometry once per vertex.** Separate `Fn`s for `positionNode` and each `varying()` each rebuild the whole graph. P6's lids evaluated their margin frame six times per vertex that way, costing ~1 ms at 21k vertices. Use one vertex `Fn` that assigns `varyingProperty`s and returns the position. Split what depends only on α (a column) from what depends on q (a row), so finite-difference normals rebuild the cheap part.
24. **Backgrounds hidden behind opaque geometry belong at the far plane.** `scene.backgroundNode` runs on every pixel before anything else. A far-plane quad (`vertexNode = vec4(position.xy, 1, 1)`, no depth write) drawn after the opaque meshes lets the depth test skip it.
25. **Transparent `DoubleSide` draws twice.** three renders a transparent double-sided material in two passes (back faces, then front). Geometry that already faces the camera, like ribbons and billboards, should set `forceSinglePass`.
26. **Branch on a uniform to skip work.** An `If` on a uniform is the same for every pixel (rule 8), so it is free. Use it to do expensive set-up (noise for a fresh state) only on the steps that need it, and carry the result in a channel.
27. **Materials and MRT.** A material with a custom `fragmentNode` skips three's MRT merge: the pass's other targets get no output, and WebGPU rejects the pipeline. To add to a target, use `outputNode` with an `mrtNode`, or `colorNode` with an `mrtNode`. (`outputNode` with a `property` assigned inside it broke the WebGL2 backend, so the eye has no emissive target there.)
28. **Addon post nodes don't render unless they're in the graph.** Sampling a `DepthOfFieldNode`'s or `BloomNode`'s texture by itself leaves the node out of the graph, so it never updates. Sample through `passTexture(node, texture)`, or the node's own `getTextureNode()` where it already uses `passTexture` (bloom does), or build passes with `rtt()`.

### Shape of a node module

```ts
// nodes/iris.ts — illustrative
import { Fn, float, pow, mix, clamp } from "three/tsl";
import { U } from "../uniforms";

/**
 * Where a sample at the current pupil size came from in the rest pose.
 * The iris does not scale when the pupil opens: fibres bunch toward the root.
 * Start linear and bend it against Pamplona 2009's figures in the lab.
 */
export const restRadius = Fn(([r, pupil, rest, bunch]) => {
  const t = clamp(r.sub(pupil).div(float(1).sub(pupil)), 0, 1);
  const bent = pow(t, mix(1, bunch, pupil.sub(rest).abs().mul(3).clamp()));
  return rest.add(bent.mul(float(1).sub(rest)));
}).setLayout({
  name: "irisRestRadius",
  type: "float",
  inputs: [
    { name: "r", type: "float" },
    { name: "pupil", type: "float" },
    { name: "rest", type: "float" },
    { name: "bunch", type: "float" },
  ],
});

// usage inside the eye material's colorNode:
// const rr = restRadius(polar.y, U.pupil, U.pupilRest, U.irisBunch);
```

### Tiers

| | T0 Poster | T1 Low | T2 Standard | T3 High |
|---|---|---|---|---|
| When | While compiling, no WebGL2, the watchdog's floor, Save-Data | The WebGL2 backend or a weak GPU | WebGPU on phones and laptops | WebGPU on a desktop with a discrete GPU |
| Iris bake | Baked into the poster | 512² | 1024² | 2048² |
| Parallax steps | n/a | 1 | 2 | 4 |
| Lashes (upper/lower) | n/a | 60 / 0 | 120 / 40 | 170 / 80 |
| Tear film | n/a | Static noise | Simulated, 128² at 30 Hz | Simulated, 256² at 60 Hz |
| Depth of field | n/a | Off (lashes pre-softened) | Half resolution | Full resolution |
| Bloom | n/a | 3 mips, half resolution | 5 mips | 5 mips |
| P3/P4, thin film | n/a | Off | P4 only | All |
| MSAA | n/a | Off | Off | 4× |
| DPR cap | n/a | 1 | 1.5 | 2 (the pixel budget still applies) |

**Starting GPU budget for T2 on a mid-range phone: 8 ms or less per frame.** This is a guess to measure against in P0, not a promise.

| Pass | ms |
|---|---|
| Screen render target (amortised) | 0.4 |
| Room | 0.2 |
| Eye (sclera, iris, pupil) | 1.8 |
| Cornea | 0.6 |
| Lids and skin | 0.9 |
| Lashes | 0.5 |
| Tear film | 0.3 |
| Post (depth of field, bloom, lens) | 2.5 |

Measure each pass with the Inspector's GPU timings, and revise the budget after P0.

---

## 10. Risks and open decisions

1. **3D rebuild or a TSL port of today's 2D shader.** I recommend the 3D rebuild. If P2 to P4 don't clearly beat today's look, port the 2D shader to TSL and keep its structure.
2. **Casting (§7).** Who each era's eye belongs to is a proposal. Change it freely.
3. **The 2026 hand-off into the halftone pupil** touches the 2026 "no iris" rule. It is scoped to the loader only.
4. **Bundle.** First visits load about 220 KB more, gzipped, for `three/webgpu`, dynamically and after the poster paints. The posters hide the wait.
5. **Era lenses** (film, webcam, flash) could fight the era screens. Each era gets one cue at most, with a kill switch per era.
6. **The references are probably copyrighted.** Keep them out of `public/` and out of git.
7. **Older iOS and Firefox on Android run WebGL2**, at T1 at best. They need their own pass in the device matrix.

---

## Sources

- [three.js migration guide (wiki)](https://github.com/mrdoob/three.js/wiki/Migration-Guide) and [releases](https://github.com/mrdoob/three.js/releases)
- [Three.js r183: PostProcessing becomes RenderPipeline](https://app.cinevva.com/news/2026-03-18-threejs-r183-render-pipeline)
- [Migrate Three.js to WebGPU (2026): the checklist](https://www.utsubo.com/blog/webgpu-threejs-migration-guide) and [three.js r186 changelog](https://www.utsubo.com/blog/threejs-2026-what-changed)
- [WebGPU is now supported in major browsers (web.dev)](https://web.dev/blog/webgpu-supported-major-browsers)
- [R3F v9 migration guide (async `gl`)](https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide)
- [TSL reference (threejs.org)](https://threejs.org/docs/pages/TSL.html)
- Pamplona, Oliveira, Baranoski, Fogarty, [Photorealistic Models for Pupil Light Reflex and Iridal Pattern Deformation](https://www.npsg.uwaterloo.ca/misc/pupilreflexPub.php), ACM TOG 28(4), 2009
- Bérard, Bradley, Nitti, Beeler, Gross, [High-Quality Capture of Eyes](https://la.disneyresearch.com/publication/high-quality-capture-of-eyes/), SIGGRAPH Asia 2014
- Animal Logic, [Real-time eye refraction (SIGGRAPH 2024)](https://animallogic.com/wp-content/uploads/2024/08/Eye_Refraction_Siggraph_Submission_.pdf)
