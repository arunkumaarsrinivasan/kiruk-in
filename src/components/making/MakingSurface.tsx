"use client";

/**
 * A making-of page: the shared Read surface (components/read/ReadSurface)
 * with the rail beside it. Ordinary entries follow the visitor's era; an
 * entry that belongs to an era wears that era.
 */

import type { ReactNode } from "react";
import type { NavTrailItem } from "@/components/layout/NavTrail";
import type { RailGroup } from "@/components/read/ReadShell";
import { ReadSurface } from "@/components/read/ReadSurface";

export function MakingSurface({ era, blueprint, title, rail, children }: {
  /** Pin the surface to one era (an era's own entry). */
  era?: string;
  blueprint: string;
  /** The entry's title, for the navbar's trail. Leave out on the hub. */
  title?: string;
  rail: RailGroup[];
  children: ReactNode;
}) {
  // The making-of sits under Read in the site's map: Read / Making / entry.
  const trail: NavTrailItem[] = [{ label: "Read", href: "/notebook" }, title ? { label: "Making", href: "/making" } : { label: "Making" }];
  if (title) trail.push({ label: title });
  return (
    <ReadSurface era={era} trail={trail} rail={rail} blueprint={blueprint}>
      {children}
    </ReadSurface>
  );
}
