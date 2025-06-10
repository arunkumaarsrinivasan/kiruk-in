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
          className="fixed bottom-6 right-6 z-50 bg-white border-2 border-black rounded-full p-3 shadow-lg hover:shadow-xl transition-all sketch-border"
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5, type: "spring" }}
        >
          <div className="handwritten text-sm font-bold">🎨 Interactive</div>
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
              className="fixed top-4 right-4 z-50 bg-red-100 border-2 border-red-300 rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="handwritten text-sm">✕ Exit</div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
