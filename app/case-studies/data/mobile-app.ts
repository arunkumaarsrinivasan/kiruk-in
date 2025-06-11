import { CaseStudy } from '../types';

export const mobileApp: CaseStudy = {
  id: 'mobile-app',
  title: 'Habit Tracker App',
  coverColor: 'bg-green-100',  summary: 'A comprehensive habit tracking mobile application with data visualization and motivational features.',
  sketchImg: '/images/mobile-app/sketch-mobile.svg',
  finalImg: '/images/mobile-app/final-mobile.svg',
  
  steps: [
    { label: 'Research', desc: 'User interviews and behavioral psychology study.' },
    { label: 'Strategy', desc: 'Feature prioritization and user journey mapping.' },
    { label: 'Design', desc: 'UI/UX design and interaction patterns.' },
    { label: 'Prototype', desc: 'Interactive prototyping and user testing.' },
    { label: 'Launch', desc: 'App store deployment and user acquisition.' },
  ],
  
  branding: {
    colors: ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F5F5F5'],
    typography: {
      primary: 'SF Pro Display',
      secondary: 'SF Pro Text',
    },
    description: 'The app uses a nature-inspired color palette to evoke growth and positive change. The design language is friendly and encouraging, making habit building feel rewarding rather than burdensome.'
  },
  
  colorTheory: {
    palette: ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F5F5F5'],
    description: 'Green represents growth and success, while warm yellows and oranges provide energy and motivation. The palette is designed to create positive psychological associations with habit formation.',
    psychology: 'Green is psychologically linked to progress and health, while warm accent colors create feelings of achievement and motivation.'
  },
  
  ideation: {
    description: 'The app concept was born from research into habit formation psychology. The goal was to create a system that leverages behavioral science principles to make habit building more effective and engaging.',
    images: [
      '/images/mobile-app/ideation-research.png',
      '/images/mobile-app/ideation-concepts.png'
    ],
    keyInsights: [
      'Visual progress tracking increases motivation',
      'Social accountability improves consistency',
      'Micro-celebrations reinforce positive behavior'
    ]
  },
  
  sketching: {
    description: 'Initial sketches explored different metaphors for progress tracking, from plant growth to building structures. The focus was on creating intuitive input methods and meaningful visualizations.',
    images: [
      '/images/mobile-app/sketch-flows.png',
      '/images/mobile-app/sketch-screens.png'
    ],
    iterations: 15
  },
  
  wireframes: {
    description: 'Wireframes established the app architecture with emphasis on quick daily interactions and comprehensive progress tracking. The design prioritized one-handed operation for mobile convenience.',
    images: [
      '/images/mobile-app/wireframe-main.png',
      '/images/mobile-app/wireframe-tracking.png'
    ],
    userFlow: 'Onboarding → Habit Setup → Daily Tracking → Progress Review → Social Sharing'
  },
  
  finalScreens: {
    description: 'The final app features beautiful data visualizations, gamification elements, and social features that make habit tracking engaging and rewarding.',
    images: [
      '/images/mobile-app/final-dashboard.png',
      '/images/mobile-app/final-tracking.png',
      '/images/mobile-app/final-progress.png'
    ],
    features: [
      'Streak tracking',
      'Progress visualization',
      'Social challenges',
      'Achievement system'
    ]
  },
  
  figmaEmbed: {
    title: 'Mobile App Prototype',
    embedUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2Fmobile-app-example',
    description: 'Try the interactive prototype with full user flows from onboarding to advanced features.'
  },
  
  productDescription: 'This habit tracking app combines behavioral science with beautiful design to help users build lasting positive habits. Features include streak tracking, progress visualization, social challenges, and personalized insights.',
  
  technologies: ['React Native', 'Redux', 'Firebase', 'D3.js', 'Push Notifications', 'Analytics'],
  
  links: [
    {
      title: 'App Store',
      url: '#',
      icon: '📱'
    },
    {
      title: 'Google Play',
      url: '#',
      icon: '🤖'
    },
    {
      title: 'Product Hunt',
      url: '#',
      icon: '🚀'
    }
  ],
  
  results: [
    {
      metric: 'User Retention',
      value: '78%',
      description: '30-day user retention rate'
    },
    {
      metric: 'Habit Success Rate',
      value: '65%',
      description: 'Users completing 30-day streaks'
    },
    {
      metric: 'App Store Rating',
      value: '4.8/5',
      description: 'Average user rating'
    }
  ]
};
