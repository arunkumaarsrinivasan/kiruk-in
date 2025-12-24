'use client';

import React, { useState, useEffect } from 'react';

const breakingNewsItems = [
  {
    id: 1,
    headline: 'HOW TO PLAY: Click PLAY Button to Start Games',
    summary: 'Find the ▶ PLAY button in the bottom-left corner. Click it to activate mini-games on the grid. Each game teaches you about my skills, projects, or personality. Reach 50 points to complete!',
    category: 'INSTRUCTIONS',
    time: 'Just now'
  },
  {
    id: 2,
    headline: 'LEARN ABOUT ME: Games Reveal Personal Facts',
    summary: 'Every mini-game contains information about me. Snake game shows my skills, Painter reveals my design style, Collector displays my projects. Play to discover fun facts!',
    category: 'GAMEPLAY',
    time: '2 min ago'
  },
  {
    id: 3,
    headline: 'EXPLORE PAGES: Each Page Has Interactive Elements',
    summary: 'Navigate to /about for an interactive life journey, /work for project showcases, /arcade for more games, and /contact for a bomb defusal challenge. Every page is a new adventure!',
    category: 'NAVIGATION',
    time: '5 min ago'
  },
  {
    id: 4,
    headline: 'KEYBOARD SHORTCUTS: Speed Up Your Experience',
    summary: 'Press SPACE to start/pause games, ESC to close modals, R to shuffle games. Use arrow keys on /about page to move the character. Master these shortcuts for faster exploration!',
    category: 'TIPS',
    time: '10 min ago'
  },
  {
    id: 5,
    headline: 'ACHIEVEMENTS: Complete Games to Unlock Progress',
    summary: 'Reach 50 points in any mini-game to complete it and earn achievements. Track your progress and see how much you\'ve learned about me through interactive gameplay!',
    category: 'PROGRESS',
    time: '15 min ago'
  },
];

export default function BreakingNews() {
  const [currentNews, setCurrentNews] = useState(breakingNewsItems[0]);
  const [tickerText, setTickerText] = useState('');

  useEffect(() => {
    // Rotate news items
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * breakingNewsItems.length);
      setCurrentNews(breakingNewsItems[randomIndex]);
    }, 12000); // Change every 12 seconds

    // Create ticker text
    const ticker = breakingNewsItems.map(item => item.headline).join(' • ');
    setTickerText(ticker);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="mb-6">
      {/* Breaking News Banner - Pixel Grid Style */}
      <div className="p-3 mb-4 bg-[var(--accent-color)]">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--bg-main)] px-3 py-1">
            <span className="font-mono font-bold text-xs uppercase text-[var(--accent-color)] animate-pulse">
              BREAKING
            </span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="whitespace-nowrap animate-marquee font-mono text-xs md:text-sm text-[var(--bg-main)] inline-block">
              {tickerText} • {tickerText} • 
            </div>
          </div>
        </div>
      </div>

      {/* Main Breaking News Article - Pixel Grid */}
      <article className="p-6 bg-[var(--bg-card)]">
        <div className="grid grid-cols-4 gap-1 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-1 border border-[var(--border-color)] bg-[var(--bg-main)]"></div>
          ))}
        </div>
        <div className="flex items-start gap-4 mb-4 flex-wrap">
          <div className="bg-[var(--accent-color)] px-3 py-1">
            <span className="font-mono font-bold text-xs uppercase text-[var(--bg-main)]">
              {currentNews.category}
            </span>
          </div>
          <div className="text-xs font-mono text-[var(--text-muted)]">{currentNews.time}</div>
        </div>
        <h3 className="text-xl md:text-2xl font-mono font-bold mb-3 leading-tight uppercase">
          {currentNews.headline}
        </h3>
        <p className="text-sm md:text-base leading-relaxed font-mono">
          {currentNews.summary}
        </p>
      </article>

      {/* Additional News Items - Pixel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {breakingNewsItems.slice(1, 3).map((item) => (
          <article 
            key={item.id} 
            className="p-4 bg-[var(--bg-card)]"
          >
            <div className="grid grid-cols-3 gap-1 mb-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-1 border border-[var(--border-color)] bg-[var(--bg-main)]"></div>
              ))}
            </div>
            <div className="bg-[var(--accent-color)] px-2 py-1 mb-2 inline-block">
              <span className="font-mono font-bold text-[10px] uppercase text-[var(--bg-main)]">{item.category}</span>
            </div>
            <h4 className="font-mono font-bold text-sm mb-2 uppercase">{item.headline}</h4>
            <p className="text-xs font-mono leading-relaxed">{item.summary}</p>
            <div className="text-[10px] font-mono text-[var(--text-muted)] mt-2">{item.time}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
