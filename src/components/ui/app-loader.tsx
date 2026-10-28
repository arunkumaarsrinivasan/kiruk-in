'use client';

import React, { startTransition, useCallback, useEffect, useState } from 'react';
import InteractiveLoadingPage from '@/components/ui/interactive-loading-page';
import ImmersiveEraLoadingPage from '@/components/ui/immersive-era-loading-page';
import { clearContentWait } from '@/components/ui/loader/tube/boot';

type LoaderMode = 'none' | 'splash' | 'era-picker';

interface AppLoaderProps {
  children: React.ReactNode;
  enableLoader?: boolean;
  loadingDuration?: number;
}

function readLoaderMode(): LoaderMode {
  if (typeof globalThis.window === 'undefined') return 'none';
  const themeSelected =
    localStorage.getItem('portfolio-theme-selected') === 'true';
  const sessionSeen = sessionStorage.getItem('kiruk-loading-seen') === 'true';

  if (!themeSelected) return 'era-picker';
  if (!sessionSeen) return 'splash';
  return 'none';
}

const AppLoader: React.FC<AppLoaderProps> = ({
  children,
  enableLoader = true,
  loadingDuration = 3000,
}) => {
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<LoaderMode>('none');
  const [showContent, setShowContent] = useState(!enableLoader);

  useEffect(() => {
    if (!enableLoader) {
      setMode('none');
      setShowContent(true);
      setHydrated(true);
      return;
    }

    const next = readLoaderMode();
    setMode(next);
    setShowContent(next === 'none');
    if (next === 'splash') {
      sessionStorage.setItem('kiruk-loading-seen', 'true');
    }
    setHydrated(true);
  }, [enableLoader]);

  const handleLoadingComplete = useCallback(() => {
    sessionStorage.setItem('kiruk-loading-seen', 'true');
    // The whole site mounts here. As a transition React builds it in slices,
    // so a tap or key meanwhile is answered instead of waiting out the mount.
    startTransition(() => setMode('none'));
  }, []);

  // Shown a beat after it has mounted, so its first layout is never seen.
  useEffect(() => {
    if (!hydrated || mode !== 'none' || showContent) return;
    const id = setTimeout(() => setShowContent(true), 80);
    return () => clearTimeout(id);
  }, [hydrated, mode, showContent]);

  // The boot script's hold on a returning visitor's content (loader/tube/boot.ts) ends here.
  useEffect(() => {
    if (hydrated) clearContentWait();
  }, [hydrated]);

  const overlayOpen = enableLoader && mode !== 'none';

  // One shape before and after hydration, so the site under it hydrates in
  // place instead of mounting a second time. Before hydration the content is
  // painted: on a first visit the tube's boot frame covers it, and a returning
  // visitor's waits for their own era under `data-content-wait` (boot.ts).
  return (
    <>
      {enableLoader && mode === 'splash' && (
        <div className="fixed inset-0 z-[200]" aria-hidden="true">
          <InteractiveLoadingPage
            onComplete={handleLoadingComplete}
            duration={loadingDuration}
            showProgress={true}
          />
        </div>
      )}
      {enableLoader && mode === 'era-picker' && (
        <ImmersiveEraLoadingPage onComplete={handleLoadingComplete} />
      )}
      {/* Overlay open: unmount the site so navbar, era shells, and page
          loops are not competing with the splash/picker. SSR still sent
          children on the pre-hydrate pass for crawlers. */}
      {overlayOpen ? null : (
        <div
          data-app-content=""
          style={hydrated ? { visibility: showContent ? 'visible' : 'hidden' } : undefined}
        >
          {children}
        </div>
      )}
    </>
  );
};

export default AppLoader;
