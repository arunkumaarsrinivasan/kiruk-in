import React, { useMemo } from 'react';
import { CaseStudy } from '../types';
import { SketchHeading } from '@/components/ui/sketch-elements';

interface ColorsPageProps {
  study: CaseStudy;
}

const ColorsPage: React.FC<ColorsPageProps> = React.memo(({ study }) => {
  const colorTheory = useMemo(() => study.colorTheory, [study.colorTheory]);
  if (!colorTheory) return null;
  return (
    <div className="p-8 space-y-6">
      <SketchHeading level={2} className="text-center mb-6 architect-font">Color Theory</SketchHeading>
      <div className="space-y-8">
        <div className="text-center">
          <div className="flex justify-center space-x-4 mb-6">
            {Array.isArray(colorTheory.palette) && colorTheory.palette.length > 0 && colorTheory.palette.map((color: string) => (
              <span key={color} className="inline-block w-8 h-8 rounded-full border border-gray-300" style={{ background: color }} title={color}></span>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-sm shadow-sm sketch-border">
            <div className="handwritten text-base text-gray-700 mb-2">{colorTheory.description}</div>
            {colorTheory.psychology && <div className="text-sm text-gray-600 sketch-font">{colorTheory.psychology}</div>}
          </div>
        </div>
      </div>
    </div>
  );
});

ColorsPage.displayName = 'ColorsPage';
export default ColorsPage;
