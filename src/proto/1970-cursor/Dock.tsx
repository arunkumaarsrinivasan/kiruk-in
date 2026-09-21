"use client";

import type { ProtoPost } from "@/proto/1970-blog/data";
import { LogBoard } from "./LogBoard";

export function Dock({ posts }: { posts: ProtoPost[] }) {
  return <LogBoard posts={posts} />;
}
