import type { Metadata } from "next";
import type { ReactNode } from "react";
import { portfolioData } from "@/data/portfolio-data";
import { SHARE_IMAGE } from "@/lib/site";

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
    alternates: {
      canonical: `/work/${project.id}`,
      // the same page as plain Markdown, for readers and engines the desktop cannot serve
      types: { "text/markdown": `/work/${project.id}/agent.md` },
    },
    openGraph: { images: [SHARE_IMAGE], title: project.title, description: project.description, url: `/work/${project.id}` },
  };
}

export default function WorkIdLayout({ children }: { children: ReactNode }) {
  return children;
}
