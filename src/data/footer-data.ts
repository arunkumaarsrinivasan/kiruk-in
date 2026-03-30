import type { ThemeConfig, PortfolioData } from './portfolio-data';

export type FooterEraBucket = 'retro' | 'pixel' | 'flat' | 'modern';

export interface FooterStatItem {
  id: string;
  label: string;
  value: string;
}

export interface FooterLinkItem {
  id: string;
  label: string;
  href: string;
  external?: boolean;
  cursorChat?: string;
}

export interface FooterAsciiVariant {
  title: string;
  eyebrow: string;
  sublabel: string;
  art: string[];
  badges: string[];
  statusLine: string;
  chromeLabel: string;
}

export interface FooterPaletteHints {
  panelStyle: 'terminal' | 'pixel' | 'flat' | 'glass';
  borderStyle: 'solid' | 'double' | 'bevel' | 'soft';
  glow: boolean;
  pixelated: boolean;
}

export interface FooterContentConfig {
  id: string;
  bucket: FooterEraBucket;
  label: string;
  description: string;
  palette: FooterPaletteHints;
  ascii: FooterAsciiVariant;
  stats: FooterStatItem[];
  closingLines: string[];
}

export interface ResolvedFooterLinkGroup {
  title: string;
  items: FooterLinkItem[];
}

export interface ResolvedFooterData {
  bucket: FooterEraBucket;
  label: string;
  description: string;
  palette: FooterPaletteHints;
  ascii: FooterAsciiVariant;
  stats: FooterStatItem[];
  linkGroups: ResolvedFooterLinkGroup[];
  closingLines: string[];
  copyrightLine: string;
  eraLine: string;
  locationLine: string;
  responseLine: string;
}

const FOOTER_COPY = {
  eyebrow: 'END OF TRANSMISSION',
  copyrightPrefix: '©',
  builtLine: 'Designed like a system. Shipped like a product.',
  responsePrefix: 'Response window',
  locationPrefix: 'Broadcasting from',
} as const;

export function getFooterEraBucket(eraId: ThemeConfig['id']): FooterEraBucket {
  const year = Number.parseInt(eraId, 10);

  if (Number.isNaN(year)) return 'modern';
  if (year < 2000) return 'retro';
  if (year < 2013) return 'pixel';
  if (year < 2020) return 'flat';
  return 'modern';
}

export const FOOTER_CONTENT_BY_BUCKET: Record<FooterEraBucket, FooterContentConfig> = {
  retro: {
    id: 'footer-retro',
    bucket: 'retro',
    label: 'ASCII Command Footer',
    description: 'Terminal-grade footer with dense ASCII chrome, command-line language, and CRT-era structure.',
    palette: {
      panelStyle: 'terminal',
      borderStyle: 'double',
      glow: true,
      pixelated: false,
    },
    ascii: {
      title: 'KIRUK TERMINAL NODE',
      eyebrow: 'CRT MODE / ASCII SIGNAL',
      sublabel: 'designer + engineer + system thinker',
      art: [
        '╔════════════════════════════════════════════════════════════════════╗',
        '║  _  ___ ___ _   _ _   _ _  __      _______  ____  _  ________    ║',
        '║ | |/ (_) _ \\ | | | | | | |/ /     |__   __|/ __ \\| |/ /  ____|   ║',
        '║ | \' / /|   / |_| | |_| | \' /  ___    | |  | |  | | \' /| |__      ║',
        '║ |  < / | |\\\\  _  |  _  |  <  |___|   | |  | |  | |  < |  __|     ║',
        '║ | . \\| ||_| | | | | | | . \\         | |  | |__| | . \\| |____    ║',
        '║ |_|\\_\\_|___/|_| |_|_| |_|\\_\\        |_|   \\____/|_|\\_\\______|   ║',
        '╠════════════════════════════════════════════════════════════════════╣',
        '║  STATUS: ONLINE   ROLE: UX DESIGN ENGINEER   MODE: HANDOFF=OFF   ║',
        '╚════════════════════════════════════════════════════════════════════╝',
      ],
      badges: ['ASCII', 'CRT', 'MONO', 'SYSTEM'],
      statusLine: '> init collaboration --signal strong --context preserved',
      chromeLabel: 'terminal-shell',
    },
    stats: [
      { id: 'availability', label: 'availability', value: 'open-for-good-work' },
      { id: 'response', label: 'response', value: '< 24h' },
      { id: 'timezone', label: 'timezone', value: 'IST' },
      { id: 'mode', label: 'mode', value: 'design<>code' },
    ],
    closingLines: [
      'No handoff drift. No lost intent. Just clear systems and shipped interfaces.',
      'From wireframe logic to production detail, the footer stays in character.',
      FOOTER_COPY.builtLine,
    ],
  },

  pixel: {
    id: 'footer-pixel',
    bucket: 'pixel',
    label: '8-Bit System Footer',
    description: 'Chunky UI chrome, arcade badges, and grid-driven footer blocks inspired by early digital product eras.',
    palette: {
      panelStyle: 'pixel',
      borderStyle: 'bevel',
      glow: false,
      pixelated: true,
    },
    ascii: {
      title: 'KIRUK 8-BIT DOCK',
      eyebrow: 'PIXEL HUD / ARCADE UI',
      sublabel: 'press start to build better products',
      art: [
        '┌──────────────────────────────────────────────────────────────┐',
        '│ ██╗  ██╗██╗██████╗ ██╗   ██╗██╗  ██╗                         │',
        '│ ██║ ██╔╝██║██╔══██╗██║   ██║██║ ██╔╝                         │',
        '│ █████╔╝ ██║██████╔╝██║   ██║█████╔╝                          │',
        '│ ██╔═██╗ ██║██╔══██╗██║   ██║██╔═██╗                          │',
        '│ ██║  ██╗██║██║  ██║╚██████╔╝██║  ██╗                         │',
        '│ ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝                         │',
        '├──────────────────────────────────────────────────────────────┤',
        '│ HP 100 │ XP MAXED │ UI+UX+CODE │ QUEST: NEXT COLLAB         │',
        '└──────────────────────────────────────────────────────────────┘',
      ],
      badges: ['8BIT', 'HUD', 'XP', 'SHIP'],
      statusLine: '>> quest-log updated: collaboration unlocked',
      chromeLabel: 'pixel-hud',
    },
    stats: [
      { id: 'xp', label: 'xp', value: 'product-design+frontend' },
      { id: 'level', label: 'level', value: 'senior-craft-energy' },
      { id: 'latency', label: 'reply-latency', value: '< 24h' },
      { id: 'spawn', label: 'spawn-point', value: 'bengaluru' },
    ],
    closingLines: [
      'Built for people who like interfaces with character, systems with logic, and details that snap into place.',
      'Every panel is meant to feel like a usable artifact, not decorative noise.',
      FOOTER_COPY.builtLine,
    ],
  },

  flat: {
    id: 'footer-flat',
    bucket: 'flat',
    label: 'System Grid Footer',
    description: 'Structured, information-dense footer with clean blocks, categorized actions, and restrained digital chrome.',
    palette: {
      panelStyle: 'flat',
      borderStyle: 'solid',
      glow: false,
      pixelated: false,
    },
    ascii: {
      title: 'KIRUK SYSTEM GRID',
      eyebrow: 'STRUCTURED UI / CONTENT FIRST',
      sublabel: 'clean information architecture at the end of the scroll',
      art: [
        '┌──────────────────────────────────────────────────────────────────┐',
        '│  KIRUK / DESIGN ENGINEER / SYSTEMS / PROTOTYPES / PRODUCTION    │',
        '├──────────────────────────────────────────────────────────────────┤',
        '│  strategy  │  interaction  │  visual craft  │  frontend ship    │',
        '│  research  │  prototyping  │  design system │  implementation   │',
        '├──────────────────────────────────────────────────────────────────┤',
        '│  minimal chrome, maximum signal                                 │',
        '└──────────────────────────────────────────────────────────────────┘',
      ],
      badges: ['GRID', 'IA', 'SYSTEM', 'CRAFT'],
      statusLine: 'signal: balanced / structured / production-minded',
      chromeLabel: 'flat-grid',
    },
    stats: [
      { id: 'focus', label: 'focus', value: 'product systems' },
      { id: 'strength', label: 'strength', value: 'design-to-code' },
      { id: 'region', label: 'region', value: 'india / remote-friendly' },
      { id: 'reply', label: 'reply', value: '< 24h' },
    ],
    closingLines: [
      'A footer should do more than terminate a page — it should summarize the product philosophy.',
      'This one closes with structure, clear pathways, and just enough attitude.',
      FOOTER_COPY.builtLine,
    ],
  },

  modern: {
    id: 'footer-modern',
    bucket: 'modern',
    label: 'Generative UI Footer',
    description: 'Contemporary footer language with layered system messaging, flexible content panels, and polished design-token awareness.',
    palette: {
      panelStyle: 'glass',
      borderStyle: 'soft',
      glow: true,
      pixelated: false,
    },
    ascii: {
      title: 'KIRUK SIGNAL FIELD',
      eyebrow: 'ERA-AWARE / TOKEN-DRIVEN',
      sublabel: 'a long footer that behaves like part of the design system',
      art: [
        '╭────────────────────────────────────────────────────────────────────╮',
        '│  ◉  context retained     ◌  systems aligned     ✦  launch ready   │',
        '│                                                                    │',
        '│  design  ───────┐                                         ┌─ code  │',
        '│                 ├──── intent preserved / craft shipped ───┤        │',
        '│  research ──────┘                                         └─ build │',
        '│                                                                    │',
        '│  footer mode: adaptive / era-sensitive / data-driven              │',
        '╰────────────────────────────────────────────────────────────────────╯',
      ],
      badges: ['ADAPTIVE', 'TOKENS', 'ERA', 'SHIP'],
      statusLine: 'status: all systems coherent across eras',
      chromeLabel: 'signal-field',
    },
    stats: [
      { id: 'workflow', label: 'workflow', value: 'research → design → ship' },
      { id: 'response', label: 'response', value: '< 24h' },
      { id: 'location', label: 'location', value: 'bengaluru, india' },
      { id: 'focus', label: 'focus', value: 'ai + product + ux eng' },
    ],
    closingLines: [
      'The final scroll should still feel alive: system-aware, expressive, and useful.',
      'This footer adapts to the era without losing the underlying portfolio voice.',
      FOOTER_COPY.builtLine,
    ],
  },
};

export function createFooterLinkGroups(portfolioData: PortfolioData): ResolvedFooterLinkGroup[] {
  const primary: FooterLinkItem[] = [
    {
      id: 'email',
      label: portfolioData.contact.email,
      href: `mailto:${portfolioData.contact.email}`,
      cursorChat: 'link-email',
    },
  ];

  if (portfolioData.social.linkedin) {
    primary.push({
      id: 'linkedin',
      label: 'LinkedIn',
      href: portfolioData.social.linkedin,
      external: true,
      cursorChat: 'link-linkedin',
    });
  }

  if (portfolioData.contact.phone) {
    const sanitizedPhone = portfolioData.contact.phone.replace(/\s+/g, '');
    primary.push({
      id: 'phone',
      label: portfolioData.contact.phone,
      href: `tel:${sanitizedPhone}`,
      cursorChat: 'link-phone',
    });
  }

  const archive: FooterLinkItem[] = [];

  if (portfolioData.social.github) {
    archive.push({
      id: 'github',
      label: 'GitHub',
      href: portfolioData.social.github,
      external: true,
      cursorChat: 'link-github',
    });
  }

  if (portfolioData.social.behance) {
    archive.push({
      id: 'behance',
      label: 'Behance',
      href: portfolioData.social.behance,
      external: true,
      cursorChat: 'link-behance',
    });
  }

  if (portfolioData.social.playbook) {
    archive.push({
      id: 'playbook',
      label: 'Playbook',
      href: portfolioData.social.playbook,
      external: true,
      cursorChat: 'link-playbook',
    });
  }

  return [
    {
      title: 'Connect',
      items: primary,
    },
    {
      title: 'Explore',
      items: archive,
    },
  ].filter((group) => group.items.length > 0);
}

export function getFooterContentForEra(eraId: ThemeConfig['id']): FooterContentConfig {
  return FOOTER_CONTENT_BY_BUCKET[getFooterEraBucket(eraId)];
}

export function resolveFooterData(
  era: ThemeConfig,
  portfolioData: PortfolioData
): ResolvedFooterData {
  const config = getFooterContentForEra(era.id);
  const copyrightYear = new Date().getFullYear();

  return {
    bucket: config.bucket,
    label: config.label,
    description: config.description,
    palette: config.palette,
    ascii: config.ascii,
    stats: config.stats,
    linkGroups: createFooterLinkGroups(portfolioData),
    closingLines: config.closingLines,
    copyrightLine: `${FOOTER_COPY.copyrightPrefix} ${copyrightYear} ${portfolioData.personal.name}`,
    eraLine: `${era.id} · ${era.name}`,
    locationLine: `${FOOTER_COPY.locationPrefix} ${portfolioData.contact.location}`,
    responseLine: `${FOOTER_COPY.responsePrefix}: ${portfolioData.contact.responseTime}`,
  };
}
