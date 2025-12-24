'use client';

import React, { useState, useEffect } from 'react';

const moods = [
  { name: 'Creative', emoji: '🎨', color: 'bg-purple-200' },
  { name: 'Focused', emoji: '💻', color: 'bg-blue-200' },
  { name: 'Energetic', emoji: '⚡', color: 'bg-yellow-200' },
  { name: 'Relaxed', emoji: '😌', color: 'bg-green-200' },
  { name: 'Inspired', emoji: '✨', color: 'bg-pink-200' },
  { name: 'Productive', emoji: '🚀', color: 'bg-orange-200' },
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
    <article className="p-4 bg-[var(--bg-card)]">
      <div className="bg-[var(--accent-color)] p-2 mb-3 -m-4 -mt-4">
        <h3 className="font-mono font-bold text-sm uppercase text-[var(--bg-main)] flex items-center gap-2">
          <span>😊</span> MOOD REPORT
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-1 mb-3 mt-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-1 border border-[var(--border-color)] bg-[var(--bg-main)]"></div>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        <div className={`${currentMood.color} p-4 text-center`}>
          <div className="text-4xl mb-2">{currentMood.emoji}</div>
          <div className="font-mono font-bold text-lg uppercase">{currentMood.name}</div>
        </div>
        {moodHistory.length > 0 && (
          <div className="border-t border-[var(--border-color)] pt-2">
            <div className="text-[10px] font-mono font-bold mb-1 uppercase">RECENT MOODS:</div>
            <div className="flex gap-2 text-xs font-mono">
              {moodHistory.map((mood, idx) => (
                <span key={idx} className="border border-[var(--border-color)] px-2 py-1 bg-[var(--bg-main)]">
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
