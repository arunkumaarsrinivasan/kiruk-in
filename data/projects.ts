import { Project } from '../types';

export const projects: Project[] = [
  {
    id: 'ai-powered-dashboard',
    title: 'AI-Powered Analytics Dashboard',
    description: 'A comprehensive dashboard that uses machine learning to provide actionable insights for e-commerce businesses.',
    category: 'ai-integration',
    tags: ['AI', 'Dashboard Design', 'Data Visualization', 'UX Research'],
    thumbnail: '/projects/dashboard-thumb.jpg',
    images: [
      '/projects/dashboard-1.jpg',
      '/projects/dashboard-2.jpg',
      '/projects/dashboard-3.jpg'
    ],
    year: 2024,
    client: 'TechCorp Solutions',
    duration: '4 months',
    role: 'Lead UX Designer & AI Integration Specialist',
    tools: ['Figma', 'Python', 'TensorFlow', 'React', 'D3.js'],
    overview: 'Designed and developed an AI-powered analytics dashboard that helps e-commerce businesses understand customer behavior and optimize their sales strategies.',
    challenge: 'The main challenge was to make complex AI-generated insights accessible and actionable for non-technical users while maintaining the power of the underlying algorithms.',
    solution: 'I created an intuitive interface that progressively reveals complexity, starting with high-level insights and allowing users to drill down into detailed analytics. The design heavily relied on pen-and-paper sketching to explore different information hierarchies.',
    outcome: 'The dashboard increased user engagement by 150% and helped clients achieve an average 25% improvement in conversion rates.',
    featured: true,
    published: false
  },
  {
    id: 'voice-ui-assistant',
    title: 'Voice UI Assistant Design',
    description: 'Designing conversational interfaces for a smart home assistant with AI-driven personality adaptation.',
    category: 'ai-integration',
    tags: ['Voice UI', 'Conversational Design', 'AI Personality', 'Smart Home'],
    thumbnail: '/projects/voice-thumb.jpg',
    images: [
      '/projects/voice-1.jpg',
      '/projects/voice-2.jpg'
    ],
    year: 2024,
    client: 'HomeAI Inc.',
    duration: '6 months',
    role: 'Conversational UX Designer',
    tools: ['Voiceflow', 'Adobe XD', 'DialogFlow', 'Figma'],
    overview: 'Designed the personality and conversational flows for an AI assistant that adapts its communication style based on user preferences and context.',
    challenge: 'Creating a voice interface that feels natural and helpful without being intrusive, while handling the complexity of AI personality adaptation.',
    solution: 'Through extensive user research and voice prototyping, I developed a multi-layered personality system that adjusts tone, verbosity, and interaction patterns based on user behavior and preferences.',
    outcome: 'User satisfaction increased by 40% and daily active usage grew by 60% after implementing the new conversational design.',
    featured: true,
    published: false
  },
  {
    id: 'financial-app-redesign',
    title: 'FinTech App Redesign',
    description: 'Complete UX overhaul of a personal finance app with AI-powered insights and budgeting recommendations.',
    category: 'ux-design',
    tags: ['Mobile UX', 'FinTech', 'AI Insights', 'Personal Finance'],
    thumbnail: '/projects/fintech-thumb.jpg',
    images: [
      '/projects/fintech-1.jpg',
      '/projects/fintech-2.jpg',
      '/projects/fintech-3.jpg',
      '/projects/fintech-4.jpg'
    ],
    year: 2023,
    client: 'MoneyWise App',
    duration: '5 months',
    role: 'Senior UX Designer',
    tools: ['Figma', 'Principle', 'Miro', 'Python (for AI prototyping)'],
    overview: 'Led the complete redesign of a personal finance app, integrating AI-powered insights to help users make better financial decisions.',
    challenge: 'Users found the original app overwhelming and struggled to understand their financial health. The challenge was to simplify complex financial data while providing actionable AI-driven recommendations.',
    solution: 'I started with extensive user interviews and sketching sessions to understand pain points. The new design features a clean, card-based interface with progressive disclosure and AI-powered insights presented in simple, actionable formats.',
    outcome: 'App store rating improved from 2.8 to 4.6 stars, and user retention increased by 85% in the first quarter after launch.',
    featured: true,
    published: false
  }
];

export const getFeaturedProjects = () => projects.filter(project => project.featured);
export const getProjectsByCategory = (category: string) => projects.filter(project => project.category === category);
export const getProjectById = (id: string) => projects.find(project => project.id === id);
