/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./features/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2D3561",
          50: "#EDEEF4",
          100: "#D5D8E5",
          200: "#A8AEC9",
          300: "#7B83AD",
          400: "#4E5991",
          500: "#2D3561",
          600: "#242A4E",
          700: "#1B203B",
          800: "#121528",
          900: "#090B14",
        },
        accent: {
          DEFAULT: "#E8913A",
          50: "#FDF4E8",
          100: "#FAE4C5",
          200: "#F5C98B",
          300: "#F0AE51",
          400: "#EC9F45",
          500: "#E8913A",
          600: "#D47A2B",
          700: "#A55E20",
          800: "#774316",
          900: "#49290C",
        },
        surface: "#F7F5F0",
        "surface-alt": "#EFECE5",
        ink: "#1A1A2E",
        muted: "#6B7280",
        "border-warm": "#E5E1D8",
      },
      fontFamily: {
        display: ['"DM Serif Display"', "Georgia", "serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      fontSize: {
        "display-xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        "display-md": ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
    },
  },
  plugins: [],
};
