# Road map — 1970 home, whole-page redesign

> Turtle road map. Tier: boulder (signals: a new surface and flow, 6+ source files, a new renderer, seams with the loader and the nav). Status: round 1 rejected 2026-11-10; round 2 direction pending.
>
> **Round 1 (rejected 2026-11-10):** the four option cards were all answered with the recommended default, and the hero was built as the loader's eye in stacked traces. The user: "I don't want to show like this… once we enter, it's like we are seeing from the eye to see the 1970 world of interface… this is why we have top and bottom lid… home page on each era is like hold everything and show the idea and give the way how and what we are showing… let's work on each part." Everything below this block that names the eye as the hero, "Signal", or the five figures on a scroll is superseded by **Round 2** right here. The audit, the seams, the done-criteria that are not about the hero, the vector tube and the stroke type still stand.

## Round 2 — the view from the eye (direction pending)

**The rule (from the user):** the loader shows the eye. After entering, the visitor is behind it: the lids are theirs, and what is between them is the 1970 world of interface. The eye is never drawn on the page. The home holds everything, shows the idea, and gives the way: how to move, and what is being shown.

**Core idea (draft, to be confirmed in the user's words):** between your lids is a 1970 graphics terminal, just switched on. Its first picture is an index that holds the whole site as a map you point at; each part of the site is its own piece of 1970 computer graphics, drawn by the beam when you point at it and opened when you press.

**Why this form:** a 1970 graphics terminal was worked by pointing a light pen at "light buttons" drawn on the screen, with a tracking cross under the pen (Sketchpad 1963, IBM 2250 1964). That is the era's own pointer-first interface: no commands to type. The site map is drawn the way the first network maps were drawn in 1969–70: hosts as circles, lines between them.

**Parts, each with its intent (worked one at a time, each approved before it is built):**

| # | Part | Intent: what the visitor gets | 1970 form | Point / press |
|---|---|---|---|---|
| 0 | The view | "I am looking out of the eye at a screen" | lids as they are; a dark room; the tube warms and the beam draws; the pointer is a tracking cross | — |
| 1 | Index | in five seconds: who this is, what is here, how to move | name and role in stroke type; a map of the site (nodes and lines); one message line that says what to do | point a node: its picture draws beside the map · press: it opens |
| 2 | Work | proof: what he made | each work as a line-drawn plate of what it does (chart, printer, tokens…), with callouts and one number | point a plate: it draws large with its line · press: the case |
| 3 | Story | the person | his years as one plotted trace, 2001 → now; peaks are the moments | point a peak: the moment · press: the story plays (the About box, `#about`) |
| 4 | Notes | what he thinks | the notebook's pieces as a printout list | point a line: its opening · press: the piece |
| 5 | Reach | how to get to him | an open line: a carrier trace and the channels | press a channel: mail, LinkedIn, GitHub |
| 6 | This era | the idea of 1970, and the way to the other eras | a labelled figure of what this screen can do: light button, tracking cross, keys | press: the era story; the lower lid already carries the years |

**Open, for the user:** is the reading right · one screen with parts opening in place (recommended) or a scroll through the parts · the part list and names · which part first (recommended: 0 + 1, the frame everything hangs on).

**Kept from round 1:** `home/vector-tube.ts` (the display), `home/stroke-font.ts` (the type), the single keys, the proto route, the shell-layer opt-out. **Removed 2026-11-10:** `home/signal-field.ts`, `home/SignalCanvas.tsx` (the eye plot) and the text window.

### Round 2 log

**2026-11-10 — the user: "Right, build the index."** Taken as: the reading is right, one screen with parts opening in place, start with parts 0 and 1. The part names were changed to the nav's own, so one thing has one name: Work, Read, About, Contact, Era (keys W R A C E).

**Parts 0 + 1 built (uncommitted), at `/proto/1970-home`:**
- `home/index-layout.ts` — where everything sits for a glass of a given size; read by the drawing and by the page, so a node and its link are the same place. Under 900 px wide the map becomes a column and there is no picture area.
- `home/index-scene.ts` — three layers of strokes, each with its own clock: the map (point grid, hub, spokes, nodes, drawn in on arrival), what changes (the picture, the lit node, the message line), the tracking cross. Pointing at a node lights it, runs a leader to the picture area and draws its figure: Work a climbing chart, Read a page of lines, About his years as one trace lifted at each of the 13 moments, Contact a carrier with a burst, Era ten years with this one boxed. Nothing pointed at: "1970", the idea in two lines, and a legend of the three things the screen answers to (tracking cross, node, one key).
- `home/vector-tube.ts` — strokes in layers; a stroke can grow from one end; strokes that cross do not add up (max blend); traces are optional.
- `home/Home1970.tsx` — the name and role as stroke lettering in the page (there before the glass wakes; the words are in the `h1`), a real link or button over every node, keys, About opening in place as a panel that holds the existing story box, Era opening the existing era story, Work / Read / Contact going to their pages until their parts are designed. One screen: the page does not scroll.
- Checked: typecheck clean · 1440×900 at rest, pointing at Work and at Contact (screenshots) · `A` opens About, `Esc` closes and focus returns to the About node · 375×812: column layout, no sideways scroll, hit areas 60 px tall.
- Not checked: the draw-in, the tracking cross and the phosphor trails in a visible window (the hidden pane runs frames only on demand) · pressing Work, Read, Contact, Era · a cold `/#about` (only meaningful once this is the live home) · the flat 2D fallback · reduced motion.
- **Draft copy, awaiting the user's words:** "This screen cannot see you. Point at it, and it draws."
- The figures in the picture area are previews. Parts 2–6 each get their own intent, sketch and approval before they are designed for real.

**Next:** the user's verdict on 0 + 1, then part 2 (Work).

### Round 3 — the work page's tube, with the old content (2026-11-10)

**The user, after seeing the vector index:** "Lets try it like we have in work page. use that idea and make it better for this landing page. and use the content we had before." So the vector index is dropped. The home is drawn on the same tube as /work 1970 (a character screen shown through the tube shader), and what it holds is the research file the old teletype home printed, unchanged.

**Removed:** `home/vector-tube.ts`, `stroke-font.ts`, `index-layout.ts`, `index-scene.ts`, `IndexCanvas.tsx`, `content.ts` (the whole stroke-display approach).

**Built (uncommitted), at `/proto/1970-home`:**
- `home/home-model.ts` — the seven records (Why Kiruk, About, Empathy map, Journey map, Impact, Card sort, Usability test), the subject and the ways out, all read from `era-page-content.ts` and `about-story.ts`. No copy is rewritten.
- `home/home-views.ts` — two screens under one head and one status line, as on /work:
  - **the board:** a SUBJECT pane (pre-title, name at double size, role, place, the framing, the file's header facts, the ways out as keys: Work, Notebook, Contact, Progress, This era, Travel eras); the seven records as cells, each with its number, a small block picture and its name, plus an "All work" cell; a dossier under them with a few lines of whichever record is pointed at (at rest: Why Kiruk's hook and close). Narrow tubes get the subject, the records as a list and the keys.
  - **a record:** its number, name and subtitle; the other records one press away in a list; the record itself in a framed pane that scrolls. About is the story inside the tube: his years on one line with a tick per moment, step keys, SKIM / READ / DEEP, the moment's text. Card sort has its kinds as filter keys and each project opens its /work page. Usability test's channels are keys that leave the tube.
- `home/Home1970.tsx` — the host, adapted from `ControlRoomDesktop.tsx`: the same lid-aware layout, pointer mapped through the glass, display settings (shared with /work through the same storage key), flat fallback without WebGL2, and a hidden mirror with the whole file as headings, links and buttons. Keys from anywhere on the page: arrows, Enter, 1–7, Esc / Backspace, `[` `]` for the About moments, W N C for Work, Notebook, Contact. `/#about` and the nav's About link open the About record.
- `control-room/views.ts` (work tube) — only exports added so the home can reuse its parts: `Flow`, `fact`, `glyphKey`, `linkKey`, `lamp`, `statusLine`, `configPanel` (which now takes the label of what it returns to). The work page's behaviour is unchanged.
- Better than /work's board for a landing page: the first screen says who he is at double size, the dossier shows the hook before anything is pointed at, the keys work without clicking the tube first, and a desk-sized window always gets about a hundred columns.
- Checked: typecheck clean · board at 1440×900 (screenshot) · click opens Journey map · the record list switches to About · `Esc` closes · `6` opens Card sort · no console errors.
- Not checked: the narrow (phone) board beyond one cropped look at 1122 px before the column fix · pressing the ways out, the channels and the project cards · the display panel on the home · the flat fallback · reduced motion · a cold `/#about` · the work page after the export change (typecheck only).
- Duplication to pay down later: the tube hosting in `Home1970.tsx` repeats `ControlRoomDesktop.tsx`; unify once both screens are approved.

**Next:** the user's verdict on this board; then the swap into the registry, the `era-travel/specs/terminal.ts` blueprint, and `npm run eye:screens` for 1970 (ask before keeping).

### Round 4 — every record as a moving picture (2026-11-10)

**The user:** "I want to preserve the entire section as visualization and graphics. I want the old, absurd, and weird Game Boy graphics and animation from that era to connect with the design here." References: interfacelineage.com (1970s catalog) and Cosmos, "for better graphic assets… implement them for our era and the concept we have."

**Research, what was taken:**

| Source | Found | Used as |
|---|---|---|
| interfacelineage.com, 1970s (39 interfaces) | Pong score and paddle HUD (1972) | Why Kiruk: a game of Pong between DESIGN and CODE |
| | LED pocket calculator (1971), digital watch (1972) | Impact: seven-segment readouts with ghost segments, counting up |
| | Batch job control cards (1973), punch cards | Card sort: punched cards riding a belt into hoppers, one hopper per kind |
| | Mainframe operator console, breadboard (1971), early email (1974), time-sharing prompt (1971) | Usability test: two stations on a line, a socket per channel, a patch cord, lamps |
| | Text cursor caret (1974), green-screen forms (1971) | The file's one figure has a terminal for a head and a cursor in it |
| | Arcade cabinet (1971), console pause menu (1976), MUD (1978) | Step keys, the text box under each picture, moving between moments |
| Cosmos: "game & watch lcd screen" | every position printed faint, only the live one dark | ghosts: paddle tracks, unlit segments, the next hop, empty meter cells |
| Cosmos: "game boy pixel art", "retro game ui monochrome green screen" | four shades of one green, a runner on a scrolling road under a big dithered moon, "- PRESS START -" boxes, sprite sheets of keys and meters | the tube's four shades as the palette; About's walk; checkerboard dither for a fifth shade; the double-framed text box |
| Cosmos: "1 bit pixel art weird character animation" | small figures that move in two or three frames | figures step at 5–6 frames a second, never glide |
| Cosmos: "1970s computer interface" | light pens and fingers on tubes, rows of coloured console keys | left for later: not used yet |

**Built (uncommitted), same proto route:**
- `home/home-scenes.ts` — seven scenes, drawn in blocks on the tube: Pong (four rounds: hook, pain where the ball goes past, bridge where one hand holds both paddles, close where they are one piece) · a walk along his years with a landmark per moment, a moon and a skyline that move less than the road · one figure whose mouth, lamp, hands and heart are Says, Thinks, Does, Feels · a climb with a ledge per year and a flag on the last · eight LED readouts that count up, with meters · punched cards sorted into hoppers · a line between two stations with a packet going out and back, a socket per channel.
- A scene says which of its items is shown (the one pointed at, else the one picked); `home-views.ts` puts that item's words in a double-framed box under the picture, with step keys, a count, the About depth keys and, where an item leaves the tube, its key. All the old words are still there; none are new.
- `Home1970.tsx` — a chosen item per record; left and right arrows step items, `[` and `]` turn records; scenes redraw twenty times a second while a record is open.
- Checked: typecheck clean · all seven records open without console errors · About and Card sort seen whole at 800×500 (picture, box, keys) · the other five seen in part at 1440×900.
- Not checked: the scenes in motion (the preview pane is detached and runs frames only on a screenshot) · pointing at items with the pointer · phone widths · the whole frame at desk size for five of the seven.
- Open for the user: the figure (a terminal for a head, a cursor in it, no eyes) · whether the board's cells should play small versions of the scenes · the unused Cosmos finds.

**2026-11-10 — the user: "Yes, do the board too."** Built (uncommitted):
- `home-scenes.ts` `playMini()` — each record's scene at the size of a board cell, playing by itself: Pong rally, the walk with a house going by, the figure speaking / thinking / doing / feeling in turn, the climb, a readout counting to 45 with its meter, cards dropping into hoppers, two stations and a packet, and for "All work" candles climbing with the way-out arrow. At rest a cell plays at 0.4 pace in the dim shades; pointed at, full pace in the bright ones. Reduced motion holds every one still.
- `home-views.ts` — the cells play `playMini` in place of the still block pictures (removed); the dossier plays the pointed record's scene beside its words when it is 60 cells or wider; the file's figure stands by the name in the SUBJECT pane and waves.
- Checked: typecheck clean · no console errors · two whole desk-size frames (About, Journey map, each with its scene and text box) caught while the user was using the page.
- Not checked: the board itself with its small scenes. The user was working in the preview pane, so it was not reloaded under them a third time.

### Round 5 — the little things (2026-11-10)

**The user:** "Looks lovely. There is still room to explore and make the best of it, and there is so much room for detailing too. This shows the charm and the interface that brings joy with the little things instead of heavy graphics. We need to bring the best out of it."

The direction is confirmed: small block-drawn details and behaviours, no heavier graphics. First detail pass, built (uncommitted), `home-scenes.ts` rewritten with:

| Where | The little thing |
|---|---|
| The figure, everywhere | the cursor in its head turns toward the pointer; by the name it waves when the pointer comes near |
| Why Kiruk | the Pong is real and can be played: the pointer over the court moves the DESIGN paddle, misses are scored, a hit throws a spark and bends the ball's path; in BRIDGE the one hand moves both paddles and a rally counter runs; in CLOSE the ball leaves a tail around the joined piece |
| About | stars that come and go, a cloud, a bird crossing now and then, a window lit here and there in the skyline; the moon fills as the story comes up to now; a landmark bobs when pointed at and hops once when reached; a marker bobs over the moment being read; dust at the walker's heels |
| Empathy map | it breathes; the thought rises in growing blocks; speech comes out as a wave; three blocks are kept in the air between its hands; small hearts rise from the big one |
| Journey map | something from each year stands on its ledge (a coin, a mortarboard, a game pad, the printer, the candles); a sun that rises as he climbs, a cloud, stars at the top; the hop's ghost is an arc; dust where he lands |
| Impact | readouts start one after another and flicker while they settle; a spark when a number arrives; the one pointed at counts again; a small mark for the kind of number (bolt, box, bars, star) |
| Card sort | the belt turns on rollers; a figure feeds it until the last card is down; a card wobbles as it drops and the hopper answers; each hopper counts what it holds on a small readout; a card pointed at lifts out a little |
| Usability test | the packet is a letter; the line hums ahead of it; each station hops when the letter reaches it and a tick appears over ARUN; the pass lamps come on in turn; the patch cord grows up to the line and sparks as it goes in |
| The board | on arrival the cells come on one after another, each a ghost until its turn; a moth lives on the tube: it goes after the pointer, and keeps by the clock when there is none |

- Reduced motion: every one of these holds still (`t` is 0), and the moth is not drawn.
- Checked: typecheck clean · no runtime errors in the page the user had open · one whole frame of Why Kiruk in play (ball with its phosphor tail, both paddles, score).
- Not checked: each detail in motion, one by one · phone widths.
### Round 6 — each record its own interface (2026-11-10)

**The user, on the scenes:** About: "the game and the concept needs a new design and the bottom text is too much." Empathy map: "need a better way to convey the bottom and the top is not linking well." Impact: "remove… and make it better. that looks confusing." Card sort: "where is Square bridge and why its not in design, and freelance part and other in design is missing." Usability test: "need better idea." And over all of it: "All the design looks same. we need to show better way to user in all the idea from 1970."

**What was wrong:** every record was one template (a picture on top, a text box under it, the same figure). The box carried paragraphs. Impact's meters were filled by no real value. Card sort read the shared six-project list, so six projects and all of Design were missing.

**Rebuilt (uncommitted): the shared text box is gone; each record is a different piece of 1970s interface with its words inside it.**

| Record | Now | Its words |
|---|---|---|
| Why Kiruk | arcade court (Pong, 1972), unchanged in play | the round's line runs along the court's foot, as a game's message |
| About | a cassette (Walkman, 1979): the label names the moment, the tape passes from one reel to the other as the story goes on, the counter shows the year | a track list of all 13 moments and one line for the track playing; NOTES and FULL NOTES open the longer text only when asked |
| Empathy map | four panes around one figure (four-pane browser, 1977), a wire from each part of the figure to its pane | all four are on screen at once, inside their panes: the quote and skills, the beliefs, the stack, the motivations |
| Journey map | the climb, kept | a signboard in the open sky for the chosen ledge, tied to it by a dotted line |
| Impact | a high-score table (arcade, 1976–78): rank, score, what it counts, where it was earned | the table is the content; no meters, nothing counts by itself |
| Card sort | a card sorter: all 12 projects as punched cards, sorted on a chosen column, KIND or PLACE; the chosen card is read at full size on the right | the big card prints title, role, kind, place, time, description, stack, and the key to its work page |
| Usability test | a terminal form (green-screen forms, 1971) the visitor fills: to, via, address, what to expect, PF1 SEND; beside it the observer's log of the visitor doing the task | the form is the content; the log shows a running clock, three steps ticked as they are done, and the result |

- **Card sort data:** `home-model.ts` `CARDS` reads every project. KIND follows the role held: a project led as a designer sorts under Design (Square Bridge, PeopleGamez, Foodies Buddies, Desirable); the rest by medium. PLACE follows the job the project belonged to: Spera, HP, SNS Square, PeopleGamez, Freelance (Foodies Buddies, Desirable, PRAGS), Own (this site). The source data still tags Square Bridge and Foodies Buddies by medium (`web`, `mobile`), which is what /work filters on; that was not changed.
- **2026-11-10, the user: "Yes, fix source."** `src/data/portfolio-data.ts`: Square Bridge's `category` is now `design`. Every surface that groups by it follows (the /work tube's kinds, the other era desktops, `/work.md`). Evidence: typecheck clean; `/work.md` lists Square Bridge under `## Design` with PeopleGamez and Desirable. Then, "Yes, Foodies too": Foodies Buddies' `category` is `design` as well. Evidence: typecheck clean; `/work.md` lists both under `## Design`. The home and /work now agree on every project's kind; Mobile holds two HP apps.
- About opens on the track list (one line a moment) instead of a paragraph.
- Board cells: the About, Empathy, Impact, Card sort and Usability test cells play small versions of the new designs.
- Checked: typecheck clean · all five rebuilt records and Journey seen whole at the pane's size (1122×913) · Card sort with Square Bridge under Design and read on the big card.
- Not checked: Why Kiruk after the change to its message line · NOTES / FULL NOTES scrolling · PLACE sort · pressing PF1 SEND · the board's new small scenes · wide desk and phone widths.

- Ideas not built yet, for the user to choose from: a press makes the figure jump · the About walker carries the moment's object to the next landmark · the Pong keeps a best rally for the visit · weather that follows the visitor's local hour · the moth lands on the lit key and rests · a second critter on the status line.

---

*Round 1 road map, kept for its audit and seams:*
> Re-read the next unchecked step before each build step. Log every deviation in the drift log.

## Context

Ask, 2026-11-10: "We have worked on the era page for 1970, and I need to develop the landing page… blend visual design with terminal aesthetics so the art speaks for 1970." Then: "we are doing a redesign for 1970 whole page. not just changing the visuals. Its a entire page redesign. we need to think in all the aspects and make the best out of it."

References: hacktron.ai, every.to/p/how-codex-happened, are.na/max-maria/cyber-interfaces-and-lines.

Outcome wanted: a 1970 home that works as a landing page (who, proof, where to go) and whose art is at the level of the loader eye and the /work tube. Only the 1970 home; no other era.

## What the page is today

| Fact | Source |
|---|---|
| 1970 is the server default era, so this home is what first-time visitors and crawlers get | verified `src/app/layout.tsx:184` |
| The home is `TerminalHomePage`, picked by the `terminal` archetype | verified `src/components/era-shell/registry.tsx:60`, `src/data/era-archetypes.ts:35` |
| First screen shows: a tty status strip, a "UX RESEARCH FILE" header, an ASCII "KIRUK" banner, one faint framing sentence, and two links ("This Era", "Travel Eras"). The name and role are in a screen-reader-only `h1` | verified screenshot at 1024×768, `TerminalHomePage.tsx:139`, `:235` |
| No link to work, the story or contact in the first screen | verified same screenshot |
| The page is 4277 px tall at 1024×768: 5.6 screens | verified `document.documentElement.scrollHeight` |
| Order: why Kiruk, about (story box), empathy map, journey map, impact metrics, card sort (6 projects), progress link, work telescope, usability test (contact) | verified `TerminalHomePage.tsx:240-608` |
| The career is told twice: a 5-node journey table and the 13-beat story box | verified `era-page-content.ts:70`, `src/data/about-story.ts` |
| Projects appear here as 6 cards and again on /work (12 works, 3 full cases) | verified `era-page-content.ts:109`, `src/data/work-show.ts`, `content/work/` |
| Text: VT323 at 13–18 px, a glow `text-shadow` on all of it, secondary text at 40% and 22% alpha | verified `TerminalHomePage.tsx:44-48`, `:107` |
| The look is the trope rejected elsewhere: ASCII banner, box rules, typed commands | verified `.claude/skills/eye-ideation/SKILL.md` (rejected table), memory `work-era-pages-redesign` |
| The copy and facts are shared by every era home | verified `src/data/era-page-content.ts:1-15` |

## Questions & answers

| # | Lens | Question | Answer | Label |
|---|---|---|---|---|
| 1 | Why | What is wrong today? | The first screen does not say who he is or what he does, offers no next step, and the art is ASCII. Work sits four screens down. | verified (table above) |
| 2 | Why | What is the first job of the first screen? | Open | user-decision |
| 3 | Who | Who lands here? | First-time visitors on the default era: people checking him for a role or a project (the site has /hire and an entity page), peers who came for the craft, and crawlers. | inferred `src/lib/identity.ts`, `src/app/hire` |
| 4 | Who | What do they ask in the first ten seconds? | Who is this, what does he do, is he good, where do I go, how do I reach him. | hypothesis |
| 5 | Who | What did they see just before? | The loader eye in 1970 phosphor; entering floods black "so you land on the 1970 home's prompt". | inferred `docs/ERA_POV_PLAN.md:144` |
| 6 | What | Is the "UX research file" story kept? | Open | user-decision |
| 7 | What | Which sections stay? | Proposed: Subject (hero), Work (3 proofs), Story (About box), Timeline, Contact. Empathy map, card sort, skill tags, telescope and the progress link leave this page. | hypothesis until 6 is answered |
| 8 | What | Is About still an embedded box at `#about`? | Yes, a recorded decision. | verified memory `about-story-decision`, `EraStoryBox.tsx:59` |
| 9 | What | Are other era homes touched? | No. | verified the ask |
| 10 | Where | Which files own it? | `era-shell/archetypes/terminal/` (home and shell layer), `about-story/skins/Terminal1970.tsx`, `era-travel/specs/terminal.ts`. New code in `era-shell/archetypes/terminal/home/`. | verified |
| 11 | Where | Does the shared content file change? | No shape changes. The 1970 home picks from it, from `identity.ts` and from `work-show.ts`. New 1970-only lines live beside the home. | inferred |
| 12 | Today | How does the page sit under the nav? | Inside the eye frame: lids top and bottom, era years on the lower lid, columns tuck under the lid with `eyeDepth`. | verified `src/components/layout/eye-clear.ts` |
| 13 | Today | What else reads this page? | The loader's cornea reflects a capture of it (`public/eye/screens/1970.webp`, `npm run eye:screens`), and the page's brightness lights the loader eye. "This Era" draws a blueprint from `data-blueprint` ids. | verified `package.json:17`, `specs/terminal.ts`; inferred memory `page-is-the-light` |
| 14 | Today | What draws over the page? | `TerminalShellLayer`: scan lines, vignette, beam, flicker, on every 1970 route. | verified `TerminalShellLayer.tsx` |
| 15 | Constraints | What display does the art use? | A stroke-written vector display: the beam draws lines, vertices burn brighter, phosphor holds a trail, no scan lines. Different from the loader (phosphor pixels) and /work (character cells). | hypothesis, from the three references |
| 16 | Constraints | What is "visual" for this user? | Shader-grade rendering, not CSS dressing. | verified memory `work-era-pages-redesign` |
| 17 | Constraints | Mouse or keys? | Both. Pointer first (recorded for /work). Single keys are shown as bracket chips and work, because 1970's line is "it knows only keys". | inferred memory + `docs/ERA_POV_PLAN.md:41` |
| 18 | Constraints | Type? | Display lines drawn as strokes (Hershey font, 1967) on the canvas, with the real text in the DOM. Body in VT323 at 18 px or more, no blur, secondary text at 4.5:1 or better. | hypothesis |
| 19 | Constraints | Performance budget? | The `h1` is the LCP and paints from the server. The canvas loads lazily and never blocks input. It stops when hidden. | inferred memory `speed-insights-perf` |
| 20 | Constraints | Phones? | Calm: fewer lines, no pointer play, plain stacked windows, 44 px targets. | verified memory `mobile-ux-decision` |
| 21 | Risks | No WebGL2, or reduced motion? | A still picture drawn in 2D; content unchanged. | hypothesis |
| 22 | Risks | Does an eye in the hero repeat the loader and the nav frame? | Possible. An eye map as navigation was rejected for /work. The hero eye carries no navigation. Judged at the first checkpoint. | verified memory `work-showcase-decision`; unknown → step 4 |
| 23 | Risks | Does a darker or brighter page change the loader eye's light? | unknown → step 9 | unknown → step 9 |
| 24 | Risks | Can the live home break while this is built? | No: it is built at `/proto/1970-home` and swapped in at step 8. | inferred `src/proto/` pattern |
| 25 | Done | What proves it? | See done-criteria. | — |
| 26 | Structure | One screen, or scroll? | Open | user-decision |
| 27 | Art | What does the hero drawing show? | Open | user-decision |

## Layer stack

| # | Layer | Known | Unknown | Depends on |
|---|---|---|---|---|
| 1 | Literal ask | Whole-page redesign of the 1970 home; art that speaks for 1970; line art with terminal aesthetics | — | — |
| 2 | Outcome | A landing page that says who, proves it, routes, and is art | Which comes first | Q2 |
| 3 | User & moment | First visit, straight from the loader's black | Share of hiring visitors vs peers | — |
| 4 | Problem | First screen is silent; page is long and repeats itself; look is ASCII | — | — |
| 5 | Current state | See table above | — | — |
| 6 | Vocabulary | "Era page" = /work; "landing page" = home. "Record" becomes "figure". | — | Q6 |
| 7 | Data | `era-page-content.ts`, `identity.ts`, `work-show.ts`, `about-story.ts`, `public/eye/posters/1970-*.avif` | Which proofs and numbers lead | Q6 |
| 8 | Flow | Loader enter → black → page draws → read → one of: work, story, notebook, contact, another era | Scroll or one screen | Q26 |
| 9 | Structure | Home component, vector renderer, line field, sections, story skin | — | 7, 8 |
| 10 | Contracts | `#about` anchor; `data-blueprint` ids; `eye:screens` capture; `eyeDepth` under the lid; archetype registry | — | — |
| 11 | State | None persisted. Scroll position and the current figure only. | — | — |
| 12 | Failure & edges | No WebGL2, reduced motion, phone, slow GPU, hash load, keyboard only, screen reader | — | 9 |
| 13 | Constraints | LCP, INP, contrast, 44 px targets, no commits unless asked | — | — |
| 14 | Operations | Built in `/proto/1970-home`; swap is one import; old home stays in git | — | — |
| 15 | **Core idea** | The 1970 home is one stroke-drawn picture on a vector tube: the loader's eye as stacked scan lines, with Arun's name, role and one action beside it in the first screen, which redraws itself into each of the five figures of his research file as you scroll. | | |

## Seams

| Seam (A × B) | What crosses | Conflict? | Resolution | Owner |
|---|---|---|---|---|
| Loader enter × home first frame | black flood, then the page | A page that pops in fully lit breaks the hand-off | First frame is black; one beam line draws, then the picture rises (the tube's warm-up) | home |
| Home × cornea reflection | a capture of the page; the page's light | Capture goes stale; brightness may change the loader eye | Re-run `npm run eye:screens` for 1970 after sign-off; compare the loader before and after; ask before keeping | loader, with user |
| Canvas × nav eye frame | lid curves | Art and text can sit under the lids | Full-bleed canvas under the lids; text columns placed with `eyeDepth`; safe area from `--eye-lid-bottom-mid` as /work does | home |
| Vector display × `TerminalShellLayer` | scan lines over the page | Scan lines are raster physics; wrong on a stroke display | The shell layer skips scan lines and beam on the home route only | shell layer |
| Home sections × "This Era" blueprint | `data-blueprint` ids | Old ids vanish; blueprint draws nothing | Update `specs/terminal.ts` with the new regions in the same step as the swap | era-travel |
| `#about` × new layout | anchor and scroll margin | Story box moves; nav "About" must still land | Keep `EraStoryBox` and its id; test `/#about` cold | home |
| Shared content × 1970 cuts | `era-page-content.ts` | Other eras still use every record | No edits to shared shapes; 1970 selects | data |
| Single keys × form controls | key presses | A shortcut fires while the story box's selects have focus | Shortcuts ignore events from inputs, selects, buttons with their own keys, and any modifier | home |
| Canvas text × screen readers and crawlers | headline drawn in strokes | Invisible to both | Real `h1` and copy in the DOM; canvas `aria-hidden`; `IdentityFacts` stays | home |
| Line field × phones | density, motion | Thin lines beat against pixels; heat | Fewer, thicker lines; DPR capped at 2; still picture in calm mode | home |

## Direction (confirmed 2026-11-10)

- **Core idea:** see layer 15.
- **Chosen:**
  - **First screen:** art first with the facts beside it: name, role, one line, where, and one action, all real text (Hacktron's model).
  - **Story:** keep the research file as the frame, cut seven records to five figures. FIG. 1 Subject. FIG. 2 Work, three proofs (Spera, HP, this site). FIG. 3 Story (the About box). FIG. 4 Timeline. FIG. 5 Contact.
  - **Structure:** one fixed drawing behind the page that changes as you scroll, content in wire-frame windows the lines pass behind (Every's model). About five screens.
  - **Hero:** the real 1970 eye as stacked scan lines (a ridge plot, as in the 1970 pulsar chart), with leader-line callouts for the facts. It becomes terrain for the timeline, frames for the work plates, and one flat line for contact.
  - **Display:** stroke-written vector tube in WebGL2; three line weights; at most five bright points on screen.
  - **Type:** stroke display type on the canvas, VT323 body at 18 px or more.
  - **Keys:** `[W]` work, `[A]` about, `[N]` notebook, `[C]` contact, `[E]` eras, shown as chips that are also buttons.
- **Rejected:**
  - Do nothing — the first screen stays silent and the art stays ASCII.
  - Make what exists findable (add name, role and links above the banner) — fixes the silence, leaves the length, the repeats and the look.
  - Restyle only (the first pitch: new hero art over the same seven records) — the user asked for the whole page.
  - A console of scopes on one screen — too close to the /work board.
- **Non-goals:** other era homes; the loader eye; /work; the nav frame; new copy for the shared content file; any commit.

## Done-criteria (written before step 1)

- [ ] At 1440×900 and 390×844 the first screen shows name, role, one sentence and one primary action as DOM text, and the `h1` is visible — check: `read_page` + one screenshot each — evidence:
- [ ] Work proof is on screen within one scroll screen or one key press from the top; each of the three proofs links to its `/work/<id>` — check: click through — evidence:
- [ ] Page height at 1440×900 is 5 screens or fewer (scroll road), or exactly 1 (one-screen road) — check: `scrollHeight / innerHeight` — evidence:
- [ ] Body text contrast 7:1 or better, secondary 4.5:1 or better, nothing under 14 px, no blur on body text — check: computed styles — evidence:
- [ ] Every action works by pointer and by keyboard; focus is visible; shortcuts do not fire inside the story box's controls — check: keyboard pass — evidence:
- [ ] Reduced motion: no drawing or morph animation, same content — check: emulate, screenshot — evidence:
- [ ] No WebGL2: a still picture, same content, no errors — check: disable context, console — evidence:
- [ ] 390 px wide: no sideways scroll, targets 44 px or more — check: resize, measure — evidence:
- [ ] The `h1` is the LCP and paints before the canvas chunk loads; the canvas stops when the tab is hidden — check: performance trace on a local build — evidence:
- [ ] `/#about` loaded cold lands on the story box — check: navigate, measure offset — evidence:
- [ ] "This Era" blueprint shows the new regions — check: open the module — evidence:
- [ ] Entering from the 1970 loader: black, then the first line; no flash — check: watch one enter — evidence:
- [ ] `npx tsc --noEmit` passes — evidence:
- [ ] User verdict on the composed hero frame — evidence:

## Build order (base-up, one verifiable layer per step)

- [x] 0. Proto route `/proto/1970-home`; the live home is untouched — evidence: route renders, `src/app/proto/1970-home/page.tsx`
- [x] 1. Data: `home/content.ts`, hero facts and actions only so far (proofs, timeline and contact come with step 5) — evidence: `npx tsc --noEmit` clean
- [x] 2. Vector tube renderer `home/vector-tube.ts` (beam profile, slower beam = brighter, joints burn brighter, persistence, two blooms, draw-order reveal) and a flat 2D fallback in `signal-field.ts` — evidence: renders in the proto, no GL errors (`gl.getError() === 0`); the 2D fallback is written but not run
- [x] 3. Line field `home/signal-field.ts`: the 1970 poster sampled into traces with hidden-line removal, a blink from the shut poster, the trace under the pointer — evidence: screenshot at 1440×900. Only the eye state exists; the other states and the morph come with step 5
- [x] 4. Hero, one composed frame: art, stroke-lettered name, leaders, status strip, key chips — evidence: screenshot at 1440×900 and 375×812; `h1` text "Arun Kumaar Sreenivasan"; smallest text 14 px; four actions 44 px tall; no sideways scroll at 375 → **checkpoint, waiting on the user**
- [ ] 5. Sections: work plates, story skin, timeline, contact
- [ ] 6. Interaction: keys, hover, pointer
- [ ] 7. Edges: reduced motion, no WebGL2, phones, accessibility pass
- [ ] 8. Swap into the registry; shell layer opt-out; blueprint spec; remove dead code
- [ ] 9. Loader seam: hand-off, then `eye:screens` for 1970 with a before/after — **checkpoint**
- [ ] 10. One proof run against the done-criteria; typecheck

## Checkpoints (user decides before work continues)

- Before step 0: the four open decisions (first job, story, structure, hero subject).
- After step 4: does the hero read as 1970 line art at a glance, and does the eye belong here?
- After step 9: keep the new cornea capture, or tune the page's brightness first.

## Watch list (hypotheses still open)

- Visitors' first-ten-second questions (Q4) — confirm by the user's own read of the hero — status: open
- Stroke display is the right physics for the home (Q15) — confirm at the step 4 checkpoint — status: open
- Hershey stroke type reads well at headline size (Q18) — confirm at step 4 — status: open
- Three proofs are Spera, HP, this site (Q7) — confirm with the user at step 5 — status: open
- Phones: the text window covers most of the eye at 375×812 — fix in step 7 (fit the eye in the space above the window) — status: open
- The proto page is 60 px taller than the screen with only the hero in it — find the source in step 5 — status: open
- The Browser pane, while hidden, runs animation frames only on demand; judge the draw-in and the blink in a visible window — status: open

## Drift log

| Date | What changed | Why | Approved by |
|---|---|---|---|
| 2026-11-10 | Stroke type is the home's own font on a 4 × 6 grid (`home/stroke-font.ts`), not Hershey | The Hershey glyph tables are not in the repo and were not to be retyped from memory; same physics, straight strokes | pending, shown at the step 4 checkpoint |
| 2026-11-10 | The name is lettered as an SVG of strokes inside the `h1`, with the text itself screen-reader-only in the same `h1` | A pixel font for the name on a stroke tube mixed two displays; the lettering is the visible heading | pending, same checkpoint |
| 2026-11-10 | Beam intensity follows the picture as well as the height (a scope's Z input) | Height alone turned the iris into a crater and lost lids and lashes | pending, same checkpoint |
| 2026-11-10 | `TerminalShellLayer` is wrapped in a `data-terminal-shell` element (step 8's opt-out, done early) | The scan lines sat over the proto too | — (inside scope) |
| 2026-11-11 | About: the cassette gains a walker, inside its window, on the tape between the reels, through a place for each track; on a wide stage the cassette is up to 22 rows tall (was 15) to hold him | The user: "a guy walking with each phase… the background of that time… he walks on top of this tape" | the user picked the band from two renders, then: "keep it inside the tape and make it better" |

## Close & retro

- Done-criteria:
- Retro:

### Live (2026-11-10)

**The user: "apply this in the code and lets make it."** The tube home is now the 1970 home at `/`.

- `era-shell/registry.tsx`: the `terminal` archetype's home and its prefetch load `archetypes/terminal/home/Home1970`. `archetypes/terminal/index.ts` exports `Home1970`.
- `archetypes/terminal/TerminalHomePage.tsx` (the teletype home) is deleted. `TelescopeBox` stays: other code still uses it.
- `/proto/1970-home` is removed; `/` is the one place it lives.
- `era-travel/specs/terminal.ts`: the "This Era" blueprint now draws the tube's board (head, SUBJECT, records grid, dossier, status line). The tube is a canvas, so there are no DOM markers to snap to; the spec fractions are the geometry.
- `/#about` opens the About record on a cold load, from the nav's About link, and when the hash changes under a mounted home (the `hashchange` listener was missing; fixed).
- The cassette's reading keys wrap under it on a narrow tube instead of running into the track list.
- Checked: typecheck clean · `/` after the loader shows the tube board with the `h1` and the `#about` section in the mirror · `/#about` reloaded opens the cassette · no console errors.
- **Recaptured (user: "Yes, recapture"):** `node scripts/eye-screens.mjs <chrome> http://localhost:3050 1970` wrote `public/eye/screens/1970.webp`, 768×432, 49 KB (was 768×1296 of the teletype page; the tube home is one screen, so the capture is one viewport). The old file is kept in the session scratchpad as `1970-before.webp`. `three/eye/look.ts` `ERA_REFLECT_KEY["1970"]` moved from the KIRUK banner (290, 210, 540) to the board (384, 200, 640). Not seen in the loader: the preview pane does not draw the WebGPU eye, so judge the cornea in a real window.
- Not checked: the "This Era" blueprint drawing itself · phones · the work tube after the shared exports (typecheck only).

### About walk (2026-11-11)

**The user, on the About record:** "keep it the page moves in the bottom and a guy walking with each phase. Showing with the background of that time to show and the tape get changes like this animation but he walks on top of this tape."

- Two layouts were built and shown as renders: (1) he walks on the tape inside the cassette's window; (2) the tape runs out into a band under the deck and he walks there. The user first picked 2, then said **"keep it inside the tape and make it better."** Built: 1, improved. The band is removed.
- The window: the cassette is up to 22 rows tall on a wide stage, its window nearly its full width. The reels sit up in the window's top corners (they still trade tape as the story goes on and wind on a change); the tape comes down from each pack round a guide and runs along the window's floor, and that floor is what he walks on. Each place is drawn as big as fits under and between the reels; the reels are drawn over its edges, ringed in black.
- Depth (the "make it better"): behind each place, a far line in checkerboard (hills, or rooftops with a lit window or two for the city tracks: teaching, PeopleGamez, Square Bridge, HP, Spera) moving at a third of the tape's speed, and a sky moving slower still (three clouds drifting, or stars for the lockdown night). During a change each side of the splice keeps its own far line and sky.
- `home/home-backdrops.ts` (new): a place for each of the 13 tracks, on a 64 × 36 block grid, standing on the tape. Each comes from its own track's title, place and line: the house of thirty (two floors of windows, people at them, one lit warm); critiques over tea (easel painting itself in, two tea glasses steaming, a "…" critique, yarn and hook); bug reports for biryani (the uncle's ERP screen with a bug crawling its rows, a sketched notebook, a steaming pot); the first paycheck (three posters, the clients' screen, a coin rising and turning); Sona (columns, steps, flag, a code screen and a sketchbook); the campus crew (stage, curtains, two lights searching, three of the crew, the redone site and the medical app); lockdown games (window onto the night, two on the floor, the phone with a game and the store's triangle, a pad); writing it down, teaching it (a board filling with components, two rows of heads, a hand going up); making HR playful (a form on a laptop with an XP bar, star, coin, heart, trophy); Square Bridge (a bridge of squares, three on it, screens stacking); HP (a lit tower, the HP Print AI printer with a page and a spark); Spera (two screens for design and frontend, mug, plant, Spera's mark); off hours (mountains, the light over them, birds, a ukulele with a note, the weirdest thing on the menu wobbling).
- `home/home-scenes.ts` `about()` / `walkOn()`: he is the file's own figure (the terminal-headed one), a black edge round him so he reads over what he passes. The tape under him is a ribbon with splice marks that run by. At rest he strolls (the tape crawls under him) and every nine seconds stops for a moment to look at the pointer, and waves if it is near. Changing track (keys, ◀ ▶, a row): the reels wind for 1.6 s, the tape runs fast, the old place slides off and the new one slides in, in 16 steps; the splice between them goes by under his feet with a dotted seam and the new year on a warm post; dust when he lands. Stepping back runs it all the other way and he faces left. Opening the record, he walks into the first place.
- Reduced motion (`t` 0): he stands, nothing slides, the new place is there at once.
- Unchanged: the label, counter, track list, TRACKS / NOTES / FULL NOTES, their zone ids and keys, the board's mini cassette, the other six records.
- Checked: typecheck clean · all 13 places rendered on `/` at 1440 × 1100 (first window version) · the final window at rest (2014) and mid-change 2014 → 2018 with hills, clouds and the year post (screenshots) · FULL NOTES opens the long text beside it.
- Not checked: reduced motion live (reasoned from `t` 0 only) · a narrow tube · phones. The preview pane was hidden, so its frames lagged; judge the motion in a visible window.
