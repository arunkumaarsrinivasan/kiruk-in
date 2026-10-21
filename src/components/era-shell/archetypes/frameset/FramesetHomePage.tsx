"use client";

/**
 * FramesetHomePage — 1997 archetype: KIRUK · A PRACTITIONER PROFILE.
 *
 * A multimedia CD-ROM title in the spirit of Encarta '97 / Cinemania /
 * Microsoft Bookshelf. Same UX-research-on-self content rendered as
 * an interactive interactive disc — beveled window chrome, hierarchical
 * chapter tree on the left, illustrated article on the right, audio
 * narration transcript, "See Also" cross-refs, search, bookmarks.
 *
 * Distinct from 1993 (directory), 1995 (personal homepage). Here the
 * paradigm is OFFLINE MULTIMEDIA — pre-loaded chapters, no scrolling
 * homepage. One chapter is open at a time.
 *
 * Unique 1997 CD-ROM interactions:
 *   - Hierarchical chapter tree (▾ Expand · click to navigate)
 *   - Toolbar: ◂ Back · Forward ▸ · ⌂ Home · 🔍 Search · 🔖 Bookmark
 *   - Bookmark toggle persists per chapter (sessionStorage)
 *   - Search overlay filters chapters live as you type
 *   - Audio narration: ▶ Play opens a 60s mock progress bar with
 *     scrubber + the transcript scrolls karaoke-style
 *   - "See Also" cross-references jump between chapters
 *   - Status bar: chapter X of Y · disk track timing · session timer
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { eyeClear } from "@/components/layout/eye-clear";

// Palette — Encarta-era warm earth tones
const WINE = "#6b1f2e";
const WINE_DARK = "#4a1320";
const WINE_LIGHT = "#8a2d3e";
const PAPER = "#f5ecd7";
const PAPER_LIGHT = "#faf5e6";
const PAPER_DEEP = "#ebe0c6";
const INK = "#2a1f1a";
const INK_DIM = "#5c4a3b";
const MUTED = "#8c7a66";
const GOLD = "#b8941c";
const GOLD_DARK = "#8a6d12";
const DESK = "#2a1f1a";     // wood-grain desktop bg

const FONT_BODY = "Georgia, 'Bookman Old Style', 'Times New Roman', serif";
const FONT_UI = "Verdana, Tahoma, 'Lucida Grande', sans-serif";
const FONT_MONO = "'Courier New', Courier, monospace";

// ── Chapter tree ──────────────────────────────────────────────────────

type MediaKind = "text" | "audio" | "plate" | "table" | "timeline" | "index";

interface Chapter {
  id: string;
  num: string;
  title: string;
  short: string;
  abstract: string; // single-line thesis: question this chapter answers
  takeaway: string; // closing one-line insight printed in plate
  body: () => React.ReactNode;
  related: string[]; // chapter ids
  narration: string[]; // audio transcript lines (karaoke)
  media: MediaKind[];
}

function buildChapters(): Chapter[] {
  const nodes = buildTimeline();
  return [
    {
      id: "intro",
      num: "I",
      title: "Introduction · About this Disc",
      short: "What this profile contains and how to read it.",
      abstract: "What you will learn on this disc, and how the seven chapters fit together.",
      takeaway:
        "A portfolio normally markets a designer. This disc studies one. Same artifacts UX researchers use on users, turned inward.",
      related: ["profile", "process"],
      media: ["text", "audio", "index"],
      narration: [
        "Welcome to a Practitioner Profile.",
        "This disc collects seven chapters about Arun.",
        "Each chapter is one UX research artifact applied to him.",
        "Use the tree on the left, or the toolbar above, to navigate.",
        "Press Play to hear the narration. End of preamble.",
      ],
      body: () => (
        <>
          <p style={p}>
            <FirstLetter>T</FirstLetter>
            his disc is a hand-edited multimedia profile of one{" "}
            <Hotspot term="design engineer">
              A practitioner who treats interface design and production
              code as one craft — neither a designer who hands off, nor
              an engineer who waits to be briefed.
            </Hotspot>
            . Each chapter renders one classical{" "}
            <Hotspot term="UX research artifact">
              Standard outputs of user-experience research — persona,
              empathy map, journey map, card sort, usability test —
              normally drawn for a product, here drawn for a person.
            </Hotspot>{" "}
            — persona, empathy map, journey map, impact, card sort,
            usability test — applied to the subject of the study:
            <em> Arun Kumaar Sreenivasan</em>.
          </p>

          <SideNote heading="HOW TO READ THIS DISC">
            Open chapters from the left tree, or use the toolbar. Bookmark
            anything you'd like to revisit. Press ▶ to hear the narrator.
            Use <strong>← →</strong> on your keyboard to flip pages.
          </SideNote>

          <Beat>THE THESIS</Beat>
          <p style={p}>
            <strong>{WHY_KIRUK.hook}</strong> When strategy, design and
            code live on separate processes, intent and speed both
            degrade. Arun collapses the three into a single{" "}
            <Hotspot term="bridge">
              Internal shorthand for one human carrying a feature from
              brief through mock through shipped code, without a handoff
              boundary in the middle.
            </Hotspot>{" "}
            workflow.
          </p>
          <PullQuote>{WHY_KIRUK.tagline}</PullQuote>
        </>
      ),
    },
    {
      id: "profile",
      num: "II",
      title: "Profile · Subject of the Study",
      short: "Identity, role, location, archetype.",
      abstract: "Who is the subject — in one passport page.",
      takeaway:
        "Hybrid practitioner: designs the interface, then writes the code that ships it. One person, no handoff.",
      related: ["intro", "process"],
      media: ["text", "audio", "table"],
      narration: [
        "Chapter Two — the subject's profile.",
        "Identity, role, and operating discipline.",
        "These are the lenses we'll keep returning to.",
      ],
      body: () => (
        <>
          <p style={p}>
            <FirstLetter>A</FirstLetter>
            UX persona normally describes a fictional user — a stand-in
            for a real audience the team is designing for. Here the
            persona is the designer himself. Read the fact sheet first,
            then the goals and frustrations side notes: that pairing is
            what tells you <em>why</em> his work looks the way it does.
          </p>

          <Beat>FACT SHEET</Beat>
          <table style={tbl}>
            <tbody>
              <Row k="Name">{PERSONA.identity.name}</Row>
              <Row k="Role">{PERSONA.identity.role}</Row>
              <Row k="Employer">{PERSONA.identity.org}</Row>
              <Row k="Location">{PERSONA.identity.location}</Row>
              <Row k="Born">Salem, Tamil Nadu · 2001</Row>
              <Row k="Type">Designer ↔ Engineer (bridge)</Row>
            </tbody>
          </table>

          <Beat>ON THE RECORD</Beat>
          <blockquote style={bq}>“{PERSONA.quote}”</blockquote>

          <SideNote heading="GOALS">
            <BulletList items={[...PERSONA.goals]} marker="▸" />
          </SideNote>

          <SideNote heading="FRUSTRATIONS" tint={WINE}>
            <BulletList items={[...PERSONA.frustrations]} marker="✕" tint={WINE} />
          </SideNote>

          <Beat>BACKGROUND</Beat>
          <p style={p}>{PERSONA.background}</p>
        </>
      ),
    },
    {
      id: "process",
      num: "III",
      title: "Empathy Map · How He Works",
      short: "Says · Thinks · Does · Feels.",
      abstract:
        "How does the subject operate when nobody is watching?",
      takeaway:
        "Belief and behaviour align. He claims a bridge role and the tools he reaches for prove it daily.",
      related: ["profile", "trajectory"],
      media: ["text", "audio", "plate"],
      narration: [
        "Chapter Three — the empathy map.",
        "What he says, what he thinks, what he does, what he feels.",
        "Four columns of the same person, cross-cut.",
      ],
      body: () => (
        <>
          <p style={p}>
            <FirstLetter>T</FirstLetter>
            he empathy map is a 2×2 grid that catches all four faces of
            a working person at once: <em>says</em> (claims he makes),{" "}
            <em>thinks</em> (compass beliefs), <em>does</em> (the
            evidence — tools in his hands today) and <em>feels</em>{" "}
            (motivations that bring him back tomorrow). The trick is to
            read across the seam: are <em>says</em> and <em>does</em>{" "}
            telling the same story, or does the claim drift from the
            evidence?
          </p>

          <Beat>FOUR LENSES</Beat>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 6,
            }}
          >
            <Quad head="Says" sub="skills he claims">
              <i>“{EMPATHY_MAP.says.quote}”</i>
              <br />
              <span style={{ color: MUTED, fontSize: 13 }}>
                {EMPATHY_MAP.says.skills.join(" · ")}
              </span>
            </Quad>
            <Quad head="Thinks" sub="operating compass">
              {EMPATHY_MAP.thinks.map((t) => (
                <div key={t}>· {t}</div>
              ))}
            </Quad>
            <Quad head="Does" sub="stack in rotation">
              {EMPATHY_MAP.does.join(" · ")}
            </Quad>
            <Quad head="Feels" sub="motivations">
              {EMPATHY_MAP.feels.map((f) => (
                <div key={f}>· {f}</div>
              ))}
            </Quad>
          </div>
        </>
      ),
    },
    {
      id: "trajectory",
      num: "IV",
      title: "Trajectory · Career Map",
      short: "Year by year, with context.",
      abstract: "How did the subject arrive at his current discipline?",
      takeaway:
        "Linear on paper, parallel in practice — design freelancing and engineering studies ran together for years before the bridge role existed in a job title.",
      related: ["impact", "selected"],
      media: ["text", "audio", "timeline"],
      narration: [
        "Chapter Four — the career trajectory.",
        "Five years, condensed.",
        "Each year is a step on the bridge.",
      ],
      body: () => (
        <>
          <p style={p}>
            <FirstLetter>S</FirstLetter>
            even years rendered as five phases:{" "}
            <strong>Discovery → Growth → Intersection → Mastery → Now</strong>.
            Each phase is one calendar year that mattered. The wine dot
            on the lifeline is the present day; gold dots are completed
            steps. Read it as a single ramp, not five separate jobs —
            the threads (design freelancing, engineering school, R&amp;D
            work) ran in parallel for most of the way.
          </p>
          <Beat>LIFELINE · 2018 → NOW</Beat>
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {nodes.map((n) => (
              <li
                key={n.year}
                style={{
                  borderLeft: `3px solid ${GOLD}`,
                  paddingLeft: 14,
                  marginBottom: 14,
                  position: "relative",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: -7,
                    top: 6,
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    backgroundColor: n.live ? WINE : GOLD,
                    border: `2px solid ${PAPER}`,
                  }}
                />
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 11,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: GOLD_DARK,
                  }}
                >
                  {n.year} · {n.phase}
                  {n.live && (
                    <span style={{ color: WINE, marginLeft: 6 }}>
                      — present day
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 17,
                    color: INK,
                    fontWeight: 700,
                    margin: "1px 0 2px",
                    lineHeight: 1.2,
                  }}
                >
                  {n.position}
                </div>
                <div style={{ color: MUTED, fontSize: 12, fontStyle: "italic", marginBottom: 4 }}>
                  @ {n.org}
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{n.detail}</p>
              </li>
            ))}
          </ol>
        </>
      ),
    },
    {
      id: "impact",
      num: "V",
      title: "By the Numbers · Impact Tally",
      short: "Quantified outcomes from the work.",
      abstract: "What did the work actually move — in numbers a stakeholder cares about?",
      takeaway:
        "Outcomes, not output. Each figure traces back to a decision shipped, not a deck written.",
      related: ["trajectory", "selected"],
      media: ["text", "audio", "plate"],
      narration: [
        "Chapter Five — the numbers.",
        "Receipts only — figures that can be cited.",
      ],
      body: () => (
        <>
          <p style={p}>
            <FirstLetter>I</FirstLetter>
            n UX research, the impact phase is where you separate{" "}
            <em>output</em> (slides, mocks, decks) from <em>outcome</em>{" "}
            (numbers that move a system someone uses). What follows is
            outcome only. Each tile pairs one measurable result with the
            shipped surface that produced it. If a figure cannot be
            traced to a real artifact, it does not appear on this disc.
          </p>
          <Beat>FIGURES OF NOTE</Beat>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 10,
              marginTop: 6,
            }}
          >
            {IMPACT_METRICS.slice(0, 8).map((m) => (
              <div
                key={m.id}
                style={{
                  border: `1px solid ${GOLD}55`,
                  backgroundColor: PAPER_LIGHT,
                  padding: 10,
                }}
              >
                <div style={{ fontSize: 20 }} aria-hidden>
                  {m.icon}
                </div>
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 26,
                    color: WINE,
                    fontWeight: 700,
                    lineHeight: 1,
                    marginTop: 4,
                  }}
                >
                  {m.value}
                </div>
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 11,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: INK,
                    marginTop: 4,
                  }}
                >
                  {m.label}
                </div>
                {m.context && (
                  <div
                    style={{
                      fontSize: 11,
                      color: MUTED,
                      fontStyle: "italic",
                      marginTop: 2,
                    }}
                  >
                    {m.context}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "selected",
      num: "VI",
      title: "Selected Works · Plates I–IV",
      short: "Four signature projects, annotated.",
      abstract: "What has the subject shipped — and what role did he carry through each one?",
      takeaway:
        "Four shipments, four categories, one constant: designed, built and measured by the same hand.",
      related: ["trajectory", "impact"],
      media: ["text", "audio", "plate", "index"],
      narration: [
        "Chapter Six — the selected works.",
        "Four plates. Each is a project the subject has shipped.",
      ],
      body: () => (
        <>
          <p style={p}>
            <FirstLetter>F</FirstLetter>
            our shipped projects, sorted by category — Web, Mobile,
            Design, AI. Each plate carries the same four metadata: the{" "}
            <strong>category</strong> (where the work lives),{" "}
            <strong>duration</strong> (how long it ran),{" "}
            <strong>title + brief</strong> (what it does for users) and{" "}
            <strong>tech</strong> (the stack underneath). Click a plate
            for the case study on its sibling disc.
          </p>
          <Beat>EXHIBIT INDEX</Beat>
          <p style={{ ...p, fontStyle: "italic", color: MUTED, fontSize: 13 }}>
            Each plate is one shipped project — designed, built and measured by the same hand.
          </p>
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {CARD_SORTING.projects.map((pr, i) => (
              <li
                key={pr.id}
                style={{
                  marginBottom: 12,
                  borderBottom: `1px dotted ${MUTED}`,
                  paddingBottom: 10,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 10,
                    letterSpacing: 2,
                    color: GOLD_DARK,
                    textTransform: "uppercase",
                  }}
                >
                  Plate {["I", "II", "III", "IV"][i]} · {pr.category} · {pr.duration}
                </div>
                <a
                  href={`/case-studies#${pr.id}`}
                  style={inlineLink}
                >
                  <div
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: 18,
                      color: INK,
                      fontWeight: 700,
                      lineHeight: 1.2,
                      margin: "2px 0",
                    }}
                  >
                    {pr.title}
                  </div>
                </a>
                <p style={{ margin: "2px 0 4px", fontSize: 14 }}>{pr.description}</p>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    color: MUTED,
                  }}
                >
                  tech · {pr.technologies.join(" · ")}
                </div>
              </li>
            ))}
          </ol>
        </>
      ),
    },
    {
      id: "reach",
      num: "VII",
      title: "Reach Out · Contact Card",
      short: "How to start a conversation.",
      abstract: "Which channel suits your question — and what reply speed should you expect?",
      takeaway:
        "Four channels, ranked by latency. Pick the one that fits the question, not the politest one.",
      related: ["intro"],
      media: ["text", "audio", "table"],
      narration: [
        "Chapter Seven — how to reach the subject.",
        "Four channels. Pick whichever fits the question.",
      ],
      body: () => (
        <>
          <p style={p}>
            <FirstLetter>T</FirstLetter>
            he final UX artifact is a usability test: give the user one
            task and measure how cleanly it completes. Your task here is
            simple — start a conversation. Below is the engagement
            protocol, the success metrics and four channels ranked by
            latency. Use whichever fits the question.
          </p>
          <Beat>ENGAGEMENT PROTOCOL</Beat>
          <p style={p}>
            <strong>Task.</strong> {USABILITY_TEST.task}. {USABILITY_TEST.taskBody}{" "}
            <em>
              Use email for anything you would expect a reply to in
              writing; LinkedIn for introductions and warm intros; GitHub
              if you want to read the code first; phone only when the
              question cannot survive a 24-hour wait.
            </em>
          </p>
          <SideNote heading="SUCCESS METRICS">
            <BulletList items={[...USABILITY_TEST.successMetrics]} marker="✓" tint={GOLD_DARK} />
          </SideNote>
          <Beat>CHANNELS</Beat>
          <table style={tbl}>
            <tbody>
              {USABILITY_TEST.channels.map((c) => (
                <tr key={c.label}>
                  <td style={{ ...td, width: 110, fontWeight: 700, backgroundColor: PAPER_DEEP }}>
                    {c.label}
                  </td>
                  <td style={td}>
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      style={inlineLink}
                    >
                      {c.value}
                    </a>
                    <div style={{ fontSize: 11, color: MUTED, fontStyle: "italic", marginTop: 2 }}>
                      {c.role}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ),
    },
  ];
}

function useIsMobile(breakpoint = 768): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return mobile;
}

export function FramesetHomePage() {
  const { setLayoutMode } = useLayoutMode();
  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);

  const isMobile = useIsMobile();

  // Boot splash — CD-ROM disc mount sequence
  const [booted, setBooted] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  useEffect(() => {
    let p = 0;
    const tick = window.setInterval(() => {
      p += 100 / 18; // ~1.8s total
      setBootProgress(Math.min(100, p));
      if (p >= 100) {
        window.clearInterval(tick);
        window.setTimeout(() => setBooted(true), 220);
      }
    }, 100);
    return () => window.clearInterval(tick);
  }, []);

  const chapters = useMemo(buildChapters, []);
  const [chapterId, setChapterId] = useState("intro");
  const chapter = chapters.find((c) => c.id === chapterId) ?? chapters[0];
  const chapterIdx = chapters.findIndex((c) => c.id === chapterId);

  // History stack for Back / Forward
  const [history, setHistory] = useState<string[]>(["intro"]);
  const [cursor, setCursor] = useState(0);

  const navigate = useCallback(
    (id: string, opts?: { skipHistory?: boolean }) => {
      setChapterId(id);
      if (!opts?.skipHistory) {
        setHistory((prev) => {
          const truncated = prev.slice(0, cursor + 1);
          if (truncated[truncated.length - 1] === id) return truncated;
          return [...truncated, id];
        });
        setCursor((c) => c + 1);
      }
    },
    [cursor],
  );

  const goBack = useCallback(() => {
    if (cursor <= 0) return;
    setCursor((c) => c - 1);
    navigate(history[cursor - 1], { skipHistory: true });
  }, [cursor, history, navigate]);

  const goForward = useCallback(() => {
    if (cursor >= history.length - 1) return;
    setCursor((c) => c + 1);
    navigate(history[cursor + 1], { skipHistory: true });
  }, [cursor, history, navigate]);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kiruk-1997-bookmarks");
      if (raw) setBookmarks(new Set(JSON.parse(raw) as string[]));
    } catch { /* noop */ }
  }, []);
  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        sessionStorage.setItem("kiruk-1997-bookmarks", JSON.stringify(Array.from(next)));
      } catch { /* noop */ }
      return next;
    });
  }, []);

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chapters;
    return chapters.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.short.toLowerCase().includes(q) ||
        c.num.toLowerCase().includes(q),
    );
  }, [chapters, query]);

  // Audio narration mock
  const [audioOpen, setAudioOpen] = useState(false);
  const [audioLine, setAudioLine] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioTimerRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (audioTimerRef.current !== null) {
        window.clearInterval(audioTimerRef.current);
      }
    };
  }, []);
  const playAudio = useCallback(() => {
    setAudioOpen(true);
    setAudioLine(0);
    setAudioProgress(0);
    if (audioTimerRef.current !== null) {
      window.clearInterval(audioTimerRef.current);
    }
    const totalLines = chapter.narration.length;
    const tickMs = 1400;
    let line = 0;
    let elapsed = 0;
    const totalMs = totalLines * tickMs;
    audioTimerRef.current = window.setInterval(() => {
      elapsed += 100;
      setAudioProgress(Math.min(1, elapsed / totalMs));
      const nextLine = Math.floor(elapsed / tickMs);
      if (nextLine !== line) {
        line = nextLine;
        setAudioLine(Math.min(totalLines - 1, line));
      }
      if (elapsed >= totalMs) {
        if (audioTimerRef.current !== null) {
          window.clearInterval(audioTimerRef.current);
          audioTimerRef.current = null;
        }
      }
    }, 100);
  }, [chapter.narration.length]);
  const stopAudio = useCallback(() => {
    setAudioOpen(false);
    if (audioTimerRef.current !== null) {
      window.clearInterval(audioTimerRef.current);
      audioTimerRef.current = null;
    }
  }, []);

  // Session timer (disc track timing). Phones count whole minutes, so the
  // status bar isn't ticking under the thumb every second.
  const calm = useCalmMotion();
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const step = calm ? 60 : 1;
    const id = window.setInterval(() => setElapsed((e) => e + step), step * 1000);
    return () => window.clearInterval(id);
  }, [calm]);

  // Keyboard shortcuts: ← prev · → next · b bookmark · / search · esc close overlays
  useEffect(() => {
    if (!booted) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft" && chapterIdx > 0) {
        e.preventDefault();
        navigate(chapters[chapterIdx - 1].id);
      } else if (e.key === "ArrowRight" && chapterIdx < chapters.length - 1) {
        e.preventDefault();
        navigate(chapters[chapterIdx + 1].id);
      } else if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleBookmark(chapterId);
      } else if (e.key === "/") {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [booted, chapterIdx, chapters, chapterId, navigate, toggleBookmark]);
  const elapsedMM = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const elapsedSS = String(elapsed % 60).padStart(2, "0");

  const stamp = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    [],
  );

  return (
    <div
      id="frameset-home"
      style={{
        backgroundColor: DESK,
        color: PAPER,
        fontFamily: FONT_UI,
        minHeight: "100vh",
        paddingTop: eyeClear(1080),
        paddingBottom: 32,
      }}
    >
      <style jsx global>{`
        @keyframes kiruk-1997-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes kiruk-1997-blink {
          0%, 60% { opacity: 1; }
          70%, 100% { opacity: 0.2; }
        }
        @keyframes kiruk-1997-pageflip {
          0%   { opacity: 0; transform: translateX(8px) rotateY(-4deg); transform-origin: left center; }
          100% { opacity: 1; transform: translateX(0) rotateY(0); }
        }
        @keyframes kiruk-1997-boot-shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        .kiruk-1997-page {
          animation: kiruk-1997-pageflip 280ms ease-out;
        }
        .kiruk-1997-hotspot {
          color: ${WINE};
          border-bottom: 1px dotted ${WINE};
          cursor: help;
          position: relative;
        }
        .kiruk-1997-hotspot:hover > .kiruk-1997-tip {
          display: block;
        }
        .kiruk-1997-tip {
          display: none;
          position: absolute;
          left: 0;
          top: calc(100% + 4px);
          width: 240px;
          padding: 8px 10px;
          background: ${PAPER};
          border: 1px solid ${WINE_DARK};
          box-shadow: 2px 3px 0 rgba(0,0,0,0.35);
          font-family: ${FONT_BODY};
          font-style: normal;
          font-size: 12px;
          line-height: 1.45;
          color: ${INK};
          z-index: 30;
          font-weight: 400;
        }
        .kiruk-1997-tip::before {
          content: "DEFINITION";
          display: block;
          font-family: ${FONT_UI};
          font-size: 9px;
          letter-spacing: 2px;
          color: ${GOLD_DARK};
          margin-bottom: 3px;
        }
      `}</style>

      {!booted && (
        <BootSplash progress={bootProgress} />
      )}

      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: isMobile ? "0 6px" : "0 14px",
          opacity: booted ? 1 : 0,
          transition: "opacity 320ms ease-out",
        }}
      >
        {/* ── DISC WINDOW (beveled CD-ROM application chrome) ─── */}
        <div
          style={{
            borderTop: `2px solid ${WINE_LIGHT}`,
            borderLeft: `2px solid ${WINE_LIGHT}`,
            borderRight: `2px solid ${WINE_DARK}`,
            borderBottom: `2px solid ${WINE_DARK}`,
            boxShadow: `4px 6px 0 rgba(0,0,0,0.5)`,
            backgroundColor: WINE,
          }}
        >
          {/* TITLE BAR */}
          <div
            style={{
              padding: isMobile ? "6px 10px" : "8px 14px",
              background: `linear-gradient(180deg, ${WINE_LIGHT} 0%, ${WINE} 70%, ${WINE_DARK} 100%)`,
              color: PAPER_LIGHT,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${WINE_DARK}`,
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <DiscIcon spinning={audioOpen} />
              <div>
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 19,
                    letterSpacing: 0.5,
                    fontStyle: "italic",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  Kiruk
                  <span style={{ color: GOLD, marginLeft: 4 }}>·</span>{" "}
                  A Practitioner Profile
                </div>
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 10,
                    letterSpacing: 2,
                    color: PAPER_DEEP,
                    marginTop: 3,
                    textTransform: "uppercase",
                  }}
                >
                  Interactive Multimedia Edition · 1997 · Disc 1 of 1
                </div>
              </div>
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                letterSpacing: 1,
                color: PAPER_DEEP,
              }}
            >
              {stamp.toUpperCase()}
            </div>
          </div>

          {/* TOOLBAR */}
          <div
            style={{
              padding: "8px 12px",
              background: `linear-gradient(180deg, ${PAPER_DEEP} 0%, #d5c8a4 100%)`,
              borderBottom: `1px solid ${WINE_DARK}`,
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            <ChromeBtn onClick={goBack} disabled={cursor <= 0} title="Back">◂ Back</ChromeBtn>
            <ChromeBtn
              onClick={goForward}
              disabled={cursor >= history.length - 1}
              title="Forward"
            >
              Forward ▸
            </ChromeBtn>
            <ChromeBtn onClick={() => navigate("intro")} title="Return to introduction">
              ⌂ Home
            </ChromeBtn>
            <ChromeBtn onClick={() => setSearchOpen((s) => !s)} title="Search the disc">
              🔍 Search
            </ChromeBtn>
            <ChromeBtn
              onClick={() => toggleBookmark(chapterId)}
              title="Bookmark this chapter"
              active={bookmarks.has(chapterId)}
            >
              {bookmarks.has(chapterId) ? "🔖 Bookmarked" : "🔖 Bookmark"}
            </ChromeBtn>
            <ChromeBtn onClick={playAudio} title="Play audio narration" emphasis>
              ▶ Play narration
            </ChromeBtn>
            <div
              style={{
                marginLeft: "auto",
                fontFamily: FONT_UI,
                fontSize: 11,
                color: INK_DIM,
                letterSpacing: 1,
              }}
            >
              Chapter {chapterIdx + 1} of {chapters.length}
            </div>
          </div>

          {/* SEARCH BAR */}
          {searchOpen && (
            <div
              style={{
                padding: "6px 12px",
                backgroundColor: PAPER_LIGHT,
                borderBottom: `1px solid ${WINE_DARK}`,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: FONT_UI,
                fontSize: 12,
              }}
            >
              <span style={{ color: INK_DIM }}>Search:</span>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="type to filter chapters…"
                style={{
                  flex: 1,
                  padding: "3px 6px",
                  fontFamily: FONT_UI,
                  fontSize: 13,
                  border: `1px solid ${WINE}`,
                  backgroundColor: PAPER,
                  color: INK,
                }}
              />
              <span style={{ color: INK_DIM, fontFamily: FONT_MONO, fontSize: 11 }}>
                {filtered.length}/{chapters.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
                style={searchClose}
              >
                close
              </button>
            </div>
          )}

          {/* Mobile: chapter selector dropdown */}
          {isMobile && (
            <div
              style={{
                padding: "8px 12px",
                backgroundColor: PAPER_LIGHT,
                borderBottom: `1px solid ${WINE_DARK}`,
                display: "flex",
                gap: 8,
                alignItems: "center",
                fontFamily: FONT_UI,
                fontSize: 12,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_UI,
                  fontSize: 10,
                  letterSpacing: 2,
                  color: GOLD_DARK,
                  textTransform: "uppercase",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                ▾ Chapter
              </span>
              <select
                value={chapterId}
                onChange={(e) => navigate(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "5px 8px",
                  fontFamily: FONT_UI,
                  fontSize: 13,
                  color: INK,
                  background: PAPER,
                  border: `1px solid ${WINE_DARK}`,
                  borderRadius: 2,
                }}
              >
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.num}. {c.title}
                    {bookmarks.has(c.id) ? " · 🔖" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* TWO-PANE BODY: chapter tree + content */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "240px 1fr",
              minHeight: 540,
            }}
          >
            {/* TREE PANE — hidden on mobile (replaced by dropdown above) */}
            {!isMobile && <aside
              style={{
                backgroundColor: PAPER_LIGHT,
                borderRight: `1px solid ${WINE_DARK}`,
                padding: "12px 10px",
                fontFamily: FONT_UI,
                fontSize: 12,
                color: INK,
              }}
            >
              <div
                style={{
                  fontFamily: FONT_UI,
                  fontSize: 10,
                  letterSpacing: 2,
                  color: GOLD_DARK,
                  textTransform: "uppercase",
                  paddingBottom: 4,
                  marginBottom: 6,
                  borderBottom: `1px dotted ${MUTED}`,
                }}
              >
                ▾ Table of Contents
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {filtered.map((c) => {
                  const active = c.id === chapterId;
                  const booked = bookmarks.has(c.id);
                  return (
                    <li key={c.id} style={{ marginBottom: 2 }}>
                      <button
                        type="button"
                        onClick={() => navigate(c.id)}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "5px 8px",
                          background: active
                            ? `linear-gradient(180deg, ${GOLD}aa 0%, ${GOLD} 100%)`
                            : "transparent",
                          color: active ? INK : INK_DIM,
                          border: "none",
                          fontFamily: FONT_UI,
                          fontSize: 12,
                          cursor: "pointer",
                          borderLeft: active
                            ? `3px solid ${WINE}`
                            : "3px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (active) return;
                          e.currentTarget.style.backgroundColor = PAPER_DEEP;
                        }}
                        onMouseLeave={(e) => {
                          if (active) return;
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: FONT_BODY,
                              fontSize: 11,
                              fontStyle: "italic",
                              color: active ? WINE : GOLD_DARK,
                              minWidth: 16,
                            }}
                          >
                            {c.num}.
                          </span>
                          <span
                            style={{
                              fontWeight: active ? 700 : 400,
                              flex: 1,
                            }}
                          >
                            {c.title}
                          </span>
                          {booked && (
                            <span style={{ color: WINE, fontSize: 10 }}>🔖</span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: active ? INK_DIM : MUTED,
                            paddingLeft: 18,
                            fontStyle: "italic",
                            lineHeight: 1.4,
                          }}
                        >
                          {c.short}
                        </div>
                        <div
                          style={{
                            paddingLeft: 18,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 3,
                            marginTop: 3,
                          }}
                        >
                          {c.media.map((m) => (
                            <MediaPill key={m} kind={m} dim={!active} />
                          ))}
                        </div>
                      </button>
                    </li>
                  );
                })}
                {filtered.length === 0 && (
                  <li style={{ fontSize: 11, color: MUTED, fontStyle: "italic", padding: "8px 4px" }}>
                    no chapters match "{query}"
                  </li>
                )}
              </ul>

              {bookmarks.size > 0 && (
                <>
                  <div
                    style={{
                      marginTop: 16,
                      fontFamily: FONT_UI,
                      fontSize: 10,
                      letterSpacing: 2,
                      color: GOLD_DARK,
                      textTransform: "uppercase",
                      paddingBottom: 4,
                      marginBottom: 6,
                      borderBottom: `1px dotted ${MUTED}`,
                    }}
                  >
                    🔖 Bookmarked
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {Array.from(bookmarks).map((id) => {
                      const c = chapters.find((cc) => cc.id === id);
                      if (!c) return null;
                      return (
                        <li key={id} style={{ marginBottom: 2 }}>
                          <button
                            type="button"
                            onClick={() => navigate(id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: WINE,
                              textDecoration: "underline",
                              padding: "2px 4px",
                              fontFamily: FONT_UI,
                              fontSize: 11,
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            › {c.title}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </aside>}

            {/* CONTENT PANE */}
            <article
              key={chapter.id}
              className="kiruk-1997-page"
              style={{
                backgroundColor: PAPER,
                color: INK,
                padding: isMobile ? "16px 16px 20px" : "22px 28px 28px",
                fontFamily: FONT_BODY,
                fontSize: isMobile ? 14 : 15,
                lineHeight: 1.65,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 10,
                    letterSpacing: 3,
                    color: GOLD_DARK,
                    textTransform: "uppercase",
                  }}
                >
                  CHAPTER {chapter.num}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {chapter.media.map((m) => (
                    <MediaPill key={m} kind={m} />
                  ))}
                </div>
              </div>
              <h1
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: "clamp(26px, 3.6vw, 38px)",
                  color: INK,
                  margin: "2px 0 4px",
                  lineHeight: 1.15,
                  fontWeight: 700,
                  letterSpacing: -0.2,
                }}
              >
                {chapter.title}
              </h1>
              <p
                style={{
                  fontFamily: FONT_BODY,
                  fontStyle: "italic",
                  color: INK_DIM,
                  margin: "0 0 4px",
                  fontSize: 15,
                }}
              >
                {chapter.short}
              </p>
              <AbstractCard>{chapter.abstract}</AbstractCard>

              {chapter.body()}

              <KeyTakeaway>{chapter.takeaway}</KeyTakeaway>

              {/* See Also */}
              <div
                style={{
                  marginTop: 24,
                  padding: 12,
                  border: `1px solid ${GOLD}66`,
                  backgroundColor: PAPER_LIGHT,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 10,
                    letterSpacing: 2,
                    color: GOLD_DARK,
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  ▸ See Also
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {chapter.related.map((rid) => {
                    const r = chapters.find((c) => c.id === rid);
                    if (!r) return null;
                    return (
                      <button
                        key={rid}
                        type="button"
                        onClick={() => navigate(rid)}
                        style={seeAlsoBtn}
                      >
                        Ch. {r.num} · {r.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pagination */}
              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: FONT_UI,
                  fontSize: 12,
                  color: INK_DIM,
                }}
              >
                {chapterIdx > 0 ? (
                  <button
                    type="button"
                    onClick={() => navigate(chapters[chapterIdx - 1].id)}
                    style={pageBtn}
                  >
                    ◂ {chapters[chapterIdx - 1].title}
                  </button>
                ) : <span />}
                {chapterIdx < chapters.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => navigate(chapters[chapterIdx + 1].id)}
                    style={{ ...pageBtn, textAlign: "right" }}
                  >
                    {chapters[chapterIdx + 1].title} ▸
                  </button>
                ) : <span />}
              </div>
            </article>
          </div>

          {/* STATUS BAR */}
          <div
            style={{
              padding: "5px 12px",
              background: `linear-gradient(180deg, ${PAPER_DEEP} 0%, #d5c8a4 100%)`,
              borderTop: `1px solid ${WINE_DARK}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: FONT_MONO,
              fontSize: 11,
              color: INK_DIM,
              flexWrap: "wrap",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span
                aria-hidden
                data-era-calm
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: audioOpen ? "#3aa340" : WINE,
                  boxShadow: audioOpen ? "0 0 4px #3aa340" : `0 0 4px ${WINE}`,
                  animation: "kiruk-1997-blink 1.4s ease-in-out infinite",
                }}
              />
              {audioOpen ? "PLAYING" : "READY"} · DISC IN TRAY
            </span>
            <StatusPill>
              <span
                aria-hidden
                data-era-calm
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 30% 30%, ${PAPER_LIGHT}, ${WINE_DARK})`,
                  animation: "kiruk-1997-spin 2.4s linear infinite",
                  marginRight: 4,
                  verticalAlign: -1,
                }}
              />
              4× CD-ROM
            </StatusPill>
            <StatusPill>MULTIMEDIA: ON</StatusPill>
            <span style={{ marginLeft: "auto" }}>
              CH {chapterIdx + 1}/{chapters.length}
            </span>
            <span>TRACK {String(chapterIdx + 1).padStart(2, "0")}</span>
            <span style={{ color: WINE_DARK }}>
              SESSION {elapsedMM}:{elapsedSS}
            </span>
          </div>
        </div>

        {/* Disc label foot + sticky tip */}
        <div
          style={{
            marginTop: 14,
            padding: "8px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: FONT_UI,
            fontSize: 10,
            color: "#a8957b",
            letterSpacing: 2,
            textTransform: "uppercase",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span>© KIRUK INTERACTIVE · 1997-2026</span>
          <div
            aria-hidden
            style={{
              fontFamily: "'Caveat', 'Bradley Hand', 'Comic Sans MS', cursive",
              fontSize: 13,
              color: "#1a1a0a",
              backgroundColor: "#fff89a",
              padding: "6px 12px",
              transform: "rotate(-1.5deg)",
              boxShadow: "2px 4px 6px rgba(0,0,0,0.55)",
              letterSpacing: 0,
              textTransform: "none",
              lineHeight: 1.25,
              border: "1px solid #d8c970",
            }}
          >
            tip · use <strong>←</strong> <strong>→</strong> to flip pages ·{" "}
            <strong>B</strong> bookmarks · <strong>/</strong> opens search
          </div>
          <span>For Windows 95/NT and Mac OS 7+. CD-ROM only.</span>
        </div>
      </div>

      {/* AUDIO NARRATION OVERLAY */}
      {audioOpen && (
        <AudioOverlay
          chapter={chapter}
          line={audioLine}
          progress={audioProgress}
          onClose={stopAudio}
        />
      )}
    </div>
  );
}

// ── Components ────────────────────────────────────────────────────────

function DiscIcon({ spinning = false }: { spinning?: boolean } = {}) {
  return (
    <div
      aria-hidden
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        background:
          `conic-gradient(from 0deg, ${PAPER_LIGHT}, ${GOLD}, ${WINE_DARK}, ${INK}, ${WINE}, ${GOLD}, ${PAPER_LIGHT})`,
        border: `2px solid ${WINE_DARK}`,
        position: "relative",
        boxShadow: `0 0 6px rgba(0,0,0,0.4)`,
        flexShrink: 0,
        animation: spinning ? "kiruk-1997-spin 2.4s linear infinite" : "none",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 4,
          borderRadius: "50%",
          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55) 0%, transparent 55%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 12,
          height: 12,
          marginLeft: -6,
          marginTop: -6,
          borderRadius: "50%",
          backgroundColor: WINE_DARK,
          border: `2px solid ${WINE_LIGHT}`,
        }}
      />
    </div>
  );
}

function ChromeBtn({
  children,
  onClick,
  disabled,
  title,
  active,
  emphasis,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  active?: boolean;
  emphasis?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const hi = emphasis ? GOLD : PAPER_LIGHT;
  const sh = emphasis ? GOLD_DARK : "#9e8b6c";
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      title={title}
      style={{
        padding: "4px 10px",
        backgroundColor: emphasis ? GOLD : active ? GOLD : PAPER_DEEP,
        color: INK,
        borderTop: `1px solid ${pressed ? sh : hi}`,
        borderLeft: `1px solid ${pressed ? sh : hi}`,
        borderRight: `1px solid ${pressed ? hi : sh}`,
        borderBottom: `1px solid ${pressed ? hi : sh}`,
        outline: `1px solid ${WINE_DARK}`,
        fontFamily: FONT_UI,
        fontSize: 11,
        fontWeight: emphasis ? 700 : 400,
        letterSpacing: 0.5,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transform: pressed && !disabled ? "translate(1px, 1px)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote
      style={{
        margin: "12px 0",
        padding: "10px 14px",
        borderLeft: `4px solid ${WINE}`,
        backgroundColor: PAPER_LIGHT,
        fontFamily: FONT_BODY,
        fontSize: 20,
        fontStyle: "italic",
        color: WINE,
        lineHeight: 1.35,
      }}
    >
      “{children}”
    </blockquote>
  );
}

function FirstLetter({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        float: "left",
        fontFamily: FONT_BODY,
        fontSize: 56,
        lineHeight: 0.85,
        marginRight: 8,
        marginTop: 4,
        color: WINE,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}

function SideNote({
  heading,
  children,
  tint,
}: {
  heading: string;
  children: React.ReactNode;
  tint?: string;
}) {
  return (
    <div
      style={{
        float: "right",
        clear: "right",
        width: "min(220px, 40%)",
        margin: "4px 0 12px 16px",
        padding: 10,
        border: `1px solid ${(tint ?? GOLD)}88`,
        backgroundColor: PAPER_LIGHT,
        fontFamily: FONT_UI,
        fontSize: 12,
        color: INK,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: 2,
          color: tint ?? GOLD_DARK,
          textTransform: "uppercase",
          marginBottom: 4,
          fontWeight: 700,
        }}
      >
        ◆ {heading}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Beat({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONT_UI,
        fontSize: 10,
        letterSpacing: 3,
        color: GOLD_DARK,
        textTransform: "uppercase",
        margin: "16px 0 4px",
        fontWeight: 700,
      }}
    >
      ▾ {children}
    </div>
  );
}

function Quad({
  head,
  sub,
  children,
}: {
  head: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: `1px solid ${GOLD}66`,
        padding: 10,
        backgroundColor: PAPER_LIGHT,
      }}
    >
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 15,
          fontWeight: 700,
          color: WINE,
          marginBottom: 2,
        }}
      >
        {head}
      </div>
      <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 10,
          letterSpacing: 1,
          color: MUTED,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {sub}
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: INK, lineHeight: 1.5 }}>
        {children}
      </div>
    </div>
  );
}

function BulletList({
  items,
  marker = "·",
  tint,
}: {
  items: readonly string[];
  marker?: string;
  tint?: string;
}) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {items.map((it) => (
        <li
          key={it}
          style={{
            display: "flex",
            gap: 6,
            alignItems: "baseline",
            fontSize: 13,
            color: INK,
            marginBottom: 3,
          }}
        >
          <span style={{ color: tint ?? GOLD_DARK }}>{marker}</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <tr>
      <td style={{ ...td, fontWeight: 700, backgroundColor: PAPER_DEEP, width: 130 }}>
        {k}
      </td>
      <td style={td}>{children}</td>
    </tr>
  );
}

// ── Multimedia pill — chapter media-type tag (Encarta hallmark) ────────

const MEDIA_META: Record<MediaKind, { icon: string; label: string }> = {
  text:     { icon: "▤", label: "Text" },
  audio:    { icon: "♫", label: "Audio" },
  plate:    { icon: "❖", label: "Plate" },
  table:    { icon: "⊞", label: "Table" },
  timeline: { icon: "⟶", label: "Timeline" },
  index:    { icon: "❡", label: "Index" },
};

function MediaPill({ kind, dim }: { kind: MediaKind; dim?: boolean }) {
  const m = MEDIA_META[kind];
  return (
    <span
      title={m.label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: "1px 6px",
        fontFamily: FONT_UI,
        fontSize: 9,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: dim ? MUTED : WINE_DARK,
        backgroundColor: dim ? "transparent" : PAPER_DEEP,
        border: `1px solid ${dim ? MUTED : WINE_DARK}55`,
      }}
    >
      <span aria-hidden style={{ color: dim ? MUTED : GOLD_DARK }}>
        {m.icon}
      </span>
      {m.label}
    </span>
  );
}

// ── AbstractCard — single-line question this chapter answers ───────────

function AbstractCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        margin: "0 0 14px",
        padding: "8px 14px",
        backgroundColor: PAPER_LIGHT,
        borderLeft: `3px solid ${WINE}`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 9,
          letterSpacing: 2,
          color: GOLD_DARK,
          textTransform: "uppercase",
        }}
      >
        The Question
      </div>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 15,
          color: INK,
          lineHeight: 1.4,
          fontStyle: "italic",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── KeyTakeaway — closing one-line insight ─────────────────────────────

function KeyTakeaway({ children }: { children: React.ReactNode }) {
  return (
    <aside
      style={{
        clear: "both",
        margin: "18px 0 0",
        padding: "10px 14px",
        backgroundColor: WINE_DARK,
        color: PAPER_LIGHT,
        borderLeft: `4px solid ${GOLD}`,
        boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 9,
          letterSpacing: 3,
          color: GOLD,
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: 3,
        }}
      >
        ▶ Key Takeaway
      </div>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 15,
          lineHeight: 1.5,
          color: PAPER_LIGHT,
          fontStyle: "italic",
        }}
      >
        {children}
      </div>
    </aside>
  );
}

// ── Hotspot — inline glossary term with hover definition ───────────────

function Hotspot({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <span className="kiruk-1997-hotspot">
      {term}
      <span className="kiruk-1997-tip">{children}</span>
    </span>
  );
}

// ── Status pill (toolbar / status bar) ─────────────────────────────────

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: "1px 6px",
        backgroundColor: PAPER,
        border: `1px solid ${WINE_DARK}55`,
        boxShadow: "inset 1px 1px 0 #fff",
        fontFamily: FONT_MONO,
        fontSize: 10,
        letterSpacing: 0.5,
        color: WINE_DARK,
      }}
    >
      {children}
    </span>
  );
}

// ── Boot splash — CD-ROM disc-mount sequence ───────────────────────────

function BootSplash({ progress }: { progress: number }) {
  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        backgroundColor: DESK,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.4'/></svg>\")",
          opacity: 0.08,
          mixBlendMode: "overlay",
        }}
      />
      <div
        style={{
          width: "min(440px, 100%)",
          textAlign: "center",
          color: PAPER_LIGHT,
          fontFamily: FONT_UI,
          position: "relative",
        }}
      >
        <div
          aria-hidden
          style={{
            width: 84,
            height: 84,
            margin: "0 auto 14px",
            borderRadius: "50%",
            background:
              `conic-gradient(from 0deg, ${PAPER_LIGHT}, ${GOLD}, ${WINE_DARK}, ${INK}, ${WINE}, ${GOLD}, ${PAPER_LIGHT})`,
            border: `2px solid ${WINE_DARK}`,
            boxShadow: "0 0 30px rgba(184,148,28,0.45)",
            animation: "kiruk-1997-spin 1.6s linear infinite",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "42% 42%",
              backgroundColor: WINE_DARK,
              border: `2px solid ${WINE_LIGHT}`,
              borderRadius: "50%",
            }}
          />
        </div>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 22,
            fontStyle: "italic",
            fontWeight: 700,
            letterSpacing: 0.5,
            color: PAPER,
          }}
        >
          Kiruk <span style={{ color: GOLD }}>·</span> A Practitioner Profile
        </div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 3,
            color: GOLD,
            textTransform: "uppercase",
            marginTop: 4,
          }}
        >
          Interactive Multimedia Edition · 1997
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: FONT_MONO,
            fontSize: 11,
            color: PAPER_DEEP,
            letterSpacing: 1,
            opacity: 0.85,
          }}
        >
          MOUNTING DISC 1 · READING TABLE OF CONTENTS · LOADING NARRATION TRACK
        </div>
        <div
          style={{
            marginTop: 14,
            height: 10,
            backgroundColor: WINE_DARK,
            border: `1px solid ${GOLD_DARK}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: `${Math.round(progress)}%`,
              background:
                `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_DARK} 100%)`,
              transition: "width 100ms linear",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)`,
              backgroundSize: "200px 100%",
              animation: "kiruk-1997-boot-shimmer 1.4s linear infinite",
              mixBlendMode: "screen",
              opacity: 0.7,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 6,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: MUTED,
            letterSpacing: 1,
          }}
        >
          <span>{Math.round(progress)}%</span>
          <span>650 MB / 650 MB</span>
        </div>
      </div>
    </div>
  );
}

// ── Audio narration overlay ────────────────────────────────────────────

function AudioOverlay({
  chapter,
  line,
  progress,
  onClose,
}: {
  chapter: Chapter;
  line: number;
  progress: number;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(580px, 100%)",
          backgroundColor: PAPER,
          border: `2px solid ${WINE_DARK}`,
          boxShadow: `4px 6px 0 rgba(0,0,0,0.55)`,
          color: INK,
          fontFamily: FONT_UI,
        }}
      >
        <div
          style={{
            padding: "8px 14px",
            background: `linear-gradient(180deg, ${WINE_LIGHT} 0%, ${WINE} 100%)`,
            color: PAPER_LIGHT,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <span>♫ Audio Narration · Chapter {chapter.num}</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: PAPER_DEEP,
              border: `1px solid ${WINE_DARK}`,
              color: INK,
              fontFamily: FONT_UI,
              fontSize: 10,
              letterSpacing: 1,
              padding: "2px 8px",
              cursor: "pointer",
            }}
          >
            ✕ STOP
          </button>
        </div>
        <div style={{ padding: "14px 18px 16px" }}>
          <h3
            style={{
              fontFamily: FONT_BODY,
              fontSize: 18,
              fontWeight: 700,
              margin: "0 0 12px",
              color: INK,
            }}
          >
            {chapter.title}
          </h3>

          {/* Transcript karaoke */}
          <ol
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              minHeight: 150,
              fontFamily: FONT_BODY,
              fontSize: 15,
              lineHeight: 1.6,
            }}
          >
            {chapter.narration.map((ln, i) => {
              const past = i < line;
              const here = i === line;
              return (
                <li
                  key={i}
                  style={{
                    color: past ? MUTED : here ? WINE : INK_DIM,
                    fontStyle: here ? "normal" : past ? "italic" : "normal",
                    opacity: past ? 0.6 : here ? 1 : 0.85,
                    marginBottom: 2,
                    transition: "color 200ms",
                  }}
                >
                  {here && <span style={{ color: GOLD, marginRight: 6 }}>▶</span>}
                  {ln}
                </li>
              );
            })}
          </ol>

          {/* Scrubber */}
          <div
            aria-hidden
            style={{
              marginTop: 14,
              height: 8,
              backgroundColor: PAPER_DEEP,
              border: `1px solid ${WINE_DARK}`,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: `${Math.round(progress * 100)}%`,
                background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_DARK} 100%)`,
              }}
            />
          </div>
          <div
            style={{
              marginTop: 4,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: FONT_MONO,
              fontSize: 11,
              color: MUTED,
            }}
          >
            <span>00:00</span>
            <span>
              {String(Math.floor(progress * chapter.narration.length * 1.4))
                .padStart(2, "0")}
              :
              {String(
                Math.floor((progress * chapter.narration.length * 1.4 * 60) % 60),
              ).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────

const p: React.CSSProperties = {
  margin: "0 0 12px",
  textAlign: "justify",
  hyphens: "auto",
};

const tbl: React.CSSProperties = {
  borderCollapse: "collapse",
  border: `1px solid ${MUTED}`,
  width: "100%",
  marginBottom: 12,
  fontFamily: FONT_BODY,
  fontSize: 14,
};

const td: React.CSSProperties = {
  border: `1px solid ${MUTED}55`,
  padding: "5px 8px",
  verticalAlign: "top",
};

const bq: React.CSSProperties = {
  borderLeft: `3px solid ${GOLD}`,
  paddingLeft: 12,
  margin: "0 0 12px",
  fontStyle: "italic",
  color: WINE,
  fontSize: 16,
};

const inlineLink: React.CSSProperties = {
  color: WINE,
  textDecoration: "underline",
};

const seeAlsoBtn: React.CSSProperties = {
  padding: "4px 10px",
  fontFamily: FONT_UI,
  fontSize: 11,
  letterSpacing: 0.5,
  backgroundColor: PAPER,
  color: WINE,
  border: `1px solid ${GOLD}aa`,
  cursor: "pointer",
  textDecoration: "underline",
};

const pageBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: WINE,
  fontFamily: FONT_BODY,
  fontSize: 13,
  fontStyle: "italic",
  cursor: "pointer",
  padding: 0,
  textDecoration: "underline",
};

const searchClose: React.CSSProperties = {
  background: "transparent",
  border: `1px solid ${WINE}`,
  color: WINE,
  fontFamily: FONT_UI,
  fontSize: 11,
  padding: "2px 8px",
  cursor: "pointer",
};

export default FramesetHomePage;
