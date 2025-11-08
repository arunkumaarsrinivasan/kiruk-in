// Personal Knowledge Base for RAG System
// This contains comprehensive information about Arun Kumaar Srinivasan

export interface KnowledgeItem {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  priority: number; // 1-10, higher is more important
}

export const personalKnowledgeBase: KnowledgeItem[] = [
  // Core Professional Identity
  {
    id: 'core-identity',
    category: 'identity',
    title: 'Professional Identity',
    content: `Arun Kumaar Srinivasan is a versatile AX (AI Experience) Designer and Software Development Engineer 1 at HP Inc. He specializes in bridging artificial intelligence with human-centered design principles. With expertise spanning cloud engineering, microservices, UX/UI design, and full-stack development, Arun brings a unique perspective that combines technical depth with design thinking. He's passionate about creating seamless experiences that make complex AI systems accessible and intuitive for users.`,
    tags: ['identity', 'ax-designer', 'ai', 'ux', 'engineering'],
    priority: 10
  },

  // Current Role & Responsibilities
  {
    id: 'current-role-hp',
    category: 'work',
    title: 'Software Development Engineer 1 at HP Inc',
    content: `Currently working as SDE 1 at HP Inc (February 2023 - Present) in the WPP Connectivity team. Specializes in cloud microservices engineering using cutting-edge technologies including AWS services (SQS, SNS, DynamoDB), Spring Boot, Splunk for monitoring, and Prometheus for metrics. Responsible for improving microservice reliability, implementing robust cloud architectures, and ensuring high-performance distributed systems. Works extensively with Java, Spring Boot framework, and AWS ecosystem to deliver scalable solutions.`,
    tags: ['hp-inc', 'sde', 'aws', 'spring-boot', 'microservices', 'cloud'],
    priority: 9
  },

  // Technical Skills - AWS & Cloud
  {
    id: 'aws-cloud-expertise',
    category: 'skills',
    title: 'AWS Cloud Services & DevOps Expertise',
    content: `Expert-level proficiency in AWS Cloud Services including SQS (Simple Queue Service) for message queuing, SNS (Simple Notification Service) for pub/sub messaging, DynamoDB for NoSQL database solutions, and various other AWS services. Strong experience in DevOps practices, CI/CD pipelines, infrastructure as code, and cloud architecture design. Understands microservices patterns, distributed systems challenges, and cloud-native development approaches.`,
    tags: ['aws', 'cloud', 'devops', 'sqs', 'sns', 'dynamodb', 'infrastructure'],
    priority: 9
  },

  // Technical Skills - Spring Boot & Java
  {
    id: 'spring-boot-java',
    category: 'skills',
    title: 'Spring Boot & Java Development',
    content: `Deep expertise in Spring Boot framework for building production-ready microservices. Proficient in Java ecosystem, dependency injection, Spring Security, Spring Data, and RESTful API development. Experience with building scalable backend systems, implementing design patterns, and following best practices for enterprise-grade applications. Familiar with testing frameworks, performance optimization, and maintaining high code quality standards.`,
    tags: ['spring-boot', 'java', 'microservices', 'rest-api', 'backend'],
    priority: 8
  },

  // Design Skills
  {
    id: 'design-expertise',
    category: 'skills',
    title: 'UX/UI Design & End-to-End Design Leadership',
    content: `Comprehensive design expertise covering the entire design process from research to implementation. Skilled in UX research methodologies, user journey mapping, wireframing, prototyping, visual design, and branding. Experience with design tools like Figma, Adobe Creative Suite, and prototyping tools. Led end-to-end design initiatives at SNS Square, managing branding projects, conducting user research, and ensuring smooth developer handoff processes. Understands design systems, accessibility principles, and user-centered design approaches.`,
    tags: ['ux-design', 'ui-design', 'branding', 'prototyping', 'figma', 'research'],
    priority: 9
  },

  // Monitoring & Analytics
  {
    id: 'monitoring-analytics',
    category: 'skills',
    title: 'Monitoring & Analytics - Splunk & Prometheus',
    content: `Advanced experience with monitoring and observability tools. Proficient in Splunk for log analysis, incident detection, and system monitoring. Skilled in Prometheus for metrics collection, alerting, and performance monitoring. Understands how to implement comprehensive monitoring strategies for microservices, create meaningful dashboards, set up alerting systems, and use data-driven approaches for system optimization and troubleshooting.`,
    tags: ['splunk', 'prometheus', 'monitoring', 'analytics', 'observability'],
    priority: 7
  },

  // Education
  {
    id: 'education',
    category: 'background',
    title: 'Educational Background',
    content: `Bachelor of Engineering in Computer Science & Engineering with an impressive 8.9 CGPA. Strong foundation in computer science fundamentals including algorithms, data structures, software engineering principles, database systems, and computer networks. Academic excellence demonstrates strong analytical thinking, problem-solving abilities, and dedication to continuous learning.`,
    tags: ['education', 'computer-science', 'engineering', 'academic-excellence'],
    priority: 6
  },

  // Freelance Experience
  {
    id: 'freelance-sns-square',
    category: 'work',
    title: 'Freelance Design Lead at SNS Square',
    content: `Worked as a Freelance Design Lead at SNS Square, managing comprehensive design initiatives encompassing branding, UX research, UI design, and creative direction. Led end-to-end design processes from conceptualization to implementation. Responsible for brand identity development, user experience strategy, interface design, and ensuring consistent design language across multiple platforms. Collaborated with cross-functional teams and managed client relationships while delivering high-quality design solutions.`,
    tags: ['freelance', 'design-lead', 'branding', 'ux-research', 'ui-design'],
    priority: 8
  },

  // Project Examples
  {
    id: 'project-crypto-dashboard',
    category: 'projects',
    title: 'Cryptocurrency Bot Dashboard - Spera',
    content: `Led complete branding and website design for Spera cryptocurrency platform. Managed end-to-end design process including brand identity creation, user-friendly dashboard design for cryptocurrency trading bots, and user management interface. Focused on creating intuitive data visualization, streamlined user flows, and professional visual design that makes complex financial data accessible to users. Project involved understanding fintech requirements, compliance considerations, and creating trustworthy digital experiences.`,
    tags: ['cryptocurrency', 'dashboard', 'branding', 'fintech', 'data-visualization'],
    priority: 7
  },

  {
    id: 'project-hr-game-design',
    category: 'projects',
    title: 'HR Engagement Game Design - PeopleGamez.com',
    content: `Designed engaging game experiences specifically for HR stakeholders at PeopleGamez.com. Created comprehensive user flows, interaction designs, and gamification strategies to improve employee engagement and HR processes. Focused on making HR activities more interactive and enjoyable while maintaining professional standards. Involved understanding HR workflows, employee psychology, and creating game mechanics that enhance workplace culture and productivity.`,
    tags: ['hr-tech', 'game-design', 'user-flows', 'gamification', 'employee-engagement'],
    priority: 7
  },

  {
    id: 'project-ngo-cms',
    category: 'projects',
    title: 'NGO Website & CMS Platform - Life Savers NGO',
    content: `Developed comprehensive website and content management system for Life Savers NGO. Integrated payment functionality for streamlined donation processes, created intuitive content management interfaces, and designed user-friendly donation flows. Focused on building trust through design, optimizing conversion rates for donations, and providing easy-to-use tools for NGO staff to manage content and track donations. Project demonstrated ability to work with non-profit organizations and create meaningful social impact through design and technology.`,
    tags: ['ngo', 'cms', 'payment-integration', 'social-impact', 'donations'],
    priority: 7
  },

  // Teaching & Knowledge Sharing
  {
    id: 'teaching-workshops',
    category: 'teaching',
    title: 'UI/UX Design Workshops & Guest Lectures',
    content: `Delivered comprehensive UI/UX design workshops and guest lectures to 60+ students, sharing practical design knowledge and real-world insights. Focused on bridging the gap between academic learning and industry practices. Covered topics including design thinking, user research methods, prototyping techniques, design tools, and portfolio development. Passionate about mentoring the next generation of designers and contributing to design education. Received positive feedback for making complex design concepts accessible and actionable.`,
    tags: ['teaching', 'workshops', 'ui-ux', 'mentoring', 'education'],
    priority: 6
  },

  // Personal Interests & Culture
  {
    id: 'personal-interests',
    category: 'personal',
    title: 'Personal Interests & Work Culture',
    content: `Passionate about collaboration and believes in the power of teamwork. Prefers trekking over parties, showing a love for nature and adventure. Table tennis enthusiast, demonstrating competitive spirit and quick reflexes. Music lover with diverse playlists. Values work-life balance and maintains a positive, happy-to-connect attitude. Describes himself as a perfectionist and versatile generalist, always eager to learn new technologies and approaches. Based in Bangalore and open to hybrid work arrangements.`,
    tags: ['collaboration', 'trekking', 'table-tennis', 'music', 'perfectionist'],
    priority: 5
  },

  // Contact & Location
  {
    id: 'contact-location',
    category: 'contact',
    title: 'Contact Information & Location',
    content: `Based in Bangalore, India, with hybrid work flexibility. Always happy to connect and collaborate on interesting projects. Available for both full-time opportunities and freelance design projects. Open to discussions about AI/UX design, cloud engineering, design education, or potential collaborations. Professional email: arunkumaar.srinivasan@gmail.com. Prefers meaningful conversations about technology, design, and innovation.`,
    tags: ['bangalore', 'contact', 'collaboration', 'hybrid-work'],
    priority: 6
  },

  // Unique Value Proposition
  {
    id: 'unique-value',
    category: 'value',
    title: 'What Makes Arun Unique',
    content: `Arun's unique strength lies in his rare combination of deep technical expertise and strong design sensibilities. As an AX Designer, he understands how to make AI systems more human-centered and accessible. His experience spans from low-level cloud infrastructure and microservices to high-level user experience design and branding. This dual expertise allows him to bridge the gap between complex technical systems and intuitive user experiences. He can speak both engineering and design languages fluently, making him invaluable for teams building AI-powered products that need to be both technically robust and user-friendly.`,
    tags: ['ax-design', 'technical-design-bridge', 'ai-ux', 'unique-value'],
    priority: 10
  },

  // Future Vision
  {
    id: 'future-vision',
    category: 'vision',
    title: 'Future Vision & Goals',
    content: `Arun envisions a future where AI systems are seamlessly integrated into everyday experiences, making technology more intuitive and accessible. He's passionate about advancing the field of AI Experience Design, where artificial intelligence enhances human capabilities rather than replacing them. His goal is to continue building products that demonstrate how thoughtful design can make complex AI systems feel natural and empowering to users. He's interested in exploring emerging technologies, contributing to open-source projects, and mentoring others in the intersection of AI and design.`,
    tags: ['future-vision', 'ai-integration', 'technology-advancement', 'mentoring'],
    priority: 5
  }
];

// Helper functions for RAG system
export function searchKnowledge(query: string, limit: number = 5): KnowledgeItem[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(' ').filter(word => word.length > 2);
  
  return personalKnowledgeBase
    .map(item => {
      let score = 0;
      
      // Check title matches
      if (item.title.toLowerCase().includes(queryLower)) score += 10;
      
      // Check content matches
      queryWords.forEach(word => {
        if (item.content.toLowerCase().includes(word)) score += 2;
        if (item.tags.some(tag => tag.includes(word))) score += 3;
      });
      
      // Boost by priority
      score += item.priority;
      
      return { ...item, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getKnowledgeByCategory(category: string): KnowledgeItem[] {
  return personalKnowledgeBase.filter(item => item.category === category);
}

export function getKnowledgeByTags(tags: string[]): KnowledgeItem[] {
  return personalKnowledgeBase.filter(item => 
    tags.some(tag => item.tags.includes(tag))
  );
}
