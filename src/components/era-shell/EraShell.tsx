"use client";

/**
 * EraShell — always-mounted site-wide layer. Renders the active archetype's
 * shell layer (atmospheric overlay) if one is registered. Sits above page
 * content but below the nav. Pointer-events none so user interaction is
 * never blocked.
 */

import React from "react";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { getArchetypeForEra } from "@/data/era-archetypes";
import { ARCHETYPE_SHELLS } from "./registry";

export function EraShell() {
  const { currentEraId } = useDesignEra();
  const archetypeId = getArchetypeForEra(currentEraId);
  const archetype = archetypeId ? ARCHETYPE_SHELLS[archetypeId] : undefined;
  const Layer = archetype?.shellLayer;

  if (!Layer) return null;
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none z-[80] overflow-hidden"
    >
      <Layer active />
    </div>
  );
}
