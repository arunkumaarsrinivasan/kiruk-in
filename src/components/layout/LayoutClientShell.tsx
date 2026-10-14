"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ModuleOverlayHost } from "@/components/modules/ModuleOverlay";
import { Navbar } from "./Navbar";
import { NavTrailProvider } from "./NavTrail";
import { EraTravelProvider } from "@/components/era-travel/EraTravelContext";
import AppLoader from "@/components/ui/app-loader";
import DetectiveStoryWrapper from "./DetectiveStoryWrapper";
import SketchDigitalSplitLayout from "./SketchDigitalSplitLayout";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { EraShell } from "@/components/era-shell/EraShell";
import { USE_KIRUK_HAND } from "@/lib/sketch-ink/config";
import { isDeskPath, isDeskPreviewPath, isNotebookPath } from "@/lib/paper-surface";

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

export default function LayoutClientShell({ children }: Readonly<LayoutClientShellProps>) {
  return (
    <NavTrailProvider>
      <ShellInner>{children}</ShellInner>
    </NavTrailProvider>
  );
}

function ShellInner({ children }: Readonly<LayoutClientShellProps>) {
  const pathname = usePathname();
  const { isSplitMode } = useLayoutMode();

  const isDesk = isDeskPath(pathname);
  const isNotebook = isNotebookPath(pathname);
  const isDeskPreview = isDeskPreviewPath(pathname);
  const isPaperDesk = isDesk && !isDeskPreview;
  const isProto = pathname.startsWith("/proto");

  // Paper skin tokens must live on <html> so portaled dock / Page / ctx inherit them.
  useEffect(() => {
    if (!isPaperDesk) return;
    const root = document.documentElement;
    root.setAttribute("data-notebook-skin", "paper");
    return () => {
      root.removeAttribute("data-notebook-skin");
    };
  }, [isPaperDesk]);

  // Nav bar removed; module triggers live inline in the era content. Archetypes
  // own their top padding, so the shell adds none.
  const mainPaddingTop = isSplitMode ? "0" : "var(--page-top-pad, 0px)";

  // Full-screen splash blocks first paint → set NEXT_PUBLIC_SPLASH_LOADER=false on prod for stronger LCP/Lighthouse.
  const splashLoaderEnabled =
    process.env.NEXT_PUBLIC_SPLASH_LOADER !== "false";

  if (isDesk && !isDeskPreview) {
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

  if (isNotebook || isDeskPreview) {
    return (
      <main id="main-content" tabIndex={-1} className="min-h-screen">
        {children}
      </main>
    );
  }

  return (
    <>
      {isProto ? null : <CustomCursor />}
      <AppLoader enableLoader={splashLoaderEnabled} loadingDuration={400}>
      <EraTravelProvider>
      {/* Skip Links for Accessibility */}
      <a href="#main-content" className="skip-link">
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
      </EraTravelProvider>
      </AppLoader>
    </>
  );
}
