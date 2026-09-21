import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deskEnabled } from "@/lib/studio";
import { Dashboard } from "@/components/studio/Dashboard";

export const metadata: Metadata = {
  title: "Desk",
  robots: { index: false, follow: false },
};

export default function DeskPage() {
  if (!deskEnabled()) notFound();
  return <Dashboard />;
}
