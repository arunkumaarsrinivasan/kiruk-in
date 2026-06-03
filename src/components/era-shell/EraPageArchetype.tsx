"use client";

/**
 * EraPageArchetype — wraps a page's default content. If the active era has
 * a registered archetype with a variant for this page key, the variant is
 * rendered in place of the default. Otherwise children render unchanged.
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
import { UXProcessNav } from "@/components/modules/UXProcessNav";

interface EraPageArchetypeProps {
  pageKey: EraPageKey;
  children: React.ReactNode;
}

/**
 * Archetypes that render their OWN native nav section inside their home flow
 * (built from their own components). For these, skip the generic bento fallback
 * so there's no duplicate. As each era is wired natively, add it here.
 */
const NATIVE_NAV_ARCHETYPES = new Set<string>(["terminal"]);

export function EraPageArchetype({ pageKey, children }: EraPageArchetypeProps) {
  const { currentEraId } = useDesignEra();
  const archetypeId = getArchetypeForEra(currentEraId);
  const archetype = archetypeId ? ARCHETYPE_SHELLS[archetypeId] : undefined;
  const Variant = archetype?.pages?.[pageKey];

  // Home gets a nav: native (inside the archetype) where wired, else the generic
  // bento fallback so no era is ever left without navigation.
  const showFallbackNav =
    pageKey === "home" &&
    !(archetypeId && NATIVE_NAV_ARCHETYPES.has(archetypeId));

  return (
    <>
      {Variant ? <Variant /> : children}
      {showFallbackNav && <UXProcessNav />}
    </>
  );
}
