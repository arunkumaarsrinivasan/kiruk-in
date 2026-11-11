import { notFound } from "next/navigation";
import { portfolioData } from "@/data/portfolio-data";
import { getProjectCoverLabel } from "@/data/project-media";
import { getWorkCaseDigests } from "@/lib/content/work/digest";
import { WorkDesktop } from "../components/WorkDesktop";
import { NavTrailSet } from "@/components/layout/NavTrail";

export function generateStaticParams() {
  return portfolioData.projects.map((p) => ({ id: p.id }));
}

export default async function WorkProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = portfolioData.projects.find((p) => p.id === id);
  if (!project) notFound();

  return (
    <div
      className="relative z-10 min-h-dvh"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
        paddingTop: "var(--simple-game-nav-bottom, 4.5rem)",
      }}
    >
      <NavTrailSet items={[{ label: "Work", href: "/work" }, { label: getProjectCoverLabel(project.id, project.title) }]} />
      <WorkDesktop title={getProjectCoverLabel(project.id, project.title)} focusId={project.id} cases={getWorkCaseDigests()} />
    </div>
  );
}
