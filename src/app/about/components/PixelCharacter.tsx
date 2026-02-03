"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export type CharacterStage = "baby" | "toddler" | "child" | "teen" | "adult" | "professional";

interface PixelCharacterProps {
  stage: CharacterStage;
  action: "idle" | "crawl" | "walk" | "run" | "jump";
  isJumping?: boolean;
  direction?: "left" | "right";
  className?: string;
}

// Human-like character using SVG for smoother appearance
export function PixelCharacter({
  stage,
  action,
  isJumping,
  direction = "right",
  className
}: PixelCharacterProps) {
  const [frame, setFrame] = useState(0);
  const [bobOffset, setBobOffset] = useState(0);

  // Get character size and colors based on stage
  const config = getStageConfig(stage);

  // Walk animation with natural bob and leg movement
  useEffect(() => {
    if (action === "idle") {
      // Subtle breathing animation for idle
      const breathingInterval = setInterval(() => {
        setBobOffset((prev) => prev === 0 ? 1 : 0);
      }, 1500);
      return () => clearInterval(breathingInterval);
    }

    // Walking/running animation
    const walkSpeed = action === "run" ? 80 : action === "crawl" ? 400 : 150;
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4);
    }, walkSpeed);

    // Bobbing animation
    const bobInterval = setInterval(() => {
      setBobOffset((prev) => (prev + 1) % 4);
    }, walkSpeed / 2);

    return () => {
      clearInterval(interval);
      clearInterval(bobInterval);
    };
  }, [action]);

  // Calculate leg positions based on frame
  const legPhase = frame / 4;
  const leftLegAngle = Math.sin(legPhase * Math.PI * 2) * 30;
  const rightLegAngle = Math.sin((legPhase + 0.5) * Math.PI * 2) * 30;
  const armSwing = Math.sin(legPhase * Math.PI * 2) * 25;
  const verticalBob = action !== "idle" ? Math.abs(Math.sin(bobOffset * Math.PI / 2)) * 2 : bobOffset * 0.5;

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)",
      }}
      animate={{
        y: isJumping ? -50 : -verticalBob,
      }}
      transition={{
        y: isJumping
          ? { type: "spring", stiffness: 300, damping: 15 }
          : { duration: 0.1, ease: "linear" },
      }}
    >
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height}`}
        style={{ overflow: "visible" }}
      >
        {/* Shadow */}
        <ellipse
          cx={config.width / 2}
          cy={config.height - 3}
          rx={config.width * 0.3}
          ry={4}
          fill="rgba(0,0,0,0.2)"
        />

        {/* Body rendering based on stage */}
        {stage === "baby" && <BabyCharacter config={config} action={action} frame={frame} />}
        {stage === "toddler" && <ToddlerCharacter config={config} action={action} leftLegAngle={leftLegAngle} rightLegAngle={rightLegAngle} />}
        {stage === "child" && <ChildCharacter config={config} action={action} leftLegAngle={leftLegAngle} rightLegAngle={rightLegAngle} armSwing={armSwing} />}
        {stage === "teen" && <TeenCharacter config={config} action={action} leftLegAngle={leftLegAngle} rightLegAngle={rightLegAngle} armSwing={armSwing} />}
        {stage === "adult" && <AdultCharacter config={config} action={action} leftLegAngle={leftLegAngle} rightLegAngle={rightLegAngle} armSwing={armSwing} />}
        {stage === "professional" && <ProfessionalCharacter config={config} action={action} leftLegAngle={leftLegAngle} rightLegAngle={rightLegAngle} armSwing={armSwing} />}
      </svg>
    </motion.div>
  );
}

// Stage configurations
function getStageConfig(stage: CharacterStage) {
  const configs = {
    baby: {
      width: 32, height: 32,
      skinColor: "#FFE5B4", hairColor: "#3D2914",
      shirtColor: "#87CEEB", pantsColor: "#87CEEB",
      headSize: 14, bodyHeight: 8, legLength: 4
    },
    toddler: {
      width: 36, height: 44,
      skinColor: "#FFE5B4", hairColor: "#3D2914",
      shirtColor: "#FF9F43", pantsColor: "#4169E1",
      headSize: 14, bodyHeight: 12, legLength: 10
    },
    child: {
      width: 40, height: 56,
      skinColor: "#FFE5B4", hairColor: "#3D2914",
      shirtColor: "#2ECC71", pantsColor: "#3498DB",
      headSize: 14, bodyHeight: 16, legLength: 16
    },
    teen: {
      width: 44, height: 68,
      skinColor: "#FFE5B4", hairColor: "#1A1A2E",
      shirtColor: "#9B59B6", pantsColor: "#1A1A2E",
      headSize: 14, bodyHeight: 20, legLength: 22
    },
    adult: {
      width: 48, height: 76,
      skinColor: "#FFE5B4", hairColor: "#1A1A2E",
      shirtColor: "#E74C3C", pantsColor: "#1A1A2E",
      headSize: 14, bodyHeight: 22, legLength: 26
    },
    professional: {
      width: 48, height: 76,
      skinColor: "#FFE5B4", hairColor: "#1A1A2E",
      shirtColor: "#2C3E50", pantsColor: "#1A1A2E",
      headSize: 14, bodyHeight: 22, legLength: 26
    },
  };
  return configs[stage];
}

// Baby character (crawling)
function BabyCharacter({ config, action, frame }: { config: ReturnType<typeof getStageConfig>; action: string; frame: number }) {
  const crawlOffset = action === "crawl" ? Math.sin(frame * Math.PI / 2) * 3 : 0;

  return (
    <g transform={`translate(${config.width / 2}, ${config.height / 2})`}>
      {/* Head */}
      <circle cx={0} cy={-4} r={config.headSize} fill={config.skinColor} />
      {/* Hair - Baby fuzz/wisps */}
      <ellipse cx={0} cy={-12} rx={10} ry={6} fill={config.hairColor} />
      {/* Hair wisps */}
      <path d="M -6 -16 Q -4 -20 0 -18 Q 4 -20 6 -16" fill="none" stroke={config.hairColor} strokeWidth={2} strokeLinecap="round" />
      <path d="M -3 -17 Q 0 -22 3 -17" fill="none" stroke={config.hairColor} strokeWidth={1.5} strokeLinecap="round" />
      {/* Eyes */}
      <circle cx={-4} cy={-5} r={2} fill="#000" />
      <circle cx={4} cy={-5} r={2} fill="#000" />
      <circle cx={-3.5} cy={-5.5} r={0.8} fill="#fff" />
      <circle cx={4.5} cy={-5.5} r={0.8} fill="#fff" />
      {/* Cheeks */}
      <circle cx={-8} cy={0} r={3} fill="#FFB6C1" opacity={0.5} />
      <circle cx={8} cy={0} r={3} fill="#FFB6C1" opacity={0.5} />
      {/* Body (onesie) */}
      <ellipse cx={0} cy={8 + crawlOffset} rx={10} ry={8} fill={config.shirtColor} />
      {/* Arms */}
      <ellipse cx={-10 + crawlOffset} cy={10} rx={4} ry={6} fill={config.skinColor} />
      <ellipse cx={10 - crawlOffset} cy={10} rx={4} ry={6} fill={config.skinColor} />
    </g>
  );
}

// Toddler character
function ToddlerCharacter({ config, action, leftLegAngle, rightLegAngle }: { config: ReturnType<typeof getStageConfig>; action: string; leftLegAngle: number; rightLegAngle: number }) {
  const cx = config.width / 2;
  const headY = 14;

  return (
    <g>
      {/* Hair - Toddler messy hair */}
      <ellipse cx={cx} cy={headY - 6} rx={12} ry={8} fill={config.hairColor} />
      {/* Hair tufts */}
      <path d={`M ${cx - 8} ${headY - 12} Q ${cx - 6} ${headY - 18} ${cx - 2} ${headY - 14}`} fill={config.hairColor} />
      <path d={`M ${cx + 2} ${headY - 14} Q ${cx + 6} ${headY - 18} ${cx + 8} ${headY - 12}`} fill={config.hairColor} />
      <path d={`M ${cx - 3} ${headY - 13} Q ${cx} ${headY - 19} ${cx + 3} ${headY - 13}`} fill={config.hairColor} />
      {/* Head */}
      <circle cx={cx} cy={headY} r={config.headSize} fill={config.skinColor} />
      {/* Eyes */}
      <circle cx={cx - 4} cy={headY - 2} r={2.5} fill="#000" />
      <circle cx={cx + 4} cy={headY - 2} r={2.5} fill="#000" />
      <circle cx={cx - 3.5} cy={headY - 2.5} r={0.8} fill="#fff" />
      <circle cx={cx + 4.5} cy={headY - 2.5} r={0.8} fill="#fff" />
      {/* Mouth */}
      <path d={`M ${cx - 3} ${headY + 4} Q ${cx} ${headY + 6} ${cx + 3} ${headY + 4}`} fill="none" stroke="#000" strokeWidth={1.5} />
      {/* Body */}
      <rect x={cx - 8} y={28} width={16} height={config.bodyHeight} rx={3} fill={config.shirtColor} />
      {/* Arms */}
      <ellipse cx={cx - 10} cy={32} rx={4} ry={6} fill={config.skinColor} />
      <ellipse cx={cx + 10} cy={32} rx={4} ry={6} fill={config.skinColor} />
      {/* Legs */}
      <g transform={`translate(${cx - 4}, 40)`}>
        <rect
          x={-3} y={0} width={6} height={config.legLength} rx={2} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${leftLegAngle}, 0, 0)` : ""}
        />
      </g>
      <g transform={`translate(${cx + 4}, 40)`}>
        <rect
          x={-3} y={0} width={6} height={config.legLength} rx={2} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${rightLegAngle}, 0, 0)` : ""}
        />
      </g>
    </g>
  );
}

// Child character
function ChildCharacter({ config, action, leftLegAngle, rightLegAngle, armSwing }: { config: ReturnType<typeof getStageConfig>; action: string; leftLegAngle: number; rightLegAngle: number; armSwing: number }) {
  const cx = config.width / 2;
  const headY = 14;

  return (
    <g>
      {/* Hair - Child fuller styled hair */}
      <ellipse cx={cx} cy={headY - 6} rx={12} ry={8} fill={config.hairColor} />
      {/* Side hair */}
      <path d={`M ${cx - 12} ${headY - 2} Q ${cx - 14} ${headY - 8} ${cx - 10} ${headY - 12}`} fill={config.hairColor} />
      <path d={`M ${cx + 12} ${headY - 2} Q ${cx + 14} ${headY - 8} ${cx + 10} ${headY - 12}`} fill={config.hairColor} />
      {/* Top hair volume */}
      <path d={`M ${cx - 8} ${headY - 12} Q ${cx} ${headY - 18} ${cx + 8} ${headY - 12}`} fill={config.hairColor} />
      {/* Head */}
      <circle cx={cx} cy={headY} r={config.headSize} fill={config.skinColor} />
      {/* Eyes */}
      <circle cx={cx - 4} cy={headY - 2} r={2.5} fill="#000" />
      <circle cx={cx + 4} cy={headY - 2} r={2.5} fill="#000" />
      <circle cx={cx - 3.5} cy={headY - 2.5} r={0.8} fill="#fff" />
      <circle cx={cx + 4.5} cy={headY - 2.5} r={0.8} fill="#fff" />
      {/* Smile */}
      <path d={`M ${cx - 4} ${headY + 4} Q ${cx} ${headY + 7} ${cx + 4} ${headY + 4}`} fill="none" stroke="#000" strokeWidth={1.5} />
      {/* Body */}
      <rect x={cx - 9} y={28} width={18} height={config.bodyHeight} rx={3} fill={config.shirtColor} />
      {/* Arms */}
      <g transform={`translate(${cx - 10}, 30)`}>
        <rect
          x={-3} y={0} width={6} height={12} rx={2} fill={config.skinColor}
          transform={action !== "idle" ? `rotate(${-armSwing}, 0, 0)` : ""}
        />
      </g>
      <g transform={`translate(${cx + 10}, 30)`}>
        <rect
          x={-3} y={0} width={6} height={12} rx={2} fill={config.skinColor}
          transform={action !== "idle" ? `rotate(${armSwing}, 0, 0)` : ""}
        />
      </g>
      {/* Legs */}
      <g transform={`translate(${cx - 5}, 44)`}>
        <rect
          x={-3} y={0} width={6} height={config.legLength} rx={2} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${leftLegAngle}, 0, 0)` : ""}
        />
      </g>
      <g transform={`translate(${cx + 5}, 44)`}>
        <rect
          x={-3} y={0} width={6} height={config.legLength} rx={2} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${rightLegAngle}, 0, 0)` : ""}
        />
      </g>
    </g>
  );
}

// Teen character
function TeenCharacter({ config, action, leftLegAngle, rightLegAngle, armSwing }: { config: ReturnType<typeof getStageConfig>; action: string; leftLegAngle: number; rightLegAngle: number; armSwing: number }) {
  const cx = config.width / 2;
  const headY = 14;

  return (
    <g>
      {/* Hair (messy teen hair) */}
      <path d={`M ${cx - 12} ${headY} Q ${cx - 14} ${headY - 12} ${cx} ${headY - 14} Q ${cx + 14} ${headY - 12} ${cx + 12} ${headY}`} fill={config.hairColor} />
      {/* Head */}
      <circle cx={cx} cy={headY} r={config.headSize} fill={config.skinColor} />
      {/* Eyes */}
      <circle cx={cx - 4} cy={headY - 2} r={2.5} fill="#000" />
      <circle cx={cx + 4} cy={headY - 2} r={2.5} fill="#000" />
      <circle cx={cx - 3.5} cy={headY - 2.5} r={0.8} fill="#fff" />
      <circle cx={cx + 4.5} cy={headY - 2.5} r={0.8} fill="#fff" />
      {/* Slight smile */}
      <path d={`M ${cx - 3} ${headY + 5} Q ${cx} ${headY + 6} ${cx + 3} ${headY + 5}`} fill="none" stroke="#000" strokeWidth={1.5} />
      {/* Neck */}
      <rect x={cx - 3} y={28} width={6} height={4} fill={config.skinColor} />
      {/* Body (hoodie) */}
      <rect x={cx - 10} y={30} width={20} height={config.bodyHeight} rx={3} fill={config.shirtColor} />
      {/* Hoodie pocket */}
      <rect x={cx - 6} y={42} width={12} height={6} rx={2} fill={config.shirtColor} stroke="#8E44AD" strokeWidth={1} opacity={0.5} />
      {/* Arms */}
      <g transform={`translate(${cx - 11}, 32)`}>
        <rect
          x={-4} y={0} width={7} height={16} rx={2} fill={config.shirtColor}
          transform={action !== "idle" ? `rotate(${-armSwing}, 0, 0)` : ""}
        />
        <rect
          x={-3} y={14} width={5} height={4} rx={2} fill={config.skinColor}
          transform={action !== "idle" ? `rotate(${-armSwing}, 0, -14)` : ""}
        />
      </g>
      <g transform={`translate(${cx + 11}, 32)`}>
        <rect
          x={-3} y={0} width={7} height={16} rx={2} fill={config.shirtColor}
          transform={action !== "idle" ? `rotate(${armSwing}, 0, 0)` : ""}
        />
        <rect
          x={-2} y={14} width={5} height={4} rx={2} fill={config.skinColor}
          transform={action !== "idle" ? `rotate(${armSwing}, 0, -14)` : ""}
        />
      </g>
      {/* Legs */}
      <g transform={`translate(${cx - 5}, 50)`}>
        <rect
          x={-4} y={0} width={8} height={config.legLength} rx={2} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${leftLegAngle}, 0, 0)` : ""}
        />
      </g>
      <g transform={`translate(${cx + 5}, 50)`}>
        <rect
          x={-4} y={0} width={8} height={config.legLength} rx={2} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${rightLegAngle}, 0, 0)` : ""}
        />
      </g>
      {/* Shoes */}
      <ellipse cx={cx - 5} cy={config.height - 5} rx={5} ry={3} fill="#fff" />
      <ellipse cx={cx + 5} cy={config.height - 5} rx={5} ry={3} fill="#fff" />
    </g>
  );
}

// Adult character
function AdultCharacter({ config, action, leftLegAngle, rightLegAngle, armSwing }: { config: ReturnType<typeof getStageConfig>; action: string; leftLegAngle: number; rightLegAngle: number; armSwing: number }) {
  const cx = config.width / 2;
  const headY = 14;

  return (
    <g>
      {/* Hair */}
      <path d={`M ${cx - 11} ${headY + 2} Q ${cx - 13} ${headY - 10} ${cx} ${headY - 12} Q ${cx + 13} ${headY - 10} ${cx + 11} ${headY + 2}`} fill={config.hairColor} />
      {/* Head */}
      <circle cx={cx} cy={headY} r={config.headSize} fill={config.skinColor} />
      {/* Eyes */}
      <circle cx={cx - 4} cy={headY - 2} r={2.5} fill="#000" />
      <circle cx={cx + 4} cy={headY - 2} r={2.5} fill="#000" />
      <circle cx={cx - 3.5} cy={headY - 2.5} r={0.8} fill="#fff" />
      <circle cx={cx + 4.5} cy={headY - 2.5} r={0.8} fill="#fff" />
      {/* Smile */}
      <path d={`M ${cx - 3} ${headY + 5} Q ${cx} ${headY + 7} ${cx + 3} ${headY + 5}`} fill="none" stroke="#000" strokeWidth={1.5} />
      {/* Neck */}
      <rect x={cx - 3} y={28} width={6} height={4} fill={config.skinColor} />
      {/* Body (t-shirt) */}
      <rect x={cx - 11} y={30} width={22} height={config.bodyHeight} rx={3} fill={config.shirtColor} />
      {/* Arms */}
      <g transform={`translate(${cx - 12}, 32)`}>
        <rect
          x={-4} y={0} width={7} height={18} rx={2} fill={config.shirtColor}
          transform={action !== "idle" ? `rotate(${-armSwing}, 0, 0)` : ""}
        />
        <rect
          x={-3} y={16} width={5} height={5} rx={2} fill={config.skinColor}
          transform={action !== "idle" ? `rotate(${-armSwing}, 0, -16)` : ""}
        />
      </g>
      <g transform={`translate(${cx + 12}, 32)`}>
        <rect
          x={-3} y={0} width={7} height={18} rx={2} fill={config.shirtColor}
          transform={action !== "idle" ? `rotate(${armSwing}, 0, 0)` : ""}
        />
        <rect
          x={-2} y={16} width={5} height={5} rx={2} fill={config.skinColor}
          transform={action !== "idle" ? `rotate(${armSwing}, 0, -16)` : ""}
        />
      </g>
      {/* Legs */}
      <g transform={`translate(${cx - 6}, 52)`}>
        <rect
          x={-4} y={0} width={8} height={config.legLength} rx={2} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${leftLegAngle}, 0, 0)` : ""}
        />
      </g>
      <g transform={`translate(${cx + 6}, 52)`}>
        <rect
          x={-4} y={0} width={8} height={config.legLength} rx={2} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${rightLegAngle}, 0, 0)` : ""}
        />
      </g>
      {/* Shoes */}
      <ellipse cx={cx - 6} cy={config.height - 4} rx={6} ry={4} fill="#2C3E50" />
      <ellipse cx={cx + 6} cy={config.height - 4} rx={6} ry={4} fill="#2C3E50" />
    </g>
  );
}

// Professional character (with formal attire)
function ProfessionalCharacter({ config, action, leftLegAngle, rightLegAngle, armSwing }: { config: ReturnType<typeof getStageConfig>; action: string; leftLegAngle: number; rightLegAngle: number; armSwing: number }) {
  const cx = config.width / 2;
  const headY = 14;

  return (
    <g>
      {/* Hair (neat) */}
      <path d={`M ${cx - 11} ${headY + 2} Q ${cx - 12} ${headY - 10} ${cx} ${headY - 12} Q ${cx + 12} ${headY - 10} ${cx + 11} ${headY + 2}`} fill={config.hairColor} />
      {/* Head */}
      <circle cx={cx} cy={headY} r={config.headSize} fill={config.skinColor} />
      {/* Eyes */}
      <circle cx={cx - 4} cy={headY - 2} r={2.5} fill="#000" />
      <circle cx={cx + 4} cy={headY - 2} r={2.5} fill="#000" />
      <circle cx={cx - 3.5} cy={headY - 2.5} r={0.8} fill="#fff" />
      <circle cx={cx + 4.5} cy={headY - 2.5} r={0.8} fill="#fff" />
      {/* Confident smile */}
      <path d={`M ${cx - 4} ${headY + 4} Q ${cx} ${headY + 7} ${cx + 4} ${headY + 4}`} fill="none" stroke="#000" strokeWidth={1.5} />
      {/* Neck */}
      <rect x={cx - 3} y={28} width={6} height={4} fill={config.skinColor} />
      {/* Collar (white shirt) */}
      <polygon points={`${cx - 6},30 ${cx},36 ${cx + 6},30`} fill="#fff" />
      {/* Body (blazer) */}
      <rect x={cx - 11} y={30} width={22} height={config.bodyHeight} rx={3} fill={config.shirtColor} />
      {/* Tie */}
      <polygon points={`${cx},32 ${cx - 2},36 ${cx},48 ${cx + 2},36`} fill="#E74C3C" />
      {/* Arms (sleeves) */}
      <g transform={`translate(${cx - 12}, 32)`}>
        <rect
          x={-4} y={0} width={7} height={18} rx={2} fill={config.shirtColor}
          transform={action !== "idle" ? `rotate(${-armSwing}, 0, 0)` : ""}
        />
        <rect
          x={-3} y={16} width={5} height={5} rx={2} fill={config.skinColor}
          transform={action !== "idle" ? `rotate(${-armSwing}, 0, -16)` : ""}
        />
      </g>
      <g transform={`translate(${cx + 12}, 32)`}>
        <rect
          x={-3} y={0} width={7} height={18} rx={2} fill={config.shirtColor}
          transform={action !== "idle" ? `rotate(${armSwing}, 0, 0)` : ""}
        />
        <rect
          x={-2} y={16} width={5} height={5} rx={2} fill={config.skinColor}
          transform={action !== "idle" ? `rotate(${armSwing}, 0, -16)` : ""}
        />
      </g>
      {/* Legs (formal pants) */}
      <g transform={`translate(${cx - 6}, 52)`}>
        <rect
          x={-4} y={0} width={8} height={config.legLength} rx={2} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${leftLegAngle}, 0, 0)` : ""}
        />
      </g>
      <g transform={`translate(${cx + 6}, 52)`}>
        <rect
          x={-4} y={0} width={8} height={config.legLength} rx={2} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${rightLegAngle}, 0, 0)` : ""}
        />
      </g>
      {/* Dress shoes */}
      <ellipse cx={cx - 6} cy={config.height - 4} rx={6} ry={4} fill="#1A1A2E" />
      <ellipse cx={cx + 6} cy={config.height - 4} rx={6} ry={4} fill="#1A1A2E" />
    </g>
  );
}

export function getStageFromAge(age: number): CharacterStage {
  if (age <= 2) return "baby";
  if (age <= 7) return "toddler";
  if (age <= 13) return "child";
  if (age <= 18) return "teen";
  if (age <= 21) return "adult";
  return "professional";
}

export function getActionFromAge(age: number): "crawl" | "walk" | "run" {
  if (age <= 2) return "crawl";
  if (age <= 13) return "walk";
  return "run";
}
