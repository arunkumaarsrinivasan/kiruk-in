'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  PIXEL_EDITOR_CONFIG,
  getEraPalette,
  generateLabId,
  type PixelTool,
  type PixelTemplate,
  type SavedPixelIcon,
} from '@/data/customization-lab-data';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface PixelArtEditorProps {
  eraId: string;
  eraAccent: string;
  eraBg: string;
  eraText: string;
  onSaveIcon: (icon: SavedPixelIcon) => void;
  savedIcons: SavedPixelIcon[];
  onDeleteIcon: (id: string) => void;
}

type ToolId = PixelTool['id'];

// ═══════════════════════════════════════════════════════════════════════════════
// FLOOD FILL ALGORITHM
// ═══════════════════════════════════════════════════════════════════════════════

function floodFill(pixels: string[], size: number, startIdx: number, fillColor: string): string[] {
  const result = [...pixels];
  const targetColor = result[startIdx];
  if (targetColor === fillColor) return result;

  const stack = [startIdx];
  const visited = new Set<number>();

  while (stack.length > 0) {
    const idx = stack.pop()!;
    if (visited.has(idx)) continue;
    if (idx < 0 || idx >= size * size) continue;
    if (result[idx] !== targetColor) continue;

    visited.add(idx);
    result[idx] = fillColor;

    const row = Math.floor(idx / size);
    const col = idx % size;

    if (col > 0) stack.push(idx - 1);
    if (col < size - 1) stack.push(idx + 1);
    if (row > 0) stack.push(idx - size);
    if (row < size - 1) stack.push(idx + size);
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LINE DRAWING (Bresenham)
// ═══════════════════════════════════════════════════════════════════════════════

function getLinePixels(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const points: [number, number][] = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let cx = x0, cy = y0;
  while (true) {
    points.push([cx, cy]);
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
  return points;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PIXEL GRID CANVAS
// ═══════════════════════════════════════════════════════════════════════════════

function PixelCanvas({
  pixels,
  size,
  currentColor,
  tool,
  mirrorMode,
  onPixelsChange,
  onEyedrop,
  gridLineColor,
}: {
  pixels: string[];
  size: number;
  currentColor: string;
  tool: ToolId;
  mirrorMode: boolean;
  onPixelsChange: (pixels: string[]) => void;
  onEyedrop: (color: string) => void;
  gridLineColor: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastCell = useRef<{ row: number; col: number } | null>(null);
  const shapeStart = useRef<{ row: number; col: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState(0);

  // Responsive canvas sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const s = Math.min(rect.width, rect.height, 480);
        setCanvasSize(Math.floor(s / size) * size);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [size]);

  // Draw the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvasSize / size;
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw checkerboard for transparency
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isLight = (r + c) % 2 === 0;
        ctx.fillStyle = isLight ? '#2a2a2a' : '#222222';
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }

    // Draw pixels
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const color = pixels[r * size + c];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }

    // Draw grid lines
    ctx.strokeStyle = gridLineColor + '40';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= size; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvasSize, i * cellSize);
      ctx.stroke();
    }

    // Mirror line
    if (mirrorMode) {
      ctx.strokeStyle = gridLineColor + '80';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(canvasSize / 2, 0);
      ctx.lineTo(canvasSize / 2, canvasSize);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [pixels, size, canvasSize, gridLineColor, mirrorMode]);

  const getCellFromEvent = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellSize = canvasSize / size;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    if (col < 0 || col >= size || row < 0 || row >= size) return null;
    return { row, col };
  }, [canvasSize, size]);

  const applyPixel = useCallback((row: number, col: number, newPixels: string[], color: string) => {
    const idx = row * size + col;
    if (idx >= 0 && idx < size * size) {
      newPixels[idx] = color;
    }
    if (mirrorMode) {
      const mirrorCol = size - 1 - col;
      const mirrorIdx = row * size + mirrorCol;
      if (mirrorIdx >= 0 && mirrorIdx < size * size) {
        newPixels[mirrorIdx] = color;
      }
    }
  }, [size, mirrorMode]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromEvent(e);
    if (!cell) return;
    isDrawing.current = true;
    lastCell.current = cell;

    if (tool === 'line' || tool === 'rect') {
      shapeStart.current = cell;
      return;
    }

    const newPixels = [...pixels];
    const idx = cell.row * size + cell.col;

    if (tool === 'eyedropper') {
      if (pixels[idx]) onEyedrop(pixels[idx]);
      return;
    }

    if (tool === 'fill') {
      const filled = floodFill(newPixels, size, idx, currentColor);
      onPixelsChange(filled);
      return;
    }

    const color = tool === 'eraser' ? '' : currentColor;
    applyPixel(cell.row, cell.col, newPixels, color);
    onPixelsChange(newPixels);
  }, [getCellFromEvent, pixels, size, tool, currentColor, onPixelsChange, onEyedrop, applyPixel]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const cell = getCellFromEvent(e);
    if (!cell) return;
    if (lastCell.current && cell.row === lastCell.current.row && cell.col === lastCell.current.col) return;

    if (tool === 'line' || tool === 'rect') {
      lastCell.current = cell;
      return;
    }

    if (tool === 'pencil' || tool === 'eraser' || tool === 'mirror') {
      const newPixels = [...pixels];
      const color = tool === 'eraser' ? '' : currentColor;
      applyPixel(cell.row, cell.col, newPixels, color);
      onPixelsChange(newPixels);
    }

    lastCell.current = cell;
  }, [getCellFromEvent, pixels, tool, currentColor, onPixelsChange, applyPixel]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (tool === 'line' && shapeStart.current && lastCell.current) {
      const newPixels = [...pixels];
      const points = getLinePixels(
        shapeStart.current.col, shapeStart.current.row,
        lastCell.current.col, lastCell.current.row
      );
      points.forEach(([x, y]) => applyPixel(y, x, newPixels, currentColor));
      onPixelsChange(newPixels);
    }

    if (tool === 'rect' && shapeStart.current && lastCell.current) {
      const newPixels = [...pixels];
      const r1 = Math.min(shapeStart.current.row, lastCell.current.row);
      const r2 = Math.max(shapeStart.current.row, lastCell.current.row);
      const c1 = Math.min(shapeStart.current.col, lastCell.current.col);
      const c2 = Math.max(shapeStart.current.col, lastCell.current.col);
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          if (r === r1 || r === r2 || c === c1 || c === c2) {
            applyPixel(r, c, newPixels, currentColor);
          }
        }
      }
      onPixelsChange(newPixels);
    }

    shapeStart.current = null;
    lastCell.current = null;
  }, [tool, pixels, currentColor, onPixelsChange, applyPixel]);

  return (
    <div ref={containerRef} className="w-full aspect-square max-w-[480px] mx-auto">
      {canvasSize > 0 && (
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="cursor-crosshair border-2 border-[var(--border-color)]"
          style={{ width: canvasSize, height: canvasSize, imageRendering: 'pixelated' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINI ICON PREVIEW (for saved icons gallery)
// ═══════════════════════════════════════════════════════════════════════════════

function MiniIconPreview({ icon, size = 32 }: { icon: SavedPixelIcon; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = size / icon.size;
    ctx.clearRect(0, 0, size, size);

    for (let r = 0; r < icon.size; r++) {
      for (let c = 0; c < icon.size; c++) {
        const color = icon.pixels[r * icon.size + c];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [icon, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size, imageRendering: 'pixelated' }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PIXEL ART EDITOR
// ═══════════════════════════════════════════════════════════════════════════════

export function PixelArtEditor({
  eraId,
  eraAccent,
  eraBg,
  eraText,
  onSaveIcon,
  savedIcons,
  onDeleteIcon,
}: PixelArtEditorProps) {
  const config = PIXEL_EDITOR_CONFIG;
  const [gridSize, setGridSize] = useState(config.defaultGridSize);
  const [pixels, setPixels] = useState<string[]>(Array(gridSize * gridSize).fill(''));
  const [currentColor, setCurrentColor] = useState(eraAccent);
  const [activeTool, setActiveTool] = useState<ToolId>('pencil');
  const [mirrorMode, setMirrorMode] = useState(false);
  const [iconName, setIconName] = useState('');
  const [activePalette, setActivePalette] = useState<string>('terminal');
  const [undoStack, setUndoStack] = useState<string[][]>([]);
  const [showGallery, setShowGallery] = useState(false);

  const eraPalette = getEraPalette(eraId);
  const allPalettes = config.palettes;

  // Reset canvas when grid size changes
  const handleGridSizeChange = useCallback((newSize: number) => {
    setGridSize(newSize);
    setPixels(Array(newSize * newSize).fill(''));
    setUndoStack([]);
  }, []);

  // Pixel change with undo support
  const handlePixelsChange = useCallback((newPixels: string[]) => {
    setUndoStack(prev => [...prev.slice(-19), pixels]);
    setPixels(newPixels);
  }, [pixels]);

  // Undo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(s => s.slice(0, -1));
    setPixels(prev);
  }, [undoStack]);

  // Clear canvas
  const handleClear = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-19), pixels]);
    setPixels(Array(gridSize * gridSize).fill(''));
  }, [gridSize, pixels]);

  // Load template
  const handleLoadTemplate = useCallback((template: PixelTemplate) => {
    setUndoStack(prev => [...prev.slice(-19), pixels]);
    setGridSize(template.size);
    setPixels([...template.pixels]);
  }, [pixels]);

  // Eyedropper
  const handleEyedrop = useCallback((color: string) => {
    setCurrentColor(color);
    setActiveTool('pencil');
  }, []);

  // Save icon
  const handleSave = useCallback(() => {
    const name = iconName.trim() || `Icon ${savedIcons.length + 1}`;
    const icon: SavedPixelIcon = {
      id: generateLabId(),
      name,
      size: gridSize,
      pixels: [...pixels],
      createdAt: new Date().toISOString(),
      eraId,
    };
    onSaveIcon(icon);
    setIconName('');
  }, [iconName, gridSize, pixels, eraId, onSaveIcon, savedIcons.length]);

  // Export as data URL
  const handleExport = useCallback(() => {
    const exportCanvas = document.createElement('canvas');
    const exportSize = 256;
    exportCanvas.width = exportSize;
    exportCanvas.height = exportSize;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    const cellSize = exportSize / gridSize;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const color = pixels[r * gridSize + c];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }

    const link = document.createElement('a');
    link.download = `pixel-icon-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  }, [gridSize, pixels]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const tool = config.tools.find(t => t.shortcut.toLowerCase() === e.key.toLowerCase());
      if (tool) {
        e.preventDefault();
        if (tool.id === 'mirror') {
          setMirrorMode(m => !m);
        } else {
          setActiveTool(tool.id);
        }
      }
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [config.tools, handleUndo]);

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="font-mono text-[9px] uppercase flex items-center gap-2" style={{ color: eraAccent }}>
          <span>◆</span> PIXEL ART ICON EDITOR
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setShowGallery(!showGallery)}
            className="px-2 py-0.5 text-[8px] font-mono border transition-all"
            style={{
              borderColor: showGallery ? eraAccent : `${eraText}33`,
              color: showGallery ? eraBg : eraText,
              backgroundColor: showGallery ? eraAccent : 'transparent',
            }}
          >
            GALLERY ({savedIcons.length})
          </button>
        </div>
      </div>

      {/* Gallery Panel */}
      <AnimatePresence>
        {showGallery && savedIcons.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 flex-wrap p-2 border border-dashed" style={{ borderColor: `${eraText}22` }}>
              {savedIcons.map((icon) => (
                <div key={icon.id} className="flex flex-col items-center gap-1 group">
                  <button
                    onClick={() => {
                      setGridSize(icon.size);
                      setPixels([...icon.pixels]);
                      setShowGallery(false);
                    }}
                    className="border p-1 hover:border-current transition-all"
                    style={{ borderColor: `${eraText}22` }}
                    title={`Load: ${icon.name}`}
                  >
                    <MiniIconPreview icon={icon} size={32} />
                  </button>
                  <span className="text-[7px] font-mono" style={{ color: `${eraText}66` }}>
                    {icon.name.length > 6 ? icon.name.slice(0, 6) + '..' : icon.name}
                  </span>
                  <button
                    onClick={() => onDeleteIcon(icon.id)}
                    className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: '#ff4444' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 flex-col lg:flex-row">
        {/* Left: Tools + Palette */}
        <div className="flex flex-col gap-3 w-full lg:w-[180px] flex-shrink-0">
          {/* Grid Size */}
          <div>
            <div className="text-[8px] font-mono uppercase mb-1" style={{ color: `${eraText}66` }}>Grid Size</div>
            <div className="flex gap-1 flex-wrap">
              {config.gridSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => handleGridSizeChange(s)}
                  className={cn('px-2 py-1 text-[8px] font-mono border transition-all')}
                  style={{
                    borderColor: gridSize === s ? eraAccent : `${eraText}22`,
                    color: gridSize === s ? eraBg : eraText,
                    backgroundColor: gridSize === s ? eraAccent : 'transparent',
                  }}
                >
                  {s}×{s}
                </button>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <div className="text-[8px] font-mono uppercase mb-1" style={{ color: `${eraText}66` }}>Tools</div>
            <div className="grid grid-cols-4 lg:grid-cols-2 gap-1">
              {config.tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    if (tool.id === 'mirror') {
                      setMirrorMode(m => !m);
                    } else {
                      setActiveTool(tool.id);
                    }
                  }}
                  className={cn('p-1.5 text-center text-[10px] border transition-all', 'flex flex-col items-center gap-0.5')}
                  style={{
                    borderColor: (activeTool === tool.id || (tool.id === 'mirror' && mirrorMode))
                      ? eraAccent : `${eraText}22`,
                    color: (activeTool === tool.id || (tool.id === 'mirror' && mirrorMode))
                      ? eraBg : eraText,
                    backgroundColor: (activeTool === tool.id || (tool.id === 'mirror' && mirrorMode))
                      ? eraAccent : 'transparent',
                  }}
                  title={`${tool.name} (${tool.shortcut})`}
                >
                  <span>{tool.icon}</span>
                  <span className="text-[6px] font-mono uppercase">{tool.shortcut}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[8px] font-mono uppercase" style={{ color: `${eraText}66` }}>Colors</div>
              <select
                value={activePalette}
                onChange={(e) => setActivePalette(e.target.value)}
                className="text-[7px] font-mono bg-transparent border px-1 py-0.5"
                style={{ borderColor: `${eraText}22`, color: eraText }}
              >
                {Object.entries(allPalettes).map(([key, p]) => (
                  <option key={key} value={key}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Current color */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 border-2 flex-shrink-0"
                style={{ backgroundColor: currentColor, borderColor: eraAccent }}
              />
              <input
                type="color"
                value={currentColor || '#000000'}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="w-6 h-6 cursor-pointer bg-transparent border-none"
              />
              <span className="text-[7px] font-mono" style={{ color: `${eraText}88` }}>
                {currentColor.toUpperCase() || 'NONE'}
              </span>
            </div>

            {/* Era palette */}
            <div className="flex gap-1 flex-wrap mb-1">
              {eraPalette.map((color, i) => (
                <button
                  key={`era-${i}`}
                  onClick={() => setCurrentColor(color)}
                  className="w-5 h-5 border transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: currentColor === color ? '#ffffff' : `${eraText}22`,
                    borderWidth: currentColor === color ? 2 : 1,
                  }}
                />
              ))}
            </div>

            {/* Selected palette */}
            <div className="flex gap-1 flex-wrap">
              {(allPalettes[activePalette]?.colors ?? []).map((color, i) => (
                <button
                  key={`pal-${i}`}
                  onClick={() => setCurrentColor(color)}
                  className="w-5 h-5 border transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: currentColor === color ? '#ffffff' : `${eraText}22`,
                    borderWidth: currentColor === color ? 2 : 1,
                  }}
                />
              ))}
            </div>

            {/* Transparent / eraser color */}
            <button
              onClick={() => setCurrentColor('')}
              className="mt-1 w-full text-[7px] font-mono py-1 border transition-all"
              style={{
                borderColor: currentColor === '' ? eraAccent : `${eraText}22`,
                color: eraText,
                background: 'repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 0 0 / 8px 8px',
              }}
            >
              TRANSPARENT
            </button>
          </div>

          {/* Templates */}
          <div>
            <div className="text-[8px] font-mono uppercase mb-1" style={{ color: `${eraText}66` }}>Templates</div>
            <div className="flex gap-1 flex-wrap">
              {config.templates.filter(t => t.category !== 'blank').map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleLoadTemplate(template)}
                  className="px-1.5 py-1 text-[7px] font-mono border transition-all hover:border-current"
                  style={{ borderColor: `${eraText}22`, color: eraText }}
                  title={template.name}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 flex flex-col gap-2">
          <PixelCanvas
            pixels={pixels}
            size={gridSize}
            currentColor={currentColor}
            tool={activeTool}
            mirrorMode={mirrorMode}
            onPixelsChange={handlePixelsChange}
            onEyedrop={handleEyedrop}
            gridLineColor={eraText}
          />

          {/* Action Buttons */}
          <div className="flex gap-1 flex-wrap justify-center">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="px-2 py-1 text-[8px] font-mono border transition-all disabled:opacity-30"
              style={{ borderColor: `${eraText}33`, color: eraText }}
            >
              UNDO
            </button>
            <button
              onClick={handleClear}
              className="px-2 py-1 text-[8px] font-mono border transition-all"
              style={{ borderColor: `${eraText}33`, color: eraText }}
            >
              CLEAR
            </button>
            <button
              onClick={handleExport}
              className="px-2 py-1 text-[8px] font-mono border transition-all"
              style={{ borderColor: `${eraText}33`, color: eraText }}
            >
              EXPORT PNG
            </button>
          </div>

          {/* Save */}
          <div className="flex gap-1 items-center mt-1">
            <input
              type="text"
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              placeholder="Icon name..."
              maxLength={32}
              className="flex-1 px-2 py-1 text-[9px] font-mono border bg-transparent"
              style={{ borderColor: `${eraText}22`, color: eraText }}
            />
            <button
              onClick={handleSave}
              className="px-3 py-1 text-[8px] font-mono font-bold uppercase transition-all"
              style={{ backgroundColor: eraAccent, color: eraBg }}
            >
              SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PixelArtEditor;
