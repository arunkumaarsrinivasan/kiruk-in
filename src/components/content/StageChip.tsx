import type { Stage } from '@/lib/content'

/**
 * Growth-stage chip (seedling / growing / evergreen) — the digital-garden
 * honesty signal. Styled to match the sketchbook's monospace chips and the
 * active era palette.
 */
const LABELS: Record<Stage, string> = {
  seedling: 'Seedling',
  growing: 'Growing',
  evergreen: 'Evergreen',
}

export function StageChip({ stage }: { stage: Stage }) {
  return (
    <span
      className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 border border-[var(--border-color)]"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--accent-color)' }}
    >
      {LABELS[stage]}
    </span>
  )
}
