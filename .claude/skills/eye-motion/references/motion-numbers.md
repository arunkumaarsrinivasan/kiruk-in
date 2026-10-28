# Motion numbers (rig/gaze.ts, rig/motion.ts, look.ts, EyeStage.tsx)

## Units and limits
x ±1 = ±24° yaw, y ±1 = ±10° pitch. Hard limits: x ±26°, up 12°, down −17° (further down than up, as an orbit allows).

## GAZE_DEFAULTS
- rest (0, 0), spread (0.45, 0.4), fixMs 700, ampMean 4°, microRate 0.45/s.
- dwellA/B 1 s, lines 6, width 0.7, lineStep 0.12, scrollSpeed 2.5°/s.
- follow 1, pursuitGain 0.85, catchUp 1.6°, blinkEvery 3.6 s.

## Scripts
- **lock / contact:** hold rest; next hold gamma(2 s, k 3).
- **read:**
  - line start at left + rand 1.5° with undershoot;
  - a 12% regression back 1–3° once more than 3° into the line;
  - steps +1.6–3.0°, ±0.1° vertical;
  - return sweep at the right edge; line 0 counts a page turned;
  - hold gamma(fixMs, k 5, 0.25–1.6 s).
- **two-target:** dwell gamma(dwellA/B, k 3, 0.3–8 s), then a saccade to the other side; looks about within 1.5° on a and 3.5° on b.
- **scroll:** content carries the eye up; after 2.5–4.5° it jumps back to rest ±1.5° x, −1…−2.5° y.
- **idle / scatter:** amplitude `min(1.6·max spread, gamma(ampMean, k 2, 0.5–30°))`, y ×0.7, reflected back into the box at half.

## Drift and microsaccades
- OU drift: decay 1.5/s, noise 0.45·√dt, pull 0.4/s.
- Next microsaccade gamma(1/microRate, k 2, 0.25–3 s), set when one fires; a real saccade's landing only pushes it to ≥ 0.4–0.8 s away (a microsaccade's landing leaves it).
- Amplitude `min(0.6°, 0.1 + rand·0.25 + off·0.5)`.

## Pursuit
- Target = pointer × 24°·follow, pitch blended with rest by 1 − follow.
- Smooth velocity → `ptrVel·gain + error·3` with τ 0.1 s, cap 30°/s.
- Catch-up aims at the position after duration + 0.05 s, with `trust = min(1, 30/v)`.
- A pointer is fresh for 2.2 s; after it leaves, the next hold is gamma(0.35 s).

## Blink
- Close 70 ms linear, hold 40, open 190, smoothstepped.
- Interval: 18% doubles (next at total + 0.11 s); else `exp(every·0.7) + every·0.3`, clamped 0.8–12 s. First blink at 2.5 s.
- Paused when exiting, staring, holding a lid or quiet after a cut (600 ms).
- Without media, an era arrival blinks 60% of the time; with media, the cut is the blink.

## Face coupling
- **Upper lid:** pitch ×0.85 looking up, ×0.7 looking down. **Lower:** ×0.35. Lid apex at `−0.04 + 0.25·yaw`.
- **Bell's phenomenon:** 9° up × blink.
- **Wobble:** ω 2π·9 Hz, ζ 0.45, kicked by `−0.6 × Δ(turn speed)` each frame, stepped at 240 Hz (≤ 48 steps a frame), ±0.15 mm. Measured after the fix: ≤ 0.034 mm peak in every era.
- **Measured at rest, loader framing, media on (2026-10-28, after the calm fix):** saccades 0.5–1.6/s (1995 busiest), microsaccades 0.25–0.62/s.
- **Brow** (`rig/brow.ts`, five nodes head → tail; spec and the full action table in `docs/EYE_BROW_EMOTION_PLAN.md`):
  - **Muscle shapes, mm at 1** (head, inner, arch, outer, tail): AU1 dy 1.5, 1.35, 0.75, 0.25, 0; AU2 dy 0.1, 0.4, 1.2, 1.4, 0.6; AU4 dy −1.1, −0.85, −0.4, −0.12, 0 and dx −0.9, −0.55, −0.2, −0.05, 0, bulge 0.35, 0.2, 0.05; AU6 dy 0, −0.05, −0.2, −0.45, −0.7. With AU1 on, AU4's lowering of the head and inner node is cut by 0.6 × AU1 (AU1+4: inner up while drawn together). Above 1, a muscle saturates toward 2.
  - **Muscle rates** λ up/down: AU1, AU2 25/5; AU4 18/4; AU6 22/4.
  - **Chain:** springs 3.4, 3.2, 3.0, 2.8, 2.5 Hz, ζ 0.68; bending 0.2 × ω² on the neighbours' mean; bones keep length at 0.25 a step (240 Hz steps), the head anchored ×0.3; nodes clamped ±4 mm.
  - **Gaze is the main driver** (the user, 2026-10-28; rig/brow.ts gazePose): the brow takes a shape for wherever the eye looks, eight directions blended by angle and scaled by the turn, heard 120 ms after a saccade lands, then λ 5.5. Full turn, mm head → tail: up 0.73 0.86 1.00 0.81 0.52; up-nose 1.12 1.03 0.78 0.44 0.19; up-temple 0.33 0.61 0.97 1.13 1.00; nose head −0.26 and 0.45 in; temple tail +0.44; down −0.27 −0.26 −0.28 −0.38 −0.52; down-nose ≈ −0.4 throughout and in; down-temple tail −0.78. Node travel has a soft knee: linear to +2 / −1.3 mm, toward +3 / −2.
  - **Orbicularis, straight onto the nodes:** (0.58 × squint + 0.18 × blink) × 0.1, 0.2, 0.4, 0.7, 1 down.
  - **Impulses** (on / apex / off s): greet 0.10/0.20/0.40 (first sight, back into the window, ≥ 12 s idle, or ready + 1.2 s; 4 s apart. A 4–12 s pause with the pointer still in the window is only a small "oh" at 0.35, 6 s apart; a move must go > 0.08 R, never a press in place); surprise 0.08/0.15/0.45 (approach > 7 R/s inside 3.5 R, no scribble); delight 0.12/0.60/0.60 (enter); flinch 0.06/0.10/0.28 (press on the iris; a finger after 100 ms); relief 0.15/0.10/0.60 (let go after a wince, a fast scrub ending); wistful 0.30/0.60/1.20 (leaving the window after attention). An impulse over 0.5 halves the tonic feelings.
  - **Tonic** (λ up/down): interest 0.25 + 0.45 × nearness (1 → 4 R) 2.5/1.2; curious on the iris 0.5–3.5 s, or lingering 1–1.5 R slowly 1.6/1.4; warm after 2.5–3.5 s still on the iris 0.7/1.0; confused smoothstep(1.5, 4, reversals/s) 2/0.7; focus 0.3 reading + 0.6 glare + 0.35 slow scrub + 0.6 holding a press 1.5/1; strain smoothstep(1.2, 3, eras/s) 3/1.5.
  - The pad roll reads `lids.brow` = the inner and arch nodes' mean lift; brow motion counts as motion for the idle frame-skip.
  - **Lid muscles** (λ up/down: AU5 22/6, AU7 24/5, AU43 3/6): `lids.upper` = rest + 0.17 × min(AU5, 1.2) − 0.19 × min(AU43, 1), floored at 0.35 × rest; `lids.squint` = glare squint + 0.9 × AU7 + 0.35 × AU6, ≤ 1.
  - **Recipes for the lids** (AU5, AU7, AU43): surprise 1, 0, 0; greet 0.35; delight 0.25 (+ AU6 0.6); flinch 0, 1, 0 (+ AU6 0.9); annoyed 0.15, 0.35; wary 0.8; skeptical 0, 0.25, 0.45; bored 0, 0, 0.3; intense 0.7; focus 0, 0.45.
  - **Motor-program lags** (s, AU1 AU2 AU4 AU6 AU5 AU7 AU43): surprise 0.03 0.05 0 0 0 0 0; greet 0 0.02 0 0 0.05; delight 0 0.02 0 0.18 0.03; flinch 0 0 0.05 0.02 0 0; wary 0.05 0.08 0.10.
  - **Memory:** habituation × 0.6 per repeat within 10 s; wary on the third dart, or a dart < 8 s after a wince; annoyed (swell 2 s) on the third poke within 6 s, or confusion > 0.6 held 2.5–4 s; brace = expect (1 after a poke, τ 12 s) × smoothstep(0.2, 1.5, approach R/s) × nearness, into focus; skeptical (swell 2.5 s) on the third iris entry within 8 s; bored smoothstep(30, 40 s idle), λ up 0.25, down 3 (recipe AU1 0.2, AU2 0.12, AU43 0.3: at 0.55 the lid fell ~1.4 mm and read as sleepy).
  - **Era moods** (look.ts ERA_BROW, held under the visitor's feelings; settle 4× faster behind a cut): a mood is { hold, atLens, flick } (atLens held only while the brow's heard gaze is up at the lens, smoothstep(0.28, 0.42, y)). 1970 focus 0.35; 1981 curious 0.3; 1991 interest 0.3 + focus 0.15; 1995 interest 0.3 with a flick (a greeting's shape at 0.25 on a gaze jump, ≥ 0.85 × 7 s apart, never with calm, never in quiet poses); 1997 sceptical 0.2 + focus 0.1; 2000 focus 0.25 + intense 0.2; 2003 warm 0.2 + interest 0.15; 2009 a flick only (every 10 s, peak 0.2); 2013 at the lens interest 0.5 + warm 0.15; 2026 eye contact: `atContact` interest 0.3 (held only while the heard gaze is inside the cone of direct gaze, 1 − smoothstep(4°, 8°) over 24° yaw × 10° pitch), `meet` an eyebrow flash (a greeting's shape at 0.3) when the eye lands back on the visitor after ≥ 1 s away and holds contact 0.25 s, ≥ 12 s apart (a still cursor is let go after 2.2 s and the eye returns on its own), and `mirror` 1.2 on what the visitor brings (commands, fired impulses, swells; not glare, boredom, moods or the gaze shape). Reading no longer knits the brow by itself.
  - **Gaze → brow response** (`gazeReach`): a 0.04 dead zone, then (1 − e^(−2.6 x)) / (1 − e^(−2.6)), so 0.15 → 0.29, 0.33 → 0.57, 0.5 → 0.75 of a direction's shape (linear read as "only at the edges"). The heard gaze follows at λ 8. Temple pose tail +0.85, nose pose head −0.45 / in 0.6. Hovering and hesitating need < 0.3 R/s; an iris entry counts after ≥ 0.4 s off it.
  - **The brow hears a saccade from `gazeRig.saccading`** (phase "saccade" only), never `busy`: `busy` is true all through pursuit, and with it the brow never heard the gaze while a cursor was on screen (fixed 2026-10-28).
  - **Eye:** blinks held while startle > 0.2, intense > 0.4 or annoyed > 0.5; one blink when a startle over 0.4 falls under 0.1; arousal = max(startle, delight, 0.6 intense, 0.5 annoyed, 0.4 interest).
- **Lash lag:** spring 7 Hz, ζ 0.35, ∓0.03 × lid velocity, ±0.6 rad.

## Calm
`CALM = { grain 0.45, gaze 0.6 }`; director ×1.25; from `(pointer: coarse)`.
