'use client';

import { useState, useCallback } from 'react';
import { GridArcade } from '@/components/ui/arcade';
import { getDefaultGameId } from '@/components/ui/arcade/game-registry';
import { GridBackground } from '@/components/ui/GridBackground';

export default function LabPage() {
  const [gameId, setGameId] = useState(getDefaultGameId());

  return (
    <main className="fixed inset-0 overflow-hidden relative" style={{ backgroundColor: 'var(--bg-main)' }}>
      <GridBackground />
      {/* Lab Header */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 text-center">
        <h1 className="text-2xl font-mono font-bold uppercase tracking-wider text-[var(--text-main)] mb-2">
          🧪 Lab
        </h1>
        <p className="text-sm font-mono text-[var(--text-muted)]">
          Interactive games and experiments
        </p>
      </div>

      {/* Grid Arcade - All Games */}
      <GridArcade defaultGameId={gameId} />
    </main>
  );
}

