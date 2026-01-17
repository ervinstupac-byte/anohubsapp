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
        header: ['Oswald', 'sans-serif'],
      },
      colors: {
        'h-cyan': '#06b6d4',
        'h-green': '#10b981',
        'h-red': '#ef4444',
        'h-yellow': '#facc15',
        'h-gold': '#FFB800',
        'h-purple': '#8b5cf6',
        'h-dark': '#020617',
        'h-panel': '#0f172a',
        'h-border': '#1e293b',
        'h-cta': '#f59e0b',
        'h-teal': '#2dd4bf',
        'neon-cyan': '#00f3ff',
        'warning-orange': '#ffaa00',
        'alarm-red': '#ff0033',
        'hydro-charcoal': '#111827',
        'hydro-primary': '#22d3ee',
        // Semantic colors (Elite Industrial Palette)
        'success': '#10b981',
        'warning': '#f59e0b',
        'danger': '#f43f5e',
        slate: {
          950: '#020617',
        }
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0))',
        'grid-pattern': "linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)"
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 243, 255, 0.4)',
        'neon-orange': '0 0 15px rgba(255, 170, 0, 0.4)',
        'neon-red': '0 0 15px rgba(255, 0, 51, 0.4)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.15), 0 0 40px rgba(6, 182, 212, 0.05)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.3s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'smooth': '250ms',
      },
      transitionTimingFunction: {
        'snappy': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}