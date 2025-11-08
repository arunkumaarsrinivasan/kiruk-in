'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeConfig } from '@/data/portfolio-data';

interface DoorProps {
  theme: ThemeConfig;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
}

const Door: React.FC<DoorProps> = ({ theme, index, isSelected, onSelect, isHovered, onHover }) => {
  const getDoorStyle = () => {
    switch (theme.style) {
      case 'sketch':
        return {
          background: 'linear-gradient(145deg, #f9f9f9, #e8e8e8)',
          border: '3px dashed #333',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
        };
      case 'minimal':
        return {
          background: 'linear-gradient(145deg, #ffffff, #f1f5f9)',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
        };
      case 'absurd':
        return {
          background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          border: `2px solid ${theme.colors.accent}`,
          borderRadius: '20px',
          boxShadow: `0 15px 40px ${theme.colors.primary}40`,
        };
      default:
        return {};
    }
  };

  const getHandleStyle = () => {
    switch (theme.style) {
      case 'sketch':
        return {
          width: '20px',
          height: '20px',
          background: '#333',
          borderRadius: '50%',
          border: '2px dashed #666',
        };
      case 'minimal':
        return {
          width: '12px',
          height: '40px',
          background: '#64748b',
          borderRadius: '6px',
        };
      case 'absurd':
        return {
          width: '15px',
          height: '15px',
          background: theme.colors.accent,
          borderRadius: '50%',
          boxShadow: `0 0 20px ${theme.colors.accent}`,
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      className="relative cursor-pointer"
      style={{ perspective: '1000px' }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onSelect}
    >
      <motion.div
        className="relative w-64 h-80 mx-8"
        animate={isSelected ? {
          rotateY: -90,
          scale: 1.2,
          z: 100,
          transition: { duration: 0.8 }
        } : isHovered ? {
          rotateY: -15,
          scale: 1.05,
          z: 50,
          transition: { duration: 0.3 }
        } : {
          rotateY: 0,
          scale: 1,
          z: 0
        }}
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: 'left center',
          ...getDoorStyle(),
        }}
      >
        {/* Door Handle */}
        <div
          className="absolute top-1/2 right-4 transform -translate-y-1/2"
          style={getHandleStyle()}
        />
        
        {/* Door Number/Label */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className={`text-2xl font-bold ${theme.style === 'absurd' ? 'text-white' : 'text-gray-800'}`}>
            {index + 1}
          </div>
          <div className={`text-sm mt-2 ${theme.style === 'absurd' ? 'text-white' : 'text-gray-600'}`} style={{ fontFamily: theme.fonts.primary }}>
            {theme.name}
          </div>
        </div>

        {/* Theme Preview */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-40 h-24 bg-gray-200 rounded overflow-hidden">
          <div 
            className="w-full h-full flex items-center justify-center text-xs"
            style={{ 
              background: theme.colors.background,
              color: theme.colors.text,
              fontFamily: theme.fonts.primary 
            }}
          >
            {theme.description}
          </div>
        </div>

        {/* Door Decoration based on theme */}
        {theme.style === 'sketch' && (
          <div className="absolute inset-4 border-2 border-dashed border-gray-400 rounded-lg opacity-30" />
        )}
        
        {theme.style === 'minimal' && (
          <div className="absolute top-4 left-4 w-2 h-2 bg-blue-500 rounded-full" />
        )}
        
        {theme.style === 'absurd' && (
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent" />
        )}
      </motion.div>
      
      {/* Behind door content (revealed when door opens) */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 w-64 h-80 mx-8 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          style={{
            background: theme.colors.background,
            color: theme.colors.text,
            borderRadius: theme.style === 'sketch' ? '15px' : theme.style === 'minimal' ? '8px' : '20px',
          }}
        >
          <div className="text-center p-6">
            <div className="text-3xl mb-4">🎉</div>
            <div className="text-lg font-bold mb-2" style={{ fontFamily: theme.fonts.primary }}>
              Welcome to
            </div>
            <div className="text-xl" style={{ fontFamily: theme.fonts.accent, color: theme.colors.accent }}>
              {theme.name}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export const ThreeDoorsSelector: React.FC = () => {
  const { availableThemes, setTheme, showThemeSelector, setShowThemeSelector } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleThemeSelect = (themeId: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedTheme(themeId);
    
    // Wait for door animation to complete before switching theme
    setTimeout(() => {
      setTheme(themeId);
      setShowThemeSelector(false);
      setIsAnimating(false);
    }, 1200);
  };

  if (!showThemeSelector) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(10px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              radial-gradient(circle at 25px 25px, white 2%, transparent 2%),
              radial-gradient(circle at 75px 75px, white 2%, transparent 2%)
            `,
            backgroundSize: '100px 100px'
          }} />
        </div>

        <div className="relative z-10 text-center">
          {/* Title */}
          <motion.div
            className="mb-16"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Choose Your Experience
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Step through one of three doors to explore different design universes. 
              Each theme offers a unique perspective on the same portfolio content.
            </p>
          </motion.div>

          {/* Three Doors */}
          <motion.div
            className="flex justify-center items-center space-x-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {availableThemes.map((theme, index) => (
              <Door
                key={theme.id}
                theme={theme}
                index={index}
                isSelected={selectedTheme === theme.id}
                onSelect={() => handleThemeSelect(theme.id)}
                isHovered={hoveredIndex === index}
                onHover={(hovered) => setHoveredIndex(hovered ? index : null)}
              />
            ))}
          </motion.div>

          {/* Instructions */}
          <motion.div
            className="mt-12 text-white/70"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-lg">
              Hover to peek inside • Click to enter
            </p>
            <p className="text-sm mt-2 opacity-60">
              You can always change themes later from the settings
            </p>
          </motion.div>

          {/* Skip Option */}
          <motion.button
            className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors duration-200"
            onClick={() => setTheme('sketch')} // Default to sketch theme
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Skip & use default →
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
