'use client'

import { useState, useEffect } from 'react'
import { getLifeGoals, getBucketList, getMonthlyGoals, getLifeUpdates } from '@/lib/sanity'
import { motion } from 'framer-motion'
import ScribbleAnimation from '@/components/three/scribble-animation'

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
    <div className="min-h-screen bg-white notebook-bg p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8 transform -rotate-1 p-8">
          <h1 className="text-4xl font-bold text-black sketch-font mb-2">
            📋 MY PROGRESS JOURNAL
          </h1>
          <p className="handwritten text-gray-600 text-lg">
            🚀 Development & Life Adventures
          </p>
        </div>

        {/* Unified Journal Content */}
        <div className="space-y-8">
          
          {/* Development Section */}
          <div className="bg-white backdrop-blur-sm rounded-3xl border-2 border-black overflow-hidden transform rotate-1 sketch-border">
            <div className="bg-blue-50 p-6 border-b-2 border-dashed border-blue-400">
              <h2 className="text-2xl font-bold text-blue-900 sketch-font flex items-center gap-2">
                💻 Development Journey
              </h2>
              <p className="handwritten text-blue-700 mt-2">
                Recent coding adventures and project milestones
              </p>
            </div>
            
            <div className="p-6">
              {devCommits.length > 0 ? (
                <div className="space-y-4">
                  {devCommits.slice(0, 8).map((commit, index) => {
                    const message = commit.commit.message.toLowerCase();
                    let category = '🔧';
                    let categoryText = 'Update';
                    
                    if (message.includes('add') || message.includes('new') || message.includes('create')) {
                      category = '✨';
                      categoryText = 'Feature';
                    } else if (message.includes('fix') || message.includes('bug')) {
                      category = '🐛';
                      categoryText = 'Fix';
                    } else if (message.includes('security') || message.includes('arcjet')) {
                      category = '🛡️';
                      categoryText = 'Security';
                    } else if (message.includes('design') || message.includes('ui') || message.includes('style')) {
                      category = '🎨';
                      categoryText = 'Design';
                    }

                    return (
                      <div key={commit.sha} className={`transform ${index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-2'} hover:rotate-0 transition-all duration-200`}>
                        <div className="bg-gradient-to-r from-white to-blue-50 border-2 border-blue-200 p-4 rounded-xl sketch-border">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 border-2 border-blue-400 rounded-full flex items-center justify-center text-lg">
                                {category}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold handwritten">
                                  {categoryText}
                                </span>
                                <span className="text-gray-500 text-sm handwritten">
                                  {formatDate(commit.commit.author.date)}
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-900 handwritten leading-relaxed">
                                {commit.commit.message}
                              </h3>
                              <div className="flex items-center space-x-3 text-sm text-gray-600 mt-2">
                                <span className="handwritten">
                                  👤 {commit.commit.author.name}
                                </span>
                                <span className="handwritten">
                                  ⏰ {formatTime(commit.commit.author.date)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Development Summary */}
                  <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl transform -rotate-1">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-blue-600">{devCommits.length}</div>
                        <div className="text-xs text-blue-700 handwritten">Commits</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-green-600">
                          {devCommits.reduce((total, commit) => total + (commit.stats?.additions || 0), 0)}
                        </div>
                        <div className="text-xs text-green-700 handwritten">Lines Added</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-red-600">
                          {devCommits.reduce((total, commit) => total + (commit.stats?.deletions || 0), 0)}
                        </div>
                        <div className="text-xs text-red-700 handwritten">Lines Removed</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-purple-600">
                          {[...new Set(devCommits.map(c => new Date(c.commit.author.date).toDateString()))].length}
                        </div>
                        <div className="text-xs text-purple-700 handwritten">Active Days</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="handwritten text-gray-500">No development commits available yet...</p>
                </div>
              )}
            </div>
          </div>

          {/* Life Goals Section */}
          <div className="bg-white backdrop-blur-sm rounded-3xl border-2 border-black overflow-hidden transform -rotate-1 sketch-border">
            <div className="bg-green-50 p-6 border-b-2 border-dashed border-green-400">
              <h2 className="text-2xl font-bold text-green-900 sketch-font flex items-center gap-2">
                🎯 Life Goals Journey
              </h2>
              <p className="handwritten text-green-700 mt-2">
                Personal aspirations and achievements along the way
              </p>
            </div>
            
            <div className="p-6">
              {lifeGoals.length > 0 ? (
                <div className="space-y-4">
                  {lifeGoals.map((goal, index) => (
                    <div key={goal._id} className={`transform ${index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-2'} hover:rotate-0 transition-transform duration-200`}>
                      <div className={`p-4 rounded-xl border-2 border-dashed sketch-border ${
                        goal.status === 'completed' ? 'bg-green-100 border-green-400' :
                        goal.status === 'in_progress' ? 'bg-yellow-50 border-yellow-300' :
                        'bg-gray-50 border-gray-300'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                            goal.status === 'completed' ? 'bg-green-600 border-green-600' :
                            goal.status === 'in_progress' ? 'bg-yellow-500 border-yellow-500' :
                            'bg-gray-400 border-gray-400'
                          }`}>
                            {goal.status === 'completed' && <span className="text-white text-sm">✓</span>}
                            {goal.status === 'in_progress' && <span className="text-white text-xs">•</span>}
                          </div>
                          <div className="flex-1">
                            <h3 className={`handwritten font-bold text-lg ${
                              goal.status === 'completed' ? 'line-through text-green-700' : 'text-black'
                            }`}>
                              {goal.title}
                            </h3>
                            <p className="text-gray-700 handwritten text-sm mt-1">{goal.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="bg-white px-2 py-1 rounded-full text-xs handwritten border border-gray-300">
                                � {goal.progress}%
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
              ) : (
                <div className="text-center py-8">
                  <p className="handwritten text-gray-500">No life goals tracked yet...</p>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Goals Section */}
          <div className="bg-white backdrop-blur-sm rounded-3xl border-2 border-black overflow-hidden transform rotate-2 sketch-border">
            <div className="bg-purple-50 p-6 border-b-2 border-dashed border-purple-400">
              <h2 className="text-2xl font-bold text-purple-900 sketch-font flex items-center gap-2">
                📅 Monthly Adventures
              </h2>
              <p className="handwritten text-purple-700 mt-2">
                Monthly goals, plans, and achievements
              </p>
            </div>
            
            <div className="p-6">
              {monthlyGoals.length > 0 ? (
                <div className="space-y-6">
                  {monthlyGoals.map((monthly, index) => {
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    return (
                      <div key={monthly._id} className={`transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 transition-transform duration-200`}>
                        <div className="bg-purple-50 border-2 border-dashed border-purple-300 p-5 rounded-2xl sketch-border">
                          <div className="text-center mb-4">
                            <h3 className="text-xl font-bold text-purple-900 sketch-font">
                              📅 {monthNames[monthly.month - 1]} {monthly.year}
                            </h3>
                            <p className="text-purple-700 handwritten text-lg mt-1">{monthly.title}</p>
                            {monthly.description && (
                              <p className="text-purple-600 handwritten text-sm mt-2">{monthly.description}</p>
                            )}
                          </div>
                          
                          {monthly.goals && monthly.goals.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-bold text-purple-900 mb-2 handwritten">🎯 Goals:</h4>
                              <div className="space-y-2">
                                {monthly.goals.map((goal, goalIndex) => (
                                  <div key={goalIndex} className="flex items-center space-x-2 p-2 bg-white/60 rounded-lg">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                      goal.completed ? 'bg-purple-600 border-purple-600' : 'bg-gray-300 border-gray-500'
                                    }`}>
                                      {goal.completed && <span className="text-white text-xs">✓</span>}
                                    </div>
                                    <span className={`handwritten text-sm ${
                                      goal.completed ? 'line-through text-gray-600' : 'text-purple-900'
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
                              <h4 className="font-bold text-purple-900 mb-2 handwritten">🏆 Achievements:</h4>
                              <div className="space-y-2">
                                {monthly.achievements.map((achievement, achIndex) => (
                                  <div key={achIndex} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg">
                                    <span className="text-yellow-600 text-lg">🌟</span>
                                    <span className="handwritten text-purple-900 text-sm">{achievement.achievement}</span>
                                    {achievement.date && (
                                      <span className="text-xs text-purple-600 handwritten ml-auto">
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
              ) : (
                <div className="text-center py-8">
                  <p className="handwritten text-gray-500">No monthly goals planned yet...</p>
                </div>
              )}
            </div>
          </div>

          {/* Bucket List Section */}
          <div className="bg-white backdrop-blur-sm rounded-3xl border-2 border-black overflow-hidden transform -rotate-2 sketch-border">
            <div className="bg-orange-50 p-6 border-b-2 border-dashed border-orange-400">
              <h2 className="text-2xl font-bold text-orange-900 sketch-font flex items-center gap-2">
                🪣 Dream Adventures
              </h2>
              <p className="handwritten text-orange-700 mt-2">
                Bucket list of experiences and dreams to pursue
              </p>
            </div>
            
            <div className="p-6">
              {bucketList.length > 0 ? (
                <div className="space-y-4">
                  {bucketList.map((item, index) => (
                    <div key={item._id} className={`transform ${index % 4 === 0 ? 'rotate-2' : index % 4 === 1 ? '-rotate-1' : index % 4 === 2 ? 'rotate-1' : '-rotate-2'} hover:rotate-0 transition-transform duration-200`}>
                      <div className={`p-4 rounded-xl border-2 border-dashed sketch-border ${
                        item.status === 'completed' ? 'bg-orange-100 border-orange-400' :
                        item.status === 'in_progress' ? 'bg-yellow-50 border-yellow-300' :
                        'bg-white border-orange-300'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                            item.status === 'completed' ? 'bg-orange-600 border-orange-600' :
                            item.status === 'in_progress' ? 'bg-yellow-500 border-yellow-500' :
                            'bg-gray-400 border-gray-400'
                          }`}>
                            {item.status === 'completed' && <span className="text-white text-sm">✓</span>}
                            {item.status === 'in_progress' && <span className="text-white text-xs">•</span>}
                            {item.status === 'dream' && <span className="text-white text-xs">★</span>}
                          </div>
                          <div className="flex-1">
                            <h3 className={`handwritten font-bold text-lg ${
                              item.status === 'completed' ? 'line-through text-orange-700' : 'text-black'
                            }`}>
                              {item.title}
                            </h3>
                            <p className="text-gray-700 handwritten text-sm mt-1">{item.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
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
              ) : (
                <div className="text-center py-8">
                  <p className="handwritten text-gray-500">No bucket list items yet...</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Note */}
        <div className="text-center mt-8">
          <div className="inline-block bg-gray-100 border-2 border-dashed border-gray-400 rounded-2xl p-4 transform rotate-1 sketch-border">
            <p className="text-black handwritten">
              📝 <strong>Personal Journal:</strong> Development syncs from GitHub • Life content managed privately
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
