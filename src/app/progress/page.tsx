'use client'

import { useEffect, useMemo, useState, useId, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GRID_SIZE } from '@/lib/utils'
import { GridBackground } from '@/components/ui/GridBackground'
import { PixelIcon } from '@/components/ui/PixelIcon'

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

// Grid-based pixel style background matching timeline era design
const gameBackgroundStyle: CSSProperties = {
  backgroundColor: 'var(--bg-main)',
  position: 'relative',
  overflow: 'hidden',
  imageRendering: 'pixelated' as any,
}

// Calculate player level and stats from progress data
function calculatePlayerStats(
  lifeGoals: LifeGoal[],
  bucketList: BucketListItem[],
  monthlyGoals: MonthlyGoal[],
  devCommits: GitHubCommit[]
) {
  // Calculate XP from various sources
  const completedGoals = lifeGoals.filter(g => g.status === 'completed').length
  const inProgressGoals = lifeGoals.filter(g => g.status === 'in_progress').length
  const totalProgress = lifeGoals.reduce((sum, g) => sum + (g.progress ?? 0), 0)
  const completedBucketItems = bucketList.filter(b => b.status === 'completed').length
  const monthlyCompletions = monthlyGoals.reduce((sum, m) => {
    const completed = m.goals.filter(g => g.completed).length
    return sum + completed
  }, 0)
  const commitCount = devCommits.length

  // XP calculation
  const xpFromGoals = completedGoals * 100 + inProgressGoals * 50 + totalProgress * 0.5
  const xpFromBucket = completedBucketItems * 150
  const xpFromMonthly = monthlyCompletions * 75
  const xpFromCommits = commitCount * 10
  const totalXP = Math.floor(xpFromGoals + xpFromBucket + xpFromMonthly + xpFromCommits)

  // Level calculation (exponential growth)
  const level = Math.floor(Math.sqrt(totalXP / 100)) + 1
  const xpForCurrentLevel = Math.pow(level - 1, 2) * 100
  const xpForNextLevel = Math.pow(level, 2) * 100
  const xpInCurrentLevel = totalXP - xpForCurrentLevel
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel
  const levelProgress = (xpInCurrentLevel / xpNeededForNext) * 100

  // Calculate stats
  const stats = {
    strength: Math.min(100, Math.floor((completedGoals + completedBucketItems) * 5)),
    intelligence: Math.min(100, Math.floor((commitCount / 10) * 2 + (monthlyCompletions * 3))),
    agility: Math.min(100, Math.floor((inProgressGoals * 8) + (monthlyGoals.length * 5))),
    wisdom: Math.min(100, Math.floor((lifeGoals.length + bucketList.length) * 2)),
    vitality: Math.min(100, Math.floor((totalProgress / lifeGoals.length) || 0))
  }

  // Player title based on level
  const titles = [
    'Novice', 'Apprentice', 'Adept', 'Expert', 'Master', 'Grandmaster',
    'Legend', 'Mythic', 'Transcendent', 'Divine'
  ]
  const title = titles[Math.min(level - 1, titles.length - 1)] || 'Transcendent'

  return {
    level,
    totalXP,
    xpInCurrentLevel,
    xpNeededForNext,
    levelProgress: Math.min(100, Math.max(0, levelProgress)),
    stats,
    title,
    completedGoals,
    inProgressGoals,
    completedBucketItems,
    commitCount
  }
}

type ChartCardProps = {
  title: string
  description: string
  accentColor: string
  children: ReactNode
  footer?: ReactNode
  className?: string
  variant?: 'default' | 'terminal' | 'notebook' | 'strategy' | 'map' | 'calendar'
}

// Calendar Component - Week blocks view
function CalendarView({ monthlyHighlights }: { monthlyHighlights: Array<{ id: string; title: string; completion: number; wins: Array<{ label: string; detail?: string }> }> }) {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  
  // Calculate weeks
  const weeks: Array<{ start: number; end: number; days: number[] }> = []
  let currentWeekStart = 1
  
  // First week (may start mid-week)
  const firstWeekDays = 7 - firstDayOfMonth
  weeks.push({
    start: 1,
    end: Math.min(firstWeekDays, daysInMonth),
    days: Array.from({ length: firstWeekDays }, (_, i) => i + 1)
  })
  
  // Remaining weeks
  currentWeekStart = firstWeekDays + 1
  while (currentWeekStart <= daysInMonth) {
    const weekEnd = Math.min(currentWeekStart + 6, daysInMonth)
    weeks.push({
      start: currentWeekStart,
      end: weekEnd,
      days: Array.from({ length: weekEnd - currentWeekStart + 1 }, (_, i) => currentWeekStart + i)
    })
    currentWeekStart = weekEnd + 1
  }
  
  const today = currentDate.getDate()
  
  return (
    <div>
      {/* Week blocks */}
      <div className="space-y-1.5">
        {weeks.slice(0, 5).map((week, weekIndex) => {
          const hasToday = week.days.includes(today)
          
          return (
            <div
              key={weekIndex}
              className="wireframe-border p-2 flex items-center justify-between"
              style={{ 
                backgroundColor: hasToday ? "var(--bg-card)" : "var(--bg-main)",
                borderWidth: "1px",
                imageRendering: "pixelated" as any,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  W{weekIndex + 1}
                </span>
                <span className="font-mono text-xs" style={{ color: "var(--text-main)" }}>
                  {week.start}-{week.end}
                </span>
              </div>
              {hasToday && (
                <span className="font-mono text-[10px] font-bold" style={{ color: "var(--accent-color)" }}>TODAY</span>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Minimal highlights */}
      {monthlyHighlights.length > 0 && (
        <div className="mt-4 space-y-2">
          {monthlyHighlights.slice(0, 2).map((highlight) => (
            <div key={highlight.id} className="wireframe-border p-2" style={{ 
              borderWidth: "1px",
              imageRendering: "pixelated" as any,
            }}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold" style={{ color: "var(--text-main)" }}>{highlight.title}</span>
                <span className="font-mono text-xs" style={{ color: "var(--accent-color)" }}>{highlight.completion}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


// Strategy Board Component - With pins and markers
function StrategyBoard({ 
  categoryProgress, 
  priorityDeck, 
  tagHighlights 
}: { 
  categoryProgress: Array<{ category: string; average: number; count: number }>
  priorityDeck: LifeGoal[]
  tagHighlights: Array<{ tag: string; count: number }>
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📌</span>
          <p className="font-mono text-xs uppercase tracking-wider" style={{ color: "var(--accent-color)" }}>Category Momentum</p>
        </div>
        {categoryProgress.length > 0 ? (
          <div className="space-y-3">
            {categoryProgress.slice(0, 5).map((category, index) => (
              <motion.div
                key={category.category}
                className="relative wireframe-border p-3"
                style={{ imageRendering: "pixelated" as any }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Pin marker */}
                <div className="absolute -top-2 -left-2 w-4 h-4 wireframe-border" style={{ 
                  backgroundColor: "var(--accent-color)",
                  borderWidth: "2px",
                  transform: "rotate(45deg)",
                }} />
                <div className="flex items-center justify-between text-xs uppercase tracking-wider font-mono mb-2" style={{ color: "var(--text-muted)" }}>
                  <span>{category.category}</span>
                  <span>{category.average}% · {category.count} goals</span>
                </div>
                <div className="h-2 wireframe-border" style={{ 
                  backgroundColor: "var(--bg-main)",
                  borderWidth: "1px",
                  imageRendering: "pixelated" as any,
                }}>
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: "var(--accent-color)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${category.average}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>Categorize life goals in Notion to see momentum here.</p>
        )}
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-4">
          <PixelIcon name="flag-checkered" size={20} />
          <p className="font-mono text-xs uppercase tracking-wider" style={{ color: "var(--accent-color)" }}>Priority Deck</p>
        </div>
        {priorityDeck.length > 0 ? (
          <div className="space-y-3">
            {priorityDeck.map((goal, index) => (
              <motion.div
                key={goal._id}
                className="relative wireframe-border p-3 flex items-center justify-between gap-3"
                style={{ imageRendering: "pixelated" as any }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* String line from pin */}
                <div className="absolute -left-4 top-1/2 w-4 h-px" style={{ backgroundColor: "var(--border-color)" }} />
                <div className="absolute -left-6 top-1/2 w-2 h-2 wireframe-border" style={{ 
                  backgroundColor: "var(--accent-color)",
                  borderWidth: "2px",
                  transform: "translateY(-50%)",
                }} />
                
                <div className="flex-1">
                  <p className="font-mono text-sm font-bold" style={{ color: "var(--text-main)" }}>{goal.title}</p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider font-mono mt-1" style={{ color: "var(--text-muted)" }}>
                    {goal.priority && <span className="wireframe-border px-2 py-1" style={{ 
                      backgroundColor: "var(--bg-card)",
                      borderWidth: "1px",
                      color: "var(--text-main)",
                      imageRendering: "pixelated" as any,
                    }}>{goal.priority}</span>}
                    <span className="wireframe-border px-2 py-1" style={{ 
                      backgroundColor: "var(--bg-card)",
                      borderWidth: "1px",
                      color: "var(--text-main)",
                      imageRendering: "pixelated" as any,
                    }}>{goal.status?.split('_').join(' ') ?? 'unspecified'}</span>
                    {goal.targetDate && <span className="wireframe-border px-2 py-1" style={{ 
                      backgroundColor: "var(--bg-card)",
                      borderWidth: "1px",
                      color: "var(--text-main)",
                      imageRendering: "pixelated" as any,
                    }}>Due {formatDate(goal.targetDate)}</span>}
                  </div>
                </div>
                <span className="font-mono text-lg font-bold" style={{ color: "var(--accent-color)" }}>{goal.progress ?? 0}%</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>Flag priorities in Notion to auto-build this list.</p>
        )}
      </div>
      
      {tagHighlights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🏷️</span>
            <p className="font-mono text-xs uppercase tracking-wider" style={{ color: "var(--accent-color)" }}>Recurring Themes</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wider font-mono">
            {tagHighlights.map((tag) => (
              <span 
                key={tag.tag} 
                className="wireframe-border px-3 py-1"
                style={{ 
                  backgroundColor: "var(--bg-card)",
                  borderWidth: "1px",
                  color: "var(--text-main)",
                  imageRendering: "pixelated" as any,
                }}
              >
                #{tag.tag.toLowerCase()} · {tag.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Map Component - Pixel grid style matching timeline era
function AdventureMap({ adventures }: { adventures: BucketListItem[] }) {
  return (
    <div className="relative" style={{ minHeight: "400px" }}>
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(var(--border-color) 1px, transparent 1px),
          linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
        `,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        imageRendering: "pixelated" as any,
      }} />
      
      {/* Adventure markers */}
      <div className="relative space-y-4">
        {adventures.slice(0, 5).map((item, index) => (
          <motion.div
            key={item._id}
            className="relative wireframe-border p-4"
            style={{ 
              backgroundColor: "var(--bg-card)",
              borderWidth: "2px",
              imageRendering: "pixelated" as any,
            }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Map pin */}
            <div className="absolute -left-3 top-4">
              <div className="w-6 h-6 wireframe-border flex items-center justify-center" style={{ 
                backgroundColor: "var(--accent-color)",
                borderWidth: "2px",
                transform: "rotate(45deg)",
                imageRendering: "pixelated" as any,
              }}>
                <span className="text-xs font-bold font-mono" style={{ 
                  transform: "rotate(-45deg)",
                  color: "var(--bg-main)",
                }}>
                  {index + 1}
                </span>
              </div>
            </div>
            
            {/* Connecting line */}
            {index < adventures.length - 1 && (
              <div className="absolute left-0 top-full w-0.5 h-4" style={{ 
                backgroundColor: "var(--border-color)",
                opacity: 0.5,
                left: "9px",
              }} />
            )}
            
            <div className="ml-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-mono text-base font-bold mb-1" style={{ color: "var(--text-main)" }}>{item.title}</p>
                  {item.location && (
                    <p className="font-mono text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                      <PixelIcon name="location" size={16} className="inline-block mr-1" /> {item.location}
                    </p>
                  )}
                  {item.description && (
                    <p className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>{item.description}</p>
                  )}
                </div>
                {item.targetDate && (
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Target</p>
                    <p className="font-mono text-lg font-bold" style={{ color: "var(--accent-color)" }}>{formatDate(item.targetDate)}</p>
                  </div>
                )}
              </div>
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span 
                      key={tag} 
                      className="font-mono text-xs uppercase tracking-wider px-2 py-1 wireframe-border"
                      style={{ 
                        backgroundColor: "var(--bg-main)",
                        color: "var(--text-main)",
                        borderWidth: "1px",
                        imageRendering: "pixelated" as any,
                      }}
                    >
                      #{tag.toLowerCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Terminal Component - Actual terminal output
function TerminalOutput({ commits }: { commits: GitHubCommit[] }) {
  return (
    <div className="font-mono text-xs" style={{ color: "var(--accent-color)", fontFamily: "monospace" }}>
      <div className="mb-2" style={{ color: "var(--text-muted)" }}>
        <span style={{ color: "var(--accent-color)" }}>$</span> git log --oneline --graph -12
      </div>
      <div className="space-y-1" style={{ color: "var(--text-main)" }}>
        {commits.slice(0, 12).map((commit, index) => (
          <motion.div
            key={commit.sha}
            className="flex items-start gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <span style={{ color: "var(--accent-color)" }}>|</span>
            <span style={{ color: "var(--text-muted)" }}>{commit.sha.slice(0, 7)}</span>
            <span style={{ color: "var(--text-main)" }}>{commit.commit.message}</span>
            <span className="ml-auto" style={{ color: "var(--text-muted)", fontSize: "10px" }}>
              {formatDate(commit.commit.author.date)}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span style={{ color: "var(--accent-color)" }}>$</span>
        <span className="animate-pulse" style={{ color: "var(--accent-color)" }}>█</span>
      </div>
    </div>
  )
}

// Terminal-style card for Commit Stream - Pixel grid style
function TerminalCard({ title, description, children, className }: ChartCardProps) {
  return (
    <motion.section
      className={`relative wireframe-border ${className ?? ''}`}
      style={{ 
        imageRendering: "pixelated" as any,
        backgroundColor: "var(--bg-card)",
        borderWidth: "2px",
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `
          linear-gradient(var(--border-color) 1px, transparent 1px),
          linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
        `,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        imageRendering: "pixelated" as any,
      }} />
      
      {/* Terminal header */}
      <div className="wireframe-border px-4 py-2 flex items-center gap-2 relative z-10" style={{ 
        borderBottomWidth: "2px",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        backgroundColor: "var(--bg-main)",
        imageRendering: "pixelated" as any,
      }}>
        <div className="flex gap-1">
          <div className="w-3 h-3 wireframe-border" style={{ 
            backgroundColor: "var(--accent-color)", 
            borderWidth: "1px",
            imageRendering: "pixelated" as any,
          }} />
          <div className="w-3 h-3 wireframe-border" style={{ 
            backgroundColor: "var(--text-muted)", 
            borderWidth: "1px",
            imageRendering: "pixelated" as any,
          }} />
          <div className="w-3 h-3 wireframe-border" style={{ 
            backgroundColor: "var(--text-muted)", 
            borderWidth: "1px",
            imageRendering: "pixelated" as any,
          }} />
        </div>
        <div className="flex-1 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
          <span style={{ color: "var(--accent-color)" }}>$</span> {title}
        </div>
      </div>
      <div className="px-4 py-3 relative z-10" style={{ backgroundColor: "var(--bg-card)", minHeight: "200px" }}>
        <p className="mb-4 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
          {'// '}{description}
        </p>
        {children}
      </div>
    </motion.section>
  )
}

// Todo List Component
function TodoList({ items, type }: { items: (LifeGoal | BucketListItem | MonthlyGoal)[], type: 'lifeGoals' | 'bucketList' | 'monthlyGoals' }) {
  if (type === 'lifeGoals') {
    const goals = items as LifeGoal[]
    return (
      <div className="space-y-2">
        {goals.slice(0, 6).map((goal) => (
          <motion.div
            key={goal._id}
            className="flex items-start gap-3 wireframe-border p-3"
            style={{ imageRendering: "pixelated" as any }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <input
              type="checkbox"
              checked={goal.status === 'completed'}
              readOnly
              className="handwritten-checkbox mt-1 flex-shrink-0"
              style={{ width: "20px", height: "20px" }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-mono text-sm font-bold" style={{ 
                  color: goal.status === 'completed' ? "var(--text-muted)" : "var(--text-main)",
                  textDecoration: goal.status === 'completed' ? "line-through" : "none"
                }}>
                  {goal.title}
                </p>
                <span className="font-mono text-xs font-bold flex-shrink-0" style={{ color: "var(--accent-color)" }}>
                  {goal.progress ?? 0}%
                </span>
              </div>
              {goal.description && (
                <p className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {goal.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    )
  }
  
  if (type === 'bucketList') {
    const bucketItems = items as BucketListItem[]
    return (
      <div className="space-y-2">
        {bucketItems.slice(0, 6).map((item) => (
          <motion.div
            key={item._id}
            className="flex items-start gap-3 wireframe-border p-3"
            style={{ imageRendering: "pixelated" as any }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <input
              type="checkbox"
              checked={item.status === 'completed'}
              readOnly
              className="handwritten-checkbox mt-1 flex-shrink-0"
              style={{ width: "20px", height: "20px" }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm font-bold" style={{ 
                color: item.status === 'completed' ? "var(--text-muted)" : "var(--text-main)",
                textDecoration: item.status === 'completed' ? "line-through" : "none"
              }}>
                {item.title}
              </p>
              {item.location && (
                <p className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  📍 {item.location}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    )
  }
  
  return <div>No items to display</div>
}

// Notebook-style card for Notion Boards - Pixel grid style
function NotebookCard({ title, description, children, className }: ChartCardProps) {
  return (
    <motion.section
      className={`relative wireframe-border ${className ?? ''}`}
      style={{ 
        imageRendering: "pixelated" as any,
        backgroundColor: "var(--bg-card)",
        borderWidth: "2px",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `
          linear-gradient(var(--border-color) 1px, transparent 1px),
          linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
        `,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        imageRendering: "pixelated" as any,
      }} />
      <div className="relative px-6 py-4">
        <h2 className="font-mono text-xl uppercase tracking-wider font-bold mb-1" style={{ color: "var(--accent-color)" }}>{title}</h2>
        <p className="font-mono text-sm mb-4" style={{ color: "var(--text-muted)" }}>{description}</p>
        {children}
      </div>
    </motion.section>
  )
}

// Strategy board-style card for Goal Strategy - Pixel grid style
function StrategyCard({ title, description, children, className }: ChartCardProps) {
  return (
    <motion.section
      className={`relative wireframe-border ${className ?? ''}`}
      style={{ 
        imageRendering: "pixelated" as any,
        backgroundColor: "var(--bg-card)",
        borderWidth: "2px",
        position: "relative",
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `
          linear-gradient(var(--border-color) 1px, transparent 1px),
          linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
        `,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        imageRendering: "pixelated" as any,
      }} />
      
      {/* Corner pins */}
      <div className="absolute -top-1 -left-1 w-3 h-3 wireframe-border" style={{ 
        backgroundColor: "var(--accent-color)", 
        borderWidth: "2px",
        imageRendering: "pixelated" as any,
      }} />
      <div className="absolute -top-1 -right-1 w-3 h-3 wireframe-border" style={{ 
        backgroundColor: "var(--accent-color)", 
        borderWidth: "2px",
        imageRendering: "pixelated" as any,
      }} />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 wireframe-border" style={{ 
        backgroundColor: "var(--accent-color)", 
        borderWidth: "2px",
        imageRendering: "pixelated" as any,
      }} />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 wireframe-border" style={{ 
        backgroundColor: "var(--accent-color)", 
        borderWidth: "2px",
        imageRendering: "pixelated" as any,
      }} />
      
      <div className="relative px-6 py-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{title.split(' ')[0]}</span>
          <h2 className="font-mono text-xl uppercase tracking-wider font-bold" style={{ color: "var(--accent-color)" }}>
            {title.split(' ').slice(1).join(' ')}
          </h2>
        </div>
        <p className="font-mono text-sm mb-4" style={{ color: "var(--text-muted)" }}>{description}</p>
        {children}
      </div>
    </motion.section>
  )
}

// Map-style card for Adventure Timeline - Pixel grid style
function MapCard({ title, description, children, className }: ChartCardProps) {
  return (
    <motion.section
      className={`relative wireframe-border ${className ?? ''}`}
      style={{ 
        imageRendering: "pixelated" as any,
        backgroundColor: "var(--bg-card)",
        borderWidth: "2px",
        position: "relative",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `
          linear-gradient(var(--border-color) 1px, transparent 1px),
          linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
        `,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        imageRendering: "pixelated" as any,
      }} />
      
      <div className="relative px-6 py-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{title.split(' ')[0]}</span>
          <h2 className="font-mono text-xl uppercase tracking-wider font-bold" style={{ color: "var(--accent-color)" }}>
            {title.split(' ').slice(1).join(' ')}
          </h2>
        </div>
        <p className="font-mono text-sm mb-4" style={{ color: "var(--text-muted)" }}>{description}</p>
        {children}
      </div>
    </motion.section>
  )
}

// Calendar-style card for Monthly Cadence - Pixel grid style
function CalendarCard({ title, description, children, className }: ChartCardProps) {
  return (
    <motion.section
      className={`relative wireframe-border ${className ?? ''}`}
      style={{ 
        imageRendering: "pixelated" as any,
        backgroundColor: "var(--bg-card)",
        borderWidth: "2px",
        position: "relative",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `
          linear-gradient(var(--border-color) 1px, transparent 1px),
          linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
        `,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        imageRendering: "pixelated" as any,
      }} />
      
      {/* Calendar header style */}
      <div className="relative px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{title.split(' ')[0]}</span>
            <h2 className="font-mono text-xl uppercase tracking-wider font-bold" style={{ color: "var(--accent-color)" }}>
              {title.split(' ').slice(1).join(' ')}
            </h2>
          </div>
          <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        </div>
        <p className="font-mono text-sm mb-4" style={{ color: "var(--text-muted)" }}>{description}</p>
        {children}
      </div>
    </motion.section>
  )
}

// Default card
function DefaultCard({ title, description, children, footer, className }: ChartCardProps) {
  return (
    <motion.section
      className={`relative wireframe-border ${className ?? ''}`}
      style={{ imageRendering: "pixelated" as any }}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="wireframe-border px-6 py-4" style={{ 
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        borderBottomWidth: "var(--border-width)",
        imageRendering: "pixelated" as any,
      }}>
        <h2 className="font-mono text-xl uppercase tracking-wider font-bold" style={{ color: "var(--accent-color)" }}>{title}</h2>
        <p className="font-mono mt-2 text-sm max-w-2xl" style={{ color: "var(--text-muted)" }}>{description}</p>
      </div>
      <div className="px-6 pb-6 pt-4">{children}</div>
      {footer && <div className="px-6 pb-6 -mt-2">{footer}</div>}
    </motion.section>
  )
}

function ChartCard({ title, description, accentColor, children, footer, className, variant = 'default' }: ChartCardProps) {
  const props = { title, description, accentColor, children, footer, className }
  
  switch (variant) {
    case 'terminal':
      return <TerminalCard {...props} />
    case 'notebook':
      return <NotebookCard {...props} />
    case 'strategy':
      return <StrategyCard {...props} />
    case 'map':
      return <MapCard {...props} />
    case 'calendar':
      return <CalendarCard {...props} />
    default:
      return <DefaultCard {...props} />
  }
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
      <div className="h-48 flex items-center justify-center text-sm font-mono" style={{ color: "var(--text-muted)" }}>
        No data available yet. Sync your trackers to populate the graph.
      </div>
    )
  }

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
        style={{ imageRendering: "pixelated" as any }}
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
              stroke={color}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${roughFilterId})`}
              opacity={0.8}
            />
          </>
        )}
        {coordinates.map((point, index) => (
          <g key={`${point.x}-${point.y}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={activeIndex === index ? 7 : 5}
              fill="var(--accent-color)"
              stroke="var(--border-color)"
              strokeWidth={activeIndex === index ? 2.5 : 1.5}
              onPointerEnter={() => onHover?.(data[index], index)}
              className="cursor-pointer transition-transform"
              style={{ opacity: activeIndex === index ? 1 : 0.8 }}
            />
            <text
              x={point.x}
              y={height - 6}
              textAnchor="middle"
              className="text-[10px] font-mono"
              style={{ fill: "var(--text-muted)", opacity: 0.7 }}
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

function _BarChart({ data, color: _color, onHover, activeIndex: _activeIndex, onSelect }: BarChartProps) {
  const maxValue = Math.max(...data.map((point) => point.value), 1)

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm font-mono" style={{ color: "var(--text-muted)" }}>
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
            <div className="relative w-full wireframe-border pt-2" style={{ 
              backgroundColor: "var(--bg-main)",
              imageRendering: "pixelated" as any,
            }}>
              <motion.div
                className="absolute inset-x-1 bottom-1"
                style={{ 
                  backgroundColor: "var(--accent-color)",
                  height: `${heightPercent}%`,
                }}
                initial={{ height: 0 }}
                animate={{ height: `${heightPercent}%` }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
              />
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-mono opacity-0 group-hover:opacity-100 transition" style={{ color: "var(--accent-color)" }}>
                {point.value}%
              </span>
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-center" style={{ color: "var(--text-main)" }}>
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

function _RadialChart({ value, label, accentColor: _accentColor }: RadialChartProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100)
  const dashArray = 2 * Math.PI * 38
  const dashOffset = dashArray - (normalizedValue / 100) * dashArray

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        <circle cx="50" cy="50" r="38" stroke="var(--border-color)" strokeWidth="8" fill="transparent" opacity={0.2} />
        <motion.circle
          cx="50"
          cy="50"
          r="38"
          stroke="var(--accent-color)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={dashArray}
          fill="transparent"
          initial={{ strokeDashoffset: dashArray }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <text 
          x="50" 
          y="54" 
          textAnchor="middle" 
          className="text-[18px] font-bold font-mono"
          style={{ fill: "var(--accent-color)" }}
        >
          {normalizedValue}%
        </text>
      </svg>
      <span className="mt-2 text-xs uppercase tracking-wider font-mono text-center" style={{ color: "var(--text-muted)" }}>
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
  const [barHighlight] = useState<number | null>(null)
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

  const _selectedGoals = useMemo(() => {
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

  const _bucketProgress = useMemo(() => {
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
  const _activeBarPoint = useMemo(() => {
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
              const structured = win as Partial<{
                achievement: string
                title: string
                name: string
                note: string
                detail: string
                description: string
              }>
              const label = structured.achievement ?? structured.title ?? structured.name ?? ''
              const detail = structured.note ?? structured.detail ?? structured.description ?? ''
              return { label, detail }
            }
            return { label: '' }
          })
        }
      })
  }, [monthlyGoals])

  // Calculate player stats
  const playerStats = useMemo(() => {
    return calculatePlayerStats(lifeGoals, bucketList, monthlyGoals, devCommits)
  }, [lifeGoals, bucketList, monthlyGoals, devCommits])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative" style={gameBackgroundStyle}>
        <GridBackground />
        <motion.div
          className="wireframe-border px-8 py-4 relative z-10"
          style={{ imageRendering: "pixelated" as any }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="animate-spin rounded-none h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: "var(--accent-color)" }} />
          <p className="font-mono text-sm" style={{ color: "var(--accent-color)" }}>Loading Player Data...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <main className="min-h-screen py-8 relative" style={gameBackgroundStyle}>
      <GridBackground opacity={0.3} scanlinesOpacity={0.05} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Game HUD Header - Player Stats */}
        <motion.div
          className="mt-8 mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Main Player Card - Wireframe Style */}
          <div className="wireframe-border p-6 mb-6" style={{ imageRendering: "pixelated" as any }}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Left: Level & Title */}
              <div className="flex items-center gap-6">
                <motion.div
                  className="relative"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  style={{ imageRendering: "pixelated" as any }}
                >
                  <div className="wireframe-border w-24 h-24 flex items-center justify-center relative" style={{ 
                    backgroundColor: "var(--bg-card)",
                    imageRendering: "pixelated" as any,
                  }}>
                    <span className="text-4xl font-bold font-mono" style={{ color: "var(--accent-color)" }}>{playerStats.level}</span>
                    <div className="absolute -top-2 -right-2 wireframe-border w-6 h-6 flex items-center justify-center" style={{ 
                      backgroundColor: "var(--accent-color)",
                      color: "var(--bg-main)",
                      imageRendering: "pixelated" as any,
                    }}>
                      <span className="text-xs font-bold">LV</span>
                    </div>
                  </div>
                </motion.div>
                <div>
                  <motion.h1
                    className="text-3xl font-bold font-mono mb-2"
                    style={{ color: "var(--accent-color)" }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {playerStats.title}
                  </motion.h1>
                  <motion.p
                    className="font-mono text-sm"
                    style={{ color: "var(--text-muted)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Solo Leveling Progress
                  </motion.p>
                </div>
              </div>

              {/* Right: XP Bar */}
              <div className="flex-1 max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs uppercase" style={{ color: "var(--text-muted)" }}>Experience</span>
                  <span className="font-mono text-xs" style={{ color: "var(--text-main)" }}>
                    {playerStats.xpInCurrentLevel.toLocaleString()} / {playerStats.xpNeededForNext.toLocaleString()} XP
                  </span>
                </div>
                <div className="h-6 wireframe-border relative overflow-hidden" style={{ 
                  backgroundColor: "var(--bg-main)",
                  imageRendering: "pixelated" as any,
                }}>
                  <motion.div
                    className="h-full"
                    style={{ 
                      backgroundColor: "var(--accent-color)",
                      width: `${playerStats.levelProgress}%`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${playerStats.levelProgress}%` }}
                    transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold font-mono" style={{ color: "var(--text-main)" }}>
                      {playerStats.levelProgress.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  <span>Total XP: {playerStats.totalXP.toLocaleString()}</span>
                  <span>Next Level: {playerStats.level + 1}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Cards Grid */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-5 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, staggerChildren: 0.1 }}
          >
            {Object.entries(playerStats.stats).map(([statName, value], index) => (
              <motion.div
                key={statName}
                className="wireframe-border p-4"
                style={{ imageRendering: "pixelated" as any }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                    {statName.charAt(0).toUpperCase() + statName.slice(1)}
                  </span>
                  <span className="font-mono font-bold text-lg" style={{ color: "var(--accent-color)" }}>{value}</span>
                </div>
                <div className="h-2 wireframe-border" style={{ 
                  backgroundColor: "var(--bg-main)",
                  borderWidth: "1px",
                  imageRendering: "pixelated" as any,
                }}>
                  <motion.div
                  className="h-full"
                  style={{ backgroundColor: "var(--accent-color)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ delay: 1 + index * 0.1, duration: 1 }}
                />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Stats Row */}
          <motion.div
            className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="wireframe-border p-3" style={{ imageRendering: "pixelated" as any }}>
              <div className="font-mono text-xs uppercase mb-1" style={{ color: "var(--text-muted)" }}>Goals Completed</div>
              <div className="font-mono text-2xl font-bold" style={{ color: "var(--accent-color)" }}>{playerStats.completedGoals}</div>
            </div>
            <div className="wireframe-border p-3" style={{ imageRendering: "pixelated" as any }}>
              <div className="font-mono text-xs uppercase mb-1" style={{ color: "var(--text-muted)" }}>In Progress</div>
              <div className="font-mono text-2xl font-bold" style={{ color: "var(--accent-color)" }}>{playerStats.inProgressGoals}</div>
            </div>
            <div className="wireframe-border p-3" style={{ imageRendering: "pixelated" as any }}>
              <div className="font-mono text-xs uppercase mb-1" style={{ color: "var(--text-muted)" }}>Adventures</div>
              <div className="font-mono text-2xl font-bold" style={{ color: "var(--accent-color)" }}>{playerStats.completedBucketItems}</div>
            </div>
            <div className="wireframe-border p-3" style={{ imageRendering: "pixelated" as any }}>
              <div className="font-mono text-xs uppercase mb-1" style={{ color: "var(--text-muted)" }}>Commits</div>
              <div className="font-mono text-2xl font-bold" style={{ color: "var(--accent-color)" }}>{playerStats.commitCount}</div>
            </div>
          </motion.div>

          {errorMessage && (
            <motion.div
              className="mt-6 inline-flex items-center gap-2 wireframe-border px-4 py-2 text-xs uppercase tracking-wider font-mono"
              style={{ 
                borderColor: "var(--accent-color)",
                backgroundColor: "var(--bg-card)",
                color: "var(--accent-color)",
                imageRendering: "pixelated" as any,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ⚠ {errorMessage}
            </motion.div>
          )}
          {!errorMessage && lastSyncedAt && (
            <motion.div
              className="mt-6 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              <span className="wireframe-border font-mono text-xs uppercase tracking-wider px-4 py-1" style={{ 
                color: "var(--text-muted)",
                imageRendering: "pixelated" as any,
              }}>
                Synced from Notion · {new Date(lastSyncedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="mt-12 space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <ChartCard
            title="📈 Trajectory Analysis"
            description="Switch between build velocity and life cadence to inspect momentum over time. Hover any node for more detail."
            accentColor="bg-blue-50"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTimelineView('dev')}
                  className={`wireframe-border font-mono text-xs uppercase tracking-wider px-4 py-2 transition`}
                  style={{
                    backgroundColor: timelineView === 'dev' ? "var(--accent-color)" : "var(--bg-card)",
                    color: timelineView === 'dev' ? "var(--bg-main)" : "var(--text-main)",
                    imageRendering: "pixelated" as any,
                  }}
                >
                  Dev Velocity
                </button>
                <button
                  type="button"
                  onClick={() => setTimelineView('monthly')}
                  className={`wireframe-border font-mono text-xs uppercase tracking-wider px-4 py-2 transition`}
                  style={{
                    backgroundColor: timelineView === 'monthly' ? "var(--accent-color)" : "var(--bg-card)",
                    color: timelineView === 'monthly' ? "var(--bg-main)" : "var(--text-main)",
                    imageRendering: "pixelated" as any,
                  }}
                >
                  Monthly Cadence
                </button>
              </div>
              <span className="font-mono text-sm" style={{ color: "var(--text-main)" }}>{timelineHeadline}</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              <label htmlFor="timeline-span" className="uppercase tracking-wider">
                Window · {Math.max(2, timelineSpan)} points
              </label>
              <input
                id="timeline-span"
                type="range"
                min={4}
                max={24}
                value={timelineSpan}
                onChange={(event) => setTimelineSpan(Number(event.target.value))}
                className="h-1 w-40 cursor-pointer appearance-none wireframe-border"
                style={{ 
                  backgroundColor: "var(--bg-main)",
                  accentColor: "var(--accent-color)",
                }}
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
                  className="mt-6 wireframe-border px-4 py-4 flex items-center justify-between gap-4"
                  style={{ imageRendering: "pixelated" as any }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                >
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Focused Node</p>
                    <p className="font-mono text-lg mt-1" style={{ color: "var(--text-main)" }}>{activePoint.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-mono" style={{ color: "var(--accent-color)" }}>{activePoint.value}</p>
                    {activePoint.detail && (
                      <p className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>{activePoint.detail}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </ChartCard>

          <ChartCard
            title="💻 Commit Stream"
            description="Newest commits waterfall. Scroll horizontally to skim the diff notes."
            accentColor="bg-slate-50"
            variant="terminal"
          >
            {devCommits.length > 0 ? (
              <TerminalOutput commits={devCommits} />
            ) : (
              <div className="text-center py-8 text-sm font-mono" style={{ color: "var(--text-muted)" }}>
                <span style={{ color: "var(--accent-color)" }}>$</span> No commits to display yet.
              </div>
            )}
          </ChartCard>

          <ChartCard
            title="📋 Notion Boards"
            description="Glide through the original databases pulled straight from Notion. Each tab surfaces a different playbook."
            accentColor="bg-sky-50"
            variant="notebook"
          >
            <div className="flex flex-wrap items-center gap-3">
              {[
                { key: 'lifeGoals', label: 'Life goals', icon: 'flag-checkered' },
                { key: 'bucketList', label: 'Bucket list', icon: 'globe' },
                { key: 'monthlyGoals', label: 'Monthly goals', icon: 'calender' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveNotebook(tab.key as typeof activeNotebook)}
                  className={`inline-flex items-center gap-2 wireframe-border px-4 py-2 text-xs uppercase tracking-wider transition font-mono`}
                  style={{
                    backgroundColor: activeNotebook === tab.key ? "var(--accent-color)" : "var(--bg-card)",
                    color: activeNotebook === tab.key ? "var(--bg-main)" : "var(--text-main)",
                    imageRendering: "pixelated" as any,
                  }}
                >
                  <span aria-hidden><PixelIcon name={tab.icon} size={16} /></span>
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
                  <TodoList items={lifeGoalsCatalog} type="lifeGoals" />
                ) : (
                  <p className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>Log life goals in Notion to populate this stream.</p>
                )
              )}

              {activeNotebook === 'bucketList' && (
                bucketListCatalog.length > 0 ? (
                  <TodoList items={bucketListCatalog} type="bucketList" />
                ) : (
                  <p className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>Dream up adventures inside your Notion bucket list to see them here.</p>
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
                        <motion.li
                          key={entry._id}
                          className="wireframe-border px-4 py-4"
                          style={{ imageRendering: "pixelated" as any }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-mono text-lg font-bold" style={{ color: "var(--text-main)" }}>{entry.title || `Month ${entry.month}/${entry.year}`}</p>
                              {entry.description && (
                                <p className="font-mono text-sm max-w-xl" style={{ color: "var(--text-muted)" }}>{entry.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Completion</p>
                              <p className="font-mono text-xl font-bold" style={{ color: "var(--accent-color)" }}>{percent}%</p>
                            </div>
                          </div>
                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div className="wireframe-border px-3 py-3" style={{ 
                              backgroundColor: "var(--bg-card)",
                              borderWidth: "1px",
                              imageRendering: "pixelated" as any,
                            }}>
                              <p className="font-mono text-xs uppercase tracking-wider" style={{ color: "var(--accent-color)" }}>Goals checklist</p>
                              <ul className="mt-2 space-y-1 text-xs font-mono" style={{ color: "var(--text-main)" }}>
                                {entry.goals.slice(0, 4).map((goal, index) => (
                                  <li key={`${entry._id}-goal-${index}`} className="flex items-center gap-2">
                                    <span aria-hidden>{goal.completed ? '✅' : '⬜️'}</span>
                                    <span>{goal.goal}</span>
                                  </li>
                                ))}
                                {entry.goals.length > 4 && (
                                  <li className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>+{entry.goals.length - 4} more</li>
                                )}
                              </ul>
                            </div>
                            <div className="wireframe-border px-3 py-3" style={{ 
                              backgroundColor: "var(--bg-card)",
                              borderWidth: "1px",
                              imageRendering: "pixelated" as any,
                            }}>
                              <p className="font-mono text-xs uppercase tracking-wider" style={{ color: "var(--accent-color)" }}>Wins</p>
                              {entry.achievements.length > 0 ? (
                                <ul className="mt-2 space-y-1 text-xs font-mono" style={{ color: "var(--text-main)" }}>
                                  {entry.achievements.slice(0, 3).map((achievement, index) => (
                                    <li key={`${entry._id}-win-${index}`}>{achievement.achievement}{achievement.note ? ` — ${achievement.note}` : ''}</li>
                                  ))}
                                  {entry.achievements.length > 3 && (
                                    <li className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>+{entry.achievements.length - 3} more</li>
                                  )}
                                </ul>
                              ) : (
                                <p className="mt-2 text-xs font-mono" style={{ color: "var(--text-muted)" }}>Log wins in Notion to celebrate them here.</p>
                              )}
                            </div>
                          </div>
                        </motion.li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>Your monthly cadence will appear once the Notion board has entries.</p>
                )
              )}
            </motion.div>
          </AnimatePresence>
        </ChartCard>

          <ChartCard
            title="⚔️ Goal Strategy"
            description="Where energy is flowing right now. Categories, priorities, and themes pulled from the Notion boards."
            accentColor="bg-violet-50"
            variant="strategy"
          >
            <StrategyBoard 
              categoryProgress={categoryProgress}
              priorityDeck={priorityDeck}
              tagHighlights={tagHighlights}
            />
          </ChartCard>

          <ChartCard
            title="🗺️ Adventure Timeline"
            description="Upcoming experiences from the bucket list with the soonest dates surfaced first."
            accentColor="bg-orange-50"
            variant="map"
          >
            {adventureSchedule.length > 0 ? (
              <AdventureMap adventures={adventureSchedule} />
            ) : (
              <p className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>Add target dates to bucket list items in Notion to populate the timeline.</p>
            )}
          </ChartCard>

          <ChartCard
            title="📅 Monthly Cadence"
            description="Quick read on the latest Notion review cycles—completion percentage and headline wins."
            accentColor="bg-purple-50"
            variant="calendar"
          >
            {monthlyHighlights.length > 0 ? (
              <CalendarView monthlyHighlights={monthlyHighlights} />
            ) : (
              <p className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>Monthly goal reviews from Notion will appear once data is available.</p>
            )}
          </ChartCard>
        </motion.div>
      </div>
    </main>
  )
}
