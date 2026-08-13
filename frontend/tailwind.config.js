/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: '#fafafb',
          surface: '#ffffff',
          panel: '#f3f4f6',
          border: 'rgba(0,0,0,0.06)',
          accent: '#1e40af',
          'accent-dim': '#1e3a8a',
          warning: '#e056fd',
          danger: '#e11d48',
          success: '#10b981',
          text: '#0f172a',
          'text-dim': '#64748b',
          gold: '#b45309',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 20px 40px -10px rgba(30, 64, 175, 0.15), 0 2px 8px rgba(30, 64, 175, 0.05)',
        'neon-warning': '0 20px 40px -10px rgba(224, 86, 253, 0.15)',
        'neon-danger': '0 20px 40px -10px rgba(225, 29, 72, 0.15)',
        'neon-success': '0 20px 40px -10px rgba(16, 185, 129, 0.15)',
        'glass': '0 20px 50px -12px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'spin-reverse': 'spin-reverse 15s linear infinite',
        'radar': 'radar 4s linear infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.2), 0 0 10px rgba(0, 212, 255, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        }
      },
    },
  },
  plugins: [],
}
