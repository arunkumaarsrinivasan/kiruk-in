"use client";

/**
 * Era → about-story skin. Each skin is code-split so a home page only loads
 * its own era's costume. Eras without a skin yet (and custom eras) get the
 * token-only DefaultSkin, so every home has the story box.
 */

import dynamic from "next/dynamic";
import type { StorySkin, StorySkinProps } from "./types";
import { DefaultSkin } from "./skins/DefaultSkin";
import { BEATS } from "@/data/about-story";
import { IDENTITY } from "@/lib/identity";

/**
 * Skins are client-only, so this is what the server HTML holds. The story
 * is written out in full under sr-only: readers without JavaScript (AI
 * crawlers) and screen readers get the words; everyone else sees the skin.
 */
function Loading() {
  return (
    <div className="min-h-[420px]">
      <div className="sr-only">
        <h2>About {IDENTITY.name}</h2>
        <p>{IDENTITY.oneLiner}</p>
        <ol>
          {BEATS.map((b) => (
            <li key={b.id}>
              <h3>
                {b.title} ({b.period}, {b.place})
              </h3>
              <p>{b.read}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
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
