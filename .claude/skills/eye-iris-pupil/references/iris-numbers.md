# Iris numbers (bake/iris.ts, nodes/iris.ts)

## Bake targets
- **Size:** width = tier (512 / 1024 / 2048); height = max(64, w/4). Mipmapped, repeat-wrapped in angle.
- **albedo** (rgb + a = height, 0.5 = the stroma's mean). **masks:** r furrows, g crypts, b fibres, a max(ruff, limb).
- **Radial coordinate:** `t = (rho − rest)/(1 − rest)`, 0 at the pupil margin, 1 at the root.

## Layers
- **Fibres:**
  - angle bent by `noise(cs·2.5, t·3)·wave·0.09`;
  - fine `(1 − |n(cs·52, t·2.4)|)^3`, coarse `(1 − |n(cs·17, t·1.5)|)^6`;
  - `fib = clamp(fine·0.38 + coarse·0.9 − 0.18)`.
- **Collarette:**
  - radius `colR + n(cs·3)·0.05 + sin(14θ + n·3)·0.022` (a zigzag);
  - split ±0.025; ridge `smoothstepDown(0.055, 0, |t − colR|)`.
- **Crypts:** Worley `(cs·10, t·4.5)` below 0.34 → 0.14; Gaussian about the collarette (σ 0.16); t 0.04–0.92; ×1.4·crypts.
- **Furrows:** phase `t·5.5 + n·0.35`, ring `smoothstepDown(0.16, 0, |sin(π·phase)|)`; outer ciliary zone only (t 0.58–0.97); broken by `step(0, n(cs·6))`.
- **Ruff:** `smoothstepDown(0.06, 0, t)·(0.25 sin 64θ + 0.75)`.
- **Limbal ring:** `smoothstep(0.84, 1, t)·limbal`.
- **Freckles:** Worley `(cs·15, t·8)`.

## Albedo
- **Zone colour** = mix(outer, inner) by the collarette split, ×(1 + 0.15·noise).
- **Fibre tone** `mix(zone·1.45, (0.72, 0.75, 0.8), scatter)`: pale in a light iris, buried in a dark one.
- **Depth between fibres:** `zone·mix(0.32, 0.62, melanin)`. Fibre weight `fib·(1 − 0.55·melanin)`.
- **Modifiers:**
  - crypts → zone ×0.22; furrows ×(1 − 0.45·ring);
  - the collarette is a soft lift (0.22), not a line;
  - ruff (0.07, 0.04, 0.03); limb (0.03, 0.03, 0.036); arcus grey-white at t 0.88–0.95.
- **Height:** `0.5 + (fib − 0.5)·0.35 + ridge·0.25 − crypt·0.45 − ring·0.3 + ruff·0.1`.

## Shading
- **Parallax:** one step, `slide = ray.xy/max(|ray.z|, 0.3)`.
- **Relief:** height 0.07 mm toward the light; `clamp(0.62 − (hL − h)·3.2, 0.25, 1.15)`.
- **Caustic:** `smoothstep(0.15, 0.85, −across)·exp(−((rho − 0.78)/0.15)²)·oblique·1.4`.
- **Limbal shadow** ×0.55 on the near side. Diffuse `amb·1.4 + key·relief`.
- Furrows deepen past rest: `masks.r·clamp((pupil − rest)·2.5, 0, 0.6)`.
- **Pupil edge** width `fwidth(rho) + 0.003`. Interior (0.012, 0.009, 0.01) → 0.002, fundus (0.09, 0.02, 0.02)·0.3. Red reflex (0.85, 0.16, 0.07).
- **Inner wall:** width `slant·0.3/RI`. Never use equal smoothstep edges (NaN on some GPUs); offset by 2e-4.
- **Beyond the root:** fades to 0.022 grey over rho 0.98–1.04.
- **Crossfade** between bake sets: `weightB` damped at 4.5 (60 under reduced motion).
