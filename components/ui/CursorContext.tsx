'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

export type CursorType = 'eye' | 'grab' | 'grabbing' | 'dropping' | 'pointer';

interface CursorContextType {
  cursorType: CursorType;
  setCursorType: (type: CursorType) => void;
  setGrabCursor: () => void;
  setGrabbingCursor: () => void;
  setDroppingCursor: () => void;
  setEyeCursor: () => void;
  setPointerCursor: () => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};

interface CursorProviderProps {
  children: ReactNode;
}

export const CursorProvider: React.FC<CursorProviderProps> = ({ children }) => {
  const [cursorType, setCursorType] = useState<CursorType>('eye');

  const setGrabCursor = useCallback(() => setCursorType('grab'), []);
  const setGrabbingCursor = useCallback(() => setCursorType('grabbing'), []);
  const setDroppingCursor = useCallback(() => setCursorType('dropping'), []);
  const setEyeCursor = useCallback(() => setCursorType('eye'), []);
  const setPointerCursor = useCallback(() => setCursorType('pointer'), []);

  const value = useMemo(() => ({
    cursorType,
    setCursorType,
    setGrabCursor,
    setGrabbingCursor,
    setDroppingCursor,
    setEyeCursor,
    setPointerCursor,
  }), [cursorType, setGrabCursor, setGrabbingCursor, setDroppingCursor, setEyeCursor, setPointerCursor]);

  return (
    <CursorContext.Provider value={value}>
      {children}
    </CursorContext.Provider>
  );
};
