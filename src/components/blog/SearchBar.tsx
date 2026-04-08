'use client'

import { PixelIcon } from '@/components/ui/PixelIcon'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search articles...' }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <PixelIcon name="search" size={16} style={{ color: 'var(--text-muted)' }} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full pl-10 pr-4 py-3 font-mono text-sm',
          'border-2 border-[var(--border-color)] bg-[var(--bg-card)]',
          'focus:outline-none focus:border-[var(--accent-color)]',
          'placeholder:text-[var(--text-muted)]',
          'transition-colors'
        )}
        style={{ color: 'var(--text-main)' }}
      />
    </div>
  )
}
