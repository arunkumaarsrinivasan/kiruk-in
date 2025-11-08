'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { usePersonalInfo, useSkills } from '@/hooks/usePortfolioData';

const ThemedHeroSection: React.FC = () => {
  const { currentTheme } = useTheme();
  const personalInfo = usePersonalInfo();
  const skills = useSkills();

  const getThemeSpecificStyles = () => {
    switch (currentTheme.style) {
      case 'sketch':
        return {
          container: 'bg-white min-h-screen flex items-center justify-center p-8',
          nameStyle: 'text-6xl font-bold transform -rotate-2 mb-4',
          titleStyle: 'text-2xl handwritten transform rotate-1 mb-6',
          bioStyle: 'text-lg handwritten max-w-2xl mx-auto leading-relaxed',
          skillsContainer: 'flex flex-wrap gap-4 mt-8 justify-center',
          skillBadge: 'px-4 py-2 bg-yellow-200 border-2 border-dashed border-black rounded-lg handwritten transform',
        };
      case 'minimal':
        return {
          container: 'bg-gray-50 min-h-screen flex items-center justify-center p-8',
          nameStyle: 'text-5xl font-light tracking-tight mb-4',
          titleStyle: 'text-xl text-gray-600 mb-6 font-light',
          bioStyle: 'text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed font-light',
          skillsContainer: 'flex flex-wrap gap-3 mt-8 justify-center',
          skillBadge: 'px-3 py-1 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700',
        };
      case 'absurd':
        return {
          container: 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex items-center justify-center p-8',
          nameStyle: 'text-7xl font-black transform rotate-2 mb-4 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent',
          titleStyle: 'text-2xl font-bold text-green-400 transform -rotate-1 mb-6 uppercase tracking-wider',
          bioStyle: 'text-lg text-white max-w-2xl mx-auto leading-relaxed font-bold',
          skillsContainer: 'flex flex-wrap gap-4 mt-8 justify-center',
          skillBadge: 'px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full text-white font-bold text-sm transform hover:scale-110 transition-transform',
        };
      default:
        return {};
    }
  };

  const styles = getThemeSpecificStyles();

  const getSkillRotation = (index: number) => {
    if (currentTheme.style === 'sketch') {
      return `rotate(${(index % 2 === 0 ? 1 : -1) * (Math.random() * 4 + 1)}deg)`;
    }
    return '';
  };

  return (
    <div className={styles.container}>
      <div className="text-center">
        <motion.h1 
          className={styles.nameStyle}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ color: currentTheme.colors.primary }}
        >
          {personalInfo.name}
        </motion.h1>
        
        <motion.p 
          className={styles.titleStyle}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ color: currentTheme.colors.secondary }}
        >
          {personalInfo.title}
        </motion.p>
        
        <motion.p 
          className={styles.bioStyle}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ color: currentTheme.colors.text }}
        >
          {personalInfo.bio}
        </motion.p>
        
        <motion.div 
          className={styles.skillsContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {skills.slice(0, 5).map((skill, index) => (
            <motion.span 
              key={skill.id}
              className={styles.skillBadge}
              style={{ transform: getSkillRotation(index) }}
              whileHover={{ scale: 1.1 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
            >
              {skill.icon} {skill.name}
            </motion.span>
          ))}
        </motion.div>
        
        {/* Theme-specific decorative elements */}
        {currentTheme.style === 'sketch' && (
          <motion.div 
            className="absolute top-20 right-20 text-6xl opacity-20"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            ✏️
          </motion.div>
        )}
        
        {currentTheme.style === 'minimal' && (
          <div className="absolute top-10 left-10 w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
        
        {currentTheme.style === 'absurd' && (
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.1, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-pink-500 rounded-full opacity-30 blur-xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-violet-500 rounded-full opacity-30 blur-xl"></div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ThemedHeroSection;
