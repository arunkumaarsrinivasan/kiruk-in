"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

interface SniperScopeProps {
  x: number; // Percentage
  y: number; // Percentage
  power: number; // 0-1
  isCharging: boolean;
  isAiming: boolean;
}

export function SniperScope({ x, y, power, isCharging, isAiming }: SniperScopeProps) {
  const [swayX, setSwayX] = useState(0);
  const [swayY, setSwayY] = useState(0);
  
  // Sniper scope sway - random movement when aiming
  useEffect(() => {
    if (!isAiming) {
      setSwayX(0);
      setSwayY(0);
      return;
    }
    
    const interval = setInterval(() => {
      // Random sway - very subtle movement like real sniper scope
      const maxSway = 0.3; // Max 0.3% movement
      setSwayX((Math.random() - 0.5) * maxSway);
      setSwayY((Math.random() - 0.5) * maxSway);
    }, 100); // Update every 100ms for smooth sway
    
    return () => clearInterval(interval);
  }, [isAiming]);
  
  const scopeSize = 80 + power * 40; // Grows with power
  const crosshairSize = 20;
  
  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{
        left: `${x + swayX}%`,
        top: `${y + swayY}%`,
        transform: "translate(-50%, -50%)",
        cursor: "none",
      }}
      animate={{
        scale: isCharging ? [1, 1.05, 1] : 1,
      }}
      transition={{
        duration: 0.5,
        repeat: isCharging ? Infinity : 0,
      }}
    >
      {/* Outer scope ring */}
      <div
        className="absolute rounded-full border-2"
        style={{
          width: scopeSize,
          height: scopeSize,
          borderColor: "var(--text-main)",
          transform: "translate(-50%, -50%)",
          opacity: 0.6,
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        }}
      />
      
      {/* Inner crosshair */}
      <div className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
        {/* Horizontal line */}
        <div
          className="absolute"
          style={{
            width: crosshairSize,
            height: 2,
            backgroundColor: "var(--text-main)",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.8,
          }}
        />
        {/* Vertical line */}
        <div
          className="absolute"
          style={{
            width: 2,
            height: crosshairSize,
            backgroundColor: "var(--text-main)",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.8,
          }}
        />
        {/* Center dot */}
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
      </div>
      
      {/* Power indicator rings */}
      {isCharging && (
        <>
          <motion.div
            className="absolute rounded-full border"
            style={{
              width: scopeSize * power,
              height: scopeSize * power,
              borderColor: "var(--accent-color)",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              opacity: 0.4,
            }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          <div
            className="absolute font-mono text-xs"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%) translateY(45px)",
              color: "var(--accent-color)",
            }}
          >
            {Math.round(power * 100)}%
          </div>
        </>
      )}
      
      {/* Scope lines (sniper reticle style) */}
      {[0, 90, 180, 270].map((angle, idx) => (
        <div
          key={idx}
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            width: scopeSize * 0.3,
            height: 1,
            backgroundColor: "var(--text-main)",
            opacity: 0.3,
            transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${scopeSize * 0.15}px)`,
            transformOrigin: "left center",
          }}
        />
      ))}
    </motion.div>
  );
}

