"use client";

/**
 * TerminalHomePage — 1970 archetype home rendered as a teletype research log.
 *
 * Meta-narrative: this portfolio is a UX research file with Arun as the
 * subject. Each RECORD is a UX artifact applied to him — persona, empathy
 * map, journey map, impact metrics, card sorting (IA), usability test. The
 * content lives in @/data/era-page-content so every era archetype tells the
 * same story.
 */

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { VT323 } from "next/font/google";
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
import { useModules, type ModuleId } from "@/contexts/ModuleContext";
import {
  TelescopeBox,
  type TelescopeNode,
} from "@/components/era-games/TelescopeBox";
import { LifeWalk } from "@/components/era-games/LifeWalk";
import { LIFE_MOMENTS } from "@/data/life-moments";
import type { GamePalette } from "@/components/era-games/types";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-terminal",
});

const PHOSPHOR = "#00ff41";
const PHOSPHOR_BRIGHT = "#39ff14";
const PHOSPHOR_DIM = "rgba(0,255,65,0.62)";
const PHOSPHOR_FAINT = "rgba(0,255,65,0.40)";
const PHOSPHOR_GHOST = "rgba(0,255,65,0.22)";
const ALERT = "#ff5577";

const BANNER = [
  " ██╗  ██╗██╗██████╗ ██╗   ██╗██╗  ██╗",
  " ██║ ██╔╝██║██╔══██╗██║   ██║██║ ██╔╝",
  " █████╔╝ ██║██████╔╝██║   ██║█████╔╝ ",
  " ██╔═██╗ ██║██╔══██╗██║   ██║██╔═██╗ ",
  " ██║  ██╗██║██║  ██║╚██████╔╝██║  ██╗",
  " ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝",
];

const RULE_DOUBLE = "═".repeat(62);
const RULE_SINGLE = "─".repeat(62);

function pad(n: number, width = 4) {
  return String(n).padStart(width, "0");
}

function stamp(date: Date) {
  const d = date.toISOString().slice(0, 10);
  const t = date.toISOString().slice(11, 19);
  return `${d} ${t}`;
}

/** Same width as a real stamp, so the teletype rules never reflow on mount. */
const STAMP_PLACEHOLDER = "---------- --:--:--";

function wrap(text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > width) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cur ? cur + " " + w : w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

export function TerminalHomePage() {
  const reduced = useReducedMotion();
  const { setLayoutMode } = useLayoutMode();
  const { open: openModule } = useModules();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const greenTextShadow =
    "0 0 6px rgba(0,255,65,0.55), 0 0 18px rgba(0,255,65,0.35)";
  // The clock is read on the client only: a stamp taken during SSR is already
  // a second stale by the time React hydrates, and the mismatch throws the
  // whole tree away.
  const [openStamp, setOpenStamp] = useState(STAMP_PLACEHOLDER);
  useEffect(() => setOpenStamp(stamp(new Date())), []);
  const openTime = openStamp.slice(11, 19);
  const nodes = useMemo(buildTimeline, []);
  const careerStars: TelescopeNode[] = useMemo(
    () =>
      nodes.map((n) => ({
        label: n.position,
        sub: `${n.org} — ${n.detail}`,
        meta: n.year,
        live: n.live,
      })),
    [nodes],
  );

  return (
    <main
      id="terminal-home"
      className={`${vt323.className} ${vt323.variable} relative min-h-screen w-full overflow-hidden`}
      style={{
        backgroundColor: "#000",
        color: PHOSPHOR,
        fontFamily: `${vt323.style.fontFamily}, "IBM Plex Mono", "Courier New", monospace`,
        textShadow: greenTextShadow,
        paddingTop: "var(--simple-game-nav-bottom, 56px)",
      }}
    >
      <AnimatePresence initial={false}>
        {!scrolled && (
          <motion.div
            key="tty-status"
            className="fixed inset-x-0 z-[55] flex items-center justify-between border-b px-4 py-1 text-[14px] uppercase tracking-[0.18em]"
            style={{
              top: "var(--simple-game-nav-bottom, 56px)",
              backgroundColor: "rgba(0,0,0,0.78)",
              borderColor: PHOSPHOR_GHOST,
              color: "rgba(0,255,65,0.85)",
            }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: reduced ? 0.12 : 0.22, ease: "easeOut" }}
          >
            <span>
              tty1 · kiruk@1970 · {HERO.location.split(",")[0].trim()}
            </span>
            <span className="hidden md:inline">
              era 1970 — phosphor &amp; ascii
            </span>
            <span>{openStamp} UTC</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`relative mx-auto max-w-3xl px-4 pb-20 text-[18px] leading-[1.4] sm:px-8 ${
          scrolled ? "pt-6" : "pt-14"
        }`}
      >
        {/* ── RESEARCH FILE HEADER ───────────────────────── */}
        <motion.section
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.30, ease: "easeOut" }}
          className="mb-6"
        >
          <pre
            className="whitespace-pre text-[14px] leading-[1.35]"
            style={{ color: PHOSPHOR_DIM }}
          >
            {RULE_DOUBLE}
            {"\n"}
            {`  UX RESEARCH FILE / KIRUK.IN     OPENED ${openStamp} UTC\n`}
            {`  SUBJECT: arun-ks · usability study of one\n`}
            {`  CLASSIFICATION: PUBLIC          SEQUENCE 0001 / 0007\n`}
            {RULE_DOUBLE}
          </pre>
        </motion.section>

        <motion.pre
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.02, ease: "easeOut" }}
          className="text-[8px] sm:text-[11px] md:text-[13px] leading-[1.05] mb-3 select-none whitespace-pre"
          style={{ color: PHOSPHOR_BRIGHT }}
        >
          {BANNER.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </motion.pre>

        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.32, delay: 0.06 }}
          className="mb-3"
        >
          <div
            className="text-[13px] uppercase tracking-[0.25em]"
            style={{ color: PHOSPHOR_FAINT }}
          >
            ▌ {HERO.preTitle} ▐
          </div>
          <div
            className="mt-2 text-[16px] italic max-w-2xl"
            style={{ color: PHOSPHOR_DIM }}
          >
            ─ {HERO.framing}
          </div>
        </motion.div>

        {/* meta nav — interface history + time machine, by the masthead */}
        <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2">
          <TermNavLink module="era-story" label="This Era" open={openModule} />
          <TermNavLink module="eras" label="Travel Eras" open={openModule} />
        </div>

        {/* ── RECORD 001 — WHY KIRUK ─────────────────────── */}
        <LogStamp seq={1} file="why-kiruk.txt" subtitle="hook · pain · bridge · close" time={openTime} delay={0.10} reduced={reduced} />
        <motion.section
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.12, ease: "easeOut" }}
          className="mb-10"
        >
          <Pair label="HOOK">{WHY_KIRUK.hook}</Pair>
          <Pair label="PAIN" tint={ALERT}>{WHY_KIRUK.pain}</Pair>
          <Pair label="BRIDGE">{WHY_KIRUK.bridge}</Pair>
          <Pair label="CLOSE" mute>“{WHY_KIRUK.tagline}”</Pair>
        </motion.section>

        {/* ── RECORD 002 — PERSONA ───────────────────────── */}
        <LogStamp seq={2} file="persona.dat" subtitle="user profile · subject under study" time={openTime} delay={0.14} reduced={reduced} />
        <motion.section
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.16, ease: "easeOut" }}
          className="mb-10"
        >
          {/* Identity */}
          <div
            className="text-[28px] sm:text-[34px] font-bold leading-tight"
            style={{ color: PHOSPHOR_BRIGHT }}
          >
            {PERSONA.identity.name}
          </div>
          <div className="text-[16px] mb-4" style={{ color: PHOSPHOR }}>
            {PERSONA.identity.role} @ {PERSONA.identity.org} ·{" "}
            {PERSONA.identity.location}
          </div>

          {/* Goals + Frustrations split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Panel header="GOALS" hint="what i strive for">
              <BulletList lines={PERSONA.goals as readonly string[]} marker="→" />
            </Panel>
            <Panel header="FRUSTRATIONS" hint="what i fight" tint={ALERT}>
              <BulletList
                lines={PERSONA.frustrations as readonly string[]}
                marker="✕"
                tint={ALERT}
              />
            </Panel>
          </div>

          {/* Quote */}
          <div
            className="border-l-2 pl-3 py-1 mb-4"
            style={{ borderColor: PHOSPHOR_BRIGHT }}
          >
            <div className="text-[19px] italic" style={{ color: PHOSPHOR_BRIGHT }}>
              “{PERSONA.quote}”
            </div>
          </div>

          {/* Background */}
          <div
            className="text-[14px] uppercase tracking-[0.2em] mb-1"
            style={{ color: PHOSPHOR_DIM }}
          >
            BACKGROUND
          </div>
          <NumberedBlock startLine={1} lines={wrap(PERSONA.background, 68)} />
        </motion.section>

        {/* ── ABOUT · constellation (interactive nav box) ──── */}
        <motion.section
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.17, ease: "easeOut" }}
          className="mb-10"
        >
          <LifeWalk
            palette={TERMINAL_PALETTE}
            moments={LIFE_MOMENTS}
            onOpen={() => openModule("about")}
            height={210}
          />
        </motion.section>

        {/* ── RECORD 003 — EMPATHY MAP ───────────────────── */}
        <LogStamp seq={3} file="empathy-map.dat" subtitle="says · thinks · does · feels" time={openTime} delay={0.18} reduced={reduced} />
        <motion.section
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.20, ease: "easeOut" }}
          className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <Panel header="03.A · SAYS" hint="skills i claim">
            <div className="italic mb-2" style={{ color: PHOSPHOR }}>
              “{EMPATHY_MAP.says.quote}”
            </div>
            <TagRow>
              {EMPATHY_MAP.says.skills.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </TagRow>
          </Panel>

          <Panel header="03.B · THINKS" hint="philosophy">
            <BulletList lines={EMPATHY_MAP.thinks as readonly string[]} marker="›" />
          </Panel>

          <Panel header="03.C · DOES" hint="stack in rotation">
            <TagRow>
              {EMPATHY_MAP.does.map((d) => (
                <Tag key={d}>{d}</Tag>
              ))}
            </TagRow>
          </Panel>

          <Panel header="03.D · FEELS" hint="motivations">
            <BulletList lines={EMPATHY_MAP.feels as readonly string[]} marker="*" />
          </Panel>
        </motion.section>

        {/* ── RECORD 004 — JOURNEY MAP ───────────────────── */}
        <LogStamp seq={4} file="journey-map.tsv" subtitle="career as user journey · 2018 → now" time={openTime} delay={0.22} reduced={reduced} />
        <motion.section
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.24, ease: "easeOut" }}
          className="mb-10"
        >
          <pre
            className="whitespace-pre text-[14px] leading-[1.2] mb-2"
            style={{ color: PHOSPHOR_FAINT }}
          >
            {"YEAR │ PHASE       │ ENTRY"}
            {"\n"}
            {"─────┼─────────────┼" + "─".repeat(44)}
          </pre>
          <ol>
            {nodes.map((n, i) => {
              const last = i === nodes.length - 1;
              const connector = last ? "▼" : "┼";
              return (
                <li key={n.year} className="grid grid-cols-[64px_140px_1fr]">
                  <div
                    className="text-[18px] tabular-nums font-bold pt-0.5"
                    style={{ color: n.live ? PHOSPHOR_BRIGHT : PHOSPHOR }}
                  >
                    {n.year}
                  </div>
                  <div className="flex items-start gap-2">
                    <pre
                      className="whitespace-pre leading-[1.2]"
                      style={{
                        color: n.live ? PHOSPHOR_BRIGHT : PHOSPHOR_DIM,
                      }}
                    >
                      {connector}─
                    </pre>
                    <span
                      className="text-[14px] uppercase tracking-[0.18em] font-bold pt-0.5"
                      style={{ color: n.live ? PHOSPHOR_BRIGHT : PHOSPHOR }}
                    >
                      {n.phase}
                    </span>
                  </div>
                  <div className="pb-3">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        className="text-[17px] font-bold"
                        style={{ color: n.live ? PHOSPHOR_BRIGHT : PHOSPHOR }}
                      >
                        {n.position}
                      </span>
                      {n.live && (
                        <span
                          className="text-[11px] uppercase tracking-wider px-2"
                          style={{
                            color: "#000",
                            backgroundColor: PHOSPHOR_BRIGHT,
                          }}
                        >
                          ◉ LIVE
                        </span>
                      )}
                    </div>
                    <div className="text-[14px]" style={{ color: PHOSPHOR_FAINT }}>
                      @ {n.org}
                    </div>
                    <div className="text-[15px]" style={{ color: PHOSPHOR }}>
                      {n.detail}
                    </div>
                  </div>
                  {!last && (
                    <>
                      <div />
                      <div className="flex justify-start">
                        <pre
                          className="whitespace-pre leading-[1] text-[14px]"
                          style={{ color: PHOSPHOR_GHOST }}
                        >
                          {"  │"}
                        </pre>
                      </div>
                      <div />
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </motion.section>

        {/* ── RECORD 005 — IMPACT ────────────────────────── */}
        <LogStamp seq={5} file="impact.metrics" subtitle="quantified outcomes" time={openTime} delay={0.26} reduced={reduced} />
        <motion.section
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.28, ease: "easeOut" }}
          className="mb-10"
        >
          <pre
            className="whitespace-pre text-[14px] leading-[1.2] mb-2"
            style={{ color: PHOSPHOR_FAINT }}
          >
            {"METRIC                       VALUE     · CATEGORY"}
            {"\n"}
            {"─".repeat(62)}
          </pre>
          <ul>
            {IMPACT_METRICS.slice(0, 8).map((m) => {
              const labelCol = m.label.slice(0, 28).padEnd(28, " ");
              const valueCol = m.value.padEnd(8, " ");
              return (
                <li
                  key={m.id}
                  className="text-[16px] leading-[1.45]"
                  style={{ color: PHOSPHOR }}
                >
                  <span style={{ color: PHOSPHOR_FAINT }}>{m.icon}</span>{" "}
                  <span>{labelCol}</span>{" "}
                  <span style={{ color: PHOSPHOR_BRIGHT }}>{valueCol}</span>{" "}
                  <span style={{ color: PHOSPHOR_FAINT }}>· {m.category}</span>
                  {m.context && (
                    <div className="pl-7 text-[14px]" style={{ color: PHOSPHOR_FAINT }}>
                      ↳ {m.context}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </motion.section>

        {/* ── RECORD 006 — CARD SORTING ──────────────────── */}
        <LogStamp seq={6} file="card-sort.ia" subtitle="projects organized by taxonomy" time={openTime} delay={0.30} reduced={reduced} />
        <motion.section
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.32, ease: "easeOut" }}
          className="mb-10"
        >
          <div className="flex flex-wrap gap-1.5 mb-3">
            {CARD_SORTING.taxonomy.map((cat, i) => (
              <span
                key={cat}
                className="px-2 py-0.5 text-[14px] uppercase tracking-wider border"
                style={{
                  borderColor: i === 0 ? PHOSPHOR_BRIGHT : PHOSPHOR_GHOST,
                  color: i === 0 ? PHOSPHOR_BRIGHT : PHOSPHOR_DIM,
                  backgroundColor:
                    i === 0 ? "rgba(57,255,20,0.10)" : "transparent",
                }}
              >
                [{cat}]
              </span>
            ))}
          </div>
          <ol className="space-y-3">
            {CARD_SORTING.projects.map((p, i) => (
              <li
                key={p.id}
                className="border-l-2 pl-3"
                style={{ borderColor: PHOSPHOR_GHOST }}
              >
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span
                    className="text-[14px] tabular-nums"
                    style={{ color: PHOSPHOR_FAINT }}
                  >
                    [{pad(i + 1, 2)}]
                  </span>
                  <span
                    className="text-[17px] font-bold"
                    style={{ color: PHOSPHOR_BRIGHT }}
                  >
                    {p.title}
                  </span>
                  <span
                    className="text-[12px] uppercase tracking-wider px-2"
                    style={{
                      color: PHOSPHOR_BRIGHT,
                      backgroundColor: "rgba(57,255,20,0.10)",
                      border: `1px solid ${PHOSPHOR_GHOST}`,
                    }}
                  >
                    {p.category}
                  </span>
                  <span
                    className="text-[13px] ml-auto"
                    style={{ color: PHOSPHOR_FAINT }}
                  >
                    {p.duration}
                  </span>
                </div>
                <div
                  className="text-[15px] mb-1"
                  style={{ color: PHOSPHOR }}
                >
                  {p.description}
                </div>
                <TagRow>
                  {p.technologies.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </TagRow>
              </li>
            ))}
          </ol>
        </motion.section>

        {/* progress link — by the journey/impact records */}
        <div className="mb-10 -mt-4">
          <TermNavLink module="progress" label="Progress · the long game" open={openModule} />
        </div>

        {/* ── WORK · constellation of real projects (nav box) ─ */}
        <motion.section
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.17, ease: "easeOut" }}
          className="mb-10"
        >
          <TelescopeBox
            palette={TERMINAL_PALETTE}
            title="WORK.scope"
            nodes={careerStars}
            onOpen={() => openModule("observatory")}
            height={240}
          />
        </motion.section>

        {/* ── RECORD 007 — USABILITY TEST ────────────────── */}
        <LogStamp seq={7} file="usability-test.sh" subtitle="test the connection" time={openTime} delay={0.34} reduced={reduced} />
        <motion.section
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.36, ease: "easeOut" }}
          className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <Panel header="07.A · TEST SCENARIO" hint="task & success metrics">
            <div className="text-[16px] font-bold mb-1" style={{ color: PHOSPHOR_BRIGHT }}>
              ▶ Task: {USABILITY_TEST.task}
            </div>
            <div className="text-[15px] mb-3" style={{ color: PHOSPHOR_DIM }}>
              {USABILITY_TEST.taskBody}
            </div>
            <div
              className="text-[13px] uppercase tracking-[0.2em] mb-1"
              style={{ color: PHOSPHOR_FAINT }}
            >
              SUCCESS METRICS
            </div>
            <ul className="space-y-0.5">
              {USABILITY_TEST.successMetrics.map((m) => (
                <li key={m} className="text-[15px]" style={{ color: PHOSPHOR }}>
                  <span style={{ color: PHOSPHOR_BRIGHT }}>✓</span> {m}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel header="07.B · TEST CHANNELS" hint="contact methods">
            <ul className="space-y-1.5">
              {USABILITY_TEST.channels.map((c, i) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group block"
                  >
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-[13px] tabular-nums"
                        style={{ color: PHOSPHOR_FAINT }}
                      >
                        [{pad(i + 1, 2)}]
                      </span>
                      <span
                        className="text-[14px] uppercase tracking-wider"
                        style={{ color: PHOSPHOR_BRIGHT }}
                      >
                        {c.label}
                      </span>
                      <span
                        className="text-[12px] ml-auto"
                        style={{ color: PHOSPHOR_FAINT }}
                      >
                        {c.role}
                      </span>
                    </div>
                    <div
                      className="text-[15px] pl-7 group-hover:underline"
                      style={{ color: PHOSPHOR }}
                    >
                      {c.value}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </Panel>
        </motion.section>

        {/* contact + blog links — close the file */}
        <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2">
          <TermNavLink module="contact" label="Contact · channels" open={openModule} />
          <TermNavLink module="blog" label="Field Notes · Blog" open={openModule} />
        </div>

        {/* ── EOF ────────────────────────────────────────── */}
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.40, ease: "easeOut" }}
          className="text-[14px]"
          style={{ color: PHOSPHOR_FAINT }}
        >
          <pre
            className="whitespace-pre leading-[1.35]"
            style={{ color: PHOSPHOR_DIM }}
          >
            {RULE_DOUBLE}
            {"\n"}
            {`  END OF FILE  ·  7 records printed  ·  closed ${openStamp} UTC\n`}
            {`  NAVIGATE: ABOUT.walk ⊳  ·  WORK.scope 🔭  ·  links ▸ inline above\n`}
            {RULE_DOUBLE}
          </pre>
        </motion.div>
      </div>
    </main>
  );
}

// ─── Building blocks ──────────────────────────────────────────────────────

function LogStamp({
  seq,
  file,
  subtitle,
  time,
  delay,
  reduced,
}: {
  seq: number;
  file: string;
  subtitle: string;
  time: string;
  delay: number;
  reduced: boolean | null;
}) {
  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay, ease: "easeOut" }}
      className="mt-2 mb-2"
    >
      <div
        className="text-[13px] uppercase tracking-[0.2em] flex items-baseline gap-2 flex-wrap"
        style={{ color: PHOSPHOR_DIM }}
      >
        <span style={{ color: PHOSPHOR_FAINT }}>[{time}]</span>
        <span style={{ color: PHOSPHOR_BRIGHT }}>RECORD {pad(seq, 3)}</span>
        <span style={{ color: PHOSPHOR }}>▸</span>
        <span style={{ color: PHOSPHOR_BRIGHT }}>{file}</span>
        <span style={{ color: PHOSPHOR_FAINT }}>· {subtitle}</span>
      </div>
      <div
        className="text-[14px] leading-[1.2] mt-1"
        style={{ color: PHOSPHOR_GHOST }}
      >
        {RULE_SINGLE}
      </div>
    </motion.div>
  );
}

function Pair({
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
    <div className="flex flex-col sm:flex-row sm:gap-3 mb-2">
      <span
        className="text-[14px] uppercase tracking-wider w-24 shrink-0"
        style={{ color: tint ?? PHOSPHOR_DIM }}
      >
        {label.padEnd(8, ".")}
      </span>
      <span
        className="text-[17px] flex-1"
        style={{ color: mute ? PHOSPHOR_FAINT : PHOSPHOR }}
      >
        {children}
      </span>
    </div>
  );
}

function Panel({
  header,
  hint,
  children,
  tint,
}: {
  header: string;
  hint: string;
  children: React.ReactNode;
  tint?: string;
}) {
  return (
    <div className="border-2 p-3" style={{ borderColor: PHOSPHOR_GHOST }}>
      <div
        className="flex items-baseline gap-2 mb-2 pb-1 border-b"
        style={{ borderColor: PHOSPHOR_GHOST }}
      >
        <span
          className="text-[15px] font-bold tracking-[0.18em] uppercase"
          style={{ color: tint ?? PHOSPHOR_BRIGHT }}
        >
          ═ {header}
        </span>
        <span className="text-[12px] ml-auto" style={{ color: PHOSPHOR_FAINT }}>
          {hint}
        </span>
      </div>
      <div className="text-[16px] leading-snug">{children}</div>
    </div>
  );
}

function BulletList({
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
        <li key={line} style={{ color: PHOSPHOR }}>
          <span style={{ color: tint ?? PHOSPHOR_BRIGHT }}>{marker} </span>
          {line}
        </li>
      ))}
    </ul>
  );
}

function TagRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="px-2 py-0.5 text-[14px] border"
      style={{ borderColor: PHOSPHOR_GHOST, color: PHOSPHOR }}
    >
      {children}
    </span>
  );
}

function NumberedBlock({
  startLine,
  lines,
}: {
  startLine: number;
  lines: string[];
}) {
  return (
    <pre
      className="whitespace-pre-wrap break-words text-[16px] leading-[1.5]"
      style={{ color: PHOSPHOR }}
    >
      {lines.map((line, i) => (
        <div key={i}>
          <span style={{ color: PHOSPHOR_FAINT }}>{pad(startLine + i, 4)}</span>
          {"   "}
          <span>{line}</span>
        </div>
      ))}
    </pre>
  );
}

// ─── Navigation: palette, data, inline links ──────────────────────────────

const TERMINAL_PALETTE: GamePalette = {
  bg: "#000000",
  fg: "#00ff41",
  dim: "rgba(0,255,65,0.45)",
  bright: "#39ff14",
  accent: "#7CFC00",
  danger: "#ff5577",
  font: '"VT323", "IBM Plex Mono", monospace',
  glow: 8,
  scanlines: true,
};

function TermNavLink({
  module,
  label,
  open,
}: {
  module: ModuleId;
  label: string;
  open: (module: ModuleId, origin?: { x: number; y: number }) => void;
}) {
  return (
    <button
      type="button"
      data-station={module}
      aria-haspopup="dialog"
      aria-label={`Open ${label}`}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        open(module, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      className="group inline-flex items-center gap-1.5 text-[15px] uppercase tracking-[0.14em] transition-transform hover:translate-x-0.5 focus-visible:outline-none"
      style={{ color: PHOSPHOR_BRIGHT }}
    >
      <span style={{ color: PHOSPHOR_FAINT }}>▸</span>
      {label}
      <span className="opacity-40 transition-opacity group-hover:opacity-100">
        ⤢
      </span>
    </button>
  );
}

export default TerminalHomePage;
