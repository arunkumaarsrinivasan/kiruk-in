import { CaseStudy } from '../types';
import { portfolioWebsite } from './portfolio-website';
import { aiChatbot } from './ai-chatbot';
import { mobileApp } from './mobile-app';

// Export all case studies as an array
export const CASE_STUDIES: CaseStudy[] = [
  portfolioWebsite,
  aiChatbot,
  mobileApp,
];

export default CASE_STUDIES;
