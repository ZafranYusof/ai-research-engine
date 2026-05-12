/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        ivory: '#faf7f2',
        navy: {
          DEFAULT: '#0b1626',
          800: '#11202f',
          700: '#1c2f42',
        },
        amber: {
          scholar: '#c89b3c',
          scholarDeep: '#a37c2a',
        },
        teal: {
          citation: '#4a7c7e',
        },
      },
    },
  },
  plugins: [],
}
