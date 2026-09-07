# Blog — authoring notebook posts

File-based notebook. A post is one `.mdx` in `content/blog/` plus assets in
`public/blog/<slug>/`. Git is the CMS.

Canonical architecture: [`NOTEBOOK_PLAN.md`](./NOTEBOOK_PLAN.md).

## Add a post

```bash
npm run newpost -- "Post title"
```

Or create from `/studio` (dev, or `ALLOW_STUDIO=1`).

1. Edit frontmatter + body (or draw in studio).
2. Flip `draft: false` when ready.
3. Commit — it ships on deploy.

### Frontmatter (thin on purpose)

```mdx
---
title: How I sketch before I ship
slug: hello
excerpt: One-line teaser…
date: 2026-07-06
cover: /blog/hello/cover.png   # optional
draft: false
---
```

## Studio — infinite vertical notebook

`/studio` → open a page → **one scrolling surface** (OneNote-style):

Sticky tools: **Type · Ink · Pencil · Eraser** · **+ Text · + Draw · + Shot** · Save / Publish

- Everything lives on the same vertical page — no Draw/Write tabs.
- **+ Draw** adds another ink strip as you scroll down.
- **+ Shot** / drag-drop inserts a screenshot in the flow.
- **Save** writes all ink strips + MDX in one go.

## MDX primitives

**`<InkPage>`** — theme-native handwritten page (from Kiruk Ink).

```mdx
<InkPage src="/blog/my-post/ink-01.svg" caption="Desk scribble" />
```

**`<Figure>`** — screenshot or raster sketch.

```mdx
<Figure src="/blog/my-post/shot-01.png" alt="UI screenshot" />
```

Also available (legacy/optional): `<Compare>`, `<FullBleed>`, plain `![alt](…)`.

## What we stopped doing

- `npm run thought` / inbox triage / promote
- tldraw as the drawing foundation
- Scan → rembg → vectorizer as the primary ink path

Paper scans can still be dropped as rasters via Screenshot / `<Figure>` if you want — no pipeline required.
