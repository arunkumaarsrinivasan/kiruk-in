'use client'

import { useEffect, useMemo, useState, useId, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

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

type ProgressDataResponse = {
  source?: 'notion'
  lifeGoals?: LifeGoal[]
  bucketList?: BucketListItem[]
  monthlyGoals?: MonthlyGoal[]
  fetchedAt?: string
}

type ChartPoint = {
  label: string
  value: number
  secondary?: number
  detail?: string
  meta?: string
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
  const roughFilterId = `${gradientId}-rough`
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

  const roughPath = useMemo(() => {
    if (coordinates.length === 0) return ''
    return coordinates
      .map((point, index) => {
        const jitterX = point.x + Math.cos(index * 1.75) * 0.8
        const jitterY = point.y + Math.sin(index * 1.25) * 1.35
        return `${index === 0 ? 'M' : 'L'} ${jitterX.toFixed(2)} ${jitterY.toFixed(2)}`
      })
      .join(' ')
  }, [coordinates])

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-500 handwritten">
        No data available yet. Sync your trackers to populate the graph.
      </div>
    )
  }

  const areaPath = coordinates.length
    ? `M ${coordinates[0].x} ${height} L ${coordinates
        .map((point) => `${point.x} ${point.y}`)
        .join(' L ')} L ${coordinates[coordinates.length - 1].x} ${height} Z`
    : ''
  const pencilStroke = '#1f2937'

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
          <filter id={roughFilterId} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        {roughPath && (
          <>
            <path
              d={roughPath}
              fill="none"
              stroke={color}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.18}
            />
            <path
              d={roughPath}
              fill="none"
              stroke={pencilStroke}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${roughFilterId})`}
            />
          </>
        )}
        {coordinates.map((point, index) => (
          <g key={`${point.x}-${point.y}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={activeIndex === index ? 7 : 5}
              fill="#fff"
              stroke={pencilStroke}
              strokeWidth={1.5}
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
  onSelect?: (point: ChartPoint, index: number) => void
}

function BarChart({ data, color, onHover, activeIndex, onSelect }: BarChartProps) {
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
            onClick={() => onSelect?.(point, index)}
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)

  const [timelineView, setTimelineView] = useState<'dev' | 'monthly'>('dev')
  const [timelineHighlight, setTimelineHighlight] = useState<number | null>(null)
  const [barHighlight, setBarHighlight] = useState<number | null>(null)
  const [timelineSpan, setTimelineSpan] = useState(12)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [activeNotebook, setActiveNotebook] = useState<'lifeGoals' | 'bucketList' | 'monthlyGoals'>('lifeGoals')

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
        const progressResponse = await fetch('/api/progress-data')
        if (!progressResponse.ok) {
          const payload = (await progressResponse.json().catch(() => ({}))) as { message?: string }
          setLifeGoals([])
          setBucketList([])
          setMonthlyGoals([])
          setLastSyncedAt(null)
          setErrorMessage(payload.message ?? 'Unable to sync data from Notion')
        } else {
          const payload = (await progressResponse.json()) as ProgressDataResponse
          setLifeGoals(payload.lifeGoals ?? [])
          setBucketList(payload.bucketList ?? [])
          setMonthlyGoals(payload.monthlyGoals ?? [])
          setLastSyncedAt(payload.fetchedAt ?? new Date().toISOString())
          setErrorMessage(null)
        }
      } catch (error) {
        console.error('Unified progress fetch failed', error)
        setDevCommits([])
          setLifeGoals([])
          setBucketList([])
          setMonthlyGoals([])
        setLastSyncedAt(null)
        setErrorMessage('Unable to load progress data right now')
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
        detail: `${matching.length} goals`,
        meta: status
      }
    })
  }, [lifeGoals])

  const lifeGoalsByStatus = useMemo(() => {
    return lifeGoals.reduce<Record<string, LifeGoal[]>>((accumulator, goal) => {
      const key = goal.status || 'pending'
      if (!accumulator[key]) {
        accumulator[key] = []
      }
      accumulator[key].push(goal)
      return accumulator
    }, {})
  }, [lifeGoals])

  useEffect(() => {
    if (selectedStatus) return
    const preferred = lifeGoalBars.find((point) => point.meta === 'in_progress')?.meta
    const fallback = lifeGoalBars.find((point) => (lifeGoalsByStatus[point.meta ?? ''] ?? []).length > 0)?.meta
    const nextStatus = preferred ?? fallback ?? null
    if (nextStatus) {
      setSelectedStatus(nextStatus)
    }
  }, [lifeGoalBars, lifeGoalsByStatus, selectedStatus])

  const selectedStatusIndex = useMemo(() => {
    if (!selectedStatus) return -1
    return lifeGoalBars.findIndex((point) => point.meta === selectedStatus)
  }, [lifeGoalBars, selectedStatus])

  const selectedGoals = useMemo(() => {
    if (!selectedStatus) return []
    const goals = lifeGoalsByStatus[selectedStatus] ?? []
    return goals
      .slice()
      .sort((a, b) => {
        const progressDelta = (b.progress ?? 0) - (a.progress ?? 0)
        if (progressDelta !== 0) return progressDelta
        const targetA = a.targetDate ? new Date(a.targetDate).getTime() : Number.POSITIVE_INFINITY
        const targetB = b.targetDate ? new Date(b.targetDate).getTime() : Number.POSITIVE_INFINITY
        return targetA - targetB
      })
      .slice(0, 4)
  }, [lifeGoalsByStatus, selectedStatus])

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
  const trimmedTimelineData = useMemo(() => {
    const safeSpan = Math.max(2, timelineSpan)
    return timelineData.slice(-safeSpan)
  }, [timelineData, timelineSpan])

  const timelineHeadline = useMemo(() => {
    if (trimmedTimelineData.length === 0) {
      return 'Awaiting data sync'
    }
    if (timelineView === 'dev') {
      const totalCommits = trimmedTimelineData.reduce((total, item) => total + item.value, 0)
      return `${totalCommits} commits logged`
    }
    const averageCompletion = Math.round(
      trimmedTimelineData.reduce((total, item) => total + item.value, 0) / Math.max(trimmedTimelineData.length, 1)
    )
    return `${averageCompletion}% average completion`
  }, [trimmedTimelineData, timelineView])

  const activePoint = timelineHighlight != null ? trimmedTimelineData[timelineHighlight] : null

  useEffect(() => {
    setTimelineHighlight((current) => {
      if (current == null) return null
      if (current >= trimmedTimelineData.length) {
        return trimmedTimelineData.length > 0 ? trimmedTimelineData.length - 1 : null
      }
      return current
    })
  }, [trimmedTimelineData])
  const activeBarPoint = useMemo(() => {
    if (barHighlight != null) {
      return lifeGoalBars[barHighlight] ?? null
    }
    if (selectedStatusIndex >= 0) {
      return lifeGoalBars[selectedStatusIndex] ?? null
    }
    return null
  }, [barHighlight, lifeGoalBars, selectedStatusIndex])

  const lifeGoalsCatalog = useMemo(() => {
    return lifeGoals
      .slice()
      .sort((a, b) => {
        const statusOrder = ['in_progress', 'pending', 'completed']
        const rankA = (() => {
          const index = statusOrder.indexOf(a.status)
          return index === -1 ? statusOrder.length : index
        })()
        const rankB = (() => {
          const index = statusOrder.indexOf(b.status)
          return index === -1 ? statusOrder.length : index
        })()
        const statusDelta = rankA - rankB
        if (statusDelta !== 0) return statusDelta
        return (b.progress ?? 0) - (a.progress ?? 0)
      })
  }, [lifeGoals])

  const bucketListCatalog = useMemo(() => {
    return bucketList
      .slice()
      .sort((a, b) => {
        const statusOrder = ['in_progress', 'dream', 'completed']
        const rankA = (() => {
          const index = statusOrder.indexOf(a.status)
          return index === -1 ? statusOrder.length : index
        })()
        const rankB = (() => {
          const index = statusOrder.indexOf(b.status)
          return index === -1 ? statusOrder.length : index
        })()
        const statusDelta = rankA - rankB
        if (statusDelta !== 0) return statusDelta
        const dateA = a.targetDate ? new Date(a.targetDate).getTime() : Number.POSITIVE_INFINITY
        const dateB = b.targetDate ? new Date(b.targetDate).getTime() : Number.POSITIVE_INFINITY
        return dateA - dateB
      })
  }, [bucketList])

  const monthlyCatalog = useMemo(() => {
    return monthlyGoals
      .slice()
      .sort((a, b) => new Date(b.year, b.month - 1).getTime() - new Date(a.year, a.month - 1).getTime())
  }, [monthlyGoals])

  const categoryProgress = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>()
    lifeGoals.forEach((goal) => {
      const key = goal.category || 'Uncategorized'
      const entry = map.get(key) ?? { total: 0, count: 0 }
      entry.total += goal.progress ?? 0
      entry.count += 1
      map.set(key, entry)
    })
    return Array.from(map.entries())
      .map(([category, stats]) => ({
        category,
        average: Math.round(stats.total / Math.max(stats.count, 1)),
        count: stats.count
      }))
      .sort((a, b) => b.average - a.average)
  }, [lifeGoals])

  const priorityDeck = useMemo(() => {
    if (!lifeGoals.length) return []
    const rankMap: Record<string, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3
    }
    return lifeGoals
      .slice()
      .filter((goal) => goal.status !== 'completed')
      .sort((a, b) => {
        const rankA = rankMap[a.priority?.toLowerCase() ?? ''] ?? 4
        const rankB = rankMap[b.priority?.toLowerCase() ?? ''] ?? 4
        if (rankA !== rankB) return rankA - rankB
        return (b.progress ?? 0) - (a.progress ?? 0)
      })
      .slice(0, 4)
  }, [lifeGoals])

  const tagHighlights = useMemo(() => {
    const counts = new Map<string, number>()
    const register = (tag?: string) => {
      if (!tag) return
      const key = tag.trim()
      if (!key) return
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    lifeGoals.forEach((goal) => goal.tags?.forEach(register))
    bucketList.forEach((item) => item.tags?.forEach(register))
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [lifeGoals, bucketList])

  const adventureSchedule = useMemo(() => {
    return bucketList
      .filter((item) => item.targetDate)
      .slice()
      .sort((a, b) => new Date(a.targetDate ?? '').getTime() - new Date(b.targetDate ?? '').getTime())
      .slice(0, 5)
  }, [bucketList])

  const monthlyHighlights = useMemo(() => {
    return monthlyGoals
      .slice()
      .sort((a, b) => new Date(b.year, b.month - 1).getTime() - new Date(a.year, a.month - 1).getTime())
      .slice(0, 3)
      .map((entry) => {
        const total = entry.goals.length || 1
        const done = entry.goals.filter((goal) => goal.completed).length
        const achievements = Array.isArray(entry.achievements) ? entry.achievements : []
        return {
          id: entry._id,
          title: entry.title || `${entry.month}/${entry.year}`,
          completion: Math.round((done / total) * 100),
          wins: achievements.slice(0, 2).map((win) => {
            if (!win) return { label: '' }
            if (typeof win === 'string') return { label: win }
            if (typeof win === 'object') {
              const label = win.achievement || win.title || win.name || ''
              const detail = win.note || win.detail || win.description || ''
              return { label, detail }
            }
            return { label: '' }
          })
        }
      })
  }, [monthlyGoals])

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
          {errorMessage ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-red-500 handwritten">
              {errorMessage}
            </div>
          ) : (
            <div className="mt-6 flex justify-center">
              <span className="handwritten text-xs uppercase tracking-[0.35em] text-gray-500 rounded-full border border-dashed border-gray-300 px-4 py-1 bg-white/60">
                Synced from Notion{lastSyncedAt ? ` · ${new Date(lastSyncedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ''}
              </span>
            </div>
          )}
        </motion.header>

        <div className="mt-16">
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
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 handwritten">
              <label htmlFor="timeline-span" className="uppercase tracking-[0.25em]">
                Window · {Math.max(2, timelineSpan)} points
              </label>
              <input
                id="timeline-span"
                type="range"
                min={4}
                max={24}
                value={timelineSpan}
                onChange={(event) => setTimelineSpan(Number(event.target.value))}
                className="h-1 w-40 cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-500"
              />
            </div>
            <LineChart
              data={trimmedTimelineData}
              color={timelineColor}
              onHover={(point, index) => {
                setTimelineHighlight(index ?? null)
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

        <ChartCard
          title="Notion boards"
          description="Glide through the original databases pulled straight from Notion. Each tab surfaces a different playbook."
          accentColor="bg-sky-50"
          className="mt-12"
        >
          <div className="flex flex-wrap items-center gap-3">
            {[
              { key: 'lifeGoals', label: 'Life goals', icon: '🎯' },
              { key: 'bucketList', label: 'Bucket list', icon: '🗺️' },
              { key: 'monthlyGoals', label: 'Monthly goals', icon: '🗓️' }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveNotebook(tab.key as typeof activeNotebook)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition handwritten ${
                  activeNotebook === tab.key
                    ? 'border-sky-500 bg-sky-500 text-white shadow-sm'
                    : 'border-sky-200 bg-white/80 text-gray-700 hover:bg-sky-100/70'
                }`}
              >
                <span aria-hidden>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNotebook}
              className="mt-6 space-y-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              {activeNotebook === 'lifeGoals' && (
                lifeGoalsCatalog.length > 0 ? (
                  <ul className="space-y-3">
                    {lifeGoalsCatalog.slice(0, 6).map((goal) => (
                      <li
                        key={goal._id}
                        className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-white/90 px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between"
                      >
                        <div className="space-y-2">
                          <p className="handwritten text-lg text-gray-900">{goal.title}</p>
                          {goal.description && (
                            <p className="handwritten text-sm text-gray-600 max-w-xl">{goal.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gray-500 handwritten">
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">{goal.status.replace('_', ' ')}</span>
                            {goal.priority && (
                              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">Priority · {goal.priority}</span>
                            )}
                            {goal.tags?.slice(0, 3).map((tag) => (
                              <span key={tag} className="rounded-full border border-emerald-200 px-2 py-1 text-emerald-500">
                                #{tag.toLowerCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-end gap-4 self-end md:self-auto">
                          <div className="text-right">
                            <p className="handwritten text-xs uppercase tracking-[0.3em] text-gray-500">Progress</p>
                            <p className="handwritten text-xl text-emerald-600">{goal.progress ?? 0}%</p>
                          </div>
                          {goal.targetDate && (
                            <div className="text-right">
                              <p className="handwritten text-xs uppercase tracking-[0.3em] text-gray-500">Target</p>
                              <p className="handwritten text-sm text-gray-700">{formatDate(goal.targetDate)}</p>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="handwritten text-sm text-gray-500">Log life goals in Notion to populate this stream.</p>
                )
              )}

              {activeNotebook === 'bucketList' && (
                bucketListCatalog.length > 0 ? (
                  <ul className="grid gap-3 md:grid-cols-2">
                    {bucketListCatalog.slice(0, 6).map((item) => (
                      <li
                        key={item._id}
                        className="flex h-full flex-col gap-3 rounded-xl border border-orange-200 bg-white/90 px-4 py-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <p className="handwritten text-lg text-gray-900">{item.title}</p>
                          <span className={`handwritten text-xs uppercase tracking-[0.3em] ${
                            item.status === 'completed'
                              ? 'text-orange-700'
                              : item.status === 'in_progress'
                                ? 'text-orange-500'
                                : 'text-orange-300'
                          }`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </div>
                        {item.description && (
                          <p className="handwritten text-sm text-gray-600 flex-1">{item.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.25em] text-gray-500 handwritten">
                          {item.location && (
                            <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-orange-600">📍 {item.location}</span>
                          )}
                          {typeof item.estimatedCost === 'number' && (
                            <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-orange-600">
                              Budget · {item.estimatedCost.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                            </span>
                          )}
                          {item.targetDate && (
                            <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-orange-600">Due {formatDate(item.targetDate)}</span>
                          )}
                        </div>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-orange-400 handwritten">
                            {item.tags.slice(0, 4).map((tag) => (
                              <span key={tag} className="rounded-full border border-orange-100 px-2 py-1">
                                #{tag.toLowerCase()}
                              </span>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="handwritten text-sm text-gray-500">Dream up adventures inside your Notion bucket list to see them here.</p>
                )
              )}

              {activeNotebook === 'monthlyGoals' && (
                monthlyCatalog.length > 0 ? (
                  <ul className="space-y-3">
                    {monthlyCatalog.slice(0, 4).map((entry) => {
                      const total = entry.goals.length || 1
                      const done = entry.goals.filter((goal) => goal.completed).length
                      const percent = Math.round((done / total) * 100)
                      return (
                        <li
                          key={entry._id}
                          className="rounded-xl border border-purple-200 bg-white/90 px-4 py-4 shadow-sm"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="handwritten text-lg text-gray-900">{entry.title || `Month ${entry.month}/${entry.year}`}</p>
                              {entry.description && (
                                <p className="handwritten text-sm text-gray-600 max-w-xl">{entry.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="handwritten text-xs uppercase tracking-[0.3em] text-gray-500">Completion</p>
                              <p className="handwritten text-xl text-purple-600">{percent}%</p>
                            </div>
                          </div>
                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div className="rounded-lg border border-purple-100 bg-purple-50/70 px-3 py-3">
                              <p className="handwritten text-xs uppercase tracking-[0.3em] text-purple-500">Goals checklist</p>
                              <ul className="mt-2 space-y-1 text-xs handwritten text-gray-700">
                                {entry.goals.slice(0, 4).map((goal, index) => (
                                  <li key={`${entry._id}-goal-${index}`} className="flex items-center gap-2">
                                    <span aria-hidden>{goal.completed ? '✅' : '⬜️'}</span>
                                    <span>{goal.goal}</span>
                                  </li>
                                ))}
                                {entry.goals.length > 4 && (
                                  <li className="text-[11px] uppercase tracking-[0.25em] text-purple-400">+{entry.goals.length - 4} more</li>
                                )}
                              </ul>
                            </div>
                            <div className="rounded-lg border border-purple-100 bg-white px-3 py-3">
                              <p className="handwritten text-xs uppercase tracking-[0.3em] text-purple-500">Wins</p>
                              {entry.achievements.length > 0 ? (
                                <ul className="mt-2 space-y-1 text-xs handwritten text-gray-700">
                                  {entry.achievements.slice(0, 3).map((achievement, index) => (
                                    <li key={`${entry._id}-win-${index}`}>{achievement.achievement}{achievement.note ? ` — ${achievement.note}` : ''}</li>
                                  ))}
                                  {entry.achievements.length > 3 && (
                                    <li className="text-[11px] uppercase tracking-[0.25em] text-purple-400">+{entry.achievements.length - 3} more</li>
                                  )}
                                </ul>
                              ) : (
                                <p className="mt-2 text-xs text-gray-400 handwritten">Log wins in Notion to celebrate them here.</p>
                              )}
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="handwritten text-sm text-gray-500">Your monthly cadence will appear once the Notion board has entries.</p>
                )
              )}
            </motion.div>
          </AnimatePresence>
        </ChartCard>

        <ChartCard
          title="Goal strategy"
          description="Where energy is flowing right now. Categories, priorities, and themes pulled from the Notion boards."
          accentColor="bg-violet-50"
        >
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="handwritten text-xs uppercase tracking-[0.3em] text-violet-500">Category momentum</p>
              {categoryProgress.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {categoryProgress.slice(0, 5).map((category) => (
                    <li key={category.category}>
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-gray-500 handwritten">
                        <span>{category.category}</span>
                        <span>{category.average}% · {category.count} goals</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-violet-100">
                        <div
                          className="h-full rounded-full bg-violet-500"
                          style={{ width: `${category.average}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-gray-400 handwritten">Categorize life goals in Notion to see momentum here.</p>
              )}
            </div>
            <div>
              <p className="handwritten text-xs uppercase tracking-[0.3em] text-violet-500">Priority deck</p>
              {priorityDeck.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {priorityDeck.map((goal) => (
                    <li key={goal._id} className="flex items-center justify-between gap-3 rounded-xl border border-violet-200 bg-white/90 px-4 py-3 shadow-sm">
                      <div>
                        <p className="handwritten text-sm text-gray-900">{goal.title}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gray-500 handwritten mt-1">
                          {goal.priority && <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-violet-600">{goal.priority}</span>}
                          <span className="rounded-full border border-violet-200 bg-white px-2 py-1 text-violet-600">{goal.status?.split('_').join(' ') ?? 'unspecified'}</span>
                          {goal.targetDate && <span className="rounded-full border border-violet-200 bg-white px-2 py-1 text-violet-600">Due {formatDate(goal.targetDate)}</span>}
                        </div>
                      </div>
                      <span className="handwritten text-lg text-violet-600">{goal.progress ?? 0}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-gray-400 handwritten">Flag priorities in Notion to auto-build this list.</p>
              )}
            </div>
          </div>
          {tagHighlights.length > 0 && (
            <div className="mt-6">
              <p className="handwritten text-xs uppercase tracking-[0.3em] text-violet-500">Recurring themes</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] handwritten">
                {tagHighlights.map((tag) => (
                  <span key={tag.tag} className="rounded-full border border-violet-200 bg-white px-3 py-1 text-violet-600">
                    #{tag.tag.toLowerCase()} · {tag.count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Adventure timeline"
          description="Upcoming experiences from the bucket list with the soonest dates surfaced first."
          accentColor="bg-orange-50"
        >
          {adventureSchedule.length > 0 ? (
            <ul className="space-y-4">
              {adventureSchedule.map((item, index) => (
                <li key={item._id} className="relative flex flex-col gap-2 rounded-xl border border-orange-200 bg-white/90 px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="handwritten text-lg text-orange-500">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="handwritten text-base text-gray-900">{item.title}</p>
                      {item.location && <p className="handwritten text-xs uppercase tracking-[0.3em] text-orange-400 mt-1">{item.location}</p>}
                      {item.description && <p className="handwritten text-sm text-gray-600 mt-1 max-w-xl">{item.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {item.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="handwritten text-xs uppercase tracking-[0.3em] text-orange-500 border border-orange-200 bg-orange-50 px-3 py-1 rounded-full">
                        #{tag.toLowerCase()}
                      </span>
                    ))}
                    {item.targetDate && (
                      <div className="text-right">
                        <p className="handwritten text-xs uppercase tracking-[0.3em] text-gray-500">Target date</p>
                        <p className="handwritten text-lg text-orange-600">{formatDate(item.targetDate)}</p>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="handwritten text-sm text-gray-500">Add target dates to bucket list items in Notion to populate the timeline.</p>
          )}
        </ChartCard>

        <ChartCard
          title="Monthly cadence"
          description="Quick read on the latest Notion review cycles—completion percentage and headline wins."
          accentColor="bg-purple-50"
        >
          {monthlyHighlights.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {monthlyHighlights.map((highlight) => (
                <div key={highlight.id} className="rounded-xl border border-purple-200 bg-white/90 px-4 py-4 shadow-sm">
                  <p className="handwritten text-xs uppercase tracking-[0.3em] text-purple-400">Snapshot</p>
                  <p className="handwritten text-lg text-gray-900 mt-1">{highlight.title}</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-gray-500 handwritten">
                      <span>Completion</span>
                      <span>{highlight.completion}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-purple-100">
                      <div className="h-full rounded-full bg-purple-500" style={{ width: `${highlight.completion}%` }} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="handwritten text-xs uppercase tracking-[0.3em] text-purple-400">Wins</p>
                    {highlight.wins.some((win) => win.label) ? (
                      <ul className="mt-2 space-y-1 text-xs handwritten text-gray-700">
                        {highlight.wins.map((win, index) => (
                          <li key={`${highlight.id}-win-${index}`}>
                            {win.label}
                            {win.detail ? ` — ${win.detail}` : ''}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-xs text-gray-400 handwritten">Log wins in Notion to spotlight them here.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="handwritten text-sm text-gray-500">Monthly goal reviews from Notion will appear once data is available.</p>
          )}
        </ChartCard>

      </div>
    </main>
  )
}
