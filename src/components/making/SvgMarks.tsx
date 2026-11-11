"use client";

/**
 * The first eye, live: the SVG marks the loader showed in May 2026, one per
 * era, still following the pointer the way they did then.
 */

import { useMotionValue, useReducedMotion } from "framer-motion";
import { getEraEye } from "@/components/brand/eyes";

const SHOWN = ["1970", "1981", "1995", "2003", "2013", "2026"];

export function SvgMarks() {
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const reduce = useReducedMotion() ?? false;

  return (
    <div
      className="mk-marks mk-wide"
      onPointerMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        gx.set(Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)));
        gy.set(Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)));
      }}
      onPointerLeave={() => {
        gx.set(0);
        gy.set(0);
      }}
    >
      {SHOWN.map((id) => {
        const Eye = getEraEye(id);
        return (
          <figure key={id}>
            <div className="mk-marks__eye">
              <Eye gx={gx} gy={gy} reduce={reduce} live={!reduce} hovered={false} />
            </div>
            <figcaption>{id}</figcaption>
          </figure>
        );
      })}
    </div>
  );
}
