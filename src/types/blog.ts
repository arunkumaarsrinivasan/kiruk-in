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

/** Full article: summary fields + the raw MDX body (rendered on the server). */
export interface BlogArticle extends BlogArticleSummary {
  body: string
}
