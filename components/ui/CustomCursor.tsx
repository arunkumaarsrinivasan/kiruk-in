"use client";
import React, { useEffect, useRef } from 'react';
import { useCursor } from './CursorContext';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const { cursorType } = useCursor();
  const [mouse, setMouse] = React.useState({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 }); // Add ref for mouse position
  // For smooth pupil movement
  const [pupilPos, setPupilPos] = React.useState({ x: 0, y: 0 });
  // For blink animation
  const [isBlinking, setIsBlinking] = React.useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      const newPos = { x: e.clientX, y: e.clientY };
      setMouse(newPos);
      mouseRef.current = newPos; // Update ref as well
      if (cursorRef.current) {
        // Use transform for smoother movement instead of left/top
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };
    document.addEventListener('mousemove', moveCursor);
    return () => document.removeEventListener('mousemove', moveCursor);
  }, []);

  // Smoothly interpolate pupil position (only for eye cursor)
  useEffect(() => {
    if (cursorType !== 'eye') return;
    
    let frame: number;
    const animate = () => {
      // Eye dimensions
      const eyeWidth = 40;
      const eyeHeight = 40;
      const eyeCenter = { x: eyeWidth / 2, y: eyeHeight / 2 };
      const maxOffset = 10;
      
      // Use current mouse position directly for more responsive movement
      const dx = mouseRef.current.x - window.innerWidth / 2;
      const dy = mouseRef.current.y - window.innerHeight / 2;
      const angle = Math.atan2(dy, dx);
      const targetX = eyeCenter.x + Math.cos(angle) * maxOffset;
      const targetY = eyeCenter.y + Math.sin(angle) * maxOffset;
      
      setPupilPos(prev => {
        // Increase interpolation speed for smoother movement
        const lerpFactor = 0.25; // Increased from 0.18
        const newX = prev.x + (targetX - prev.x) * lerpFactor;
        const newY = prev.y + (targetY - prev.y) * lerpFactor;
        
        // Only update if there's significant change to avoid unnecessary renders
        if (Math.abs(newX - prev.x) > 0.1 || Math.abs(newY - prev.y) > 0.1) {
          return { x: newX, y: newY };
        }
        return prev;
      });
      
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
    // Remove mouse dependencies to prevent infinite loop
  }, [cursorType]);

  // Blink animation handler (only for eye cursor)
  const handleBlink = () => {
    if (cursorType === 'eye') {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }
  };

  // Add global click listener for blink
  useEffect(() => {
    document.addEventListener('mousedown', handleBlink);
    return () => document.removeEventListener('mousedown', handleBlink);
  }, [cursorType]);

  // Render different cursor types
  const renderCursor = () => {
    const baseSize = 40;
    
    switch (cursorType) {
      case 'eye':
        return renderEyeCursor(baseSize);
      case 'grab':
        return renderGrabCursor(baseSize);
      case 'grabbing':
        return renderGrabbingCursor(baseSize);
      case 'dropping':
        return renderDroppingCursor(baseSize);
      case 'pointer':
        return renderPointerCursor(baseSize);
      default:
        return renderEyeCursor(baseSize);
    }
  };

  const renderEyeCursor = (size: number) => {
    const eyeWidth = size;
    const eyeHeight = size;
    const pupilRadius = 7;
    const eyeCenter = { x: eyeWidth / 2, y: eyeHeight / 2 };

    return (
      <svg width={eyeWidth} height={eyeHeight}>
        {/* Eye outline */}
        <ellipse
          cx={eyeCenter.x}
          cy={eyeCenter.y}
          rx={eyeWidth / 2 - 2}
          ry={eyeHeight / 2 - 6}
          fill="#fff"
          stroke="#22223b"
          strokeWidth="2.5"
        />
        
        {/* Pupil - only show when not blinking */}
        {!isBlinking && (
          <circle
            cx={pupilPos.x || eyeCenter.x}
            cy={pupilPos.y || eyeCenter.y}
            r={pupilRadius}
            fill="#22223b"
            stroke="#22223b"
            strokeWidth="1.5"
          />
        )}
        
        {/* Full black eyelid for complete eye shut */}
        {isBlinking && (
          <ellipse
            cx={eyeCenter.x}
            cy={eyeCenter.y}
            rx={eyeWidth / 2 - 2}
            ry={eyeHeight / 2 - 6}
            fill="#22223b"
            stroke="#22223b"
            strokeWidth="2.5"
            style={{
              transition: 'all 0.1s ease-in-out'
            }}
          />
        )}
      </svg>
    );
  };

  const renderGrabCursor = (size: number) => {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40">
        {/* Open hand cursor - relaxed fingers ready to grab */}
        <g transform="translate(20, 20)" fill="#22223b" stroke="#22223b" strokeWidth="1.5">
          {/* Palm */}
          <ellipse cx="0" cy="2" rx="8" ry="12" fill="#fff" stroke="#22223b" strokeWidth="2"/>
          
          {/* Thumb - slightly extended */}
          <path d="M -6 -4 Q -10 -6 -12 -2 Q -10 2 -6 0" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          
          {/* Index finger - slightly curved, ready to grab */}
          <path d="M -4 -8 Q -5 -9 -4 -6 L -4 -2" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          <circle cx="-4" cy="-2" r="1.25" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          
          {/* Middle finger - longest, slightly curved */}
          <path d="M -1 -10 Q -2 -11 -1 -8 L -1 -2" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          <circle cx="-1" cy="-2" r="1.25" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          
          {/* Ring finger - curved */}
          <path d="M 2 -9 Q 1 -10 2 -7 L 2 -2" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          <circle cx="2" cy="-2" r="1.25" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          
          {/* Pinky - smallest */}
          <path d="M 5 -7 Q 4 -8 5 -5 L 5 -1" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          <circle cx="5" cy="-1" r="1" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          
          {/* Subtle shadow for depth */}
          <ellipse cx="1" cy="3" rx="6" ry="8" fill="#22223b" opacity="0.1"/>
        </g>
      </svg>
    );
  };

  const renderGrabbingCursor = (size: number) => {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40">
        {/* Closed hand cursor - actively gripping */}
        <g transform="translate(20, 20)" fill="#22223b" stroke="#22223b" strokeWidth="1.5">
          {/* Palm - slightly compressed */}
          <ellipse cx="0" cy="3" rx="7" ry="11" fill="#fff" stroke="#22223b" strokeWidth="2"/>
          
          {/* Thumb - pressed firmly against palm */}
          <path d="M -6 -1 Q -9 0 -10 3 Q -8 5 -5 3" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          
          {/* Index finger - tightly curled */}
          <path d="M -4 -3 Q -6 -5 -5 -1 Q -4 2 -3 0" fill="#fff" stroke="#22223b" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Middle finger - tightly curled */}
          <path d="M -1 -5 Q -3 -7 -2 -3 Q -1 1 0 -1" fill="#fff" stroke="#22223b" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Ring finger - tightly curled */}
          <path d="M 2 -4 Q 0 -6 1 -2 Q 2 1 3 -1" fill="#fff" stroke="#22223b" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Pinky - tightly curled */}
          <path d="M 5 -2 Q 3 -4 4 0 Q 5 2 6 0" fill="#fff" stroke="#22223b" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Knuckle definition for realism */}
          <ellipse cx="-3" cy="1" rx="1" ry="0.5" fill="#22223b" opacity="0.2"/>
          <ellipse cx="0" cy="1" rx="1" ry="0.5" fill="#22223b" opacity="0.2"/>
          <ellipse cx="3" cy="1" rx="1" ry="0.5" fill="#22223b" opacity="0.2"/>
          
          {/* Gripping tension lines */}
          <line x1="-2" y1="5" x2="2" y2="5" stroke="#22223b" strokeWidth="1" opacity="0.4"/>
          <line x1="-1" y1="7" x2="1" y2="7" stroke="#22223b" strokeWidth="0.8" opacity="0.3"/>
          
          {/* Shadow for depth */}
          <ellipse cx="1" cy="4" rx="5" ry="7" fill="#22223b" opacity="0.15"/>
        </g>
      </svg>
    );
  };

  const renderDroppingCursor = (size: number) => {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40">
        {/* Hand releasing/dropping - fingers opening */}
        <g transform="translate(20, 20)" fill="#22223b" stroke="#22223b" strokeWidth="1.5">
          {/* Palm - slightly relaxed */}
          <ellipse cx="0" cy="2" rx="7.5" ry="11.5" fill="#fff" stroke="#22223b" strokeWidth="2"/>
          
          {/* Thumb - moving away from palm */}
          <path d="M -6 -3 Q -9 -4 -11 -1 Q -9 2 -6 1" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          
          {/* Index finger - opening/extending */}
          <path d="M -4 -6 Q -5 -7 -4 -4 L -4 -1" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          <circle cx="-4" cy="-1" r="1.25" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          
          {/* Middle finger - opening/extending */}
          <path d="M -1 -8 Q -2 -9 -1 -6 L -1 -1" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          <circle cx="-1" cy="-1" r="1.25" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          
          {/* Ring finger - opening */}
          <path d="M 2 -7 Q 1 -8 2 -5 L 2 -1" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          <circle cx="2" cy="-1" r="1.25" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          
          {/* Pinky - opening */}
          <path d="M 5 -5 Q 4 -6 5 -3 L 5 0" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          <circle cx="5" cy="0" r="1" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          
          {/* Motion lines to indicate dropping/releasing */}
          <path d="M -6 -12 Q -4 -10 -2 -12" fill="none" stroke="#22223b" strokeWidth="1" opacity="0.6" strokeDasharray="2,2"/>
          <path d="M 0 -13 Q 2 -11 4 -13" fill="none" stroke="#22223b" strokeWidth="1" opacity="0.6" strokeDasharray="2,2"/>
          <path d="M 6 -10 Q 8 -8 10 -10" fill="none" stroke="#22223b" strokeWidth="1" opacity="0.6" strokeDasharray="2,2"/>
          
          {/* Subtle shadow */}
          <ellipse cx="1" cy="3" rx="6" ry="8" fill="#22223b" opacity="0.1"/>
        </g>
      </svg>
    );
  };

  const renderPointerCursor = (size: number) => {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40">
        {/* Pointing hand cursor */}
        <g transform="translate(20, 20)" fill="#22223b" stroke="#22223b" strokeWidth="1.5">
          {/* Palm */}
          <ellipse cx="0" cy="4" rx="6" ry="10" fill="#fff" stroke="#22223b" strokeWidth="2"/>
          
          {/* Thumb */}
          <path d="M -5 0 Q -8 -2 -6 2 Q -4 4 -2 2" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          
          {/* Index finger - extended and pointing */}
          <rect x="-2" y="-12" width="3" height="12" rx="1.5" fill="#fff" stroke="#22223b" strokeWidth="1.5"/>
          
          {/* Middle finger - folded */}
          <path d="M 1 -2 Q 3 -4 1 0 L 1 4" fill="none" stroke="#22223b" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Ring finger - folded */}
          <path d="M 3 -1 Q 5 -3 3 1 L 3 4" fill="none" stroke="#22223b" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Pinky - folded */}
          <path d="M 5 0 Q 7 -2 5 2 L 5 4" fill="none" stroke="#22223b" strokeWidth="2" strokeLinecap="round"/>
        </g>
      </svg>
    );
  };

  const getCursorSize = () => {
    // Slightly adjust size based on cursor type for better visual feedback
    switch (cursorType) {
      case 'grabbing':
        return { width: 38, height: 38 }; // Slightly smaller when gripping
      case 'dropping':
        return { width: 42, height: 42 }; // Slightly larger when releasing
      default:
        return { width: 40, height: 40 };
    }
  };

  const cursorSize = getCursorSize();

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: cursorSize.width,
        height: cursorSize.height,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
        // Remove transition for immediate cursor following
        // transition: 'all 0.15s ease-out',
        mixBlendMode: 'multiply',
      }}
      className="custom-cursor"
    >
      {renderCursor()}
    </div>
  );
};

export default CustomCursor;
