import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

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
  return (
    <>
      <p className="sr-only">{DESCRIPTION}</p>
      {children}
    </>
  );
}
