const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust based on your folder structure
  ],
  darkMode: "class", // Enables dark mode
  theme: {
    extend: {
      colors: {
        neutral: {
          900: "#121212", // Dark background color
          100: "#f3f4f6", // Light background color
          600: "#4b5563", // Neutral color for elements
        },
        primary: "#3b82f6", // Primary blue
        secondary: "#2EB9DF", // Secondary color
        slate: {
          950: "#0f172a",
          300: "#cbd5e1",
          500: "#64748b",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
        ...colors, // Extend default colors
      },
      spacing: {
        36: "9rem",
        44: "11rem",
        56: "14rem",
        60: "15rem",
        64: "16rem",
      },
      blur: {
        sm: "4px",
        md: "12px",
        xl: "20px",
        "2xl": "40px",
        "3xl": "60px",
      },
      transitionProperty: {
        width: "width",
        opacity: "opacity",
      },
      backgroundImage: {
        "gradient-conic": "conic-gradient(var(--conic-position), var(--tw-gradient-stops))",
      },
      animation: {
        pulse: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        translateX: "translateX 10s linear infinite",
      },
      keyframes: {
        translateX: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        pulse: {
          "0%, 100%": { opacity: 0.2 },
          "50%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      const newUtilities = {
        ".transition-opacity": {
          transitionProperty: theme("transitionProperty.opacity"),
        },
        ".transition-width": {
          transitionProperty: theme("transitionProperty.width"),
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
