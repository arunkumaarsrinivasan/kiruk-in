# The brow: a bone chain that feels what the cursor does

Status: plan written 2026-10-28. B1 built 2026-10-28: rig, bone chain, Hermite move-net, stage wiring, lab Brow section. B2 (skin tension and folds), B3 (lids through their uniforms) and the reference-sheet pass (§4.2–4.4: seven muscles, motor programs, memory, the eye's part) built the same day. B5 (media, 2026's brow landmarks, cost, the real loader on desktop and phone) built and checked the same day. 49 brow tests. Next: B4 (era moods), waiting on the user's yes (§11.4). Awaiting sign-off and the headroom decision (§11.5). Owner skills: eye-anatomy (brow), eye-motion (brow muscles), eye-interaction (what the visitor does), eye-tsl-craft (cost), eye-verification (proof).

## 1. What's wrong today

The brow has a move-net (`nodes/brow-net.ts`, five nodes on the hair curve), but **one number drives all five**:

```
LU.brow  = 0.6 · gaze.y + 0.3 · interest + 1.5 · flash      (EyeStage.tsx, the brow block)
LU.frown = 0.55 · glare + 0.22 · reading
```

So:

1. **Every move is the same arch, scaled.** Up, down, interest and greeting all make one shape bigger or smaller. A shape that only scales reads as a zoom, not as a face.
2. **The nodes are smeared together.** Each node's weight is a Gaussian of σ 0.22 over nodes 0.2–0.3 apart, so all five move almost as one.
3. **It moves like a slider, not a muscle.** The lift follows the pointer's height with no lag, onset or apex. Mostly it's too small to see (0.6 mm × gaze.y); when it does show, it bobs with every vertical move of the mouse.
4. **Nothing it does means anything.** The visitor's actions (arrive, approach, hover, press, enter, scribble, scrub, leave) get no response, except the one greeting flash, which is the same scaled arch.
5. **The forehead stays still.** Skin 3 mm above the brow doesn't move, so a lift squeezes the skin over it instead of carrying the forehead (in life the forehead moves ~85 % as far as the brow).

## 2. What real brows do (references)

| Fact | Value | Source |
|---|---|---|
| Max voluntary brow raise, at the brow | 10.3 ± 2.7 mm (forehead 8.7) | Guihard et al. 2022, *BioMed Res Int*, 3D helmet, healthy adults |
| Max voluntary frown, at the brow | 7.2 ± 1.9 mm | same |
| Eyebrow flash onset | ~100 ms, with little variation across cultures; follows a pause in other face movement | Grammer, Schiefenhövel et al. 1988 (*Ethology* 77); Eibl-Eibesfeldt 1989 |
| Flash total | ~1/5 s to ~1/2 s; longer at an opening (greeting) than mid-conversation | same |
| Muscles (FACS) | AU1 inner raiser (frontalis, medial part); AU2 outer raiser (frontalis, lateral part); AU4 lowerer (corrugator, depressor supercilii, procerus: head down **and in**); AU6 cheek raiser (orbicularis, orbital part: drops the tail); AU7 lid tightener | Ekman & Friesen, FACS |
| Spontaneous vs posed | spontaneous expressions are smaller and slower to leave than posed ones | general FACS literature (verify per number below) |

So spontaneous expressions use **about 15–30 % of the maximum**: a full surprise is about 2.5 mm at the arch, a greeting about 1.4 mm, interest about 0.4 mm, a frown about 1.1 mm down and 0.9 mm in at the head. Every number below is a starting point, tuned against renders and the user's eye photo, one change at a time.

## 2b. The main thing: the brow follows the eye (the user, 2026-10-28)

> "However we move our cursor, based on that, our eye is moving. Based on how our eye is moving, we need to make the eyebrow movement … the main thing is this: eye movement."

The chain is **cursor → eye → brow**. The brow reads the eye's own gaze (the gaze rig's output: its saccades, pursuit and each era's way of looking), never the cursor directly. Feelings ride on top of that.

- **A shape for each direction** (`rig/brow.ts` `GAZE_POSES`, `gazePose`): eight directions round the gaze plus the centre, blended by the gaze's angle and scaled by how far it has turned. Screen left is toward the nose for this eye. Measured at a full turn, mm head → tail:

| Eye looks | Brow | Measured |
|---|---|---|
| up | the whole brow lifts, the arch most | 0.73 0.86 1.00 0.81 0.52 |
| up toward the nose | the inner brow leads | 1.12 1.03 0.78 0.44 0.19 |
| up toward the temple | the outer brow leads | 0.33 0.61 0.97 1.13 1.00 |
| toward the nose | the head knits a little, down and in | −0.26 … (dx −0.45 at the head) |
| toward the temple | the tail lifts | … 0.28 0.44 |
| down | settles, the tail most | −0.27 −0.26 −0.28 −0.38 −0.52 |
| down toward the nose | settles and knits | −0.49 −0.39 −0.32 −0.34 −0.37 |
| down toward the temple | the tail falls most | −0.16 −0.21 −0.33 −0.55 −0.78 |

- **The eye leads, the brow follows:** it hears the gaze once a saccade has landed (~120 ms), then eases after it (λ 5.5), and the nodes' springs carry it (head 3.4 Hz → tail 2.5 Hz). It has under 10 % of the move at 100 ms and is most of the way by 500 ms. Pursuit is followed continuously, a beat behind.
- **The lids follow the same eye** (the upper lid with the pitch, its apex with the yaw; margins.ts). The skin's hood flattens or rolls, and the forehead furrows, from the brow's own move (§5).
- **How strongly the eye follows the cursor is each era's gaze data** (2003 follows at 0.6, 2000 at 0.25, 2026 at 0.97), so in those eras the brow moves less, because the eye does.
- **Stacked with a strong feeling,** each node's travel has a soft knee (linear to 2 mm up and 1.3 mm down, easing toward 3 and 2), and the lid fade widened to 0.8–5 mm, so the fold test holds for every combination.
- Tests: each direction's shape; the centre is still; the shape grows with the turn; no jump round the circle; the eye leads; circling, the brow rides higher while the eye is up.
- The old gaze coupling (frontalis recruited past 2° up, a small down and temple shape) is replaced.
- **Fixed 2026-10-28 (the user: "still I feel the eyebrow is not even moving"):** the stage passed the gaze rig's `busy` as "mid-saccade". But `busy` is true all through pursuit, so with a cursor on screen the brow waited for a landing that never came and never heard the gaze. It now gets `gazeRig.saccading` (a jump in flight only). Measured live in the lab (2026, the visitor's feelings on), mm head → tail:

  | Cursor | Before | After |
  |---|---|---|
  | top-left | 0.08 … 0.28 | 1.25 1.19 0.99 0.58 0.19 |
  | top-right | — | 0.46 0.77 1.16 1.26 0.99 |
  | bottom-right | — | 0.01 0.00 −0.07 −0.35 −0.73 |

  The earlier proofs (the 3×3 grid, the cursor circle) ran in the lab's quiet mode, which forces "not mid-saccade", and so hid it. A test now runs the real gaze rig into the brow as the stage wires it.
- **All the way, not only at the edges (the user, 2026-10-28: "only when we move to extreme it's reacting").** Live sweeps of the cursor across the screen (`brow-px`/`brow-sweep` harness, 2026, feelings on) showed three things:
  1. **The response was straight in proportion to the turn.** A look a third of the way out gave a third of the shape, a few px. `gazeReach` now gives most of it early, past a 0.04 dead zone that leaves fixation's drift alone: 0.15 → 0.29, 0.33 → 0.57, 0.5 → 0.75, 1 → 1.
  2. **A slow pass near or over the iris read as hovering or hesitating** (under 0.6 R/s). Curiosity's arch (1.2–1.5 mm, whichever way the eye looked) then hid the gaze in the middle of the screen. Both now need a hand that has stopped (under 0.3 R/s, `HOVER_SPEED`). Separately, a cursor riding the iris's edge flickered on and off it as the iris turned, and three flickers read as scepticism. An entry now counts only after ≥ 0.4 s off the iris.
  3. **Sideways looks barely showed.** Toward the temple the tail now lifts 0.85 mm at a full turn (was 0.5). Toward the nose the head lowers 0.45 and draws in 0.6 (was 0.3 and 0.45).
  - The brow also catches up faster: λ 8 (τ 125 ms), was 5.5.
  - Measured on the sweeps: bottom → top, the arch runs +0.3 → +1.47 and the tail −0.28 → +0.68 mm. Bottom-right → top-left, the head runs 0 → +1.36 and the tail −0.76 → +0.25.
  - Still modest: looking down, the brow settles less than it would alone, because a present visitor's interest holds it up ~0.3 mm.
  - **Signed off by the user, live (2026-10-28):** "the brow follows the eye well all the way now. Keep it as it is." The downward settle stays as it is.

## 3. The design: four layers

```
 cursor + eye + era                 senses       pointer speed, jerk (reversals/s), distance to the iris (R),
 (EyeStage, every frame)    ──►                  approach rate, dwell on the iris, time away, press/drag,
                                                 scrub rate (eras/s), cut, enter, gaze, saccade, glare, reading
                                       │
                                       ▼
                               appraisal → emotions    tonic (held by a condition, eased in and out)
                                                       phasic (an impulse: onset, apex, offset)
                                       │
                                       ▼
                               muscles (AUs)           AU1 AU2 AU4 AU6: each emotion is a recipe;
                                                       each muscle has its own rise and fall; gaze recruits
                                                       frontalis physiologically (not as emotion)
                                       │
                                       ▼
                               bone chain (5 nodes)    each AU is a shape over the nodes (mm);
                                                       nodes are masses on springs to their targets, coupled
                                                       to their neighbours (bending) and held apart by bones
                                                       (length); shape travels head → tail
                                       │
                                       ▼
                               GPU (brow-net.ts)       per node: dx, dy, bone rotation, bulge (z) + tangents;
                                                       Hermite along the curve, not Gaussian smear
```

All of it is CPU (`rig/brow.ts`, pure TS, unit-tested), except the last step. The graph never changes at runtime: ten vec4 uniforms.

### 3.1 The nodes and the bones

- Five nodes on the hair curve (`BROW_SHAPE`), at u = 0, 0.22, 0.42, 0.70, 1: **head, inner, arch, outer, tail**.
- Four bones join them. Each bone keeps roughly its length (a soft constraint, stiffness 0.25 per step). When the arch rises, the head and outer nodes draw in a little toward it, as skin over a lifted muscle does. The head is anchored more strongly (the procerus and nasal attachment).
- **Bending stiffness** (a Laplacian on the offsets) means a raised node lifts its neighbours a little and sharp kinks smooth out: the brow is one connected structure, not five decals.
- **Each node is a damped spring** to its target: head 3.4 Hz, then 3.2, 3.0, 2.8, tail 2.5 Hz, ζ 0.68 (about 5 % overshoot). The tail's looser tissue lags, so a new shape travels from head to tail by itself.
- Out per node: `dx, dy` (mm), `rot` (each bone's change of angle, averaged at the node; it shears the hairs, so a dropping tail tilts them) and `bulge` (z, mm: the corrugator bunching the head toward the camera).

### 3.2 The muscles → node shapes (mm at activation 1)

| AU | head | inner | arch | outer | tail | also |
|---|---|---|---|---|---|---|
| AU1 inner raiser, dy | 1.50 | 1.30 | 0.80 | 0.30 | 0.05 | |
| AU2 outer raiser, dy | 0.15 | 0.45 | 1.15 | 1.45 | 0.90 | dx +0.1 / +0.2 at outer/tail |
| AU4 lowerer, dy | −1.10 | −0.85 | −0.40 | −0.12 | 0 | dx −0.90 / −0.55 / −0.20 (toward the nose); bulge 0.35 / 0.20 / 0.05 |
| AU6 orbicularis, dy | 0 | −0.05 | −0.20 | −0.45 | −0.70 | dx −0.10 / −0.20 at outer/tail |

**Muscle timing** (first-order, rise fast, fall slow): AU1/AU2 rise λ 25, fall λ 5; AU4 rise λ 18, fall λ 4; AU6 rise λ 22, fall λ 4. A rise of λ 25 is τ 40 ms, about the electromechanical delay; the phasic envelopes set the visible onset.

**Above 1, an AU saturates** (`1 + e/(1+e)`, at most 2), so stacked emotions never tear the brow off the face.

### 3.3 Physiology (not emotion): gaze, squint, blink

- **Looking up recruits frontalis:** AU1 += 0.25·up, AU2 += 0.30·up, with `up = smoothstep(0.2, 1, gaze.y)` (only past ~2°, as in life).
- **Looking down, the brow settles:** dy −0.10, −0.06, −0.04, −0.20, −0.40 × down.
- **Looking to the temple:** dy −0.10, 0.02, 0.14, 0.30, 0.50 × side. **To the nose:** the head −0.36 mm and 0.50 mm in.
- These gaze shapes **wait out a saccade** (120 ms above 3°, 30 ms after a microsaccade), then follow the gaze at λ 5.5 (λ 3.4 while pursuing). *Why:* a brow that moves during the saccade looks attached to the eyeball.
- **Squint** drops the tail −0.58 mm × squint; **a blink nods the tail** −0.18 × blink. Both go straight onto the nodes, outside the springs: orbicularis is fast and the lids own it.

## 4. The grammar: what the visitor does → what the face feels

Desktop pointer unless noted. R = the iris radius on screen. "Peak" is in the emotion's own units (its recipe below scales it).

| # | What the visitor does | Sensed as | Emotion | Kind and timing | What the brow does |
|---|---|---|---|---|---|
| 1 | Comes back after ≥ 6 s away, or the eye first opens | a move after a long gap; `ready` + 1.2 s | **greet** | phasic: onset 0.10 s, apex 0.20, offset 0.40; peak 1; 4 s cooldown | the eyebrow flash: both parts up ~1.4 mm, then down |
| 2 | Moves again after a 2.5–6 s pause | a move after a short gap | **notice** (greet × 0.45) | phasic, the same envelope | a small flash ~0.6 mm |
| 3 | Moves around the page, calmly | present, speed < 6 R/s | **interest** | tonic, cmd 0.25 + 0.45 × proximity (1 → 4 R), up λ 2.5, down λ 1.2 | a slight even lift (~0.3–0.6 mm) that grows as the pointer nears the eye |
| 4 | Darts toward the eye | approach rate > 7 R/s inside 2 R, aimed: its course passes within 0.6 R of the eye's middle | **surprise** | phasic: onset 0.08, apex 0.15, offset 0.45; peak 0.7; 3 s cooldown | a quick startle lift (~1.6 mm) |
| 5 | Hovers on the iris, 0.5–3.5 s | dwell on the iris | **curious** ("hm?") | tonic, ramps with dwell, up λ 1.6, down λ 1.4 | the outer brow lifts, the head knits a little: the quizzical arch |
| 6 | Lingers near the eye, slowly (1–2.5 R, < 0.6 R/s, > 0.8 s) | hesitation | **curious** × 0.8 | tonic | the same, smaller |
| 7 | Rests on the iris > 3 s, nearly still | long dwell, low speed | **warm** (fond) | tonic, up λ 0.7, down λ 1.0; curious fades as warm rises | the tail softens down (orbicularis), the lift relaxes: smiling eyes |
| 8 | Presses on the iris | press edge on the iris (touch: after 100 ms, not a drag) | **flinch** (the eye is touched) | phasic: onset 0.06, apex 0.10, offset 0.28; peak 1 | the head snaps down and in, the tail drops: a wince |
| 9 | Holds the press | still down on the iris, not dragging | **brace** (focus × 0.6) | tonic | stays knit, a little lowered |
| 10 | Releases on the iris → enters | `exiting` edge | **delight** | phasic: onset 0.12, apex 0.6, offset 0.6; peak 1 | the biggest lift (~2.5 mm), with smiling eyes, held through the dive |
| 11 | Releases off the iris, or drags away (cancel) | release without enter after a press | **relief** | phasic: onset 0.15, apex 0.1, offset 0.6; peak 1 | a soft lift, then the brow settles (the springs' overshoot is the exhale) |
| 12 | Scribbles: fast, back and forth | reversals > 1.5/s at > 2 R/s | **confused** | tonic, cmd smoothstep(1.5, 4, reversals/s), up λ 2, down λ 0.7 (it lingers) | inner up and knit together: the puzzled, oblique brow |
| 13 | Scrubs eras slowly (< 1.2 eras/s) | travel moving slowly | **focus** × 0.35 | tonic | a light concentration knit |
| 14 | Scrubs eras fast (> 1.2 eras/s) | scrub rate | **strain** (overwhelmed) | tonic, cmd smoothstep(1.2, 3, eras/s), up λ 3, down λ 1.5 | inner up, head knit hard: worry |
| 15 | Stops a fast scrub | strain falls from > 0.4 to < 0.15 | **relief** | phasic | as 11 |
| 16 | A new era arrives (after the cut's blink) | the cut ends | **notice** × 0.8 | phasic | "oh — new": a small lift as the lids open |
| 17 | Leaves the window after engaging | pointer out of the window, with interest > 0.3 or a hover in the last 5 s | **wistful** | phasic: onset 0.3, apex 0.6, offset 1.2; peak 0.8 | inner up, a little knit: a faint "oh, leaving?" |
| 18 | Reads (era script) / a white page glares | `reading`, glare | **focus** | tonic: 0.3 · reading + 0.6 · glare | the concentration knit (today's frown, now as a muscle) |
| 19 | Touch: finger arrives / swipes / taps the iris | touch down, travel, press on the iris | greet, focus/strain, flinch → delight | as above | same grammar; no hover states (phones have no hover) |

### 4.1 The recipes (emotion → muscles at peak 1)

| Emotion | AU1 | AU2 | AU4 | AU6 |
|---|---|---|---|---|
| greet / notice | 0.90 | 1.00 | | |
| interest | 0.30 | 0.35 | | |
| curious | 0.05 | 0.75 | 0.25 | |
| warm | 0.10 | 0.05 | | 0.55 |
| surprise | 1.20 | 1.25 | | |
| delight | 1.30 | 1.35 | | 0.25 |
| confused | 0.55 | 0.15 | 0.70 | |
| focus | | | 0.55 | 0.15 |
| strain | 0.50 | | 0.85 | |
| flinch | | | 1.00 | 0.90 |
| relief | 0.25 | 0.20 | | |
| wistful | 0.70 | | 0.40 | |

Sums are added per muscle, then saturated (§3.2). **A phasic emotion over 0.5 halves the tonic ones while it plays** (a flash replaces the gaze shape, as now), so impulses read cleanly.

### 4.2 The reference sheet (the user's, 2026-10-28): the brow never acts alone

Read row by row, as an anatomist, an expression artist and an eye-movement researcher. **Half of every expression is the lids, the lower lid and the skin's folds.** A brow moving over unchanged lids reads as a mask.

| Row | What the face does | Muscles | Ours (feeling ← what the visitor does) |
|---|---|---|---|
| 1 neutral | relaxed brow, lids at rest | — | rest |
| 2 surprise | brows high and *more curved*; upper lid lifted off the iris (white above it); forehead furrows | AU1 + AU2 + AU5 | surprise ← a dart; greet (smaller) ← coming back; delight ← going in |
| 3 anger | inner brow pulled down **and in**, outer brow left up (a V); vertical folds between the brows; hood pressed on the lid; lids tight | AU4 (+ AU2 lateral) + AU7 | annoyed ← three pokes that never go in, or a scribble that goes on |
| 4 fear / worry | inner brow up *while* drawn together (wavy brow); eyes wide | AU1 + AU2 + AU4 + AU5 | wary ← a third dart, or a dart soon after a wince |
| 5 sly | upper lids half lowered, brow flat, outer a touch up | AU43 + AU7 (+ AU2) | skeptical ← slipping on and off the iris three times without pressing |
| 6 bored | heavy lids, brow lifting a little to hold them up | AU43 + AU1/AU2 (compensation) | bored ← 25 s of nothing (gentle: the eye must never read as sleepy at rest) |
| 7 focus | brow a little low, lower lid raised | AU4 + AU7 | focus ← reading, glare, a slow scrub, braced for a poke |
| 8 fury / wince | brow crushed down, bulge and folds between the brows, lids to slits, cheek up | AU4 + AU6 + AU7 | flinch ← a press on the iris |
| 9 intense | wide eyes under a lowered brow | AU4 + AU5 | intense ← a press held on the iris |

### 4.3 Memory: the face remembers the last few seconds
A face's response depends on what just happened, not only on the stimulus:
- **Habituation:** a repeated startle is met at 0.6 of the last within 10 s, and the third turns **wary** (fear's brow, eyes wide).
- **Escalation:** three pokes within 6 s that never go in turn to **annoyance**; a scribble that keeps puzzling for 2.5–4 s turns from confusion to annoyance.
- **Learned anticipation:** after a poke, a cursor coming back toward the iris is braced for (focus with tight lids), fading over ~12 s.
- **Scepticism:** slipping onto the iris three times within 8 s without pressing.
- **Boredom:** 25 s with nothing moving (idle time starts when the eye can be reached, never behind the opening); any move lifts it at once.

### 4.4 The motor program and the eye
A face moves in synergies, not muscle by muscle. Each impulse fires its muscles in its own order:
- a **wince** tightens the lids (the blink reflex) before the brow lands, ~50 ms;
- **surprise** snaps the lids wide, with the brows 30–50 ms behind;
- **delight's** smiling eyes (AU6) arrive ~180 ms after the lift (Duchenne).

The eye takes part:
- natural blinks are held through a startle, a stare or annoyance, and **one blink follows** as a startle lets go;
- the pupil opens with arousal (a startle, delight, a stare, annoyance, interest), through the pupil rig's own latency (`rig/pupil.ts` `arousal`).

### 4.5 Calm, reduced motion, phones
- **Reduced motion:** no brow motion at all; the nodes rest at 0 (rule unchanged).
- **Calm (`pointer: coarse`):** everything × 0.75; no confused (a finger's drag is a scrub); no notice on short pauses.
- **Rate caps:** phasic emotions at most one every 0.8 s each (cooldowns above); a greeting at most every 4 s; "notice" never during a cut.

## 5. The skin answers (B2, built 2026-10-28)
Skin is not painted with wrinkles. It folds where it is squeezed. The lid mesh's vertex stage already evaluates each vertex's neighbours (for its normal). It now also compares their spacing with where the move-net found them, and passes that **tension** (along the margin, out from it; 1 at rest, < 1 squeezed) to the fragment. The technique is the tension or wrinkle map of production face rigs.
1. **The forehead follows:** over the brow, the move keeps 100 % → 80 % across 0–9 mm, then fades by 16 mm.
2. **The hood rolls:** a lowered brow pushes the skin under it together; it rolls forward (z, 0.45 × the drop, ~2.2 mm under the brow) with a crease beneath it, both only where it's squeezed. A lift stretches the hood: thinner skin, a touch lighter. The pad roll still reads the arch's lift.
3. **The glabella folds:** the corrugator drawing the head in squeezes the skin between the brows along the margin; two or three slanted vertical folds rise there. AU4's bulge pushes the head forward (z), so the normals shade the mound.
4. **Crow's feet deepen with AU6 and AU7,** through the squint they now drive.
5. **Frontalis furrows (built with the headroom decision):** the forehead is anchored at the hairline and follows the brow less and less toward it (1 → 0.15 over 22 mm, then 0 by 30), so a lift squeezes it evenly. It furrows where squeezed: troughs with lit crests ~8 mm apart from ~7 mm over the brow, broken, strongest over the middle, faint on Monk 9 skin. They show on phones and narrow windows. At 1440×900 the first furrow falls just above the frame, which shows ~3 mm of forehead at rest.
6. Each fold is a dark trough with a lit crest, capped at ×0.72 dark and ×1.1 light (never black, never a stroke), and laid on the skin's rest coordinates so it rides the skin.

## 6. The lids answer (B3, built 2026-10-28)
No new margin maths. The lid muscles move the uniforms the margins already read (`lids.upper`, `lids.squint`), so the shader, the CPU twin (`twin/margins.ts`) and the media's masks all follow at once (C4):
- **AU5** lifts the upper margin up to 0.17 rad (~2.2 mm at the apex, so a band of white shows over the iris, which the lid normally covers by 1.6 mm);
- **AU43** lowers it up to 0.19 rad;
- **AU7 and AU6** add to the glare's squint (0.9 × AU7 + 0.35 × AU6), which narrows both lids and lifts the lower one. AU7 also brings the upper lid down 0.08 rad, and AU7 and AU6 raise the lower lid (`lids.lower` × 1 − 0.3 AU7 − 0.2 AU6, floored at 0.45), so a wince reaches the reference's slits;
- the upper margin never drops below 0.35 of its rest elevation, and the margins' own guard keeps it over the lower one. A test sweeps the extremes × squint × gaze × blink.

## 7. Era moods (B4: data, as ERA_GAZE is)

**Batch 1 built 2026-10-28 (1970, 1981, 1991), awaiting the user's look.**
- `look.ts ERA_BROW`, read as `look.browMood`, held under whatever the visitor brings (`max` with each tonic feeling).
- Behind a cut's shut lids the moods settle 4× faster, so a new era opens already wearing its own.
- The generic "reading knits the brow" moved into the moods.
- Built, at rest, mood on against off (1440×900):
  - **1970 `{ focus: 0.35 }`:** "the night operator". The head knits 0.19 mm down and in, and the lids narrow a touch.
  - **1981 `{ curious: 0.3 }`:** "the first mouse". The outer brow is up 0.27 mm, the head flat, over the era's squint.
  - **1991 `{ interest: 0.3, focus: 0.15 }`:** "the first web page". The whole brow is up 0.07–0.15 mm; live, its white page's glare knit sits under it.
- Tests: each mood shows (> 0.08 mm) yet stays subtle (< 0.5 mm, lids < 0.03 rad); the three differ as described; a surprise plays over a mood and the mood comes back; a new era's mood is in place before the cut's lids open; reduced motion stays still.
- Boredom was softened in the same change (AU43 0.55 → 0.3, from 30–40 s idle instead of 25–32). Measured, it had dropped the upper lid ~1.4 mm, which read as sleepy.

**Batch 1 signed off by the user (2026-10-28). Batch 2 built 2026-10-28 (1995, 1997, 2000), awaiting their look.**
- A mood is now `{ hold, flick }`:
  - `hold`: the tonic feelings the era's task holds;
  - `flick`: an optional idle flick of the brow on a gaze jump, at most every `every` s, never while a feeling plays, never on a phone, never in the lab's clean poses.
- **1995 `{ hold: { interest: 0.3 }, flick: { every: 7, peak: 0.25 } }`:** "everything blinks". The whole brow is up 0.15–0.19 mm. As the eyes jump to something blinking, the brow flicks (measured ~every 8 s, a ~0.4 mm lift over the rest).
- **1997 `{ hold: { skeptical: 0.2, focus: 0.1 } }`:** "the dot-com office, weighing up portals". The head is 0.10 mm down and in, the outer brow up 0.07, the lids ~0.3 mm lower: an appraising look.
- **2000 `{ hold: { focus: 0.25, intense: 0.2 } }`:** "the locked stare at the search box". The head is 0.30 mm down and 0.21 in while the lids open a touch: a stare, not 1970's narrowing.
- Tests: the subtlety rules hold for all six eras; batch 2's three differ as described; 1995's flick fires on gaze jumps, ≥ 0.85 × 7 s apart, never with calm or the moods off, and stays under 1 mm.

**Batch 2 signed off by the user (2026-10-28). Batch 3 built 2026-10-28 (2003, 2009, 2013), awaiting their look.**
- A mood may now also hold feelings only while the eyes are up at the lens (`atLens`, weighted by the brow's own heard gaze: smoothstep(0.28, 0.42, gaze y)).
- The lab's quiet mode keeps the gaze, so a held gaze shows that pose.
- **2003 `{ hold: { warm: 0.2, interest: 0.15 } }`:** "a video call". The inner brow is up 0.10 mm, the tail softens 0.05, the lower lid lifts a hair: warmth with attention.
- **2009 `{ flick: { every: 10, peak: 0.2 } }`:** "absorbed in the feed, the phone held low". Nothing is held; the head-down posture is its own. A ~0.18 mm flick comes as the feed jumps back to a new post (measured ~10.7 s apart).
- **2013 `{ atLens: { interest: 0.5, warm: 0.15 } }`:** "the selfie". Up at the lens the brow lifts 0.27–0.31 mm over what looking up does alone, with a hint of smile; back at the screen it relaxes (0 mm).
- Tests: 2003's tail sits under its arch; 2009 holds nothing and flicks 2–4 times in 40 s, gentler than 1995; 2013 lifts at the lens and is still at the screen.
- **Harness trap:** the other session's edit to `uniforms.ts` hot-reloaded the lab mid-run, which rebuilt the stage and switched the quiet mode back off, so 2009's glare knit leaked into its "after". The received mood is now on `browInfo().mood`, to check what the rig was given.

**Then the user made the eye's movement the brow's main driver (§2b). 2026 built 2026-10-28 on top of it, awaiting their look.** "Eye contact, it mirrors you". A mood may now also have:
- `atContact`: feelings held only while the eyes meet the visitor's. That is the brow's heard gaze inside the cone of direct gaze: felt as looking at you within ~4°, gone by 8° (Gamer & Hecht 2007), over 24° of yaw and 10° of pitch. On a desktop that means the cursor on or near the iris, or no cursor at all.
- `meet`: meeting the visitor's eyes again flashes the brow, the eyebrow flash on catching someone's eye (Eibl-Eibesfeldt). It fires once the eye has been away ≥ 1 s and has landed in contact for 0.25 s, measured on the eye's own gaze, not the pointer's. A sweep across the iris is not a meeting. At most every `every` s, never while a feeling plays, never on a phone or a poster.
- `mirror`: how strongly the face answers what the visitor does. It scales the feelings the grammar commands, the impulses it fires and the scepticism and annoyance swells. It does not scale the screen's glare knit, boredom, the moods, or the gaze's own shape.
- **2026 `{ atContact: { interest: 0.3 }, meet: { every: 12, peak: 0.3 }, mirror: 1.2 }`**, measured in the lab at 1440×900 in its own way of seeing:
  - looking at you, the brow is up 0.15 / 0.16 / 0.19 / 0.16 / 0.08 mm and the lids open 0.008 rad: attentive and open;
  - held looking away (up, temple), the mood adds nothing (0.10 … 0.57 mm, the same as with it off: the gaze's own shape);
  - the cursor gliding onto the iris: the eye meets you 0.7–1.1 s into the glide, and the flash starts ~0.25 s after it lands. The head lifts 0.37 → 0.79 mm, the arch 0.81 → 0.98, and it is back down in ~0.7 s. Then the hover's curiosity (× 1.2) takes over.
- Why `every: 12`, not the first 6: a cursor at rest for 2.2 s is let go (`POINTER_HOLD`), and the 2026 eye comes back to the visitor on its own. Every pause would have been a meeting, and a flash at each one a tic.
- Tests: the contact lift shows, stays subtle, and is gone looking away; the flash comes 0.2–0.5 s after the eye lands and stays well under a greeting (0.3–0.9 mm at the arch). No flash on a sweep, a glance away under 1 s, a phone, a poster or with the moods off; none closer than 12 s. A press winces 1.2 × as hard in 2026 as in 2009, while the glare's knit is the same. The fold sweep adds three × 1.2 extremes.
- **Harness note:** a screenshot takes longer than the flash lasts (~0.4 s), so the proof shoots the same meeting twice, 14 s apart: the landing from the first, the flash from the second. Every lab state is re-asserted before each measurement, because the other session's edits keep hot-reloading the lab.

The plan as first written:
The person is the same in every era (C1). What changes is the task, and a task brings its own expression, as it brings its own gaze. That's data in `look.ts` (`ERA_BROW`): a tonic baseline and an idle micro-expression rate, inside the calm caps (≤ 1 per 6 s, local, slow).

| Era | Task | Baseline | Idle |
|---|---|---|---|
| 1970 | reading a terminal | focus 0.25 | none |
| 1981 | pointing at icons | interest 0.15 | none |
| 1991 | reading a page | focus 0.20 | none |
| 1995 | a busy page | interest 0.30 | notice 0.25 every ~7 s (something blinked) |
| 1997 | nav ↔ content | focus 0.15 | none |
| 2000 | locked on the search box | focus 0.35 | none (the longest stare) |
| 2003 | a video chat | warm 0.20 | greet 0.4 when the pointer arrives (a face on a call) |
| 2009 | a phone held low | none | none |
| 2013 | a selfie | AU1+2 0.35 when looking at the lens (target a), relaxing at the screen | none |
| 2026 | eye contact | interest 0.10; grammar gain × 1.2 (it mirrors you best) | none |

## 8. Media and landmarks (B5, built and checked 2026-10-28)
- **C4, 2026's brow landmarks** (marks 8, 9, 10: inner, arch, tail) now sit where the brow really is. Each is the brow's midline at its mark's x, moved by that frame's bone chain through the move-net's CPU twin, then projected (`EyeStage`, `measured-marks.ts brow`). The fixed offsets stay as the fallback. At rest they land where the offsets were (1.70 / 1.76 / 1.60 R against 1.72 / 1.86 / 1.64); in surprise they rise, in anger and the wince they fall (the readouts move with them). This closes drift item 7 in `EYE_REALISM_PLAN.md` for the brow; the crease and under-eye marks are still fixed.
- **All ten media:** rest, surprise, annoyed and the wince, shot at 1440×900 in every era's way of seeing. Each era carries each expression. 1981's 1-bit ink shows no speckle from the folds (the dither under a frown is the rest dither), and 1970's rows and 1991's four greys show the hood's roll and crease.
- **Cost** (A/B in one page, the lab's `browOn` gate; Radeon 610M):
  - before optimising, the brow cost 2.07 ms of the scene pass while a feeling was held: the folds ~2.5 and the move-net ~0.8, median of 8 pairs;
  - now the folds run only where the skin's tension differs from rest, each fold only where its mask is non-zero, with the brow curve per vertex. The move-net skips skin it can't reach;
  - result: **~0.8 ms while a feeling is held** (median of 16 pairs) and **~0.1 ms at rest** (median 0.12, mean 0.06, 12 pairs). The rest cost is inside the 0.2 ms budget; a held feeling is over it, but only for its moment.
- **The real loader:**
  - desktop: a press winces at once, and release goes in (1970's enter);
  - phone: the wince shows after the finger's 100 ms delay, and release goes in (1991's window).
- **Found and fixed on the way:** the era-arrival "notice" fired on any fall of the cut director's busy flag, which also flickers for a sign's press, so the brow greeted the visitor ~1 s after every poke. It now needs the era to have changed (rig input `era`), with a test.

## 9. Phases

| Phase | What | Files | Done when |
|---|---|---|---|
| **B1** | Rig (senses, emotions, muscles, bone chain) + Hermite shader + EyeStage wiring + lab hooks + unit tests | `rig/brow.ts` (new), `nodes/brow-net.ts`, `uniforms.ts` (browNodes), `nodes/lid-mesh.ts` (z bulge), `EyeStage.tsx` (brow block, pointer-out), `src/lab/eye/EyeLab.tsx` (Brow section), `twin/brow-rig.test.ts` | each action in §4 has a filmstrip showing its shape; no zoom; tests pass; tsc clean |
| B2 | The skin answers (§5) | `nodes/lid-mesh.ts`, `nodes/brow-net.ts` | 2× crops before/after for lift, frown, warm |
| B3 | The lids answer (§6) | `twin/margins.ts`, `nodes/margins.ts`, EyeStage | after R6 lands; margins test + alignment overlay |
| B4 | Era moods (§7) | `look.ts`, `rig/brow.ts` | ten eras at rest, plus one action each |
| B5 | Media + 2026 landmarks (§8) | `post/measured-marks.ts` | all ten media at rest and mid-expression |
| B6 | Skills and docs | eye-anatomy, eye-motion, eye-interaction, motion-numbers | skills say what's built |

**Budget:** the move-net runs four times a vertex (the point and three neighbours, for the normal). Hermite over four segments, against five Gaussians today: about the same. The lid pass must stay within ±0.2 ms (A/B in one page).

## 9b. Never broken (tests)
- `twin/brow-net.ts` is the move-net on the CPU (the same sums as `nodes/brow-net.ts`). `twin/brow-net.test.ts` holds every feeling at full, plus five extreme combinations (annoyed + flinch, wary + surprise, delight + confused, a wince looking down to the nose with a squint, surprise looking up to the temple). It also runs three at 1.2 × for 2026's mirror (annoyed + flinch looking down to the nose with a squint; wary + surprise looking up to the temple; delight looking up to the nose). It sweeps the face at 0.5 mm, with the lid guard, and asserts the skin's area change stays in 0.35–2.5. A fold is ≤ 0. Measured: the worst squeeze is 0.41 (the wince looking down: the hood rolls), the worst stretch 2.41 (the hood under a surprised lift).
- `twin/brow-rig.test.ts`: the lids never cross at the lid muscles' extremes; a wide eye still closes to a seam; nodes keep their order; no NaN on a zero or huge frame; reduced motion holds everything still.

## 10. Verification (each phase)
- **Action scripts over CDP** (desktop 1440×900): arrive after 7 s; approach slowly; dart in; hover 0 → 5 s; press (180 and 680 ms); release to enter; cancel; scribble 2 s; scrub fast and stop; leave the window. Each a filmstrip, every 60 ms through the expression, with a 2× crop of the brow.
- **Lab:** the Brow section plays any emotion on demand and holds the AUs; "Show nodes" draws the chain (nodes and bones) over the face, so the bone motion can be seen.
- Ten eras at rest + surprise; the phone; WebGL2; reduced motion (no motion).
- 1970 at rest: pixel-diff against the signed-off look, the brow masked out; nothing else may change.

## 11. Open decisions for the user
1. **How expressive?** Default ~15–30 % of max (surprise ~2.5 mm). Subtler (×0.6) or bolder (×1.4) is one constant (`BROW_GAIN`).
2. **Press = flinch** (the eye is being touched) is the default. The alternative is anticipation (a lift).
3. **Wistful on leave:** keep it faint, or drop it if it reads as guilt-tripping.
4. **Era moods (B4):** yes or no; they stay subtle and are data only.
5. **Headroom: decided 2026-10-28, `FRAME_BOX.top` 12 → 15 mm** (the user's call). At 1440×900 a full surprise lift now stays 23 px inside the frame (before, the brow's top was 98 px above it). The shot is ~12 % wider and the eye sits ~2.5 mm under the middle (was ~1). The phone box is unchanged: it frames by width and already shows the forehead.
   - **Recaptured 2026-10-28 (framing approved):** all 20 era posters (wide and tall) through the lab's `__eyeCapture()`, and the shut-1970 stills, which were also fixed for a ~10 px scrollbar-gutter offset the opening lab had always captured with.
   - **Hand-off measured on the real loader:** the still drawn where the tube draws it fits the live shut eye as placed, ×1.00 and 0, 0 px on desktop (1440×900) and phone (390×844). The old stills would have jumped ×0.87 and 44 px. No late path in either run.
   - The posters bake the live eye as it is now, including the other session's in-progress R2 iris work; recapture again when R2 lands.

## Drift log
| What | Spec | Built | Why |
|---|---|---|---|
| AU1 / AU2 shapes | AU1 1.5, 1.3, 0.8, 0.3, 0.05; AU2 0.15, 0.45, 1.15, 1.45, 0.9 | AU1 1.5, 1.35, 0.75, 0.25, 0; AU2 0.1, 0.4, 1.2, 1.4, 0.6 | with the spec numbers, a greeting or surprise lifted all five nodes about equally: a slide, not a face. The arch now rises most, so a raised brow curves more |
| AU1 + AU4 | added | AU4's lowering of the head and inner node is cut by 0.6 × AU1 | summed, AU4 cancelled AU1 at the head, and "confused" lost its oblique inner lift (FACS AU1+4: inner up while drawn together) |
| Bending | 0.35 × ω² | 0.2 × ω² | 0.35 smeared the shapes back toward one arch |
| Recipes | confused AU1 0.55; warm AU6 0.55 | confused AU1 0.8; warm AU6 0.7 | read too faint in the filmstrips |
| Hesitation band | 1–2.5 R | 1–1.5 R | the desktop iris is ~245 px across a 1440 screen, so 2.5 R is most of the screen: a parked pointer read as hesitating |
| Arrival | any move after a gap | only a move that goes > 0.08 R, never on a press | a press reports a move in place, so pressing after a still rest greeted instead of wincing |
| Greeting vs notice | greet after ≥ 6 s away; notice (× 0.45) after 2.5–6 s | greet on first sight, back into the window, or ≥ 12 s idle; notice (× 0.35, 6 s apart) after 4–12 s | a hand resting still on the mouse isn't away: the filmstrips greeted again after every 6 s pause |
| Shelf under a lowered brow | fade 3.6 mm below the brow, 3.2 mm past the head | 5 mm below, 7 mm toward the nose; the hood's skin rolls forward (z, 0.45 × the drop); the lid's own skin (≤ 4 mm from the margin) never moves | a wince squashed the hood into a hard horizontal shelf with a corner at the head |
| Dart | approach > 7 R/s | also needs < 1 reversal/s | a scribble crossing the eye fired the startle |
| Dart, aimed (2026-10-28) | inside 3.5 R | inside 2 R, and the course passes within 0.6 R of the eye's middle | recorded live at 60 Hz (a real cursor gliding between spots, 250 ms minimum-jerk): with the iris 216 px across its radius at 1440×900, 3.5 R was ~760 px, nearly the whole screen, so most ordinary moves toward the middle startled the brow (+1.9–2.3 mm, then ~1 s to settle) and the third turned wary. Now only a move aimed at the eye flashes it; every other move steps the brow into that gaze's shape in ~0.3 s. Test: a brisk pass 1.5 R off the eye's middle does not startle |
| Forehead follow | B2 | built in B1 (same function) | the move-net's mask was being rewritten anyway |
| Lids | B3 waits for R6 (a widen term in the margins) | built now through `lids.upper` and `lids.squint`, which the margins already read | no new margin maths was needed, so the twin, the shader and the media's masks follow for free; R6 is untouched |
| Muscles | four (AU1, AU2, AU4, AU6) | seven (+ AU5, AU7, AU43) and five new feelings (annoyed, wary, skeptical, bored, intense) | the reference sheet: half of each expression is the lids |
| Memory | none | habituation, escalation, learned anticipation, scepticism, boredom (§4.3) | a face's answer depends on what just happened |
| Forehead furrows | B2 item 4 | not built | out of frame at the wide box (§5.5) |
| The wince's lids | AU7 through the squint only | also brings the upper lid down 0.08 rad and the lower lid up (× 1 − 0.3 AU7 − 0.2 AU6, floored at 0.45) | the squint closes only ~25 %; the reference's fury row is slits. A test keeps the wince under half the rest opening but over 1 mm |
| Scepticism | any third entry onto the iris | only slow entries (< 3 R/s, no scribble) | a scribble or repeated darts crossing the iris read as scepticism |
| Cost | ±0.2 ms | ~0.1 ms at rest, ~0.8 ms while a feeling is held | the folds' maths ran on every lid pixel (2.5 ms) until gated by tension and mask |
| Era notice | on the cut's end | on an era change, once the cut has ended | the cut director's busy flag also flickers for a sign's press |
| Reading's knit | 0.3 × reading, for any era reading | the era's mood (1970 focus 0.35; 1991 focus 0.15 under interest 0.3) | a task's expression is the era's data, not a gaze-pattern rule |
| Boredom | AU43 0.55, 25–32 s | AU43 0.3, 30–40 s | measured at full it dropped the lid ~1.4 mm: sleepy |
| 1981, 1991 moods | interest 0.15; focus 0.20 | curious 0.3; interest 0.3 + focus 0.15 | 1981's own signature is curiosity at pointing; 1991 already squints and knits from its page's glare, so its mood is the wonder lifting over it |
| 1995 idle | notice 0.25 every ~7 s | a flick (a greeting's shape at 0.25) on a gaze jump, ≥ 0.85 × 7 s apart, not on phones | tied to the eyes jumping, so it reads as "something blinked", not a timer; it doesn't hold back the visitor's own greeting |
| 1997, 2000 moods | focus 0.15; focus 0.35 | sceptical 0.2 + focus 0.1; focus 0.25 + intense 0.2 | 2000 at focus alone would have read as 1970 again; the held-open stare is its own. 1997's appraising look sets it apart from 1970's concentration |
| Gaze response | the shape × how far the eye has turned | `gazeReach`: 0.04 dead zone, then 1 − e^(−2.6 x), normalised; follow λ 8 (was 5.5); temple and nose shapes stronger | linear, an ordinary look moved the brow a few px: it seemed to answer only at the screen's edges |
| Hovering, hesitating | under 0.6 R/s | under 0.3 R/s | a slow pass across the eye read as hovering, and curiosity hid the gaze in the middle of the screen |
| Iris entries (scepticism) | every entry | only after ≥ 0.4 s off the iris | the iris's edge flickers under a cursor riding it |
| Saccade signal | the gaze rig's `busy` | `gazeRig.saccading` (phase "saccade" only) | `busy` is also true through pursuit: with a cursor there the brow never heard the gaze, live. The quiet-mode proofs force saccading off, so they never showed it |
| 2026 mood | interest 0.10 held; grammar gain × 1.2 | interest 0.3 held only in eye contact (`atContact`); an eyebrow flash (0.3) on meeting the visitor's eyes again (`meet`, ≥ 12 s apart); `mirror` 1.2 on what the visitor brings, not on glare or boredom | built after the user made the eye the main driver (§2b), so eye contact is read off the eye's own gaze. At 0.10 the lift is ~0.05 mm, under what a mood must show (0.08). "Grammar gain" became the mirror, which leaves the face's own states alone |
| Headroom | not in spec | `FRAME_BOX.top` 15 mm (§11.5) | at 12, a lift ran off a wide screen |
| Forehead | 100 % → 80 % over 9 mm, gone by 16 | 1 → 0.15 over 22 mm, gone by 30 | anchored at the hairline, so a lift squeezes it evenly and it can furrow; the fold sweep still passes | at the wide box (top 12 mm) the brow's top edge sits on the frame's edge, so lifts over ~1 mm crop it |
