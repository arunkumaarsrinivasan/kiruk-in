"use client";

/**
 * In eras whose whole site lives on the home page (2026: the pupil), pages
 * like /work and /contact hand the visitor back home with the question
 * already asked. Renders `children` in every other era.
 */

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useDesignEra } from "@/contexts/DesignEraContext";

const HOME_ERAS = new Set(["2026"]);

export function EraHandoff({ ask, children }: { ask: string; children: ReactNode }) {
  const { currentEra } = useDesignEra();
  const router = useRouter();
  const handoff = HOME_ERAS.has(currentEra.id);

  useEffect(() => {
    if (handoff) router.replace(`/?ask=${encodeURIComponent(ask)}`);
  }, [handoff, ask, router]);

  if (handoff) return <div className="min-h-dvh" style={{ backgroundColor: "var(--bg-main)" }} aria-busy="true" />;
  return <>{children}</>;
}
