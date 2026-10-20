"use client";

/**
 * IphoneSkeuHomePage — 2009 archetype: iPhone OS 3, skeuomorphic.
 *
 * In 2009 the App Store was a year old. iOS led with skeuomorphism —
 * leather stitching in Calendar, yellow legal-pad paper in Notes,
 * brushed aluminum + felt + wood textures everywhere. Apps were
 * tiny worlds rendered to look like their analog ancestors.
 *
 * This profile renders Arun as a single iPhone OS 3 device. Lock
 * screen lifts on a swipe gesture; the home screen is a 4×4 grid
 * of app icons, one per UX research artifact; tapping an app opens
 * a full-bleed skeuomorphic surface mapped to that artifact.
 *
 * Paradigm versus prior eras:
 *   · 2000 Aqua    = multi-window draggable desktop
 *   · 2003 MySpace = static profile page
 *   · 2006 Digg    = ranked list w/ voting
 *   · 2009 iPhone  = SINGLE DEVICE FRAME with app icons + tap-to-open
 *
 * Unique interactions:
 *   · Lock screen swipe-to-unlock (slide thumb across the slider)
 *   · Home screen grid of 8 app icons + dock + page dots
 *   · Tap icon → app opens with matched skeuomorphic chrome
 *   · Press home button → return to home screen
 *   · Rotate button → device frame rotates landscape ↔ portrait
 *   · Stocks app: tap stock row → expands sparkline
 *   · Notes app: turn page button cycles through empathy quadrants
 *   · Calendar app: list ↔ month view toggle
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
import { eyeClear } from "@/components/layout/eye-clear";

// ── Palette ──────────────────────────────────────────────────────────

const DESK = "#1a1f2a";          // chrome bench backdrop
const DESK_2 = "#0a0c14";
const BEZEL = "#0a0a0d";          // device chrome
const BEZEL_HI = "#3d4250";
const BEZEL_LO = "#000000";
const SCREEN_BG = "#000";
const STATUS_BAR = "#181818";
const WALL_TOP = "#1f3a5c";       // wallpaper droplet
const WALL_BOT = "#04101e";
const INK = "#1a1a1a";
const INK_DIM = "#5b6470";
const MUTED = "#8e95a3";
const IOS_BLUE = "#007aff";
const IOS_BLUE_DEEP = "#004fb3";
const RED = "#ff3b30";
const GREEN = "#34c759";

const FONT_UI = "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
const FONT_DISPLAY = "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
const FONT_MARKER = "'Marker Felt', 'Comic Sans MS', cursive";
const FONT_MONO = "'Menlo', 'Courier New', monospace";

// ── App registry ─────────────────────────────────────────────────────

type AppId =
  | "profile"
  | "notes"
  | "calendar"
  | "stocks"
  | "photos"
  | "mail"
  | "compass"
  | "settings"
  | "phone"
  | "safari"
  | "messages"
  | "ipod";

interface AppDef {
  id: AppId;
  label: string;
  icon: string;     // emoji or glyph
  bg: string;       // icon background gradient root
  artifact?: string; // mapped UX artifact
}

const APPS_HOME: AppDef[] = [
  { id: "profile",  label: "Profile",  icon: "👤", bg: "#cc6600", artifact: "PERSONA · Identity" },
  { id: "notes",    label: "Notes",    icon: "📝", bg: "#f5d76e", artifact: "EMPATHY MAP" },
  { id: "calendar", label: "Calendar", icon: "📅", bg: "#ffffff", artifact: "JOURNEY MAP" },
  { id: "stocks",   label: "Stocks",   icon: "📊", bg: "#1a1a1a", artifact: "IMPACT METRICS" },
  { id: "photos",   label: "Photos",   icon: "🖼", bg: "#e6e6e6", artifact: "CARD SORT · Works" },
  { id: "compass",  label: "Compass",  icon: "🧭", bg: "#9b6f3a", artifact: "EMPATHY · Thinks" },
  { id: "mail",     label: "Mail",     icon: "✉",  bg: "#5fb8ff", artifact: "USABILITY · Channels" },
  { id: "settings", label: "Settings", icon: "⚙", bg: "#b0b0b0", artifact: "WHY KIRUK" },
];

const APPS_DOCK: AppDef[] = [
  { id: "phone",    label: "Phone",    icon: "☎", bg: "#3a9b3a" },
  { id: "messages", label: "Messages", icon: "💬", bg: "#3a9b3a" },
  { id: "safari",   label: "Safari",   icon: "🧭", bg: "#5fb8ff" },
  { id: "ipod",     label: "iPod",     icon: "🎧", bg: "#cc6699" },
];

// ── Hook: clock ──────────────────────────────────────────────────────

function useClock(): string {
  const [t, setT] = useState(() =>
    new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  );
  useEffect(() => {
    const id = window.setInterval(() => {
      setT(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
    }, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return t;
}

function useIsMobile(breakpoint = 480): boolean {
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

type View = "lock" | "home" | AppId;

export function IphoneSkeuHomePage() {
  const { setLayoutMode } = useLayoutMode();
  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);

  const [view, setView] = useState<View>("lock");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const time = useClock();
  const isMobile = useIsMobile();

  // Multitasking — recents
  const [recents, setRecents] = useState<AppId[]>([]);
  const [multitaskOpen, setMultitaskOpen] = useState(false);
  const lastHomePressRef = useRef<number>(0);

  // Spotlight
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [spotQuery, setSpotQuery] = useState("");

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(id);
  }, [toast]);

  // Badges per app (decrements when opened)
  const [badges, setBadges] = useState<Record<string, number>>({
    mail: 3,
    calendar: 1,
    photos: 4,
    notes: 2,
    stocks: 1,
  });

  const openApp = useCallback((id: AppId) => {
    setView(id);
    setMultitaskOpen(false);
    setSpotlightOpen(false);
    setRecents((prev) => {
      const next = prev.filter((x) => x !== id);
      next.unshift(id);
      return next.slice(0, 6);
    });
    setBadges((b) => {
      if (!b[id]) return b;
      const next = { ...b };
      delete next[id];
      return next;
    });
  }, []);

  const home = useCallback(() => {
    setView("home");
    setMultitaskOpen(false);
    setSpotlightOpen(false);
  }, []);

  const homePress = useCallback(() => {
    const now = Date.now();
    if (now - lastHomePressRef.current < 320) {
      // Double-press → multitasking
      setMultitaskOpen((m) => !m);
      lastHomePressRef.current = 0;
      return;
    }
    lastHomePressRef.current = now;
    home();
  }, [home]);

  const lock = useCallback(() => {
    setView("lock");
    setMultitaskOpen(false);
    setSpotlightOpen(false);
  }, []);

  const openSpotlight = useCallback(() => {
    setView("home");
    setSpotlightOpen(true);
    setMultitaskOpen(false);
  }, []);

  // Battery — slow drain
  const [battery, setBattery] = useState(96);
  useEffect(() => {
    const id = window.setInterval(() => {
      setBattery((b) => Math.max(20, b - 1));
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Page view tracker
  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "page_view", path: "/era/2009" }),
    }).catch(() => {});
  }, []);

  // Device dimensions — smaller on mobile
  const portraitW = isMobile ? 260 : 320;
  const portraitH = isMobile ? 460 : 540;
  const W = orientation === "portrait" ? portraitW : portraitH;
  const H = orientation === "portrait" ? portraitH : portraitW;

  return (
    <div
      id="iphone-skeu-home"
      style={{
        position: "relative",
        minHeight: "100vh",
        background:
          `radial-gradient(ellipse 90% 60% at 50% 40%, #5a3a1a 0%, #3a2210 60%, #1a0e04 100%)`,
        color: "#fff",
        fontFamily: FONT_UI,
        // First row is the narrow mode-chip strip, so it can sit high in the eye.
        paddingTop: eyeClear(560),
        paddingBottom: 24,
        overflow: "hidden",
      }}
    >
      <style jsx global>{`
        @keyframes iskeu-shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        @keyframes iskeu-app-open {
          0%   { opacity: 0; transform: scale(0.86); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes iskeu-icon-bounce {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-3px); }
        }
        .iskeu-app-surface {
          animation: iskeu-app-open 220ms cubic-bezier(0.2, 0.9, 0.3, 1.1);
        }
        @keyframes iskeu-drawer-up {
          0%   { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Wood-grain desk noise */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200'><filter id='n'><feTurbulence baseFrequency='0.012 0.18' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.35'/></svg>\")",
          opacity: 0.5,
          mixBlendMode: "overlay",
        }}
      />
      {/* Vignette */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 35%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Mode controls */}
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            color: "#fff8e8",
            fontFamily: FONT_UI,
            fontSize: 11,
            letterSpacing: 1,
            textTransform: "uppercase",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              padding: "3px 8px",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,200,140,0.25)",
              borderRadius: 999,
              fontFamily: FONT_MONO,
              fontSize: 10,
              letterSpacing: 1,
            }}
          >
            kiruk OS · v3.0 · 2009
          </span>
          <ChipBtn
            onClick={() => setOrientation((o) => (o === "portrait" ? "landscape" : "portrait"))}
          >
            ↻ rotate
          </ChipBtn>
          <ChipBtn onClick={lock}>🔒 lock</ChipBtn>
          <ChipBtn onClick={openSpotlight}>🔍 spotlight</ChipBtn>
          <ChipBtn
            onClick={() => {
              setMultitaskOpen((m) => !m);
              setToast(multitaskOpen ? "multitasking closed" : "multitasking · double-tap home");
            }}
          >
            ⊞ recents
          </ChipBtn>
        </div>

        {/* Desk scene — 3-col on desktop, stacked on mobile */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : `1fr ${W + 24}px 1fr`,
            gap: isMobile ? 12 : 14,
            alignItems: isMobile ? "stretch" : "center",
            width: "100%",
            maxWidth: 1180,
            padding: isMobile ? "0 10px" : "0 12px",
            justifyItems: isMobile ? "center" : "stretch",
          }}
        >
          {!isMobile && (
            <LeftDesk
              onMoodboardOpen={() => openApp("photos")}
              onNotesOpen={() => openApp("notes")}
              isMobile={false}
            />
          )}

        {/* Device frame */}
        <div
          style={{
            position: "relative",
            width: W + 24,
            height: H + 110,
            padding: 12,
            background:
              `linear-gradient(180deg, ${BEZEL_HI} 0%, ${BEZEL} 14%, ${BEZEL} 86%, ${BEZEL_HI} 100%)`,
            borderRadius: 44,
            boxShadow:
              `0 22px 50px rgba(0,0,0,0.55), inset 0 2px 0 #515767, inset 0 -2px 0 #000, 0 0 0 1px #000`,
            justifySelf: "center",
          }}
        >
          {/* Hardware buttons — silent switch + volume + sleep */}
          <span
            aria-hidden
            title="Silent switch"
            style={{
              position: "absolute",
              left: -3,
              top: 70,
              width: 5,
              height: 22,
              background: "linear-gradient(180deg, #2a2f3a 0%, #050505 100%)",
              borderRadius: 2,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
          />
          <span
            aria-hidden
            title="Volume up"
            style={{
              position: "absolute",
              left: -3,
              top: 110,
              width: 5,
              height: 28,
              background: "linear-gradient(180deg, #2a2f3a 0%, #050505 100%)",
              borderRadius: 2,
            }}
          />
          <span
            aria-hidden
            title="Volume down"
            style={{
              position: "absolute",
              left: -3,
              top: 146,
              width: 5,
              height: 28,
              background: "linear-gradient(180deg, #2a2f3a 0%, #050505 100%)",
              borderRadius: 2,
            }}
          />
          <button
            type="button"
            onClick={() => (view === "lock" ? home() : lock())}
            title="Wake / Sleep"
            style={{
              position: "absolute",
              right: -3,
              top: 70,
              width: 5,
              height: 36,
              padding: 0,
              background: "linear-gradient(180deg, #2a2f3a 0%, #050505 100%)",
              borderRadius: 2,
              border: "none",
              cursor: "pointer",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
          />
          {/* Top speaker + camera */}
          <div
            style={{
              position: "absolute",
              top: 18,
              left: 0,
              right: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              pointerEvents: "none",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 30% 30%, #2a2a2a 0%, #050505 100%)",
                boxShadow: "inset 0 0 0 1px #1a1a1a",
              }}
            />
            <span
              aria-hidden
              style={{
                width: 56,
                height: 5,
                borderRadius: 4,
                background:
                  "linear-gradient(180deg, #000 0%, #1a1a1a 50%, #000 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            />
          </div>

          {/* Screen */}
          <div
            style={{
              position: "relative",
              width: W,
              height: H,
              marginTop: 38,
              marginBottom: 0,
              background: SCREEN_BG,
              overflow: "hidden",
              borderRadius: 4,
              boxShadow: "inset 0 0 0 1px #000",
            }}
          >
            {view === "lock" && (
              <LockScreen time={time} battery={battery} onUnlock={home} />
            )}
            {view === "home" && (
              <HomeScreen
                openApp={openApp}
                time={time}
                battery={battery}
                badges={badges}
                spotlightOpen={spotlightOpen}
                spotQuery={spotQuery}
                setSpotQuery={setSpotQuery}
                onSpotClose={() => setSpotlightOpen(false)}
              />
            )}
            {view !== "lock" && view !== "home" && (
              <AppShell
                appId={view as AppId}
                onHome={home}
                time={time}
                battery={battery}
                orientation={orientation}
              />
            )}

            {/* Multitasking drawer */}
            {multitaskOpen && (
              <MultitaskDrawer
                recents={recents}
                onPick={(id) => {
                  openApp(id);
                }}
                onClose={() => setMultitaskOpen(false)}
              />
            )}
          </div>

          {/* Home button */}
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={homePress}
              title="Home button · double-press for multitasking"
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background:
                  `radial-gradient(circle at 50% 35%, #4a4f5d 0%, #1a1d27 60%, #000 100%)`,
                border: "1px solid #000",
                boxShadow:
                  "inset 0 2px 4px rgba(255,255,255,0.16), inset 0 -3px 5px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.5)",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 16,
                  height: 16,
                  marginTop: -8,
                  marginLeft: -8,
                  borderRadius: 3,
                  border: "1.5px solid #8a8f9c",
                  boxSizing: "border-box",
                }}
              />
            </button>
          </div>
        </div>

          {/* Right desk widgets */}
          {!isMobile && (
            <RightDesk
              onCalendarOpen={() => openApp("calendar")}
              onMailOpen={() => openApp("mail")}
              isMobile={false}
            />
          )}
        </div>

        {/* Hint */}
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: "rgba(255,240,200,0.55)",
            letterSpacing: 0.5,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          tap apps · home returns · double-tap home for multitasking · sleep button top-right · tap desk items
        </div>

        {toast && (
          <div
            role="status"
            style={{
              position: "fixed",
              bottom: "calc(var(--eye-lid-bottom, 0px) + 12px)",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 80,
              padding: "8px 16px",
              background: "linear-gradient(180deg, #2a2f3a 0%, #050505 100%)",
              color: "#fff",
              border: "1px solid #000",
              borderRadius: 8,
              fontFamily: FONT_UI,
              fontSize: 12,
              fontWeight: 700,
              boxShadow: "0 6px 18px rgba(0,0,0,0.55)",
              pointerEvents: "none",
            }}
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Lock screen ──────────────────────────────────────────────────────

function LockScreen({
  time,
  battery,
  onUnlock,
}: {
  time: string;
  battery: number;
  onUnlock: () => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragX, setDragX] = useState(0);
  const draggingRef = useRef(false);

  const beginDrag = (e: React.MouseEvent) => {
    draggingRef.current = true;
    const r = trackRef.current?.getBoundingClientRect();
    if (!r) return;
    setDragX(Math.max(0, e.clientX - r.left - 30));
  };
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const r = trackRef.current?.getBoundingClientRect();
      if (!r) return;
      const x = Math.max(0, Math.min(r.width - 60, e.clientX - r.left - 30));
      setDragX(x);
    };
    const onUp = () => {
      const r = trackRef.current?.getBoundingClientRect();
      if (r && dragX > r.width - 80) {
        onUnlock();
      } else {
        setDragX(0);
      }
      draggingRef.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragX, onUnlock]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          `linear-gradient(180deg, ${WALL_TOP} 0%, ${WALL_BOT} 100%)`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <StatusBar time={time} battery={battery} />

      {/* Date + time */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          marginTop: 28,
          color: "#fff",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONT_UI,
            fontSize: 13,
            letterSpacing: 1,
            color: "rgba(255,255,255,0.85)",
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          }}
        >
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 64,
            fontWeight: 200,
            color: "#fff",
            letterSpacing: -2,
            lineHeight: 1,
            marginTop: 4,
            textShadow: "0 2px 6px rgba(0,0,0,0.55)",
          }}
        >
          {time}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 12,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: 0.5,
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          }}
        >
          Notification · {PERSONA.identity.name} · Tap to open
        </div>
        <div
          style={{
            marginTop: 4,
            padding: "8px 12px",
            background: "rgba(255,255,255,0.92)",
            color: INK,
            borderRadius: 8,
            width: "82%",
            fontFamily: FONT_UI,
            fontSize: 12,
            lineHeight: 1.4,
            boxShadow: "0 2px 6px rgba(0,0,0,0.45)",
          }}
        >
          <strong>Profile updated.</strong> A new portfolio disc is ready.
          Slide to view.
        </div>
      </div>

      {/* Slide-to-unlock */}
      <div
        ref={trackRef}
        onMouseDown={beginDrag}
        style={{
          position: "relative",
          margin: "0 16px 18px",
          height: 44,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 100%)",
          borderRadius: 22,
          border: "1px solid rgba(255,255,255,0.18)",
          cursor: "grab",
          userSelect: "none",
          overflow: "hidden",
        }}
      >
        {/* Shimmer label */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT_UI,
            fontSize: 14,
            letterSpacing: 1,
            color: "rgba(255,255,255,0.6)",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
            backgroundSize: "200px 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "rgba(255,255,255,0.55)",
            animation: "iskeu-shimmer 2.4s linear infinite",
            pointerEvents: "none",
          }}
        >
          slide to unlock
        </div>
        {/* Thumb */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 4,
            left: 4 + dragX,
            width: 60,
            height: 36,
            background:
              "linear-gradient(180deg, #f4f4f4 0%, #b0b0b0 100%)",
            borderRadius: 18,
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#444",
            fontFamily: FONT_DISPLAY,
            fontSize: 16,
            transition: draggingRef.current ? "none" : "left 220ms ease-out",
          }}
        >
          ▸
        </div>
      </div>
    </div>
  );
}

// ── Home screen ──────────────────────────────────────────────────────

function HomeScreen({
  openApp,
  time,
  battery,
  badges,
  spotlightOpen,
  spotQuery,
  setSpotQuery,
  onSpotClose,
}: {
  openApp: (id: AppId) => void;
  time: string;
  battery: number;
  badges: Record<string, number>;
  spotlightOpen: boolean;
  spotQuery: string;
  setSpotQuery: (s: string) => void;
  onSpotClose: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          `radial-gradient(ellipse 80% 60% at 50% 30%, #5fa8d8 0%, ${WALL_TOP} 60%, ${WALL_BOT} 100%)`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <StatusBar time={time} battery={battery} />

      {/* Spotlight or greeting */}
      {spotlightOpen ? (
        <div
          style={{
            padding: "6px 12px 4px",
            background: "rgba(0,0,0,0.35)",
            borderBottom: "1px solid rgba(255,255,255,0.18)",
            display: "flex",
            gap: 6,
            alignItems: "center",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.7)" }}>🔍</span>
          <input
            autoFocus
            value={spotQuery}
            onChange={(e) => setSpotQuery(e.target.value)}
            placeholder="Search..."
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.9)",
              border: "1px solid #1a1a1a",
              borderRadius: 4,
              padding: "3px 6px",
              fontFamily: FONT_UI,
              fontSize: 12,
              color: INK,
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => {
              onSpotClose();
              setSpotQuery("");
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontFamily: FONT_UI,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            cancel
          </button>
        </div>
      ) : (
        <div
          style={{
            padding: "6px 14px 0",
            color: "rgba(255,255,255,0.85)",
            fontFamily: FONT_UI,
            fontSize: 11,
            letterSpacing: 0.5,
            textShadow: "0 1px 1px rgba(0,0,0,0.45)",
          }}
        >
          <strong style={{ color: "#fff", fontSize: 13 }}>kiruk OS</strong>
          <span style={{ marginLeft: 6, opacity: 0.85 }}>· tap any app</span>
        </div>
      )}

      {/* App grid (or filtered search results) */}
      <div
        style={{
          flex: 1,
          padding: "12px 18px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridAutoRows: "min-content",
          gap: 12,
        }}
      >
        {APPS_HOME.filter((a) =>
          spotlightOpen && spotQuery
            ? a.label.toLowerCase().includes(spotQuery.toLowerCase()) ||
              (a.artifact ?? "").toLowerCase().includes(spotQuery.toLowerCase())
            : true,
        ).map((a) => (
          <AppIcon
            key={a.id}
            app={a}
            badge={badges[a.id]}
            onTap={() => openApp(a.id)}
          />
        ))}
      </div>

      {/* Page dots */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          paddingBottom: 6,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: i === 0 ? "#fff" : "rgba(255,255,255,0.45)",
            }}
          />
        ))}
      </div>

      {/* Dock */}
      <div
        style={{
          margin: "0 8px 8px",
          padding: "8px 12px",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 100%)",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: 12,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        {APPS_DOCK.map((a) => (
          <AppIcon key={a.id} app={a} onTap={() => openApp(a.id)} small />
        ))}
      </div>
    </div>
  );
}

function AppIcon({
  app,
  onTap,
  small,
  badge,
}: {
  app: AppDef;
  onTap: () => void;
  small?: boolean;
  badge?: number;
}) {
  const size = small ? 48 : 56;
  return (
    <button
      type="button"
      onClick={onTap}
      title={app.label}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        color: "#fff",
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            width: size,
            height: size,
            borderRadius: 12,
            background:
              `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.7) 0%, transparent 40%), linear-gradient(180deg, ${app.bg} 0%, ${darken(app.bg)} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: small ? 22 : 28,
            color: "#fff",
            textShadow: "1px 1px 1px rgba(0,0,0,0.35)",
            border: "1px solid rgba(0,0,0,0.35)",
            boxShadow:
              "inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -2px 3px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.5)",
          }}
        >
          {app.icon}
        </div>
        {badge !== undefined && badge > 0 && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              padding: "0 4px",
              borderRadius: 9,
              background: `linear-gradient(180deg, ${RED} 0%, ${darken(RED)} 100%)`,
              color: "#fff",
              fontFamily: FONT_DISPLAY,
              fontSize: 11,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
              boxShadow: "0 1px 2px rgba(0,0,0,0.45)",
              animation: "iskeu-icon-bounce 1.8s ease-in-out infinite",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: FONT_UI,
          fontSize: 10,
          letterSpacing: 0,
          color: "#fff",
          textShadow: "0 1px 2px rgba(0,0,0,0.6)",
          maxWidth: 64,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {app.label}
      </span>
    </button>
  );
}

// ── Status bar ───────────────────────────────────────────────────────

function StatusBar({ time, battery }: { time: string; battery: number }) {
  return (
    <div
      style={{
        background: STATUS_BAR,
        color: "#fff",
        padding: "3px 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: FONT_DISPLAY,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
        height: 20,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {[3, 4, 5, 5, 5].map((h, i) => (
          <span
            key={i}
            style={{
              width: 3,
              height: h,
              background: i < 4 ? "#fff" : "rgba(255,255,255,0.55)",
              borderRadius: 1,
            }}
          />
        ))}
        <span style={{ marginLeft: 4, fontSize: 10 }}>AT&amp;T</span>
        <span style={{ marginLeft: 4, fontSize: 10 }}>3G</span>
      </span>
      <span style={{ fontSize: 12, fontWeight: 700 }}>{time}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 10 }}>{battery}%</span>
        <span
          aria-hidden
          style={{
            width: 22,
            height: 10,
            border: "1px solid #fff",
            borderRadius: 2,
            position: "relative",
            padding: 1,
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              display: "block",
              width: `${Math.max(5, battery)}%`,
              height: "100%",
              background: battery < 25 ? RED : "#fff",
              borderRadius: 1,
            }}
          />
          <span
            aria-hidden
            style={{
              position: "absolute",
              right: -3,
              top: 2,
              width: 2,
              height: 4,
              background: "#fff",
              borderRadius: 1,
            }}
          />
        </span>
      </span>
    </div>
  );
}

// ── App shell — switches per appId ───────────────────────────────────

function AppShell({
  appId,
  onHome,
  time,
  battery,
  orientation: _orientation,
}: {
  appId: AppId;
  onHome: () => void;
  time: string;
  battery: number;
  orientation: "portrait" | "landscape";
}) {
  return (
    <div
      className="iskeu-app-surface"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        background: "#000",
      }}
    >
      <StatusBar time={time} battery={battery} />
      <div style={{ flex: 1, overflow: "hidden" }}>
        {appId === "profile" && <ProfileApp onHome={onHome} />}
        {appId === "notes" && <NotesApp onHome={onHome} />}
        {appId === "calendar" && <CalendarApp onHome={onHome} />}
        {appId === "stocks" && <StocksApp onHome={onHome} />}
        {appId === "photos" && <PhotosApp onHome={onHome} />}
        {appId === "compass" && <CompassApp onHome={onHome} />}
        {appId === "mail" && <MailApp onHome={onHome} />}
        {appId === "settings" && <SettingsApp onHome={onHome} />}
        {appId === "phone" && <SimpleApp onHome={onHome} title="Phone" body={`Tel ${USABILITY_TEST.channels.find((c) => c.label === "Phone")?.value ?? ""}`} />}
        {appId === "messages" && <SimpleApp onHome={onHome} title="Messages" body="No new messages. Reach out via Mail." />}
        {appId === "safari" && <SimpleApp onHome={onHome} title="Safari" body="kiruk.com — already there." />}
        {appId === "ipod" && <SimpleApp onHome={onHome} title="iPod" body="Now playing: deploy logs (silence)." />}
      </div>
    </div>
  );
}

// ── PROFILE app · leather contact card ───────────────────────────────

function ProfileApp({ onHome }: { onHome: () => void }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 20,
        top: 24,
        bottom: 6,
        background:
          `linear-gradient(180deg, #5a2a0c 0%, #3a1a04 100%)`,
        borderRadius: 6,
        boxShadow:
          "inset 0 1px 0 rgba(255,200,140,0.35), inset 0 -2px 6px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.7)",
        backgroundImage:
          `repeating-linear-gradient(45deg, transparent 0 6px, rgba(0,0,0,0.07) 6px 7px),
           linear-gradient(180deg, #5a2a0c 0%, #3a1a04 100%)`,
        padding: 14,
        color: "#fff8e8",
        fontFamily: FONT_UI,
        overflow: "hidden",
      }}
    >
      <AppNav onHome={onHome} title="Profile" subtitle="PERSONA · Identity" leather />
      <div
        style={{
          background:
            "repeating-linear-gradient(180deg, #fff8d8 0 24px, #faf0c4 24px 25px)",
          color: "#2a2300",
          padding: "10px 14px",
          marginTop: 8,
          borderRadius: 3,
          boxShadow:
            "0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.6)",
          fontFamily: FONT_UI,
          fontSize: 13,
          lineHeight: "25px",
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, color: "#2a1a00" }}>
          {PERSONA.identity.name}
        </div>
        <div style={{ fontStyle: "italic", color: "#5a3a00" }}>
          {PERSONA.identity.role}
        </div>
        <div style={{ marginTop: 4 }}>
          <ContactLine k="employer">{PERSONA.identity.org}</ContactLine>
          <ContactLine k="city">{PERSONA.identity.location}</ContactLine>
          <ContactLine k="born">Salem, Tamil Nadu · 2001</ContactLine>
          <ContactLine k="type">Designer ↔ Engineer (bridge)</ContactLine>
          <ContactLine k="email">
            {USABILITY_TEST.channels.find((c) => c.label === "Email")?.value ?? ""}
          </ContactLine>
        </div>
        <div
          style={{
            marginTop: 6,
            paddingTop: 4,
            borderTop: "1px dashed #c8a800",
            fontStyle: "italic",
            color: "#6a4a00",
            fontSize: 12,
            lineHeight: "20px",
          }}
        >
          &ldquo;{PERSONA.quote}&rdquo;
        </div>
      </div>
    </div>
  );
}

function ContactLine({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "70px 1fr",
        gap: 6,
        fontSize: 12,
        lineHeight: "22px",
      }}
    >
      <span style={{ color: "#8a5a00", letterSpacing: 0.5, fontSize: 10, textTransform: "uppercase" }}>
        {k}
      </span>
      <span style={{ color: "#2a1a00" }}>{children}</span>
    </div>
  );
}

// ── NOTES app · yellow legal pad · 4-page empathy quadrants ──────────

function NotesApp({ onHome }: { onHome: () => void }) {
  const pages = [
    { head: "Says", sub: "claims he makes", lines: [`"${EMPATHY_MAP.says.quote}"`, `skills: ${EMPATHY_MAP.says.skills.join(", ")}`] },
    { head: "Thinks", sub: "operating compass", lines: EMPATHY_MAP.thinks.map((t) => `· ${t}`) },
    { head: "Does", sub: "tools in rotation", lines: [EMPATHY_MAP.does.join(" · ")] },
    { head: "Feels", sub: "motivations", lines: EMPATHY_MAP.feels.map((f) => `· ${f}`) },
  ];
  const [page, setPage] = useState(0);
  const p = pages[page];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#3a2a1a",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppNav onHome={onHome} title="Notes" subtitle={`EMPATHY · ${page + 1}/${pages.length}`} leather />
      <div
        style={{
          flex: 1,
          margin: "0 6px 6px",
          background: "#fff9c4",
          backgroundImage:
            "repeating-linear-gradient(180deg, transparent 0 23px, #cfd1d6 23px 24px), linear-gradient(90deg, transparent 0 28px, rgba(220, 60, 60, 0.4) 28px 29px, transparent 29px)",
          borderRadius: 4,
          padding: "30px 12px 10px 32px",
          color: "#2a2300",
          fontFamily: FONT_MARKER,
          fontSize: 16,
          lineHeight: "24px",
          overflowY: "auto",
          boxShadow:
            "inset 0 4px 8px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700 }}>{p.head}</div>
        <div style={{ fontSize: 12, color: "#7a5a00", fontStyle: "italic" }}>
          {p.sub}
        </div>
        <div style={{ marginTop: 10 }}>
          {p.lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
      <div
        style={{
          padding: "6px 8px",
          background:
            "linear-gradient(180deg, #5a3a1a 0%, #3a2308 100%)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #000",
        }}
      >
        <ToolbarBtn onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
          ◂ prev
        </ToolbarBtn>
        <span style={{ color: "#fff8e8", fontFamily: FONT_UI, fontSize: 11 }}>
          page {page + 1} of {pages.length}
        </span>
        <ToolbarBtn
          onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
          disabled={page === pages.length - 1}
        >
          next ▸
        </ToolbarBtn>
      </div>
    </div>
  );
}

// ── CALENDAR app · journey list view ────────────────────────────────

function CalendarApp({ onHome }: { onHome: () => void }) {
  const nodes = buildTimeline();
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", flexDirection: "column" }}>
      <AppNav
        onHome={onHome}
        title="Calendar"
        subtitle="JOURNEY MAP · List"
        stitching
      />
      <ul style={{ listStyle: "none", padding: 0, margin: 0, overflowY: "auto", flex: 1 }}>
        {nodes.map((n) => (
          <li
            key={n.year}
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid #e0e0e0",
              background: n.live ? "#fff9e0" : "#fff",
              display: "grid",
              gridTemplateColumns: "56px 1fr",
              gap: 8,
              fontFamily: FONT_UI,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 22,
                  fontWeight: 700,
                  color: n.live ? RED : INK,
                  lineHeight: 1,
                }}
              >
                {n.year.slice(-2)}
              </div>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: 1,
                  color: MUTED,
                  textTransform: "uppercase",
                }}
              >
                {n.year.slice(0, 2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: n.live ? RED : MUTED, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>
                {n.phase}
                {n.live && <span style={{ marginLeft: 4 }}>● now</span>}
              </div>
              <div style={{ fontSize: 13, color: INK, fontWeight: 700, lineHeight: 1.25 }}>
                {n.position}
              </div>
              <div style={{ fontSize: 11, color: IOS_BLUE, fontStyle: "italic" }}>
                @ {n.org}
              </div>
              <div style={{ fontSize: 11, color: INK_DIM, marginTop: 1, lineHeight: 1.4 }}>
                {n.detail}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── STOCKS app · black-tape impact tally ────────────────────────────

function StocksApp({ onHome }: { onHome: () => void }) {
  const items = IMPACT_METRICS.slice(0, 8);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", display: "flex", flexDirection: "column" }}>
      <AppNav onHome={onHome} title="Stocks" subtitle="IMPACT TALLY" dark />
      <ul style={{ listStyle: "none", padding: 0, margin: 0, overflowY: "auto", flex: 1 }}>
        {items.map((m, i) => (
          <li
            key={m.id}
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid #1a1a1a",
              background: openIdx === i ? "#1a1a1a" : "#000",
              color: "#fff",
              cursor: "pointer",
              fontFamily: FONT_UI,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{m.label.toUpperCase()}</div>
                <div style={{ fontSize: 10, color: MUTED, fontStyle: "italic" }}>
                  {m.context ?? "—"}
                </div>
              </div>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: -0.5,
                }}
              >
                {m.value}
              </div>
              <div
                style={{
                  padding: "2px 6px",
                  background: GREEN,
                  color: "#fff",
                  fontFamily: FONT_DISPLAY,
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 3,
                  minWidth: 50,
                  textAlign: "center",
                }}
              >
                +{1 + (i % 9)}.{(i * 7) % 10}%
              </div>
            </div>
            {openIdx === i && (
              <div
                style={{
                  marginTop: 6,
                  padding: "6px 8px",
                  background: "#0a0a0a",
                  border: "1px solid #1f1f1f",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 18 }}>{m.icon}</span>
                <Sparkline color={GREEN} />
                <div style={{ fontSize: 10, color: MUTED, lineHeight: 1.3 }}>
                  shipped surface ▾<br />
                  paired to one
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div
        style={{
          padding: "4px 8px",
          background: "#0a0a0a",
          borderTop: "1px solid #1f1f1f",
          fontFamily: FONT_UI,
          fontSize: 9,
          color: MUTED,
          textAlign: "center",
          letterSpacing: 0.5,
        }}
      >
        market: shipping · outcomes only · live
      </div>
    </div>
  );
}

function Sparkline({ color }: { color: string }) {
  const pts = [4, 8, 6, 10, 7, 12, 9, 14, 11, 16, 13, 18].map((y, i) => `${i * 8},${22 - y}`).join(" ");
  return (
    <svg viewBox="0 0 100 22" style={{ width: 100, height: 22, flexShrink: 0 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

// ── PHOTOS app · card-sort works grid ───────────────────────────────

function PhotosApp({ onHome }: { onHome: () => void }) {
  const projects = CARD_SORTING.projects.slice(0, 4);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", display: "flex", flexDirection: "column" }}>
      <AppNav onHome={onHome} title="Photos" subtitle="CARD SORT · Works" dark />
      {openIdx === null ? (
        <div style={{ flex: 1, padding: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, overflowY: "auto" }}>
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setOpenIdx(i)}
              style={{
                aspectRatio: "1 / 1",
                background: `linear-gradient(135deg, ${["#cc6600", "#9933cc", "#0066cc", "#009966"][i]} 0%, #000 130%)`,
                border: "1px solid #1f1f1f",
                color: "#fff",
                fontFamily: FONT_UI,
                cursor: "pointer",
                padding: 8,
                textAlign: "left",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse 60% 30% at 30% 25%, rgba(255,255,255,0.35) 0%, transparent 70%)",
                }}
              />
              <div
                style={{
                  position: "relative",
                  fontFamily: FONT_DISPLAY,
                  fontSize: 32,
                  textAlign: "center",
                  marginTop: 12,
                }}
              >
                {["🖼", "📱", "🤖", "🧰"][i]}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 4,
                  left: 6,
                  right: 6,
                  fontSize: 10,
                  letterSpacing: 0.5,
                  textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                  lineHeight: 1.3,
                }}
              >
                <strong>{p.title.length > 18 ? p.title.slice(0, 18) + "…" : p.title}</strong>
                <br />
                <span style={{ opacity: 0.85 }}>{p.category} · {p.duration}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ flex: 1, padding: 12, color: "#fff", overflowY: "auto" }}>
          <button
            type="button"
            onClick={() => setOpenIdx(null)}
            style={{
              background: "transparent",
              border: "none",
              color: IOS_BLUE,
              fontFamily: FONT_UI,
              fontSize: 13,
              cursor: "pointer",
              padding: 0,
              marginBottom: 6,
            }}
          >
            ◂ Albums
          </button>
          <div
            style={{
              aspectRatio: "16 / 10",
              background: `linear-gradient(135deg, ${["#cc6600", "#9933cc", "#0066cc", "#009966"][openIdx]} 0%, #000 130%)`,
              border: "1px solid #1f1f1f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
            }}
          >
            {["🖼", "📱", "🤖", "🧰"][openIdx]}
          </div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              marginTop: 8,
            }}
          >
            Plate {["I", "II", "III", "IV"][openIdx]} · {projects[openIdx].title}
          </div>
          <div style={{ fontSize: 10, color: MUTED }}>
            {projects[openIdx].category} · {projects[openIdx].duration}
          </div>
          <p style={{ fontSize: 12, color: "#cfd5e0", marginTop: 4, lineHeight: 1.5 }}>
            {projects[openIdx].description}
          </p>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: IOS_BLUE, marginTop: 4 }}>
            ▸ {projects[openIdx].technologies.join(" · ")}
          </div>
        </div>
      )}
    </div>
  );
}

// ── COMPASS app · operating compass ─────────────────────────────────

function CompassApp({ onHome }: { onHome: () => void }) {
  const [heading, setHeading] = useState(0);
  const thinks = EMPATHY_MAP.thinks;
  const idx = Math.floor(((heading + 22.5) % 360) / 90) % thinks.length;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse 70% 40% at 50% 30%, #4a3a20 0%, #2a1a08 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppNav onHome={onHome} title="Compass" subtitle="EMPATHY · Thinks" leather />
      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 12,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 30% 25%, #f4f4f4 0%, #a8a8a8 50%, #4a4a4a 100%)",
            border: "4px solid #2a1a08",
            boxShadow:
              "inset 0 2px 6px rgba(255,255,255,0.3), inset 0 -4px 10px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.6)",
            transform: `rotate(${-heading}deg)`,
            transition: "transform 320ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {["N", "E", "S", "W"].map((cardinal, i) => (
            <span
              key={cardinal}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-72px)`,
                fontFamily: FONT_DISPLAY,
                fontSize: 14,
                fontWeight: 700,
                color: i === 0 ? RED : "#1a1a1a",
              }}
            >
              {cardinal}
            </span>
          ))}
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: 10,
              left: "50%",
              marginLeft: -3,
              width: 6,
              height: 80,
              background: `linear-gradient(180deg, ${RED} 0%, ${RED} 50%, #1a1a1a 50%, #1a1a1a 100%)`,
              clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
            }}
          />
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: FONT_DISPLAY,
            fontSize: 28,
            fontWeight: 200,
            color: "#fff",
            letterSpacing: -1,
          }}
        >
          {Math.round(heading).toString().padStart(3, "0")}°
        </div>
        <div
          style={{
            marginTop: 4,
            fontFamily: FONT_UI,
            fontSize: 13,
            color: "#fff",
            textAlign: "center",
            fontStyle: "italic",
            padding: "0 16px",
          }}
        >
          &ldquo;{thinks[idx]}&rdquo;
        </div>
        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 8,
          }}
        >
          <ToolbarBtn onClick={() => setHeading((h) => (h - 90 + 360) % 360)}>↺ -90°</ToolbarBtn>
          <ToolbarBtn onClick={() => setHeading((h) => (h + 90) % 360)}>+90° ↻</ToolbarBtn>
        </div>
      </div>
    </div>
  );
}

// ── MAIL app · channels inbox ───────────────────────────────────────

function MailApp({ onHome }: { onHome: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", flexDirection: "column" }}>
      <AppNav onHome={onHome} title="Mailboxes" subtitle="USABILITY · Channels" stitching />
      <div
        style={{
          padding: "5px 10px",
          background: "#e6e9ee",
          borderBottom: "1px solid #c2c8d2",
          fontFamily: FONT_UI,
          fontSize: 11,
          color: INK_DIM,
        }}
      >
        <strong style={{ color: INK }}>Inbox</strong> · {USABILITY_TEST.channels.length} channels
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, overflowY: "auto" }}>
        {USABILITY_TEST.channels.map((c, i) => (
          <li
            key={c.label}
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid #e6e9ee",
              fontFamily: FONT_UI,
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: 8,
              alignItems: "center",
              background: i === 0 ? "#eaf2ff" : "#fff",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: i === 0 ? IOS_BLUE : "transparent",
                border: i === 0 ? "none" : "1px solid #c2c8d2",
              }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>
                {c.label}
              </div>
              <div style={{ fontSize: 11, color: INK_DIM, fontStyle: "italic" }}>
                {c.role}
              </div>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                style={{
                  fontSize: 12,
                  color: IOS_BLUE,
                  textDecoration: "none",
                  wordBreak: "break-all",
                }}
              >
                {c.value}
              </a>
            </div>
            <span style={{ color: MUTED, fontSize: 14 }}>›</span>
          </li>
        ))}
      </ul>
      <div
        style={{
          padding: "5px 10px",
          background: "#e6e9ee",
          borderTop: "1px solid #c2c8d2",
          fontFamily: FONT_UI,
          fontSize: 10,
          color: INK_DIM,
          textAlign: "center",
        }}
      >
        success metrics ▸ {USABILITY_TEST.successMetrics.join(" · ")}
      </div>
    </div>
  );
}

// ── SETTINGS app · grouped table view ──────────────────────────────

function SettingsApp({ onHome }: { onHome: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#e6e9ee", display: "flex", flexDirection: "column" }}>
      <AppNav onHome={onHome} title="Settings" subtitle="WHY KIRUK · About" />
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        <Group title="ABOUT">
          <Row k="Name" v={PERSONA.identity.name} />
          <Row k="Role" v={PERSONA.identity.role} />
          <Row k="Employer" v={PERSONA.identity.org} />
          <Row k="Location" v={PERSONA.identity.location} />
        </Group>
        <Group title="THESIS">
          <Block>
            <strong>{WHY_KIRUK.hook}</strong> {WHY_KIRUK.pain} {WHY_KIRUK.bridge}
          </Block>
        </Group>
        <Group title="TAGLINE">
          <Block italic>&ldquo;{WHY_KIRUK.tagline}&rdquo;</Block>
        </Group>
        <Group title="GOALS">
          {PERSONA.goals.map((g) => <Row key={g} k="▸" v={g} />)}
        </Group>
        <Group title="FRUSTRATIONS">
          {PERSONA.frustrations.map((f) => <Row key={f} k="✕" v={f} />)}
        </Group>
        <Group title="VERSION">
          <Row k="kiruk OS" v="3.0 (2009 era)" />
          <Row k="Build" v="profile.disc.20090429" />
        </Group>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          padding: "0 16px 4px",
          fontFamily: FONT_UI,
          fontSize: 10,
          letterSpacing: 0.5,
          color: "#6c727b",
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      <div
        style={{
          background: "#fff",
          borderTop: "1px solid #c2c8d2",
          borderBottom: "1px solid #c2c8d2",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "80px 1fr auto",
        gap: 8,
        padding: "7px 12px",
        borderBottom: "1px solid #e6e9ee",
        fontFamily: FONT_UI,
        fontSize: 13,
        color: INK,
        alignItems: "center",
      }}
    >
      <span style={{ color: INK_DIM, fontSize: 12 }}>{k}</span>
      <span>{v}</span>
      <span style={{ color: MUTED, fontSize: 14 }}>›</span>
    </div>
  );
}

function Block({ children, italic }: { children: React.ReactNode; italic?: boolean }) {
  return (
    <div
      style={{
        padding: "8px 12px",
        fontFamily: FONT_UI,
        fontSize: 12,
        color: INK,
        lineHeight: 1.45,
        fontStyle: italic ? "italic" : "normal",
      }}
    >
      {children}
    </div>
  );
}

// ── SimpleApp · for dock fillers ────────────────────────────────────

function SimpleApp({
  onHome,
  title,
  body,
}: {
  onHome: () => void;
  title: string;
  body: string;
}) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#e6e9ee", display: "flex", flexDirection: "column" }}>
      <AppNav onHome={onHome} title={title} subtitle="" />
      <div style={{ flex: 1, padding: 16, fontFamily: FONT_UI, fontSize: 13, color: INK }}>
        {body}
      </div>
    </div>
  );
}

// ── App chrome bar ──────────────────────────────────────────────────

function AppNav({
  onHome,
  title,
  subtitle,
  leather,
  stitching,
  dark,
}: {
  onHome: () => void;
  title: string;
  subtitle: string;
  leather?: boolean;
  stitching?: boolean;
  dark?: boolean;
}) {
  let bg = "linear-gradient(180deg, #b8c1cc 0%, #6c7480 100%)";
  let color = "#fff";
  let extra: React.CSSProperties = {};
  if (leather) {
    bg = "linear-gradient(180deg, #5a2a0c 0%, #3a1a04 100%)";
    color = "#fff8e8";
  }
  if (stitching) {
    extra = {
      boxShadow:
        "inset 0 -1px 0 rgba(0,0,0,0.4), inset 0 -2px 0 rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.18) inset",
    };
  }
  if (dark) {
    bg = "linear-gradient(180deg, #1a1a1a 0%, #000 100%)";
    color = "#fff";
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 6,
        padding: "6px 8px",
        background: bg,
        color,
        borderBottom: "1px solid #000",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.6)",
        ...extra,
      }}
    >
      <button
        type="button"
        onClick={onHome}
        title="Back to Home"
        style={{
          padding: "2px 8px",
          background: "rgba(255,255,255,0.15)",
          color,
          border: "1px solid rgba(0,0,0,0.4)",
          borderRadius: 4,
          fontFamily: FONT_UI,
          fontSize: 11,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      >
        ◂ Home
      </button>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, lineHeight: 1.1 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 9, letterSpacing: 1, opacity: 0.75 }}>
            {subtitle}
          </div>
        )}
      </div>
      <span style={{ width: 50 }} />
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        padding: "4px 10px",
        background: "linear-gradient(180deg, #6c727b 0%, #2a2f3a 100%)",
        color: "#fff",
        border: "1px solid #000",
        borderRadius: 5,
        fontFamily: FONT_UI,
        fontSize: 11,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.5)",
      }}
    >
      {children}
    </button>
  );
}

function ChipBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "3px 10px",
        background: "rgba(255,255,255,0.1)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: 999,
        fontFamily: FONT_UI,
        fontSize: 10,
        letterSpacing: 1,
        cursor: "pointer",
        textTransform: "uppercase",
      }}
    >
      {children}
    </button>
  );
}

// ── Desk widgets ─────────────────────────────────────────────────────

function WidgetCard({
  onClick,
  title,
  source,
  children,
  cta,
  accent,
}: {
  onClick: () => void;
  title: string;
  source: string;
  children: React.ReactNode;
  cta: string;
  accent: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      title={cta}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 0,
        background:
          "linear-gradient(180deg, #fdfbf3 0%, #ece6d2 100%)",
        color: INK,
        border: "1px solid #8a7a3a",
        borderRadius: 10,
        cursor: "pointer",
        boxShadow: hover
          ? "0 14px 26px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.7)"
          : "0 8px 16px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.6)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 180ms, box-shadow 220ms",
        overflow: "hidden",
        fontFamily: FONT_UI,
      }}
    >
      {/* Header strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "5px 10px",
          background: `linear-gradient(180deg, ${accent} 0%, ${darken(accent)} 100%)`,
          color: "#fff",
          fontFamily: FONT_DISPLAY,
          fontSize: 10,
          letterSpacing: 1,
          textTransform: "uppercase",
          fontWeight: 700,
          textShadow: "0 1px 0 rgba(0,0,0,0.4)",
          borderBottom: "1px solid rgba(0,0,0,0.4)",
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: 9, opacity: 0.85 }}>{source}</span>
      </div>
      <div style={{ padding: "8px 12px 10px", fontSize: 12, color: INK, lineHeight: 1.45 }}>
        {children}
      </div>
      <div
        style={{
          padding: "4px 10px 6px",
          fontSize: 10,
          color: accent,
          letterSpacing: 0.5,
          fontWeight: 700,
        }}
      >
        {cta} →
      </div>
    </button>
  );
}

function LeftDesk({
  onMoodboardOpen,
  onNotesOpen,
  isMobile,
}: {
  onMoodboardOpen: () => void;
  onNotesOpen: () => void;
  isMobile: boolean;
}) {
  const projects = CARD_SORTING.projects.slice(0, 3);
  return (
    <div
      style={{
        display: isMobile ? "grid" : "flex",
        gridTemplateColumns: isMobile ? "1fr 1fr" : undefined,
        flexDirection: isMobile ? undefined : "column",
        gap: isMobile ? 10 : 14,
        justifySelf: isMobile ? "stretch" : "end",
        width: isMobile ? "100%" : "min(260px, 100%)",
        maxWidth: isMobile ? "100%" : undefined,
      }}
    >
      <WidgetCard
        title="Project Moodboard"
        source="CARD SORT"
        accent="#cc6600"
        onClick={onMoodboardOpen}
        cta="Open in Photos"
      >
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {projects.map((p, i) => (
            <li
              key={p.id}
              style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr",
                gap: 8,
                padding: "4px 0",
                borderBottom: i < projects.length - 1 ? "1px dashed #c8b88a" : "none",
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 32,
                  height: 32,
                  background: `linear-gradient(135deg, ${["#cc6600", "#9933cc", "#0066cc"][i]} 0%, ${darken(["#cc6600", "#9933cc", "#0066cc"][i])} 100%)`,
                  border: "1px solid rgba(0,0,0,0.4)",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  color: "#fff",
                  textShadow: "1px 1px 0 rgba(0,0,0,0.4)",
                }}
              >
                {["🖼", "📱", "🤖"][i]}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 12,
                    color: INK,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.title}
                </div>
                <div style={{ fontSize: 10, color: INK_DIM }}>
                  {p.category} · {p.duration}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <WidgetCard
        title="Field Notes"
        source="WHY KIRUK"
        accent="#5a2a0c"
        onClick={onNotesOpen}
        cta="Open in Notes"
      >
        <div
          style={{
            fontFamily: FONT_MARKER,
            fontSize: 14,
            color: "#3a2a00",
            lineHeight: 1.45,
          }}
        >
          &ldquo;{WHY_KIRUK.hook}&rdquo;
        </div>
        <div
          style={{
            marginTop: 6,
            paddingTop: 6,
            borderTop: "1px dashed #c8b88a",
            fontSize: 11,
            color: INK_DIM,
            lineHeight: 1.5,
          }}
        >
          {WHY_KIRUK.bridge}
        </div>
      </WidgetCard>
    </div>
  );
}

function RightDesk({
  onCalendarOpen,
  onMailOpen,
  isMobile,
}: {
  onCalendarOpen: () => void;
  onMailOpen: () => void;
  isMobile: boolean;
}) {
  const nodes = buildTimeline();
  const upcoming = nodes.slice(-3);
  const channels = USABILITY_TEST.channels.slice(0, 3);
  return (
    <div
      style={{
        display: isMobile ? "grid" : "flex",
        gridTemplateColumns: isMobile ? "1fr 1fr" : undefined,
        flexDirection: isMobile ? undefined : "column",
        gap: isMobile ? 10 : 14,
        justifySelf: isMobile ? "stretch" : "start",
        width: isMobile ? "100%" : "min(260px, 100%)",
        maxWidth: isMobile ? "100%" : undefined,
      }}
    >
      <WidgetCard
        title="Career Agenda"
        source="JOURNEY MAP"
        accent={RED}
        onClick={onCalendarOpen}
        cta="Open in Calendar"
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 6,
            paddingBottom: 4,
            borderBottom: "1px dashed #c8b88a",
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 1,
              color: INK,
              letterSpacing: -0.5,
            }}
          >
            {new Date().toLocaleDateString("en-US", { day: "numeric" })}
          </div>
          <div>
            <div style={{ fontSize: 12, color: INK, fontWeight: 700, lineHeight: 1 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long" })}
            </div>
            <div style={{ fontSize: 10, color: INK_DIM }}>
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
          </div>
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {upcoming.map((n) => (
            <li
              key={n.year}
              style={{
                display: "grid",
                gridTemplateColumns: "38px 1fr",
                gap: 6,
                padding: "3px 0",
                fontSize: 11,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 13,
                  fontWeight: 700,
                  color: n.live ? RED : INK,
                  lineHeight: 1.2,
                }}
              >
                {n.year}
              </span>
              <span>
                <div style={{ fontWeight: 700, color: INK }}>
                  {n.position}
                  {n.live && (
                    <span style={{ color: RED, marginLeft: 4, fontSize: 9 }}>● now</span>
                  )}
                </div>
                <div style={{ color: INK_DIM, fontStyle: "italic", fontSize: 10 }}>
                  @ {n.org.split(" · ")[0]}
                </div>
              </span>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <WidgetCard
        title="Inbox Triage"
        source="USABILITY · Channels"
        accent={IOS_BLUE}
        onClick={onMailOpen}
        cta="Open in Mail"
      >
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {channels.map((c, i) => (
            <li
              key={c.label}
              style={{
                display: "grid",
                gridTemplateColumns: "10px 1fr",
                gap: 6,
                padding: "4px 0",
                borderBottom: i < channels.length - 1 ? "1px dashed #c8b88a" : "none",
                fontSize: 11,
                alignItems: "flex-start",
              }}
            >
              <span
                aria-hidden
                style={{
                  marginTop: 4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: i === 0 ? IOS_BLUE : "transparent",
                  border: i === 0 ? "none" : "1px solid #c8b88a",
                }}
              />
              <span>
                <div style={{ fontWeight: 700, color: INK }}>{c.label}</div>
                <div
                  style={{
                    fontSize: 10,
                    color: IOS_BLUE,
                    wordBreak: "break-all",
                    lineHeight: 1.35,
                  }}
                >
                  {c.value}
                </div>
                <div style={{ fontSize: 10, color: INK_DIM, fontStyle: "italic" }}>
                  {c.role}
                </div>
              </span>
            </li>
          ))}
        </ul>
      </WidgetCard>
    </div>
  );
}

// ── Multitask drawer ─────────────────────────────────────────────────

function MultitaskDrawer({
  recents,
  onPick,
  onClose,
}: {
  recents: AppId[];
  onPick: (id: AppId) => void;
  onClose: () => void;
}) {
  const items = recents
    .map((id) => APPS_HOME.find((a) => a.id === id) ?? APPS_DOCK.find((a) => a.id === id))
    .filter(Boolean) as AppDef[];
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "linear-gradient(180deg, rgba(20,20,30,0.92) 0%, rgba(0,0,0,0.96) 100%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.22)",
        zIndex: 4,
        padding: "10px 10px 12px",
        animation: "iskeu-drawer-up 240ms cubic-bezier(0.2, 0.9, 0.3, 1.05)",
        boxShadow: "0 -8px 18px rgba(0,0,0,0.55)",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
          paddingBottom: 6,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: FONT_DISPLAY,
            fontSize: 10,
            color: "#fff",
            letterSpacing: 2,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          <span aria-hidden style={{ fontSize: 13 }}>⊞</span>
          Recents
          <span
            style={{
              fontFamily: FONT_UI,
              fontSize: 9,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: 0,
              fontWeight: 400,
              textTransform: "none",
              marginLeft: 4,
            }}
          >
            {items.length === 0 ? "no apps yet" : `${items.length} open`}
          </span>
        </span>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.18)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            fontFamily: FONT_DISPLAY,
            fontSize: 12,
            fontWeight: 900,
            lineHeight: 1,
            cursor: "pointer",
            padding: 0,
          }}
          title="Close recents"
        >
          ×
        </button>
      </div>

      {/* App tiles */}
      {items.length === 0 ? (
        <div
          style={{
            padding: "10px 8px",
            textAlign: "center",
            color: "rgba(255,255,255,0.55)",
            fontFamily: FONT_UI,
            fontSize: 11,
            fontStyle: "italic",
          }}
        >
          tap any app from Home to begin building a stack here
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`,
            gap: 8,
          }}
        >
          {items.slice(0, 4).map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onPick(a.id as AppId)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "8px 4px",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.6) 0%, transparent 40%), linear-gradient(180deg, ${a.bg} 0%, ${darken(a.bg)} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  color: "#fff",
                  border: "1px solid rgba(0,0,0,0.3)",
                  boxShadow:
                    "inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                {a.icon}
              </div>
              <span
                style={{
                  fontFamily: FONT_UI,
                  fontSize: 10,
                  color: "#fff",
                  letterSpacing: 0.2,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                }}
              >
                {a.label}
              </span>
            </button>
          ))}
        </div>
      )}
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

export default IphoneSkeuHomePage;
