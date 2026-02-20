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
          // Primary palette from user's image (monochromatic blues)
          primary: '#478AB8', // deep blue
          secondary: '#6CA2C6', // light blue
          // alias to preserve existing bg-brand-accent usages
          accent: '#478AB8',
          // Keep neutrals mapped for dark mode usage
          surface: '#FFFFFF',
          surfaceDark: '#0B1220',
        },
        // keep custom token used across components
        danier: {
          dark: '#111827', // near-black for readable headings on white base
        },
      },
      backgroundImage: {
        // Replace gold gradients with refined blue gradients
        'gradient-brand': 'linear-gradient(135deg, #FFFFFF 0%, #6CA2C6 40%, #478AB8 100%)',
        'gradient-brand-dark': 'linear-gradient(135deg, #0B1220 0%, #1E2A3A 50%, #2F4A68 100%)',
      },
      boxShadow: {
        elegant: '0 4px 20px rgba(0,0,0,0.08)',
        luxury: '0 8px 30px rgba(71,138,184,0.18)',
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