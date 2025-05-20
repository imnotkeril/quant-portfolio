/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors
        background: '#0D1015',
        accent: '#BF9FFB',
        'text-dark': '#0D1015',
        'text-light': '#FFFFFF',

        // Additional colors
        positive: '#74F174',
        negative: '#FAA1A4',
        'neutral-1': '#90BFF9',
        'neutral-2': '#FFF59D',
        'neutral-gray': '#D1D4DC',
        divider: '#2A2E39',

        // Chart colors
        'chart-up': '#D1D4DC',
        'chart-down': '#BF9FFB',

        // UI states
        hover: '#D3BFFC',
        active: '#A880FA',
        disabled: '#757280',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'h1': '24px',
        'h2': '20px',
        'h3': '16px',
        'body': '12px',
        'caption': '10px',
        'footer': '9px',
      },
      lineHeight: {
        'h1': '32px',
        'h2': '28px',
        'h3': '24px',
        'body': '18px',
        'caption': '16px',
        'footer': '14px',
      },
      spacing: {
        'xs': '4px',
        's': '8px',
        'm': '16px',
        'l': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        'xs': '2px',
        's': '4px',
        'm': '8px',
        'l': '12px',
      },
      boxShadow: {
        'small': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 8px rgba(0, 0, 0, 0.15)',
        'large': '0 8px 16px rgba(0, 0, 0, 0.2)',
        'glow': '0px 0px 15px rgba(191, 159, 251, 0.3)',
      },
      transitionProperty: {
        'fast': 'all 0.15s ease-in-out',
        'medium': 'all 0.25s ease-in-out',
        'slow': 'all 0.35s ease-in-out',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #BF9FFB 0%, #A880FA 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0D1015 0%, #1A1E2A 100%)',
      },
    },
  },
  plugins: [],
};