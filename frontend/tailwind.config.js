/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: '#003135',
          sea: '#024950',
          rust: '#964734',
          accent: '#0FA4AF',
          mist: '#AFDDE5',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #AFDDE5 0%, #0FA4AF 60%, #024950 100%)',
        'gradient-brand-dark': 'linear-gradient(135deg, #003135 0%, #024950 100%)',
      },
      boxShadow: {
        elegant: '0 4px 20px rgba(0,0,0,0.08)',
        luxury: '0 8px 30px rgba(15,164,175,0.15)',
        sophisticated: '0 2px 15px rgba(0,0,0,0.06)',
        refined: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
      fontFamily: {
        elegant: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 