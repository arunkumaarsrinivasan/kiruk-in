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
    id: 'portfolio',
    name: 'Portfolio',
    icon: 'folder-open',
    color: '#FFD93D',
    url: '/portfolio',
    description: 'Figma portfolio slides and design work',
    type: 'portfolio',
    side: 'designer',
    highlighted: true,
  },
  {
    id: 'behance',
    name: 'Behance',
    icon: 'pencil-ruler',
    color: '#1769FF',
    url: 'https://www.behance.net/arunkusriniva',
    description: 'Detailed case studies with full design process',
    type: 'behance',
    side: 'designer',
  },
  {
    id: 'playbook',
    name: 'Playbook',
    icon: 'book-heart',
    color: '#000000',
    url: 'https://playbook.com/arunkumaar',
    description: 'Quick project snapshots and insights',
    type: 'playbook',
    side: 'designer',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'code-block',
    color: '#181717',
    url: 'https://github.com/arunkumaarsrinivasan',
    description: 'Code repositories and projects',
    type: 'github',
    side: 'developer',
  },
  {
    id: 'codepen',
    name: 'CodePen',
    icon: 'code',
    color: '#000000',
    url: 'https://codepen.io/arunkumaar',
    description: 'Frontend experiments and prototypes',
    type: 'codepen',
    side: 'developer',
    comingSoon: true,
  },
  {
    id: 'figma',
    name: 'Figma Files',
    icon: 'pencil-ruler',
    color: '#F24E1E',
    url: 'https://www.figma.com/@arunkumaar',
    description: 'Design files and prototypes',
    type: 'figma',
    side: 'designer',
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
      globalThis.open(folder.url, '_blank');
    } else {
      onFolderClick?.(folder);
    }
  };

  // Sort: matching side first when a side is active
  const sorted = activeSide
    ? [...folders].sort((a, b) => {
        if (a.side === activeSide && b.side !== activeSide) return -1;
        if (a.side !== activeSide && b.side === activeSide) return 1;
        return 0;
      })
    : folders;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative py-4">
        <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 z-10">
          {sorted.map((folder, index) => {
            const matches = !activeSide || folder.side === activeSide;
            return (
              <motion.div
                key={folder.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{
                  opacity: matches ? 1 : 0.35,
                  y: 0,
                  scale: matches ? 1 : 0.95,
                }}
                transition={{
                  delay: index * 0.06,
                  layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 },
                }}
                className="relative"
              >
                <motion.button
                  type="button"
                  onClick={() => handleFolderClick(folder)}
                  disabled={folder.comingSoon}
                  className={`w-full wireframe-border p-6 flex flex-col items-center justify-center gap-3 group relative ${
                    folder.highlighted && matches ? 'ring-4 ring-[var(--accent-color)] ring-offset-2 ring-offset-[var(--bg-main)]' : ''
                  }`}
                  style={{
                    backgroundColor: folder.highlighted && matches
                      ? 'color-mix(in srgb, var(--accent-color) 15%, var(--bg-card))'
                      : 'var(--bg-card)',
                    minHeight: '160px',
                    cursor: folder.comingSoon ? 'not-allowed' : 'pointer',
                    boxShadow: folder.highlighted && matches
                      ? '0 0 24px color-mix(in srgb, var(--accent-color) 40%, transparent)'
                      : undefined,
                    filter: matches ? 'none' : 'grayscale(0.6)',
                    pointerEvents: matches ? 'auto' : 'none',
                  }}
                  whileHover={folder.comingSoon || !matches ? {} : { scale: 1.05, y: -4 }}
                  whileTap={folder.comingSoon || !matches ? {} : { scale: 0.95 }}
                >
                  <div className="mb-2 flex items-center justify-center">
                    <PixelIcon name={folder.icon} size={64} className="text-current" />
                  </div>

                  <div className="text-center">
                    <h3
                      className="font-mono text-sm font-bold uppercase mb-1"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {folder.name}
                    </h3>
                    <p
                      className="font-mono text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {folder.description}
                    </p>
                  </div>

                  <div
                    className="absolute -top-2 left-1/2 transform -translate-x-1/2 wireframe-border px-4 py-1"
                    style={{
                      backgroundColor: folder.color,
                      width: '60%',
                    }}
                  >
                    <div className="h-1" />
                  </div>

                  <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                      backgroundImage: `
                        repeating-linear-gradient(0deg, transparent, transparent 4px, var(--border-color) 4px, var(--border-color) 5px),
                        repeating-linear-gradient(90deg, transparent, transparent 4px, var(--border-color) 4px, var(--border-color) 5px)
                      `,
                      backgroundSize: '8px 8px',
                    }}
                  />
                </motion.button>

                {folder.comingSoon && (
                  <div
                    className="absolute top-2 right-2 wireframe-border px-2 py-1"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    <span
                      className="font-mono text-[8px] font-bold uppercase"
                      style={{ color: 'var(--bg-main)' }}
                    >
                      COMING SOON
                    </span>
                  </div>
                )}

                {folder.url && folder.type !== 'case-study' && !folder.comingSoon && (
                  <div className="absolute top-2 right-2">
                    <span className="text-xs">↗</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
