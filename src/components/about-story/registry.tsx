"use client";

/**
 * Era → about-story skin. Each skin is code-split so a home page only loads
 * its own era's costume. Eras without a skin yet (and custom eras) get the
 * token-only DefaultSkin, so every home has the story box.
 */

import dynamic from "next/dynamic";
import type { StorySkin, StorySkinProps } from "./types";
import { DefaultSkin } from "./skins/DefaultSkin";

function Loading() {
  return <div className="min-h-[420px]" aria-hidden />;
}

const load = (fn: () => Promise<StorySkin>) =>
  dynamic<StorySkinProps>(() => fn().then((C) => ({ default: C })), { ssr: false, loading: Loading });

const SKINS: Record<string, StorySkin> = {
  "1970": load(() => import("./skins/Terminal1970").then((m) => m.Terminal1970)),
  "1981": load(() => import("./skins/Xerox1981").then((m) => m.Xerox1981)),
  "1991": load(() => import("./skins/DocHtml1991").then((m) => m.DocHtml1991)),
};

export function getStorySkin(eraId: string): StorySkin {
  return SKINS[eraId] ?? DefaultSkin;
}
