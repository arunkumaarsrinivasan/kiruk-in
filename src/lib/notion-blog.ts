import { Client } from '@notionhq/client'
import type { PageObjectResponse, QueryDatabaseResponse, BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import type { BlogArticle, BlogArticleSummary } from '@/types/blog'

interface NotionBlogConfig {
  secret?: string
  blogDatabaseId?: string
}

const notionBlogConfig: NotionBlogConfig = {
  secret: process.env.NOTION_API_SECRET,
  blogDatabaseId: process.env.NOTION_BLOG_DB_ID
}

const hasNotionBlogSetup = Boolean(
  notionBlogConfig.secret && notionBlogConfig.blogDatabaseId
)

const notionClient = hasNotionBlogSetup ? new Client({ auth: notionBlogConfig.secret }) : null

type PropertyValue = PageObjectResponse['properties'][string]

const readPlainText = (property: PropertyValue | undefined) => {
  if (!property) return ''
  if ('title' in property) {
    const items = property.title as Array<{ plain_text?: string }>
    return items.map((item) => item.plain_text ?? '').join(' ').trim()
  }
  if ('rich_text' in property) {
    const items = property.rich_text as Array<{ plain_text?: string }>
    return items.map((item) => item.plain_text ?? '').join(' ').trim()
  }
  return ''
}

const readMultiSelect = (property: PropertyValue | undefined) => {
  if (!property) return [] as string[]
  if ('multi_select' in property) {
    const items = property.multi_select as Array<{ name?: string }>
    return items.map((item) => item.name ?? '').filter(Boolean)
  }
  if ('select' in property && property.select) {
    return [property.select.name].filter(Boolean)
  }
  return []
}

const readDate = (property: PropertyValue | undefined) => {
  if (!property) return undefined
  if ('date' in property) return property.date?.start ?? undefined
  return undefined
}

const readCheckbox = (property: PropertyValue | undefined) => {
  if (!property) return false
  if ('checkbox' in property) return property.checkbox ?? false
  return false
}

const readFiles = (property: PropertyValue | undefined) => {
  if (!property) return undefined
  if ('files' in property) {
    const files = property.files as Array<{ file?: { url?: string }; external?: { url?: string } }>
    if (files.length > 0) {
      return files[0].file?.url || files[0].external?.url || undefined
    }
  }
  return undefined
}

async function queryDatabase(databaseId?: string) {
  if (!notionClient || !databaseId) return []
  const pages: QueryDatabaseResponse['results'] = []
  let cursor: string | undefined

  do {
    const response = await notionClient.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      sorts: [
        {
          property: 'Published Date',
          direction: 'descending'
        }
      ]
    })
    pages.push(...response.results)
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined
  } while (cursor)

  return pages
}

async function fetchPageContent(pageId: string): Promise<BlockObjectResponse[]> {
  if (!notionClient) return []
  const blocks: BlockObjectResponse[] = []
  let cursor: string | undefined

  do {
    const response = await notionClient.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor
    })
    blocks.push(...(response.results as BlockObjectResponse[]))
    cursor = response.next_cursor ?? undefined
  } while (cursor)

  return blocks
}

function isPageObject(entry: QueryDatabaseResponse['results'][number]): entry is PageObjectResponse {
  return entry.object === 'page'
}

function generateSlug(title: string, id: string): string {
  // Try to get slug from title or generate from title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^(-+)|(-+)$/g, '') // Remove leading and trailing dashes
  return slug || id.replaceAll('-', '')
}

export async function fetchBlogArticles(): Promise<BlogArticleSummary[]> {
  if (!notionClient || !notionBlogConfig.blogDatabaseId) return []

  const pages = await queryDatabase(notionBlogConfig.blogDatabaseId)

  const articles: BlogArticleSummary[] = pages
    .filter(isPageObject)
    .map((page: PageObjectResponse) => {
      const properties = page.properties

      const title = readPlainText(properties['Title']) || readPlainText(properties['Name'])
      const slugProperty = readPlainText(properties['Slug'])
      const slug = slugProperty || generateSlug(title, page.id)
      const domain = readMultiSelect(properties['Domain'])
      const excerpt = readPlainText(properties['Excerpt']) || ''
      const publishedDate = readDate(properties['Published Date']) || page.created_time
      const coverImage = readFiles(properties['Cover Image'])
      const published = readCheckbox(properties['Published'])

      return {
        id: page.id,
        title,
        slug,
        domain,
        excerpt,
        publishedDate,
        coverImage,
        published
      }
    })
    .filter(article => article.published) // Only return published articles
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())

  return articles
}

export async function fetchBlogArticleBySlug(slug: string): Promise<BlogArticle | null> {
  if (!notionClient || !notionBlogConfig.blogDatabaseId) return null

  const pages = await queryDatabase(notionBlogConfig.blogDatabaseId)

  const page = pages
    .filter(isPageObject)
    .find((page: PageObjectResponse) => {
      const properties = page.properties
      const title = readPlainText(properties['Title']) || readPlainText(properties['Name'])
      const slugProperty = readPlainText(properties['Slug'])
      const pageSlug = slugProperty || generateSlug(title, page.id)
      const published = readCheckbox(properties['Published'])
      return pageSlug === slug && published
    })

  if (!page || !isPageObject(page)) return null

  const properties = page.properties
  const title = readPlainText(properties['Title']) || readPlainText(properties['Name'])
  const slugProperty = readPlainText(properties['Slug'])
  const pageSlug = slugProperty || generateSlug(title, page.id)
  const domain = readMultiSelect(properties['Domain'])
  const excerpt = readPlainText(properties['Excerpt']) || ''
  const publishedDate = readDate(properties['Published Date']) || page.created_time
  const coverImage = readFiles(properties['Cover Image'])
  const published = readCheckbox(properties['Published'])

  const content = await fetchPageContent(page.id)

  return {
    id: page.id,
    title,
    slug: pageSlug,
    domain,
    excerpt,
    publishedDate,
    coverImage,
    content,
    published
  }
}

export const notionBlogIntegrationReady = hasNotionBlogSetup
