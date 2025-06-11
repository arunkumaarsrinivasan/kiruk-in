'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CaseStudy } from '../types';

interface BookCoverProps {
  readonly study: CaseStudy;
  readonly onClick: () => void;
}

export default function BookCover({ study, onClick }: BookCoverProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: -2 }}
      whileTap={{ scale: 0.98, rotate: 2 }}
      className="relative cursor-pointer sketch-border bg-white overflow-hidden h-80 transition-all duration-300 group paper-texture"
      onClick={onClick}
    >
      {/* Book spine effect with hand-drawn style */}
      <div className="absolute left-0 top-0 h-full w-4 bg-gradient-to-r from-gray-800 to-gray-600 shadow-inner" />
      
      {/* Decorative corner doodles */}
      <div className="absolute top-2 right-2 text-black opacity-30 text-lg animate-wiggle">
        ✏️
      </div>
      <div className="absolute bottom-2 left-6 text-black opacity-30 text-sm">
        ••••
      </div>
      
      {/* Book cover content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full p-6">
        {/* Hand-drawn book icon */}
        <motion.div
          animate={{ 
            rotate: [0, 2, -2, 0],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-4xl mb-4 filter drop-shadow-sm"
        >
          📔
        </motion.div>
        
        {/* Title with handwritten font */}
        <h3 className="handwritten text-2xl font-bold text-center mb-2 text-black leading-tight">
          {study.title}          {study.title}
        </h3>
        
        {/* Summary with sketch font */}
        <p className="sketch-font text-sm text-center text-gray-600 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 leading-relaxed">
          {study.summary.substring(0, 60)}...
        </p>
        
        {/* Technologies preview with sketch styling */}
        {study.technologies && (
          <div className="flex flex-wrap gap-1 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {study.technologies.slice(0, 3).map((tech, i) => (
              <span key={`tech-${tech}`} className="text-xs px-2 py-1 bg-gray-100 border border-black rounded-sm text-black sketch-font">
                {tech}
              </span>
            ))}
            {study.technologies.length > 3 && (
              <span className="text-xs px-2 py-1 bg-gray-100 border border-black rounded-sm text-black sketch-font">
                +{study.technologies.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Call to action with handwritten style */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
        >
          <span className="handwritten text-base text-black bg-white border border-black px-3 py-1 rounded-sm shadow-sm">
            read more →
          </span>
        </motion.div>
      </div>
      
      {/* Book pages effect with sketch style */}
      <div className="absolute right-2 top-2 bottom-2 w-1 bg-gray-200 border-r border-black/20 rounded-r-sm" />
      <div className="absolute right-3 top-3 bottom-3 w-1 bg-gray-100 border-r border-black/10 rounded-r-sm" />
      
      {/* Hand-drawn shadow effect */}
      <motion.div 
        className="absolute -right-2 -bottom-2 h-full w-full bg-black/10 rounded-lg -z-10 transform rotate-1" 
        animate={{
          rotate: [1, 0.5, 1.5, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Subtle hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
}
