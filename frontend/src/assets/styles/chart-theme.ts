/**
 * Chart theme configuration for Recharts
 */

// Import colors from the constants
import { COLORS } from '../../constants/colors';

/**
 * Theme configuration for charts
 */
export const chartTheme = {
  // Chart colors
  colors: [
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
  ],

  // Candlestick/OHLC colors
  candlestick: {
    up: COLORS.CHART_UP,
    down: COLORS.CHART_DOWN,
    wick: {
      up: COLORS.CHART_UP,
      down: COLORS.CHART_DOWN,
    },
  },

  // Axis styling
  axis: {
    line: {
      stroke: COLORS.DIVIDER,
    },
    tick: {
      stroke: COLORS.TEXT_LIGHT,
      fill: COLORS.TEXT_LIGHT,
      fontSize: 10,
    },
    label: {
      fill: COLORS.TEXT_LIGHT,
      fontSize: 12,
    },
  },

  // Grid styling
  grid: {
    line: {
      stroke: 'rgba(42, 46, 57, 0.6)',
      strokeDasharray: '3 3',
      strokeWidth: 1,
    },
  },

  // Tooltip styling
  tooltip: {
    contentStyle: {
      backgroundColor: 'rgba(13, 16, 21, 0.9)',
      borderColor: COLORS.DIVIDER,
      color: COLORS.TEXT_LIGHT,
      fontSize: 10,
      padding: 8,
      borderRadius: 4,
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    },
    itemStyle: {
      color: COLORS.TEXT_LIGHT,
    },
    cursor: {
      stroke: COLORS.DIVIDER,
      strokeWidth: 1,
      strokeDasharray: '3 3',
    },
  },

  // Legend styling
  legend: {
    align: 'center',
    verticalAlign: 'bottom',
    iconSize: 10,
    itemStyle: {
      fontSize: 10,
      color: COLORS.TEXT_LIGHT,
    },
  },

  // Responsive container
  responsiveContainer: {
    width: '100%',
    height: 300,
  },

  // Font styling
  fontFamily: 'Inter, sans-serif',

  // Animation configuration
  animationDuration: 300,
  animationEasing: 'ease-in-out',

  // Default margins
  margin: {
    top: 10,
    right: 30,
    bottom: 30,
    left: 30,
  },
};

/**
 * Get chart color by index
 * @param index Color index
 * @returns Color from the theme
 */
export const getChartColor = (index: number): string => {
  return chartTheme.colors[index % chartTheme.colors.length];
};

/**
 * Create candlestick data formatter
 * @returns Formatter function for candlestick data
 */
export const createCandlestickFormatter = () => {
  return (value: any, name: string) => {
    if (name === 'open' || name === 'close' || name === 'high' || name === 'low') {
      return [`${value.toFixed(2)}`, name.charAt(0).toUpperCase() + name.slice(1)];
    }
    return [value, name];
  };
};

/**
 * Formatter for percentage values
 * @param value Value to format
 * @returns Formatted percentage
 */
export const percentageFormatter = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

/**
 * Formatter for currency values
 * @param value Value to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency
 */
export const currencyFormatter = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Get linear gradient definition for charts
 * @param id Gradient ID
 * @param startColor Start color
 * @param endColor End color
 * @param vertical Whether gradient is vertical
 * @returns Gradient definition
 */
export const getLinearGradient = (
  id: string,
  startColor: string,
  endColor: string,
  vertical: boolean = false
) => {
  const x1 = vertical ? '0' : '0';
  const y1 = vertical ? '0' : '1';
  const x2 = vertical ? '0' : '1';
  const y2 = vertical ? '1' : '1';

  return (
    <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
      <stop offset="0%" stopColor={startColor} stopOpacity={0.8} />
      <stop offset="100%" stopColor={endColor} stopOpacity={0.2} />
    </linearGradient>
  );
};

export default chartTheme;