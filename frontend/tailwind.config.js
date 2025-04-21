/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode using the 'dark' class
  theme: {
    extend: {
      // Optional: Define dark mode colors if needed, otherwise Tailwind defaults work well
      // colors: {
      //   dark: {
      //     background: '#1a202c', // Example dark background
      //     text: '#e2e8f0',       // Example dark text
      //     card: '#2d3748',       // Example dark card background
      //   }
      // }
    },
  },
  plugins: [],
}
