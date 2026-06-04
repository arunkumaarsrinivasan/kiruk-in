"use client";

/**
 * Registry of the multiverse eyes. Each era id maps to its bespoke renderer;
 * eras without one fall back to the plain brand eye.
 */

import React from "react";
import { motion } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";
import Eye1970 from "./Eye1970";
import Eye1981 from "./Eye1981";
import Eye1991 from "./Eye1991";
import Eye1993 from "./Eye1993";
import Eye1995 from "./Eye1995";
import Eye1997 from "./Eye1997";
import Eye2000 from "./Eye2000";
import Eye2003 from "./Eye2003";
import Eye2006 from "./Eye2006";
import Eye2009 from "./Eye2009";
import Eye2013 from "./Eye2013";
import Eye2018 from "./Eye2018";
import Eye2021 from "./Eye2021";
import Eye2023 from "./Eye2023";
import Eye2026 from "./Eye2026";

/** Fallback — the Kiruk brand eye, clean. */
export function EyeBrand({ gx, gy }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy);
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden>
      <circle cx={EYE.outer.cx} cy={EYE.outer.cy} r={EYE.outer.r} fill="none" stroke="#F2055C" strokeWidth="7" />
      <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="none" stroke="#1637F2" strokeWidth="7" />
      <path d={EYE.arc} fill="none" stroke="#BF0B80" strokeWidth="6" strokeLinecap="round" />
      <motion.circle r="12" fill="#F2A71B" cx={cx} cy={cy} />
    </svg>
  );
}

export const ERA_EYES: Record<string, React.ComponentType<EyeProps>> = {
  "1970": Eye1970,
  "1981": Eye1981,
  "1991": Eye1991,
  "1993": Eye1993,
  "1995": Eye1995,
  "1997": Eye1997,
  "2000": Eye2000,
  "2003": Eye2003,
  "2006": Eye2006,
  "2009": Eye2009,
  "2013": Eye2013,
  "2018": Eye2018,
  "2021": Eye2021,
  "2023": Eye2023,
  "2026": Eye2026,
};

export function getEraEye(eraId: string | null | undefined): React.ComponentType<EyeProps> {
  if (!eraId) return EyeBrand;
  return ERA_EYES[eraId] ?? EyeBrand;
}
