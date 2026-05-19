"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { getChromeFamily, CHROME_FAMILY_META } from "@/data/era-chrome-config";

/**
 * Era Machine — bottom-mounted filmstrip that lets users scrub through
 * design eras. Click an era card → fires `setEra` which triggers the
 * shared crossfade transition + chrome family overlay.
 */
export function EraFilmstrip() {
  const { eras, currentEra, currentEraId, setEra } = useDesignEra();
  const [expanded, setExpanded] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Order eras chronologically by id (ids are years as strings; "custom" sinks to the end)
  const sortedEras = useMemo(() => {
    const byYear = [...eras].sort((a, b) => {
      const ya = parseInt(a.id, 10);
      const yb = parseInt(b.id, 10);
      if (Number.isNaN(ya) && Number.isNaN(yb)) return 0;
      if (Number.isNaN(ya)) return 1;
      if (Number.isNaN(yb)) return -1;
      return ya - yb;
    });
    return byYear;
  }, [eras]);

  // Auto-scroll the active era into view when it changes
  useEffect(() => {
    if (!expanded || !activeRef.current || !trackRef.current) return;
    activeRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [currentEraId, expanded]);

  const currentFamily = getChromeFamily(currentEraId);
  const currentFamilyMeta = CHROME_FAMILY_META[currentFamily];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[120] pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-center gap-2">
        {/* Expanded filmstrip */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative"
              style={{
                backgroundColor: "var(--bg-card, #111)",
                border: `1px solid ${currentEra.colors.accent}40`,
                boxShadow: `0 10px 40px rgba(0,0,0,0.35)`,
                padding: 8,
              }}
            >
              {/* Family label */}
              <div
                className="absolute -top-6 left-0 text-[10px] font-mono uppercase tracking-[0.3em]"
                style={{ color: currentEra.colors.accent }}
              >
                {currentFamilyMeta.label} · {currentFamilyMeta.decade}
              </div>

              <div
                ref={trackRef}
                className="flex gap-2 overflow-x-auto scrollbar-thin pb-1"
                style={{ maxWidth: "min(90vw, 720px)" }}
              >
                {sortedEras.map((era) => {
                  const active = era.id === currentEraId;
                  return (
                    <button
                      key={era.id}
                      ref={active ? activeRef : null}
                      onClick={() => setEra(era.id)}
                      className="group relative flex-shrink-0 w-16 h-20 overflow-hidden transition-all"
                      style={{
                        backgroundColor: era.colors.background,
                        border: active
                          ? `2px solid ${era.colors.accent}`
                          : `1px solid ${era.colors.accent}55`,
                        transform: active ? "translateY(-4px)" : "none",
                        boxShadow: active
                          ? `0 6px 16px ${era.colors.accent}55`
                          : "none",
                      }}
                      aria-label={`Switch to ${era.name}`}
                      aria-pressed={active}
                    >
                      {/* Mini composition resembling the era */}
                      <div
                        className="absolute top-1 left-1 right-1 h-1"
                        style={{ backgroundColor: era.colors.accent, opacity: 0.85 }}
                      />
                      <div
                        className="absolute top-3 left-1 right-1 h-1"
                        style={{ backgroundColor: era.colors.primary, opacity: 0.45 }}
                      />
                      <div
                        className="absolute top-5 left-1 w-3 h-3"
                        style={{ backgroundColor: era.colors.accent, opacity: 0.6 }}
                      />
                      <div
                        className="absolute bottom-5 left-1 right-1 h-px"
                        style={{ backgroundColor: era.colors.text, opacity: 0.25 }}
                      />
                      {/* Year label */}
                      <div
                        className="absolute bottom-0 left-0 right-0 text-center py-0.5 text-[9px] font-mono font-bold"
                        style={{
                          backgroundColor: active
                            ? era.colors.accent
                            : `${era.colors.accent}30`,
                          color: active ? era.colors.background : era.colors.text,
                        }}
                      >
                        {era.id}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Era meta footer */}
              <div
                className="mt-2 px-1 text-[10px] font-mono"
                style={{ color: "var(--text-muted, #888)" }}
              >
                <span style={{ color: currentEra.colors.accent }}>
                  {currentEra.name}
                </span>
                {" · "}
                <span>{currentEra.era}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle dial */}
        <motion.button
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-2 px-3 h-9 font-mono text-[10px] uppercase tracking-[0.25em]"
          style={{
            backgroundColor: "var(--bg-card, #111)",
            color: currentEra.colors.accent,
            border: `1px solid ${currentEra.colors.accent}80`,
            boxShadow: `0 4px 14px rgba(0,0,0,0.25)`,
          }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          aria-expanded={expanded}
          aria-label="Toggle era machine"
        >
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: currentEra.colors.accent }}
          />
          ERA · {currentEra.id}
          <span className="opacity-60">{expanded ? "▾" : "▴"}</span>
        </motion.button>
      </div>
    </div>
  );
}

export default EraFilmstrip;
