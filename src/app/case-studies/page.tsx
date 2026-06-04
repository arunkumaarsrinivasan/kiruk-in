'use client';

import { CaseStudiesContent } from './components/case-studies-content';
import { RouteModuleShell } from '@/components/modules/RouteModuleShell';

export default function CaseStudies() {
  return (
    <RouteModuleShell icon="▦" label="Work · deep dives">
      <CaseStudiesContent />
    </RouteModuleShell>
  );
}
