"use client";

import { useId, useState, type ReactNode } from "react";

type MarkProps = {
  children?: ReactNode;
  /** Paint the highlighter on load. Click still toggles. */
  lit?: boolean;
};

function usePin(lit: boolean) {
  const [on, setOn] = useState(lit);
  return {
    on,
    toggle: () => setOn((v) => !v),
  };
}

/** Highlighter wash. Hover shows a ring; click keeps the paint. */
export function Mark({ children, lit = false }: MarkProps) {
  const pin = usePin(lit);
  return (
    <button
      type="button"
      className="era-mark"
      data-on={pin.on ? "1" : undefined}
      aria-pressed={pin.on}
      title="Keep this highlighted"
      onClick={pin.toggle}
    >
      {children}
    </button>
  );
}

/** Smooth zigzag underline. Hover draws it; click keeps it. */
export function Zig({ children, lit = false }: MarkProps) {
  const pin = usePin(lit);
  const uid = useId().replace(/:/g, "");
  return (
    <button
      type="button"
      className="era-zig"
      data-on={pin.on ? "1" : undefined}
      aria-pressed={pin.on}
      title="Draw a zigzag"
      onClick={pin.toggle}
    >
      <span className="era-zig-text">{children}</span>
      <svg className="era-zig-line" viewBox="0 0 120 8" preserveAspectRatio="none" aria-hidden>
        <defs>
          <pattern id={`era-zig-${uid}`} patternUnits="userSpaceOnUse" width="16" height="8">
            <path d="M0 5 Q4 1 8 5 T16 5" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
          </pattern>
        </defs>
        <rect className="era-zig-stroke" x="0" y="0" width="120" height="8" fill={`url(#era-zig-${uid})`} />
      </svg>
    </button>
  );
}

/** Whole sentence you can tap to keep a highlight. */
export function Hit({ children, lit = false }: MarkProps) {
  const pin = usePin(lit);
  return (
    <button
      type="button"
      className="era-hit"
      data-on={pin.on ? "1" : undefined}
      aria-pressed={pin.on}
      title="Keep this sentence"
      onClick={pin.toggle}
    >
      {children}
    </button>
  );
}
