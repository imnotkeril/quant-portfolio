import { COLORS } from './colors';
import { TYPOGRAPHY } from './typography';

/**
 * Theme configuration that combines colors, typography, and other design elements
 */
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
  zIndex: {
    BACKGROUND: -1,
    DEFAULT: 0,
    ELEVATED: 1,
    HEADER: 10,
    DROPDOWN: 20,
    MODAL: 30,
    TOOLTIP: 40,
    NOTIFICATION: 50,
  },
  breakpoints: {
    XS: '480px',
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    XXL: '1536px'
  }
};

/**
 * Media query helpers
 */
export const MEDIA_QUERIES = {
  XS: `@media (min-width: ${THEME.breakpoints.XS})`,
  SM: `@media (min-width: ${THEME.breakpoints.SM})`,
  MD: `@media (min-width: ${THEME.breakpoints.MD})`,
  LG: `@media (min-width: ${THEME.breakpoints.LG})`,
  XL: `@media (min-width: ${THEME.breakpoints.XL})`,
  XXL: `@media (min-width: ${THEME.breakpoints.XXL})`,
  DARK: '@media (prefers-color-scheme: dark)',
  LIGHT: '@media (prefers-color-scheme: light)',
  REDUCED_MOTION: '@media (prefers-reduced-motion: reduce)'
};

export default THEME;