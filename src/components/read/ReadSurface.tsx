/**
 * A Read page outside the notebook route (making, work in words): the same
 * reading surface the notebook gives its pages, in the visitor's era unless
 * the page belongs to one, with the rail beside it and the navbar's trail set.
 * A server component: only ReadEraSurface (era + trail) runs on the client.
 */

import type { ReactNode } from "react";
import type { NavTrailItem } from "@/components/layout/NavTrail";
import { MAKING_FONT_VARS } from "@/components/making/fonts";
import { ReadEraSurface } from "./ReadEraSurface";
import { ReadShell, type RailGroup } from "./ReadShell";

export function ReadSurface({ era, trail, rail, blueprint, children }: {
  /** Pin the page to one era (an era's own entry). */
  era?: string;
  trail: NavTrailItem[];
  rail: RailGroup[];
  blueprint: string;
  children: ReactNode;
}) {
  return (
    <ReadEraSurface era={era} trail={trail} className={`era-blog-surface read-surface ${MAKING_FONT_VARS}`}>
      <ReadShell rail={rail}>
        <article className="read-article" data-blueprint={blueprint}>
          {children}
        </article>
      </ReadShell>
    </ReadEraSurface>
  );
}
