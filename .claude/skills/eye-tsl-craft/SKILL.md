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

## Tiers and the watchdog
- Pick the tier **before** the first compile (URL `?tier=`, signals); changing it later remounts and double-compiles, which ran DXC out of memory.
- The watchdog may lower DPR, lower pass resolution or zero a cost through a uniform (aperture 0 turns DOF off). It never changes a graph's shape.
- It reads the real rAF delta, and skips while warming or covered. *Why:* an idle-throttled dt once stepped DPR down to 0.7, with a resize stall each step.
- T1 (WebGL2 or a weak GPU): no emissive MRT or bloom (three's MRT merge fails there), DPR 1. Every medium must render on WebGL2. Test with the lab's "Force WebGL2 backend".

## Measuring cost
- Use an integrated GPU as the weak-GPU proxy (a Radeon 610M in kiruk-in). Its timings drift ±25% from run to run. A/B inside one page by toggling a uniform gate every few seconds, never across separate runs.
- Find the expensive pass by switching layers off in the lab before optimising.
- Frame budget about 15 ms at 1.47 MP on the weak GPU (WebGL2/T1 ~11 ms); the tube opening ~3 ms.
