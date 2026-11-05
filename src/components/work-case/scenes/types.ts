import type { CSSProperties } from "react";
import type { LookTokens, Theme } from "@/components/stageshow";
import type { CaseLook } from "../look";

export interface SceneLook {
  mode: CaseLook;
  theme: Theme;
  tokens: LookTokens;
  /** The product's `--sp-*` roles for the scene root. */
  style: CSSProperties;
}

export interface SceneProps {
  readonly look: SceneLook;
  /** Show the payoff frame only, no script (a thumbnail, a list). */
  readonly still?: boolean;
}
