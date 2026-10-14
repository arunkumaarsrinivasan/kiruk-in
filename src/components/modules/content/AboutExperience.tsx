"use client";

/**
 * AboutExperience — the ABOUT module (?module=about): the same era story box
 * the home pages embed, given the whole overlay.
 */

import React from "react";
import { EraStoryBox } from "@/components/about-story/EraStoryBox";

export function AboutExperience() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <EraStoryBox variant="full" />
    </div>
  );
}

export default AboutExperience;
