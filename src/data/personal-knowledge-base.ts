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
    content: `Arun Kumaar Srinivasan (KIRUK) is Founding Design Engineer and Design Lead at Spera.bot (from Feb 2026) — building the platform to design, backtest, and paper trade crypto strategies without a developer. He previously spent three years as UX Design Engineer on HP's Innovation for India team. He builds design tools, experimental websites, and whatever feels right — always leveraging UX craft to make complex products feel human. Portfolio: kiruk.in · Behance: behance.net/arunkusriniva · GitHub: github.com/arunkumaarsrinivasan`,
    tags: ['identity', 'ax-designer', 'ai', 'ux', 'engineering'],
    priority: 10
  },

  // Current Role & Responsibilities
  {
    id: 'current-role-spera',
    category: 'work',
    title: 'Founding Design Engineer · Design Lead at Spera',
    content: `Founding design engineer and design lead at Spera (spera.bot) from February 2026. Leading all design, frontend, interaction, and product experience for a platform where traders build, backtest, and paper trade crypto strategies without a developer. Key surfaces: Visual Logic Deck, reproducible backtests, AI-assisted drafting, run manifests. Website: https://www.spera.bot`,
    tags: ['spera', 'founding-design-engineer', 'design-lead', 'frontend', 'crypto', 'fintech', 'ai'],
    priority: 10
  },
  {
    id: 'previous-role-hp',
    category: 'work',
    title: 'UX Design Engineer at HP Inc — Innovation for India',
    content: `UX Design Engineer on HP's Innovation for India team (February 2023 - February 2026). Main design engineer for the team. Key work: HP Print AI, Mudra AI Stack, Get my Prints, Print Learn Center, HP Onboarding App. Case study visuals under NDA. Public links: HP Print AI — https://www.hp.com/us-en/printers/ai-printers.html · Print Learn Center — https://www.printlearncenter.com/`,
    tags: ['hp-inc', 'ux-design-engineer', 'hp-print-ai', 'design-systems', 'innovation-for-india', 'nda'],
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
    id: 'sns-square-square-bridge',
    category: 'work',
    title: 'Subject Matter Expert — Square Bridge at SNS Square',
    content: `Subject Matter Expert for Square Bridge at SNS Square (Feb–Jul 2023). Defined UX strategy for Placement Officers, led three designers across Student, Recruiter, and PO personas. Portfolio Builder boosted engagement 45%; recruiter dashboards cut discovery time 40%; 98% design-to-code accuracy on Node.js/MongoDB.`,
    tags: ['sns-square', 'square-bridge', 'ux-strategy', 'design-lead', 'recruitment'],
    priority: 8
  },
  {
    id: 'peoplegamez-intern',
    category: 'work',
    title: 'Interaction Design Intern at PeopleGamez.com',
    content: `Interaction Design Intern at PeopleGamez.com (Nov 2022 – Jan 2023). Designed gamified HR experiences, 100+ game assets, performance dashboards, and interaction documentation. Worked on products like 4Plantz and Motivuz.`,
    tags: ['peoplegamez', 'interaction-design', 'gamification', 'hr-tech'],
    priority: 7
  },

  // Project Examples
  {
    id: 'project-spera-platform',
    category: 'projects',
    title: 'Spera — Build & backtest crypto strategies',
    content: `Founding design engineer at Spera (https://www.spera.bot) — platform to design, backtest, and paper trade crypto strategies without hiring a developer. Visual Logic Deck, reproducible backtests with pinned data, AI inline drafts, walk-forward validation, run manifests. Leading design and frontend.`,
    tags: ['spera', 'crypto', 'fintech', 'ai', 'backtesting', 'founding-design-engineer'],
    priority: 9
  },
  {
    id: 'project-prags-website',
    category: 'projects',
    title: 'PRAGS — Interactive Musician Website',
    content: `Built https://www.prahatheesvar.in/ — scroll-to-play website for pianist Prahatheesvar (Prags). Howler.js audio, Three.js visuals, GSAP animation. Every visit feels like a mini live session.`,
    tags: ['experimental', 'web-audio', 'threejs', 'gsap', 'freelance'],
    priority: 7
  },
  {
    id: 'project-hp-print-ai',
    category: 'projects',
    title: 'HP Print AI',
    content: `Key contributor to HP Print AI — designing the industry's first intelligent print experience by translating complex AI logic into human-centered workflows. Part of HP Innovation for India team. Public site: https://www.hp.com/us-en/printers/ai-printers.html`,
    tags: ['hp', 'print-ai', 'ai-ux', 'innovation'],
    priority: 8
  },
  {
    id: 'project-hp-print-learn-center',
    category: 'projects',
    title: 'HP Print Learn Center (PLC)',
    content: `Worked on HP Print Learn Center (PLC) — integrated and optimized the WhatsApp API experience for parents accessing learning worksheets. Public site: https://www.printlearncenter.com/`,
    tags: ['hp', 'plc', 'edtech', 'whatsapp'],
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
