# Atomic Ink Notebook

Canonical plan for kiruk.in’s notebook. Author desk: [`BLOGISM.md`](./BLOGISM.md).  
Public reader skin (Era shuffle, starting 1970): see [`BLOG_MDX.md`](./BLOG_MDX.md).  
Supersedes Thought OS docs (`BLOG_STACK_PLAN*.md`, research Phase N).

## Idea

The **desk** is a notebook whose smallest unit is a stroke — not a CMS with a draw plugin. The **public reader** is a timeless MDX article skinned by the Era design system (default 1970 Terminal). Tablet ink is an embed (`<InkPage>`), not the page typeface.

```text
ATOM     →  Point + Stroke + Brush (ink / pencil / eraser)
MOLECULE →  InkPage (owned JSON + theme SVG)
ORGANISM →  Blog post (MDX words + optional InkPage + screenshot Figure)
SKIN     →  Reader: Era surface (`data-era-surface`, shuffle in chrome)
           Desk: Paper (white sheet · black chrome)
```

## Author loop (only happy path)

1. `npm run newpost -- "Title"` or create in `/desk`
2. Open the page — **scroll sheet** (default) or **spread** (two facing pages)
3. Write · scribble · drop screenshots on the same surface (switch tools, don’t switch tabs)
4. Bottom-center dock = write / scribble · **bottom-right Page panel** = layout / fit / ruler / paper
5. Save / Publish (`draft: false`) · commit — reader respects `notebook:` frontmatter

### Scroll vs spread

| Mode | Feel | Nav |
| --- | --- | --- |
| `scroll` | One tall sheet; grows downward | Vertical scroll |
| `spread` | Open book rectangle (L \| R); continuous blocks paginated across sheets | Flip ← → / Alt+arrows |

**Skin:** Paper is shipped — white sheet on black studio chrome (`data-notebook-skin="paper"`). Digital (black sheet · light chrome) is a future token invert, not a toggle yet.

```yaml
notebook:
  layout: scroll   # or spread
  ruler: none      # or margin | ruled
  paper: clean     # or rough  (tooth — not skin)
  fit: false       # true = full-width / fit-to-screen
```

## Engine

Owned module: `src/lib/ink/`

| Layer | Owns |
| --- | --- |
| `InkDocument` JSON | Source of truth (`ink-NN.json`) |
| Brush presets | ink / pencil feel |
| `StrokeGeometryAdapter` | Swappable; default = `perfect-freehand` (MIT) |
| Pointer Events | Pen pressure, palm rejection |
| `exportSvg` | Theme SVG (`currentColor`) for readers |

**Do not build on tldraw** (production license). Use Ruiz’s *core* pattern, not his product.

## Reader

- `/notebook` — pages on one Era-skinned index (default **1970**; Time Machine shuffles `data-era-surface` without changing the site theme)
- `/notebook/[slug]` — MDX article; optional `<InkPage>` + `<Figure>`
- `/desk/preview` — same Era surface for drafts (`?era=1970`)
- Ink uses `currentColor` / `--ink-line` so it follows the active Era
- Public type is Era tokens (IBM Plex Mono body in 1970). **SketchInk is desk-only.**
  - Desk (`/desk`): `<SketchInkField action="…" />`; plain UTF-8 MDX
  - Taste: [SKETCH_INK_STYLE.md](./SKETCH_INK_STYLE.md) · skill `.cursor/skills/sketch-ink`
- Icons (interim): **Lucide geometry + Rough.js scribble** (`src/components/studio/icons.tsx`). True pencil wobble on paper. Swap NODES when kiruk icons land.
- Runner-up craft icon set: [Streamline Freehand](https://www.streamlinehq.com/icons/streamline-freehand) (CC BY) if you want polished hand-drawn instead of scribble.

## Out of scope (foundation)

- Thought inbox / promote / process
- Paper scan → rembg → vectorizer as required path
- OCR / Phase N
- Excalidraw / infinite whiteboard chrome
- Domain chip dashboards / garden ceremony

## Assets contract

```text
content/blog/<slug>.mdx
public/blog/<slug>/
  ink-01.json      # editable source
  ink-01.svg       # reader
  shot-01.webp     # screenshot
```
