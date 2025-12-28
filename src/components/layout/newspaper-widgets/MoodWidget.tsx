'use client';

import React, { useState, useEffect } from 'react';
import { PixelIcon } from '@/components/ui/PixelIcon';

const moods = [
  { name: 'Creative', icon: 'sparkles', color: 'bg-purple-200' },
  { name: 'Focused', icon: 'eye', color: 'bg-blue-200' },
  { name: 'Energetic', icon: 'bolt', color: 'bg-yellow-200' },
  { name: 'Relaxed', icon: 'heart', color: 'bg-green-200' },
  { name: 'Inspired', icon: 'lightbulb', color: 'bg-pink-200' },
  { name: 'Productive', icon: 'fire', color: 'bg-orange-200' },
];

export default function MoodWidget() {
  const [currentMood, setCurrentMood] = useState(moods[0]);
  const [moodHistory, setMoodHistory] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      setCurrentMood(randomMood);
      setMoodHistory(prev => [randomMood.name, ...prev].slice(0, 3));
    }, 45000);

    setCurrentMood(moods[Math.floor(Math.random() * moods.length)]);

    return () => clearInterval(interval);
  }, []);

  return (
    <article className="grid-p-1 bg-[var(--bg-card)]">
      <div className="bg-[var(--accent-color)] grid-p-1 grid-mb-1 -m-1 -mt-1">
        <h3 className="font-mono font-bold text-sm uppercase text-[var(--bg-main)] flex items-center grid-gap-1">
          <PixelIcon name="sparkles" size={16} className="text-[var(--bg-main)]" /> MOOD REPORT
        </h3>
      </div>
      <div className="grid grid-cols-2 grid-gap-1 grid-mb-1 grid-mt-1">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-1 border border-[var(--border-color)] bg-[var(--bg-main)]"></div>
        ))}
      </div>
      <div className="grid-mt-1 space-y-3">
        <div className={`${currentMood.color} grid-p-1 text-center`}>
          <div className="flex justify-center grid-mb-1">
            <PixelIcon name={currentMood.icon} size={40} className="text-[var(--text-main)]" />
          </div>
          <div className="font-mono font-bold text-lg uppercase">{currentMood.name}</div>
        </div>
        {moodHistory.length > 0 && (
          <div className="border-t border-[var(--border-color)] grid-pt-1">
            <div className="text-[10px] font-mono font-bold grid-mb-1 uppercase">RECENT MOODS:</div>
            <div className="flex grid-gap-1 text-xs font-mono">
              {moodHistory.map((mood, idx) => (
                <span key={idx} className="border border-[var(--border-color)] grid-px-1 grid-py-1 bg-[var(--bg-main)]">
                  {mood}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="text-[10px] font-mono text-[var(--text-muted)] italic">
          Current status: {currentMood.name.toLowerCase()} and ready to create
        </div>
      </div>
    </article>
  );
}
