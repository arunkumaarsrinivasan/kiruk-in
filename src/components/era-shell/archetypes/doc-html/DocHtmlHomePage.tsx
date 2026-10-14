"use client";

/**
 * DocHtmlHomePage — 1991 archetype home rendered as an early-web
 * academic document.
 *
 * Voice: CERN-era hypertext paper. Black on white. Times New Roman.
 * Blue underlined links. Visited links go purple and persist for the
 * session. <hr> rules between sections. Numbered, anchored sections.
 * Cross-references between sections are clickable hyperlinks — the
 * "hypertext was the revolution" thesis of the era.
 *
 * Unique 1991 interactions:
 *   - hover any link → bottom status bar prints the URL/anchor (NCSA Mosaic feel)
 *   - clicking a link records it as visited (purple), persisted in sessionStorage
 *   - "View page source" button toggles a raw-markup-style overlay
 *   - visitor counter ticks up on mount
 *   - "back to top" link at every section + at the end
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EraStoryBox } from "@/components/about-story/EraStoryBox";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import {
  WHY_KIRUK,
  EMPATHY_MAP,
  buildTimeline,
  IMPACT_METRICS,
  CARD_SORTING,
  USABILITY_TEST,
} from "@/data/era-page-content";

const TEXT = "#000000";
const MUTED = "#444444";
const SOFT = "#777777";
const BG = "#ffffff";
const LINK = "#0000ee";
const VISITED = "#551a8b";
const ACTIVE = "#bb0000";

const FONT_SERIF =
  "'Times New Roman', 'Iowan Old Style', Georgia, serif";
const FONT_MONO = "'Courier New', 'Courier', monospace";

const SECTIONS = [
  { id: "why",       num: "1.", title: "Why: A Bridge Between Crafts" },
  { id: "persona",   num: "2.", title: "About the Author" },
  { id: "empathy",   num: "3.", title: "An Empathy Map" },
  { id: "journey",   num: "4.", title: "Career Path — A Hypertext Trail" },
  { id: "impact",    num: "5.", title: "Quantified Impact" },
  { id: "cards",     num: "6.", title: "Card Sort: The Work, Indexed" },
  { id: "usability", num: "7.", title: "Usability — Test the Connection" },
  { id: "bibliography", num: "*", title: "Bibliography & Notes" },
] as const;

interface Footnote {
  n: number;
  body: string;
  href?: string;
}

const FOOTNOTES: Footnote[] = [
  {
    n: 1,
    body:
      'HP Print AI — Sreenivasan, A. (2023–2026). Co-shipped the industry-first intelligent print experience. Email/webmail print workflows in Spring Boot + Node, mobile-first Flutter onboarding, AI Stack design system used by 500+ HP employees, Splunk observability across 7+ microservices.',
    href: "https://www.hp.com/us-en/printers/ai-printers.html",
  },
  {
    n: 2,
    body:
      'SquareBridge / SNS Square — Sreenivasan, A. (2023–24). Freelance design lead for student-recruitment platform. Research sprints, design system, async storytelling via Loom for engineering handoff.',
  },
  {
    n: 3,
    body:
      'PeopleGamez — Sreenivasan, A. (2022–23). Interaction design intern. Gamified loops in FigJam + Notion, weekly critique jams, remote feedback rituals.',
  },
  {
    n: 4,
    body:
      'Kirukism — Sreenivasan, A. (2018–present). Personal process journals + sketches @kirukism. Evening scribbles, motion experiments, era-design notes that fed this very document.',
    href: "https://instagram.com/kirukism",
  },
  {
    n: 5,
    body:
      'Sona College of Technology — Sreenivasan, A. (2019–22). Campus cultural design lead, website redesign, medical-incubation app UX. CS by day, sketch critiques by night.',
  },
  {
    n: 6,
    body:
      'Family studio, Salem — Sreenivasan, A. (2001–18). Joint family of 30 — crochet, calligraphy, murals, ERP testing for biryani rewards. The earliest record of working at the design ↔ engineering bridge.',
  },
];

// ── Visited-link tracking ──────────────────────────────────────────────
function useVisited() {
  const [visited, setVisited] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kiruk-1991-visited");
      if (raw) setVisited(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* noop */
    }
  }, []);
  const mark = useCallback((href: string) => {
    setVisited((prev) => {
      if (prev.has(href)) return prev;
      const next = new Set(prev);
      next.add(href);
      try {
        sessionStorage.setItem(
          "kiruk-1991-visited",
          JSON.stringify(Array.from(next)),
        );
      } catch {
        /* noop */
      }
      return next;
    });
  }, []);
  return { visited, mark };
}

interface TrailEntry {
  href: string;
  label: string;
  time: string;
}

export function DocHtmlHomePage() {
  const { setLayoutMode } = useLayoutMode();
  const { visited, mark } = useVisited();
  const [hoverUrl, setHoverUrl] = useState<string>("");
  const [showSource, setShowSource] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [visitors, setVisitors] = useState<number>(0);
  const [trail, setTrail] = useState<TrailEntry[]>([]);
  const [activeSection, setActiveSection] = useState<string>("top");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Wrap mark() to also push into hypertext trail
  const trailMark = useCallback(
    (href: string, label?: string) => {
      mark(href);
      const ts = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setTrail((prev) => {
        const next = [{ href, label: label || href, time: ts }, ...prev];
        return next.slice(0, 6);
      });
    },
    [mark],
  );

  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);

  // Visitor counter — increments on mount, persists between visits in session
  useEffect(() => {
    try {
      const base = 42 + Math.floor((Date.now() / 8.64e7) % 1000);
      const raw = sessionStorage.getItem("kiruk-1991-visitor");
      const start = raw ? parseInt(raw, 10) : base;
      const target = start + 1;
      sessionStorage.setItem("kiruk-1991-visitor", String(target));
      // animate up
      let v = Math.max(0, target - 7);
      setVisitors(v);
      const id = window.setInterval(() => {
        v += 1;
        if (v >= target) {
          setVisitors(target);
          window.clearInterval(id);
        } else {
          setVisitors(v);
        }
      }, 90);
      return () => window.clearInterval(id);
    } catch {
      setVisitors(42);
    }
  }, []);

  const lastModified = useMemo(
    () =>
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  const nodes = useMemo(buildTimeline, []);

  // ── Active section tracking (drives the KIRUK:// console prompt) ──
  useEffect(() => {
    const onScroll = () => {
      const center = window.scrollY + window.innerHeight * 0.35;
      let current = "top";
      for (const s of SECTIONS) {
        const el = sectionRefs.current[s.id];
        if (!el) continue;
        if (el.offsetTop <= center) current = s.id;
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const sectionIds: string[] = ["top", ...SECTIONS.map((s) => s.id)];
    const goTo = (id: string) => {
      const el =
        id === "top"
          ? document.getElementById("top")
          : sectionRefs.current[id];
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "?") {
        e.preventDefault();
        setShowHelp((s) => !s);
        return;
      }
      if (k === "t") {
        e.preventDefault();
        goTo("top");
        return;
      }
      if (k === "g") {
        e.preventDefault();
        // jump to TOC by scrolling to top (TOC is at top)
        goTo("top");
        return;
      }
      if (k === "b") {
        e.preventDefault();
        goTo("bibliography");
        return;
      }
      if (k === "v") {
        e.preventDefault();
        setShowSource((s) => !s);
        return;
      }
      if (k === "j" || k === "arrowdown") {
        e.preventDefault();
        const idx = sectionIds.indexOf(activeSection);
        const next = sectionIds[Math.min(sectionIds.length - 1, idx + 1)];
        goTo(next);
        return;
      }
      if (k === "k" || k === "arrowup") {
        e.preventDefault();
        const idx = sectionIds.indexOf(activeSection);
        const next = sectionIds[Math.max(0, idx - 1)];
        goTo(next);
        return;
      }
      if (k === "escape") {
        if (showHelp) setShowHelp(false);
        if (showSource) setShowSource(false);
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeSection, showHelp, showSource]);

  const activeSectionMeta = useMemo(
    () => SECTIONS.find((s) => s.id === activeSection),
    [activeSection],
  );

  const setSectionRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  return (
    <div
      id="doc-html-home"
      style={{
        backgroundColor: BG,
        color: TEXT,
        fontFamily: FONT_SERIF,
        paddingTop: "calc(var(--simple-game-nav-bottom, 56px) + 24px)",
        paddingBottom: 80,
        minHeight: "100vh",
        lineHeight: 1.6,
      }}
    >
      <article
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "0 24px",
          fontSize: 16,
        }}
      >
        {/* ── Document header ─────────────────────────────────────── */}
        <header id="top">
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              color: SOFT,
              margin: 0,
              letterSpacing: 0.5,
            }}
          >
            kiruk-research.cern.ch / DOC-001 / HTML 1.0
          </p>
          <h1
            style={{
              fontSize: "clamp(28px, 4.6vw, 44px)",
              fontWeight: 700,
              margin: "8px 0 6px",
              lineHeight: 1.1,
            }}
          >
            Kiruk — A Design Engineer on Record.
          </h1>
          <p
            style={{
              fontStyle: "italic",
              color: MUTED,
              margin: "0 0 4px",
              fontSize: 17,
            }}
          >
            Field notes on Arun Kumaar Sreenivasan, working at the
            design-engineering bridge, now co-founder and design lead at Spera.
          </p>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: 12,
              color: SOFT,
              margin: 0,
            }}
          >
            By <Anchor href="#about" mark={trailMark} visited={visited} setHoverUrl={setHoverUrl}>The Author</Anchor>
            {" · "}First published 1991 · Revised {lastModified}.
          </p>
          <Rule />
        </header>

        {/* ── Abstract ───────────────────────────────────────────── */}
        <section>
          <h2 style={h2}>Abstract</h2>
          <p style={p}>
            This document is a hypertext file describing a single
            practitioner. It treats Arun-the-designer as the user of his
            own study — applying classical UX research artifacts to his
            way of working. Seven sections follow, each cross-linked.
            Hyperlinks are <em>blue and underlined</em>; once followed,
            they shift to <span style={{ color: VISITED }}>purple</span>{" "}
            and stay there for this session.
          </p>
        </section>

        <Rule />

        {/* ── Contents (table of contents) ───────────────────────── */}
        <section aria-label="Table of contents">
          <h2 style={h2}>On this page</h2>
          <ol style={{ paddingLeft: 24, margin: 0 }}>
            {SECTIONS.map((s) => (
              <li key={s.id} style={{ marginBottom: 2 }}>
                <Anchor
                  href={`#${s.id}`}
                  mark={(h) => trailMark(h, `${s.num} ${s.title}`)}
                  visited={visited}
                  setHoverUrl={setHoverUrl}
                >
                  {s.num} {s.title}
                </Anchor>
              </li>
            ))}
          </ol>
          <p style={{ ...p, fontFamily: FONT_MONO, fontSize: 12, color: SOFT, marginTop: 12 }}>
            Outbound: <Link href="/portfolio" mark={trailMark} visited={visited} setHoverUrl={setHoverUrl}>portfolio</Link>
            {" · "}
            <Link href="/work" mark={trailMark} visited={visited} setHoverUrl={setHoverUrl}>shipped projects</Link>
            {" · "}
            <Link href="/work" mark={trailMark} visited={visited} setHoverUrl={setHoverUrl}>work</Link>
            {" · "}
            <Link href="/notebook" mark={trailMark} visited={visited} setHoverUrl={setHoverUrl}>notebook</Link>
            {" · "}
            <Link href="/contact" mark={trailMark} visited={visited} setHoverUrl={setHoverUrl}>contact</Link>.
          </p>
        </section>

        <Rule />

        {/* ── 1 WHY ─────────────────────────────────────────────── */}
        <section id="why" ref={setSectionRef("why")}>
          <h2 style={h2}>1. Why: A Bridge Between Crafts</h2>
          <p style={p}>
            <strong>{WHY_KIRUK.hook}</strong> When strategy, design and
            code live on separate processes, intent and speed both
            degrade. The subject of this study collapses the three into
            a single workflow — translating vision into production UI,
            design systems and measurable outcomes<Sup n={1} setHoverUrl={setHoverUrl} />
            , and recently the same approach in freelance design system work<Sup n={2} setHoverUrl={setHoverUrl} />.
          </p>
          <p style={p}>
            <em>{WHY_KIRUK.tagline}</em>
          </p>
          <BackToTop mark={trailMark} visited={visited} setHoverUrl={setHoverUrl} />
        </section>

        <Rule />

        {/* ── 2 PERSONA ─────────────────────────────────────────── */}
        <section id="persona" ref={setSectionRef("persona")}>
          <h2 style={h2}>2. About the Author</h2>
          <EraStoryBox />
          <BackToTop mark={trailMark} visited={visited} setHoverUrl={setHoverUrl} />
        </section>

        <Rule />

        {/* ── 3 EMPATHY ─────────────────────────────────────────── */}
        <section id="empathy" ref={setSectionRef("empathy")}>
          <h2 style={h2}>3. An Empathy Map</h2>
          <p style={p}>
            What the subject <em>says</em>, <em>thinks</em>,{" "}
            <em>does</em> and <em>feels</em>. See also{" "}
            <Anchor href="#persona" mark={trailMark} visited={visited} setHoverUrl={setHoverUrl}>section 2</Anchor>{" "}
            for grounding and{" "}
            <Anchor href="#impact" mark={trailMark} visited={visited} setHoverUrl={setHoverUrl}>section 5</Anchor>{" "}
            for receipts.
          </p>

          <h3 style={h3}>3.a Says</h3>
          <blockquote style={blockquote}>
            “{EMPATHY_MAP.says.quote}”
          </blockquote>
          <ul style={ul}>
            {EMPATHY_MAP.says.skills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <h3 style={h3}>3.b Thinks</h3>
          <ul style={ul}>
            {EMPATHY_MAP.thinks.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <h3 style={h3}>3.c Does (stack in rotation)</h3>
          <p style={{ ...p, fontFamily: FONT_MONO, fontSize: 14, color: TEXT }}>
            {EMPATHY_MAP.does.join(" · ")}
          </p>

          <h3 style={h3}>3.d Feels</h3>
          <ul style={ul}>
            {EMPATHY_MAP.feels.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <BackToTop mark={trailMark} visited={visited} setHoverUrl={setHoverUrl} />
        </section>

        <Rule />

        {/* ── 4 JOURNEY — hypertext trail of years ────────────── */}
        <section id="journey" ref={setSectionRef("journey")}>
          <h2 style={h2}>4. Career Path — A Hypertext Trail</h2>
          <p style={p}>
            The subject's working years, in order. Each year is a node,
            each transition a hyperlink to the next. Hovering a year
            prints the destination on the status bar at the foot of
            this page.
          </p>

          <dl style={dl}>
            {nodes.map((n, i) => {
              const nextNode = nodes[i + 1];
              return (
                <React.Fragment key={n.year}>
                  <dt style={{ ...dt, fontFamily: FONT_MONO }}>
                    <strong>{n.year}</strong>
                    {n.live && <span style={{ color: ACTIVE, marginLeft: 8, fontFamily: FONT_SERIF, fontStyle: "italic" }}>(current)</span>}
                  </dt>
                  <dd style={dd}>
                    <strong>{n.position}</strong>
                    {" — "}
                    <em>{n.phase}</em>
                    {" @ "}
                    {n.org}
                    {". "}
                    {n.detail}
                    {nextNode && (
                      <>
                        {" "}
                        <Anchor
                          href={`#year-${nextNode.year}`}
                          mark={trailMark}
                          visited={visited}
                          setHoverUrl={setHoverUrl}
                          onClick={(e) => {
                            e.preventDefault();
                            const el = document.getElementById(`year-${nextNode.year}`);
                            el?.scrollIntoView({ behavior: "smooth", block: "center" });
                          }}
                        >
                          → next: {nextNode.year}
                        </Anchor>
                      </>
                    )}
                    <span id={`year-${n.year}`} aria-hidden style={{ display: "block", height: 0 }} />
                  </dd>
                </React.Fragment>
              );
            })}
          </dl>
          <BackToTop mark={trailMark} visited={visited} setHoverUrl={setHoverUrl} />
        </section>

        <Rule />

        {/* ── 5 IMPACT — HTML table ─────────────────────────────── */}
        <section id="impact" ref={setSectionRef("impact")}>
          <h2 style={h2}>5. Quantified Impact</h2>
          <p style={p}>
            Outcome metrics, raw values. Cross-reference{" "}
            <Anchor href="#cards" mark={trailMark} visited={visited} setHoverUrl={setHoverUrl}>section 6 — Card Sort</Anchor>{" "}
            for the projects these numbers cite.
          </p>

          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              fontSize: 14,
              marginTop: 6,
            }}
          >
            <thead>
              <tr>
                <th style={th}>Metric</th>
                <th style={th}>Value</th>
                <th style={th}>Category</th>
                <th style={th}>Note</th>
              </tr>
            </thead>
            <tbody>
              {IMPACT_METRICS.slice(0, 8).map((m) => (
                <tr key={m.id}>
                  <td style={td}>
                    <span aria-hidden style={{ marginRight: 4 }}>
                      {m.icon}
                    </span>
                    {m.label}
                  </td>
                  <td style={{ ...td, fontFamily: FONT_MONO, fontWeight: 700 }}>
                    {m.value}
                  </td>
                  <td style={{ ...td, fontStyle: "italic", color: MUTED }}>
                    {m.category}
                  </td>
                  <td style={{ ...td, color: MUTED, fontSize: 13 }}>
                    {m.context ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <BackToTop mark={trailMark} visited={visited} setHoverUrl={setHoverUrl} />
        </section>

        <Rule />

        {/* ── 6 CARDS ───────────────────────────────────────────── */}
        <section id="cards" ref={setSectionRef("cards")}>
          <h2 style={h2}>6. Card Sort: The Work, Indexed</h2>
          <p style={p}>
            Projects sorted by taxonomy. The unfiltered set is below;
            see{" "}
            <Link href="/portfolio" mark={trailMark} visited={visited} setHoverUrl={setHoverUrl}>
              portfolio
            </Link>{" "}
            for the full archive.
          </p>
          <p style={{ ...p, fontFamily: FONT_MONO, fontSize: 12, color: SOFT }}>
            taxonomy ▸ {CARD_SORTING.taxonomy.join(" · ")}
          </p>

          <ol style={{ paddingLeft: 24, margin: 0 }}>
            {CARD_SORTING.projects.map((p) => (
              <li key={p.id} style={{ marginBottom: 14 }}>
                <strong>{p.title}</strong>{" "}
                <span style={{ color: MUTED, fontStyle: "italic" }}>
                  ({p.category}, {p.duration})
                </span>
                <br />
                {p.description}
                <br />
                <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: SOFT }}>
                  tech: {p.technologies.join(", ")}
                </span>
              </li>
            ))}
          </ol>
          <BackToTop mark={trailMark} visited={visited} setHoverUrl={setHoverUrl} />
        </section>

        <Rule />

        {/* ── 7 USABILITY ───────────────────────────────────────── */}
        <section id="usability" ref={setSectionRef("usability")}>
          <h2 style={h2}>7. Usability — Test the Connection</h2>
          <p style={p}>
            <strong>Task.</strong> {USABILITY_TEST.task}.{" "}
            {USABILITY_TEST.taskBody}
          </p>

          <h3 style={h3}>7.a Success metrics</h3>
          <ul style={ul}>
            {USABILITY_TEST.successMetrics.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>

          <h3 style={h3}>7.b Channels</h3>
          <dl style={dl}>
            {USABILITY_TEST.channels.map((c) => (
              <React.Fragment key={c.label}>
                <dt style={dt}>{c.label}</dt>
                <dd style={dd}>
                  <Link
                    href={c.href}
                    external={c.href.startsWith("http")}
                    mark={trailMark}
                    visited={visited}
                    setHoverUrl={setHoverUrl}
                  >
                    {c.value}
                  </Link>
                  {" — "}
                  <em>{c.role}</em>
                </dd>
              </React.Fragment>
            ))}
          </dl>
          <BackToTop mark={trailMark} visited={visited} setHoverUrl={setHoverUrl} />
        </section>

        <Rule />

        {/* ── Bibliography & Notes ──────────────────────────────── */}
        <section id="bibliography" ref={setSectionRef("bibliography")}>
          <h2 style={h2}>* Bibliography &amp; Notes</h2>
          <p style={p}>
            Sources and references cited by superscript above. Each
            entry links back to the spot where the citation appeared.
          </p>
          <ol style={{ paddingLeft: 24, margin: "0 0 12px" }}>
            {FOOTNOTES.map((fn) => (
              <li
                key={fn.n}
                id={`fn-${fn.n}`}
                style={{ marginBottom: 6, fontSize: 14, lineHeight: 1.55 }}
              >
                {fn.href ? (
                  <Link
                    href={fn.href}
                    external
                    mark={trailMark}
                    visited={visited}
                    setHoverUrl={setHoverUrl}
                  >
                    {fn.body}
                  </Link>
                ) : (
                  fn.body
                )}
                {" "}
                <a
                  href={`#fnref-${fn.n}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(`fnref-${fn.n}`);
                    el?.scrollIntoView({ behavior: "smooth", block: "center" });
                    el?.classList.add("doc-html-flash");
                    window.setTimeout(
                      () => el?.classList.remove("doc-html-flash"),
                      900,
                    );
                  }}
                  onMouseEnter={() => setHoverUrl(`#fnref-${fn.n}`)}
                  onMouseLeave={() => setHoverUrl("")}
                  style={{
                    color: LINK,
                    textDecoration: "underline",
                    marginLeft: 4,
                  }}
                  aria-label={`Back to citation ${fn.n}`}
                >
                  ↩
                </a>
              </li>
            ))}
          </ol>
          <BackToTop mark={trailMark} visited={visited} setHoverUrl={setHoverUrl} />
        </section>

        <Rule double />

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer>
          <address
            style={{
              fontStyle: "normal",
              fontFamily: FONT_MONO,
              fontSize: 12,
              color: SOFT,
              lineHeight: 1.7,
            }}
          >
            <div>
              Page hosted on{" "}
              <Anchor
                href="#top"
                mark={trailMark}
                visited={visited}
                setHoverUrl={setHoverUrl}
              >
                kiruk-research.cern.ch
              </Anchor>
              .
            </div>
            <div>
              Visitors: <strong style={{ color: TEXT }}>
                {String(visitors).padStart(5, "0")}
              </strong>
            </div>
            <div>Last modified: {lastModified}.</div>
            <div>
              Best viewed in <em>NCSA Mosaic</em>. This page conforms to
              HTML 1.0.
            </div>
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowSource(true)}
                style={linkBtn}
                onMouseEnter={() => setHoverUrl("javascript:viewSource()")}
                onMouseLeave={() => setHoverUrl("")}
              >
                view page source
              </button>
              {" · "}
              <Anchor
                href="#top"
                mark={trailMark}
                visited={visited}
                setHoverUrl={setHoverUrl}
              >
                back to top
              </Anchor>
            </div>
          </address>
        </footer>
      </article>

      {/* ── Hypertext Console (CLI sticky just under nav) ──────── */}
      <HypertextConsole
        activeSection={activeSectionMeta}
        onJump={(id) => {
          const el =
            id === "top"
              ? document.getElementById("top")
              : sectionRefs.current[id];
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        trail={trail}
        onClearTrail={() => setTrail([])}
        onMail={() =>
          (window.location.href = "mailto:arunkumaar.srinivasan@gmail.com")
        }
        onCite={(n) => {
          const el = document.getElementById(`fn-${n}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          el?.classList.add("doc-html-flash");
          window.setTimeout(
            () => el?.classList.remove("doc-html-flash"),
            900,
          );
        }}
      />

      {/* ── Hypertext trail sidebar ─────────────────────────────── */}
      <HypertextTrail trail={trail} onClear={() => setTrail([])} />

      {/* ── Keyboard help (toggle via ?) ────────────────────────── */}
      {showHelp && (
        <KeyboardHelp onClose={() => setShowHelp(false)} />
      )}

      {/* Citation flash style — injected once */}
      <style jsx global>{`
        .doc-html-flash {
          background-color: #fff399;
          transition: background-color 0.9s ease-out;
        }
      `}</style>

      {/* ── NCSA-style hover status bar ─────────────────────────── */}
      <div
        style={{
          position: "fixed",
          insetInline: 0,
          bottom: "var(--eye-lid-bottom, 0px)",
          padding: "4px 12px",
          borderTop: `1px solid ${TEXT}`,
          backgroundColor: "#f0f0f0",
          fontFamily: FONT_MONO,
          fontSize: 12,
          color: TEXT,
          minHeight: 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
          zIndex: 60,
        }}
      >
        <span style={{ color: SOFT }}>NCSA Mosaic 1.0 ◂</span>
        <span style={{ flex: 1, color: hoverUrl ? TEXT : SOFT }}>
          {hoverUrl || "Document: Done."}
        </span>
        <span style={{ color: SOFT }}>● link ready</span>
      </div>

      {/* ── View source overlay ────────────────────────────────── */}
      {showSource && (
        <ViewSourceOverlay onClose={() => setShowSource(false)} />
      )}
    </div>
  );
}

// ─── Tiny HTML-style primitives ────────────────────────────────────────

const h2: React.CSSProperties = {
  fontSize: "clamp(20px, 2.6vw, 26px)",
  fontWeight: 700,
  margin: "20px 0 8px",
  lineHeight: 1.25,
};

const h3: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  fontStyle: "italic",
  margin: "18px 0 6px",
};

const p: React.CSSProperties = {
  margin: "0 0 12px",
  textAlign: "justify",
  textJustify: "inter-word",
  hyphens: "auto",
};

const ul: React.CSSProperties = {
  paddingLeft: 24,
  margin: "0 0 12px",
  listStyleType: "disc",
};

const dl: React.CSSProperties = {
  margin: "0 0 12px",
  display: "grid",
  gridTemplateColumns: "minmax(120px, max-content) 1fr",
  columnGap: 16,
  rowGap: 4,
};

const dt: React.CSSProperties = {
  fontWeight: 700,
};

const dd: React.CSSProperties = {
  margin: 0,
};

const blockquote: React.CSSProperties = {
  borderLeft: `3px solid ${TEXT}`,
  paddingLeft: 12,
  margin: "0 0 12px",
  fontStyle: "italic",
  color: TEXT,
};

const th: React.CSSProperties = {
  borderBottom: `2px solid ${TEXT}`,
  textAlign: "left",
  padding: "4px 6px",
  fontWeight: 700,
};

const td: React.CSSProperties = {
  borderBottom: `1px solid ${MUTED}`,
  padding: "4px 6px",
  verticalAlign: "top",
};

const linkBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  padding: 0,
  color: LINK,
  textDecoration: "underline",
  cursor: "pointer",
  fontFamily: FONT_MONO,
  fontSize: 12,
};

function Rule({ double }: { double?: boolean }) {
  return (
    <hr
      style={{
        border: "none",
        borderTop: `1px solid ${TEXT}`,
        borderBottom: double ? `1px solid ${TEXT}` : undefined,
        height: double ? 3 : 1,
        margin: "20px 0",
        backgroundColor: "transparent",
      }}
    />
  );
}

function BackToTop({
  mark,
  visited,
  setHoverUrl,
}: {
  mark: (h: string) => void;
  visited: Set<string>;
  setHoverUrl: (s: string) => void;
}) {
  return (
    <p
      style={{
        fontFamily: FONT_MONO,
        fontSize: 12,
        color: SOFT,
        margin: "6px 0 0",
      }}
    >
      [{" "}
      <Anchor href="#top" mark={mark} visited={visited} setHoverUrl={setHoverUrl}>
        back to top
      </Anchor>
      {" "}]
    </p>
  );
}

// ─── Link primitives with visited tracking + status-bar hover ──────────

function Link({
  href,
  children,
  external,
  mark,
  visited,
  setHoverUrl,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  mark: (h: string) => void;
  visited: Set<string>;
  setHoverUrl: (s: string) => void;
}) {
  const isVisited = visited.has(href);
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={() => mark(href)}
      onMouseEnter={() => setHoverUrl(href)}
      onMouseLeave={() => setHoverUrl("")}
      style={{
        color: isVisited ? VISITED : LINK,
        textDecoration: "underline",
      }}
    >
      {children}
    </a>
  );
}

function Anchor({
  href,
  children,
  mark,
  visited,
  setHoverUrl,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  mark: (h: string) => void;
  visited: Set<string>;
  setHoverUrl: (s: string) => void;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const isVisited = visited.has(href);
  return (
    <a
      href={href}
      onClick={(e) => {
        mark(href);
        onClick?.(e);
      }}
      onMouseEnter={() => setHoverUrl(href)}
      onMouseLeave={() => setHoverUrl("")}
      style={{
        color: isVisited ? VISITED : LINK,
        textDecoration: "underline",
      }}
    >
      {children}
    </a>
  );
}

// ─── Footnote superscript ───────────────────────────────────────────────

function Sup({
  n,
  setHoverUrl,
}: {
  n: number;
  setHoverUrl: (s: string) => void;
}) {
  return (
    <sup style={{ fontSize: 11, marginLeft: 1 }}>
      <a
        id={`fnref-${n}`}
        href={`#fn-${n}`}
        onClick={(e) => {
          e.preventDefault();
          const el = document.getElementById(`fn-${n}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          el?.classList.add("doc-html-flash");
          window.setTimeout(
            () => el?.classList.remove("doc-html-flash"),
            900,
          );
        }}
        onMouseEnter={() => setHoverUrl(`#fn-${n} — see Bibliography`)}
        onMouseLeave={() => setHoverUrl("")}
        style={{
          color: LINK,
          textDecoration: "underline",
          padding: "0 2px",
        }}
        aria-label={`Footnote ${n}`}
      >
        [{n}]
      </a>
    </sup>
  );
}

// ─── Hypertext Console — 1991 CLI strip under nav ──────────────────────

interface ConsoleOutput {
  cmd: string;
  lines: string[];
}

function HypertextConsole({
  activeSection,
  onJump,
  trail,
  onClearTrail,
  onMail,
  onCite,
}: {
  activeSection: typeof SECTIONS[number] | undefined;
  onJump: (id: string) => void;
  trail: TrailEntry[];
  onClearTrail: () => void;
  onMail: () => void;
  onCite: (n: number) => void;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<ConsoleOutput | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [matches, setMatches] = useState<{ index: number; total: number } | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  // auto-collapse output after 6s
  useEffect(() => {
    if (!output) return;
    const id = window.setTimeout(() => setOutput(null), 6500);
    return () => window.clearTimeout(id);
  }, [output]);

  // press : or / to focus input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === ":" || e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
        if (e.key === "/") setInput("find ");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const clearHighlights = useCallback(() => {
    document
      .querySelectorAll("mark.kiruk-find-hit")
      .forEach((m) => {
        const parent = m.parentNode;
        if (!parent) return;
        parent.replaceChild(
          document.createTextNode(m.textContent ?? ""),
          m,
        );
        parent.normalize();
      });
  }, []);

  const findInDocument = useCallback(
    (q: string) => {
      clearHighlights();
      if (!q.trim()) return { count: 0, first: null };
      const re = new RegExp(
        q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi",
      );
      const article = document.querySelector("article");
      if (!article) return { count: 0, first: null };

      const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
      const toWrap: Text[] = [];
      let node: Node | null = walker.nextNode();
      while (node) {
        const t = node as Text;
        const parentTag = t.parentElement?.tagName;
        if (
          t.nodeValue &&
          re.test(t.nodeValue) &&
          parentTag !== "SCRIPT" &&
          parentTag !== "STYLE" &&
          !(t.parentElement?.closest("aside"))
        ) {
          toWrap.push(t);
        }
        node = walker.nextNode();
      }

      let count = 0;
      let firstEl: HTMLElement | null = null;
      for (const t of toWrap) {
        const text = t.nodeValue!;
        re.lastIndex = 0;
        const frag = document.createDocumentFragment();
        let last = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(text))) {
          if (m.index > last) {
            frag.appendChild(
              document.createTextNode(text.slice(last, m.index)),
            );
          }
          const mark = document.createElement("mark");
          mark.className = "kiruk-find-hit";
          mark.textContent = m[0];
          mark.style.backgroundColor = "#fff399";
          mark.style.outline = "1px solid #000";
          frag.appendChild(mark);
          if (!firstEl) firstEl = mark;
          count += 1;
          last = m.index + m[0].length;
        }
        if (last < text.length) {
          frag.appendChild(document.createTextNode(text.slice(last)));
        }
        t.parentNode?.replaceChild(frag, t);
      }
      firstEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return { count, first: firstEl };
    },
    [clearHighlights],
  );

  const run = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;
      const [verb, ...args] = cmd.split(/\s+/);
      const arg = args.join(" ");

      // record in history
      setHistory((h) => [cmd, ...h].slice(0, 30));
      setHistoryIdx(-1);

      const reply = (lines: string[]) =>
        setOutput({ cmd, lines });

      switch (verb.toLowerCase()) {
        case "help":
        case "?": {
          reply([
            "available commands:",
            "  ls                    list sections",
            "  cd <n|id>             go to section",
            "  next | prev           step section",
            "  find <text>           highlight matches across the page",
            "  clear-find            remove highlights",
            "  cite <n>              jump to footnote n",
            "  trail                 last followed links",
            "  clear-trail           empty the trail panel",
            "  whois                 short bio",
            "  mail                  open mail composer",
            "  about | banner        about this console",
            "  clear                 clear output",
            "shortcut: press : or / to focus this prompt",
          ]);
          return;
        }
        case "ls": {
          reply([
            "section.id              title",
            "─".repeat(48),
            ...SECTIONS.map(
              (s) => `${s.num.padEnd(4, " ")}${s.id.padEnd(16, " ")}${s.title}`,
            ),
          ]);
          return;
        }
        case "cd": {
          if (!arg) {
            reply(["usage: cd <section-number|section-id>"]);
            return;
          }
          const norm = arg.replace(/\.$/, "");
          const byNum = SECTIONS.find((s) => s.num.replace(".", "") === norm);
          const byId = SECTIONS.find((s) => s.id === arg);
          const target = byNum ?? byId;
          if (!target) {
            reply([`cd: no such section: ${arg}`, "try 'ls' for the index"]);
            return;
          }
          onJump(target.id);
          reply([`→ jumped to ${target.num} ${target.title}`]);
          return;
        }
        case "next":
        case "prev": {
          const idx = activeSection
            ? SECTIONS.findIndex((s) => s.id === activeSection.id)
            : -1;
          const delta = verb.toLowerCase() === "next" ? 1 : -1;
          const target = SECTIONS[Math.max(0, Math.min(SECTIONS.length - 1, idx + delta))];
          if (target) {
            onJump(target.id);
            reply([`→ ${target.num} ${target.title}`]);
          }
          return;
        }
        case "find":
        case "/": {
          if (!arg) {
            reply(["usage: find <text>"]);
            return;
          }
          const { count } = findInDocument(arg);
          setMatches({ index: count ? 1 : 0, total: count });
          if (count === 0) {
            reply([`find: no matches for "${arg}"`]);
          } else {
            reply([
              `find: ${count} match${count > 1 ? "es" : ""} for "${arg}"`,
              "scrolled to first hit · run 'clear-find' to remove",
            ]);
          }
          return;
        }
        case "clear-find": {
          clearHighlights();
          setMatches(null);
          reply(["highlights cleared"]);
          return;
        }
        case "cite": {
          const n = parseInt(arg, 10);
          if (!n || n < 1 || n > FOOTNOTES.length) {
            reply([`cite: usage: cite <1..${FOOTNOTES.length}>`]);
            return;
          }
          onCite(n);
          reply([`→ footnote [${n}] · ${FOOTNOTES[n - 1].body.slice(0, 60)}…`]);
          return;
        }
        case "trail": {
          if (trail.length === 0) {
            reply(["trail: empty. follow a link to start"]);
            return;
          }
          reply([
            "recent hypertext follows:",
            ...trail.map((t) => `  ${t.time}  ${t.label}`),
          ]);
          return;
        }
        case "clear-trail": {
          onClearTrail();
          reply(["trail cleared"]);
          return;
        }
        case "whois": {
          reply([
            "kiruk · arun kumaar sreenivasan",
            "  role.... co-founder, design lead @ Spera",
            "  loc..... bengaluru, india",
            "  work.... design + engineering, one workflow",
            "  online.. kiruk.in · @kirukism",
          ]);
          return;
        }
        case "mail": {
          onMail();
          reply(["→ opening mail composer to arunkumaar.srinivasan@gmail.com"]);
          return;
        }
        case "about":
        case "banner": {
          reply([
            "KIRUK-CONSOLE 1.0 — hypertext companion",
            "compatible with NCSA Mosaic / Lynx-class browsers",
            "© 1991-2026 · kiruk-research.cern.ch",
          ]);
          return;
        }
        case "clear": {
          setOutput(null);
          return;
        }
        default: {
          reply([
            `kiruk: ${verb}: command not found`,
            "try 'help' for the index",
          ]);
        }
      }
    },
    [activeSection, clearHighlights, findInDocument, onCite, onClearTrail, onJump, onMail, trail],
  );

  return (
    <div
      style={{
        position: "fixed",
        insetInline: 0,
        top: "var(--simple-game-nav-bottom, 56px)",
        zIndex: 55,
        backgroundColor: "#f0f0f0",
        borderBottom: `1px solid ${TEXT}`,
        fontFamily: FONT_MONO,
        fontSize: 12,
        color: TEXT,
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(input);
          setInput("");
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 12px",
        }}
      >
        <span
          style={{
            color: SOFT,
            letterSpacing: 0.5,
            whiteSpace: "nowrap",
          }}
        >
          KIRUK://
        </span>
        <span
          style={{
            color: TEXT,
            whiteSpace: "nowrap",
            opacity: 0.7,
          }}
        >
          {activeSection?.id ?? "top"}
        </span>
        <span style={{ color: SOFT }}>▸</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              const next = Math.min(history.length - 1, historyIdx + 1);
              if (history[next]) {
                setHistoryIdx(next);
                setInput(history[next]);
              }
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              const next = historyIdx - 1;
              if (next < 0) {
                setHistoryIdx(-1);
                setInput("");
              } else {
                setHistoryIdx(next);
                setInput(history[next] ?? "");
              }
            } else if (e.key === "Escape") {
              setInput("");
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder="type 'help' or 'ls' · press : or / to focus"
          aria-label="Hypertext console command"
          spellCheck={false}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            color: TEXT,
            fontFamily: FONT_MONO,
            fontSize: 12,
            padding: 0,
          }}
        />
        {matches && (
          <span style={{ color: SOFT, whiteSpace: "nowrap" }}>
            {matches.total} hit{matches.total === 1 ? "" : "s"}
          </span>
        )}
        <span style={{ color: SOFT, whiteSpace: "nowrap" }}>
          ? help
        </span>
      </form>

      {output && (
        <div
          style={{
            borderTop: `1px solid ${TEXT}`,
            backgroundColor: BG,
            padding: "6px 14px",
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          <div style={{ color: SOFT, marginBottom: 3 }}>
            $ {output.cmd}
          </div>
          {output.lines.map((l, i) => (
            <div
              key={i}
              style={{
                whiteSpace: "pre-wrap",
                color: TEXT,
                lineHeight: 1.5,
              }}
            >
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Hypertext trail sidebar ───────────────────────────────────────────

function HypertextTrail({
  trail,
  onClear,
}: {
  trail: TrailEntry[];
  onClear: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  if (trail.length === 0) return null;
  return (
    <aside
      style={{
        position: "fixed",
        right: 16,
        bottom: "calc(var(--eye-lid-bottom, 0px) + 44px)",
        zIndex: 55,
        width: collapsed ? 140 : 240,
        maxWidth: "calc(100vw - 32px)",
        backgroundColor: BG,
        border: `1px solid ${TEXT}`,
        fontFamily: FONT_MONO,
        fontSize: 11,
        color: TEXT,
        boxShadow: "3px 3px 0 #888888",
      }}
      aria-label="Hypertext trail — recent links followed"
    >
      <div
        style={{
          padding: "3px 8px",
          backgroundColor: "#f0f0f0",
          borderBottom: `1px solid ${TEXT}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          letterSpacing: 0.5,
        }}
      >
        <span>▸ HYPERTEXT TRAIL</span>
        <span style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            onClick={onClear}
            style={{
              ...trailBtn,
              color: LINK,
            }}
            aria-label="Clear trail"
          >
            clear
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((s) => !s)}
            style={{
              ...trailBtn,
              color: LINK,
            }}
            aria-label={collapsed ? "Expand trail" : "Collapse trail"}
          >
            {collapsed ? "+" : "—"}
          </button>
        </span>
      </div>
      {!collapsed && (
        <ol style={{ margin: 0, padding: "4px 8px", listStyle: "none" }}>
          {trail.map((t, i) => (
            <li
              key={`${t.href}-${i}`}
              style={{
                marginBottom: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <span style={{ color: SOFT, marginRight: 4 }}>{t.time}</span>
              <a
                href={t.href}
                onClick={(e) => {
                  if (t.href.startsWith("#")) {
                    e.preventDefault();
                    const el = document.getElementById(t.href.slice(1));
                    el?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                style={{
                  color: LINK,
                  textDecoration: "underline",
                }}
              >
                {t.label.length > 30
                  ? t.label.slice(0, 30) + "…"
                  : t.label}
              </a>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}

const trailBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontFamily: FONT_MONO,
  fontSize: 11,
  padding: 0,
  textDecoration: "underline",
};

// ─── Keyboard shortcut help overlay ────────────────────────────────────

function KeyboardHelp({ onClose }: { onClose: () => void }) {
  const rows: Array<[string, string]> = [
    ["?", "show / hide this help"],
    ["t  /  g", "scroll to top of document"],
    ["b", "jump to Bibliography & Notes"],
    ["j  /  ↓", "next section"],
    ["k  /  ↑", "previous section"],
    ["v", "toggle view-source overlay"],
    ["esc", "close any open overlay"],
  ];
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.55)",
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
          backgroundColor: BG,
          border: `2px solid ${TEXT}`,
          maxWidth: 480,
          width: "100%",
          fontFamily: FONT_SERIF,
          color: TEXT,
        }}
      >
        <div
          style={{
            backgroundColor: "#f0f0f0",
            borderBottom: `1px solid ${TEXT}`,
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: FONT_MONO,
            fontSize: 12,
          }}
        >
          <span>HELP — keyboard shortcuts</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: LINK,
              textDecoration: "underline",
              fontFamily: FONT_MONO,
              fontSize: 12,
            }}
          >
            close
          </button>
        </div>
        <div style={{ padding: "12px 16px" }}>
          <p style={{ margin: "0 0 10px", fontStyle: "italic", color: MUTED }}>
            This document is navigable by keyboard. Press a key listed
            below at any time outside a text field.
          </p>
          <dl
            style={{
              margin: 0,
              display: "grid",
              gridTemplateColumns: "max-content 1fr",
              columnGap: 16,
              rowGap: 6,
            }}
          >
            {rows.map(([k, d]) => (
              <React.Fragment key={k}>
                <dt
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {k}
                </dt>
                <dd style={{ margin: 0, fontSize: 14 }}>{d}</dd>
              </React.Fragment>
            ))}
          </dl>
          <p
            style={{
              margin: "12px 0 0",
              fontFamily: FONT_MONO,
              fontSize: 11,
              color: SOFT,
            }}
          >
            ▸ Inspired by Lynx (1992) and Emacs info-mode keybindings.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── View-source overlay ────────────────────────────────────────────────

function ViewSourceOverlay({ onClose }: { onClose: () => void }) {
  const source = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 1.0">
<HTML>
<HEAD>
  <TITLE>Kiruk — A Design Engineer on Record</TITLE>
  <META NAME="author"   CONTENT="arun-ks">
  <META NAME="subject"  CONTENT="design-engineering bridge">
  <LINK REV="made"      HREF="mailto:arunkumaar.srinivasan@gmail.com">
</HEAD>
<BODY>
  <H1>Kiruk — A Design Engineer on Record.</H1>
  <P>Field notes on Arun Kumaar Sreenivasan, working at the
     design-engineering bridge, now co-founder and design lead at Spera.</P>

  <HR>
  <H2>Abstract</H2>
  <P>This document treats the designer as the user of his own study.</P>

  <H2>On this page</H2>
  <OL>
    <LI><A HREF="#why">1 Why: A Bridge Between Crafts</A>
    <LI><A HREF="#persona">2 About the Author</A>
    <LI><A HREF="#empathy">3 An Empathy Map</A>
    <LI><A HREF="#journey">4 Career Path — A Hypertext Trail</A>
    <LI><A HREF="#impact">5 Quantified Impact</A>
    <LI><A HREF="#cards">6 Card Sort: The Work, Indexed</A>
    <LI><A HREF="#usability">7 Usability — Test the Connection</A>
    <LI><A HREF="#bibliography">* Bibliography & Notes</A>
  </OL>

  <HR>
  <ADDRESS>arun-ks · kiruk-research.cern.ch · last-modified ${new Date().toISOString().slice(0, 10)}</ADDRESS>
</BODY>
</HTML>`;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.55)",
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: BG,
          border: `2px solid ${TEXT}`,
          maxWidth: 720,
          width: "100%",
          maxHeight: "82vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            backgroundColor: "#f0f0f0",
            borderBottom: `1px solid ${TEXT}`,
            padding: "6px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: FONT_MONO,
            fontSize: 12,
            color: TEXT,
          }}
        >
          <span>view-source: kiruk-research.cern.ch/doc-001</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: LINK,
              textDecoration: "underline",
              fontFamily: FONT_MONO,
              fontSize: 12,
            }}
          >
            close
          </button>
        </div>
        <pre
          style={{
            margin: 0,
            padding: 16,
            fontFamily: FONT_MONO,
            fontSize: 12,
            color: TEXT,
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
          }}
        >
          {source}
        </pre>
      </div>
    </div>
  );
}

export default DocHtmlHomePage;
