# Desk

Private handwritten desk for kiruk.in’s notebook. Public readers see **Notebook** at `/notebook`. **Kiruk Studio** is the public practice on this site — work, notebook, about.

## Naming

| Name | Where | Job |
| --- | --- | --- |
| **Desk** | `/desk` | Author the page — write or scribble, then save/publish |
| **Notebook** | `/notebook` | Published pages (craft, method, walk) |
| **Kiruk Studio** | `/`, `/work` | Public practice |

Old `/studio` and `/blogism` URLs redirect here. Write APIs stay at `/api/studio/*`. The desk is on in development, or when `ALLOW_BLOGISM=1` / `ALLOW_STUDIO=1`. Production 404s otherwise.

## Two tools, one paper

The page you edit is the page people read: white sheet, black ink, SketchInk type + Kiruk Ink strokes.

- **Write** (`V`) — keyboard into SketchInk. UTF-8 MDX. Handwriting is how the notebook is *seen*. Action chips (notes / ideation / flow / list / diagram) change the hand, not the file format.
- **Scribble** (`P`) — graphic editor on the same sheet. Ink / pencil / eraser. Sidecars: `public/blog/<slug>/ink-NN.json` + themed SVG. Insert a strip or draw on the page.

Screenshots (`+ shot`) sit in the flow as `<Figure>`. Do not switch apps to finish a page.

See [`NOTEBOOK_PLAN.md`](./NOTEBOOK_PLAN.md) and [`BLOG_MDX.md`](./BLOG_MDX.md).
