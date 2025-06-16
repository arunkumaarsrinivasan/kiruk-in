import React, { useMemo } from 'react';
import { CaseStudy } from '../types';
import { SketchHeading } from '@/components/ui/sketch-elements';

interface SketchingPageProps {
  study: CaseStudy;
}

const SketchingPage: React.FC<SketchingPageProps> = React.memo(({ study }) => {
  const sketching = useMemo(() => study.sketching, [study.sketching]);
  if (!sketching) return null;
  return (
    <div className="p-8 space-y-6">
      <SketchHeading level={2} className="text-center mb-6 architect-font">Sketching & Exploration</SketchHeading>
      <div className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-sm sketch-border">
          {sketching.description && <div className="handwritten text-base text-gray-700">{sketching.description}</div>}
        </div>
        {sketching.images && sketching.images.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {sketching.images.map((img: string, i: number) => (
              <div key={img} className="rounded overflow-hidden shadow sketch-border bg-white">
                <img src={img} alt={`Sketching visual ${i + 1}`} className="w-full h-32 object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

SketchingPage.displayName = 'SketchingPage';
export default SketchingPage;
