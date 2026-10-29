---
name: eye-tsl-craft
description: "Engineering rules for the loader eye in three.js TSL (WebGPU with a WebGL2 fallback): graph structure, uniforms, Fn layouts, branches, coordinate and colour conventions, the WGSL traps that black the screen, shader size and compile time, async pipeline warm-up, tiers, the GPU watchdog and measuring cost. Use whenever writing or debugging TSL/WGSL/GLSL for the eye or a post pass, when a frame goes black, when compile takes seconds, or when the GPU cost rises. Triggers on: TSL, three/tsl, WGSL, WebGPU, WebGL2, shader, Fn, setLayout, toVar, uniform, uniformArray, If ElseIf, compile, createRenderPipeline, black screen, NaN, GPU cost, tier, DPR, watchdog, RenderPipeline, convertToTexture."
---

# TSL craft for the eye

## Structure
1. **Build every graph once.** Eras, sweeps and states only write uniforms and swap textures. *Why:* assigning a new node to a material recompiles its pipeline, a visible hitch mid-cut.
2. **One uniform registry** (`uniforms.ts`), every per-frame value in `renderGroup`, all damping in one JS loop.
3. **Branch only on values that are the same for every pixel** (the era number, the tier, a uniform). Per-pixel choices use `select()` / `mix()`. An `If` on a uniform is free; use it to skip expensive work (a capture effect only while `press + enter > 0`).
4. **Heavy reused code is a real function:** `Fn(([a, b]) => …).setLayout({ name, type, inputs })`. *Why:* without a layout TSL inlines the body at every call. 2013's fifteen components inlined made the fragment 683 KB (an 11 s compile); as functions, 470 KB.
5. **Vertex before fragment.** Lid curves, lash bending and gaze terms are computed per vertex, in one vertex `Fn` that assigns all varyings.
6. **Bake what doesn't move** (iris, vessels, pores, lash data). MaterialX noise is for bakes only.
7. **Analytic optics:** refraction and reflection are ray–sphere and ray–plane maths in the material, never screen-space transmission.

## Traps that silently break the frame (check every new branch)

| Trap | Symptom | Fix |
|---|---|---|
| A value first built inside one `If` branch and read by another | that branch reads it unset (black, missing lighting) | build it before the `If` and pin with `.toVar()` |
| JS unary minus on a node: `vec2(0, -one)` | WGSL `NaN.0`, pipeline invalid, black frame | `one.negate()` |
| JS maths on a TSL constant: `TWO_PI * RI` (`TWO_PI`, `PI` from tsl are nodes) | WGSL `NaN.0`, pipeline invalid | `Math.PI * 2 * RI` for numbers; `.mul()` for nodes |
| `number + node` in JS (`j * 3.1 + s` with `s` a node) | string constant, "Type 'string' not found" | `float(s).add(j * 3.1)` |
| `pow()` of a negative | NaN | multiply (`x.mul(x)`), or clamp first |
| `smoothstep(a, b, x)` with a > b, both constants | WGSL rejects the shader | `smoothstepDown(from, to, x)` or `1 − smoothstep(b, a, x)` |
| `exp()` of a large positive | overflow to inf, black | clamp the argument |
| Texture sample inside a non-uniform branch without a level | undefined derivatives | `.level(n)` on every sample in a branch |
| Strokes as plain numbers into helpers expecting nodes | `w.mul is not a function` | wrap with `float(w)` |
| A custom `fragmentNode` with MRT | other targets get nothing; WebGPU rejects | `outputNode` / `colorNode` with `mrtNode` |
| Sampling an addon post node's texture directly | node never updates | `passTexture(node, tex)` or its `getTextureNode()` |
| Transparent `DoubleSide` | draws twice | `forceSinglePass` on camera-facing ribbons |

**Run the frame after every new branch** and read the console. Uncaught WGSL errors print once and the frame is simply black.

## Conventions
- Node land is top-left: `screenUV`, `QuadMesh` UVs and render targets start top-left. Ports from GLSL flip once at the entry.
- Colour: work in linear and tonemap once. Canvas textures are tagged `SRGBColorSpace`. The medium texture is display-encoded on purpose (eye-era-media).
- Untyped handle: `const { … } = T` from `nodes/tsl.ts` (any-typed). *Why:* @types/three narrows every result, so helpers can't compose; the shader compilers are the real type check.
- Sizes are in reference px × `kc`, never device px (the watchdog changes DPR).
- Hashes have no `sin` (Hoskins hash12), so they stay steady at pixel coordinates in the thousands.
- **The eye never touches `document` or `window` itself.** Canvases, image textures, fonts, the viewport and `coarse` come from `eye/env.ts` (`eyeEnv()`). *Why:* the stage is moving into a worker (docs/EYE_WORKER_PLAN.md), where neither exists. The page's host does exactly what the DOM did, so routing through it changes no pixel (P1 gate: 80 lab shots, identical within run-to-run noise). The stage's pointer, blur and visibility come from `eyeEnv().listen(...)` and `hidden()`, never from `window`/`document` listeners; a worker host feeds them from the page's messages (`forwardInput` → `emit`). Use plain `setTimeout`, not `window.setTimeout`.

## Compile time and warm-up
- **Measure every big change.** Inject a script that wraps `GPUDevice.prototype.createShaderModule` (logs WGSL size) and `createRenderPipeline` / `…Async` (logs ms). Turn the medium on and read the largest fragment and slowest pipeline.
- **Budget:** one era's medium ≤ ~150 KB of WGSL. Turn components into `Fn().setLayout` functions first.
- **Every era's medium is its own pipeline** (`eraMedium(Ux, tex, n)`, one `RenderPipeline` per era sharing the finished frame's texture). The first frame compiles only the era on screen. *Why:* all ten in one 471 KB shader took 16 s to build on an integrated GPU, and the loader's opening gave up waiting at 20 s.
  - After the era on screen is up, the other eras build one at a time in the background: the era asked for first, then the nearest. Each is drawn under the era on screen until its pipeline exists.
  - New pipelines keep building asynchronously until all ten exist.
  - Readiness is tracked per draw material in the pipeline wrapper.
  - The director never cuts to an era that isn't built.
- **One-shot bakes must be redone once the stage is warm.** The async warm-up skips any draw whose pipeline isn't ready, including a bake's single draw. So the iris fibres, sclera vessels and skin pores stayed blank on the first 1970 open until an era change re-baked them. Every bake has `redo()`, and the stage calls all of them (plus `tear.reset()`) the moment warm-up completes. Any new render-once pass must do the same.
- **A sync `createRenderPipeline` freezes the whole browser**: every tab and worker waits on the GPU process. Warm by wrapping the backend's pipeline creation to the async path for the first, staged frames, and skip draws whose pipeline isn't ready. `compileAsync` helps only if its target, MRT and QuadMesh vertex node match the real frame (they didn't).
- While compiling, show a poster or the opening (eye-opening). Never a blank or a frozen frame.
- **Node building is main-thread JS, one task per material** (three's NodeBuilder: `build`/`analyze`/`getDataFromNode` in a profile). Measured 2026-10-29: 100–400 ms a task on a laptop, 1.2–2.6 s at 4× CPU throttle on a phone viewport; ~11 s of the phone's opening is spent here. It cannot be split inside one material. A tap or key landing on one waits it out, and the browser counts that against the page (INP). So:
  - the covered stage holds its frames (the ones that build) for 0.6 s after a key or press, at most 1.5 s between frames (`INPUT_QUIET`, `INPUT_HOLD`, `input-quiet.ts`; the tube calls `noteInput()`). *Why:* input comes in bursts; the next key in a burst finds the thread free.
  - Keep builds before the eye opens. Once open, a phone's worst interaction measured 64 ms; a build after open would land on the swipes and taps the eye invites.
  - The only full fix is the stage rendering from a worker (OffscreenCanvas + WebGPURenderer), so builds never share the input thread.

## Tiers and the watchdog
- Pick the tier **before** the first compile (URL `?tier=`, signals); changing it later remounts and double-compiles, which ran DXC out of memory.
- The watchdog may lower DPR, lower pass resolution or zero a cost through a uniform (aperture 0 turns DOF off). It never changes a graph's shape.
- It reads the real rAF delta, and skips while warming or covered. *Why:* an idle-throttled dt once stepped DPR down to 0.7, with a resize stall each step.
- T1 (WebGL2 or a weak GPU): no emissive MRT or bloom (three's MRT merge fails there), DPR 1. Every medium must render on WebGL2. Test with the lab's "Force WebGL2 backend".

## Measuring cost
- Use an integrated GPU as the weak-GPU proxy (a Radeon 610M in kiruk-in). Its timings drift ±25% from run to run. A/B inside one page by toggling a uniform gate every few seconds, never across separate runs.
- Find the expensive pass by switching layers off in the lab before optimising.
- **Time each pass** (lab, profile mode): `__eyeLab.current.stats.passes`.
  - It gives GPU ms per render pass, named "material → target", as a mean per frame over the last half second (WebGPU only).
  - `stats.gpuMs` is the same mean for the whole frame.
  - *Why:* switching layers off can't see fixed passes. Per-pass timing found 2026's medium at 31.6 ms when the whole frame read 57.
- **Inside one big pass, gate its layers with uniform `If`s** (2026's `M.layers`) so a layer switched off costs nothing. Read the price of each that way before cutting.
- **Gate per-pixel work on where it shows, not only on a uniform.** The brow's expression folds (lid-mesh.ts) ran on every lid pixel, nearly the whole frame, for 2.5 ms of the 610M's scene pass. Branching on the skin's tension (a varying: is this pixel squeezed at all?) and each fold's own mask brought the brow to ~0.1 ms at rest and ~0.8 ms while a feeling is held. The lab's `browOn` bits (1 move-net, 2 folds) A/B them in one page.
- **Uniform-only maths is paid at every pixel.** Anything that depends on no pixel (an instrument's position, its timings, its fades) is worked out once a frame on the CPU and passed as a uniform array, with the CPU code mirroring the shader's sums.
  - *Why:* 2026's twelve landmarks cost ~6 ms of a weak GPU's frame recomputing identical numbers at 1.3 M pixels.
  - See `post/measured-marks.ts` → `medium.marks`.
- **Draw each element only where it can land.** Put it in a per-pixel `If` on its box, ring band or curve band:
  - a ring: `abs(d − r) < w + 1.5`;
  - a callout: its leader's and label's box;
  - an ellipse: its distance estimate, before the `atan`.

  Pin with `.toVar()` everything two of these `If`s share (the trap above: a shared value left unpinned dropped a whole gimbal ring).
  - 2026's pass went 31.6 → 9.6 ms; the image was unchanged but for its ticking readouts.
  - Check it the same way: before/after shots under reduced motion, diffed against a noise floor taken from two shots of the same build.
- **A ray march's cost is samples, then the maths per sample** (R2, the iris relief, +9.4 → ~+1.6 ms at iris-fill):
  - **Linearise a short march:** under a millimetre the polar map is linear, so take its Jacobian at the hit once and make each step a multiply-add. *Why:* an `atan` and two `sqrt`s per step paid for a dozen steps at 1.3 M pixels.
  - **March the top layer first; go deeper only where it opens** (an `If` on its coverage). *Why:* the brown iris's border layer covers ~85 %; marching the floor everywhere was the larger half of the cost.
  - **Interpolate the crossing** from the two samples either side of it (secant), not a binary refine: one or two refine samples instead of four.
  - Read the lab's step view (red = samples taken) before cutting step counts.
- Frame budget about 15 ms at 1.47 MP on the weak GPU (WebGL2/T1 ~11 ms); the tube opening ~3 ms.
- **R0 measured more (2026-10-28):** 1440×900 at DPR 1, headless, every frame drawn (`scripts/eye-realism-baseline.mjs`).
  - the clean frame is 22–24 ms; with media, 24–33 ms;
  - **2026's medium ≈ 35 ms (57 ms a frame);** 2013's ≈ 9 ms;
  - the lids and skin are 5.2 ms; ~15 ms sits in fixed passes the layer switches can't see;
  - T2 ≈ T3.

  Time each pass before optimising: layer switches can't resolve the fixed passes.

## Realism pass (R15) and the TS twins
- **Targets:** T3 ≤ 12 ms on the 610M, T2 ≤ 8 ms, T1 ≤ 11 ms. Per-part budgets are in `docs/EYE_REALISM_PLAN.md` §6. The budget is set by the worst era (full detail plus the heaviest medium), measured per era.
- **Medium-aware detail floor:**
  - micro terms (pores, cushions, fine vessels, micro striations) widen their footprint by `ERA_MEDIUM.floorPx`;
  - an `If` on a uniform skips them when fully faded;
  - the graph never changes.
- **Draw front to back:** lashes, lids, eyeball, room, with the depth test. *Why:* the cornea and iris optics then skip what the lids cover.
- **TS twins:** every analytic curve the shaders use also exists in plain TS with unit tests (`src/components/three/eye/twin/`). Change both together. *Why:* this is how the reference keeps every part aligned, and how the media get exact feature points (C4).
  - `margins.ts` mirrors `nodes/margins.ts` `marginsAt` line for line, and owns `FISSURE_MM`, `LID_THICKNESS` and `fissureAngles`, which the shader side re-exports.
  - `optics.ts` holds today's cornea and the paraxial entrance pupil (one and two surfaces).
  - `iris-space.ts` holds the area-preserving rest space and `shaderRestRho`, the map as `nodes/iris.ts restSpace` runs it (the collarette held short of the root past ~0.9 open).
- **Run the tests:** `npm run test:eye` (`node:test` + `tsx`).
  - A known gap is a `{ todo: "Rn: why" }` test that fails today. The phase that closes it removes the `todo`.
  - Never weaken a test to pass. Fix the model, or keep the `todo` and log the drift.
- **Offline bakes** (if chosen, plan §7.1): KTX2 with mips, loaded behind the poster, versioned with the person's data, never redone at runtime.
- **Per-era realism values are uniforms fed from `look.ts`** (C11).
