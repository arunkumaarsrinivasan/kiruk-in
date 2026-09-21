/**
 * Help Bot Data
 * 
 * FAQ and page-specific help content for the pixelated help bot
 */

import { PAGE_INFO } from './page-info';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'navigation' | 'design-system' | 'technical';
}

export interface PageHelp {
  path: string;
  title: string;
  description: string;
  instructions: string[];
  tips: string[];
  shortcuts?: string[];
}

export const FAQ_DATA: FAQItem[] = [
  // General
  {
    id: 'what-is-this',
    question: 'What is this website?',
    answer: 'This is an interactive portfolio showcasing my work across design and development. Explore different sections to learn about my process, projects, and approach to creative problem-solving.',
    category: 'general',
  },
  {
    id: 'how-to-navigate',
    question: 'How do I navigate?',
    answer: 'Click the 3x3 grid menu button (top-left) or press "M" to open the navigation menu. You can also use number keys (1-8) when the menu is open to quickly jump between sections.',
    category: 'navigation',
  },
  {
    id: 'keyboard-shortcuts',
    question: 'Are there keyboard shortcuts?',
    answer: 'Yes! Press "M" to toggle the menu, "Escape" to close overlays, and number keys (1-8) when the menu is open to navigate. Check each page\'s help for section-specific shortcuts.',
    category: 'navigation',
  },
  {
    id: 'what-are-design-eras',
    question: 'What are design eras?',
    answer: 'Design eras are different visual themes representing various periods in design history. Use the Time Machine to switch between eras like 1970s Terminal, 1995 GeoCities, or 2025 Spatial Wireframe!',
    category: 'design-system',
  },
  {
    id: 'how-to-change-era',
    question: 'How do I change the design era?',
    answer: 'Use the Time Machine control on the left side of your screen. Click on different years to experience how the same content looks across different design paradigms and aesthetic movements.',
    category: 'design-system',
  },
  {
    id: 'what-is-time-machine',
    question: 'What is the Time Machine?',
    answer: 'The Time Machine lets you travel through design history! Each era has unique colors, typography, layouts, and interactions. It\'s a way to explore how design trends have evolved over decades.',
    category: 'design-system',
  },
  {
    id: 'design-tokens',
    question: 'What are design tokens?',
    answer: 'Design tokens are the building blocks of each era - colors, spacing, typography, and patterns. When you switch eras, these tokens change to create completely different visual experiences.',
    category: 'design-system',
  },
  {
    id: 'portfolio-sections',
    question: 'What sections are available?',
    answer: 'Explore About (my journey), Work (projects & experiments), Case Studies (detailed process), Progress (learning timeline), Contact (get in touch), and more. Each section offers unique insights into my approach.',
    category: 'navigation',
  },
  {
    id: 'responsive-design',
    question: 'Does it work on mobile?',
    answer: 'Yes! The portfolio is fully responsive and adapts to different screen sizes. The design eras maintain their unique character across devices while ensuring usability.',
    category: 'technical',
  },
  {
    id: 'how-to-contact',
    question: 'How can I contact you?',
    answer: 'Visit the Contact page to send a message! You can reach out for collaborations, questions, or just to chat about design and development.',
    category: 'general',
  },
];

export const PAGE_HELP_DATA: PageHelp[] = [
  {
    path: '/',
    title: 'Home - Welcome',
    description: 'Welcome to my interactive portfolio! This is your starting point to explore my work, process, and creative approach.',
    instructions: [
      'Click the 3x3 grid menu button to see all available sections',
      'Explore interactive elements and mini-games in the grid',
      'Use the Time Machine (left side) to switch between design eras',
      'Try different eras to see how the design transforms',
    ],
    tips: [
      'Each design era offers a unique visual experience',
      'Interactive elements respond to the current era\'s aesthetic',
      'The grid-based layout is a nod to systematic design',
    ],
    shortcuts: ['M - Open menu', '1 - Jump to home'],
  },
  {
    path: '/about',
    title: 'About - My Journey',
    description: 'Learn about my background, skills, and what drives my creative process. A visual timeline showcasing growth and evolution.',
    instructions: [
      'Scroll down to explore the timeline chronologically',
      'Read through different chapters of my journey',
      'Notice how the design adapts in different eras',
      'Interactive timeline elements reveal additional details',
    ],
    tips: [
      'Try switching eras to see the timeline in different styles',
      'Each design era interprets the same content differently',
      'Some sections have hover interactions for more details',
    ],
    shortcuts: ['2 - Jump to about'],
  },
  {
    path: '/work',
    title: 'Work - Projects & Experiments',
    description: 'Browse through my portfolio of projects, experiments, and creative explorations. Each project showcases different skills and approaches.',
    instructions: [
      'Browse the project gallery to see my work',
      'Click on any project card to view detailed information',
      'Notice how project cards adapt to the current design era',
      'Explore different categories and types of work',
    ],
    tips: [
      'Each project card includes technology stack and outcomes',
      'Some projects have live demos or interactive elements',
      'Try different design eras to see varied presentation styles',
    ],
    shortcuts: ['3 - Jump to work'],
  },
  {
    path: '/work',
    title: 'Work - Selected projects',
    description: 'In-depth explorations of selected projects showing the full process from problem to solution, including challenges and learnings.',
    instructions: [
      'Select a case study from the available options',
      'Read through the complete process narrative',
      'Explore problem statements, solutions, and outcomes',
      'Notice the detailed process documentation',
    ],
    tips: [
      'Each case study follows a structured storytelling approach',
      'Look for process insights and design decisions',
      'The chatbot can provide additional context and guidance',
    ],
    shortcuts: ['4 - Jump to case studies'],
  },
  {
    path: '/progress',
    title: 'Progress - Learning Journey',
    description: 'A visual representation of my ongoing learning, skill development, and professional growth over time.',
    instructions: [
      'View current goals and milestones',
      'Explore the skill development timeline',
      'See how capabilities have evolved',
      'Notice the progression and growth areas',
    ],
    tips: [
      'This section demonstrates continuous learning',
      'Different eras show the timeline in unique visual styles',
      'Look for patterns in skill acquisition and growth',
    ],
    shortcuts: ['5 - Jump to progress'],
  },
  {
    path: '/contact',
    title: 'Contact - Get in Touch',
    description: 'Reach out for collaborations, questions, or just to connect. I\'m always open to interesting conversations and opportunities.',
    instructions: [
      'Fill out the contact form with your message',
      'Include relevant details about your inquiry',
      'Submit to send your message directly',
    ],
    tips: [
      'Be specific about collaboration opportunities',
      'Questions about projects or process are welcome',
      'Response time is typically within 24-48 hours',
    ],
    shortcuts: ['7 - Jump to contact'],
  },
];

export const getPageHelp = (pathname: string): PageHelp | null => {
  // Exact match first
  const exactMatch = PAGE_HELP_DATA.find(help => help.path === pathname);
  if (exactMatch) return exactMatch;
  
  // Check for dynamic routes
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 1) {
    const basePath = '/' + segments[0];
    const baseMatch = PAGE_HELP_DATA.find(help => help.path === basePath);
    if (baseMatch) {
      return {
        ...baseMatch,
        description: `Viewing details for ${segments.slice(1).join(' / ')}. ${baseMatch.description}`,
      };
    }
  }
  
  // Fallback to page info
  const pageInfo = PAGE_INFO[pathname] || Object.values(PAGE_INFO).find(info => 
    pathname.startsWith(info.path)
  );
  
  if (pageInfo) {
    return {
      path: pathname,
      title: pageInfo.title,
      description: pageInfo.description,
      instructions: [pageInfo.hint || 'Explore and interact with the page'],
      tips: ['Check the menu for navigation options'],
    };
  }
  
  return null;
};

export const getFAQByCategory = (category: FAQItem['category']): FAQItem[] => {
  return FAQ_DATA.filter(faq => faq.category === category);
};

export const searchFAQ = (query: string): FAQItem[] => {
  const lowerQuery = query.toLowerCase();
  return FAQ_DATA.filter(faq => 
    faq.question.toLowerCase().includes(lowerQuery) ||
    faq.answer.toLowerCase().includes(lowerQuery)
  );
};
