"use client";

/**
 * RouteModuleShell — fullscreen module-style overlay for dedicated routes
 * (e.g. /case-studies). Matches ModuleOverlay chrome: top bar, Esc to close,
 * body scroll-lock. Portaled to document.body at z-[120].
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useModuleA11y } from "./useModuleA11y";

interface RouteModuleShellProps {
  icon: string;
  label: string;
  children: React.ReactNode;
}

export function RouteModuleShell({ icon, label, children }: RouteModuleShellProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  useModuleA11y(mounted, panelRef, close);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[120]">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className="pointer-events-auto absolute inset-0 flex flex-col overflow-hidden focus-visible:outline-none"
        style={{
          background: "var(--bg-main)",
          color: "var(--text-main)",
        }}
      >
        <div
          className="relative z-[60] flex shrink-0 items-center justify-between border-b px-5 py-3 sm:px-8"
          style={{
            borderColor: "var(--border-color)",
            background: "color-mix(in srgb, var(--bg-card) 70%, transparent)",
            backdropFilter: "blur(6px)",
          }}
        >
          <span className="flex items-center gap-2.5">
            <span className="text-[18px] leading-none" style={{ color: "var(--accent-color)" }}>
              {icon}
            </span>
            <span
              className="text-sm font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: "var(--font-main)" }}
            >
              {label}
            </span>
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="Cancel (Esc)"
            className="rounded-[var(--era-radius-sm,4px)] px-2.5 py-1 text-xs font-medium transition-colors hover:bg-[color-mix(in_srgb,var(--text-main)_6%,transparent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-color)]"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-main)" }}
          >
            Cancel
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
