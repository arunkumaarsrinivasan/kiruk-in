'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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

  const baseNavItemClass = 'px-3 py-1.5 sm:px-4 sm:py-2 handwritten text-white hover:text-gray-300 transition-colors duration-200 text-center min-w-[48px] sm:min-w-[60px] flex flex-col items-center justify-center';
  const baseTextClass = 'text-[7px] sm:text-xs mt-0.5 nav-menu-item select-none transition-all duration-200 leading-none whitespace-nowrap';

  const getNavItemClass = (idx: number) => {
    const isActive = mounted && pathname === navItems[idx].href;
    return isActive ? `${baseNavItemClass} font-bold` : baseNavItemClass;
  };

  const getTextClass = (idx: number) => {
    const isActive = mounted && pathname === navItems[idx].href;
    const isHovered = activeIndex === idx;

    if (isActive) {
      return `${baseTextClass} font-bold text-black`;
    }

    if (isHovered) {
      return `${baseTextClass} text-black`;
    }

    return `${baseTextClass} line-through text-gray-500`;
  };

  const handleNavMouseEnter = (idx: number) => setActiveIndex(idx);
  const handleNavMouseLeave = () => setActiveIndex(null);
  const handleNavClick = () => {
    // Navigation handled by anchor element
  };

  const handleNavKeyDown = (e: React.KeyboardEvent, idx: number, href: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleNavClick();
      window.location.href = href;
    }
  };

  return (
    <nav
      id="navigation"
      className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-none sm:max-w-2xl px-2 sm:px-4 pb-2.5 sm:pb-4"
      aria-label="Main navigation"
      role="navigation"
    >
      <div
        className="relative mx-auto flex items-center justify-center bg-white/90 border border-black rounded-2xl shadow-none py-2.5 sm:py-3 px-2.5 sm:px-4 backdrop-blur-md sketch-border transition-all duration-200 hover:shadow-lg hover:sketch-border-thick max-w-3xl w-full"
        style={{ boxShadow: 'none', borderColor: '#000', borderWidth: 2 }}
      >
        <div className="grid grid-cols-7 items-center justify-between w-full gap-1.5 sm:flex sm:space-x-4 sm:gap-4">
          {navItems.map((item, idx) => (
            <a
              key={item.href}
              href={item.href}
              tabIndex={0}
              aria-label={item.label}
              className={`${getNavItemClass(idx)} w-full sm:flex-1`}
              onMouseEnter={() => handleNavMouseEnter(idx)}
              onMouseLeave={handleNavMouseLeave}
              onFocus={() => handleNavMouseEnter(idx)}
              onBlur={handleNavMouseLeave}
              onClick={handleNavClick}
              onKeyDown={e => handleNavKeyDown(e, idx, item.href)}
            >
              <item.IconComponent
                selected={mounted && pathname === item.href}
                className="w-4 h-4 sm:w-5 sm:h-5 text-black"
              />
              <span className={getTextClass(idx)} style={{ letterSpacing: 0 }}>
                {item.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
