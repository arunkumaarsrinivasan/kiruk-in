'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GRID_SIZE, cn } from '@/lib/utils';
import { useDesignEra } from '@/contexts/DesignEraContext';
import { PixelIcon } from '@/components/ui/PixelIcon';

const TE_TIMING = {
  instant: 0.08,
  quick: 0.15,
};

// Z-index layers for proper stacking
const Z_LAYERS = {
  base: 50,
  arcade: 50,
  timeline: 65, // Timeline above arcade when expanded
  nav: 50,
};


// Pixelated Oval Eye for header
const PixelEye = ({ size = 52 }: { size?: number }) => {
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const eyeRef = useRef<HTMLDivElement>(null);
  
  const cols = 13;
  const rows = 9;
  const pixelSize = Math.floor(size / cols);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!eyeRef.current) return;
      const rect = eyeRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;
      const deltaX = e.clientX - eyeCenterX;
      const deltaY = e.clientY - eyeCenterY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxMove = pixelSize * 2;
      const moveAmount = Math.min(distance / 10, maxMove);
      setPupilPos({
        x: Math.cos(angle) * moveAmount,
        y: Math.sin(angle) * moveAmount,
      });
    };
    globalThis.addEventListener('mousemove', handleMouseMove);
    return () => globalThis.removeEventListener('mousemove', handleMouseMove);
  }, [pixelSize]);

  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    };
    const interval = setInterval(() => {
      if (Math.random() > 0.7) blink();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const eyePattern = [
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  ];

  const blinkPattern = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  const currentPattern = isBlinking ? blinkPattern : eyePattern;

  return (
    <div 
      ref={eyeRef}
      className="relative"
      style={{ width: cols * pixelSize, height: rows * pixelSize }}
    >
      <div 
        className="absolute inset-0 grid"
        style={{ 
          gridTemplateColumns: `repeat(${cols}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${pixelSize}px)`,
        }}
      >
        {currentPattern.flat().map((pixel, i) => (
          <div 
            key={i} 
            style={{ 
              backgroundColor: pixel === 1 ? 'var(--bg-main)' : 'transparent',
              width: pixelSize,
              height: pixelSize,
            }} 
          />
        ))}
      </div>
      
      {!isBlinking && (
        <motion.div
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            marginLeft: -pixelSize,
            marginTop: -pixelSize,
          }}
          animate={{ x: pupilPos.x, y: pupilPos.y }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(2, ${pixelSize}px)`,
              gridTemplateRows: `repeat(2, ${pixelSize}px)`,
            }}
          >
            <div style={{ width: pixelSize, height: pixelSize, backgroundColor: 'var(--text-main)' }} />
            <div style={{ width: pixelSize, height: pixelSize, backgroundColor: 'var(--text-main)' }} />
            <div style={{ width: pixelSize, height: pixelSize, backgroundColor: 'var(--text-main)' }} />
            <div />
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Section Label - Shows what each part is
const _SectionLabel = ({ label, position }: { label: string; position: 'left' | 'center' | 'right' }) => (
  <div 
    className={cn(
      "absolute -bottom-4 text-[7px] font-mono uppercase tracking-wider text-[var(--text-muted)] opacity-60",
      position === 'left' && "left-2",
      position === 'center' && "left-1/2 -translate-x-1/2",
      position === 'right' && "right-2"
    )}
  >
    {label}
  </div>
);

// Timeline Component - Pixel Art Time Machine Device
// Redesigned with Past/Now/Future framing for intuitive navigation
const HeaderTimeline = ({ 
  isExpanded, 
  onToggle 
}: { 
  isExpanded: boolean; 
  onToggle: () => void;
}) => {
  const { eras, currentEraId, setEra } = useDesignEra();
  const [sliderIndex, setSliderIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const autoCloseRef = useRef<NodeJS.Timeout | null>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get era period label (Past/Now/Future-ish)
  const getEraPeriod = (year: string) => {
    const yearNum = parseInt(year);
    if (yearNum < 1990) return 'RETRO';
    if (yearNum < 2000) return 'CLASSIC';
    if (yearNum < 2010) return 'WEB 2.0';
    if (yearNum < 2020) return 'MODERN';
    return 'NOW';
  };

  useEffect(() => {
    if (!eras.length) return;
    const activeIndex = Math.max(0, eras.findIndex((theme) => theme.id === currentEraId));
    setSliderIndex(activeIndex === -1 ? 0 : activeIndex);
  }, [eras, currentEraId]);

  useEffect(() => {
    if (isExpanded) {
      autoCloseRef.current = setTimeout(onToggle, 12000);
    }
    return () => {
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, [isExpanded, onToggle]);

  // Track the next era to apply after slider index changes (avoids setState during render)
  const pendingEraRef = useRef<string | null>(null);

  // Auto-play through eras
  useEffect(() => {
    if (isPlaying && eras.length) {
      playIntervalRef.current = setInterval(() => {
        setSliderIndex(prev => {
          const next = prev + 1;
          if (next >= eras.length) {
            setIsPlaying(false);
            return prev;
          }
          const nextEra = eras[next];
          if (nextEra) {
            // Store the era to apply, don't call setEra here
            pendingEraRef.current = nextEra.id;
          }
          return next;
        });
      }, 600);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, eras]);

  // Apply pending era change after slider index updates
  useEffect(() => {
    if (pendingEraRef.current) {
      setEra(pendingEraRef.current);
      pendingEraRef.current = null;
    }
  }, [sliderIndex, setEra]);

  const navigateEra = useCallback((direction: number) => {
    const newIndex = Math.max(0, Math.min(eras.length - 1, sliderIndex + direction));
    const nextEra = eras[newIndex];
    if (nextEra && newIndex !== sliderIndex) {
      setSliderIndex(newIndex);
      setEra(nextEra.id);
    }
  }, [sliderIndex, eras, setEra]);

  const handleEraSelect = (index: number) => {
    const nextEra = eras[index];
    if (nextEra) {
      setSliderIndex(index);
      setEra(nextEra.id);
      setIsPlaying(false);
    }
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    autoCloseRef.current = setTimeout(onToggle, 8000);
  };

  if (!eras.length) return null;

  const BAR_HEIGHT = GRID_SIZE * 3;
  const DEVICE_WIDTH = GRID_SIZE * 12; // 240px wide

  // Pixel-style button component
  const PixelButton = ({ 
    children, 
    onClick, 
    active = false,
    width = GRID_SIZE * 2,
    title
  }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    active?: boolean;
    width?: number;
    title?: string;
  }) => (
    <motion.button
      className={cn(
        'flex items-center justify-center group relative',
        'border-2 font-mono font-bold',
        'transition-colors',
        active 
          ? 'bg-[var(--accent-color)] text-[var(--bg-main)] border-[var(--accent-color)]' 
          : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] hover:border-[var(--text-main)]'
      )}
      style={{ 
        width, 
        height: BAR_HEIGHT - 8,
        imageRendering: 'pixelated',
      }}
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      title={title}
    >
      {children}
      {/* Tooltip */}
      {title && (
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[var(--text-main)] text-[var(--bg-main)] text-[7px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          {title}
        </div>
      )}
    </motion.button>
  );

  return (
    <>
      {/* Device Housing - Pixel Art Style */}
      <div
        className="relative flex items-center gap-1 px-1 bg-[var(--bg-card)] border-y border-r-2 border-[var(--border-color)]"
        style={{ 
          width: DEVICE_WIDTH, 
          height: BAR_HEIGHT,
          imageRendering: 'pixelated',
        }}
      >
        {/* Keyboard hint */}
        <span className="absolute top-0 left-1 text-[6px] font-mono opacity-30">T</span>

        {/* REW Button - Go to Past */}
        <PixelButton onClick={() => navigateEra(-1)} width={GRID_SIZE * 1.5} title="← Past era">
          <PixelIcon name="angle-left" size={12} />
        </PixelButton>

        {/* LCD Screen - Main Display */}
        <motion.button
          className={cn(
            'flex-1 flex items-center justify-between px-2 group',
            'bg-[var(--bg-main)] border-2 border-[var(--border-color)]',
            'cursor-pointer',
            'hover:border-[var(--accent-color)]'
          )}
          style={{ height: BAR_HEIGHT - 8 }}
          onClick={onToggle}
          whileTap={{ scale: 0.98 }}
        >
          {/* Left: Era Period Label */}
          <div className="flex flex-col items-start">
            <span className="text-[6px] font-mono opacity-50 uppercase">
              {getEraPeriod(currentEraId)}
            </span>
            <motion.div 
              className={cn(
                'w-2 h-2',
                isPlaying ? 'bg-green-500' : 'bg-[var(--accent-color)]'
              )}
              animate={isPlaying ? { opacity: [1, 0.3, 1] } : {}}
              transition={{ duration: 0.4, repeat: Infinity }}
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Center: Year */}
          <div className="flex flex-col items-center">
            <span 
              className="font-mono font-black tracking-tight text-[var(--accent-color)]"
              style={{ fontSize: 16, lineHeight: 1, fontFamily: 'monospace' }}
            >
              {currentEraId}
            </span>
            {/* Progress pixels */}
            <div className="flex gap-px mt-0.5">
              {eras.slice(0, Math.min(eras.length, 12)).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-1 h-1',
                    i === sliderIndex 
                      ? 'bg-[var(--accent-color)]' 
                      : i < sliderIndex 
                        ? 'bg-[var(--text-main)]/50' 
                        : 'bg-[var(--text-main)]/20'
                  )}
                  style={{ imageRendering: 'pixelated' }}
                />
              ))}
              {eras.length > 12 && (
                <span className="text-[6px] font-mono opacity-40 ml-0.5">+{eras.length - 12}</span>
              )}
            </div>
          </div>

          {/* Right: Expand hint */}
          <div className="flex flex-col items-end">
            <span className="text-[5px] font-mono opacity-40">PICK ERA</span>
            <motion.div
              animate={{ y: [0, 2, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <PixelIcon name="angle-down" size={10} />
            </motion.div>
          </div>

          {/* Tooltip */}
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[var(--text-main)] text-[var(--bg-main)] text-[7px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            Click to choose design era (T)
          </div>
        </motion.button>

        {/* FF Button - Go to Future/Now */}
        <PixelButton onClick={() => navigateEra(1)} width={GRID_SIZE * 1.5} title="Future era →">
          <PixelIcon name="angle-right" size={12} />
        </PixelButton>

        {/* Play/Pause Button - Auto-journey */}
        <PixelButton 
          onClick={() => setIsPlaying(!isPlaying)} 
          active={isPlaying}
          width={GRID_SIZE * 1.5}
          title={isPlaying ? 'Pause time travel' : 'Auto time travel'}
        >
          <PixelIcon name={isPlaying ? 'pause' : 'play'} size={10} />
        </PixelButton>
      </div>

      {/* Expanded Panel - Pixel Grid Selector */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="timeline-panel"
            initial={{ opacity: 0, y: -8, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.9 }}
            transition={{ duration: 0.12 }}
            className="fixed bg-[var(--bg-main)] border-2 border-[var(--border-color)] shadow-xl"
            style={{ 
              top: BAR_HEIGHT + 4,
              left: GRID_SIZE * 4,
              zIndex: Z_LAYERS.timeline,
              width: GRID_SIZE * 20,
              imageRendering: 'pixelated',
            }}
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-2 py-1.5 bg-[var(--bg-card)] border-b-2 border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <PixelIcon name="clock" size={12} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                    Design Era Picker
                  </span>
                  <span className="text-[7px] font-mono opacity-50">
                    See how interfaces evolved
                  </span>
                </div>
              </div>
              
              {/* Transport Controls */}
              <div className="flex items-center gap-1">
                <motion.button
                  className="w-6 h-6 flex items-center justify-center border-2 border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] font-mono text-[10px] group relative"
                  onClick={() => { setSliderIndex(0); if (eras[0]) setEra(eras[0].id); setIsPlaying(false); }}
                  whileTap={{ scale: 0.9 }}
                  title="Jump to 1970"
                >
                  ⏮
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[var(--text-main)] text-[var(--bg-main)] text-[6px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    Retro
                  </div>
                </motion.button>
                <motion.button
                  className={cn(
                    'w-6 h-6 flex items-center justify-center border-2 font-mono text-[10px] group relative',
                    isPlaying 
                      ? 'bg-[var(--accent-color)] text-[var(--bg-main)] border-[var(--accent-color)]' 
                      : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]'
                  )}
                  onClick={() => setIsPlaying(!isPlaying)}
                  whileTap={{ scale: 0.9 }}
                  title={isPlaying ? 'Pause' : 'Play through time'}
                >
                  {isPlaying ? '⏸' : '▶'}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[var(--text-main)] text-[var(--bg-main)] text-[6px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {isPlaying ? 'Pause' : 'Auto-play'}
                  </div>
                </motion.button>
                <motion.button
                  className="w-6 h-6 flex items-center justify-center border-2 border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] font-mono text-[10px] group relative"
                  onClick={() => { setSliderIndex(eras.length - 1); if (eras[eras.length - 1]) setEra(eras[eras.length - 1].id); setIsPlaying(false); }}
                  whileTap={{ scale: 0.9 }}
                  title="Jump to now"
                >
                  ⏭
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[var(--text-main)] text-[var(--bg-main)] text-[6px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    Present
                  </div>
                </motion.button>
              </div>

              <motion.button
                className="w-6 h-6 flex items-center justify-center border-2 border-[var(--border-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]"
                onClick={onToggle}
                whileTap={{ scale: 0.9 }}
                title="Close (Esc)"
              >
                <PixelIcon name="times" size={10} />
              </motion.button>
            </div>

            {/* Era Grid */}
            <div className="p-2 relative z-10">
              <div className="grid grid-cols-5 gap-1">
                {eras.map((era, index) => {
                  const isActive = era.id === currentEraId;
                  const isPast = index < sliderIndex;
                  
                  return (
                    <motion.button
                      key={era.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEraSelect(index);
                      }}
                      className={cn(
                        'relative py-2.5 font-mono font-bold cursor-pointer group',
                        'border-2 transition-all',
                        'select-none',
                        isActive 
                          ? 'bg-[var(--accent-color)] text-[var(--bg-main)] border-[var(--accent-color)]' 
                          : isPast
                            ? 'bg-[var(--text-main)]/10 border-[var(--text-main)]/30 hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] hover:border-[var(--text-main)]'
                            : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] hover:border-[var(--text-main)]'
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ imageRendering: 'pixelated' }}
                    >
                      {/* Corner pixel decorations - pointer-events-none to not block clicks */}
                      <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-current opacity-30 pointer-events-none" />
                      <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-current opacity-30 pointer-events-none" />
                      <div className="absolute bottom-0.5 left-0.5 w-1 h-1 bg-current opacity-30 pointer-events-none" />
                      <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-current opacity-30 pointer-events-none" />
                      
                      <span className="relative z-10 pointer-events-none" style={{ fontSize: isActive ? 12 : 10 }}>{era.id}</span>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div 
                          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-1 bg-[var(--bg-main)] pointer-events-none"
                          layoutId="pixelIndicator"
                        />
                      )}

                      {/* Tooltip showing era period */}
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[var(--text-main)] text-[var(--bg-main)] text-[6px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {getEraPeriod(era.id)}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Progress Track - Full width clickable */}
              <div className="mt-3 px-1">
                <div className="flex items-center gap-1">
                  <span className="text-[8px] font-mono opacity-50">PAST</span>
                  <div 
                    className="flex-1 h-3 bg-[var(--bg-card)] border border-[var(--border-color)] cursor-pointer relative"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percent = x / rect.width;
                      const newIndex = Math.round(percent * (eras.length - 1));
                      const clampedIndex = Math.max(0, Math.min(eras.length - 1, newIndex));
                      handleEraSelect(clampedIndex);
                    }}
                  >
                    {/* Progress fill */}
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-[var(--accent-color)]"
                      initial={false}
                      animate={{ width: `${((sliderIndex + 1) / eras.length) * 100}%` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                    {/* Playhead indicator */}
                    <motion.div
                      className="absolute top-0 bottom-0 w-1 bg-[var(--text-main)]"
                      initial={false}
                      animate={{ left: `${(sliderIndex / (eras.length - 1)) * 100}%` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      style={{ marginLeft: -2 }}
                    />
                    {/* Era tick marks */}
                    {eras.map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 w-px bg-[var(--border-color)]/50"
                        style={{ left: `${(i / (eras.length - 1)) * 100}%` }}
                      />
                    ))}
                  </div>
                  <span className="text-[8px] font-mono opacity-50">NOW</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-2 py-1.5 bg-[var(--bg-card)] border-t-2 border-[var(--border-color)]">
              <div className="flex items-center gap-1">
                <PixelIcon name="sparkles" size={10} />
                <span className="text-[8px] font-mono opacity-60">
                  Click any year to see how interfaces looked then
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold text-[var(--accent-color)]">
                KIRUK
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false); // Start collapsed
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: '/', label: 'Home', icon: 'home', shortcut: '1', hint: 'Start here' },
    { href: '/about', label: 'About', icon: 'user', shortcut: '2', hint: 'Who is Arun?' },
    { href: '/work', label: 'Work', icon: 'grid', shortcut: '3', hint: 'Things I made' },
    { href: '/case-studies', label: 'Projects', icon: 'folder', shortcut: '4', hint: 'Deep dives' },
    { href: '/progress', label: 'Progress', icon: 'chart', shortcut: '5', hint: 'Journey log' },
    { href: '/arcade', label: 'Arcade', icon: 'globe', shortcut: '6', hint: 'Play mini games' },
    { href: '/contact', label: 'Contact', icon: 'envelope', shortcut: '7', hint: 'Say hello' },
  ];

  const BAR_HEIGHT = GRID_SIZE * 3;
  const IDENTITY_WIDTH = GRID_SIZE * 4;
  const NAV_ITEM_WIDTH = GRID_SIZE * 3.5;
  const NAV_COLLAPSED_WIDTH = GRID_SIZE * 2;

  // Find current nav index for progress indicator
  const currentNavIndex = navItems.findIndex(item => item.href === pathname);

  return (
    <header
      id="navigation"
      className="fixed top-0 left-0 right-0 z-50 flex"
      style={{ height: BAR_HEIGHT }}
      role="banner"
    >
      {/* ══════════════════════════════════════════════════════════════════
          LEFT SECTION: Brand Identity + Era Timeline
          ══════════════════════════════════════════════════════════════════ */}
      <div className="relative flex">
        {/* Pixelated Eye - Brand Identity */}
        <motion.div
          className="flex items-center justify-center bg-[var(--text-main)] text-[var(--bg-main)] border border-[var(--border-color)] cursor-pointer"
          style={{ width: IDENTITY_WIDTH, height: BAR_HEIGHT }}
          onClick={() => router.push('/')}
          whileHover={{ scale: 0.95 }}
          whileTap={{ scale: 0.9 }}
          title="Home"
        >
          <PixelEye size={52} />
        </motion.div>

        {/* Timeline (inline expandable) */}
        <HeaderTimeline 
          isExpanded={isTimelineExpanded} 
          onToggle={() => setIsTimelineExpanded(prev => !prev)} 
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          CENTER SECTION: Spacer (Arcade controls positioned via fixed)
          Clean background - arcade controls overlay this area
          ══════════════════════════════════════════════════════════════════ */}
      <div 
        className="relative flex-1 border-y border-[var(--border-color)] bg-[var(--bg-main)]"
      />

      {/* ══════════════════════════════════════════════════════════════════
          RIGHT SECTION: Collapsible Navigation Menu
          ══════════════════════════════════════════════════════════════════ */}
      <nav className="relative flex" aria-label="Main navigation" role="navigation">
        <AnimatePresence mode="wait">
          {isNavExpanded ? (
            /* Expanded Navigation */
            <motion.div 
              key="expanded-nav"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: TE_TIMING.quick }}
              className="flex"
            >
              {navItems.map((item, index) => {
                const isActive = mounted && pathname === item.href;
                const isHovered = hoveredNav === item.href;

                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'relative flex flex-col items-center justify-center group',
                      'border border-l-0 border-[var(--border-color)]',
                      'transition-colors duration-100',
                      isActive
                        ? 'bg-[var(--accent-color)] text-[var(--bg-main)]'
                        : 'bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]'
                    )}
                    style={{ 
                      width: NAV_ITEM_WIDTH, 
                      height: BAR_HEIGHT,
                    }}
                    whileHover={{ scale: 0.95 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: TE_TIMING.instant }}
                    onMouseEnter={() => setHoveredNav(item.href)}
                    onMouseLeave={() => setHoveredNav(null)}
                  >
                    <span className="absolute top-0.5 left-1 text-[6px] font-mono opacity-40">
                      {item.shortcut}
                    </span>
                    <motion.div 
                      className="leading-none"
                      animate={isActive ? { scale: [1, 1.1, 1] } : isHovered ? { y: -2 } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <PixelIcon name={item.icon} size={18} />
                    </motion.div>
                    <span className="text-[7px] font-mono uppercase tracking-wider mt-1">
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.span 
                        className="absolute bottom-0.5 text-[5px]"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        ◆
                      </motion.span>
                    )}
                    {/* Progress bar under each item */}
                    {index <= currentNavIndex && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent-color)]"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        style={{ transformOrigin: 'left' }}
                      />
                    )}
                    {/* Tooltip with hint */}
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[var(--text-main)] text-[var(--bg-main)] text-[7px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {item.hint} ({item.shortcut})
                    </div>
                  </motion.a>
                );
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Collapse/Expand Toggle - Shows nav icon when collapsed */}
        <motion.button
          className={cn(
            'relative flex flex-col items-center justify-center group',
            'border border-l-0 border-[var(--border-color)]',
            'cursor-pointer select-none',
            'transition-colors duration-100',
            'bg-[var(--bg-card)] text-[var(--text-main)]',
            'hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]'
          )}
          style={{ width: NAV_COLLAPSED_WIDTH, height: BAR_HEIGHT }}
          onClick={() => setIsNavExpanded(prev => !prev)}
          whileHover={{ scale: 0.95 }}
          whileTap={{ scale: 0.9 }}
          title={isNavExpanded ? "Collapse nav (N)" : "Expand nav (N)"}
        >
          <span className="absolute top-0.5 left-1 text-[6px] font-mono opacity-40">N</span>
          <motion.div
            initial={false}
            animate={{ rotate: isNavExpanded ? 0 : 0 }}
            transition={{ duration: TE_TIMING.quick }}
          >
            <PixelIcon name={isNavExpanded ? 'times' : 'bars'} size={16} />
          </motion.div>
          <span className="text-[5px] font-mono opacity-60">
            {isNavExpanded ? 'LESS' : 'MENU'}
          </span>
          {/* Tooltip */}
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[var(--text-main)] text-[var(--bg-main)] text-[7px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            {isNavExpanded ? 'Minimize (N)' : 'Show menu (N)'}
          </div>
        </motion.button>
      </nav>
    </header>
  );
};

export default Navigation;
