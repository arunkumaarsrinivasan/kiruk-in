'use client';

import ScribbleAnimation from '@/components/three/scribble-animation';
import { SketchHeading, SketchCard } from '@/components/ui/sketch-elements';
import { motion } from 'framer-motion';
import { ConstellationSkills, InvolvementSection } from '@/modules/work';

// Font utility classes
const handwrittenFont = 'handwritten';

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
        cx="24"
        cy="24"
        r={radius}
        stroke="#e5e7eb"
        strokeWidth="8"
        fill="none"
      />
      <motion.circle
        cx="24"
        cy="24"
        r={radius}
        stroke={color}
        strokeWidth="8"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2 }}
        strokeLinecap="round"
      />
      <text
        x="24"
        y="28"
        textAnchor="middle"
        className={`text-base fill-gray-700 ${handwrittenFont}`}
      >
        {value}%
      </text>
    </svg>
  );
};

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

// Professional experience timeline data
const workExperience = [
  {
    id: "hp-software-engineer",
    title: "Software Systems Engineer 1",
    company: "HP Inc.",
    location: "Bengaluru",
    period: "Aug 2023 - Present",
    description:
      "Core contributor to HP Print AI: Industry's First Intelligent Print Experience (production). Developed email and webmail printing solutions through reconstruction and deconstruction architecture. Built pipeline for Email with Spring Boot (Java), Node.js (TypeScript), and cURL drivers. Experienced AI-powered document analysis reducing print setup clicks by 80% and improving accuracy by 35% and reducing page usage by 20% to enhance the overall print experience.",
    type: "full-time",
    skills: ["Spring Boot", "Node.js", "TypeScript", "Next.js", "Figma", "Python", "AI/ML"],
    projects: [
      {
        name: "HP Print AI - Intelligent Print Experience",
        description: "Built pipeline for Email with Spring Boot and Node.js, improving document loading by 80%",
        impact: "Reduced print setup clicks by 35% and page usage by 20%",
        stakeholders: "500+ HP employees, enterprise customers"
      }
    ],
    skillsGained: ["AI/ML Integration", "Microservices Architecture", "Email Processing"],
    chartData: [
      { label: "Spring Boot", value: 90, color: "#22c55e" },
      { label: "Node.js", value: 85, color: "#3b82f6" },
      { label: "Next.js", value: 88, color: "#000000" }
    ]
  },
  {
    id: "sns-design-lead",
    title: "Freelance Design Lead (Concurrent)",
    company: "SNS Square",
    location: "Remote",
    period: "Nov 2023 - Aug 2024",
    description:
      "Led end-to-end UX/UI design for Squarebridge, a student recruitment platform connecting students, recruiters, and placement officers. Conducted user research and usability testing with 200+ candidates, improving engagement by 45%. Created design system and 150+ UI screens for portfolio builder, recruiter search interface, placement dashboard and Website.",
    type: "freelance",
    skills: ["UX Research", "UI Design", "Figma", "Usability Testing", "Design Systems", "MongoDB", "Node.js"],
    projects: [
      {
        name: "Squarebridge Platform Design",
        description:
          "Created design system and 150+ UI screens for portfolio builder, recruiter search interface, placement dashboard and Website. Managed and mentored team of 2-3 designers and interns on design consistency, component-based design, and user-centered methodologies",
        impact:
          "Improved engagement by 45%. Delivered comprehensive UX documentation and interactive Figma prototypes achieving 98% design implementation accuracy with development team",
        stakeholders: "Students, recruiters, placement officers, product team, development team"
      },
      {
        name: "Advanced Filtering Dashboard",
        description: "Designed student portfolio features and recruiter dashboard with advanced filtering",
        impact: "Reduced candidate discovery time by 40% and placement officer workload by 35%. Collaborated with product and backend teams (Node.js, MongoDB) for seamless technical integration",
        stakeholders: "Recruiters, placement officers, backend team"
      }
    ],
    skillsGained: ["Design Leadership", "Team Management", "User-Centered Methodologies", "Technical Integration"],
    chartData: [
      { label: "UX Research", value: 95, color: "#8B5CF6" },
      { label: "UI Design", value: 93, color: "#EC4899" },
      { label: "Leadership", value: 88, color: "#F59E0B" }
    ]
  },
  {
    id: "peoplegamez-intern",
    title: "Interaction Design Intern",
    company: "PeopleGamez.com",
    location: "Remote",
    period: "Nov 2022 - Jan 2023",
    description:
      "Designed interactive gamified experiences for HR platforms through user research and storyboard analysis. Developed user flows, interaction models, 100+ game assets, and performance report dashboards. Created design system, report templates, and data visualization standards while facilitating employee retention through comprehensive interaction design documentation and prototypes with product and engineering collaboration for enhanced employee retention.",
    type: "internship",
    skills: ["Game Design", "Interaction Design", "User Flows", "Data Visualization", "Figma"],
    projects: [
      {
        name: "HR Gamification Platform",
        description:
          "Created design system, report templates, and data visualization standards for enhanced employee retention",
        impact: "Delivered comprehensive interaction design documentation and prototypes with product and engineering teams",
        stakeholders: "HR teams, product managers, engineering team"
      }
    ],
    skillsGained: ["Gamification Principles", "HR Tech Understanding", "Interactive Design", "Cross-functional Collaboration"],
    chartData: [
      { label: "Game Design", value: 85, color: "#EC4899" },
      { label: "Interaction", value: 83, color: "#8B5CF6" },
      { label: "User Flows", value: 80, color: "#10B981" }
    ]
  }
];

export default function Work() {
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
          href="/Arun-Kumaar-Resume.pdf"
          download="Arun_Kumaar_Resume.pdf"
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
      >        <SketchHeading level={1} className="magnetic-drawing-heading text-4xl md:text-5xl mb-2 magnetic-font">
          <span>My Professional Journey</span>
        </SketchHeading>
        <div className="max-w-4xl bg-white/80 border-2 border-dashed rounded-xl p-6 shadow-xl mb-8">
          <div className="text-center">            <div className={`${handwrittenFont} text-xl mb-4 text-gray-800`}>
              Perfectionist and versatile generalist excelling in end-to-end development and design, dedicated to crafting exceptional user experiences and visually striking designs. Continuously striving to elevate projects to their fullest potential.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Work Experience Section */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SketchHeading level={2} className="text-2xl md:text-3xl mb-8 text-center magnetic-font">
              Professional Experience
            </SketchHeading>
          <div className="grid gap-6">
            {workExperience.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <SketchCard className="p-6 bg-white/90 border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
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

        {/* Constellation Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 overflow-visible mt-16"
        >
          <SketchHeading level={2} className="text-2xl md:text-3xl mb-6 magnetic-font">
            🌌 Stargazing Through My Expertise
          </SketchHeading>
          <motion.p 
            className={`text-lg text-gray-700 mb-8 ${handwrittenFont}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Explore the celestial map of my skills, where each constellation tells a story of expertise and growth
          </motion.p>
          <div className="overflow-visible">
            <ConstellationSkills />
          </div>
        </motion.div>
      </section>

      {/* Involvement Section */}
      <InvolvementSection involvementData={involvementEnhanced} />
    </main>
  );
}
