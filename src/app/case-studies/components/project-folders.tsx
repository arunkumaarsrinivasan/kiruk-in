'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PixelIcon } from '@/components/ui/PixelIcon';

type ProjectFolder = {
  id: string;
  name: string;
  icon: string; // Pixel icon name
  color: string;
  url?: string;
  description: string;
  type: 'behance' | 'playbook' | 'github' | 'codepen' | 'figma' | 'case-study' | 'portfolio';
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
  },
  {
    id: 'playbook',
    name: 'Playbook',
    icon: 'book-heart',
    color: '#000000',
    url: 'https://playbook.com/arunkumaar',
    description: 'Quick project snapshots and insights',
    type: 'playbook',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'code-block',
    color: '#181717',
    url: 'https://github.com/arunkumaarsrinivasan',
    description: 'Code repositories and projects',
    type: 'github',
  },
  {
    id: 'codepen',
    name: 'CodePen',
    icon: 'code',
    color: '#000000',
    url: 'https://codepen.io/arunkumaar',
    description: 'Frontend experiments and prototypes',
    type: 'codepen',
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
  },
];

type ProjectFoldersProps = {
  onFolderClick?: (folder: ProjectFolder) => void;
};

export function ProjectFolders({ onFolderClick }: ProjectFoldersProps) {
  const router = useRouter();

  const handleFolderClick = (folder: ProjectFolder) => {
    // Don't handle clicks for coming soon items
    if (folder.comingSoon) {
      return;
    }
    
    if (folder.type === 'portfolio' && folder.url?.startsWith('/')) {
      router.push(folder.url);
    } else if (folder.url && folder.type !== 'case-study') {
      window.open(folder.url, '_blank');
    } else if (folder.type === 'case-study') {
      onFolderClick?.(folder);
    } else {
      onFolderClick?.(folder);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        className="wireframe-border p-6 mb-8"
        style={{
          backgroundColor: 'var(--bg-card)',
          imageRendering: 'pixelated' as any,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-mono text-3xl font-bold uppercase mb-2" style={{ color: 'var(--accent-color)' }}>
          Project Folders
        </h2>
        <p className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
          Explore my work across different platforms
        </p>
      </motion.div>

      {/* Shelf Container */}
      <div className="relative py-8">
        {/* Shelf Background - Top and Bottom Borders */}
        <div 
          className="absolute left-0 right-0"
          style={{
            top: '0px',
            height: '8px',
            backgroundColor: 'var(--border-color)',
            borderTop: '4px solid var(--border-color)',
            borderBottom: '2px solid var(--border-color)',
            imageRendering: 'pixelated' as any,
            zIndex: 1,
          }}
        />
        <div 
          className="absolute left-0 right-0"
          style={{
            bottom: '0px',
            height: '8px',
            backgroundColor: 'var(--border-color)',
            borderTop: '2px solid var(--border-color)',
            borderBottom: '4px solid var(--border-color)',
            imageRendering: 'pixelated' as any,
            zIndex: 1,
          }}
        />
        
        {/* Folders Grid - Shelf Layout */}
        <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 z-10" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        {folders.map((folder, index) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <motion.button
              type="button"
              onClick={() => handleFolderClick(folder)}
              disabled={folder.comingSoon}
              className={`w-full wireframe-border p-6 flex flex-col items-center justify-center gap-3 group relative ${
                folder.highlighted ? 'ring-4 ring-[var(--accent-color)] ring-offset-2 ring-offset-[var(--bg-main)]' : ''
              }`}
              style={{
                backgroundColor: folder.highlighted ? 'color-mix(in srgb, var(--accent-color) 15%, var(--bg-card))' : 'var(--bg-card)',
                imageRendering: 'pixelated' as any,
                minHeight: '200px',
                opacity: folder.comingSoon ? 0.85 : 1,
                cursor: folder.comingSoon ? 'not-allowed' : 'pointer',
                boxShadow: folder.highlighted ? '0 0 24px color-mix(in srgb, var(--accent-color) 40%, transparent)' : undefined,
              }}
              whileHover={folder.comingSoon ? {} : { scale: 1.05, y: -4 }}
              whileTap={folder.comingSoon ? {} : { scale: 0.95 }}
            >
              {/* Folder Icon - Pixel Icon */}
              <div
                className="mb-2 flex items-center justify-center"
                style={{
                  imageRendering: 'pixelated' as any,
                }}
              >
                <PixelIcon name={folder.icon} size={64} className="text-current" />
              </div>
              
              {/* Folder Label */}
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

              {/* Folder Tab (top) */}
              <div
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 wireframe-border px-4 py-1"
                style={{
                  backgroundColor: folder.color,
                  imageRendering: 'pixelated' as any,
                  width: '60%',
                }}
              >
                <div className="h-1" />
              </div>

              {/* Pixelated Pattern Overlay */}
              <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 4px, var(--border-color) 4px, var(--border-color) 5px),
                    repeating-linear-gradient(90deg, transparent, transparent 4px, var(--border-color) 4px, var(--border-color) 5px)
                  `,
                  backgroundSize: '8px 8px',
                  imageRendering: 'pixelated' as any,
                }}
              />
            </motion.button>

            {/* Coming Soon Badge */}
            {folder.comingSoon && (
              <div 
                className="absolute top-2 right-2 wireframe-border px-2 py-1"
                style={{
                  backgroundColor: 'var(--accent-color)',
                  imageRendering: 'pixelated' as any,
                }}
              >
                <span 
                  className="font-mono text-[8px] font-bold uppercase"
                  style={{ color: 'var(--bg-main)' }}
                >
                  COMING SOON
                </span>
              </div>
            )}

            {/* External Link Indicator */}
            {folder.url && folder.type !== 'case-study' && !folder.comingSoon && (
              <div className="absolute top-2 right-2">
                <span className="text-xs">↗</span>
              </div>
            )}
          </motion.div>
        ))}
        </div>
      </div>

      {/* Additional Info */}
      <motion.div
        className="wireframe-border p-6 mt-8"
        style={{
          backgroundColor: 'var(--bg-card)',
          imageRendering: 'pixelated' as any,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="font-mono text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Click on any folder to explore the projects. Each folder contains different types of work and documentation.
        </p>
      </motion.div>
    </div>
  );
}
