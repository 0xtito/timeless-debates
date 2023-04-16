/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        "glowing-border": {
          "0%": {
            "box-shadow":
              "0 0 2px #fef3c7, 0 0 4px #fef3c7, 0 0 6px #fef3c7, 0 0 8px #fef3c7",
          },
          "50%": {
            "box-shadow":
              "0 0 4px #fef3c7, 0 0 8px #fef3c7, 0 0 12px #fef3c7, 0 0 16px #fef3c7",
          },
          "100%": {
            "box-shadow":
              "0 0 2px #fef3c7, 0 0 4px #fef3c7, 0 0 6px #fef3c7, 0 0 8px #fef3c7",
          },
        },
      },
      animation: {
        "glowing-border": "glowing-border 2000ms infinite",
      },
    },
  },
  plugins: [],
};
