"use client";

/**
 * Era → contact skin. Code-split like the about story: /contact only loads
 * the active era's costume. Eras without one get the token-only DefaultSkin.
 */

import dynamic from "next/dynamic";
import type { ContactSkin, ContactSkinProps } from "./types";
import { DefaultSkin } from "./skins/DefaultSkin";

function Loading() {
  return <div className="min-h-[70vh]" aria-hidden />;
}

const load = (fn: () => Promise<ContactSkin>) =>
  dynamic<ContactSkinProps>(() => fn().then((C) => ({ default: C })), { ssr: false, loading: Loading });

const SKINS: Record<string, ContactSkin> = {
  // 1970: Arun's desk on the tube, a message pad and a card wheel (2026-11-10). Terminal1970, the teletype
  // talk, and Switchboard1970, the call, are kept, unwired.
  "1970": load(() => import("./skins/Desk1970").then((m) => m.Desk1970)),
  "1981": load(() => import("./skins/Xerox1981").then((m) => m.Xerox1981)),
  "1991": load(() => import("./skins/DocHtml1991").then((m) => m.DocHtml1991)),
  "1995": load(() => import("./skins/Geocities1995").then((m) => m.Geocities1995)),
  "1997": load(() => import("./skins/Frameset1997").then((m) => m.Frameset1997)),
  "2000": load(() => import("./skins/Search2000").then((m) => m.Search2000)),
  "2003": load(() => import("./skins/MySpace2003").then((m) => m.MySpace2003)),
  "2009": load(() => import("./skins/IphoneSkeu2009").then((m) => m.IphoneSkeu2009)),
  "2013": load(() => import("./skins/Flat2013").then((m) => m.Flat2013)),
  // 2026 has no /contact: the pupil on the home answers it (EraHandoff). Device2026 is kept, unwired.
};

export function getContactSkin(eraId: string): ContactSkin {
  return SKINS[eraId] ?? DefaultSkin;
}
