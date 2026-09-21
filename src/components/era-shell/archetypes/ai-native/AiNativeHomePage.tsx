"use client";

/**
 * AiNativeHomePage — 2023 archetype: kiruk.ai · conversational portfolio.
 *
 * 2023 was the year ChatGPT rewrote interface expectations. The dominant
 * paradigm shift was conversational: you no longer *browse* an app, you
 * *talk* to it, and it streams a structured answer back. This profile turns
 * Arun's UX-research file into an AI assistant. You don't scroll a portfolio
 * — you ask kiruk.ai about him and watch it think, retrieve artifacts, and
 * stream a generative answer with rich inline cards and source citations.
 *
 * Paradigm versus prior eras:
 *   · 2021 issue-tracker = Linear sprint board (keyboard-first workflow)
 *   · 2023 ai-native     = CONVERSATIONAL RAG ASSISTANT — streaming text,
 *     reasoning trace, generative cards, citations, aurora glow.
 *
 * Unique interaction — the LENS SWITCHER:
 *   The same UX artifacts, three voices. Toggle Designer / Engineer /
 *   Recruiter and every answer reframes — craft vs systems vs outcomes.
 *   Switching mid-thread re-renders the live conversation in the new voice.
 *
 * Other immersive details:
 *   · Token-by-token streaming with blinking cursor + Stop / Regenerate
 *   · Animated "thinking" reasoning trace (collapsible, like o1)
 *   · Generative rich cards: persona, journey, works, impact, empathy, contact
 *   · Clickable source citations that fire follow-up queries
 *   · Suggested prompt chips · free-text composer · conversation history rail
 *   · Aurora gradient backdrop (the purple/cyan/pink "AI glow" of 2023)
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

// ── Palette — 2023 AI aurora ─────────────────────────────────────────

const BG = "#0c0a1d";
const BG_2 = "#0a0818";
const PANEL = "rgba(255,255,255,0.035)";
const PANEL_2 = "rgba(255,255,255,0.06)";
const BORDER = "rgba(168,85,247,0.22)";
const BORDER_SOFT = "rgba(255,255,255,0.08)";
const INK = "#f1f5f9";
const INK_DIM = "#b3a9d9";
const INK_MUTE = "#7d7499";
const PURPLE = "#a855f7";
const CYAN = "#06b6d4";
const PINK = "#f472b6";
const GREEN = "#34d399";

const FONT_DISPLAY =
  "'Clash Display', 'Satoshi', 'Space Grotesk', -apple-system, sans-serif";
const FONT_UI = "'General Sans', 'DM Sans', 'Inter', -apple-system, sans-serif";
const FONT_MONO = "'Geist Mono', 'JetBrains Mono', 'SFMono-Regular', monospace";

// ── Lens (the unique interaction) ────────────────────────────────────

type Lens = "designer" | "engineer" | "recruiter";

const LENSES: Record<
  Lens,
  { label: string; icon: string; tag: string; accent: string }
> = {
  designer: {
    label: "Designer",
    icon: "✦",
    tag: "craft · taste · detail",
    accent: PINK,
  },
  engineer: {
    label: "Engineer",
    icon: "⌥",
    tag: "systems · precision · ship",
    accent: CYAN,
  },
  recruiter: {
    label: "Recruiter",
    icon: "◎",
    tag: "fit · outcomes · signal",
    accent: PURPLE,
  },
};

const LENS_ORDER: Lens[] = ["designer", "engineer", "recruiter"];

// ── Knowledge base — intents → lensed answers + rich cards ───────────

type CardKind =
  | "persona"
  | "journey"
  | "works"
  | "impact"
  | "empathy"
  | "contact";

interface Knowledge {
  intent: string;
  reasoning: string[];
  citations: string[]; // chip labels → fire follow-up intents
  card?: CardKind;
  text: Record<Lens, string>;
}

const nodes = buildTimeline();
const liveNode = nodes[nodes.length - 1];

const KB: Record<string, Knowledge> = {
  who: {
    intent: "who",
    reasoning: [
      "Parsing query → identity request",
      "Retrieving artifact: PERSONA",
      "Cross-referencing bio + role",
      "Composing answer in active lens",
    ],
    citations: ["persona", "journey", "philosophy"],
    card: "persona",
    text: {
      designer: `${PERSONA.identity.name} is a ${PERSONA.identity.role} who treats the seam between design and engineering as the actual product. ${PERSONA.identity.org}, based in ${PERSONA.identity.location}. He frames himself as the user under study — this whole portfolio is a usability file written about its own author. In his words: "${PERSONA.quote}"`,
      engineer: `Identity record: ${PERSONA.identity.name}, ${PERSONA.identity.role} @ ${PERSONA.identity.org}, ${PERSONA.identity.location}. Operates across the design↔engineering boundary as a single pipeline rather than a handoff. Self-modelled as the test subject of his own UX research file — the artifacts below are generated about him.`,
      recruiter: `${PERSONA.identity.name} — ${PERSONA.identity.role} at ${PERSONA.identity.org}, ${PERSONA.identity.location}. The short version: a hybrid who ships both the design and the code, so nothing gets lost in handoff. Currently: ${liveNode.position} @ ${liveNode.org.split(" · ")[0]}.`,
    },
  },
  journey: {
    intent: "journey",
    reasoning: [
      "Parsing query → career timeline",
      "Retrieving artifact: JOURNEY MAP",
      `Loading ${nodes.length} lifeline phases`,
      "Ordering by year, marking live node",
    ],
    citations: ["journey", "persona", "impact"],
    card: "journey",
    text: {
      designer: `Arun's path reads like parallel tracks that finally converged. Design freelancing and engineering school ran side by side for years — sketch critiques at night, CS by day — until the bridge role stopped being two jobs and became one. ${nodes.length} phases below, ending on the live node.`,
      engineer: `Career lifeline: ${nodes.length} phases, ${nodes[0].year}→${liveNode.year}. Two timelines (design freelance + engineering) ran concurrently and merged at the intersection node. The current node is flagged live. Full trace rendered below.`,
      recruiter: `Trajectory: from freelance design (2018) through an engineering degree, an interaction-design internship, an R&D intern→SDE conversion, to ${liveNode.position} today. Consistent upward motion across both disciplines — timeline below.`,
    },
  },
  work: {
    intent: "work",
    reasoning: [
      "Parsing query → portfolio request",
      "Retrieving artifact: CARD SORT (works)",
      `Ranking ${CARD_SORTING.projects.length} projects`,
      "Rendering plates with stack + role",
    ],
    citations: ["works", "impact", "contact"],
    card: "works",
    text: {
      designer: `A card-sort of selected works, grouped by where the craft lived. Each plate carries the brief, the role he played, and the stack. The throughline: every project is a place where a design decision and an engineering decision had to agree.`,
      engineer: `Selected works, card-sorted into ${CARD_SORTING.taxonomy.filter((t) => t !== "All").length} categories. Each entry lists technologies, duration, and role. Filtered to the ${CARD_SORTING.projects.length} highest-signal projects below.`,
      recruiter: `Here's what he's actually shipped — ${CARD_SORTING.projects.length} representative projects with role, stack, and duration on each. Skim the cards below; ask me to expand any one.`,
    },
  },
  impact: {
    intent: "impact",
    reasoning: [
      "Parsing query → outcomes request",
      "Retrieving artifact: IMPACT METRICS",
      `Loading ${IMPACT_METRICS.length} cite-able figures`,
      "Filtering output → outcome only",
    ],
    citations: ["impact", "works", "journey"],
    card: "impact",
    text: {
      designer: `Receipts, not adjectives. These are the outcomes Arun is willing to stand behind — each one paired with a surface that actually shipped. Design that didn't move a number doesn't make this list.`,
      engineer: `Outcome metrics (${IMPACT_METRICS.length}). Every figure is tied to a shipped surface; output-only vanity numbers are excluded by policy. Raw figures below.`,
      recruiter: `The numbers that matter for a hiring decision — ${IMPACT_METRICS.length} concrete outcomes, each backed by real work. Below.`,
    },
  },
  philosophy: {
    intent: "philosophy",
    reasoning: [
      "Parsing query → operating principles",
      "Retrieving artifact: WHY + EMPATHY·Thinks",
      "Synthesizing manifesto",
      "Composing in active lens",
    ],
    citations: ["philosophy", "empathy", "persona"],
    text: {
      designer: `The thesis: ${WHY_KIRUK.bridge} The pain it answers — ${WHY_KIRUK.pain} Three rules he keeps returning to: ${EMPATHY_MAP.thinks.join(" · ")}. And the tagline he ships under: "${WHY_KIRUK.tagline}"`,
      engineer: `Operating principles. Problem: ${WHY_KIRUK.pain} Solution: ${WHY_KIRUK.bridge} Heuristics in active use — ${EMPATHY_MAP.thinks.map((t, i) => `(${i + 1}) ${t}`).join(", ")}. These are filters, not slogans: they decide what gets a frame, what gets a route, what gets cut.`,
      recruiter: `What he optimizes for: ${WHY_KIRUK.bridge} It comes from a real pain — ${WHY_KIRUK.pain} Working philosophy in one line: "${WHY_KIRUK.tagline}"`,
    },
  },
  empathy: {
    intent: "empathy",
    reasoning: [
      "Parsing query → skills / mindset",
      "Retrieving artifact: EMPATHY MAP",
      "Quadranting Says / Thinks / Does / Feels",
      "Validating Says↔Does convergence",
    ],
    citations: ["empathy", "philosophy", "works"],
    card: "empathy",
    text: {
      designer: `An empathy map run on himself. What he says he can do and what the tools in his hands actually do cross the same line — that convergence is what makes the claim believable. Quadrants below.`,
      engineer: `Empathy-map quadrants: Says (claim) vs Does (observed tool rotation) vs Thinks (heuristics) vs Feels (drivers). Says↔Does convergence verified: Figma+Blender on one axis, Next.js+Spring Boot on the other. Grid below.`,
      recruiter: `A quick read on capability and motivation — what he claims, what he actually does day to day, and what drives him. The claim and the behavior line up, which is the part that matters. Below.`,
    },
  },
  contact: {
    intent: "contact",
    reasoning: [
      "Parsing query → contact intent",
      "Retrieving artifact: USABILITY TEST (channels)",
      `Ranking ${USABILITY_TEST.channels.length} channels by latency`,
      "Attaching success metrics",
    ],
    citations: ["contact", "persona"],
    card: "contact",
    text: {
      designer: `Starting a conversation is the one task this whole file is testing for. Pick the channel that fits the question — latency before politeness. Success metric: ${USABILITY_TEST.successMetrics[0]}.`,
      engineer: `Contact channels ranked by response latency, not etiquette. ${USABILITY_TEST.channels.length} routes below, each tagged with its role. SLA: ${USABILITY_TEST.successMetrics[0]}.`,
      recruiter: `Easiest way to reach him is below — email is the primary channel, LinkedIn for network, and he's ${USABILITY_TEST.successMetrics[1] ?? "open to conversations"}. Response time target: ${USABILITY_TEST.successMetrics[0]}.`,
    },
  },
  fallback: {
    intent: "fallback",
    reasoning: [
      "Parsing query → no exact artifact match",
      "Falling back to capability summary",
      "Offering retrieval entry points",
    ],
    citations: ["persona", "works", "contact"],
    text: {
      designer: `I'm trained on Arun's UX-research file, so I'm best at a few things: who he is, the path he took, what he's made, the outcomes, his philosophy, and how to reach him. Pick one of the prompts and I'll pull the artifact.`,
      engineer: `Query didn't map to a stored artifact. Indexed artifacts: persona, journey, works, impact, philosophy, empathy, contact. Re-query against one of those, or tap a suggestion.`,
      recruiter: `I can summarize Arun fast — background, journey, work, results, or how to reach him. Tap a prompt below and I'll get specific.`,
    },
  },
};

function detectIntent(q: string): string {
  const s = q.toLowerCase();
  if (/contact|reach|hire|hiring|email|connect|talk|available|message/.test(s))
    return "contact";
  if (/journey|career|timeline|experience|path|history|background|story/.test(s))
    return "journey";
  if (/work|project|portfolio|case|built|build|ship|made|made/.test(s))
    return "work";
  if (/impact|metric|result|outcome|number|stat|receipt/.test(s))
    return "impact";
  if (/philosoph|approach|principle|believe|why|bridge|manifesto|value/.test(s))
    return "philosophy";
  if (/skill|tool|stack|empath|feel|mindset|tech|strength/.test(s))
    return "empathy";
  if (/who|about|persona|yourself|tell me|arun|introduce/.test(s)) return "who";
  return "fallback";
}

// citation label → intent it fires
const CITATION_INTENT: Record<string, string> = {
  persona: "who",
  journey: "journey",
  works: "work",
  impact: "impact",
  philosophy: "philosophy",
  empathy: "empathy",
  contact: "contact",
};

// ── Suggested prompts + history entry points ─────────────────────────

const SUGGESTIONS: Array<{ label: string; query: string }> = [
  { label: "Who is Arun?", query: "Who is Arun?" },
  { label: "Walk me through his journey", query: "Walk me through his career journey" },
  { label: "Show me his work", query: "Show me his selected work" },
  { label: "What's the impact?", query: "What impact has he had?" },
  { label: "Design philosophy", query: "What's his design philosophy?" },
  { label: "How do I reach him?", query: "How do I contact him?" },
];

const HISTORY: Array<{ title: string; query: string; icon: string }> = [
  { title: "Persona deep-dive", query: "Who is Arun?", icon: "◐" },
  { title: "Career journey", query: "Walk me through his career journey", icon: "↗" },
  { title: "Selected works", query: "Show me his selected work", icon: "▤" },
  { title: "Impact receipts", query: "What impact has he had?", icon: "✓" },
  { title: "Empathy map", query: "What are his skills and mindset?", icon: "◍" },
  { title: "Get in touch", query: "How do I contact him?", icon: "✉" },
];

// ── Message model ────────────────────────────────────────────────────

type Phase = "thinking" | "streaming" | "done";

interface Msg {
  id: string;
  role: "user" | "ai";
  text: string;
  shown: string;
  phase: Phase;
  lens?: Lens;
  reasoning?: string[];
  showReasoning?: boolean;
  card?: CardKind;
  citations?: string[];
}

let _seq = 0;
const nextId = () => `m-${Date.now()}-${_seq++}`;

// ── Hook ─────────────────────────────────────────────────────────────

function useIsMobile(bp = 860): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const c = () => setM(window.innerWidth < bp);
    c();
    window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, [bp]);
  return m;
}

// ── Main component ───────────────────────────────────────────────────

export function AiNativeHomePage() {
  const { setLayoutMode } = useLayoutMode();
  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);
  const isMobile = useIsMobile();

  const [lens, setLens] = useState<Lens>("designer");
  const [lensMenuOpen, setLensMenuOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [busy, setBusy] = useState(false); // a stream in progress

  const threadRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const reduceMotion = useRef(false);
  useEffect(() => {
    reduceMotion.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Seed greeting once.
  useEffect(() => {
    setMessages([greetingMsg("designer")]);
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "page_view", path: "/era/2023" }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll thread to bottom on update.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // ── Streaming engine ──────────────────────────────────────────────
  useEffect(() => {
    const active = messages.find(
      (m) => m.role === "ai" && (m.phase === "thinking" || m.phase === "streaming"),
    );
    if (!active) {
      if (busy) setBusy(false);
      return;
    }

    if (active.phase === "thinking") {
      const delay = reduceMotion.current ? 0 : 850;
      const t = window.setTimeout(() => {
        setMessages((ms) =>
          ms.map((m) => (m.id === active.id ? { ...m, phase: "streaming" } : m)),
        );
      }, delay);
      return () => window.clearTimeout(t);
    }

    // streaming
    if (reduceMotion.current) {
      setMessages((ms) =>
        ms.map((m) =>
          m.id === active.id ? { ...m, shown: m.text, phase: "done" } : m,
        ),
      );
      return;
    }
    if (active.shown.length >= active.text.length) {
      setMessages((ms) =>
        ms.map((m) => (m.id === active.id ? { ...m, phase: "done" } : m)),
      );
      return;
    }
    const t = window.setTimeout(() => {
      setMessages((ms) =>
        ms.map((m) => {
          if (m.id !== active.id) return m;
          const next = Math.min(m.text.length, m.shown.length + 4);
          return { ...m, shown: m.text.slice(0, next) };
        }),
      );
    }, 16);
    return () => window.clearTimeout(t);
  }, [messages, busy]);

  // ── Send a query ──────────────────────────────────────────────────
  const send = useCallback(
    (raw: string) => {
      const q = raw.trim();
      if (!q || busy) return;
      const intent = detectIntent(q);
      const k = KB[intent] ?? KB.fallback;
      const userMsg: Msg = {
        id: nextId(),
        role: "user",
        text: q,
        shown: q,
        phase: "done",
      };
      const aiMsg: Msg = {
        id: nextId(),
        role: "ai",
        text: k.text[lens],
        shown: "",
        phase: "thinking",
        lens,
        reasoning: k.reasoning,
        showReasoning: false,
        card: k.card,
        citations: k.citations,
      };
      setBusy(true);
      setMessages((ms) => [...ms, userMsg, aiMsg]);
      setInput("");
    },
    [busy, lens],
  );

  // Stop generating — freeze partial, mark done.
  const stop = useCallback(() => {
    setMessages((ms) =>
      ms.map((m) =>
        m.role === "ai" && (m.phase === "streaming" || m.phase === "thinking")
          ? { ...m, phase: "done", shown: m.shown || m.text.slice(0, 1) }
          : m,
      ),
    );
    setBusy(false);
  }, []);

  // Regenerate the last AI answer (re-stream, possibly new lens).
  const regenerate = useCallback(() => {
    if (busy) return;
    setMessages((ms) => {
      const lastAiIdx = [...ms].reverse().findIndex((m) => m.role === "ai");
      if (lastAiIdx < 0) return ms;
      const idx = ms.length - 1 - lastAiIdx;
      const prevUser = [...ms.slice(0, idx)].reverse().find((m) => m.role === "user");
      const intent = prevUser ? detectIntent(prevUser.text) : "fallback";
      const k = KB[intent] ?? KB.fallback;
      const re: Msg = {
        ...ms[idx],
        text: k.text[lens],
        shown: "",
        phase: "thinking",
        lens,
        reasoning: k.reasoning,
        card: k.card,
        citations: k.citations,
      };
      const copy = ms.slice();
      copy[idx] = re;
      return copy;
    });
    setBusy(true);
  }, [busy, lens]);

  // Switch lens — re-render the live conversation in the new voice.
  const switchLens = useCallback(
    (next: Lens) => {
      setLens(next);
      setLensMenuOpen(false);
      if (busy) return;
      // Reframe every already-rendered AI answer (except greeting) in-place.
      setMessages((ms) => {
        let changed = false;
        const reframed = ms.map((m, i) => {
          if (m.role !== "ai" || m.phase !== "done") return m;
          // find the user message that preceded this AI message
          const prevUser = [...ms.slice(0, i)].reverse().find((u) => u.role === "user");
          if (!prevUser) {
            // greeting — reframe to greeting in new lens
            changed = true;
            const g = greetingMsg(next);
            return { ...m, text: g.text, shown: g.text, lens: next };
          }
          const k = KB[detectIntent(prevUser.text)] ?? KB.fallback;
          changed = true;
          return { ...m, text: k.text[next], shown: k.text[next], lens: next };
        });
        if (!changed) return ms;
        const note: Msg = {
          id: nextId(),
          role: "ai",
          text: `↻ Reframed in ${LENSES[next].label} lens — same artifacts, ${LENSES[next].tag}.`,
          shown: `↻ Reframed in ${LENSES[next].label} lens — same artifacts, ${LENSES[next].tag}.`,
          phase: "done",
          lens: next,
        };
        return [...reframed, note];
      });
    },
    [busy],
  );

  const toggleReasoning = useCallback((id: string) => {
    setMessages((ms) =>
      ms.map((m) => (m.id === id ? { ...m, showReasoning: !m.showReasoning } : m)),
    );
  }, []);

  const newChat = useCallback(() => {
    if (busy) return;
    setMessages([greetingMsg(lens)]);
    setHistoryOpen(false);
  }, [busy, lens]);

  const threadStarted = messages.some((m) => m.role === "user");
  const lensAccent = LENSES[lens].accent;

  return (
    <div
      id="kiruk-ai"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: BG,
        color: INK,
        fontFamily: FONT_UI,
        overflow: "hidden",
      }}
    >
      <style jsx global>{`
        @keyframes kai-aurora-1 {
          0%, 100% { transform: translate(-10%, -10%) scale(1); }
          50% { transform: translate(10%, 8%) scale(1.25); }
        }
        @keyframes kai-aurora-2 {
          0%, 100% { transform: translate(12%, 6%) scale(1.15); }
          50% { transform: translate(-8%, -12%) scale(0.9); }
        }
        @keyframes kai-aurora-3 {
          0%, 100% { transform: translate(0%, 10%) scale(1); }
          50% { transform: translate(6%, -8%) scale(1.3); }
        }
        @keyframes kai-fade-up {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes kai-pop {
          0% { opacity: 0; transform: scale(0.96) translateY(6px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes kai-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes kai-dot {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-3px); }
        }
        @keyframes kai-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        #kiruk-ai *:focus-visible {
          outline: 2px solid ${PURPLE};
          outline-offset: 2px;
          border-radius: 8px;
        }
        #kiruk-ai ::-webkit-scrollbar { width: 8px; height: 8px; }
        #kiruk-ai ::-webkit-scrollbar-thumb {
          background: rgba(168,85,247,0.3); border-radius: 8px;
        }
        #kai-thread { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) {
          #kiruk-ai * { animation-duration: 0.001ms !important; }
        }
      `}</style>

      {/* AURORA BACKDROP */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <Blob color={PURPLE} top="-15%" left="-10%" size={620} anim="kai-aurora-1 22s ease-in-out infinite" />
        <Blob color={CYAN} top="20%" left="55%" size={540} anim="kai-aurora-2 26s ease-in-out infinite" />
        <Blob color={PINK} top="55%" left="10%" size={520} anim="kai-aurora-3 30s ease-in-out infinite" />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 50% 0%, transparent 40%, ${BG_2} 95%)`,
          }}
        />
      </div>

      {/* SHELL */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "248px 1fr",
          minHeight: "100vh",
        }}
      >
        {/* HISTORY RAIL (desktop) */}
        {!isMobile && (
          <HistoryRail
            lens={lens}
            onPick={(q) => send(q)}
            onNewChat={newChat}
            busy={busy}
          />
        )}

        {/* CONVERSATION COLUMN */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            minHeight: "100vh",
            maxHeight: "100vh",
            position: "relative",
          }}
        >
          {/* TOP CHROME */}
          <header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 6,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              borderBottom: `1px solid ${BORDER_SOFT}`,
              background: "rgba(12,10,29,0.72)",
              backdropFilter: "blur(14px)",
            }}
          >
            {isMobile && (
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                aria-label="Open history"
                style={iconBtn}
              >
                ☰
              </button>
            )}
            <div
              aria-hidden
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: `conic-gradient(from 140deg, ${PURPLE}, ${CYAN}, ${PINK}, ${PURPLE})`,
                boxShadow: `0 0 18px ${PURPLE}66`,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 600, letterSpacing: -0.3 }}>
                kiruk<span style={{ color: PURPLE }}>.ai</span>
              </span>
              <span style={{ fontSize: 10, color: INK_MUTE }}>
                portfolio assistant · 2023
              </span>
            </div>

            {/* Lens switcher (the unique interaction) */}
            <div style={{ marginLeft: "auto", position: "relative" }}>
              <button
                type="button"
                onClick={() => setLensMenuOpen((o) => !o)}
                title="Switch lens — reframe every answer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "5px 10px",
                  background: PANEL,
                  border: `1px solid ${lensAccent}55`,
                  borderRadius: 999,
                  color: INK,
                  fontFamily: FONT_UI,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                <span style={{ color: lensAccent, fontSize: 13 }}>{LENSES[lens].icon}</span>
                <span style={{ fontWeight: 500 }}>{LENSES[lens].label}</span>
                {!isMobile && (
                  <span style={{ color: INK_MUTE, fontSize: 10 }}>lens</span>
                )}
                <span style={{ color: INK_MUTE, fontSize: 9 }}>▾</span>
              </button>
              {lensMenuOpen && (
                <>
                  <div
                    onClick={() => setLensMenuOpen(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 9 }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      right: 0,
                      zIndex: 10,
                      width: 248,
                      background: "rgba(20,17,46,0.96)",
                      backdropFilter: "blur(18px)",
                      border: `1px solid ${BORDER}`,
                      borderRadius: 14,
                      padding: 6,
                      boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
                      animation: "kai-pop 160ms ease-out",
                    }}
                  >
                    <div style={{ padding: "6px 10px 8px", fontSize: 10, color: INK_MUTE, letterSpacing: 0.5, textTransform: "uppercase" }}>
                      Answer lens — same data, new voice
                    </div>
                    {LENS_ORDER.map((l) => {
                      const meta = LENSES[l];
                      const on = l === lens;
                      return (
                        <button
                          key={l}
                          type="button"
                          onClick={() => switchLens(l)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            width: "100%",
                            padding: "9px 10px",
                            background: on ? `${meta.accent}1f` : "transparent",
                            border: `1px solid ${on ? `${meta.accent}55` : "transparent"}`,
                            borderRadius: 10,
                            color: INK,
                            cursor: "pointer",
                            textAlign: "left",
                            marginBottom: 2,
                          }}
                        >
                          <span
                            style={{
                              width: 28,
                              height: 28,
                              flexShrink: 0,
                              borderRadius: 8,
                              display: "grid",
                              placeItems: "center",
                              background: `${meta.accent}22`,
                              color: meta.accent,
                              fontSize: 14,
                            }}
                          >
                            {meta.icon}
                          </span>
                          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{meta.label}</span>
                            <span style={{ fontSize: 10, color: INK_MUTE }}>{meta.tag}</span>
                          </span>
                          {on && <span style={{ marginLeft: "auto", color: meta.accent, fontSize: 12 }}>●</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </header>

          {/* THREAD */}
          <div
            id="kai-thread"
            ref={threadRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: isMobile ? "16px 14px 8px" : "26px 24px 12px",
            }}
          >
            <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
              {!threadStarted && <Welcome lens={lens} isMobile={isMobile} />}
              {messages.map((m) =>
                m.role === "user" ? (
                  <UserBubble key={m.id} text={m.text} />
                ) : (
                  <AiBubble
                    key={m.id}
                    msg={m}
                    onToggleReasoning={() => toggleReasoning(m.id)}
                    onCite={(label) => {
                      const intent = CITATION_INTENT[label];
                      if (intent) send(humanizeIntent(intent));
                    }}
                  />
                ),
              )}
            </div>
          </div>

          {/* COMPOSER */}
          <div
            style={{
              position: "sticky",
              bottom: 0,
              zIndex: 6,
              padding: isMobile ? "8px 12px 14px" : "10px 24px 18px",
              background: "linear-gradient(to top, rgba(12,10,29,0.96) 60%, transparent)",
            }}
          >
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
              {/* Suggestion chips */}
              <div
                style={{
                  display: "flex",
                  gap: 7,
                  flexWrap: isMobile ? "nowrap" : "wrap",
                  overflowX: isMobile ? "auto" : "visible",
                  paddingBottom: 8,
                }}
              >
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => send(s.query)}
                    disabled={busy}
                    style={{
                      flexShrink: 0,
                      padding: "6px 11px",
                      background: PANEL,
                      border: `1px solid ${BORDER_SOFT}`,
                      borderRadius: 999,
                      color: busy ? INK_MUTE : INK_DIM,
                      fontFamily: FONT_UI,
                      fontSize: 12,
                      cursor: busy ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                  padding: 8,
                  background: "rgba(20,17,46,0.85)",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 18,
                  boxShadow: `0 0 30px ${PURPLE}1f`,
                }}
              >
                <textarea
                  ref={composerRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  placeholder={`Ask kiruk.ai anything about Arun…`}
                  style={{
                    flex: 1,
                    resize: "none",
                    maxHeight: 120,
                    padding: "8px 8px",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: INK,
                    fontFamily: FONT_UI,
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                />
                {busy ? (
                  <button
                    type="button"
                    onClick={stop}
                    title="Stop generating"
                    style={{
                      flexShrink: 0,
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      border: `1px solid ${BORDER}`,
                      background: PANEL_2,
                      color: INK,
                      cursor: "pointer",
                      fontSize: 14,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    ◼
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => send(input)}
                    disabled={!input.trim()}
                    title="Send · ↵"
                    style={{
                      flexShrink: 0,
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      border: "none",
                      background: input.trim()
                        ? `linear-gradient(135deg, ${PURPLE}, ${PINK})`
                        : PANEL_2,
                      color: "#fff",
                      cursor: input.trim() ? "pointer" : "not-allowed",
                      fontSize: 15,
                      display: "grid",
                      placeItems: "center",
                      boxShadow: input.trim() ? `0 0 18px ${PURPLE}66` : "none",
                    }}
                  >
                    ↑
                  </button>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, padding: "0 4px" }}>
                <span style={{ fontSize: 10, color: INK_MUTE }}>
                  kiruk.ai retrieves from Arun's UX-research file · {LENSES[lens].label} lens
                </span>
                {threadStarted && !busy && (
                  <button
                    type="button"
                    onClick={regenerate}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: INK_DIM,
                      fontFamily: FONT_UI,
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    ↻ Regenerate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE HISTORY DRAWER */}
      {isMobile && historyOpen && (
        <div
          onClick={() => setHistoryOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(280px, 82vw)", height: "100%" }}>
            <HistoryRail
              lens={lens}
              onPick={(q) => {
                send(q);
                setHistoryOpen(false);
              }}
              onNewChat={newChat}
              busy={busy}
              onClose={() => setHistoryOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Greeting ─────────────────────────────────────────────────────────

function greetingMsg(lens: Lens): Msg {
  const text: Record<Lens, string> = {
    designer: `Hi — I'm kiruk.ai, trained on ${HERO.name.split(" ")[0]}'s design practice. Ask me how he works, what he's shipped, or how to reach him. Or tap a prompt to start.`,
    engineer: `kiruk.ai online. I index ${HERO.name.split(" ")[0]}'s UX-research file as structured artifacts — persona, journey, impact, contact. Query me and I'll retrieve the relevant ones.`,
    recruiter: `Hi — I'm kiruk.ai. I can get you a fast read on ${HERO.name.split(" ")[0]}: background, what he ships, the outcomes, and how to start a conversation. Pick a prompt or ask your own.`,
  };
  return {
    id: nextId(),
    role: "ai",
    text: text[lens],
    shown: text[lens],
    phase: "done",
    lens,
  };
}

function humanizeIntent(intent: string): string {
  switch (intent) {
    case "who": return "Who is Arun?";
    case "journey": return "Walk me through his journey";
    case "work": return "Show me his selected work";
    case "impact": return "What impact has he had?";
    case "philosophy": return "What's his design philosophy?";
    case "empathy": return "What are his skills and mindset?";
    case "contact": return "How do I contact him?";
    default: return "Tell me about Arun";
  }
}

// ── Welcome (empty-state hero, only before first user turn) ──────────

function Welcome({ lens, isMobile }: { lens: Lens; isMobile: boolean }) {
  return (
    <div style={{ textAlign: "center", padding: isMobile ? "10px 0 6px" : "26px 0 10px", animation: "kai-fade-up 500ms ease-out" }}>
      <div
        aria-hidden
        style={{
          width: 58,
          height: 58,
          margin: "0 auto 16px",
          borderRadius: 18,
          background: `conic-gradient(from 140deg, ${PURPLE}, ${CYAN}, ${PINK}, ${PURPLE})`,
          boxShadow: `0 0 40px ${PURPLE}55`,
        }}
      />
      <h1
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: isMobile ? 26 : 34,
          fontWeight: 600,
          letterSpacing: -0.8,
          margin: "0 0 8px",
          background: `linear-gradient(120deg, ${INK} 30%, ${PURPLE} 70%, ${PINK})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Ask anything about Arun.
      </h1>
      <p style={{ color: INK_DIM, fontSize: isMobile ? 13 : 15, lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>
        This portfolio is a UX-research file — and kiruk.ai is the assistant that
        reads it back to you. Streamed answers, real artifacts, three lenses.
        Currently in <strong style={{ color: LENSES[lens].accent }}>{LENSES[lens].label}</strong> lens.
      </p>
    </div>
  );
}

// ── Bubbles ──────────────────────────────────────────────────────────

function UserBubble({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", animation: "kai-fade-up 280ms ease-out" }}>
      <div
        style={{
          maxWidth: "82%",
          padding: "10px 14px",
          background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`,
          color: "#fff",
          borderRadius: "16px 16px 4px 16px",
          fontSize: 14,
          lineHeight: 1.5,
          boxShadow: `0 6px 20px ${PURPLE}33`,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function AiBubble({
  msg,
  onToggleReasoning,
  onCite,
}: {
  msg: Msg;
  onToggleReasoning: () => void;
  onCite: (label: string) => void;
}) {
  const isNote = !msg.reasoning && !msg.card && msg.text.startsWith("↻");
  return (
    <div style={{ display: "flex", gap: 10, animation: "kai-fade-up 320ms ease-out" }}>
      <div
        aria-hidden
        style={{
          width: 28,
          height: 28,
          flexShrink: 0,
          borderRadius: 9,
          background: isNote
            ? "transparent"
            : `conic-gradient(from 120deg, ${PURPLE}, ${CYAN}, ${PINK}, ${PURPLE})`,
          boxShadow: isNote ? "none" : `0 0 14px ${PURPLE}55`,
          marginTop: 2,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        {isNote ? (
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              background: PANEL,
              border: `1px solid ${BORDER_SOFT}`,
              borderRadius: 999,
              fontSize: 12,
              color: INK_DIM,
            }}
          >
            {msg.text}
          </div>
        ) : (
          <>
            {/* Reasoning trace */}
            {msg.reasoning && (
              <ReasoningTrace
                steps={msg.reasoning}
                phase={msg.phase}
                open={msg.showReasoning ?? false}
                onToggle={onToggleReasoning}
              />
            )}

            {/* Answer text (streamed) */}
            {msg.phase !== "thinking" && (
              <div
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.65,
                  color: INK,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {msg.shown}
                {msg.phase === "streaming" && (
                  <span
                    aria-hidden
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 16,
                      marginLeft: 2,
                      transform: "translateY(2px)",
                      background: PURPLE,
                      borderRadius: 2,
                      animation: "kai-blink 1s step-end infinite",
                    }}
                  />
                )}
              </div>
            )}

            {/* Rich card (after stream done) */}
            {msg.phase === "done" && msg.card && (
              <div style={{ marginTop: 14, animation: "kai-pop 360ms ease-out" }}>
                <RichCard kind={msg.card} lens={msg.lens ?? "designer"} />
              </div>
            )}

            {/* Citations */}
            {msg.phase === "done" && msg.citations && msg.citations.length > 0 && (
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 10, color: INK_MUTE, textTransform: "uppercase", letterSpacing: 0.6 }}>
                  Sources
                </span>
                {msg.citations.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onCite(c)}
                    title={`Open artifact: ${c}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 9px",
                      background: PANEL,
                      border: `1px solid ${BORDER_SOFT}`,
                      borderRadius: 999,
                      color: INK_DIM,
                      fontFamily: FONT_MONO,
                      fontSize: 10.5,
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ color: CYAN }}>⟢</span> {c}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ReasoningTrace({
  steps,
  phase,
  open,
  onToggle,
}: {
  steps: string[];
  phase: Phase;
  open: boolean;
  onToggle: () => void;
}) {
  const thinking = phase === "thinking";
  const expanded = thinking || open;
  return (
    <div style={{ marginBottom: 10 }}>
      <button
        type="button"
        onClick={onToggle}
        disabled={thinking}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "4px 10px",
          background: PANEL,
          border: `1px solid ${BORDER_SOFT}`,
          borderRadius: 999,
          color: INK_DIM,
          fontFamily: FONT_UI,
          fontSize: 11.5,
          cursor: thinking ? "default" : "pointer",
        }}
      >
        {thinking ? (
          <span style={{ display: "inline-flex", gap: 3 }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: PURPLE,
                  display: "inline-block",
                  animation: `kai-dot 1.2s ${i * 0.16}s infinite`,
                }}
              />
            ))}
          </span>
        ) : (
          <span style={{ color: CYAN }}>✶</span>
        )}
        <span>{thinking ? "Thinking…" : open ? "Hide reasoning" : "Show reasoning"}</span>
      </button>
      {expanded && (
        <ol
          style={{
            listStyle: "none",
            margin: "8px 0 0",
            padding: "0 0 0 4px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {steps.map((s, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                fontSize: 12,
                color: INK_MUTE,
                animation: thinking ? `kai-fade-up 300ms ${i * 0.18}s both` : undefined,
              }}
            >
              <span style={{ color: PURPLE, fontFamily: FONT_MONO, fontSize: 10, marginTop: 1 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ── Rich cards ───────────────────────────────────────────────────────

function RichCard({ kind, lens }: { kind: CardKind; lens: Lens }) {
  switch (kind) {
    case "persona": return <PersonaCard />;
    case "journey": return <JourneyCard />;
    case "works": return <WorksCard />;
    case "impact": return <ImpactCard />;
    case "empathy": return <EmpathyCard />;
    case "contact": return <ContactCard />;
    default: return null;
  }
}

function CardShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: PANEL,
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
        padding: 14,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 10,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: INK_MUTE,
          marginBottom: 10,
        }}
      >
        <span style={{ color: CYAN }}>◆</span> {label}
        <span style={{ marginLeft: "auto", fontFamily: FONT_MONO, color: PURPLE }}>generated</span>
      </div>
      {children}
    </div>
  );
}

function PersonaCard() {
  const rows: Array<[string, string]> = [
    ["Name", PERSONA.identity.name],
    ["Role", PERSONA.identity.role],
    ["Org", PERSONA.identity.org],
    ["Location", PERSONA.identity.location],
  ];
  return (
    <CardShell label="Persona · identity">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ background: PANEL_2, borderRadius: 10, padding: "8px 10px" }}>
            <div style={{ fontSize: 9.5, color: INK_MUTE, textTransform: "uppercase", letterSpacing: 0.5 }}>{k}</div>
            <div style={{ fontSize: 13, color: INK, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        <Mini title="Goals" items={PERSONA.goals} tint={GREEN} />
        <Mini title="Frustrations" items={PERSONA.frustrations} tint={PINK} />
      </div>
    </CardShell>
  );
}

function Mini({ title, items, tint }: { title: string; items: readonly string[]; tint: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: tint, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>{title}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((it) => (
          <li key={it} style={{ fontSize: 12, color: INK_DIM, lineHeight: 1.4, display: "flex", gap: 6 }}>
            <span style={{ color: tint }}>·</span> {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function JourneyCard() {
  return (
    <CardShell label="Journey map · career lifeline">
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {nodes.map((n, i) => (
          <div key={n.year} style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 16 }}>
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: n.live ? GREEN : PURPLE,
                  boxShadow: n.live ? `0 0 12px ${GREEN}` : "none",
                  flexShrink: 0,
                  marginTop: 3,
                }}
              />
              {i < nodes.length - 1 && (
                <span style={{ flex: 1, width: 2, background: `linear-gradient(${PURPLE}, ${CYAN}55)`, minHeight: 22 }} />
              )}
            </div>
            <div style={{ paddingBottom: i < nodes.length - 1 ? 14 : 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: CYAN }}>{n.year}</span>
                <span style={{ fontSize: 10, color: INK_MUTE, textTransform: "uppercase", letterSpacing: 0.5 }}>{n.phase}</span>
                {n.live && (
                  <span style={{ fontSize: 9, color: GREEN, border: `1px solid ${GREEN}55`, borderRadius: 999, padding: "0 6px" }}>● live</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: INK, fontWeight: 500, marginTop: 2 }}>{n.position}</div>
              <div style={{ fontSize: 11.5, color: INK_DIM }}>{n.org}</div>
              <div style={{ fontSize: 11.5, color: INK_MUTE, marginTop: 2, lineHeight: 1.45 }}>{n.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function WorksCard() {
  return (
    <CardShell label="Card sort · selected works">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {CARD_SORTING.projects.map((p, i) => (
          <div key={p.id} style={{ background: PANEL_2, borderRadius: 12, padding: 11, border: `1px solid ${BORDER_SOFT}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: PURPLE }}>{["I", "II", "III", "IV"][i] ?? i + 1}</span>
              <span style={{ fontSize: 9, color: CYAN, border: `1px solid ${CYAN}44`, borderRadius: 999, padding: "0 6px" }}>{p.category}</span>
            </div>
            <div style={{ fontSize: 13, color: INK, fontWeight: 500, lineHeight: 1.3 }}>{p.title}</div>
            <div style={{ fontSize: 11, color: INK_DIM, marginTop: 4, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {p.description}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 7 }}>
              {p.technologies.map((t) => (
                <span key={t} style={{ fontSize: 9.5, padding: "1px 6px", background: PANEL, borderRadius: 6, color: INK_MUTE }}>{t}</span>
              ))}
            </div>
            <div style={{ fontSize: 10, color: INK_MUTE, marginTop: 6, fontFamily: FONT_MONO }}>{p.role} · {p.duration}</div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function ImpactCard() {
  return (
    <CardShell label="Impact metrics · outcomes">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {IMPACT_METRICS.slice(0, 6).map((m, i) => (
          <div key={i} style={{ background: PANEL_2, borderRadius: 12, padding: "11px 12px", border: `1px solid ${BORDER_SOFT}` }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 15 }}>{m.icon}</span>
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 22,
                  fontWeight: 600,
                  background: `linear-gradient(120deg, ${PURPLE}, ${PINK})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {m.value}
              </span>
            </div>
            <div style={{ fontSize: 12, color: INK, marginTop: 3 }}>{m.label}</div>
            {m.context && <div style={{ fontSize: 10.5, color: INK_MUTE, marginTop: 1 }}>{m.context}</div>}
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function EmpathyCard() {
  const quad: Array<{ k: string; tint: string; body: React.ReactNode }> = [
    {
      k: "Says",
      tint: PINK,
      body: (
        <>
          <div style={{ fontStyle: "italic", color: INK, fontSize: 12 }}>&ldquo;{EMPATHY_MAP.says.quote}&rdquo;</div>
          <div style={{ fontSize: 11, color: INK_DIM, marginTop: 4 }}>{EMPATHY_MAP.says.skills.join(" · ")}</div>
        </>
      ),
    },
    { k: "Thinks", tint: PURPLE, body: <Lines items={EMPATHY_MAP.thinks} /> },
    { k: "Does", tint: CYAN, body: <Lines items={EMPATHY_MAP.does} /> },
    { k: "Feels", tint: GREEN, body: <Lines items={EMPATHY_MAP.feels} /> },
  ];
  return (
    <CardShell label="Empathy map · says / thinks / does / feels">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {quad.map((q) => (
          <div key={q.k} style={{ background: PANEL_2, borderRadius: 10, padding: "9px 11px", border: `1px solid ${BORDER_SOFT}` }}>
            <div style={{ fontSize: 10, color: q.tint, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 5 }}>{q.k}</div>
            {q.body}
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function Lines({ items }: { items: readonly string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {items.map((it) => (
        <span key={it} style={{ fontSize: 11, color: INK_DIM, padding: "1px 7px", background: PANEL, borderRadius: 6 }}>{it}</span>
      ))}
    </div>
  );
}

function ContactCard() {
  return (
    <CardShell label="Usability test · contact channels">
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {USABILITY_TEST.channels.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 11px",
              background: PANEL_2,
              border: `1px solid ${BORDER_SOFT}`,
              borderRadius: 11,
              textDecoration: "none",
              color: INK,
            }}
          >
            <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", background: `${PURPLE}22`, color: PURPLE, fontSize: 13, flexShrink: 0 }}>
              {c.label[0]}
            </span>
            <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{c.label}</span>
              <span style={{ fontSize: 11, color: INK_DIM, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.value}</span>
            </span>
            <span style={{ marginLeft: "auto", fontSize: 9.5, color: INK_MUTE, flexShrink: 0 }}>{c.role}</span>
          </a>
        ))}
      </div>
      <div style={{ marginTop: 9, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {USABILITY_TEST.successMetrics.map((s) => (
          <span key={s} style={{ fontSize: 10, color: GREEN, border: `1px solid ${GREEN}44`, borderRadius: 999, padding: "2px 8px" }}>✓ {s}</span>
        ))}
      </div>
    </CardShell>
  );
}

// ── History rail ─────────────────────────────────────────────────────

function HistoryRail({
  lens,
  onPick,
  onNewChat,
  busy,
  onClose,
}: {
  lens: Lens;
  onPick: (q: string) => void;
  onNewChat: () => void;
  busy: boolean;
  onClose?: () => void;
}) {
  return (
    <aside
      style={{
        background: "rgba(10,8,24,0.78)",
        backdropFilter: "blur(16px)",
        borderRight: `1px solid ${BORDER_SOFT}`,
        padding: "12px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        height: "100%",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 6px 10px" }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 600 }}>
          kiruk<span style={{ color: PURPLE }}>.ai</span>
        </span>
        {onClose && (
          <button type="button" onClick={onClose} style={{ ...iconBtn, marginLeft: "auto" }} aria-label="Close">✕</button>
        )}
      </div>

      <button
        type="button"
        onClick={onNewChat}
        disabled={busy}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 11px",
          background: `linear-gradient(135deg, ${PURPLE}22, ${CYAN}18)`,
          border: `1px solid ${BORDER}`,
          borderRadius: 11,
          color: INK,
          fontFamily: FONT_UI,
          fontSize: 13,
          cursor: busy ? "not-allowed" : "pointer",
          marginBottom: 8,
        }}
      >
        <span style={{ color: PURPLE }}>＋</span> New chat
      </button>

      <div style={{ fontSize: 9.5, color: INK_MUTE, textTransform: "uppercase", letterSpacing: 0.8, padding: "4px 8px" }}>
        Recents
      </div>
      {HISTORY.map((h) => (
        <button
          key={h.title}
          type="button"
          onClick={() => onPick(h.query)}
          disabled={busy}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "8px 10px",
            background: "transparent",
            border: "none",
            borderRadius: 9,
            color: INK_DIM,
            fontFamily: FONT_UI,
            fontSize: 12.5,
            cursor: busy ? "not-allowed" : "pointer",
            textAlign: "left",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = PANEL)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span style={{ color: CYAN, fontSize: 12, width: 14 }}>{h.icon}</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.title}</span>
        </button>
      ))}

      <div style={{ marginTop: "auto", paddingTop: 12 }}>
        <div
          style={{
            padding: "9px 11px",
            background: PANEL,
            border: `1px solid ${BORDER_SOFT}`,
            borderRadius: 11,
            fontSize: 11,
            color: INK_DIM,
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: LENSES[lens].accent }}>{LENSES[lens].icon} {LENSES[lens].label} lens</span>
          <br />
          {LENSES[lens].tag}
        </div>
      </div>
    </aside>
  );
}

// ── Tiny pieces ──────────────────────────────────────────────────────

function Blob({
  color,
  top,
  left,
  size,
  anim,
}: {
  color: string;
  top: string;
  left: string;
  size: number;
  anim: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}55 0%, ${color}00 68%)`,
        filter: "blur(20px)",
        animation: anim,
        willChange: "transform",
      }}
    />
  );
}

const iconBtn: React.CSSProperties = {
  width: 30,
  height: 30,
  display: "grid",
  placeItems: "center",
  background: "transparent",
  border: "none",
  color: INK_DIM,
  fontSize: 16,
  cursor: "pointer",
  borderRadius: 8,
};

export default AiNativeHomePage;
