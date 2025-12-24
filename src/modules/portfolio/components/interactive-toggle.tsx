'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DraggableNotebook, { DraggableItem } from './draggable-notebook';

// Teenage Engineering inspired timing and easing values
const TE_TIMING = {
  instant: 0.08,   // 80ms
  quick: 0.15,     // 150ms
  standard: 0.25,  // 250ms
};

const TE_EASING = {
  mechanical: [0.4, 0.0, 0.2, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
};

// Motion variants for toggle button
const toggleVariants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
  },
  hover: {
    scale: 1.02,
    y: -2,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  tap: {
    scale: 0.98,
    y: 0,
    boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
  },
};

// Overlay animation variants
const overlayVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: TE_TIMING.standard,
      ease: TE_EASING.mechanical,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: TE_TIMING.quick,
      ease: TE_EASING.mechanical,
    },
  },
};

// Button appearance animation
const buttonAppearVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: 1,
      duration: TE_TIMING.standard,
      ease: TE_EASING.spring,
    },
  },
};

interface InteractiveToggleProps {
  isActive: boolean;
  items: DraggableItem[];
  onToggle: () => void;
  onItemsChange: (items: DraggableItem[]) => void;
  className?: string;
}

export const InteractiveToggle: React.FC<InteractiveToggleProps> = ({
  isActive,
  items,
  onToggle,
  onItemsChange,
  className = ''
}) => {
  return (
    <>
      {/* Toggle Button with TE mechanical feedback */}
      {!isActive && (
        <motion.button
          onClick={onToggle}
          className="te-button fixed bottom-4 right-4 z-50 bg-[var(--bg-card)] border border-[var(--border-color)] p-3 shadow-none"
          initial="hidden"
          animate="visible"
          variants={buttonAppearVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div
            variants={toggleVariants}
            transition={{
              duration: TE_TIMING.quick,
              ease: TE_EASING.spring,
            }}
          >
            <div className="font-mono uppercase text-sm font-bold text-[var(--text-main)]">
              🎨 Interactive
            </div>
          </motion.div>
        </motion.button>
      )}

      {/* Interactive Overlay with smooth transitions */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            className={`fixed inset-0 z-40 pointer-events-none ${className}`}
          >
            {/* Interactive notebook layer */}
            <div className="absolute inset-0 pointer-events-auto">
              <DraggableNotebook
                items={items}
                onItemsChange={onItemsChange}
                allowEditing={true}
                showControls={true}
                className="w-full h-full"
              />
            </div>

            {/* Exit button with TE mechanical feedback */}
            <motion.button
              onClick={onToggle}
              className="te-button fixed top-4 right-4 z-50 bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] p-2 shadow-none"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: {
                  delay: 0.2,
                  duration: TE_TIMING.quick,
                  ease: TE_EASING.mechanical,
                },
              }}
              whileHover={{
                scale: 1.02,
                y: -2,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                transition: {
                  duration: TE_TIMING.quick,
                  ease: TE_EASING.spring,
                },
              }}
              whileTap={{
                scale: 0.98,
                y: 0,
                boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
                transition: {
                  duration: TE_TIMING.instant,
                  ease: TE_EASING.mechanical,
                },
              }}
            >
              <div className="font-mono uppercase text-sm font-bold">✕ Exit</div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
