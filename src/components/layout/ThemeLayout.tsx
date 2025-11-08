'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThreeDoorsSelector } from '@/components/ui/ThreeDoorsSelector';

interface ThemeLayoutProps {
  children: React.ReactNode;
}

const ThemeLayout: React.FC<ThemeLayoutProps> = ({ children }) => {
  const { currentTheme, showThemeSelector } = useTheme();

  return (
    <>
      {/* Theme CSS Variables */}
      <style jsx global>{`
        :root {
          --theme-primary: ${currentTheme.colors.primary};
          --theme-secondary: ${currentTheme.colors.secondary};
          --theme-accent: ${currentTheme.colors.accent};
          --theme-background: ${currentTheme.colors.background};
          --theme-text: ${currentTheme.colors.text};
          
          --theme-font-primary: ${currentTheme.fonts.primary};
          --theme-font-secondary: ${currentTheme.fonts.secondary};
          --theme-font-accent: ${currentTheme.fonts.accent};
        }
        
        /* Theme-specific global styles - All using handwritten fonts */
.theme-sketch {
          --handwritten-font: 'Left Hand', cursive;
          --architect-font: 'Bridges Not Walls', cursive;
          --creative-font: 'Magnetic Drawing', cursive;
        }
        
        .theme-minimal {
          --clean-font: 'Left Hand', cursive;
          --mono-font: 'Magnetic Drawing', cursive;
          --serif-font: 'Bridges Not Walls', cursive;
        }
        
        .theme-absurd {
          --bold-font: 'Magnetic Drawing', cursive;
          --tech-font: 'Left Hand', cursive;
          --display-font: 'Bridges Not Walls', cursive;
        }
        
        /* Theme-specific component overrides */
        .theme-sketch .btn-primary {
          background: var(--theme-accent);
          border: 3px dashed var(--theme-primary);
          font-family: var(--handwritten-font);
          transform: rotate(-1deg);
          transition: all 0.3s ease;
        }
        
        .theme-sketch .btn-primary:hover {
          transform: rotate(0deg) scale(1.05);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .theme-minimal .btn-primary {
          background: var(--theme-primary);
          color: white;
          border: none;
          font-family: var(--clean-font);
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .theme-minimal .btn-primary:hover {
          background: var(--theme-accent);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
        }
        
        .theme-absurd .btn-primary {
          background: linear-gradient(45deg, var(--theme-primary), var(--theme-secondary));
          color: white;
          border: 2px solid var(--theme-accent);
          font-family: var(--bold-font);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
        }
        
        .theme-absurd .btn-primary:hover {
          transform: scale(1.1) rotate(2deg);
          box-shadow: 0 0 30px var(--theme-accent);
        }
        
        /* Typography overrides by theme */
        .theme-sketch h1, .theme-sketch h2, .theme-sketch h3 {
          font-family: var(--architect-font);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .theme-minimal h1, .theme-minimal h2, .theme-minimal h3 {
          font-family: var(--serif-font);
          font-weight: 600;
          letter-spacing: -0.5px;
        }
        
        .theme-absurd h1, .theme-absurd h2, .theme-absurd h3 {
          font-family: var(--display-font);
          text-transform: uppercase;
          letter-spacing: 2px;
          background: linear-gradient(45deg, var(--theme-primary), var(--theme-accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        /* Layout spacing by theme */
        .theme-sketch .container {
          padding: 2rem;
        }
        
        .theme-minimal .container {
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .theme-absurd .container {
          padding: 1rem;
        }
        
        /* Card styles by theme */
        .theme-sketch .card {
          background: white;
          border: 3px dashed var(--theme-primary);
          border-radius: 15px;
          padding: 1.5rem;
          transform: rotate(-0.5deg);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .theme-minimal .card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        
        .theme-absurd .card {
          background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
          border: 2px solid var(--theme-accent);
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 0 30px var(--theme-accent)40;
          color: white;
        }
      `}</style>
      
      {/* Theme Selector Modal */}
      {showThemeSelector && <ThreeDoorsSelector />}
      
      {/* Main Content */}
      {children}
    </>
  );
};

export default ThemeLayout;
