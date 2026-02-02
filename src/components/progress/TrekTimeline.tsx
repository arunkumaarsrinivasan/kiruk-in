'use client';

import { useMemo } from 'react';
import { treks, getTrekStats } from '@/data/life-progress-data';

interface TrekTimelineProps {
  className?: string;
}

const difficultyColors = {
  easy: '#10B981',
  moderate: '#F59E0B',
  hard: '#EF4444',
  extreme: '#7C3AED',
};

export function TrekTimeline({ className = '' }: TrekTimelineProps) {
  const stats = useMemo(() => getTrekStats(), []);
  
  // Sort treks by date (newest first)
  const sortedTreks = useMemo(() => {
    return [...treks].sort((a, b) => b.date.localeCompare(a.date));
  }, []);

  return (
    <div 
      className={`p-6 ${className}`}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: 'var(--border-width) solid var(--border-color)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🥾</span>
          <div>
            <h2 
              className="text-2xl font-mono uppercase tracking-wider"
              style={{ color: 'var(--text-main)' }}
            >
              Trek Log
            </h2>
            <p 
              className="text-sm font-mono mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Adventures in the wild
            </p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex gap-6">
          <div className="text-center">
            <div 
              className="text-2xl font-mono font-bold"
              style={{ color: 'var(--accent-color)' }}
            >
              {stats.totalTreks}
            </div>
            <div 
              className="text-xs font-mono uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              Treks
            </div>
          </div>
          <div className="text-center">
            <div 
              className="text-2xl font-mono font-bold"
              style={{ color: '#10B981' }}
            >
              {stats.totalDistance}km
            </div>
            <div 
              className="text-xs font-mono uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              Distance
            </div>
          </div>
          <div className="text-center">
            <div 
              className="text-2xl font-mono font-bold"
              style={{ color: '#F59E0B' }}
            >
              {stats.highestElevation}m
            </div>
            <div 
              className="text-xs font-mono uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              Highest
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div 
          className="absolute left-4 top-0 bottom-0 w-1"
          style={{
            backgroundImage: 'repeating-linear-gradient(180deg, var(--border-color) 0 6px, transparent 6px 12px)',
          }}
        />
        
        {/* Trek items */}
        <div className="space-y-6">
          {sortedTreks.map((trek, index) => (
            <div key={trek.id} className="relative pl-12">
              {/* Dot */}
              <div 
                className="absolute left-2 top-2 w-5 h-5 border-2 flex items-center justify-center"
                style={{ 
                  backgroundColor: 'var(--bg-card)',
                  borderColor: difficultyColors[trek.difficulty],
                  boxShadow: '0 0 0 2px #0b1224',
                  imageRendering: 'pixelated',
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: difficultyColors[trek.difficulty] }}
                />
              </div>
              
              {/* Content */}
              <div 
                className="p-4 transition-all duration-200 hover:translate-x-1"
                style={{
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 
                      className="font-mono text-lg"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {trek.name}
                    </h4>
                    <p 
                      className="text-sm font-mono mt-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {trek.location}, {trek.region}
                    </p>
                  </div>
                  <div className="text-right">
                    <span 
                      className="font-mono text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {trek.date}
                    </span>
                  </div>
                </div>
                
                {/* Stats row */}
                <div className="flex gap-4 mt-3">
                  <Stat icon="↑" value={`${trek.elevation}m`} label="Elevation" />
                  <Stat icon="→" value={`${trek.distance}km`} label="Distance" />
                  <span 
                    className="px-2 py-1 text-xs font-mono uppercase"
                    style={{ 
                      backgroundColor: `${difficultyColors[trek.difficulty]}20`,
                      color: difficultyColors[trek.difficulty],
                    }}
                  >
                    {trek.difficulty}
                  </span>
                  {trek.duration && (
                    <span 
                      className="text-xs font-mono"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {trek.duration}
                    </span>
                  )}
                </div>
                
                {trek.description && (
                  <p 
                    className="text-sm mt-3"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {trek.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {treks.length === 0 && (
        <div className="text-center py-12">
          <p 
            className="font-mono"
            style={{ color: 'var(--text-muted)' }}
          >
            No treks logged yet. Time to explore!
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm">{icon}</span>
      <span 
        className="text-sm font-mono font-medium"
        style={{ color: 'var(--text-main)' }}
      >
        {value}
      </span>
    </div>
  );
}

export default TrekTimeline;
