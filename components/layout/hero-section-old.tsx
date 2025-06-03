'use client';

import { motion } from 'framer-motion';
import ScribbleAnimation from '../three/scribble-animation';
import { SketchHeading, SketchButton, SketchArrow, SketchHighlight, StickyNote } from '../ui/sketch-elements';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden notebook-bg">
      {/* Scribble Background Animation */}
      <div className="absolute inset-0 opacity-20">
        <ScribbleAnimation className="w-full h-full" />
      </div>
      
      {/* Floating sketch elements */}
      <motion.div
        className="absolute top-20 right-20 hidden lg:block"
        animate={{ 
          rotate: [0, 5, -5, 0],
          y: [0, -10, 10, 0] 
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <StickyNote className="w-32 h-32">
          <div className="handwritten text-sm">
            💡 Ideas start here!
          </div>
        </StickyNote>
      </motion.div>

      <motion.div
        className="absolute top-40 left-20 hidden lg:block"
        animate={{ 
          rotate: [0, -3, 3, 0],
          x: [0, 5, -5, 0] 
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1 
        }}
      >
        <div className="handwritten text-2xl text-sketch-blue transform -rotate-12">
          ✨ Creative Process
        </div>
      </motion.div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Main heading with sketch style */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mb-6"
          >
            <SketchHeading level={1} className="text-5xl sm:text-7xl lg:text-8xl mb-4">
              kiruk
            </SketchHeading>
            
            {/* Hand-drawn arrow pointing to the title */}
            <motion.div 
              className="absolute -top-16 -right-10 hidden sm:block"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              <SketchArrow direction="down" className="w-16 h-16" />
              <div className="handwritten text-sm text-sketch-purple -mt-2 ml-8">
                That's me!
              </div>
            </motion.div>
          </motion.div>
          
          {/* Subtitle with sketch highlight */}
          <motion.div 
            className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Where{" "}
            <SketchHighlight color="yellow">
              <span className="font-semibold text-gray-900">AI meets UX</span>
            </SketchHighlight>
            {" "}through the art of{" "}
            <SketchHighlight color="blue">
              scribbling
            </SketchHighlight>
          </motion.div>
          
          {/* Description with notebook style */}
          <motion.div 
            className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="notebook-paper p-6 rounded-lg">
              <div className="handwritten text-base">
                I believe every great digital experience starts with a simple scribble. 
                As an AI-driven UX designer, I blend cutting-edge technology with 
                old-school pen-and-paper creativity to craft meaningful user experiences.
              </div>
            </div>
          </motion.div>            {/* CTA Buttons with sketch style */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <SketchButton href="/work" size="lg" variant="primary">
              View My Work
            </SketchButton>
            <SketchButton href="/about" size="lg" variant="outline">
              About Me
            </SketchButton>
          </motion.div>

          {/* Hand-drawn doodles */}
          <motion.div
            className="flex justify-center mt-8 space-x-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="handwritten text-2xl text-sketch-orange"
            >
              ✏️
            </motion.div>
            <motion.div
              animate={{ y: [0, -5, 5, 0] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                delay: 0.5,
                ease: "easeInOut"
              }}
              className="handwritten text-2xl text-sketch-green"
            >
              📝
            </motion.div>
            <motion.div
              animate={{ rotate: [0, -15, 15, 0] }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                delay: 1,
                ease: "easeInOut"
              }}
              className="handwritten text-2xl text-sketch-purple"
            >
              🎨
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Hand-drawn scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <div className="handwritten text-sm text-sketch-blue mb-2">
            Scroll to explore
          </div>
          <SketchArrow direction="down" className="w-6 h-8" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
