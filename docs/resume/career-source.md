# Arun Kumaar Sreenivasan — Career Source

> Working document. This is the full picture: both older resumes, Spera founding design-engineering work, HP / SNS / freelance history, and a tighter write-up we can later typeset into a one-page ATS PDF.
>
> **Use this file as the source of truth.** The PDFs in Downloads are pre-Spera. Dates and titles below are reconciled. Flagged metrics are marked when they come from a later JOBISM pass rather than the original PDFs.

---

## Identity

| | |
|---|---|
| **Name** | Arun Kumaar Sreenivasan |
| **Handle** | KIRUK · `@kirukism` |
| **Current title** | Co-founder · Founding Design Engineer |
| **Company** | Spera ([spera.bot](https://www.spera.bot)) |
| **Location** | Bengaluru, India — 560102 |
| **Work** | Remote-first · open to worldwide |
| **Email** | [arunkumaar.srinivasan@gmail.com](mailto:arunkumaar.srinivasan@gmail.com) |
| **Phone** | +91 94865 82579 |
| **Portfolio** | [kiruk.in](https://kiruk.in) |
| **LinkedIn** | [linkedin.com/in/arunkumaarsreenivasan](https://linkedin.com/in/arunkumaarsreenivasan) |
| **GitHub** | [github.com/arunkumaarsrinivasan](https://github.com/arunkumaarsrinivasan) |
| **Behance** | [behance.net/arunkusriniva](https://behance.net/arunkusriniva) |
| **Playbook** | [playbook.com/s/arunkumaar/ak-works](https://playbook.com/s/arunkumaar/ak-works) |

**Name note.** Public spelling is **Sreenivasan**. Email and GitHub use **Srinivasan**. Keep both as-is; do not “correct” them on the resume.

---

## Positioning

Arun is a **founding design engineer**: he owns product intent, interaction, visual system, and the frontend that ships it. He is not a handoff designer and not a frontend engineer who “also does Figma.” He designs the **system that makes correct work easier than improvised work** — specs, tokens, components, feedback, verification — then builds the surfaces people actually use.

That is the Spera story. HP is the enterprise proof: AI print at scale, a design system used by 500+ people, Flutter onboarding, operational tooling. SNS Square is the early lead proof: three personas, 150+ screens, a small design team, measurable conversion.

**Headline for the resume (pick one):**

1. **Founding Design Engineer** — Co-founder at Spera. Previously UX Design Engineer, HP Innovation for India.
2. **Co-founder & Design Engineer** — Building Spera. Former HP Print AI.
3. **Design Engineer** — From HP Print AI to founding Spera.

Recommended: **1**. It is accurate, senior, and ATS-searchable without sounding like a generic “Product Designer / Full-Stack Builder.”

---

## Professional summary (resume-ready)

Founding Design Engineer and Co-founder of **Spera**, the platform traders use to design, backtest, paper-trade, and deploy crypto strategies without hiring a developer. Previously UX Design Engineer on HP’s Innovation for India team — key contributor to **HP Print AI**, the industry’s first intelligent print experience, and author of a design system adopted by **500+ employees**.

I take dense, expert products (trading, print, AI) and make them inspectable: ordered logic instead of spaghetti, honest receipts instead of pretty curves, AI that drafts in the open instead of hiding the edge. I ship the interface and the operating system behind it — semantic tokens, living specs, in-product feedback, and verification — so design and code stay one product.

---

## Timeline (reconciled)

Older PDFs still list HP and SNS Square as “Present.” They are not. Current role starts **February 2026**.

| When | Role | Org |
|---|---|---|
| **Feb 2026 – Present** | Co-founder · Founding Design Engineer | **Spera** · Remote |
| **Aug 2023 – Feb 2026** | UX Design Engineer | **HP Inc.** · Innovation for India · Bengaluru |
| **Feb 2023 – Jul 2023** | Research & Development Intern | **HP Inc.** · Bengaluru |
| **Feb 2023 – Jul 2023** | SME & Design Lead (consultancy, concurrent) | **SNS Square** · Square Bridge · Remote |
| **Nov 2022 – Jan 2023** | Interaction Design Intern | **PeopleGamez.com** · Remote |
| **2020 – 2023** | Freelance Designer | Studios, resorts, product concepts · Remote |
| **Aug 2019 – May 2023** | B.E. Computer Science & Engineering, **8.9/10** | Sona College of Technology |

**Overlap is real and fine:** HP intern + SNS Square consultancy ran in the same window. On the one-pager, show HP intern as a nested line under HP, and keep SNS Square as its own role.

---

## Experience

### Spera — Co-founder · Founding Design Engineer

**Feb 2026 – Present · Remote · [spera.bot](https://www.spera.bot)**

Spera is the loop traders were hiring developers for: **build → backtest → paper trade → iterate → deploy**. No shared secrets, no invoice per tweak, no “deploy translation” layer. AI helps draft logic; the trader keeps the edge.

Arun co-founded the company and owns **product design, interaction, frontend, and the design-engineering system** the team ships against.

#### Product (what users see)

- **Logic Deck** — strategies as an ordered list of steps (data → indicator → condition → action), not a spaghetti graph. Drag to reorder. Inspect every step inline. Reusable modules across strategies.
- **AI in the open** — inline drafts the user accepts, edits, or rejects. AI accelerates authoring; it does not hide logic or make the trade.
- **Honest backtests** — fees, slippage, partial fills, funding. Pinned dataset revisions. Frozen strategy versions. Rerun next quarter, same equity curve.
- **Run manifests** — every decision logged. Answer “what did we run on Tuesday?”
- **Same deck live** — paper, sim, or live execution with the same semantics as the backtest. Event-driven fill log tracing each action to the step that fired it. Pause-and-flatten.
- **Built for a beachhead** — serious strategy builders and small desks who have already lived the hire-a-developer loop. Not a one-click “set and forget” bot shop.

#### Design engineering (what makes this founding-level)

Shipped a repository where **intent, implementation, feedback, assets, and verification stay connected**. As-built from the Spera codebase (not a slide narrative):

| System | What exists | Why it matters |
|---|---|---|
| **Living specs** | 133 specs across foundations, tokens, atoms, molecules, organisms, patterns | Next contributor inherits the product language instead of guessing |
| **Semantic tokens + lint** | Neutral surfaces, gold for focus, buy/sell color only for trading meaning. Audit rejects hardcoded colors, arbitrary utilities, pixel type | Consistency is checked in code, not by taste in review |
| **Rules and skills** | Scoped instructions for UI, docs, tests, Figma, assets, motion | People and agents operate from the same contract |
| **Figma without Figma-first** | 19 tracked targets, 16 exact-node mappings. Explicit opt-in, batches of 3 frames | Figma stays useful; code + specs stay the ground |
| **Rendered verification** | Focused tests, token audit, impact coverage, browser/output inspection | Visual work is done when the UI is proven, not when it compiles |
| **Evidence-based feedback** | In-app reporter: route, selected DOM node, classes, React signal, ancestor chain, bounds, screenshots, repro steps, app state, console errors | “The chart is broken” becomes a locatable product surface |
| **Admin → agent handoff** | Triage, owner, priority, evidence, domain-matched prompt (specs, skills, tests) | Diagnosis starts with context, not a blank chat |
| **Real-component assets** | Marketing PNGs and A4 PDFs render production React, tokens, fonts, logo through Chromium | Product and marketing share one visual truth |
| **Growth Studio** | Publish → metrics → insights → next brief, with brand/disclaimer gates | Creative decisions get receipts |

**How the product actually grew (Feb–Jul 2026, 643 commits on the product branch):** ship a real trading capability → notice friction → encode the lesson as a spec, token, test, or tool → verify against the live product. Strategy graph and builder first; then dense backtest UX; then quality shifted left (token audit, tests, in-app feedback); then fleet/paper parity, docs, and Growth Studio; then admin triage and agent-ready prompts.

#### Resume bullets (use these)

- Co-founded Spera and led product design, interaction, and frontend for a platform that lets traders **build, backtest, paper-trade, and deploy** crypto strategies without a developer.
- Designed the **Logic Deck** — strategies as ordered, inspectable steps — replacing graph spaghetti with a sequence a serious trader can reason about, reorder, and reuse as modules.
- Designed **AI-assisted drafting** where every suggestion is a visible row to accept or reject, so assistance accelerates the loop without hiding the user’s edge.
- Shipped **reproducible backtests** (pinned data, honest fees/slippage/funding, run manifests) and **same-deck live execution**, so paper and live share one artifact.
- Built the **design-engineering operating system** behind the UI: **133 living specs**, semantic tokens with an executable audit, in-product feedback that captures the real DOM and screenshots, and an admin cockpit that turns reports into domain-matched fix prompts.
- Closed the product ↔ marketing gap by rendering posters and PDFs from **real components, tokens, and type**, then feeding Growth Studio publish/measure loops back into the next brief.

#### Keywords this role should hit on ATS

Product Design, Design Engineer, Design Systems, Interaction Design, Information Architecture, Frontend, Next.js, TypeScript, Figma, AI UX, Prompt Engineering, Fintech, Crypto, Trading UX, Design Tokens, Accessibility, Prototyping, Zero-to-One, Founding, Co-founder.

---

### HP Inc. — UX Design Engineer

**Aug 2023 – Feb 2026 · Bengaluru · Innovation for India**

Main design engineer on the Innovation for India team. Work sat on the line between **AI product UX, design systems, and production interfaces** for print. Internal case visuals are under NDA; public surfaces: [HP Print AI](https://www.hp.com/us-en/printers/ai-printers.html), [Print Learn Center](https://www.printlearncenter.com/).

#### Resume bullets (use these)

- Key contributor to **HP Print AI**, the industry’s first intelligent print experience — translated opaque AI/print logic into human-centered workflows for consumer and B2B contexts.
- Designed and maintained the **Mudra AI Digital Service Stack** design system (Next.js + Figma), adopted by **500+ employees**; added GenAI prompt tooling for in-stack text-to-image.
- Led end-to-end design and engineering of **Get my Prints**, a Flutter web UI for doorstep printouts, reducing B2C onboarding friction and improving conversion for customers and print jobbers.
- Optimized **HP Print Learn Center** WhatsApp API flows so parents could reach learning worksheets inside a channel they already use.
- Tightened **HP onboarding** registration and first-session content access to cut drop-off.
- Designed **Splunk** dashboards and helped operate **7+** cloud microservices for monitoring and incident detection across **millions of IoT printers**.
- Partnered with Product, AI, and Engineering to ship **15+** hackathon solutions into durable product and ops workflows.
- Built scalable **email/webmail printing** paths in Spring Boot (Java) and Node.js (TypeScript).

**Nested intern line (Feb 2023 – Jul 2023) — Research & Development Intern**

- Designed **COE BOT** (Spring Shell + Spring Boot) to automate Splunk dashboard and alert generation, with API-driven proactive/reactive incident response.

*JOBISM later pass (not in the two source PDFs; keep if still true): intern work automated **50+** IoT monitoring alerts and cut manual oversight **~40%**. Flutter onboarding conversion **+25%**. Design-system patterns cut design-to-dev time **~30%**.*

#### Products under this role

| Product | Role | Notes |
|---|---|---|
| **HP Print AI** | UX Design Engineer | Industry-first intelligent print. Public: hp.com printers/ai-printers |
| **Mudra AI Stack** | Design system + GenAI prompts | 500+ employees; 15+ hackathon solutions |
| **Get my Prints** | Design + Flutter web | Doorstep print, B2C onboarding |
| **Print Learn Center** | WhatsApp API UX | Parents × worksheets. printlearncenter.com |
| **HP Onboarding App** | Registration / first-session | Drop-off reduction |
| **COE BOT** | Intern, then used in ops | Splunk automation |

---

### SNS Square — Subject Matter Expert & Design Lead

**Feb 2023 – Jul 2023 · Remote · Consultancy**

Facilitated with mentor Jothi Sekaran (IBM). **Square Bridge** — student recruitment platform for **Student, Recruiter, and Placement Officer** personas. From placement chaos to one bridge: student skills, officer insight, HR expectations.

Older PDFs left this role as “Present.” The intensive product period is **six months**. Do not list it as current next to Spera.

#### Resume bullets (use these)

- SME for Square Bridge: defined UX strategy and roadmap for Placement Officers while leading **three designers** across Student, Recruiter, and PO surfaces.
- Ran research and usability testing with **200+ candidates**; **Portfolio Builder** lifted student engagement **45%**.
- Designed recruiter search/discovery dashboards that cut candidate discovery time **40%**, and a central PO dashboard that cut officer workload **35%**.
- Shipped a unified design system and **150+ UI screens** with interactive Figma prototypes; handoff to Node.js/MongoDB hit **98%** design-to-code accuracy.

---

### PeopleGamez.com — Interaction Design Intern

**Nov 2022 – Jan 2023 · Remote**

#### Resume bullets

- Designed gamified HR experiences (**4Plantz**, **Motivuz**, and related products): research, storyboards, user flows, interaction models, and **100+ game assets**.
- Built a small design system with performance-report dashboards and data-viz standards; prototyped with product and engineering.

---

### Freelance — Designer

**2020 – 2023 · Remote · while completing the degree**

Branding, UI/UX, and experimental web for a design studio, resorts, and independent products. End-to-end across web, mobile, and print.

Selected:

- **Foodies Buddies** — dating app matching on food taste; messaging with restaurant picker; swipe / search / location. First standout mobile case study.
- **Desirable** — custom furniture marketplace: configurator, budget, bids from local makers, no middlemen.
- **PRAGS** ([prahatheesvar.in](https://www.prahatheesvar.in/)) — scroll-to-play musician site (Howler.js, Three.js, GSAP). A website that behaves like an instrument. *(Shipped Jan 2026; list under Selected Work, not under 2020–2023 freelance.)*

---

## Selected work (beyond job bullets)

Use 3–5 of these on a one-pager **or** keep them for a second page / portfolio. Prefer **Spera, Print AI, Mudra, Square Bridge, PRAGS**.

### Spera — Strategy platform

Co-founder. Visual Logic Deck, reproducible backtests, AI drafts, paper/live same artifact. Design + frontend + the spec/token/feedback system. Live: [spera.bot](https://www.spera.bot).

### HP Print AI

Industry-first intelligent print. Complex AI made trustworthy in hardware + cloud constraints. NDA on internals. Live: [hp.com/us-en/printers/ai-printers.html](https://www.hp.com/us-en/printers/ai-printers.html).

### Mudra AI Digital Service Stack

Org-wide design system + GenAI image prompts. 500+ employees. NDA on internals.

### Square Bridge

150+ screens, three personas, 45% / 40% / 35% / 98% metrics. Figma: `Finalized-Screen---Square-Bridge`. Behance.

### PRAGS — prahatheesvar.in

Experimental web as a live session. Scroll, hover, click → notes and motion.

### KIRUK — kiruk.in

The portfolio is itself a product: era shells, arcade, 3D, AI chat, scribble. Proof that design engineering can be playful and shipped.

### Kiruk Studio

Personal lab: tools, immersive web, branding, outdoor/creative experiments. Not a client case — a practice.

### JOBISM

AI-powered job-search assistant (CLI-first, Bun + TypeScript): discover, evaluate, tailor, follow up. Side system, not a client.

### Foodies Buddies / Desirable

Early product-design range (social + marketplace). Useful in a junior-era appendix; skip on a senior one-pager unless the role is consumer social.

### Play Store games

Personal game assets and releases. One line under Additional, not a project block.

---

## Education

**B.E. Computer Science & Engineering** — Sona College of Technology
Aug 2019 – May 2023 · **CGPA 8.9 / 10**

Continuous study in Laws of UX and product-design methods (self-directed alongside the degree).

---

## Skills (ATS-friendly groups)

Plain language, comma-separated — this is what parsers eat. Do not invent skill bars on the PDF.

**Product & UX.** Product design, UX/UI (web & mobile), design systems, interaction design, information architecture, wireframing, rapid prototyping, user-centered design, journey mapping, personas, usability testing, accessibility (WCAG 2.1), A/B testing, micro-interaction, UX writing, branding, illustration, game design / gamification.

**Research.** Qualitative & quantitative research, competitive analysis, storyboard analysis, data-informed iteration.

**Design tools.** Figma (advanced), Adobe Creative Suite (Illustrator, XD), ProtoPie, Spline, Rive, Penpot, Miro, Blender, Unity.

**Frontend.** React, Next.js, TypeScript, JavaScript (ES6+), HTML5, CSS, Tailwind CSS, Flutter, GSAP, Three.js, Redux Toolkit, developer handoff.

**Backend & data.** Node.js, Java, Spring Boot, Python, Flask, REST APIs, PostgreSQL, MongoDB, C#.

**Cloud & ops.** AWS, Docker, CI/CD, Vercel, Firebase, Supabase, Sanity CMS, Splunk, Prometheus.

**AI.** LLMs, AI-integrated UX, prompt engineering, NLP workflows, inspectable AI (accept / edit / reject), text-to-image tooling.

**Collaboration.** Design leadership, mentoring, Agile / Scrum, stakeholder engagement, Jira, GitHub, Slack.

**On the one-pager, print 4 compact lines max** — Product & UX, Frontend, Design tools, AI — and fold the rest into experience bullets.

---

## Impact metrics (only numbers we can stand behind)

| Metric | Context | Source |
|---|---|---|
| **500+** employees on a design system | Mudra AI Stack, HP | Both PDFs, portfolio |
| **15+** hackathon solutions shipped | HP Innovation for India | Both PDFs, portfolio |
| **Millions** of IoT printers monitored | Splunk / microservices | PDF 1 |
| **7+** cloud microservices | HP ops | PDF 1 |
| **45%** student engagement lift | Square Bridge Portfolio Builder | Both PDFs |
| **40%** faster recruiter discovery | Square Bridge | Both PDFs |
| **35%** lower PO workload | Square Bridge | PDF 1 |
| **98%** design-to-code accuracy | Square Bridge → Node.js/MongoDB | Both PDFs |
| **200+** candidates in research / testing | Square Bridge | PDF 1, JOBISM |
| **150+** UI screens | Square Bridge | Both PDFs |
| **3** designers led | Square Bridge | Both PDFs |
| **100+** game assets | PeopleGamez | Both PDFs |
| **100+** students in UX/UI workshops | Teaching | PDF 1 |
| **133** UI specs | Spera design system | Spera as-built story |
| **19 / 16** Figma tracked targets / exact mappings | Spera | Spera as-built story |
| **643** commits on product branch (Feb–Jul 2026) | Spera | Spera as-built story |
| **8.9/10** CGPA | Sona College | Both PDFs |

**Use with care (JOBISM ATS pass, not in the two PDFs):** +25% Get my Prints onboarding conversion; ~30% faster design-to-dev from Mudra patterns; intern COE BOT 50+ alerts / ~40% less manual oversight.

**Do not put on a public resume:** revenue, MRR, trading returns, user counts we do not have, “guaranteed” market outcomes for Spera.

---

## Additional

- Mentored and ran UX/UI workshops for **100+** students.
- Active in Bengaluru tech meetups and design communities.
- Released personal game assets and games on the Play Store.
- Collaboration-first, trekking over parties, table tennis, music. Perfectionist generalist. Happy to connect.

---

## Voice (how this should read)

Playful-precise in the portfolio. **On the resume: calm, concrete, senior.** No “passionate about leveraging synergies.” No emoji. No skill meters.

Pattern for every bullet:

> **Verb + artifact + constraint + outcome.**

Good: “Designed the Logic Deck so strategies are ordered, inspectable steps — replacing graph spaghetti with a sequence a trader can reorder and reuse.”
Bad: “Worked on improving the user experience of the trading dashboard.”

Spera copy already has a spine — *your edge stays yours, receipts not vibes, AI that does not hide the change.* Keep that spine. Do not water it down into “AI-powered fintech SaaS.”

---

## One-page resume map (next step)

Target: **one page**, ATS-parseable (real text, standard headings, no icons-as-headings), still designed — type, hierarchy, hairline rules, not a Canva template.

**Keep**

1. Header + 3-line summary
2. Spera (6–7 bullets) — hero
3. HP (5–6 bullets + intern nest)
4. SNS Square (3–4 bullets)
5. PeopleGamez (1–2 bullets) *or drop if space dies*
6. Skills (4 lines)
7. Education (1 line)
8. Links in the header

**Cut from the page, keep in this file**

- Freelance block (move strongest pieces to Selected Work if there is a second column)
- Foodies / Desirable / Play Store as main projects
- JOBISM, Kiruk Studio as jobs
- Full Spera systems table (compress to 2 bullets)
- Workshops, meetups (one “Additional” line if space)

**Layout direction (when we typeset)**

- Puppeteer HTML/CSS **or** Overleaf (`altacv` / custom `article` — not a noisy template)
- Single column or 70/30 (main + thin skills rail)
- Name large, title smaller, links as text URLs for ATS
- Section labels: `Summary` `Experience` `Skills` `Education`
- Color: one ink + one accent (near-black + a restrained gold/ochre — Spera’s focus color, not a rainbow)
- File name: `Arun-Kumaar-Sreenivasan-Design-Engineer.pdf`

---

## Source reconciliation

| Source | What it is | What was wrong / missing |
|---|---|---|
| `Arun-Resumee - Arun Kumaar Sreenivasan.pdf` | Visual one-pager, HP-era | HP “Present”; Spera absent; intern line visually glued to SNS; strong metrics |
| `ARUN KUMAAR SREENIVASAN-2.pdf` | ATS denser one-pager | Same present-tense jobs; SNS “Present”; no Spera; good competency dump |
| `spera-design-engineering-story.pdf` | As-built Spera narrative | The missing founding-DE story — **primary for current role** |
| [spera.bot](https://www.spera.bot) | Live product | Logic Deck, backtests, paper/live, AI policy, beachhead |
| `kiruk-in` `portfolio-data.ts` + knowledge base | Live site data | Best current titles/dates; HP Feb 2023–Feb 2026; Spera from Feb 2026 |
| JOBISM `master-resume.md` | Later ATS rewrite | Extra metrics; still treated HP/SNS as current; Spera only as “Trading Platform (in progress)” |

Nothing from private client dumps, `.env`, or live keys belongs here.

---

## Open questions before we typeset

Answer these in chat and this file gets locked for the PDF pass.

1. **Title on the page:** Founding Design Engineer, Co-founder & Design Engineer, or Design Engineer?
2. **HP end date:** Feb 2026 (portfolio) vs Mar 2026 (JOBISM) — confirm the last working month.
3. **SNS Square:** intensive Feb–Jul 2023 only, or a retained SME line through 2025? (Will not print as Present.)
4. **JOBISM-only metrics** (+25% conversion, −30% design-to-dev, 50+ alerts): keep or drop?
5. **One page vs one + selected-work extras:** default is one page.
6. **Target role** (if this is for a specific job: staff design engineer, product design, founding DE, etc.) so the summary can lean.

Until then, this document is complete enough to draft a world-class page from.
