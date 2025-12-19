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

// Teenage Engineering inspired timing and easing values
const TE_TIMING = {
  instant: 0.08, // 80ms - button press
  quick: 0.15,   // 150ms - hover states
};

const TE_EASING = {
  mechanical: [0.4, 0.0, 0.2, 1] as const,   // Precise, predictable
  spring: [0.34, 1.56, 0.64, 1] as const,    // Satisfying spring-back
  easeIn: [0.4, 0.0, 1, 1] as const,         // Quick in for active
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, href, external, icon, ...props }, ref) => {
    // Base classes with geometric precision (2px border-radius max)
    const baseClasses = cn(
      'te-button', // Apply TE interaction class
      'inline-flex items-center justify-center font-medium',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-color)]',
      'disabled:pointer-events-none disabled:opacity-50',
      'cursor-pointer select-none'
    );

    const variants = {
      primary: 'bg-[var(--text-main)] text-[var(--bg-main)] hover:bg-[var(--text-muted)] border border-[var(--border-color)]',
      secondary: 'bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--bg-main)] border border-[var(--border-color)]',
      outline: 'border border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--text-main)] hover:bg-[var(--bg-card)]',
      ghost: 'text-[var(--text-main)] hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-color)]'
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

    // Mechanical hover/tap variants for Framer Motion
    const motionVariants = {
      rest: {
        scale: 1,
        y: 0,
        boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
      },
      hover: {
        scale: 1.02,
        y: -2,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: {
          duration: TE_TIMING.quick,
          ease: TE_EASING.mechanical,
        },
      },
      tap: {
        scale: 0.98,
        y: 0,
        boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
        transition: {
          duration: TE_TIMING.instant,
          ease: TE_EASING.easeIn,
        },
      },
    };

    // Spring-back transition for release
    const springTransition = {
      type: 'tween',
      duration: TE_TIMING.quick,
      ease: TE_EASING.spring,
    } as const;

    if (href) {
      const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

      return (
        <motion.div
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          animate="rest"
          variants={motionVariants}
          transition={springTransition}
        >
          <Link href={href} {...linkProps} className={buttonClasses}>
            {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
            {children}
          </Link>
        </motion.div>
      );
    }

    const { onAnimationStart, onAnimationEnd, onAnimationIteration, onDrag, onDragEnd, onDragStart, ...buttonProps } = props;

    return (
      <motion.button
        className={buttonClasses}
        ref={ref}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        animate="rest"
        variants={motionVariants}
        transition={springTransition}
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
