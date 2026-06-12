"use client";

import { useEffect, useMemo, useState } from "react";
import { portfolioData } from "@/data/portfolio-data";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { blendDesktop, nearestDesktopId } from "./desktop-eras";
import { TerminalDesktop } from "./TerminalDesktop";
import { BitmapDesktop } from "./desktops/BitmapDesktop";
import { NextDesktop } from "./desktops/NextDesktop";
import { Win31Desktop } from "./desktops/Win31Desktop";
import { Win95Desktop } from "./desktops/Win95Desktop";
import { MacOS8Desktop } from "./desktops/MacOS8Desktop";
import { Win2000Desktop } from "./desktops/Win2000Desktop";
import { WinXpDesktop } from "./desktops/WinXpDesktop";
import { AquaDesktop } from "./desktops/AquaDesktop";
import { Win7Desktop } from "./desktops/Win7Desktop";
import { FlatDesktop } from "./desktops/FlatDesktop";
import { ModernDesktop } from "./desktops/ModernDesktop";
import { Win11Desktop } from "./desktops/Win11Desktop";
import { VisionDesktop } from "./desktops/VisionDesktop";
import { AiDesktop } from "./desktops/AiDesktop";

/** Only the case-study projects (exclude experience/skill records). */
const PROJECTS = portfolioData.projects;

export function WorkOS() {
  const { currentEra, currentEraId } = useDesignEra();
  const desktopId = useMemo(() => nearestDesktopId(currentEraId), [currentEraId]);

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

  const renderDesktop = () => {
    switch (desktopId) {
      case "term70":
        return <TerminalDesktop era={era} projects={PROJECTS} />;
      case "gui84":
        return <BitmapDesktop era={era} projects={PROJECTS} />;
      case "next91":
        return <NextDesktop era={era} projects={PROJECTS} />;
      case "win31":
        return <Win31Desktop era={era} projects={PROJECTS} />;
      case "win95":
        return <Win95Desktop era={era} projects={PROJECTS} />;
      case "macos8":
        return <MacOS8Desktop era={era} projects={PROJECTS} />;
      case "win2k":
        return <Win2000Desktop era={era} projects={PROJECTS} />;
      case "winxp":
        return <WinXpDesktop era={era} projects={PROJECTS} />;
      case "aqua06":
        return <AquaDesktop era={era} projects={PROJECTS} />;
      case "win7":
        return <Win7Desktop era={era} projects={PROJECTS} />;
      case "flat15":
        return <FlatDesktop era={era} projects={PROJECTS} />;
      case "modern18":
        return <ModernDesktop era={era} projects={PROJECTS} />;
      case "win11":
        return <Win11Desktop era={era} projects={PROJECTS} />;
      case "vision23":
        return <VisionDesktop era={era} projects={PROJECTS} />;
      case "ai26":
        return <AiDesktop era={era} projects={PROJECTS} />;
      default:
        return <TerminalDesktop era={era} projects={PROJECTS} />;
    }
  };

  return (
    <div className="h-full min-h-0" style={{ background: era.tokens.wallpaper }}>
      {renderDesktop()}
    </div>
  );
}

export default WorkOS;
