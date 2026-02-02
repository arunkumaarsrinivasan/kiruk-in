'use client';

import { useMemo } from 'react';
import { getLifeProgress, lifeStats, getAge } from '@/data/life-progress-data';

interface LifeProgressCardProps {
  className?: string;
}

export function LifeProgressCard({ className = '' }: LifeProgressCardProps) {
  const { yearsLived, percentage, daysLived } = useMemo(() => getLifeProgress(), []);
  const totalYears = lifeStats.expectedLifespan;
  
  // Create a grid of years (10 columns)
  const yearGrid = useMemo(() => {
    const grid = [];
    for (let i = 0; i < totalYears; i++) {
      grid.push({
        year: i + 1,
        isLived: i < yearsLived,
        isCurrent: i === yearsLived,
      });
    }
    return grid;
  }, [yearsLived, totalYears]);

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
        <div>
          <h2 
            className="text-2xl font-mono uppercase tracking-wider"
            style={{ color: 'var(--text-main)' }}
          >
            Life Progress
          </h2>
          <p 
            className="text-sm font-mono mt-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Born {new Date(lifeStats.birthDate).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
        </div>
        <div className="text-right">
          <div 
            className="text-4xl font-mono font-bold"
            style={{ color: 'var(--accent-color)' }}
          >
            {yearsLived}
          </div>
          <div 
            className="text-sm font-mono uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            years lived
          </div>
        </div>
      </div>

      {/* Year Grid */}
      <div className="mb-6">
        <div 
          className="grid gap-1"
          style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}
        >
          {yearGrid.map((cell) => (
            <div
              key={cell.year}
              className="aspect-square flex items-center justify-center text-xs font-mono transition-all duration-200"
              style={{
                backgroundColor: cell.isCurrent 
                  ? 'var(--accent-color)' 
                  : cell.isLived 
                    ? 'var(--accent-color)' 
                    : 'var(--bg-main)',
                opacity: cell.isLived ? 1 : 0.3,
                border: cell.isCurrent 
                  ? '2px solid var(--text-main)' 
                  : '1px solid var(--border-color)',
                color: cell.isLived ? 'white' : 'var(--text-muted)',
              }}
              title={`Year ${cell.year}${cell.isCurrent ? ' (current)' : ''}`}
            >
              {cell.year % 10 === 0 ? cell.year : ''}
            </div>
          ))}
        </div>
        <div 
          className="flex justify-between mt-2 text-xs font-mono"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>Birth</span>
          <span>{totalYears} years</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <StatBlock label="Days Lived" value={daysLived.toLocaleString()} />
        <StatBlock label="Progress" value={`${percentage.toFixed(1)}%`} />
        <StatBlock label="Age" value={getAge(lifeStats.birthDate).toString()} />
      </div>

      {/* Location Info */}
      <div 
        className="mt-6 pt-4 flex justify-between text-sm font-mono"
        style={{ borderTop: '1px solid var(--border-color)' }}
      >
        <div>
          <span style={{ color: 'var(--text-muted)' }}>From: </span>
          <span style={{ color: 'var(--text-main)' }}>{lifeStats.homeLocation}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Currently: </span>
          <span style={{ color: 'var(--accent-color)' }}>{lifeStats.currentLocation}</span>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div 
      className="p-3 text-center"
      style={{ 
        backgroundColor: 'var(--bg-main)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div 
        className="text-xl font-mono font-bold"
        style={{ color: 'var(--accent-color)' }}
      >
        {value}
      </div>
      <div 
        className="text-xs font-mono uppercase mt-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </div>
    </div>
  );
}

export default LifeProgressCard;
