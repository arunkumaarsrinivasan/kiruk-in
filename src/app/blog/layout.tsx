import type { Metadata } from "next";
import { USE_KIRUK_HAND } from "@/lib/sketch-ink/config";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://kiruk.in");

const TITLE = "Notebook — handwritten notes and sketches by Kiruk";
const DESCRIPTION =
  "Handwritten notes, sketches, and screenshots from Kiruk — black ink on white paper.";

export const metadata: Metadata = {
  title: "Notebook",
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blog`,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="surface-paper relative z-20 min-h-screen"
      data-kiruk-hand={USE_KIRUK_HAND ? "true" : "false"}
    >
      {children}
    </div>
  );
}
