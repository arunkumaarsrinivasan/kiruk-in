"use client";

/**
 * Navbar — darkroom-style bar with a GEAR "time machine" era control.
 *
 * Left: eye + KIRUK® always go Home (landing page).
 * Center-right: WORK / READ / ABOUT / CONTACT + the time-machine chip.
 * On /notebook, era picks route through notebook travel (`?era=`) instead of
 * the site-wide DesignEra swap — so reading stay on the article.
 * Contact is always /contact.
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { TimeMachine } from "@/components/layout/TimeMachine";
import { SiteHomeLink } from "@/components/layout/SiteHomeLink";
import { isNotebookPath } from "@/lib/paper-surface";
import { useEraTravelOptional } from "@/components/era-travel/EraTravelContext";
import { EraNavOverlay } from "@/components/era-nav-game/EraNavOverlay";
import { useNotebookEraOptional } from "@/components/notebook/NotebookEraContext";

const NAV_LINK =
  "site-nav-link group pointer-events-auto relative inline-flex min-h-11 items-center px-2 text-[11px] uppercase tracking-[0.18em] outline-none";

/** Route link — same visual language as NavLink, used for real pages. */
function NavHref({
  label,
  href,
  active,
  title,
}: Readonly<{
  label: string;
  href: string;
  active: boolean;
  title?: string;
}>) {
  return (
    <Link
      href={href}
      aria-label={title ?? label}
      title={title}
      aria-current={active ? "page" : undefined}
      className={NAV_LINK}
      style={{ color: active ? "var(--accent-color)" : "var(--nav-text)" }}
    >
      <span className="leading-none">{label}</span>
      <span
        aria-hidden
        className={`site-nav-link-line absolute -bottom-0.5 left-2 right-2 h-px origin-left transition-transform duration-200 ease-out ${active ? "scale-x-100" : "scale-x-0"}`}
        style={{ background: "var(--accent-color)" }}
      />
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const notebookOpen = isNotebookPath(pathname);
  const workOpen = !!pathname && (pathname === "/work" || pathname.startsWith("/work/"));
  const aboutOpen = pathname === "/about";
  const contactOpen = pathname === "/contact";
  const { eras, currentEraId } = useDesignEra();
  const travel = useEraTravelOptional();
  const notebook = useNotebookEraOptional();
  const reduce = useReducedMotion();
  const barRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const eraId = notebook?.eraId ?? currentEraId;
  const onPickEra = (id: string) => {
    if (notebook) notebook.pickEra(id);
    else travel?.travelTo(id);
  };

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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const fontMain = "var(--font-main, ui-sans-serif, system-ui)";

  return (
    <>
      <header id="site-header" className="site-chrome pointer-events-none fixed inset-x-0 top-0 z-[95]" role="banner">
        <motion.div ref={barRef} className="pointer-events-none w-full">
          <div
            className="pointer-events-auto flex items-center gap-4 px-5 transition-[height,background-color,box-shadow] duration-300 sm:px-8"
            style={{
              height: scrolled ? 54 : 64,
              fontFamily: fontMain,
              color: "var(--nav-text)",
              background: scrolled
                ? "color-mix(in srgb, var(--nav-surface) 97%, transparent)"
                : "color-mix(in srgb, var(--nav-surface) 95%, transparent)",
              backdropFilter: "blur(14px) saturate(1.15)",
              WebkitBackdropFilter: "blur(14px) saturate(1.15)",
              borderBottom: "1px solid color-mix(in srgb, var(--nav-text) 22%, transparent)",
              boxShadow: scrolled ? "0 8px 30px color-mix(in srgb, var(--nav-text) 12%, transparent)" : "none",
            }}
          >
            <SiteHomeLink />

            <div className="flex-1" />

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
                <NavHref label="Work" href="/work" active={workOpen} title="Work — selected projects" />
                <NavHref
                  label="Read"
                  href="/notebook"
                  active={notebookOpen}
                  title="Read — notebook and essays"
                />
                <NavHref label="About" href="/about" active={aboutOpen} title="About — story and background" />
                <NavHref label="Contact" href="/contact" active={contactOpen} title="Contact" />
              </nav>

              <TimeMachine eras={eras} currentId={eraId} onPick={onPickEra} reduce={!!reduce} />

              <button
                ref={menuBtnRef}
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="site-mobile-menu"
                className="pointer-events-auto relative z-[96] flex h-11 w-11 items-center justify-center md:hidden"
                style={{ color: "var(--nav-text)" }}
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

        <EraNavOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      </header>
    </>
  );
}

export default Navbar;
