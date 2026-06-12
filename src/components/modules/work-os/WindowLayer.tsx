"use client";

import { AnimatePresence } from "framer-motion";
import type { RefObject } from "react";
import { WindowFrame } from "./WindowFrame";
import { ProjectCaseStudy } from "./ProjectCaseStudy";
import { label } from "./helpers";
import type { DesktopEra, Project, WindowState } from "./types";

interface WindowLayerProps {
  readonly era: DesktopEra;
  readonly projects: Project[];
  readonly windows: WindowState[];
  readonly onClose: (key: string) => void;
  readonly onFocus: (key: string) => void;
  readonly stageRef: RefObject<HTMLElement | null>;
}

/** Renders the open stacking windows for window-based desktops. */
export function WindowLayer({ era, projects, windows, onClose, onFocus, stageRef }: WindowLayerProps) {
  return (
    <AnimatePresence>
      {windows
        .filter((w) => !w.minimized)
        .map((w) => {
          const p = projects.find((x) => x.id === w.projectId);
          if (!p) return null;
          return (
            <WindowFrame
              key={w.key}
              era={era}
              title={label(p)}
              z={w.z}
              x={w.x}
              y={w.y}
              onClose={() => onClose(w.key)}
              onFocus={() => onFocus(w.key)}
              dragConstraints={stageRef}
            >
              <ProjectCaseStudy project={p} era={era} />
            </WindowFrame>
          );
        })}
    </AnimatePresence>
  );
}
