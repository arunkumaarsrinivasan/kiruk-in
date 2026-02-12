'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDesignEra } from '@/contexts/DesignEraContext';
import { EraStoryCard, EraPreviewCard } from '@/components/ui/TimeMachine/components/EraDetailsPanel';
import { HorizontalTimeline } from '@/components/ui/TimeMachine/components/TimelineVisualization';
import { NavigationFooter } from '@/components/ui/TimeMachine/components/NavigationControls';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface CustomEra {
  id: string;
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
}

const DEFAULT_CUSTOM_ERA: CustomEra = {
  id: 'custom',
  name: 'MY ERA',
  bgMain: '#0a0a0a',
  bgCard: '#1a1a1a',
  textMain: '#ffffff',
  textMuted: '#666666',
  accentColor: '#00ff88',
  borderColor: '#333333',
  gridColor: '#222222',
  fontMain: 'monospace',
  fontHeading: 'monospace',
  gridSize: 20,
  gridOpacity: 50,
};

const FONT_OPTIONS = [
  { value: 'monospace', label: 'MONO' },
  { value: '"Space Grotesk", sans-serif', label: 'SPACE' },
  { value: '"Courier New", monospace', label: 'COURIER' },
  { value: 'system-ui, sans-serif', label: 'SYSTEM' },
  { value: '"Press Start 2P", cursive', label: 'PIXEL' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// REACTOR SWITCH
// ═══════════════════════════════════════════════════════════════════════════════

const ReactorSwitch = ({
  isOn,
  onToggle,
}: {
  isOn: boolean;
  onToggle: () => void;
}) => {
  return (
    <motion.button
      onClick={onToggle}
      className={cn(
        'relative flex items-center justify-center',
        'bg-[var(--bg-card)] border-2 transition-all',
        'shadow-lg hover:shadow-xl',
        isOn
          ? 'border-[var(--accent-color)]'
          : 'border-[var(--border-color)]'
      )}
      style={{
        width: 'var(--tm-lever-w, 80px)',
        height: 'var(--tm-lever-w, 80px)',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isOn ? "Close Time Machine" : "Open Time Machine"}
    >
      {isOn && (
        <motion.div
          className="absolute inset-0 bg-[var(--accent-color)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-2">
        <motion.div
          className={cn(
            'w-1 h-3',
            isOn ? 'bg-[var(--accent-color)]' : 'bg-[var(--border-color)]'
          )}
          animate={isOn ? { opacity: [1, 0.3, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        <div className="relative">
          <motion.div
            className={cn(
              'w-8 h-8 rounded-full border-2 flex items-center justify-center',
              isOn
                ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10'
                : 'border-[var(--border-color)] bg-transparent'
            )}
            animate={isOn ? {
              boxShadow: [
                '0 0 0px rgba(0,255,136,0)',
                '0 0 20px rgba(0,255,136,0.4)',
                '0 0 0px rgba(0,255,136,0)',
              ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className={cn(
                'w-4 h-4 rounded-full',
                isOn ? 'bg-[var(--accent-color)]' : 'bg-[var(--border-color)]'
              )}
              animate={isOn ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        </div>

        <motion.div
          className={cn(
            'w-1 h-3',
            isOn ? 'bg-[var(--accent-color)]' : 'bg-[var(--border-color)]'
          )}
          animate={isOn ? { opacity: [1, 0.3, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
        />
      </div>

      <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-[var(--border-color)]" />
      <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-[var(--border-color)]" />
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-[var(--border-color)]" />
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-[var(--border-color)]" />

      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-[6px] font-mono text-[var(--text-muted)] uppercase">
          {isOn ? 'ACTIVE' : 'STANDBY'}
        </span>
      </div>
    </motion.button>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PIXEL SCAN LINE TRANSITION
// ═══════════════════════════════════════════════════════════════════════════════

const PixelTransition = ({
  isActive,
  onComplete,
  targetEra
}: {
  isActive: boolean;
  onComplete: () => void;
  targetEra: string;
}) => {
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(onComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden flex flex-col"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 flex">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-[var(--accent-color)] border-r border-[var(--bg-main)]"
                initial={{ height: '0%' }}
                animate={{
                  height: ['0%', '100%', '100%', '0%'],
                  y: ['0%', '0%', '0%', '100%']
                }}
                transition={{
                  duration: 0.8,
                  times: [0, 0.4, 0.6, 1],
                  delay: Math.random() * 0.2,
                  ease: 'circInOut',
                }}
              />
            ))}
          </div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.2, 1.2, 1.5] }}
            transition={{ duration: 0.8, times: [0, 0.3, 0.7, 1] }}
          >
            <div className="bg-[var(--bg-main)] border-4 border-[var(--accent-color)] px-8 py-4 shadow-[8px_8px_0px_0px_var(--text-main)]">
              <span className="text-4xl font-mono font-black text-[var(--accent-color)] uppercase tracking-widest">
                LOADING {targetEra}...
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// GAME CUSTOMIZATION PANEL
// ═══════════════════════════════════════════════════════════════════════════════

const GameCustomizationPanel = ({
  customEra,
  onUpdate,
  onApply,
  onClose,
}: {
  customEra: CustomEra;
  onUpdate: (era: CustomEra) => void;
  onApply: () => void;
  onClose: () => void;
}) => {
  const updateField = useCallback(
    <K extends keyof CustomEra>(key: K, value: CustomEra[K]) => {
      onUpdate({ ...customEra, [key]: value });
    },
    [customEra, onUpdate]
  );

  const colorItems: Array<{ label: string; key: 'bgMain' | 'textMain' | 'accentColor' | 'gridColor' }> = [
    { label: 'BACKGROUND', key: 'bgMain' },
    { label: 'FOREGROUND', key: 'textMain' },
    { label: 'ACCENT', key: 'accentColor' },
    { label: 'GRID', key: 'gridColor' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-main)]/90"
    >
      <div className="bg-[var(--bg-main)] border-2 border-[var(--accent-color)] p-1 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] w-[90vw] max-w-[600px] max-h-[80vh] overflow-y-auto scrollbar-hide">

        {/* Header */}
        <div className="flex justify-between items-center bg-[var(--accent-color)] p-2 mb-4">
          <h2 className="text-[var(--bg-main)] font-mono font-black text-lg uppercase tracking-widest flex items-center gap-2">
            <span className="animate-pulse">&diams;</span> CRAFT YOUR OWN ERA
          </h2>
          <button onClick={onClose} className="text-[var(--bg-main)] font-bold hover:scale-110 transition-transform">
            [ESC]
          </button>
        </div>

        <div className="px-4 mb-4">
          <div className="border border-[var(--accent-color)] bg-[var(--accent-color)]/5 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--accent-color)]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--accent-color)]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--accent-color)]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--accent-color)]" />

            <div className="flex justify-between items-center mb-2 text-[10px] font-mono text-[var(--accent-color)] border-b border-[var(--accent-color)]/30 pb-1">
              <span>DESIGN_LAB</span>
              <span>CUSTOM_MODE</span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-mono font-bold" style={{ color: 'var(--accent-color)' }}>
                Create your own design era
              </p>
              <p className="text-[10px] font-mono leading-tight" style={{ color: 'var(--text-main)' }}>
                Pick colors, choose fonts, and adjust the grid to create a unique look for the portfolio.
                Click &lsquo;INITIALIZE ERA&rsquo; when you&apos;re happy with the result.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">

          {/* Left Column: Controls */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-[10px] font-mono text-[var(--text-muted)] uppercase border-b border-[var(--border-color)] pb-1">
                {'// COLORS'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {colorItems.map((item) => (
                  <div key={item.key} className="flex items-center justify-between bg-[var(--bg-card)] p-2 border border-[var(--border-color)]">
                    <span className="text-[8px] font-mono">{item.label}</span>
                    <input
                      type="color"
                      value={customEra[item.key]}
                      onChange={(e) => updateField(item.key, e.target.value)}
                      className="w-6 h-6 cursor-pointer bg-transparent border-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-mono text-[var(--text-muted)] uppercase border-b border-[var(--border-color)] pb-1">
                {'// FONT SELECTION'}
              </h3>
              <div className="space-y-2">
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => updateField('fontMain', font.value)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-[10px] font-mono border transition-all",
                      customEra.fontMain === font.value
                        ? "bg-[var(--accent-color)] text-[var(--bg-main)] border-[var(--accent-color)]"
                        : "bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-color)] hover:border-[var(--accent-color)]"
                    )}
                    style={{ fontFamily: font.value }}
                  >
                    {font.label} _ SAMPLE TEXT
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Preview & Stats */}
          <div className="space-y-6">
            <div className="border-2 border-[var(--border-color)] h-48 relative overflow-hidden">
              <div
                className="absolute inset-0 transition-colors duration-300"
                style={{ backgroundColor: customEra.bgMain }}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `linear-gradient(${customEra.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${customEra.gridColor} 1px, transparent 1px)`,
                    backgroundSize: `${customEra.gridSize}px ${customEra.gridSize}px`,
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <h1
                    className="text-2xl font-bold mb-2"
                    style={{ color: customEra.textMain, fontFamily: customEra.fontMain }}
                  >
                    HELLO WORLD
                  </h1>
                  <button
                    className="px-4 py-2 text-xs font-bold border-2"
                    style={{
                      color: customEra.bgMain,
                      backgroundColor: customEra.accentColor,
                      borderColor: customEra.accentColor,
                      fontFamily: customEra.fontMain
                    }}
                  >
                    CLICK ME
                  </button>
                </div>
              </div>
              <div className="absolute top-0 left-0 bg-[var(--accent-color)] text-[var(--bg-main)] text-[8px] font-bold px-2 py-1">
                LIVE PREVIEW
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={onApply}
                className="flex-1 bg-[var(--accent-color)] text-[var(--bg-main)] font-bold py-3 text-xs uppercase tracking-wider hover:brightness-110 transition-all"
              >
                INITIALIZE ERA
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN TIME MACHINE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const TimeMachine = () => {
  const { eras, currentEraId, setEra } = useDesignEra();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCustomPanel, setShowCustomPanel] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetEraId, setTargetEraId] = useState('');
  const [targetEraLabel, setTargetEraLabel] = useState('');
  const [customEra, setCustomEra] = useState<CustomEra>(DEFAULT_CUSTOM_ERA);
  const [selectedEraId, setSelectedEraId] = useState<string | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Computed values for three-card layout
  const selectedIndex = selectedEraId
    ? eras.findIndex((e) => e.id === selectedEraId)
    : eras.findIndex((e) => e.id === currentEraId);
  const selectedEra = eras[selectedIndex] || null;
  const prevEra = selectedIndex > 0 ? eras[selectedIndex - 1] : null;
  const nextEra = selectedIndex < eras.length - 1 ? eras[selectedIndex + 1] : null;

  // Load custom era from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kiruk-custom-era');
    if (saved) {
      try {
        setCustomEra(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to load custom era:', e);
      }
    }
  }, []);

  // Save custom era to localStorage
  useEffect(() => {
    localStorage.setItem('kiruk-custom-era', JSON.stringify(customEra));
  }, [customEra]);

  const handleToggle = useCallback(() => {
    if (showCustomPanel) {
      setShowCustomPanel(false);
    } else {
      setIsExpanded(!isExpanded);
    }
  }, [isExpanded, showCustomPanel]);

  const handleSelectEra = useCallback((eraId: string) => {
    setSelectedEraId(eraId);
  }, []);

  const handleApplyEra = useCallback(() => {
    if (!selectedEraId || selectedEraId === currentEraId) return;
    const era = eras.find((e) => e.id === selectedEraId);
    setTargetEraId(selectedEraId);
    setTargetEraLabel(era?.name ?? selectedEraId);
    setIsTransitioning(true);
  }, [selectedEraId, currentEraId, eras]);

  const handleNavigatePrevious = useCallback(() => {
    const currentIndex = selectedEraId
      ? eras.findIndex((e) => e.id === selectedEraId)
      : eras.findIndex((e) => e.id === currentEraId);
    if (currentIndex > 0) {
      setSelectedEraId(eras[currentIndex - 1].id);
    }
  }, [selectedEraId, currentEraId, eras]);

  const handleNavigateNext = useCallback(() => {
    const currentIndex = selectedEraId
      ? eras.findIndex((e) => e.id === selectedEraId)
      : eras.findIndex((e) => e.id === currentEraId);
    if (currentIndex < eras.length - 1) {
      setSelectedEraId(eras[currentIndex + 1].id);
    }
  }, [selectedEraId, currentEraId, eras]);

  // Set selected era to current era when expanded
  useEffect(() => {
    if (isExpanded && !selectedEraId) {
      setSelectedEraId(currentEraId);
    }
  }, [isExpanded, currentEraId, selectedEraId]);

  // Keyboard navigation
  useEffect(() => {
    if (!isExpanded || showCustomPanel) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNavigatePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNavigateNext();
      } else if (e.key === 'Enter' && selectedEraId) {
        e.preventDefault();
        handleApplyEra();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsExpanded(false);
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [
    isExpanded,
    showCustomPanel,
    selectedEraId,
    handleNavigatePrevious,
    handleNavigateNext,
    handleApplyEra,
  ]);

  const handleTransitionComplete = useCallback(() => {
    if (targetEraId) {
      setEra(targetEraId);
    }
    setIsTransitioning(false);
    setIsExpanded(false);
    setShowCustomPanel(false);
    setTargetEraId('');
    setTargetEraLabel('');
    setSelectedEraId(null);
  }, [targetEraId, setEra]);

  const handleOpenCustom = useCallback(() => {
    setShowCustomPanel(true);
  }, []);

  const handleApplyCustomEra = useCallback(() => {
    localStorage.setItem('kiruk-custom-era', JSON.stringify(customEra));
    setTargetEraId('custom');
    setTargetEraLabel(`CUSTOM: ${customEra.name}`);
    setIsTransitioning(true);
  }, [customEra]);

  // Swipe handling for mobile
  const handleDragEnd = useCallback((_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 80) {
      handleNavigatePrevious();
    } else if (info.offset.x < -80) {
      handleNavigateNext();
    }
  }, [handleNavigatePrevious, handleNavigateNext]);

  return (
    <>
      {/* ReactorSwitch - Fixed top-left, always visible */}
      <div
        className="fixed left-0 top-0 z-40"
        style={
          {
            ['--tm-lever-w']: '60px',
          } as React.CSSProperties
        }
      >
        <div className="flex items-center grid-h-3">
          <ReactorSwitch isOn={isExpanded || showCustomPanel} onToggle={handleToggle} />
        </div>
      </div>

      {/* Full-Screen Immersive Overlay */}
      <AnimatePresence mode="wait">
        {isExpanded && !showCustomPanel && (
          <motion.div
            key="time-machine-overlay"
            className="fixed inset-0 z-50 flex flex-col"
            style={{ backgroundColor: 'var(--bg-main)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* TOP BAR */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b-2 border-[var(--border-color)] bg-[var(--bg-card)] flex-shrink-0">
              <button
                onClick={handleToggle}
                className="px-3 py-1.5 font-mono text-xs border-2 border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--text-main)] transition-all"
              >
                &times;
              </button>
              <div className="text-center">
                <h1 className="font-mono text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent-color)]">
                  WHATEVER THE ERA
                </h1>
                <p className="font-mono text-[8px] md:text-[9px] text-[var(--text-muted)] mt-0.5">
                  55 years of interface design. I build for all of them.
                </p>
              </div>
              <button
                onClick={handleOpenCustom}
                className="px-3 py-1.5 font-mono text-[10px] md:text-xs border-2 border-dashed border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-main)] transition-all"
              >
                + CRAFT
              </button>
            </div>

            {/* THREE-COLUMN CARD AREA */}
            <motion.div
              ref={dragRef}
              className="flex-1 flex items-center justify-center gap-4 lg:gap-6 px-4 md:px-8 py-4 overflow-hidden"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              style={{ cursor: 'grab' }}
            >
              {/* Previous Era Card - hidden on small screens */}
              <div className="hidden lg:block w-[220px] xl:w-[260px] flex-shrink-0">
                <EraPreviewCard
                  era={prevEra}
                  position="previous"
                  onClick={handleNavigatePrevious}
                />
              </div>

              {/* Center: Current/Selected Era Story Card */}
              <div className="w-full max-w-[580px] flex-shrink-0">
                <EraStoryCard
                  era={selectedEra}
                  currentEraId={currentEraId}
                  onApply={handleApplyEra}
                />
              </div>

              {/* Next Era Card - hidden on small screens */}
              <div className="hidden lg:block w-[220px] xl:w-[260px] flex-shrink-0">
                <EraPreviewCard
                  era={nextEra}
                  position="next"
                  onClick={handleNavigateNext}
                />
              </div>
            </motion.div>

            {/* HORIZONTAL TIMELINE */}
            <HorizontalTimeline
              eras={eras}
              selectedEraId={selectedEraId}
              currentEraId={currentEraId}
              onSelectEra={handleSelectEra}
            />

            {/* NAVIGATION FOOTER */}
            <NavigationFooter />
          </motion.div>
        )}

        {/* Custom Era Panel */}
        {showCustomPanel && (
          <GameCustomizationPanel
            key="custom-panel"
            customEra={customEra}
            onUpdate={setCustomEra}
            onApply={handleApplyCustomEra}
            onClose={() => setShowCustomPanel(false)}
          />
        )}
      </AnimatePresence>

      {/* Pixel Transition Animation */}
      <PixelTransition
        isActive={isTransitioning}
        onComplete={handleTransitionComplete}
        targetEra={targetEraLabel || targetEraId}
      />
    </>
  );
};

export default TimeMachine;
