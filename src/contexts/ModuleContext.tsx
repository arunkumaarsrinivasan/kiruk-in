"use client";

/**
 * ModuleContext — the single-page "modules" state machine that replaces the
 * old nav bar. Landing-page modules are small content cards that expand to
 * fullscreen on open and minimize back to their slot. Only one module is open
 * at a time. Era archetypes never navigate routes; we sync a `?module=` query
 * via history.replaceState so deep-links work without remounting the App
 * Router tree (which would reset the active era).
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

export type ModuleId =
  | "about"
  | "work"
  | "case-studies"
  | "observatory"
  | "era-story"
  | "contact"
  | "blog"
  | "progress"
  | "eras"
  | "footer-game";

export type ModulePhase =
  | "collapsed"
  | "expanding"
  | "fullscreen"
  | "minimizing";

const MODULE_IDS: ModuleId[] = [
  "about",
  "work",
  "case-studies",
  "observatory",
  "era-story",
  "contact",
  "blog",
  "progress",
  "eras",
  "footer-game",
];

function isModuleId(v: string | null): v is ModuleId {
  return !!v && (MODULE_IDS as string[]).includes(v);
}

/** Screen-space point the module expands from / minimizes back to. */
export interface OriginPoint {
  x: number;
  y: number;
}

interface ModuleContextValue {
  openId: ModuleId | null;
  phase: ModulePhase;
  /** Center of the card that triggered the open (for the grow/shrink morph). */
  origin: OriginPoint | null;
  open: (id: ModuleId, origin?: OriginPoint) => void;
  close: () => void;
  toggle: (id: ModuleId, origin?: OriginPoint) => void;
  isOpen: (id: ModuleId) => boolean;
  /** Called by the overlay once the expand animation settles. */
  markFullscreen: () => void;
}

const ModuleContext = createContext<ModuleContextValue | null>(null);

function syncUrl(id: ModuleId | null) {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("module", id);
    else url.searchParams.delete("module");
    window.history.replaceState(window.history.state, "", url);
  } catch {
    /* noop */
  }
}

export function ModuleProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<ModuleId | null>(null);
  const [phase, setPhase] = useState<ModulePhase>("collapsed");
  const [origin, setOrigin] = useState<OriginPoint | null>(null);
  const hydrated = useRef(false);

  const open = useCallback((id: ModuleId, o?: OriginPoint) => {
    setOrigin(o ?? null);
    setOpenId(id);
    setPhase("expanding");
    syncUrl(id);
  }, []);

  const close = useCallback(() => {
    setPhase("minimizing");
    setOpenId(null);
    syncUrl(null);
  }, []);

  const toggle = useCallback(
    (id: ModuleId, o?: OriginPoint) => {
      setOpenId((cur) => {
        const next = cur === id ? null : id;
        setOrigin(next ? o ?? null : null);
        setPhase(next ? "expanding" : "minimizing");
        syncUrl(next);
        return next;
      });
    },
    [],
  );

  const isOpen = useCallback((id: ModuleId) => openId === id, [openId]);
  const markFullscreen = useCallback(() => setPhase("fullscreen"), []);

  // Reset phase to collapsed once nothing is open (after minimize animation).
  useEffect(() => {
    if (openId === null && phase === "minimizing") {
      const t = window.setTimeout(() => setPhase("collapsed"), 400);
      return () => window.clearTimeout(t);
    }
  }, [openId, phase]);

  // Deep-link: open the module named in ?module= on first mount.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const param = new URLSearchParams(window.location.search).get("module");
    if (isModuleId(param)) {
      setOpenId(param);
      setPhase("expanding");
    }
  }, []);

  // Ctrl/Cmd+Shift+E opens Eras. Letter-only Shift+M failed WCAG 2.1.4.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (
        el instanceof HTMLElement &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable)
      ) {
        return;
      }
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "e" &&
        !e.altKey
      ) {
        e.preventDefault();
        toggle("eras");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return (
    <ModuleContext.Provider
      value={{ openId, phase, origin, open, close, toggle, isOpen, markFullscreen }}
    >
      {children}
    </ModuleContext.Provider>
  );
}

export function useModules(): ModuleContextValue {
  const ctx = useContext(ModuleContext);
  if (!ctx) throw new Error("useModules must be used within a ModuleProvider");
  return ctx;
}
