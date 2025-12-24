'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getGameEntry } from './game-registry';

interface ArcadeHelpModalProps {
  open: boolean;
  onClose: () => void;
  gameId: string;
  score?: number;
}

function getHowToPlay(gameId: string) {
  switch (gameId) {
    case 'snake':
      return {
        title: 'How to play: Snake Trail',
        steps: [
          'Press PLAY to start the overlay grid game.',
          'Move your cursor (or finger) to draw a trail; the head follows your movement.',
          'Collect the labeled items on the grid to grow and increase score.',
          'Try RAND to switch to a different mini-game anytime.',
        ],
        tips: ['This is just a playful overlay — navigation and timeline still work normally.'],
      };
    case 'painter':
      return {
        title: 'How to play: Grid Painter',
        steps: [
          'Press PLAY to start painting on the grid.',
          'Move your cursor to paint cells; trails fade over time.',
          'Leave the grid (or pause) to cycle colors.',
          'Try RAND to switch to another game.',
        ],
        tips: ['Score increases when you paint new cells.'],
      };
    case 'collector':
      return {
        title: 'How to play: Collector Rush',
        steps: [
          'Press PLAY to start.',
          'Move your cursor over items before they disappear to collect them.',
          'Collect quickly to build a combo multiplier.',
          'Try RAND to switch games anytime.',
        ],
        tips: ['Watch the status text for combo and item details.'],
      };
    default:
      return {
        title: 'How to play',
        steps: [
          'Press PLAY to start the grid game overlay.',
          'Use your cursor / touch to control the game.',
          'Some games react to clicks (e.g., selecting or shooting).',
          'Use RAND to switch to a different game.',
        ],
        tips: ['Score updates in the header tile while playing.'],
      };
  }
}

export const ArcadeHelpModal: React.FC<ArcadeHelpModalProps> = ({
  open,
  onClose,
  gameId,
  score,
}) => {
  const entry = useMemo(() => getGameEntry(gameId), [gameId]);
  const content = useMemo(() => getHowToPlay(gameId), [gameId]);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    // Basic focus management
    setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close help"
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Arcade help"
            className={cn(
              'absolute left-1/2 top-[92px] w-[min(520px,calc(100vw-24px))] -translate-x-1/2',
              'border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)]',
              'shadow-[0_20px_60px_rgba(0,0,0,0.25)]'
            )}
            initial={{ y: -8, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -8, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 380 }}
          >
            <div className="flex items-start justify-between gap-4 p-4 border-b border-[var(--border-color)]">
              <div className="min-w-0">
                <div className="text-[11px] font-mono uppercase tracking-wider opacity-70">Interactive page</div>
                <h2 className="text-[14px] font-mono font-bold uppercase tracking-wider">
                  {content.title}
                </h2>
                {entry?.description && (
                  <p className="mt-2 text-[12px] leading-snug opacity-90">
                    {entry.description}
                  </p>
                )}
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className={cn(
                  'shrink-0 px-3 py-2 text-[11px] font-mono uppercase tracking-wider',
                  'border border-[var(--border-color)]',
                  'bg-[var(--bg-main)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]',
                  'transition-colors duration-150 focus-visible:outline-none'
                )}
              >
                Got it
              </button>
            </div>

            <div className="p-4">
              <ol className="list-decimal pl-5 space-y-2 text-[12px] leading-snug">
                {content.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>

              {content.tips?.length ? (
                <div className="mt-4 border-t border-[var(--border-color)] pt-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider opacity-70">Tips</div>
                  <ul className="mt-2 space-y-1 text-[12px] leading-snug">
                    {content.tips.map((tip) => (
                      <li key={tip}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-4 border-t border-[var(--border-color)] pt-3 flex items-center justify-between gap-3">
                <div className="text-[10px] font-mono uppercase tracking-wider opacity-70">
                  Score
                </div>
                <div className="text-[12px] font-mono font-bold">
                  {String(score ?? 0).padStart(5, '0')}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ArcadeHelpModal;
