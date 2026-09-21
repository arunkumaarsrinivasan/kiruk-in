"use client";

/** Read module → the real /notebook hub.
 * Overlay deep-links (`?module=blog`) navigate to the route so RSS and OG
 * stay first-class. */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function BlogExperience() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/notebook");
  }, [router]);

  return (
    <div
      className="flex h-full w-full items-center justify-center text-sm"
      style={{ color: "var(--text-muted)", fontFamily: "var(--font-main)" }}
    >
      ✎ opening the notebook…
    </div>
  );
}

export default BlogExperience;
