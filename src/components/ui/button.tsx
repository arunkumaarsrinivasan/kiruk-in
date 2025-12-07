'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  href?: string;
  external?: boolean;
  icon?: React.ReactNode; // Optional hand-drawn icon
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, href, external, icon, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-none font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-black text-white hover:bg-gray-800',
      secondary: 'bg-gray-100 text-black hover:bg-gray-200',
      outline: 'border border-gray-300 text-black hover:border-gray-400 hover:bg-gray-50',
      ghost: 'text-black hover:bg-gray-100'
    };
    
    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-4 text-base',
      lg: 'h-13 px-8 text-lg'
    };

    const buttonClasses = cn(
      baseClasses,
      variants[variant],
      sizes[size],
      className
    );

    if (href) {
      const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
      
      return (
        <Link href={href} {...linkProps} className={buttonClasses}>
          {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
          {children}
        </Link>
      );
    }

    const { onAnimationStart, onAnimationEnd, onAnimationIteration, onDrag, onDragEnd, onDragStart, ...buttonProps } = props;

    return (
      <motion.button
        className={buttonClasses}
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        {...buttonProps}
      >
        {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
