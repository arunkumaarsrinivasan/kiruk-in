'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SketchHeading } from './sketch-elements';

// Teenage Engineering inspired timing and easing values
const TE_TIMING = {
  instant: 0.08,   // 80ms
  quick: 0.15,     // 150ms
  standard: 0.25,  // 250ms
  smooth: 0.4,     // 400ms
};

const TE_EASING = {
  mechanical: [0.4, 0.0, 0.2, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
  organic: [0.65, 0.0, 0.35, 1] as const,
};

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
    { text: "Initializing workspace", icon: "⚙️", delay: 0 },
    { text: "Loading components", icon: "📦", delay: 500 },
    { text: "Preparing interactions", icon: "🎯", delay: 1000 },
    { text: "Configuring systems", icon: "🔧", delay: 1500 },
    { text: "Ready", icon: "✓", delay: 2000 }
  ];

  useEffect(() => {
    // Progress animation - linear, technical feel
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
      }, 400);
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
        className="fixed inset-0 bg-[var(--bg-main)] z-50 flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ 
          duration: TE_TIMING.smooth, 
          ease: TE_EASING.mechanical 
        }}
        style={{ pointerEvents: 'none' }}
      >
        <motion.div
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1.05, opacity: 0 }}
          transition={{ 
            duration: TE_TIMING.smooth, 
            ease: TE_EASING.mechanical 
          }}
          className="text-4xl font-mono text-[var(--text-main)]"
        >
          ✓
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[var(--bg-main)] z-50 overflow-hidden">
      {/* Background with subtle grid */}
      <div className="absolute inset-0 notebook-bg">
        {/* Geometric corner markers */}
        <div className="absolute top-8 left-8 w-4 h-4 border-l-2 border-t-2 border-[var(--border-color)]" />
        <div className="absolute top-8 right-8 w-4 h-4 border-r-2 border-t-2 border-[var(--border-color)]" />
        <div className="absolute bottom-8 left-8 w-4 h-4 border-l-2 border-b-2 border-[var(--border-color)]" />
        <div className="absolute bottom-8 right-8 w-4 h-4 border-r-2 border-b-2 border-[var(--border-color)]" />
      </div>

      {/* Main loading content */}
      <div className="relative h-full flex flex-col items-center justify-center p-8">
        {/* Logo/Brand area */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: TE_TIMING.smooth, 
            ease: TE_EASING.organic 
          }}
        >
          <div className="text-center">
            <SketchHeading 
              level={1} 
              className="text-4xl md:text-6xl text-[var(--text-main)] mb-4"
              underline={false}
            >
              KIRUK
            </SketchHeading>
            <motion.p 
              className="handwritten text-lg text-[var(--text-muted)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                delay: 0.3,
                duration: TE_TIMING.standard,
                ease: TE_EASING.mechanical
              }}
            >
              Portfolio Loading
            </motion.p>
          </div>
        </motion.div>

        {/* Loading progress container */}
        <div className="w-full max-w-md mx-auto">
          {/* Progress bar container with geometric styling */}
          <motion.div
            className="relative bg-[var(--bg-card)] border border-[var(--border-color)] p-4 shadow-none mb-8"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: 0.2, 
              duration: TE_TIMING.standard,
              ease: TE_EASING.mechanical
            }}
          >
            {/* Progress bar - linear, technical */}
            <div className="relative mb-6">
              <div className="h-2 bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden">
                <motion.div
                  className="te-progress-fill h-full bg-[var(--text-main)]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ 
                    duration: 0.1, 
                    ease: "linear" 
                  }}
                />
              </div>
              
              {/* Progress percentage - positioned right */}
              <div className="absolute -top-8 right-0">
                <span className="font-mono text-sm font-bold text-[var(--text-main)]">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>

            {/* Current loading step - mechanical crossfade */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                className="text-center"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ 
                  duration: TE_TIMING.standard,
                  ease: TE_EASING.mechanical
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl grayscale">
                    {loadingSteps[currentStep]?.icon}
                  </span>
                  <p className="font-mono text-sm uppercase tracking-widest text-[var(--text-main)]">
                    {loadingSteps[currentStep]?.text}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Loading indicator - technical pulse */}
          <motion.div
            className="flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="te-progress-pulse w-2 h-2 bg-[var(--text-muted)]"
                style={{
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Status text */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="font-mono text-xs text-[var(--text-muted)] text-center uppercase tracking-widest">
            Initializing interactive experience
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingPage;
