import { useEffect } from "react";

export interface UseEraNavigationOptions {
  enabled: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

/** Arrow keys navigate eras; Escape closes (or dismisses lab via caller's onClose). */
export function useEraNavigation({
  enabled,
  onPrev,
  onNext,
  onClose,
}: UseEraNavigationOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    globalThis.addEventListener("keydown", onKeyDown);
    return () => globalThis.removeEventListener("keydown", onKeyDown);
  }, [enabled, onPrev, onNext, onClose]);
}
