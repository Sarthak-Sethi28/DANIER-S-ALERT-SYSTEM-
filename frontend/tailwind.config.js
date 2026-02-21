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
          primary:   '#c9a84c',
          secondary: '#e8c96a',
          accent:    '#c9a84c',
          surface:   '#0d0d1a',
          surfaceDark: '#07070e',
        },
        danier: {
          dark:    '#f0f0f8',
          gold:    '#c9a84c',
          gold2:   '#e8c96a',
          bg:      '#07070e',
          bg2:     '#0d0d1a',
          bg3:     '#131324',
          card:    '#13131f',
          card2:   '#1a1a2b',
          border:  'rgba(255,255,255,0.07)',
          crit:    '#ff3d3d',
          warn:    '#f59e0b',
          good:    '#10b981',
          order:   '#8b5cf6',
        },
      },
      backgroundImage: {
        'gradient-brand':      'linear-gradient(180deg, #050508 0%, #050508 100%)',
        'gradient-brand-dark': 'linear-gradient(180deg, #050508 0%, #050508 100%)',
        'gradient-gold':       'linear-gradient(135deg, #c9a84c 0%, #e8c96a 100%)',
        'gradient-gold-soft':  'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(232,201,106,0.08) 100%)',
      },
      boxShadow: {
        elegant:       '0 4px 20px rgba(0,0,0,0.4)',
        luxury:        '0 8px 30px rgba(201,168,76,0.18)',
        sophisticated: '0 2px 15px rgba(0,0,0,0.5)',
        gold:          '0 8px 24px rgba(201,168,76,0.28)',
        refined:       '0 1px 3px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in':       'fadeIn 0.6s ease-out',
        'slide-up':      'slideUp 0.5s ease-out',
        'scale-in':      'scaleIn 0.3s ease-out',
        'bounce-subtle': 'bounceSub 2s ease-in-out infinite',
        'float':         'float 3s ease-in-out infinite',
        'pulse-gold':    'pulseGold 2s ease-in-out infinite',
        'glow':          'glow 2s ease-in-out infinite',
        'slide-down':    'slideDown 0.4s ease-out',
      },
      keyframes: {
        fadeIn:     { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp:    { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:    { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        bounceSub:  { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        float:      { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        pulseGold:  { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        glow:       { '0%,100%': { boxShadow: '0 0 8px rgba(201,168,76,0.4)' }, '50%': { boxShadow: '0 0 24px rgba(201,168,76,0.8)' } },
        slideDown:  { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      fontFamily: {
        elegant: ['Space Grotesk', 'Georgia', 'serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
