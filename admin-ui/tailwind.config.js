/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pie: {
          crust: '#D4A574',
          'crust-dark': '#B8864C',
          filling: '#8B2500',
          cream: '#FFF8E7',
          cherry: '#DC143C',
          apple: '#4CAF50',
          blueberry: '#4169E1',
          warm: '#FDF2E9',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
