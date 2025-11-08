'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeSettings: React.FC = () => {
  const { currentTheme, availableThemes, setTheme, setShowThemeSelector } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Theme Settings Button */}
      <motion.button
        className="fixed top-4 right-4 z-40 p-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Theme Settings"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a3 3 0 016 0v6a4 4 0 11-2 3.464M15 13a3 3 0 00-6 0m6 0a3 3 0 11-6 0m6 0V9a2 2 0 11-4 0v4" />
        </svg>
      </motion.button>

      {/* Theme Settings Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Theme Settings</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Current Theme: <span className="font-bold">{currentTheme.name}</span>
                  </label>
                  <div className="grid gap-3">
                    {availableThemes.map((theme) => (
                      <motion.button
                        key={theme.id}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          currentTheme.id === theme.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          setTheme(theme.id);
                          setIsOpen(false);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded border-2"
                            style={{ 
                              background: `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                              borderColor: theme.colors.secondary 
                            }}
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{theme.name}</div>
                            <div className="text-sm text-gray-600">{theme.description}</div>
                          </div>
                          {currentTheme.id === theme.id && (
                            <div className="text-blue-500">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowThemeSelector(true);
                      setIsOpen(false);
                    }}
                    className="w-full p-3 text-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Open Three Doors Experience
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ThemeSettings;
