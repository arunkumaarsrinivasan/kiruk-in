# Blog Stack Research — Thoughts, Scribble & Digital Presence

_kiruk.in · research companion (archived)_

> **HISTORICAL.** Canonical plan is [`NOTEBOOK_PLAN.md`](./NOTEBOOK_PLAN.md).  
> This file is evidence and Phase N detail only — do not expand OCR / Thought OS from here.

---

## 0. Research question

> How do the best solo design-engineer / digital-garden authors turn **fleeting text** and **hand scribbles** into a site that feels native, interactive, and alive — without a CMS — and what should kiruk.in copy, adapt, or deliberately skip?

Secondary question (parked): when and how should a **local** vision model turn handwriting into drafts without rewriting the author’s voice?

---

## 1. Verdict (stronger)

| Claim | Evidence | kiruk.in implication |
| --- | --- | --- |
| The renderer is fine | Comeau, Appleton, Hammayo 2026, Amytis — Next/Astro + MDX + custom components is the consensus spine | Keep `@mdx-js/mdx` compile+run; do not replace with a CMS |
| The gap is capture + fidelity | Hammayo: “spent time on tooling, almost none on writing workflow”; Inkwell/Smus: harvest + OCR as separate systems | Build Thought OS + ink CLI before studio chrome |
| Text and ink are equal inputs | Appleton: text isn’t the only way to represent ideas; gardens fail when only “finished essays” are allowed | `thought` / `notes` first-class beside scans |
| “Theme SVG” via `<img>` is a false feature | CSS community (Bushell, bitstorm, Subito): external SVG-as-image does **not** inherit `currentColor` | Mask or inline SVG — see §4 |
| Local OCR is good enough for drafts | Smus: Qwen3-VL 8B ≈ 5% WER vs Claude Opus ≈ 3%; Autodidacts: usable on sloppy handwriting | Phase N after visual ink; never auto-publish |
| Voice must be protected | Autodidacts: model “corrected” wording without consent; Smus strict OCR prompt | OCR engine prompt + human gate |

**Do not replace the renderer.** Harden the content model, close platform holes (RSS, sitemap), make ink *actually* theme, then (later) add private semantic OCR into the same MDX landing zone.

---

## 2. Mental models worth stealing

### 2.1 Digital garden (Appleton)

| Pattern | Meaning | kiruk.in |
| --- | --- | --- |
| Topography over timelines | Navigate by links/themes, not only dates | Wikilinks + backlinks + `related[]` |
| Continuous growth | Unfinished is allowed | `stage: seedling \| growing \| evergreen` |
| Content diversity | Essays, notes, patterns, illustrations | `blog` + `notes`; sketches fold into essays for now |
| Private marinate → public craft | PKM ≠ site; control layout in the web’s native medium | `inbox/` + CLI capture; publish = intentional MDX in Cursor |
| Illustrated essays | Visual metaphor is content, not decoration | `<Figure>` / `<Compare>` / `<FullBleed>` + theme ink |

Appleton’s colophon is explicit: she does **not** one-click sync from Tana/Roam into the garden. Ideas mature privately, then she authors in MDX for typography and interaction control. That validates v2’s “CLI + Cursor, Obsidian optional” lock.

### 2.2 MDX as the product (Comeau / Pombo)

- Comeau: bespoke React widgets inside Markdown; Shiki for static code; Sandpack only when live runtime is required.
- Pombo (“The X in MDX”): MDX is a dialect for *layouts*, not only linear posts — sticky visuals, stepped narratives, media sync.

**Lesson for a sketchbook blog:** invest in medium-native components (ink, compare, full-bleed, maybe later scrolly sketch spreads), not in a CMS or Sandpack by default.

### 2.3 Capture → compile → publish (Karpathy LLM Wiki, adapted)

Karpathy’s 2025–26 pattern: **raw (immutable) → compiled wiki (LLM-maintained) → query**. Operations: ingest / query / lint.

**Do not** turn the public site into an LLM-owned wiki. Adapt the *layers* to kiruk.in:

| Layer | Karpathy | kiruk.in |
| --- | --- | --- |
| Raw | Immutable sources | `inbox/thoughts`, `inbox/scans`, `_raw/` originals |
| Compiled | LLM wiki pages | Optional: Cursor `draft-post` / Phase N drafts (`draft: true`) |
| Published garden | (often the wiki itself) | **Human-owned** `content/{blog,notes}/*.mdx` |

Ingest can be assisted; **publish stays human**. That matches Appleton’s control preference and v2’s never-auto-publish lock.

### 2.4 Process → Triage → Publish (garden plugins)

eBrain Gardener / digital-garden plugins: score inbox → enrich frontmatter → approval-gated publish. v2 maps this to git:

1. Capture all week (`thought`, drops into `inbox/`)
2. Triage (`process` / Cursor): stage, tags, ink
3. Publish (`draft: false` + commit)
4. Promote (note → essay) when an idea outgrows a seedling

---

## 3. What top creators actually run

### 3.1 Design engineers

| Person / practice | Stack idea | Steal | Skip |
| --- | --- | --- | --- |
| **Josh Comeau** | Next + MDX + custom widgets + Shiki | Components match medium; edit in IDE | Mongo likes, Sandpack unless needed |
| **Rauno / Vercel DE** | Prototype in code; polish what proves | Ship ink CLI before `/studio` | Over-polished author IDE first |
| **Maggie Appleton** | Astro garden + MDX + growth stages + custom components | `stage`, notes vs essays, illustrated essays | Full Astro migration (you’re already on Next) |
| **Varun Vachhar** | MDX scrollytelling: sticky figures + Intersection Observer | Later: `<SketchScroll>` for multi-page spreads | Don’t build scrolly before basic Figure works |
| **Hammayo (2026)** | Zod + Shiki + Pagefind + static export | Fail-loud schema; RSS/OG hygiene | Astro switch “at the margin” only |

### 3.2 Scribble → vault systems

| System | Visual path | Semantic path | Cadence |
| --- | --- | --- | --- |
| **Project Inkwell** | Render strokes → PNG | Claude Vision → Obsidian MD | Daily harvest cron |
| **Obsidian Transcriber** | Images in vault | Ollama VLM → structured MD | On-demand / batch folder |
| **Boris Smus** | Device sync → images | Local `qwen3-vl:8b` → vault | Cron after travel dumps |
| **RectangularFile** | E-ink PDF ingest | Any OpenAI-compatible VLM | Archive + search |
| **Autodidacts** | 600dpi scans | Local VLM; DeepSeek-OCR faster | Essay drafts from mess |

**Consensus:** visual cleanup and semantic OCR are **different jobs**. Best systems run both into one vault. kiruk.in should ship visual first (readers see the sketchbook), semantic second (you search and draft).

### 3.3 OCR accuracy (Smus, Dec 2025)

| Model | Approx. WER | Latency | Role |
| --- | --- | --- | --- |
| Claude Opus (cloud) | ~3% | ~6s/page | Ceiling / optional cloud assist |
| Qwen3-VL 8B (local) | ~5% | ~74s/page on M4 Mini | Phase N default |
| Device HWR (e-ink) | ~27% | realtime | Too noisy alone |
| Tesseract | ~95% | fast | Useless for handwriting |

Prompt discipline matters as much as the model: without a strict “OCR engine, not writing assistant” prompt, Qwen loops, “thinks out loud,” or **corrects** the author’s words (Autodidacts’ “Matthew effect” incident).

---

## 4. Deep dive — making scribble *digital* (not pasted)

### 4.1 The theme-ink loophole (research finding)

Industry pattern for monochrome icons (Bushell 2024, bitstorm 2024, Greystate 2025, Subito 2025):

```css
.ink {
  background-color: currentColor; /* or var(--text-main) */
  mask-image: url(sketch.svg);
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}
```

| Technique | Themes with era/`currentColor`? | Notes |
| --- | --- | --- |
| `<img src="file.svg">` / `next/image` | **No** | SVG is a replaced element; CSS color does not pierce in |
| CSS `mask-image` + background color | **Yes** | Best for mono pen line art; baseline browser support since ~2023 |
| Inline SVG in DOM / RSC | **Yes** | Better for multi-path, titles, aria; heavier |
| Raster PNG/WebP | No | Required fallback for dense/shaded art + OG |

**Implication:** any plan that says “vectorize to `currentColor` SVG and drop in `<Figure>` via next/image” is **incomplete**. v2 correctly requires mask or inline rendering.

kiruk.in already drives chrome via `data-era` CSS variables (`--text-main`, etc.). Theme ink should bind to those tokens so sketches feel like part of the era skin, not a white paper pasted on top.

### 4.2 Local vectorize stack (vs Adobe-only)

| Tool | Role | Why |
| --- | --- | --- |
| **sharp** | EXIF rotate, resize, trim, format | Standard Node image pipe; HEIC via optional plugin |
| **rembg** | Paper / background remove | Local, no MCP dependency |
| **vtracer** (`bw` / binary mode) | Raster → SVG for line art | O(n), handles high-res scans; better default than potrace for mixed pages; Adobe optional polish |
| **potrace** | Classic B&W trace | Fine after hard threshold; narrower than vtracer |

Research stance: **local default, Adobe optional** — matches offline authoring and avoids a single-vendor funnel.

### 4.3 Fidelity ladder (idea upgrade)

Aim up the ladder; don’t skip rungs:

1. **Legible raster** — deskewed, trimmed, WebP, never-crop frame (you have this shape already)
2. **Paperless raster** — transparent bg; no white box in dark eras
3. **Theme mono ink** — mask/inline SVG bound to `--text-main`
4. **Paired story** — `<Compare pen digital>` with shared alt/caption language
5. **Interactive presence** — sticky sketch-scroll for multi-page essays (Varun pattern); in-post `<Ink>`; studio export through same contract
6. **Semantic afterlife** — transcripts, search, draft outlines (Phase N)

Most “AI blog” stacks jump to step 6 and ship ugly step-1 screenshots. kiruk.in should own steps 1–5 first.

### 4.4 Interactive sketchbook (beyond static figures)

Not foundation — but research-backed upgrades once ink is truthful:

| Idea | Source pattern | Fit |
| --- | --- | --- |
| **Sketch-scroll** | Sticky figure column; headings drive which scan shows | Multi-page notebook spreads → guided reading |
| **Pen → digital scrub** | Compare with crossfade / slider | Your existing `<Compare>` can grow |
| **Pressure `<Ink>`** | perfect-freehand (Ruiz); used by tldraw/Excalidraw ecosystem | Huion doodles inside a post |
| **Assumed audience / stage callouts** | Appleton components | Honesty about unfinished thinking |
| **Frontmatter as interaction config** | “Living blog” architectures | e.g. `figures: [...]` for scrolly without burying layout in prose |

Rule: every interactive bit must stay optional progressive enhancement — MDX remains readable as files in git.

---

## 5. Deep dive — text thoughts (equal citizen)

Friction research (Hammayo, Alaya capture ethos, garden plugins): **opening a repo to write** kills more posts than missing Shiki.

### 5.1 Capture grades

| Grade | Latency | Artifact | Tool |
| --- | --- | --- | --- |
| L0 Spark | &lt; 10s | Line in `inbox/thoughts/YYYY-MM-DD.md` | `npm run thought "…"` |
| L1 Seedling | &lt; 2 min | `content/notes/*.mdx` draft | `npm run note` |
| L2 Essay | deliberate | `content/blog/*.mdx` + assets | `newpost` + ink + Cursor |
| L3 Evergreen | weeks/months | Linked, revised, promoted | `promote` + wikilinks |

### 5.2 Voice rule (research-hardened)

Processing may:

- suggest title, tags, stage, related links  
- structure headings  
- place `<Figure>` stubs  

Processing must **not**:

- silently “improve” wording  
- correct alleged factual slips inside OCR without marking uncertainty  
- auto-set `draft: false`

Mark uncertain OCR with an explicit convention (e.g. `¿…?`) so Phase N drafts stay honest.

### 5.3 Where Obsidian fits

| If you… | Then… |
| --- | --- |
| Already live in Obsidian daily | Optional: vault folder → `content/notes/` (ignore `.obsidian/`) |
| Don’t | Skip entirely — CLI + inbox is enough |

Appleton’s “marinate privately, author publicly” still applies: Obsidian is a marination tank, not the site CMS.

---

## 6. Platform research — loopholes in *this* repo

Aligned with v2’s audit; research rationale:

| Finding | Why it matters | Direction |
| --- | --- | --- |
| RSS advertised, route missing | Broken discovery; “unfinished” signal | Ship feed in Phase 1 |
| Sitemap HTTP-fetches `/api/blog` | Build couples to network/SITE_URL | Import `getBlogPosts()` directly |
| Hand-rolled frontmatter soft-fails | Unterminated `---` → empty data | Zod + fail loud |
| MDX `run` executes author JSX | Safe for first-party git; unsafe for remote/user MDX (see next-mdx-remote CVE-2026-0969 class issues) | Policy: first-party only; keep allow-list |
| Draft filter = `NODE_ENV===production` | Preview/prod edge cases | Explicit public filter + optional `INCLUDE_DRAFTS` |
| No theme-smart Figure yet | Era skins won’t recolor scans | Mask/inline path in Phase 2 |
| Notion client likely leftover | Dependency noise post-migration | Remove when unused |

Custom loader vs Velite/Content Collections: at one–two collections, **owned FS loader is a feature**. Migrate only on rebuild/typegen pain.

---

## 7. Target architecture (research → v2)

```
  RAW (immutable)                 ASSIST (optional)              GARDEN (human-owned)
  ───────────────                 ─────────────────              ────────────────────
  inbox/thoughts/*        ┐                              ┌──── content/notes/*.mdx
  inbox/scans/*           ├─► thought/note/ink/promote ──┤
  inbox/raw/*             ┤   draft-post skill           └──── content/blog/*.mdx
  _raw/ originals         ┘   (later) read-ink Phase N          + public/{blog,notes}/<slug>/
                                      │                              │
                                      │ draft:true only              ▼
                                      └────────────────────►  Next MDX (Zod, Shiki, links)
                                                              theme-smart Figure / InkSvg
```

**Contract:** Zod frontmatter · scoped MDX components · assets under `public/<collection>/<slug>/` · vector+raster+manifest for ink · never auto-publish.

---

## 8. Phase N — Scribble intelligence (parked; detail kept)

> Start only after Phase 2 ink is reliable. Tasks unchanged in intent from prior research; evidence strengthened above.

### N1 — Local vision OCR (privacy-first)

- [ ] Ollama or LM Studio on author machine  
- [ ] Baseline: **Qwen3-VL 8B** (~5% WER; top open OCR Arena contender per Autodidacts)  
- [ ] Faster triage: smaller VL / DeepSeek-OCR-class models  
- [ ] Strict OCR prompt (Smus): engine not assistant; no silent corrections  
- [ ] `npm run read-ink <image>` → markdown + `.transcript.md` sidecar  

### N2 — Sort & cluster ideas

- [ ] Local text model over transcripts  
- [ ] Candidates: `title`, `domain[]`/`tags[]`, `stage`, `related[]`, `excerpt`  
- [ ] Human confirm in Cursor before file writes  

### N3 — Draft article from handwritten spread

- [ ] Multi-page ordered transcripts  
- [ ] Preserve voice; figures for pages; `¿…?` for uncertain spans  
- [ ] Emit `draft: true` MDX with `<Figure>` placed  
- [ ] Diagram pages: image + caption first; Mermaid only when structure is clear  

### N4 — Diagram / sketchnote understanding

- [ ] Diagram vs prose label (heuristic or VLM)  
- [ ] Diagram → vectorize + alt/caption; light OCR  
- [ ] Prose → OCR → outline → sections  
- [ ] Region split later (don’t block v1)  

### N5 — Interactive digital afterlife

- [ ] Search transcripts  
- [ ] Backlink suggestions from tags/entities  
- [ ] `<Transcript>` toggle under figures (a11y + SEO)  
- [ ] Studio JSON + SVG through ink contract  

### N6 — Evaluation harness

- [ ] 10–20 ground-truth pages of *your* handwriting  
- [ ] WER + human “useful draft” 1–5  
- [ ] Re-bench on model swaps  

**Principle:** cloud Cursor/Claude = authoring help; on-prem VLM = private scribble ingestion; same MDX landing zone.

---

## 9. Idea upgrades (research → product imagination)

These are stronger framings for v2 — not extra phases:

1. **Thought OS, not “blog with uploads”** — capture grades L0–L3; promote as first-class.  
2. **Fidelity ladder** — stop calling white PNG screenshots “digital.”  
3. **Truthful theme ink** — mask/inline or don’t claim theme support.  
4. **Raw vs garden** — inbox is immutable-ish raw; MDX is published craft (Karpathy layers without LLM owning the garden).  
5. **Voice firewall** — OCR/draft assist must not rewrite identity.  
6. **Sketch-scroll as signature** — later differentiator for multi-page notebook essays (Varun × Appleton illustrated essay).  
7. **Same exit contract** — phone scan, Huion, Figma, studio all pass through `ink` theme-pass.  
8. **Assist ≠ publish** — `draft-post` and Phase N write drafts only.

---

## 10. Research stance (decisions)

| Topic | Stance | Why |
| --- | --- | --- |
| Next + custom MDX | Keep | Consensus + already shipping |
| Velite / Content Collections | Not now | Pain-triggered only |
| Keystatic | No | Solo + Cursor |
| Obsidian | Optional | Confirm daily use |
| Ink CLI | Local-first | Offline + no vendor lock |
| Theme ink | Mask or inline | `<img>` SVG cannot theme |
| Vectorize all | No | Always raster sibling |
| Visitor tldraw | Never | Bundle + security |
| Remote/untrusted MDX | Never | `run` executes JSX |
| Phase N now | No | After truthful ink |
| Scrolly sketch | After Phase 2–3 | Needs solid figures first |
| LLM-owned public wiki | No | Human garden; assist drafts only |

---

## 11. Sources

### Design / garden / MDX

- Josh W. Comeau — *How I Built My Blog*; contact/stack notes (MDX, Shiki, widgets)  
- Maggie Appleton — garden ethos; growth stages; colophon (flat files, MDX, private marinate)  
- Hammayo — *MDX Blog Pipeline in 2026* (Zod, Shiki, Pagefind, writing friction)  
- Rodrigo Pombo — *The X in MDX* (layouts beyond linear posts)  
- Varun Vachhar — *Scrollytelling with React* (sticky figures + IO in MDX)  
- Amytis / Velite docs — typed collections, build-time MDX  
- Dub — Content Collections as Contentlayer successor (context only)

### Scribble / OCR / local vision

- Project Inkwell — daily handwritten harvest → vision → Obsidian  
- dsebastien Obsidian Transcriber — Ollama vision → Markdown  
- Boris Smus — local e-ink VLM OCR; Qwen3-VL 8B WER table (Dec 2025)  
- The Autodidacts — usable local handwriting OCR; anti-correction prompting  
- RectangularFile — e-ink archive + OpenAI-compatible VLMs  
- OCR Arena / open-weights comparisons (referenced via Smus & Autodidacts)

### Ink / vector / theme technique

- visioncortex **vtracer** — high-res scan vectorize; `bw` mode for line art  
- **rembg** — local background removal  
- David Bushell, bitstorm.org, Greystate, Subito — CSS `mask-image` + `currentColor` for monochrome SVG  
- Steve Ruiz — `perfect-freehand` / tldraw ink primitives  

### Capture / compile patterns

- Andrej Karpathy — LLM Wiki gist (raw → compiled wiki → query; ingest/lint)  
- eBrain Gardener / Obsidian digital garden plugins — process → triage → publish  

---

## 12. One-line north star

**Capture sparks in seconds and scans in minutes; render ink that honestly follows the era skin; keep the garden human-authored; only then let a local model read your handwriting into drafts you still have to choose to publish.**
