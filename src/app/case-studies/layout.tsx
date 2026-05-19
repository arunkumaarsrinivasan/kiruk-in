import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://kiruk.in");

const TITLE = "Case studies — AI UX and design system deep dives by Kiruk";
const DESCRIPTION =
  "Long-form product design case studies on AI UX, design systems, and gamified onboarding by Kiruk — design engineer based in Bengaluru, India.";

export const metadata: Metadata = {
  title: "Case studies",
  description: DESCRIPTION,
  alternates: { canonical: "/case-studies" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/case-studies`,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
