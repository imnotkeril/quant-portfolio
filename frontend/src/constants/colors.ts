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
  GRADIENT_DARK: 'linear-gradient(135deg, #0D1015 0%, #1A1E2A 100%)'
};

export const getColorByValue = (value: number): string => {
  if (value > 0) return COLORS.POSITIVE;
  if (value < 0) return COLORS.NEGATIVE;
  return COLORS.NEUTRAL_GRAY;
};

export const getColorByThreshold = (
  value: number,
  thresholds: {
    positive: number;
    negative: number;
    neutral?: number;
  },
  colors?: {
    positive?: string;
    negative?: string;
    neutral?: string;
  }
): string => {
  const colorSet = {
    positive: colors?.positive || COLORS.POSITIVE,
    negative: colors?.negative || COLORS.NEGATIVE,
    neutral: colors?.neutral || COLORS.NEUTRAL_GRAY
  };

  if (value >= thresholds.positive) return colorSet.positive;
  if (value <= thresholds.negative) return colorSet.negative;
  return colorSet.neutral;
};

export const getChartColorScheme = (length: number = 10): string[] => {
  // Base chart color palette
  const baseColors = [
    COLORS.ACCENT,
    COLORS.NEUTRAL_1,
    COLORS.NEUTRAL_2,
    COLORS.POSITIVE,
    COLORS.NEGATIVE,
    '#A880FA', // Lighter accent
    '#7B68EE', // Medium slate blue
    '#9370DB', // Medium purple
    '#20B2AA', // Light sea green
    '#48D1CC', // Medium turquoise
    '#5F9EA0', // Cadet blue
    '#4682B4', // Steel blue
    '#6495ED', // Cornflower blue
    '#B0C4DE', // Light steel blue
    '#ADD8E6', // Light blue
    '#87CEEB', // Sky blue
    '#E6E6FA', // Lavender
    '#D8BFD8', // Thistle
    '#DDA0DD', // Plum
    '#EE82EE'  // Violet
  ];

  // If we need more colors than we have in our base palette, we create variations
  if (length <= baseColors.length) {
    return baseColors.slice(0, length);
  }

  // Generate additional colors by adding opacity variations
  const extendedColors = [...baseColors];

  for (let i = 0; extendedColors.length < length; i++) {
    // Cycle through base colors with different opacity levels
    const baseIndex = i % baseColors.length;
    const opacity = 0.8 - (Math.floor(i / baseColors.length) * 0.2);

    if (opacity <= 0.2) break; // Don't go too transparent

    const baseColor = baseColors[baseIndex];
    // If it's a hex color, convert to rgba
    if (baseColor.startsWith('#')) {
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      extendedColors.push(`rgba(${r}, ${g}, ${b}, ${opacity})`);
    } else {
      // If it's already rgba or another format, we can't easily modify it
      // Just use the base color again
      extendedColors.push(baseColor);
    }
  }

  return extendedColors.slice(0, length);
};

// Color schemes for different chart types
export const COLOR_SCHEMES = {
  // Sequential scheme - for values that progress from low to high
  SEQUENTIAL: ['#D3BFFC', '#BF9FFB', '#A880FA', '#8A5CF5', '#6C3BF0'],

  // Diverging scheme - for values that diverge from a center point
  DIVERGING: ['#FAA1A4', '#FFBBBB', '#D1D4DC', '#A5E4A8', '#74F174'],

  // Categorical scheme - for discrete categories
  CATEGORICAL: getChartColorScheme(10),

  // Specific schemes for financial data
  RETURNS: ['#74F174', '#A5E4A8', '#D1D4DC', '#FFBBBB', '#FAA1A4'],
  RISK: ['#74F174', '#A5E4A8', '#FFEF9E', '#FFBBBB', '#FAA1A4']
};

export default COLORS;