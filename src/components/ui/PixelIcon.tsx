'use client';

/**
 * PixelIcon Component
 * 
 * Wrapper component for @hackernoon/pixel-icon-library SVG icons
 * Supports both regular and solid variants with theming
 */

import React from 'react';
import { cn } from '@/lib/utils';

// Icon name mapping to file paths - All hackernoon pixel icons
const ICON_PATHS: Record<string, string> = {
  // Navigation icons
  'home': 'solid/home-solid.svg',
  'user': 'solid/user-solid.svg',
  'grid': 'solid/grid-solid.svg',
  'folder': 'solid/folder-solid.svg',
  'folder-open': 'solid/folder-open-solid.svg',
  'chart': 'solid/chart-line-solid.svg',
  'chart-network': 'solid/chart-network-solid.svg',
  'globe': 'solid/globe-solid.svg',
  'globe-americas': 'solid/globe-americas-solid.svg',
  'envelope': 'solid/envelope-solid.svg',
  'bars': 'solid/bars-solid.svg',
  'times': 'solid/times-solid.svg',
  'times-circle': 'solid/times-circle-solid.svg',
  
  // Media controls
  'play': 'solid/play-solid.svg',
  'pause': 'solid/pause-solid.svg',
  'shuffle': 'solid/shuffle-solid.svg',
  'music': 'solid/music-solid.svg',
  'playlist': 'solid/playlist-solid.svg',
  'headphones': 'solid/headphones-solid.svg',
  'sound-on': 'solid/sound-on-solid.svg',
  'sound-mute': 'solid/sound-mute-solid.svg',
  
  // UI elements
  'clock': 'solid/clock-solid.svg',
  'calender': 'solid/calender-solid.svg',
  'cog': 'solid/cog-solid.svg',
  'search': 'solid/search-solid.svg',
  'star': 'solid/star-solid.svg',
  'star-crescent': 'solid/star-crescent-solid.svg',
  'heart': 'solid/heart-solid.svg',
  'fire': 'solid/fire-solid.svg',
  'bolt': 'solid/bolt-solid.svg',
  'trophy': 'solid/trophy-solid.svg',
  'sparkles': 'solid/sparkles-solid.svg',
  'question': 'solid/question-solid.svg',
  'info': 'solid/info-circle-solid.svg',
  'eye': 'solid/eye-solid.svg',
  'eye-cross': 'solid/eye-cross-solid.svg',
  'bookmark': 'solid/bookmark-solid.svg',
  'flag': 'solid/flag-solid.svg',
  'flag-checkered': 'solid/flag-checkered-solid.svg',
  'check': 'solid/check-solid.svg',
  'check-circle': 'solid/check-circle-solid.svg',
  'check-box': 'solid/check-box-solid.svg',
  'check-list': 'solid/check-list-solid.svg',
  'plus': 'solid/plus-solid.svg',
  'minus': 'solid/minus-solid.svg',
  'exclaimation': 'solid/exclaimation-solid.svg',
  'exclamation-triangle': 'solid/exclamation-triangle-solid.svg',
  
  // Arrows
  'arrow-left': 'solid/arrow-left-solid.svg',
  'arrow-right': 'solid/arrow-right-solid.svg',
  'arrow-up': 'solid/arrow-up-solid.svg',
  'arrow-down': 'solid/arrow-down-solid.svg',
  'arrow-circle-left': 'solid/arrow-circle-left-solid.svg',
  'arrow-circle-right': 'solid/arrow-circle-right-solid.svg',
  'arrow-circle-up': 'solid/arrow-circle-up-solid.svg',
  'arrow-circle-down': 'solid/arrow-circle-down-solid.svg',
  'arrow-alt-circle-left': 'solid/arrow-alt-circle-left-solid.svg',
  'arrow-alt-circle-right': 'solid/arrow-alt-circle-right-solid.svg',
  'arrow-alt-circle-up': 'solid/arrow-alt-circle-up-solid.svg',
  'arrow-alt-circle-down': 'solid/arrow-alt-circle-down-solid.svg',
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
  'code-block': 'solid/code-block-solid.svg',
  'analytics': 'solid/analytics-solid.svg',
  'location': 'solid/location-pin-solid.svg',
  'pen': 'solid/pen-solid.svg',
  'pen-nib': 'solid/pen-nib-solid.svg',
  'pencil': 'solid/pencil-solid.svg',
  'pencil-ruler': 'solid/pencil-ruler-solid.svg',
  'lightbulb': 'solid/lightbulb-solid.svg',
  'robot': 'solid/robot-solid.svg',
  'image': 'solid/image-solid.svg',
  'link': 'solid/link-solid.svg',
  'copy': 'solid/copy-solid.svg',
  'edit': 'solid/edit-solid.svg',
  'trash': 'solid/trash-solid.svg',
  'trash-alt': 'solid/trash-alt-solid.svg',
  'save': 'solid/save-solid.svg',
  'download': 'solid/download-solid.svg',
  'download-alt': 'solid/download-alt-solid.svg',
  'upload': 'solid/upload-solid.svg',
  'upload-alt': 'solid/upload-alt-solid.svg',
  'cloud': 'solid/cloud-download-solid.svg', // Using cloud-download as cloud icon
  'cloud-download': 'solid/cloud-download-solid.svg',
  'cloud-upload': 'solid/cloud-upload-solid.svg',
  'print': 'solid/print-solid.svg',
  'share': 'solid/share-solid.svg',
  'tag': 'solid/tag-solid.svg',
  'filter': 'solid/filter-solid.svg',
  'filter-alt-circle': 'solid/filter-alt-circle-solid.svg',
  'sort': 'solid/sort-solid.svg',
  'bell': 'solid/bell-solid.svg',
  'bell-mute': 'solid/bell-mute-solid.svg',
  'bell-exclaimation': 'solid/bell-exclaimation-solid.svg',
  'lock': 'solid/lock-solid.svg',
  'lock-open': 'solid/lock-open-solid.svg',
  'lock-alt': 'solid/lock-alt-solid.svg',
  'unlock': 'solid/unlock-solid.svg',
  'unlock-alt': 'solid/unlock-alt-solid.svg',
  'users': 'solid/users-solid.svg',
  'users-crown': 'solid/users-crown-solid.svg',
  'user-check': 'solid/user-check-solid.svg',
  'user-headset': 'solid/user-headset-solid.svg',
  'message': 'solid/message-solid.svg',
  'message-dots': 'solid/message-dots-solid.svg',
  'comment': 'solid/comment-solid.svg',
  'comment-dots': 'solid/comment-dots-solid.svg',
  'comment-quote': 'solid/comment-quote-solid.svg',
  'comments': 'solid/comments-solid.svg',
  'clipboard': 'solid/clipboard-solid.svg',
  'credit-card': 'solid/credit-card-solid.svg',
  'wallet': 'solid/wallet-solid.svg',
  'receipt': 'solid/receipt-solid.svg',
  'shop': 'solid/shop-solid.svg',
  'shopping-cart': 'solid/shopping-cart-solid.svg',
  'bank': 'solid/bank-solid.svg',
  'box-usd': 'solid/box-usd-solid.svg',
  'crown': 'solid/crown-solid.svg',
  'badge-check': 'solid/badge-check-solid.svg',
  'thumbsup': 'solid/thumbsup-solid.svg',
  'thumbsdown': 'solid/thumbsdown-solid.svg',
  'vote-yeah': 'solid/vote-yeah-solid.svg',
  'trending': 'solid/trending-solid.svg',
  'newspaper': 'solid/newspaper-solid.svg',
  'retro-camera': 'solid/retro-camera-solid.svg',
  'camera': 'solid/retro-camera-solid.svg', // Alias for retro-camera
  'plane': 'solid/plane-solid.svg',
  'plane-departure': 'solid/plane-departure-solid.svg',
  'phone-ringing-high': 'solid/phone-ringing-high-solid.svg',
  'phone-ringing-low': 'solid/phone-ringing-low-solid.svg',
  'people-carry': 'solid/people-carry-solid.svg',
  'seedlings': 'solid/seedlings-solid.svg',
  'book-heart': 'solid/book-heart-solid.svg',
  'table': 'solid/table-solid.svg',
  'paperclip': 'solid/paperclip-solid.svg',
  'file-import': 'solid/file-import-solid.svg',
  'translate': 'solid/translate-solid.svg',
  'at': 'solid/at-solid.svg',
  'cc': 'solid/cc-solid.svg',
  'ad': 'solid/ad-solid.svg',
  'pro': 'solid/pro-solid.svg',
  'window-close': 'solid/window-close-solid.svg',
  'ellipses-horizontal': 'solid/ellipses-horizontal-solid.svg',
  'ellipses-vertical': 'solid/ellipses-vertical-solid.svg',
  'ellipses-horizontal-circle': 'solid/ellipses-horizontal-circle-solid.svg',
  'ellipses-vertical-circle': 'solid/ellipses-vertical-circle-solid.svg',
  'circle-notch': 'solid/circle-notch-solid.svg',
  'spinner': 'solid/spinner-solid.svg',
  'spinner-third': 'solid/spinner-third-solid.svg',
  'octagon-check': 'solid/octagon-check-solid.svg',
  'octagon-times': 'solid/octagon-times-solid.svg',
  'face-thinking': 'solid/face-thinking-solid.svg',
  'brightness-high': 'solid/brightness-high-solid.svg',
  'brightness-low': 'solid/brightness-low-solid.svg',
  'login': 'solid/login-solid.svg',
  'logout': 'solid/logout-solid.svg',
  'highlight': 'solid/highlight-solid.svg',
  'thumbtack': 'solid/thumbtack-solid.svg',
  'divider': 'solid/divider-solid.svg',
  'page-break': 'solid/page-break-solid.svg',
  'paragraph': 'solid/paragraph-solid.svg',
  'heading-1': 'solid/heading-1-solid.svg',
  'heading-2': 'solid/heading-2-solid.svg',
  'heading-3': 'solid/heading-3-solid.svg',
  'bold': 'solid/bold-solid.svg',
  'italics': 'solid/italics-solid.svg',
  'underline': 'solid/underline-solid.svg',
  'strike-through': 'solid/strike-through-solid.svg',
  'text-slash': 'solid/text-slash-solid.svg',
  'align-left': 'solid/align-left-solid.svg',
  'align-right': 'solid/align-right-solid.svg',
  'align-center': 'solid/align-center-solid.svg',
  'align-justify': 'solid/align-justify-solid.svg',
  'bullet-list': 'solid/bullet-list-solid.svg',
  'numbered-list': 'solid/numbered-list-solid.svg',
  'indent': 'solid/indent-solid.svg',
  'outdent': 'solid/outdent-solid.svg',
  'line-height': 'solid/line-height-solid.svg',
  'quote-left': 'solid/quote-left-solid.svg',
  'quote-right': 'solid/quote-right-solid.svg',
  
  // Regular icons (when needed)
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
