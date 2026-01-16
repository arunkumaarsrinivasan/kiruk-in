'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface WireframeCodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  copyable?: boolean;
  className?: string;
}

/**
 * WireframeCodeBlock Component
 * 
 * Syntax-highlighted code display with line numbers.
 * Outline-style borders that highlight on hover.
 */
export function WireframeCodeBlock({
  code,
  language = 'typescript',
  showLineNumbers = true,
  copyable = false,
  className,
}: WireframeCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const lines = code.split('\n');

  const handleCopy = async () => {
    if (copyable) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        'relative border rounded-[var(--wireframe-border-radius,12px)]',
        'bg-transparent', // Transparent fill
        'transition-all duration-150',
        'hover:border-[var(--wireframe-outline-hover-width,2px)] hover:border-[var(--wireframe-border-hover,var(--accent-color))]',
        'hover:shadow-[0_0_8px_rgba(var(--accent-color-rgb,0,0,0),var(--wireframe-glow-opacity,0.3))]',
        'overflow-hidden',
        className
      )}
      style={{
        borderWidth: 'var(--wireframe-outline-width, 1px)',
        borderColor: 'var(--wireframe-border-color, var(--border-color))',
        borderStyle: 'solid',
      }}
    >
      {/* Header bar with language label and copy button */}
      <div
        className="flex items-center justify-between grid-p-2 border-b"
        style={{
          borderColor: 'var(--wireframe-border-color, var(--border-color))',
        }}
      >
        <span
          className="text-[10px] font-mono uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          {language}
        </span>
        {copyable && (
          <motion.button
            onClick={handleCopy}
            className="text-[10px] font-mono uppercase px-2 py-1 border rounded"
            style={{
              borderColor: 'var(--wireframe-border-color, var(--border-color))',
              color: 'var(--text-main)',
              backgroundColor: 'transparent',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </motion.button>
        )}
      </div>

      {/* Code content */}
      <div className="grid-p-4 overflow-x-auto">
        <pre
          className="font-mono text-sm leading-relaxed"
          style={{ color: 'var(--text-main)' }}
        >
          <code>
            {lines.map((line, index) => (
              <div key={index} className="flex gap-4">
                {showLineNumbers && (
                  <span
                    className="select-none text-right"
                    style={{
                      color: 'var(--text-muted)',
                      minWidth: '2ch',
                    }}
                  >
                    {index + 1}
                  </span>
                )}
                <span className="flex-1">{line || '\u00A0'}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
