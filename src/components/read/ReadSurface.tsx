"use client";

/**
 * A Read page outside the notebook route (making, work in words): the same
 * reading surface the notebook gives its pages, in the visitor's era unless
 * the page belongs to one, with the rail beside it and the navbar's trail set.
 */

import type { ReactNode } from "react";
import { useNavTrail, type NavTrailItem } from "@/components/layout/NavTrail";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { MAKING_FONT_VARS } from "@/components/making/fonts";
import { ReadShell, type RailGroup } from "./ReadShell";

export function ReadSurface({ era, trail, rail, blueprint, children }: {
  /** Pin the page to one era (an era's own entry). */
  era?: string;
  trail: NavTrailItem[];
  rail: RailGroup[];
  blueprint: string;
  children: ReactNode;
}) {
  const { currentEraId } = useDesignEra();
  useNavTrail(trail);
  const eraId = era ?? currentEraId ?? "1970";

  return (
    // data-own-cursor: the site's dot stands down; Read draws the tube's arrow.
    <div className={`era-blog-surface read-surface ${MAKING_FONT_VARS}`} data-era-surface={eraId} data-own-cursor>
      <ReadShell rail={rail}>
        <article className="read-article" data-blueprint={blueprint}>
          {children}
        </article>
      </ReadShell>
    </div>
  );
}
