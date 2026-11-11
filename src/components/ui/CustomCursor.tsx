'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import {
  cursorChatDominantVibe,
  cursorChatPlainText,
  cursorElementChats,
  type CursorChatWord,
} from '@/data/cursor-chat-data';
import { useChromeQuiet } from '@/hooks/useChromeQuiet';

const DOT_PX = 8;
const CURSOR_EMOJI_PX = 36;

const CHAT_HOST_SELECTOR =
  'a[href], button, [role="button"], [role="link"], input[type="submit"], input[type="button"], input[type="reset"]';

function isCursorChatHost(el: HTMLElement | null): boolean {
  return Boolean(el?.matches(CHAT_HOST_SELECTOR));
}

interface HapticBurst {
  id: number;
  x: number;
  y: number;
}

let hapticId = 0;

export default function CustomCursor() {
  const pathname = usePathname();
  const chromeQuiet = useChromeQuiet();

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const [enabled, setEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isOwn, setIsOwn] = useState(false);

  const [cursorChat, setCursorChat] = useState<CursorChatWord[] | null>(null);
  const [hapticBursts, setHapticBursts] = useState<HapticBurst[]>([]);
  const lastPos = useRef({ x: 0, y: 0 });
  const visibleRef = useRef(false);
  const hoveringRef = useRef(false);
  const disabledRef = useRef(false);
  const idleRef = useRef(false);
  const ownRef = useRef(false);
  const chatKeyRef = useRef<string | null>(null);

  const spawnHaptic = useCallback(() => {
    const burst: HapticBurst = {
      id: ++hapticId,
      x: lastPos.current.x,
      y: lastPos.current.y,
    };
    setHapticBursts(prev => [...prev, burst]);
    setTimeout(() => {
      setHapticBursts(prev => prev.filter(b => b.id !== burst.id));
    }, 500);
  }, []);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setEnabled(fine.matches && !reduce.matches);
    sync();
    fine.addEventListener('change', sync);
    reduce.addEventListener('change', sync);
    return () => {
      fine.removeEventListener('change', sync);
      reduce.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled || chromeQuiet) return;

    let idleTimeout: ReturnType<typeof setTimeout>;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      lastPos.current = { x: e.clientX, y: e.clientY };

      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }

      if (idleRef.current) {
        idleRef.current = false;
        setIsIdle(false);
      }
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        idleRef.current = true;
        setIsIdle(true);
      }, 2500);

      const target = e.target as HTMLElement;
      if (!target?.closest) return;

      // A surface that draws its own pointer (the 1970 work tube bends its
      // picture, so its pointer has to bend with it) asks the dot to stand down.
      const nextOwn = Boolean(target.closest('[data-own-cursor]'));
      if (ownRef.current !== nextOwn) {
        ownRef.current = nextOwn;
        setIsOwn(nextOwn);
      }

      const interactiveEl = target.closest(
        'a, button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement | null;
      let nextHovering = false;
      let nextDisabled = false;
      if (interactiveEl) {
        if (
          interactiveEl.hasAttribute('disabled') ||
          interactiveEl.getAttribute('aria-disabled') === 'true'
        ) {
          nextDisabled = true;
        } else {
          nextHovering = true;
        }
      }
      if (hoveringRef.current !== nextHovering) {
        hoveringRef.current = nextHovering;
        setIsHovering(nextHovering);
      }
      if (disabledRef.current !== nextDisabled) {
        disabledRef.current = nextDisabled;
        setIsDisabled(nextDisabled);
      }

      const chatEl = target.closest('[data-cursor-chat]') as HTMLElement | null;
      const chatKey = chatEl?.dataset.cursorChat?.trim() || null;
      const nextChatKey =
        chatKey && isCursorChatHost(chatEl) ? chatKey : null;
      if (chatKeyRef.current !== nextChatKey) {
        chatKeyRef.current = nextChatKey;
        setCursorChat(nextChatKey ? cursorElementChats[nextChatKey] ?? null : null);
      }
    };

    const handleMouseLeave = () => {
      visibleRef.current = false;
      chatKeyRef.current = null;
      setIsVisible(false);
      setCursorChat(null);
    };
    const handleMouseEnter = () => {
      visibleRef.current = true;
      setIsVisible(true);
    };
    const handleMouseDown = () => {
      setIsClicking(true);
      if (!ownRef.current) spawnHaptic();
    };
    const handleMouseUp = () => setIsClicking(false);

    const passive = { passive: true } as const;
    window.addEventListener('mousemove', handleMouseMove, passive);
    window.addEventListener('mousedown', handleMouseDown, passive);
    window.addEventListener('mouseup', handleMouseUp, passive);
    document.body.addEventListener('mouseleave', handleMouseLeave, passive);
    document.body.addEventListener('mouseenter', handleMouseEnter, passive);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      clearTimeout(idleTimeout);
    };
  }, [enabled, chromeQuiet, cursorX, cursorY, spawnHaptic]);

  useEffect(() => {
    const mode = !enabled
      ? "off"
      : chromeQuiet
        ? "quiet"
        : isIdle
          ? "idle"
          : isVisible
            ? "live"
            : "armed";
    document.documentElement.setAttribute("data-cursor-mode", mode);
    return () => document.documentElement.removeAttribute("data-cursor-mode");
  }, [enabled, chromeQuiet, isIdle, isVisible]);

  if (!enabled || !isVisible || chromeQuiet || isOwn) return null;

  const isEmojiPage = pathname === '/progress';
  const emojiChar = '🔭';
  const eraShapeRadius = 'min(50%, var(--era-radius-full))';

  const dotVariants = {
    default: { scale: 1, opacity: 1 },
    hover: { scale: 1.6, opacity: 1 },
    click: { scale: 0.5, opacity: 1 },
    idle: { scale: 0.7, opacity: 0.35 },
    disabled: { scale: 1, opacity: 0.3 },
  };

  const emojiVariants = {
    default: { scale: 1, opacity: 1, rotate: 0 },
    hover: { scale: 1.08, opacity: 1, rotate: 12 },
    click: { scale: 0.85, opacity: 1, rotate: 0 },
    idle: { scale: 0.85, opacity: 0.5, rotate: 0 },
    disabled: { scale: 1, opacity: 0.45, rotate: 0 },
  };

  const currentState = isClicking
    ? 'click'
    : isHovering
      ? 'hover'
      : isDisabled
        ? 'disabled'
        : isIdle
          ? 'idle'
          : 'default';

  const dotTransition = {
    type: 'spring' as const,
    stiffness: 600,
    damping: 22,
    mass: 0.3,
  };

  const showChat = Boolean(cursorChat?.length);
  const chatPlain = cursorChat?.length ? cursorChatPlainText(cursorChat) : '';
  const dominantVibe = cursorChat?.length ? cursorChatDominantVibe(cursorChat) : 'neutral';

  const HAPTIC_LINES = 6;
  const hapticAngles = Array.from({ length: HAPTIC_LINES }, (_, i) => (360 / HAPTIC_LINES) * i);

  return (
    <>
      {/* Haptic burst effects — rendered at click positions */}
      <AnimatePresence>
        {hapticBursts.map(burst => (
          <motion.div
            key={burst.id}
            className="fixed top-0 left-0 pointer-events-none z-[9998]"
            style={{ x: burst.x, y: burst.y }}
            aria-hidden
          >
            <div className="-translate-x-1/2 -translate-y-1/2 relative" style={{ width: 2, height: 2 }}>
              {hapticAngles.map((angle, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 pointer-events-none"
                  style={{
                    width: 2,
                    height: 2,
                    borderRadius: '50%',
                    backgroundColor: isHovering ? 'var(--accent-color)' : 'var(--text-main)',
                    transformOrigin: 'center',
                  }}
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 0.8,
                    scale: 1,
                  }}
                  animate={{
                    x: Math.cos((angle * Math.PI) / 180) * 18,
                    y: Math.sin((angle * Math.PI) / 180) * 18,
                    opacity: 0,
                    scale: 0.3,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.23, 1, 0.32, 1],
                    delay: i * 0.015,
                  }}
                />
              ))}
              {/* Impact ring */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                  border: `1.5px solid ${isHovering ? 'var(--accent-color)' : 'var(--text-main)'}`,
                }}
                initial={{ width: 4, height: 4, opacity: 0.5 }}
                animate={{ width: 32, height: 32, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Cursor dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000]"
        style={{ x: cursorX, y: cursorY }}
        aria-hidden
      >
        <div className="-translate-x-1/2 -translate-y-1/2">
          {isEmojiPage ? (
            <motion.div
              className="pointer-events-none flex items-center justify-center shrink-0"
              style={{
                width: CURSOR_EMOJI_PX,
                height: CURSOR_EMOJI_PX,
                backgroundColor: 'var(--text-main)',
                borderRadius: eraShapeRadius,
                border: '1px solid var(--bg-main)',
                boxSizing: 'border-box',
              }}
              variants={emojiVariants}
              initial="default"
              animate={currentState}
              transition={dotTransition}
            >
              <span className="text-xl leading-none">{emojiChar}</span>
            </motion.div>
          ) : (
            <motion.div
              className="pointer-events-none relative flex items-center justify-center shrink-0"
              style={{
                width: DOT_PX,
                height: DOT_PX,
                backgroundColor: isHovering || isClicking
                  ? 'var(--accent-color)'
                  : 'var(--text-main)',
                borderRadius: eraShapeRadius,
                boxSizing: 'border-box',
                transition: 'background-color 0.12s ease',
              }}
              variants={dotVariants}
              initial="default"
              animate={currentState}
              transition={dotTransition}
            >
              {isDisabled ? (
                <span
                  className="absolute left-1/2 top-1/2 w-[200%] h-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[var(--bg-main)] pointer-events-none"
                  aria-hidden
                />
              ) : null}
            </motion.div>
          )}

          {/* Chat label — solid pill, positioned below-right of cursor */}
          <AnimatePresence mode="wait">
            {showChat && cursorChat ? (
              <motion.div
                key={chatPlain}
                role="status"
                aria-live="polite"
                aria-label={chatPlain}
                data-dominant-vibe={dominantVibe}
                data-chat-hover={isHovering ? 'true' : 'false'}
                data-chat-click={isClicking ? 'true' : 'false'}
                initial={{ opacity: 0, y: 4, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 2, scale: 0.96 }}
                transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                className="cursor-chat-label pointer-events-none absolute z-10 cursor-default select-none"
                style={{
                  left: isEmojiPage ? CURSOR_EMOJI_PX / 2 + 6 : DOT_PX / 2 + 10,
                  top: isEmojiPage ? CURSOR_EMOJI_PX / 2 + 4 : DOT_PX / 2 + 6,
                  whiteSpace: 'nowrap',
                }}
              >
                <span className="cursor-chat-label__words">
                  {cursorChat.map((word, i) => (
                    <span
                      key={`${word.text}-${i}`}
                      className={`cursor-chat-label__token ccl-${word.vibe ?? 'neutral'}`}
                    >
                      {word.text}
                    </span>
                  ))}
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
