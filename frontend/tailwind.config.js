/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: '#faf9f6',
          surface: '#ffffff',
          panel: '#f5f4f0',
          border: '#e8e6e1',
          accent: '#ff4f00',
          'accent-dim': '#cc3f00',
          warning: '#ea580c',
          danger: '#dc2626',
          success: '#16a34a',
          text: '#1a1a1a',
          'text-dim': '#7c7a77',
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
        'neon-cyan': '4px 4px 0px 0px rgba(255, 79, 0, 0.12)',
        'neon-warning': '4px 4px 0px 0px rgba(234, 88, 12, 0.12)',
        'neon-danger': '4px 4px 0px 0px rgba(220, 38, 38, 0.12)',
        'neon-success': '4px 4px 0px 0px rgba(22, 163, 74, 0.12)',
        'glass': '6px 6px 0px 0px rgba(0, 0, 0, 0.02)',
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
