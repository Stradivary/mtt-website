/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: "#116d16",
        secondary: "#cb0303",
        tertiary1: "#F6A609",
        tertiary2: "#FCE5C0",
        tertiary3: "#8B5A2B"

      },
    },
  },
  plugins: [],
};
