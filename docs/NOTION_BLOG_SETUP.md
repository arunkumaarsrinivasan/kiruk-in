# Notion Blog Setup Guide

## Overview

The blog integration uses the Notion API client (`@notionhq/client`) to fetch articles from your Notion database. This is the standard and recommended approach for integrating Notion into Next.js applications.

## MCP vs Direct API

- **MCP Tools**: Available to AI assistants for configuration and discovery, but not callable from runtime code
- **Notion API Client**: Used in runtime code (`src/lib/notion-blog.ts`) to fetch data from Notion

## Setup Steps

### 1. Create Notion Database

Create a new database in Notion with the following properties:

| Property Name | Type | Required | Description |
|--------------|------|----------|-------------|
| `Title` | Title | Yes | Article title |
| `Slug` | Rich Text | No | URL-friendly identifier (auto-generated if missing) |
| `Domain` | Multi-select | No | Categories/tags (e.g., Design, Development, Leadership) |
| `Excerpt` | Rich Text | No | Short description |
| `Published Date` | Date | No | Publication date (defaults to creation date) |
| `Cover Image` | Files | No | Optional cover image |
| `Published` | Checkbox | Yes | Whether article is published |

### 2. Get Database ID

1. Open your Notion database
2. Click "..." menu → "Copy link"
3. The URL will look like: `https://www.notion.so/workspace/DATABASE_ID?v=...`
4. Copy the `DATABASE_ID` (the part between the last `/` and `?`)

### 3. Create Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give it a name (e.g., "Blog Integration")
4. Select your workspace
5. Click "Submit"
6. Copy the "Internal Integration Token" (starts with `secret_`)

### 4. Share Database with Integration

1. Open your Notion database
2. Click "..." menu → "Connections" → "Add connections"
3. Search for and select your integration
4. Click "Confirm"

### 5. Configure Environment Variables

Add to `.env.local`:

```env
NOTION_API_SECRET=secret_your_integration_token_here
NOTION_BLOG_DB_ID=your_database_id_here
```

### 6. Test the Integration

1. Start your dev server: `npm run dev`
2. Visit `/blog` to see your articles
3. Create a test article in Notion with `Published` checked
4. Refresh the blog page to see it appear

## Current Implementation

The blog integration is implemented in:

- `src/lib/notion-blog.ts` - Notion API client wrapper
- `src/app/api/blog/route.ts` - API route for listing articles
- `src/app/api/blog/[slug]/route.ts` - API route for individual articles
- `src/app/blog/page.tsx` - Blog listing page
- `src/app/blog/[slug]/page.tsx` - Article detail page

## Using MCP for Configuration

If you have the Notion MCP plugin installed, you can use it to:
- Discover your databases
- Configure properties
- Test queries

However, the runtime integration will always use the Notion API client for performance and reliability.

## Troubleshooting

### Articles not showing up

1. Check that `Published` checkbox is checked in Notion
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Verify database is shared with your integration

### API errors

1. Verify `NOTION_API_SECRET` is correct
2. Verify `NOTION_BLOG_DB_ID` is correct
3. Check that database is shared with integration
4. Check Notion API status: https://status.notion.so/
