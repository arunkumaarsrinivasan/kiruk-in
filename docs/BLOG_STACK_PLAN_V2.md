# Blog Stack Plan v2 — Thoughts & Scribble → Digital

> **HISTORICAL.** Superseded by [`NOTEBOOK_PLAN.md`](./NOTEBOOK_PLAN.md) (Atomic Ink Notebook).  
> Do not implement Thought OS / Phase N from this file.

_kiruk.in · solo author · archived 2026-07-18_  
_Originally superseded [`BLOG_STACK_PLAN.md`](./BLOG_STACK_PLAN.md) (v1). Research: [`BLOG_STACK_RESEARCH.md`](./BLOG_STACK_RESEARCH.md)._

---

## Verdict (archived)

The MDX + Next core is correct. **Do not replace it.**

v1 nailed the diagnosis (capture is the gap) and the visual ink path. v2 goes further:

1. **Text thoughts are first-class** — equal to scribbles, not a side funnel.
2. **One Thought OS** — capture → triage → publish, for both words and ink.
3. **Harder foundation** — Zod, notes, Shiki, anchors, RSS (currently a dead link), growth stages.
4. **Promote path** — seedling notes graduate into essays without rewrite ceremony.
5. **Digital ink that actually themes** — not “SVG as `<img>`” (that loophole breaks `currentColor`).
6. **Phase N parked unchanged** — on-prem VLM after ink + text capture work. Do not expand here.

**North star:** Dump a thought in 5 seconds, drop a scan in 30, and both become typed, theme-native, linkable MDX — without fighting a CMS.

---

## Author reality (unchanged inputs, clearer jobs)

| Input | Job | Primary tool |
| --- | --- | --- |
| Fleeting text thought | Capture now, shape later | `npm run thought` / inbox |
| Short TIL / note | Publish low-ceremony | `npm run note` → `content/notes/` |
| Long sketchbook essay | Narrative + figures | `npm run newpost` + ink |
| Paper / Huion scan | Native digital ink | `inbox/scans/` → `npm run ink` |
| Figma / vector | Crisp diagrams | export → same ink contract |
| Cursor + Claude | Structure & polish | `draft-post` skill |
| (later) Local VLM | Private OCR → draft | Phase N |

Solo author. Git is the CMS. Cursor is the desk.

---

## Architecture — Thought OS

```
  CAPTURE                         TRIAGE                         PUBLISH
  ───────                         ──────                         ───────
  thought "…"  ──┐                                           ┌─► content/notes/*.mdx
  note "…"     ──┤                                           │     (seedling → evergreen)
  newpost      ──┼─► inbox/ ──► process / promote / ink ─────┤
  drop scan    ──┤      thoughts/                            └─► content/blog/*.mdx
  /studio SVG  ──┘      scans/                                     + public/{blog,notes}/<slug>/
                        raw/                                           │
                                                                       ▼
                                                              Next MDX render
                                                              (Zod · Shiki · links)
```

**One landing contract for every funnel**

- Frontmatter passes Zod (fail the build if not).
- Body is MDX using only the scoped component allow-list.
- Assets live under `public/<collection>/<slug>/`.
- Unpublished work uses `draft: true` (or stays in `inbox/` until promoted).
- Never auto-publish from AI/OCR — human confirm always.

---

## Layer 0 — Content model (foundation of the foundation)

### Collections

| Collection | Path | Purpose | Ceremony |
| --- | --- | --- | --- |
| `blog` | `content/blog/*.mdx` | Long essays, sketchbook narratives | Full frontmatter + figures |
| `notes` | `content/notes/*.mdx` | Thoughts, TILs, seedlings | Minimal frontmatter |
| _(not yet)_ `sketches` | — | Pure image gallery | Only after ≥5 image-only pieces |

### Shared Zod schema (conceptual)

```ts
// Shared
stage:   z.enum(['seedling', 'growing', 'evergreen']).default('seedling')
source:  z.enum(['thought','pen','tablet','figma','studio','note','import']).optional()
draft:   z.boolean().default(false)
date:    z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()
related: z.array(z.string()).optional()   // until wikilinks index exists
tags:    z.array(z.string()).optional()   // notes; blog keeps domain[]

// Blog
title, slug?, domain?, excerpt?, cover?

// Notes
title, slug?, excerpt?, tags?
```

**Why `stage`:** Maggie Appleton garden signal — unfinished thinking is allowed and labeled.  
**Why `source`:** Traceability for later ink/OCR analytics without guessing.  
**Why `related` early:** Manual graph before remark-wikilink ships.

### Routes

| Surface | Route | Notes |
| --- | --- | --- |
| Essay list | `/blog` | Keep current filter/search |
| Essay | `/blog/[slug]` | Keep |
| Notes index | `/notes` | Compact list, stage chips |
| Note | `/notes/[slug]` | Lighter chrome than essays |
| Author studio | `/studio` | Auth-gated / local-only later |

Promote: a note can become a blog post via `npm run promote <note-slug>` (copies body, bumps `stage`, sets `source`, moves assets if any).

---

## Layer 1 — Engine hardening (best-of-best base)

Ship inside the existing custom loader (`src/lib/content/platform/`). **Do not adopt Velite / Content Collections yet** — zero-dep FS loader is a feature at this scale. Revisit only if collection count or rebuild pain justifies it.

### Must-ship (Phase 1)

| Item | Why |
| --- | --- |
| Zod schemas per collection | Loud fails + Cursor autocomplete |
| `notes` collection + routes | Text thoughts need a home |
| Shiki via `rehype-pretty-code` | Dual theme if era/dark needs it |
| `rehype-slug` + `rehype-autolink-headings` | Anchors / deep links |
| Reading time | Essay chrome hygiene |
| **RSS feed** (`/api/blog/rss` or `/feed.xml`) | Root layout already advertises RSS — **link is currently dead** |
| Per-post `generateMetadata` polish | Title, description, canonical (already partial) |

### Ship next inside foundation (Phase 1b)

| Item | Why |
| --- | --- |
| `remark-wikilink` + backlinks index | Garden topography |
| Stage chip in UI | Seedling honesty |
| OG image per post (Satori) | Share cards that look intentional |
| Mermaid (optional, blog only) | Text thoughts → structured diagrams |

### Explicitly later

- Pagefind / ⌘K — when corpus outgrows list search
- Velite / Content Collections — only if loader pain appears
- Keystatic — skip for solo + Cursor

---

## Layer 2 — Capture (text + scribble, equal weight)

### Directory layout

```
inbox/
  thoughts/     # .md snippets / one-liners dropped or CLI-written
  scans/        # phone photos, Huion exports, desk photos
  raw/          # misc dumps (voice transcripts, paste dumps) — optional
scripts/
  thought.mjs
  note.mjs
  newpost.mjs
  ink.mjs
  promote.mjs
  process.mjs   # optional: list / score inbox for triage
```

### A. Text thoughts (fastest path — v2 first-class)

| Command | Behavior |
| --- | --- |
| `npm run thought "…"` | Append timestamped bullet to `inbox/thoughts/YYYY-MM-DD.md` (or create it). Zero frontmatter. Friction ≈ seconds. |
| `npm run note "title"` | Scaffold `content/notes/<slug>.mdx` with `stage: seedling`, `source: thought`, `draft: true`. Open in Cursor. |
| `npm run note -- --from-inbox` | Pick today's thought file → draft note(s) with titles suggested (Cursor skill can help). |
| Paste into `inbox/thoughts/` | Same as CLI; process later. |

**Voice rule:** Keep the author's words. Processing can retitle/tag; it must not silently “improve” voice.

**Obsidian:** Optional. If you already live there, point a vault folder at `content/notes/` (ignore `.obsidian/`). If not, **do not add Obsidian** — CLI + Cursor is the default.

### B. Pen & paper → digital ink (killer visual path)

`npm run ink <slug> [--collection blog|notes] [--mode auto|vector|raster]`

**Pipeline (local-first, Adobe optional):**

| Step | Default (local) | Optional upgrade |
| --- | --- | --- |
| 1. Ingest | Accept PNG/JPEG/WebP/HEIC via `sharp` | — |
| 2. Normalize | Auto-rotate EXIF, deskew, trim margins, boost contrast | Manual crop later |
| 3. Quality gate | Reject (warn) if contrast too low / page mostly gray | Force with `--force` |
| 4. Remove paper | `rembg` (local) → transparent PNG | Adobe `image_remove_background` MCP if available |
| 5. Classify | Heuristic: line-art vs dense/shaded | `--mode vector\|raster` override |
| 6a. Vector | `vtracer` binary mode (or potrace) → SVG | Adobe `image_vectorize` MCP |
| 6b. Raster | WebP/PNG max-width ~1600–2400, keep alpha | — |
| 7. Theme pass | Rewrite SVG fills/strokes → `currentColor`; strip paper rects | — |
| 8. Land | `public/<collection>/<slug>/sketch-NN.{svg,png,webp}` + `manifest.json` | — |
| 9. Snippet | Print `<Figure … />` (clipboard + optional MDX stub append) | — |

**Always keep a raster sibling** even when vector succeeds — fallback for dense pages, OG images, and email clients that choke on SVG.

**Scan habit (non-negotiable for good ink):** dark pen, white paper, even light, one page per file, phone parallel to page. Bad scan → bad digital, no CLI can fully save it.

### C. How theme-native ink actually works (critical)

Era tokens already set `--text-main` / `--accent-color` via `data-era`. Raster PNGs ignore that. For ink to *feel digital*:

| Approach | Theme-aware? | Use when |
| --- | --- | --- |
| `<img src="*.svg">` / `next/image` | **No** — `currentColor` does not inherit into external SVG-as-image | Never for themed ink |
| CSS `mask-image` + `background-color: currentColor` | **Yes** | Simple mono line art (preferred default for `<Figure medium="pen">` when SVG exists) |
| Inline SVG React component (read file at build / RSC) | **Yes** | Complex multi-path SVGs that need title/aria |
| Raster PNG/WebP | No (fixed ink color) | Dense/shaded; always as fallback |

**v2 rule:** `<Figure>` gains smart rendering:

1. If `src` ends in `.svg` (or `ink="theme"`) → render via **mask** or **inline SVG**, colored with `currentColor` / `--text-main`.
2. Else → existing framed `next/image` raster path.
3. Optional `srcRaster` for `<picture>` / noscript fallback.

Also add `<InkSvg src="…" />` for explicit theme ink when authors want control.

### D. Huion / Figma / studio (digital-native scribble)

| Source | Path | Output contract |
| --- | --- | --- |
| Huion → Krita/Figma | Export PNG/SVG → `inbox/scans/` → `ink` | Same manifest + Figure |
| Figma MCP | Pull frame → SVG into `public/.../` | Prefer true SVG export over screenshot |
| `/studio` (tldraw) | Author-only; export SVG + scene JSON | SVG through theme pass; JSON kept for re-edit |
| In-post `<Ink>` | `perfect-freehand` strokes | Serialize path data into MDX or sidecar; visitor bundle stays tiny |
| Excalidraw / rough.js | Hand-drawn *digital* diagrams | Embed component or static SVG export |

**Studio hard rules**

- Never in the visitor JS bundle (dynamic import + separate route).
- Gate before public deploy: `NODE_ENV=development` only, or simple secret cookie / `ALLOW_STUDIO=1`. An open `/studio` on production is a loophole.
- Export must run the same theme-pass as `ink` (no special snowflake format).

### E. Compose / promote

| Command | Behavior |
| --- | --- |
| `npm run newpost <slug>` | Essay scaffold + empty `public/blog/<slug>/` |
| `npm run promote <note-slug>` | Note → blog stub (or linked pair); sets `stage: growing`, preserves body + related |
| `draft-post` skill | Dump inbox thoughts + ink paths → structured MDX draft |

### F. Asset contract (`manifest.json` per slug)

```json
{
  "slug": "hello",
  "assets": [
    {
      "id": "sketch-01",
      "vector": "/blog/hello/sketch-01.svg",
      "raster": "/blog/hello/sketch-01.webp",
      "medium": "pen",
      "mode": "vector",
      "alt": "Flow diagram: idea to ship"
    }
  ]
}
```

CLI writes this; MDX can keep explicit `<Figure>` props (source of truth for the post). Manifest helps `draft-post`, OG picks, and Phase N later — without coupling the renderer to it.

---

## Layer 3 — MDX primitives (medium = sketchbook + thought)

### Keep

- `<Figure>` · `<Compare>` · `<FullBleed>` — extend for theme ink + required `alt`

### Add (staged)

| Component | Role | Phase |
| --- | --- | --- |
| Theme-smart `<Figure>` | Mask/inline SVG when vector; raster otherwise | Ink (Phase 2) |
| `<InkSvg>` | Explicit theme-colored vector | Ink |
| `<Aside>` / callout | Margin thought, warning, “still thinking” | Foundation |
| `<Ink>` | Pressure freehand doodle (perfect-freehand) | Drawing |
| `<Transcript>` | Optional OCR text under a figure (a11y + SEO) | Phase N (unchanged) |
| Excalidraw / rough embed | Sketchy diagrams from data or file | Drawing |

**A11y:** `alt` required on Figure/Compare/FullBleed in Zod-ish lint or ESLint MDX rule — scribble without alt is invisible to search and screen readers.

Skip Sandpack unless a post truly needs a live runtime. Never ship tldraw to visitors.

---

## Layer 4 — Authoring UX (solo)

- Live in **Cursor** — snippets for Figure/Compare/Aside, `draft-post` skill  
- Templates: `essay` · `note` · `sketch-spread` · `thought-dump`  
- **Keystatic: no** (unless CLI friction becomes painful)  
- Process rhythm (borrowed from best gardens, adapted to git):

  1. **Capture** all week into `inbox/` + `thought`  
  2. **Triage** once or twice a week (`process` / Cursor): tag, stage, link  
  3. **Publish** by flipping `draft: false` and committing  

---

## Layer 5 — Discoverability & “alive” ideas

| Feature | Effect |
| --- | --- |
| Wikilinks + backlinks | Topography over pure timelines |
| Stage chips | Readers know what’s unfinished |
| Notes index + blog index | Two altitudes of thinking |
| RSS (fixed) | Thoughts leave the site |
| Related / promote | Ideas grow instead of dying in a notebook |
| (later) transcript search | Ink becomes queryable |

---

## Tech stack loopholes → fixes

Audit against the live repo + common MDX/ink failure modes. Fix these while building Phases 1–2; do not wait for Phase N.

### Critical (ship-breakers or fake features)

| Loophole | Why it hurts | Fix |
| --- | --- | --- |
| **SVG-as-`<img>` is not theme-aware** | Browser will not apply CSS `currentColor` into external SVG images — “theme ink” silently fails | Mask or inline SVG in `<Figure>` / `<InkSvg>` (see Layer 2C) |
| **Dead RSS** (`layout.tsx` → `/api/blog/rss`) | Broken discovery; looks unfinished | Add `/feed.xml` or `/api/blog/rss` in Phase 1 |
| **Sitemap fetches `/api/blog` over HTTP** | Build can fail or stale if site URL/network wrong | Prefer direct `getBlogPosts()` import in `sitemap.ts` |
| **Open `/studio` on prod** | Anyone can hit a heavy author tool | Dev-only or `ALLOW_STUDIO` gate before Phase 4 ships |
| **Adobe-only ink CLI** | Pipeline dies offline / without MCP | Default **local**: `sharp` + `rembg` + `vtracer`; Adobe optional |

### High (data integrity / security posture)

| Loophole | Why it hurts | Fix |
| --- | --- | --- |
| **Hand-rolled frontmatter silent on bad fences** | Unterminated `---` → empty data, confusing validates | Fail loud in Zod era; reject empty required fields at parse |
| **Slug collision** | File `foo.mdx` + another file with `slug: foo` | Build check: unique resolved public slugs across collection |
| **MDX `compile`+`run` executes author JSX** | Fine for first-party git content; catastrophic if remote/user MDX ever added | Policy lock: **first-party only**; keep component allow-list; never pipe untrusted MDX; do not casually switch to `next-mdx-remote` without threat model (CVE-2026-0969 class issues on untrusted input) |
| **Drafts only skipped when `NODE_ENV=production`** | Preview/prod misconfig can leak or hide drafts | Explicit `draft !== true` for public listings; optional `INCLUDE_DRAFTS=1` for previews |
| **Missing `alt` on sketches** | A11y + SEO hole for an image-heavy blog | Require `alt` on Figure/Compare/FullBleed |

### Medium (quality / maintainability)

| Loophole | Why it hurts | Fix |
| --- | --- | --- |
| **Giant phone PNGs in git** | Slow clones, huge deploys | `ink` always emits resized WebP + optional original in `.gitignore`d `_raw/` |
| **`domain[]` vs `tags[]` split** | Two vocabularies to remember | Keep both names for UI compatibility; document mapping; optional alias in Zod |
| **Shiki vs era themes** | Code blocks fight 1970–2026 era skins | Dual Shiki themes or map to neutral “ink on paper” / “terminal” pair tied to era groups |
| **Broken wikilinks at build** | Garden looks alive but 404s | Remark plugin + build fail (or warn) on missing targets |
| **Notion client still in deps** | Dead weight after MDX migration | Remove `@notionhq/client` when unused |
| **No image size / LQIP** | Layout shift on sketch pages | `ink` writes width/height into manifest; Figure uses them |
| **Compare only accepts raster paths** | Pen→digital story breaks for SVG ink | Allow vector+raster pairs; digital side can stay raster/Figma |

### Explicit non-loopholes (do not “fix”)

- Custom `@mdx-js/mdx` loader — keep; it’s the right shape.
- `public/<collection>/<slug>/` assets — keep; don’t migrate to colocation mid-flight.
- Skipping Velite/Keystatic — still correct at this scale.

---

## How we improve digital + scribble (priority ladder)

1. **Make ink truthful** — theme via mask/inline, not marketing copy about `currentColor` on `<img>`.
2. **Make ink reliable offline** — local `sharp`/`rembg`/`vtracer` as default path.
3. **Make ink measurable** — quality gate + always-on raster sibling + manifest.
4. **Make scribbles accessible** — required `alt`; later transcripts stay Phase N.
5. **Make digital drawing the same contract** — studio/Figma/Huion all exit through `ink` theme-pass.
6. **Close platform holes** — RSS, sitemap import, slug uniqueness, draft policy, drop Notion dep.
7. **Then** Phase N (unchanged) — OCR/drafting on top of assets that already look native.

---

## Phasing (ship order)

> **Build status (2026-07-11):** Slices 1–4 ✅ shipped & verified — 1 Kiruk OS kernel, 2 Shiki+anchors+reading-time+metadata, 3 RSS `/feed.xml`+sitemap direct-import, 4 `notes` collection+`/notes` routes+StageChip (joined with ZERO kernel edits — generalization proven). Slice 5 ✅ capture CLIs (`npm run thought`/`note`/`newpost`, cross-platform `.mjs`, secret-glob warn). Slice 6 ✅ ink CLI (`npm run ink` — sharp + npm-native `@neplex/vectorizer`; rembg optional; theme-native SVG + WebP + manifest + `<Figure>` snippets). Slice 7 ✅ theme-smart `<Figure>`/`<InkSvg>` — inline SVG recolors per era (verified 1970 green / 2023 light). **FOUNDATION COMPLETE (Slices 1–7).** Next phases are separate plans: collection migrations (progress/work/docs), wikilinks/backlinks, promote, OG images, `/studio` tldraw, `<Ink>`, Excalidraw, draft-post skill, Pagefind, Phase-N VLM OCR. Detailed slice plans + progress: `~/.claude/plans/…-humble-gem.md`.

### Phase 1 — Foundation (do first)

1. Zod schemas; extend blog frontmatter with `stage` / `source` / `related`  
2. `notes` collection + `/notes` routes + list UI  
3. Shiki + slug/autolink + reading time  
4. Fix/create **RSS** (dead link today) + sitemap uses direct content import  
5. CLIs: `thought`, `note`, `newpost`  
6. `<Aside>` (or styled blockquote convention) + update `BLOG_MDX.md`  
7. Slug-uniqueness + draft policy hardening; remove unused Notion client if still present  

### Phase 2 — Ink ingestion (biggest scribble win)

8. `inbox/` + `npm run ink` with **local** sharp/rembg/vtracer (+ optional Adobe)  
9. Quality gate, WebP resize, vector+raster siblings, `manifest.json`  
10. Theme-smart `<Figure>` / `<InkSvg>` (mask or inline — **not** SVG-as-img)  
11. Required `alt`; document scan habit  

### Phase 3 — Graph & thoughts UX

12. Wikilinks + backlinks UI + broken-link check  
13. `promote` CLI + stage chips on cards  
14. Optional Obsidian wiring (only if confirmed)  
15. Per-post OG images (prefer raster sibling from manifest)  

### Phase 4 — Drawing studio

16. Author-only `/studio` (tldraw) with **prod gate**  
17. `<Ink>` + Excalidraw / rough  
18. Figma MCP recipe → same ink contract  

### Phase 5 — Authoring agents

19. `draft-post` Cursor/Claude skill  
20. Templates + `process` triage helper  
21. Pagefind when search outgrows filters  

### Phase N — Scribble intelligence (parked)

> Start only after Phase 2 ink is reliable. **This section is locked — do not expand in this revision.**

| ID | Task |
| --- | --- |
| N1 | Local Ollama + **Qwen3-VL 8B** OCR CLI (`read-ink`) + strict OCR prompt |
| N2 | Local text model: title / tags / stage / related suggestions |
| N3 | Multi-page harvest → `draft: true` MDX with Figures placed |
| N4 | Diagram vs prose routing; captions; Mermaid only when clear |
| N5 | `<Transcript>` under figures; search across transcripts |
| N6 | 10–20 page ground-truth WER harness for *your* handwriting |

Cloud Cursor/Claude = authoring help. On-prem VLM = private scribble ingestion. Same MDX landing zone.

---

## Decisions (v2 locks)

| Decision | Lock | Rationale |
| --- | --- | --- |
| Keep Next + custom MDX loader | **Yes** | Matches Comeau/Appleton; content-as-data |
| Text thoughts first-class | **Yes** | Capture friction kills gardens more than missing SVG |
| Default capture = CLI + inbox, not Obsidian | **Yes** | Obsidian optional only |
| Keystatic | **No** | Solo + Cursor |
| Velite now | **No** | Revisit on pain |
| Theme-aware ink via mask/inline SVG | **Yes** | SVG-as-`<img>` cannot theme — that was a plan hole |
| Ink CLI default = local (sharp/rembg/vtracer) | **Yes** | Adobe MCP optional only |
| Vectorize everything | **No** | Raster sibling always; dense art stays raster |
| tldraw in visitor bundle | **Never** | Author `/studio` only + prod gate |
| Auto-publish from AI | **Never** | Human gate |
| On-prem VLM in Phase 1–2 | **No** | After ink; Phase N locked as written |
| Third `sketches` collection | **Not yet** | Fold into blog via FullBleed |
| Asset root | **Keep `public/<collection>/<slug>/`** | Don’t colocate mid-flight |
| Untrusted / remote MDX | **Never** | `compile`+`run` is for first-party git only |

---

## Success metrics (feel, not vanity)

- Thought → file: **&lt; 10 seconds** (`thought`)  
- Scan → themed `<Figure>` snippet: **&lt; 2 minutes** (`ink`, offline-capable)  
- Note → live `/notes/...`: one commit, Zod green  
- Seedling → essay: `promote` without rewrite  
- Zero white-paper pasted screenshots on the live site  
- Ink flips with era/`currentColor` (verify in at least two eras)  
- RSS and sitemap resolve without HTTP self-fetch hacks  

---

## Open confirms (before / during Phase 1)

1. **Obsidian?** Default v2 = no. Say yes only if you already use it daily.  
2. **Notes URL:** `/notes` vs `/blog/notes` — recommend `/notes`.  
3. **RSS shape:** combined feed (blog+notes) vs separate — recommend combined with `<category>`.  
4. **Ink theme technique:** CSS `mask-image` (simpler) vs inline SVG RSC (more control) — recommend **mask for mono pen, inline when multi-layer**.  
5. **Adobe MCP:** optional polish only; local path must work first.

---

## Doc map

| Doc | Role |
| --- | --- |
| **This file (v2)** | Canonical ship plan |
| `BLOG_STACK_PLAN.md` | v1 archive (superseded) |
| `BLOG_STACK_RESEARCH.md` | Research evidence + Phase N detail |
| `BLOG_MDX.md` | Author how-to (update when Phase 1 lands) |

---

## One-line

**Capture text and ink into one inbox; close the theme-ink and platform loopholes so scribbles look native; promote what grows; leave Phase N alone until the ink is true.**
