/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#12172B", light: "#1D2440", lighter: "#2A3255" },
        parchment: { DEFAULT: "#F6F1E7", dim: "#EDE6D6" },
        brass: { DEFAULT: "#C08A3E", light: "#D9A85C", dark: "#8F6529" },
        rust: "#B5502F",
        sage: "#5C7A63",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Source Sans 3'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
