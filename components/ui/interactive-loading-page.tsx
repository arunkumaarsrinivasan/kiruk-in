'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SketchHeading } from './sketch-elements';

interface InteractiveLoadingPageProps {
  onComplete?: () => void;
  duration?: number;
  showProgress?: boolean;
}

const InteractiveLoadingPage: React.FC<InteractiveLoadingPageProps> = ({ 
  onComplete, 
  duration = 4000,
  showProgress = true 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showSketchElements, setShowSketchElements] = useState(false);

  const loadingSteps = [
    { text: "Setting up workspace", icon: "🎨", delay: 0, color: "blue" },
    { text: "Loading portfolio", icon: "💼", delay: 700, color: "purple" },
    { text: "Preparing tools", icon: "✏️", delay: 1400, color: "green" },
    { text: "Almost ready", icon: "⚡", delay: 2100, color: "yellow" },
    { text: "Welcome!", icon: "✨", delay: 2800, color: "orange" }
  ];

  // Progress animation
  useEffect(() => {
    const handleComplete = () => {
      if (onComplete) {
        onComplete();
      }
    };

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          setTimeout(handleComplete, 800);
          return 100;
        }
        return prev + (100 / (duration / 50));
      });
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  // Step progression
  useEffect(() => {
    loadingSteps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);
      }, step.delay);
    });
  }, []);

  // Show sketch elements after initial load
  useEffect(() => {
    setTimeout(() => setShowSketchElements(true), 500);
  }, []);

  // Exit animation
  if (isComplete) {
    return (
      <motion.div
        className="fixed inset-0 bg-white z-50 flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        style={{ pointerEvents: 'none' }}
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="text-8xl"
        >
          ✨
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden">
      {/* Background with notebook style */}
      <div className="absolute inset-0 bg-white notebook-bg">
        
        {/* Animated sketch decorations */}
        <AnimatePresence>
          {showSketchElements && (
            <>
              {/* Minimal floating colored dots */}
              <motion.div
                className="absolute top-20 left-20"
                animate={{ 
                  y: [0, -10, 10, 0],
                  opacity: 1,
                  scale: 1
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                initial={{ opacity: 0, scale: 0 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <div className="w-3 h-3 bg-blue-400 rounded-full opacity-60"></div>
              </motion.div>
              
              <motion.div
                className="absolute bottom-1/4 right-1/4"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: 1
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 2 
                }}
                initial={{ opacity: 0, scale: 0 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <div className="w-4 h-4 bg-purple-400 rounded-full opacity-60"></div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Main loading content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        
        {/* Header with portfolio title */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="text-center">
            <SketchHeading 
              level={1} 
              className="text-4xl md:text-6xl text-gray-800 mb-4 transform -rotate-1"
              underline={false}
            >
              Interactive Portfolio
            </SketchHeading>
            <motion.p 
              className="handwritten text-lg text-gray-600 transform rotate-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Welcome to Arun's Workspace
            </motion.p>
          </div>
        </motion.div>

        {/* Loading progress container with sketch styling */}
        <div className="w-full max-w-lg mx-auto">
          <motion.div
            className="relative bg-white/95 backdrop-blur-sm border-4 border-dashed border-gray-800 rounded-2xl p-6 shadow-xl mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {/* Sketch decorations around progress container */}
            <div className="absolute -top-2 -left-2 w-3 h-3 bg-blue-300 rounded-full opacity-60"></div>
            <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-purple-300 rounded-full opacity-60"></div>
            
            {/* Progress header */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 handwritten transform rotate-1">
                🎨 Loading Creative Tools
              </h3>
              <div className="w-20 h-1 bg-gray-300 rounded-full mx-auto mt-2 transform -rotate-1"></div>
            </div>
            
            {/* Progress bar */}
            {showProgress && (
              <div className="relative mb-6">
                <div className="h-6 bg-gray-200 rounded-full border-3 border-dashed border-gray-400 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 via-purple-400 via-green-400 to-yellow-400 rounded-full relative"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {/* Progress bar highlight */}
                    <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
                    {/* Moving sparkle effect */}
                    <motion.div
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white text-sm"
                      animate={{ 
                        scale: [1, 1.3, 1] 
                      }}
                      transition={{ 
                        duration: 1, 
                        repeat: Infinity 
                      }}
                    >
                      ✨
                    </motion.div>
                  </motion.div>
                </div>
                
                {/* Progress percentage */}
                <motion.div
                  className="absolute -top-10 left-1/2 transform -translate-x-1/2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="handwritten text-lg font-bold text-gray-700 bg-white px-3 py-2 rounded-full border-2 border-dashed border-gray-400 shadow-lg">
                    {Math.round(progress)}%
                  </span>
                </motion.div>
              </div>
            )}

            {/* Current loading step */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="text-3xl mb-3"
                  animate={{ 
                    scale: [1, 1.1, 1] 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  {loadingSteps[currentStep]?.icon}
                </motion.div>
                <p className="handwritten text-lg font-bold text-gray-700">
                  {loadingSteps[currentStep]?.text}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Loading dots animation */}
          <motion.div
            className="flex justify-center space-x-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-4 h-4 bg-gray-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                  backgroundColor: [
                    '#9CA3AF', 
                    ['#3B82F6', '#EF4444', '#10B981'][i], 
                    '#9CA3AF'
                  ]
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Simple quote at bottom */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <p className="handwritten text-sm text-gray-500 text-center max-w-md transform rotate-1">
            "Loading your creative experience" ✨
          </p>
        </motion.div>
      </div>

      {/* CSS for notebook background and animations */}
      <style jsx>{`
        .notebook-bg {
          background-image: 
            linear-gradient(90deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%),
            radial-gradient(circle at 25% 35%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 75% 65%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 90% 20%, rgba(34, 197, 94, 0.06) 0%, transparent 50%);
          background-size: 100% 100%, 400px 400px, 300px 300px, 500px 500px;
          background-repeat: no-repeat;
        }
      `}</style>
    </div>
  );
};

export default InteractiveLoadingPage;
