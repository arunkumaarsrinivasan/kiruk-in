"use client";

/**
 * EraTravelContext — the single owner of site-wide era travel.
 *
 * Any component that wants to change the active era calls `travelTo(id)`.
 * The provider runs the `TimeTravelOverlay` (cover → grid → rulers →
 * skeleton → reveal) and swaps the era underneath it at the mid-point. This
 * replaces the per-component copy of the travel pattern that used to live in
 * the Navbar, and lets the module-overlay era picker and the EraStory
 * prev/next ribbon route through the same wireframe flow.
 *
 * The notebook keeps its own travel state (separate era id + `?era=` URL
 * sync), so it does not use this provider.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { TimeTravelOverlay } from "@/components/layout/TimeTravelOverlay";
import { prefetchEraArchetype } from "@/components/era-shell/registry";
import { pageKeyForPath } from "@/components/era-travel/blueprint-types";

interface TravelState {
  toId: string;
  dir: 1 | -1;
}

interface EraTravelContextValue {
  /** Begin a wireframe travel to the given era id. No-op if already there. */
  travelTo: (eraId: string) => void;
  /** True while a travel is in progress. */
  travelling: boolean;
}

const EraTravelContext = createContext<EraTravelContextValue | undefined>(
  undefined,
);

export const useEraTravel = () => {
  const ctx = useContext(EraTravelContext);
  if (ctx === undefined) {
    throw new Error("useEraTravel must be used within an EraTravelProvider");
  }
  return ctx;
};

/** Safe when Navbar is mounted on notebook without EraTravelProvider. */
export const useEraTravelOptional = () => useContext(EraTravelContext);

export function EraTravelProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { eras, currentEraId, setEra } = useDesignEra();
  const [travel, setTravel] = useState<TravelState | null>(null);
  const travelRef = useRef<string | null>(null);

  const travelTo = useCallback(
    (id: string) => {
      if (id === currentEraId) return;
      const toIdx = eras.findIndex((x) => x.id === id);
      const fromIdx = eras.findIndex((x) => x.id === currentEraId);
      travelRef.current = id;
      prefetchEraArchetype(id);
      setTravel({
        toId: id,
        dir: toIdx >= fromIdx ? 1 : -1,
      });
    },
    [currentEraId, eras],
  );

  const onMid = useCallback(() => {
    if (travelRef.current) setEra(travelRef.current);
  }, [setEra]);

  const onDone = useCallback(() => {
    travelRef.current = null;
    setTravel(null);
  }, []);

  const value = useMemo<EraTravelContextValue>(
    () => ({ travelTo, travelling: travel !== null }),
    [travelTo, travel],
  );

  return (
    <EraTravelContext.Provider value={value}>
      {children}
      <TimeTravelOverlay
        active={!!travel}
        toId={travel?.toId ?? ""}
        dir={travel?.dir ?? 1}
        pageKey={pageKeyForPath(pathname)}
        onMid={onMid}
        onDone={onDone}
        reduce={!!reduce}
      />
    </EraTravelContext.Provider>
  );
}
