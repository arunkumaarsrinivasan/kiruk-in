"use client";

/**
 * UXProcessNav — an ADDED UX-process artifact (like the era's Empathy Map /
 * Card Sort sections), laid out as a bento. It holds the navigation: each tile
 * is a UX stage that opens its module as a full-screen experience and minimizes
 * back to the tile. Era-token themed so it blends with the era's own content;
 * it does not modify any existing section.
 */

import React, { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useModules, type ModuleId } from "@/contexts/ModuleContext";
import { useDesignEra } from "@/contexts/DesignEraContext";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

interface Station {
  module: ModuleId;
  stage: string;
  title: string;
  desc: string;
  icon: string;
  /** bento span classes */
  span?: string;
  feature?: boolean;
}

const STATIONS: Station[] = [
  {
    module: "era-story",
    stage: "00 · Context",
    title: "This Era",
    desc: "Why this screen looks the way it does — the interface history and the reason behind every choice.",
    icon: "❖",
    span: "sm:col-span-2 sm:row-span-2",
    feature: true,
  },
  {
    module: "work",
    stage: "03 · Design",
    title: "Work",
    desc: "Projects — sorted, built, shipped.",
    icon: "▦",
    span: "sm:row-span-2",
  },
  {
    module: "about",
    stage: "01 · Discover",
    title: "About",
    desc: "The persona behind the work.",
    icon: "☺",
  },
  {
    module: "progress",
    stage: "02 · Journey",
    title: "Progress",
    desc: "Career as a user journey.",
    icon: "▲",
  },
  {
    module: "contact",
    stage: "04 · Deliver",
    title: "Contact",
    desc: "Start a session — usability-test the connection.",
    icon: "✉",
    span: "sm:col-span-2",
  },
  {
    module: "blog",
    stage: "05 · Reflect",
    title: "Blog",
    desc: "Field notes, essays, the process journal.",
    icon: "✎",
  },
];

export function UXProcessNav() {
  const reduce = useReducedMotion();
  const { currentEra } = useDesignEra();
  const { open } = useModules();

  const openFrom = (module: ModuleId, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    open(module, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  return (
    <section
      data-ux-process
      aria-label="Navigate — the UX process"
      className="relative w-full px-5 py-14 sm:px-8"
      style={{
        background: "var(--bg-main)",
        color: "var(--text-main)",
        fontFamily: "var(--font-main)",
        borderTop: "1px solid color-mix(in srgb, var(--border-color) 60%, transparent)",
      }}
    >
      <div className="mx-auto max-w-4xl">
        {/* compact artifact header — matches the era's other section headers */}
        <motion.div
          className="mb-5 flex flex-wrap items-end justify-between gap-3"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          <div className="flex flex-col gap-1">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.28em]"
              style={{ color: "var(--accent-color)" }}
            >
              Navigate · the UX process
            </span>
            <h2
              className="text-2xl font-bold leading-tight sm:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Continue the study
            </h2>
          </div>
          {/* era-travel — sits in the header, opens the time machine */}
          <button
            type="button"
            onClick={(e) => openFrom("eras", e.currentTarget)}
            data-station="eras"
            aria-label="Travel all eras — open the time machine"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-transform hover:-translate-y-0.5 focus-visible:outline-none"
            style={{
              border: "1px solid var(--border-color)",
              borderRadius: "var(--era-radius-full, 999px)",
              background: "color-mix(in srgb, var(--accent-color) 10%, transparent)",
              color: "var(--accent-color)",
            }}
          >
            ◷ Travel eras
          </button>
        </motion.div>

        {/* bento */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:auto-rows-[minmax(116px,1fr)]">
          {STATIONS.map((s, i) => (
            <BentoTile
              key={s.module}
              station={s}
              index={i}
              reduce={!!reduce}
              onOpen={openFrom}
            />
          ))}
        </div>

        <p className="mt-4 text-[11px]" style={{ color: "var(--text-muted)" }}>
          Tap a tile — it opens full-screen. Close (or Esc) drops you back here,
          in {currentEra.name}.
        </p>
      </div>
    </section>
  );
}

function BentoTile({
  station,
  index,
  reduce,
  onOpen,
}: {
  station: Station;
  index: number;
  reduce: boolean;
  onOpen: (m: ModuleId, el: HTMLElement) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={() => ref.current && onOpen(station.module, ref.current)}
      data-station={station.module}
      aria-haspopup="dialog"
      aria-label={`${station.title} — ${station.desc}`}
      className={`group/st relative flex flex-col items-start gap-2 overflow-hidden p-4 text-left focus-visible:outline-none ${
        station.span ?? ""
      }`}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--era-radius-md, 10px)",
        color: "var(--text-main)",
        boxShadow: "var(--era-shadow, none)",
      }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.42,
        delay: reduce ? 0 : index * 0.05,
        ease: EASE_OUT,
      }}
      whileHover={reduce ? undefined : { y: -4 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
    >
      {/* accent sweep on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/st:opacity-100"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--accent-color) 12%, transparent), transparent 60%)",
        }}
      />

      <span className="relative flex w-full items-center justify-between">
        <span
          className="grid place-items-center rounded-[var(--era-radius-sm,6px)]"
          style={{
            width: station.feature ? 48 : 36,
            height: station.feature ? 48 : 36,
            border: "1px solid var(--border-color)",
            background: "color-mix(in srgb, var(--accent-color) 10%, transparent)",
            color: "var(--accent-color)",
            fontSize: station.feature ? 22 : 17,
          }}
        >
          {station.icon}
        </span>
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: "var(--text-muted)" }}
        >
          {station.stage}
        </span>
      </span>

      <span className="relative flex items-baseline gap-2">
        <span
          className={`font-bold ${station.feature ? "text-2xl" : "text-lg"}`}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {station.title}
        </span>
        <span
          className="text-sm opacity-50 transition-all duration-200 group-hover/st:translate-x-1 group-hover/st:opacity-100"
          style={{ color: "var(--accent-color)" }}
          aria-hidden
        >
          ⤢
        </span>
      </span>

      <span
        className={`relative leading-relaxed ${
          station.feature ? "text-sm" : "text-[12px]"
        }`}
        style={{ color: "var(--text-muted)" }}
      >
        {station.desc}
      </span>

      <span
        aria-hidden
        className="relative mt-auto h-0.5 w-6 rounded-full transition-all duration-300 group-hover/st:w-12"
        style={{ background: "var(--accent-color)", opacity: 0.7 }}
      />
    </motion.button>
  );
}

export default UXProcessNav;
