# The loader eye in a worker

Status: P0–P5 done 2026-10-29. The loader draws the eye from the worker by default. P6: deploy, then watch Speed Insights for about a week.

## P4–P6 (2026-10-29, lean: typecheck, then one proof run)

**P4.** `immersive-era-loading-page.tsx` mounts `EyeStageWorker`. The page's `EyeStage` stays behind two switches:
- `NEXT_PUBLIC_EYE_WORKER=0` at build time;
- `?eyeWorker=0` per visit (`=1` forces the worker on).

The choice is made in an effect before the eye mounts, so hydration is unchanged. `eyeControl` is now an `EyeLoaderControl`. The worker host's box carries `data-eye-host="worker"`.

**P5.** One local production build, `/` with typing and taps from 1.5 s on (scratchpad `vitals.mjs`):

| | Worker (default) | Page (`?eyeWorker=0`) |
|---|---|---|
| Desktop: FCP / LCP | 0.50 / 0.50 s | 0.51 / 0.51 s |
| Desktop: worst interaction | 264 ms | 360 ms |
| Desktop: main-thread long tasks (longest) | 4 (213 ms) | 13 (420 ms) |
| Phone 4× CPU: FCP / LCP | 0.54 / 0.54 s | 0.66 / 0.66 s |
| Phone 4×: worst interaction | **0.73–1.15 s** (two runs) | **4.1 s** |
| Phone 4×: main-thread long tasks (longest) | 5–6 (0.6–1.07 s) | 29 (3.4 s) |

CLS is 0 in all runs. One phone worker run recorded no LCP entry; the rerun had LCP at 0.54 s.
- **Target missed:** P5's target was under 200 ms on the throttled phone. The eye no longer causes the remaining long tasks. They come from the page itself: hydration at about 0.6 s, and two more at about 2.7 s and 4.3 s (the site mounting under the loader, the era chunks). Those are the next INP work, not the eye's.
- **Opening:** the loader opened onto the worker-drawn eye in the browser pane, centred, with the corner lines, and stayed centred after a resize to 800×640.
- **Not reproduced:** one capture taken during the pane's first open showed the eye zoomed to its top-left quarter. The next load and the resize test were correct. Watch for it.

**P6.** Ship is a deploy of this branch. Turn the worker off without a code change by setting `NEXT_PUBLIC_EYE_WORKER=0` and redeploying. Watch mobile INP and RES for about a week. If they hold, drop the switch and the input-quiet gate's fallback role stays as it is.

## P3 results (2026-10-29)

The worker host is real code now, not a lab spike:
- `eye/EyeStageWorker.tsx`: EyeStage's props (less the lab's `profile` and `capture`) plus `onHost`. It imports no three. It makes the canvas, hands it to the worker, forwards input (`eye/input.ts`), and reports resizes (ResizeObserver on the canvas, plus the window for the pointer's view).
- `eye/worker/eye.worker.ts`: the same `EyeScene` inside `StageBoundary`, rendered by `createRoot(offscreen)`. Props arrive by message and wait until the renderer is configured.
- `eye/worker/protocol.ts`: the messages, as types only.
- `EyeLoaderControl` (in `EyeStage.tsx`): the loader's six controls. Commands are posted. The getters (`irisAt`, `eyeCentre`, `pupilMm`) read the worker's last frame, which the worker sends after each frame (r3f `addAfterEffect`) only when it changed. `open-eye.ts` takes this narrow type.
- **Falling back to today's `EyeStage`, with the same props:**
  - no `OffscreenCanvas`;
  - the worker fails to load (Turbopack dev, `chunkPath.split`);
  - no renderer 8 s after the worker's code runs;
  - no `requestAnimationFrame` in the worker;
  - any error in the worker, including render errors caught by `StageBoundary`.

  `onHost("page", reason)` says why.
- 2026's readout: the page sends the worker the Geist Mono file that covers the digits. next/font splits the family into subsets, so it picks the face whose `unicode-range` has "0". Importing the family into `EyeStageWorker` puts its `@font-face` on the page.
- `/lab/eye-worker?host=worker` now runs this host (`?era=`, `?fail=1`, `window.__eyeCtl`). The spike worker is deleted, and `gpu-trace.ts` moved to `eye/worker/`.

**Gate:** a scripted check on a local production build (desktop, 1440×900, WebGPU). It drives both hosts the way the loader does: hold shut and read the pupil, open, release, point left, `travel(0.45)`, resize to 600×900.

| | Page (`EyeStage`) | Worker (`EyeStageWorker`) |
|---|---|---|
| Main-thread long tasks while the eye builds | 4–5 over 100 ms (worst 223–239 ms) | **0** |
| Held shut: iris / pupil | (720, 415) r 208 / 4.5 mm | (720, 415) r 208 / 4.5 mm |
| Open, gaze held ahead | (720, 469) | (715–720, 469) |
| Pointer left | (604, 487) | (604, 487) |
| Resized to 600×900: iris / centre | (295, 436) r 114 | (295, 436) r 114 |
| Picture held open | same frame (lab shots compared side by side) | |
| `?fail=1` | — | falls back: page draws, `why: "no renderer in 0 ms"`, same numbers |
| 2026 font in the worker | — | `"Geist Mono": loaded` (before the fix: none, because the lab page never had its `@font-face`) |

The harness's window sits off screen, so a frame can lag until a screenshot forces one, on either host. One run of each host read a held-shut value just after opening for that reason. Re-reading after the next frame gives the values above. `tsc` is clean.

## P2 results (2026-10-29)

The stage's own reads of the page now go through the host too (`eye/env.ts`):
- `hidden()`;
- `listen({ move, down, up, out, blur, visibility })`.

The page's host sets exactly the listeners `EyeStage` set before: pointer events on `window` (passive), blur, and `visibilitychange` on `document`. The pointer's position is scaled by `viewport()`, not `window.inner*`. The two timers use plain `setTimeout`, and the lab's `project()` also works on an OffscreenCanvas.

A worker host gets the same events as messages: the page calls `forwardInput(send)`, and the worker calls `workerEnv(...).emit(event)`. The spike worker no longer fakes `window` or `document` at all (`shim-globals.ts` is deleted). React, r3f and three run there without them.

**Gate:** a scripted check (real mouse input through CDP, plus synthetic `pointerout`, `blur` and `visibilitychange`), run before and after on the page and after in the worker:

| | Page before | Page after | Worker after |
|---|---|---|---|
| Pointer left / right: iris x | 609 / 834 | 609 / 834 | 609 / 834 |
| Pointer on the iris | 744 | 744 | 744 |
| Press on the iris | flinch 0.35, then relief 0.81 | flinch 0.36, then relief 0.84 | flinch 0.30, then relief 0.74 |
| Pointer leaves the page | wistful 0.44 | wistful 0.46 | wistful 0.41 |
| Page hidden: the eye's clock over 1 s | 0 | 0 | 0 |
| Visible again | 0.97 | 1.04 | 1.00 |

Feelings differ by a few hundredths with frame timing, as they do between runs. The worker still shows 0 main-thread long tasks while the eye builds. `tsc` is clean. The ghost finger drives the eye through `travel()` (a control call), not pointer events, so P2 doesn't touch it; it's checked with the loader in P4/P5.

## P1 results (2026-10-29)

`src/components/three/eye/env.ts` is the one place the eye asks its host for anything:
- `canvas(w, h)` for 2D drawing;
- `loadTexture` for the eras' pages;
- `loadFont` for 2026's readout;
- `viewport()` and `coarse()` for the tier and the pixel budget.

The page's host (the default) does exactly what the code did before: `<canvas>`, `TextureLoader`, `document.fonts`, `window`. `workerEnv(view)` gives OffscreenCanvases, `createImageBitmap` pages, fonts by URL into the worker's FontFaceSet (the page lists its @font-face files), and the view the page reports.

The DOM calls in `bake/brow.ts`, `era-screen-texture.ts`, `post/readout.ts`, `screen-pages.ts` and `tiers.ts` now go through the adapter. Outside `EyeStage.tsx`, no eye module touches `document` or `window`. `bake/vessels.ts` already drew on an OffscreenCanvas and is unchanged.

**Gate:** the lab's still shots before and after (`eye-realism-baseline.mjs poses,seeposes`, 80 shots: six poses and the medium at rest and half shut, in all ten eras, tier 3, reduced motion):
- **73 shots are byte-identical.**
- The other 7 (the 1981 and 1991 poses) differ by a mean of at most 0.030/255. That's the same 7 shots, and the same amount, as two runs of the untouched code differ from each other (0.035).
- `tsc` is clean.

The spike worker now runs on `workerEnv` alone: its `document` throws if asked for an element, and none was asked for. On desktop WebGPU it showed 0 main-thread long tasks while the eye built, and the same eye with the page in the cornea the right way round.

Not yet checked: the worker's font path (2026's readout). The spike lab renders 1970 only; this belongs to P3.

## P0 results (2026-10-29)

`/lab/eye-worker?host=worker|main` renders the live eye (1970, media on), unchanged, either from a worker or from the main thread. It warms the way the loader does (covered, 10 Hz) and is uncovered once ready. The worker runs today's `EyeScene` through small shims (`src/lab/eye-worker/shim-*.ts`): 2D canvases become `OffscreenCanvas`, the eras' pages load through `createImageBitmap`, and pointer events are forwarded. Local production build, real GPU (Ryzen + 610M), Chrome. Key bursts were typed throughout the warm-up.

| Case | Main-thread long tasks while the eye builds | Worst interaction while it builds | Eye ready |
|---|---|---|---|
| Desktop WebGPU, main thread | 6–7, 0.73–0.87 s total, max 210 ms | 224–248 ms | 5.6–5.8 s |
| Desktop WebGPU, **worker** | **0** | **≤16 ms** | 5.4–5.8 s |
| Phone 412×823, 4× CPU, main thread | 15, 4.97 s total, max 1.12 s | 1712 ms | 7.6 s |
| Phone 412×823, 4× CPU, **worker** | 2 (page start-up, 264 ms) | **none over 16 ms** | 6.0 s |
| Desktop WebGL2, main thread | 5, 7.17 s total, **max 6.84 s** | (keys could not be sent while blocked) | 15.1 s |
| Desktop WebGL2, **worker** | **0** | 1544 ms (a GPU-process stall, see below) | 15.8 s |

Notes:
- **The look matches at a glance:** the same eye, the same 1970 page in the cornea, the sign showing. Strict parity is P1's gate.
- **The harness flatters the main thread:** it can't send a key while the main thread is blocked, so those keys aren't counted.
- **The phone's worker figures are optimistic:** CDP's CPU throttling probably doesn't slow worker threads. A real phone check is still needed (P5).
- **WebGL2 still stalls the GPU process** for about 1.5 s while it links programs, worker or not. It's the remaining INP risk on browsers without WebGPU. Fix it separately: `KHR_parallel_shader_compile` polling, or fewer programs at once.
- **Warming uncovered at full rate froze page frames for about 3.3 s on desktop in both hosts**, with no pipeline creation in that window: the iGPU's queue saturates. The loader warms covered and never hits this. Keep it that way, and never warm an uncovered stage at full rate.
- **Turbopack dev can't start this worker** (`chunkPath.split is not a function` in its worker blob code). The production build (webpack) works. P3 needs a dev workaround, or a check on a newer Next.
- **The worker stage reaches ready no later than the main-thread one.** Its builds no longer compete with React and the page's own work.

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
| P0 spike lab | Throwaway `/lab/eye-worker` | Kept (`src/lab/eye-worker/`, dev only, `LAB_ROUTES=1` for a local prod build); shims instead of the adapter | It's the A/B harness for P1–P5; the shims are deleted when P1's adapter lands |
| `EyeScene` export | Split into `EyeScene.tsx` in P1 | Exported from `EyeStage.tsx` for now | Smallest change that lets the spike import it; the split waits for P2, when the scene loses its own window listeners |
| `tierSignals` in `init` | The page reads the tier signals and sends them | The worker reads `navigator` itself; only `coarse` and the viewport come from the page (`WorkerView`) | `deviceMemory`, `hardwareConcurrency` and `connection` exist on WorkerNavigator |
| `bake/vessels.ts` | Through the adapter | Unchanged | It already chose OffscreenCanvas wherever one exists; routing it would change the page's upload path for nothing |
| Shims | Deleted in P1 | `shim-three.ts` deleted in P1; `shim-globals.ts` deleted in P2 | EyeStage's own reads waited for the input bus |
| Input bus | Its own module | Part of the host (`EyeEnv.listen` / `hidden`, `forwardInput`, `workerEnv().emit`) | One object a worker installs; the page's version is the old listeners verbatim |
| `capture` (lab poster) | `convertToBlob` in a worker | Still `toDataURL` | Lab only, and the lab stays on the page; revisit if a worker capture is ever needed |
| Spike probe | — | `probe` message: iris, feelings, clock read back from the worker | The P2 gate needs to see the worker's stage hear input; P3's frame snapshot replaces it |
| Input bus home | `env.ts` | `eye/input.ts` (types, `listenPage`, `dispatchInput`, `forwardInput`); env.ts re-exports | env.ts imports three; the page side of a worker stage must not |
| Snapshot | `{ iris, eyeCentre, pupilMm, fade }` each drawn frame | `{ iris, centre, pupilMm }`, after each frame, only when it changed | The loader reads no fade; unchanged frames needn't cross threads |
| Init timeout | From mount | 8 s from the worker's `boot` to its `renderer` | A slow download of the worker chunk isn't a reason to load three again on the page; the loader's own late-eye poster covers it |
| Lab default | Main-thread host | `?host=worker` is the default in `/lab/eye-worker` (as in P0); `/lab/eye` stays on the page | That lab exists to A/B the hosts |
| Renderer `trackTimestamp` | — | Not passed in the worker | Lab profiling stays on the page host |
| Flag default | Off; turned on after deploy | On by default; `NEXT_PUBLIC_EYE_WORKER=0` / `?eyeWorker=0` switch it off | The fallback covers every browser the worker can't serve, and the user asked to finish the rollout in one go |
| Proof (P5) | Ten eras × rest/hover/press/enter, filmstrip, phone shot | One vitals run (desktop, 4× phone, both hosts) and the opening in the pane | Lean mode, at the user's request; the scene code is the same, and P1–P3 compared pixels and controls |
