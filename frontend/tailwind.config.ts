import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // Active le dark mode avec la classe 'dark'
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f5f4',
          100: '#ccebe9',
          200: '#99d7d3',
          300: '#66c3bd',
          400: '#33afa7',
          500: '#006D65', // Couleur principale
          600: '#005a54',
          700: '#004d47',
          800: '#003d39',
          900: '#002e2b',
        },
        secondary: {
          50: '#fef8e7',
          100: '#fdf1cf',
          200: '#fbe39f',
          300: '#f9d56f',
          400: '#f7c73f',
          500: '#E6A930', // Couleur secondaire
          600: '#d49821',
          700: '#a67619',
          800: '#795411',
          900: '#4b3309',
        },
      },
    },
  },
  // Dans TailwindCSS v4, les couleurs sont définies dans le CSS avec @theme
}

export default config