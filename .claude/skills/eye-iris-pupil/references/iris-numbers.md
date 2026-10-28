# Iris numbers (bake/iris.ts, nodes/iris.ts)

## Bake targets
- **Size:** width = tier (512 / 1024 / 2048); height = max(64, w/4). Mipmapped, repeat-wrapped in angle.
- **Per set:** `relief` r floor, g shell, b shell cover, a floor tone; `colour` rgb surface, a the floor's AO. Heights are shares of the relief depth (0.5 = mean surface); 0 inside the pupil.
- **Laid out once,** at the person's resting pupil (`identity.pupil.rest`); `layoutA/B` = (rest, rest + collaretteR·(1 − rest)). Re-baked only for another person (EyeStage keys on seed, iris, resting pupil); never per era.
- **Radial coordinate:** `t = (rho − rest)/(1 − rest)`, 0 at the pupil margin, 1 at the root.

## Layers (bake/iris.ts `layers`)
- **Collarette:** radius `colR + n(cs·3)·0.05 + sin(14θ + n·3)·0.022` (a zigzag); split ±0.025; ridge `smoothstepDown(0.055, 0, |t − colR|)`.
- **Profile:** `0.55 + 0.1·exp(−((t − col)/0.22)²) + 0.12·ridge − 0.1·smoothstep(0.75, 1, t)`.
- **Vessels:** angle bent by `n(cs·2.5, 3t)·wave·0.09` plus `sin(2π·3.2·t + n·6)·wave·0.012`; fine `(1 − |n(cs·52, t·2.4)|)^5`, coarse `(…cs·17, t·1.5)^7`; arcs `(1 − |n(rot(θ ± 1.7t)·28, 0.9t)|)^9 × smoothstep(0.05, 0.3, t)`; `tube = max(coarse, 0.75·fine) + 0.22·arcs`.
- **Crypts:** Worley vec2 `(cs·10, t·4.5)`; hole `smoothstep(0.04, 0.16, F2 − F1)·smoothstepDown(0.42, 0.2, F1)`; band `0.9·exp(−((t − col − 0.09)/0.11)²) + 0.4·exp(−((t − 0.8)/0.07)²)`; clusters `smoothstep(0.42, 0.62, n(cs·7, 3t))`; ×2.2·crypts; t 0.04–0.95.
- **Furrows:** phase `t·5.5 + n·0.35`, `smoothstepDown(0.4, 0, |sin(π·phase)|)`, t 0.58–0.97, faded by `smoothstep(−0.15, 0.25, n(cs·6))`.
- **Ruff:** `smoothstepDown(0.06, 0, t)·(0.25 sin 64θ + 0.75)`. **Limbal ring:** `smoothstep(0.84, 1, t)·limbal`. **Freckles:** Worley `(cs·15, t·8)`.
- **Cover:** `max(smoothstep(0.22, 0.55, tube), (1 − crypt)·(0.92 ± 0.04), ruff)`.
- **Floor** `prof − 0.07·(1 − cover) − 0.36·crypt − 0.14·ring + 0.12·ruff`; **shell** `max(prof + 0.1·tube − 0.12·ring + 0.12·ruff, floor + 0.01)`.
- **Colour (R3): Kubelka–Munk from the layers**, baked (`kmLayer`, the hyperbolic solution; stack `R₁ + T₁²R₂/(1 − R₁R₂)`), over a black epithelium:
  - per channel, melanin K against 650 nm: (1, 1.79, 3.6) from λ^−3.48; the stroma's blood (oxy-Hb) against 550 nm: (0.07, 1, 1.4);
  - border layer: K/S 15.3·mel, S·x 0.065 × border × (1 + 0.3·tube) (gone in a crypt);
  - stroma: K/S 6.5·mel + 8·blood, S·x 1.6 × (1 − 0.96·crypt − 0.25·ring);
  - the person's zones tint it: `mix(1, inner/outer, 0.5·inner)` × (1 + 0.15·noise); then scatter for a light iris, the collarette lift (0.12), ruff, freckles, the limbal ring at 0.3 (was 0.9), the arcus.
  - Fitted offline (scratch `km.cjs`) for melanin 0.85: body L* ~18, hue ~62°, C ~14; fibres a shade darker than the gaps; crypt walls warmer (hue ~53°); floors dark. Pure λ^−3.48 melanin alone gives hue ~70° (olive); the blood pulls it to ~62°. Measured brown irides are 45–55° at their most saturated (R3 card §3).
  - *Why:* zone × (0.6 + 0.9·tube) made the fibres 2.5× brighter than the gaps: pale threads, the drawn look; the user's iris is near-black velvet.
- **Floor tone** `mix(0.32, 0.62, mel) / mix(1.45, 0.7, mel) × mix(1, 0.6, crypt) × (1 − 0.3·ring)` (unchanged).
- **AO (floor):** 16 taps on rings of 0.05 and 0.14 mm, `occ += saturate((top − floor)·0.22/r − 0.05)`, `ao = 1 − 0.9·occ/16`, × `1 − 0.45·cover·saturate((shell − floor)·0.22/0.03)`.
- **Bake cost:** ~60–95 ms of GPU at 2048 × 512 on the 610M (both passes), once per person, behind the poster.

## Shading (nodes/iris.ts)
- **Rest space:** `rc = min(√(rp² + rc0² − rp0²), rp + 0.55(1 − rp))`; pupillary `r0 = √(rp0² + s(rc0² − rp0²))`, `s = (ρ² − rp²)/(rc² − rp²)`; ciliary linear to the root. `rp` includes the uneven margin. Twin: `twin/iris-space.ts shaderRestRho`.
- **Thickness:** `clamp(area^−½, 0.75, 1.6)` in the ciliary zone (`area = ρ/r0 · (1 − rc)/(1 − rc0)`), blended in over rc ± 0.03; depth `D = relief (0.22 mm) × thickness`.
- **March:** from `+0.42D` to `−0.52D` above the cone, linear in the map's Jacobian at the hit. Shell first, secant refine; the floor only where cover < 0.8. Tiers: T3 10 + 2 + 3 shadow, T2 6 + 1 + 2, T1 one parallax step on `mix(floor, shell, cover)` (`slide = ray.xy/max(|ray.z|, 0.3)`).
- **Light:** floor `amb·1.4·ao + key·0.62·lit`; shell `amb·1.4·mix(1, ao, 0.3) + key·relief` (relief `clamp(0.62 − Δh·4.5·thickness, 0.25, 1.15)`, Δh one tap 0.07 mm toward the light); sheen `key·cover·smoothstep(0.8, 1.15, relief)·0.035` (R3: at 0.1 it drew pale radial lines through the page's reflection); `mix(floor, shell, cover)`. Self-shadow in openings: floor and walls block, a bridge passes `1 − 0.8·cover`.
- **Caustic:** `smoothstep(0.15, 0.85, −across)·exp(−((rho − 0.78)/0.15)²)·oblique·1.4`.
- **Limbal shadow** ×0.55 on the near side.
- **The limbus (R3)** is a ramp, not a line: the cornea fades out over ce 0.93–1 (was 0.965–1), its inner shade is 0.1 from ce 0.75 (was 0.24 from 0.68), and the white continues it (sclera.ts: dark brown → cool grey → white over radE 0.94–1.1). Measured sideways in 2003's light: L* 8–12 at 0.9–0.95 R, 43 at 1.0, 59 at 1.05 (photo: a ramp over ~0.85–1.05 R, no ring darker than the iris).
- **Pupil edge** width `fwidth(rho) + 0.003`. Interior (0.012, 0.009, 0.01) → 0.002, fundus (0.09, 0.02, 0.02)·0.3. Red reflex (0.85, 0.16, 0.07).
- **Inner wall:** width `slant·0.3/RI`. Never use equal smoothstep edges (NaN on some GPUs); offset by 2e-4.
- **Beyond the root:** fades to 0.022 grey over rho 0.98–1.04.
- **Crossfade** between bake sets (a new person only): `weightB` damped at 4.5 (60 under reduced motion).
- **Cost:** ~+1.6 ms a frame over the single parallax step it replaced, with the iris filling the frame (T3, 610M).
