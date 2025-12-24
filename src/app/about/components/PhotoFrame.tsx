"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface PhotoFrameProps {
  imageSrc?: string;
  alt?: string;
  year?: number;
  caption?: string;
  className?: string;
  onClick?: () => void;
}

export function PhotoFrame({ imageSrc, alt, year, caption, className, onClick }: PhotoFrameProps) {
  const pixelSize = 4;
  
  // Pixel art frame border
  const frameWidth = 20;
  const frameHeight = 16;
  
  const framePixels = generateFramePixels(frameWidth, frameHeight);
  
  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      style={{
        width: frameWidth * pixelSize,
        height: frameHeight * pixelSize,
        imageRendering: "pixelated",
      }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Pixel frame */}
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${frameWidth}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${frameHeight}, ${pixelSize}px)`,
        }}
      >
        {framePixels.flat().map((color, idx) => (
          <div
            key={idx}
            style={{
              width: pixelSize,
              height: pixelSize,
              backgroundColor: color || "transparent",
            }}
          />
        ))}
      </div>
      
      {/* Image container - inner area */}
      <div
        className="absolute bg-gray-200 flex items-center justify-center overflow-hidden"
        style={{
          left: pixelSize * 2,
          top: pixelSize * 2,
          width: (frameWidth - 4) * pixelSize,
          height: (frameHeight - 4) * pixelSize,
        }}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={alt || "Photo"}
            fill
            className="object-cover"
            style={{ imageRendering: "auto" }}
          />
        ) : (
          <div className="text-center p-1">
            <div className="text-xl">📷</div>
            <div className="text-[8px] text-gray-500 font-mono">
              {year ? `${year}` : "Add Photo"}
            </div>
          </div>
        )}
      </div>
      
      {/* Caption */}
      {caption && (
        <div
          className="absolute left-0 right-0 text-center font-mono text-[8px] text-white bg-black/70 px-1"
          style={{
            bottom: pixelSize,
          }}
        >
          {caption}
        </div>
      )}
    </motion.div>
  );
}

function generateFramePixels(width: number, height: number): string[][] {
  const pixels: string[][] = [];
  const frameColor = "#8B4513"; // Wood brown
  const frameHighlight = "#CD853F";
  const frameShadow = "#654321";
  
  for (let y = 0; y < height; y++) {
    const row: string[] = [];
    for (let x = 0; x < width; x++) {
      // Outer border
      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        row.push(frameShadow);
      }
      // Second border (highlight)
      else if (y === 1 || y === height - 2 || x === 1 || x === width - 2) {
        if (y === 1 || x === 1) {
          row.push(frameHighlight);
        } else {
          row.push(frameColor);
        }
      }
      // Inner area (transparent for image)
      else {
        row.push("");
      }
    }
    pixels.push(row);
  }
  
  // Add corner decorations
  pixels[0][0] = "#FFD700";
  pixels[0][width - 1] = "#FFD700";
  pixels[height - 1][0] = "#FFD700";
  pixels[height - 1][width - 1] = "#FFD700";
  
  return pixels;
}

// Polaroid style photo frame
export function PolaroidFrame({ imageSrc, alt, year, caption, className, onClick }: PhotoFrameProps) {
  return (
    <motion.div
      className={`relative bg-white p-2 pb-8 shadow-lg cursor-pointer ${className}`}
      style={{
        width: 80,
        imageRendering: "pixelated",
      }}
      whileHover={{ scale: 1.05, rotate: [-1, 1] }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className="w-full aspect-square bg-gray-200 flex items-center justify-center overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={alt || "Photo"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="text-center">
            <div className="text-2xl">📷</div>
            <div className="text-[8px] text-gray-500 font-mono mt-1">
              {year || "Photo"}
            </div>
          </div>
        )}
      </div>
      {caption && (
        <div className="absolute bottom-1 left-0 right-0 text-center font-mono text-[8px] text-gray-700">
          {caption}
        </div>
      )}
    </motion.div>
  );
}
