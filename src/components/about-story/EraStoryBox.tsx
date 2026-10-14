"use client";

/**
 * EraStoryBox — "who is Arun", embedded in every era's home page where the
 * persona section used to be. The navbar's About link lands here (/#about).
 */

import { useEffect, useRef } from "react";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { getStorySkin } from "./registry";
import { useStory } from "./use-story";

export function EraStoryBox({ variant = "embed", className }: { variant?: "embed" | "full"; className?: string }) {
  const { currentEra } = useDesignEra();
  const story = useStory();
  const Skin = getStorySkin(currentEra.id);
  const ref = useRef<HTMLElement>(null);

  // Era homes load behind next/dynamic, boot in stages, and the loader can
  // hold scrolling for a moment, so the browser's own jump to #about lands
  // short or not at all. Keep nudging the box into place until it stays put
  // (8s at most), and stop the moment the visitor scrolls on their own.
  useEffect(() => {
    if (variant !== "embed") return;
    let timer = 0;
    const stop = () => window.clearInterval(timer);
    const jump = () => {
      if (window.location.hash !== "#about") return;
      stop();
      const started = performance.now();
      let steady = 0;
      timer = window.setInterval(() => {
        const el = ref.current;
        if (!el || performance.now() - started > 8000) return stop();
        const off = el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).scrollMarginTop || "0");
        if (Math.abs(off) > 4) {
          steady = 0;
          el.scrollIntoView({ block: "start" });
        } else if (++steady >= 4) stop();
      }, 150);
    };
    jump();
    window.addEventListener("hashchange", jump);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    return () => {
      stop();
      window.removeEventListener("hashchange", jump);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [variant]);

  return (
    <section
      ref={ref}
      id={variant === "embed" ? "about" : undefined}
      aria-label="About Arun"
      data-blueprint="about-story"
      // Buttons keep the era font; some global styles reset it.
      className={`[&_button]:[font-family:inherit] ${className ?? ""}`}
      style={{ scrollMarginTop: "calc(var(--simple-game-nav-bottom, 56px) + 16px)" }}
    >
      <Skin story={story} variant={variant} />
    </section>
  );
}
