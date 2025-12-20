"use client";

import { motion } from "framer-motion";

interface LevelBackgroundProps {
  company: string;
  location: string;
  level: number;
  children: React.ReactNode;
}

export function LevelBackground({ company, location, level, children }: LevelBackgroundProps) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />
      
      {/* Level info banner */}
      <motion.div
        className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 border-4 border-black bg-white shadow-[4px_4px_0_#000] px-6 py-3"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="font-mono text-xs text-gray-600 uppercase mb-1">
            Level {level} - Field
          </div>
          <div className="font-mono text-xl font-bold text-black">
            {company}
          </div>
          <div className="font-mono text-xs text-gray-600">
            📍 {location}
          </div>
        </div>
      </motion.div>
      
      {/* Content */}
      {children}
    </div>
  );
}

