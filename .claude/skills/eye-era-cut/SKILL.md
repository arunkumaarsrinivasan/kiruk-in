---
name: eye-era-cut
description: "How the loader eye changes from one era to the next: every cut is the person's own blink, run by a director state machine (look, close, shut, swap, hold, open, build, ready), with scrubbing that works the eyelid by hand, multi-era jumps, retargeting, a rate limit, enter and reduced motion. Use when changing era transitions, the director, timings, scrub/drag/swipe behaviour, or anything that happens between eras. Triggers on: cut, transition, era change, blink cut, medium-director, departure, arrival, swap, scrub, travel, drag, swipe, slide deck, enter, flood, reduced motion crossfade."
---

# The cut: every era change is a blink

The cut is the person's own blink, like a slide deck turning. The closing lids carry the outgoing era's departure in its medium. The swap happens while the lids are shut. The opening lids carry the incoming era's arrival. Then three beats: **world** (arrival), **light** (the pupil reacts to the new screen), **sign** (the era's "this opens" appears last).

**The medium never changes with the lids open.** This is the one inviolable rule of the cut. *Why:* a swap with open lids reads as a glitch, and it happened (a held lid from the loader lost to the cut) until "the more shut lid wins" was enforced.

## The state machine (post/medium-director.ts, plain TS, no three.js)

```
REST ──want ≠ cur──▶ LOOK → CLOSE → SHUT ─(swap)─▶ HOLD → OPEN → BUILD → READY → REST
REST/any ──travel ≠ null──▶ SCRUB ──travel = null──▶ OPEN (settle) → REST
any ──exiting──▶ ENTER (terminal)
reduced motion: REST ──want ≠ cur──▶ plain cut (rate-limited) → REST
```

| Beat | Time (ms, desktop) | What |
|---|---|---|
| LOOK | 0–70 | min-jerk saccade toward the travel side, 0.3 gaze units (≈7°); +0.05 per extra era, cap 0.5 |
| CLOSE | 50–140 | lids 0 → 1, easeInQuad; `dep` 0 → 1 over the era's `departMs` from 50 |
| SHUT → swap | `swap = max(180, 50 + departMs)` | at swap: `cur = B`, `arr = 0`; light, lens, page, cursor and gaze plan all switch; lens values **snap**, not damp |
| HOLD | +40 | B's arrival begins on the shut lids; +40 ms per skipped era, cap +160 |
| OPEN | +240 | easeOutCubic; gaze eases to B's rest by pursuit, no second saccade |
| BUILD | `arriveMs` | B's arrival in its medium |
| READY | swap + max(arriveMs, 420) | `signA` 0 → 1 over 150 ms |

- Phones (`calm`) multiply every duration by 1.25.
- **The swap waits for B's page** (the cornea's reflection) up to 150 ms. *Why:* a reflection that pops in after the lids open reads as a bug.
- **The swap waits, with no cap, for B's medium to be built** (`ready(n)`). If the lids have been shut more than 250 ms waiting, the outgoing era **parks**: it un-departs over 300 ms, so the shut eye shows in the old era rather than a switched-off black screen. Once B is ready, it departs again from where it is and the cut completes. The same gate applies to scrub cuts and reduced-motion cuts.
- Everything that depends on the era snaps while `blink > 0.9`: screen palette, page, lens, fill light, screen luminance.

## Rules
- **Swaps are ≥ 400 ms apart** (≤ 2.5 a second, WCAG 2.3.1). A request inside the gap holds the lids shut.
- **Retarget:** a new request during LOOK/CLOSE/SHUT changes B (the newest wins). During OPEN/BUILD it re-closes the lids from their current height.
- **Natural blinks are suppressed** while the director is busy and for 600 ms after. A natural blink running under a cut is absorbed, not replayed.
- **The more shut lid wins** between the director, the loader's held lids and the natural blink.
- **A jump of several eras is one blink.** The eras in between are never shown and nothing drifts in hue over the lids. B's own arrival says where you landed.
- **Exiting mid-cut finishes on the era asked for**, never the one half-shown.
- Re-cutting always departs from `dep = 0`.

## Scrubbing: the hand works the lid
The loader sends `travel(pos)`, a fractional era index, while dragging, swiping or driven by the ghost finger, and `null` on release.
- `d = |pos − round(pos)|`; the lid target is `smoothstep(0.22, 0.45, d)`.
- Rate-limited: it closes no faster than full travel in 70 ms and opens no faster than full travel in 150 ms.
- The cut fires on the first frame after `round(pos)` changes with the lid ≥ 0.85 and the 400 ms gap allowing it.
- `dep` and `arr` are positional and reversible: drag back and both un-play.
- Above 3 eras a second the lids stay shut (eyes shut against the rush). They open when speed drops below 2 or the hand releases.
- On release the loader settles to the nearest era; the lids open over 240 ms.
- While dragging, gaze follows the pointer (`follow ≥ 0.6`): the eye looks where the hand carries the next era.

## Enter (tap or click on the iris)
1. Pointer-down over the iris sets `press = 1` at once. Touch waits 100 ms before showing press. *Why:* that delay lets a scroll start without flashing the press state.
2. Moving more than 6 px cancels it into a scrub; press falls at λ 14.
3. Release on the iris: `exiting` becomes true and `enter` runs 0 → 1 over `enterMs` (300–420 ms), ending on the era's flood colour, which is the home's own background.
4. The loader's room fade starts at 0.42 s and the home arrives at 950 ms, so an enter's key frame lands by ~400 ms.

## Departure and arrival: write them in the era's physics
Each era's cut is its own device switching off and on, never a generic fade.

| Physics | Departure | Arrival |
|---|---|---|
| CRT (1970) | raster collapses to a line, then a dot | tube warm-up, gamma 2.2 → 0.85 |
| Bitmap (1981) | one field clears to ink | two interlaced fields paint down |
| Refresh (1991) | 4 → 2 greys | a refresh sweep, coarse below it |
| GIF (1995) | 16 → 3 levels | interlaced passes 8, 4, 2, 1 |
| Glass (2013) | parts shrink back to dots | Atomic Design: atoms → templates |
| Sensor (2026) | rings fold into the pupil | exposure from white; instruments construct |

Rule: departures are fast (100–200 ms) and stay dark or neutral, so the shut lids hide the swap. Arrivals carry the drama (300–640 ms).

## Reduced motion
No saccade, no blink cut, no departure or arrival. A plain cut, rate-limited to 2.5 a second. Signs show steady (`steady = 1`), never vanish. Hover and press stay live. Enter is a 200 ms fade to the flood.

## Realism pass: the shut eye is a scene (C8)
Every cut shows the closed lids for ~100–250 ms, in both eras' media: the closed lid is on screen more than any single era.
- **After any change to lid form, lashes or blinks (R7, R9, R13):** film one forward and one backward cut and inspect the shut frame. Check for:
  - skin over the corneal bulge, with no light arc;
  - the lash lines meeting;
  - no crease drawn on a closed lid that isn't there.
- **Partial blinks (R13) are natural blinks:** suppressed during the cut and for 600 ms after.
- **New per-era light fields (R11: real size, spectrum, fills) switch with the rest at the swap.** They snap while `blink > 0.9`, never damping across open lids.

## Proof
Every change to the cut ships a slowed filmstrip (`slowMedium(0.06–0.25)`, frames every ~400 ms) for at least two pairs of eras, forward and back (eye-verification).
