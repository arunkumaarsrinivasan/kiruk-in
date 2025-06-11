'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface InteractiveFeatureDemoProps {
  readonly title: string;
  readonly description: string;
  readonly children: React.ReactNode;
}

export default function InteractiveFeatureDemo({ title, description, children }: InteractiveFeatureDemoProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg 
              className="w-5 h-5 text-gray-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </div>
      
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
