# Notebook MDX components

Registered in `src/components/blog/MdxComponents.tsx`. Do not invent tags.

## Emphasis

### `<Mark>` / `<Mark lit>`

Highlighter on a **short phrase**. Clickable keep-paint in the reader.

```mdx
<Mark>The one I can't picture.</Mark>
<Mark lit>I pick a brush, I pick a paste</Mark>
```

Use `lit` when the highlight should show on load.

### `<Zig>` / `<Zig lit>`

Zigzag underline under a **phrase or short metaphor**.

```mdx
<Zig>It's a conversation with the pan.</Zig>
<Zig>treadmill with scenery</Zig>
```

### `<Hit>` / `<Hit lit>`

Whole **sentence** you can keep. Usually ends a beat.

```mdx
<Hit>if every shower is the same shower, you stop feeling the shower, and that's the boring life again.</Hit>
<Hit lit>You don't know best. You know one.</Hit>
```

### Budget

- Max ~1–2 marks per section.
- Body must read if all marks were stripped.
- Never nest Mark inside Hit or Zig inside Mark.

## Asides and quotes

### `<Note>`

Quiet margin thought. Lowercase OK. Not a second essay.

```mdx
<Note>
but it brings me such joy from inside that we can't match with anything
</Note>
```

### Markdown blockquote

Other people's line, advice, or the question aimed at him.

```mdx
> Follow a routine.

> Why is this guy not sticking with the people?
```

## Media

### `<FullBleed>`

Wide photo / scan. Optional side `<Note>` as callout. `photo` + `fit="height"` when the whole frame should stay on screen.

```mdx
<FullBleed
  photo
  fit="height"
  src="/blog/<slug>/spread.jpg"
  alt="…"
  caption="…"
>
  <Note>…</Note>
</FullBleed>
```

Assets: `public/blog/<slug>/…`. Caption is part of the voice — keep it human.

### Also available

`<Figure>`, `<Compare>`, `<InkPage>`, `<Ink>`, `<Pretext>`, `<InkLayer>` — see `docs/BLOG_MDX.md`. Prefer these over new widgets.

## Signature

```mdx
<div className="era-sign">~ arun</div>
```

Optional, near the end, before or after a closing FullBleed.
