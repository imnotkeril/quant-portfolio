import { COLORS } from './colors';
import { TYPOGRAPHY } from './typography';

export const THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: {
    XS: '4px',
    S: '8px',
    M: '16px',
    L: '24px',
    XL: '32px',
    XXL: '48px',
    XXXL: '64px'
  },
  borderRadius: {
    XS: '2px',
    S: '4px',
    M: '8px',
    L: '12px',
    CIRCLE: '50%'
  },
  shadows: {
    SMALL: '0 2px 4px rgba(0, 0, 0, 0.1)',
    MEDIUM: '0 4px 8px rgba(0, 0, 0, 0.15)',
    LARGE: '0 8px 16px rgba(0, 0, 0, 0.2)',
    GLOW: '0px 0px 15px rgba(191, 159, 251, 0.3)'
  },
  transitions: {
    FAST: '0.15s ease-in-out',
    MEDIUM: '0.25s ease-in-out',
    SLOW: '0.35s ease-in-out'
  },
  // Layout settings
  layout: {
    SIDEBAR_WIDTH: '260px',
    HEADER_HEIGHT: '64px',
    CONTENT_MAX_WIDTH: '1200px',
    FOOTER_HEIGHT: '60px'
  },
  // Z-index layers
  zIndex: {
    BELOW: -1,
    BASE: 0,
    CONTENT: 10,
    HEADER: 100,
    SIDEBAR: 200,
    DROPDOWN: 300,
    MODAL: 400,
    TOOLTIP: 500,
    OVERLAY: 600,
    NOTIFICATION: 700
  },
  // Media query breakpoints (in px)
  breakpoints: {
    XS: 480,  // Extra small devices
    SM: 640,  // Small devices
    MD: 768,  // Medium devices
    LG: 1024, // Large devices
    XL: 1280, // Extra large devices
    XXL: 1536  // Super large devices
  },
  // Chart specific theme settings
  charts: {
    DEFAULT_HEIGHT: 300,
    SMALL_HEIGHT: 200,
    LARGE_HEIGHT: 400,
    MINI_HEIGHT: 40,
    LINE_STROKE_WIDTH: 2,
    POINT_SIZE: 4,
    BAR_SIZE: 20,
    AXIS_LINE_COLOR: COLORS.DIVIDER,
    GRID_LINE_COLOR: `${COLORS.DIVIDER}80`, // With opacity
    LABEL_COLOR: COLORS.TEXT_LIGHT,
    TOOLTIP_BACKGROUND: COLORS.BACKGROUND,
    TOOLTIP_BORDER: COLORS.DIVIDER,
    TOOLTIP_TEXT: COLORS.TEXT_LIGHT,
    COLOR_SCHEMES: {
      // Sequential blues
      SEQUENTIAL_BLUES: ['#DEEBF7', '#9ECAE1', '#4292C6', '#2171B5', '#084594'],
      // Sequential purples - based on ACCENT
      SEQUENTIAL_PURPLES: ['#D3BFFC', '#BF9FFB', '#A880FA', '#8A5CF5', '#6C3BF0'],
      // Red to green diverging
      DIVERGING: ['#FAA1A4', '#FFBBBB', '#D1D4DC', '#A5E4A8', '#74F174'],
      // Categorical - mix of distinguishable colors
      CATEGORICAL: [
        COLORS.ACCENT,    // Primary accent
        COLORS.NEUTRAL_1, // Blue
        COLORS.NEUTRAL_2, // Yellow
        COLORS.POSITIVE,  // Green
        COLORS.NEGATIVE,  // Red
        '#A880FA',        // Light purple
        '#7B68EE',        // Medium slate blue
        '#20B2AA',        // Light sea green
        '#4682B4',        // Steel blue
        '#DDA0DD',        // Plum
      ]
    }
  }
};

// Tailwind theme helper function to generate CSS variables
export const generateCssVariables = () => {
  return {
    // Colors
    '--color-background': COLORS.BACKGROUND,
    '--color-accent': COLORS.ACCENT,
    '--color-text-dark': COLORS.TEXT_DARK,
    '--color-text-light': COLORS.TEXT_LIGHT,
    '--color-positive': COLORS.POSITIVE,
    '--color-negative': COLORS.NEGATIVE,
    '--color-neutral-1': COLORS.NEUTRAL_1,
    '--color-neutral-2': COLORS.NEUTRAL_2,
    '--color-neutral-gray': COLORS.NEUTRAL_GRAY,
    '--color-divider': COLORS.DIVIDER,
    '--color-chart-up': COLORS.CHART_UP,
    '--color-chart-down': COLORS.CHART_DOWN,
    '--color-hover': COLORS.HOVER,
    '--color-active': COLORS.ACTIVE,
    '--color-disabled': COLORS.DISABLED,

    // Typography
    '--font-family': TYPOGRAPHY.FONT_FAMILY,
    '--font-weight-light': TYPOGRAPHY.WEIGHT.LIGHT,
    '--font-weight-regular': TYPOGRAPHY.WEIGHT.REGULAR,
    '--font-weight-medium': TYPOGRAPHY.WEIGHT.MEDIUM,
    '--font-weight-semi-bold': TYPOGRAPHY.WEIGHT.SEMI_BOLD,
    '--font-weight-bold': TYPOGRAPHY.WEIGHT.BOLD,

    // Spacing
    '--spacing-xs': THEME.spacing.XS,
    '--spacing-s': THEME.spacing.S,
    '--spacing-m': THEME.spacing.M,
    '--spacing-l': THEME.spacing.L,
    '--spacing-xl': THEME.spacing.XL,
    '--spacing-xxl': THEME.spacing.XXL,
    '--spacing-xxxl': THEME.spacing.XXXL,

    // Border radius
    '--border-radius-xs': THEME.borderRadius.XS,
    '--border-radius-s': THEME.borderRadius.S,
    '--border-radius-m': THEME.borderRadius.M,
    '--border-radius-l': THEME.borderRadius.L,

    // Shadows
    '--shadow-small': THEME.shadows.SMALL,
    '--shadow-medium': THEME.shadows.MEDIUM,
    '--shadow-large': THEME.shadows.LARGE,
    '--shadow-glow': THEME.shadows.GLOW,

    // Transitions
    '--transition-fast': THEME.transitions.FAST,
    '--transition-medium': THEME.transitions.MEDIUM,
    '--transition-slow': THEME.transitions.SLOW,

    // Layout
    '--sidebar-width': THEME.layout.SIDEBAR_WIDTH,
    '--header-height': THEME.layout.HEADER_HEIGHT,
    '--content-max-width': THEME.layout.CONTENT_MAX_WIDTH,
    '--footer-height': THEME.layout.FOOTER_HEIGHT,
  };
};

// Helper function to get breakpoint values for responsive design
export const getBreakpoint = (breakpoint: keyof typeof THEME.breakpoints) => {
  return `${THEME.breakpoints[breakpoint]}px`;
};

// Media query helpers for styled-components or CSS-in-JS libraries
export const mediaQueries = {
  xs: `@media (min-width: ${getBreakpoint('XS')})`,
  sm: `@media (min-width: ${getBreakpoint('SM')})`,
  md: `@media (min-width: ${getBreakpoint('MD')})`,
  lg: `@media (min-width: ${getBreakpoint('LG')})`,
  xl: `@media (min-width: ${getBreakpoint('XL')})`,
  xxl: `@media (min-width: ${getBreakpoint('XXL')})`,
};

export default THEME;