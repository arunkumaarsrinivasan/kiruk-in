"use client";

/**
 * XeroxBitmapHomePage — 1981 archetype home, a gray bevel desktop.
 *
 *   - boot trace on mount (instant under reduced motion)
 *   - desktop icons, one per window: select an icon, then press a function
 *     key — OPEN, PROPS, COPY, HELP. Noun first, verb second, as on the Star.
 *     Pressing a selected icon again (double-click, Enter) also opens it.
 *   - windows collapse (`_`) and close (`✕`); a closed window's icon is
 *     available, an open one is drawn "in use"
 *   - the function keys and status line live in one bar at the foot of the
 *     screen, never under the navbar
 *
 * One bevel recipe (BEVEL / bevel() from ./star): 1px hilite top-left, 1px
 * shadow bottom-right, 1px black edge; pressed is the same bevel inverted.
 */

import React, { Fragment, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { Pixelify_Sans } from "next/font/google";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { EraStoryBox } from "@/components/about-story/EraStoryBox";
import {
  HERO,
  WHY_KIRUK,
  PERSONA,
  EMPATHY_MAP,
  buildTimeline,
  IMPACT_METRICS,
  CARD_SORTING,
  USABILITY_TEST,
  type EraProjectCard,
  type EraTimelineNode,
} from "@/data/era-page-content";
import { BEVEL, bevel } from "./star";
import { StarGlyph, type GlyphName } from "./glyphs";
import { eyeClear } from "@/components/layout/eye-clear";

const pixelify = Pixelify_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pixelify",
});

const { gray: GRAY, grayLight: GRAY_LIGHT, hilite: HILITE, shadow: SHADOW, black: BLACK, titleBg: TITLE_BG, titleText: TITLE_TEXT, selected: SELECTED, alert: ALERT } = BEVEL;

/** Pixel face for chrome, labels and headings; a plain sans for reading. No mono. */
const CHROME = "var(--font-pixelify), 'Helvetica', sans-serif";
const BODY = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const RAISED = bevel("raised");
const SUNKEN = bevel("sunken");

// ── Content, lightly parsed ─────────────────────────────────────────────

const PLACE = HERO.location.split(" - ")[0];
const EMAIL = USABILITY_TEST.channels.find((c) => c.label === "Email")?.value ?? "";
const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Status: AVAILABLE" → ["Status", "AVAILABLE"]; "Response time < 24 hours" → ["Response time", "< 24 hours"]. */
function splitFact(s: string): [string, string] {
  const colon = s.indexOf(":");
  if (colon > 0) return [s.slice(0, colon).trim(), s.slice(colon + 1).trim()];
  const lt = s.indexOf(" < ");
  if (lt > 0) return [s.slice(0, lt).trim(), s.slice(lt + 1).trim()];
  return ["", s];
}
const FACTS = USABILITY_TEST.successMetrics.map(splitFact);
const fact = (name: string) => FACTS.find(([k]) => k.toLowerCase() === name)?.[1];
const STATUS = (fact("status") ?? "").toLowerCase().replace(/-/g, " ");

const CATEGORIES = CARD_SORTING.taxonomy.filter((t) => t !== "All");
const inCategory = (p: EraProjectCard, t: string) => t === "All" || p.category.toLowerCase() === t.toLowerCase();
const projectCount = (t: string) => CARD_SORTING.projects.filter((p) => inCategory(p, t)).length;

// ── Objects on the desktop ──────────────────────────────────────────────

type WindowKey = "hero" | "why" | "persona" | "empathy" | "journey" | "impact" | "cards" | "usability";
type ProjectSel = `project:${string}`;
type Sel = WindowKey | ProjectSel;
type Verb = "open" | "props" | "copy" | "help";
type Kind = "Document" | "Folder" | "Drawer" | "Basket";

const WINDOWS: { k: WindowKey; title: string; subtitle: string; icon: string; glyph: GlyphName; kind: Kind }[] = [
  { k: "hero", title: "KIRUK-DE.DOC", subtitle: "design engineer · file index", icon: "Kiruk", glyph: "cover", kind: "Document" },
  { k: "why", title: "WHY-KIRUK.TXT", subtitle: "hook · pain · bridge", icon: "Why", glyph: "doc", kind: "Document" },
  { k: "persona", title: "ABOUT.DOC", subtitle: "the subject, in his own words", icon: "About", glyph: "about", kind: "Document" },
  { k: "empathy", title: "EMPATHY-MAP.DAT", subtitle: "says · thinks · does · feels", icon: "Empathy", glyph: "empathy", kind: "Document" },
  { k: "journey", title: "JOURNEY-MAP.TSV", subtitle: "career · 2018 → now", icon: "Journey", glyph: "folder", kind: "Folder" },
  { k: "impact", title: "IMPACT.METRICS", subtitle: "quantified outcomes", icon: "Impact", glyph: "impact", kind: "Document" },
  { k: "cards", title: "CARD-SORT.IA", subtitle: "projects by taxonomy", icon: "Projects", glyph: "drawer", kind: "Drawer" },
  { k: "usability", title: "USABILITY-TEST.SH", subtitle: "test the connection", icon: "Contact", glyph: "basket", kind: "Basket" },
];
const winOf = (k: WindowKey) => WINDOWS.find((w) => w.k === k)!;

const KEYS: { verb: Verb; label: string; key: string }[] = [
  { verb: "open", label: "Open", key: "O" },
  { verb: "props", label: "Props", key: "P" },
  { verb: "copy", label: "Copy", key: "C" },
  { verb: "help", label: "Help", key: "H" },
];

const isProject = (s: Sel): s is ProjectSel => s.startsWith("project:");
const projectOf = (s: ProjectSel) => CARD_SORTING.projects.find((p) => `project:${p.id}` === s);
const labelOf = (s: Sel) => (isProject(s) ? (projectOf(s)?.title ?? "Project") : winOf(s).icon);

const BOOT_LINES = [
  "BOOTING XEROX STAR / KIRUK.IN",
  "MOUNTING /DEV/HD0 ............... OK",
  "LOADING FONT  : PIXELIFY-SANS .... OK",
  `ATTACHING WINDOWS ............... ${WINDOWS.length} FILES`,
  "READY",
];

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** States inline styles can't express: pressed, focus, hover-free touch, the foot bar's layout. */
const CSS = `
.xb button, .xb a { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.xb :focus-visible { outline: 2px solid ${TITLE_BG}; outline-offset: 2px; }
.xb-btn { position: relative; background: ${GRAY}; color: ${BLACK}; border: 1px solid ${BLACK}; box-shadow: ${RAISED}; cursor: pointer; }
.xb-btn:not([aria-disabled="true"]):active, .xb-btn[aria-pressed="true"], .xb-btn[data-flash] { box-shadow: ${SUNKEN}; background: ${GRAY_LIGHT}; }
.xb-btn:not([aria-disabled="true"]):active > *, .xb-btn[data-flash] > * { transform: translate(1px, 1px); }
.xb-btn[aria-disabled="true"] { cursor: default; color: ${SHADOW}; text-shadow: 1px 1px 0 ${HILITE}; }
.xb-btn.xb-primary { background: ${TITLE_BG}; color: ${TITLE_TEXT}; box-shadow: inset 1px 1px 0 #3333aa, inset -1px -1px 0 #000044; }
.xb-btn.xb-primary:active { box-shadow: inset 1px 1px 0 #000044, inset -1px -1px 0 #3333aa; }
.xb-ctl::before { content: ""; position: absolute; inset: -13px -2px; }
@media (pointer: coarse) { .xb-ctl { width: 40px; height: 30px; font-size: 13px; } .xb-ctl::before { inset: -7px -2px; } }
.xb-icon { user-select: none; -webkit-touch-callout: none; cursor: pointer; }
.xb-root { padding-bottom: calc(112px + var(--eye-lid-bottom, 0px) + env(safe-area-inset-bottom)); }
.xb-foot { position: fixed; left: 0; right: 0; bottom: var(--eye-lid-bottom, 0px); z-index: 60; background: ${GRAY}; border-top: 1px solid ${BLACK};
  box-shadow: inset 0 1px 0 ${HILITE}; padding: 6px 12px calc(6px + env(safe-area-inset-bottom));
  display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; }
.xb-keys { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.xb-msg { order: -1; }
.xb-wide { display: none; }
@media (min-width: 768px) {
  .xb-root { padding-bottom: calc(88px + var(--eye-lid-bottom, 0px)); }
  .xb-foot { grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; }
  .xb-keys { grid-template-columns: repeat(4, 96px); }
  .xb-msg { order: 0; }
  .xb-wide { display: flex; }
}
`;

export function XeroxBitmapHomePage() {
  const { setLayoutMode } = useLayoutMode();
  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);

  const router = useRouter();
  const reduce = useReducedMotion() ?? false;
  const nodes = useMemo(buildTimeline, []);

  // ── Boot sequence ─────────────────────────────────────────────────────
  const [bootIdx, setBootIdx] = useState(0);
  useEffect(() => {
    if (reduce) {
      setBootIdx(BOOT_LINES.length);
      return;
    }
    let i = 0;
    let timer = 0;
    const tick = () => {
      i += 1;
      setBootIdx(i);
      if (i < BOOT_LINES.length) timer = window.setTimeout(tick, 110 + Math.random() * 60);
    };
    timer = window.setTimeout(tick, 80);
    return () => clearTimeout(timer);
  }, [reduce]);
  const bootDone = bootIdx >= BOOT_LINES.length;

  // ── Clock (client only, so server and client markup agree) ────────────
  const [clock, setClock] = useState("");
  useEffect(() => {
    const fmt = () =>
      setClock(
        new Date().toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }),
      );
    fmt();
    const t = window.setInterval(fmt, 30_000);
    return () => clearInterval(t);
  }, []);

  // ── Desktop state ─────────────────────────────────────────────────────
  const [collapsed, setCollapsed] = useState<Partial<Record<WindowKey, boolean>>>({});
  const [closed, setClosed] = useState<Partial<Record<WindowKey, boolean>>>({});
  const [selected, setSelected] = useState<Sel | null>(null);
  const [sheet, setSheet] = useState<Sel | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("Select an icon, then press a key.");
  const [flash, setFlash] = useState<Verb | null>(null);

  const iconRefs = useRef<Partial<Record<WindowKey, HTMLButtonElement | null>>>({});
  const winRefs = useRef<Record<string, HTMLElement | null>>({});
  const keyRefs = useRef<Partial<Record<Verb, HTMLButtonElement | null>>>({});
  const flashTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(flashTimer.current), []);

  // The navbar's About link lands on #about; if ABOUT.DOC was put away, bring it back.
  useEffect(() => {
    const ensureAbout = () => {
      setClosed((s) => ({ ...s, persona: false }));
      setCollapsed((s) => ({ ...s, persona: false }));
    };
    const onHash = () => {
      if (window.location.hash === "#about") ensureAbout();
    };
    const onClick = (e: globalThis.MouseEvent) => {
      const href = (e.target as Element | null)?.closest?.("a[href]")?.getAttribute("href");
      if (href === "/#about" || href === "#about") ensureAbout();
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  const openCount = WINDOWS.filter((w) => !closed[w.k]).length;

  /** After a window renders: focus its title and bring it into view if its top is off screen. */
  const reveal = (id: string) => {
    requestAnimationFrame(() => {
      const el = winRefs.current[id];
      if (!el) return;
      el.querySelector<HTMLElement>("[data-win-title]")?.focus({ preventScroll: true });
      const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--simple-game-nav-bottom")) || 56;
      const top = el.getBoundingClientRect().top;
      if (top < nav || top > window.innerHeight * 0.55) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  };

  const openWindow = (k: WindowKey) => {
    setClosed((s) => ({ ...s, [k]: false }));
    setCollapsed((s) => ({ ...s, [k]: false }));
    reveal(k);
  };

  const select = (s: Sel) => {
    setSelected(s);
    setMessage(`${labelOf(s)} selected. Press Open, Props or Copy.`);
  };

  const pressKey = (verb: Verb) => {
    window.clearTimeout(flashTimer.current);
    setFlash(verb);
    flashTimer.current = window.setTimeout(() => setFlash(null), 100);
  };

  const copyPayload = (s: Sel): [text: string, done: string] => {
    const origin = window.location.origin;
    if (isProject(s)) {
      const p = projectOf(s);
      const line = p ? `${p.title} — ${p.role}` : labelOf(s);
      return [line, `Copied: ${line}`];
    }
    switch (s) {
      case "hero":
        return [`${origin}/`, "Copied the address of this desktop."];
      case "why":
        return [[WHY_KIRUK.hook, WHY_KIRUK.pain, WHY_KIRUK.bridge, WHY_KIRUK.tagline].join("\n"), "Copied WHY-KIRUK.TXT as text."];
      case "persona":
        return [`${origin}/#about`, "Copied the address of ABOUT.DOC."];
      case "empathy":
        return [
          [
            `Says: “${EMPATHY_MAP.says.quote}”`,
            `Thinks: ${EMPATHY_MAP.thinks.join("; ")}`,
            `Does: ${EMPATHY_MAP.does.join(", ")}`,
            `Feels: ${EMPATHY_MAP.feels.join("; ")}`,
          ].join("\n"),
          "Copied the empathy map as text.",
        ];
      case "journey":
        return [nodes.map((n) => `${n.year} · ${n.position}, ${n.org}. ${n.detail}`).join("\n"), "Copied the journey as text."];
      case "impact":
        return [IMPACT_METRICS.map((m) => `${m.value} ${m.label}${m.context ? ` (${m.context})` : ""}`).join("\n"), "Copied the impact figures."];
      case "cards":
        return [`${origin}/work`, "Copied the address of the work page."];
      case "usability":
        return [EMAIL, `Copied ${EMAIL}`];
    }
  };

  /** Noun first, verb second. `target` defaults to the selection. */
  const act = (verb: Verb, target: Sel | null = selected) => {
    if (verb === "help") {
      pressKey(verb);
      setHelpOpen(true);
      setMessage("Help is open at the top of the desktop.");
      reveal("help");
      return;
    }
    if (!target) {
      setMessage(`Select an icon first, then press ${verb === "props" ? "Props" : sentence(verb)}.`);
      return;
    }
    pressKey(verb);
    const name = labelOf(target);
    if (verb === "open") {
      if (isProject(target)) {
        setMessage(`Opening ${name}…`);
        router.push(`/work/${target.slice(8)}`);
        return;
      }
      setMessage(closed[target] || collapsed[target] ? `${winOf(target).title} opened.` : `${winOf(target).title} is already open.`);
      openWindow(target);
      return;
    }
    if (verb === "props") {
      setSheet(target);
      setMessage(`Property sheet for ${name}.`);
      reveal("props");
      return;
    }
    const [text, done] = copyPayload(target);
    void writeClipboard(text).then((ok) => setMessage(ok ? done : "Copy failed. Select the text by hand."));
  };

  /** Closing returns focus to the icon. Pointer users keep their scroll; keyboard users follow focus. */
  const focusBack = (el: HTMLElement | null | undefined, e: MouseEvent) => {
    const byKeyboard = e.detail === 0;
    requestAnimationFrame(() => el?.focus({ preventScroll: !byKeyboard }));
  };

  const closeWindow = (k: WindowKey, e: MouseEvent) => {
    setClosed((s) => ({ ...s, [k]: true }));
    setMessage(`${winOf(k).title} closed. Its icon is free on the desktop.`);
    focusBack(iconRefs.current[k], e);
  };
  const toggleCollapse = (k: WindowKey) => setCollapsed((s) => ({ ...s, [k]: !s[k] }));

  const onIcon = (k: WindowKey) => (selected === k ? act("open", k) : select(k));
  const onCard = (id: string) => {
    const s: Sel = `project:${id}`;
    if (selected === s) act("open", s);
    else select(s);
  };

  /** Arrow keys walk the icons by where they sit on screen, so rows can wrap freely. */
  const step = (from: WindowKey, key: string) => {
    const i = WINDOWS.findIndex((w) => w.k === from);
    let j = i;
    if (key === "ArrowLeft") j = Math.max(0, i - 1);
    else if (key === "ArrowRight") j = Math.min(WINDOWS.length - 1, i + 1);
    else if (key === "Home") j = 0;
    else if (key === "End") j = WINDOWS.length - 1;
    else {
      const cur = iconRefs.current[from]?.getBoundingClientRect();
      if (!cur) return;
      let best = Infinity;
      WINDOWS.forEach((w, n) => {
        const r = iconRefs.current[w.k]?.getBoundingClientRect();
        if (!r || n === i) return;
        const dy = r.top - cur.top;
        if (key === "ArrowDown" ? dy <= 4 : dy >= -4) return;
        const score = Math.abs(dy) * 1000 + Math.abs(r.left - cur.left);
        if (score < best) {
          best = score;
          j = n;
        }
      });
    }
    const next = WINDOWS[j].k;
    select(next);
    iconRefs.current[next]?.focus();
  };

  /** Keyboard grammar, only where nouns and verbs live (icons, project cards, function keys). */
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target as HTMLElement;
    if (!t.closest("[data-shortcuts]")) return;
    const icon = t.closest<HTMLElement>("[data-icon]")?.dataset.icon as WindowKey | undefined;
    const project = t.closest<HTMLElement>("[data-project]")?.dataset.project;
    const focused: Sel | null = icon ?? (project ? `project:${project}` : null);

    if (icon && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      step(icon, e.key);
      return;
    }
    if (e.key === "Escape" && selected) {
      setSelected(null);
      setMessage("Nothing selected.");
      return;
    }
    const k = e.key.toLowerCase();
    const verb: Verb | null =
      e.key === "Enter" && focused ? "open" : k === "o" ? "open" : k === "p" ? "props" : k === "c" ? "copy" : k === "h" || k === "?" ? "help" : null;
    if (!verb) return;
    e.preventDefault();
    const target = focused ?? selected;
    if (target && target !== selected && verb !== "help") setSelected(target);
    act(verb, target);
  };

  const rovingIcon: WindowKey = selected && !isProject(selected) ? selected : "hero";
  const sheetAnchor: WindowKey | null = sheet ? (isProject(sheet) ? "cards" : sheet) : null;

  const frame = (k: WindowKey) => ({
    k,
    title: winOf(k).title,
    subtitle: winOf(k).subtitle,
    collapsed: !!collapsed[k],
    onCollapse: () => toggleCollapse(k),
    onClose: (e: MouseEvent) => closeWindow(k, e),
    windowRef: (el: HTMLElement | null) => {
      winRefs.current[k] = el;
    },
  });

  const windowBody = (k: WindowKey): ReactNode => {
    switch (k) {
      case "hero":
        return <HeroDoc bootDone={bootDone} clock={clock} />;
      case "why":
        return <WhyDoc />;
      case "persona":
        return <EraStoryBox />;
      case "empathy":
        return <EmpathyDoc />;
      case "journey":
        return <JourneyDoc nodes={nodes} />;
      case "impact":
        return <ImpactDoc />;
      case "cards":
        return <CardsDoc filter={filter} onFilter={setFilter} selected={selected} onCard={onCard} />;
      case "usability":
        return <ContactDoc />;
    }
  };

  const propsWindow = sheet && (
    <WindowFrame
      k="props"
      title="PROPERTIES"
      subtitle={labelOf(sheet)}
      windowRef={(el) => {
        winRefs.current.props = el;
      }}
      onClose={(e) => {
        const back = isProject(sheet) ? null : iconRefs.current[sheet];
        setSheet(null);
        setMessage("Property sheet closed.");
        focusBack(back ?? iconRefs.current.cards, e);
      }}
    >
      <PropertySheet target={sheet} nodes={nodes} />
    </WindowFrame>
  );

  return (
    <div
      id="xerox-home"
      onKeyDown={onKeyDown}
      className={`${pixelify.variable} xb xb-root`}
      style={{
        backgroundColor: GRAY,
        color: BLACK,
        fontFamily: CHROME,
        minHeight: "100vh",
        paddingTop: eyeClear(896),
        backgroundImage: BEVEL.desktop,
        backgroundSize: BEVEL.desktopSize,
      }}
    >
      <style>{CSS}</style>
      <div className="relative mx-auto flex max-w-4xl flex-col gap-4 px-3 sm:gap-5 sm:px-6">
        {/* ── BOOT TRACE (dims once ready) ── */}
        <BootTraceWindow lines={BOOT_LINES.slice(0, bootIdx)} done={bootDone} />

        {/* ── DESKTOP ICONS: the nouns ── */}
        <div
          role="group"
          aria-label="Desktop icons. Select one, then press a function key."
          data-shortcuts
          data-blueprint="desktop-icons"
          className="grid gap-x-1 gap-y-2"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))" }}
        >
          {WINDOWS.map((w) => {
            const on = selected === w.k;
            const inUse = !closed[w.k];
            return (
              <button
                key={w.k}
                ref={(el) => {
                  iconRefs.current[w.k] = el;
                }}
                type="button"
                data-icon={w.k}
                aria-pressed={on}
                tabIndex={rovingIcon === w.k ? 0 : -1}
                onClick={() => onIcon(w.k)}
                className="xb-icon flex min-h-11 flex-col items-center gap-1 px-1 py-1.5"
              >
                <span aria-hidden style={{ lineHeight: 0, outline: on ? `1px dotted ${BLACK}` : undefined, outlineOffset: 1 }}>
                  <StarGlyph name={w.glyph} ghost={inUse} size={40} />
                </span>
                <span
                  className="px-1 text-center text-[12px] uppercase"
                  style={{ letterSpacing: "0.06em", lineHeight: 1.3, background: on ? TITLE_BG : "transparent", color: on ? TITLE_TEXT : BLACK }}
                >
                  {w.icon}
                  <span className="sr-only">{inUse ? ", window open" : ", window closed"}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* ── WINDOWS, in desktop order ── */}
        {helpOpen && (
          <WindowFrame
            k="help"
            title="HELP.TXT"
            subtitle="how this desktop works"
            windowRef={(el) => {
              winRefs.current.help = el;
            }}
            onClose={(e) => {
              setHelpOpen(false);
              setMessage("Help closed.");
              focusBack(keyRefs.current.help, e);
            }}
          >
            <HelpDoc />
          </WindowFrame>
        )}
        {WINDOWS.map((w) => (
          <Fragment key={w.k}>
            {!closed[w.k] && (
              <WindowFrame {...frame(w.k)} blueprint={w.k === "hero" ? "hero-window" : undefined}>
                {windowBody(w.k)}
              </WindowFrame>
            )}
            {sheetAnchor === w.k && propsWindow}
          </Fragment>
        ))}
        {openCount === 0 && !sheet && !helpOpen && (
          <p className="self-start px-3 py-2 text-[13px]" style={{ background: GRAY, border: `1px solid ${BLACK}`, boxShadow: RAISED }}>
            All windows are closed. Select an icon, then press Open.
          </p>
        )}
      </div>

      {/* ── FOOT BAR: the verbs, and the status line ── */}
      <div className="xb-foot" data-blueprint="function-keys">
        <div role="group" aria-label="Function keys" data-shortcuts className="xb-keys">
          {KEYS.map(({ verb, label, key }) => {
            const off = verb !== "help" && !selected;
            return (
              <button
                key={verb}
                ref={(el) => {
                  keyRefs.current[verb] = el;
                }}
                type="button"
                className="xb-btn flex min-h-11 items-center justify-center gap-2 px-2 text-[13px] uppercase"
                style={{ letterSpacing: "0.08em" }}
                aria-disabled={off || undefined}
                aria-keyshortcuts={key}
                data-flash={flash === verb ? "" : undefined}
                onClick={() => act(verb)}
              >
                <span>{label}</span>
                <span aria-hidden className="hidden text-[10px] md:inline" style={{ color: off ? undefined : SHADOW }}>
                  {key}
                </span>
              </button>
            );
          })}
        </div>
        <p
          role="status"
          aria-live="polite"
          className="xb-msg min-w-0 truncate px-2 py-1 text-[13px]"
          style={{ background: SELECTED, border: `1px solid ${BLACK}`, boxShadow: SUNKEN }}
        >
          {message}
        </p>
        <div className="xb-wide items-center gap-3 text-[12px] uppercase" style={{ letterSpacing: "0.06em" }}>
          <span>
            Files {openCount}/{WINDOWS.length}
          </span>
          {clock && <span aria-label="Clock">{clock}</span>}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
// Window frame: navy title bar, collapse + close
// ───────────────────────────────────────────────────────────────────────

function WindowFrame({
  k,
  title,
  subtitle,
  collapsed,
  onCollapse,
  onClose,
  windowRef,
  blueprint,
  children,
}: {
  k: string;
  title: string;
  subtitle?: string;
  collapsed?: boolean;
  onCollapse?: () => void;
  onClose: (e: MouseEvent) => void;
  windowRef?: (el: HTMLElement | null) => void;
  blueprint?: string;
  children: ReactNode;
}) {
  const bodyId = `xb-${k}-body`;
  return (
    <section
      ref={windowRef}
      aria-labelledby={`xb-${k}-title`}
      data-blueprint={blueprint}
      style={{
        backgroundColor: GRAY,
        border: `1px solid ${BLACK}`,
        boxShadow: `${RAISED}, 3px 3px 0 ${BLACK}`,
        padding: 2,
        scrollMarginTop: "calc(var(--simple-game-nav-bottom, 56px) + 16px)",
      }}
    >
      <div className="flex min-h-8 items-center gap-2 py-1 pl-2 pr-1" style={{ backgroundColor: TITLE_BG, color: TITLE_TEXT }}>
        <h2 className="min-w-0 flex-1">
          {onCollapse ? (
            <button
              type="button"
              id={`xb-${k}-title`}
              data-win-title
              aria-expanded={!collapsed}
              aria-controls={bodyId}
              onClick={onCollapse}
              className="flex w-full min-w-0 items-baseline gap-2 text-left"
              style={{ outlineColor: TITLE_TEXT }}
            >
              <TitleText title={title} subtitle={subtitle} />
            </button>
          ) : (
            <span id={`xb-${k}-title`} data-win-title tabIndex={-1} className="flex min-w-0 items-baseline gap-2" style={{ outlineColor: TITLE_TEXT }}>
              <TitleText title={title} subtitle={subtitle} />
            </span>
          )}
        </h2>
        <span className="flex shrink-0 gap-1">
          {onCollapse && (
            <WindowControl label={collapsed ? `Restore ${title}` : `Minimise ${title}`} onClick={onCollapse}>
              {collapsed ? "▢" : "_"}
            </WindowControl>
          )}
          <WindowControl label={`Close ${title}`} onClick={onClose}>
            ✕
          </WindowControl>
        </span>
      </div>
      <div id={bodyId} hidden={collapsed} style={{ backgroundColor: HILITE, borderTop: `1px solid ${BLACK}`, fontFamily: BODY }}>
        {children}
      </div>
    </section>
  );
}

function TitleText({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <>
      <span className="shrink-0 text-[13px] font-bold" style={{ letterSpacing: "0.06em" }}>
        {title}
      </span>
      {subtitle && (
        <span className="hidden min-w-0 truncate text-[12px] sm:inline" style={{ color: GRAY_LIGHT }}>
          · {subtitle}
        </span>
      )}
    </>
  );
}

function WindowControl({ children, label, onClick }: { children: ReactNode; label: string; onClick: (e: MouseEvent) => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="xb-btn xb-ctl inline-flex h-[18px] w-5 items-center justify-center text-[11px] leading-none"
      style={{ outlineColor: TITLE_TEXT }}
    >
      <span aria-hidden>{children}</span>
    </button>
  );
}

// ───────────────────────────────────────────────────────────────────────
// Boot trace
// ───────────────────────────────────────────────────────────────────────

function BootTraceWindow({ lines, done }: { lines: string[]; done: boolean }) {
  return (
    <div
      data-blueprint="boot-trace"
      style={{
        backgroundColor: GRAY,
        border: `1px solid ${BLACK}`,
        boxShadow: `${RAISED}, 2px 2px 0 ${BLACK}`,
        padding: 2,
        opacity: done ? 0.78 : 1,
        transition: "opacity 220ms ease-out",
      }}
    >
      <div className="px-2 py-0.5 text-[11px]" style={{ backgroundColor: TITLE_BG, color: TITLE_TEXT, letterSpacing: "0.08em" }}>
        SYS-BOOT · /DEV/HD0
      </div>
      <pre
        aria-label="Boot log"
        className="m-0 px-2.5 py-1.5 text-[12px]"
        style={{ backgroundColor: BLACK, color: "#00aa00", fontFamily: CHROME, lineHeight: 1.4, minHeight: 24, whiteSpace: "pre-wrap" }}
      >
        {lines.map((l, i) => (
          <span key={i} className="block">
            <span style={{ color: SHADOW }}>$ </span>
            {l}
          </span>
        ))}
        {!done && <span>$ _</span>}
      </pre>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
// Shared pieces: labels, panels, tags, buttons
// ───────────────────────────────────────────────────────────────────────

/** Small caps label — the only place capitals are used. */
function Label({ children, tint, as: As = "span" }: { children: ReactNode; tint?: string; as?: "span" | "h3" | "dt" | "p" }) {
  return (
    <As className="text-[11px] uppercase" style={{ fontFamily: CHROME, letterSpacing: "0.08em", color: tint ?? SHADOW, lineHeight: 1.4 }}>
      {children}
    </As>
  );
}

function SunkenPanel({ header, subtitle, children }: { header?: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="p-3" style={{ backgroundColor: SELECTED, border: `1px solid ${BLACK}`, boxShadow: SUNKEN }}>
      {header && (
        <div className="mb-2 flex items-baseline gap-2 pb-1" style={{ borderBottom: `1px dashed ${SHADOW}` }}>
          <Label as="h3" tint={TITLE_BG}>
            {header}
          </Label>
          {subtitle && (
            <span className="ml-auto text-[11px]" style={{ fontFamily: CHROME, color: SHADOW }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function Tags({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-1">
      {items.map((t) => (
        <li key={t} className="px-1.5 text-[12px]" style={{ backgroundColor: GRAY_LIGHT, border: `1px solid ${BLACK}`, fontFamily: CHROME }}>
          {t}
        </li>
      ))}
    </ul>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-1 text-[14px]">
      {items.map((it) => (
        <li key={it} className="flex items-baseline gap-2">
          <span aria-hidden style={{ color: BEVEL.accent }}>
            ►
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function BevelLink({ children, href, primary }: { children: ReactNode; href: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`xb-btn inline-flex min-h-11 items-center px-4 text-[13px] font-bold uppercase ${primary ? "xb-primary" : ""}`}
      style={{ letterSpacing: "0.06em", textDecoration: "none", fontFamily: CHROME }}
    >
      <span>{children}</span>
    </Link>
  );
}

function DitherRule() {
  return (
    <div
      aria-hidden
      className="my-3 h-1"
      style={{ backgroundImage: "repeating-linear-gradient(90deg, #000 0, #000 2px, transparent 2px, transparent 4px)", opacity: 0.6 }}
    />
  );
}

/** Facts as a label column and sunken white value boxes. */
function Sheet({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="flex flex-col gap-2">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-1 gap-1 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-start sm:gap-3">
          <Label as="dt">{k}</Label>
          <dd className="px-2 py-1 text-[14px]" style={{ background: HILITE, border: `1px solid ${BLACK}`, boxShadow: SUNKEN, overflowWrap: "anywhere" }}>
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** An enumerated value: every option shown as a bevel button, the current one pressed in. */
function Choices({ options, current, label }: { options: readonly string[]; current: string; label: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1">
      {options.map((o) => {
        const on = o.toLowerCase() === current.toLowerCase();
        return (
          <li
            key={o}
            aria-current={on || undefined}
            className="px-2 py-0.5 text-[12px]"
            style={{ fontFamily: CHROME, border: `1px solid ${BLACK}`, background: on ? GRAY_LIGHT : GRAY, boxShadow: on ? SUNKEN : RAISED }}
          >
            {o}
          </li>
        );
      })}
    </ul>
  );
}

// ───────────────────────────────────────────────────────────────────────
// Window bodies
// ───────────────────────────────────────────────────────────────────────

function HeroDoc({ bootDone, clock }: { bootDone: boolean; clock: string }) {
  return (
    <div className="px-4 py-4 sm:px-5">
      <Label>File · Kiruk · design engineer on record</Label>
      <p className="mt-1.5 font-bold" style={{ fontFamily: CHROME, fontSize: "clamp(26px, 4.4vw, 40px)", lineHeight: 1, letterSpacing: "0.02em" }}>
        KIRUK / DESIGN ENGINEER
      </p>
      <p className="mt-1.5" style={{ fontFamily: CHROME, fontSize: "clamp(14px, 1.7vw, 18px)", color: TITLE_BG }}>
        Field notes on Arun at the design ↔ engineering bridge
      </p>
      <DitherRule />
      <Sheet
        rows={[
          ["Subject", HERO.name],
          ["Role", `${HERO.role} at ${HERO.org}`],
          ["Desk", PLACE],
          ["Opened", clock || "—"],
          ["Status", bootDone ? "Ready · open for review" : "Loading…"],
        ]}
      />
      <DitherRule />
      <p className="max-w-[65ch] text-[15px] leading-relaxed">{HERO.framing}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <BevelLink href="/work" primary>
          Open the work ▸
        </BevelLink>
        <BevelLink href="/contact">Write to Arun</BevelLink>
      </div>
    </div>
  );
}

function WhyDoc() {
  const rows: [string, string, string?][] = [
    ["Hook", WHY_KIRUK.hook],
    ["Pain", WHY_KIRUK.pain, ALERT],
    ["Bridge", WHY_KIRUK.bridge, TITLE_BG],
    ["Close", WHY_KIRUK.tagline],
  ];
  return (
    <dl className="grid grid-cols-1 gap-4 px-4 py-4 sm:px-5 md:grid-cols-2">
      {rows.map(([label, text, tint]) => (
        <div key={label} className="flex flex-col gap-1">
          <Label as="dt" tint={tint}>
            ▸ {label}
          </Label>
          <dd className="text-[15px] leading-relaxed" style={{ fontStyle: label === "Close" ? "italic" : undefined }}>
            {label === "Close" ? `“${text}”` : text}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function EmpathyDoc() {
  return (
    <div className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-2 sm:px-5">
      <SunkenPanel header="Says" subtitle="skills I claim">
        <p className="mb-2 text-[15px] italic leading-relaxed">“{EMPATHY_MAP.says.quote}”</p>
        <Tags items={EMPATHY_MAP.says.skills} />
      </SunkenPanel>
      <SunkenPanel header="Thinks" subtitle="philosophy">
        <BulletList items={EMPATHY_MAP.thinks} />
      </SunkenPanel>
      <SunkenPanel header="Does" subtitle="stack in rotation">
        <Tags items={EMPATHY_MAP.does} />
      </SunkenPanel>
      <SunkenPanel header="Feels" subtitle="motivations">
        <BulletList items={EMPATHY_MAP.feels} />
      </SunkenPanel>
    </div>
  );
}

function JourneyDoc({ nodes }: { nodes: EraTimelineNode[] }) {
  return (
    <div className="px-4 py-4 sm:px-5">
      <div className="hidden gap-3 pb-1.5 sm:grid sm:grid-cols-[64px_130px_minmax(0,1fr)]" style={{ borderBottom: `1px solid ${SHADOW}` }}>
        <Label>Year</Label>
        <Label>Phase</Label>
        <Label>Entry</Label>
      </div>
      <ol>
        {nodes.map((n, i) => (
          <li
            key={n.year}
            className="grid grid-cols-[52px_minmax(0,1fr)] gap-3 py-3 sm:grid-cols-[64px_130px_minmax(0,1fr)]"
            style={{ borderTop: i ? `1px dashed ${SHADOW}` : undefined }}
          >
            <span className="font-bold" style={{ fontFamily: CHROME, fontSize: 17, fontVariantNumeric: "tabular-nums" }}>
              {n.year}
            </span>
            <span className="hidden pt-0.5 sm:block">
              <PhaseTag node={n} />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="sm:hidden">
                <PhaseTag node={n} />
              </span>
              <p className="text-[15px] font-bold">{n.position}</p>
              <p className="text-[13px]" style={{ color: SHADOW }}>
                @ {n.org}
              </p>
              <p className="mt-0.5 max-w-[60ch] text-[14px] leading-relaxed">{n.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PhaseTag({ node }: { node: EraTimelineNode }) {
  if (!node.live) return <Label tint={BLACK}>{node.phase}</Label>;
  return (
    <span className="inline-block px-1.5 text-[11px] uppercase" style={{ backgroundColor: TITLE_BG, color: TITLE_TEXT, fontFamily: CHROME, letterSpacing: "0.08em" }}>
      {node.phase} · live
    </span>
  );
}

function ImpactDoc() {
  return (
    <div className="px-4 py-4 sm:px-5">
      <Label>Output: aggregated metrics · last print cycle</Label>
      <ul className="mt-2 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {IMPACT_METRICS.map((m) => (
          <li key={m.id}>
            <SunkenPanel>
              <p className="font-bold" style={{ fontFamily: CHROME, fontSize: 28, lineHeight: 1, color: TITLE_BG, fontVariantNumeric: "tabular-nums" }}>
                {m.value}
              </p>
              <p className="mt-1.5 text-[14px] font-bold leading-snug">{sentence(m.label)}</p>
              {m.context && (
                <p className="mt-0.5 text-[13px] leading-snug" style={{ color: SHADOW }}>
                  {m.context}
                </p>
              )}
            </SunkenPanel>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CardsDoc({
  filter,
  onFilter,
  selected,
  onCard,
}: {
  filter: string;
  onFilter: (t: string) => void;
  selected: Sel | null;
  onCard: (id: string) => void;
}) {
  const projects = CARD_SORTING.projects.filter((p) => inCategory(p, filter));
  return (
    <div className="px-4 py-4 sm:px-5">
      <Label>Taxonomy: project index · {CARD_SORTING.projects.length} cards loaded</Label>
      <div role="group" aria-label="Filter projects by category" className="mt-2 mb-4 flex flex-wrap gap-1.5">
        {CARD_SORTING.taxonomy.map((t) => {
          const n = projectCount(t);
          return (
            <button
              key={t}
              type="button"
              aria-pressed={filter === t}
              aria-disabled={n === 0 || undefined}
              onClick={() => n > 0 && onFilter(t)}
              className="xb-btn min-h-9 px-2.5 text-[12px] uppercase"
              style={{ fontFamily: CHROME, letterSpacing: "0.06em" }}
            >
              <span>
                {t} ({n})
              </span>
            </button>
          );
        })}
      </div>
      <ol data-shortcuts className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {projects.map((p) => {
          const n = CARD_SORTING.projects.indexOf(p) + 1;
          const on = selected === `project:${p.id}`;
          return (
            <li key={p.id}>
              <SunkenPanel header={`Card ${String(n).padStart(2, "0")}`} subtitle={p.duration}>
                <button
                  type="button"
                  data-project={p.id}
                  aria-pressed={on}
                  onClick={() => onCard(p.id)}
                  className="-mx-1 mb-1 block min-h-11 px-1 text-left text-[15px] font-bold leading-snug"
                  style={{ fontFamily: CHROME, background: on ? TITLE_BG : "transparent", color: on ? TITLE_TEXT : BLACK }}
                >
                  {p.title}
                </button>
                <p className="mb-1.5">
                  <Label tint={TITLE_BG}>
                    {p.category} · {p.role}
                  </Label>
                </p>
                <p className="mb-2 text-[14px] leading-relaxed">{p.description}</p>
                <Tags items={p.technologies} />
                <p className="mt-3">
                  <Link href={`/work/${p.id}`} className="text-[13px] underline underline-offset-2" style={{ color: BEVEL.accent, fontFamily: CHROME }}>
                    Open card ▸<span className="sr-only"> {p.title}</span>
                  </Link>
                </p>
              </SunkenPanel>
            </li>
          );
        })}
      </ol>
      <div className="mt-4">
        <BevelLink href="/work">All work ▸</BevelLink>
      </div>
    </div>
  );
}

function ContactDoc() {
  return (
    <div className="grid grid-cols-1 gap-3 px-4 py-4 sm:px-5 md:grid-cols-2">
      <SunkenPanel header="Test scenario" subtitle="task + metrics">
        <p className="mb-1 font-bold" style={{ fontFamily: CHROME, fontSize: 15, color: TITLE_BG }}>
          ▶ {USABILITY_TEST.task}
        </p>
        <p className="mb-2 text-[14px] leading-relaxed">{USABILITY_TEST.taskBody}</p>
        <Label>Success metrics</Label>
        <div className="mt-1">
          <BulletList items={USABILITY_TEST.successMetrics.map((m) => m.replace(/: ([A-Z-]+)$/, (_, v: string) => `: ${sentence(v.toLowerCase().replace(/-/g, " "))}`))} />
        </div>
      </SunkenPanel>
      <SunkenPanel header="Test channels" subtitle="contact methods">
        <ul className="flex flex-col gap-2">
          {USABILITY_TEST.channels.map((c) => {
            const ext = c.href.startsWith("http");
            return (
              <li key={c.label}>
                <Label>
                  ▸ {c.label} — {c.role}
                </Label>
                <a
                  href={c.href}
                  target={ext ? "_blank" : undefined}
                  rel={ext ? "noopener noreferrer" : undefined}
                  className="block text-[14px] underline underline-offset-2"
                  style={{ color: TITLE_BG, overflowWrap: "anywhere" }}
                >
                  {c.value}
                </a>
              </li>
            );
          })}
        </ul>
      </SunkenPanel>
      <div className="md:col-span-2">
        <BevelLink href="/contact" primary>
          Write to Arun ▸
        </BevelLink>
      </div>
    </div>
  );
}

function HelpDoc() {
  return (
    <div className="flex max-w-[65ch] flex-col gap-3 px-4 py-4 text-[15px] leading-relaxed sm:px-5">
      <p className="font-bold">Everything on this desktop is an object. Select a thing, then press what to do with it.</p>
      <ol className="flex list-decimal flex-col gap-1 pl-5">
        <li>Click an icon to select it. Its name turns blue.</li>
        <li>Press a key at the foot of the screen: Open shows its window, Props lists its properties, Copy puts it on your clipboard.</li>
        <li>An icon drawn gray is in use. Close its window and the icon is free again.</li>
      </ol>
      <p>
        Clicking a selected icon again also opens it. On a keyboard, arrow keys move between icons, Enter opens, and O, P, C and H press the keys.
      </p>
      <p className="text-[13px] italic" style={{ color: SHADOW }}>
        The Xerox Star worked this way in 1981: the noun first, then the verb.
      </p>
    </div>
  );
}

function PropertySheet({ target, nodes }: { target: Sel; nodes: EraTimelineNode[] }) {
  const kinds: Kind[] = ["Document", "Folder", "Drawer", "Basket"];
  const kind = (k: Kind): [string, ReactNode] => ["Kind", <Choices key="kind" label="Kind" options={kinds} current={k} />];
  let rows: [string, ReactNode][];

  if (isProject(target)) {
    const p = projectOf(target);
    rows = p
      ? [
          kind("Document"),
          ["Title", p.title],
          ["Role", p.role],
          ["Duration", sentence(p.duration)],
          ["Category", <Choices key="cat" label="Category" options={CATEGORIES} current={p.category} />],
          ["Tools", p.technologies.join(", ")],
        ]
      : [];
  } else {
    const w = winOf(target);
    const base: [string, ReactNode][] = [kind(w.kind), ["File", w.title]];
    switch (target) {
      case "hero":
        rows = [...base, ["Name", HERO.name], ["Role", HERO.role], ["At", HERO.org], ["Desk", PLACE]];
        break;
      case "why":
        rows = [...base, ["Tagline", WHY_KIRUK.tagline]];
        break;
      case "persona":
        rows = [
          ...base,
          ["Subject", PERSONA.identity.name],
          ["Motto", PERSONA.quote],
          ["Goals", <BulletList key="g" items={PERSONA.goals} />],
          ["Frustrations", <BulletList key="f" items={PERSONA.frustrations} />],
        ];
        break;
      case "empathy":
        rows = [...base, ["Contains", "Says, thinks, does, feels"], ["Quote", `“${EMPATHY_MAP.says.quote}”`]];
        break;
      case "journey":
        rows = [
          ...base,
          ["Holds", `${nodes.length} entries`],
          ["Span", `${nodes[0].year} to ${nodes[nodes.length - 1].year}`],
          ["Now", `${nodes[nodes.length - 1].position}, ${nodes[nodes.length - 1].org}`],
        ];
        break;
      case "impact":
        rows = [
          ...base,
          ["Figures", String(IMPACT_METRICS.length)],
          ["Sources", <BulletList key="s" items={[...new Set(IMPACT_METRICS.map((m) => m.context).filter((c): c is string => !!c))]} />],
        ];
        break;
      case "cards":
        rows = [...base, ["Holds", `${CARD_SORTING.projects.length} cards`], ["Filed under", CATEGORIES.map((c) => `${c} ${projectCount(c)}`).join(" · ")]];
        break;
      case "usability": {
        rows = [...base];
        if (STATUS) rows.push(["Status", <Choices key="st" label="Status" options={["Available", "Busy", "Not available"]} current={STATUS} />]);
        const response = fact("response time");
        const zone = fact("timezone");
        if (response) rows.push(["Replies in", response]);
        if (zone) rows.push(["Time zone", zone]);
        if (EMAIL) rows.push(["Address", EMAIL]);
        break;
      }
    }
  }

  return (
    <div className="px-4 py-4 sm:px-5" style={{ backgroundColor: GRAY }}>
      <Sheet rows={rows} />
    </div>
  );
}

export default XeroxBitmapHomePage;
