/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // support class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        thermal: {
          cool: '#10b981', // emerald-500
          moderate: '#f59e0b', // amber-500
          warm: '#f97316', // orange-500
          hot: '#ef4444', // red-500
          extreme: '#7f1d1d', // red-900
        },
        brand: {
          bg: '#0b0f19', // Premium deep night blue
          card: 'rgba(17, 25, 40, 0.75)', // Glassmorphism background
          border: 'rgba(255, 255, 255, 0.08)',
          highlight: '#38bdf8', // Sky-400
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-radar': 'radar 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'scan': 'scan 4s linear infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'scale(0.95)', opacity: '0.5' },
          '50%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(0.95)', opacity: '0.5' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scan: {
          '0%': { top: '0%' },
          '50%': { top: '100%' },
          '100%': { top: '0%' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
