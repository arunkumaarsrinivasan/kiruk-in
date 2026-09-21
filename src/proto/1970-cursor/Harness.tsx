"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { PROTO_POSTS } from "@/proto/1970-blog/data";
import { Dock } from "./Dock";
import "./proto.css";

export function Harness({ fonts }: { fonts: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`proto-stage era-blog-surface ${fonts}`}
      data-era-surface="1970"
      data-era-cursor="block"
      style={
        {
          "--proto-cell": 9,
          "--proto-brush": 1,
          "--proto-decay": 58,
          "--proto-speed": 1,
          "--proto-glow": 8,
          "--proto-scan": 18,
          "--proto-vignette": 55,
        } as CSSProperties
      }
    >
      <Dock posts={PROTO_POSTS} />
    </div>,
    document.body,
  );
}
