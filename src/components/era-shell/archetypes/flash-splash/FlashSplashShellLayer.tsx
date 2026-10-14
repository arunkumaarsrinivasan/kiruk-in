"use client";

/**
 * FlashSplashShellLayer — site-wide layer for era=2000.
 *
 * Intentionally empty: the Flash home paints its own gunmetal room and stage,
 * and other pages read the 2000 tokens directly. No haze, glow or scanlines
 * over the content. (Not registered in era-shell/registry today.)
 */

import type { ShellLayerProps } from "../../registry";

export function FlashSplashShellLayer(_props: ShellLayerProps) {
  return null;
}

export default FlashSplashShellLayer;
