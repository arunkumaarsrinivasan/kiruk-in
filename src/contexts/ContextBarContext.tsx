'use client';

import { createContext, useContext, useState, useMemo, useCallback, useRef, ReactNode } from 'react';

interface AboutPageData {
  phases: { phase: string; year: number; index: number }[];
  currentPhase?: string;
  currentYear?: number;
}

interface WorkPageData {
  experiences: { id: string; company: string; start: string; end?: string; current?: boolean }[];
  currentExperienceId?: string;
}

interface ProgressPageData {
  monthlyGoals: { month: string; completion: number }[];
  bucketList: { id: string; title: string; status: string }[];
  lifeGoals: { id: string; title: string; priority?: string }[];
  activeSection?: 'monthly' | 'bucket' | 'goals';
}

interface ContextBarData {
  about?: AboutPageData;
  work?: WorkPageData;
  progress?: ProgressPageData;
}

interface ContextBarContextType {
  data: ContextBarData;
  setAboutData: (data: AboutPageData) => void;
  setWorkData: (data: WorkPageData) => void;
  setProgressData: (data: ProgressPageData) => void;
  clearData: () => void;
  // Handlers for context bar actions
  onAboutPhaseClick?: (phase: string) => void;
  onWorkExperienceClick?: (experienceId: string) => void;
  onProgressSectionClick?: (section: 'monthly' | 'bucket' | 'goals') => void;
  setAboutPhaseHandler?: (handler: (phase: string) => void) => void;
  setWorkExperienceHandler?: (handler: (experienceId: string) => void) => void;
  setProgressSectionHandler?: (handler: (section: 'monthly' | 'bucket' | 'goals') => void) => void;
}

const ContextBarContext = createContext<ContextBarContextType | undefined>(undefined);

export function ContextBarProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [data, setData] = useState<ContextBarData>({});
  const onAboutPhaseClickRef = useRef<((phase: string) => void) | undefined>(undefined);
  const onWorkExperienceClickRef = useRef<((experienceId: string) => void) | undefined>(undefined);
  const onProgressSectionClickRef = useRef<((section: 'monthly' | 'bucket' | 'goals') => void) | undefined>(undefined);

  const setAboutData = useCallback((aboutData: AboutPageData) => {
    setData((prev) => ({ ...prev, about: aboutData }));
  }, []);

  const setWorkData = useCallback((workData: WorkPageData) => {
    setData((prev) => ({ ...prev, work: workData }));
  }, []);

  const setProgressData = useCallback((progressData: ProgressPageData) => {
    setData((prev) => ({ ...prev, progress: progressData }));
  }, []);

  const clearData = useCallback(() => {
    setData({});
  }, []);

  const setAboutPhaseHandler = useCallback((handler: (phase: string) => void) => {
    onAboutPhaseClickRef.current = handler;
  }, []);

  const setWorkExperienceHandler = useCallback((handler: (experienceId: string) => void) => {
    onWorkExperienceClickRef.current = handler;
  }, []);

  const setProgressSectionHandler = useCallback((handler: (section: 'monthly' | 'bucket' | 'goals') => void) => {
    onProgressSectionClickRef.current = handler;
  }, []);

  const onAboutPhaseClick = useCallback((phase: string) => {
    onAboutPhaseClickRef.current?.(phase);
  }, []);

  const onWorkExperienceClick = useCallback((experienceId: string) => {
    onWorkExperienceClickRef.current?.(experienceId);
  }, []);

  const onProgressSectionClick = useCallback((section: 'monthly' | 'bucket' | 'goals') => {
    onProgressSectionClickRef.current?.(section);
  }, []);

  const contextValue = useMemo(
    () => ({
      data,
      setAboutData,
      setWorkData,
      setProgressData,
      clearData,
      onAboutPhaseClick,
      onWorkExperienceClick,
      onProgressSectionClick,
      setAboutPhaseHandler,
      setWorkExperienceHandler,
      setProgressSectionHandler,
    }),
    [data, setAboutData, setWorkData, setProgressData, clearData, onAboutPhaseClick, onWorkExperienceClick, onProgressSectionClick, setAboutPhaseHandler, setWorkExperienceHandler, setProgressSectionHandler]
  );

  return (
    <ContextBarContext.Provider value={contextValue}>
      {children}
    </ContextBarContext.Provider>
  );
}

export function useContextBar() {
  const context = useContext(ContextBarContext);
  if (!context) {
    throw new Error('useContextBar must be used within ContextBarProvider');
  }
  return context;
}
