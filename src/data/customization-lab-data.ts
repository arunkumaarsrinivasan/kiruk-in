/**
 * Customization Lab Data Configuration
 * 
 * Data-driven configuration for the pixel art icon editor and component
 * customization lab. All icon templates, tool palettes, component presets,
 * and customization options are defined here as data.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// PIXEL ART ICON EDITOR CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

export interface PixelTemplate {
  id: string;
  name: string;
  category: 'basic' | 'ui' | 'emoji' | 'symbol' | 'blank';
  /** Grid size (e.g. 16 = 16x16) */
  size: number;
  /** Flat array of hex colors or '' for transparent, row by row */
  pixels: string[];
}

export interface PixelTool {
  id: string;
  name: string;
  icon: string;
  shortcut: string;
  description: string;
}

export interface PixelEditorConfig {
  /** Available grid sizes */
  gridSizes: number[];
  /** Default grid size */
  defaultGridSize: number;
  /** Available tools */
  tools: PixelTool[];
  /** Color palette presets per era style */
  palettes: Record<string, { name: string; colors: string[] }>;
  /** Pre-built icon templates */
  templates: PixelTemplate[];
}

export const PIXEL_EDITOR_CONFIG: PixelEditorConfig = {
  gridSizes: [8, 12, 16, 24, 32],
  defaultGridSize: 16,
  tools: [
    { id: 'pencil', name: 'Pencil', icon: '✏️', shortcut: 'P', description: 'Draw single pixels' },
    { id: 'eraser', name: 'Eraser', icon: '🧹', shortcut: 'E', description: 'Erase pixels' },
    { id: 'fill', name: 'Fill', icon: '🪣', shortcut: 'F', description: 'Flood fill area' },
    { id: 'line', name: 'Line', icon: '📏', shortcut: 'L', description: 'Draw straight lines' },
    { id: 'rect', name: 'Rectangle', icon: '⬜', shortcut: 'R', description: 'Draw rectangles' },
    { id: 'eyedropper', name: 'Eyedropper', icon: '💧', shortcut: 'I', description: 'Pick color from canvas' },
    { id: 'mirror', name: 'Mirror', icon: '🪞', shortcut: 'M', description: 'Mirror draw horizontally' },
  ],
  palettes: {
    terminal: {
      name: '1970s Terminal',
      colors: ['#00ff00', '#00cc00', '#009900', '#006600', '#003300', '#001a00', '#000000', '#ffffff'],
    },
    retro: {
      name: '1990s Web',
      colors: ['#ff00ff', '#ffff00', '#00ffff', '#ff0000', '#0000ff', '#00ff00', '#000000', '#ffffff'],
    },
    pastel: {
      name: 'Pastel',
      colors: ['#fca5a5', '#fdba74', '#fde68a', '#86efac', '#7dd3fc', '#c4b5fd', '#f9a8d4', '#ffffff'],
    },
    mono: {
      name: 'Monochrome',
      colors: ['#000000', '#222222', '#444444', '#666666', '#888888', '#aaaaaa', '#cccccc', '#ffffff'],
    },
    material: {
      name: 'Material',
      colors: ['#f44336', '#e91e63', '#9c27b0', '#2196f3', '#4caf50', '#ff9800', '#795548', '#ffffff'],
    },
    neon: {
      name: 'Neon Glow',
      colors: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff', '#06d6a0', '#000000', '#ffffff'],
    },
  },
  templates: [
    {
      id: 'blank-16',
      name: 'Blank Canvas',
      category: 'blank',
      size: 16,
      pixels: Array(256).fill(''),
    },
    {
      id: 'heart',
      name: 'Heart',
      category: 'emoji',
      size: 8,
      pixels: [
        '', '', '', '', '', '', '', '',
        '', '#ff0000', '#ff0000', '', '', '#ff0000', '#ff0000', '',
        '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000',
        '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000',
        '', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '',
        '', '', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '', '',
        '', '', '', '#ff0000', '#ff0000', '', '', '',
        '', '', '', '', '', '', '', '',
      ],
    },
    {
      id: 'star',
      name: 'Star',
      category: 'symbol',
      size: 8,
      pixels: [
        '', '', '', '#ffff00', '', '', '', '',
        '', '', '#ffff00', '#ffff00', '#ffff00', '', '', '',
        '', '', '', '#ffff00', '', '', '', '',
        '#ffff00', '#ffff00', '#ffff00', '#ffff00', '#ffff00', '#ffff00', '#ffff00', '#ffff00',
        '', '#ffff00', '#ffff00', '#ffff00', '#ffff00', '#ffff00', '#ffff00', '',
        '', '', '#ffff00', '', '', '#ffff00', '', '',
        '', '#ffff00', '', '', '', '', '#ffff00', '',
        '', '', '', '', '', '', '', '',
      ],
    },
    {
      id: 'arrow-right',
      name: 'Arrow Right',
      category: 'ui',
      size: 8,
      pixels: [
        '', '', '', '#ffffff', '', '', '', '',
        '', '', '', '#ffffff', '#ffffff', '', '', '',
        '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '', '',
        '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '',
        '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '', '',
        '', '', '', '#ffffff', '#ffffff', '', '', '',
        '', '', '', '#ffffff', '', '', '', '',
        '', '', '', '', '', '', '', '',
      ],
    },
    {
      id: 'smiley',
      name: 'Smiley',
      category: 'emoji',
      size: 8,
      pixels: [
        '', '', '#ffcc00', '#ffcc00', '#ffcc00', '#ffcc00', '', '',
        '', '#ffcc00', '#ffcc00', '#ffcc00', '#ffcc00', '#ffcc00', '#ffcc00', '',
        '#ffcc00', '#ffcc00', '#000000', '#ffcc00', '#ffcc00', '#000000', '#ffcc00', '#ffcc00',
        '#ffcc00', '#ffcc00', '#ffcc00', '#ffcc00', '#ffcc00', '#ffcc00', '#ffcc00', '#ffcc00',
        '#ffcc00', '#000000', '#ffcc00', '#ffcc00', '#ffcc00', '#ffcc00', '#000000', '#ffcc00',
        '#ffcc00', '#ffcc00', '#000000', '#000000', '#000000', '#000000', '#ffcc00', '#ffcc00',
        '', '#ffcc00', '#ffcc00', '#ffcc00', '#ffcc00', '#ffcc00', '#ffcc00', '',
        '', '', '#ffcc00', '#ffcc00', '#ffcc00', '#ffcc00', '', '',
      ],
    },
    {
      id: 'home',
      name: 'Home',
      category: 'ui',
      size: 8,
      pixels: [
        '', '', '', '#884422', '', '', '', '',
        '', '', '#884422', '#884422', '#884422', '', '', '',
        '', '#884422', '#884422', '#884422', '#884422', '#884422', '', '',
        '#884422', '#884422', '#884422', '#884422', '#884422', '#884422', '#884422', '',
        '', '#884422', '#884422', '#884422', '#884422', '#884422', '', '',
        '', '#884422', '#884422', '', '#884422', '#884422', '', '',
        '', '#884422', '#884422', '', '#884422', '#884422', '', '',
        '', '#884422', '#884422', '#884422', '#884422', '#884422', '', '',
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT CUSTOMIZATION CONFIG  
// ═══════════════════════════════════════════════════════════════════════════════

export interface ComponentProperty {
  id: string;
  label: string;
  type: 'color' | 'number' | 'select' | 'toggle' | 'slider';
  /** CSS property name to modify */
  cssProperty: string;
  /** Default value */
  defaultValue: string | number | boolean;
  /** For select type */
  options?: { value: string; label: string }[];
  /** For slider/number */
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface CustomizableComponent {
  id: string;
  name: string;
  category: 'buttons' | 'cards' | 'badges' | 'inputs' | 'layout';
  description: string;
  icon: string;
  properties: ComponentProperty[];
  /** HTML/JSX preview template key */
  previewType: 'button' | 'card' | 'badge' | 'input' | 'divider' | 'avatar' | 'tooltip' | 'progress';
}

export interface ComponentCustomizationConfig {
  components: CustomizableComponent[];
  /** Quick theme presets for components */
  quickPresets: Array<{
    id: string;
    name: string;
    description: string;
    overrides: Record<string, Record<string, string | number | boolean>>;
  }>;
}

export const COMPONENT_CUSTOMIZATION_CONFIG: ComponentCustomizationConfig = {
  components: [
    {
      id: 'button-primary',
      name: 'Primary Button',
      category: 'buttons',
      description: 'Main action button used across the site',
      icon: '🔘',
      previewType: 'button',
      properties: [
        { id: 'bg', label: 'Background', type: 'color', cssProperty: 'backgroundColor', defaultValue: 'var(--accent-color)' },
        { id: 'text', label: 'Text Color', type: 'color', cssProperty: 'color', defaultValue: 'var(--bg-main)' },
        { id: 'border-color', label: 'Border Color', type: 'color', cssProperty: 'borderColor', defaultValue: 'var(--accent-color)' },
        { id: 'border-width', label: 'Border Width', type: 'slider', cssProperty: 'borderWidth', defaultValue: 2, min: 0, max: 6, step: 1, unit: 'px' },
        { id: 'border-radius', label: 'Roundness', type: 'slider', cssProperty: 'borderRadius', defaultValue: 0, min: 0, max: 24, step: 1, unit: 'px' },
        { id: 'padding-x', label: 'Padding X', type: 'slider', cssProperty: 'paddingInline', defaultValue: 16, min: 4, max: 32, step: 2, unit: 'px' },
        { id: 'padding-y', label: 'Padding Y', type: 'slider', cssProperty: 'paddingBlock', defaultValue: 8, min: 2, max: 20, step: 1, unit: 'px' },
        { id: 'font-size', label: 'Font Size', type: 'slider', cssProperty: 'fontSize', defaultValue: 11, min: 8, max: 18, step: 1, unit: 'px' },
        { id: 'font-weight', label: 'Weight', type: 'select', cssProperty: 'fontWeight', defaultValue: '700', options: [
          { value: '400', label: 'Regular' },
          { value: '500', label: 'Medium' },
          { value: '600', label: 'Semi Bold' },
          { value: '700', label: 'Bold' },
          { value: '900', label: 'Black' },
        ]},
        { id: 'uppercase', label: 'Uppercase', type: 'toggle', cssProperty: 'textTransform', defaultValue: true },
        { id: 'letter-spacing', label: 'Tracking', type: 'slider', cssProperty: 'letterSpacing', defaultValue: 2, min: 0, max: 8, step: 0.5, unit: 'px' },
      ],
    },
    {
      id: 'button-secondary',
      name: 'Secondary Button',
      category: 'buttons',
      description: 'Ghost/outlined button variant',
      icon: '⬜',
      previewType: 'button',
      properties: [
        { id: 'bg', label: 'Background', type: 'color', cssProperty: 'backgroundColor', defaultValue: 'transparent' },
        { id: 'text', label: 'Text Color', type: 'color', cssProperty: 'color', defaultValue: 'var(--text-main)' },
        { id: 'border-color', label: 'Border Color', type: 'color', cssProperty: 'borderColor', defaultValue: 'var(--text-main)' },
        { id: 'border-width', label: 'Border Width', type: 'slider', cssProperty: 'borderWidth', defaultValue: 2, min: 0, max: 6, step: 1, unit: 'px' },
        { id: 'border-radius', label: 'Roundness', type: 'slider', cssProperty: 'borderRadius', defaultValue: 0, min: 0, max: 24, step: 1, unit: 'px' },
        { id: 'border-style', label: 'Border Style', type: 'select', cssProperty: 'borderStyle', defaultValue: 'solid', options: [
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' },
        ]},
        { id: 'font-size', label: 'Font Size', type: 'slider', cssProperty: 'fontSize', defaultValue: 11, min: 8, max: 18, step: 1, unit: 'px' },
      ],
    },
    {
      id: 'card',
      name: 'Card',
      category: 'cards',
      description: 'Content card container',
      icon: '🃏',
      previewType: 'card',
      properties: [
        { id: 'bg', label: 'Background', type: 'color', cssProperty: 'backgroundColor', defaultValue: 'var(--bg-card)' },
        { id: 'border-color', label: 'Border Color', type: 'color', cssProperty: 'borderColor', defaultValue: 'var(--border-color)' },
        { id: 'border-width', label: 'Border Width', type: 'slider', cssProperty: 'borderWidth', defaultValue: 2, min: 0, max: 6, step: 1, unit: 'px' },
        { id: 'border-radius', label: 'Roundness', type: 'slider', cssProperty: 'borderRadius', defaultValue: 0, min: 0, max: 24, step: 1, unit: 'px' },
        { id: 'border-style', label: 'Border Style', type: 'select', cssProperty: 'borderStyle', defaultValue: 'solid', options: [
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' },
        ]},
        { id: 'padding', label: 'Padding', type: 'slider', cssProperty: 'padding', defaultValue: 16, min: 4, max: 32, step: 2, unit: 'px' },
        { id: 'shadow-x', label: 'Shadow X', type: 'slider', cssProperty: '--shadow-x', defaultValue: 0, min: 0, max: 12, step: 1, unit: 'px' },
        { id: 'shadow-y', label: 'Shadow Y', type: 'slider', cssProperty: '--shadow-y', defaultValue: 0, min: 0, max: 12, step: 1, unit: 'px' },
        { id: 'shadow-color', label: 'Shadow Color', type: 'color', cssProperty: '--shadow-color', defaultValue: '#000000' },
      ],
    },
    {
      id: 'badge',
      name: 'Badge / Tag',
      category: 'badges',
      description: 'Status indicators and labels',
      icon: '🏷️',
      previewType: 'badge',
      properties: [
        { id: 'bg', label: 'Background', type: 'color', cssProperty: 'backgroundColor', defaultValue: 'var(--accent-color)' },
        { id: 'text', label: 'Text Color', type: 'color', cssProperty: 'color', defaultValue: 'var(--bg-main)' },
        { id: 'border-color', label: 'Border Color', type: 'color', cssProperty: 'borderColor', defaultValue: 'transparent' },
        { id: 'border-width', label: 'Border Width', type: 'slider', cssProperty: 'borderWidth', defaultValue: 0, min: 0, max: 4, step: 1, unit: 'px' },
        { id: 'border-radius', label: 'Roundness', type: 'slider', cssProperty: 'borderRadius', defaultValue: 0, min: 0, max: 16, step: 1, unit: 'px' },
        { id: 'padding-x', label: 'Padding X', type: 'slider', cssProperty: 'paddingInline', defaultValue: 8, min: 2, max: 20, step: 1, unit: 'px' },
        { id: 'padding-y', label: 'Padding Y', type: 'slider', cssProperty: 'paddingBlock', defaultValue: 4, min: 1, max: 12, step: 1, unit: 'px' },
        { id: 'font-size', label: 'Font Size', type: 'slider', cssProperty: 'fontSize', defaultValue: 9, min: 6, max: 14, step: 1, unit: 'px' },
        { id: 'uppercase', label: 'Uppercase', type: 'toggle', cssProperty: 'textTransform', defaultValue: true },
      ],
    },
    {
      id: 'input',
      name: 'Text Input',
      category: 'inputs',
      description: 'Form input fields',
      icon: '📝',
      previewType: 'input',
      properties: [
        { id: 'bg', label: 'Background', type: 'color', cssProperty: 'backgroundColor', defaultValue: 'var(--bg-main)' },
        { id: 'text', label: 'Text Color', type: 'color', cssProperty: 'color', defaultValue: 'var(--text-main)' },
        { id: 'border-color', label: 'Border Color', type: 'color', cssProperty: 'borderColor', defaultValue: 'var(--border-color)' },
        { id: 'border-width', label: 'Border Width', type: 'slider', cssProperty: 'borderWidth', defaultValue: 2, min: 0, max: 4, step: 1, unit: 'px' },
        { id: 'border-radius', label: 'Roundness', type: 'slider', cssProperty: 'borderRadius', defaultValue: 0, min: 0, max: 16, step: 1, unit: 'px' },
        { id: 'padding', label: 'Padding', type: 'slider', cssProperty: 'padding', defaultValue: 8, min: 4, max: 20, step: 1, unit: 'px' },
        { id: 'font-size', label: 'Font Size', type: 'slider', cssProperty: 'fontSize', defaultValue: 12, min: 8, max: 18, step: 1, unit: 'px' },
      ],
    },
    {
      id: 'progress-bar',
      name: 'Progress Bar',
      category: 'layout',
      description: 'Progress indicator track and fill',
      icon: '📊',
      previewType: 'progress',
      properties: [
        { id: 'track-bg', label: 'Track BG', type: 'color', cssProperty: 'backgroundColor', defaultValue: 'var(--bg-card)' },
        { id: 'fill-bg', label: 'Fill Color', type: 'color', cssProperty: '--fill-color', defaultValue: 'var(--accent-color)' },
        { id: 'height', label: 'Height', type: 'slider', cssProperty: 'height', defaultValue: 8, min: 2, max: 24, step: 1, unit: 'px' },
        { id: 'border-radius', label: 'Roundness', type: 'slider', cssProperty: 'borderRadius', defaultValue: 0, min: 0, max: 12, step: 1, unit: 'px' },
        { id: 'border-width', label: 'Border Width', type: 'slider', cssProperty: 'borderWidth', defaultValue: 1, min: 0, max: 4, step: 1, unit: 'px' },
        { id: 'border-color', label: 'Border Color', type: 'color', cssProperty: 'borderColor', defaultValue: 'var(--border-color)' },
      ],
    },
    {
      id: 'avatar',
      name: 'Avatar',
      category: 'layout',
      description: 'User avatar / profile image',
      icon: '👤',
      previewType: 'avatar',
      properties: [
        { id: 'size', label: 'Size', type: 'slider', cssProperty: 'width', defaultValue: 40, min: 24, max: 80, step: 4, unit: 'px' },
        { id: 'border-radius', label: 'Roundness', type: 'slider', cssProperty: 'borderRadius', defaultValue: 0, min: 0, max: 50, step: 1, unit: '%' },
        { id: 'border-width', label: 'Border Width', type: 'slider', cssProperty: 'borderWidth', defaultValue: 2, min: 0, max: 6, step: 1, unit: 'px' },
        { id: 'border-color', label: 'Border Color', type: 'color', cssProperty: 'borderColor', defaultValue: 'var(--accent-color)' },
        { id: 'bg', label: 'Background', type: 'color', cssProperty: 'backgroundColor', defaultValue: 'var(--bg-card)' },
      ],
    },
    {
      id: 'tooltip',
      name: 'Tooltip',
      category: 'layout',
      description: 'Hover information popup',
      icon: '💬',
      previewType: 'tooltip',
      properties: [
        { id: 'bg', label: 'Background', type: 'color', cssProperty: 'backgroundColor', defaultValue: 'var(--text-main)' },
        { id: 'text', label: 'Text Color', type: 'color', cssProperty: 'color', defaultValue: 'var(--bg-main)' },
        { id: 'border-radius', label: 'Roundness', type: 'slider', cssProperty: 'borderRadius', defaultValue: 4, min: 0, max: 16, step: 1, unit: 'px' },
        { id: 'padding', label: 'Padding', type: 'slider', cssProperty: 'padding', defaultValue: 8, min: 4, max: 16, step: 1, unit: 'px' },
        { id: 'font-size', label: 'Font Size', type: 'slider', cssProperty: 'fontSize', defaultValue: 10, min: 8, max: 14, step: 1, unit: 'px' },
      ],
    },
  ],
  quickPresets: [
    {
      id: 'terminal',
      name: 'Terminal',
      description: 'Green-on-black CLI aesthetic',
      overrides: {
        'button-primary': { bg: '#001a00', text: '#00ff00', 'border-color': '#00ff00', 'border-width': 1, 'border-radius': 0, 'font-size': 10, 'letter-spacing': 3 },
        'card': { bg: '#000000', 'border-color': '#00ff00', 'border-radius': 0, 'border-style': 'solid' },
        'badge': { bg: '#00ff00', text: '#000000', 'border-radius': 0 },
        'input': { bg: '#000000', text: '#00ff00', 'border-color': '#00ff00', 'border-radius': 0 },
      },
    },
    {
      id: 'glass',
      name: 'Glassmorphism',
      description: 'Frosted glass with soft edges',
      overrides: {
        'button-primary': { 'border-radius': 12, 'border-width': 1, 'letter-spacing': 1 },
        'card': { 'border-radius': 16, 'border-width': 1, 'border-style': 'solid', padding: 20 },
        'badge': { 'border-radius': 12, 'border-width': 1 },
        'input': { 'border-radius': 8, 'border-width': 1 },
      },
    },
    {
      id: 'brutalist',
      name: 'Brutalist',
      description: 'Raw, bold, heavy borders',
      overrides: {
        'button-primary': { 'border-width': 4, 'border-radius': 0, 'font-size': 13, 'font-weight': '900', 'letter-spacing': 4 },
        'card': { 'border-width': 4, 'border-radius': 0, 'shadow-x': 8, 'shadow-y': 8 },
        'badge': { 'border-width': 3, 'border-radius': 0, 'font-size': 10 },
        'input': { 'border-width': 3, 'border-radius': 0 },
      },
    },
    {
      id: 'soft',
      name: 'Soft UI',
      description: 'Rounded, gentle, pastel-friendly',
      overrides: {
        'button-primary': { 'border-radius': 20, 'border-width': 0, 'letter-spacing': 1 },
        'card': { 'border-radius': 20, 'border-width': 0, padding: 24 },
        'badge': { 'border-radius': 16, 'border-width': 0 },
        'input': { 'border-radius': 12, 'border-width': 1 },
      },
    },
    {
      id: 'editorial',
      name: 'Editorial',
      description: 'Minimal with serif influence',
      overrides: {
        'button-primary': { 'border-width': 1, 'border-radius': 0, 'font-size': 12, 'font-weight': '500', 'letter-spacing': 3, uppercase: false },
        'card': { 'border-width': 1, 'border-radius': 0, 'border-style': 'solid', padding: 24 },
        'badge': { 'border-width': 1, 'border-radius': 0, 'font-size': 8, uppercase: false },
        'input': { 'border-width': 1, 'border-radius': 0 },
      },
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// LAB TAB CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface LabTab {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const LAB_TABS: LabTab[] = [
  { id: 'icons', name: 'Icon Lab', icon: '🎨', description: 'Create pixel art icons' },
  { id: 'components', name: 'Components', icon: '🧩', description: 'Customize UI components' },
  { id: 'export', name: 'Export', icon: '📦', description: 'Export your creations' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SAVED CREATION TYPES (for localStorage persistence)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SavedPixelIcon {
  id: string;
  name: string;
  size: number;
  pixels: string[];
  createdAt: string;
  eraId: string;
}

export interface SavedComponentStyle {
  id: string;
  name: string;
  componentId: string;
  overrides: Record<string, string | number | boolean>;
  createdAt: string;
  eraId: string;
}

export interface CustomizationLabState {
  savedIcons: SavedPixelIcon[];
  savedStyles: SavedComponentStyle[];
  activePreset: string | null;
}

export const DEFAULT_LAB_STATE: CustomizationLabState = {
  savedIcons: [],
  savedStyles: [],
  activePreset: null,
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/** Get palette colors that match the current era */
export function getEraPalette(eraId: string): string[] {
  const yearNum = parseInt(eraId, 10);
  if (yearNum <= 1981) return PIXEL_EDITOR_CONFIG.palettes.terminal.colors;
  if (yearNum <= 1997) return PIXEL_EDITOR_CONFIG.palettes.retro.colors;
  if (yearNum <= 2013) return PIXEL_EDITOR_CONFIG.palettes.material.colors;
  if (yearNum <= 2020) return PIXEL_EDITOR_CONFIG.palettes.mono.colors;
  if (yearNum <= 2023) return PIXEL_EDITOR_CONFIG.palettes.pastel.colors;
  return PIXEL_EDITOR_CONFIG.palettes.neon.colors;
}

/** Generate a unique ID for saved items */
export function generateLabId(): string {
  return `lab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
