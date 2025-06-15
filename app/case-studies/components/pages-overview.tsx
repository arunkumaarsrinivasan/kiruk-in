import React, { useMemo } from 'react';
import { CaseStudy } from '../../types';
import { SketchHeading } from '@/components/ui/sketch-elements';

interface OverviewPageProps {
  study: CaseStudy;
}

// Architectural note: This component is memoized for performance and is intended to be used as a page in the CaseStudyBook.
// - All layout and animation logic is isolated here for maintainability.
// - If the process or final result sections grow, extract them into their own subcomponents.
// - All text uses the handwritten or sketch font for visual consistency.
// - Responsive and accessible by design.

const OverviewPage: React.FC<OverviewPageProps> = React.memo(({ study }) => {
  const memoStudy = useMemo(() => study, [study]);
  if (!memoStudy) return null;
  return (
    <div className="p-8 space-y-6">
      <div className="text-center mb-8">
        <SketchHeading level={1} className="text-3xl mb-4 architect-font">{memoStudy.title}</SketchHeading>
        {memoStudy.summary && <p className="mb-4 handwritten text-lg text-gray-700">{memoStudy.summary}</p>}
        {Array.isArray(memoStudy.steps) && memoStudy.steps.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            {memoStudy.steps.map((step: { label: string; desc: string }, i: number) => (
              <div key={step.label} className="bg-white rounded shadow sketch-border px-4 py-2">
                <div className="font-bold sketch-font text-base">{step.label}</div>
                <div className="handwritten text-sm text-gray-600">{step.desc}</div>
              </div>
            ))}
          </div>
        )}
        {Array.isArray((memoStudy as any).technologies) && (memoStudy as any).technologies.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {(memoStudy as any).technologies.map((tech: string, i: number) => (
              <span key={tech} className="px-3 py-1 bg-gray-100 rounded-full text-xs sketch-font border border-gray-300">{tech}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

OverviewPage.displayName = 'OverviewPage';
export default OverviewPage;
