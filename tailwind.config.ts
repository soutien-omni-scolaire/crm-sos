import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#EBF1FD",
          100: "#C8DAFB",
          200: "#93B4E8",
          300: "#5A8AD4",
          400: "#3468B8",
          500: "#2656A0",
          600: "#1E3F7A",
          700: "#1B3568",
          800: "#152952",
          900: "#0F1E3D",
        },
        gold: {
          50: "#FDFAF0",
          100: "#F7F0DD",
          200: "#EDE0BA",
          300: "#E0CA8D",
          400: "#D4B86A",
          500: "#C9A84C",
          600: "#B8942F",
          700: "#9A7B2C",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
