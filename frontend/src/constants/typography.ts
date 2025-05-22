/**
 * Typography constants for the application
 * Based on the Inter font family as specified in the Wild Market Capital design system
 */
export const TYPOGRAPHY = {
  // Font family
  FONT_FAMILY: "'Inter', sans-serif",

  // Font weights
  WEIGHT: {
    LIGHT: 300,
    REGULAR: 400,
    MEDIUM: 500,
    SEMI_BOLD: 600,
    BOLD: 700
  },

  // Font sizes
  SIZE: {
    H1: '24px',
    H2: '20px',
    H3: '16px',
    BODY: '12px',
    CAPTION: '10px',
    FOOTER: '9px'
  },

  // Line heights
  LINE_HEIGHT: {
    H1: '32px',
    H2: '28px',
    H3: '24px',
    BODY: '18px',
    CAPTION: '16px',
    FOOTER: '14px'
  },

  // Letter spacing
  LETTER_SPACING: {
    TIGHT: '-0.01em',
    NORMAL: '0',
    WIDE: '0.01em'
  }
};

/**
 * Typography style presets
 */
export const TEXT_STYLES = {
  H1: {
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
    fontSize: TYPOGRAPHY.SIZE.H1,
    fontWeight: TYPOGRAPHY.WEIGHT.BOLD,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.H1,
  },
  H2: {
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
    fontSize: TYPOGRAPHY.SIZE.H2,
    fontWeight: TYPOGRAPHY.WEIGHT.SEMI_BOLD,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.H2,
  },
  H3: {
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
    fontSize: TYPOGRAPHY.SIZE.H3,
    fontWeight: TYPOGRAPHY.WEIGHT.MEDIUM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.H3,
  },
  BODY: {
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
    fontSize: TYPOGRAPHY.SIZE.BODY,
    fontWeight: TYPOGRAPHY.WEIGHT.REGULAR,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.BODY,
  },
  BODY_MEDIUM: {
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
    fontSize: TYPOGRAPHY.SIZE.BODY,
    fontWeight: TYPOGRAPHY.WEIGHT.MEDIUM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.BODY,
  },
  CAPTION: {
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
    fontSize: TYPOGRAPHY.SIZE.CAPTION,
    fontWeight: TYPOGRAPHY.WEIGHT.REGULAR,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.CAPTION,
  },
  FOOTER: {
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
    fontSize: TYPOGRAPHY.SIZE.FOOTER,
    fontWeight: TYPOGRAPHY.WEIGHT.LIGHT,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.FOOTER,
  },
};

export default TYPOGRAPHY;