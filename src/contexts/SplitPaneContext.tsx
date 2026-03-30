'use client';

/**
 * SplitPaneContext
 *
 * Provides awareness to child components about which pane they're rendering in.
 * Used by SketchOnly / DigitalOnly / BothPanes wrappers to show/hide content.
 *
 * Rendering flow:
 * - full-digital:  SplitPane not active → BothPanes + DigitalOnly visible, SketchOnly hidden
 * - full-sketch:   SplitPane not active → BothPanes + SketchOnly visible, DigitalOnly hidden
 * - split-side:    Renders child subtree TWICE inside SketchDigitalSplitLayout
 *                  First render: currentPane = 'sketch'  → SketchOnly + BothPanes visible
 *                  Second render: currentPane = 'digital' → DigitalOnly + BothPanes visible
 * - split-top:     Same as split-side but vertical
 */

import React, { createContext, useContext } from 'react';

export type SplitPane = 'sketch' | 'digital' | 'both';

interface SplitPaneContextValue {
    currentPane: SplitPane;
    isSplitMode: boolean;
}

export const SplitPaneContext = createContext<SplitPaneContextValue>({
    currentPane: 'both',
    isSplitMode: false,
});

export const useSplitPane = () => useContext(SplitPaneContext);

/**
 * SketchOnly — renders children only when in sketch pane or full-sketch mode
 */
export const SketchOnly: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => {
    const { currentPane, isSplitMode } = useSplitPane();

    // In split mode: only show in sketch pane
    if (isSplitMode && currentPane !== 'sketch') return null;

    return <div className={className}>{children}</div>;
};

/**
 * DigitalOnly — renders children only when in digital pane or full-digital mode
 */
export const DigitalOnly: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => {
    const { currentPane, isSplitMode } = useSplitPane();

    // In split mode: only show in digital pane
    if (isSplitMode && currentPane !== 'digital') return null;

    return <div className={className}>{children}</div>;
};

/**
 * BothPanes — always renders children regardless of pane
 */
export const BothPanes: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => {
    return <div className={className}>{children}</div>;
};
