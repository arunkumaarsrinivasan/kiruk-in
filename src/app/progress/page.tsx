'use client'

import { useEffect, useMemo, useState, useCallback, type CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { GridBackground } from '@/components/ui/GridBackground'
import { useContextBar } from '@/contexts/ContextBarContext'

// New Progress Components
import { LifeProgressCard } from '@/components/progress/LifeProgressCard'
import { BooksSection } from '@/components/progress/BooksSection'

const TravelMap = dynamic(
  () => import('@/components/progress/TravelMap').then((m) => ({ default: m.TravelMap })),
  { ssr: false, loading: () => <div className="min-h-[400px] flex items-center justify-center font-mono text-sm" style={{ color: 'var(--text-muted)' }}>Loading map...</div> }
)
import { GamesSection } from '@/components/progress/GamesSection'
import { TrekTimeline } from '@/components/progress/TrekTimeline'
import { MusicVibeSection } from '@/components/progress/MusicVibeSection'

// Data imports
import {
  getBookStats,
  getGameStats,
  getTravelStats,
  getTrekStats
} from '@/data/life-progress-data'

// Types for Notion data (keeping for Bucket List & Monthly Goals)
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

type ProgressDataResponse = {
  source?: 'notion'
  lifeGoals?: LifeGoal[]
  bucketList?: BucketListItem[]
  monthlyGoals?: MonthlyGoal[]
  fetchedAt?: string
}

const pageStyle: CSSProperties = {
  backgroundColor: 'var(--bg-main)',
  position: 'relative',
  overflow: 'hidden',
}

type SectionType = 'overview' | 'places' | 'reading' | 'gaming' | 'music' | 'treks' | 'goals'

export default function LifeProgressPage() {
  // Notion data state
  const [lifeGoals, setLifeGoals] = useState<LifeGoal[]>([])
  const [bucketList, setBucketList] = useState<BucketListItem[]>([])
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)

  // Active section for navigation
  const [activeSection, setActiveSection] = useState<SectionType>('overview')

  // Context bar integration
  const { setProgressData, setProgressSectionHandler } = useContextBar()

  // Stats from local data
  const bookStats = useMemo(() => getBookStats(), [])
  const gameStats = useMemo(() => getGameStats(), [])
  const travelStats = useMemo(() => getTravelStats(), [])
  const trekStats = useMemo(() => getTrekStats(), [])

  // Section navigation handler
  const handleSectionClick = useCallback((_section: 'monthly' | 'bucket' | 'goals') => {
    setActiveSection('goals')
    // Scroll to goals section
    const element = document.getElementById('goals-section')
    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }, [])

  // Register section handler with context bar
  useEffect(() => {
    if (setProgressSectionHandler) {
      setProgressSectionHandler(handleSectionClick)
    }
  }, [handleSectionClick, setProgressSectionHandler])

  // Update context bar with progress data
  useEffect(() => {
    if (loading) return

    const monthlyData = monthlyGoals
      .slice()
      .sort((a, b) => new Date(b.year, b.month - 1).getTime() - new Date(a.year, a.month - 1).getTime())
      .slice(0, 3)
      .map((entry) => {
        const total = entry.goals.length || 1
        const done = entry.goals.filter((goal) => goal.completed).length
        return {
          month: `${entry.year}-${String(entry.month).padStart(2, '0')}`,
          completion: Math.round((done / total) * 100),
        }
      })

    const bucketData = bucketList.slice(0, 5).map((item) => ({
      id: item._id,
      title: item.title,
      status: item.status,
    }))

    const goalsData = lifeGoals.slice(0, 5).map((goal) => ({
      id: goal._id,
      title: goal.title,
      priority: goal.priority,
    }))

    setProgressData({
      monthlyGoals: monthlyData,
      bucketList: bucketData,
      lifeGoals: goalsData,
      activeSection: 'goals',
    })
  }, [loading, monthlyGoals, bucketList, lifeGoals, setProgressData])

  // Fetch Notion data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
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
        console.error('Progress fetch failed', error)
        setLifeGoals([])
        setBucketList([])
        setMonthlyGoals([])
        setLastSyncedAt(null)
        setErrorMessage('Unable to load progress data right now')
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  // Section navigation items
  const sections: Array<{ id: SectionType; label: string; icon: string }> = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'places', label: 'Places', icon: '🗺️' },
    { id: 'reading', label: 'Reading', icon: '📚' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'treks', label: 'Treks', icon: '🥾' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative" style={pageStyle}>
        <GridBackground />
        <motion.div
          className="px-8 py-4 relative z-10"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: 'var(--border-width) solid var(--border-color)',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div
            className="animate-spin h-8 w-8 border-b-2 mx-auto mb-4"
            style={{ borderColor: 'var(--accent-color)' }}
          />
          <p className="font-mono text-sm" style={{ color: 'var(--accent-color)' }}>
            Loading Life Progress...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <main className="min-h-screen py-8 relative" style={pageStyle}>
      <GridBackground opacity={0.3} scanlinesOpacity={0.05} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Page Header */}
        <motion.div
          className="mt-8 mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className="text-4xl md:text-5xl font-mono font-bold mb-2"
            style={{ color: 'var(--text-main)' }}
          >
            Life Progress
          </h1>
          <p
            className="text-lg font-mono"
            style={{ color: 'var(--text-muted)' }}
          >
            Tracking the journey — places explored, books read, games played, and goals achieved.
          </p>
        </motion.div>

        {/* Section Navigation */}
        <motion.div
          className="mb-8 flex flex-wrap gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id)
                const element = document.getElementById(`${section.id}-section`)
                if (element) {
                  const headerOffset = 100
                  const elementPosition = element.getBoundingClientRect().top
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
                }
              }}
              className="px-4 py-2 font-mono text-sm transition-all"
              style={{
                backgroundColor: activeSection === section.id ? 'var(--accent-color)' : 'var(--bg-card)',
                color: activeSection === section.id ? 'white' : 'var(--text-main)',
                border: 'var(--border-width) solid var(--border-color)',
              }}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </motion.div>

        {/* Quick Stats Bar */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <QuickStat icon="📍" value={travelStats.totalLocations} label="Places" />
          <QuickStat icon="🗺️" value={travelStats.statesVisited} label="States" />
          <QuickStat icon="📚" value={bookStats.total} label="Books" />
          <QuickStat icon="🎮" value={gameStats.completed} label="Games Done" />
          <QuickStat icon="🥾" value={trekStats.totalTreks} label="Treks" />
          <QuickStat icon="⏱️" value={`${gameStats.totalHours}h`} label="Gaming" />
        </motion.div>

        {/* Main Content Sections */}
        <div className="space-y-12">
          {/* Life Progress Overview */}
          <motion.section
            id="overview-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <LifeProgressCard />
          </motion.section>

          {/* Travel Map */}
          <motion.section
            id="places-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <TravelMap />
          </motion.section>

          {/* Reading Section */}
          <motion.section
            id="reading-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <BooksSection />
          </motion.section>

          {/* Gaming Section */}
          <motion.section
            id="gaming-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <GamesSection />
          </motion.section>

          {/* Music Section */}
          <motion.section
            id="music-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <MusicVibeSection />
          </motion.section>

          {/* Treks Section */}
          <motion.section
            id="treks-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <TrekTimeline />
          </motion.section>

          {/* Goals Section (from Notion) */}
          <motion.section
            id="goals-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <GoalsSection
              lifeGoals={lifeGoals}
              bucketList={bucketList}
              monthlyGoals={monthlyGoals}
              errorMessage={errorMessage}
              lastSyncedAt={lastSyncedAt}
            />
          </motion.section>
        </div>

        {/* Sync Status */}
        {lastSyncedAt && !errorMessage && (
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <span
              className="font-mono text-xs uppercase tracking-wider px-4 py-2 inline-block"
              style={{
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}
            >
              Notion synced · {new Date(lastSyncedAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
              })}
            </span>
          </motion.div>
        )}
      </div>
    </main>
  )
}

// Quick Stat Component
function QuickStat({ icon, value, label }: { icon: string; value: number | string; label: string }) {
  return (
    <div
      className="p-4 text-center"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: 'var(--border-width) solid var(--border-color)',
      }}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div
        className="text-xl font-mono font-bold"
        style={{ color: 'var(--accent-color)' }}
      >
        {value}
      </div>
      <div
        className="text-xs font-mono uppercase"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </div>
    </div>
  )
}

// Goals Section (Notion Data)
function GoalsSection({
  lifeGoals,
  bucketList,
  monthlyGoals,
  errorMessage,
  lastSyncedAt: _lastSyncedAt,
}: {
  lifeGoals: LifeGoal[]
  bucketList: BucketListItem[]
  monthlyGoals: MonthlyGoal[]
  errorMessage: string | null
  lastSyncedAt: string | null
}) {
  const [activeTab, setActiveTab] = useState<'life' | 'bucket' | 'monthly'>('life')

  return (
    <div
      className="p-6"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: 'var(--border-width) solid var(--border-color)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎯</span>
          <div>
            <h2
              className="text-2xl font-mono uppercase tracking-wider"
              style={{ color: 'var(--text-main)' }}
            >
              Goals & Dreams
            </h2>
            <p
              className="text-sm font-mono mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Synced from Notion
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          className="mb-6 p-4 font-mono text-sm"
          style={{
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--accent-color)',
            color: 'var(--accent-color)',
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'life', label: 'Life Goals', count: lifeGoals.length },
          { id: 'bucket', label: 'Bucket List', count: bucketList.length },
          { id: 'monthly', label: 'Monthly', count: monthlyGoals.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="px-4 py-2 font-mono text-sm uppercase transition-all"
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--accent-color)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
              border: '1px solid var(--border-color)',
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {activeTab === 'life' && (
            <LifeGoalsList goals={lifeGoals} />
          )}
          {activeTab === 'bucket' && (
            <BucketListSection items={bucketList} />
          )}
          {activeTab === 'monthly' && (
            <MonthlyGoalsList goals={monthlyGoals} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Life Goals List
function LifeGoalsList({ goals }: { goals: LifeGoal[] }) {
  if (goals.length === 0) {
    return (
      <p className="font-mono text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
        No life goals yet. Add them in Notion to see them here.
      </p>
    )
  }

  const sortedGoals = [...goals].sort((a, b) => {
    const statusOrder = ['in_progress', 'pending', 'completed']
    const rankA = statusOrder.indexOf(a.status) === -1 ? statusOrder.length : statusOrder.indexOf(a.status)
    const rankB = statusOrder.indexOf(b.status) === -1 ? statusOrder.length : statusOrder.indexOf(b.status)
    if (rankA !== rankB) return rankA - rankB
    return (b.progress ?? 0) - (a.progress ?? 0)
  })

  return (
    <div className="space-y-3">
      {sortedGoals.slice(0, 8).map((goal) => (
        <div
          key={goal._id}
          className="p-4"
          style={{
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4
                className="font-mono font-bold"
                style={{
                  color: goal.status === 'completed' ? 'var(--text-muted)' : 'var(--text-main)',
                  textDecoration: goal.status === 'completed' ? 'line-through' : 'none',
                }}
              >
                {goal.title}
              </h4>
              {goal.description && (
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {goal.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {goal.category && (
                  <span
                    className="px-2 py-0.5 text-xs font-mono"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {goal.category}
                  </span>
                )}
                <span
                  className="px-2 py-0.5 text-xs font-mono uppercase"
                  style={{
                    backgroundColor: goal.status === 'completed' ? '#10B98120' : 'var(--accent-color)20',
                    color: goal.status === 'completed' ? '#10B981' : 'var(--accent-color)',
                  }}
                >
                  {goal.status?.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span
                className="text-2xl font-mono font-bold"
                style={{ color: 'var(--accent-color)' }}
              >
                {goal.progress ?? 0}%
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div
            className="mt-3 h-2"
            style={{ backgroundColor: 'var(--border-color)' }}
          >
            <div
              className="h-full transition-all"
              style={{
                backgroundColor: 'var(--accent-color)',
                width: `${goal.progress ?? 0}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Bucket List Section
function BucketListSection({ items }: { items: BucketListItem[] }) {
  if (items.length === 0) {
    return (
      <p className="font-mono text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
        No bucket list items yet. Dream up adventures in Notion!
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 8).map((item) => (
        <div
          key={item._id}
          className="p-4"
          style={{
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              checked={item.status === 'completed'}
              readOnly
              className="mt-1"
              style={{ accentColor: 'var(--accent-color)' }}
            />
            <div className="flex-1">
              <h4
                className="font-mono font-bold"
                style={{
                  color: item.status === 'completed' ? 'var(--text-muted)' : 'var(--text-main)',
                  textDecoration: item.status === 'completed' ? 'line-through' : 'none',
                }}
              >
                {item.title}
              </h4>
              {item.location && (
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  📍 {item.location}
                </p>
              )}
              {item.description && (
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {item.description}
                </p>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs font-mono"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {item.targetDate && (
              <span
                className="text-sm font-mono"
                style={{ color: 'var(--accent-color)' }}
              >
                {new Date(item.targetDate).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// Monthly Goals List
function MonthlyGoalsList({ goals }: { goals: MonthlyGoal[] }) {
  if (goals.length === 0) {
    return (
      <p className="font-mono text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
        No monthly goals yet. Add them in Notion to track your progress.
      </p>
    )
  }

  const sortedGoals = [...goals].sort(
    (a, b) => new Date(b.year, b.month - 1).getTime() - new Date(a.year, a.month - 1).getTime()
  )

  return (
    <div className="space-y-4">
      {sortedGoals.slice(0, 4).map((entry) => {
        const total = entry.goals.length || 1
        const done = entry.goals.filter((goal) => goal.completed).length
        const percent = Math.round((done / total) * 100)

        return (
          <div
            key={entry._id}
            className="p-4"
            style={{
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h4
                  className="font-mono font-bold text-lg"
                  style={{ color: 'var(--text-main)' }}
                >
                  {entry.title || `${entry.month}/${entry.year}`}
                </h4>
                {entry.description && (
                  <p
                    className="text-sm mt-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {entry.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span
                  className="text-2xl font-mono font-bold"
                  style={{ color: 'var(--accent-color)' }}
                >
                  {percent}%
                </span>
                <p
                  className="text-xs font-mono"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {done}/{total} done
                </p>
              </div>
            </div>

            {/* Goals checklist */}
            <div className="space-y-2">
              {entry.goals.slice(0, 5).map((goal, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm font-mono"
                >
                  <span>{goal.completed ? '✅' : '⬜️'}</span>
                  <span style={{
                    color: goal.completed ? 'var(--text-muted)' : 'var(--text-main)',
                    textDecoration: goal.completed ? 'line-through' : 'none',
                  }}>
                    {goal.goal}
                  </span>
                </div>
              ))}
              {entry.goals.length > 5 && (
                <p
                  className="text-xs font-mono"
                  style={{ color: 'var(--text-muted)' }}
                >
                  +{entry.goals.length - 5} more
                </p>
              )}
            </div>

            {/* Achievements */}
            {entry.achievements && entry.achievements.length > 0 && (
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <p
                  className="text-xs font-mono uppercase mb-2"
                  style={{ color: 'var(--accent-color)' }}
                >
                  🏆 Wins
                </p>
                <div className="space-y-1">
                  {entry.achievements.slice(0, 3).map((win, index) => (
                    <p
                      key={index}
                      className="text-sm"
                      style={{ color: 'var(--text-main)' }}
                    >
                      • {typeof win === 'string' ? win : win.achievement}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
