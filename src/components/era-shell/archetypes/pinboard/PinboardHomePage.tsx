"use client";

/**
 * PinboardHomePage — 2013 archetype: KIRUK Pinboard.
 *
 * The web in 2013 wasn't only iOS 7 flat — it was the rise of the CARD
 * as a unit of information. Pinterest's masonry board peaked, Mailbox's
 * swipe gestures rewrote inbox UX, and Google Now stacked context cards
 * automatically. This profile fuses those three patterns:
 *
 *  · BOARD VIEW — Pinterest-style variable-height masonry of 10 cards,
 *    each one a UX research artifact. Click a card → CSS 3D flip
 *    reveals the back with real artifact data.
 *
 *  · DECK VIEW — Mailbox/Tinder-style single card on top of a stack.
 *    Swipe right to pin (save), swipe left to dismiss. Progress dots
 *    show remaining cards.
 *
 *  · PINNED — sessionStorage-backed sidebar/strip of saved cards.
 *
 * Visual language: iOS 7 flat — thin Helvetica Neue, hairline borders,
 * vibrant accent (#007aff), no shadows beyond a faint card lift,
 * frosted-blur backdrops, vivid pastel highlights.
 *
 * Paradigm versus prior eras:
 *   · 2009 iPhone-skeu = skeuomorphic surfaces inside a device frame
 *   · 2013 pinboard    = FLAT card grid + flip-to-reveal + swipe-to-act
 *
 * Unique interactions:
 *   · CSS 3D flip on card click (front → back face, smooth 540ms)
 *   · Swipe-deck mode: pointer drag, tilt + opacity tracks delta,
 *     release threshold commits left/right
 *   · Pin/save persists in sessionStorage; pinned strip shows live
 *   · Filter chips above board narrow to one artifact
 *   · Search input live-filters card titles + tags
 *   · Light / dark mode toggle (iOS 7 introduced flat dark surfaces)
 *   · Keyboard: ← dismiss · → pin · F flip · / search
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { useCalmMotion } from "@/hooks/useCalmMotion";
import {
  WHY_KIRUK,
  PERSONA,
  EMPATHY_MAP,
  buildTimeline,
  IMPACT_METRICS,
  CARD_SORTING,
  USABILITY_TEST,
} from "@/data/era-page-content";
import { EYE_BAR_GAP, eyeDepth } from "@/components/layout/eye-clear";

// ── Palette — iOS 7 flat ─────────────────────────────────────────────

const BG_LIGHT = "#f2f2f7";
const BG_DARK = "#0a0a0f";
const CARD_LIGHT = "#ffffff";
const CARD_DARK = "#16181f";
const INK_LIGHT = "#16181f";
const INK_DARK = "#f2f2f7";
const INK_DIM_LIGHT = "#767b91";
const INK_DIM_DARK = "#9aa0b4";
const HAIRLINE_LIGHT = "#d9dbe2";
const HAIRLINE_DARK = "#2a2c38";
const IOS_BLUE = "#007aff";
const IOS_BLUE_DEEP = "#0058c4";
const IOS_PINK = "#ff2d55";
const IOS_GREEN = "#34c759";
const IOS_ORANGE = "#ff9500";
const IOS_PURPLE = "#af52de";
const IOS_TEAL = "#5ac8fa";
const IOS_YELLOW = "#ffcc00";

const FONT_UI = "'Helvetica Neue', 'Helvetica', 'Inter', sans-serif";
const FONT_DISPLAY = "'Helvetica Neue', 'Helvetica', sans-serif";
const FONT_MONO = "'Menlo', 'Courier New', monospace";

// ── Pin model ────────────────────────────────────────────────────────

type ArtifactKey =
  | "thesis"
  | "persona"
  | "empathy"
  | "thinks"
  | "journey"
  | "impact"
  | "works"
  | "contact";

interface Pin {
  id: string;
  artifact: ArtifactKey;
  artifactLabel: string;
  title: string;
  tags: string[];
  accent: string;
  size: "sm" | "md" | "lg" | "xl"; // masonry height hint
  front: () => React.ReactNode;
  back: () => React.ReactNode;
}

function buildPins(): Pin[] {
  const nodes = buildTimeline();
  const top4 = IMPACT_METRICS.slice(0, 4);
  return [
    {
      id: "p-thesis",
      artifact: "thesis",
      artifactLabel: "WHY KIRUK",
      title: WHY_KIRUK.hook,
      tags: ["thesis", "bridge"],
      accent: IOS_BLUE,
      size: "lg",
      front: () => (
        <FrontHero>
          <div style={{ fontSize: 14, color: IOS_DIM_TONE, letterSpacing: 0.3, marginBottom: 6 }}>
            The thesis
          </div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 22,
              lineHeight: 1.2,
              fontWeight: 200,
              letterSpacing: -0.5,
            }}
          >
            {WHY_KIRUK.hook}
          </div>
        </FrontHero>
      ),
      back: () => (
        <BackBlock label="WHY KIRUK" color={IOS_BLUE}>
          <p style={pBack}>{WHY_KIRUK.pain}</p>
          <p style={pBack}>{WHY_KIRUK.bridge}</p>
          <blockquote
            style={{
              margin: "8px 0 0",
              padding: "8px 10px",
              borderLeft: `2px solid ${IOS_BLUE}`,
              fontFamily: FONT_DISPLAY,
              fontStyle: "italic",
              fontSize: 14,
              color: IOS_BLUE_DEEP,
              fontWeight: 300,
            }}
          >
            &ldquo;{WHY_KIRUK.tagline}&rdquo;
          </blockquote>
        </BackBlock>
      ),
    },
    {
      id: "p-persona",
      artifact: "persona",
      artifactLabel: "PERSONA",
      title: PERSONA.identity.name,
      tags: ["identity", "fact sheet"],
      accent: IOS_PINK,
      size: "md",
      front: () => (
        <FrontHero>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background:
                `radial-gradient(circle at 30% 30%, ${IOS_PINK} 0%, #c41a3e 100%)`,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_DISPLAY,
              fontSize: 22,
              fontWeight: 200,
              marginBottom: 10,
            }}
          >
            {PERSONA.identity.name.charAt(0)}
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 500 }}>
            {PERSONA.identity.name}
          </div>
          <div style={{ fontSize: 12, color: IOS_DIM_TONE, marginTop: 2 }}>
            {PERSONA.identity.role}
          </div>
          <div style={{ fontSize: 11, color: IOS_DIM_TONE, marginTop: 1 }}>
            {PERSONA.identity.org} · {PERSONA.identity.location}
          </div>
        </FrontHero>
      ),
      back: () => (
        <BackBlock label="PERSONA · Identity" color={IOS_PINK}>
          <DataRow k="Name" v={PERSONA.identity.name} />
          <DataRow k="Role" v={PERSONA.identity.role} />
          <DataRow k="Employer" v={PERSONA.identity.org} />
          <DataRow k="Location" v={PERSONA.identity.location} />
          <DataRow k="Type" v="Designer ↔ Engineer · bridge" />
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 12,
              fontStyle: "italic",
              color: IOS_PINK,
              lineHeight: 1.45,
            }}
          >
            &ldquo;{PERSONA.quote}&rdquo;
          </p>
        </BackBlock>
      ),
    },
    {
      id: "p-empathy",
      artifact: "empathy",
      artifactLabel: "EMPATHY MAP",
      title: "Says · Thinks · Does · Feels",
      tags: ["empathy map", "quadrant"],
      accent: IOS_PURPLE,
      size: "lg",
      front: () => (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            height: "100%",
            color: "inherit",
          }}
        >
          {(["Says", "Thinks", "Does", "Feels"] as const).map((q, i) => (
            <div
              key={q}
              style={{
                padding: "8px 10px",
                borderRight: i % 2 === 0 ? `1px solid currentColor` : "none",
                borderBottom: i < 2 ? `1px solid currentColor` : "none",
                opacity: 0.94,
              }}
            >
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: IOS_PURPLE,
                  textTransform: "uppercase",
                  fontWeight: 500,
                  marginBottom: 2,
                }}
              >
                {q}
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.4 }}>
                {q === "Says" && <em>&ldquo;{EMPATHY_MAP.says.quote}&rdquo;</em>}
                {q === "Thinks" && EMPATHY_MAP.thinks[0]}
                {q === "Does" && EMPATHY_MAP.does.slice(0, 3).join(" · ")}
                {q === "Feels" && EMPATHY_MAP.feels[0]}
              </div>
            </div>
          ))}
        </div>
      ),
      back: () => (
        <BackBlock label="EMPATHY MAP" color={IOS_PURPLE}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Quad head="Says" tint={IOS_PURPLE}>
              <i>&ldquo;{EMPATHY_MAP.says.quote}&rdquo;</i>
            </Quad>
            <Quad head="Thinks" tint={IOS_PURPLE}>
              {EMPATHY_MAP.thinks.map((t) => <div key={t}>· {t}</div>)}
            </Quad>
            <Quad head="Does" tint={IOS_PURPLE}>
              {EMPATHY_MAP.does.join(" · ")}
            </Quad>
            <Quad head="Feels" tint={IOS_PURPLE}>
              {EMPATHY_MAP.feels.map((f) => <div key={f}>· {f}</div>)}
            </Quad>
          </div>
        </BackBlock>
      ),
    },
    {
      id: "p-thinks",
      artifact: "thinks",
      artifactLabel: "COMPASS",
      title: "Operating compass",
      tags: ["compass", "manifesto"],
      accent: IOS_TEAL,
      size: "sm",
      front: () => (
        <FrontHero>
          <div style={{ fontSize: 10, color: IOS_DIM_TONE, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
            Three rules
          </div>
          {EMPATHY_MAP.thinks.map((t) => (
            <div
              key={t}
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 14,
                fontWeight: 300,
                lineHeight: 1.45,
              }}
            >
              <span style={{ color: IOS_TEAL, marginRight: 4 }}>▸</span>
              {t}
            </div>
          ))}
        </FrontHero>
      ),
      back: () => (
        <BackBlock label="OPERATING COMPASS" color={IOS_TEAL}>
          <p style={pBack}>
            Three rules the work keeps returning to. Not aphorisms — filters that decide what gets a frame, what gets a route, what gets cut.
          </p>
          <ol style={{ margin: "6px 0 0", padding: "0 0 0 16px", fontSize: 12 }}>
            {EMPATHY_MAP.thinks.map((t) => (
              <li key={t} style={{ marginBottom: 3 }}>{t}</li>
            ))}
          </ol>
        </BackBlock>
      ),
    },
    {
      id: "p-journey",
      artifact: "journey",
      artifactLabel: "JOURNEY MAP",
      title: `${nodes[0].year} → ${nodes[nodes.length - 1].year}`,
      tags: ["journey", "lifeline"],
      accent: IOS_ORANGE,
      size: "xl",
      front: () => (
        <FrontHero>
          <div style={{ fontSize: 10, color: IOS_DIM_TONE, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Career lifeline
          </div>
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {nodes.map((n) => (
              <li
                key={n.year}
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr",
                  gap: 8,
                  padding: "4px 0",
                  borderBottom: `1px solid currentColor`,
                  borderColor: "rgba(127,127,127,0.18)",
                  fontSize: 12,
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 16,
                    fontWeight: 200,
                    color: n.live ? IOS_PINK : "inherit",
                  }}
                >
                  {n.year}
                </span>
                <span>
                  <strong style={{ fontWeight: 500 }}>{n.position}</strong>
                  {n.live && (
                    <span style={{ color: IOS_PINK, marginLeft: 4, fontSize: 10 }}>
                      ● now
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </FrontHero>
      ),
      back: () => (
        <BackBlock label="JOURNEY MAP" color={IOS_ORANGE}>
          {nodes.map((n) => (
            <div key={n.year} style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 10, color: IOS_DIM_TONE, letterSpacing: 1, textTransform: "uppercase" }}>
                {n.year} · {n.phase}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{n.position}</div>
              <div style={{ fontSize: 11, color: IOS_DIM_TONE, fontStyle: "italic" }}>@ {n.org}</div>
              <div style={{ fontSize: 11, marginTop: 1 }}>{n.detail}</div>
            </div>
          ))}
        </BackBlock>
      ),
    },
    ...top4.map<Pin>((m, i) => ({
      id: `p-impact-${m.id}`,
      artifact: "impact" as const,
      artifactLabel: "IMPACT",
      title: `${m.value} ${m.label.toLowerCase()}`,
      tags: ["impact", "metric"],
      accent: [IOS_GREEN, IOS_BLUE, IOS_PINK, IOS_ORANGE][i % 4],
      size: i % 2 === 0 ? "sm" : "md",
      front: () => (
        <FrontHero>
          <div
            style={{
              fontSize: 28,
              color: [IOS_GREEN, IOS_BLUE, IOS_PINK, IOS_ORANGE][i % 4],
              marginBottom: 4,
            }}
            aria-hidden
          >
            {m.icon}
          </div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 36,
              fontWeight: 100,
              letterSpacing: -1.5,
              lineHeight: 1,
              color: "inherit",
            }}
          >
            {m.value}
          </div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 12,
              letterSpacing: 0.5,
              color: IOS_DIM_TONE,
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            {m.label}
          </div>
          {m.context && (
            <div style={{ fontSize: 10, color: IOS_DIM_TONE, fontStyle: "italic", marginTop: 4 }}>
              {m.context}
            </div>
          )}
        </FrontHero>
      ),
      back: () => (
        <BackBlock label="IMPACT" color={[IOS_GREEN, IOS_BLUE, IOS_PINK, IOS_ORANGE][i % 4]}>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 28,
              fontWeight: 200,
              letterSpacing: -1,
            }}
          >
            {m.value}
          </div>
          <div style={{ fontSize: 12, letterSpacing: 0.5, color: IOS_DIM_TONE, textTransform: "uppercase" }}>
            {m.label}
          </div>
          {m.context && (
            <p style={{ ...pBack, marginTop: 6 }}>{m.context}</p>
          )}
          <div
            style={{
              marginTop: 8,
              fontSize: 10,
              color: IOS_DIM_TONE,
              letterSpacing: 0.5,
              fontStyle: "italic",
            }}
          >
            cite-able · paired to shipped surface
          </div>
        </BackBlock>
      ),
    })),
    ...CARD_SORTING.projects.slice(0, 3).map<Pin>((p, i) => ({
      id: `p-work-${p.id}`,
      artifact: "works" as const,
      artifactLabel: "WORKS",
      title: p.title,
      tags: [p.category.toLowerCase(), "case study"],
      accent: [IOS_BLUE, IOS_PURPLE, IOS_TEAL][i % 3],
      size: i === 0 ? "lg" : "md",
      front: () => (
        <div
          style={{
            position: "relative",
            height: "100%",
            background: `linear-gradient(135deg, ${[IOS_BLUE, IOS_PURPLE, IOS_TEAL][i % 3]} 0%, ${darken([IOS_BLUE, IOS_PURPLE, IOS_TEAL][i % 3])} 100%)`,
            color: "#fff",
            padding: 14,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 14,
              fontSize: 28,
              opacity: 0.85,
            }}
          >
            {["🖼", "📱", "🤖"][i]}
          </div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              opacity: 0.85,
              marginBottom: 3,
            }}
          >
            {p.category} · {p.duration}
          </div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 18,
              fontWeight: 500,
              lineHeight: 1.2,
            }}
          >
            {p.title}
          </div>
        </div>
      ),
      back: () => (
        <BackBlock label={`WORKS · Plate ${["I", "II", "III"][i]}`} color={[IOS_BLUE, IOS_PURPLE, IOS_TEAL][i % 3]}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 500 }}>{p.title}</div>
          <div style={{ fontSize: 10, color: IOS_DIM_TONE, letterSpacing: 0.5, textTransform: "uppercase" }}>
            {p.category} · {p.duration}
          </div>
          <p style={pBack}>{p.description}</p>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: [IOS_BLUE, IOS_PURPLE, IOS_TEAL][i % 3], marginTop: 4 }}>
            ▸ {p.technologies.join(" · ")}
          </div>
        </BackBlock>
      ),
    })),
    {
      id: "p-contact",
      artifact: "contact",
      artifactLabel: "USABILITY · Channels",
      title: "Pick a channel",
      tags: ["contact", "channels"],
      accent: IOS_GREEN,
      size: "md",
      front: () => (
        <FrontHero>
          <div style={{ fontSize: 10, color: IOS_DIM_TONE, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Reach out
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {USABILITY_TEST.channels.slice(0, 3).map((c) => (
              <div
                key={c.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 6,
                  borderBottom: `1px solid currentColor`,
                  borderColor: "rgba(127,127,127,0.16)",
                  padding: "3px 0",
                  fontSize: 12,
                }}
              >
                <span style={{ fontWeight: 500 }}>{c.label}</span>
                <span style={{ color: IOS_GREEN, fontSize: 11 }}>
                  ›
                </span>
              </div>
            ))}
          </div>
        </FrontHero>
      ),
      back: () => (
        <BackBlock label="USABILITY · Channels" color={IOS_GREEN}>
          {USABILITY_TEST.channels.map((c) => (
            <div
              key={c.label}
              style={{
                padding: "5px 0",
                borderBottom: `1px solid currentColor`,
                borderColor: "rgba(127,127,127,0.16)",
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 500 }}>{c.label}</div>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                style={{ color: IOS_GREEN, fontSize: 11, textDecoration: "none", wordBreak: "break-all" }}
              >
                {c.value}
              </a>
              <div style={{ fontSize: 10, color: IOS_DIM_TONE, fontStyle: "italic" }}>
                {c.role}
              </div>
            </div>
          ))}
        </BackBlock>
      ),
    },
  ];
}

// ── shared helpers ───────────────────────────────────────────────────

const IOS_DIM_TONE = "rgba(127, 127, 127, 0.95)"; // works on both light/dark

const pBack: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 12,
  lineHeight: 1.5,
};

function FrontHero({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 14,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {children}
    </div>
  );
}

function BackBlock({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: 14,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 9,
          letterSpacing: 2,
          color,
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        {label} · back
      </div>
      {children}
    </div>
  );
}

function DataRow({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "82px 1fr",
        gap: 6,
        padding: "3px 0",
        borderBottom: `1px solid currentColor`,
        borderColor: "rgba(127,127,127,0.16)",
        fontSize: 11,
      }}
    >
      <span style={{ color: IOS_DIM_TONE, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>
        {k}
      </span>
      <span>{v}</span>
    </div>
  );
}

function Quad({
  head,
  tint,
  children,
}: {
  head: string;
  tint: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: 6,
        border: `1px solid ${tint}55`,
        borderRadius: 5,
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 9,
          letterSpacing: 1.5,
          color: tint,
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        {head}
      </div>
      <div style={{ fontSize: 11, lineHeight: 1.4, marginTop: 2 }}>
        {children}
      </div>
    </div>
  );
}

function darken(hex: string): string {
  if (!hex.startsWith("#") || hex.length !== 7) return hex;
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 60);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 60);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 60);
  return `rgb(${r}, ${g}, ${b})`;
}

// ── Hook ─────────────────────────────────────────────────────────────

function useIsMobile(breakpoint = 768): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const c = () => setM(window.innerWidth < breakpoint);
    c();
    window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, [breakpoint]);
  return m;
}

// ── Main component ───────────────────────────────────────────────────

/** The frosted header floats in the eye, as wide as the board below it. */
const BAR_W = 1144;
const BAR_TOP = `calc(${eyeDepth(BAR_W)} + ${EYE_BAR_GAP}px)`;

export function PinboardHomePage() {
  const { setLayoutMode } = useLayoutMode();
  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);

  const pins = useMemo(buildPins, []);
  const isMobile = useIsMobile();

  // Theme
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const bg = theme === "light" ? BG_LIGHT : BG_DARK;
  const card = theme === "light" ? CARD_LIGHT : CARD_DARK;
  const ink = theme === "light" ? INK_LIGHT : INK_DARK;
  const inkDim = theme === "light" ? INK_DIM_LIGHT : INK_DIM_DARK;
  const hairline = theme === "light" ? HAIRLINE_LIGHT : HAIRLINE_DARK;

  // View
  const [view, setView] = useState<"board" | "deck">("board");

  // Filter chips + search
  const [filter, setFilter] = useState<ArtifactKey | null>(null);
  const [query, setQuery] = useState("");

  // Multi-board (3 named boards) — pinId → boardId mapping
  type BoardId = "inspiration" | "method" | "reference";
  const BOARDS: Array<{ id: BoardId; label: string; tint: string }> = [
    { id: "inspiration", label: "Inspiration", tint: IOS_PINK },
    { id: "method",      label: "Method",      tint: IOS_PURPLE },
    { id: "reference",   label: "Reference",   tint: IOS_TEAL },
  ];
  const [pinMap, setPinMap] = useState<Record<string, BoardId>>({});
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kiruk-2013-pinmap");
      if (raw) setPinMap(JSON.parse(raw) as Record<string, BoardId>);
    } catch {/* noop */}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("kiruk-2013-pinmap", JSON.stringify(pinMap));
    } catch {/* noop */}
  }, [pinMap]);
  const pinned: Record<string, boolean> = useMemo(() => {
    const o: Record<string, boolean> = {};
    Object.keys(pinMap).forEach((id) => (o[id] = true));
    return o;
  }, [pinMap]);

  // Board picker popover state
  const [pickerFor, setPickerFor] = useState<{ id: string; x: number; y: number } | null>(null);
  const requestPin = useCallback((id: string, anchor: { x: number; y: number }) => {
    if (pinMap[id]) {
      // Already pinned → unpin
      setPinMap((m) => {
        const next = { ...m };
        delete next[id];
        return next;
      });
      setToast("📌 removed from board");
    } else {
      setPickerFor({ id, x: anchor.x, y: anchor.y });
    }
  }, [pinMap]);
  const commitPin = useCallback((board: BoardId) => {
    if (!pickerFor) return;
    setPinMap((m) => ({ ...m, [pickerFor.id]: board }));
    setToast(`📌 saved to ${BOARDS.find((b) => b.id === board)?.label}`);
    setPickerFor(null);
  }, [pickerFor]);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(id);
  }, [toast]);

  // Lightbox modal
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const lightboxPin = useMemo(
    () => pins.find((p) => p.id === lightboxId) ?? null,
    [pins, lightboxId],
  );

  // Featured rotating pin. Phones hold the pin still — skip steps it — so
  // the board isn't changing under the thumb every eight seconds.
  const calm = useCalmMotion();
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [featuredProgress, setFeaturedProgress] = useState(0);
  useEffect(() => {
    if (calm) return;
    const id = window.setInterval(() => {
      setFeaturedProgress((p) => {
        if (p >= 100) {
          setFeaturedIdx((i) => (i + 1) % pins.length);
          return 0;
        }
        return p + 100 / 80; // 8 seconds (100ms intervals × 80)
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [pins.length, calm]);
  const featuredPin = pins[featuredIdx % pins.length];

  // Flipped state (board view)
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const toggleFlip = useCallback((id: string) => {
    setFlipped((f) => ({ ...f, [id]: !f[id] }));
  }, []);

  // Deck — index of top card + skipped ids
  const [deckIdx, setDeckIdx] = useState(0);
  const [deckOrder, setDeckOrder] = useState<string[]>([]);
  useEffect(() => {
    setDeckOrder(pins.map((p) => p.id));
  }, [pins]);
  const resetDeck = () => {
    setDeckIdx(0);
    setDeckOrder(pins.map((p) => p.id));
  };

  // Filtered pins
  const visible = useMemo(() => {
    let out = pins;
    if (filter) out = out.filter((p) => p.artifact === filter);
    if (query) {
      const q = query.toLowerCase();
      out = out.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.artifactLabel.toLowerCase().includes(q),
      );
    }
    return out;
  }, [pins, filter, query]);

  // Deck pin lookup
  const deckPin = useMemo(() => {
    const id = deckOrder[deckIdx];
    return id ? pins.find((p) => p.id === id) ?? null : null;
  }, [deckOrder, deckIdx, pins]);

  // Swipe state
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);
  const beginDrag = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY };
  };
  const moveDrag = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setDrag({
      x: e.clientX - dragRef.current.startX,
      y: e.clientY - dragRef.current.startY,
    });
  };
  const endDrag = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {/* noop */}
    const { x } = drag;
    if (x > 100 && deckPin) {
      // Swipe right → pin (anchor at screen center)
      requestPin(deckPin.id, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
      setDeckIdx((i) => i + 1);
    } else if (x < -100) {
      // Swipe left → dismiss
      setDeckIdx((i) => i + 1);
    }
    setDrag({ x: 0, y: 0 });
    dragRef.current = null;
  };

  const deckAct = (dir: "left" | "right") => {
    if (!deckPin) return;
    if (dir === "right") requestPin(deckPin.id, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setDeckIdx((i) => i + 1);
  };

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = (e.target as HTMLElement | null)?.tagName;
      if (t === "INPUT" || t === "TEXTAREA") return;
      if (view === "deck") {
        if (e.key === "ArrowLeft") { e.preventDefault(); deckAct("left"); }
        else if (e.key === "ArrowRight") { e.preventDefault(); deckAct("right"); }
      }
      if (e.key.toLowerCase() === "/") {
        e.preventDefault();
        const inp = document.getElementById("kiruk-2013-search");
        (inp as HTMLInputElement | null)?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, deckPin]);

  // Track visit
  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "page_view", path: "/era/2013" }),
    }).catch(() => {});
  }, []);

  // Filter chips
  const chips: Array<{ id: ArtifactKey; label: string; tint: string }> = [
    { id: "thesis",   label: "Thesis",   tint: IOS_BLUE },
    { id: "persona",  label: "Persona",  tint: IOS_PINK },
    { id: "empathy",  label: "Empathy",  tint: IOS_PURPLE },
    { id: "thinks",   label: "Compass",  tint: IOS_TEAL },
    { id: "journey",  label: "Journey",  tint: IOS_ORANGE },
    { id: "impact",   label: "Impact",   tint: IOS_GREEN },
    { id: "works",    label: "Works",    tint: IOS_BLUE },
    { id: "contact",  label: "Contact",  tint: IOS_GREEN },
  ];

  return (
    <div
      id="kiruk-pinboard"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: bg,
        color: ink,
        fontFamily: FONT_UI,
        paddingTop: BAR_TOP,
        paddingBottom: 30,
        transition: "background 240ms, color 240ms",
      }}
    >
      <style jsx global>{`
        @keyframes kiruk-2013-card-in {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes kiruk-2013-toast-in {
          0%   { opacity: 0; transform: translate(-50%, 10px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        .kiruk-2013-flip {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 540ms cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        .kiruk-2013-flip.flipped {
          transform: rotateY(180deg);
        }
        .kiruk-2013-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .kiruk-2013-back-face {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* ── HEADER ───────────────────────────────────────── */}
      <header
        style={{
          // On phones the stacked header is too tall to pin.
          position: isMobile ? "relative" : "sticky",
          top: isMobile ? undefined : BAR_TOP,
          zIndex: 20,
          width: `min(${BAR_W}px, calc(100% - 16px))`,
          margin: "0 auto",
          borderRadius: isMobile ? 14 : 18,
          background: theme === "light" ? "rgba(242,242,247,0.86)" : "rgba(10,10,15,0.86)",
          backdropFilter: "blur(18px) saturate(160%)",
          WebkitBackdropFilter: "blur(18px) saturate(160%)",
          border: `1px solid ${hairline}`,
          boxShadow: theme === "light" ? "0 6px 20px rgba(0,0,0,0.06)" : "0 6px 20px rgba(0,0,0,0.4)",
          padding: isMobile ? "8px 12px" : "10px 18px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "auto 1fr auto",
          gap: 10,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            aria-hidden
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${IOS_BLUE} 0%, ${IOS_PURPLE} 100%)`,
            }}
          />
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 200, letterSpacing: -0.5, lineHeight: 1 }}>
              kiruk · pinboard
            </div>
            <div style={{ fontSize: 10, color: inkDim, letterSpacing: 0.5, marginTop: 1 }}>
              {pins.length} pins · {Object.keys(pinned).length} saved
            </div>
          </div>
        </div>

        {!isMobile && (
          <div
            style={{
              display: "flex",
              gap: 4,
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Chip
              label="All"
              active={!filter}
              tint={IOS_BLUE}
              onClick={() => setFilter(null)}
            />
            {chips.map((c) => (
              <Chip
                key={c.id}
                label={c.label}
                active={filter === c.id}
                tint={c.tint}
                onClick={() => setFilter(filter === c.id ? null : c.id)}
              />
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            justifySelf: "end",
            flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: card,
              border: `1px solid ${hairline}`,
              borderRadius: 999,
              padding: "2px 4px 2px 8px",
              minWidth: 130,
            }}
          >
            <span style={{ color: inkDim, fontSize: 12 }}>🔍</span>
            <input
              id="kiruk-2013-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search · /"
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                outline: "none",
                fontFamily: FONT_UI,
                fontSize: 12,
                color: ink,
                padding: "2px 4px",
                minWidth: 80,
              }}
            />
          </div>

          {/* View toggle */}
          <div
            style={{
              display: "flex",
              border: `1px solid ${hairline}`,
              borderRadius: 999,
              overflow: "hidden",
              background: card,
            }}
          >
            <SegBtn active={view === "board"} onClick={() => setView("board")} ink={ink} accent={IOS_BLUE}>
              📌 Board
            </SegBtn>
            <SegBtn active={view === "deck"} onClick={() => setView("deck")} ink={ink} accent={IOS_BLUE}>
              🃏 Deck
            </SegBtn>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            title={theme === "light" ? "Switch to dark" : "Switch to light"}
            style={{
              width: 30,
              height: 28,
              border: `1px solid ${hairline}`,
              borderRadius: 999,
              background: card,
              color: ink,
              cursor: "pointer",
              fontSize: 14,
              padding: 0,
            }}
          >
            {theme === "light" ? "🌙" : "☀"}
          </button>
        </div>
      </header>

      {/* Mobile chips — separate row */}
      {isMobile && (
        <div
          style={{
            display: "flex",
            gap: 4,
            width: "calc(100% - 16px)",
            margin: "8px auto 0",
            padding: "8px 12px",
            overflowX: "auto",
            borderRadius: 14,
            background: theme === "light" ? "rgba(242,242,247,0.86)" : "rgba(10,10,15,0.86)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${hairline}`,
          }}
        >
          <Chip label="All" active={!filter} tint={IOS_BLUE} onClick={() => setFilter(null)} />
          {chips.map((c) => (
            <Chip
              key={c.id}
              label={c.label}
              active={filter === c.id}
              tint={c.tint}
              onClick={() => setFilter(filter === c.id ? null : c.id)}
            />
          ))}
        </div>
      )}

      {/* ── FEATURED STRIP ─────────────────────────────── */}
      {view === "board" && featuredPin && (
        <div
          style={{
            maxWidth: 1180,
            margin: "16px auto 0",
            padding: isMobile ? "0 10px" : "0 18px",
          }}
        >
          <FeaturedStrip
            pin={featuredPin}
            progress={featuredProgress}
            compact={isMobile}
            card={card}
            ink={ink}
            inkDim={inkDim}
            hairline={hairline}
            saved={!!pinned[featuredPin.id]}
            onPin={(anchor) => requestPin(featuredPin.id, anchor)}
            onExpand={() => setLightboxId(featuredPin.id)}
            onSkip={() => setFeaturedIdx((i) => (i + 1) % pins.length)}
          />
        </div>
      )}

      {/* ── BODY ─────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1180,
          margin: "16px auto 0",
          padding: isMobile ? "0 10px" : "0 18px",
          display: "grid",
          gridTemplateColumns: isMobile || view === "deck" ? "1fr" : "1fr 240px",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* Main column */}
        <div>
          {view === "board" ? (
            <Masonry
              pins={visible}
              flipped={flipped}
              pinned={pinned}
              card={card}
              ink={ink}
              inkDim={inkDim}
              hairline={hairline}
              onFlip={toggleFlip}
              onPin={requestPin}
              onExpand={(id) => setLightboxId(id)}
              isMobile={isMobile}
            />
          ) : (
            <DeckView
              pins={visible}
              pin={deckPin}
              idx={deckIdx}
              total={visible.length || pins.length}
              drag={drag}
              card={card}
              ink={ink}
              inkDim={inkDim}
              hairline={hairline}
              isPinned={deckPin ? !!pinned[deckPin.id] : false}
              onBegin={beginDrag}
              onMove={moveDrag}
              onEnd={endDrag}
              onLeft={() => deckAct("left")}
              onRight={() => deckAct("right")}
              onReset={resetDeck}
            />
          )}
        </div>

        {/* Pinned sidebar */}
        {!isMobile && view === "board" && (
          <aside
            style={{
              position: "sticky",
              top: `calc(${BAR_TOP} + 88px)`,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                background: card,
                border: `1px solid ${hairline}`,
                borderRadius: 10,
                padding: 10,
              }}
            >
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: inkDim,
                  textTransform: "uppercase",
                  marginBottom: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Pinned · {Object.keys(pinned).length}</span>
                {Object.keys(pinned).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPinMap({})}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: IOS_PINK,
                      fontSize: 10,
                      cursor: "pointer",
                      padding: 0,
                      fontFamily: FONT_UI,
                      letterSpacing: 0,
                    }}
                  >
                    clear
                  </button>
                )}
              </div>
              {Object.keys(pinned).length === 0 ? (
                <div
                  style={{
                    fontSize: 11,
                    color: inkDim,
                    fontStyle: "italic",
                    lineHeight: 1.5,
                  }}
                >
                  pin any card to a board — Inspiration, Method or Reference
                </div>
              ) : (
                BOARDS.map((b) => {
                  const list = pins.filter((p) => pinMap[p.id] === b.id);
                  if (list.length === 0) return null;
                  return (
                    <div key={b.id} style={{ marginBottom: 10 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontFamily: FONT_DISPLAY,
                          fontSize: 9,
                          letterSpacing: 1.5,
                          color: b.tint,
                          textTransform: "uppercase",
                          fontWeight: 500,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: b.tint,
                          }}
                        />
                        {b.label} · {list.length}
                      </div>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {list.map((p) => (
                      <li
                        key={p.id}
                        style={{
                          padding: "4px 0",
                          borderBottom: `1px solid ${hairline}`,
                          fontSize: 11,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 6,
                          }}
                        >
                          <span>
                            <span style={{ color: p.accent, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", fontWeight: 500 }}>
                              {p.artifactLabel}
                            </span>
                            <div style={{ color: ink, fontWeight: 500, lineHeight: 1.3 }}>
                              {p.title.length > 36 ? p.title.slice(0, 36) + "…" : p.title}
                            </div>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPinMap((m) => {
                                const next = { ...m };
                                delete next[p.id];
                                return next;
                              });
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: IOS_PINK,
                              fontSize: 14,
                              cursor: "pointer",
                              padding: 0,
                              lineHeight: 1,
                            }}
                            title="Remove pin"
                          >
                            ×
                          </button>
                        </div>
                      </li>
                    ))}
                      </ul>
                    </div>
                  );
                })
              )}
            </div>

            {/* Tips card */}
            <div
              style={{
                background: card,
                border: `1px solid ${hairline}`,
                borderRadius: 10,
                padding: 10,
                fontSize: 11,
                color: inkDim,
                lineHeight: 1.5,
              }}
            >
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: inkDim,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Tips
              </div>
              <div>· tap card → flip to back</div>
              <div>· 📌 button → pin to sidebar</div>
              <div>· switch to 🃏 Deck → swipe gestures</div>
              <div>· filter chips above board</div>
              <div>· / → focus search</div>
            </div>
          </aside>
        )}
      </div>

      {/* ── BOTTOM STATS BAR ──────────────────────────── */}
      <StatsBar
        pins={pins}
        flipped={flipped}
        pinned={pinned}
        boards={BOARDS}
        pinMap={pinMap}
        bg={bg}
        ink={ink}
        inkDim={inkDim}
        hairline={hairline}
        theme={theme}
      />

      {/* ── BOARD PICKER POPOVER ──────────────────────── */}
      {pickerFor && (
        <BoardPicker
          x={pickerFor.x}
          y={pickerFor.y}
          boards={BOARDS}
          card={card}
          hairline={hairline}
          ink={ink}
          inkDim={inkDim}
          onPick={commitPin}
          onClose={() => setPickerFor(null)}
        />
      )}

      {/* ── LIGHTBOX ──────────────────────────────────── */}
      {lightboxPin && (
        <Lightbox
          pin={lightboxPin}
          card={card}
          ink={ink}
          inkDim={inkDim}
          hairline={hairline}
          onClose={() => setLightboxId(null)}
        />
      )}

      {/* ── TOAST ─────────────────────────────────────── */}
      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            bottom: "calc(var(--eye-lid-bottom, 0px) + 16px)",
            transform: "translateX(-50%)",
            zIndex: 100,
            padding: "8px 16px",
            background: "rgba(20,20,30,0.92)",
            color: "#fff",
            borderRadius: 999,
            fontFamily: FONT_UI,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: 0.2,
            boxShadow: "0 8px 22px rgba(0,0,0,0.4)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            animation: "kiruk-2013-toast-in 220ms cubic-bezier(0.2, 0.9, 0.3, 1)",
            pointerEvents: "none",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Masonry board ────────────────────────────────────────────────────

function Masonry({
  pins,
  flipped,
  pinned,
  card,
  ink,
  inkDim,
  hairline,
  onFlip,
  onPin,
  onExpand,
  isMobile,
}: {
  pins: Pin[];
  flipped: Record<string, boolean>;
  pinned: Record<string, boolean>;
  card: string;
  ink: string;
  inkDim: string;
  hairline: string;
  onFlip: (id: string) => void;
  onPin: (id: string, anchor: { x: number; y: number }) => void;
  onExpand: (id: string) => void;
  isMobile: boolean;
}) {
  if (pins.length === 0) {
    return (
      <div
        style={{
          padding: "40px 20px",
          textAlign: "center",
          background: card,
          border: `1px solid ${hairline}`,
          borderRadius: 12,
          color: inkDim,
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 300, marginBottom: 4 }}>
          No pins match
        </div>
        <div style={{ fontSize: 12 }}>clear the filter or search to bring them back</div>
      </div>
    );
  }
  const cols = isMobile ? 2 : 3;
  // Distribute pins across columns balancing weighted height (size hint)
  const sizeWeight = { sm: 1, md: 1.4, lg: 1.8, xl: 2.4 } as const;
  const columns: Pin[][] = Array.from({ length: cols }, () => []);
  const colHeights = Array(cols).fill(0);
  pins.forEach((p) => {
    const shortest = colHeights.indexOf(Math.min(...colHeights));
    columns[shortest].push(p);
    colHeights[shortest] += sizeWeight[p.size];
  });
  const heightMap = { sm: 180, md: 240, lg: 300, xl: 380 } as const;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 12,
        alignItems: "start",
      }}
    >
      {columns.map((col, ci) => (
        <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {col.map((p) => (
            <PinCard
              key={p.id}
              pin={p}
              height={heightMap[p.size]}
              flipped={!!flipped[p.id]}
              pinned={!!pinned[p.id]}
              card={card}
              ink={ink}
              inkDim={inkDim}
              hairline={hairline}
              onFlip={() => onFlip(p.id)}
              onPin={(anchor) => onPin(p.id, anchor)}
              onExpand={() => onExpand(p.id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function PinCard({
  pin,
  height,
  flipped,
  pinned,
  card,
  ink,
  inkDim,
  hairline,
  onFlip,
  onPin,
  onExpand,
}: {
  pin: Pin;
  height: number;
  flipped: boolean;
  pinned: boolean;
  card: string;
  ink: string;
  inkDim: string;
  hairline: string;
  onFlip: () => void;
  onPin: (anchor: { x: number; y: number }) => void;
  onExpand: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        height,
        perspective: 1200,
        animation: "kiruk-2013-card-in 320ms ease-out",
        transform: hover ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 220ms cubic-bezier(0.2,0.9,0.3,1)",
        filter: hover ? "drop-shadow(0 14px 24px rgba(0,0,0,0.18))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.08))",
      }}
    >
      <div
        className={`kiruk-2013-flip ${flipped ? "flipped" : ""}`}
        onClick={onFlip}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        style={{ cursor: "pointer" }}
      >
        {/* Front face */}
        <div
          className="kiruk-2013-face"
          style={{
            background: card,
            color: ink,
            border: `1px solid ${hairline}`,
            borderRadius: 12,
            overflow: "hidden",
            position: "absolute",
            inset: 0,
          }}
        >
          {/* Accent rail */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 4,
              bottom: 0,
              background: pin.accent,
            }}
          />
          {/* Front content */}
          <div style={{ height: "100%", paddingLeft: 4, position: "relative" }}>
            {pin.front()}
            {/* Top-right: artifact label */}
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 10,
                fontFamily: FONT_DISPLAY,
                fontSize: 8,
                letterSpacing: 1.5,
                color: pin.accent,
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              {pin.artifactLabel}
            </div>
            {/* Bottom action row */}
            <div
              style={{
                position: "absolute",
                bottom: 6,
                right: 8,
                display: "flex",
                gap: 4,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <ActionBtn
                onClick={(e) => onPin({ x: e.clientX, y: e.clientY })}
                color={pinned ? IOS_PINK : inkDim}
                title={pinned ? "On board" : "Pin to board"}
              >
                {pinned ? "📌" : "📍"}
              </ActionBtn>
              <ActionBtn onClick={() => onExpand()} color={inkDim} title="Expand">
                ⤢
              </ActionBtn>
              <ActionBtn onClick={() => onFlip()} color={inkDim} title="Flip">
                ↻
              </ActionBtn>
            </div>
          </div>
        </div>

        {/* Back face */}
        <div
          className="kiruk-2013-face kiruk-2013-back-face"
          style={{
            background: card,
            color: ink,
            border: `1px solid ${pin.accent}55`,
            borderRadius: 12,
            overflow: "hidden",
            position: "absolute",
            inset: 0,
          }}
        >
          <div style={{ height: "100%", position: "relative" }}>
            {pin.back()}
            <div
              style={{
                position: "absolute",
                bottom: 6,
                right: 8,
                display: "flex",
                gap: 4,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <ActionBtn
                onClick={(e) => onPin({ x: e.clientX, y: e.clientY })}
                color={pinned ? IOS_PINK : inkDim}
                title={pinned ? "On board" : "Pin to board"}
              >
                {pinned ? "📌" : "📍"}
              </ActionBtn>
              <ActionBtn onClick={() => onExpand()} color={inkDim} title="Expand">
                ⤢
              </ActionBtn>
              <ActionBtn onClick={() => onFlip()} color={inkDim} title="Flip back">
                ↺
              </ActionBtn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Deck view ────────────────────────────────────────────────────────

function DeckView({
  pins,
  pin,
  idx,
  total,
  drag,
  card,
  ink,
  inkDim,
  hairline,
  isPinned,
  onBegin,
  onMove,
  onEnd,
  onLeft,
  onRight,
  onReset,
}: {
  pins: Pin[];
  pin: Pin | null;
  idx: number;
  total: number;
  drag: { x: number; y: number };
  card: string;
  ink: string;
  inkDim: string;
  hairline: string;
  isPinned: boolean;
  onBegin: (e: React.PointerEvent) => void;
  onMove: (e: React.PointerEvent) => void;
  onEnd: (e: React.PointerEvent) => void;
  onLeft: () => void;
  onRight: () => void;
  onReset: () => void;
}) {
  const rot = drag.x * 0.06;
  const liked = drag.x > 60;
  const skipped = drag.x < -60;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        padding: "10px 0 20px",
      }}
    >
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 4 }}>
        {pins.map((p, i) => (
          <span
            key={p.id}
            style={{
              width: i === idx ? 18 : 6,
              height: 6,
              borderRadius: 3,
              background: i === idx ? p.accent : hairline,
              transition: "width 240ms",
            }}
          />
        ))}
      </div>

      {pin ? (
        <div
          style={{
            position: "relative",
            width: "min(380px, 100%)",
            height: 420,
            touchAction: "none",
          }}
        >
          {/* Stack behind cards */}
          {[1, 2].map((d) => {
            const np = pins[idx + d];
            if (!np) return null;
            return (
              <div
                key={d}
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background: card,
                  border: `1px solid ${hairline}`,
                  borderRadius: 16,
                  transform: `translateY(${d * 6}px) scale(${1 - d * 0.04})`,
                  zIndex: 1,
                  opacity: 0.6,
                }}
              />
            );
          })}
          {/* Active card */}
          <div
            onPointerDown={onBegin}
            onPointerMove={onMove}
            onPointerUp={onEnd}
            onPointerCancel={onEnd}
            style={{
              position: "absolute",
              inset: 0,
              background: card,
              color: ink,
              border: `2px solid ${pin.accent}`,
              borderRadius: 16,
              cursor: "grab",
              boxShadow: `0 14px 30px rgba(0,0,0,0.18)`,
              zIndex: 3,
              transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rot}deg)`,
              transition: drag.x === 0 ? "transform 240ms cubic-bezier(0.2,0.9,0.3,1.1)" : "none",
              overflow: "hidden",
              userSelect: "none",
            }}
          >
            {/* Liked / skipped overlay */}
            {liked && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  padding: "2px 10px",
                  fontFamily: FONT_DISPLAY,
                  fontSize: 14,
                  fontWeight: 500,
                  color: IOS_PINK,
                  border: `2px solid ${IOS_PINK}`,
                  borderRadius: 4,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  zIndex: 5,
                  transform: "rotate(-12deg)",
                }}
              >
                📌 PIN
              </span>
            )}
            {skipped && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                  padding: "2px 10px",
                  fontFamily: FONT_DISPLAY,
                  fontSize: 14,
                  fontWeight: 500,
                  color: inkDim,
                  border: `2px solid ${inkDim}`,
                  borderRadius: 4,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  zIndex: 5,
                  transform: "rotate(12deg)",
                }}
              >
                ✕ SKIP
              </span>
            )}
            {/* Accent rail */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 6,
                bottom: 0,
                background: pin.accent,
              }}
            />
            <div style={{ height: "100%", paddingLeft: 6, position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 12,
                  fontFamily: FONT_DISPLAY,
                  fontSize: 9,
                  letterSpacing: 2,
                  color: pin.accent,
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}
              >
                {pin.artifactLabel}{isPinned ? " · saved" : ""}
              </div>
              {pin.front()}
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            width: "min(380px, 100%)",
            padding: "40px 20px",
            background: card,
            color: ink,
            border: `1px solid ${hairline}`,
            borderRadius: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 300, marginBottom: 4 }}>
            End of deck
          </div>
          <div style={{ fontSize: 12, color: inkDim, marginBottom: 14 }}>
            You went through every pin. Reset to start over.
          </div>
          <button
            type="button"
            onClick={onReset}
            style={{
              padding: "8px 18px",
              fontFamily: FONT_DISPLAY,
              fontSize: 13,
              fontWeight: 500,
              color: "#fff",
              background: IOS_BLUE,
              border: "none",
              borderRadius: 999,
              cursor: "pointer",
              letterSpacing: 0.3,
            }}
          >
            ↻ Reset deck
          </button>
        </div>
      )}

      {/* Action buttons */}
      {pin && (
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <CircleBtn onClick={onLeft} color={inkDim} large title="Skip (←)">
            ✕
          </CircleBtn>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              color: inkDim,
              letterSpacing: 0.5,
            }}
          >
            {idx + 1} / {total}
          </div>
          <CircleBtn onClick={onRight} color={IOS_PINK} large title="Pin (→)">
            📌
          </CircleBtn>
        </div>
      )}

      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: inkDim,
          letterSpacing: 0.5,
          textAlign: "center",
          marginTop: 4,
        }}
      >
        swipe card · or press ← skip · → pin
      </div>
    </div>
  );
}

// ── Small components ─────────────────────────────────────────────────

function Chip({
  label,
  active,
  tint,
  onClick,
}: {
  label: string;
  active: boolean;
  tint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "2px 10px",
        fontFamily: FONT_UI,
        fontSize: 11,
        fontWeight: 500,
        color: active ? "#fff" : tint,
        background: active ? tint : "transparent",
        border: `1px solid ${tint}`,
        borderRadius: 999,
        cursor: "pointer",
        letterSpacing: 0.2,
        transition: "background 180ms, color 180ms",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function SegBtn({
  active,
  onClick,
  children,
  ink,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  ink: string;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "3px 12px",
        fontFamily: FONT_UI,
        fontSize: 11,
        fontWeight: 500,
        color: active ? "#fff" : ink,
        background: active ? accent : "transparent",
        border: "none",
        cursor: "pointer",
        letterSpacing: 0.3,
        transition: "background 180ms",
      }}
    >
      {children}
    </button>
  );
}

function ActionBtn({
  onClick,
  color,
  title,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      title={title}
      style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: `1px solid ${color}33`,
        color,
        cursor: "pointer",
        fontSize: 11,
        lineHeight: 1,
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}

function CircleBtn({
  onClick,
  color,
  large,
  title,
  children,
}: {
  onClick: () => void;
  color: string;
  large?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  const sz = large ? 50 : 36;
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        width: sz,
        height: sz,
        borderRadius: "50%",
        background: "transparent",
        border: `2px solid ${color}`,
        color,
        cursor: "pointer",
        fontSize: large ? 22 : 16,
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}

// ── FeaturedStrip — auto-rotating pin spotlight ──────────────────────

function FeaturedStrip({
  pin,
  progress,
  compact,
  card,
  ink,
  inkDim,
  hairline,
  saved,
  onPin,
  onExpand,
  onSkip,
}: {
  pin: Pin;
  progress: number;
  /** Phone width: the actions drop under the title instead of squeezing it. */
  compact: boolean;
  card: string;
  ink: string;
  inkDim: string;
  hairline: string;
  saved: boolean;
  onPin: (anchor: { x: number; y: number }) => void;
  onExpand: () => void;
  onSkip: () => void;
}) {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: compact ? "auto minmax(0, 1fr)" : "auto 1fr auto",
        gap: 12,
        alignItems: "center",
        padding: "10px 14px",
        background: card,
        color: ink,
        border: `1px solid ${hairline}`,
        borderLeft: `3px solid ${pin.accent}`,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Progress ring */}
      <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
        <svg viewBox="0 0 44 44" style={{ width: 44, height: 44, transform: "rotate(-90deg)" }}>
          <circle cx={22} cy={22} r={19} fill="none" stroke={hairline} strokeWidth={3} />
          <circle
            cx={22}
            cy={22}
            r={19}
            fill="none"
            stroke={pin.accent}
            strokeWidth={3}
            strokeDasharray={2 * Math.PI * 19}
            strokeDashoffset={2 * Math.PI * 19 * (1 - progress / 100)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 100ms linear" }}
          />
        </svg>
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          }}
        >
          ⭐
        </span>
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 9,
            letterSpacing: 1.5,
            color: pin.accent,
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Pin of the hour · {pin.artifactLabel}
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 17,
            fontWeight: 300,
            letterSpacing: -0.3,
            color: ink,
            lineHeight: 1.2,
            marginTop: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {pin.title}
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          {pin.tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: 9,
                color: inkDim,
                background: hairline,
                padding: "1px 6px",
                borderRadius: 999,
                letterSpacing: 0.3,
              }}
            >
              #{t}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          ...(compact && { gridColumn: "1 / -1", justifyContent: "flex-end" }),
        }}
      >
        <FeatBtn onClick={onSkip} hairline={hairline} ink={ink} title="Skip">
          ↷ skip
        </FeatBtn>
        <FeatBtn onClick={onExpand} hairline={hairline} ink={ink} title="Expand">
          ⤢ open
        </FeatBtn>
        <FeatBtn
          onClick={(e) => onPin({ x: e.clientX, y: e.clientY })}
          hairline={hairline}
          ink={saved ? "#fff" : ink}
          bg={saved ? IOS_PINK : undefined}
          title="Pin to board"
        >
          {saved ? "📌 saved" : "📍 pin"}
        </FeatBtn>
      </div>
    </section>
  );
}

function FeatBtn({
  children,
  onClick,
  hairline,
  ink,
  bg,
  title,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  hairline: string;
  ink: string;
  bg?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        padding: "4px 10px",
        fontFamily: FONT_UI,
        fontSize: 11,
        fontWeight: 500,
        color: ink,
        background: bg ?? "transparent",
        border: `1px solid ${bg ?? hairline}`,
        borderRadius: 999,
        cursor: "pointer",
        letterSpacing: 0.3,
        transition: "all 180ms",
      }}
    >
      {children}
    </button>
  );
}

// ── StatsBar — live engagement readouts ──────────────────────────────

function StatsBar({
  pins,
  flipped,
  pinned,
  boards,
  pinMap,
  bg,
  ink,
  inkDim,
  hairline,
  theme,
}: {
  pins: Pin[];
  flipped: Record<string, boolean>;
  pinned: Record<string, boolean>;
  boards: Array<{ id: string; label: string; tint: string }>;
  pinMap: Record<string, string>;
  bg: string;
  ink: string;
  inkDim: string;
  hairline: string;
  theme: "light" | "dark";
}) {
  const total = pins.length;
  const flippedN = Object.values(flipped).filter(Boolean).length;
  const pinnedN = Object.keys(pinned).length;
  const completion = Math.round(((flippedN + pinnedN) / (total * 2)) * 100);
  return (
    <div
      style={{
        position: "relative",
        zIndex: 18,
        background: theme === "light" ? "rgba(242,242,247,0.92)" : "rgba(10,10,15,0.92)",
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
        borderTop: `1px solid ${hairline}`,
        padding: "8px 18px",
        display: "flex",
        flexWrap: "wrap",
        gap: 14,
        alignItems: "center",
        fontFamily: FONT_UI,
        fontSize: 11,
        color: ink,
        marginTop: 18,
      }}
    >
      <Stat label="pins" v={total} tint={IOS_BLUE} ink={ink} inkDim={inkDim} />
      <Stat label="flipped" v={flippedN} tint={IOS_PURPLE} ink={ink} inkDim={inkDim} />
      <Stat label="saved" v={pinnedN} tint={IOS_PINK} ink={ink} inkDim={inkDim} />
      {boards.map((b) => {
        const n = Object.values(pinMap).filter((bid) => bid === b.id).length;
        return (
          <Stat
            key={b.id}
            label={b.label.toLowerCase()}
            v={n}
            tint={b.tint}
            ink={ink}
            inkDim={inkDim}
          />
        );
      })}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
          minWidth: 160,
        }}
      >
        <span style={{ fontSize: 10, color: inkDim, letterSpacing: 0.5 }}>
          completion
        </span>
        <div
          style={{
            flex: 1,
            height: 4,
            background: hairline,
            borderRadius: 2,
            overflow: "hidden",
            minWidth: 80,
          }}
        >
          <div
            style={{
              width: `${completion}%`,
              height: "100%",
              background:
                `linear-gradient(90deg, ${IOS_BLUE} 0%, ${IOS_PURPLE} 50%, ${IOS_PINK} 100%)`,
              transition: "width 320ms",
            }}
          />
        </div>
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: ink, fontWeight: 500, minWidth: 30, textAlign: "right" }}>
          {completion}%
        </span>
      </div>
    </div>
  );
}

function Stat({
  label,
  v,
  tint,
  ink,
  inkDim,
}: {
  label: string;
  v: number;
  tint: string;
  ink: string;
  inkDim: string;
}) {
  return (
    <span style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 16,
          fontWeight: 200,
          color: tint,
          letterSpacing: -0.5,
        }}
      >
        {v}
      </span>
      <span style={{ fontSize: 10, color: inkDim, letterSpacing: 0.3, textTransform: "uppercase" }}>
        {label}
      </span>
    </span>
  );
}

// ── BoardPicker — popover for board selection ────────────────────────

function BoardPicker({
  x,
  y,
  boards,
  card,
  hairline,
  ink,
  inkDim,
  onPick,
  onClose,
}: {
  x: number;
  y: number;
  boards: Array<{ id: "inspiration" | "method" | "reference"; label: string; tint: string }>;
  card: string;
  hairline: string;
  ink: string;
  inkDim: string;
  onPick: (b: "inspiration" | "method" | "reference") => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onAny = (e: MouseEvent) => {
      const tgt = e.target as HTMLElement;
      if (!tgt.closest("[data-kiruk-2013-picker]")) onClose();
    };
    window.addEventListener("click", onAny);
    return () => window.removeEventListener("click", onAny);
  }, [onClose]);

  // Clamp position
  const w = 180;
  const h = 140;
  const left = Math.max(8, Math.min(window.innerWidth - w - 8, x - w / 2));
  const top = Math.max(8, Math.min(window.innerHeight - h - 8, y - h - 14));

  return (
    <div
      data-kiruk-2013-picker
      style={{
        position: "fixed",
        left,
        top,
        zIndex: 90,
        width: w,
        background: card,
        border: `1px solid ${hairline}`,
        borderRadius: 12,
        boxShadow: "0 12px 28px rgba(0,0,0,0.25)",
        overflow: "hidden",
        padding: 4,
      }}
    >
      <div
        style={{
          padding: "4px 8px 6px",
          fontFamily: FONT_DISPLAY,
          fontSize: 9,
          letterSpacing: 1.5,
          color: inkDim,
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        Save to board
      </div>
      {boards.map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => onPick(b.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "6px 8px",
            background: "transparent",
            border: "none",
            color: ink,
            fontFamily: FONT_UI,
            fontSize: 13,
            cursor: "pointer",
            borderRadius: 8,
            textAlign: "left",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = `${b.tint}1a`)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span
            aria-hidden
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: b.tint,
              flexShrink: 0,
            }}
          />
          {b.label}
        </button>
      ))}
    </div>
  );
}

// ── Lightbox — full-screen card detail ───────────────────────────────

function Lightbox({
  pin,
  card,
  ink,
  inkDim,
  hairline,
  onClose,
}: {
  pin: Pin;
  card: string;
  ink: string;
  inkDim: string;
  hairline: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        background: "rgba(8,8,12,0.72)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "kiruk-2013-card-in 220ms ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: card,
          color: ink,
          borderRadius: 16,
          width: "min(900px, 100%)",
          maxHeight: "90vh",
          overflow: "hidden",
          border: `1px solid ${hairline}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${hairline}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: pin.accent,
              }}
            />
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 10,
                letterSpacing: 1.5,
                color: pin.accent,
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              {pin.artifactLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close (Esc)"
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "transparent",
              color: inkDim,
              border: `1px solid ${hairline}`,
              fontFamily: FONT_DISPLAY,
              fontSize: 13,
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Two-pane body */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: window.innerWidth < 700 ? "1fr" : "1fr 1fr",
            maxHeight: "calc(90vh - 50px)",
          }}
        >
          <div
            style={{
              borderRight: window.innerWidth < 700 ? "none" : `1px solid ${hairline}`,
              borderBottom: window.innerWidth < 700 ? `1px solid ${hairline}` : "none",
              minHeight: 220,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 14,
                fontFamily: FONT_DISPLAY,
                fontSize: 9,
                letterSpacing: 1.5,
                color: inkDim,
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              Front
            </div>
            <div style={{ height: "100%", paddingTop: 20 }}>{pin.front()}</div>
          </div>
          <div style={{ minHeight: 220, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 14,
                fontFamily: FONT_DISPLAY,
                fontSize: 9,
                letterSpacing: 1.5,
                color: inkDim,
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              Back · Data
            </div>
            <div style={{ height: "100%", paddingTop: 20 }}>{pin.back()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PinboardHomePage;
