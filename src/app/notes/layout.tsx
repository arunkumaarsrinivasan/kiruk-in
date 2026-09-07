import { USE_KIRUK_HAND } from '@/lib/sketch-ink/config'

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="surface-paper relative z-20 min-h-screen"
      data-kiruk-hand={USE_KIRUK_HAND ? 'true' : 'false'}
    >
      {children}
    </div>
  )
}
