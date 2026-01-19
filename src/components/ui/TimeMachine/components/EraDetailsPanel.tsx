'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ThemeConfig } from '@/data/portfolio-data';
import { DesignSystemLab } from './DesignSystemLab';
import { DesignLabEditor, type LabDesignTokens } from './DesignLabEditor';

interface EraDetailsPanelProps {
  era: ThemeConfig | null;
  onApply: () => void;
  onApplyCustomTokens?: (tokens: LabDesignTokens) => void;
}

type ViewMode = 'showcase' | 'lab';

export function EraDetailsPanel({ era, onApply, onApplyCustomTokens }: EraDetailsPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('showcase');

  const handleOpenLabEditor = useCallback(() => {
    setViewMode('lab');
  }, []);

  const handleCloseLabEditor = useCallback(() => {
    setViewMode('showcase');
  }, []);

  const handleApplyCustomTokens = useCallback((tokens: LabDesignTokens) => {
    if (onApplyCustomTokens) {
      onApplyCustomTokens(tokens);
    }
    setViewMode('showcase');
  }, [onApplyCustomTokens]);

  if (!era) {
    return (
      <div className="flex flex-col h-full bg-[var(--bg-card)] items-center justify-center p-8">
        <div className="font-mono text-sm text-[var(--text-muted)] text-center">
          Select an era from the timeline
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${era.id}-${viewMode}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col h-full bg-[var(--bg-card)]"
      >
        {viewMode === 'showcase' ? (
          <>
            {/* Header */}
            <div className="p-3 lg:p-4 border-b-2 border-[var(--border-color)] flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[9px] lg:text-[10px] text-[var(--text-muted)] uppercase mb-1">
                    DESIGN SYSTEM
                  </div>
                  <h2 className="font-mono text-sm lg:text-lg font-bold text-[var(--text-main)]">
                    {era.name}
                  </h2>
                </div>
                <span
                  className="px-2 py-1 text-[8px] lg:text-[9px] font-mono uppercase border"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                >
                  {era.style}
                </span>
              </div>
            </div>

            {/* Design System Lab - Main Content */}
            <div className="flex-1 p-3 lg:p-4 overflow-hidden">
              <DesignSystemLab
                era={era}
                onOpenLabEditor={handleOpenLabEditor}
              />
            </div>

            {/* Era Info (Collapsed) */}
            <div className="p-3 lg:p-4 border-t-2 border-[var(--border-color)] flex-shrink-0">
              <div className="flex flex-wrap gap-1 mb-3">
                {era.keyElements?.slice(0, 3).map((element, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-[8px] lg:text-[9px] font-mono border border-[var(--border-color)] text-[var(--text-muted)]"
                  >
                    {element}
                  </span>
                ))}
                {era.keyElements && era.keyElements.length > 3 && (
                  <span className="px-2 py-0.5 text-[8px] lg:text-[9px] font-mono text-[var(--text-muted)]">
                    +{era.keyElements.length - 3} more
                  </span>
                )}
              </div>

              {era.lesson && (
                <p className="font-mono text-[10px] lg:text-xs text-[var(--accent-color)] italic mb-3 line-clamp-2">
                  "{era.lesson}"
                </p>
              )}

              {/* Apply Button */}
              <motion.button
                onClick={onApply}
                className={cn(
                  'w-full py-2 lg:py-3 px-4 font-mono text-[10px] lg:text-xs font-bold uppercase',
                  'border-2 border-[var(--accent-color)]',
                  'bg-[var(--accent-color)] text-[var(--bg-main)]',
                  'hover:brightness-110 transition-all',
                  'shadow-[3px_3px_0px_0px_var(--border-color)]',
                  'hover:shadow-[2px_2px_0px_0px_var(--border-color)]',
                  'active:shadow-none active:translate-x-[1px] active:translate-y-[1px]'
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Apply This Era →
              </motion.button>
            </div>
          </>
        ) : (
          /* Lab Editor Mode */
          <DesignLabEditor
            era={era}
            onApply={handleApplyCustomTokens}
            onClose={handleCloseLabEditor}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
