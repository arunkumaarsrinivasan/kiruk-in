import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://kiruk.in");

const TITLE = "Blog — Essays on design engineering and AI UX by Kiruk";
const DESCRIPTION =
  "Essays and process journals on design engineering, AI UX, design systems, and craft by Kiruk (Arun Kumaar Sreenivasan) from Bengaluru, India.";

export const metadata: Metadata = {
  title: "Blog",
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
  return children;
}
