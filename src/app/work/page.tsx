'use client';

import ScribbleNotepad from '@/components/ui/ScribbleNotepad';
import { SketchHeading, SketchCard } from '@/components/ui/sketch-elements';
import { motion } from 'framer-motion';
import { ConstellationSkills, InvolvementSection } from '@/modules/work';

// Shared handwritten font token
const handwrittenFont = 'handwritten';

// Horizontal bar chart used inside job cards
const BarChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => (
  <div className="w-full flex flex-col gap-2 mt-2">
    {data.map((item, index) => (
      <div key={item.label} className="flex items-center gap-2">
        <span className={`text-xs ${handwrittenFont} w-20`}>{item.label}</span>
        <div className="flex-1 bg-gray-100 rounded-full h-3 relative">
          <motion.div
            className="h-3 rounded-full absolute left-0 top-0"
            style={{ background: item.color, width: `${item.value}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${item.value}%` }}
            transition={{ duration: 1.2, delay: 0.2 + index * 0.1 }}
          />
        </div>
        <span className={`text-xs ${handwrittenFont} ml-2`}>{item.value}%</span>
      </div>
    ))}
  </div>
);

// Donut chart that spotlights impact metrics
const DonutChart = ({ value, color, label }: { value: number; color: string; label?: string }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="60" height="60" className="inline-block align-middle">
        <circle cx="30" cy="30" r={radius} stroke="#e5e7eb" strokeWidth="8" fill="none" />
        <motion.circle
          cx="30"
          cy="30"
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
        <text x="30" y="34" textAnchor="middle" className={`text-base fill-gray-700 ${handwrittenFont}`}>
          {value}%
        </text>
      </svg>
      {label && <span className={`text-[11px] text-gray-600 ${handwrittenFont}`}>{label}</span>}
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
    id: 'hp-software-engineer',
    title: 'Software Systems Engineer 1',
    company: 'HP Inc.',
    location: 'Bengaluru',
    period: 'Aug 2023 - Present',
    summary:
      'Shipping HP Print AI experiences for enterprise customers—bridging email, webmail, and document intelligence across Spring Boot + Node services.',
    highlights: [
      'Rebuilt email-to-print pipeline with Spring Boot + Node for global rollouts.',
      'Automated AI document checks that cut setup clicks by 80% and lifted accuracy by 35%.',
      'Partnered with support, design, and analytics to onboard 500+ HP teams.'
    ],
    metrics: [
      { label: 'Setup steps', value: '-80%' },
      { label: 'Accuracy boost', value: '+35%' },
      { label: 'Pages saved', value: '-20%' }
    ],
    spotlight: {
      title: 'HP Print AI pipeline',
      summary: 'Email & webmail print flow orchestrated across Spring Boot + Node microservices.',
      result: '80% faster setup',
      audience: '500+ HP org teams'
    },
    impactChart: { value: 85, color: '#22c55e', label: 'AI flows adopted' },
    type: 'full-time',
    skills: ['Spring Boot', 'Node.js', 'TypeScript', 'Next.js', 'Figma', 'Python', 'AI/ML'],
    skillsGained: ['AI/ML Integration', 'Microservices Architecture', 'Email Processing'],
    chartData: [
      { label: 'Spring Boot', value: 90, color: '#22c55e' },
      { label: 'Node.js', value: 85, color: '#3b82f6' },
      { label: 'Next.js', value: 88, color: '#000000' }
    ]
  },
  {
    id: 'sns-design-lead',
    title: 'Freelance Design Lead (Concurrent)',
    company: 'SNS Square',
    location: 'Remote',
    period: 'Nov 2023 - Aug 2024',
    summary:
      'Led UX for Squarebridge so recruiters and students matched faster with a scalable design system.',
    highlights: [
      'Ran field interviews + tests with 200+ students and recruiters.',
      'Crafted 150+ responsive screens and a reusable component library in Figma.',
      'Mentored a pod of 3 designers to keep design-to-dev handoff at 98% accuracy.'
    ],
    metrics: [
      { label: 'Engagement lift', value: '+45%' },
      { label: 'Screens shipped', value: '150+' },
      { label: 'Handoff accuracy', value: '98%' }
    ],
    spotlight: {
      title: 'Squarebridge design system',
      summary: 'Portfolio builder + recruiter dashboards stitched into a single narrative.',
      result: '40% faster candidate discovery',
      audience: 'Placement + product teams'
    },
    impactChart: { value: 92, color: '#8B5CF6', label: 'Design adoption' },
    type: 'freelance',
    skills: ['UX Research', 'UI Design', 'Figma', 'Usability Testing', 'Design Systems', 'MongoDB', 'Node.js'],
    skillsGained: ['Design Leadership', 'Team Management', 'User-Centered Methodologies', 'Technical Integration'],
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
    summary:
      'Designed gamified HR tools that turned retention and performance data into playful, trackable dashboards.',
    highlights: [
      'Mapped player journeys and shipped 100+ game UI assets.',
      'Standardised reporting dashboards so HR teams could compare cohorts quickly.',
      'Taught product + engineering partners how to extend the system post-internship.'
    ],
    metrics: [
      { label: 'Assets delivered', value: '100+' },
      { label: 'Dashboards', value: '12' },
      { label: 'Retention lift', value: '+18%' }
    ],
    spotlight: {
      title: 'HR gamification kit',
      summary: 'Design system + reporting templates that kept engagement loops measurable.',
      result: 'Unified retention playbook',
      audience: 'HR + product squads'
    },
    impactChart: { value: 78, color: '#EC4899', label: 'Gamified adoption' },
    type: 'internship',
    skills: ['Game Design', 'Interaction Design', 'User Flows', 'Data Visualization', 'Figma'],
    skillsGained: ['Gamification Principles', 'HR Tech Understanding', 'Interactive Design', 'Cross-functional Collaboration'],
    chartData: [
      { label: 'Game Design', value: 85, color: '#EC4899' },
      { label: 'Interaction', value: 83, color: '#8B5CF6' },
      { label: 'User Flows', value: 80, color: '#10B981' }
    ]
  }
];

export default function Work() {
  const notebookTemplates = [
    {
      label: 'HP follow-up',
      text: 'Ask about deployment roadmap for HP Print AI pipeline and offer usage analytics recap.'
    },
    {
      label: 'Squarebridge nugget',
      text: 'Highlight 45% engagement lift from Squarebridge usability studies and share candidate success story.'
    },
    {
      label: 'Next steps',
      text: 'Capture takeaways and confirm openings for async workshop or stakeholder walkthrough.'
    }
  ];

  return (
    <main className="min-h-screen pt-16 notebook-bg overflow-x-hidden">
      {/* Resume Download Section - Sticky Note */}
      <motion.div
        className="fixed top-24 right-8 z-30 flex flex-col items-center shadow-xl"
        style={{ width: '220px', transform: 'rotate(-2deg)' }}
        initial={{ scale: 0, rotate: 10 }}
        animate={{ scale: 1, rotate: -2 }}
        transition={{ delay: 1.5, type: 'spring' }}
      >
        <div className="w-16 h-5 bg-yellow-200 rounded-b-lg mb-[-10px] shadow-md" style={{ marginTop: '-18px' }} />
        <a
          href="/Arun-Kumaar-Resume.pdf"
          download="Arun_Kumaar_Resume.pdf"
          className={`${handwrittenFont} text-lg px-6 py-4 bg-yellow-100 border-2 border-yellow-400 rounded-xl font-bold text-center no-underline hover:bg-yellow-200 focus:ring-2 focus:ring-yellow-400 transition-all w-full block hover:scale-105 transform`}
          style={{ boxShadow: '0 8px 24px 0 rgba(0,0,0,0.10)', minHeight: '90px' }}
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
      >
        <SketchHeading level={1} className="magnetic-drawing-heading text-4xl md:text-5xl mb-2 magnetic-font">
          <span>My Professional Journey</span>
        </SketchHeading>
        <div className="max-w-4xl bg-white/85 border-2 border-dashed rounded-2xl p-6 shadow-xl mb-8">
          <div className="text-center space-y-4">
            <p className={`${handwrittenFont} text-lg text-gray-800 leading-relaxed`}>
              I craft products end to end—research to release—keeping teams shipped, measured, and in sync.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => document.getElementById('experience-track')?.scrollIntoView({ behavior: 'smooth' })}
                className="group flex flex-col items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                type="button"
              >
                <span className="text-2xl">🛠️</span>
                <span className={`${handwrittenFont} text-sm font-semibold text-indigo-700 group-hover:text-indigo-800`}>
                  Build + Ship
                </span>
                <span className={`${handwrittenFont} text-[11px] text-indigo-600/80`}>HP Print AI · Squarebridge</span>
              </button>
              <button
                onClick={() => document.getElementById('impact-dash')?.scrollIntoView({ behavior: 'smooth' })}
                className="group flex flex-col items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                type="button"
              >
                <span className="text-2xl">📈</span>
                <span className={`${handwrittenFont} text-sm font-semibold text-emerald-700 group-hover:text-emerald-800`}>
                  Measure impact
                </span>
                <span className={`${handwrittenFont} text-[11px] text-emerald-600/80`}>80% faster print setup</span>
              </button>
              <button
                onClick={() => document.getElementById('community-notes')?.scrollIntoView({ behavior: 'smooth' })}
                className="group flex flex-col items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                type="button"
              >
                <span className="text-2xl">🤝</span>
                <span className={`${handwrittenFont} text-sm font-semibold text-rose-700 group-hover:text-rose-800`}>
                  Coach + collaborate
                </span>
                <span className={`${handwrittenFont} text-[11px] text-rose-600/80`}>60+ folks trained</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Work Experience Section */}
      <section id="experience-track" className="relative z-10 max-w-6xl mx-auto px-4 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
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
                          <h3 className={`text-xl font-bold text-gray-800 mb-1 ${handwrittenFont}`}>{job.title}</h3>
                          <div className={`text-lg text-indigo-600 font-semibold mb-1 ${handwrittenFont}`}>
                            {job.company}
                          </div>
                          <div className={`text-sm text-gray-600 ${handwrittenFont}`}>📍 {job.location}</div>
                        </div>
                        <div className={`text-sm text-gray-500 mt-2 md:mt-0 px-3 py-1 bg-gray-100 rounded-full border border-gray-200 ${handwrittenFont}`}>
                          {job.period}
                        </div>
                      </div>
                      <p className={`text-gray-700 mb-3 leading-relaxed ${handwrittenFont}`}>{job.summary}</p>

                      {job.metrics && (
                        <div className="grid sm:grid-cols-3 gap-3 mb-4">
                          {job.metrics.map((metric) => (
                            <div key={metric.label} className="rounded-xl border border-gray-200 bg-white/90 px-3 py-3 shadow-sm text-center">
                              <p className={`text-lg font-semibold text-gray-900 ${handwrittenFont}`}>{metric.value}</p>
                              <p className={`text-[11px] uppercase tracking-[0.18em] text-gray-500 mt-1 ${handwrittenFont}`}>
                                {metric.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {job.highlights && (
                        <ul className={`space-y-2 text-sm text-gray-700 mb-4 ${handwrittenFont}`}>
                          {job.highlights.map((highlight) => (
                            <li key={highlight} className="flex gap-2 items-start">
                              <span className="text-indigo-500 mt-0.5">✦</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {job.spotlight && (
                        <div className="mb-4 p-4 bg-indigo-50/70 rounded-lg border border-indigo-200">
                          <h4 className={`font-bold text-indigo-800 mb-1 ${handwrittenFont}`}>🚀 Spotlight</h4>
                          <p className={`text-sm text-indigo-700 leading-snug ${handwrittenFont}`}>
                            <strong>{job.spotlight.title}:</strong> {job.spotlight.summary}
                          </p>
                          <div className={`mt-2 flex flex-wrap gap-3 text-[11px] text-indigo-700 ${handwrittenFont}`}>
                            <span>📈 {job.spotlight.result}</span>
                            <span>👥 {job.spotlight.audience}</span>
                          </div>
                        </div>
                      )}

                      {job.skillsGained && (
                        <div className="mb-4">
                          <h4 className={`font-bold text-gray-800 mb-2 text-sm ${handwrittenFont}`}>✨ Skills Gained</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.skillsGained.map((skill) => (
                              <span key={skill} className={`px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-200 ${handwrittenFont}`}>
                                🌟 {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <span key={skill} className={`px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200 ${handwrittenFont}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skill visuals */}
                    <div className="md:col-span-1">
                      {job.chartData && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h4 className={`font-bold text-gray-800 mb-3 text-sm ${handwrittenFont}`}>📊 Skill Proficiency</h4>
                          <BarChart data={job.chartData} />
                        </div>
                      )}
                      {job.impactChart && (
                        <div className="mt-4 bg-white/90 p-4 rounded-lg border border-gray-200 text-center">
                          <h4 className={`font-bold text-gray-800 mb-2 text-sm ${handwrittenFont}`}>Impact Focus</h4>
                          <DonutChart value={job.impactChart.value} color={job.impactChart.color} label={job.impactChart.label} />
                        </div>
                      )}
                    </div>
                  </div>
                </SketchCard>
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
          <span className={`flex justify-center text-xs uppercase tracking-[0.28em] text-gray-500 ${handwrittenFont} mb-6`}>
            Personal Notes
          </span>
          <div className="flex flex-col md:flex-row items-stretch md:items-start gap-6">
            <div className="md:flex-[0_0_70%] xl:flex-[0_0_78%]">
              <ScribbleNotepad
                className="w-full"
                title="Notebook corner"
                subtitle="Drop takeaways, follow-ups, or questions before you dive into the dashboards."
                accentEmoji="🗒️"
                storageKey="work-notes"
                placeholder="Summarize what stood out or actions to loop back on..."
                quickTemplates={notebookTemplates}
              />
            </div>
            <div className="flex-1 md:flex-[0_0_300px] xl:flex-[0_0_340px] rounded-3xl border-2 border-dashed border-indigo-200 bg-white/85 p-6 shadow-sm">
              <h3 className={`text-lg text-indigo-700 mb-3 ${handwrittenFont}`}>Key angles</h3>
              <p className={`text-sm text-gray-700 leading-relaxed mb-4 ${handwrittenFont}`}>
                Use these quick reminders to underline Arun&apos;s mix of AI product thinking, UX craft, and cloud delivery.
              </p>
              <ul className={`space-y-2 text-sm text-gray-700 ${handwrittenFont}`}>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">✧</span>
                  <span>Say he ships AI-powered journeys like HP Print AI and still owns the UX loop end to end.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">✧</span>
                  <span>Mention his cloud fluency—tying Spring Boot, Node, and Next.js to ship live flows.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">✧</span>
                  <span>Frame him as a creative developer who prototypes, instruments, and ships without losing polish.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">✧</span>
                  <span>Underline the generalist streak—he jumps from stakeholder maps to analytics readouts to keep momentum.</span>
                </li>
              </ul>
              <div className={`mt-6 grid grid-cols-1 gap-2 text-[11px] text-indigo-600 uppercase tracking-[0.18em] ${handwrittenFont}`}>
                <div className="flex justify-between rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-2">
                  <span>Core focus</span>
                  <span className="text-indigo-700">AI × UX × Cloud</span>
                </div>
                <div className="flex justify-between rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-2">
                  <span>Role cue</span>
                  <span className="text-indigo-700">Creative generalist</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Constellation Skills */}
      <motion.div
        id="impact-dash"
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

      {/* Involvement Section */}
      <div id="community-notes">
        <InvolvementSection involvementData={involvementEnhanced} />
      </div>
    </main>
  );
}
