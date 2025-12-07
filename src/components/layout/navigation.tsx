'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import type { CSSProperties } from 'react';
import {
  HomeIcon,
  AboutIcon,
  WorkIcon,
  StudiesIcon,
  ContactIcon,
  ProgressIcon,
  MapIcon,
} from '../ui/hand-drawn-icons';

const Navigation = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: '/', label: 'Home', IconComponent: HomeIcon },
    { href: '/about', label: 'About', IconComponent: AboutIcon },
    { href: '/work', label: 'Work', IconComponent: WorkIcon },
    { href: '/case-studies', label: 'Projects', IconComponent: StudiesIcon },
    { href: '/progress', label: 'Progress', IconComponent: ProgressIcon },
    { href: '/map', label: 'Map', IconComponent: MapIcon },
    { href: '/contact', label: 'Contact', IconComponent: ContactIcon },
  ];

  const NAV_GRID_UNIT = 20;
  const NAV_TILE_WIDTH = NAV_GRID_UNIT * 4; // 80px - aligns with centered grid (odd items)
  const NAV_TILE_HEIGHT = NAV_GRID_UNIT * 3; // 60px - minimal height
  
  // Use CSS variable for pattern if possible, or match the global grid style
  // We'll use a simple transparent background for the tiles so they look like grid cells
  // but with a solid bg color to hide content behind
  
  const baseNavItemClass =
    'group relative flex flex-col items-center justify-center gap-1 border-r border-t border-b border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-main)] transition-all duration-200 first:border-l hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]';
  const baseTextClass = 'text-[9px] font-semibold uppercase tracking-wider leading-tight px-1';

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleAutoHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      setIsPanelOpen(false);
    }, 2400);
  }, [clearHideTimer]);

  const handlePanelReveal = useCallback(() => {
    clearHideTimer();
    setIsPanelOpen(true);
  }, [clearHideTimer]);

  const handlePanelDock = useCallback(() => {
    scheduleAutoHide();
  }, [scheduleAutoHide]);

  useEffect(() => {
    scheduleAutoHide();
    return () => clearHideTimer();
  }, [scheduleAutoHide, clearHideTimer]);

  const getNavItemClass = (idx: number) => {
    const isActive = mounted && pathname === navItems[idx].href;
    if (isActive) {
      return `${baseNavItemClass} bg-[var(--text-main)] text-[var(--bg-main)]`;
    }
    return baseNavItemClass;
  };

  const getTextClass = (idx: number) => {
    const isActive = mounted && pathname === navItems[idx].href;
    if (isActive) {
      return `${baseTextClass} text-[var(--bg-main)]`;
    }
    return `${baseTextClass} text-[var(--text-muted)] group-hover:text-[var(--bg-main)]`;
  };

  const getNavTileStyle = (idx: number): CSSProperties => ({
    width: `${NAV_TILE_WIDTH}px`,
    minWidth: `${NAV_TILE_WIDTH}px`,
    height: `${NAV_TILE_HEIGHT}px`,
    // We remove the internal grid pattern to make it cleaner/minimal as requested
    // backgroundImage: tilePattern, 
    // backgroundSize: `${NAV_GRID_UNIT}px ${NAV_GRID_UNIT}px`,
  });

  const handleNavMouseEnter = (idx: number) => {
    handlePanelReveal();
    setActiveIndex(idx);
  };
  const handleNavMouseLeave = () => {
    setActiveIndex(null);
  };
  const handleNavClick = () => {
    // Navigation handled by anchor element
  };

  const handleNavKeyDown = (e: React.KeyboardEvent, idx: number, href: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleNavClick();
      window.location.href = href;
    }
  };

  const handleTogglePanel = () => {
    const next = !isPanelOpen;
    setIsPanelOpen(next);
    if (next) {
      handlePanelReveal();
    } else {
      clearHideTimer();
    }
  };

  return (
    <nav
      id="navigation"
      className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 w-full flex flex-col items-center justify-end pb-0"
      aria-label="Main navigation"
      role="navigation"
    >
      <div
        className="relative flex flex-col items-center"
        onMouseEnter={handlePanelReveal}
        onMouseLeave={handlePanelDock}
        onFocusCapture={handlePanelReveal}
        onBlurCapture={handlePanelDock}
      >
        <button
          type="button"
          onClick={handleTogglePanel}
          onMouseEnter={handlePanelReveal}
          onFocus={handlePanelReveal}
          aria-expanded={isPanelOpen}
          className="flex items-center gap-2 border border-b-0 border-[var(--border-color)] bg-[var(--bg-main)] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors"
        >
          <span>Explore</span>
          <span className="font-mono">
            {isPanelOpen ? '−' : '+'}
          </span>
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isPanelOpen ? 'max-h-[100px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex items-center shadow-none">
            {navItems.map((item, idx) => {
              const isActive = mounted && pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  tabIndex={0}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`${getNavItemClass(idx)}`}
                  style={getNavTileStyle(idx)}
                  onMouseEnter={() => handleNavMouseEnter(idx)}
                  onMouseLeave={handleNavMouseLeave}
                  onFocus={() => handleNavMouseEnter(idx)}
                  onBlur={handleNavMouseLeave}
                  onClick={handleNavClick}
                  onKeyDown={e => handleNavKeyDown(e, idx, item.href)}
                >
                  <item.IconComponent
                    selected={isActive}
                    className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-[var(--bg-main)]' : 'text-[var(--text-main)] group-hover:text-[var(--bg-main)]'}`}
                  />
                  <span className={getTextClass(idx)}>
                    {item.label}
                  </span>
                  <span className={`absolute top-1 right-1 text-[7px] font-mono tracking-wider ${isActive ? 'text-[var(--bg-main)]' : 'text-[var(--text-muted)] group-hover:text-[var(--bg-main)]'}`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
