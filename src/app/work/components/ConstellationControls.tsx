'use client';

import { PixelIcon } from '@/components/ui/PixelIcon';
import { EXPERTISE_COLORS, EXPERTISE_LABELS } from '../utils/skillData';

interface ConstellationControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onResetView: () => void;
  showNames: boolean;
  onToggleNames: () => void;
}

export function ConstellationControls({
  zoom,
  onZoomChange,
  onResetView,
  showNames,
  onToggleNames,
}: ConstellationControlsProps) {
  const minZoom = 0.5;
  const maxZoom = 2;

  return (
    <div
      className="fixed bottom-2 left-2 z-30 flex flex-col gap-1.5"
      style={{ pointerEvents: 'none' }}
    >
      {/* Zoom Controls */}
      <div
        className="wireframe-border p-1.5 flex items-center gap-2"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderWidth: 'var(--border-width)',
          borderColor: 'var(--border-color)',
          pointerEvents: 'auto',
          width: 'fit-content',
        }}
      >
        <div className="flex items-center gap-1">
          <PixelIcon name="minus" size={12} />
          <input
            type="range"
            min={minZoom}
            max={maxZoom}
            step={0.1}
            value={zoom}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            className="w-24"
            style={{ accentColor: 'var(--accent-color)' }}
          />
          <PixelIcon name="plus" size={12} />
          <span className="font-mono text-[10px]" style={{ color: 'var(--text-main)' }}>
            {Math.round(zoom * 100)}%
          </span>
        </div>
        <button
          onClick={onResetView}
          className="px-2 py-0.5 font-mono text-[10px] wireframe-btn"
          style={{
            borderWidth: 'var(--border-width)',
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--bg-main)',
            color: 'var(--text-main)',
          }}
        >
          RESET
        </button>
        <button
          onClick={onToggleNames}
          className="px-2 py-0.5 font-mono text-[10px] wireframe-btn"
          style={{
            borderWidth: 'var(--border-width)',
            borderColor: 'var(--border-color)',
            backgroundColor: showNames ? 'var(--accent-color)' : 'var(--bg-main)',
            color: showNames ? 'var(--bg-main)' : 'var(--text-main)',
          }}
        >
          {showNames ? 'HIDE' : 'SHOW'}
        </button>
      </div>

      {/* Expertise Legend */}
      <div
        className="wireframe-border p-1.5 flex items-center gap-2"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderWidth: 'var(--border-width)',
          borderColor: 'var(--border-color)',
          pointerEvents: 'auto',
          width: 'fit-content',
        }}
      >
        {(Object.keys(EXPERTISE_COLORS) as Array<keyof typeof EXPERTISE_COLORS>).map(
          (level) => (
            <div key={level} className="flex items-center gap-1">
              <div
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: EXPERTISE_COLORS[level],
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 4,
                    backgroundColor: 'white',
                    clipPath:
                      'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                  }}
                />
              </div>
              <span
                className="font-mono text-[10px]"
                style={{ color: 'var(--text-main)' }}
              >
                {EXPERTISE_LABELS[level]}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
