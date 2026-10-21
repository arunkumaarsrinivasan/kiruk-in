import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OpeningLab from "@/lab/opening/OpeningLab";

export const metadata: Metadata = {
  title: "Lab · Opening",
  robots: { index: false, follow: false },
};

/** The loader's opening on the real eye, with replay (docs/LOADER_OPENING_PLAN.md). Dev only. */
export default function LabOpeningPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <OpeningLab />;
}
