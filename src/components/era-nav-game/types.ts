/**
 * Era navigation games — shared types.
 *
 * Every era gets its own minimal navigation game that IS the mobile menu.
 * The framework owns the overlay chrome (focus trap, Esc, sr-only links,
 * header); each game owns its era-specific interaction + visuals.
 *
 * Games read era tokens from CSS vars (already on body[data-era]) so they
 * automatically match the active era without per-game color plumbing.
 */

import type { ComponentType } from "react";

export interface Dest {
  label: string;
  href: string;
  /** Hackernoon pixel-icon name (see PixelIcon). Empty = no icon. */
  icon: string;
}

/** The five destinations, matching the live Navbar mobile menu. */
export const DESTINATIONS: Dest[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Work", href: "/work", icon: "grid" },
  { label: "About", href: "/about", icon: "user" },
  { label: "Read", href: "/notebook", icon: "book" },
  { label: "Contact", href: "/contact", icon: "envelope" },
];

export interface EraNavGameProps {
  dests: Dest[];
  /** href of the current page, to mark active. */
  activeHref: string;
  /** Navigate to a destination. Games call this on their interaction. */
  onNavigate: (href: string) => void;
  /** prefers-reduced-motion. Games should honor it. */
  reduce: boolean;
}

export type EraNavGame = ComponentType<EraNavGameProps>;
