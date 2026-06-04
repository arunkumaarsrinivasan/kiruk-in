# Phase 2 — Gamified Footer (each era holds a playable game)

> Execution plan for Cursor. Self-contained. Reuses the existing arcade engine and
> footer data. Builds a per-era footer that renders era-native chrome **and** an
> embedded, playable mini-game keyed to the era.

---

## 1. Context

Repo: `kiruk-in` (Next.js App Router, React, TypeScript, framer-motion, Tailwind v4).

The site re-skins itself across 15 design eras (1970 terminal → 2026 generative UI).
Phase 1 already shipped: the nav bar became in-content modules + a logo navbar; every
module opens a real full experience.

Two systems already exist and **must be reused — do not rebuild them**:

### a. Arcade game engine — `src/components/ui/arcade/`
- `types.ts` — the contract every game implements:
  ```ts
  interface GridGameEngine {
    readonly id: string; readonly label: string; readonly description: string;
    init(gridWidth: number, gridHeight: number): void;
    update(dt: number): void;            // dt = ms since last frame
    onPointerMove(cell: { x: number; y: number }): void;
    onPointerLeave(): void;
    onClick(cell: { x: number; y: number }): void;
    renderState(): GameRenderState;      // { segments?, food?, statusText?, score?, isPaused?, isGameOver? }
    reset(): void;
  }
  // GridSegment { x, y, color, opacity }
  // GridFood    { x, y, color, icon?, label?, labelWidth?, category?, interactive? }
  ```
- `game-registry.ts` — `getGameEntry(id) => { id, label, description, createEngine() }`,
  `getDefaultGameId() => 'snake'`, `getGameIds()`. 12 games:
  `snake, painter, collector, avoider, tetris, pipe, shooter, minesweeper, flappy, timeline, quiz, memory`.
- `use-grid-game-loop.ts` — `useGridGameLoop({ engine, isRunning, onFrame })`. Runs a
  rAF loop, calls `engine.update(dt)` then `onFrame()` each frame, cancels on unmount /
  when `isRunning` is false. **This is the loop to use** for the contained board.

> NOTE: the existing arcade renders the engine into a full-page `GridBackground`.
> The footer needs a NEW **contained** renderer (a small canvas) that reads
> `engine.renderState()` and paints into a bounded grid. Build it (Section 5b).

### b. Footer data — `src/data/footer-data.ts` (built, currently UNRENDERED)
- `getFooterEraBucket(eraId) => 'retro' | 'pixel' | 'flat' | 'modern'`
  (year < 2000 → retro, < 2013 → pixel, < 2020 → flat, else modern).
- `resolveFooterData(era: ThemeConfig, portfolioData) => ResolvedFooterData`:
  ```ts
  ResolvedFooterData {
    bucket; label; description;
    palette: { panelStyle: 'terminal'|'pixel'|'flat'|'glass'; borderStyle; glow; pixelated };
    ascii: { title; eyebrow; sublabel; art: string[]; badges: string[]; statusLine; chromeLabel };
    stats: { id; label; value }[];
    linkGroups: { title; items: { id; label; href; external?; cursorChat? }[] }[];
    closingLines: string[];
    copyrightLine; eraLine; locationLine; responseLine;
  }
  ```
- Data object: `import { portfolioData } from '@/data/portfolio-data'`.
- Era hook: `import { useDesignEra } from '@/contexts/DesignEraContext'` →
  `{ currentEra: ThemeConfig, currentEraId: string }`.

### c. Era CSS vars (set by ThemeContext on `:root` / `body[data-era]`)
`--bg-main, --bg-card, --text-main, --text-muted, --accent-color, --border-color,`
`--theme-primary, --theme-secondary, --font-main, --font-heading,`
`--era-radius, --era-radius-sm/md/lg/full, --era-shadow, --era-letter-spacing`.
Use these so the footer blends per era with zero per-era code.

---

## 2. Goal

A persistent **`EraFooter`** at the bottom of the page that:
1. Renders the era's footer chrome from `resolveFooterData` (ascii art, stats, link
   groups, closing lines), styled by `palette.panelStyle` (terminal / pixel / flat / glass).
2. Embeds a **playable mini-game** keyed to the era via a `game→era` map, drawn in a
   contained canvas using the existing `GridGameEngine` + `useGridGameLoop`.
3. Remounts the game on era change (`key={gameId}`), pauses when offscreen
   (IntersectionObserver) and under `prefers-reduced-motion`.
4. Optional: the footer game also expands to a fullscreen arcade view via the module
   system (`footer-game` module) — see Section 8 (stretch).

---

## 3. Files

**Create**
- `src/data/footer-game-map.ts` — era → gameId mapping + helper.
- `src/components/footer/FooterGame.tsx` — contained, playable game board.
- `src/components/footer/EraFooter.tsx` — per-era footer chrome + embedded game.

**Modify**
- `src/components/layout/LayoutClientShell.tsx` — render `<EraFooter />` at the end of
  `<main>` (skip in split mode).

---

## 4. Game → Era map

`src/data/footer-game-map.ts` — 12 games across 15 eras (repeats allowed), each pick
themed to the era. Adjust freely; keep every id valid against the registry.

| Era id | Archetype | Game id | Why |
|---|---|---|---|
| 1970 | terminal | `snake` | classic teletype/CRT game |
| 1981 | xerox-bitmap | `minesweeper` | 1-bit beveled grid puzzle |
| 1991 | doc-html | `quiz` | hypertext Q&A |
| 1993 | mosaic | `timeline` | browser "history of" nav |
| 1995 | geocities | `painter` | neon GIF energy / paint trails |
| 1997 | frameset | `pipe` | route through frames/pipes |
| 2000 | flash-splash | `flappy` | Flash arcade staple |
| 2003 | web2-candy | `collector` | glossy "collect badges" |
| 2006 | microblog | `avoider` | dodge the status firehose |
| 2009 | iphone-skeu | `memory` | skeuomorphic card-flip match |
| 2013 | pinboard | `tetris` | flat tiles snapping into place |
| 2018 | block-editor | `minesweeper` | structured grid blocks |
| 2021 | issue-tracker | `tetris` | stack-and-clear sprint columns |
| 2023 | ai-native | `quiz` | conversational Q&A |
| 2026 | prompt-ui | `painter` | generative "paint a UI" |

```ts
// src/data/footer-game-map.ts
import { getDefaultGameId, getGameEntry } from '@/components/ui/arcade/game-registry';

/** era id (year) → arcade game id. Unmapped eras fall back to the default. */
export const FOOTER_GAME_BY_ERA: Record<string, string> = {
  '1970': 'snake',
  '1981': 'minesweeper',
  '1991': 'quiz',
  '1993': 'timeline',
  '1995': 'painter',
  '1997': 'pipe',
  '2000': 'flappy',
  '2003': 'collector',
  '2006': 'avoider',
  '2009': 'memory',
  '2013': 'tetris',
  '2018': 'minesweeper',
  '2021': 'tetris',
  '2023': 'quiz',
  '2026': 'painter',
};

/** Resolve a valid game id for an era (validates against the registry). */
export function getFooterGameId(eraId: string): string {
  const id = FOOTER_GAME_BY_ERA[eraId];
  if (id && getGameEntry(id)) return id;
  return getDefaultGameId();
}
```

---

## 5. Implementation

### 5a. `FooterGame.tsx` — contained, playable board

Reuses `getGameEntry(id).createEngine()` + `useGridGameLoop`. Paints `renderState()`
into a fixed-size canvas grid. Auto-runs only when in view + motion allowed. Pointer
maps to grid cells for `onPointerMove` / `onClick`.

```tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { getGameEntry } from "@/components/ui/arcade/game-registry";
import { useGridGameLoop } from "@/components/ui/arcade/use-grid-game-loop";
import type { GridGameEngine } from "@/components/ui/arcade/types";

const COLS = 30;
const ROWS = 10;

export function FooterGame({
  gameId,
  height = 160,
  className,
}: {
  gameId: string;
  height?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<GridGameEngine | null>(null);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [hud, setHud] = useState<{ status?: string; score?: number }>({});
  const cell = useRef(16); // px per cell, set on resize

  // create / reset engine when the game id changes (era change)
  useEffect(() => {
    const entry = getGameEntry(gameId);
    if (!entry) return;
    const e = entry.createEngine();
    e.init(COLS, ROWS);
    setEngine(e);
    return () => {
      // engines are plain objects; GC handles them. reset for safety.
      try { e.reset(); } catch {}
    };
  }, [gameId]);

  // viewport + reduced-motion gating
  useEffect(() => {
    setReduced(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => setInView(en.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // crisp canvas sizing (DPR) → derive cell size from width
  useEffect(() => {
    const cv = canvasRef.current, wrap = wrapRef.current;
    if (!cv || !wrap) return;
    const fit = () => {
      const w = wrap.getBoundingClientRect().width;
      const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
      cell.current = Math.max(8, Math.floor(w / COLS));
      cv.width = Math.round(COLS * cell.current * dpr);
      cv.height = Math.round(ROWS * cell.current * dpr);
      cv.style.width = `${COLS * cell.current}px`;
      cv.style.height = `${ROWS * cell.current}px`;
      cv.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  const draw = useMemo(
    () => () => {
      const cv = canvasRef.current; const e = engine;
      if (!cv || !e) return;
      const ctx = cv.getContext("2d"); if (!ctx) return;
      const c = cell.current;
      const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent-color").trim() || "#fff";
      ctx.clearRect(0, 0, COLS * c, ROWS * c);
      const s = e.renderState();
      // segments
      for (const seg of s.segments ?? []) {
        ctx.globalAlpha = seg.opacity ?? 1;
        ctx.fillStyle = seg.color || accent;
        ctx.fillRect(seg.x * c + 1, seg.y * c + 1, c - 2, c - 2);
      }
      ctx.globalAlpha = 1;
      // food / collectibles
      for (const f of s.food ?? []) {
        ctx.fillStyle = f.color || accent;
        if (f.icon) {
          ctx.font = `${c}px var(--font-main, monospace)`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(f.icon, f.x * c + c / 2, f.y * c + c / 2);
        } else if (f.label) {
          ctx.font = `${Math.floor(c * 0.7)}px var(--font-main, monospace)`;
          ctx.textAlign = "left"; ctx.textBaseline = "middle";
          ctx.fillText(f.label, f.x * c + 2, f.y * c + c / 2);
        } else {
          ctx.beginPath();
          ctx.arc(f.x * c + c / 2, f.y * c + c / 2, c / 2 - 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      setHud((h) => (h.status === s.statusText && h.score === s.score ? h : { status: s.statusText, score: s.score }));
    },
    [engine],
  );

  useGridGameLoop({ engine, isRunning: !!engine && inView && !reduced, onFrame: draw });

  // draw once when paused (reduced motion / offscreen) so it isn't blank
  useEffect(() => { if (engine) draw(); }, [engine, draw]);

  const toCell = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const c = cell.current;
    return { x: Math.floor((e.clientX - r.left) / c), y: Math.floor((e.clientY - r.top) / c) };
  };

  return (
    <div
      ref={wrapRef}
      data-footer-game={gameId}
      className={`relative w-full overflow-hidden ${className ?? ""}`}
      style={{ height }}
      onPointerMove={(e) => engine?.onPointerMove(toCell(e))}
      onPointerLeave={() => engine?.onPointerLeave()}
      onPointerDown={(e) => engine?.onClick(toCell(e))}
    >
      <canvas ref={canvasRef} className="block" />
      <div
        className="pointer-events-none absolute bottom-1 right-2 text-[10px] uppercase tracking-[0.16em]"
        style={{ color: "var(--text-muted)" }}
      >
        {hud.status ?? getGameEntry(gameId)?.label}
        {typeof hud.score === "number" ? ` · ${hud.score}` : ""}
      </div>
    </div>
  );
}

export default FooterGame;
```

### 5b. `EraFooter.tsx` — per-era chrome + embedded game

```tsx
"use client";

import React from "react";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { resolveFooterData } from "@/data/footer-data";
import { portfolioData } from "@/data/portfolio-data";
import { getFooterGameId } from "@/data/footer-game-map";
import { FooterGame } from "./FooterGame";

export function EraFooter() {
  const { currentEra, currentEraId } = useDesignEra();
  const data = resolveFooterData(currentEra, portfolioData);
  const gameId = getFooterGameId(currentEraId);
  const mono = data.palette.panelStyle === "terminal" || data.palette.panelStyle === "pixel";

  return (
    <footer
      data-era-footer={currentEraId}
      data-panel={data.palette.panelStyle}
      className="relative w-full border-t px-5 py-10 sm:px-8"
      style={{
        background: "var(--bg-card)",
        color: "var(--text-main)",
        borderColor: "var(--border-color)",
        fontFamily: mono ? "var(--font-main)" : "var(--font-heading)",
        boxShadow: data.palette.glow ? "var(--era-shadow, none)" : "none",
      }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-7">
        {/* header / eyebrow */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--accent-color)" }}>
            {data.ascii.eyebrow}
          </span>
          <h2 className="text-2xl font-bold sm:text-3xl">{data.ascii.title}</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{data.ascii.sublabel}</p>
        </div>

        {/* ASCII art — only on mono buckets where it reads right */}
        {mono && (
          <pre
            className="overflow-x-auto whitespace-pre text-[9px] leading-[1.15] sm:text-[11px]"
            style={{ color: "color-mix(in srgb, var(--accent-color) 75%, var(--text-main))" }}
          >
            {data.ascii.art.join("\n")}
          </pre>
        )}

        {/* THE GAME */}
        <div
          className="overflow-hidden border"
          style={{ borderColor: "var(--border-color)", borderRadius: "var(--era-radius-md, 8px)" }}
        >
          <div
            className="flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-[0.16em]"
            style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}
          >
            <span style={{ color: "var(--accent-color)" }}>▸ play · {gameId}</span>
            <span>{data.ascii.chromeLabel}</span>
          </div>
          {/* key=gameId → fresh engine + rAF on era change */}
          <FooterGame key={gameId} gameId={gameId} height={160} />
        </div>

        {/* stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {data.stats.map((s) => (
            <div key={s.id} className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>{s.label}</span>
              <span className="text-[13px] font-semibold">{s.value}</span>
            </div>
          ))}
        </div>

        {/* link groups */}
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          {data.linkGroups.map((g) => (
            <div key={g.title} className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--accent-color)" }}>{g.title}</span>
              {g.items.map((it) => (
                <a
                  key={it.id}
                  href={it.href}
                  target={it.external ? "_blank" : undefined}
                  rel={it.external ? "noopener noreferrer" : undefined}
                  className="text-[13px] hover:underline"
                  style={{ color: "var(--text-main)" }}
                >
                  {it.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* closing */}
        <div className="flex flex-col gap-1 border-t pt-4 text-[11px]" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
          {data.closingLines.map((l, i) => (<p key={i}>{l}</p>))}
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
            <span>{data.copyrightLine}</span>
            <span>{data.eraLine}</span>
            <span>{data.locationLine}</span>
            <span>{data.responseLine}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default EraFooter;
```

### 5c. Mount in `LayoutClientShell.tsx`

Render the footer at the end of `<main>` so it scrolls after page content. Skip in
split mode (split panes own their own layout).

```tsx
import { EraFooter } from "@/components/footer/EraFooter";
// ...
<main id="main-content" tabIndex={-1} style={{ paddingTop: mainPaddingTop }}>
  {children}
  {!isSplitMode && <EraFooter />}
</main>
```

> If the era archetype home is `min-h-screen` and you want the footer always below it,
> this placement is correct (footer follows the archetype content in normal flow).

---

## 6. Per-era theming (palette.panelStyle)

`data.palette.panelStyle` ∈ `terminal | pixel | flat | glass`. Minimum: everything is
token-driven (already in the code above), so it blends per era. Optional polish by
panel style:

- `terminal` (retro): show ASCII art, mono font, phosphor glow, square corners.
- `pixel`: chunky bevel borders, pixelated rendering (`image-rendering: pixelated` on the
  canvas), arcade badges row (`data.ascii.badges`).
- `flat`: hide ASCII art, clean grid, solid 1px borders, no glow.
- `glass`: `backdrop-filter: blur`, soft radius, gradient wash, show `badges` as chips.

Add a small `switch (data.palette.panelStyle)` to vary border/shadow/badges. Keep the
game board identical; only chrome changes.

---

## 7. Performance / correctness

- **Remount on era change**: `<FooterGame key={gameId} />` — React unmounts the old
  engine + cancels its rAF (via `useGridGameLoop` cleanup) and mounts fresh. Never run
  two loops.
- **Pause offscreen**: `isRunning = inView && !reduced`. IntersectionObserver toggles
  `inView`. This also keeps the dev-preview screenshotter able to settle.
- **Reduced motion**: no loop; draw one static frame so the board isn't blank.
- **DPR canvas**: size via `devicePixelRatio` (capped 2) for crisp cells.
- **No layout coupling**: the footer reads only era vars + data; nothing depends on the
  nav offset.

---

## 8. Stretch — `footer-game` as a fullscreen module (optional)

The module system (`src/contexts/ModuleContext.tsx`, `src/components/modules/`) supports
fullscreen expand/minimize. To let the footer game open big:
1. Add `'footer-game'` to `ModuleId` in `ModuleContext.tsx`.
2. Add a content component `FooterGameFull` that renders `<FooterGame gameId={...} height={…large} />`
   and register it in `src/components/modules/content/index.tsx` (`MODULE_CONTENT['footer-game']`).
3. In `EraFooter`, wrap the board header's "play" control with `useModules().open('footer-game')`.
Defer unless wanted — the inline board is the core deliverable.

---

## 9. Verification

Dev preview = `Claude_Preview` MCP (or `npm run dev`). Screenshots may not settle because
of rAF loops + the intro splash; prefer DOM assertions.

Bypass the intro splash: set `localStorage['portfolio-theme-selected']='true'`,
`sessionStorage['kiruk-loading-seen']='true'`, set `localStorage['portfolio-theme']='1970'`, reload.

Checks:
1. `document.querySelector('[data-era-footer]')` exists at page bottom; shows the era's
   bucket chrome (eyebrow/title/stats/links/closing).
2. `[data-footer-game]` mounts with the mapped id — e.g. era `1970` → `data-footer-game="snake"`;
   switch era (era nav bar / time machine) → `2013` → `data-footer-game="tetris"`.
3. Exactly one `<canvas>` inside the footer game; it paints (non-blank pixels) when in
   view, static when scrolled away or reduced-motion.
4. Pointer over the board drives the game (e.g. snake follows cursor); click triggers
   `onClick` games (minesweeper/quiz).
5. Switch eras several times → no console errors, no leaked loops (only one running).
6. `npx tsc --noEmit` → exit 0.

---

## 10. Acceptance criteria

- [ ] `footer-game-map.ts` maps all 15 eras to valid registry ids; `getFooterGameId`
      falls back safely.
- [ ] `EraFooter` renders era-native chrome via `resolveFooterData` and is mounted at the
      bottom of `<main>` (not in split mode).
- [ ] `FooterGame` plays the mapped game in a contained canvas, reusing
      `getGameEntry().createEngine()` + `useGridGameLoop`.
- [ ] Game remounts on era change; pauses offscreen + under reduced motion.
- [ ] Per-era chrome varies by `palette.panelStyle` (at least terminal vs glass differ).
- [ ] `tsc` clean; zero console errors switching across all 15 eras.
```
