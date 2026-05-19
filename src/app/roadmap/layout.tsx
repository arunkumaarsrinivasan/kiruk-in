import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://kiruk.in");

const TITLE = "Roadmap — What Kiruk is building next";
const DESCRIPTION =
  "Public roadmap of ongoing experiments, side projects, and design engineering bets by Arun Kumaar Sreenivasan (Kiruk).";

export const metadata: Metadata = {
  title: "Roadmap",
  description: DESCRIPTION,
  alternates: { canonical: "/roadmap" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/roadmap`,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
