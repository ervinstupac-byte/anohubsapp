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
        mono: ['Roboto Mono', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        'h-cyan': '#06b6d4',
        'h-gold': '#FFB800',
        'h-dark': '#020617',
        'h-teal': '#2dd4bf',
        'neon-cyan': '#00f3ff',
        'warning-orange': '#ffaa00',
        'alarm-red': '#ff0033',
        slate: {
          950: '#020617',
        }
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0))',
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 243, 255, 0.4)',
        'neon-orange': '0 0 15px rgba(255, 170, 0, 0.4)',
        'neon-red': '0 0 15px rgba(255, 0, 51, 0.4)',
      }
    },
  },
  plugins: [],
}