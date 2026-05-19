import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://kiruk.in");

const TITLE = "Portfolio gallery — Creative work by Kiruk";
const DESCRIPTION =
  "Visual gallery of UX, illustration, branding, and motion work by Kiruk — design engineer based in Bengaluru, India.";

export const metadata: Metadata = {
  title: "Portfolio",
  description: DESCRIPTION,
  alternates: { canonical: "/portfolio" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/portfolio`,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
