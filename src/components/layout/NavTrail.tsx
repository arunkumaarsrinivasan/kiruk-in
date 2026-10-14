"use client";

/**
 * NavTrail — the page's "where am I" line, rendered inside the one site bar.
 *
 * Pages that sit deeper than a top-level section publish their trail with
 * `useNavTrail([{ label: "Work", href: "/work" }, { label: "Spera" }])`.
 * The bar shows it after the brand, so every deep page gets the same "up"
 * affordance without drawing a second bar of its own.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type NavTrailItem = { label: string; href?: string };

type Ctx = {
  trail: NavTrailItem[] | null;
  setTrail: (t: NavTrailItem[] | null) => void;
};

const NavTrailContext = createContext<Ctx | null>(null);

export function NavTrailProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [trail, setTrail] = useState<NavTrailItem[] | null>(null);
  return <NavTrailContext.Provider value={{ trail, setTrail }}>{children}</NavTrailContext.Provider>;
}

/** Publish this page's trail. Cleared when the page unmounts. */
export function useNavTrail(items: NavTrailItem[] | null) {
  const ctx = useContext(NavTrailContext);
  const key = items ? items.map((i) => `${i.label}\u0000${i.href ?? ""}`).join("\u0001") : "";
  useEffect(() => {
    if (!ctx) return;
    ctx.setTrail(items);
    return () => ctx.setTrail(null);
    // `key` captures the items' content; the array identity changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.setTrail, key]);
}

/** For server pages: `<NavTrailSet items={[...]} />` publishes the trail. */
export function NavTrailSet({ items }: Readonly<{ items: NavTrailItem[] }>) {
  useNavTrail(items);
  return null;
}

export function usePublishedTrail() {
  return useContext(NavTrailContext)?.trail ?? null;
}
