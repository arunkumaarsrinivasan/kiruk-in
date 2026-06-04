"use client";

/**
 * WorkObservatory — skills telescope (ObservatoryView). Opened from the
 * landing WORK.scope telescope box via the `observatory` module; navbar WORK
 * opens the project showcase deck instead.
 */

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useContextBar } from "@/contexts/ContextBarContext";
import { useExperience } from "@/hooks/usePortfolioData";

const ObservatoryView = dynamic(
  () =>
    import("@/app/work/components/ObservatoryView").then((m) => ({
      default: m.ObservatoryView,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full w-full items-center justify-center text-sm"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-main)" }}
      >
        ☉ calibrating telescope…
      </div>
    ),
  },
);

export function WorkObservatory() {
  const { setWorkData } = useContextBar();
  const experiencesData = useExperience();

  useEffect(() => {
    if (!experiencesData?.length) return;

    const experiences = experiencesData.map((exp) => ({
      id: exp.id,
      company: exp.company,
      start: exp.startDate,
      end: exp.endDate,
      current: exp.current,
    }));

    const currentExp = experiencesData.find((e) => e.current);

    setWorkData({
      experiences,
      currentExperienceId: currentExp?.id ?? experiencesData[0]?.id,
    });
  }, [experiencesData, setWorkData]);

  return (
    <div className="h-full min-h-0 w-full overflow-hidden">
      <ObservatoryView embedded />
    </div>
  );
}

export default WorkObservatory;
