"use client";

/**
 * EraTimeMachine — drop-in replacement for the legacy EyeTimelineOverlay.
 *
 * Props match EyeTimelineOverlay exactly so SimpleGameNav can swap imports
 * without further changes. Behaviour:
 *
 *  1. If the current era id has a registered archetype, render
 *     <ArchetypeComponent> inside <EraTransition> with unified chrome.
 *  2. Otherwise, render <EyeTimelineOverlay> (legacy data-driven view).
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AVAILABLE_THEMES } from "@/data/portfolio-data";
import {
  getArchetypeForEra,
  getArchetypeOverrides,
  type EraArchetypeId,
} from "@/data/era-archetypes";
import { EyeTimelineOverlay } from "@/components/layout/EraTimelineOverlay";
import type { EraSurfaceProps } from "./shared/EraSurface";
import { useEraNavigation } from "./shared/useEraNavigation";
import { EraTransition } from "./EraTransition";
import { EraTimeMachineChrome } from "./EraTimeMachineChrome";
import { TerminalArchetype } from "./archetypes/TerminalArchetype";
import { XeroxArchetype } from "./archetypes/XeroxArchetype";
import { DocHtmlArchetype } from "./archetypes/DocHtmlArchetype";
import { GeocitiesArchetype } from "./archetypes/GeocitiesArchetype";
import { FramesetArchetype } from "./archetypes/FramesetArchetype";
import { FlashSplashArchetype } from "./archetypes/FlashSplashArchetype";
import { Web2CandyArchetype } from "./archetypes/Web2CandyArchetype";
import { IphoneSkeuArchetype } from "./archetypes/IphoneSkeuArchetype";
import { PinboardArchetype } from "./archetypes/PinboardArchetype";
import { PromptUIArchetype } from "./archetypes/PromptUIArchetype";

const ARCHETYPE_COMPONENTS: Partial<
  Record<EraArchetypeId, React.ComponentType<EraSurfaceProps>>
> = {
  terminal: TerminalArchetype,
  "xerox-bitmap": XeroxArchetype,
  "doc-html": DocHtmlArchetype,
  geocities: GeocitiesArchetype,
  frameset: FramesetArchetype,
  "flash-splash": FlashSplashArchetype,
  "web2-candy": Web2CandyArchetype,
  "iphone-skeu": IphoneSkeuArchetype,
  pinboard: PinboardArchetype,
  "prompt-ui": PromptUIArchetype,
};

export interface EraTimeMachineProps {
  isOpen: boolean;
  onClose: () => void;
  currentEraId: string;
  onEraSelect: (eraId: string) => void;
}

export const EraTimeMachine: React.FC<EraTimeMachineProps> = ({
  isOpen,
  onClose,
  currentEraId,
  onEraSelect,
}) => {
  const [selectedEraId, setSelectedEraId] = useState(currentEraId);
  const [direction, setDirection] = useState(0);
  const lastIndexRef = useRef(
    AVAILABLE_THEMES.findIndex((e) => e.id === currentEraId),
  );
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    if (isOpen) {
      const idx = AVAILABLE_THEMES.findIndex((e) => e.id === currentEraId);
      setSelectedEraId(currentEraId);
      lastIndexRef.current = idx >= 0 ? idx : 0;
      setDirection(0);
    }
  }, [isOpen, currentEraId]);

  const selectedIndex = AVAILABLE_THEMES.findIndex(
    (e) => e.id === selectedEraId,
  );
  const era =
    AVAILABLE_THEMES[selectedIndex >= 0 ? selectedIndex : 0] ??
    AVAILABLE_THEMES[0];
  const prevEra = selectedIndex > 0 ? AVAILABLE_THEMES[selectedIndex - 1] : null;
  const nextEra =
    selectedIndex >= 0 && selectedIndex < AVAILABLE_THEMES.length - 1
      ? AVAILABLE_THEMES[selectedIndex + 1]
      : null;

  const archetypeId = useMemo(
    () => getArchetypeForEra(era.id),
    [era.id],
  );

  const selectEra = useCallback(
    (id: string) => {
      if (id === selectedEraId) return;
      const newIndex = AVAILABLE_THEMES.findIndex((e) => e.id === id);
      if (newIndex >= 0) {
        setDirection(newIndex > lastIndexRef.current ? 1 : -1);
        lastIndexRef.current = newIndex;
      }
      setSelectedEraId(id);
      onEraSelect(id);
    },
    [selectedEraId, onEraSelect],
  );

  const goPrev = useCallback(() => {
    if (selectedIndex > 0) selectEra(AVAILABLE_THEMES[selectedIndex - 1].id);
  }, [selectedIndex, selectEra]);

  const goNext = useCallback(() => {
    if (selectedIndex < AVAILABLE_THEMES.length - 1)
      selectEra(AVAILABLE_THEMES[selectedIndex + 1].id);
  }, [selectedIndex, selectEra]);

  useEraNavigation({
    enabled: isOpen && !!archetypeId,
    onPrev: goPrev,
    onNext: goNext,
    onClose,
  });

  const ArchetypeComponent = archetypeId
    ? ARCHETYPE_COMPONENTS[archetypeId]
    : undefined;

  if (!ArchetypeComponent) {
    return (
      <EyeTimelineOverlay
        isOpen={isOpen}
        onClose={onClose}
        currentEraId={currentEraId}
        onEraSelect={onEraSelect}
      />
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={
            reduced
              ? { opacity: 0 }
              : { opacity: 0, clipPath: "circle(0% at 50% 0%)", scale: 1.04 }
          }
          animate={
            reduced
              ? { opacity: 1 }
              : { opacity: 1, clipPath: "circle(150% at 50% 0%)", scale: 1 }
          }
          exit={
            reduced
              ? { opacity: 0 }
              : { opacity: 0, clipPath: "circle(0% at 50% 0%)", scale: 1.04 }
          }
          transition={{ duration: reduced ? 0.2 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] overflow-hidden"
        >
          <EraTimeMachineChrome
            era={era}
            eras={AVAILABLE_THEMES}
            selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
            total={AVAILABLE_THEMES.length}
            prevEra={prevEra}
            nextEra={nextEra}
            onClose={onClose}
            onPrev={goPrev}
            onNext={goNext}
            onSelect={selectEra}
          >
            <EraTransition
              era={era}
              direction={direction}
              reduceMotion={reduced}
              render={(activeEra, phase) => (
                <ArchetypeComponent
                  era={activeEra}
                  prevEra={prevEra}
                  nextEra={nextEra}
                  allEras={AVAILABLE_THEMES}
                  index={selectedIndex}
                  total={AVAILABLE_THEMES.length}
                  phase={phase}
                  reduceMotion={reduced}
                  embedMode
                  onPrev={goPrev}
                  onNext={goNext}
                  onSelect={selectEra}
                  onClose={onClose}
                  overrides={getArchetypeOverrides(activeEra.id)}
                />
              )}
            />
          </EraTimeMachineChrome>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EraTimeMachine;
