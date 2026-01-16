'use client';

import { useState, useEffect, useCallback, useRef, RefObject } from 'react';

export interface MousePositionResult {
  // Raw mouse position relative to viewport
  mouseX: number;
  mouseY: number;
  // Head rotation in degrees (-30 to 30)
  headRotation: number;
  // Eye offset for looking direction (x, y) in pixels
  eyeOffset: { x: number; y: number };
  // Whether the mouse is currently over the character
  isHovering: boolean;
  // Character center position (for debugging)
  characterCenter: { x: number; y: number };
}

interface UseMousePositionOptions {
  // Maximum rotation angle in degrees
  maxRotation?: number;
  // Maximum eye offset in pixels
  maxEyeOffset?: number;
  // Smoothing factor (0-1, higher = more responsive)
  smoothing?: number;
  // Whether tracking is enabled
  enabled?: boolean;
}

const DEFAULT_OPTIONS: UseMousePositionOptions = {
  maxRotation: 25,
  maxEyeOffset: 4,
  smoothing: 0.15,
  enabled: true,
};

/**
 * Custom hook for tracking mouse position relative to a character element
 * and calculating head rotation and eye offset for interactive animations
 */
export function useMousePosition(
  characterRef: RefObject<HTMLElement | null>,
  options: UseMousePositionOptions = {}
): MousePositionResult {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const { maxRotation, maxEyeOffset, smoothing, enabled } = mergedOptions;

  const [result, setResult] = useState<MousePositionResult>({
    mouseX: 0,
    mouseY: 0,
    headRotation: 0,
    eyeOffset: { x: 0, y: 0 },
    isHovering: false,
    characterCenter: { x: 0, y: 0 },
  });

  // Use refs for smooth animation
  const targetRotation = useRef(0);
  const targetEyeOffset = useRef({ x: 0, y: 0 });
  const currentRotation = useRef(0);
  const currentEyeOffset = useRef({ x: 0, y: 0 });
  const animationFrame = useRef<number | null>(null);

  // Calculate head rotation and eye offset based on mouse position
  const calculateTransforms = useCallback(
    (mouseX: number, mouseY: number) => {
      if (!characterRef.current) return;

      const rect = characterRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.3; // Head is roughly 30% from top

      // Calculate relative position (-1 to 1)
      const relativeX = (mouseX - centerX) / (window.innerWidth / 2);
      const relativeY = (mouseY - centerY) / (window.innerHeight / 2);

      // Clamp values
      const clampedX = Math.max(-1, Math.min(1, relativeX));
      const clampedY = Math.max(-1, Math.min(1, relativeY));

      // Calculate head rotation (horizontal only, based on X position)
      targetRotation.current = clampedX * (maxRotation ?? 25);

      // Calculate eye offset (both X and Y)
      targetEyeOffset.current = {
        x: clampedX * (maxEyeOffset ?? 4),
        y: clampedY * (maxEyeOffset ?? 4) * 0.5, // Vertical movement is subtler
      };

      // Check if hovering over character
      const isHovering =
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom;

      setResult((prev) => ({
        ...prev,
        mouseX,
        mouseY,
        isHovering,
        characterCenter: { x: centerX, y: centerY },
      }));
    },
    [characterRef, maxRotation, maxEyeOffset]
  );

  // Smooth animation loop
  const animate = useCallback(() => {
    const s = smoothing ?? 0.15;

    // Lerp current values toward target
    currentRotation.current += (targetRotation.current - currentRotation.current) * s;
    currentEyeOffset.current.x += (targetEyeOffset.current.x - currentEyeOffset.current.x) * s;
    currentEyeOffset.current.y += (targetEyeOffset.current.y - currentEyeOffset.current.y) * s;

    setResult((prev) => ({
      ...prev,
      headRotation: currentRotation.current,
      eyeOffset: { ...currentEyeOffset.current },
    }));

    animationFrame.current = requestAnimationFrame(animate);
  }, [smoothing]);

  // Mouse move handler
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!enabled) return;
      calculateTransforms(event.clientX, event.clientY);
    },
    [enabled, calculateTransforms]
  );

  // Touch move handler for mobile
  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!enabled || event.touches.length === 0) return;
      const touch = event.touches[0];
      calculateTransforms(touch.clientX, touch.clientY);
    },
    [enabled, calculateTransforms]
  );

  // Setup event listeners and animation loop
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Start animation loop
    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);

      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [enabled, handleMouseMove, handleTouchMove, animate]);

  // Reset to center when mouse leaves window
  useEffect(() => {
    const handleMouseLeave = () => {
      targetRotation.current = 0;
      targetEyeOffset.current = { x: 0, y: 0 };
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return result;
}

/**
 * Simplified hook that just returns rotation angle without refs
 * Useful for components that don't need the full tracking
 */
export function useSimpleMouseRotation(maxRotation = 25): number {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const relativeX = (event.clientX - centerX) / centerX;
      const clampedX = Math.max(-1, Math.min(1, relativeX));
      setRotation(clampedX * maxRotation);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [maxRotation]);

  return rotation;
}

export default useMousePosition;
