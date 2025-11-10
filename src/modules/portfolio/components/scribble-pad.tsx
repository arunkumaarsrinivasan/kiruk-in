'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SketchHeading } from '@/components/ui/sketch-elements';

interface ScribblePadProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (scribbleData: string) => void;
}

type DrawingTool = 'pen' | 'pencil' | 'brush' | 'eraser';
type CanvasTemplate = 'plain' | 'memo' | 'grid' | 'storyboard';

const CANVAS_WIDTH = 560;
const CANVAS_HEIGHT = 360;

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const templateOptions: Array<{
  id: CanvasTemplate;
  label: string;
  description: string;
  swatch: string;
}> = [
  { id: 'plain', label: 'Blank', description: 'Clean slate for freeform sketching.', swatch: '#ffffff' },
  { id: 'memo', label: 'Daily Memo', description: 'Header and checklist lines for lightweight planning.', swatch: '#fff8d6' },
  { id: 'grid', label: 'Dot Grid', description: 'Light grid for layout and letterforms.', swatch: '#f8fafc' },
  { id: 'storyboard', label: 'Storyboard', description: 'Three frames to map a mini story arc.', swatch: '#eef2ff' }
];

const stampPalette = ['⭐', '💡', '🚀', '🧠', '🎯', '📌', '✨'];

const promptLibrary = [
  'Plot the next micro-feature you want to ship.',
  'Storyboard a day in your product from a user’s notebook.',
  'Map the messy middle: what experiments are you running?',
  'Sketch the three beats that define your creative process.',
  'Doodle a thank-you note for a collaborator who unlocked momentum.'
];

const PEN_CURSOR = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath fill='%23111827' d='M21.8 3.8l6.4 6.4-13.5 13.6-7.6 2.7 2.6-7.7 12.1-12z'/%3E%3Cpath fill='%23f9fafb' d='M24.3 7.1l-2.4-2.4-11 11-1.2 3.5 3.4-1.2 11.2-10.9z'/%3E%3Cpath fill='%23111827' d='M6.8 24.6l2.6 2.6-3.6 1 1-3.6z'/%3E%3C/svg%3E\") 0 28, crosshair";

const ScribblePad: React.FC<ScribblePadProps> = ({ isOpen, onClose, onInsert }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pen');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [backgroundTemplate, setBackgroundTemplate] = useState<CanvasTemplate>('memo');
  const [activeStamp, setActiveStamp] = useState<string | null>(null);
  const [prompt] = useState(() => promptLibrary[Math.floor(Math.random() * promptLibrary.length)]);
  const [mounted, setMounted] = useState(false);
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

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

  const renderBackground = useCallback((ctx: CanvasRenderingContext2D, preserveDrawing = false) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    if (!preserveDrawing) {
      ctx.clearRect(0, 0, width, height);
    }

    ctx.save();
    if (preserveDrawing) {
      ctx.globalCompositeOperation = 'destination-over';
    }

    const drawMemoGuides = () => {
      ctx.fillStyle = '#fff8d6';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#fde68a';
      ctx.fillRect(0, 0, width, height * 0.18);
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 20px "Patrick Hand", "Segoe UI", sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText('Memo', 24, height * 0.12);

      ctx.strokeStyle = 'rgba(30, 41, 59, 0.12)';
      ctx.lineWidth = 1.5;
      const lineSpacing = 34;
      for (let y = height * 0.25; y < height - 20; y += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(28, y);
        ctx.lineTo(width - 28, y);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.font = '14px "Patrick Hand", "Segoe UI", sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('• planning notes / mini roadmap / raw sketch', 32, height * 0.22);
    };

    const drawGrid = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1;
      const spacing = 28;
      for (let x = spacing; x < width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = spacing; y < height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const drawStoryboard = () => {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(79, 70, 229, 0.35)';
      ctx.lineWidth = 3;
      const framePadding = 30;
      const frameWidth = (width - framePadding * 4) / 3;
      const frameHeight = height * 0.55;
      for (let i = 0; i < 3; i++) {
        const x = framePadding + i * (frameWidth + framePadding);
        const y = framePadding + 12;
        drawRoundedRect(ctx, x, y, frameWidth, frameHeight, 18);
        ctx.stroke();

        ctx.font = '14px "Patrick Hand", "Segoe UI", sans-serif';
        ctx.fillStyle = 'rgba(79, 70, 229, 0.6)';
        ctx.fillText(`Frame ${i + 1}`, x + 12, y + frameHeight + 28);
      }

      ctx.fillStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.font = 'bold 18px "Patrick Hand", "Segoe UI", sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('Scene · Mood · Next beat', framePadding, height - 28);
    };

    switch (backgroundTemplate) {
      case 'memo':
        drawMemoGuides();
        break;
      case 'grid':
        drawGrid();
        break;
      case 'storyboard':
        drawStoryboard();
        break;
      default:
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  }, [backgroundTemplate]);

  const prepareCanvas = useCallback((preserveDrawing = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getContext();
    if (!ctx) return;

    if (!preserveDrawing) {
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      canvas.style.width = `${CANVAS_WIDTH}px`;
      canvas.style.height = `${CANVAS_HEIGHT}px`;
    }

    renderBackground(ctx, preserveDrawing);
  }, [getContext, renderBackground]);

  const getCanvasPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  const placeStamp = useCallback((emoji: string, x: number, y: number) => {
    const ctx = getContext();
    if (!ctx) return;

    ctx.save();
    ctx.font = `${Math.max(32, strokeWidth * 6)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillText(emoji, x, y);
    ctx.restore();
  }, [getContext, strokeWidth]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = getContext();
    if (!ctx) return;

    renderBackground(ctx, false);
    ctx.beginPath();
    setActiveStamp(null);
  }, [getContext, renderBackground]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasPoint(e.clientX, e.clientY);

    if (activeStamp) {
      placeStamp(activeStamp, x, y);
      setActiveStamp(null);
      return;
    }

    const ctx = getContext();
    if (!ctx) return;

    setIsDrawing(true);
    pointerIdRef.current = e.pointerId;
    canvas.setPointerCapture(e.pointerId);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, [activeStamp, getCanvasPoint, getContext, placeStamp]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    if (e.buttons === 0) {
      setIsDrawing(false);
      const resetCtx = getContext();
      if (resetCtx) {
        resetCtx.beginPath();
      }
      return;
    }

    const ctx = getContext();
    if (!ctx) return;

    const { x, y } = getCanvasPoint(e.clientX, e.clientY);

    ctx.lineWidth = currentTool === 'eraser'
      ? 18
      : currentTool === 'brush'
      ? strokeWidth * 2
      : currentTool === 'pencil'
      ? Math.max(1, strokeWidth * 0.5)
      : strokeWidth;

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
  }, [isDrawing, currentTool, strokeColor, strokeWidth, getCanvasPoint, getContext]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) {
      return;
    }

    setIsDrawing(false);
    const ctx = getContext();
    if (ctx) {
      ctx.beginPath();
    }

    const canvas = canvasRef.current;
    if (canvas && pointerIdRef.current !== null && canvas.hasPointerCapture(pointerIdRef.current)) {
      canvas.releasePointerCapture(pointerIdRef.current);
    }
    pointerIdRef.current = null;
  }, [isDrawing, getContext]);

  const handlePointerLeave = useCallback(() => {
    if (!isDrawing) {
      return;
    }

    setIsDrawing(false);
    const ctx = getContext();
    if (ctx) {
      ctx.beginPath();
    }
    const canvas = canvasRef.current;
    if (canvas && pointerIdRef.current !== null && canvas.hasPointerCapture(pointerIdRef.current)) {
      canvas.releasePointerCapture(pointerIdRef.current);
    }
    pointerIdRef.current = null;
  }, [isDrawing, getContext]);

  const handleInsert = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    onInsert(dataURL);
    clearCanvas();
    onClose();
  }, [onInsert, clearCanvas, onClose]);

  useEffect(() => {
    setMounted(true);
    setPortalElement(document.body);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    prepareCanvas(false);
  }, [isOpen, prepareCanvas]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const ctx = getContext();
    if (!ctx) {
      return;
    }
    renderBackground(ctx, true);
  }, [backgroundTemplate, isOpen, getContext, renderBackground]);

  const canvasCursor = activeStamp ? 'pointer' : currentTool === 'pen' ? PEN_CURSOR : 'crosshair';

  if (!mounted || !portalElement) {
    return null;
  }

  let overlay: React.ReactNode = null;

  if (isOpen) {
    overlay = (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white/95 border-2 border-black rounded-3xl p-6 lg:p-8 w-[min(92vw,980px)] max-h-[90vh] mx-4 shadow-[6px_8px_0_rgba(0,0,0,0.18)] sketch-border flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-4 pb-4 border-b-2 border-dashed border-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✏️</span>
              <SketchHeading level={3} className="text-xl text-gray-900">
                Scribble Pad
              </SketchHeading>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-bold transition-colors shadow-sm"
              aria-label="Close scribble pad"
            >
              ×
            </button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 overflow-hidden pt-4">
            <div className="lg:w-[280px] flex-shrink-0 overflow-y-auto pr-1 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600 mb-2">
                  Tools & Brushes
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setCurrentTool(tool.id);
                        setStrokeWidth(tool.width);
                      }}
                      className={`px-3 py-2 rounded-lg border-2 transition-all ${
                        currentTool === tool.id
                          ? 'border-blue-500 bg-blue-100 shadow-sm'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      title={tool.label}
                    >
                      <span className="text-lg">{tool.icon}</span>
                    </button>
                  ))}
                </div>

                {currentTool !== 'eraser' && (
                  <>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setStrokeColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform ${
                            strokeColor === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Select ${color} ink`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Stroke:</span>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidth(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-8 text-right">{strokeWidth}</span>
                    </div>
                  </>
                )}
              </section>

              <section>
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600 mb-2">
                  Canvas vibe
                </h4>
                <div className="flex flex-wrap gap-2">
                  {templateOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setBackgroundTemplate(option.id)}
                      className={`flex-1 min-w-[140px] px-3 py-2 rounded-xl border-2 text-left transition-all ${
                        backgroundTemplate === option.id
                          ? 'border-indigo-400 bg-indigo-50 shadow-sm'
                          : 'border-gray-200 hover:border-indigo-200'
                      }`}
                    >
                      <span
                        className="block h-6 w-full rounded-md mb-2"
                        style={{ background: option.swatch }}
                      />
                      <span className="block text-sm font-semibold text-gray-800">{option.label}</span>
                      <span className="block text-xs text-gray-500 leading-snug">
                        {option.description}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600 mb-2">
                  Stamps & marks
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  {stampPalette.map((stamp) => (
                    <button
                      key={stamp}
                      onClick={() => setActiveStamp((current) => (current === stamp ? null : stamp))}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition-transform ${
                        activeStamp === stamp
                          ? 'border-blue-500 bg-blue-100 scale-105'
                          : 'border-gray-200 hover:border-blue-300 hover:scale-105'
                      }`}
                      title="Place stamp"
                    >
                      {stamp}
                    </button>
                  ))}
                  <span className="text-xs text-gray-500">
                    {activeStamp ? 'Tap the canvas to drop your stamp.' : 'Pick a stamp to add playful markers.'}
                  </span>
                </div>
              </section>
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-4 shadow-sm flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Prompt</p>
                  <p className="handwritten text-sm text-blue-900 leading-snug mt-2">
                    {prompt}
                  </p>
                </div>
              </div>

              <div className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden bg-white shadow-inner flex items-center justify-center p-4">
                <div className="w-full" style={{ maxWidth: CANVAS_WIDTH }}>
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerLeave}
                    onPointerCancel={handlePointerLeave}
                    className="block mx-auto"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxWidth: `${CANVAS_WIDTH}px`,
                      aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
                      touchAction: 'none',
                      cursor: canvasCursor
                    }}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Tip: layer brush strokes with stamps to show how you think through ideas.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={clearCanvas}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors shadow-sm"
                >
                  Clear
                </button>
                <button
                  onClick={handleInsert}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold shadow-sm"
                >
                  Insert Scribble
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return createPortal(
    <AnimatePresence>{overlay}</AnimatePresence>,
    portalElement
  );
};

export default ScribblePad;
