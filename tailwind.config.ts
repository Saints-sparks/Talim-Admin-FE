import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          DEFAULT: "#003366",
          hover:   "#002244",
          light:   "#EAF2FB",
          border:  "#D7E6F6",
          "50":    "#EAF2FB",
          "100":   "#D7E6F6",
          "700":   "#003366",
          "800":   "#002244",
        },
        talim: {
          bg:      "#F8F8F8",
          sidebar: "#FBFBFB",
          divider: "#F1F1F1",
          text:    "#030E18",
          muted:   "#6F6F6F",
        },
      },
      fontFamily: {
        sans:    ['Manrope', 'Arial', 'Helvetica', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
