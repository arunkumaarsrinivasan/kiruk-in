'use client';

import React, { useState, useEffect } from 'react';
import { PixelIcon } from '@/components/ui/PixelIcon';

export default function WeatherWidget() {
  const [weather, setWeather] = useState({
    temp: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12
  });

  // Simulate weather updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWeather(prev => ({
        ...prev,
        temp: prev.temp + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2),
        humidity: Math.max(50, Math.min(80, prev.humidity + (Math.random() > 0.5 ? 1 : -1) * 2))
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = () => {
    if (weather.condition.includes('Cloudy')) return 'cloud';
    if (weather.condition.includes('Sunny')) return 'sun';
    if (weather.condition.includes('Rain')) return 'cloud';
    return 'sun';
  };

  return (
    <article className="grid-p-1 bg-[var(--bg-card)]">
      <div className="bg-[var(--accent-color)] grid-p-1 grid-mb-1 -m-1 -mt-1">
        <h3 className="font-mono font-bold text-sm uppercase text-[var(--bg-main)] flex items-center grid-gap-1">
          <PixelIcon name="bolt" size={16} className="text-[var(--bg-main)]" /> WEATHER REPORT
        </h3>
      </div>
      <div className="grid grid-cols-2 grid-gap-1 grid-mb-1 grid-mt-1">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-1 border border-[var(--border-color)] bg-[var(--bg-main)]"></div>
        ))}
      </div>
      <div className="grid-mt-1 space-y-2">
        <div className="flex items-center justify-between">
          <PixelIcon name={getWeatherIcon()} size={32} className="text-[var(--text-main)]" />
          <div className="text-right">
            <div className="text-2xl font-mono font-bold">{weather.temp}°C</div>
            <div className="text-xs font-mono">{weather.condition}</div>
          </div>
        </div>
        <div className="border-t border-[var(--border-color)] grid-pt-1 grid-mt-1 space-y-1 text-xs font-mono">
          <div className="flex justify-between">
            <span>Humidity:</span>
            <span className="font-bold">{weather.humidity}%</span>
          </div>
          <div className="flex justify-between">
            <span>Wind Speed:</span>
            <span className="font-bold">{weather.windSpeed} km/h</span>
          </div>
          <div className="flex justify-between">
            <span>Location:</span>
            <span className="font-bold">Bangalore</span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-[var(--text-muted)] grid-mt-1 italic">
          Last updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </article>
  );
}
