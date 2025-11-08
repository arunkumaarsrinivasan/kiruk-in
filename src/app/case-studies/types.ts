// Interface for case study data structure
export interface CaseStudy {
  id: string;
  title: string;
  coverColor: string;
  summary: string;
  
  // Images
  coverImage?: string;
  sketchImg: string;
  finalImg: string;
  
  // Process steps
  steps: {
    label: string;
    desc: string;
  }[];
  
  // Detailed content sections
  branding?: {
    logo?: string;
    colors: string[];
    typography: {
      primary: string;
      secondary: string;
    };
    description: string;
  };
  
  colorTheory?: {
    palette: string[];
    description: string;
    psychology?: string;
  };
  
  ideation?: {
    description: string;
    images: string[];
    keyInsights?: string[];
  };
  
  sketching?: {
    description: string;
    images: string[];
    iterations?: number;
  };
  
  wireframes?: {
    description: string;
    images: string[];
    userFlow?: string;
  };
  
  finalScreens?: {
    description: string;
    images: string[];
    features?: string[];
  };
  
  // Figma embed
  figmaEmbed?: {
    title: string;
    embedUrl: string;
    description: string;
  };
  
  // Product details
  productDescription?: string;
  technologies?: string[];
  
  // Project links
  links?: {
    title: string;
    url: string;
    icon?: string;
  }[];
  
  // Metrics/Results
  results?: {
    metric: string;
    value: string;
    description?: string;
  }[];
}
