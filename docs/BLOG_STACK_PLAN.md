# Blog Stack Plan — Scribble & Thoughts Capture (v1 archive)

> **HISTORICAL.** Superseded by [`NOTEBOOK_PLAN.md`](./NOTEBOOK_PLAN.md).  
> Previously superseded by [`BLOG_STACK_PLAN_V2.md`](./BLOG_STACK_PLAN_V2.md). Do not implement from v1.

_kiruk.in · solo author · plan only (archived)_

## Verdict

Current stack is **modern and correct** — do not replace it.

- **Next 15 + React 19 + Tailwind 4**, MDX compiled server-side via `@mdx-js/mdx` (`compile`+`run`), hand-rolled frontmatter parser + collection loader (`src/lib/content/`), `remark-gfm`.
- Content = `content/blog/*.mdx`, images = `public/blog/<slug>/`, custom `<Figure>/<Compare>/<FullBleed>` sketch components.

Real gap = **capture workflow, not the renderer**. Today: draw on paper → scan → drop PNG → hand-write MDX + JSX. High friction.

**Core principle:** keep the MDX+Next core. Build an _ingestion pipeline_ + _authoring layer_ on top. One repo, many input funnels — all land as MDX + assets.

## Author reality

Solo author (only he writes). Inputs:

- Physical sketchbook (pen on paper, scanned)
- Huion RTP-700 pen tablet
- Figma + vector tools (diagrams)
- Claude + Cursor subscriptions with MCP (generation)

Goal: friction-free scribble/thought → live on site, and handle complex posts.

---

## Layer 0 — Content model

- **Two collections**, not one:
  - `blog` — long sketchbook essays (current shape, keep).
  - `notes` — short thoughts/TIL. Minimal frontmatter (`title`, `date`, `tags`). Where "random thoughts" go without ceremony.
  - _(optional later)_ `sketches` — pure image gallery, near-zero text.
- All frontmatter validated by **Zod** (replaces hand-rolled `reqString`/`optStringArray` — fails loud, autocompletes in Cursor).

## Layer 1 — Engine hardening (foundation)

Bare renderer today. Add:

- **Shiki** via `rehype-pretty-code` — code blocks currently have no color.
- **reading time** + `rehype-slug` + `rehype-autolink-headings` — anchors + TOC.
- **`remark-wikilink`** — `[[other-post]]` links + a **backlinks** index. Blog becomes a connected notebook, not a flat list.
- Keep custom loader (zero-dep is a feature). Velite only if later you want it managed — not needed now.

## Layer 2 — Capture funnels (the real ask)

Every input → same landing: `public/blog/<slug>/` + a ready `<Figure>` snippet. One **`inbox/` dropzone** + one CLI: `npm run ink <slug>`.

### A. Pen & paper → digital (killer path)

CLI pipeline per dropped scan:

1. deskew / trim
2. **Adobe `image_remove_background` MCP** → paper white becomes transparent
3. **Adobe `image_vectorize` MCP** → ink becomes crisp SVG (tiny, scales sharp)
4. output SVG as **`currentColor`** → _ink flips with dark/light theme._ Makes scans feel native, not pasted screenshots.
5. raster fallback kept for dense sketches where vectorize is messy.

### B. Huion tablet → digital

- Draw in Krita/Figma → export → same `inbox/` pipeline.
- **In-browser studio**: author-only `/studio` route with **tldraw** (tldraw MCP already available — draw _or_ generate/edit canvas programmatically) → export scene + SVG into a post.
- **`perfect-freehand`** for inline `<Ink>` component — pressure-sensitive doodles with the Huion pen right in a post.

### C. Diagrams (Figma / vector)

- **Figma MCP** (`get_screenshot`/`get_design_context`) → pull frames as SVG into posts.
- **Excalidraw** embed for hand-drawn-style diagrams; **rough.js** for generated sketchy SVG from data.

### D. Random thoughts (fastest path)

- **Obsidian vault = `content/notes/`.** Write on phone/desktop, `[[wikilinks]]`, git-sync → publishes as notes. (ignore `.obsidian/` in build.)
- `npm run note "…"` → dated MDX stub for terminal capture.

## Layer 3 — Authoring UX (solo)

- Live in **Cursor** → lean into it, no heavy CMS. Add MDX **snippets** + `/newpost` scaffold.
- **Keystatic** (git-backed visual editor, no server) = _optional_. Recommend **skip for now** — Cursor + CLI is less friction for one person. Don't run both.

## Layer 4 — "Complex work easier" (MCP)

- Repo **skill/command** (`.claude/` + Cursor rule) `draft-post`: dump raw thoughts → structures MDX, runs ink pipeline, places `<Figure>`/`<Compare>`, drafts cover.
- Per-type **templates** (essay / note / sketch-gallery).

---

## Phasing (ship order)

1. **Foundation** — content model (`blog`+`notes`), Zod, Shiki, reading time, wikilinks.
2. **Ingestion** — `npm run ink` scan→removeBg→vectorize→theme-aware SVG. _Biggest scribble win, do early._
3. **Drawing** — `/studio` tldraw route + `<Ink>` (perfect-freehand) + Excalidraw/rough components.
4. **Thoughts** — Obsidian vault wiring + backlinks + `note` CLI.
5. **Authoring/MCP** — `draft-post` skill + templates (+ optional Keystatic).

## Decisions to flag before code

- **Vectorize vs raster**: dense/shaded sketches vectorize poorly → keep raster fallback, decide per-scan. Not everything should be SVG.
- **tldraw bundle**: big dep → author-only `/studio`, never in visitor bundle.
- **Theme-aware ink** needs clean high-contrast scans (dark pen, white paper, good light). Worth a 2-min phone-scan habit.
- **Keystatic**: recommend **no** for solo+Cursor. Confirm or it gets wired.
- **Obsidian**: confirm you use/want it — else drop that funnel, lean on `note` CLI.
