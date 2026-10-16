/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#08131d",
          850: "#0b1b2a",
          800: "#0f273d",
          700: "#163854",
          600: "#1e4d73",
          100: "#e7eff6",
          50: "#f3f7fa",
        },
        sage: {
          900: "#0f3a2c",
          800: "#144e3b",
          700: "#1a634b",
          600: "#227d60",
          500: "#2d9d79",
          400: "#44b993",
          100: "#dcf4eb",
          50: "#effaf5",
        },
        bronze: {
          700: "#8c5b1b",
          600: "#b47524",
          500: "#d18b2c",
          400: "#e5a751",
          100: "#fdf2e2",
          50: "#fef8f0",
        },
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
