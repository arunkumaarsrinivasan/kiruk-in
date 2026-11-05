"use client";

import { useState } from "react";
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

/** Scenes with a script: they play once as they come into view, and Replay plays them again. */
const PLAYS = new Set<SceneId>(["spera-workspace", "spera-deck", "spera-gold", "spera-loop", "spera-ship"]);

export function ShowcaseScene({ scene, shot, title, still }: { scene: SceneId; shot?: Shot; title: string; still?: boolean }) {
  const { currentEraId } = useDesignEra();
  const [take, setTake] = useState(0);
  const plays = !still && !shot && PLAYS.has(scene);
  return (
    <>
      <CaseScene key={take} scene={scene} shot={shot} title={title} look={lookFor(currentEraId, scene)} still={still} />
      {plays ? (
        <button type="button" className="ws-replay" onClick={() => setTake((n) => n + 1)} aria-label={`Replay: ${title}`}>
          <span aria-hidden>↺</span> Replay
        </button>
      ) : null}
    </>
  );
}
