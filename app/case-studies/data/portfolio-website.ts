import { CaseStudy } from '../types';

export const portfolioWebsite: CaseStudy = {
  id: 'portfolio-website',
  title: 'Portfolio Website',
  coverColor: 'bg-yellow-100',  summary: 'A playful, interactive portfolio website showcasing creative work with engaging animations and user interactions.',
  sketchImg: '/images/portfolio/sketch-portfolio.svg',
  finalImg: '/images/portfolio/final-portfolio.svg',
  
  steps: [
    { label: 'Research', desc: 'Understanding target audience and competitive analysis.' },
    { label: 'Sketch', desc: 'Initial wireframes and layout exploration.' },
    { label: 'Design', desc: 'Visual system, color palette, and typography.' },
    { label: 'Build', desc: 'React, Next.js, Three.js implementation.' },
    { label: 'Launch', desc: 'Deployment and performance optimization.' },
  ],
  
  branding: {
    colors: ['#FFD466', '#FF6B6B', '#4ECDC4', '#292F36', '#F7F7F7'],
    typography: {
      primary: 'Inter',
      secondary: 'Caveat',
    },
    description: 'The branding focuses on a playful yet professional aesthetic that balances creative expression with usability. Hand-drawn elements and vibrant colors create personality while maintaining readability and accessibility.'
  },
  
  colorTheory: {
    palette: ['#FFD466', '#FF6B6B', '#4ECDC4', '#292F36', '#F7F7F7'],
    description: 'The color palette combines warm yellows with cool teals to create visual harmony. Bright accent colors are balanced by neutral grays, ensuring content remains the focus while maintaining visual interest.',
    psychology: 'Yellow evokes creativity and optimism, while teal provides stability and trust. The combination creates an approachable yet professional impression.'
  },
  
  ideation: {
    description: 'The portfolio concept emerged from wanting to create a digital workspace that feels like a creative studio. The idea was to make the portfolio itself a demonstration of design and development skills.',
    images: [
      '/images/portfolio/ideation-mindmap.png',
      '/images/portfolio/ideation-sketches.png'
    ],
    keyInsights: [
      'Interactive elements should enhance, not distract from content',
      'Portfolio should demonstrate technical skills through implementation',
      'User experience should be memorable and engaging'
    ]
  },
  
  sketching: {
    description: 'Initial sketches explored various layout approaches, from traditional grids to more experimental arrangements. The focus was on creating clear information hierarchy while maintaining visual interest.',
    images: [
      '/images/portfolio/sketch-layouts.png',
      '/images/portfolio/sketch-components.png'
    ],
    iterations: 12
  },
  
  wireframes: {
    description: 'Wireframes established the core structure and navigation patterns. Special attention was paid to responsive behavior and accessibility considerations.',
    images: [
      '/images/portfolio/wireframe-desktop.png',
      '/images/portfolio/wireframe-mobile.png'
    ],
    userFlow: 'Homepage → Work → Case Study → Contact'
  },
  
  finalScreens: {
    description: 'The final design incorporates interactive 3D elements, smooth animations, and a cohesive visual system that works across all devices.',
    images: [
      '/images/portfolio/final-homepage.png',
      '/images/portfolio/final-work.png',
      '/images/portfolio/final-casestudy.png'
    ],
    features: [
      'Interactive 3D backgrounds',
      'Smooth page transitions',
      'Responsive design',
      'Accessibility optimized'
    ]
  },
  
  figmaEmbed: {
    title: 'Portfolio Design System',
    embedUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2Fexample',
    description: 'Explore the complete design system including components, color schemes, and interactive prototypes.'
  },
  
  productDescription: 'This portfolio website serves as both a showcase and a playground for creative exploration. Built with modern web technologies, it demonstrates proficiency in React, Next.js, Three.js, and advanced CSS animations.',
  
  technologies: ['Next.js', 'React', 'TypeScript', 'Three.js', 'Framer Motion', 'Tailwind CSS'],
  
  links: [
    {
      title: 'Live Website',
      url: '#',
      icon: '🌐'
    },
    {
      title: 'GitHub Repository',
      url: '#',
      icon: '<svg>...</svg>'
    },
    {
      title: 'Design Files',
      url: '#',
      icon: '🎨'
    }
  ],
  
  results: [
    {
      metric: 'Page Load Time',
      value: '< 2s',
      description: 'Optimized performance with lazy loading'
    },
    {
      metric: 'Accessibility Score',
      value: '98/100',
      description: 'WCAG 2.1 AA compliant'
    },
    {
      metric: 'User Engagement',
      value: '+40%',
      description: 'Increased time on site'
    }
  ]
};
