# Work: the eye map and the case presentations

/work has two parts, in the same order in every era:

1. **The era desktop**, as it was before the showcase work: the original Work OS desktops (terminal in 1970, tiles in 2013, the prompt in 2026, and so on).
2. **The three cases** (Spera, HP, Square Bridge) in full: hero, metrics, iterations and facts.

Tried and removed on 2026-11-04, so not to be rebuilt without a new brief:
- the eye map (a disc with a sector per place and a ring per year);
- the A24-style row of eye discs inside the desktops;
- a single loader eye in the 1970 desktop.

The user will explain the intended eye showcase again.

## Where things live

| What | Where |
|---|---|
| Case content | `content/work/<case>.mdx`. The frontmatter holds the header and map fields: `sector`, `headline`, `links`. The body uses `Hero`/`Shot`, `Metrics` with `Lead`/`Trend`/`Spans`/`Stat`/`Meter`, `Iterations`/`Iteration`, and `Facts`. |
| MDX components | `src/components/work-showcase/mdx.tsx` and `charts.tsx` |
| Page section | `src/components/work-showcase/Showcase.tsx` and `showcase.css` |
| Sectors | `src/data/work-cases.ts` (`SECTORS`, `sectorOf`, `caseSlugForProject`) |
| Faux-UI scenes | `src/components/work-case/scenes/`: `spera.tsx` (built from spera-v2's real tokens and landing mocks; `SperaWorkspace` is the hero) and `others.tsx` (HP and Square Bridge, interim) |
| Stageshow kit | `src/components/stageshow/` (MIT, vendored, brands left out) |

## Numbers (all from docs/resume/MASTER-CAREER.md)

- **Spera:**
  - 334 commits, with the monthly split Feb 1, Mar 18, Apr 15, May 22, Jun 54, Jul 69, Aug 94, Sep 61.
  - 235 tokens.
  - 180+ specs (133 in July, 180 in September).
  - 1,100+ px sizes moved to type tokens.
  - 6 CI checks.
  - v0.6.94 (spera-v2 `lib/release.ts`).
- **HP:** 500+ on Mudra, 15+ hackathon solutions, 7+ microservices, and millions of IoT printers. Product dates come from `portfolio-data.ts`.
- **Square Bridge:** 45% engagement, 40% faster discovery, 35% less workload, 98% design-to-code accuracy, 150+ screens and 200+ candidates.
- **Spera hero scene:** its KPI figures are Spera's own landing mock values (`MockBacktestPanel`), not results.

## Swapping in real images

Any `Shot` or `Iteration` takes `shot="/work/<case>/<file>"` and `shotAlt="…"`. The image then replaces the scene in the same frame. Files wanted (PNG or WebP, at least 1120 × 680):

| Case | Where | Suggested file |
|---|---|---|
| HP | Hero: Print AI, Mudra, Get my Prints, Print Learn Center | `public/work/hp/print-ai.png`, `mudra.png`, `get-my-prints.png`, `plc.png` (public material only: NDA) |
| Square Bridge | Hero: dashboard, portfolio builder | `public/work/square-bridge/dashboard.png`, `portfolio.png` |
| Square Bridge | More screens: roles, testing, system | `public/work/square-bridge/personas.png`, `research.png`, `system.png` |

Until those land, HP's scenes stay abstract and carry an "Abstract · screens under NDA" tag.
