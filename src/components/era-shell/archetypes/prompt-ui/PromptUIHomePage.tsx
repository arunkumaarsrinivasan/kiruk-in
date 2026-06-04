"use client";

/**
 * PromptUIHomePage — 2026 archetype: kiruk.build · spatial generative UI.
 *
 * 2023 made the interface *talk* (chat). 2026 made it *build itself* — and
 * do it in space. The paradigm is generative UI (v0 / Lovable / bolt) staged
 * on a floating spatial canvas: you describe a page and it materialises on a
 * tilting glass screen suspended in a depth field. One command bar — chips,
 * autocomplete, and a sparkle Auto-build — drives everything: sections plus
 * any colour, corner radius, font, theme or text size, all by prompt.
 *
 * Paradigm versus prior eras:
 *   · 2023 ai-native = conversational assistant (ask → read answer)
 *   · 2026 prompt-ui = SPATIAL GENERATIVE UI — a floating, parallax-tilting
 *     canvas builds itself from one command bar, hands-free if you want.
 *
 * Unique interaction — THE FLOATING SPATIAL CANVAS:
 *   The generated page lives on a glass screen suspended in a depth field.
 *   It parallax-tilts to your pointer, ambient orbs drift behind it, and each
 *   section scans in with z-depth. The command bar is a floating HUD with
 *   quick chips + type-ahead autocomplete + a one-tap ✨ Auto-build.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import {
  HERO,
  WHY_KIRUK,
  PERSONA,
  EMPATHY_MAP,
  buildTimeline,
  IMPACT_METRICS,
  CARD_SORTING,
  USABILITY_TEST,
} from "@/data/era-page-content";

const FONT_MONO = "'Geist Mono', 'JetBrains Mono', 'SFMono-Regular', monospace";
const nodes = buildTimeline();

// ── Themes ───────────────────────────────────────────────────────────

interface Theme {
  bg: string; bg2: string; ink: string; dim: string; muted: string;
  panel: string; panel2: string; border: string; screen: string;
}
const DARK: Theme = {
  bg: "#06070a", bg2: "#0c0e10", ink: "#e9f0ee", dim: "#94a39f", muted: "#5f6e6a",
  panel: "rgba(255,255,255,0.04)", panel2: "rgba(255,255,255,0.07)", border: "rgba(255,255,255,0.09)",
  screen: "rgba(14,16,19,0.72)",
};
const LIGHT: Theme = {
  bg: "#eceef0", bg2: "#ffffff", ink: "#0d0f11", dim: "#5b6764", muted: "#8a948f",
  panel: "rgba(0,0,0,0.035)", panel2: "rgba(0,0,0,0.06)", border: "rgba(0,0,0,0.1)",
  screen: "rgba(255,255,255,0.78)",
};

// ── Fonts ────────────────────────────────────────────────────────────

const FONTS: Record<string, string> = {
  geist: "'Geist', 'Inter', -apple-system, sans-serif",
  serif: "'Georgia', 'Times New Roman', serif",
  mono: "'Geist Mono', 'JetBrains Mono', monospace",
  rounded: "'Nunito', 'Quicksand', 'Geist', sans-serif",
};

// ── Colours ──────────────────────────────────────────────────────────

const NAMED: Record<string, string> = {
  red: "#ef4444", orange: "#fb923c", amber: "#fbbf24", yellow: "#facc15",
  lime: "#a3e635", green: "#22c55e", emerald: "#34d399", teal: "#5eead4",
  cyan: "#22d3ee", sky: "#38bdf8", blue: "#3b82f6", indigo: "#818cf8",
  violet: "#a78bfa", purple: "#a855f7", fuchsia: "#e879f9", pink: "#f472b6",
  rose: "#fb7185", slate: "#94a3b8", mint: "#5eead4",
};
function expandHex(h: string): string {
  h = h.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return "#" + h;
}
function lighten(hex: string, amt: number): string {
  const h = expandHex(hex).slice(1);
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amt);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}
function parseColor(s: string): { a: string; b: string } | null {
  const hex = s.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/);
  if (hex) { const a = expandHex(hex[0]); return { a, b: lighten(a, 0.22) }; }
  for (const name of Object.keys(NAMED)) {
    if (new RegExp(`\\b${name}\\b`).test(s)) { const a = NAMED[name]; return { a, b: lighten(a, 0.22) }; }
  }
  return null;
}

// ── Blocks ───────────────────────────────────────────────────────────

type BlockKind = "navbar" | "hero" | "persona" | "journey" | "works" | "impact" | "empathy" | "contact";
const BLOCK_LABEL: Record<BlockKind, string> = {
  navbar: "Navbar", hero: "Hero", persona: "About", journey: "Journey",
  works: "Work", impact: "Impact", empathy: "Process", contact: "Contact",
};
const NAV_LABEL: Partial<Record<BlockKind, string>> = {
  persona: "About", journey: "Journey", works: "Work", impact: "Impact", empathy: "Process", contact: "Contact",
};
const NAV_ORDER: BlockKind[] = ["persona", "journey", "works", "impact", "empathy", "contact"];

interface Style extends Theme { a: string; b: string; radius: number; font: string; scale: number; }

// ── Prompt parsing ───────────────────────────────────────────────────

interface Ops {
  builds: BlockKind[]; color?: { a: string; b: string }; radius?: number;
  font?: string; theme?: "dark" | "light"; scale?: number; reset?: boolean; reply: string;
}
function parsePrompt(text: string): Ops {
  const s = text.toLowerCase();
  const ops: Ops = { builds: [], reply: "" };
  const parts: string[] = [];
  if (/\b(reset|clear|start over|wipe|delete everything)\b/.test(s)) return { builds: [], reset: true, reply: "Cleared the canvas." };
  if (/\b(light mode|light theme|go light|make it light)\b/.test(s)) { ops.theme = "light"; parts.push("light mode"); }
  if (/\b(dark mode|dark theme|go dark|make it dark)\b/.test(s)) { ops.theme = "dark"; parts.push("dark mode"); }
  const radN = s.match(/\b(?:radius|corner[s]?)\s*(?:of|to|=)?\s*(\d{1,2})/);
  if (radN) { ops.radius = Math.min(40, parseInt(radN[1], 10)); parts.push(`radius ${ops.radius}`); }
  else if (/\b(sharp|square|no round|hard corner)/.test(s)) { ops.radius = 0; parts.push("sharp corners"); }
  else if (/\b(pill|fully round|max round)/.test(s)) { ops.radius = 999; parts.push("pill corners"); }
  else if (/\b(round|rounded|soft corner|softer)/.test(s)) { ops.radius = 20; parts.push("rounded corners"); }
  if (/\bserif\b/.test(s)) { ops.font = FONTS.serif; parts.push("serif font"); }
  else if (/\b(mono|monospace|code font|typewriter)\b/.test(s)) { ops.font = FONTS.mono; parts.push("mono font"); }
  else if (/\b(rounded font|friendly font|nunito|quicksand)\b/.test(s)) { ops.font = FONTS.rounded; parts.push("rounded font"); }
  else if (/\b(sans|clean font|geist|inter|default font)\b/.test(s)) { ops.font = FONTS.geist; parts.push("sans font"); }
  if (/\b(bigger|larger|big text|increase (the )?text|zoom in)\b/.test(s)) { ops.scale = 1.12; parts.push("bigger text"); }
  else if (/\b(smaller|tinier|small text|decrease (the )?text|zoom out)\b/.test(s)) { ops.scale = 0.9; parts.push("smaller text"); }
  else if (/\b(normal size|reset (the )?size|default size)\b/.test(s)) { ops.scale = 1; parts.push("normal text"); }
  const wantsColor = /\b(colou?r|accent|theme|paint|recolou?r|make it|turn it|use)\b/.test(s) || parseColor(s);
  if (wantsColor) { const c = parseColor(s); if (c) { ops.color = c; parts.push("recolour"); } }
  const all = /\b(everything|whole page|full page|all sections|the entire|complete page|build it all)\b/.test(s);
  const add = (k: BlockKind) => { if (!ops.builds.includes(k)) ops.builds.push(k); };
  if (all) { (["navbar", "hero", "persona", "journey", "works", "impact", "empathy", "contact"] as BlockKind[]).forEach(add); }
  else {
    if (/\b(nav|menu|header|top bar)\b/.test(s)) add("navbar");
    if (/\b(hero|headline|landing|page about|about kiruk|about arun|title)\b/.test(s)) { add("navbar"); add("hero"); }
    if (/\b(about|persona|who|bio|goals|frustration)\b/.test(s)) add("persona");
    if (/\b(journey|career|timeline|experience|history|path)\b/.test(s)) add("journey");
    if (/\b(work|project|portfolio|case|cards)\b/.test(s)) add("works");
    if (/\b(impact|metric|number|stat|result|outcome|receipt)\b/.test(s)) add("impact");
    if (/\b(how he works|empathy|says|thinks|does|feels|process|mindset)\b/.test(s)) add("empathy");
    if (/\b(contact|reach|email|talk|connect|cta|button)\b/.test(s)) add("contact");
  }
  if (ops.builds.length === 0 && !ops.color && ops.radius === undefined && !ops.font && !ops.theme && ops.scale === undefined) {
    ops.builds = ["navbar", "hero"];
    ops.reply = "Adding a hero — try a chip, a colour, “round the corners”, or a font.";
    return ops;
  }
  const buildPart = ops.builds.length ? ops.builds.map((b) => BLOCK_LABEL[b]).join(" + ") : "";
  ops.reply = [buildPart && `building ${buildPart}`, ...parts].filter(Boolean).join(" · ") || "done";
  return ops;
}

// ── Auto-build script ────────────────────────────────────────────────

const AUTO: Array<{ text: string; block: BlockKind }> = [
  { text: "make a page about Kiruk", block: "hero" },
  { text: "add an about section", block: "persona" },
  { text: "show his journey", block: "journey" },
  { text: "add his work as cards", block: "works" },
  { text: "show impact metrics", block: "impact" },
  { text: "add how he works", block: "empathy" },
  { text: "add a contact section", block: "contact" },
];

// ── Quick chips (no typing required) ─────────────────────────────────

interface Chip { ic: string; label: string; p: string; group: "build" | "style"; }
const CHIPS: Chip[] = [
  { ic: "✦", label: "About", p: "add an about section", group: "build" },
  { ic: "↗", label: "Journey", p: "show his journey", group: "build" },
  { ic: "▤", label: "Work", p: "add his work as cards", group: "build" },
  { ic: "✓", label: "Impact", p: "show impact metrics", group: "build" },
  { ic: "◍", label: "Process", p: "add how he works", group: "build" },
  { ic: "✉", label: "Contact", p: "add a contact section", group: "build" },
  { ic: "◆", label: "Indigo", p: "make it indigo", group: "style" },
  { ic: "◆", label: "Violet", p: "make it violet", group: "style" },
  { ic: "◆", label: "Rose", p: "make it rose", group: "style" },
  { ic: "⬚", label: "Round", p: "round the corners", group: "style" },
  { ic: "Aa", label: "Serif", p: "use a serif font", group: "style" },
  { ic: "◐", label: "Light", p: "light mode", group: "style" },
];

// ── Autocomplete command vocabulary ──────────────────────────────────

const COMMANDS: string[] = [
  "make a page about Kiruk",
  "build the whole page",
  "add an about section",
  "show his journey",
  "add his work as cards",
  "show impact metrics",
  "add how he works",
  "add a contact section",
  "make it indigo", "make it violet", "make it teal", "make it rose",
  "make it amber", "make it sky", "make it emerald", "make it blue",
  "round the corners", "sharp corners", "pill corners", "radius 18",
  "use a serif font", "use a mono font", "use a rounded font", "use a sans font",
  "light mode", "dark mode", "bigger text", "smaller text", "reset",
];

const SUGGESTIONS = ["make a page about Kiruk", "show his work", "make it indigo", "round the corners", "use a serif font"];

// ── Hook ─────────────────────────────────────────────────────────────

function useIsMobile(bp = 760): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const c = () => setM(window.innerWidth < bp);
    c();
    window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, [bp]);
  return m;
}

// ── Main ─────────────────────────────────────────────────────────────

export function PromptUIHomePage() {
  const { setLayoutMode } = useLayoutMode();
  useEffect(() => { setLayoutMode("full-digital"); }, [setLayoutMode]);
  const isMobile = useIsMobile();

  const [blocks, setBlocks] = useState<BlockKind[]>([]);
  const [accent, setAccent] = useState({ a: "#5eead4", b: "#a3e635" });
  const [radius, setRadius] = useState(14);
  const [font, setFont] = useState(FONTS.geist);
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [scale, setScale] = useState(1);

  const [input, setInput] = useState("");
  const [building, setBuilding] = useState(false);
  const [status, setStatus] = useState<{ text: string; done: boolean } | null>(null);
  const [auto, setAuto] = useState(false);

  const autoQ = useRef<string[]>([]);
  const pending = useRef<Ops | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const reduce = useRef(false);

  const theme = themeMode === "light" ? LIGHT : DARK;
  const st: Style = useMemo(() => ({ ...theme, a: accent.a, b: accent.b, radius, font, scale }), [theme, accent, radius, font, scale]);

  useEffect(() => {
    reduce.current = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  useEffect(() => {
    fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "page_view", path: "/era/2026" }) }).catch(() => {});
  }, []);
  useEffect(() => {
    const el = canvasRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce.current ? "auto" : "smooth" });
  }, [blocks]);
  useEffect(() => {
    if (!status || !status.done) return;
    const t = window.setTimeout(() => setStatus(null), 1700);
    return () => window.clearTimeout(t);
  }, [status]);

  // ── Send ──────────────────────────────────────────────────────────
  const send = useCallback((raw: string) => {
    const q = raw.trim();
    if (!q || building) return;
    const ops = parsePrompt(q);
    if (ops.reset) { setBlocks([]); setStatus({ text: "✓ cleared", done: true }); setInput(""); return; }
    pending.current = ops;
    setBuilding(true);
    setStatus({ text: ops.reply || "building…", done: false });
    setInput("");
  }, [building]);

  // ── Build execution ───────────────────────────────────────────────
  useEffect(() => {
    if (!building) return;
    const t = window.setTimeout(() => {
      const ops = pending.current;
      pending.current = null;
      if (ops) {
        if (ops.builds.length) setBlocks((prev) => { const add = ops.builds.filter((b) => !prev.includes(b)); return add.length ? [...prev, ...add] : prev; });
        if (ops.color) setAccent(ops.color);
        if (ops.radius !== undefined) setRadius(ops.radius);
        if (ops.font) setFont(ops.font);
        if (ops.theme) setThemeMode(ops.theme);
        if (ops.scale !== undefined) setScale(ops.scale);
      }
      setStatus({ text: `✓ ${ops?.reply ?? "done"}`, done: true });
      setBuilding(false);
    }, reduce.current ? 60 : 600);
    return () => window.clearTimeout(t);
  }, [building]);

  // ── Auto-build ────────────────────────────────────────────────────
  const startAuto = useCallback(() => {
    if (auto) { setAuto(false); autoQ.current = []; return; }
    const present = new Set(blocks);
    const queue = (present.size === 0 ? AUTO : AUTO.filter((x) => !present.has(x.block))).map((x) => x.text);
    if (queue.length === 0) { setStatus({ text: "✓ page already complete", done: true }); return; }
    autoQ.current = queue;
    setAuto(true);
  }, [auto, blocks]);
  useEffect(() => {
    if (!auto || building) return;
    if (autoQ.current.length === 0) { setAuto(false); setStatus({ text: "✓ page built", done: true }); return; }
    const next = autoQ.current[0];
    const t = window.setTimeout(() => { autoQ.current = autoQ.current.slice(1); send(next); }, reduce.current ? 80 : 480);
    return () => window.clearTimeout(t);
  }, [auto, building, send]);

  const started = blocks.length > 0;
  const navLinks = useMemo(() => NAV_ORDER.filter((b) => blocks.includes(b)), [blocks]);
  const scrollToSection = useCallback((k: BlockKind) => { document.getElementById(`kb-sec-${k}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }, []);

  return (
    <main
      id="kiruk-build"
      style={{
        position: "relative",
        height: "calc(100dvh - var(--simple-game-nav-bottom, 60px))",
        minHeight: "calc(100dvh - var(--simple-game-nav-bottom, 60px))",
        background: st.bg,
        color: st.ink,
        fontFamily: st.font,
        overflow: "hidden",
        transition: "background 400ms, color 400ms",
      }}
    >
      <style jsx global>{`
        @keyframes kb-scan { 0% { opacity: 0; transform: translateY(14px); filter: blur(5px); } 100% { opacity: 1; transform: none; filter: blur(0); } }
        @keyframes kb-up { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes kb-dot { 0%,80%,100% { opacity: .25; } 40% { opacity: 1; } }
        #kiruk-build *:focus-visible { outline: 2px solid ${st.a}; outline-offset: 2px; }
        #kiruk-build .kb-screen::-webkit-scrollbar { width: 8px; }
        #kiruk-build .kb-screen::-webkit-scrollbar-thumb { background: ${st.border}; border-radius: 8px; }
        @media (prefers-reduced-motion: reduce) { #kiruk-build * { animation-duration: 0.001ms !important; } }
      `}</style>

      {/* FLAT FULL-SCREEN CANVAS = the page */}
      <div
        className="kb-screen"
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          overflowY: "auto",
          zoom: scale,
        }}
      >
        {!started ? (
          <EmptyState st={st} building={building} auto={auto} onChip={send} onAuto={startAuto} isMobile={isMobile} />
        ) : (
          <div style={{ paddingBottom: 150 }}>
            {blocks.includes("navbar") && <NavbarBlock st={st} links={navLinks} onNav={scrollToSection} />}
            {blocks.filter((b) => b !== "navbar").map((b) => (
              <section key={b} id={`kb-sec-${b}`} style={{ animation: reduce.current ? undefined : "kb-scan 460ms cubic-bezier(0.22,1,0.36,1)" }}>
                <BlockRenderer kind={b} st={st} />
              </section>
            ))}
          </div>
        )}
      </div>

      {/* FLOATING COMMAND HUD */}
      <CommandBar
        st={st} input={input} setInput={setInput} onSend={send}
        building={building} status={status} auto={auto} onAuto={startAuto}
        started={started} isMobile={isMobile}
      />
    </main>
  );
}

// ── Command bar — chips + autocomplete + sparkle auto ────────────────

function CommandBar({
  st, input, setInput, onSend, building, status, auto, onAuto, started, isMobile,
}: {
  st: Style; input: string; setInput: (s: string) => void; onSend: (s: string) => void;
  building: boolean; status: { text: string; done: boolean } | null;
  auto: boolean; onAuto: () => void; started: boolean; isMobile: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [hi, setHi] = useState(0);

  const matches = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    const starts = COMMANDS.filter((c) => c.toLowerCase().startsWith(q));
    const incl = COMMANDS.filter((c) => !c.toLowerCase().startsWith(q) && c.toLowerCase().includes(q));
    return [...starts, ...incl].slice(0, 6);
  }, [input]);
  useEffect(() => { setHi(0); }, [input]);

  const showAC = focused && matches.length > 0;
  const accentText = st.bg === "#06070a" ? "#04201b" : "#04201b";
  const r = (max: number) => Math.max(8, Math.min(st.radius, max));

  const submit = () => {
    if (showAC && matches[hi]) { onSend(matches[hi]); }
    else onSend(input);
  };

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: isMobile ? 12 : 20,
        transform: "translateX(-50%)",
        width: isMobile ? "calc(100% - 20px)" : "min(680px, calc(100% - 40px))",
        zIndex: 50,
      }}
    >
      {/* autocomplete popup (grows upward) */}
      {showAC && (
        <div
          style={{
            position: "absolute",
            left: 0, right: 0, bottom: "calc(100% + 8px)",
            background: st.bg2,
            border: `1px solid ${st.border}`,
            borderRadius: r(16),
            padding: 5,
            boxShadow: `0 16px 50px rgba(0,0,0,0.45)`,
            backdropFilter: "blur(16px)",
            animation: "kb-up 140ms ease-out",
            overflow: "hidden",
          }}
        >
          {matches.map((m, i) => (
            <button
              key={m}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onSend(m); }}
              onMouseEnter={() => setHi(i)}
              style={{
                display: "flex", alignItems: "center", gap: 9, width: "100%",
                padding: "8px 11px", textAlign: "left",
                background: i === hi ? `${st.a}1c` : "transparent",
                border: "none", borderRadius: r(10), cursor: "pointer",
                color: st.ink, fontFamily: st.font, fontSize: 13.5,
              }}
            >
              <span style={{ color: st.a, fontFamily: FONT_MONO, fontSize: 12 }}>❯</span>
              <span style={{ flex: 1 }}>{m}</span>
              {i === hi && <span style={{ fontSize: 10, color: st.muted, fontFamily: FONT_MONO }}>↵</span>}
            </button>
          ))}
        </div>
      )}

      {/* status ticker */}
      <div style={{ height: 20, display: "flex", justifyContent: "center", marginBottom: 6 }}>
        {(building || status) && !showAC && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "3px 12px", background: st.bg2, border: `1px solid ${st.border}`, borderRadius: 999, fontFamily: FONT_MONO, fontSize: 11, color: status?.done ? st.a : st.dim, animation: "kb-up 200ms ease-out", maxWidth: "100%" }}>
            {building ? <Dots accent={st.a} /> : <span style={{ color: st.a }}>✓</span>}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{building ? (status?.text ?? "building…") : status?.text}</span>
          </div>
        )}
      </div>

      {/* quick chips */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, maskImage: "linear-gradient(90deg, transparent, black 12px, black calc(100% - 12px), transparent)" }}>
        {CHIPS.map((c) => (
          <button
            key={c.label}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSend(c.p)}
            disabled={building || auto}
            title={c.p}
            style={{
              flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
              padding: "5px 11px",
              background: st.bg2,
              border: `1px solid ${c.group === "style" ? `${st.a}33` : st.border}`,
              borderRadius: 999, color: st.dim, fontFamily: st.font, fontSize: 12,
              cursor: building || auto ? "not-allowed" : "pointer", whiteSpace: "nowrap",
              backdropFilter: "blur(10px)",
            }}
          >
            <span style={{ color: c.group === "style" ? st.a : st.dim, fontSize: 11 }}>{c.ic}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* input row */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: 7, paddingLeft: 12,
          background: st.bg2, border: `1px solid ${focused ? `${st.a}66` : `${st.a}33`}`,
          borderRadius: r(22),
          boxShadow: `0 14px 50px ${st.bg === "#06070a" ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.16)"}, 0 0 36px ${st.a}14`,
          backdropFilter: "blur(16px)",
          transition: "border-color 160ms",
        }}
      >
        <span style={{ color: st.a, fontFamily: FONT_MONO, fontSize: 14, flexShrink: 0 }}>❯</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && showAC) { e.preventDefault(); setHi((h) => Math.min(matches.length - 1, h + 1)); }
            else if (e.key === "ArrowUp" && showAC) { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
            else if (e.key === "Enter") { e.preventDefault(); submit(); }
            else if (e.key === "Escape") { setFocused(false); }
          }}
          placeholder={started ? "build, recolour, restyle…" : "Describe your page…"}
          disabled={auto}
          style={{ flex: 1, minWidth: 0, height: 38, background: "transparent", border: "none", outline: "none", color: st.ink, fontFamily: st.font, fontSize: 14.5 }}
        />
        {/* sparkle auto — minimal icon, right side */}
        <button
          type="button"
          onClick={onAuto}
          title={auto ? "Stop auto-build" : "Auto-build the whole page"}
          style={{
            flexShrink: 0, width: 38, height: 38, borderRadius: r(14),
            border: auto ? `1px solid ${st.border}` : "none",
            background: auto ? st.panel2 : `linear-gradient(135deg, ${st.a}, ${st.b})`,
            color: auto ? st.ink : accentText, cursor: "pointer", fontSize: 16,
            display: "grid", placeItems: "center",
            boxShadow: auto ? "none" : `0 0 16px ${st.a}55`,
            animation: auto ? "kb-up 0.001ms" : undefined,
          }}
        >
          {auto ? "◼" : "✨"}
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!input.trim() || building || auto}
          title="Send · ↵"
          style={{
            flexShrink: 0, width: 38, height: 38, borderRadius: r(14), border: "none",
            background: input.trim() && !building && !auto ? st.panel2 : st.panel,
            color: input.trim() && !building && !auto ? st.ink : st.muted,
            cursor: input.trim() && !building && !auto ? "pointer" : "not-allowed",
            fontSize: 15, display: "grid", placeItems: "center",
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────

function EmptyState({ st, building, auto, onChip, onAuto, isMobile }: { st: Style; building: boolean; auto: boolean; onChip: (s: string) => void; onAuto: () => void; isMobile: boolean }) {
  return (
    <div style={{ minHeight: "100%", display: "grid", placeItems: "center", padding: "30px 22px", textAlign: "center" }}>
      <div style={{ maxWidth: 540, animation: "kb-up 500ms ease-out" }}>
        <div aria-hidden style={{ width: 58, height: 58, margin: "0 auto 18px", borderRadius: 17, background: `conic-gradient(from 90deg, ${st.a}, ${st.b}, ${st.a})`, boxShadow: `0 0 50px ${st.a}55`, transform: "translateZ(40px)" }} />
        <h1 style={{ fontSize: isMobile ? 27 : 38, fontWeight: 700, letterSpacing: -1.1, margin: "0 0 10px", lineHeight: 1.06 }}>Describe it. Watch it build.</h1>
        <p style={{ fontSize: isMobile ? 13.5 : 15.5, color: st.dim, lineHeight: 1.6, margin: "0 0 22px" }}>
          One command bar builds {HERO.name.split(" ")[0]}&apos;s whole portfolio on this floating canvas —
          tap a chip, type with autocomplete, or let it build itself.
        </p>
        <button type="button" onClick={onAuto} disabled={building} style={{ padding: "12px 22px", background: `linear-gradient(135deg, ${st.a}, ${st.b})`, color: "#04201b", border: "none", borderRadius: Math.max(10, Math.min(st.radius, 16)), fontFamily: st.font, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 20, boxShadow: `0 0 24px ${st.a}40` }}>
          ✨ Auto-build the page
        </button>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center" }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => onChip(s)} disabled={building || auto} style={{ padding: "6px 12px", background: st.panel, border: `1px solid ${st.border}`, borderRadius: 999, color: st.dim, fontFamily: st.font, fontSize: 12.5, cursor: "pointer" }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Block renderer ───────────────────────────────────────────────────

function BlockRenderer({ kind, st }: { kind: BlockKind; st: Style }) {
  switch (kind) {
    case "hero": return <HeroBlock st={st} />;
    case "persona": return <PersonaBlock st={st} />;
    case "journey": return <JourneyBlock st={st} />;
    case "works": return <WorksBlock st={st} />;
    case "impact": return <ImpactBlock st={st} />;
    case "empathy": return <EmpathyBlock st={st} />;
    case "contact": return <ContactBlock st={st} />;
    default: return null;
  }
}

const PAD = "32px 26px";
function card(st: Style): React.CSSProperties { return { background: st.panel, border: `1px solid ${st.border}`, borderRadius: st.radius, minWidth: 0 }; }
function pill(st: Style): React.CSSProperties { return { padding: "10px 20px", background: `linear-gradient(135deg, ${st.a}, ${st.b})`, color: "#04201b", borderRadius: Math.min(st.radius, 26), fontWeight: 700, fontSize: 14, textDecoration: "none", display: "inline-block" }; }
function Head({ st, tag, title }: { st: Style; tag: string; title: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10.5, fontFamily: FONT_MONO, color: st.a, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>{tag}</div>
      <h2 style={{ fontSize: 23, fontWeight: 600, letterSpacing: -0.4, margin: 0 }}>{title}</h2>
    </div>
  );
}

function NavbarBlock({ st, links, onNav }: { st: Style; links: BlockKind[]; onNav: (k: BlockKind) => void }) {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 4, display: "flex", alignItems: "center", gap: 12, padding: "12px 22px", background: st.screen, backdropFilter: "blur(12px)", borderBottom: `1px solid ${st.border}` }}>
      <span style={{ width: 18, height: 18, borderRadius: Math.min(st.radius, 8), background: `conic-gradient(from 90deg, ${st.a}, ${st.b})`, flexShrink: 0 }} />
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>KIRUK</span>
      <div style={{ marginLeft: "auto", display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
        {links.map((l) => (
          <button key={l} type="button" onClick={() => onNav(l)} style={{ background: "transparent", border: "none", color: st.dim, fontFamily: st.font, fontSize: 12.5, cursor: "pointer", padding: "4px 8px", borderRadius: Math.min(st.radius, 8) }}>{NAV_LABEL[l]}</button>
        ))}
        <span style={{ ...pill(st), padding: "5px 13px", fontSize: 12 }}>Hire</span>
      </div>
    </nav>
  );
}

function HeroBlock({ st }: { st: Style }) {
  return (
    <header style={{ padding: "48px 26px 34px", position: "relative", overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", top: -140, left: -60, width: 380, height: 380, borderRadius: "50%", background: `radial-gradient(circle, ${st.a}26, transparent 68%)`, filter: "blur(20px)" }} />
      <div style={{ position: "relative", maxWidth: 760 }}>
        <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: st.a, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>{HERO.preTitle}</div>
        <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.04, margin: "0 0 8px" }}>{HERO.name}</h1>
        <div style={{ fontSize: 18, color: st.a, fontWeight: 500, marginBottom: 14 }}>{HERO.role} · {HERO.org}</div>
        <p style={{ fontSize: 15, color: st.dim, lineHeight: 1.65, maxWidth: 580, margin: "0 0 20px" }}>{HERO.framing}</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={pill(st)}>View work →</span>
          <span style={{ ...card(st), padding: "10px 18px", fontSize: 13.5, color: st.ink }}>{WHY_KIRUK.tagline}</span>
        </div>
      </div>
    </header>
  );
}

function PersonaBlock({ st }: { st: Style }) {
  return (
    <div style={{ padding: PAD, borderTop: `1px solid ${st.border}` }}>
      <Head st={st} tag="about · persona" title="Who he is" />
      <p style={{ fontSize: 14.5, color: st.dim, lineHeight: 1.65, maxWidth: 600, margin: "0 0 16px" }}>{PERSONA.background}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        <ChipList st={st} title="Goals" items={PERSONA.goals} tint={st.a} />
        <ChipList st={st} title="Frustrations" items={PERSONA.frustrations} tint={st.b} />
      </div>
    </div>
  );
}
function ChipList({ st, title, items, tint }: { st: Style; title: string; items: readonly string[]; tint: string }) {
  return (
    <div style={{ ...card(st), padding: 14 }}>
      <div style={{ fontSize: 10, fontFamily: FONT_MONO, color: tint, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>{title}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((it) => (<li key={it} style={{ fontSize: 13, color: st.dim, lineHeight: 1.45, display: "flex", gap: 7 }}><span style={{ color: tint }}>›</span> {it}</li>))}
      </ul>
    </div>
  );
}

function JourneyBlock({ st }: { st: Style }) {
  return (
    <div style={{ padding: PAD, borderTop: `1px solid ${st.border}` }}>
      <Head st={st} tag="journey · timeline" title="The path here" />
      <div style={{ maxWidth: 640 }}>
        {nodes.map((n, i) => (
          <div key={n.year} style={{ display: "flex", gap: 13 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 12 }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: n.live ? st.b : st.a, boxShadow: n.live ? `0 0 10px ${st.b}` : "none", marginTop: 3, flexShrink: 0 }} />
              {i < nodes.length - 1 && <span style={{ flex: 1, width: 2, background: `${st.a}44`, minHeight: 26 }} />}
            </div>
            <div style={{ paddingBottom: i < nodes.length - 1 ? 16 : 0, flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 12.5, color: st.a }}>{n.year}</span>
                <span style={{ fontSize: 10, color: st.muted, fontFamily: FONT_MONO, textTransform: "uppercase" }}>{n.phase}</span>
                {n.live && <span style={{ fontSize: 9, color: st.b, border: `1px solid ${st.b}55`, borderRadius: 999, padding: "0 6px" }}>● now</span>}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{n.position}</div>
              <div style={{ fontSize: 12.5, color: st.dim }}>{n.org}</div>
              <div style={{ fontSize: 12.5, color: st.muted, marginTop: 2, lineHeight: 1.45 }}>{n.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorksBlock({ st }: { st: Style }) {
  return (
    <div style={{ padding: PAD, borderTop: `1px solid ${st.border}` }}>
      <Head st={st} tag="work · card sort" title="Selected work" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
        {CARD_SORTING.projects.map((p, i) => (
          <div key={p.id} style={{ ...card(st), padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: st.a }}>{["I", "II", "III", "IV"][i] ?? i + 1}</span>
              <span style={{ fontSize: 9.5, color: st.b, border: `1px solid ${st.b}44`, borderRadius: 999, padding: "0 7px" }}>{p.category}</span>
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.3 }}>{p.title}</div>
            <div style={{ fontSize: 12.5, color: st.dim, marginTop: 5, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
              {p.technologies.map((t) => (<span key={t} style={{ fontSize: 9.5, padding: "2px 7px", background: st.panel2, borderRadius: Math.min(st.radius, 6), color: st.muted }}>{t}</span>))}
            </div>
            <div style={{ fontSize: 10, color: st.muted, marginTop: 7, fontFamily: FONT_MONO }}>{p.role} · {p.duration}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImpactBlock({ st }: { st: Style }) {
  return (
    <div style={{ padding: PAD, borderTop: `1px solid ${st.border}` }}>
      <Head st={st} tag="impact · outcomes" title="Receipts" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        {IMPACT_METRICS.slice(0, 6).map((m, i) => (
          <div key={i} style={{ ...card(st), padding: "16px 16px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 16 }}>{m.icon}</span>
              <span style={{ fontSize: 27, fontWeight: 700, color: st.a, letterSpacing: -0.5 }}>{m.value}</span>
            </div>
            <div style={{ fontSize: 13, marginTop: 4 }}>{m.label}</div>
            {m.context && <div style={{ fontSize: 10.5, color: st.muted, marginTop: 1 }}>{m.context}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmpathyBlock({ st }: { st: Style }) {
  const quad: Array<{ k: string; items: readonly string[] }> = [
    { k: "Says", items: [EMPATHY_MAP.says.quote, ...EMPATHY_MAP.says.skills] },
    { k: "Thinks", items: EMPATHY_MAP.thinks },
    { k: "Does", items: EMPATHY_MAP.does },
    { k: "Feels", items: EMPATHY_MAP.feels },
  ];
  return (
    <div style={{ padding: PAD, borderTop: `1px solid ${st.border}` }}>
      <Head st={st} tag="process · empathy map" title="How he works" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
        {quad.map((q, i) => (
          <div key={q.k} style={{ ...card(st), padding: 13 }}>
            <div style={{ fontSize: 10, fontFamily: FONT_MONO, color: i % 2 ? st.b : st.a, textTransform: "uppercase", marginBottom: 6 }}>{q.k}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {q.items.map((it) => (<span key={it} style={{ fontSize: 11, color: st.dim, padding: "2px 8px", background: st.panel2, borderRadius: Math.min(st.radius, 8) }}>{it}</span>))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactBlock({ st }: { st: Style }) {
  return (
    <div style={{ padding: PAD, borderTop: `1px solid ${st.border}` }}>
      <Head st={st} tag="contact · usability test" title="Let's talk" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 18, maxWidth: 640 }}>
        {USABILITY_TEST.channels.map((c) => (
          <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" style={{ ...card(st), display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", textDecoration: "none", color: st.ink }}>
            <span style={{ width: 30, height: 30, borderRadius: Math.min(st.radius, 9), display: "grid", placeItems: "center", background: `${st.a}1c`, color: st.a, fontSize: 13, flexShrink: 0 }}>{c.label[0]}</span>
            <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span style={{ fontSize: 12.5, fontWeight: 500 }}>{c.label}</span>
              <span style={{ fontSize: 11, color: st.dim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.value}</span>
            </span>
          </a>
        ))}
      </div>
      <a href={USABILITY_TEST.channels[0].href} style={{ ...pill(st), padding: "13px 28px", fontSize: 15 }}>Let&apos;s talk →</a>
    </div>
  );
}

// ── Tiny ─────────────────────────────────────────────────────────────

function Dots({ accent }: { accent: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {[0, 1, 2].map((i) => (<span key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: accent, display: "inline-block", animation: `kb-dot 1.1s ${i * 0.18}s infinite` }} />))}
    </span>
  );
}

export default PromptUIHomePage;
