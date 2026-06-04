"use client";

/**
 * FlashSplashHomePage — 2000 archetype: KIRUK.COM Aqua Desktop.
 *
 * The web UI of 2000 was Apple's Aqua + Macromedia DHTML — translucent
 * candy gradients, lozenge pinstripes, draggable layers, pop-up ads,
 * hit counters and "best viewed in IE 5.5" banners.
 *
 * Paradigm: a virtual DESKTOP. The portfolio is not a single page but a
 * stack of floating browser windows on a candy-gradient desktop. Each
 * window is one UX research artifact. The user drags them around,
 * brings them into focus, minimizes to the bottom dock, restores them
 * back to the workspace. Distinct from 1981 (monochrome static bevels),
 * 1997 (chapter rail), 1993 (directory), 1995 (single GeoCities page).
 *
 * Unique interactions:
 *   · Title-bar drag to move windows; constrained to workspace
 *   · Click anywhere on a window to raise its z-index (focus stacking)
 *   · Traffic-light minimize/maximize/close (close = minimize to dock)
 *   · Bottom dock auto-fills with minimized windows; click to restore
 *   · "View" switcher: CASCADE / TILE / STACK auto-arranges all windows
 *   · Header search box filters which windows render
 *   · Y2K pop-up ad appears after a delay, dismissible
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

// ── Palette — Y2K Aqua / iMac G3 ─────────────────────────────────────

const DESKTOP_BG_A = "#3aa6c4";   // Bondi blue
const DESKTOP_BG_B = "#7ec9da";
const DESKTOP_BG_C = "#ffe2a8";   // tangerine wash
const PINSTRIPE = "rgba(255,255,255,0.06)";

const AQUA_HI = "#e6f3fb";
const AQUA = "#9fcfee";
const AQUA_DEEP = "#3a7fbf";
const AQUA_INK = "#0f3550";

const WINDOW_BG = "#fdfdff";
const WINDOW_BORDER = "#7a93a8";
const WINDOW_SHADOW = "0 14px 30px rgba(20,40,70,0.35), 0 4px 8px rgba(20,40,70,0.25)";

const TRAFFIC_RED = "#ff5f57";
const TRAFFIC_YELLOW = "#ffbd2e";
const TRAFFIC_GREEN = "#28c840";

const INK = "#1a2a38";
const INK_DIM = "#516577";
const MUTED = "#8a9aab";
const ACCENT = "#0066cc";  // classic Y2K hyperlink blue
const ACCENT_HOT = "#cc0066"; // visited link
const ORANGE = "#ff8a3a";

const FONT_UI = "'Trebuchet MS', 'Verdana', 'Helvetica Neue', sans-serif";
const FONT_DISPLAY = "'Helvetica Neue', 'Arial Black', 'Trebuchet MS', sans-serif";
const FONT_BODY = "'Verdana', 'Geneva', sans-serif";
const FONT_MONO = "'Courier New', Courier, monospace";

// ── Window model ─────────────────────────────────────────────────────

interface WinDef {
  id: string;
  num: string;
  title: string;
  album: string;        // category tag in dock
  accent: string;
  initialX: number;
  initialY: number;
  w: number;
  body: () => React.ReactNode;
}

type WinState = {
  id: string;
  x: number;
  y: number;
  w: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  preMax?: { x: number; y: number; w: number };
};

function buildWindows(): WinDef[] {
  const nodes = buildTimeline();
  return [
    {
      id: "intro",
      num: "01",
      title: "Welcome to KIRUK.COM",
      album: "INTRO",
      accent: ACCENT,
      initialX: 40,
      initialY: 24,
      w: 460,
      body: () => (
        <>
          <p style={ps.lede}>
            <span style={ps.dropCap}>W</span>
            elcome to a portfolio site that reads its own designer as
            the user under study. Each window below is one classical{" "}
            <em>UX research artifact</em> — persona, empathy map,
            journey, impact, selected works, usability test — applied to
            the practitioner himself.
          </p>
          <p style={ps.body}>
            <strong style={{ color: ACCENT }}>{WHY_KIRUK.hook}</strong>{" "}
            Strategy, design and code usually live on separate processes.
            That separation costs intent and speed. The bridge collapses
            them.
          </p>
          <BlockQuote>{WHY_KIRUK.tagline}</BlockQuote>
          <Helper>
            Drag any window by its title bar. Click the green +
            button to maximize. Click red × to send a window to the
            dock at the foot; click its dock icon to restore.
          </Helper>
        </>
      ),
    },
    {
      id: "profile",
      num: "02",
      title: "Profile · Subject of the Study",
      album: "PERSONA",
      accent: "#cc0099",
      initialX: 520,
      initialY: 56,
      w: 360,
      body: () => (
        <>
          <DataTable>
            <DataRow k="Name">{PERSONA.identity.name}</DataRow>
            <DataRow k="Role">{PERSONA.identity.role}</DataRow>
            <DataRow k="Employer">{PERSONA.identity.org}</DataRow>
            <DataRow k="Location">{PERSONA.identity.location}</DataRow>
            <DataRow k="Born">Salem, Tamil Nadu · 2001</DataRow>
            <DataRow k="Type">Designer ↔ Engineer (bridge)</DataRow>
          </DataTable>
          <Bullets head="GOALS" items={[...PERSONA.goals]} marker="▸" tint={ACCENT} />
          <Bullets head="FRUSTRATIONS" items={[...PERSONA.frustrations]} marker="✕" tint={ACCENT_HOT} />
        </>
      ),
    },
    {
      id: "routine",
      num: "03",
      title: "Operating Routine · Empathy Map",
      album: "EMPATHY",
      accent: "#009966",
      initialX: 88,
      initialY: 310,
      w: 540,
      body: () => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Quad head="Says" sub="claims he makes" accent={ACCENT}>
            <i>&ldquo;{EMPATHY_MAP.says.quote}&rdquo;</i>
            <div style={{ color: INK_DIM, fontSize: 11, marginTop: 4 }}>
              {EMPATHY_MAP.says.skills.join(" · ")}
            </div>
          </Quad>
          <Quad head="Thinks" sub="operating compass" accent={ACCENT_HOT}>
            {EMPATHY_MAP.thinks.map((t) => (
              <div key={t}>· {t}</div>
            ))}
          </Quad>
          <Quad head="Does" sub="tools in rotation" accent={ORANGE}>
            <div style={{ lineHeight: 1.55 }}>{EMPATHY_MAP.does.join(" · ")}</div>
          </Quad>
          <Quad head="Feels" sub="motivations" accent="#009966">
            {EMPATHY_MAP.feels.map((f) => (
              <div key={f}>· {f}</div>
            ))}
          </Quad>
        </div>
      ),
    },
    {
      id: "timeline",
      num: "04",
      title: "Lifeline · Career Map",
      album: "JOURNEY",
      accent: "#cc6600",
      initialX: 580,
      initialY: 380,
      w: 460,
      body: () => (
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {nodes.map((n) => (
            <li
              key={n.year}
              style={{
                display: "grid",
                gridTemplateColumns: "60px 1fr",
                gap: 10,
                padding: "6px 10px",
                marginBottom: 4,
                background: n.live ? `${ACCENT_HOT}11` : `${ACCENT}08`,
                border: `1px solid ${WINDOW_BORDER}55`,
                borderLeft: `3px solid ${n.live ? ACCENT_HOT : ACCENT}`,
                borderRadius: 4,
              }}
            >
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 18,
                  fontWeight: 900,
                  color: n.live ? ACCENT_HOT : ACCENT_DEEP(),
                  lineHeight: 1,
                }}
              >
                {n.year}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 9,
                    letterSpacing: 2,
                    color: INK_DIM,
                    textTransform: "uppercase",
                  }}
                >
                  {n.phase}
                  {n.live && (
                    <span style={{ color: ACCENT_HOT, marginLeft: 6 }}>● LIVE</span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 13,
                    fontWeight: 700,
                    color: INK,
                  }}
                >
                  {n.position}
                </div>
                <div style={{ fontSize: 11, color: INK_DIM, fontStyle: "italic" }}>
                  @ {n.org}
                </div>
                <div style={{ fontSize: 12, color: INK, marginTop: 2, lineHeight: 1.45 }}>
                  {n.detail}
                </div>
              </div>
            </li>
          ))}
        </ol>
      ),
    },
    {
      id: "stats",
      num: "05",
      title: "Stat Readouts · Impact Tally",
      album: "IMPACT",
      accent: "#0066cc",
      initialX: 130,
      initialY: 600,
      w: 600,
      body: () => (
        <>
          <p style={ps.body}>
            Outcomes, not output. Each tile pairs one cite-able figure
            with the shipped surface that produced it.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 8,
            }}
          >
            {IMPACT_METRICS.slice(0, 8).map((m) => (
              <StatTile key={m.id} icon={m.icon} value={m.value} label={m.label} context={m.context} />
            ))}
          </div>
        </>
      ),
    },
    {
      id: "works",
      num: "06",
      title: "Selected Works · Plates I-IV",
      album: "WORKS",
      accent: "#9933cc",
      initialX: 690,
      initialY: 640,
      w: 480,
      body: () => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {CARD_SORTING.projects.map((pr, i) => (
            <WorkCard key={pr.id} project={pr} index={i} />
          ))}
        </div>
      ),
    },
    {
      id: "contact",
      num: "07",
      title: "Reach Out · Engagement Protocol",
      album: "CONTACT",
      accent: "#cc3366",
      initialX: 180,
      initialY: 860,
      w: 560,
      body: () => (
        <>
          <p style={ps.body}>
            <strong>Task.</strong> {USABILITY_TEST.task}. {USABILITY_TEST.taskBody}{" "}
            <em>Email for written answers, LinkedIn for warm intros,
            GitHub for code first, phone only when it cannot wait.</em>
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 8,
            }}
          >
            {USABILITY_TEST.channels.map((c) => (
              <ContactChip key={c.label} channel={c} />
            ))}
          </div>
          <div
            style={{
              marginTop: 10,
              padding: "6px 10px",
              fontFamily: FONT_MONO,
              fontSize: 11,
              color: ACCENT_DEEP(),
              background: `${ACCENT}11`,
              border: `1px dashed ${ACCENT}55`,
              borderRadius: 4,
            }}
          >
            success metrics ▸ {USABILITY_TEST.successMetrics.join(" · ")}
          </div>
        </>
      ),
    },
  ];
}

function ACCENT_DEEP() {
  return "#003d80";
}

// ── Hook: viewport size ──────────────────────────────────────────────

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

export function FlashSplashHomePage() {
  const { setLayoutMode } = useLayoutMode();
  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);

  const isMobile = useIsMobile();

  const defs = useMemo(buildWindows, []);

  const initialStates = useCallback((): Record<string, WinState> => {
    const init: Record<string, WinState> = {};
    defs.forEach((d, i) => {
      init[d.id] = {
        id: d.id,
        x: d.initialX,
        y: d.initialY,
        w: d.w,
        z: i + 10,
        minimized: false,
        maximized: false,
      };
    });
    return init;
  }, [defs]);

  const [states, setStates] = useState<Record<string, WinState>>(initialStates);
  const [topZ, setTopZ] = useState(defs.length + 10);
  const [focusedId, setFocusedId] = useState<string>(defs[0]?.id ?? "");
  const [lastAction, setLastAction] = useState<string>("loaded kiruk.com · 7 windows opened · drag a title bar to move");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kiruk-2000-layout");
      if (raw) {
        const parsed = JSON.parse(raw) as {
          states: Record<string, WinState>;
          topZ: number;
          focusedId: string;
        };
        if (parsed.states) {
          setStates(parsed.states);
          setTopZ(parsed.topZ ?? defs.length + 10);
          if (parsed.focusedId) setFocusedId(parsed.focusedId);
        }
      }
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, [defs.length]);

  // Persist layout
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(
        "kiruk-2000-layout",
        JSON.stringify({ states, topZ, focusedId }),
      );
    } catch {
      /* noop */
    }
  }, [states, topZ, focusedId, hydrated]);

  const note = useCallback((msg: string) => setLastAction(msg), []);

  const focus = useCallback((id: string) => {
    setTopZ((z) => {
      const next = z + 1;
      setStates((s) => ({ ...s, [id]: { ...s[id], z: next, minimized: false } }));
      return next;
    });
    setFocusedId(id);
  }, []);

  const minimize = useCallback(
    (id: string) => {
      setStates((s) => ({ ...s, [id]: { ...s[id], minimized: true } }));
      const d = defs.find((dd) => dd.id === id);
      note(`Minimized ${d?.album ?? id} to dock`);
    },
    [defs, note],
  );

  const toggleMaximize = useCallback(
    (id: string) => {
      setStates((s) => {
        const cur = s[id];
        if (cur.maximized && cur.preMax) {
          return {
            ...s,
            [id]: {
              ...cur,
              x: cur.preMax.x,
              y: cur.preMax.y,
              w: cur.preMax.w,
              maximized: false,
              preMax: undefined,
            },
          };
        }
        return {
          ...s,
          [id]: {
            ...cur,
            preMax: { x: cur.x, y: cur.y, w: cur.w },
            x: 16,
            y: 80,
            w: Math.max(720, Math.min(1200, window.innerWidth - 40)),
            maximized: true,
          },
        };
      });
      const d = defs.find((dd) => dd.id === id);
      note(`${states[id]?.maximized ? "Restored" : "Maximized"} ${d?.album ?? id}`);
      focus(id);
    },
    [defs, focus, note, states],
  );

  const sendToBack = useCallback(
    (id: string) => {
      setStates((s) => {
        const minZ = Math.min(...Object.values(s).map((w) => w.z)) - 1;
        return { ...s, [id]: { ...s[id], z: minZ } };
      });
      const d = defs.find((dd) => dd.id === id);
      note(`Sent ${d?.album ?? id} to back`);
    },
    [defs, note],
  );

  const resetLayout = useCallback(() => {
    setStates(initialStates());
    setTopZ(defs.length + 10);
    setFocusedId(defs[0]?.id ?? "");
    note("Layout reset · windows returned to cascade");
  }, [defs, initialStates, note]);

  // Drag handling — title-bar drag w/ edge-snap on release
  const dragRef = useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
    moved: boolean;
  } | null>(null);
  const [snapHint, setSnapHint] = useState<"left" | "right" | "full" | null>(null);

  const beginDrag = useCallback(
    (id: string, e: React.MouseEvent<HTMLDivElement>) => {
      const w = states[id];
      if (!w) return;
      // Block drag while maximized — encourages double-click to restore
      if (w.maximized) {
        toggleMaximize(id);
        return;
      }
      dragRef.current = {
        id,
        offsetX: e.clientX - w.x,
        offsetY: e.clientY - w.y,
        moved: false,
      };
      focus(id);
    },
    [states, focus, toggleMaximize],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      d.moved = true;
      const nx = Math.max(0, e.clientX - d.offsetX);
      const ny = Math.max(0, e.clientY - d.offsetY);
      // Snap hint while dragging
      const W = window.innerWidth;
      if (e.clientY < 28) setSnapHint("full");
      else if (e.clientX < 24) setSnapHint("left");
      else if (e.clientX > W - 24) setSnapHint("right");
      else setSnapHint(null);
      setStates((s) => ({ ...s, [d.id]: { ...s[d.id], x: nx, y: ny } }));
    };
    const onUp = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) {
        setSnapHint(null);
        return;
      }
      // Apply snap
      const W = Math.min(window.innerWidth, 1180);
      const halfW = Math.floor(W / 2) - 24;
      if (snapHint === "left") {
        setStates((s) => ({
          ...s,
          [d.id]: {
            ...s[d.id],
            x: 16,
            y: 80,
            w: halfW,
            preMax: undefined,
            maximized: false,
          },
        }));
        const def = defs.find((dd) => dd.id === d.id);
        note(`Snapped ${def?.album ?? d.id} to left half`);
      } else if (snapHint === "right") {
        setStates((s) => ({
          ...s,
          [d.id]: {
            ...s[d.id],
            x: Math.max(16, W - halfW - 8),
            y: 80,
            w: halfW,
            preMax: undefined,
            maximized: false,
          },
        }));
        const def = defs.find((dd) => dd.id === d.id);
        note(`Snapped ${def?.album ?? d.id} to right half`);
      } else if (snapHint === "full") {
        toggleMaximize(d.id);
      } else if (d.moved) {
        const def = defs.find((dd) => dd.id === d.id);
        const finalState = states[d.id];
        note(
          `Moved ${def?.album ?? d.id} to ${Math.round(finalState?.x ?? 0)}, ${Math.round(finalState?.y ?? 0)}`,
        );
      }
      setSnapHint(null);
      dragRef.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [defs, note, snapHint, states, toggleMaximize]);

  // View mode arranger
  type ViewMode = "cascade" | "tile" | "stack";
  const arrange = useCallback(
    (mode: ViewMode) => {
      const next: Record<string, WinState> = { ...states };
      defs.forEach((d, i) => {
        let x: number, y: number, w: number;
        if (mode === "cascade") {
          x = 40 + i * 36;
          y = 80 + i * 30;
          w = d.w;
        } else if (mode === "tile") {
          const cols = 3;
          const tileW = 380;
          const tileH = 320;
          x = 16 + (i % cols) * (tileW + 14);
          y = 80 + Math.floor(i / cols) * (tileH + 14);
          w = tileW;
        } else {
          // stack — center column
          x = 240;
          y = 80 + i * 22;
          w = 540;
        }
        next[d.id] = {
          ...next[d.id],
          x,
          y,
          w,
          minimized: false,
          maximized: false,
          preMax: undefined,
          z: next[d.id].z,
        };
      });
      setStates(next);
      note(`Arranged ${defs.length} windows · ${mode.toUpperCase()}`);
    },
    [defs, states, note],
  );

  // Jump to a window — used by address bar + bookmarks
  const jumpTo = useCallback(
    (id: string) => {
      const d = defs.find((dd) => dd.id === id);
      if (!d) return;
      setStates((s) => ({
        ...s,
        [id]: { ...s[id], minimized: false },
      }));
      focus(id);
      note(`Jumped to ${d.album} · ${d.title}`);
    },
    [defs, focus, note],
  );

  // Address bar
  const [address, setAddress] = useState("kiruk.com/");
  const submitAddress = useCallback(() => {
    const m = address.trim().toLowerCase().match(/([a-z0-9_-]+)(\.html)?$/);
    if (!m) {
      note(`404 · could not parse "${address}"`);
      return;
    }
    const slug = m[1];
    const hit = defs.find(
      (d) => d.id === slug || d.album.toLowerCase() === slug || d.num === slug,
    );
    if (hit) {
      jumpTo(hit.id);
      setAddress(`kiruk.com/${hit.id}.html`);
    } else {
      note(`404 · "${slug}" not found · try persona / empathy / journey / impact / works / contact`);
    }
  }, [address, defs, jumpTo, note]);

  // Bookmarks menu
  const [bookmarksOpen, setBookmarksOpen] = useState(false);

  // Header search filter
  const [query, setQuery] = useState("");
  const visibleDefs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return defs;
    return defs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.album.toLowerCase().includes(q),
    );
  }, [defs, query]);

  // Hit counter
  const [hits] = useState(() => 13497 + Math.floor(Math.random() * 200));

  // Pop-up ad — appears after delay, dismissible
  const [adOpen, setAdOpen] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setAdOpen(true), 2400);
    return () => window.clearTimeout(t);
  }, []);

  // Context menu (right-click on title bar)
  const [ctx, setCtx] = useState<{ id: string; x: number; y: number } | null>(null);
  useEffect(() => {
    if (!ctx) return;
    const onClick = () => setCtx(null);
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [ctx]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Tab") {
        e.preventDefault();
        // Cycle focus through visible windows
        const visible = defs.filter((d) => !states[d.id].minimized);
        const idx = visible.findIndex((d) => d.id === focusedId);
        const nextIdx = e.shiftKey
          ? (idx - 1 + visible.length) % visible.length
          : (idx + 1) % visible.length;
        const target = visible[nextIdx];
        if (target) focus(target.id);
      } else if (e.key.toLowerCase() === "m" && focusedId) {
        e.preventDefault();
        minimize(focusedId);
      } else if (e.key.toLowerCase() === "f" && focusedId) {
        e.preventDefault();
        toggleMaximize(focusedId);
      } else if (e.key === "Escape") {
        setBookmarksOpen(false);
        setCtx(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [defs, states, focusedId, focus, minimize, toggleMaximize]);

  const minimizedIds = Object.keys(states).filter((id) => states[id].minimized);
  const openCount = defs.length - minimizedIds.length;

  return (
    <main
      id="kiruk-2000-desktop"
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#1a4a6a",
        color: INK,
        fontFamily: FONT_UI,
        paddingTop: "calc(var(--simple-game-nav-bottom, 56px) + 8px)",
        paddingBottom: 80,
        overflow: "hidden",
      }}
    >
      <style jsx global>{`
        @keyframes kiruk-2000-aqua-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.6), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.15); }
          50%      { box-shadow: 0 0 12px 2px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.15); }
        }
        @keyframes kiruk-2000-win-pop {
          0%   { opacity: 0; transform: scale(0.95) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes kiruk-2000-ad-fly {
          0%   { transform: scale(0.6) rotate(-3deg); opacity: 0; }
          70%  { transform: scale(1.05) rotate(1deg); opacity: 1; }
          100% { transform: scale(1) rotate(-1deg); opacity: 1; }
        }
        .kiruk-2000-pinstripes {
          background-image:
            repeating-linear-gradient(0deg, transparent 0 2px, rgba(255,255,255,0.06) 2px 3px);
        }
        .kiruk-2000-window {
          animation: kiruk-2000-win-pop 320ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes kiruk-2000-tip-pulse {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.95; }
          50%      { transform: translateX(-50%) translateY(-3px); opacity: 1; }
        }
        @keyframes kiruk-2000-dock-bounce {
          0%, 100% { transform: scale(1.16); }
          50%      { transform: scale(1.28); }
        }
      `}</style>

      {/* Candy gradient desktop backdrop */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            `radial-gradient(ellipse 80% 60% at 20% 10%, ${DESKTOP_BG_B} 0%, transparent 60%),` +
            `radial-gradient(ellipse 70% 60% at 90% 100%, ${DESKTOP_BG_C} 0%, transparent 65%),` +
            `linear-gradient(180deg, ${DESKTOP_BG_A} 0%, #1f5f80 100%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Aqua pinstripes overlay */}
      <div
        aria-hidden
        className="kiruk-2000-pinstripes"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── HEADER ──────────────────────────────────────────── */}
      <header
        style={{
          position: "relative",
          zIndex: 5,
          maxWidth: 1180,
          margin: "0 auto 12px",
          padding: "0 14px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "auto 1fr auto",
            alignItems: "center",
            gap: isMobile ? 8 : 14,
            padding: "8px 14px",
            background:
              `linear-gradient(180deg, ${AQUA_HI} 0%, ${AQUA} 60%, ${AQUA_DEEP} 100%)`,
            border: `1px solid ${AQUA_INK}`,
            borderRadius: 10,
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.2), 0 6px 16px rgba(0,0,0,0.35)",
            color: AQUA_INK,
          }}
        >
          {/* Aqua-gel logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              aria-hidden
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background:
                  `radial-gradient(ellipse at 35% 30%, #fff 0%, #aee9ff 30%, #38a6e6 60%, #0a4a80 100%)`,
                border: `1px solid #04335a`,
                boxShadow:
                  "inset 0 4px 8px rgba(255,255,255,0.85), inset 0 -3px 6px rgba(0,40,80,0.5), 0 2px 4px rgba(0,0,0,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT_DISPLAY,
                fontSize: 20,
                fontWeight: 900,
                color: "#fff",
                textShadow: "0 1px 2px rgba(0,30,60,0.6)",
              }}
            >
              K
            </div>
            <div>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: -0.5,
                  lineHeight: 1,
                  color: "#fff",
                  textShadow:
                    "0 1px 0 rgba(255,255,255,0.4), 0 -1px 1px rgba(0,30,60,0.4)",
                }}
              >
                KIRUK.COM
              </div>
              <div
                style={{
                  fontFamily: FONT_UI,
                  fontSize: 10,
                  letterSpacing: 2,
                  color: AQUA_INK,
                  textTransform: "uppercase",
                  marginTop: 2,
                  fontStyle: "italic",
                }}
              >
                a usability study of one · est. 2000
              </div>
            </div>
          </div>

          {/* Search + view switcher */}
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#fff",
                border: `1px solid ${AQUA_INK}`,
                borderRadius: 999,
                padding: "2px 4px 2px 12px",
                boxShadow:
                  "inset 0 2px 4px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.6)",
                width: "min(360px, 100%)",
              }}
            >
              <span style={{ color: MUTED, fontSize: 12 }}>🔍</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find on this site…"
                style={{
                  flex: 1,
                  padding: "4px 8px",
                  border: "none",
                  background: "transparent",
                  fontFamily: FONT_UI,
                  fontSize: 12,
                  color: INK,
                  outline: "none",
                }}
              />
              <AquaBtn onClick={() => setQuery("")}>
                {query ? "Clear" : "Go"}
              </AquaBtn>
            </div>
            {!isMobile && (
              <div style={{ display: "flex", gap: 4 }}>
                <AquaTab onClick={() => arrange("cascade")}>▤ Cascade</AquaTab>
                <AquaTab onClick={() => arrange("tile")}>▦ Tile</AquaTab>
                <AquaTab onClick={() => arrange("stack")}>≡ Stack</AquaTab>
                <AquaTab onClick={resetLayout}>↺ Reset</AquaTab>
              </div>
            )}
          </div>

          {/* Hit counter + window count */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                color: AQUA_INK,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {openCount}/{defs.length} windows open
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 14,
                fontWeight: 700,
                marginTop: 2,
                display: "inline-block",
                padding: "2px 8px",
                background: "#001a36",
                color: "#39ff14",
                border: `1px solid #04335a`,
                borderRadius: 3,
                letterSpacing: 1,
                textShadow: "0 0 6px #39ff1488",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              {String(hits).padStart(6, "0")} hits
            </div>
            <div
              style={{
                fontFamily: FONT_UI,
                fontSize: 9,
                color: AQUA_INK,
                letterSpacing: 1,
                marginTop: 3,
                textTransform: "uppercase",
              }}
            >
              IE 5.5 · 1024×768 · ? for help
            </div>
          </div>
        </div>
      </header>

      {/* ── WORKSPACE ──────────────────────────────────────── */}
      {isMobile ? (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 720,
            margin: "0 auto",
            padding: "0 10px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {visibleDefs.map((d) => (
            <StackedWindow
              key={d.id}
              def={d}
              focused={focusedId === d.id}
              onFocus={() => setFocusedId(d.id)}
            />
          ))}
          {visibleDefs.length === 0 && (
            <div
              style={{
                marginTop: 60,
                padding: "16px 18px",
                background: WINDOW_BG,
                border: `1px solid ${WINDOW_BORDER}`,
                borderRadius: 8,
                fontFamily: FONT_UI,
                fontSize: 13,
                color: INK,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 900,
                  fontSize: 15,
                  marginBottom: 4,
                  color: ACCENT_DEEP(),
                }}
              >
                No windows match
              </div>
              <p style={{ fontSize: 12, color: INK_DIM, margin: 0 }}>
                Clear the search to bring them all back.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            minHeight: 980,
            maxWidth: 1180,
            margin: "0 auto",
            padding: "0 14px",
          }}
        >
          {visibleDefs.map((d) => {
            const s = states[d.id];
            if (s.minimized) return null;
            return (
              <Window
                key={d.id}
                def={d}
                state={s}
                focused={focusedId === d.id}
                isFirstOpen={d.id === defs[0].id && !hydrated ? false : true}
                onFocus={() => focus(d.id)}
                onDragStart={(e) => beginDrag(d.id, e)}
                onDblClick={() => toggleMaximize(d.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCtx({ id: d.id, x: e.clientX, y: e.clientY });
                }}
                onMinimize={() => minimize(d.id)}
                onMaximize={() => toggleMaximize(d.id)}
                onJump={jumpTo}
                allDefs={defs}
                bookmarksOpen={bookmarksOpen && focusedId === d.id}
                setBookmarksOpen={setBookmarksOpen}
                address={address}
                setAddress={setAddress}
                submitAddress={submitAddress}
                note={note}
              />
            );
          })}
          {visibleDefs.length === 0 && (
            <div
              style={{
                maxWidth: 360,
                margin: "120px auto 0",
                padding: "16px 20px",
                background: WINDOW_BG,
                border: `1px solid ${WINDOW_BORDER}`,
                borderRadius: 8,
                boxShadow: WINDOW_SHADOW,
                fontFamily: FONT_UI,
                fontSize: 13,
                color: INK,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 900,
                  fontSize: 16,
                  marginBottom: 4,
                  color: ACCENT_DEEP(),
                }}
              >
                No windows match
              </div>
              <p style={{ fontSize: 12, color: INK_DIM, margin: 0 }}>
                No windows match &ldquo;{query}&rdquo;. Clear the search box to
                bring them all back.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── STATUS BAR — live last action ──────────────────── */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          height: 22,
          background:
            `linear-gradient(180deg, ${AQUA_DEEP} 0%, #1f4f7a 100%)`,
          borderTop: `1px solid ${AQUA_INK}`,
          color: "#fff",
          fontFamily: FONT_MONO,
          fontSize: 11,
          letterSpacing: 0.5,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 14px",
          textShadow: "0 1px 0 rgba(0,0,0,0.4)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#39ff14" }}>
          ● <span style={{ color: "#fff" }}>56 kbps</span>
        </span>
        <span style={{ color: "#cfe7ff" }}>
          {openCount}/{defs.length} loaded
        </span>
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <span style={{ color: "#fff8a3", marginRight: 6 }}>▸</span>
          {lastAction}
        </span>
        <span style={{ color: "#cfe7ff" }}>HTML 4.01 · 0 errors</span>
      </div>

      {/* ── EDGE-SNAP PREVIEW OVERLAY ─────────────────────── */}
      {snapHint && <SnapHint side={snapHint} />}

      {/* ── CONTEXT MENU ──────────────────────────────────── */}
      {ctx && (
        <ContextMenu
          x={ctx.x}
          y={ctx.y}
          actions={[
            { label: "Bring to Front", onClick: () => focus(ctx.id) },
            { label: "Send to Back", onClick: () => sendToBack(ctx.id) },
            { label: "Maximize / Restore (F)", onClick: () => toggleMaximize(ctx.id) },
            { label: "Minimize to Dock (M)", onClick: () => minimize(ctx.id) },
          ]}
        />
      )}

      {/* ── POP-UP AD ─────────────────────────────────────── */}
      {adOpen && <PopupAd onClose={() => setAdOpen(false)} />}
    </main>
  );
}

// ── Window component ─────────────────────────────────────────────────

function Window({
  def,
  state,
  focused,
  onFocus,
  onDragStart,
  onDblClick,
  onContextMenu,
  onMinimize,
  onMaximize,
  onJump,
  allDefs,
  bookmarksOpen,
  setBookmarksOpen,
  address,
  setAddress,
  submitAddress,
  note,
}: {
  def: WinDef;
  state: WinState;
  focused: boolean;
  isFirstOpen?: boolean;
  onFocus: () => void;
  onDragStart: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDblClick: () => void;
  onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onJump: (id: string) => void;
  allDefs: WinDef[];
  bookmarksOpen: boolean;
  setBookmarksOpen: (b: boolean) => void;
  address: string;
  setAddress: (s: string) => void;
  submitAddress: () => void;
  note: (m: string) => void;
}) {
  // Only the focused window owns the global address bar input value;
  // others show their static URL
  const url = `kiruk.com/${def.id}.html`;
  const isFirstWindow = def.id === allDefs[0].id;
  return (
    <div
      className="kiruk-2000-window"
      onMouseDown={onFocus}
      onContextMenu={onContextMenu}
      style={{
        position: "absolute",
        left: state.x,
        top: state.y,
        width: state.w,
        zIndex: state.z,
        background: WINDOW_BG,
        border: `1px solid ${focused ? AQUA_DEEP : WINDOW_BORDER}`,
        borderRadius: 8,
        boxShadow: focused
          ? `0 18px 36px rgba(20,40,70,0.5), 0 6px 12px rgba(20,40,70,0.32), 0 0 0 2px ${AQUA}55`
          : `0 6px 14px rgba(20,40,70,0.28)`,
        overflow: "hidden",
        opacity: focused ? 1 : 0.96,
        transition: "box-shadow 220ms, border-color 180ms, opacity 180ms",
      }}
    >
      {/* Aqua title bar */}
      <div
        onMouseDown={onDragStart}
        onDoubleClick={onDblClick}
        title="Drag to move · double-click to maximize · right-click for menu"
        style={{
          padding: "5px 10px 5px 8px",
          background: focused
            ? `linear-gradient(180deg, ${AQUA_HI} 0%, #c9e3f2 30%, ${AQUA} 70%, ${AQUA_DEEP} 100%)`
            : `linear-gradient(180deg, #d8dde2 0%, #b6bdc4 50%, #8b939c 100%)`,
          borderBottom: `1px solid ${focused ? AQUA_INK : "#5d6770"}`,
          color: focused ? AQUA_INK : "#37414b",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 8,
          cursor: state.maximized ? "default" : "grab",
          userSelect: "none",
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 5 }}>
          <TrafficLight
            color={TRAFFIC_RED}
            symbol="×"
            title="Send to dock"
            faded={!focused}
            onClick={onMinimize}
          />
          <TrafficLight
            color={TRAFFIC_YELLOW}
            symbol="–"
            title="Minimize (M)"
            faded={!focused}
            onClick={onMinimize}
          />
          <TrafficLight
            color={TRAFFIC_GREEN}
            symbol="+"
            title="Maximize / Restore (F · or double-click title)"
            faded={!focused}
            onClick={onMaximize}
          />
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 0.5,
            textAlign: "center",
            color: focused ? AQUA_INK : "#37414b",
            textShadow: focused ? "0 1px 0 rgba(255,255,255,0.6)" : "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {def.title}
        </div>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {focused && (
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#39ff14",
                boxShadow: "0 0 6px #39ff14",
              }}
              title="Focused window"
            />
          )}
          <span
            style={{
              fontFamily: FONT_UI,
              fontSize: 9,
              letterSpacing: 2,
              color: focused ? AQUA_INK : "#5d6770",
              textTransform: "uppercase",
              fontWeight: 700,
              padding: "1px 6px",
              background: focused ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.4)",
              border: `1px solid ${focused ? AQUA_INK + "66" : "#5d677066"}`,
              borderRadius: 999,
            }}
          >
            {def.num} · {def.album}
          </span>
        </div>
      </div>

      {/* Functional address bar */}
      <div
        style={{
          padding: "3px 8px",
          background: "#eef3f8",
          borderBottom: `1px solid ${WINDOW_BORDER}55`,
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: INK_DIM,
          display: "flex",
          gap: 6,
          alignItems: "center",
          position: "relative",
        }}
      >
        <span style={{ color: ACCENT, fontWeight: 700 }}>http://</span>
        {focused ? (
          <>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitAddress();
              }}
              placeholder="kiruk.com/persona.html"
              style={{
                flex: 1,
                border: `1px solid ${WINDOW_BORDER}88`,
                background: "#fff",
                padding: "1px 6px",
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: INK,
                borderRadius: 3,
                outline: "none",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
              }}
            />
            <button
              type="button"
              onClick={submitAddress}
              style={{
                padding: "1px 8px",
                fontFamily: FONT_DISPLAY,
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: 1,
                color: AQUA_INK,
                background: `linear-gradient(180deg, ${AQUA_HI} 0%, ${AQUA} 100%)`,
                border: `1px solid ${AQUA_INK}`,
                borderRadius: 3,
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              Go
            </button>
          </>
        ) : (
          <span style={{ flex: 1 }}>{url}</span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setBookmarksOpen(!bookmarksOpen);
            onFocus();
          }}
          style={{
            background: bookmarksOpen ? AQUA : "transparent",
            border: bookmarksOpen ? `1px solid ${AQUA_INK}` : "1px solid transparent",
            color: bookmarksOpen ? AQUA_INK : MUTED,
            fontFamily: FONT_MONO,
            fontSize: 10,
            padding: "1px 5px",
            cursor: "pointer",
            borderRadius: 3,
            letterSpacing: 0.5,
          }}
        >
          ★ Bookmarks ▾
        </button>
        {focused && bookmarksOpen && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: "100%",
              right: 6,
              marginTop: 2,
              zIndex: 99,
              minWidth: 220,
              background: WINDOW_BG,
              border: `1px solid ${AQUA_INK}`,
              borderRadius: 6,
              boxShadow: "0 10px 22px rgba(0,40,80,0.4)",
              padding: 4,
              fontFamily: FONT_UI,
              fontSize: 11,
            }}
          >
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 9,
                letterSpacing: 2,
                color: ACCENT_DEEP(),
                textTransform: "uppercase",
                fontWeight: 900,
                padding: "3px 8px",
                borderBottom: `1px solid ${WINDOW_BORDER}55`,
                marginBottom: 2,
              }}
            >
              Bookmarks · all windows
            </div>
            {allDefs.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  onJump(b.id);
                  setBookmarksOpen(false);
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "20px 1fr auto",
                  gap: 6,
                  width: "100%",
                  padding: "3px 8px",
                  border: "none",
                  background: b.id === def.id ? `${b.accent}22` : "transparent",
                  color: INK,
                  cursor: "pointer",
                  textAlign: "left",
                  borderRadius: 3,
                  fontFamily: FONT_UI,
                  fontSize: 11,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    color: b.accent,
                    fontWeight: 700,
                  }}
                >
                  {b.num}
                </span>
                <span>{b.title}</span>
                <span style={{ color: MUTED, fontSize: 9, letterSpacing: 1 }}>
                  {b.album}
                </span>
              </button>
            ))}
            <div
              style={{
                marginTop: 4,
                paddingTop: 4,
                borderTop: `1px dashed ${WINDOW_BORDER}66`,
                fontFamily: FONT_MONO,
                fontSize: 9,
                color: MUTED,
                padding: "4px 8px",
                letterSpacing: 0.5,
              }}
            >
              tip · type slug + enter in URL bar
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          padding: "12px 14px 14px",
          fontFamily: FONT_BODY,
          fontSize: 12.5,
          color: INK,
          lineHeight: 1.55,
          maxHeight: "70vh",
          overflowY: "auto",
          background:
            `linear-gradient(180deg, ${WINDOW_BG} 0%, #f4f7fa 100%)`,
        }}
      >
        {def.body()}
      </div>

      {/* Status foot */}
      <div
        style={{
          padding: "3px 10px",
          background: "#e3eaf1",
          borderTop: `1px solid ${WINDOW_BORDER}55`,
          fontFamily: FONT_MONO,
          fontSize: 9,
          color: MUTED,
          letterSpacing: 1,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>
          <span style={{ color: "#1a8a2a" }}>●</span> Done · loaded {def.id}.html
        </span>
        <span>
          z:{state.z}
          {state.maximized ? " · MAX" : ""}
          {focused ? " · ACTIVE" : ""}
        </span>
      </div>

      {/* First-window tutorial pulse */}
      {isFirstWindow && focused && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 7,
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "none",
            padding: "2px 10px",
            background: "#fff8a3",
            color: "#5a4500",
            fontFamily: FONT_UI,
            fontSize: 10,
            letterSpacing: 1,
            border: "1px solid #cc9900",
            borderRadius: 4,
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            animation: "kiruk-2000-tip-pulse 1.6s ease-in-out 2",
            opacity: 0.95,
          }}
        >
          ↑ drag title · dbl-click to max
        </span>
      )}
    </div>
  );
}

// ── Tiny components ──────────────────────────────────────────────────

// ── Mobile stacked window — static card, no drag ─────────────────────

function StackedWindow({
  def,
  focused,
  onFocus,
}: {
  def: WinDef;
  focused: boolean;
  onFocus: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      onClick={onFocus}
      style={{
        background: WINDOW_BG,
        border: `1px solid ${focused ? AQUA_DEEP : WINDOW_BORDER}`,
        borderRadius: 8,
        boxShadow: focused
          ? `0 10px 22px rgba(20,40,70,0.4), 0 0 0 2px ${AQUA}55`
          : `0 4px 10px rgba(20,40,70,0.25)`,
        overflow: "hidden",
        transition: "box-shadow 220ms, border-color 180ms",
      }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setCollapsed((c) => !c);
          onFocus();
        }}
        style={{
          padding: "6px 10px",
          background:
            `linear-gradient(180deg, ${AQUA_HI} 0%, #c9e3f2 30%, ${AQUA} 70%, ${AQUA_DEEP} 100%)`,
          borderBottom: collapsed ? "none" : `1px solid ${AQUA_INK}`,
          color: AQUA_INK,
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 1,
            padding: "1px 6px",
            background: def.accent,
            color: "#fff",
            borderRadius: 999,
            textShadow: "0 1px 1px rgba(0,0,0,0.4)",
          }}
        >
          {def.num} · {def.album}
        </span>
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 13,
            fontWeight: 700,
            color: AQUA_INK,
            textShadow: "0 1px 0 rgba(255,255,255,0.6)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {def.title}
        </span>
        <span
          aria-hidden
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 12,
            color: AQUA_INK,
            fontWeight: 900,
          }}
        >
          {collapsed ? "▸" : "▾"}
        </span>
      </div>
      {!collapsed && (
        <>
          <div
            style={{
              padding: "3px 10px",
              background: "#eef3f8",
              borderBottom: `1px solid ${WINDOW_BORDER}55`,
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: INK_DIM,
            }}
          >
            <span style={{ color: ACCENT, fontWeight: 700 }}>http://</span>{" "}
            kiruk.com/{def.id}.html
          </div>
          <div
            style={{
              padding: "12px 14px 14px",
              fontFamily: FONT_BODY,
              fontSize: 12.5,
              color: INK,
              lineHeight: 1.55,
              background:
                `linear-gradient(180deg, ${WINDOW_BG} 0%, #f4f7fa 100%)`,
            }}
          >
            {def.body()}
          </div>
          <div
            style={{
              padding: "3px 10px",
              background: "#e3eaf1",
              borderTop: `1px solid ${WINDOW_BORDER}55`,
              fontFamily: FONT_MONO,
              fontSize: 9,
              color: MUTED,
              letterSpacing: 1,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              <span style={{ color: "#1a8a2a" }}>●</span> Done · {def.id}.html
            </span>
            <span>tap title to collapse</span>
          </div>
        </>
      )}
    </div>
  );
}

function TrafficLight({
  color,
  symbol,
  title,
  onClick,
  faded,
}: {
  color: string;
  symbol: string;
  title: string;
  onClick?: () => void;
  faded?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      title={title}
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: faded
          ? `radial-gradient(circle at 30% 30%, #c8cdd3 0%, #9aa1a8 60%, #6b727a 100%)`
          : `radial-gradient(circle at 30% 30%, #fff 0%, ${color} 45%, ${darken(color)} 100%)`,
        border: `1px solid ${faded ? "#6b727a" : darken(color)}`,
        boxShadow:
          "inset 0 2px 2px rgba(255,255,255,0.7), inset 0 -1px 2px rgba(0,0,0,0.35)",
        cursor: "pointer",
        padding: 0,
        fontSize: 10,
        lineHeight: 1,
        color: "rgba(0,0,0,0.55)",
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
      }}
    >
      {symbol}
    </button>
  );
}

function SnapHint({ side }: { side: "left" | "right" | "full" }) {
  let style: React.CSSProperties = {};
  if (side === "left") {
    style = { left: 16, top: 80, right: "50%", bottom: 80, marginRight: 8 };
  } else if (side === "right") {
    style = { left: "50%", top: 80, right: 16, bottom: 80, marginLeft: 8 };
  } else {
    style = { left: 16, right: 16, top: 80, bottom: 80 };
  }
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        zIndex: 95,
        pointerEvents: "none",
        background: `linear-gradient(135deg, ${AQUA}55 0%, ${AQUA_DEEP}33 100%)`,
        border: `2px dashed ${AQUA_DEEP}`,
        borderRadius: 12,
        boxShadow: `inset 0 0 40px ${AQUA}55, 0 0 24px ${AQUA}66`,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: FONT_DISPLAY,
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: 3,
          color: AQUA_INK,
          textShadow: "0 1px 0 rgba(255,255,255,0.6)",
          background: "rgba(255,255,255,0.7)",
          padding: "6px 14px",
          borderRadius: 999,
          border: `1px solid ${AQUA_INK}`,
          textTransform: "uppercase",
        }}
      >
        Snap {side === "full" ? "Fullscreen" : side === "left" ? "← Left Half" : "Right Half →"}
      </div>
    </div>
  );
}

function ContextMenu({
  x,
  y,
  actions,
}: {
  x: number;
  y: number;
  actions: Array<{ label: string; onClick: () => void }>;
}) {
  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        left: x,
        top: y,
        zIndex: 100,
        minWidth: 200,
        background: WINDOW_BG,
        border: `1px solid ${AQUA_INK}`,
        borderRadius: 6,
        boxShadow: "0 14px 30px rgba(0,40,80,0.45)",
        padding: 4,
        fontFamily: FONT_UI,
        fontSize: 12,
      }}
    >
      {actions.map((a) => (
        <button
          key={a.label}
          type="button"
          onClick={a.onClick}
          style={{
            display: "block",
            width: "100%",
            padding: "5px 10px",
            border: "none",
            background: "transparent",
            color: INK,
            textAlign: "left",
            cursor: "pointer",
            borderRadius: 3,
            fontFamily: FONT_UI,
            fontSize: 12,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${AQUA}55`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}

function AquaBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "3px 12px",
        background:
          `linear-gradient(180deg, ${AQUA_HI} 0%, ${AQUA} 60%, ${AQUA_DEEP} 100%)`,
        color: AQUA_INK,
        border: `1px solid ${AQUA_INK}`,
        borderRadius: 999,
        fontFamily: FONT_DISPLAY,
        fontSize: 10,
        fontWeight: 900,
        letterSpacing: 1,
        cursor: "pointer",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.2)",
        textTransform: "uppercase",
      }}
    >
      {children}
    </button>
  );
}

function AquaTab({
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
        padding: "4px 10px",
        background:
          `linear-gradient(180deg, ${AQUA_HI} 0%, ${AQUA} 60%, ${AQUA_DEEP} 100%)`,
        color: AQUA_INK,
        border: `1px solid ${AQUA_INK}`,
        borderRadius: 6,
        fontFamily: FONT_DISPLAY,
        fontSize: 10,
        fontWeight: 900,
        letterSpacing: 1,
        cursor: "pointer",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.2)",
        textTransform: "uppercase",
      }}
    >
      {children}
    </button>
  );
}

function PopupAd({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      onClick={onClose}
      style={{
        position: "fixed",
        right: 30,
        top: 120,
        zIndex: 90,
        width: 260,
        cursor: "pointer",
        animation: "kiruk-2000-ad-fly 600ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div
        style={{
          padding: "14px 14px 12px",
          background:
            `linear-gradient(135deg, ${ACCENT_HOT} 0%, ${ORANGE} 100%)`,
          color: "#fff",
          border: `2px solid #fff`,
          borderRadius: 10,
          boxShadow:
            "0 14px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.6)",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 11, letterSpacing: 3, fontWeight: 900, opacity: 0.9 }}>
          ★ SPECIAL OFFER ★
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 18,
            fontWeight: 900,
            lineHeight: 1.1,
            margin: "4px 0 4px",
            letterSpacing: -0.3,
          }}
        >
          You have been selected to hire one design engineer.
        </div>
        <div
          style={{
            fontFamily: FONT_UI,
            fontSize: 11,
            opacity: 0.95,
            fontStyle: "italic",
          }}
        >
          Click anywhere to claim this prize.
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 18,
            height: 18,
            background: "#fff",
            color: ACCENT_HOT,
            border: "none",
            borderRadius: 4,
            fontFamily: FONT_DISPLAY,
            fontSize: 11,
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

function BlockQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote
      style={{
        margin: "10px 0",
        padding: "10px 12px",
        background:
          `linear-gradient(135deg, #eef6ff 0%, #d6ebfc 100%)`,
        border: `1px solid ${ACCENT}55`,
        borderLeft: `3px solid ${ACCENT}`,
        borderRadius: 6,
        fontFamily: FONT_DISPLAY,
        fontSize: 15,
        fontStyle: "italic",
        color: ACCENT_DEEP(),
        lineHeight: 1.4,
      }}
    >
      &ldquo;{children}&rdquo;
    </blockquote>
  );
}

function Helper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 10,
        padding: "6px 10px",
        background:
          `linear-gradient(180deg, #fff8d6 0%, #ffeb9c 100%)`,
        border: `1px solid #cc9900`,
        borderRadius: 6,
        fontSize: 11,
        color: "#5a4500",
        lineHeight: 1.45,
      }}
    >
      <strong style={{ color: "#000" }}>📌 Tip:</strong> {children}
    </div>
  );
}

function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: 8,
        fontFamily: FONT_BODY,
        fontSize: 12,
      }}
    >
      <tbody>{children}</tbody>
    </table>
  );
}

function DataRow({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <tr>
      <td
        style={{
          padding: "3px 8px",
          width: 90,
          background: "#eef3f8",
          color: ACCENT_DEEP(),
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: 1,
          textTransform: "uppercase",
          borderBottom: `1px solid ${WINDOW_BORDER}33`,
        }}
      >
        {k}
      </td>
      <td
        style={{
          padding: "3px 8px",
          color: INK,
          borderBottom: `1px solid ${WINDOW_BORDER}33`,
        }}
      >
        {children}
      </td>
    </tr>
  );
}

function Bullets({
  head,
  items,
  marker,
  tint,
}: {
  head: string;
  items: string[];
  marker: string;
  tint: string;
}) {
  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 10,
          letterSpacing: 2,
          color: tint,
          textTransform: "uppercase",
          fontWeight: 900,
          marginBottom: 3,
        }}
      >
        {head}
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((it) => (
          <li
            key={it}
            style={{
              display: "flex",
              gap: 6,
              fontSize: 12,
              color: INK,
              marginBottom: 3,
            }}
          >
            <span style={{ color: tint }}>{marker}</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Quad({
  head,
  sub,
  accent,
  children,
}: {
  head: string;
  sub: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: `linear-gradient(180deg, #fff 0%, #f4f7fa 100%)`,
        border: `1px solid ${accent}55`,
        borderTop: `3px solid ${accent}`,
        borderRadius: 6,
        padding: "8px 10px",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 14,
          fontWeight: 900,
          color: accent,
        }}
      >
        {head}
      </div>
      <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 9,
          letterSpacing: 2,
          color: INK_DIM,
          textTransform: "uppercase",
          marginBottom: 5,
        }}
      >
        {sub}
      </div>
      <div style={{ fontSize: 12, color: INK, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function StatTile({
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
        position: "relative",
        padding: "10px 12px 8px",
        background: `linear-gradient(180deg, #fff 0%, #eef6ff 100%)`,
        border: `1px solid ${ACCENT}44`,
        borderRadius: 6,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 2px rgba(0,40,80,0.15)`,
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -10,
          right: -10,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT}22 0%, transparent 70%)`,
        }}
      />
      <div style={{ fontSize: 14, color: ACCENT_HOT }}>{icon}</div>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 22,
          color: ACCENT_DEEP(),
          fontWeight: 900,
          letterSpacing: -0.5,
          lineHeight: 1,
          margin: "2px 0",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 10,
          letterSpacing: 1,
          color: INK,
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      {context && (
        <div
          style={{
            fontSize: 10,
            color: INK_DIM,
            fontStyle: "italic",
            marginTop: 2,
          }}
        >
          {context}
        </div>
      )}
    </div>
  );
}

function WorkCard({
  project,
  index,
}: {
  project: {
    id: string;
    title: string;
    category: string;
    description: string;
    technologies: string[];
    duration: string;
  };
  index: number;
}) {
  const accent = ["#0066cc", "#cc0099", "#cc6600", "#009966"][index % 4];
  return (
    <a
      href={`/case-studies#${project.id}`}
      style={{
        display: "block",
        padding: "8px 10px",
        background: `linear-gradient(180deg, #fff 0%, #f4f7fa 100%)`,
        border: `1px solid ${accent}55`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: 6,
        color: INK,
        textDecoration: "none",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 9,
          letterSpacing: 2,
          color: accent,
          textTransform: "uppercase",
          fontWeight: 900,
        }}
      >
        Plate {["I", "II", "III", "IV"][index]} · {project.category} · {project.duration}
      </div>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 14,
          fontWeight: 700,
          margin: "1px 0 2px",
          color: ACCENT_DEEP(),
        }}
      >
        {project.title}
      </div>
      <p style={{ margin: 0, fontSize: 11, color: INK_DIM, lineHeight: 1.4 }}>
        {project.description}
      </p>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 9,
          color: accent,
          marginTop: 4,
        }}
      >
        ▸ {project.technologies.join(" · ")}
      </div>
    </a>
  );
}

function ContactChip({
  channel,
}: {
  channel: { label: string; role: string; value: string; href: string };
}) {
  return (
    <a
      href={channel.href}
      target={channel.href.startsWith("http") ? "_blank" : undefined}
      rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
      style={{
        display: "block",
        padding: "8px 12px",
        background: `linear-gradient(180deg, #fff 0%, #eef6ff 100%)`,
        border: `1px solid ${ACCENT}55`,
        borderRadius: 8,
        color: INK,
        textDecoration: "none",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 10,
          letterSpacing: 2,
          color: ACCENT,
          textTransform: "uppercase",
          fontWeight: 900,
        }}
      >
        {channel.label}
      </div>
      <div style={{ fontSize: 12, color: INK, wordBreak: "break-all" }}>
        {channel.value}
      </div>
      <div style={{ fontSize: 10, color: INK_DIM, fontStyle: "italic", marginTop: 2 }}>
        {channel.role}
      </div>
    </a>
  );
}

function darken(hex: string): string {
  // Very rough darken — not perfect but fine for shadow gradients
  if (!hex.startsWith("#") || hex.length !== 7) return hex;
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 60);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 60);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 60);
  return `rgb(${r}, ${g}, ${b})`;
}

// ── Style maps ───────────────────────────────────────────────────────

const ps = {
  lede: {
    margin: "0 0 10px",
    fontSize: 13,
    color: INK,
    lineHeight: 1.6,
  } as React.CSSProperties,
  body: {
    margin: "0 0 10px",
    fontSize: 12.5,
    color: INK,
    lineHeight: 1.55,
  } as React.CSSProperties,
  dropCap: {
    fontFamily: FONT_DISPLAY,
    float: "left",
    fontSize: 38,
    lineHeight: 0.9,
    margin: "2px 8px 0 0",
    color: ACCENT,
    fontWeight: 900,
  } as React.CSSProperties,
};

export default FlashSplashHomePage;
