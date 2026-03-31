/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Groupama green brand color scheme
        primary: {
          50: '#e6f7ee',
          100: '#ccf0dd',
          200: '#99e0bb',
          300: '#66d199',
          400: '#33c177',
          500: '#00a651',
          600: '#008c44',
          700: '#006838',
          800: '#004d2a',
          900: '#00331c',
        },
        accent: {
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          sky: '#0ea5e9',
          violet: '#8b5cf6',
          teal: '#14b8a6',
        },
      },
    },
  },
  plugins: [],
};
