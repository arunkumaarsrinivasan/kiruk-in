import { Suspense } from "react";
import type { Metadata } from "next";
import { IBM_Plex_Mono, VT323 } from "next/font/google";
import { Harness } from "@/proto/1970-blog/Harness";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-blog-body",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-blog-display",
});

export const metadata: Metadata = {
  title: "Proto · 1970 notebook",
  robots: { index: false, follow: false },
};

export default function Proto1970BlogPage() {
  return (
    <Suspense fallback={<div style={{ background: "#000", position: "fixed", inset: 0, zIndex: 20000 }} />}>
      <Harness fonts={`${ibmPlexMono.variable} ${vt323.variable}`} />
    </Suspense>
  );
}
