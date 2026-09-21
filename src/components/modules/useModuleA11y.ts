"use client";

/**
 * useModuleA11y — dialog plumbing for an open module overlay: body scroll-lock,
 * focus trap, restore focus to the trigger on close, mark page content inert,
 * and Esc-to-close.
 */

import { useEffect } from "react";

export function useModuleA11y(
  active: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!active) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const main = document.getElementById("main-content");
    const chrome = document.querySelectorAll("#site-header, header[role='banner'], [role='banner']");
    main?.setAttribute("inert", "");
    chrome.forEach((el) => el.setAttribute("inert", ""));

    // Move focus into the overlay.
    const focusFirst = () => {
      const el = containerRef.current;
      if (!el) return;
      const focusable = el.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      (focusable ?? el).focus();
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const el = containerRef.current;
      if (!el) return;
      const nodes = Array.from(
        el.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((n) => !n.hasAttribute("disabled") && n.offsetParent !== null);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      main?.removeAttribute("inert");
      chrome.forEach((el) => el.removeAttribute("inert"));
      previouslyFocused?.focus?.();
    };
  }, [active, containerRef, onClose]);
}
