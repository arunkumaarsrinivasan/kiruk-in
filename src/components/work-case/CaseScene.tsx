"use client";

import dynamic from "next/dynamic";
import { useMemo, type ComponentType } from "react";
import type { SceneId } from "@/data/work-cases";
import { sceneStyle, stageTheme, stageTokens, type CaseLook } from "./look";
import type { SceneLook, SceneProps } from "./scenes/types";
import "./work-case.css";

const spera = (name: keyof typeof import("./scenes/spera")) =>
  dynamic<SceneProps>(() => import("./scenes/spera").then((m) => m[name] as ComponentType<SceneProps>), { ssr: false, loading: () => null });
const other = (name: keyof typeof import("./scenes/others")) =>
  dynamic<SceneProps>(() => import("./scenes/others").then((m) => m[name] as ComponentType<SceneProps>), { ssr: false, loading: () => null });

const SCENES: Record<SceneId, ComponentType<SceneProps>> = {
  "spera-workspace": spera("SperaWorkspace"),
  "spera-spark": spera("SperaHero"),
  "spera-mark": spera("SperaMark"),
  "spera-graph": spera("SperaGraph"),
  "spera-deck": spera("SperaDeck"),
  "spera-gold": spera("SperaGold"),
  "spera-loop": spera("SperaLoop"),
  "spera-ship": spera("SperaShip"),
  "hp-trust": other("HpTrust"),
  "hp-mudra": other("HpMudra"),
  "hp-prints": other("HpPrints"),
  "hp-plc": other("HpPlc"),
  "sb-personas": other("SbPersonas"),
  "sb-research": other("SbResearch"),
  "sb-portfolio": other("SbPortfolio"),
  "sb-system": other("SbSystem"),
  "sb-ship": other("SbShip"),
};

export function useSceneLook(mode: CaseLook): SceneLook {
  return useMemo(() => ({ mode, theme: stageTheme(mode), tokens: stageTokens(mode), style: sceneStyle(mode) }), [mode]);
}

export interface Shot {
  src: string;
  alt: string;
}

/**
 * One chapter's picture: the real image when there is one, else its faux-UI
 * scene. Holds the stage's 560 × 340 shape either way, so the copy beside
 * it never jumps.
 */
export function CaseScene({ scene, shot, title, look, still, className }: { scene: SceneId; shot?: Shot; title: string; look: CaseLook; still?: boolean; className?: string }) {
  const sceneLook = useSceneLook(look);
  if (shot) {
    return (
      <figure className={`wc-shot ${className ?? ""}`} data-look={look} style={sceneLook.style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shot.src} alt={shot.alt} loading="lazy" decoding="async" />
      </figure>
    );
  }
  const Scene = SCENES[scene];
  return (
    <div className={`wc-scene ${className ?? ""}`} role="img" aria-label={`${title}, illustrated`}>
      <Scene look={sceneLook} still={still} />
    </div>
  );
}
