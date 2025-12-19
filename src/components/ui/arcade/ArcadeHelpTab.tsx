'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn, GRID_SIZE } from '@/lib/utils';
import { getGameEntry } from './game-registry';

interface ArcadeHelpTabProps {
  gameId: string;
  score?: number;
  open: boolean;
  onToggle: () => void;
  onDismissForever: () => void;
  showNudge?: boolean;
  left: number;
}

function getHowToPlay(gameId: string) {
  switch (gameId) {
    case 'snake':
      return {
        title: 'Snake Trail',
        subtitle: 'Cursor-controlled snake. Collect items to grow.',
        steps: [
          'Press PLAY',
          'Move your cursor to draw the trail',
          'Collect labeled items to grow + score',
          'Use RANDOM roll to switch games',
        ],
      };
    case 'collector':
      return {
        title: 'Collector Rush',
        subtitle: 'Grab items before they vanish. Build combos.',
        steps: ['Press PLAY', 'Hover items to collect', 'Collect fast for combos', 'Use RANDOM roll to switch games'],
      };
    case 'painter':
      return {
        title: 'Grid Painter',
        subtitle: 'Paint trails that fade away.',
        steps: ['Press PLAY', 'Move to paint cells', 'Watch trails fade', 'Use RANDOM roll to switch games'],
      };
    default:
      return {
        title: 'Grid Game',
        subtitle: 'Playful overlay on the site grid.',
        steps: ['Press PLAY', 'Use cursor/touch', 'Some games react to clicks', 'Use RANDOM roll to switch games'],
      };
  }
}

export const ArcadeHelpTab: React.FC<ArcadeHelpTabProps> = ({
  gameId,
  score,
  open,
  onToggle,
  onDismissForever,
  showNudge = false,
  left,
}) => {
  const entry = useMemo(() => getGameEntry(gameId), [gameId]);
  const how = useMemo(() => getHowToPlay(gameId), [gameId]);
  const [activeTab, setActiveTab] = useState<'how' | 'page'>('how');

  const BAR_HEIGHT = GRID_SIZE * 3;
  const PANEL_WIDTH = GRID_SIZE * 12; // aligns with play+info+help+random width

  return (
    <div className="fixed z-[65]" style={{ left, top: BAR_HEIGHT }}>
      {/* Collapsed tab header */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'relative w-full flex items-center justify-between gap-3',
          'border border-t-0 border-[var(--border-color)]',
          'bg-[var(--bg-card)] text-[var(--text-main)]',
          'px-3 py-2',
          'transition-colors duration-150 hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]'
        )}
        style={{ width: PANEL_WIDTH }}
        aria-expanded={open}
        aria-label={open ? 'Collapse game tab' : 'Expand game tab'}
      >
        {showNudge && !open && (
          <span
            aria-hidden="true"
            className="absolute -inset-[2px] rounded-[2px]"
            style={{ boxShadow: '0 0 0 2px var(--accent-color)' }}
          />
        )}

        <div className="min-w-0 text-left">
          <div className="text-[9px] font-mono uppercase tracking-wider opacity-70">Game tab</div>
          <div className="text-[11px] font-mono uppercase tracking-wider truncate">
            {entry?.label ?? how.title} • {open ? 'Hide guide' : 'Show guide'}
          </div>
        </div>

        <div className="text-[11px] font-mono font-bold">
          {String(score ?? 0).padStart(5, '0')}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'overflow-hidden',
              'border border-t-0 border-[var(--border-color)]',
              'bg-[var(--bg-card)] text-[var(--text-main)]'
            )}
            style={{ width: PANEL_WIDTH }}
          >
            <div className="p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[12px] font-mono font-bold uppercase tracking-wider truncate">
                    {entry?.label ?? how.title}
                  </div>
                  <div className="mt-1 text-[12px] leading-snug opacity-90">
                    {entry?.description ?? how.subtitle}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onDismissForever}
                  className={cn(
                    'shrink-0 px-2 py-1 text-[10px] font-mono uppercase tracking-wider',
                    'border border-[var(--border-color)]',
                    'bg-[var(--bg-main)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]',
                    'transition-colors duration-150'
                  )}
                  title="Stop showing the first-visit nudge"
                >
                  Dismiss
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('how')}
                  className={cn(
                    'px-2 py-1 text-[10px] font-mono uppercase tracking-wider border border-[var(--border-color)]',
                    activeTab === 'how'
                      ? 'bg-[var(--text-main)] text-[var(--bg-main)]'
                      : 'bg-[var(--bg-main)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]'
                  )}
                >
                  How
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('page')}
                  className={cn(
                    'px-2 py-1 text-[10px] font-mono uppercase tracking-wider border border-[var(--border-color)]',
                    activeTab === 'page'
                      ? 'bg-[var(--text-main)] text-[var(--bg-main)]'
                      : 'bg-[var(--bg-main)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]'
                  )}
                >
                  Page
                </button>
              </div>

              {activeTab === 'how' ? (
                <ol className="mt-3 list-decimal pl-5 space-y-1 text-[12px] leading-snug">
                  {how.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              ) : (
                <div className="mt-3 text-[12px] leading-snug">
                  <div className="opacity-90">
                    You’re on a gamified portfolio page: explore my skills/projects as little collectibles.
                  </div>
                  <div className="mt-2 opacity-90">
                    Controls live in the top bar: <span className="font-mono font-bold">PLAY</span> toggles the game overlay, <span className="font-mono font-bold">RANDOM</span> rolls a surprise game.
                  </div>
                  <div className="mt-2 opacity-90">
                    Navigation + timeline still work normally (this is an overlay, not a full takeover).
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArcadeHelpTab;
