import React, { useMemo } from 'react';
import { CaseStudy } from '../types';
import { SketchHeading } from '@/components/ui/sketch-elements';

interface BrandingPageProps {
  study: CaseStudy;
}

const BrandingPage: React.FC<BrandingPageProps> = React.memo(({ study }) => {
  const branding = useMemo(() => study.branding, [study.branding]);
  if (!branding) return null;
  return (
    <div className="p-8 space-y-6">
      <SketchHeading level={2} className="text-center mb-6 architect-font">Brand Identity</SketchHeading>
      <div className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-sm sketch-border">
          <p className="text-gray-700 leading-relaxed handwritten text-lg">{branding.description}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            {Array.isArray(branding.colors) && branding.colors.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {branding.colors.map((color: string) => (
                  <span key={color} className="inline-block w-6 h-6 rounded-full border border-gray-300" style={{ background: color }} title={color}></span>
                ))}
              </div>
            )}
            <div className="mt-2 text-sm sketch-font">Primary: {branding.typography.primary}, Secondary: {branding.typography.secondary}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

BrandingPage.displayName = 'BrandingPage';
export default BrandingPage;
