import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://kiruk.in");

const TITLE = "Contact Kiruk — Hire a design engineer in Bengaluru, India";
const DESCRIPTION =
  "Get in touch for AI UX, design systems, and front-end engineering work. Selective freelance and consulting with Kiruk in Bengaluru, India.";

export const metadata: Metadata = {
  title: "Contact",
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/contact`,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
