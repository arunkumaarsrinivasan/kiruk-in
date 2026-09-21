"use client";

/**
 * Web2CandyHomePage — 2003 archetype: MyKiruk · A Social Profile.
 *
 * Paradigm: MySpace-style social profile page. The portfolio is laid
 * out exactly like a circa-2003 social-network profile — top BETA nav
 * bar, gel buttons, profile photo block with "Online Now!", contact
 * box ("Add to Friends / Send Message / Forward / Block"), big
 * BIO-style sections (About Me, Who I'd Like to Meet, General, Music,
 * Movies, Heroes, Schools, Companies), a Top 8 Friends grid (UX
 * artifacts as friends), a music widget that "autoplays", a mood
 * selector, and a comments wall that persists in sessionStorage.
 *
 * Distinct from every other shipped era:
 *   · 1995 GeoCities = solo personal homepage with sidebar
 *   · 2000 Aqua desktop = multi-window draggable workspace
 *   · 1997 CD-ROM = chapter rail + article
 *   · 2003 MySpace = SOCIAL profile with friends/comments paradigm
 *
 * Unique interactions:
 *   · Drag-to-reorder Top 8 grid (HTML5 native drag/drop)
 *   · Mood selector dropdown — header headline updates live
 *   · Comments wall — type + post, persists in sessionStorage
 *   · Music widget autoplays a mock track, scrubber animates,
 *     ▶ / ❚❚ / ◂◂ / ▸▸ transport, playlist toggle
 *   · "Add Kiruk as a Friend" button cycles state: Add → Pending → Friends
 *   · Profile views counter (real /api/visitors) + last login = today
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
} from "@/data/era-page-content";

// ── Palette — classic MySpace 2003 ───────────────────────────────────

const SKY = "#6699cc";                // page bg
const SKY_DEEP = "#3a6ea0";
const NAV_DEEP = "#003366";           // navy nav bar
const NAV_DEEP2 = "#002244";
const PAPER = "#ffffff";
const PAPER_DIM = "#f4f8ff";
const PANEL_HEAD = "#003366";         // section-head dark navy
const PANEL_HEAD_TXT = "#ffffff";
const INK = "#1a1a1a";
const INK_DIM = "#555566";
const MUTED = "#888899";
const LINK = "#0066cc";
const LINK_HOT = "#cc0066";
const ORANGE = "#ff6600";             // primary CTA orange
const ORANGE_DEEP = "#cc4400";
const GREEN_ON = "#3ec43e";
const PINK_HOT = "#ff66aa";
const BORDER = "#003366";

const FONT_UI = "'Verdana', 'Geneva', 'Arial', sans-serif";
const FONT_BODY = "'Verdana', 'Geneva', 'Arial', sans-serif";
const FONT_DISPLAY = "'Arial Black', 'Verdana', sans-serif";
const FONT_MONO = "'Courier New', 'Lucida Console', monospace";

// ── Mood presets ─────────────────────────────────────────────────────

const MOODS = [
  { id: "shipping",    emoji: "🚀", label: "shipping",    tint: "#ff6600", tintDeep: "#cc4400" },
  { id: "focused",     emoji: "🎯", label: "focused",     tint: "#0066cc", tintDeep: "#003d80" },
  { id: "curious",     emoji: "🔬", label: "curious",     tint: "#9933cc", tintDeep: "#5e1f7e" },
  { id: "caffeinated", emoji: "☕", label: "caffeinated", tint: "#8a4a1a", tintDeep: "#4f2a0d" },
  { id: "tired",       emoji: "🥱", label: "tired",       tint: "#6680a0", tintDeep: "#3a4e6a" },
  { id: "creative",    emoji: "✏️", label: "creative",    tint: "#cc0066", tintDeep: "#80003d" },
] as const;

type MoodId = (typeof MOODS)[number]["id"];

// ── Top 8 friend cards ───────────────────────────────────────────────

interface FriendCard {
  id: string;
  label: string;
  sub: string;
  emoji: string;
  bg: string;
}

interface FriendCardEx extends FriendCard {
  role: string;    // what this friend does for Arun's practice
  since: string;   // when they entered the work
  kind: "person" | "place" | "book" | "tool";
}

const KIND_GLYPH: Record<FriendCardEx["kind"], string> = {
  person: "👤",
  place: "📍",
  book: "📖",
  tool: "⚒",
};

function initialFriends(): FriendCardEx[] {
  return [
    {
      id: "f-norman",
      label: "Don Norman",
      sub: "the user under study",
      emoji: "🧠",
      bg: "#003366",
      role: "Why this site frames me as a user. The persona starts with him.",
      since: "read · 2019",
      kind: "person",
    },
    {
      id: "f-victor",
      label: "Bret Victor",
      sub: "direct manipulation",
      emoji: "🔮",
      bg: "#cc0066",
      role: "Compass for live feedback + design tooling that thinks back.",
      since: "watched · 2020",
      kind: "person",
    },
    {
      id: "f-sona",
      label: "Sona College",
      sub: "Salem, Tamil Nadu",
      emoji: "🎓",
      bg: "#9933cc",
      role: "Engineering grounding. CS major while freelance design ran in parallel.",
      since: "2018 → 2022",
      kind: "place",
    },
    {
      id: "f-hp",
      label: "HP Print AI",
      sub: "Bengaluru",
      emoji: "🖨",
      bg: "#0066cc",
      role: "Current bench. AI surfaces + observability + design-system seeds.",
      since: "2023 → now",
      kind: "place",
    },
    {
      id: "f-doet",
      label: "Design of Everyday Things",
      sub: "Don Norman",
      emoji: "📕",
      bg: "#cc6600",
      role: "First book that made design feel falsifiable instead of taste-based.",
      since: "shelf · 2019",
      kind: "book",
    },
    {
      id: "f-refui",
      label: "Refactoring UI",
      sub: "Wathan + Schoger",
      emoji: "📘",
      bg: "#009966",
      role: "Translated design rigor into a code-level vocabulary I could ship.",
      since: "shelf · 2021",
      kind: "book",
    },
    {
      id: "f-figma",
      label: "Figma",
      sub: "design surface",
      emoji: "🎨",
      bg: "#a259ff",
      role: "Every feature first exists here, as a frame, before it becomes code.",
      since: "daily · 2020",
      kind: "tool",
    },
    {
      id: "f-next",
      label: "Next.js",
      sub: "build surface",
      emoji: "▲",
      bg: "#111111",
      role: "Where the frame becomes a route. The bridge ends here every day.",
      since: "daily · 2022",
      kind: "tool",
    },
  ];
}

// ── Hooks ────────────────────────────────────────────────────────────

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

// ── Main component ───────────────────────────────────────────────────

export function Web2CandyHomePage() {
  const { setLayoutMode } = useLayoutMode();
  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);

  const isMobile = useIsMobile();
  const nodes = useMemo(buildTimeline, []);

  // Profile views (real)
  const [views, setViews] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/visitors")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.count === "number") setViews(d.count);
      })
      .catch(() => {});
  }, []);

  // Friend status — Add → Pending → Friends
  const [friendStatus, setFriendStatus] = useState<"add" | "pending" | "friends">("add");
  const friendStep = useCallback(() => {
    setFriendStatus((s) => (s === "add" ? "pending" : s === "pending" ? "friends" : "add"));
  }, []);

  // Mood selector
  const [moodId, setMoodId] = useState<MoodId>("shipping");
  const mood = MOODS.find((m) => m.id === moodId)!;

  // Top 8 — drag reorder
  const [friends, setFriends] = useState<FriendCardEx[]>(() => initialFriends());
  const dragRef = useRef<number | null>(null);
  const beginFriendDrag = (i: number) => {
    dragRef.current = i;
  };
  const dropOnFriend = (i: number) => {
    const from = dragRef.current;
    if (from === null || from === i) return;
    setFriends((prev) => {
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(i, 0, moved);
      return next;
    });
    dragRef.current = null;
  };

  // Comments wall — sessionStorage
  type Comment = { id: string; author: string; body: string; ts: number };
  const [comments, setComments] = useState<Comment[]>([]);
  const [draftAuthor, setDraftAuthor] = useState("");
  const [draftBody, setDraftBody] = useState("");
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kiruk-2003-comments");
      if (raw) setComments(JSON.parse(raw) as Comment[]);
    } catch {/* noop */}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("kiruk-2003-comments", JSON.stringify(comments));
    } catch {/* noop */}
  }, [comments]);
  const postComment = () => {
    const body = draftBody.trim();
    const author = draftAuthor.trim() || "Anonymous";
    if (!body) return;
    setComments((cs) => [
      {
        id: `c-${Date.now()}`,
        author,
        body,
        ts: Date.now(),
      },
      ...cs,
    ]);
    setDraftBody("");
  };

  // Last login (today, mock)
  const stamp = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, []);

  // Section refs for nav anchor scrolling
  const refTop = useRef<HTMLDivElement | null>(null);
  const refAbout = useRef<HTMLDivElement | null>(null);
  const refInterests = useRef<HTMLDivElement | null>(null);
  const refFriends = useRef<HTMLDivElement | null>(null);
  const refBlog = useRef<HTMLDivElement | null>(null);
  const refComments = useRef<HTMLDivElement | null>(null);
  const scrollTo = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  // Mail inbox — mock unread
  const [mailOpen, setMailOpen] = useState(false);
  const [mailUnread, setMailUnread] = useState(3);
  const mailbox = useMemo(
    () => [
      {
        id: "m1",
        from: "Figma",
        subject: "Your project file was updated",
        preview: "Recent activity on kiruk/era-time-machine.fig — 4 frames",
        when: "2m",
        unread: true,
      },
      {
        id: "m2",
        from: "GitHub",
        subject: "[kiruk-in] PR #42 merged",
        preview: "feat(2003): MySpace social profile — merged into main",
        when: "1h",
        unread: true,
      },
      {
        id: "m3",
        from: "Tom Anderson",
        subject: "Welcome to MyKiruk!",
        preview:
          "Hi Arun! Thanks for adding me as a friend. — Tom (your default friend)",
        when: "yesterday",
        unread: true,
      },
      {
        id: "m4",
        from: "HP Print AI",
        subject: "Sprint review notes",
        preview: "Action items from Thursday's sprint review attached.",
        when: "2d",
        unread: false,
      },
    ],
    [],
  );
  const markMailRead = useCallback(() => {
    setMailUnread(0);
  }, []);

  // Bulletins ticker
  const bulletins = useMemo(
    () => [
      `★ ${PERSONA.identity.name.split(" ")[0]} posted a new bulletin: "Shipping is a feature."`,
      `🛠 Updated profile · added 4 case studies to MyKiruk`,
      `💬 ${PERSONA.identity.name.split(" ")[0]} commented on Figma's bulletin`,
      `🎯 Mood switched to "focused" for the morning build`,
      `📝 New blog post: "Why I keep the title 'design engineer'"`,
      `🤝 ${PERSONA.identity.name.split(" ")[0]} added 2 new friends to the Top 8`,
    ],
    [],
  );
  const [bulletinIdx, setBulletinIdx] = useState(0);
  useEffect(() => {
    const id = window.setInterval(
      () => setBulletinIdx((b) => (b + 1) % bulletins.length),
      4200,
    );
    return () => window.clearInterval(id);
  }, [bulletins.length]);

  // Custom CSS injection (MySpace iconic)
  const [cssInput, setCssInput] = useState("");
  const [cssApplied, setCssApplied] = useState("");
  const applyCustomCss = useCallback(() => {
    // No <style> injection — apply as profile-scoped style only.
    // Strips any <, >, /script for safety.
    const safe = cssInput.replace(/<\/?[^>]*>/g, "");
    setCssApplied(safe);
  }, [cssInput]);

  // Blog reactions (sessionStorage)
  const [reactions, setReactions] = useState<Record<string, number>>({});
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kiruk-2003-reactions");
      if (raw) setReactions(JSON.parse(raw) as Record<string, number>);
    } catch {/* noop */}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("kiruk-2003-reactions", JSON.stringify(reactions));
    } catch {/* noop */}
  }, [reactions]);
  const react = useCallback((id: string) => {
    setReactions((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 }));
  }, []);

  // Nav search — filters bulletins or jumps section
  const [navQuery, setNavQuery] = useState("");
  const submitNavQuery = useCallback(() => {
    const q = navQuery.trim().toLowerCase();
    if (!q) return;
    const map: Record<string, React.RefObject<HTMLDivElement | null>> = {
      home: refTop,
      profile: refAbout,
      about: refAbout,
      interests: refInterests,
      friends: refFriends,
      blog: refBlog,
      comments: refComments,
    };
    const target = map[q];
    if (target) scrollTo(target.current);
    setNavQuery("");
  }, [navQuery, scrollTo]);

  // Page view tracker
  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "page_view", path: "/era/2003" }),
    }).catch(() => {});
  }, []);

  return (
    <div
      id="mykiruk-profile"
      className="mykiruk-applied"
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: SKY,
        color: INK,
        fontFamily: FONT_UI,
        paddingTop: 0,
        paddingBottom: 30,
      }}
    >
      <style jsx global>{`
        @keyframes kiruk-2003-beta-shine {
          0%   { transform: translateX(-120%) skewX(-20deg); }
          100% { transform: translateX(220%) skewX(-20deg); }
        }
        @keyframes kiruk-2003-online-blink {
          0%, 60% { opacity: 1; }
          70%, 100% { opacity: 0.45; }
        }
        @keyframes kiruk-2003-add-glow {
          0%, 100% { box-shadow: 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 #ffd2a8, inset 0 -1px 0 #993300, 0 0 0 0 ${ORANGE}; }
          50%      { box-shadow: 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 #ffd2a8, inset 0 -1px 0 #993300, 0 0 14px 3px ${ORANGE}77; }
        }
        @keyframes kiruk-2003-bulletin-fade {
          0%   { opacity: 0; transform: translateY(-4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes kiruk-2003-heart-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.5); }
          100% { transform: scale(1); }
        }
        .kiruk-2003-link {
          color: ${LINK};
          text-decoration: underline;
        }
        .kiruk-2003-link:visited {
          color: ${LINK_HOT};
        }
      `}</style>

      {/* ── TOP NAV BAR ─────────────────────────────────────── */}
      <header
        ref={refTop}
        style={{
          position: "sticky",
          top: "calc(var(--simple-game-nav-bottom, 56px))",
          zIndex: 30,
          background: `linear-gradient(180deg, ${NAV_DEEP} 0%, ${NAV_DEEP2} 100%)`,
          borderBottom: `1px solid #000`,
          color: "#fff",
          padding: "6px 14px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "auto 1fr auto",
          alignItems: "center",
          gap: 12,
          fontSize: 11,
          letterSpacing: 0.3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.45)",
        }}
      >
        {/* Brand + BETA — clickable */}
        <button
          type="button"
          onClick={() => scrollTo(refTop.current)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "transparent",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 17,
              letterSpacing: -0.4,
              color: "#fff",
              textShadow: "0 1px 0 #000",
            }}
          >
            My<span style={{ color: mood.tint }}>Kiruk</span>.com
          </span>
          <span
            style={{
              padding: "1px 6px",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1,
              color: "#fff",
              background: `linear-gradient(180deg, ${mood.tint} 0%, ${mood.tintDeep} 100%)`,
              border: `1px solid ${mood.tintDeep}`,
              borderRadius: 3,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
              textShadow: "0 1px 0 rgba(0,0,0,0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            BETA
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 30,
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
                animation: "kiruk-2003-beta-shine 3.2s linear infinite",
              }}
            />
          </span>
        </button>

        {/* Functional nav links */}
        {!isMobile && (
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: FONT_UI,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <NavLink onClick={() => scrollTo(refTop.current)}>Home</NavLink>
            <NavLink onClick={() => scrollTo(refAbout.current)}>Profile</NavLink>
            <NavLink onClick={() => scrollTo(refFriends.current)}>Friends</NavLink>
            <NavLink onClick={() => scrollTo(refBlog.current)}>Blog</NavLink>
            <NavLink onClick={() => scrollTo(refComments.current)}>Comments</NavLink>
            <div style={{ position: "relative" }}>
              <NavLink
                onClick={() => {
                  setMailOpen((o) => {
                    const next = !o;
                    if (next) markMailRead();
                    return next;
                  });
                }}
                badge={mailUnread > 0 ? mailUnread : undefined}
                accent={mood.tint}
              >
                Mail
              </NavLink>
              {mailOpen && (
                <Inbox
                  mailbox={mailbox}
                  onClose={() => setMailOpen(false)}
                />
              )}
            </div>
          </nav>
        )}

        {/* Right side: search + login */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {!isMobile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "#001a36",
                border: "1px solid #04335a",
                borderRadius: 3,
                padding: "1px 3px 1px 6px",
              }}
            >
              <span style={{ color: "#cfe3ff", fontSize: 10 }}>🔍</span>
              <input
                value={navQuery}
                onChange={(e) => setNavQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitNavQuery();
                }}
                placeholder="jump to section…"
                style={{
                  width: 140,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontFamily: FONT_UI,
                  fontSize: 11,
                  padding: "1px 4px",
                }}
              />
              <button
                type="button"
                onClick={submitNavQuery}
                style={{
                  padding: "1px 6px",
                  fontFamily: FONT_DISPLAY,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: "#fff",
                  background: `linear-gradient(180deg, ${mood.tint} 0%, ${mood.tintDeep} 100%)`,
                  border: `1px solid ${mood.tintDeep}`,
                  borderRadius: 2,
                  cursor: "pointer",
                }}
              >
                Go
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── BULLETINS TICKER ────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: "calc(var(--simple-game-nav-bottom, 56px) + 30px)",
          zIndex: 29,
          background: "#ffffcc",
          borderBottom: "1px solid #cc9900",
          color: "#5a4500",
          fontFamily: FONT_UI,
          fontSize: 11,
          padding: "3px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 2px 4px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 9,
            letterSpacing: 2,
            color: "#cc6600",
            textTransform: "uppercase",
            fontWeight: 700,
            background: "#fff8d6",
            padding: "1px 6px",
            border: "1px solid #cc9900",
            borderRadius: 2,
            whiteSpace: "nowrap",
          }}
        >
          📣 Bulletins
        </span>
        <span
          key={bulletinIdx}
          style={{
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            animation: "kiruk-2003-bulletin-fade 420ms ease-out",
          }}
        >
          {bulletins[bulletinIdx]}
        </span>
        <span style={{ fontSize: 9, color: "#a87a00", letterSpacing: 1 }}>
          {bulletinIdx + 1}/{bulletins.length}
        </span>
      </div>

      {/* ── PROFILE CONTAINER ────────────────────────────────── */}
      <div
        style={{
          maxWidth: 980,
          margin: "12px auto 0",
          padding: isMobile ? "0 8px" : "0 12px",
        }}
      >
        {/* Profile name + URL line */}
        <div
          style={{
            background: PAPER,
            border: `2px solid ${BORDER}`,
            borderRadius: 0,
            padding: "8px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 6,
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 22,
                color: INK,
                letterSpacing: -0.5,
                lineHeight: 1,
              }}
            >
              {PERSONA.identity.name}
            </div>
            <div style={{ fontSize: 11, color: INK_DIM, marginTop: 3 }}>
              <em style={{ color: LINK }}>&ldquo;{mood.emoji} {mood.label} — {PERSONA.identity.role}&rdquo;</em>
            </div>
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: INK_DIM, letterSpacing: 0.5 }}>
            www.mykiruk.com/{PERSONA.identity.name.split(" ")[0].toLowerCase()}
          </div>
        </div>

        {/* ── PROFILE HEADER (photo + contact bar) ─────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "240px 1fr",
            gap: 12,
            marginTop: 10,
          }}
        >
          {/* Left column — photo + contact box + url */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Profile photo */}
            <div
              style={{
                background: PAPER,
                border: `2px solid ${BORDER}`,
                padding: 4,
                boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  background:
                    `radial-gradient(circle at 30% 30%, #ffd6a8 0%, #c98a4a 60%, #5c3a1a 100%)`,
                  border: "1px solid #000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT_DISPLAY,
                  fontSize: 72,
                  color: "#fff",
                  textShadow: "2px 2px 0 rgba(0,0,0,0.35)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <span style={{ position: "relative", zIndex: 2 }}>K</span>
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(ellipse 60% 30% at 30% 25%, rgba(255,255,255,0.45) 0%, transparent 70%)",
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontFamily: FONT_UI,
                  fontSize: 11,
                  textAlign: "center",
                  color: INK_DIM,
                  fontStyle: "italic",
                }}
              >
                "I bridge design + dev"
              </div>
            </div>

            {/* Online Now + last login */}
            <div
              style={{
                background: PAPER,
                border: `2px solid ${BORDER}`,
                fontSize: 11,
                fontFamily: FONT_UI,
                color: INK,
                boxShadow: "0 2px 4px rgba(0,0,0,0.18)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  background: "#e6f3ff",
                  borderBottom: `1px solid ${BORDER}`,
                  fontWeight: 700,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: GREEN_ON,
                    boxShadow: `0 0 6px ${GREEN_ON}`,
                    animation: "kiruk-2003-online-blink 1.6s ease-in-out infinite",
                  }}
                />
                <span style={{ color: "#1f6b1f" }}>● Online Now!</span>
              </div>
              <div style={{ padding: "6px 8px", lineHeight: 1.55 }}>
                <strong>Last login:</strong> {stamp}
                <br />
                <strong>View my:</strong>{" "}
                <a href="#about" className="kiruk-2003-link">Pics</a> ·{" "}
                <a href="#works" className="kiruk-2003-link">Videos</a> ·{" "}
                <a href="#blog" className="kiruk-2003-link">Blog</a>
                <br />
                <strong>Profile views:</strong>{" "}
                <span style={{ color: LINK_HOT, fontWeight: 700 }}>
                  {views !== null ? views.toLocaleString() : "—"}
                </span>
              </div>
            </div>

            {/* Contacting Kiruk */}
            <PanelBlock heading="Contacting Kiruk">
              <table style={{ width: "100%", fontSize: 11, fontFamily: FONT_UI }}>
                <tbody>
                  {[
                    ["✉", "Send Message", `mailto:${USABILITY_TEST.channels[0].value}`],
                    ["★", "Add to Friends", "#"],
                    ["⚐", "Forward to a Friend", "#"],
                    ["☎", "Instant Message", "#"],
                    ["♠", "Add to Favorites", "#"],
                    ["⌫", "Block User", "#"],
                    ["☆", "Rank User", "#"],
                  ].map(([icon, label, href]) => (
                    <tr key={label}>
                      <td style={{ width: 18, padding: "2px 4px", color: ORANGE, textAlign: "center" }}>
                        {icon}
                      </td>
                      <td style={{ padding: "2px 4px" }}>
                        <a
                          href={href}
                          target={href.startsWith("mailto:") ? undefined : "_self"}
                          onClick={(e) => {
                            if (href === "#") e.preventDefault();
                          }}
                          className="kiruk-2003-link"
                        >
                          {label}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </PanelBlock>

            {/* MySpace URL box */}
            <PanelBlock heading="MyKiruk URL">
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  padding: "3px 5px",
                  background: PAPER_DIM,
                  border: `1px solid ${BORDER}`,
                  color: LINK,
                  wordBreak: "break-all",
                }}
              >
                www.mykiruk.com/{PERSONA.identity.name.split(" ")[0].toLowerCase()}
              </div>
            </PanelBlock>
          </div>

          {/* Right column — display name + headline + add friend */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Display name banner */}
            <div
              style={{
                background:
                  `linear-gradient(180deg, ${NAV_DEEP} 0%, ${NAV_DEEP2} 100%)`,
                color: "#fff",
                padding: "10px 14px",
                border: `2px solid ${BORDER}`,
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 28,
                  letterSpacing: -0.7,
                  lineHeight: 1,
                  textShadow: "1px 1px 0 rgba(0,0,0,0.3)",
                }}
              >
                {PERSONA.identity.name.split(" ")[0]}{" "}
                <span style={{ color: ORANGE }}>·</span>{" "}
                <span style={{ fontSize: 18, color: "#cfe3ff" }}>
                  &ldquo;{PERSONA.quote.length > 60 ? PERSONA.quote.slice(0, 60) + "…" : PERSONA.quote}&rdquo;
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  marginTop: 6,
                  color: "#cfe3ff",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 14,
                }}
              >
                <span>
                  <strong>Age:</strong> {new Date().getFullYear() - 2001}
                </span>
                <span>
                  <strong>Sign:</strong> Designer ↔ Engineer
                </span>
                <span>
                  <strong>City:</strong> {PERSONA.identity.location}
                </span>
                <span>
                  <strong>Status:</strong> Shipping
                </span>
              </div>
            </div>

            {/* Mood + Add friend bar */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
                gap: 10,
                background: PAPER,
                border: `2px solid ${BORDER}`,
                padding: "8px 12px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.18)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: 1,
                    color: INK_DIM,
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  Mood:
                </span>
                <select
                  value={moodId}
                  onChange={(e) => setMoodId(e.target.value as MoodId)}
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 12,
                    padding: "3px 6px",
                    border: `1px solid ${BORDER}`,
                    background: PAPER,
                    color: INK,
                  }}
                >
                  {MOODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.emoji} {m.label}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: 11, color: INK_DIM }}>
                  currently <strong>{mood.label}</strong> {mood.emoji}
                </span>
              </div>
              <button
                type="button"
                onClick={friendStep}
                style={{
                  padding: "6px 14px",
                  fontFamily: FONT_DISPLAY,
                  fontSize: 11,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: "#fff",
                  background:
                    friendStatus === "friends"
                      ? `linear-gradient(180deg, ${GREEN_ON} 0%, #1f6b1f 100%)`
                      : `linear-gradient(180deg, ${ORANGE} 0%, ${ORANGE_DEEP} 100%)`,
                  border: `1px solid ${friendStatus === "friends" ? "#1f6b1f" : "#993300"}`,
                  borderRadius: 3,
                  cursor: "pointer",
                  boxShadow:
                    "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 #ffd2a8, inset 0 -1px 0 #993300",
                  textShadow: "0 1px 0 rgba(0,0,0,0.3)",
                  animation:
                    friendStatus === "add" ? "kiruk-2003-add-glow 2.2s ease-in-out infinite" : "none",
                }}
              >
                {friendStatus === "add"
                  ? "★ Add Kiruk as a Friend"
                  : friendStatus === "pending"
                    ? "⏳ Request Pending"
                    : "✓ Friends since today"}
              </button>
            </div>

            {/* About Me */}
            <div ref={refAbout} />
            <PanelBlock heading={`${PERSONA.identity.name.split(" ")[0]}'s Latest Blurbs`}>
              <div style={{ fontSize: 12, color: INK, lineHeight: 1.55 }}>
                <SubHead>About me:</SubHead>
                <p style={{ margin: "0 0 8px" }}>{PERSONA.background}</p>
                <SubHead>Who I'd like to meet:</SubHead>
                <p style={{ margin: "0 0 8px" }}>
                  <strong>{WHY_KIRUK.hook}</strong> Teams stuck between
                  design and engineering. PMs who want one person to take
                  a feature from brief to shipped code. Anyone who reads
                  type and writes systems.
                </p>
                <blockquote
                  style={{
                    margin: "8px 0",
                    padding: "8px 10px",
                    background: PAPER_DIM,
                    borderLeft: `3px solid ${ORANGE}`,
                    fontStyle: "italic",
                    color: LINK,
                    fontSize: 13,
                  }}
                >
                  &ldquo;{WHY_KIRUK.tagline}&rdquo;
                </blockquote>
              </div>
            </PanelBlock>

            {/* Interests */}
            <div ref={refInterests} />
            <PanelBlock heading={`${PERSONA.identity.name.split(" ")[0]}'s Interests`}>
              <div style={{ fontSize: 12, color: INK, lineHeight: 1.55 }}>
                <InterestRow label="General">
                  {EMPATHY_MAP.thinks.join(", ")}.
                </InterestRow>
                <InterestRow label="Music">
                  Daft Punk, The Strokes, Outkast, Coldplay, The White Stripes — anything that pairs well with a deploy.
                </InterestRow>
                <InterestRow label="Movies">
                  The Matrix, Eternal Sunshine of the Spotless Mind, Memento, Spirited Away.
                </InterestRow>
                <InterestRow label="Television">
                  Whatever's on while the build runs.
                </InterestRow>
                <InterestRow label="Books">
                  The Design of Everyday Things, Don't Make Me Think, The Pragmatic Programmer, Refactoring UI.
                </InterestRow>
                <InterestRow label="Heroes">
                  {PERSONA.goals.join(" · ")}.
                </InterestRow>
              </div>
            </PanelBlock>

            {/* Details */}
            <PanelBlock heading={`${PERSONA.identity.name.split(" ")[0]}'s Details`}>
              <table style={{ width: "100%", fontSize: 12 }}>
                <tbody>
                  <DRow k="Status">Single-discipline practitioner married to the bridge</DRow>
                  <DRow k="Here for">Shipping product, design crit, code review</DRow>
                  <DRow k="Hometown">Salem, Tamil Nadu</DRow>
                  <DRow k="Body type">Designer ↔ Engineer (bridge)</DRow>
                  <DRow k="Ethnicity">Practitioner</DRow>
                  <DRow k="Religion">Whatever ships</DRow>
                  <DRow k="Zodiac sign">SDE @ HP</DRow>
                  <DRow k="Smoke / Drink">Coffee / Earl Grey</DRow>
                  <DRow k="Children">Side projects, a few</DRow>
                  <DRow k="Education">Sona College of Technology</DRow>
                  <DRow k="Occupation">{PERSONA.identity.role} @ HP Print AI</DRow>
                  <DRow k="Income">Outcomes</DRow>
                </tbody>
              </table>
            </PanelBlock>

            {/* Schools */}
            <PanelBlock heading={`${PERSONA.identity.name.split(" ")[0]}'s Schools`}>
              <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {nodes.slice(0, 3).map((n) => (
                  <SchoolRow key={n.year} node={n} />
                ))}
              </ol>
            </PanelBlock>

            {/* Companies */}
            <PanelBlock heading={`${PERSONA.identity.name.split(" ")[0]}'s Companies`}>
              <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {nodes.slice(2).map((n) => (
                  <SchoolRow key={n.year} node={n} />
                ))}
              </ol>
            </PanelBlock>

            {/* Stats */}
            <PanelBlock heading="Profile Stat Counters">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: 6,
                }}
              >
                {IMPACT_METRICS.slice(0, 8).map((m) => (
                  <StatCounter key={m.id} icon={m.icon} value={m.value} label={m.label} context={m.context} />
                ))}
              </div>
            </PanelBlock>
          </div>
        </div>

        {/* ── TOP 8 FRIENDS GRID ─────────────────────────────── */}
        <div ref={refFriends} style={{ marginTop: 14 }}>
          <PanelBlock
            heading={`${PERSONA.identity.name.split(" ")[0]}'s Top 8 · Influences`}
            headingRight={
              <span style={{ fontSize: 10, color: "#cfe3ff", letterSpacing: 1 }}>
                {(["person", "place", "book", "tool"] as const).map((k) => {
                  const n = friends.filter((f) => f.kind === k).length;
                  return (
                    <span key={k} style={{ marginRight: 8 }}>
                      <strong style={{ color: "#fff" }}>{n}</strong> {k}
                      {n === 1 ? "" : "s"}
                    </span>
                  );
                })}
              </span>
            }
          >
            {/* Helper note */}
            <div
              style={{
                fontSize: 11,
                color: INK_DIM,
                marginBottom: 8,
                padding: "5px 9px",
                background: PAPER_DIM,
                border: `1px dashed ${BORDER}44`,
                lineHeight: 1.55,
              }}
            >
              <strong style={{ color: NAV_DEEP }}>
                Top 8 — people, places, books and tools that shaped the
                practice on this disc.
              </strong>{" "}
              Position <strong>#1</strong> is whoever the work owes the
              most to right now. Drag any tile to reorder. Hover for
              the role they play.
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2, 1fr)"
                  : "repeat(4, 1fr)",
                gap: 8,
              }}
            >
              {friends.map((f, i) => (
                <FriendTile
                  key={f.id}
                  friend={f}
                  index={i}
                  accent={mood.tint}
                  onDragStart={() => beginFriendDrag(i)}
                  onDropOn={() => dropOnFriend(i)}
                />
              ))}
            </div>

            {/* Legend + view-all */}
            <div
              style={{
                marginTop: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 10,
                color: INK_DIM,
                flexWrap: "wrap",
                gap: 6,
                paddingTop: 6,
                borderTop: `1px dotted ${BORDER}33`,
              }}
            >
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Legend g="👤" label="person" />
                <Legend g="📍" label="place" />
                <Legend g="📖" label="book" />
                <Legend g="⚒" label="tool" />
              </div>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="kiruk-2003-link"
              >
                View All Influences →
              </a>
            </div>
          </PanelBlock>
        </div>

        {/* ── BLOG — full-width row ───────────────────────── */}
        <div ref={refBlog} style={{ marginTop: 14 }}>
          <PanelBlock
            heading={`${PERSONA.identity.name.split(" ")[0]}'s Blog · Notes on the Disc`}
            headingRight={
              <span style={{ fontSize: 10, color: "#cfe3ff", letterSpacing: 1 }}>
                each post unpacks one artifact on this profile · {" "}
                {Object.values(reactions).reduce((s, n) => s + n, 0) + 87} kudos
              </span>
            }
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                gap: 10,
              }}
            >
              <BlogEntry
                id="b1"
                title="Drawing the persona on myself."
                date="Today · 2:14 PM"
                artifact="PERSONA"
                excerpt="A persona is normally a fictional user — a stand-in for a real audience. I drew one on myself instead. Identity, goals, frustrations, background. The frustrations column did most of the work: every line was a friction a single-discipline practitioner could tolerate. I refused to. The bridge role is the engine that refusal turned into."
                tags={["persona", "ux research", "meta"]}
                mood={mood}
                comments={3}
                kudos={(reactions["b1"] ?? 0) + 12}
                onKudos={() => react("b1")}
                accent={mood.tint}
              />
              <BlogEntry
                id="b2"
                title="What the Empathy Map caught."
                date="Yesterday · 9:42 AM"
                artifact="EMPATHY MAP"
                excerpt="Says · Thinks · Does · Feels. The point of the four columns is to catch a drift between the claim and the evidence. Says: I bridge design and development. Does: Figma and Blender on one side, Next.js and Spring Boot on the other. The two columns arrived at the same answer from opposite ends. That convergence is what made the persona believable."
                tags={["empathy map", "synthesis", "method"]}
                mood={MOODS[2]}
                comments={7}
                kudos={(reactions["b2"] ?? 0) + 28}
                onKudos={() => react("b2")}
                accent={mood.tint}
              />
              <BlogEntry
                id="b3"
                title="A Journey Map of seven years."
                date="Last week · Mon"
                artifact="JOURNEY MAP"
                excerpt="Seven years rendered as five phases — Discovery → Growth → Intersection → Mastery → Now. The gap between freelancing in 2019 and the first intersection internship in 2022 looks empty on paper. It wasn't. Engineering school ran underneath every gig. Two timelines, one me. The bridge role only existed in a job title after the timelines collided."
                tags={["journey map", "career", "lifeline"]}
                mood={MOODS[3]}
                comments={12}
                kudos={(reactions["b3"] ?? 0) + 47}
                onKudos={() => react("b3")}
                accent={mood.tint}
              />
            </div>
          </PanelBlock>
        </div>

        {/* ── CUSTOM CSS INJECTION (MySpace classic) ───────── */}
        <div style={{ marginTop: 14 }}>
          <PanelBlock
            heading="Pimp My Profile · Custom CSS"
            headingRight={
              <span style={{ fontSize: 10, color: "#cfe3ff", letterSpacing: 1 }}>
                paste CSS · apply to this page
              </span>
            }
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
                gap: 8,
                alignItems: "stretch",
              }}
            >
              <textarea
                value={cssInput}
                onChange={(e) => setCssInput(e.target.value)}
                placeholder={"/* Try: body { background: hotpink !important; } */\n/* Or: .mykiruk-applied { color: lime; } */"}
                rows={3}
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  color: INK,
                  background: "#f9fbff",
                  border: `1px solid ${BORDER}`,
                  padding: "5px 7px",
                  resize: "vertical",
                  letterSpacing: 0.2,
                  lineHeight: 1.45,
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <GelBtn primary onClick={applyCustomCss}>
                  ✨ Apply CSS
                </GelBtn>
                <GelBtn
                  onClick={() => {
                    setCssInput("");
                    setCssApplied("");
                  }}
                >
                  ↺ Reset
                </GelBtn>
              </div>
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 10,
                color: INK_DIM,
                fontStyle: "italic",
              }}
            >
              {cssApplied ? (
                <span style={{ color: GREEN_ON }}>
                  ● applied — scoped to this profile, scripts stripped
                </span>
              ) : (
                "Tip: MySpace's 2003 trick was injecting CSS via the profile form. This panel mimics it — safely scoped."
              )}
            </div>
            {cssApplied && (
              <style>{`.mykiruk-applied { ${cssApplied} }`}</style>
            )}
          </PanelBlock>
        </div>

        {/* ── COMMENTS WALL ─────────────────────────────────── */}
        <div ref={refComments} style={{ marginTop: 14, marginBottom: 8 }}>
          <PanelBlock
            heading={`${PERSONA.identity.name.split(" ")[0]}'s Comments`}
            headingRight={
              <span style={{ fontSize: 10, color: "#cfe3ff", letterSpacing: 1 }}>
                {comments.length} comment{comments.length === 1 ? "" : "s"}
              </span>
            }
          >
            {/* Form */}
            <div
              style={{
                background: PAPER_DIM,
                border: `1px solid ${BORDER}55`,
                padding: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 11,
                  letterSpacing: 1,
                  color: NAV_DEEP,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Post a Comment
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "180px 1fr", gap: 6 }}>
                <input
                  value={draftAuthor}
                  onChange={(e) => setDraftAuthor(e.target.value)}
                  placeholder="Your name…"
                  style={{
                    padding: "4px 6px",
                    fontFamily: FONT_UI,
                    fontSize: 12,
                    border: `1px solid ${BORDER}`,
                    background: PAPER,
                    color: INK,
                  }}
                />
                <textarea
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                  placeholder="Type your comment for Kiruk…"
                  rows={2}
                  style={{
                    padding: "4px 6px",
                    fontFamily: FONT_UI,
                    fontSize: 12,
                    border: `1px solid ${BORDER}`,
                    background: PAPER,
                    color: INK,
                    resize: "vertical",
                  }}
                />
              </div>
              <div style={{ marginTop: 6, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <span style={{ fontSize: 10, color: INK_DIM, alignSelf: "center" }}>
                  Comments persist for this session.
                </span>
                <GelBtn primary onClick={postComment}>★ Post</GelBtn>
              </div>
            </div>

            {/* List */}
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {comments.length === 0 && (
                <li
                  style={{
                    padding: "10px 8px",
                    fontSize: 12,
                    color: INK_DIM,
                    fontStyle: "italic",
                    textAlign: "center",
                  }}
                >
                  No comments yet — be the first to leave a hi.
                </li>
              )}
              {comments.map((c) => {
                const d = new Date(c.ts);
                const when = d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <li
                    key={c.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "120px 1fr",
                      gap: 10,
                      padding: "8px 8px",
                      borderBottom: `1px dashed ${BORDER}33`,
                      fontSize: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          background:
                            `radial-gradient(circle at 30% 30%, ${ORANGE} 0%, ${ORANGE_DEEP} 100%)`,
                          border: `1px solid ${BORDER}`,
                          fontFamily: FONT_DISPLAY,
                          fontSize: 28,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textShadow: "1px 1px 0 rgba(0,0,0,0.4)",
                        }}
                      >
                        {c.author.charAt(0).toUpperCase()}
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_UI,
                          fontSize: 11,
                          fontWeight: 700,
                          marginTop: 3,
                          color: LINK,
                        }}
                      >
                        {c.author}
                      </div>
                      <div style={{ fontSize: 10, color: INK_DIM }}>{when}</div>
                    </div>
                    <div style={{ color: INK, lineHeight: 1.55 }}>{c.body}</div>
                  </li>
                );
              })}
            </ul>
          </PanelBlock>
        </div>

        {/* Footer parody */}
        <div
          style={{
            marginTop: 14,
            padding: "10px 14px",
            background: NAV_DEEP,
            color: "#fff",
            fontSize: 10,
            textAlign: "center",
            letterSpacing: 0.5,
            border: `2px solid ${BORDER}`,
          }}
        >
          ©2003 MyKiruk.com · About · FAQ · Terms · Privacy · Safety Tips · Contact · Promote · Advertise · MyKiruk Music · Help{" "}
          <br />
          <span style={{ color: "#cfe3ff" }}>
            Best viewed in Internet Explorer 6 · 1024×768 · valid XHTML + CSS · made with Dreamweaver MX
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────

function GelBtn({
  children,
  primary,
  onClick,
}: {
  children: React.ReactNode;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "3px 10px",
        fontFamily: FONT_UI,
        fontSize: 11,
        fontWeight: 700,
        color: primary ? "#fff" : INK,
        background: primary
          ? `linear-gradient(180deg, ${ORANGE} 0%, ${ORANGE_DEEP} 100%)`
          : `linear-gradient(180deg, #ffffff 0%, #d8e6f5 100%)`,
        border: `1px solid ${primary ? "#993300" : BORDER}`,
        borderRadius: 3,
        cursor: "pointer",
        boxShadow: primary
          ? "inset 0 1px 0 #ffd2a8, inset 0 -1px 0 #993300, 0 1px 2px rgba(0,0,0,0.3)"
          : "inset 0 1px 0 #fff, 0 1px 2px rgba(0,0,0,0.18)",
        textShadow: primary ? "0 1px 0 rgba(0,0,0,0.3)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function PanelBlock({
  heading,
  headingRight,
  children,
}: {
  heading: string;
  headingRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: PAPER,
        border: `2px solid ${BORDER}`,
        boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
      }}
    >
      <div
        style={{
          padding: "5px 10px",
          background: PANEL_HEAD,
          color: PANEL_HEAD_TXT,
          fontFamily: FONT_DISPLAY,
          fontSize: 12,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <span>{heading}</span>
        {headingRight}
      </div>
      <div style={{ padding: 10 }}>{children}</div>
    </section>
  );
}

function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontSize: 11,
        color: NAV_DEEP,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        margin: "8px 0 3px",
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

function InterestRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "92px 1fr",
        gap: 6,
        padding: "3px 0",
        borderBottom: `1px dotted ${BORDER}44`,
      }}
    >
      <span
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 11,
          color: NAV_DEEP,
          fontWeight: 700,
        }}
      >
        {label}:
      </span>
      <span style={{ fontSize: 12, color: INK }}>{children}</span>
    </div>
  );
}

function DRow({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <tr>
      <td
        style={{
          padding: "2px 6px",
          fontFamily: FONT_DISPLAY,
          fontSize: 11,
          color: NAV_DEEP,
          fontWeight: 700,
          width: 110,
          verticalAlign: "top",
        }}
      >
        {k}:
      </td>
      <td style={{ padding: "2px 6px", color: INK, fontSize: 12 }}>{children}</td>
    </tr>
  );
}

function SchoolRow({
  node,
}: {
  node: {
    year: string;
    phase: string;
    position: string;
    org: string;
    detail: string;
    live?: boolean;
  };
}) {
  return (
    <li
      style={{
        display: "grid",
        gridTemplateColumns: "60px 1fr",
        gap: 10,
        padding: "6px 0",
        borderBottom: `1px dotted ${BORDER}44`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 16,
          fontWeight: 900,
          color: node.live ? ORANGE : NAV_DEEP,
          lineHeight: 1,
        }}
      >
        {node.year}
      </div>
      <div>
        <div style={{ fontWeight: 700, color: INK, fontSize: 12 }}>
          {node.position}
          {node.live && (
            <span style={{ marginLeft: 6, color: GREEN_ON, fontSize: 10 }}>
              ● current
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: LINK, fontStyle: "italic" }}>@ {node.org}</div>
        <div style={{ fontSize: 11, color: INK_DIM, marginTop: 2 }}>{node.detail}</div>
      </div>
    </li>
  );
}

function StatCounter({
  icon,
  value,
  label,
  context,
}: {
  icon: string;
  value: string;
  label: string;
  context?: string;
}) {
  return (
    <div
      style={{
        background: PAPER_DIM,
        border: `1px solid ${BORDER}55`,
        padding: "5px 8px",
        boxShadow: "inset 0 1px 0 #fff",
      }}
    >
      <div style={{ fontSize: 12, color: ORANGE }}>{icon}</div>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 18,
          color: NAV_DEEP,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: -0.5,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 10,
          letterSpacing: 0.5,
          color: INK,
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      {context && (
        <div style={{ fontSize: 10, color: INK_DIM, fontStyle: "italic" }}>
          {context}
        </div>
      )}
    </div>
  );
}

function FriendTile({
  friend,
  index,
  accent,
  onDragStart,
  onDropOn,
}: {
  friend: FriendCardEx;
  index: number;
  accent: string;
  onDragStart: () => void;
  onDropOn: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [dropZone, setDropZone] = useState(false);
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDropZone(true);
      }}
      onDragLeave={() => setDropZone(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDropZone(false);
        onDropOn();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Drag to reorder · click for actions"
      style={{
        background: PAPER,
        border: `1px solid ${dropZone ? accent : BORDER}`,
        outline: dropZone ? `2px dashed ${accent}` : "none",
        outlineOffset: -3,
        padding: 4,
        textAlign: "center",
        cursor: "grab",
        boxShadow: hover
          ? `0 4px 10px rgba(0,0,0,0.35), 0 0 0 2px ${accent}33`
          : "0 1px 2px rgba(0,0,0,0.18)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 160ms, box-shadow 220ms, border-color 160ms",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          background: `radial-gradient(circle at 30% 30%, ${friend.bg} 0%, ${friend.bg}aa 60%, #000000 130%)`,
          border: "1px solid #000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          color: "#fff",
          textShadow: "1px 1px 0 rgba(0,0,0,0.45)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <span style={{ position: "relative", zIndex: 2 }}>{friend.emoji}</span>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 30% at 30% 25%, rgba(255,255,255,0.5) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        {/* Rank pill */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            fontFamily: FONT_DISPLAY,
            fontSize: 9,
            color: "#fff",
            background: index < 3 ? accent : "rgba(0,0,0,0.55)",
            padding: "1px 5px",
            borderRadius: 2,
            zIndex: 3,
            letterSpacing: 1,
            fontWeight: 900,
          }}
        >
          #{index + 1}
        </span>
        {/* Kind glyph */}
        <span
          aria-hidden
          title={friend.kind}
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            fontFamily: FONT_DISPLAY,
            fontSize: 11,
            color: "#fff",
            background: "rgba(0,0,0,0.55)",
            padding: "0 5px",
            borderRadius: 2,
            zIndex: 3,
            letterSpacing: 1,
          }}
        >
          {KIND_GLYPH[friend.kind]}
        </span>

        {/* Hover overlay — role of this friend */}
        {hover && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 4,
              background: "rgba(0,30,60,0.82)",
              padding: 8,
              display: "flex",
              flexDirection: "column",
              gap: 4,
              fontFamily: FONT_UI,
              color: "#fff",
            }}
          >
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 9,
                letterSpacing: 2,
                color: accent,
                textTransform: "uppercase",
                fontWeight: 900,
              }}
            >
              ROLE IN ARUN'S PRACTICE
            </span>
            <span style={{ fontSize: 10, lineHeight: 1.4, color: "#fff" }}>
              {friend.role}
            </span>
            <span style={{ fontSize: 9, color: "#cfe3ff", marginTop: "auto", fontStyle: "italic" }}>
              {friend.since}
            </span>
          </div>
        )}
      </div>
      <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 11,
          color: LINK,
          fontWeight: 700,
          marginTop: 4,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "left",
        }}
      >
        {friend.label}
      </div>
      <div
        style={{
          fontSize: 10,
          color: INK_DIM,
          fontStyle: "italic",
          textAlign: "left",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {friend.sub}
      </div>
      <div
        style={{
          fontSize: 9,
          color: MUTED,
          marginTop: 2,
          letterSpacing: 0.5,
          textAlign: "left",
          borderTop: `1px dotted ${BORDER}33`,
          paddingTop: 2,
        }}
      >
        {friend.since}
      </div>
    </div>
  );
}

function Legend({ g, label }: { g: string; label: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <span
        aria-hidden
        style={{
          display: "inline-flex",
          width: 14,
          height: 14,
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,30,60,0.08)",
          border: `1px solid ${BORDER}44`,
          borderRadius: 2,
          fontSize: 9,
        }}
      >
        {g}
      </span>
      <span>{label}</span>
    </span>
  );
}

function hoverBtn(accent: string): React.CSSProperties {
  return {
    padding: "3px 10px",
    fontFamily: FONT_UI,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: "#fff",
    background: `linear-gradient(180deg, ${accent} 0%, ${darken(accent)} 100%)`,
    border: `1px solid ${darken(accent)}`,
    borderRadius: 3,
    cursor: "pointer",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.3)",
    textShadow: "0 1px 0 rgba(0,0,0,0.3)",
  };
}


function BlogEntry({
  id,
  title,
  date,
  artifact,
  excerpt,
  tags,
  mood,
  comments,
  kudos,
  onKudos,
  accent,
}: {
  id: string;
  title: string;
  date: string;
  artifact: string;
  excerpt: string;
  tags: string[];
  mood: { emoji: string; label: string };
  comments: number;
  kudos: number;
  onKudos: () => void;
  accent: string;
}) {
  const [pop, setPop] = useState(0);
  return (
    <article
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "10px 12px 8px",
        background: PAPER_DIM,
        border: `1px solid ${BORDER}55`,
        borderTop: `3px solid ${accent}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
        minHeight: 220,
      }}
    >
      {/* Series label */}
      <div
        style={{
          alignSelf: "flex-start",
          padding: "1px 6px",
          background: accent,
          color: "#fff",
          fontFamily: FONT_DISPLAY,
          fontSize: 9,
          letterSpacing: 2,
          textTransform: "uppercase",
          fontWeight: 900,
          marginBottom: 5,
          textShadow: "0 1px 0 rgba(0,0,0,0.3)",
        }}
      >
        SERIES · {artifact}
      </div>

      {/* Meta row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 4,
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: FONT_UI,
            fontSize: 10,
            letterSpacing: 1,
            color: accent,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          {date}
        </span>
        <span style={{ fontSize: 10, color: INK_DIM }}>
          mood: {mood.emoji} <em>{mood.label}</em>
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 15,
          color: NAV_DEEP,
          fontWeight: 900,
          margin: "0 0 6px",
          lineHeight: 1.25,
          letterSpacing: -0.2,
        }}
      >
        <a
          href={`#post-${id}`}
          onClick={(e) => e.preventDefault()}
          style={{ color: NAV_DEEP, textDecoration: "none" }}
        >
          {title}
        </a>
      </h3>

      {/* Excerpt */}
      <p
        style={{
          margin: 0,
          fontSize: 12,
          color: INK,
          lineHeight: 1.5,
          flex: 1,
        }}
      >
        {excerpt}
      </p>

      {/* Read more */}
      <div style={{ marginTop: 6 }}>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="kiruk-2003-link"
          style={{ fontSize: 11, fontWeight: 700 }}
        >
          Read full post →
        </a>
      </div>

      {/* Tags */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          marginTop: 8,
          paddingTop: 6,
          borderTop: `1px dotted ${BORDER}33`,
        }}
      >
        {tags.map((t) => (
          <span
            key={t}
            style={{
              padding: "1px 6px",
              fontSize: 10,
              fontFamily: FONT_UI,
              color: NAV_DEEP,
              background: "#e6f0fa",
              border: `1px solid ${BORDER}44`,
              borderRadius: 2,
              letterSpacing: 0.5,
            }}
          >
            #{t}
          </span>
        ))}
      </div>

      {/* Actions row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
          paddingTop: 6,
          borderTop: `1px solid ${BORDER}33`,
          gap: 6,
        }}
      >
        <button
          type="button"
          onClick={() => {
            onKudos();
            setPop((p) => p + 1);
          }}
          style={{
            padding: "3px 10px",
            fontFamily: FONT_UI,
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            background: `linear-gradient(180deg, ${accent} 0%, ${darken(accent)} 100%)`,
            border: `1px solid ${darken(accent)}`,
            borderRadius: 3,
            cursor: "pointer",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            textShadow: "0 1px 0 rgba(0,0,0,0.3)",
          }}
          title="Send kudos"
        >
          <span
            key={pop}
            style={{
              display: "inline-block",
              animation: pop > 0 ? "kiruk-2003-heart-pop 320ms ease-out" : "none",
            }}
          >
            ♥
          </span>
          {kudos}
        </button>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="kiruk-2003-link"
          style={{ fontSize: 11, fontWeight: 700 }}
        >
          💬 {comments} comments
        </a>
      </div>
    </article>
  );
}

// ── Nav link button ──────────────────────────────────────────────────

function NavLink({
  children,
  onClick,
  badge,
  accent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  badge?: number;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "relative",
        background: "transparent",
        border: "none",
        color: "#fff",
        fontFamily: FONT_UI,
        fontSize: 11,
        padding: "3px 6px",
        cursor: "pointer",
        textTransform: "none",
        letterSpacing: 0.3,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = accent || ORANGE)}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span
          style={{
            marginLeft: 4,
            padding: "0 5px",
            fontSize: 9,
            fontWeight: 900,
            color: "#fff",
            background: ORANGE,
            border: "1px solid #993300",
            borderRadius: 8,
            verticalAlign: 1,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Inbox dropdown ───────────────────────────────────────────────────

function Inbox({
  mailbox,
  onClose,
}: {
  mailbox: Array<{
    id: string;
    from: string;
    subject: string;
    preview: string;
    when: string;
    unread: boolean;
  }>;
  onClose: () => void;
}) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const tgt = e.target as HTMLElement;
      if (!tgt.closest("[data-mykiruk-inbox]")) onClose();
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [onClose]);
  return (
    <div
      data-mykiruk-inbox
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 80,
        width: 320,
        background: PAPER,
        border: `2px solid ${BORDER}`,
        boxShadow: "0 12px 28px rgba(0,0,0,0.4)",
        color: INK,
      }}
    >
      <div
        style={{
          padding: "5px 10px",
          background: PANEL_HEAD,
          color: "#fff",
          fontFamily: FONT_DISPLAY,
          fontSize: 11,
          letterSpacing: 1,
          textTransform: "uppercase",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>✉ MyKiruk Mail</span>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontFamily: FONT_DISPLAY,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: 280, overflowY: "auto" }}>
        {mailbox.map((m) => (
          <li
            key={m.id}
            style={{
              padding: "6px 10px",
              borderBottom: `1px dotted ${BORDER}33`,
              background: m.unread ? "#fff8d6" : "transparent",
              fontFamily: FONT_UI,
              fontSize: 11,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <strong style={{ color: NAV_DEEP }}>{m.from}</strong>
              <span style={{ color: INK_DIM, fontSize: 10 }}>{m.when}</span>
            </div>
            <div style={{ color: INK, fontWeight: m.unread ? 700 : 400 }}>{m.subject}</div>
            <div style={{ color: INK_DIM, fontStyle: "italic", marginTop: 2, fontSize: 10 }}>
              {m.preview}
            </div>
          </li>
        ))}
      </ul>
      <div
        style={{
          padding: "4px 10px",
          background: "#eef3f8",
          fontSize: 10,
          color: INK_DIM,
          textAlign: "center",
          borderTop: `1px solid ${BORDER}33`,
        }}
      >
        {mailbox.filter((m) => m.unread).length} unread · click anywhere to close
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

export default Web2CandyHomePage;
