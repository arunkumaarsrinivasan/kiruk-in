import type { ThemeConfig } from "@/data/portfolio-data";
import type { EraArchetypeOverrides } from "@/data/era-archetypes";

/**
 * Lifecycle phase passed to an archetype while EraTransition orchestrates
 * between-era boot/shutdown. Archetypes use this to play exit / enter
 * animations and to suppress heavy work while another era is mounting.
 */
export type EraPhase = "entering" | "active" | "exiting";

/**
 * Universal contract every archetype implements.
 *
 * Each archetype receives the era data, navigation API and lifecycle phase.
 * It owns layout, controls, motion and atmospheric layers — the dispatcher
 * does NOT impose chrome.
 */
export interface EraSurfaceProps {
  era: ThemeConfig;
  prevEra: ThemeConfig | null;
  nextEra: ThemeConfig | null;
  allEras: ThemeConfig[];
  index: number;
  total: number;
  phase: EraPhase;
  reduceMotion: boolean;

  onPrev: () => void;
  onNext: () => void;
  onSelect: (eraId: string) => void;
  onClose: () => void;

  /** When true, EraTimeMachineChrome owns close/era transport UI. */
  embedMode?: boolean;

  overrides: EraArchetypeOverrides;
}
