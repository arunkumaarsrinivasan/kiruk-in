'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function CaseStudies() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <main className="min-h-screen pt-16 notebook-bg overflow-hidden relative">
      {/* Floating doodles */}
      <motion.div 
        className="absolute top-20 left-10 opacity-30"
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path d="M5 20 Q20 5 35 20 Q20 35 5 20" stroke="#6b7280" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      </motion.div>

      <motion.div 
        className="absolute top-32 right-20 opacity-30"
        animate={{ 
          x: [0, 10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        <svg width="30" height="30" viewBox="0 0 30 30">
          <circle cx="15" cy="15" r="12" stroke="#6b7280" strokeWidth="2" fill="none" strokeDasharray="5,5"/>
        </svg>
      </motion.div>

      {/* Main content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative max-w-lg w-full">
          {/* Main sticky note */}
          <motion.div 
            className="bg-yellow-200 p-8 shadow-lg relative cursor-pointer"
            style={{
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
              borderRadius: '2px'
            }}
            initial={{ rotate: 2, scale: 1 }}
            whileHover={{ 
              rotate: 0, 
              scale: 1.02,
              boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.12)'
            }}
            transition={{ duration: 0.3 }}
            onHoverStart={() => setIsHovering(true)}
            onHoverEnd={() => setIsHovering(false)}
          >
            {/* Tape at top with interaction */}
            <motion.div 
              className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-yellow-100 opacity-80 rounded-sm shadow-sm"
              animate={isHovering ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            />
            
            <div className="handwritten text-center">
              <motion.h1 
                className="text-3xl font-bold mb-4 text-gray-800"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Case Studies
              </motion.h1>
              
              <motion.div 
                className="text-lg text-gray-700 mb-6 leading-relaxed"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="mb-3">Currently brewing some awesome case studies! ☕</p>
                <p className="mb-4">In the meantime, check out my work on Behance:</p>
                
                {/* Interactive Behance link */}
                <motion.a
                  href="https://www.behance.net/arunkusriniva"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-blue-600 transition-all duration-200 transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎨 Visit My Behance
                </motion.a>
                
                <p className="text-sm text-gray-600 mt-4">- Arun</p>
              </motion.div>
              
              {/* Interactive doodle */}
              <motion.div 
                className="flex justify-center mt-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                <motion.svg 
                  width="80" height="50" 
                  viewBox="0 0 80 50" 
                  className="opacity-60"
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.path 
                    d="M10 25 Q25 15 40 25 Q55 35 70 25" 
                    stroke="#6b7280" 
                    strokeWidth="2" 
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 0.8 }}
                  />
                  <motion.circle 
                    cx="15" cy="25" r="3" 
                    fill="#6b7280"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2 }}
                  />
                  <motion.circle 
                    cx="65" cy="25" r="3" 
                    fill="#6b7280"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.4 }}
                  />
                </motion.svg>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Animated additional note */}
          <motion.div 
            className="absolute -bottom-4 -right-2 bg-pink-200 p-3 shadow-md handwritten text-sm text-gray-700 cursor-pointer"
            style={{ borderRadius: '2px' }}
            initial={{ rotate: -12, scale: 0.8, opacity: 0 }}
            animate={{ rotate: -12, scale: 1, opacity: 1 }}
            whileHover={{ 
              rotate: -8, 
              scale: 1.05,
              boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)'
            }}
            transition={{ delay: 1, duration: 0.3 }}
          >
            <motion.div
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Coming Soon! 🚧
            </motion.div>
          </motion.div>

          {/* Floating arrow pointing to Behance */}
          <motion.div
            className="absolute -left-8 top-1/2 transform -translate-y-1/2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 0.7 }}
            transition={{ delay: 1.5 }}
          >
            <motion.svg 
              width="30" height="20" 
              viewBox="0 0 30 20"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <path d="M5 10 L25 10 M20 5 L25 10 L20 15" stroke="#6b7280" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </motion.svg>
          </motion.div>
        </div>
      </div>
    </main>
  );
}