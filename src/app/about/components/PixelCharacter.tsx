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
  showThought?: boolean;
  thoughtContent?: string;
}

// Human-like character using SVG with improved animations and straight short hair
export function PixelCharacter({
  stage,
  action,
  isJumping,
  direction = "right",
  className,
  showThought = false,
  thoughtContent = "💭"
}: PixelCharacterProps) {
  const [frame, setFrame] = useState(0);
  const [bobOffset, setBobOffset] = useState(0);
  const [blinkState, setBlinkState] = useState(false);

  // Get character size and colors based on stage
  const config = getStageConfig(stage);

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Walk animation with natural bob and leg movement
  useEffect(() => {
    if (action === "idle") {
      // Subtle breathing animation for idle
      const breathingInterval = setInterval(() => {
        setBobOffset((prev) => prev === 0 ? 1 : 0);
      }, 1200);
      return () => clearInterval(breathingInterval);
    }

    // Walking/running animation
    const walkSpeed = action === "run" ? 80 : action === "crawl" ? 400 : 120;
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 8); // 8 frames for smoother animation
    }, walkSpeed);

    // Bobbing animation
    const bobInterval = setInterval(() => {
      setBobOffset((prev) => (prev + 1) % 8);
    }, walkSpeed / 2);

    return () => {
      clearInterval(interval);
      clearInterval(bobInterval);
    };
  }, [action]);

  // Calculate movement animation values
  const walkCycle = frame / 8;
  const leftLegAngle = Math.sin(walkCycle * Math.PI * 2) * 35;
  const rightLegAngle = Math.sin((walkCycle + 0.5) * Math.PI * 2) * 35;
  const armSwing = Math.sin(walkCycle * Math.PI * 2) * 30;

  // Body sway for natural walking feel
  const bodySway = action !== "idle" ? Math.sin(walkCycle * Math.PI * 2) * 2 : 0;
  const bodyLean = action === "run" ? 8 : (action === "walk" ? 4 : 0);
  const headBob = action !== "idle" ? Math.sin(bobOffset * Math.PI / 4) * 2 : bobOffset * 0.3;
  const verticalBob = action !== "idle" ? Math.abs(Math.sin(bobOffset * Math.PI / 4)) * 3 : bobOffset * 0.5;

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)",
      }}
      animate={{
        y: isJumping ? -50 : -verticalBob,
        rotate: bodyLean,
      }}
      transition={{
        y: isJumping
          ? { type: "spring", stiffness: 300, damping: 15 }
          : { duration: 0.08, ease: "linear" },
        rotate: { duration: 0.2, ease: "easeOut" },
      }}
    >
      {/* Thought Bubble */}
      {showThought && (
        <motion.div
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 pointer-events-none"
          initial={{ opacity: 0, scale: 0, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <div
            className="relative px-3 py-2 rounded-full font-mono text-xs"
            style={{
              background: "rgba(255,255,255,0.95)",
              border: "2px solid #333",
              boxShadow: "2px 2px 0px #333",
            }}
          >
            {thoughtContent}
            {/* Bubble trail */}
            <div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full"
              style={{ background: "#fff", border: "1px solid #333" }}
            />
            <div
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 ml-1 w-1.5 h-1.5 rounded-full"
              style={{ background: "#fff", border: "1px solid #333" }}
            />
          </div>
        </motion.div>
      )}

      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height}`}
        style={{ overflow: "visible" }}
      >
        {/* Dynamic Shadow */}
        <ellipse
          cx={config.width / 2}
          cy={config.height - 2}
          rx={config.width * 0.35 + (action !== "idle" ? 3 : 0)}
          ry={4 + (action !== "idle" ? 1 : 0)}
          fill="rgba(0,0,0,0.25)"
        />

        {/* Dust/Movement particles when walking */}
        {action !== "idle" && (
          <g opacity={0.4}>
            <circle
              cx={config.width / 2 - 15 - (frame % 4) * 5}
              cy={config.height - 5}
              r={2 - (frame % 4) * 0.3}
              fill="#8B7355"
            />
            <circle
              cx={config.width / 2 + 10 + ((frame + 2) % 4) * 3}
              cy={config.height - 4}
              r={1.5 - ((frame + 2) % 4) * 0.2}
              fill="#A0927B"
            />
          </g>
        )}

        {/* Body rendering based on stage with body sway */}
        <g transform={`translate(${bodySway}, 0)`}>
          {stage === "baby" && <BabyCharacter config={config} action={action} frame={frame} blink={blinkState} />}
          {stage === "toddler" && <ToddlerCharacter config={config} action={action} leftLegAngle={leftLegAngle} rightLegAngle={rightLegAngle} blink={blinkState} headBob={headBob} />}
          {stage === "child" && <ChildCharacter config={config} action={action} leftLegAngle={leftLegAngle} rightLegAngle={rightLegAngle} armSwing={armSwing} blink={blinkState} headBob={headBob} />}
          {stage === "teen" && <TeenCharacter config={config} action={action} leftLegAngle={leftLegAngle} rightLegAngle={rightLegAngle} armSwing={armSwing} blink={blinkState} headBob={headBob} />}
          {stage === "adult" && <AdultCharacter config={config} action={action} leftLegAngle={leftLegAngle} rightLegAngle={rightLegAngle} armSwing={armSwing} blink={blinkState} headBob={headBob} />}
          {stage === "professional" && <ProfessionalCharacter config={config} action={action} leftLegAngle={leftLegAngle} rightLegAngle={rightLegAngle} armSwing={armSwing} blink={blinkState} headBob={headBob} />}
        </g>
      </svg>
    </motion.div>
  );
}

// Stage configurations with more distinct characteristics
function getStageConfig(stage: CharacterStage) {
  const configs = {
    baby: {
      width: 36, height: 36,
      skinColor: "#F5D6BA", hairColor: "#2D1F14",
      shirtColor: "#A8D8EA", pantsColor: "#A8D8EA",
      headSize: 14, bodyHeight: 10, legLength: 6,
      accessory: "pacifier",
    },
    toddler: {
      width: 40, height: 48,
      skinColor: "#F5D6BA", hairColor: "#2D1F14",
      shirtColor: "#FF8C42", pantsColor: "#5C6BC0",
      headSize: 14, bodyHeight: 14, legLength: 12,
      accessory: "crayon",
    },
    child: {
      width: 44, height: 60,
      skinColor: "#F5D6BA", hairColor: "#1F1714",
      shirtColor: "#66BB6A", pantsColor: "#42A5F5",
      headSize: 14, bodyHeight: 18, legLength: 18,
      accessory: "backpack",
    },
    teen: {
      width: 48, height: 72,
      skinColor: "#F5D6BA", hairColor: "#151210",
      shirtColor: "#7E57C2", pantsColor: "#1A1A2E",
      headSize: 14, bodyHeight: 22, legLength: 24,
      accessory: "headphones",
    },
    adult: {
      width: 52, height: 80,
      skinColor: "#F5D6BA", hairColor: "#151210",
      shirtColor: "#EF5350", pantsColor: "#263238",
      headSize: 14, bodyHeight: 24, legLength: 28,
      accessory: "laptop",
    },
    professional: {
      width: 52, height: 80,
      skinColor: "#F5D6BA", hairColor: "#151210",
      shirtColor: "#37474F", pantsColor: "#263238",
      headSize: 14, bodyHeight: 24, legLength: 28,
      accessory: "tablet",
    },
  };
  return configs[stage];
}

// Baby character (crawling) - cute with short wispy hair
function BabyCharacter({ config, action, frame, blink }: { config: ReturnType<typeof getStageConfig>; action: string; frame: number; blink: boolean }) {
  const crawlOffset = action === "crawl" ? Math.sin(frame * Math.PI / 4) * 4 : 0;
  const cx = config.width / 2;
  const headY = 10;

  return (
    <g>
      {/* Short wispy baby hair - straight and visible */}
      <path
        d={`M ${cx - 8} ${headY - 6} 
            L ${cx - 6} ${headY - 12} 
            L ${cx - 3} ${headY - 10}
            L ${cx} ${headY - 13}
            L ${cx + 3} ${headY - 10}
            L ${cx + 6} ${headY - 12}
            L ${cx + 8} ${headY - 6}
            Q ${cx} ${headY - 8} ${cx - 8} ${headY - 6}`}
        fill={config.hairColor}
      />

      {/* Head */}
      <circle cx={cx} cy={headY} r={config.headSize} fill={config.skinColor} />

      {/* Eyes */}
      {blink ? (
        <>
          <line x1={cx - 6} y1={headY - 2} x2={cx - 2} y2={headY - 2} stroke="#000" strokeWidth={1.5} strokeLinecap="round" />
          <line x1={cx + 2} y1={headY - 2} x2={cx + 6} y2={headY - 2} stroke="#000" strokeWidth={1.5} strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={cx - 4} cy={headY - 2} r={3} fill="#000" />
          <circle cx={cx + 4} cy={headY - 2} r={3} fill="#000" />
          <circle cx={cx - 3} cy={headY - 3} r={1.2} fill="#fff" />
          <circle cx={cx + 5} cy={headY - 3} r={1.2} fill="#fff" />
        </>
      )}

      {/* Rosy cheeks */}
      <circle cx={cx - 9} cy={headY + 3} r={4} fill="#FFCDD2" opacity={0.6} />
      <circle cx={cx + 9} cy={headY + 3} r={4} fill="#FFCDD2" opacity={0.6} />

      {/* Cute mouth */}
      <ellipse cx={cx} cy={headY + 6} rx={2} ry={1} fill="#E57373" />

      {/* Body (onesie with star) */}
      <ellipse cx={cx} cy={headY + 16 + crawlOffset} rx={12} ry={10} fill={config.shirtColor} />
      {/* Star decoration on onesie */}
      <polygon points={`${cx},${headY + 12} ${cx + 2},${headY + 16} ${cx + 6},${headY + 16} ${cx + 3},${headY + 19} ${cx + 4},${headY + 23} ${cx},${headY + 20} ${cx - 4},${headY + 23} ${cx - 3},${headY + 19} ${cx - 6},${headY + 16} ${cx - 2},${headY + 16}`} fill="#FFD54F" opacity={0.8} />

      {/* Crawling arms */}
      <ellipse cx={cx - 12 + crawlOffset} cy={headY + 18} rx={5} ry={6} fill={config.skinColor} />
      <ellipse cx={cx + 12 - crawlOffset} cy={headY + 18} rx={5} ry={6} fill={config.skinColor} />
    </g>
  );
}

// Toddler character - energetic with short neat hair and crayon
function ToddlerCharacter({ config, action, leftLegAngle, rightLegAngle, blink, headBob }: { config: ReturnType<typeof getStageConfig>; action: string; leftLegAngle: number; rightLegAngle: number; blink: boolean; headBob: number }) {
  const cx = config.width / 2;
  const headY = 14 - headBob;

  return (
    <g>
      {/* Short straight hair - clearly visible */}
      <rect x={cx - 10} y={headY - 14} width={20} height={10} rx={3} fill={config.hairColor} />
      {/* Hair fringe - straight cut */}
      <path d={`M ${cx - 9} ${headY - 4} L ${cx - 9} ${headY - 8} L ${cx + 9} ${headY - 8} L ${cx + 9} ${headY - 4}`} fill={config.hairColor} />

      {/* Head */}
      <circle cx={cx} cy={headY} r={config.headSize} fill={config.skinColor} />

      {/* Big curious eyes */}
      {blink ? (
        <>
          <path d={`M ${cx - 7} ${headY - 1} Q ${cx - 4} ${headY - 3} ${cx - 1} ${headY - 1}`} fill="none" stroke="#000" strokeWidth={2} />
          <path d={`M ${cx + 1} ${headY - 1} Q ${cx + 4} ${headY - 3} ${cx + 7} ${headY - 1}`} fill="none" stroke="#000" strokeWidth={2} />
        </>
      ) : (
        <>
          <circle cx={cx - 4} cy={headY - 1} r={3.5} fill="#000" />
          <circle cx={cx + 4} cy={headY - 1} r={3.5} fill="#000" />
          <circle cx={cx - 3} cy={headY - 2} r={1.2} fill="#fff" />
          <circle cx={cx + 5} cy={headY - 2} r={1.2} fill="#fff" />
          {/* Star sparkle in eyes */}
          <circle cx={cx - 5} cy={headY} r={0.5} fill="#fff" />
          <circle cx={cx + 3} cy={headY} r={0.5} fill="#fff" />
        </>
      )}

      {/* Wide excited smile */}
      <path d={`M ${cx - 5} ${headY + 4} Q ${cx} ${headY + 9} ${cx + 5} ${headY + 4}`} fill="none" stroke="#000" strokeWidth={2} />

      {/* Body - colorful shirt */}
      <rect x={cx - 9} y={28} width={18} height={config.bodyHeight} rx={4} fill={config.shirtColor} />
      {/* Shirt pattern - circles */}
      <circle cx={cx - 3} cy={34} r={2} fill="#FFE082" opacity={0.7} />
      <circle cx={cx + 4} cy={36} r={2} fill="#81D4FA" opacity={0.7} />

      {/* Arms holding crayon */}
      <ellipse cx={cx - 11} cy={32} rx={5} ry={6} fill={config.skinColor} />
      <ellipse cx={cx + 11} cy={32} rx={5} ry={6} fill={config.skinColor} />
      {/* Crayon in hand */}
      <rect x={cx + 13} y={28} width={8} height={3} rx={1} fill="#FF7043" />
      <polygon points={`${cx + 21},${28} ${cx + 24},${29.5} ${cx + 21},${31}`} fill="#FFE0B2" />

      {/* Legs with shoes */}
      <g transform={`translate(${cx - 5}, 42)`}>
        <rect
          x={-4} y={0} width={8} height={config.legLength} rx={3} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${leftLegAngle}, 0, 0)` : ""}
        />
        <ellipse cx={0} cy={config.legLength + 2} rx={5} ry={3} fill="#F44336" transform={action !== "idle" ? `rotate(${leftLegAngle * 0.3}, 0, -${config.legLength})` : ""} />
      </g>
      <g transform={`translate(${cx + 5}, 42)`}>
        <rect
          x={-4} y={0} width={8} height={config.legLength} rx={3} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${rightLegAngle}, 0, 0)` : ""}
        />
        <ellipse cx={0} cy={config.legLength + 2} rx={5} ry={3} fill="#F44336" transform={action !== "idle" ? `rotate(${rightLegAngle * 0.3}, 0, -${config.legLength})` : ""} />
      </g>
    </g>
  );
}

// Child character - school age with backpack and school-style short hair
function ChildCharacter({ config, action, leftLegAngle, rightLegAngle, armSwing, blink, headBob }: { config: ReturnType<typeof getStageConfig>; action: string; leftLegAngle: number; rightLegAngle: number; armSwing: number; blink: boolean; headBob: number }) {
  const cx = config.width / 2;
  const headY = 14 - headBob;

  return (
    <g>
      {/* Short straight hair - school boy cut */}
      <path d={`M ${cx - 11} ${headY} 
                L ${cx - 11} ${headY - 10}
                Q ${cx - 10} ${headY - 14} ${cx} ${headY - 14}
                Q ${cx + 10} ${headY - 14} ${cx + 11} ${headY - 10}
                L ${cx + 11} ${headY}`}
        fill={config.hairColor} />
      {/* Clean straight fringe */}
      <rect x={cx - 9} y={headY - 6} width={18} height={4} rx={1} fill={config.hairColor} />

      {/* Head */}
      <circle cx={cx} cy={headY} r={config.headSize} fill={config.skinColor} />

      {/* Eyes with curiosity */}
      {blink ? (
        <>
          <line x1={cx - 7} y1={headY - 1} x2={cx - 1} y2={headY - 1} stroke="#000" strokeWidth={2} strokeLinecap="round" />
          <line x1={cx + 1} y1={headY - 1} x2={cx + 7} y2={headY - 1} stroke="#000" strokeWidth={2} strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={cx - 4} cy={headY - 1} r={3} fill="#000" />
          <circle cx={cx + 4} cy={headY - 1} r={3} fill="#000" />
          <circle cx={cx - 3} cy={headY - 2} r={1} fill="#fff" />
          <circle cx={cx + 5} cy={headY - 2} r={1} fill="#fff" />
        </>
      )}

      {/* Friendly grin */}
      <path d={`M ${cx - 4} ${headY + 5} Q ${cx} ${headY + 8} ${cx + 4} ${headY + 5}`} fill="none" stroke="#000" strokeWidth={1.5} />

      {/* Backpack straps visible */}
      <rect x={cx - 10} y={30} width={3} height={16} rx={1} fill="#FF9800" />
      <rect x={cx + 7} y={30} width={3} height={16} rx={1} fill="#FF9800" />

      {/* Body - t-shirt with game controller print */}
      <rect x={cx - 10} y={28} width={20} height={config.bodyHeight} rx={4} fill={config.shirtColor} />
      {/* Game controller icon */}
      <rect x={cx - 4} y={34} width={8} height={5} rx={2} fill="#263238" opacity={0.8} />
      <circle cx={cx - 1} cy={36} r={1} fill="#4CAF50" />
      <circle cx={cx + 3} cy={36} r={1} fill="#F44336" />

      {/* Arms */}
      <g transform={`translate(${cx - 11}, 30)`}>
        <rect
          x={-4} y={0} width={7} height={14} rx={3} fill={config.skinColor}
          transform={action !== "idle" ? `rotate(${-armSwing}, 0, 0)` : ""}
        />
      </g>
      <g transform={`translate(${cx + 11}, 30)`}>
        <rect
          x={-3} y={0} width={7} height={14} rx={3} fill={config.skinColor}
          transform={action !== "idle" ? `rotate(${armSwing}, 0, 0)` : ""}
        />
      </g>

      {/* Legs with sneakers */}
      <g transform={`translate(${cx - 6}, 46)`}>
        <rect
          x={-4} y={0} width={8} height={config.legLength} rx={3} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${leftLegAngle}, 0, 0)` : ""}
        />
        <ellipse cx={0} cy={config.legLength + 2} rx={6} ry={3} fill="#fff" stroke="#42A5F5" strokeWidth={1} />
      </g>
      <g transform={`translate(${cx + 6}, 46)`}>
        <rect
          x={-4} y={0} width={8} height={config.legLength} rx={3} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${rightLegAngle}, 0, 0)` : ""}
        />
        <ellipse cx={0} cy={config.legLength + 2} rx={6} ry={3} fill="#fff" stroke="#42A5F5" strokeWidth={1} />
      </g>
    </g>
  );
}

// Teen character - stylish with headphones and trendy short hair
function TeenCharacter({ config, action, leftLegAngle, rightLegAngle, armSwing, blink, headBob }: { config: ReturnType<typeof getStageConfig>; action: string; leftLegAngle: number; rightLegAngle: number; armSwing: number; blink: boolean; headBob: number }) {
  const cx = config.width / 2;
  const headY = 14 - headBob;

  return (
    <g>
      {/* Stylish short straight hair */}
      <path d={`M ${cx - 12} ${headY + 2} 
                L ${cx - 12} ${headY - 8}
                Q ${cx - 10} ${headY - 14} ${cx} ${headY - 14}
                Q ${cx + 10} ${headY - 14} ${cx + 12} ${headY - 8}
                L ${cx + 12} ${headY + 2}`}
        fill={config.hairColor} />
      {/* Side-swept fringe */}
      <path d={`M ${cx - 10} ${headY - 4} L ${cx + 6} ${headY - 6} L ${cx + 8} ${headY - 4}`} fill={config.hairColor} />

      {/* Headphones */}
      <path d={`M ${cx - 14} ${headY - 2} Q ${cx - 16} ${headY - 12} ${cx} ${headY - 16} Q ${cx + 16} ${headY - 12} ${cx + 14} ${headY - 2}`} fill="none" stroke="#333" strokeWidth={3} />
      <ellipse cx={cx - 14} cy={headY} rx={4} ry={5} fill="#444" />
      <ellipse cx={cx + 14} cy={headY} rx={4} ry={5} fill="#444" />
      <ellipse cx={cx - 14} cy={headY} rx={2.5} ry={3} fill="#666" />
      <ellipse cx={cx + 14} cy={headY} rx={2.5} ry={3} fill="#666" />

      {/* Head */}
      <circle cx={cx} cy={headY} r={config.headSize} fill={config.skinColor} />

      {/* Cool confident eyes */}
      {blink ? (
        <>
          <line x1={cx - 7} y1={headY - 1} x2={cx - 1} y2={headY - 1} stroke="#000" strokeWidth={2} strokeLinecap="round" />
          <line x1={cx + 1} y1={headY - 1} x2={cx + 7} y2={headY - 1} stroke="#000" strokeWidth={2} strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* Slightly narrowed confident eyes */}
          <ellipse cx={cx - 4} cy={headY - 1} rx={3} ry={2.5} fill="#000" />
          <ellipse cx={cx + 4} cy={headY - 1} rx={3} ry={2.5} fill="#000" />
          <circle cx={cx - 3} cy={headY - 1.5} r={1} fill="#fff" />
          <circle cx={cx + 5} cy={headY - 1.5} r={1} fill="#fff" />
        </>
      )}

      {/* Slight smirk */}
      <path d={`M ${cx - 3} ${headY + 5} Q ${cx + 2} ${headY + 7} ${cx + 4} ${headY + 4}`} fill="none" stroke="#000" strokeWidth={1.5} />

      {/* Neck */}
      <rect x={cx - 4} y={28} width={8} height={5} fill={config.skinColor} />

      {/* Body - hoodie with design */}
      <rect x={cx - 12} y={31} width={24} height={config.bodyHeight} rx={4} fill={config.shirtColor} />
      {/* Hood strings */}
      <line x1={cx - 3} y1={32} x2={cx - 2} y2={42} stroke="#5E35B1" strokeWidth={2} />
      <line x1={cx + 3} y1={32} x2={cx + 2} y2={42} stroke="#5E35B1" strokeWidth={2} />
      {/* Logo on hoodie */}
      <text x={cx} y={44} textAnchor="middle" fontSize="6" fill="#B39DDB" fontWeight="bold">{"</>"}</text>

      {/* Hoodie pocket */}
      <rect x={cx - 8} y={46} width={16} height={6} rx={2} fill={config.shirtColor} stroke="#6A3BC5" strokeWidth={1} opacity={0.6} />

      {/* Arms with hoodie sleeves */}
      <g transform={`translate(${cx - 13}, 33)`}>
        <rect
          x={-5} y={0} width={8} height={18} rx={3} fill={config.shirtColor}
          transform={action !== "idle" ? `rotate(${-armSwing}, 0, 0)` : ""}
        />
        <rect
          x={-4} y={16} width={6} height={5} rx={2} fill={config.skinColor}
          transform={action !== "idle" ? `rotate(${-armSwing}, 0, -16)` : ""}
        />
      </g>
      <g transform={`translate(${cx + 13}, 33)`}>
        <rect
          x={-3} y={0} width={8} height={18} rx={3} fill={config.shirtColor}
          transform={action !== "idle" ? `rotate(${armSwing}, 0, 0)` : ""}
        />
        <rect
          x={-2} y={16} width={6} height={5} rx={2} fill={config.skinColor}
          transform={action !== "idle" ? `rotate(${armSwing}, 0, -16)` : ""}
        />
      </g>

      {/* Legs - slim jeans */}
      <g transform={`translate(${cx - 6}, 53)`}>
        <rect
          x={-5} y={0} width={9} height={config.legLength} rx={3} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${leftLegAngle}, 0, 0)` : ""}
        />
        <ellipse cx={0} cy={config.legLength + 2} rx={6} ry={4} fill="#fff" />
        <line x1={-4} y1={config.legLength + 2} x2={4} y2={config.legLength + 2} stroke="#E0E0E0" strokeWidth={1} />
      </g>
      <g transform={`translate(${cx + 6}, 53)`}>
        <rect
          x={-4} y={0} width={9} height={config.legLength} rx={3} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${rightLegAngle}, 0, 0)` : ""}
        />
        <ellipse cx={0} cy={config.legLength + 2} rx={6} ry={4} fill="#fff" />
        <line x1={-4} y1={config.legLength + 2} x2={4} y2={config.legLength + 2} stroke="#E0E0E0" strokeWidth={1} />
      </g>
    </g>
  );
}

// Adult character - professional casual with laptop
function AdultCharacter({ config, action, leftLegAngle, rightLegAngle, armSwing, blink, headBob }: { config: ReturnType<typeof getStageConfig>; action: string; leftLegAngle: number; rightLegAngle: number; armSwing: number; blink: boolean; headBob: number }) {
  const cx = config.width / 2;
  const headY = 14 - headBob;

  return (
    <g>
      {/* Clean short professional hair */}
      <path d={`M ${cx - 12} ${headY + 3} 
                L ${cx - 12} ${headY - 8}
                Q ${cx - 10} ${headY - 13} ${cx} ${headY - 13}
                Q ${cx + 10} ${headY - 13} ${cx + 12} ${headY - 8}
                L ${cx + 12} ${headY + 3}`}
        fill={config.hairColor} />
      {/* Neat parted fringe */}
      <path d={`M ${cx - 10} ${headY - 5} L ${cx - 2} ${headY - 6} L ${cx + 10} ${headY - 5}`} fill={config.hairColor} />

      {/* Head */}
      <circle cx={cx} cy={headY} r={config.headSize} fill={config.skinColor} />

      {/* Focused eyes */}
      {blink ? (
        <>
          <line x1={cx - 7} y1={headY - 1} x2={cx - 1} y2={headY - 1} stroke="#000" strokeWidth={2} strokeLinecap="round" />
          <line x1={cx + 1} y1={headY - 1} x2={cx + 7} y2={headY - 1} stroke="#000" strokeWidth={2} strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={cx - 4} cy={headY - 1} r={2.8} fill="#000" />
          <circle cx={cx + 4} cy={headY - 1} r={2.8} fill="#000" />
          <circle cx={cx - 3} cy={headY - 2} r={1} fill="#fff" />
          <circle cx={cx + 5} cy={headY - 2} r={1} fill="#fff" />
        </>
      )}

      {/* Determined smile */}
      <path d={`M ${cx - 4} ${headY + 5} Q ${cx} ${headY + 7} ${cx + 4} ${headY + 5}`} fill="none" stroke="#000" strokeWidth={1.5} />

      {/* Neck */}
      <rect x={cx - 4} y={28} width={8} height={5} fill={config.skinColor} />

      {/* Body - casual t-shirt */}
      <rect x={cx - 13} y={31} width={26} height={config.bodyHeight} rx={4} fill={config.shirtColor} />
      {/* Creative logo/design on shirt */}
      <circle cx={cx} cy={40} r={5} fill="none" stroke="#FFCA28" strokeWidth={2} />
      <circle cx={cx} cy={40} r={2} fill="#FFCA28" />

      {/* Messenger bag strap */}
      <line x1={cx - 10} y1={32} x2={cx + 10} y2={52} stroke="#5D4037" strokeWidth={4} />
      <line x1={cx - 10} y1={32} x2={cx + 10} y2={52} stroke="#8D6E63" strokeWidth={2} />

      {/* Arms */}
      <g transform={`translate(${cx - 14}, 33)`}>
        <rect
          x={-5} y={0} width={8} height={20} rx={3} fill={config.shirtColor}
          transform={action !== "idle" ? `rotate(${-armSwing}, 0, 0)` : ""}
        />
        <rect
          x={-4} y={18} width={6} height={6} rx={2} fill={config.skinColor}
          transform={action !== "idle" ? `rotate(${-armSwing}, 0, -18)` : ""}
        />
      </g>
      <g transform={`translate(${cx + 14}, 33)`}>
        <rect
          x={-3} y={0} width={8} height={20} rx={3} fill={config.shirtColor}
          transform={action !== "idle" ? `rotate(${armSwing}, 0, 0)` : ""}
        />
        <rect
          x={-2} y={18} width={6} height={6} rx={2} fill={config.skinColor}
          transform={action !== "idle" ? `rotate(${armSwing}, 0, -18)` : ""}
        />
      </g>

      {/* Legs - casual pants */}
      <g transform={`translate(${cx - 7}, 55)`}>
        <rect
          x={-5} y={0} width={10} height={config.legLength} rx={3} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${leftLegAngle}, 0, 0)` : ""}
        />
        <ellipse cx={0} cy={config.legLength + 2} rx={7} ry={4} fill="#455A64" />
      </g>
      <g transform={`translate(${cx + 7}, 55)`}>
        <rect
          x={-5} y={0} width={10} height={config.legLength} rx={3} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${rightLegAngle}, 0, 0)` : ""}
        />
        <ellipse cx={0} cy={config.legLength + 2} rx={7} ry={4} fill="#455A64" />
      </g>
    </g>
  );
}

// Professional character - creative professional with tablet/sketchbook
function ProfessionalCharacter({ config, action, leftLegAngle, rightLegAngle, armSwing, blink, headBob }: { config: ReturnType<typeof getStageConfig>; action: string; leftLegAngle: number; rightLegAngle: number; armSwing: number; blink: boolean; headBob: number }) {
  const cx = config.width / 2;
  const headY = 14 - headBob;

  return (
    <g>
      {/* Clean professional short hair */}
      <path d={`M ${cx - 12} ${headY + 3} 
                L ${cx - 12} ${headY - 8}
                Q ${cx - 10} ${headY - 13} ${cx} ${headY - 13}
                Q ${cx + 10} ${headY - 13} ${cx + 12} ${headY - 8}
                L ${cx + 12} ${headY + 3}`}
        fill={config.hairColor} />
      {/* Styled professional fringe */}
      <path d={`M ${cx - 10} ${headY - 5} L ${cx} ${headY - 7} L ${cx + 10} ${headY - 5}`} fill={config.hairColor} />

      {/* Head */}
      <circle cx={cx} cy={headY} r={config.headSize} fill={config.skinColor} />

      {/* Confident professional eyes */}
      {blink ? (
        <>
          <line x1={cx - 7} y1={headY - 1} x2={cx - 1} y2={headY - 1} stroke="#000" strokeWidth={2} strokeLinecap="round" />
          <line x1={cx + 1} y1={headY - 1} x2={cx + 7} y2={headY - 1} stroke="#000" strokeWidth={2} strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={cx - 4} cy={headY - 1} r={2.8} fill="#000" />
          <circle cx={cx + 4} cy={headY - 1} r={2.8} fill="#000" />
          <circle cx={cx - 3} cy={headY - 2} r={1} fill="#fff" />
          <circle cx={cx + 5} cy={headY - 2} r={1} fill="#fff" />
        </>
      )}

      {/* Warm confident smile */}
      <path d={`M ${cx - 4} ${headY + 4} Q ${cx} ${headY + 8} ${cx + 4} ${headY + 4}`} fill="none" stroke="#000" strokeWidth={1.5} />

      {/* Neck */}
      <rect x={cx - 4} y={28} width={8} height={5} fill={config.skinColor} />

      {/* Collar (open collar shirt - creative casual) */}
      <polygon points={`${cx - 8},31 ${cx},38 ${cx + 8},31`} fill="#ECEFF1" />
      <line x1={cx} y1={32} x2={cx} y2={38} stroke="#CFD8DC" strokeWidth={1} />

      {/* Body - open collar shirt/light jacket */}
      <rect x={cx - 13} y={31} width={26} height={config.bodyHeight} rx={4} fill={config.shirtColor} />
      {/* Inner shirt visible */}
      <path d={`M ${cx - 6} ${35} L ${cx} ${45} L ${cx + 6} ${35}`} fill="#ECEFF1" />

      {/* Badge/ID on lanyard */}
      <line x1={cx} y1={32} x2={cx} y2={50} stroke="#00ACC1" strokeWidth={2} />
      <rect x={cx - 4} y={48} width={8} height={10} rx={1} fill="#fff" stroke="#00ACC1" strokeWidth={1} />
      <rect x={cx - 2} y={50} width={4} height={4} fill="#E0E0E0" />
      <line x1={cx - 2} y1={56} x2={cx + 2} y2={56} stroke="#BDBDBD" strokeWidth={1} />

      {/* Tablet/iPad under arm when idle, or swinging */}
      {action === "idle" && (
        <>
          <rect x={cx + 14} y={40} width={10} height={14} rx={2} fill="#263238" />
          <rect x={cx + 15} y={41} width={8} height={11} rx={1} fill="#4DD0E1" />
        </>
      )}

      {/* Arms */}
      <g transform={`translate(${cx - 14}, 33)`}>
        <rect
          x={-5} y={0} width={8} height={20} rx={3} fill={config.shirtColor}
          transform={action !== "idle" ? `rotate(${-armSwing}, 0, 0)` : ""}
        />
        <rect
          x={-4} y={18} width={6} height={6} rx={2} fill={config.skinColor}
          transform={action !== "idle" ? `rotate(${-armSwing}, 0, -18)` : ""}
        />
      </g>
      <g transform={`translate(${cx + 14}, 33)`}>
        <rect
          x={-3} y={0} width={8} height={20} rx={3} fill={config.shirtColor}
          transform={action !== "idle" ? `rotate(${armSwing}, 0, 0)` : ""}
        />
        <rect
          x={-2} y={18} width={6} height={6} rx={2} fill={config.skinColor}
          transform={action !== "idle" ? `rotate(${armSwing}, 0, -18)` : ""}
        />
      </g>

      {/* Legs - professional casual pants */}
      <g transform={`translate(${cx - 7}, 55)`}>
        <rect
          x={-5} y={0} width={10} height={config.legLength} rx={3} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${leftLegAngle}, 0, 0)` : ""}
        />
        <ellipse cx={0} cy={config.legLength + 2} rx={7} ry={4} fill="#1A1A2E" />
      </g>
      <g transform={`translate(${cx + 7}, 55)`}>
        <rect
          x={-5} y={0} width={10} height={config.legLength} rx={3} fill={config.pantsColor}
          transform={action !== "idle" ? `rotate(${rightLegAngle}, 0, 0)` : ""}
        />
        <ellipse cx={0} cy={config.legLength + 2} rx={7} ry={4} fill="#1A1A2E" />
      </g>
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
