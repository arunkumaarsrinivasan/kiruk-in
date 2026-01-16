'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { PixelIcon } from '@/components/ui/PixelIcon';

interface WireframeMetricProps {
  value: string | number;
  label: string;
  icon?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * WireframeMetric Component
 * 
 * Metric display (number + label) with clean typography.
 * Optional icon support.
 */
export function WireframeMetric({
  value,
  label,
  icon,
  className,
  size = 'md',
}: WireframeMetricProps) {
  const sizeClasses = {
    sm: {
      value: 'text-lg',
      label: 'text-[10px]',
    },
    md: {
      value: 'text-2xl',
      label: 'text-xs',
    },
    lg: {
      value: 'text-4xl',
      label: 'text-sm',
    },
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {icon && (
        <div className="grid-mb-1">
          <PixelIcon name={icon} size={20} />
        </div>
      )}
      <div
        className={cn(
          'font-mono font-black',
          sizeClasses[size].value
        )}
        style={{ color: 'var(--text-main)' }}
      >
        {value}
      </div>
      <div
        className={cn(
          'font-mono uppercase tracking-wider',
          sizeClasses[size].label
        )}
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </div>
    </div>
  );
}
