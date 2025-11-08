// Portfolio data types
export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'ux-design' | 'ai-integration' | 'design-system' | 'research';
  tags: string[];
  thumbnail: string;
  images: string[];
  year: number;
  client?: string;
  duration?: string;
  role: string;
  tools: string[];
  overview: string;
  challenge: string;
  solution: string;
  outcome: string;
  featured: boolean;
  published: boolean;
}

export interface CaseStudy extends Project {
  sections: CaseStudySection[];
  nextProject?: string;
  previousProject?: string;
}

export interface CaseStudySection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'gallery' | 'quote';
  data?: {
    images?: string[];
    caption?: string;
    quote?: string;
    author?: string;
  };
}

// Contact form types
export interface ContactFormData {
  name: string;
  email: string;
  projectType: string;
  message: string;
}

// Navigation types
export interface NavItem {
  href: string;
  label: string;
  external?: boolean;
}

// Animation types
export interface ScribblePoint {
  x: number;
  y: number;
  z: number;
}

export interface ScribbleLine {
  points: ScribblePoint[];
  color: string;
  lineWidth: number;
}
