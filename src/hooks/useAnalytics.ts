'use client';

import { useEffect, useCallback, useState } from 'react';

// Generate or get session ID (client-side only)
const getSessionId = () => {
  if (typeof window === 'undefined') return '';
  if (!window.sessionStorage) return '';
  
  try {
    let sessionId = window.sessionStorage.getItem('portfolio_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      window.sessionStorage.setItem('portfolio_session_id', sessionId);
    }
    return sessionId;
  } catch (error) {
    console.warn('Failed to access sessionStorage:', error);
    return '';
  }
};

export const useAnalytics = () => {
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize session ID on client side only
  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  // Track page view
  const trackPageView = useCallback((page: string) => {
    if (typeof window === 'undefined' || !sessionId) return;
    
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
          referrer: window.document.referrer || undefined
        },
        sessionId,
      }),
    }).catch(error => {
      console.warn('Failed to track page view:', error);
    });
  }, [sessionId]);

  // Track interaction
  const trackInteraction = useCallback((action: string, data?: any) => {
    if (typeof window === 'undefined' || !sessionId) return;
    
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
