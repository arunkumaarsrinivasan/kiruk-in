"use client";

/**
 * SpatialHomePage — 2025 archetype home.
 *
 * Meta-narrative: the portfolio is a UX research file with Arun-the-designer
 * as the subject under study. Each panel is a research artifact applied to
 * him — persona, empathy map, journey map, impact metrics, card sort,
 * usability test. Visual language: floating glass panels at varied depths
 * with cursor parallax over a volumetric mesh.
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { portfolioData } from "@/data/portfolio-data";
import { SpatialShellLayer } from "./SpatialShellLayer";
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

const PURPLE = "#8b5cf6";
const BLUE = "#3b82f6";
const TEAL = "#14b8a6";
const PINK = "#f472b6";
const TEXT = "#f8fafc";
const TEXT_DIM = "rgba(248,250,252,0.75)";
const TEXT_FAINT = "rgba(248,250,252,0.45)";

const FONT_DISPLAY = "'SF Pro Display', 'Geist', 'Inter', sans-serif";
const FONT_BODY = "'SF Pro Text', 'Inter', sans-serif";
const FONT_MONO = "'SF Mono', 'Geist Mono', monospace";

function useParallax() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setPos({ x, y });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return pos;
}

export function SpatialHomePage() {
  const reduced = useReducedMotion();
  const { setLayoutMode } = useLayoutMode();
  const { x, y } = useParallax();

  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);

  const depth = (z: number) => ({
    x: reduced ? 0 : x * z,
    y: reduced ? 0 : y * z,
  });

  const nodes = buildTimeline();

  return (
    <div
      id="spatial-home"
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{
        color: TEXT,
        backgroundColor: "#020617",
        fontFamily: FONT_BODY,
        paddingTop: "calc(var(--simple-game-nav-bottom, 56px) + 32px)",
        paddingBottom: 80,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <SpatialShellLayer active />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 md:px-12 flex flex-col gap-12">
        {/* ── HERO ────────────────────────────────────────── */}
        <motion.section
          initial={reduced ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 28, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.23, 1, 0.32, 1] }}
          className="relative"
          style={{ transform: `translate3d(${depth(-14).x}px, ${depth(-14).y}px, 0)` }}
        >
          <SignalChip>{HERO.preTitle}</SignalChip>
          <h1
            className="mt-4 leading-[0.92] tracking-tight"
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: "clamp(3rem, 9vw, 7rem)",
              letterSpacing: "-0.03em",
              background: `linear-gradient(180deg, ${TEXT} 0%, ${TEXT_DIM} 55%, ${TEAL} 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter:
                "drop-shadow(0 0 60px rgba(20,184,166,0.18)) drop-shadow(0 18px 60px rgba(2,6,23,0.6))",
            }}
          >
            {HERO.name}.
          </h1>
          <p
            className="mt-5 max-w-2xl"
            style={{ fontSize: "clamp(1.05rem, 2vw, 1.4rem)", color: TEXT_DIM }}
          >
            {HERO.role} · {HERO.org} ·{" "}
            <span style={{ color: TEXT_FAINT }}>{HERO.location}</span>
          </p>
          <p
            className="mt-3 max-w-2xl"
            style={{
              fontSize: "clamp(0.95rem, 1.4vw, 1.05rem)",
              color: TEXT_FAINT,
              lineHeight: 1.55,
              fontStyle: "italic",
            }}
          >
            {HERO.framing}
          </p>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap gap-3 items-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-[12px] uppercase tracking-[0.22em] transition-transform"
              style={{
                color: "#020617",
                backgroundColor: TEAL,
                fontFamily: FONT_MONO,
                boxShadow: `0 12px 36px ${TEAL}55, 0 0 0 1px ${TEAL}88 inset`,
              }}
            >
              See the work
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border font-bold text-[12px] uppercase tracking-[0.22em]"
              style={{
                color: TEXT,
                borderColor: "rgba(255,255,255,0.18)",
                backgroundColor: "rgba(255,255,255,0.04)",
                fontFamily: FONT_MONO,
                backdropFilter: "blur(12px)",
              }}
            >
              Start a conversation
            </Link>
            <span
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] ml-auto"
              style={{ color: TEXT_FAINT, fontFamily: FONT_MONO }}
            >
              <span aria-hidden style={{ color: TEAL }}>◆</span>
              gesture · cursor parallaxes the panels
            </span>
          </div>

          {/* Scroll cue */}
          {!reduced && (
            <motion.div
              className="mt-10 flex items-center gap-2 text-[11px] uppercase tracking-[0.32em]"
              style={{ color: TEXT_FAINT, fontFamily: FONT_MONO }}
              animate={{ y: [0, 4, 0], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span aria-hidden>↓</span>
              scroll · enter research file
            </motion.div>
          )}
        </motion.section>

        {/* ── 00 · FOCUS — currently shipping ─────────────── */}
        <ParallaxPanel z={-6} accent={TEAL}>
          <PanelTag id="00" title="focus · currently shipping" />
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FocusCard
              tag="◉ LIVE"
              title="HP Print AI"
              kind="Design Engineer · day-to-day"
              detail="Co-creating the industry's first intelligent print experience. Email/webmail print, mobile-first onboarding, design system across 500+ internal users."
              accent={TEAL}
            />
            <FocusCard
              tag="◇ ACTIVE"
              title="@kirukism + kiruk.in"
              kind="Process journal · evenings & weekends"
              detail="Sketching tools and time-travel experiences. This site itself is an experiment in spatial UX and era-based design."
              accent={PURPLE}
            />
          </div>
        </ParallaxPanel>

        {/* ── 01 · WHY KIRUK ─────────────────────────────── */}
        <ParallaxPanel z={-8} accent={PURPLE}>
          <PanelTag id="01" title="why kiruk · hook → bridge" />
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResearchPair label="HOOK">{WHY_KIRUK.hook}</ResearchPair>
            <ResearchPair label="PAIN" tint={PINK}>{WHY_KIRUK.pain}</ResearchPair>
            <ResearchPair label="BRIDGE" tint={TEAL}>{WHY_KIRUK.bridge}</ResearchPair>
            <ResearchPair label="CLOSE" mute>“{WHY_KIRUK.tagline}”</ResearchPair>
          </div>
        </ParallaxPanel>

        {/* ── 02 · PERSONA ───────────────────────────────── */}
        <ParallaxPanel z={-10} accent={BLUE}>
          <PanelTag id="02" title="persona · subject under study" />
          <h2
            className="mt-2"
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: "clamp(1.5rem, 3vw, 2.4rem)",
              letterSpacing: "-0.015em",
              color: TEXT,
            }}
          >
            {PERSONA.identity.name}
          </h2>
          <div className="mt-1 text-[15px]" style={{ color: TEXT_DIM }}>
            {PERSONA.identity.role} @ {PERSONA.identity.org} ·{" "}
            {PERSONA.identity.location}
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <InnerPanel title="GOALS" hint="what i strive for">
              <Bullets lines={PERSONA.goals as readonly string[]} marker="→" />
            </InnerPanel>
            <InnerPanel title="FRUSTRATIONS" hint="what i fight" tint={PINK}>
              <Bullets
                lines={PERSONA.frustrations as readonly string[]}
                marker="✕"
                tint={PINK}
              />
            </InnerPanel>
          </div>

          <div
            className="mt-5 border-l-2 pl-4 py-1 italic"
            style={{ borderColor: TEAL, color: TEXT, fontSize: 18 }}
          >
            “{PERSONA.quote}”
          </div>

          <div className="mt-4">
            <div
              className="text-[11px] uppercase tracking-[0.25em] mb-1"
              style={{ color: TEXT_FAINT, fontFamily: FONT_MONO }}
            >
              Background
            </div>
            <p className="text-[15px]" style={{ color: TEXT_DIM, lineHeight: 1.55 }}>
              {PERSONA.background}
            </p>
          </div>
        </ParallaxPanel>

        {/* ── 03 · EMPATHY MAP ───────────────────────────── */}
        <ParallaxPanel z={-12} accent={TEAL}>
          <PanelTag id="03" title="empathy map · says · thinks · does · feels" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InnerPanel title="03.A · SAYS" hint="skills i claim">
              <p className="italic mb-2" style={{ color: TEXT_DIM }}>
                “{EMPATHY_MAP.says.quote}”
              </p>
              <Pills items={EMPATHY_MAP.says.skills} />
            </InnerPanel>
            <InnerPanel title="03.B · THINKS" hint="philosophy">
              <Bullets lines={EMPATHY_MAP.thinks as readonly string[]} marker="›" />
            </InnerPanel>
            <InnerPanel title="03.C · DOES" hint="stack in rotation">
              <Pills items={EMPATHY_MAP.does as readonly string[]} />
            </InnerPanel>
            <InnerPanel title="03.D · FEELS" hint="motivations">
              <Bullets lines={EMPATHY_MAP.feels as readonly string[]} marker="*" />
            </InnerPanel>
          </div>
        </ParallaxPanel>

        {/* ── 04 · JOURNEY MAP ───────────────────────────── */}
        <ParallaxPanel z={-12} accent={PURPLE}>
          <PanelTag id="04" title="journey map · career as user journey" />
          <div className="mt-4 relative">
            <div
              aria-hidden
              className="absolute top-2 bottom-2 left-[42px] sm:left-[68px]"
              style={{
                width: 2,
                background: `linear-gradient(180deg, transparent 0%, ${PURPLE}88 12%, ${BLUE}88 50%, ${TEAL}88 88%, transparent 100%)`,
                boxShadow: `0 0 16px ${BLUE}66`,
              }}
            />
            <ol className="space-y-5">
              {nodes.map((n) => (
                <li key={n.year} className="relative pl-[68px] sm:pl-[100px]">
                  <span
                    aria-hidden
                    className="absolute left-[34px] sm:left-[60px] top-1.5 inline-block rounded-full"
                    style={{
                      width: 16,
                      height: 16,
                      background: n.live
                        ? `radial-gradient(circle, ${TEAL} 0%, ${TEAL}55 70%, transparent 100%)`
                        : `radial-gradient(circle, ${BLUE}aa 0%, ${BLUE}33 70%, transparent 100%)`,
                      boxShadow: n.live
                        ? `0 0 22px ${TEAL}, 0 0 0 2px ${TEAL}55`
                        : `0 0 14px ${BLUE}77`,
                    }}
                  />
                  <span
                    className="absolute left-0 top-1 text-[14px] tabular-nums"
                    style={{
                      color: n.live ? TEAL : TEXT_FAINT,
                      fontFamily: FONT_MONO,
                    }}
                  >
                    {n.year}
                  </span>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                      className="text-xs uppercase tracking-[0.22em]"
                      style={{
                        color: n.live ? TEAL : TEXT_FAINT,
                        fontFamily: FONT_MONO,
                      }}
                    >
                      {n.phase}
                    </span>
                    {n.live && (
                      <span
                        className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          color: "#020617",
                          backgroundColor: TEAL,
                          fontFamily: FONT_MONO,
                        }}
                      >
                        ◉ live
                      </span>
                    )}
                  </div>
                  <div
                    className="text-[17px] font-semibold mt-0.5"
                    style={{ color: TEXT, fontFamily: FONT_DISPLAY }}
                  >
                    {n.position}
                  </div>
                  <div className="text-[13px]" style={{ color: TEXT_FAINT }}>
                    @ {n.org}
                  </div>
                  <div className="text-[14px] mt-0.5" style={{ color: TEXT_DIM }}>
                    {n.detail}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </ParallaxPanel>

        {/* ── 05 · IMPACT METRICS ────────────────────────── */}
        <ParallaxPanel z={-6} accent={TEAL}>
          <PanelTag id="05" title="impact · quantified outcomes" />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {IMPACT_METRICS.slice(0, 8).map((m, i) => (
              <ImpactTile
                key={m.id}
                icon={m.icon}
                value={m.value}
                label={m.label}
                context={m.context}
                index={i}
              />
            ))}
          </div>
        </ParallaxPanel>

        {/* ── 06 · CARD SORTING ──────────────────────────── */}
        <ParallaxPanel z={-10} accent={BLUE}>
          <PanelTag id="06" title="card sorting · projects by taxonomy" />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CARD_SORTING.taxonomy.map((cat, i) => (
              <span
                key={cat}
                className="px-2.5 py-1 text-xs uppercase tracking-[0.2em] rounded-full border"
                style={{
                  borderColor:
                    i === 0 ? "rgba(20,184,166,0.5)" : "rgba(255,255,255,0.10)",
                  backgroundColor:
                    i === 0 ? "rgba(20,184,166,0.10)" : "transparent",
                  color: i === 0 ? TEAL : TEXT_FAINT,
                  fontFamily: FONT_MONO,
                }}
              >
                {cat}
              </span>
            ))}
          </div>
          <ol className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {CARD_SORTING.projects.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  backgroundColor: "rgba(255,255,255,0.025)",
                }}
              >
                <div className="flex items-baseline gap-2 flex-wrap mb-2">
                  <span
                    className="text-[11px] uppercase tracking-[0.22em] px-2 py-0.5 rounded-full"
                    style={{
                      color: TEAL,
                      backgroundColor: "rgba(20,184,166,0.10)",
                      fontFamily: FONT_MONO,
                    }}
                  >
                    {p.category}
                  </span>
                  <span
                    className="text-[11px] ml-auto"
                    style={{ color: TEXT_FAINT, fontFamily: FONT_MONO }}
                  >
                    {p.duration}
                  </span>
                </div>
                <div
                  className="text-[17px] font-semibold leading-tight mb-1"
                  style={{ color: TEXT, fontFamily: FONT_DISPLAY }}
                >
                  {p.title}
                </div>
                <p className="text-[14px] mb-3" style={{ color: TEXT_DIM }}>
                  {p.description}
                </p>
                <Pills items={p.technologies} />
              </li>
            ))}
          </ol>
        </ParallaxPanel>

        {/* ── 07 · USABILITY TEST ────────────────────────── */}
        <ParallaxPanel z={-8} accent={PURPLE}>
          <PanelTag id="07" title="usability test · test the connection" />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <InnerPanel title="07.A · TEST SCENARIO" hint="task + success metrics">
              <div
                className="text-[16px] font-semibold mb-1"
                style={{ color: TEAL, fontFamily: FONT_DISPLAY }}
              >
                ▶ {USABILITY_TEST.task}
              </div>
              <p className="text-[14px] mb-3" style={{ color: TEXT_DIM }}>
                {USABILITY_TEST.taskBody}
              </p>
              <div
                className="text-[11px] uppercase tracking-[0.22em] mb-1"
                style={{ color: TEXT_FAINT, fontFamily: FONT_MONO }}
              >
                Success Metrics
              </div>
              <ul className="space-y-0.5">
                {USABILITY_TEST.successMetrics.map((m) => (
                  <li
                    key={m}
                    className="flex items-baseline gap-2 text-[14px]"
                    style={{ color: TEXT_DIM }}
                  >
                    <span style={{ color: TEAL }}>✓</span> {m}
                  </li>
                ))}
              </ul>
            </InnerPanel>

            <InnerPanel title="07.B · TEST CHANNELS" hint="contact methods">
              <ul className="space-y-2">
                {USABILITY_TEST.channels.map((c) => (
                  <li key={c.label}>
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="group flex items-baseline gap-3 py-1 rounded-xl px-2 -mx-2 transition-colors"
                      style={{ color: TEXT }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(20,184,166,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <span
                        className="text-[11px] uppercase tracking-[0.22em] shrink-0 w-20"
                        style={{ color: TEXT_FAINT, fontFamily: FONT_MONO }}
                      >
                        {c.label}
                      </span>
                      <span
                        className="text-[14px] flex-1 truncate"
                        style={{ color: TEXT, fontFamily: FONT_MONO }}
                      >
                        {c.value}
                      </span>
                      <span
                        className="text-[11px] hidden sm:inline"
                        style={{ color: TEXT_FAINT }}
                      >
                        {c.role}
                      </span>
                      <span
                        className="text-[14px] transition-transform group-hover:translate-x-1"
                        style={{ color: TEAL }}
                        aria-hidden
                      >
                        →
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </InnerPanel>
          </div>
        </ParallaxPanel>
      </div>
    </div>
  );
}

// ─── Building blocks ──────────────────────────────────────────────────────

function ParallaxPanel({
  z,
  accent,
  children,
}: {
  z: number;
  accent: string;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const { x, y } = useParallax();
  const tx = reduced ? 0 : x * z;
  const ty = reduced ? 0 : y * z;

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      className="relative rounded-[28px] border p-6 sm:p-8"
      style={{
        transform: `translate3d(${tx}px, ${ty}px, 0)`,
        borderColor: "rgba(255,255,255,0.10)",
        backgroundColor: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(22px) saturate(160%)",
        WebkitBackdropFilter: "blur(22px) saturate(160%)",
        boxShadow:
          "0 24px 80px rgba(2,6,23,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.08) inset",
      }}
    >
      <div
        aria-hidden
        className="absolute -inset-px rounded-[28px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 20% 0%, ${accent}33, transparent 60%)`,
          mixBlendMode: "screen",
        }}
      />
      {children}
    </motion.div>
  );
}

function PanelTag({ id, title }: { id: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span
        className="text-[11px] tabular-nums"
        style={{
          color: TEXT_FAINT,
          fontFamily: FONT_MONO,
          letterSpacing: "0.2em",
        }}
      >
        {id}
      </span>
      <span
        className="text-[11px] uppercase"
        style={{
          color: TEXT_FAINT,
          fontFamily: FONT_MONO,
          letterSpacing: "0.25em",
        }}
      >
        {title}
      </span>
    </div>
  );
}

function SignalChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px]"
      style={{
        borderColor: "rgba(20,184,166,0.4)",
        backgroundColor: "rgba(20,184,166,0.08)",
        color: TEAL,
        fontFamily: FONT_MONO,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        backdropFilter: "blur(12px)",
      }}
    >
      <motion.span
        animate={{ opacity: [1, 0.35, 1] }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          borderRadius: 6,
          background: TEAL,
          boxShadow: `0 0 12px ${TEAL}`,
        }}
      />
      {children}
    </span>
  );
}

function InnerPanel({
  title,
  hint,
  tint,
  children,
}: {
  title: string;
  hint: string;
  tint?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.025)",
      }}
    >
      <div className="flex items-baseline gap-2 mb-3">
        <span
          className="text-[11px] uppercase tracking-[0.22em] font-bold"
          style={{
            color: tint ?? TEAL,
            fontFamily: FONT_MONO,
          }}
        >
          {title}
        </span>
        <span
          className="text-[10px] ml-auto"
          style={{ color: TEXT_FAINT, fontFamily: FONT_MONO }}
        >
          {hint}
        </span>
      </div>
      <div style={{ color: TEXT_DIM }}>{children}</div>
    </div>
  );
}

function ResearchPair({
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
    <div className="flex flex-col">
      <span
        className="text-[11px] uppercase tracking-[0.25em] mb-1"
        style={{ color: tint ?? TEXT_FAINT, fontFamily: FONT_MONO }}
      >
        {label}
      </span>
      <span
        className="text-[16px] leading-snug"
        style={{
          color: mute ? TEXT_FAINT : TEXT,
          fontStyle: mute ? "italic" : "normal",
        }}
      >
        {children}
      </span>
    </div>
  );
}

function Bullets({
  lines,
  marker = "›",
  tint,
}: {
  lines: readonly string[];
  marker?: string;
  tint?: string;
}) {
  return (
    <ul className="space-y-1">
      {lines.map((line) => (
        <li
          key={line}
          className="flex items-baseline gap-2 text-[14px]"
          style={{ color: TEXT_DIM }}
        >
          <span style={{ color: tint ?? TEAL }}>{marker}</span>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function FocusCard({
  tag,
  title,
  kind,
  detail,
  accent,
}: {
  tag: string;
  title: string;
  kind: string;
  detail: string;
  accent: string;
}) {
  return (
    <div
      className="relative rounded-2xl border p-4 overflow-hidden"
      style={{
        borderColor: "rgba(255,255,255,0.10)",
        backgroundColor: "rgba(255,255,255,0.03)",
      }}
    >
      <div
        aria-hidden
        className="absolute -top-12 -right-12 rounded-full"
        style={{
          width: 160,
          height: 160,
          background: `radial-gradient(circle, ${accent}44 0%, ${accent}11 50%, transparent 80%)`,
          filter: "blur(20px)",
        }}
      />
      <div className="relative">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.22em] font-bold"
          style={{
            color: accent,
            backgroundColor: `${accent}18`,
            border: `1px solid ${accent}44`,
            fontFamily: FONT_MONO,
          }}
        >
          {tag}
        </span>
        <div
          className="text-[20px] font-semibold mt-2"
          style={{ color: TEXT, fontFamily: FONT_DISPLAY }}
        >
          {title}
        </div>
        <div
          className="text-[12px] mt-0.5"
          style={{ color: TEXT_FAINT, fontFamily: FONT_MONO, letterSpacing: "0.02em" }}
        >
          {kind}
        </div>
        <p className="text-[14px] mt-2.5" style={{ color: TEXT_DIM, lineHeight: 1.55 }}>
          {detail}
        </p>
      </div>
    </div>
  );
}

function ImpactTile({
  icon,
  value,
  label,
  context,
  index,
}: {
  icon: string;
  value: string;
  label: string;
  context?: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const animated = useAnimatedNumber(value, inView && !reduced);

  return (
    <motion.div
      ref={ref}
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.23, 1, 0.32, 1] }}
      className="relative rounded-2xl border p-3 overflow-hidden"
      style={{
        borderColor: "rgba(255,255,255,0.10)",
        backgroundColor: "rgba(255,255,255,0.03)",
      }}
    >
      <div
        aria-hidden
        className="absolute -bottom-10 -left-6 rounded-full"
        style={{
          width: 140,
          height: 140,
          background: `radial-gradient(circle, ${TEAL}28 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />
      <div className="relative">
        <div className="text-[20px]" aria-hidden>
          {icon}
        </div>
        <div
          className="text-[30px] font-bold leading-none mt-1 tabular-nums"
          style={{
            color: TEAL,
            fontFamily: FONT_DISPLAY,
            textShadow: `0 0 16px ${TEAL}44`,
          }}
        >
          {animated}
        </div>
        <div
          className="text-[12px] uppercase tracking-[0.18em] mt-1.5"
          style={{ color: TEXT, fontFamily: FONT_BODY }}
        >
          {label}
        </div>
        {context && (
          <div className="text-[11px] mt-0.5" style={{ color: TEXT_FAINT }}>
            {context}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function useAnimatedNumber(target: string, run: boolean) {
  // Parse leading numeric portion of "45%", "12+", etc.
  const match = /^(\d+(?:\.\d+)?)([^\d].*)?$/.exec(target.trim());
  const numeric = match ? parseFloat(match[1]) : NaN;
  const suffix = match?.[2] ?? "";
  const [val, setVal] = useState<number>(run && !isNaN(numeric) ? 0 : numeric || 0);

  useEffect(() => {
    if (!run || isNaN(numeric)) return;
    const start = performance.now();
    const dur = 1100;
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(numeric * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, numeric]);

  if (isNaN(numeric)) return target;
  const formatted =
    Number.isInteger(numeric)
      ? Math.round(val).toString()
      : val.toFixed(1);
  return `${formatted}${suffix}`;
}

function Pills({ items }: { items: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <span
          key={it}
          className="px-2.5 py-1 text-xs rounded-full border"
          style={{
            borderColor: "rgba(255,255,255,0.12)",
            backgroundColor: "rgba(255,255,255,0.04)",
            color: TEXT_DIM,
            fontFamily: FONT_MONO,
            letterSpacing: "0.02em",
          }}
        >
          {it}
        </span>
      ))}
    </div>
  );
}

export default SpatialHomePage;
