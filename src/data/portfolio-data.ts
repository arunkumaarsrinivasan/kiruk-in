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
    behance?: string;
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
    id: '2023',
    name: '2023: AI-Native Interfaces',
    era: 'AI-Native Interfaces (2023)',
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
    id: '2026',
    name: '2026: Generative Interfaces',
    era: 'Generative UI (2026)',
    description: 'The interface stopped being drawn and started being prompted. You describe a page in plain English and watch it build itself live — navbar, sections, components — prompt by prompt. Design became a conversation with a compiler.',
    lesson: 'When you can prompt an interface into existence, the craft moves from pixels to intent — and the build happens live.',
    heritage: 'Every v0, Lovable and bolt prompt box; every "describe it and watch it render" build loop.',
    keyElements: ['Prompt-to-UI', 'Live build execution', 'Generated components', 'Preview ⇄ Code'],
    preview: '/themes/2026-generative.jpg',
    colors: {
      primary: '#5eead4',
      secondary: '#a3e635',
      accent: '#f0abfc',
      background: '#070809',
      text: '#e9f0ee',
    },
    fonts: {
      primary: '"Geist", "Inter", sans-serif',
      secondary: '"Inter", "DM Sans", sans-serif',
      accent: '"Geist Mono", "JetBrains Mono", monospace',
    },
    style: 'minimal',
    designTokens: {
      gridSize: null,
      gridOpacity: 0,
      borderRadius: 14,
      shadowStyle: 'glow',
      shadowIntensity: 60,
      effects: ['agent-pulse', 'task-graph', 'live-stream', 'hud-grid', 'glass-edge'],
      letterSpacing: -0.3,
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
    bio: 'Co-founder and Design & Frontend Lead at Spera.bot — building the platform to design, backtest, and run crypto strategies without a developer. Previously UX Design Engineer on HP\'s Innovation for India team. I build design tools, experimental websites, and whatever feels right — always leveraging UX to make complex products feel human.',
    tagline: 'Scribbles that turn into digital experiences',
    email: 'arunkumaar.srinivasan@gmail.com',
    linkedin: 'https://linkedin.com/in/arunkumaarsreenivasan/',
    github: 'https://github.com/arunkumaarsrinivasan',
    phone: '+91 94865 82579',
    resumeUrl: 'https://www.behance.net/arunkusriniva',
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
    behance: 'https://www.behance.net/arunkusriniva',
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
      id: 'spera-platform',
      title: 'Spera — Build & backtest crypto strategies without a developer',
      description: 'Co-founding and leading design, frontend, and interaction for a platform where traders own the full loop — design, backtest, paper trade, iterate',
      longDescription: 'Spera is the faster path from idea to live strategy: build, backtest, and paper trade your own crypto strategy without sharing your edge, waiting weeks, or managing servers. AI helps go from idea to tested in hours. Leading end-to-end product experience — the visual Logic Deck (ordered steps, not spaghetti), reproducible backtests with pinned data and honest fees/slippage, AI-assisted drafting where every suggestion is a visible row you can accept or reject, and run manifests so every decision is logged. Built for serious strategy builders who are tired of the hire-a-developer loop.',
      category: 'ai',
      status: 'in-progress',
      technologies: ['Next.js', 'TypeScript', 'Figma', 'Design Systems', 'Interaction Design', 'Frontend', 'Product Design'],
      features: [
        'Visual Logic Deck — strategies as ordered steps, drag to reorder',
        'Reproducible backtests with pinned datasets and versioned logic',
        'AI inline drafts — visible suggestions, your edge stays yours',
        'Paper trading flow (live execution in private build)',
        'Run manifests and full audit trail',
        'Walk-forward and overfitting-aware validation',
      ],
      challenges: [
        'Making systematic trading approachable without dumbing it down',
        'Designing AI assistance that accelerates without hiding logic',
        'Owning design and frontend as co-founder on a pre-release product',
      ],
      learnings: [
        'Product design for operator-grade fintech tooling',
        'Compressing the design → backtest → iterate loop into hours',
        'Building trust through reproducibility and inspectable AI',
      ],
      images: {
        thumbnail: '/projects/spera-platform.svg',
        gallery: [],
      },
      links: {
        live: 'https://www.spera.bot',
        github: 'https://github.com/arunkumaarsrinivasan',
      },
      timeline: {
        startDate: '2026-02-01',
        duration: 'ongoing',
      },
      role: 'Co-founder · Design & Frontend Lead',
      tags: ['ai', 'crypto', 'fintech', 'design-engineering', 'backtesting'],
      metrics: {
        impact: 'Full design-to-ship loop for strategy builders — no developer handoffs',
      },
    },
    {
      id: 'hp-print-ai',
      title: 'HP Print AI',
      description: 'Designed the industry\'s first intelligent print experience — translating complex AI logic into human-centered workflows',
      longDescription: 'Key contributor to HP Print AI, designing the industry\'s first intelligent print experience by translating complex AI logic into intuitive, human-centered workflows. Worked within HP\'s Innovation for India team to shape how millions of users interact with AI-powered printing. Internal case study visuals withheld under HP NDA.',
      category: 'ai',
      status: 'completed',
      technologies: ['Figma', 'UX Research', 'AI UX', 'Prototyping', 'Design Systems'],
      features: [
        'Intelligent print experience design',
        'AI workflow translation into usable UI',
        'Human-centered print journeys',
        'Cross-functional product collaboration',
      ],
      challenges: [
        'Making opaque AI decisions feel trustworthy',
        'Designing for consumer and B2B print contexts',
        'Aligning hardware, cloud, and UX constraints',
      ],
      learnings: [
        'AI experience design at enterprise scale',
        'Print + AI intersection patterns',
        'Innovation-for-India product constraints',
      ],
      images: {
        thumbnail: '/projects/hp-print-ai.svg',
        gallery: [],
      },
      links: {
        live: 'https://www.hp.com/us-en/printers/ai-printers.html',
      },
      timeline: {
        startDate: '2023-02-01',
        endDate: '2026-02-01',
        duration: '3 years',
      },
      role: 'UX Design Engineer',
      tags: ['ai', 'print', 'hp', 'innovation', 'nda'],
      metrics: {
        impact: 'Industry-first intelligent print experience',
      },
    },
    {
      id: 'mudra-ai-stack',
      title: 'Mudra AI Digital Service Stack',
      description: 'Scalable design system adopted by 500+ employees with generative AI prompt tooling',
      longDescription: 'Designed a scalable Design System (Next.js/Figma) adopted by 500+ employees. Engineered custom Generative AI prompts for text-to-image asset creation. Bridged Product, AI, and Engineering teams to deliver 15+ hackathon solutions and scalable email printing workflows. Case study visuals withheld under HP NDA.',
      category: 'ai',
      status: 'completed',
      technologies: ['Next.js', 'Figma', 'Design Systems', 'Prompt Engineering', 'Spring Boot', 'Node.js'],
      features: [
        'Design system used by 500+ employees',
        'Custom GenAI prompts for text-to-image assets',
        '15+ internal hackathon solutions',
        'Scalable email/webmail printing workflows',
      ],
      challenges: [
        'Scaling a design system across a large org',
        'Bridging product, AI, and engineering stakeholders',
        'Shipping hackathon ideas into durable workflows',
      ],
      learnings: [
        'Org-wide design system adoption',
        'Prompt engineering for creative tooling',
        'Cross-functional AI product delivery',
      ],
      images: {
        thumbnail: '/projects/mudra-ai-stack.svg',
        gallery: [],
      },
      links: {},
      timeline: {
        startDate: '2023-08-01',
        endDate: '2026-02-01',
        duration: '2+ years',
      },
      role: 'UX Design Engineer',
      tags: ['design-system', 'ai', 'genai', 'hp', 'nda'],
      metrics: {
        impact: '500+ employees on design system; 15+ hackathon solutions shipped',
      },
    },
    {
      id: 'get-my-prints',
      title: 'Get my Prints',
      description: 'End-to-end Flutter web UI for doorstep printouts — reducing B2C onboarding friction',
      longDescription: 'Worked end-to-end on design and engineering of a Flutter-based web UI for doorstep print delivery, significantly reducing B2C user onboarding friction and increasing conversion rates for print jobbers and consumers. Case study visuals withheld under HP NDA.',
      category: 'mobile',
      status: 'completed',
      technologies: ['Flutter', 'Figma', 'UX Research', 'Mobile Web', 'B2C'],
      features: [
        'Mobile-first Flutter web experience',
        'Streamlined B2C onboarding',
        'Doorstep print delivery flows',
        'Conversion-focused UX',
      ],
      challenges: [
        'Reducing friction for first-time print customers',
        'Mobile web performance and clarity',
        'Balancing jobber and consumer needs',
      ],
      learnings: [
        'Flutter web for consumer products',
        'Onboarding optimization for B2C',
        'Design-engineering on one surface',
      ],
      images: {
        thumbnail: '/projects/get-my-prints.svg',
        gallery: [],
      },
      links: {},
      timeline: {
        startDate: '2024-01-01',
        endDate: '2025-06-01',
        duration: '18 months',
      },
      role: 'UX Design Engineer',
      tags: ['flutter', 'mobile', 'b2c', 'hp', 'nda'],
    },
    {
      id: 'hp-print-learn-center',
      title: 'HP Print Learn Center (PLC)',
      description: 'WhatsApp API experience for parents accessing learning worksheets',
      longDescription: 'Worked on HP Print Learn Center (PLC) to integrate and optimize the WhatsApp API experience for parents accessing learning worksheets — making educational content delivery feel native inside a channel parents already use daily. Case study visuals withheld under HP NDA.',
      category: 'web',
      status: 'completed',
      technologies: ['Figma', 'WhatsApp API', 'UX Writing', 'Prototyping'],
      features: [
        'WhatsApp-native worksheet delivery',
        'Parent-facing conversation flows',
        'Print Learn Center integration',
        'Educational content UX',
      ],
      challenges: [
        'Designing within WhatsApp constraints',
        'Parent trust and clarity for child learning content',
        'API-driven interaction patterns',
      ],
      learnings: [
        'Messaging-platform UX patterns',
        'EdTech + print intersection',
        'Constraint-led design',
      ],
      images: {
        thumbnail: '/projects/hp-print-learn-center.svg',
        gallery: [],
      },
      links: {},
      timeline: {
        startDate: '2024-06-01',
        endDate: '2025-12-01',
        duration: '18 months',
      },
      role: 'UX Design Engineer',
      tags: ['edtech', 'whatsapp', 'hp', 'parents', 'nda'],
    },
    {
      id: 'hp-onboarding-app',
      title: 'HP Onboarding App',
      description: 'Smoother registration and content access for new HP users',
      longDescription: 'Enhanced the HP onboarding app flow to make registration and access to content smoother and more intuitive for new users — reducing drop-off and improving first-session comprehension. Case study visuals withheld under HP NDA.',
      category: 'mobile',
      status: 'completed',
      technologies: ['Figma', 'UX Research', 'Prototyping', 'Mobile UX'],
      features: [
        'Registration flow redesign',
        'First-session content access',
        'Reduced onboarding drop-off',
        'Clearer progressive disclosure',
      ],
      challenges: [
        'Simplifying a multi-step hardware + account setup',
        'Reducing cognitive load on first open',
        'Aligning with brand and platform patterns',
      ],
      learnings: [
        'Onboarding psychology for connected devices',
        'Iterative flow testing',
        'Enterprise mobile UX patterns',
      ],
      images: {
        thumbnail: '/projects/hp-onboarding-app.svg',
        gallery: [],
      },
      links: {},
      timeline: {
        startDate: '2024-03-01',
        endDate: '2025-09-01',
        duration: '18 months',
      },
      role: 'UX Design Engineer',
      tags: ['onboarding', 'mobile', 'hp', 'nda'],
    },
    {
      id: 'square-bridge',
      title: 'Square Bridge',
      description: 'UX strategy and design leadership for a student recruitment platform across Student, Recruiter, and PO personas',
      longDescription: 'Subject Matter Expert for Square Bridge, defining UX strategy and roadmap for Placement Officers (POs) to manage student applications and collaborate seamlessly with HR, while leading a team of three designers across Student, Recruiter, and PO personas. Designed Portfolio Builder boosting student engagement 45% and recruiter dashboards cutting discovery time 40%, with POs gaining a central dashboard for data-driven shortlisting from verified profiles — ensuring 98% design-to-code accuracy in Node.js/MongoDB implementation.',
      category: 'web',
      status: 'completed',
      technologies: ['Figma', 'Design Systems', 'UX Research', 'Node.js', 'MongoDB', 'Prototyping'],
      features: [
        'Student portfolio builder',
        'Recruiter search and discovery dashboards',
        'Placement officer central dashboard',
        'Unified design system across 150+ screens',
        'Three-person design team leadership',
      ],
      challenges: [
        'Aligning student skills, officer insight, and HR expectations',
        'Serving three distinct personas on one platform',
        'Maintaining 98% design-to-development accuracy',
      ],
      learnings: [
        'Multi-stakeholder platform strategy',
        'Design leadership with a small team',
        'From placement chaos to clarity',
      ],
      images: {
        thumbnail: '/projects/square-bridge.svg',
        gallery: [],
      },
      links: {
        figma: 'https://www.figma.com/design/VtitVweV3Pus9chSeKA0VX/Finalized-Screen---Square-Bridge',
        behance: 'https://www.behance.net/arunkusriniva',
      },
      timeline: {
        startDate: '2023-02-01',
        endDate: '2023-07-31',
        duration: '6 months',
      },
      role: 'Subject Matter Expert & Design Lead',
      tags: ['recruitment', 'platform', 'design-system', 'ux-strategy'],
      metrics: {
        impact: '45% engagement lift, 40% faster recruiter discovery, 98% design-to-code accuracy',
      },
    },
    {
      id: 'peoplegamez-hr',
      title: 'PeopleGamez.com — Gamified HR Experiences',
      description: 'Interactive gamified experiences for HR platforms through research, flows, and 100+ game assets',
      longDescription: 'Designed interactive gamified experiences for HR platforms through user research and storyboard analysis. Developed user flows, interaction models, 100+ game assets, and performance report dashboards. Created design system, report templates, and data visualization standards while delivering comprehensive interaction design documentation and prototypes with product and engineering collaboration for enhanced employee retention.',
      category: 'design',
      status: 'completed',
      technologies: ['Figma', 'Gamification', 'User Flows', 'Interaction Design', 'Data Visualization'],
      features: [
        'Gamified HR experiences (4Plantz, Motivuz, and more)',
        '100+ game assets and interaction models',
        'Performance report dashboards',
        'Design system and report templates',
      ],
      challenges: [
        'Making HR workflows playful without losing professionalism',
        'Employee retention through game mechanics',
        'Cross-functional prototype delivery',
      ],
      learnings: [
        'Gamification for enterprise HR',
        'Storyboard-driven interaction design',
        'Dashboard and data viz standards',
      ],
      images: {
        thumbnail: '/projects/peoplegamez-hr.svg',
        gallery: [],
      },
      links: {
        live: 'https://peoplegamez.com',
      },
      timeline: {
        startDate: '2022-11-01',
        endDate: '2023-01-31',
        duration: '3 months',
      },
      role: 'Interaction Design Intern',
      tags: ['hr-tech', 'game-design', 'gamification', 'interaction'],
    },
    {
      id: 'foodies-buddies',
      title: 'Foodies Buddies',
      description: 'Dating app matching foodies by taste — in-app messaging, restaurant picker, and swipe discovery',
      longDescription: 'What if you could find dates who share your passion for food — starting with a romantic dinner? Over months of collaboration, crafted Foodies Buddies, a dating app that matches foodies based on tastes and personalities. Packed with features like in-app messaging with restaurant picker, swipe/search/location discovery, and customizable profiles — a standout first design case study.',
      category: 'mobile',
      status: 'completed',
      technologies: ['Figma', 'Mobile UI', 'UX Research', 'Prototyping'],
      features: [
        'Swipe, search, and location-based discovery',
        'In-app messaging with restaurant picker',
        'Customizable foodie profiles',
        'Let\'s Dine \'n\' Dive onboarding',
      ],
      challenges: [
        'Standing out in a crowded dating app category',
        'Food preference as a matching signal',
        'Co-designing with a partner designer',
      ],
      learnings: [
        'First end-to-end mobile case study',
        'Personality + taste-based matching UX',
        'Collaborative design process',
      ],
      images: {
        thumbnail: '/projects/foodies-buddies.svg',
        gallery: [],
      },
      links: {
        behance: 'https://www.behance.net/arunkusriniva',
      },
      timeline: {
        startDate: '2022-06-01',
        endDate: '2022-09-01',
        duration: '4 months',
      },
      role: 'Co-Designer',
      tags: ['dating', 'mobile', 'food', 'case-study'],
    },
    {
      id: 'desirable',
      title: 'Desirable',
      description: 'Custom furniture marketplace connecting buyers with local manufacturers — no middlemen',
      longDescription: 'A platform bridging buyers seeking affordable custom furniture with local manufacturers cut off from direct customers. Buyers struggled with high costs and limited options; makers relied on pricey marketing. Solution: an intuitive configurator for custom designs, budget setting, and competitive bids from nearby pros — delivering transparency, simplicity, and no middlemen. Full UI and prototype in progress.',
      category: 'design',
      status: 'in-progress',
      technologies: ['Figma', 'Prototyping', 'Marketplace UX', '3D Configurator'],
      features: [
        'Custom furniture configurator',
        'Budget setting and competitive bids',
        'Local manufacturer discovery',
        'Transparent buyer–maker matching',
      ],
      challenges: [
        'Two-sided marketplace trust',
        'Complex product configuration UX',
        'Balancing affordability with craft',
      ],
      learnings: [
        'Marketplace problem framing',
        'Configurator interaction patterns',
        'Win-win platform design',
      ],
      images: {
        thumbnail: '/projects/desirable.svg',
        gallery: [],
      },
      links: {
        behance: 'https://www.behance.net/arunkusriniva',
      },
      timeline: {
        startDate: '2023-10-13',
        duration: 'ongoing',
      },
      role: 'Product Designer',
      tags: ['marketplace', 'furniture', 'configurator', 'behance'],
    },
    {
      id: 'prags-website',
      title: 'PRAGS — Interactive Musician Website',
      description: 'Scroll-to-play instrument website — Howler.js, Three.js, and GSAP for a mini live session feel',
      longDescription: 'Built prahatheesvar.in for pianist Prahatheesvar (Prags) — a website that behaves like an instrument instead of a static brochure. Scroll-to-play experience where scrolling, hovering, and clicking trigger musical notes, chords, and motion. Piano at the bottom responds to input; Howler.js for audio, Three.js for 3D visuals, GSAP for smooth performance-ready animation.',
      category: 'web',
      status: 'completed',
      technologies: ['Howler.js', 'Three.js', 'GSAP', 'Interaction Design', 'Web Audio'],
      features: [
        'Scroll-to-play musical interactions',
        'Responsive piano keyboard',
        '3D visual atmosphere',
        'Performance-ready animation',
      ],
      challenges: [
        'Syncing audio, motion, and scroll without jank',
        'Making experimental UX still navigable',
        'Honoring a musician\'s brand through interaction',
      ],
      learnings: [
        'Experimental web as instrument',
        'Web audio + 3D composition',
        'GSAP choreography at scroll speed',
      ],
      images: {
        thumbnail: '/projects/prags-website.svg',
        gallery: [],
      },
      links: {
        live: 'https://www.prahatheesvar.in/',
      },
      timeline: {
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        duration: '1 month',
      },
      role: 'Design Engineer',
      tags: ['experimental', 'web-audio', 'threejs', 'interactive'],
    },
    {
      id: 'portfolio-v3',
      title: 'KIRUK — Interactive Portfolio',
      description: 'Experimental portfolio with era shells, games, 3D, and AI chat — design tools as the product',
      longDescription: 'This portfolio is itself a product experiment: hand-drawn aesthetics, era-themed shells, arcade games, Three.js moments, and an AI assistant — a living proof that design engineering can be playful, data-driven, and shipped.',
      category: 'web',
      status: 'in-progress',
      technologies: ['Next.js', 'Three.js', 'Framer Motion', 'TypeScript', 'Tailwind CSS'],
      features: [
        'Era-themed visual time travel',
        'Interactive scribble drawing',
        'AI chat assistant',
        'Arcade games in the footer',
        'Data-driven content layer',
      ],
      challenges: [
        'Balancing creativity with usability',
        'One data layer feeding many visual eras',
        'Performance with 3D and motion',
      ],
      learnings: [
        'Portfolio as design tool',
        'Experimental UX that still ships',
        'Single source of truth architecture',
      ],
      images: {
        thumbnail: '/projects/portfolio-v3.svg',
        gallery: [
          '/projects/portfolio-v3-1.jpg',
          '/projects/portfolio-v3-2.jpg',
          '/projects/portfolio-v3-3.jpg',
        ],
      },
      links: {
        live: 'https://kiruk.in',
        github: 'https://github.com/arunkumaarsrinivasan',
      },
      timeline: {
        startDate: '2024-01-01',
        duration: 'ongoing',
      },
      role: 'Design Engineer',
      tags: ['portfolio', 'interactive', 'experimental', 'design-tools'],
    },
  ],
  experience: [
    {
      id: 'spera-design-lead',
      company: 'Spera',
      position: 'Co-founder · Design & Frontend Lead',
      location: 'Remote',
      type: 'full-time',
      startDate: '2026-02-01',
      current: true,
      companyWebsite: 'https://www.spera.bot',
      description: 'Co-founding Spera — the platform to build, backtest, and paper trade crypto strategies without a developer. Leading all design, frontend, interaction, and overall product experience: Logic Deck, reproducible backtests, AI-assisted drafting, and the full pre-release product surface at spera.bot.',
      responsibilities: [
        'Co-found and own end-to-end product design and design system',
        'Lead frontend implementation and interaction design',
        'Define experience strategy for strategy builders and trading desks',
        'Design AI assistance that accelerates without hiding user logic',
        'Ship the design → backtest → iterate loop in hours, not weeks',
      ],
      achievements: [
        'Co-founded Spera and shipped spera.bot product experience',
        'Visual Logic Deck, backtest manifests, and AI inline drafts',
        'Unified design, frontend, and interaction under one workflow',
      ],
      technologies: ['Next.js', 'TypeScript', 'Figma', 'Design Systems', 'Interaction Design', 'Frontend', 'Product Strategy'],
      projects: ['spera-platform'],
    },
    {
      id: 'hp-ux-designer',
      company: 'HP Inc',
      position: 'UX Design Engineer',
      location: 'Bengaluru, India',
      type: 'full-time',
      startDate: '2023-02-01',
      endDate: '2026-02-01',
      current: false,
      description: 'UX Design Engineer on HP\'s Innovation for India team for three years — main design engineer for the team, leveraging design across HP Print AI, Mudra AI Digital Service Stack, Get my Prints, Print Learn Center, and onboarding experiences. Translated complex AI and print logic into intuitive, human-centered workflows. Portfolio case visuals withheld under NDA.',
      responsibilities: [
        'Served as main design engineer for Innovation for India',
        'Designed HP Print AI — industry\'s first intelligent print experience',
        'Built Mudra AI Stack design system adopted by 500+ employees',
        'End-to-end design and engineering for Get my Prints Flutter web UI',
        'Optimized WhatsApp API flows for HP Print Learn Center',
        'Enhanced HP onboarding app registration and content access',
        'Engineered GenAI prompts and scalable email printing workflows',
      ],
      achievements: [
        'Key contributor to HP Print AI intelligent print experience',
        'Design system adopted by 500+ employees on Mudra AI Stack',
        '15+ hackathon solutions delivered with Product, AI, and Engineering',
        'Reduced B2C onboarding friction and improved conversion on Get my Prints',
        'Bridged design and engineering for India-market innovation',
      ],
      technologies: ['Figma', 'Next.js', 'Flutter', 'Node.js', 'Spring Boot', 'TypeScript', 'Prompt Engineering', 'Design Systems', 'WhatsApp API'],
      projects: ['hp-print-ai', 'mudra-ai-stack', 'get-my-prints', 'hp-print-learn-center', 'hp-onboarding-app'],
    },
    {
      id: 'sns-square-product-designer',
      company: 'SNS Square',
      position: 'Subject Matter Expert & Design Lead',
      location: 'Remote',
      type: 'contract',
      startDate: '2023-02-01',
      endDate: '2023-07-31',
      current: false,
      description: 'Subject Matter Expert for Square Bridge, defining UX strategy and roadmap for Placement Officers while leading three designers across Student, Recruiter, and PO personas. From placement chaos to clarity — a unified bridge aligning student skills, officer insight, and HR expectations.',
      responsibilities: [
        'Defined UX strategy and roadmap for Placement Officers',
        'Led team of three designers across three personas',
        'Designed portfolio builder, recruiter dashboards, and PO central dashboard',
        'Created unified design system and 150+ UI screens',
        'Collaborated with Node.js/MongoDB engineering for implementation',
      ],
      achievements: [
        '45% boost in student engagement via Portfolio Builder',
        '40% reduction in recruiter candidate discovery time',
        '98% design-to-code accuracy on Node.js/MongoDB stack',
        'Central PO dashboard for data-driven shortlisting',
      ],
      technologies: ['Figma', 'UX Strategy', 'Design Systems', 'Node.js', 'MongoDB', 'Prototyping'],
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
      description: 'Designed interactive gamified experiences for HR platforms through user research and storyboard analysis. Developed user flows, interaction models, 100+ game assets, and performance report dashboards with product and engineering collaboration.',
      responsibilities: [
        'Designed gamified HR experiences (4Plantz, Motivuz, and more)',
        'Conducted user research and storyboard analysis',
        'Developed user flows, interaction models, and 100+ game assets',
        'Created design system, report templates, and data visualization standards',
        'Delivered interaction design documentation and prototypes',
      ],
      achievements: [
        '100+ game assets and interaction models shipped',
        'Performance report dashboards and design system created',
        'Enhanced employee retention through gamified HR flows',
      ],
      technologies: ['Figma', 'Gamification', 'Interaction Design', 'User Flows', 'Data Visualization'],
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
      description: 'Freelance design across branding, UI/UX, and experimental websites — including Foodies Buddies, Desirable, PRAGS scroll-to-play site, and client work for studios and resorts while completing engineering degree.',
      responsibilities: [
        'Branding, UI/UX, and experimental web design',
        'Interactive sites (web audio, 3D, motion)',
        'Case studies and portfolio projects',
        'Client collaboration across web, mobile, and print',
      ],
      achievements: [
        'Foodies Buddies — first standout mobile case study',
        'Desirable — custom furniture marketplace concept',
        'PRAGS — scroll-to-play musician website at prahatheesvar.in',
        'Delivered branding and design across diverse industries',
      ],
      technologies: ['Figma', 'Adobe Illustrator', 'UI/UX Design', 'Branding', 'Prototyping', 'GSAP', 'Three.js'],
      projects: ['foodies-buddies', 'desirable', 'prags-website'],
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
      context: 'Square Bridge Portfolio Builder'
    },
    {
      id: 'design-system',
      value: '500+',
      label: 'employees on design system',
      category: 'scale',
      icon: '🎨',
      context: 'Mudra AI Digital Service Stack'
    },
    {
      id: 'products',
      value: '15+',
      label: 'hackathon solutions',
      category: 'delivery',
      icon: '🚀',
      context: 'HP Innovation for India'
    },
    {
      id: 'accuracy',
      value: '98%',
      label: 'design-to-code accuracy',
      category: 'impact',
      icon: '⚡',
      context: 'Square Bridge · Node.js/MongoDB'
    }
  ],
  whyUXDesignEngineer: {
    hook: 'Design tools, experimental websites, and whatever feels right.',
    painPoint: 'When UX craft and production code live apart, products lose soul and speed.',
    solution: 'I own design, frontend, and interaction — leveraging UX experience to make complex products feel human.',
    tagline: 'One designer. One builder. Better experiences.'
  },
  metadata: {
    version: '1.1.0',
    lastUpdated: new Date().toISOString(),
    seo: {
      title: 'Kiruk | Co-founder · Design & Frontend Lead at Spera',
      description: 'Portfolio of Arun Kumaar Sreenivasan — Co-founder at Spera.bot. Former UX Design Engineer on HP Innovation for India (HP Print AI, Mudra Stack). Experimental websites, design tools, and human-centered UX.',
      keywords: ['design-engineer', 'spera', 'hp-print-ai', 'design-systems', 'experimental-web', 'interaction-design', 'figma', 'nextjs', 'flutter', 'ai-ux'],
      ogImage: '/og-image.jpg',
    },
  },
};


