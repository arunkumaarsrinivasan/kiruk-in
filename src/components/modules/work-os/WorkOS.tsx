"use client";

import { MotionConfig } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { portfolioData } from "@/data/portfolio-data";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { blendDesktop, nearestDesktopId } from "./desktop-eras";
import type { DesktopId, DesktopProps } from "./types";
import "./work-os.css";

function desktop(
  load: () => Promise<{ default: ComponentType<DesktopProps> }>,
): ComponentType<DesktopProps> {
  return dynamic(load, { loading: () => null });
}

const DESKTOPS: Record<DesktopId, ComponentType<DesktopProps>> = {
  term70: desktop(() =>
    import("./TerminalDesktop").then((m) => ({ default: m.TerminalDesktop })),
  ),
  gui84: desktop(() =>
    import("./desktops/BitmapDesktop").then((m) => ({ default: m.BitmapDesktop })),
  ),
  next91: desktop(() =>
    import("./desktops/NextDesktop").then((m) => ({ default: m.NextDesktop })),
  ),
  win95: desktop(() =>
    import("./desktops/Win95Desktop").then((m) => ({ default: m.Win95Desktop })),
  ),
  macos8: desktop(() =>
    import("./desktops/MacOS8Desktop").then((m) => ({ default: m.MacOS8Desktop })),
  ),
  win2k: desktop(() =>
    import("./desktops/Win2000Desktop").then((m) => ({ default: m.Win2000Desktop })),
  ),
  winxp: desktop(() =>
    import("./desktops/WinXpDesktop").then((m) => ({ default: m.WinXpDesktop })),
  ),
  win7: desktop(() =>
    import("./desktops/Win7Desktop").then((m) => ({ default: m.Win7Desktop })),
  ),
  flat15: desktop(() =>
    import("./desktops/FlatDesktop").then((m) => ({ default: m.FlatDesktop })),
  ),
  ai26: desktop(() =>
    import("./desktops/AiDesktop").then((m) => ({ default: m.AiDesktop })),
  ),
};

/** Only the case-study projects (exclude experience/skill records). */
const PROJECTS = portfolioData.projects;

/** Desktops that would otherwise boot to an empty wallpaper: open the lead project so the first view is work. */
const BOOT_WITH_FEATURED: readonly DesktopId[] = ["next91"];

export function WorkOS({ focusId }: { readonly focusId?: string }) {
  const { currentEra, currentEraId } = useDesignEra();
  const desktopId = useMemo(() => nearestDesktopId(currentEraId), [currentEraId]);

  // Boot only once the host has real size. On routes the page can mount while
  // still hidden behind the era intro; windows placed in a 0px stage get their
  // drag offsets scaled off-screen when the stage later grows.
  const hostRef = useRef<HTMLDivElement>(null);
  const [sized, setSized] = useState(false);
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        setSized(true);
        ro.disconnect();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Match the desktop accent to whatever the rest of the site is showing.
  const [accent, setAccent] = useState<string>(currentEra.colors.accent);
  useEffect(() => {
    const read = () => {
      const v = getComputedStyle(document.body).getPropertyValue("--accent-color").trim();
      if (v) setAccent(v);
    };
    read();
    const raf = requestAnimationFrame(read);
    const obs = new MutationObserver(read);
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-era", "style", "class"] });
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, []);

  const era = useMemo(() => blendDesktop(desktopId, accent), [desktopId, accent]);
  const bootId = focusId ?? (BOOT_WITH_FEATURED.includes(desktopId) ? PROJECTS[0]?.id : undefined);

  const Desktop = DESKTOPS[desktopId] ?? DESKTOPS.term70;

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={hostRef}
        data-work-os=""
        className="h-full min-h-0"
        style={{ background: era.tokens.wallpaper, "--wos-focus": era.tokens.accent } as React.CSSProperties}
      >
        {sized ? (
          <Desktop era={era} projects={PROJECTS} focusId={bootId} />
        ) : null}
      </div>
    </MotionConfig>
  );
}

export default WorkOS;
