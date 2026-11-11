# Road map — Read as a directory

> Turtle road map. Tier: boulder (signals: reworks an existing surface, new shelf, shared layout others must adopt, 6+ source files). Status: direction confirmed 2026-11-10; step 0 (the Read home on the new shell) built at `/notebook`, awaiting the user's verdict on the look before the shell goes onto every page.
> Follows docs/MAKING_OF_PLAN.md. Re-read the next unchecked step before each build step. Log every deviation in the drift log.

## Context

The ask (2026-11-10): "for the reading page, we have the life/blog and how this was made and I need to add work (read as pages too). I'll add the work experience and how I have worked on the workflow and the design and engineering process too. I need to rework on the read main page and I need to link with https://press.fumadocs.dev/ and make it workflow for overall and make it directory and works clean overall … take inspiration from https://skills.wheresryan.sh/anatomy … refer emil and other to make it best way possible with our touch. and add skills to make it better."

Outcome wanted: Read stops being one list with a section bolted on and becomes a directory of shelves (Life, How this was made, Work) with one clean, docs-grade reading layout, so a visitor always knows where they are and what else is on the shelf.

## Decisions (user, 2026-11-10)

| # | Decision | Answer |
|---|---|---|
| Q8 | Engine | No Fumadocs or Fumapress. Build it ourselves on the content kernel; use mdxcn (mdxcn.dev, text-drawn MDX figures copied into the repo as source) in our own design, with better components |
| Q9 | Skills | Both: a project skill that holds Read's rules, and a public Skills shelf as a fourth shelf |
| Q10 | Work shelf | Existing project reading pages and the three cases, plus two drafts for the user to edit: Experience, and How I work |
| Q11 | 1970 Read home | One layout in every era; the era changes only colour and type. The research-file index is replaced |

## Questions & answers

| # | Lens | Question | Answer | Label |
|---|---|---|---|---|
| 1 | How today | What is on Read now? | `/notebook`: 1 post (`content/blog/life/variation-keeps-me-alive.mdx`), then "How this was made" (4 interface entries + map link). Two forms: the 1970 research file (banner left, records right, gaze titles) and a token index | verified `src/components/blog/BlogListClient.tsx`, screenshot from the user |
| 2 | How today | Does "work, read as pages" exist? | Yes, partly: `/work/read` (index by kind) and `/work/<id>/read` on `DocPage`, plus `/work.md` and `agent.md` twins; 3 case MDX files in `content/work` | verified `src/app/work/read/page.tsx`, `ls content/work` |
| 3 | How today | What is Fumapress? | "The composable site generator powered by Fumadocs": Markdown to docs, blogs, changelogs, with theme and search. Its docs are `/docs/waku` and `/docs/astro` only | verified press.fumadocs.dev (title, description, link list) |
| 4 | Constraints | Can Fumapress run inside this site? | Not as is: this site is Next.js 15; Fumapress targets Waku and Astro. Fumadocs' own libraries are Next-first | inferred from Q3 + `package.json` (next ^15.5.7) |
| 5 | How today | What does the anatomy reference do well? | Left rail: site pages, then numbered sections of the page. Centre: title + one-line pitch, thumbnail strip, meta row, prose. Right margin: footnotes and figure hints. Sections numbered; quiet type; figures large | verified skills.wheresryan.sh/anatomy + user's screenshot |
| 6 | Where | What does a making entry already give this? | Reading surface on blog tokens, lineage map with wires, link previews, prev/next, `agent.md`, JSON-LD | verified this session |
| 7 | Constraints | Recorded decisions this must not reverse | Ordinary blog style, dark or light from the era, no new visual metaphors; linkage between docs is the point; making is a section of the notebook; routes `/making` are indexed | verified memory `making-of-lineage` |
| 8 | What | How should "link with Fumapress" be done? | Three roads, different stacks | **user-decision** |
| 9 | What | What does "add skills" mean? | A shelf of published skills, a project skill holding Read's rules, or just using the Emil skills | **user-decision** |
| 10 | What | What fills the Work shelf on day one? | The user will write experience and process; what I seed first is open | **user-decision** |
| 11 | What | Does the 1970 research-file index (banner, gaze titles) stay as 1970's own Read home? | It is earlier signed-off work; a single layout for all eras would replace it | **user-decision** |
| 12 | Where | Do URLs change? | Default: no. `/notebook`, `/notebook/<slug>`, `/making/<slug>`, `/work/<id>/read` stay; the directory is navigation, not a move | hypothesis, reversible |
| 13 | Done | How is "clean directory" checked? | From any Read page: the shelf and the page are marked in the rail; every page reachable in ≤2 clicks from Read home; search finds all three shelves | hypothesis |

## Layer stack

| # | Layer | Known | Unknown | Depends on |
|---|---|---|---|---|
| 1 | Literal ask | Quoted above | "link with Fumapress", "add skills" | — |
| 2 | Outcome | Read = directory of shelves with one reading layout | — | 1 |
| 3 | User & moment | A reader who came for one page and should find the shelf; a hiring reader scanning Work | which leads | 2 |
| 4 | Problem behind the ask | One post + a bolted section; left half of the 1970 index is empty; Work reading pages are not reachable from Read | — | Q1, Q2 |
| 5 | Current state | Q1, Q2, Q6 | — | — |
| 6 | Vocabulary | Shelf = Life, Making, Work. Page = one entry. Rail = left navigation. Margin = right notes | final shelf names | — |
| 7 | Data | `content/blog`, `content/making`, `content/work` + `portfolio-data` projects | where experience/process pages live (`content/work/…`?) | Q10 |
| 8 | Flow | Read home → shelf → page → linked page; rail always shows position | — | 9 |
| 9 | Structure | One `ReadShell` (rail + column + margin) used by all three shelves; one directory builder over the three collections | 1970 form (Q11) | Q8 |
| 10 | Contracts | A shelf = `{ id, title, blurb, href, pages: { title, href, summary, group? } }` from each collection | — | 9 |
| 12 | Failure & edges | Empty shelf; 30+ pages in a shelf; phone (rail becomes a drawer or a top list); a page in two shelves | — | — |
| 15 | **Core idea** | draft — Read is a small library: three shelves, one rail that always shows where you are, one calm page layout, and every page linked to its neighbours. Finalised by Q8–Q11 | | |

## Seams

| Seam (A × B) | What crosses | Conflict? | Resolution | Owner |
|---|---|---|---|---|
| Rail × navbar lids | top and bottom space | the eye lids curve over the page corners | rail starts below `--simple-game-nav-bottom`, sticky, ends above `--eye-lid-bottom` | layout |
| Rail × notebook era system | the notebook's own era (`?era=`) and 1970 gaze grammar | notebook pages run inside `NotebookEraRoot`; making and work do not | Q11 decides; until then the rail is a component both can mount | user |
| Three collections × one directory | page lists | three schemas | one adapter per collection to the shelf contract | lib |
| Work desktops × work reading pages | `/work` vs `/work/read` | two homes for work | Read's Work shelf links the reading pages; the desktops stay the "drive it" view and link across | page |
| Search × shelves | query | notebook search only knows posts (+ making since today) | one search over the directory | lib |
| Indexed URLs × directory | canonical URLs | moving pages would break today's sitemap | no URL moves (Q12) | — |

## Direction

- **Core idea:** draft — see layer 15.
- **Chosen (pending Q8):** A, build the directory in this app on the existing content kernel, taking Fumapress's model (a folder is a shelf, a file is a page, the tree is the navigation, search over everything) and the anatomy page's layout (rail, column, margin).
- **Rejected:**
  - B, add Fumadocs' libraries under the hood — a second content pipeline beside the kernel that already validates, renders and syndicates three collections.
  - C, a separate Fumapress site on a subdomain — loses the eras, the lids, the navbar, the lineage map and today's indexed URLs.
  - Make what exists findable only (links from Read to `/work/read`) — fixes reach, not the directory or the layout the user asked for.
  - Do nothing — Work reading pages stay orphaned from Read.
- **Non-goals:** no URL moves; no new visual metaphor; no change to the `/work` desktops or the loader; no commit unless asked.

## Done-criteria (draft)

- [ ] Read home lists three shelves with counts and their pages — check: screenshot, 1970 and one light era, 1280 and 375 px
- [ ] Every Read page shows the rail with its shelf and page marked — check: DOM query on one page per shelf
- [ ] Work shelf reaches every project's reading page and the experience/process pages — check: link crawl from `/notebook`
- [ ] Search finds a page from each shelf — check: three queries
- [ ] No sideways scroll at 375 px; rail usable by keyboard — check: preview
- [ ] `npx tsc --noEmit` clean for touched files — check: command output

## Build order (sketch; detailed after direction is confirmed)

- [ ] 0. One screen of the new Read home for sign-off (the look, before more pages)
- [ ] 1. Directory builder over the three collections
- [ ] 2. `ReadShell`: rail, column, margin; phone form
- [ ] 3. Read home on the shell
- [ ] 4. Making and Work pages on the shell; Work shelf pages
- [ ] 5. Search over the directory
- [ ] 6. SEO contract for anything new; typecheck; proof

## Checkpoints

- Before step 0: Q8, Q9, Q10, Q11.
- After step 0: the look.

## Watch list

- No URL moves (Q12) — confirm by user at step 0 — status: open

## Drift log

| Date | What changed | Why | Approved by |
|---|---|---|---|
| 2026-11-10 | Step 0 built: `src/lib/content/read/directory.ts` (four shelves over the existing collections + `.claude/skills/eye-*`, and a search over all of them), `src/components/read/` (`ReadShell` rail + column, `ReadHome`, `read.css`), and `/notebook` now renders it in every era | The look is shown on one real screen before more pages (TL-42 guard) | pending user |
| 2026-11-10 | Skills shelf lists the 13 eye skills by name, not linked | Their pages are not built yet; an unlinked name is honest, a dead link is not. Emil's skills in the same folder are third-party and are not listed | self |
| 2026-11-10 | The old index (`NotebookList` in `BlogListClient.tsx`, `MakingIndexSection.tsx`) is no longer rendered but still in the tree | Kept until the look is signed off, then removed | self |
| 2026-11-10 | **Cursor:** Read now uses the site's era cursor (`CustomCursor`, the one on work and about: a dot in the era's shape and colours, bursts on click). `LayoutClientShell` mounts it on notebook paths; `NotebookEraProvider` no longer renders `NotebookCursor` (the 1970 gaze blob) or sets `data-era-cursor`, so the native pointer is no longer hidden in 1970. Side effect: gaze-reactive titles on the 1970 essay page are now static | User: "use the about and work page cursor and use that here for era" | user, 2026-11-10 |
| 2026-11-10 | **Era dress:** every Read block and the rail are the era's panel (`--bg-card`, `--border-width/color/radius`, the era shadow); counts, shelf numbers, group labels, the current-rail bar and link hovers use `--accent-color`; each shelf's margin link is an era button that moves by `--btn-hover-transform`. All from tokens, nothing drawn per era. Checked in 1970, 1981 and 2003 | User: "change … the design style with the color and few things from era" | user, 2026-11-10 |
| 2026-11-10 | **Cursor, corrected:** not the site dot. Read's pointer is the pixel arrow of the 1970 work tube (`ARROW` in `control-room/pixel-icons.ts`, 12×17 cells at 2×), handed to CSS `cursor` as an SVG image by `src/components/read/ReadCursor.tsx`: era text colour at rest, the era's live colour over links and buttons, page colour for its edge; redrawn when the era changes; text fields keep the I-beam. The `CustomCursor` mount on notebook paths is removed again | User sent a crop of the tube arrow: "I need this cursor" | user, 2026-11-10 |
| 2026-11-10 | **Boxes removed.** Panels, borders, shadows and the era buttons from the previous round are gone; blocks are separated by a hairline again. The era now gives only colour (page, text, accent on counts, numbers, labels, current rail item, hovers), heading face and the pointer. In 1970 the live colour is the work tube's plasma orange `#ff8a2a` (`--read-accent`), since the site's 1970 accent is the same green as its text | User: "remove the box added extra. I just need to use the color for that and make it apt with the era that's it" | user, 2026-11-10 |
| 2026-11-10 | **mdxcn installed.** Ten components copied from the registry JSON into `src/registry/default/` (timeline, table, stat, spec, tree, kpi, compare, steps, callout, quote + the shared frame, 13 files). `motion/react` imports rewritten to `framer-motion`. Theme written by hand in `src/registry/default/mdxcn.css` so every figure takes era tokens. `src/components/figures/index.tsx` wraps each with a dashed rule above and below (never a box) and exports `FIGURES`, which the blog's `mdxComponents` now spreads, so every post and making entry can use them. Two source edits, both marked `kiruk.in`: scroll-in animation turned off in `graph-motion.ts` (calm rule), and `tableOf` in `graph-markdown.ts` looks one element down so it finds a table inside the blog's scroll wrapper | User: "Use this to extend and improve visualizations for all the blog and the page here" | user, 2026-11-10 |
| 2026-11-10 | **Read home redesigned.** Masthead: kicker, large title, pitch, a strip of five pictures (one page each, clickable), a `GraphStat` of shelf counts, search. Each shelf is laid out by its material: Life leads with the essay and its photograph; Making is a picture grid with one large tile, the rest an index; Work is led by each case's number (334, 500+, 45%); Skills is a `GraphTree`. Shelf head is an uneven pair: kicker + title left, blurb + facts right. Five type sizes carry the hierarchy. The right margin column is gone; pictured tiles open from their title link stretched over the tile | User: "The main read page looks very simple … image assets … clickable … differentiation … better text hierarchy and a better layout" | user, 2026-11-10 |
| 2026-11-10 | Figures in entries: `GraphTimeline` on the eye page (four eyes) and the blink cut (one cut), `Steps` on grid-measure, `GraphTable` on worker-host. Two tables of long sentences (eye page costs, opening rounds) stay ordinary tables: mdxcn's table is for short data and clipped them | Fit | self |
| 2026-11-11 | **Rolled out** (user: "Yes, roll it out"). One rail everywhere (`src/lib/content/read/rail.ts`): Read + shelves with counts, the page's own `##` sections numbered (ids from github-slugger, same as rehype-slug), then the other pages on the shelf; phones keep only the shelves. `ReadSurface` (client) is the shared reading surface for pages outside the notebook route; `MakingSurface` now wraps it. On the shell: making hub and entries, every `/work/<id>/read`, the essay (inside the notebook route, with its floating `.era-toc` hidden since the rail replaces it) | user | user, 2026-11-11 |
| 2026-11-11 | `gaze.css` was only imported by `GazeField`, which the cursor change removed, so the 1970 essay header lost its styles; `NotebookArticle` now imports it | Regression from the cursor round | self |
| 2026-11-11 | **Practice collection** (`content/practice/`, route `/practice/<slug>`): drafts of **Experience** and **How I work**, written only from facts `docs/resume/MASTER-CAREER.md` and `POSITIONING.md` mark safe, no repo names or private paths. `review: true` shows a draft note and sets `noindex`. Shelved on Work under "How I work" | User chose "Existing pages + drafts" | user, 2026-11-10 |
| 2026-11-11 | **Skill pages** at `/skills/<name>`, rendered from the same `SKILL.md` the agent reads (`src/lib/content/skills.ts`; braces and `<` escaped outside fences; links to sibling skills rewritten). Only `eye-*` published. The Read home's skills tree is followed by a linked index | User chose "Both" for skills | user, 2026-11-10 |
| 2026-11-11 | **Project skill** `.claude/skills/read-directory/SKILL.md`: the map, layout, eight learned rules (no metaphors, no boxes, era colour only, tube arrow, keep linkage, title-as-link tiles, calm, one screen first), figure grammar, content rules, checks. Not published as a page (it holds working preferences) | User chose "Both" | self |
| 2026-11-11 | Not done: `/work/read` (old all-work index) still on `DocPage`; sitemap and llms.txt do not list `/skills/*` or `/practice/*` yet (practice is noindex on purpose); old `NotebookList`/`MakingIndexSection` code still in the tree, unused | Scope | self |
| 2026-11-10 | Work projects have no raster pictures (only placeholder SVGs), so Work is led by numbers, not images; the SVG mark entry has no picture and sits in the index under "Earlier" | No asset to show | self |

## Close & retro

- Done-criteria: —
- Retro: —
