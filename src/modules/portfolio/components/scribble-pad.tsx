'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScribblePadProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (scribbleData: string) => void;
}

type DrawingTool = 'pen' | 'pencil' | 'brush' | 'eraser';

const ScribblePad: React.FC<ScribblePadProps> = ({ isOpen, onClose, onInsert }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pen');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const tools = [
    { id: 'pen' as DrawingTool, icon: '🖊️', label: 'Pen', width: 2 },
    { id: 'pencil' as DrawingTool, icon: '✏️', label: 'Pencil', width: 1 },
    { id: 'brush' as DrawingTool, icon: '🖌️', label: 'Brush', width: 8 },
    { id: 'eraser' as DrawingTool, icon: '🧽', label: 'Eraser', width: 15 }
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#808080'
  ];

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setLastPos({ x, y });

    const ctx = getContext();
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  }, [getContext]);

  const draw = useCallback((e: React.MouseEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = getContext();
    if (!ctx) return;

    ctx.lineWidth = currentTool === 'eraser' ? 15 : 
                   currentTool === 'brush' ? strokeWidth * 2 :
                   currentTool === 'pencil' ? strokeWidth * 0.5 : strokeWidth;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = strokeColor;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    setLastPos({ x, y });
  }, [isDrawing, currentTool, strokeColor, strokeWidth, getContext]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = getContext();
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [getContext]);

  const handleInsert = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    onInsert(dataURL);
    clearCanvas();
    onClose();
  }, [onInsert, clearCanvas, onClose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 300;

    // Set background
    const ctx = getContext();
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [getContext]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white border-4 border-dashed border-gray-300 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="architect-font text-xl font-bold text-gray-800">
              ✏️ Scribble Pad
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-bold transition-colors"
            >
              ×
            </button>
          </div>

          {/* Tools */}
          <div className="mb-4">
            <div className="flex gap-2 mb-3">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setCurrentTool(tool.id);
                    setStrokeWidth(tool.width);
                  }}
                  className={`px-3 py-2 rounded-lg border-2 transition-all ${
                    currentTool === tool.id
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  title={tool.label}
                >
                  <span className="text-lg">{tool.icon}</span>
                </button>
              ))}
            </div>

            {/* Colors */}
            {currentTool !== 'eraser' && (
              <div className="flex gap-2 mb-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setStrokeColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      strokeColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}

            {/* Stroke Width */}
            {currentTool !== 'eraser' && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Size:</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-8">{strokeWidth}</span>
              </div>
            )}
          </div>

          {/* Canvas */}
          <div className="mb-4 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="cursor-crosshair bg-white block"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={clearCanvas}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleInsert}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
            >
              Insert Scribble
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScribblePad;
