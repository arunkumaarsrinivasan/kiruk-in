'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type LayoutMode = 'full-digital' | 'full-sketch' | 'split-side' | 'split-top';

interface LayoutModeContextValue {
    layoutMode: LayoutMode;
    setLayoutMode: (mode: LayoutMode) => void;
    cycleLayoutMode: () => void;
    isSketchVisible: boolean;
    isDigitalVisible: boolean;
    isSplitMode: boolean;
    effectiveLayoutMode: LayoutMode;
}

const LAYOUT_MODES: LayoutMode[] = ['full-digital', 'split-side', 'split-top', 'full-sketch'];

const LayoutModeContext = createContext<LayoutModeContextValue | undefined>(undefined);

export const useLayoutMode = () => {
    const context = useContext(LayoutModeContext);
    if (context === undefined) {
        throw new Error('useLayoutMode must be used within a LayoutModeProvider');
    }
    return context;
};

import { usePathname } from 'next/navigation';

interface LayoutModeProviderProps {
    children: ReactNode;
}

export const LayoutModeProvider: React.FC<LayoutModeProviderProps> = ({ children }) => {
    const pathname = usePathname();
    // Default home layout: developer / full digital (hero hat controls persist to localStorage)
    const [layoutMode, setLayoutModeState] = useState<LayoutMode>('full-digital');

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('kiruk-layout-mode');
            if (stored && LAYOUT_MODES.includes(stored as LayoutMode)) {
                setLayoutModeState(stored as LayoutMode);
            }
        } catch {
            // localStorage unavailable (SSR or private browsing)
        }
    }, []);

    const setLayoutMode = useCallback((mode: LayoutMode) => {
        setLayoutModeState(mode);
        try {
            localStorage.setItem('kiruk-layout-mode', mode);
        } catch {
            // localStorage unavailable
        }
    }, []);

    const cycleLayoutMode = useCallback(() => {
        setLayoutModeState(prev => {
            const currentIndex = LAYOUT_MODES.indexOf(prev);
            const nextIndex = (currentIndex + 1) % LAYOUT_MODES.length;
            const next = LAYOUT_MODES[nextIndex];
            try {
                localStorage.setItem('kiruk-layout-mode', next);
            } catch {
                // localStorage unavailable
            }
            return next;
        });
    }, []);

    // Compute effective layout mode based on current route
    const isHome = pathname === '/';
    const effectiveLayoutMode = isHome ? layoutMode : 'full-digital';

    const isSketchVisible = effectiveLayoutMode === 'full-sketch' || effectiveLayoutMode === 'split-side' || effectiveLayoutMode === 'split-top';
    const isDigitalVisible = effectiveLayoutMode === 'full-digital' || effectiveLayoutMode === 'split-side' || effectiveLayoutMode === 'split-top';
    const isSplitMode = effectiveLayoutMode === 'split-side' || effectiveLayoutMode === 'split-top';

    return (
        <LayoutModeContext.Provider value={{
            layoutMode,
            setLayoutMode,
            cycleLayoutMode,
            isSketchVisible,
            isDigitalVisible,
            isSplitMode,
            effectiveLayoutMode
        }}>
            {children}
        </LayoutModeContext.Provider>
    );
};
