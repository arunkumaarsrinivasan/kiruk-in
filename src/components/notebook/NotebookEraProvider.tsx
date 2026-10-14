"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { IBM_Plex_Mono, VT323 } from "next/font/google";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { getArchetypeForEra, type EraArchetypeId } from "@/data/era-archetypes";
import { TimeTravelOverlay } from "@/components/layout/TimeTravelOverlay";
import { TerminalShellLayer } from "@/components/era-shell/archetypes/terminal/TerminalShellLayer";
import { XeroxBitmapShellLayer } from "@/components/era-shell/archetypes/xerox-bitmap/XeroxBitmapShellLayer";
import { DocHtmlShellLayer } from "@/components/era-shell/archetypes/doc-html/DocHtmlShellLayer";
import { GeocitiesShellLayer } from "@/components/era-shell/archetypes/geocities/GeocitiesShellLayer";
import { FramesetShellLayer } from "@/components/era-shell/archetypes/frameset/FramesetShellLayer";
import {
  DEFAULT_NOTEBOOK_ERA,
  NOTEBOOK_ERA_LITES,
  SITE_ERA_STORAGE_KEY,
  isBlogReadyEra,
  parseNotebookEraId,
} from "@/lib/notebook";
import { NotebookEraContext } from "./NotebookEraContext";
import { NotebookCursor } from "./NotebookCursor";
import { NotebookDwell } from "./NotebookDwell";
import { Navbar } from "@/components/layout/Navbar";
import type { NotebookChromeVariant } from "./NotebookChrome";
import type { DesignEra } from "@/contexts/DesignEraContext";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-blog-body",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-blog-display",
});

const FONT_VARS = `${ibmPlexMono.variable} ${vt323.variable}`;

const BLOG_SHELL_LAYERS: Partial<Record<EraArchetypeId, typeof TerminalShellLayer>> = {
  terminal: TerminalShellLayer,
  "xerox-bitmap": XeroxBitmapShellLayer,
  "doc-html": DocHtmlShellLayer,
  geocities: GeocitiesShellLayer,
  frameset: FramesetShellLayer,
};

type TravelState = { toId: string; dir: 1 | -1 };

const DWELL_UNTIL_KEY = "kiruk-notebook-dwell-until";
const DWELL_MS = 6400;

function markDwell() {
  const until = Date.now() + DWELL_MS;
  live.dwellUntil = until;
  try {
    window.sessionStorage.setItem(DWELL_UNTIL_KEY, String(until));
  } catch {
    /* ignore */
  }
  return until;
}

function dwellUntil(): number {
  let stored = 0;
  try {
    stored = Number(window.sessionStorage.getItem(DWELL_UNTIL_KEY) || 0);
  } catch {
    stored = 0;
  }
  return Math.max(live.dwellUntil, Number.isFinite(stored) ? stored : 0);
}

/** Survives a layout remount when `?era=` updates. */
const live = {
  eraId: DEFAULT_NOTEBOOK_ERA,
  dwellUntil: 0,
};

export function NotebookEraRoot({
  children,
  chrome = "notebook",
}: {
  children: ReactNode;
  chrome?: NotebookChromeVariant;
}) {
  return <NotebookEraSession chrome={chrome}>{children}</NotebookEraSession>;
}

function NotebookEraSession({
  children,
  chrome: _chrome,
}: {
  children: ReactNode;
  chrome: NotebookChromeVariant;
}) {
  void _chrome;
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const { currentEraId, setEra } = useDesignEra();
  const [eraId, setEraIdState] = useState(live.eraId);
  const [resolved, setResolved] = useState(false);
  const [travel, setTravel] = useState<TravelState | null>(null);
  const [dwell, setDwell] = useState(() => Date.now() < live.dwellUntil);
  const travelRef = useRef<string | null>(null);
  const travelling = useRef(false);

  const setEraId = useCallback((id: string) => {
    live.eraId = id;
    setEraIdState(id);
  }, []);

  // One era everywhere: an explicit `?era=` wins, otherwise read in whatever era
  // the rest of the site is in. Read the site's key directly — ThemeContext
  // restores it in a parent effect, which runs after this one. Never push an era
  // to the site before this resolves: pushing the 1970 default on mount used to
  // overwrite the saved era, so clicking Read always landed in 1970.
  useEffect(() => {
    if (resolved) return;
    const fromQuery = parseNotebookEraId(new URLSearchParams(window.location.search).get("era"));
    const siteEra = parseNotebookEraId(window.localStorage.getItem(SITE_ERA_STORAGE_KEY));
    const id = fromQuery ?? siteEra ?? DEFAULT_NOTEBOOK_ERA;
    setEraId(id);
    setEra(id as DesignEra);
    setResolved(true);
  }, [resolved, setEraId, setEra]);

  // Follow era changes made outside the notebook (navbar Time Machine, mobile menu).
  useEffect(() => {
    if (!resolved || travelling.current) return;
    const site = parseNotebookEraId(currentEraId);
    if (site && site !== live.eraId) setEraId(site);
  }, [currentEraId, resolved, setEraId]);

  const applyQueryEra = useCallback(
    (id: string) => {
      if (travelling.current) return;
      setEraId(id);
      setEra(id as DesignEra);
    },
    [setEraId, setEra],
  );

  const syncUrl = useCallback(
    (id: string) => {
      const params = new URLSearchParams(window.location.search);
      params.set("era", id);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const onPick = useCallback(
    (id: string) => {
      if (id === eraId) return;
      const toIdx = NOTEBOOK_ERA_LITES.findIndex((era) => era.id === id);
      const fromIdx = NOTEBOOK_ERA_LITES.findIndex((era) => era.id === eraId);
      travelRef.current = id;
      travelling.current = true;
      markDwell();
      setDwell(true);
      setTravel({
        toId: id,
        dir: toIdx >= fromIdx ? 1 : -1,
      });
    },
    [eraId],
  );

  const onMid = useCallback(() => {
    const next = travelRef.current;
    if (!next) return;
    markDwell();
    setDwell(true);
    setEraId(next);
    setEra(next as DesignEra);
    syncUrl(next);
  }, [setEraId, setEra, syncUrl]);

  const onDone = useCallback(() => {
    travelRef.current = null;
    travelling.current = false;
    markDwell();
    setTravel(null);
    setDwell(true);
  }, []);

  useEffect(() => {
    if (dwellUntil() > Date.now()) setDwell(true);
  }, [eraId]);

  useEffect(() => {
    if (!dwell) return;
    const left = dwellUntil() - Date.now();
    if (left <= 0) {
      setDwell(false);
      return;
    }
    const id = window.setTimeout(() => {
      live.dwellUntil = 0;
      try {
        window.sessionStorage.removeItem(DWELL_UNTIL_KEY);
      } catch {
        /* ignore */
      }
      setDwell(false);
    }, left);
    return () => window.clearTimeout(id);
  }, [dwell]);

  const value = useMemo(
    () => ({
      eraId,
      ready: isBlogReadyEra(eraId),
      pickEra: onPick,
    }),
    [eraId, onPick],
  );

  const archetypeId = getArchetypeForEra(eraId);
  const Layer = archetypeId ? BLOG_SHELL_LAYERS[archetypeId] : undefined;

  return (
    <NotebookEraContext.Provider value={value}>
      <div
        className={`era-blog-surface relative min-h-screen ${FONT_VARS}${eraId === "1970" ? " skin-log" : ""}`}
        data-era-surface={eraId}
        data-era-cursor={eraId === "1970" ? "block" : undefined}
        data-notebook-dwell={dwell ? "1" : undefined}
        suppressHydrationWarning
        style={{
          backgroundColor: "var(--bg-main)",
          color: "var(--text-main)",
          fontFamily: "var(--font-main)",
        }}
      >
        {Layer ? (
          <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <Layer active />
          </div>
        ) : null}

        <div className="relative z-10">
          <a href="#notebook-page" className="skip-link">
            Skip to notebook
          </a>
          <Navbar />
          <div
            id="notebook-page"
            tabIndex={-1}
            style={{ paddingTop: "var(--simple-game-nav-bottom, 4.5rem)" }}
          >
            {children}
          </div>
        </div>

        <NotebookCursor />
        <NotebookDwell eraId={eraId} active={dwell} />

        <TimeTravelOverlay
          active={Boolean(travel)}
          toId={travel?.toId ?? eraId}
          dir={travel?.dir ?? 1}
          pageKey="blog"
          onMid={onMid}
          onDone={onDone}
          reduce={!!reduce}
        />

        <Suspense fallback={null}>
          <NotebookEraQuerySync onQuery={applyQueryEra} />
        </Suspense>
      </div>
    </NotebookEraContext.Provider>
  );
}

function NotebookEraQuerySync({ onQuery }: { onQuery: (id: string) => void }) {
  const eraQuery = useSearchParams().get("era");
  useEffect(() => {
    const parsed = parseNotebookEraId(eraQuery);
    if (parsed) onQuery(parsed);
  }, [eraQuery, onQuery]);
  return null;
}
