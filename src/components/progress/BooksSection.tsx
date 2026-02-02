'use client';

import { useMemo } from 'react';
import { books, getBookStats, Book, BookStatus } from '@/data/life-progress-data';

interface BooksSectionProps {
  className?: string;
}

const statusColors: Record<BookStatus, string> = {
  reading: '#7C3AED',
  completed: '#10B981',
  'to-read': '#6B7280',
  dropped: '#EF4444',
};



export function BooksSection({ className = '' }: BooksSectionProps) {
  const stats = useMemo(() => getBookStats(), []);

  // Group books by status
  const groupedBooks = useMemo(() => {
    const groups: Record<BookStatus, Book[]> = {
      reading: [],
      completed: [],
      'to-read': [],
      dropped: [],
    };
    books.forEach(book => {
      groups[book.status].push(book);
    });
    return groups;
  }, []);

  return (
    <div
      className={`p-6 ${className}`}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: 'var(--border-width) solid var(--border-color)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📚</span>
          <div>
            <h2
              className="text-2xl font-mono uppercase tracking-wider"
              style={{ color: 'var(--text-main)' }}
            >
              Reading Journey
            </h2>
            <p
              className="text-sm font-mono mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Started 2026 · Building the habit
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4">
          <QuickStat value={stats.reading} label="Reading" color={statusColors.reading} />
          <QuickStat value={stats.completed} label="Done" color={statusColors.completed} />
          <QuickStat value={stats.toRead} label="Queue" color={statusColors['to-read']} />
        </div>
      </div>

      {/* Currently Reading - Featured */}
      {groupedBooks.reading.length > 0 && (
        <div className="mb-6">
          <h3
            className="text-sm font-mono uppercase tracking-wider mb-3"
            style={{ color: 'var(--accent-color)' }}
          >
            📖 Currently Reading
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {groupedBooks.reading.map(book => (
              <BookCard key={book.id} book={book} featured />
            ))}
          </div>
        </div>
      )}

      {/* To Read Queue */}
      {groupedBooks['to-read'].length > 0 && (
        <div>
          <h3
            className="text-sm font-mono uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            📋 Up Next
          </h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {groupedBooks['to-read'].map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Books */}
      {groupedBooks.completed.length > 0 && (
        <div className="mt-6">
          <h3
            className="text-sm font-mono uppercase tracking-wider mb-3"
            style={{ color: statusColors.completed }}
          >
            ✓ Completed
          </h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {groupedBooks.completed.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BookCard({ book, featured = false }: { book: Book; featured?: boolean }) {
  return (
    <div
      className={`p-4 transition-all duration-200 hover:translate-y-[-2px] ${featured ? 'md:flex md:gap-4' : ''}`}
      style={{
        backgroundColor: 'var(--bg-main)',
        border: featured
          ? `2px solid ${statusColors[book.status]}`
          : '1px solid var(--border-color)',
      }}
    >
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`font-mono ${featured ? 'text-lg' : 'text-sm'}`}
            style={{ color: 'var(--text-main)' }}
          >
            {book.title}
          </h4>
          {book.rating && (
            <div className="flex-shrink-0">
              {'★'.repeat(book.rating)}
              {'☆'.repeat(5 - book.rating)}
            </div>
          )}
        </div>
        <p
          className="text-sm font-mono mt-1"
          style={{ color: 'var(--text-muted)' }}
        >
          by {book.author}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span
            className="px-2 py-0.5 text-xs font-mono rounded"
            style={{
              backgroundColor: `${statusColors[book.status]}20`,
              color: statusColors[book.status],
            }}
          >
            {book.genre}
          </span>
          {book.startDate && (
            <span
              className="text-xs font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              Started {book.startDate}
            </span>
          )}
        </div>
        {featured && book.notes && (
          <p
            className="text-sm mt-3"
            style={{ color: 'var(--text-muted)' }}
          >
            {book.notes}
          </p>
        )}
      </div>
    </div>
  );
}

function QuickStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <div
        className="text-2xl font-mono font-bold"
        style={{ color }}
      >
        {value}
      </div>
      <div
        className="text-xs font-mono uppercase"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </div>
    </div>
  );
}

export default BooksSection;
