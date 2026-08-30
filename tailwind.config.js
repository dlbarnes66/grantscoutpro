/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/app/(marketing)/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",

    // Ensure Tailwind sees your CSS entrypoint
    "./src/app/globals.css",
  ],
  theme: {
    extend: {
      colors: {
        brandBlue: "#1E3A8A",
        brandGold: "#FBBF24",
        brandLight: "#EFF6FF",
      },
      borderRadius: {
        DEFAULT: "12px",
        lg: "14px",
        xl: "18px",
      },
      boxShadow: {
        soft: "0 2px 6px rgba(0,0,0,0.05)",
        medium: "0 4px 12px rgba(0,0,0,0.08)",
      },
      fontSize: {
        base: "16px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "30px",
      },
    },
  },
  plugins: [],
};
