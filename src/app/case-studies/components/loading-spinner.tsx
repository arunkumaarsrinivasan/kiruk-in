'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  readonly message?: string;
}

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.p 
        className="mt-4 text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {message}
      </motion.p>
    </div>
  );
}
