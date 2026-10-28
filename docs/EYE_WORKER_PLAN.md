# The loader eye in a worker

Status: plan, 2026-10-29. Nothing built yet.

## Why

Vercel Speed Insights on 2026-10-29 rated `/` at 57 on desktop and 28 on mobile. The paint metrics are fixed (FCP and LCP went from 11–19 s to about 0.3 s, uncommitted). What is left is responsiveness (INP) **during the opening**:

- three.js builds every shader on the main thread: setup, analyze and generate, as one task per material.
- Each task takes 100–400 ms on a laptop, and 1.2–2.6 s on a phone viewport with 4× CPU throttling. About 11 s of the phone's opening goes to these builds.
- A single material's build can't be split. A tap or key that lands on one waits it out, and in the lab the worst interaction during the opening reached 2.5–3.4 s.
- After the eye opens, responsiveness is fine: 64 ms worst on the throttled phone.

The input-quiet gate (`input-quiet.ts`) only lowers the odds of a collision. The real fix is to stop sharing the thread: the eye renders from a dedicated worker into an `OffscreenCanvas`, and the main thread keeps only the loader's DOM and input handling.

## What stays exactly the same

- Every node graph, uniform, bake, medium, cut, rig and tier. The worker runs the **same `EyeScene` code**, not a port.
- The look. The worker path must render pixel-identical frames to the main-thread path in all ten eras (gate below).
- The tube opening, which is already its own worker, and the hand-off.
- The main-thread `EyeStage`. It stays as the fallback and as the lab's default.

## What the platform supports (checked in this repo)

| Piece | Status |
|---|---|
| `@react-three/fiber` 9.8.2 `createRoot(canvas)` | Typed for `HTMLCanvasElement \| OffscreenCanvas`. No `<Canvas>`, no ResizeObserver, no DOM events needed. |
| three 0.186 `WebGPURenderer` | Accepts an `OffscreenCanvas` (`Renderer.domElement` is typed for it; the WebGPU backend already special-cases it). |
| WebGPU in a dedicated worker | Chrome/Edge (desktop and Android). Safari 26 to be confirmed in phase 0. |
| WebGL2 on `OffscreenCanvas` in a worker | Chrome, Firefox 105+, Safari 17+. |
| `requestAnimationFrame` in a worker | Chrome, Firefox. Safari to be confirmed in phase 0. |
| Worker bundling | Already proven: `new Worker(new URL("./tube/tube.worker.ts", import.meta.url), { type: "module" })` works in dev (Turbopack) and in the prod build. |
| React in a worker | Works. React needs no DOM; r3f brings its own reconciler. `EyeScene` must not import `react-dom`. |

## The code that touches the main thread today

Everything else in `src/components/three/eye/` is plain math, TSL and data.

| Where | What | In the worker |
|---|---|---|
| `EyeStage.tsx` `<Canvas>`, `gl` factory, `setDpr` | Creates the renderer and owns the DPR | `createRoot(offscreen).configure({ gl, size, dpr, flat, camera })`. The DPR watchdog calls `configure` directly. |
| `EyeStage.tsx` window `pointer*` / `blur` listeners | Gaze, press on the iris, leaving | An input bus fed by messages |
| `EyeStage.tsx` `document.hidden` | Stops rendering in a background tab | Message |
| `EyeStage.tsx` `window.setTimeout` | Iris re-bake delay, page paint | `self.setTimeout` (same API) |
| `EyeStage.tsx` `gl.domElement.toDataURL` | Lab poster capture | `OffscreenCanvas.convertToBlob` (lab only; can wait) |
| `tiers.ts` `readTierSignals` | `matchMedia`, `innerWidth`, `devicePixelRatio`, `navigator.deviceMemory` | Read on the main thread, sent in `init` |
| `bake/brow.ts` (2 canvases), `era-screen-texture.ts`, `post/readout.ts` | `document.createElement("canvas")` for 2D drawing | `new OffscreenCanvas(w, h)`. `bake/vessels.ts` already does this. |
| `post/readout.ts` | `document.fonts.load(Geist Mono)` | `new FontFace(name, url)` added to `self.fonts`. The font URL is sent in `init`. |
| `screen-pages.ts` `TextureLoader` | Loads the eras' home pages via `<img>` | `ImageBitmapLoader` with `imageOrientation: "flipY"` and `premultiplyAlpha: "none"`, matched to today's upload (parity risk 1). |

The loader page calls only six control methods: `irisAt`, `eyeCentre`, `pupilMm`, `holdBlink`, `holdGaze` and `travel` (plus `holdShut` and `openLids` in `open-eye.ts`, which are built from these). The lab uses the other ~40 methods, and it stays on the main-thread path.

## Architecture

```
main thread                                         eye.worker.ts
-----------                                         -------------
ImmersiveEraLoadingPage
  └─ EyeStageWorker (same props as EyeStage)
       canvas.transferControlToOffscreen() ──init──▶ createRoot(offscreen)
       props (era id, exiting, covered, calm…) ──▶      .configure({ gl: WebGPURenderer, size, dpr })
       resize / dpr / visibility ─────────────▶      .render(<EyeScene … bus={bus}/>)
       pointer move/down/up/out, blur ─────────▶   input bus  ─▶ EyeScene (as today)
       commands (holdBlink, holdGaze, travel…) ▶   control.current.*
       ◀── ready(info) / fail / frame snapshot { iris, eyeCentre, pupilMm, fade } (each drawn frame)
  control.current (proxy):
       commands  → postMessage (fire and forget)
       getters   → the latest snapshot (at most one frame old)
```

- **One scene module, two hosts.** Split `EyeScene` out of `EyeStage.tsx` into `EyeScene.tsx` with no `react-dom` and no DOM, and give it an environment adapter (`eye/env.ts`): `makeCanvas`, `loadPage`, `loadFont`, `tierSignals`, and an input bus. `EyeStage` (main thread) feeds the bus from window listeners. `eye.worker.ts` feeds it from messages.
- **Synchronous getters become snapshots.** The tap hit-test (`irisAt`) reads a position that is at most one frame old. That's the same staleness as today, because the iris also moves between frames.
- **Choosing the path:** use the worker when `transferControlToOffscreen` exists and the worker reports a renderer within its init timeout. Otherwise mount today's `EyeStage`. A flag (`NEXT_PUBLIC_EYE_WORKER`) and `?eyeWorker=0/1` choose the path for A/B tests.

## Phases

Each phase ends in a check the user signs off before the next one starts.

**P0 — Spike and go/no-go (about 1 day).** A throwaway `/lab/eye-worker` that renders `EyeScene` from a worker on 1970 with media on: WebGPU, then `?gl=1` for WebGL2. Measure main-thread long tasks during warm-up with the vitals harness (scratchpad `vitals.mjs`, to move into `scripts/eye-vitals.mjs`). **Go** if the main thread has no task over 100 ms while the eye builds, and the frame looks the same. Confirm Safari 26 (WebGPU and rAF in workers) on a real device, or decide that Safari takes the fallback.

**P1 — Environment adapter, main thread only (1–2 days).** Move the DOM touches above behind `eye/env.ts`, still on the main thread. Nothing runs in a worker yet. **Gate:** posters and the realism baseline (`scripts/eye-realism-baseline.mjs`) are byte-identical, or within the lab's existing noise, in all ten eras, at rest and in the shut frame. `npm run test:eye` passes.

**P2 — Input bus (about 1 day).** `EyeScene` reads pointer, visibility and blur from the bus instead of `window`. `EyeStage` still feeds it from window listeners. **Gate:** the gaze, the press on the iris, the brow's "leaving" and the ghost finger all behave as before (lab gaze trace before/after).

**P3 — Worker host (1–2 days).** `eye.worker.ts` with the message protocol above. `EyeStageWorker` has the same props as `EyeStage` and the six loader control methods. Init timeout and failure fall back to `EyeStage`. The DPR watchdog, `covered`, `calm` and tiers work as on the main thread.

**P4 — Loader switch (half a day).** `immersive-era-loading-page.tsx` mounts `EyeStageWorker` behind the flag. The tube hand-off (`ready`, `pupil`, `onOpen`) stays message-driven, as now. The input-quiet gate is kept: it costs nothing and still helps the fallback.

**P5 — Proof (1 day, eye-verification).**
- Worker vs main-thread renders of all ten eras at rest, hover, press and enter, plus a slowed filmstrip of one cut, on desktop and a phone shot.
- The opening end to end: boot frame, tube, hand-off, lids open, enter 1991.
- Vitals at 1× desktop and 4× phone, local build vs current: FCP and LCP unchanged; main-thread long tasks during the opening below 100 ms; worst interaction during the opening, target under 200 ms on the throttled phone (2.5–3.4 s today).
- Fallback forced (`?eyeWorker=0`, and a browser without `OffscreenCanvas`): identical to today.

**P6 — Ship.** Deploy behind the flag. Turn it on, then watch Speed Insights for about a week (mobile INP and RES) before making it the default and dropping the flag.

## Risks and what to check for each

1. **Page upload parity.** `ImageBitmap` vs `<img>` can differ in flip, premultiplication and colour-space conversion. Check: the cornea's mirrored page matches in each era (P1 renders).
2. **Fonts in the worker.** 2026's readout uses Geist Mono through `next/font`. The worker loads the same file by URL. Until it arrives, the existing fallback-then-redraw path covers it.
3. **GPU-process stalls.** A shader compiled the synchronous way still stalls every frame in the browser, worker or not. The async pipeline warm-up (`createRenderPipeline` wrapper) carries over unchanged. Check for frozen frames in P5.
4. **Two GPU workers at once** (tube and eye). That's the same GPU load as today, just on different threads. Watch the tube's frame times (its lab stats).
5. **Bundle.** The worker chunk carries three, React and r3f (~400 KB gzip, loaded in parallel). The main thread stops loading three for the eye unless it falls back. The net transfer is about equal; what moves is the parse and compile, off the main thread.
6. **Lab drift.** The lab stays on the main-thread host, so its numbers keep meaning what they meant. `?eyeWorker=1` in the lab is for A/B only.

## Not doing

- **Splitting shaders into smaller passes** to shorten each build: it changes the rendering, against the detail rule.
- **Pre-generating WGSL at build time:** it depends on three's internal `NodeBuilderState` and bindings, and would break on every three upgrade.
- **Moving builds after the eye opens:** swipes and taps happen there, and today that phase is clean (64 ms).

## Drift log

| What | Spec | Built | Why |
|---|---|---|---|
