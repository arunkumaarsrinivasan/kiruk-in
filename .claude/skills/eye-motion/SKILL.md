---
name: eye-motion
description: "How the loader eye moves like a person: per-era gaze scripts (read, scatter, two-target, lock, scroll, contact, idle), main-sequence saccades with undershoot, fixation drift and microsaccades, pointer pursuit with catch-up, the blink rig, lid-gaze coupling, Bell's phenomenon, brow muscles, the post-saccadic wobble, calm mode on phones and reduced motion. Use when changing where or how the eye looks, blink timing, anything that 'darts', 'feels robotic' or 'is too busy', or when porting the motion. Triggers on: gaze, saccade, microsaccade, fixation, pursuit, follow pointer, blink, blink rate, eye movement, calm, reduced motion, prefers-reduced-motion, too busy, darting, robotic motion."
---

# Motion: a calm, real person

The loader is watched for seconds. Realism that darts or shimmers reads as an irritant, not as life. Every motion is physiological, but slower and rarer than a lab recording:
- mean fixations of 400 ms or more (lab free viewing gives 200–300);
- microsaccades at 0.7/s or fewer;
- blinks every 3–6.5 s on average.

## Rules
1. **Long fixations, rare small microsaccades.** Fixations last gamma(fixMs, k = 4, clamped 0.1–2.5 s; sums of exponentials give the real long tail). Microsaccades run ~0.6/s and stay under 0.6°, aimed back at the fixation point when drift exceeds 0.15°. They never count toward blinks.
2. **Saccades follow the main sequence:** duration `0.0022·deg + 0.021 s`, a minimum-jerk profile. Above 8° the eye lands at 90–94% and makes a correction 110–170 ms later. Jumps under 0.05° are ignored.
3. **Pursuit follows the pointer** with low-passed velocity (τ 0.08 s) and a gain of 0.85 (0.97 for 2026), capped at 30°/s. A catch-up saccade fires when the error exceeds `catchUp`. It aims where the pointer will be, trusting velocity only up to 30°/s, so a jump's spike is never chased.
4. **Each era has a gaze script** that tells its story without a word (table below). On an era change the eye finishes what it is doing (the hold is capped at 0.12 s), then starts the new script.
5. **Blinks snap shut and open slowly:** 70 ms close, 40 ms hold, 190 ms open. Intervals are exponential around the era's mean (3–6.5 s, clamped 0.8–12 s), with 18% doubles. Big saccades bring blinks (p = smoothstep(12°, 35°)·0.7).
6. **The more shut lid wins** between the natural blink, a held lid and the cut. The blink rig runs every frame, so a natural blink caught by a cut finishes unseen.
7. **The face moves with the eye:** the upper lid follows pitch; the lid apex drifts after the cornea; Bell's phenomenon rolls the eye up 9° in a blink; the brow lifts by muscles with gaze and interest; the caruncle shifts. A brow that slides, or a face that stays still while the eye turns, reads as a mask.
8. **The iris wobbles after a saccade** on a 9 Hz spring, slower than life so 60 Hz can show it.
9. **Nothing scales the frame.** No focus breathing, no zoom at rest; only the enter moment zooms.

## Gaze scripts (look.ts ERA_GAZE)
| Era | Pattern | What it says | Key params |
|---|---|---|---|
| 1970 | read | reading a terminal, slightly down | rest (0, −0.12), 5 lines, fix 420 ms, blink 5.5 s |
| 1981 | scatter | short hops between icons | spread (0.35, 0.3), fix 900, amp 3.5° |
| 1991 | read | a page; the screen scrolls only when the eye turns a page | 7 lines, fix 400, blink 6 s |
| 1995 | scatter | jumping between whatever blinks | spread (0.7, 0.55), fix 450, amp 7° |
| 1997 | two-target | nav frame ↔ content | a (−0.62, 0.15) 1.4 s, b (0.22, 0) 3.5 s |
| 2000 | lock | staring at the search box | drift and microsaccades only, follow 0.6 |
| 2003 | idle | defaults | — |
| 2009 | scroll | a phone held low, content carrying the eye up | rest (0, −1.5), scroll 1.6°/s |
| 2013 | two-target | a selfie: the lens, then the screen | a (0, 0.45) 1.2 s, b (0.04, 0.25) 4 s |
| 2026 | contact | eye contact, follows best of all | pursuit 0.97, catch-up 1° |

Read script: line starts undershoot, forward steps of 1.6–3°, 12% regressions, a return sweep at each line end. Scatter reflects a jump back into its box at half.

## Calm (phones)
`calm` comes from `(pointer: coarse)` only: grain ×0.45, gaze ×0.6, cut durations ×1.25. *Why:* phone visitors found the loader too busy. A narrow desktop window keeps the full eye.

## Reduced motion
- The gaze goes to rest and ignores the pointer.
- No blinks, wobble, lash lag, brow motion or rack focus; the clock freezes for the scene (sign clocks keep running).
- The tear film stays fresh.
- Era changes are a plain cut, rate-limited.
- Signs are steady; hover and press stay live.

## Idle cost
When the pointer is idle (> 2.8 s) and nothing has moved for 0.25 s, the stage draws 1 frame in 3, carrying skipped time so the eye's clock never slows. Saccades, blinks and cuts count as motion, so they always draw.

Full gaze, blink and brow parameters: `references/motion-numbers.md`.
