# Spera — What We Built, End to End

*A complete record of the product, the system, and the operating machinery built from the first commit to today.*

**Period covered:** 18 Feb 2026 → 22 Sep 2026 (seven months)
**Product version at time of writing:** 0.6.52
**Repository:** `spera-v2` — a dual-stack monorepo (TypeScript + Go)

---

## 0. What Spera is

Spera is an algorithmic trading platform for crypto. A trader composes a strategy as a **visual graph** — data nodes, indicators, conditions, actions, risk rails — then backtests it against real market history, stress-tests whether the edge is real, deploys it to paper, and finally to a live Binance account. Portfolios combine several strategies into one account with shared capital, margin and risk.

Two things make it structurally different from the category:

1. **The same engine runs everywhere.** Backtest, paper and live are not three implementations that "roughly agree" — they are one money model, verified to agree bit-for-bit by an automated parity suite.
2. **AI is a first-class operator, not a chat bubble.** Spera can be built and driven by an AI agent — in-app, or from Claude, Cursor or Codex through a published MCP server — with the same permissions, quotas and guardrails as a human.

---

## 1. Scale, in numbers

Every figure below is counted from the repository, not estimated.

| Dimension | Count |
|---|---|
| Commits | 1,053 |
| Logged, completed deliveries (task ledger) | 215 |
| Applications shipped | 4 — trader web app, admin console, growth studio, API gateway |
| Backend services | 18 (NestJS + Go) |
| Shared packages | 12 |
| React components | 1,023 (448 in the strategy builder alone, 115 AI surfaces, 49 charting) |
| Application routes | 54 web + 14 admin + 6 studio |
| Strategy node types | 109 (21 indicators, 58 state, 9 conditions, 9 actions, 8 data, plus math / module / display / custom) |
| Test files | 2,362 (867 Go, 1,495 TypeScript) |
| Design specs | 184 (28 atoms, 103 molecules, 27 organisms, 12 patterns, 7 foundations, 4 token specs) |
| Design tokens | 235 semantic tokens |
| Repository documentation | 226 documents (86 feature guides, 23 runbooks) |
| Public documentation manual | 131 pages |
| Brand operating system | 44 documents across 7 phases |
| MCP tools exposed to external agents | 42 |
| Portable agent skills published | 8 |

---

## 2. The trading engine

The core is a **composable unit model**: atomic *nodes* declare typed inputs and outputs and hold no shared state; composite *modules* are reusable subgraphs with their own typed I/O and lifecycle; a *strategy* is the root graph. The same abstraction covers a two-node toy and a twenty-leg portfolio.

**What was built into it**

- **109 node types** across nine categories, each one implemented twice — once in TypeScript for the contract and the editor, once in Go for execution — with an automated schema gate that fails the build if the two drift.
- **21 technical indicators** (EMA, SMA, RSI, ATR, Bollinger Bands, ALMA, HMA, RMA, VWMA, percentile rank and more), every one implemented as an **incremental O(1)-per-candle** computation with ring-buffer state, and every one verified against TA-Lib reference output plus a real BTC series.
- **58 state nodes** giving strategies read-only access to position, trade history, performance, account and time context — including hedge-aware, indexed trade access.
- **Orthogonal data grids.** Some series publish on their own cadence (daily funding, derivatives metrics, sentiment, multi-timeframe OHLCV) and hold their value between publications. A grid-aware stepping contract was designed so an EMA(20) over a daily series spans twenty *days*, not twenty minutes — a class of silent, invisible bug that had affected five of six bucketed series.
- **Custom code nodes** — user-authored logic, compiled and signed, with a production signing pipeline and an AI repair harness for when compilation fails.
- **Module system** — reusable subgraphs that can be authored standalone in a scratchpad workbench, versioned, published and shared.
- **Immutable execution versions** with a configurable default branch, so a deployed bot's logic can never silently change beneath it.

**The money model**

This is the part most trading products get wrong, and it received dedicated engineering:

- The **ledger boundary is exact decimal** (12-decimal quantization); the indicator and projection hot path stays `float64`. Decimal never enters the per-candle loop, so the O(1) budget survives.
- **Per-symbol exchange filters** — tick size, lot size, step size, minimum notional — are resolved live from Binance and applied *inside* the engine. Orders below the minimum are rejected exactly as Binance rejects them, and the rejection is recorded with its reason.
- **Margin and liquidation follow Binance's real bracket schedule** at the mark price. A shared portfolio pool behaves as one cross-margin account.
- **Funding is charged in every engine** — backtest, paper and live.
- **Hedge mode** — simultaneous long and short, per-side pyramiding, cross margin.
- **Batch ↔ paper parity is bit-for-bit**, asserted by equality and never by tolerance. When a scenario failed, the fix was always to correct the engine, never to loosen the comparison.

---

## 3. Research and proof — does the edge actually exist?

Most platforms stop at "here is your backtest curve." Spera treats a backtest as a claim that has to survive interrogation, and shipped an **Edge Check** with eight independent reads:

1. **Out-of-sample holdout** — does it work on data it never saw?
2. **Track-record sufficiency (MinTRL)** — is there even enough evidence to trust the Sharpe ratio?
3. **Trade-order Monte Carlo** — is the drawdown you were shown the one you should plan for, or a lucky ordering?
4. **Random-entry benchmark** — did the entry logic do anything at all, or would coin flips have done the same?
5. **Walk-forward consistency** — does the edge exist in *every* period, or in one lucky window?
6. **Across market conditions** — regime buckets, so a bull-only strategy cannot masquerade as a general one.
7. **Parameter sensitivity** — is this a robust plateau or a knife edge?
8. **Versus shuffled market** — does the edge survive when the market's structure is destroyed?

On top: **deflated Sharpe**, **trial accounting** (so repeated searching is penalized rather than rewarded), and a **sealed evaluation** that a strategy can only be graded against once. Branch comparison and parameter sweeps run across sixteen metrics with a field view that names winners rather than just ranking rows.

Buy-and-hold benchmarking was corrected to be unleveraged (an early version reported "buy & hold = −543%"), and strategy **advisories** were reframed from warnings nobody reads into things that prevent, correct or gate.

---

## 4. Paper and live execution

- **Paper trader (Go)** — a full simulated venue with order types, partial fills, scale-outs, brackets, restart fidelity and a durable money checkpoint. Deterministic warmup-to-live boundary, so two bots deployed at the same moment behave identically.
- **Live execution (Go)** — owner-bound Binance order flow with a durable intent/report journal, restart reconciliation, account leases, private-stream recovery, protection orders, and per-bot and per-account risk rails.
- **Pre-deploy account review** — reads the real account (per-symbol leverage, margin type, co-tenancy, available funds), plans the required changes, and only writes what the user explicitly confirmed, then reads it back.
- **Co-tenancy** — several strategies can trade one futures symbol on one account, surviving Binance's self-trade prevention and a position-mode change made outside the product.
- **Resilience engineered from real incidents.** Live trading no longer depends on a remote database being reachable. A slow database stops one bot instead of the fleet. A network timeout is no longer misclassified as a rejection (that bug once killed the live fleet). An exposure finding stops the bots that own the drift, not every bot on the account. Bot liveness was rebuilt around engine-reported health rather than inference.
- **Fleet** — list, deploy wizard, per-bot detail, grouped views, live updates over a per-user SSE channel with cross-tenant filtering and heartbeats.

## 5. Portfolios

A portfolio is one trading account holding many strategies:

- Legs own their own settings copies, with drift detection and sync.
- **Shared cash pool** and **fixed-weight** allocation models, each with a production hardening pass and a dedicated proof suite.
- **Rebalancing moves real capital** — in backtest, paper and live, identically.
- **One risk policy** — drawdown tiers from the high-water mark, daily loss limits, exposure caps, cash reserve, compounding rules, leg limits, staged states — enforced the same way in all three engines.
- **Portfolio report** — risk analytics, a risk budget, benchmark comparison, robustness reads, diversification, stress testing, monthly breakdowns, and a first-class **Rejections panel** that shows every refused entry and the true reason it was refused.
- Portfolios are **portable** (export/import) and **buildable over MCP**, with concurrent-edit protection.

---

## 6. The AI system

**In-product AI**

- One Spera AI conversation backed by a **mandatory supervisor** plus isolated specialists for artifact building, documentation, research, analysis, planning, discovery and verification.
- **Plan mode** — a read-only planner that proposes, waits for approval, then builds against the approved plan, with a revise loop.
- **Project Knowledge workspace** — project-scoped documents the AI reads and writes with revision-pinned citations, including a protected `STRATEGY.md` that requires explicit acceptance to change.
- **Scratchpad** — a first-class workspace where the AI can author modules and custom nodes standalone, without inventing a strategy to host them.
- **Candle-mention analyst** — select a candle or range on the chart and ask about it.
- **Offline evaluation harness** and **persistent structured observability**, so AI quality is measured rather than vibed.
- A configurable included model with a rolling token quota, and prompt caching for cost control.

Hard AI bugs found and fixed along the way are as telling as the features: a runaway build loop that minted four modules from one request; AI-built modules silently never saved; cross-project loader leaks; unsaved builder work destroyed by a project switch (five data-loss paths, one root cause); the AI refusing to build in an empty project.

**External agents — the MCP server**

- A stateless, per-request **OAuth-protected MCP endpoint** exposing **42 tools** over a versioned External Agent Contract.
- Read and authoring scopes are separated; the authoring grant covers artifacts, backtests, project knowledge and documentation. Bot and fleet lifecycle is deliberately **excluded** — an agent can build and test, but cannot deploy capital.
- **8 portable skills** published for Claude, Cursor and Codex, covering strategy building, module building, custom nodes, backtesting, knowledge, documentation and delivery.
- A public **registry manifest**, a no-terminal adoption path, install deeplinks, and a generated tool reference that cannot drift from the contract.
- Backtest quotas are charged per strategy run — the same for browser, MCP and AI — so no surface is a loophole.

---

## 7. Design — identity, system, and the machine that enforces it

**Identity**

- The Spera glyph and a **three-variant logo system** (gold on dark, white on dark, ink on light) with usage rules, clear space and contrast guidance.
- A **dark-first color system**, a locked type hierarchy (Geist Sans and Mono for the interface; Hyperwave Display reserved exclusively for the wordmark), and OG plus social templates so every outbound asset stays on-system.

**Design system**

- **235 semantic tokens** and **184 component specs** organized atoms → molecules → organisms → patterns → foundations → tokens. The spec ships in the same change as the component; there is no drawer of stale documentation.
- Cross-cutting pattern specs for the hardest surfaces: glass panels, three-column layouts, data tables, form layout, comparison identity, AI ask surfaces, the strategy builder workspace, the portfolio report workspace, motion preferences, and a UI consistency program.
- A **customizable layout system** — draggable, persisted, preset-backed workspace layouts with thumbnails and keyboard shortcuts, built over eight sequenced steps.

**Automated design governance** — the part that makes consistency survive velocity:

- `token-audit` — fails the build on raw hex or off-system color.
- `gold-action-audit` — enforces a semantic rule: solid gold marks only actions that spend or grant quota. Save, Create, Publish and Confirm use a neutral commit key. Accent scarcity is enforced by CI, not by memory.
- `half-yellow-audit` — catches a specific recurring visual defect class.
- `brand:tokens:check` — keeps the brand token pipeline synchronized with the product's source of truth.
- `figma-inventory:check` — a hash-based Figma-to-code reconciliation inventory classifying every component as current, stale-visual, stale-state, stale-token, missing or blocked.
- `aeo:check` — a four-bucket scorecard (Findable / Quotable / Understandable / Trustworthy) audited before deploy, so the product stays accurately representable by AI answer engines.

**Motion**

An app-wide motion model where **four capability switches are the state** — animations, glass blur, chart turbo, reduced graphics — with three presets (Full / Reduced / Minimal) as one-tap shortcuts. Designed so a low-end laptop, an old phone or an unaccelerated GPU runs Spera smoothly, and guaranteed never to touch strategy evaluation, backtest math or signal generation. The earlier inherited-versus-overridden model was deliberately flattened away because it was impossible to read.

---

## 8. The brand operating system, and the AI that obeys it

A **44-document brand OS** spanning seven phases:

- **Discover** — audience truth, competitor frame, research log.
- **Define** — strategy brief, message house, pillar balance policy.
- **Express** — verbal kit, visual kit, disclaimer library, pillar example library.
- **Govern** — decision rights, artifact registry, design-surface SOP, digital foundation, token sync pipeline.
- **Distribute** — content factory, launch playbook, crisis playbook, single-asset journey, seven channel playbooks (X, LinkedIn, Instagram, YouTube, Reddit, HN/GitHub, newsletter), four community charters with a code of conduct.
- **Learn** — drift audit, measurement, message-test protocol.
- **Operate** — rhythm, roles, tools stack.

Every document **cites** canonical sources rather than duplicating them, so brand truth and product truth cannot diverge.

**Then it was made executable.** This is the piece with no obvious precedent:

- **`taste.md`** compiles the human quality gates into a machine gate every generated asset must clear before publishing. Compliance and data-leak violations fail hard and can never auto-publish; aesthetic violations flag for regeneration. The governing insight is stated plainly: for a trading product, the worst output is not ugly — it is non-compliant or leaking real data.
- **`tone.md`** injects the canonical voice as a compiled system preamble into every copy-generating job, with machine-checked violations.
- **`poster-laws.md`** and **`motion-laws.md`** are living rulebooks. Every time a mistake is flagged, a numbered law is appended — mistake, law, why, date — and the design agent reads them *first*, before authoring anything. Corrections made only in chat do not persist; only what is written is enforced. The same mistake cannot be made twice.
- A **`studio-designer` agent** plus **`studio-design`**, **`studio-motion`** and **`studio-imagegen`** skills run a closed production loop: author from real components → render actual pixels → read them back → self-critique → refine → hand off editable. It never ships a mockup and never claims a result it has not looked at.
- **`packages/studio-render`** composes real product tokens, fonts and the Spera glyph through headless Chromium to PNG. **`packages/studio-motion`** renders HTML and CSS to deterministic MP4, with Lottie for vector motion.

The result: marketing output is *generated from the live design system*, so brand assets are structurally incapable of falling out of sync with the product.

---

## 9. Growth, analytics and go-to-market

- **First-party product analytics**, built rather than bought: a clean event taxonomy validated against a shared object-action catalog, a tiny batched tracker with no 30–60 KB vendor SDK, writes to our own database, an isolated analytics database, 90-day raw retention and ~26-month identifier-free rollups.
- **A trust contract, stated in the UI and in exports.** Behavioral numbers are consented-only. Revenue comes from a billing-owned aggregate, never inferred from browser events and never joined to individual users. USD and INR are reported separately with no synthetic conversion. Every event carries a stable UUID, making a single database write the sole idempotency claim. **Session replay and individual-user exploration are deliberately out of scope** — a design position, not a gap.
- **Admin analytics** across eight dimensions: AI, fleet, growth, portfolio, reliability, revenue, strategy and overall.
- **Growth Studio** (`apps/studio` + `services/growth` + `packages/studio-core`) — pivoted mid-flight from an asset factory to a **growth-intelligence loop**: create assets in-editor at zero marginal cost, publish through free native APIs, store only post records and metrics, derive insights and trends, and feed the next brief.
- **Public surface**: landing page with an animated tape, philosophy page, pricing, blog, a 131-page documentation manual on a reusable MDX content platform, an Ask-AI surface, and the MCP adoption page.

---

## 10. Monetization and accounts

- **Two-provider billing registry** — xpay for global USD, Razorpay for domestic India INR — selected by IP geography at checkout and by the stored provider per subscription thereafter.
- Webhook-as-source-of-truth: verify over exact bytes → idempotency log → pure state machine → push the entitled tier. Grace until period end; the tier only drops on a terminal event. Money is integer cents and paise, never floating point.
- **Subscription enforcement** on bots, including downgrade and expiry grace, plus admin billing repair operations.
- **Auth**: JWT with refresh, email verification, password reset, Google OAuth, two-factor, session management, and API-key auth for bots.
- **Quotas and entitlements** — bot limits, AI token quotas, backtest run charges — enforced identically across the browser, the AI and MCP.
- A **notification centre** consuming a durable error stream with consumer groups, automatic claim recovery and a dead-letter queue after five failed deliveries, plus transactional email through a leased outbox.
- **Marketplace** — publish, browse, clone and attribute strategies, modules and custom nodes, with an **Editor's Pick catalog of 24 curated strategies** covering every engine surface, all parity-verified.
- **Feedback** — global capture shortcuts on every workspace, triage in admin, reporter-visible notes and status.

---

## 11. Quality engineering

Quality here is machinery, not intention.

- **2,362 test files.** Tiered coverage floors per workspace, with the money and auth paths at the strictest tier.
- **Diff coverage gates** — new code must be covered, enforced per workspace, with ratchet floors that can only move up.
- **Mutation testing** on the money and risk paths — a suite is only trusted if it kills injected mutants. The book-risk suite kills 10 of 10.
- **Behavioral scenario suites** for the trading engine, modules, custom nodes and the paper money model, with an exhaustive coverage ledger tracking every closed gap.
- **Dual-stack parity goldens** — 18 indicators asserted identical across TypeScript and Go.
- **A pre-push gate** running the full ladder across every workspace before anything reaches the remote.
- **A frontend performance program** — tiered fixture harnesses, lane-separated chart rendering, viewport-first windowing, worker offload, patch-only graph playback, request dedupe and cancellation, sampled runtime telemetry, and a strict bundle budget enforced in CI.

These tests find real defects rather than decorating the build. A single coverage pass on the live money path surfaced two silent bugs: a BSON codec registration gap that made every live pool member's runtime document decode to an empty value **with no error** — voiding a capital-retirement invariant and letting survivors inherit a stopped member's losses — and a memory store sharing mutable maps and pointers with its callers, so restoring a book and stepping it rewrote the supposedly persisted risk rails.

---

## 12. Documentation and agent operability

- **226 repository documents** — architecture, 86 feature guides, 23 runbooks, API specifications, ADRs, and a strategic `zero-to-one` series working through the seven founding questions.
- **Generated documentation with drift gates** — the node reference and the MCP tool reference are generated from the source of truth, and the build fails if the committed output is stale or if a new node or tool lacks its prose entry.
- **Agent adapters, generated not hand-written** — Claude, Cursor and Codex configurations all derive from one canonical MCP profile, with verification commands that fail on drift.
- **A persistent task ledger** — active work in `TASKS.md`, linked detailed plans, dated completion records, archived windows, and review trackers, with a workflow check that enforces the lifecycle.
- **Public manual** at `/docs` on a reusable MDX content platform, with the node reference generated from the engine itself.

---

## 13. Infrastructure and operations

- **Local**: a dev runner with named profiles, port authority, readiness patterns and an aggregate ready banner; SWC for every NestJS service, `air` for Go hot reload, Turbopack with persistent caching for the web app.
- **Containers**: a free always-on paper-trading stack via Docker Compose.
- **Cloud**: an Azure testnet execution VM with a hybrid local profile, continuous deployment, a production launch runbook, a self-hosted build agent, and a cost-controlled PaaS baseline in progress.
- **Operational runbooks** for exchange migration, Binance testnet soak testing, Mongo index maintenance, billing sandbox QA, feature flags, release versioning, and MCP app-store submission.

---

## 14. The order it happened in

| Period | What landed |
|---|---|
| **Feb – Mar 2026** | Strategy graph engine foundations; node system across both stacks; simulation and playback UX; state-aware execution; strategy version control; auth, security and accounts; builder and chart ecosystem; community modules. |
| **Mar 2026** | Strategy comparison and evaluation — enhanced metrics and grading, buy-and-hold benchmarking, built-in templates. Frontend performance program FP-101 → FP-602. |
| **Apr – May 2026** | Customizable layout system; multi-pair and multi-timeframe data; hedge mode; per-strategy backtest settings; module and custom-node builder redesigns; first-party analytics pipeline. |
| **Jun 2026** | Paper trading end to end; paper-to-backtest parity hardening; trading-engine behavioral regression suites; AI plan mode; AI observability and offline evaluation; Philosophy page. |
| **Jul 2026** | Portfolios — fixed-weight and shared-pool, each with production hardening and proof suites; per-symbol Binance precision; fleet deployment in one action; Editor's Pick catalog; admin surface; feedback overhaul; subscription enforcement. |
| **Aug 2026** | Live execution resilience and incident response; the Edge Check's eight reads; MCP made adoptable without a terminal; external agents can run the edge check; artifact export/import; Ask AI and AEO for the public site; billing repair operations; immutable execution versions. |
| **Sep 2026** | Portfolio account, margin and risk unified across all three engines; portfolio rebalancing with real capital; research studies with deflated Sharpe and sealed tests; comparison field view redesign; co-tenant live trading; the Rejections panel; a diff-coverage pass that caught two silent money bugs. |

---

## 15. What is in flight

Percentile-rank indicator; Spera cards (in-chat UI for MCP hosts); branch-sweep follow-ups; Edge Report data-visualization deepening across three waves; OpenAI MCP resubmission; derivatives-metrics paper-to-live parity; exchange-connection key health; the frontend performance measurable program (FP-700 series); production-readiness remediation across all services; analytics v3; the Azure PaaS launch; launch-grade bot preflight with guided remediation; the UI consistency program; AI Harness v2 (workspace-centric multi-artifact addressing); Growth Studio loop automation; documentation and Figma mirror-back phases.

---

## 16. The short version

In seven months, two people built a trading platform that most teams would staff at thirty: a dual-stack execution engine with an exact-decimal money model verified bit-for-bit across backtest, paper and live; 109 composable strategy nodes with cross-stack contract enforcement; an eight-read statistical proof suite that interrogates whether an edge is real; live Binance execution hardened through actual production incidents; portfolios that behave as one margin account; an AI that can build strategies under supervision; a 42-tool MCP server that lets Claude, Cursor and Codex operate the product; a 235-token, 184-spec design system with six automated governance gates; a 44-document brand operating system compiled into a machine gate that every generated asset must pass; and 2,362 test files behind a pre-push ladder with mutation testing on the money path.

The through-line is the same in every layer: **make the rule executable.** A design rule that only lives in a document gets broken. A parity claim that is only asserted in prose drifts. A brand correction given in chat is forgotten. So the color rule became a CI audit, the parity claim became a bit-for-bit equality test, and the design correction became a numbered law the agent reads before it draws.
