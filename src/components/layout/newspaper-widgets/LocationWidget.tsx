'use client';

import React, { useState, useEffect } from 'react';

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

  const locations = [
    { area: 'Silicon Valley of India', status: 'Working from Home' },
    { area: 'Tech Hub', status: 'In Office' },
    { area: 'Innovation District', status: 'Working from Home' },
    { area: 'IT Corridor', status: 'Remote' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      setLocation(prev => ({ ...prev, ...randomLocation }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <article className="p-4 bg-[var(--bg-card)]">
      <div className="bg-[var(--accent-color)] p-2 mb-3 -m-4 -mt-4">
        <h3 className="font-mono font-bold text-sm uppercase text-[var(--bg-main)] flex items-center gap-2">
          <span>📍</span> LOCATION REPORT
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-1 mb-3 mt-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-1 border border-[var(--border-color)] bg-[var(--bg-main)]"></div>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        <div className="p-3 bg-[var(--bg-main)]">
          <div className="font-mono font-bold text-sm mb-1 uppercase">{location.city}</div>
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
        <div className="text-[10px] font-mono text-[var(--text-muted)] italic mt-2">
          Based in the heart of India's technology capital
        </div>
      </div>
    </article>
  );
}
