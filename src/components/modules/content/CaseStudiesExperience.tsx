"use client";

/** Work module — selected work lives at /work. Overlay deep-links navigate there. */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function CaseStudiesExperience() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/work");
  }, [router]);

  return (
    <div
      className="flex h-full w-full items-center justify-center text-sm"
      style={{ color: "var(--text-muted)", fontFamily: "var(--font-main)" }}
    >
      ▦ opening work…
    </div>
  );
}

export default CaseStudiesExperience;
