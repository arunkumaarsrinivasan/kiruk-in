'use client';

import { SketchHeading, SketchCard, WireframeCard, WireframeSeparator } from '@/components/ui/sketch-elements';
import { motion } from 'framer-motion';
import { ConstellationSkills, InvolvementSection } from '@/modules/work';

// Shared handwritten font token
const handwrittenFont = 'handwritten';

// Horizontal bar chart used inside job cards
const BarChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => (
  <div className="w-full flex flex-col gap-3 mt-4">
    {data.map((item, index) => (
      <div key={item.label} className="flex items-center gap-3">
        <span className={`text-[10px] uppercase tracking-wider w-24 text-[var(--text-muted)] ${handwrittenFont}`}>{item.label}</span>
        <div className="flex-1 h-2 bg-[var(--border-color)] opacity-20 relative overflow-hidden border border-[var(--border-color)]">
          <motion.div
            className="h-full absolute left-0 top-0 bg-[var(--text-main)]"
            style={{ width: `${item.value}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${item.value}%` }}
            transition={{ duration: 1.2, delay: 0.2 + index * 0.1 }}
          />
        </div>
        <span className={`text-[10px] ${handwrittenFont} ml-2 text-[var(--text-muted)]`}>{item.value}%</span>
      </div>
    ))}
  </div>
);

// Donut chart that spotlights impact metrics
const DonutChart = ({ value, color, label }: { value: number; color: string; label?: string }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[60px] h-[60px]">
        <svg width="60" height="60" className="transform -rotate-90">
          <circle cx="30" cy="30" r={radius} stroke="var(--border-color)" strokeOpacity="0.2" strokeWidth="4" fill="none" />
          <motion.circle
            cx="30"
            cy="30"
            r={radius}
            stroke="var(--text-main)"
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2 }}
            strokeLinecap="square"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${handwrittenFont} text-[var(--text-main)]`}>{value}%</span>
        </div>
      </div>
      {label && <span className={`text-[10px] uppercase tracking-widest text-[var(--text-muted)] ${handwrittenFont} text-center max-w-[100px]`}>{label}</span>}
    </div>
  );
};

const involvementEnhanced = [
  {
    title: 'Guest Lecturer & Workshop Conductor',
    description:
      'Delivered guest lectures and conducted workshops on UI/UX design for 60 students, sharing insights and practical knowledge and skill development in the field.',
    category: 'Education',
    icon: '👨‍🏫',
    color: '#3b82f6',
    impact: '60+ students trained'
  },
  {
    title: 'Tech Community Engagement',
    description:
      'Engaging in tech events and meetups across Bangalore during weekends, actively participating to stay updated with trends and connect with the tech community.',
    category: 'Community',
    icon: '🤝',
    color: '#8b5cf6',
    impact: 'Active community member'
  }
];

const workExperience = [
  {
    id: 'hp-design-engineer',
    title: 'Design Engineer',
    company: 'HP Inc.',
    location: 'Bengaluru',
    period: 'Aug 2023 - Present',
    duration: '2 yrs 5 mos',
    summary: 'Key contributor to HP Print AI’s launch of the industry’s first intelligent print experience.',
    projects: [
      {
        title: 'Print AI Workflows',
        role: 'Engineering',
        desc: 'Scalable email/webmail printing workflows using Spring Boot & Node.js.',
        tech: ['Spring Boot', 'Node.js', 'Java']
      },
      {
        title: 'Flutter Web UI',
        role: 'Mobile/UX',
        desc: 'Led end-to-end design & launch of mobile-first web UI, improving onboarding.',
        tech: ['Flutter', 'Dart', 'UX Design']
      },
      {
        title: 'Internal AI Stack',
        role: 'System Design',
        desc: 'Cohesive design system & branding for platform used by 500+ employees.',
        tech: ['Next.js', 'Figma', 'Branding']
      },
      {
        title: 'IoT Monitoring',
        role: 'DevOps',
        desc: 'Designed Splunk dashboards & managed 7+ cloud microservices.',
        tech: ['Splunk', 'Cloud', 'Microservices']
      }
    ],
    metrics: [
      { label: 'AI Stack Users', value: '500+' },
      { label: 'Accuracy Boost', value: '+35%' },
      { label: 'Microservices', value: '7+' }
    ],
    spotlight: {
      title: 'HP Print AI & AI Stack',
      summary: 'Industry’s first intelligent print experience & internal AI platform enabling text-to-image generation.',
      result: 'Improved onboarding',
      audience: 'Customers & Employees'
    },
    impactChart: { value: 90, color: '#22c55e', label: 'Innovation' },
    type: 'full-time',
    skills: ['Spring Boot', 'Node.js', 'TypeScript', 'Flutter', 'Next.js', 'Figma', 'Splunk', 'AI/ML'],
    skillsGained: ['Enterprise Architecture', 'Cross-functional Leadership', 'AI Integration', 'Design Systems'],
    chartData: [
      { label: 'Engineering', value: 85, color: '#22c55e' },
      { label: 'Design', value: 80, color: '#3b82f6' },
      { label: 'Product', value: 75, color: '#000000' }
    ]
  },
  {
    id: 'sns-product-designer',
    title: 'Product Designer',
    company: 'SNS Square',
    location: 'Remote',
    period: 'Nov 2023 - Aug 2024',
    duration: '10 mos',
    summary: 'Led end-to-end UX/UI design for Square bridge, a student recruitment platform.',
    projects: [
      {
        title: 'Square Bridge',
        role: 'UX Lead',
        desc: 'End-to-end platform design increasing engagement by 45%.',
        tech: ['UX Research', 'Prototyping']
      },
      {
        title: 'Design System',
        role: 'Architecture',
        desc: 'Unified system with 150+ UI screens for dashboards & portfolios.',
        tech: ['Figma', 'Components', 'UI']
      },
      {
        title: 'Team Leadership',
        role: 'Management',
        desc: 'Mentored 3+ designers ensuring 98% design-to-dev accuracy.',
        tech: ['Leadership', 'Handoff']
      }
    ],
    metrics: [
      { label: 'Engagement', value: '+45%' },
      { label: 'Screens', value: '150+' },
      { label: 'Handoff Acc.', value: '98%' }
    ],
    spotlight: {
      title: 'Square Bridge Platform',
      summary: 'Unified recruitment ecosystem connecting students and recruiters.',
      result: '40% faster discovery',
      audience: 'Recruiters & Students'
    },
    impactChart: { value: 92, color: '#8B5CF6', label: 'Design Impact' },
    type: 'freelance',
    skills: ['UX Research', 'UI Design', 'Figma', 'Design Systems', 'Team Management', 'Node.js', 'MongoDB'],
    skillsGained: ['Design Leadership', 'Team Management', 'User Research', 'Technical Handoff'],
    chartData: [
      { label: 'UX Research', value: 95, color: '#8B5CF6' },
      { label: 'UI Design', value: 93, color: '#EC4899' },
      { label: 'Leadership', value: 88, color: '#F59E0B' }
    ]
  },
  {
    id: 'peoplegamez-intern',
    title: 'Interaction Design Intern',
    company: 'PeopleGamez.com',
    location: 'Remote',
    period: 'Nov 2022 - Jan 2023',
    duration: '3 mos',
    summary: 'Designed gamified HR experiences and developed user flows.',
    projects: [
      {
        title: 'Gamified HR',
        role: 'Game Design',
        desc: 'Turned retention data into playful, trackable dashboards.',
        tech: ['Gamification', 'Dashboards']
      },
      {
        title: 'Game Assets',
        role: 'Visual Design',
        desc: 'Shipped 100+ game UI assets and mapped player journeys.',
        tech: ['UI Assets', 'User Flows']
      }
    ],
    metrics: [
      { label: 'Game Assets', value: '100+' },
      { label: 'Dashboards', value: 'Multiple' },
      { label: 'Prototyping', value: 'Rapid' }
    ],
    spotlight: {
      title: 'Gamified HR Tools',
      summary: 'Turning retention and performance data into playful, trackable dashboards.',
      result: 'Enhanced Engagement',
      audience: 'HR Teams'
    },
    impactChart: { value: 80, color: '#EC4899', label: 'Gamification' },
    type: 'internship',
    skills: ['Game Design', 'Interaction Design', 'User Flows', 'Prototyping', 'Figma'],
    skillsGained: ['Gamification', 'Rapid Prototyping', 'Asset Creation'],
    chartData: [
      { label: 'Game Design', value: 85, color: '#EC4899' },
      { label: 'Interaction', value: 83, color: '#8B5CF6' },
      { label: 'Prototyping', value: 80, color: '#10B981' }
    ]
  },
  {
    id: 'freelance-designer',
    title: 'Freelance Designer',
    company: 'Various Clients',
    location: 'Remote',
    period: '2020 - 2023',
    duration: '3 yrs',
    summary: 'Delivered branding, UI/UX, and creative design solutions.',
    projects: [
      {
        title: 'Brand Identity',
        role: 'Creative Dir.',
        desc: 'Branding & design solutions for studios and resorts.',
        tech: ['Branding', 'Identity']
      },
      {
        title: 'Cross-Platform',
        role: 'UI/UX',
        desc: 'End-to-end design for web, mobile, and print projects.',
        tech: ['Web', 'Mobile', 'Print']
      }
    ],
    metrics: [
      { label: 'Projects', value: 'Multiple' },
      { label: 'Clients', value: 'Diverse' },
      { label: 'Satisfaction', value: 'High' }
    ],
    spotlight: {
      title: 'Diverse Portfolio',
      summary: 'Branding, UI/UX, and creative design across web, mobile, and print.',
      result: 'Client Success',
      audience: 'Various Businesses'
    },
    impactChart: { value: 88, color: '#F59E0B', label: 'Versatility' },
    type: 'freelance',
    skills: ['Branding', 'UI/UX', 'Print Design', 'Web Design', 'Client Management'],
    skillsGained: ['Client Communication', 'Project Management', 'Versatile Design'],
    chartData: [
      { label: 'Branding', value: 90, color: '#F59E0B' },
      { label: 'UI/UX', value: 85, color: '#3b82f6' },
      { label: 'Print', value: 80, color: '#000000' }
    ]
  }
];

export default function Work() {
  return (
    <main className="min-h-screen pt-16 bg-[var(--bg-main)] overflow-x-hidden">
      {/* Resume Download Section - Minimal Wireframe */}
      <motion.div
        className="fixed top-25 right-8 z-30 flex flex-col items-center"
        style={{ width: '220px' }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
      >
        <a
          href="/ArunkumaarSResume.pdf"
          download="Arun_Kumaar_Resume.pdf"
          className={`${handwrittenFont} text-sm px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-none text-center no-underline hover:bg-[var(--bg-main)] transition-all w-full block hover:shadow-none text-[var(--text-main)]`}
        >
          <span className="block text-xs text-[var(--text-muted)] mb-1 uppercase tracking-widest">Document</span>
          📎 Download Resume
        </a>
      </motion.div>

      {/* Header Section */}
      <motion.div
        className="relative z-10 flex flex-col items-center mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <SketchHeading level={1} className="text-4xl md:text-5xl mb-6 text-center">
          <span>My Professional Journey</span>
        </SketchHeading>
        <div className="max-w-4xl mx-auto mb-8">
          <WireframeCard className="p-0 mb-0">
            {/* Wireframe accents */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[var(--border-color)]" />
            <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-[var(--border-color)]" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-[var(--border-color)]" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-[var(--border-color)]" />

            <div className="text-center space-y-5 p-4">
            <p className={`${handwrittenFont} text-lg text-[var(--text-main)] leading-relaxed`}>
              I craft products end to end—research to release—keeping teams shipped, measured, and in sync.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => document.getElementById('experience-track')?.scrollIntoView({ behavior: 'smooth' })}
                className="group flex flex-col items-center gap-1 border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 hover:border-[var(--text-main)] transition-all"
                type="button"
              >
                <span className="text-xl text-[var(--text-muted)] group-hover:text-[var(--text-main)]">🛠️</span>
                <span className={`${handwrittenFont} text-sm font-semibold text-[var(--text-muted)] group-hover:text-[var(--text-main)]`}>
                  Build + Ship
                </span>
                <span className={`${handwrittenFont} text-[11px] text-[var(--text-muted)]`}>HP Print AI · Squarebridge</span>
              </button>
              <button
                onClick={() => document.getElementById('impact-dash')?.scrollIntoView({ behavior: 'smooth' })}
                className="group flex flex-col items-center gap-1 border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 hover:border-[var(--text-main)] transition-all"
                type="button"
              >
                <span className="text-xl text-[var(--text-muted)] group-hover:text-[var(--text-main)]">📈</span>
                <span className={`${handwrittenFont} text-sm font-semibold text-[var(--text-muted)] group-hover:text-[var(--text-main)]`}>
                  Measure impact
                </span>
                <span className={`${handwrittenFont} text-[11px] text-[var(--text-muted)]`}>80% faster print setup</span>
              </button>
              <button
                onClick={() => document.getElementById('community-notes')?.scrollIntoView({ behavior: 'smooth' })}
                className="group flex flex-col items-center gap-1 border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 hover:border-[var(--text-main)] transition-all"
                type="button"
              >
                <span className="text-xl text-[var(--text-muted)] group-hover:text-[var(--text-main)]">🤝</span>
                <span className={`${handwrittenFont} text-sm font-semibold text-[var(--text-muted)] group-hover:text-[var(--text-main)]`}>
                  Coach + collaborate
                </span>
                <span className={`${handwrittenFont} text-[11px] text-[var(--text-muted)]`}>60+ folks trained</span>
              </button>
            </div>
          </div>
          </WireframeCard>
        </div>
      </motion.div>

      {/* Work Experience Section */}
      <section id="experience-track" className="relative z-10 max-w-6xl mx-auto px-4 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <SketchHeading level={2} className="text-2xl md:text-3xl mb-8 text-center">
            Professional Experience
          </SketchHeading>
          <div className="grid gap-4">
            {workExperience.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <WireframeCard className="" measurement={job.duration}>
                  <div className="grid md:grid-cols-3 relative">
                    {/* Vertical separator between columns */}
                    <div className="hidden md:block absolute top-[-24px] bottom-[-24px] left-[66.666%] w-px bg-[var(--border-color)] opacity-20" />
                    
                    {/* Left Column: Main Content */}
                    <div className="md:col-span-2 pr-0 md:pr-8 p-4">
                      {/* Header Row */}
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 pb-6 border-b border-[var(--border-color)] opacity-20 relative">
                        <div className="absolute bottom-0 left-[-100vw] right-0 h-px bg-[var(--border-color)] opacity-20" />
                        <div>
                          <h3 className={`text-xl font-bold text-[var(--text-main)] mb-1 ${handwrittenFont} tracking-tight`}>{job.title}</h3>
                          <div className={`text-sm text-[var(--text-muted)] ${handwrittenFont} uppercase tracking-wider`}>
                            {job.company} · {job.location}
                          </div>
                        </div>
                        <div className={`text-xs text-[var(--text-muted)] mt-2 md:mt-0 ${handwrittenFont} border border-[var(--border-color)] px-2 py-1`}>
                          {job.period}
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="mb-8">
                        <p className={`text-[var(--text-main)] leading-relaxed font-light text-sm md:text-base ${handwrittenFont}`}>{job.summary}</p>
                      </div>

                      {/* Metrics Grid */}
                      {job.metrics && (
                        <div className="grid grid-cols-3 gap-px bg-[var(--border-color)] border border-[var(--border-color)] mb-8">
                          {job.metrics.map((metric) => (
                            <div key={metric.label} className="bg-[var(--bg-card)] p-4 text-center">
                              <p className={`text-lg font-bold text-[var(--text-main)] ${handwrittenFont}`}>{metric.value}</p>
                              <p className={`text-[9px] uppercase tracking-widest text-[var(--text-muted)] mt-1 ${handwrittenFont}`}>
                                {metric.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Projects Grid */}
                      {job.projects && (
                        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {job.projects.map((project, i) => (
                            <div key={i} className="border border-[var(--border-color)] p-3 bg-[var(--bg-card)] relative">
                              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--border-color)]" />
                              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--border-color)]" />
                              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--border-color)]" />
                              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--border-color)]" />
                              
                              <h4 className={`font-bold text-sm text-[var(--text-main)] mb-1 ${handwrittenFont}`}>{project.title}</h4>
                              <p className={`text-[10px] text-[var(--text-muted)] mb-2 uppercase tracking-wider ${handwrittenFont}`}>{project.role}</p>
                              <p className={`text-xs text-[var(--text-main)] mb-3 leading-relaxed ${handwrittenFont}`}>{project.desc}</p>
                              <div className="flex flex-wrap gap-1">
                                {project.tech.map(t => (
                                  <span key={t} className={`text-[9px] px-1.5 py-0.5 border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] ${handwrittenFont}`}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Spotlight Section */}
                      {job.spotlight && (
                        <div className="mt-auto pt-6 border-t border-[var(--border-color)] opacity-20 relative">
                          <div className="absolute top-0 left-[-100vw] right-0 h-px bg-[var(--border-color)] opacity-20" />
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className={`text-[10px] uppercase tracking-widest text-[var(--text-muted)] ${handwrittenFont}`}>Spotlight</span>
                            <h4 className={`font-bold text-[var(--text-main)] text-sm ${handwrittenFont}`}>{job.spotlight.title}</h4>
                          </div>
                          <p className={`text-xs text-[var(--text-muted)] leading-relaxed ${handwrittenFont}`}>
                            {job.spotlight.summary}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Visuals */}
                    <div className="md:col-span-1 pl-0 md:pl-8 pt-8 md:pt-0 border-t md:border-t-0 border-[var(--border-color)] opacity-20 relative p-4">
                      <div className="md:hidden absolute top-0 left-[-24px] right-[-24px] h-px bg-[var(--border-color)] opacity-20" />
                      
                      {/* Skills Chart */}
                      {job.chartData && (
                        <div className="mb-8">
                          <h4 className={`text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-4 ${handwrittenFont}`}>Skill Proficiency</h4>
                          <BarChart data={job.chartData} />
                        </div>
                      )}

                      {/* Impact Chart */}
                      {job.impactChart && (
                        <div className="mb-8">
                          <h4 className={`text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-4 ${handwrittenFont} text-center`}>Impact Focus</h4>
                          <DonutChart value={job.impactChart.value} color="#000" label={job.impactChart.label} />
                        </div>
                      )}

                      {/* Skills Tags */}
                      <div className="mt-auto">
                        <h4 className={`text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-3 ${handwrittenFont}`}>Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill) => (
                            <span key={skill} className={`text-[10px] px-2 py-1 bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] ${handwrittenFont}`}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </WireframeCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 max-w-6xl mx-auto px-4 mb-16"
        >
          <span className={`flex justify-center text-xs uppercase tracking-[0.28em] text-[var(--text-muted)] ${handwrittenFont} mb-6`}>
            Personal Notes
          </span>
          
          <WireframeCard className="">
            <div className="p-4">
              <h3 className={`text-lg text-[var(--text-main)] mb-3 ${handwrittenFont}`}>Key angles</h3>
              <p className={`text-sm text-[var(--text-muted)] leading-relaxed mb-4 ${handwrittenFont}`}>
                Use these quick reminders to underline Arun&apos;s mix of AI product thinking, UX craft, and cloud delivery.
              </p>
              <ul className={`space-y-2.5 text-sm text-[var(--text-muted)] ${handwrittenFont}`}>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--text-main)] mt-0.5">✧</span>
                  <span>Say he ships AI-powered journeys like HP Print AI and still owns the UX loop end to end.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--text-main)] mt-0.5">✧</span>
                  <span>Mention his cloud fluency—tying Spring Boot, Node, and Next.js to ship live flows.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--text-main)] mt-0.5">✧</span>
                  <span>Frame him as a creative developer who prototypes, instruments, and ships without losing polish.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--text-main)] mt-0.5">✧</span>
                  <span>Underline the generalist streak—he jumps from stakeholder maps to analytics readouts to keep momentum.</span>
                </li>
              </ul>
              <div className={`mt-6 grid grid-cols-1 gap-2 text-[11px] text-[var(--text-main)] uppercase tracking-[0.18em] ${handwrittenFont}`}>
                <div className="flex justify-between border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2">
                  <span>Core focus</span>
                  <span className="text-[var(--text-main)]">AI × UX × Cloud</span>
                </div>
                <div className="flex justify-between border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2">
                  <span>Role cue</span>
                  <span className="text-[var(--text-main)]">Creative generalist</span>
                </div>
              </div>
            </div>
          </WireframeCard>
        </motion.div>
      </section>

      {/* Constellation Skills */}
      <motion.div
        id="impact-dash"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 overflow-visible mt-16 max-w-7xl mx-auto px-4"
      >
        <SketchHeading level={2} className="text-2xl md:text-3xl mb-6">
          Stargazing Through My Expertise
        </SketchHeading>
        <motion.p
          className={`text-lg text-[var(--text-muted)] mb-8 ${handwrittenFont}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Explore the celestial map of my skills, where each constellation tells a story of expertise and growth
        </motion.p>
        <div className="overflow-visible text-left">
          <WireframeCard className="">
            <ConstellationSkills />
          </WireframeCard>
        </div>
      </motion.div>

      {/* Involvement Section */}
      <div id="community-notes">
        <InvolvementSection involvementData={involvementEnhanced} />
      </div>
    </main>
  );
}
