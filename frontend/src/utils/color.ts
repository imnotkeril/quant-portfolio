/**
 * Utility functions for working with colors
 */
import { COLORS } from '../constants/colors';

/**
 * Parse a hex color code into RGB components
 * @param hex Hex color code (e.g., "#FFFFFF" or "#FFF")
 * @returns RGB components as an object with r, g, b properties
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('');
  }
  
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  
  return { r, g, b };
};

/**
 * Convert RGB components to a hex color code
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns Hex color code
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

/**
 * Convert RGB components to an rgba string
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @param a Alpha component (0-1)
 * @returns RGBA string (e.g., "rgba(255, 255, 255, 0.5)")
 */
export const rgbToRgbaString = (
  r: number,
  g: number,
  b: number,
  a: number
): string => {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/**
 * Add transparency to a hex color
 * @param hex Hex color code
 * @param alpha Alpha value (0-1)
 * @returns RGBA string
 */
export const addAlpha = (hex: string, alpha: number): string => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToRgbaString(r, g, b, alpha);
};

/**
 * Calculate luminance of a color
 * @param hex Hex color code
 * @returns Luminance value (0-1)
 */
export const calculateLuminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);
  
  // Convert RGB to linear RGB
  const linearR = r / 255 <= 0.03928 ? r / 255 / 12.92 : Math.pow((r / 255 + 0.055) / 1.055, 2.4);
  const linearG = g / 255 <= 0.03928 ? g / 255 / 12.92 : Math.pow((g / 255 + 0.055) / 1.055, 2.4);
  const linearB = b / 255 <= 0.03928 ? b / 255 / 12.92 : Math.pow((b / 255 + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
};

/**
 * Determine if a color is light or dark
 * @param hex Hex color code
 * @returns True if color is light, false if dark
 */
export const isLightColor = (hex: string): boolean => {
  return calculateLuminance(hex) > 0.5;
};

/**
 * Get contrasting text color (black or white) for a background color
 * @param hex Background color in hex format
 * @returns Text color in hex format (#FFFFFF or #000000)
 */
export const getContrastingTextColor = (hex: string): string => {
  return isLightColor(hex) ? '#000000' : '#FFFFFF';
};

/**
 * Lighten a color by a certain amount
 * @param hex Hex color code
 * @param amount Amount to lighten (0-1)
 * @returns Lightened color in hex format
 */
export const lightenColor = (hex: string, amount: number): string => {
  const { r, g, b } = hexToRgb(hex);
  
  const newR = Math.min(255, Math.round(r + (255 - r) * amount));
  const newG = Math.min(255, Math.round(g + (255 - g) * amount));
  const newB = Math.min(255, Math.round(b + (255 - b) * amount));
  
  return rgbToHex(newR, newG, newB);
};

/**
 * Darken a color by a certain amount
 * @param hex Hex color code
 * @param amount Amount to darken (0-1)
 * @returns Darkened color in hex format
 */
export const darkenColor = (hex: string, amount: number): string => {
  const { r, g, b } = hexToRgb(hex);
  
  const newR = Math.max(0, Math.round(r * (1 - amount)));
  const newG = Math.max(0, Math.round(g * (1 - amount)));
  const newB = Math.max(0, Math.round(b * (1 - amount)));
  
  return rgbToHex(newR, newG, newB);
};

/**
 * Generate a gradient color between two colors
 * @param startColor Start color in hex format
 * @param endColor End color in hex format
 * @param ratio Ratio between the colors (0-1, where 0 is startColor and 1 is endColor)
 * @returns Gradient color in hex format
 */
export const getGradientColor = (
  startColor: string,
  endColor: string,
  ratio: number
): string => {
  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);
  
  const r = Math.round(start.r + (end.r - start.r) * ratio);
  const g = Math.round(start.g + (end.g - start.g) * ratio);
  const b = Math.round(start.b + (end.b - start.b) * ratio);
  
  return rgbToHex(r, g, b);
};

/**
 * Get a color for a percentage value (red for low, yellow for mid, green for high)
 * @param percentage Percentage value (0-1)
 * @param invert Whether to invert the color scale (green for low, red for high)
 * @returns Color in hex format
 */
export const getPercentageColor = (
  percentage: number,
  invert: boolean = false
): string => {
  // Ensure percentage is between 0 and 1
  percentage = Math.max(0, Math.min(1, percentage));
  
  // Invert if needed
  if (invert) {
    percentage = 1 - percentage;
  }
  
  // Use project colors
  const lowColor = COLORS.NEGATIVE;
  const midColor = COLORS.NEUTRAL_2;
  const highColor = COLORS.POSITIVE;
  
  // Calculate color
  if (percentage < 0.5) {
    // Between low and mid
    return getGradientColor(lowColor, midColor, percentage * 2);
  } else {
    // Between mid and high
    return getGradientColor(midColor, highColor, (percentage - 0.5) * 2);
  }
};

/**
 * Get a color for a change value (red for negative, green for positive)
 * @param change Change value
 * @param invert Whether to invert the color scale
 * @returns Color in hex format
 */
export const getChangeColor = (change: number, invert: boolean = false): string => {
  if (change === 0) return COLORS.NEUTRAL_GRAY;
  
  const isPositive = change > 0;
  const shouldUsePositiveColor = invert ? !isPositive : isPositive;
  
  return shouldUsePositiveColor ? COLORS.POSITIVE : COLORS.NEGATIVE;
};

/**
 * Get a heat map color based on a value within a range
 * @param value Current value
 * @param min Minimum value for the range
 * @param max Maximum value for the range
 * @param invert Whether to invert the color scale
 * @returns Color in hex format
 */
export const getHeatMapColor = (
  value: number,
  min: number,
  max: number,
  invert: boolean = false
): string => {
  // Calculate normalized value (0-1)
  const range = max - min;
  if (range === 0) return COLORS.NEUTRAL_GRAY;
  
  let normalizedValue = (value - min) / range;
  normalizedValue = Math.max(0, Math.min(1, normalizedValue));
  
  return getPercentageColor(normalizedValue, invert);
};

/**
 * Get a linear gradient string for use in CSS
 * @param direction Direction of the gradient ('to right', 'to bottom', etc.)
 * @param colors Array of colors to use in the gradient
 * @returns CSS linear gradient string
 */
export const getLinearGradient = (
  direction: string,
  colors: string[]
): string => {
  if (!colors || colors.length === 0) return 'none';
  if (colors.length === 1) return colors[0];
  
  const stops = colors.map((color, index) => {
    const position = index / (colors.length - 1) * 100;
    return `${color} ${position}%`;
  }).join(', ');
  
  return `linear-gradient(${direction}, ${stops})`;
};

/**
 * Get a chart color from the project color palette
 * @param index Index of the color in the chart palette
 * @returns Color in hex format
 */
export const getChartColor = (index: number): string => {
  const chartColors = [
    COLORS.ACCENT,
    COLORS.POSITIVE,
    COLORS.NEGATIVE,
    COLORS.NEUTRAL_1,
    COLORS.NEUTRAL_2,
    '#A880FA', // Lighter accent
    '#D3BFFC', // Even lighter accent
    '#5D9DF7', // Lighter blue
    '#C3E0FF', // Even lighter blue
    '#FF8C79', // Light red
    '#FBD38D', // Light orange
  ];
  
  return chartColors[index % chartColors.length];
};