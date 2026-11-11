"use client";

/**
 * The one client piece of a Read page: it reads the visitor's era (unless the
 * page pins one) and sets the navbar's trail. Everything inside stays a server
 * component, passed through as children.
 */

import type { ReactNode } from "react";
import { useNavTrail, type NavTrailItem } from "@/components/layout/NavTrail";
import { useDesignEra } from "@/contexts/DesignEraContext";

export function ReadEraSurface({ era, trail, className, children }: {
  era?: string;
  trail: NavTrailItem[];
  className: string;
  children: ReactNode;
}) {
  const { currentEraId } = useDesignEra();
  useNavTrail(trail);
  const eraId = era ?? currentEraId ?? "1970";

  return (
    // data-own-cursor: the site's dot stands down; Read draws the tube's arrow.
    <div className={className} data-era-surface={eraId} data-own-cursor>
      {children}
    </div>
  );
}
