/**
 * Page Information Data
 * 
 * Data-driven configuration for page-specific info displayed in the header.
 * Each page can have its own title, description, and hints.
 */

export interface PageInfo {
  path: string;
  title: string;
  subtitle: string;
  description: string;
  hint?: string;
  icon: string;
}

export const PAGE_INFO: Record<string, PageInfo> = {
  '/': {
    path: '/',
    title: 'HOME',
    subtitle: "What's this page",
    description: 'Interactive portfolio playground. Explore my work through the grid.',
    hint: 'Press PLAY to start a game',
    icon: 'home',
  },
  '/about': {
    path: '/about',
    title: 'ABOUT',
    subtitle: "What's this page",
    description: 'Learn about me, my journey, and what drives my creative process.',
    hint: 'Scroll to explore',
    icon: 'user',
  },
  '/work': {
    path: '/work',
    title: 'WORK',
    subtitle: "What's this page",
    description: 'A collection of projects and experiments I\'ve built over the years.',
    hint: 'Click cards to view details',
    icon: 'grid',
  },
  '/case-studies': {
    path: '/case-studies',
    title: 'PROJECTS',
    subtitle: "What's this page",
    description: 'Deep dives into selected projects with process and outcomes.',
    hint: 'Select a case study',
    icon: 'folder',
  },
  '/progress': {
    path: '/progress',
    title: 'PROGRESS',
    subtitle: "What's this page",
    description: 'Track my learning journey, goals, and skill development over time.',
    hint: 'View milestones',
    icon: 'chart',
  },
  '/arcade': {
    path: '/arcade',
    title: 'MINI GAMES',
    subtitle: "What's this page",
    description: 'Play interactive grid games. Reach 50 points to complete each mini game.',
    hint: 'Press PLAY to start',
    icon: 'globe',
  },
  '/contact': {
    path: '/contact',
    title: 'CONTACT',
    subtitle: "What's this page",
    description: 'Get in touch for collaborations, questions, or just to say hello.',
    hint: 'Fill in the form',
    icon: 'envelope',
  },
  '/roadmap': {
    path: '/roadmap',
    title: 'ROADMAP',
    subtitle: "What's this page",
    description: 'My personal and professional roadmap with future plans.',
    hint: 'Explore timeline',
    icon: 'clock',
  },
  '/life-roadmap': {
    path: '/life-roadmap',
    title: 'LIFE',
    subtitle: "What's this page",
    description: 'Life journey milestones, experiences, and memories.',
    hint: 'Scroll through time',
    icon: 'star',
  },
  '/theme-demo': {
    path: '/theme-demo',
    title: 'THEMES',
    subtitle: "What's this page",
    description: 'Preview all design eras and theme variations.',
    hint: 'Switch eras below',
    icon: 'themes',
  },
};

export const getPageInfo = (pathname: string): PageInfo => {
  // Exact match first
  if (PAGE_INFO[pathname]) {
    return PAGE_INFO[pathname];
  }
  
  // Check for dynamic routes (e.g., /case-studies/[id])
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 1) {
    const basePath = '/' + segments[0];
    if (PAGE_INFO[basePath]) {
      return {
        ...PAGE_INFO[basePath],
        title: PAGE_INFO[basePath].title,
        description: `Viewing ${segments.slice(1).join(' / ')}`,
      };
    }
  }
  
  // Default fallback
  return {
    path: pathname,
    title: 'PAGE',
    subtitle: "What's this page",
    description: 'Exploring the portfolio',
    icon: 'home',
  };
};
