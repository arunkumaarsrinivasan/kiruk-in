import React, { useMemo } from 'react';
import { CaseStudy } from '../types';
import { SketchHeading } from '@/components/ui/sketch-elements';

interface FigmaPageProps {
  study: CaseStudy;
}

const FigmaPage: React.FC<FigmaPageProps> = React.memo(({ study }) => {
  const figmaEmbed = useMemo(() => study.figmaEmbed, [study.figmaEmbed]);

  return (
    <div className="p-8 space-y-6">
      <SketchHeading level={2} className="text-center mb-6 architect-font">Interactive Prototype</SketchHeading>
      {figmaEmbed ? (
        <div className="space-y-6">
          <div className="text-center">
            <iframe
              title={figmaEmbed.title}
              src={figmaEmbed.embedUrl}
              width="100%"
              height="450"
              allowFullScreen
              style={{ border: 0 }}
            />          </div>
          <div className="bg-white rounded-sm shadow-lg p-4 sketch-border">{figmaEmbed.description}</div>
          {study.links && Array.isArray(study.links) && study.links.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {study.links.map((link: { title: string; url: string; icon?: string }) => (
                <a key={link.url} href={link.url} className="underline text-blue-600 sketch-font" target="_blank" rel="noopener noreferrer">
                  {link.icon && <span className="mr-1">{link.icon}</span>}
                  {link.title}
                </a>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 sketch-font">No Figma embed available</div>
      )}
    </div>
  );
});

FigmaPage.displayName = 'FigmaPage';
export default FigmaPage;
