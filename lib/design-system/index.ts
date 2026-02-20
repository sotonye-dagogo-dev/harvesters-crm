/**
 * Design System — Public API
 *
 * Re-exports everything from the design-system module
 * so consumers can do:
 *   import { DS, getAntdTheme, chartColors } from '@/lib/design-system';
 */
export { DS, palette, cssVar, chartColors, default as tokens } from './tokens';
export { getAntdTheme, getCSSVar } from './antd-theme';
