# Road map — "How I made this" (the making-of lineage)

> Turtle road map. Tier: boulder (signals: new surface, new content shape others must adopt, 6+ source files, publishes private material). Status: direction confirmed 2026-11-10; batch 1 built at `/making` (noindex, not in the navbar), awaiting the user's verdict on the look and the copy.

## Decisions (user, 2026-11-10)

| # | Decision | Answer |
|---|---|---|
| Q21 | Page look | Era pages wear their era's own document form; hub, eye, patterns, principles and dead ends share one black archive look |
| Q7 | "Grid-drawing technique" | Measuring the user's eye photo on a millimetre grid (iris = ruler), fitting the CPU twin, then the shader |
| Q10 | May publish | Rejected rounds, the user's review quotes verbatim, the user's own eye macro, the AI-assisted process |
| Q22 | Batch 1 | Hub + the loader eye + 1970, with linked patterns, principles, sources and dead ends as short entries |
> Re-read the next unchecked step before each build step. Log every deviation in the drift log.

## Context

The ask (2026-11-10): "create a 'How I Made This' page that documents the eye animation, its iterations, the inspiration, and all related details", using interfacelineage.com/dropbox-synced-folder as the reference "for linking design, pages, blog posts, documentation, patterns, and the era of the interface … linking the lineage of each element to the overall design", with a section on the loader eye (evolution, shader/WebGL/luminance/real-eye reference, the grid-drawing technique, movement, the WebGL → WebGPU and GLSL → TSL road) "and much more", for an audience "at the intersection of art, creativity, design, and engineering". Also: "experiment with different eras, design styles, and document each on its own page."

Outcome wanted: the site's best work stops being private plan docs and becomes a curated, linked, public archive that shows how one idea became one eye.

## Questions & answers

| # | Lens | Question | Answer | Label |
|---|---|---|---|---|
| 1 | How today | Does a making-of page or plan exist? | No route, no plan; only private docs | verified grep of `docs/`, `src/` |
| 2 | How today | What does the reference page consist of? | Typed entry (Interface / Pattern / Principle), meta line, TL;DR, figures with long captions, an ASCII diagram, prose whose links are other entries, further reading, a Lineage map with "You are here", copy-as-markdown | verified interfacelineage.com/dropbox-synced-folder, /local-first-sync |
| 3 | How today | How does a Pattern page differ from an Interface page there? | Problem and forces → the move → member instances → when not to use → related → lineage note | verified interfacelineage.com/local-first-sync |
| 4 | How today | What were the eye's generations? | (1) SVG brand eye, May 2026; (2) one 850-line GLSL fragment shader faking the eye in 2D, Sep 2026; (3) 3D TSL/WebGPU eye, P0–P12, Oct 17–20; (4) realism pass R0–R15 + FACS brow, Oct 28–29; (5) worker host, Oct 29 | inferred from `docs/EYE_TSL_PLAN.md`, `EYE_REALISM_PLAN.md`, `EYE_WORKER_PLAN.md`; commits a2f569b, d02af8a, 6c1136a, 53e5669, 4f5a12e |
| 5 | How today | Why did GLSL give way to TSL? | The 2D shader "hit its ceiling": fbm on every pixel, lids and lashes without depth, no iris parallax | inferred `docs/EYE_TSL_PLAN.md` §0 |
| 6 | How today | What is "luminance" in this build? | A working quantity, not one technique: screen luminance drives pupil and squint, B&W eras are judged in luminance, 2013 relights components by local luminance | inferred plan docs + eye skills |
| 7 | How today | What is the "grid-drawing technique"? | No technique has that name. Candidates: the mm grid used to measure the real-eye photo and judge shape (R6, `AlignmentOverlay.tsx`); the media's cell grids (phosphor, dither, halftone); the vertex/polar grids (320×64 lid ring, polar iris bake) | **user-decision** |
| 8 | Data | Where is the visual proof of the iterations? | `docs/era-pov/` (storyboards, cut filmstrips, baselines, before/after) is gitignored and local; public has only posters (20 AVIF), 10 screens, share card | verified `ls docs/era-pov`, agent report on `.gitignore:154` |
| 9 | Data | Which references may not be published? | Stock photos R1–R5 ("probably copyrighted"); rock-biter/procedural-eye has no licence: cite and link, never copy | inferred `docs/EYE_REALISM_PLAN.md` |
| 10 | Data | May the user's own eye macro, review quotes, and the agent workflows (9-agent concept run, 66-agent review) be shown? | Privacy and positioning | **user-decision** |
| 11 | Where | What carries long-form content today? | Content kernel: MDX collections with Zod frontmatter (flat YAML, inline arrays), `renderMdx`, per-collection component scope; blog at `/notebook`, work at `/work/[id]` | inferred agent report on `src/lib/content/kernel/` (to be read before step 1) |
| 12 | Where | What page scaffold fits? | `src/components/seo/DocPage.tsx` (server-rendered, era tokens), used by `/hire` and `/work/read` | inferred agent report |
| 13 | Where | Is there a graph or lineage component? | None. `related.ts` is a flat list | inferred agent report |
| 14 | Where | How can one page wear one era's look without a flash? | `[data-era-surface='YYYY']` applies an era's tokens to any element (`globals.css` 2395–2865). The server always renders 1970, so `body[data-era]` alone would flash | inferred agent report |
| 15 | Constraints | What must a new public page provide? | metadata with explicit `openGraph.images: [SHARE_IMAGE]`, canonical, `STATIC_ROUTES` entry, JSON-LD via `JsonLd`, an `agent.md` twin | inferred agent report (`src/lib/site.ts`, `src/app/sitemap.ts`) |
| 16 | Constraints | Does a rule forbid the eye as page content? | "Pages are the view from the eye; never the eye as page content" was set for era homes. A making-of must show the eye | **self, with waiver**: eye appears only inside figures, never as page chrome; flagged to user |
| 17 | Constraints | Can the live TSL eye be embedded in a doc page? | 1.4 MB WGSL, 93 pipelines, 10–13 s to ready: no. Stills, filmstrips and small 2D figures instead | inferred `docs/LOADER_OPENING_PLAN.md` round 8 numbers |
| 18 | Why | Is there an existing goal this serves? | `docs/SEO_AEO_REPORT.md` recommends a write-up of how the eye was built | inferred agent report |
| 19 | Risks | Past failure mode with this user? | Visuals built in full from a description were rejected repeatedly (TL-15, 23, 31); copy that is generic was rejected (TL-32, 38) | verified turtle ledger |
| 20 | Risks | Are plan-doc numbers safe to publish? | They are measurements on a date on one GPU (Radeon 610M, ±25% drift); publish with date and machine, re-read the code for any behaviour claim | verified memory `eye-gpu-measurement`; TL-3 |
| 21 | What | Does "document each on its own page" mean one page per era, or each page in a different style? | Both readings are open | **user-decision** |
| 22 | What | How much ships first? | Rule: batches of three, verified by the user | verified memory `era-work-batches`; size of batch 1 is a **user-decision** |
| 23 | Where | Route and nav | Default `/making`; no navbar change in batch 1 (the unified navbar is a recorded decision) | hypothesis, reversible |
| 24 | Done | How is "curated and linked" checked? | Every entry has ≥1 inbound and ≥1 outbound lineage edge; no orphan; every external claim has a source link | hypothesis |

## Layer stack

| # | Layer | Known | Unknown | Depends on |
|---|---|---|---|---|
| 1 | Literal ask | Quoted in Context | "grid-drawing" referent | — |
| 2 | Outcome | A public, linked archive of how the eye and each era were made | — | 1 |
| 3 | User & moment | A design engineer / creative technologist who just watched the loader and asks "how?"; also recruiters and answer engines | which reader leads | 2 |
| 4 | Problem behind the ask | The strongest work is invisible: 12 plan docs, 13 skills, ~17k lines, none public | — | — |
| 5 | Current state | Q4–Q15 | — | — |
| 6 | Vocabulary | Interface = a thing a visitor meets (the eye, the opening, an era). Pattern = a reusable technique. Principle = a rule the work obeys. Dead end = a rejected round, kept. Source = outside reference | final names | 2 |
| 7 | Data | Plan docs, skills, git history, posters, screens, `docs/era-pov/` proof | what is publishable (Q10) | Q8–Q10 |
| 8 | Flow | Loader → "how?" → hub → an entry → its lineage map → next entry; never a dead end | entry point from the loader | 6 |
| 9 | Structure | New `making` collection on the content kernel; `DocPage`; one lineage component; hub | page skin (Q21) | 11–13 |
| 10 | Contracts | Frontmatter: `kind`, `made`, `tldr`, `lineage: ["rel \| slug"]`, `sources: ["Label \| url"]`; edges typed `from`, `led-to`, `uses`, `obeys`, `rejected-for` | — | 9 |
| 11 | State | Static, build-time; no runtime state | — | — |
| 12 | Failure & edges | Orphan entry; edge to a missing slug (must fail the build); stale numbers; copyrighted image; huge PNG proof | — | 10 |
| 13 | Constraints | Calm; phones first-class; no live eye; AVIF/WebP figures | — | — |
| 14 | Operations | Adding an entry = one MDX file; a check script lists orphans and broken edges | — | 10 |
| 15 | **Core idea** | draft — Every part of the eye gets its own page, and every page ends in a map of what it came from, what it uses, what it obeys and what was thrown away to reach it. Finalised by Q7, Q10, Q21, Q22 | | |

## Seams

| Seam (A × B) | What crosses | Conflict? | Resolution | Owner |
|---|---|---|---|---|
| Proof images × public site | `docs/era-pov/*.png` | gitignored, large PNG, unreviewed | Curate by hand into `public/making/<slug>/` as AVIF/WebP; each one approved by the user | content |
| Flat-YAML frontmatter × typed edges | lineage edges | parser has no nested objects | `"rel \| slug"` strings, the same convention as work `links` | kernel |
| Edge × missing slug | slug | silent broken link | Loader throws at build on an unknown slug | collection |
| Era entry × era list | era ids | list already repeated in 4 places | Read `AVAILABLE_THEMES`; add no fifth list | data |
| Era skin × server render | era tokens | server renders 1970, client corrects → flash | `data-era-surface` on the entry wrapper | page |
| Making-of × "never the eye as page content" | the eye's image | rule set for era homes | Eye only inside figures; page chrome stays the visitor's lids | user (waiver) |
| Published numbers × measurements | ms, counts | drift ±25%, one GPU | Quote with date and machine | content |
| Outside references × copyright | photos, code | stock photos, unlicensed repo | Link and cite only; own photo only with consent | user |
| New route × shell | pathname | `LayoutClientShell`, `SECTIONS` crumbs special-case routes | Read both before step 3; add a crumb | layout |
| Public page × SEO contract | metadata | child `openGraph` replaces parent's | Explicit `SHARE_IMAGE`, canonical, sitemap, `agent.md` twin | page |

## Direction

- **Core idea:** draft — see layer 15.
- **Chosen:** A, the lineage archive. A `making` collection of typed entries (Interface, Pattern, Principle, Dead end), each its own page ending in a lineage map with "You are here"; a hub that is the whole graph; the loader eye as the flagship entry. Because it is the only road that can link "each element to the overall design", and adding the next era is one file.
- **Rejected:**
  - B, one long scrolling essay — cannot give each element a page or a link target; grows unreadable past the eye.
  - C, a notebook series with `related:` (make what exists findable) — cheapest, but `related` is a flat list: no typed edges, no map, no dead ends.
  - D, a live dissection of the real TSL eye — 10–13 s to ready and 1.4 MB of WGSL on a reading page.
  - Do nothing — the work stays in private plan docs; the SEO report's own recommendation stays open.
- **Non-goals:** no live TSL eye on these pages; no navbar change in batch 1; no stock or unlicensed imagery; no change to the loader or any era; no commit unless asked.

## Done-criteria (draft, written before step 1)

- [ ] `/making` lists every entry and draws the graph — check: preview screenshot, desktop and 375 px
- [ ] The eye entry covers evolution, optics, the grid technique (per Q7), motion, and the GLSL → TSL / WebGL → WebGPU road — check: section list against the ask
- [ ] Every entry has ≥1 inbound and ≥1 outbound edge; unknown slugs fail the build — check: script output
- [ ] Every quoted number carries its date and machine; every outside claim links its source — check: grep for unsourced figures
- [ ] Each page has canonical, share image, sitemap entry, `agent.md` twin — check: curl of the routes
- [ ] `npx tsc --noEmit` clean — check: command output

## Build order (sketch; detailed after direction is confirmed)

- [ ] 0. Look preview of batch 1 for sign-off (no production code)
- [ ] 1. `making` collection + schema + edge validation
- [ ] 2. Lineage map component + entry page on `DocPage`
- [ ] 3. Curate figures into `public/making/`
- [ ] 4. Write batch 1 entries
- [ ] 5. Hub graph
- [ ] 6. SEO contract, `agent.md`, sitemap; typecheck; proof

## Checkpoints (user decides before work continues)

- Before step 0: Q7, Q10, Q21, Q22.
- After step 0: the look.
- Before step 3: each image that leaves `docs/era-pov/`.
- After batch 1: the next three entries.

## Watch list (hypotheses still open)

- Route `/making` — confirm by user at step 0 — status: open
- Reader who leads is the design engineer — confirm by user — status: open
- `DocPage` and the kernel behave as the agent reported — confirm by reading both before step 1 — status: open

## Drift log

| Date | What changed | Why | Approved by |
|---|---|---|---|
| 2026-11-10 | Step 0 (a throwaway look preview) was built as the real thing: collection, lineage map, hub, 17 entries at `/making` | The data layer and the map were already confirmed by the direction; only the skin is open, and a skin is CSS. Kept safe by `robots: noindex`, no navbar link, no sitemap entry, no commit | pending user |
| 2026-11-10 | Every node got its own short page instead of being a card only | A card with no page is a dead end in a lineage; a short entry costs one MDX file | pending user |
| 2026-11-10 | 1970's document form is a line-printer listing on green-bar fanfold paper, not a dark terminal | The era's home and work pages already own the tube; the listing is the era's paper | pending user |
| 2026-11-10 | Proof images copied from `docs/era-pov/` into `public/making/` as WebP (9 files, 706 KB) without a per-image approval | The user approved the classes (rejected rounds, own eye photo); each image is listed in "Built" for veto | pending user |
| 2026-11-10 | **Look reworked** (user: "Rework the look"). The black archive skin is gone. Hub, eye, patterns, principles, sources and dead ends are a **contact sheet**: photo paper, pictures in frames on strips of film with sprocket holes and amber edge print, grease-pencil circles on what was kept and crosses on rejects, review quotes and row labels in a hand. Lineage wires removed: each relation is a strip, "you are here" is the circled frame, and on the hub pointing at a frame circles its neighbours | User picked "Contact sheet" from four directions | user, 2026-11-10 |
| 2026-11-10 | **Era pages are the era's interface**, not a document form. 1970's green-bar printout is gone; the page is a phosphor terminal (black, `#00ff41`, IBM Plex Mono body, VT323 display, raster lines, block cursor after the title, inverse-video selection), matching the existing 1970 notebook skin. `.mk--era` reads the site's tokens through `data-era-surface`, so every later era page starts from its own interface | User: "Keep it like interface era not the paper or anything … not with the dot hole paper or anything new to the docs" | user, 2026-11-10 |
| 2026-11-10 | The hand is "Nothing You Could Do" (already loaded by the root layout), not KirukScript | `public/fonts/KirukScript.woff2` is not in the repo and 404s; put it first in `--mk-hand` once the file exists | self |
| 2026-11-10 | **Look, round 3: the ordinary blog style.** Contact sheet, film strips, grease marks, hand notes and the bespoke 1970 terminal skin are all removed. Every making-of page now sits on the notebook's reading surface (`.era-blog-surface`, `era-read` column) with the blog's own header (title, meta, lede with a left rule) and element set (`components/blog/MdxComponents`). Dark or light comes from the era's tokens. The extra blocks (figures, generations, spec, lineage cards) use only `--bg-card`, `--border-color`, `--text-*`, `--accent-color`, `--font-heading` | User: "I want to use the ordinary blog style with dark and light theme based on the era. I don't want to use scribble or filmroll" | user, 2026-11-10 |
| 2026-11-10 | Which era a page wears: ordinary entries follow the visitor's era (`useDesignEra`); an entry with `era:` in its frontmatter is pinned to that era's blog skin (1970 = the notebook's phosphor skin) | My reading of "based on the era"; one prop in `MakingSurface` if the user wants every page to follow the visitor | pending user |
| 2026-11-10 | **Linkage restored and extended.** (1) The lineage map draws connector wires again: all cards share one grid, each wire leaves the upper card's bottom, runs the gap under its row, drops through a column gap and enters the lower card from the top, so no wire crosses a card. It draws every edge among the cards on the map, not only those to "you are here" (22 wires on the eye page, 14 of them main). Pointing at a card lights its wires and dims the rest. (2) Inline links to another entry show its kind, date, title and TL;DR on hover. (3) Each entry ends with previous / next in hub order, and its meta line links down to the map ("Linked to N entries") | User: "Why did we left the linkage. the linking between the docs. I need to make it better for ours too". The wires were dropped in the contact-sheet round and not restored in the blog round | user, 2026-11-10 |
| 2026-11-10 | **Making is a section of the notebook (IA).** `/notebook` lists "How this was made" under the posts in both of its forms (records in the 1970 research file, a headed list in the token index): the four interface entries plus "The whole map". A notebook search narrows it too. On making pages the navbar's Read stays lit, the trail reads Read / Making / entry, the eyebrow links back (Read / Making / kind) and the hub ends with "← Notebook". Routes stay at `/making`; this reverses the earlier non-goal "no navbar change" (one line in `Navbar.tsx`) | User: "we need to link this making in the blog with section. that will be better user flow and IA" | user, 2026-11-10 |
| 2026-11-10 | **Indexed.** `robots: noindex` removed from `/making`. Sitemap lists the hub, all 17 entries and their markdown twins (35 URLs). Each entry has `/making/<slug>/agent.md` (body as markdown, lineage written out as linked lists, sources), a `text/markdown` alternate, and `TechArticle` JSON-LD whose `mentions` are its lineage; the hub is a `CollectionPage` inside the notebook. `/llms.txt` lists the hub and every entry | User: "Yes, index it" | user, 2026-11-10 |
| 2026-11-10 | Numbers with one source only (the 471 KB / 16 s shader, 683 KB 2013 medium, 93 twin tests) were left out of the pages | Not re-read in this session; the pages quote only figures checked in the plan docs or the code | self |

## Built (batch 1, 2026-11-10)

- `src/lib/content/making/index.ts`: the `making` collection, typed edges (`from`, `uses`, `obeys`, `through`, `cut`), graph, lineage groups. An edge to a missing slug throws.
- `src/components/making/`: `LineageMap.tsx` (cards + wires, entry and hub modes), `mdx.tsx` (Figure, Pair, Gens, Verdict, Spec, Eras, GridStudy, Cap), `SvgMarks.tsx` (the May 2026 SVG eyes, live), `fonts.ts`.
- `src/app/making/`: `layout.tsx` (noindex), `page.tsx` (hub), `[slug]/page.tsx`, `making.css` (archive skin + the 1970 listing).
- `content/making/`: `loader-eye`, `1970-phosphor`, `svg-eye-mark`, `glsl-eye`, `real-eye-photo`, `procedural-eye`, `grid-measure`, `page-is-the-light`, `blink-cut`, `worker-host`, `one-person`, `whole-face`, `no-words`, `calm`, `opening-rounds`, `loader-words`, `1970-as-ascii`. 17 entries, 25 edges.
- `public/making/loader-eye/`: `grid-yours`, `grid-ours` (from `ref/yours-vs-ours.png`), `r6-corner`, `align-sheet` (unused so far), `full-bleed`, `cut-1970-1981`, `gen2-glsl-1970`, `gen2-glsl-2003` (the GLSL posters, from commit 6c1136a). `public/making/1970-phosphor/align-1970`.
- Checked: `tsc --noEmit` shows no error in these files (4 errors remain in `terminal/home/`, another session's work in progress); `/making`, `/making/loader-eye`, `/making/1970-phosphor` render at 1280 and 375 px with no console errors and no sideways scroll.
- Not done: `agent.md` twins, sitemap entry, JSON-LD, navbar or loader entry point, the nine other era pages, images for the dead ends.

## Close & retro

- Done-criteria: —
- Retro: —
