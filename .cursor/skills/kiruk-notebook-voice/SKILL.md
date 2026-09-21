---
name: kiruk-notebook-voice
description: >-
  Write and revise Kiruk notebook MDX in Arun's spoken voice — slang, feeling-first
  tone, Mark/Zig/Hit/Note/quotes, and post shape. Use when drafting or editing
  content/blog posts, notebook essays, desk preview copy, life/craft/method/walk
  MDX, or when the user says the writing sounds polished, self-obsessed, AI,
  manifesto, wrong story, or missing their slang.
---

# Kiruk notebook voice

Canonical post for voice + marks: `content/blog/life/variation-keeps-me-alive.mdx`.
File layout and frontmatter: `docs/BLOG_MDX.md`. Unslop pass after draft: `emil-unslop-writing`.

**Write like Arun talking from a notebook — not like a brand essay.**

## Before you write or rewrite

1. Read the section's job (one scene, one feeling).
2. Prefer his words. If he pastes rough copy, clean clarity **without** upgrading into manifesto English.
3. After edits, ask: *Would he say this out loud?* If it sounds like a TED closer or LinkedIn post, rewrite.

## Voice (hard rules)

| Do | Don't |
| --- | --- |
| Feeling first, then the point | Open with identity slogans ("That part is settled") |
| Spoken rhythm: short + longer run-ons | Uniform punchy one-liners |
| Mix **I** and **we** (reader included) | Pure self-branding ("I'm open to explore. Period.") |
| Soft dissent: "I'm not arguing… I'm just saying…" | Defeating strangers / gym people as villains |
| Mess: "won't be perfect", "whatever we can say" | Brochure polish, rule-of-three stacks |
| Concrete stuff (brush, shoe, Goa, ukulele) | Abstract "journey / authenticity / landscape" |

Slang and Indian English are allowed when they are his: *lots and lots*, *spice up*, *I'm just saying*, *whatever it is*, *I used to*.

**Wrong story check:** If he says the meaning changed (e.g. mountains as search vs mountains as home + explore anyway), fix the *claim*, not only the adjectives.

## Post shape

- Frontmatter thin: `title`, `slug`, `excerpt`, `date`, `domain`, `draft`; optional `stage`, `tags`, `related`, `cover`.
- `domain`: `life` for personal essays; `craft` / `method` / `walk` for notebook spines (`docs/BLOG_MDX.md`).
- H2s: lowercase scene titles for life essays (`## morning`, `## the loop`). Sentence case, not Title Case marketing.
- Open: what people say → what you tried → why you're writing. No method sales pitch.
- Close: soft. Optional `<div className="era-sign">~ arun</div>` then a desk/paper `<FullBleed>` if it fits.
- One job per section. Cut a paragraph that only restates the Hit.

## Marks and quotes (use sparingly)

| Component | For | Example job |
| --- | --- | --- |
| `<Mark>` / `<Mark lit>` | Short phrase to keep | "The one I can't picture." |
| `<Zig>` | Metaphor / turn | "treadmill with scenery" |
| `<Hit>` / `<Hit lit>` | Full sentence punch | Closing line of a section |
| `<Note>` | Quiet aside, not body | Joy that doesn't fit the paragraph |
| `>` blockquote | Someone else's voice or the question people ask | "Follow a routine." |
| `<FullBleed>` | Paper/photo break | Spread + side `<Note>`, or desk end |

Rules: few marks per section. Don't wrap every sentence. Prefer one Hit at the end of a beat. Details: [components.md](components.md).

## Edit workflow

1. **Listen** — paste or section intent.
2. **Draft** in his slang; keep concrete nouns.
3. **Unslop** — `emil-unslop-writing` (kill delve/leverage/em-dash stacks; put voice back).
4. **Marks** — only after the prose stands alone.
5. **Read aloud** — kill self-obsessed / manifesto lines.
6. **Log** corrections in [mistakes.md](mistakes.md) when he rejects a tone.

## Improving every time

When he says "sounds wrong", "self obsessed", "missing slang", or "wrong story":

1. Fix the passage.
2. Add a one-line entry to [mistakes.md](mistakes.md) (date · symptom · fix).
3. Prefer citing that log next time over reinventing the rule.

## Out of scope

- Era skins, phosphor CSS, PixelField cursor — not voice.
- Inventing new MDX primitives — use `MdxComponents.tsx` only; ask before adding.
- Replacing craft/method/walk spines for technical posts — still follow `docs/BLOG_MDX.md`.

## References

- [voice.md](voice.md) — fuller tone examples
- [components.md](components.md) — Mark / Zig / Hit / Note / FullBleed
- [mistakes.md](mistakes.md) — living rejection log
- `docs/BLOG_MDX.md` — files, frontmatter, craft/method/walk
- `.cursor/skills/emil-unslop-writing/SKILL.md` — de-AI pass
