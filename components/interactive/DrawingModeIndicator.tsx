'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DrawingModeIndicatorProps {
  isDrawingMode: boolean;
}

export const DrawingModeIndicator: React.FC<DrawingModeIndicatorProps> = ({
  isDrawingMode
}) => {
  return (
    <AnimatePresence>
      {isDrawingMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg border border-blue-600"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="animate-pulse">✍️</span>
            <span>Drawing Mode Active - Click and drag to draw</span>
            <span className="animate-pulse">✨</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
