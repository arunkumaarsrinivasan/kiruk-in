'use client';

import React, { useState, useEffect } from 'react';
import { SectionCharacter } from '@/components/characters';

/**
 * FixedCharacterHelper
 * Monitors scroll position to determine active section and renders
 * the corresponding 8-bit character fixed at bottom-right.
 */
export function FixedCharacterHelper() {
  const [activeSection, setActiveSection] = useState('header');

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Use a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          // Find the entry with the highest intersection ratio
          // This helps when multiple sections are visible
          const maxIntersection = entries.reduce((prev, current) => {
            return (prev.intersectionRatio > current.intersectionRatio) ? prev : current;
          });

          if (maxIntersection.isIntersecting && maxIntersection.intersectionRatio > 0.1) {
            setActiveSection(maxIntersection.target.id);
          }
        },
        {
          threshold: [0.1, 0.3, 0.5, 0.7],
          rootMargin: '-10% 0px -10% 0px'
        }
      );

      const sections = [
        'header',
        'subject-profile',
        'work-experience',
        'case-studies',
        'contact'
      ];

      sections.forEach(id => {
          const el = document.getElementById(id);
          if (el) observer.observe(el);
      });

      // Cleanup
      return () => observer.disconnect();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Hide character on header section since it has its own character
  const isVisible = activeSection !== 'header';

  return (
    <SectionCharacter 
        sectionId={activeSection} 
        isVisible={isVisible} 
        position="bottom-right"
        animationDelay={0.2}
    />
  );
}
