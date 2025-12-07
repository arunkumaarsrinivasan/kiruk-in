'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDesignEra } from '@/contexts/DesignEraContext';

const TimeTravelSlider: React.FC = () => {
  const { eras, currentEra, currentEraId, setEra } = useDesignEra();
  const [sliderIndex, setSliderIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!eras.length) {
      return;
    }
    const activeIndex = Math.max(0, eras.findIndex((theme) => theme.id === currentEraId));
    setSliderIndex(activeIndex === -1 ? 0 : activeIndex);
  }, [eras, currentEraId]);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleAutoHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      setIsPanelOpen(false);
    }, 2400);
  }, [clearHideTimer]);

  const handlePanelReveal = useCallback(() => {
    clearHideTimer();
    setIsPanelOpen(true);
  }, [clearHideTimer]);

  const handlePanelDock = useCallback(() => {
    scheduleAutoHide();
  }, [scheduleAutoHide]);

  useEffect(() => {
    scheduleAutoHide();
    return () => clearHideTimer();
  }, [scheduleAutoHide, clearHideTimer]);

  if (!mounted || !eras.length) {
    return null;
  }

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextIndex = Number(event.target.value);
    const nextEra = eras[nextIndex];

    if (nextEra) {
      setSliderIndex(nextIndex);
      setEra(nextEra.id);
    }
  };

  const minYear = eras[0]?.id ?? '1970';
  const maxYear = eras[eras.length - 1]?.id ?? '2025';
  const eraCountLabel = `${String(sliderIndex + 1).padStart(2, '0')}/${String(eras.length).padStart(2, '0')}`;
  const eraTraits = (currentEra.keyElements && currentEra.keyElements.length > 0
    ? currentEra.keyElements
    : currentEra.description.split(',')
  )
    .map((trait) => trait.trim())
    .filter(Boolean);
  const gridShift = sliderIndex * 4;
  const gridStyle: React.CSSProperties = {
    backgroundImage:
      'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    backgroundPosition: `${gridShift}px ${gridShift}px, ${gridShift}px ${gridShift}px`
  };

  return (
    <div
      className="fixed right-6 bottom-6 z-50 flex flex-col items-end"
      onMouseEnter={handlePanelReveal}
      onMouseLeave={handlePanelDock}
      onFocusCapture={handlePanelReveal}
      onBlurCapture={handlePanelDock}
    >
      <div
        className={`transition-all duration-300 origin-bottom-right ${
          isPanelOpen
            ? 'opacity-100 scale-100 translate-y-0 mb-4 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none h-0 overflow-hidden'
        }`}
      >
        <aside
          className="w-[280px] border border-[var(--border-color)] bg-[var(--bg-main)] p-3 shadow-none overflow-hidden"
          style={gridStyle}
          aria-label="Design era time slider"
        >
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)]">
            <span>Era Progress</span>
            <span>Lv {eraCountLabel}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-[12px] font-semibold uppercase text-[var(--text-main)]">
                {currentEra.name.split(': ')[1] ?? currentEra.name}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {eraTraits.slice(0, 4).map((trait) => (
                  <span
                    key={trait}
                    className="px-2 py-0.5 border border-[var(--border-color)] bg-[var(--bg-card)]/80 text-[9px] font-mono uppercase tracking-[0.18em] text-[var(--text-muted)]"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative w-full pt-4">
            <input
              type="range"
              min={0}
              max={eras.length - 1}
              value={sliderIndex}
              step={1}
              onChange={handleSliderChange}
              className="block h-2 w-full cursor-ew-resize appearance-none rounded-none border border-[var(--border-color)] bg-[var(--bg-secondary)] accent-[var(--text-main)]"
              aria-valuemin={Number(minYear)}
              aria-valuemax={Number(maxYear)}
              aria-valuenow={Number(currentEraId)}
            />
            <div className="mt-3 flex justify-between">
              {eras.map((theme, index) => (
                <button
                  key={theme.id}
                  type="button"
                  className="flex-1"
                  aria-label={`Jump to era ${theme.id}`}
                  onClick={() => {
                    setSliderIndex(index);
                    setEra(theme.id);
                  }}
                >
                  <span
                    className={`mx-auto block h-3 w-px ${
                      index === sliderIndex
                        ? 'bg-[var(--text-main)]'
                        : 'bg-[var(--border-color)] opacity-70 hover:opacity-100'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="group relative flex items-center justify-center border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-2 text-xl font-black text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-all"
        aria-label="Toggle time travel slider"
      >
        {currentEraId}
      </button>
    </div>
  );
};

export default TimeTravelSlider;
