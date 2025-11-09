import { Client } from '@notionhq/client'
import type { PageObjectResponse, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints'

interface NotionConfig {
  secret?: string
  lifeGoalsDatabaseId?: string
  bucketListDatabaseId?: string
  monthlyGoalsDatabaseId?: string
}

const notionConfig: NotionConfig = {
  secret: process.env.NOTION_API_SECRET,
  lifeGoalsDatabaseId: process.env.NOTION_LIFE_GOALS_DB_ID,
  bucketListDatabaseId: process.env.NOTION_BUCKET_LIST_DB_ID,
  monthlyGoalsDatabaseId: process.env.NOTION_MONTHLY_GOALS_DB_ID
}

const hasNotionSetup = Boolean(
  notionConfig.secret &&
  (notionConfig.lifeGoalsDatabaseId || notionConfig.bucketListDatabaseId || notionConfig.monthlyGoalsDatabaseId)
)

const notionClient = hasNotionSetup ? new Client({ auth: notionConfig.secret }) : null

type PropertyValue = QueryDatabaseResponse['results'][number]['properties'][string]

type LifeGoal = {
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

type BucketListItem = {
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

type MonthlyGoal = {
  _id: string
  title: string
  description: string
  month: number
  year: number
  category: string
  status: string
  progress: number
  goals: Array<{ goal: string; completed: boolean; note?: string }>
  achievements: Array<{ achievement: string; date?: string; note?: string }>
}

type NotionProgressPayload = {
  lifeGoals: LifeGoal[]
  bucketList: BucketListItem[]
  monthlyGoals: MonthlyGoal[]
}

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
  if ('formula' in property) {
    const { formula } = property
    if (formula?.type === 'string') return formula.string ?? ''
    if (formula?.type === 'number') return formula.number?.toString() ?? ''
  }
  return ''
}

const readNumber = (property: PropertyValue | undefined) => {
  if (!property) return undefined
  if ('number' in property) return property.number ?? undefined
  if ('rich_text' in property) {
    const items = property.rich_text as Array<{ plain_text?: string }>
    const numeric = parseFloat(items.map((item) => item.plain_text ?? '').join(' '))
    return Number.isFinite(numeric) ? numeric : undefined
  }
  if ('formula' in property && property.formula?.type === 'number') {
    return property.formula.number ?? undefined
  }
  return undefined
}

const readSelect = (property: PropertyValue | undefined) => {
  if (!property) return ''
  if ('select' in property) return property.select?.name ?? ''
  if ('status' in property) return property.status?.name ?? ''
  if ('multi_select' in property) {
    const items = property.multi_select as Array<{ name?: string }>
    return items.map((item) => item.name ?? '').join(', ')
  }
  return ''
}

const readMultiSelect = (property: PropertyValue | undefined) => {
  if (!property) return [] as string[]
  if ('multi_select' in property) {
    const items = property.multi_select as Array<{ name?: string }>
    return items.map((item) => item.name ?? '').filter(Boolean)
  }
  if ('relation' in property) {
    const items = property.relation as Array<{ id: string }>
    return items.map((item) => item.id)
  }
  return []
}

const readDate = (property: PropertyValue | undefined) => {
  if (!property) return undefined
  if ('date' in property) return property.date?.start ?? undefined
  return undefined
}

const parseChecklist = (text: string) => {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const completed = /^\[(x|X|✔)\]/.test(line)
      const cleaned = line.replace(/^\[(x|X|✔| )\]\s*/i, '').replace(/^[-*+]\s*/, '').trim()
      return { completed, text: cleaned }
    })
}

const parseAchievements = (text: string) => {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [firstPart, ...rest] = line.split('|').map((part) => part.trim())
      return {
        achievement: firstPart,
        note: rest.join(' | ') || undefined
      }
    })
}

async function queryDatabase(databaseId?: string) {
  if (!notionClient || !databaseId) return []
  const pages: QueryDatabaseResponse['results'] = []
  let cursor: string | undefined

  do {
    const response = await notionClient.databases.query({
      database_id: databaseId,
      start_cursor: cursor
    })
    pages.push(...response.results)
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined
  } while (cursor)

  return pages
}

function isPageObject(entry: QueryDatabaseResponse['results'][number]): entry is PageObjectResponse {
  return entry.object === 'page'
}

export async function fetchNotionProgress(): Promise<NotionProgressPayload | null> {
  if (!notionClient) return null

  console.log('Notion integration config', {
    ready: notionIntegrationReady,
    lifeGoalsDb: notionConfig.lifeGoalsDatabaseId,
    bucketListDb: notionConfig.bucketListDatabaseId,
    monthlyGoalsDb: notionConfig.monthlyGoalsDatabaseId
  })

  const [goalPages, bucketPages, monthlyPages] = await Promise.all([
    queryDatabase(notionConfig.lifeGoalsDatabaseId),
    queryDatabase(notionConfig.bucketListDatabaseId),
    queryDatabase(notionConfig.monthlyGoalsDatabaseId)
  ])

  const lifeGoals: LifeGoal[] = goalPages.filter(isPageObject).map((page: PageObjectResponse) => {
    const properties = page.properties

    return {
      _id: page.id,
      title: readPlainText(properties['Name']) || readPlainText(properties['Title']),
      description: readPlainText(properties['Description']),
      category: readSelect(properties['Category']),
      priority: readSelect(properties['Priority']),
      status: readSelect(properties['Status']) || readSelect(properties['State']) || 'pending',
      progress: readNumber(properties['Progress']) ?? 0,
      targetDate: readDate(properties['Target Date']),
      tags: readMultiSelect(properties['Tags']),
    }
  })

  const bucketList: BucketListItem[] = bucketPages.filter(isPageObject).map((page: PageObjectResponse) => {
    const properties = page.properties
    return {
      _id: page.id,
      title: readPlainText(properties['Name']) || readPlainText(properties['Title']),
      description: readPlainText(properties['Description']),
      category: readSelect(properties['Category']),
      priority: readSelect(properties['Priority']),
      status: readSelect(properties['Status']) || 'dream',
      targetDate: readDate(properties['Target Date']),
      location: readPlainText(properties['Location']),
      estimatedCost: readNumber(properties['Estimate']),
      tags: readMultiSelect(properties['Tags'])
    }
  })

  const monthlyGoals: MonthlyGoal[] = monthlyPages.filter(isPageObject).map((page: PageObjectResponse) => {
    const properties = page.properties
    const goalsChecklist = parseChecklist(readPlainText(properties['Goals']))
    const achievementsList = parseAchievements(readPlainText(properties['Wins']))

    return {
      _id: page.id,
      title: readPlainText(properties['Name']) || readPlainText(properties['Title']),
      description: readPlainText(properties['Summary']),
      month: Number(readNumber(properties['Month']) ?? new Date().getMonth() + 1),
      year: Number(readNumber(properties['Year']) ?? new Date().getFullYear()),
      category: readSelect(properties['Category']),
      status: readSelect(properties['Status']) || 'in_progress',
      progress: readNumber(properties['Progress']) ?? 0,
      goals: goalsChecklist.map((goal) => ({ goal: goal.text, completed: goal.completed })),
      achievements: achievementsList.map((item) => ({ achievement: item.achievement, note: item.note }))
    }
  })

  console.log('Notion payload counts', {
    lifeGoals: lifeGoals.length,
    bucketList: bucketList.length,
    monthlyGoals: monthlyGoals.length
  })

  if (!lifeGoals.length && !bucketList.length && !monthlyGoals.length) {
    return null
  }

  return {
    lifeGoals,
    bucketList,
    monthlyGoals
  }
}

export const notionIntegrationReady = hasNotionSetup
