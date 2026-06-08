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
        header: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      colors: {
        // AnoHUB Intelligence Palette (NC-26000: post-SCADA refresh)
        'scada-bg': '#080b16', // Deep space slate
        'scada-panel': '#10162a', // Panel surface
        'scada-border': '#26304d', // Soft border
        'scada-text': '#e7ecf6', // Light text
        'scada-muted': '#8b97b5', // Muted text

        // Brand (indigo/violet) — the new primary identity
        brand: {
          50: '#eef0ff', 100: '#e0e3ff', 200: '#c6ccff', 300: '#a3acff',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
        },
        // Accent (aqua/teal) — secondary highlight
        accent: {
          300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488',
          700: '#0f766e', 800: '#115e59', 900: '#134e4a', 950: '#042f2e',
        },

        // Strict Status Colors
        'status-ok': '#34d399', // Emerald 400
        'status-warning': '#fbbf24', // Amber 400
        'status-error': '#f87171', // Red 400
        'status-info': '#818cf8', // Brand 400

        // Legacy/Compat mappings (remapped to the new Intelligence palette)
        'h-cyan': '#818cf8', // Mapped to brand indigo
        'h-green': '#34d399',
        'h-red': '#f87171',
        'h-yellow': '#fbbf24',
        'h-gold': '#fbbf24',
        'h-purple': '#a78bfa', // Violet
        'h-dark': '#080b16',
        'h-panel': '#10162a',
        'h-border': '#26304d',
        'h-cta': '#6366f1',
        'h-teal': '#2dd4bf',

        // Former neons (mapped to the new palette)
        'neon-cyan': '#818cf8',
        'neon-green': '#34d399',
        'warning-orange': '#fbbf24',
        'alarm-red': '#f87171',
        'hydro-charcoal': '#080b16',
        'hydro-primary': '#6366f1',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, rgba(99,102,241,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.07) 1px, transparent 1px)",
        'brand-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #2dd4bf 100%)',
      },
      boxShadow: {
        'scada-inset': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.4)',
        'scada-card': '0 8px 30px -12px rgb(0 0 0 / 0.6)',
        'glow': '0 0 0 1px rgba(99,102,241,0.25), 0 8px 30px -8px rgba(99,102,241,0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite', // Keep for alarms
        'spin-slow': 'spin 12s linear infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.7' }
        }
      },
      transitionDuration: {
        'fast': '100ms', // Faster
        'normal': '150ms',
      }
    },
  },
  plugins: [],
}
