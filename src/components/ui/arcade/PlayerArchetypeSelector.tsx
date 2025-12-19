'use client';

/**
 * PlayerArchetypeSelector Component
 * 
 * "Who are you today?" - A playful selector that lets visitors identify
 * themselves, subtly changing the experience tone and what gets highlighted.
 * 
 * Archetypes:
 * - 🎨 Curious Designer - Highlights design process, case studies
 * - 🔧 Tech Explorer - Emphasizes code, architecture, tools
 * - 💼 Recruiter in a Hurry - Quick facts, resume highlights
 * - 🌊 Just Vibing - Chill mode, easter eggs, fun facts
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, GRID_SIZE } from '@/lib/utils';

export type PlayerArchetype = 'designer' | 'explorer' | 'recruiter' | 'vibing';

export interface ArchetypeInfo {
  id: PlayerArchetype;
  emoji: string;
  label: string;
  shortLabel: string;
  description: string;
  greeting: string;
  hint: string;
  accentHue?: number; // Optional hue shift for theming
}

export const ARCHETYPES: Record<PlayerArchetype, ArchetypeInfo> = {
  designer: {
    id: 'designer',
    emoji: '🎨',
    label: 'Curious Designer',
    shortLabel: 'Designer',
    description: 'Show me the process & pixels',
    greeting: 'Welcome, fellow pixel pusher!',
    hint: 'Explore case studies & design breakdowns',
    accentHue: 280, // Purple-ish
  },
  explorer: {
    id: 'explorer',
    emoji: '🔧',
    label: 'Tech Explorer',
    shortLabel: 'Explorer',
    description: 'I want the technical deep-dives',
    greeting: 'Ahoy, code adventurer!',
    hint: 'Discover architecture & tech stack details',
    accentHue: 160, // Teal
  },
  recruiter: {
    id: 'recruiter',
    emoji: '💼',
    label: 'Recruiter Mode',
    shortLabel: 'Recruiter',
    description: 'Just the highlights, please',
    greeting: "Let's cut to the chase!",
    hint: 'Quick access to resume & key achievements',
    accentHue: 45, // Amber
  },
  vibing: {
    id: 'vibing',
    emoji: '🌊',
    label: 'Just Vibing',
    shortLabel: 'Vibing',
    description: "I'm here to explore & chill",
    greeting: 'Welcome to the playground!',
    hint: 'Unlock easter eggs & fun interactions',
    accentHue: 200, // Sky blue
  },
};

// Pixel Icon component
const PixelIcon = ({ name, size = 16, className }: { name: string; size?: number; className?: string }) => {
  const ICON_PATHS: Record<string, string> = {
    'user': 'solid/user-solid.svg',
    'angle-down': 'solid/angle-down-solid.svg',
    'times': 'solid/times-solid.svg',
    'check': 'solid/check-solid.svg',
  };
  
  const iconPath = ICON_PATHS[name];
  if (!iconPath) return <span className="font-mono" style={{ fontSize: size }}>?</span>;

  return (
    <span
      className={cn('inline-block', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url(/icons/${iconPath})`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskImage: `url(/icons/${iconPath})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
      }}
    />
  );
};

interface PlayerArchetypeSelectorProps {
  onSelect?: (archetype: PlayerArchetype) => void;
  currentArchetype?: PlayerArchetype;
  className?: string;
  compact?: boolean;
}

export const PlayerArchetypeSelector: React.FC<PlayerArchetypeSelectorProps> = ({
  onSelect,
  currentArchetype,
  className,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<PlayerArchetype | null>(
    currentArchetype || null
  );
  const [showGreeting, setShowGreeting] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('playerArchetype') as PlayerArchetype;
    if (stored && ARCHETYPES[stored]) {
      setSelectedArchetype(stored);
    }
  }, []);

  // Show greeting when archetype changes
  useEffect(() => {
    if (selectedArchetype) {
      setShowGreeting(true);
      const timer = setTimeout(() => setShowGreeting(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedArchetype]);

  const handleSelect = useCallback((archetype: PlayerArchetype) => {
    setSelectedArchetype(archetype);
    localStorage.setItem('playerArchetype', archetype);
    onSelect?.(archetype);
    setIsOpen(false);
  }, [onSelect]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // P to toggle player selector
      if (e.key === 'p' || e.key === 'P') {
        setIsOpen(prev => !prev);
      }
      // 1-4 to quick select when open
      if (isOpen) {
        const archetypeKeys: PlayerArchetype[] = ['designer', 'explorer', 'recruiter', 'vibing'];
        const num = parseInt(e.key);
        if (num >= 1 && num <= 4) {
          handleSelect(archetypeKeys[num - 1]);
        }
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleSelect]);

  const currentInfo = selectedArchetype ? ARCHETYPES[selectedArchetype] : null;
  const BAR_HEIGHT = GRID_SIZE * 3;

  return (
    <div className={cn('relative', className)}>
      {/* Main Button */}
      <motion.button
        className={cn(
          'relative flex items-center justify-center gap-2',
          'border border-[var(--border-color)]',
          'cursor-pointer select-none',
          selectedArchetype
            ? 'bg-[var(--bg-card)] text-[var(--text-main)]'
            : 'bg-[var(--accent-color)] text-[var(--bg-main)]',
          'hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]',
          'transition-colors duration-100'
        )}
        style={{ 
          height: BAR_HEIGHT,
          padding: compact ? '0 8px' : '0 12px',
          minWidth: compact ? GRID_SIZE * 3 : GRID_SIZE * 6,
        }}
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 0.98 }}
        whileTap={{ scale: 0.95 }}
        title="P to change player type"
      >
        <span className="absolute top-0.5 left-1 text-[6px] font-mono opacity-40">P</span>
        
        {currentInfo ? (
          <>
            <motion.span 
              className="text-lg"
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {currentInfo.emoji}
            </motion.span>
            {!compact && (
              <div className="flex flex-col items-start">
                <span className="text-[7px] font-mono opacity-50 uppercase">Playing as</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-tight">
                  {currentInfo.shortLabel}
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <motion.span 
              className="text-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              👋
            </motion.span>
            {!compact && (
              <div className="flex flex-col items-start">
                <span className="text-[7px] font-mono opacity-70 uppercase">Who are you</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-tight">today?</span>
              </div>
            )}
          </>
        )}
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <PixelIcon name="angle-down" size={10} />
        </motion.div>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.9 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1 bg-[var(--bg-main)] border-2 border-[var(--border-color)] shadow-lg z-50"
            style={{ 
              width: GRID_SIZE * 14,
              imageRendering: 'pixelated',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-card)] border-b-2 border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎭</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  Choose Your Vibe
                </span>
              </div>
              <motion.button
                onClick={() => setIsOpen(false)}
                className="w-5 h-5 flex items-center justify-center border border-[var(--border-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]"
                whileTap={{ scale: 0.9 }}
              >
                <PixelIcon name="times" size={10} />
              </motion.button>
            </div>

            {/* Archetype Options */}
            <div className="p-2 space-y-1">
              {(Object.values(ARCHETYPES) as ArchetypeInfo[]).map((archetype, index) => {
                const isSelected = selectedArchetype === archetype.id;
                
                return (
                  <motion.button
                    key={archetype.id}
                    onClick={() => handleSelect(archetype.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 border-2 transition-all',
                      isSelected
                        ? 'bg-[var(--accent-color)] text-[var(--bg-main)] border-[var(--accent-color)]'
                        : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] hover:border-[var(--text-main)]'
                    )}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Shortcut number */}
                    <span className="text-[8px] font-mono opacity-50 w-3">{index + 1}</span>
                    
                    {/* Emoji */}
                    <motion.span 
                      className="text-xl"
                      animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {archetype.emoji}
                    </motion.span>
                    
                    {/* Text */}
                    <div className="flex-1 text-left">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-tight">
                        {archetype.label}
                      </div>
                      <div className="text-[8px] font-mono opacity-70 leading-tight">
                        {archetype.description}
                      </div>
                    </div>

                    {/* Check indicator */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 flex items-center justify-center bg-[var(--bg-main)] text-[var(--accent-color)]"
                      >
                        <PixelIcon name="check" size={10} />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Footer hint */}
            <div className="px-3 py-2 bg-[var(--bg-card)] border-t-2 border-[var(--border-color)]">
              <p className="text-[8px] font-mono text-[var(--text-muted)] text-center">
                Your choice shapes what you discover • Press 1-4 to quick select
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Greeting Toast */}
      <AnimatePresence>
        {showGreeting && currentInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[var(--text-main)] text-[var(--bg-main)] border-2 border-[var(--bg-main)] shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentInfo.emoji}</span>
              <div>
                <p className="text-[10px] font-mono font-bold">{currentInfo.greeting}</p>
                <p className="text-[8px] font-mono opacity-70">{currentInfo.hint}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerArchetypeSelector;

// Hook to get current archetype anywhere
export const usePlayerArchetype = () => {
  const [archetype, setArchetype] = useState<PlayerArchetype | null>(null);
  
  useEffect(() => {
    const stored = localStorage.getItem('playerArchetype') as PlayerArchetype;
    if (stored && ARCHETYPES[stored]) {
      setArchetype(stored);
    }
    
    // Listen for changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'playerArchetype') {
        setArchetype(e.newValue as PlayerArchetype);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return { archetype, info: archetype ? ARCHETYPES[archetype] : null };
};
