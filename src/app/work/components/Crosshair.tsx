"use client";

import { motion } from "framer-motion";

interface CrosshairProps {
  x: number; // Percentage
  y: number; // Percentage
  power: number; // 0-1
  isCharging: boolean;
}

export function Crosshair({ x, y, power, isCharging }: CrosshairProps) {
  const size = 20 + power * 30; // Grows with power
  
  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        cursor: "none", // Hide cursor
      }}
      animate={{
        scale: isCharging ? [1, 1.1, 1] : 1,
      }}
      transition={{
        duration: 0.3,
        repeat: isCharging ? Infinity : 0,
      }}
    >
      {/* Outer circle */}
      <div
        className="absolute inset-0 rounded-full border-2"
        style={{
          width: size,
          height: size,
          borderColor: isCharging ? "var(--accent-color)" : "var(--text-main)",
          transform: "translate(-50%, -50%)",
          opacity: 0.8,
        }}
      />
      
      {/* Inner dot */}
      <div
        className="absolute rounded-full"
        style={{
          width: 4,
          height: 4,
          backgroundColor: isCharging ? "var(--accent-color)" : "var(--text-main)",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
      
      {/* Power indicator */}
      {isCharging && (
        <motion.div
          className="absolute rounded-full border-2"
          style={{
            width: size * power,
            height: size * power,
            borderColor: "var(--accent-color)",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.5,
          }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

