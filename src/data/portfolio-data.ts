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
    primary: string;
    secondary: string;
    accent: string;
  };
  style: 'sketch' | 'minimal' | 'absurd';
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

// Available Themes
export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: '1970',
    name: '1970: Terminal & ASCII',
    era: 'Pre-Web Foundations',
    description: 'Green phosphor terminals, command prompts, and ASCII-only storytelling.',
    lesson: 'Typography is the UI -- function over form.',
    heritage: "Seeded today's terminal-inspired portfolios and brutalist web.",
    keyElements: ['Monospace grids', 'Blinking cursors', 'Phosphor glow'],
    preview: '/themes/1970-terminal.jpg',
    colors: {
      primary: '#00ff00',
      secondary: '#003b00',
      accent: '#00ff00',
      background: '#000000',
      text: '#00ff00',
    },
    fonts: {
      primary: 'Courier New',
      secondary: 'Courier New',
      accent: 'Courier New',
    },
    style: 'minimal',
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
      primary: '#0066cc',
      secondary: '#dcdcdc',
      accent: '#003399',
      background: '#c0c0c0',
      text: '#1a1a1a',
    },
    fonts: {
      primary: 'Helvetica',
      secondary: 'Helvetica',
      accent: 'Helvetica',
    },
    style: 'minimal',
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
      primary: '#0000ff',
      secondary: '#f7f7f7',
      accent: '#0000ff',
      background: '#ffffff',
      text: '#000000',
    },
    fonts: {
      primary: 'Times New Roman',
      secondary: 'Times New Roman',
      accent: 'Times New Roman',
    },
    style: 'minimal',
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
      secondary: '#ffe6ff',
      accent: '#ff00ff',
      background: '#fff8ff',
      text: '#111111',
    },
    fonts: {
      primary: 'Arial',
      secondary: 'Comic Sans MS',
      accent: 'Courier New',
    },
    style: 'absurd',
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
      accent: '#00ff00',
      background: '#0b0025',
      text: '#fdfd96',
    },
    fonts: {
      primary: 'Arial Black',
      secondary: 'Comic Sans MS',
      accent: 'Courier New',
    },
    style: 'absurd',
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
      primary: '#ffcc00',
      secondary: '#003366',
      accent: '#ff6600',
      background: '#002347',
      text: '#f4f4f4',
    },
    fonts: {
      primary: 'Verdana',
      secondary: 'Arial',
      accent: 'Verdana',
    },
    style: 'minimal',
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
      secondary: '#d9e2ec',
      accent: '#0066cc',
      background: '#ffffff',
      text: '#1f2933',
    },
    fonts: {
      primary: 'Trebuchet MS',
      secondary: 'Verdana',
      accent: 'Trebuchet MS',
    },
    style: 'minimal',
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
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      accent: '#667eea',
      background: '#f3f1ff',
      text: '#1f1b24',
    },
    fonts: {
      primary: 'Lucida Grande',
      secondary: 'Arial',
      accent: 'Lucida Grande',
    },
    style: 'minimal',
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
      secondary: '#ff8800',
      accent: '#f8fafc',
      background: '#f5f5f5',
      text: '#1a1a1a',
    },
    fonts: {
      primary: 'Helvetica',
      secondary: 'Arial',
      accent: 'Helvetica',
    },
    style: 'minimal',
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
      secondary: '#888888',
      accent: '#00c7be',
      background: '#fafafa',
      text: '#1f1f1f',
    },
    fonts: {
      primary: 'Helvetica Neue',
      secondary: 'Arial',
      accent: 'Helvetica Neue',
    },
    style: 'minimal',
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
      secondary: '#ff3333',
      accent: '#00c3ff',
      background: '#ffffff',
      text: '#1e1e1e',
    },
    fonts: {
      primary: 'San Francisco',
      secondary: 'Helvetica Neue',
      accent: 'San Francisco',
    },
    style: 'minimal',
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
      text: '#16181f',
    },
    fonts: {
      primary: 'Helvetica Neue',
      secondary: 'Open Sans',
      accent: 'Helvetica Neue',
    },
    style: 'minimal',
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
      text: '#1f1f1f',
    },
    fonts: {
      primary: 'Roboto',
      secondary: 'Open Sans',
      accent: 'Roboto',
    },
    style: 'minimal',
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
      text: '#121212',
    },
    fonts: {
      primary: 'San Francisco',
      secondary: 'system-ui',
      accent: 'San Francisco',
    },
    style: 'minimal',
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
      background: '#0b0b0b',
      text: '#f5f5f5',
    },
    fonts: {
      primary: 'Google Sans',
      secondary: 'system-ui',
      accent: 'Google Sans',
    },
    style: 'minimal',
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
      primary: '#1976d2',
      secondary: '#dc3545',
      accent: '#121212',
      background: '#ffffff',
      text: '#111111',
    },
    fonts: {
      primary: 'system-ui',
      secondary: '-apple-system',
      accent: 'system-ui',
    },
    style: 'minimal',
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
      secondary: '#2196f3',
      accent: '#e0e5ec',
      background: '#121212',
      text: '#f1f1f1',
    },
    fonts: {
      primary: 'Inter',
      secondary: 'system-ui',
      accent: 'Inter',
    },
    style: 'minimal',
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
      background: '#f9f5ff',
      text: '#1d1d1f',
    },
    fonts: {
      primary: 'system-ui',
      secondary: '-apple-system',
      accent: 'San Francisco',
    },
    style: 'minimal',
  },
  {
    id: '2022',
    name: '2022: Glass vs Neo-Brutalism',
    era: 'Glassmorphism & Neo-Brutalism (2022-2023)',
    description: 'Frosted layers clash with thick black outlines.',
    lesson: 'Design swings between polished and raw aesthetics.',
    heritage: 'Layered frosted cards and brutalist outlines stay trendy.',
    keyElements: ['Backdrop blur', 'Frosted panels', '3px brutalist borders'],
    preview: '/themes/2022-glass.jpg',
    colors: {
      primary: '#93c5fd',
      secondary: '#111827',
      accent: '#ffffff',
      background: '#0f172a',
      text: '#e2e8f0',
    },
    fonts: {
      primary: 'Space Grotesk',
      secondary: 'Courier New',
      accent: 'Space Grotesk',
    },
    style: 'minimal',
  },
  {
    id: '2023',
    name: '2023: AI Glass Playgrounds',
    era: 'Glassmorphism & Neo-Brutalism (2022-2023)',
    description: 'Chat-inspired layouts, animated gradients, and playful glow.',
    lesson: 'AI UIs invite personality and layered motion.',
    heritage: 'Modern chatbots and particle canvases mimic this era.',
    keyElements: ['Animated gradients', 'Floating particles', 'Conversational bubbles'],
    preview: '/themes/2023-ai.jpg',
    colors: {
      primary: '#a855f7',
      secondary: '#06b6d4',
      accent: '#f472b6',
      background: '#1e1b4b',
      text: '#f8fafc',
    },
    fonts: {
      primary: 'Clash Display',
      secondary: 'Space Grotesk',
      accent: 'Clash Display',
    },
    style: 'absurd',
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
      accent: '#f59e0b',
      background: '#0b021a',
      text: '#f5f3ff',
    },
    fonts: {
      primary: 'Whyte',
      secondary: 'Space Grotesk',
      accent: 'Whyte',
    },
    style: 'absurd',
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
      background: '#030712',
      text: '#f8fafc',
    },
    fonts: {
      primary: 'StackSansText',
      secondary: 'StackSansHeadline',
      accent: 'StackSansNotch',
    },
    style: 'sketch',
  },
];

// Default/Current Portfolio Data
export const portfolioData: PortfolioData = {
  personal: {
    name: 'KIRUK',
    fullName: 'Arun kumaar Sreenivasan',
    title: 'Full-Stack Developer & Designer',
    location: 'Bangalore, India',
    bio: 'Passionate full-stack developer and designer who believes in the power of pen and paper. I create digital experiences that bridge the gap between artistic creativity and technical innovation.',
    tagline: 'Scribbles that turn into digital experiences',
    email: 'arunkumaar.srinivasan@gmail.com',
    linkedin: 'https://linkedin.com/in/arunkumaarsreenivasan/',
    github: 'https://github.com/arunkumaarsrinivasan',
  },
  contact: {
    email: 'arunkumaar.srinivasan@gmail.com',
    location: 'Bangalore, India',
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
  },
  skills: [
    {
      id: 'react',
      name: 'React',
      category: 'frontend',
      level: 9,
      icon: '??',
      description: 'Advanced React development with hooks, context, and modern patterns',
      yearsOfExperience: 4,
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      category: 'frontend',
      level: 8,
      icon: '??',
      description: 'Strong typing and advanced TypeScript patterns',
      yearsOfExperience: 3,
    },
    {
      id: 'nextjs',
      name: 'Next.js',
      category: 'frontend',
      level: 9,
      icon: '?',
      description: 'Full-stack Next.js development with SSR, SSG, and API routes',
      yearsOfExperience: 3,
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      category: 'backend',
      level: 8,
      icon: '??',
      description: 'Server-side development with Express, APIs, and microservices',
      yearsOfExperience: 4,
    },
    {
      id: 'ux-design',
      name: 'UX Design',
      category: 'design',
      level: 8,
      icon: '??',
      description: 'User-centered design, wireframing, and prototyping',
      yearsOfExperience: 5,
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
  ],
  experience: [
    {
      id: 'current-role',
      company: 'Freelance',
      position: 'Full-Stack Developer & Designer',
      location: 'Remote',
      type: 'freelance',
      startDate: '2023-01-01',
      current: true,
      description: 'Working with various clients to create web applications and digital experiences',
      responsibilities: [
        'Full-stack web development',
        'UX/UI design',
        'Client consultation',
        'Project management',
      ],
      achievements: [
        'Delivered 15+ successful projects',
        'Maintained 98% client satisfaction rate',
        'Reduced development time by 30% through reusable components',
      ],
      technologies: ['React', 'Next.js', 'Node.js', 'TypeScript', 'Figma'],
      projects: ['portfolio-v3'],
    },
  ],
  education: [
    {
      id: 'engineering',
      institution: 'Engineering College',
      degree: 'Bachelor of Engineering',
      field: 'Computer Science',
      location: 'India',
      startDate: '2018-08-01',
      endDate: '2022-05-01',
      relevantCourses: [
        'Data Structures and Algorithms',
        'Web Development',
        'Database Management',
        'Software Engineering',
      ],
    },
  ],
  certifications: [],
  blog: [],
  testimonials: [],
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    seo: {
      title: 'Kiruk | Full-Stack Developer & Designer Portfolio',
      description: 'Portfolio of Arun kumaar Sreenivasan - Full-Stack Developer and Designer specializing in React, Next.js, and creative web experiences.',
      keywords: ['full-stack developer', 'web designer', 'react developer', 'next.js', 'portfolio'],
      ogImage: '/og-image.jpg',
    },
  },
};


