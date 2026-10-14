import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

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
  return (
    <>
      <p className="sr-only">{DESCRIPTION}</p>
      {children}
    </>
  );
}
