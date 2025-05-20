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
  }
};

// Tailwind CSS class helpers for typography
export const TYPOGRAPHY_CLASSES = {
  // Headings
  H1: 'text-2xl font-semibold text-text-light',
  H2: 'text-xl font-semibold text-text-light',
  H3: 'text-base font-semibold text-text-light',
  H4: 'text-sm font-semibold text-text-light',

  // Body text
  BODY: 'text-base text-text-light',
  BODY_SMALL: 'text-sm text-text-light',
  BODY_TINY: 'text-xs text-text-light',

  // Secondary text
  SECONDARY: 'text-base text-neutral-gray',
  SECONDARY_SMALL: 'text-sm text-neutral-gray',
  SECONDARY_TINY: 'text-xs text-neutral-gray',

  // Special styles
  CAPTION: 'text-xs font-medium text-neutral-gray',
  LABEL: 'text-sm font-medium text-text-light',
  BUTTON_TEXT: 'text-sm font-medium',
  BREADCRUMB: 'text-xs text-neutral-gray hover:text-accent transition-colors',
  LINK: 'text-accent hover:text-hover transition-colors',
  CODE: 'font-mono text-sm bg-background px-1 py-0.5 rounded border border-divider'
};

export default TYPOGRAPHY;