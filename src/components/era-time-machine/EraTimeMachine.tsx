"use client";

/**
 * EraTimeMachine — drop-in replacement for the legacy EyeTimelineOverlay.
 *
 * Props match EyeTimelineOverlay exactly so SimpleGameNav can swap imports
 * without further changes. Behaviour:
 *
 *  1. If the current era id has a registered archetype, render
 *     <ArchetypeComponent> inside <EraTransition> with a shared <EraNavRail>.
 *  2. Otherwise, render <EyeTimelineOverlay> (legacy data-driven view).
 *
 * That keeps the site working while archetypes ship one era at a time.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AVAILABLE_THEMES } from "@/data/portfolio-data";
import {
  getArchetypeForEra,
  getArchetypeOverrides,
  type EraArchetypeId,
} from "@/data/era-archetypes";
import { EyeTimelineOverlay } from "@/components/layout/EraTimelineOverlay";
import { CustomizationLab } from "@/components/ui/design-lab/CustomizationLab";
import type { EraSurfaceProps } from "./shared/EraSurface";
import { useEraKeys } from "./shared/useEraKeys";
import { EraTransition } from "./EraTransition";
import { EraNavRail } from "./EraNavRail";
import { TerminalArchetype } from "./archetypes/TerminalArchetype";
import { SpatialArchetype } from "./archetypes/SpatialArchetype";
import { XeroxArchetype } from "./archetypes/XeroxArchetype";
import { DocHtmlArchetype } from "./archetypes/DocHtmlArchetype";
import { MosaicArchetype } from "./archetypes/MosaicArchetype";
import { GeocitiesArchetype } from "./archetypes/GeocitiesArchetype";
import { FramesetArchetype } from "./archetypes/FramesetArchetype";
import { FlashSplashArchetype } from "./archetypes/FlashSplashArchetype";
import { Web2CandyArchetype } from "./archetypes/Web2CandyArchetype";
import { MicroblogArchetype } from "./archetypes/MicroblogArchetype";
import { IphoneSkeuArchetype } from "./archetypes/IphoneSkeuArchetype";
import { PinboardArchetype } from "./archetypes/PinboardArchetype";
import { BlockEditorArchetype } from "./archetypes/BlockEditorArchetype";
import { IssueTrackerArchetype } from "./archetypes/IssueTrackerArchetype";
import { AiNativeArchetype } from "./archetypes/AiNativeArchetype";
import { PromptUIArchetype } from "./archetypes/PromptUIArchetype";

/**
 * Registry of implemented archetypes. Add an entry here ONLY when the
 * archetype component is live and reviewed. Unregistered archetypes (or eras
 * with no archetype mapping at all) fall through to the legacy overlay.
 */
const ARCHETYPE_COMPONENTS: Partial<
  Record<EraArchetypeId, React.ComponentType<EraSurfaceProps>>
> = {
  terminal: TerminalArchetype,
  spatial: SpatialArchetype,
  "xerox-bitmap": XeroxArchetype,
  "doc-html": DocHtmlArchetype,
  mosaic: MosaicArchetype,
  geocities: GeocitiesArchetype,
  frameset: FramesetArchetype,
  "flash-splash": FlashSplashArchetype,
  "web2-candy": Web2CandyArchetype,
  microblog: MicroblogArchetype,
  "iphone-skeu": IphoneSkeuArchetype,
  pinboard: PinboardArchetype,
  "block-editor": BlockEditorArchetype,
  "issue-tracker": IssueTrackerArchetype,
  "ai-native": AiNativeArchetype,
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
  const [showLab, setShowLab] = useState(false);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    if (isOpen) {
      setSelectedEraId(currentEraId);
      setShowLab(false);
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
      if (id !== selectedEraId) {
        setSelectedEraId(id);
        onEraSelect(id);
      }
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

  const handleClose = useCallback(() => {
    if (showLab) {
      setShowLab(false);
      return;
    }
    onClose();
  }, [showLab, onClose]);

  useEraKeys({
    enabled: isOpen && !!archetypeId && !showLab,
    onPrev: goPrev,
    onNext: goNext,
    onClose: handleClose,
  });

  const ArchetypeComponent = archetypeId
    ? ARCHETYPE_COMPONENTS[archetypeId]
    : undefined;

  // ── Legacy fallback: no archetype registered → render existing overlay.
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
          {showLab ? (
            <div className="absolute inset-0 z-[110]">
              <CustomizationLab era={era} onClose={() => setShowLab(false)} />
            </div>
          ) : (
            <>
              <EraTransition
                era={era}
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
                    onPrev={goPrev}
                    onNext={goNext}
                    onSelect={selectEra}
                    onCustomize={() => setShowLab(true)}
                    onClose={onClose}
                    overrides={getArchetypeOverrides(activeEra.id)}
                  />
                )}
              />

              <EraNavRail
                eras={AVAILABLE_THEMES}
                era={era}
                selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
                onSelect={selectEra}
                onCustomize={() => setShowLab(true)}
              />

              <button
                type="button"
                onClick={onClose}
                aria-label="Close era time machine"
                className="absolute top-3 right-3 z-[70] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border backdrop-blur-sm"
                style={{
                  borderColor: `${era.colors.text}25`,
                  color: era.colors.text,
                  borderRadius: Math.min(era.designTokens.borderRadius, 6),
                  backgroundColor: `${era.colors.background}aa`,
                }}
              >
                ✕ Close
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EraTimeMachine;
