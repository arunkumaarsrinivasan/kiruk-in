---
name: eye-motion
description: "How the loader eye moves like a person: per-era gaze scripts (read, scatter, two-target, lock, scroll, contact, idle), main-sequence saccades with undershoot, fixation drift and microsaccades, pointer pursuit with catch-up, the blink rig, lid-gaze coupling, Bell's phenomenon, brow muscles, the post-saccadic wobble, calm mode on phones and reduced motion. Use when changing where or how the eye looks, blink timing, anything that 'darts', 'feels robotic' or 'is too busy', or when porting the motion. Triggers on: gaze, saccade, microsaccade, fixation, pursuit, follow pointer, blink, blink rate, eye movement, calm, reduced motion, prefers-reduced-motion, too busy, darting, robotic motion."
---

# Motion: a calm, real person

The loader is watched for seconds. Realism that darts or shimmers reads as an irritant, not as life. Every motion is physiological, but slower and rarer than a lab recording:
- mean fixations of 750 ms or more in the scripted eras (lab free viewing gives 200–300); at most ~1.6 saccades a second in the busiest era;
- microsaccades at 0.5/s or fewer;
- blinks every 3–6.5 s on average.

*Why (2026-10-28):* the user found the eye "going to and fro, too much, shaking". Reading at 400 ms fixations made 2.2 saccades a second.

## Rules
1. **Long fixations, rare small microsaccades.** Fixations last gamma(fixMs, k = 4, clamped 0.1–2.5 s; reading k 5, 0.25–1.6 s; sums of exponentials give the real long tail). Microsaccades run ~0.45/s and stay under 0.6°, aimed back at the fixation point when drift exceeds 0.15°. They never count toward blinks.
   - **Only a real saccade's landing pushes the next microsaccade back** (0.4–0.8 s clear). *Why:* resetting the timer on every landing, microsaccades included, ran them at ~1.7/s whatever `microRate` said.
2. **Saccades follow the main sequence:** duration `0.0022·deg + 0.021 s`, a minimum-jerk profile. Above 8° the eye lands at 90–94% and makes a correction 110–170 ms later. Jumps under 0.05° are ignored.
3. **Pursuit follows the pointer** with low-passed velocity (τ 0.08 s) and a gain of 0.85 (0.97 for 2026), capped at 30°/s. A catch-up saccade fires when the error exceeds `catchUp`. It aims where the pointer will be, trusting velocity only up to 30°/s, so a jump's spike is never chased.
4. **At rest the loader's eye looks straight at the visitor in every era** (`EYE_CONTACT_AT_REST`, look.ts; the user, 2026-10-29): the contact pattern, rest (0, 0), each era's own follow and blink rate; it follows the pointer when it moves. The era scripts below stay as data, not played at rest. *Why:* 1970's reading drifted the eye ~2.2 mm down the frame (pupil at 61 % down the screen); eye contact is the loader's impact. 2026 keeps its own contact settings.
5. **Each era has a gaze script** (data, see 4) that tells its story without a word (table below). On an era change the eye finishes what it is doing (the hold is capped at 0.12 s), then starts the new script.
6. **Blinks snap shut and open slowly:** 70 ms close, 40 ms hold, 190 ms open, then the last tenth creeps open over 0.4 s (R13). 15 % of natural blinks are partial (0.5–0.9); a double's second blink and any blink the stage asks for are whole. Intervals are exponential around the era's mean (3–6.5 s, clamped 0.8–12 s), with 18% doubles. Big saccades bring blinks (p = smoothstep(12°, 35°)·0.7).
7. **The more shut lid wins** between the natural blink, a held lid and the cut. The blink rig runs every frame, so a natural blink caught by a cut finishes unseen.
8. **The vertical range is lopsided** (the user, 2026-10-28): `gazePitchUnits` (anatomy.ts) shapes the gaze rig's y before anything turns: up is a soft stop at ~8.5° (`0.85·tanh(1.4y)/tanh(1.4)`), the brow's bony rim and the tightening lid resisting it; down runs to 16° (×1.6), and the upper lid follows, so the eye half closes looking down. The brow still reads the rig's raw gaze. *Why:* looking up went past any real eye; looking down barely moved and the lids stayed open.
9. **The lids ride with the eye, under a ceiling** (the user, 2026-10-28/29): down, the upper lid follows the eye 0.92 and the lower 0.3, so the eye half closes (opening 10.65 → 8.4 mm). Up, the upper lid's ride saturates at `LID_UP_CEILING` 0.07 rad (~0.9 mm, `upperRide`: cap·tanh(0.88·pitch/cap)) and the lower lid rises 0.3, so the opening stays ~the same (10.65 → 10.9 mm) and the iris slides up under the lid. *Why:* following the eye, the opening grew ~25 % taller looking up; the user asked three times. Prove lid changes with the twin's opening table (rest / up / down), not by eye. Only the lid's own skin rides: past the crease (~6.5 mm) the hood and the brow's underside stay put, and up-gaze tucks the lid's skin into a deeper crease. The margin drapes over the cornea in a gentle rise (lift capped at 0.55 mm), never a peak. *Why:* looking up, the lid lagged the iris and covered it, the skin under the brow slid with it, and the cornea pushed the margin into a point; it read as the lid coming down.
10. **The face moves with the eye, and the brow answers after it. The eye's movement is the brow's main driver** (the user, 2026-10-28): cursor → eye → brow, never cursor → brow. Wherever the eye looks, the brow takes that direction's shape (up-nose: the inner brow leads; up-temple: the outer; down-temple: the tail falls most), a beat after the eye lands. Feelings ride on top. The upper lid follows pitch; the lid apex drifts after the cornea; Bell's phenomenon rolls the eye up 9° in a blink; the caruncle shifts. The brow waits out a saccade (~120 ms), then a new shape travels from the head to the tail. A brow that slides with the lid, or lifts in one piece, reads as a zoom.
   - **The brow feels what the visitor does** (`rig/brow.ts`): senses → feelings → four muscles → a five-node bone chain. Tonic feelings are held by a condition and eased; phasic ones play an envelope (the greeting flash's onset is ~100 ms). Muscles rise fast (λ 18–25) and fall slowly (λ 4–5). Nodes are springs (head 3.4 Hz → tail 2.5 Hz, ζ 0.68), so a shape travels head to tail with a little overshoot.
   - A press reports a pointer move in place: arrivals count only moves that go somewhere (> 0.08 R), or a press would greet instead of wince.
   - **Seven muscles, fired as motor programs:** AU1, AU2, AU4, AU6 on the brow; AU5, AU7, AU43 on the lids. Each impulse fires its muscles in its own order (a wince's lids lead its brow by ~50 ms; surprise's lids lead its brows by 30–50 ms; delight's smiling eyes trail by ~180 ms).
   - **A dart is aimed** (2026-10-28): closing > 7 R/s, inside 2 R, its course passing within 0.6 R of the eye's middle. *Why:* the iris is big on screen (R ~216 px at 1440×900); "inside 3.5 R" startled the brow on almost every brisk move. Judge brow motion from a live 60 Hz recording of human-speed cursor glides kept inside the window (a spot past the edge is the visitor leaving: wistful, then a full greeting).
   - **Memory:** a repeated startle habituates (× 0.6 within 10 s) and the third turns wary; three pokes without going in turn to annoyance; a cursor returning after a poke is braced for (~12 s); 30–40 s of nothing is a gentle boredom (lids ~0.7 mm heavier at most), counted from when the eye can be reached. Each era holds its own mood under all this (look.ts ERA_BROW, B4): a task's expression, as its gaze is a task's gaze. A mood reads the eye, not the pointer: 2013's lift is held only while the eye is up at the lens, and 2026's only in eye contact (the gaze within ~4° of the visitor). 2026 also flashes the brow on meeting the visitor's eyes again, now and then, and mirrors the visitor (× 1.2 on what they make it feel). A new era is greeted (× 0.4) only when the era really changed: the cut director's busy flag also flickers for a sign's press.
   - **The eye takes part:** blinks are held through a startle, a stare or annoyance; one blink follows a startle's end; the pupil opens with arousal (`PupilInput.arousal`).
11. **The iris wobbles after a saccade** on a 9 Hz spring (ζ 0.45, ≤ 0.15 mm), slower than life so 60 Hz can show it. It is kicked by the frame's change in turning speed and stepped at 240 Hz, whatever the frame rate.
   - *Why:* stepped once a frame, the spring is unstable under ~35 fps. On the weak GPU (13–30 fps) it sat at its ±0.25 mm clamp, flipping sign every frame: the whole iris shook. **Every spring in the rig is substepped** (the brow at 240 Hz, the lashes at 4 per frame); check any new one at 15 fps.
12. **Nothing scales the frame.** No focus breathing, no zoom at rest; only the enter moment zooms.

## Gaze scripts (look.ts ERA_GAZE)
| Era | Pattern | What it says | Key params |
|---|---|---|---|
| 1970 | read | reading a terminal, slightly down | rest (0, −0.12), 5 lines, fix 750 ms, blink 5.5 s |
| 1981 | scatter | short hops between icons | spread (0.35, 0.3), fix 900, amp 3.5° |
| 1991 | read | a page; the screen scrolls only when the eye turns a page | 7 lines, fix 750, blink 6 s |
| 1995 | scatter | jumping between whatever blinks | spread (0.7, 0.55), fix 800, amp 7° |
| 1997 | two-target | nav frame ↔ content | a (−0.62, 0.15) 1.4 s, b (0.22, 0) 3.5 s, fix 900, follow 0.7 |
| 2000 | lock | staring at the search box, looking down into the laptop | rest (0, −0.4), drift and microsaccades only (0.5/s), follow 0.25 |
| 2003 | idle | watching the video just under the lens | rest (0, −0.28), fix 1100, follow 0.6 |
| 2009 | scroll | a phone held low, content carrying the eye up | rest (0, −0.7) (−1.5 hid the iris), fix 950, scroll 1.6°/s, follow 0.4 |
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

## Realism pass (R13): tuning motion for one era
Adds (verify in the research card; `docs/EYE_REALISM_PLAN.md`):
- 15 % partial blinks that stop at 0.5–0.9;
- the late opening creep (the last tenth over to 0.5 s);
- OU fixation drift inside the calm caps;
- pupil latency 0.23 s, with speed caps of 4.2 mm/s constricting and 1.1 mm/s dilating;
- hippus as five slow sines;
- skin that stretches over the globe in a blink without its texture sliding.

```
Making motion more real for one era?
├── Is it what any eye does (blink kinematics, drift, pupil dynamics)? → the person: change once, for all eras
├── Is it what the task makes it do (reading, scrolling, a locked stare, eye contact)? → ERA_GAZE data
└── Is it caused by the device (the near reflex at 32 cm in 2009; squint at a white page)?
      → derive it from ERA_LIGHT distance and luminance, never a per-era constant
```

| Era | The task | Realism to check |
|---|---|---|
| 1970 | reading a terminal | line returns; a blink every ~5.5 s; stares break the tear film |
| 1981 | pointing | short hops, long fixations |
| 1991 | reading a page | regressions, slightly up |
| 1995 | scanning a busy page | frequent saccades and gaze-evoked blinks |
| 1997 | nav ↔ content | lateral two-target saccades |
| 2000 | locked on the box | the longest stares, the fewest blinks (screens lower the blink rate); microsaccades only |
| 2003 | a video chat | idle, looking just below the lens |
| 2009 | scrolling a phone at 32 cm | near reflex (pupil constricts, slight inward turn); lids lowered |
| 2013 | a selfie | lens, then screen; the brow rises with the gaze |
| 2026 | eye contact | pursuit 0.97; partial blinks are tracker dropouts |

- **Partial blinks are natural blinks:** the director suppresses them during cuts and for 600 ms after.
- **New motion obeys the calm caps:** scripted fixations ≥ 750 ms, microsaccades ≤ 0.5/s, nothing scales the frame. Measure them per era with the motion probe (saccades/s from `gazeLog()`, the wobble read every frame) before showing anyone.

Full gaze, blink and brow parameters: `references/motion-numbers.md`.
