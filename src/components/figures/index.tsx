/**
 * Figures for anything written in MDX on this site: mdxcn's text-drawn
 * timelines, tables, steps, stats and trees (source in src/registry/default),
 * in the era's colours. An author writes a Markdown list or table inside the
 * tag; no imports, no props beyond a title.
 *
 * Every figure here is framed by a dashed rule above and below, never a box:
 * Read has no boxes (docs/READ_DIRECTORY_PLAN.md).
 */
import type { ComponentProps } from "react";
import { Callout as BaseCallout } from "@/registry/default/callout/callout";
import { GraphCompare as BaseCompare } from "@/registry/default/graph-compare/graph-compare";
import { GraphKpi as BaseKpi } from "@/registry/default/graph-kpi/graph-kpi";
import { GraphSpec as BaseSpec } from "@/registry/default/graph-spec/graph-spec";
import { GraphStat as BaseStat } from "@/registry/default/graph-stat/graph-stat";
import { GraphTable as BaseTable } from "@/registry/default/graph-table/graph-table";
import { GraphTimeline as BaseTimeline } from "@/registry/default/graph-timeline/graph-timeline";
import { GraphTree as BaseTree } from "@/registry/default/graph-tree/graph-tree";
import { Quote as BaseQuote } from "@/registry/default/quote/quote";
import { Steps as BaseSteps } from "@/registry/default/steps/steps";
import "@/registry/default/mdxcn.css";

const cls = (className?: string) => `mdx-figure${className ? ` ${className}` : ""}`;

export function GraphTimeline({ className, ...p }: ComponentProps<typeof BaseTimeline>) {
  return <BaseTimeline frame="rule" {...p} className={cls(className)} />;
}
export function GraphTable({ className, ...p }: ComponentProps<typeof BaseTable>) {
  return <BaseTable frame="rule" {...p} className={cls(className)} />;
}
export function GraphStat({ className, ...p }: ComponentProps<typeof BaseStat>) {
  return <BaseStat frame="rule" {...p} className={cls(className)} />;
}
export function GraphSpec({ className, ...p }: ComponentProps<typeof BaseSpec>) {
  return <BaseSpec frame="rule" {...p} className={cls(className)} />;
}
export function GraphTree({ className, ...p }: ComponentProps<typeof BaseTree>) {
  return <BaseTree frame="rule" {...p} className={cls(className)} />;
}
export function GraphKpi({ className, ...p }: ComponentProps<typeof BaseKpi>) {
  return <BaseKpi frame="rule" {...p} className={cls(className)} />;
}
export function GraphCompare({ className, ...p }: ComponentProps<typeof BaseCompare>) {
  return <BaseCompare frame="rule" {...p} className={cls(className)} />;
}
export function Steps({ className, ...p }: ComponentProps<typeof BaseSteps>) {
  return <BaseSteps frame="rule" {...p} className={cls(className)} />;
}
export function Callout({ className, ...p }: ComponentProps<typeof BaseCallout>) {
  return <BaseCallout frame="rule" {...p} className={cls(className)} />;
}
export function Quote({ className, ...p }: ComponentProps<typeof BaseQuote>) {
  return <BaseQuote frame="rule" {...p} className={cls(className)} />;
}

/** The map an MDX renderer spreads into its components. */
export const FIGURES = {
  GraphTimeline,
  GraphTable,
  GraphStat,
  GraphSpec,
  GraphTree,
  GraphKpi,
  GraphCompare,
  Steps,
  Callout,
  Quote,
};
