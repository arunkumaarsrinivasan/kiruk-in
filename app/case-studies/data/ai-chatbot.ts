import { CaseStudy } from '../types';

export const aiChatbot: CaseStudy = {
  id: 'ai-chatbot',
  title: 'AI Chatbot Interface',
  coverColor: 'bg-blue-100',  summary: 'An intelligent conversational AI assistant with natural language processing and contextual understanding.',
  sketchImg: '/images/chatbot/sketch-chatbot.svg',
  finalImg: '/images/chatbot/final-chatbot.svg',
  
  steps: [
    { label: 'Research', desc: 'User needs analysis and conversation flow mapping.' },
    { label: 'Architecture', desc: 'AI model selection and system design.' },
    { label: 'Design', desc: 'Conversational UI patterns and visual design.' },
    { label: 'Develop', desc: 'Frontend and backend implementation.' },
    { label: 'Test', desc: 'User testing and AI model optimization.' },
  ],
  
  branding: {
    colors: ['#4A90E2', '#50E3C2', '#F8F8F8', '#333333', '#E8F4FD'],
    typography: {
      primary: 'Inter',
      secondary: 'SF Mono',
    },
    description: 'The chatbot branding emphasizes trustworthiness and intelligence through clean typography and a professional blue color scheme. The design is approachable yet sophisticated.'
  },
  
  colorTheory: {
    palette: ['#4A90E2', '#50E3C2', '#F8F8F8', '#333333', '#E8F4FD'],
    description: 'Blue tones convey trust and reliability, essential for AI interactions. The accent teal adds energy while maintaining professional credibility.',
    psychology: 'Blue creates a sense of security and competence, crucial for users trusting an AI system with their queries and data.'
  },
  
  ideation: {
    description: 'The chatbot concept focused on creating natural, human-like conversations while clearly indicating AI capabilities and limitations. The goal was to make AI assistance feel helpful rather than intimidating.',
    images: [
      '/images/chatbot/ideation-personas.png',
      '/images/chatbot/ideation-flows.png'
    ],
    keyInsights: [
      'Users prefer gradual AI capability disclosure',
      'Context retention is crucial for natural conversation',
      'Clear error handling builds trust'
    ]
  },
  
  sketching: {
    description: 'Early sketches explored various conversation layouts, message bubble designs, and methods for displaying complex information within chat interfaces.',
    images: [
      '/images/chatbot/sketch-conversation.png',
      '/images/chatbot/sketch-components.png'
    ],
    iterations: 8
  },
  
  wireframes: {
    description: 'Wireframes established the chat interface structure, including message threading, typing indicators, and integration points for rich media responses.',
    images: [
      '/images/chatbot/wireframe-chat.png',
      '/images/chatbot/wireframe-mobile.png'
    ],
    userFlow: 'Welcome → Query Input → AI Processing → Response → Follow-up'
  },
  
  finalScreens: {
    description: 'The final interface features smooth animations, contextual suggestions, and adaptive responses that create an engaging conversational experience.',
    images: [
      '/images/chatbot/final-interface.png',
      '/images/chatbot/final-conversation.png',
      '/images/chatbot/final-mobile.png'
    ],
    features: [
      'Natural language processing',
      'Context-aware responses',
      'Rich media support',
      'Conversation history'
    ]
  },
  
  figmaEmbed: {
    title: 'Chatbot Interface Prototype',
    embedUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2Fchatbot-example',
    description: 'Interactive prototype showcasing conversation flows, UI states, and micro-interactions.'
  },
  
  productDescription: 'This AI chatbot interface provides intelligent assistance through natural language processing. It features contextual understanding, multi-turn conversations, and seamless integration with existing systems.',
  
  technologies: ['React', 'Node.js', 'OpenAI API', 'WebSocket', 'MongoDB', 'Docker'],
  
  links: [
    {
      title: 'Live Demo',
      url: '#',
      icon: '🤖'
    },
    {
      title: 'API Documentation',
      url: '#',
      icon: '📚'
    },
    {
      title: 'Case Study',
      url: '#',
      icon: '📝'
    }
  ],
  
  results: [
    {
      metric: 'Response Accuracy',
      value: '94%',
      description: 'Successful query resolution rate'
    },
    {
      metric: 'User Satisfaction',
      value: '4.7/5',
      description: 'Average user rating'
    },
    {
      metric: 'Response Time',
      value: '< 500ms',
      description: 'Average API response time'
    }
  ]
};
