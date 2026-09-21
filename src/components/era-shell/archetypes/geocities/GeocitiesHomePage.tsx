"use client";

/**
 * GeocitiesHomePage — 1995 archetype home: a personal homepage hosted on
 * a fictional GeoCities neighborhood. No browser chrome here — the page
 * IS the page. Comic Sans, neon yellow on deep navy, rainbow rules,
 * scrolling marquee, hit counter, MIDI badge, guestbook, sparkle cursor.
 *
 * Unique 1995 interactions:
 *   - sparkle cursor trail (✦) on mousemove
 *   - working guestbook: sign + view (entries persist in sessionStorage)
 *   - hit counter ticks once per visit, persists per session
 *   - MIDI player widget with mute/unmute toggle (purely visual; no audio
 *     because era-correct autoplaying MIDI in 2026 = bad manners)
 *   - "Surprise me" web-ring teleport — a fake "loading…" dialog types
 *     the destination URL char by char, then offers to visit
 *   - neighborhood badge updates with simulated "GeoCities address"
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Comic_Neue } from "next/font/google";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  WHY_KIRUK,
  PERSONA,
  EMPATHY_MAP,
  buildTimeline,
  IMPACT_METRICS,
  CARD_SORTING,
} from "@/data/era-page-content";

const comic = Comic_Neue({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-comic",
});

// ── Palette (era spec: yellow/magenta/cyan on deep navy) ────────────────
const NAVY = "#000033";
const CREAM = "#ffff99";
const YELLOW = "#ffff00";
const MAGENTA = "#ff00ff";
const CYAN = "#00ffff";
const HOT_PINK = "#ff66cc";
const LIME = "#66ff66";

const FONT_COMIC = '"Comic Sans MS", "Comic Neue", Chalkboard, cursive';
const FONT_MONO = '"Courier New", Courier, monospace';

const SECTIONS = [
  { id: "welcome",  title: "Welcome to MY page!" },
  { id: "about",    title: "About Me" },
  { id: "thoughts", title: "My Thoughts (Empathy Map)" },
  { id: "journey",  title: "My Path So Far" },
  { id: "trophies", title: "My Trophies" },
  { id: "stuff",    title: "Stuff I've Made" },
  { id: "guestbook",title: "Sign My Guestbook!" },
] as const;

interface GuestEntry {
  name: string;
  body: string;
  time: string;
}

const FORTUNES = [
  "“Ship the prototype today. Polish tomorrow.”",
  "“Design IS engineering — both bend material to user intent.”",
  "“If the build doesn't match the spec, the build is the truth.”",
  "“Hand-coded HTML still beats a broken framework.”",
  "“Your future self will thank you for those design tokens.”",
  "“Comment the WHY. The code already shows the what.”",
  "“The simplest interaction wins. Always.”",
  "“Curiosity beats credentials.”",
];

const FAVOURITES: Array<{ k: string; v: string; tint: string }> = [
  { k: "tool",     v: "Figma · my second canvas",                   tint: "#ff00ff" },
  { k: "stack",    v: "React + Next.js — ship-first kit",           tint: "#00ffff" },
  { k: "ritual",   v: "Morning sketching with filter coffee",       tint: "#ffff00" },
  { k: "music",    v: "Lo-fi + Ilaiyaraaja while building",         tint: "#66ff66" },
  { k: "snack",    v: "Salem-style mysore bonda",                   tint: "#ff66cc" },
  { k: "place",    v: "Bengaluru window, late-evening monsoon",     tint: "#ffffff" },
  { k: "era",      v: "1995 nostalgia, 2025 spatial intuition",     tint: "#ffaa55" },
];

function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 5) return "burning the midnight modem,";
  if (h < 12) return "good morning,";
  if (h < 17) return "good afternoon,";
  if (h < 21) return "good evening,";
  return "browsing late tonight,";
}

const SEED_GUESTBOOK: GuestEntry[] = [
  { name: "Tim @ CERN",      body: "Great use of hyperlinks, very webby!",        time: "1995-08-14 11:42" },
  { name: "Jen <jen@aol>",   body: "Love the GIFs. Sign mine too?",                time: "1995-08-15 09:11" },
  { name: "Rohan, Bengaluru",body: "Bro, ship the print AI demo already :)",      time: "1995-08-16 22:03" },
];

export function GeocitiesHomePage() {
  const { setLayoutMode } = useLayoutMode();
  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);

  // Sparkle trail
  const trailRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let last = 0;
    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - last < 28) return; // throttle
      last = now;
      const root = trailRef.current;
      if (!root) return;
      const sparkle = document.createElement("span");
      sparkle.textContent = "✦";
      const colors = [YELLOW, CYAN, MAGENTA, HOT_PINK, LIME];
      const c = colors[Math.floor(Math.random() * colors.length)];
      sparkle.style.position = "fixed";
      sparkle.style.left = `${e.clientX + (Math.random() * 16 - 8)}px`;
      sparkle.style.top = `${e.clientY + (Math.random() * 16 - 8)}px`;
      sparkle.style.color = c;
      sparkle.style.fontSize = `${10 + Math.floor(Math.random() * 8)}px`;
      sparkle.style.pointerEvents = "none";
      sparkle.style.textShadow = `0 0 6px ${c}`;
      sparkle.style.animation = "kiruk-1995-sparkle 700ms ease-out forwards";
      sparkle.style.zIndex = "70";
      root.appendChild(sparkle);
      window.setTimeout(() => sparkle.remove(), 720);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Real visitor counter — POST page_view to /api/analytics on mount,
  // then GET /api/visitors for the total. Falls back to "—" if backend
  // (Supabase) is unreachable.
  const { trackPageView } = useAnalytics();
  const [hits, setHits] = useState<number | null>(null);
  const [hitsState, setHitsState] = useState<"loading" | "live" | "offline">(
    "loading",
  );
  useEffect(() => {
    let cancelled = false;
    // Fire the page-view track for THIS visit (existing analytics route).
    try {
      trackPageView("/era/1995");
    } catch {
      /* noop */
    }
    // Then fetch the live total.
    fetch("/api/visitors", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json: { total: number | null } | null) => {
        if (cancelled) return;
        if (json && typeof json.total === "number") {
          setHits(json.total);
          setHitsState("live");
        } else {
          setHits(null);
          setHitsState("offline");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHits(null);
          setHitsState("offline");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [trackPageView]);

  // Guestbook state
  const [entries, setEntries] = useState<GuestEntry[]>(SEED_GUESTBOOK);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kiruk-1995-guestbook");
      if (raw) {
        const parsed = JSON.parse(raw) as GuestEntry[];
        setEntries([...SEED_GUESTBOOK, ...parsed]);
      }
    } catch {
      /* noop */
    }
  }, []);
  const sign = useCallback(() => {
    if (!name.trim() || !body.trim()) return;
    const e: GuestEntry = {
      name: name.trim().slice(0, 40),
      body: body.trim().slice(0, 240),
      time: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    setEntries((prev) => {
      const userEntries = prev.filter((p) => !SEED_GUESTBOOK.includes(p));
      const next = [...userEntries, e];
      try {
        sessionStorage.setItem("kiruk-1995-guestbook", JSON.stringify(next));
      } catch {
        /* noop */
      }
      return [...SEED_GUESTBOOK, ...next];
    });
    setName("");
    setBody("");
  }, [name, body]);

  // Page rating (1-5 stars, persists)
  const [rating, setRating] = useState<number>(0);
  const [ratingHover, setRatingHover] = useState<number>(0);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kiruk-1995-rating");
      if (raw) setRating(parseInt(raw, 10) || 0);
    } catch { /* noop */ }
  }, []);
  const setStarRating = useCallback((v: number) => {
    setRating(v);
    try {
      sessionStorage.setItem("kiruk-1995-rating", String(v));
    } catch { /* noop */ }
  }, []);

  // Fortune cookie
  const [fortune, setFortune] = useState<string>("");
  const [fortuneTyped, setFortuneTyped] = useState<string>("");
  const fortuneTimerRef = useRef<number | null>(null);
  const drawFortune = useCallback(() => {
    if (fortuneTimerRef.current !== null) {
      window.clearTimeout(fortuneTimerRef.current);
    }
    const pick = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    setFortune(pick);
    setFortuneTyped("");
    let i = 0;
    const tick = () => {
      i += 1;
      setFortuneTyped(pick.slice(0, i));
      if (i < pick.length) {
        fortuneTimerRef.current = window.setTimeout(tick, 22);
      } else {
        fortuneTimerRef.current = null;
      }
    };
    fortuneTimerRef.current = window.setTimeout(tick, 80);
  }, []);
  useEffect(() => {
    return () => {
      if (fortuneTimerRef.current !== null) {
        window.clearTimeout(fortuneTimerRef.current);
      }
    };
  }, []);

  // Hideable sidebar — persists across reloads within the session
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kiruk-1995-sidebar");
      if (raw === "0") setSidebarOpen(false);
    } catch { /* noop */ }
  }, []);
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((s) => {
      const next = !s;
      try {
        sessionStorage.setItem("kiruk-1995-sidebar", next ? "1" : "0");
      } catch { /* noop */ }
      return next;
    });
  }, []);

  const nodes = useMemo(buildTimeline, []);
  const lastModified = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    [],
  );
  const neighborhood = useMemo(() => {
    const choices = ["Hollywood/Webmasters", "SiliconValley/Bay", "Area51/Studio", "SunsetStrip/Designers"];
    return choices[Math.floor((Date.now() / 1000) % choices.length)];
  }, []);

  return (
    <div
      id="geocities-home"
      className={comic.className}
      style={{
        backgroundColor: NAVY,
        color: CREAM,
        fontFamily: FONT_COMIC,
        minHeight: "100vh",
        paddingTop: "calc(var(--simple-game-nav-bottom, 56px) + 12px)",
        paddingBottom: 40,
      }}
    >
      {/* Sparkle trail mount point */}
      <div ref={trailRef} aria-hidden />
      <style jsx global>{`
        @keyframes kiruk-1995-sparkle {
          from { opacity: 1; transform: translate(0, 0) scale(1); }
          to   { opacity: 0; transform: translate(0, -16px) scale(0.5); }
        }
        @keyframes kiruk-1995-rainbow {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes kiruk-1995-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes kiruk-1995-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes kiruk-1995-glow-pulse {
          0%, 100% { box-shadow: 0 0 8px ${MAGENTA}, 0 0 18px ${MAGENTA}; }
          50%      { box-shadow: 0 0 14px ${CYAN}, 0 0 28px ${CYAN}; }
        }
      `}</style>

      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        {/* TOP MARQUEE */}
        <div
          style={{
            border: `1px solid ${MAGENTA}`,
            backgroundColor: "#000000",
            color: YELLOW,
            padding: "4px 0",
            fontFamily: FONT_COMIC,
            fontSize: 14,
            overflow: "hidden",
            marginBottom: 14,
          }}
        >
          <Marquee
            items={[
              "✦ Welcome to KIRUK's homepage on the World Wide Web ✦",
              "★ Hand-coded with love · MIDI may autoplay · scroll for guestbook ★",
              "✿ Best viewed in Netscape Navigator 2.0 at 800×600 ✿",
              "✶ Member of THE KIRUK RING — visit my friends below ✶",
            ]}
          />
        </div>

        {/* HERO */}
        <section
          id="welcome"
          style={{
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <RainbowHeading>WELCOME TO KIRUK</RainbowHeading>
          <div
            style={{
              fontFamily: FONT_COMIC,
              fontSize: 18,
              color: HOT_PINK,
              marginTop: 6,
            }}
          >
            ~*~ a design engineer's corner of the WEB ~*~
          </div>
          <div
            style={{
              fontFamily: FONT_COMIC,
              fontSize: 15,
              color: CREAM,
              marginTop: 14,
              lineHeight: 1.5,
            }}
          >
            <span style={{ color: HOT_PINK }}>
              {greetingFor(new Date())}
            </span>{" "}
            my name is{" "}
            <span style={{ color: YELLOW, fontWeight: 700 }}>Arun</span>
            {" "}and this is my homepage!! :) I'm a design engineer at HP Print
            AI in Bengaluru, India. This page is dedicated to my work — a
            UX research file about <em>me</em>, in glorious 1995 fashion.
          </div>

          {/* SPINNING WORLD + EMAIL + COUNTER ROW */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: 24,
              marginTop: 18,
            }}
          >
            <SpinningGlobe />
            <EmailIcon />
            <HitCounter value={hits} state={hitsState} />
          </div>

          {/* STAR RATING */}
          <div
            style={{
              marginTop: 16,
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                fontFamily: FONT_COMIC,
                fontSize: 13,
                color: CYAN,
              }}
            >
              ★ Rate my site! ★
            </div>
            <div
              style={{ display: "flex", gap: 4 }}
              onMouseLeave={() => setRatingHover(0)}
              role="radiogroup"
              aria-label="Rate this site, 1 to 5 stars"
            >
              {[1, 2, 3, 4, 5].map((n) => {
                const lit = (ratingHover || rating) >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setRatingHover(n)}
                    onClick={() => setStarRating(n)}
                    aria-label={`${n} stars`}
                    aria-checked={rating === n}
                    role="radio"
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: 28,
                      lineHeight: 1,
                      color: lit ? YELLOW : "#444",
                      textShadow: lit ? `0 0 10px ${YELLOW}` : "none",
                      transform: lit ? "scale(1.1)" : "scale(1)",
                      transition: "transform 120ms",
                    }}
                  >
                    ★
                  </button>
                );
              })}
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                color: rating > 0 ? LIME : HOT_PINK,
                minHeight: 14,
              }}
            >
              {rating > 0
                ? `Thanks for the ${rating}-star rating !`
                : "Click a star to vote"}
            </div>
          </div>

          {/* NEIGHBORHOOD BADGE */}
          <div
            style={{
              marginTop: 14,
              fontFamily: FONT_COMIC,
              fontSize: 13,
              color: CYAN,
            }}
          >
            <span
              aria-hidden
              style={{ marginRight: 6 }}
            >
              🏠
            </span>
            Member of{" "}
            <span style={{ color: YELLOW }}>GeoCities</span> · neighborhood:{" "}
            <span style={{ color: HOT_PINK }}>{neighborhood}/4242</span>
          </div>
        </section>

        <RainbowRule />

        {/* Sidebar toggle bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 8,
          }}
        >
          <button
            type="button"
            onClick={toggleSidebar}
            aria-pressed={!sidebarOpen}
            style={{
              padding: "3px 10px",
              fontFamily: FONT_COMIC,
              fontSize: 12,
              color: CYAN,
              background: "transparent",
              border: `1px solid ${CYAN}`,
              cursor: "pointer",
              textShadow: `0 0 6px ${CYAN}66`,
            }}
          >
            {sidebarOpen ? "« hide sidebar" : "show sidebar »"}
          </button>
        </div>

        {/* SIDEBAR + MAIN LAYOUT */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: sidebarOpen ? "180px 1fr" : "1fr",
            gap: 18,
            alignItems: "start",
          }}
        >
          {/* LEFT SIDEBAR — link buttons */}
          {sidebarOpen && (
          <aside>
            <SidebarTitle>★ Where to ★</SidebarTitle>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              {SECTIONS.slice(1).map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    style={navLink}
                  >
                    » {s.title}
                  </a>
                </li>
              ))}
            </ul>

            <SidebarTitle>★ Working on now ★</SidebarTitle>
            <FocusWidget />

            <SidebarTitle>★ Find me here ★</SidebarTitle>
            <LocationWidget />

            <SidebarTitle>★ My toolbox ★</SidebarTitle>
            <ToolboxWidget />

            <SidebarTitle>★ Fortune cookie ★</SidebarTitle>
            <FortuneWidget
              typed={fortuneTyped}
              empty={fortune.length === 0}
              onCrack={drawFortune}
            />
          </aside>
          )}

          {/* MAIN COLUMN */}
          <div>
            {/* ABOUT ME */}
            <section id="about" style={{ marginBottom: 22 }}>
              <NeonHeading>About Me</NeonHeading>
              <DetailList
                rows={[
                  ["My name", PERSONA.identity.name],
                  ["What I do", PERSONA.identity.role],
                  ["Where", PERSONA.identity.location],
                  ["For who", PERSONA.identity.org],
                  ["Vibe", "Designer who codes — bridge person"],
                ]}
              />

              <Subhead>What I want :)</Subhead>
              <FunList items={[...PERSONA.goals]} marker="★" markerColor={YELLOW} />

              <Subhead>What bugs me :(</Subhead>
              <FunList items={[...PERSONA.frustrations]} marker="✗" markerColor={MAGENTA} />

              <Subhead>A few favourites</Subhead>
              <Favourites />

              <Subhead>Quote on my wall</Subhead>
              <Quote>{PERSONA.quote}</Quote>

              <p style={p}>{PERSONA.background}</p>

              <p style={{ ...p, color: HOT_PINK }}>
                <b>{WHY_KIRUK.hook}</b> — One workflow. One owner. Better
                launches.
              </p>
            </section>

            <RainbowRule />

            {/* THOUGHTS — empathy map as a 2x2 fun grid */}
            <section id="thoughts" style={{ marginBottom: 22 }}>
              <NeonHeading>My Thoughts</NeonHeading>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <QuadBox tint={YELLOW} head="What I SAY">
                  <i>“{EMPATHY_MAP.says.quote}”</i>
                  <br />
                  <span style={{ color: CYAN }}>
                    {EMPATHY_MAP.says.skills.join(" · ")}
                  </span>
                </QuadBox>
                <QuadBox tint={CYAN} head="What I THINK">
                  {EMPATHY_MAP.thinks.map((t) => (
                    <div key={t}>★ {t}</div>
                  ))}
                </QuadBox>
                <QuadBox tint={MAGENTA} head="What I DO">
                  {EMPATHY_MAP.does.join(" · ")}
                </QuadBox>
                <QuadBox tint={LIME} head="What I FEEL">
                  {EMPATHY_MAP.feels.map((f) => (
                    <div key={f}>♥ {f}</div>
                  ))}
                </QuadBox>
              </div>
            </section>

            <RainbowRule />

            {/* JOURNEY */}
            <section id="journey" style={{ marginBottom: 22 }}>
              <NeonHeading>My Path So Far</NeonHeading>
              <ol style={{ paddingLeft: 22, margin: 0 }}>
                {nodes.map((n) => (
                  <li key={n.year} style={{ marginBottom: 8, lineHeight: 1.5 }}>
                    <span style={{ color: YELLOW, fontWeight: 700 }}>
                      {n.year}
                    </span>{" "}
                    —{" "}
                    <span style={{ color: CYAN }}>{n.phase}</span> ·{" "}
                    <b>{n.position}</b>
                    {n.live && (
                      <span
                        style={{
                          color: HOT_PINK,
                          marginLeft: 6,
                          fontWeight: 700,
                        }}
                      >
                        ← I'M HERE NOW
                      </span>
                    )}
                    <br />
                    <span style={{ color: CREAM, opacity: 0.85 }}>
                      @ {n.org} — {n.detail}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <RainbowRule />

            {/* TROPHIES */}
            <section id="trophies" style={{ marginBottom: 22 }}>
              <NeonHeading>My Trophies</NeonHeading>
              <p style={{ ...p, color: CYAN }}>
                Numbers I am proud of, with little gold stars next to each:
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                  gap: 10,
                }}
              >
                {IMPACT_METRICS.slice(0, 8).map((m) => (
                  <div
                    key={m.id}
                    style={{
                      border: `1px dashed ${MAGENTA}`,
                      padding: 8,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 22 }} aria-hidden>
                      {m.icon}
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_COMIC,
                        fontSize: 24,
                        fontWeight: 700,
                        color: YELLOW,
                      }}
                    >
                      {m.value}
                    </div>
                    <div style={{ color: CREAM, fontSize: 13 }}>
                      {m.label}
                    </div>
                    {m.context && (
                      <div style={{ color: HOT_PINK, fontSize: 11, marginTop: 2 }}>
                        ★ {m.context}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <RainbowRule />

            {/* STUFF — projects */}
            <section id="stuff" style={{ marginBottom: 22 }}>
              <NeonHeading>Stuff I've Made</NeonHeading>
              <p style={{ ...p, color: CYAN }}>
                Click any title to read the full case study. Animated GIFs
                may take a moment to load over your modem.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {CARD_SORTING.projects.map((pr) => (
                  <li
                    key={pr.id}
                    style={{
                      border: `1px solid ${CYAN}`,
                      padding: 10,
                      backgroundColor: "rgba(0, 60, 120, 0.18)",
                    }}
                  >
                    <a href={`/case-studies#${pr.id}`} style={mainLink}>
                      <b>♦ {pr.title}</b>
                    </a>{" "}
                    <span style={{ color: HOT_PINK }}>
                      ({pr.category} — {pr.duration})
                    </span>
                    <div style={{ marginTop: 4 }}>{pr.description}</div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: YELLOW, marginTop: 4 }}>
                      tech: {pr.technologies.join(", ")}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <RainbowRule />

            {/* GUESTBOOK */}
            <section id="guestbook" style={{ marginBottom: 22 }}>
              <NeonHeading>Sign My Guestbook!</NeonHeading>
              <p style={{ ...p, color: CYAN }}>
                Leave a note. It stays for this session — refresh and your
                message persists ;)
              </p>

              <div
                style={{
                  border: `1px solid ${MAGENTA}`,
                  padding: 12,
                  backgroundColor: "rgba(60, 0, 90, 0.25)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label
                    style={{ color: YELLOW, fontFamily: FONT_COMIC, fontSize: 13 }}
                  >
                    Your name:
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. arun@kiruk"
                      maxLength={40}
                      style={input}
                    />
                  </label>
                  <label
                    style={{ color: YELLOW, fontFamily: FONT_COMIC, fontSize: 13 }}
                  >
                    Your message:
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={3}
                      placeholder="Type something nice :)"
                      maxLength={240}
                      style={{ ...input, resize: "vertical" }}
                    />
                  </label>
                  <div>
                    <button
                      type="button"
                      onClick={sign}
                      style={signBtn}
                    >
                      ✎ Sign the book
                    </button>
                  </div>
                </div>
              </div>

              <Subhead>Recent visitors</Subhead>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {entries.slice().reverse().slice(0, 12).map((e, i) => (
                  <li
                    key={`${e.time}-${i}`}
                    style={{
                      borderLeft: `2px solid ${LIME}`,
                      paddingLeft: 8,
                      lineHeight: 1.45,
                    }}
                  >
                    <span style={{ color: YELLOW, fontWeight: 700 }}>
                      {e.name}
                    </span>{" "}
                    <span style={{ fontFamily: FONT_MONO, color: CYAN, fontSize: 12 }}>
                      [{e.time}]
                    </span>
                    <br />
                    <span style={{ color: CREAM }}>{e.body}</span>
                  </li>
                ))}
              </ul>
            </section>

            <RainbowRule />

            {/* FOOTER */}
            <footer
              style={{
                textAlign: "center",
                fontFamily: FONT_COMIC,
                fontSize: 13,
                color: CREAM,
                marginTop: 16,
              }}
            >
              <p style={{ margin: "4px 0" }}>
                ★ Last updated{" "}
                <span style={{ color: YELLOW }}>{lastModified}</span> by{" "}
                <a
                  href="mailto:arunkumaar.srinivasan@gmail.com"
                  style={mainLink}
                >
                  webmaster@kiruk
                </a>{" "}
                ★
              </p>
              <p style={{ margin: "4px 0", color: HOT_PINK }}>
                © 1995-2026 KIRUK. Thanks for visiting!! Come again soon :)
              </p>
            </footer>
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Components ────────────────────────────────────────────────────────

function Marquee({ items }: { items: readonly string[] }) {
  const joined = items.join("   ✦   ");
  return (
    <div
      style={{
        whiteSpace: "nowrap",
        animation: "kiruk-1995-marquee 32s linear infinite",
      }}
    >
      <span style={{ paddingRight: 32 }}>{joined}</span>
      <span style={{ paddingRight: 32 }}>{joined}</span>
    </div>
  );
}

function RainbowHeading({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        fontFamily: FONT_COMIC,
        fontSize: "clamp(36px, 7vw, 64px)",
        fontWeight: 700,
        margin: 0,
        lineHeight: 1.05,
        background: `linear-gradient(90deg, ${YELLOW}, ${MAGENTA}, ${CYAN}, ${LIME}, ${YELLOW})`,
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        animation: "kiruk-1995-rainbow 6s linear infinite",
        textShadow: `0 0 12px ${MAGENTA}66`,
        letterSpacing: 1,
      }}
    >
      {children}
    </h1>
  );
}

function NeonHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: FONT_COMIC,
        fontSize: "clamp(22px, 3.6vw, 30px)",
        color: YELLOW,
        margin: "8px 0",
        textShadow: `0 0 8px ${MAGENTA}, 0 0 14px ${MAGENTA}`,
        lineHeight: 1.2,
      }}
    >
      ★ {children} ★
    </h2>
  );
}

function Subhead({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: FONT_COMIC,
        fontSize: 16,
        color: HOT_PINK,
        margin: "10px 0 4px",
      }}
    >
      ~ {children} ~
    </h3>
  );
}

function RainbowRule() {
  return (
    <div
      aria-hidden
      style={{
        height: 4,
        margin: "16px 0",
        background: `linear-gradient(90deg, ${MAGENTA}, ${YELLOW}, ${CYAN}, ${LIME}, ${HOT_PINK}, ${MAGENTA})`,
        backgroundSize: "200% 100%",
        animation: "kiruk-1995-rainbow 6s linear infinite",
        boxShadow: `0 0 8px ${MAGENTA}88`,
      }}
    />
  );
}

function SidebarTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONT_COMIC,
        fontSize: 14,
        color: CYAN,
        textShadow: `0 0 6px ${CYAN}88`,
        marginTop: 14,
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

const navLink: React.CSSProperties = {
  display: "block",
  fontFamily: FONT_COMIC,
  fontSize: 13,
  color: CREAM,
  textDecoration: "none",
  padding: "3px 6px",
  borderLeft: `2px solid ${MAGENTA}`,
};

const mainLink: React.CSSProperties = {
  color: CYAN,
  textDecoration: "underline",
};

const p: React.CSSProperties = {
  fontFamily: FONT_COMIC,
  fontSize: 15,
  lineHeight: 1.55,
  margin: "8px 0",
  color: CREAM,
};

const input: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 2,
  padding: "4px 6px",
  fontFamily: FONT_MONO,
  fontSize: 13,
  backgroundColor: NAVY,
  color: CREAM,
  border: `1px solid ${MAGENTA}`,
  outline: "none",
};

const signBtn: React.CSSProperties = {
  marginTop: 8,
  padding: "6px 14px",
  fontFamily: FONT_COMIC,
  fontSize: 14,
  color: NAVY,
  backgroundColor: YELLOW,
  border: `1px solid ${MAGENTA}`,
  cursor: "pointer",
};

// ─── DetailList ───────────────────────────────────────────────────────

function DetailList({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl
      style={{
        display: "grid",
        gridTemplateColumns: "max-content 1fr",
        columnGap: 12,
        rowGap: 4,
        margin: "10px 0",
        fontFamily: FONT_COMIC,
        fontSize: 14,
      }}
    >
      {rows.map(([k, v]) => (
        <React.Fragment key={k}>
          <dt style={{ color: CYAN, fontWeight: 700 }}>{k}:</dt>
          <dd style={{ margin: 0, color: CREAM }}>{v}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

function FunList({
  items,
  marker,
  markerColor,
}: {
  items: readonly string[];
  marker: string;
  markerColor: string;
}) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 8px" }}>
      {items.map((it) => (
        <li
          key={it}
          style={{
            fontFamily: FONT_COMIC,
            fontSize: 15,
            color: CREAM,
            display: "flex",
            gap: 6,
            alignItems: "baseline",
          }}
        >
          <span style={{ color: markerColor }}>{marker}</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote
      style={{
        borderLeft: `3px solid ${LIME}`,
        paddingLeft: 10,
        margin: "6px 0 10px",
        fontStyle: "italic",
        color: YELLOW,
        fontFamily: FONT_COMIC,
        fontSize: 15,
      }}
    >
      “{children}”
    </blockquote>
  );
}

function QuadBox({
  tint,
  head,
  children,
}: {
  tint: string;
  head: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: `1px solid ${tint}`,
        padding: 8,
        backgroundColor: "rgba(0,0,0,0.35)",
        boxShadow: `inset 0 0 18px ${tint}22`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_COMIC,
          fontSize: 14,
          color: tint,
          textShadow: `0 0 6px ${tint}99`,
          marginBottom: 4,
        }}
      >
        ★ {head}
      </div>
      <div style={{ fontFamily: FONT_COMIC, fontSize: 13, color: CREAM }}>
        {children}
      </div>
    </div>
  );
}

// ─── Spinning globe + email + counter (ASCII / CSS only) ──────────────

function SpinningGlobe() {
  return (
    <div
      role="img"
      aria-label="rotating globe gif"
      style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        background:
          `radial-gradient(circle at 35% 35%, ${CYAN}, #003366 60%, #000033 100%)`,
        boxShadow: `0 0 14px ${CYAN}aa`,
        position: "relative",
        overflow: "hidden",
        animation: "kiruk-1995-spin 6s linear infinite",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `repeating-linear-gradient(0deg, transparent 0 6px, ${MAGENTA}88 6px 7px), repeating-linear-gradient(90deg, transparent 0 8px, ${YELLOW}66 8px 9px)`,
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}

function EmailIcon() {
  return (
    <a
      href="mailto:arunkumaar.srinivasan@gmail.com"
      title="Email me!"
      aria-label="Email me"
      style={{
        textDecoration: "none",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <span
        aria-hidden
        style={{
          fontSize: 40,
          lineHeight: 1,
          color: YELLOW,
          textShadow: `0 0 8px ${YELLOW}88, 0 0 16px ${MAGENTA}66`,
        }}
      >
        ✉
      </span>
      <span style={{ fontFamily: FONT_COMIC, fontSize: 12, color: CYAN }}>
        Email me!
      </span>
    </a>
  );
}

function HitCounter({
  value,
  state,
}: {
  value: number | null;
  state: "loading" | "live" | "offline";
}) {
  const label =
    state === "loading"
      ? "------"
      : state === "offline" || value === null
        ? "OFFLINE"
        : String(value).padStart(6, "0");
  const sub =
    state === "loading"
      ? "loading…"
      : state === "offline"
        ? "counter offline"
        : "real visitors recorded";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <div
        style={{
          backgroundColor: "#000000",
          color: state === "offline" ? HOT_PINK : LIME,
          padding: "4px 8px",
          fontFamily: FONT_MONO,
          fontSize: state === "offline" ? 16 : 22,
          letterSpacing: 3,
          border: `1px solid ${MAGENTA}`,
          boxShadow: `0 0 12px ${MAGENTA}55`,
        }}
      >
        {label}
      </div>
      <span style={{ fontFamily: FONT_COMIC, fontSize: 12, color: HOT_PINK }}>
        {sub}
      </span>
    </div>
  );
}

// ─── Focus widget — what Arun is working on right now ────────────────

function FocusWidget() {
  const items: Array<{ tag: string; title: string; note: string; tagColor: string }> = [
    {
      tag: "LIVE",
      title: "HP Print AI",
      note: "Co-shipping the intelligent print experience. AI Stack design system, mobile-first onboarding, Splunk observability.",
      tagColor: LIME,
    },
    {
      tag: "EVENING",
      title: "@kirukism",
      note: "Process journals + this era-machine experiment. Hand-coded HTML still beats a broken framework.",
      tagColor: HOT_PINK,
    },
  ];
  return (
    <div
      style={{
        border: `1px solid ${LIME}`,
        padding: 8,
        backgroundColor: "rgba(0,0,0,0.4)",
        fontFamily: FONT_COMIC,
        fontSize: 12,
        color: CREAM,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {items.map((it) => (
        <div key={it.title}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 2,
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "0 5px",
                fontSize: 10,
                color: NAVY,
                backgroundColor: it.tagColor,
                fontFamily: FONT_MONO,
                letterSpacing: 0.5,
              }}
            >
              {it.tag}
            </span>
            <span style={{ color: YELLOW, fontWeight: 700 }}>{it.title}</span>
          </div>
          <div style={{ lineHeight: 1.45 }}>{it.note}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Location widget — where to find me ──────────────────────────────

function LocationWidget() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const ist = useMemo(() => {
    // Convert to IST regardless of viewer's timezone
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const istDate = new Date(utc + 5.5 * 60 * 60000);
    return istDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, [now]);

  return (
    <div
      style={{
        border: `1px solid ${CYAN}`,
        padding: 8,
        backgroundColor: "rgba(0,0,0,0.4)",
        fontFamily: FONT_COMIC,
        fontSize: 12,
        color: CREAM,
      }}
    >
      <pre
        aria-hidden
        style={{
          fontFamily: FONT_MONO,
          fontSize: 11,
          lineHeight: 1.05,
          color: CYAN,
          margin: 0,
          marginBottom: 4,
          whiteSpace: "pre",
        }}
      >
{` .-.       _.--.
(   '. _.'
 '._.'    .'   .
   ` + "`" + `--._.-` + "`" + `★    \\
        ` + "`" + `--._.-'`}
      </pre>
      <div style={{ color: YELLOW }}>Bengaluru, India</div>
      <div style={{ color: HOT_PINK }}>12.97°N · 77.59°E</div>
      <div
        style={{
          marginTop: 4,
          fontFamily: FONT_MONO,
          fontSize: 12,
          color: LIME,
        }}
      >
        IST · {ist}
      </div>
    </div>
  );
}

// ─── Toolbox widget — what Arun actually uses ────────────────────────

function ToolboxWidget() {
  const tools: Array<{ name: string; color: string; tag: string }> = [
    { name: "Figma",       color: HOT_PINK, tag: "design" },
    { name: "React",       color: CYAN,     tag: "code" },
    { name: "Next.js",     color: "#ffffff",tag: "code" },
    { name: "Flutter",     color: "#66ccff",tag: "code" },
    { name: "Splunk",      color: LIME,     tag: "ops" },
    { name: "Spring Boot", color: "#aaffaa",tag: "code" },
    { name: "Blender",     color: "#ffaa55",tag: "3d" },
    { name: "Loom",        color: MAGENTA,  tag: "handoff" },
  ];
  return (
    <div
      style={{
        border: `1px solid ${HOT_PINK}`,
        padding: 8,
        backgroundColor: "rgba(0,0,0,0.4)",
        fontFamily: FONT_COMIC,
        fontSize: 12,
        color: CREAM,
      }}
    >
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: HOT_PINK,
          letterSpacing: 0.5,
          marginBottom: 6,
        }}
      >
        in rotation 1995–today
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {tools.map((t) => (
          <span
            key={t.name}
            title={t.tag}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 6px",
              border: `1px solid ${t.color}`,
              color: t.color,
              backgroundColor: "rgba(0,0,0,0.6)",
              fontSize: 11,
              boxShadow: `0 0 6px ${t.color}55`,
            }}
          >
            ✦ {t.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function Favourites() {
  return (
    <dl
      style={{
        display: "grid",
        gridTemplateColumns: "max-content 1fr",
        columnGap: 12,
        rowGap: 4,
        margin: "6px 0 10px",
        fontFamily: FONT_COMIC,
        fontSize: 14,
      }}
    >
      {FAVOURITES.map((f) => (
        <React.Fragment key={f.k}>
          <dt
            style={{
              color: f.tint,
              fontFamily: FONT_MONO,
              fontSize: 12,
              letterSpacing: 0.5,
              textTransform: "lowercase",
            }}
          >
            ★ {f.k}
          </dt>
          <dd style={{ margin: 0, color: CREAM }}>{f.v}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

function FortuneWidget({
  typed,
  empty,
  onCrack,
}: {
  typed: string;
  empty: boolean;
  onCrack: () => void;
}) {
  return (
    <div
      style={{
        border: `1px solid ${HOT_PINK}`,
        padding: 8,
        backgroundColor: "rgba(0,0,0,0.4)",
        fontFamily: FONT_COMIC,
        fontSize: 12,
        color: CREAM,
      }}
    >
      <div
        style={{
          minHeight: 56,
          color: CREAM,
          marginBottom: 6,
          fontStyle: empty ? "normal" : "italic",
          lineHeight: 1.45,
        }}
      >
        {empty ? (
          <span style={{ color: HOT_PINK }}>
            🥠 Crack the cookie to receive your fortune…
          </span>
        ) : (
          <>
            {typed}
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 6,
                height: 12,
                marginLeft: 2,
                backgroundColor: YELLOW,
                verticalAlign: "middle",
                animation: "kiruk-1995-twinkle 0.7s steps(2, end) infinite",
              }}
            />
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onCrack}
        style={{
          background: "transparent",
          border: `1px solid ${HOT_PINK}`,
          color: HOT_PINK,
          fontFamily: FONT_COMIC,
          fontSize: 11,
          padding: "2px 8px",
          cursor: "pointer",
        }}
      >
        ♺ crack another
      </button>
    </div>
  );
}

export default GeocitiesHomePage;
