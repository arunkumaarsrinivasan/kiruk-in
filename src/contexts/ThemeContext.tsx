'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeConfig, AVAILABLE_THEMES } from '@/data/portfolio-data';

interface ThemeContextType {
  currentTheme: ThemeConfig;
  setTheme: (themeId: string) => void;
  availableThemes: ThemeConfig[];
  isThemeSelected: boolean;
  showThemeSelector: boolean;
  setShowThemeSelector: (show: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(AVAILABLE_THEMES[0]); // Default to sketch
  const [isThemeSelected, setIsThemeSelected] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedThemeId = localStorage.getItem('portfolio-theme');
    const savedThemeSelected = localStorage.getItem('portfolio-theme-selected');
    
    if (savedThemeId) {
      const theme = AVAILABLE_THEMES.find(t => t.id === savedThemeId);
      if (theme) {
        setCurrentTheme(theme);
      }
    }
    
    if (savedThemeSelected === 'true') {
      setIsThemeSelected(true);
    } else {
      // Show theme selector on first visit
      setShowThemeSelector(true);
    }
  }, []);

  // Apply theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const theme = currentTheme;
    
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-text', theme.colors.text);
    
    root.style.setProperty('--theme-font-primary', theme.fonts.primary);
    root.style.setProperty('--theme-font-secondary', theme.fonts.secondary);
    root.style.setProperty('--theme-font-accent', theme.fonts.accent);
    
    // Add theme class to body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.style}`);
  }, [currentTheme]);

  const setTheme = (themeId: string) => {
    const theme = AVAILABLE_THEMES.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      setIsThemeSelected(true);
      setShowThemeSelector(false);
      
      // Save to localStorage
      localStorage.setItem('portfolio-theme', themeId);
      localStorage.setItem('portfolio-theme-selected', 'true');
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes: AVAILABLE_THEMES,
    isThemeSelected,
    showThemeSelector,
    setShowThemeSelector,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
