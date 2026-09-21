"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { withNotebookEraHref } from "@/lib/notebook";
import { useNotebookEraOptional } from "./NotebookEraContext";

/** In-notebook links keep the year you warped to. */
export function NotebookLink({
  href,
  ...props
}: ComponentProps<typeof Link>) {
  const eraId = useNotebookEraOptional()?.eraId;
  const next =
    typeof href === "string" && eraId ? withNotebookEraHref(href, eraId) : href;
  return <Link href={next} {...props} />;
}
