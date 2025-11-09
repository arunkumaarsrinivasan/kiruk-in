'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SketchHeading } from './sketch-elements';

interface InteractiveLoadingPageProps {
  onComplete?: () => void;
  duration?: number;
  showProgress?: boolean;
}

type LoadingStep = {
  text: string;
  icon: string;
  delay: number;
};

const loadingSteps: LoadingStep[] = [
  { text: 'Sketching workspace', icon: '🖍️', delay: 0 },
  { text: 'Linking projects', icon: '🔗', delay: 1200 },
  { text: 'Inking details', icon: '📝', delay: 2100 },
  { text: 'Adding highlights', icon: '✨', delay: 3200 }
];

const creativeTips = [
  'Hint: Watch the line sketch the shell of the site as it loads.',
  'Tip: The scribble theme carries through the portfolio—keep an eye out.',
  'Note: Everything here starts with one playful line and grows from there.'
];

const InteractiveLoadingPage: React.FC<InteractiveLoadingPageProps> = ({
  onComplete,
  duration = 4200,
  showProgress = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [activeTip, setActiveTip] = useState(0);
  const [showScribbles, setShowScribbles] = useState(false);

  const floatingMarks = useMemo(
    () =>
      Array.from({ length: 4 }).map((_, index) => ({
        id: `mark-${index}`,
        left: ['18%', '72%', '32%', '78%'][index],
        top: ['28%', '22%', '60%', '66%'][index],
        delay: index * 0.5
      })),
    []
  );

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
          setTimeout(handleComplete, 500);
          return 100;
        }
        return prev + 100 / (duration / 60);
      });
    }, 60);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  useEffect(() => {
    const handles = loadingSteps.map((step, index) =>
      setTimeout(() => setCurrentStep(index), step.delay)
    );

    return () => handles.forEach(handle => clearTimeout(handle));
  }, []);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setActiveTip(prev => (prev + 1) % creativeTips.length);
    }, 3200);

    return () => clearInterval(tipInterval);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setShowScribbles(true), 350);
    return () => clearTimeout(timeout);
  }, []);

  if (isComplete) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-white"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{ pointerEvents: 'none' }}
      >
        <motion.span
          className="text-7xl"
          initial={{ scale: 1 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          ✨
        </motion.span>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-white">
      <div className="absolute inset-0 notebook-bg">
        <AnimatePresence>
          {showScribbles && (
            <>
              {floatingMarks.map(mark => (
                <motion.div
                  key={mark.id}
                  className="absolute pointer-events-none"
                  style={{ left: mark.left, top: mark.top }}
                  initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
                  animate={{
                    opacity: [0.12, 0.4, 0.12],
                    scale: [0.92, 1.05, 0.92],
                    rotate: [-4, 2, -4]
                  }}
                  transition={{ duration: 6, repeat: Infinity, delay: mark.delay }}
                >
                  <svg width="54" height="54" viewBox="0 0 54 54" className="opacity-60">
                    <motion.path
                      d="M10 34 C 18 18, 32 16, 42 28"
                      stroke="#1D4ED8"
                      strokeWidth={2}
                      strokeDasharray="4 7"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: [0, 1, 0.6, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </svg>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-14">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <SketchHeading level={1} className="-rotate-1 text-4xl text-slate-800 md:text-5xl" underline={false}>
            Interactive Portfolio
          </SketchHeading>
          <motion.p
            className="handwritten mt-4 text-base text-slate-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            One continuous line is drawing the workspace as it loads.
          </motion.p>
        </motion.div>

        <motion.div
          className="relative mt-10 w-full max-w-lg rounded-[26px] border-2 border-dashed border-slate-500 bg-white/95 p-8 shadow-xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.55 }}
        >
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span className="handwritten -rotate-1">Sketching in progress…</span>
            {showProgress && (
              <motion.span
                className="handwritten rounded-full border border-dashed border-slate-400 bg-white px-3 py-1 text-slate-600"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
              >
                {Math.round(progress)}%
              </motion.span>
            )}
          </div>

          <motion.svg
            className="mt-8 w-full"
            viewBox="0 0 520 170"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.path
              d="M18 118 C 96 58, 186 66, 272 108 C 332 138, 390 136, 502 82"
              stroke="#334155"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 10"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
            <motion.circle
              r={9}
              fill="#2563EB"
              animate={{
                cx: showProgress ? Math.max(24, 18 + (progress / 100) * 484) : 502,
                cy: showProgress ? 118 - (progress / 100) * 32 : 86
              }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </motion.svg>

          <AnimatePresence mode="wait">
            <motion.div
              key={loadingSteps[currentStep]?.text}
              className="mt-6 flex items-center justify-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
            >
              <motion.span
                className="text-2xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
              >
                {loadingSteps[currentStep]?.icon}
              </motion.span>
              <p className="handwritten text-lg text-slate-600">
                {loadingSteps[currentStep]?.text}
              </p>
            </motion.div>
          </AnimatePresence>

          {showProgress && (
            <div className="mt-6 flex justify-center gap-2 text-xs text-slate-400">
              {loadingSteps.map((step, index) => (
                <span
                  key={step.text}
                  className={`handwritten ${index === currentStep ? 'text-slate-600' : 'text-slate-300'}`}
                >
                  {index < currentStep ? '—' : '·'}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        <div className="mt-10 w-full max-w-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={creativeTips[activeTip]}
              className="rounded-2xl border border-dashed border-slate-300 bg-white/90 px-5 py-4 text-center shadow-md"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              <p className="handwritten text-sm text-slate-600">
                {creativeTips[activeTip]}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.p
          className="mt-12 handwritten text-sm text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          “Loading your creative experience” ✨
        </motion.p>
      </div>

      <style jsx>{`
        .notebook-bg {
          background-image:
            linear-gradient(90deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%),
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.07) 0%, transparent 55%),
            radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.07) 0%, transparent 55%);
          background-size: 100% 100%, 360px 360px, 420px 420px;
          background-repeat: no-repeat;
        }
      `}</style>
    </div>
  );
};

export default InteractiveLoadingPage;
