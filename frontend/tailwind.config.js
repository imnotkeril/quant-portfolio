/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#0D1015',
        accent: '#BF9FFB',
        'text-dark': '#0D1015',
        'text-light': '#FFFFFF',
        positive: '#74F174',
        negative: '#FAA1A4',
        'neutral-1': '#90BFF9',
        'neutral-2': '#FFF59D',
        'neutral-gray': '#D1D4DC',
        divider: '#2A2E39',
        'chart-up': '#D1D4DC',
        'chart-down': '#BF9FFB',
        hover: '#D3BFFC',
        active: '#A880FA',
        disabled: '#757280',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
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
      transitionTimingFunction: {
        'in-out': 'ease-in-out',
      },
      transitionDuration: {
        'fast': '150ms',
        'medium': '250ms',
        'slow': '350ms',
      }
    },
  },
  plugins: [],
}