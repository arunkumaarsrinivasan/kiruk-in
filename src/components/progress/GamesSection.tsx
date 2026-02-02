'use client';

import { useMemo, useState } from 'react';
import { games, getGameStats, Game, GameStatus } from '@/data/life-progress-data';

interface GamesSectionProps {
  className?: string;
}

const statusColors: Record<GameStatus, string> = {
  playing: '#7C3AED',
  completed: '#10B981',
  'to-play': '#6B7280',
  dropped: '#EF4444',
};

export function GamesSection({ className = '' }: GamesSectionProps) {
  const [filter, setFilter] = useState<GameStatus | 'all'>('all');
  const stats = useMemo(() => getGameStats(), []);
  
  const filteredGames = useMemo(() => {
    if (filter === 'all') return games;
    return games.filter(g => g.status === filter);
  }, [filter]);

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
          <span className="text-3xl">🎮</span>
          <div>
            <h2 
              className="text-2xl font-mono uppercase tracking-wider"
              style={{ color: 'var(--text-main)' }}
            >
              Indie Games
            </h2>
            <p 
              className="text-sm font-mono mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Roguelikes · Metroidvanias · Beautiful Indies
            </p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-4">
          <QuickStat value={stats.completed} label="Completed" color={statusColors.completed} />
          <QuickStat value={stats.playing} label="Playing" color={statusColors.playing} />
          <QuickStat value={`${stats.totalHours}h`} label="Played" color="var(--accent-color)" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'playing', 'completed', 'to-play'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className="px-3 py-1.5 font-mono text-xs uppercase transition-all"
            style={{
              backgroundColor: filter === status ? 'var(--accent-color)' : 'transparent',
              color: filter === status ? 'white' : 'var(--text-muted)',
              border: '1px solid var(--border-color)',
            }}
          >
            {status === 'all' ? 'All' : status.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Genre Tags */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {stats.genres.map((genre) => (
          <span
            key={genre}
            className="px-2 py-1 text-xs font-mono"
            style={{
              backgroundColor: 'var(--bg-main)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)',
            }}
          >
            {genre}
          </span>
        ))}
      </div>

      {/* Games Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGames.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}

function GameCard({ game }: { game: Game }) {
  const isPlaying = game.status === 'playing';
  const isCompleted = game.status === 'completed';
  
  return (
    <div 
      className="p-4 transition-all duration-200 hover:translate-y-[-2px] relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-main)',
        border: isPlaying 
          ? `2px solid ${statusColors.playing}` 
          : '1px solid var(--border-color)',
      }}
    >
      {/* Status Badge */}
      {isPlaying && (
        <div 
          className="absolute top-2 right-2 px-2 py-0.5 text-xs font-mono uppercase"
          style={{ 
            backgroundColor: statusColors.playing,
            color: 'white',
          }}
        >
          Playing
        </div>
      )}
      
      <div className="flex items-start gap-3">
        {/* Game Icon/Cover placeholder */}
        <div 
          className="w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          🎮
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 
            className="font-mono text-sm truncate"
            style={{ color: 'var(--text-main)' }}
          >
            {game.title}
          </h4>
          
          <div className="flex items-center gap-2 mt-1">
            <span 
              className="px-1.5 py-0.5 text-xs font-mono"
              style={{ 
                backgroundColor: `${statusColors[game.status]}20`,
                color: statusColors[game.status],
              }}
            >
              {game.genre}
            </span>
            <span 
              className="text-xs font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              {game.platform}
            </span>
          </div>
          
          {/* Rating */}
          {isCompleted && game.rating && (
            <div 
              className="mt-2 text-sm"
              style={{ color: '#F59E0B' }}
            >
              {'★'.repeat(game.rating)}
              {'☆'.repeat(5 - game.rating)}
            </div>
          )}
          
          {/* Hours */}
          {game.hoursPlayed && (
            <p 
              className="text-xs font-mono mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {game.hoursPlayed}h played
            </p>
          )}
        </div>
      </div>
      
      {/* Notes */}
      {game.notes && (
        <p 
          className="text-xs mt-3 line-clamp-2"
          style={{ color: 'var(--text-muted)' }}
        >
          {game.notes}
        </p>
      )}
    </div>
  );
}

function QuickStat({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <div className="text-center">
      <div 
        className="text-2xl font-mono font-bold"
        style={{ color }}
      >
        {value}
      </div>
      <div 
        className="text-xs font-mono uppercase"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </div>
    </div>
  );
}

export default GamesSection;
