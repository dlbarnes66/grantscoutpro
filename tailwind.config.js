/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2563eb",
          purple: "#7c3aed",
          green: "#16a34a",
          yellow: "#eab308",
          red: "#dc2626",
        },
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
