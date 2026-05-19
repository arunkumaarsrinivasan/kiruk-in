import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://kiruk.in");

const TITLE = "Work archive — Design engineering projects by Kiruk";
const DESCRIPTION =
  "Featured design engineering projects by Kiruk — HP Print AI, SNS Square design systems, PeopleGamez interaction design, and freelance work from Bengaluru.";

export const metadata: Metadata = {
  title: "Work — Design engineering projects",
  description: DESCRIPTION,
  alternates: { canonical: "/work" },
  openGraph: {
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
