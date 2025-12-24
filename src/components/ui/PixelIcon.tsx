'use client';

/**
 * PixelIcon Component
 * 
 * Wrapper component for @hackernoon/pixel-icon-library SVG icons
 * Supports both regular and solid variants with theming
 */

import React from 'react';
import { cn } from '@/lib/utils';

// Icon name mapping to file paths
const ICON_PATHS: Record<string, string> = {
  // Navigation icons
  'home': 'solid/home-solid.svg',
  'user': 'solid/user-solid.svg',
  'grid': 'solid/grid-solid.svg',
  'folder': 'solid/folder-solid.svg',
  'chart': 'solid/chart-line-solid.svg',
  'globe': 'solid/globe-solid.svg',
  'envelope': 'solid/envelope-solid.svg',
  'bars': 'solid/bars-solid.svg',
  'times': 'solid/times-solid.svg',
  
  // Media controls
  'play': 'solid/play-solid.svg',
  'pause': 'solid/pause-solid.svg',
  'shuffle': 'solid/shuffle-solid.svg',
  
  // UI elements
  'clock': 'solid/clock-solid.svg',
  'calender': 'solid/calender-solid.svg',
  'cog': 'solid/cog-solid.svg',
  'search': 'solid/search-solid.svg',
  'star': 'solid/star-solid.svg',
  'heart': 'solid/heart-solid.svg',
  'fire': 'solid/fire-solid.svg',
  'bolt': 'solid/bolt-solid.svg',
  'trophy': 'solid/trophy-solid.svg',
  'sparkles': 'solid/sparkles-solid.svg',
  'question': 'solid/question-solid.svg',
  'info': 'solid/info-circle-solid.svg',
  'eye': 'solid/eye-solid.svg',
  'bookmark': 'solid/bookmark-solid.svg',
  'flag': 'solid/flag-solid.svg',
  'check': 'solid/check-solid.svg',
  'plus': 'solid/plus-solid.svg',
  'minus': 'solid/minus-solid.svg',
  
  // Arrows
  'arrow-left': 'solid/arrow-left-solid.svg',
  'arrow-right': 'solid/arrow-right-solid.svg',
  'arrow-up': 'solid/arrow-up-solid.svg',
  'arrow-down': 'solid/arrow-down-solid.svg',
  'angle-left': 'solid/angle-left-solid.svg',
  'angle-right': 'solid/angle-right-solid.svg',
  'angle-up': 'solid/angle-up-solid.svg',
  'angle-down': 'solid/angle-down-solid.svg',
  'chevron-up': 'solid/chevron-up-solid.svg',
  'chevron-down': 'solid/chevron-down-solid.svg',
  'expand': 'solid/expand-solid.svg',
  
  // Misc
  'themes': 'solid/themes-solid.svg',
  'sun': 'solid/sun-solid.svg',
  'moon': 'solid/moon-solid.svg',
  'refresh': 'solid/refresh-solid.svg',
  'external-link': 'solid/external-link-solid.svg',
  'code': 'solid/code-solid.svg',
  'analytics': 'solid/analytics-solid.svg',
  'location': 'solid/location-pin-solid.svg',
  'pen': 'solid/pen-solid.svg',
  'lightbulb': 'solid/lightbulb-solid.svg',
  'robot': 'solid/robot-solid.svg',
  
  // Regular icons
  'bars-regular': 'regular/bars.svg',
  'clock-regular': 'regular/clock.svg',
};

interface PixelIconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const PixelIcon: React.FC<PixelIconProps> = ({
  name,
  size = 16,
  className,
  style,
}) => {
  const iconPath = ICON_PATHS[name];
  
  if (!iconPath) {
    // Fallback to text icon
    return (
      <span 
        className={cn('font-mono', className)} 
        style={{ fontSize: size, ...style }}
      >
        ?
      </span>
    );
  }

  return (
    <span
      className={cn('inline-block', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url(/icons/${iconPath})`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskImage: `url(/icons/${iconPath})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        ...style,
      }}
    />
  );
};

// Direct SVG inline component for better control
export const PixelIconInline: React.FC<PixelIconProps> = ({
  name,
  size = 16,
  className,
  style,
}) => {
  // Using CSS mask for color theming
  const iconPath = ICON_PATHS[name];
  
  if (!iconPath) {
    return <span className={cn('font-mono', className)} style={{ fontSize: size, ...style }}>?</span>;
  }

  return (
    <span
      className={cn('inline-block', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url(/icons/${iconPath})`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskImage: `url(/icons/${iconPath})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        ...style,
      }}
    />
  );
};

export default PixelIcon;
