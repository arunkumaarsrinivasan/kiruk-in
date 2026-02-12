// Centralized Portfolio Data Structure
// This data will be theme-agnostic and reusable across all themes

export interface ThemeConfig {
  id: string;
  name: string;
  era: string;
  description: string;
  lesson: string;
  heritage: string;
  keyElements: string[];
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    primary: string;      // Display font for headings
    secondary: string;    // Text font for body
    accent: string;       // UI elements
  };
  style: 'sketch' | 'minimal' | 'absurd';
  // NEW: Era-specific design tokens for visual time-travel
  designTokens: {
    gridSize: number | null;  // null = no grid (post-2022), 4-48px
    gridOpacity: number;      // 0-1
    borderRadius: number;     // 0-32px
    shadowStyle: 'none' | 'hard' | 'soft' | 'glow' | 'glass' | 'neumorphic' | 'inset';
    shadowIntensity: number;  // 0-100
    effects: string[];        // Era-specific visual effects
    letterSpacing: number;    // -2 to 5 (em * 0.01)
    lineHeight: number;       // 1.2 to 2.0
    animationStyle: 'none' | 'blink' | 'pulse' | 'float' | 'morph' | 'glitch';
  };
}

export interface PersonalInfo {
  name: string;
  fullName: string;
  title: string;
  location: string;
  bio: string;
  tagline: string;
  email: string;
  linkedin: string;
  github: string;
  phone?: string;
  resumeUrl?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'design' | 'tools' | 'soft';
  level: number; // 1-10
  icon: string;
  description: string;
  yearsOfExperience: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: 'web' | 'mobile' | 'design' | 'ai' | 'other';
  status: 'completed' | 'in-progress' | 'planned';
  technologies: string[];
  features: string[];
  challenges: string[];
  learnings: string[];
  images: {
    thumbnail: string;
    gallery: string[];
    mockups?: string[];
  };
  links: {
    live?: string;
    github?: string;
    demo?: string;
    figma?: string;
  };
  metrics?: {
    users?: number;
    performance?: string;
    impact?: string;
  };
  timeline: {
    startDate: string;
    endDate?: string;
    duration: string;
  };
  teamSize?: number;
  role: string;
  tags: string[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  projects: string[]; // Project IDs
  companyLogo?: string;
  companyWebsite?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string[];
  relevantCourses?: string[];
  projects?: string[];
  activities?: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  verificationUrl?: string;
  logo?: string;
  skills: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishDate: string;
  lastModified: string;
  category: string;
  tags: string[];
  readTime: number;
  featured: boolean;
  thumbnail?: string;
  author: string;
  status: 'published' | 'draft' | 'archived';
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  content: string;
  avatar?: string;
  rating?: number;
  date: string;
  projectId?: string;
  linkedinUrl?: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  location: string;
  availability: 'available' | 'busy' | 'not-available';
  preferredContact: 'email' | 'phone' | 'linkedin';
  responseTime: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  dribbble?: string;
  behance?: string;
  medium?: string;
  youtube?: string;
  discord?: string;
  playbook?: string;
}

export interface PortfolioData {
  personal: PersonalInfo;
  contact: ContactInfo;
  social: SocialLinks;
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  blog: BlogPost[];
  testimonials: Testimonial[];
  impactMetrics: ImpactMetric[];
  whyUXDesignEngineer: WhyUXDesignEngineer;
  metadata: {
    version: string;
    lastUpdated: string;
    seo: {
      title: string;
      description: string;
      keywords: string[];
      ogImage: string;
    };
  };
}

// Impact Metrics - quantified outcomes for Results section
export interface ImpactMetric {
  id: string;
  value: string;        // "45%", "12+", "60%"
  label: string;        // "engagement increase"
  category: 'performance' | 'delivery' | 'scale' | 'impact';
  icon: string;
  context?: string;     // "on HP design system"
}

// Why UX Design Engineer narrative
export interface WhyUXDesignEngineer {
  hook: string;         // Opening line
  painPoint: string;    // The problem
  solution: string;     // Your value proposition
  tagline: string;      // Memorable close
}

// Available Themes - with era-specific design tokens, celebrated fonts, and advanced effects
export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: '1970',
    name: '1970: Terminal & ASCII',
    era: 'Pre-Web Foundations',
    description: 'Phosphor green on black void. No mouse, no windows -- just a blinking cursor awaiting your command. Every pixel was earned through keystrokes on these CRT monoliths.',
    lesson: 'When your only tool is typography, every character carries weight.',
    heritage: "The CLI never died. Today's terminal-inspired portfolios and VS Code themes are direct descendants.",
    keyElements: ['Monospace grids', 'Blinking block cursor', 'Phosphor afterglow', 'ASCII box-drawing'],
    preview: '/themes/1970-terminal.jpg',
    colors: {
      primary: '#00ff41',
      secondary: '#003b00',
      accent: '#39ff14',
      background: '#000000',
      text: '#00ff41',
    },
    fonts: {
      primary: '"VT323", monospace',
      secondary: '"IBM Plex Mono", monospace',
      accent: '"VT323", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 48,
      gridOpacity: 0.12,
      borderRadius: 0,
      shadowStyle: 'glow',
      shadowIntensity: 85,
      effects: ['crt-scanlines', 'phosphor-glow', 'screen-flicker', 'text-shadow-glow'],
      letterSpacing: 3,
      lineHeight: 1.4,
      animationStyle: 'blink',
    },
  },
  {
    id: '1981',
    name: '1981: Xerox Star & Early GUI',
    era: 'Pre-Web GUI Experimentation',
    description: 'Bitmap windows floating on gray. The Xerox Star introduced icons, folders, and the desktop metaphor -- computing you could point at instead of type into.',
    lesson: 'Visual metaphors let anyone navigate complexity without a manual.',
    heritage: 'Every windowed OS, every drag-and-drop interaction traces back to this moment.',
    keyElements: ['Bitmap icons', 'Window title bars', 'Pixel-perfect borders', 'Scroll bars'],
    preview: '/themes/1981-xerox.jpg',
    colors: {
      primary: '#000080',
      secondary: '#808080',
      accent: '#0000aa',
      background: '#c0c0c0',
      text: '#000000',
    },
    fonts: {
      primary: '"Pixelify Sans", "Courier New", monospace',
      secondary: '"IBM Plex Sans", "Helvetica", sans-serif',
      accent: '"IBM Plex Mono", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 40,
      gridOpacity: 0.06,
      borderRadius: 0,
      shadowStyle: 'hard',
      shadowIntensity: 100,
      effects: ['pixel-border', 'bevel-edge', 'bitmap-dither', 'window-chrome'],
      letterSpacing: 0,
      lineHeight: 1.3,
      animationStyle: 'none',
    },
  },
  {
    id: '1991',
    name: '1991: The First Web Page',
    era: 'Early Web (1990-1995)',
    description: 'Tim Berners-Lee typed it out: Times New Roman on white, blue underlined links, zero decoration. The web was born as a document, not a design.',
    lesson: 'The hyperlink -- not the layout -- was the revolution.',
    heritage: "Wikipedia, academic sites, and every unstyled HTML page carries this DNA.",
    keyElements: ['Blue underlined links', 'Times New Roman body', 'Single-column flow', 'Visited purple'],
    preview: '/themes/1991-html.jpg',
    colors: {
      primary: '#0000ee',
      secondary: '#c0c0c0',
      accent: '#551a8b',
      background: '#ffffff',
      text: '#000000',
    },
    fonts: {
      primary: '"Times New Roman", "Iowan Old Style", serif',
      secondary: '"Times New Roman", Georgia, serif',
      accent: '"Courier", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 32,
      gridOpacity: 0.03,
      borderRadius: 0,
      shadowStyle: 'none',
      shadowIntensity: 0,
      effects: ['underline-links', 'visited-purple', 'hr-groove'],
      letterSpacing: 0,
      lineHeight: 1.6,
      animationStyle: 'none',
    },
  },
  {
    id: '1993',
    name: '1993: Mosaic & Netscape',
    era: 'Early Web (1990-1995)',
    description: 'Images finally loaded in the browser. Gray toolbars, beveled frames, and the first taste of visual chaos. Everyone became a webmaster overnight.',
    lesson: 'When you give people images and tables, they will build anything.',
    heritage: 'The indie web revival and Neocities communities keep this spirit alive.',
    keyElements: ['Gray system chrome', 'Beveled frames', 'Inline images', '3D rule lines'],
    preview: '/themes/1993-mosaic.jpg',
    colors: {
      primary: '#0000ff',
      secondary: '#c0c0c0',
      accent: '#ff0000',
      background: '#c0c0c0',
      text: '#000000',
    },
    fonts: {
      primary: '"Arial Black", "Impact", sans-serif',
      secondary: '"Arial", "Helvetica", sans-serif',
      accent: '"Courier New", monospace',
    },
    style: 'absurd',
    designTokens: {
      gridSize: 28,
      gridOpacity: 0.1,
      borderRadius: 0,
      shadowStyle: 'hard',
      shadowIntensity: 70,
      effects: ['tiled-background', 'blink-text', 'marquee-scroll', 'table-border'],
      letterSpacing: 0,
      lineHeight: 1.5,
      animationStyle: 'blink',
    },
  },
  {
    id: '1995',
    name: '1995: GeoCities Explosion',
    era: 'GeoCities Chaos (1995-2000)',
    description: 'Neon text on starfield backgrounds, MIDI autoplay, visitor counters, and guestbooks. Every page was a personal universe of clashing colors and spinning GIFs.',
    lesson: 'Unfiltered self-expression beats polished perfection.',
    heritage: 'Vaporwave aesthetics and the maximalism revival owe everything to GeoCities.',
    keyElements: ['Starfield backgrounds', 'Animated GIFs', 'Visitor counters', 'Under Construction banners'],
    preview: '/themes/1995-geocities.jpg',
    colors: {
      primary: '#ffff00',
      secondary: '#ff00ff',
      accent: '#00ffff',
      background: '#000033',
      text: '#ffff99',
    },
    fonts: {
      primary: '"Comic Sans MS", "Chalkboard", cursive',
      secondary: '"Arial", sans-serif',
      accent: '"Courier New", monospace',
    },
    style: 'absurd',
    designTokens: {
      gridSize: 24,
      gridOpacity: 0.15,
      borderRadius: 0,
      shadowStyle: 'glow',
      shadowIntensity: 95,
      effects: ['neon-glow', 'star-cursor', 'rainbow-text', 'gif-spinner', 'visitor-counter'],
      letterSpacing: 1,
      lineHeight: 1.4,
      animationStyle: 'blink',
    },
  },
  {
    id: '1997',
    name: '1997: Corporate Web & Frames',
    era: 'GeoCities Chaos (1995-2000)',
    description: 'Navy blue gradients, gold beveled buttons, and three-column table layouts. Corporations discovered the web and brought their boardroom aesthetic with them.',
    lesson: 'Structure and brand identity tame the chaos.',
    heritage: 'Enterprise dashboards and news portals still echo this rigid hierarchy.',
    keyElements: ['Framesets', 'Beveled gold buttons', 'Gradient nav bars', 'Spacer GIFs'],
    preview: '/themes/1997-corporate.jpg',
    colors: {
      primary: '#ffd700',
      secondary: '#1a3a5c',
      accent: '#cc8400',
      background: '#001529',
      text: '#e8dcc8',
    },
    fonts: {
      primary: '"Verdana", "Tahoma", sans-serif',
      secondary: '"Georgia", "Times", serif',
      accent: '"Verdana", sans-serif',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 20,
      gridOpacity: 0.08,
      borderRadius: 0,
      shadowStyle: 'hard',
      shadowIntensity: 80,
      effects: ['table-cell-border', 'gradient-nav', 'beveled-button', 'frame-border'],
      letterSpacing: 0,
      lineHeight: 1.5,
      animationStyle: 'none',
    },
  },
  {
    id: '2000',
    name: '2000: CSS Zen Garden',
    era: 'CSS Revolution (2000-2005)',
    description: 'Separation of content and style changed everything. CSS Zen Garden proved one HTML file could wear a thousand faces. Web standards won.',
    lesson: 'Separating structure from style is the foundation of all design systems.',
    heritage: 'Every CSS framework, every theme engine, every design token traces back here.',
    keyElements: ['CSS-only styling', 'Semantic HTML', 'Soft drop shadows', 'Centered layouts'],
    preview: '/themes/2000-css.jpg',
    colors: {
      primary: '#336699',
      secondary: '#993333',
      accent: '#669933',
      background: '#f5f0e8',
      text: '#333333',
    },
    fonts: {
      primary: '"Trebuchet MS", "Gill Sans", sans-serif',
      secondary: '"Verdana", "DejaVu Sans", sans-serif',
      accent: '"Georgia", serif',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 16,
      gridOpacity: 0.05,
      borderRadius: 3,
      shadowStyle: 'soft',
      shadowIntensity: 35,
      effects: ['box-shadow-soft', 'rounded-corners', 'hover-underline', 'gradient-header'],
      letterSpacing: 0,
      lineHeight: 1.6,
      animationStyle: 'none',
    },
  },
  {
    id: '2003',
    name: '2003: Web 2.0 Candy',
    era: 'CSS Revolution (2000-2005)',
    description: 'Glossy buttons, candy gradients, reflection effects, and the "beta" badge. Flickr, Digg, del.icio.us -- startups wore their optimism in orange and rounded corners.',
    lesson: 'Depth and shine make software feel alive and premium.',
    heritage: 'SaaS landing pages with gradient heroes are the direct descendants.',
    keyElements: ['Glossy pill buttons', 'Star ratings', 'RSS orange', 'Reflection effects'],
    preview: '/themes/2003-web2.jpg',
    colors: {
      primary: '#ff6600',
      secondary: '#0088cc',
      accent: '#ff3366',
      background: '#ffffff',
      text: '#2c3e50',
    },
    fonts: {
      primary: '"Lucida Grande", "Lucida Sans", sans-serif',
      secondary: '"Helvetica Neue", "Arial", sans-serif',
      accent: '"Lucida Grande", sans-serif',
    },
    style: 'absurd',
    designTokens: {
      gridSize: 14,
      gridOpacity: 0.04,
      borderRadius: 10,
      shadowStyle: 'soft',
      shadowIntensity: 55,
      effects: ['glossy-gradient', 'reflection-shine', 'badge-3d', 'rounded-pill'],
      letterSpacing: 0,
      lineHeight: 1.6,
      animationStyle: 'pulse',
    },
  },
  {
    id: '2006',
    name: '2006: Apple & Blog Renaissance',
    era: 'Early Responsive & Minimalism (2006-2012)',
    description: 'Apple.com set the standard: vast whitespace, hero product shots, and understated elegance. WordPress blogs flourished with this clean aesthetic.',
    lesson: 'Whitespace is not empty -- it is the most powerful design element.',
    heritage: 'Every product landing page with a centered hero image traces back to 2006 Apple.',
    keyElements: ['Product hero shots', 'Generous whitespace', 'Subtle gray gradients', 'Clean navigation'],
    preview: '/themes/2006-refined.jpg',
    colors: {
      primary: '#1d1d1f',
      secondary: '#86868b',
      accent: '#0071e3',
      background: '#fbfbfd',
      text: '#1d1d1f',
    },
    fonts: {
      primary: '"Myriad Pro", "Segoe UI", sans-serif',
      secondary: '"Lucida Sans", "Trebuchet MS", sans-serif',
      accent: '"Helvetica Neue", sans-serif',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 12,
      gridOpacity: 0.03,
      borderRadius: 6,
      shadowStyle: 'soft',
      shadowIntensity: 25,
      effects: ['subtle-gradient', 'generous-padding', 'smooth-transition', 'tab-rounded'],
      letterSpacing: -0.5,
      lineHeight: 1.7,
      animationStyle: 'none',
    },
  },
  {
    id: '2009',
    name: '2009: iPhone & Touch Web',
    era: 'Early Responsive & Minimalism (2006-2012)',
    description: 'The iPhone rewrote the rules. Touch targets, Retina displays, and the birth of responsive thinking. Skeuomorphic leather and felt on mobile, clean web on desktop.',
    lesson: 'Design for fingers, not cursors. Mobile-first changes everything.',
    heritage: 'Responsive frameworks and mobile-first methodology were born from this pressure.',
    keyElements: ['44px touch targets', 'Retina-ready assets', 'Skeuomorphic textures', 'App-like navigation'],
    preview: '/themes/2009-responsive.jpg',
    colors: {
      primary: '#007aff',
      secondary: '#5856d6',
      accent: '#34c759',
      background: '#f2f2f7',
      text: '#1c1c1e',
    },
    fonts: {
      primary: '"Helvetica Neue", "SF Pro Display", sans-serif',
      secondary: '"Helvetica Neue", system-ui, sans-serif',
      accent: '"Menlo", "SF Mono", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 10,
      gridOpacity: 0.03,
      borderRadius: 10,
      shadowStyle: 'soft',
      shadowIntensity: 35,
      effects: ['css3-gradient', 'border-radius-smooth', 'media-query-grid', 'touch-target'],
      letterSpacing: -0.5,
      lineHeight: 1.5,
      animationStyle: 'none',
    },
  },
  {
    id: '2010',
    name: '2010: Metro & Bootstrap',
    era: 'Early Responsive & Minimalism (2006-2012)',
    description: 'Windows Phone Metro smashed skeuomorphism with bold tiles and pure typography. Meanwhile, Bootstrap gave every developer a grid system overnight.',
    lesson: 'Content IS the interface. Chrome is unnecessary.',
    heritage: 'Every utility-first CSS framework and tile-based dashboard owes Metro a debt.',
    keyElements: ['Bold color tiles', 'Segoe UI typography', 'Edge-to-edge content', '12-column grids'],
    preview: '/themes/2010-flat.jpg',
    colors: {
      primary: '#0078d7',
      secondary: '#107c10',
      accent: '#ff8c00',
      background: '#1b1b1b',
      text: '#ffffff',
    },
    fonts: {
      primary: '"Segoe UI", "Fira Sans", sans-serif',
      secondary: '"Segoe UI", system-ui, sans-serif',
      accent: '"Consolas", "Fira Mono", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 8,
      gridOpacity: 0.04,
      borderRadius: 0,
      shadowStyle: 'none',
      shadowIntensity: 0,
      effects: ['flat-color-block', 'crisp-border', 'bold-cta', 'grid-12-column'],
      letterSpacing: 0,
      lineHeight: 1.4,
      animationStyle: 'none',
    },
  },
  {
    id: '2013',
    name: '2013: iOS 7 Flat Revolution',
    era: 'Flat Design Era (2013-2015)',
    description: 'Jony Ive stripped iOS to the bone. No textures, no shadows, no compromise. Thin Helvetica, frosted panels, and vibrant pastels redefined mobile and rippled across the web.',
    lesson: 'True simplicity is not the absence of clutter but the presence of clarity.',
    heritage: 'Every modern design system -- from Figma to Tailwind -- builds on flat principles.',
    keyElements: ['Ultra-thin typography', 'Frosted blur panels', 'Vivid pastels', 'Zero chrome'],
    preview: '/themes/2013-flat.jpg',
    colors: {
      primary: '#007aff',
      secondary: '#ff2d55',
      accent: '#ffcc00',
      background: '#f2f2f7',
      text: '#1c1c1e',
    },
    fonts: {
      primary: '"Helvetica Neue", "San Francisco", sans-serif',
      secondary: '"Helvetica Neue", system-ui, sans-serif',
      accent: '"Avenir Next", sans-serif',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 8,
      gridOpacity: 0.02,
      borderRadius: 12,
      shadowStyle: 'none',
      shadowIntensity: 0,
      effects: ['flat-color', 'no-gradient', 'sharp-edge', 'pastel-palette'],
      letterSpacing: 0,
      lineHeight: 1.5,
      animationStyle: 'none',
    },
  },
  {
    id: '2014',
    name: '2014: Material Design',
    era: 'Flat Design Era (2013-2015)',
    description: "Google's answer to flat: paper metaphor with elevation, motion, and the sacred 8dp grid. Ripple feedback, floating action buttons, and a color system that scaled to billions of devices.",
    lesson: 'Flat needs depth cues. Elevation and motion create hierarchy without ornament.',
    heritage: 'Component libraries worldwide adopted elevation tokens and motion curves from Material.',
    keyElements: ['8dp baseline grid', 'Elevation shadows', 'Ripple touch feedback', 'FAB buttons'],
    preview: '/themes/2014-material.jpg',
    colors: {
      primary: '#1976d2',
      secondary: '#d32f2f',
      accent: '#388e3c',
      background: '#fafafa',
      text: '#212121',
    },
    fonts: {
      primary: '"Roboto", "Noto Sans", sans-serif',
      secondary: '"Roboto", "Source Sans Pro", sans-serif',
      accent: '"Roboto Mono", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 8,
      gridOpacity: 0.03,
      borderRadius: 4,
      shadowStyle: 'soft',
      shadowIntensity: 45,
      effects: ['elevation-shadow', 'ripple-effect', '8dp-grid', 'fab-circle'],
      letterSpacing: 0.5,
      lineHeight: 1.5,
      animationStyle: 'pulse',
    },
  },
  {
    id: '2015',
    name: '2015: Editorial & Stripe Era',
    era: 'Flat Design Era (2013-2015)',
    description: 'Medium made everyone a typographer. Stripe made gradients premium again. Giant serif headlines, generous reading margins, and the confidence to let content breathe.',
    lesson: 'Typography IS the design. A well-set paragraph needs no decoration.',
    heritage: 'Every startup landing page with a 72px serif headline and gradient CTA was born here.',
    keyElements: ['Giant serif headlines', 'Reading-width columns', 'Gradient accent CTAs', 'Editorial spacing'],
    preview: '/themes/2015-flat.jpg',
    colors: {
      primary: '#1a1a2e',
      secondary: '#e8e8e8',
      accent: '#635bff',
      background: '#ffffff',
      text: '#0a2540',
    },
    fonts: {
      primary: '"Playfair Display", "Libre Baskerville", serif',
      secondary: '"Source Sans Pro", "Lato", sans-serif',
      accent: '"Fira Sans", "Inter", sans-serif',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 6,
      gridOpacity: 0.01,
      borderRadius: 6,
      shadowStyle: 'soft',
      shadowIntensity: 20,
      effects: ['hero-image', 'bold-headline', 'flexbox-layout', 'hover-lift'],
      letterSpacing: -1,
      lineHeight: 1.8,
      animationStyle: 'float',
    },
  },
  {
    id: '2016',
    name: '2016: Design Systems Rise',
    era: 'Design Diversity (2016-2019)',
    description: 'Airbnb, Spotify, and IBM built design systems that scaled across hundreds of products. Tokens replaced pixels. Components replaced pages. Dark themes became a first-class feature.',
    lesson: 'Consistency at scale requires systems, not style guides.',
    heritage: 'Every design token file, every Storybook instance descends from this movement.',
    keyElements: ['Component libraries', 'Dark-first palettes', 'Token-driven themes', 'Card-based layouts'],
    preview: '/themes/2016-systems.jpg',
    colors: {
      primary: '#1db954',
      secondary: '#191414',
      accent: '#ff4081',
      background: '#0a0a0a',
      text: '#f0f0f0',
    },
    fonts: {
      primary: '"Circular", "Poppins", sans-serif',
      secondary: '"Inter", "Nunito Sans", sans-serif',
      accent: '"IBM Plex Mono", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 4,
      gridOpacity: 0.02,
      borderRadius: 8,
      shadowStyle: 'soft',
      shadowIntensity: 50,
      effects: ['card-elevation', 'token-system', 'component-hover', 'micro-animation'],
      letterSpacing: -0.5,
      lineHeight: 1.5,
      animationStyle: 'float',
    },
  },
  {
    id: '2018',
    name: '2018: Accessibility & Inclusion',
    era: 'Design Diversity (2016-2019)',
    description: 'WCAG became non-negotiable. Focus rings, skip links, and semantic HTML returned to the spotlight. prefers-color-scheme landed in browsers. Dark mode was no longer a preference -- it was an expectation.',
    lesson: 'Accessible design is better design for everyone, not a checklist afterthought.',
    heritage: 'Every color contrast checker, every focus-visible style, every aria-label owes this era.',
    keyElements: ['Focus ring indicators', 'High-contrast palettes', 'Semantic landmarks', 'Reduced motion support'],
    preview: '/themes/2018-accessible.jpg',
    colors: {
      primary: '#0055b8',
      secondary: '#c62828',
      accent: '#2e7d32',
      background: '#fefefe',
      text: '#111111',
    },
    fonts: {
      primary: '"Atkinson Hyperlegible", "Inter", sans-serif',
      secondary: '"Atkinson Hyperlegible", system-ui, sans-serif',
      accent: '"JetBrains Mono", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 4,
      gridOpacity: 0.01,
      borderRadius: 8,
      shadowStyle: 'soft',
      shadowIntensity: 30,
      effects: ['focus-ring', 'high-contrast', 'reduced-motion', 'semantic-color'],
      letterSpacing: 0,
      lineHeight: 1.7,
      animationStyle: 'none',
    },
  },
  {
    id: '2020',
    name: '2020: Dark Mode & Neumorphism',
    era: 'Dark Mode & Personalization (2020-2021)',
    description: 'The world went dark -- literally. OLED-friendly palettes, soft inset shadows mimicking clay, and the neumorphism trend that made buttons look squeezable.',
    lesson: 'Dark mode is not inverted light mode. It demands its own elevation and contrast system.',
    heritage: 'Every app with a dark toggle and soft-shadow cards inherits from 2020.',
    keyElements: ['Neumorphic inset shadows', 'OLED-black backgrounds', 'Purple/teal Material Dark', 'Pill toggles'],
    preview: '/themes/2020-neumorph.jpg',
    colors: {
      primary: '#bb86fc',
      secondary: '#03dac6',
      accent: '#cf6679',
      background: '#121212',
      text: '#e0e0e0',
    },
    fonts: {
      primary: '"Inter", "Sohne", sans-serif',
      secondary: '"Inter", "Suisse Intl", sans-serif',
      accent: '"Fira Code", "JetBrains Mono", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 4,
      gridOpacity: 0.01,
      borderRadius: 20,
      shadowStyle: 'neumorphic',
      shadowIntensity: 65,
      effects: ['neumorphic-inset', 'dark-elevation', 'soft-glow', 'smooth-toggle'],
      letterSpacing: -0.5,
      lineHeight: 1.5,
      animationStyle: 'pulse',
    },
  },
  {
    id: '2021',
    name: '2021: Material You',
    era: 'Dark Mode & Personalization (2020-2021)',
    description: 'Your wallpaper picks your palette. Material You (M3) made every phone feel personal with dynamic color extraction, pillowy 28px corners, and tonal surface layers.',
    lesson: "The best interface is the one that feels like it was made for you -- because it was.",
    heritage: 'Dynamic theming, user-adaptive palettes, and tone-based elevation are standard now.',
    keyElements: ['Dynamic color extraction', '28px rounded corners', 'Tonal surface layers', 'Adaptive color chips'],
    preview: '/themes/2021-material-you.jpg',
    colors: {
      primary: '#6750a4',
      secondary: '#e8def8',
      accent: '#7d5260',
      background: '#fffbfe',
      text: '#1c1b1f',
    },
    fonts: {
      primary: '"Google Sans", "Product Sans", sans-serif',
      secondary: '"Roboto Flex", "Roboto", sans-serif',
      accent: '"Google Sans Mono", "Roboto Mono", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: null,
      gridOpacity: 0,
      borderRadius: 28,
      shadowStyle: 'soft',
      shadowIntensity: 30,
      effects: ['dynamic-color', 'shape-morph', 'adaptive-palette', 'motion-curve'],
      letterSpacing: 0,
      lineHeight: 1.5,
      animationStyle: 'morph',
    },
  },
  {
    id: '2022',
    name: '2022: Glassmorphism & Bento',
    era: 'Glassmorphism (2022-2023)',
    description: 'Frosted glass panels floating over gradient nebulas. Apple perfected it, and the web followed. Bento grid layouts turned portfolios into elegant dashboards of frosted cards.',
    lesson: 'Transparency and blur create depth without heaviness.',
    heritage: 'Every SaaS landing page with backdrop-blur cards and gradient mesh backgrounds.',
    keyElements: ['Backdrop blur panels', 'Bento grid layouts', 'Gradient mesh backgrounds', 'Border-glow effects'],
    preview: '/themes/2022-glass.jpg',
    colors: {
      primary: '#60a5fa',
      secondary: '#1e293b',
      accent: '#38bdf8',
      background: '#0f172a',
      text: '#e2e8f0',
    },
    fonts: {
      primary: '"Space Grotesk", "Outfit", sans-serif',
      secondary: '"Inter", "Plus Jakarta Sans", sans-serif',
      accent: '"Space Mono", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: null,
      gridOpacity: 0,
      borderRadius: 24,
      shadowStyle: 'glass',
      shadowIntensity: 55,
      effects: ['backdrop-blur', 'frosted-glass', 'border-glow', 'layer-depth'],
      letterSpacing: -0.5,
      lineHeight: 1.5,
      animationStyle: 'float',
    },
  },
  {
    id: '2023',
    name: '2023: AI-Native Interfaces',
    era: 'Glassmorphism (2022-2023)',
    description: 'ChatGPT rewrote interface expectations. Conversational UI, streaming text, aurora gradients, and the purple glow of AI became the new visual language.',
    lesson: 'When the machine speaks back, the interface becomes a conversation.',
    heritage: 'Every AI chatbot, every copilot sidebar, every streaming response animation.',
    keyElements: ['Chat bubbles', 'Streaming text cursors', 'Aurora gradient glows', 'Particle effects'],
    preview: '/themes/2023-ai.jpg',
    colors: {
      primary: '#a855f7',
      secondary: '#06b6d4',
      accent: '#f472b6',
      background: '#0c0a1d',
      text: '#f1f5f9',
    },
    fonts: {
      primary: '"Clash Display", "Satoshi", sans-serif',
      secondary: '"General Sans", "DM Sans", sans-serif',
      accent: '"Geist Mono", "JetBrains Mono", monospace',
    },
    style: 'absurd',
    designTokens: {
      gridSize: null,
      gridOpacity: 0,
      borderRadius: 20,
      shadowStyle: 'glow',
      shadowIntensity: 75,
      effects: ['gradient-animate', 'particle-float', 'aurora-glow', 'chat-bubble', 'holographic-shimmer'],
      letterSpacing: -0.5,
      lineHeight: 1.5,
      animationStyle: 'float',
    },
  },
  {
    id: '2024',
    name: '2024: Maximalist Craft',
    era: 'Maximalism & Hyper-Personalization (2024-2025)',
    description: 'More is more, but make it premium. Noise textures, gradient mesh, chromatic aberration, and generative art backgrounds. Vercel and Framer set the bar for developer portfolios.',
    lesson: 'Maximalism works when every layer is intentional, not accidental.',
    heritage: 'Award-winning portfolios, SaaS sites, and creative studios all ride this wave.',
    keyElements: ['Noise grain textures', 'Gradient mesh blobs', 'Chromatic aberration', 'Generative particle systems'],
    preview: '/themes/2024-maximal.jpg',
    colors: {
      primary: '#ec4899',
      secondary: '#06b6d4',
      accent: '#fbbf24',
      background: '#030014',
      text: '#faf5ff',
    },
    fonts: {
      primary: '"Geist", "Sohne", sans-serif',
      secondary: '"Geist", "Inter", sans-serif',
      accent: '"Geist Mono", "Berkeley Mono", monospace',
    },
    style: 'absurd',
    designTokens: {
      gridSize: null,
      gridOpacity: 0,
      borderRadius: 16,
      shadowStyle: 'glow',
      shadowIntensity: 85,
      effects: ['gradient-mesh', 'particle-swarm', 'noise-texture', 'liquid-morph', 'chromatic-aberration'],
      letterSpacing: -1,
      lineHeight: 1.4,
      animationStyle: 'morph',
    },
  },
  {
    id: '2025',
    name: '2025: Spatial & Ambient Web',
    era: 'Maximalism & Hyper-Personalization (2024-2025)',
    description: 'Vision Pro brought spatial computing to the web. Floating glass layers with real depth, gesture-aware interactions, and ambient AI particles that respond to your presence.',
    lesson: 'The interface dissolves into space. Depth, motion, and context replace chrome.',
    heritage: 'The next decade of web design will be measured against spatial standards set here.',
    keyElements: ['Floating glass layers', 'Spatial depth parallax', 'Gesture-aware hints', 'Ambient AI particles'],
    preview: '/themes/2025-spatial.jpg',
    colors: {
      primary: '#8b5cf6',
      secondary: '#3b82f6',
      accent: '#14b8a6',
      background: '#020617',
      text: '#f8fafc',
    },
    fonts: {
      primary: '"SF Pro Display", "Geist", sans-serif',
      secondary: '"SF Pro Text", "Inter", sans-serif',
      accent: '"SF Mono", "Geist Mono", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: null,
      gridOpacity: 0,
      borderRadius: 32,
      shadowStyle: 'glass',
      shadowIntensity: 65,
      effects: ['spatial-depth', 'gesture-hint', 'parallax-layer', 'ai-particle', 'volumetric-light', 'depth-blur'],
      letterSpacing: -0.5,
      lineHeight: 1.5,
      animationStyle: 'float',
    },
  },
];

// Default/Current Portfolio Data
export const portfolioData: PortfolioData = {
  personal: {
    name: 'KIRUK',
    fullName: 'Arun Kumaar Sreenivasan',
    title: 'Design Engineer',
    location: 'Bengaluru, India - 560102',
    bio: 'UX Design Engineer at HP Inc, specializing in AI Experience Design, product design, and full-stack development. Key contributor to HP Print AI\'s launch of the industry\'s first intelligent print experience. Expert in bridging design and engineering to create innovative, user-centered solutions.',
    tagline: 'Scribbles that turn into digital experiences',
    email: 'arunkumaar.srinivasan@gmail.com',
    linkedin: 'https://linkedin.com/in/arunkumaarsreenivasan/',
    github: 'https://github.com/arunkumaarsrinivasan',
    phone: '+91 94865 82579',
  },
  contact: {
    email: 'arunkumaar.srinivasan@gmail.com',
    phone: '+91 94865 82579',
    location: 'Bengaluru, India - 560102',
    availability: 'available',
    preferredContact: 'email',
    responseTime: '24 hours',
    timezone: 'IST (GMT+5:30)',
    workingHours: {
      start: '09:00',
      end: '18:00',
      timezone: 'IST',
    },
  },
  social: {
    github: 'https://github.com/arunkumaarsrinivasan',
    linkedin: 'https://linkedin.com/in/arunkumaarsreenivasan/',
    behance: 'https://behance.net/arunkusriniva',
    playbook: 'https://playbook.com/s/arunkumaar/ak-works',
  },
  skills: [
    // Design Skills
    {
      id: 'product-design',
      name: 'Product Design',
      category: 'design',
      level: 9,
      icon: '🎨',
      description: 'End-to-end product design from concept to implementation',
      yearsOfExperience: 5,
    },
    {
      id: 'ux-ui-design',
      name: 'UI/UX Design (Web & Mobile)',
      category: 'design',
      level: 9,
      icon: '🎨',
      description: 'Comprehensive UX/UI design expertise for web and mobile platforms',
      yearsOfExperience: 5,
    },
    {
      id: 'design-systems',
      name: 'Design Systems',
      category: 'design',
      level: 9,
      icon: '🎨',
      description: 'Creating and maintaining cohesive design systems used by 500+ employees',
      yearsOfExperience: 4,
    },
    {
      id: 'prototyping',
      name: 'Prototyping',
      category: 'design',
      level: 9,
      icon: '🎨',
      description: 'Interactive prototyping with Figma, Protopie, and Rive',
      yearsOfExperience: 5,
    },
    {
      id: 'micro-interaction',
      name: 'Micro-interaction Design',
      category: 'design',
      level: 8,
      icon: '🎨',
      description: 'Designing delightful micro-interactions and animations',
      yearsOfExperience: 4,
    },
    {
      id: 'branding',
      name: 'Branding & Illustration',
      category: 'design',
      level: 8,
      icon: '🎨',
      description: 'Brand identity creation and illustration work',
      yearsOfExperience: 5,
    },
    {
      id: 'game-design',
      name: 'Game Design',
      category: 'design',
      level: 7,
      icon: '🎮',
      description: 'Gamified experiences and game asset creation',
      yearsOfExperience: 3,
    },
    // User Research
    {
      id: 'user-research',
      name: 'User Research',
      category: 'design',
      level: 8,
      icon: '🔍',
      description: 'Qualitative & quantitative analysis, personas, journey mapping, A/B testing',
      yearsOfExperience: 4,
    },
    {
      id: 'usability-testing',
      name: 'Usability Testing',
      category: 'design',
      level: 8,
      icon: '🔍',
      description: 'Conducting usability testing with 200+ users, increasing engagement by 45%',
      yearsOfExperience: 4,
    },
    // Design Tools
    {
      id: 'figma',
      name: 'Figma',
      category: 'tools',
      level: 9,
      icon: '🛠️',
      description: 'Expert-level Figma for design systems, prototyping, and collaboration',
      yearsOfExperience: 5,
    },
    {
      id: 'adobe-cc',
      name: 'Adobe Creative Suite',
      category: 'tools',
      level: 8,
      icon: '🛠️',
      description: 'Proficient in Adobe CC Suite for design and creative work',
      yearsOfExperience: 5,
    },
    {
      id: 'protopie',
      name: 'Protopie',
      category: 'tools',
      level: 7,
      icon: '🛠️',
      description: 'Advanced prototyping with Protopie',
      yearsOfExperience: 3,
    },
    {
      id: 'spline',
      name: 'Spline',
      category: 'tools',
      level: 7,
      icon: '🛠️',
      description: '3D design and modeling with Spline',
      yearsOfExperience: 2,
    },
    {
      id: 'blender',
      name: 'Blender',
      category: 'tools',
      level: 6,
      icon: '🛠️',
      description: '3D modeling and animation with Blender',
      yearsOfExperience: 2,
    },
    // Frontend
    {
      id: 'react',
      name: 'React',
      category: 'frontend',
      level: 8,
      icon: '⚛️',
      description: 'Advanced React development with hooks, context, and modern patterns',
      yearsOfExperience: 4,
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      category: 'frontend',
      level: 8,
      icon: '📘',
      description: 'TypeScript for type-safe frontend and backend development',
      yearsOfExperience: 4,
    },
    {
      id: 'nextjs',
      name: 'Next.js',
      category: 'frontend',
      level: 8,
      icon: '▲',
      description: 'Full-stack Next.js development with SSR, SSG, and API routes',
      yearsOfExperience: 3,
    },
    {
      id: 'flutter',
      name: 'Flutter',
      category: 'frontend',
      level: 7,
      icon: '📱',
      description: 'Mobile-first Flutter web UI development',
      yearsOfExperience: 2,
    },
    {
      id: 'threejs',
      name: 'Three.js',
      category: 'frontend',
      level: 7,
      icon: '🎨',
      description: '3D graphics and animations with Three.js',
      yearsOfExperience: 3,
    },
    {
      id: 'gsap',
      name: 'GSAP',
      category: 'frontend',
      level: 7,
      icon: '✨',
      description: 'Advanced animations with GSAP',
      yearsOfExperience: 3,
    },
    // Backend
    {
      id: 'spring-boot',
      name: 'Spring Boot',
      category: 'backend',
      level: 9,
      icon: '☕',
      description: 'Deep expertise in Spring Boot for microservices and automation',
      yearsOfExperience: 2,
    },
    {
      id: 'java',
      name: 'Java',
      category: 'backend',
      level: 8,
      icon: '☕',
      description: 'Proficient in Java ecosystem, Spring Shell, and microservices',
      yearsOfExperience: 2,
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      category: 'backend',
      level: 8,
      icon: '🟢',
      description: 'Node.js development for scalable workflows and APIs',
      yearsOfExperience: 3,
    },
    {
      id: 'python',
      name: 'Python',
      category: 'backend',
      level: 7,
      icon: '🐍',
      description: 'Python development with Flask',
      yearsOfExperience: 3,
    },
    {
      id: 'api-design',
      name: 'API Design',
      category: 'backend',
      level: 8,
      icon: '🔌',
      description: 'RESTful API design and integration',
      yearsOfExperience: 3,
    },
    // Cloud & Platforms
    {
      id: 'aws',
      name: 'AWS',
      category: 'backend',
      level: 8,
      icon: '☁️',
      description: 'AWS cloud services for microservices and infrastructure',
      yearsOfExperience: 2,
    },
    {
      id: 'docker',
      name: 'Docker',
      category: 'tools',
      level: 7,
      icon: '🐳',
      description: 'Containerization with Docker',
      yearsOfExperience: 2,
    },
    {
      id: 'firebase',
      name: 'Firebase',
      category: 'backend',
      level: 7,
      icon: '🔥',
      description: 'Firebase for backend services',
      yearsOfExperience: 2,
    },
    {
      id: 'vercel',
      name: 'Vercel',
      category: 'tools',
      level: 8,
      icon: '▲',
      description: 'Deployment and hosting with Vercel',
      yearsOfExperience: 3,
    },
    {
      id: 'sanity-cms',
      name: 'Sanity CMS',
      category: 'tools',
      level: 7,
      icon: '📝',
      description: 'Content management with Sanity CMS',
      yearsOfExperience: 2,
    },
    // Monitoring & Analytics
    {
      id: 'splunk',
      name: 'Splunk',
      category: 'tools',
      level: 8,
      icon: '📊',
      description: 'Splunk dashboards and log analysis for millions of IoT devices',
      yearsOfExperience: 2,
    },
    // AI & Data
    {
      id: 'llms',
      name: 'LLMs & AI UX',
      category: 'design',
      level: 8,
      icon: '🤖',
      description: 'LLM integration, AI-based UX, and prompt engineering',
      yearsOfExperience: 2,
    },
    {
      id: 'nlp',
      name: 'NLP',
      category: 'backend',
      level: 7,
      icon: '🤖',
      description: 'Natural Language Processing for AI features',
      yearsOfExperience: 2,
    },
    {
      id: 'prompt-engineering',
      name: 'Prompt Engineering',
      category: 'design',
      level: 8,
      icon: '🤖',
      description: 'Custom prompts for text-to-image generation and AI features',
      yearsOfExperience: 2,
    },
  ],
  projects: [
    {
      id: 'portfolio-v3',
      title: 'Interactive Portfolio v3',
      description: 'A hand-drawn, interactive portfolio with 3D elements and AI chat',
      longDescription: 'This portfolio represents the intersection of creativity and technology, featuring hand-drawn elements, Three.js 3D graphics, and an AI-powered chat assistant.',
      category: 'web',
      status: 'completed',
      technologies: ['Next.js', 'Three.js', 'Framer Motion', 'TypeScript', 'Tailwind CSS'],
      features: [
        'Interactive scribble drawing',
        'AI chat assistant',
        'Responsive design',
        '3D animations',
        'Accessibility features',
      ],
      challenges: [
        'Balancing creativity with usability',
        'Optimizing 3D performance',
        'Creating accessible interactions',
      ],
      learnings: [
        'Advanced Three.js techniques',
        'AI integration patterns',
        'Accessibility best practices',
      ],
      images: {
        thumbnail: '/projects/portfolio-v3-thumb.jpg',
        gallery: [
          '/projects/portfolio-v3-1.jpg',
          '/projects/portfolio-v3-2.jpg',
          '/projects/portfolio-v3-3.jpg',
        ],
      },
      links: {
        live: 'https://kiruk.dev',
        github: 'https://github.com/arunkumaarsrinivasan/portfolio-v3',
      },
      timeline: {
        startDate: '2024-01-01',
        endDate: '2024-03-01',
        duration: '3 months',
      },
      role: 'Full-Stack Developer & Designer',
      tags: ['portfolio', 'interactive', '3d', 'ai'],
    },
    {
      id: 'square-bridge',
      title: 'Square Bridge - Student Recruitment Platform',
      description: 'End-to-end UX/UI design for student recruitment platform serving students, recruiters, and placement officers',
      longDescription: 'Led end-to-end UX/UI design for Square bridge, a comprehensive student recruitment platform. Conducted user research and usability testing with 200+ candidates, increasing engagement by 45%. Created unified design system and 150+ UI screens for portfolio builder, recruiter search, and officer dashboards. Achieved 98% design-to-development implementation accuracy.',
      category: 'web',
      status: 'completed',
      technologies: ['Figma', 'Design Systems', 'UX Research', 'Node.js', 'MongoDB', 'Prototyping'],
      features: [
        'Student portfolio builder',
        'Recruiter search and discovery',
        'Placement officer dashboards',
        'Unified design system',
        '150+ UI screens',
      ],
      challenges: [
        'Serving multiple user types (students, recruiters, officers)',
        'Reducing candidate discovery time',
        'Streamlining placement officer workflows',
      ],
      learnings: [
        'Multi-stakeholder platform design',
        'User research at scale (200+ users)',
        'Design system implementation',
        'Achieving high design-to-development accuracy',
      ],
      images: {
        thumbnail: '/projects/square-bridge-thumb.jpg',
        gallery: [],
      },
      links: {},
      timeline: {
        startDate: '2023-02-01',
        endDate: '2023-07-31',
        duration: '6 months',
      },
      role: 'Product Designer',
      tags: ['recruitment', 'platform', 'design-system', 'ux-research'],
      metrics: {
        impact: 'Increased engagement by 45%, reduced candidate discovery time by 40%, reduced PO workload by 35%',
      },
    },
    {
      id: 'spera-crypto',
      title: 'Cryptocurrency Bot Dashboard - Spera',
      description: 'Complete branding and website design for cryptocurrency trading platform',
      longDescription: 'Led complete branding and website design for Spera cryptocurrency platform. Managed end-to-end design process including brand identity creation, user-friendly dashboard design for cryptocurrency trading bots, and user management interface.',
      category: 'design',
      status: 'completed',
      technologies: ['Figma', 'Design Systems', 'Branding', 'Data Visualization'],
      features: [
        'Brand identity creation',
        'Cryptocurrency trading dashboard',
        'User management interface',
        'Intuitive data visualization',
      ],
      challenges: [
        'Understanding fintech requirements',
        'Compliance considerations',
        'Creating trustworthy digital experiences',
      ],
      learnings: [
        'Fintech design patterns',
        'Data visualization for financial data',
        'Brand identity development',
      ],
      images: {
        thumbnail: '/projects/spera-thumb.jpg',
        gallery: [],
      },
      links: {},
      timeline: {
        startDate: '2023-06-01',
        endDate: '2023-09-01',
        duration: '3 months',
      },
      role: 'Design Lead',
      tags: ['cryptocurrency', 'dashboard', 'branding', 'fintech'],
    },
    {
      id: 'peoplegamez-hr',
      title: 'HR Engagement Game Design - PeopleGamez.com',
      description: 'Designed engaging game experiences for HR stakeholders to improve employee engagement',
      longDescription: 'Designed engaging game experiences specifically for HR stakeholders at PeopleGamez.com. Created comprehensive user flows, interaction designs, and gamification strategies to improve employee engagement and HR processes.',
      category: 'design',
      status: 'completed',
      technologies: ['Figma', 'User Flows', 'Gamification', 'UX Research'],
      features: [
        'Comprehensive user flows',
        'Gamification strategies',
        'Employee engagement mechanics',
        'HR workflow integration',
      ],
      challenges: [
        'Understanding HR workflows',
        'Employee psychology',
        'Creating game mechanics for workplace',
      ],
      learnings: [
        'Gamification design principles',
        'HR tech design patterns',
        'Employee engagement strategies',
      ],
      images: {
        thumbnail: '/projects/peoplegamez-thumb.jpg',
        gallery: [],
      },
      links: {},
      timeline: {
        startDate: '2023-03-01',
        endDate: '2023-05-01',
        duration: '2 months',
      },
      role: 'Design Lead',
      tags: ['hr-tech', 'game-design', 'user-flows', 'gamification'],
    },
    {
      id: 'life-savers-ngo',
      title: 'NGO Website & CMS Platform - Life Savers NGO',
      description: 'Developed comprehensive website and CMS with payment integration for donations',
      longDescription: 'Developed comprehensive website and content management system for Life Savers NGO. Integrated payment functionality for streamlined donation processes, created intuitive content management interfaces, and designed user-friendly donation flows.',
      category: 'web',
      status: 'completed',
      technologies: ['Next.js', 'CMS', 'Payment Integration', 'UX Design'],
      features: [
        'Content management system',
        'Payment integration for donations',
        'Intuitive donation flows',
        'Trust-building design',
      ],
      challenges: [
        'Building trust through design',
        'Optimizing conversion rates',
        'Easy-to-use tools for NGO staff',
      ],
      learnings: [
        'Social impact design',
        'Payment integration',
        'CMS development',
      ],
      images: {
        thumbnail: '/projects/ngo-thumb.jpg',
        gallery: [],
      },
      links: {},
      timeline: {
        startDate: '2022-09-01',
        endDate: '2022-12-01',
        duration: '3 months',
      },
      role: 'Full-Stack Developer & Designer',
      tags: ['ngo', 'cms', 'payment-integration', 'social-impact'],
    },
  ],
  experience: [
    {
      id: 'hp-ux-designer',
      company: 'HP Inc',
      position: 'UX Design Engineer',
      location: 'Bengaluru, India',
      type: 'full-time',
      startDate: '2023-08-01',
      current: true,
      description: 'Key contributor to HP Print AI\'s launch of the industry\'s first intelligent print experience. Developed scalable email/webmail printing workflows using Spring Boot (Java) and Node.js (TypeScript). Led end-to-end design and launch of mobile-first Flutter web UI, improving onboarding speed and user flows for customers and B2C print jobbers.',
      responsibilities: [
        'Developed scalable email/webmail printing workflows',
        'Led end-to-end design and launch of mobile-first Flutter web UI',
        'Created and maintained cohesive design system for AI Stack platform',
        'Conducted user research for print workflow optimization',
        'Designed Splunk dashboards and managed 7+ cloud microservices',
        'Designed and implemented COE BOT with Spring Shell and Spring Boot',
      ],
      achievements: [
        'Key contributor to HP Print AI\'s launch of industry\'s first intelligent print experience',
        'Created design system and custom branding for AI Stack platform, now used by 500+ employees',
        'Developed custom prompts enabling text-to-image generation within the stack',
        'Collaborated with cross-functional teams to deliver 15+ innovative solutions from internal hackathons',
        'Ensured reliable monitoring and incident detection for millions of IoT printers',
        'Automated Splunk dashboard and alert generation with COE BOT',
      ],
      technologies: ['Spring Boot', 'Java', 'Node.js', 'TypeScript', 'Flutter', 'Next.js', 'Figma', 'Splunk', 'Spring Shell', 'AWS', 'Cloud Microservices'],
      projects: [],
    },
    {
      id: 'sns-square-product-designer',
      company: 'SNS Square',
      position: 'Product Designer',
      location: 'Remote',
      type: 'internship',
      startDate: '2023-02-01',
      endDate: '2023-07-31',
      current: false,
      description: 'Led end-to-end UX/UI design for Square bridge, a student recruitment platform serving students, recruiters, and placement officers. Conducted user research and usability testing with 200+ candidates, increasing engagement by 45%.',
      responsibilities: [
        'Led end-to-end UX/UI design for student recruitment platform',
        'Conducted user research and usability testing',
        'Created unified design system and 150+ UI screens',
        'Managed and mentored team of 3+ designers',
        'Delivered detailed UX documentation and interactive Figma prototypes',
        'Collaborated with product and backend engineering teams',
      ],
      achievements: [
        'Increased user engagement by 45% through user research and testing',
        'Created unified design system and 150+ UI screens for portfolio builder, recruiter search, and officer dashboards',
        'Achieved 98% design-to-development implementation accuracy',
        'Reduced candidate discovery time by 40% and PO workload by 35%',
        'Managed and mentored team of 3+ designers',
      ],
      technologies: ['Figma', 'UX Research', 'Design Systems', 'Node.js', 'MongoDB', 'Prototyping', 'User Testing'],
      projects: ['square-bridge'],
    },
    {
      id: 'peoplegamez-intern',
      company: 'PeopleGamez.com',
      position: 'Interaction Design Intern',
      location: 'Remote',
      type: 'internship',
      startDate: '2022-11-01',
      endDate: '2023-01-31',
      current: false,
      description: 'Designed gamified HR experiences and developed user flows, interaction models, and 100+ game assets. Created design system with performance dashboards and collaborated on rapid prototyping with product and engineering teams.',
      responsibilities: [
        'Designed gamified HR experiences',
        'Developed user flows and interaction models',
        'Created 100+ game assets',
        'Built design system with performance dashboards',
        'Collaborated on rapid prototyping',
      ],
      achievements: [
        'Created comprehensive gamification strategies for HR workflows',
        'Developed 100+ game assets and interaction models',
        'Built design system with performance dashboards',
      ],
      technologies: ['Figma', 'Game Design', 'Interaction Design', 'User Flows', 'Prototyping'],
      projects: ['peoplegamez-hr'],
    },
    {
      id: 'freelance-general',
      company: 'Various Clients',
      position: 'Freelance Designer',
      location: 'Remote',
      type: 'freelance',
      startDate: '2020-01-01',
      endDate: '2023-12-31',
      current: false,
      description: 'Delivered branding, UI/UX, and creative design solutions for a design studio, resorts, and multiple companies while pursuing a college degree. Managed end-to-end design projects across web, mobile, and print for diverse business needs.',
      responsibilities: [
        'Branding and identity design',
        'UI/UX design for web and mobile',
        'Creative design solutions',
        'End-to-end project management',
        'Client collaboration and consultation',
      ],
      achievements: [
        'Delivered multiple successful branding and design projects',
        'Worked across diverse industries including design studios and resorts',
        'Managed projects while pursuing college degree',
      ],
      technologies: ['Figma', 'Adobe Creative Suite', 'UI/UX Design', 'Branding', 'Web Design', 'Mobile Design'],
      projects: [],
    },
  ],
  education: [
    {
      id: 'engineering',
      institution: 'Sona College of Technology',
      degree: 'Bachelor of Engineering',
      field: 'Computer Science and Engineering',
      location: 'India',
      startDate: '2019-08-01',
      endDate: '2023-05-01',
      gpa: '8.9 CGPA',
      relevantCourses: [
        'Data Structures and Algorithms',
        'Web Development',
        'Database Management',
        'Software Engineering',
        'Computer Networks',
      ],
    },
  ],
  certifications: [],
  blog: [],
  testimonials: [],
  impactMetrics: [
    {
      id: 'engagement',
      value: '45%',
      label: 'engagement increase',
      category: 'performance',
      icon: '📈',
      context: 'HP Design System components'
    },
    {
      id: 'delivery',
      value: '60%',
      label: 'faster design-to-prod',
      category: 'delivery',
      icon: '⚡',
      context: 'workflow optimization'
    },
    {
      id: 'products',
      value: '12+',
      label: 'products shipped',
      category: 'scale',
      icon: '🚀',
      context: 'enterprise & startups'
    },
    {
      id: 'users',
      value: '500K+',
      label: 'users impacted',
      category: 'impact',
      icon: '👥',
      context: 'across platforms'
    }
  ],
  whyUXDesignEngineer: {
    hook: 'Design-led thinking with engineering-grade execution.',
    painPoint: 'When strategy, design, and code live apart, teams lose speed and intent.',
    solution: 'I translate vision into production UI, design systems, and measurable outcomes.',
    tagline: 'One workflow. One owner. Better launches.'
  },
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    seo: {
      title: 'Kiruk | Design Engineer - UX Design Engineer at HP Inc',
      description: 'Portfolio of Arun Kumaar Sreenivasan - UX Design Engineer at HP Inc, key contributor to HP Print AI. Specializing in AI Experience Design, product design, design systems, and full-stack development.',
      keywords: ['ux-designer', 'design-engineer', 'ai-experience', 'product-designer', 'hp-inc', 'design-systems', 'figma', 'spring-boot', 'flutter', 'nextjs'],
      ogImage: '/og-image.jpg',
    },
  },
};


