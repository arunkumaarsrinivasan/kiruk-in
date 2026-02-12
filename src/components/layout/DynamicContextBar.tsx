'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GRID_SIZE, cn } from '@/lib/utils';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { useContextBar } from '@/contexts/ContextBarContext';

// Contact info (shared from contact page)
const _CONTACT_INFO = {
  email: {
    label: 'Email',
    value: 'arunkumaar.srinivasan@gmail.com',
    icon: 'envelope',
    href: 'mailto:arunkumaar.srinivasan@gmail.com',
  },
  linkedin: {
    label: 'LinkedIn',
    value: '/in/arunkumaarsreenivasan',
    icon: 'user',
    href: 'https://linkedin.com/in/arunkumaarsreenivasan/',
  },
  instagram_personal: {
    label: 'Instagram',
    value: '@arunum.avan.seyalum',
    icon: 'globe',
    href: 'https://instagram.com/arunum.avan.seyalum',
  },
  instagram_pro: {
    label: 'Instagram Pro',
    value: '@kirukism',
    icon: 'globe',
    href: 'https://instagram.com/kirukism',
  },
  github: {
    label: 'GitHub',
    value: '@arunkumaars',
    icon: 'folder',
    href: 'https://github.com/arunkumaars',
  },
  twitter: {
    label: 'Twitter',
    value: '@kirukism',
    icon: 'globe',
    href: 'https://twitter.com/kirukism',
  },
};

interface ContextBarItem {
  id: string;
  label: string;
  anchor?: string;
  href?: string;
  icon?: string;
  onClick?: () => void;
}

const BAR_HEIGHT = GRID_SIZE * 2; // 40px

// About page timeline phases
function _getTimelinePhase(age: number) {
  if (age <= 6) return 'Kid';
  if (age <= 12) return 'Child';
  if (age <= 17) return 'School';
  if (age <= 22) return 'College';
  return 'Work';
}

// Smooth scroll to anchor
function scrollToAnchor(anchor: string) {
  const element = document.querySelector(anchor);
  if (element) {
    const headerOffset = 120; // Account for main nav + context bar
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
}

// About Page Content
function AboutContextBar() {
  const { data, onAboutPhaseClick } = useContextBar();
  const aboutData = data.about;

  const phases = useMemo(() => {
    if (aboutData?.phases) {
      return aboutData.phases.map((p) => ({ phase: p.phase, year: p.year }));
    }
    // Fallback to default phases
    return [
      { phase: 'Work', year: 2023 },
      { phase: 'College', year: 2019 },
      { phase: 'School', year: 2013 },
      { phase: 'Child', year: 2007 },
      { phase: 'Kid', year: 2001 },
    ];
  }, [aboutData]);

  const currentPhase = aboutData?.currentPhase || phases[0]?.phase;

  const timelineItems: ContextBarItem[] = useMemo(() => {
    return phases.map((p) => ({
      id: p.phase.toLowerCase(),
      label: p.phase,
      anchor: `#phase-${p.phase.toLowerCase()}`,
      onClick: () => {
        // Use handler from context if available, otherwise try scrolling
        if (onAboutPhaseClick) {
          onAboutPhaseClick(p.phase);
        } else {
          // Fallback: try to scroll to phase section
          const phaseAnchor = `#phase-${p.phase.toLowerCase()}`;
          const element = document.querySelector(phaseAnchor);
          if (element) {
            scrollToAnchor(phaseAnchor);
          } else {
            scrollToAnchor('#main-content');
          }
        }
      },
    }));
  }, [phases, onAboutPhaseClick]);

  return (
    <div className="flex items-center justify-between w-full h-full px-2 sm:px-4 gap-2 sm:gap-4">
      {/* Timeline Phases */}
      <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 overflow-x-auto scrollbar-hide h-full">
        <span className="text-[9px] sm:text-[10px] font-mono uppercase text-[var(--text-muted)] whitespace-nowrap hidden sm:inline">
          Timeline:
        </span>
        {timelineItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={item.onClick}
            className={cn(
              'px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-mono uppercase border transition-colors whitespace-nowrap',
              currentPhase === item.label
                ? 'bg-[var(--accent-color)] text-[var(--bg-main)] border-[var(--accent-color)]'
                : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]'
            )}
            title={`Jump to ${item.label} phase`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {item.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Work Page Content
function WorkContextBar() {
  const { data, onWorkExperienceClick } = useContextBar();
  const workData = data.work;

  const experiences = useMemo(() => {
    if (workData?.experiences && workData.experiences.length > 0) {
      return workData.experiences;
    }
    // Fallback to default experiences
    return [
      { id: 'hp-ux-designer', company: 'HP Inc', start: '2023-08', current: true },
      { id: 'sns-square-product-designer', company: 'SNS Square', start: '2023-02', end: '2023-07' },
      { id: 'peoplegamez-intern', company: 'PeopleGamez', start: '2022-11', end: '2023-01' },
      { id: 'freelance-general', company: 'Freelance', start: '2020-01', end: '2023-12' },
    ];
  }, [workData]);

  const experienceItems: ContextBarItem[] = useMemo(() => {
    return experiences.map((exp) => ({
      id: exp.id,
      label: exp.company,
      anchor: `#experience-${exp.id}`,
      onClick: () => {
        // Use handler from context to select experience in ObservatoryView
        if (onWorkExperienceClick) {
          onWorkExperienceClick(exp.id);
        } else {
          // Fallback: try scrolling
          scrollToAnchor(`#experience-${exp.id}`);
        }
      },
    }));
  }, [experiences, onWorkExperienceClick]);

  const currentExp = experiences.find((e) => e.current);

  return (
    <div className="flex items-center justify-between w-full h-full px-2 sm:px-4 gap-2 sm:gap-4">
      {/* Work Experience Timeline */}
      <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 overflow-x-auto scrollbar-hide h-full">
        <span className="text-[9px] sm:text-[10px] font-mono uppercase text-[var(--text-muted)] whitespace-nowrap hidden sm:inline">
          Experience:
        </span>
        {experienceItems.map((item) => {
          const exp = experiences.find((e) => e.id === item.id);
          const isCurrent = exp?.current;
          return (
            <motion.button
              key={item.id}
              onClick={item.onClick}
              className={cn(
                'px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-mono uppercase border transition-colors whitespace-nowrap flex items-center gap-0.5 sm:gap-1',
                isCurrent
                  ? 'bg-[var(--accent-color)] text-[var(--bg-main)] border-[var(--accent-color)]'
                  : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isCurrent && <span className="text-[8px]">●</span>}
              {item.label}
            </motion.button>
          );
        })}
      </div>

      {/* Current Job Indicator */}
      {currentExp && (
        <div className="text-[9px] sm:text-[10px] font-mono text-[var(--text-muted)] whitespace-nowrap hidden sm:block">
          Current: <span className="text-[var(--accent-color)]">{currentExp.company}</span>
        </div>
      )}
    </div>
  );
}

// Progress Page Content
function ProgressContextBar() {
  const { data, onProgressSectionClick } = useContextBar();
  const progressData = data.progress;

  const activeSection = progressData?.activeSection || 'monthly';

  const recentMonths = useMemo(() => {
    if (progressData?.monthlyGoals && progressData.monthlyGoals.length > 0) {
      return progressData.monthlyGoals.slice(0, 3);
    }
    return [];
  }, [progressData]);

  const bucketItems = useMemo(() => {
    if (progressData?.bucketList && progressData.bucketList.length > 0) {
      return progressData.bucketList.slice(0, 3);
    }
    return [];
  }, [progressData]);

  const sectionItems: ContextBarItem[] = useMemo(() => {
    return [
      {
        id: 'monthly',
        label: 'Monthly',
        anchor: '#notion-boards',
        icon: 'calender',
        onClick: () => {
          if (onProgressSectionClick) {
            onProgressSectionClick('monthly');
          } else {
            scrollToAnchor('#notion-boards');
          }
        },
      },
      {
        id: 'bucket',
        label: 'Bucket List',
        anchor: '#notion-boards',
        icon: 'globe',
        onClick: () => {
          if (onProgressSectionClick) {
            onProgressSectionClick('bucket');
          } else {
            scrollToAnchor('#notion-boards');
          }
        },
      },
      {
        id: 'goals',
        label: 'Life Goals',
        anchor: '#notion-boards',
        icon: 'star',
        onClick: () => {
          if (onProgressSectionClick) {
            onProgressSectionClick('goals');
          } else {
            scrollToAnchor('#notion-boards');
          }
        },
      },
    ];
  }, [onProgressSectionClick]);

  return (
    <div className="flex items-center justify-between w-full h-full px-2 sm:px-4 gap-2 sm:gap-4">
      {/* Section Navigation */}
      <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 overflow-x-auto scrollbar-hide h-full">
        <span className="text-[9px] sm:text-[10px] font-mono uppercase text-[var(--text-muted)] whitespace-nowrap hidden sm:inline">
          Sections:
        </span>
        {sectionItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={item.onClick}
            className={cn(
              'px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-mono uppercase border transition-colors whitespace-nowrap flex items-center gap-0.5 sm:gap-1',
              activeSection === item.id
                ? 'bg-[var(--accent-color)] text-[var(--bg-main)] border-[var(--accent-color)]'
                : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-color)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)]'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {item.icon && <PixelIcon name={item.icon} size={10} />}
            {item.label}
          </motion.button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-mono h-full">
        {recentMonths.length > 0 && (
          <div className="text-[var(--text-muted)] whitespace-nowrap hidden sm:block">
            Latest: <span className="text-[var(--accent-color)]">{recentMonths[0].completion}%</span>
          </div>
        )}
        {bucketItems.length > 0 && (
          <div className="text-[var(--text-muted)] whitespace-nowrap hidden sm:block">
            Adventures: <span className="text-[var(--accent-color)]">{bucketItems.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Component
export default function DynamicContextBar() {
  const pathname = usePathname();

  // Only show on specific pages
  const shouldShow = useMemo(() => {
    return ['/about', '/work', '/progress'].includes(pathname);
  }, [pathname]);

  // Scroll detection for active section highlighting using IntersectionObserver
  useEffect(() => {
    if (!shouldShow) return;

    const observerOptions = {
      root: null,
      rootMargin: '-120px 0px -50% 0px', // Account for header offset
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(() => {
      // Active section highlighting can be added here if needed
      // Currently handled by individual page components
    }, observerOptions);

    // Observe all potential section anchors
    const sections = document.querySelectorAll('[id^="phase-"], [id^="experience-"], [id^="monthly-goals"], [id^="bucket-list"], [id^="life-goals"]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
      observer.disconnect();
    };
  }, [shouldShow, pathname]);

  if (!shouldShow) return null;

  return (
    <motion.header
      className="fixed left-0 right-0 border-b-2 bg-[var(--bg-card)]/95 backdrop-blur-md flex items-center"
      style={{
        top: '60px', // Below SimpleGameNav (BAR_HEIGHT = 60px = GRID_SIZE * 3)
        height: BAR_HEIGHT,
        borderColor: 'var(--border-color)',
        zIndex: 45, // Below main nav (z-50) but above content
      }}
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      role="banner"
    >
      {pathname === '/about' && <AboutContextBar />}
      {pathname === '/work' && <WorkContextBar />}
      {pathname === '/progress' && <ProgressContextBar />}
    </motion.header>
  );
}
