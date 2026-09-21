import type { ProtoKind, ProtoPost } from "@/proto/1970-blog/data";

/** Hackernoon 24px pixel marks. Later eras can swap density — not color emoji. */
export type Mark = {
  regular: string;
  solid: string;
  label: string;
};

const KIND: Record<ProtoKind, Mark> = {
  seed: {
    regular: "regular/seedlings.svg",
    solid: "solid/seedlings-solid.svg",
    label: "Seed",
  },
  essay: {
    regular: "regular/pencil.svg",
    solid: "solid/pencil-solid.svg",
    label: "Essay",
  },
};

const SLUG: Record<string, Partial<Mark>> = {
  "content-is-a-kernel": { regular: "regular/cog.svg", solid: "solid/cog-solid.svg" },
  hello: { regular: "regular/pencil.svg", solid: "solid/pencil-solid.svg" },
  dtrf: { regular: "regular/flag.svg", solid: "solid/flag-solid.svg" },
  "character-cell": { regular: "regular/h1.svg", solid: "solid/heading-1-solid.svg" },
  "phosphor-afterglow": { regular: "regular/sparkles.svg", solid: "solid/sparkles-solid.svg" },
  "batch-job": { regular: "regular/print.svg", solid: "solid/print-solid.svg" },
  "pf-keys": { regular: "regular/check-list.svg", solid: "solid/check-list-solid.svg" },
  "ascii-issue": { regular: "regular/newspaper.svg", solid: "solid/newspaper-solid.svg" },
  "login-message": { regular: "regular/login.svg", solid: "solid/login-solid.svg" },
  "empty-reel": { regular: "regular/circle-notch.svg", solid: "solid/circle-notch-solid.svg" },
  "wide-title-for-the-cell": { regular: "regular/expand.svg", solid: "solid/expand-solid.svg" },
  "see-also": { regular: "regular/link.svg", solid: "solid/link-solid.svg" },
};

export function markFor(post: Pick<ProtoPost, "kind" | "slug">): Mark {
  return { ...KIND[post.kind], ...SLUG[post.slug] };
}
