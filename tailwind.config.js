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
        // Industrial SCADA Palette
        'scada-bg': '#020617', // Slate 950
        'scada-panel': '#0f172a', // Slate 900
        'scada-border': '#334155', // Slate 700
        'scada-text': '#e2e8f0', // Slate 200
        'scada-muted': '#94a3b8', // Slate 400

        // Strict Status Colors
        'status-ok': '#22c55e', // Green 500
        'status-warning': '#f59e0b', // Amber 500
        'status-error': '#ef4444', // Red 500
        'status-info': '#3b82f6', // Blue 500

        // Legacy/Compat mappings (remapped to industrial tones)
        'h-cyan': '#3b82f6', // Mapped to Blue
        'h-green': '#22c55e',
        'h-red': '#ef4444',
        'h-yellow': '#f59e0b',
        'h-gold': '#f59e0b',
        'h-purple': '#64748b', // Muted slate
        'h-dark': '#020617',
        'h-panel': '#0f172a',
        'h-border': '#334155', // Sharper border
        'h-cta': '#f59e0b',
        'h-teal': '#14b8a6', // Teal is okay for specific gauges but no neon
        
        // Eradicated Neons (Mapped to standard colors)
        'neon-cyan': '#0ea5e9', // Sky 500
        'neon-green': '#22c55e',
        'warning-orange': '#f59e0b',
        'alarm-red': '#ef4444',
        'hydro-charcoal': '#020617',
        'hydro-primary': '#0ea5e9',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)"
      },
      boxShadow: {
        // Removed neon glows
        'scada-inset': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.5)',
        'scada-card': '0 1px 3px 0 rgb(0 0 0 / 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite', // Keep for alarms
        'spin-slow': 'spin 12s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
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
