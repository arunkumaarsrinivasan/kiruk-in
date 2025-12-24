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
      
      {/* Dynamic Story Elements in Game World */}
      {event && (
        <StoryElementsInWorld 
          event={event} 
          worldWidth={worldWidth}
          playerX={playerX}
          cameraOffset={cameraOffset}
        />
      )}
      
      {children}
    </div>
  );
}

// Dynamic Story Elements in Game World
function StoryElementsInWorld({ 
  event, 
  worldWidth, 
  playerX, 
  cameraOffset 
}: { 
  event: LifeEvent; 
  worldWidth: number; 
  playerX: number;
  cameraOffset: number;
}) {
  // Calculate story segment positions (distributed across the level)
  const storySegments = [
    { type: 'header', position: worldWidth * 0.2, delay: 0, y: '15%' },
    { type: 'description', position: worldWidth * 0.4, delay: 0.1, y: '25%' },
    { type: 'details', position: worldWidth * 0.6, delay: 0.2, y: '20%' },
    { type: 'tags', position: worldWidth * 0.8, delay: 0.3, y: '30%' },
  ];

  // Check if player is near a story segment (within 400px)
  const isNearSegment = (position: number) => {
    return Math.abs(playerX - position) < 400;
  };

  return (
    <>
      {/* Themed Background Elements - Fixed to world */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translateX(${-cameraOffset}px)`,
          transition: "transform 0.05s linear",
        }}
      >
        <ThemedBackgroundElements event={event} worldWidth={worldWidth} playerX={playerX} />
      </div>
      
      {/* Story Cards positioned in world - Scrolls with camera */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translateX(${-cameraOffset}px)`,
          transition: "transform 0.05s linear",
        }}
      >
        {storySegments.map((segment, index) => {
          const distance = Math.abs(playerX - segment.position);
          const isVisible = distance < 600;
          const opacity = isNearSegment(segment.position) 
            ? Math.max(0.9, 1 - distance / 600)
            : Math.max(0.3, 0.8 - distance / 600);
          const scale = isNearSegment(segment.position) ? 1 : 0.9;
          
          return (
            <motion.div
              key={segment.type}
              className="absolute"
              style={{
                left: segment.position,
                top: segment.y,
                transform: `translateX(-50%) scale(${scale})`,
                opacity: isVisible ? opacity : 0,
                zIndex: 20,
              }}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ 
                opacity: isVisible ? opacity : 0,
                y: isVisible ? 0 : 30,
                scale: isVisible ? scale : 0.8,
              }}
              transition={{ delay: segment.delay, duration: 0.6, ease: "easeOut" }}
            >
              <StoryCard segment={segment} event={event} />
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

// Individual Story Card Component
function StoryCard({ segment, event }: { segment: { type: string; position: number; delay: number }; event: LifeEvent }) {
  const cardStyle = {
    backgroundColor: "var(--bg-card)",
    color: "var(--text-main)",
    border: "3px solid var(--border-color)",
    boxShadow: "4px 4px 0 var(--border-color)",
  };

  switch (segment.type) {
    case 'header':
      return (
        <div className="p-4 font-mono max-w-xs" style={cardStyle}>
          <div className="flex items-center gap-3 mb-2">
            {event.icon && <span className="text-3xl">{event.icon}</span>}
            <div>
              <div className="text-sm font-bold">{event.title}</div>
              {event.location && (
                <div className="text-[10px] opacity-70 mt-1">
                  📍 {event.location}
                </div>
              )}
              {event.period && (
                <div className="text-[10px] opacity-70">
                  🗓️ {event.period}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    
    case 'description':
      return (
        <div className="p-4 font-mono max-w-sm" style={cardStyle}>
          <p className="text-sm leading-relaxed">
            {event.description}
          </p>
        </div>
      );
    
    case 'details':
      return event.details ? (
        <div className="p-4 font-mono max-w-sm" style={{ ...cardStyle, backgroundColor: "var(--bg-main)", border: "2px dashed var(--border-color)" }}>
          <div className="flex items-start gap-2">
            <span className="text-lg">💭</span>
            <p className="text-xs italic leading-relaxed">
              {event.details}
            </p>
          </div>
        </div>
      ) : null;
    
    case 'tags':
      return event.tags && event.tags.length > 0 ? (
        <div className="p-3 font-mono" style={cardStyle}>
          <div className="text-[10px] opacity-60 mb-2 uppercase">Tags</div>
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-black text-white text-[10px] border border-black"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null;
    
    default:
      return null;
  }
}

// Themed Background Elements
function ThemedBackgroundElements({ event, worldWidth, playerX }: { event: LifeEvent; worldWidth: number; playerX: number }) {
  // Create themed elements based on event content
  const themeElements = [];
  const elementCount = Math.ceil(worldWidth / 400);
  
  // Add floating icons throughout the level
  for (let i = 0; i < elementCount; i++) {
    const position = (worldWidth / elementCount) * i + 200;
    themeElements.push({ position, index: i });
  }

  return (
    <>
      {/* Floating themed icons/elements */}
      {themeElements.map((element) => {
        const distance = Math.abs(playerX - element.position);
        const opacity = Math.max(0.1, 0.3 - distance / 1000);
        
        return (
          <motion.div
            key={element.index}
            className="absolute pointer-events-none"
            style={{
              left: element.position,
              top: `${20 + (element.index % 3) * 25}%`,
              opacity: opacity,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 3, -3, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + (element.index % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: element.index * 0.2,
            }}
          >
            <div className="text-3xl filter blur-[0.5px]">{event.icon}</div>
          </motion.div>
        );
      })}
      
      {/* Background pattern based on year/theme - More engaging */}
      {event.year <= 2010 && (
        <>
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, var(--accent-color) 0%, transparent 50%), radial-gradient(circle at 80% 50%, var(--accent-color) 0%, transparent 50%)",
            }}
          />
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{
              backgroundImage: "repeating-linear-gradient(30deg, transparent, transparent 100px, var(--accent-color) 100px, var(--accent-color) 101px)",
            }}
          />
        </>
      )}
      
      {event.year > 2010 && event.year <= 2020 && (
        <>
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(45deg, transparent 30%, var(--accent-color) 30%, var(--accent-color) 35%, transparent 35%, transparent 65%, var(--accent-color) 65%, var(--accent-color) 70%, transparent 70%)",
              backgroundSize: "60px 60px",
            }}
          />
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, var(--accent-color), var(--accent-color) 1px, transparent 1px, transparent 20px)",
            }}
          />
        </>
      )}
      
      {event.year > 2020 && (
        <>
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, var(--accent-color) 2px, var(--accent-color) 4px)",
            }}
          />
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{
              backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, var(--accent-color) 2px, var(--accent-color) 4px)",
            }}
          />
        </>
      )}
      
      {/* Dynamic particles based on player position */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = (worldWidth / 20) * i;
        const distance = Math.abs(playerX - x);
        const opacity = Math.max(0, 0.1 - distance / 800);
        
        return (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: x,
              top: `${30 + (i % 5) * 15}%`,
              width: '2px',
              height: '2px',
              backgroundColor: "var(--accent-color)",
              borderRadius: '50%',
              opacity: opacity,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [opacity, opacity * 0.5, opacity],
            }}
            transition={{
              duration: 2 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          />
        );
      })}
    </>
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
