'use client'

import type { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface NotionRendererProps {
  blocks: BlockObjectResponse[]
  className?: string
}

export function NotionRenderer({ blocks, className }: NotionRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className={cn('text-sm font-mono', className)} style={{ color: 'var(--text-muted)' }}>
        No content available.
      </div>
    )
  }

  // Group consecutive list items
  const groupedBlocks: Array<BlockObjectResponse | BlockObjectResponse[]> = []
  let currentList: BlockObjectResponse[] | null = null
  let currentListType: 'bulleted_list_item' | 'numbered_list_item' | null = null

  blocks.forEach((block) => {
    if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
      if (
        currentList &&
        currentListType === block.type &&
        currentList.length > 0
      ) {
        currentList.push(block)
      } else {
        if (currentList) {
          groupedBlocks.push(currentList)
        }
        currentList = [block]
        currentListType = block.type
      }
    } else {
      if (currentList) {
        groupedBlocks.push(currentList)
        currentList = null
        currentListType = null
      }
      groupedBlocks.push(block)
    }
  })

  if (currentList) {
    groupedBlocks.push(currentList)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {groupedBlocks.map((blockOrGroup, idx) => {
        if (Array.isArray(blockOrGroup)) {
          const ListTag = blockOrGroup[0]?.type === 'numbered_list_item' ? 'ol' : 'ul'
          return (
            <ListTag key={`list-${idx}`} className="space-y-2">
              {blockOrGroup.map((block) => (
                <NotionBlock key={block.id} block={block} />
              ))}
            </ListTag>
          )
        }
        return <NotionBlock key={blockOrGroup.id} block={blockOrGroup} />
      })}
    </div>
  )
}

function NotionBlock({ block }: { block: BlockObjectResponse }) {
  const { type } = block

  switch (type) {
    case 'paragraph':
      return (
        <p
          className="text-base font-mono leading-relaxed"
          style={{ color: 'var(--text-main)' }}
        >
          {block.paragraph.rich_text.map((text, idx) => (
            <span
              key={idx}
              className={cn(
                text.annotations.bold && 'font-bold',
                text.annotations.italic && 'italic',
                text.annotations.code && 'font-mono bg-[var(--bg-card)] px-1 py-0.5 border border-[var(--border-color)] text-sm'
              )}
              style={{
                color: text.annotations.color !== 'default' ? text.annotations.color : undefined,
                textDecoration: text.annotations.underline ? 'underline' : undefined,
              }}
            >
              {text.plain_text}
            </span>
          ))}
        </p>
      )

    case 'heading_1':
      return (
        <h1
          className="text-3xl font-mono font-bold mt-8 mb-4"
          style={{ color: 'var(--accent-color)' }}
        >
          {block.heading_1.rich_text.map((text, idx) => (
            <span key={idx}>{text.plain_text}</span>
          ))}
        </h1>
      )

    case 'heading_2':
      return (
        <h2
          className="text-2xl font-mono font-bold mt-6 mb-3"
          style={{ color: 'var(--accent-color)' }}
        >
          {block.heading_2.rich_text.map((text, idx) => (
            <span key={idx}>{text.plain_text}</span>
          ))}
        </h2>
      )

    case 'heading_3':
      return (
        <h3
          className="text-xl font-mono font-bold mt-4 mb-2"
          style={{ color: 'var(--text-main)' }}
        >
          {block.heading_3.rich_text.map((text, idx) => (
            <span key={idx}>{text.plain_text}</span>
          ))}
        </h3>
      )

    case 'bulleted_list_item':
      return (
        <li className="text-base font-mono ml-6" style={{ color: 'var(--text-main)' }}>
          {block.bulleted_list_item.rich_text.map((text, idx) => (
            <span
              key={idx}
              className={cn(
                text.annotations.bold && 'font-bold',
                text.annotations.italic && 'italic',
                text.annotations.code && 'font-mono bg-[var(--bg-card)] px-1 py-0.5 border border-[var(--border-color)] text-sm'
              )}
            >
              {text.plain_text}
            </span>
          ))}
        </li>
      )

    case 'numbered_list_item':
      return (
        <li className="text-base font-mono ml-6" style={{ color: 'var(--text-main)' }}>
          {block.numbered_list_item.rich_text.map((text, idx) => (
            <span
              key={idx}
              className={cn(
                text.annotations.bold && 'font-bold',
                text.annotations.italic && 'italic',
                text.annotations.code && 'font-mono bg-[var(--bg-card)] px-1 py-0.5 border border-[var(--border-color)] text-sm'
              )}
            >
              {text.plain_text}
            </span>
          ))}
        </li>
      )

    case 'code':
      return (
        <pre
          className="p-4 border-2 overflow-x-auto font-mono text-sm"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)',
          }}
        >
          <code>{block.code.rich_text.map((text) => text.plain_text).join('')}</code>
        </pre>
      )

    case 'image': {
      const imageUrl =
        block.image.type === 'external'
          ? block.image.external.url
          : block.image.type === 'file'
            ? block.image.file.url
            : ''
      if (!imageUrl) return null
      return (
        <figure className="my-6 w-full">
          <div className="relative min-h-[12rem] w-full">
            <Image
              src={imageUrl}
              alt={block.image.caption?.[0]?.plain_text || 'Article image'}
              fill
              className="border-2 object-contain"
              style={{ borderColor: 'var(--border-color)' }}
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
          {block.image.caption && block.image.caption.length > 0 && (
            <figcaption
              className="mt-2 text-center text-sm font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              {block.image.caption.map((caption) => caption.plain_text).join('')}
            </figcaption>
          )}
        </figure>
      )
    }

    case 'quote':
      return (
        <blockquote
          className="border-l-4 pl-4 py-2 my-4 italic font-mono"
          style={{
            borderColor: 'var(--accent-color)',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-card)',
          }}
        >
          {block.quote.rich_text.map((text, idx) => (
            <span key={idx}>{text.plain_text}</span>
          ))}
        </blockquote>
      )

    case 'divider':
      return (
        <hr
          className="my-6 border-t-2"
          style={{ borderColor: 'var(--border-color)' }}
        />
      )

    case 'to_do':
      return (
        <div className="flex items-start gap-2 my-2">
          <input
            type="checkbox"
            checked={block.to_do.checked}
            readOnly
            className="mt-1 border-2"
            style={{ borderColor: 'var(--border-color)' }}
          />
          <span className="text-base font-mono" style={{ color: 'var(--text-main)' }}>
            {block.to_do.rich_text.map((text, idx) => (
              <span
                key={idx}
                className={cn(
                  block.to_do.checked && 'line-through opacity-60',
                  text.annotations.bold && 'font-bold',
                  text.annotations.italic && 'italic'
                )}
              >
                {text.plain_text}
              </span>
            ))}
          </span>
        </div>
      )

    default:
      return null
  }
}
