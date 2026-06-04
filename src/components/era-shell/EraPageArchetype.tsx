"use client";

/**
 * EraPageArchetype — wraps a page's default content. If the active era has
 * a registered archetype with a variant for this page key, the variant is
 * rendered in place of the default. Otherwise children render unchanged.
 *
 * Archetype home copy and facts live in `@/data/era-page-content` (single
 * source of truth). Shell components only handle era-specific presentation.
 *
 * Usage:
 *
 *   export default function HomePage() {
 *     return (
 *       <EraPageArchetype pageKey="home">
 *         <DefaultHomeContent />
 *       </EraPageArchetype>
 *     );
 *   }
 */

import React from "react";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { getArchetypeForEra } from "@/data/era-archetypes";
import { ARCHETYPE_SHELLS, type EraPageKey } from "./registry";

interface EraPageArchetypeProps {
  pageKey: EraPageKey;
  children: React.ReactNode;
}

export function EraPageArchetype({ pageKey, children }: EraPageArchetypeProps) {
  const { currentEraId } = useDesignEra();
  const archetypeId = getArchetypeForEra(currentEraId);
  const archetype = archetypeId ? ARCHETYPE_SHELLS[archetypeId] : undefined;
  const Variant = archetype?.pages?.[pageKey];

  return Variant ? <Variant /> : children;
}
