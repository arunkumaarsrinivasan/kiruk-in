import React, { useMemo } from 'react';
import { CaseStudy } from '../../types';
import { SketchHeading } from '@/components/ui/sketch-elements';

interface FinalPageProps {
  study: CaseStudy;
}

const FinalPage: React.FC<FinalPageProps> = React.memo(({ study }) => {
  const finalScreens = useMemo(() => study.finalScreens, [study.finalScreens]);
  if (!finalScreens) return null;
  return (
    <div className="p-8 space-y-6">
      <SketchHeading level={2} className="text-center mb-6 architect-font">Final Design</SketchHeading>
      <div className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-sm sketch-border">
          {finalScreens.description && <div className="handwritten text-base text-gray-700">{finalScreens.description}</div>}
        </div>
        {finalScreens.features && Array.isArray(finalScreens.features) && finalScreens.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {finalScreens.features.map((feature: string) => (
              <span key={feature} className="px-3 py-1 bg-gray-100 rounded-full text-xs sketch-font border border-gray-300">{feature}</span>
            ))}
          </div>
        )}
        {finalScreens.images && finalScreens.images.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            {finalScreens.images.map((img: string, i: number) => (
              <div key={img} className="rounded overflow-hidden shadow sketch-border bg-white">
                <img src={img} alt={`Final visual ${i + 1}`} className="w-full h-32 object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        )}
        {study.results && Array.isArray(study.results) && study.results.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {study.results.map((result: any) => (
              typeof result === 'string' ? (
                <div key={result} className="text-center p-4 bg-white rounded-sm shadow-sm sketch-border">
                  <div className="font-medium sketch-font">{result}</div>
                </div>
              ) : (
                <div key={`result-${result.metric ?? result.value ?? Math.random()}`} className="text-center p-4 bg-white rounded-sm shadow-sm sketch-border">
                  <div className="text-2xl font-bold text-black mb-1 architect-font">{result.value}</div>
                  <div className="font-medium sketch-font">{result.metric}</div>
                  {result.description && (
                    <div className="text-sm text-gray-600 mt-1 handwritten">{result.description}</div>
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

FinalPage.displayName = 'FinalPage';
export default FinalPage;
