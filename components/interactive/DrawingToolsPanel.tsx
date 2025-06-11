'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DrawingToolsPanelProps {
  isDrawingMode: boolean;
  selectedDrawingTool: 'pen' | 'pencil' | 'highlighter' | 'eraser' | 'brush' | 'marker';
  selectedDrawingColor: string;
  drawingStrokeWidth: number;
  onToolChange: (tool: 'pen' | 'pencil' | 'highlighter' | 'eraser' | 'brush' | 'marker') => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
}

export const DrawingToolsPanel: React.FC<DrawingToolsPanelProps> = ({
  isDrawingMode,
  selectedDrawingTool,
  selectedDrawingColor,
  drawingStrokeWidth,
  onToolChange,
  onColorChange,
  onStrokeWidthChange
}) => {
  return (
    <AnimatePresence>
      {isDrawingMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white/95 backdrop-blur-sm border-2 border-blue-500 rounded-lg p-3 sketch-border shadow-lg"
        >
          <div className="text-center mb-2">
            <h3 className="text-xs font-semibold text-blue-700 handwritten">✍️ Drawing Tools</h3>
          </div>
          
          {/* Drawing Tools */}
          <div className="flex items-center justify-center gap-1 mb-2">
            {(['pen', 'pencil', 'highlighter', 'eraser', 'brush', 'marker'] as const).map(tool => (
              <motion.button
                key={tool}
                onClick={() => onToolChange(tool)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-8 h-8 text-xs rounded border transition-all duration-200 flex items-center justify-center ${
                  selectedDrawingTool === tool 
                    ? 'bg-blue-500 text-white border-blue-600 shadow-md' 
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
                title={tool.charAt(0).toUpperCase() + tool.slice(1)}
              >
                {tool === 'pen' && '🖊️'}
                {tool === 'pencil' && '✏️'}
                {tool === 'highlighter' && '🖍️'}
                {tool === 'eraser' && '🧽'}
                {tool === 'brush' && '🖌️'}
                {tool === 'marker' && '🖇️'}
              </motion.button>
            ))}
          </div>

          {/* Color and Stroke Width */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <input
              type="color"
              value={selectedDrawingColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
              title="Drawing Color"
            />
            <input
              type="range"
              min="1"
              max="20"
              value={drawingStrokeWidth}
              onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              title="Stroke Width"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(drawingStrokeWidth / 20) * 100}%, #e5e7eb ${(drawingStrokeWidth / 20) * 100}%, #e5e7eb 100%)`
              }}
            />
            <span className="text-xs text-gray-600 font-mono w-6">{drawingStrokeWidth}</span>
          </div>

          {/* Drawing Status */}
          <div className="text-center">
            <div className="text-xs text-blue-600 handwritten">
              {isDrawingMode ? 'Drawing Mode Active' : 'Click to draw on page'}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
