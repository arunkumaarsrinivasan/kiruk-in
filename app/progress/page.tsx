'use client'

import { useState, useEffect } from 'react'
import { getLifeGoals, getBucketList, getMonthlyGoals, getLifeUpdates } from '@/lib/sanity'

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

interface LifeUpdate {
  _id: string
  title: string
  content: string
  category: string
  mood: string
  date: string
  tags?: string[]
  location?: string
  isPublic: boolean
}

export default function UnifiedProgress() {
  const [activeTab, setActiveTab] = useState<'development' | 'life' | 'monthly' | 'bucket'>('development')
  const [devCommits, setDevCommits] = useState<GitHubCommit[]>([])
  const [lifeGoals, setLifeGoals] = useState<LifeGoal[]>([])
  const [bucketList, setBucketList] = useState<BucketListItem[]>([])
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>([])
  const [lifeUpdates, setLifeUpdates] = useState<LifeUpdate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      // Fetch development data from GitHub API
      const devResponse = await fetch('/api/github?endpoint=commits&limit=15')
      if (devResponse.ok) {
        const responseData = await devResponse.json()
        // The API returns { data: [...], rateLimit: {...}, ... }
        const devData = responseData.data || responseData
        
        // Ensure devData is an array before calling slice
        if (Array.isArray(devData)) {
          setDevCommits(devData.slice(0, 15))
        } else {
          console.warn('GitHub API returned non-array data:', devData)
          setDevCommits([])
        }
      } else {
        console.error('Failed to fetch GitHub commits:', devResponse.status, devResponse.statusText)
        setDevCommits([])
      }

      // Fetch life data from Sanity (only if API token is configured)
      if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'your-project-id') {
        try {
          const [goals, bucket, monthly, updates] = await Promise.all([
            getLifeGoals(),
            getBucketList(),
            getMonthlyGoals(),
            getLifeUpdates()
          ])

          setLifeGoals(goals || [])
          setBucketList(bucket || [])
          setMonthlyGoals(monthly || [])
          setLifeUpdates(updates || [])
        } catch (sanityError) {
          console.log('Sanity not configured yet:', sanityError)
          setLifeGoals([])
          setBucketList([])
          setMonthlyGoals([])
          setLifeUpdates([])
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black handwritten">Loading progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6 notebook-bg">
      <div className="max-w-6xl mx-auto">
        {/* Header with sketch-like title */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-black mb-4 transform -rotate-1 sketch-font">
            📋 My Progress Journal
          </h1>
          <div className="w-32 h-1 bg-black mx-auto transform rotate-1 mb-2"></div>
          <p className="text-gray-700 handwritten text-lg">
            📝 Development & Life Adventures
          </p>
        </div>

        {/* Sketch Tab Navigation */}
        <div className="flex justify-center mb-8 space-x-2">
          {[
            { id: 'development', name: 'Code Commits', icon: '💻', rotation: 'rotate-1' },
            { id: 'life', name: 'Life Goals', icon: '🎯', rotation: '-rotate-1' },
            { id: 'monthly', name: 'Monthly Focus', icon: '📅', rotation: 'rotate-2' },
            { id: 'bucket', name: 'Bucket List', icon: '🪣', rotation: '-rotate-2' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`transform ${tab.rotation} transition-all duration-200 hover:scale-105 sketch-button
                ${activeTab === tab.id 
                  ? 'bg-white border-2 border-black z-10' 
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-400'
                } 
                px-6 py-3 rounded-lg handwritten text-sm font-bold text-black 
                backdrop-blur-sm border-dashed`}
            >
              <span className="text-lg mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Main Content Area - Notebook Style */}
        <div className="bg-white backdrop-blur-sm rounded-3xl border-2 border-black overflow-hidden transform rotate-1 sketch-border">
          <div className="bg-gray-50 p-6 border-b-2 border-dashed border-gray-400">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-black sketch-font">
                {activeTab === 'development' && '💻 Development Progress'}
                {activeTab === 'life' && '🎯 Life Goals Checklist'}
                {activeTab === 'monthly' && '📅 This Month\'s Focus'}
                {activeTab === 'bucket' && '🪣 Dream Adventures'}
              </h2>
              <div className="text-gray-700 handwritten text-sm">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>

          <div className="p-8 transform -rotate-1">
            {/* Development Tab - GitHub Commits */}
            {activeTab === 'development' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="inline-block bg-gray-100 border-2 border-gray-400 rounded-full px-6 py-2 transform rotate-2 sketch-border">
                    <span className="text-black font-bold text-lg handwritten">{devCommits.length} commits</span>
                  </div>
                </div>
                
                {devCommits.map((commit, index) => (
                  <div key={commit.sha} className={`transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 transition-transform duration-200`}>
                    <div className="bg-gray-50 border-l-4 border-black p-4 rounded-r-2xl sketch-border">
                      <div className="flex items-start space-x-4">
                        <img
                          src={commit.author?.avatar_url}
                          alt={commit.author?.login}
                          className="w-12 h-12 rounded-full border-2 border-gray-400"
                        />
                        <div className="flex-1">
                          <p className="handwritten text-black font-semibold leading-relaxed">
                            ✓ {commit.commit.message}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span className="handwritten">👤 {commit.commit.author.name}</span>
                            <span className="handwritten">📅 {formatDate(commit.commit.author.date)}</span>
                            <span className="handwritten">⏰ {formatTime(commit.commit.author.date)}</span>
                          </div>
                          {commit.stats && (
                            <div className="flex space-x-4 mt-2">
                              <span className="bg-gray-200 text-black px-2 py-1 rounded-full text-xs handwritten">
                                +{commit.stats.additions}
                              </span>
                              <span className="bg-gray-300 text-black px-2 py-1 rounded-full text-xs handwritten">
                                -{commit.stats.deletions}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Life Goals Tab */}
            {activeTab === 'life' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="transform -rotate-2">
                    <div className="bg-gray-100 border-2 border-gray-400 rounded-full px-4 py-2 sketch-border">
                      <span className="text-black font-bold handwritten">{lifeGoals.filter(g => g.status === 'completed').length} completed</span>
                    </div>
                  </div>
                  <a
                    href="/studio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transform rotate-2 bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded-lg border-2 border-black transition-all duration-200 hover:scale-105 handwritten sketch-button"
                  >
                    ✏️ Edit Goals
                  </a>
                </div>
                
                <div className="space-y-4">
                  {lifeGoals.map((goal, index) => (
                    <div key={goal._id} className={`transform ${index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-2'} hover:rotate-0 transition-transform duration-200`}>
                      <div className={`p-4 rounded-2xl border-2 border-dashed sketch-border ${
                        goal.status === 'completed' ? 'bg-gray-100 border-gray-400' :
                        goal.status === 'in_progress' ? 'bg-white border-gray-300' :
                        'bg-gray-50 border-gray-300'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                            goal.status === 'completed' ? 'bg-black border-black' :
                            goal.status === 'in_progress' ? 'bg-gray-600 border-gray-600' :
                            'bg-gray-300 border-gray-500'
                          }`}>
                            {goal.status === 'completed' && <span className="text-white text-sm">✓</span>}
                            {goal.status === 'in_progress' && <span className="text-white text-xs">•</span>}
                          </div>
                          <div className="flex-1">
                            <h3 className={`handwritten font-bold text-lg ${
                              goal.status === 'completed' ? 'line-through text-gray-600' : 'text-black'
                            }`}>
                              {goal.title}
                            </h3>
                            <p className="text-gray-700 handwritten text-sm mt-1">{goal.description}</p>
                            <div className="flex items-center space-x-3 mt-3">
                              <span className="bg-white px-2 py-1 rounded-full text-xs handwritten border border-gray-300">
                                📊 {goal.progress}%
                              </span>
                              <span className="bg-white px-2 py-1 rounded-full text-xs handwritten border border-gray-300">
                                🏷️ {goal.category}
                              </span>
                              <span className="bg-white px-2 py-1 rounded-full text-xs handwritten border border-gray-300">
                                ⚡ {goal.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Goals Tab */}
            {activeTab === 'monthly' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="transform rotate-2">
                    <div className="bg-gray-100 border-2 border-gray-400 rounded-full px-4 py-2 sketch-border">
                      <span className="text-black font-bold handwritten">{monthlyGoals.length} monthly plans</span>
                    </div>
                  </div>
                  <a
                    href="/studio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transform -rotate-2 bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded-lg border-2 border-black transition-all duration-200 hover:scale-105 handwritten sketch-button"
                  >
                    ✏️ Plan Month
                  </a>
                </div>
                
                <div className="space-y-6">
                  {monthlyGoals.map((monthly, index) => {
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    return (
                      <div key={monthly._id} className={`transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 transition-transform duration-200`}>
                        <div className="bg-gray-50 border-2 border-dashed border-gray-400 p-6 rounded-3xl sketch-border">
                          <div className="text-center mb-4">
                            <h3 className="text-2xl font-bold text-black sketch-font">
                              📅 {monthNames[monthly.month - 1]} {monthly.year}
                            </h3>
                            <p className="text-gray-700 handwritten text-lg mt-1">{monthly.title}</p>
                            {monthly.description && (
                              <p className="text-gray-600 handwritten text-sm mt-2">{monthly.description}</p>
                            )}
                          </div>
                          
                          {monthly.goals && monthly.goals.length > 0 && (
                            <div className="mb-6">
                              <h4 className="font-bold text-black mb-3 handwritten text-lg">🎯 Goals:</h4>
                              <div className="space-y-2">
                                {monthly.goals.map((goal, goalIndex) => (
                                  <div key={goalIndex} className="flex items-center space-x-3 p-2 bg-white/60 rounded-lg border border-gray-300">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                      goal.completed ? 'bg-black border-black' : 'bg-gray-300 border-gray-500'
                                    }`}>
                                      {goal.completed && <span className="text-white text-xs">✓</span>}
                                    </div>
                                    <span className={`handwritten ${
                                      goal.completed ? 'line-through text-gray-600' : 'text-black'
                                    }`}>
                                      {goal.goal}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {monthly.achievements && monthly.achievements.length > 0 && (
                            <div>
                              <h4 className="font-bold text-black mb-3 handwritten text-lg">🏆 Achievements:</h4>
                              <div className="space-y-2">
                                {monthly.achievements.map((achievement, achIndex) => (
                                  <div key={achIndex} className="flex items-center space-x-3 p-2 bg-gray-100/60 rounded-lg border border-gray-300">
                                    <span className="text-gray-600 text-lg">🌟</span>
                                    <span className="handwritten text-black">{achievement.achievement}</span>
                                    {achievement.date && (
                                      <span className="text-xs text-gray-600 handwritten ml-auto">
                                        {formatDate(achievement.date)}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Bucket List Tab */}
            {activeTab === 'bucket' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="transform -rotate-2">
                    <div className="bg-gray-100 border-2 border-gray-400 rounded-full px-4 py-2 sketch-border">
                      <span className="text-black font-bold handwritten">{bucketList.filter(b => b.status === 'completed').length} dreams achieved</span>
                    </div>
                  </div>
                  <a
                    href="/studio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transform rotate-2 bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded-lg border-2 border-black transition-all duration-200 hover:scale-105 handwritten sketch-button"
                  >
                    ✏️ Add Dreams
                  </a>
                </div>
                
                <div className="space-y-4">
                  {bucketList.map((item, index) => (
                    <div key={item._id} className={`transform ${index % 4 === 0 ? 'rotate-2' : index % 4 === 1 ? '-rotate-1' : index % 4 === 2 ? 'rotate-1' : '-rotate-2'} hover:rotate-0 transition-transform duration-200`}>
                      <div className={`p-4 rounded-2xl border-2 border-dashed sketch-border ${
                        item.status === 'completed' ? 'bg-gray-100 border-gray-400' :
                        item.status === 'in_progress' ? 'bg-gray-50 border-gray-300' :
                        'bg-white border-gray-300'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                            item.status === 'completed' ? 'bg-black border-black' :
                            item.status === 'in_progress' ? 'bg-gray-600 border-gray-600' :
                            'bg-gray-400 border-gray-400'
                          }`}>
                            {item.status === 'completed' && <span className="text-white text-sm">✓</span>}
                            {item.status === 'in_progress' && <span className="text-white text-xs">•</span>}
                            {item.status === 'dream' && <span className="text-white text-xs">★</span>}
                          </div>
                          <div className="flex-1">
                            <h3 className={`handwritten font-bold text-lg ${
                              item.status === 'completed' ? 'line-through text-gray-600' : 'text-black'
                            }`}>
                              {item.title}
                            </h3>
                            <p className="text-gray-700 handwritten text-sm mt-1">{item.description}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {item.location && (
                                <span className="bg-white px-2 py-1 rounded-full text-xs handwritten border border-gray-300">
                                  📍 {item.location}
                                </span>
                              )}
                              {item.estimatedCost && (
                                <span className="bg-white px-2 py-1 rounded-full text-xs handwritten border border-gray-300">
                                  💰 ${item.estimatedCost}
                                </span>
                              )}
                              <span className="bg-white px-2 py-1 rounded-full text-xs handwritten border border-gray-300">
                                🏷️ {item.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-8">
          <div className="inline-block bg-gray-100 border-2 border-dashed border-gray-400 rounded-2xl p-4 transform -rotate-1 sketch-border">
            <p className="text-black handwritten text-sm">
              📝 <strong>Journal Note:</strong> Development commits sync from GitHub • Life content managed via CMS
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
