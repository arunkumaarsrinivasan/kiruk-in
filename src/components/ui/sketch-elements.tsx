'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Type definitions
type Size = 'sm' | 'md' | 'lg';

// Wireframe-style heading component
export const SketchHeading = ({ 
  children, 
  className = '',
  level = 1,
  underline = true 
}: {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  underline?: boolean;
}) => {
  const headingElements = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
    5: 'h5',
    6: 'h6'
  } as const;
  
  const Tag = headingElements[level] as any;
  return (
    <Tag className={`font-bold uppercase tracking-widest text-[var(--text-main)] ${underline ? 'border-b-[var(--border-width)] border-[var(--border-color)] pb-2' : ''} ${className}`}>{children}</Tag>
  );
};

// Wireframe-style border component
export const SketchBorder = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`absolute inset-0 w-full h-full border-[var(--border-width)] border-[var(--border-color)] ${className}`} />
  );
};

// Wireframe-style card component
export const SketchCard = ({ 
  children, 
  className = '',
  tilt = 'left' 
}: {
  children: React.ReactNode;
  className?: string;
  tilt?: 'left' | 'right' | 'none';
}) => {
  // Tilt is ignored in wireframe mode for a rigid look
  return (
    <motion.div
      className={`
        relative p-4 bg-[var(--bg-card)]
        border-[var(--border-width)] border-[var(--border-color)]
        shadow-none
        transition-all duration-300 ease-out
        hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-none
        ${className}
      `}
      tabIndex={0}
    >
      {children}
    </motion.div>
  );
};

// Wireframe-style button
export const SketchButton = ({ 
  children, 
  onClick,
  href,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: Size;
  className?: string;
  disabled?: boolean;
}) => {  const baseClasses = `
    relative font-bold uppercase tracking-wider
    border-[var(--border-width)] border-[var(--border-color)]
    transition-all duration-200 ease-out
    transform active:translate-y-[2px] active:translate-x-[2px] active:shadow-none
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--border-color)]
    disabled:opacity-50 disabled:cursor-not-allowed
    inline-block text-center no-underline
    shadow-none
  `;  const variants = {
    primary: 'bg-[var(--text-main)] text-[var(--bg-main)] hover:bg-[var(--text-muted)]',
    secondary: 'bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--bg-main)]',
    outline: 'bg-transparent text-[var(--text-main)] hover:bg-[var(--bg-card)]'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const content = (
    <span className="relative z-10">{children}</span>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {content}
    </motion.button>
  );
};

// Wireframe-style divider
export const SketchDivider = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`relative my-8 ${className}`}>
      <div className="h-[var(--border-width)] bg-[var(--border-color)] w-full" />
    </div>
  );
};

// Wireframe-style highlight box
export const SketchHighlight = ({ 
  children, 
  color = 'gray',
  className = '' 
}: {
  children: React.ReactNode;
  color?: 'gray' | 'light' | 'dark' | 'muted';
  className?: string;
}) => {
  // Colors are now handled by CSS variables mostly, but we can keep some variation if needed
  // For now, map all to standard card bg to enforce theme
  const colors = {
    gray: 'bg-[var(--bg-card)]',
    light: 'bg-[var(--bg-card)]',
    dark: 'bg-[var(--bg-card)]',
    muted: 'bg-[var(--bg-card)]'
  };
  return (
    <span
      className={`
        relative inline-block px-2 py-1 border-[var(--border-width)] border-[var(--border-color)]
        ${colors[color]}
        shadow-none
        font-mono text-sm text-[var(--text-main)]
        ${className}
      `}
    >
      {children}
    </span>
  );
};

// Sticky note component - Now a rigid info card
export const StickyNote = ({ 
  children, 
  color = 'light',
  size = 'md',
  className = '' 
}: {
  children: React.ReactNode;
  color?: 'light' | 'medium' | 'dark' | 'white';
  size?: Size;
  className?: string;
}) => {
  const colors = {
    light: 'bg-[var(--bg-card)]',
    medium: 'bg-[var(--bg-card)]',
    dark: 'bg-[var(--bg-card)]',
    white: 'bg-[var(--bg-card)]'
  };

  const sizes = {
    sm: 'w-32 h-32 text-xs',
    md: 'w-40 h-40 text-sm',
    lg: 'w-48 h-48 text-base'
  };

  return (    <div
      className={`
        relative p-4 border-[var(--border-width)] border-[var(--border-color)]
        ${colors[color]} ${sizes[size]}
        shadow-none
        ${className}
      `}
    >
      <div className="font-mono text-[var(--text-main)] h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};

// Wireframe Arrow (Straight lines)
export const SketchArrow = ({ 
  direction = 'right',
  size = 'md',
  className = '' 
}: {
  direction?: 'up' | 'down' | 'left' | 'right';
  size?: Size;
  className?: string;
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const rotations = {
    up: '-rotate-90',
    down: 'rotate-90',
    left: 'rotate-180',
    right: 'rotate-0'
  };

  return (
    <div
      className={`${sizes[size]} ${rotations[direction]} ${className}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d="M 0 50 L 80 50 M 60 30 L 80 50 L 60 70"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinecap="square"
          strokeLinejoin="miter"
          className="text-[var(--text-main)]"
        />
      </svg>
    </div>
  );
};

// Wireframe-style card component with long measurement lines
export const WireframeCard = ({ 
  children, 
  className = '',
  measurement
}: {
  children: React.ReactNode;
  className?: string;
  measurement?: string;
}) => {
  return (
    <div className={`relative mb-12 ${className}`}>
      {/* Long Horizontal Lines - extending far beyond */}
      <div className="absolute top-0 left-[-100vw] right-[-100vw] h-px bg-[var(--border-color)] opacity-20" />
      <div className="absolute bottom-0 left-[-100vw] right-[-100vw] h-px bg-[var(--border-color)] opacity-20" />
      
      {/* Long Vertical Lines - extending far beyond */}
      <div className="absolute top-[-100vh] bottom-[-100vh] left-0 w-px bg-[var(--border-color)] opacity-20" />
      <div className="absolute top-[-100vh] bottom-[-100vh] right-0 w-px bg-[var(--border-color)] opacity-20" />

      {/* Measurement Label */}
      {measurement && (
        <div className="absolute -top-3 left-4 text-xs text-[var(--text-main)] bg-[var(--bg-card)] px-2 font-mono border-[var(--border-width)] border-[var(--border-color)] z-20">
          DURATION: {measurement}
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 bg-[var(--bg-card)] border-[var(--border-width)] border-[var(--border-color)] shadow-none">
        {children}
      </div>
    </div>
  );
};

// Internal grid separator for wireframe layout
export const WireframeSeparator = ({ vertical = false }: { vertical?: boolean }) => {
  if (vertical) {
    return <div className="absolute top-[-100vh] bottom-[-100vh] w-px bg-[var(--border-color)] opacity-20" />;
  }
  return <div className="absolute left-[-100vw] right-[-100vw] h-px bg-[var(--border-color)] opacity-20" />;
};

