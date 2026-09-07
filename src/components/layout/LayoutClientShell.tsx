"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ModuleOverlayHost } from "@/components/modules/ModuleOverlay";
import { Navbar } from "./Navbar";
import AppLoader from "@/components/ui/app-loader";
import DetectiveStoryWrapper from "./DetectiveStoryWrapper";
import SketchDigitalSplitLayout from "./SketchDigitalSplitLayout";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { EraShell } from "@/components/era-shell/EraShell";

const CustomCursor = dynamic(() => import("@/components/ui/CustomCursor"), {
  ssr: false,
});

const HelpBot = dynamic(
  () =>
    import("@/components/ui/HelpBot").then((m) => ({ default: m.HelpBot })),
  { ssr: false },
);

interface LayoutClientShellProps {
  readonly children: React.ReactNode;
}

import { USE_KIRUK_HAND } from "@/lib/sketch-ink/config";

export default function LayoutClientShell({ children }: Readonly<LayoutClientShellProps>) {
  const pathname = usePathname();
  const { isSplitMode } = useLayoutMode();

  // Studio is a pen-and-paper desk — no era chrome, scanlines, or portfolio nav.
  const isStudio = pathname?.startsWith("/studio") ?? false;

  // Paper skin tokens must live on <html> so portaled dock / Page / ctx inherit them.
  useEffect(() => {
    if (!isStudio) return
    const root = document.documentElement
    root.setAttribute("data-notebook-skin", "paper")
    return () => {
      root.removeAttribute("data-notebook-skin")
    }
  }, [isStudio])

  // Nav bar removed; module triggers live inline in the era content. Archetypes
  // own their top padding, so the shell adds none.
  const mainPaddingTop = isSplitMode ? "0" : "var(--page-top-pad, 0px)";

  // Full-screen splash blocks first paint → set NEXT_PUBLIC_SPLASH_LOADER=false on prod for stronger LCP/Lighthouse.
  const splashLoaderEnabled =
    process.env.NEXT_PUBLIC_SPLASH_LOADER !== "false";

  if (isStudio) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="studio-desk min-h-screen"
        data-kiruk-hand={USE_KIRUK_HAND ? "true" : "false"}
        data-notebook-skin="paper"
      >
        {children}
      </main>
    );
  }

  return (
    <>
      <CustomCursor />
      <AppLoader enableLoader={splashLoaderEnabled} loadingDuration={400}>
      {/* Skip Links for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:text-sm focus:no-underline"
      >
        Skip to main content
      </a>

      {/* Persistent site navbar (modules + era switcher) */}
      <Navbar />

      {/* Module fullscreen overlays — triggers live inline in each era's content */}
      <ModuleOverlayHost />

      <SketchDigitalSplitLayout>
        <DetectiveStoryWrapper>
          <main
            id="main-content"
            tabIndex={-1}
            style={{
              // Split panes are already offset; skip dock padding to avoid a blank band.
              paddingTop: mainPaddingTop,
            }}
          >
            {children}
          </main>
        </DetectiveStoryWrapper>
      </SketchDigitalSplitLayout>

      {/* Help Bot - Available on all pages */}
      <HelpBot />

      {/* Era-specific atmospheric shell layer (scanlines, glass, etc) */}
      <EraShell />
      </AppLoader>
    </>
  );
}
