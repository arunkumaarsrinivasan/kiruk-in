import { ThemeConfig } from '@/data/portfolio-data';

export type ThemeStyle = ThemeConfig['style'];

type PaletteTone = 'light' | 'medium' | 'white';

export interface SurfaceTokens {
  pattern: string;
  size: string;
  position: string;
  repeat: string;
  opacity: string;
}

export interface CardVariableTokens {
  borderStyle: string;
  tilt: string;
  background: string;
  shadow: string;
}

export interface CardComponentTokens {
  base: string;
  tag: string;
  heading: string;
}

export interface StickyNoteComponentTokens {
  base: string;
  palette: Record<PaletteTone, string>;
}

export interface ButtonComponentTokens {
  primary: string;
  secondary: string;
  ghost: string;
}

export interface ToolbarComponentTokens {
  badge: string;
  activeBadge: string;
  icon: string;
}

export interface DesignSystemTokens {
  style: ThemeStyle;
  vars: {
    surface: SurfaceTokens;
    cards: CardVariableTokens;
  };
  components: {
    cards: CardComponentTokens;
    stickyNotes: StickyNoteComponentTokens;
    buttons: ButtonComponentTokens;
    toolbar: ToolbarComponentTokens;
  };
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, any>
  ? DeepPartial<T[K]>
  : T[K];
};

type DesignSystemOverride = DeepPartial<DesignSystemTokens>;

const sketchBase: DesignSystemTokens = {
  style: 'sketch',
  vars: {
    surface: {
      pattern: 'linear-gradient(to right, color-mix(in srgb, var(--border-color), transparent 90%) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--border-color), transparent 90%) 1px, transparent 1px)',
      size: '20px 20px',
      position: 'center center',
      repeat: 'repeat',
      opacity: '1',
    },
    cards: {
      borderStyle: 'dashed',
      tilt: '-0.5deg',
      background: 'var(--bg-card)',
      shadow: 'none',
    },
  },
  components: {
    cards: {
      base: 'p-5 rounded-none border border-dashed border-[var(--border-color)] bg-[var(--bg-card)] shadow-none',
      tag: 'px-3 py-1 border border-dashed border-[var(--border-color)] rounded-none text-[10px] font-black uppercase tracking-[0.3em] bg-[var(--bg-main)] text-[var(--text-main)] shadow-none',
      heading: 'text-xs font-black uppercase tracking-[0.4em] border-b border-dashed border-[var(--border-color)] pb-2',
    },
    stickyNotes: {
      base: 'p-3 rounded-none border border-dashed border-[var(--border-color)] shadow-none font-mono text-xs uppercase tracking-[0.2em]',
      palette: {
        light: 'bg-[#fff9db] text-[#4a3900]',
        medium: 'bg-[#ffe4f7] text-[#4c1d95]',
        white: 'bg-[var(--bg-card)] text-[var(--text-main)]',
      },
    },
    buttons: {
      primary:
        'text-[10px] font-black uppercase tracking-[0.45em] px-5 py-2.5 border border-[var(--border-color)] bg-[var(--text-main)] text-[var(--bg-main)] shadow-none hover:bg-[var(--bg-main)] hover:text-[var(--text-main)] transition-all',
      secondary:
        'text-[11px] uppercase tracking-[0.3em] px-3 py-1 border border-dashed border-[var(--border-color)] bg-transparent text-[var(--text-main)]',
      ghost:
        'text-[11px] uppercase tracking-[0.2em] text-[var(--text-main)] underline decoration-dotted decoration-[var(--border-color)]',
    },
    toolbar: {
      badge:
        'rounded-none border border-dashed border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-main)] px-3 py-1 text-[11px] uppercase tracking-[0.25em] shadow-none',
      activeBadge: 'bg-[var(--text-main)] text-[var(--bg-main)] border-[var(--text-main)]',
      icon: 'text-[var(--text-main)]',
    },
  },
};

const minimalBase: DesignSystemTokens = {
  style: 'minimal',
  vars: {
    surface: {
      pattern: 'none',
      size: '0 0',
      position: 'center center',
      repeat: 'no-repeat',
      opacity: '0',
    },
    cards: {
      borderStyle: 'solid',
      tilt: '0deg',
      background: 'var(--bg-card)',
      shadow: 'none',
    },
  },
  components: {
    cards: {
      base: 'p-5 rounded-none border border-[#e2e8f0] bg-white shadow-none',
      tag: 'px-3 py-1 rounded-none text-[10px] font-semibold uppercase tracking-[0.1em] bg-[#f4f6fb] text-[#0f172a] border border-[#e2e8f0]',
      heading: 'text-sm font-semibold tracking-[0.08em] text-[#0f172a] pb-2 border-b border-[#e2e8f0]',
    },
    stickyNotes: {
      base: 'p-5 rounded-none border border-[#e2e8f0] shadow-none text-xs leading-relaxed font-[var(--font-main)]',
      palette: {
        light: 'bg-[#fdf7e3] text-[#8a5b00]',
        medium: 'bg-[#eaf4ff] text-[#0f3e6e]',
        white: 'bg-white text-[#0f172a]',
      },
    },
    buttons: {
      primary:
        'text-[11px] font-semibold uppercase tracking-[0.12em] px-5 py-2.5 rounded-none bg-[var(--theme-primary)] text-white shadow-none hover:bg-[var(--theme-accent)] transition-all',
      secondary:
        'text-[11px] uppercase tracking-[0.08em] px-5 py-2.5 rounded-none border border-[#e2e8f0] text-[#0f172a] hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)]',
      ghost: 'text-[11px] uppercase tracking-[0.08em] text-[#475467] hover:text-[var(--theme-primary)]',
    },
    toolbar: {
      badge:
        'rounded-none border border-[#e2e8f0] bg-white text-[#0f172a] px-3 py-1 text-[11px] uppercase tracking-[0.08em] shadow-none',
      activeBadge: 'bg-[var(--theme-primary)] text-white border-transparent',
      icon: 'text-[#0f172a]',
    },
  },
};

const absurdBase: DesignSystemTokens = {
  style: 'absurd',
  vars: {
    surface: {
      pattern:
        'radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 55%), radial-gradient(circle at 80% 0%, rgba(255, 255, 255, 0.06) 0%, transparent 45%), linear-gradient(135deg, rgba(255, 255, 255, 0.08) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.08) 75%, transparent 75%, transparent)',
      size: '100% 100%, 100% 100%, 42px 42px',
      position: 'center center, center center, center center',
      repeat: 'no-repeat, no-repeat, repeat',
      opacity: '1',
    },
    cards: {
      borderStyle: 'solid',
      tilt: '0deg',
      background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))',
      shadow: 'none',
    },
  },
  components: {
    cards: {
      base: 'p-5 rounded-none border border-[var(--accent-color)] bg-[linear-gradient(135deg,var(--theme-primary),var(--theme-secondary))] text-white shadow-none',
      tag: 'px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-[0.2em] bg-white/15 text-white border border-white/40 backdrop-blur-md shadow-none',
      heading: 'text-sm font-black uppercase tracking-[0.3em] text-white pb-2 border-b border-white/30 drop-shadow-none',
    },
    stickyNotes: {
      base: 'p-5 rounded-none border border-white/30 bg-white/15 text-white shadow-none backdrop-blur-xl text-xs uppercase tracking-[0.25em] font-[var(--font-heading)]',
      palette: {
        light: 'bg-white/20 text-white border border-white/40',
        medium: 'bg-[#f472b6]/30 text-white border border-white/30',
        white: 'bg-white/25 text-[#0b021a] border border-white/40',
      },
    },
    buttons: {
      primary:
        'text-[11px] font-black uppercase tracking-[0.35em] px-5 py-2.5 rounded-none bg-[linear-gradient(120deg,var(--theme-primary),var(--theme-secondary))] text-white border border-[var(--theme-accent)] shadow-none hover:scale-[1.02] transition-all',
      secondary:
        'text-[11px] uppercase tracking-[0.25em] px-5 py-2.5 rounded-none border border-white/40 text-white/90 hover:bg-white/10',
      ghost:
        'text-[var(--accent-color)] uppercase tracking-[0.25em] underline decoration-wavy decoration-[var(--accent-color)]',
    },
    toolbar: {
      badge:
        'rounded-none border border-white/40 bg-white/10 text-white px-3 py-1 text-[11px] uppercase tracking-[0.2em] shadow-none backdrop-blur-lg',
      activeBadge: 'bg-white text-[#0b021a] border-white shadow-none',
      icon: 'text-white',
    },
  },
};

const ERA_OVERRIDES: Partial<Record<string, DesignSystemOverride>> = {
  '1970': {
    vars: {
      surface: {
        pattern: 'none',
        size: '0 0',
        opacity: '0',
      },
      cards: {
        borderStyle: 'solid',
        shadow: 'none',
      },
    },
    components: {
      cards: {
        base: 'p-5 rounded-none border border-[#00ff00] bg-[#000000] text-[#00ff00] shadow-none font-mono',
        tag: 'px-2.5 py-1 rounded-none border border-[#00ff00] text-[10px] font-mono uppercase tracking-[0.2em] bg-[#001800] text-[#00ff00]',
        heading: 'text-xs font-black uppercase tracking-[0.3em] text-[#00ff00] border-b border-[#00ff00] pb-2',
      },
      stickyNotes: {
        base: 'p-3 rounded-none border border-[#00ff00] bg-[#000000] text-[#00ff00] font-mono text-xs uppercase tracking-[0.25em]',
        palette: {
          light: 'bg-[#000000] text-[#00ff00]',
          medium: 'bg-[#001800] text-[#00ff00]',
          white: 'bg-[#000000] text-[#00ff00]',
        },
      },
      buttons: {
        primary:
          'text-[10px] font-mono uppercase tracking-[0.35em] px-5 py-2.5 border border-[#00ff00] bg-[#001800] text-[#00ff00] shadow-none',
      },
      toolbar: {
        badge: 'rounded-none border border-[#00ff00] bg-[#000000] text-[#00ff00] px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] font-mono',
        activeBadge: 'bg-[#00ff00] text-[#000000] border-[#00ff00]',
        icon: 'text-[#00ff00]',
      },
    },
  },
  '1995': {
    vars: {
      surface: {
        pattern:
          'radial-gradient(circle, rgba(255,0,255,0.3) 10%, transparent 35%), linear-gradient(transparent 24px, rgba(255,0,255,0.35) 25px)',
        size: '60px 60px, 8px 8px',
        repeat: 'repeat, repeat',
        opacity: '0.45',
      },
      cards: {
        shadow: 'none',
      },
    },
    components: {
      stickyNotes: {
        palette: {
          light: 'bg-[#2b006a] text-[#fdfd96]',
          medium: 'bg-[#ff00ff] text-[#0b0025]',
          white: 'bg-[#0b0025] text-[#fdfd96]',
        },
      },
      buttons: {
        primary:
          'text-[11px] font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-none bg-[linear-gradient(120deg,#ff00ff,#ffff00)] text-[#0b0025] border border-[#ffff00] shadow-none',
      },
    },
  },
  '2025': {
    vars: {
      surface: {
        pattern: 'linear-gradient(to right, color-mix(in srgb, var(--border-color), transparent 90%) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--border-color), transparent 90%) 1px, transparent 1px)',
        size: '20px 20px',
        position: 'center center',
        repeat: 'repeat',
        opacity: '1',
      },
      cards: {
        borderStyle: 'dashed',
        shadow: 'none',
      },
    },
    components: {
      cards: {
        base: 'p-5 rounded-none border border-dashed border-[var(--accent-color)] bg-[rgba(255,255,255,0.07)] backdrop-blur-xl text-white shadow-none',
        tag: 'px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-[0.25em] bg-white/10 text-white border border-white/30',
      },
      stickyNotes: {
        base: 'p-5 rounded-none border border-dashed border-white/40 bg-white/10 text-white shadow-none backdrop-blur-xl',
        palette: {
          light: 'bg-white/15 text-white',
          medium: 'bg-[#14b8a6]/35 text-white',
          white: 'bg-white/20 text-[#030712]',
        },
      },
      buttons: {
        primary:
          'text-[11px] font-black uppercase tracking-[0.35em] px-5 py-2.5 rounded-none bg-[linear-gradient(120deg,#8b5cf6,#14b8a6)] text-white border border-white/30 shadow-none',
      },
    },
  },
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const merge = (target: any, source: any): any => {
  if (!source) {
    return target;
  }

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    if (sourceValue === undefined || sourceValue === null) {
      return;
    }

    if (typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      if (!target[key]) {
        target[key] = {};
      }
      target[key] = merge(target[key], sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });

  return target;
};

const baseSystems: Record<ThemeStyle, DesignSystemTokens> = {
  sketch: sketchBase,
  minimal: minimalBase,
  absurd: absurdBase,
};

export const getDesignSystemForTheme = (theme: ThemeConfig): DesignSystemTokens => {
  const base = clone(baseSystems[theme.style]);
  const override = ERA_OVERRIDES[theme.id];

  if (!override) {
    return base;
  }

  return merge(base, override);
};
