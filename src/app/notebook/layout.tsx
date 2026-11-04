import type { Metadata } from "next";
import { NotebookEraRoot } from "@/components/notebook";
import { SHARE_IMAGE, SITE_URL } from "@/lib/site";

const TITLE = "Notebook — Arun Kumaar Sreenivasan";
const DESCRIPTION =
  "Essays by Arun Kumaar Sreenivasan (Kiruk), a design engineer in Bengaluru, on design, code and a life of variation. Pick a year, then read from that machine.";

export const metadata: Metadata = {
  title: "Notebook",
  description: DESCRIPTION,
  alternates: { canonical: "/notebook" },
  openGraph: {
    images: [SHARE_IMAGE],
    type: "website",
    url: `${SITE_URL}/notebook`,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function NotebookLayout({ children }: { children: React.ReactNode }) {
  return <NotebookEraRoot chrome="notebook">{children}</NotebookEraRoot>;
}
