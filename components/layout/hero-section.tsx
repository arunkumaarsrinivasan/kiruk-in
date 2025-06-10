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
          <div className="handwritten text-sm opacity-80">Designing better realities. AX is my playground.</div>
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
          AX designer
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
      >
        <div className="handwritten text-lg text-sketch-blue transform -rotate-6">
          Full stack developer
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
      >
        <div className="handwritten text-base text-sketch-green transform rotate-90">
          Code + Design 💻
        </div>
      </motion.div>      {/* Subtle center hint */}
      <motion.div
        className="absolute bottom-8 right-8 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <div className="handwritten text-xs text-gray-400">
          Move your mouse to scribble ✏️
        </div>
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
      >
        <div className="handwritten text-sm text-sketch-purple transform -rotate-12">
          🏔️ Trekker
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
      >
        <div className="handwritten text-sm text-sketch-orange transform rotate-6">
          📸 Life Documenter
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
