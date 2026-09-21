"use client";

import { GazeField } from "./gaze/GazeField";
import { useNotebookEraOptional } from "./NotebookEraContext";

export function NotebookCursor() {
  const eraId = useNotebookEraOptional()?.eraId;
  if (eraId !== "1970") return null;
  return <GazeField />;
}
