/**
 * Color constants for the application
 * These colors are based on the Wild Market Capital design system
 */
export const COLORS = {
  // Primary colors
  BACKGROUND: '#0D1015',
  ACCENT: '#BF9FFB',
  TEXT_DARK: '#0D1015',
  TEXT_LIGHT: '#FFFFFF',

  // Additional colors
  POSITIVE: '#74F174',
  NEGATIVE: '#FAA1A4',
  NEUTRAL_1: '#90BFF9',
  NEUTRAL_2: '#FFF59D',
  NEUTRAL_GRAY: '#D1D4DC',
  DIVIDER: '#2A2E39',

  // Chart colors
  CHART_UP: '#D1D4DC',
  CHART_DOWN: '#BF9FFB',

  // UI states
  HOVER: '#D3BFFC',
  ACTIVE: '#A880FA',
  DISABLED: '#757280',

  // Gradients
  GRADIENT_PRIMARY: 'linear-gradient(135deg, #BF9FFB 0%, #A880FA 100%)',
  GRADIENT_DARK: 'linear-gradient(135deg, #0D1015 0%, #1A1E2A 100%)',

  // Overlays
  OVERLAY_LIGHT: 'rgba(255, 255, 255, 0.05)',
  OVERLAY_DARK: 'rgba(13, 16, 21, 0.7)',

  // Transparent backgrounds
  BACKGROUND_TRANSPARENT: 'rgba(13, 16, 21, 0.5)',
  DIVIDER_TRANSPARENT: 'rgba(42, 46, 57, 0.5)',
};

/**
 * Additional color utilities
 */
export const getAlphaColor = (color: string, alpha: number): string => {
  // Convert hex to rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default COLORS;