"use client";

import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";

const MIN_SCALE = 0.56;
/** Title + lede shrink completes over this much scroll from the top. */
const SCROLL_RANGE = 320;

function easeOutQuad(t: number) {
  return 1 - (1 - t) * (1 - t);
}

function setScale(el: HTMLElement, scale: number) {
  el.style.setProperty("--nb-heading-scale", String(scale));
}

/**
 * Taste-style scroll text transition for the article title and its lede only —
 * not section h2s or other body content. Left-origin scale keeps the column edge.
 */
export function NotebookHeadingScroll() {
  const reduce = useReducedMotion();

  useEffect(() => {
    const root =
      document.querySelector<HTMLElement>(".era-blog-surface .notebook-page article") ??
      document.querySelector<HTMLElement>(".era-blog-surface article");
    if (!root) return;

    let raf = 0;

    const pick = () => {
      const title = root.querySelector<HTMLElement>("h1.era-blog-title, h1.era-h1, header h1");
      const lede = root.querySelector<HTMLElement>("header .era-lede, header .era-article-head .era-lede");
      return { title, lede };
    };

    const tick = () => {
      raf = 0;
      const { title, lede } = pick();
      const scale = reduce
        ? 1
        : (() => {
            const y = window.scrollY || document.documentElement.scrollTop || 0;
            const t = Math.min(1, Math.max(0, y / SCROLL_RANGE));
            return 1 - easeOutQuad(t) * (1 - MIN_SCALE);
          })();

      if (title) setScale(title, scale);
      if (lede) setScale(lede, scale);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const mo = new MutationObserver(onScroll);
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mo.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return null;
}
