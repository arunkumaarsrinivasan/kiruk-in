"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WindowState } from "./types";

export interface WindowApi {
  windows: WindowState[];
  open: (projectId: string) => void;
  close: (key: string) => void;
  focus: (key: string) => void;
}

/**
 * Stacking window manager shared by the window-based desktops (bitmap, win95,
 * aqua). `resetKey` clears the workspace when the desktop/era changes.
 * `origin` sets where the first window cascades from (differs per desktop so
 * windows don't bury that desktop's icon rail).
 */
export function useWindows(
  resetKey: string,
  origin: { x: number; y: number } = { x: 200, y: 28 },
): WindowApi {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const z = useRef(10);

  useEffect(() => {
    setWindows([]);
    z.current = 10;
  }, [resetKey]);

  const focus = useCallback((key: string) => {
    z.current += 1;
    const zz = z.current;
    setWindows((ws) => ws.map((w) => (w.key === key ? { ...w, z: zz } : w)));
  }, []);

  const open = useCallback(
    (projectId: string) => {
      z.current += 1;
      const zz = z.current;
      setWindows((ws) => {
        const ex = ws.find((w) => w.projectId === projectId);
        if (ex) {
          return ws.map((w) =>
            w.projectId === projectId ? { ...w, z: zz, minimized: false } : w,
          );
        }
        const n = ws.length;
        return [
          ...ws,
          {
            key: `${projectId}-${zz}`,
            projectId,
            z: zz,
            x: origin.x + (n % 5) * 28,
            y: origin.y + (n % 5) * 30,
          },
        ];
      });
    },
    [origin.x, origin.y],
  );

  const close = useCallback(
    (key: string) => setWindows((ws) => ws.filter((w) => w.key !== key)),
    [],
  );

  return { windows, open, close, focus };
}
