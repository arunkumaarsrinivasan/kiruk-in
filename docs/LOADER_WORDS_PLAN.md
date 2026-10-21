# Road map — the loader's words, third design

> Turtle road map. Tier: stone (signals: one surface, 2–3 source files, one revert undoes it). Status: direction pending.
> Re-read the next unchecked step before each build step. Log every deviation in the drift log.

## Context
Two text designs for the first-visit loader were rejected on 2026-10-20: the "eye study" readout, then the U-shaped era orbit. The user's brief for the third:

> "We should not use the top and bottom areas, which are already covered by the [eye] … on the desktop. When we look at the phone side, we need to keep it at the top and bottom … I need a very clear and intuitive design … that will tell about the era and the eye … People will get to understand what will happen when they see it and what they need to do. Don't overexaggerate with the info … Just give me the way it will look, and then let's work on it."

The outcome: a cold first-time visitor understands in a few seconds what this is, which era the eye is showing, how to move through the eras and how to go in. The words wear each era's look. This step delivers mock frames only; nothing is built until a direction is picked.

## Questions & answers
| # | Lens | Question | Answer | Label |
|---|---|---|---|---|
| 1 | Why | What must the visitor know in the first seconds? | What this is (one portfolio, ten eras of the web), which era the eye shows, what to do (sweep / tap), what happens (the site opens in that era) | verified user brief 2026-10-20 |
| 2 | Who / moment | Who sees it, when? | Every first visit, cold, on desktop or phone; the loader is the first-visit era picker | verified `src/components/ui/immersive-era-loading-page.tsx:4` |
| 3 | Scope | What is in? | The words layer only. The eye, sweep, tap, keys and exit stay as they are | inferred from brief |
| 4 | Where | Which zones may hold words? | Desktop: left and right of the eye only. Phone: above and below the eye | verified user brief |
| 5 | Today | What exists, and what was decided? | `EraOrbit` at the bottom (rejected). The header says "There is no button": the iris is the button | verified `immersive-era-loading-page.tsx:11`, `loader/EraOrbit.tsx` |
| 6 | Data | What era copy exists? | Each theme has `name`, `era` (movement), `description` (2–3 sentences), `lesson` (one line), colours and three fonts | verified `src/data/portfolio-data.ts:250` |
| 7 | Constraints | Is there room at the sides? | With today's box (halfW 16, bottom −16.5) a 1440×900 screen leaves about 21% a side. A box ~50 mm wide keeps about 24% a side on any desktop | inferred from `tslFrame` fit-by-height/width arithmetic |
| 8 | Constraints | Do the era fonts exist on first paint? | VT323, Pixelify Sans, IBM Plex, Geist, Doto are web fonts; Comic Sans, Times, Verdana, Arial, Helvetica are system | unknown → build step 1 (check the loader's font loading) |
| 9 | Risks | Which edges break a side column? | Long movement names ("Early Responsive & Minimalism (2006-2012)"), 2026's near-black accent, 1280×720, landscape phones, no WebGL | inferred |
| 10 | Done | How will the pick be made? | Mock frames of each direction over real eye shots, desktop and phone, several eras | — |
| 11 | Scope | May an explicit Enter control exist, beside tapping the eye? | Reverses the recorded "no button" rule; direction C depends on it | user-decision |
| 12 | Reference | Is there a reference image for the look? | Asked with the mocks (TL-18) | user-decision |

## Layer stack
| # | Layer | Known | Unknown | Depends on |
|---|---|---|---|---|
| 1 | Literal ask | quoted above | — | — |
| 2 | Outcome | four questions answered at a glance | — | 1 |
| 3 | User & moment | first visit, cold, desktop + phone | how long they read before sweeping (hypothesis: under 5 s) | 2 |
| 4 | Problem | earlier words competed with the eye or explained nothing; sides empty | — | 3 |
| 5 | Current state | EraOrbit, eye framing box, sweep/tap/keys | — | — |
| 8 | Flow | land → read → sweep (era restyles) → tap or Enter → pupil dilates → site | — | 5 |
| 12 | Edges | see Q9 | — | 8 |
| 15 | **Core idea** | draft — the eye sits between two quiet side panels that say, in the era's own look, what the eye is showing and how to move through time and step in; on a phone the same two panels sit above and below. Finalised by the direction pick | | |

## Seams
| Seam (A × B) | What crosses | Conflict? | Resolution | Owner |
|---|---|---|---|---|
| eye framing × side panels | horizontal room | today's box can leave 21% a side | loader box ~50 mm wide (halfW 25), eye centred | `LOADER_BOX` |
| side panels × sweep surface | pointer moves | a control over the surface eats moves | panels `pointer-events: none` except their one control | loader |
| era fonts × first paint | font files | fallback flash on first view | preload the ten display fonts, or use system fallbacks deliberately | build step 1 |
| era colour × dark room | accent colour | near-black accents vanish | keep the `legible()` floor | panels |
| phone panels × eye | vertical room | the phone eye fills the width | measure free space above and below per phone size | build step |

## Direction (draft, pending the pick)
**What five rejected rounds proved** (eye study, U orbit, side panels A/B/C, three ways to instruct without text): anything laid on top of the eye fails. The user wants no words, and wants the visitor to feel *inside* the era, with the era's design as the show (TL-25).

- **Chosen (proposed): ten ways of seeing.** The same eye, the same person, shown through each era's own screen and image technology. No words on screen; the medium is the message.
  - 1970 green phosphor CRT (one colour, scanlines, bloom, curved glass) · 1981 a 1-bit bitmap, Atkinson-dithered · 1991 a grey GIF on a white page, still loading, in a blue link border · 1995 the 216-colour web palette, ordered dither, big pixels · 1997 16-bit colour bands, a heavy JPEG, a gold bevel · 2000 a white page and one box, the eye seen through it · 2003 candy colour and the glossy wet band · 2009 Retina: every detail sharp, behind glass · 2013 flat: six flat tones · 2026 black lids, white page, a dotted pupil (the 2026 home's own look).
  - **Travel:** sweeping wipes one era's medium into the next, the seam under the pointer or thumb.
  - **Get in, without words:** each era's own sign for "this opens" — the prompt's cursor waiting in the pupil (1970), the arrow pointer (1981), the blue link border (1991), the bevelled button (1997), the caret in the box (2000), the glossy button (2003). Tapping the pupil still dives in.
  - **Build:** one full-screen post pass per era in `post/era-lens.ts` (quantise, dither, scanlines, halftone, wipe), cheap next to the eye itself.
- **Rejected:** the eye study · the U orbit · A caption and cue / B split year / C the era's own window (overlays) · the eye acting it out / the cornea as a menu / a cursor ring (instructions on top) · do nothing.
- **Trade-off to decide:** 1981 and 2026 are heavily stylised; the realistic eye survives fully only in 2003–2009. The person (one eye, one identity) stays in every era.
- **Non-goals:** changing the eye's anatomy, rig, gaze or exit; adding any words.

## Prototype (dev only, 2026-10-20)
- `post/era-medium.ts`: the ten media as one pass over the finished frame (rendered to a texture with `convertToTexture`); `left`/`right`/`seam` uniforms let two media share the frame, so a change of era wipes across (0.75 s, a later era from the right).
- `createEyePipeline(..., media)` and `EyeStage media` build it only when asked; `EyeStageControl.setMedium(id | null)` shows any medium on any era.
- Loader: `/?eye=tsl&see=1` turns it on, drops the orbit (no words at all) and uses the stage's own framing.
- Lab: `/lab/eye` → Camera & lens → "Ways of seeing", with a medium picker.
- Cost, headless (inflated): about +3 to +5 ms GPU at 1440×900, mostly the extra full-resolution target. To cut if it stays: render the frame at a quarter size for the media that only read cell centres (1981, 1995, 2026).
- Verified: all ten eras render in the live loader; the 1970 → 1981 wipe shows both media and the seam; no console errors.
- Round 2 (user: "a subtle way to tell left and right… one word on each side… with 2026 and 1970 we can't see anything; enhance it so we can see the effect, both ways"):
  - Edge bands: the era either side peeks in at each edge in its own medium, as a window onto the eye through the pupil (left band: the pupil's left half; right: its right half). 5% of the width (at least 34 px), 2.2× when the pointer is near; none left of 1970 or right of 2026.
  - One word each side (`components/ui/loader/EraEdges.tsx`): the neighbour's year with a chevron, 11 px, on the eye's line, in that era's accent type; a button to go there.
  - Stronger media: 1981 skin goes to ink (a drawing, not noise); 2003 a glossy photo on a white page with a wet-floor reflection; 2009 the warm faded white-bordered phone photo of its time; 2026 the halftone over the whole face.

- Round 3 (user: the bands "occupy too much space… the straight line looks so simple… add a left-and-right illusion so we know something is there… transitions should feel alive, different for each"):
  - Glimpses replace the bands: a crescent of each neighbouring era, widest on the eye's line (3% of the width at rest, at least 22 px; 2.4× near the pointer), breathing, drifting against the pointer, looking onto the eye through the pupil.
  - Each glimpse's edge is its era's texture (1970 scanline comb, 1981 dither, 1991 interlaced rows, 1995 big pixels, 1997 JPEG blocks, 2026 halftone dots; smooth for the rest), with a rim in its colour.
  - Travelling grows that glimpse across the frame in 0.95 s: the curve straightens, the slice slides home, the textured front crosses the eye. A jump of several eras grows the glimpse of the era you are going to. The words sit in a small dark capsule so they read over a bright glimpse.

- Round 4, proposed (user: the glimpses look "disconnected from the idea"; earlier they asked to keep it "in the eyeball"; TL-26): **the eye holds the timeline**.
  - At rest the cornea reflects three screens: the current era straight ahead, the previous and next eras' screens off to the left and right, smaller and angled, between the main reflection and the limbus. No glimpses at the screen's edges.
  - The two words (‹ previous, next ›) sit in small capsules at the eye's inner and outer corners, on its line.
  - Travelling: the eye turns toward that screen, and the next era blooms out of the pupil as a ring whose edge is that era's texture (dither, JPEG blocks, halftone…), with a rim in its colour, until it fills the frame.
  - Mock page on the dev server: `public/mock-timeline/` (http://localhost:3050/mock-timeline/index.html; Next serves public files by exact path, so the bare folder 404s), a throwaway: delete it before committing.
  - Mock stills: session scratchpad `seeing2/timeline-in-the-eye.png` (composited from live shots, then each era's medium). Building it needs the neighbours' pages as textures in the cornea's reflection (nodes/screen.ts, nodes/cornea.ts) and the ring in post/era-medium.ts.

- Round 5, proposed (user: the "‹ 2003 / 2013 ›" capsules "are not linking… not apt for the overall design"): **the eye's line is the timeline**. A hairline out of each corner of the eye, on the eye's own tilt, firmer away from it; a tick for every year between the two eras; the neighbouring era's year in that era's own type; line and year in the current era's ink (phosphor green with glow, crisp bitmap white, link blue on 2000's white page…). No box: the skin under the words is shaded before the era's medium, so a dither or halftone clears the ground itself. Mock: http://localhost:3050/mock-timeline/index.html.

- Round 6, proposed (user: the corner lines and years "are so odd"; the portals looked good but were not apt; "change the perspective and then the idea"; TL-27): **a gallery of ways of seeing**. A dark room with a row of screens, one per era, each showing the same eye in its era's medium, in that era's device bezel (beige CRT plastic, black glass…). At rest the current screen fills about 78% of the view and its neighbours stand angled in the dark either side, cut off by the frame; its glow lies on the floor. No words. Travelling turns the camera along the row (the current screen swings away, the next swings in). Entering grows the screen to full bleed and the pupil opens. Mock: http://localhost:3050/mock-timeline/index.html.

- Round 7 (user: "no way, revert the last three changes and show without anything"): the gallery, the corner lines and the timeline in the eye are dropped, with their mock page (`public/mock-timeline/`). The live prototype shows nothing at rest but the era on screen: no edge glimpses, no words (`EraEdges.tsx` deleted). Kept: the stronger looks from round 2, and the era-textured sweep when you travel.

- Round 8 (2026-10-20; user: "the GLSL looks so simple now"; answers: swap now to ways of seeing, no words): the live loader is the TSL eye through each era's own screen, with no words in any path. `EraOrbit.tsx` is deleted. The slider's `aria-valuetext` names the era for a screen reader. See EYE_TSL_PLAN.md, "P12, early".

- Round 9 (2026-10-21; user: the loader "is shown like a static image at first with 1970… till that time it's really frustrating… I need a motion or something to say about me before we open this in an eye… travel through time… multiverse of my portfolio"): **an opening before the eye** (`components/ui/loader/EraIntro.tsx`). Words are back, but only before the eye opens, never on it. A dark room shows three lines: "One portfolio. Ten universes." / "One for every era of the interface." / "Travel through time to meet me." Meanwhile the years rewind from 2026 to 1970, each in its era's own type and colour, entering from the left as the sweep runs into the past. 1970 lands in phosphor with a waiting caret. The live eye compiles behind it, held shut (`holdBlink(1)`, gaze centred). When the words are done and the eye is ready, the room fades and the real lids part on 1970 (they lift, catch, then open). There is a 12 s cap, after which it opens onto the poster. A press, key or wheel skips to the last line. It is pure CSS opacity and transform, so it keeps its pace while the main thread builds the eye. EyeStage counts a changed held blink as motion, so the idle rest does not drop the opening to 1/3 frame rate.

## Done-criteria (draft)
- [ ] Desktop: no words above or below the eye; both side panels sit on the eye's centre line — check: screenshots at 1280×720, 1440×900, 1600×900, 2560×1080.
- [ ] Phone: words only above and below the eye — check: 390×844 and 360×740 screenshots.
- [ ] Each of the ten eras renders its panels in its own look — check: a 10-era sheet.
- [ ] The four visitor questions are answered by words on screen — check: read the 10-era sheet against them.
- [ ] Keyboard, wheel, sweep and tap still work — check: the headless loader run.

## Build order (sketch; detailed after the pick)
- [ ] 1. Framing: the loader box that keeps the side room; check the era fonts' loading.
- [ ] 2. The panels' shared structure (desktop sides, phone top/bottom).
- [ ] 3. Era skins, three per batch.
- [ ] 4. Edges and the 10-era sheet.

## Checkpoints
- Now: pick A, B or C (or a mix), and decide whether an Enter control may exist.
- The A/B/C mock page (`public/mock-loader/`) was removed after the user rejected those directions.
- Now: build "ten ways of seeing" or adjust it; still frames are in the session scratchpad (`seeing/ten-ways.png`, `seeing/out/sweep.png`).

## Watch list
- Visitors read before sweeping (under 5 s) — confirm by watching one real first visit — status: open.

## Drift log
| Date | What changed | Why | Approved by |
|---|---|---|---|

## Close & retro
- Retro so far: TL-23 (`missed-question`: the orbit was built without preview frames), TL-24 (`shallow-layer`: designed from a metaphor, not from the visitor's questions and the free zones).
