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
  category: 'general' | 'navigation' | 'games' | 'achievements' | 'technical';
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
    answer: 'This is an interactive portfolio with a gamified experience! Each page is a "game" with levels to complete. Explore, earn XP, and unlock achievements as you navigate through my work.',
    category: 'general',
  },
  {
    id: 'how-to-navigate',
    question: 'How do I navigate?',
    answer: 'Click the 3x3 grid menu button (top-left) or press "M" to open the game menu. You can also use number keys (1-8) when the menu is open to quickly jump to pages.',
    category: 'navigation',
  },
  {
    id: 'what-is-xp',
    question: 'What is XP?',
    answer: 'XP (Experience Points) are earned by completing levels on each page. Complete objectives like scrolling, interacting with content, or playing mini-games to earn XP and progress!',
    category: 'games',
  },
  {
    id: 'how-to-unlock',
    question: 'How do I unlock new pages?',
    answer: 'In Normal mode, complete 50% of levels in the current page to unlock the next one. In Devil mode, you need to complete ALL levels. In God mode, everything is unlocked!',
    category: 'games',
  },
  {
    id: 'what-are-achievements',
    question: 'What are achievements?',
    answer: 'Achievements are special milestones you unlock by exploring and interacting with the site. Complete games, reach XP milestones, or discover hidden features to earn them!',
    category: 'achievements',
  },
  {
    id: 'keyboard-shortcuts',
    question: 'Are there keyboard shortcuts?',
    answer: 'Yes! Press "M" to toggle the menu, "Escape" to close overlays, and number keys (1-8) when the menu is open to navigate. Check each page\'s help for specific shortcuts.',
    category: 'navigation',
  },
  {
    id: 'change-theme',
    question: 'Can I change the theme?',
    answer: 'Yes! Use the Time Machine on the left side to switch between design eras. Each era has a unique visual style - from 1970s terminal to modern wireframe!',
    category: 'technical',
  },
  {
    id: 'reset-progress',
    question: 'Can I reset my progress?',
    answer: 'Progress is saved in your browser. To reset, you can clear your browser\'s localStorage or use the reset option in the game menu (if available).',
    category: 'technical',
  },
  {
    id: 'what-is-game-mode',
    question: 'What are the different game modes?',
    answer: 'Normal Mode: Story progression - unlock pages sequentially. Devil Mode: Hard mode - complete everything to unlock next. God Mode: Everything unlocked for free exploration.',
    category: 'games',
  },
  {
    id: 'how-to-contact',
    question: 'How can I contact you?',
    answer: 'Visit the Contact page to send a message! Completing the contact form also earns you 100 XP - the highest reward in the game!',
    category: 'general',
  },
];

export const PAGE_HELP_DATA: PageHelp[] = [
  {
    path: '/',
    title: 'Home - Detective HQ',
    description: 'Your investigation begins here. This is the command center where you can play mini-games and explore interactive elements.',
    instructions: [
      'Click the 3x3 grid menu button to see all available pages',
      'Play mini-games in the grid to earn XP',
      'Use the Time Machine (left side) to switch design eras',
      'Complete all mini-games to unlock the next page',
    ],
    tips: [
      'Each mini-game has different objectives - try them all!',
      'Reach 100 points in any game for a bonus achievement',
      'The XP bar shows your overall progress',
    ],
    shortcuts: ['M - Open menu', '1 - Jump to home'],
  },
  {
    path: '/about',
    title: 'About - Case File: Origin',
    description: 'Learn about my journey, skills, and what drives my creative process. This is a runner-style game where you progress by scrolling.',
    instructions: [
      'Scroll down to read through the timeline',
      'Each section you reach earns XP',
      'Complete reading the entire page to unlock the next case',
      'Interact with timeline elements for bonus XP',
    ],
    tips: [
      'Take your time to read - there\'s no rush!',
      'Some sections have interactive elements',
      'Completing this page unlocks the Work page',
    ],
    shortcuts: ['2 - Jump to about'],
  },
  {
    path: '/work',
    title: 'Work - Experience Arena',
    description: 'Browse through my projects and experiments. Click on project cards to examine them in detail.',
    instructions: [
      'Browse the project gallery',
      'Click on any project card to view details',
      'Examine at least 3 projects to earn bonus XP',
      'Scroll through the gallery to discover more',
    ],
    tips: [
      'Each project has unique details - explore them!',
      'Some projects have interactive demos',
      'Completing this unlocks the Case Studies page',
    ],
    shortcuts: ['3 - Jump to work'],
  },
  {
    path: '/case-studies',
    title: 'Case Studies - Deep Investigation',
    description: 'Detailed case studies with process, outcomes, and insights. This is a puzzle-style game where you piece together the story.',
    instructions: [
      'Select a case study from the list',
      'Read through the complete case study',
      'Interact with the chatbot for guided exploration',
      'Complete 2 case studies for a master achievement',
    ],
    tips: [
      'Use the chatbot to get hints and guidance',
      'Each case study has interactive elements',
      'Scroll to the bottom to complete the investigation',
    ],
    shortcuts: ['4 - Jump to case studies'],
  },
  {
    path: '/progress',
    title: 'Progress - Detective Skills',
    description: 'Track your learning journey, goals, and skill development. This is a builder-style game where you construct your understanding.',
    instructions: [
      'View your current goals and milestones',
      'Explore the learning timeline',
      'Track your skill development over time',
      'Scroll through to see the full journey',
    ],
    tips: [
      'This page shows your growth and progress',
      'Check back regularly to see updates',
      'Completing this unlocks the Arcade page',
    ],
    shortcuts: ['5 - Jump to progress'],
  },
  {
    path: '/arcade',
    title: 'Arcade - Training Ground',
    description: 'Sharpen your detective skills with training exercises. Play mini-games and complete objectives.',
    instructions: [
      'Select a mini-game to play',
      'Reach 50 points to complete a game',
      'Try different games to earn more XP',
      'Complete all games for the master achievement',
    ],
    tips: [
      'Each game has different controls - read the instructions',
      'Practice makes perfect!',
      'Completing games unlocks the Contact page',
    ],
    shortcuts: ['6 - Jump to arcade'],
  },
  {
    path: '/contact',
    title: 'Contact - Final Transmission',
    description: 'Get in touch! Send a message to complete your investigation. This is the final page with the highest XP reward.',
    instructions: [
      'Fill out the contact form',
      'Send a message to earn 100 XP',
      'This is the final objective - congratulations!',
    ],
    tips: [
      'Sending a message completes the full investigation',
      'You\'ll earn the highest XP reward here',
      'Feel free to reach out with questions or collaborations',
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
