"use client";

/**
 * XeroxBitmapHomePage — 1981 archetype home rendered as a Xerox Star
 * desktop, with era-1981 voice and bitmap-era interactions:
 *   - boot trace on mount
 *   - window controls: `_` minimises a window to its title bar; `✕`
 *     toggles a "closed" state with a desktop launcher to re-open
 *   - bevel button press inverts shadow (real mousedown feedback)
 *   - bottom status bar tracks free mem, open files and caret position
 */

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pixelify_Sans } from "next/font/google";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import {
  HERO,
  PERSONA,
  EMPATHY_MAP,
  buildTimeline,
  IMPACT_METRICS,
  CARD_SORTING,
  USABILITY_TEST,
} from "@/data/era-page-content";

const pixelify = Pixelify_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pixelify",
});

// ── Palette ─────────────────────────────────────────────────────────────
const GRAY = "#c0c0c0";
const GRAY_LIGHT = "#dcdcdc";
const HILITE = "#ffffff";
const SHADOW = "#808080";
const BLACK = "#000000";
const TITLE_BG = "#000080";
const TITLE_TEXT = "#ffffff";
const ACCENT = "#0000aa";
const SELECTED = "#e6e6e6";
const PINK = "#aa0000";

const FONT_STACK =
  "'Pixelify Sans', 'IBM Plex Sans', 'Helvetica', sans-serif";
const FONT_MONO = "'IBM Plex Mono', 'Courier New', monospace";

// ── Era-1981 voice: terse, technical, mainframe-printout ────────────────
const ERA_1981 = {
  hero: {
    preTitle: "FILE: KIRUK · DESIGN ENGINEER ON RECORD",
    framing:
      "FIELD NOTES ON ARUN — DESIGN ENGINEER AT HP PRINT AI.  EACH RECORD BELOW IS ONE ARTIFACT A RESEARCHER WOULD PRINT WHILE STUDYING HOW HE WORKS: PERSONA, EMPATHY, JOURNEY, IMPACT, CARD-SORT, USABILITY.",
  },
  ctas: {
    primary: "OPEN /WORK ▸",
    secondary: "OPEN /CONTACT",
  },
  why: {
    hook: "DESIGN-LED THINKING. ENGINEERING-GRADE EXECUTION.",
    pain: "WHEN STRATEGY, DESIGN AND CODE RUN ON SEPARATE PROCESSES — SPEED AND INTENT DEGRADE.",
    bridge:
      "TRANSLATES VISION INTO PRODUCTION INTERFACES, DESIGN SYSTEMS, AND MEASURABLE OUTPUT.",
    tagline: "ONE WORKFLOW. ONE OWNER. CLEAN LAUNCHES.",
  },
  persona: {
    quote: PERSONA.quote.toUpperCase(),
    backgroundIntro: "RECORD: BIO STREAM, CHRONOLOGICAL.",
  },
  empathy: {
    saysQuote: `"${EMPATHY_MAP.says.quote.toUpperCase()}"`,
  },
  metrics: {
    headerNote: "OUTPUT: AGGREGATED METRICS · LAST PRINT CYCLE",
  },
  cards: {
    headerNote: "TAXONOMY: PROJECT INDEX · 4 CARDS LOADED",
  },
  usability: {
    taskTitle: USABILITY_TEST.task.toUpperCase(),
    taskBody: USABILITY_TEST.taskBody.toUpperCase(),
    metrics: USABILITY_TEST.successMetrics.map((m) => m.toUpperCase()),
  },
};

// Era-toned phase + position labels for the timeline
const TIMELINE_TONE: Record<string, { phase: string; position: string }> = {
  "2018": { phase: "ORIGIN", position: "FREELANCE OPERATOR" },
  "2019": { phase: "TRAINING", position: "ENGINEERING + CAMPUS DESIGN LEAD" },
  "2022": { phase: "INTERFACE", position: "INTERACTION DESIGN INTERN" },
  "2023": { phase: "DEPLOY", position: "R&D INTERN → SDE-1" },
  "2025": { phase: "ACTIVE PROCESS", position: "DESIGN ENGINEER (LIVE)" },
};

const BOOT_LINES = [
  "BOOTING XEROX STAR / KIRUK.IN",
  "MOUNTING /DEV/HD0 ............... OK",
  "LOADING FONT  : PIXELIFY-SANS .... OK",
  "ATTACHING WINDOWS ............... 7 FILES",
  "READY",
];

export function XeroxBitmapHomePage() {
  const { setLayoutMode } = useLayoutMode();
  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);

  // ── Boot sequence ─────────────────────────────────────────────────────
  const [bootIdx, setBootIdx] = useState(0);
  useEffect(() => {
    let i = 0;
    const tick = () => {
      i += 1;
      setBootIdx(i);
      if (i < BOOT_LINES.length) {
        timer = window.setTimeout(tick, 110 + Math.random() * 60);
      }
    };
    let timer = window.setTimeout(tick, 80);
    return () => clearTimeout(timer);
  }, []);
  const bootDone = bootIdx >= BOOT_LINES.length;

  // ── Window state (collapsed / closed) ─────────────────────────────────
  const initialWindows: WindowKey[] = [
    "hero",
    "why",
    "persona",
    "empathy",
    "journey",
    "impact",
    "cards",
    "usability",
  ];
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  const toggleCollapse = (k: WindowKey) =>
    setCollapsed((s) => ({ ...s, [k]: !s[k] }));
  const closeWindow = (k: WindowKey) =>
    setClosed((s) => ({ ...s, [k]: true }));
  const reopenWindow = (k: WindowKey) =>
    setClosed((s) => ({ ...s, [k]: false }));

  // ── Caret tracking for status bar ─────────────────────────────────────
  const [caret, setCaret] = useState({ row: 1, col: 1 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setCaret({
        row: Math.max(1, Math.floor(e.clientY / 14)),
        col: Math.max(1, Math.floor(e.clientX / 7)),
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const closedCount = Object.values(closed).filter(Boolean).length;
  const fileCount = initialWindows.length - closedCount;

  const nodes = useMemo(buildTimeline, []);
  const now = new Date();
  const stamp = now.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <main
      id="xerox-home"
      className={pixelify.className}
      style={{
        backgroundColor: GRAY,
        color: BLACK,
        fontFamily: FONT_STACK,
        minHeight: "100vh",
        paddingTop: "calc(var(--simple-game-nav-bottom, 56px) + 24px)",
        paddingBottom: 80,
        backgroundImage:
          "repeating-radial-gradient(circle at 0 0, transparent 0, transparent 5px, rgba(0,0,0,0.08) 5px, rgba(0,0,0,0.08) 6px)",
        backgroundSize: "12px 12px",
      }}
    >
      <div className="relative max-w-4xl mx-auto px-3 sm:px-6 flex flex-col gap-5">
        <DesktopBar stamp={stamp} />

        {/* ── BOOT TRACE WINDOW (auto-collapses after boot completes) ── */}
        <BootTraceWindow lines={BOOT_LINES.slice(0, bootIdx)} done={bootDone} />

        {/* Re-launcher for closed windows */}
        {closedCount > 0 && (
          <ReopenDock
            closed={closed}
            initial={initialWindows}
            onReopen={reopenWindow}
          />
        )}

        {/* ── HERO — FILE TITLE PAGE (no identity here) ────── */}
        <WindowFrame
          k="hero"
          title="KIRUK-DE.DOC"
          subtitle="design engineer · file index"
          icon="◰"
          collapsed={collapsed.hero}
          closed={closed.hero}
          onCollapse={toggleCollapse}
          onClose={closeWindow}
        >
          <div className="px-4 py-4" style={{ backgroundColor: HILITE }}>
            <div
              style={{
                fontSize: 11,
                color: SHADOW,
                fontFamily: FONT_MONO,
                marginBottom: 6,
                letterSpacing: 1,
              }}
            >
              {ERA_1981.hero.preTitle}
            </div>

            {/* Document title — brands Arun the design engineer, not "study" */}
            <div
              style={{
                fontSize: "clamp(26px, 4.4vw, 40px)",
                lineHeight: 1.0,
                color: BLACK,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              KIRUK / DESIGN ENGINEER
            </div>
            <div
              style={{
                fontSize: "clamp(14px, 1.7vw, 18px)",
                color: TITLE_BG,
                fontFamily: FONT_MONO,
                marginTop: 4,
                letterSpacing: 1,
              }}
            >
              ▸ FIELD NOTES ON ARUN AT THE DESIGN ↔ ENGINEERING BRIDGE
            </div>

            <DitherRule />

            {/* File metadata table */}
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 12,
                color: BLACK,
                lineHeight: 1.7,
              }}
            >
              <FileRow k="FILE NO."     v="KIRUK-DE / 0001" />
              <FileRow k="OPENED"       v={stamp.toUpperCase()} />
              <FileRow k="SUBJECT REF"  v="ARUN-KS · SEE FILE PERSONA.DAT" />
              <FileRow k="FORMAT"       v="BEVEL-WINDOW STREAM · 7 RECORDS" />
              <FileRow k="STATUS"       v={bootDone ? "READY · OPEN FOR REVIEW" : "LOADING…"} />
              <FileRow k="CLASSIFICATION" v="PUBLIC" />
            </div>

            <DitherRule />

            <p
              style={{
                fontSize: 13,
                color: BLACK,
                lineHeight: 1.55,
                fontFamily: FONT_MONO,
                letterSpacing: 0.3,
              }}
            >
              {ERA_1981.hero.framing}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <BevelButton href="/portfolio" primary>
                {ERA_1981.ctas.primary}
              </BevelButton>
              <BevelButton href="/contact">{ERA_1981.ctas.secondary}</BevelButton>
            </div>
          </div>
        </WindowFrame>

        {/* ── 01 · WHY KIRUK ─────────────────────────────── */}
        <WindowFrame
          k="why"
          title="WHY-KIRUK.TXT"
          subtitle="hook · pain · bridge"
          icon="i"
          collapsed={collapsed.why}
          closed={closed.why}
          onCollapse={toggleCollapse}
          onClose={closeWindow}
        >
          <div
            className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-3"
            style={{ backgroundColor: HILITE }}
          >
            <KeyValue label="HOOK">{ERA_1981.why.hook}</KeyValue>
            <KeyValue label="PAIN" tint={PINK}>{ERA_1981.why.pain}</KeyValue>
            <KeyValue label="BRIDGE" tint={TITLE_BG}>{ERA_1981.why.bridge}</KeyValue>
            <KeyValue label="CLOSE" mute>“{ERA_1981.why.tagline}”</KeyValue>
          </div>
        </WindowFrame>

        {/* ── 02 · PERSONA — PERSONNEL RECORD CARD ─────────── */}
        <WindowFrame
          k="persona"
          title="PERSONA.DAT"
          subtitle="user profile · subject record"
          icon="☺"
          collapsed={collapsed.persona}
          closed={closed.persona}
          onCollapse={toggleCollapse}
          onClose={closeWindow}
        >
          <div className="px-4 py-3" style={{ backgroundColor: HILITE }}>
            {/* Subject ID strip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 8px",
                marginBottom: 10,
                backgroundColor: TITLE_BG,
                color: TITLE_TEXT,
                fontFamily: FONT_MONO,
                fontSize: 11,
                letterSpacing: 1,
                border: `1px solid ${BLACK}`,
              }}
            >
              <span>SUBJECT NO. 0001 — ARUN-KS</span>
              <span>REC TYPE: PERSONNEL CARD</span>
              <span>UPD: {stamp.split(",")[0].toUpperCase()}</span>
            </div>

            {/* Identity row: ASCII portrait + attribute table */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "min-content 1fr",
                gap: 14,
                marginBottom: 14,
                alignItems: "start",
              }}
            >
              <AsciiPortrait />

              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 12,
                  color: BLACK,
                  lineHeight: 1.7,
                  border: `1px solid ${BLACK}`,
                  backgroundColor: GRAY_LIGHT,
                  padding: "6px 10px",
                }}
              >
                <FileRow k="NAME"        v={PERSONA.identity.name.toUpperCase()} />
                <FileRow k="ROLE"        v={PERSONA.identity.role.toUpperCase()} />
                <FileRow k="EMPLOYER"    v={PERSONA.identity.org.toUpperCase()} />
                <FileRow k="LOCATION"    v={PERSONA.identity.location.toUpperCase()} />
                <FileRow k="ARCHETYPE"   v="DESIGNER ↔ ENGINEER (BRIDGE)" />
                <FileRow k="AVAILABILITY" v="OPEN · SELECTIVE FREELANCE" />
                <FileRow k="DISCIPLINES" v="UX · DESIGN SYSTEMS · FE ENG · AI UX" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SunkenPanel header="GOALS" subtitle="what i strive for">
                <BulletList
                  items={[
                    "SHIP USER-CENTRED PRODUCTS, FAST CYCLES",
                    "BRIDGE DESIGN ↔ ENGINEERING PROCESSES",
                    "BUILD SCALABLE DESIGN SYSTEMS",
                  ]}
                  marker="►"
                />
              </SunkenPanel>
              <SunkenPanel header="FRUSTRATIONS" subtitle="what i fight" tint={PINK}>
                <BulletList
                  items={[
                    "SILOED DESIGN ↔ DEV TEAMS",
                    "SLOW DESIGN → PRODUCTION HANDOFFS",
                    "CONTEXT LOST IN TRANSLATION",
                  ]}
                  marker="✕"
                  tint={PINK}
                />
              </SunkenPanel>
            </div>

            <DitherRule />
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: TITLE_BG,
                marginBottom: 4,
                letterSpacing: 1,
              }}
            >
              ❝ QUOTE ON FILE
            </div>
            <div
              style={{
                borderLeft: `4px solid ${TITLE_BG}`,
                paddingLeft: 8,
                fontSize: 15,
                color: BLACK,
                marginBottom: 12,
                fontFamily: FONT_MONO,
                letterSpacing: 0.5,
              }}
            >
              “{ERA_1981.persona.quote}”
            </div>

            <div
              style={{
                fontSize: 11,
                color: SHADOW,
                fontFamily: FONT_MONO,
                marginBottom: 4,
                letterSpacing: 1,
              }}
            >
              {ERA_1981.persona.backgroundIntro}
            </div>
            <p
              style={{
                fontSize: 13,
                color: BLACK,
                lineHeight: 1.55,
                fontFamily: FONT_MONO,
              }}
            >
              {PERSONA.background.toUpperCase()}
            </p>
          </div>
        </WindowFrame>

        {/* ── 03 · EMPATHY MAP ────────────────────────────── */}
        <WindowFrame
          k="empathy"
          title="EMPATHY-MAP.DAT"
          subtitle="says · thinks · does · feels"
          icon="◐"
          collapsed={collapsed.empathy}
          closed={closed.empathy}
          onCollapse={toggleCollapse}
          onClose={closeWindow}
        >
          <div
            className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3"
            style={{ backgroundColor: HILITE }}
          >
            <SunkenPanel header="03.A SAYS" subtitle="skills i claim">
              <p
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 13,
                  marginBottom: 6,
                  letterSpacing: 0.5,
                }}
              >
                {ERA_1981.empathy.saysQuote}
              </p>
              <Tags items={[...EMPATHY_MAP.says.skills].map((s) => s.toUpperCase())} />
            </SunkenPanel>
            <SunkenPanel header="03.B THINKS" subtitle="philosophy">
              <BulletList
                items={[
                  "DESIGN ≡ ENGINEERING",
                  "SHIP FAST · ITERATE FASTER",
                  "USER PROBLEMS → SOLUTIONS",
                ]}
                marker="•"
              />
            </SunkenPanel>
            <SunkenPanel header="03.C DOES" subtitle="stack in rotation">
              <Tags items={[...EMPATHY_MAP.does].map((s) => s.toUpperCase())} />
            </SunkenPanel>
            <SunkenPanel header="03.D FEELS" subtitle="motivations">
              <BulletList
                items={[
                  "PASSIONATE: CRAFT & DETAIL",
                  "EXCITED: GAMIFIED EXPERIENCES",
                  "CURIOUS: AI INTEGRATION",
                ]}
                marker="*"
              />
            </SunkenPanel>
          </div>
        </WindowFrame>

        {/* ── 04 · JOURNEY MAP ────────────────────────────── */}
        <WindowFrame
          k="journey"
          title="JOURNEY-MAP.TSV"
          subtitle="career · 2018 → now"
          icon="↗"
          collapsed={collapsed.journey}
          closed={closed.journey}
          onCollapse={toggleCollapse}
          onClose={closeWindow}
        >
          <div className="px-4 py-3" style={{ backgroundColor: HILITE }}>
            <pre
              style={{
                fontFamily: FONT_MONO,
                fontSize: 12,
                color: SHADOW,
                marginBottom: 8,
                whiteSpace: "pre",
              }}
            >
              {"YEAR  │ PHASE           │ ENTRY"}
              {"\n"}
              {"──────┼─────────────────┼" + "─".repeat(40)}
            </pre>
            <ol>
              {nodes.map((n, i) => {
                const last = i === nodes.length - 1;
                const tone = TIMELINE_TONE[n.year];
                const phase = tone?.phase ?? n.phase.toUpperCase();
                const position = tone?.position ?? n.position.toUpperCase();
                return (
                  <li
                    key={n.year}
                    className="grid"
                    style={{ gridTemplateColumns: "72px 170px 1fr" }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontFamily: FONT_MONO,
                        fontSize: 16,
                        color: BLACK,
                        paddingTop: 2,
                      }}
                    >
                      {n.year}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: n.live ? TITLE_BG : BLACK,
                        letterSpacing: 1,
                        paddingTop: 4,
                        fontFamily: FONT_MONO,
                      }}
                    >
                      {last ? "▼ " : "├ "}
                      {phase}
                    </div>
                    <div style={{ paddingBottom: 12 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: BLACK,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flexWrap: "wrap",
                          letterSpacing: 0.5,
                          fontFamily: FONT_MONO,
                        }}
                      >
                        {position}
                        {n.live && (
                          <span
                            style={{
                              fontSize: 10,
                              padding: "1px 6px",
                              backgroundColor: TITLE_BG,
                              color: TITLE_TEXT,
                              letterSpacing: 1,
                              fontFamily: FONT_MONO,
                            }}
                          >
                            ◉ LIVE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: SHADOW }}>@ {n.org}</div>
                      <div
                        style={{
                          fontSize: 12,
                          color: BLACK,
                          marginTop: 1,
                          fontFamily: FONT_MONO,
                          letterSpacing: 0.3,
                        }}
                      >
                        {n.detail.toUpperCase()}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </WindowFrame>

        {/* ── 05 · IMPACT ─────────────────────────────────── */}
        <WindowFrame
          k="impact"
          title="IMPACT.METRICS"
          subtitle="quantified outcomes"
          icon="▤"
          collapsed={collapsed.impact}
          closed={closed.impact}
          onCollapse={toggleCollapse}
          onClose={closeWindow}
        >
          <div className="px-4 py-3" style={{ backgroundColor: HILITE }}>
            <div
              style={{
                fontSize: 11,
                color: SHADOW,
                fontFamily: FONT_MONO,
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              {ERA_1981.metrics.headerNote}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {IMPACT_METRICS.slice(0, 8).map((m) => (
                <SunkenPanel key={m.id} header="" subtitle="" compact>
                  <div style={{ fontSize: 22, lineHeight: 1 }} aria-hidden>
                    {m.icon}
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      color: TITLE_BG,
                      fontFamily: FONT_MONO,
                      marginTop: 6,
                      lineHeight: 1,
                    }}
                  >
                    {m.value}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      color: BLACK,
                      marginTop: 4,
                      fontFamily: FONT_MONO,
                    }}
                  >
                    {m.label}
                  </div>
                  {m.context && (
                    <div
                      style={{
                        fontSize: 10,
                        color: SHADOW,
                        marginTop: 1,
                        fontFamily: FONT_MONO,
                      }}
                    >
                      {m.context.toUpperCase()}
                    </div>
                  )}
                </SunkenPanel>
              ))}
            </div>
          </div>
        </WindowFrame>

        {/* ── 06 · CARD SORTING ───────────────────────────── */}
        <WindowFrame
          k="cards"
          title="CARD-SORT.IA"
          subtitle="projects by taxonomy"
          icon="▦"
          collapsed={collapsed.cards}
          closed={closed.cards}
          onCollapse={toggleCollapse}
          onClose={closeWindow}
        >
          <div className="px-4 py-3" style={{ backgroundColor: HILITE }}>
            <div
              style={{
                fontSize: 11,
                color: SHADOW,
                fontFamily: FONT_MONO,
                letterSpacing: 1,
                marginBottom: 6,
              }}
            >
              {ERA_1981.cards.headerNote}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {CARD_SORTING.taxonomy.map((cat, i) => (
                <span
                  key={cat}
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    color: i === 0 ? TITLE_TEXT : BLACK,
                    backgroundColor: i === 0 ? TITLE_BG : GRAY_LIGHT,
                    border: `1px solid ${BLACK}`,
                    letterSpacing: 1,
                    fontFamily: FONT_MONO,
                    textTransform: "uppercase",
                  }}
                >
                  [{cat}]
                </span>
              ))}
            </div>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CARD_SORTING.projects.map((p, i) => (
                <li key={p.id}>
                  <SunkenPanel
                    header={`CARD ${String(i + 1).padStart(2, "0")}`}
                    subtitle={p.duration.toUpperCase()}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: BLACK,
                        marginBottom: 4,
                        textTransform: "uppercase",
                      }}
                    >
                      {p.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: TITLE_BG,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        marginBottom: 6,
                        fontFamily: FONT_MONO,
                      }}
                    >
                      ▸ CATEGORY: {p.category}
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: BLACK,
                        marginBottom: 6,
                        lineHeight: 1.45,
                        fontFamily: FONT_MONO,
                        letterSpacing: 0.3,
                      }}
                    >
                      {p.description.toUpperCase()}
                    </p>
                    <Tags items={p.technologies.map((t) => t.toUpperCase())} />
                  </SunkenPanel>
                </li>
              ))}
            </ol>
          </div>
        </WindowFrame>

        {/* ── 07 · USABILITY TEST ─────────────────────────── */}
        <WindowFrame
          k="usability"
          title="USABILITY-TEST.SH"
          subtitle="test the connection"
          icon="✆"
          collapsed={collapsed.usability}
          closed={closed.usability}
          onCollapse={toggleCollapse}
          onClose={closeWindow}
        >
          <div
            className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-3"
            style={{ backgroundColor: HILITE }}
          >
            <SunkenPanel header="07.A TEST SCENARIO" subtitle="task + metrics">
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: TITLE_BG,
                  marginBottom: 4,
                  fontFamily: FONT_MONO,
                  letterSpacing: 1,
                }}
              >
                ▶ {ERA_1981.usability.taskTitle}
              </div>
              <p
                style={{
                  fontSize: 12,
                  marginBottom: 8,
                  fontFamily: FONT_MONO,
                  letterSpacing: 0.3,
                }}
              >
                {ERA_1981.usability.taskBody}
              </p>
              <div
                style={{
                  fontSize: 11,
                  color: SHADOW,
                  fontFamily: FONT_MONO,
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                SUCCESS METRICS
              </div>
              <BulletList
                items={ERA_1981.usability.metrics}
                marker="✓"
                tint={TITLE_BG}
              />
            </SunkenPanel>
            <SunkenPanel header="07.B TEST CHANNELS" subtitle="contact methods">
              <ul className="flex flex-col gap-1.5">
                {USABILITY_TEST.channels.map((c) => ({
                  label: c.label.toUpperCase(),
                  value: c.value,
                  href: c.href,
                  role: c.role.toUpperCase(),
                })).map((c) => (
                  <li key={c.label}>
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      style={{ textDecoration: "none", color: BLACK }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          letterSpacing: 1,
                          color: SHADOW,
                          fontFamily: FONT_MONO,
                        }}
                      >
                        ▸ {c.label} — {c.role}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: TITLE_BG,
                          textDecoration: "underline",
                          fontFamily: FONT_MONO,
                        }}
                      >
                        {c.value}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </SunkenPanel>
          </div>
        </WindowFrame>

        {/* ── BOTTOM STATUS BAR ───────────────────────────── */}
        <StatusBar
          fileCount={fileCount}
          totalFiles={initialWindows.length}
          caret={caret}
          bootDone={bootDone}
        />
      </div>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────
// Window frame with collapse + close behaviour
// ───────────────────────────────────────────────────────────────────────

type WindowKey =
  | "hero"
  | "why"
  | "persona"
  | "empathy"
  | "journey"
  | "impact"
  | "cards"
  | "usability";

function WindowFrame({
  k,
  title,
  subtitle,
  icon,
  collapsed,
  closed,
  onCollapse,
  onClose,
  children,
}: {
  k: WindowKey;
  title: string;
  subtitle?: string;
  icon?: string;
  collapsed?: boolean;
  closed?: boolean;
  onCollapse: (k: WindowKey) => void;
  onClose: (k: WindowKey) => void;
  children: React.ReactNode;
}) {
  if (closed) return null;
  return (
    <div
      style={{
        backgroundColor: GRAY,
        borderTop: `2px solid ${HILITE}`,
        borderLeft: `2px solid ${HILITE}`,
        borderRight: `2px solid ${SHADOW}`,
        borderBottom: `2px solid ${SHADOW}`,
        outline: `1px solid ${BLACK}`,
        boxShadow: `3px 3px 0 ${BLACK}`,
      }}
    >
      <button
        type="button"
        onClick={() => onCollapse(k)}
        aria-label={`Toggle ${title}`}
        style={{
          width: "100%",
          backgroundColor: TITLE_BG,
          color: TITLE_TEXT,
          padding: "3px 6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          borderBottom: `1px solid ${BLACK}`,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {icon && (
            <span
              style={{
                display: "inline-block",
                width: 18,
                textAlign: "center",
                backgroundColor: GRAY,
                color: BLACK,
                border: `1px solid ${BLACK}`,
                fontSize: 11,
              }}
            >
              {icon}
            </span>
          )}
          <span
            style={{
              fontWeight: 700,
              letterSpacing: 1,
              fontSize: 12,
              fontFamily: FONT_MONO,
            }}
          >
            {title}
          </span>
          {subtitle && (
            <span
              style={{ fontSize: 11, opacity: 0.75, fontFamily: FONT_MONO }}
            >
              · {subtitle}
            </span>
          )}
        </span>
        <span style={{ display: "flex", gap: 2 }}>
          <WindowControl onClick={(e) => { e.stopPropagation(); onCollapse(k); }}>
            {collapsed ? "▢" : "_"}
          </WindowControl>
          <WindowControl onClick={(e) => { e.stopPropagation(); onCollapse(k); }}>
            □
          </WindowControl>
          <WindowControl onClick={(e) => { e.stopPropagation(); onClose(k); }}>
            ✕
          </WindowControl>
        </span>
      </button>
      {!collapsed && children}
    </div>
  );
}

function WindowControl({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick(e as unknown as React.MouseEvent);
        }
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
        height: 16,
        backgroundColor: GRAY,
        color: BLACK,
        borderTop: `1px solid ${pressed ? SHADOW : HILITE}`,
        borderLeft: `1px solid ${pressed ? SHADOW : HILITE}`,
        borderRight: `1px solid ${pressed ? HILITE : SHADOW}`,
        borderBottom: `1px solid ${pressed ? HILITE : SHADOW}`,
        fontSize: 10,
        lineHeight: 1,
        fontFamily: FONT_MONO,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {children}
    </span>
  );
}

// ───────────────────────────────────────────────────────────────────────
// Boot trace window
// ───────────────────────────────────────────────────────────────────────

function BootTraceWindow({
  lines,
  done,
}: {
  lines: string[];
  done: boolean;
}) {
  return (
    <div
      style={{
        backgroundColor: GRAY,
        borderTop: `2px solid ${HILITE}`,
        borderLeft: `2px solid ${HILITE}`,
        borderRight: `2px solid ${SHADOW}`,
        borderBottom: `2px solid ${SHADOW}`,
        outline: `1px solid ${BLACK}`,
        boxShadow: `2px 2px 0 ${BLACK}`,
        opacity: done ? 0.78 : 1,
        transition: "opacity 220ms ease-out",
      }}
    >
      <div
        style={{
          backgroundColor: TITLE_BG,
          color: TITLE_TEXT,
          padding: "2px 6px",
          fontSize: 11,
          fontFamily: FONT_MONO,
          letterSpacing: 1,
          borderBottom: `1px solid ${BLACK}`,
        }}
      >
        SYS-BOOT · /DEV/HD0
      </div>
      <pre
        style={{
          margin: 0,
          padding: "6px 10px",
          backgroundColor: "#000000",
          color: "#00aa00",
          fontFamily: FONT_MONO,
          fontSize: 12,
          lineHeight: 1.4,
          minHeight: 24,
          whiteSpace: "pre-wrap",
        }}
      >
        {lines.map((l, i) => (
          <div key={i}>
            <span style={{ color: SHADOW }}>$ </span>
            {l}
          </div>
        ))}
        {!done && <span style={{ color: "#00aa00" }}>$ _</span>}
      </pre>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
// Re-launcher dock for closed windows
// ───────────────────────────────────────────────────────────────────────

function ReopenDock({
  closed,
  initial,
  onReopen,
}: {
  closed: Record<string, boolean>;
  initial: WindowKey[];
  onReopen: (k: WindowKey) => void;
}) {
  const closedKeys = initial.filter((k) => closed[k]);
  return (
    <div
      style={{
        backgroundColor: GRAY_LIGHT,
        borderTop: `2px solid ${HILITE}`,
        borderLeft: `2px solid ${HILITE}`,
        borderRight: `2px solid ${SHADOW}`,
        borderBottom: `2px solid ${SHADOW}`,
        outline: `1px solid ${BLACK}`,
        padding: 6,
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontFamily: FONT_MONO,
          color: SHADOW,
          letterSpacing: 1,
          alignSelf: "center",
        }}
      >
        ▸ CLOSED:
      </span>
      {closedKeys.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onReopen(k)}
          style={{
            fontSize: 11,
            fontFamily: FONT_MONO,
            color: BLACK,
            padding: "2px 8px",
            backgroundColor: GRAY,
            borderTop: `1px solid ${HILITE}`,
            borderLeft: `1px solid ${HILITE}`,
            borderRight: `1px solid ${SHADOW}`,
            borderBottom: `1px solid ${SHADOW}`,
            cursor: "pointer",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          OPEN {k}.WIN
        </button>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
// Status bar
// ───────────────────────────────────────────────────────────────────────

function StatusBar({
  fileCount,
  totalFiles,
  caret,
  bootDone,
}: {
  fileCount: number;
  totalFiles: number;
  caret: { row: number; col: number };
  bootDone: boolean;
}) {
  return (
    <div
      style={{
        backgroundColor: GRAY_LIGHT,
        borderTop: `2px solid ${SHADOW}`,
        borderLeft: `2px solid ${SHADOW}`,
        borderRight: `2px solid ${HILITE}`,
        borderBottom: `2px solid ${HILITE}`,
        outline: `1px solid ${BLACK}`,
        padding: "4px 10px",
        fontSize: 11,
        fontFamily: FONT_MONO,
        color: BLACK,
        letterSpacing: 1,
        display: "grid",
        gridTemplateColumns: "1fr auto auto auto auto",
        gap: 16,
      }}
    >
      <span>
        STATUS · {bootDone ? "READY" : "LOADING…"}
      </span>
      <span>FREE 32K</span>
      <span>
        FILES {fileCount}/{totalFiles}
      </span>
      <span>SECTOR 0001:0001</span>
      <span>
        CARET {String(caret.row).padStart(4, "0")}:
        {String(caret.col).padStart(4, "0")}
      </span>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
// Desktop top bar (file/edit/view/help)
// ───────────────────────────────────────────────────────────────────────

function DesktopBar({ stamp }: { stamp: string }) {
  return (
    <div
      style={{
        backgroundColor: GRAY_LIGHT,
        borderTop: `2px solid ${HILITE}`,
        borderLeft: `2px solid ${HILITE}`,
        borderRight: `2px solid ${SHADOW}`,
        borderBottom: `2px solid ${SHADOW}`,
        padding: "4px 8px",
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: FONT_MONO,
        color: BLACK,
      }}
    >
      <span>KIRUK ⌂ DESKTOP — XEROX STAR / 1981</span>
      <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span>FILE</span>
        <span>EDIT</span>
        <span>VIEW</span>
        <span>HELP</span>
        <span style={{ color: SHADOW }}>· {stamp}</span>
      </span>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
// Sunken inner panel
// ───────────────────────────────────────────────────────────────────────

function SunkenPanel({
  header,
  subtitle,
  tint,
  compact,
  children,
}: {
  header: string;
  subtitle: string;
  tint?: string;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: SELECTED,
        borderTop: `2px solid ${SHADOW}`,
        borderLeft: `2px solid ${SHADOW}`,
        borderRight: `2px solid ${HILITE}`,
        borderBottom: `2px solid ${HILITE}`,
        outline: `1px solid ${BLACK}`,
        padding: compact ? 8 : 10,
      }}
    >
      {header && (
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            paddingBottom: 4,
            marginBottom: 6,
            borderBottom: `1px dashed ${SHADOW}`,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: tint ?? TITLE_BG,
              letterSpacing: 1,
              fontFamily: FONT_MONO,
              textTransform: "uppercase",
            }}
          >
            ◆ {header}
          </span>
          {subtitle && (
            <span
              style={{
                fontSize: 10,
                marginLeft: "auto",
                color: SHADOW,
                fontFamily: FONT_MONO,
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
// Key/value, bullets, tags
// ───────────────────────────────────────────────────────────────────────

function KeyValue({
  label,
  children,
  mute,
  tint,
}: {
  label: string;
  children: React.ReactNode;
  mute?: boolean;
  tint?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span
        style={{
          fontSize: 11,
          color: tint ?? SHADOW,
          fontFamily: FONT_MONO,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        ▸ {label}
      </span>
      <span
        style={{
          fontSize: 13,
          color: mute ? SHADOW : BLACK,
          fontStyle: mute ? "italic" : "normal",
          lineHeight: 1.5,
          fontFamily: FONT_MONO,
          letterSpacing: 0.3,
        }}
      >
        {children}
      </span>
    </div>
  );
}

function BulletList({
  items,
  marker = "►",
  tint,
}: {
  items: readonly string[];
  marker?: string;
  tint?: string;
}) {
  return (
    <ul style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {items.map((it) => (
        <li
          key={it}
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            fontSize: 12,
            color: BLACK,
            fontFamily: FONT_MONO,
            letterSpacing: 0.3,
          }}
        >
          <span style={{ color: tint ?? ACCENT }}>{marker}</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function Tags({ items }: { items: readonly string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {items.map((t) => (
        <span
          key={t}
          style={{
            display: "inline-block",
            fontSize: 11,
            padding: "1px 6px",
            color: BLACK,
            backgroundColor: GRAY_LIGHT,
            border: `1px solid ${BLACK}`,
            fontFamily: FONT_MONO,
            letterSpacing: 0.5,
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
// Bevel button with real mousedown sink
// ───────────────────────────────────────────────────────────────────────

function BevelButton({
  children,
  href,
  primary,
}: {
  children: React.ReactNode;
  href: string;
  primary?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const bg = primary ? TITLE_BG : GRAY;
  const color = primary ? TITLE_TEXT : BLACK;
  const hi = primary ? "#3333aa" : HILITE;
  const sh = primary ? "#000044" : SHADOW;
  return (
    <Link
      href={href}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        display: "inline-block",
        padding: "5px 12px",
        backgroundColor: bg,
        color,
        textDecoration: "none",
        borderTop: `2px solid ${pressed ? sh : hi}`,
        borderLeft: `2px solid ${pressed ? sh : hi}`,
        borderRight: `2px solid ${pressed ? hi : sh}`,
        borderBottom: `2px solid ${pressed ? hi : sh}`,
        outline: `1px solid ${BLACK}`,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 1,
        fontFamily: FONT_MONO,
        textTransform: "uppercase",
        transform: pressed ? "translate(1px, 1px)" : "none",
      }}
    >
      {children}
    </Link>
  );
}

function FileRow({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span
        style={{
          color: SHADOW,
          width: 130,
          flexShrink: 0,
          letterSpacing: 1,
        }}
      >
        {k.padEnd(14, ".")}
      </span>
      <span style={{ color: BLACK, fontWeight: 700, letterSpacing: 0.5 }}>
        {v}
      </span>
    </div>
  );
}

// 8-row pixel portrait — squared head + shoulders + hat — drawn from a
// 16x18 bitmap matrix. Renders with 4px-pixel blocks for a real bitmap feel.
function AsciiPortrait() {
  const W = 16;
  const H = 18;
  const PX = 5;
  // 0 = transparent, 1 = black outline, 2 = skin, 3 = hair, 4 = title-blue cap
  const PIXELS: number[] = [
    0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0,
    0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0,
    0,0,4,4,4,4,4,4,4,4,4,4,4,4,0,0,
    0,0,4,4,3,3,3,3,3,3,3,3,4,4,0,0,
    0,0,1,1,3,3,3,3,3,3,3,3,1,1,0,0,
    0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0,
    0,1,2,2,1,2,2,2,2,2,2,1,2,2,1,0,
    0,1,2,2,1,2,2,2,2,2,2,1,2,2,1,0,
    0,1,2,2,2,2,2,1,1,2,2,2,2,2,1,0,
    0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0,
    0,1,2,2,1,2,2,2,2,2,2,1,2,2,1,0,
    0,1,2,2,2,1,1,1,1,1,1,2,2,2,1,0,
    0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0,
    0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,
    0,1,1,1,3,3,3,3,3,3,3,3,1,1,1,0,
    1,1,3,3,3,3,3,3,3,3,3,3,3,3,1,1,
    1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  ];
  const swatch: Record<number, string> = {
    1: BLACK,
    2: "#e8c19a",
    3: "#2d2d2d",
    4: TITLE_BG,
  };
  return (
    <div
      style={{
        width: W * PX,
        height: H * PX,
        display: "grid",
        gridTemplateColumns: `repeat(${W}, ${PX}px)`,
        gridAutoRows: `${PX}px`,
        border: `1px solid ${BLACK}`,
        outline: `2px solid ${SHADOW}`,
        outlineOffset: 1,
        backgroundColor: GRAY,
        flexShrink: 0,
        imageRendering: "pixelated",
      }}
    >
      {PIXELS.map((p, i) => (
        <span
          key={i}
          style={{
            backgroundColor: p === 0 ? "transparent" : swatch[p],
          }}
        />
      ))}
    </div>
  );
}

function DitherRule() {
  return (
    <div
      style={{
        height: 4,
        margin: "10px 0",
        backgroundImage:
          "repeating-linear-gradient(90deg, #000 0, #000 2px, transparent 2px, transparent 4px)",
        opacity: 0.6,
      }}
    />
  );
}

export default XeroxBitmapHomePage;
