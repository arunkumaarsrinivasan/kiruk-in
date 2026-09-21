"use client";

import "./gaze.css";
import { GazeSync } from "./GazeTitle";
import { PixelField } from "./PixelField";

export function GazeField() {
  return (
    <>
      <PixelField mode="dock" />
      <GazeSync mode="dock" />
    </>
  );
}
