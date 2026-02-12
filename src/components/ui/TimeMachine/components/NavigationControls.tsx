'use client';

export function NavigationFooter() {
  return (
    <div className="flex items-center justify-center gap-5 md:gap-8 px-6 md:px-10 py-3 border-t-2 border-[var(--border-color)] bg-[var(--bg-main)] flex-shrink-0">
      <span className="font-mono text-xs md:text-sm text-[var(--text-muted)] flex items-center gap-2">
        <kbd className="px-2 py-1 text-[10px] md:text-xs border-2 border-[var(--border-color)] bg-[var(--bg-card)] rounded-sm">&larr;</kbd>
        <kbd className="px-2 py-1 text-[10px] md:text-xs border-2 border-[var(--border-color)] bg-[var(--bg-card)] rounded-sm">&rarr;</kbd>
        Navigate
      </span>
      <span className="hidden md:flex font-mono text-xs md:text-sm text-[var(--text-muted)] items-center gap-2">
        Click to Select
      </span>
      <span className="font-mono text-xs md:text-sm text-[var(--text-muted)] flex items-center gap-2">
        <kbd className="px-2 py-1 text-[10px] md:text-xs border-2 border-[var(--accent-color)] bg-[var(--bg-card)] text-[var(--accent-color)] rounded-sm">Enter</kbd>
        Apply
      </span>
      <span className="font-mono text-xs md:text-sm text-[var(--text-muted)] flex items-center gap-2">
        <kbd className="px-2 py-1 text-[10px] md:text-xs border-2 border-[var(--border-color)] bg-[var(--bg-card)] rounded-sm">Esc</kbd>
        Close
      </span>
    </div>
  );
}
