'use client';

import React, { useState, useEffect } from 'react';
import { PixelIcon } from '@/components/ui/PixelIcon';

export default function LocationWidget() {
  const [location, setLocation] = useState({
    city: 'Bangalore',
    area: 'Silicon Valley of India',
    coordinates: '12.9716° N, 77.5946° E',
    timezone: 'IST (GMT+5:30)',
    status: 'Working from Home'
  });

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const locations = [
      { area: 'Silicon Valley of India', status: 'Working from Home' },
      { area: 'Tech Hub', status: 'In Office' },
      { area: 'Innovation District', status: 'Working from Home' },
      { area: 'IT Corridor', status: 'Remote' },
    ];

    const interval = setInterval(() => {
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      setLocation(prev => ({ ...prev, ...randomLocation }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <article className="grid-p-1 bg-[var(--bg-card)]">
      <div className="bg-[var(--accent-color)] grid-p-1 grid-mb-1 -m-1 -mt-1">
        <h3 className="font-mono font-bold text-sm uppercase text-[var(--bg-main)] flex items-center grid-gap-1">
          <PixelIcon name="location" size={16} className="text-[var(--bg-main)]" /> LOCATION REPORT
        </h3>
      </div>
      <div className="grid grid-cols-2 grid-gap-1 grid-mb-1 grid-mt-1">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-1 border border-[var(--border-color)] bg-[var(--bg-main)]"></div>
        ))}
      </div>
      <div className="grid-mt-1 space-y-3">
        <div className="grid-p-1 bg-[var(--bg-main)]">
          <div className="font-mono font-bold text-sm grid-mb-1 uppercase">{location.city}</div>
          <div className="text-xs font-mono">{location.area}</div>
        </div>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between border-b border-[var(--border-color)] pb-1">
            <span>Coordinates:</span>
            <span className="font-bold">{location.coordinates}</span>
          </div>
          <div className="flex justify-between border-b border-[var(--border-color)] pb-1">
            <span>Timezone:</span>
            <span className="font-bold">{location.timezone}</span>
          </div>
          <div className="flex justify-between border-b border-[var(--border-color)] pb-1">
            <span>Status:</span>
            <span className="font-bold">{location.status}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span>Local Time:</span>
            <span className="font-bold">
              {time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-[var(--text-muted)] italic grid-mt-1">
          Based in the heart of India's technology capital
        </div>
      </div>
    </article>
  );
}
