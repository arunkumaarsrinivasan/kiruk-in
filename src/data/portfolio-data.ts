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
    description: 'Green phosphor terminals, command prompts, and ASCII-only storytelling.',
    lesson: 'Typography is the UI -- function over form.',
    heritage: "Seeded today's terminal-inspired portfolios and minimalist web.",
    keyElements: ['Monospace grids', 'Blinking cursors', 'Phosphor glow'],
    preview: '/themes/1970-terminal.jpg',
    colors: {
      primary: '#33ff33',
      secondary: '#0a3d0a',
      accent: '#66ff66',
      background: '#0d0d0d',
      text: '#33ff33',
    },
    fonts: {
      primary: '"VT323", monospace',           // Display: Iconic terminal font
      secondary: '"IBM Plex Mono", monospace', // Text: Modern monospace
      accent: '"VT323", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 48,
      gridOpacity: 0.15,
      borderRadius: 0,
      shadowStyle: 'glow',
      shadowIntensity: 80,
      effects: ['crt-scanlines', 'phosphor-glow', 'screen-flicker', 'text-shadow-glow'],
      letterSpacing: 2,
      lineHeight: 1.4,
      animationStyle: 'blink',
    },
  },
  {
    id: '1981',
    name: '1981: Xerox Alto GUI',
    era: 'Pre-Web GUI Experimentation',
    description: 'Bitmap windows, menu bars, and Alto metaphors that softened computing.',
    lesson: 'Visual metaphors help non-technical people navigate.',
    heritage: 'Windowed layouts and desktop metaphors still shape dashboards.',
    keyElements: ['Beige chrome', 'Menu strips', 'Pixel icons'],
    preview: '/themes/1981-xerox.jpg',
    colors: {
      primary: '#1a5fb4',
      secondary: '#c0c0c0',
      accent: '#000080',
      background: '#d4d0c8',
      text: '#1a1a1a',
    },
    fonts: {
      primary: '"Chicago", "Charcoal", system-ui',  // Display: Classic Mac
      secondary: '"Geneva", "Helvetica", sans-serif', // Text: System feel
      accent: '"Monaco", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 40,
      gridOpacity: 0.08,
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
    name: '1991: HTML 1.0',
    era: 'Early Web (1990-1995)',
    description: 'Pure documents with Times text and bright blue hyperlinks.',
    lesson: 'Linking information was the aesthetic.',
    heritage: "Inspired today's minimalist wikis and knowledge bases.",
    keyElements: ['Blue underlined links', 'Default serif body', 'Single-column layout'],
    preview: '/themes/1991-html.jpg',
    colors: {
      primary: '#0000ee',
      secondary: '#eeeeee',
      accent: '#551a8b',
      background: '#ffffff',
      text: '#000000',
    },
    fonts: {
      primary: '"Times New Roman", "Iowan Old Style", serif', // Display: Web default
      secondary: '"Times New Roman", Georgia, serif',          // Text: Readable serif
      accent: '"Courier", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 32,
      gridOpacity: 0.05,
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
    description: 'Tables, tiled backgrounds, and inline images crash onto the scene.',
    lesson: 'Any design was better than none -- experimentation ruled.',
    heritage: 'GeoCities nostalgia fuels indie web revivals.',
    keyElements: ['Tiled wallpapers', 'BLINK tags', 'Spinning globes'],
    preview: '/themes/1993-mosaic.jpg',
    colors: {
      primary: '#0000ff',
      secondary: '#ffccff',
      accent: '#ff00ff',
      background: '#fffaf0',
      text: '#222222',
    },
    fonts: {
      primary: '"Arial Black", "Impact", sans-serif',  // Display: Bold web fonts
      secondary: '"Arial", "Helvetica", sans-serif',   // Text: Universal
      accent: '"Courier New", monospace',
    },
    style: 'absurd',
    designTokens: {
      gridSize: 28,
      gridOpacity: 0.1,
      borderRadius: 0,
      shadowStyle: 'hard',
      shadowIntensity: 60,
      effects: ['tiled-background', 'blink-text', 'marquee-scroll', 'table-border'],
      letterSpacing: 0,
      lineHeight: 1.5,
      animationStyle: 'blink',
    },
  },
  {
    id: '1995',
    name: '1995: GeoCities Wild Web',
    era: 'GeoCities Chaos (1995-2000)',
    description: 'Neon colors, visitor counters, MIDI loops, and maximalist joy.',
    lesson: 'More is more -- creativity trumped consistency.',
    heritage: 'Direct ancestor of vaporwave and maximalist portfolios.',
    keyElements: ['Checkerboard textures', 'Guestbook CTAs', 'Under Construction GIFs'],
    preview: '/themes/1995-geocities.jpg',
    colors: {
      primary: '#ffff00',
      secondary: '#ff00ff',
      accent: '#00ffff',
      background: '#000033',
      text: '#ffff99',
    },
    fonts: {
      primary: '"Comic Sans MS", "Chalkboard", cursive', // Display: Peak 90s
      secondary: '"Arial", sans-serif',                   // Text: Readable contrast
      accent: '"Courier New", monospace',
    },
    style: 'absurd',
    designTokens: {
      gridSize: 24,
      gridOpacity: 0.12,
      borderRadius: 0,
      shadowStyle: 'glow',
      shadowIntensity: 90,
      effects: ['neon-glow', 'star-cursor', 'rainbow-text', 'gif-spinner', 'visitor-counter'],
      letterSpacing: 1,
      lineHeight: 1.4,
      animationStyle: 'blink',
    },
  },
  {
    id: '1997',
    name: '1997: Tabled Corporate Web',
    era: 'GeoCities Chaos (1995-2000)',
    description: 'Three-column table layouts, navy gradients, and gold callouts.',
    lesson: 'Structure and branding start to align the web.',
    heritage: 'News portals and enterprise dashboards trace roots here.',
    keyElements: ['Table borders everywhere', 'Frames & marquees', 'Gold navigation bars'],
    preview: '/themes/1997-corporate.jpg',
    colors: {
      primary: '#ffd700',
      secondary: '#003366',
      accent: '#ff6b00',
      background: '#001f3f',
      text: '#f0f0f0',
    },
    fonts: {
      primary: '"Verdana", "Tahoma", sans-serif',   // Display: Microsoft era
      secondary: '"Georgia", "Times", serif',       // Text: Professional
      accent: '"Verdana", sans-serif',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 20,
      gridOpacity: 0.08,
      borderRadius: 0,
      shadowStyle: 'hard',
      shadowIntensity: 70,
      effects: ['table-cell-border', 'gradient-nav', 'beveled-button', 'frame-border'],
      letterSpacing: 0,
      lineHeight: 1.5,
      animationStyle: 'none',
    },
  },
  {
    id: '2000',
    name: '2000: CSS Awakening',
    era: 'CSS Revolution (2000-2005)',
    description: 'Semantic HTML with CSS boxes, rounded corners, and drop shadows.',
    lesson: 'Separating content from style unlocked flexibility.',
    heritage: 'Set the groundwork for modern CSS-first systems.',
    keyElements: ['Rounded-corner cards', 'Soft drop shadows', 'Blue CTAs'],
    preview: '/themes/2000-css.jpg',
    colors: {
      primary: '#0066cc',
      secondary: '#e8f4fc',
      accent: '#0052a3',
      background: '#ffffff',
      text: '#2d3748',
    },
    fonts: {
      primary: '"Trebuchet MS", "Gill Sans", sans-serif', // Display: CSS era
      secondary: '"Verdana", "DejaVu Sans", sans-serif',  // Text: Pixel-perfect
      accent: '"Trebuchet MS", sans-serif',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 16,
      gridOpacity: 0.06,
      borderRadius: 4,
      shadowStyle: 'soft',
      shadowIntensity: 40,
      effects: ['box-shadow-soft', 'rounded-corners', 'hover-underline', 'gradient-header'],
      letterSpacing: 0,
      lineHeight: 1.6,
      animationStyle: 'none',
    },
  },
  {
    id: '2003',
    name: '2003: Web 2.0 Gloss',
    era: 'CSS Revolution (2000-2005)',
    description: 'Glossy gradients, reflections, and AJAX optimism.',
    lesson: 'Motion and depth made software feel premium.',
    heritage: 'Modern SaaS hero gradients nod to this moment.',
    keyElements: ['Glossy buttons', 'Reflections', '960px centered layout'],
    preview: '/themes/2003-web2.jpg',
    colors: {
      primary: '#e74c3c',
      secondary: '#1abc9c',
      accent: '#3498db',
      background: '#faf9ff',
      text: '#2c3e50',
    },
    fonts: {
      primary: '"Lucida Grande", "Lucida Sans", sans-serif', // Display: Mac OS X era
      secondary: '"Helvetica Neue", "Arial", sans-serif',    // Text: Clean
      accent: '"Lucida Grande", sans-serif',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 14,
      gridOpacity: 0.05,
      borderRadius: 8,
      shadowStyle: 'soft',
      shadowIntensity: 50,
      effects: ['glossy-gradient', 'reflection-shine', 'badge-3d', 'rounded-pill'],
      letterSpacing: 0,
      lineHeight: 1.6,
      animationStyle: 'pulse',
    },
  },
  {
    id: '2006',
    name: '2006: Refined Web 2.0',
    era: 'Early Responsive & Minimalism (2006-2012)',
    description: 'Whitespace, clean typography, and softer gradients.',
    lesson: 'Less is more -- clarity through restraint.',
    heritage: 'Blogs and Apple product pages borrowed this calm.',
    keyElements: ['Soft gradients', 'Generous whitespace', 'Rounded tabs'],
    preview: '/themes/2006-refined.jpg',
    colors: {
      primary: '#0088cc',
      secondary: '#ff7f50',
      accent: '#f0f0f0',
      background: '#fafafa',
      text: '#1a1a1a',
    },
    fonts: {
      primary: '"Myriad Pro", "Segoe UI", sans-serif',  // Display: Apple-inspired
      secondary: '"Lucida Sans", "Trebuchet", sans-serif', // Text: Elegant
      accent: '"Helvetica", sans-serif',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 12,
      gridOpacity: 0.04,
      borderRadius: 6,
      shadowStyle: 'soft',
      shadowIntensity: 35,
      effects: ['subtle-gradient', 'generous-padding', 'smooth-transition', 'tab-rounded'],
      letterSpacing: 0,
      lineHeight: 1.7,
      animationStyle: 'none',
    },
  },
  {
    id: '2009',
    name: '2009: Early Responsive',
    era: 'Early Responsive & Minimalism (2006-2012)',
    description: 'CSS3 borders, pastel accents, and mobile-aware grids.',
    lesson: 'Mobile screens force simplification and scalable type.',
    heritage: 'Responsive frameworks owe their start to this era.',
    keyElements: ['CSS3 rounded corners', 'Pastel highlights', 'Media query experiments'],
    preview: '/themes/2009-responsive.jpg',
    colors: {
      primary: '#007aff',
      secondary: '#5856d6',
      accent: '#34c759',
      background: '#f5f5f7',
      text: '#1d1d1f',
    },
    fonts: {
      primary: '"Helvetica Neue", "SF Pro Display", sans-serif', // Display: iOS-inspired
      secondary: '"Helvetica Neue", system-ui, sans-serif',       // Text: System native
      accent: '"SF Mono", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 10,
      gridOpacity: 0.04,
      borderRadius: 8,
      shadowStyle: 'soft',
      shadowIntensity: 30,
      effects: ['css3-gradient', 'border-radius-smooth', 'media-query-grid', 'touch-target'],
      letterSpacing: -0.5,
      lineHeight: 1.5,
      animationStyle: 'none',
    },
  },
  {
    id: '2010',
    name: '2010: Flat Precursor',
    era: 'Early Responsive & Minimalism (2006-2012)',
    description: 'Skeuomorphism fades while flat grids take over.',
    lesson: 'High-DPI displays reward crisp, efficient interfaces.',
    heritage: 'Bootstrap-era dashboards start here.',
    keyElements: ['Subtle bevels', 'Bold CTA bars', 'Responsive grids'],
    preview: '/themes/2010-flat.jpg',
    colors: {
      primary: '#0099cc',
      secondary: '#e74c3c',
      accent: '#00d4ff',
      background: '#ffffff',
      text: '#212121',
    },
    fonts: {
      primary: '"SF Pro Display", "Segoe UI", sans-serif', // Display: Modern system
      secondary: '"SF Pro Text", system-ui, sans-serif',   // Text: Optimized reading
      accent: '"Menlo", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 8,
      gridOpacity: 0.03,
      borderRadius: 4,
      shadowStyle: 'soft',
      shadowIntensity: 25,
      effects: ['flat-color-block', 'crisp-border', 'bold-cta', 'grid-12-column'],
      letterSpacing: 0,
      lineHeight: 1.5,
      animationStyle: 'none',
    },
  },
  {
    id: '2013',
    name: '2013: Flat Revolution',
    era: 'Flat Design Era (2013-2015)',
    description: 'No shadows, bold color blocks, and pastel palettes.',
    lesson: 'Simplicity scales everywhere.',
    heritage: 'Modern design systems lean on this clarity.',
    keyElements: ['Pastel panels', 'Solid color blocks', 'No chrome'],
    preview: '/themes/2013-flat.jpg',
    colors: {
      primary: '#007aff',
      secondary: '#ff3b30',
      accent: '#ffcc00',
      background: '#f2f2f7',
      text: '#1c1c1e',
    },
    fonts: {
      primary: '"Avenir Next", "Montserrat", sans-serif', // Display: Flat era
      secondary: '"Open Sans", "Roboto", sans-serif',     // Text: Google standard
      accent: '"Avenir", sans-serif',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 8,
      gridOpacity: 0.02,
      borderRadius: 6,
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
    description: 'Flat base plus elevation, ripples, and the 8dp grid.',
    lesson: 'Flat + subtle depth = clarity and hierarchy.',
    heritage: 'Component libraries adopted elevation tokens.',
    keyElements: ['8dp grid', 'Elevation shadows', 'Ripple feedback'],
    preview: '/themes/2014-material.jpg',
    colors: {
      primary: '#2196f3',
      secondary: '#ff5722',
      accent: '#4caf50',
      background: '#fafafa',
      text: '#212121',
    },
    fonts: {
      primary: '"Roboto", "Noto Sans", sans-serif',       // Display: Material icon
      secondary: '"Roboto", "Source Sans Pro", sans-serif', // Text: Google standard
      accent: '"Roboto Mono", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 8,
      gridOpacity: 0.03,
      borderRadius: 4,
      shadowStyle: 'soft',
      shadowIntensity: 40,
      effects: ['elevation-shadow', 'ripple-effect', '8dp-grid', 'fab-circle'],
      letterSpacing: 0,
      lineHeight: 1.5,
      animationStyle: 'pulse',
    },
  },
  {
    id: '2015',
    name: '2015: Flat Maturity',
    era: 'Flat Design Era (2013-2015)',
    description: 'Hero images, bold typography, and flexbox layouts.',
    lesson: 'Typography is design; hierarchy via size and weight.',
    heritage: 'Landing pages with giant headlines echo this era.',
    keyElements: ['Hero imagery', '48px headlines', 'Flexbox grids'],
    preview: '/themes/2015-flat.jpg',
    colors: {
      primary: '#2196f3',
      secondary: '#4caf50',
      accent: '#ff9800',
      background: '#ffffff',
      text: '#111111',
    },
    fonts: {
      primary: '"Playfair Display", "Libre Baskerville", serif', // Display: Editorial
      secondary: '"Source Sans Pro", "Lato", sans-serif',         // Text: Modern
      accent: '"Fira Sans", sans-serif',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 6,
      gridOpacity: 0.02,
      borderRadius: 4,
      shadowStyle: 'soft',
      shadowIntensity: 20,
      effects: ['hero-image', 'bold-headline', 'flexbox-layout', 'hover-lift'],
      letterSpacing: -1,
      lineHeight: 1.4,
      animationStyle: 'float',
    },
  },
  {
    id: '2016',
    name: '2016: Design Systems Rise',
    era: 'Design Diversity (2016-2019)',
    description: 'Component libraries, cards, and crisp shadows.',
    lesson: 'Consistency across components builds usability.',
    heritage: 'Design tokens and system docs originate here.',
    keyElements: ['Card stacks', 'Floating action buttons', 'Grid dashboards'],
    preview: '/themes/2016-systems.jpg',
    colors: {
      primary: '#ff4081',
      secondary: '#00e676',
      accent: '#536dfe',
      background: '#0a0a0a',
      text: '#fafafa',
    },
    fonts: {
      primary: '"Circular", "Poppins", sans-serif',     // Display: Spotify/Airbnb
      secondary: '"Inter", "Nunito Sans", sans-serif',  // Text: Variable font
      accent: '"IBM Plex Mono", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 4,
      gridOpacity: 0.02,
      borderRadius: 8,
      shadowStyle: 'soft',
      shadowIntensity: 45,
      effects: ['card-elevation', 'token-system', 'component-hover', 'micro-animation'],
      letterSpacing: -0.5,
      lineHeight: 1.5,
      animationStyle: 'float',
    },
  },
  {
    id: '2018',
    name: '2018: Accessibility & Dark Prep',
    era: 'Design Diversity (2016-2019)',
    description: 'Refined systems, prefers-color-scheme, and WCAG focus.',
    lesson: 'Accessibility is foundational, not optional.',
    heritage: 'Contrast-driven guidelines and dark mode toggles.',
    keyElements: ['WCAG contrast', 'Dark mode previews', 'Design tokens'],
    preview: '/themes/2018-accessible.jpg',
    colors: {
      primary: '#0066cc',
      secondary: '#d32f2f',
      accent: '#1a1a1a',
      background: '#ffffff',
      text: '#0a0a0a',
    },
    fonts: {
      primary: '"Atkinson Hyperlegible", "Inter", sans-serif', // Display: A11y focused
      secondary: '"Atkinson Hyperlegible", system-ui, sans-serif', // Text: Maximum legibility
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
      lineHeight: 1.6,
      animationStyle: 'none',
    },
  },
  {
    id: '2020',
    name: '2020: Dark Mode & Neumorphism',
    era: 'Dark Mode & Personalization (2020-2021)',
    description: 'Soft inset shadows, dual palettes, and battery-friendly dark UI.',
    lesson: 'Dark mode is preference, accessibility, and battery combined.',
    heritage: 'Modern toggles and soft UI borrow from this look.',
    keyElements: ['Soft inset shadows', 'Dual theme palettes', '20px radius cards'],
    preview: '/themes/2020-neumorph.jpg',
    colors: {
      primary: '#bb86fc',
      secondary: '#03dac6',
      accent: '#cf6679',
      background: '#121212',
      text: '#e1e1e1',
    },
    fonts: {
      primary: '"Inter", "Söhne", sans-serif',          // Display: Modern variable
      secondary: '"Inter", "Suisse Int\'l", sans-serif', // Text: Premium
      accent: '"Berkeley Mono", "Fira Code", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: 4,
      gridOpacity: 0.01,
      borderRadius: 20,
      shadowStyle: 'neumorphic',
      shadowIntensity: 60,
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
    description: 'Wallpaper-driven palettes, rounded shapes, and adaptive chips.',
    lesson: 'Users expect their identity reflected in UI.',
    heritage: 'Dynamic theming and per-user tokens.',
    keyElements: ['Adaptive color chips', '28px corners', 'Personalized widgets'],
    preview: '/themes/2021-material-you.jpg',
    colors: {
      primary: '#7c4dff',
      secondary: '#ffb74d',
      accent: '#ff7043',
      background: '#fffbfe',
      text: '#1c1b1f',
    },
    fonts: {
      primary: '"Google Sans", "Product Sans", sans-serif', // Display: Google identity
      secondary: '"Roboto Flex", "Roboto", sans-serif',     // Text: Variable axes
      accent: '"Google Sans Mono", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: null,  // No grid for modern era
      gridOpacity: 0,
      borderRadius: 28,
      shadowStyle: 'soft',
      shadowIntensity: 35,
      effects: ['dynamic-color', 'shape-morph', 'adaptive-palette', 'motion-curve'],
      letterSpacing: 0,
      lineHeight: 1.5,
      animationStyle: 'morph',
    },
  },
  {
    id: '2022',
    name: '2022: Glassmorphism Era',
    era: 'Glassmorphism (2022-2023)',
    description: 'Frosted layers and translucent interfaces create depth.',
    lesson: 'Transparency and blur create modern, elegant interfaces.',
    heritage: 'Layered frosted cards and glass effects stay trendy.',
    keyElements: ['Backdrop blur', 'Frosted panels', 'Translucent layers'],
    preview: '/themes/2022-glass.jpg',
    colors: {
      primary: '#60a5fa',
      secondary: '#1e293b',
      accent: '#f0f9ff',
      background: '#0f172a',
      text: '#e2e8f0',
    },
    fonts: {
      primary: '"Space Grotesk", "Outfit", sans-serif',   // Display: Tech-forward
      secondary: '"Inter", "Plus Jakarta Sans", sans-serif', // Text: Clean variable
      accent: '"Space Mono", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: null,  // No grid for glass era
      gridOpacity: 0,
      borderRadius: 24,
      shadowStyle: 'glass',
      shadowIntensity: 50,
      effects: ['backdrop-blur', 'frosted-glass', 'border-glow', 'layer-depth'],
      letterSpacing: -0.5,
      lineHeight: 1.5,
      animationStyle: 'float',
    },
  },
  {
    id: '2023',
    name: '2023: AI Glass Playgrounds',
    era: 'Glassmorphism (2022-2023)',
    description: 'Chat-inspired layouts, animated gradients, and playful glow.',
    lesson: 'AI UIs invite personality and layered motion.',
    heritage: 'Modern chatbots and particle canvases mimic this era.',
    keyElements: ['Animated gradients', 'Floating particles', 'Conversational bubbles'],
    preview: '/themes/2023-ai.jpg',
    colors: {
      primary: '#a855f7',
      secondary: '#06b6d4',
      accent: '#f472b6',
      background: '#0c0a1d',
      text: '#f8fafc',
    },
    fonts: {
      primary: '"Clash Display", "Satoshi", sans-serif',   // Display: Independent foundry
      secondary: '"General Sans", "DM Sans", sans-serif',  // Text: Contemporary
      accent: '"Geist Mono", "JetBrains Mono", monospace',
    },
    style: 'absurd',
    designTokens: {
      gridSize: null,  // No grid
      gridOpacity: 0,
      borderRadius: 20,
      shadowStyle: 'glow',
      shadowIntensity: 70,
      effects: ['gradient-animate', 'particle-float', 'aurora-glow', 'chat-bubble', 'holographic-shimmer'],
      letterSpacing: -0.5,
      lineHeight: 1.5,
      animationStyle: 'float',
    },
  },
  {
    id: '2024',
    name: '2024: Maximalism Renaissance',
    era: 'Maximalism & Hyper-Personalization (2024-2025)',
    description: 'Bold palettes, AI textures, and expressive typography everywhere.',
    lesson: 'Abundance plus personalization can feel premium.',
    heritage: 'Vercel and Framer-style portfolios ride this wave.',
    keyElements: ['8+ color palettes', 'Particle swarms', 'Generative backgrounds'],
    preview: '/themes/2024-maximal.jpg',
    colors: {
      primary: '#ec4899',
      secondary: '#06b6d4',
      accent: '#fbbf24',
      background: '#030014',
      text: '#faf5ff',
    },
    fonts: {
      primary: '"Geist", "Söhne", sans-serif',             // Display: Vercel flagship
      secondary: '"Geist", "Inter", sans-serif',           // Text: Same family
      accent: '"Geist Mono", "Berkeley Mono", monospace',
    },
    style: 'absurd',
    designTokens: {
      gridSize: null,  // No grid
      gridOpacity: 0,
      borderRadius: 16,
      shadowStyle: 'glow',
      shadowIntensity: 80,
      effects: ['gradient-mesh', 'particle-swarm', 'noise-texture', 'liquid-morph', 'chromatic-aberration'],
      letterSpacing: -1,
      lineHeight: 1.4,
      animationStyle: 'morph',
    },
  },
  {
    id: '2025',
    name: '2025: Spatial Web',
    era: 'Maximalism & Hyper-Personalization (2024-2025)',
    description: 'Glassmorphism meets spatial depth, gesture hints, and AI particles.',
    lesson: 'Depth, motion, and personalization define premium feel.',
    heritage: 'Vision Pro and spatial design flow into the web.',
    keyElements: ['Floating glass cards', 'Gesture hints', 'AI particle systems'],
    preview: '/themes/2025-spatial.jpg',
    colors: {
      primary: '#8b5cf6',
      secondary: '#3b82f6',
      accent: '#14b8a6',
      background: '#020617',
      text: '#f8fafc',
    },
    fonts: {
      primary: '"SF Pro Display", "Geist", sans-serif',    // Display: Apple spatial
      secondary: '"SF Pro Text", "Inter", sans-serif',     // Text: Apple ecosystem
      accent: '"SF Mono", "Geist Mono", monospace',
    },
    style: 'sketch',
    designTokens: {
      gridSize: null,  // No grid - clean spatial
      gridOpacity: 0,
      borderRadius: 32,
      shadowStyle: 'glass',
      shadowIntensity: 60,
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


