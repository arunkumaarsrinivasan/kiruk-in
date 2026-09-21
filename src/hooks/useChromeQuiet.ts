"use client";

import { useEffect, useState } from "react";

export const CHROME_QUIET_ATTRS = [
  "data-era-picker-active",
  "data-time-travel",
  "data-module-open",
] as const;

/** True while a fullscreen overlay is up or the tab is hidden. */
export function useChromeQuiet() {
  const [quiet, setQuiet] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const next =
        document.hidden ||
        CHROME_QUIET_ATTRS.some((attr) => root.hasAttribute(attr));
      setQuiet((prev) => (prev === next ? prev : next));
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, {
      attributes: true,
      attributeFilter: [...CHROME_QUIET_ATTRS],
    });
    document.addEventListener("visibilitychange", sync);
    return () => {
      mo.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return quiet;
}
