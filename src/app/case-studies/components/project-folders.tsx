'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PixelIcon } from '@/components/ui/PixelIcon';
import type { CharacterSide } from '@/components/ui/SplitCharacter';

type ProjectFolder = {
  id: string;
  name: string;
  icon: string;
  color: string;
  url?: string;
  description: string;
  type: 'behance' | 'playbook' | 'github' | 'codepen' | 'figma' | 'case-study' | 'portfolio';
  side: 'designer' | 'developer';
  comingSoon?: boolean;
  highlighted?: boolean;
};

const folders: ProjectFolder[] = [
  {
    id: 'spera',
    name: 'Spera.bot',
    icon: 'code-block',
    color: '#22d3ee',
    url: 'https://www.spera.bot',
    description: 'Founding design engineer · build & backtest crypto strategies',
    type: 'figma',
    side: 'developer',
    highlighted: true,
  },
  {
    id: 'square-bridge-figma',
    name: 'Square Bridge',
    icon: 'pencil-ruler',
    color: '#ec4899',
    url: 'https://www.figma.com/design/VtitVweV3Pus9chSeKA0VX/Finalized-Screen---Square-Bridge',
    description: 'Finalized screens · recruitment platform',
    type: 'figma',
    side: 'designer',
  },
  {
    id: 'behance',
    name: 'Behance',
    icon: 'pencil-ruler',
    color: '#1769FF',
    url: 'https://www.behance.net/arunkusriniva',
    description: 'Case studies with full process',
    type: 'behance',
    side: 'designer',
  },
  {
    id: 'playbook',
    name: 'Playbook',
    icon: 'book-heart',
    color: '#111111',
    url: 'https://playbook.com/arunkumaar',
    description: 'Quick snapshots & insights',
    type: 'playbook',
    side: 'designer',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'code-block',
    color: '#181717',
    url: 'https://github.com/arunkumaarsrinivasan',
    description: 'Repos & shipped code',
    type: 'github',
    side: 'developer',
  },
  {
    id: 'prags',
    name: 'PRAGS',
    icon: 'folder-open',
    color: '#F24E1E',
    url: 'https://www.prahatheesvar.in/',
    description: 'Scroll-to-play musician site',
    type: 'figma',
    side: 'developer',
  },
  {
    id: 'codepen',
    name: 'CodePen',
    icon: 'code',
    color: '#111111',
    url: 'https://codepen.io/arunkumaar',
    description: 'Frontend experiments',
    type: 'codepen',
    side: 'developer',
    comingSoon: true,
  },
];

type ProjectFoldersProps = {
  readonly onFolderClick?: (folder: ProjectFolder) => void;
  readonly activeSide?: CharacterSide;
};

export function ProjectFolders({ onFolderClick, activeSide }: ProjectFoldersProps) {
  const router = useRouter();

  const handleFolderClick = (folder: ProjectFolder) => {
    if (folder.comingSoon) return;

    if (folder.type === 'portfolio' && folder.url?.startsWith('/')) {
      router.push(folder.url);
    } else if (folder.url && folder.type !== 'case-study') {
      globalThis.open(folder.url, '_blank', 'noopener,noreferrer');
    } else {
      onFolderClick?.(folder);
    }
  };

  const sorted = activeSide
    ? [...folders].sort((a, b) => {
        if (a.side === activeSide && b.side !== activeSide) return -1;
        if (a.side !== activeSide && b.side === activeSide) return 1;
        return 0;
      })
    : folders;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
      {sorted.map((folder, index) => {
        const matches = !activeSide || folder.side === activeSide;
        return (
          <motion.div
            key={folder.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{
              opacity: matches ? 1 : 0.45,
              y: 0,
              scale: matches ? 1 : 0.98,
            }}
            transition={{
              delay: index * 0.04,
              layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
            }}
          >
            <motion.button
              type="button"
              onClick={() => handleFolderClick(folder)}
              disabled={folder.comingSoon}
              aria-disabled={folder.comingSoon}
              className="group relative flex w-full flex-col items-start gap-3 overflow-hidden p-4 text-left transition-colors sm:p-5"
              style={{
                minHeight: '148px',
                cursor: folder.comingSoon ? 'not-allowed' : 'pointer',
                border: `1px solid ${folder.highlighted && matches ? 'var(--accent-color)' : 'var(--border-color)'}`,
                borderRadius: 'var(--era-radius-md, 10px)',
                background:
                  folder.highlighted && matches
                    ? 'color-mix(in srgb, var(--accent-color) 10%, var(--bg-card))'
                    : 'var(--bg-card)',
                boxShadow: 'var(--era-shadow, none)',
              }}
              whileHover={
                folder.comingSoon ? undefined : { y: -3, transition: { duration: 0.18 } }
              }
              whileTap={folder.comingSoon ? undefined : { scale: 0.98 }}
            >
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: folder.color }}
                aria-hidden
              />

              <div className="flex w-full items-start justify-between gap-2">
                <PixelIcon name={folder.icon} size={40} className="shrink-0 text-current" />
                {!folder.comingSoon && folder.url && (
                  <span
                    className="text-sm opacity-40 transition-opacity group-hover:opacity-100"
                    style={{ color: 'var(--accent-color)' }}
                    aria-hidden
                  >
                    ↗
                  </span>
                )}
              </div>

              <div>
                <h3
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: 'var(--text-main)', fontFamily: 'var(--font-main)' }}
                >
                  {folder.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {folder.description}
                </p>
              </div>

              {folder.comingSoon && (
                <span
                  className="mt-auto text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--accent-color)' }}
                >
                  Coming soon
                </span>
              )}
            </motion.button>
          </motion.div>
        );
      })}
    </div>
  );
}
