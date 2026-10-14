import type { Metadata } from "next";
import type { ReactNode } from "react";
import { portfolioData } from "@/data/portfolio-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = portfolioData.projects.find((p) => p.id === id);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/work/${project.id}` },
    openGraph: { title: project.title, description: project.description, url: `/work/${project.id}` },
  };
}

export default function WorkIdLayout({ children }: { children: ReactNode }) {
  return children;
}
