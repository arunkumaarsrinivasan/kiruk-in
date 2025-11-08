'use client'

import { useEffect, useMemo, useState, useId, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getLifeGoals, getBucketList, getMonthlyGoals } from '@/lib/sanity'

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  author: {
    login: string
    avatar_url: string
  }
  stats?: {
    additions: number
    deletions: number
    total: number
  }
}

interface LifeGoal {
  _id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  progress: number
  targetDate?: string
  tags?: string[]
}

interface BucketListItem {
  _id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  targetDate?: string
  location?: string
  estimatedCost?: number
  tags?: string[]
}

interface MonthlyGoal {
  _id: string
  title: string
  description: string
  month: number
  year: number
  category: string
  status: string
  progress: number
  goals: Array<{
    goal: string
    completed: boolean
    note?: string
  }>
  achievements: Array<{
    achievement: string
    date?: string
    note?: string
  }>
}

type ChartPoint = {
  label: string
  value: number
  secondary?: number
  detail?: string
}

const graphPaperStyle: CSSProperties = {
  backgroundImage: `linear-gradient(to right, rgba(148,163,184,0.2) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(148,163,184,0.2) 1px, transparent 1px)` ,
  backgroundSize: '28px 28px'
}

type ChartCardProps = {
  title: string
  description: string
  accentColor: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

function ChartCard({ title, description, accentColor, children, footer, className }: ChartCardProps) {
  return (
    <motion.section
      className={`relative border border-gray-300 bg-white/90 shadow-lg backdrop-blur-sm ${className ?? ''}`}
      style={{ borderRadius: '18px' }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <span
        className="absolute -top-5 left-1/2 h-8 w-28 -translate-x-1/2 rotate-[-4deg] bg-white/70"
        style={{ borderRadius: '10px', border: '1px dashed rgba(148,163,184,0.35)' }}
      />
      <div className={`px-8 pt-12 pb-4 ${accentColor}`} style={{ borderRadius: '18px 18px 0 0' }}>
        <h2 className="handwritten text-3xl uppercase tracking-[0.35em] text-gray-900">{title}</h2>
        <p className="handwritten text-gray-600 mt-3 text-base max-w-2xl">{description}</p>
      </div>
      <div className="px-8 pb-8 pt-6">{children}</div>
      {footer && <div className="px-8 pb-8 -mt-4">{footer}</div>}
    </motion.section>
  )
}

type LineChartProps = {
  data: ChartPoint[]
  color: string
  onHover?: (point: ChartPoint | null, index: number | null) => void
  activeIndex?: number | null
}

function LineChart({ data, color, onHover, activeIndex }: LineChartProps) {
  const gradientId = useId()
  const width = 520
  const height = 200
  const paddingY = 24

  const coordinates = useMemo(() => {
    if (data.length === 0) return [] as Array<{ x: number; y: number }>
    const maxValue = Math.max(...data.map((point) => point.value), 1)
    const stepX = data.length > 1 ? width / (data.length - 1) : width
    return data.map((point, index) => {
      const x = stepX * index
      const y = height - ((point.value / maxValue) * (height - paddingY * 2) + paddingY)
      return { x, y }
    })
  }, [data, height, paddingY, width])

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-500 handwritten">
        No data available yet. Sync your trackers to populate the graph.
      </div>
    )
  }

  const linePoints = coordinates.map((point) => `${point.x},${point.y}`).join(' ')
  const areaPath = coordinates.length
    ? `M ${coordinates[0].x} ${height} L ${coordinates
        .map((point) => `${point.x} ${point.y}`)
        .join(' L ')} L ${coordinates[coordinates.length - 1].x} ${height} Z`
    : ''

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-56"
        onPointerLeave={() => onHover?.(null, null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <polyline
          points={linePoints}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coordinates.map((point, index) => (
          <g key={`${point.x}-${point.y}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={activeIndex === index ? 7 : 5}
              fill="#fff"
              stroke={color}
              strokeWidth={2}
              onPointerEnter={() => onHover?.(data[index], index)}
              className="cursor-pointer transition-transform"
            />
            <text
              x={point.x}
              y={height - 6}
              textAnchor="middle"
              className="fill-gray-500 text-[10px]"
            >
              {data[index].label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

type BarChartProps = {
  data: ChartPoint[]
  color: string
  onHover?: (point: ChartPoint | null, index: number | null) => void
  activeIndex?: number | null
}

function BarChart({ data, color, onHover, activeIndex }: BarChartProps) {
  const maxValue = Math.max(...data.map((point) => point.value), 1)

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-500 handwritten">
        Nothing tracked yet. Add goals to see them charted here.
      </div>
    )
  }

  return (
    <div className="h-56 flex items-end justify-between gap-4">
      {data.map((point, index) => {
        const heightPercent = (point.value / maxValue) * 100
        return (
          <button
            key={point.label}
            type="button"
            className="group flex-1 flex flex-col items-center gap-2 focus:outline-none"
            onPointerEnter={() => onHover?.(point, index)}
            onPointerLeave={() => onHover?.(null, null)}
          >
            <div className="relative w-full bg-gray-100/60 border border-dashed border-gray-300 rounded-sm pt-2">
              <div className="absolute inset-x-1 bottom-1 rounded-sm" style={{ height: `${heightPercent}%`, backgroundColor: color, opacity: activeIndex === index ? 0.95 : 0.75 }} />
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-600 handwritten opacity-0 group-hover:opacity-100 transition">
                {point.value}%
              </span>
            </div>
            <span className="text-xs text-gray-700 handwritten uppercase tracking-[0.25em] text-center">
              {point.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

type RadialChartProps = {
  value: number
  label: string
  accentColor: string
}

function RadialChart({ value, label, accentColor }: RadialChartProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100)
  const dashArray = 2 * Math.PI * 38
  const dashOffset = dashArray - (normalizedValue / 100) * dashArray

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        <circle cx="50" cy="50" r="38" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke={accentColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          fill="transparent"
        />
        <text x="50" y="54" textAnchor="middle" className="text-[18px] font-semibold fill-gray-800">
          {normalizedValue}%
        </text>
      </svg>
      <span className="mt-2 text-xs uppercase tracking-[0.3em] text-gray-600 handwritten text-center">
        {label}
      </span>
    </div>
  )
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

export default function UnifiedProgress() {
  const [devCommits, setDevCommits] = useState<GitHubCommit[]>([])
  const [lifeGoals, setLifeGoals] = useState<LifeGoal[]>([])
  const [bucketList, setBucketList] = useState<BucketListItem[]>([])
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>([])
  const [loading, setLoading] = useState(true)

  const [timelineView, setTimelineView] = useState<'dev' | 'monthly'>('dev')
  const [timelineHighlight, setTimelineHighlight] = useState<number | null>(null)
  const [barHighlight, setBarHighlight] = useState<number | null>(null)

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      try {
        const devResponse = await fetch('/api/github?endpoint=commits&limit=40')
        if (devResponse.ok) {
          const responseData = await devResponse.json()
          const devData = responseData.data || responseData
          if (Array.isArray(devData)) {
            setDevCommits(devData.slice(0, 40))
          } else {
            setDevCommits([])
          }
        } else {
          setDevCommits([])
        }

        if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'your-project-id') {
          try {
            const [goals, bucket, monthly] = await Promise.all([
              getLifeGoals(),
              getBucketList(),
              getMonthlyGoals()
            ])

            setLifeGoals(goals || [])
            setBucketList(bucket || [])
            setMonthlyGoals(monthly || [])
          } catch (sanityError) {
            setLifeGoals([])
            setBucketList([])
            setMonthlyGoals([])
          }
        }
      } catch (error) {
        setDevCommits([])
      }
      setLoading(false)
    }

    fetchAllData()
  }, [])

  const commitTimeline = useMemo<ChartPoint[]>(() => {
    const dayMap = new Map<string, { count: number; additions: number; deletions: number }>()
    devCommits.forEach((commit) => {
      const day = new Date(commit.commit.author.date)
      const key = day.toISOString().slice(0, 10)
      const entry = dayMap.get(key) ?? { count: 0, additions: 0, deletions: 0 }
      entry.count += 1
      entry.additions += commit.stats?.additions ?? 0
      entry.deletions += commit.stats?.deletions ?? 0
      dayMap.set(key, entry)
    })

    return Array.from(dayMap.entries())
      .sort(([isoA], [isoB]) => isoA.localeCompare(isoB))
      .map(([iso, stats]) => ({
        label: formatDate(iso),
        value: stats.count,
        secondary: stats.additions,
        detail: `${stats.additions} additions • ${stats.deletions} deletions`
      }))
      .slice(-12)
  }, [devCommits])

  const velocityTimeline = useMemo<ChartPoint[]>(() => {
    return monthlyGoals
      .slice()
      .sort((a, b) => new Date(a.year, a.month - 1).getTime() - new Date(b.year, b.month - 1).getTime())
      .map((entry) => {
        const total = entry.goals.length || 1
        const completed = entry.goals.filter((goal) => goal.completed).length
        const completion = Math.round((completed / total) * 100)
        return {
          label: `${entry.month}/${entry.year.toString().slice(-2)}`,
          value: completion,
          detail: `${completed} of ${total} goals` }
      })
      .slice(-12)
  }, [monthlyGoals])

  const lifeGoalBars = useMemo<ChartPoint[]>(() => {
    const buckets = ['completed', 'in_progress', 'pending']
    return buckets.map((status) => {
      const matching = lifeGoals.filter((goal) => goal.status === status)
      const average = matching.length
        ? Math.round(matching.reduce((total, goal) => total + (goal.progress ?? 0), 0) / matching.length)
        : 0
      return {
        label: status.replace('_', ' '),
        value: average,
        detail: `${matching.length} goals` }
    })
  }, [lifeGoals])

  const bucketProgress = useMemo(() => {
    const totals = bucketList.length
    const completed = bucketList.filter((item) => item.status === 'completed').length
    const active = bucketList.filter((item) => item.status === 'in_progress').length
    const dream = totals - completed - active

    return {
      completedPercent: totals ? Math.round((completed / totals) * 100) : 0,
      activePercent: totals ? Math.round((active / totals) * 100) : 0,
      dreamPercent: totals ? Math.round((dream / totals) * 100) : 0,
      totals,
      completed,
      active,
      dream
    }
  }, [bucketList])

  const timelineData = timelineView === 'dev' ? commitTimeline : velocityTimeline
  const timelineColor = timelineView === 'dev' ? '#3b82f6' : '#a855f7'

  const timelineHeadline = useMemo(() => {
    if (timelineData.length === 0) {
      return 'Awaiting data sync'
    }
    if (timelineView === 'dev') {
      const totalCommits = commitTimeline.reduce((total, item) => total + item.value, 0)
      return `${totalCommits} commits logged` }
    const averageCompletion = Math.round(
      velocityTimeline.reduce((total, item) => total + item.value, 0) / Math.max(velocityTimeline.length, 1)
    )
    return `${averageCompletion}% average completion`
  }, [timelineData, timelineView, commitTimeline, velocityTimeline])

  const activePoint = timelineHighlight != null ? timelineData[timelineHighlight] : null
  const activeBarPoint = barHighlight != null ? lifeGoalBars[barHighlight] : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={graphPaperStyle}>
        <div className="px-8 py-6 border border-gray-300 bg-white/80 shadow-lg rounded-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800 mx-auto mb-4" />
          <p className="handwritten text-gray-700 text-sm">Syncing progress trackers…</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen py-24" style={graphPaperStyle}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.header
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >

          <h1 className="mt-6 text-5xl magnetic-font tracking-tight text-gray-900">
            Progress Observatory
          </h1>
          <p className="mt-4 text-base text-gray-600 handwritten max-w-3xl mx-auto">
            A live board of my product experiments, life goals, and dream adventures—all plotted onto graph paper so we can see patterns at a glance.
          </p>
        </motion.header>

        <div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1.1fr)]">
          <ChartCard
            title="Trajectory"
            description="Switch between build velocity and life cadence to inspect momentum over time. Hover any node for more detail."
            accentColor="bg-blue-50"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTimelineView('dev')}
                  className={`handwritten text-xs uppercase tracking-[0.3em] px-4 py-2 border border-gray-300 rounded-full transition ${
                    timelineView === 'dev' ? 'bg-blue-500 text-white' : 'bg-white/80 text-gray-700 hover:bg-blue-100/60'
                  }`}
                >
                  Dev Velocity
                </button>
                <button
                  type="button"
                  onClick={() => setTimelineView('monthly')}
                  className={`handwritten text-xs uppercase tracking-[0.3em] px-4 py-2 border border-gray-300 rounded-full transition ${
                    timelineView === 'monthly' ? 'bg-purple-500 text-white' : 'bg-white/80 text-gray-700 hover:bg-purple-100/60'
                  }`}
                >
                  Monthly Cadence
                </button>
              </div>
              <span className="handwritten text-sm text-gray-600">{timelineHeadline}</span>
            </div>
            <LineChart
              data={timelineData}
              color={timelineColor}
              onHover={(point, index) => {
                setTimelineHighlight(index)
              }}
              activeIndex={timelineHighlight}
            />
            <AnimatePresence>
              {activePoint && (
                <motion.div
                  className="mt-6 rounded-lg border border-gray-200 bg-white/90 px-5 py-4 flex items-center justify-between gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                >
                  <div>
                    <p className="handwritten text-xs uppercase tracking-[0.3em] text-gray-500">Focused node</p>
                    <p className="handwritten text-lg text-gray-900 mt-1">{activePoint.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-gray-900">{activePoint.value}</p>
                    {activePoint.detail && (
                      <p className="handwritten text-xs text-gray-500 mt-1">{activePoint.detail}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </ChartCard>

          <ChartCard
            title="Signals"
            description="Snapshot metrics from this week across code, goals, and adventures."
            accentColor="bg-amber-50"
            className="self-start"
          >
            <div className="grid gap-6">
              <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-300 bg-white/70 px-5 py-4">
                <div>
                  <p className="handwritten text-xs uppercase tracking-[0.3em] text-gray-500">Coding streak</p>
                  <p className="handwritten text-lg text-gray-900 mt-1">
                    {commitTimeline.length > 0 ? `${commitTimeline.slice(-5).reduce((total, point) => total + point.value, 0)} commits in 5 days` : 'Waiting for GitHub sync'}
                  </p>
                </div>
                <RadialChart value={commitTimeline.length ? Math.min(commitTimeline.slice(-5).reduce((total, point) => total + point.value, 0) * 10, 100) : 0} label="Momentum" accentColor="#3b82f6" />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-300 bg-white/70 px-5 py-4">
                <div>
                  <p className="handwritten text-xs uppercase tracking-[0.3em] text-gray-500">Life goals in motion</p>
                  <p className="handwritten text-lg text-gray-900 mt-1">{lifeGoals.filter((goal) => goal.status === 'in_progress').length} active • {lifeGoals.filter((goal) => goal.status === 'completed').length} done</p>
                </div>
                <RadialChart value={lifeGoalBars[0]?.value ?? 0} label="Avg progress" accentColor="#22c55e" />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-300 bg-white/70 px-5 py-4">
                <div>
                  <p className="handwritten text-xs uppercase tracking-[0.3em] text-gray-500">Bucket list momentum</p>
                  <p className="handwritten text-lg text-gray-900 mt-1">{bucketProgress.completed} complete • {bucketProgress.active} mapping</p>
                </div>
                <RadialChart value={bucketProgress.completedPercent} label="Done" accentColor="#fb923c" />
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <ChartCard
            title="Life goal cohorts"
            description="Average completion for each status. Hover a bar to show the cohort size."
            accentColor="bg-emerald-50"
          >
            <BarChart
              data={lifeGoalBars}
              color="#22c55e"
              onHover={(point, index) => {
                setBarHighlight(index)
              }}
              activeIndex={barHighlight}
            />
            <AnimatePresence>
              {activeBarPoint && (
                <motion.div
                  className="mt-6 rounded-lg border border-emerald-100 bg-white/90 px-4 py-3"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                >
                  <p className="handwritten text-xs uppercase tracking-[0.3em] text-emerald-600">{activeBarPoint.label}</p>
                  <p className="handwritten text-lg text-gray-900 mt-1">{activeBarPoint.detail}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </ChartCard>

          <ChartCard
            title="Adventure wheel"
            description="Dreams vs action. Quick rollup of the bucket list."
            accentColor="bg-orange-50"
          >
            <div className="relative flex flex-col items-center gap-8 md:flex-row md:justify-center">
              <RadialChart value={bucketProgress.completedPercent} label="Completed" accentColor="#fb923c" />
              <RadialChart value={bucketProgress.activePercent} label="In motion" accentColor="#f97316" />
              <RadialChart value={bucketProgress.dreamPercent} label="Dreaming" accentColor="#fed7aa" />
            </div>
            <p className="mt-6 text-center text-sm text-gray-600 handwritten">
              {bucketProgress.totals > 0
                ? `${bucketProgress.totals} adventures mapped • ${bucketProgress.completedPercent}% already lived`
                : 'Start logging adventures to plot them here'}
            </p>
          </ChartCard>
        </div>

        <ChartCard
          title="Commit stream"
          description="Newest commits waterfall. Scroll horizontally to skim the diff notes."
          accentColor="bg-slate-50"
          className="mt-12"
        >
          {devCommits.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex min-w-full gap-4">
                {devCommits.slice(0, 12).map((commit, index) => (
                  <motion.div
                    key={commit.sha}
                    className="min-w-[220px] flex-shrink-0 border border-gray-200 bg-white/90 px-4 py-4 rounded-xl"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <p className="handwritten text-xs uppercase tracking-[0.3em] text-gray-500">{formatDate(commit.commit.author.date)}</p>
                    <p className="mt-3 text-sm text-gray-900 handwritten leading-relaxed">{commit.commit.message}</p>
                    <p className="mt-4 text-xs text-gray-500 handwritten">
                      {commit.commit.author.name}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-sm text-gray-500 handwritten">
              No commits to display yet.
            </div>
          )}
        </ChartCard>

      </div>
    </main>
  )
}
