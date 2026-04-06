/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#5eead4', 
          DEFAULT: '#14b8a6',
          dark: '#0f766e',
        }
      }
    },
  },
  plugins: [],
}