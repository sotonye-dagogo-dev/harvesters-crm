/**
 * Design System Tokens — TypeScript Constants
 *
 * These mirror the CSS custom properties from globals.css so that
 * TypeScript code (charts, inline styles, etc.) can reference the
 * same single source of truth.
 *
 * Usage:
 *   import { DS } from '@/lib/design-system/tokens';
 *   <Bar fill={DS.chart[1]} />
 */

/* ── Palette (raw values) ──────────────────────────────── */
export const palette = {
  black: {
    base: '#0A0A0B',
    soft: '#111214',
    elevated: '#16171A',
  },
  emerald: {
    900: '#064e3b',
    700: '#047857',
    600: '#059669',
    500: '#10b981',
    400: '#34d399',
    200: '#a7f3d0',
    50: '#ecfdf5',
  },
  neutral: {
    950: '#0a0a0a',
    900: '#0f172a',
    800: '#1e293b',
    700: '#374151',
    600: '#4b5563',
    500: '#64748b',
    400: '#94a3b8',
    300: '#cbd5e1',
    200: '#e5e7eb',
    100: '#f1f5f9',
    50: '#f8f9fb',
    0: '#ffffff',
  },
} as const;

/* ── CSS Variable References ──────────────────────────── */
export const cssVar = (name: string) => `var(${name})`;

/* ── Semantic Token Names (matching globals.css) ───────── */
export const DS = {
  brand: {
    accent: cssVar('--ds-brand-accent'),
    accentHover: cssVar('--ds-brand-accent-hover'),
    accentSubtle: cssVar('--ds-brand-accent-subtle'),
    black: cssVar('--ds-brand-black'),
    blackSoft: cssVar('--ds-brand-black-soft'),
    blackElevated: cssVar('--ds-brand-black-elevated'),
  },
  status: {
    success: cssVar('--ds-status-success'),
    warning: cssVar('--ds-status-warning'),
    error: cssVar('--ds-status-error'),
    info: cssVar('--ds-status-info'),
  },
  surface: {
    base: cssVar('--ds-surface-base'),
    elevated: cssVar('--ds-surface-elevated'),
    sunken: cssVar('--ds-surface-sunken'),
    overlay: cssVar('--ds-surface-overlay'),
    sidebar: cssVar('--ds-surface-sidebar'),
    header: cssVar('--ds-surface-header'),
    glass: cssVar('--ds-surface-glass'),
  },
  text: {
    primary: cssVar('--ds-text-primary'),
    secondary: cssVar('--ds-text-secondary'),
    subtle: cssVar('--ds-text-subtle'),
    inverse: cssVar('--ds-text-inverse'),
    link: cssVar('--ds-text-link'),
  },
  border: {
    base: cssVar('--ds-border-base'),
    strong: cssVar('--ds-border-strong'),
    subtle: cssVar('--ds-border-subtle'),
    glass: cssVar('--ds-border-glass'),
  },
  chart: {
    1: cssVar('--ds-chart-1'),
    2: cssVar('--ds-chart-2'),
    3: cssVar('--ds-chart-3'),
    4: cssVar('--ds-chart-4'),
    5: cssVar('--ds-chart-5'),
    6: cssVar('--ds-chart-6'),
  },
  radius: {
    sm: cssVar('--ds-radius-sm'),
    md: cssVar('--ds-radius-md'),
    lg: cssVar('--ds-radius-lg'),
    xl: cssVar('--ds-radius-xl'),
    '2xl': cssVar('--ds-radius-2xl'),
    full: cssVar('--ds-radius-full'),
  },
  shadow: {
    sm: cssVar('--ds-shadow-sm'),
    md: cssVar('--ds-shadow-md'),
    lg: cssVar('--ds-shadow-lg'),
    xl: cssVar('--ds-shadow-xl'),
  },
  font: {
    sans: cssVar('--ds-font-sans'),
    mono: cssVar('--ds-font-mono'),
  },
} as const;

/* ── Static Chart Colors (for recharts / chart libs that need hex) ── */
export const chartColors = {
  light: ['#2563eb', '#10b981', '#7c3aed', '#ea580c', '#0891b2', '#be185d'],
  dark: ['#60a5fa', '#34d399', '#a78bfa', '#fb923c', '#22d3ee', '#f472b6'],
} as const;

export default DS;
