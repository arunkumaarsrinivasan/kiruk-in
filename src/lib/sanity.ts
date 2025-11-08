import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'dummy-project-id',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false, // Set to false for real-time updates
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN, // Only needed for write operations
})

const builder = imageUrlBuilder(client)

export const urlFor = (source: any) => builder.image(source)

// Helper function to fetch life goals
export async function getLifeGoals() {
  return client.fetch(`
    *[_type == "lifeGoal"] | order(priority asc, createdAt desc) {
      _id,
      title,
      description,
      category,
      priority,
      status,
      targetDate,
      progress,
      tags,
      createdAt,
      updatedAt
    }
  `)
}

// Helper function to fetch bucket list items
export async function getBucketList() {
  return client.fetch(`
    *[_type == "bucketListItem"] | order(priority asc, createdAt desc) {
      _id,
      title,
      description,
      category,
      priority,
      status,
      targetDate,
      location,
      estimatedCost,
      notes,
      tags,
      image,
      createdAt,
      completedAt
    }
  `)
}

// Helper function to fetch monthly goals
export async function getMonthlyGoals() {
  return client.fetch(`
    *[_type == "monthlyGoal"] | order(month desc) {
      _id,
      title,
      description,
      month,
      year,
      category,
      status,
      progress,
      goals[],
      achievements[],
      createdAt,
      updatedAt
    }
  `)
}

// Helper function to fetch life updates
export async function getLifeUpdates() {
  return client.fetch(`
    *[_type == "lifeUpdate"] | order(date desc) {
      _id,
      title,
      content,
      category,
      mood,
      date,
      tags,
      location,
      images,
      isPublic,
      createdAt
    }
  `)
}
