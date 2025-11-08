// Centralized Portfolio Data Structure
// This data will be theme-agnostic and reusable across all themes

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
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
    id: 'sketch',
    name: 'Sketch Theme',
    description: 'Hand-drawn, creative, and artistic design with doodles and scribbles',
    preview: '/themes/sketch-preview.jpg',
    colors: {
      primary: '#000000',
      secondary: '#6B7280',
      accent: '#FFE066',
      background: '#FFFFFF',
      text: '#111827',
    },
    fonts: {
      primary: 'Left Hand',
      secondary: 'Bridges Not Walls',
      accent: 'Magnetic Drawing',
    },
    style: 'sketch',
  },
  {
    id: 'minimal',
    name: 'Minimal Theme',
    description: 'Clean, professional, and focused design with elegant handwritten typography',
    preview: '/themes/minimal-preview.jpg',
    colors: {
      primary: '#0F172A',
      secondary: '#64748B',
      accent: '#3B82F6',
      background: '#FFFFFF',
      text: '#1E293B',
    },
    fonts: {
      primary: 'Left Hand',
      secondary: 'Magnetic Drawing',
      accent: 'Bridges Not Walls',
    },
    style: 'minimal',
  },
  {
    id: 'absurd',
    name: 'Absurd Theme',
    description: 'Bold, experimental, and unconventional handwritten design pushing creative boundaries',
    preview: '/themes/absurd-preview.jpg',
    colors: {
      primary: '#FF0080',
      secondary: '#00FF80',
      accent: '#8000FF',
      background: '#000000',
      text: '#FFFFFF',
    },
    fonts: {
      primary: 'Magnetic Drawing',
      secondary: 'Left Hand',
      accent: 'Bridges Not Walls',
    },
    style: 'absurd',
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
      description: 'Strong typing and advanced TypeScript patterns',
      yearsOfExperience: 3,
    },
    {
      id: 'nextjs',
      name: 'Next.js',
      category: 'frontend',
      level: 9,
      icon: '▲',
      description: 'Full-stack Next.js development with SSR, SSG, and API routes',
      yearsOfExperience: 3,
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      category: 'backend',
      level: 8,
      icon: '🟢',
      description: 'Server-side development with Express, APIs, and microservices',
      yearsOfExperience: 4,
    },
    {
      id: 'ux-design',
      name: 'UX Design',
      category: 'design',
      level: 8,
      icon: '🎨',
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
