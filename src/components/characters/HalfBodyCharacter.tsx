'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  SectionCharacterConfig,
  HatType,
  PropType,
  EyeStyle,
  MouthStyle,
} from '@/data/section-characters';

interface HalfBodyCharacterProps {
  config: SectionCharacterConfig;
  headRotation?: number;
  eyeOffset?: { x: number; y: number };
  className?: string;
  isBlinking?: boolean;
}

// SVG dimensions for the half-body character
const SVG_WIDTH = 200;
const SVG_HEIGHT = 280;

/**
 * 8-bit style half-body character component
 * Shows character from waist up with configurable hats, costumes, and props
 */
export function HalfBodyCharacter({
  config,
  headRotation = 0,
  eyeOffset = { x: 0, y: 0 },
  className = '',
  isBlinking = false,
}: HalfBodyCharacterProps) {
  const { hatType, hatColor, costumeColors, personality, props } = config;

  // Memoize hat rendering for performance
  const hatElement = useMemo(() => {
    return renderHat(hatType, hatColor || getDefaultHatColor(hatType));
  }, [hatType, hatColor]);

  // Memoize prop elements
  const leftPropElement = useMemo(() => {
    return renderProp(props.leftHand, 'left');
  }, [props.leftHand]);

  const rightPropElement = useMemo(() => {
    return renderProp(props.rightHand, 'right');
  }, [props.rightHand]);

  return (
    <motion.svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      style={{ imageRendering: 'pixelated' }}
      className={`drop-shadow-xl ${className}`}
      initial={{ opacity: 0.3, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
    >
      {/* Glow effect if configured */}
      {config.glowColor && (
        <defs>
          <filter id={`glow-${config.sectionId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      {/* === BODY (rendered first, behind everything) === */}
      <g id="body" filter={config.glowColor ? `url(#glow-${config.sectionId})` : undefined}>
        {/* Torso - main body */}
        <rect x="60" y="160" width="80" height="100" fill={costumeColors.primary} />
        {/* Shoulders */}
        <rect x="45" y="165" width="20" height="70" fill={costumeColors.primary} />
        <rect x="135" y="165" width="20" height="70" fill={costumeColors.primary} />
        {/* Collar/Secondary color accent */}
        <rect x="75" y="155" width="50" height="15" fill={costumeColors.secondary} />
        {/* Collar V-shape */}
        <polygon points="85,155 100,175 115,155" fill={costumeColors.secondary} />
      </g>

      {/* === ARMS === */}
      <g id="arms">
        {/* Left arm */}
        <rect x="30" y="170" width="20" height="55" fill={costumeColors.primary} />
        {/* Left hand */}
        <rect x="25" y="220" width="25" height="25" fill={costumeColors.skin} />
        
        {/* Right arm */}
        <rect x="150" y="170" width="20" height="55" fill={costumeColors.primary} />
        {/* Right hand */}
        <rect x="150" y="220" width="25" height="25" fill={costumeColors.skin} />
      </g>

      {/* === PROPS (in hands) === */}
      <g id="props">
        {leftPropElement}
        {rightPropElement}
      </g>

      {/* === NECK === */}
      <rect x="85" y="140" width="30" height="20" fill={costumeColors.skin} />

      {/* === HEAD (animated rotation) === */}
      <motion.g
        id="head"
        style={{
          originX: '100px',
          originY: '100px',
        }}
        animate={{
          rotate: headRotation,
        }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 15,
        }}
      >
        {/* Head shape */}
        <rect x="55" y="50" width="90" height="95" fill={costumeColors.skin} />
        {/* Ears */}
        <rect x="45" y="80" width="15" height="30" fill={costumeColors.skin} />
        <rect x="140" y="80" width="15" height="30" fill={costumeColors.skin} />

        {/* === HAIR (behind hat) === */}
        <g id="hair">
          {/* Hair on sides */}
          <rect x="50" y="60" width="15" height="35" fill={costumeColors.hair} />
          <rect x="135" y="60" width="15" height="35" fill={costumeColors.hair} />
          {/* Hair peeking from under hat */}
          {hatType !== 'none' && (
            <>
              <rect x="55" y="50" width="15" height="10" fill={costumeColors.hair} />
              <rect x="130" y="50" width="15" height="10" fill={costumeColors.hair} />
            </>
          )}
          {/* Full hair when no hat */}
          {hatType === 'none' && (
            <rect x="55" y="45" width="90" height="20" fill={costumeColors.hair} />
          )}
        </g>

        {/* === HAT === */}
        {hatElement}

        {/* === FACE === */}
        <g id="face">
          {/* Eyes with movement */}
          <motion.g
            id="eyes"
            animate={{
              x: eyeOffset.x,
              y: eyeOffset.y,
            }}
            transition={{
              type: 'spring',
              stiffness: 150,
              damping: 12,
            }}
          >
            {renderEyes(personality.eyeStyle, isBlinking)}
          </motion.g>

          {/* Mouth */}
          {renderMouth(personality.mouthStyle)}

          {/* Optional: Eyebrows based on personality */}
          {renderEyebrows(personality.eyeStyle)}
        </g>
      </motion.g>

      {/* Idle animation breathing effect */}
      {personality.idleAnimation === 'breathing' && (
        <motion.g
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.svg>
  );
}

// === RENDER HELPER FUNCTIONS ===

function getDefaultHatColor(hatType: HatType): string {
  const colors: Record<HatType, string> = {
    none: 'transparent',
    beret: '#E91E63',
    cap: '#2196F3',
    hardhat: '#FF9800',
    fedora: '#333333',
    headphones: '#2196F3',
    officer: '#1A237E',
    crown: '#FFD700',
  };
  return colors[hatType];
}

function renderHat(hatType: HatType, color: string): React.ReactNode {
  switch (hatType) {
    case 'beret':
      return (
        <g id="hat-beret">
          {/* Beret main body */}
          <rect x="50" y="35" width="100" height="20" fill={color} />
          <rect x="55" y="25" width="90" height="15" fill={color} />
          <rect x="65" y="18" width="70" height="12" fill={color} />
          {/* Beret puff on side */}
          <ellipse cx="140" cy="30" rx="18" ry="15" fill={color} />
          {/* Highlight */}
          <rect x="75" y="28" width="15" height="8" fill="rgba(255,255,255,0.3)" />
        </g>
      );

    case 'cap':
      return (
        <g id="hat-cap">
          {/* Cap crown */}
          <rect x="50" y="35" width="100" height="18" fill={color} />
          <rect x="55" y="25" width="90" height="15" fill={color} />
          <rect x="65" y="18" width="70" height="12" fill={color} />
          {/* Cap brim */}
          <rect x="35" y="48" width="65" height="10" fill={darkenColor(color, 0.2)} />
          {/* Cap button */}
          <rect x="95" y="15" width="10" height="8" fill={darkenColor(color, 0.3)} />
          {/* Code symbol */}
          <text x="100" y="40" fontSize="14" fill="white" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
            {'</>'}
          </text>
        </g>
      );

    case 'hardhat':
      return (
        <g id="hat-hardhat">
          {/* Hard hat dome */}
          <rect x="45" y="35" width="110" height="15" fill={color} />
          <rect x="50" y="22" width="100" height="18" fill={color} />
          <rect x="60" y="12" width="80" height="15" fill={color} />
          {/* Hard hat brim */}
          <rect x="40" y="47" width="120" height="8" fill={color} />
          {/* Reflective stripe */}
          <rect x="55" y="30" width="90" height="6" fill="rgba(255,255,255,0.5)" />
        </g>
      );

    case 'fedora':
      return (
        <g id="hat-fedora">
          {/* Fedora crown */}
          <rect x="55" y="30" width="90" height="25" fill={color} />
          <rect x="60" y="20" width="80" height="15" fill={color} />
          {/* Crown indent */}
          <rect x="70" y="18" width="60" height="8" fill={darkenColor(color, 0.15)} />
          {/* Brim */}
          <rect x="35" y="50" width="130" height="8" fill={color} />
          {/* Hat band */}
          <rect x="55" y="48" width="90" height="6" fill="#333333" />
        </g>
      );

    case 'headphones':
      return (
        <g id="hat-headphones">
          {/* Headband */}
          <rect x="55" y="38" width="90" height="10" fill={color} />
          <rect x="60" y="30" width="80" height="12" fill={color} />
          {/* Left earpiece */}
          <rect x="40" y="70" width="25" height="35" fill={color} rx="4" />
          <rect x="45" y="75" width="15" height="25" fill={darkenColor(color, 0.3)} rx="2" />
          {/* Right earpiece */}
          <rect x="135" y="70" width="25" height="35" fill={color} rx="4" />
          <rect x="140" y="75" width="15" height="25" fill={darkenColor(color, 0.3)} rx="2" />
          {/* Cushion detail */}
          <rect x="42" y="80" width="8" height="20" fill="#555" />
          <rect x="150" y="80" width="8" height="20" fill="#555" />
        </g>
      );

    case 'officer':
      return (
        <g id="hat-officer">
          {/* Officer cap crown */}
          <rect x="50" y="32" width="100" height="22" fill={color} />
          <rect x="55" y="22" width="90" height="15" fill={color} />
          {/* Cap top */}
          <rect x="60" y="15" width="80" height="12" fill={color} />
          {/* Brim - shiny black */}
          <rect x="40" y="50" width="120" height="10" fill="#111111" />
          {/* Gold band */}
          <rect x="50" y="45" width="100" height="8" fill="#FFD700" />
          {/* Badge/Emblem */}
          <rect x="88" y="28" width="24" height="18" fill="#FFD700" />
          <rect x="93" y="32" width="14" height="10" fill={color} />
        </g>
      );

    case 'crown':
      return (
        <g id="hat-crown">
          {/* Crown base */}
          <rect x="55" y="40" width="90" height="20" fill={color} />
          {/* Crown points */}
          <polygon points="55,40 65,15 75,40" fill={color} />
          <polygon points="85,40 100,5 115,40" fill={color} />
          <polygon points="125,40 135,15 145,40" fill={color} />
          {/* Jewels */}
          <circle cx="65" cy="25" r="5" fill="#E91E63" />
          <circle cx="100" cy="15" r="6" fill="#2196F3" />
          <circle cx="135" cy="25" r="5" fill="#4CAF50" />
          {/* Base jewels */}
          <circle cx="75" cy="50" r="4" fill="#9C27B0" />
          <circle cx="100" cy="50" r="4" fill="#E91E63" />
          <circle cx="125" cy="50" r="4" fill="#FF9800" />
        </g>
      );

    case 'none':
    default:
      return null;
  }
}

function renderEyes(eyeStyle: EyeStyle, isBlinking: boolean): React.ReactNode {
  if (isBlinking) {
    // Closed eyes for blinking
    return (
      <>
        <rect x="70" y="95" width="20" height="4" fill="#2D2D2D" />
        <rect x="110" y="95" width="20" height="4" fill="#2D2D2D" />
      </>
    );
  }

  switch (eyeStyle) {
    case 'focused':
      return (
        <>
          {/* Slightly narrowed eyes */}
          <rect x="70" y="88" width="18" height="14" fill="#2D2D2D" />
          <rect x="112" y="88" width="18" height="14" fill="#2D2D2D" />
          {/* Smaller pupils */}
          <rect x="78" y="92" width="6" height="6" fill="white" />
          <rect x="120" y="92" width="6" height="6" fill="white" />
        </>
      );

    case 'curious':
      return (
        <>
          {/* Wide eyes */}
          <rect x="68" y="85" width="22" height="20" fill="#2D2D2D" />
          <rect x="110" y="85" width="22" height="20" fill="#2D2D2D" />
          {/* Large pupils */}
          <rect x="76" y="90" width="10" height="10" fill="white" />
          <rect x="118" y="90" width="10" height="10" fill="white" />
        </>
      );

    case 'excited':
      return (
        <>
          {/* Sparkly excited eyes */}
          <rect x="68" y="85" width="22" height="20" fill="#2D2D2D" />
          <rect x="110" y="85" width="22" height="20" fill="#2D2D2D" />
          {/* Star-like pupils */}
          <rect x="74" y="90" width="12" height="10" fill="white" />
          <rect x="116" y="90" width="12" height="10" fill="white" />
          <rect x="78" y="88" width="4" height="4" fill="white" />
          <rect x="120" y="88" width="4" height="4" fill="white" />
        </>
      );

    case 'wink':
      return (
        <>
          {/* Left eye normal */}
          <rect x="70" y="88" width="18" height="16" fill="#2D2D2D" />
          <rect x="76" y="92" width="8" height="8" fill="white" />
          {/* Right eye winking (closed) */}
          <rect x="112" y="95" width="18" height="4" fill="#2D2D2D" />
        </>
      );

    case 'closed':
      return (
        <>
          <rect x="70" y="95" width="18" height="4" fill="#2D2D2D" />
          <rect x="112" y="95" width="18" height="4" fill="#2D2D2D" />
        </>
      );

    case 'normal':
    default:
      return (
        <>
          {/* Standard eyes */}
          <rect x="70" y="88" width="18" height="16" fill="#2D2D2D" />
          <rect x="112" y="88" width="18" height="16" fill="#2D2D2D" />
          {/* Pupils */}
          <rect x="76" y="92" width="8" height="8" fill="white" />
          <rect x="118" y="92" width="8" height="8" fill="white" />
        </>
      );
  }
}

function renderMouth(mouthStyle: MouthStyle): React.ReactNode {
  switch (mouthStyle) {
    case 'grin':
      return (
        <>
          <rect x="80" y="120" width="40" height="8" fill="#2D2D2D" />
          <rect x="75" y="115" width="8" height="8" fill="#2D2D2D" />
          <rect x="117" y="115" width="8" height="8" fill="#2D2D2D" />
          {/* Teeth */}
          <rect x="85" y="120" width="30" height="4" fill="white" />
        </>
      );

    case 'speaking':
      return (
        <motion.g
          animate={{
            scaleY: [1, 0.7, 1, 1.2, 1],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
          }}
        >
          <ellipse cx="100" cy="124" rx="15" ry="10" fill="#2D2D2D" />
        </motion.g>
      );

    case 'thinking':
      return (
        <>
          {/* Slight frown/straight line */}
          <rect x="85" y="122" width="30" height="4" fill="#2D2D2D" />
        </>
      );

    case 'surprised':
      return (
        <ellipse cx="100" cy="124" rx="12" ry="15" fill="#2D2D2D" />
      );

    case 'neutral':
      return (
        <rect x="88" y="122" width="24" height="4" fill="#2D2D2D" />
      );

    case 'smile':
    default:
      return (
        <>
          <rect x="80" y="118" width="40" height="6" fill="#2D2D2D" />
          <rect x="75" y="115" width="8" height="6" fill="#2D2D2D" />
          <rect x="117" y="115" width="8" height="6" fill="#2D2D2D" />
        </>
      );
  }
}

function renderEyebrows(eyeStyle: EyeStyle): React.ReactNode {
  switch (eyeStyle) {
    case 'focused':
      return (
        <>
          {/* Slightly furrowed */}
          <rect x="68" y="78" width="22" height="4" fill="#4A4A4A" style={{ transform: 'rotate(5deg)' }} />
          <rect x="110" y="78" width="22" height="4" fill="#4A4A4A" style={{ transform: 'rotate(-5deg)' }} />
        </>
      );

    case 'curious':
      return (
        <>
          {/* Raised eyebrows */}
          <rect x="68" y="74" width="22" height="4" fill="#4A4A4A" />
          <rect x="110" y="74" width="22" height="4" fill="#4A4A4A" />
        </>
      );

    case 'excited':
      return (
        <>
          {/* High raised eyebrows */}
          <rect x="68" y="72" width="22" height="3" fill="#4A4A4A" />
          <rect x="110" y="72" width="22" height="3" fill="#4A4A4A" />
        </>
      );

    default:
      return (
        <>
          {/* Normal eyebrows */}
          <rect x="68" y="78" width="22" height="4" fill="#4A4A4A" />
          <rect x="110" y="78" width="22" height="4" fill="#4A4A4A" />
        </>
      );
  }
}

function renderProp(propType: PropType, side: 'left' | 'right'): React.ReactNode {
  const xOffset = side === 'left' ? 15 : 155;
  const yOffset = 200;

  switch (propType) {
    case 'pencil':
      return (
        <g transform={`translate(${xOffset}, ${yOffset})`}>
          <rect x="0" y="0" width="8" height="45" fill="#FFD700" />
          <rect x="0" y="-8" width="8" height="10" fill="#E91E63" />
          <polygon points="0,45 4,55 8,45" fill="#FDBF60" />
          <polygon points="2,52 4,58 6,52" fill="#333" />
        </g>
      );

    case 'laptop':
      return (
        <g transform={`translate(${xOffset - 15}, ${yOffset})`}>
          {/* Screen */}
          <rect x="0" y="0" width="50" height="35" fill="#333" rx="2" />
          <rect x="3" y="3" width="44" height="29" fill="#4FC3F7" />
          {/* Code lines */}
          <rect x="6" y="8" width="20" height="3" fill="#fff" />
          <rect x="6" y="14" width="30" height="3" fill="#81C784" />
          <rect x="6" y="20" width="15" height="3" fill="#FFB74D" />
          {/* Base */}
          <rect x="-5" y="35" width="60" height="5" fill="#555" rx="1" />
        </g>
      );

    case 'badge':
      return (
        <g transform={`translate(${xOffset}, ${yOffset})`}>
          <rect x="0" y="0" width="25" height="35" fill="#fff" rx="2" />
          <rect x="0" y="0" width="25" height="10" fill="#2196F3" />
          {/* Photo placeholder */}
          <rect x="5" y="13" width="15" height="15" fill="#E0E0E0" />
          {/* Text lines */}
          <rect x="3" y="30" width="19" height="2" fill="#333" />
        </g>
      );

    case 'paintbrush':
      return (
        <g transform={`translate(${xOffset}, ${yOffset})`}>
          <rect x="2" y="0" width="6" height="40" fill="#8D6E63" />
          {/* Brush head */}
          <rect x="0" y="-15" width="10" height="18" fill="#666" />
          {/* Paint on brush */}
          <rect x="1" y="-12" width="8" height="10" fill="#E91E63" />
        </g>
      );

    case 'magnifying-glass':
      return (
        <g transform={`translate(${xOffset}, ${yOffset})`}>
          {/* Handle */}
          <rect x="0" y="25" width="8" height="30" fill="#8D6E63" />
          {/* Glass frame */}
          <circle cx="4" cy="15" r="18" fill="none" stroke="#333" strokeWidth="4" />
          {/* Glass */}
          <circle cx="4" cy="15" r="14" fill="rgba(200,230,255,0.5)" />
          {/* Shine */}
          <ellipse cx="-2" cy="10" rx="4" ry="6" fill="rgba(255,255,255,0.6)" />
        </g>
      );

    case 'coffee':
      return (
        <g transform={`translate(${xOffset}, ${yOffset})`}>
          {/* Cup */}
          <rect x="0" y="5" width="25" height="30" fill="#fff" rx="2" />
          {/* Handle */}
          <path d="M25,12 Q35,12 35,20 Q35,28 25,28" fill="none" stroke="#fff" strokeWidth="5" />
          {/* Coffee */}
          <rect x="3" y="10" width="19" height="20" fill="#6D4C41" />
          {/* Steam */}
          <path d="M8,0 Q12,-8 8,-12" fill="none" stroke="#999" strokeWidth="2" />
          <path d="M15,0 Q19,-10 15,-15" fill="none" stroke="#999" strokeWidth="2" />
        </g>
      );

    case 'code-bracket':
      return (
        <g transform={`translate(${xOffset - 5}, ${yOffset})`}>
          <text x="0" y="25" fontSize="35" fill="#2196F3" fontFamily="monospace" fontWeight="bold">
            {'</>'}
          </text>
        </g>
      );

    case 'briefcase':
      return (
        <g transform={`translate(${xOffset - 5}, ${yOffset})`}>
          {/* Main case */}
          <rect x="0" y="10" width="35" height="28" fill="#795548" rx="3" />
          {/* Handle */}
          <rect x="12" y="0" width="11" height="12" fill="none" stroke="#5D4037" strokeWidth="3" />
          {/* Clasp */}
          <rect x="14" y="18" width="7" height="5" fill="#FFD700" />
        </g>
      );

    case 'notebook':
      return (
        <g transform={`translate(${xOffset}, ${yOffset})`}>
          <rect x="0" y="0" width="25" height="35" fill="#fff" />
          <rect x="0" y="0" width="5" height="35" fill="#E91E63" />
          {/* Lines */}
          <rect x="8" y="8" width="15" height="2" fill="#ccc" />
          <rect x="8" y="14" width="15" height="2" fill="#ccc" />
          <rect x="8" y="20" width="15" height="2" fill="#ccc" />
          <rect x="8" y="26" width="10" height="2" fill="#ccc" />
        </g>
      );

    case 'phone':
      return (
        <g transform={`translate(${xOffset}, ${yOffset})`}>
          <rect x="0" y="0" width="20" height="35" fill="#333" rx="3" />
          <rect x="2" y="4" width="16" height="24" fill="#4FC3F7" />
          {/* Home button */}
          <circle cx="10" cy="31" r="2" fill="#555" />
        </g>
      );

    case 'camera':
      return (
        <g transform={`translate(${xOffset - 5}, ${yOffset})`}>
          {/* Body */}
          <rect x="0" y="8" width="35" height="25" fill="#333" rx="3" />
          {/* Lens */}
          <circle cx="17" cy="20" r="10" fill="#222" />
          <circle cx="17" cy="20" r="7" fill="#1A237E" />
          <circle cx="14" cy="17" r="2" fill="rgba(255,255,255,0.5)" />
          {/* Flash */}
          <rect x="25" y="10" width="8" height="5" fill="#FFD700" />
          {/* Viewfinder */}
          <rect x="5" y="2" width="12" height="8" fill="#222" rx="1" />
        </g>
      );

    case 'none':
    default:
      return null;
  }
}

// Utility function to darken a color
function darkenColor(hex: string, amount: number): string {
  const num = Number.parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default HalfBodyCharacter;
