/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        royal: {
          DEFAULT: '#6d28d9',
          dark: '#4c1d95',
          light: '#8b5cf6',
        },
        champagne: {
          50: '#fefdfa',
          100: '#fbf7ed',
          200: '#f5edd2',
          300: '#eddcaa',
          400: '#e3c67c',
          500: '#d4aa4f',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(124, 58, 237, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'luxury': '0 10px 30px -4px rgba(109, 40, 217, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 25px rgba(168, 85, 247, 0.35)',
      }
    },
  },
  plugins: [],
}

