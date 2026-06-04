"use client";

/**
 * Navbar — darkroom-style bar with a GEAR "time machine" era control.
 *
 * Left: eye + KIRUK® (opens the full era browser).
 * Center-right: WORK / CONTACT links + the time-machine chip (click → era
 * console). Picking an era plays the TimeTravelOverlay (the current era's
 * wireframe deconstructs component-by-component, the next era's wireframe
 * constructs, then the era is revealed). Right: Contact opens the contact module.
 *
 * Everything reads the active era's CSS vars, so the bar morphs as you travel.
 */

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useModules, type ModuleId, type OriginPoint } from "@/contexts/ModuleContext";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { KirukEye, KirukWordmark } from "@/components/brand/KirukLogo";
import { TimeMachine } from "@/components/layout/TimeMachine";
import { TimeTravelOverlay } from "@/components/layout/TimeTravelOverlay";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const LINKS: { label: string; id: ModuleId }[] = [
  { label: "Work", id: "work" },
  { label: "About", id: "about" },
  { label: "Read", id: "blog" },
  { label: "Contact", id: "contact" },
];

const eraLabel = (name: string) => {
  const [, ...rest] = name.split(":");
  return rest.join(":").trim() || name;
};

/** Nav module link — era tokens, no duplicate-label or magnetic motion. */
function NavLink({
  label,
  active,
  onClick,
}: Readonly<{
  label: string;
  active: boolean;
  onClick: (el: HTMLButtonElement) => void;
}>) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => ref.current && onClick(ref.current)}
      aria-label={label}
      aria-current={active ? "true" : undefined}
      className="group pointer-events-auto relative px-1 py-2 text-[11px] uppercase tracking-[0.18em] outline-none transition-colors duration-200 hover:text-[var(--accent-color)] focus-visible:text-[var(--accent-color)]"
      style={{ color: active ? "var(--accent-color)" : "var(--text-main)" }}
    >
      <span className="leading-none">{label}</span>
      <span
        aria-hidden
        className={`absolute -bottom-0.5 left-0 h-px w-full origin-left transition-transform duration-200 ease-out ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"}`}
        style={{ background: "var(--accent-color)" }}
      />
    </button>
  );
}

export function Navbar() {
  const { open, toggle, openId } = useModules();
  const { eras, currentEraId, setEra } = useDesignEra();
  const reduce = useReducedMotion();
  const barRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [travel, setTravel] = useState<{
    fromId: string;
    toId: string;
    oldColor: string;
    newColor: string;
    fromName: string;
    toName: string;
  } | null>(null);
  const travelRef = useRef<string | null>(null);

  const originFrom = useCallback((el: HTMLElement): OriginPoint => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, []);

  const openFromNav = useCallback(
    (id: ModuleId, el: HTMLButtonElement) => {
      setMenuOpen(false);
      open(id, originFrom(el));
    },
    [open, originFrom],
  );

  const accentOf = useCallback((id: string) => eras.find((e) => e.id === id)?.colors.accent ?? "#7c8aa0", [eras]);

  const onPick = useCallback(
    (id: string) => {
      if (id === currentEraId) return;
      const to = eras.find((x) => x.id === id);
      const from = eras.find((x) => x.id === currentEraId);
      travelRef.current = id;
      setTravel({
        fromId: currentEraId,
        toId: id,
        oldColor: accentOf(currentEraId),
        newColor: accentOf(id),
        fromName: from ? eraLabel(from.name) : currentEraId,
        toName: to ? eraLabel(to.name) : id,
      });
    },
    [accentOf, currentEraId, eras],
  );
  const onMid = useCallback(() => {
    if (travelRef.current) setEra(travelRef.current);
  }, [setEra]);
  const onDone = useCallback(() => {
    travelRef.current = null;
    setTravel(null);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    const publish = () => {
      const el = barRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      document.documentElement.style.setProperty("--simple-game-nav-bottom", `${Math.ceil(rect.bottom)}px`);
    };
    publish();
    const ro = new ResizeObserver(publish);
    if (barRef.current) ro.observe(barRef.current);
    window.addEventListener("resize", publish, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", publish);
    };
  }, [scrolled]);

  const fontMain = "var(--font-main, ui-sans-serif, system-ui)";

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[95]" role="banner">
        <motion.div ref={barRef} className="pointer-events-none w-full">
          <div
            className="pointer-events-auto flex items-center gap-4 px-5 transition-[height,background-color,box-shadow] duration-300 sm:px-8"
            style={{
              height: scrolled ? 54 : 64,
              fontFamily: fontMain,
              color: "var(--text-main)",
              // always-on, era-tinted frosted band so the nav reads on any era
              background: scrolled
                ? "color-mix(in srgb, var(--bg-main) 88%, transparent)"
                : "color-mix(in srgb, var(--bg-main) 68%, transparent)",
              backdropFilter: "blur(14px) saturate(1.15)",
              WebkitBackdropFilter: "blur(14px) saturate(1.15)",
              borderBottom: "1px solid color-mix(in srgb, var(--text-main) 12%, transparent)",
              boxShadow: scrolled ? "0 8px 30px color-mix(in srgb, var(--text-main) 14%, transparent)" : "none",
            }}
          >
            {/* LEFT — eye + wordmark → full era browser */}
            <motion.button
              type="button"
              onClick={() => toggle("eras")}
              aria-label="Kiruk — open era browser"
              className="group pointer-events-auto flex shrink-0 items-center gap-2.5 outline-none"
              whileHover={reduce ? undefined : { scale: 1.02 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
            >
              <KirukEye bare gaze />
              <span className="hidden items-start sm:flex">
                <KirukWordmark size={19} />
                <sup className="ml-0.5 text-[9px]" style={{ color: "var(--text-muted)" }}>
                  ®
                </sup>
              </span>
            </motion.button>

            <div className="flex-1" />

            {/* RIGHT — links + time machine + mobile menu */}
            <div className="flex shrink-0 items-center gap-4 sm:gap-5">
              <nav className="hidden items-center gap-5 md:flex">
                <NavLink label="Work" active={openId === "work"} onClick={(el) => openFromNav("work", el)} />
                <NavLink label="Contact" active={openId === "contact"} onClick={(el) => openFromNav("contact", el)} />
              </nav>

              <TimeMachine eras={eras} currentId={currentEraId} onPick={onPick} reduce={!!reduce} />

              {/* mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className="pointer-events-auto flex h-8 w-8 items-center justify-center md:hidden"
                style={{ color: "var(--text-main)" }}
              >
                <span className="relative block h-3 w-5">
                  <span className="absolute left-0 block h-px w-full transition-all duration-300" style={{ background: "currentColor", top: menuOpen ? "6px" : "1px", transform: menuOpen ? "rotate(45deg)" : "none" }} />
                  <span className="absolute left-0 top-[6px] block h-px w-full transition-opacity duration-200" style={{ background: "currentColor", opacity: menuOpen ? 0 : 1 }} />
                  <span className="absolute left-0 block h-px w-full transition-all duration-300" style={{ background: "currentColor", top: menuOpen ? "6px" : "11px", transform: menuOpen ? "rotate(-45deg)" : "none" }} />
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* MOBILE overlay menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="mobile-menu"
              className="pointer-events-auto fixed inset-0 z-[94] flex flex-col justify-center gap-1 px-8 md:hidden"
              style={{ background: "color-mix(in srgb, var(--bg-main) 94%, transparent)", fontFamily: fontMain }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
            >
              {[{ label: "Eras", id: "eras" as ModuleId }, ...LINKS].map((l, i) => (
                <motion.button
                  key={l.id}
                  type="button"
                  onClick={(e) => openFromNav(l.id, e.currentTarget)}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.3, ease: EASE_OUT }}
                  className="py-2 text-left text-3xl uppercase tracking-[0.06em]"
                  style={{ color: openId === l.id ? "var(--accent-color)" : "var(--text-main)" }}
                >
                  {l.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* TIME-TRAVEL transition */}
      <TimeTravelOverlay
        active={!!travel}
        fromId={travel?.fromId ?? ""}
        toId={travel?.toId ?? ""}
        oldColor={travel?.oldColor ?? "#888"}
        newColor={travel?.newColor ?? "#888"}
        fromName={travel?.fromName ?? ""}
        toName={travel?.toName ?? ""}
        onMid={onMid}
        onDone={onDone}
        reduce={!!reduce}
      />
    </>
  );
}

export default Navbar;
