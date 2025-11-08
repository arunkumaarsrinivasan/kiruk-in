'use client';

import { motion } from 'framer-motion';
import ScribbleAnimation from '../three/scribble-animation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const router = useRouter();

  const handleRedirectToAbout = () => {
    router.push('/about');
  };


  const nextOnboardingStep = () => {
    if (onboardingStep < 2) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setShowOnboarding(false);
    }
  };

  return (
    <section className="relative h-full w-full bg-white overflow-hidden">
      {/* Full Canvas Scribble Playground */}
      <div className="absolute inset-0">
        <ScribbleAnimation className="w-full h-full" />
      </div>
      
      {/* Minimal Identity Overlay */}
      <motion.div
        className="absolute top-8 left-8 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >        <div className="text-lg text-gray-700">
          <h1 className="magnetic-font text-4xl mb-2 font-bold kiruk-title sr-only">KIRUK - Arun kumaar Sreenivasan Portfolio</h1>
          <div className="magnetic-font text-4xl mb-2 font-bold kiruk-title" style={{ color: '#111' }} aria-hidden="true">KIRUK</div>
          <div className="handwritten text-lg font-bold">Arun kumaar Sreenivasan</div>
          <div className="handwritten text-xs text-gray-600 mt-1">Full-Stack Developer & Designer</div>
          <div className="handwritten text-xs text-gray-500">📍 Bangalore</div>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-20 right-20 hidden lg:block cursor-pointer"
        animate={{ 
          rotate: [0, 2, -2, 0],
          y: [0, -5, 5, 0] 
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        whileHover={{ scale: 1.1, rotate: 8 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRedirectToAbout}
      >        <div className="sketch-font text-xl text-sketch-orange transform rotate-12 hover:text-orange-600 transition-colors">
          SDE 1
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-20 left-20 hidden lg:block cursor-pointer"
        animate={{ 
          rotate: [0, -3, 3, 0],
          x: [0, 3, -3, 0] 
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 2 
        }}
        whileHover={{ scale: 1.1, rotate: -3 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRedirectToAbout}
      >        <div className="handwritten text-lg text-sketch-blue transform -rotate-6 hover:text-blue-600 transition-colors">
          AWS + Spring Boot
        </div>
      </motion.div>

      <motion.div
        className="absolute top-1/2 right-10 hidden lg:block cursor-pointer"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0] 
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1 
        }}
        whileHover={{ scale: 1.15, rotate: 85 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRedirectToAbout}
      >        <div className="handwritten text-base text-sketch-green transform rotate-90 hover:text-green-600 transition-colors">
          UX/UI + Dev 🎨
        </div>
      </motion.div>      {/* Subtle center hint */}
      <motion.div
        className="absolute bottom-8 right-8 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      >
      </motion.div>
      
      {/* Adventure spirit indicators - Now clickable */}
      <motion.div
        className="absolute top-1/3 left-10 hidden lg:block cursor-pointer"
        animate={{ 
          y: [0, -10, 10, 0],
          rotate: [0, 3, -3, 0] 
        }}
        transition={{ 
          duration: 7, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0.5 
        }}
        whileHover={{ scale: 1.1, rotate: -8 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRedirectToAbout}
      >        <div className="handwritten text-sm text-sketch-purple transform -rotate-12 hover:text-purple-600 transition-colors">
          🏔️ Trekking {'>'}{'>'} Party
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 right-1/3 hidden lg:block cursor-pointer"
        animate={{ 
          rotate: [0, -4, 4, 0],
          scale: [1, 1.05, 1] 
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 3 
        }}
        whileHover={{ scale: 1.15, rotate: 3 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRedirectToAbout}
      >        <div className="handwritten text-sm text-sketch-orange transform rotate-6 hover:text-orange-600 transition-colors">
          🏓 Table Tennis Pro
        </div>
      </motion.div>

      {/* Additional professional elements - Now clickable */}
      <motion.div
        className="absolute top-1/4 right-1/4 hidden lg:block cursor-pointer"
        animate={{ 
          rotate: [0, 2, -2, 0],
          y: [0, -8, 8, 0] 
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1.5 
        }}
        whileHover={{ scale: 1.1, rotate: 12 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRedirectToAbout}
      >
        <div className="handwritten text-xs text-sketch-blue transform rotate-15 hover:text-blue-600 transition-colors">
          ☁️ AWS Expert
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 left-1/4 hidden lg:block cursor-pointer"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, -3, 3, 0] 
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 2.5 
        }}
        whileHover={{ scale: 1.15, rotate: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRedirectToAbout}
      >
        <div className="handwritten text-xs text-sketch-green transform -rotate-8 hover:text-green-600 transition-colors">
          🎵 Music Lover
        </div>
      </motion.div>

      <motion.div
        className="absolute top-2/3 left-1/3 hidden lg:block cursor-pointer"
        animate={{ 
          x: [0, 5, -5, 0],
          rotate: [0, 4, -4, 0] 
        }}
        transition={{ 
          duration: 7, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0.8 
        }}
        whileHover={{ scale: 1.1, rotate: 8 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRedirectToAbout}
      >        <div className="handwritten text-xs text-sketch-purple transform rotate-12 hover:text-purple-600 transition-colors">
          🤝 Collaboration
        </div>
      </motion.div>

      {/* Floating Navigation Hints */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ duration: 0.8, delay: 2.5 }}
      >
        <div className="bg-black/80 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
          <span className="animate-pulse">⬇️</span> Use navigation below to explore my work
        </div>
      </motion.div>

      {/* Interactive Onboarding Tooltips - Sketch Style */}
      {showOnboarding && (
        <>
          {/* Step 1: Point to canvas */}
          {onboardingStep === 0 && (
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 2 }}
              exit={{ opacity: 0, scale: 0.8, rotate: -5 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-yellow-100/95 border-3 border-dashed border-blue-400 p-6 max-w-sm backdrop-blur-sm shadow-lg transform rotate-1 relative">
                {/* Sketch-style close button */}
                <button 
                  onClick={nextOnboardingStep}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors transform rotate-12 border-2 border-red-600"
                >
                  ×
                </button>
                
                
                <div className="handwritten text-center">
                  <div className="text-3xl mb-3">✏️</div>
                  <h3 className="text-lg magnetic-font text-gray-800 mb-2">Try Drawing!</h3>
                  <p className="text-sm text-gray-700 mb-4">Click and drag anywhere on the canvas to start doodling</p>
                  <button 
                    onClick={nextOnboardingStep}
                    className="bg-blue-300/80 hover:bg-blue-400/80 text-blue-800 px-4 py-2 rounded-lg font-bold handwritten border-2 border-dashed border-blue-500 transform hover:rotate-1 transition-all"
                  >
                    Got it! →
                  </button>
                </div>
                ;
              </div>
            </motion.div>
          )}

          {/* Step 2: Point to floating elements */}
          {onboardingStep === 1 && (
            <motion.div
              className="absolute top-1/4 right-8 z-30"
              initial={{ opacity: 0, x: 20, rotate: 5 }}
              animate={{ opacity: 1, x: 0, rotate: -2 }}
              exit={{ opacity: 0, x: 20, rotate: 5 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-green-100/95 border-3 border-dashed border-green-400 p-6 max-w-sm backdrop-blur-sm shadow-lg transform -rotate-1 relative">
                {/* Sketch-style close button */}
                <button 
                  onClick={nextOnboardingStep}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors transform -rotate-12 border-2 border-red-600"
                >
                  ×
                </button>
                
                {/* Hand-drawn arrow pointing left */}
                <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 text-2xl animate-pulse">
                  ←
                </div>
                
                <div className="handwritten text-center">
                  <div className="text-3xl mb-3">🎯</div>
                  <h3 className="text-lg magnetic-font text-gray-800 mb-2">Interactive Elements</h3>
                  <p className="text-sm text-gray-700 mb-4">Hover over the floating text and skills to see them animate</p>
                  <button 
                    onClick={nextOnboardingStep}
                    className="bg-green-300/80 hover:bg-green-400/80 text-green-800 px-4 py-2 rounded-lg font-bold handwritten border-2 border-dashed border-green-500 transform hover:-rotate-1 transition-all"
                  >
                    Awesome! →
                  </button>
                </div>
                
                {/* Sketch decorations */}
                <div className="absolute -bottom-3 -right-2 text-green-400 transform -rotate-45">✨</div>
                <div className="absolute -top-1 -left-3 text-purple-500 transform rotate-12">♦</div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Point to navigation */}
          {onboardingStep === 2 && (
            <motion.div
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30"
              initial={{ opacity: 0, y: 20, rotate: -3 }}
              animate={{ opacity: 1, y: 0, rotate: 1 }}
              exit={{ opacity: 0, y: 20, rotate: -3 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-orange-100/95 border-3 border-dashed border-orange-400 p-6 max-w-sm backdrop-blur-sm shadow-lg transform rotate-1 relative">
                {/* Sketch-style close button */}
                <button 
                  onClick={nextOnboardingStep}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors transform rotate-45 border-2 border-red-600"
                >
                  ×
                </button>
                
                {/* Hand-drawn arrow pointing down */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce">
                  ↓
                </div>
                
                <div className="handwritten text-center">
                  <div className="text-3xl mb-3">🧭</div>
                  <h3 className="text-lg magnetic-font text-gray-800 mb-2">Explore My Work</h3>
                  <p className="text-sm text-gray-700 mb-4">Use the navigation menu to see my projects, case studies, and more!</p>
                  <button 
                    onClick={nextOnboardingStep}
                    className="bg-orange-300/80 hover:bg-orange-400/80 text-orange-800 px-4 py-2 rounded-lg font-bold handwritten border-2 border-dashed border-orange-500 transform hover:rotate-2 transition-all"
                  >
                    Let's explore! 🚀
                  </button>
                </div>
                
                {/* Sketch decorations */}
                <div className="absolute -bottom-2 -left-3 text-orange-400 transform rotate-30">➤</div>
                <div className="absolute -top-2 right-2 text-pink-500 transform -rotate-15">✦</div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </section>
  );
};

export default HeroSection;
