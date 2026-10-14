# Spera — Design, Brand, Frontend, Creative & Growth

*The complete record of the design-side work: brand strategy, identity, design system, frontend and creative engineering, motion, AI design automation, growth and marketing.*

**Period covered:** 18 Feb 2026 → 22 Sep 2026 (seven months)
**Scope note:** the trading engine, execution, money model and backend services are deliberately excluded from this document. They exist, and they are substantial — but this is the design record.

---

## 0. The context in one paragraph

Spera is an algorithmic trading platform. A trader composes a strategy as a visual graph, tests whether its edge is real, and deploys it to a live exchange account. That means the design problem is not "make a pretty dashboard." It is: **make dense, high-stakes, numerically exact information legible under pressure, to an audience that will lose real money if the interface misleads them** — while the product is simultaneously operable by AI agents, marketed to a skeptical technical audience, and built by a team small enough that consistency cannot be maintained by anyone remembering to maintain it.

Every decision below follows from that.

---

## 1. Scale of the design surface

Every figure is counted from the repository.

| Dimension | Count |
|---|---|
| Applications designed and shipped | 4 — trader app, admin console, growth studio, public marketing + docs site |
| React components | 1,023 |
| — strategy builder | 448 |
| — AI surfaces | 115 |
| — charting and trading visuals | 49 |
| — UI primitives (atoms) | 38 |
| Application routes | 54 web · 14 admin · 6 studio |
| Component specs written | 184 |
| — atoms / molecules / organisms | 28 / 103 / 27 |
| — cross-cutting patterns | 12 |
| — foundations / token specs | 7 / 4 |
| Semantic design tokens | 235 |
| Components using motion | 68 (15 explicitly honoring reduced-motion) |
| Brand operating system documents | 44, across 7 phases |
| Public documentation pages | 131 |
| Automated design-governance gates in CI | 6 |
| Logo variants with usage rules | 3 |

---

## 2. Brand strategy

Not a logo and a color palette — a **44-document operating system** across seven phases, each artifact *citing* canonical sources rather than duplicating them, so brand truth and product truth cannot diverge.

**00 — Discover**
Audience truth, competitor frame, research log. Who this is actually for, what they already believe, and what the incumbents have trained them to expect.

**01 — Define**
Strategy brief, **message house**, pillar balance policy. The pillar balance policy is the unusual one: it prevents the brand from over-indexing on whichever message performed best last week, which is how technical brands slowly become marketing brands.

**02 — Express**
**Verbal kit** — the voice chart (Calm · Builder-respectful · Specific · Honest-scope · Restrained), with concrete tells and the sentence patterns to reach for and to refuse. **Visual kit** — logo system, color, type, motion, screenshot and redaction rules. **Disclaimer library** — pre-approved, legally-aware language for a financial product, so no one improvises risk copy under deadline. **Pillar example library** — what "on-message" actually looks like, shown not described.

**03 — Govern**
Decision rights (who decides what, and who merely reviews), artifact registry, design-surface SOP, digital foundation, and the **token sync pipeline** that keeps brand tokens bound to the product's source of truth.

**04 — Distribute**
Content factory, single-asset journey, **launch playbook**, **crisis playbook**, seven channel playbooks (X, LinkedIn, Instagram, YouTube, Reddit, HN/GitHub, newsletter), and four community charters (Discord, Telegram, WhatsApp) with a code of conduct.

**05 — Learn**
Drift audit with graded severities, measurement, message-test protocol. The brand is instrumented, not asserted.

**06 — Operate**
Rhythm, roles, tools stack. How the system is actually run week to week.

There is also a **strategic series working through the seven founding questions** — the engineering question, timing, monopoly, people, distribution, durability, and the secret — plus a written strategic critique of our own position. The brand rests on a stated thesis, not on taste alone.

---

## 3. Visual identity

- **The Spera glyph**, and a **three-variant logo system** with rules for each: gold on dark (default — the product is dark-first), white on dark (photography overlays and gold-tinted backgrounds where gold-on-gold fails contrast), ink on light (print and partner co-marketing, rare by design). Clear space, approved variants, and a no-recolor rule, all enforced in the asset gate.
- **Typography** — a three-role system: Geist Sans for headlines and body, Geist Mono for eyebrows, micro-lines, tags, numeric data and version stamps, and **Hyperwave Display reserved exclusively for the wordmark**, never substituted and never used elsewhere. (Hyperwave is licensed; the logo paths are Spera's own.)
- **Color** — dark-first, built entirely on semantic tokens. No raw hex anywhere in the product; the audit fails the build if one appears.
- **Accent semantics, enforced by CI.** Gold means *metered*: a solid gold button marks only an action that spends or grants plan quota — a backtest, an edge check, a deploy, an AI send, a checkout. Save, Create, Publish, Apply, Confirm and Continue use a neutral commit key. Gold is capped at roughly 10% of any canvas. This is a brand rule that a build check enforces, so accent scarcity survives every future contributor.
- **Trading color language** — a dedicated token layer for buy/sell, chart series identity, and comparison winners, so that "which one is better" is legible before anything is read.
- **Templates** — OG cards, social square templates, letterhead and formal document layouts, all composed from the live system rather than drawn separately.

---

## 4. The design system

**Specification-first.** 184 component specs organized atoms → molecules → organisms → patterns → foundations → tokens. The rule is that a component ships with its spec **in the same change** — there is no documentation backlog because documentation is not a separate task.

**Foundations** — color, typography, spacing, radius, elevation, breakpoints, motion. **Token specs** — a full token reference plus dedicated color, spacing, and trading-token specs.

**Pattern specs for the hardest surfaces**, where a component-level spec would miss the real problem:

- Glass panel — the product's signature surface treatment
- Three-column layout
- Data table
- Form layout
- Semantic surfaces and accents — the gold/commit contract above
- Comparison series identity — how competing series stay distinguishable
- AI ask surfaces — a consistent grammar for every "ask the AI" entry point
- Strategy builder workspace
- Portfolio report workspace
- Interface preferences
- Motion preferences
- UI consistency program — a phased tracker driving every recurring element to one reference

**Customizable layout system** — draggable, resizable, persisted workspace layouts with named presets, thumbnails, an edit mode with drop zones, keyboard shortcuts and a layout manager. Built across eight sequenced steps (types and registry → backend preferences API → store and persistence → renderer and tabs → drag and drop UX → manager and thumbnails → refactor → specs and audit). Layout keys are versioned, so adding a new panel cleanly invalidates stale saved layouts rather than rendering a broken grid.

---

## 5. Design engineering — making the rules executable

This is the spine of the whole approach: **a design rule that lives only in a document gets broken.** So each one became machinery.

| Gate | What it enforces |
|---|---|
| `token-audit` | No raw hex, no rgba, no off-system color anywhere in the app |
| `gold-action-audit` | The gold-means-metered contract — accent scarcity as a build check |
| `half-yellow-audit` | A specific recurring visual defect class, caught automatically |
| `brand:tokens:check` | Brand tokens stay bound to the product's source of truth, hash-verified |
| `figma-inventory:check` | Hash-based Figma ↔ code reconciliation, classifying every component as current, stale-visual, stale-state, stale-token, missing-target or blocked-mapping |
| `aeo:check` | A four-bucket scorecard (Findable · Quotable · Understandable · Trustworthy) audited before deploy |

**Cross-artifact uniformity as a design law.** Spera has three user-authored artifact kinds — strategies, modules and custom nodes. Any field that means "a property of a user-authored artifact" must land on all three, at all five layers, in one change: schema, service write path, API validation, client, **and the editor UI**. This rule was written after purpose cards shipped with backend support on all three kinds but a UI on only two — which silently made custom nodes undiscoverable while every test passed. The rule now names layer five explicitly as the one that gets forgotten, and requires generalizing the existing component rather than cloning it.

**Accessibility** built into the primitives — 678 components carry explicit ARIA, with tooltip, dialog, popover and select behavior tested at the primitive level rather than patched per usage.

**Performance as a design constraint, not an engineering afterthought.** A frontend performance program (FP-101 → FP-602, now extended into FP-700) delivered tiered fixture harnesses with reproducible artifacts, lane-separated chart rendering, viewport-first windowing, worker offload for heavy chart transforms, patch-only graph playback (playback cost scales with what changed, not with graph size), request dedupe and cancellation with stale-response suppression, sampled runtime telemetry, and a **bundle budget enforced in CI**. There is an explicit "Tier C load-shedding" behavior: under heavy load the interface degrades *visually* while remaining semantically exact — the numbers never lie to save frames.

---

## 6. Motion design

**In-product motion is a capability model, not a decoration layer.** Four boolean capabilities *are* the state — animations, glass blur, chart turbo, reduced graphics — with three presets (Full / Reduced / Minimal) as one-tap shortcuts. Flip any switch and the UI honestly reads "Custom." An earlier tier-plus-overrides model was deliberately flattened away because it made it impossible to tell what had changed versus what had been inherited.

The hard guarantee: **motion preferences must never affect strategy evaluation, backtest math or signal generation.** Spera runs on a low-end laptop, an old phone, or an unaccelerated GPU with every byte of trading logic identical.

**Motion laws** — a living rulebook for video and animation, appended every time a mistake is flagged. The standing law: *motion is earned. If a motion carries no meaning, cut it.* No decorative animation, one focal movement per beat, no parallax on the logo glyph.

**The motion toolchain** — `packages/studio-motion` renders HTML and CSS to deterministic MP4 through HyperFrames, with Lottie for vector motion graphics. Marketing motion is composed from real product tokens and components, so it cannot drift from the product it advertises.

---

## 7. Creative development — the public surfaces

The marketing site is not a template. Every visual is a bespoke, animated, token-bound React component.

- **Landing hero — "the tape."** A live candle-tape field with a moving read-head and volume treatment, built as its own module with its own tested logic. The product's subject matter *is* the hero animation.
- **Product showcase** — hand-built mock surfaces (chart, equity curve, backtest panel, chat panel, logic deck, strategy graph, window frame) composed into build / validate / run illustrations with a dedicated motion module and count-up hooks. Real interface language, without shipping screenshots that go stale.
- **Philosophy page** — scroll-driven principle scenes with a deliberate before-and-after pattern: a degraded "most platforms" animation beside the real "on Spera" behavior, staggered on view, reduced-motion gated. The critique is shown, not claimed. Side-by-side was kept instead of a toggle, because a toggle hid the contrast.
- **MCP connection scene** — an animated depiction of external agents connecting, with client marks and an install picker.
- **Persona visuals, journey chart, candle glyph, comparison rows, process loop, footer dot-matrix, a custom cursor treatment**, a mega-menu, smooth hash navigation, a reveal primitive, and a prose renderer shared across docs, blog and handbook.
- **68 components use motion; 15 explicitly honor reduced-motion preferences** — the honoring concentrated exactly where looping and scroll-driven animation lives.

**Public surfaces shipped:** landing, philosophy, pricing (with FAQ and finale), blog, handbook, a 131-page documentation manual, an Ask-AI surface, and the MCP adoption page — plus auth, onboarding, settings, billing and exchange-connection flows on the product side.

---

## 8. Product design — the hard surfaces

**The strategy builder** (448 components) — a node-graph editor with a palette organized by category, typed ports, module composition, a logic deck, candle-by-candle simulation playback, an onboarding overlay, multi-tab editing and an AI chat panel docked into the same workspace. Node categories carry fixed accent semantics; card bodies always use glass tokens and never the accent as a fill.

**Comparison and evaluation** — the surface where most of the design thinking went, because this is where a trader decides what to trust:

- The Field view originally showed five of sixteen metrics with no way to change that; it became a full, configurable field read.
- It spoke two color languages in every cell; it now names winners in one.
- The hover covered a quarter of the panel; it became three lines beside it.
- Rows became mild glass tiles — "the fill without the edge."
- Values read from one pinned header, and the rows went quiet.
- Finally: the field reads as cards, with the best result as the one mark.

Six deliberate passes on one surface, each one removing something.

**The portfolio report** — risk analytics, a risk budget, benchmark comparison, robustness reads, diversification, stress testing, monthly breakdowns, and a **Rejections panel** structured as *why → where → which*: a reason summary where every chip is a filter, a one-line fix for the leading cause, a per-strategy rail, then the individual rows. When counts and rows come from different sources, the gap is stated rather than hidden.

**The Edge Report** — eight independent statistical reads on whether a strategy's edge is real, each needing to be legible to someone who is not a statistician.

**Fleet** — deployment wizard, grouped bot views, live-updating status, and a liveness model rebuilt around reported health rather than inference.

**Also designed:** marketplace (browse, publish, clone, author pages), a curated Editor's Pick catalog, module and custom-node builder redesigns (nine phases across the two), the admin console (eight analytics dimensions, feedback triage, inbox, billing), Growth Studio (brief, posts, channels, analytics), a global feedback capture system reachable from every workspace, a notification centre, chart drawing tools, and timezone-aware date and time inputs built from scratch.

---

## 9. AI-automated design — the part with no obvious precedent

The brief was: make the design system produce work, not just constrain it.

**A machine taste gate.** `taste.md` compiles the human quality gates into automated checks every generated asset must pass before it can be published. The governing insight is stated plainly in the document: *for a trading product, the worst output is not ugly — it is non-compliant or leaking real data.* So compliance and data-leak violations **fail hard and can never auto-publish**, while aesthetic violations flag for regeneration. Severity is borrowed from the brand drift-audit grading, so one severity language runs from brand strategy through to CI.

**Voice injection.** `tone.md` compiles the verbal kit into a system preamble prepended to every copy-generating job — the voice chart with its concrete tells, and the sentence patterns to reach for and refuse. It does not redefine the voice; it specifies how the voice is *injected* and what the machine checks afterward.

**Living rulebooks that learn.** `poster-laws.md` and `motion-laws.md` are append-only. Every time a mistake is flagged, a numbered law is written — mistake → law → why → date — and the design agent reads the rulebook **first**, before authoring anything. The header says it outright: corrections given only in chat do not persist; only what is written is enforced next time. The same mistake cannot be made twice.

**A dedicated AI production designer.** A `studio-designer` agent plus `studio-design`, `studio-motion` and `studio-imagegen` skills run a closed loop: wireframe the layout cheaply → author from real components → render actual pixels → read them back → self-critique → refine → hand off something editable. It never ships a mockup and never claims a result it has not looked at.

**The render path.** `packages/studio-render` composes real Spera tokens, fonts and the logo glyph through headless Chromium to PNG. `packages/studio-motion` does the same for video. Marketing assets are *generated from the live design system*, which makes brand drift structurally impossible rather than merely discouraged.

The net effect: brand governance, design system, and asset production are one continuous pipeline. A rule written in the brand OS is compiled into a gate, enforced on generated output, and appended to when it's found wanting.

---

## 10. Growth and marketing

**First-party analytics, built rather than bought.** A clean event taxonomy validated against a shared object-action catalog; a tiny batched tracker instead of a 30–60 KB vendor SDK; writes to our own database; an isolated analytics store; 90-day raw retention with roughly 26-month identifier-free rollups. Designed for funnel, retention and attribution analysis across the landing page, the signup and signin funnels, and core in-app actions.

**A stated trust contract** — visible in the UI and in every export:
- Behavioral numbers are consented-only, and say so.
- Revenue comes from a billing-owned aggregate; it is never inferred from browser events and never joined to individual users.
- USD and INR are reported separately, with no synthetic currency conversion.
- **Session replay and individual-user exploration are deliberately out of scope.** Choosing not to surveil is a stated position, not an unbuilt feature.

**Admin analytics** across eight dimensions — AI, fleet, growth, portfolio, reliability, revenue, strategy, and an overall view — so growth decisions are made against the same numbers the product reports.

**AEO — designing for answer engines.** A four-bucket scorecard (Findable · Quotable · Understandable · Trustworthy) graded against the actual source files and run before deploy, so the product stays accurately representable when an AI assistant is asked what Spera is. Paired with structured data, a public Ask-AI surface, and a documentation manual written to be quotable.

**The content platform.** A reusable MDX engine powering a 131-page public manual, the blog, and the handbook, with a three-column layout (navigation / prose / scroll-spy table of contents). The node reference inside it is **generated from the engine itself**, with a drift gate that fails the build if the committed pages are stale or if a new feature lacks its prose entry — documentation that cannot rot.

**Distribution, planned not improvised.** Seven channel playbooks, four community charters with a code of conduct, a content factory, a single-asset journey, a launch playbook and a crisis playbook — written before they were needed.

**Growth Studio.** A dedicated domain (`apps/studio` + growth service + shared package) that was **pivoted mid-flight** from an asset factory to a growth-intelligence loop: create assets in-editor at near-zero marginal cost → publish through free native APIs → store only post records and metrics → derive insights and trends → feed the next brief. The pivot removed an entire asset-generation service and asset storage layer from the plan. Cutting scope on your own idea, in writing, with the reasoning recorded, is the work.

**Adoption design.** Making the product reachable was treated as a design problem: a no-terminal install path for the MCP server, install deeplinks per client, a published registry manifest, client marks and an install picker — and the generated canonical URL, because the hand-typed variant silently produces a read-only grant that fails on first write.

---

## 11. Content and UX writing

- **131 documentation pages** in the public manual, plus 226 internal documents.
- **A disclaimer library** — pre-approved risk language for a financial product, so nobody writes compliance copy under deadline.
- **Rejection and error copy as a shared table** — every refusal reason has one canonical sentence, used identically by the builder notice and the report panel, so the product never explains the same event two different ways.
- **Node prose** — a required, hand-written explanation for every strategy node; the documentation build fails if a new node ships without one.
- **Product vocabulary locked in specs** — fleet and deploy terminology, wizard step order, and grading language are written down, so the words do not drift between surfaces.
- The standing editorial rule across all of it: **link, don't duplicate.** Single source of truth per topic.

---

## 12. How it unfolded

| Period | Design, brand, frontend and growth milestones |
|---|---|
| **Feb – Mar 2026** | Strategy builder and chart ecosystem; simulation and playback UX; auth and account surfaces; frontend performance program FP-101 → FP-602 (worker offload, viewport windowing, patch-only playback, load shedding). |
| **Mar 2026** | Strategy comparison and evaluation UI — metrics, grading, benchmark presentation, built-in templates. |
| **Apr – May 2026** | Customizable layout system, all eight steps; multi-timeframe chart surfaces; hedge-mode UI; chart timezone and max-candle handling; first-party analytics pipeline and landing collectors. |
| **Jun 2026** | Module builder redesign (six phases); custom-node builder redesign (three phases); Philosophy page; AI plan-mode UX; multi-tab builder and AI chat routing. |
| **Jul 2026** | Portfolio and fleet surfaces; deploy-in-one-action; Editor's Pick catalog presentation; admin console and admin UX; feedback overhaul across three phases plus global capture shortcuts; Spera Score surfaces. |
| **Aug 2026** | Landing hero tape; Ask AI and AEO for the public site; MCP adoption made terminal-free with install deeplinks and client marks; discovery panel UX; admin analytics v2; bundle-budget CI gate. |
| **Sep 2026** | Six-pass redesign of the comparison Field view; Edge Report visual language; portfolio Stress, Diversification and Monthly panels rewritten to answer before explaining; the Rejections panel; compare equity and radar brought into one color language. |

---

## 13. Role-framed summaries

Pick the framing that matches the role you are applying for. All of these describe the same body of work.

### As Brand Strategist

- Authored Spera's brand operating system — 44 documents across discover, define, express, govern, distribute, learn and operate — covering audience truth, competitor framing, message house, pillar balance policy, verbal and visual kits, decision rights, seven channel playbooks, four community charters, launch and crisis playbooks, and a drift audit with graded severities.
- Built the brand on a written strategic thesis, working through the seven founding questions — engineering, timing, monopoly, people, distribution, durability and the secret — including a critique of our own position.
- Defined a voice with concrete tells and explicit refusals, then compiled it into a system preamble injected into every generated piece of copy, with machine-checked violations.
- Wrote the disclaimer library for a financial product so risk language is pre-approved rather than improvised, and built brand governance where every artifact cites canonical sources instead of duplicating them — making brand truth and product truth structurally unable to diverge.

### As Design Lead / Product Designer

- Designed four shipped applications and 54 product routes around a single hard problem: making dense, exact, high-stakes trading information legible to someone who will lose real money if the interface misleads them.
- Built a specification-first design system — 235 semantic tokens and 184 specs across atoms, molecules, organisms, patterns and foundations — with the rule that a component ships with its spec in the same change.
- Designed the strategy builder (448 components), the portfolio report, the fleet, the marketplace, the admin console, and the comparison surface — the last through six deliberate passes, each one removing something rather than adding.
- Established cross-artifact uniformity as a design law after a field shipped with backend support everywhere but a UI on only two of three artifact kinds, silently degrading discoverability while every test passed.

### As Design Engineer / Design Technologist

- Made design rules executable: six automated governance gates in CI covering off-system color, accent semantics, a recurring visual defect class, brand-token binding, hash-based Figma-to-code reconciliation, and answer-engine readability.
- Enforced accent scarcity as a build check — gold marks only actions that spend plan quota, capped at ~10% of canvas — so a brand rule survives every future contributor instead of depending on memory.
- Built a hash-based Figma reconciliation inventory classifying every component as current, stale-visual, stale-state, stale-token, missing or blocked, turning design drift into a tracked, gradeable quantity.
- Treated performance as a design constraint: tiered fixture harnesses, worker offload, viewport-first windowing, patch-only playback updates, request cancellation with stale-response suppression, a CI bundle budget, and a load-shedding tier that degrades visually while keeping every number exact.

### As Creative Developer / Frontend

- Built the entire public surface as bespoke animated components rather than templates — a live candle-tape hero with a moving read-head, hand-built product mock surfaces composed into build/validate/run illustrations, and scroll-driven philosophy scenes that show a degraded "most platforms" behavior beside the real one.
- Shipped motion across 68 components with reduced-motion honored where looping and scroll-driven animation lives, and an app-wide motion capability model — four switches, three presets — that lets Spera run on low-end hardware while guaranteeing trading math is untouched.
- Built the customizable workspace layout system end to end: drag, drop zones, edit mode, presets, thumbnails, keyboard shortcuts, persistence and versioned layout keys.
- Built a reusable MDX content platform behind a 131-page manual, blog and handbook, with generated reference pages and a drift gate so documentation cannot go stale.

### As Design + AI / Creative Technologist

- Built an AI design production pipeline that composes real product components and tokens, renders actual pixels through headless Chromium, reads them back, critiques itself and refines — it never ships a mockup and never claims a result it has not looked at.
- Compiled the brand's human quality gates into a machine gate every generated asset must clear, where compliance and data-leak violations fail hard and can never auto-publish while aesthetic violations trigger regeneration.
- Designed a feedback loop that compounds: every flagged mistake is appended as a numbered law to a living rulebook the design agent reads before authoring, so a correction never has to be given twice.
- Built an HTML-to-MP4 motion pipeline and a poster render engine from the live design system, making brand drift structurally impossible rather than merely discouraged.

### As Growth / Marketing

- Built first-party product analytics instead of buying it — a clean event taxonomy, a tiny batched tracker in place of a 30–60 KB vendor SDK, our own storage, and eight admin analytics dimensions from AI to revenue.
- Published a trust contract in the UI and in exports: consented-only behavioral data, revenue never inferred from browser events, currencies never synthetically converted, and session replay deliberately out of scope.
- Designed Spera for answer engines with a Findable / Quotable / Understandable / Trustworthy scorecard graded against source files before every deploy, paired with a public Ask-AI surface and a manual written to be quotable.
- Planned distribution before it was needed — seven channel playbooks, four community charters, a content factory, a launch playbook and a crisis playbook — and pivoted the growth domain mid-flight from an asset factory to a growth-intelligence loop, removing an entire service from the plan and recording why.

---

## 14. The through-line

One idea runs through all of it: **make the rule executable.**

A design rule that lives only in a document gets broken. A brand correction given only in conversation is forgotten. A consistency standard that depends on everyone remembering it fails the moment the team grows or the deadline tightens.

So the color rule became a CI audit. The accent rule became a build gate. The Figma-to-code relationship became a hashed inventory with drift classes. The brand's quality bar became a machine gate on generated output. And the design feedback itself became an append-only rulebook that the tooling reads before it draws anything.

The design system does not just constrain the work. It produces it, checks it, and learns from every correction.
