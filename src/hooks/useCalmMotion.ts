"use client";

import { useSyncExternalStore } from "react";

/**
 * Phones (touch, or a narrow window) and reduced-motion visitors get each era
 * without its purely decorative loops: twinkles, marquees, blinks, flicker,
 * ticking seconds. Same query as the `[data-era-calm]` rule in globals.css,
 * which covers the CSS animations; this hook covers the JS-driven ones.
 */
export const CALM_MOTION_QUERY =
  "(pointer: coarse), (max-width: 767px), (prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(CALM_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(CALM_MOTION_QUERY).matches;
// The server can't tell a phone from a desktop; it renders the full motion
// and the client settles on hydration.
const getServerSnapshot = () => false;

export function useCalmMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
