"use client";

import Image from "next/image";

interface ProjectThumbnailProps {
  readonly src: string;
  readonly className?: string;
  readonly sizes?: string;
}

/** SVG thumbs render natively so vectors stay sharp (Next/Image rasterizes SVGs). */
export function ProjectThumbnail({
  src,
  className = "object-cover",
  sizes = "(max-width: 640px) 88vw, 420px",
}: ProjectThumbnailProps) {
  if (src.endsWith(".svg")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className={`absolute inset-0 h-full w-full ${className}`}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <Image src={src} alt="" fill className={className} sizes={sizes} />
  );
}
