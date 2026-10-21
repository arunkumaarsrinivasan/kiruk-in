---
name: eye-interaction
description: "The loader eye's interaction grammar: the five moments (rest, hover, press, release-enter, cancel), each era's sign in the pupil, pointer vs touch, the visitor measured back, what may move at rest, phones, the ghost-finger demo and the no-permission rule. Use when adding or changing a sign, hover/press/enter feedback, tap targets, cursors, touch behaviour or anything that reacts to the visitor. Triggers on: interaction, sign, hover, press, tap, click, enter, cursor, pointer, touch, phone, mobile, ghost finger, tap target, reacts, listens, tracks, focus ring."
---

# Interaction: the eye answers in its era's grammar

## The five moments (every era has all five)

| Moment | When | Rule |
|---|---|---|
| **Rest** | always | a sign visible without hover (phones have no hover); it is the only thing besides the eye that moves, slowly |
| **Hover** | pointer over the iris, desktop | the era's "focus" verb |
| **Press** | pointer down on the iris | feedback the instant the pointer goes down (touch: after 100 ms) |
| **Release on the iris** | pointer up on it | enter; action happens on release, never on down |
| **Cancel** | release off the iris, or a drag past 6 px | no enter; a drag becomes a scrub (eye-era-cut) |

- **Hit test:**
  - press feedback (stage): mouse `toIris < 1.05R`; touch `max(1.3R, 28 px)`;
  - going in (loader): `max(56 px, R × (coarse ? 1.3 : 1))`, read from the live `irisAt()`.
- **Signs live in or on the iris and pupil** and never grow past the iris, except while pressing or entering.
- Signs are clipped by the lids (`almond`) and appear through the era's own dither.
- **No two eras share a sign.**

## Writing an era's sign (decision procedure)
1. **What did this era's interface use to say "this opens"?** A cursor (1970), an arrow and inverted selection (1981), an underlined link (1991), a visited-link colour and GIF sparkle (1995), a caret (2000), a component's focus and active states (2013), lock-on brackets (2026).
2. **Map the verbs.** Rest = the era's idle affordance. Hover = its focus or highlight. Press = its active or selected state. Enter = its "open" (a window draws, a selection expands, a flood to the home's colour).
3. **Make it physical in the medium.** Draw it in the medium's cells, palette and stroke weight, never as an overlay in another style.
4. **Make the pupil many parts, not one** (2013's keyboard of keys, not one button). *Why:* a single button read as a sticker.
5. **Reduced motion: steady, never gone.** The sign's clock keeps running, but the sign holds its "on" state.

| Era | Rest | Hover | Press | Enter |
|---|---|---|---|---|
| 1970 | block cursor blinking 1.05 Hz in the pupil | holds lit (line has focus) | struck key: a beam-drawn disc | — |
| 1981 | arrow parked on the pupil (when pointer away) | — | iris XOR-inverted | the selection opens out |
| 1991 | white underline on the lower lid, drawn once | blacks lift to 1/3 grey | invert | white window draws down |
| 1995 | GIF sparkle catchlight, 2 fps | blue link ring | red | visited purple, flood navy |
| 1997 | not built yet (batch 2) | | | |
| 2000 | caret blinks 5 s then holds (it XOR-inverts what it covers) | — | the caret thickens | — |
| 2003 | not built yet (batch 2) | | | |
| 2009 | not built yet | | | |
| 2013 | a focus runs round the limbus | limbus glow, the dial's sliders sweep, keys type | keyboard active, wave out | everything switches on |
| 2026 | brackets breathe ±2% | lock to the limbus, pupil mm shown | close on the pupil, capture into blocks | blocks run out, flood |

## The visitor, measured and answered
- `ptr` is the pointer in top-left UV, damped at λ 8; `ptrOn` means a mouse is present (a finger is not a cursor).
- `track` means a pointer or finger was seen within 20 s, including under reduced motion.
- **Near the pointer, things react:** parts lift and switch on (2013), landmarks are inspected (2026). A reaction is always a state the era really had (focus, active, selected), never a glow invented for the effect.
- `listen` (pointer and eye speed, up λ 6, down λ 1.2) drives certainty and ripples; it is 0 when still.
- Gaze follows the pointer (eye-motion); while dragging, `follow ≥ 0.6`.

## Phones
- The whole almond is in frame (brow and cheek included); there's no pushed-in iris crop.
- **Calm mode** comes from `(pointer: coarse)` only: grain ×0.45, gaze ×0.6, cut durations ×1.25.
- **Ghost finger** demo (phones only):
  - a 44 px fingertip dot drags two eras over 1.2 s with a sine ease, pauses 380 ms and comes back;
  - the peak is 2.6 eras/s, under the 3/s rush threshold, so the eye blinks at each era instead of shutting against the rush;
  - then it glides to the iris and taps with a ring;
  - first play 900 ms after the opening, replays after 8 s idle, at most 3 plays;
  - stopped by any touch, key or wheel; tap only if the visitor has already swiped. No words.
- **Touch scrub** is relative: one era per `clamp(innerWidth/7, 44, 64)` pt. *Why:* ten eras across a phone's width hide the target under the thumb.
- **Touch taps off the iris do nothing.** *Why:* half of them are a thumb finding the screen. Every label and line has a phone floor (2026's labels at 1.55% of H; minor callouts drop).
- Sizes follow the iris (`kc`), so a phone sees the same design at its own scale.

## The loader surface (desktop and keyboard)
- **Full-screen `role="slider"`** with `touch-action: none`, focused on mount. `aria-valuetext` is the era's name, read by screen readers with no visible word.
- **Mouse:** an absolute sweep with an 8% dead zone each side, so both ends are easy to reach. A click off the iris jumps to the year under the cursor.
- **A tap is ≤ 8 px and ≤ 520 ms.** Travel never starts on press. *Why:* a tap on the iris means "take me in", not "take me to this year".
- **Keyboard (on window):** →/↑ +1, ←/↓ −1, PageUp/PageDown ±3, Home/End; Enter/Space go in. Ignored with modifiers and in inputs.
- **Wheel: one gesture is one era, however hard it is pushed.**
  - A gesture is a run of deltas on the dominant axis with no gap longer than 450 ms, measured by the event's own `timeStamp`. *Why:* the cut keeps the main thread busy, and late-handled deltas would otherwise look like a pause.
  - It steps once its deltas reach 60; the rest of the gesture is spent. Anything within 900 ms of a step belongs to it. A reversal starts a new gesture.
  - *Why:* a banked wheel let a hard flick run to the last era, and visitors got lost.
- **Cursor over the iris** is the era's own (`cssCursor`): the Star arrow for 1981, `pointer` for 1995/2003/2009, `text` for 2000. It is set inline, because a global rule forces the arrow.

## Never
- Never sound, and never a microphone, even for a voice era.
- Never a permission prompt. Use device tilt only where no dialog is needed (Android). On iOS keep finger gaze. *Why:* a dialog at the front door makes people leave.
- Never a hint of the neighbouring era, an arrow, an edge band or a label at rest.
- Never action on pointer-down.
- Never a hover-only sign.
- On the real loader, Enter and Space are guarded for 0.9 s after the opening and 1.5 s after typing. *Why:* typing through the hand-off used to enter the site.
