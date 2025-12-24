'use client';

import React, { createContext, useContext, useMemo, useCallback, ReactNode } from 'react';
import { ThemeConfig } from '@/data/portfolio-data';
import { useTheme } from '@/contexts/ThemeContext';

export type DesignEra = ThemeConfig['id'];

interface DesignEraContextValue {
  eras: ThemeConfig[];
  currentEra: ThemeConfig;
  currentEraId: DesignEra;
  setEra: (eraId: DesignEra) => void;
}

const DesignEraContext = createContext<DesignEraContextValue | undefined>(undefined);

export const useDesignEra = () => {
  const context = useContext(DesignEraContext);
  if (context === undefined) {
    throw new Error('useDesignEra must be used within a DesignEraProvider');
  }
  return context;
};

interface DesignEraProviderProps {
  children: ReactNode;
}

export const DesignEraProvider: React.FC<DesignEraProviderProps> = ({ children }) => {
  const { currentTheme, availableThemes, setTheme } = useTheme();

  const setEra = useCallback(
    (eraId: DesignEra) => {
      setTheme(eraId);
    },
    [setTheme]
  );

  const value = useMemo(
    () => ({
      eras: availableThemes,
      currentEra: currentTheme,
      currentEraId: currentTheme.id as DesignEra,
      setEra,
    }),
    [availableThemes, currentTheme, setEra]
  );

  return <DesignEraContext.Provider value={value}>{children}</DesignEraContext.Provider>;
};
