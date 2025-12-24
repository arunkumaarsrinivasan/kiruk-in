'use client';

import React from 'react';

interface ThemeLayoutProps {
  children: React.ReactNode;
}

const ThemeLayout: React.FC<ThemeLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full transition-colors duration-300 relative">
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'var(--surface-pattern)',
          backgroundSize: 'var(--surface-pattern-size)',
          backgroundPosition: 'var(--surface-pattern-position)',
          backgroundRepeat: 'var(--surface-pattern-repeat)',
          opacity: 'var(--surface-pattern-opacity)',
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ThemeLayout;
