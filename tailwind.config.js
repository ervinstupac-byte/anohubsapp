/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'h-cyan': '#06b6d4',
        'h-gold': '#FFB800',
        'h-dark': '#020617',
        slate: {
          950: '#020617',
        }
      }
    },
  },
  plugins: [],
}