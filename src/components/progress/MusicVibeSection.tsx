'use client';

import { musicVibes, MusicVibe } from '@/data/life-progress-data';

interface MusicVibeSectionProps {
  className?: string;
}

export function MusicVibeSection({ className = '' }: MusicVibeSectionProps) {
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
          <span className="text-3xl">🎵</span>
          <div>
            <h2 
              className="text-2xl font-mono uppercase tracking-wider"
              style={{ color: 'var(--text-main)' }}
            >
              Music Vibes
            </h2>
            <p 
              className="text-sm font-mono mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              What I listen to while building
            </p>
          </div>
        </div>
      </div>

      {/* Vibes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {musicVibes.map(vibe => (
          <VibeCard key={vibe.id} vibe={vibe} />
        ))}
      </div>

      {/* YouTube Music Link */}
      <div 
        className="mt-6 pt-4 text-center"
        style={{ borderTop: '1px solid var(--border-color)' }}
      >
        <a
          href="https://music.youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 font-mono text-sm transition-all hover:opacity-80"
          style={{
            backgroundColor: 'var(--accent-color)',
            color: 'white',
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z"/>
          </svg>
          Open YouTube Music
        </a>
      </div>
    </div>
  );
}

function VibeCard({ vibe }: { vibe: MusicVibe }) {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  ];
  
  const gradientIndex = vibe.id.charCodeAt(vibe.id.length - 1) % gradients.length;
  
  return (
    <div 
      className="p-4 transition-all duration-200 hover:translate-y-[-2px] cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-main)',
        border: '1px solid var(--border-color)',
      }}
    >
      {/* Gradient banner */}
      <div 
        className="h-20 mb-3 flex items-center justify-center rounded"
        style={{ background: gradients[gradientIndex] }}
      >
        <span className="text-4xl">🎧</span>
      </div>
      
      <h4 
        className="font-mono text-lg"
        style={{ color: 'var(--text-main)' }}
      >
        {vibe.name}
      </h4>
      <p 
        className="text-sm mt-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {vibe.description}
      </p>
      
      {/* Sample tracks */}
      {vibe.tracks && vibe.tracks.length > 0 && (
        <div className="mt-3 space-y-1">
          {vibe.tracks.slice(0, 3).map((track, i) => (
            <div 
              key={i}
              className="flex items-center gap-2 text-xs font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              <span style={{ color: 'var(--accent-color)' }}>♪</span>
              <span className="truncate">{track.title}</span>
              <span className="opacity-50">·</span>
              <span className="truncate opacity-75">{track.artist}</span>
            </div>
          ))}
        </div>
      )}
      
      {vibe.playlistUrl && (
        <a
          href={vibe.playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-xs font-mono underline"
          style={{ color: 'var(--accent-color)' }}
        >
          Open playlist →
        </a>
      )}
    </div>
  );
}

export default MusicVibeSection;
