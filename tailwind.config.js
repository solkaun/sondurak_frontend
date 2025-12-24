/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-black': '#0a0a0a',
        'secondary-black': '#1a1a1a',
        'primary-red': '#dc2626',
        'primary-red-hover': '#b91c1c',
        'primary-white': '#ffffff',
        'secondary-white': '#f5f5f5',
        'border-color': '#333333',
        'text-gray': '#a3a3a3',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

