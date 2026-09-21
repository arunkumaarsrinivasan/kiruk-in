import type { Stage } from "@/lib/content";

export type Mark = {
  regular: string;
  solid: string;
  label: string;
};

const STAGE: Record<Stage, Mark> = {
  seedling: {
    regular: "regular/seedlings.svg",
    solid: "solid/seedlings-solid.svg",
    label: "Seed",
  },
  growing: {
    regular: "regular/pencil.svg",
    solid: "solid/pencil-solid.svg",
    label: "Essay",
  },
  evergreen: {
    regular: "regular/pencil.svg",
    solid: "solid/pencil-solid.svg",
    label: "Essay",
  },
};

const SLUG: Record<string, Partial<Mark>> = {
  "variation-keeps-me-alive": { regular: "regular/shuffle.svg", solid: "solid/shuffle-solid.svg" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function markFor(post: { stage: Stage; slug: string }): Mark {
  return { ...STAGE[post.stage], ...SLUG[post.slug] };
}

export function dateYear(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
