'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SketchHeading } from './sketch-elements';

interface LoadingPageProps {
  onComplete?: () => void;
  duration?: number;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ 
  onComplete, 
  duration = 3000 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const loadingSteps = [
    { text: "Sketching the canvas", icon: "🎨", delay: 0 },
    { text: "Loading creative tools", icon: "✏️", delay: 500 },
    { text: "Preparing interactions", icon: "🎯", delay: 1000 },
    { text: "Setting up workspace", icon: "💼", delay: 1500 },
    { text: "Almost ready!", icon: "🚀", delay: 2000 }
  ];

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    // Step animation
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, duration / loadingSteps.length);

    // Complete animation
    const completeTimer = setTimeout(() => {
      setIsComplete(true);
      setTimeout(() => {
        onComplete?.();
      }, 800);
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete, loadingSteps.length]);

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
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl"
        >
          ✨
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden">
      {/* Background sketch elements */}
      <div className="absolute inset-0 bg-white notebook-bg">
        {/* Floating sketch decorations */}
        <motion.div
          className="absolute top-20 left-20"
          animate={{ 
            rotate: [0, 5, -5, 0],
            y: [0, -10, 10, 0] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <div className="w-4 h-4 bg-blue-300 rounded-full opacity-60"></div>
        </motion.div>
        
        <motion.div
          className="absolute top-1/3 right-16"
          animate={{ 
            rotate: [0, -3, 3, 0],
            x: [0, 5, -5, 0] 
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1 
          }}
        >
          <div className="w-3 h-3 bg-yellow-300 rounded-full opacity-60"></div>
        </motion.div>

        <motion.div
          className="absolute bottom-1/4 left-1/4"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2 
          }}
        >
          <div className="w-2 h-2 bg-green-300 rounded-full opacity-60"></div>
        </motion.div>

        <motion.div
          className="absolute top-3/4 right-1/3"
          animate={{ 
            y: [0, -15, 15, 0],
            rotate: [0, 8, -8, 0] 
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 0.5 
          }}
        >
          <div className="w-3 h-3 bg-pink-300 rounded-full opacity-60"></div>
        </motion.div>
      </div>

      {/* Main loading content */}
      <div className="relative h-full flex flex-col items-center justify-center p-8">
        {/* Logo/Brand area */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="text-center"
            animate={{ 
              rotate: [0, 1, -1, 0] 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <SketchHeading 
              level={1} 
              className="text-4xl md:text-6xl text-gray-800 mb-4 transform -rotate-1"
              underline={false}
            >
              Arun's Portfolio
            </SketchHeading>
            <motion.p 
              className="handwritten text-lg text-gray-600 transform rotate-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              SDE 1 @ HP Inc | Designer & Developer
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Loading progress container */}
        <div className="w-full max-w-md mx-auto">
          {/* Progress bar container with sketch styling */}
          <motion.div
            className="relative bg-white border-4 border-dashed border-gray-400 rounded-2xl p-6 shadow-xl mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Sketch decorations */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-orange-300 rounded-full opacity-70"></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-purple-300 rounded-full opacity-70"></div>
            
            {/* Progress bar */}
            <div className="relative mb-6">
              <div className="h-4 bg-gray-200 rounded-full border-2 border-dashed border-gray-300 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 rounded-full relative"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Progress bar highlight */}
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
                </motion.div>
              </div>
              
              {/* Progress percentage */}
              <motion.div
                className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="handwritten text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded-full border border-dashed border-gray-300">
                  {Math.round(progress)}%
                </span>
              </motion.div>
            </div>

            {/* Current loading step */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="text-3xl mb-2"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1] 
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
            className="flex justify-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-gray-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Fun fact or quote */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.p
            className="handwritten text-sm text-gray-500 text-center max-w-md transform rotate-1"
            animate={{ 
              y: [0, -5, 5, 0] 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            "Perfect blend of technical expertise and design thinking" ✨
          </motion.p>
        </motion.div>
      </div>

      {/* CSS for notebook background */}
      <style jsx>{`
        .notebook-bg {
          background-image: 
            linear-gradient(90deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%),
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%);
        }
      `}</style>
    </div>
  );
};

export default LoadingPage;
