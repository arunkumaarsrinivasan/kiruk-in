import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EyeLab from "@/lab/eye/EyeLab";

export const metadata: Metadata = {
  title: "Lab · Eye",
  robots: { index: false, follow: false },
};

/** The TSL eye's workbench (docs/EYE_TSL_PLAN.md). Dev only. */
export default function LabEyePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <EyeLab />;
}
