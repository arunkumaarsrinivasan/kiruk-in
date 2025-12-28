"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface LifeEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  location?: string;
  period?: string;
  details?: string;
  tags?: string[];
  icon?: string;
}

interface LevelBackgroundProps {
  year: number;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
  playerX?: number;      // Player's world position for scrolling
  worldWidth?: number;   // Total world width
  event?: LifeEvent;     // Full event data for story display
  levelProgress?: number; // Level progress 0-1
  activeCheckpoint?: number | null; // Current checkpoint index for highlighting
  visitedCheckpoints?: Set<number>; // Track which checkpoints have been visited
}

const GRID_SIZE = 20;

// Time Machine Design System Background - Dark, Grid-based, Minimal
export function LevelBackground({ 
  year, 
  title, 
  description, 
  children, 
  className,
  playerX = 0,
  worldWidth = 2000,
  event,
  levelProgress = 0,
  activeCheckpoint = null,
  visitedCheckpoints = new Set(),
}: LevelBackgroundProps) {
  // Camera offset - player stays centered, world scrolls
  const cameraOffset = Math.max(0, playerX - 400);
  
  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        backgroundColor: "var(--bg-main)",
        imageRendering: "pixelated",
      }}
    >
      {/* Grid Background - Time Machine Style */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          opacity: 0.3,
        }}
      />
      
      {/* Scanlines effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
        }}
      />
      
      {/* World Container - Scrolls based on player position */}
      <div 
        className="absolute inset-0"
        style={{
          transform: `translateX(${-cameraOffset}px)`,
          transition: "transform 0.05s linear",
        }}
      >
        {/* Ground Grid Pattern */}
        <div 
          className="absolute bottom-0 left-0 h-16"
          style={{ 
            width: worldWidth + 800,
            backgroundColor: "var(--bg-card)",
            borderTop: "2px solid var(--border-color)",
          }}
        >
          {/* Grid lines on ground */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
              `,
              backgroundSize: `${GRID_SIZE * 2}px ${GRID_SIZE}px`,
              opacity: 0.5,
            }}
          />
          
          {/* Distance markers */}
          {Array.from({ length: Math.ceil(worldWidth / 200) + 1 }).map((_, i) => (
            <div
              key={i}
              className="absolute bottom-full mb-1 font-mono text-[8px] opacity-40"
              style={{ 
                left: i * 200,
                color: "var(--text-muted)",
              }}
            >
              {i * 200}px
            </div>
          ))}
        </div>
        
        {/* Pixel scenery elements based on era */}
        <PixelScenery year={year} worldWidth={worldWidth} />
        
        {/* Checkpoint markers */}
        {[0.25, 0.5, 0.75].map((ratio, index) => (
          <div 
            key={`checkpoint-${index}`}
            className="absolute bottom-16"
            style={{ left: worldWidth * ratio - 30 }}
          >
            <div className="flex flex-col items-center">
              <div 
                className="px-2 py-1 font-mono text-[10px] font-bold mb-1 opacity-60"
                style={{
                  backgroundColor: "var(--bg-card)",
                  color: "var(--accent-color)",
                  border: "1px solid var(--border-color)",
                }}
              >
                CHECKPOINT
              </div>
              <div 
                className="w-1 h-12"
                style={{ backgroundColor: "var(--accent-color)", opacity: 0.4 }}
              />
              <div 
                className="w-6 h-1"
                style={{ backgroundColor: "var(--accent-color)", opacity: 0.4 }}
              />
            </div>
          </div>
        ))}
        
        {/* Goal marker at end */}
        <div 
          className="absolute bottom-16"
          style={{ left: worldWidth - 60 }}
        >
          <div className="flex flex-col items-center">
            <div 
              className="px-3 py-1 font-mono text-xs font-bold mb-2"
              style={{
                backgroundColor: "var(--accent-color)",
                color: "var(--bg-main)",
              }}
            >
              GOAL
            </div>
            <div 
              className="w-1 h-20"
              style={{ backgroundColor: "var(--accent-color)" }}
            />
            <div 
              className="w-8 h-2"
              style={{ backgroundColor: "var(--accent-color)" }}
            />
          </div>
        </div>
      </div>
      
      {/* Fixed UI Elements */}
      {/* Level info overlay - Time Machine Style - Top Right */}
      <div className="absolute top-20 right-4 z-30 pointer-events-none">
        <motion.div
          className="px-4 py-3 font-mono wireframe-border"
          style={{ 
            borderWidth: "var(--border-width)",
            borderColor: "var(--border-color)",
            backgroundColor: "var(--bg-card)",
            boxShadow: "var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)",
          }}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div 
            className="text-2xl font-bold"
            style={{ color: "var(--accent-color)" }}
          >
            {year}
          </div>
          <div 
            className="text-sm opacity-80"
            style={{ color: "var(--text-main)" }}
          >
            {title}
          </div>
          <div 
            className="text-[10px] mt-1 opacity-50 uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            LEVEL_{String(year).slice(-2)}
          </div>
        </motion.div>
      </div>
      
      {/* Gaming-style Progress Bar - Top Center, below nav */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none max-w-2xl w-[calc(100%-2rem)] px-4">
        <div className="mb-2">
          <div className="h-4 relative overflow-hidden wireframe-border" style={{
            borderWidth: "var(--border-width)",
            borderColor: "var(--border-color)",
            backgroundColor: "var(--bg-main)",
            boxShadow: "var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)",
          }}>
            {/* Animated progress fill */}
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 via-yellow-400 to-green-500"
              style={{ 
                width: `${levelProgress * 100}%`,
                backgroundSize: "200% 100%",
              }}
              initial={{ width: 0 }}
              animate={{ 
                width: `${levelProgress * 100}%`,
                backgroundPosition: ["0% 0%", "100% 0%"],
              }}
              transition={{ 
                width: { duration: 0.3, ease: "easeOut" },
              }}
            >
            </motion.div>
            {/* Progress percentage overlay */}
            {levelProgress > 0.1 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-xs font-bold text-white drop-shadow-[0_0_3px_rgba(0,0,0,0.9)]">
                  {Math.round(levelProgress * 100)}%
                </span>
              </div>
            )}
          </div>
          {/* Progress labels */}
          <div className="flex justify-between mt-1.5 font-mono text-xs font-bold" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1.5">
              <span className="text-green-500 text-sm">●</span>
              <span>START</span>
            </span>
            <span className="text-yellow-400 px-2 py-0.5 border border-yellow-400/30 bg-yellow-400/10">
              {Math.round(levelProgress * 100)}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-xl leading-none">🏁</span>
              <span>GOAL</span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Checkpoint Story Blocks - Large, Highlighted, In-World */}
      {event && (
        <CheckpointStoryBlocks
          event={event}
          worldWidth={worldWidth}
          playerX={playerX}
          cameraOffset={cameraOffset}
          activeCheckpoint={activeCheckpoint}
          visitedCheckpoints={visitedCheckpoints}
        />
      )}
      
      {children}
    </div>
  );
}

// Pixel scenery using grid-based design
function PixelScenery({ year, worldWidth }: { year: number; worldWidth: number }) {
  const elementCount = Math.ceil(worldWidth / 300);
  
  return (
    <>
      {Array.from({ length: elementCount }).map((_, i) => (
        <div key={i} className="absolute bottom-16" style={{ left: 200 + i * 300 }}>
          <PixelElement year={year} variant={i % 4} />
        </div>
      ))}
    </>
  );
}

// Pixel art elements matching time machine grid aesthetic
function PixelElement({ year, variant }: { year: number; variant: number }) {
  const pixelSize = GRID_SIZE / 4; // 5px pixels
  
  // Different elements based on era
  if (year <= 2010) {
    // Early years - simple geometric shapes
    return (
      <div className="flex flex-col items-center">
        {variant % 2 === 0 ? (
          // Simple tree/plant
          <div 
            className="grid"
            style={{ 
              gridTemplateColumns: `repeat(5, ${pixelSize}px)`,
            }}
          >
            {[
              ["", "", "■", "", ""],
              ["", "■", "■", "■", ""],
              ["■", "■", "■", "■", "■"],
              ["", "", "█", "", ""],
              ["", "", "█", "", ""],
            ].flat().map((c, idx) => (
              <div
                key={idx}
                style={{
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: c === "■" ? "var(--accent-color)" : c === "█" ? "var(--border-color)" : "transparent",
                  opacity: c ? 0.6 : 0,
                }}
              />
            ))}
          </div>
        ) : (
          // Simple box/building
          <div 
            style={{
              width: pixelSize * 4,
              height: pixelSize * 6,
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div 
              style={{
                width: pixelSize * 2,
                height: pixelSize * 2,
                margin: pixelSize / 2,
                backgroundColor: "var(--accent-color)",
                opacity: 0.5,
              }}
            />
          </div>
        )}
      </div>
    );
  } else if (year <= 2020) {
    // Middle years - more complex
    return (
      <div className="flex flex-col items-center">
        {variant % 3 === 0 ? (
          // Lamp post
          <div className="flex flex-col items-center">
            <div 
              style={{
                width: pixelSize * 3,
                height: pixelSize * 2,
                backgroundColor: "var(--accent-color)",
                opacity: 0.8,
              }}
            />
            <div 
              style={{
                width: pixelSize,
                height: pixelSize * 8,
                backgroundColor: "var(--border-color)",
              }}
            />
          </div>
        ) : variant % 3 === 1 ? (
          // Building
          <div 
            style={{
              width: pixelSize * 6,
              height: pixelSize * 10,
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              display: "grid",
              gridTemplateColumns: `repeat(2, 1fr)`,
              gridTemplateRows: `repeat(3, 1fr)`,
              gap: pixelSize / 2,
              padding: pixelSize / 2,
            }}
          >
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: idx % 2 === 0 ? "var(--accent-color)" : "var(--text-muted)",
                  opacity: 0.4,
                }}
              />
            ))}
          </div>
        ) : (
          // Sign
          <div className="flex flex-col items-center">
            <div 
              className="px-2 py-1 font-mono text-[6px] font-bold"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                color: "var(--text-muted)",
              }}
            >
              {year}
            </div>
            <div 
              style={{
                width: pixelSize / 2,
                height: pixelSize * 3,
                backgroundColor: "var(--border-color)",
              }}
            />
          </div>
        )}
      </div>
    );
  } else {
    // Modern years - tech inspired
    return (
      <div className="flex flex-col items-center">
        {variant % 4 === 0 ? (
          // Server rack
          <div 
            style={{
              width: pixelSize * 5,
              height: pixelSize * 12,
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
              gap: 1,
              padding: 2,
            }}
          >
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1"
                style={{ flex: 1 }}
              >
                <motion.div
                  style={{
                    width: 3,
                    height: 3,
                    backgroundColor: "var(--accent-color)",
                    borderRadius: "50%",
                  }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: idx * 0.2 }}
                />
                <div 
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: "var(--border-color)",
                    opacity: 0.5,
                  }}
                />
              </div>
            ))}
          </div>
        ) : variant % 4 === 1 ? (
          // Tall building
          <div 
            style={{
              width: pixelSize * 4,
              height: pixelSize * 16,
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--accent-color)",
              opacity: 0.8,
            }}
          >
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: "100%",
                  height: pixelSize * 2,
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div 
                  style={{
                    width: pixelSize,
                    height: pixelSize,
                    backgroundColor: idx % 2 === 0 ? "var(--accent-color)" : "transparent",
                    opacity: 0.5,
                  }}
                />
              </div>
            ))}
          </div>
        ) : variant % 4 === 2 ? (
          // Antenna
          <div className="flex flex-col items-center">
            <motion.div
              style={{
                width: pixelSize * 2,
                height: pixelSize * 2,
                backgroundColor: "var(--accent-color)",
                borderRadius: "50%",
                opacity: 0.7,
              }}
            />
            <div 
              style={{
                width: 1,
                height: pixelSize * 10,
                backgroundColor: "var(--border-color)",
              }}
            />
          </div>
        ) : (
          // Monitor/Screen
          <div 
            style={{
              width: pixelSize * 8,
              height: pixelSize * 6,
              backgroundColor: "var(--bg-card)",
              border: "2px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="font-mono text-[6px]"
              style={{ color: "var(--accent-color)", opacity: 0.7 }}
            >
              {">_"}
            </div>
          </div>
        )}
      </div>
    );
  }
}

// Checkpoint Story Blocks - Large, Highlighted, In-World
function CheckpointStoryBlocks({
  event,
  worldWidth,
  playerX,
  cameraOffset,
  activeCheckpoint,
  visitedCheckpoints,
}: {
  event: LifeEvent;
  worldWidth: number;
  playerX: number;
  cameraOffset: number;
  activeCheckpoint: number | null;
  visitedCheckpoints: Set<number>;
}) {
  // Checkpoint positions
  const checkpointPositions = [
    worldWidth * 0.25,
    worldWidth * 0.5,
    worldWidth * 0.75,
  ];

  // Different story segments for each checkpoint
  const checkpointContent = [
    {
      title: event.title,
      subtitle: event.location || `${event.year}`,
      content: event.description,
      icon: event.icon || "📖",
    },
    {
      title: "The Journey",
      subtitle: event.period || `${event.year}`,
      content: event.details || event.description,
      icon: "🗺️",
    },
    {
      title: "Key Moments",
      subtitle: event.tags?.join(" • ") || "Milestones",
      content: event.details || event.description,
      icon: "⭐",
      tags: event.tags,
    },
  ];

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        transform: `translateX(${-cameraOffset}px)`,
        transition: "transform 0.05s linear",
      }}
    >
      {checkpointPositions.map((position, index) => {
        const content = checkpointContent[index];
        const distance = Math.abs(playerX - position);
        const isActive = activeCheckpoint === index;
        const isVisited = visitedCheckpoints.has(index);
        const isNear = distance < 300; // Show when within 300px
        
        // Scale and opacity based on proximity and active state
        // Keep visible even after visiting, but with reduced opacity
        const scale = isActive ? 1.05 : isNear ? 1 : 0.95;
        let opacity = 0;
        if (isActive) {
          opacity = 1; // Fully visible when active
        } else if (isNear) {
          opacity = 0.9; // High opacity when near
        } else if (isVisited) {
          opacity = 0.4; // Reduced but visible after passing
        } else {
          opacity = 0.3; // Low opacity when far and not visited
        }
        const highlight = isActive;

        return (
          <motion.div
            key={`checkpoint-block-${index}`}
            className="absolute pointer-events-auto"
            style={{
              left: position,
              top: "15%",
              transform: `translateX(-50%) scale(${scale})`,
              opacity: opacity,
              zIndex: isActive ? 30 : 20,
              imageRendering: "pixelated" as any,
            }}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{
              opacity: opacity,
              y: 0,
              scale: scale,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Large Story Block - Pixel/Grid Style */}
            <div
              className="relative max-w-md w-[320px]"
              style={{
                backgroundColor: highlight ? "var(--bg-card)" : "var(--bg-main)",
                border: `${GRID_SIZE / 4}px solid ${highlight ? "var(--accent-color)" : "var(--border-color)"}`,
                imageRendering: "pixelated" as any,
              }}
            >
              {/* Grid pattern overlay - very minimal opacity */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(var(--border-color) 1px, transparent 1px),
                    linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
                  `,
                  backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                  opacity: 0.08, // Very minimal grid opacity
                  imageRendering: "pixelated" as any,
                }}
              />
              {/* Header - Pixel Grid Style */}
              <div
                className="p-4"
                style={{
                  borderBottom: `${GRID_SIZE / 4}px solid ${highlight ? "var(--accent-color)" : "var(--border-color)"}`,
                  backgroundColor: highlight ? "var(--bg-card)" : "transparent",
                  imageRendering: "pixelated" as any,
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">{content.icon}</div>
                  <div className="flex-1">
                    <h3
                      className="text-xl md:text-2xl font-bold font-mono mb-1"
                      style={{ 
                        color: highlight ? "var(--accent-color)" : "var(--text-main)",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                      }}
                    >
                      {content.title}
                    </h3>
                    <div
                      className="text-sm font-mono font-semibold"
                      style={{ 
                        color: "var(--text-main)",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                      }}
                    >
                      {content.subtitle}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div 
                className="p-4 relative z-10" 
                style={{ 
                  backgroundColor: highlight ? "var(--bg-card)" : "var(--bg-main)",
                  opacity: 1,
                }}
              >
                <p
                  className="text-sm md:text-base leading-relaxed font-mono font-bold"
                  style={{ 
                    color: "var(--text-main)",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                  }}
                >
                  {content.content}
                </p>

                {/* Tags for checkpoint 2 - Pixel Style */}
                {index === 2 && content.tags && content.tags.length > 0 && (
                  <div 
                    className="mt-3 pt-3" 
                    style={{ 
                      borderTop: `${GRID_SIZE / 4}px solid var(--border-color)`,
                      imageRendering: "pixelated" as any,
                    }}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {content.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[10px] font-mono"
                          style={{
                            backgroundColor: "var(--bg-main)",
                            border: `${GRID_SIZE / 4}px solid var(--border-color)`,
                            color: "var(--text-main)",
                            imageRendering: "pixelated" as any,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Pixel Grid Highlight Border when active */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    border: `${GRID_SIZE / 2}px solid var(--accent-color)`,
                    imageRendering: "pixelated" as any,
                  }}
                  animate={{
                    borderWidth: [`${GRID_SIZE / 2}px`, `${GRID_SIZE}px`, `${GRID_SIZE / 2}px`],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
