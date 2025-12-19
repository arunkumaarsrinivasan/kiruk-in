"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface LevelBackgroundProps {
  year: number;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
  playerX?: number;      // Player's world position for scrolling
  worldWidth?: number;   // Total world width
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
        
        {/* Goal marker at end */}
        <div 
          className="absolute bottom-16"
          style={{ left: worldWidth - 60 }}
        >
          <motion.div
            className="flex flex-col items-center"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
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
          </motion.div>
        </div>
      </div>
      
      {/* Fixed UI Elements */}
      {/* Level info overlay - Time Machine Style */}
      <div className="absolute top-6 left-4 z-20 pointer-events-none">
        <div
          className="px-4 py-3 font-mono"
          style={{ 
            backgroundColor: "var(--bg-card)",
            border: "2px solid var(--border-color)",
          }}
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
        </div>
      </div>
      
      {/* Description card */}
      <div className="absolute bottom-20 left-4 right-4 z-20 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-3 text-sm max-w-md font-mono"
          style={{ 
            backgroundColor: "var(--bg-card)",
            border: "2px solid var(--border-color)",
            color: "var(--text-main)",
          }}
        >
          {description}
        </motion.div>
      </div>
      
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
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
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
            <motion.div
              className="font-mono text-[6px]"
              style={{ color: "var(--accent-color)" }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {">_"}
            </motion.div>
          </div>
        )}
      </div>
    );
  }
}
