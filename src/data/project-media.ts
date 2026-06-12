/**
 * Project media & external links — cover labels, Behance galleries, NDA flags.
 * Showcase cards use category covers (AI / Design / Web / Mobile) unless a
 * raster thumbnail path is set (jpg, png, webp).
 */

export const BEHANCE_PROFILE = 'https://www.behance.net/arunkusriniva' as const;

export interface ProjectMediaConfig {
  /** Short name on the category cover card */
  coverLabel: string;
  /** Raster screenshot path when available; SVG placeholders are ignored */
  thumbnail?: string;
  /** Direct Behance gallery URL when known; otherwise profile */
  behance?: string;
  nda?: boolean;
}

/** Per-project media overrides. */
export const PROJECT_MEDIA: Record<string, ProjectMediaConfig> = {
  'spera-platform': {
    coverLabel: 'Spera',
    behance: BEHANCE_PROFILE,
  },
  'hp-print-ai': {
    coverLabel: 'HP Print AI',
    nda: true,
  },
  'mudra-ai-stack': {
    coverLabel: 'Mudra Stack',
    nda: true,
  },
  'get-my-prints': {
    coverLabel: 'Get My Prints',
    nda: true,
  },
  'hp-print-learn-center': {
    coverLabel: 'Print Learn Center',
    nda: true,
  },
  'hp-onboarding-app': {
    coverLabel: 'HP Onboarding',
    nda: true,
  },
  'square-bridge': {
    coverLabel: 'Square Bridge',
    behance: BEHANCE_PROFILE,
  },
  'peoplegamez-hr': {
    coverLabel: 'PeopleGamez',
  },
  'foodies-buddies': {
    coverLabel: 'Foodies Buddies',
    behance: BEHANCE_PROFILE,
  },
  desirable: {
    coverLabel: 'Desirable',
    behance: BEHANCE_PROFILE,
  },
  'prags-website': {
    coverLabel: 'PRAGS',
  },
  'portfolio-v3': {
    coverLabel: 'KIRUK',
  },
};

function shortTitleFromProject(title: string): string {
  return title.split('—')[0]?.split(' - ')[0]?.trim() ?? title;
}

export function getProjectCoverLabel(projectId: string, title: string): string {
  return PROJECT_MEDIA[projectId]?.coverLabel ?? shortTitleFromProject(title);
}

export function getProjectThumbnail(projectId: string, fallback?: string): string | undefined {
  return PROJECT_MEDIA[projectId]?.thumbnail ?? fallback;
}

export function isProjectNda(projectId: string): boolean {
  return PROJECT_MEDIA[projectId]?.nda === true;
}

export function getProjectBehanceUrl(projectId: string): string | undefined {
  return PROJECT_MEDIA[projectId]?.behance;
}
