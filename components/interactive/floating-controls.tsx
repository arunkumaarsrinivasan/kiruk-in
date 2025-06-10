'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Floating control panel for managing interactive elements
export const FloatingControls: React.FC<{
  onAddNote?: () => void;
  onAddCard?: () => void;
  onAddScribble?: () => void;
  onToggleGrid?: () => void;
  onClearAll?: () => void;
  gridEnabled?: boolean;
  className?: string;
}> = ({
  onAddNote,
  onAddCard,
  onAddScribble,
  onToggleGrid,
  onClearAll,
  gridEnabled = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const controls = [
    {
      id: 'note',
      icon: '📝',
      label: 'Add Note',
      action: onAddNote,
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 'card',
      icon: '🗂️',
      label: 'Add Card',
      action: onAddCard,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'scribble',
      icon: '✏️',
      label: 'Add Scribble',
      action: onAddScribble,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'grid',
      icon: gridEnabled ? '⊞' : '⊡',
      label: gridEnabled ? 'Disable Grid' : 'Enable Grid',
      action: onToggleGrid,
      color: gridEnabled ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-500 hover:bg-gray-600'
    },
    {
      id: 'clear',
      icon: '🗑️',
      label: 'Clear All',
      action: onClearAll,
      color: 'bg-red-500 hover:bg-red-600'
    }
  ];

  return (
    <div className={`fixed bottom-20 right-6 z-50 ${className}`}>
      {/* Main toggle button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center text-xl hover:bg-gray-800 transition-colors relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setShowTooltip('controls')}
        onHoverEnd={() => setShowTooltip(null)}
      >
        <motion.span
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          +
        </motion.span>
        
        {/* Tooltip for main button */}
        <AnimatePresence>
          {showTooltip === 'controls' && (
            <motion.div
              className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-black text-white px-3 py-1 rounded text-sm whitespace-nowrap"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              Interactive Controls
              <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-2 h-2 bg-black rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Expanded controls */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-16 right-0 flex flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, staggerChildren: 0.05 }}
          >
            {controls.map((control, index) => (
              <motion.button
                key={control.id}
                onClick={control.action}
                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg text-white transition-colors relative ${control.color}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setShowTooltip(control.id)}
                onHoverEnd={() => setShowTooltip(null)}
              >
                {control.icon}
                
                {/* Tooltip for each control */}
                <AnimatePresence>
                  {showTooltip === control.id && (
                    <motion.div
                      className="absolute right-14 top-1/2 transform -translate-y-1/2 bg-black text-white px-3 py-1 rounded text-sm whitespace-nowrap"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                    >
                      {control.label}
                      <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-2 h-2 bg-black rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingControls;