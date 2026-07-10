/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        stellar: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5bcfc',
          400: '#7b97f8',
          500: '#5b6ef3',
          600: '#4347e8',
          700: '#3836d5',
          800: '#2e2dab',
          900: '#2a2a87',
          950: '#1a1a50',
        },
        aurora: {
          cyan: '#06b6d4',
          purple: '#8b5cf6',
          pink: '#ec4899',
          emerald: '#10b981',
          amber: '#f59e0b',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.1)',
          hover: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(91,110,243,0.3) 0%, transparent 60%), radial-gradient(ellipse at 100% 50%, rgba(139,92,246,0.2) 0%, transparent 50%), radial-gradient(ellipse at 0% 100%, rgba(6,182,212,0.2) 0%, transparent 50%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'button-gradient': 'linear-gradient(135deg, #5b6ef3 0%, #8b5cf6 100%)',
        'success-gradient': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'danger-gradient': 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(91,110,243,0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(91,110,243,0.8), 0 0 40px rgba(139,92,246,0.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        glow: '0 0 20px rgba(91, 110, 243, 0.4)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.4)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.4)',
      },
    },
  },
  plugins: [],
}
