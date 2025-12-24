
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeConfig, AVAILABLE_THEMES } from '@/data/portfolio-data';
import { DesignSystemTokens, getDesignSystemForTheme } from '@/data/design-systems';

type CustomEraStorage = {
  id: 'custom';
  name: string;
  bgMain: string;
  bgCard: string;
  textMain: string;
  textMuted: string;
  accentColor: string;
  borderColor: string;
  gridColor: string;
  fontMain: string;
  fontHeading: string;
  gridSize: number;
  gridOpacity: number;
};

const CUSTOM_ERA_STORAGE_KEY = 'kiruk-custom-era';

const safeJsonParse = <T,>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const getStoredCustomEra = (): CustomEraStorage | null => {
  return safeJsonParse<CustomEraStorage>(localStorage.getItem(CUSTOM_ERA_STORAGE_KEY));
};

const buildCustomThemeConfig = (custom: CustomEraStorage): ThemeConfig => {
  return {
    id: 'custom',
    name: `CUSTOM: ${custom.name || 'MY ERA'}`,
    era: 'User Customization',
    description: 'Player-crafted design era.',
    lesson: 'Personalization turns UI into identity.',
    heritage: 'A living theme tuned to your taste.',
    keyElements: ['Grid world', 'Player palette', 'Modular tokens'],
    preview: '/themes/custom.jpg',
    colors: {
      primary: custom.accentColor,
      secondary: custom.bgCard,
      accent: custom.accentColor,
      background: custom.bgMain,
      text: custom.textMain,
    },
    fonts: {
      primary: custom.fontMain,
      secondary: custom.fontHeading,
      accent: custom.fontMain,
    },
    // Keep this aligned with your default “grid world” vibe.
    style: 'sketch',
  };
};

interface ThemeContextType {
  currentTheme: ThemeConfig;
  setTheme: (themeId: string) => void;
  availableThemes: ThemeConfig[];
  isThemeSelected: boolean;
  showThemeSelector: boolean;
  setShowThemeSelector: (show: boolean) => void;
  designSystem: DesignSystemTokens;
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
  const [availableThemes, setAvailableThemes] = useState<ThemeConfig[]>(AVAILABLE_THEMES);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(AVAILABLE_THEMES[0]); // Default
  const [isThemeSelected, setIsThemeSelected] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [designSystem, setDesignSystem] = useState<DesignSystemTokens>(() => getDesignSystemForTheme(AVAILABLE_THEMES[0]));

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedThemeId = localStorage.getItem('portfolio-theme');
    const savedThemeSelected = localStorage.getItem('portfolio-theme-selected');

    // Hydrate custom theme (if present) into availableThemes
    const storedCustom = getStoredCustomEra();
    if (storedCustom) {
      const customTheme = buildCustomThemeConfig(storedCustom);
      setAvailableThemes((prev) => {
        if (prev.some((t) => t.id === customTheme.id)) return prev;
        return [...prev, customTheme];
      });
    }
    
    if (savedThemeId) {
      if (savedThemeId === 'custom') {
        const custom = getStoredCustomEra();
        if (custom) {
          setCurrentTheme(buildCustomThemeConfig(custom));
        }
      } else {
        const theme = AVAILABLE_THEMES.find((t) => t.id === savedThemeId);
        if (theme) {
          setCurrentTheme(theme);
        }
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
    
    // Set data attributes for global styles
    document.body.setAttribute('data-era', theme.id);
    document.body.setAttribute('data-style', theme.style);
    
    // Toggle theme-* classes without wiping other body classes
    const themeClasses = ['theme-sketch', 'theme-minimal', 'theme-absurd'];
    themeClasses.forEach(themeClass => document.body.classList.remove(themeClass));
    document.body.classList.add(`theme-${theme.style}`);

    // IMPORTANT: Your visual system uses --bg-main/--text-main/etc (via globals.css).
    // Those are driven by body[data-era='YYYY'] rules for built-in eras.
    // For the custom era, we must apply the full variable set inline.
    const clearCustomVars = () => {
      const keys = [
        '--bg-main',
        '--bg-card',
        '--text-main',
        '--text-muted',
        '--accent-color',
        '--border-color',
        '--font-main',
        '--font-heading',
        '--grid-opacity',
      ];
      keys.forEach((k) => root.style.removeProperty(k));
    };

    if (theme.id === 'custom') {
      const custom = getStoredCustomEra();
      if (custom) {
        root.style.setProperty('--bg-main', custom.bgMain);
        root.style.setProperty('--bg-card', custom.bgCard);
        root.style.setProperty('--text-main', custom.textMain);
        root.style.setProperty('--text-muted', custom.textMuted);
        root.style.setProperty('--accent-color', custom.accentColor);
        root.style.setProperty('--border-color', custom.borderColor);
        root.style.setProperty('--font-main', custom.fontMain);
        root.style.setProperty('--font-heading', custom.fontHeading);
        root.style.setProperty('--grid-opacity', String((custom.gridOpacity ?? 50) / 100));
      }
    } else {
      clearCustomVars();
    }
  }, [currentTheme]);

  useEffect(() => {
    setDesignSystem(getDesignSystemForTheme(currentTheme));
  }, [currentTheme]);

  useEffect(() => {
    const root = document.documentElement;
    const { surface, cards } = designSystem.vars;

    root.style.setProperty('--surface-pattern', surface.pattern);
    root.style.setProperty('--surface-pattern-size', surface.size);
    root.style.setProperty('--surface-pattern-position', surface.position);
    root.style.setProperty('--surface-pattern-repeat', surface.repeat);
    root.style.setProperty('--surface-pattern-opacity', surface.opacity);

    root.style.setProperty('--card-border-style', cards.borderStyle);
    root.style.setProperty('--card-tilt', cards.tilt);
    root.style.setProperty('--card-background', cards.background);
    root.style.setProperty('--card-shadow', cards.shadow);
  }, [designSystem]);

  const setTheme = (themeId: string) => {
    if (themeId === 'custom') {
      const storedCustom = getStoredCustomEra();
      if (!storedCustom) return;

      const customTheme = buildCustomThemeConfig(storedCustom);
      setAvailableThemes((prev) => {
        const next = prev.some((t) => t.id === 'custom') ? prev.map((t) => (t.id === 'custom' ? customTheme : t)) : [...prev, customTheme];
        return next;
      });
      setCurrentTheme(customTheme);
    } else {
      const theme = AVAILABLE_THEMES.find((t) => t.id === themeId);
      if (!theme) return;
      setCurrentTheme(theme);
    }

    setIsThemeSelected(true);
    setShowThemeSelector(false);

    localStorage.setItem('portfolio-theme', themeId);
    localStorage.setItem('portfolio-theme-selected', 'true');
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes,
    isThemeSelected,
    showThemeSelector,
    setShowThemeSelector,
    designSystem,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useDesignSystem = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useDesignSystem must be used within a ThemeProvider');
  }
  return context.designSystem;
};
