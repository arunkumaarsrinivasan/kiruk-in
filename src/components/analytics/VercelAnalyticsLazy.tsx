"use client";

import dynamic from "next/dynamic";

const SpeedInsights = dynamic(
  () =>
    import("@vercel/speed-insights/next").then((m) => m.SpeedInsights),
  { ssr: false },
);

const Analytics = dynamic(
  () => import("@vercel/analytics/react").then((m) => m.Analytics),
  { ssr: false },
);

/** Loads Vercel analytics after hydration so they stay off the critical path. */
export function VercelAnalyticsLazy() {
  return (
    <>
      <SpeedInsights />
      <Analytics />
    </>
  );
}
