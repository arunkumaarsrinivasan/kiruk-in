"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useDesignEra } from "@/contexts/DesignEraContext";
import type { SceneId } from "@/data/work-cases";
import { CaseScene, type CaseLook, type Shot } from "@/components/work-case";

/**
 * The era's say in how the work is drawn. 1970 draws it in phosphor;
 * 2026's white page gets Spera's light theme; everywhere else Spera stays
 * dark-first, as it ships, and HP and Square Bridge light. The rest of the
 * era's touch is the shader over the frame (showcase.css).
 */
function lookFor(era: string, scene: SceneId): CaseLook {
  if (era === "1970") return "phosphor";
  if (scene.startsWith("spera-")) return era === "2026" ? "product-light" : "product-dark";
  return "product-light";
}

/**
 * Whether the work is drawn in the era's medium or as the product really
 * looks. The reading pages ask for the real look: the page around the work
 * belongs to the era, the work itself does not.
 */
const RealLook = createContext(false);

export function RealAssets({ children }: { readonly children: ReactNode }) {
  // While such a page is up, the era's full-screen shell keeps its lines off the pictures.
  useEffect(() => {
    document.documentElement.setAttribute("data-real-assets", "");
    return () => document.documentElement.removeAttribute("data-real-assets");
  }, []);
  return <RealLook.Provider value={true}>{children}</RealLook.Provider>;
}

function realLook(scene: SceneId): CaseLook {
  return scene.startsWith("spera-") ? "product-dark" : "product-light";
}

/** Scenes with a script: they play once as they come into view, and Replay plays them again. */
const PLAYS = new Set<SceneId>(["spera-workspace", "spera-deck", "spera-gold", "spera-loop", "spera-ship"]);

export function ShowcaseScene({ scene, shot, title, still }: { scene: SceneId; shot?: Shot; title: string; still?: boolean }) {
  const { currentEraId } = useDesignEra();
  const real = useContext(RealLook);
  const [take, setTake] = useState(0);
  const plays = !still && !shot && PLAYS.has(scene);
  return (
    <>
      <CaseScene key={take} scene={scene} shot={shot} title={title} look={real ? realLook(scene) : lookFor(currentEraId, scene)} still={still} />
      {plays ? (
        <button type="button" className="ws-replay" onClick={() => setTake((n) => n + 1)} aria-label={`Replay: ${title}`}>
          <span aria-hidden>↺</span> Replay
        </button>
      ) : null}
    </>
  );
}
