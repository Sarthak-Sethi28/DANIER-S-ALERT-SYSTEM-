/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Danier Ultra-Premium Fashion Brand Colors
        'danier': {
          gold: '#d4af37',
          'gold-light': '#e6c55a',
          'gold-dark': '#b8941f',
          'gold-metallic': '#ffd700',
          beige: '#f5f5dc',
          'beige-light': '#fafaf7',
          dark: '#2c2c2c',
          'dark-light': '#3d3d3d',
          'dark-lighter': '#525252',
          'black-fashion': '#1a1a1a',
        },
        // Ultra-Luxury Fashion Palette
        'luxury': {
          cream: '#fdf8f0',
          champagne: '#f7e7ce',
          'champagne-light': '#faf2e8',
          bronze: '#cd7f32',
          copper: '#b87333',
          pearl: '#f8f6f0',
          marble: '#f5f5f5',
          'rose-gold': '#e8b4a0',
          platinum: '#e5e4e2',
          velvet: '#722f37',
          silk: '#f5f3f0',
        },
        // Fashion-Forward Grays
        'slate': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Premium Fashion Accents
        'fashion': {
          'midnight': '#191970',
          'burgundy': '#800020',
          'emerald': '#50c878',
          'sapphire': '#0f52ba',
          'ruby': '#e0115f',
          'diamond': '#b9f2ff',
        }
      },
      backgroundImage: {
        'gradient-luxury': 'linear-gradient(135deg, #d4af37 0%, #f7e7ce 100%)',
        'gradient-gold': 'linear-gradient(135deg, #d4af37 0%, #e6c55a 50%, #b8941f 100%)',
        'gradient-dark': 'linear-gradient(135deg, #2c2c2c 0%, #3d3d3d 100%)',
        'gradient-premium': 'linear-gradient(135deg, #fdf8f0 0%, #f7e7ce 50%, #d4af37 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gradient-fashion': 'linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #e8b4a0 100%)',
        'gradient-velvet': 'linear-gradient(135deg, #722f37 0%, #800020 100%)',
        'gradient-silk': 'linear-gradient(135deg, #f5f3f0 0%, #fdf8f0 100%)',
        'gradient-3d': 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 50%, #e0e0e0 100%)',
        'gradient-3d-dark': 'linear-gradient(145deg, #2c2c2c 0%, #1a1a1a 50%, #0a0a0a 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'bounce-subtle': 'bounceSubtle 3s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'rotate-3d': 'rotate3d 20s linear infinite',
        'tilt-3d': 'tilt3d 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'fashion-entrance': 'fashionEntrance 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'luxury-hover': 'luxuryHover 0.6s ease-out',
        'premium-spin': 'premiumSpin 8s linear infinite',
        'diamond-sparkle': 'diamondSparkle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.5)' },
          '50%': { boxShadow: '0 0 0 15px rgba(212, 175, 55, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(-5px) rotate(-1deg)' },
        },
        rotate3d: {
          '0%': { transform: 'rotateY(0deg) rotateX(0deg)' },
          '25%': { transform: 'rotateY(90deg) rotateX(5deg)' },
          '50%': { transform: 'rotateY(180deg) rotateX(0deg)' },
          '75%': { transform: 'rotateY(270deg) rotateX(-5deg)' },
          '100%': { transform: 'rotateY(360deg) rotateX(0deg)' },
        },
        tilt3d: {
          '0%, 100%': { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)' },
          '25%': { transform: 'perspective(1000px) rotateX(5deg) rotateY(5deg)' },
          '50%': { transform: 'perspective(1000px) rotateX(0deg) rotateY(10deg)' },
          '75%': { transform: 'perspective(1000px) rotateX(-5deg) rotateY(5deg)' },
        },
        glowPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.3), 0 0 40px rgba(212, 175, 55, 0.1)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(212, 175, 55, 0.5), 0 0 60px rgba(212, 175, 55, 0.2)',
            transform: 'scale(1.02)'
          },
        },
        fashionEntrance: {
          '0%': { 
            opacity: '0', 
            transform: 'perspective(1000px) rotateX(-20deg) translateY(50px) scale(0.8)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'perspective(1000px) rotateX(0deg) translateY(0px) scale(1)' 
          },
        },
        luxuryHover: {
          '0%': { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)' },
          '50%': { transform: 'perspective(1000px) rotateX(-5deg) rotateY(5deg) translateZ(20px)' },
          '100%': { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)' },
        },
        premiumSpin: {
          '0%': { transform: 'perspective(1000px) rotateY(0deg)' },
          '100%': { transform: 'perspective(1000px) rotateY(360deg)' },
        },
        diamondSparkle: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(0.8) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1.2) rotate(180deg)' },
        },
      },
      boxShadow: {
        'luxury': '0 25px 50px -12px rgba(212, 175, 55, 0.15), 0 0 0 1px rgba(212, 175, 55, 0.05)',
        'gold': '0 10px 25px -5px rgba(212, 175, 55, 0.3)',
        'premium': '0 32px 64px -12px rgba(0, 0, 0, 0.15)',
        'glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'inner-gold': 'inset 0 2px 4px 0 rgba(212, 175, 55, 0.1)',
        'fashion-3d': '0 20px 40px rgba(212, 175, 55, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        'velvet': '0 15px 35px rgba(114, 47, 55, 0.3), 0 5px 15px rgba(114, 47, 55, 0.2)',
        'silk': '0 8px 25px rgba(245, 243, 240, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        'diamond': '0 0 50px rgba(185, 242, 255, 0.5), 0 0 100px rgba(185, 242, 255, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'fashion': ['Playfair Display', 'Georgia', 'serif'],
        'luxury': ['Montserrat', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
      },
      perspective: {
        '1000': '1000px',
        '1500': '1500px',
        '2000': '2000px',
      }
    },
  },
  plugins: [],
} 