"use client";

/**
 * MosaicHomePage — 1993 archetype rendered as a Yahoo-style hypertext
 * DIRECTORY of the subject (Arun) instead of a long scrolling page.
 *
 * Browser chrome at top (title bar / menu / toolbar / location / status)
 * sits over a categorised index of short link items. Clicking any item
 * "opens" a document panel inside the same browser frame with a Back to
 * Index link. History stack across opens drives the toolbar Back/Fwd.
 *
 * Distinct from 1995 (personal sidebar) and 1997 (corporate banner) — this
 * IS the early-web web: an index of documents, hyperlinked together.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import {
  WHY_KIRUK,
  PERSONA,
  EMPATHY_MAP,
  buildTimeline,
  IMPACT_METRICS,
  CARD_SORTING,
  USABILITY_TEST,
} from "../shared/landing-content";

// Palette
const GRAY = "#c0c0c0";
const GRAY_LIGHT = "#dcdcdc";
const HILITE = "#ffffff";
const SHADOW = "#808080";
const BLACK = "#000000";
const PAPER = "#fffaf0";
const LINK = "#0000ee";
const VISITED = "#551a8b";
const NAVY = "#000080";
const MAROON = "#660000";

const FONT_BODY = "Arial, Helvetica, sans-serif";
const FONT_HEAD = '"Arial Black", Impact, Arial, sans-serif';
const FONT_SERIF = '"Times New Roman", Georgia, serif';
const FONT_MONO = '"Courier New", Courier, monospace';

interface DirItem {
  id: string;
  label: string;
  desc: string;
  doc: () => React.ReactNode;
}

interface Category {
  id: string;
  title: string;
  glyph: string;
  items: DirItem[];
}

type ViewState = { kind: "index" } | { kind: "doc"; docId: string };

const NEWS_TICKER = [
  "Welcome to KIRUK on the World Wide Web — a hand-curated directory",
  "Best viewed in NCSA Mosaic 2.0 at 800×600",
  "Last reindexed Wed · 12 categories · 30 entries",
  "Suggest a link: mailto:arunkumaar.srinivasan@gmail.com",
];

export function MosaicHomePage() {
  const { setLayoutMode } = useLayoutMode();
  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);

  // History stack — first entry is the index, then each opened doc.
  const [history, setHistory] = useState<ViewState[]>([{ kind: "index" }]);
  const [cursor, setCursor] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showOpen, setShowOpen] = useState(false);
  const [statusText, setStatusText] = useState<string>("Document: Done.");
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [visited, setVisited] = useState<Set<string>>(new Set());

  // Restore visited links across the session
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kiruk-1993-visited");
      if (raw) setVisited(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* noop */
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "kiruk-1993-visited",
        JSON.stringify(Array.from(visited)),
      );
    } catch {
      /* noop */
    }
  }, [visited]);

  // ── Build directory (memoised so child re-renders cheap) ───────────
  const directory = useMemo<Category[]>(() => buildDirectory(), []);
  const flatItems = useMemo(
    () => directory.flatMap((c) => c.items.map((i) => ({ ...i, cat: c }))),
    [directory],
  );

  const filtered = useMemo(() => {
    const q = submittedQuery.trim().toLowerCase();
    if (!q) return null;
    return flatItems.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        it.desc.toLowerCase().includes(q) ||
        it.cat.title.toLowerCase().includes(q),
    );
  }, [flatItems, submittedQuery]);

  // ── Navigate with simulated 28.8k modem load ───────────────────────
  const navigate = useCallback(
    (state: ViewState, opts?: { skipHistory?: boolean }) => {
      setLoading(true);
      setProgress(0);
      const url =
        state.kind === "index"
          ? "http://kiruk.cern.ch/~arun/"
          : `http://kiruk.cern.ch/~arun/${state.docId}.html`;
      setStatusText(`Connecting to ${url} …`);
      const startedAt = performance.now();
      const totalMs = 540 + Math.random() * 260;
      const step = () => {
        const elapsed = performance.now() - startedAt;
        const p = Math.min(1, elapsed / totalMs);
        setProgress(p);
        if (p < 1) {
          window.requestAnimationFrame(step);
        } else {
          setLoading(false);
          setStatusText(`Document: Done. (${Math.round(totalMs)}ms)`);
          window.scrollTo({ top: 0, behavior: "smooth" });
          if (state.kind === "doc") {
            setVisited((prev) => {
              if (prev.has(state.docId)) return prev;
              const n = new Set(prev);
              n.add(state.docId);
              return n;
            });
          }
        }
      };
      window.requestAnimationFrame(step);

      if (!opts?.skipHistory) {
        setHistory((prev) => {
          const truncated = prev.slice(0, cursor + 1);
          if (
            truncated[truncated.length - 1]?.kind === state.kind &&
            (state.kind === "index" ||
              (truncated[truncated.length - 1] as { docId: string }).docId ===
                state.docId)
          ) {
            return truncated;
          }
          return [...truncated, state];
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

  const goHome = useCallback(() => navigate({ kind: "index" }), [navigate]);
  const reload = useCallback(
    () => navigate(history[cursor], { skipHistory: true }),
    [history, cursor, navigate],
  );

  // Ctrl+L → Open Location
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setShowOpen(true);
        return;
      }
      if (e.key === "Escape" && showOpen) setShowOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showOpen]);

  const currentView = history[cursor];
  const currentDoc =
    currentView.kind === "doc"
      ? flatItems.find((it) => it.id === currentView.docId) ?? null
      : null;
  const currentUrl =
    currentView.kind === "index"
      ? "http://kiruk.cern.ch/~arun/"
      : `http://kiruk.cern.ch/~arun/${currentView.docId}.html`;

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

  const totalEntries = flatItems.length;

  const linkProps = (key: string) => ({
    onMouseEnter: () => setStatusText(`go to: ${key}`),
    onMouseLeave: () => setStatusText("Document: Done."),
    style: {
      color: visited.has(key) ? VISITED : LINK,
      textDecoration: "underline",
    } as React.CSSProperties,
  });

  return (
    <main
      id="mosaic-home"
      style={{
        backgroundColor: GRAY,
        color: BLACK,
        fontFamily: FONT_BODY,
        minHeight: "100vh",
        paddingTop: "calc(var(--simple-game-nav-bottom, 56px) + 12px)",
        paddingBottom: 32,
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 12px" }}>
        {/* ── BROWSER CHROME ─────────────────────────────────── */}
        <div
          style={{
            backgroundColor: GRAY,
            borderTop: `2px solid ${HILITE}`,
            borderLeft: `2px solid ${HILITE}`,
            borderRight: `2px solid ${SHADOW}`,
            borderBottom: `2px solid ${SHADOW}`,
            outline: `1px solid ${BLACK}`,
          }}
        >
          {/* Title bar */}
          <div
            style={{
              backgroundColor: NAVY,
              color: HILITE,
              padding: "3px 8px",
              fontFamily: FONT_MONO,
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              NCSA Mosaic — kiruk.cern.ch/~arun/{currentDoc ? `${currentDoc.id}.html` : ""}
            </span>
            <span style={{ display: "flex", gap: 2 }}>
              <ChromeBtn>_</ChromeBtn>
              <ChromeBtn>□</ChromeBtn>
              <ChromeBtn>✕</ChromeBtn>
            </span>
          </div>

          {/* Menu */}
          <div
            style={{
              padding: "2px 8px",
              fontSize: 12,
              backgroundColor: GRAY,
              borderBottom: `1px solid ${SHADOW}`,
              display: "flex",
              gap: 14,
            }}
          >
            {["File", "Edit", "Options", "Navigate", "Annotate", "Help"].map((m) => (
              <span
                key={m}
                style={{ cursor: "default", textDecoration: "underline" }}
                onMouseEnter={() => setStatusText(`Menu: ${m}`)}
                onMouseLeave={() => setStatusText("Document: Done.")}
              >
                <u>{m[0]}</u>
                {m.slice(1)}
              </span>
            ))}
            <span style={{ marginLeft: "auto", color: SHADOW }}>{stamp}</span>
          </div>

          {/* Toolbar */}
          <div
            style={{
              padding: "6px 8px",
              backgroundColor: GRAY,
              borderBottom: `1px solid ${SHADOW}`,
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            <ToolbarBtn onClick={goBack} disabled={cursor <= 0} title="Back">◂ Back</ToolbarBtn>
            <ToolbarBtn onClick={goForward} disabled={cursor >= history.length - 1} title="Forward">Fwd ▸</ToolbarBtn>
            <ToolbarBtn onClick={goHome} title="Home">⌂ Index</ToolbarBtn>
            <ToolbarBtn onClick={reload} title="Reload">↻ Reload</ToolbarBtn>
            <ToolbarBtn onClick={() => setShowOpen(true)} title="Open Location… (Ctrl+L)">Open…</ToolbarBtn>
            <span style={{ marginLeft: "auto", fontFamily: FONT_MONO, fontSize: 11, color: SHADOW }}>
              28.8k · {loading ? `${Math.round(progress * 100)}%` : "idle"}
            </span>
          </div>

          {/* Location bar */}
          <div
            style={{
              padding: "4px 8px",
              backgroundColor: GRAY,
              borderBottom: `2px solid ${SHADOW}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontFamily: FONT_MONO,
            }}
          >
            <span style={{ color: BLACK }}>Document URL:</span>
            <input
              readOnly
              value={currentUrl}
              style={{
                flex: 1,
                backgroundColor: HILITE,
                border: `2px solid ${SHADOW}`,
                borderTopColor: SHADOW,
                borderLeftColor: SHADOW,
                borderRightColor: HILITE,
                borderBottomColor: HILITE,
                padding: "2px 4px",
                fontFamily: FONT_MONO,
                fontSize: 12,
              }}
            />
          </div>

          {/* ── BODY ─────────────────────────────────────────── */}
          <div
            style={{
              backgroundColor: PAPER,
              padding: "12px 16px 24px",
            }}
          >
            {/* News strip */}
            <div
              style={{
                backgroundColor: MAROON,
                color: HILITE,
                padding: "3px 0",
                fontFamily: FONT_HEAD,
                fontSize: 12,
                letterSpacing: 1,
                overflow: "hidden",
                border: `1px solid ${BLACK}`,
                marginBottom: 12,
              }}
            >
              <Marquee items={NEWS_TICKER} />
            </div>

            {currentDoc ? (
              <ArticleView
                doc={currentDoc}
                onBack={goHome}
                linkProps={linkProps}
                visited={visited}
              />
            ) : (
              <DirectoryView
                directory={directory}
                onOpen={(id) =>
                  navigate({ kind: "doc", docId: id })
                }
                query={query}
                setQuery={setQuery}
                submittedQuery={submittedQuery}
                setSubmittedQuery={setSubmittedQuery}
                filtered={filtered}
                totalEntries={totalEntries}
                linkProps={linkProps}
                visited={visited}
              />
            )}
          </div>

          {/* Status bar */}
          <div
            style={{
              backgroundColor: GRAY_LIGHT,
              borderTop: `2px solid ${HILITE}`,
              borderLeft: `2px solid ${HILITE}`,
              borderRight: `2px solid ${SHADOW}`,
              borderBottom: `2px solid ${SHADOW}`,
              padding: "3px 8px",
              fontSize: 11,
              fontFamily: FONT_MONO,
              color: BLACK,
              display: "grid",
              gridTemplateColumns: "1fr 200px auto",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {statusText}
            </span>
            <div
              aria-hidden
              style={{
                height: 10,
                backgroundColor: HILITE,
                border: `1px solid ${BLACK}`,
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${Math.round(progress * 100)}%`,
                  height: "100%",
                  backgroundColor: loading ? NAVY : "#008000",
                  transition: loading ? "width 80ms linear" : "none",
                  backgroundImage: loading
                    ? "repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 4px, transparent 4px 8px)"
                    : undefined,
                }}
              />
            </div>
            <span>
              {currentDoc ? "doc" : "index"} · {visited.size}/{totalEntries} visited
            </span>
          </div>
        </div>
      </div>

      {/* Open Location */}
      {showOpen && (
        <OpenLocationDialog
          onClose={() => setShowOpen(false)}
          flatItems={flatItems}
          onGo={(raw) => {
            setShowOpen(false);
            const target = parseLocation(raw, flatItems);
            if (target === "mailto") {
              window.location.href = "mailto:arunkumaar.srinivasan@gmail.com";
              return;
            }
            if (target === "index") {
              navigate({ kind: "index" });
              return;
            }
            if (target) navigate({ kind: "doc", docId: target });
          }}
        />
      )}
    </main>
  );
}

// ── Directory view ────────────────────────────────────────────────────

function DirectoryView({
  directory,
  onOpen,
  query,
  setQuery,
  submittedQuery,
  setSubmittedQuery,
  filtered,
  totalEntries,
  linkProps,
  visited,
}: {
  directory: Category[];
  onOpen: (id: string) => void;
  query: string;
  setQuery: (v: string) => void;
  submittedQuery: string;
  setSubmittedQuery: (v: string) => void;
  filtered: Array<DirItem & { cat: Category }> | null;
  totalEntries: number;
  linkProps: (k: string) => {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    style: React.CSSProperties;
  };
  visited: Set<string>;
}) {
  return (
    <div>
      {/* Yahoo-style top — search + index meta */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontFamily: FONT_HEAD,
            fontSize: "clamp(28px, 4.4vw, 40px)",
            color: MAROON,
            letterSpacing: 1,
            lineHeight: 1,
          }}
        >
          KIRUK.NET
        </div>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontStyle: "italic",
            color: BLACK,
            marginTop: 2,
            fontSize: 14,
          }}
        >
          A hand-edited directory of one design engineer
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedQuery(query);
          }}
          style={{
            marginTop: 10,
            display: "inline-flex",
            gap: 4,
            alignItems: "center",
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search kiruk.net"
            aria-label="Search directory"
            style={{
              fontFamily: FONT_BODY,
              fontSize: 12,
              padding: "3px 6px",
              border: `2px solid ${SHADOW}`,
              borderTopColor: SHADOW,
              borderLeftColor: SHADOW,
              borderRightColor: HILITE,
              borderBottomColor: HILITE,
              backgroundColor: HILITE,
              width: 220,
            }}
          />
          <button
            type="submit"
            style={searchBtn}
          >
            search
          </button>
          {submittedQuery && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSubmittedQuery("");
              }}
              style={{ ...searchBtn, backgroundColor: GRAY }}
            >
              clear
            </button>
          )}
        </form>
        <div
          style={{
            marginTop: 6,
            fontFamily: FONT_MONO,
            fontSize: 11,
            color: SHADOW,
          }}
        >
          {directory.length} categories · {totalEntries} entries · last
          reindexed {new Date().toLocaleDateString("en-GB")}
        </div>
      </div>

      <hr style={hr3d} />

      {/* SEARCH RESULTS or directory grid */}
      {filtered ? (
        <div>
          <h2 style={catTitle}>
            <span style={{ color: MAROON }}>Search results</span>{" "}
            <span style={{ color: SHADOW, fontSize: 13, fontWeight: 400 }}>
              ({filtered.length} match{filtered.length === 1 ? "" : "es"} for
              &ldquo;{submittedQuery}&rdquo;)
            </span>
          </h2>
          {filtered.length === 0 && (
            <p style={{ fontStyle: "italic", color: SHADOW }}>
              no entries matched. try a broader term, or{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setQuery("");
                  setSubmittedQuery("");
                }}
                style={{ color: LINK, textDecoration: "underline" }}
              >
                clear the search
              </a>
              .
            </p>
          )}
          <ul style={resultList}>
            {filtered.map((it) => (
              <li key={it.id} style={resultItem}>
                <a
                  href={`#${it.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onOpen(it.id);
                  }}
                  {...linkProps(it.id)}
                >
                  {it.label}
                </a>{" "}
                <span style={{ color: SHADOW, fontStyle: "italic", fontSize: 12 }}>
                  — {it.cat.title}
                </span>
                <div style={{ fontSize: 12, color: BLACK }}>{it.desc}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {directory.map((cat) => (
            <section key={cat.id}>
              <h2 style={catTitle}>
                <span style={{ color: SHADOW, marginRight: 6 }}>{cat.glyph}</span>
                <span style={{ color: MAROON }}>{cat.title}</span>{" "}
                <span style={{ color: SHADOW, fontSize: 12, fontWeight: 400 }}>
                  ({cat.items.length})
                </span>
              </h2>
              <ul style={catList}>
                {cat.items.map((it) => (
                  <li key={it.id} style={catItem}>
                    <a
                      href={`#${it.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onOpen(it.id);
                      }}
                      {...linkProps(it.id)}
                    >
                      {it.label}
                    </a>
                    <div style={{ fontSize: 12, color: BLACK }}>
                      {it.desc}
                      {visited.has(it.id) && (
                        <span
                          style={{
                            marginLeft: 4,
                            fontSize: 10,
                            color: SHADOW,
                            fontFamily: FONT_MONO,
                          }}
                        >
                          (visited)
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <hr style={hr3d} />

      <p
        style={{
          fontFamily: FONT_BODY,
          fontSize: 12,
          color: BLACK,
          textAlign: "center",
          margin: 0,
        }}
      >
        Looking for something specific? Try the search box, or{" "}
        <a
          href="mailto:arunkumaar.srinivasan@gmail.com"
          style={{ color: LINK, textDecoration: "underline" }}
        >
          email the editor
        </a>
        .
      </p>
    </div>
  );
}

// ── Article view ──────────────────────────────────────────────────────

function ArticleView({
  doc,
  onBack,
  linkProps,
  visited,
}: {
  doc: DirItem;
  onBack: () => void;
  linkProps: (k: string) => {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    style: React.CSSProperties;
  };
  visited: Set<string>;
}) {
  void linkProps;
  void visited;
  return (
    <article style={{ fontFamily: FONT_SERIF, color: BLACK }}>
      <p
        style={{
          fontFamily: FONT_BODY,
          fontSize: 12,
          margin: 0,
        }}
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
          style={{ color: LINK, textDecoration: "underline" }}
        >
          ◂ Back to Index
        </a>{" "}
        <span style={{ color: SHADOW }}>
          | Home / {doc.label}
        </span>
      </p>
      <hr style={hr3d} />
      <h1
        style={{
          fontFamily: FONT_HEAD,
          fontSize: "clamp(22px, 3vw, 30px)",
          color: MAROON,
          margin: "0 0 4px",
          lineHeight: 1.2,
        }}
      >
        {doc.label}
      </h1>
      <p
        style={{
          fontStyle: "italic",
          color: BLACK,
          margin: "0 0 12px",
          fontSize: 14,
        }}
      >
        {doc.desc}
      </p>
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 15,
          lineHeight: 1.55,
          color: BLACK,
        }}
      >
        {doc.doc()}
      </div>
      <hr style={hr3d} />
      <p style={{ fontFamily: FONT_BODY, fontSize: 12, margin: 0 }}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
          style={{ color: LINK, textDecoration: "underline" }}
        >
          ◂ Back to Index
        </a>
      </p>
    </article>
  );
}

// ── Directory data ────────────────────────────────────────────────────

function buildDirectory(): Category[] {
  const nodes = buildTimeline();
  return [
    {
      id: "about",
      title: "About the editor",
      glyph: "●",
      items: [
        {
          id: "identity",
          label: "Identity card",
          desc: "Name, role, location, archetype on one page.",
          doc: () => (
            <>
              <p>
                Arun Kumaar Sreenivasan — design engineer at HP Print AI,
                Bengaluru, India. Operates at the bridge of UX design and
                front-end engineering.
              </p>
              <table style={tbl}>
                <tbody>
                  <Row k="Name">{PERSONA.identity.name}</Row>
                  <Row k="Role">{PERSONA.identity.role}</Row>
                  <Row k="Where">{PERSONA.identity.location}</Row>
                  <Row k="Employer">{PERSONA.identity.org}</Row>
                  <Row k="Type">Designer ↔ Engineer</Row>
                </tbody>
              </table>
            </>
          ),
        },
        {
          id: "bio",
          label: "Editor's background",
          desc: "A short narrative bio.",
          doc: () => <p>{PERSONA.background}</p>,
        },
        {
          id: "quote",
          label: "Quote on file",
          desc: "Self-description, kept on hand for press queries.",
          doc: () => (
            <blockquote style={bq}>
              “{PERSONA.quote}”
            </blockquote>
          ),
        },
      ],
    },
    {
      id: "topics",
      title: "Topics & opinions",
      glyph: "▶",
      items: [
        {
          id: "topic-hook",
          label: "Hook",
          desc: "The pitch in one sentence.",
          doc: () => (
            <p>
              <b>{WHY_KIRUK.hook}</b>
            </p>
          ),
        },
        {
          id: "topic-pain",
          label: "Pain",
          desc: "The problem worth solving.",
          doc: () => <p>{WHY_KIRUK.pain}</p>,
        },
        {
          id: "topic-bridge",
          label: "Bridge",
          desc: "How the editor solves it.",
          doc: () => <p>{WHY_KIRUK.bridge}</p>,
        },
        {
          id: "topic-close",
          label: "Tagline",
          desc: "The closing line.",
          doc: () => <p style={{ fontStyle: "italic" }}>“{WHY_KIRUK.tagline}”</p>,
        },
      ],
    },
    {
      id: "thoughts",
      title: "What he says · thinks · does · feels",
      glyph: "◆",
      items: [
        {
          id: "says",
          label: "Says",
          desc: "Skills he claims and a quote.",
          doc: () => (
            <>
              <blockquote style={bq}>“{EMPATHY_MAP.says.quote}”</blockquote>
              <p>{EMPATHY_MAP.says.skills.join(" · ")}</p>
            </>
          ),
        },
        {
          id: "thinks",
          label: "Thinks",
          desc: "Philosophy in three lines.",
          doc: () => (
            <ul style={ul}>
              {EMPATHY_MAP.thinks.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          ),
        },
        {
          id: "does",
          label: "Does",
          desc: "Stack in rotation.",
          doc: () => (
            <p style={{ fontFamily: FONT_MONO, fontSize: 13 }}>
              {EMPATHY_MAP.does.join(" · ")}
            </p>
          ),
        },
        {
          id: "feels",
          label: "Feels",
          desc: "Motivations.",
          doc: () => (
            <ul style={ul}>
              {EMPATHY_MAP.feels.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          ),
        },
      ],
    },
    {
      id: "career",
      title: "Career milestones",
      glyph: "↗",
      items: nodes.map((n) => ({
        id: `year-${n.year}`,
        label: `${n.year} · ${n.position}`,
        desc: `${n.phase} @ ${n.org}`,
        doc: () => (
          <>
            <p>
              <b>{n.position}</b> — {n.phase}
              {n.live && (
                <span style={{ color: MAROON, marginLeft: 6 }}>
                  [current role]
                </span>
              )}
            </p>
            <p style={{ color: SHADOW, fontFamily: FONT_BODY, fontSize: 13 }}>
              @ {n.org}
            </p>
            <p>{n.detail}</p>
          </>
        ),
      })),
    },
    {
      id: "trophies",
      title: "Numbers & trophies",
      glyph: "✦",
      items: IMPACT_METRICS.slice(0, 8).map((m) => ({
        id: `metric-${m.id}`,
        label: `${m.value} ${m.label}`,
        desc: m.context || `${m.category} metric`,
        doc: () => (
          <>
            <p style={{ fontSize: 32, fontFamily: FONT_HEAD, color: MAROON, margin: 0 }}>
              {m.value}
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: 13, margin: "4px 0 8px" }}>
              {m.label}
            </p>
            {m.context && <p style={{ fontStyle: "italic" }}>{m.context}</p>}
          </>
        ),
      })),
    },
    {
      id: "projects",
      title: "Projects & services",
      glyph: "▦",
      items: CARD_SORTING.projects.map((p) => ({
        id: `proj-${p.id}`,
        label: p.title,
        desc: `${p.category} · ${p.duration}`,
        doc: () => (
          <>
            <p style={{ fontStyle: "italic", color: SHADOW }}>
              {p.category} · {p.duration}
            </p>
            <p>{p.description}</p>
            <p style={{ fontFamily: FONT_MONO, fontSize: 12, color: SHADOW }}>
              tech: {p.technologies.join(", ")}
            </p>
            <p>
              <a
                href={`/case-studies#${p.id}`}
                style={{ color: LINK, textDecoration: "underline" }}
              >
                Read the full case study »
              </a>
            </p>
          </>
        ),
      })),
    },
    {
      id: "reach",
      title: "How to reach the editor",
      glyph: "✉",
      items: USABILITY_TEST.channels.map((c) => ({
        id: `ch-${c.label.toLowerCase()}`,
        label: c.label,
        desc: c.role,
        doc: () => (
          <>
            <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: SHADOW, margin: 0 }}>
              {c.role}
            </p>
            <p style={{ fontFamily: FONT_MONO, fontSize: 15, margin: "6px 0" }}>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                style={{ color: LINK, textDecoration: "underline" }}
              >
                {c.value}
              </a>
            </p>
          </>
        ),
      })),
    },
  ];
}

// ── Open Location ─────────────────────────────────────────────────────

function parseLocation(
  raw: string,
  flatItems: DirItem[],
): string | "mailto" | "index" | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  if (s.startsWith("mailto") || s.includes("@")) return "mailto";
  if (s.includes("index") || s === "home" || s === "/") return "index";
  // try last path segment
  const m = s.match(/(?:kiruk:\/\/|\/)?([a-z0-9-]+)(?:\.html)?\/?$/);
  const id = m?.[1];
  if (!id) return null;
  const found = flatItems.find((it) => it.id === id);
  return found ? found.id : null;
}

function OpenLocationDialog({
  onClose,
  onGo,
  flatItems,
}: {
  onClose: () => void;
  onGo: (raw: string) => void;
  flatItems: DirItem[];
}) {
  const [value, setValue] = useState("http://kiruk.cern.ch/~arun/");
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
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
          width: "min(440px, 100%)",
          backgroundColor: GRAY,
          borderTop: `2px solid ${HILITE}`,
          borderLeft: `2px solid ${HILITE}`,
          borderRight: `2px solid ${SHADOW}`,
          borderBottom: `2px solid ${SHADOW}`,
          outline: `1px solid ${BLACK}`,
        }}
      >
        <div
          style={{
            backgroundColor: NAVY,
            color: HILITE,
            padding: "3px 8px",
            fontFamily: FONT_MONO,
            fontSize: 12,
            fontWeight: 700,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Open Location…</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: GRAY,
              border: `1px solid ${BLACK}`,
              color: BLACK,
              fontFamily: FONT_MONO,
              fontSize: 10,
              padding: "0 6px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: "12px 14px" }}>
          <p style={{ margin: "0 0 8px", fontSize: 13 }}>
            Enter the URL of a document on this site.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onGo(value);
            }}
          >
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              style={{
                width: "100%",
                fontFamily: FONT_MONO,
                fontSize: 13,
                padding: "4px 6px",
                backgroundColor: HILITE,
                border: `2px solid ${SHADOW}`,
                borderTopColor: SHADOW,
                borderLeftColor: SHADOW,
                borderRightColor: HILITE,
                borderBottomColor: HILITE,
              }}
            />
            <div
              style={{
                fontSize: 11,
                color: SHADOW,
                marginTop: 6,
                fontFamily: FONT_MONO,
              }}
            >
              try:{" "}
              {flatItems
                .slice(0, 3)
                .map((i) => `~arun/${i.id}.html`)
                .join("  ·  ")}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 6,
                marginTop: 12,
              }}
            >
              <BevelBtn type="button" onClick={onClose}>Cancel</BevelBtn>
              <BevelBtn type="submit" primary>Open</BevelBtn>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Misc atoms ────────────────────────────────────────────────────────

function ChromeBtn({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 16,
        height: 14,
        backgroundColor: GRAY,
        color: BLACK,
        borderTop: `1px solid ${HILITE}`,
        borderLeft: `1px solid ${HILITE}`,
        borderRight: `1px solid ${SHADOW}`,
        borderBottom: `1px solid ${SHADOW}`,
        fontFamily: FONT_MONO,
        fontSize: 10,
      }}
    >
      {children}
    </span>
  );
}

function ToolbarBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  const [pressed, setPressed] = useState(false);
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
        padding: "3px 8px",
        backgroundColor: GRAY,
        color: BLACK,
        borderTop: `2px solid ${pressed ? SHADOW : HILITE}`,
        borderLeft: `2px solid ${pressed ? SHADOW : HILITE}`,
        borderRight: `2px solid ${pressed ? HILITE : SHADOW}`,
        borderBottom: `2px solid ${pressed ? HILITE : SHADOW}`,
        outline: `1px solid ${BLACK}`,
        fontFamily: FONT_BODY,
        fontSize: 12,
        fontWeight: 700,
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transform: pressed && !disabled ? "translate(1px, 1px)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function BevelBtn({
  children,
  onClick,
  primary,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  type?: "button" | "submit";
}) {
  const [pressed, setPressed] = useState(false);
  const bg = primary ? NAVY : GRAY;
  const color = primary ? HILITE : BLACK;
  const hi = primary ? "#3333aa" : HILITE;
  const sh = primary ? "#000044" : SHADOW;
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        padding: "4px 14px",
        backgroundColor: bg,
        color,
        borderTop: `2px solid ${pressed ? sh : hi}`,
        borderLeft: `2px solid ${pressed ? sh : hi}`,
        borderRight: `2px solid ${pressed ? hi : sh}`,
        borderBottom: `2px solid ${pressed ? hi : sh}`,
        outline: `1px solid ${BLACK}`,
        fontFamily: FONT_BODY,
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        transform: pressed ? "translate(1px, 1px)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function Marquee({ items }: { items: readonly string[] }) {
  const joined = items.join("   ·   ");
  return (
    <div
      style={{
        whiteSpace: "nowrap",
        animation: "kiruk-1993-marquee 32s linear infinite",
        display: "inline-block",
        paddingLeft: "100%",
      }}
    >
      <style jsx global>{`
        @keyframes kiruk-1993-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-100%); }
        }
      `}</style>
      {joined}   ·   {joined}
    </div>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <tr>
      <td style={{ ...td, fontWeight: 700, backgroundColor: GRAY_LIGHT }}>
        {k}
      </td>
      <td style={td}>{children}</td>
    </tr>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────

const catTitle: React.CSSProperties = {
  fontFamily: FONT_HEAD,
  fontSize: 16,
  margin: "10px 0 4px",
  letterSpacing: 0.5,
};

const catList: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const catItem: React.CSSProperties = {
  paddingLeft: 12,
  borderLeft: `2px solid ${GRAY_LIGHT}`,
  paddingBottom: 4,
};

const resultList: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const resultItem: React.CSSProperties = {
  borderBottom: `1px dotted ${SHADOW}`,
  paddingBottom: 6,
};

const searchBtn: React.CSSProperties = {
  padding: "3px 10px",
  fontFamily: FONT_BODY,
  fontSize: 12,
  backgroundColor: NAVY,
  color: HILITE,
  border: `2px solid ${SHADOW}`,
  borderTopColor: "#3333aa",
  borderLeftColor: "#3333aa",
  borderRightColor: "#000044",
  borderBottomColor: "#000044",
  cursor: "pointer",
  fontWeight: 700,
};

const tbl: React.CSSProperties = {
  borderCollapse: "collapse",
  border: `1px solid ${SHADOW}`,
  fontSize: 14,
  marginBottom: 10,
  width: "100%",
};

const td: React.CSSProperties = {
  border: `1px solid ${SHADOW}`,
  padding: "5px 8px",
  verticalAlign: "top",
};

const ul: React.CSSProperties = {
  paddingLeft: 22,
  margin: "0 0 10px",
};

const bq: React.CSSProperties = {
  borderLeft: `3px solid ${SHADOW}`,
  paddingLeft: 10,
  fontStyle: "italic",
  margin: "0 0 10px",
};

const hr3d: React.CSSProperties = {
  height: 0,
  borderTop: `1px solid ${SHADOW}`,
  borderBottom: `1px solid ${HILITE}`,
  margin: "12px 0",
};

export default MosaicHomePage;
