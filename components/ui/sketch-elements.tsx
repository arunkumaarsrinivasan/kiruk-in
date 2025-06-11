'use client';

import React from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';

// Sketch-style heading component
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
    <Tag className={`sketch-font ${underline ? 'sketch-underline' : ''} ${className}`}>{children}</Tag>
  );
};

// Sketch-style card component
export const SketchCard = ({ 
  children, 
  className = '',
  tilt = 'left' 
}: {
  children: React.ReactNode;
  className?: string;
  tilt?: 'left' | 'right' | 'none';
}) => {
  const tiltClass = {
    left: '-rotate-1',
    right: 'rotate-1',
    none: 'rotate-0'
  };

  return (
    <motion.div
      className={`
        relative p-6 bg-white paper-texture
        border-2 border-gray-300 rounded-lg
        ${tiltClass[tilt]}
        transition-all duration-300 ease-out
        hover:scale-105
        ${className}
      `}
      whileHover={{
        rotate: tilt === 'left' ? -0.5 : tilt === 'right' ? 0.5 : 0,
        y: -5
      }}
      tabIndex={0}
    >
      {children}
    </motion.div>
  );
};

// Sketch-style button
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
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}) => {  const baseClasses = `
    relative font-bold sketch-font
    border-2 rounded-xl
    transition-all duration-200 ease-out
    transform hover:scale-105 active:scale-95
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    inline-block text-center no-underline
  `;  const variants = {
    primary: 'bg-white border-black text-black hover:bg-gray-100 focus:ring-black btn-primary-text',
    secondary: 'bg-gray-100 border-gray-600 text-black hover:bg-gray-200 focus:ring-gray-500 btn-secondary-text',
    outline: 'bg-white border-gray-600 text-gray-800 hover:bg-gray-50 focus:ring-gray-500 btn-secondary-text'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const content = (
    <>      {/* Hand-drawn inner border */}
      <div className="absolute inset-2 border border-dashed border-current opacity-30 rounded-lg" />
      
      <span className="relative z-10">{children}</span>
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        whileHover={{ rotate: Math.random() > 0.5 ? 0.5 : -0.5 }}
        whileTap={{ scale: 0.95 }}
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
      whileHover={{ rotate: Math.random() > 0.5 ? 0.5 : -0.5 }}
      whileTap={{ scale: 0.95 }}
    >
      {content}
    </motion.button>
  );
};

// Sketch-style divider
export const SketchDivider = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`relative my-8 ${className}`}>
      <motion.div
        className="h-0.5 bg-gray-400"
        initial={{ width: 0, rotate: 0 }}
        animate={{ width: '100%', rotate: 0.5 }}
        transition={{ duration: 1 }}
      />
      <motion.div
        className="absolute top-1 h-0.5 bg-gray-300 opacity-50"
        initial={{ width: 0, rotate: 0 }}
        animate={{ width: '98%', rotate: -0.3 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
    </div>
  );
};

// Sketch-style highlight box
export const SketchHighlight = ({ 
  children, 
  color = 'gray',
  className = '' 
}: {
  children: React.ReactNode;
  color?: 'gray' | 'light' | 'dark' | 'muted';
  className?: string;
}) => {
  const colors = {
    gray: 'bg-gray-200 border-gray-400',
    light: 'bg-gray-100 border-gray-300',
    dark: 'bg-gray-300 border-gray-500',
    muted: 'bg-gray-50 border-gray-200'
  };
  return (
    <motion.span
      className={`
        relative inline-block px-2 py-1 border-2 border-dashed rounded-lg
        ${colors[color]}
        transform -rotate-0.5
        ${className}
      `}
      whileHover={{ rotate: 0.5, scale: 1.02 }}
    >
      <span className="sketch-font">{children}</span>
      
      {/* Highlight marker effect */}
      <span className="absolute inset-0 bg-current opacity-10 rounded-lg transform rotate-0.5" />
    </motion.span>
  );
};

// Sticky note component
export const StickyNote = ({ 
  children, 
  color = 'light',
  size = 'md',
  className = '' 
}: {
  children: React.ReactNode;
  color?: 'light' | 'medium' | 'dark' | 'white';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const colors = {
    light: 'bg-gray-50 border-gray-200',
    medium: 'bg-gray-100 border-gray-300',
    dark: 'bg-gray-200 border-gray-400',
    white: 'bg-white border-gray-300'
  };

  const sizes = {
    sm: 'w-32 h-32 text-xs',
    md: 'w-40 h-40 text-sm',
    lg: 'w-48 h-48 text-base'
  };

  return (    <motion.div
      className={`
        relative p-4 border rounded-lg
        ${colors[color]} ${sizes[size]}
        transform rotate-2
        ${className}
      `}
      whileHover={{ 
        rotate: -1, 
        scale: 1.05,
        y: -5
      }}
      drag
      dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
    >
      {/* Tape effect at top */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gray-200 opacity-70 rounded-sm rotate-12" />
      
      <div className="handwritten text-gray-800 h-full overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
};

// Hand-drawn arrow
export const SketchArrow = ({ 
  direction = 'right',
  size = 'md',
  className = '' 
}: {
  direction?: 'up' | 'down' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
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
    <motion.div
      className={`${sizes[size]} ${rotations[direction]} ${className}`}
      animate={{ 
        rotate: [0, 5, -5, 0],
        scale: [1, 1.1, 1] 
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        repeatType: 'reverse' 
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <motion.path
          d="M 10 50 Q 50 30 80 50 Q 50 70 80 50 M 70 40 L 80 50 L 70 60"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
};
