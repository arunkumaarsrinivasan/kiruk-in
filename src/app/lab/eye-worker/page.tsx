import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EyeWorkerLab from "@/lab/eye-worker/EyeWorkerLab";

export const metadata: Metadata = {
  title: "Lab · Eye worker",
  robots: { index: false, follow: false },
};

/** P0 spike (docs/EYE_WORKER_PLAN.md). Dev only; a local production build for measuring sets LAB_ROUTES=1. */
export default function LabEyeWorkerPage() {
  if (process.env.NODE_ENV === "production" && process.env.LAB_ROUTES !== "1") notFound();
  return <EyeWorkerLab />;
}
