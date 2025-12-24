import React, { useMemo } from 'react';
import { CaseStudy } from '../types';
import { SketchHeading } from '@/components/ui/sketch-elements';
import { motion } from 'framer-motion';

interface IdeationPageProps {
  study: CaseStudy;
}

// Memoized Key Insights Grid
const KeyInsightsGrid: React.FC<{ insights: string[] }> = React.memo(({ insights }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4 sketch-font">Key Insights</h3>
    <div className="grid md:grid-cols-3 gap-4">
      {insights.map((insight, i) => (
        <motion.div
          key={`insight-${i}-${insight.substring(0, 20)}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2 }}
          className="bg-white p-4 rounded-none shadow-sm sketch-border border-l-4 border-black"
        >
          <span className="block handwritten text-base text-gray-800">{insight}</span>
        </motion.div>
      ))}
    </div>
  </div>
));
KeyInsightsGrid.displayName = 'KeyInsightsGrid';

// Memoized Images Gallery
const IdeationImagesGallery: React.FC<{ images: string[] }> = React.memo(({ images }) => (
  <div className="mt-8">
    <h3 className="text-xl font-semibold mb-4 sketch-font">Ideation Visuals</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {images.map((img, idx) => (
        <div key={img + idx} className="rounded-none overflow-hidden shadow sketch-border bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={`Ideation visual ${idx + 1}`} className="w-full h-32 object-cover" loading="lazy" />
        </div>
      ))}
    </div>
  </div>
));
IdeationImagesGallery.displayName = 'IdeationImagesGallery';

const IdeationPage: React.FC<IdeationPageProps> = React.memo(({ study }) => {
  // Memoize ideation data for performance
  const ideation = useMemo(() => study.ideation, [study.ideation]);

  if (!ideation) return null;

  return (
    <div className="p-8 space-y-5">
      <SketchHeading level={2} className="text-center mb-6 architect-font">Ideation Process</SketchHeading>
      <div className="space-y-10">
        <div className="bg-gray-50 p-4 rounded-none sketch-border">
          <p className="text-gray-700 leading-relaxed handwritten text-lg">{ideation.description}</p>
        </div>
        {ideation.keyInsights && ideation.keyInsights.length > 0 && (
          <KeyInsightsGrid insights={ideation.keyInsights} />
        )}
        {ideation.images && ideation.images.length > 0 && (
          <IdeationImagesGallery images={ideation.images} />
        )}
      </div>
    </div>
  );
});
IdeationPage.displayName = 'IdeationPage';

export default IdeationPage;
