import type { Metadata } from "next";
import { SHARE_IMAGE, SITE_URL } from "@/lib/site";

const TITLE = "Design engineering work — Arun Kumaar Sreenivasan";
const DESCRIPTION =
  "Design engineering by Arun Kumaar Sreenivasan (Kiruk), Bengaluru: Spera.bot, HP Print AI, the Mudra design system, Square Bridge and Three.js work.";

export const metadata: Metadata = {
  title: "Design engineering work",
  description: DESCRIPTION,
  alternates: { canonical: "/work" },
  openGraph: {
    images: [SHARE_IMAGE],
    type: "website",
    url: `${SITE_URL}/work`,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
