import Image from 'next/image';
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
    <div className="p-8 space-y-5">
      <SketchHeading level={2} className="text-center mb-6 architect-font">Sketching & Exploration</SketchHeading>
      <div className="space-y-10">
        <div className="bg-gray-50 p-4 rounded-none sketch-border">
          {sketching.description && <div className="handwritten text-base text-gray-700">{sketching.description}</div>}
        </div>
        {sketching.images && sketching.images.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {sketching.images.map((img: string, index: number) => (
              <div key={img} className="rounded-none overflow-hidden shadow sketch-border bg-white">
                <div className="relative w-full h-32">
                  <Image
                    src={img}
                    alt={`Sketching visual ${index + 1}`}
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

SketchingPage.displayName = 'SketchingPage';
export default SketchingPage;
