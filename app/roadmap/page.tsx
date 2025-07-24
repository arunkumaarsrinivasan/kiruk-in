'use client'

import { useEffect } from 'react'

export default function RoadmapPage() {
  useEffect(() => {
    window.location.href = '/progress'
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to progress dashboard...</p>
      </div>
    </div>
  )
}
