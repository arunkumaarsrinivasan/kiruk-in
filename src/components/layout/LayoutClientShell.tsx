"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import SimpleGameNav, {
  SIMPLE_GAME_NAV_BAR_HEIGHT_PX,
  SIMPLE_GAME_NAV_BOTTOM_CSS_VAR,
} from "./SimpleGameNav";
import DynamicContextBar from "./DynamicContextBar";
import AppLoader from "@/components/ui/app-loader";
import { getDefaultGameId, getGameEntry } from "@/components/ui/arcade/game-registry";
import { useMissionTracker } from "@/hooks/useMissionTracker";
import DetectiveStoryWrapper from "./DetectiveStoryWrapper";
import SketchDigitalSplitLayout from "./SketchDigitalSplitLayout";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { useTheme } from "@/contexts/ThemeContext";
import EraTransitionOverlay from "@/components/ui/era-transition/EraTransitionOverlay";
import EraChromeOverlay from "@/components/ui/era-chrome/EraChromeOverlay";
import EraFilmstrip from "@/components/ui/era-machine/EraFilmstrip";

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

const GAME_ICONS: Record<string, string> = {
  snake: 'bolt',
  painter: 'pen',
  collector: 'sparkles',
  avoider: 'eye-cross',
  tetris: 'grid',
  pipe: 'cog',
  shooter: 'eye',
  minesweeper: 'exclamation-triangle',
  flappy: 'arrow-up',
  timeline: 'clock',
  quiz: 'question',
  memory: 'bookmark',
};

export default function LayoutClientShell({ children }: Readonly<LayoutClientShellProps>) {
  const pathname = usePathname();
  const { isSplitMode } = useLayoutMode();
  const { currentTheme } = useTheme();

  let mainPaddingTop: string;
  if (isSplitMode) {
    mainPaddingTop = "0";
  } else if (["/about", "/work", "/progress"].includes(pathname)) {
    mainPaddingTop = `calc(var(${SIMPLE_GAME_NAV_BOTTOM_CSS_VAR}, ${SIMPLE_GAME_NAV_BAR_HEIGHT_PX}px) + 40px + 8px)`;
  } else {
    mainPaddingTop = `calc(var(${SIMPLE_GAME_NAV_BOTTOM_CSS_VAR}, ${SIMPLE_GAME_NAV_BAR_HEIGHT_PX}px) + 10px)`;
  }
  // Keep the global layout stable; only show the gamified header + grid on chosen pages.
  const arcadeEnabled = pathname === '/';

  // Game state for nav (play button opens game menu overlay)
  const [isGameActive, setIsGameActive] = useState(false);
  const gameId = getDefaultGameId();

  const { trackInteraction } = useMissionTracker();
  const gameEntry = getGameEntry(gameId);
  const gameName = gameEntry?.label || 'Game';
  const gameIcon = GAME_ICONS[gameId] ?? 'play';

  const handleToggleGame = useCallback(() => {
    setIsGameActive(prev => !prev);
    trackInteraction();
  }, [trackInteraction]);

  // Full-screen splash blocks first paint → set NEXT_PUBLIC_SPLASH_LOADER=false on prod for stronger LCP/Lighthouse.
  const splashLoaderEnabled =
    process.env.NEXT_PUBLIC_SPLASH_LOADER !== "false";

  return (
    <AppLoader enableLoader={splashLoaderEnabled} loadingDuration={400}>
      <CustomCursor />
      {/* Skip Links for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:text-sm focus:no-underline"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-30 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:text-sm focus:no-underline"
      >
        Skip to navigation
      </a>

      {/* Simplified Game Navigation */}
      <SimpleGameNav
        isGameActive={arcadeEnabled ? isGameActive : false}
        currentGameId={gameId}
        currentGameName={gameName}
        currentGameIcon={gameIcon}
        onToggleGame={arcadeEnabled ? handleToggleGame : undefined}
      />

      {/* Dynamic Context Bar - shows page-specific timeline and shortcuts */}
      <DynamicContextBar />

      <SketchDigitalSplitLayout>
        <DetectiveStoryWrapper>
          <main
            id="main-content"
            tabIndex={-1}
            style={{
              // Split panes are already offset below #navigation; skip nav padding to avoid a blank band.
              paddingTop: mainPaddingTop,
            }}
          >
            {children}
          </main>
        </DetectiveStoryWrapper>
      </SketchDigitalSplitLayout>

      {/* Help Bot - Available on all pages */}
      <HelpBot />

      {/* Era chrome — per-family atmospheric overlay (home only) */}
      {pathname === "/" && (
        <>
          <EraChromeOverlay
            eraId={currentTheme.id}
            accentColor={currentTheme.colors.accent}
          />
          <EraFilmstrip />
        </>
      )}

      {/* Era transition — subtle crossfade + grain on theme change */}
      <EraTransitionOverlay
        signal={currentTheme.id}
        accentColor={currentTheme.colors.accent}
      />
    </AppLoader>
  );
}

