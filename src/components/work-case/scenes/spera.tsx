"use client";

import { BarChart3, Bug, Gauge, GitBranch, Play, Shield, Target, TerminalSquare, TrendingUp } from "lucide-react";
import type { ComponentType, CSSProperties } from "react";
import { Chart, Count, Popover, Stage, Window, type Act } from "@/components/stageshow";
import type { SceneProps } from "./types";
import "./spera.css";

/*
 * Spera, drawn small. Every shape and string is lifted from spera-v2:
 * the Logic Deck rows from landing/visuals/MockLogicDeck.tsx, the graph from
 * MockStrategyGraph.tsx, the KPIs from MockBacktestPanel.tsx, the colours
 * from packages/design-tokens (through look.ts as --sp-*). Lucide is
 * Spera's own icon set.
 */

const W = 560;
const H = 340;
const COMPACT = { below: 520, width: 358, height: 320 };

type Tone = "data" | "indicator" | "condition" | "action" | "risk";
type Step = { id: string; tone: Tone; icon: ComponentType<{ size?: number; strokeWidth?: number }>; name: string; preview?: string; chip?: string };

const DECK: Step[] = [
  { id: "price", tone: "data", icon: BarChart3, name: "Price", preview: "BTC-USDT · 1H" },
  { id: "rsi", tone: "indicator", icon: Gauge, name: "RSI(14)", preview: "close · 70 / 30" },
  { id: "ema", tone: "indicator", icon: TrendingUp, name: "EMA(20)", preview: "close" },
  { id: "cross", tone: "condition", icon: GitBranch, name: "Cross above", preview: "ema × price · rsi < 70" },
  { id: "buy", tone: "action", icon: Target, name: "Buy 0.2 BTC", preview: "market", chip: "Long" },
  { id: "stop", tone: "risk", icon: Shield, name: "Stop loss", preview: "1.5 × ATR(14)", chip: "Stop" },
];

function DeckRow({ step, n, quiet }: { step: Step; n: number; quiet?: boolean }) {
  const Icon = step.icon;
  return (
    <div className="sp-row" data-tone={step.tone}>
      <span className="sp-row__strip" />
      <span className="sp-row__grip" data-target={`grip-${step.id}`} data-cursor="grab">
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} />
        ))}
      </span>
      <span className="sp-row__n">{String(n).padStart(2, "0")}</span>
      <span className="sp-row__icon">
        <Icon size={13} strokeWidth={2.2} />
      </span>
      <span className="sp-row__name">{step.name}</span>
      {step.preview && !quiet ? <span className="sp-row__preview">{step.preview}</span> : null}
      {step.chip ? <span className="sp-row__chip">{step.chip}</span> : null}
    </div>
  );
}

function Root({ look, children, className }: SceneProps & { children: React.ReactNode; className: string }) {
  return (
    <div className={`sp-scene ${className}`} data-look={look.mode} style={look.style}>
      {children}
    </div>
  );
}

/* ── The promise: today's hero, beside the first draft ──────────────────── */

export function SperaHero(props: SceneProps) {
  return (
    <Root {...props} className="sp-hero">
      <Stage width={W} height={H} compact={COMPACT} theme={props.look.theme} tokens={props.look.tokens}>
        {() => (
          <>
            <Window url="spera.bot" className="sp-hero__win">
              <div className="sp-hero__body">
                <span className="sp-hero__eyebrow">Fastest way to build your trading strategy yourself</span>
                <span className="sp-hero__h">
                  Your strategy.
                  <br />
                  Built by <em>you.</em>
                </span>
                <span className="sp-hero__sub">
                  Build and backtest your own trading strategy, <b>in hours, not weeks.</b>
                </span>
                <span className="sp-btn sp-btn--solid sp-hero__cta">Start building free</span>
              </div>
            </Window>
            <figure className="sp-hero__draft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/work/spera/first-draft.webp" alt="The first landing draft: the whole page painted gold" width={900} height={582} />
              <figcaption>First draft</figcaption>
            </figure>
          </>
        )}
      </Stage>
    </Root>
  );
}

/* ── The mark: a kept pencil sketch beside the mark it became ───────────── */

export function SperaMark(props: SceneProps) {
  return (
    <Root {...props} className="sp-mark">
      <Stage width={W} height={H} compact={COMPACT} theme={props.look.theme} tokens={props.look.tokens}>
        {() => (
          <>
            <figure className="sp-mark__sketch">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/work/spera/kept-sketch.webp" alt="The kept pencil sketch of Spera's mark" width={640} height={600} />
              <figcaption>The sketch we kept</figcaption>
            </figure>
            <figure className="sp-mark__final">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/work/spera/spera-logo-gold.svg" alt="Spera's mark in gold" width={733} height={700} />
              <figcaption>Spera</figcaption>
            </figure>
          </>
        )}
      </Stage>
    </Root>
  );
}

/* ── The first UI: the strategy graph ───────────────────────────────────── */

const NODES = [
  { id: "price", x: 40, y: 40, label: "Price", kind: "input" },
  { id: "rsi", x: 40, y: 105, label: "RSI(14)", kind: "input" },
  { id: "ema", x: 40, y: 165, label: "EMA(20)", kind: "input" },
  { id: "cond", x: 170, y: 100, label: "Cross ↑", kind: "logic" },
  { id: "buy", x: 290, y: 60, label: "Buy", kind: "exec" },
  { id: "sell", x: 290, y: 150, label: "Stop", kind: "sell" },
] as const;
const EDGES = [
  ["price", "cond"],
  ["rsi", "cond"],
  ["ema", "cond"],
  ["cond", "buy"],
  ["cond", "sell"],
] as const;
const NW = 82;
const NH = 28;

export function SperaGraph(props: SceneProps) {
  const at = (id: string) => NODES.find((n) => n.id === id)!;
  return (
    <Root {...props} className="sp-graph">
      <Stage width={W} height={H} compact={COMPACT} theme={props.look.theme} tokens={props.look.tokens}>
        {() => (
          <Window url="spera.bot/strategy/builder" className="sp-graph__win">
            <svg className="sp-graph__svg" viewBox="0 0 400 230" aria-hidden>
              <defs>
                <pattern id="sp-dots" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" />
                </pattern>
              </defs>
              <rect width="400" height="230" fill="url(#sp-dots)" className="sp-graph__grid" />
              {EDGES.map(([a, b]) => {
                const s = at(a);
                const t = at(b);
                const x1 = s.x + NW;
                const y1 = s.y + NH / 2;
                const x2 = t.x;
                const y2 = t.y + NH / 2;
                const mx = (x1 + x2) / 2;
                return <path key={a + b} d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`} className="sp-graph__edge" />;
              })}
              {NODES.map((n) => (
                <g key={n.id} className="sp-graph__node" data-kind={n.kind}>
                  <rect x={n.x} y={n.y} width={NW} height={NH} rx={NH / 2} />
                  <text x={n.x + NW / 2} y={n.y + NH / 2 + 3.5} textAnchor="middle">
                    {n.label}
                  </text>
                </g>
              ))}
            </svg>
          </Window>
        )}
      </Stage>
    </Root>
  );
}

/* ── The deck: a step dragged into its place ────────────────────────────── */

const ROW = 40;
type DeckState = { order: string[]; lifted: string | null; dy: number };
const deckInitial: DeckState = { order: ["price", "rsi", "ema", "cross", "buy", "stop"], lifted: null, dy: 0 };
const deckPoster: DeckState = { order: ["price", "ema", "rsi", "cross", "buy", "stop"], lifted: null, dy: 0 };

async function deckScript(a: Act<DeckState>) {
  await a.wait(700);
  const grip = a.rect("grip-ema");
  const from = { x: grip.x + grip.width / 2, y: grip.y + grip.height / 2 };
  await a.move(from);
  await a.wait(180);
  let order = deckInitial.order;
  await a.drag(
    { x: from.x + 4, y: from.y - ROW },
    (p) => {
      const dy = p.y - from.y;
      const slot = Math.max(0, Math.min(5, Math.round((2 * ROW + dy) / ROW)));
      const rest = deckInitial.order.filter((id) => id !== "ema");
      order = [...rest.slice(0, slot), "ema", ...rest.slice(slot)];
      a.put({ lifted: "ema", dy, order });
    },
    { duration: 800 },
  );
  a.put({ lifted: null, dy: 0, order });
  await a.wait(300);
  await a.move({ x: from.x + 120, y: from.y + 90 });
  await a.wait(1800);
}

export function SperaDeck(props: SceneProps) {
  return (
    <Root {...props} className="sp-deck">
      <Stage
        width={W}
        height={H}
        compact={COMPACT}
        theme={props.look.theme}
        tokens={props.look.tokens}
        initial={deckInitial}
        poster={deckPoster}
        script={props.still ? undefined : deckScript}
        play="once"
        cursor={{ at: { x: 520, y: 320 } }}
      >
        {(s) => (
          <Window title="Logic Deck" className="sp-deck__win">
            <ol className="sp-deck__list" style={{ height: DECK.length * ROW }}>
              {DECK.map((step) => {
                const slot = s.order.indexOf(step.id);
                const lifted = s.lifted === step.id;
                const y = lifted ? deckInitial.order.indexOf(step.id) * ROW + s.dy : slot * ROW;
                return (
                  <li key={step.id} className="sp-deck__slot" data-lifted={lifted || undefined} style={{ transform: `translateY(${y}px)` }}>
                    <DeckRow step={step} n={slot + 1} />
                  </li>
                );
              })}
            </ol>
          </Window>
        )}
      </Stage>
    </Root>
  );
}

/* ── Gold means metered: Run asks once, then the result lands ───────────── */

type GoldState = { caveat: boolean; ran: boolean };
const goldInitial: GoldState = { caveat: false, ran: false };
const goldPoster: GoldState = { caveat: false, ran: true };

async function goldScript(a: Act<GoldState>) {
  await a.wait(600);
  await a.move("save");
  await a.wait(500);
  await a.click("run");
  await a.set({ caveat: true });
  await a.wait(1400);
  await a.click("anyway");
  await a.set({ caveat: false });
  await a.wait(150);
  await a.set({ ran: true });
  await a.move({ x: 470, y: 300 });
  await a.wait(2400);
}

const KPIS = [
  { label: "Total PnL", value: 1842, prefix: "+$", tone: "buy" },
  { label: "Win rate", value: 58, suffix: "%" },
  { label: "Profit factor", value: 1.92, decimals: 2 },
  { label: "Max DD", value: 7.2, prefix: "−", suffix: "%", decimals: 1, tone: "sell" },
] as const;

export function SperaGold(props: SceneProps) {
  return (
    <Root {...props} className="sp-gold">
      <Stage
        width={W}
        height={H}
        compact={COMPACT}
        theme={props.look.theme}
        tokens={props.look.tokens}
        initial={goldInitial}
        poster={goldPoster}
        script={props.still ? undefined : goldScript}
        play="once"
        cursor={{ at: { x: 470, y: 300 } }}
      >
        {(s, rect) => (
          <>
            <Window
              title="Momentum · BTC"
              className="sp-gold__win"
              toolbar={
                <span className="sp-gold__tools">
                  <span className="sp-btn" data-target="save" data-cursor="pointer">
                    Save
                  </span>
                  <span className="sp-btn sp-btn--gold" data-target="run" data-cursor="pointer" data-open={s.caveat || undefined}>
                    <Play size={11} strokeWidth={2.6} fill="currentColor" />
                    Run
                  </span>
                </span>
              }
            >
              <div className="sp-gold__body">
                <div className="sp-gold__deck">
                  {DECK.slice(1, 5).map((step, i) => (
                    <DeckRow key={step.id} step={step} n={i + 2} quiet />
                  ))}
                </div>
                <div className="sp-gold__kpis" data-ran={s.ran || undefined}>
                  {KPIS.map((k) => (
                    <div key={k.label} className="sp-kpi" data-tone={"tone" in k ? k.tone : undefined}>
                      <span className="sp-kpi__label">{k.label}</span>
                      <span className="sp-kpi__value">
                        {"prefix" in k ? k.prefix : null}
                        <Count value={s.ran ? k.value : 0} format={fixed("decimals" in k ? k.decimals : 0)} />
                        {"suffix" in k ? k.suffix : null}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Window>
            <Popover show={s.caveat} origin="top right" className="sp-caveat" style={caveatAt(rect("run"))}>
              <div className="sp-caveat__title">Before you run</div>
              <div className="sp-caveat__row">
                <span className="sp-caveat__dot" />
                History available vs. required
              </div>
              <div className="sp-caveat__actions">
                <span className="sp-btn">Cancel</span>
                <span className="sp-btn sp-btn--gold" data-target="anyway" data-cursor="pointer">
                  Run anyway
                </span>
              </div>
            </Popover>
          </>
        )}
      </Stage>
    </Root>
  );
}

const fixed = (d: number) => (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

function caveatAt(r: { x: number; y: number; width: number; height: number }): CSSProperties {
  return { position: "absolute", top: r.y + r.height + 8, left: r.x + r.width - 236, width: 236 };
}

/* ── The system: a report becomes a fix prompt ──────────────────────────── */

type LoopState = { picking: boolean; picked: boolean; stage: number };
const loopInitial: LoopState = { picking: false, picked: false, stage: 0 };
const loopPoster: LoopState = { picking: false, picked: true, stage: 2 };
const LOOP = ["Capture", "Triage", "Route", "Verify", "Close"];

async function loopScript(a: Act<LoopState>) {
  await a.wait(600);
  await a.click("report");
  await a.set({ picking: true });
  await a.move({ at: "chart", x: 0.55, y: 0.5 });
  await a.wait(500);
  await a.click({ at: "chart", x: 0.55, y: 0.5 });
  await a.set({ picking: false, picked: true });
  await a.wait(700);
  await a.set({ stage: 1 });
  await a.wait(700);
  await a.set({ stage: 2 });
  await a.move({ x: 300, y: 320 });
  await a.wait(2400);
}

export function SperaLoop(props: SceneProps) {
  return (
    <Root {...props} className="sp-loop">
      <Stage
        width={W}
        height={H}
        compact={COMPACT}
        theme={props.look.theme}
        tokens={props.look.tokens}
        initial={loopInitial}
        poster={loopPoster}
        script={props.still ? undefined : loopScript}
        play="once"
        cursor={{ at: { x: 300, y: 320 } }}
      >
        {(s) => (
          <>
            <Window
              title="Backtest"
              className="sp-loop__win"
              toolbar={
                <span className="sp-icon-btn" data-target="report" data-cursor="pointer" data-open={s.picking || undefined} aria-label="Report a problem">
                  <Bug size={13} strokeWidth={2} />
                </span>
              }
            >
              <div className="sp-loop__chart" data-target="chart" data-cursor={s.picking ? "crosshair" : undefined} data-picking={s.picking || undefined} data-picked={s.picked || undefined}>
                <svg viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden>
                  <path d="M0,96 C30,92 46,80 70,84 S110,60 140,64 S190,36 214,44 S262,22 300,18" />
                </svg>
                <span className="sp-loop__tag">EquityChart</span>
              </div>
            </Window>
            <div className="sp-loop__card" data-show={s.picked || undefined}>
              <div className="sp-loop__card-title">Report · /strategy/backtest</div>
              <dl className="sp-loop__facts">
                <div>
                  <dt>Target</dt>
                  <dd>EquityChart</dd>
                </div>
                <div>
                  <dt>Screenshots</dt>
                  <dd>2</dd>
                </div>
              </dl>
              <ol className="sp-loop__steps">
                {LOOP.map((l, i) => (
                  <li key={l} data-done={i <= s.stage || undefined}>
                    {l}
                  </li>
                ))}
              </ol>
              <div className="sp-loop__prompt" data-show={s.stage >= 2 || undefined}>
                Copy fix prompt
              </div>
            </div>
          </>
        )}
      </Stage>
    </Root>
  );
}

/* ── Shipped: the AI proposes, you keep it ──────────────────────────────── */

type ShipState = { proposed: boolean; kept: boolean };
const shipInitial: ShipState = { proposed: false, kept: false };
const shipPoster: ShipState = { proposed: true, kept: true };

async function shipScript(a: Act<ShipState>) {
  await a.wait(500);
  await a.set({ proposed: true });
  await a.wait(1200);
  await a.click("keep");
  await a.set({ kept: true });
  await a.move({ x: 500, y: 316 });
  await a.wait(2600);
}

export function SperaShip(props: SceneProps) {
  const rows = DECK.slice(0, 5);
  const stop = DECK[5];
  return (
    <Root {...props} className="sp-ship">
      <Stage
        width={W}
        height={H}
        compact={COMPACT}
        theme={props.look.theme}
        tokens={props.look.tokens}
        initial={shipInitial}
        poster={shipPoster}
        script={props.still ? undefined : shipScript}
        play="once"
        cursor={{ at: { x: 500, y: 316 } }}
      >
        {(s) => (
          <>
            <Window url="spera.bot" className="sp-ship__win" toolbar={<span className="sp-badge">Alpha · v0.6.94</span>}>
              <ol className="sp-ship__deck">
                {rows.map((step, i) => (
                  <li key={step.id}>
                    <DeckRow step={step} n={i + 1} quiet={i < 3} />
                  </li>
                ))}
                <li className="sp-ship__new" data-in={s.kept || undefined}>
                  <DeckRow step={stop} n={6} />
                </li>
              </ol>
            </Window>
            <div className="sp-ship__ai" data-show={s.proposed || undefined} data-kept={s.kept || undefined}>
              <div className="sp-ship__ai-head">Proposed change</div>
              <div className="sp-ship__ai-body">Add a stop loss at 1.5 × ATR(14)</div>
              <div className="sp-ship__ai-actions">
                <span className="sp-btn">Revert</span>
                <span className="sp-btn sp-btn--solid" data-target="keep" data-cursor="pointer">
                  {s.kept ? "Kept" : "Keep"}
                </span>
              </div>
            </div>
          </>
        )}
      </Stage>
    </Root>
  );
}

/* ── The workspace: the whole product in one frame ──────────────────────── */

/*
 * The portfolio hero. Spera as it is used: the Logic Deck on the left, the
 * backtest in the middle, the AI dock on the right. Run is pressed, the
 * results land, the AI proposes a stop loss and it is kept into the deck.
 * The figures are the ones Spera's own landing mock shows, not results.
 */

const EQUITY = [100, 101.6, 100.9, 103.2, 102.4, 105.8, 104.9, 108.1, 107.2, 110.6, 112.4, 111.3, 114.9, 116.8, 118.4];

type WsState = { ran: boolean; proposed: boolean; kept: boolean };
const wsInitial: WsState = { ran: false, proposed: false, kept: false };
const wsPoster: WsState = { ran: true, proposed: true, kept: true };

async function wsScript(a: Act<WsState>) {
  await a.wait(700);
  await a.click("ws-run");
  await a.set({ ran: true });
  await a.wait(1700);
  await a.set({ proposed: true });
  await a.wait(1100);
  await a.click("ws-keep");
  await a.set({ kept: true });
  await a.move({ wide: { x: 980, y: 520 }, compact: { x: 330, y: 440 } });
  await a.wait(2600);
}

function Kpis({ ran }: { ran: boolean }) {
  return (
    <div className="sp-ws__kpis" data-ran={ran || undefined}>
      {KPIS.map((k) => (
        <div key={k.label} className="sp-kpi" data-tone={"tone" in k ? k.tone : undefined}>
          <span className="sp-kpi__label">{k.label}</span>
          <span className="sp-kpi__value">
            {"prefix" in k ? k.prefix : null}
            <Count value={ran ? k.value : 0} format={fixed("decimals" in k ? k.decimals : 0)} />
            {"suffix" in k ? k.suffix : null}
          </span>
        </div>
      ))}
    </div>
  );
}

function AiCard({ s }: { s: WsState }) {
  return (
    <div className="sp-ws__ai" data-show={s.proposed || undefined}>
      <div className="sp-ws__ai-head">
        <TerminalSquare size={12} strokeWidth={2} />
        Quant Console
      </div>
      <div className="sp-ws__ai-body">Add a stop loss at 1.5 × ATR(14)</div>
      <div className="sp-ws__ai-actions">
        <span className="sp-btn">Revert</span>
        <span className="sp-btn sp-btn--solid" data-target="ws-keep" data-cursor="pointer">
          {s.kept ? "Kept" : "Keep"}
        </span>
      </div>
    </div>
  );
}

function RunButton() {
  return (
    <span className="sp-btn sp-btn--gold" data-target="ws-run" data-cursor="pointer">
      <Play size={11} strokeWidth={2.6} fill="currentColor" />
      Run
    </span>
  );
}

export function SperaWorkspace(props: SceneProps) {
  const rows = DECK.slice(0, 5);
  const stop = DECK[5];
  return (
    <Root {...props} className="sp-ws">
      <Stage
        width={1040}
        height={560}
        compact={{ below: 640, width: 358, height: 470 }}
        theme={props.look.theme}
        tokens={props.look.tokens}
        initial={wsInitial}
        poster={wsPoster}
        script={props.still ? undefined : wsScript}
        play="once"
        cursor={{ at: { wide: { x: 980, y: 520 }, compact: { x: 330, y: 440 } } }}
      >
        {(s, _rect, layout) =>
          layout === "compact" ? (
            <Window title="Momentum · BTC" className="sp-ws__win" toolbar={<RunButton />}>
              <div className="sp-ws__compact">
                <Kpis ran={s.ran} />
                <AiCard s={s} />
              </div>
            </Window>
          ) : (
            <Window
              url="spera.bot/strategy"
              className="sp-ws__win"
              toolbar={
                <span className="sp-ws__tools">
                  <span className="sp-badge">Alpha · v0.6.94</span>
                  <span className="sp-btn">Save</span>
                  <RunButton />
                </span>
              }
            >
              <div className="sp-ws__body">
                <section className="sp-ws__deck">
                  <span className="sp-ws__eyebrow">Logic Deck</span>
                  {rows.map((step, i) => (
                    <DeckRow key={step.id} step={step} n={i + 1} />
                  ))}
                  <div className="sp-ship__new" data-in={s.kept || undefined}>
                    <DeckRow step={stop} n={6} />
                  </div>
                </section>
                <section className="sp-ws__main">
                  <Kpis ran={s.ran} />
                  <div className="sp-ws__chart">
                    <span className="sp-ws__eyebrow">Performance</span>
                    <Chart data={EQUITY} width={404} height={190} show={s.ran} />
                  </div>
                </section>
                <AiCard s={s} />
              </div>
            </Window>
          )
        }
      </Stage>
    </Root>
  );
}
