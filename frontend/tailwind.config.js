/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1", // indigo (your portfolio color)
        accent: "#06b6d4", // cyan/teal (AI tech color)
        darkbg: "#020617", // near-black background
      },
    },
  },
  plugins: [],
};
