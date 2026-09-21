# Blog — authoring notebook posts

File-based notebook. A post is one `.mdx` under `content/blog/<lead>/`
plus assets in `public/blog/<slug>/`. Git is the CMS.

**Voice, slang, marks, quotes:** follow the project skill
[`.cursor/skills/kiruk-notebook-voice/SKILL.md`](../.cursor/skills/kiruk-notebook-voice/SKILL.md)
(and the Cursor rule `kiruk-notebook-voice` when editing `content/blog/**`). Canonical
tone example: `content/blog/life/variation-keeps-me-alive.mdx`.

Public reading (`/notebook`) is an **Era surface**: MDX as the document, Era CSS
as the skin. Desk (`/desk`) remains the private paper writing instrument.

Canonical architecture: [`NOTEBOOK_PLAN.md`](./NOTEBOOK_PLAN.md) · desk: [`BLOGISM.md`](./BLOGISM.md).

Do **not** tag posts with an Era. Visuals follow the reader’s shuffle (default `1970`).
Do **not** add `facets` or `lead` keys. Do **not** put new public pages in `content/notes/`.

## File layout

Folder is the **lead** (the perspective that opens the page). Frontmatter `slug`
is the URL. Nested path is for authors; without `slug`, the loader would publish
`craft/hello` and `/notebook/[slug]` would miss it.

```text
content/blog/
  craft/
    hello.mdx
  method/
    content-is-a-kernel.mdx
  walk/
    indiranagar-evening.mdx
public/blog/<slug>/
  ink-01.svg
  shot-01.png
```

- File name = `slug.mdx`. `slug` matches the filename, never the folder.
- Assets stay flat in `public/blog/<slug>/`. Do not nest public by lead.
- `npm run newpost -- "Title"` still writes `content/blog/<slug>.mdx`. Move the
  file into the lead folder before you publish. Do not change the script.

## Perspectives (craft / method / walk)

Three optional sections. Include only the H2s you have copy for. Empty H2s are
forbidden. `domain` lists every perspective present in the file.

| Name | Stands for | Optional H3s (omit if empty) | Mode |
| --- | --- | --- | --- |
| `craft` | Design & Engineering | Sketch · Build · Seam | technical |
| `method` | Strategy & Workflow | Intent · Parts | technical |
| `walk` | Personal Journey | Place — YYYY-MM | narrative |

- **Sketch** — `<InkPage>` or a paper `<Figure>`.
- **Build** — `<Figure>` screenshot or a fenced code block.
- **Seam** — `<Compare>`, or a paragraph on what survived the paper-to-pixel jump.
- **Intent** — one paragraph: constraint and bet. No Workflow heading.
- **Parts** — a markdown list. Workflow is the order of the parts.
- **Walk** — each outing is `### Bengaluru, Indiranagar — 2026-08`. People in
  the prose. The lesson is the last paragraph of that block.

### Page spine

File order is reading order. The first `## Craft` / `## Method` / `## Walk` is
the lead. Remaining sections follow **Craft → Method → Walk**, skipping the one
already used. Folder name and first H2 must agree.

Intersection is a markdown link to a heading or another post. Max two such
links per section.

### Frontmatter (thin on purpose)

```mdx
---
title: How I sketch before I ship
slug: hello
excerpt: One-line teaser…
date: 2026-07-06
cover: /blog/hello/cover.png   # optional
draft: false
domain: [craft]
stage: seedling
related: [content-is-a-kernel]
---
```

- Required: `title`, `slug`, `date`, `excerpt`, `draft`, `domain`.
- `domain`: `craft`, `method`, `walk` (any subset that has an H2).
- `tags`: topical (`type`, `crt`), not perspective names.
- `related`: slug pointers, not external URLs.
- Optional: `stage` (default seedling), `cover`, `source`.

## Add a post

```bash
npm run newpost -- "Title"
```

Or create from `/desk` (dev, or `ALLOW_BLOGISM=1` / `ALLOW_STUDIO=1`).

1. Move the file to `content/blog/<lead>/<slug>.mdx`.
2. Set `domain` and write the matching H2s. Lead H2 first.
3. Flip `draft: false` when ready.
4. Commit — it ships on deploy.

## Desk — infinite vertical notebook

`/desk` → open a page → **one scrolling surface** (OneNote-style):

Sticky tools: **Write · Scribble · Pencil · Eraser** · **+ Text · + Draw · + Shot** · Save / Publish

- Everything lives on the same vertical page — no Draw/Write tabs.
- **+ Draw** adds another ink strip as you scroll down.
- **+ Shot** / drag-drop inserts a screenshot in the flow.
- **Save** writes all ink strips + MDX in one go.

Desk still creates files at `content/blog/<slug>.mdx`. After save, move into
the lead folder so the public URL stays `/notebook/<slug>`.

## MDX primitives

**`<InkPage>`** — tablet scribble as a **content block** (from Kiruk Ink). Public chrome is Era type, not SketchInk.

```mdx
<InkPage src="/blog/my-post/ink-01.svg" caption="Desk scribble" />
```

**`<Figure>`** — screenshot, raster sketch, or a walk photo.

```mdx
<Figure src="/blog/my-post/shot-01.png" alt="UI screenshot" />
```

Also available (legacy/optional): `<Compare>`, `<FullBleed>`, plain `![alt](…)`.

**Reading emphasis** (life essays and anywhere the prose needs keep-marks):

| Tag | Use |
| --- | --- |
| `<Mark>` / `<Mark lit>` | Short phrase highlight |
| `<Zig>` / `<Zig lit>` | Metaphor / zigzag underline |
| `<Hit>` / `<Hit lit>` | Whole-sentence punch |
| `<Note>` | Quiet aside |
| `>` blockquote | Other people's line or the question aimed at you |

Budget: few per section; body must stand if marks are stripped. Full rules:
[`.cursor/skills/kiruk-notebook-voice/components.md`](../.cursor/skills/kiruk-notebook-voice/components.md).

Do not invent `<Facet>`, `<Parts>`, `<Site>`, or `<Thread>`. Headings and lists
are the structure.

## Heading template

```mdx
## Craft

### Sketch
<InkPage src="/blog/<slug>/ink-01.svg" caption="Desk scribble" />

### Build
<Figure src="/blog/<slug>/shot-01.png" alt="Shipped screen" />

### Seam
<Compare
  pen="/blog/<slug>/flow-pen.png"
  digital="/blog/<slug>/flow-digital.png"
  caption="What survived the jump, and what got cut."
/>

## Method

### Intent
One paragraph: the constraint and the bet.

### Parts
- Constraint: …
- Decision: …

## Walk

### Bengaluru, Indiranagar — 2026-08
<Figure src="/blog/<slug>/site-01.png" alt="Evening on 100 Feet Road" />
People named in the prose. The lesson is this last paragraph.
```

Omit any H2 or H3 with no copy.

## Era preview checklist

- Public chrome is Era type, not SketchInk. Handwriting belongs in `<InkPage>`, not titles.
- Preview the reader at `/desk/preview?era=1970`. Warp (`warp 1970`) is how a reader returns to a year and reads from that machine. Other years are token previews until their reading grammar ships (`notebookReadingGrammar` / `BLOG_READY_ERAS`).
- 1970 is a terminal: tty bar, `ls` index, man(1) article, phosphor CRT, block cursor. It is not a green filter on a modern blog.
- Write body copy that still reads on phosphor *and* later light Eras.
- Frame screenshots (`<Figure>` / a border). Unframed white-on-white images disappear on 1970.
- Ink SVG should use `currentColor` so it follows `--text-main` / `--ink-line`.
- Prefer one-off interactive widgets as named MDX components, not a new file format.

## What we stopped doing

- `npm run thought` / inbox triage / promote
- tldraw as the drawing foundation
- Scan → rembg → vectorizer as the primary ink path
- SketchInk as the public notebook typeface
- New public pages under `content/notes/`
- Ending every post with `npm run newpost`

Paper scans can still be dropped as rasters via Screenshot / `<Figure>` if you want — no pipeline required.
