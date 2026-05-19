import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://kiruk.in");

const TITLE = "Progress tracker — Skills & milestones by Kiruk";
const DESCRIPTION =
  "Live progress board tracking the skills, projects, and milestones Arun Kumaar Sreenivasan (Kiruk) is leveling up as a design engineer.";

export const metadata: Metadata = {
  title: "Progress",
  description: DESCRIPTION,
  alternates: { canonical: "/progress" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/progress`,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return children;
}
