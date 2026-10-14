import type { ComponentType } from "react";
import type { Story } from "./use-story";

export interface StorySkinProps {
  story: Story;
  /** "embed" sits in a home page section; "full" fills the ?module=about overlay. */
  variant: "embed" | "full";
}

export type StorySkin = ComponentType<StorySkinProps>;
