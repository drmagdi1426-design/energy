import type { Config } from 'tailwindcss';

// Tharwah brand tokens — see src/app/globals.css for the CSS-variable source of truth.
// Keep this palette in sync with the brand guide: Navy dominant, Academy Blue accent,
// Mint/Amber/Gray as supporting tones only. Do not let teal or amber dominate a screen.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        navy: '#06374F',
        'academy-blue': '#3C7DCB',
        mint: '#E3F4F7',
        amber: '#E8A33D',
        'amber-tint': '#FBF1E0',
        'gray-mid': '#797979',
        'gray-dark': '#4D4F53',
        'page-gray': '#F2F2F2',
      },
      fontFamily: {
        latin: ['Arial', 'Helvetica', 'sans-serif'],
        // Bahij Janna is a licensed, non-web font: it only renders for users who already
        // have it installed locally. IBM Plex Sans Arabic is the guaranteed web fallback.
        arabic: ['"Bahij Janna"', '"IBM Plex Sans Arabic"', 'Tahoma', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
      },
    },
  },
  plugins: [],
};

export default config;
