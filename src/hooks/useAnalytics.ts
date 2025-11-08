'use client';

import { useEffect, useCallback } from 'react';

// Generate or get session ID
const getSessionId = () => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('portfolio_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    sessionStorage.setItem('portfolio_session_id', sessionId);
  }
  return sessionId;
};

export const useAnalytics = () => {
  const sessionId = getSessionId();

  // Track page view
  const trackPageView = useCallback((page: string) => {
    if (typeof window === 'undefined') return;
    
    // Track via API
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'page_view',
        data: { 
          page,
          url: window.location.href,
          referrer: document.referrer || undefined
        },
        sessionId,
      }),
    }).catch(error => {
      console.warn('Failed to track page view:', error);
    });
  }, [sessionId]);

  // Track interaction
  const trackInteraction = useCallback((action: string, data?: any) => {
    if (typeof window === 'undefined') return;
    
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        data,
        sessionId,
      }),
    }).catch(error => {
      console.warn('Failed to track interaction:', error);
    });
  }, [sessionId]);

  // Track portfolio interactions
  const trackPortfolioInteraction = useCallback((interactionType: string, details?: any) => {
    trackInteraction('portfolio_interaction', {
      type: interactionType,
      ...details
    });
  }, [trackInteraction]);

  // Track contact form submission
  const trackContactSubmission = useCallback(() => {
    trackInteraction('contact_form_submission');
  }, [trackInteraction]);

  // Track case study view
  const trackCaseStudyView = useCallback((caseStudyId: string) => {
    trackInteraction('case_study_view', { caseStudyId });
  }, [trackInteraction]);

  return {
    trackPageView,
    trackInteraction,
    trackPortfolioInteraction,
    trackContactSubmission,
    trackCaseStudyView,
    sessionId
  };
};
