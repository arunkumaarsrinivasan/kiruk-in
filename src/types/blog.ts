import type { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'

export interface BlogArticle {
  id: string
  title: string
  slug: string
  domain: string[]
  excerpt: string
  publishedDate: string
  coverImage?: string
  content: BlockObjectResponse[]
  published: boolean
}

export interface BlogArticleSummary {
  id: string
  title: string
  slug: string
  domain: string[]
  excerpt: string
  publishedDate: string
  coverImage?: string
  published: boolean
}
