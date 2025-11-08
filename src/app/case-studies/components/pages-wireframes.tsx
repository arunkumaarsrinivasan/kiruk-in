import Image from 'next/image';
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
            {wireframes.images.map((img: string, index: number) => (
              <div key={img} className="rounded overflow-hidden shadow sketch-border bg-white">
                <div className="relative w-full h-32">
                  <Image
                    src={img}
                    alt={`Wireframe visual ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (min-width: 768px) 50vw"
                  />
                </div>
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
