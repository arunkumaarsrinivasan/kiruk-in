'use client';

import ScribbleAnimation from '@/components/three/scribble-animation';
import { SketchHeading, SketchCard } from '@/components/ui/sketch-elements';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ConstellationSkills } from "@/components/interactive/ConstellationSkills";

// Font utility classes
const magneticFont = 'font-[MagneticDrawing,MagneticDrawingFallback,sans-serif]';
const handwrittenFont = 'handwritten';
const dataFont = 'font-mono tracking-tight';

// Simple BarChart for skills/tools
const BarChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => (
  <div className="w-full flex flex-col gap-2 mt-2">
    {data.map((item, i) => (
      <div key={item.label} className="flex items-center gap-2">
        <span className={`text-xs ${handwrittenFont} w-20`}>{item.label}</span>
        <div className="flex-1 bg-gray-100 rounded-full h-3 relative">
          <motion.div
            className="h-3 rounded-full absolute left-0 top-0"
            style={{ background: item.color, width: `${item.value}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${item.value}%` }}
            transition={{ duration: 1.2, delay: 0.2 + i * 0.1 }}
          />
        </div>
        <span className={`text-xs ${handwrittenFont} ml-2`}>{item.value}%</span>
      </div>
    ))}
  </div>
);

// Simple DonutChart for impact
const DonutChart = ({ value, color }: { value: number; color: string }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width="48" height="48" className="inline-block align-middle">
      <circle
        cx="24" cy="24" r={radius}
        stroke="#e5e7eb" strokeWidth="8" fill="none"
      />
      <motion.circle
        cx="24" cy="24" r={radius}
        stroke={color}
        strokeWidth="8" fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2 }}
        strokeLinecap="round"
      />
      <text x="24" y="28" textAnchor="middle" className={`text-base fill-gray-700 ${handwrittenFont}`}>
        {value}%
      </text>
    </svg>
  );
};

// Work Experience Data with Projects and Stakeholder Impact
const workExperience = [
  {
    id: "hp-cloud-engineer",
    title: "SDE 1",
    company: "HP Inc",
    location: "Bangalore (Hybrid)",
    period: "Feb 2023 - Present",
    description: "Experienced Cloud Engineer at WPP Connectivity team, specializing in microservice reliability using Splunk, Spring Boot, and deployment support. Proficient in AWS services including SQS, SNS, DynamoDB, and Prometheus for scalable & resilient cloud infrastructure.",
    type: "full-time",
    skills: ["AWS", "Spring Boot", "Splunk", "Microservices", "DynamoDB", "Prometheus"],
    projects: [
      {
        name: "Microservice Reliability Platform",
        description: "Built monitoring and alerting system for critical microservices",
        impact: "Reduced system downtime by 45%",
        stakeholders: "Global development teams, 500+ engineers"
      }
    ],
    skillsGained: ["Advanced AWS Architecture", "Microservice Debugging", "Production Monitoring"],
    chartData: [
      { label: "AWS", value: 90, color: "#FF9900" },
      { label: "Spring Boot", value: 85, color: "#6DB33F" },
      { label: "Monitoring", value: 80, color: "#0066CC" }
    ]
  },
  {
    id: "sns-design-lead",
    title: "Freelance Design Lead",
    company: "SNS Square",
    location: "Coimbatore (Remote)",
    period: "Nov 2023 - Present",
    description: "Led end-to-end design initiatives encompassing branding, UX research, and UI design across various platforms catering to diverse user bases. Facilitated seamless developer handoff and comprehensive UX documentation for the entire infrastructure.",
    type: "freelance",
    skills: ["UX Research", "UI Design", "Branding", "Design Systems", "Developer Handoffs"],
    projects: [
      {
        name: "Complete Brand & Platform Redesign",
        description: "End-to-end design system and platform modernization",
        impact: "Increased user engagement by 60%",
        stakeholders: "Product team, 50K+ users"
      }
    ],
    skillsGained: ["Design Leadership", "Stakeholder Management", "Design Systems Architecture"],
    chartData: [
      { label: "UX Research", value: 95, color: "#8B5CF6" },
      { label: "UI Design", value: 90, color: "#EC4899" },
      { label: "Branding", value: 85, color: "#F59E0B" }
    ]
  },
  {
    id: "spera-designer",
    title: "Freelance Designer",
    company: "Spera",
    location: "Bangalore (Remote)",
    period: "Dec 2023 - Mar 2024",
    description: "Managed end-to-end branding and website design for a cryptocurrency bot, integrating a user-friendly dashboard for streamlined user management and analytics.",
    type: "freelance",
    skills: ["Branding", "Web Design", "Dashboard Design", "Cryptocurrency", "Analytics"],
    projects: [
      {
        name: "Crypto Bot Dashboard",
        description: "Complete branding and dashboard design for cryptocurrency trading bot",
        impact: "Simplified complex data visualization for 1000+ traders",
        stakeholders: "Trading community, Product owners"
      }
    ],
    skillsGained: ["FinTech UI/UX", "Data Visualization", "Complex System Design"],
    chartData: [
      { label: "Dashboard", value: 88, color: "#10B981" },
      { label: "Branding", value: 85, color: "#F59E0B" },
      { label: "Analytics", value: 80, color: "#3B82F6" }
    ]
  },
  {
    id: "life-savers-developer",
    title: "Freelance Creative Developer",
    company: "Life Savers NGO",
    location: "Bangalore (Remote)",
    period: "Jan 2024 - Mar 2024",
    description: "Collaborated with an NGO to comprehend their needs and developed a website with integrated payment functionality and a content management system (CMS). Implemented solutions to streamline donation processes and enable easy content updates, enhancing their online presence and impact.",
    type: "freelance",
    skills: ["Full Stack Development", "Payment Integration", "CMS", "NGO Solutions", "Web Development"],
    projects: [
      {
        name: "NGO Website & Donation Platform",
        description: "Full-stack website with payment gateway and CMS for content management",
        impact: "Increased online donations by 200%",
        stakeholders: "NGO staff, 500+ donors, beneficiaries"
      }
    ],
    skillsGained: ["Payment Gateway Integration", "NGO Sector Understanding", "Social Impact Design"],
    chartData: [
      { label: "Full Stack", value: 85, color: "#10B981" },
      { label: "Payments", value: 80, color: "#F59E0B" },
      { label: "CMS", value: 75, color: "#8B5CF6" }
    ]
  },
  {
    id: "peoplegamez-intern",
    title: "Interaction Design Intern",
    company: "PeopleGamez.com",
    location: "Bangalore (Remote)",
    period: "Nov 2022 - Jan 2023",
    description: "Crafted engaging game experiences for HR stakeholders by understanding their requirements and storyboards. Developed user flows, interaction designs, and fun assets to facilitate employee engagement and interaction within the game environment.",
    type: "internship",
    skills: ["Game Design", "Interaction Design", "User Flows", "HR Solutions", "Employee Engagement"],
    projects: [
      {
        name: "HR Gamification Platform",
        description: "Interactive games for employee engagement and training",
        impact: "Improved employee engagement scores by 35%",
        stakeholders: "HR teams, 2000+ employees across 10 companies"
      }
    ],
    skillsGained: ["Gamification Principles", "HR Tech Understanding", "Interactive Design"],
    chartData: [
      { label: "Game Design", value: 85, color: "#EC4899" },
      { label: "Interaction", value: 80, color: "#8B5CF6" },
      { label: "User Flows", value: 75, color: "#10B981" }
    ]
  }
];

// Professional Skills Radar Chart Component
const SkillsRadarChart = ({ skills, color }: { skills: any[], color: string }) => {
  const maxValue = 100;
  const centerX = 120;
  const centerY = 120;
  const radius = 80;
  
  // Calculate points for the radar chart
  const angleStep = (2 * Math.PI) / skills.length;
  const skillPoints = skills.map((skill, index) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const skillRadius = (skill.proficiency / maxValue) * radius;
    return {
      x: centerX + Math.cos(angle) * skillRadius,
      y: centerY + Math.sin(angle) * skillRadius,
      labelX: centerX + Math.cos(angle) * (radius + 25),
      labelY: centerY + Math.sin(angle) * (radius + 25),
      angle,
      skill
    };
  });
  
  // Create path for the skill polygon
  const pathData = skillPoints.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';
  
  // Create concentric circles for reference
  const circles = [20, 40, 60, 80].map(r => (
    <circle
      key={r}
      cx={centerX}
      cy={centerY}
      r={r}
      fill="none"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.3"
    />
  ));
  
  // Create axis lines
  const axisLines = skillPoints.map((point, index) => (
    <line
      key={index}
      x1={centerX}
      y1={centerY}
      x2={centerX + Math.cos(point.angle) * radius}
      y2={centerY + Math.sin(point.angle) * radius}
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity="0.3"
    />
  ));
  
  return (
    <div className="relative">
      <svg width="240" height="240" className="mx-auto">
        {/* Background circles */}
        {circles}
        {/* Axis lines */}
        {axisLines}
        
        {/* Skill area */}
        <motion.path
          d={pathData}
          fill={`${color}20`}
          stroke={color}
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        
        {/* Skill points */}
        {skillPoints.map((point, index) => (
          <motion.g key={index}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
              whileHover={{ scale: 1.5 }}
            />
            {/* Skill labels */}
            <motion.text
              x={point.labelX}
              y={point.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-xs ${handwrittenFont} font-medium`}
              fill="#374151"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 1 }}
            >
              {point.skill.name}
            </motion.text>
          </motion.g>
        ))}
        
        {/* Center point */}
        <circle
          cx={centerX}
          cy={centerY}
          r="3"
          fill={color}
        />
      </svg>
      
      {/* Proficiency levels legend */}
      <div className="mt-4 flex justify-center">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
            <span>Beginner</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <span>Intermediate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{backgroundColor: color}}></div>
            <span>Expert</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced skills data with proficiency levels
const skillsEnhanced = [
  { 
    category: "Cloud & Backend", 
    items: [
      { name: "AWS Cloud Services", proficiency: 85 },
      { name: "Spring Boot MicroServices", proficiency: 90 },
      { name: "Docker & Kubernetes", proficiency: 75 },
      { name: "MongoDB & PostgreSQL", proficiency: 80 }
    ], 
    color: "#3b82f6",
    icon: "☁️"
  },
  { 
    category: "Design & UX", 
    items: [
      { name: "UI/UX Design", proficiency: 95 },
      { name: "Branding + Visual Design", proficiency: 90 },
      { name: "Prototyping + Dev handoff", proficiency: 85 },
      { name: "Design Systems", proficiency: 80 }
    ], 
    color: "#8b5cf6",
    icon: "🎨"
  },
  { 
    category: "Development", 
    items: [
      { name: "React & Next.js", proficiency: 90 },
      { name: "TypeScript", proficiency: 85 },
      { name: "Mobile Development", proficiency: 75 },
      { name: "Design Strategy & UX Research", proficiency: 80 }
    ], 
    color: "#10b981",
    icon: "💻"
  },
  { 
    category: "Specialized", 
    items: [
      { name: "Game Design", proficiency: 70 },
      { name: "3D Modeling", proficiency: 65 },
      { name: "Animation", proficiency: 60 },
      { name: "Creative Direction", proficiency: 75 }
    ], 
    color: "#f59e0b",
    icon: "🎮"
  }
];

// Enhanced involvement data with categories and colors
const involvementEnhanced = [
  {
    title: "Guest Lecturer & Workshop Conductor",
    description: "Delivered guest lectures and conducted workshops on UI/UX design for 60 students, sharing insights and practical knowledge and skill development in the field.",
    category: "Education",
    icon: "👨‍🏫",
    color: "#3b82f6",
    impact: "60+ students trained"
  },
  {
    title: "Tech Community Engagement",
    description: "Engaging in tech events and meetups across Bangalore during weekends, actively participating to stay updated with trends and connect with the tech community.",
    category: "Community",
    icon: "🤝",
    color: "#8b5cf6",
    impact: "Active community member"
  }
];

// Utility function for skill icons
const getSkillIcon = (category: string) => {
  switch (category) {
    case 'Cloud & Backend': return '☁️';
    case 'Design & UX': return '�';
    case 'Development': return '💻';
    case 'Specialized': return '🎮';
    default: return '⚡';
  }
};

// Creative Projects Data from Case Studies
const creativeProjects = [
  {
    id: "habit-tracker",
    title: "Habit Tracker Mobile App",
    description: "A comprehensive habit tracking mobile application with data visualization and motivational features",
    category: "Mobile Development",
    status: "Live",
    statusColor: "#22c55e",
    impact: "Helped 5000+ users build better habits",
    stakeholders: "Individual users, wellness coaches",
    technologies: ["React Native", "Node.js", "MongoDB", "Chart.js"],
    skillsGained: ["Mobile Development", "Data Visualization", "User Psychology"],
    image: "/images/mobile-app/final-mobile.svg",
    sketches: [
      { path: "M20 50 Q50 20 80 50 Q110 80 140 50", color: "#4CAF50", delay: 0.5 },
      { path: "M160 40 L180 60 L160 80 L140 60 Z", color: "#8BC34A", delay: 1.0 }
    ]
  },
  {
    id: "ai-chatbot",
    title: "AI Customer Service Bot",
    description: "Intelligent chatbot with natural language processing for customer support automation",
    category: "AI/ML",
    status: "Live",
    statusColor: "#3b82f6",
    impact: "Reduced support tickets by 60%",
    stakeholders: "Customer service teams, 10K+ customers",
    technologies: ["Next.js", "OpenAI API", "Python", "PostgreSQL"],
    skillsGained: ["AI Integration", "NLP", "Conversational Design"],
    image: "/images/chatbot/final-chatbot.svg",
    sketches: [
      { path: "M30 30 Q60 10 90 30 Q120 50 150 30", color: "#3b82f6", delay: 0.3 },
      { path: "M40 50 L60 70 L80 50 L100 70 L120 50", color: "#1d4ed8", delay: 0.8 }
    ]
  },
  {
    id: "portfolio-website",
    title: "Interactive Portfolio Website",
    description: "This very website - a creative showcase with 3D animations and interactive elements",
    category: "Web Development",
    status: "Live",
    statusColor: "#8b5cf6",
    impact: "Showcases work to potential clients and employers",
    stakeholders: "Recruiters, clients, design community",
    technologies: ["Next.js", "Three.js", "Framer Motion", "Tailwind CSS"],
    skillsGained: ["3D Web Graphics", "Creative Coding", "Portfolio Design"],
    image: "/images/portfolio/final-portfolio.svg",
    sketches: [
      { path: "M10 40 C30 20, 70 20, 90 40 C110 60, 150 60, 170 40", color: "#8b5cf6", delay: 0.4 },
      { path: "M50 10 L70 30 L50 50 L30 30 Z", color: "#a855f7", delay: 0.9 }
    ]
  }
];

export default function Work() {
  const [activeTab, setActiveTab] = useState<'experience' | 'projects'>('experience');
  return (
    <main className="min-h-screen pt-16 notebook-bg overflow-x-hidden">
      {/* Animated scribble background */}      <div className="absolute inset-0 z-0 pointer-events-none">
        <ScribbleAnimation className="w-full h-full" />
      </div>

      {/* Resume Download Section - Sticky Note */}
      <motion.div 
        className="fixed top-24 right-8 z-30 flex flex-col items-center shadow-xl" 
        style={{width: '220px', transform: 'rotate(-2deg)'}}
        initial={{ scale: 0, rotate: 10 }}
        animate={{ scale: 1, rotate: -2 }}
        transition={{ delay: 1.5, type: 'spring' }}
      >
        <div className="w-16 h-5 bg-yellow-200 rounded-b-lg mb-[-10px] shadow-md" style={{marginTop: '-18px'}}></div>
        <a
          href="/resume-arunkumar-srinivasan.pdf"
          download="Arunkumar_Srinivasan_Resume.pdf"
          className={`${handwrittenFont} text-lg px-6 py-4 bg-yellow-100 border-2 border-yellow-400 rounded-xl font-bold text-center no-underline hover:bg-yellow-200 focus:ring-2 focus:ring-yellow-400 transition-all w-full block hover:scale-105 transform`}
          style={{boxShadow: '0 8px 24px 0 rgba(0,0,0,0.10)', minHeight: '90px'}}
        >
          📎 Download My Updated Resume
        </a>
      </motion.div>

      {/* Header Section */}
      <motion.div
        className="relative z-10 flex flex-col items-center mb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >        <SketchHeading level={1} className={`magnetic-drawing-heading text-4xl md:text-5xl mb-2 ${magneticFont}`}>
          <span>My Professional Journey</span>
        </SketchHeading>
        <div className="max-w-4xl bg-white/80 border-2 border-dashed rounded-xl p-6 shadow-xl mb-8">
          <div className="text-center">            <div className={`${handwrittenFont} text-xl mb-4 text-gray-800`}>
              Perfectionist and versatile generalist excelling in end-to-end development and design, dedicated to crafting exceptional user experiences and visually striking designs. Continuously striving to elevate projects to their fullest potential.
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('experience')}
            className={`px-6 py-3 rounded-full border-2 border-dashed font-bold transition-all ${handwrittenFont} ${
              activeTab === 'experience' 
                ? 'bg-indigo-100 border-indigo-400 text-indigo-800' 
                : 'bg-white/70 border-gray-300 text-gray-600 hover:border-indigo-300'
            }`}
          >
            Work Experience
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 rounded-full border-2 border-dashed font-bold transition-all ${handwrittenFont} ${
              activeTab === 'projects' 
                ? 'bg-purple-100 border-purple-400 text-purple-800' 
                : 'bg-white/70 border-gray-300 text-gray-600 hover:border-purple-300'
            }`}
          >
            Creative Projects
          </button>
        </div>
      </motion.div>

      {/* Constellation Skills - Always visible */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <SketchHeading level={2} className={`text-2xl md:text-3xl mb-4 ${handwrittenFont}`}>
            My Skill Constellation
          </SketchHeading>
          <ConstellationSkills />
        </motion.div>
      </section>      {/* Work Experience Section */}
      {activeTab === 'experience' && (
        <section className="relative z-10 max-w-6xl mx-auto px-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SketchHeading level={2} className={`text-2xl md:text-3xl mb-8 text-center ${handwrittenFont}`}>
              Professional Experience
            </SketchHeading>
          <div className="grid gap-6">
            {workExperience.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >                <SketchCard className="p-6 bg-white/90 border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Job Info */}
                    <div className="md:col-span-2">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                        <div>
                          <h3 className={`text-xl font-bold text-gray-800 mb-1 ${handwrittenFont}`}>
                            {job.title}
                          </h3>
                          <div className={`text-lg text-indigo-600 font-semibold mb-1 ${handwrittenFont}`}>
                            {job.company}
                          </div>
                          <div className={`text-sm text-gray-600 ${handwrittenFont}`}>
                            📍 {job.location}
                          </div>
                        </div>
                        <div className={`text-sm text-gray-500 mt-2 md:mt-0 px-3 py-1 bg-gray-100 rounded-full border border-gray-200 ${handwrittenFont}`}>
                          {job.period}
                        </div>
                      </div>
                      <p className={`text-gray-700 mb-4 leading-relaxed ${handwrittenFont}`}>
                        {job.description}
                      </p>
                      
                      {/* Projects & Impact */}
                      {job.projects && job.projects.length > 0 && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className={`font-bold text-blue-800 mb-2 ${handwrittenFont}`}>🚀 Key Project</h4>
                          <div className={`text-sm text-blue-700 mb-2 ${handwrittenFont}`}>
                            <strong>{job.projects[0].name}:</strong> {job.projects[0].description}
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-2">
                              <DonutChart value={85} color="#22c55e" />
                              <span className={`${handwrittenFont} text-green-700`}>📈 {job.projects[0].impact}</span>
                            </div>
                            <div className={`${handwrittenFont} text-gray-600`}>
                              👥 {job.projects[0].stakeholders}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Skills Gained */}
                      {job.skillsGained && (
                        <div className="mb-4">
                          <h4 className={`font-bold text-gray-800 mb-2 text-sm ${handwrittenFont}`}>✨ Skills Gained</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.skillsGained.map((skill) => (
                              <span
                                key={skill}
                                className={`px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-200 ${handwrittenFont}`}
                              >
                                🌟 {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <span
                            key={skill}
                            className={`px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200 ${handwrittenFont}`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Skills Chart */}
                    <div className="md:col-span-1">
                      {job.chartData && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h4 className={`font-bold text-gray-800 mb-3 text-sm ${handwrittenFont}`}>📊 Skill Proficiency</h4>
                          <BarChart data={job.chartData} />
                        </div>
                      )}
                    </div>
                  </div>
                </SketchCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      )}

      {/* Creative Projects Section */}
      {activeTab === 'projects' && (
        <section className="relative z-10 max-w-6xl mx-auto px-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SketchHeading level={2} className={`text-2xl md:text-3xl mb-8 text-center ${handwrittenFont}`}>
              Creative Projects & Case Studies
            </SketchHeading>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {creativeProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <SketchCard className="p-6 bg-white/90 border-2 border-dashed border-gray-300 hover:border-purple-400 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 h-full">
                    {/* Project Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold text-gray-800 mb-1 ${handwrittenFont}`}>
                          {project.title}
                        </h3>
                        <div className={`text-sm text-purple-600 font-semibold ${handwrittenFont}`}>
                          {project.category}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${handwrittenFont}`}
                        style={{ backgroundColor: project.statusColor, color: 'white' }}
                      >
                        {project.status}
                      </span>
                    </div>

                    {/* Project Description */}
                    <p className={`text-gray-700 text-sm mb-4 leading-relaxed ${handwrittenFont}`}>
                      {project.description}
                    </p>

                    {/* Impact Section */}
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <h4 className={`font-bold text-green-800 mb-1 text-xs ${handwrittenFont}`}>💪 Impact</h4>
                      <div className={`text-xs text-green-700 ${handwrittenFont}`}>
                        {project.impact}
                      </div>
                      <div className={`text-xs text-gray-600 mt-1 ${handwrittenFont}`}>
                        👥 {project.stakeholders}
                      </div>
                    </div>

                    {/* Technologies */}
                    <div className="mb-4">
                      <h4 className={`font-bold text-gray-800 mb-2 text-xs ${handwrittenFont}`}>🛠️ Technologies</h4>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className={`px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full ${handwrittenFont}`}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skills Gained */}
                    <div className="mb-4">
                      <h4 className={`font-bold text-gray-800 mb-2 text-xs ${handwrittenFont}`}>🌟 Skills Gained</h4>
                      <div className="flex flex-wrap gap-1">
                        {project.skillsGained.map((skill) => (
                          <span
                            key={skill}
                            className={`px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full ${handwrittenFont}`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="mt-4">
                      <button className={`w-full px-3 py-2 bg-purple-100 border border-purple-300 rounded-lg text-purple-700 font-bold hover:bg-purple-200 transition-colors ${handwrittenFont}`}>
                        🔍 View Case Study
                      </button>
                    </div>
                  </SketchCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Skills Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative">
            <SketchHeading level={2} className={`text-2xl md:text-3xl mb-8 text-center ${handwrittenFont}`}>
              🚀 Skills & Expertise
            </SketchHeading>
            
            {/* Floating interactive decorations */}
            <motion.div 
              className="absolute -top-4 left-1/2 transform -translate-x-1/2"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-2xl">✨</span>
            </motion.div>
          </div>          <div className="grid md:grid-cols-2 gap-8">
            {skillsEnhanced.map((skillGroup, index) => (
              <motion.div
                key={skillGroup.category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div 
                  className={`p-8 bg-white/95 border-2 border-dashed hover:shadow-2xl transform transition-all duration-500 rounded-xl relative overflow-hidden backdrop-blur-sm`}
                  style={{borderColor: skillGroup.color}}
                >
                  {/* Professional header */}
                  <div className="text-center mb-6">
                    <motion.div 
                      className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center relative"
                      style={{ backgroundColor: `${skillGroup.color}15` }}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.8 }}
                    >
                      <span className="text-3xl">{skillGroup.icon}</span>
                      {/* Professional glow effect */}
                      <motion.div 
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: `${skillGroup.color}20` }}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      />
                    </motion.div>
                    <h3 className={`text-xl font-bold ${handwrittenFont} mb-2`} style={{ color: skillGroup.color }}>
                      {skillGroup.category}
                    </h3>
                    <p className={`text-sm text-gray-600 ${handwrittenFont}`}>
                      {skillGroup.category === 'Cloud & Backend' ? 'Enterprise-grade infrastructure & APIs' :
                       skillGroup.category === 'Design & UX' ? 'User-centered design & brand identity' :
                       skillGroup.category === 'Development' ? 'Full-stack development & architecture' :
                       'Creative problem solving & innovation'}
                    </p>
                  </div>

                  {/* Radar Chart */}
                  <SkillsRadarChart skills={skillGroup.items} color={skillGroup.color} />
                  
                  {/* Professional metrics */}
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className={`text-sm font-medium text-gray-700 ${handwrittenFont}`}>
                        Skill Mastery
                      </span>
                      <motion.span 
                        className={`text-lg font-bold ${handwrittenFont}`}
                        style={{ color: skillGroup.color }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {Math.round(skillGroup.items.reduce((acc, skill) => acc + skill.proficiency, 0) / skillGroup.items.length)}%
                      </motion.span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className={`text-sm font-medium text-gray-700 ${handwrittenFont}`}>
                        Technologies
                      </span>
                      <motion.span 
                        className={`text-lg font-bold ${handwrittenFont}`}
                        style={{ color: skillGroup.color }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {skillGroup.items.length}
                      </motion.span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className={`text-sm font-medium text-gray-700 ${handwrittenFont}`}>
                        Experience Level
                      </span>
                      <motion.span 
                        className={`text-sm font-bold ${handwrittenFont}`}
                        style={{ color: skillGroup.color }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {Math.round(skillGroup.items.reduce((acc, skill) => acc + skill.proficiency, 0) / skillGroup.items.length) >= 85 ? 'Senior' :
                         Math.round(skillGroup.items.reduce((acc, skill) => acc + skill.proficiency, 0) / skillGroup.items.length) >= 70 ? 'Mid-Level' : 'Junior'}
                      </motion.span>
                    </div>
                  </div>
                  
                  {/* Professional decoration */}
                  <motion.div 
                    className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ rotate: 180, scale: 1.2 }}
                  >
                    <span className="text-2xl">⚡</span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Involvement Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="relative">
            <SketchHeading level={2} className={`text-2xl md:text-3xl mb-8 text-center ${handwrittenFont}`}>
              🤝 Involvement
            </SketchHeading>
            
            {/* Community engagement floating elements */}
            <motion.div 
              className="absolute -top-3 left-1/4"
              animate={{ 
                x: [0, 10, -10, 0],
                y: [0, -5, 0]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-xl">🌟</span>
            </motion.div>
            
            <motion.div 
              className="absolute -top-1 right-1/3"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <span className="text-lg">💫</span>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {involvementEnhanced.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div 
                  className="p-6 bg-white/90 border-2 border-dashed rounded-lg hover:shadow-xl transform transition-all duration-300 group cursor-pointer relative overflow-hidden h-full"
                  style={{borderColor: item.color}}
                >
                  {/* Background pattern */}
                  <motion.div 
                    className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10"
                    style={{backgroundColor: item.color}}
                    whileHover={{ scale: 1.5, rotate: 90 }}
                    transition={{ duration: 0.4 }}
                  />
                  
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <motion.div 
                      className="text-3xl flex-shrink-0"
                      whileHover={{ scale: 1.2, rotate: 15 }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.icon}
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className={`text-lg font-bold text-gray-800 ${handwrittenFont}`}>
                          {item.title}
                        </h4>
                      </div>
                      <motion.div 
                        className={`inline-block px-2 py-1 text-xs rounded-full font-bold ${handwrittenFont}`}
                        style={{ 
                          backgroundColor: `${item.color}15`,
                          color: item.color
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {item.category}
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className={`text-gray-700 text-sm leading-relaxed mb-4 ${handwrittenFont}`}>
                    {item.description}
                  </p>
                  
                  {/* Impact badge */}
                  <div className="flex items-center justify-between">
                    <motion.div 
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${handwrittenFont}`}
                      style={{ 
                        backgroundColor: `${item.color}10`,
                        color: item.color
                      }}
                      whileHover={{ scale: 1.1 }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <span>🎯</span>
                      {item.impact}
                    </motion.div>
                    
                    {/* Hover indicator */}
                    <motion.div 
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      ⚡
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>        </motion.div>
      </section>
    </main>
  );
}
