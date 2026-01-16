'use client';

import React from 'react';
import { motion } from 'framer-motion';

export type EmoteType = 
  | 'heart' 
  | 'star' 
  | 'fire' 
  | 'sparkle' 
  | 'thumbsup' 
  | 'rocket' 
  | 'lightbulb' 
  | 'coffee'
  | 'code'
  | 'paint'
  | 'check'
  | 'crown'
  | 'diamond'
  | 'zap';

interface PixelEmoteProps {
  type: EmoteType;
  size?: number;
  className?: string;
  animated?: boolean;
  color?: string;
}

/**
 * 8-bit style animated emote icons
 */
export function PixelEmote({ 
  type, 
  size = 24, 
  className = '', 
  animated = true,
  color 
}: Readonly<PixelEmoteProps>) {
  const emoteConfig = getEmoteConfig(type);
  const fillColor = color || emoteConfig.color;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ imageRendering: 'pixelated' }}
      className={className}
      initial={animated ? { scale: 0 } : undefined}
      animate={animated ? { 
        scale: 1,
        ...(emoteConfig.animation || {})
      } : undefined}
      transition={animated ? {
        scale: { type: 'spring', stiffness: 300, damping: 15 },
        ...(emoteConfig.animationTransition || {})
      } : undefined}
    >
      {emoteConfig.render(fillColor)}
    </motion.svg>
  );
}

interface EmoteConfig {
  color: string;
  render: (color: string) => React.ReactNode;
  animation?: Record<string, unknown>;
  animationTransition?: Record<string, unknown>;
}

function getEmoteConfig(type: EmoteType): EmoteConfig {
  const configs: Record<EmoteType, EmoteConfig> = {
    heart: {
      color: '#E91E63',
      render: (c) => (
        <>
          <rect x="2" y="4" width="2" height="2" fill={c} />
          <rect x="4" y="2" width="2" height="2" fill={c} />
          <rect x="4" y="4" width="2" height="2" fill={c} />
          <rect x="6" y="4" width="2" height="2" fill={c} />
          <rect x="8" y="2" width="2" height="2" fill={c} />
          <rect x="8" y="4" width="2" height="2" fill={c} />
          <rect x="10" y="4" width="2" height="2" fill={c} />
          <rect x="12" y="4" width="2" height="2" fill={c} />
          <rect x="2" y="6" width="2" height="2" fill={c} />
          <rect x="4" y="6" width="2" height="2" fill={c} />
          <rect x="6" y="6" width="2" height="2" fill={c} />
          <rect x="8" y="6" width="2" height="2" fill={c} />
          <rect x="10" y="6" width="2" height="2" fill={c} />
          <rect x="12" y="6" width="2" height="2" fill={c} />
          <rect x="4" y="8" width="2" height="2" fill={c} />
          <rect x="6" y="8" width="2" height="2" fill={c} />
          <rect x="8" y="8" width="2" height="2" fill={c} />
          <rect x="10" y="8" width="2" height="2" fill={c} />
          <rect x="6" y="10" width="2" height="2" fill={c} />
          <rect x="8" y="10" width="2" height="2" fill={c} />
          <rect x="6" y="12" width="4" height="2" fill={c} />
        </>
      ),
      animation: { scale: [1, 1.15, 1] },
      animationTransition: { scale: { duration: 0.8, repeat: Infinity } },
    },
    star: {
      color: '#FFD700',
      render: (c) => (
        <>
          <rect x="7" y="1" width="2" height="2" fill={c} />
          <rect x="7" y="3" width="2" height="2" fill={c} />
          <rect x="5" y="5" width="2" height="2" fill={c} />
          <rect x="7" y="5" width="2" height="2" fill={c} />
          <rect x="9" y="5" width="2" height="2" fill={c} />
          <rect x="1" y="7" width="2" height="2" fill={c} />
          <rect x="3" y="7" width="2" height="2" fill={c} />
          <rect x="5" y="7" width="2" height="2" fill={c} />
          <rect x="7" y="7" width="2" height="2" fill={c} />
          <rect x="9" y="7" width="2" height="2" fill={c} />
          <rect x="11" y="7" width="2" height="2" fill={c} />
          <rect x="13" y="7" width="2" height="2" fill={c} />
          <rect x="5" y="9" width="2" height="2" fill={c} />
          <rect x="7" y="9" width="2" height="2" fill={c} />
          <rect x="9" y="9" width="2" height="2" fill={c} />
          <rect x="4" y="11" width="2" height="2" fill={c} />
          <rect x="10" y="11" width="2" height="2" fill={c} />
          <rect x="3" y="13" width="2" height="2" fill={c} />
          <rect x="11" y="13" width="2" height="2" fill={c} />
        </>
      ),
      animation: { rotate: [0, 10, -10, 0] },
      animationTransition: { rotate: { duration: 2, repeat: Infinity } },
    },
    fire: {
      color: '#FF6B00',
      render: (c) => (
        <>
          <rect x="7" y="1" width="2" height="2" fill="#FFCC00" />
          <rect x="6" y="3" width="4" height="2" fill="#FFCC00" />
          <rect x="5" y="5" width="6" height="2" fill={c} />
          <rect x="4" y="7" width="8" height="2" fill={c} />
          <rect x="4" y="9" width="8" height="2" fill={c} />
          <rect x="5" y="11" width="6" height="2" fill="#CC3300" />
          <rect x="6" y="13" width="4" height="2" fill="#CC3300" />
        </>
      ),
      animation: { y: [0, -2, 0] },
      animationTransition: { y: { duration: 0.4, repeat: Infinity } },
    },
    sparkle: {
      color: '#9C27B0',
      render: (c) => (
        <>
          <rect x="7" y="2" width="2" height="2" fill={c} />
          <rect x="7" y="4" width="2" height="2" fill={c} />
          <rect x="3" y="6" width="2" height="2" fill={c} />
          <rect x="5" y="6" width="2" height="2" fill={c} />
          <rect x="7" y="6" width="2" height="4" fill={c} />
          <rect x="9" y="6" width="2" height="2" fill={c} />
          <rect x="11" y="6" width="2" height="2" fill={c} />
          <rect x="7" y="10" width="2" height="2" fill={c} />
          <rect x="7" y="12" width="2" height="2" fill={c} />
        </>
      ),
      animation: { opacity: [1, 0.5, 1], scale: [1, 1.1, 1] },
      animationTransition: { opacity: { duration: 1.5, repeat: Infinity } },
    },
    thumbsup: {
      color: '#4CAF50',
      render: (c) => (
        <>
          <rect x="8" y="2" width="2" height="2" fill="#FDBF60" />
          <rect x="8" y="4" width="4" height="2" fill="#FDBF60" />
          <rect x="4" y="6" width="8" height="2" fill="#FDBF60" />
          <rect x="4" y="8" width="8" height="2" fill="#FDBF60" />
          <rect x="4" y="10" width="8" height="2" fill="#FDBF60" />
          <rect x="2" y="8" width="2" height="4" fill="#FDBF60" />
          <rect x="4" y="12" width="8" height="2" fill={c} />
        </>
      ),
    },
    rocket: {
      color: '#2196F3',
      render: (c) => (
        <>
          <rect x="7" y="1" width="2" height="2" fill="#E0E0E0" />
          <rect x="6" y="3" width="4" height="2" fill="#E0E0E0" />
          <rect x="5" y="5" width="6" height="4" fill={c} />
          <rect x="5" y="9" width="6" height="2" fill="#E0E0E0" />
          <rect x="3" y="9" width="2" height="4" fill="#E91E63" />
          <rect x="11" y="9" width="2" height="4" fill="#E91E63" />
          <rect x="6" y="11" width="4" height="2" fill="#FF6B00" />
          <rect x="7" y="13" width="2" height="2" fill="#FFCC00" />
        </>
      ),
      animation: { y: [0, -3, 0] },
      animationTransition: { y: { duration: 0.6, repeat: Infinity } },
    },
    lightbulb: {
      color: '#FFD700',
      render: (c) => (
        <>
          <rect x="6" y="2" width="4" height="2" fill={c} />
          <rect x="4" y="4" width="8" height="2" fill={c} />
          <rect x="4" y="6" width="8" height="2" fill={c} />
          <rect x="5" y="8" width="6" height="2" fill={c} />
          <rect x="6" y="10" width="4" height="2" fill="#666" />
          <rect x="6" y="12" width="4" height="2" fill="#888" />
        </>
      ),
      animation: { opacity: [1, 0.7, 1] },
      animationTransition: { opacity: { duration: 1, repeat: Infinity } },
    },
    coffee: {
      color: '#795548',
      render: (c) => (
        <>
          <rect x="5" y="3" width="2" height="2" fill="#999" />
          <rect x="8" y="2" width="2" height="2" fill="#999" />
          <rect x="4" y="5" width="8" height="2" fill="#FFF" />
          <rect x="4" y="7" width="8" height="4" fill="#FFF" />
          <rect x="5" y="8" width="6" height="2" fill={c} />
          <rect x="12" y="7" width="2" height="4" fill="#FFF" />
          <rect x="4" y="11" width="8" height="2" fill="#DDD" />
        </>
      ),
    },
    code: {
      color: '#4FC3F7',
      render: (c) => (
        <>
          <rect x="2" y="6" width="2" height="2" fill={c} />
          <rect x="4" y="4" width="2" height="2" fill={c} />
          <rect x="4" y="8" width="2" height="2" fill={c} />
          <rect x="6" y="2" width="2" height="2" fill={c} />
          <rect x="6" y="10" width="2" height="2" fill={c} />
          <rect x="10" y="4" width="2" height="2" fill={c} />
          <rect x="10" y="8" width="2" height="2" fill={c} />
          <rect x="8" y="2" width="2" height="2" fill={c} />
          <rect x="8" y="10" width="2" height="2" fill={c} />
          <rect x="12" y="6" width="2" height="2" fill={c} />
        </>
      ),
    },
    paint: {
      color: '#E91E63',
      render: (c) => (
        <>
          <rect x="10" y="2" width="2" height="2" fill="#8D6E63" />
          <rect x="9" y="4" width="2" height="2" fill="#8D6E63" />
          <rect x="8" y="6" width="2" height="2" fill="#8D6E63" />
          <rect x="6" y="8" width="4" height="2" fill={c} />
          <rect x="4" y="10" width="4" height="2" fill={c} />
          <rect x="2" y="12" width="4" height="2" fill={c} />
        </>
      ),
    },
    check: {
      color: '#4CAF50',
      render: (c) => (
        <>
          <rect x="12" y="3" width="2" height="2" fill={c} />
          <rect x="10" y="5" width="2" height="2" fill={c} />
          <rect x="8" y="7" width="2" height="2" fill={c} />
          <rect x="6" y="9" width="2" height="2" fill={c} />
          <rect x="4" y="7" width="2" height="2" fill={c} />
          <rect x="2" y="5" width="2" height="2" fill={c} />
        </>
      ),
    },
    crown: {
      color: '#FFD700',
      render: (c) => (
        <>
          <rect x="2" y="10" width="12" height="4" fill={c} />
          <rect x="2" y="6" width="2" height="4" fill={c} />
          <rect x="7" y="4" width="2" height="6" fill={c} />
          <rect x="12" y="6" width="2" height="4" fill={c} />
          <rect x="3" y="11" width="2" height="2" fill="#E91E63" />
          <rect x="7" y="11" width="2" height="2" fill="#2196F3" />
          <rect x="11" y="11" width="2" height="2" fill="#4CAF50" />
        </>
      ),
    },
    diamond: {
      color: '#00BCD4',
      render: (c) => (
        <>
          <rect x="7" y="2" width="2" height="2" fill={c} />
          <rect x="5" y="4" width="6" height="2" fill={c} />
          <rect x="3" y="6" width="10" height="2" fill={c} />
          <rect x="5" y="8" width="6" height="2" fill={c} />
          <rect x="6" y="10" width="4" height="2" fill={c} />
          <rect x="7" y="12" width="2" height="2" fill={c} />
        </>
      ),
      animation: { rotate: [0, 5, -5, 0] },
      animationTransition: { rotate: { duration: 2, repeat: Infinity } },
    },
    zap: {
      color: '#FFD700',
      render: (c) => (
        <>
          <rect x="8" y="1" width="4" height="2" fill={c} />
          <rect x="6" y="3" width="4" height="2" fill={c} />
          <rect x="4" y="5" width="6" height="2" fill={c} />
          <rect x="6" y="7" width="6" height="2" fill={c} />
          <rect x="8" y="9" width="4" height="2" fill={c} />
          <rect x="6" y="11" width="4" height="2" fill={c} />
          <rect x="4" y="13" width="4" height="2" fill={c} />
        </>
      ),
      animation: { opacity: [1, 0.3, 1] },
      animationTransition: { opacity: { duration: 0.3, repeat: Infinity } },
    },
  };

  return configs[type];
}

export default PixelEmote;
