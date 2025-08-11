/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'danier-gold': '#d4af37',
        'danier-beige': '#f5f5dc',
        'danier-dark': '#2c2c2c',
      },
    },
  },
  plugins: [],
} 