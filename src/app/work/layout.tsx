import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

const TITLE = "Work — selected projects by Kiruk Studio";
const DESCRIPTION =
  "Selected design engineering work from Kiruk Studio — Spera.bot, HP Print AI, Mudra Stack, Square Bridge, PeopleGamez, and experimental web work from Bengaluru.";

export const metadata: Metadata = {
  title: "Work",
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
