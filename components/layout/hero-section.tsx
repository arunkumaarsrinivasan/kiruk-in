'use client';

import { motion } from 'framer-motion';
import ScribbleAnimation from '../three/scribble-animation';

const HeroSection = () => {
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
          <div className="architect-font text-3xl mb-2 font-bold kiruk-title">KIRUK</div>
          <div className="handwritten text-sm">Arun kumaar Sreenivasan</div>
          <div className="handwritten text-xs text-gray-600 mt-1">SDE 1 @ HP Inc | Design Consultant</div>
          <div className="handwritten text-xs text-gray-500">📍 Bangalore (Hybrid)</div>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-20 right-20 hidden lg:block"
        animate={{ 
          rotate: [0, 2, -2, 0],
          y: [0, -5, 5, 0] 
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >        <div className="sketch-font text-xl text-sketch-orange transform rotate-12">
          SDE 1
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-20 left-20 hidden lg:block"
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
      >        <div className="handwritten text-lg text-sketch-blue transform -rotate-6">
          AWS + Spring Boot
        </div>
      </motion.div>

      <motion.div
        className="absolute top-1/2 right-10 hidden lg:block"
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
      >        <div className="handwritten text-base text-sketch-green transform rotate-90">
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
      
      {/* Adventure spirit indicators */}
      <motion.div
        className="absolute top-1/3 left-10 hidden lg:block"
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
      >        <div className="handwritten text-sm text-sketch-purple transform -rotate-12">
          🏔️ Trekking {'>'}{'>'} Party
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 right-1/3 hidden lg:block"
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
      >        <div className="handwritten text-sm text-sketch-orange transform rotate-6">
          🏓 Table Tennis Pro
        </div>
      </motion.div>

      {/* Additional professional elements */}
      <motion.div
        className="absolute top-1/4 right-1/4 hidden lg:block"
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
      >
        <div className="handwritten text-xs text-sketch-blue transform rotate-15">
          ☁️ AWS Expert
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 left-1/4 hidden lg:block"
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
      >
        <div className="handwritten text-xs text-sketch-green transform -rotate-8">
          🎵 Music Lover
        </div>
      </motion.div>

      <motion.div
        className="absolute top-2/3 left-1/3 hidden lg:block"
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
      >        <div className="handwritten text-xs text-sketch-purple transform rotate-12">
          🤝 Collaboration
        </div>
      </motion.div>

      {/* Interactive Guide Instructions */}
      <motion.div
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <div className="bg-yellow-100/90 border-2 border-dashed border-yellow-400 rounded-lg p-4 max-w-md backdrop-blur-sm">
          <div className="handwritten text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Welcome to KIRUK's Interactive Portfolio! 🎨</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>👆 <strong>Top Right:</strong> Interactive toolbar & live analytics</p>
              <p>📱 <strong>Navigation:</strong> Menu bar below for easy browsing</p>
              <p>🎯 <strong>Explore:</strong> Click around to discover interactive elements</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dismissible hint */}
      <motion.div
        className="absolute top-1/2 left-4 z-20 hidden lg:block"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.6, x: 0 }}
        transition={{ duration: 0.5, delay: 3 }}
      >
        <div className="bg-blue-50/90 border-2 border-dashed border-blue-300 rounded-lg p-3 max-w-xs">
          <div className="handwritten text-xs text-blue-800">
            <p className="font-bold mb-1">💡 Pro Tip:</p>
            <p>This portfolio is fully interactive! Try hovering over elements and clicking to explore my work.</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
