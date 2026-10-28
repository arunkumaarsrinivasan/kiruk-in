import type { Metadata } from "next";
import { NotebookEraRoot } from "@/components/notebook";
import { SHARE_IMAGE, SITE_URL } from "@/lib/site";

const TITLE = "Notebook — Kiruk Studio";
const DESCRIPTION =
  "Kiruk Studio notebook. Warp to a year you lived in, then read from that machine.";

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
