"use client";

/**
 * EraStoryContent — the "why this screen" module. Teaches the interface
 * history of the active era straight from its ThemeConfig (no new data):
 * description (what it is), lesson (why it mattered), heritage (lineage),
 * keyElements (signature traits). A prev/next ribbon doubles as a soft era
 * switcher. Fully era-token themed — one component, every era.
 */

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useDesignEra } from "@/contexts/DesignEraContext";

export default function EraStoryContent() {
  const { eras, currentEra, currentEraId, setEra } = useDesignEra();

  const { idx, prev, next } = useMemo(() => {
    const i = eras.findIndex((e) => e.id === currentEraId);
    return {
      idx: i,
      prev: i > 0 ? eras[i - 1] : null,
      next: i >= 0 && i < eras.length - 1 ? eras[i + 1] : null,
    };
  }, [eras, currentEraId]);

  return (
    <div
      className="mx-auto flex h-full w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-10"
      style={{ fontFamily: "var(--font-main)", color: "var(--text-main)" }}
    >
      <header className="flex flex-col gap-2">
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: "var(--accent-color)" }}
        >
          Interface History · {idx >= 0 ? idx + 1 : "—"} / {eras.length}
        </span>
        <h2
          className="text-3xl font-bold leading-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {currentEra.name}
        </h2>
        <p
          className="text-sm uppercase tracking-[0.18em]"
          style={{ color: "var(--text-muted)" }}
        >
          {currentEra.era}
        </p>
      </header>

      <Section label="What this screen is">{currentEra.description}</Section>
      <Section label="Why it mattered">{currentEra.lesson}</Section>
      <Section label="Heritage — echoes today">{currentEra.heritage}</Section>

      <div className="flex flex-col gap-2">
        <SectionLabel>Signature traits</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {currentEra.keyElements.map((k) => (
            <span
              key={k}
              className="rounded-[var(--era-radius-sm)] border px-2.5 py-1 text-xs"
              style={{
                borderColor: "var(--border-color)",
                background:
                  "color-mix(in srgb, var(--accent-color) 8%, transparent)",
              }}
            >
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* prev / next era ribbon — soft switcher */}
      <nav className="mt-auto flex items-center justify-between gap-3 pt-4">
        <RibbonButton
          dir="prev"
          era={prev}
          onClick={() => prev && setEra(prev.id)}
        />
        <RibbonButton
          dir="next"
          era={next}
          onClick={() => next && setEra(next.id)}
        />
      </nav>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[11px] font-semibold uppercase tracking-[0.22em]"
      style={{ color: "var(--accent-color)" }}
    >
      {children}
    </span>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-1.5">
      <SectionLabel>{label}</SectionLabel>
      <p
        className="text-[15px] leading-relaxed"
        style={{ lineHeight: "var(--era-line-height, 1.6)" }}
      >
        {children}
      </p>
    </section>
  );
}

function RibbonButton({
  dir,
  era,
  onClick,
}: {
  dir: "prev" | "next";
  era: { id: string; name: string } | null;
  onClick: () => void;
}) {
  if (!era)
    return <span className="flex-1" aria-hidden />;
  const isPrev = dir === "prev";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ x: isPrev ? -2 : 2 }}
      whileTap={{ scale: 0.97 }}
      className="flex flex-1 flex-col gap-0.5 rounded-[var(--era-radius-md)] border px-3 py-2 text-left focus-visible:outline-none"
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-card)",
        alignItems: isPrev ? "flex-start" : "flex-end",
        textAlign: isPrev ? "left" : "right",
      }}
    >
      <span
        className="text-[10px] uppercase tracking-[0.2em]"
        style={{ color: "var(--text-muted)" }}
      >
        {isPrev ? "← Earlier" : "Later →"}
      </span>
      <span className="text-sm font-semibold">{era.name}</span>
    </motion.button>
  );
}
