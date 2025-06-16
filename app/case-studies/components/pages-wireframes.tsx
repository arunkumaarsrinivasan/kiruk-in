import React, { useMemo } from 'react';
import { CaseStudy } from '../types';
import { SketchHeading } from '@/components/ui/sketch-elements';

interface WireframesPageProps {
  study: CaseStudy;
}

const WireframesPage: React.FC<WireframesPageProps> = React.memo(({ study }) => {
  const wireframes = useMemo(() => study.wireframes, [study.wireframes]);
  if (!wireframes) return null;
  return (
    <div className="p-8 space-y-6">
      <SketchHeading level={2} className="text-center mb-6 architect-font">Wireframes & Structure</SketchHeading>
      <div className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-sm sketch-border">
          {wireframes.description && <div className="handwritten text-base text-gray-700">{wireframes.description}</div>}
        </div>
        {wireframes.images && wireframes.images.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {wireframes.images.map((img: string, i: number) => (
              <div key={img} className="rounded overflow-hidden shadow sketch-border bg-white">
                <img src={img} alt={`Wireframe visual ${i + 1}`} className="w-full h-32 object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

WireframesPage.displayName = 'WireframesPage';
export default WireframesPage;
