'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  href?: string;
  external?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, href, external, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-gray-900 text-white hover:bg-gray-800',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      outline: 'border border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50',
      ghost: 'text-gray-900 hover:bg-gray-100'
    };
    
    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-13 px-8 text-lg'
    };

    const buttonClasses = cn(
      baseClasses,
      variants[variant],
      sizes[size],
      className
    );

    const MotionButton = motion.button;

    if (href) {
      const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
      
      return (
        <motion.a
          href={href}
          className={buttonClasses}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          {...linkProps}
        >
          {children}
        </motion.a>
      );
    }

    return (
      <MotionButton
        className={buttonClasses}
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        {...props}
      >
        {children}
      </MotionButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;
