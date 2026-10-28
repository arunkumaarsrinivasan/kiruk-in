---
name: eye-ideation
description: "How to invent and curate an era's point of view for the loader eye (or any 'one subject seen through many technologies' piece): find the era's mechanism, pitch several distinct concepts, and avoid the designs that were already rejected. Use before designing or redesigning any era, when the user says it lacks wow, feels the same as another era, is monotone, missing detail, or asks for ideas to choose from. Triggers on: idea, concept, ideation, POV, point of view, make it unique, wow factor, curated, feels same, redesign era, new era, references, storyboard, pitch options."
---

# Ideation: one era, one way of seeing

The eye is fixed. What an era owns is *how its technology would have seen this person*. Ideation is finding that, and it is a process, not a mood.

## The procedure (walk it every time)

1. **Name the era's change in how machines saw people.** The deck is a machine learning to see:
   1970 blind, knows only keys · 1981 one point, your hand · 1991 stills · 1995 grey video · 1997 your hover · 2000 your typed words · 2003 live colour · 2009 your finger · 2013 components, your body · 2026 it looks back and measures you.
   Every concept must express its era's line. If it could belong to another era, it is wrong.
2. **Ask for references before pitching**, if the user hasn't given any. If they have none, pitch anyway and say what a reference would settle. When they share images, write down for each one what to take and what to leave (a table). *Why:* rounds without references missed three times in a row.
3. **List the era's real artefacts**, not tropes: its display physics, its picture formats, its UI kit, its interaction verbs, its famous moments (iOS 7's Control Center frost, a GIF's interlaced passes, Touch ID enrolment filling red).
4. **Choose the mechanism**, the structural way the era draws the face. Decision tree:

```
How does this era's technology represent a person?
├── As a display physics (phosphor, 1-bit, 4 greys, web-safe, 16-bit) → a medium:
│     the face re-rendered in that physics, full bleed (1970, 1981, 1991, 1995, 1997)
├── As a panel / camera / photo grade (TN panel, CCD candy, phone filter) → a grade on the face (2000, 2003, 2009)
├── As a signal, not an image (voice, sensors) → the face drawn in the signal's own form
│     (waveforms, levels), every detail still shown; never sound, never a microphone
├── As a system of parts (components, kits, tokens) → the face *built from* those parts,
│     every pixel a part, sized by detail (2013)
└── As data about the person (tracking, landmarks) → the face plus the measurement
      of it, and of the visitor (2026)
Is the exact technique, or the sign, already used by another era? (Sharing a family is fine.)
├── Yes → reject it, go back to step 3
└── No → continue
```

5. **Test it against the system rules** (eye-loader-system): whole face visible at rest, one person, no words, calm, phones, no prompts, colour as light or medium.
6. **Pitch 3–4 genuinely different concepts**, each: name, the era fact it rests on, what is on screen at rest, what hover / press / enter do, what is new about it. Give a one-line recommendation, then let the user choose (AskUserQuestion). Never pitch variations of one idea.
7. **Build the chosen one to the full craft bar** (below), then storyboard it (eye-verification).

## The craft bar (what "wow" meant every time)

A concept is not done until it has all of these. Each was missing once, and each time the user called it "no wow", "monotone" or "not curated".

- **A signature**: one element only this era has, crafted further than everything else (2026's gimbal of the globe's great circles; 2013's iris as a dial of sliders).
- **Hierarchy**: at least three line or part weights; at most 5 bright accents on screen; about 70% of the marks at the quietest weight. Everything at one weight reads as flat.
- **Real notation**: borrow the domain's true language (eye-tracking scanpaths, Atomic Design levels, a GIF's passes). Invented decoration reads as generic.
- **Every motion means something**: a line moves because what it measures moved; a part changes because its state changed. Nothing spins for its own sake.
- **Depth**: the medium reads the scene's depth (alpha) for at least one of elevation, shadow or parallax, so it sits *on* a face, not on a poster.
- **Colour that commits**: when an era is colourful, use a solid ramp whose luminance falls at every step, with middle steps at OKLCH chroma 0.15 or more. Pastel washes (chroma under about 0.08) read as "soft" and were rejected.
- **The face's detail runs through the medium**: relight each part by the face under it so hairs, folds and the cornea's page survive.
- **A dark era is lit, not black**: when the era's screen is dark (night, dark mode), its fill light and the room light the face, and shadows stay capped (eye-anatomy rule 1). The darkness is the ground, never the face.
- **The eye sits in the face**: anything drawn on the eye is clipped by the lids pixel by pixel and lies under the cornea's reflection; a disc pasted on top reads as "separate", "creepy".

## Realism is not a concept
- **"Make era X more realistic" is never a redesign.** Never change an era's mechanism or sign for realism. Use X's card in `eye-loader-system/references/era-realism.md` and the phase's owning skill.
- **If realism makes two eras read alike, their light or lens converged,** not their concepts. Check C1 and the two cards before touching a medium.
- **Every new era concept declares, from day one:**
  - its physical light: device, distance, real size, spectrum, fills;
  - its task posture;
  - its medium's detail floor.

  *Why:* realism then has a brief, and the era is real before it is styled.

## Rejected directions (never pitch these again)

| Rejected | Why |
|---|---|
| UI or a HUD laid over the unchanged photo (a camera UI for 2013) | "Feels the same as 2026"; an overlay is one idea repeated |
| Frosting, blurring or fading the face at rest; leaving only the eye clear | Hides the detail the deck exists for |
| Square-grid halftone at full contrast | "Too irritating for the eye"; vibrates and checkerboards |
| ASCII, dot-matrix characters, window chrome, bevels | Overused tropes; replaced the medium with decoration |
| Words, labels, edge bands, neighbouring-era previews, left/right hints at rest | Noise; every one was rejected |
| A single themed design system (only iOS 7) for an era of many | "Blend all the designs from that time" |
| A photo iris inside an otherwise drawn face | Reads as a pasted, creepy eyeball |
| One big button as the pupil's sign | "Should not be a single button"; make it of many parts |
| Logos, a drawn cartoon eye, scribbles in the opening | "Meaningless"; the opening must be the invention of the interface |
| Staged keyframe slides ("SVG like a popup slide") | Wanted a running process that forms itself |

## When the user's feedback is vague

Turn each phrase into a concrete check before changing anything:

| They say | Check |
|---|---|
| "no wow", "not curated" | Is there a signature? Three weights? Real notation? |
| "monotone", "soft colour" | Is the ramp solid and saturated? Does local contrast separate the face's regions? |
| "missing detail", "not like other eras" | Do hairs, pores, folds and the cornea's page show through? |
| "separate", "creepy" (the eye) | Is the iris clipped by the lids per pixel, under the reflection, in the same language as the face? |
| "feels the same as X" | Is the mechanism shared with X? Return to step 4 |
| "too much", "irritating" | What moves at rest? Is any pattern beating against pixels? |
