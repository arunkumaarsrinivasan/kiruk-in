'use client';

import React, { useState, useEffect } from 'react';
import InteractiveLoadingPage from '@/components/ui/interactive-loading-page';

interface AppLoaderProps {
  children: React.ReactNode;
  enableLoader?: boolean;
  loadingDuration?: number;
}

const AppLoader: React.FC<AppLoaderProps> = ({ 
  children, 
  enableLoader = true,
  loadingDuration = 3000 
}) => {
  const [isLoading, setIsLoading] = useState(enableLoader);
  const [showContent, setShowContent] = useState(!enableLoader);

  useEffect(() => {
    if (!enableLoader) {
      setShowContent(true);
      return;
    }

    // Check if user has seen loading before (optional optimization)
    const hasSeenLoading = sessionStorage.getItem('kiruk-loading-seen');
    
    if (hasSeenLoading) {
      // Skip loading if already seen in this session
      setIsLoading(false);
      setShowContent(true);
      return;
    }

    // Mark as seen
    sessionStorage.setItem('kiruk-loading-seen', 'true');
  }, [enableLoader]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  };

  if (isLoading) {
    return (
      <InteractiveLoadingPage 
        onComplete={handleLoadingComplete}
        duration={loadingDuration}
        showProgress={true}
      />
    );
  }

  if (!showContent) {
    return null;
  }

  return <>{children}</>;
};

export default AppLoader;
