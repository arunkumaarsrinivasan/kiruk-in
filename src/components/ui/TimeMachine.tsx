'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GRID_SIZE, cn } from '@/lib/utils';
import { useDesignEra } from '@/contexts/DesignEraContext';
import type { ThemeConfig } from '@/data/portfolio-data';
import { TimelineVisualization } from '@/components/ui/TimeMachine/components/TimelineVisualization';
import { EraDetailsPanel } from '@/components/ui/TimeMachine/components/EraDetailsPanel';
import { NavigationControls } from '@/components/ui/TimeMachine/components/NavigationControls';
import { ComponentBlueprint } from '@/components/ui/wireframe/ComponentBlueprint';

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
      {/* Background glow effect when active */}
      {isOn && (
        <motion.div
          className="absolute inset-0 bg-[var(--accent-color)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Core reactor visual */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* Top indicator */}
        <motion.div
          className={cn(
            'w-1 h-3',
            isOn ? 'bg-[var(--accent-color)]' : 'bg-[var(--border-color)]'
          )}
          animate={isOn ? { opacity: [1, 0.3, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Center circle/reactor core */}
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
            {/* Inner rotating element */}
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

        {/* Bottom indicator */}
        <motion.div
          className={cn(
            'w-1 h-3',
            isOn ? 'bg-[var(--accent-color)]' : 'bg-[var(--border-color)]'
          )}
          animate={isOn ? { opacity: [1, 0.3, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
        />
      </div>

      {/* Corner decorations */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-[var(--border-color)]" />
      <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-[var(--border-color)]" />
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-[var(--border-color)]" />
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-[var(--border-color)]" />

      {/* Label - positioned inside button when at top */}
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
          {/* Vertical pixel bars raining down */}
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

          {/* Center era text */}
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
// POWER LEVER CONSOLE (MINI GAME)
// ═══════════════════════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PowerLeverConsole = ({
  isPanelOpen,
  onLaunch,
  onCollapse,
}: {
  isPanelOpen: boolean;
  onLaunch: () => void;
  onCollapse: () => void;
}) => {
  const shellRef = useRef<HTMLDivElement>(null);
  const [travelPx, setTravelPx] = useState(140);
  const [charge, setCharge] = useState(18);
  const [isPressing, setIsPressing] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    const measure = () => {
      const shell = shellRef.current;
      if (!shell) return;
      const height = shell.getBoundingClientRect().height;
      // 48px knob + padding top/bottom for breathing room.
      setTravelPx(Math.max(80, height - 48 - 42));
    };
    measure();
    globalThis.addEventListener('resize', measure);
    return () => globalThis.removeEventListener('resize', measure);
  }, []);

  // Charge / decay loop to make the lever feel like a mini-game.
  useEffect(() => {
    const id = globalThis.setInterval(() => {
      setCharge((prev) => {
        const delta = isPressing ? 3 + Math.random() * 0.7 : -0.9;
        const next = Math.min(100, Math.max(0, prev + delta));
        return next;
      });
    }, 55);
    return () => globalThis.clearInterval(id);
  }, [isPressing]);

  // Fire the launch once we hit the threshold. Falling below 30% arms it again.
  useEffect(() => {
    if (charge >= 94 && !firedRef.current) {
      firedRef.current = true;
      onLaunch();
    }
    if (charge < 30) {
      firedRef.current = false;
    }
  }, [charge, onLaunch]);

  const knobTop = 18 + ((100 - charge) / 100) * travelPx;
  const status = charge >= 94
    ? 'ARMED'
    : charge >= 60
      ? 'PRIMED'
      : isPressing
        ? 'CHARGING'
        : 'IDLE';

  return (
    <div className="relative" style={{ width: 'var(--tm-lever-w, 80px)' }}>
      <div
        className={cn(
          'relative select-none overflow-hidden',
          'bg-[var(--bg-card)] border-2 border-[var(--border-color)]',
          'shadow-[0_10px_30px_-16px_rgba(0,0,0,0.6)]'
        )}
        style={{ height: 'var(--tm-lever-h, 220px)' }}
      >
        {/* HUD bar */}
        <div className="flex items-center justify-between px-2 py-1 border-b border-[var(--border-color)] bg-[var(--bg-main)]/70">
          <span className="text-[9px] font-mono tracking-[0.08em] text-[var(--text-muted)]">TIME DRIVE</span>
          <span className="text-[10px] font-black font-mono text-[var(--accent-color)]">{Math.round(charge)}%</span>
        </div>

        {/* Lever body */}
        <div ref={shellRef} className="relative h-full flex items-stretch">
          <div className="absolute inset-0" style={{
            background:
              'radial-gradient(80% 30% at 50% 20%, rgba(255,255,255,0.05), transparent 60%), radial-gradient(80% 30% at 50% 90%, rgba(0,255,136,0.07), transparent 60%)',
          }} />

          {/* Sweet spot zone */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-[70%] rounded-full"
            style={{
              top: '22%',
              height: '18%',
              background: 'linear-gradient(180deg, rgba(0,255,136,0.18), rgba(0,255,136,0.05))',
              boxShadow: '0 0 24px rgba(0,255,136,0.1) inset',
            }}
          />

          {/* Track */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-4 bottom-5 w-[10px] rounded-full border border-[var(--border-color)]"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.2))',
              boxShadow: 'inset 0 0 14px rgba(0,0,0,0.5)',
            }}
          >
            <div
              className="absolute inset-x-[2px] bottom-[6px] rounded-full"
              style={{
                height: `${Math.max(8, (charge / 100) * (travelPx + 36))}px`,
                background: 'linear-gradient(180deg, rgba(0,255,136,0.3), rgba(0,255,136,0))',
                boxShadow: '0 0 22px rgba(0,255,136,0.2)',
                transition: 'height 120ms ease-out',
              }}
            />
          </div>

          {/* Lever knob */}
          <motion.button
            type="button"
            className={cn(
              'absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-lg border-2',
              'bg-[var(--bg-main)] text-[var(--text-main)]',
              status === 'ARMED' ? 'border-[var(--accent-color)] shadow-[0_0_18px_rgba(0,255,136,0.35)]' : 'border-[var(--border-color)]'
            )}
            style={{ top: knobTop, touchAction: 'none' }}
            whileTap={{ scale: 0.96 }}
            onPointerDown={() => setIsPressing(true)}
            onPointerUp={() => setIsPressing(false)}
            onPointerLeave={() => setIsPressing(false)}
            aria-label="Charge the time drive"
          >
            <div className="absolute inset-1 border border-[var(--border-color)] opacity-50" />
            <div className="absolute inset-2 grid grid-cols-2 gap-1 opacity-70">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[var(--text-main)]/20 rounded-sm" />
              ))}
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[var(--text-muted)]">
              HOLD
            </span>
          </motion.button>
        </div>

        {/* Footer: status + collapse */}
        <div className="flex items-center justify-between px-2 py-2 border-t border-[var(--border-color)] bg-[var(--bg-main)]/70">
          <div className="flex flex-col leading-tight">
            <span className="text-[9px] font-mono text-[var(--text-muted)]">STATE</span>
            <span className="text-[11px] font-black font-mono tracking-[0.1em] text-[var(--accent-color)]">{status}</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full"
              animate={{ opacity: isPressing ? [1, 0.3, 1] : 1 }}
              transition={{ repeat: isPressing ? Infinity : 0, duration: 0.8 }}
              style={{ backgroundColor: status === 'ARMED' ? 'var(--accent-color)' : 'var(--text-muted)' }}
            />
            <button
              onClick={isPanelOpen ? onCollapse : onLaunch}
              className={cn(
                'px-3 py-1 text-[10px] font-mono border-2 transition-all',
                isPanelOpen
                  ? 'border-[var(--text-main)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]'
                  : 'border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-main)]'
              )}
            >
              {isPanelOpen ? 'COLLAPSE' : 'LAUNCH'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ERA PREVIEW CARD
// ═══════════════════════════════════════════════════════════════════════════════

const EraPreview = ({ era }: { era: ThemeConfig }) => {
  const previewBg = era.colors?.background ?? '#000000';
  const previewText = era.colors?.text ?? '#ffffff';
  const previewAccent = era.colors?.accent ?? era.colors?.primary ?? '#00ff88';
  const previewImg = era.preview;

  return (
    <motion.div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 pointer-events-none z-50"
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 5, scale: 0.9 }}
    >
      <div
        className="w-48 bg-[var(--bg-card)] border-2 border-[var(--accent-color)] p-2 shadow-xl"
      >
        {/* Mini Window Header */}
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-1 mb-2">
          <span className="text-[8px] font-mono uppercase text-[var(--text-muted)]">PREVIEW_MODE</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
          </div>
        </div>

        {/* Preview Content */}
        <div className="h-24 w-full relative overflow-hidden border border-[var(--border-color)]">
          {/* Preview image (if available) */}
          {typeof previewImg === 'string' && previewImg.length > 0 ? (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${previewImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'contrast(1.05) saturate(1.05)',
                opacity: 0.28,
              }}
            />
          ) : null}

          <div className="absolute inset-0" style={{ backgroundColor: previewBg, opacity: 0.9 }} />

          <div className="relative h-full w-full">
            <div className="absolute top-2 left-2 text-[10px] font-bold" style={{ color: previewText }}>
              {era.name}
            </div>
            <div
              className="absolute bottom-2 right-2 px-2 py-0.5 text-[8px] font-bold"
              style={{ backgroundColor: previewAccent, color: previewBg }}
            >
              APPLY
            </div>
            {/* Grid lines */}
            <div
              className="absolute inset-0"
              style={{
                opacity: 0.18,
                backgroundImage: `linear-gradient(${previewText} 1px, transparent 1px), linear-gradient(90deg, ${previewText} 1px, transparent 1px)`,
                backgroundSize: '10px 10px',
              }}
            />
          </div>
        </div>

        <div className="mt-2 flex justify-between text-[8px] font-mono text-[var(--text-muted)]">
          <span>ID: {era.id}</span>
          <span>VER: 1.0</span>
        </div>
      </div>

      {/* Connector Line */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full h-4 w-px bg-[var(--accent-color)]" />
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-[var(--accent-color)] rounded-full -mt-1" />
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// HORIZONTAL ERA STRIP (RESPONSIVE)
// ═══════════════════════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HorizontalEraStrip = ({
  onSelectEra,
  onOpenCustom,
  currentEraId,
}: {
  onSelectEra: (eraId: string) => void;
  onOpenCustom: () => void;
  currentEraId: string;
}) => {
  const { eras } = useDesignEra();
  const [hoveredEra, setHoveredEra] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const currentIndex = eras.findIndex(e => e.id === currentEraId);
      if (currentIndex > 0) {
        scrollRef.current.scrollLeft = currentIndex * 60 - 100;
      }
    }
  }, [currentEraId, eras]);

  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0.92, x: -10 }}
      animate={{ opacity: 1, scaleX: 1, x: 0 }}
      exit={{ opacity: 0, scaleX: 0.92, x: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="overflow-visible"
      style={{ transformOrigin: 'left center' }}
    >
      <div
        className="flex items-stretch bg-[var(--bg-card)] border-2 border-l-0 border-t-0 border-[var(--border-color)] shadow-2xl"
        style={{ height: GRID_SIZE * 6, width: 'calc(100vw - var(--tm-lever-w, 60px))' }}
      >
        {/* Scrollable era list - Responsive Width */}
        <div
          ref={scrollRef}
          className="flex flex-1 items-center gap-1 overflow-x-auto scrollbar-hide px-2"
        >
          {eras.map((era, index) => {
            const isActive = era.id === currentEraId;
            const isHovered = hoveredEra === era.id;

            return (
              <div key={era.id} className="relative group">
                <AnimatePresence>
                  {isHovered && <EraPreview era={era} />}
                </AnimatePresence>

                <motion.button
                  onClick={() => onSelectEra(era.id)}
                  onPointerEnter={() => setHoveredEra(era.id)}
                  onPointerLeave={() => setHoveredEra(null)}
                  onFocus={() => setHoveredEra(era.id)}
                  onBlur={() => setHoveredEra(null)}
                  onTouchStart={() => {
                    setHoveredEra(era.id);
                    if (touchTimerRef.current) {
                      globalThis.clearTimeout(touchTimerRef.current);
                    }
                    touchTimerRef.current = globalThis.setTimeout(() => setHoveredEra(null), 900);
                  }}
                  className={cn(
                    'flex-shrink-0 flex flex-col items-center justify-center px-2 py-1',
                    'border-2 transition-all font-mono relative overflow-hidden',
                    isActive
                      ? 'bg-[var(--accent-color)] text-[var(--bg-main)] border-[var(--accent-color)]'
                      : 'bg-[var(--bg-main)] border-[var(--border-color)] hover:border-[var(--text-main)]'
                  )}
                  style={{
                    width: 60,
                    height: GRID_SIZE * 6 - 16,
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Background Grid Pattern for Button */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '4px 4px' }}
                  />

                  <span className="text-xs font-black z-10">{era.id}</span>
                  <span className="text-[6px] opacity-60 uppercase z-10 mt-1 truncate max-w-[52px]">
                    {era.name.split(':')[0]}
                  </span>

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--bg-main)]"
                    />
                  )}
                </motion.button>
              </div>
            );
          })}
        </div>

        {/* Separator */}
        <div className="w-0.5 bg-[var(--border-color)] mx-1" />

        {/* Custom era button */}
        <motion.button
          onClick={onOpenCustom}
          className={cn(
            'flex-shrink-0 flex flex-col items-center justify-center px-4 mx-1',
            'border-2 border-dashed border-[var(--accent-color)]',
            'text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-main)]',
            'transition-all font-mono group'
          )}
          style={{ height: GRID_SIZE * 6 - 16, alignSelf: 'center' }}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
          <span className="text-[6px] font-bold uppercase mt-1">CRAFT</span>
        </motion.button>
      </div>
    </motion.div>
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
      initial={{ opacity: 0, scale: 0.9, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -20 }}
      className="fixed left-[80px] top-1/2 -translate-y-1/2 z-50"
    >
      <div className="bg-[var(--bg-main)] border-2 border-[var(--accent-color)] p-1 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] w-[80vw] max-w-[600px] max-h-[80vh] overflow-y-auto scrollbar-hide">

        {/* Header */}
        <div className="flex justify-between items-center bg-[var(--accent-color)] p-2 mb-4">
          <h2 className="text-[var(--bg-main)] font-mono font-black text-lg uppercase tracking-widest flex items-center gap-2">
            <span className="animate-pulse">◆</span> WORLD_BUILDER_V1
          </h2>
          <button onClick={onClose} className="text-[var(--bg-main)] font-bold hover:scale-110 transition-transform">
            [ESC]
          </button>
        </div>

        <div className="px-4 mb-4">
          <div className="border border-[var(--accent-color)] bg-[var(--accent-color)]/5 p-4 relative overflow-hidden group">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--accent-color)]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--accent-color)]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--accent-color)]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--accent-color)]" />

            {/* Header Labels */}
            <div className="flex justify-between items-center mb-2 text-[10px] font-mono text-[var(--accent-color)] border-b border-[var(--accent-color)]/30 pb-1">
              <span>DESIGN_LAB_PROTOCOL</span>
              <span>CUSTOMIZATION_MODE</span>
            </div>

            <div className="flex gap-4 items-center">
              <div className="hidden sm:block text-2xl opacity-50">🛠️</div>
              <div className="space-y-1">
                <p className="text-xs font-mono font-bold" style={{ color: 'var(--accent-color)' }}>
                  // SYSTEM OVERRIDE ACTIVE
                </p>
                <p className="text-[10px] font-mono leading-tight" style={{ color: 'var(--text-main)' }}>
                  Adjust chromatic aberration, typography matrix, and grid opacity to craft a unique era.
                  Click 'INITIALIZE ERA' to save and apply your configuration.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">

          {/* Left Column: Controls */}
          <div className="space-y-6">

            {/* Color Section */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-mono text-[var(--text-muted)] uppercase border-b border-[var(--border-color)] pb-1">
                {'// CHROMATIC_ABERRATION'}
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

            {/* Typography Section */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-mono text-[var(--text-muted)] uppercase border-b border-[var(--border-color)] pb-1">
                {'// TYPOGRAPHY_MATRIX'}
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

            {/* Live Preview Box */}
            <div className="border-2 border-[var(--border-color)] h-48 relative overflow-hidden group">
              <div
                className="absolute inset-0 transition-colors duration-300"
                style={{ backgroundColor: customEra.bgMain }}
              >
                {/* Grid Preview */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `linear-gradient(${customEra.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${customEra.gridColor} 1px, transparent 1px)`,
                    backgroundSize: `${customEra.gridSize}px ${customEra.gridSize}px`,
                  }}
                />

                {/* Content Preview */}
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
                LIVE_FEED
              </div>
            </div>

            {/* Stats / Info */}
            <div className="bg-[var(--bg-card)] p-3 border border-[var(--border-color)] font-mono text-[10px]">
              <div className="flex justify-between mb-1">
                <span className="text-[var(--text-muted)]">CONTRAST RATIO</span>
                <span className="text-[var(--accent-color)]">AAA</span>
              </div>
              <div className="w-full bg-[var(--bg-main)] h-1 mb-3">
                <div className="w-[85%] h-full bg-[var(--accent-color)]" />
              </div>

              <div className="flex justify-between mb-1">
                <span className="text-[var(--text-muted)]">RETRO FACTOR</span>
                <span className="text-[var(--accent-color)]">92%</span>
              </div>
              <div className="w-full bg-[var(--bg-main)] h-1">
                <div className="w-[92%] h-full bg-[var(--accent-color)]" />
              </div>
            </div>

            {/* Action Buttons */}
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
    // Just select for preview, don't apply yet
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

  const handleJumpToDecade = useCallback(
    (decade: string) => {
      const firstEra = eras.find((era) => {
        const yearNum = Number.parseInt(era.id, 10);
        const eraDecade = `${Math.floor(yearNum / 10) * 10}s`;
        return eraDecade === decade;
      });
      if (firstEra) {
        setSelectedEraId(firstEra.id);
      }
    },
    [eras]
  );

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
    // Persist, then switch to the custom theme through the real theme system.
    // ThemeContext will apply --bg-main/etc for the custom era.
    localStorage.setItem('kiruk-custom-era', JSON.stringify(customEra));

    setTargetEraId('custom');
    setTargetEraLabel(`CUSTOM: ${customEra.name}`);
    setIsTransitioning(true);
  }, [customEra]);

  return (
    <>
      {/* Time Machine - Fixed top left */}
      <div
        className="fixed left-0 top-0 z-40"
        style={
          {
            // Responsive lever sizing - match header height (GRID_SIZE * 3 = 60px)
            ['--tm-lever-w']: '60px',
            ['--tm-lever-h']: 'clamp(160px, 24vh, 260px)',
          } as React.CSSProperties
        }
      >
        {/* Reactor Switch - aligned to header */}
        <div className="flex items-center grid-h-3">
          <ReactorSwitch isOn={isExpanded || showCustomPanel} onToggle={handleToggle} />
        </div>

        {/* New Timeline Panel OR Custom Panel - appears below header */}
        <AnimatePresence mode="wait">
          {isExpanded && !showCustomPanel && (
            <motion.div
              key="timeline-panel"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid-my-3"
            >
              <div
                className="bg-[var(--bg-main)] border-2 border-l-0 border-t-0 border-[var(--border-color)] shadow-2xl"
                style={{
                  width: 'calc(100vw - var(--tm-lever-w, 60px))',
                  maxWidth: '1200px',
                  height: 'clamp(600px, 80vh, 800px)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between p-3 lg:p-4 border-b-2 border-[var(--border-color)] bg-[var(--bg-card)] flex-shrink-0">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-mono text-sm lg:text-lg font-bold uppercase text-[var(--text-main)]">
                      TIME MACHINE
                    </h2>
                    <p className="font-mono text-[10px] lg:text-xs text-[var(--text-muted)] mt-1">
                      Travel through design history: 1970 → 2025
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={handleOpenCustom}
                      className="px-2 lg:px-3 py-1 lg:py-1.5 font-mono text-[10px] lg:text-xs border-2 border-dashed border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-main)] transition-all"
                    >
                      + CRAFT
                    </button>
                    <button
                      onClick={handleToggle}
                      className="px-2 lg:px-3 py-1 lg:py-1.5 font-mono text-[10px] lg:text-xs border-2 border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--text-main)] transition-all"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Split Panel Content - Responsive */}
                <div className="px-4 py-2 flex-shrink-0">
                  <ComponentBlueprint
                    title="CHRONO_GUIDE"
                    componentType="SYSTEM_MANUAL"
                    rulerLabelTop="TIME_TRAVEL_PROTOCOL"
                    rulerLabelLeft="INSTRUCTIONS"
                    className="mb-2"
                  >
                    <div className="flex gap-4 items-start">
                      <div className="hidden sm:block text-4xl p-2 opacity-50">
                        🕰️
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-mono font-bold" style={{ color: 'var(--accent-color)' }}>
                          // WELCOME TO THE ARCHIVE
                        </p>
                        <p className="text-xs font-mono" style={{ color: 'var(--text-main)' }}>
                          This observatory tracks the evolution of design across decades.
                          Select an era to preview its aesthetic, or initialize the reactor to time-travel.
                        </p>
                        <div className="flex gap-4 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full border border-[var(--accent-color)]" />
                            PREVIEW
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[var(--accent-color)]" />
                            ACTIVE
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 border border-dashed border-[var(--text-muted)]" />
                            FUTURE
                          </span>
                        </div>
                      </div>
                    </div>
                  </ComponentBlueprint>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                  {/* Left: Timeline */}
                  <div className="w-full lg:w-80 flex-shrink-0 border-b-2 lg:border-b-0 lg:border-r-2 border-[var(--border-color)]">
                    <TimelineVisualization
                      eras={eras}
                      currentEraId={currentEraId}
                      selectedEraId={selectedEraId}
                      onSelectEra={handleSelectEra}
                      onHoverEra={() => { }}
                    />
                  </div>

                  {/* Right: Era Details */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 overflow-hidden">
                      <EraDetailsPanel
                        era={
                          selectedEraId
                            ? eras.find((e) => e.id === selectedEraId) || null
                            : null
                        }
                        onApply={handleApplyEra}
                      />
                    </div>

                    {/* Bottom: Navigation Controls */}
                    <NavigationControls
                      eras={eras}
                      currentEraId={currentEraId}
                      selectedEraId={selectedEraId}
                      onPrevious={handleNavigatePrevious}
                      onNext={handleNavigateNext}
                      onJumpToDecade={handleJumpToDecade}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {showCustomPanel && (
            <div className="grid-my-3">
              <GameCustomizationPanel
                key="custom-panel"
                customEra={customEra}
                onUpdate={setCustomEra}
                onApply={handleApplyCustomEra}
                onClose={() => setShowCustomPanel(false)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

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
