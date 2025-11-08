'use client';

import React from 'react';
import ThemedHeroSection from '@/components/themed/ThemedHeroSection';
import ThemeSettings from '@/components/ui/ThemeSettings';

export default function ThemeDemo() {
  return (
    <div className="relative">
      <ThemeSettings />
      <ThemedHeroSection />
    </div>
  );
}
