"use client";

/**
 * AboutExperience — the ABOUT module's full-screen experience: the real "Time
 * Travel" celestial life-journey from the /about route. Opening the landing
 * ABOUT.sh whoami expands into this; the module overlay's Close/Esc dismisses.
 */

import React from "react";
import dynamic from "next/dynamic";

const AboutJourney = dynamic(() => import("@/app/about/page"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full w-full items-center justify-center text-sm"
      style={{ color: "var(--text-muted)", fontFamily: "var(--font-main)" }}
    >
      ✦ winding the clock…
    </div>
  ),
});

export function AboutExperience() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <AboutJourney />
    </div>
  );
}

export default AboutExperience;
