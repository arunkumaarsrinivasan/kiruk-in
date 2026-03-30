'use client'

import { PixelIcon } from '@/components/ui/PixelIcon'
import { cn } from '@/lib/utils'

interface DomainFilterProps {
  domains: string[]
  selectedDomains: string[]
  onToggleDomain: (domain: string) => void
}

export function DomainFilter({ domains, selectedDomains, onToggleDomain }: DomainFilterProps) {
  if (domains.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {domains.map((domain) => {
        const isSelected = selectedDomains.includes(domain)
        return (
          <button
            key={domain}
            onClick={() => onToggleDomain(domain)}
            className={cn(
              'px-3 py-2 text-sm font-mono border-2 transition-all',
              'flex items-center gap-2',
              isSelected
                ? 'bg-[var(--accent-color)] text-[var(--bg-main)] border-[var(--accent-color)]'
                : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-color)] hover:border-[var(--accent-color)]'
            )}
          >
            {isSelected && <PixelIcon name="check" size={12} />}
            {domain}
          </button>
        )
      })}
    </div>
  )
}
