'use client';

import React, { useState, useEffect } from 'react';
import InteractiveLoadingPage from '@/components/ui/interactive-loading-page';
import ImmersiveEraLoadingPage from '@/components/ui/immersive-era-loading-page';

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

  const handleLoadingComplete = () => {
    sessionStorage.setItem('kiruk-loading-seen', 'true');
    setMode('none');
    setTimeout(() => setShowContent(true), 80);
  };

  if (!hydrated) {
    return (
      <div style={{ visibility: 'hidden' }} aria-hidden>
        {children}
      </div>
    );
  }

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
      <div style={{ visibility: showContent ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </>
  );
};

export default AppLoader;
