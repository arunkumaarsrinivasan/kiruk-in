"use client";

/**
 * EraTimeMachine — the era picker, wherever it is opened from (the navbar's
 * eye, the home's "Travel eras", Ctrl+Shift+E, `?module=eras`).
 *
 * It is the loader's own eye with the network that makes it laid out around
 * it (EraEyePicker). Choosing there only looks; `onEraSelect` fires when the
 * visitor enters an era by clicking the eye.
 */

import React from "react";
import { useReducedMotion } from "framer-motion";
import { AVAILABLE_THEMES } from "@/data/portfolio-data";
import { EraEyePicker } from "./EraEyePicker";

export interface EraTimeMachineProps {
  isOpen: boolean;
  onClose: () => void;
  currentEraId: string;
  onEraSelect: (eraId: string) => void;
}

export const EraTimeMachine: React.FC<EraTimeMachineProps> = ({ isOpen, onClose, currentEraId, onEraSelect }) => {
  const reduced = useReducedMotion() ?? false;
  if (!isOpen) return null;
  return <EraEyePicker eras={AVAILABLE_THEMES} currentEraId={currentEraId} onUse={onEraSelect} onClose={onClose} reduce={reduced} />;
};

export default EraTimeMachine;
