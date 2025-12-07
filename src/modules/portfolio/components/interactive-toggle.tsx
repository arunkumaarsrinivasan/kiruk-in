'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DraggableNotebook, { DraggableItem } from './draggable-notebook';

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
      {/* Toggle Button */}
      {!isActive && (
        <motion.button
          onClick={onToggle}
          className="fixed bottom-4 right-4 z-50 bg-[var(--bg-card)] border border-[var(--border-color)] p-3 shadow-none hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5, type: "spring" }}
        >
          <div className="font-mono uppercase text-sm font-bold text-[var(--text-main)] hover:text-[var(--bg-main)]">🎨 Interactive</div>
        </motion.button>
      )}

      {/* Interactive Overlay */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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

            {/* Exit button */}
            <motion.button
              onClick={onToggle}
              className="fixed top-4 right-4 z-50 bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] p-2 shadow-none hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="font-mono uppercase text-sm font-bold">✕ Exit</div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
