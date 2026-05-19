import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://kiruk.in");

const TITLE = "About Arun Kumaar Sreenivasan (Kiruk) — Design Engineer";
const DESCRIPTION =
  "Interactive time-travel through Arun Kumaar Sreenivasan's life — from a creative joint family in Salem to design engineering at HP Print AI, Bengaluru.";

export const metadata: Metadata = {
  title: "About — Design engineer's time-travel timeline",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "profile",
    url: `${SITE_URL}/about`,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
