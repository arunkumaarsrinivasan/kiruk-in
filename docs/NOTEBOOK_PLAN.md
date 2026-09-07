# Atomic Ink Notebook

Canonical plan for kiruk.in’s handwritten blog.  
Supersedes Thought OS docs (`BLOG_STACK_PLAN*.md`, research Phase N).

## Idea

The blog is a **notebook whose smallest unit is a stroke** — not a CMS with a draw plugin.

```text
ATOM     →  Point + Stroke + Brush (ink / pencil / eraser)
MOLECULE →  InkPage (owned JSON + theme SVG)
ORGANISM →  Blog post (MDX words + InkPage + screenshot Figure)
SKIN     →  Paper (white sheet · black chrome) now; Digital (invert) later
```

## Author loop (only happy path)

1. `npm run newpost -- "Title"` or create in `/studio`
2. Open the page — **scroll sheet** (default) or **spread** (two facing pages)
3. Type · draw · drop screenshots on the same surface (switch tools, don’t switch tabs)
4. Bottom-center dock = write/ink · **bottom-right Page panel** = layout / fit / ruler / paper
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

- `/blog` — simple notebook index
- `/blog/[slug]` — white paper page; `<InkPage>` + `<Figure>`
- Duality: **Paper** = white sheet · black chrome (studio now) · **Digital** = invert roles later
- Ink on paper uses `currentColor` / `--ink-line` (black on white sheet)
- Type: **SketchInk v5** — human behavior + sketchnote actions ([SKETCH_INK_BEHAVIOR.md](./SKETCH_INK_BEHAVIOR.md)). Word runs with angle/face/cold→fatigue; `action` presets (type/ideation/flow/diagram/checklist).
  - Hand A print / Hand B script + word alternates; Kiruk fonts later ([SKETCH_INK_HAND.md](./SKETCH_INK_HAND.md))
  - Studio: `<SketchInkField action="…" />`; plain UTF-8 MDX
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
