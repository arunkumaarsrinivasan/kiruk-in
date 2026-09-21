import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deskEnabled } from "@/lib/studio";
import { Editor } from "@/components/studio/Editor";

export const metadata: Metadata = {
  title: "Desk — Edit",
  robots: { index: false, follow: false },
};

export default async function DeskEditPage({
  params,
}: {
  params: Promise<{ collection: string; slug: string }>;
}) {
  if (!deskEnabled()) notFound();
  const { collection, slug } = await params;
  if (collection !== "blog" && collection !== "notes") notFound();
  return <Editor collection={collection} slug={slug} />;
}
