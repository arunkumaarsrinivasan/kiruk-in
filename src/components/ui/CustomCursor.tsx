'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const pathname = usePathname();

  // Motion values for smooth physics
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const [isVisible, setIsVisible] = useState(false);

  // Interaction states
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Trigger navigation pulse effect
  useEffect(() => {
    setIsNavigating(true);
    const timeout = setTimeout(() => setIsNavigating(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    let idleTimeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      if (!isVisible) setIsVisible(true);

      // Reset idle timer
      setIsIdle(false);
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => setIsIdle(true), 3000); // 3 seconds to idle

      // Check what we're hovering over
      const target = e.target as HTMLElement;
      if (target && target.closest) {
        const interactiveEl = target.closest('a, button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])') as HTMLElement;
        if (interactiveEl) {
          if (interactiveEl.hasAttribute('disabled') || interactiveEl.getAttribute('aria-disabled') === 'true') {
            setIsDisabled(true);
            setIsHovering(false);
          } else {
            setIsHovering(true);
            setIsDisabled(false);
          }
        } else {
          setIsHovering(false);
          setIsDisabled(false);
        }
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      clearTimeout(idleTimeout);
    };
  }, [isVisible, cursorX, cursorY]);

  if (!isVisible) return null;

  const variants = {
    default: { scale: 1, opacity: 1, rotate: 0, filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))" },
    hover: { scale: 1, opacity: 1, rotate: 90, filter: "drop-shadow(0px 0px 12px var(--text-main))" },
    click: { scale: 0.8, opacity: 1, filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))" },
    idle: { scale: 0.8, opacity: 0.5, filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))" },
    disabled: { scale: 1, opacity: 0.5, filter: "drop-shadow(0px 0px 0px rgba(0,0,0,0))" },
    navigating: { scale: 1.2, opacity: 0.8, rotate: 180, filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.3))" }
  };

  const emojiVariants = {
    default: { scale: 1, opacity: 1, rotate: 0, filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))" },
    hover: { scale: 1, opacity: 1, rotate: 15, filter: "drop-shadow(0px 0px 12px var(--text-main))" },
    click: { scale: 0.8, opacity: 1, filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))" },
    idle: { scale: 0.8, opacity: 0.5, filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))" },
    disabled: { scale: 1, opacity: 0.5, filter: "drop-shadow(0px 0px 0px rgba(0,0,0,0))" },
    navigating: { scale: 1.2, opacity: 0.8, rotate: -15, filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.3))" }
  };

  const currentState = isNavigating ? 'navigating' : isClicking ? 'click' : isHovering ? 'hover' : isDisabled ? 'disabled' : isIdle ? 'idle' : 'default';

  let CursorElement = () => (
    <motion.svg
      width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none"
      variants={variants}
      initial="default"
      animate={currentState}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <path
        d={isDisabled ? "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 10.14 4.64 8.42 5.69 7.1L16.9 18.31C15.58 19.36 13.86 20 12 20ZM18.31 16.9L7.1 5.69C8.42 4.64 10.14 4 12 4C16.41 4 20 7.59 20 12C20 13.86 19.36 15.58 18.31 16.9Z" : "M11 2V11H2V13H11V22H13V13H22V11H13V2H11Z"}
        style={{ fill: 'var(--text-main)', stroke: 'var(--bg-main)' }}
        strokeWidth="1.5"
      />
    </motion.svg>
  );

  if (pathname === '/progress') {
    CursorElement = () => (
      <motion.span
        className="text-2xl pointer-events-none inline-block"
        variants={emojiVariants}
        initial="default"
        animate={currentState}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        🔭
      </motion.span>
    );
  } else if (pathname === '/case-studies') {
    CursorElement = () => (
      <motion.span
        className="text-2xl pointer-events-none inline-block"
        variants={emojiVariants}
        initial="default"
        animate={currentState}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        🔦
      </motion.span>
    );
  }

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
    >
      <div className="-translate-x-1/2 -translate-y-1/2">
        <CursorElement />
      </div>
    </motion.div>
  );
}
