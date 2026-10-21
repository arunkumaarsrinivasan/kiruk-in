# Motion numbers (rig/gaze.ts, rig/motion.ts, look.ts, EyeStage.tsx)

## Units and limits
x ±1 = ±24° yaw, y ±1 = ±10° pitch. Hard limits: x ±26°, up 12°, down −17° (further down than up, as an orbit allows).

## GAZE_DEFAULTS
- rest (0, 0), spread (0.45, 0.4), fixMs 700, ampMean 4°, microRate 0.6/s.
- dwellA/B 1 s, lines 6, width 0.7, lineStep 0.12, scrollSpeed 2.5°/s.
- follow 1, pursuitGain 0.85, catchUp 1.6°, blinkEvery 3.6 s.

## Scripts
- **lock / contact:** hold rest; next hold gamma(2 s, k 3).
- **read:**
  - line start at left + rand 1.5° with undershoot;
  - a 12% regression back 1–3° once more than 3° into the line;
  - steps +1.6–3.0°, ±0.1° vertical;
  - return sweep at the right edge; line 0 counts a page turned;
  - hold gamma(fixMs, k 5, 0.15–1 s).
- **two-target:** dwell gamma(dwellA/B, k 3, 0.3–8 s), then a saccade to the other side; looks about within 1.5° on a and 3.5° on b.
- **scroll:** content carries the eye up; after 2.5–4.5° it jumps back to rest ±1.5° x, −1…−2.5° y.
- **idle / scatter:** amplitude `min(1.6·max spread, gamma(ampMean, k 2, 0.5–30°))`, y ×0.7, reflected back into the box at half.

## Drift and microsaccades
- OU drift: decay 1.5/s, noise 0.45·√dt, pull 0.4/s.
- Next microsaccade gamma(1/microRate, k 2, 0.25–3 s); 0.3–0.8 s after any saccade.
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
- **Wobble:** ω 2π·9 Hz, ζ 0.32, gain 0.6, ±0.25 mm.
- **Brow lift:** `0.6·clamp(gaze.y, −0.6, 1) + 0.3·interest`, λ 6. Interest goes to 1 at λ 1.5 within one iris radius.
- **Greeting flash** 1.5 mm (rise 0.14 s, hold to 0.36 s, fall 0.45 s). It plays when the pointer returns after > 2.5 s away (≥ 4 s apart), and 1.2 s after ready.
- **Frown** `0.55·glare + 0.22` while reading, λ 2. **Squint** `max(0.6·glare, squintRest)`, λ 1.5; glare `smoothstep(0.55, 0.95, screenLum)`.
- **Lash lag:** spring 7 Hz, ζ 0.35, ∓0.03 × lid velocity, ±0.6 rad.

## Calm
`CALM = { grain 0.45, gaze 0.6 }`; director ×1.25; from `(pointer: coarse)`.
