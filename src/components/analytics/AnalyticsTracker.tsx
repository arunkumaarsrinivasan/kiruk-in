'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // Track page view when pathname changes
    trackPageView(pathname);
  }, [pathname, trackPageView]);

  return null; // This component doesn't render anything
}
