import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CASE_STUDIES } from "@/app/case-studies/data";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const study = CASE_STUDIES.find((item) => item.id === id);
  if (!study) {
    return {
      title: "Case study coming soon",
      description: "This case study is still being written. Browse other work from Kiruk Studio.",
    };
  }
  return {
    title: study.title,
    description: study.summary,
    alternates: { canonical: `/work/${study.id}` },
  };
}

export default function WorkIdLayout({ children }: LayoutProps) {
  return children;
}
