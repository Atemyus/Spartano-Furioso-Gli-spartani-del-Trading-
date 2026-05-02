/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'nexora-navy': '#0b1e3f',
        'nexora-blue': '#1e3a8a',
        'nexora-cyan': '#38bdf8',
        'nexora-silver': '#cbd5e1',
        'spartan-red': '#1e3a8a',
        'ancient-gold': '#38bdf8',
        'dark-bronze': '#475569',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'display': ['Space Grotesk', 'Inter', 'sans-serif'],
        'mono-lab': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 20s linear infinite',
        'gradient': 'gradient 3s ease infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'shake': 'shake 0.5s',
        'fire': 'fire 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.8s ease-out',
        'slide-in-left': 'slideInLeft 0.8s ease-out',
        'slide-in-right': 'slideInRight 0.8s ease-out',
        'fade-in': 'fadeIn 1s ease-in',
        'scale-in': 'scaleIn 0.5s ease-out',
        'rotate-glow': 'rotateGlow 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(56, 189, 248, 0.4)' },
        },
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        fire: {
          '0%, 100%': { 
            transform: 'scaleY(1) translateY(0)',
            opacity: '1'
          },
          '50%': { 
            transform: 'scaleY(1.1) translateY(-2px)',
            opacity: '0.9'
          }
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-50px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(50px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        rotateGlow: {
          '0%, 100%': {
            transform: 'rotate(0deg)',
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)'
          },
          '50%': {
            transform: 'rotate(180deg)',
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.5)'
          }
        }
      },
      backgroundImage: {
        'spartan-gradient': 'linear-gradient(135deg, #0b1e3f 0%, #38bdf8 50%, #0b1e3f 100%)',
        'gold-gradient': 'linear-gradient(135deg, #38bdf8 0%, #7dd3fc 100%)',
        'bronze-gradient': 'linear-gradient(135deg, #1e3a8a 0%, #475569 100%)',
        'nexora-gradient': 'linear-gradient(135deg, #0b1e3f 0%, #1e3a8a 50%, #38bdf8 100%)',
        'nexora-shine': 'linear-gradient(135deg, #38bdf8 0%, #cbd5e1 50%, #7dd3fc 100%)',
      }
    },
  },
  plugins: [],
};