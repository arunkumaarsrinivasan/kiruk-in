"use client";

import { useEffect, useRef } from "react";

export function PhosphorCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) {
      el.style.display = "none";
      return;
    }
    const move = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest(".proto-picker, .proto-controls, input, textarea, select")) {
        el.style.opacity = "0";
        return;
      }
      el.style.opacity = "1";
      el.style.transform = `translate(${e.clientX + 1}px, ${e.clientY - 2}px)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return <div ref={ref} className="phos-cursor" aria-hidden><span /></div>;
}
