/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sophisticated Danier Brand Colors
        'danier': {
          gold: '#D4AF37',
          'gold-light': '#E8C547',
          'gold-dark': '#B8941F',
          beige: '#F5F5DC',
          'beige-light': '#FAFAF7',
          dark: '#2C2C2C',
          'dark-light': '#3D3D3D',
          black: '#1A1A1A',
        },
        // Elegant Luxury Palette
        'luxury': {
          cream: '#FDF8F0',
          champagne: '#F7E7CE',
          pearl: '#F8F6F0',
          marble: '#F9F9F9',
          charcoal: '#36454F',
          slate: '#708090',
          platinum: '#E5E4E2',
          ivory: '#FFFFF0',
        },
        // Refined Neutral Grays
        'neutral': {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
      },
      backgroundImage: {
        'gradient-elegant': 'linear-gradient(135deg, #FDF8F0 0%, #F7E7CE 100%)',
        'gradient-sophisticated': 'linear-gradient(135deg, #F9F9F9 0%, #F5F5F5 100%)',
        'gradient-luxury': 'linear-gradient(135deg, #D4AF37 0%, #E8C547 100%)',
        'gradient-dark-elegant': 'linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%)',
        'gradient-subtle': 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'subtle-bounce': 'subtleBounce 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        subtleBounce: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-2px)' },
        },
      },
      boxShadow: {
        'elegant': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'luxury': '0 8px 30px rgba(212, 175, 55, 0.12)',
        'sophisticated': '0 2px 15px rgba(0, 0, 0, 0.06)',
        'refined': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'elegant': ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
} 