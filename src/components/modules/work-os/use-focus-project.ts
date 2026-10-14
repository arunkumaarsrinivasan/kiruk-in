"use client";

import { useEffect } from "react";

/**
 * Deep links (/work/[id]): once the desktop has booted, open the project
 * folder named by `focusId` using that desktop's own "open" gesture.
 */
export function useFocusProject(focusId: string | undefined, open: (id: string) => void) {
  useEffect(() => {
    if (focusId) open(focusId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once per target; `open` is rebuilt every render
  }, [focusId]);
}
